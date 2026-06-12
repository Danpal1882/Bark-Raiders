# Bark Raiders Asset Guide

## Visual direction

Bark Raiders uses compact illustrated SVG assets with:

- dark ink outlines
- warm scavenger-survival colours
- simple shapes that remain readable between 24 and 160 pixels
- one strong silhouette per character or room marker
- restrained highlights rather than detailed texture

SVG remains the default because it is sharp at every UI size, inexpensive to load, and easy to recolour for custom raiders.

## Folders and names

Keep shipped assets in `assets/`.

- `*-raider.svg`: playable dog base art
- `*-bandit.svg`: standard enemies
- `*-boss.svg`: boss characters
- `tile-*.svg`: room and map markers
- `biome-*.svg`: small biome badges
- `dungeon-*.svg`: large decorative map backdrops

## Canvas rules

- Character art: `viewBox="0 0 160 160"`
- Tile markers: `viewBox="0 0 64 64"`
- Dungeon backdrops: `viewBox="0 0 900 620"`
- Keep characters bottom-centred.
- Leave at least 6% transparent padding around silhouettes.
- Avoid text inside game assets.

## Palette

- Ink: `#1b1410`
- Cream: `#fff4dc`
- Orange: `#f2a43c`
- Gold: `#ffd970`
- Green: `#8acf7f`
- Danger: `#e96c60`
- Blue: `#62b4ff`
- Purple: `#b98cff`

Biome art can shift the supporting palette while retaining the shared ink, cream, and gold accents.

## Animation

Current characters use pose-aware SVG generation and CSS motion. Keep motion readable:

- idle: 2 to 5 pixel vertical movement
- run: forward lean with faster timing
- combat: small recoil or anticipation movement
- boss: slower pulse with greater visual weight

Respect `prefers-reduced-motion` for nonessential animation.

## Adding a biome

1. Add the biome definition and room-name pool in `game.js`.
2. Add `assets/biome-<id>.svg`.
3. Add `assets/dungeon-<id>.svg`.
4. Add the asset keys to `TILE_ART` and `DUNGEON_ART`.
5. Add a matching `.biome-<id>` background treatment in `style.css`.
6. Run seeded graph tests and desktop/mobile browser playtests.
