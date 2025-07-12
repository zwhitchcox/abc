import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import { chromium } from "@playwright/test";

interface Topic {
  name: string;
  items: string[];
}

interface Config {
  topics: Topic[];
  imagesPerItem?: number;
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const protocol = url.startsWith("https") ? https : http;

    const request = protocol.get(url, (response) => {
      // Check if it's an image
      const contentType = response.headers["content-type"] || "";
      if (!contentType.startsWith("image/")) {
        file.close();
        fs.unlink(filepath, () => {});
        reject(new Error("Not an image"));
        return;
      }

      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    });

    request.on("error", (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });

    request.setTimeout(10000, () => {
      request.destroy();
      fs.unlink(filepath, () => {});
      reject(new Error("Download timeout"));
    });
  });
}

async function downloadImagesForItem(
  page: any,
  topic: string,
  item: string,
  baseDir: string,
  imagesPerItem: number,
  itemNumber: number,
  totalItems: number,
  stats: { downloadedCount: number; totalNeeded: number },
) {
  const itemDir = path.join(baseDir, item.toLowerCase().replace(/\s+/g, "-"));

  if (!fs.existsSync(itemDir)) {
    fs.mkdirSync(itemDir, { recursive: true });
  }

  // Check existing images
  const existingImages = fs
    .readdirSync(itemDir)
    .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));

  if (existingImages.length >= imagesPerItem) {
    console.log(`  ✓ ${item}: Already has ${existingImages.length} images`);
    return;
  }

  const needed = imagesPerItem - existingImages.length;
  console.log(`\n  📸 ${item} (${itemNumber}/${totalItems})`);
  console.log(
    `     Already has: ${existingImages.length} | Need: ${needed} more`,
  );

  try {
    // Use Bing Images as it's more scraping-friendly
    const searchQuery = `${item} ${topic} photo`;
    await page.goto(
      `https://www.bing.com/images/search?q=${encodeURIComponent(searchQuery)}&FORM=HDRSC2`,
    );

    // Wait for images to load
    await page.waitForSelector("img.mimg", { timeout: 10000 });

    // Scroll to load more images
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(1000);
    }

    // Get image URLs
    const imageData = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll("a.iusc"));
      return images
        .map((link) => {
          try {
            const m = link.getAttribute("m");
            if (m) {
              const data = JSON.parse(m) as { murl?: string; turl?: string };
              return data.murl || data.turl;
            }
          } catch (e) {
            console.error(`    ✗ Error parsing image data: ${e}`);
          }
          return null;
        })
        .filter(
          (url) =>
            url && (url.startsWith("http://") || url.startsWith("https://")),
        );
    });

    // Download images
    let downloaded = existingImages.length;
    for (let i = 0; i < imageData.length && downloaded < imagesPerItem; i++) {
      const url = imageData[i];
      if (!url) continue;

      try {
        const urlObj = new URL(url);
        const extension = path.extname(urlObj.pathname) || ".jpg";
        const filename = `${item.toLowerCase().replace(/\s+/g, "-")}-${downloaded + 1}${extension}`;
        const filepath = path.join(itemDir, filename);

        // Skip if file already exists
        if (fs.existsSync(filepath)) {
          downloaded++;
          continue;
        }

        await downloadImage(url, filepath);
        downloaded++;
        stats.downloadedCount++;

        // Show progress
        const downloadProgress =
          stats.totalNeeded > 0
            ? Math.round((stats.downloadedCount / stats.totalNeeded) * 100)
            : 100;

        console.log(
          `    ✓ Downloaded: ${filename} | Progress: ${stats.downloadedCount}/${stats.totalNeeded} images (${downloadProgress}%)`,
        );
      } catch {
        // Silent fail, try next image
      }
    }

    if (downloaded === existingImages.length) {
      console.log(`    ⚠ No new images downloaded for ${item}`);
    }
  } catch (error) {
    console.error(`    ✗ Error processing ${item}: ${error}`);
  }
}

async function downloadAllImages() {
  // Read configuration
  const configPath = path.join(process.cwd(), "scripts", "image-config.json");
  if (!fs.existsSync(configPath)) {
    console.error("Configuration file not found: scripts/image-config.json");
    process.exit(1);
  }

  const config: Config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const imagesPerItem = config.imagesPerItem || 3;

  // Create base images directory
  const imagesBaseDir = path.join(process.cwd(), "images");
  if (!fs.existsSync(imagesBaseDir)) {
    fs.mkdirSync(imagesBaseDir, { recursive: true });
  }

  // Calculate total items and what needs downloading
  let totalItems = 0;
  let totalNeeded = 0;
  let totalExisting = 0;

  for (const topic of config.topics) {
    totalItems += topic.items.length;
    const topicDir = path.join(
      imagesBaseDir,
      topic.name.toLowerCase().replace(/\s+/g, "-"),
    );

    for (const item of topic.items) {
      const itemDir = path.join(
        topicDir,
        item.toLowerCase().replace(/\s+/g, "-"),
      );
      if (fs.existsSync(itemDir)) {
        const existing = fs
          .readdirSync(itemDir)
          .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file)).length;
        totalExisting += existing;
        totalNeeded += Math.max(0, imagesPerItem - existing);
      } else {
        totalNeeded += imagesPerItem;
      }
    }
  }

  console.log("📊 Download Summary");
  console.log("==================");
  console.log(`Total items: ${totalItems}`);
  console.log(`Images per item: ${imagesPerItem}`);
  console.log(`Total images needed: ${totalItems * imagesPerItem}`);
  console.log(`Already downloaded: ${totalExisting}`);
  console.log(`Need to download: ${totalNeeded}`);
  console.log("");

  if (totalNeeded === 0) {
    console.log("✅ All images already downloaded!");
    return;
  }

  const stats = { downloadedCount: 0, totalNeeded };

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
  });

  const startTime = Date.now();

  try {
    for (const topic of config.topics) {
      console.log(`\n📁 Processing topic: ${topic.name}`);
      console.log("=".repeat(30));
      const topicDir = path.join(
        imagesBaseDir,
        topic.name.toLowerCase().replace(/\s+/g, "-"),
      );

      if (!fs.existsSync(topicDir)) {
        fs.mkdirSync(topicDir, { recursive: true });
      }

      const page = await context.newPage();

      try {
        let itemNumber = 0;
        for (
          let topicIndex = 0;
          topicIndex < config.topics.indexOf(topic);
          topicIndex++
        ) {
          itemNumber += config.topics[topicIndex].items.length;
        }

        for (let i = 0; i < topic.items.length; i++) {
          const item = topic.items[i];
          itemNumber++;
          await downloadImagesForItem(
            page,
            topic.name,
            item,
            topicDir,
            imagesPerItem,
            itemNumber,
            totalItems,
            stats,
          );

          // Add delay between items
          await page.waitForTimeout(2000);
        }
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  const duration = Math.round((Date.now() - startTime) / 1000);

  console.log("\n" + "=".repeat(50));
  console.log("✅ Download Complete!");
  console.log("=".repeat(50));
  console.log(`Total downloaded: ${stats.downloadedCount} images`);
  console.log(`Total time: ${duration} seconds`);
  console.log(`Images saved to: ${imagesBaseDir}`);

  if (stats.downloadedCount < stats.totalNeeded) {
    console.log(
      `\n⚠️  Warning: Only downloaded ${stats.downloadedCount} out of ${stats.totalNeeded} needed images`,
    );
    console.log("Some images may have failed. Run again to retry.");
  }
}

// Run the script
void downloadAllImages().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
