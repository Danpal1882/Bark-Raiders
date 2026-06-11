# Bark Raiders v0.30

Static GitHub Pages prototype.

## What changed in v0.30

### A cleaner kennel with real supply management

- The kennel is split into Pack, Workshop, Trade, and Tasks views instead of showing every menu at once.
- Four saved colour themes are available in Settings: Aurora, Sunset, Ocean, and Classic.
- Gear and equipment now use compact equipped cards, grouped inventory slots, readable stat chips, and clearer equip actions.
- Consumables are owned inventory items. Dispatching with one removes it from stock, and a zero-stock item cannot be selected.
- Medical rooms, rare caches, and crates can yield consumable supplies during raids.
- The Hub Trader sells medkits, supply tins, and map scrap bundles.
- The Workshop adds six crafting recipes using existing raid resources.
- Mobile layouts contain their own horizontal navigation and avoid page-wide overflow.

## v0.29 foundation

- Biome-shaped city, sewer, factory, and farmland maps with connected routes and reachable objectives.
- Bosses restricted to floors 3, 6, and 10; normal floors end at extraction.
- Balanced breed roles, working Lab medkit bonus, and fixed raid-history duration formatting.
- Streamlined raid dashboard with more room for the map.

The v0.30 runtime additions are:

- `kennel-v30.js`
- `systems-v30.js`
- `ui-v30.css`

## Validation

JavaScript syntax checks passed for the v0.30 systems and compatibility layers. Browser smoke tests covered kennel navigation, crafting resource deductions, consumable dispatch deductions, zero-stock blocking, raid supply banking, theme persistence, equipment layout, and desktop/mobile rendering without console errors.