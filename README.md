# Bark Raiders v0.38

## v0.38 Core Raid Loop and Post-Raid Clarity

- Rebuilt the post-raid modal into a clearer mission debrief with outcome, loot, injuries, progress, timeline, and recommended next run.
- Added richer raid-history entries so recent raids show the route outcome and follow-up instead of just raw loot.
- Preserved extra raid context for future loop decisions such as continue/extract prompts and route recommendations.

## v0.37 Raid Readability and Enemy Intent

- Upgraded the raid map summary into a compact field HUD with current objective, route progress, and hostile alert status.
- Enemies now patrol, investigate, and engage based on awareness, line of sight, distance, and hearing instead of instantly snapping into combat.
- Added visible route guidance, enemy alert rings, and patrol/alert/engage labels to make raids easier to read while still moving.
- Expanded world audit data with enemy alert counts for smoke tests and future bug sweeps.

## v0.36 Directional Movement and Floor Progression

- Added dedicated up, down, left, and right Shiba walking sprites with four gait frames per direction.
- Removed combat coordinate movement so firing and recoil effects cannot push dogs or enemies around the map.
- Locked the camera directly to the dog and hardened movement against non-walkable boundary tiles.
- Moved raid entrances toward the map interior so scavenging routes naturally explore in every direction.
- Added a dedicated level-exit stairwell asset on all non-boss floors.
- Auto-Raid now continues through newly unlocked floors; boss floors remain locked behind boss victory.
- Expanded the modern weapon pool with dog-pun names inspired by recognizable real-world weapon families.

## v0.35 Combat, Loot, and Presentation Polish

- Added enemy attack telegraphs, muzzle flashes, impact sparks, camera response, grounded movement trails, loot glows, and biome lighting.
- Added clear cache-opening rewards, light optional combat audio, low-health/ammo warnings, and a player-controlled tactical retreat.
- Raised the emergency starting-ammo floor without making ammunition unlimited.
- Added a kennel field-loadout portrait showing the active weapon, helmet, body armour, backpack, durability, and equipped status.
- Refined raid atmosphere and combat HUD presentation while keeping existing saves compatible.

Static GitHub Pages prototype.

## What changed in v0.34

- Replaced the two-pose dog movement with a grounded four-frame walk cycle.
- Integrated the tactical armour into the dog sprite instead of drawing a floating outline over it.
- Added full walk, attack, and hurt animation sets for rats, raccoons, crows, and hostile hounds.
- Zoomed the raid camera out and tightened its follow response.
- Added automatic combat retreat when a raider runs out of ammunition.
- Increased base ammunition capacity and added emergency ammunition to more searchable areas.
- Replaced black map boundaries with biome scenery including ruined walls, burnt cars, pipes, machinery, fences, ditches, and rubble.
- Added detailed crate, ammunition, medical, supply, weapon, armour, backpack, and boss-cache assets.
- Replaced kennel station emoji art with illustrated station assets.

## What changed in v0.33

- Added passive kennel assignments for idle raiders with an eight-hour reward cap.
- Added Scrap Patrol, Supply Run, and Timber Watch jobs with visible progress and claimable resources.
- Dog appearance is now stored per raider instead of globally across the whole roster.
- Added a compact appearance editor for the active raider in the kennel.
- Inventory cards are sorted by usefulness and show score comparisons against equipped gear.
- Added floating combat feedback for damage, critical hits, misses, reloads, armour blocks, and empty magazines.
- Added compact victory and passive-reward notifications.

## What changed in v0.32

- Added Primary, Sidearm, Helmet, Body Armour, Backpack, and Charm slots.
- Added a modern weapon database with damage, range, recoil, magazine size, fire rate, penetration, ammunition type, condition, and visual identity.
- Added armour value, coverage, durability, carry modifiers, repair, and salvage.
- Added procedural rarity and affix rolls for raid equipment.
- Added unique themed equipment drops for twelve bosses.
- Added dog face, eye, ear, neckwear, and harness customisation.
- Equipped helmets, armour, packs, and weapon silhouettes are visible on the raid sprite.
- Added detailed animated rat, raccoon, crow, and hostile hound enemy sheets.
- Added biome floor texture details, boss visual effects, and contextual NPC dialogue.

## What changed in v0.31

- Added a high-quality Shiba raider set with idle, run, fire, and hurt frames.
- Normalized the frames to a shared 128px canvas and bottom-centre anchor.
- Upgraded Shiba art is used on the raid map and main character displays.
- Pistols, shotguns, rifles, SMGs, bows, and melee weapons have distinct ranges.
- Enemy archetypes now have their own ranged profiles.
- Combat can start across visible walkable tiles instead of requiring overlap.
- Shorter-range fighters advance before attacking.
- Weapon-coloured projectiles and impact flashes travel visibly across the map.

The v0.31 runtime additions are:

- `combat-v31.js`
- `assets/sprites/shiba-v31/web/01.png`
- `assets/sprites/shiba-v31/web/02.png`
- `assets/sprites/shiba-v31/web/03.png`
- `assets/sprites/shiba-v31/web/04.png`

## What changed in v0.30

- Replaced the crowded kennel grid with Pack, Workshop, Trade, and Tasks views.
- Added Aurora, Sunset, Ocean, and Classic colour themes in Settings.
- Redesigned equipped gear and inventory cards for clearer slots, rarity, and stat comparisons.
- Consumables are now owned inventory items and are deducted when a raid begins.
- Empty consumables cannot be selected.
- Consumables can be found in medical, rare, and crate searches and are banked on extraction.
- Added consumable stock to the hub trader.
- Added a crafting bench with six resource-based consumable recipes.
- Added responsive and reduced-motion handling for the new menus.

## What changed in v0.29

### Biome layouts, progression fixes, and a cleaner raid screen

- City raids now use intersecting streets, blocks, alleys, and courtyards.
- Sewer raids use looping channels, junctions, and maintenance rooms.
- Factory raids use large connected halls, service lanes, and cross routes.
- Farmland raids use branching tracks between fields, barns, orchards, and yards.
- Every generated layout is connectivity-audited and keeps its terminal objective reachable.
- Bosses now appear only on floors 3, 6, and 10.
- Normal floors end at an extraction objective instead of spawning a boss.
- The raid-end history crash caused by the missing `fmt` helper remains covered by regression testing.
- The raid UI now gives the map more space, collapses secondary information, and uses a cleaner slate, teal, and amber palette.

The v0.29 progression compatibility layer is isolated in:

- `progression-v29.js`

## What changed in v0.28

### Natural procedural raid maps

Raid geometry is now generated independently from the objective graph using recursive
space partitioning:

- irregular room sizes and placement
- guaranteed connected corridors between partition branches
- entrance and boss chambers placed far apart
- objectives distributed throughout the generated chambers
- biome-specific floor details, wall edging, scenery, and searchable caches
- seeded layouts that remain reproducible for debugging
- redesigned transparent dog and enemy illustrations with breed-specific silhouettes,
  cleaner equipment, layered shading, and improved readability at map scale
- rebalanced eight breed roles with bounded trade-offs and working specialist traits
- fixed first-zone raid completion history crashing on a missing time formatter

The city, sewer, factory, and farmland now have distinct environmental assets and
surface treatments. The generator and artwork are original and do not reuse code or
assets from the visual references used during planning.

The v0.28 runtime is isolated in:

- `world-v28.js`
- `world-v28.css`

## What changed in v0.27

### Real top-down raid world

The visible node graph has been replaced with a canvas-rendered tile world:

- carved rooms and walkable corridors
- solid wall and floor geometry
- a following camera and fog of war
- physical crates, resources, hazards, traders, and boss objectives
- continuous autonomous dog movement across floor cells
- searchable props that feed the existing loot and event systems
- enemies that patrol, chase, and trigger combat by proximity

The older dungeon graph remains internal for progression and guaranteed connectivity. Players now see and interact with the generated world rather than the graph.

The v0.27 runtime is isolated in:

- `world-v27.js`
- `world-v27.css`

## What changed in v0.26

### Seeded procedural dungeons

Each raid now creates a reproducible dungeon seed with:

- a guaranteed entrance-to-boss critical path
- optional side branches
- occasional corridor loops
- biome-aware room hazards
- keys placed before optional locked rooms
- 12 to 22 rooms based on biome and floor

The generator validates every graph for connectivity, reciprocal links, boss access, and unsafe locks.

For debugging in the browser console:

```js
generateDungeonFromSeed('my-test-seed')
```

### Better route finding

Raiders now use breadth-first shortest-path routing across room links. This prevents movement from oscillating between nearby rooms when the visual nearest room is not the correct route.

### Dungeon art pass

Added:

- unique city, sewer, factory, and farmland dungeon backdrops
- clear gold critical routes and dotted side routes
- dedicated key, lock, and hazard markers
- improved entrance and boss room art
- sharper SVG sprite rendering and more expressive movement

See `ASSET-GUIDE.md` for the asset style and extension rules.

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
