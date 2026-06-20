# Story Book Rules

Rules for **every generated picture book** (not just Zephyr Tiger — all of them).
Follow these whenever generating or regenerating a book in `scripts/`. Created
2026-06-19. A good reference book to imitate is
`data/processed-pdfs/Zephyr-Tiger-Goes-to-the-Zoo`.

## 1. Full-page pictures (booklet format)

- The picture must take up the **entire page** — books print as a fold-and-staple
  booklet, one full-page illustration per page with a short caption.
- In `generateBook(...)`: **do NOT override the full-page defaults.** Leave
  `fullPageImages: true` (the default) → it forces `layout: "caption"` and
  `imageSize: "1024x1536"` (portrait) and prepends the vertical full-page
  composition instruction.
- Do **not** use `layout: "split"` / `imageSize: "1536x1024"` /
  `fullPageImages: false` for storybooks. Split/landscape is only for special
  books (e.g. circuit schematics).

## 2. Reading level — use words he already knows

- These books are for Zephyr, a young early reader. Keep the text **very
  simple**: short sentences (~3–6 words each), common high-frequency sight
  words, and nouns he already knows.
- **Two short sentences per page** (the cover has no text). Lowercase, to match
  the reader and recent books (the reader can re-case on the fly).
- Lean on the known-words vocabulary (`app/routes/_marketing+/words.tsx`):
  animals (cat, dog, cow, pig, tiger, elephant, giraffe…), colors (red, blue,
  green, orange, purple…), shapes, fruits (apple, pear, banana, orange…),
  vehicles (car, bus, train…), household (bed, chair, window…).
- Plus simple sight/decodable words: the, a, is, was, has, had, can, see, saw,
  look, run, ran, go, got, up, down, in, on, big, fun, and, he, she, it, they,
  we, day, help, play, yes, yay, good, so.
- Introduce **at most one or two new words** per book for the topic (e.g.
  "ball", "hoop"), keep them short, and repeat them. Avoid long/abstract words
  (no "basketball", "dribble", "swish", "determined", etc.).

## 3. Content

- Wholesome everyday topics: family outings, practical skills, sports, nature,
  vehicles, reading, building. **No sweets/desserts/candy/treats as the focus or
  reward** (see `AGENTS.md`). Incidental food should be ordinary and balanced.
- ~10 pages including the cover.

## 4. Cast & art style

- The recurring family cast (reuse the cached character references — do not
  redefine): **Zephyr Tiger** (older cub, usually the star), **Auggie Tiger**
  (tiny baby brother; always sitting, held, or carried — he cannot walk),
  **Mommy Tiger** (pretty, white flower, graceful medium build), **Daddy Tiger**
  (tall, relaxed dad build, exactly two front paws). Other casts (e.g. the
  mixed-animal "Animal Friends" family) follow the same simplicity/format rules.
- Style: `STYLE_CLEAN_PRINT_CARTOON` (bold outlines, flat bright colours, simple
  uncluttered background, no text in the image).
- Each prompt should state exactly how many characters appear and which ones, to
  avoid extra/duplicate characters.

## 5. How to generate

1. Copy an existing script in `scripts/` (e.g.
   `generate-zephyr-tiger-basketball-book.ts`) as the template.
2. Keep `generateBook` full-page defaults (don't pass split/landscape).
3. Run via OpenRouter from the monorepo cwd so the OpenAI billing cap is
   bypassed:
   ```sh
   cd zwhitchcox.dev && set -a && . ./.env.production && set +a \
     && ../archive/abc/node_modules/.bin/tsx \
        ../archive/abc/scripts/generate-<book>.ts
   ```
   (`OPENAI_API_KEY` must be present so the client constructs;
   `OPEN_ROUTER_API_KEY` makes the actual image calls go through OpenRouter.)
4. Output lands in `zwhitchcox.dev/data/processed-pdfs/<Folder>/` and shows up
   in the abc app at `/pdf-stories/<Folder>`.
5. If regenerating an existing book with new size/layout, **delete the old
   folder first** — the generator skips pages whose image already exists.

## 6. Printing

- The abc app's `/pdf-stories/:storyName/print` page makes a fold-and-staple
  booklet (saddle-stitch imposition) or a one-page-per-sheet flat printout.
