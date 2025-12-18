import { readdir } from "fs/promises";
import { join } from "path";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "#app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#app/components/ui/card";
import { Checkbox } from "#app/components/ui/checkbox";
import { Icon } from "#app/components/ui/icon";
import { prisma } from "#app/utils/db.server.ts";

type FlashcardItem = {
  topic: string;
  item: string;
  imagePath: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const topicParam = url.searchParams.get('topic') || 'all';

  const flashcards: FlashcardItem[] = [];
  const imagesDir = process.env.IMAGES_DIR || (
    process.env.NODE_ENV === "production" ? "/data/images" : "./images"
  );

  try {
    // Query topics from DB
    const topics = await prisma.flashcardTopic.findMany({
        include: { items: true },
        where: topicParam !== 'all' ? { slug: topicParam } : undefined
    });

    for (const topic of topics) {
      const topicPath = join(imagesDir, topic.slug);

      for (const item of topic.items) {
        const itemPath = join(topicPath, item.slug);
        try {
          const images = await readdir(itemPath);
          const imageFiles = images.filter((img) =>
            /\.(jpg|jpeg|png|gif|webp)$/i.test(img),
          );

          if (imageFiles.length > 0) {
            imageFiles.forEach((imageFile) => {
              flashcards.push({
                topic: topic.name,
                item: item.name,
                imagePath: `/images/${topic.slug}/${item.slug}/${imageFile}`,
              });
            });
          }
        } catch {
          // Skip items with no images (or missing dir)
        }
      }
    }
  } catch (error) {
    console.error("Error loading flashcards:", error);
  }

  return json({ flashcards, topicParam });
}

export default function Flashcards() {
  const { flashcards, topicParam } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const sttFetcher = useFetcher<{ text?: string; error?: string }>();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showName, setShowName] = useState(false);
  const [autoShowName, setAutoShowName] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("flashcards-auto-show-name");
      return saved === "true";
    }
    return false;
  });
  const [speakName, setSpeakName] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("flashcards-speak-name");
      return saved === "true";
    }
    return false;
  });
  const [enableSpeech, setEnableSpeech] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("flashcards-enable-speech");
      return saved === "true";
    }
    return true;
  });
  const [useOpenAI, setUseOpenAI] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Speech State
  const [listening, setListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsPlaySeqRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    audio.preload = "auto";
    ttsAudioRef.current = audio;
    return () => {
      try {
        audio.pause();
      } catch {}
      ttsAudioRef.current = null;
    };
  }, []);

  const playNameAudio = useCallback(async (name: string) => {
    const audio = ttsAudioRef.current;
    if (!audio) return;

    const seq = ++ttsPlaySeqRef.current;
    const url = `/resources/tts?text=${encodeURIComponent(name)}`;

    audio.playsInline = true;

    try {
      audio.pause();
    } catch {}
    try {
      audio.currentTime = 0;
    } catch {}

    audio.src = url;
    audio.preload = "auto";
    audio.load();

    await new Promise<void>((resolve) => {
      if (audio.readyState >= 2) {
        resolve();
        return;
      }

      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        resolve();
      };
      const cleanup = () => {
        audio.removeEventListener("loadeddata", onReady);
        audio.removeEventListener("canplaythrough", onReady);
        audio.removeEventListener("error", onError);
      };

      audio.addEventListener("loadeddata", onReady);
      audio.addEventListener("canplaythrough", onReady);
      audio.addEventListener("error", onError);
    });

    if (seq !== ttsPlaySeqRef.current) return;

    try {
      audio.currentTime = 0;
    } catch {}

    await audio.play().catch((e) => console.error("Audio play error:", e));
  }, []);

  const getNextIndex = useCallback((): number => {
    const availableIndices = flashcards
      .map((_, index) => index)
      .filter((index) => !usedIndices.includes(index));

    if (availableIndices.length === 0) {
      setUsedIndices([]);
      return Math.floor(Math.random() * flashcards.length);
    }

    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    return availableIndices[randomIndex] ?? 0;
  }, [flashcards, usedIndices]);

  const nextCard = useCallback(() => {
    const newIndex = getNextIndex();
    setCurrentIndex(newIndex);
    setUsedIndices((prev) => [...prev, newIndex]);
    setShowName(autoShowName);
    setImageError(false);
    setRecognizedText("");
    if (autoShowName && speakName) {
      const name = flashcards[newIndex]?.item;
      if (name) void playNameAudio(name);
    }
  }, [getNextIndex, autoShowName, speakName, flashcards, playNameAudio]);

  const currentCard = flashcards[currentIndex];
  // Item name from DB is clean (e.g. "Blue Jay"), no need to split/capitalize unless slug was passed
  const formattedName = currentCard ? currentCard.item : "";

  // Speech Recognition Logic
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    return recognition;
  }, []);

  useEffect(() => {
    recognitionRef.current = initSpeechRecognition();
  }, [initSpeechRecognition]);

  const handleSpeechSuccess = useCallback(() => {
    setShowName(true);
    if (speakName && currentCard) {
      void playNameAudio(currentCard.item);
    }
  }, [currentCard, speakName, playNameAudio]);

  const checkMatch = useCallback((transcript: string) => {
      const cleanTranscript = transcript.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
      const target = currentCard?.item.toLowerCase() || "";

      if (cleanTranscript === target || (target.includes(cleanTranscript) && cleanTranscript.length > 3) || cleanTranscript.includes(target)) {
          setRecognizedText(cleanTranscript + " ✅");
          handleSpeechSuccess();
      } else {
          setRecognizedText(cleanTranscript + " ❌");
          setTimeout(() => {
              if (enableSpeech && !showName) startListening();
          }, 1500);
      }
  }, [currentCard, handleSpeechSuccess, enableSpeech, showName]);

  // Handle OpenAI Response
  useEffect(() => {
      if (sttFetcher.data?.text && isProcessing) {
          setIsProcessing(false);
          checkMatch(sttFetcher.data.text);
      } else if (sttFetcher.data?.error && isProcessing) {
          setIsProcessing(false);
          console.warn("OpenAI API error, falling back to browser");
          startBrowserListening();
      }
  }, [sttFetcher.data, isProcessing, checkMatch]);

  const startBrowserListening = useCallback(() => {
      if (!recognitionRef.current) return;
      setListening(true);
      recognitionRef.current.start();
  }, []);

  const stopOpenAIRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        setListening(false);
        setIsProcessing(true);
    }
  }, []);

  const startOpenAIRecording = useCallback(async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.webm");
            sttFetcher.submit(formData, { method: "POST", action: "/resources/speech-to-text", encType: "multipart/form-data" });
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setListening(true);
        setRecognizedText("");

        setTimeout(() => {
            if (mediaRecorder.state === "recording") {
                stopOpenAIRecording();
            }
        }, 2500);

    } catch (err) {
        console.error("Error accessing microphone:", err);
        startBrowserListening();
    }
  }, [sttFetcher, stopOpenAIRecording, startBrowserListening]);

  const startListening = useCallback(() => {
      if (showName) return;
      setRecognizedText("");

      if (useOpenAI) {
          startOpenAIRecording();
      } else {
          startBrowserListening();
      }
  }, [showName, useOpenAI, startOpenAIRecording, startBrowserListening]);

  // Browser Recognition Events
  useEffect(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      setListening(false);
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) checkMatch(transcript);
    };

    recognitionRef.current.onerror = (e) => {
      setListening(false);
    };
  }, [checkMatch]);

  // Auto-start listening when card changes
  useEffect(() => {
    if (enableSpeech && !showName && !autoShowName && !isProcessing && !listening) {
        const timer = setTimeout(() => {
            startListening();
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [currentIndex, enableSpeech, showName, autoShowName, startListening]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen) {
          setIsModalOpen(false);
        } else {
          navigate('/flashcards');
        }
        return;
      }
      if (isModalOpen) return;

      if (e.code === "Space" && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
        if (!showName && !autoShowName) {
          setShowName(true);
          if (speakName && currentCard) {
            void playNameAudio(currentCard.item);
          }
        } else {
          nextCard();
        }
      }
    },
    [
      showName,
      autoShowName,
      speakName,
      currentCard,
      nextCard,
      isModalOpen,
      isSpacePressed,
      navigate,
      playNameAudio,
    ],
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsSpacePressed(false);
      }
    },
    [],
  );

  const handleClick = useCallback(() => {
    if (isModalOpen) return;
    if (!showName && !autoShowName) {
      setShowName(true);
      if (speakName && currentCard) {
        void playNameAudio(currentCard.item);
      }
    } else {
      nextCard();
    }
  }, [
    showName,
    autoShowName,
    speakName,
    currentCard,
    nextCard,
    isModalOpen,
    playNameAudio,
  ]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyPress, handleKeyUp]);

  // Persistence
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("flashcards-auto-show-name", String(autoShowName));
      localStorage.setItem("flashcards-speak-name", String(speakName));
      localStorage.setItem("flashcards-enable-speech", String(enableSpeech));
    }
  }, [autoShowName, speakName, enableSpeech]);

  // Initialize
  useEffect(() => {
    if (!isInitialized && flashcards.length > 0) {
      const randomIndex = Math.floor(Math.random() * flashcards.length);
      setCurrentIndex(randomIndex);
      setUsedIndices([randomIndex]);
      setShowName(autoShowName);
      if (autoShowName && speakName) {
        const name = flashcards[randomIndex]?.item;
        if (name) void playNameAudio(name);
      }
      setIsInitialized(true);
    }
  }, [isInitialized, flashcards, autoShowName, speakName, playNameAudio]);

  if (flashcards.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">No Images Found</h2>
          <p className="text-muted-foreground mb-6">
            {topicParam !== 'all'
              ? `No images found for topic "${topicParam}".`
              : "No flashcards available."}
          </p>
          <Button onClick={() => navigate('/flashcards')}>
            Back to Topics
          </Button>
        </Card>
      </div>
    );
  }

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  return (
    <div className="relative h-full touch-manipulation select-none">
      <div className="absolute top-5 left-5 z-10">
        <Button variant="ghost" onClick={() => navigate('/flashcards')} className="gap-2 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm">
          <Icon name="arrow-left" className="w-4 h-4" />
          Topics
        </Button>
      </div>

      <Button
        onClick={toggleModal}
        className="absolute bottom-5 right-5 z-10 px-4 py-2 text-lg bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
      >
        Options
      </Button>

      {isModalOpen && (
        <div
          onClick={toggleModal}
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-md w-full overflow-y-auto"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Options</CardTitle>
              <Button onClick={toggleModal} variant="ghost" size="sm">
                <Icon name="cross-1" className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Speech</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="enable-speech"
                            checked={enableSpeech}
                            onCheckedChange={(c) => setEnableSpeech(c as boolean)}
                        />
                        <label htmlFor="enable-speech">Enable Speech Recognition</label>
                    </div>
                    {enableSpeech && (
                        <div className="flex items-center gap-2 ml-6">
                            <span className="text-sm">Engine:</span>
                            <button
                                onClick={() => setUseOpenAI(!useOpenAI)}
                                className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                                    useOpenAI ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}
                            >
                                {useOpenAI ? 'OpenAI' : 'Browser'}
                            </button>
                        </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Display Options</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="auto-show"
                        checked={autoShowName}
                        onCheckedChange={(checked) =>
                          setAutoShowName(checked as boolean)
                        }
                      />
                      <label htmlFor="auto-show" className="cursor-pointer">
                        Always show name
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="speak-name"
                        checked={speakName}
                        onCheckedChange={(checked) =>
                          setSpeakName(checked as boolean)
                        }
                      />
                      <label htmlFor="speak-name" className="cursor-pointer">
                        Speak name when shown
                      </label>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Cards shown: {usedIndices.length} of{" "}
                  {flashcards.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div
        onClick={handleClick}
        className="h-full flex flex-col items-center justify-center p-4 overflow-hidden"
      >
        <div
          className="w-full flex-1 flex items-center justify-center overflow-hidden relative"
          style={{ maxHeight: "calc(100vh - 12rem)" }}
        >
          {imageError ? (
            <div className="text-center p-8">
              <p className="text-2xl text-muted-foreground mb-2">Image not found</p>
              <p className="text-sm text-muted-foreground">Press space to continue</p>
            </div>
          ) : (
            <img
              src={currentCard?.imagePath || ""}
              alt={formattedName}
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
              style={{ maxHeight: "calc(100vh - 12rem)" }}
              onError={() => {
                console.error(`Failed to load image: ${currentCard?.imagePath}`);
                setImageError(true);
              }}
            />
          )}

          {/* Status Overlay */}
          {(listening || isProcessing) && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-6 py-2 rounded-full font-bold flex items-center gap-2">
                  {listening ? (
                      <>
                        <span className="animate-pulse text-red-500">●</span> Listening...
                      </>
                  ) : (
                      <>Thinking...</>
                  )}
              </div>
          )}
        </div>

        <div className="h-32 flex flex-col items-center justify-center flex-shrink-0">
          {showName ? (
            <h2
              className="font-bold text-center px-4"
              style={{ fontSize: "min(10vh, 4rem)" }}
            >
              {formattedName}
            </h2>
          ) : (
            <div className="flex flex-col items-center gap-2">
                 <p className="text-muted-foreground text-xl">
                    {enableSpeech ? (listening ? "Say the name..." : "Say it!") : "Press space or click to reveal"}
                </p>
                {recognizedText && (
                    <p className="text-2xl font-bold text-white bg-black/20 px-4 py-1 rounded-full">{recognizedText}</p>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
