# Asset Blueprint v1

## Principle

Never rely on filename alone as identity. Every media file has an **asset ID** and preferably a **checksum**.

## assets/manifest.json

```json
{
  "schemaVersion": 1,
  "assets": [
    {
      "assetId": "cover.vn-hn-001",
      "kind": "image",
      "path": "covers/cover.webp",
      "mimeType": "image/webp",
      "sha256": "…"
    },
    {
      "assetId": "audio.s01.n01",
      "kind": "audio",
      "path": "audio/s01-n01.mp3",
      "mimeType": "audio/mpeg",
      "sha256": "…",
      "durationMs": 4200
    }
  ]
}
```

## Rules

1. Scene / sentence / word fields reference `*AssetId`, never bare paths in content YAML (path only in manifest).
2. Rename file → update `path` in manifest; keep `assetId` if content is the same.
3. Replace bytes → new `sha256`; bump `contentVersion` if learner-facing.
4. Missing manifest entry for a referenced `assetId` → validation failure.
5. Outline/draft may list planned `assetId`s with `path` before files exist — validator **warns** on missing files for `outline`/`draft`, **errors** for `review`/`published`.

## Conventions (recommended)

| Kind | Path prefix | Format |
|------|-------------|--------|
| Cover | `covers/` | webp |
| Scene image | `images/` | webp |
| Scene / sentence audio | `audio/` | mp3 or m4a |
| Word audio | `audio/words/` | mp3 |

CDN / R2 keys are assigned at **publish** time; package keeps relative `path` + `assetId`.
