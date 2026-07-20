import type {
  LearnCity,
  LearnCityStorySummary,
  GetCityResponse,
  ListCitiesResponse,
  GetStoryResponse,
  LearnScene,
  CompleteSceneResponse,
  CompleteStoryResponse,
} from "@/lib/learn-api";
import { guestRequiresLoginForCity } from "@/lib/learn-soft-gate";
import {
  compiledToGetStoryResponse,
  compiledToStorySummary,
  getCompiledStory,
  isCompiledStory,
} from "@/lib/story-engine";
import { JOURNEY_CITIES_MAP } from "./cities-config";

/** Package story id (Story Kit). Prefer this over legacy UUID stubs. */
export const PACKAGE_HANOI_STORY_ID = "VN-HN-001";

/** @deprecated Legacy seed UUID — kept for lake-walk only. */
export const STUB_HANOI_STORY_ID = PACKAGE_HANOI_STORY_ID;
export const STUB_LAKE_WALK_STORY_ID = "a2222222-2222-7222-8222-222222222222";

const CITY_META: Record<string, { name: string; blurb: string }> = {
  hanoi: {
    name: "Hà Nội",
    blurb: "Capital mornings, lakeside walks, and your first stories.",
  },
  "ha-long": {
    name: "Hạ Long",
    blurb: "Limestone bays and quiet boat rides.",
  },
  hue: {
    name: "Huế",
    blurb: "Imperial courtyards and gentle river days.",
  },
  "hoi-an": {
    name: "Hội An",
    blurb: "Lantern streets and riverside evenings.",
  },
  "da-nang": {
    name: "Đà Nẵng",
    blurb: "Beach mornings and mountain views.",
  },
  hcmc: {
    name: "TP. Hồ Chí Minh",
    blurb: "Busy streets, coffee, and city stories.",
  },
  "can-tho": {
    name: "Cần Thơ",
    blurb: "Floating markets on the Mekong.",
  },
  "phu-quoc": {
    name: "Phú Quốc",
    blurb: "Island beaches and pepper gardens.",
  },
};

function packageHanoiSummary(): LearnCityStorySummary | null {
  const pkg = getCompiledStory(PACKAGE_HANOI_STORY_ID);
  if (!pkg) return null;
  return compiledToStorySummary(pkg);
}

const LAKE_WALK_SUMMARY: LearnCityStorySummary = {
  id: STUB_LAKE_WALK_STORY_ID,
  slug: "lake-walk",
  title: "A Walk by the Lake",
  summary: "Stroll around Hoàn Kiếm and greet the morning.",
  cover_url: null,
  cefr: "A1",
  tags: ["travel", "daily"],
  est_minutes: 6,
  status: "published",
  progress_status: "not_started",
};

function hanoiStories(): LearnCityStorySummary[] {
  const packaged = packageHanoiSummary();
  return packaged ? [packaged, LAKE_WALK_SUMMARY] : [LAKE_WALK_SUMMARY];
}

const LAKE_WALK_SCENES: LearnScene[] = [
  {
    id: "a3000000-0000-4000-8000-lake-001",
    position: 1,
    title: "By the water",
    narration:
      "Early light touches the lake. People walk slowly. You hear birds and soft greetings.",
    dialogue_json: null,
    illustration_url: null,
    audio_url: null,
    progress_status: "not_started",
    activities: [
      {
        id: "a4000000-0000-4000-8000-lake-01",
        position: 1,
        type: "select",
        prompt_json:
          '{"question":"Which lake are you walking by?","options":["Hoàn Kiếm","West Lake","Ba Bể","Trúc Bạch"]}',
      },
    ],
  },
];

/** Answer keys for offline stub grading — never returned by GetStory. */
const STUB_ACTIVITY_ANSWERS: Record<
  string,
  { type: string; answer: Record<string, unknown> }
> = {
  "a4000000-0000-4000-8000-lake-01": {
    type: "select",
    answer: { correct: "Hoàn Kiếm" },
  },
};

function packageScenes(storyId: string): LearnScene[] {
  const pkg = getCompiledStory(storyId);
  if (!pkg) return [];
  return compiledToGetStoryResponse(pkg).scenes;
}

const STORY_SCENES: Record<string, LearnScene[]> = {
  [PACKAGE_HANOI_STORY_ID]: packageScenes(PACKAGE_HANOI_STORY_ID),
  [STUB_LAKE_WALK_STORY_ID]: LAKE_WALK_SCENES,
};

const STORY_CULTURAL: Record<string, string> = {
  [PACKAGE_HANOI_STORY_ID]:
    "In Hà Nội, locals often eat phở standing or on low plastic stools for a quick morning meal.",
  [STUB_LAKE_WALK_STORY_ID]:
    "Hoàn Kiếm Lake is a morning meeting place for locals who walk, chat, and practice tai chi.",
};

function stubCity(slug: string, position: number, mapX: number, mapY: number): LearnCity {
  const meta = CITY_META[slug] ?? { name: slug, blurb: "" };
  const stories = slug === "hanoi" ? hanoiStories() : [];
  return {
    id: `stub-city-${slug}`,
    slug,
    name: meta.name,
    position,
    map_x: mapX,
    map_y: mapY,
    cover_url: null,
    blurb: meta.blurb,
    story_count: stories.length,
    completed_story_count: 0,
  };
}

export function stubListCities(): ListCitiesResponse {
  return {
    cities: JOURNEY_CITIES_MAP.cities.map((pin) =>
      stubCity(pin.slug, pin.position, pin.hotspot.x, pin.hotspot.y),
    ),
  };
}

export function stubGetCity(slug: string): GetCityResponse | null {
  const pin = JOURNEY_CITIES_MAP.cities.find((c) => c.slug === slug);
  if (!pin) return null;
  const city = stubCity(slug, pin.position, pin.hotspot.x, pin.hotspot.y);
  const stories = slug === "hanoi" ? hanoiStories() : [];
  return {
    city,
    stories,
    continue_story_id: null,
    recommended_story_ids: stories.length > 0 ? [stories[0]!.id] : [],
  };
}

export function stubGetStory(id: string): GetStoryResponse | null {
  if (isCompiledStory(id)) {
    const pkg = getCompiledStory(id);
    return pkg ? compiledToGetStoryResponse(pkg) : null;
  }

  if (id !== STUB_LAKE_WALK_STORY_ID) return null;
  const story = LAKE_WALK_SUMMARY;
  return {
    story: {
      id: story.id,
      city_id: "stub-city-hanoi",
      city_slug: "hanoi",
      slug: story.slug,
      title: story.title,
      summary: story.summary,
      cover_url: story.cover_url,
      cefr: story.cefr,
      tags: story.tags,
      audio_url: null,
      vocab_focus: ["hồ", "chào"],
      grammar_focus: ["là"],
      est_minutes: story.est_minutes,
    },
    scenes: STORY_SCENES[story.id] ?? [],
    progress_status: story.progress_status ?? "not_started",
  };
}

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim();
}

function pairsEqual(a: [string, string][], b: [string, string][]): boolean {
  if (a.length !== b.length) return false;
  const used = new Array(b.length).fill(false);
  for (const p of a) {
    const idx = b.findIndex(
      (q, i) => !used[i] && q[0] === p[0] && q[1] === p[1],
    );
    if (idx < 0) return false;
    used[idx] = true;
  }
  return true;
}

/**
 * Offline grade for stub activities.
 * Package Sprint-1 types (read_listen, vocabulary, …) pass through as correct
 * so scene completion / soft-gate still work before full grading lands.
 */
export function stubGradeActivity(
  activityId: string,
  payload: Record<string, unknown>,
): boolean {
  const key = STUB_ACTIVITY_ANSWERS[activityId];
  // Package Sprint-1 activities have no offline keys — allow continue.
  if (!key) return true;
  if (key.type === "select") {
    const correct = String(key.answer.correct ?? "");
    return normalizeText(String(payload.answer ?? "")) === normalizeText(correct);
  }
  if (key.type === "match") {
    const expected = (key.answer.pairs ?? []) as [string, string][];
    const got = (payload.pairs ?? []) as [string, string][];
    return pairsEqual(expected, got);
  }
  if (key.type === "listen" || key.type === "dictate") {
    const expected = String(key.answer.text ?? "");
    return normalizeText(String(payload.text ?? "")) === normalizeText(expected);
  }
  return false;
}

export function stubStartActivity(sceneId: string): { attempt_id: string } {
  return { attempt_id: `stub-attempt-${sceneId}` };
}

export function stubCompleteScene(
  sceneId: string,
  completedSceneCount: number,
): CompleteSceneResponse {
  const scenes = Object.values(STORY_SCENES).flat();
  const scene = scenes.find((s) => s.id === sceneId);
  const storyId = Object.entries(STORY_SCENES).find(([, list]) =>
    list.some((s) => s.id === sceneId),
  )?.[0];
  let storyCompleted = false;
  if (scene && storyId) {
    const storyScenes = STORY_SCENES[storyId] ?? [];
    storyCompleted =
      storyScenes.length > 0 &&
      scene.position === storyScenes[storyScenes.length - 1]!.position;
  }
  const citySlug =
    (storyId ? stubGetStory(storyId)?.story.city_slug : undefined) ?? "hanoi";

  return {
    scene_completed: true,
    story_completed: storyCompleted,
    completed_scene_count: completedSceneCount,
    // Soft-gate is city-based (non-Hanoi), not scene-count.
    soft_gate: guestRequiresLoginForCity(citySlug),
  };
}

export function stubCompleteStory(storyId: string): CompleteStoryResponse {
  const detail = stubGetStory(storyId);
  const est = detail?.story.est_minutes ?? 8;
  return {
    xp: 20,
    story_completed: true,
    summary: {
      vocab_focus: detail?.story.vocab_focus ?? [],
      grammar_focus: detail?.story.grammar_focus ?? [],
      listening_seconds: Math.floor((est * 60) / 2),
      cultural_fact: STORY_CULTURAL[storyId] ?? "",
    },
  };
}

export function stubSceneBelongsToKnownStory(sceneId: string): boolean {
  return Object.values(STORY_SCENES)
    .flat()
    .some((s) => s.id === sceneId);
}

export function stubStoryKnown(storyId: string): boolean {
  return Boolean(STORY_SCENES[storyId]) || isCompiledStory(storyId);
}
