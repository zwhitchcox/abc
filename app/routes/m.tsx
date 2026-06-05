import { useState, useRef } from "react";

export default function TeachM() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/letters/phonetic/m.wav");
    }
    audioRef.current.play().catch((e) => console.error("Audio play failed", e));
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000); // Reset after 2s
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white touch-none select-none">
      <div className="relative flex flex-col items-center">
        {/* The Letter */}
        <div
          className="text-[40vh] font-serif leading-none text-black font-bold tracking-widest"
          style={{ fontFamily: "serif" }}
        >
          m
        </div>

        {/* The Reading Line & Dot */}
        <div className="relative mt-8 flex w-[60vw] max-w-2xl items-center">
          {/* Start Circle */}
          <div className="h-8 w-8 rounded-full border-4 border-black bg-white z-10" />

          {/* Line */}
          <div className="h-2 flex-grow bg-black" />

          {/* Arrowhead */}
          <div className="h-0 w-0 border-y-[16px] border-l-[24px] border-y-transparent border-l-black" />

          {/* Interactive Dot under the 'm' */}
          <div
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 cursor-pointer rounded-full transition-colors duration-300 ${
              isPlaying ? "bg-red-500 scale-110" : "bg-black hover:bg-gray-800"
            }`}
            onPointerDown={playSound}
          />
        </div>

        <div className="mt-16 text-2xl text-gray-400 font-light text-center px-4">
          Drag your finger along the line. <br />
          Stop at the dot and say{" "}
          <span className="font-bold text-gray-600">"mmmmm"</span>.
        </div>
      </div>
    </div>
  );
}
