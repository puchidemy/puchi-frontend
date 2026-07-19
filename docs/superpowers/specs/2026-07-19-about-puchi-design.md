# About Puchi — Brand Scroll Design

Date: 2026-07-19  
Status: approved (implement without separate plan)

## Goal

Public `/about` tells a learner-facing brand story: Meet Puchi → bamboo leaves = progress → mission → CTA to learn. Not a tech stack page. Not a character bible.

## Narrative

Meet Puchi → leaf progression → Vietnamese learning mission → CTA (`/start`). Creator is one line. Community links secondary.

## Page structure

1. **Hero** — Full-bleed atmospheric plane; brand “Puchi” hero-level; one headline; one sentence.
2. **Story** — Origin copy + leaf-2 cutout.
3. **Culture board** — Full `about_culture_scene.png` (text on image).
4. **Skills board** — Full `about_skills_board.png` (4 skills, text on image).
5. **Signature** — Five transparent cutouts + short copy.
6. **Meet poses** — Four emotion cutouts with labels.
7. **Growth board** — Full `about_growth_board.png` (0–3 leaves, text on image).
8. **Mission** — Headline + sentence; creator + community; brand-sheet link.

## Assets

- Boards (keep full, do not crop into panels):
  - `about/about_culture_scene.png`
  - `about/about_skills_board.png`
  - `about/about_growth_board.png`
- Other: `about_hero_forest_v5.png`, `about_leaf_*`, `about_sig_*`, `mascot/*` poses.
- Full brand board: footer download only (`puchi_brand_system_v2.png`).

## i18n

Rewrite `AboutPage` namespace. Prefer full `vi` + `en`; other locales mirror English until translated.

## Out of scope

Interactive leaf game, culture-heavy mastery costumes on About, tech stack section, regenerating the entire brand board from scratch.
