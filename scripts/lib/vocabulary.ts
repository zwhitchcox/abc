import path from "path";
import fs from "fs-extra";

const WORDS_PATH = path.join(process.cwd(), "data", "words", "all.md");
const TYC_WORDS_PATH = path.join(process.cwd(), "data", "tyc-words.md");

const GENERATED_SECTION_TITLE = "## From Generated Story Text";
const GENERATED_START = "<!-- generated-story-vocabulary:start -->";
const GENERATED_END = "<!-- generated-story-vocabulary:end -->";

const PROPER_NOUNS_TO_SKIP = new Set([
  "auggie",
  "chase",
  "daddy",
  "dollywood",
  "dragonflier",
  "mommy",
  "paw",
  "patrol",
  "rocco",
  "ryder",
  "skye",
  "zephyr",
  "zuma",
]);

export function extractVocabularyWords(text: string) {
  let words = new Set<string>();
  for (let match of text.matchAll(/\p{L}+(?:['’]\p{L}+)?/gu)) {
    let word = normalizeWord(match[0]);
    if (!word) continue;
    words.add(word);
  }
  return Array.from(words).sort();
}

export async function addStoryTextToVocabulary(text: string) {
  await addWordsToGeneratedVocabulary(extractVocabularyWords(text));
}

export async function addWordsToGeneratedVocabulary(words: string[]) {
  await fs.ensureFile(WORDS_PATH);
  let [allText, tycText] = await Promise.all([
    fs.readFile(WORDS_PATH, "utf8").catch(() => defaultWordsFile()),
    fs.readFile(TYC_WORDS_PATH, "utf8").catch(() => ""),
  ]);

  let generatedRange = findGeneratedRange(allText);
  let existingGenerated = generatedRange
    ? parseBulletWords(generatedRange.body)
    : new Set<string>();
  let knownOutsideGenerated = parseBulletWords(
    generatedRange
      ? allText.slice(0, generatedRange.start) + allText.slice(generatedRange.end)
      : allText,
  );
  let knownTyc = parseKnownWords(tycText);
  let generatedWords = new Set(existingGenerated);

  for (let raw of words) {
    let word = normalizeWord(raw);
    if (!word) continue;
    if (knownTyc.has(word)) continue;
    if (knownOutsideGenerated.has(word)) continue;
    if (PROPER_NOUNS_TO_SKIP.has(word)) continue;
    generatedWords.add(word);
  }

  for (let word of Array.from(generatedWords)) {
    if (knownTyc.has(word) || knownOutsideGenerated.has(word) || PROPER_NOUNS_TO_SKIP.has(word)) {
      generatedWords.delete(word);
    }
  }

  let nextSection = buildGeneratedSection(Array.from(generatedWords).sort());
  let nextText = generatedRange
    ? allText.slice(0, generatedRange.start) + nextSection + allText.slice(generatedRange.end)
    : `${allText.trimEnd()}\n\n${nextSection}`;

  await fs.writeFile(WORDS_PATH, `${nextText.trimEnd()}\n`);
}

function normalizeWord(raw: string) {
  let word = raw
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/^'+|'+$/g, "");
  word = word.replace(/'s$/, "");
  if (!word || word.length === 1) return "";
  return word;
}

function parseKnownWords(text: string) {
  let words = new Set<string>();
  for (let match of text.matchAll(/\p{L}+(?:['’]\p{L}+)?/gu)) {
    let word = normalizeWord(match[0]);
    if (!word) continue;
    words.add(word);
  }
  return words;
}

function parseBulletWords(text: string) {
  let words = new Set<string>();
  for (let line of text.split(/\r?\n/)) {
    let match = line.match(/^\s*-\s+(.+?)\s*$/);
    if (!match) continue;
    let value = match[1];
    if (!value) continue;
    let word = normalizeWord(value);
    if (!word) continue;
    words.add(word);
  }
  return words;
}

function findGeneratedRange(text: string) {
  let startMarker = text.indexOf(GENERATED_START);
  let endMarker = text.indexOf(GENERATED_END);
  if (startMarker === -1 || endMarker === -1 || endMarker < startMarker) {
    return null;
  }
  let sectionStart = text.lastIndexOf(GENERATED_SECTION_TITLE, startMarker);
  let start = sectionStart === -1 ? startMarker : sectionStart;
  let end = endMarker + GENERATED_END.length;
  while (text[end] === "\n") end += 1;
  return {
    start,
    end,
    body: text.slice(startMarker + GENERATED_START.length, endMarker),
  };
}

function buildGeneratedSection(words: string[]) {
  let body = words.length
    ? words.map((word) => `- ${word}`).join("\n")
    : "_No generated-story-only words yet._";
  return `${GENERATED_SECTION_TITLE}\n\n${GENERATED_START}\n${body}\n${GENERATED_END}\n`;
}

function defaultWordsFile() {
  return `# Extra Words — All

These words are approved for future custom stories in addition to the cumulative
TYC list in \`data/tyc-words.md\`.
`;
}
