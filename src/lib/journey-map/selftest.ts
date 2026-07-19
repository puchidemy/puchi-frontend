import { deriveLandmarkViews } from "./derive";
import { resolveChapterAccess } from "./chapter-access";
import { UNIT_1_JOURNEY_MAP } from "./unit-1-config";
import type { LearnSkill } from "@/lib/learn-api";

const skills: LearnSkill[] = [
  {
    id: "22222222-2222-2222-2222-222222222222",
    unit_id: UNIT_1_JOURNEY_MAP.unitId,
    position: 1,
    title: "Greetings",
    lessons: [
      {
        id: "l1",
        skill_id: "22222222-2222-2222-2222-222222222222",
        position: 1,
        title: "A",
        xp_reward: 10,
        required: true,
      },
      {
        id: "l2",
        skill_id: "22222222-2222-2222-2222-222222222222",
        position: 2,
        title: "B",
        xp_reward: 10,
        required: true,
      },
      {
        id: "l3",
        skill_id: "22222222-2222-2222-2222-222222222222",
        position: 3,
        title: "C",
        xp_reward: 10,
        required: true,
      },
    ],
  },
];

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const zero = deriveLandmarkViews(UNIT_1_JOURNEY_MAP, skills, []);
assert(zero[0].status === "unlocked" && zero[0].isCurrent, "0/3 current unlocked");
assert(zero[1].status === "coming_soon", "landmark 2 coming_soon");

const mid = deriveLandmarkViews(UNIT_1_JOURNEY_MAP, skills, ["l1"]);
assert(mid[0].status === "unlocked" && mid[0].isCurrent, "1/3 still unlocked+current");

const done = deriveLandmarkViews(UNIT_1_JOURNEY_MAP, skills, ["l1", "l2", "l3"]);
assert(done[0].status === "completed" && !done[0].isCurrent, "3/3 completed");

assert(
  resolveChapterAccess(UNIT_1_JOURNEY_MAP, zero, "nope").ok === false,
  "bad slug",
);
assert(
  resolveChapterAccess(UNIT_1_JOURNEY_MAP, zero, "bamboo-grove").reason ===
    "coming_soon",
  "coming_soon blocked",
);
assert(resolveChapterAccess(UNIT_1_JOURNEY_MAP, zero, "hoan-kiem").ok, "open ok");

console.log("journey-map selftest OK");
