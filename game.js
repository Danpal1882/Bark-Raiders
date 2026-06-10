const $ = (id) => document.getElementById(id);

const RESOURCES = ['food', 'water', 'wood', 'metal', 'fabric', 'medicine', 'gunParts', 'ammo'];
const ICONS = { food:'🥫', water:'💧', wood:'🪵', metal:'⚙️', fabric:'🧵', medicine:'🩹', gunParts:'🔩', ammo:'🔸' };

const SPRITES = {
  shiba: 'assets/shiba-raider.svg',
  pom: 'assets/pomeranian-raider.svg',
  jack: 'assets/jack-russell-raider.svg',
  collie: 'assets/collie-raider.svg',
  dachshund: 'assets/dachshund-raider.svg',
  rat: 'assets/rat-bandit.svg',
  crow: 'assets/crow-bandit.svg',
  raccoon: 'assets/raccoon-bandit.svg',
  stray: 'assets/stray-bandit.svg',
  alpha: 'assets/alpha-boss.svg',
};

const TILE_ART = {
  base:'assets/tile-base.svg', trader:'assets/tile-trader.svg', city:'assets/biome-city.svg', sewer:'assets/biome-sewer.svg', factory:'assets/biome-factory.svg', farmland:'assets/biome-farmland.svg', crate:'assets/tile-crate.svg', tree:'assets/tile-tree.svg', grove:'assets/tile-grove.svg',
  food:'assets/tile-food.svg', water:'assets/tile-water.svg', scrap:'assets/tile-scrap.svg', medical:'assets/tile-medical.svg', metal:'assets/tile-scrap.svg',
  weapon:'assets/tile-weapon.svg', event:'assets/tile-event.svg', enemy:'assets/tile-enemy.svg', rare:'assets/tile-rare.svg',
  boss:'assets/tile-boss.svg', cleared:'assets/tile-cleared.svg', empty:'assets/tile-empty.svg',
};

const DOGS = {
  shiba: { name:'Mochi', breed:'Shiba Inu Raider', unlock:'Starter', sprite:SPRITES.shiba, desc:'Balanced scout. Good crit and reliable combat.', hp:0, attack:1, defence:0, crit:5, speed:0, carry:0, scout:0, rare:0, extract:0 },
  pom: { name:'Pip', breed:'Pomeranian Chaos Raider', unlock:'Find/equip any non-starter gear', sprite:SPRITES.pom, desc:'Tiny chaos looter. Better rare finds and dodge, but fragile.', hp:-8, attack:0, defence:-1, crit:8, speed:1, carry:-4, scout:0, rare:8, extract:4 },
  jack: { name:'Rustle', breed:'Jack Russell Scrapper', unlock:'Beat the first boss / unlock zone 2', sprite:SPRITES.jack, desc:'Fast, brave, slightly chaotic. Great at chasing enemies and boss pushes.', hp:4, attack:2, defence:1, crit:5, speed:1, carry:0, scout:0, rare:2, extract:2 },
  collie: { name:'Scout', breed:'Border Collie Pathfinder', unlock:'Upgrade Watch Tower to Lv.3', sprite:SPRITES.collie, desc:'Fast route-finder. Better scouting and extraction.', hp:-2, attack:0, defence:0, crit:0, speed:1, carry:0, scout:1, rare:0, extract:8 },
  dachshund: { name:'Noodle', breed:'Dachshund Sneak', unlock:'Research Dog Whistle', sprite:SPRITES.dachshund, desc:'Sneaky scavenger. Lower threat and better extraction.', hp:-4, attack:-1, defence:0, crit:4, speed:0, carry:2, scout:0, rare:3, extract:12 },
};

const RAID_PLANS = {
  balanced: { name:'Balanced Scavenge', desc:'Normal loot, normal danger.', loot:1, enemy:1, threat:0, focus:null, boss:false },
  safe: { name:'Safe Sniff', desc:'Less loot, much safer extraction.', loot:.82, enemy:.75, threat:-18, focus:null, boss:false, extract:12 },
  deep: { name:'Deep Raid', desc:'More loot, more roamers, more threat.', loot:1.28, enemy:1.25, threat:18, focus:null, boss:false, roamers:2 },
  boss: { name:'Boss Hunt', desc:'Prioritises the boss and raises danger.', loot:1, enemy:1.15, threat:12, focus:'boss', boss:true, roamers:1 },
  wood: { name:'Wood Run', desc:'More trees/groves and wood drops.', loot:1.05, enemy:.95, threat:-4, focus:'wood', forestBoost:true },
  scrap: { name:'Scrap Run', desc:'More scrap/weapon caches.', loot:1.08, enemy:1.05, threat:3, focus:'scrap', scrapBoost:true },
  medical: { name:'Medical Run', desc:'More medical loot and safer events.', loot:.95, enemy:.85, threat:-7, focus:'medical', medicalBoost:true },
};


const BIOMES = {
  city: {
    name:'Ruined City',
    icon:'🏙️',
    desc:'Collapsed streets, shops, apartments, and alley ambushes.',
    bg:'city',
    types:['crate','scrap','event','enemy','food','medical','rare','trader'],
    bias:{crate:8, scrap:7, event:4, food:3, medical:2, rare:2, trader:2},
    rooms:['Collapsed Shop','Apartment Block','Bus Stop','Back Alley','Car Park','Corner Store','Looted Flat','Old Cafe'],
  },
  sewer: {
    name:'Sewer',
    icon:'🕳️',
    desc:'Wet tunnels, rat nests, drainage rooms, and hidden caches.',
    bg:'sewer',
    types:['water','enemy','medical','scrap','event','rare','grove','trader'],
    bias:{water:8, enemy:6, medical:4, scrap:3, event:3, rare:2, trader:2},
    rooms:['Drain Tunnel','Pump Room','Rat Nest','Maintenance Shaft','Flooded Bend','Filter Chamber','Service Hatch','Hidden Cache'],
  },
  factory: {
    name:'Factory',
    icon:'🏭',
    desc:'Broken machinery, metal stores, tool rooms, and noisy hazards.',
    bg:'factory',
    types:['scrap','weapon','metal','enemy','event','rare','medical','trader'],
    bias:{scrap:9, weapon:6, enemy:5, event:4, rare:3, medical:2, trader:2},
    rooms:['Machine Floor','Tool Cage','Loading Bay','Conveyor Hall','Boiler Room','Parts Store','Workshop','Security Office'],
  },
  farmland: {
    name:'Farmland',
    icon:'🌾',
    desc:'Barns, fields, woodland edges, sheds, and open patrol routes.',
    bg:'farmland',
    types:['tree','grove','food','water','event','enemy','crate','rare','trader'],
    bias:{tree:8, grove:6, food:6, water:4, event:3, crate:3, rare:2, trader:2},
    rooms:['Old Barn','Crop Field','Chicken Shed','Irrigation Ditch','Hay Store','Farmhouse','Woodland Edge','Tool Shed'],
  },
};


const BOSS_POOLS = {
  city:[
    {name:'Rat King', behavior:'summon', icon:'👑', sprite:SPRITES.rat, hp:58, atk:9, def:2, xp:25, reward:{food:7, water:4, wood:5, metal:4, gunParts:2, medicine:2, ammo:2}},
    {name:'Crow Baron', behavior:'lootStealBoss', icon:'🎩', sprite:SPRITES.crow, hp:66, atk:11, def:2, xp:30, reward:{food:6, fabric:8, medicine:2, gunParts:3, ammo:2}},
    {name:'Alley Butcher', behavior:'bleedBoss', icon:'🦴', sprite:SPRITES.stray, hp:76, atk:13, def:3, xp:34, reward:{food:8, metal:5, medicine:4, gunParts:3}},
  ],
  sewer:[
    {name:'Gutter Maw', behavior:'poisonBoss', icon:'🕳️', sprite:SPRITES.rat, hp:72, atk:12, def:3, xp:34, reward:{water:10, medicine:4, food:5, gunParts:2}},
    {name:'Drain Queen', behavior:'summon', icon:'👑', sprite:SPRITES.rat, hp:84, atk:12, def:4, xp:40, reward:{water:12, medicine:5, metal:5, ammo:2}},
    {name:'Mouldback Raccoon', behavior:'stealBoss', icon:'🦝', sprite:SPRITES.raccoon, hp:86, atk:13, def:5, xp:42, reward:{metal:7, fabric:6, medicine:4, gunParts:4}},
  ],
  factory:[
    {name:'Alpha Hound', behavior:'armourCheck', icon:'👑', sprite:SPRITES.alpha, hp:105, atk:15, def:5, xp:55, reward:{food:10, water:10, wood:8, metal:10, gunParts:6, medicine:4, ammo:4}},
    {name:'Geargrinder Raccoon', behavior:'hazards', icon:'⚙️', sprite:SPRITES.raccoon, hp:112, atk:16, def:6, xp:58, reward:{metal:14, wood:7, gunParts:7, medicine:3, ammo:3}},
    {name:'Furnace Stray', behavior:'burnBoss', icon:'🔥', sprite:SPRITES.stray, hp:118, atk:18, def:5, xp:62, reward:{metal:12, gunParts:8, medicine:5, ammo:4}},
  ],
  farmland:[
    {name:'Trolley Tyrant', behavior:'hazards', icon:'🛒', sprite:SPRITES.raccoon, hp:132, atk:18, def:7, xp:80, reward:{food:14, water:10, wood:10, metal:14, fabric:10, gunParts:8, medicine:6, ammo:5}},
    {name:'Barnstorm Crow', behavior:'lootStealBoss', icon:'🌾', sprite:SPRITES.crow, hp:96, atk:16, def:4, xp:56, reward:{food:12, water:8, wood:12, fabric:10, medicine:4}},
    {name:'Old Yard Dog', behavior:'chaseBoss', icon:'🐕', sprite:SPRITES.stray, hp:118, atk:18, def:6, xp:64, reward:{food:12, wood:12, metal:8, gunParts:5, medicine:5}},
  ],
};

function bossPoolForBiome(){
  const key = Object.keys(BIOMES).find(k => BIOMES[k] === currentBiome()) || 'city';
  return BOSS_POOLS[key] || BOSS_POOLS.city;
}

function chooseDungeonBoss(){
  const pool = bossPoolForBiome();
  const boss = {...pick(pool)};
  const zoneScale = 1 + state.zoneId * .12;
  boss.hp = Math.round(boss.hp * zoneScale);
  boss.atk = Math.round(boss.atk * zoneScale);
  boss.def = Math.round(boss.def * (1 + state.zoneId * .06));
  boss.xp = Math.round(boss.xp * zoneScale);
  return boss;
}

function currentBiome(){
  const keys = Object.keys(BIOMES);
  return BIOMES[keys[state.zoneId % keys.length]];
}


const CONTRACTS = {
  none:{name:'No Contract', desc:'Free raid. No extra objective.', reward:{}, check:()=>false, progress:()=>''},
  wood:{name:'Wood Recovery', desc:'Bring back 30 wood during this raid.', reward:{wood:8, treats:3}, target:30, progress:()=>state.contractProgress.wood||0},
  pest:{name:'Pest Control', desc:'Defeat 5 enemies during this raid.', reward:{medicine:3, treats:4}, target:5, progress:()=>state.contractProgress.kills||0},
  trader:{name:'Trader Escort', desc:'Reach/buy from a trader room and survive.', reward:{metal:5, treats:4}, target:1, progress:()=>state.contractProgress.trader||0},
  boss:{name:'Boss Bounty', desc:'Defeat the dungeon boss.', reward:{gunParts:4, treats:6}, target:1, progress:()=>state.contractProgress.boss||0},
  medical:{name:'Supply Rescue', desc:'Clear 2 medical rooms.', reward:{medicine:5, water:5, treats:3}, target:2, progress:()=>state.contractProgress.medical||0},
  silent:{name:'Silent Run', desc:'Clear 8 rooms while defeating no enemies.', reward:{fabric:5, treats:5}, target:8, progress:()=>state.contractProgress.rooms||0, fail:()=>state.contractProgress.kills>0},
};

const CONSUMABLES = {
  smoke:{name:'Smoke Biscuit', desc:'Escape the first non-boss fight safely.', icon:'💨'},
  decoy:{name:'Squeaky Decoy', desc:'Distracts roaming enemies and lowers aggro.', icon:'🧸'},
  medkit:{name:'Emergency Medkit', desc:'Auto-heals once below 30% HP.', icon:'🩹'},
  lucky:{name:'Lucky Treat', desc:'Better rare loot and gear drops this raid.', icon:'🍖'},
  token:{name:'Trader Token', desc:'One trader purchase costs 25% less.', icon:'🪙'},
  map:{name:'Map Scrap', desc:'Reveal extra nearby rooms at raid start.', icon:'🗺️'},
};

const HAZARDS = {
  flooded:{name:'Flooded', icon:'💧', desc:'Slower movement; extra water chance.'},
  dark:{name:'Dark', icon:'🌑', desc:'Higher ambush chance.'},
  overgrown:{name:'Overgrown', icon:'🌿', desc:'More wood, hidden enemies.'},
  collapsing:{name:'Collapsing', icon:'🧱', desc:'Threat rises when entered.'},
  locked:{name:'Locked', icon:'🔒', desc:'Needs a key or resources to open.'},
  infested:{name:'Infested', icon:'🐀', desc:'Enemy likely, better reward.'},
};

const WEATHER = [
  { name:'Clear Skies', icon:'☀️', text:'Balanced scavenging conditions.', loot:1, enemy:1, thirst:0, speed:0, threat:0 },
  { name:'Rainstorm', icon:'🌧️', text:'Extra water finds, muddy travel.', loot:1.05, enemy:.95, thirst:0, speed:-1, threat:-4 },
  { name:'Heatwave', icon:'🔥', text:'Water drain and enemy aggression rise.', loot:1, enemy:1.15, thirst:1, speed:0, threat:8 },
  { name:'Fog', icon:'🌫️', text:'Ambush risk rises, rare scavenging improves.', loot:1.12, enemy:1.15, thirst:0, speed:0, threat:10 },
  { name:'Night Raid', icon:'🌙', text:'Harder fights, better salvage and gun parts.', loot:1.2, enemy:1.22, thirst:0, speed:0, threat:12 },
  { name:'Ashfall', icon:'🌋', text:'Low visibility and heavy scrap deposits.', loot:1.14, enemy:1.08, thirst:1, speed:-1, threat:6 },
];

const MODIFIERS = [
  { name:'Supply Surge', text:'Crates are more common this raid.', crateBoost:true, threat:-2 },
  { name:'Predator Activity', text:'Enemy dens are more active.', enemyBoost:true, threat:14 },
  { name:'Scavenger Trail', text:'The dog moves faster along old paths.', speedBonus:1, threat:0 },
  { name:'Lucky Paws', text:'Critical hits and rare finds improve.', critBonus:7, rareBonus:true, threat:0 },
  { name:'Fresh Start', text:'Start with a little extra ammo and bandages.', ammoBonus:2, medBonus:4, threat:-3 },
  { name:'Quiet Streets', text:'Fewer enemies, slightly less loot.', quiet:true, threat:-10 },
  { name:'Boss Patrol', text:'The boss is restless; threat climbs faster.', bossRush:true, threat:10 },
  { name:'Overgrown Routes', text:'More trees and groves appear.', forestBoost:true, threat:-2 },
];

const ZONES = [
  {
    id:0, name:'Suburb Ruins', bossName:'Rat King', bossSprite:SPRITES.rat, description:'Collapsed houses, food tins, and vermin packs.', mapSize:12, unlock:'Starter zone',
    baseLoot:{food:1.15, water:1, wood:1.35, metal:1, fabric:1.05, medicine:.8, gunParts:.6, ammo:.38},
    enemies:[
      {name:'Bin Rat', behavior:'swarm', icon:'🐀', sprite:SPRITES.rat, hp:14, atk:4, def:0, xp:5, reward:{food:1, fabric:1}},
      {name:'Angry Crow', behavior:'stealFood', icon:'🐦‍⬛', sprite:SPRITES.crow, hp:12, atk:5, def:0, xp:5, reward:{water:1, metal:1}},
      {name:'Junk Raccoon', behavior:'stealScrap', icon:'🦝', sprite:SPRITES.raccoon, hp:20, atk:6, def:1, xp:7, reward:{metal:2, wood:1}},
      {name:'Stray Scout', behavior:'chaser', icon:'🐕', sprite:SPRITES.stray, hp:24, atk:7, def:1, xp:8, reward:{gunParts:1, ammo:1, fabric:1}},
    ],
    boss:{name:'Rat King', behavior:'summon', icon:'👑', sprite:SPRITES.rat, hp:58, atk:9, def:2, xp:25, reward:{food:7, water:4, wood:5, metal:4, gunParts:2, medicine:2, ammo:2}},
  },
  {
    id:1, name:'Flooded Estate', bossName:'Stray Captain', bossSprite:SPRITES.stray, description:'Waterlogged streets with tougher scavengers.', mapSize:12, unlock:'Beat Rat King',
    baseLoot:{food:1, water:1.25, wood:1.15, metal:1.1, fabric:1.15, medicine:1, gunParts:.75, ammo:.45},
    enemies:[
      {name:'Flood Crow', behavior:'stealFood', icon:'🐦‍⬛', sprite:SPRITES.crow, hp:18, atk:7, def:1, xp:8, reward:{water:2, fabric:1}},
      {name:'Estate Raider', behavior:'chaser', icon:'🐕', sprite:SPRITES.stray, hp:26, atk:9, def:2, xp:10, reward:{gunParts:1, ammo:1, fabric:2}},
      {name:'Canal Raccoon', behavior:'stealScrap', icon:'🦝', sprite:SPRITES.raccoon, hp:26, atk:8, def:2, xp:10, reward:{metal:2, medicine:1}},
      {name:'Muddy Rat Pack', behavior:'swarm', icon:'🐀', sprite:SPRITES.rat, hp:30, atk:9, def:2, xp:11, reward:{food:2, ammo:1, metal:1}},
    ],
    boss:{name:'Stray Captain', behavior:'chaseBoss', icon:'⭐', sprite:SPRITES.stray, hp:78, atk:12, def:4, xp:38, reward:{food:8, water:8, wood:5, metal:6, gunParts:4, medicine:3, ammo:3}},
  },
  {
    id:2, name:'Junkyard Mile', bossName:'Alpha Hound', bossSprite:SPRITES.alpha, description:'Big scrap piles, bad dogs, and the hardest boss.', mapSize:12, unlock:'Beat Stray Captain',
    baseLoot:{food:.85, water:.85, wood:1.3, metal:1.4, fabric:1.15, medicine:.9, gunParts:1.1, ammo:.55},
    enemies:[
      {name:'Scrap Rat Pack', behavior:'swarm', icon:'🐀', sprite:SPRITES.rat, hp:26, atk:9, def:2, xp:12, reward:{wood:2, metal:2, ammo:1}},
      {name:'Junkyard Hound', behavior:'chaser', icon:'🐕', sprite:SPRITES.stray, hp:34, atk:11, def:3, xp:14, reward:{wood:2, metal:3, gunParts:1, ammo:1}},
      {name:'Armoured Raccoon', behavior:'armoured', icon:'🦝', sprite:SPRITES.raccoon, hp:32, atk:10, def:4, xp:14, reward:{metal:3, medicine:1, fabric:2}},
      {name:'Wire Crow', behavior:'stealFood', icon:'🐦‍⬛', sprite:SPRITES.crow, hp:28, atk:12, def:2, xp:13, reward:{gunParts:1, ammo:2}},
    ],
    boss:{name:'Alpha Hound', behavior:'armourCheck', icon:'👑', sprite:SPRITES.alpha, hp:105, atk:15, def:5, xp:55, reward:{food:10, water:10, wood:8, metal:10, gunParts:6, medicine:4, ammo:4}},
  },
  {
    id:3, name:'Old Mall', bossName:'Trolley Tyrant', bossSprite:SPRITES.raccoon, description:'Retail ruins packed with rare crates and ugly ambushes.', mapSize:12, unlock:'Beat Alpha Hound',
    baseLoot:{food:1.25, water:1.05, wood:1.15, metal:1.25, fabric:1.45, medicine:1.1, gunParts:1.05, ammo:.55},
    enemies:[
      {name:'Shop Rat Swarm', behavior:'swarm', icon:'🐀', sprite:SPRITES.rat, hp:34, atk:12, def:3, xp:15, reward:{food:3, fabric:2}},
      {name:'Mannequin Crow', behavior:'stealFood', icon:'🐦‍⬛', sprite:SPRITES.crow, hp:32, atk:14, def:3, xp:16, reward:{fabric:3, ammo:1}},
      {name:'Trolley Raccoon', behavior:'stealScrap', icon:'🦝', sprite:SPRITES.raccoon, hp:42, atk:13, def:5, xp:18, reward:{metal:4, gunParts:1, medicine:1}},
      {name:'Security Stray', behavior:'chaser', icon:'🐕', sprite:SPRITES.stray, hp:44, atk:15, def:4, xp:19, reward:{gunParts:2, ammo:2}},
    ],
    boss:{name:'Trolley Tyrant', behavior:'hazards', icon:'🛒', sprite:SPRITES.raccoon, hp:132, atk:18, def:7, xp:80, reward:{food:14, water:10, wood:10, metal:14, fabric:10, gunParts:8, medicine:6, ammo:5}},
  },
];

const TILE_TYPES = [
  {type:'empty', weight:16}, {type:'crate', weight:17}, {type:'tree', weight:12}, {type:'grove', weight:7},
  {type:'food', weight:9}, {type:'water', weight:9}, {type:'scrap', weight:12}, {type:'medical', weight:7},
  {type:'weapon', weight:7}, {type:'event', weight:9}, {type:'trader', weight:4}, {type:'enemy', weight:15}, {type:'rare', weight:4},
];

const UPGRADE_DEFS = {
  weapons:{ name:'Weapons Bench', icon:'🔫', desc:'Improves weapon damage, crit chance, and ammo reserve.', cost:l=>({metal:4*l, wood:2*l, gunParts:1*l, ammo:2*l}), apply:(l,d)=>{d.attackBase=8+(l-1)*4; d.critBase=6+(l-1)*2; d.ammoMax=14+(l-1)*4;} },
  armour:{ name:'Armour Bench', icon:'🦺', desc:'Improves max HP and defence.', cost:l=>({metal:5*l, fabric:3*l, wood:1*l}), apply:(l,d)=>{d.maxHpBase=38+(l-1)*12; d.defenceBase=2+(l-1)*2;} },
  medical:{ name:'Medical Bench', icon:'🩹', desc:'Better healing and stronger emergency bandages.', cost:l=>({medicine:3*l, water:2*l, fabric:2*l}), apply:(l,d)=>{d.healBetween=2+(l-1)*2; d.medkitPower=6+(l-1)*4;} },
  storage:{ name:'Storage Crate', icon:'📦', desc:'More total carry weight.', cost:l=>({wood:5*l, fabric:4*l, metal:2*l}), apply:(l,d)=>{d.carryMaxBase=22+(l-1)*12;} },
  pack:{ name:'Backpack Rack', icon:'🎒', desc:'More inventory slots for resource types.', cost:l=>({fabric:5*l, wood:3*l, metal:2*l}), apply:(l,d)=>{d.inventorySlots=4+(l-1);} },
  water:{ name:'Water Filter', icon:'💧', desc:'Reduces weather penalties and thirst drain.', cost:l=>({water:5*l, metal:2*l, wood:2*l}), apply:(l,d)=>{d.weatherResistance=l-1+(state.perks?.stomach||0);} },
  watch:{ name:'Watch Tower', icon:'🗼', desc:'Improves scouting, speed, and extraction safety.', cost:l=>({wood:4*l, metal:3*l, fabric:1*l}), apply:(l,d)=>{d.speedBase=1+Math.floor((l-1)/2); d.scoutRange=1+Math.floor((l-1)/2); d.extractBonus=(l-1)*5;} },
};

const RESEARCH = {
  dogWhistle:{ name:'Dog Whistle', desc:'Unlocks Auto-Raid.', cost:()=>({metal:10, wood:8, fabric:6, gunParts:2}) },
  ammoPress:{ name:'Ammo Press', desc:'Start each raid with +5 ammo reserve.', cost:()=>({metal:14, gunParts:5, wood:6}) },
  paddedHarness:{ name:'Padded Harness', desc:'Adds +10 carry limit and +1 defence.', cost:()=>({fabric:14, metal:8, medicine:4}) },
  bossMap:{ name:'Boss Trail Map', desc:'Boss tile reveals earlier and boss crit improves.', cost:()=>({wood:10, metal:10, gunParts:4}) },
  kennelRoster:{ name:'Kennel Roster', desc:'Unlocks all dog raider roles permanently.', cost:()=>({food:10, water:10, wood:14, fabric:8}) },
};


const PERKS = {
  nose:{name:'Strong Nose', desc:'Better rare loot and gear drop chance.', cost:l=>2+l*2, max:5},
  bark:{name:'Brave Bark', desc:'Reduces threat gained from enemies.', cost:l=>2+l*2, max:5},
  paws:{name:'Quick Paws', desc:'Improves movement and dodge.', cost:l=>3+l*2, max:5},
  stomach:{name:'Iron Stomach', desc:'Reduces weather chip damage.', cost:l=>2+l*2, max:5},
  goodBoy:{name:'Good Boy', desc:'Improves extraction chance.', cost:l=>3+l*2, max:5},
};

const QUEST_TEMPLATES = [
  {id:'wood20', name:'Fresh Wood Run', desc:'Gain 20 wood after this quest appears.', reward:{wood:4, treats:2}, progress:q=>Math.max(0, state.resources.wood-(q.baseline?.wood||0)), target:20},
  {id:'metal15', name:'Fresh Scrap Collector', desc:'Gain 15 metal after this quest appears.', reward:{metal:3, treats:2}, progress:q=>Math.max(0, state.resources.metal-(q.baseline?.metal||0)), target:15},
  {id:'med8', name:'Fresh Medic Pup', desc:'Gain 8 medicine after this quest appears.', reward:{medicine:2, treats:2}, progress:q=>Math.max(0, state.resources.medicine-(q.baseline?.medicine||0)), target:8},
  {id:'gear1', name:'Find Better Gear', desc:'Equip any non-starter item after this quest appears.', reward:{gunParts:2, treats:3}, progress:q=>Math.max(0, totalGearScore()-((q.baseline?.gearScore)||0)), target:1},
  {id:'boss1', name:'Boss Proof', desc:'Unlock a new zone after this quest appears.', reward:{food:5, water:5, treats:4}, progress:q=>Math.max(0, state.unlockedZones-(q.baseline?.unlockedZones||1)), target:1},
  {id:'watch3', name:'Scout Network', desc:'Upgrade Watch Tower by 2 levels after this quest appears.', reward:{wood:5, treats:3}, progress:q=>Math.max(0, state.upgrades.watch-(q.baseline?.watch||1)), target:2},
  {id:'pack3', name:'Bigger Bag Energy', desc:'Upgrade Backpack Rack by 2 levels after this quest appears.', reward:{fabric:5, treats:3}, progress:q=>Math.max(0, state.upgrades.pack-(q.baseline?.pack||1)), target:2},
];

const GEAR_POOLS = {
  weapon:[
    {name:'Rusty Pistol', rarity:'Common', attack:1, crit:0, ammo:0, score:1},
    {name:'Scrap Revolver', rarity:'Common', attack:2, crit:2, ammo:0, score:3},
    {name:'Pipe SMG', rarity:'Rare', attack:3, crit:4, ammo:2, score:6},
    {name:'Nailgun', rarity:'Rare', attack:4, crit:1, ammo:1, score:6},
    {name:'Raider Carbine', rarity:'Epic', attack:6, crit:3, ammo:3, score:10},
    {name:'Bark Blaster', rarity:'Epic', attack:7, crit:6, ammo:0, score:13},
  ],
  armour:[
    {name:'Scrap Vest', rarity:'Common', hp:4, defence:1, carry:0, score:2},
    {name:'Padded Harness', rarity:'Common', hp:7, defence:1, carry:4, score:4},
    {name:'Plated Harness', rarity:'Rare', hp:12, defence:3, carry:2, score:8},
    {name:'Riot Dog Armour', rarity:'Epic', hp:18, defence:5, carry:0, score:13},
    {name:'Spiked Raider Vest', rarity:'Epic', hp:10, defence:4, carry:8, score:14},
  ],
  charm:[
    {name:'Lucky Paw Tag', rarity:'Common', crit:3, rare:2, extract:0, score:3},
    {name:'Compass Collar', rarity:'Rare', crit:0, rare:0, extract:8, score:6},
    {name:'Golden Bone Charm', rarity:'Epic', crit:6, rare:6, extract:4, score:12},
  ],
};

const state = {
  running:false, mode:'idle', seconds:0, ticker:null, autoRaid:false, autoExtract:false, autoExtractRule:'off', offlineReward:null,
  zoneId:0, unlockedZones:1, planId:'balanced', dogId:'shiba', contractId:'none', selectedConsumables:[], activeConsumables:[], consumableUsed:{}, contractProgress:{}, contractRewardClaimed:false, lootFilter:{}, weather:null, modifier:null, threat:0,
  map:[], roamEnemies:[], mapSize:12, position:{x:0,y:0}, revealedTiles:0, combat:null, currentBoss:null, dungeonKeys:0, pendingChoice:null, activeEventTile:null,
  dog:{
    name:'Mochi', breed:'Shiba Inu Raider', sprite:SPRITES.shiba, level:1, xp:0, xpNext:40,
    maxHpBase:38, hp:38, attackBase:8, defenceBase:2, critBase:6, speedBase:1, carryMaxBase:22,
    inventorySlots:4, ammoMax:14, ammo:14, healBetween:2, medkitPower:6, weatherResistance:0, scoutRange:1, extractBonus:0,
    maxHp:38, attack:8, defence:2, crit:6, speed:1, carryMax:22, carry:0, rareBonus:0,
  },
  resources:{food:16, water:14, wood:18, metal:12, fabric:10, medicine:6, gunParts:4, ammo:8},
  raidLoot:emptyRes(),
  upgrades:{weapons:1, armour:1, medical:1, storage:1, pack:1, water:1, watch:1},
  research:{dogWhistle:false, ammoPress:false, paddedHarness:false, bossMap:false, kennelRoster:false},
  equipment:{
    weapon:{name:'Starter Pistol', rarity:'Starter', attack:0, crit:0, ammo:0, score:0},
    armour:{name:'Scrap Vest', rarity:'Starter', hp:0, defence:0, carry:0, score:0},
    charm:{name:'Lucky Bone', rarity:'Starter', crit:2, rare:0, extract:0, score:0},
  },
  equipmentInventory:{
    weapon:[{name:'Starter Pistol', rarity:'Starter', attack:0, crit:0, ammo:0, score:0}],
    armour:[{name:'Scrap Vest', rarity:'Starter', hp:0, defence:0, carry:0, score:0}],
    charm:[{name:'Lucky Bone', rarity:'Starter', crit:2, rare:0, extract:0, score:0}],
  },
  treats:0,
  perks:{nose:0, bark:0, paws:0, stomach:0, goodBoy:0},
  quests:[],
  gear:[
    {slot:'Weapon', name:'Starter Pistol', icon:'🔫', detail:'Reliable, low damage, uses ammo.'},
    {slot:'Armour', name:'Scrap Vest', icon:'🦺', detail:'Light protection for early raids.'},
    {slot:'Utility', name:'Bandage Roll', icon:'🩹', detail:'Emergency healing during a raid.'},
    {slot:'Pack', name:'Small Backpack', icon:'🎒', detail:'4 inventory slots at the start; upgrade Backpack Rack for more.'},
    {slot:'Charm', name:'Lucky Bone', icon:'🦴', detail:'Small crit bonus.'},
    {slot:'Skin', name:'Pomeranian Alt', icon:'🐾', detail:'Asset included for later raiders.'},
  ],
  encounterText:'No encounter active.',
};

function emptyRes(){ return Object.fromEntries(RESOURCES.map(r=>[r,0])); }
function rand(max){ return Math.floor(Math.random()*max); }
function pick(list){ return list[rand(list.length)]; }
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
function currentZone(){ return ZONES[state.zoneId]; }
function currentPlan(){ return RAID_PLANS[state.planId] || RAID_PLANS.balanced; }
function currentDogDef(){ return DOGS[state.dogId] || DOGS.shiba; }

function isDogUnlocked(id){
  if(id === 'shiba') return true;
  if(id === 'pom') return Object.values(state.equipment || {}).some(item => item.rarity && item.rarity !== 'Starter');
  if(id === 'jack') return state.unlockedZones >= 2;
  if(id === 'collie') return (state.upgrades?.watch || 1) >= 3;
  if(id === 'dachshund') return !!state.research?.dogWhistle;
  return false;
}

function ensureSelectedDogUnlocked(){
  if(!isDogUnlocked(state.dogId)) state.dogId = 'shiba';
}


function currentContract(){ return CONTRACTS[state.contractId] || CONTRACTS.none; }
function hasConsumable(key){ return state.activeConsumables.includes(key) && !state.consumableUsed[key]; }
function useConsumable(key){ state.consumableUsed[key] = true; }

function contractProgressText(){
  const c = currentContract();
  if(state.contractId === 'none') return 'No contract selected.';
  const value = c.progress ? c.progress() : 0;
  const fail = c.fail && c.fail();
  return `${c.name}: ${Math.min(value, c.target || 1)} / ${c.target || 1}${fail ? ' · Failed' : ''}`;
}

function isContractComplete(){
  const c = currentContract();
  if(state.contractId === 'none') return false;
  if(c.fail && c.fail()) return false;
  return (c.progress ? c.progress() : 0) >= (c.target || 1);
}

function applyContractReward(){
  if(state.contractRewardClaimed || !isContractComplete()) return;
  const reward = currentContract().reward || {};
  Object.entries(reward).forEach(([type, amount]) => {
    if(type === 'treats') state.treats += amount;
    else state.resources[type] = (state.resources[type] || 0) + amount;
  });
  state.contractRewardClaimed = true;
  log(`Contract complete: ${currentContract().name}. Reward claimed.`);
}

function resetContractProgress(){
  state.contractProgress = {wood:0, kills:0, trader:0, boss:0, medical:0, rooms:0};
  state.contractRewardClaimed = false;
}

function ensureLootFilter(){
  RESOURCES.forEach(type => {
    if(type === 'ammo') return;
    if(typeof state.lootFilter[type] !== 'boolean') state.lootFilter[type] = true;
  });
}

function wantsLoot(type){
  if(type === 'ammo') return true;
  ensureLootFilter();
  return !!state.lootFilter[type];
}

function log(message){
  const el=document.createElement('div');
  el.className='log-entry';
  el.textContent=message;
  $('log').prepend(el);
}

function weightedPick(list){
  const total=list.reduce((s,i)=>s+i.weight,0);
  let r=Math.random()*total;
  for(const i of list){ r-=i.weight; if(r<=0) return i; }
  return list[0];
}

function costText(cost){ return Object.entries(cost).map(([k,v])=>`${ICONS[k]} ${v}`).join(' '); }
function canPay(cost){ return Object.entries(cost).every(([k,v])=>state.resources[k] >= v); }
function pay(cost){ Object.entries(cost).forEach(([k,v])=>state.resources[k]-=v); }

function applyUpgrades(){
  ensureSelectedDogUnlocked();
  const d=state.dog;
  Object.entries(UPGRADE_DEFS).forEach(([key,def])=>def.apply(state.upgrades[key],d));
  const dogDef=currentDogDef();
  d.name=dogDef.name; d.breed=dogDef.breed; d.sprite=dogDef.sprite;
  d.maxHp=d.maxHpBase+(d.level-1)*4+dogDef.hp+(state.equipment.armour.hp||0);
  d.attack=d.attackBase+Math.floor((d.level-1)*1.5)+dogDef.attack+(state.equipment.weapon.attack||0);
  d.defence=d.defenceBase+Math.floor((d.level-1)/3)+dogDef.defence+(state.equipment.armour.defence||0);
  d.crit=d.critBase+2+Math.floor((d.level-1)/2)+dogDef.crit+(state.equipment.weapon.crit||0)+(state.equipment.charm.crit||0);
  d.speed=Math.max(1,d.speedBase+dogDef.speed+Math.floor((state.perks.paws||0)/2));
  d.carryMax=d.carryMaxBase+dogDef.carry+(state.equipment.armour.carry||0);
  d.scoutRange=Math.max(1,d.scoutRange+dogDef.scout);
  d.extractBonus=(d.extractBonus||0)+dogDef.extract+(state.equipment.charm.extract||0)+(state.perks.goodBoy||0)*4;
  d.rareBonus=dogDef.rare+(state.equipment.charm.rare||0)+(state.perks.nose||0)*3+(hasConsumable('lucky')?10:0);
  d.ammoMax += (state.equipment.weapon.ammo||0);
  if(state.research.ammoPress) d.ammoMax += 5;
  if(state.research.paddedHarness){ d.carryMax += 10; d.defence += 1; }
  if(state.research.bossMap && state.combat?.enemy?.bossFight) d.crit += 5;
}

function computeRaidStats(){
  applyUpgrades();
  if(state.modifier?.speedBonus) state.dog.speed += state.modifier.speedBonus;
  if(state.modifier?.critBonus) state.dog.crit += state.modifier.critBonus;
  if(state.weather?.speed) state.dog.speed = Math.max(1, state.dog.speed + state.weather.speed + state.dog.weatherResistance);
}

function addXp(amount){
  state.dog.xp += amount;
  while(state.dog.xp >= state.dog.xpNext){
    state.dog.xp -= state.dog.xpNext;
    state.dog.level++;
    state.dog.xpNext=Math.round(state.dog.xpNext*1.35);
    log(`${state.dog.name} levelled up! Now level ${state.dog.level}.`);
  }
  applyUpgrades();
}

function buildTileTable(){
  const plan=currentPlan();
  return TILE_TYPES.map(tile=>{
    let weight=tile.weight;
    if(state.modifier?.crateBoost && ['crate','rare','weapon'].includes(tile.type)) weight+=5;
    if((state.modifier?.forestBoost || plan.forestBoost) && ['tree','grove'].includes(tile.type)) weight+=10;
    if(plan.scrapBoost && ['scrap','weapon'].includes(tile.type)) weight+=8;
    if(plan.medicalBoost && tile.type==='medical') weight+=10;
    if(state.modifier?.enemyBoost && tile.type==='enemy') weight+=7;
    if(state.modifier?.quiet && tile.type==='enemy') weight-=7;
    if(state.modifier?.rareBonus && tile.type==='rare') weight+=4;
    if(plan.focus==='boss' && tile.type==='enemy') weight+=4;
    return {...tile, weight:Math.max(1,weight)};
  });
}

function getTile(x,y){ return state.map.find(t=>t.x===x && t.y===y); }

function revealAround(x,y,range){
  const start = getTile(x,y);
  if(start?.links){
    const queue = [{tile:start, depth:0}];
    const visited = new Set();
    while(queue.length){
      const {tile, depth} = queue.shift();
      if(!tile || visited.has(tile.id) || depth > range) continue;
      visited.add(tile.id);
      if(!tile.seen){ tile.seen = true; state.revealedTiles++; }
      (tile.links || []).forEach(id => queue.push({tile:state.map[id], depth:depth+1}));
    }
    return;
  }

  for(let yy=y-range; yy<=y+range; yy++){
    for(let xx=x-range; xx<=x+range; xx++){
      const t=getTile(xx,yy);
      if(t && !t.seen){ t.seen=true; state.revealedTiles++; }
    }
  }
}

function connectNodes(a,b){
  if(!a.links.includes(b.id)) a.links.push(b.id);
  if(!b.links.includes(a.id)) b.links.push(a.id);
}

function nodeDistance(a,b){
  const dx = (a.left ?? 0) - (b.left ?? 0);
  const dy = (a.top ?? 0) - (b.top ?? 0);
  return Math.sqrt(dx*dx + dy*dy);
}

function biomeTileType(biome){
  const entries = biome.types.map(type => {
    let weight = biome.bias[type] || 1;
    const plan = currentPlan();
    if(plan.focus === 'wood' && ['tree','grove'].includes(type)) weight += 10;
    if(plan.focus === 'scrap' && ['scrap','weapon'].includes(type)) weight += 10;
    if(plan.focus === 'medical' && type === 'medical') weight += 10;
    if(plan.focus === 'boss' && type === 'enemy') weight += 6;
    if(state.modifier?.forestBoost && ['tree','grove'].includes(type)) weight += 6;
    if(state.modifier?.enemyBoost && type === 'enemy') weight += 6;
    return {type, weight};
  });
  return weightedPick(entries).type;
}

function rectsOverlap(a,b,pad=1){
  return !(a.gridX+a.w+pad <= b.gridX || b.gridX+b.w+pad <= a.gridX || a.gridY+a.h+pad <= b.gridY || b.gridY+b.h+pad <= a.gridY);
}

function carveDungeonRooms(){
  const biome = currentBiome();
  const plan = currentPlan();
  const cols = 12;
  const rows = 9;
  const roomTarget = 12 + state.zoneId * 2 + rand(4);
  const rooms = [];

  function makeRoom(id, gridX, gridY, w, h){
    return {
      id,
      x:id,
      y:0,
      gridX, gridY, w, h,
      left: 6 + ((gridX + w/2) / cols) * 88,
      top: 8 + ((gridY + h/2) / rows) * 84,
      widthPct: Math.max(6, (w / cols) * 82),
      heightPct: Math.max(7, (h / rows) * 78),
      type: biomeTileType(biome),
      roomName: pick(biome.rooms),
      biomeKey: Object.keys(BIOMES).find(k=>BIOMES[k]===biome),
      seen:false,
      cleared:false,
      links:[],
      locked:false,
      keyRoom:false,
      hazard:null,
    };
  }

  let attempts = 0;
  while(rooms.length < roomTarget && attempts < 220){
    attempts++;
    const w = 1 + rand(3);
    const h = 1 + rand(2);
    const gridX = rand(cols - w);
    const gridY = rand(rows - h);
    const candidate = makeRoom(rooms.length, gridX, gridY, w, h);
    if(rooms.every(r=>!rectsOverlap(candidate,r,0))) rooms.push(candidate);
  }

  // Fallback if random placement is too sparse.
  if(rooms.length < 8){
    rooms.length = 0;
    const coords = [[0,4],[2,2],[2,6],[4,4],[6,2],[6,6],[8,4],[10,4]];
    coords.forEach((c,i)=>rooms.push(makeRoom(i,c[0],c[1],1+rand(2),1)));
  }

  // Re-id after generation.
  rooms.forEach((r,i)=>{r.id=i; r.x=i;});

  // Connect each room to nearest previous room for guaranteed connected graph.
  const byLeft = rooms.slice().sort((a,b)=>a.left-b.left);
  for(let i=1;i<byLeft.length;i++){
    const room = byLeft[i];
    const previous = byLeft.slice(0,i).sort((a,b)=>nodeDistance(room,a)-nodeDistance(room,b))[0];
    connectNodes(room, previous);
  }

  // Add extra corridors for loops.
  rooms.forEach(room=>{
    const near = rooms.filter(r=>r.id!==room.id).sort((a,b)=>nodeDistance(room,a)-nodeDistance(room,b)).slice(0,3);
    near.forEach(other=>{ if(Math.random()<.32) connectNodes(room, other); });
  });

  // Assign hazards and locks.
  rooms.forEach(room=>{
    if(Math.random()<.32){
      const weighted = biome.name === 'Sewer' ? ['flooded','dark','infested','locked'] :
        biome.name === 'Factory' ? ['collapsing','locked','dark','infested'] :
        biome.name === 'Farmland' ? ['overgrown','locked','infested','flooded'] :
        ['dark','collapsing','locked','infested'];
      room.hazard = pick(weighted);
      if(room.hazard === 'locked') room.locked = true;
    }
  });

  // Ensure at least one key room if locked rooms exist.
  const lockedRooms = rooms.filter(r=>r.locked);
  if(lockedRooms.length){
    const keyCandidates = rooms.filter(r=>!r.locked);
    const keyRoom = keyCandidates.length ? pick(keyCandidates) : rooms[0];
    keyRoom.keyRoom = true;
    keyRoom.roomName = 'Key Cache';
    keyRoom.type = keyRoom.type === 'base' ? 'crate' : keyRoom.type;
  }

  return rooms;
}

function generateMap(){
  const zone=currentZone();
  const biome=currentBiome();
  const plan=currentPlan();
  state.currentBoss = chooseDungeonBoss();
  state.map=[]; state.mapSize=zone.mapSize; state.revealedTiles=0;

  state.map = carveDungeonRooms();

  // Pick entrance and boss rooms from opposite sides.
  const entrance = state.map.slice().sort((a,b)=>a.left-b.left)[0];
  const boss = state.map.slice().sort((a,b)=>b.left-a.left)[0];
  entrance.type = 'base';
  entrance.roomName = 'Kennel Entrance';
  entrance.seen = true;
  entrance.cleared = true;
  entrance.locked = false;
  entrance.hazard = null;
  boss.type = 'boss';
  boss.roomName = `${state.currentBoss.name}'s Den`;
  boss.seen = !!state.research.bossMap;
  boss.cleared = false;
  boss.locked = false;
  boss.hazard = boss.hazard === 'locked' ? null : boss.hazard;

  // Connect adjacent grid rooms as corridors.
  state.map.forEach(room => {
    state.map.forEach(other => {
      if(room.id === other.id) return;
      const manhattan = Math.abs(room.gridX-other.gridX) + Math.abs(room.gridY-other.gridY);
      if(manhattan === 1) connectNodes(room, other);
    });
  });

  // If a room was isolated because of scattered placement, connect to nearest.
  state.map.forEach(room => {
    if(room.links.length) return;
    const nearest = state.map.filter(o=>o.id!==room.id).sort((a,b)=>nodeDistance(room,a)-nodeDistance(room,b))[0];
    if(nearest) connectNodes(room, nearest);
  });

  // Ensure entrance-to-boss route by connecting rooms in left-to-right order if needed.
  const route = state.map.slice().sort((a,b)=>a.left-b.left);
  for(let i=0;i<route.length-1;i++){
    if(Math.random()<.55 || route[i].links.length<2) connectNodes(route[i], route[i+1]);
  }

  // Add biome/plan flavour on branches.
  state.map.forEach(room => {
    if(room.type === 'base' || room.type === 'boss') return;
    if(plan.focus==='wood' && Math.random()<.35) room.type = Math.random()<.6 ? 'tree' : 'grove';
    if(plan.focus==='scrap' && Math.random()<.35) room.type = Math.random()<.6 ? 'scrap' : 'weapon';
    if(plan.focus==='medical' && Math.random()<.35) room.type = 'medical';
    if(plan.focus==='boss' && Math.random()<.22) room.type = 'enemy';
  });

  state.position={x:entrance.x,y:entrance.y};
  revealAround(entrance.x,entrance.y,state.dog.scoutRange);
  state.encounterText = `${biome.icon} Entered ${biome.name}: ${biome.desc}`;
}

function mapPoint(tile){
  if(tile && typeof tile.left === 'number' && typeof tile.top === 'number'){
    return {left:tile.left, top:tile.top};
  }
  const size=Math.max(1,state.mapSize-1);
  const jitterSeed=(tile.x*37+tile.y*53)%9;
  const jitterX=(jitterSeed-4)*.55;
  const jitterY=((tile.x*19+tile.y*29)%9-4)*.55;
  return {left:clamp(6+(tile.x/size)*88+jitterX,4,96), top:clamp(8+(tile.y/size)*84+jitterY,5,95)};
}
function randomMapPosition(){ return {left:8+Math.random()*84, top:9+Math.random()*82}; }
function distance(a,b){ const dx=a.left-b.left, dy=a.top-b.top; return Math.sqrt(dx*dx+dy*dy); }
function dogMapPosition(){ return mapPoint(getTile(state.position.x,state.position.y)||getTile(0,0)); }

function generateRoamingEnemies(){
  const plan=currentPlan();
  let count=3+state.zoneId+(state.modifier?.enemyBoost?2:0)+(plan.roamers||0);
  if(plan.enemy < 1) count=Math.max(1,Math.floor(count*plan.enemy));
  state.roamEnemies=[];
  for(let i=0;i<count;i++){
    const template=pick(currentZone().enemies);
    const pos=randomMapPosition();
    const hp=Math.round(template.hp*(state.weather?.enemy||1)*plan.enemy);
    state.roamEnemies.push({id:`roamer-${Date.now()}-${i}`,template,sprite:template.sprite,name:template.name,hp,maxHp:hp,left:pos.left,top:pos.top,targetLeft:pos.left,targetTop:pos.top,active:true,aggro:(8+state.zoneId*1.5+(template.behavior==='chaser'?4:0))*(hasConsumable('decoy')?.72:1)});
  }
}

function updateRoamingEnemies(){
  if(!state.running || state.mode==='combat' || state.mode==='choice') return;
  const dogPos=dogMapPosition();
  state.roamEnemies.forEach(enemy=>{
    if(!enemy.active) return;
    if(Math.random()<.28 || distance(enemy,{left:enemy.targetLeft,top:enemy.targetTop})<3){
      const chase=distance(enemy,dogPos)<enemy.aggro*2.2 || enemy.template.behavior==='chaser';
      if(chase){ enemy.targetLeft=dogPos.left+(Math.random()*10-5); enemy.targetTop=dogPos.top+(Math.random()*10-5); }
      else { const next=randomMapPosition(); enemy.targetLeft=next.left; enemy.targetTop=next.top; }
    }
    const speed=enemy.template.behavior==='chaser'?2.8:2.2;
    enemy.left+=clamp(enemy.targetLeft-enemy.left,-speed,speed);
    enemy.top+=clamp(enemy.targetTop-enemy.top,-speed,speed);
    enemy.left=clamp(enemy.left,4,96); enemy.top=clamp(enemy.top,5,95);
    if(distance(enemy,dogPos)<enemy.aggro) startCombat(enemy.template,false,enemy.id);
  });
}

function tilePriority(tile){
  if(currentPlan().focus==='boss' && tile.type==='boss') return 12;
  if(tile.type==='boss') return state.dog.level>=2 ? 6 : 1;
  const p={rare:10,weapon:9,medical:8,trader:8,crate:7,scrap:7,grove:7,tree:6,food:6,water:6,event:6,enemy:4,empty:2};
  if(currentPlan().focus==='wood' && ['tree','grove'].includes(tile.type)) return 12;
  if(currentPlan().focus==='scrap' && ['scrap','weapon'].includes(tile.type)) return 12;
  if(currentPlan().focus==='medical' && ['medical','event'].includes(tile.type)) return 12;
  return p[tile.type]||1;
}

function chooseTargetTile(){
  const open=state.map.filter(t=>!t.cleared && t.type!=='base');
  const normal=currentPlan().boss ? open : open.filter(t=>t.type!=='boss');
  const pool=normal.length?normal:open;
  pool.sort((a,b)=>{
    const current=getTile(state.position.x,state.position.y);
    const da=current?.links ? nodeDistance(current,a) : Math.abs(a.x-state.position.x)+Math.abs(a.y-state.position.y);
    const db=current?.links ? nodeDistance(current,b) : Math.abs(b.x-state.position.x)+Math.abs(b.y-state.position.y);
    const pa=tilePriority(a), pb=tilePriority(b);
    if(pa!==pb) return pb-pa;
    return da-db;
  });
  return pool[0]||null;
}

function stepToward(target){
  const current = getTile(state.position.x,state.position.y);
  if(current?.links?.length){
    const linked = current.links.map(id=>state.map[id]).filter(Boolean);
    if(linked.includes(target)) return target;
    linked.sort((a,b)=>nodeDistance(a,target)-nodeDistance(b,target));
    return linked[0];
  }

  const dx=target.x-state.position.x, dy=target.y-state.position.y;
  let next;
  if(Math.abs(dx)>=Math.abs(dy) && dx) next=getTile(state.position.x+Math.sign(dx),state.position.y);
  if(!next && dy) next=getTile(state.position.x,state.position.y+Math.sign(dy));
  if(!next && dx) next=getTile(state.position.x+Math.sign(dx),state.position.y);
  return next;
}

function inventoryTypesUsed(){ return RESOURCES.filter(type=>type!=='ammo' && state.raidLoot[type]>0).length; }
function hasInventorySlotFor(type){ return type==='ammo' || state.raidLoot[type]>0 || inventoryTypesUsed()<state.dog.inventorySlots; }

function lowestPriorityLootType(){
  const active = RESOURCES.filter(type => type !== 'ammo' && state.raidLoot[type] > 0);
  if(!active.length) return null;
  const filteredOut = active.find(type => !wantsLoot(type));
  if(filteredOut) return filteredOut;
  const priority = {gunParts:9, medicine:8, metal:7, wood:6, fabric:5, food:4, water:4};
  active.sort((a,b)=>(priority[a]||1)-(priority[b]||1));
  return active[0];
}

function dropLoot(type, amount=1){
  if(type === 'ammo') {
    state.dog.ammo = Math.max(0, state.dog.ammo - amount);
    state.raidLoot.ammo = Math.max(0, state.raidLoot.ammo - amount);
    log(`Dropped ${amount} ammo.`);
    render();
    return;
  }
  const dropped = Math.min(amount, state.raidLoot[type] || 0);
  state.raidLoot[type] -= dropped;
  state.dog.carry = Math.max(0, state.dog.carry - dropped);
  log(`Dropped ${dropped} ${type}.`);
  render();
}

function dropStack(type){
  if(type === 'ammo') return dropLoot(type, Math.max(1, state.dog.ammo));
  return dropLoot(type, state.raidLoot[type] || 0);
}

function makeSpaceFor(type){
  if(hasInventorySlotFor(type)) return true;
  const dropType = lowestPriorityLootType();
  if(!dropType || dropType === type) return false;
  dropStack(dropType);
  log(`Auto-swapped pack space: dropped ${dropType} to make room for ${type}.`);
  return hasInventorySlotFor(type);
}

function addRaidLoot(type,amount){
  if(!wantsLoot(type) && type !== 'medicine'){
    state.encounterText = `Ignored ${type} due to loot filter.`;
    return 0;
  }
  if(!hasInventorySlotFor(type) && !makeSpaceFor(type)){ state.encounterText=`No inventory slot for ${type}. Drop items or upgrade Backpack Rack.`; return 0; }
  if(type==='ammo'){
    const gain=clamp(amount,0,state.dog.ammoMax-state.dog.ammo);
    state.dog.ammo+=gain; state.raidLoot.ammo+=gain; return gain;
  }
  if(state.dog.carry>=state.dog.carryMax){
    const dropType = lowestPriorityLootType();
    if(dropType && dropType !== type){
      dropLoot(dropType, Math.min(state.raidLoot[dropType], Math.max(1, amount)));
      log(`Auto-swapped carry space: dropped ${dropType} for ${type}.`);
    } else {
      return 0;
    }
  }
  const gain=clamp(amount,0,state.dog.carryMax-state.dog.carry);
  state.raidLoot[type]+=gain; state.dog.carry+=gain; if(type==='wood') state.contractProgress.wood=(state.contractProgress.wood||0)+gain; return gain;
}

function bundleFor(type){
  return {
    crate:['food','water','wood','metal','fabric'],
    tree:['wood','wood','wood','fabric','food'],
    grove:['wood','wood','wood','fabric','food','medicine'],
    food:['food','food','water'], water:['water','water','medicine'],
    scrap:['wood','metal','metal','fabric'], medical:['medicine','medicine','water'],
    weapon:['gunParts','metal','ammo'], rare:['gunParts','medicine','metal','fabric','food'],
  }[type]||['food'];
}

function maybeDropGear(sourceType){
  const chance=(sourceType==='rare'?32:sourceType==='weapon'?22:7)+state.dog.rareBonus+(currentPlan().focus==='scrap'?6:0);
  if(Math.random()*100>chance) return;
  const category=pick(['weapon','armour','charm']);
  const pool=GEAR_POOLS[category];
  let item=pick(pool);
  if(Math.random()*100<state.dog.rareBonus) item=pool[pool.length-1];
  if(!state.equipmentInventory[category]) state.equipmentInventory[category] = [];
  const exists = state.equipmentInventory[category].some(i => i.name === item.name);
  if(!exists) state.equipmentInventory[category].push({...item});
  const current=state.equipment[category];
  if(item.score>current.score){
    state.equipment[category]={...item};
    log(`Gear drop! Equipped ${item.rarity} ${item.name} in ${category} slot.`);
    applyUpgrades();
  } else {
    addRaidLoot('metal',1);
    log(`Gear drop found (${item.name}). Added to inventory and scrapped a spare bit for metal.`);
  }
}

function lootTile(tile){
  const zone=currentZone(), plan=currentPlan(), bundle=bundleFor(tile.type);
  const tries=tile.type==='rare'?5+rand(3):2+rand(3);
  const found=[];
  for(let i=0;i<tries;i++){
    const type=pick(bundle);
    const mult=(zone.baseLoot[type]||1)*(state.weather?.loot||1)*plan.loot;
    const amount=Math.max(1,Math.round((1+rand(tile.type==='rare'?3:2))*mult));
    const gain=addRaidLoot(type,amount);
    if(gain) found.push(`${ICONS[type]} ${gain}`);
  }
  maybeDropGear(tile.type);
  tile.cleared=true;
  if(tile.type==='medical') state.contractProgress.medical++;
  state.contractProgress.rooms++;
  state.threat+=tile.type==='rare'?7:3;
  state.encounterText=`Looted ${tile.type}: ${found.join(' ')||'pack full'}.`;
  log(`${state.dog.name} looted ${tile.type}: ${found.join(' ')||'pack full'}.`);
}


function expensivePrice(base, mult=1){
  return Math.max(1, Math.round(base * mult * (1 + state.zoneId * .35)));
}

function traderOffers(){
  const biome = currentBiome();
  const offers = [
    {label:'Buy Med Pack', desc:'Expensive emergency medicine.', cost:{food:expensivePrice(5), water:expensivePrice(4), metal:expensivePrice(3)}, effect:()=>{state.resources.medicine += 4; log('Bought a pricey med pack.');}},
    {label:'Buy Wood Bundle', desc:'Overpriced but useful if upgrades are blocked.', cost:{food:expensivePrice(4), water:expensivePrice(3), metal:expensivePrice(4)}, effect:()=>{state.resources.wood += 10; log('Bought an expensive wood bundle.');}},
    {label:'Buy Gun Parts', desc:'Rare parts. Painfully expensive.', cost:{metal:expensivePrice(10), wood:expensivePrice(8), fabric:expensivePrice(5)}, effect:()=>{state.resources.gunParts += 4; log('Bought rare gun parts.');}},
    {label:'Buy Ammo Box', desc:'Combat insurance, but very poor value.', cost:{metal:expensivePrice(6), gunParts:expensivePrice(2), food:expensivePrice(4)}, effect:()=>{state.resources.ammo += 8; log('Bought an overpriced ammo box.');}},
    {label:'Buy Mystery Weapon', desc:'Very expensive gear roll.', cost:{metal:expensivePrice(16), gunParts:expensivePrice(8), medicine:expensivePrice(3)}, effect:()=>{maybeDropGear('rare'); log('Bought a mystery weapon crate from the trader.');}},
  ];

  if(biome.name === 'Sewer') offers.push({label:'Buy Clean Water', desc:'Sewer trader has clean water, somehow.', cost:{metal:expensivePrice(4), food:expensivePrice(4)}, effect:()=>{state.resources.water += 12; log('Bought clean water.');}});
  if(biome.name === 'Factory') offers.push({label:'Buy Factory Scrap', desc:'Heavy metal bundle.', cost:{food:expensivePrice(5), water:expensivePrice(5), medicine:expensivePrice(2)}, effect:()=>{state.resources.metal += 12; log('Bought factory scrap.');}});
  if(biome.name === 'Farmland') offers.push({label:'Buy Farm Supplies', desc:'Food and wood at a markup.', cost:{metal:expensivePrice(7), fabric:expensivePrice(4)}, effect:()=>{state.resources.food += 8; state.resources.wood += 8; log('Bought farm supplies.');}});

  return offers;
}


function hubTraderOffers(){
  return [
    {label:'Kennel Med Crate', desc:'Adds 6 medicine. Expensive but reliable.', cost:{food:10, water:10, metal:8}, effect:()=>{state.resources.medicine += 6;}},
    {label:'Bulk Wood Delivery', desc:'Adds 18 wood for base upgrades.', cost:{food:12, water:8, metal:10}, effect:()=>{state.resources.wood += 18;}},
    {label:'Gun Parts Cache', desc:'Adds 6 gun parts.', cost:{metal:18, wood:14, medicine:4}, effect:()=>{state.resources.gunParts += 6;}},
    {label:'Ammo Resupply', desc:'Adds 18 ammo. Very poor value, but handy.', cost:{metal:12, food:8, gunParts:3}, effect:()=>{state.resources.ammo += 18;}},
    {label:'Mystery Gear Deal', desc:'Rolls a rare gear drop.', cost:{metal:24, gunParts:10, medicine:5}, effect:()=>{maybeDropGear('rare');}},
  ];
}

function buyHubOffer(index){
  if(state.running){ log('Hub trader is only available between raids.'); return; }
  const offer = hubTraderOffers()[index];
  if(!offer) return;
  if(!canAffordFromResources(offer.cost)){
    log(`Cannot afford ${offer.label}.`);
    return;
  }
  payFromResources(offer.cost);
  offer.effect();
  log(`Hub trader purchase: ${offer.label}.`);
  save();
  render();
}

function canAffordFromResources(cost){
  return Object.entries(cost).every(([k,v]) => (state.resources[k] || 0) >= v);
}

function payFromResources(cost){
  Object.entries(cost).forEach(([k,v]) => state.resources[k] -= v);
}

function beginTraderChoice(tile){
  state.mode='choice';
  state.activeEventTile=tile;
  const offers = traderOffers();
  state.pendingChoice = {
    text:'A travelling trader has set up a guarded stall. Prices are awful, but the goods are useful.',
    options:[
      ...offers.slice(0,4).map(offer => ({
        label:`${offer.label} (${costText(offer.cost)})`,
        effect:()=>{
          if(canAffordFromResources(offer.cost)){
            payFromResources(offer.cost);
            offer.effect();
          } else {
            log('Could not afford the trader price.');
          }
        }
      })),
      {label:'Walk away', effect:()=>{state.threat=Math.max(0,state.threat-3); log('Ignored the trader and kept moving.');}},
    ],
  };
  state.contractProgress.trader = 1;
  state.encounterText='Raid trader found. Choose whether to buy, or walk away.';
  render();
}

function beginEventChoice(tile){
  state.mode='choice';
  state.activeEventTile=tile;
  const events=[
    {
      text:'You find an abandoned shed tucked behind some trees.',
      options:[
        {label:'Break in', effect:()=>{addRaidLoot('wood',4+rand(4)); addRaidLoot('metal',1+rand(2)); state.dog.hp=Math.max(1,state.dog.hp-3); log('Broke into the shed and grabbed materials, but took a knock.');}},
        {label:'Sniff around', effect:()=>{addRaidLoot('wood',2+rand(3)); addRaidLoot('fabric',1+rand(2)); log('Sniffed around safely and found useful scraps.');}},
        {label:'Ignore', effect:()=>{state.threat=Math.max(0,state.threat-4); log('Ignored the shed and kept a low profile.');}},
      ],
    },
    {
      text:'A wounded trader offers a risky swap.',
      options:[
        {label:'Trade medicine', effect:()=>{if(state.raidLoot.medicine>0){state.raidLoot.medicine--; addRaidLoot('gunParts',2); log('Traded medicine for gun parts.');} else {addRaidLoot('wood',2); log('No medicine to trade, but the trader gives directions to wood.');}}},
        {label:'Help them', effect:()=>{state.dog.hp=Math.min(state.dog.maxHp,state.dog.hp+state.dog.medkitPower); addRaidLoot('food',2); log('Helped the trader and got supplies.');}},
        {label:'Walk away', effect:()=>{state.threat=Math.max(0,state.threat-6); log('Walked away quietly.');}},
      ],
    },
    {
      text:'A noisy crate is wedged under a fallen tree.',
      options:[
        {label:'Force it open', effect:()=>{addRaidLoot('wood',3); addRaidLoot('gunParts',1); state.threat+=8; maybeDropGear('weapon'); log('Forced the crate open. Good haul, loud noise.');}},
        {label:'Cut branches', effect:()=>{addRaidLoot('wood',5+rand(3)); log('Harvested branches and left the crate.');}},
        {label:'Mark it for later', effect:()=>{state.threat=Math.max(0,state.threat-3); addRaidLoot('fabric',1); log('Marked the crate and moved on.');}},
      ],
    },
  ];
  state.pendingChoice=pick(events);
  state.encounterText='Awaiting map event choice.';
  render();
}

function resolveChoice(index){
  if(!state.pendingChoice) return;
  const option=state.pendingChoice.options[index];
  if(option) option.effect();
  if(state.activeEventTile){ state.activeEventTile.cleared=true; state.activeEventTile.type='empty'; }
  state.pendingChoice=null; state.activeEventTile=null; state.mode='roaming';
  render();
}

function startCombat(enemy,bossFight=false,sourceId=null){
  if(state.mode==='combat') return;
  if(!bossFight && hasConsumable('smoke')){
    useConsumable('smoke');
    state.encounterText = 'Smoke Biscuit used! Fight avoided safely.';
    log(state.encounterText);
    if(sourceId){ const roamer=state.roamEnemies.find(enemy=>enemy.id===sourceId); if(roamer) roamer.active=false; }
    return;
  }
  state.mode='combat';
  const hp=Math.round(enemy.hp*(state.weather?.enemy||1)*currentPlan().enemy);
  state.combat={enemy:{...enemy,hp,maxHp:hp,atk:Math.round(enemy.atk*(state.weather?.enemy||1)*currentPlan().enemy),bossFight,sourceId,round:0}};
  state.threat+=bossFight?18:8;
  state.encounterText=`${bossFight?'Boss fight!':'Combat!'} ${state.dog.name} engages ${enemy.name}.`;
  log(state.encounterText);
}

function enemyBehaviourHit(e,notes){
  if(e.behavior==='stealFood' && Math.random()<.35){
    const stolen=state.raidLoot.food>0?'food':state.raidLoot.water>0?'water':null;
    if(stolen){ state.raidLoot[stolen]--; state.dog.carry=Math.max(0,state.dog.carry-1); notes.push(`${e.name} steals ${stolen}!`); }
  }
  if(e.behavior==='stealScrap' && Math.random()<.35){
    const stolen=state.raidLoot.metal>0?'metal':state.raidLoot.wood>0?'wood':null;
    if(stolen){ state.raidLoot[stolen]--; state.dog.carry=Math.max(0,state.dog.carry-1); notes.push(`${e.name} pinches ${stolen}!`); }
  }
  if(e.behavior==='swarm' && Math.random()<.35){
    state.threat+=Math.max(1,4-(state.perks.bark||0)); notes.push(`${e.name} calls more trouble. Threat rises.`);
  }
  if(e.behavior==='hazards' && Math.random()<.25){
    state.dog.hp=Math.max(1,state.dog.hp-3); notes.push('Scrap hazards cut across the floor.');
  }
}

function bossMechanic(e,notes){
  if(!e.bossFight) return;
  e.round++;
  if(e.behavior==='summon' && e.round%3===0){ state.dog.hp=Math.max(1,state.dog.hp-4); notes.push('Rat King summons a bitey swarm.'); }
  if(e.behavior==='chaseBoss' && e.round%2===0){ state.threat+=5; notes.push('Stray Captain pressures the route. Threat rises.'); }
  if(e.behavior==='armourCheck' && state.dog.attack<24 && e.round%2===0){ state.dog.hp=Math.max(1,state.dog.hp-5); notes.push('Alpha Hound punishes weak weapons.'); }
  if(e.behavior==='hazards' && e.round%2===0){ state.dog.hp=Math.max(1,state.dog.hp-4); state.threat+=3; notes.push(`${e.name} scatters scrap hazards.`); }
  if(e.behavior==='lootStealBoss' && e.round%3===0){
    const stolen = ['food','water','wood','metal','fabric'].find(k => state.raidLoot[k] > 0);
    if(stolen){ state.raidLoot[stolen]--; state.dog.carry=Math.max(0,state.dog.carry-1); notes.push(`${e.name} steals ${stolen} from the pack.`); }
  }
  if(e.behavior==='bleedBoss' && e.round%2===0){ state.dog.hp=Math.max(1,state.dog.hp-3); notes.push(`${e.name} causes a nasty bleed.`); }
  if(e.behavior==='poisonBoss' && e.round%2===0){ state.dog.hp=Math.max(1,state.dog.hp-2); state.threat+=2; notes.push(`${e.name}'s filth wears ${state.dog.name} down.`); }
  if(e.behavior==='stealBoss' && e.round%3===0){
    const stolen = state.raidLoot.metal>0?'metal':state.raidLoot.gunParts>0?'gunParts':null;
    if(stolen){ state.raidLoot[stolen]--; state.dog.carry=Math.max(0,state.dog.carry-1); notes.push(`${e.name} swipes ${stolen}.`); }
  }
  if(e.behavior==='burnBoss' && e.round%2===0){ state.dog.hp=Math.max(1,state.dog.hp-5); notes.push(`${e.name} burns through armour with furnace heat.`); }
}

function fightRound(){
  if(!state.combat) return;
  const e=state.combat.enemy;
  const hasAmmo=state.dog.ammo>0;
  const crit=Math.random()*100<state.dog.crit;
  const outgoing=Math.max(1,state.dog.attack+(hasAmmo?3:0)-e.def+(crit?6:0));
  if(hasAmmo) state.dog.ammo--;
  e.hp-=outgoing;
  const notes=[`${state.dog.name} hits ${e.name} for ${outgoing}${crit?' crit':''}.`];

  if(e.hp<=0){ log(notes.join(' ')); winCombat(e); return; }

  bossMechanic(e,notes);
  const dodgeChance=Math.min(28,state.dog.speed*4+(state.research.bossMap && e.bossFight?3:0));
  if(Math.random()*100<dodgeChance){ notes.push(`${state.dog.name} dodges the counterattack.`); }
  else {
    const incoming=Math.max(1,e.atk-state.dog.defence);
    state.dog.hp-=incoming;
    notes.push(`${e.name} hits back for ${incoming}.`);
    enemyBehaviourHit(e,notes);
  }

  if(state.dog.hp>0 && state.dog.hp <= Math.ceil(state.dog.maxHp*.3) && hasConsumable('medkit')){
    useConsumable('medkit');
    const heal = Math.ceil(state.dog.maxHp*.45);
    state.dog.hp = Math.min(state.dog.maxHp, state.dog.hp + heal);
    notes.push(`Emergency Medkit triggers for ${heal} HP.`);
  }

  if(state.dog.hp<=0){ state.dog.hp=0; log(notes.join(' ')); state.encounterText=`${state.dog.name} was beaten by ${e.name} and retreated to the kennel.`; endRaid(false); return; }

  if(state.dog.hp<=Math.ceil(state.dog.maxHp*.35) && state.raidLoot.medicine>0){
    state.raidLoot.medicine--; state.dog.carry=Math.max(0,state.dog.carry-1);
    state.dog.hp=Math.min(state.dog.maxHp,state.dog.hp+state.dog.medkitPower);
    notes.push(`${state.dog.name} uses a bandage for ${state.dog.medkitPower} HP.`);
  }
  state.encounterText=notes.join(' ');
  log(notes.join(' '));
}

function winCombat(e){
  Object.entries(e.reward).forEach(([k,v])=>addRaidLoot(k,v));
  addXp(e.xp||5);
  state.contractProgress.kills=(state.contractProgress.kills||0)+1;
  if(e.bossFight) state.contractProgress.boss=1;
  state.dog.hp=Math.min(state.dog.maxHp,state.dog.hp+state.dog.healBetween);
  if(e.sourceId){ const roamer=state.roamEnemies.find(enemy=>enemy.id===e.sourceId); if(roamer) roamer.active=false; }
  const tile=getTile(state.position.x,state.position.y);
  if(tile && !e.sourceId){ tile.cleared=true; tile.type=e.bossFight?'boss':'empty'; }
  maybeDropGear(e.bossFight?'rare':'enemy');

  if(e.bossFight){
    state.encounterText=`Boss defeated! ${e.name} has been beaten.`;
    log(`Boss defeated! ${e.name} drops a huge haul.`);
    if(state.unlockedZones<ZONES.length && state.zoneId===state.unlockedZones-1){
      state.unlockedZones++;
      log(`New zone unlocked: ${ZONES[state.unlockedZones-1].name}.`);
    }
    state.combat=null; state.mode='roaming'; endRaid(true,true); return;
  }
  state.encounterText=`${state.dog.name} defeated ${e.name} and keeps moving.`;
  state.combat=null; state.mode='roaming';
}

function weatherDrain(){
  const drain=Math.max(0,(state.weather?.thirst||0)-state.dog.weatherResistance);
  if(drain>0 && Math.random()<.35){ state.dog.hp=Math.max(1,state.dog.hp-drain); log(`${state.weather.name} wears ${state.dog.name} down for ${drain} HP.`); }
}


function roomHazardTag(tile){
  if(tile.keyRoom) return '🗝️';
  if(tile.locked) return '🔒';
  if(tile.hazard && HAZARDS[tile.hazard]) return HAZARDS[tile.hazard].icon;
  return '';
}

function tryUnlockRoom(tile){
  if(!tile.locked) return true;
  if(state.dungeonKeys > 0){
    state.dungeonKeys--;
    tile.locked = false;
    tile.hazard = null;
    log(`${state.dog.name} used a dungeon key to unlock ${tile.roomName}.`);
    return true;
  }
  const forceCost = currentBiome().name === 'Factory' ? {gunParts:1, metal:2} : {wood:2, metal:1};
  if(Object.entries(forceCost).every(([k,v]) => state.raidLoot[k] >= v)){
    Object.entries(forceCost).forEach(([k,v]) => { state.raidLoot[k]-=v; state.dog.carry=Math.max(0,state.dog.carry-v); });
    tile.locked = false;
    tile.hazard = null;
    state.threat += 6;
    log(`${state.dog.name} forced open ${tile.roomName} using raid loot. Threat rises.`);
    return true;
  }
  state.encounterText = `${tile.roomName} is locked. Find a key or carry wood/metal/gun parts to force it.`;
  log(state.encounterText);
  tile.cleared = true;
  return false;
}

function applyRoomHazard(tile){
  if(!tile.hazard || tile.locked || tile.cleared) return;
  const hazard = tile.hazard;
  if(hazard === 'flooded'){
    addRaidLoot('water', 1+rand(2));
    state.threat += 1;
    log('Flooded room: movement is slow, but water is found.');
  }
  if(hazard === 'dark' && Math.random()<.45){
    log('Dark room ambush!');
    startCombat(pick(currentZone().enemies), false);
  }
  if(hazard === 'overgrown'){
    addRaidLoot('wood', 2+rand(3));
    if(Math.random()<.25) startCombat(pick(currentZone().enemies), false);
  }
  if(hazard === 'collapsing'){
    state.threat += 9;
    state.dog.hp = Math.max(1, state.dog.hp - 2);
    log('Collapsing room: threat rises and debris clips the dog.');
  }
  if(hazard === 'infested'){
    state.threat += 4;
    if(Math.random()<.7) startCombat(pick(currentZone().enemies), false);
    else addRaidLoot('food', 1+rand(2));
  }
}

function resolveTile(tile){
  if(!tile || tile.cleared || tile.type==='base') return;
  if(!tryUnlockRoom(tile)) return;
  if(tile.keyRoom){
    state.dungeonKeys++;
    tile.keyRoom = false;
    log(`${state.dog.name} found a dungeon key.`);
  }
  applyRoomHazard(tile);
  if(state.mode === 'combat') return;
  if(['crate','tree','grove','food','water','scrap','medical','weapon','rare'].includes(tile.type)) lootTile(tile);
  else if(tile.type==='event') beginEventChoice(tile);
  else if(tile.type==='trader') beginTraderChoice(tile);
  else if(tile.type==='enemy'){ startCombat(pick(currentZone().enemies),false); if(state.mode !== 'combat'){ tile.cleared=true; tile.type='empty'; state.contractProgress.rooms++; } }
  else if(tile.type==='boss') startCombat(state.currentBoss || currentZone().boss,true);
  else { tile.cleared=true; state.encounterText='Quiet block. Nothing useful here.'; }

  weatherDrain();

  if(state.threat>=100 && state.mode!=='combat' && state.mode!=='choice'){
    if(state.autoExtract && state.autoExtractRule !== 'off'){
      log('Threat hit 100%. Auto-Extract attempts an emergency retreat.');
      endRaid(Math.random()*100<extractChance());
      return;
    }
    state.encounterText = `Threat is maxed. ${state.dog.name} keeps going because Auto-Extract is off.`;
    log(`Threat is maxed, but Auto-Extract is off. ${state.dog.name} keeps going.`);
  }

  if(state.dog.carry>=state.dog.carryMax && state.mode!=='combat' && state.mode!=='choice'){
    if(state.autoExtract && state.autoExtractRule === 'pack'){
      log(`${state.dog.name}'s pack is full. Auto-Extract: Pack Full triggered.`);
      endRaid(true);
      return;
    }
    state.encounterText = `${state.dog.name}'s pack is full. New loot will be ignored or swapped; raid continues.`;
    log(`${state.dog.name}'s pack is full, but Auto-Extract is off/not Pack Full, so the raid continues.`);
  }
}

function moveDog(){
  const current=getTile(state.position.x,state.position.y);
  if(current && !current.cleared && current.type!=='base'){ resolveTile(current); return; }
  const target=chooseTargetTile();
  if(!target){ endRaid(true); return; }
  const next=stepToward(target);
  if(!next){ endRaid(true); return; }
  state.position={x:next.x,y:next.y};
  revealAround(next.x,next.y,state.dog.scoutRange);
  resolveTile(next);
}

function extractChance(){ return clamp(95-state.threat+state.dog.extractBonus+state.dog.speed*2+(currentPlan().extract||0),25,100); }

function shouldAutoExtract(){
  if(!state.autoExtract || state.autoExtractRule === 'off' || !state.running || state.mode === 'combat' || state.mode === 'choice') return false;
  const hpPct = state.dog.hp / Math.max(1, state.dog.maxHp) * 100;
  if(state.autoExtractRule === 'safe') return hpPct <= 45 || state.threat >= 75;
  if(state.autoExtractRule === 'balanced') return hpPct <= 35 || state.threat >= 85;
  if(state.autoExtractRule === 'greedy') return hpPct <= 25 || state.threat >= 95;
  if(state.autoExtractRule === 'pack') return state.dog.carry >= state.dog.carryMax;
  if(state.autoExtractRule === 'boss') return false; // boss victory already extracts through bossClear
  return false;
}

function tickRaid(){
  state.seconds++;
  if(state.mode!=='choice') state.threat=clamp(state.threat+(state.modifier?.bossRush?1.2:.65)+(state.weather?.threat||0)/30,0,100);
  updateRoamingEnemies();
  if(shouldAutoExtract()){
    log(`Auto-Extract triggered by ${state.autoExtractRule} rule.`);
    endRaid(Math.random()*100 < extractChance());
    return;
  }
  if(state.mode==='combat') fightRound();
  else if(state.mode==='roaming'){
    const interval=Math.max(1,4-state.dog.speed);
    if(state.seconds%interval===0) moveDog();
  }
  render();
}

function startRaid(){
  if(state.running) return;
  state.zoneId=Number($('zoneSelect').value);
  state.planId=$('planSelect').value;
  state.dogId=$('dogSelect').value;
  state.contractId=$('contractSelect').value;
  state.activeConsumables=[...state.selectedConsumables];
  state.consumableUsed={};
  resetContractProgress();
  state.dungeonKeys=0;
  if(state.autoExtractRule === 'off') state.autoExtract = false;
  state.weather=pick(WEATHER); state.modifier=pick(MODIFIERS);
  state.running=true; state.mode='roaming'; state.seconds=0;
  state.threat=clamp(8+(state.weather.threat||0)+(state.modifier.threat||0)+(currentPlan().threat||0),0,70);
  state.raidLoot=emptyRes(); state.combat=null; state.pendingChoice=null; state.activeEventTile=null;
  state.encounterText='Raid started.';
  computeRaidStats();
  state.dog.hp=state.dog.maxHp; state.dog.carry=0; state.dog.ammo=Math.min(state.dog.ammoMax,state.resources.ammo+Math.min(2,state.modifier?.ammoBonus||0));
  generateMap(); if(hasConsumable('map')){ revealAround(state.position.x,state.position.y,state.dog.scoutRange+2); useConsumable('map'); log('Map Scrap reveals extra nearby rooms.'); } generateRoamingEnemies();
  log(`Raid started: ${currentPlan().name} in ${currentZone().name} with ${state.dog.name}.`);
  log(`Weather: ${state.weather.icon} ${state.weather.name}. Modifier: ${state.modifier.name}. Extraction chance ${extractChance()}%.`);
  $('startBtn').disabled=true; $('returnBtn').disabled=false; $('zoneSelect').disabled=true; $('planSelect').disabled=true; $('dogSelect').disabled=true;
  clearInterval(state.ticker); state.ticker=setInterval(tickRaid,1000); render();
}

function bankRaidLoot(){
  RESOURCES.forEach(type=>{ if(type!=='ammo') state.resources[type]+=state.raidLoot[type]; });
  state.resources.ammo=Math.max(0,state.dog.ammo);
}

function loseSomeLoot(){ for(const type of RESOURCES){ if(type!=='ammo') state.raidLoot[type]=Math.floor(state.raidLoot[type]*.55); } }

function endRaid(success,bossClear=false){
  if(!state.running) return;
  clearInterval(state.ticker); state.running=false; state.mode='idle';
  if(!success){ loseSomeLoot(); log('Bad extraction: some loot was dropped on the way home.'); }
  bankRaidLoot();
  applyContractReward();
  if(bossClear) log(`${state.dog.name} returned victorious after defeating ${(state.currentBoss || currentZone().boss).name}.`);
  else if(success) log(`${state.dog.name} extracted to the kennel with supplies.`);
  else log(`${state.dog.name} limped home after a rough raid.`);
  $('startBtn').disabled=false; $('returnBtn').disabled=true; $('zoneSelect').disabled=false; $('planSelect').disabled=false; $('dogSelect').disabled=false;
  save(); render();
  if(state.autoRaid && state.research.dogWhistle) setTimeout(()=>{ if(!state.running) startRaid(); },900);
}

function manualExtract(){
  if(!state.running) return;
  const chance=extractChance(); const success=Math.random()*100<chance;
  log(`Manual extraction rolled against ${chance}% safety.`);
  endRaid(success);
}

function buyUpgrade(key){
  if(state.running) return;
  const def=UPGRADE_DEFS[key], cost=def.cost(state.upgrades[key]);
  if(!canPay(cost)){ log(`Not enough resources for ${def.name}.`); return; }
  pay(cost); state.upgrades[key]++; applyUpgrades(); updateGear();
  log(`${def.name} upgraded to level ${state.upgrades[key]}.`);
  save(); render();
}

function buyResearch(key){
  if(state.running || state.research[key]) return;
  const def=RESEARCH[key], cost=def.cost();
  if(!canPay(cost)){ log(`Not enough resources for ${def.name}.`); return; }
  pay(cost); state.research[key]=true;
  log(`${def.name} researched.`);
  applyUpgrades(); save(); render();
}

function updateGear(){
  state.gear[0].name=state.equipment.weapon.name;
  state.gear[0].detail=`${state.equipment.weapon.rarity}; +${state.equipment.weapon.attack||0} attack, +${state.equipment.weapon.crit||0}% crit.`;
  state.gear[1].name=state.equipment.armour.name;
  state.gear[1].detail=`${state.equipment.armour.rarity}; +${state.equipment.armour.hp||0} HP, +${state.equipment.armour.defence||0} defence.`;
  state.gear[3].detail=`Carry limit ${state.dog.carryMax}; inventory slots ${state.dog.inventorySlots}.`;
  state.gear[4].name=state.equipment.charm.name;
  state.gear[4].detail=`${state.equipment.charm.rarity}; +${state.equipment.charm.crit||0}% crit, +${state.equipment.charm.extract||0} extract.`;
}

function totalGearScore(){
  return Object.values(state.equipment || {}).reduce((sum, item) => sum + (item.score || 0), 0);
}

function questBaseline(){
  return {
    food: state.resources.food || 0,
    water: state.resources.water || 0,
    wood: state.resources.wood || 0,
    metal: state.resources.metal || 0,
    fabric: state.resources.fabric || 0,
    medicine: state.resources.medicine || 0,
    gunParts: state.resources.gunParts || 0,
    unlockedZones: state.unlockedZones || 1,
    watch: state.upgrades.watch || 1,
    pack: state.upgrades.pack || 1,
    gearScore: totalGearScore(),
  };
}

function ensureQuests(){
  if(!state.quests || !state.quests.length){
    state.quests = QUEST_TEMPLATES.slice(0,4).map(q=>({id:q.id, claimed:false, baseline:questBaseline()}));
  }
  state.quests.forEach(q => {
    if(!q.baseline) q.baseline = questBaseline();
  });
}

function questTemplate(id){ return QUEST_TEMPLATES.find(q=>q.id===id); }
function questProgress(qState){
  const q = questTemplate(qState.id);
  if(!q) return {value:0, target:1, done:false};
  const value = q.progress ? q.progress(qState) : 0;
  const target = q.target || 1;
  return {value, target, done:value >= target};
}

function claimQuest(id){
  ensureQuests();
  const qState = state.quests.find(q=>q.id===id);
  const q = questTemplate(id);
  if(!qState || !q || qState.claimed || !questProgress(qState).done) return;
  Object.entries(q.reward).forEach(([type, amount]) => {
    if(type === 'treats') state.treats += amount;
    else state.resources[type] = (state.resources[type] || 0) + amount;
  });
  qState.claimed = true;
  log(`Quest complete: ${q.name}. Reward claimed.`);
  save(); render();
}

function buyPerk(key){
  const perk = PERKS[key];
  const lvl = state.perks[key] || 0;
  if(!perk || lvl >= perk.max) return;
  const cost = perk.cost(lvl);
  if(state.treats < cost){ log(`Not enough treats for ${perk.name}.`); return; }
  state.treats -= cost;
  state.perks[key] = lvl + 1;
  applyUpgrades();
  log(`${perk.name} perk upgraded to level ${state.perks[key]}.`);
  save(); render();
}

function equipItem(category, index){
  const item = state.equipmentInventory[category]?.[index];
  if(!item) return;
  state.equipment[category] = {...item};
  applyUpgrades(); updateGear();
  log(`Equipped ${item.name}.`);
  save(); render();
}

function renderZoneOptions(){
  $('zoneSelect').innerHTML=ZONES.map((zone,idx)=>{
    const locked=idx>=state.unlockedZones;
    return `<option value="${zone.id}" ${idx===state.zoneId?'selected':''} ${locked?'disabled':''}>${zone.name}${locked?` (Locked: ${zone.unlock})`:''}</option>`;
  }).join('');
}

function renderPlanOptions(){
  $('planSelect').innerHTML=Object.entries(RAID_PLANS).map(([id,plan])=>`<option value="${id}" ${id===state.planId?'selected':''}>${plan.name} — ${plan.desc}</option>`).join('');
}

function renderDogOptions(){
  ensureSelectedDogUnlocked();
  $('dogSelect').innerHTML=Object.entries(DOGS).map(([id,dog])=>{
    const locked=!isDogUnlocked(id);
    return `<option value="${id}" ${id===state.dogId?'selected':''} ${locked?'disabled':''}>${dog.name} — ${dog.breed}${locked?` (Locked: ${dog.unlock})`:''}</option>`;
  }).join('');
}

function renderStats(){
  updateGear();
  $('statusText').textContent=state.running?(state.mode==='choice'?'Choosing event.':state.mode==='combat'?'In combat.':'Roaming the zone.'):'Resting at the kennel.';
  $('weatherText').textContent=state.weather?`${state.weather.icon} ${state.weather.name} — ${state.weather.text}`:'None';
  $('modifierText').textContent=state.modifier?`${state.modifier.name} — ${state.modifier.text}`:'None';
  $('threatText').textContent=state.running?`${Math.round(state.threat)}% · Extract ${extractChance()}%`:'0%';
  $('dogName').textContent=state.dog.name; $('dogBreedText').textContent=`Breed: ${state.dog.breed}`;
  $('gearSummary').innerHTML=`Gear: <strong>${state.equipment.weapon.name}</strong> + <strong>${state.equipment.armour.name}</strong>`;
  const hpPct=clamp(state.dog.hp/state.dog.maxHp*100,0,100), carryPct=clamp(state.dog.carry/state.dog.carryMax*100,0,100), ammoPct=clamp(state.dog.ammo/state.dog.ammoMax*100,0,100), xpPct=clamp(state.dog.xp/state.dog.xpNext*100,0,100);
  $('hpText').textContent=`${state.dog.hp} / ${state.dog.maxHp}`; $('carryText').textContent=`${state.dog.carry} / ${state.dog.carryMax}`; $('ammoText').textContent=`${state.dog.ammo} / ${state.dog.ammoMax}`; $('xpText').textContent=`Lv.${state.dog.level} · ${state.dog.xp} / ${state.dog.xpNext}`;
  $('hpBar').style.width=`${hpPct}%`; $('carryBar').style.width=`${carryPct}%`; $('ammoBar').style.width=`${ammoPct}%`; $('xpBar').style.width=`${xpPct}%`;
  $('raidTimer').textContent=`${String(Math.floor(state.seconds/60)).padStart(2,'0')}:${String(state.seconds%60).padStart(2,'0')}`;
  const biome=currentBiome();
  $('mapSummary').textContent=`${biome.icon} ${biome.name} · Boss: ${(state.currentBoss || currentZone().boss).name} · ${currentPlan().name} · ${state.revealedTiles}/${state.map.length} rooms`;
  $('statGrid').innerHTML=[['Attack',state.dog.attack],['Defence',state.dog.defence],['Crit',`${state.dog.crit}%`],['Speed',state.dog.speed],['Scout',state.dog.scoutRange],['Slots',`${inventoryTypesUsed()}/${state.dog.inventorySlots}`]].map(([l,v])=>`<div class="stat"><strong>${v}</strong><span>${l}</span></div>`).join('');
}

function renderGear(){ $('gearGrid').innerHTML=state.gear.map(item=>`<div class="gear"><strong>${item.icon} ${item.slot}: ${item.name}</strong><span>${item.detail}</span></div>`).join(''); }

function renderEquipment(){
  $('equipmentGrid').innerHTML=Object.entries(state.equipment).map(([slot,item])=>`<div class="gear"><strong>${slot}: ${item.name}</strong><span>${item.rarity} · score ${item.score||0}</span></div>`).join('');
}

function renderResources(){
  $('resources').innerHTML=RESOURCES.map(type=>`<div class="resource"><strong>${ICONS[type]} ${state.resources[type]}</strong><span>${type}</span></div>`).join('');
  $('raidLootGrid').innerHTML=RESOURCES.map(type=>`<div class="resource"><strong>${ICONS[type]} ${type==='ammo'?state.dog.ammo:state.raidLoot[type]}</strong><span>${type==='ammo'?'ammo on dog':`${type} found`}</span></div>`).join('');
}

function renderUpgrades(){
  $('upgrades').innerHTML=Object.entries(UPGRADE_DEFS).map(([key,def])=>{
    const cost=def.cost(state.upgrades[key]);
    return `<div class="upgrade"><div><h3>${def.name} Lv.${state.upgrades[key]}</h3><p>${def.desc}</p><p>Cost: ${costText(cost)}</p></div><button ${!state.running&&canPay(cost)?'':'disabled'} onclick="buyUpgrade('${key}')">Upgrade</button></div>`;
  }).join('');
}

function renderResearch(){
  $('researchGrid').innerHTML=Object.entries(RESEARCH).map(([key,def])=>{
    const bought=state.research[key], cost=def.cost();
    return `<div class="upgrade"><div><h3>${bought?'✅ ':''}${def.name}</h3><p>${def.desc}</p><p>${bought?'Unlocked':`Cost: ${costText(cost)}`}</p></div><button ${!state.running&&!bought&&canPay(cost)?'':'disabled'} onclick="buyResearch('${key}')">${bought?'Done':'Research'}</button></div>`;
  }).join('');
}

function renderKennel(){
  $('kennelBase').innerHTML=Object.entries(UPGRADE_DEFS).map(([key,def])=>{
    const lvl=state.upgrades[key];
    const cls=lvl>=8?'level-8':lvl>=5?'level-5':lvl>=3?'level-3':'';
    return `<div class="station ${cls}"><div class="station-icon">${def.icon}</div><h3>${def.name}</h3><p>Level ${lvl}</p><p>${def.desc}</p></div>`;
  }).join('');
}

function renderChoice(){
  const panel=$('choicePanel');
  if(!state.pendingChoice){ panel.classList.add('hidden'); return; }
  panel.classList.remove('hidden');
  $('choiceText').textContent=state.pendingChoice.text;
  $('choiceButtons').innerHTML=state.pendingChoice.options.map((opt,i)=>`<button onclick="resolveChoice(${i})">${opt.label}</button>`).join('');
}

function renderCombat(){
  $('combatDogSprite').src=state.dog.sprite; $('heroDogSprite').src=state.dog.sprite;
  $('combatDogName').textContent=state.dog.name; $('combatDogRole').textContent=`${state.dog.breed} · Lv.${state.dog.level}`;
  $('combatDogHpText').textContent=`${state.dog.hp} / ${state.dog.maxHp} HP`; $('combatDogHpBar').style.width=`${clamp(state.dog.hp/state.dog.maxHp*100,0,100)}%`;
  if(state.combat){
    const e=state.combat.enemy;
    $('enemySprite').src=e.sprite; $('enemyName').textContent=e.name; $('enemyType').textContent=e.bossFight?'Zone boss':`Enemy · ${e.behavior}`;
    $('enemyHpText').textContent=`${Math.max(0,e.hp)} / ${e.maxHp} HP`; $('enemyHpBar').style.width=`${clamp(e.hp/e.maxHp*100,0,100)}%`;
    $('combatState').textContent=e.bossFight?'Boss Fight':'Combat'; $('combatState').className='pill';
  } else {
    $('enemySprite').src=(state.currentBoss || currentZone().boss).sprite; $('enemyName').textContent=state.running?'Scanning...':'No target'; $('enemyType').textContent=state.running?'Looking for trouble':'Wandering the zone';
    $('enemyHpText').textContent='--'; $('enemyHpBar').style.width='0%'; $('combatState').textContent=state.running?'Roaming':'Idle'; $('combatState').className='pill muted-pill';
  }
  $('encounterText').textContent=state.encounterText;
}

function tileImg(tile){ if(tile.cleared && tile.type!=='base') return TILE_ART.cleared; return TILE_ART[tile.type]||TILE_ART.empty; }
function mapEnemySprite(tile){ if(tile.type==='boss') return (state.currentBoss || currentZone().boss).sprite; if(tile.type==='enemy'){ const list=currentZone().enemies; return list[(tile.x*7+tile.y*11)%list.length].sprite; } return null; }

function renderMap(){
  const biome = currentBiome();
  $('map').className = `map dungeon-map biome-${Object.keys(BIOMES).find(k=>BIOMES[k]===biome)}`;
  const seenLinks = [];
  state.map.forEach(tile => {
    if(!tile.seen || !tile.links) return;
    tile.links.forEach(id => {
      const other = state.map[id];
      if(!other || !other.seen || tile.id > other.id) return;
      const a = mapPoint(tile), b = mapPoint(other);
      const dx = b.left-a.left, dy = b.top-a.top;
      const len = Math.sqrt(dx*dx+dy*dy);
      const angle = Math.atan2(dy,dx) * 180 / Math.PI;
      seenLinks.push(`<div class="path-line ${tile.locked || other.locked ? 'locked-path' : ''}" style="left:${a.left}%;top:${a.top}%;width:${len}%;transform:rotate(${angle}deg)"></div>`);
    });
  });
  const paths = seenLinks.join('');

  const biomeKey = Object.keys(BIOMES).find(k=>BIOMES[k]===biome);
  const biomeBadge = `<div class="biome-badge"><img src="${TILE_ART[biomeKey]}" alt="${biome.name}"><span>${biome.icon} ${biome.name}</span></div>`;

  const outlines = state.map.filter(tile=>tile.seen).map(tile => {
    const p = mapPoint(tile);
    const w = tile.widthPct || 7;
    const h = tile.heightPct || 7;
    return `<div class="dungeon-room-outline" style="left:${p.left}%;top:${p.top}%;width:${w}%;height:${h}%"></div>`;
  }).join('');

  const pois=state.map.map(tile=>{
    const point=mapPoint(tile); const current=tile.x===state.position.x && tile.y===state.position.y && state.running;
    const classes=['poi',tile.type,current?'current':'',!tile.seen?'unseen':'',tile.cleared?'cleared':''].join(' ');
    const enemySprite=mapEnemySprite(tile);
    let hpWidth=tile.type==='boss'?100:72;
    if(current && state.combat?.enemy) hpWidth=clamp(state.combat.enemy.hp/state.combat.enemy.maxHp*100,0,100);
    const health=(!tile.cleared && tile.seen && ['enemy','boss'].includes(tile.type))?`<div class="map-hp"><span style="width:${hpWidth}%"></span></div>`:'';
    const img=enemySprite && tile.seen && !tile.cleared?`<img class="map-enemy-sprite" src="${enemySprite}" alt="${tile.type}">`:`<img class="tile-img" src="${tileImg(tile)}" alt="${tile.type}">`;
    const label = tile.seen ? `<span class="room-label">${tile.roomName || tile.type}</span>` : '';
    const tag = tile.seen && roomHazardTag(tile) ? `<span class="room-tag">${roomHazardTag(tile)}</span>` : '';
    const extraClass = `${tile.locked ? ' locked' : ''}${tile.hazard ? ' hazard-room' : ''}${tile.keyRoom ? ' key-room' : ''}`;
    return `<div class="${classes}${extraClass}" title="${tile.roomName || tile.type}" style="left:${point.left}%;top:${point.top}%">${tile.seen?img:''}${health}${tag}${label}</div>`;
  }).join('');

  const roamers=state.running?state.roamEnemies.filter(e=>e.active).map(e=>{
    const inCombat=state.combat?.enemy?.sourceId===e.id;
    const hp=inCombat?state.combat.enemy.hp:e.hp, maxHp=inCombat?state.combat.enemy.maxHp:e.maxHp;
    const hpWidth=clamp(hp/maxHp*100,0,100);
    return `<div class="aggro-ring" style="left:${e.left}%;top:${e.top}%"></div><div class="map-roamer ${inCombat?'current':''}" style="left:${e.left}%;top:${e.top}%"><img src="${e.sprite}" alt="${e.name}"><div class="map-hp"><span style="width:${hpWidth}%"></span></div></div>`;
  }).join(''):'';

  const dogPoint=dogMapPosition();
  const dog=state.running?`<img class="map-dog" src="${state.dog.sprite}" alt="dog" style="left:${dogPoint.left}%;top:${dogPoint.top}%">`:'';
  $('map').innerHTML=biomeBadge+outlines+paths+pois+roamers+dog;
}

function renderLootFilter(){
  ensureLootFilter();
  $('lootFilter').innerHTML = RESOURCES.filter(type => type !== 'ammo').map(type => `
    <label class="filter-chip">
      <input type="checkbox" ${state.lootFilter[type] ? 'checked' : ''} onchange="toggleLootFilter('${type}')">
      <span>${ICONS[type]} ${type}</span>
    </label>
  `).join('');
}

function renderPackManager(){
  const rows = RESOURCES.filter(type => type === 'ammo' ? state.dog.ammo > 0 : state.raidLoot[type] > 0);
  $('packManager').innerHTML = rows.length ? rows.map(type => {
    const amount = type === 'ammo' ? state.dog.ammo : state.raidLoot[type];
    return `<div class="pack-row">
      <span><strong>${ICONS[type]} ${amount}</strong> ${type}</span>
      <button class="ghost-small" ${state.running ? '' : 'disabled'} onclick="dropLoot('${type}', 1)">Drop 1</button>
      <button ${state.running ? '' : 'disabled'} onclick="dropStack('${type}')">Drop stack</button>
    </div>`;
  }).join('') : '<p class="muted tiny">No raid loot yet.</p>';
}

function renderContractOptions(){
  $('contractSelect').innerHTML = Object.entries(CONTRACTS).map(([id,c]) =>
    `<option value="${id}" ${id===state.contractId?'selected':''}>${c.name} — ${c.desc}</option>`
  ).join('');
}

function renderConsumableSetup(){
  $('consumableSetup').innerHTML = Object.entries(CONSUMABLES).map(([id,c]) => {
    const checked = state.selectedConsumables.includes(id);
    const disabled = !checked && state.selectedConsumables.length >= 2;
    return `<label class="consumable-chip">
      <input type="checkbox" ${checked?'checked':''} ${disabled?'disabled':''} onchange="toggleConsumable('${id}')">
      <span>${c.icon} ${c.name}</span>
    </label>`;
  }).join('');
}

function renderContractStatus(){
  const c = currentContract();
  const rewards = Object.entries(c.reward || {}).map(([k,v]) => k==='treats' ? `🦴 ${v}` : `${ICONS[k]} ${v}`).join(' ');
  $('contractStatus').innerHTML = `<div class="gear">
    <strong>${c.name}</strong>
    <span>${c.desc}</span>
    <span>${contractProgressText()}</span>
    <span>Reward: ${rewards || 'None'}</span>
  </div>
  <div class="gear">
    <strong>Raid Consumables</strong>
    <span>${state.activeConsumables.length ? state.activeConsumables.map(k=>`${CONSUMABLES[k].icon} ${CONSUMABLES[k].name}${state.consumableUsed[k]?' ✅':''}`).join('<br>') : 'None active'}</span>
    <span>Dungeon keys: ${state.dungeonKeys}</span>
  </div>`;
}

function renderHubTrader(){
  $('hubTraderGrid').innerHTML = hubTraderOffers().map((offer, index) => `
    <div class="upgrade">
      <div>
        <h3>${offer.label}</h3>
        <p>${offer.desc}</p>
        <p>Price: ${costText(offer.cost)}</p>
      </div>
      <button ${!state.running && canAffordFromResources(offer.cost) ? '' : 'disabled'} onclick="buyHubOffer(${index})">Buy</button>
    </div>
  `).join('');
}

function renderQuests(){
  ensureQuests();
  $('questGrid').innerHTML = state.quests.map(qState => {
    const q = questTemplate(qState.id);
    if(!q) return '';
    const progress = questProgress(qState);
    const done = progress.done;
    return `<div class="upgrade ${done ? 'quest-complete' : ''}">
      <div>
        <h3>${qState.claimed ? '✅ ' : ''}${q.name}</h3>
        <p>${q.desc}</p>
        <p>Progress: ${Math.min(progress.value, progress.target)} / ${progress.target}</p>
        <p>Reward: ${Object.entries(q.reward).map(([k,v]) => k === 'treats' ? `🦴 ${v} treats` : `${ICONS[k]} ${v}`).join(' ')}</p>
      </div>
      <button ${done && !qState.claimed ? '' : 'disabled'} onclick="claimQuest('${q.id}')">${qState.claimed ? 'Claimed' : 'Claim'}</button>
    </div>`;
  }).join('');
}

function renderPerks(){
  $('perkGrid').innerHTML = `<p class="muted tiny">Treats: <span class="treat-count">🦴 ${state.treats}</span></p>` + Object.entries(PERKS).map(([key, perk]) => {
    const lvl = state.perks[key] || 0;
    const maxed = lvl >= perk.max;
    const cost = maxed ? 0 : perk.cost(lvl);
    return `<div class="upgrade">
      <div>
        <h3>${perk.name} Lv.${lvl}/${perk.max}</h3>
        <p>${perk.desc}</p>
        <p>${maxed ? 'Maxed' : `Cost: 🦴 ${cost} treats`}</p>
      </div>
      <button ${!state.running && !maxed && state.treats >= cost ? '' : 'disabled'} onclick="buyPerk('${key}')">${maxed ? 'Max' : 'Upgrade'}</button>
    </div>`;
  }).join('');
}

function renderEquipmentInventory(){
  $('inventoryGrid').innerHTML = Object.entries(state.equipmentInventory).map(([category, items]) => {
    return items.map((item, index) => {
      const equipped = state.equipment[category]?.name === item.name;
      return `<div class="inventory-item ${equipped ? 'equipped' : ''}">
        <strong>${equipped ? '⭐ ' : ''}${category}: ${item.name}</strong>
        <span>${item.rarity || 'Unknown'} · score ${item.score || 0}</span>
        <button ${equipped || state.running ? 'disabled' : ''} onclick="equipItem('${category}', ${index})">${equipped ? 'Equipped' : 'Equip'}</button>
      </div>`;
    }).join('');
  }).join('');
}

function render(){
  renderZoneOptions(); renderPlanOptions(); renderDogOptions(); renderContractOptions(); renderConsumableSetup(); renderLootFilter(); renderStats(); renderGear(); renderEquipment(); renderResources(); renderPackManager(); renderUpgrades(); renderResearch(); renderKennel(); renderChoice(); renderContractStatus(); renderHubTrader(); renderQuests(); renderPerks(); renderEquipmentInventory(); renderCombat(); renderMap();
  $('autoBtn').textContent=`Auto-Raid: ${state.autoRaid?'On':'Off'}`;
  $('autoBtn').disabled=!state.research.dogWhistle;
  $('autoExtractBtn').textContent=`Auto-Extract: ${state.autoExtract?'On':'Off'}`;
  $('extractSelect').value = state.autoExtractRule || 'off';
}

function toggleConsumable(id){
  if(state.running) return;
  if(state.selectedConsumables.includes(id)) state.selectedConsumables = state.selectedConsumables.filter(x=>x!==id);
  else if(state.selectedConsumables.length < 2) state.selectedConsumables.push(id);
  save(); render();
}

function toggleLootFilter(type){
  ensureLootFilter();
  state.lootFilter[type] = !state.lootFilter[type];
  save();
  render();
}

function calculateOfflineReward(){
  const last = Number(localStorage.getItem('barkRaidersLastSeenV9') || Date.now());
  const minutes = Math.min(480, Math.max(0, Math.floor((Date.now() - last) / 60000)));
  if(minutes < 10) return null;
  const scale = Math.floor(minutes / 10);
  return {
    minutes,
    loot:{
      food: Math.floor(scale * 1.2),
      water: Math.floor(scale * 1.1),
      wood: Math.floor(scale * 2.0),
      metal: Math.floor(scale * 1.1),
      fabric: Math.floor(scale * .8),
      medicine: Math.floor(scale * .25),
      gunParts: Math.floor(scale * .18),
    },
    treats: Math.floor(scale / 6),
  };
}

function showOfflineReward(){
  const reward = calculateOfflineReward();
  state.offlineReward = reward;
  if(!reward) return;
  const text = Object.entries(reward.loot).filter(([,v])=>v>0).map(([k,v])=>`${ICONS[k]} ${v} ${k}`).join(', ');
  $('offlineText').textContent = `${state.dog.name} scavenged for ${reward.minutes} minutes while you were away and found: ${text || 'a few smells'}${reward.treats ? `, plus 🦴 ${reward.treats} treats` : ''}.`;
  $('offlinePanel').classList.remove('hidden');
}

function claimOffline(){
  const reward = state.offlineReward;
  if(!reward) return;
  Object.entries(reward.loot).forEach(([k,v]) => state.resources[k] = (state.resources[k] || 0) + v);
  state.treats += reward.treats || 0;
  state.offlineReward = null;
  $('offlinePanel').classList.add('hidden');
  log('Offline scavenging claimed.');
  save(); render();
}

function save(){
  localStorage.setItem('barkRaidersSaveV9', JSON.stringify({
    resources:state.resources, upgrades:state.upgrades, unlockedZones:state.unlockedZones, zoneId:state.zoneId, planId:state.planId, dogId:state.dogId, contractId:state.contractId, selectedConsumables:state.selectedConsumables, lootFilter:state.lootFilter, autoExtract:state.autoExtract, autoExtractRule:state.autoExtractRule, treats:state.treats, perks:state.perks, quests:state.quests, equipmentInventory:state.equipmentInventory,
    research:state.research, dog:{level:state.dog.level,xp:state.dog.xp,xpNext:state.dog.xpNext}, autoRaid:state.autoRaid, equipment:state.equipment, lastSeen:Date.now()
  }));
  localStorage.setItem('barkRaidersLastSeenV9', String(Date.now()));
}

function load(){
  try{
    const data=JSON.parse(localStorage.getItem('barkRaidersSaveV9') || localStorage.getItem('barkRaidersSaveV8') || localStorage.getItem('barkRaidersSaveV7') || 'null');
    if(!data) return;
    state.resources={...state.resources,...(data.resources||{})};
    state.upgrades={...state.upgrades,...(data.upgrades||{})};
    state.research={...state.research,...(data.research||{})};
    state.unlockedZones=clamp(data.unlockedZones||1,1,ZONES.length);
    state.zoneId=clamp(data.zoneId||0,0,state.unlockedZones-1);
    state.planId=data.planId||'balanced'; state.dogId=data.dogId==='bulldog'?'jack':(data.dogId||'shiba'); if(!DOGS[state.dogId]) state.dogId='shiba'; state.lootFilter={...state.lootFilter, ...(data.lootFilter||{})}; state.autoRaid=!!data.autoRaid; state.autoExtract=!!data.autoExtract; state.autoExtractRule=data.autoExtractRule||'off'; state.contractId=data.contractId||'none'; state.selectedConsumables=data.selectedConsumables||[]; state.treats=data.treats||0; state.perks={...state.perks, ...(data.perks||{})}; state.quests=data.quests||state.quests; state.equipmentInventory={...state.equipmentInventory, ...(data.equipmentInventory||{})};
    if(data.dog){ state.dog.level=data.dog.level||1; state.dog.xp=data.dog.xp||0; state.dog.xpNext=data.dog.xpNext||40; }
    if(data.equipment) state.equipment={...state.equipment,...data.equipment};
  } catch(e){ console.warn('Could not load save', e); }
}

function resetSave(){ if(confirm('Reset Bark Raiders save data?')){ localStorage.removeItem('barkRaidersSaveV9'); localStorage.removeItem('barkRaidersSaveV8'); localStorage.removeItem('barkRaidersSaveV7'); localStorage.removeItem('barkRaidersLastSeenV9'); location.reload(); } }
function toggleAuto(){ if(!state.research.dogWhistle){ log('Research Dog Whistle first to unlock Auto-Raid.'); return; } state.autoRaid=!state.autoRaid; save(); render(); }
function toggleAutoExtract(){ state.autoExtract=!state.autoExtract; if(!state.autoExtract) state.autoExtractRule='off'; else if(state.autoExtractRule==='off') state.autoExtractRule='balanced'; $('extractSelect').value=state.autoExtractRule; save(); render(); }

$('startBtn').addEventListener('click', startRaid);
$('returnBtn').addEventListener('click', manualExtract);
$('resetBtn').addEventListener('click', resetSave);
$('autoBtn').addEventListener('click', toggleAuto);
$('autoExtractBtn').addEventListener('click', toggleAutoExtract);
$('extractSelect').addEventListener('change', e=>{ state.autoExtractRule=e.target.value; state.autoExtract=state.autoExtractRule !== 'off'; save(); render(); });
$('claimOfflineBtn').addEventListener('click', claimOffline);
$('zoneSelect').addEventListener('change', e=>{ state.zoneId=Number(e.target.value); generateMap(); render(); });
$('planSelect').addEventListener('change', e=>{ state.planId=e.target.value; generateMap(); render(); });
$('contractSelect').addEventListener('change', e=>{ state.contractId=e.target.value; save(); render(); });
$('dogSelect').addEventListener('change', e=>{
  if(!isDogUnlocked(e.target.value)){
    log('That dog is still locked.');
    render();
    return;
  }
  state.dogId=e.target.value; applyUpgrades(); updateGear(); save(); render();
});

window.buyUpgrade=buyUpgrade;
window.buyResearch=buyResearch;
window.resolveChoice=resolveChoice;
window.dropLoot=dropLoot;
window.dropStack=dropStack;
window.toggleConsumable=toggleConsumable;
window.toggleLootFilter=toggleLootFilter;
window.claimQuest=claimQuest;
window.buyPerk=buyPerk;
window.equipItem=equipItem;
window.buyHubOffer=buyHubOffer;
window.addEventListener('beforeunload', () => localStorage.setItem('barkRaidersLastSeenV9', String(Date.now())));

load();
applyUpgrades(); updateGear(); generateMap();
ensureLootFilter();
ensureQuests();
log('Welcome to Bark Raiders v0.15. Proper dungeon generator, contracts, consumables, hazards, locked rooms, and keys are in.');
log('Tip: set Auto-Extract to Balanced for normal raids, or Boss Hunt + After Boss Objective for boss attempts.');
render();
showOfflineReward();
