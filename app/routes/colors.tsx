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
  { name: "Maroon", hex: "Maroon" },
  { name: "Brown", hex: "Brown" },
  { name: "SaddleBrown", hex: "SaddleBrown" },
  { name: "Sienna", hex: "Sienna" },
  { name: "Chocolate", hex: "Chocolate" },
  { name: "DarkGoldenrod", hex: "DarkGoldenrod" },
  { name: "Peru", hex: "Peru" },
  { name: "RosyBrown", hex: "RosyBrown" },
  { name: "Goldenrod", hex: "Goldenrod" },
  { name: "SandyBrown", hex: "SandyBrown" },
  { name: "Tan", hex: "Tan" },
  { name: "BurlyWood", hex: "BurlyWood" },
  { name: "Wheat", hex: "Wheat" },
  { name: "NavajoWhite", hex: "NavajoWhite" },
  { name: "Bisque", hex: "Bisque" },
  { name: "BlanchedAlmond", hex: "BlanchedAlmond" },
  { name: "Cornsilk", hex: "Cornsilk" },
  { name: "Teal", hex: "Teal" },
  { name: "DarkCyan", hex: "DarkCyan" },
  { name: "LightSeaGreen", hex: "LightSeaGreen" },
  { name: "CadetBlue", hex: "CadetBlue" },
  { name: "DarkTurquoise", hex: "DarkTurquoise" },
  { name: "Turquoise", hex: "Turquoise" },
  { name: "Aqua", hex: "Aqua" },
  { name: "Cyan", hex: "Cyan" },
  { name: "Aquamarine", hex: "Aquamarine" },
  { name: "PaleTurquoise", hex: "PaleTurquoise" },
  { name: "LightCyan", hex: "LightCyan" },
  { name: "Black", hex: "Black" },
  { name: "DarkSlateGray", hex: "DarkSlateGray" },
  { name: "DimGray", hex: "DimGray" },
  { name: "SlateGray", hex: "SlateGray" },
  { name: "Gray", hex: "Gray" },
  { name: "LightSlateGray", hex: "LightSlateGray" },
  { name: "DarkGray", hex: "DarkGray" },
  { name: "Silver", hex: "Silver" },
  { name: "LightGray", hex: "LightGray" },
  { name: "Gainsboro", hex: "Gainsboro" },
  { name: "MediumVioletRed", hex: "MediumVioletRed" },
  { name: "DeepPink", hex: "DeepPink" },
  { name: "PaleVioletRed", hex: "PaleVioletRed" },
  { name: "HotPink", hex: "HotPink" },
  { name: "LightPink", hex: "LightPink" },
  { name: "Pink", hex: "Pink" },
  { name: "DarkRed", hex: "DarkRed" },
  { name: "Red", hex: "Red" },
  { name: "Firebrick", hex: "Firebrick" },
  { name: "Crimson", hex: "Crimson" },
  { name: "IndianRed", hex: "IndianRed" },
  { name: "LightCoral", hex: "LightCoral" },
  { name: "Salmon", hex: "Salmon" },
  { name: "DarkSalmon", hex: "DarkSalmon" },
  { name: "LightSalmon", hex: "LightSalmon" },
  { name: "OrangeRed", hex: "OrangeRed" },
  { name: "Tomato", hex: "Tomato" },
  { name: "DarkOrange", hex: "DarkOrange" },
  { name: "Coral", hex: "Coral" },
  { name: "Orange", hex: "Orange" },
  { name: "DarkKhaki", hex: "DarkKhaki" },
  { name: "Gold", hex: "Gold" },
  { name: "Khaki", hex: "Khaki" },
  { name: "PeachPuff", hex: "PeachPuff" },
  { name: "Yellow", hex: "Yellow" },
  { name: "PaleGoldenrod", hex: "PaleGoldenrod" },
  { name: "Moccasin", hex: "Moccasin" },
  { name: "PapayaWhip", hex: "PapayaWhip" },
  { name: "LightGoldenrodYellow", hex: "LightGoldenrodYellow" },
  { name: "LemonChiffon", hex: "LemonChiffon" },
  { name: "LightYellow", hex: "LightYellow" },
  { name: "Indigo", hex: "Indigo" },
  { name: "Purple", hex: "Purple" },
  { name: "DarkMagenta", hex: "DarkMagenta" },
  { name: "DarkViolet", hex: "DarkViolet" },
  { name: "DarkSlateBlue", hex: "DarkSlateBlue" },
  { name: "BlueViolet", hex: "BlueViolet" },
  { name: "DarkOrchid", hex: "DarkOrchid" },
  { name: "Fuchsia", hex: "Fuchsia" },
  { name: "Magenta", hex: "Magenta" },
  { name: "SlateBlue", hex: "SlateBlue" },
  { name: "MediumSlateBlue", hex: "MediumSlateBlue" },
  { name: "MediumOrchid", hex: "MediumOrchid" },
  { name: "MediumPurple", hex: "MediumPurple" },
  { name: "Orchid", hex: "Orchid" },
  { name: "Violet", hex: "Violet" },
  { name: "Plum", hex: "Plum" },
  { name: "Thistle", hex: "Thistle" },
  { name: "Lavender", hex: "Lavender" },
  { name: "MidnightBlue", hex: "MidnightBlue" },
  { name: "Navy", hex: "Navy" },
  { name: "DarkBlue", hex: "DarkBlue" },
  { name: "MediumBlue", hex: "MediumBlue" },
  { name: "Blue", hex: "Blue" },
  { name: "RoyalBlue", hex: "RoyalBlue" },
  { name: "SteelBlue", hex: "SteelBlue" },
  { name: "DodgerBlue", hex: "DodgerBlue" },
  { name: "DeepSkyBlue", hex: "DeepSkyBlue" },
  { name: "CornflowerBlue", hex: "CornflowerBlue" },
  { name: "SkyBlue", hex: "SkyBlue" },
  { name: "LightSkyBlue", hex: "LightSkyBlue" },
  { name: "LightSteelBlue", hex: "LightSteelBlue" },
  { name: "LightBlue", hex: "LightBlue" },
  { name: "PowderBlue", hex: "PowderBlue" },
  { name: "DarkGreen", hex: "DarkGreen" },
  { name: "Green", hex: "Green" },
  { name: "DarkOliveGreen", hex: "DarkOliveGreen" },
  { name: "ForestGreen", hex: "ForestGreen" },
  { name: "SeaGreen", hex: "SeaGreen" },
  { name: "Olive", hex: "Olive" },
  { name: "OliveDrab", hex: "OliveDrab" },
  { name: "MediumSeaGreen", hex: "MediumSeaGreen" },
  { name: "LimeGreen", hex: "LimeGreen" },
  { name: "SpringGreen", hex: "SpringGreen" },
  { name: "MediumSpringGreen", hex: "MediumSpringGreen" },
  { name: "DarkSeaGreen", hex: "DarkSeaGreen" },
  { name: "MediumAquamarine", hex: "MediumAquamarine" },
  { name: "YellowGreen", hex: "YellowGreen" },
  { name: "LawnGreen", hex: "LawnGreen" },
  { name: "Chartreuse", hex: "Chartreuse" },
  { name: "LightGreen", hex: "LightGreen" },
  { name: "GreenYellow", hex: "GreenYellow" },
  { name: "PaleGreen", hex: "PaleGreen" },
  { name: "MintCream", hex: "MintCream" },
  { name: "Snow", hex: "Snow" },
  { name: "Ivory", hex: "Ivory" },
  { name: "White", hex: "White" },
  { name: "MistyRose", hex: "MistyRose" },
  { name: "AntiqueWhite", hex: "AntiqueWhite" },
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
  if (!hex.startsWith('#')) {
    const darkColors = [
      'Black', 'DarkSlateGray', 'DarkGray', 'DimGray', 'SlateGray',
      'DarkRed', 'Maroon', 'Brown', 'SaddleBrown', 'Sienna', 'DarkGoldenrod',
      'DarkGreen', 'DarkOliveGreen', 'ForestGreen', 'SeaGreen', 'Olive', 'OliveDrab',
      'DarkBlue', 'MidnightBlue', 'Navy', 'DarkSlateBlue', 'Indigo',
      'Purple', 'DarkMagenta', 'DarkViolet', 'DarkOrchid',
      'DarkCyan', 'Teal', 'DarkTurquoise'
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
