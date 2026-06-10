# Bark Raiders v0.3

A fuller static web prototype for GitHub Pages.

## What changed from v0.2

### Gameplay upgrades
- XP and dog levelling
- Threat meter and extraction risk
- Manual extraction can fail if threat is too high
- Auto-Raid research unlock
- Research upgrades:
  - Dog Whistle
  - Ammo Press
  - Padded Harness
  - Boss Trail Map
- Weapon/armour tier names as the benches improve
- More weather types
- More raid modifiers
- 4 zones:
  - Suburb Ruins
  - Flooded Estate
  - Junkyard Mile
  - Old Mall
- More enemy variety per zone
- Boss progression unlocks the next zone
- Better loot scaling by zone

### Visual upgrades
- Tile sprite assets in `/assets`
- Animated-feeling dog/enemy idle bounce via CSS
- Map legend
- Improved combat panel
- XP bar, threat/extraction display, and gear summary
- Replaceable SVG sprites for dogs, enemies, and tiles

## Upload to GitHub Pages

Upload the contents of this folder to your repository root:

- `index.html`
- `style.css`
- `game.js`
- `assets/`

Then check:

**Settings > Pages**
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

## Main dog choice

This version keeps **Mochi the Shiba Inu** as the main dog.

The Pomeranian should absolutely stay, but it works better as:
- an unlockable skin
- a second raider
- a rare “chaos mode” dog later

## Save data

The game saves to browser `localStorage` using:

`barkRaidersSaveV3`

Use **Reset Save** in-game if you want a clean run.

## Future v0.4 ideas

- Proper inventory item drops
- Dog skins/raider roster
- Station building visuals inside the kennel
- Boss-specific abilities
- Sound effects
- Sprite sheets with walk/shoot/hurt animations
- Offline progress
