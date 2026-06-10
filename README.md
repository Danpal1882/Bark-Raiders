# Bark Raiders v0.12

Static GitHub Pages prototype.

## What changed from v0.11

### More bosses

Bosses are now selected from biome-specific boss pools rather than one fixed boss per zone.

#### Ruined City bosses
- Rat King
- Crow Baron
- Alley Butcher

#### Sewer bosses
- Gutter Maw
- Drain Queen
- Mouldback Raccoon

#### Factory bosses
- Alpha Hound
- Geargrinder Raccoon
- Furnace Stray

#### Farmland bosses
- Trolley Tyrant
- Barnstorm Crow
- Old Yard Dog

Bosses now scale slightly by zone and have different mechanics, including:
- summons
- loot stealing
- bleed damage
- poison/filth pressure
- armour checks
- hazards
- furnace burn damage

### Traders

Trader rooms now appear in generated dungeons.

Traders sell expensive items using your kennel resources:

- med packs
- wood bundles
- gun parts
- ammo boxes
- mystery weapon crates
- biome-specific goods such as clean water, factory scrap, or farm supplies

Prices are deliberately high so traders feel useful but not free value.

### Biome assets

Added dedicated SVG assets for:

- Ruined City
- Sewer
- Factory
- Farmland
- Trader rooms

The map now shows a biome badge using the new biome asset.

### Existing systems retained

- room-and-corridor dungeon generation
- biome loot bias
- Jack Russell named Rustle
- auto-extract
- offline progress
- quests
- perks
- equipment inventory
- loot filters
- pack manager
- roaming enemies
- boss pathing
- event choices

## Upload to GitHub Pages

Upload the contents of this folder to your repository root:

- `index.html`
- `style.css`
- `game.js`
- `assets/`

Then GitHub:

**Settings > Pages**
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

## Save data

This version keeps the v0.9 save key:

`barkRaidersSaveV9`

It remains compatible with the recent v0.9-v0.11 saves.
