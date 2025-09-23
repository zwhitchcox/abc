import { existsSync } from "fs";
import { join } from "path";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Button } from "#app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#app/components/ui/card";
import { Checkbox } from "#app/components/ui/checkbox";

const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const allNumbers = "0123456789".split("");
const allCharacters = [...allLetters, ...allNumbers];
const vowels = ["A", "E", "I", "O", "U"];
const consonants = allLetters.filter((letter) => !vowels.includes(letter));
const wideCharacters = ["W", "M", "w", "m"];

// Simple short words for spelling practice (no digraphs - single letter sounds only)
const spellWords = [
  "cat",
  "dog",
  "sun",
  "run",
  "fun",
  "big",
  "red",
  "bad",
  "sad",
  "mad",
  "bat",
  "hat",
  "rat",
  "fat",
  "bed",
  "leg",
  "pet",
  "net",
  "wet",
  "get",
  "bit",
  "hit",
  "sit",
  "fit",
  "hot",
  "pot",
  "cot",
  "got",
  "but",
  "cut",
  "nut",
  "hut",
  "bug",
  "hug",
  "rug",
  "dug",
  "log",
  "fog",
  "hog",
  "jog",
];

export async function loader() {
  // Check which word audio files are available
  const availableWords: string[] = [];

  for (const word of spellWords) {
    const filePath = join(process.cwd(), "public", "words", `${word}.wav`);
    if (existsSync(filePath)) {
      availableWords.push(word);
    }
    console.log(filePath);
  }

  return json({ availableWords });
}

type Options = {
  isLettersEnabled: boolean;
  isNumbersEnabled: boolean;
  enabledCharacters: { [key: string]: boolean } | null;
  isUpperCase: boolean;
  isSoundEnabled: boolean;
  isAccumulateMode: boolean;
  pronounceOnAdvance: boolean;
  isSpellMode: boolean;
};

export default function Index() {
  const { availableWords } = useLoaderData<typeof loader>();
  console.log(availableWords);
  const [options, setOptions] = useState<Options>({
    isLettersEnabled: true,
    isNumbersEnabled: false,
    enabledCharacters: null,
    isUpperCase: false,
    isSoundEnabled: false,
    isAccumulateMode: false,
    pronounceOnAdvance: false,
    isSpellMode: false,
  });
  const [currentCharacter, setCurrentCharacter] = useState<string>("");
  const [accumulatedText, setAccumulatedText] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [hasPronouncedCurrent, setHasPronouncedCurrent] =
    useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [currentWord, setCurrentWord] = useState<string>("");
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [spellingPhase, setSpellingPhase] = useState<
    "show_word" | "spell_letters" | "pronounce_word"
  >("show_word");
  const [hasPronouncedWord, setHasPronouncedWord] = useState<boolean>(false);

  const playAudioForLetter = useCallback((letter: string) => {
    if (audioRef.current) {
      audioRef.current.src = `/letters/phonetic/${letter.toLowerCase()}.wav`;
      return audioRef.current.play();
    }
    return Promise.resolve();
  }, []);

  const speakWord = useCallback(
    (word: string) => {
      const wordLower = word.toLowerCase();

      // Try to use audio file first
      if (availableWords.includes(wordLower) && audioRef.current) {
        audioRef.current.src = `/letters/${wordLower}.wav`;
        void audioRef.current.play();
        return Promise.resolve();
      }

      // Fall back to speech synthesis
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(wordLower);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
      }

      return Promise.resolve();
    },
    [availableWords],
  );

  const isAudioPlaying = useCallback(() => {
    return audioRef.current && !audioRef.current.paused;
  }, []);

  const handleSpellMode = useCallback(() => {
    if (isModalOpen || isAudioPlaying()) return;

    if (spellingPhase === "show_word") {
      // Show the word first, then move to spelling phase
      setSpellingPhase("spell_letters");
      setCurrentWordIndex(0);
      setHasPronouncedCurrent(false);
      return;
    }

    if (spellingPhase === "spell_letters") {
      const word = currentWord;

      // If we haven't pronounced the current letter yet and pronounceOnAdvance is enabled
      if (
        options.pronounceOnAdvance &&
        options.isSoundEnabled &&
        currentWordIndex < word.length &&
        !hasPronouncedCurrent
      ) {
        const currentLetter = word[currentWordIndex];
        if (currentLetter) {
          void playAudioForLetter(currentLetter);
        }
        setHasPronouncedCurrent(true);
        return;
      }

      // Move to next letter
      const nextIndex = currentWordIndex + 1;
      if (nextIndex < word.length) {
        setCurrentWordIndex(nextIndex);
        setHasPronouncedCurrent(false);
        // If not using pronounceOnAdvance, play the letter immediately
        if (options.isSoundEnabled && !options.pronounceOnAdvance) {
          const nextLetter = word[nextIndex];
          if (nextLetter) {
            void playAudioForLetter(nextLetter);
          }
        }
      } else {
        // Finished spelling, move to pronounce word phase
        setSpellingPhase("pronounce_word");
        setHasPronouncedWord(false);
      }
      return;
    }

    if (spellingPhase === "pronounce_word") {
      if (!hasPronouncedWord) {
        // Pronounce the complete word
        if (options.isSoundEnabled) {
          void speakWord(currentWord);
        }
        setHasPronouncedWord(true);
        return;
      } else {
        // Move to next word
        const randomWord =
          spellWords[Math.floor(Math.random() * spellWords.length)];
        if (randomWord) {
          setCurrentWord(randomWord);
          setSpellingPhase("show_word");
          setCurrentWordIndex(0);
          setHasPronouncedWord(false);
          setHasPronouncedCurrent(false);
        }
      }
    }
  }, [
    isModalOpen,
    isAudioPlaying,
    spellingPhase,
    currentWord,
    currentWordIndex,
    hasPronouncedCurrent,
    hasPronouncedWord,
    options.pronounceOnAdvance,
    options.isSoundEnabled,
    playAudioForLetter,
    speakWord,
  ]);

  const showRandomCharacter = useCallback(() => {
    if (isModalOpen || isAudioPlaying()) return;

    // If pronounceOnAdvance is enabled and we have a current character that hasn't been pronounced yet
    if (
      options.pronounceOnAdvance &&
      options.isSoundEnabled &&
      currentCharacter &&
      /^[A-Za-z]$/.test(currentCharacter) &&
      !hasPronouncedCurrent
    ) {
      // Pronounce the current character and mark it as pronounced
      void playAudioForLetter(currentCharacter);
      setHasPronouncedCurrent(true);
      return; // Don't advance to next character yet
    }

    const availableChars: string[] = [];
    if (options.isLettersEnabled) {
      const enabledLetters = options.enabledCharacters
        ? allLetters.filter((char) => options.enabledCharacters![char])
        : allLetters;
      availableChars.push(...enabledLetters);
    }
    if (options.isNumbersEnabled) {
      const enabledNumbers = options.enabledCharacters
        ? allNumbers.filter((char) => options.enabledCharacters![char])
        : allNumbers;
      availableChars.push(...enabledNumbers);
    }

    if (availableChars.length === 0) {
      setCurrentCharacter("");
      return;
    }

    let randomChar;

    // If we have more than one available character, ensure we don't repeat the same one
    if (availableChars.length > 1 && currentCharacter) {
      const filteredChars = availableChars.filter((char) => {
        const compareChar = options.isUpperCase ? char : char.toLowerCase();
        return compareChar !== currentCharacter;
      });
      randomChar =
        filteredChars[Math.floor(Math.random() * filteredChars.length)] || "";
    } else {
      randomChar =
        availableChars[Math.floor(Math.random() * availableChars.length)] || "";
    }

    if (!options.isUpperCase) {
      randomChar = randomChar.toLowerCase();
    }
    setCurrentCharacter(randomChar);
    setHasPronouncedCurrent(false); // Reset pronunciation state for new character

    // Only play immediately if not using pronounceOnAdvance mode
    if (options.isSoundEnabled && !options.pronounceOnAdvance) {
      void playAudioForLetter(randomChar);
    }
  }, [
    options.isLettersEnabled,
    options.isNumbersEnabled,
    options.enabledCharacters,
    isModalOpen,
    options.isUpperCase,
    options.isSoundEnabled,
    options.pronounceOnAdvance,
    currentCharacter,
    hasPronouncedCurrent,
    playAudioForLetter,
    isAudioPlaying,
  ]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isModalOpen) return;
      const touch = e.touches[0];
      if (touch) {
        setTouchStart({ x: touch.clientX, y: touch.clientY });
      }
    },
    [isModalOpen],
  );

  const handleAdvance = useCallback(() => {
    if (options.isSpellMode) {
      handleSpellMode();
    } else {
      showRandomCharacter();
    }
  }, [options.isSpellMode, handleSpellMode, showRandomCharacter]);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (isModalOpen || !touchStart) return;

      const touch = e.changedTouches[0];
      if (touch) {
        const deltaX = touch.clientX - touchStart.x;
        const deltaY = touch.clientY - touchStart.y;

        // Minimum swipe distance (in pixels)
        const minSwipeDistance = 50;

        // Check for swipe up (negative Y direction) or swipe right (positive X direction)
        if (
          (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < -minSwipeDistance) ||
          (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > minSwipeDistance)
        ) {
          // Swipe up or swipe right detected - advance
          handleAdvance();
        }
      }

      setTouchStart(null);
    },
    [isModalOpen, touchStart, handleAdvance],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOptions = localStorage.getItem("options");
      if (savedOptions) {
        const parsed = JSON.parse(savedOptions) as any;
        // Handle migration from old format
        if ("enabledCharacters" in parsed) {
          // Migrate from old format
          const hasLetters = allLetters.some(
            (l) => parsed.enabledCharacters[l],
          );
          const hasNumbers = allNumbers.some(
            (n) => parsed.enabledCharacters[n],
          );
          setOptions({
            isLettersEnabled: hasLetters,
            isNumbersEnabled: hasNumbers,
            enabledCharacters: parsed.enabledCharacters as {
              [key: string]: boolean;
            },
            isUpperCase: parsed.isUpperCase || false,
            isSoundEnabled: parsed.isSoundEnabled || false,
            isAccumulateMode: parsed.isAccumulateMode || false,
            pronounceOnAdvance: parsed.pronounceOnAdvance || false,
            isSpellMode: parsed.isSpellMode || false,
          });
        } else {
          setOptions(parsed as Options);
        }
      } else {
        // Initialize with all letters enabled, no numbers
        const initialCharacters: { [key: string]: boolean } = {};
        allLetters.forEach((char) => {
          initialCharacters[char] = true;
        });
        allNumbers.forEach((char) => {
          initialCharacters[char] = false;
        });
        setOptions((prev) => ({
          ...prev,
          enabledCharacters: initialCharacters,
        }));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("options", JSON.stringify(options));
    }
  }, [options]);

  // Initialize spell mode with first word
  useEffect(() => {
    if (options.isSpellMode && !currentWord) {
      const randomWord =
        spellWords[Math.floor(Math.random() * spellWords.length)];
      if (randomWord) {
        setCurrentWord(randomWord);
        setSpellingPhase("show_word");
        setCurrentWordIndex(0);
        setHasPronouncedWord(false);
        setHasPronouncedCurrent(false);
      }
    }
  }, [options.isSpellMode, currentWord]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
        return;
      }
      if (isModalOpen || isAudioPlaying()) return;
      if (event.key === " ") {
        event.preventDefault();
        if (options.isAccumulateMode) {
          setAccumulatedText((prev) => prev + " ");
        } else {
          handleAdvance();
        }
      } else if (event.key === "Tab" && !event.shiftKey) {
        event.preventDefault();
        setOptions((prev) => ({
          ...prev,
          isAccumulateMode: !prev.isAccumulateMode,
        }));
      } else if (event.key === "Tab" && event.shiftKey) {
        event.preventDefault();
        // Clear current display when switching modes
        setCurrentCharacter("");
        setAccumulatedText("");
        // Toggle between letters and numbers
        setOptions((prev) => {
          if (prev.isLettersEnabled && !prev.isNumbersEnabled) {
            // Currently letters only, switch to numbers only
            return { ...prev, isLettersEnabled: false, isNumbersEnabled: true };
          } else if (!prev.isLettersEnabled && prev.isNumbersEnabled) {
            // Currently numbers only, switch to both
            return { ...prev, isLettersEnabled: true, isNumbersEnabled: true };
          } else if (prev.isLettersEnabled && prev.isNumbersEnabled) {
            // Currently both, switch to letters only
            return { ...prev, isLettersEnabled: true, isNumbersEnabled: false };
          } else {
            // Neither enabled, switch to letters
            return { ...prev, isLettersEnabled: true, isNumbersEnabled: false };
          }
        });
      } else if (event.key === "Backspace" && options.isAccumulateMode) {
        event.preventDefault();
        setAccumulatedText((prev) => prev.slice(0, -1));
      } else if (event.key === "Enter" && options.isAccumulateMode) {
        event.preventDefault();
        setAccumulatedText("");
      } else if (/^[a-zA-Z0-9]$/.test(event.key)) {
        let key = event.key.toUpperCase();
        const isLetter = /^[A-Z]$/.test(key);
        const isNumber = /^[0-9]$/.test(key);

        if (
          (isLetter && options.isLettersEnabled) ||
          (isNumber && options.isNumbersEnabled)
        ) {
          // Also check if this specific character is enabled
          if (options.enabledCharacters && !options.enabledCharacters[key]) {
            return;
          }

          // If pronounceOnAdvance is enabled and we have a current character that hasn't been pronounced yet
          if (
            options.pronounceOnAdvance &&
            options.isSoundEnabled &&
            currentCharacter &&
            /^[A-Za-z]$/.test(currentCharacter) &&
            !hasPronouncedCurrent &&
            !options.isAccumulateMode
          ) {
            void playAudioForLetter(currentCharacter);
            setHasPronouncedCurrent(true);
            return; // Don't advance to next character yet
          }

          if (!options.isUpperCase) {
            key = key.toLowerCase();
          }
          if (options.isAccumulateMode) {
            setAccumulatedText((prev) => prev + key);
          } else {
            setCurrentCharacter(key);
            setHasPronouncedCurrent(false); // Reset pronunciation state for new character
          }

          // Only play immediately if not using pronounceOnAdvance mode or if in accumulate mode
          if (
            options.isSoundEnabled &&
            (!options.pronounceOnAdvance || options.isAccumulateMode)
          ) {
            void playAudioForLetter(key);
          }
        }
      }
    },
    [
      handleAdvance,
      options.isLettersEnabled,
      options.isNumbersEnabled,
      options.enabledCharacters,
      isModalOpen,
      options.isUpperCase,
      options.isSoundEnabled,
      options.isAccumulateMode,
      options.pronounceOnAdvance,
      currentCharacter,
      hasPronouncedCurrent,
      playAudioForLetter,
      isAudioPlaying,
    ],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [handleKeyDown]);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  if (options.enabledCharacters === null) return null;

  return (
    <div className="relative box-border h-full touch-manipulation select-none">
      <Button
        onClick={toggleModal}
        className="absolute right-5 top-5 z-10 px-4 py-2 text-lg"
      >
        Options
      </Button>

      {isModalOpen && (
        <div
          onClick={toggleModal}
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/50"
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-3xl overflow-y-auto"
          >
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Options</CardTitle>
              <Button onClick={toggleModal} variant="ghost">
                Close
              </Button>
            </CardHeader>
            <CardContent>
              <OptionsComponent options={options} setOptions={setOptions} />
            </CardContent>
          </Card>
        </div>
      )}
      <div
        onClick={handleAdvance}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex h-full items-center justify-center"
      >
        {options.isSpellMode ? (
          <div className="text-center">
            {spellingPhase === "show_word" ||
            spellingPhase === "pronounce_word" ? (
              <span
                style={{
                  fontSize: "20vh",
                  lineHeight: "1",
                  letterSpacing: "0.1em",
                }}
              >
                {currentWord}
              </span>
            ) : (
              <div>
                <div
                  style={{
                    fontSize: "15vh",
                    lineHeight: "1",
                    letterSpacing: "0.1em",
                    opacity: 0.3,
                  }}
                >
                  {currentWord}
                </div>
                <div
                  style={{
                    fontSize: "30vh",
                    lineHeight: "1",
                    marginTop: "2vh",
                  }}
                >
                  {currentWord[currentWordIndex] || ""}
                </div>
              </div>
            )}
          </div>
        ) : options.isAccumulateMode ? (
          <span
            style={{
              fontSize: "20vh",
              lineHeight: "1",
              letterSpacing: "0.1em",
            }}
          >
            {accumulatedText}
          </span>
        ) : (
          <span
            style={{
              fontSize: wideCharacters.includes(currentCharacter)
                ? "60vh"
                : "80vh",
              lineHeight: "1",
            }}
          >
            {currentCharacter}
          </span>
        )}
      </div>
    </div>
  );
}

function OptionsComponent({
  options,
  setOptions,
}: {
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
}) {
  const selectAllLetters = useCallback(() => {
    setOptions((prev) => ({
      ...prev,
      enabledCharacters: {
        ...prev.enabledCharacters,
        ...Object.fromEntries(allLetters.map((char) => [char, true])),
        ...Object.fromEntries(allNumbers.map((char) => [char, false])),
      },
    }));
  }, [setOptions]);

  const selectVowels = useCallback(() => {
    setOptions((prev) => ({
      ...prev,
      enabledCharacters: {
        ...prev.enabledCharacters,
        ...Object.fromEntries(vowels.map((char) => [char, true])),
        ...Object.fromEntries(consonants.map((char) => [char, false])),
        ...Object.fromEntries(allNumbers.map((char) => [char, false])),
      },
    }));
  }, [setOptions]);

  const selectConsonants = useCallback(() => {
    setOptions((prev) => ({
      ...prev,
      enabledCharacters: {
        ...prev.enabledCharacters,
        ...Object.fromEntries(consonants.map((char) => [char, true])),
        ...Object.fromEntries(vowels.map((char) => [char, false])),
        ...Object.fromEntries(allNumbers.map((char) => [char, false])),
      },
    }));
  }, [setOptions]);

  const selectAllNumbers = useCallback(() => {
    setOptions((prev) => ({
      ...prev,
      enabledCharacters: {
        ...prev.enabledCharacters,
        ...Object.fromEntries(allLetters.map((char) => [char, false])),
        ...Object.fromEntries(allNumbers.map((char) => [char, true])),
      },
    }));
  }, [setOptions]);

  const selectAllCharacters = useCallback(() => {
    setOptions((prev) => ({
      ...prev,
      enabledCharacters: {
        ...prev.enabledCharacters,
        ...Object.fromEntries(allCharacters.map((char) => [char, true])),
      },
    }));
  }, [setOptions]);

  const deselectAllCharacters = useCallback(() => {
    setOptions((prev) => ({
      ...prev,
      enabledCharacters: {
        ...prev.enabledCharacters,
        ...Object.fromEntries(allCharacters.map((char) => [char, false])),
      },
    }));
  }, [setOptions]);

  const toggleCharacter = useCallback(
    (char: string) => {
      setOptions((prev) => {
        if (!prev.enabledCharacters) return prev;
        return {
          ...prev,
          enabledCharacters: {
            ...prev.enabledCharacters,
            [char]: !prev.enabledCharacters[char],
          },
        };
      });
    },
    [setOptions],
  );

  return (
    <div className="min-w-[300px]">
      <div className="mb-4 space-y-2">
        <h3 className="font-semibold mb-2">Character Types</h3>
        <label className="flex items-center space-x-2">
          <Checkbox
            checked={options.isLettersEnabled}
            onCheckedChange={() =>
              setOptions((prev) => ({
                ...prev,
                isLettersEnabled: !prev.isLettersEnabled,
              }))
            }
          />
          <span>Letters (A-Z)</span>
        </label>
        <label className="flex items-center space-x-2">
          <Checkbox
            checked={options.isNumbersEnabled}
            onCheckedChange={() =>
              setOptions((prev) => ({
                ...prev,
                isNumbersEnabled: !prev.isNumbersEnabled,
              }))
            }
          />
          <span>Numbers (0-9)</span>
        </label>

        <h3 className="font-semibold mb-2 mt-4">Display Options</h3>
        <label className="flex items-center space-x-2">
          <Checkbox
            checked={options.isUpperCase}
            onCheckedChange={() =>
              setOptions((prev) => ({
                ...prev,
                isUpperCase: !prev.isUpperCase,
              }))
            }
          />
          <span>Uppercase Output</span>
        </label>
        <label className="flex items-center space-x-2">
          <Checkbox
            checked={options.isSoundEnabled}
            onCheckedChange={() =>
              setOptions((prev) => ({
                ...prev,
                isSoundEnabled: !prev.isSoundEnabled,
              }))
            }
          />
          <span>Enable Sound</span>
        </label>
        <label className="flex items-center space-x-2">
          <Checkbox
            checked={options.pronounceOnAdvance}
            onCheckedChange={() =>
              setOptions((prev) => ({
                ...prev,
                pronounceOnAdvance: !prev.pronounceOnAdvance,
              }))
            }
            disabled={!options.isSoundEnabled}
          />
          <span>
            Pronounce on advance (show letter first, then pronounce when
            advancing)
          </span>
        </label>
        <label className="flex items-center space-x-2">
          <Checkbox
            checked={options.isAccumulateMode}
            onCheckedChange={() =>
              setOptions((prev) => ({
                ...prev,
                isAccumulateMode: !prev.isAccumulateMode,
              }))
            }
          />
          <span>Word Mode (Tab to toggle)</span>
        </label>
        <label className="flex items-center space-x-2">
          <Checkbox
            checked={options.isSpellMode}
            onCheckedChange={() =>
              setOptions((prev) => ({
                ...prev,
                isSpellMode: !prev.isSpellMode,
              }))
            }
          />
          <span>Spell Mode (spell out words letter by letter)</span>
        </label>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={selectAllLetters}>All Letters</Button>
        <Button onClick={selectVowels}>Vowels</Button>
        <Button onClick={selectConsonants}>Consonants</Button>
        <Button onClick={selectAllNumbers}>All Numbers</Button>
        <Button onClick={selectAllCharacters}>All</Button>
        <Button onClick={deselectAllCharacters}>None</Button>
      </div>

      <h3 className="font-semibold mb-2">Individual Characters</h3>
      <div className="flex flex-wrap gap-2">
        {allCharacters.map((char) => (
          <label key={char} className="flex items-center space-x-1">
            <Checkbox
              checked={options.enabledCharacters?.[char] || false}
              onCheckedChange={() => toggleCharacter(char)}
            />
            <span>{char}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
