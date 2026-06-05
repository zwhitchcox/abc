import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  hasStoryTextDecorations,
  StoryTextDecorations,
} from "#app/components/story-text-decorations.tsx";
import { cn } from "#app/utils/misc.tsx";
import { loadPdfStoryData } from "#app/utils/pdf-story-content.server.ts";
import { applyTextCase, type TextCase } from "#app/utils/text-case.ts";

export async function loader({ params }: LoaderFunctionArgs) {
  const { storyName } = params;
  if (!storyName) throw new Response("Story name required", { status: 400 });
  return json(await loadPdfStoryData(storyName));
}

export default function PdfStoryPlayer() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL or default to 1
  const initialPageParam = searchParams.get("page");
  const initialPageNumber = initialPageParam
    ? parseInt(initialPageParam, 10)
    : 1;
  const initialPage =
    Number.isFinite(initialPageNumber) &&
    initialPageNumber >= 1 &&
    initialPageNumber <= data.totalPages
      ? initialPageNumber
      : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(data.totalPages);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);

  // Update state when data is available
  useEffect(() => {
    if (data) {
      setTotalPages(data.totalPages);

      // If URL param exists, use it
      if (initialPageParam) {
        const p = parseInt(initialPageParam, 10);
        if (p >= 1 && p <= data.totalPages) {
          setCurrentPage(p);
        }
        setHasRestoredProgress(true);
      }
      // Otherwise try to restore from localStorage
      else if (!hasRestoredProgress) {
        const saved = localStorage.getItem(`pdf-progress-${data.storyName}`);
        if (saved) {
          const p = parseInt(saved, 10);
          if (p >= 1 && p <= data.totalPages) {
            setCurrentPage(p);
          }
        }
        setHasRestoredProgress(true);
      }
    }
  }, [data, initialPageParam, hasRestoredProgress]);

  // Save progress
  useEffect(() => {
    if (data?.storyName) {
      localStorage.setItem(
        `pdf-progress-${data.storyName}`,
        currentPage.toString(),
      );
    }
  }, [currentPage, data?.storyName]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right",
  );
  const [textCase, setTextCase] = useState<TextCase>("normal");
  const [showImage, setShowImage] = useState(true);
  const showImageRef = useRef(showImage);
  showImageRef.current = showImage;
  const [hideImageOnPageChange, setHideImageOnPageChange] = useState(false);
  const [tapZonesNavigate, setTapZonesNavigate] = useState(true);
  const imageStyles = useMemo(
    () =>
      data.imageStyles?.length
        ? data.imageStyles
        : [{ id: "default", label: "Artwork" }],
    [data.imageStyles],
  );
  const [imageStyle, setImageStyle] = useState(imageStyles[0]?.id ?? "default");

  // Load saved text-case preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pdf-text-case");
      if (saved === "lower" || saved === "upper" || saved === "normal") {
        setTextCase(saved);
      }
      setHideImageOnPageChange(
        localStorage.getItem("pdf-hide-image-on-page-change") === "true",
      );
      setTapZonesNavigate(
        localStorage.getItem("pdf-tap-zones-navigate") !== "false",
      );
      const savedImageStyle = localStorage.getItem("pdf-image-style");
      if (
        savedImageStyle &&
        imageStyles.some((style) => style.id === savedImageStyle)
      ) {
        setImageStyle(savedImageStyle);
      }
    } catch {}
  }, [imageStyles]);

  useEffect(() => {
    if (!imageStyles.some((style) => style.id === imageStyle)) {
      setImageStyle(imageStyles[0]?.id ?? "default");
    }
  }, [imageStyle, imageStyles]);

  // Save reader preferences
  useEffect(() => {
    try {
      localStorage.setItem("pdf-text-case", textCase);
    } catch {}
  }, [textCase]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "pdf-hide-image-on-page-change",
        String(hideImageOnPageChange),
      );
    } catch {}
  }, [hideImageOnPageChange]);

  useEffect(() => {
    try {
      localStorage.setItem("pdf-tap-zones-navigate", String(tapZonesNavigate));
    } catch {}
  }, [tapZonesNavigate]);

  useEffect(() => {
    try {
      localStorage.setItem("pdf-image-style", imageStyle);
    } catch {}
  }, [imageStyle]);

  const applyCase = useCallback(
    (text: string | null | undefined): string => applyTextCase(text, textCase),
    [textCase],
  );

  const cycleTextCase = useCallback(() => {
    setTextCase((prev) =>
      prev === "normal" ? "lower" : prev === "lower" ? "upper" : "normal",
    );
  }, []);

  const { storyName, title, markers, showText, layout, imageVersions } = data;

  const currentMarker = markers.find((m) => m.page === currentPage);
  const hasAudio = currentMarker && currentMarker.duration > 0;
  const hasAnyAudio = markers.some((m) => m.duration > 0);

  const pageStr = String(currentPage).padStart(2, "0");
  const defaultImageVersion = imageVersions[String(currentPage)];
  const imageVersion =
    imageStyle === "default"
      ? defaultImageVersion
      : (data.imageStyleVersions[imageStyle]?.[String(currentPage)] ??
        defaultImageVersion);
  const imageSearchParams = new URLSearchParams();
  if (imageVersion) imageSearchParams.set("v", String(imageVersion));
  if (imageStyle !== "default") imageSearchParams.set("style", imageStyle);
  const imageQuery = imageSearchParams.toString();
  const imageSrc = `/resources/pdf-images/${storyName}/${pageStr}${
    imageQuery ? `?${imageQuery}` : ""
  }`;
  const schematicVersion = data.schematicVersions[String(currentPage)];
  const schematicSrc = schematicVersion
    ? `/resources/pdf-schematics/${storyName}/${pageStr}?v=${schematicVersion}`
    : null;
  const audioSrc = hasAudio
    ? `/resources/pdf-audio/${storyName}/${currentPage}`
    : undefined;

  // Sync URL with state
  useEffect(() => {
    setSearchParams({ page: currentPage.toString() }, { replace: true });
  }, [currentPage, setSearchParams]);

  const goToPage = useCallback(
    (page: number) => {
      let targetPage = page;
      if (page > totalPages) targetPage = 1;
      else if (page < 1) targetPage = totalPages;
      setSlideDirection(page > currentPage ? "right" : "left");
      setCurrentPage(targetPage);
      if (targetPage !== currentPage && hideImageOnPageChange) {
        setShowImage(false);
      }
    },
    [currentPage, hideImageOnPageChange, totalPages],
  );

  const goForward = useCallback(() => {
    if (!showImageRef.current) {
      setShowImage(true);
      return;
    }
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const toggleControls = useCallback(() => {
    setShowControls((prev) => !prev);
  }, []);

  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // If the user is selecting/highlighting text, don't treat this as a nav tap.
      const selection =
        typeof window !== "undefined" ? window.getSelection() : null;
      if (selection && selection.toString().length > 0) return;

      // If the click target is text content (inside a <p> in our reader), let
      // the browser handle selection rather than navigating.
      const target = e.target as HTMLElement;
      if (target.closest('[data-story-text="true"]')) return;

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clientX = "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
      const x = clientX - rect.left;
      const width = rect.width;

      if (!tapZonesNavigate) {
        toggleControls();
        return;
      }

      // Left 30% -> Previous
      if (x < width * 0.3) {
        goToPage(currentPage - 1);
      }
      // Right 30% -> Next
      else if (x > width * 0.7) {
        goForward();
      }
      // Center 40% -> Toggle Controls
      else {
        toggleControls();
      }
    },
    [currentPage, goForward, goToPage, tapZonesNavigate, toggleControls],
  );

  useEffect(() => {
    if (audioRef.current) {
      // Reset audio for new page
      audioRef.current.load();
      if (hasAudio) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          void playPromise.catch(() => {
            setIsPlaying(false);
          });
        }
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    }
  }, [currentPage, hasAudio]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && e.shiftKey) {
        e.preventDefault();
        goToPage(currentPage - 1);
      } else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goForward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPage(currentPage - 1);
      } else if (e.key === "Escape") {
        navigate("/pdf-stories");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, goForward, goToPage, navigate]);

  const isCover = currentPage === 1;
  const coverTitle = isCover ? title : null;
  const previousPage = currentPage <= 1 ? totalPages : currentPage - 1;
  const nextPage = currentPage >= totalPages ? 1 : currentPage + 1;
  const hasPageText = Boolean(showText && currentMarker?.text);
  // Keep split mode only for pages that need the extra schematic panel. Story
  // artwork itself now uses the full-page reader presentation for every book,
  // regardless of older per-book layout metadata.
  const isSplit = Boolean(
    schematicSrc && layout === "split" && hasPageText && !isCover,
  );
  const hasCaption = Boolean(
    (hasPageText && !isSplit) || (isCover && coverTitle),
  );
  const showCaptionBand = hasCaption && showImage;
  const captionText = isCover && coverTitle ? coverTitle : currentMarker?.text;
  // Story pages with visible reading text should keep the reader chrome on a
  // single light surface instead of mixing a black stage with a white text band.
  const useLightBg = isSplit || hasCaption;
  const decorateText = hasStoryTextDecorations(storyName);
  const showTextDecorations = decorateText && showImage;
  return (
    <div
      className={cn(
        "fixed inset-0 flex flex-col overflow-hidden font-early-reader",
        useLightBg ? "bg-amber-50 text-stone-900" : "bg-black text-white",
      )}
    >
      {/* Image / Content Area (tap target for navigation) — also hosts top + bottom overlays.
			    Default cursor is auto so users can select/highlight text. Image and empty
			    regions fall back to default cursor behavior. */}
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center"
        onClick={handleTap}
      >
        {isSplit ? (
          <div
            key={currentPage}
            className={cn(
              "relative h-full w-full px-4 md:px-8 lg:px-12 py-16 md:py-20 transition-all duration-300 ease-out",
              showImage
                ? "flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-10 lg:gap-16"
                : "flex items-center justify-center",
              slideDirection === "right"
                ? "animate-in slide-in-from-right-8 fade-in"
                : "animate-in slide-in-from-left-8 fade-in",
            )}
          >
            {/* Text panel. When the picture is hidden, the text becomes the whole page. */}
            <div
              className={cn(
                "flex items-center justify-center min-h-0 min-w-0",
                showImage ? "flex-1" : "h-full w-full flex-col gap-8",
              )}
            >
              <div
                data-story-text="true"
                className={cn(
                  "relative w-full overflow-hidden font-early-reader text-stone-900 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug cursor-text select-text",
                  showTextDecorations &&
                    "rounded-3xl bg-white/80 px-8 py-6 shadow-sm ring-1 ring-amber-200/70 sm:px-12",
                  showImage
                    ? "max-w-xl text-center md:text-left"
                    : "max-w-3xl text-center",
                )}
              >
                {showTextDecorations ? (
                  <StoryTextDecorations
                    storyName={storyName}
                    page={currentPage}
                    compact
                  />
                ) : null}
                <div className="relative z-10 space-y-5 md:space-y-7">
                  {applyCase(currentMarker!.text)
                    .split(/\n\n+/)
                    .map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                </div>
              </div>
            </div>
            {showImage ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-0 min-w-0 gap-3">
                <div
                  className={cn(
                    "relative min-h-0 w-full flex items-center justify-center",
                    schematicSrc ? "flex-[3]" : "flex-1",
                  )}
                >
                  <img
                    src={imageSrc}
                    alt={`Page ${currentPage}`}
                    className="max-h-full max-w-full object-contain rounded-3xl shadow-2xl transition-opacity duration-200"
                    draggable={false}
                  />
                </div>
                {schematicSrc ? (
                  <div
                    data-story-text="true"
                    className="flex-[2] min-h-0 w-full flex items-center justify-center rounded-2xl border border-amber-200 bg-white p-2 shadow-lg transition-opacity duration-200"
                  >
                    <img
                      src={schematicSrc}
                      alt={`Circuit schematic for page ${currentPage}`}
                      className="max-h-full max-w-full object-contain"
                      draggable={false}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <div
            key={currentPage}
            className={cn(
              "relative flex items-center justify-center h-full w-full transition-all duration-300 ease-out",
              showImage ? "p-0" : "p-6 sm:p-10",
              slideDirection === "right"
                ? "animate-in slide-in-from-right-8 fade-in"
                : "animate-in slide-in-from-left-8 fade-in",
            )}
          >
            {showImage ? (
              <img
                src={imageSrc}
                alt={`Page ${currentPage}`}
                className={cn(
                  "transition-opacity duration-200",
                  isCover
                    ? "max-h-full max-w-full object-contain shadow-2xl"
                    : "h-full w-full object-contain",
                )}
                draggable={false}
              />
            ) : captionText ? (
              <div
                data-story-text="true"
                className="max-w-5xl cursor-text select-text text-center font-early-reader text-4xl font-bold leading-snug text-stone-900 sm:text-5xl md:text-6xl"
              >
                {applyCase(captionText)
                  .split(/\n\n+/)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Top Control Bar */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 p-4 transition-opacity duration-300 z-10 print:hidden",
            useLightBg
              ? "bg-gradient-to-b from-amber-50 to-transparent"
              : "bg-gradient-to-b from-black/80 to-transparent",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/pdf-stories");
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium backdrop-blur-md transition-colors shrink-0",
                useLightBg
                  ? "bg-stone-200 text-stone-900 hover:bg-stone-300"
                  : "bg-black/40 text-white hover:bg-white/20",
              )}
            >
              ← Back
            </button>
            <h1
              className={cn(
                "text-lg font-serif font-bold truncate px-2 flex-1 text-center",
                useLightBg ? "text-stone-900" : "text-shadow-sm",
              )}
            >
              {title}
            </h1>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowImage((v) => !v);
              }}
              aria-label="Toggle picture visibility"
              title={showImage ? "Hide picture (text only)" : "Show picture"}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium backdrop-blur-md transition-colors shrink-0",
                useLightBg
                  ? "bg-stone-200 text-stone-900 hover:bg-stone-300"
                  : "bg-black/40 text-white hover:bg-white/20",
              )}
            >
              {showImage ? (
                // Eye-off icon (picture is shown, click to hide)
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7a12.08 12.08 0 01-3.22 4.56M6.1 6.1C4.07 7.38 2.5 9.27 1 12c1.73 3.89 6 7 11 7 1.91 0 3.7-.46 5.27-1.27"
                  />
                </svg>
              ) : (
                // Eye icon (picture is hidden, click to show)
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setHideImageOnPageChange((v) => {
                  const next = !v;
                  if (next) setShowImage(false);
                  return next;
                });
              }}
              aria-pressed={hideImageOnPageChange}
              aria-label={
                hideImageOnPageChange
                  ? "Stop hiding pictures on new pages"
                  : "Hide pictures on new pages"
              }
              title={
                hideImageOnPageChange
                  ? "Pictures start hidden on each new page"
                  : "Pictures stay visible on new pages"
              }
              className={cn(
                "rounded-full px-3 py-2 text-sm font-bold backdrop-blur-md transition-colors shrink-0 min-w-[2.5rem]",
                hideImageOnPageChange
                  ? useLightBg
                    ? "bg-stone-900 text-white hover:bg-stone-700"
                    : "bg-white text-black hover:bg-stone-200"
                  : useLightBg
                    ? "bg-stone-200 text-stone-900 hover:bg-stone-300"
                    : "bg-black/40 text-white hover:bg-white/20",
              )}
            >
              Auto hide
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTapZonesNavigate((v) => !v);
              }}
              aria-pressed={tapZonesNavigate}
              aria-label={
                tapZonesNavigate
                  ? "Turn off page tap navigation"
                  : "Turn on page tap navigation"
              }
              title={
                tapZonesNavigate
                  ? "Left and right page taps navigate"
                  : "Only arrows and the slider navigate"
              }
              className={cn(
                "rounded-full px-3 py-2 text-sm font-bold backdrop-blur-md transition-colors shrink-0 min-w-[2.5rem]",
                tapZonesNavigate
                  ? useLightBg
                    ? "bg-stone-900 text-white hover:bg-stone-700"
                    : "bg-white text-black hover:bg-stone-200"
                  : useLightBg
                    ? "bg-stone-200 text-stone-900 hover:bg-stone-300"
                    : "bg-black/40 text-white hover:bg-white/20",
              )}
            >
              Tap nav
            </button>
            {imageStyles.length > 1 ? (
              <div
                className={cn(
                  "inline-flex rounded-full p-1 text-xs font-bold backdrop-blur-md transition-colors shrink-0",
                  useLightBg
                    ? "bg-stone-200 text-stone-900"
                    : "bg-black/40 text-white",
                )}
                title="Artwork style"
              >
                {imageStyles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageStyle(style.id);
                    }}
                    className={cn(
                      "rounded-full px-3 py-1.5 transition-colors",
                      imageStyle === style.id
                        ? useLightBg
                          ? "bg-white text-stone-900 shadow-sm"
                          : "bg-white text-black shadow-sm"
                        : useLightBg
                          ? "text-stone-700 hover:text-stone-900"
                          : "text-white/80 hover:text-white",
                    )}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cycleTextCase();
              }}
              aria-label={`Text case: ${textCase} (click to change)`}
              title={
                textCase === "normal"
                  ? "Showing text as written · tap for lowercase"
                  : textCase === "lower"
                    ? "Showing text in lowercase · tap for UPPERCASE"
                    : "Showing text in UPPERCASE · tap to restore"
              }
              className={cn(
                "rounded-full px-3 py-2 text-sm font-bold backdrop-blur-md transition-colors shrink-0 min-w-[2.5rem]",
                useLightBg
                  ? "bg-stone-200 text-stone-900 hover:bg-stone-300"
                  : "bg-black/40 text-white hover:bg-white/20",
              )}
            >
              {textCase === "normal"
                ? "Aa"
                : textCase === "lower"
                  ? "aa"
                  : "AA"}
            </button>
            <Link
              to={
                textCase === "normal"
                  ? `/pdf-stories/${storyName}/print`
                  : `/pdf-stories/${storyName}/print?case=${textCase}`
              }
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium backdrop-blur-md transition-colors shrink-0",
                useLightBg
                  ? "bg-stone-200 text-stone-900 hover:bg-stone-300"
                  : "bg-black/40 text-white hover:bg-white/20",
              )}
            >
              Print
            </Link>
          </div>
        </div>
      </div>

      {/* Caption band — sits below the image, above the bottom controls.
			    On the cover (page 1) it always shows the book title. On content
			    pages it shows the page text when the picture is visible. */}
      {showCaptionBand ? (
        <div
          data-story-text="true"
          className={cn(
            "relative shrink-0 overflow-hidden py-5 text-center font-early-reader text-3xl font-bold leading-snug text-stone-900 cursor-text select-text sm:text-4xl md:text-5xl",
            useLightBg
              ? "border-t border-amber-200/60 bg-amber-50"
              : "bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.25)]",
            showTextDecorations
              ? "px-24 py-7 sm:px-32 md:px-44"
              : "px-6",
          )}
        >
          {showTextDecorations ? (
            <StoryTextDecorations
              storyName={storyName}
              page={currentPage}
              compact
            />
          ) : null}
          <span className="relative z-10 mx-auto block max-w-5xl">
            {applyCase(captionText)}
          </span>
        </div>
      ) : null}

      {/* Bottom Control Bar — always below the caption band. */}
      <div
        className={cn(
          "shrink-0 w-full p-4 pb-4 transition-opacity duration-300 print:hidden",
          useLightBg ? "bg-amber-50 text-stone-900" : "bg-black text-white",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {/* Progress Bar */}
          <div className="flex flex-col items-center w-full gap-1">
            <span className="text-xs font-medium opacity-70">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center w-full gap-3">
              <span className="text-[10px] opacity-50">1</span>
              <input
                type="range"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value, 10))}
                onKeyDown={(e) => e.stopPropagation()}
                className={cn(
                  "flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50",
                  useLightBg
                    ? "bg-stone-300 hover:bg-stone-400"
                    : "bg-white/20 hover:bg-white/30",
                )}
              />
              <span className="text-[10px] opacity-50">{totalPages}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-8">
            <Link
              to={`/pdf-stories/${storyName}?page=${previousPage}`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                goToPage(currentPage - 1);
              }}
              className={cn(
                "p-2 rounded-full transition-colors",
                useLightBg ? "hover:bg-stone-200" : "hover:bg-white/10",
              )}
              aria-label="Previous page"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>

            {hasAnyAudio ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (audioRef.current) {
                    if (isPlaying) {
                      audioRef.current.pause();
                      setIsPlaying(false);
                    } else {
                      void audioRef.current.play();
                      setIsPlaying(true);
                    }
                  }
                }}
                className={cn(
                  "p-3 rounded-full shadow-lg hover:scale-105 transition-transform",
                  useLightBg
                    ? "bg-stone-900 text-white"
                    : "bg-white text-black",
                )}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-7 h-7 fill-current pl-0.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            ) : null}

            <Link
              to={`/pdf-stories/${storyName}?page=${nextPage}`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                goForward();
              }}
              className={cn(
                "p-2 rounded-full transition-colors",
                useLightBg ? "hover:bg-stone-200" : "hover:bg-white/10",
              )}
              aria-label="Next page"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {hasAnyAudio ? (
        <audio
          ref={audioRef}
          src={audioSrc}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e) => console.error("Audio Error", e)}
          playsInline
        />
      ) : null}
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white p-4 text-center">
      <div>
        <h1 className="text-2xl font-bold text-red-500 mb-4">Story Error</h1>
        <p className="mb-4 text-gray-300">
          {isRouteErrorResponse(error)
            ? `${error.status}: ${error.data}`
            : "An unexpected error occurred."}
        </p>
        <a href="/pdf-stories" className="text-blue-400 hover:underline">
          Back to Stories
        </a>
      </div>
    </div>
  );
}
