import { readdir } from "fs/promises";
import { basename, join } from "path";
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
import { listStoredContentPaths } from "#app/utils/content-store.server.ts";
import { getFlashcardImagesDir } from "#app/utils/content-paths.server.ts";
import { prisma } from "#app/utils/db.server.ts";

type FlashcardItem = {
  topic: string;
  item: string;
  imagePath: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const topicParam = url.searchParams.get("topic") || "all";

  const flashcards: FlashcardItem[] = [];
  const imagesDir = getFlashcardImagesDir();

  try {
    // Query topics from DB
    const topics = await prisma.flashcardTopic.findMany({
      include: { items: true },
      where: topicParam !== "all" ? { slug: topicParam } : undefined,
    });

    for (const topic of topics) {
      const topicPath = join(imagesDir, topic.slug);

      for (const item of topic.items) {
        const seenImages = new Set<string>();
        const storedPaths = (
          await listStoredContentPaths(`images/${topic.slug}/${item.slug}/`)
        ).filter((imagePath) => /\.(jpg|jpeg|png|gif|webp)$/i.test(imagePath));

        for (const imagePath of storedPaths) {
          seenImages.add(basename(imagePath));
          flashcards.push({
            topic: topic.name,
            item: item.name,
            imagePath: `/${imagePath}`,
          });
        }

        const itemPath = join(topicPath, item.slug);
        try {
          const images = await readdir(itemPath);
          const imageFiles = images.filter((img) =>
            /\.(jpg|jpeg|png|gif|webp)$/i.test(img),
          );

          if (imageFiles.length > 0) {
            imageFiles.forEach((imageFile) => {
              if (seenImages.has(imageFile)) return;
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
  const [historyPosition, setHistoryPosition] = useState(0);
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
  const speechInputSeqRef = useRef(0);
  const activeBrowserListeningSeqRef = useRef<number | null>(null);
  const pendingSttSeqRef = useRef<number | null>(null);

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

  const stopNameAudio = useCallback(() => {
    ttsPlaySeqRef.current += 1;
    const audio = ttsAudioRef.current;
    if (!audio) return;

    try {
      audio.pause();
    } catch {}
    try {
      audio.currentTime = 0;
    } catch {}
    audio.removeAttribute("src");
  }, []);

  const cancelSpeechInput = useCallback(() => {
    speechInputSeqRef.current += 1;
    activeBrowserListeningSeqRef.current = null;
    pendingSttSeqRef.current = null;
    setListening(false);
    setIsProcessing(false);

    try {
      recognitionRef.current?.stop();
    } catch {}

    const recorder = mediaRecorderRef.current;
    if (recorder?.state === "recording") {
      try {
        recorder.stop();
      } catch {}
    }
  }, []);

  const resetCardInteraction = useCallback(() => {
    stopNameAudio();
    cancelSpeechInput();
    setImageError(false);
    setRecognizedText("");
  }, [cancelSpeechInput, stopNameAudio]);

  const playNameAudio = useCallback(async (name: string) => {
    const audio = ttsAudioRef.current;
    if (!audio) return;

    const seq = ++ttsPlaySeqRef.current;
    const url = `/resources/tts?text=${encodeURIComponent(name)}`;

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

  const getRandomUnusedIndex = useCallback(
    (history: number[]): number => {
      const availableIndices = flashcards
        .map((_, index) => index)
        .filter((index) => !history.includes(index));

      if (availableIndices.length === 0) {
        return Math.floor(Math.random() * flashcards.length);
      }

      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      return availableIndices[randomIndex] ?? 0;
    },
    [flashcards],
  );

  const showCardAtIndex = useCallback(
    (newIndex: number) => {
      resetCardInteraction();
      setCurrentIndex(newIndex);
      setShowName(autoShowName);

      if (autoShowName && speakName) {
        const name = flashcards[newIndex]?.item;
        if (name) void playNameAudio(name);
      }
    },
    [autoShowName, flashcards, playNameAudio, resetCardInteraction, speakName],
  );

  const nextCard = useCallback(() => {
    const nextHistoryPosition = historyPosition + 1;

    if (nextHistoryPosition < usedIndices.length) {
      const historyIndex = usedIndices[nextHistoryPosition];
      if (historyIndex == null) return;
      setHistoryPosition(nextHistoryPosition);
      showCardAtIndex(historyIndex);
      return;
    }

    const newIndex = getRandomUnusedIndex(usedIndices);
    const shouldResetHistory = usedIndices.length >= flashcards.length;
    setUsedIndices((prev) =>
      shouldResetHistory ? [newIndex] : [...prev, newIndex],
    );
    setHistoryPosition(shouldResetHistory ? 0 : usedIndices.length);
    showCardAtIndex(newIndex);
  }, [
    flashcards.length,
    getRandomUnusedIndex,
    historyPosition,
    showCardAtIndex,
    usedIndices,
  ]);

  const previousCard = useCallback(() => {
    if (historyPosition <= 0) return;

    const previousHistoryPosition = historyPosition - 1;
    const previousIndex = usedIndices[previousHistoryPosition];
    if (previousIndex == null) return;

    setHistoryPosition(previousHistoryPosition);
    showCardAtIndex(previousIndex);
  }, [historyPosition, showCardAtIndex, usedIndices]);

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

  const checkMatch = useCallback(
    (transcript: string) => {
      const cleanTranscript = transcript
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .trim();
      const target = currentCard?.item.toLowerCase() || "";

      if (
        cleanTranscript === target ||
        (target.includes(cleanTranscript) && cleanTranscript.length > 3) ||
        cleanTranscript.includes(target)
      ) {
        setRecognizedText(cleanTranscript + " ✅");
        handleSpeechSuccess();
      } else {
        setRecognizedText(cleanTranscript + " ❌");
        const retrySeq = speechInputSeqRef.current;
        setTimeout(() => {
          if (
            retrySeq === speechInputSeqRef.current &&
            enableSpeech &&
            !showName
          ) {
            startListening();
          }
        }, 1500);
      }
    },
    [currentCard, handleSpeechSuccess, enableSpeech, showName],
  );

  // Handle OpenAI Response
  useEffect(() => {
    if (
      isProcessing &&
      pendingSttSeqRef.current !== speechInputSeqRef.current
    ) {
      setIsProcessing(false);
      return;
    }

    if (sttFetcher.data?.text && isProcessing) {
      setIsProcessing(false);
      pendingSttSeqRef.current = null;
      checkMatch(sttFetcher.data.text);
    } else if (sttFetcher.data?.error && isProcessing) {
      setIsProcessing(false);
      pendingSttSeqRef.current = null;
      console.warn("OpenAI API error, falling back to browser");
      startBrowserListening();
    }
  }, [sttFetcher.data, isProcessing, checkMatch]);

  const startBrowserListening = useCallback(() => {
    if (!recognitionRef.current) return;
    const seq = ++speechInputSeqRef.current;
    activeBrowserListeningSeqRef.current = seq;
    setListening(true);
    try {
      recognitionRef.current.start();
    } catch {}
  }, []);

  const stopOpenAIRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setListening(false);
      setIsProcessing(true);
    }
  }, []);

  const startOpenAIRecording = useCallback(async () => {
    const recordingSeq = ++speechInputSeqRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (recordingSeq !== speechInputSeqRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (recordingSeq !== speechInputSeqRef.current) return;

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        pendingSttSeqRef.current = recordingSeq;
        sttFetcher.submit(formData, {
          method: "POST",
          action: "/resources/speech-to-text",
          encType: "multipart/form-data",
        });
      };

      mediaRecorder.start();
      setListening(true);
      setRecognizedText("");

      setTimeout(() => {
        if (
          recordingSeq === speechInputSeqRef.current &&
          mediaRecorder.state === "recording"
        ) {
          stopOpenAIRecording();
        }
      }, 2500);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      if (recordingSeq === speechInputSeqRef.current) {
        startBrowserListening();
      }
    }
  }, [sttFetcher, stopOpenAIRecording, startBrowserListening]);

  const startListening = useCallback(() => {
    if (showName) return;
    setRecognizedText("");

    if (useOpenAI) {
      void startOpenAIRecording();
    } else {
      startBrowserListening();
    }
  }, [showName, useOpenAI, startOpenAIRecording, startBrowserListening]);

  // Browser Recognition Events
  useEffect(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const resultSeq = activeBrowserListeningSeqRef.current;
      activeBrowserListeningSeqRef.current = null;
      setListening(false);
      if (resultSeq !== speechInputSeqRef.current) return;

      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) checkMatch(transcript);
    };

    recognitionRef.current.onerror = () => {
      activeBrowserListeningSeqRef.current = null;
      setListening(false);
    };
  }, [checkMatch]);

  // Auto-start listening when card changes
  useEffect(() => {
    if (
      enableSpeech &&
      !showName &&
      !autoShowName &&
      !isProcessing &&
      !listening
    ) {
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
          navigate("/flashcards");
        }
        return;
      }
      if (isModalOpen) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        previousCard();
        return;
      }

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
      previousCard,
      isModalOpen,
      isSpacePressed,
      navigate,
      playNameAudio,
    ],
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space") {
      e.preventDefault();
      setIsSpacePressed(false);
    }
  }, []);

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
      setHistoryPosition(0);
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
            {topicParam !== "all"
              ? `No images found for topic "${topicParam}".`
              : "No flashcards available."}
          </p>
          <Button onClick={() => navigate("/flashcards")}>
            Back to Topics
          </Button>
        </Card>
      </div>
    );
  }

  const toggleModal = () => setIsModalOpen((prev) => !prev);
  const canGoPrevious = historyPosition > 0;

  return (
    <div className="relative h-full touch-manipulation select-none bg-stone-950 text-white">
      <div className="absolute top-5 left-5 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/flashcards")}
          className="gap-2 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", color: "white" }}
        >
          <Icon name="arrow-left" className="w-4 h-4" />
          Topics
        </Button>
      </div>

      <Button
        variant="ghost"
        onClick={toggleModal}
        className="absolute bottom-5 right-5 z-10 px-4 py-2 text-lg backdrop-blur-sm"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", color: "white" }}
      >
        Options
      </Button>

      <Button
        variant="ghost"
        onClick={previousCard}
        disabled={!canGoPrevious}
        className="absolute bottom-5 left-5 z-10 gap-2 px-4 py-2 text-lg backdrop-blur-sm disabled:opacity-30"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", color: "white" }}
      >
        <Icon name="arrow-left" className="w-4 h-4" />
        Previous
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
                      <label htmlFor="enable-speech">
                        Enable Speech Recognition
                      </label>
                    </div>
                    {enableSpeech && (
                      <div className="flex items-center gap-2 ml-6">
                        <span className="text-sm">Engine:</span>
                        <button
                          onClick={() => setUseOpenAI(!useOpenAI)}
                          className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                            useOpenAI
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {useOpenAI ? "OpenAI" : "Browser"}
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
                  Cards shown: {usedIndices.length} of {flashcards.length}
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
              <p
                className="text-2xl mb-2"
                style={{ color: "rgba(255, 255, 255, 0.75)" }}
              >
                Image not found
              </p>
              <p
                className="text-sm"
                style={{ color: "rgba(255, 255, 255, 0.65)" }}
              >
                Press space to continue
              </p>
            </div>
          ) : (
            <img
              src={currentCard?.imagePath || ""}
              alt={formattedName}
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
              style={{ maxHeight: "calc(100vh - 12rem)" }}
              onError={() => {
                console.error(
                  `Failed to load image: ${currentCard?.imagePath}`,
                );
                setImageError(true);
              }}
            />
          )}

          {/* Status Overlay */}
          {(listening || isProcessing) && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-6 py-2 rounded-full font-bold flex items-center gap-2">
              {listening ? (
                <>
                  <span className="animate-pulse text-red-500">●</span>{" "}
                  Listening...
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
              <p
                className="text-xl"
                style={{ color: "rgba(255, 255, 255, 0.75)" }}
              >
                {enableSpeech
                  ? listening
                    ? "Say the name..."
                    : "Say it!"
                  : "Press space or click to reveal"}
              </p>
              {recognizedText && (
                <p className="text-2xl font-bold text-white bg-black/20 px-4 py-1 rounded-full">
                  {recognizedText}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
