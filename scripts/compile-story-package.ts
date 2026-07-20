/**
 * Compile a Story Package folder into a player read-model JSON.
 *
 * Usage:
 *   bun scripts/compile-story-package.ts <package-dir> [out-file]
 *
 * Default out:
 *   src/lib/story-engine/compiled/{storyId}.json
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";

type Localized = { vi: string; en?: string };

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readYaml(path: string): unknown {
  return parseYaml(readFileSync(path, "utf8"));
}

function asLocalized(value: unknown, fallback = ""): Localized {
  if (value && typeof value === "object" && "vi" in value) {
    const o = value as Localized;
    return { vi: String(o.vi), ...(o.en ? { en: String(o.en) } : {}) };
  }
  if (typeof value === "string") return { vi: value };
  return { vi: fallback };
}

/** Package citySlug → journey map slug used by /learn/city/[slug]. */
const JOURNEY_CITY_SLUG: Record<string, string> = {
  "ha-noi": "hanoi",
};

type RawSentence = {
  id: string;
  text?: string;
  speaker?: string;
  audioAssetId?: string;
  words?: Array<{ surface: string; wordId?: string }>;
};

type RawScene = {
  id: string;
  order: number;
  title?: unknown;
  illustrationAssetId?: string;
  audioAssetId?: string;
  narration?: RawSentence[];
  dialogue?: RawSentence[];
  wordAnchors?: Array<{ wordId: string; sentenceId: string }>;
  phraseAnchors?: Array<{
    phraseId: string;
    sentenceId: string;
    startWord: number;
    endWord: number;
  }>;
  grammarAnchors?: Array<{ grammarId: string; sentenceId: string }>;
  activities?: Array<{
    id: string;
    type: string;
    wordIds?: string[];
    phraseIds?: string[];
    grammarIds?: string[];
  }>;
};

function compilePackage(root: string) {
  const pkg = readJson(join(root, "package.json")) as {
    schemaVersion: number;
    contentVersion: string;
    storyId: string;
    locale: string;
    status: string;
    title: Localized;
    citySlug: string;
    level: string;
  };

  const story = readYaml(join(root, "story.yaml")) as {
    storyId: string;
    title: unknown;
    synopsis: string;
    citySlug: string;
    level: string;
    tags?: string[];
    estimatedMinutes?: number;
    coverAssetId?: string;
    objectives?: Array<{ id: string; text: unknown }>;
    scenes: Array<{ id: string; order: number; title?: unknown }>;
  };

  const words = readJson(join(root, "content", "words.json")) as unknown[];
  const phrases = readJson(join(root, "content", "phrases.json")) as unknown[];
  const grammar = readJson(join(root, "content", "grammar.json")) as unknown[];

  let assets: Array<{
    assetId: string;
    kind: "image" | "audio" | "other";
    path?: string;
    mimeType?: string;
    durationMs?: number;
    url: string | null;
  }> = [];

  const manifestPath = join(root, "assets", "manifest.json");
  if (existsSync(manifestPath)) {
    const manifest = readJson(manifestPath) as {
      assets: Array<{
        assetId: string;
        kind: "image" | "audio" | "other";
        path?: string;
        mimeType?: string;
        durationMs?: number;
      }>;
    };
    assets = (manifest.assets ?? []).map((a) => {
      const abs = a.path ? join(root, "assets", a.path) : null;
      const publicPath = a.path
        ? `/stories/${pkg.storyId}/assets/${a.path}`
        : null;
      const exists = abs ? existsSync(abs) : false;
      return {
        assetId: a.assetId,
        kind: a.kind,
        path: a.path,
        mimeType: a.mimeType,
        durationMs: a.durationMs,
        // Only expose URL when file exists under package (copied to public later).
        url: exists && publicPath ? publicPath : null,
      };
    });
  }

  const scenesDir = join(root, "content", "scenes");
  const sceneFiles = readdirSync(scenesDir).filter(
    (f) => f.endsWith(".yaml") || f.endsWith(".yml"),
  );
  const sceneById = new Map<string, RawScene>();
  for (const file of sceneFiles) {
    const scene = readYaml(join(scenesDir, file)) as RawScene;
    sceneById.set(scene.id, scene);
  }

  const listed = [...(story.scenes ?? [])].sort((a, b) => a.order - b.order);
  const scenes = listed.map((meta) => {
    const raw = sceneById.get(meta.id);
    if (!raw) {
      throw new Error(`Scene listed in story.yaml but missing file: ${meta.id}`);
    }

    const sentences = [
      ...(raw.narration ?? []).map((s) => ({
        id: s.id,
        kind: "narration" as const,
        text: s.text ?? "",
        audioAssetId: s.audioAssetId,
        words: (s.words ?? []).map((w) => ({
          surface: w.surface,
          wordId: w.wordId,
        })),
      })),
      ...(raw.dialogue ?? []).map((s) => ({
        id: s.id,
        kind: "dialogue" as const,
        speaker: s.speaker,
        text: s.text ?? "",
        audioAssetId: s.audioAssetId,
        words: (s.words ?? []).map((w) => ({
          surface: w.surface,
          wordId: w.wordId,
        })),
      })),
    ];

    return {
      id: raw.id,
      order: raw.order ?? meta.order,
      title: asLocalized(raw.title ?? meta.title),
      illustrationAssetId: raw.illustrationAssetId,
      audioAssetId: raw.audioAssetId,
      sentences,
      wordAnchors: raw.wordAnchors ?? [],
      phraseAnchors: raw.phraseAnchors ?? [],
      grammarAnchors: raw.grammarAnchors ?? [],
      activities: (raw.activities ?? []).map((a) => ({
        id: a.id,
        type: a.type,
        ...(a.wordIds ? { wordIds: a.wordIds } : {}),
        ...(a.phraseIds ? { phraseIds: a.phraseIds } : {}),
        ...(a.grammarIds ? { grammarIds: a.grammarIds } : {}),
      })),
    };
  });

  const journeyCitySlug =
    JOURNEY_CITY_SLUG[pkg.citySlug] ?? pkg.citySlug;

  return {
    schemaVersion: 1 as const,
    contentVersion: pkg.contentVersion,
    storyId: pkg.storyId,
    locale: pkg.locale,
    status: pkg.status,
    citySlug: pkg.citySlug,
    journeyCitySlug,
    level: pkg.level,
    title: asLocalized(pkg.title ?? story.title),
    synopsis: String(story.synopsis ?? "").trim(),
    tags: story.tags ?? [],
    estimatedMinutes: story.estimatedMinutes ?? 15,
    coverAssetId: story.coverAssetId,
    objectives: (story.objectives ?? []).map((o) => ({
      id: o.id,
      text: asLocalized(o.text),
    })),
    words,
    phrases,
    grammar,
    assets,
    scenes,
  };
}

function main() {
  const dirArg = process.argv[2];
  if (!dirArg) {
    console.error(
      "Usage: bun scripts/compile-story-package.ts <package-dir> [out-file]",
    );
    process.exit(2);
  }

  const root = resolve(dirArg);
  if (!existsSync(root)) {
    console.error(`Not found: ${root}`);
    process.exit(2);
  }

  const compiled = compilePackage(root);
  const defaultOut = resolve(
    join(
      "src",
      "lib",
      "story-engine",
      "compiled",
      `${compiled.storyId}.json`,
    ),
  );
  const outPath = process.argv[3] ? resolve(process.argv[3]) : defaultOut;

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(compiled, null, 2)}\n`, "utf8");
  console.log(
    `Compiled ${compiled.storyId} v${compiled.contentVersion} → ${outPath}`,
  );
  console.log(`  scenes: ${compiled.scenes.length}`);
  console.log(
    `  words/phrases/grammar: ${compiled.words.length}/${compiled.phrases.length}/${compiled.grammar.length}`,
  );
}

main();
