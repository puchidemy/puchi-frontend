# Story Engine (Sprint 1)

Loads **compiled** Story Kit packages for the Learn player. The folder under `content/stories/{storyId}/` remains the authoring SSOT; the player consumes JSON under `compiled/`.

## Compile

```bash
# validate first (optional)
bun scripts/validate-story-package.ts content/stories/VN-HN-001

# emit src/lib/story-engine/compiled/VN-HN-001.json
bun scripts/compile-story-package.ts content/stories/VN-HN-001
```

Or via package scripts:

```bash
bun run validate:story -- content/stories/VN-HN-001
bun run compile:story -- content/stories/VN-HN-001
```

Re-run compile after editing package YAML/JSON. Commit the generated JSON so Next.js can import it without reading the filesystem at request time.

## Load in app

```ts
import { getCompiledStory, compiledToGetStoryResponse } from "@/lib/story-engine";

const pkg = getCompiledStory("VN-HN-001");
const learnPayload = pkg ? compiledToGetStoryResponse(pkg) : null;
```

City library maps package `citySlug` `ha-noi` → journey slug `hanoi` (`journeyCitySlug`).

## Play

- Route: `/learn/story/VN-HN-001` (locale prefix as usual, e.g. `/en/learn/story/VN-HN-001`)
- City hub: `/learn/city/hanoi`
