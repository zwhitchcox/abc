import { useEffect, useState, useCallback, useRef } from "react";
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

type Options = {
  isLettersEnabled: boolean;
  isNumbersEnabled: boolean;
  enabledCharacters: { [key: string]: boolean } | null;
  isUpperCase: boolean;
  isSoundEnabled: boolean;
  isAccumulateMode: boolean;
};

export default function Index() {
  const [options, setOptions] = useState<Options>({
    isLettersEnabled: true,
    isNumbersEnabled: false,
    enabledCharacters: null,
    isUpperCase: false,
    isSoundEnabled: false,
    isAccumulateMode: false,
  });
  const [currentCharacter, setCurrentCharacter] = useState<string>("");
  const [accumulatedText, setAccumulatedText] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudioForLetter = useCallback((letter: string) => {
    if (audioRef.current) {
      audioRef.current.src = `/letters/phonetic/${letter.toLowerCase()}.wav`;
      return audioRef.current.play();
    }
    return Promise.resolve();
  }, []);

  const isAudioPlaying = useCallback(() => {
    return audioRef.current && !audioRef.current.paused;
  }, []);

  const showRandomCharacter = useCallback(() => {
    if (isModalOpen || isAudioPlaying()) return;

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

    let randomChar =
      availableChars[Math.floor(Math.random() * availableChars.length)] || "";
    if (!options.isUpperCase) {
      randomChar = randomChar.toLowerCase();
    }
    setCurrentCharacter(randomChar);
    if (options.isSoundEnabled) {
      void playAudioForLetter(randomChar);
    }
  }, [
    options.isLettersEnabled,
    options.isNumbersEnabled,
    options.enabledCharacters,
    isModalOpen,
    options.isUpperCase,
    options.isSoundEnabled,
    playAudioForLetter,
    isAudioPlaying,
  ]);

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
          showRandomCharacter();
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
          if (!options.isUpperCase) {
            key = key.toLowerCase();
          }
          if (options.isAccumulateMode) {
            setAccumulatedText((prev) => prev + key);
          } else {
            setCurrentCharacter(key);
          }
          if (options.isSoundEnabled) {
            void playAudioForLetter(key);
          }
        }
      }
    },
    [
      showRandomCharacter,
      options.isLettersEnabled,
      options.isNumbersEnabled,
      options.enabledCharacters,
      isModalOpen,
      options.isUpperCase,
      options.isSoundEnabled,
      options.isAccumulateMode,
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
        onClick={showRandomCharacter}
        className="flex h-full items-center justify-center"
      >
        {options.isAccumulateMode ? (
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
