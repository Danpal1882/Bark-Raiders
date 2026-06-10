# Bark Raiders v0.15

Static GitHub Pages prototype.

## What changed from v0.14

### Properer dungeon generator

The dungeon generator is now more like a proper room layout:

- rectangular rooms
- room sizes
- room outlines
- corridor links
- guaranteed connected dungeon
- extra loop corridors
- entrance room
- boss den
- biome-specific room names
- biome-specific hazards
- locked rooms
- key rooms
- force-open resource checks

This is still rendered with HTML/CSS so it stays GitHub Pages friendly, but the generation is much closer to a procedural dungeon than the previous node map.

### Room hazards

Rooms can now have hazards:

- Flooded
- Dark
- Overgrown
- Collapsing
- Locked
- Infested

Hazards can affect threat, HP, loot, ambush chance, or access.

### Locked rooms and keys

Some rooms can be locked.

The dog can:
- find dungeon keys in key rooms
- use a key to unlock a room
- force open some locked rooms using raid loot/resources
- skip the room if it cannot be opened

### Contracts

Added pre-raid contracts:

- No Contract
- Wood Recovery
- Pest Control
- Trader Escort
- Boss Bounty
- Supply Rescue
- Silent Run

Contracts track raid progress and pay out resources/treats if completed.

### Consumables

Choose up to two consumables before a raid:

- Smoke Biscuit
- Squeaky Decoy
- Emergency Medkit
- Lucky Treat
- Trader Token
- Map Scrap

Consumables give one-off raid effects.

### Other fixes

- Factory metal rooms now use scrap tile art instead of appearing blank.
- Smoke Biscuit avoiding an enemy room now clears that room so the dog does not loop forever.

## Existing systems retained

- auto-extract fix
- hub trader
- locked dog roster
- map-adjacent raid prompts
- quest baseline tracking
- biome bosses
- biome/trader assets
- offline progress
- perks
- equipment inventory
- loot filters
- pack manager
- roaming enemies
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

This version still uses:

`barkRaidersSaveV9`
