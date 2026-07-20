# Puchi Story Kit v1

**Status:** Draft → Sprint 1 (freezing at end of sprint)  
**Principle:** Story Package is the unit of **authoring, validation, and publish**.  
Learn Service reads a **compiled read model** (JSON / object storage), not the folder on every request. The folder remains the **source of truth**.

## Documents

| Doc | Purpose |
|-----|---------|
| [01-story-package-spec.md](./01-story-package-spec.md) | Package layout, IDs, versioning, publish |
| [02-story-blueprint.md](./02-story-blueprint.md) | Story-level narrative & learning design |
| [03-scene-blueprint.md](./03-scene-blueprint.md) | Scene structure, narration/dialogue, anchors |
| [04-activity-blueprint.md](./04-activity-blueprint.md) | Per-scene activities |
| [05-metadata-blueprint.md](./05-metadata-blueprint.md) | YAML/JSON metadata fields |
| [06-asset-blueprint.md](./06-asset-blueprint.md) | Media manifest, checksums, asset IDs |
| [07-versioning-migration.md](./07-versioning-migration.md) | schemaVersion, contentVersion, migrate |

## Schema & tooling

- JSON Schema: [`schema/story-package.schema.json`](./schema/story-package.schema.json)
- Sample package: [`../../../content/stories/VN-HN-001/`](../../../content/stories/VN-HN-001/)
- Validator: `bun scripts/validate-story-package.ts <package-dir>`  
  (`draft`/`outline`: missing asset files = warn; `review`/`published`: error)
- Compile (player read model): `bun scripts/compile-story-package.ts <package-dir>`  
  → `src/lib/story-engine/compiled/{storyId}.json` (see [`../../../src/lib/story-engine/README.md`](../../../src/lib/story-engine/README.md))

## Sprint order

```text
Package Spec v1
  → Schema + validator + sample
  → 1 full B1 story
  → Story Engine reads package
  → Read & Listen + phrase anchors
  → Story 2 full
  → ~10 outlines (same schema)
  → Completion polish
  → Freeze v1
```

## Out of scope (later sprints)

AI Content Pipeline · Linguistic Engine · Editorial CMS · AI speaking score
