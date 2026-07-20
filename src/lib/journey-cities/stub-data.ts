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
import { GUEST_SOFT_GATE_SCENE_LIMIT } from "@/lib/learn-soft-gate";
import { JOURNEY_CITIES_MAP } from "./cities-config";

/** Stable stub IDs — aligned with learn-service `004_seed_story_mvp.sql`. */
export const STUB_HANOI_STORY_ID = "a2000000-0000-4000-8000-000000000001";
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

const HANOI_STORIES: LearnCityStorySummary[] = [
  {
    id: STUB_HANOI_STORY_ID,
    slug: "pho-morning",
    title: "Morning Phở",
    summary:
      "You wake up hungry in Hà Nội and find a steaming bowl of phở on a quiet street corner.",
    cover_url: null,
    cefr: "A1",
    tags: ["food", "daily", "travel"],
    est_minutes: 8,
    status: "published",
    progress_status: "not_started",
  },
  {
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
  },
];

const PHO_MORNING_SCENES: LearnScene[] = [
  {
    id: "a3000000-0000-4000-8000-000000000001",
    position: 1,
    title: "At the stall",
    narration:
      "Steam rises from a big pot. You smell beef and herbs. A small table waits for you with chopsticks and a spoon.",
    dialogue_json: null,
    illustration_url: null,
    audio_url: null,
    progress_status: "not_started",
    activities: [
      {
        id: "a4000000-0000-4000-8000-000000000001",
        position: 1,
        type: "select",
        prompt_json:
          '{"question":"What food is steaming in the pot?","options":["Phở","Pizza","Sushi","Bread"]}',
      },
      {
        id: "a4000000-0000-4000-8000-000000000002",
        position: 2,
        type: "listen",
        prompt_json:
          '{"prompt":"Type the word you hear for the noodle soup.","hint":"phở"}',
      },
    ],
  },
  {
    id: "a3000000-0000-4000-8000-000000000002",
    position: 2,
    title: "Ordering",
    narration:
      "The cook smiles. You want one hot bowl. You say you want phở. She nods and fills a white bowl.",
    dialogue_json: {
      turns: [
        { speaker: "cook", text: "Phở bò?" },
        { speaker: "you", text: "Vâng, một bát." },
      ],
    },
    illustration_url: null,
    audio_url: null,
    progress_status: "not_started",
    activities: [
      {
        id: "a4000000-0000-4000-8000-000000000003",
        position: 1,
        type: "match",
        prompt_json:
          '{"pairs":[["phở","noodle soup"],["nóng","hot"],["bát","bowl"]]}',
      },
      {
        id: "a4000000-0000-4000-8000-000000000004",
        position: 2,
        type: "select",
        prompt_json:
          '{"question":"How do you ask for one bowl?","options":["Một bát","Hai ly","Ba ổ","Không"]}',
      },
    ],
  },
  {
    id: "a3000000-0000-4000-8000-000000000003",
    position: 3,
    title: "First sip",
    narration:
      "The broth is hot and clear. You add lime and chili. You say thank you. The morning feels perfect.",
    dialogue_json: null,
    illustration_url: null,
    audio_url: null,
    progress_status: "not_started",
    activities: [
      {
        id: "a4000000-0000-4000-8000-000000000005",
        position: 1,
        type: "dictate",
        prompt_json:
          '{"prompt":"Type \\"thank you\\" in Vietnamese as used in the scene."}',
      },
      {
        id: "a4000000-0000-4000-8000-000000000006",
        position: 2,
        type: "select",
        prompt_json:
          '{"question":"How does the broth taste in the story?","options":["Hot and clear","Cold and sweet","Dry and spicy","Salty only"]}',
      },
    ],
  },
];

/** Answer keys for offline stub grading — never returned by GetStory. */
const STUB_ACTIVITY_ANSWERS: Record<
  string,
  { type: string; answer: Record<string, unknown> }
> = {
  "a4000000-0000-4000-8000-000000000001": {
    type: "select",
    answer: { correct: "Phở" },
  },
  "a4000000-0000-4000-8000-000000000002": {
    type: "listen",
    answer: { text: "phở" },
  },
  "a4000000-0000-4000-8000-000000000003": {
    type: "match",
    answer: {
      pairs: [
        ["phở", "noodle soup"],
        ["nóng", "hot"],
        ["bát", "bowl"],
      ],
    },
  },
  "a4000000-0000-4000-8000-000000000004": {
    type: "select",
    answer: { correct: "Một bát" },
  },
  "a4000000-0000-4000-8000-000000000005": {
    type: "dictate",
    answer: { text: "cảm ơn" },
  },
  "a4000000-0000-4000-8000-000000000006": {
    type: "select",
    answer: { correct: "Hot and clear" },
  },
  "a4000000-0000-4000-8000-lake-01": {
    type: "select",
    answer: { correct: "Hoàn Kiếm" },
  },
};

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

const STORY_SCENES: Record<string, LearnScene[]> = {
  [STUB_HANOI_STORY_ID]: PHO_MORNING_SCENES,
  [STUB_LAKE_WALK_STORY_ID]: LAKE_WALK_SCENES,
};

const STORY_CULTURAL: Record<string, string> = {
  [STUB_HANOI_STORY_ID]:
    "In Hà Nội, locals often eat phở standing or on low plastic stools for a quick morning meal.",
  [STUB_LAKE_WALK_STORY_ID]:
    "Hoàn Kiếm Lake is a morning meeting place for locals who walk, chat, and practice tai chi.",
};

function stubCity(slug: string, position: number, mapX: number, mapY: number): LearnCity {
  const meta = CITY_META[slug] ?? { name: slug, blurb: "" };
  const stories = slug === "hanoi" ? HANOI_STORIES : [];
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
  const stories = slug === "hanoi" ? HANOI_STORIES : [];
  return {
    city,
    stories,
    continue_story_id: null,
    recommended_story_ids: stories.length > 0 ? [stories[0]!.id] : [],
  };
}

export function stubGetStory(id: string): GetStoryResponse | null {
  const story = HANOI_STORIES.find((s) => s.id === id);
  if (!story) return null;
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
      vocab_focus:
        story.id === STUB_HANOI_STORY_ID
          ? ["phở", "nóng", "bát", "cảm ơn"]
          : ["hồ", "chào"],
      grammar_focus: story.id === STUB_HANOI_STORY_ID ? ["là", "muốn"] : ["là"],
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

/** Offline grade for stub activities (mirrors learn-service Grade rules). */
export function stubGradeActivity(
  activityId: string,
  payload: Record<string, unknown>,
): boolean {
  const key = STUB_ACTIVITY_ANSWERS[activityId];
  if (!key) return false;
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
  let storyCompleted = false;
  if (scene) {
    const storyId = Object.entries(STORY_SCENES).find(([, list]) =>
      list.some((s) => s.id === sceneId),
    )?.[0];
    if (storyId) {
      const storyScenes = STORY_SCENES[storyId] ?? [];
      // Caller tracks completion; treat last scene as story-ready hint only.
      storyCompleted =
        storyScenes.length > 0 &&
        scene.position === storyScenes[storyScenes.length - 1]!.position;
    }
  }
  return {
    scene_completed: true,
    story_completed: storyCompleted,
    completed_scene_count: completedSceneCount,
    soft_gate: completedSceneCount >= GUEST_SOFT_GATE_SCENE_LIMIT,
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
  return Boolean(STORY_SCENES[storyId]);
}
