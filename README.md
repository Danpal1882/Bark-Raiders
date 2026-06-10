# Bark Raiders v0.16

Static GitHub Pages prototype.

## What changed from v0.15

### Cleaner one-screen UI

The long stacked page has been consolidated into a tighter dashboard.

Main play now sits in three columns:

- left: raid setup, controls, consumables, loot filter, status, stats
- centre: dungeon map, raid prompt, combat view
- right: contract, raid loot, pack manager, stores, gear, log

Lower admin systems are tucked into compact collapsible drawers:

- kennel base
- hub trader
- kennel stations
- quests
- perks
- research

This should make the game feel much less like a giant debug page and more like a playable dashboard.

### Consumable tooltips

Consumables now explain what they do directly in the UI.

Each consumable has:
- native mouseover title text
- styled hover/focus tooltip
- clearer setup area

### Existing systems retained

- proper dungeon generator
- contracts
- consumables
- hazards
- locked rooms and keys
- auto-extract fix
- hub trader
- locked dog roster
- biome bosses/assets
- offline progress
- perks
- equipment inventory
- loot filters
- pack manager
- roaming enemies

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

This version still uses:

`barkRaidersSaveV9`
