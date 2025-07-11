import { useState, useEffect, useCallback } from "react";
import { Button } from "#app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#app/components/ui/card";
import { Checkbox } from "#app/components/ui/checkbox";

// Basic colors for learning
const colors = [
  { name: "Red", hex: "#FF0000" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Green", hex: "#00FF00" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Purple", hex: "#800080" },
  { name: "Pink", hex: "#FFB6C1" },
  { name: "Brown", hex: "#964B00" },
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#808080" },
  { name: "Turquoise", hex: "#40E0D0" },
  { name: "Navy", hex: "#000080" },
  { name: "Lime", hex: "#32CD32" },
  { name: "Cyan", hex: "#00FFFF" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Tan", hex: "#D2B48C" },
  { name: "Peach", hex: "#FFDAB9" },
  { name: "Coral", hex: "#FF6F61" },
];

type Options = {
  showColorName: boolean;
};

// Calculate luminance to determine if text should be light or dark
function getLuminance(hex: string): number {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance;
}

export default function Colors() {
  const [options, setOptions] = useState<Options>({
    showColorName: true,
  });
  const [currentColor, setCurrentColor] = useState<(typeof colors)[0] | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [remainingColors, setRemainingColors] = useState<typeof colors>([
    ...colors,
  ]);

  const showRandomColor = useCallback(() => {
    if (isModalOpen) return;

    // If we've shown all colors, reset the list
    const availableColors =
      remainingColors.length > 0 ? remainingColors : [...colors];

    // Pick a random color from available colors
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    const randomColor = availableColors[randomIndex];

    // Remove the shown color from remaining colors
    const newRemainingColors = availableColors.filter(
      (_, index) => index !== randomIndex,
    );
    setRemainingColors(newRemainingColors);

    setCurrentColor(randomColor || null);
  }, [isModalOpen, remainingColors]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOptions = localStorage.getItem("colorOptions");
      if (savedOptions) {
        setOptions(JSON.parse(savedOptions) as Options);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("colorOptions", JSON.stringify(options));
    }
  }, [options]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
        return;
      }
      if (isModalOpen) return;
      if (event.key === " ") {
        event.preventDefault();
        showRandomColor();
      }
    },
    [showRandomColor, isModalOpen],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [handleKeyDown]);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  return (
    <div
      className="relative box-border h-full touch-manipulation select-none transition-colors duration-300"
      style={{ backgroundColor: currentColor?.hex || "#FFFFFF" }}
    >
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
            className="max-h-[90vh] max-w-md overflow-y-auto"
          >
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Options</CardTitle>
              <Button onClick={toggleModal} variant="ghost">
                Close
              </Button>
            </CardHeader>
            <CardContent>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={options.showColorName}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({
                      ...prev,
                      showColorName: checked as boolean,
                    }))
                  }
                />
                <span>Show color name</span>
              </label>
            </CardContent>
          </Card>
        </div>
      )}

      <div
        onClick={showRandomColor}
        className="flex h-full items-center justify-center"
      >
        {currentColor && options.showColorName && (
          <div
            className="text-8xl font-bold"
            style={{
              color:
                getLuminance(currentColor.hex) < 0.5 ? "#FFFFFF" : "#000000",
              textShadow:
                getLuminance(currentColor.hex) < 0.5
                  ? "2px 2px 8px rgba(0,0,0,0.5)"
                  : "2px 2px 8px rgba(255,255,255,0.5)",
            }}
          >
            {currentColor.name}
          </div>
        )}
        {!currentColor && (
          <div className="text-4xl font-medium text-gray-600">
            Press space or click to see a color
          </div>
        )}
      </div>
    </div>
  );
}
