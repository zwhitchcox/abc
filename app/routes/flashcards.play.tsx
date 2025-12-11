import { readdir } from "fs/promises";
import { join } from "path";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "#app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#app/components/ui/card";
import { Checkbox } from "#app/components/ui/checkbox";
import { Icon } from "#app/components/ui/icon";

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
    const topics = await readdir(imagesDir);

    for (const topic of topics) {
      if (topic.startsWith('.')) continue;

      // Filter by topic if specified
      if (topicParam !== 'all' && topic.toLowerCase() !== topicParam.toLowerCase()) {
        continue;
      }

      const topicPath = join(imagesDir, topic);
      const items = await readdir(topicPath);

      for (const item of items) {
        if (item.startsWith('.')) continue;

        const itemPath = join(topicPath, item);
        try {
          const images = await readdir(itemPath);
          const imageFiles = images.filter((img) =>
            /\.(jpg|jpeg|png|gif|webp)$/i.test(img),
          );

          if (imageFiles.length > 0) {
            // Add all available images for this item
            imageFiles.forEach((imageFile) => {
              flashcards.push({
                topic,
                item,
                imagePath: `/images/${topic}/${item}/${imageFile}`,
              });
            });
          }
        } catch {
          // Skip items that can't be read (might not be directories or might not exist)
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // We don't need selectedTopics state anymore as it's handled by loader filtering
  // But we might want to keep the modal for options like auto-show name

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
    setImageError(false); // Reset image error for new card
  }, [getNextIndex, autoShowName]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen) {
          setIsModalOpen(false);
        } else {
          navigate('/flashcards'); // Go back to topics list
        }
        return;
      }
      if (isModalOpen) return;

      if (e.code === "Space" && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
        if (!showName && !autoShowName) {
          setShowName(true);
        } else {
          nextCard();
        }
      }
    },
    [showName, autoShowName, nextCard, isModalOpen, isSpacePressed, navigate],
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
    } else {
      nextCard();
    }
  }, [showName, autoShowName, nextCard, isModalOpen]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyPress, handleKeyUp]);

  useEffect(() => {
    setShowName(autoShowName);
  }, [currentIndex, autoShowName]);

  // Speak the name when it's shown
  useEffect(() => {
    if (showName && speakName && flashcards[currentIndex]) {
      const name = flashcards[currentIndex].item
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(name);
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;
        utterance.volume = 1;

        window.speechSynthesis.speak(utterance);
      }
    }
  }, [showName, speakName, currentIndex, flashcards]);

  // Save auto show name preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("flashcards-auto-show-name", String(autoShowName));
    }
  }, [autoShowName]);

  // Save speak name preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("flashcards-speak-name", String(speakName));
    }
  }, [speakName]);

  // Initialize with random card on mount
  useEffect(() => {
    if (!isInitialized && flashcards.length > 0) {
      const randomIndex = Math.floor(Math.random() * flashcards.length);
      setCurrentIndex(randomIndex);
      setUsedIndices([randomIndex]);
      setIsInitialized(true);
    }
  }, [isInitialized, flashcards.length]);

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

  const currentCard = flashcards[currentIndex];
  const formattedName = currentCard
    ? currentCard.item
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

  return (
    <div className="relative h-full touch-manipulation select-none">
      <div className="absolute top-5 left-5 z-10">
        <Button variant="ghost" onClick={() => navigate('/flashcards')} className="gap-2">
          <Icon name="arrow-left" className="w-4 h-4" />
          Topics
        </Button>
      </div>

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
          className="w-full flex-1 flex items-center justify-center overflow-hidden"
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
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: "calc(100vh - 12rem)" }}
              onError={() => {
                console.error(`Failed to load image: ${currentCard?.imagePath}`);
                setImageError(true);
              }}
            />
          )}
        </div>

        <div className="h-32 flex items-center justify-center flex-shrink-0">
          {showName ? (
            <h2
              className="font-bold text-center px-4"
              style={{ fontSize: "min(10vh, 4rem)" }}
            >
              {formattedName}
            </h2>
          ) : (
            <p className="text-muted-foreground text-xl">
              Press space or click to reveal
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
