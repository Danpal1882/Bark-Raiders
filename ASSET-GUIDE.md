# Bark Raiders Asset Guide

## Visual direction

Bark Raiders uses compact illustrated SVG assets with dark ink outlines, warm scavenger-survival colours, simple readable shapes, and restrained highlights.

SVG remains the default because it stays sharp at every UI size, loads quickly, and can be recoloured for custom raiders.

## Names and sizes

- `*-raider.svg`: playable dogs, `160 x 160` viewBox
- `*-bandit.svg`: standard enemies, `160 x 160` viewBox
- `*-boss.svg`: boss characters, `160 x 160` viewBox
- `tile-*.svg`: room markers, `64 x 64` viewBox
- `biome-*.svg`: biome badges, `64 x 64` viewBox
- `dungeon-*.svg`: map backdrops, `900 x 620` viewBox

Keep characters bottom-centred, leave transparent silhouette padding, and avoid text inside game art.

## Shared palette

- Ink: `#1b1410`
- Cream: `#fff4dc`
- Orange: `#f2a43c`
- Gold: `#ffd970`
- Green: `#8acf7f`
- Danger: `#e96c60`
- Blue: `#62b4ff`
- Purple: `#b98cff`

Biome art can shift supporting colours while retaining the shared ink, cream, and gold accents.

## Animation

Characters use pose-aware SVG generation and CSS motion:

- idle: subtle vertical movement
- run: forward lean and faster timing
- combat: recoil or anticipation
- boss: slower pulse with greater visual weight

Respect `prefers-reduced-motion` for nonessential animation.

## Adding a biome

1. Add its biome definition and room-name pool.
2. Add `assets/biome-<id>.svg`.
3. Add `assets/dungeon-<id>.svg`.
4. Register the asset keys.
5. Add its CSS background treatment.
6. Run seeded graph tests and desktop/mobile browser playtests.
