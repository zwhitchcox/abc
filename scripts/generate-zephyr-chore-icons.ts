import "dotenv/config";
import path from "path";
import fs from "fs-extra";
import {
  resolveStyle,
  resolveCharacter,
  generateScene,
  type ImageSize,
} from "./lib/asset-cache";
import { STYLE_CLEAN_PRINT_CARTOON, CHAR_ZEPHYR_TIGER_CARTOON } from "./lib/characters";

// Output straight into the zephyr app's public folder so the chore chart can
// reference /chores/<id>.png.
const OUT_DIR = path.join(
  process.cwd(),
  "..",
  "zwhitchcox.dev",
  "apps",
  "zephyr",
  "public",
  "chores",
);

const PRINT_CLEAR =
  "Clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast. Plain solid white background, nothing else in the frame. The single character is Zephyr Tiger: a small friendly cartoon tiger cub with orange fur, black stripes, a cream tummy, big friendly dark eyes and a happy smile. Draw exactly one tiger. No text, no words, no letters, no labels, no border.";

const CHORES: Array<{ id: string; prompt: string }> = [
  {
    id: "breakfast",
    prompt: `${PRINT_CLEAR} Zephyr Tiger happily eating a simple bowl of breakfast cereal at a little table with a spoon, smiling.`,
  },
  {
    id: "tidy",
    prompt: `${PRINT_CLEAR} Zephyr Tiger cheerfully picking up toys and dropping a toy into a basket, a couple of simple toys around, tidying up.`,
  },
  {
    id: "dishwasher",
    prompt: `${PRINT_CLEAR} Zephyr Tiger loading a plate into an open dishwasher in a simple kitchen, helping with the dishes, smiling.`,
  },
  {
    id: "rocky",
    prompt: `${PRINT_CLEAR} Zephyr Tiger walking a happy little brown dog on a leash, going for a run together outside, both smiling.`,
  },
  {
    id: "read",
    prompt: `${PRINT_CLEAR} Zephyr Tiger sitting and reading an open picture book, looking delighted.`,
  },
  {
    id: "garbage",
    prompt: `${PRINT_CLEAR} Zephyr Tiger carrying a tied-up garbage bag with both paws to take out the trash, smiling proudly.`,
  },
];

const SIZE: ImageSize = "1024x1024";

async function main() {
  await fs.ensureDir(OUT_DIR);
  console.log("Resolving style + Zephyr Tiger reference…");
  const styleRef = await resolveStyle(STYLE_CLEAN_PRINT_CARTOON);
  const charRef = await resolveCharacter(CHAR_ZEPHYR_TIGER_CARTOON, styleRef);
  console.log("Assets ready.\n");

  for (const chore of CHORES) {
    const outPath = path.join(OUT_DIR, `${chore.id}.png`);
    if (await fs.pathExists(outPath)) {
      console.log(`  ${chore.id}: already exists, skipping`);
      continue;
    }
    console.log(`  ${chore.id}: generating…`);
    await generateScene({
      prompt: chore.prompt,
      references: [styleRef.referencePath, charRef.referencePath],
      outPath,
      size: SIZE,
      quality: "high",
    });
    console.log(`  ${chore.id}: done → ${outPath}`);
  }
  console.log("\nAll chore icons generated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
