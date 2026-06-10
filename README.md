# Bark Raiders v0.8

Static GitHub Pages prototype.

## What changed from v0.7

### Boss-run fix
The game no longer auto-extracts immediately on full pack during Boss Hunt.

Before:
- Pack full = forced extraction
- This could prevent ever reaching the boss

Now:
- Boss Hunt keeps going when the pack is full
- Extra loot is ignored or swapped depending on filters and priority
- The dog can still push towards the boss objective

### Loot filters
You can now choose which resources the dog should look for before and during a raid:

- Food
- Water
- Wood
- Metal
- Fabric
- Medicine
- Gun Parts

Ammo is always allowed because it is combat fuel and does not use normal inventory slots.

Unticked resources are generally ignored, which is ideal for:
- Wood Run
- Scrap Run
- Medical Run
- Boss Hunt with low-priority loot disabled

### Pack Manager
A new Pack Manager panel lets you drop loot during a raid:

- Drop 1
- Drop stack

This frees inventory slots and carry weight so you can continue the raid.

### Auto-swap behaviour
If the dog finds wanted loot but inventory is full:
- it tries to drop an unwanted or lower-priority stack
- then picks up the wanted item

This makes inventory management less frustrating while keeping the slot/carry system meaningful.

## Recommended boss setup

For boss attempts:
- Raid Plan: Boss Hunt
- Untick low-priority loot like food/water/fabric
- Keep wood/metal/gun parts/medicine depending on what you need
- Use Pack Manager if the dog picks up junk

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

This version uses:

`barkRaidersSaveV8`

It will attempt to load v0.7 saves as a fallback.
