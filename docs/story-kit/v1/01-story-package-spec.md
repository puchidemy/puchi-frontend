# Story Package Specification v1

## 1. Role

A **Story Package** is the canonical unit for:

| Phase | Responsibility |
|-------|----------------|
| Authoring | Humans (and later AI) edit files in the package folder |
| Validation | Schema + content rules must pass before accept |
| Publish | Publisher compiles package → read model for Learn / CDN |
| Runtime | Story Engine / Player consumes the **compiled** artifact |

The folder is **source of truth**. Production does **not** need to read the raw folder on every learner request.

```text
content/stories/{storyId}/     ← authoring SSOT
        ↓ validate
        ↓ publish / compile
artifacts/ or object storage   ← Learn Service / CDN read model
        ↓
Story Player (frontend)
```

## 2. Identity & versions

| Field | Rule |
|-------|------|
| `storyId` | Stable string, e.g. `VN-HN-001` (`CC-CC-NNN`, 3 digits). Never reuse for a different story. |
| `schemaVersion` | Spec shape (`1`). Bump when package format breaks. |
| `contentVersion` | Semver of this story’s content (`1.0.0`). Bump when learner-visible content changes. |
| `locale` | Content language of the story text, e.g. `vi`. |
| `status` | `draft` \| `outline` \| `review` \| `published` \| `archived` |

**Outline vs full:** same schema. Outline may omit unfinished scenes/activities/assets; required fields for `status: outline` are listed in §7.

## 3. Package layout

```text
{storyId}/
├── package.json                 # required — package manifest
├── story.yaml                   # required — story metadata + objectives
├── content/
│   ├── words.json               # required (may be [] for outline)
│   ├── phrases.json             # required (may be [])
│   ├── grammar.json             # required (may be [])
│   └── scenes/
│       ├── 01-scene-id.yaml     # one file per scene
│       └── ...
├── assets/
│   ├── manifest.json            # required when any media present
│   ├── audio/
│   ├── images/
│   └── covers/
└── README.md                    # optional editorial notes
```

Filenames under `scenes/` are authoring convenience; **canonical scene order** is `story.yaml` → `scenes[].id` / `order`.

## 4. Stable content IDs

IDs are **never** derived from token index alone.

| ID | Scope | Stability |
|----|--------|-----------|
| `wordId` | Lexical lemma/sense used in package | Stable across scenes; same form+sense → same id |
| `phraseId` | Multi-word expression / collocation | Stable; not invalidated by re-tokenization |
| `grammarId` | Grammar point taught/practiced | Stable across stories when same point |
| `sentenceId` | Sentence within a scene | Stable within `contentVersion`; may change on rewrite |
| `sceneId` | Scene within story | Stable for story lifetime when possible |
| `activityId` | Activity within scene | Stable within contentVersion |

### Phrase anchors

Phrases are first-class. A phrase occurrence in a sentence:

```yaml
phraseAnchors:
  - phraseId: phrase.chup-anh
    sentenceId: s03.n02
    startWord: 2          # 0-based word index in THAT sentence version
    endWord: 3            # inclusive
```

Rules:

1. `phraseId` is the durable reference (Learn progress, glossary, SRS).
2. `startWord` / `endWord` are **version-local anchors** for the current sentence tokenization.
3. On sentence rewrite, re-anchor spans; **do not** change `phraseId` if the expression is the same.
4. Player must resolve by `phraseId` first; spans are for hit-testing / highlight.

### Words

```json
{
  "wordId": "word.pho",
  "surface": "phở",
  "lemma": "phở",
  "pos": "noun",
  "meaning": { "en": "pho (noodle soup)", "vi": "món phở" },
  "audioAssetId": "audio.word.pho",
  "exampleSentenceIds": ["s01.n01"]
}
```

Learn Service stores only progress keyed by `wordId` / `phraseId` / `grammarId` (+ `contentVersion` when needed). It must **not** copy meaning, example, or grammar explanation text.

## 5. package.json (manifest)

```json
{
  "schemaVersion": 1,
  "contentVersion": "1.0.0",
  "storyId": "VN-HN-001",
  "locale": "vi",
  "status": "published",
  "title": { "vi": "…", "en": "…" },
  "citySlug": "ha-noi",
  "level": "B1",
  "checksum": "sha256:…",
  "publishedAt": "2026-07-20T00:00:00Z"
}
```

`checksum` is of the compiled package or of a declared file set (see asset blueprint). Required for `published`.

## 6. Content vs Learn progress

```text
Content layer (package / compiled)
  Word | Phrase | Grammar | Sentence | Scene | Story
  → full meaning, examples, audio, explanations

Learn Service
  { userId, contentId, kind, mastery, schedule, favorite, lastSeen, … }
  → no meaning / example / grammar explanation copies
```

## 7. Outline completeness

Minimum for `status: outline`:

- `package.json` with `schemaVersion`, `contentVersion`, `storyId`, `locale`, `status`, `citySlug`, `level`
- `story.yaml` with title, synopsis, objectives (can be draft), planned `scenes` list (ids + titles + order)
- At least scene stubs: `id`, `order`, `title`, optional 1–2 sentence synopsis
- `words.json` / `phrases.json` / `grammar.json` may be empty arrays
- Assets optional

Full / `published` requires complete scenes (6–10), activities, content catalogs, and asset manifest for referenced media.

## 8. Validation gate

Story Engine / Publisher **must reject** packages that fail:

1. JSON Schema validation
2. Referential integrity (`phraseId` exists, `audioAssetId` in manifest, scene order unique, …)
3. Content rules (scene count for published, phrase anchors in range, …)

See validator script and schema directory.

## 9. Compile / publish (conceptual)

Publisher may emit:

- Single `story.json` bundle
- Split read models (`story`, `scenes`, `glossary`)
- Object storage keys under `stories/{storyId}/{contentVersion}/`

Exact compile format is an implementation detail of Sprint 1 Story Engine; this spec only requires that compile input is a validated package and that IDs survive unchanged.
