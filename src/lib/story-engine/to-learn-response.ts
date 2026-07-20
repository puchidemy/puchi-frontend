import type {
  GetStoryResponse,
  LearnActivitySummary,
  LearnCityStorySummary,
  LearnScene,
  LearnStoryDetail,
} from "@/lib/learn-api";
import type { CompiledActivity, CompiledScene, CompiledStoryPackage } from "./types";

function localizedTitle(
  title: { vi: string; en?: string },
  preferEn = true,
): string {
  if (preferEn && title.en) return title.en;
  return title.vi;
}

function narrationPlain(scene: CompiledScene): string {
  return scene.sentences
    .filter((s) => s.kind === "narration")
    .map((s) => s.text)
    .join(" ");
}

function dialogueJson(scene: CompiledScene): unknown {
  const turns = scene.sentences
    .filter((s) => s.kind === "dialogue")
    .map((s) => ({
      speaker: s.speaker ?? "…",
      text: s.text,
      sentenceId: s.id,
    }));
  return turns.length > 0 ? { turns } : null;
}

function mapActivity(
  activity: CompiledActivity,
  position: number,
): LearnActivitySummary {
  const prompt: Record<string, unknown> = {
    activityId: activity.id,
    type: activity.type,
  };
  if (activity.wordIds) prompt.wordIds = activity.wordIds;
  if (activity.phraseIds) prompt.phraseIds = activity.phraseIds;
  if (activity.grammarIds) prompt.grammarIds = activity.grammarIds;

  return {
    id: activity.id,
    position,
    type: activity.type,
    prompt_json: JSON.stringify(prompt),
  };
}

function assetUrl(
  pkg: CompiledStoryPackage,
  assetId: string | undefined,
): string | null {
  if (!assetId) return null;
  return pkg.assets.find((a) => a.assetId === assetId)?.url ?? null;
}

export function compiledToStorySummary(
  pkg: CompiledStoryPackage,
): LearnCityStorySummary {
  return {
    id: pkg.storyId,
    slug: pkg.storyId.toLowerCase(),
    title: localizedTitle(pkg.title),
    summary: pkg.synopsis,
    cover_url: assetUrl(pkg, pkg.coverAssetId),
    cefr: pkg.level as LearnCityStorySummary["cefr"],
    tags: pkg.tags,
    est_minutes: pkg.estimatedMinutes,
    status: pkg.status === "published" ? "published" : "published",
    progress_status: "not_started",
  };
}

export function compiledToGetStoryResponse(
  pkg: CompiledStoryPackage,
): GetStoryResponse {
  const vocab = pkg.words.slice(0, 8).map((w) => w.surface);
  const grammarFocus = pkg.grammar.slice(0, 4).map((g) => g.title.vi);

  const story: LearnStoryDetail = {
    id: pkg.storyId,
    city_id: `stub-city-${pkg.journeyCitySlug}`,
    city_slug: pkg.journeyCitySlug,
    slug: pkg.storyId.toLowerCase(),
    title: localizedTitle(pkg.title),
    summary: pkg.synopsis,
    cover_url: assetUrl(pkg, pkg.coverAssetId),
    cefr: pkg.level as LearnStoryDetail["cefr"],
    tags: pkg.tags,
    audio_url: null,
    vocab_focus: vocab,
    grammar_focus: grammarFocus,
    est_minutes: pkg.estimatedMinutes,
  };

  const scenes: LearnScene[] = [...pkg.scenes]
    .sort((a, b) => a.order - b.order)
    .map((scene) => ({
      id: scene.id,
      position: scene.order,
      title: localizedTitle(scene.title),
      narration: narrationPlain(scene),
      dialogue_json: dialogueJson(scene),
      illustration_url: assetUrl(pkg, scene.illustrationAssetId),
      audio_url: assetUrl(pkg, scene.audioAssetId),
      progress_status: "not_started" as const,
      activities: scene.activities.map((a, i) => mapActivity(a, i + 1)),
    }));

  return {
    story,
    scenes,
    progress_status: "not_started",
  };
}
