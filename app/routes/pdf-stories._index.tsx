import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { listPdfStories } from "#app/utils/pdf-story-content.server.ts";
import { applyTextCase, type TextCase } from "#app/utils/text-case.ts";

export async function loader() {
  const stories = await listPdfStories();

  const seriesOrder = [
    "Tiger Stories",
    "Harry Potter",
    "Paw Patrol",
    "Other Stories",
  ];
  const storiesBySeries = stories.reduce<Record<string, typeof stories>>(
    (groups, story) => {
      const group = groups[story.series] ?? [];
      group.push(story);
      groups[story.series] = group;
      return groups;
    },
    {},
  );
  const folders = Object.entries(storiesBySeries)
    .sort(([a], [b]) => {
      const aIndex = seriesOrder.indexOf(a);
      const bIndex = seriesOrder.indexOf(b);
      if (aIndex !== -1 || bIndex !== -1) {
        return (
          (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
          (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
        );
      }
      return a.localeCompare(b);
    })
    .map(([series, folderStories]) => ({
      series,
      stories: folderStories.sort((a, b) => {
        if (a.chapter !== undefined || b.chapter !== undefined) {
          return (
            (a.chapter ?? Number.MAX_SAFE_INTEGER) -
            (b.chapter ?? Number.MAX_SAFE_INTEGER)
          );
        }
        return a.title.localeCompare(b.title);
      }),
    }));

  return json({ folders });
}

export default function PdfStoriesIndex() {
  const { folders } = useLoaderData<typeof loader>();
  const [textCase, setTextCase] = useState<TextCase>("normal");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pdf-text-case");
      if (saved === "lower" || saved === "upper" || saved === "normal") {
        setTextCase(saved);
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <h1 className="mb-8 text-center font-serif text-4xl font-bold text-amber-900">
        {applyTextCase("Picture Books", textCase)}
      </h1>

      {folders.length === 0 ? (
        <p className="text-center text-amber-700">
          No stories yet. Process a PDF to get started!
        </p>
      ) : (
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          {folders.map((folder) => (
            <section
              key={folder.series}
              aria-labelledby={`folder-${folder.series.replace(/\s+/g, "-")}`}
            >
              <div className="mb-4 flex items-baseline justify-between border-b border-amber-300 pb-2">
                <h2
                  id={`folder-${folder.series.replace(/\s+/g, "-")}`}
                  className="font-serif text-2xl font-bold text-amber-950"
                >
                  {applyTextCase(folder.series, textCase)}
                </h2>
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                  {folder.stories.length}{" "}
                  {folder.stories.length === 1 ? "book" : "books"}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {folder.stories.map((story) => (
                  <Link
                    key={story.name}
                    to={`/pdf-stories/${story.name}`}
                    className="group rounded-lg bg-white p-5 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-md bg-amber-100">
                      <img
                        src={`/resources/pdf-images/${story.name}/01`}
                        alt={story.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {story.chapterTitle ? (
                      <p className="mt-4 text-center text-xs font-bold uppercase tracking-wide text-amber-700">
                        {applyTextCase(story.chapterTitle, textCase)}
                      </p>
                    ) : null}
                    <h3 className="mt-2 text-center font-serif text-lg font-semibold text-amber-900 group-hover:text-amber-700">
                      {applyTextCase(story.title, textCase)}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
