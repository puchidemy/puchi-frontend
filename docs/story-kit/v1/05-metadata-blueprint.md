# Metadata Blueprint v1

## package.json

| Field | Type | Required |
|-------|------|----------|
| `schemaVersion` | integer | yes (`1`) |
| `contentVersion` | semver string | yes |
| `storyId` | string | yes |
| `locale` | BCP-47 primary | yes (`vi`) |
| `status` | enum | yes |
| `title` | `{ vi, en? }` | yes |
| `citySlug` | string | yes |
| `level` | CEFR | yes |
| `checksum` | `sha256:…` | published |
| `publishedAt` | ISO-8601 | published |

## story.yaml

| Field | Required |
|-------|----------|
| `storyId` | yes (must match package.json) |
| `title` | yes |
| `synopsis` | yes (can be short for outline) |
| `citySlug` | yes |
| `level` | yes |
| `tags` | recommended |
| `estimatedMinutes` | recommended |
| `objectives` | yes (array of strings or `{ id, text }`) |
| `coverAssetId` | full / published |
| `scenes` | yes — ordered `{ id, order, title }` |

`status` lives in `package.json` only (single source).
