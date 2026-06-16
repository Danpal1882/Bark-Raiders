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
  base:'assets/sprites/v34/loot/03-06.png', trader:'assets/sprites/v34/loot/03-04.png', city:'assets/biome-city.svg', sewer:'assets/biome-sewer.svg', factory:'assets/biome-factory.svg', farmland:'assets/biome-farmland.svg', crate:'assets/sprites/v34/loot/01-01.png', tree:'assets/tile-tree.svg', grove:'assets/tile-grove.svg',
  food:'assets/sprites/v34/loot/01-04.png', water:'assets/sprites/v34/loot/01-05.png', scrap:'assets/sprites/v34/loot/01-06.png', medical:'assets/sprites/v34/loot/01-03.png', metal:'assets/sprites/v34/loot/01-06.png',
  weapon:'assets/sprites/v34/loot/02-01.png', event:'assets/tile-event.svg', exit:'assets/sprites/v36/floor-exit.svg', enemy:'assets/tile-enemy.svg', rare:'assets/sprites/v34/loot/02-03.png',
  boss:'assets/sprites/v34/loot/02-03.png', cleared:'assets/tile-cleared.svg', empty:'assets/tile-empty.svg',
};

const DUNGEON_ART = {
  city:'assets/dungeon-city.svg',
  sewer:'assets/dungeon-sewer.svg',
  factory:'assets/dungeon-factory.svg',
  farmland:'assets/dungeon-farmland.svg',
  key:'assets/tile-key.svg',
  lock:'assets/tile-lock.svg',
  hazard:'assets/tile-hazard.svg',
};

const DOGS = {
  shiba: { name:'Mochi', breed:'Shiba Inu Raider', unlock:'Starter', sprite:SPRITES.shiba, desc:'Balanced scavenger with dependable bonuses everywhere.', hp:4, attack:1, defence:1, crit:3, speed:0, carry:2, scout:0, rare:0, extract:2 },
  pom: { name:'Pip', breed:'Pomeranian Chaos Raider', unlock:'Find/equip any non-starter gear', sprite:SPRITES.pom, desc:'Lucky skirmisher with crit, speed, and rare-loot bonuses.', hp:-2, attack:0, defence:0, crit:5, speed:1, carry:0, scout:0, rare:7, extract:2 },
  jack: { name:'Rustle', breed:'Jack Russell Scrapper', unlock:'Beat the first boss / unlock zone 2', sprite:SPRITES.jack, desc:'Aggressive scrapper with higher damage, crit, and speed.', hp:0, attack:2, defence:0, crit:6, speed:1, carry:0, scout:0, rare:0, extract:0 },
  collie: { name:'Scout', breed:'Border Collie Pathfinder', unlock:'Upgrade Watch Tower to Lv.3', sprite:SPRITES.collie, desc:'Pathfinder with better scouting, movement, carry, and extraction.', hp:2, attack:0, defence:0, crit:2, speed:1, carry:2, scout:1, rare:0, extract:6 },
  dachshund: { name:'Noodle', breed:'Dachshund Cache Specialist', unlock:'Reach Ruined City Floor 3 or research Dog Whistle', sprite:SPRITES.dachshund, desc:'Cache specialist with extra carry, rare finds, and extraction.', hp:0, attack:0, defence:1, crit:2, speed:0, carry:4, scout:0, rare:4, extract:6 },
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
  boss:{name:'Boss Bounty', desc:'Defeat the dungeon boss on floors 3, 6, or 10.', reward:{gunParts:4, treats:6}, target:1, progress:()=>state.contractProgress.boss||0},
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
  dogWhistle:{ name:'Dog Whistle', desc:'Improves Auto-Raid by shortening the restart delay and giving safer repeat runs.', cost:()=>({metal:10, wood:8, fabric:6, gunParts:2}) },
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
  running:false, mode:'idle', seconds:0, ticker:null, autoRaid:false, autoExtract:false, autoExtractRule:'off', offlineReward:null, settings:{speed:1000, logDetail:'full', reduceMotion:false}, raidHistory:[], lastRaidSummary:null,
  zoneId:0, unlockedZones:1, planId:'balanced', dogId:'shiba', contractId:'none', selectedConsumables:[], activeConsumables:[], consumableUsed:{}, contractProgress:{}, contractRewardClaimed:false, lootFilter:{}, weather:null, modifier:null, threat:0,
  map:[], mapSeed:'', mapValidation:null, dungeonSequence:0, roamEnemies:[], mapSize:12, position:{x:0,y:0}, revealedTiles:0, combat:null, currentBoss:null, dungeonKeys:0, pendingChoice:null, activeEventTile:null,
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
function fmt(seconds){
  const total=Math.max(0,Math.floor(Number(seconds)||0));
  return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}
function currentZone(){ return ZONES[state.zoneId]; }
function currentPlan(){ return RAID_PLANS[state.planId] || RAID_PLANS.balanced; }
function currentDogDef(){ return DOGS[state.dogId] || DOGS.shiba; }

function isDogUnlocked(id){
  if(id === 'shiba') return true;
  if(id === 'pom') return Object.values(state.equipment || {}).some(item => item.rarity && item.rarity !== 'Starter');
  if(id === 'jack') return state.unlockedZones >= 2;
  if(id === 'collie') return (state.upgrades?.watch || 1) >= 3;
  if(id === 'dachshund') return !!state.research?.dogWhistle || maxUnlockedFloor('city') >= 3;
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
  const important = /Boss|Injury|Contract|extracted|limped|defeated|unlocked|Raid started|Auto-Extract|Manual extraction|trader purchase|levelled/i.test(message);
  if(state.settings?.logDetail === 'important' && !important) return;
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

function hashSeed(value){
  let hash=2166136261;
  const text=String(value);
  for(let i=0;i<text.length;i++){
    hash^=text.charCodeAt(i);
    hash=Math.imul(hash,16777619);
  }
  return hash>>>0;
}

function seededRandom(seed){
  let value=hashSeed(seed);
  return function(){
    value+=0x6D2B79F5;
    let t=value;
    t=Math.imul(t^(t>>>15),t|1);
    t^=t+Math.imul(t^(t>>>7),t|61);
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}

function seededPick(list,rng){ return list[Math.floor(rng()*list.length)]; }

function weightedPickWithRng(list,rng){
  const total=list.reduce((sum,item)=>sum+item.weight,0);
  let roll=rng()*total;
  for(const item of list){ roll-=item.weight; if(roll<=0) return item; }
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
  (state.injuries || []).forEach(injury => {
    if(injury.effect === 'speed') d.speed = Math.max(1, d.speed - 1);
    if(injury.effect === 'hp') d.maxHp = Math.max(8, d.maxHp - 8);
    if(injury.effect === 'crit') d.crit = Math.max(0, d.crit - 8);
    if(injury.effect === 'carry') d.carryMax = Math.max(6, d.carryMax - 4);
  });
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

function biomeTileType(biome,rng=Math.random){
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
  return weightedPickWithRng(entries,rng).type;
}

function rectsOverlap(a,b,pad=1){
  return !(a.gridX+a.w+pad <= b.gridX || b.gridX+b.w+pad <= a.gridX || a.gridY+a.h+pad <= b.gridY || b.gridY+b.h+pad <= a.gridY);
}

function validateDungeonGraph(rooms,entranceId=0,bossId=rooms.length-1){
  const visited=new Set();
  const queue=[entranceId];
  while(queue.length){
    const id=queue.shift();
    if(visited.has(id) || !rooms[id]) continue;
    visited.add(id);
    rooms[id].links.forEach(next=>{ if(!visited.has(next)) queue.push(next); });
  }
  const brokenLinks=rooms.flatMap(room=>room.links
    .filter(id=>!rooms[id] || !rooms[id].links.includes(room.id))
    .map(id=>`${room.id}->${id}`));
  const unsafeLocks=rooms.filter(room=>room.locked && (room.critical || room.depth<=1));
  return {
    valid:visited.size===rooms.length && visited.has(bossId) && !brokenLinks.length && !unsafeLocks.length,
    reachable:visited.size,
    total:rooms.length,
    bossReachable:visited.has(bossId),
    brokenLinks,
    unsafeLocks:unsafeLocks.map(room=>room.id),
  };
}

function carveDungeonRooms(seed=state.mapSeed){
  const biome = currentBiome();
  const plan = currentPlan();
  const rng=seededRandom(seed);
  const cols = 13;
  const rows = 9;
  const floor=currentFloor();
  const roomTarget = Math.min(22,12 + state.zoneId * 2 + Math.floor((floor-1)/2) + Math.floor(rng()*3));
  const rooms = [];
  const occupied=new Map();
  const biomeKey=Object.keys(BIOMES).find(key=>BIOMES[key]===biome) || 'city';

  function addRoom(gridX,gridY,options={}){
    const cell=`${gridX},${gridY}`;
    if(occupied.has(cell)) return occupied.get(cell);
    const id=rooms.length;
    const room={
      id,
      x:id,
      y:0,
      gridX,
      gridY,
      w:options.w || (rng()<.28 ? 2 : 1),
      h:options.h || (rng()<.22 ? 2 : 1),
      left:0,
      top:0,
      widthPct:options.widthPct || (rng()<.25 ? 10 : 7),
      heightPct:options.heightPct || (rng()<.2 ? 10 : 7),
      type:options.type || biomeTileType(biome,rng),
      roomName:options.roomName || seededPick(biome.rooms,rng),
      biomeKey,
      seen:false,
      cleared:false,
      links:[],
      locked:false,
      keyRoom:false,
      hazard:null,
      critical:!!options.critical,
      depth:options.depth || 0,
      branch:options.branch ?? null,
      role:options.role || 'side',
    };
    room.left=6+((gridX+.5)/cols)*88;
    room.top=8+((gridY+.5)/rows)*84;
    rooms.push(room);
    occupied.set(cell,room);
    return room;
  }

  // Build a readable west-to-east critical path first.
  const critical=[];
  let y=4;
  for(let depth=0;depth<7;depth++){
    if(depth>0 && depth<6) y=clamp(y+(rng()<.33?-1:rng()>.67?1:0),1,7);
    const room=addRoom(depth*2,y,{
      critical:true,
      depth,
      role:depth===0?'entrance':depth===6?'boss':'route',
      widthPct:depth===0||depth===6?9:7,
      heightPct:depth===0||depth===6?9:7,
    });
    critical.push(room);
    if(depth) connectNodes(critical[depth-1],room);
  }

  // Grow optional branches from the route; every new room connects immediately.
  let attempts=0;
  while(rooms.length<roomTarget && attempts<240){
    attempts++;
    const parent=seededPick(rooms.filter(room=>room.role!=='boss'),rng);
    const offsets=rng()<.62
      ? [[0,-1],[0,1],[-1,0],[1,0]]
      : [[-1,-1],[1,-1],[-1,1],[1,1]];
    const [dx,dy]=seededPick(offsets,rng);
    const x=clamp(parent.gridX+dx,0,cols-1);
    const nextY=clamp(parent.gridY+dy,0,rows-1);
    if(occupied.has(`${x},${nextY}`)) continue;
    const room=addRoom(x,nextY,{
      depth:parent.depth+1,
      branch:parent.branch ?? parent.id,
      role:'side',
    });
    connectNodes(parent,room);
  }

  // Add a restrained number of loops between nearby rooms.
  rooms.forEach(room=>{
    const candidates=rooms.filter(other=>
      other.id!==room.id &&
      !room.links.includes(other.id) &&
      Math.abs(room.gridX-other.gridX)+Math.abs(room.gridY-other.gridY)<=2
    );
    if(candidates.length && rng()<.28) connectNodes(room,seededPick(candidates,rng));
  });

  const hazardSets={
    sewer:['flooded','dark','infested'],
    factory:['collapsing','dark','infested'],
    farmland:['overgrown','infested','flooded'],
    city:['dark','collapsing','infested'],
  };
  rooms.filter(room=>room.role==='side').forEach(room=>{
    if(rng()<.38) room.hazard=seededPick(hazardSets[biomeKey],rng);
  });

  // Locks only appear on optional branches, with a key on an earlier safe room.
  const lockCandidates=rooms.filter(room=>room.role==='side' && room.depth>=2);
  if(lockCandidates.length>=2 && rng()<.72){
    const locked=seededPick(lockCandidates,rng);
    locked.locked=true;
    locked.hazard='locked';
    const keyCandidates=rooms.filter(room=>!room.locked && room.role!=='boss' && room.depth<locked.depth);
    const keyRoom=seededPick(keyCandidates.length?keyCandidates:[critical[1]],rng);
    keyRoom.keyRoom=true;
    keyRoom.roomName='Key Cache';
    keyRoom.type='crate';
  }

  return rooms;
}

function generateMap(seedOverride){
  const zone=currentZone();
  const biome=currentBiome();
  const plan=currentPlan();
  state.dungeonSequence=(state.dungeonSequence||0)+1;
  state.mapSeed=String(seedOverride || `${biomeKey()}-f${currentFloor()}-${state.planId}-${Date.now()}-${state.dungeonSequence}`);
  state.currentBoss = chooseDungeonBoss();
  state.map=[]; state.mapSize=zone.mapSize; state.revealedTiles=0;

  state.map = carveDungeonRooms(state.mapSeed);

  const entrance = state.map.find(room=>room.role==='entrance') || state.map[0];
  const boss = state.map.find(room=>room.role==='boss') || state.map[state.map.length-1];
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

  // Add biome/plan flavour on branches.
  state.map.forEach(room => {
    if(room.type === 'base' || room.type === 'boss') return;
    const flavour=seededRandom(`${state.mapSeed}-flavour-${room.id}`);
    if(plan.focus==='wood' && flavour()<.35) room.type = flavour()<.6 ? 'tree' : 'grove';
    if(plan.focus==='scrap' && flavour()<.35) room.type = flavour()<.6 ? 'scrap' : 'weapon';
    if(plan.focus==='medical' && flavour()<.35) room.type = 'medical';
    if(plan.focus==='boss' && flavour()<.22) room.type = 'enemy';
  });

  state.mapValidation=validateDungeonGraph(state.map,entrance.id,boss.id);
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
  const p={exit:9,rare:10,weapon:9,medical:8,trader:8,crate:7,scrap:7,grove:7,tree:6,food:6,water:6,event:6,enemy:4,empty:2};
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
    const queue=[current.id];
    const previous=new Map([[current.id,null]]);
    while(queue.length){
      const id=queue.shift();
      if(id===target.id) break;
      (state.map[id]?.links || []).forEach(next=>{
        if(!previous.has(next)){
          previous.set(next,id);
          queue.push(next);
        }
      });
    }
    if(previous.has(target.id)){
      let step=target.id;
      while(previous.get(step)!==current.id && previous.get(step)!==null) step=previous.get(step);
      return state.map[step] || current;
    }
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
  pushDialogue('Trader: "Good gear, bad prices. That is business."');
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
  if(bossFight) pushDialogue(`${enemy.name}: "This floor belongs to me."`);
  else if(Math.random()<.28) pushDialogue(`${state.dog.name}: "Teeth out. Paws steady."`);
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
    if(state.unlockedZones<ZONES.length && state.zoneId===state.unlockedZones-1 && currentFloor()>=3){
      state.unlockedZones++;
      log(`New biome unlocked: ${BIOMES[Object.keys(BIOMES)[state.unlockedZones-1]].name}.`);
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
  else if(tile.type==='exit'){ tile.cleared=true; state.contractProgress.rooms++; log(`${state.dog.name} found the exit stairs and can extract safely.`); endRaid(true,false,true); return; }
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
  state.floorId=Number($('floorSelect').value);
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
  pushDialogue(`${state.dog.name}: "Sniffing out ${floorLabel()}..."`);
  log(`Raid started: ${currentPlan().name} in ${floorLabel()} with ${state.dog.name}.`);
  log(`Weather: ${state.weather.icon} ${state.weather.name}. Modifier: ${state.modifier.name}. Extraction chance ${extractChance()}%.`);
  $('startBtn').disabled=true; $('returnBtn').disabled=false; $('zoneSelect').disabled=true; $('floorSelect').disabled=true; $('planSelect').disabled=true; $('dogSelect').disabled=true;
  clearInterval(state.ticker); state.ticker=setInterval(tickRaid,state.settings.speed||1000); render();
}

function bankRaidLoot(){
  RESOURCES.forEach(type=>{ if(type!=='ammo') state.resources[type]+=state.raidLoot[type]; });
  state.resources.ammo=Math.max(0,state.dog.ammo);
}

const INJURY_POOL = [
  {name:'Limping Paw', turns:2, desc:'-1 speed while injured.', effect:'speed'},
  {name:'Bruised Ribs', turns:3, desc:'-8 max HP while injured.', effect:'hp'},
  {name:'Shaken Nerves', turns:2, desc:'-8% crit while injured.', effect:'crit'},
  {name:'Torn Pack Strap', turns:2, desc:'-4 carry while injured.', effect:'carry'},
];

function applyInjury(){
  if(Math.random() < .78){
    const injury = {...pick(INJURY_POOL)};
    injury.turns = 1 + rand(3);
    state.injuries.push(injury);
    pushDialogue(`${state.dog.name}: "Oof... I need a lie down after that."`);
    log(`Injury gained: ${injury.name} (${injury.turns} raids).`);
    return injury;
  }
  return null;
}

function tickInjuries(raidEnded){
  if(!raidEnded || !state.injuries.length) return;
  state.injuries.forEach(i=>i.turns--);
  const healed = state.injuries.filter(i=>i.turns<=0);
  state.injuries = state.injuries.filter(i=>i.turns>0);
  healed.forEach(i=>log(`Injury healed: ${i.name}.`));
}

function unlockNextFloor(){
  const key = biomeKey();
  const f = currentFloor();
  const max = maxUnlockedFloor(key);
  if(f >= max && f < 10){
    state.biomeFloors[key] = f + 1;
    pushDialogue(`${state.dog.name}: "New route found! ${currentBiome().name} floor ${f+1} is open."`);
  }
}

function loseSomeLoot(){
  for(const type of RESOURCES){
    if(type!=='ammo') state.raidLoot[type]=Math.floor(state.raidLoot[type]*.65);
  }
}


function lootSummaryText(loot=state.raidLoot){
  return RESOURCES.filter(type=>type!=='ammo' && loot[type]>0).map(type=>`${ICONS[type]} ${loot[type]} ${type}`).join(', ');
}
function makeRaidHistoryEntry(success,bossClear,floorClear,lootBeforeBank,newInjuries=[]){
  const result = bossClear ? 'Boss Cleared' : floorClear ? 'Floor Cleared' : success ? 'Extracted' : 'Failed Raid';
  const entry = {
    result,
    success,
    biome: currentBiome().name,
    floor: currentFloor(),
    plan: currentPlan().name,
    dog: state.dog.name,
    contract: currentContract().name,
    lootText: lootSummaryText(lootBeforeBank),
    duration: fmt(state.seconds),
    injuryText: newInjuries.map(i=>i.name).join(', '),
    progressText: success && (bossClear || floorClear) ? `Floor ${Math.min(10,currentFloor()+1)} unlocked if available` : '',
    date: new Date().toISOString(),
  };
  state.raidHistory.unshift(entry);
  state.raidHistory = state.raidHistory.slice(0,30);
  state.lastRaidSummary = entry;
}

function endRaid(success,bossClear=false,floorClear=false){
  if(!state.running) return;
  clearInterval(state.ticker); state.running=false; state.mode='idle';
  const newInjuries=[];
  if(!success){
    const injury=applyInjury();
    if(injury) newInjuries.push(injury);
    loseSomeLoot();
    log('Bad extraction: some loot was dropped on the way home and an injury may linger.');
  }
  const lootBeforeBank={...state.raidLoot};
  bankRaidLoot();
  if(success && (bossClear || floorClear)) unlockNextFloor();
  tickInjuries(success);
  applyContractReward();
  makeRaidHistoryEntry(success,bossClear,floorClear,lootBeforeBank,newInjuries);
  if(bossClear) log(`${state.dog.name} returned victorious after defeating ${(state.currentBoss || currentZone().boss).name}.`);
  else if(success) log(`${state.dog.name} extracted to the kennel with supplies from ${floorLabel()}.`);
  else log(`${state.dog.name} limped home after a rough raid.`);
  $('startBtn').disabled=false; $('returnBtn').disabled=true; $('zoneSelect').disabled=false; $('floorSelect').disabled=false; $('planSelect').disabled=false; $('dogSelect').disabled=false;
  save(); render();
  if(state.autoRaid) setTimeout(()=>{ if(!state.running) startRaid(); }, state.research.dogWhistle ? 450 : 1100);
  else showRaidSummary();
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


function switchTab(tab){
  document.querySelectorAll('.tab-btn').forEach(btn=>btn.classList.toggle('active', btn.dataset.tab===tab));
  document.querySelectorAll('.tab-panel').forEach(panel=>panel.classList.toggle('active', panel.dataset.tabPanel===tab));
}
window.switchTab = switchTab;

function selectedLoadoutSummary(){
  const zone = currentBiome();
  const plan = currentPlan();
  const contract = currentContract();
  const boss = isBossFloor() ? (state.currentBoss || chooseDungeonBoss()) : null;
  const consumables = state.selectedConsumables.length ? state.selectedConsumables.map(k=>`${CONSUMABLES[k].icon} ${CONSUMABLES[k].name}`).join(', ') : 'None';
  const injuries = state.injuries?.length ? state.injuries.map(i=>`${i.name} (${i.turns})`).join(', ') : 'None';
  return {
    zone, plan, contract, boss, consumables, injuries,
    risk: currentFloor() >= 8 ? 'Severe' : currentFloor() >= 5 ? 'High' : currentFloor() >= 3 ? 'Moderate' : 'Low',
  };
}

function renderDispatchSummary(){
  const s = selectedLoadoutSummary();
  $('dispatchSummary').innerHTML = `
    <div class="dispatch-grid">
      <div class="dispatch-tile"><strong>${s.zone.icon} Biome</strong><span>${s.zone.name}</span></div>
      <div class="dispatch-tile"><strong>Floor</strong><span>${currentFloor()}${isBossFloor()?' · Boss Floor':''}</span></div>
      <div class="dispatch-tile"><strong>Plan</strong><span>${s.plan.name}</span></div>
      <div class="dispatch-tile"><strong>Raider</strong><span>${state.dog.name} · ${state.dog.breed}</span></div>
      <div class="dispatch-tile"><strong>Contract</strong><span>${s.contract.name}</span></div>
      <div class="dispatch-tile"><strong>Auto-Extract</strong><span>${state.autoExtractRule}</span></div>
      <div class="dispatch-tile"><strong>Consumables</strong><span>${s.consumables}</span></div>
      <div class="dispatch-tile"><strong>Injuries</strong><span>${s.injuries}</span></div>
      <div class="dispatch-tile"><strong>Known Boss</strong><span>${s.boss ? s.boss.name : 'No boss on this floor'}</span></div>
      <div class="dispatch-tile"><strong>Risk</strong><span>${s.risk}</span></div>
    </div>
    <p class="muted">Auto-Raid uses this saved setup and skips this screen after each extraction.</p>`;
}

function openDispatch(){
  if(state.running) return;
  applyUpgrades();
  updateGear();
  renderDispatchSummary();
  $('dispatchModal').classList.remove('hidden');
}
function closeDispatch(){ $('dispatchModal').classList.add('hidden'); }
function confirmDispatch(auto=false){
  closeDispatch();
  if(auto){
    state.autoRaid=true;
    log('Auto-Raid enabled from dispatch terminal.');
  }
  pushDialogue(`${state.dog.name}: "Dispatch confirmed."`);
  startRaid();
}

function renderBossIntel(){
  const pool = bossPoolForBiome();
  const current = isBossFloor() ? (state.currentBoss || chooseDungeonBoss()) : null;
  const bossCards = pool.map(b=>`<div class="intel-card">
    <strong>${b.icon} ${b.name}</strong>
    <span>Mechanic: ${bossMechanicLabel(b.behavior)}</span>
    <span>Base HP ${b.hp} · ATK ${b.atk} · DEF ${b.def}</span>
    <span>Rewards: ${costText(b.reward)}</span>
  </div>`).join('');
  const floorRows = Array.from({length:10},(_,i)=>{
    const f=i+1, unlocked=f<=maxUnlockedFloor();
    return `<span class="${unlocked?'unlocked':'locked'}">F${f}${isBossFloor(f)?' 👑':''}</span>`;
  }).join('');
  $('bossIntel').innerHTML = `<div class="intel-card wide">
    <strong>${currentBiome().icon} ${currentBiome().name} Intel</strong>
    <span>${currentBiome().desc}</span>
    <span>Current floor: ${currentFloor()} · ${isBossFloor() ? `Expected boss: ${current?.name || 'unknown'}` : 'No boss on this floor'}</span>
    <div class="floor-pips">${floorRows}</div>
  </div>${bossCards}`;
}

function bossMechanicLabel(key){
  return ({
    summon:'Summons extra pressure',
    lootStealBoss:'Steals raid loot',
    bleedBoss:'Bleed damage over time',
    poisonBoss:'Poison/threat pressure',
    stealBoss:'Steals scrap/gun parts',
    armourCheck:'Punishes weak weapons',
    hazards:'Creates hazards',
    burnBoss:'Burn damage',
    chaseBoss:'Threat pressure',
  })[key] || key || 'Unknown';
}

function renderRaidHistory(){
  const rows = (state.raidHistory || []).slice(0,12).map(r=>`<div class="history-row ${r.success?'success':'fail'}">
    <strong>${r.result}</strong>
    <span>${r.biome} F${r.floor} · ${r.plan} · ${r.dog}</span>
    <span>Loot: ${r.lootText || 'none'} · ${r.contract || 'No Contract'}</span>
  </div>`).join('');
  $('raidHistory').innerHTML = rows || '<p class="muted">No raids logged yet.</p>';
}

function renderSettings(){
  $('speedSelect').value=String(state.settings.speed||1000);
  $('logDetailSelect').value=state.settings.logDetail||'full';
  $('reduceMotionToggle').checked=!!state.settings.reduceMotion;
  document.body.classList.toggle('reduce-motion', !!state.settings.reduceMotion);
}

function exportSave(){
  $('saveBox').value = btoa(unescape(encodeURIComponent(JSON.stringify(JSON.parse(localStorage.getItem('barkRaidersSaveV9')||'{}')))));
  log('Save exported.');
}
function importSave(){
  try{
    const raw = $('saveBox').value.trim();
    if(!raw) return;
    const data = JSON.parse(decodeURIComponent(escape(atob(raw))));
    localStorage.setItem('barkRaidersSaveV9', JSON.stringify(data));
    log('Save imported. Reloading...');
    location.reload();
  } catch(e){ log('Import failed. Check the save text.'); }
}

function showRaidSummary(){
  if(!state.lastRaidSummary) return;
  const r=state.lastRaidSummary;
  $('raidSummary').innerHTML = `<div class="dispatch-grid">
    <div class="dispatch-tile"><strong>Result</strong><span>${r.result}</span></div>
    <div class="dispatch-tile"><strong>Location</strong><span>${r.biome} Floor ${r.floor}</span></div>
    <div class="dispatch-tile"><strong>Raider</strong><span>${r.dog}</span></div>
    <div class="dispatch-tile"><strong>Duration</strong><span>${r.duration}</span></div>
    <div class="dispatch-tile"><strong>Loot Secured</strong><span>${r.lootText || 'None'}</span></div>
    <div class="dispatch-tile"><strong>Contract</strong><span>${r.contract}</span></div>
    <div class="dispatch-tile"><strong>Injuries</strong><span>${r.injuryText || 'None'}</span></div>
    <div class="dispatch-tile"><strong>Progress</strong><span>${r.progressText || 'No new floor'}</span></div>
  </div>`;
  $('summaryModal').classList.remove('hidden');
}
function closeSummary(){ $('summaryModal').classList.add('hidden'); }

function renderZoneOptions(){
  $('zoneSelect').innerHTML=ZONES.map((zone,idx)=>{
    const locked=idx>=state.unlockedZones;
    const key=Object.keys(BIOMES)[idx % Object.keys(BIOMES).length];
    const biome=BIOMES[key];
    return `<option value="${zone.id}" ${idx===state.zoneId?'selected':''} ${locked?'disabled':''}>${biome.icon} ${biome.name}${locked?` (Locked: ${zone.unlock})`:''}</option>`;
  }).join('');
  renderFloorOptions();
}

function renderFloorOptions(){
  const max=maxUnlockedFloor();
  const current=clamp(Number(state.floorId||1),1,max);
  state.floorId=current;
  $('floorSelect').innerHTML=Array.from({length:max},(_,i)=>{
    const f=i+1;
    return `<option value="${f}" ${f===current?'selected':''}>Floor ${f}${isBossFloor(f)?' — Boss Floor':''}</option>`;
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
  $('threatText').textContent=state.running?`${Math.round(state.threat)}% · Extract ${extractChance()}%`:`0%${(state.injuries||[]).length?` · ${(state.injuries||[]).length} injury`:''}`;
  $('dogName').textContent=state.dog.name; $('dogBreedText').textContent=`Breed: ${state.dog.breed}`;
  $('gearSummary').innerHTML=`Gear: <strong>${state.equipment.weapon.name}</strong> + <strong>${state.equipment.armour.name}</strong>`;
  const hpPct=clamp(state.dog.hp/state.dog.maxHp*100,0,100), carryPct=clamp(state.dog.carry/state.dog.carryMax*100,0,100), ammoPct=clamp(state.dog.ammo/state.dog.ammoMax*100,0,100), xpPct=clamp(state.dog.xp/state.dog.xpNext*100,0,100);
  $('hpText').textContent=`${state.dog.hp} / ${state.dog.maxHp}`; $('carryText').textContent=`${state.dog.carry} / ${state.dog.carryMax}`; $('ammoText').textContent=`${state.dog.ammo} / ${state.dog.ammoMax}`; $('xpText').textContent=`Lv.${state.dog.level} · ${state.dog.xp} / ${state.dog.xpNext}`;
  $('hpBar').style.width=`${hpPct}%`; $('carryBar').style.width=`${carryPct}%`; $('ammoBar').style.width=`${ammoPct}%`; $('xpBar').style.width=`${xpPct}%`;
  $('raidTimer').textContent=`${String(Math.floor(state.seconds/60)).padStart(2,'0')}:${String(state.seconds%60).padStart(2,'0')}`;
  const biome=currentBiome();
  $('mapSummary').textContent=`${biome.icon} ${biome.name} F${currentFloor()}${isBossFloor()?' Boss':''} · ${state.currentBoss?`Boss: ${state.currentBoss.name}`:'No boss'} · ${state.revealedTiles}/${state.map.length} rooms`;
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
  const activeBiomeKey=Object.keys(BIOMES).find(k=>BIOMES[k]===biome) || 'city';
  $('map').className = `map dungeon-map biome-${activeBiomeKey}`;
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
      const routeClass=tile.critical && other.critical ? 'critical-path' : 'branch-path';
      seenLinks.push(`<div class="path-line ${routeClass} ${tile.locked || other.locked ? 'locked-path' : ''}" style="left:${a.left}%;top:${a.top}%;width:${len}%;transform:rotate(${angle}deg)"></div>`);
    });
  });
  const paths = seenLinks.join('');

  const biomeBadge = `<div class="biome-badge"><img src="${TILE_ART[activeBiomeKey]}" alt="${biome.name}"><span>${biome.icon} ${biome.name}</span></div>`;
  const seedLabel=state.mapSeed.split('-').slice(-2).join('-').toUpperCase();
  const mapMeta=`<div class="dungeon-meta"><span>Route ${seedLabel}</span><span>${state.map.length} rooms</span><span>${state.mapValidation?.valid?'Connected':'Route warning'}</span></div>`;
  const dungeonDecor=`<img class="dungeon-decor" src="${DUNGEON_ART[activeBiomeKey]}" alt="" aria-hidden="true">`;

  const outlines = state.map.filter(tile=>tile.seen).map(tile => {
    const p = mapPoint(tile);
    const w = tile.widthPct || 7;
    const h = tile.heightPct || 7;
    return `<div class="dungeon-room-outline" style="left:${p.left}%;top:${p.top}%;width:${w}%;height:${h}%"></div>`;
  }).join('');

  const pois=state.map.map(tile=>{
    const point=mapPoint(tile); const current=tile.x===state.position.x && tile.y===state.position.y && state.running;
    const classes=['poi',tile.type,tile.critical?'critical-room':'side-room',current?'current':'',!tile.seen?'unseen':'',tile.cleared?'cleared':''].join(' ');
    const enemySprite=mapEnemySprite(tile);
    let hpWidth=tile.type==='boss'?100:72;
    if(current && state.combat?.enemy) hpWidth=clamp(state.combat.enemy.hp/state.combat.enemy.maxHp*100,0,100);
    const health=(!tile.cleared && tile.seen && ['enemy','boss'].includes(tile.type))?`<div class="map-hp"><span style="width:${hpWidth}%"></span></div>`:'';
    const img=enemySprite && tile.seen && !tile.cleared?`<img class="map-enemy-sprite" src="${enemySprite}" alt="${tile.type}">`:`<img class="tile-img" src="${tileImg(tile)}" alt="${tile.type}">`;
    const label = tile.seen ? `<span class="room-label">${tile.roomName || tile.type}</span>` : '';
    const marker=tile.keyRoom?DUNGEON_ART.key:tile.locked?DUNGEON_ART.lock:tile.hazard?DUNGEON_ART.hazard:null;
    const tag=tile.seen && marker ? `<span class="room-tag"><img src="${marker}" alt="${roomHazardTag(tile)}"></span>` : '';
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
  $('map').innerHTML=dungeonDecor+biomeBadge+mapMeta+outlines+paths+pois+roamers+dog;
}

window.generateDungeonFromSeed = function(seed){
  generateMap(seed);
  render();
  return {seed:state.mapSeed,rooms:state.map,mapValidation:state.mapValidation};
};
window.validateDungeonGraph = validateDungeonGraph;

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
    return `<label class="consumable-chip" title="${c.name}: ${c.desc}">
      <input type="checkbox" ${checked?'checked':''} ${disabled?'disabled':''} onchange="toggleConsumable('${id}')">
      <span>${c.icon} ${c.name}</span>
      <span class="consumable-help"><strong>${c.icon} ${c.name}</strong>${c.desc}</span>
    </label>`;
  }).join('');
}

function renderProgressStatus(){
  const key=biomeKey();
  const max=maxUnlockedFloor(key);
  const injuries = (state.injuries || []).length
    ? state.injuries.map(i=>`<span>${i.name}: ${i.turns} raid${i.turns===1?'':'s'} · ${i.desc}</span>`).join('')
    : '<span>No active injuries.</span>';
  const dialogue = (state.dialogue || []).length
    ? state.dialogue.map(line=>`<span>💬 ${line}</span>`).join('')
    : '<span>No recent dialogue.</span>';
  $('progressStatus').innerHTML = `<div class="gear">
    <strong>${currentBiome().icon} ${currentBiome().name}</strong>
    <span>Selected: Floor ${currentFloor()}${isBossFloor()?' · Boss Floor':''}</span>
    <span>Unlocked floors: ${max}/10</span>
    <span>Boss floors: 3, 6, 10</span>
  </div>
  <div class="gear">
    <strong>Injuries</strong>
    ${injuries}
  </div>
  <div class="gear">
    <strong>Dialogue</strong>
    ${dialogue}
  </div>`;
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

function gearDeltaText(category,item){
  const cur=state.equipment[category] || {};
  const delta=(item.score||0)-(cur.score||0);
  if(delta===0) return '· same';
  return delta>0?`· +${delta} vs equipped`:`· ${delta} vs equipped`;
}

function renderEquipmentInventory(){
  $('inventoryGrid').innerHTML = Object.entries(state.equipmentInventory).map(([category, items]) => {
    return items.map((item, index) => {
      const equipped = state.equipment[category]?.name === item.name;
      return `<div class="inventory-item ${equipped ? 'equipped' : ''}">
        <strong>${equipped ? '⭐ ' : ''}${category}: ${item.name}</strong>
        <span>${item.rarity || 'Unknown'} · score ${item.score || 0} ${gearDeltaText(category,item)}</span>
        <button ${equipped || state.running ? 'disabled' : ''} onclick="equipItem('${category}', ${index})">${equipped ? 'Equipped' : 'Equip'}</button>
      </div>`;
    }).join('');
  }).join('');
}

function render(){
  renderZoneOptions(); renderPlanOptions(); renderDogOptions(); renderContractOptions(); renderConsumableSetup(); renderLootFilter(); renderStats(); renderGear(); renderEquipment(); renderResources(); renderPackManager(); renderUpgrades(); renderResearch(); renderKennel(); renderChoice(); renderProgressStatus(); renderContractStatus(); renderHubTrader(); renderQuests(); renderPerks(); renderEquipmentInventory(); renderBossIntel(); renderRaidHistory(); renderSettings(); renderCombat(); renderMap();
  $('autoBtn').textContent=`Auto-Raid: ${state.autoRaid?'On':'Off'}`;
  $('autoBtn').disabled=false;
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
    resources:state.resources, upgrades:state.upgrades, unlockedZones:state.unlockedZones, zoneId:state.zoneId, floorId:state.floorId, biomeFloors:state.biomeFloors, injuries:state.injuries, dialogue:state.dialogue, settings:state.settings, raidHistory:state.raidHistory, lastRaidSummary:state.lastRaidSummary, planId:state.planId, dogId:state.dogId, contractId:state.contractId, selectedConsumables:state.selectedConsumables, lootFilter:state.lootFilter, autoExtract:state.autoExtract, autoExtractRule:state.autoExtractRule, treats:state.treats, perks:state.perks, quests:state.quests, equipmentInventory:state.equipmentInventory,
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
    state.zoneId=clamp(data.zoneId||0,0,state.unlockedZones-1); state.biomeFloors={...state.biomeFloors, ...(data.biomeFloors||{})}; state.floorId=clamp(data.floorId||1,1,maxUnlockedFloor()); state.injuries=data.injuries||[]; state.dialogue=data.dialogue||[]; state.settings={...state.settings, ...(data.settings||{})}; state.raidHistory=data.raidHistory||[]; state.lastRaidSummary=data.lastRaidSummary||null;
    state.planId=data.planId||'balanced'; state.dogId=data.dogId==='bulldog'?'jack':(data.dogId||'shiba'); if(!DOGS[state.dogId]) state.dogId='shiba'; state.lootFilter={...state.lootFilter, ...(data.lootFilter||{})}; state.autoRaid=!!data.autoRaid; state.autoExtract=!!data.autoExtract; state.autoExtractRule=data.autoExtractRule||'off'; state.contractId=data.contractId||'none'; state.selectedConsumables=data.selectedConsumables||[]; state.treats=data.treats||0; state.perks={...state.perks, ...(data.perks||{})}; state.quests=data.quests||state.quests; state.equipmentInventory={...state.equipmentInventory, ...(data.equipmentInventory||{})};
    if(data.dog){ state.dog.level=data.dog.level||1; state.dog.xp=data.dog.xp||0; state.dog.xpNext=data.dog.xpNext||40; }
    if(data.equipment) state.equipment={...state.equipment,...data.equipment};
  } catch(e){ console.warn('Could not load save', e); }
}

function resetSave(){ if(confirm('Reset Bark Raiders save data?')){ localStorage.removeItem('barkRaidersSaveV9'); localStorage.removeItem('barkRaidersSaveV8'); localStorage.removeItem('barkRaidersSaveV7'); localStorage.removeItem('barkRaidersLastSeenV9'); location.reload(); } }
function toggleAuto(){ state.autoRaid=!state.autoRaid; log(`Auto-Raid ${state.autoRaid?'enabled':'disabled'}.`); save(); render(); }
function toggleAutoExtract(){ state.autoExtract=!state.autoExtract; if(!state.autoExtract) state.autoExtractRule='off'; else if(state.autoExtractRule==='off') state.autoExtractRule='balanced'; $('extractSelect').value=state.autoExtractRule; save(); render(); }

$('startBtn').addEventListener('click', openDispatch);
$('returnBtn').addEventListener('click', manualExtract);
$('closeDispatchBtn').addEventListener('click', closeDispatch);
$('confirmDispatchBtn').addEventListener('click', ()=>confirmDispatch(false));
$('confirmAutoDispatchBtn').addEventListener('click', ()=>confirmDispatch(true));
$('closeSummaryBtn').addEventListener('click', closeSummary);
$('resetBtn').addEventListener('click', resetSave);
$('autoBtn').addEventListener('click', toggleAuto);
$('autoExtractBtn').addEventListener('click', toggleAutoExtract);
$('extractSelect').addEventListener('change', e=>{ state.autoExtractRule=e.target.value; state.autoExtract=state.autoExtractRule !== 'off'; save(); render(); });
$('claimOfflineBtn').addEventListener('click', claimOffline);
$('speedSelect').addEventListener('change', e=>{ state.settings.speed=Number(e.target.value); save(); render(); if(state.running){ clearInterval(state.ticker); state.ticker=setInterval(tickRaid,state.settings.speed||1000); } });
$('logDetailSelect').addEventListener('change', e=>{ state.settings.logDetail=e.target.value; save(); render(); });
$('reduceMotionToggle').addEventListener('change', e=>{ state.settings.reduceMotion=e.target.checked; save(); render(); });
$('exportSaveBtn').addEventListener('click', exportSave);
$('importSaveBtn').addEventListener('click', importSave);
$('zoneSelect').addEventListener('change', e=>{ state.zoneId=Number(e.target.value); state.floorId=clamp(state.floorId||1,1,maxUnlockedFloor()); generateMap(); save(); render(); });
$('floorSelect').addEventListener('change', e=>{ state.floorId=Number(e.target.value); generateMap(); save(); render(); });
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
log('Welcome to Bark Raiders v0.23. Custom raiders, breed variants, dispatch profiles, market, recovery kennel, biome mastery, and bounty board are in.');
log('Tip: set Auto-Extract to Balanced for normal raids, or Boss Hunt + After Boss Objective for boss attempts.');
render();
showOfflineReward();



/* ===== Bark Raiders v0.23 extension ===== */
(function(){
  const BREEDS_V23 = {
    shiba:{label:'Shiba Inu', role:'Balanced scavenger', trait:'Steady Paws: a useful boost to every core raid job.', legacy:'shiba', hp:4, attack:1, defence:1, crit:3, speed:0, carry:2, scout:0, rare:0, extract:2, colors:{red:'#d1783d', black:'#322824', sesame:'#8b664b', cream:'#dcc6a0'}},
    jack:{label:'Jack Russell', role:'Aggressive scrapper', trait:'First In: higher damage, critical chance, and movement speed.', legacy:'jack', hp:0, attack:2, defence:0, crit:6, speed:1, carry:0, scout:0, rare:0, extract:0, colors:{tan:'#d9ba88', black:'#2e2a28', tri:'#b37d55'}},
    collie:{label:'Border Collie', role:'Pathfinder scout', trait:'Route Sense: reveals farther, moves faster, and extracts more safely.', legacy:'collie', hp:2, attack:0, defence:0, crit:2, speed:1, carry:2, scout:1, rare:0, extract:6, colors:{classic:'#222222', red:'#804734', merle:'#8f949f'}},
    dachshund:{label:'Dachshund', role:'Cache specialist', trait:'Burrow Nose: carries more and improves rare finds and extraction.', legacy:'dachshund', hp:0, attack:0, defence:1, crit:2, speed:0, carry:4, scout:0, rare:4, extract:6, colors:{blacktan:'#2a2320', chocolate:'#644430', dapple:'#8d7c72'}},
    pom:{label:'Pomeranian', role:'Lucky skirmisher', trait:'Chaos Luck: better critical hits, rare loot, and quick movement.', legacy:'pom', hp:-2, attack:0, defence:0, crit:5, speed:1, carry:0, scout:0, rare:7, extract:2, colors:{orange:'#d48641', cream:'#e8d2af', black:'#24201d', white:'#f1eee9', sable:'#8c6a44'}},
    bulldog:{label:'Bulldog', role:'Armoured hauler', trait:'Hard Head: much tougher and able to haul a larger pack.', legacy:'jack', hp:8, attack:1, defence:2, crit:0, speed:0, carry:4, scout:0, rare:0, extract:0, colors:{tan:'#b6865f', brindle:'#6f4a33', white:'#e8e1d8'}},
    lab:{label:'Labrador', role:'Recovery specialist', trait:'Field Medic: tougher bandages plus a sturdy all-round frame.', legacy:'shiba', hp:6, attack:0, defence:1, crit:0, speed:0, carry:2, scout:0, rare:0, extract:2, heal:4, colors:{yellow:'#d8c08c', black:'#272321', choco:'#6f4930'}},
    greyhound:{label:'Greyhound', role:'Fast runner', trait:'Breakaway: exceptional movement and dodge with safer extraction.', legacy:'collie', hp:-4, attack:0, defence:-1, crit:3, speed:2, carry:0, scout:1, rare:0, extract:5, colors:{fawn:'#b58b64', blue:'#747d85', black:'#1d1b1a'}},
  };

  function v23BreedKeys(){ return Object.keys(BREEDS_V23); }
  function breedDef(key){ return BREEDS_V23[key] || BREEDS_V23.shiba; }
  function v23Safe(name, fallback){ return (typeof name === 'string' && name.trim()) ? name.trim() : fallback; }

  function colorOptionsForBreed(key){
    return Object.entries(breedDef(key).colors).map(([id, hex]) => ({id, hex}));
  }

  function buildDogSprite(breedKey, colorKey){
    const breed = breedDef(breedKey);
    const coat = breed.colors[colorKey] || Object.values(breed.colors)[0] || '#c48a57';
    const secondary = '#f2e8da';
    const stroke = '#1c1713';
    const ear = breedKey === 'jack' ? 'M16 20 L10 8 L20 16 Z M44 20 L54 8 L44 16 Z' :
                breedKey === 'collie' ? 'M16 18 L10 4 L22 14 Z M42 18 L54 4 L42 14 Z' :
                breedKey === 'dachshund' ? 'M18 20 C13 14 10 13 10 8 C15 9 18 13 22 18 Z M42 20 C47 14 50 13 50 8 C45 9 42 13 38 18 Z' :
                breedKey === 'pom' ? 'M16 20 L9 10 L21 14 Z M44 20 L55 10 L43 14 Z' :
                breedKey === 'bulldog' ? 'M16 21 L12 11 L22 17 Z M44 21 L52 11 L42 17 Z' :
                'M18 20 L12 10 L22 16 Z M42 20 L52 10 L42 16 Z';
    const muzzle = breedKey === 'greyhound' ? '<ellipse cx="32" cy="35" rx="13" ry="10" fill="'+secondary+'" stroke="'+stroke+'" stroke-width="2"/><ellipse cx="32" cy="37" rx="9" ry="6" fill="#fff7ed"/>' :
                   '<ellipse cx="32" cy="35" rx="11" ry="9" fill="'+secondary+'" stroke="'+stroke+'" stroke-width="2"/>';
    const armour = '<path d="M18 40 Q32 34 46 40 L44 55 Q32 59 20 55 Z" fill="#55606d" stroke="'+stroke+'" stroke-width="2"/><path d="M22 44 H42" stroke="#8bd77f" stroke-width="2"/>';
    const backpack = '<rect x="8" y="34" width="10" height="15" rx="3" fill="#7a5a3a" stroke="'+stroke+'" stroke-width="2"/>';
    const weapon = '<rect x="44" y="42" width="15" height="4" rx="2" fill="#474d54" stroke="'+stroke+'" stroke-width="2"/><rect x="47" y="46" width="4" height="8" rx="1" fill="#474d54" stroke="'+stroke+'" stroke-width="2"/>';
    const bodyVariant = breedKey === 'dachshund'
      ? '<rect x="14" y="23" width="36" height="22" rx="12" fill="'+coat+'" stroke="'+stroke+'" stroke-width="2"/>'
      : breedKey === 'greyhound'
      ? '<ellipse cx="32" cy="36" rx="20" ry="15" fill="'+coat+'" stroke="'+stroke+'" stroke-width="2"/>'
      : '<ellipse cx="32" cy="34" rx="18" ry="16" fill="'+coat+'" stroke="'+stroke+'" stroke-width="2"/>';
    const extraFluff = breedKey === 'pom' ? '<circle cx="14" cy="34" r="7" fill="'+coat+'" opacity=".85"/><circle cx="50" cy="34" r="7" fill="'+coat+'" opacity=".85"/>' : '';
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <rect width="64" height="64" rx="10" fill="rgba(0,0,0,0)"/>
        <path d="${ear}" fill="${coat}" stroke="${stroke}" stroke-width="2"/>
        ${bodyVariant}
        ${extraFluff}
        ${muzzle}
        <circle cx="26" cy="31" r="2" fill="${stroke}"/><circle cx="38" cy="31" r="2" fill="${stroke}"/>
        <path d="M29 40 Q32 42 35 40" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>
        ${armour}
        ${backpack}
        ${weapon}
        <path d="M22 55 L20 63 M42 55 L44 63" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
      </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function v23MetaState(){
    if(!state.v23) state.v23 = {};
    state.v23.kennelSlots = state.v23.kennelSlots || 2;
    state.v23.dispatchProfiles = state.v23.dispatchProfiles || [];
    state.v23.biomeMastery = state.v23.biomeMastery || {city:{level:1,xp:0}, sewer:{level:1,xp:0}, factory:{level:1,xp:0}, farmland:{level:1,xp:0}};
    state.v23.market = state.v23.market || {rep:0, stockSeed:0, stock:[]};
    state.v23.raiderCounter = state.v23.raiderCounter || 2;
  }

  function defaultRaiderFromLegacy(){
    let legacy = 'shiba';
    if(['pom','jack','collie','dachshund','shiba'].includes(state.dogId)) legacy = state.dogId;
    const mapColor = {shiba:'red', pom:'orange', jack:'tan', collie:'classic', dachshund:'blacktan'};
    return {
      id:'raider1',
      name:(state.dog && state.dog.name) || (DOGS?.[legacy]?.name) || 'Mochi',
      breed:legacy,
      color:mapColor[legacy] || Object.keys(breedDef(legacy).colors)[0],
      level:(state.dog && state.dog.level) || 1,
      xp:(state.dog && state.dog.xp) || 0,
      xpNext:(state.dog && state.dog.xpNext) || 40,
      bond:0,
      injuries:[...(state.injuries||[])],
    };
  }

  function ensureRoster(){
    v23MetaState();
    if(!state.roster || !Array.isArray(state.roster) || !state.roster.length){
      state.roster = [defaultRaiderFromLegacy()];
    }
    state.roster = state.roster.map((r, idx) => ({
      id:r.id || ('raider'+(idx+1)),
      name:v23Safe(r.name, 'Raider '+(idx+1)),
      breed:breedDef(r.breed) ? r.breed : 'shiba',
      color:(r.color && breedDef(r.breed || 'shiba').colors[r.color]) ? r.color : Object.keys(breedDef(r.breed || 'shiba').colors)[0],
      accent:r.accent || '#8bd77f',
      level:r.level || 1,
      xp:r.xp || 0,
      xpNext:r.xpNext || 40,
      bond:r.bond || 0,
      injuries:Array.isArray(r.injuries) ? r.injuries : [],
    }));
    if(!state.dogId || !state.roster.some(r => r.id === state.dogId)) state.dogId = state.roster[0].id;
  }

  function currentRaider(){
    ensureRoster();
    return state.roster.find(r => r.id === state.dogId) || state.roster[0];
  }

  function syncRaiderFromState(){
    const r = currentRaider();
    if(!r) return;
    r.injuries = [...(state.injuries || [])];
    r.level = state.dog.level || r.level || 1;
    r.xp = state.dog.xp || r.xp || 0;
    r.xpNext = state.dog.xpNext || r.xpNext || 40;
  }

  function selectRaider(id){
    ensureRoster();
    if(!state.roster.some(r => r.id === id)) return;
    syncRaiderFromState();
    state.dogId = id;
    const r = currentRaider();
    state.injuries = [...(r.injuries || [])];
    state.dog.level = r.level || 1;
    state.dog.xp = r.xp || 0;
    state.dog.xpNext = r.xpNext || 40;
  }

  function masteryFor(key){ v23MetaState(); return state.v23.biomeMastery[key] || {level:1,xp:0}; }
  function masteryBonusMultiplier(key){
    const lvl = masteryFor(key).level || 1;
    if(lvl >= 10) return 1.15;
    if(lvl >= 5) return 1.10;
    if(lvl >= 2) return 1.05;
    return 1;
  }
  function awardBiomeMastery(key, amount){
    v23MetaState();
    const m = masteryFor(key);
    m.xp += amount;
    const threshold = m.level * 20;
    if(m.xp >= threshold && m.level < 10){
      m.xp -= threshold;
      m.level++;
      log(`Biome Mastery up: ${BIOMES[key].name} reached Lv.${m.level}.`);
    }
    state.v23.biomeMastery[key] = m;
  }

  function marketCatalog(){
    const rep = state.v23.market.rep || 0;
    const markdown = Math.max(0, Math.min(20, rep * 2));
    return [
      {id:'meds', label:'Emergency Meds', desc:'Clean meds for the recovery kennel.', gives:{medicine:4}, cost:{metal:7, food:6}},
      {id:'wood', label:'Pallet of Timber', desc:'Useful for kennel upgrades.', gives:{wood:16}, cost:{metal:8, water:5}},
      {id:'parts', label:'Gun Parts Crate', desc:'Rare parts for the bench.', gives:{gunParts:4}, cost:{metal:15, wood:10, medicine:2}},
      {id:'ammo', label:'Ammo Bundle', desc:'A basic ammo restock.', gives:{ammo:14}, cost:{metal:8, food:4, gunParts:1}},
      {id:'fabric', label:'Fabric Roll', desc:'Patch packs and collars.', gives:{fabric:12}, cost:{food:5, water:5}},
    ].map(item => ({...item, markdown}));
  }

  function marketCostText(cost, markdown){
    const adjusted = {};
    Object.entries(cost).forEach(([k,v]) => adjusted[k] = Math.max(1, Math.round(v * (1 - markdown/100))));
    return costText(adjusted);
  }

  function canAffordAdjusted(cost, markdown){
    return Object.entries(cost).every(([k,v]) => (state.resources[k] || 0) >= Math.max(1, Math.round(v * (1 - markdown/100))));
  }
  function payAdjusted(cost, markdown){
    Object.entries(cost).forEach(([k,v]) => state.resources[k] -= Math.max(1, Math.round(v * (1 - markdown/100))));
  }

  function buyMarketItem(id){
    v23MetaState();
    const item = marketCatalog().find(x => x.id === id);
    if(!item) return;
    if(!canAffordAdjusted(item.cost, item.markdown)){ log('Cannot afford market purchase.'); return; }
    payAdjusted(item.cost, item.markdown);
    Object.entries(item.gives).forEach(([k,v]) => state.resources[k] = (state.resources[k] || 0) + v);
    state.v23.market.rep += 1;
    log(`Market purchase: ${item.label}.`);
    save(); render();
  }
  window.buyMarketItem = buyMarketItem;

  function sellResource(type){
    const saleQty = Math.min(state.resources[type] || 0, type === 'gunParts' ? 1 : 5);
    if(saleQty <= 0){ log(`No ${type} available to sell.`); return; }
    state.resources[type] -= saleQty;
    state.resources.food += Math.max(1, Math.ceil(saleQty / 2));
    state.resources.water += Math.max(1, Math.floor(saleQty / 2));
    state.v23.market.rep += 0.5;
    log(`Sold ${saleQty} ${type} at the market.`);
    save(); render();
  }
  window.sellResource = sellResource;

  function healRaider(id){
    const r = state.roster.find(x => x.id === id);
    if(!r || !r.injuries.length) return;
    const cost = 4 + r.injuries.length * 2;
    if((state.resources.medicine || 0) < cost){ log('Not enough medicine to treat that raider.'); return; }
    state.resources.medicine -= cost;
    r.injuries = [];
    if(state.dogId === id) state.injuries = [];
    log(`${r.name} is patched up in the recovery kennel.`);
    save(); render();
  }
  window.healRaider = healRaider;

  function buyKennelSlot(){
    v23MetaState();
    const next = state.v23.kennelSlots + 1;
    const cost = {wood: next * 6, metal: next * 5, fabric: next * 4};
    if(!canAffordFromResources(cost)){ log('Not enough resources for another kennel slot.'); return; }
    payFromResources(cost);
    state.v23.kennelSlots++;
    log(`Kennel expanded to ${state.v23.kennelSlots} raider slots.`);
    save(); render();
  }
  window.buyKennelSlot = buyKennelSlot;

  function createRaider(){
    ensureRoster();
    v23MetaState();
    if(state.roster.length >= state.v23.kennelSlots){ log('No empty kennel slot. Expand the kennel first.'); return; }
    const name = v23Safe(($('newRaiderName')?.value || '').trim(), `Raider ${state.v23.raiderCounter}`);
    const breed = $('newRaiderBreed')?.value || 'shiba';
    const color = $('newRaiderColor')?.value || Object.keys(breedDef(breed).colors)[0];
    const id = 'raider' + state.v23.raiderCounter++;
    state.roster.push({id, name, breed, color, level:1, xp:0, xpNext:40, bond:0, injuries:[]});
    state.dogId = id;
    state.injuries = [];
    log(`Created new raider: ${name} the ${breedDef(breed).label}.`);
    save(); render();
  }
  window.createRaider = createRaider;

  function populateColorSelect(){
    const breed = $('newRaiderBreed')?.value || 'shiba';
    const select = $('newRaiderColor');
    if(!select) return;
    const old = select.value;
    select.innerHTML = colorOptionsForBreed(breed).map(c => `<option value="${c.id}">${c.id}</option>`).join('');
    if([...select.options].some(o => o.value === old)) select.value = old;
  }

  // Preserve original functions
  const __origSave = save;
  const __origLoad = load;
  const __origRender = render;
  const __origApplyUpgrades = applyUpgrades;
  const __origAddXp = addXp;
  const __origEndRaid = endRaid;
  const __origStartRaid = startRaid;
  const __origAddRaidLoot = addRaidLoot;
  const __origResetSave = resetSave;

  // Load/save extra meta
  function saveV23Meta(){
    syncRaiderFromState();
    v23MetaState();
    const meta = {
      roster: state.roster,
      v23: state.v23,
    };
    localStorage.setItem('barkRaidersMetaV23', JSON.stringify(meta));
  }
  function loadV23Meta(){
    try{
      const meta = JSON.parse(localStorage.getItem('barkRaidersMetaV23') || '{}');
      if(meta.roster) state.roster = meta.roster;
      if(meta.v23) state.v23 = {...(state.v23||{}), ...meta.v23};
    }catch(e){ console.warn('Could not load v23 meta', e); }
    ensureRoster();
  }

  save = function(){ __origSave(); saveV23Meta(); };
  resetSave = function(){ localStorage.removeItem('barkRaidersMetaV23'); __origResetSave(); };

  currentDogDef = function(){
    ensureRoster();
    const r = currentRaider();
    const b = breedDef(r.breed);
    return {
      name:r.name,
      breed:b.label,
      sprite:buildDogSprite(r.breed, r.color),
      desc:b.role,
      hp:b.hp || 0,
      attack:b.attack || 0,
      defence:b.defence || 0,
      crit:b.crit || 0,
      speed:b.speed || 0,
      carry:b.carry || 0,
      scout:b.scout || 0,
      rare:b.rare || 0,
      extract:b.extract || 0,
      heal:b.heal || 0,
      trait:b.trait || b.role,
      colorLabel:r.color,
    };
  };

  isDogUnlocked = function(id){ ensureRoster(); return state.roster.some(r => r.id === id); };
  ensureSelectedDogUnlocked = function(){ ensureRoster(); if(!state.roster.some(r => r.id === state.dogId)) state.dogId = state.roster[0].id; };

  renderDogOptions = function(){
    ensureRoster();
    $('dogSelect').innerHTML = state.roster.map(r => {
      const breed = breedDef(r.breed);
      const injured = r.injuries?.length ? ` · 🩹 ${r.injuries.length}` : '';
      return `<option value="${r.id}" ${r.id===state.dogId?'selected':''}>${r.name} — ${breed.label} (${r.color})${injured}</option>`;
    }).join('');
  };

  applyUpgrades = function(){
    ensureRoster();
    const r = currentRaider();
    state.injuries = [...(r.injuries || [])];
    state.dog.level = r.level || 1;
    state.dog.xp = r.xp || 0;
    state.dog.xpNext = r.xpNext || 40;
    __origApplyUpgrades();
    // breed-special passive
    syncRaiderFromState();
  };

  addXp = function(amount){
    __origAddXp(amount);
    const r = currentRaider();
    r.level = state.dog.level;
    r.xp = state.dog.xp;
    r.xpNext = state.dog.xpNext;
    r.bond = (r.bond || 0) + Math.max(1, Math.floor(amount / 5));
    saveV23Meta();
  };

  addRaidLoot = function(type, amount, source){
    const mult = masteryBonusMultiplier(biomeKey());
    const boosted = Math.max(1, Math.round(amount * mult));
    return __origAddRaidLoot(type, boosted, source);
  };

  startRaid = function(){
    ensureRoster();
    selectRaider($('dogSelect').value || state.dogId);
    return __origStartRaid();
  };

  endRaid = function(success, bossClear=false, floorClear=false){
    const bk = biomeKey();
    const beforeLvl = masteryFor(bk).level;
    const wasAuto = state.autoRaid;
    __origEndRaid(success, bossClear, floorClear);
    if(success) awardBiomeMastery(bk, bossClear ? 12 : floorClear ? 8 : 4);
    else awardBiomeMastery(bk, 2);
    const afterLvl = masteryFor(bk).level;
    if(afterLvl > beforeLvl) pushDialogue(`Base radio: "${BIOMES[bk].name} routes are getting familiar."`);
    syncRaiderFromState();
    saveV23Meta();
    if(!wasAuto) render();
  };

  function renderCreatorPanel(){
    const options = v23BreedKeys().map(k => `<option value="${k}">${breedDef(k).label} — ${breedDef(k).role}</option>`).join('');
    $('creatorPanel').innerHTML = `
      <div class="creator-grid">
        <label><span>Name</span><input id="newRaiderName" maxlength="18" placeholder="Name your raider"></label>
        <label><span>Breed</span><select id="newRaiderBreed">${options}</select></label>
        <label><span>Colour</span><select id="newRaiderColor"></select></label>
        <div class="creator-actions">
          <button onclick="createRaider()">Create Raider</button>
          <button class="ghost" onclick="buyKennelSlot()">Buy Kennel Slot</button>
        </div>
      </div>
      <p class="muted tiny">Kennel slots: ${state.v23.kennelSlots} · Roster size: ${state.roster.length}</p>`;
    populateColorSelect();
    $('newRaiderBreed').addEventListener('change', populateColorSelect);
  }

  function renderRosterPanel(){
    $('rosterPanel').innerHTML = state.roster.map(r => {
      const breed = breedDef(r.breed);
      const selected = r.id === state.dogId;
      const injuries = r.injuries?.length ? r.injuries.map(i => i.name).join(', ') : 'Healthy';
      return `<div class="upgrade ${selected ? 'quest-complete' : ''}">
        <div class="roster-card">
          <img class="mini-dog" src="${buildDogSprite(r.breed, r.color)}" alt="${r.name}">
          <div>
            <h3>${r.name}</h3>
            <p>${breed.label} · ${r.color}</p>
            <p>Lv.${r.level} · Bond ${r.bond || 0}</p>
            <p>${injuries}</p>
          </div>
        </div>
        <button ${selected?'disabled':''} onclick="selectRosterRaider('${r.id}')">${selected?'Active':'Select'}</button>
      </div>`;
    }).join('');
  }

  window.selectRosterRaider = function(id){
    selectRaider(id);
    save(); render();
  };

  function renderRecoveryPanel(){
    const injured = state.roster.filter(r => r.injuries?.length);
    $('recoveryPanel').innerHTML = injured.length ? injured.map(r => `
      <div class="upgrade">
        <div>
          <h3>${r.name}</h3>
          <p>${r.injuries.map(i => `${i.name} (${i.turns})`).join(', ')}</p>
          <p>Heal cost: ${4 + r.injuries.length * 2} medicine</p>
        </div>
        <button onclick="healRaider('${r.id}')">Treat</button>
      </div>`).join('') : '<p class="muted">No raiders currently need treatment.</p>';
  }

  function renderProfileOptions(){
    v23MetaState();
    const profiles = state.v23.dispatchProfiles;
    $('profileSelect').innerHTML = ['<option value="">No profile selected</option>'].concat(
      profiles.map((p, i) => `<option value="${i}">${p.name}</option>`)
    ).join('');
  }

  function captureCurrentProfile(name){
    return {
      name,
      zoneId: state.zoneId,
      floorId: state.floorId,
      planId: state.planId,
      contractId: state.contractId,
      autoExtractRule: state.autoExtractRule,
      selectedConsumables: [...state.selectedConsumables],
      lootFilter: {...state.lootFilter},
      dogId: state.dogId,
    };
  }

  function applyProfile(profile){
    if(!profile) return;
    state.zoneId = profile.zoneId ?? state.zoneId;
    state.floorId = profile.floorId ?? state.floorId;
    state.planId = profile.planId || state.planId;
    state.contractId = profile.contractId || state.contractId;
    state.autoExtractRule = profile.autoExtractRule || state.autoExtractRule;
    state.selectedConsumables = [...(profile.selectedConsumables || [])];
    state.lootFilter = {...state.lootFilter, ...(profile.lootFilter || {})};
    if(profile.dogId && state.roster.some(r => r.id === profile.dogId)) state.dogId = profile.dogId;
    save(); render();
  }

  window.saveDispatchProfile = function(){
    v23MetaState();
    const name = prompt('Profile name?', `Profile ${state.v23.dispatchProfiles.length + 1}`);
    if(!name) return;
    state.v23.dispatchProfiles.push(captureCurrentProfile(name.trim()));
    save(); render();
  };
  window.loadDispatchProfile = function(){
    const idx = Number($('profileSelect').value);
    if(Number.isNaN(idx)) return;
    applyProfile(state.v23.dispatchProfiles[idx]);
  };
  window.deleteDispatchProfile = function(){
    const idx = Number($('profileSelect').value);
    if(Number.isNaN(idx)) return;
    state.v23.dispatchProfiles.splice(idx, 1);
    save(); render();
  };

  function renderMarketPanel(){
    const rep = state.v23.market.rep || 0;
    const catalog = marketCatalog();
    const sells = ['wood','metal','fabric','medicine','gunParts'].map(type => `
      <div class="upgrade">
        <div>
          <h3>Sell ${type}</h3>
          <p>Trade up to ${type==='gunParts'?1:5} for food/water and rep.</p>
          <p>You have: ${state.resources[type] || 0}</p>
        </div>
        <button ${state.resources[type] ? '' : 'disabled'} onclick="sellResource('${type}')">Sell</button>
      </div>
    `).join('');
    $('marketPanel').innerHTML = `
      <div class="upgrade market-header">
        <div>
          <h3>Scav Market</h3>
          <p>Trader reputation: ${rep.toFixed(1)}</p>
          <p>Higher rep improves buy prices.</p>
        </div>
        <button disabled>Rep Discount ${Math.min(20, rep*2).toFixed(0)}%</button>
      </div>
      ${catalog.map(item => `
        <div class="upgrade">
          <div>
            <h3>${item.label}</h3>
            <p>${item.desc}</p>
            <p>Gives: ${costText(item.gives)}</p>
            <p>Cost: ${marketCostText(item.cost, item.markdown)}</p>
          </div>
          <button ${canAffordAdjusted(item.cost, item.markdown) ? '' : 'disabled'} onclick="buyMarketItem('${item.id}')">Buy</button>
        </div>`).join('')}
      ${sells}`;
  }

  function renderRaiderStatus(){
    const r = currentRaider();
    const breed = breedDef(r.breed);
    $('raiderStatus').innerHTML = `
      <div class="gear">
        <img class="mini-dog large" src="${buildDogSprite(r.breed, r.color)}" alt="${r.name}">
        <strong>${r.name}</strong>
        <span>${breed.label} · ${r.color}</span>
        <span>Lv.${r.level} · Bond ${r.bond || 0}</span>
      </div>
      <div class="gear">
        <strong>Breed Trait</strong>
        <span>${breed.role}</span>
        <span>${breed.trait}</span>
        <span>Bonuses: ${[
          breed.hp&&`${breed.hp>0?'+':''}${breed.hp} HP`,
          breed.attack&&`${breed.attack>0?'+':''}${breed.attack} ATK`,
          breed.defence&&`${breed.defence>0?'+':''}${breed.defence} DEF`,
          breed.crit&&`${breed.crit>0?'+':''}${breed.crit}% CRIT`,
          breed.speed&&`${breed.speed>0?'+':''}${breed.speed} SPD`,
          breed.carry&&`${breed.carry>0?'+':''}${breed.carry} CARRY`,
          breed.scout&&`${breed.scout>0?'+':''}${breed.scout} SCOUT`,
          breed.rare&&`${breed.rare>0?'+':''}${breed.rare}% RARE`,
          breed.extract&&`${breed.extract>0?'+':''}${breed.extract}% EXTRACT`,
          breed.heal&&`+${breed.heal} HEAL`,
        ].filter(Boolean).join(' · ')}</span>
      </div>
      <div class="gear">
        <strong>Condition</strong>
        <span>${(r.injuries?.length) ? r.injuries.map(i=>i.name).join(', ') : 'Healthy'}</span>
        <span>Roster size ${state.roster.length} / ${state.v23.kennelSlots}</span>
      </div>`;
  }

  function renderMasteryPanel(){
    const cards = Object.keys(BIOMES).map(key => {
      const m = masteryFor(key);
      const next = m.level * 20;
      const perks = m.level >= 10 ? '+15% loot, elite boss chance' : m.level >= 5 ? '+10% loot, better room odds' : m.level >= 2 ? '+5% loot' : 'No mastery bonus yet';
      return `<div class="intel-card">
        <strong>${BIOMES[key].icon} ${BIOMES[key].name}</strong>
        <span>Level ${m.level}</span>
        <span>XP ${m.xp} / ${next}</span>
        <span>${perks}</span>
      </div>`;
    }).join('');
    $('masteryPanel').innerHTML = `<div class="intel-card wide"><strong>Biome Mastery</strong><span>Keep clearing floors to improve loot and future biome perks.</span></div>${cards}`;
  }

  function renderBountyBoard(){
    const pool = bossPoolForBiome();
    const tiles = pool.map((b, i) => `<div class="intel-card">
      <strong>${b.icon} ${b.name}</strong>
      <span>Mechanic: ${bossMechanicLabel(b.behavior)}</span>
      <span>Bring: ${i % 2 ? 'Emergency Medkit' : 'Smoke Biscuit'}, ${i % 3 ? 'Lucky Treat' : 'Trader Token'}</span>
      <span>Bounty: ${costText(b.reward)}</span>
    </div>`).join('');
    $('bountyBoard').innerHTML = `<div class="intel-card wide"><strong>Bounty Board</strong><span>Boss floors: 3, 6, 10. Higher floors increase rewards and danger.</span></div>${tiles}`;
  }

  function renderCustomSprites(){
    const d = currentDogDef();
    ['heroDogSprite','combatDogSprite'].forEach(id => { if($(id)) $(id).src = d.sprite; });
    if($('dogName')) $('dogName').textContent = d.name;
    if($('dogBreedText')) $('dogBreedText').textContent = `Breed: ${d.breed} · ${d.colorLabel}`;
    if($('combatDogName')) $('combatDogName').textContent = d.name;
    if($('combatDogRole')) $('combatDogRole').textContent = `${d.breed} · ${d.colorLabel}`;
  }

  renderDispatchSummary = (function(orig){
    return function(){
      orig();
      const container = $('dispatchSummary');
      if(!container) return;
      const r = currentRaider();
      const extra = `<div class="dispatch-tile"><strong>Raider Bond</strong><span>${r.bond || 0}</span></div>`;
      container.innerHTML = container.innerHTML.replace('</div>', `${extra}</div>`);
    };
  })(renderDispatchSummary);

  render = function(){
    ensureRoster();
    v23MetaState();
    __origRender();
    renderProfileOptions();
    renderCreatorPanel();
    renderRosterPanel();
    renderRecoveryPanel();
    renderMarketPanel();
    renderRaiderStatus();
    renderMasteryPanel();
    renderBountyBoard();
    renderCustomSprites();
    if($('autoBtn')) $('autoBtn').disabled = false;
  };

  // Settings/Events
  if($('saveProfileBtn')) $('saveProfileBtn').addEventListener('click', window.saveDispatchProfile);
  if($('loadProfileBtn')) $('loadProfileBtn').addEventListener('click', window.loadDispatchProfile);
  if($('deleteProfileBtn')) $('deleteProfileBtn').addEventListener('click', window.deleteDispatchProfile);

  window.BREEDS_V23 = BREEDS_V23;
  window.breedDef = breedDef;
  window.v23MetaState = v23MetaState;
  window.ensureRoster = ensureRoster;
  window.currentRaider = currentRaider;
  window.masteryFor = masteryFor;

  loadV23Meta();
  ensureRoster();
  selectRaider(state.dogId);
  applyUpgrades();
  updateGear();
  render();
})();



/* ===== Bark Raiders v0.24 polish extension ===== */
(function(){
  function v24Ready(){ return typeof state !== 'undefined' && state.v23; }

  function v24Meta(){
    if(!state.v24) state.v24 = {};
    state.v24.factions = state.v24.factions || {
      traders:{name:'Scav Traders', rep: state.v23?.market?.rep || 0, desc:'Market contacts, medical barter, and black-market gear.'},
      kennel:{name:'Kennel Union', rep: state.roster?.length || 1, desc:'Your home base and raider support network.'},
      rats:{name:'Rat Court', rep:0, desc:'Sewer rivals. Beating rat bosses reduces their grip.'},
      crows:{name:'Crow Syndicate', rep:0, desc:'Thieves, spies, and rare loot brokers.'},
      rustclaw:{name:'Rustclaw Crew', rep:0, desc:'Factory scavengers, armour smugglers, and machine hoarders.'},
    };
    return state.v24;
  }

  function v24BuildSprite(breedKey, colorKey, accent='#8bd77f', pose='idle'){
    const breed = breedDef(breedKey);
    const coat = breed.colors[colorKey] || Object.values(breed.colors)[0] || '#c48a57';
    const secondary = '#f2e8da';
    const stroke = '#1c1713';
    const lean = pose === 'run' ? ' transform="skewX(-4)"' : '';
    const muzzle = pose === 'combat' ? '<ellipse cx="34" cy="34" rx="12" ry="9" fill="'+secondary+'" stroke="'+stroke+'" stroke-width="2"/>' :
                   '<ellipse cx="32" cy="35" rx="11" ry="9" fill="'+secondary+'" stroke="'+stroke+'" stroke-width="2"/>';
    const ears = breedKey === 'dachshund'
      ? 'M18 20 C13 14 10 13 10 8 C15 9 18 13 22 18 Z M42 20 C47 14 50 13 50 8 C45 9 42 13 38 18 Z'
      : breedKey === 'collie'
      ? 'M16 18 L10 4 L22 14 Z M42 18 L54 4 L42 14 Z'
      : 'M18 20 L12 10 L22 16 Z M42 20 L52 10 L42 16 Z';
    const body = breedKey === 'dachshund'
      ? '<rect x="12" y="24" width="40" height="20" rx="11" fill="'+coat+'" stroke="'+stroke+'" stroke-width="2"'+lean+'/>'
      : breedKey === 'greyhound'
      ? '<ellipse cx="32" cy="36" rx="21" ry="14" fill="'+coat+'" stroke="'+stroke+'" stroke-width="2"'+lean+'/>'
      : '<ellipse cx="32" cy="34" rx="18" ry="16" fill="'+coat+'" stroke="'+stroke+'" stroke-width="2"'+lean+'/>';
    const weapon = pose === 'combat'
      ? '<rect x="43" y="38" width="18" height="5" rx="2" fill="#464d55" stroke="'+stroke+'" stroke-width="2"/><circle cx="60" cy="40" r="2" fill="'+accent+'"/>'
      : '<rect x="44" y="42" width="14" height="4" rx="2" fill="#464d55" stroke="'+stroke+'" stroke-width="2"/>';
    const legs = pose === 'run'
      ? '<path d="M21 53 L15 62 M41 53 L49 62" stroke="'+stroke+'" stroke-width="3" stroke-linecap="round"/>'
      : '<path d="M22 55 L20 63 M42 55 L44 63" stroke="'+stroke+'" stroke-width="3" stroke-linecap="round"/>';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="10" fill="rgba(0,0,0,0)"/>
      <path d="${ears}" fill="${coat}" stroke="${stroke}" stroke-width="2"/>
      ${body}
      ${muzzle}
      <circle cx="26" cy="31" r="2" fill="${stroke}"/><circle cx="39" cy="31" r="2" fill="${stroke}"/>
      <path d="M29 40 Q32 42 35 40" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M18 40 Q32 34 46 40 L44 55 Q32 59 20 55 Z" fill="#535f6c" stroke="${stroke}" stroke-width="2"/>
      <path d="M21 44 H43" stroke="${accent}" stroke-width="2.5"/>
      <rect x="8" y="34" width="10" height="15" rx="3" fill="#7a5a3a" stroke="${stroke}" stroke-width="2"/>
      ${weapon}
      ${legs}
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function v24CurrentRaider(){ return (typeof currentRaider === 'function') ? currentRaider() : null; }

  function v24PreviewValues(){
    return {
      name: ($('modalRaiderName')?.value || '').trim() || 'New Raider',
      breed: $('modalRaiderBreed')?.value || 'shiba',
      color: $('modalRaiderColor')?.value || 'red',
      accent: $('modalRaiderAccent')?.value || '#8bd77f',
    };
  }

  function v24PopulateCreator(){
    if(!$('modalRaiderBreed')) return;
    const breedOptions = Object.keys(BREEDS_V23 || {}).map(k => `<option value="${k}">${breedDef(k).label} — ${breedDef(k).role}</option>`).join('');
    if(!$('modalRaiderBreed').innerHTML.trim()) $('modalRaiderBreed').innerHTML = breedOptions;
    v24PopulateModalColours();
    v24RenderCreatorPreview();
  }

  function v24PopulateModalColours(){
    const breed = $('modalRaiderBreed')?.value || 'shiba';
    const select = $('modalRaiderColor');
    if(!select) return;
    const old = select.value;
    select.innerHTML = Object.entries(breedDef(breed).colors).map(([id, hex]) => `<option value="${id}">${id}</option>`).join('');
    if([...select.options].some(o => o.value === old)) select.value = old;
  }

  function v24RenderCreatorPreview(){
    const v = v24PreviewValues();
    const breed = breedDef(v.breed);
    if($('creatorPreviewSprite')) $('creatorPreviewSprite').src = v24BuildSprite(v.breed, v.color, v.accent, 'combat');
    if($('creatorPreviewName')) $('creatorPreviewName').textContent = v.name;
    if($('creatorPreviewBreed')) $('creatorPreviewBreed').textContent = `${breed.label} · ${v.color}`;
    if($('creatorPreviewRole')) $('creatorPreviewRole').textContent = breed.role;
    if($('creatorStatPreview')) {
      $('creatorStatPreview').innerHTML = [
        ['HP', breed.hp || 0], ['ATK', breed.attack || 0], ['DEF', breed.defence || 0], ['CRIT', breed.crit || 0],
        ['SPD', breed.speed || 0], ['CARRY', breed.carry || 0], ['SCOUT', breed.scout || 0], ['RARE', breed.rare || 0], ['EXTRACT', breed.extract || 0],
      ].map(([k,v]) => `<div class="stat"><strong>${v>0?'+':''}${v}</strong><span>${k}</span></div>`).join('');
    }
  }

  function v24OpenCreator(){
    v24PopulateCreator();
    $('creatorModal').classList.remove('hidden');
  }
  function v24CloseCreator(){ $('creatorModal').classList.add('hidden'); }

  function v24CreateRaiderFromModal(){
    ensureRoster();
    v23MetaState();
    if(state.roster.length >= state.v23.kennelSlots){ log('No empty kennel slot. Expand the kennel first.'); return; }
    const v = v24PreviewValues();
    const id = 'raider' + state.v23.raiderCounter++;
    state.roster.push({id, name:v.name, breed:v.breed, color:v.color, accent:v.accent, level:1, xp:0, xpNext:40, bond:0, injuries:[]});
    state.dogId = id;
    state.injuries = [];
    v24CloseCreator();
    log(`Created new raider: ${v.name} the ${breedDef(v.breed).label}.`);
    save(); render();
  }

  function v24RenderWorldMap(){
    if(!$('worldMapPanel')) return;
    v24Meta();
    const keys = Object.keys(BIOMES);
    $('worldMapPanel').innerHTML = keys.map((key, index) => {
      const b = BIOMES[key];
      const max = maxUnlockedFloor(key);
      const mastery = masteryFor(key);
      const faction = key === 'sewer' ? 'Rat Court' : key === 'factory' ? 'Rustclaw Crew' : key === 'city' ? 'Crow Syndicate' : 'Kennel Union';
      const floors = Array.from({length:10},(_,i)=>{
        const f=i+1;
        return `<span class="${f<=max?'unlocked':'locked'} ${[3,6,10].includes(f)?'boss-floor':''}">F${f}</span>`;
      }).join('');
      return `<button class="world-biome ${state.zoneId===index?'active':''}" onclick="selectWorldBiome(${index})">
        <strong>${b.icon} ${b.name}</strong>
        <span>${b.desc}</span>
        <span>Mastery Lv.${mastery.level} · ${faction}</span>
        <div class="floor-pips">${floors}</div>
      </button>`;
    }).join('');
  }
  window.selectWorldBiome = function(index){
    state.zoneId = index;
    state.floorId = clamp(state.floorId || 1, 1, maxUnlockedFloor());
    generateMap();
    save();
    render();
    switchTab('raid');
  };

  function v24RenderFactionPanel(){
    if(!$('factionPanel')) return;
    const meta = v24Meta();
    const tradersRep = state.v23?.market?.rep || 0;
    meta.factions.traders.rep = tradersRep;
    meta.factions.kennel.rep = state.roster?.length || 1;
    const html = Object.values(meta.factions).map(f => `<div class="intel-card">
      <strong>${f.name}</strong>
      <span>${f.desc}</span>
      <span>Rep / Influence: ${Number(f.rep||0).toFixed(1)}</span>
    </div>`).join('');
    $('factionPanel').innerHTML = `<div class="intel-card wide"><strong>Factions</strong><span>Light faction flavour for traders, bosses, and future reputation systems.</span></div>${html}`;
  }

  const _v24Render = render;
  render = function(){
    _v24Render();
    v24RenderWorldMap();
    v24RenderFactionPanel();
    const r = v24CurrentRaider();
    if(r){
      const accent = r.accent || '#8bd77f';
      const pose = state.mode === 'combat' ? 'combat' : state.running ? 'run' : 'idle';
      const sprite = v24BuildSprite(r.breed, r.color, accent, pose);
      ['heroDogSprite','combatDogSprite'].forEach(id => { if($(id)) $(id).src = sprite; });
      if($('creatorPreviewSprite') && !$('creatorModal').classList.contains('hidden')) v24RenderCreatorPreview();
    }
  };

  const _v24CreateRaider = window.createRaider;
  window.createRaider = function(){ v24OpenCreator(); };
  window.v24OpenCreator = v24OpenCreator;
  window.v24CloseCreator = v24CloseCreator;
  window.v24CreateRaiderFromModal = v24CreateRaiderFromModal;

  if($('openCreatorBtn')) $('openCreatorBtn').addEventListener('click', v24OpenCreator);
  if($('closeCreatorBtn')) $('closeCreatorBtn').addEventListener('click', v24CloseCreator);
  if($('createRaiderModalBtn')) $('createRaiderModalBtn').addEventListener('click', v24CreateRaiderFromModal);
  ['modalRaiderName','modalRaiderBreed','modalRaiderColor','modalRaiderAccent'].forEach(id => {
    const el=$(id);
    if(el) el.addEventListener('input', () => { if(id==='modalRaiderBreed') v24PopulateModalColours(); v24RenderCreatorPreview(); });
    if(el) el.addEventListener('change', () => { if(id==='modalRaiderBreed') v24PopulateModalColours(); v24RenderCreatorPreview(); });
  });

  log('v0.24 polish loaded: creator modal, world map, sprite poses, and faction flavour.');
  render();
})();



/* ===== Bark Raiders v0.25 Market/Faction/Profile extension ===== */
(function(){
  const TRADERS_V25 = {
    milo:{
      name:'Milo the Mule',
      faction:'traders',
      role:'Bulk resources and boring-but-vital supplies.',
      greeting:'Milo: "Heavy bags, honest-ish prices."',
      speciality:['wood','fabric','water'],
      stock:[
        {id:'milo_wood', label:'Stacked Timber Pallet', desc:'+24 wood for building and room forcing.', gives:{wood:24}, cost:{food:8, water:8, metal:10}},
        {id:'milo_fabric', label:'Rolled Fabric Bale', desc:'+16 fabric for packs and collars.', gives:{fabric:16}, cost:{food:6, water:6, wood:8}},
        {id:'milo_water', label:'Clean Water Jugs', desc:'+14 water.', gives:{water:14}, cost:{food:6, wood:8}},
      ]
    },
    patch:{
      name:'Patch the Surgeon',
      faction:'kennel',
      role:'Medicine, injury treatment, and recovery supplies.',
      greeting:'Patch: "Stop bleeding on my floor and we can talk."',
      speciality:['medicine'],
      stock:[
        {id:'patch_meds', label:'Sterile Med Kit', desc:'+8 medicine.', gives:{medicine:8}, cost:{food:8, water:8, fabric:6}},
        {id:'patch_recovery', label:'Recovery Voucher', desc:'Heals the active raider if injured.', action:'healActive', cost:{medicine:6, fabric:4, water:4}},
        {id:'patch_bandages', label:'Field Bandage Bundle', desc:'+4 medicine and +4 fabric.', gives:{medicine:4, fabric:4}, cost:{food:7, water:5}},
      ]
    },
    bolt:{
      name:'Bolt the Badger',
      faction:'rustclaw',
      role:'Gun parts, ammo, and dangerous upgrades.',
      greeting:'Bolt: "If it rattles, it probably still shoots."',
      speciality:['gunParts','ammo','metal'],
      stock:[
        {id:'bolt_parts', label:'Gun Parts Box', desc:'+7 gun parts.', gives:{gunParts:7}, cost:{metal:18, wood:10, medicine:3}},
        {id:'bolt_ammo', label:'Ammo Tin', desc:'+26 ammo.', gives:{ammo:26}, cost:{metal:12, gunParts:2, food:5}},
        {id:'bolt_scrap', label:'Machined Scrap', desc:'+18 metal.', gives:{metal:18}, cost:{wood:12, water:6}},
      ]
    },
    rook:{
      name:'Rook the Crow',
      faction:'crows',
      role:'Rare goods, charms, and suspiciously cheap secrets.',
      greeting:'Rook: "No refunds. No witnesses. Lovely doing business."',
      speciality:['rare','gunParts'],
      stock:[
        {id:'rook_lucky', label:'Lucky Charm Cache', desc:'Adds a random charm to inventory.', action:'randomCharm', cost:{gunParts:6, medicine:4, fabric:8}},
        {id:'rook_map', label:'Boss Intel Scrap', desc:'Temporary intel: reveals boss-style info and improves Crow rep.', action:'intel', cost:{wood:8, metal:8, food:4}},
        {id:'rook_parts', label:'Shiny Gun Bits', desc:'+4 gun parts, pricey but useful.', gives:{gunParts:4}, cost:{medicine:5, metal:12, fabric:6}},
      ]
    }
  };

  function v25Meta(){
    if(!state.v25) state.v25 = {};
    state.v25.activeTrader = state.v25.activeTrader || 'milo';
    state.v25.profileMode = state.v25.profileMode || 'manual';
    state.v25.bossDialogues = state.v25.bossDialogues || [];
    if(!state.v24) state.v24 = {};
    if(!state.v24.factions){
      state.v24.factions = {
        traders:{name:'Scav Traders', rep:0, desc:'Market contacts, medical barter, and black-market gear.'},
        kennel:{name:'Kennel Union', rep:1, desc:'Your home base and raider support network.'},
        rats:{name:'Rat Court', rep:0, desc:'Sewer rivals. Beating rat bosses reduces their grip.'},
        crows:{name:'Crow Syndicate', rep:0, desc:'Thieves, spies, and rare loot brokers.'},
        rustclaw:{name:'Rustclaw Crew', rep:0, desc:'Factory scavengers, armour smugglers, and machine hoarders.'},
      };
    }
    return state.v25;
  }

  function traderRep(faction){
    v25Meta();
    return Number(state.v24.factions?.[faction]?.rep || 0);
  }
  function addFactionRep(faction, amount){
    v25Meta();
    if(!state.v24.factions[faction]) return;
    state.v24.factions[faction].rep = Math.max(-20, Math.min(50, traderRep(faction) + amount));
  }
  function traderDiscount(faction){
    return Math.max(-15, Math.min(25, Math.floor(traderRep(faction) * 1.5)));
  }
  function adjustedCost(cost, discount){
    const out = {};
    Object.entries(cost || {}).forEach(([k,v]) => out[k] = Math.max(1, Math.round(v * (1 - discount/100))));
    return out;
  }
  function canAffordV25(cost){ return Object.entries(cost || {}).every(([k,v]) => (state.resources[k] || 0) >= v); }
  function payV25(cost){ Object.entries(cost || {}).forEach(([k,v]) => state.resources[k] -= v); }

  function buyTraderItem(traderId, itemId){
    const trader = TRADERS_V25[traderId];
    if(!trader) return;
    const item = trader.stock.find(x => x.id === itemId);
    if(!item) return;
    const discount = traderDiscount(trader.faction);
    const cost = adjustedCost(item.cost, discount);
    if(!canAffordV25(cost)){ log(`${trader.name}: "Come back with a fuller bag."`); return; }
    payV25(cost);
    if(item.gives) Object.entries(item.gives).forEach(([k,v]) => state.resources[k] = (state.resources[k] || 0) + v);
    if(item.action === 'healActive'){
      const r = typeof currentRaider === 'function' ? currentRaider() : null;
      if(r && r.injuries?.length){
        r.injuries = [];
        state.injuries = [];
        log(`${trader.name} patches up ${r.name}.`);
      } else {
        state.resources.medicine += 2;
        log(`${trader.name}: "No injury? Fine, take spare meds."`);
      }
    }
    if(item.action === 'randomCharm'){
      const charms = [
        {name:'Rook Feather Tag', rarity:'Rare', crit:6, rare:6, extract:0, score:18},
        {name:'Black Market Bell', rarity:'Rare', crit:2, rare:10, extract:3, score:20},
        {name:'Crow-Eye Charm', rarity:'Epic', crit:4, rare:14, extract:4, score:28},
      ];
      const charm = charms[Math.floor(Math.random()*charms.length)];
      state.equipmentInventory.charm.push(charm);
      log(`${trader.name} sells ${charm.name}.`);
    }
    if(item.action === 'intel'){
      state.research.bossMap = true;
      log(`${trader.name}: "Boss routes marked. Do not ask where I got them."`);
    }
    addFactionRep(trader.faction, 1);
    if(trader.faction === 'crows') addFactionRep('traders', -0.2);
    if(trader.faction === 'rustclaw') addFactionRep('rustclaw', 0.5);
    state.v23.market.rep = Math.max(state.v23.market.rep || 0, traderRep('traders'));
    pushDialogue(trader.greeting);
    save(); render();
  }
  window.buyTraderItem = buyTraderItem;

  function selectTrader(id){
    v25Meta();
    state.v25.activeTrader = id;
    const trader = TRADERS_V25[id];
    if(trader) pushDialogue(trader.greeting);
    save(); render();
  }
  window.selectTrader = selectTrader;

  function renderTraderList(){
    if(!$('traderList')) return;
    v25Meta();
    $('traderList').innerHTML = Object.entries(TRADERS_V25).map(([id,t]) => `
      <button class="trader-button ${state.v25.activeTrader===id?'active':''}" onclick="selectTrader('${id}')">
        <strong>${t.name}</strong>
        <span>${t.role}</span>
        <span>Rep ${traderRep(t.faction).toFixed(1)} · Discount ${traderDiscount(t.faction)}%</span>
      </button>
    `).join('');
  }

  function renderTraderDetail(){
    if(!$('traderDetail') || !$('traderStock')) return;
    const id = state.v25.activeTrader || 'milo';
    const trader = TRADERS_V25[id] || TRADERS_V25.milo;
    const discount = traderDiscount(trader.faction);
    $('traderDetail').innerHTML = `<div class="intel-card wide">
      <strong>${trader.name}</strong>
      <span>${trader.role}</span>
      <span>${trader.greeting}</span>
      <span>Faction: ${state.v24.factions[trader.faction]?.name || trader.faction} · Rep ${traderRep(trader.faction).toFixed(1)} · Price modifier ${discount}%</span>
    </div>`;
    $('traderStock').innerHTML = trader.stock.map(item => {
      const cost = adjustedCost(item.cost, discount);
      const gives = item.gives ? costText(item.gives) : item.action === 'healActive' ? 'Treat active raider' : item.action === 'randomCharm' ? 'Random charm' : 'Boss intel';
      return `<div class="upgrade trader-stock-card">
        <div>
          <h3>${item.label}</h3>
          <p>${item.desc}</p>
          <p>Gives: ${gives}</p>
          <p>Cost: ${costText(cost)}</p>
        </div>
        <button ${canAffordV25(cost) ? '' : 'disabled'} onclick="buyTraderItem('${id}','${item.id}')">Buy</button>
      </div>`;
    }).join('');
  }

  function factionForBoss(enemy){
    const name = (enemy?.name || '').toLowerCase();
    if(name.includes('rat') || name.includes('gutter') || name.includes('drain')) return 'rats';
    if(name.includes('crow') || name.includes('baron') || name.includes('rook')) return 'crows';
    if(name.includes('gear') || name.includes('furnace') || name.includes('trolley')) return 'rustclaw';
    return 'kennel';
  }

  const bossIntroLines = {
    summon:['The floor trembles with tiny claws.', 'Rat Court chant echoes through the dark.'],
    lootStealBoss:['A shadow circles overhead, laughing.', 'Something shiny vanishes before the fight even starts.'],
    bleedBoss:['A blade scrapes across concrete.', 'The boss grins like this is personal.'],
    poisonBoss:['The air turns sour and green.', 'Every puddle suddenly looks alive.'],
    stealBoss:['A paw reaches for your pack.', 'Scrap clatters somewhere behind the boss.'],
    armourCheck:['Metal plates grind. This one wants a real test.', 'Weak weapons will not impress this brute.'],
    hazards:['The room becomes a deathtrap.', 'Floor hazards spark into life.'],
    burnBoss:['Heat pours through the doorway.', 'The boss room smells like smoke and fur.'],
    chaseBoss:['No hiding. No circling. Only running.', 'The boss cuts off the escape routes.'],
  };
  const bossDefeatLines = {
    rats:'Rat Court influence weakens.',
    crows:'Crow Syndicate loses face.',
    rustclaw:'Rustclaw Crew loses a hoard.',
    kennel:'Kennel Union morale rises.',
  };

  const _v25StartCombat = startCombat;
  startCombat = function(enemy,bossFight=false,sourceId=null){
    if(bossFight){
      const lines = bossIntroLines[enemy.behavior] || ['A boss steps out of the dark.'];
      const line = lines[Math.floor(Math.random()*lines.length)];
      state.v25.bossDialogues.unshift(`${enemy.name}: ${line}`);
      state.v25.bossDialogues = state.v25.bossDialogues.slice(0,8);
      pushDialogue(`${enemy.name}: "${line}"`);
    }
    return _v25StartCombat(enemy,bossFight,sourceId);
  };

  const _v25WinCombat = winCombat;
  winCombat = function(e){
    const wasBoss = !!e.bossFight;
    const faction = wasBoss ? factionForBoss(e) : null;
    const name = e.name;
    _v25WinCombat(e);
    if(wasBoss){
      addFactionRep(faction, -2);
      addFactionRep('kennel', 1);
      const line = bossDefeatLines[faction] || 'The local faction takes notice.';
      state.v25.bossDialogues.unshift(`${name} defeated: ${line}`);
      pushDialogue(`Base radio: "${line}"`);
      save();
    }
  };

  function profileSummary(profile){
    if(!profile) return 'No profile loaded.';
    const biome = BIOMES[Object.keys(BIOMES)[profile.zoneId % Object.keys(BIOMES).length]]?.name || 'Unknown';
    return `${profile.name}: ${biome} F${profile.floorId} · ${RAID_PLANS[profile.planId]?.name || profile.planId} · ${CONTRACTS[profile.contractId]?.name || 'No Contract'}`;
  }

  function applyQuickProfile(type){
    ensureRoster();
    ensureLootFilter();
    const cityMax = maxUnlockedFloor('city');
    const key = biomeKey();
    if(type === 'wood'){
      state.zoneId = 3 < state.unlockedZones ? 3 : 0;
      state.floorId = 1;
      state.planId = 'wood';
      state.contractId = 'wood';
      state.autoExtractRule = 'balanced';
      Object.keys(state.lootFilter).forEach(k => state.lootFilter[k] = ['wood','food','water','medicine'].includes(k));
    }
    if(type === 'push'){
      state.floorId = maxUnlockedFloor(key);
      state.planId = 'balanced';
      state.contractId = 'none';
      state.autoExtractRule = 'safe';
    }
    if(type === 'boss'){
      const max = maxUnlockedFloor(key);
      state.floorId = [10,6,3].find(f => f <= max) || max;
      state.planId = 'boss';
      state.contractId = 'boss';
      state.autoExtractRule = 'boss';
      Object.keys(state.lootFilter).forEach(k => state.lootFilter[k] = ['medicine','gunParts','metal','wood'].includes(k));
    }
    if(type === 'safe'){
      state.floorId = Math.max(1, Math.min(2, maxUnlockedFloor(key)));
      state.planId = 'safe';
      state.contractId = 'pest';
      state.autoExtractRule = 'safe';
    }
    if(type === 'trader'){
      state.planId = 'balanced';
      state.contractId = 'trader';
      state.autoExtractRule = 'balanced';
    }
    state.autoExtract = state.autoExtractRule !== 'off';
    generateMap(); save(); render();
  }
  window.applyQuickProfile = applyQuickProfile;

  function saveProfileNamed(name){
    v23MetaState();
    const profile = captureCurrentProfile(name);
    const existing = state.v23.dispatchProfiles.findIndex(p => p.name === name);
    if(existing >= 0) state.v23.dispatchProfiles[existing] = profile;
    else state.v23.dispatchProfiles.push(profile);
    save(); render();
  }
  window.saveProfileNamed = saveProfileNamed;

  function renderProfilePanel(){
    if(!$('profilePanel')) return;
    v23MetaState();
    const idx = Number($('profileSelect')?.value);
    const profile = Number.isNaN(idx) ? null : state.v23.dispatchProfiles[idx];
    $('profilePanel').innerHTML = `<div class="gear">
      <strong>Current Setup</strong>
      <span>${currentBiome().name} Floor ${currentFloor()} · ${currentPlan().name}</span>
      <span>Contract: ${currentContract().name} · Auto: ${state.autoExtractRule}</span>
    </div>
    <div class="profile-buttons">
      <button onclick="applyQuickProfile('wood')">Farm Wood</button>
      <button onclick="applyQuickProfile('push')">Push Floor</button>
      <button onclick="applyQuickProfile('boss')">Boss Hunt</button>
      <button onclick="applyQuickProfile('safe')">Safe XP</button>
      <button onclick="applyQuickProfile('trader')">Trader Run</button>
    </div>
    <div class="gear">
      <strong>Selected Profile</strong>
      <span>${profileSummary(profile)}</span>
    </div>`;
  }

  function renderBossDialoguePanel(){
    if(!$('bossDialoguePanel')) return;
    const lines = state.v25.bossDialogues || [];
    $('bossDialoguePanel').innerHTML = `<div class="intel-card wide">
      <strong>Boss Dialogue</strong>
      <span>Recent boss intros, taunts, and faction aftermath.</span>
    </div>` + (lines.length ? lines.map(line => `<div class="intel-card"><span>${line}</span></div>`).join('') : '<div class="intel-card"><span>No boss dialogue recorded yet.</span></div>');
  }

  const _v25Render = render;
  render = function(){
    _v25Render();
    v25Meta();
    renderTraderList();
    renderTraderDetail();
    renderProfilePanel();
    renderBossDialoguePanel();
  };

  const _v25Save = save;
  save = function(){
    _v25Save();
    try{
      localStorage.setItem('barkRaidersMetaV25', JSON.stringify({v25:state.v25, factions:state.v24?.factions}));
    }catch(e){}
  };
  const _v25Load = load;
  load = function(){
    _v25Load();
    try{
      const meta = JSON.parse(localStorage.getItem('barkRaidersMetaV25') || '{}');
      if(meta.v25) state.v25 = {...(state.v25||{}), ...meta.v25};
      if(meta.factions){ if(!state.v24) state.v24={}; state.v24.factions = {...(state.v24.factions||{}), ...meta.factions}; }
    }catch(e){}
    v25Meta();
  };

  v25Meta();
  log('v0.25 loaded: named traders, faction reputation, boss dialogue, and quick Auto-Raid profiles.');
  render();
})();
