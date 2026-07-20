/** Story Kit v1 compiled read model (player-facing). */

export type LocalizedString = {
  vi: string;
  en?: string;
};

export type CompiledWord = {
  wordId: string;
  surface: string;
  lemma?: string;
  pos?: string;
  meaning?: Record<string, string>;
  audioAssetId?: string;
  exampleSentenceIds?: string[];
};

export type CompiledPhrase = {
  phraseId: string;
  surface: string;
  meaning?: Record<string, string>;
  audioAssetId?: string;
  exampleSentenceIds?: string[];
};

export type CompiledGrammar = {
  grammarId: string;
  title: LocalizedString;
  explanation?: Record<string, string>;
  exampleSentenceIds?: string[];
};

export type CompiledWordToken = {
  surface: string;
  wordId?: string;
};

export type CompiledSentence = {
  id: string;
  kind: "narration" | "dialogue";
  speaker?: string;
  text: string;
  audioAssetId?: string;
  words: CompiledWordToken[];
};

export type CompiledPhraseAnchor = {
  phraseId: string;
  sentenceId: string;
  /** 0-based inclusive word index in this sentence version. */
  startWord: number;
  endWord: number;
};

export type CompiledWordAnchor = {
  wordId: string;
  sentenceId: string;
};

export type CompiledGrammarAnchor = {
  grammarId: string;
  sentenceId: string;
};

export type CompiledActivity = {
  id: string;
  type: string;
  wordIds?: string[];
  phraseIds?: string[];
  grammarIds?: string[];
};

export type CompiledScene = {
  id: string;
  order: number;
  title: LocalizedString;
  illustrationAssetId?: string;
  audioAssetId?: string;
  sentences: CompiledSentence[];
  wordAnchors: CompiledWordAnchor[];
  phraseAnchors: CompiledPhraseAnchor[];
  grammarAnchors: CompiledGrammarAnchor[];
  activities: CompiledActivity[];
};

export type CompiledAsset = {
  assetId: string;
  kind: "image" | "audio" | "other";
  path?: string;
  mimeType?: string;
  durationMs?: number;
  /** Browser URL when media is published under /public; null if missing. */
  url: string | null;
};

export type CompiledObjective = {
  id: string;
  text: LocalizedString;
};

export type CompiledStoryPackage = {
  schemaVersion: 1;
  contentVersion: string;
  storyId: string;
  locale: string;
  status: string;
  /** Package city slug (e.g. ha-noi). */
  citySlug: string;
  /** Journey map slug used by `/learn/city/[citySlug]` (e.g. hanoi). */
  journeyCitySlug: string;
  level: string;
  title: LocalizedString;
  synopsis: string;
  tags: string[];
  estimatedMinutes: number;
  coverAssetId?: string;
  objectives: CompiledObjective[];
  words: CompiledWord[];
  phrases: CompiledPhrase[];
  grammar: CompiledGrammar[];
  assets: CompiledAsset[];
  scenes: CompiledScene[];
};

/** Hit-test result when tapping a token in Read & Listen. */
export type AnchorHit =
  | { kind: "phrase"; phraseId: string; sentenceId: string }
  | { kind: "word"; wordId: string; sentenceId: string };
