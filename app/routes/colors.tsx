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
  { name: "Maroon", hex: "#800000", category: "Brown" },
  { name: "Brown", hex: "#A52A2A", category: "Brown" },
  { name: "SaddleBrown", hex: "#8B4513", category: "Brown" },
  { name: "Sienna", hex: "#A0522D", category: "Brown" },
  { name: "Chocolate", hex: "#D2691E", category: "Brown" },
  { name: "DarkGoldenrod", hex: "#B8860B", category: "Brown" },
  { name: "Peru", hex: "#CD853F", category: "Brown" },
  { name: "RosyBrown", hex: "#BC8F8F", category: "Brown" },
  { name: "Goldenrod", hex: "#DAA520", category: "Brown" },
  { name: "SandyBrown", hex: "#F4A460", category: "Brown" },
  { name: "Tan", hex: "#D2B48C", category: "Brown" },
  { name: "BurlyWood", hex: "#DEB887", category: "Brown" },
  { name: "Wheat", hex: "#F5DEB3", category: "Brown" },
  { name: "NavajoWhite", hex: "#FFDEAD", category: "Brown" },
  { name: "Bisque", hex: "#FFE4C4", category: "Brown" },
  { name: "BlanchedAlmond", hex: "#FFEBCD", category: "Brown" },
  { name: "Cornsilk", hex: "#FFF8DC", category: "Brown" },
  { name: "Teal", hex: "#008080", category: "Cyan" },
  { name: "DarkCyan", hex: "#008B8B", category: "Cyan" },
  { name: "LightSeaGreen", hex: "#20B2AA", category: "Cyan" },
  { name: "CadetBlue", hex: "#5F9EA0", category: "Cyan" },
  { name: "DarkTurquoise", hex: "#00CED1", category: "Cyan" },
  { name: "Turquoise", hex: "#40E0D0", category: "Cyan" },
  { name: "Aqua", hex: "#00FFFF", category: "Cyan" },
  { name: "Cyan", hex: "#00FFFF", category: "Cyan" },
  { name: "Aquamarine", hex: "#7FFFD4", category: "Cyan" },
  { name: "PaleTurquoise", hex: "#AFEEEE", category: "Cyan" },
  { name: "LightCyan", hex: "#E0FFFF", category: "Cyan" },
  { name: "Black", hex: "#000000", category: "Gray" },
  { name: "DarkSlateGray", hex: "#2F4F4F", category: "Gray" },
  { name: "DimGray", hex: "#696969", category: "Gray" },
  { name: "SlateGray", hex: "#708090", category: "Gray" },
  { name: "Gray", hex: "#808080", category: "Gray" },
  { name: "LightSlateGray", hex: "#778899", category: "Gray" },
  { name: "DarkGray", hex: "#A9A9A9", category: "Gray" },
  { name: "Silver", hex: "#C0C0C0", category: "Gray" },
  { name: "LightGray", hex: "#D3D3D3", category: "Gray" },
  { name: "Gainsboro", hex: "#DCDCDC", category: "Gray" },
  { name: "MediumVioletRed", hex: "#C71585", category: "Pink" },
  { name: "DeepPink", hex: "#FF1493", category: "Pink" },
  { name: "PaleVioletRed", hex: "#DB7093", category: "Pink" },
  { name: "HotPink", hex: "#FF69B4", category: "Pink" },
  { name: "LightPink", hex: "#FFB6C1", category: "Pink" },
  { name: "Pink", hex: "#FFC0CB", category: "Pink" },
  { name: "DarkRed", hex: "#8B0000", category: "Red" },
  { name: "Red", hex: "#FF0000", category: "Red" },
  { name: "Firebrick", hex: "#B22222", category: "Red" },
  { name: "Crimson", hex: "#DC143C", category: "Red" },
  { name: "IndianRed", hex: "#CD5C5C", category: "Red" },
  { name: "LightCoral", hex: "#F08080", category: "Red" },
  { name: "Salmon", hex: "#FA8072", category: "Red" },
  { name: "DarkSalmon", hex: "#E9967A", category: "Red" },
  { name: "LightSalmon", hex: "#FFA07A", category: "Red" },
  { name: "OrangeRed", hex: "#FF4500", category: "Orange" },
  { name: "Tomato", hex: "#FF6347", category: "Orange" },
  { name: "DarkOrange", hex: "#FF8C00", category: "Orange" },
  { name: "Coral", hex: "#FF7F50", category: "Orange" },
  { name: "Orange", hex: "#FFA500", category: "Orange" },
  { name: "DarkKhaki", hex: "#BDB76B", category: "Yellow" },
  { name: "Gold", hex: "#FFD700", category: "Yellow" },
  { name: "Khaki", hex: "#F0E68C", category: "Yellow" },
  { name: "PeachPuff", hex: "#FFDAB9", category: "Yellow" },
  { name: "Yellow", hex: "#FFFF00", category: "Yellow" },
  { name: "PaleGoldenrod", hex: "#EEE8AA", category: "Yellow" },
  { name: "Moccasin", hex: "#FFE4B5", category: "Yellow" },
  { name: "PapayaWhip", hex: "#FFEFD5", category: "Yellow" },
  { name: "LightGoldenrodYellow", hex: "#FAFAD2", category: "Yellow" },
  { name: "LemonChiffon", hex: "#FFFACD", category: "Yellow" },
  { name: "LightYellow", hex: "#FFFFE0", category: "Yellow" },
  { name: "Indigo", hex: "#4B0082", category: "Purple" },
  { name: "Purple", hex: "#800080", category: "Purple" },
  { name: "DarkMagenta", hex: "#8B008B", category: "Purple" },
  { name: "DarkViolet", hex: "#9400D3", category: "Purple" },
  { name: "DarkSlateBlue", hex: "#483D8B", category: "Purple" },
  { name: "BlueViolet", hex: "#8A2BE2", category: "Purple" },
  { name: "DarkOrchid", hex: "#9932CC", category: "Purple" },
  { name: "Fuchsia", hex: "#FF00FF", category: "Purple" },
  { name: "Magenta", hex: "#FF00FF", category: "Purple" },
  { name: "SlateBlue", hex: "#6A5ACD", category: "Purple" },
  { name: "MediumSlateBlue", hex: "#7B68EE", category: "Purple" },
  { name: "MediumOrchid", hex: "#BA55D3", category: "Purple" },
  { name: "MediumPurple", hex: "#9370DB", category: "Purple" },
  { name: "Orchid", hex: "#DA70D6", category: "Purple" },
  { name: "Violet", hex: "#EE82EE", category: "Purple" },
  { name: "Plum", hex: "#DDA0DD", category: "Purple" },
  { name: "Thistle", hex: "#D8BFD8", category: "Purple" },
  { name: "Lavender", hex: "#E6E6FA", category: "Purple" },
  { name: "MidnightBlue", hex: "#191970", category: "Blue" },
  { name: "Navy", hex: "#000080", category: "Blue" },
  { name: "DarkBlue", hex: "#00008B", category: "Blue" },
  { name: "MediumBlue", hex: "#0000CD", category: "Blue" },
  { name: "Blue", hex: "#0000FF", category: "Blue" },
  { name: "RoyalBlue", hex: "#4169E1", category: "Blue" },
  { name: "SteelBlue", hex: "#4682B4", category: "Blue" },
  { name: "DodgerBlue", hex: "#1E90FF", category: "Blue" },
  { name: "DeepSkyBlue", hex: "#00BFFF", category: "Blue" },
  { name: "CornflowerBlue", hex: "#6495ED", category: "Blue" },
  { name: "SkyBlue", hex: "#87CEEB", category: "Blue" },
  { name: "LightSkyBlue", hex: "#87CEFA", category: "Blue" },
  { name: "LightSteelBlue", hex: "#B0C4DE", category: "Blue" },
  { name: "LightBlue", hex: "#ADD8E6", category: "Blue" },
  { name: "PowderBlue", hex: "#B0E0E6", category: "Blue" },
  { name: "DarkGreen", hex: "#006400", category: "Green" },
  { name: "Green", hex: "#008000", category: "Green" },
  { name: "DarkOliveGreen", hex: "#556B2F", category: "Green" },
  { name: "ForestGreen", hex: "#228B22", category: "Green" },
  { name: "SeaGreen", hex: "#2E8B57", category: "Green" },
  { name: "Olive", hex: "#808000", category: "Green" },
  { name: "OliveDrab", hex: "#6B8E23", category: "Green" },
  { name: "MediumSeaGreen", hex: "#3CB371", category: "Green" },
  { name: "LimeGreen", hex: "#32CD32", category: "Green" },
  { name: "SpringGreen", hex: "#00FF7F", category: "Green" },
  { name: "MediumSpringGreen", hex: "#00FA9A", category: "Green" },
  { name: "DarkSeaGreen", hex: "#8FBC8F", category: "Green" },
  { name: "MediumAquamarine", hex: "#66CDAA", category: "Green" },
  { name: "YellowGreen", hex: "#9ACD32", category: "Green" },
  { name: "LawnGreen", hex: "#7CFC00", category: "Green" },
  { name: "Chartreuse", hex: "#7FFF00", category: "Green" },
  { name: "LightGreen", hex: "#90EE90", category: "Green" },
  { name: "GreenYellow", hex: "#ADFF2F", category: "Green" },
  { name: "PaleGreen", hex: "#98FB98", category: "Green" },
  { name: "MintCream", hex: "#F5FFFA", category: "White" },
  { name: "Snow", hex: "#FFFAFA", category: "White" },
  { name: "Ivory", hex: "#FFFFF0", category: "White" },
  { name: "White", hex: "#FFFFFF", category: "White" },
  { name: "MistyRose", hex: "#FFE4E1", category: "White" },
  { name: "AntiqueWhite", hex: "#FAEBD7", category: "White" },
];
type Options = {
  showColorName: boolean;
  autoShowName: boolean;
  speakName: boolean;
  useAdvancedColors: boolean;
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
    [showRandomColor, isModalOpen, showName, options.autoShowName, isSpacePressed],
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === " ") {
        event.preventDefault();
        setIsSpacePressed(false);
      }
    },
    [],
  );

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
