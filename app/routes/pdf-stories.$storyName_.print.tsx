import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useSearchParams,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import { useEffect, useMemo } from "react";
import {
  hasStoryTextDecorations,
  StoryTextDecorations,
  StoryTextWraps,
} from "#app/components/story-text-decorations.tsx";
import { cn } from "#app/utils/misc.tsx";
import { loadPdfStoryData } from "#app/utils/pdf-story-content.server.ts";
import { applyTextCase, type TextCase } from "#app/utils/text-case.ts";

interface PageData {
  page: number;
  text: string;
  imageVersion: number;
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { storyName } = params;
  if (!storyName) throw new Response("Story name required", { status: 400 });

  const story = await loadPdfStoryData(storyName);
  const pages: PageData[] = Object.entries(story.imageVersions)
    .map(([page, imageVersion]) => {
      const pageNum = Number.parseInt(page, 10);
      const marker = story.markers.find((m) => m.page === pageNum);
      return {
        page: pageNum,
        text: marker?.text ?? "",
        imageVersion,
      };
    })
    .sort((a, b) => a.page - b.page);

  return json({
    storyName: story.storyName,
    title: story.title,
    pages,
    showText: story.showText,
    layout: story.layout,
    imageStyles: story.imageStyles,
    imageStyleVersions: story.imageStyleVersions,
  });
}

interface Face {
  kind:
    | "cover"
    | "title"
    | "content"
    | "text-only"
    | "image-only"
    | "blank"
    | "back";
  page?: PageData;
  title?: string;
  captionPosition?: "top" | "bottom";
}

interface Sheet {
  sheetIndex: number;
  front: [Face, Face];
  back: [Face, Face];
}

type PrintFormat = "flat" | "booklet";

const PRINT_FORMAT_STORAGE_KEY = "pdf-print-format";
const TEXT_CASE_STORAGE_KEY = "pdf-text-case";
const IMAGE_STYLE_STORAGE_KEY = "pdf-image-style";
const IMAGE_BLEED_STORAGE_KEY = "pdf-print-image-bleed";

function isTextCase(value: string | null): value is TextCase {
  return value === "normal" || value === "lower" || value === "upper";
}

function isPrintFormat(value: string | null): value is PrintFormat {
  return value === "flat" || value === "booklet";
}

function buildImposition(faces: Face[]): Sheet[] {
  const n = faces.length;
  const sheets: Sheet[] = [];
  const numSheets = n / 4;
  for (let k = 0; k < numSheets; k++) {
    sheets.push({
      sheetIndex: k,
      front: [faces[n - 1 - 2 * k]!, faces[2 * k]!],
      back: [faces[2 * k + 1]!, faces[n - 2 - 2 * k]!],
    });
  }
  return sheets;
}

function estimateCaptionLines(text: string) {
  const paragraphs = text
    .trim()
    .split(/\n\n+/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return paragraphs.reduce((total, paragraph, index) => {
    const paragraphBreak = index > 0 ? 1 : 0;
    return (
      total + paragraphBreak + Math.max(1, Math.ceil(paragraph.length / 42))
    );
  }, 0);
}

function canCombineBookletTextAndImage(page: PageData, showText: boolean) {
  const text = page.text.trim();
  if (!showText || !text) return true;

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return estimateCaptionLines(text) <= 5 && wordCount <= 45;
}

function FaceContent({
  face,
  storyName,
  imageStyle,
  imageStyleVersions,
  showText,
  layout,
  small,
  pageNumber,
  numberSide,
  textCase,
  edgeToEdgeImages,
}: {
  face: Face;
  storyName: string;
  imageStyle: string;
  imageStyleVersions: Record<string, Record<string, number>>;
  showText: boolean;
  layout: "caption" | "split";
  small: boolean;
  pageNumber?: number | null;
  numberSide?: "left" | "right";
  textCase: TextCase;
  edgeToEdgeImages: boolean;
}) {
  const pageImageSrc = (page: number, version?: number) => {
    const sp = new URLSearchParams();
    if (version) sp.set("v", String(version));
    if (imageStyle !== "default") sp.set("style", imageStyle);
    const query = sp.toString();
    return `/resources/pdf-images/${storyName}/${String(page).padStart(2, "0")}${
      query ? `?${query}` : ""
    }`;
  };
  const pageVersion = (page: PageData) =>
    imageStyle === "default"
      ? page.imageVersion
      : (imageStyleVersions[imageStyle]?.[String(page.page)] ??
        page.imageVersion);
  const coverVersion = face.page ? pageVersion(face.page) : undefined;
  const numberEl =
    pageNumber != null ? (
      <div
        className={cn(
          "face-page-number",
          numberSide === "left"
            ? "face-page-number-left"
            : "face-page-number-right",
          small && "face-page-number-small",
        )}
      >
        {pageNumber}
      </div>
    ) : null;

  if (face.kind === "blank" || face.kind === "back") {
    return <div className="face-blank">{numberEl}</div>;
  }
  if (face.kind === "title") {
    return (
      <div className="face face-title">
        <img
          src={pageImageSrc(1, coverVersion)}
          alt={face.title ?? ""}
          className="face-title-image"
        />
        <div
          className={cn("face-title-text", small && "face-title-text-small")}
        >
          {applyTextCase(face.title ?? "", textCase)}
        </div>
      </div>
    );
  }
  if (face.kind === "cover") {
    return (
      <div className="face face-cover">
        <div className="face-cover-image-wrap">
          <img
            src={pageImageSrc(1, coverVersion)}
            alt={face.title ?? ""}
            className="face-cover-image"
          />
          <div
            className={cn(
              "face-cover-title",
              small && "face-cover-title-small",
            )}
          >
            {applyTextCase(face.title ?? "", textCase)}
          </div>
        </div>
      </div>
    );
  }
  if (face.kind === "text-only") {
    const p = face.page!;
    const paragraphs = applyTextCase(p.text, textCase).split(/\n\n+/);
    const decorateText = hasStoryTextDecorations(storyName);
    return (
      <div
        className={cn(
          "face face-text-only",
          decorateText && "face-text-decorated",
        )}
      >
        {decorateText ? (
          <StoryTextDecorations
            storyName={storyName}
            page={p.page}
            compact={small}
            print
            textOnly
          />
        ) : null}
        <div
          className={cn(
            "face-text-only-body story-decorated-text",
            decorateText && `story-text-flow story-text-flow-page-${p.page}`,
            small && "face-text-only-body-small",
          )}
        >
          {decorateText ? (
            <StoryTextWraps
              storyName={storyName}
              page={p.page}
              compact={small}
            />
          ) : null}
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        {numberEl}
      </div>
    );
  }
  if (face.kind === "image-only") {
    const p = face.page!;
    return (
      <div
        className={cn(
          "face face-image-only",
          edgeToEdgeImages && "face-image-bleed",
        )}
      >
        <img
          src={pageImageSrc(p.page, pageVersion(p))}
          alt={`Page ${p.page}`}
          className="face-image-only-img"
        />
        {numberEl}
      </div>
    );
  }
  // content
  const p = face.page!;
  const hasText = showText && Boolean(p.text);
  const isStackedBookletContent = small && hasText;
  const isSplit = layout === "split" && !isStackedBookletContent;
  const paragraphs = hasText
    ? applyTextCase(p.text, textCase).split(/\n\n+/)
    : [];
  const captionPosition = face.captionPosition ?? "bottom";
  const decorateText = hasStoryTextDecorations(storyName);
  return (
    <div
      className={cn(
        "face face-content",
        edgeToEdgeImages && "face-image-bleed",
        isStackedBookletContent && "face-content-stacked",
        isStackedBookletContent &&
          (captionPosition === "top"
            ? "face-content-caption-top"
            : "face-content-caption-bottom"),
      )}
    >
      {isSplit && hasText ? (
        <div className="face-split">
          <div
            className={cn("face-split-text", small && "face-split-text-small")}
          >
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="face-split-image">
            <img
              src={pageImageSrc(p.page, pageVersion(p))}
              alt={`Page ${p.page}`}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="face-image-wrap">
            <img
              src={pageImageSrc(p.page, pageVersion(p))}
              alt={`Page ${p.page}`}
              className="face-image"
            />
            {numberEl}
          </div>
          {hasText ? (
            <div
              className={cn(
                "face-caption",
                small && "face-caption-small",
                decorateText && "face-caption-decorated",
              )}
            >
              {decorateText ? (
                <StoryTextDecorations
                  storyName={storyName}
                  page={p.page}
                  compact={small}
                  print
                />
              ) : null}
              <div className="story-decorated-text">
                {paragraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
      {isSplit && hasText ? numberEl : null}
    </div>
  );
}

export default function PdfStoryPrint() {
  const {
    storyName,
    title,
    pages,
    showText,
    imageStyles,
    imageStyleVersions,
  } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const format: PrintFormat =
    searchParams.get("format") === "booklet" ? "booklet" : "flat";
  const isBooklet = format === "booklet";
  const presentationLayout: "caption" | "split" = "caption";
  const isSplit = false;
  const bookletTextPlacement: "separate" | "auto" =
    searchParams.get("bookletText") === "auto" ? "auto" : "separate";
  const bookletPreviewMode: "print" | "reading" =
    isBooklet && searchParams.get("preview") === "reading"
      ? "reading"
      : "print";
  const bleedParam = searchParams.get("bleed");
  const edgeToEdgeImages = bleedParam !== "fit";

  const duplexFlip: "short" | "long" =
    searchParams.get("flip") === "long" ? "long" : "short";
  const rotateBacks = duplexFlip === "long";

  const caseParam = searchParams.get("case");
  const textCase: TextCase = isTextCase(caseParam) ? caseParam : "normal";
  const imageStyleOptions = useMemo(
    () =>
      imageStyles.length ? imageStyles : [{ id: "default", label: "Artwork" }],
    [imageStyles],
  );
  const styleParam = searchParams.get("style");
  const imageStyle = imageStyleOptions.some((style) => style.id === styleParam)
    ? (styleParam ?? "default")
    : "default";

  useEffect(() => {
    try {
      const current = new URLSearchParams(window.location.search);
      const next = new URLSearchParams(current);
      let changed = false;

      if (current.has("format")) {
        localStorage.setItem(PRINT_FORMAT_STORAGE_KEY, format);
      } else {
        const savedFormat = localStorage.getItem(PRINT_FORMAT_STORAGE_KEY);
        if (isPrintFormat(savedFormat) && savedFormat !== format) {
          if (savedFormat === "booklet") next.set("format", "booklet");
          else next.delete("format");
          changed = true;
        }
      }

      if (current.has("case")) {
        localStorage.setItem(TEXT_CASE_STORAGE_KEY, textCase);
      } else {
        const savedTextCase = localStorage.getItem(TEXT_CASE_STORAGE_KEY);
        if (isTextCase(savedTextCase) && savedTextCase !== textCase) {
          if (savedTextCase === "normal") next.delete("case");
          else next.set("case", savedTextCase);
          changed = true;
        }
      }

      if (current.has("style")) {
        localStorage.setItem(IMAGE_STYLE_STORAGE_KEY, imageStyle);
      } else {
        const savedImageStyle = localStorage.getItem(IMAGE_STYLE_STORAGE_KEY);
        if (
          savedImageStyle &&
          imageStyleOptions.some((style) => style.id === savedImageStyle) &&
          savedImageStyle !== imageStyle
        ) {
          if (savedImageStyle === "default") next.delete("style");
          else next.set("style", savedImageStyle);
          changed = true;
        }
      }

      if (current.has("bleed")) {
        const currentBleed = current.get("bleed");
        localStorage.setItem(
          IMAGE_BLEED_STORAGE_KEY,
          edgeToEdgeImages ? "edge" : "fit",
        );
        if (currentBleed !== "edge" && currentBleed !== "fit") {
          next.delete("bleed");
          changed = true;
        }
      } else {
        const savedBleed = localStorage.getItem(IMAGE_BLEED_STORAGE_KEY);
        if (savedBleed === "fit" && edgeToEdgeImages) {
          next.set("bleed", "fit");
          changed = true;
        }
      }

      if (changed) setSearchParams(next, { replace: true });
    } catch {}
  }, [
    edgeToEdgeImages,
    format,
    imageStyle,
    imageStyleOptions,
    setSearchParams,
    textCase,
  ]);

  const setPrintFormat = (nextFormat: PrintFormat) => {
    try {
      localStorage.setItem(PRINT_FORMAT_STORAGE_KEY, nextFormat);
    } catch {}
    const sp = new URLSearchParams(searchParams);
    if (nextFormat === "booklet") sp.set("format", "booklet");
    else sp.delete("format");
    setSearchParams(sp, { replace: true });
  };

  const setPrintTextCase = (nextTextCase: TextCase) => {
    try {
      localStorage.setItem(TEXT_CASE_STORAGE_KEY, nextTextCase);
    } catch {}
    const sp = new URLSearchParams(searchParams);
    if (nextTextCase === "normal") sp.delete("case");
    else sp.set("case", nextTextCase);
    setSearchParams(sp, { replace: true });
  };

  const setPrintImageStyle = (nextImageStyle: string) => {
    try {
      localStorage.setItem(IMAGE_STYLE_STORAGE_KEY, nextImageStyle);
    } catch {}
    const sp = new URLSearchParams(searchParams);
    if (nextImageStyle === "default") sp.delete("style");
    else sp.set("style", nextImageStyle);
    setSearchParams(sp, { replace: true });
  };

  const setPrintImageBleed = (nextEdgeToEdgeImages: boolean) => {
    try {
      localStorage.setItem(
        IMAGE_BLEED_STORAGE_KEY,
        nextEdgeToEdgeImages ? "edge" : "fit",
      );
    } catch {}
    const sp = new URLSearchParams(searchParams);
    if (nextEdgeToEdgeImages) sp.delete("bleed");
    else sp.set("bleed", "fit");
    setSearchParams(sp, { replace: true });
  };

  const printHref = (updates: Record<string, string | null>) => {
    const sp = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value == null) sp.delete(key);
      else sp.set(key, value);
    }
    const query = sp.toString();
    return `/pdf-stories/${storyName}/print${query ? `?${query}` : ""}`;
  };

  const contentPages = pages.slice(1);

  let readingOrder: Face[] = [];
  if (isBooklet) {
    readingOrder.push({ kind: "cover", title, page: pages[0] });
    let combinedPageIndex = 0;
    for (const p of contentPages) {
      const hasPrintableText = showText && p.text.trim().length > 0;
      if (
        hasPrintableText &&
        bookletTextPlacement === "auto" &&
        canCombineBookletTextAndImage(p, showText)
      ) {
        readingOrder.push({
          kind: "content",
          page: p,
          captionPosition: combinedPageIndex % 2 === 0 ? "top" : "bottom",
        });
        combinedPageIndex++;
      } else if (hasPrintableText) {
        readingOrder.push({ kind: "text-only", page: p });
        readingOrder.push({ kind: "image-only", page: p });
      } else {
        readingOrder.push({ kind: "content", page: p });
      }
    }
    while ((readingOrder.length + 1) % 4 !== 0) {
      readingOrder.push({ kind: "blank" });
    }
    readingOrder.push({ kind: "back" });
    while (readingOrder.length % 4 !== 0) {
      readingOrder.push({ kind: "blank" });
    }
  } else {
    readingOrder.push({ kind: "title", title, page: pages[0] });
    for (const p of contentPages) {
      readingOrder.push({ kind: "content", page: p });
    }
  }

  const sheets = isBooklet ? buildImposition(readingOrder) : [];
  const readingPreviewSpreads: Array<[Face, Face]> = [];
  if (isBooklet) {
    readingPreviewSpreads.push([
      { kind: "cover", title, page: pages[0] },
      { kind: "blank" },
    ]);
    let previewCombinedPageIndex = 0;
    for (const p of contentPages) {
      const hasPrintableText = showText && p.text.trim().length > 0;
      if (
        hasPrintableText &&
        bookletTextPlacement === "auto" &&
        canCombineBookletTextAndImage(p, showText)
      ) {
        readingPreviewSpreads.push([
          {
            kind: "content",
            page: p,
            captionPosition:
              previewCombinedPageIndex % 2 === 0 ? "top" : "bottom",
          },
          { kind: "blank" },
        ]);
        previewCombinedPageIndex++;
      } else if (hasPrintableText) {
        readingPreviewSpreads.push([
          { kind: "text-only", page: p },
          { kind: "image-only", page: p },
        ]);
      } else {
        readingPreviewSpreads.push([
          { kind: "content", page: p },
          { kind: "blank" },
        ]);
      }
    }
  }

  const pageSize = isBooklet
    ? "letter landscape"
    : isSplit
      ? "letter landscape"
      : "letter portrait";

  const printMargin = edgeToEdgeImages ? "0in" : isBooklet ? "0.35in" : "0.5in";
  const flatPageWidth = edgeToEdgeImages
    ? isSplit
      ? "11in"
      : "8.5in"
    : isSplit
      ? "10in"
      : "7.5in";
  const flatPageHeight = edgeToEdgeImages
    ? isSplit
      ? "8.5in"
      : "11in"
    : isSplit
      ? "7.5in"
      : "10in";
  const bookletSheetWidth = edgeToEdgeImages ? "11in" : "10.3in";
  const bookletSheetHeight = edgeToEdgeImages ? "8.5in" : "7.8in";

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
				:root {
					--reader-font: 'Andika', 'Comic Neue', 'Comic Sans MS', 'Chalkboard SE', 'Trebuchet MS', system-ui, sans-serif;
				}

				@page {
					size: ${pageSize};
					margin: ${printMargin};
				}
				@media print {
					.no-print { display: none !important; }
					html, body {
						height: auto !important;
						background: white !important;
						margin: 0 !important;
					}
					/* min-h-screen (100vh) wrappers can round up past the last page in
					   some browsers/drivers and emit a trailing blank page. */
					.min-h-screen { min-height: 0 !important; }
					.print-sheet {
						page-break-after: always;
						break-after: page;
						box-shadow: none !important;
						margin: 0 auto !important;
					}
					.print-sheet:last-child {
						page-break-after: auto;
						break-after: auto;
					}
				}

				.face {
					width: 100%;
					height: 100%;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					box-sizing: border-box;
					overflow: hidden;
					padding: 0.2in;
					position: relative;
				}
				.face-blank { width: 100%; height: 100%; position: relative; }

				.face-page-number {
					position: absolute;
					bottom: 0.45in;
					font-family: var(--reader-font);
					font-variant-ligatures: none;
					font-weight: 700;
					color: #57534e;
					font-size: 16pt;
					line-height: 1;
					pointer-events: none;
					background: rgba(255, 255, 255, 0.78);
					border-radius: 999px;
					padding: 0.04in 0.08in;
				}
				.face-page-number-left { left: 0.3in; }
				.face-page-number-right { right: 0.3in; }
				.face-page-number-small { font-size: 10pt; bottom: 0.3in; }
				.face-page-number-small.face-page-number-left { left: 0.14in; }
				.face-page-number-small.face-page-number-right { right: 0.14in; }

				.face-cover, .face-title { gap: 0.25in; }
				.face-title-image {
					max-width: 100%;
					max-height: 75%;
					object-fit: contain;
					border-radius: 0.2in;
				}
				.face-cover-image-wrap {
					position: relative;
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				.face-cover-image {
					max-width: 100%;
					max-height: 100%;
					object-fit: contain;
					border-radius: 0.2in;
				}
				.face-cover-title {
					position: absolute;
					left: 5%;
					right: 5%;
					bottom: 5%;
					text-align: center;
					font-family: var(--reader-font);
					font-variant-ligatures: none;
					font-weight: 800;
					font-size: 36pt;
					line-height: 1.1;
					color: #1c1917;
					background: rgba(255, 255, 255, 0.92);
					padding: 0.18in 0.25in;
					border-radius: 0.18in;
					box-shadow: 0 2px 8px rgba(0,0,0,0.15);
				}
				.face-cover-title-small {
					font-size: 18pt;
					padding: 0.1in 0.15in;
					border-radius: 0.1in;
				}
				.face-title-text {
					font-family: var(--reader-font);
					font-variant-ligatures: none;
					font-weight: 800;
					font-size: 42pt;
					text-align: center;
					color: #1c1917;
					line-height: 1.1;
				}
				.face-title-text-small { font-size: 22pt; }

				.face-text-only {
					padding: 0.3in;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				.face-text-decorated {
					align-items: stretch;
					justify-content: stretch;
					padding: 0.28in 0.34in 0.45in 0.34in;
				}
				.face-text-only-body {
					font-family: var(--reader-font);
					font-variant-ligatures: none;
					font-weight: 600;
					color: #1c1917;
					font-size: 28pt;
					line-height: 1.35;
					max-width: 100%;
				}
				.face-text-only-body p { margin: 0 0 0.2in 0; }
				.face-text-only-body p:last-child { margin-bottom: 0; }
				.face-text-only-body-small { font-size: 16pt; line-height: 1.35; }
				.face-text-only-body-small p { margin: 0 0 0.12in 0; }
				.story-decorated-text {
					position: relative;
					z-index: 1;
				}
				.face-text-decorated .story-decorated-text {
					box-sizing: border-box;
					display: flow-root;
					height: 100%;
					max-width: 100%;
					padding-left: 0.08in;
					padding-right: 0.08in;
					text-align: center;
					width: 100%;
				}
				.story-text-flow {
					padding-top: 2.95in;
				}
				.story-text-flow p {
					position: relative;
					z-index: 1;
				}
				.story-text-wrap {
					display: block;
					opacity: 0.96;
					pointer-events: none;
					shape-image-threshold: 0.08;
					shape-margin: 0.12in;
				}
				.story-text-wrap .story-decor-img,
				.story-text-wrap .story-decor-svg {
					display: block;
					height: 100%;
					object-fit: contain;
					width: 100%;
				}
				.story-text-wrap-left {
					clear: left;
					float: left;
					margin: -2.55in 0.18in 0.1in -0.08in;
				}
				.story-text-wrap-right {
					clear: right;
					float: right;
					margin: -2.5in -0.02in 0.1in 0.18in;
				}
				.story-text-wrap-leaf-stem-left,
				.story-text-wrap-leaf-stem-right {
					height: 6.08in;
					shape-outside: url(/img/story-decorations/little-garden-caterpillar/leaf-stem.png);
					width: 1.48in;
				}
				.story-text-wrap-leaf-stem-left .story-decor-img,
				.story-text-wrap-leaf-stem-right .story-decor-img {
					object-fit: fill;
				}
				.story-text-wrap-leaf-left,
				.story-text-wrap-leaf-right {
					height: 2.6in;
					shape-outside: url(/img/story-decorations/little-garden-caterpillar/leaf.png);
					width: 1.3in;
				}
				.story-text-wrap-fruit-left,
				.story-text-wrap-fruit-right {
					height: 1.45in;
					width: 1.25in;
				}
				.story-text-wrap-fruit-left {
					shape-outside: url(/img/story-decorations/little-garden-caterpillar/strawberry.png);
				}
				.story-text-wrap-fruit-right {
					shape-outside: url(/img/story-decorations/little-garden-caterpillar/pear.png);
				}
				.story-text-wrap-butterfly-right {
					height: 1.55in;
					shape-outside: url(/img/story-decorations/little-garden-caterpillar/butterfly.png);
					width: 1.7in;
				}
				.story-text-wrap-pea-top {
					height: 0.8in;
					shape-outside: url(/img/story-decorations/little-garden-caterpillar/pea-pod.png);
					width: 2in;
				}
				.story-text-wrap-sleepy-bottom {
					height: 1.1in;
					shape-outside: url(/img/story-decorations/little-garden-caterpillar/sleepy-caterpillar.png);
					width: 2.1in;
				}
				.story-text-wrap-chrysalis-top {
					height: 1.7in;
					shape-outside: url(/img/story-decorations/little-garden-caterpillar/chrysalis.png);
					width: 1.2in;
				}
				.face-image-only {
					padding: 0.2in;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				.booklet-face .face-image-only {
					padding-bottom: 0.34in;
				}
				.booklet-face .face-image-only.face-image-bleed {
					padding: 0;
				}
				.face-image-only-img {
					max-width: 100%;
					max-height: 100%;
					object-fit: contain;
					border-radius: 0.2in;
				}

				.face-image-wrap {
					flex: 1 1 auto;
					display: flex;
					align-items: center;
					justify-content: center;
					width: 100%;
					min-height: 0;
					position: relative;
				}
				/* When the number is anchored to the image area (caption layout), a
				   smaller inset is enough — the caption band below already keeps it
				   away from the paper edge, and this keeps it off the caption text. */
				.face-image-wrap .face-page-number {
					bottom: 0.3in;
				}
				.face-image {
					max-width: 100%;
					max-height: 100%;
					object-fit: contain;
				}
				.face-caption {
					flex: 0 0 auto;
					width: 100%;
					text-align: center;
					font-family: var(--reader-font);
					font-variant-ligatures: none;
					font-weight: 700;
					color: #1c1917;
					font-size: 26pt;
					line-height: 1.2;
					padding: 0.15in 0.15in 0.05in 0.15in;
				}
				.face-caption p { margin: 0 0 0.08in 0; }
				.face-caption p:last-child { margin-bottom: 0; }
				.face-caption-small { font-size: 13pt; padding: 0.1in; }
				.face-caption-decorated {
					position: relative;
					overflow: hidden;
					padding-left: 0.65in;
					padding-right: 0.65in;
				}
				.face-caption-small.face-caption-decorated {
					padding-left: 0.5in;
					padding-right: 0.5in;
				}

				.print-text-decor {
					position: absolute;
					inset: 0;
					z-index: 0;
					overflow: hidden;
					pointer-events: none;
				}
				.print-text-decor-art {
					position: absolute;
					display: block;
					opacity: 0.92;
				}
				.story-decor-img,
				.story-decor-svg {
					display: block;
					height: 100%;
					object-fit: contain;
					width: 100%;
				}
				.print-text-decor-text-only .print-text-decor-main {
					left: 0.35in;
					top: 0.32in;
					width: 1.45in;
					height: 1.05in;
				}
				.print-text-decor-text-only .print-text-decor-secondary {
					right: 0.35in;
					top: 0.45in;
					width: 1.05in;
					height: 0.9in;
				}
				.print-text-decor-text-only .print-text-decor-accent {
					left: 0.48in;
					top: 2in;
					width: 0.9in;
					height: 0.72in;
				}
				.print-text-decor-small.print-text-decor-text-only .print-text-decor-main {
					left: 0.3in;
					top: 0.3in;
					width: 1in;
					height: 0.76in;
				}
				.print-text-decor-small.print-text-decor-text-only .print-text-decor-secondary {
					right: 0.3in;
					top: 0.38in;
					width: 0.82in;
					height: 0.68in;
				}
				.print-text-decor-small.print-text-decor-text-only .print-text-decor-accent {
					left: 0.42in;
					top: 1.45in;
					width: 0.68in;
					height: 0.54in;
				}
				.print-text-decor-caption .print-text-decor-main {
					left: 0.05in;
					top: 50%;
					width: 0.48in;
					height: 0.36in;
					transform: translateY(-50%);
				}
				.print-text-decor-caption .print-text-decor-secondary {
					right: 0.05in;
					top: 50%;
					width: 0.42in;
					height: 0.34in;
					transform: translateY(-50%);
				}
				.print-text-decor-caption .print-text-decor-accent {
					display: none;
				}
				.print-text-decor-caption .story-decor-primary {
					left: 0.05in;
					top: 50%;
					width: 0.48in;
					height: 0.36in;
					transform: translateY(-50%);
				}
				.print-text-decor-caption .story-decor-secondary {
					right: 0.05in;
					top: 50%;
					width: 0.42in;
					height: 0.34in;
					transform: translateY(-50%);
				}
				.print-text-decor-caption .story-decor-accent,
				.print-text-decor-caption .story-decor-bottom,
				.print-text-decor-caption .story-decor-corner,
				.print-text-decor-caption .story-decor-side,
				.print-text-decor-caption .story-decor-top,
				.print-text-decor-caption .story-decor-trail {
					display: none;
				}
				.print-text-decor-text-only.story-page-decor-2 .story-decor-primary {
					left: 0.28in;
					top: 0.3in;
					width: 1.7in;
					height: 1.18in;
				}
				.print-text-decor-text-only.story-page-decor-2 .story-decor-side {
					left: -0.78in;
					top: 1.35in;
					width: 3.15in;
					height: 2.15in;
					opacity: 0.72;
					transform: rotate(-78deg);
				}
				.print-text-decor-text-only.story-page-decor-2 .story-decor-bottom {
					left: 0.42in;
					bottom: 1.35in;
					width: 0.72in;
					height: 0.74in;
				}
				.print-text-decor-text-only.story-page-decor-2 .story-decor-top {
					right: 0.42in;
					top: 0.36in;
					width: 0.9in;
					height: 0.64in;
					transform: rotate(-12deg);
				}
				.print-text-decor-text-only.story-page-decor-2 .story-decor-corner {
					right: 0.24in;
					top: 1.18in;
					width: 0.58in;
					height: 0.44in;
					transform: rotate(18deg);
				}
				.print-text-decor-text-only.story-page-decor-3 .story-decor-bottom {
					left: 0.2in;
					bottom: 0.76in;
					width: 1.35in;
					height: 0.9in;
				}
				.print-text-decor-text-only.story-page-decor-3 .story-decor-primary {
					right: 0.38in;
					top: 0.42in;
					width: 1.3in;
					height: 1.18in;
				}
				.print-text-decor-text-only.story-page-decor-3 .story-decor-secondary {
					left: 0.56in;
					top: 0.46in;
					width: 1.05in;
					height: 0.96in;
				}
				.print-text-decor-text-only.story-page-decor-3 .story-decor-accent {
					right: 0.48in;
					top: 1.78in;
					width: 1.15in;
					height: 0.8in;
				}
				.print-text-decor-text-only.story-page-decor-4 .story-decor-primary {
					left: 0.26in;
					top: 0.54in;
					width: 1.75in;
					height: 1.62in;
				}
				.print-text-decor-text-only.story-page-decor-4 .story-decor-bottom {
					right: 0.4in;
					bottom: 0.72in;
					width: 1.45in;
					height: 0.94in;
				}
				.print-text-decor-text-only.story-page-decor-4 .story-decor-side {
					left: -0.42in;
					top: 2.35in;
					width: 2.4in;
					height: 1.55in;
					opacity: 0.64;
					transform: rotate(-64deg);
				}
				.print-text-decor-text-only.story-page-decor-4 .story-decor-corner {
					right: 0.46in;
					top: 0.32in;
					width: 0.65in;
					height: 0.6in;
				}
				.print-text-decor-text-only.story-page-decor-5 .story-decor-primary {
					right: 0.34in;
					top: 0.55in;
					width: 1.7in;
					height: 1.56in;
				}
				.print-text-decor-text-only.story-page-decor-5 .story-decor-side {
					left: -0.35in;
					top: 0.38in;
					width: 2.1in;
					height: 1.48in;
					opacity: 0.7;
					transform: rotate(-48deg);
				}
				.print-text-decor-text-only.story-page-decor-5 .story-decor-top {
					left: 0.48in;
					top: 2.05in;
					width: 1.05in;
					height: 0.72in;
				}
				.print-text-decor-text-only.story-page-decor-5 .story-decor-bottom {
					right: 0.76in;
					bottom: 1.1in;
					width: 0.72in;
					height: 0.72in;
				}
				.print-text-decor-text-only.story-page-decor-6 .story-decor-top {
					left: 0.4in;
					right: 0.4in;
					top: 0.24in;
					width: auto;
					height: 0.95in;
				}
				.print-text-decor-text-only.story-page-decor-6 .story-decor-primary {
					left: 0.28in;
					top: 1.45in;
					width: 1.8in;
					height: 1.06in;
					transform: rotate(-8deg);
				}
				.print-text-decor-text-only.story-page-decor-6 .story-decor-secondary {
					right: 0.34in;
					bottom: 0.86in;
					width: 1.2in;
					height: 0.78in;
				}
				.print-text-decor-text-only.story-page-decor-6 .story-decor-corner {
					right: 0.3in;
					top: 1.55in;
					width: 0.78in;
					height: 0.58in;
				}
				.print-text-decor-text-only.story-page-decor-7 .story-decor-primary {
					left: -0.42in;
					top: 0.42in;
					width: 2.9in;
					height: 2.05in;
					opacity: 0.76;
					transform: rotate(-24deg);
				}
				.print-text-decor-text-only.story-page-decor-7 .story-decor-side {
					right: -0.55in;
					top: 1.8in;
					width: 2.9in;
					height: 2.02in;
					opacity: 0.62;
					transform: rotate(134deg);
				}
				.print-text-decor-text-only.story-page-decor-7 .story-decor-secondary {
					left: 0.82in;
					top: 0.78in;
					width: 1.25in;
					height: 0.82in;
				}
				.print-text-decor-text-only.story-page-decor-7 .story-decor-bottom {
					left: 0.55in;
					bottom: 0.85in;
					width: 1.05in;
					height: 0.68in;
				}
				.print-text-decor-text-only.story-page-decor-8 .story-decor-bottom {
					left: 0.45in;
					right: 0.55in;
					bottom: 0.78in;
					width: auto;
					height: 1.18in;
				}
				.print-text-decor-text-only.story-page-decor-8 .story-decor-primary {
					right: 0.28in;
					top: 0.42in;
					width: 1.7in;
					height: 1.12in;
					transform: rotate(12deg);
				}
				.print-text-decor-text-only.story-page-decor-8 .story-decor-top {
					left: 0.5in;
					top: 0.54in;
					width: 0.72in;
					height: 0.72in;
				}
				.print-text-decor-text-only.story-page-decor-9 .story-decor-primary {
					left: 50%;
					top: 0.2in;
					width: 1.24in;
					height: 1.5in;
					transform: translateX(-50%);
				}
				.print-text-decor-text-only.story-page-decor-9 .story-decor-side {
					left: -0.36in;
					top: 1.2in;
					width: 2.25in;
					height: 1.55in;
					opacity: 0.68;
					transform: rotate(-58deg);
				}
				.print-text-decor-text-only.story-page-decor-9 .story-decor-top {
					right: -0.22in;
					top: 1.26in;
					width: 1.9in;
					height: 1.28in;
					opacity: 0.68;
					transform: rotate(148deg);
				}
				.print-text-decor-text-only.story-page-decor-9 .story-decor-corner {
					right: 0.36in;
					bottom: 0.9in;
					width: 0.8in;
					height: 0.64in;
				}
				.print-text-decor-text-only.story-page-decor-10 .story-decor-primary {
					right: 0.34in;
					top: 0.34in;
					width: 1.75in;
					height: 1.4in;
				}
				.print-text-decor-text-only.story-page-decor-10 .story-decor-side {
					left: -0.5in;
					top: 1.1in;
					width: 2.3in;
					height: 1.58in;
					opacity: 0.64;
					transform: rotate(-64deg);
				}
				.print-text-decor-text-only.story-page-decor-10 .story-decor-bottom {
					left: 0.55in;
					bottom: 0.9in;
					width: 0.76in;
					height: 0.76in;
				}
				.print-text-decor-text-only.story-page-decor-10 .story-decor-trail {
					left: 0.85in;
					top: 0.45in;
					width: 0.82in;
					height: 0.65in;
					opacity: 0.72;
				}

				.face-content-stacked {
					display: grid;
					grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
					align-items: center;
					justify-items: center;
					gap: 0;
				}
				.booklet-face .face-content:not(.face-content-stacked) {
					padding-bottom: 0.34in;
				}
				.face-content-stacked .face-image-wrap {
					width: 100%;
					height: 100%;
					min-height: 0;
				}
				.face-content-stacked .face-image {
					border-radius: 0.14in;
				}
				.face-content-stacked .face-caption {
					align-self: center;
					font-size: 16pt;
					line-height: 1.15;
					padding: 0.02in 0.08in;
				}
				.face-content-stacked .face-caption-decorated {
					padding: 0.02in 0.54in;
				}
				.face-content-stacked .face-caption p { margin: 0; }
				.face-content-caption-top .face-caption { order: 1; }
				.face-content-caption-top .face-image-wrap { order: 2; }
				.face-content-caption-bottom .face-image-wrap { order: 1; }
				.face-content-caption-bottom .face-caption { order: 2; }

				.face-split {
					display: flex;
					flex-direction: row;
					align-items: stretch;
					gap: 0.2in;
					width: 100%;
					height: 100%;
				}
				.face-split-text {
					flex: 1 1 50%;
					display: flex;
					flex-direction: column;
					justify-content: center;
					gap: 0.15in;
					font-family: var(--reader-font);
					font-variant-ligatures: none;
					font-weight: 600;
					color: #1c1917;
					font-size: 20pt;
					line-height: 1.35;
					padding: 0.1in;
				}
				.face-split-text p { margin: 0; }
				.face-split-text-small { font-size: 12pt; gap: 0.08in; }
				.face-split-image {
					flex: 1 1 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					min-width: 0;
				}
				.face-split-image img {
					max-width: 100%;
					max-height: 100%;
					object-fit: contain;
					border-radius: 0.15in;
				}
				.face-image-bleed {
					padding: 0;
				}
				.face-image-bleed .face-cover-image-wrap,
				.face-image-bleed .face-image-wrap,
				.face-image-bleed .face-split-image {
					height: 100%;
					width: 100%;
				}
				.face-image-bleed .face-cover-image,
				.face-image-bleed .face-image-only-img,
				.face-image-bleed .face-image,
				.face-image-bleed .face-split-image img {
					border-radius: 0;
					height: 100%;
					max-height: none;
					max-width: none;
					object-fit: contain;
					width: 100%;
				}
				.face-image-bleed .face-split {
					gap: 0;
				}
				.face-image-bleed .face-split-text {
					box-sizing: border-box;
					padding: 0.3in;
				}
				.face-image-bleed .face-caption {
					box-sizing: border-box;
					padding: 0.18in 0.3in 0.16in 0.3in;
				}
				.face-content-stacked.face-image-bleed .face-caption {
					padding: 0.14in 0.22in;
				}
				.face-content-stacked.face-image-bleed .face-caption-decorated {
					padding-left: 0.58in;
					padding-right: 0.58in;
				}
				.face-image-bleed .face-cover-title {
					bottom: 0.28in;
					left: 0.28in;
					right: 0.28in;
				}
				.flat-page {
					width: ${flatPageWidth};
					height: ${flatPageHeight};
					margin: 0 auto 0.4in auto;
					background: white;
					box-shadow: 0 2px 8px rgba(0,0,0,0.15);
					box-sizing: border-box;
				}

				.booklet-sheet {
					width: ${bookletSheetWidth};
					height: ${bookletSheetHeight};
					margin: 0 auto 0.4in auto;
					background: white;
					box-shadow: 0 2px 8px rgba(0,0,0,0.15);
					box-sizing: border-box;
					position: relative;
					overflow: hidden;
				}
				.booklet-sheet-inner {
					width: 100%;
					height: 100%;
					display: grid;
					grid-template-columns: 1fr 1fr;
					transform-origin: center center;
				}
				.booklet-sheet-rotated .booklet-sheet-inner {
					transform: rotate(180deg);
				}
				.booklet-face {
					width: 100%;
					height: 100%;
					border-left: 1px dashed rgba(0,0,0,0.25);
					position: relative;
					overflow: hidden;
				}
				.booklet-face:first-child { border-left: none; }
				@media print {
					.booklet-face { border-left: none; }
				}
				.booklet-sheet-label {
					position: absolute;
					top: -1.4em;
					left: 0;
					right: 0;
					text-align: center;
					font-family: system-ui, sans-serif;
					font-size: 11pt;
					color: #57534e;
					font-weight: 600;
				}
				@media print {
					.booklet-sheet-label { display: none !important; }
				}

				.booklet-instructions {
					max-width: 7in;
					margin: 0 auto 1in auto;
					padding: 0.4in;
					background: #fffbeb;
					border: 2px solid #fbbf24;
					border-radius: 0.25in;
					font-family: system-ui, sans-serif;
					color: #1c1917;
					line-height: 1.5;
					font-size: 11pt;
				}
				.booklet-instructions h2 {
					margin-top: 0;
					font-size: 14pt;
					font-weight: 700;
				}
				.booklet-instructions ol { padding-left: 1.3em; }
				.booklet-instructions li { margin-bottom: 0.3em; }
				@media print {
					.booklet-instructions { display: none !important; }
				}
			`,
        }}
      />

      <div className="no-print sticky top-0 z-50 flex items-center justify-between gap-3 bg-white px-4 py-3 shadow-md flex-wrap">
        <Link
          to={`/pdf-stories/${storyName}`}
          className="rounded-full bg-stone-200 px-4 py-2 text-sm font-medium hover:bg-stone-300 transition-colors shrink-0"
        >
          ← Back to Book
        </Link>
        <h1 className="text-base sm:text-lg font-bold text-stone-800 truncate flex-1 min-w-0 text-center">
          {title} — {isBooklet ? "Booklet Preview" : "Print Preview"}
        </h1>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="inline-flex rounded-full bg-stone-100 p-1 text-xs font-semibold">
            <Link
              to={printHref({ format: null })}
              onClick={() => {
                setPrintFormat("flat");
              }}
              className={cn(
                "px-3 py-1.5 rounded-full transition-colors",
                !isBooklet
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900",
              )}
            >
              One page per sheet
            </Link>
            <Link
              to={printHref({ format: "booklet" })}
              onClick={() => {
                setPrintFormat("booklet");
              }}
              className={cn(
                "px-3 py-1.5 rounded-full transition-colors",
                isBooklet
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900",
              )}
            >
              Fold &amp; staple booklet
            </Link>
          </div>
          {isBooklet ? (
            <>
              <div
                className="inline-flex rounded-full bg-stone-100 p-1 text-xs font-semibold"
                title="Booklet text and picture placement"
              >
                <Link
                  to={printHref({ bookletText: null })}
                  className={cn(
                    "px-3 py-1.5 rounded-full transition-colors",
                    bookletTextPlacement === "separate"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900",
                  )}
                >
                  Separate text
                </Link>
                <Link
                  to={printHref({ bookletText: "auto" })}
                  className={cn(
                    "px-3 py-1.5 rounded-full transition-colors",
                    bookletTextPlacement === "auto"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900",
                  )}
                >
                  Combine short text
                </Link>
              </div>
              <div
                className="inline-flex rounded-full bg-stone-100 p-1 text-xs font-semibold"
                title="Booklet preview mode"
              >
                <Link
                  to={printHref({ preview: null })}
                  className={cn(
                    "rounded-full px-3 py-1.5 transition-colors",
                    bookletPreviewMode === "print"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900",
                  )}
                >
                  Print sheets
                </Link>
                <Link
                  to={printHref({ preview: "reading" })}
                  className={cn(
                    "rounded-full px-3 py-1.5 transition-colors",
                    bookletPreviewMode === "reading"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900",
                  )}
                >
                  Reading order
                </Link>
              </div>
              <div
                className="inline-flex rounded-full bg-stone-100 p-1 text-xs font-semibold"
                title="Match to your printer's duplex flip direction"
              >
                <Link
                  to={printHref({ flip: null })}
                  className={cn(
                    "px-3 py-1.5 rounded-full transition-colors",
                    !rotateBacks
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900",
                  )}
                >
                  Short-edge flip
                </Link>
                <Link
                  to={printHref({ flip: "long" })}
                  className={cn(
                    "px-3 py-1.5 rounded-full transition-colors",
                    rotateBacks
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900",
                  )}
                >
                  Long-edge flip
                </Link>
              </div>
            </>
          ) : null}
          {imageStyleOptions.length > 1 ? (
            <div
              className="inline-flex rounded-full bg-stone-100 p-1 text-xs font-semibold"
              title="Artwork style"
            >
              {imageStyleOptions.map((style) => (
                <Link
                  key={style.id}
                  to={printHref({
                    style: style.id === "default" ? null : style.id,
                  })}
                  onClick={() => {
                    setPrintImageStyle(style.id);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full transition-colors",
                    imageStyle === style.id
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900",
                  )}
                >
                  {style.label}
                </Link>
              ))}
            </div>
          ) : null}
          <div
            className="inline-flex rounded-full bg-stone-100 p-1 text-xs font-semibold"
            title="Picture print margins"
          >
            <Link
              to={printHref({ bleed: "fit" })}
              onClick={() => {
                setPrintImageBleed(false);
              }}
              className={cn(
                "px-3 py-1.5 rounded-full transition-colors",
                !edgeToEdgeImages
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900",
              )}
            >
              Fit pictures
            </Link>
            <Link
              to={printHref({ bleed: null })}
              onClick={() => {
                setPrintImageBleed(true);
              }}
              className={cn(
                "px-3 py-1.5 rounded-full transition-colors",
                edgeToEdgeImages
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900",
              )}
            >
              Edge pictures
            </Link>
          </div>
          <div
            className="inline-flex rounded-full bg-stone-100 p-1 text-xs font-semibold"
            title="Text case"
          >
            <Link
              to={printHref({ case: null })}
              onClick={() => {
                setPrintTextCase("normal");
              }}
              className={cn(
                "px-3 py-1.5 rounded-full transition-colors",
                textCase === "normal"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900",
              )}
            >
              Aa
            </Link>
            <Link
              to={printHref({ case: "lower" })}
              onClick={() => {
                setPrintTextCase("lower");
              }}
              className={cn(
                "px-3 py-1.5 rounded-full transition-colors",
                textCase === "lower"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900",
              )}
            >
              aa
            </Link>
            <Link
              to={printHref({ case: "upper" })}
              onClick={() => {
                setPrintTextCase("upper");
              }}
              className={cn(
                "px-3 py-1.5 rounded-full transition-colors",
                textCase === "upper"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900",
              )}
            >
              AA
            </Link>
          </div>
          {isBooklet && bookletPreviewMode === "reading" ? (
            <Link
              to={printHref({ preview: null })}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Show print sheets
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                window.print();
              }}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Print / Save PDF
            </button>
          )}
        </div>
      </div>

      {isBooklet && bookletPreviewMode === "reading" ? (
        <div className="min-h-screen bg-stone-200 py-6 print:bg-white print:py-0">
          {readingPreviewSpreads.map((spread, idx) => {
            const renderReadingFace = (
              face: Face,
              numberSide: "left" | "right",
            ) => (
              <FaceContent
                face={face}
                storyName={storyName}
                imageStyle={imageStyle}
                imageStyleVersions={imageStyleVersions}
                showText={showText}
                layout={presentationLayout}
                small={true}
                pageNumber={face.page?.page ?? null}
                numberSide={numberSide}
                textCase={textCase}
                edgeToEdgeImages={edgeToEdgeImages}
              />
            );
            return (
              <div
                key={`reading-spread-${idx}`}
                className="relative mb-8 print:mb-0"
              >
                <div className="booklet-sheet-label print:hidden">
                  Reading spread {idx + 1}
                </div>
                <div className="booklet-sheet print-sheet">
                  <div className="booklet-sheet-inner">
                    <div className="booklet-face">
                      {renderReadingFace(spread[0], "left")}
                    </div>
                    <div className="booklet-face">
                      {renderReadingFace(spread[1], "right")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : isBooklet ? (
        <div className="min-h-screen bg-stone-200 py-6 print:bg-white print:py-0">
          <div className="booklet-instructions">
            <h2>How to print &amp; make the booklet</h2>
            <p style={{ marginTop: 0 }}>
              This produces {sheets.length * 2}{" "}
              {sheets.length * 2 === 1 ? "page" : "pages"} of output (front +
              back of {sheets.length} {sheets.length === 1 ? "sheet" : "sheets"}{" "}
              of letter paper, landscape).
            </p>
            <p
              style={{
                marginTop: 0,
                padding: "0.1in 0.15in",
                background: "#fef3c7",
                borderRadius: "0.1in",
              }}
            >
              <strong>Currently set for:</strong>{" "}
              {rotateBacks
                ? "“Flip on long edge” (back pages are pre-rotated 180°)."
                : "“Flip on short edge” (back pages print in normal orientation)."}{" "}
              {bookletTextPlacement === "auto"
                ? "Short text is combined with the picture when it fits."
                : "Text and pictures print on separate booklet faces."}{" "}
              {edgeToEdgeImages
                ? "Story picture pages are expanded to the sheet edge and may crop."
                : "Pictures are fitted inside normal print margins."}{" "}
              If your first test print comes out upside-down on alternating
              pages, switch the toggle above.
            </p>
            <ol>
              <li>
                Print <strong>double-sided</strong> (duplex) on letter paper in{" "}
                <strong>landscape</strong> orientation. In your printer's duplex
                settings, pick{" "}
                <strong>
                  {rotateBacks
                    ? "“Flip on long edge” / “Long-Edge binding”"
                    : "“Flip on short edge” / “Short-Edge binding”"}
                </strong>{" "}
                to match this preview.
              </li>
              <li>
                <strong>Important:</strong> Make sure “Scale to fit” / “Shrink
                to fit” is OFF — pick “Actual size” or “100%”.
              </li>
              <li>
                No duplex printer? Print all odd-numbered output pages first
                (“Front” sheets below), then flip the stack and feed it back in
                to print the even-numbered pages (“Back” sheets). Keep sheets in
                order.
              </li>
              <li>
                Stack the printed sheets with Sheet 1 on top, Sheet{" "}
                {sheets.length} at the bottom.
              </li>
              <li>
                Fold the whole stack in half along the vertical center line (the
                dashed line in the preview).
              </li>
              <li>
                Staple twice along the fold (saddle-stitch), or sew it with
                needle and thread for a fancier bind. Trim the fore-edge if you
                want it flush.
              </li>
            </ol>
            <p style={{ marginBottom: 0, fontSize: "10pt", color: "#78716c" }}>
              Not sure which flip your printer uses? Print one test sheet both
              ways — whichever gives you right-side-up back pages is correct.
            </p>
          </div>

          {sheets.map((sheet, idx) => {
            const renderFace = (face: Face) => {
              const bookIndex = readingOrder.indexOf(face);
              const showNumber =
                face.kind === "text-only" ||
                face.kind === "image-only" ||
                face.kind === "content";
              // Assign a user-facing number that only counts content pages,
              // starting at 1 (cover and blanks are not numbered).
              let contentNumber: number | null = null;
              if (showNumber && bookIndex >= 0) {
                let n = 0;
                for (let k = 0; k <= bookIndex; k++) {
                  const f = readingOrder[k];
                  if (
                    f?.kind === "text-only" ||
                    f?.kind === "image-only" ||
                    f?.kind === "content"
                  ) {
                    n++;
                  }
                }
                contentNumber = n;
              }
              // Side based on physical position in the booklet:
              // book-index 0 = cover (right, but we don't number it),
              // odd bookIndex = left-side face, even bookIndex = right-side face.
              const numberSide: "left" | "right" | undefined =
                bookIndex >= 0
                  ? bookIndex % 2 === 1
                    ? "left"
                    : "right"
                  : undefined;
              return (
                <FaceContent
                  face={face}
                  storyName={storyName}
                  imageStyle={imageStyle}
                  imageStyleVersions={imageStyleVersions}
                  showText={showText}
                  layout={presentationLayout}
                  small={true}
                  pageNumber={contentNumber}
                  numberSide={numberSide}
                  textCase={textCase}
                  edgeToEdgeImages={edgeToEdgeImages}
                />
              );
            };
            return (
              <div key={`sheet-${idx}`} className="relative mb-8 print:mb-0">
                <div className="booklet-sheet-label print:hidden">
                  Sheet {sheet.sheetIndex + 1} — FRONT (outside)
                </div>
                <div className="booklet-sheet print-sheet">
                  <div className="booklet-sheet-inner">
                    <div className="booklet-face">
                      {renderFace(sheet.front[0])}
                    </div>
                    <div className="booklet-face">
                      {renderFace(sheet.front[1])}
                    </div>
                  </div>
                </div>

                <div
                  className="booklet-sheet-label print:hidden"
                  style={{ marginTop: "0.4in" }}
                >
                  Sheet {sheet.sheetIndex + 1} — BACK (inside)
                  {rotateBacks ? " — rotated 180° for long-edge flip" : ""}
                </div>
                <div
                  className={cn(
                    "booklet-sheet print-sheet mt-8",
                    rotateBacks && "booklet-sheet-rotated",
                  )}
                >
                  <div className="booklet-sheet-inner">
                    <div className="booklet-face">
                      {renderFace(sheet.back[0])}
                    </div>
                    <div className="booklet-face">
                      {renderFace(sheet.back[1])}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="min-h-screen bg-stone-200 py-6 print:bg-white print:py-0">
          {readingOrder.map((face, i) => {
            const showNumber = face.kind === "content";
            let bookPage: number | null = null;
            if (showNumber) {
              let n = 0;
              for (let k = 0; k <= i; k++) {
                if (readingOrder[k]?.kind === "content") n++;
              }
              bookPage = n;
            }
            return (
              <div key={i} className="flat-page print-sheet">
                <FaceContent
                  face={face}
                  storyName={storyName}
                  imageStyle={imageStyle}
                  imageStyleVersions={imageStyleVersions}
                  showText={showText}
                  layout={presentationLayout}
                  small={false}
                  pageNumber={bookPage}
                  numberSide="right"
                  textCase={textCase}
                  edgeToEdgeImages={edgeToEdgeImages}
                />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-stone-900 p-4 text-center">
      <div>
        <h1 className="text-2xl font-bold text-red-600 mb-4">Story Error</h1>
        <p className="mb-4 text-stone-600">
          {isRouteErrorResponse(error)
            ? `${error.status}: ${error.data}`
            : "An unexpected error occurred."}
        </p>
        <a href="/pdf-stories" className="text-blue-600 hover:underline">
          Back to Stories
        </a>
      </div>
    </div>
  );
}
