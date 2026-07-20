/**
 * Validate a Story Package folder against Story Kit v1 rules.
 *
 * Usage: bun scripts/validate-story-package.ts <package-dir>
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const localized = z.object({
  vi: z.string().min(1),
  en: z.string().optional(),
});

const PackageSchema = z
  .object({
    schemaVersion: z.literal(1),
    contentVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
    storyId: z.string().regex(/^[A-Z]{2}-[A-Z]{2}-\d{3}$/),
    locale: z.string().min(2),
    status: z.enum(["draft", "outline", "review", "published", "archived"]),
    title: localized,
    citySlug: z.string().min(1),
    level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
    checksum: z
      .string()
      .regex(/^sha256:[a-f0-9]{64}$/)
      .optional(),
    publishedAt: z.string().datetime().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.status === "published") {
      if (!val.checksum) {
        ctx.addIssue({
          code: "custom",
          message: "published packages require checksum",
          path: ["checksum"],
        });
      }
      if (!val.publishedAt) {
        ctx.addIssue({
          code: "custom",
          message: "published packages require publishedAt",
          path: ["publishedAt"],
        });
      }
    }
  });

const WordSchema = z.object({
  wordId: z.string().regex(/^word\.[a-z0-9]+(?:-[a-z0-9]+)*$/),
  surface: z.string().min(1),
  lemma: z.string().optional(),
  pos: z.string().optional(),
  meaning: z.record(z.string(), z.string()).optional(),
  audioAssetId: z.string().optional(),
  exampleSentenceIds: z.array(z.string()).optional(),
});

const PhraseSchema = z.object({
  phraseId: z.string().regex(/^phrase\.[a-z0-9]+(?:-[a-z0-9]+)*$/),
  surface: z.string().min(1),
  meaning: z.record(z.string(), z.string()).optional(),
  audioAssetId: z.string().optional(),
  exampleSentenceIds: z.array(z.string()).optional(),
});

const GrammarSchema = z.object({
  grammarId: z.string().regex(/^grammar\.[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: localized,
  explanation: z.record(z.string(), z.string()).optional(),
  exampleSentenceIds: z.array(z.string()).optional(),
});

const AssetSchema = z.object({
  assetId: z.string().min(1),
  kind: z.enum(["image", "audio", "other"]),
  path: z.string().optional(),
  mimeType: z.string().optional(),
  sha256: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .optional(),
  durationMs: z.number().int().nonnegative().optional(),
});

const AssetsManifestSchema = z.object({
  schemaVersion: z.literal(1),
  assets: z.array(AssetSchema),
});

type Issue = { level: "error" | "warn"; message: string };

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readYaml(path: string): unknown {
  return parseYaml(readFileSync(path, "utf8"));
}

function main() {
  const dirArg = process.argv[2];
  if (!dirArg) {
    console.error("Usage: bun scripts/validate-story-package.ts <package-dir>");
    process.exit(2);
  }

  const root = resolve(dirArg);
  const issues: Issue[] = [];

  const push = (level: Issue["level"], message: string) => {
    issues.push({ level, message });
  };

  if (!existsSync(root) || !statSync(root).isDirectory()) {
    console.error(`Not a directory: ${root}`);
    process.exit(2);
  }

  const packagePath = join(root, "package.json");
  if (!existsSync(packagePath)) {
    console.error("Missing package.json");
    process.exit(1);
  }

  const pkgResult = PackageSchema.safeParse(readJson(packagePath));
  if (!pkgResult.success) {
    for (const issue of pkgResult.error.issues) {
      push("error", `package.json: ${issue.path.join(".")} — ${issue.message}`);
    }
    report(issues);
    process.exit(1);
  }
  const pkg = pkgResult.data;
  const isOutline = pkg.status === "outline";
  /** draft/outline may list asset paths before media exists; review/published require files */
  const softMissingAssets = isOutline || pkg.status === "draft";

  const storyPath = join(root, "story.yaml");
  if (!existsSync(storyPath)) {
    push("error", "Missing story.yaml");
  }

  let story: Record<string, unknown> | null = null;
  if (existsSync(storyPath)) {
    story = readYaml(storyPath) as Record<string, unknown>;
    if (story.storyId !== pkg.storyId) {
      push(
        "error",
        `story.yaml storyId (${String(story.storyId)}) != package.json (${pkg.storyId})`,
      );
    }
    if (story.citySlug !== pkg.citySlug) {
      push("error", "story.yaml citySlug must match package.json");
    }
    if (story.level !== pkg.level) {
      push("error", "story.yaml level must match package.json");
    }
    if (!story.title || !story.synopsis || !Array.isArray(story.scenes)) {
      push("error", "story.yaml requires title, synopsis, scenes[]");
    }
  }

  const wordsPath = join(root, "content", "words.json");
  const phrasesPath = join(root, "content", "phrases.json");
  const grammarPath = join(root, "content", "grammar.json");

  for (const p of [wordsPath, phrasesPath, grammarPath]) {
    if (!existsSync(p)) push("error", `Missing ${p.slice(root.length + 1)}`);
  }

  const words = existsSync(wordsPath)
    ? z.array(WordSchema).parse(readJson(wordsPath))
    : [];
  const phrases = existsSync(phrasesPath)
    ? z.array(PhraseSchema).parse(readJson(phrasesPath))
    : [];
  const grammar = existsSync(grammarPath)
    ? z.array(GrammarSchema).parse(readJson(grammarPath))
    : [];

  const wordIds = new Set(words.map((w) => w.wordId));
  const phraseIds = new Set(phrases.map((p) => p.phraseId));
  const grammarIds = new Set(grammar.map((g) => g.grammarId));

  let assets: z.infer<typeof AssetSchema>[] = [];
  const manifestPath = join(root, "assets", "manifest.json");
  if (existsSync(manifestPath)) {
    const manifest = AssetsManifestSchema.parse(readJson(manifestPath));
    assets = manifest.assets;
    const seen = new Set<string>();
    for (const a of assets) {
      if (seen.has(a.assetId)) {
        push("error", `Duplicate assetId: ${a.assetId}`);
      }
      seen.add(a.assetId);
      if (a.path) {
        const abs = join(root, "assets", a.path);
        if (!existsSync(abs) && !softMissingAssets) {
          push("error", `Asset file missing: assets/${a.path}`);
        } else if (!existsSync(abs)) {
          push(
            "warn",
            `Asset file missing (${pkg.status} ok): assets/${a.path}`,
          );
        } else if (a.sha256) {
          const hash = createHash("sha256")
            .update(readFileSync(abs))
            .digest("hex");
          if (hash !== a.sha256) {
            push("error", `Checksum mismatch for ${a.assetId}`);
          }
        }
      } else if (!isOutline) {
        push("warn", `Asset ${a.assetId} has no path`);
      }
    }
  } else if (!isOutline) {
    push("error", "Missing assets/manifest.json (required when not outline)");
  }

  const assetIds = new Set(assets.map((a) => a.assetId));

  const scenesDir = join(root, "content", "scenes");
  if (!existsSync(scenesDir)) {
    push("error", "Missing content/scenes/");
  }

  const sceneFiles = existsSync(scenesDir)
    ? readdirSync(scenesDir).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    : [];

  const sceneById = new Map<string, Record<string, unknown>>();
  for (const file of sceneFiles) {
    const scene = readYaml(join(scenesDir, file)) as Record<string, unknown>;
    const id = String(scene.id ?? "");
    if (!id) {
      push("error", `${file}: missing id`);
      continue;
    }
    if (sceneById.has(id)) {
      push("error", `Duplicate scene id: ${id}`);
    }
    sceneById.set(id, scene);

    const narration = scene.narration as
      | Array<{
          id: string;
          words?: Array<{ surface: string; wordId?: string }>;
        }>
      | undefined;
    const dialogue = scene.dialogue as
      | Array<{
          id: string;
          words?: Array<{ surface: string; wordId?: string }>;
        }>
      | undefined;

    const sentenceWordCounts = new Map<string, number>();
    for (const block of [narration, dialogue]) {
      if (!Array.isArray(block)) continue;
      for (const s of block) {
        sentenceWordCounts.set(s.id, s.words?.length ?? 0);
      }
    }

    const phraseAnchors = scene.phraseAnchors as
      | Array<{
          phraseId: string;
          sentenceId: string;
          startWord: number;
          endWord: number;
        }>
      | undefined;

    if (Array.isArray(phraseAnchors)) {
      for (const a of phraseAnchors) {
        if (!phraseIds.has(a.phraseId)) {
          push("error", `Scene ${id}: unknown phraseId ${a.phraseId}`);
        }
        const n = sentenceWordCounts.get(a.sentenceId);
        if (n === undefined) {
          push(
            "error",
            `Scene ${id}: phrase anchor sentenceId ${a.sentenceId} not found`,
          );
          continue;
        }
        if (a.startWord < 0 || a.endWord < a.startWord || a.endWord >= n) {
          push(
            "error",
            `Scene ${id}: phrase ${a.phraseId} span out of range ` +
              `(${a.startWord}-${a.endWord}, words=${n})`,
          );
        }
      }
    }

    const wordAnchors = scene.wordAnchors as
      | Array<{ wordId: string }>
      | undefined;
    if (Array.isArray(wordAnchors)) {
      for (const a of wordAnchors) {
        if (!wordIds.has(a.wordId)) {
          push(
            isOutline ? "warn" : "error",
            `Scene ${id}: wordId ${a.wordId} not in words.json`,
          );
        }
      }
    }

    const grammarAnchors = scene.grammarAnchors as
      | Array<{ grammarId: string }>
      | undefined;
    if (Array.isArray(grammarAnchors)) {
      for (const a of grammarAnchors) {
        if (!grammarIds.has(a.grammarId)) {
          push("error", `Scene ${id}: unknown grammarId ${a.grammarId}`);
        }
      }
    }

    for (const key of ["illustrationAssetId", "audioAssetId", "coverAssetId"]) {
      const assetId = scene[key];
      if (typeof assetId === "string" && assetId && !assetIds.has(assetId)) {
        push(
          isOutline ? "warn" : "error",
          `Scene ${id}: ${key} ${assetId} not in assets manifest`,
        );
      }
    }

    if (!isOutline) {
      if (!Array.isArray(narration) || narration.length === 0) {
        push("error", `Scene ${id}: full package requires narration`);
      }
      const activities = scene.activities;
      if (!Array.isArray(activities) || activities.length === 0) {
        push("error", `Scene ${id}: full package requires activities`);
      }
    }
  }

  if (story && Array.isArray(story.scenes)) {
    const listed = story.scenes as Array<{ id: string; order: number }>;
    const orders = new Set<number>();
    for (const s of listed) {
      if (!sceneById.has(s.id)) {
        push(
          isOutline ? "warn" : "error",
          `story.yaml lists scene ${s.id} but no scene file found`,
        );
      }
      if (orders.has(s.order)) {
        push("error", `Duplicate scene order: ${s.order}`);
      }
      orders.add(s.order);
    }

    if (
      (pkg.status === "published" || pkg.status === "review") &&
      (listed.length < 6 || listed.length > 10)
    ) {
      push(
        "error",
        `status=${pkg.status} requires 6–10 scenes (got ${listed.length})`,
      );
    }
  }

  if (typeof story?.coverAssetId === "string" && story.coverAssetId) {
    if (!assetIds.has(story.coverAssetId)) {
      push(
        isOutline ? "warn" : "error",
        `coverAssetId ${story.coverAssetId} not in assets manifest`,
      );
    }
  }

  for (const w of words) {
    if (w.audioAssetId && !assetIds.has(w.audioAssetId)) {
      push(
        isOutline ? "warn" : "error",
        `words.json: audioAssetId ${w.audioAssetId} missing from manifest`,
      );
    }
  }

  report(issues);
  const errors = issues.filter((i) => i.level === "error");
  process.exit(errors.length ? 1 : 0);
}

function report(issues: Issue[]) {
  if (issues.length === 0) {
    console.log("OK — Story Package valid");
    return;
  }
  for (const i of issues) {
    const tag = i.level === "error" ? "ERROR" : "WARN ";
    console.log(`${tag}  ${i.message}`);
  }
  const errors = issues.filter((x) => x.level === "error").length;
  const warns = issues.filter((x) => x.level === "warn").length;
  console.log(`\n${errors} error(s), ${warns} warning(s)`);
}

main();
