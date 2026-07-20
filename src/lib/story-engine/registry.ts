import type { CompiledStoryPackage } from "./types";
import vnHn001 from "./compiled/VN-HN-001.json";

/** In-repo compiled packages available to the player (Sprint 1). */
const PACKAGES: Record<string, CompiledStoryPackage> = {
  "VN-HN-001": vnHn001 as CompiledStoryPackage,
};

export function getCompiledStory(
  storyId: string,
): CompiledStoryPackage | null {
  return PACKAGES[storyId] ?? null;
}

export function listCompiledStoryIds(): string[] {
  return Object.keys(PACKAGES);
}

export function isCompiledStory(storyId: string): boolean {
  return storyId in PACKAGES;
}
