import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState, useCallback } from "react";

type Difficulty = "easy" | "medium" | "hard";
type Category =
  | "animals"
  | "dinosaurs"
  | "shapes"
  | "fruits"
  | "vehicles"
  | "household"
  | "colors";

type WordItem = {
  word: string;
  categories: Category[];
  difficulty: Difficulty;
  sound?: string; // optional custom sound path
};

const wordList: WordItem[] = [
  // Easy Animals
  {
    word: "cat",
    categories: ["animals"],
    difficulty: "easy",
    sound: "/sounds/cat.wav",
  },
  {
    word: "dog",
    categories: ["animals"],
    difficulty: "easy",
    sound: "/sounds/dog.wav",
  },
  { word: "cow", categories: ["animals"], difficulty: "easy" },
  { word: "pig", categories: ["animals"], difficulty: "easy" },
  { word: "ant", categories: ["animals"], difficulty: "easy" },
  // Medium Animals
  { word: "tiger", categories: ["animals"], difficulty: "medium" },
  { word: "giraffe", categories: ["animals"], difficulty: "medium" },
  { word: "elephant", categories: ["animals"], difficulty: "medium" },
  { word: "kangaroo", categories: ["animals"], difficulty: "medium" },
  // Hard Animals
  { word: "hippopotamus", categories: ["animals"], difficulty: "hard" },
  { word: "chimpanzee", categories: ["animals"], difficulty: "hard" },
  { word: "rhinoceros", categories: ["animals"], difficulty: "hard" },

  // Dinosaurs
  { word: "rex", categories: ["dinosaurs"], difficulty: "easy" },
  { word: "trike", categories: ["dinosaurs"], difficulty: "easy" },
  { word: "saurus", categories: ["dinosaurs"], difficulty: "medium" },
  { word: "velociraptor", categories: ["dinosaurs"], difficulty: "hard" },
  { word: "brachiosaurus", categories: ["dinosaurs"], difficulty: "hard" },
  { word: "stegosaurus", categories: ["dinosaurs"], difficulty: "medium" },

  // Shapes (mostly easy or medium)
  { word: "circle", categories: ["shapes"], difficulty: "easy" },
  { word: "square", categories: ["shapes"], difficulty: "easy" },
  { word: "triangle", categories: ["shapes"], difficulty: "easy" },
  { word: "hexagon", categories: ["shapes"], difficulty: "medium" },
  { word: "octagon", categories: ["shapes"], difficulty: "medium" },

  // Fruits
  { word: "apple", categories: ["fruits"], difficulty: "easy" },
  { word: "pear", categories: ["fruits"], difficulty: "easy" },
  { word: "orange", categories: ["fruits"], difficulty: "medium" },
  { word: "banana", categories: ["fruits"], difficulty: "medium" },
  { word: "watermelon", categories: ["fruits"], difficulty: "hard" },
  { word: "pomegranate", categories: ["fruits"], difficulty: "hard" },

  // Vehicles
  { word: "car", categories: ["vehicles"], difficulty: "easy" },
  { word: "bus", categories: ["vehicles"], difficulty: "easy" },
  { word: "train", categories: ["vehicles"], difficulty: "medium" },
  { word: "airplane", categories: ["vehicles"], difficulty: "medium" },
  { word: "motorcycle", categories: ["vehicles"], difficulty: "hard" },
  { word: "helicopter", categories: ["vehicles"], difficulty: "hard" },

  // Household
  { word: "bed", categories: ["household"], difficulty: "easy" },
  { word: "chair", categories: ["household"], difficulty: "easy" },
  { word: "window", categories: ["household"], difficulty: "medium" },
  { word: "refrigerator", categories: ["household"], difficulty: "hard" },
  { word: "television", categories: ["household"], difficulty: "medium" },

  // Colors
  { word: "red", categories: ["colors"], difficulty: "easy" },
  { word: "blue", categories: ["colors"], difficulty: "easy" },
  { word: "green", categories: ["colors"], difficulty: "easy" },
  { word: "purple", categories: ["colors"], difficulty: "medium" },
  { word: "turquoise", categories: ["colors"], difficulty: "hard" },
  { word: "magenta", categories: ["colors"], difficulty: "hard" },
];

export default function ReadingGame() {
  const fetcher = useFetcher<{ text?: string; error?: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [useOpenAI, setUseOpenAI] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | "all"
  >("all");

  // Filter words based on user’s selection
  const filteredWords = wordList.filter((w) => {
    const difficultyMatch =
      selectedDifficulty === "all" || w.difficulty === selectedDifficulty;
    const categoryMatch =
      selectedCategories.length === 0 ||
      w.categories.some((c) => selectedCategories.includes(c));
    return difficultyMatch && categoryMatch;
  });

  const currentWord =
    filteredWords.length > 0
      ? filteredWords[currentIndex % filteredWords.length]
      : null;

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
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
    }
  }, [initSpeechRecognition]);


  const playWordAudio = useCallback(async () => {
    if (!currentWord) return;
    if (audioRef.current && currentWord.sound) {
      audioRef.current.src = currentWord.sound;
      await audioRef.current.play().catch(() => {});
    } else {
      const utter = new SpeechSynthesisUtterance(currentWord.word);
      speechSynthesis.speak(utter);
    }
  }, [currentWord]);

  const handleSuccess = useCallback(() => {
    setIsCorrect(true);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setRecognizedText("");
      setIsCorrect(false);
      void playWordAudio();
    }, 1500);
  }, [playWordAudio]);

  const startBrowserListening = useCallback(() => {
    if (!recognitionRef.current) {
        console.warn("Browser speech recognition not supported");
        return;
    }
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
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // OpenAI supports webm
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.webm");
            fetcher.submit(formData, { method: "POST", action: "/resources/speech-to-text", encType: "multipart/form-data" });

            // Stop tracks
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setListening(true);
        setRecognizedText("");
        setIsCorrect(false);

        // Auto-stop after 2.5 seconds
        setTimeout(() => {
            if (mediaRecorder.state === "recording") {
                stopOpenAIRecording();
            }
        }, 2500);

    } catch (err) {
        console.error("Error accessing microphone:", err);
        // Fallback
        startBrowserListening();
    }
  }, [fetcher, stopOpenAIRecording, startBrowserListening]);
  const startListening = useCallback(() => {
    if (!currentWord) return;
    setRecognizedText("");
    setIsCorrect(false);

    if (useOpenAI) {
        void startOpenAIRecording();
    } else {
        startBrowserListening();
    }
  }, [currentWord, useOpenAI, startOpenAIRecording, startBrowserListening]);



  // Handle OpenAI transcription response
  useEffect(() => {
    if (fetcher.data?.text && isProcessing) {
      setIsProcessing(false);
      const transcript = fetcher.data.text.trim().toLowerCase();
      // Remove punctuation
      const cleanTranscript = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      setRecognizedText(cleanTranscript);

      if (currentWord && cleanTranscript.includes(currentWord.word.toLowerCase())) {
        handleSuccess();
      } else {
        // Fallback to browser recognition if OpenAI failed or didn't match (optional, but requested as fallback)
        // Actually, fallback usually means "if OpenAI API fails", not "if recognition is wrong".
        // If the user said the wrong word, it's just wrong.
        // But if the transcription was empty or error, we might try browser.
        if (fetcher.data.error) {
           console.warn("OpenAI error, falling back to browser:", fetcher.data.error);
           startBrowserListening();
        } else {
           // Incorrect word
           setTimeout(() => startListening(), 1500);
        }
      }
    } else if (fetcher.data?.error && isProcessing) {
        setIsProcessing(false);
        console.warn("OpenAI API error, using fallback");
        startBrowserListening();
    }
  }, [fetcher.data, isProcessing, currentWord, handleSuccess, startBrowserListening, startListening]);

  useEffect(() => {
    void playWordAudio();
  }, [currentIndex, playWordAudio]);

  // Browser Recognition Events
  useEffect(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      setListening(false);
      const transcript = event.results[0]?.[0]?.transcript
        ?.trim()
        ?.toLowerCase();
      setRecognizedText(transcript!);

      if (currentWord && transcript === currentWord.word.toLowerCase()) {
        handleSuccess();
      } else {
        setTimeout(() => startListening(), 1000);
      }
    };

    recognitionRef.current.onerror = (e) => {
      console.warn("Browser recognition error:", e);
      setListening(false);
    };
  }, [currentWord, startListening, handleSuccess]);

  // Auto-start listening when word changes
  useEffect(() => {
    if (currentWord) {
      // Small delay to allow audio to play first
      const timer = setTimeout(() => {
          startListening();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentWord, startListening]);

  const allCategories: Category[] = [
    "animals",
    "dinosaurs",
    "shapes",
    "fruits",
    "vehicles",
    "household",
    "colors",
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-8 p-4">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-2xl font-bold">Reading Game</h1>

        <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium">Engine:</span>
            <button
                onClick={() => setUseOpenAI(!useOpenAI)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    useOpenAI ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}
            >
                {useOpenAI ? 'OpenAI Whisper' : 'Browser Native'}
            </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <label>
            Difficulty:
            <select
              className="ml-2 border p-1 rounded"
              value={selectedDifficulty}
              onChange={(e) =>
                setSelectedDifficulty(e.target.value as Difficulty | "all")
              }
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {allCategories.map((cat) => (
              <label key={cat} className="flex items-center space-x-1 cursor-pointer select-none bg-gray-50 px-2 py-1 rounded hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => {
                    setSelectedCategories((prev) =>
                      prev.includes(cat)
                        ? prev.filter((c) => c !== cat)
                        : [...prev, cat],
                    );
                  }}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>
        {filteredWords.length === 0 && (
          <div className="text-red-500">
            No words match your filters. Please adjust categories/difficulty.
          </div>
        )}
      </div>
      {currentWord && (
        <div className="flex flex-col items-center">
          <h2 className="text-6xl font-black mb-8 tracking-tight">{currentWord.word}</h2>

          {isCorrect ? (
            <div className="mt-4 text-3xl font-bold text-green-600 animate-bounce">Correct! 🎉</div>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className={`text-xl ${listening ? 'text-red-500 font-bold animate-pulse' : 'text-gray-500'}`}>
                {listening ? "🎤 Listening..." : isProcessing ? "Thinking... 🧠" : "Click to listen again"}
              </div>

              {/* Visualizer bars placeholder */}
              {listening && (
                  <div className="flex gap-1 h-8 items-end">
                      {[1,2,3,4,5].map(i => (
                          <div key={i} className="w-2 bg-red-400 rounded-t animate-[bounce_1s_infinite]" style={{ animationDelay: `${i * 0.1}s`, height: '100%' }}></div>
                      ))}
                  </div>
              )}
            </div>
          )}

          {!listening && !isProcessing && !isCorrect && filteredWords.length > 0 && (
            <button
              onClick={startListening}
              className="mt-8 bg-blue-500 hover:bg-blue-600 transition-colors px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg active:transform active:scale-95"
            >
              🎤 Tap to Speak
            </button>
          )}

          {recognizedText && !isCorrect && !listening && !isProcessing && (
            <div className="mt-6 text-xl text-red-500 font-medium">You said: "{recognizedText}"</div>
          )}
        </div>
      )}
    </div>
  );
}
