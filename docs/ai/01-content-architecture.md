# Puchi AI — Content Architecture

## Vision
Puchi is a story-first Vietnamese learning platform. Stories are the primary learning asset.

## Core Principles
- Story > Lesson
- Authentic Vietnamese life
- Culture-first
- CEFR aligned
- Activities generated from stories

## Hierarchy
Journey Map
→ City
→ Story Library
→ Story
→ Scene
→ Activity

## Story Kit v1 (canonical)

Authoring / validation / publish unit: **Story Package**.  
See [`docs/story-kit/v1/`](../story-kit/v1/README.md).

- Package folder = source of truth
- Learn runtime may consume a **compiled** read model
- Stable `wordId` / `phraseId` / `grammarId` (not token index)
- Phrase spans (`startWord`/`endWord`) are version-local anchors
- Learn stores progress by content ID only — no meaning/example copies

## Story Blueprint (summary)

Structure: Cover → Introduction → **6–10 Scenes** → Summary → Review → Reward

Each Scene: illustration, narration, optional dialogue (≤20%), audio, word/phrase/grammar anchors, activities.

Activity catalog: Read & Listen, Listening, Vocabulary, Unscramble, Dictation, Speaking (record/replay), Grammar in Context, Review (SRS).

Quality: interesting before educational · natural Vietnamese · culture-first · no textbook conversations.
