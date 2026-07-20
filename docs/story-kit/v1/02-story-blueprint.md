# Story Blueprint v1

## Purpose

One story = one cultural narrative arc a learner can finish in one sitting (~15–25 min at B1).

## Required shape

1. **Cover** — title, city, level, cover art, duration estimate  
2. **Introduction** — short hook (why this matters culturally)  
3. **Scenes** — **6–10** for `published` / full stories  
4. **Summary** — what happened + what you practiced  
5. **Review** — light SRS / key items (activities or completion screen)  
6. **Reward** — completion state (XP/badge later; MVP = summary + next CTA)

## Metadata (story.yaml)

See [05-metadata-blueprint.md](./05-metadata-blueprint.md).

Must include:

- `storyId`, titles (vi/en), `citySlug`, `level` (CEFR)
- `tags`, `estimatedMinutes`, `objectives[]`
- `scenes[]` ordered list of `{ id, order, title }`

## Narrative rules

- Interesting before educational
- Authentic Vietnamese life; culture-first
- Natural Vietnamese; avoid textbook dialogue
- Dialogue ≤ ~20% of scene text overall
- Vocabulary repeats naturally across scenes
- Each scene has a clear micro-goal (order food, ask direction, …)

## Levels

Sprint 1 golden set targets **B1**. Lower/higher levels reuse the same schema with different lexical density and activity mix.

## Outline stories

Same blueprint fields; scenes may be stubs. Do not invent a second format.
