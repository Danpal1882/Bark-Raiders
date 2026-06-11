# Bark Raiders v0.29

Static GitHub Pages prototype.

## What changed in v0.29

### Biome layouts, progression fixes, and a cleaner raid screen

- City raids now use intersecting streets, blocks, alleys, and courtyards.
- Sewer raids use looping channels, junctions, and maintenance rooms.
- Factory raids use connected production halls, service lanes, and cross routes.
- Farmland raids use branching tracks between fields, barns, orchards, and yards.
- Every generated layout is connectivity-audited and keeps its terminal objective reachable.
- Bosses now appear only on floors 3, 6, and 10.
- Normal floors end at an extraction objective instead of spawning a boss.
- Breed roles have bounded trade-offs and the Lab's Field Medic bonus now affects medkits.
- Raid completion history no longer crashes when formatting duration.
- The raid UI gives the map more space, collapses secondary information, and uses a slate, teal, and amber palette.

The v0.29 runtime layers are:

- `progression-v29.js`
- `world-v29.js`
- `ui-v29.js`
- `ui-v29.css`
- `game-loader-v29.js`

## Validation

Seeded audits cover city, sewer, factory, and farmland on normal and boss floors. Checks verify full floor connectivity, reachable terminal objectives, objective placement on walkable tiles, live autonomous movement, and raid-end history creation.
