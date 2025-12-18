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
];

const advancedColors = [
  { name: "Vermilion", hex: "#E34234" },
  { name: "Marigold", hex: "#F7B32B" },
  { name: "Chartreuse", hex: "#7FFF00" },
  { name: "Turquoise", hex: "#30D5C8" },
  { name: "Cerulean", hex: "#2A6FDF" },
  { name: "Magenta", hex: "#FF00A7" },
  { name: "Azure", hex: "#007FFF" },
  { name: "Cyan", hex: "#00B7EB" },
  { name: "Teal", hex: "#008B8B" },
  { name: "Viridian", hex: "#138D75" },
  { name: "Periwinkle", hex: "#8F99FB" },
  { name: "Indigo", hex: "#4B0082" },
  { name: "Ochre", hex: "#CC7722" },
  { name: "Sienna", hex: "#A0522D" },
  { name: "Umber", hex: "#635147" },
  { name: "Taupe", hex: "#8B7E77" },
  { name: "Mauve", hex: "#B784A7" },
  // { name: "Aubergine", hex: "#580F41" },
  { name: "Coral", hex: "#FF6F61" },
  { name: "Salmon", hex: "#FA8072" },
  { name: "Amaranth", hex: "#E52B50" },
  { name: "Crimson", hex: "#DC143C" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Rust", hex: "#B7410E" },
  { name: "Mint", hex: "#3EB489" },
  { name: "Seafoam", hex: "#7FFFD4" },
  { name: "Forest", hex: "#0B6623" },
  { name: "Lapis", hex: "#26619C" },
  { name: "Navy", hex: "#001F54" },
  { name: "Prussian Blue", hex: "#003153" },
  { name: "Scarlet", hex: "#FF2400" },
  { name: "Ruby", hex: "#E0115F" },
  { name: "Cherry", hex: "#D2042D" },
  { name: "Rose", hex: "#FF007F" },
  { name: "Carnation", hex: "#FFA6C9" },
  { name: "Fuchsia", hex: "#FF00FF" },
  { name: "Cerise", hex: "#DE3163" },
  { name: "Maroon", hex: "#800000" },
  { name: "Tangerine", hex: "#F28500" },
  { name: "Apricot", hex: "#FBCEB1" },
  { name: "Amber", hex: "#FFBF00" },
  { name: "Carrot", hex: "#ED9121" },
  { name: "Pumpkin", hex: "#FF7518" },
  { name: "Saffron", hex: "#F4C430" },
  { name: "Chestnut", hex: "#954535" },
  { name: "Mahogany", hex: "#C04000" },
  { name: "Russet", hex: "#80461B" },
  { name: "Copper", hex: "#B87333" },
  { name: "Cinnamon", hex: "#D2691E" },
  { name: "Tawny", hex: "#CD5700" },
  { name: "Tan", hex: "#D2B48C" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Canary", hex: "#FFFF99" },
  { name: "Lemon", hex: "#FFF44F" },
  { name: "Mustard", hex: "#FFDB58" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Goldenrod", hex: "#DAA520" },
  { name: "Honey", hex: "#FFC30B" },
  { name: "Flax", hex: "#EEDC82" },
  { name: "Khaki", hex: "#C3B091" },
  { name: "Jade", hex: "#00A86B" },
  { name: "Emerald", hex: "#50C878" },
  { name: "Kelly Green", hex: "#4CBB17" },
  { name: "Moss", hex: "#8A9A5B" },
  { name: "Olive", hex: "#808000" },
  { name: "Lime", hex: "#32CD32" },
  { name: "Fern", hex: "#4F7942" },
  { name: "Sage", hex: "#9CBA7F" },
  { name: "Aquamarine", hex: "#7FFFD4" },
  { name: "Sky", hex: "#87CEEB" },
  { name: "Peacock", hex: "#1F6F8B" },
  { name: "Cobalt", hex: "#0047AB" },
  { name: "Ultramarine", hex: "#3F00FF" },
  { name: "Sapphire", hex: "#0F52BA" },
  { name: "Violet", hex: "#8F00FF" },
  { name: "Lavender", hex: "#E6E6FA" },
  { name: "Lilac", hex: "#C8A2C8" },
  { name: "Amethyst", hex: "#9966CC" },
  { name: "Orchid", hex: "#DA70D6" },
  { name: "Plum", hex: "#8E4585" },
  { name: "Wine", hex: "#722F37" },
  { name: "Tyrian Purple", hex: "#66023C" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Ivory", hex: "#FFFFF0" },
  { name: "Cream", hex: "#FFFDD0" },
  { name: "Pearl", hex: "#EAE0C8" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Slate", hex: "#708090" },
  { name: "Charcoal", hex: "#36454F" },
  { name: "Black", hex: "#000000" },
  { name: "Jet", hex: "#343434" },
  { name: "Onyx", hex: "#353839" },
];
type Options = {
  showColorName: boolean;
  autoShowName: boolean;
  speakName: boolean;
  useAdvancedColors: boolean;
};

// Calculate luminance to determine if text should be light or dark
function getLuminance(hex: string): number {
  // If it's not a hex color (starts with #), check if it's a dark color by name
  if (!hex.startsWith("#")) {
    const darkColors = [
      "Black",
      "DarkSlateGray",
      "DarkGray",
      "DimGray",
      "SlateGray",
      "DarkRed",
      "Maroon",
      "Brown",
      "SaddleBrown",
      "Sienna",
      "DarkGoldenrod",
      "DarkGreen",
      "DarkOliveGreen",
      "ForestGreen",
      "SeaGreen",
      "Olive",
      "OliveDrab",
      "DarkBlue",
      "MidnightBlue",
      "Navy",
      "DarkSlateBlue",
      "Indigo",
      "Purple",
      "DarkMagenta",
      "DarkViolet",
      "DarkOrchid",
      "DarkCyan",
      "Teal",
      "DarkTurquoise",
    ];
    return darkColors.includes(hex) ? 0.2 : 0.8;
  }

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
    autoShowName: true,
    speakName: false,
    useAdvancedColors: false,
  });
  const [currentColor, setCurrentColor] = useState<(typeof colors)[0] | null>(
    null,
  );
  const [showName, setShowName] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [remainingColors, setRemainingColors] = useState<typeof colors>([
    ...colors,
  ]);

  const colorSet = options.useAdvancedColors ? advancedColors : colors;

  const showRandomColor = useCallback(() => {
    if (isModalOpen) return;

    // If we've shown all colors, reset the list
    const availableColors =
      remainingColors.length > 0 ? remainingColors : [...colorSet];

    // Pick a random color from available colors
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    const randomColor = availableColors[randomIndex];

    // Remove the shown color from remaining colors
    const newRemainingColors = availableColors.filter(
      (_, index) => index !== randomIndex,
    );
    setRemainingColors(newRemainingColors);

    setCurrentColor(randomColor || null);
    setShowName(options.autoShowName);
  }, [isModalOpen, remainingColors, colorSet, options.autoShowName]);

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
      if (event.key === " " && !isSpacePressed) {
        event.preventDefault();
        setIsSpacePressed(true);
        if (!showName && !options.autoShowName) {
          setShowName(true);
        } else {
          showRandomColor();
        }
      }
    },
    [
      showRandomColor,
      isModalOpen,
      showName,
      options.autoShowName,
      isSpacePressed,
    ],
  );

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.key === " ") {
      event.preventDefault();
      setIsSpacePressed(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }
  }, [handleKeyDown, handleKeyUp]);

  // Convert camelCase to Title Case
  const formatColorName = (name: string) => {
    return name
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Speak the name when it's shown
  useEffect(() => {
    if (showName && options.speakName && currentColor) {
      const formattedName = formatColorName(currentColor.name);

      if ("speechSynthesis" in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(formattedName);
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;
        utterance.volume = 1;

        window.speechSynthesis.speak(utterance);
      }
    }
  }, [showName, options.speakName, currentColor]);

  // Reset remainingColors when switching between basic and advanced
  useEffect(() => {
    setRemainingColors([...colorSet]);
  }, [colorSet]);

  const handleClick = useCallback(() => {
    if (isModalOpen) return;
    if (!showName && !options.autoShowName) {
      setShowName(true);
    } else {
      showRandomColor();
    }
  }, [showName, options.autoShowName, showRandomColor, isModalOpen]);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  return (
    <div
      className="relative box-border min-h-screen w-full touch-manipulation select-none transition-colors duration-300"
      style={{ backgroundColor: currentColor?.hex || "#FFFFFF" }}
    >
      <Button
        onClick={toggleModal}
        className="absolute left-5 top-5 z-10 px-4 py-2 text-lg"
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
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Color Set</h3>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={options.useAdvancedColors}
                      onCheckedChange={(checked) =>
                        setOptions((prev) => ({
                          ...prev,
                          useAdvancedColors: checked as boolean,
                        }))
                      }
                    />
                    <span>
                      Use advanced colors ({advancedColors.length} colors)
                    </span>
                  </label>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Display Options</h3>
                  <div className="space-y-3">
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

                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={options.autoShowName}
                        onCheckedChange={(checked) =>
                          setOptions((prev) => ({
                            ...prev,
                            autoShowName: checked as boolean,
                          }))
                        }
                        disabled={!options.showColorName}
                      />
                      <span>Always show name immediately</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={options.speakName}
                        onCheckedChange={(checked) =>
                          setOptions((prev) => ({
                            ...prev,
                            speakName: checked as boolean,
                          }))
                        }
                      />
                      <span>Speak color name when shown</span>
                    </label>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Colors shown: {colorSet.length - remainingColors.length} of{" "}
                  {colorSet.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div
        onClick={handleClick}
        className="flex h-full items-center justify-center"
      >
        {currentColor ? (
          <>
            {options.showColorName && showName && (
              <div
                className="text-8xl font-bold"
                style={{
                  color:
                    getLuminance(currentColor.hex) < 0.5
                      ? "#FFFFFF"
                      : "#000000",
                  textShadow:
                    getLuminance(currentColor.hex) < 0.5
                      ? "2px 2px 8px rgba(0,0,0,0.5)"
                      : "2px 2px 8px rgba(255,255,255,0.5)",
                }}
              >
                {formatColorName(currentColor.name)}
              </div>
            )}
            {options.showColorName && !showName && !options.autoShowName && (
              <div
                className="text-2xl"
                style={{
                  color:
                    getLuminance(currentColor.hex) < 0.5
                      ? "#FFFFFF"
                      : "#000000",
                }}
              >
                Press space or click to reveal name
              </div>
            )}
          </>
        ) : (
          <div className="text-4xl font-medium text-gray-600">
            Press space or click to see a color
          </div>
        )}
      </div>
    </div>
  );
}
