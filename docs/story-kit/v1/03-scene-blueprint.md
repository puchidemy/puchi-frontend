# Scene Blueprint v1

## Role

A Scene is one beat of the story: place + moment + language anchors + activities.

## Fields

| Field | Required (full) | Notes |
|-------|-----------------|-------|
| `id` | yes | Stable `sceneId`, e.g. `arrival-pho-stall` |
| `order` | yes | 1-based unique within story |
| `title` | yes | vi (+ en recommended) |
| `illustrationAssetId` | full | Via assets manifest |
| `narration` | full | Sentences with `sentenceId` |
| `dialogue` | optional | ≤20% of story text overall |
| `audioAssetId` | full | Scene-level or per-sentence |
| `wordAnchors` | recommended | `wordId` + `sentenceId` (+ optional span) |
| `phraseAnchors` | recommended | `phraseId` + `sentenceId` + `startWord`/`endWord` |
| `grammarAnchors` | optional | `grammarId` + `sentenceId` |
| `activities` | full | Ordered list; see activity blueprint |

## Sentence model

```yaml
narration:
  - id: s01.n01
    text: "Buổi sáng ở Hà Nội, mùi phở lan khắp góc phố."
    audioAssetId: audio.s01.n01
    words:
      - { surface: "Buổi", wordId: "word.buoi" }
      - { surface: "sáng", wordId: "word.sang" }
      # …
```

Word tokenization in the package is **authoritative for that contentVersion**.  
Player Read & Listen:

```text
Story → Scene → Sentence → Word
                      ↘ Phrase (via phraseAnchors)
```

## Phrase anchors

```yaml
phraseAnchors:
  - phraseId: phrase.mui-pho
    sentenceId: s01.n01
    startWord: 5
    endWord: 6
```

Spans are anchors for the current sentence version. Progress and glossary use `phraseId`.  
Validator resolves `startWord`/`endWord` against both `narration` and `dialogue` sentence word lists.

## Outline stub

```yaml
id: arrival-pho-stall
order: 1
title: { vi: "Ghé quán phở", en: "At the phở stall" }
synopsis: "Learner arrives; smells phở; hears morning street."
# narration / activities omitted until authored
```
