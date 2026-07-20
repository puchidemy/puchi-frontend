# Versioning & Migration (basic) v1

## Two version axes

| Axis | When it changes | Effect |
|------|-----------------|--------|
| `schemaVersion` | Package format / field meaning breaks | Need migrator or dual-read |
| `contentVersion` | Story text, anchors, activities, assets for learners | Progress may key off version; UI shows “updated” |

## Learner progress

Learn Service stores:

```text
{ userId, storyId, contentVersion?, sceneId, activityId, wordId, … }
```

Guidelines:

- Completing a story at `1.0.0` remains valid if `1.0.1` is typo-only (publisher may mark compatible).
- Breaking narrative / scene id removal → new `contentVersion`; do not silently remap progress without a migration note.
- Vocab mastery keys **`wordId` / `phraseId`**, not scene position.

## Migration checklist (authors)

1. Bump `contentVersion` (semver).
2. Re-run validator.
3. Re-anchor phrase spans if sentences changed.
4. Update asset `sha256` for replaced media.
5. Publish new compile; keep previous artifact until cutover policy says otherwise.

## Schema migration

When `schemaVersion` → `2`:

- Provide `migrate-v1-to-v2` (script or publisher step).
- Reject unmigrated packages at validate gate.
- Document breaking fields in Story Kit release notes.

Sprint 1 only ships **schemaVersion 1** and this basic policy.
