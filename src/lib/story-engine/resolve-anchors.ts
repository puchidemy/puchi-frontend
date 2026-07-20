import type {
  AnchorHit,
  CompiledPhraseAnchor,
  CompiledSentence,
} from "./types";

/**
 * Phrases take precedence when a word index falls inside a phrase span.
 * Among overlapping phrases, prefer the tightest (shortest) span.
 */
export function resolveTap(
  sentence: CompiledSentence,
  wordIndex: number,
  phraseAnchors: CompiledPhraseAnchor[],
): AnchorHit | null {
  if (wordIndex < 0 || wordIndex >= sentence.words.length) return null;

  const covering = phraseAnchors.filter(
    (a) =>
      a.sentenceId === sentence.id &&
      wordIndex >= a.startWord &&
      wordIndex <= a.endWord,
  );

  if (covering.length > 0) {
    covering.sort(
      (a, b) => a.endWord - a.startWord - (b.endWord - b.startWord),
    );
    const best = covering[0]!;
    return {
      kind: "phrase",
      phraseId: best.phraseId,
      sentenceId: sentence.id,
    };
  }

  const token = sentence.words[wordIndex];
  if (token?.wordId) {
    return {
      kind: "word",
      wordId: token.wordId,
      sentenceId: sentence.id,
    };
  }

  return null;
}

/** Word indices covered by any phrase in this sentence (for highlight). */
export function phraseCoveredIndices(
  sentenceId: string,
  phraseAnchors: CompiledPhraseAnchor[],
): Set<number> {
  const covered = new Set<number>();
  for (const a of phraseAnchors) {
    if (a.sentenceId !== sentenceId) continue;
    for (let i = a.startWord; i <= a.endWord; i++) {
      covered.add(i);
    }
  }
  return covered;
}

/** Map wordIndex → phraseId for the tightest covering phrase (if any). */
export function phraseIdAtIndex(
  sentenceId: string,
  wordIndex: number,
  phraseAnchors: CompiledPhraseAnchor[],
): string | null {
  const covering = phraseAnchors.filter(
    (a) =>
      a.sentenceId === sentenceId &&
      wordIndex >= a.startWord &&
      wordIndex <= a.endWord,
  );
  if (covering.length === 0) return null;
  covering.sort(
    (a, b) => a.endWord - a.startWord - (b.endWord - b.startWord),
  );
  return covering[0]!.phraseId;
}
