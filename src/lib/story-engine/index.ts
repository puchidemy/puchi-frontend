export type {
  AnchorHit,
  CompiledActivity,
  CompiledAsset,
  CompiledGrammar,
  CompiledPhrase,
  CompiledPhraseAnchor,
  CompiledScene,
  CompiledSentence,
  CompiledStoryPackage,
  CompiledWord,
  CompiledWordToken,
  LocalizedString,
} from "./types";

export {
  getCompiledStory,
  isCompiledStory,
  listCompiledStoryIds,
} from "./registry";

export {
  phraseCoveredIndices,
  phraseIdAtIndex,
  resolveTap,
} from "./resolve-anchors";

export {
  compiledToGetStoryResponse,
  compiledToStorySummary,
} from "./to-learn-response";

import { getCompiledStory } from "./registry";
import type { CompiledScene } from "./types";

export function getCompiledScene(
  storyId: string,
  sceneId: string,
): CompiledScene | null {
  const pkg = getCompiledStory(storyId);
  if (!pkg) return null;
  return pkg.scenes.find((s) => s.id === sceneId) ?? null;
}
