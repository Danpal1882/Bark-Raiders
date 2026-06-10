# Bark Raiders v0.25

Static GitHub Pages prototype.

## What changed from v0.24

### Dedicated Market tab
Added a proper Market tab separate from the kennel drawer.

The market now has:
- named traders
- trader detail panel
- trader stock panel
- faction reputation
- reputation-based discounts

### Named traders
Added four named traders:

- Milo the Mule — bulk resources
- Patch the Surgeon — medicine and recovery
- Bolt the Badger — gun parts, ammo, and metal
- Rook the Crow — rare charms and black-market intel

### Faction reputation consequences
Market and boss actions now affect faction influence.

Factions:
- Scav Traders
- Kennel Union
- Rat Court
- Crow Syndicate
- Rustclaw Crew

Higher trader reputation improves prices. Boss defeats affect faction influence.

### Boss dialogue
Boss fights now add intro dialogue based on their mechanics.

Boss defeats also add faction aftermath lines.

### Better Auto-Raid profile controls
Added quick profile buttons:

- Farm Wood
- Push Floor
- Boss Hunt
- Safe XP
- Trader Run

These automatically adjust:
- floor
- plan
- contract
- auto-extract
- loot filter priorities

### Kept from v0.24
- clean character creator modal
- world map
- custom dog visual variants
- faction panel
- create-a-raider roster
- recovery kennel
- dispatch profiles
- market base systems
- biome mastery
- bounty board
- auto-raid from the start
- pre-dispatch terminal
- post-raid report
- floor progression
- boss floors
- contracts
- consumables
- dungeon generation
- hazards
- locked rooms / keys
- history
- settings
- save tools

## Suggested v0.26
Next best pass:

- deeper room events with faction choices
- trader-specific quests
- dog bond events
- boss intro/defeat cut-in cards
- actual Market buy/sell filters
- Auto-Raid profile editor modal
- mobile UI polish

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

Main save key:
`barkRaidersSaveV9`

Additional meta keys:
`barkRaidersMetaV23`
`barkRaidersMetaV25`
