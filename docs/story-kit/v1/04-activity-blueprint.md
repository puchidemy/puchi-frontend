# Activity Blueprint v1

## Placement

Activities live **inside a Scene**, after Read & Listen (or interleaved by design). Order is explicit in the scene file.

## Catalog (Sprint 1)

| `type` | Purpose | Sprint 1 |
|--------|---------|----------|
| `read_listen` | Story text + audio + word/phrase tap | Required per scene (full) |
| `listening` | Audio → choose / order | Optional |
| `vocabulary` | Meaning / match from scene anchors | Common |
| `unscramble` | Sentence order | Common |
| `dictation` | Listen → type | Optional |
| `speaking` | Record / replay / compare (no AI score) | Optional MVP |
| `grammar_in_context` | Focus on `grammarId` in scene | Optional |
| `review` | Light SRS of scene items | Often last scene / story end |

## Shape

```yaml
activities:
  - id: s01.act.read
    type: read_listen
    # payload specific to type
  - id: s01.act.vocab
    type: vocabulary
    wordIds: [word.pho, word.ban]
    phraseIds: [phrase.mui-pho]
```

Rules:

- `activityId` stable within `contentVersion`
- Activities reference content by **ID**, not by copying full glossary entries
- Grading payloads stay lean; explanations live in content catalogs

## Speaking (MVP)

- Prompt + model audio optional
- Learner records → replay → optional side-by-side with model
- No automated pronunciation score in Story Kit v1
