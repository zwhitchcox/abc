import { useEffect, useState } from "react";
import { cn } from "#app/utils/misc.tsx";

const DECORATED_STORY_NAMES = new Set(["The-Little-Garden-Caterpillar"]);

type Motif =
  | "butterfly"
  | "chrysalis"
  | "flower"
  | "leaf"
  | "leafCaterpillar"
  | "leafStem"
  | "pear"
  | "peaPod"
  | "sleepyCaterpillar"
  | "strawberry";

type ArtRole =
  | "accent"
  | "bottom"
  | "corner"
  | "primary"
  | "secondary"
  | "side"
  | "top"
  | "trail";

type TextWrapShape =
  | "butterfly-right"
  | "chrysalis-top"
  | "fruit-left"
  | "fruit-right"
  | "leaf-stem-left"
  | "leaf-stem-right"
  | "leaf-left"
  | "leaf-right"
  | "pea-top"
  | "sleepy-bottom";

interface DecorationArt {
  motif: Motif;
  role: ArtRole;
}

interface DecorationPlan {
  art: DecorationArt[];
  wraps?: Array<{ shape: TextWrapShape; side: "left" | "right" }>;
}

const DECORATIONS_BY_PAGE: Record<number, DecorationPlan> = {
  1: {
    art: [
      { motif: "butterfly", role: "primary" },
      { motif: "flower", role: "bottom" },
    ],
    wraps: [{ shape: "butterfly-right", side: "right" }],
  },
  2: {
    art: [
      { motif: "leafStem", role: "side" },
      { motif: "leafCaterpillar", role: "primary" },
    ],
    wraps: [{ shape: "leaf-stem-left", side: "left" }],
  },
  3: {
    art: [
      { motif: "strawberry", role: "primary" },
      { motif: "pear", role: "secondary" },
      { motif: "peaPod", role: "accent" },
    ],
    wraps: [{ shape: "fruit-right", side: "right" }],
  },
  4: {
    art: [
      { motif: "strawberry", role: "primary" },
      { motif: "leafCaterpillar", role: "bottom" },
    ],
    wraps: [{ shape: "fruit-left", side: "left" }],
  },
  5: {
    art: [
      { motif: "pear", role: "primary" },
      { motif: "leafCaterpillar", role: "top" },
    ],
    wraps: [{ shape: "fruit-right", side: "right" }],
  },
  6: {
    art: [
      { motif: "peaPod", role: "top" },
      { motif: "peaPod", role: "primary" },
      { motif: "leafCaterpillar", role: "secondary" },
    ],
    wraps: [{ shape: "pea-top", side: "left" }],
  },
  7: {
    art: [
      { motif: "leaf", role: "primary" },
      { motif: "leafCaterpillar", role: "secondary" },
    ],
    wraps: [{ shape: "leaf-stem-left", side: "left" }],
  },
  8: {
    art: [
      { motif: "sleepyCaterpillar", role: "bottom" },
      { motif: "leaf", role: "primary" },
    ],
    wraps: [{ shape: "sleepy-bottom", side: "left" }],
  },
  9: {
    art: [
      { motif: "chrysalis", role: "primary" },
      { motif: "leafStem", role: "side" },
    ],
    wraps: [
      { shape: "leaf-stem-left", side: "left" },
      { shape: "chrysalis-top", side: "right" },
    ],
  },
  10: {
    art: [
      { motif: "butterfly", role: "primary" },
      { motif: "flower", role: "bottom" },
    ],
    wraps: [{ shape: "butterfly-right", side: "right" }],
  },
};

const DEFAULT_DECORATIONS = DECORATIONS_BY_PAGE[2]!;

export function hasStoryTextDecorations(storyName: string) {
  return DECORATED_STORY_NAMES.has(storyName);
}

export function StoryTextDecorations({
  storyName,
  page,
  compact = false,
  print = false,
  textOnly = false,
  className,
}: {
  storyName: string;
  page?: number | null;
  compact?: boolean;
  print?: boolean;
  textOnly?: boolean;
  className?: string;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  if (!hasStoryTextDecorations(storyName)) return null;

  const plan =
    typeof page === "number"
      ? (DECORATIONS_BY_PAGE[page] ?? DEFAULT_DECORATIONS)
      : DEFAULT_DECORATIONS;
  const pageNumber = typeof page === "number" ? page : 2;
  const art = print && textOnly ? [] : print ? plan.art.slice(0, 2) : plan.art;

  return (
    <div
      aria-hidden="true"
      className={cn(
        print
          ? "print-text-decor"
          : "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        print && compact && "print-text-decor-small",
        print && textOnly
          ? "print-text-decor-text-only"
          : print && "print-text-decor-caption",
        `story-page-decor story-page-decor-${pageNumber}`,
        className,
      )}
    >
      {!print ? (
        <style dangerouslySetInnerHTML={{ __html: SCREEN_MOTION_CSS }} />
      ) : null}
      {art.map(({ motif, role }, index) => (
        <ArtLayer
          key={`${motif}-${role}-${index}`}
          motif={motif}
          page={pageNumber}
          print={print}
          prefersReducedMotion={Boolean(prefersReducedMotion)}
          role={role}
          className={
            print
              ? `print-text-decor-art story-decor-${role} story-decor-${motif}`
              : screenArtClass(pageNumber, role, compact)
          }
        />
      ))}
    </div>
  );
}

export function StoryTextWraps({
  storyName,
  page,
  compact = false,
}: {
  storyName: string;
  page?: number | null;
  compact?: boolean;
}) {
  if (!hasStoryTextDecorations(storyName)) return null;

  const pageNumber = typeof page === "number" ? page : 2;
  const plan = DECORATIONS_BY_PAGE[pageNumber] ?? DEFAULT_DECORATIONS;

  return (
    <>
      {plan.wraps?.map(({ shape, side }, index) => (
        <span
          key={`${shape}-${side}-${index}`}
          aria-hidden="true"
          className={cn(
            "story-text-wrap",
            `story-text-wrap-${side}`,
            `story-text-wrap-${shape}`,
            compact && "story-text-wrap-small",
          )}
        >
          <MotifSvg motif={wrapMotif(shape)} className="story-decor-svg" />
        </span>
      ))}
    </>
  );
}

function ArtLayer({
  motif,
  page,
  print,
  prefersReducedMotion,
  role,
  className,
}: {
  motif: Motif;
  page: number;
  print: boolean;
  prefersReducedMotion: boolean;
  role: ArtRole;
  className: string;
}) {
  if (print) {
    return (
      <div className={className}>
        <MotifSvg motif={motif} className="story-decor-svg" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        className,
        screenMotionClass(motif, page, role, prefersReducedMotion),
      )}
    >
      <MotifSvg motif={motif} className="h-full w-full" />
    </div>
  );
}

function screenArtClass(page: number, role: ArtRole, compact: boolean) {
  if (compact && (role === "top" || role === "trail")) return "hidden";

  const base = "pointer-events-none absolute hidden opacity-90 print:hidden";
  const size = compact ? "scale-90" : "";
  const pageClasses: Record<number, Partial<Record<ArtRole, string>>> = {
    2: {
      primary: "left-3 bottom-2 h-20 w-32 sm:block",
      side: "right-2 top-1 h-16 w-24 md:block",
      bottom: "right-6 bottom-2 h-14 w-14 lg:block",
    },
    3: {
      primary: "right-4 top-2 h-16 w-16 sm:block",
      secondary: "left-3 bottom-2 h-16 w-16 md:block",
      accent: "right-24 bottom-1 h-12 w-20 lg:block",
    },
    4: {
      primary: "left-3 bottom-2 h-20 w-20 sm:block",
      bottom: "right-3 bottom-1 h-16 w-28 md:block",
      side: "right-28 top-1 h-14 w-20 lg:block",
    },
    5: {
      primary: "right-4 bottom-1 h-20 w-20 sm:block",
      side: "left-3 top-2 h-16 w-24 md:block",
      top: "left-28 bottom-1 h-14 w-24 lg:block",
    },
    6: {
      top: "left-1/2 top-1 h-14 w-28 -translate-x-1/2 sm:block",
      primary: "left-3 bottom-2 h-16 w-28 md:block",
      secondary: "right-3 bottom-1 h-14 w-24 lg:block",
    },
    7: {
      primary: "left-3 top-1 h-20 w-28 sm:block",
      secondary: "right-4 bottom-1 h-14 w-24 md:block",
      bottom: "left-36 bottom-2 h-12 w-20 lg:block",
    },
    8: {
      bottom: "left-3 bottom-1 h-16 w-28 sm:block",
      primary: "right-3 top-1 h-16 w-24 md:block",
      top: "right-32 bottom-2 h-12 w-12 lg:block",
    },
    9: {
      primary: "right-3 top-1 h-20 w-20 sm:block",
      side: "left-3 bottom-1 h-16 w-24 md:block",
      corner: "left-32 top-2 h-12 w-14 lg:block",
    },
    10: {
      primary: "right-3 top-1 h-20 w-24 sm:block",
      bottom: "left-4 bottom-1 h-14 w-14 md:block",
      trail: "right-32 bottom-1 h-12 w-14 lg:block",
    },
  };

  const fallbackClasses: Partial<Record<ArtRole, string>> = {
    primary: "left-3 bottom-2 h-16 w-28 sm:block",
    secondary: "right-3 top-2 h-16 w-20 md:block",
    accent: "right-4 bottom-2 h-14 w-20 lg:block",
  };

  return cn(
    base,
    size,
    pageClasses[page]?.[role] ?? fallbackClasses[role] ?? "hidden",
  );
}

function screenMotionClass(
  motif: Motif,
  _page: number,
  role: ArtRole,
  prefersReducedMotion: boolean,
) {
  if (prefersReducedMotion) return "";

  if (motif === "butterfly") {
    return role === "trail"
      ? "story-motion-butterfly-trail"
      : "story-motion-butterfly";
  }
  if (motif === "leafCaterpillar") {
    return "story-motion-caterpillar";
  }
  if (motif === "chrysalis") {
    return "story-motion-chrysalis";
  }
  if (motif === "sleepyCaterpillar") {
    return "story-motion-breathe";
  }
  if (motif === "flower") {
    return "story-motion-bloom";
  }
  if (motif === "leaf" || motif === "peaPod") {
    return "story-motion-leaf";
  }
  if (motif === "leafStem") {
    return "story-motion-stem";
  }

  return "story-motion-bloom";
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);
    const onChange = () => setPrefersReducedMotion(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return prefersReducedMotion;
}

const SCREEN_MOTION_CSS = `
@keyframes storyButterflyFloat {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
  35% { transform: translate3d(10px, -12px, 0) rotate(6deg); }
  70% { transform: translate3d(-3px, -4px, 0) rotate(-4deg); }
}
@keyframes storyButterflyTrail {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
  40% { transform: translate3d(14px, -12px, 0) rotate(6deg); }
  75% { transform: translate3d(4px, -4px, 0) rotate(-4deg); }
}
@keyframes storyCaterpillarCrawl {
  0%, 100% { transform: translate3d(0, 0, 0); }
  45% { transform: translate3d(8px, -2px, 0); }
  75% { transform: translate3d(14px, 1px, 0); }
}
@keyframes storyChrysalisSwing {
  0%, 100% { transform: rotate(-1.5deg); transform-origin: 50% 10%; }
  50% { transform: rotate(1.5deg); transform-origin: 50% 10%; }
}
@keyframes storyBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.025); }
}
@keyframes storyLeafSway {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(-1deg); }
  50% { transform: translate3d(0, -3px, 0) rotate(1.5deg); }
}
.story-motion-butterfly { animation: storyButterflyFloat 7s ease-in-out infinite; }
.story-motion-butterfly-trail { animation: storyButterflyTrail 7.5s ease-in-out infinite; }
.story-motion-caterpillar { animation: storyCaterpillarCrawl 10s ease-in-out infinite; }
.story-motion-chrysalis { animation: storyChrysalisSwing 5s ease-in-out infinite; }
.story-motion-breathe { animation: storyBreathe 4.5s ease-in-out infinite; }
.story-motion-bloom { animation: storyBreathe 6s ease-in-out infinite; }
.story-motion-leaf { animation: storyLeafSway 8s ease-in-out infinite; }
.story-motion-stem { animation: storyLeafSway 9s ease-in-out infinite; transform-origin: 50% 100%; }
`;

const DECORATION_ASSET_BASE =
  "/img/story-decorations/little-garden-caterpillar";

const MOTIF_IMAGE_SRC: Record<Motif, string> = {
  butterfly: `${DECORATION_ASSET_BASE}/butterfly.png`,
  chrysalis: `${DECORATION_ASSET_BASE}/chrysalis.png`,
  flower: `${DECORATION_ASSET_BASE}/flower.png`,
  leaf: `${DECORATION_ASSET_BASE}/leaf.png`,
  leafCaterpillar: `${DECORATION_ASSET_BASE}/leaf-caterpillar.png`,
  leafStem: `${DECORATION_ASSET_BASE}/leaf-stem.png`,
  pear: `${DECORATION_ASSET_BASE}/pear.png`,
  peaPod: `${DECORATION_ASSET_BASE}/pea-pod.png`,
  sleepyCaterpillar: `${DECORATION_ASSET_BASE}/sleepy-caterpillar.png`,
  strawberry: `${DECORATION_ASSET_BASE}/strawberry.png`,
};

function MotifSvg({ motif, className }: { motif: Motif; className?: string }) {
  const src = MOTIF_IMAGE_SRC[motif];
  if (src) {
    return (
      <img
        alt=""
        className={cn("story-decor-img", className)}
        draggable={false}
        src={src}
      />
    );
  }

  switch (motif) {
    case "butterfly":
      return <ButterflySvg className={className} />;
    case "chrysalis":
      return <ChrysalisSvg className={className} />;
    case "flower":
      return <FlowerSvg className={className} />;
    case "leaf":
      return <LeafSvg className={className} />;
    case "leafStem":
      return <LeafStemSvg className={className} />;
    case "pear":
      return <PearSvg className={className} />;
    case "peaPod":
      return <PeaPodSvg className={className} />;
    case "sleepyCaterpillar":
      return <SleepyCaterpillarSvg className={className} />;
    case "strawberry":
      return <StrawberrySvg className={className} />;
    case "leafCaterpillar":
    default:
      return <LeafCaterpillarSvg className={className} />;
  }
}

function wrapMotif(shape: TextWrapShape): Motif {
  switch (shape) {
    case "butterfly-right":
      return "butterfly";
    case "chrysalis-top":
      return "chrysalis";
    case "fruit-left":
      return "strawberry";
    case "fruit-right":
      return "pear";
    case "leaf-stem-left":
    case "leaf-stem-right":
      return "leafStem";
    case "leaf-left":
    case "leaf-right":
      return "leaf";
    case "pea-top":
      return "peaPod";
    case "sleepy-bottom":
      return "sleepyCaterpillar";
  }
}

function LeafCaterpillarSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 120" className={className}>
      <path
        d="M18 88 C54 42 120 34 166 72 C126 111 61 113 18 88Z"
        fill="#b7d66b"
      />
      <path
        d="M29 87 C77 73 121 67 157 72"
        fill="none"
        stroke="#6f8f2f"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <circle cx="60" cy="58" r="15" fill="#7dc75b" />
      <circle cx="84" cy="53" r="15" fill="#90d66a" />
      <circle cx="108" cy="56" r="15" fill="#7dc75b" />
      <circle cx="132" cy="65" r="16" fill="#f2b84b" />
      <circle cx="126" cy="60" r="3" fill="#1c1917" />
      <circle cx="138" cy="60" r="3" fill="#1c1917" />
      <path
        d="M128 70 C133 74 139 74 144 70"
        fill="none"
        stroke="#1c1917"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function SleepyCaterpillarSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 120" className={className}>
      <path
        d="M21 86 C58 48 120 43 159 75 C119 103 62 107 21 86Z"
        fill="#b7d66b"
      />
      <circle cx="58" cy="61" r="16" fill="#6fbd58" />
      <circle cx="83" cy="57" r="18" fill="#82cf66" />
      <circle cx="112" cy="61" r="20" fill="#6fbd58" />
      <circle cx="140" cy="69" r="21" fill="#f2b84b" />
      <path
        d="M129 65 C133 62 137 62 141 65 M146 66 C150 63 154 63 158 66"
        fill="none"
        stroke="#1c1917"
        strokeLinecap="round"
        strokeWidth="2.8"
      />
      <path
        d="M137 76 C143 80 151 80 157 76"
        fill="none"
        stroke="#1c1917"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      <path
        d="M41 88 C79 78 121 73 154 76"
        fill="none"
        stroke="#6f8f2f"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M22 33 h19 M32 24 v18 M55 23 h14 l-14 20 h14"
        fill="none"
        stroke="#5f8fca"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
    </svg>
  );
}

function ButterflySvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 110" className={className}>
      <ellipse
        cx="49"
        cy="44"
        rx="28"
        ry="19"
        fill="#f7a8b8"
        transform="rotate(-28 49 44)"
      />
      <ellipse
        cx="91"
        cy="44"
        rx="28"
        ry="19"
        fill="#ffd166"
        transform="rotate(28 91 44)"
      />
      <ellipse
        cx="51"
        cy="74"
        rx="21"
        ry="15"
        fill="#86d3f5"
        transform="rotate(24 51 74)"
      />
      <ellipse
        cx="88"
        cy="74"
        rx="21"
        ry="15"
        fill="#a7d77b"
        transform="rotate(-24 88 74)"
      />
      <path d="M70 36 C63 52 63 74 71 92 C79 74 79 52 70 36Z" fill="#6b4f2a" />
      <circle cx="56" cy="45" r="5" fill="#f2c35b" />
      <circle cx="96" cy="47" r="5" fill="#e84f8a" />
      <circle cx="55" cy="75" r="5" fill="#e84f8a" />
      <circle cx="88" cy="75" r="5" fill="#f2c35b" />
      <path
        d="M67 35 C57 22 47 20 38 25 M74 35 C84 22 95 20 104 25"
        fill="none"
        stroke="#6b4f2a"
        strokeLinecap="round"
        strokeWidth="4.5"
      />
    </svg>
  );
}

function StrawberrySvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 130 120" className={className}>
      <path
        d="M28 53 C39 28 76 27 95 50 C110 73 87 107 64 111 C42 105 17 77 28 53Z"
        fill="#e84f4f"
      />
      <path
        d="M51 35 L64 18 L77 35 L91 27 L84 46 L44 46 L38 27Z"
        fill="#6faa44"
        stroke="#6faa44"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <circle cx="48" cy="56" r="2.7" fill="#ffe8a3" />
      <circle cx="70" cy="56" r="2.7" fill="#ffe8a3" />
      <circle cx="86" cy="69" r="2.7" fill="#ffe8a3" />
      <circle cx="41" cy="76" r="2.7" fill="#ffe8a3" />
      <circle cx="64" cy="86" r="2.7" fill="#ffe8a3" />
      <circle cx="80" cy="93" r="2.7" fill="#ffe8a3" />
    </svg>
  );
}

function PearSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 130 120" className={className}>
      <path
        d="M73 28 C87 46 88 79 71 94 C55 109 29 101 25 78 C22 57 42 48 48 33 C54 16 67 17 73 28Z"
        fill="#f2c35b"
      />
      <path
        d="M65 24 C72 11 86 10 96 17"
        fill="none"
        stroke="#5f8f3a"
        strokeLinecap="round"
        strokeWidth="6"
      />
      <path
        d="M78 21 C93 17 103 22 106 34 C92 38 82 32 78 21Z"
        fill="#7dbd58"
      />
    </svg>
  );
}

function PeaPodSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 110" className={className}>
      <path
        d="M15 58 C40 24 113 24 137 58 C110 91 42 92 15 58Z"
        fill="#93c572"
      />
      <path
        d="M25 58 C58 45 98 45 128 58"
        fill="none"
        stroke="#5f8f3a"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <circle cx="54" cy="57" r="10" fill="#5fba54" />
      <circle cx="76" cy="55" r="10" fill="#68c95f" />
      <circle cx="98" cy="57" r="10" fill="#5fba54" />
    </svg>
  );
}

function LeafSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 110" className={className}>
      <path
        d="M16 72 C41 24 100 14 135 45 C102 91 49 102 16 72Z"
        fill="#7dbd58"
      />
      <path
        d="M29 72 C62 56 95 46 125 45 M59 58 L52 38 M80 51 L75 31 M98 46 L98 27"
        fill="none"
        stroke="#4d8b36"
        strokeLinecap="round"
        strokeWidth="5"
      />
    </svg>
  );
}

function LeafStemSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 680" className={className}>
      <path
        d="M78 668 C63 548 67 446 91 344 C112 252 110 145 82 16"
        fill="none"
        stroke="#5f8f3a"
        strokeLinecap="round"
        strokeWidth="14"
      />
      <path
        d="M70 590 C25 558 10 501 35 452 C82 478 98 537 70 590Z"
        fill="#a7d77b"
      />
      <path
        d="M86 505 C129 468 149 414 134 363 C89 385 66 445 86 505Z"
        fill="#92c96e"
      />
      <path
        d="M82 392 C34 357 20 300 44 250 C92 280 108 341 82 392Z"
        fill="#b7d66b"
      />
      <path
        d="M96 286 C138 248 152 195 132 147 C91 173 71 235 96 286Z"
        fill="#8fcf68"
      />
      <path
        d="M82 176 C40 144 27 95 47 52 C91 78 105 129 82 176Z"
        fill="#a7d77b"
      />
      <path
        d="M65 558 C43 520 39 488 35 452 M91 472 C111 432 124 398 134 363 M75 357 C55 318 49 284 44 250 M104 252 C119 215 127 179 132 147 M75 146 C58 111 52 81 47 52"
        fill="none"
        stroke="#6f9e53"
        strokeLinecap="round"
        strokeWidth="6"
      />
    </svg>
  );
}

function FlowerSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 130 120" className={className}>
      <path
        d="M64 108 C64 87 63 70 65 52"
        fill="none"
        stroke="#3f8a43"
        strokeLinecap="round"
        strokeWidth="6"
      />
      <ellipse cx="63" cy="41" rx="16" ry="23" fill="#3b82f6" />
      <ellipse
        cx="63"
        cy="41"
        rx="16"
        ry="23"
        fill="#60a5fa"
        transform="rotate(72 63 41)"
      />
      <ellipse
        cx="63"
        cy="41"
        rx="16"
        ry="23"
        fill="#2563eb"
        transform="rotate(144 63 41)"
      />
      <ellipse
        cx="63"
        cy="41"
        rx="16"
        ry="23"
        fill="#93c5fd"
        transform="rotate(216 63 41)"
      />
      <ellipse
        cx="63"
        cy="41"
        rx="16"
        ry="23"
        fill="#1d4ed8"
        transform="rotate(288 63 41)"
      />
      <circle cx="63" cy="41" r="13" fill="#f2c35b" />
      <path
        d="M62 85 C49 76 38 76 27 83 M68 77 C81 66 94 65 105 72"
        fill="none"
        stroke="#4d8b36"
        strokeLinecap="round"
        strokeWidth="5"
      />
    </svg>
  );
}

function ChrysalisSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 130" className={className}>
      <path
        d="M20 32 C56 18 96 19 122 35"
        fill="none"
        stroke="#7a4e2d"
        strokeLinecap="round"
        strokeWidth="8"
      />
      <path
        d="M71 33 C73 44 73 54 70 64"
        fill="none"
        stroke="#7a4e2d"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <path
        d="M58 56 C44 72 45 104 70 117 C97 103 99 72 83 56 C75 48 66 48 58 56Z"
        fill="#a7d77b"
      />
      <path
        d="M57 71 C69 77 80 77 92 70 M54 88 C69 95 82 95 95 88"
        fill="none"
        stroke="#6f8f2f"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <path
        d="M36 31 C28 21 20 19 12 24 M103 28 C115 20 124 20 132 27"
        fill="none"
        stroke="#7dbd58"
        strokeLinecap="round"
        strokeWidth="6"
      />
    </svg>
  );
}
