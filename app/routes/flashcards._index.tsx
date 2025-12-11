import { readdir } from "fs/promises";
import { join } from "path";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardHeader, CardTitle } from "#app/components/ui/card";
import { Icon } from "#app/components/ui/icon";

export async function loader() {
  const imagesDir = process.env.IMAGES_DIR || (
    process.env.NODE_ENV === "production" ? "/data/images" : "./images"
  );

  const topics: { name: string; imageCount: number; thumbnail: string | null }[] = [];

  try {
    const topicDirs = await readdir(imagesDir);

    for (const topic of topicDirs) {
      if (topic.startsWith('.')) continue;

      const topicPath = join(imagesDir, topic);
      let imageCount = 0;
      let thumbnail: string | null = null;

      try {
        const items = await readdir(topicPath);
        for (const item of items) {
          if (item.startsWith('.')) continue;
          const itemPath = join(topicPath, item);
          const images = await readdir(itemPath);
          const validImages = images.filter(img => /\.(jpg|jpeg|png|gif|webp)$/i.test(img));
          imageCount += validImages.length;
          if (!thumbnail && validImages.length > 0) {
            thumbnail = `/images/${topic}/${item}/${validImages[0]}`;
          }
        }
      } catch {}

      if (imageCount > 0) {
        topics.push({ name: topic, imageCount, thumbnail });
      }
    }
  } catch (error) {
    console.error("Error loading topics:", error);
  }

  return json({ topics });
}

export default function FlashcardsIndex() {
  const { topics } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Choose a Topic</h1>
        <p className="text-lg text-muted-foreground">Select a category to start learning</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {topics.map((topic) => (
          <Link
            key={topic.name}
            to={`/flashcards/play?topic=${encodeURIComponent(topic.name)}`}
            className="group block"
          >
            <Card className="h-full overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="aspect-video relative bg-stone-100 dark:bg-stone-800">
                {topic.thumbnail ? (
                  <img
                    src={topic.thumbnail}
                    alt={topic.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-stone-300">
                    <Icon name="camera" className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <CardHeader>
                <CardTitle className="capitalize flex justify-between items-center">
                  {topic.name.replace(/-/g, ' ')}
                  <span className="text-sm font-normal text-muted-foreground bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-full">
                    {topic.imageCount} images
                  </span>
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}

        {/* Mixed Mode Card */}
        <Link to="/flashcards/play?topic=all" className="group block">
          <Card className="h-full overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-dashed border-2">
            <div className="aspect-video relative flex items-center justify-center">
              <div className="flex -space-x-4">
                {topics.slice(0, 3).map((t, i) => (
                  <div key={t.name} className={`w-16 h-16 rounded-full border-4 border-white dark:border-stone-900 overflow-hidden shadow-lg z-${3-i}`}>
                    {t.thumbnail ? (
                      <img src={t.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-stone-200" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Mix Everything
                <Icon name="play" className="w-5 h-5 text-indigo-500" />
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}

