const $ = (id) => document.getElementById(id);

const RESOURCES = ['food', 'water', 'wood', 'metal', 'fabric', 'medicine', 'gunParts', 'ammo'];
const ICONS = { food:'🥫', water:'💧', wood:'🪵', metal:'⚙️', fabric:'🧵', medicine:'🩹', gunParts:'🔩', ammo:'🔸' };

const SPRITES = {
  shiba: 'assets/shiba-raider.svg',
  pom: 'assets/pomeranian-raider.svg',
  rat: 'assets/rat-bandit.svg',
  crow: 'assets/crow-bandit.svg',
  raccoon: 'assets/raccoon-bandit.svg',
  stray: 'assets/stray-bandit.svg',
  alpha: 'assets/alpha-boss.svg',
};

const TILE_ART = {
  base: 'assets/tile-base.svg',
  crate: 'assets/tile-crate.svg',
  food: 'assets/tile-food.svg',
  water: 'assets/tile-water.svg',
  scrap: 'assets/tile-scrap.svg',
  medical: 'assets/tile-medical.svg',
  weapon: 'assets/tile-weapon.svg',
  event: 'assets/tile-event.svg',
  enemy: 'assets/tile-enemy.svg',
  rare: 'assets/tile-rare.svg',
  boss: 'assets/tile-boss.svg',
  cleared: 'assets/tile-cleared.svg',
  empty: 'assets/tile-empty.svg',
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
  { name:'Fresh Start', text:'Start with extra ammo and bandages.', ammoBonus:5, medBonus:4, threat:-3 },
  { name:'Quiet Streets', text:'Fewer enemies, slightly less loot.', quiet:true, threat:-10 },
  { name:'Boss Patrol', text:'The boss is restless; threat climbs faster.', bossRush:true, threat:10 },
];

const RESEARCH = {
  dogWhistle: {
    name: 'Dog Whistle',
    desc: 'Auto-Raid unlock. Automatically starts a new raid after returning.',
    cost: () => ({ metal:10, wood:8, fabric:6, gunParts:2 }),
  },
  ammoPress: {
    name: 'Ammo Press',
    desc: 'Start each raid with +8 ammo reserve.',
    cost: () => ({ metal:14, gunParts:5, wood:6 }),
  },
  paddedHarness: {
    name: 'Padded Harness',
    desc: 'Adds +10 carry limit and +1 defence.',
    cost: () => ({ fabric:14, metal:8, medicine:4 }),
  },
  bossMap: {
    name: 'Boss Trail Map',
    desc: 'Boss tile reveals earlier and gives +5% boss crit chance.',
    cost: () => ({ wood:10, metal:10, gunParts:4 }),
  },
};

const ZONES = [
  {
    id:0, name:'Suburb Ruins', bossName:'Rat King', bossSprite:SPRITES.rat,
    description:'Collapsed houses, food tins, and vermin packs.',
    mapSize:12, unlock:'Starter zone',
    baseLoot:{food:1.15, water:1, wood:1.1, metal:1, fabric:1, medicine:.8, gunParts:.65, ammo:.8},
    enemies:[
      {name:'Bin Rat', icon:'🐀', sprite:SPRITES.rat, hp:14, atk:4, def:0, xp:5, reward:{food:1, fabric:1, ammo:1}},
      {name:'Angry Crow', icon:'🐦‍⬛', sprite:SPRITES.crow, hp:12, atk:5, def:0, xp:5, reward:{water:1, metal:1}},
      {name:'Junk Raccoon', icon:'🦝', sprite:SPRITES.raccoon, hp:20, atk:6, def:1, xp:7, reward:{metal:2, wood:1}},
      {name:'Stray Scout', icon:'🐕', sprite:SPRITES.stray, hp:24, atk:7, def:1, xp:8, reward:{gunParts:1, ammo:2, fabric:1}},
    ],
    boss:{name:'Rat King', icon:'👑', sprite:SPRITES.rat, hp:58, atk:9, def:2, xp:25, reward:{food:7, water:4, metal:4, gunParts:2, medicine:2, ammo:5}},
  },
  {
    id:1, name:'Flooded Estate', bossName:'Stray Captain', bossSprite:SPRITES.stray,
    description:'Waterlogged streets with tougher scavengers.',
    mapSize:12, unlock:'Beat Rat King',
    baseLoot:{food:1, water:1.25, wood:.9, metal:1.1, fabric:1.1, medicine:1, gunParts:.85, ammo:.9},
    enemies:[
      {name:'Flood Crow', icon:'🐦‍⬛', sprite:SPRITES.crow, hp:18, atk:7, def:1, xp:8, reward:{water:2, fabric:1}},
      {name:'Estate Raider', icon:'🐕', sprite:SPRITES.stray, hp:26, atk:9, def:2, xp:10, reward:{gunParts:1, ammo:2, fabric:2}},
      {name:'Canal Raccoon', icon:'🦝', sprite:SPRITES.raccoon, hp:26, atk:8, def:2, xp:10, reward:{metal:2, medicine:1}},
      {name:'Muddy Rat Pack', icon:'🐀', sprite:SPRITES.rat, hp:30, atk:9, def:2, xp:11, reward:{food:2, ammo:2, metal:1}},
    ],
    boss:{name:'Stray Captain', icon:'⭐', sprite:SPRITES.stray, hp:78, atk:12, def:4, xp:38, reward:{food:8, water:8, metal:6, gunParts:4, medicine:3, ammo:6}},
  },
  {
    id:2, name:'Junkyard Mile', bossName:'Alpha Hound', bossSprite:SPRITES.alpha,
    description:'Big scrap piles, bad dogs, and the hardest boss.',
    mapSize:12, unlock:'Beat Stray Captain',
    baseLoot:{food:.85, water:.85, wood:1, metal:1.4, fabric:1.1, medicine:.9, gunParts:1.25, ammo:1.2},
    enemies:[
      {name:'Scrap Rat Pack', icon:'🐀', sprite:SPRITES.rat, hp:26, atk:9, def:2, xp:12, reward:{metal:2, ammo:2}},
      {name:'Junkyard Hound', icon:'🐕', sprite:SPRITES.stray, hp:34, atk:11, def:3, xp:14, reward:{metal:3, gunParts:1, ammo:3}},
      {name:'Armoured Raccoon', icon:'🦝', sprite:SPRITES.raccoon, hp:32, atk:10, def:4, xp:14, reward:{metal:3, medicine:1, fabric:2}},
      {name:'Wire Crow', icon:'🐦‍⬛', sprite:SPRITES.crow, hp:28, atk:12, def:2, xp:13, reward:{gunParts:1, ammo:4}},
    ],
    boss:{name:'Alpha Hound', icon:'👑', sprite:SPRITES.alpha, hp:105, atk:15, def:5, xp:55, reward:{food:10, water:10, metal:10, gunParts:6, medicine:4, ammo:10}},
  },
  {
    id:3, name:'Old Mall', bossName:'Trolley Tyrant', bossSprite:SPRITES.raccoon,
    description:'Retail ruins packed with rare crates and ugly ambushes.',
    mapSize:12, unlock:'Beat Alpha Hound',
    baseLoot:{food:1.25, water:1.05, wood:.9, metal:1.25, fabric:1.4, medicine:1.1, gunParts:1.2, ammo:1.2},
    enemies:[
      {name:'Shop Rat Swarm', icon:'🐀', sprite:SPRITES.rat, hp:34, atk:12, def:3, xp:15, reward:{food:3, fabric:2}},
      {name:'Mannequin Crow', icon:'🐦‍⬛', sprite:SPRITES.crow, hp:32, atk:14, def:3, xp:16, reward:{fabric:3, ammo:3}},
      {name:'Trolley Raccoon', icon:'🦝', sprite:SPRITES.raccoon, hp:42, atk:13, def:5, xp:18, reward:{metal:4, gunParts:1, medicine:1}},
      {name:'Security Stray', icon:'🐕', sprite:SPRITES.stray, hp:44, atk:15, def:4, xp:19, reward:{gunParts:2, ammo:4}},
    ],
    boss:{name:'Trolley Tyrant', icon:'🛒', sprite:SPRITES.raccoon, hp:132, atk:18, def:7, xp:80, reward:{food:14, water:10, metal:14, fabric:10, gunParts:8, medicine:6, ammo:12}},
  },
];

const TILE_TYPES = [
  {type:'empty', weight:16},
  {type:'crate', weight:17},
  {type:'food', weight:9},
  {type:'water', weight:9},
  {type:'scrap', weight:12},
  {type:'medical', weight:7},
  {type:'weapon', weight:7},
  {type:'event', weight:9},
  {type:'enemy', weight:15},
  {type:'rare', weight:4},
];

const UPGRADE_DEFS = {
  weapons: {
    name:'Weapons Bench',
    desc:'Improves pistol damage, crit chance, ammo reserve, and unlocks weapon names.',
    cost:lvl=>({metal:4*lvl, wood:2*lvl, gunParts:1*lvl, ammo:2*lvl}),
    apply:(lvl,dog)=>{ dog.attackBase = 8+(lvl-1)*4; dog.critBase = 6+(lvl-1)*2; dog.ammoMax = 22+(lvl-1)*7; },
  },
  armour: {
    name:'Armour Bench',
    desc:'Improves max HP and defence.',
    cost:lvl=>({metal:5*lvl, fabric:3*lvl, wood:1*lvl}),
    apply:(lvl,dog)=>{ dog.maxHpBase = 38+(lvl-1)*12; dog.defenceBase = 2+(lvl-1)*2; },
  },
  medical: {
    name:'Medical Bench',
    desc:'Improves healing after fights and emergency bandage strength.',
    cost:lvl=>({medicine:3*lvl, water:2*lvl, fabric:2*lvl}),
    apply:(lvl,dog)=>{ dog.healBetween = 2+(lvl-1)*2; dog.medkitPower = 6+(lvl-1)*4; },
  },
  storage: {
    name:'Storage Crate',
    desc:'Carry more loot and unlock more inventory space.',
    cost:lvl=>({wood:5*lvl, fabric:4*lvl, metal:2*lvl}),
    apply:(lvl,dog)=>{ dog.carryMaxBase = 22+(lvl-1)*12; dog.inventorySlots = 6+(lvl-1); },
  },
  water: {
    name:'Water Filter',
    desc:'Reduces harsh weather penalties and thirst drain.',
    cost:lvl=>({water:5*lvl, metal:2*lvl, wood:2*lvl}),
    apply:(lvl,dog)=>{ dog.weatherResistance = lvl-1; },
  },
  watch: {
    name:'Watch Tower',
    desc:'Improves scouting range, pathing speed, and extraction safety.',
    cost:lvl=>({wood:4*lvl, metal:3*lvl, fabric:1*lvl}),
    apply:(lvl,dog)=>{ dog.speedBase = 1+Math.floor((lvl-1)/2); dog.scoutRange = 1+Math.floor((lvl-1)/2); dog.extractBonus = (lvl-1)*5; },
  },
};

const state = {
  running:false,
  mode:'idle',
  seconds:0,
  ticker:null,
  autoRaid:false,
  zoneId:0,
  unlockedZones:1,
  weather:null,
  modifier:null,
  threat:0,
  map:[],
  mapSize:12,
  dog:{
    name:'Mochi', breed:'Shiba Inu Raider', sprite:SPRITES.shiba, level:1, xp:0, xpNext:40,
    maxHpBase:38, hp:38, attackBase:8, defenceBase:2, critBase:6, speedBase:1, carryMaxBase:22,
    inventorySlots:6, ammoMax:22, ammo:22, healBetween:2, medkitPower:6, weatherResistance:0, scoutRange:1, extractBonus:0,
    maxHp:38, attack:8, defence:2, crit:6, speed:1, carryMax:22, carry:0,
  },
  resources:{food:16, water:14, wood:12, metal:12, fabric:10, medicine:6, gunParts:4, ammo:18},
  raidLoot:emptyRes(),
  upgrades:{weapons:1, armour:1, medical:1, storage:1, water:1, watch:1},
  research:{dogWhistle:false, ammoPress:false, paddedHarness:false, bossMap:false},
  gear:[
    {slot:'Weapon', name:'Starter Pistol', icon:'🔫', detail:'Reliable, low damage, uses ammo.'},
    {slot:'Armour', name:'Scrap Vest', icon:'🦺', detail:'Light protection for early raids.'},
    {slot:'Utility', name:'Bandage Roll', icon:'🩹', detail:'Emergency healing during a raid.'},
    {slot:'Pack', name:'Small Backpack', icon:'🎒', detail:'Carries scavenged resources home.'},
    {slot:'Charm', name:'Lucky Bone', icon:'🦴', detail:'Small crit bonus.'},
    {slot:'Skin', name:'Pomeranian Alt', icon:'🐾', detail:'Asset included for later raiders.'},
  ],
  position:{x:0,y:0},
  revealedTiles:0,
  combat:null,
  encounterText:'No encounter active.',
};

function emptyRes(){ return Object.fromEntries(RESOURCES.map(r=>[r,0])); }
function rand(max){ return Math.floor(Math.random()*max); }
function pick(list){ return list[rand(list.length)]; }
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
function currentZone(){ return ZONES[state.zoneId]; }

function log(message){
  const el = document.createElement('div');
  el.className = 'log-entry';
  el.textContent = message;
  $('log').prepend(el);
}

function weightedPick(list){
  const total = list.reduce((s,i)=>s+i.weight,0);
  let r = Math.random()*total;
  for(const i of list){ r -= i.weight; if(r <= 0) return i; }
  return list[0];
}

function costText(cost){ return Object.entries(cost).map(([k,v])=>`${ICONS[k]} ${v}`).join(' '); }
function canPay(cost){ return Object.entries(cost).every(([k,v])=>state.resources[k] >= v); }
function pay(cost){ Object.entries(cost).forEach(([k,v])=>state.resources[k] -= v); }

function weaponName(){
  const lvl = state.upgrades.weapons;
  if(lvl >= 8) return 'Raider Carbine';
  if(lvl >= 5) return 'Modified SMG';
  if(lvl >= 3) return 'Reinforced Pistol';
  return 'Starter Pistol';
}
function armourName(){
  const lvl = state.upgrades.armour;
  if(lvl >= 8) return 'Riot Dog Armour';
  if(lvl >= 5) return 'Plated Harness';
  if(lvl >= 3) return 'Reinforced Scrap Vest';
  return 'Scrap Vest';
}

function applyUpgrades(){
  const d = state.dog;
  Object.entries(UPGRADE_DEFS).forEach(([key, def]) => def.apply(state.upgrades[key], d));
  d.maxHp = d.maxHpBase + (d.level-1)*4;
  d.attack = d.attackBase + Math.floor((d.level-1)*1.5);
  d.defence = d.defenceBase + Math.floor((d.level-1)/3);
  d.crit = d.critBase + 2 + Math.floor((d.level-1)/2);
  d.speed = d.speedBase;
  d.carryMax = d.carryMaxBase;
  if(state.research.ammoPress) d.ammoMax += 8;
  if(state.research.paddedHarness){ d.carryMax += 10; d.defence += 1; }
  if(state.research.bossMap) d.crit += state.combat?.enemy?.bossFight ? 5 : 0;
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
    state.dog.level += 1;
    state.dog.xpNext = Math.round(state.dog.xpNext * 1.35);
    log(`${state.dog.name} levelled up! Now level ${state.dog.level}.`);
  }
  applyUpgrades();
}

function buildTileTable(){
  return TILE_TYPES.map(tile=>{
    let weight = tile.weight;
    if(state.modifier?.crateBoost && ['crate','rare','weapon'].includes(tile.type)) weight += 5;
    if(state.modifier?.enemyBoost && tile.type === 'enemy') weight += 7;
    if(state.modifier?.quiet && tile.type === 'enemy') weight -= 7;
    if(state.modifier?.quiet && ['crate','rare'].includes(tile.type)) weight -= 2;
    if(state.modifier?.rareBonus && tile.type === 'rare') weight += 4;
    return {...tile, weight:Math.max(1, weight)};
  });
}

function getTile(x,y){ return state.map.find(t=>t.x===x && t.y===y); }

function revealAround(x,y,range){
  for(let yy=y-range; yy<=y+range; yy++){
    for(let xx=x-range; xx<=x+range; xx++){
      const t = getTile(xx,yy);
      if(t && !t.seen){ t.seen = true; state.revealedTiles++; }
    }
  }
}

function generateMap(){
  const zone = currentZone();
  state.map = [];
  state.mapSize = zone.mapSize;
  state.revealedTiles = 0;
  const table = buildTileTable();
  for(let y=0; y<zone.mapSize; y++){
    for(let x=0; x<zone.mapSize; x++){
      const t = weightedPick(table);
      state.map.push({x,y,type:t.type,seen:false,cleared:false});
    }
  }
  Object.assign(getTile(0,0), {type:'base', seen:true, cleared:true});
  Object.assign(getTile(zone.mapSize-1,zone.mapSize-1), {type:'boss', seen:!!state.research.bossMap, cleared:false});
  for(let i=0; i<16; i++){
    const tile = getTile(rand(zone.mapSize), rand(zone.mapSize));
    if(!tile || tile.type === 'base' || tile.type === 'boss') continue;
    if(i % 4 === 0) tile.type = 'enemy';
    else if(i % 4 === 1) tile.type = 'crate';
    else if(i % 4 === 2) tile.type = 'scrap';
    else tile.type = 'event';
  }
  state.position = {x:0,y:0};
  revealAround(0,0,state.dog.scoutRange);
}

function tilePriority(tile){
  if(tile.type === 'boss') return state.dog.level >= 2 ? 6 : 1;
  const p = {rare:10, weapon:9, medical:8, crate:7, scrap:7, food:6, water:6, event:6, enemy:4, empty:2};
  return p[tile.type] || 1;
}

function chooseTargetTile(){
  const open = state.map.filter(t => !t.cleared && t.type !== 'base');
  const normal = open.filter(t => t.type !== 'boss');
  const pool = normal.length ? normal : open;
  pool.sort((a,b)=>{
    const da = Math.abs(a.x-state.position.x)+Math.abs(a.y-state.position.y);
    const db = Math.abs(b.x-state.position.x)+Math.abs(b.y-state.position.y);
    const pa = tilePriority(a), pb = tilePriority(b);
    if(pa !== pb) return pb-pa;
    return da-db;
  });
  return pool[0] || null;
}

function stepToward(target){
  const dx = target.x - state.position.x;
  const dy = target.y - state.position.y;
  let next;
  if(Math.abs(dx) >= Math.abs(dy) && dx) next = getTile(state.position.x + Math.sign(dx), state.position.y);
  if(!next && dy) next = getTile(state.position.x, state.position.y + Math.sign(dy));
  if(!next && dx) next = getTile(state.position.x + Math.sign(dx), state.position.y);
  return next;
}

function addRaidLoot(type, amount){
  if(type === 'ammo'){
    const gain = clamp(amount, 0, state.dog.ammoMax - state.dog.ammo);
    state.dog.ammo += gain;
    state.raidLoot.ammo += gain;
    return gain;
  }
  if(state.dog.carry >= state.dog.carryMax) return 0;
  const gain = clamp(amount, 0, state.dog.carryMax - state.dog.carry);
  state.raidLoot[type] += gain;
  state.dog.carry += gain;
  return gain;
}

function bundleFor(type){
  return {
    crate:['food','water','wood','metal','fabric'],
    food:['food','food','water'],
    water:['water','water','medicine'],
    scrap:['wood','metal','metal','fabric'],
    medical:['medicine','medicine','water'],
    weapon:['gunParts','metal','ammo','ammo'],
    rare:['gunParts','medicine','metal','fabric','food','ammo'],
  }[type] || ['food'];
}

function lootTile(tile){
  const zone = currentZone();
  const bundle = bundleFor(tile.type);
  const tries = tile.type === 'rare' ? 5+rand(3) : 2+rand(3);
  const found = [];
  for(let i=0;i<tries;i++){
    const type = pick(bundle);
    const mult = (zone.baseLoot[type] || 1) * (state.weather?.loot || 1);
    const amount = Math.max(1, Math.round((1+rand(tile.type === 'rare' ? 3 : 2))*mult));
    const gain = addRaidLoot(type, amount);
    if(gain) found.push(`${ICONS[type]} ${gain}`);
  }
  tile.cleared = true;
  state.threat += tile.type === 'rare' ? 7 : 3;
  state.encounterText = `Looted ${tile.type}: ${found.join(' ') || 'pack full'}.`;
  log(`${state.dog.name} looted ${tile.type}: ${found.join(' ') || 'pack full'}.`);
}

function randomEvent(tile){
  const events = [
    {name:'Abandoned Camp', text:'Useful tins and a half-full bottle.', effect:()=>{addRaidLoot('food',2+rand(2)); addRaidLoot('water',1+rand(2));}},
    {name:'Supply Drone Crash', text:'A busted drone spills ammo and parts.', effect:()=>{addRaidLoot('ammo',4+rand(4)); addRaidLoot('gunParts',1+rand(2));}},
    {name:'Old Medicine Cabinet', text:'Patch-up supplies restore health.', effect:()=>{addRaidLoot('medicine',1+rand(2)); state.dog.hp = Math.min(state.dog.maxHp, state.dog.hp + state.dog.medkitPower);}},
    {name:'Friendly Scavenger', text:'A nervous stranger leaves spare scrap.', effect:()=>{addRaidLoot(pick(['food','water','wood','metal','fabric']),2+rand(3));}},
    {name:'Hidden Trap', text:'A tripwire snaps under your paws.', effect:()=>{state.dog.hp = Math.max(1,state.dog.hp-(5+rand(5))); state.threat += 5;}},
    {name:'Kennel Signal', text:'You find a safer extraction route.', effect:()=>{state.threat = Math.max(0,state.threat-12);}},
    {name:'Lucky Collar Glow', text:'The lucky bone points to rare salvage.', effect:()=>{addRaidLoot('gunParts',1); addRaidLoot('medicine',1);}},
  ];
  const ev = pick(events);
  ev.effect();
  tile.cleared = true;
  state.threat += 2;
  state.encounterText = `${ev.name}: ${ev.text}`;
  log(`${ev.name}: ${ev.text}`);
}

function startCombat(enemy, bossFight=false){
  state.mode = 'combat';
  const hp = Math.round(enemy.hp * (state.weather?.enemy || 1));
  state.combat = { enemy:{...enemy, hp, maxHp:hp, atk:Math.round(enemy.atk*(state.weather?.enemy || 1)), bossFight} };
  state.threat += bossFight ? 18 : 8;
  state.encounterText = `${bossFight ? 'Boss fight!' : 'Combat!'} ${state.dog.name} engages ${enemy.name}.`;
  log(state.encounterText);
}

function fightRound(){
  if(!state.combat) return;
  const e = state.combat.enemy;
  const hasAmmo = state.dog.ammo > 0;
  const crit = Math.random()*100 < state.dog.crit;
  const outgoing = Math.max(1, state.dog.attack + (hasAmmo?3:0) - e.def + (crit?6:0));
  if(hasAmmo) state.dog.ammo -= 1;
  e.hp -= outgoing;
  const notes = [`${state.dog.name} hits ${e.name} for ${outgoing}${crit?' crit':''}.`];

  if(e.hp <= 0){ log(notes.join(' ')); winCombat(e); return; }

  const dodgeChance = Math.min(22, state.dog.speed*4 + (state.research.bossMap && e.bossFight ? 3 : 0));
  if(Math.random()*100 < dodgeChance){
    notes.push(`${state.dog.name} dodges the counterattack.`);
  } else {
    const incoming = Math.max(1, e.atk - state.dog.defence);
    state.dog.hp -= incoming;
    notes.push(`${e.name} hits back for ${incoming}.`);
  }

  if(state.dog.hp <= 0){
    state.dog.hp = 0;
    log(notes.join(' '));
    state.encounterText = `${state.dog.name} was beaten by ${e.name} and retreated to the kennel.`;
    endRaid(false);
    return;
  }

  if(state.dog.hp <= Math.ceil(state.dog.maxHp*.35) && state.raidLoot.medicine > 0){
    state.raidLoot.medicine -= 1;
    state.dog.carry = Math.max(0,state.dog.carry-1);
    state.dog.hp = Math.min(state.dog.maxHp, state.dog.hp + state.dog.medkitPower);
    notes.push(`${state.dog.name} uses a bandage for ${state.dog.medkitPower} HP.`);
  }
  state.encounterText = notes.join(' ');
  log(notes.join(' '));
}

function winCombat(e){
  Object.entries(e.reward).forEach(([k,v])=>addRaidLoot(k,v));
  addXp(e.xp || 5);
  state.dog.hp = Math.min(state.dog.maxHp, state.dog.hp + state.dog.healBetween);
  const tile = getTile(state.position.x,state.position.y);
  if(tile){ tile.cleared = true; tile.type = e.bossFight ? 'boss' : 'empty'; }
  if(e.bossFight){
    state.encounterText = `Boss defeated! ${e.name} has been beaten.`;
    log(`Boss defeated! ${e.name} drops a huge haul.`);
    if(state.unlockedZones < ZONES.length && state.zoneId === state.unlockedZones-1){
      state.unlockedZones++;
      log(`New zone unlocked: ${ZONES[state.unlockedZones-1].name}.`);
    }
    state.combat = null;
    state.mode = 'roaming';
    endRaid(true, true);
    return;
  }
  state.encounterText = `${state.dog.name} defeated ${e.name} and keeps moving.`;
  state.combat = null;
  state.mode = 'roaming';
}

function weatherDrain(){
  const drain = Math.max(0,(state.weather?.thirst || 0) - state.dog.weatherResistance);
  if(drain > 0 && Math.random() < .35){
    state.dog.hp = Math.max(1, state.dog.hp - drain);
    log(`${state.weather.name} wears ${state.dog.name} down for ${drain} HP.`);
  }
}

function resolveTile(tile){
  if(!tile || tile.cleared || tile.type === 'base') return;
  if(['crate','food','water','scrap','medical','weapon','rare'].includes(tile.type)) lootTile(tile);
  else if(tile.type === 'event') randomEvent(tile);
  else if(tile.type === 'enemy') startCombat(pick(currentZone().enemies), false);
  else if(tile.type === 'boss') startCombat(currentZone().boss, true);
  else { tile.cleared = true; state.encounterText = 'Quiet block. Nothing useful here.'; }

  weatherDrain();

  if(state.threat >= 100 && state.mode !== 'combat'){
    log('Threat hit 100%. The route is too hot. Forced extraction!');
    endRaid(Math.random()*100 < extractChance());
    return;
  }
  if(state.dog.carry >= state.dog.carryMax && state.mode !== 'combat'){
    log(`${state.dog.name}'s pack is full. Extracting.`);
    endRaid(true);
  }
}

function moveDog(){
  const current = getTile(state.position.x,state.position.y);
  if(current && !current.cleared && current.type !== 'base'){ resolveTile(current); return; }
  const target = chooseTargetTile();
  if(!target){ endRaid(true); return; }
  const next = stepToward(target);
  if(!next){ endRaid(true); return; }
  state.position = {x:next.x, y:next.y};
  revealAround(next.x,next.y,state.dog.scoutRange);
  resolveTile(next);
}

function extractChance(){
  return clamp(95 - state.threat + state.dog.extractBonus + state.dog.speed*2, 25, 100);
}

function tickRaid(){
  state.seconds++;
  state.threat = clamp(state.threat + (state.modifier?.bossRush ? 1.2 : .65) + (state.weather?.threat || 0)/30, 0, 100);
  if(state.mode === 'combat') fightRound();
  else if(state.mode === 'roaming'){
    const interval = Math.max(1, 4 - state.dog.speed);
    if(state.seconds % interval === 0) moveDog();
  }
  render();
}

function startRaid(){
  if(state.running) return;
  state.zoneId = Number($('zoneSelect').value);
  state.weather = pick(WEATHER);
  state.modifier = pick(MODIFIERS);
  state.running = true;
  state.mode = 'roaming';
  state.seconds = 0;
  state.threat = clamp(8 + (state.weather.threat || 0) + (state.modifier.threat || 0), 0, 60);
  state.raidLoot = emptyRes();
  state.combat = null;
  state.encounterText = 'Raid started.';
  computeRaidStats();
  state.dog.hp = state.dog.maxHp;
  state.dog.carry = 0;
  state.dog.ammo = Math.min(state.dog.ammoMax, state.resources.ammo + (state.modifier?.ammoBonus || 0));
  generateMap();
  log(`Raid started in ${currentZone().name}. Weather: ${state.weather.icon} ${state.weather.name}. Modifier: ${state.modifier.name}.`);
  log(`Objective: loot, survive, and beat ${currentZone().boss.name}. Extraction chance currently ${extractChance()}%.`);
  $('startBtn').disabled = true;
  $('returnBtn').disabled = false;
  $('zoneSelect').disabled = true;
  clearInterval(state.ticker);
  state.ticker = setInterval(tickRaid, 1000);
  render();
}

function bankRaidLoot(){
  RESOURCES.forEach(type=>{
    if(type === 'ammo') return;
    state.resources[type] += state.raidLoot[type];
  });
  state.resources.ammo = Math.max(0, state.dog.ammo);
}

function loseSomeLoot(){
  for(const type of RESOURCES){
    if(type === 'ammo') continue;
    state.raidLoot[type] = Math.floor(state.raidLoot[type] * .55);
  }
}

function endRaid(success, bossClear=false){
  if(!state.running) return;
  clearInterval(state.ticker);
  state.running = false;
  state.mode = 'idle';

  if(!success){
    loseSomeLoot();
    log('Bad extraction: some loot was dropped on the way home.');
  }
  bankRaidLoot();

  if(bossClear) log(`${state.dog.name} returned victorious after defeating ${currentZone().boss.name}.`);
  else if(success) log(`${state.dog.name} extracted to the kennel with supplies.`);
  else log(`${state.dog.name} limped home after a rough raid.`);

  $('startBtn').disabled = false;
  $('returnBtn').disabled = true;
  $('zoneSelect').disabled = false;
  save();
  render();

  if(state.autoRaid && state.research.dogWhistle){
    setTimeout(()=>{ if(!state.running) startRaid(); }, 900);
  }
}

function manualExtract(){
  if(!state.running) return;
  const chance = extractChance();
  const success = Math.random()*100 < chance;
  log(`Manual extraction rolled against ${chance}% safety.`);
  endRaid(success);
}

function buyUpgrade(key){
  if(state.running) return;
  const def = UPGRADE_DEFS[key];
  const cost = def.cost(state.upgrades[key]);
  if(!canPay(cost)){ log(`Not enough resources for ${def.name}.`); return; }
  pay(cost);
  state.upgrades[key]++;
  applyUpgrades();
  updateGear();
  log(`${def.name} upgraded to level ${state.upgrades[key]}.`);
  save(); render();
}

function buyResearch(key){
  if(state.running || state.research[key]) return;
  const def = RESEARCH[key];
  const cost = def.cost();
  if(!canPay(cost)){ log(`Not enough resources for ${def.name}.`); return; }
  pay(cost);
  state.research[key] = true;
  if(key === 'dogWhistle') log('Dog Whistle unlocked. Auto-Raid is now available.');
  else log(`${def.name} researched.`);
  applyUpgrades();
  save(); render();
}

function updateGear(){
  state.gear[0].name = weaponName();
  state.gear[0].detail = `Attack ${state.dog.attack}; ammo reserve ${state.dog.ammoMax}.`;
  state.gear[1].name = armourName();
  state.gear[1].detail = `Defence ${state.dog.defence}; max HP ${state.dog.maxHp}.`;
  state.gear[3].detail = `Carry limit ${state.dog.carryMax}; slots ${state.dog.inventorySlots}.`;
}

function renderZoneOptions(){
  $('zoneSelect').innerHTML = ZONES.map((zone,idx)=>{
    const locked = idx >= state.unlockedZones;
    return `<option value="${zone.id}" ${idx===state.zoneId?'selected':''} ${locked?'disabled':''}>${zone.name}${locked ? ` (Locked: ${zone.unlock})` : ''}</option>`;
  }).join('');
}

function renderStats(){
  updateGear();
  $('statusText').textContent = state.running ? (state.mode === 'combat' ? 'In combat.' : 'Roaming the zone.') : 'Resting at the kennel.';
  $('weatherText').textContent = state.weather ? `${state.weather.icon} ${state.weather.name} — ${state.weather.text}` : 'None';
  $('modifierText').textContent = state.modifier ? `${state.modifier.name} — ${state.modifier.text}` : 'None';
  $('threatText').textContent = state.running ? `${Math.round(state.threat)}% · Extract ${extractChance()}%` : '0%';
  $('dogName').textContent = state.dog.name;
  $('dogBreedText').textContent = `Breed: ${state.dog.breed}`;
  $('gearSummary').innerHTML = `Gear: <strong>${weaponName()}</strong> + <strong>${armourName()}</strong>`;

  const hpPct = clamp(state.dog.hp/state.dog.maxHp*100,0,100);
  const carryPct = clamp(state.dog.carry/state.dog.carryMax*100,0,100);
  const ammoPct = clamp(state.dog.ammo/state.dog.ammoMax*100,0,100);
  const xpPct = clamp(state.dog.xp/state.dog.xpNext*100,0,100);
  $('hpText').textContent = `${state.dog.hp} / ${state.dog.maxHp}`;
  $('carryText').textContent = `${state.dog.carry} / ${state.dog.carryMax}`;
  $('ammoText').textContent = `${state.dog.ammo} / ${state.dog.ammoMax}`;
  $('xpText').textContent = `Lv.${state.dog.level} · ${state.dog.xp} / ${state.dog.xpNext}`;
  $('hpBar').style.width = `${hpPct}%`;
  $('carryBar').style.width = `${carryPct}%`;
  $('ammoBar').style.width = `${ammoPct}%`;
  $('xpBar').style.width = `${xpPct}%`;
  $('raidTimer').textContent = `${String(Math.floor(state.seconds/60)).padStart(2,'0')}:${String(state.seconds%60).padStart(2,'0')}`;
  $('mapSummary').textContent = `${currentZone().description} · Revealed ${state.revealedTiles}/${state.map.length} tiles`;

  $('statGrid').innerHTML = [
    ['Attack', state.dog.attack], ['Defence', state.dog.defence], ['Crit', `${state.dog.crit}%`],
    ['Speed', state.dog.speed], ['Scout', state.dog.scoutRange], ['Slots', state.dog.inventorySlots],
  ].map(([l,v])=>`<div class="stat"><strong>${v}</strong><span>${l}</span></div>`).join('');
}

function renderGear(){
  $('gearGrid').innerHTML = state.gear.map(item=>`<div class="gear"><strong>${item.icon} ${item.slot}: ${item.name}</strong><span>${item.detail}</span></div>`).join('');
}

function renderResources(){
  $('resources').innerHTML = RESOURCES.map(type=>`<div class="resource"><strong>${ICONS[type]} ${state.resources[type]}</strong><span>${type}</span></div>`).join('');
  $('raidLootGrid').innerHTML = RESOURCES.map(type=>`<div class="resource"><strong>${ICONS[type]} ${type==='ammo'?state.dog.ammo:state.raidLoot[type]}</strong><span>${type==='ammo'?'ammo on dog':`${type} found`}</span></div>`).join('');
}

function renderUpgrades(){
  $('upgrades').innerHTML = Object.entries(UPGRADE_DEFS).map(([key,def])=>{
    const cost = def.cost(state.upgrades[key]);
    return `<div class="upgrade"><div><h3>${def.name} Lv.${state.upgrades[key]}</h3><p>${def.desc}</p><p>Cost: ${costText(cost)}</p></div><button ${!state.running && canPay(cost)?'':'disabled'} onclick="buyUpgrade('${key}')">Upgrade</button></div>`;
  }).join('');
}

function renderResearch(){
  $('researchGrid').innerHTML = Object.entries(RESEARCH).map(([key,def])=>{
    const bought = state.research[key];
    const cost = def.cost();
    return `<div class="upgrade"><div><h3>${bought?'✅ ':''}${def.name}</h3><p>${def.desc}</p><p>${bought ? 'Unlocked' : `Cost: ${costText(cost)}`}</p></div><button ${!state.running && !bought && canPay(cost)?'':'disabled'} onclick="buyResearch('${key}')">${bought?'Done':'Research'}</button></div>`;
  }).join('');
}

function renderCombat(){
  $('combatDogSprite').src = state.dog.sprite;
  $('heroDogSprite').src = state.dog.sprite;
  $('combatDogName').textContent = state.dog.name;
  $('combatDogRole').textContent = `${state.dog.breed} · Lv.${state.dog.level}`;
  $('combatDogHpText').textContent = `${state.dog.hp} / ${state.dog.maxHp} HP`;
  $('combatDogHpBar').style.width = `${clamp(state.dog.hp/state.dog.maxHp*100,0,100)}%`;
  if(state.combat){
    const e = state.combat.enemy;
    $('enemySprite').src = e.sprite;
    $('enemyName').textContent = e.name;
    $('enemyType').textContent = e.bossFight ? 'Zone boss' : 'Enemy encounter';
    $('enemyHpText').textContent = `${Math.max(0,e.hp)} / ${e.maxHp} HP`;
    $('enemyHpBar').style.width = `${clamp(e.hp/e.maxHp*100,0,100)}%`;
    $('combatState').textContent = e.bossFight ? 'Boss Fight' : 'Combat';
    $('combatState').className = 'pill';
  } else {
    $('enemySprite').src = currentZone().bossSprite;
    $('enemyName').textContent = state.running ? 'Scanning...' : 'No target';
    $('enemyType').textContent = state.running ? 'Looking for trouble' : 'Wandering the zone';
    $('enemyHpText').textContent = '--';
    $('enemyHpBar').style.width = '0%';
    $('combatState').textContent = state.running ? 'Roaming' : 'Idle';
    $('combatState').className = 'pill muted-pill';
  }
  $('encounterText').textContent = state.encounterText;
}

function tileImg(tile){
  if(tile.cleared && tile.type !== 'base') return TILE_ART.cleared;
  return TILE_ART[tile.type] || TILE_ART.empty;
}

function renderMap(){
  const dogMarkup = `<img class="mini-sprite" src="${state.dog.sprite}" alt="dog">`;
  $('map').innerHTML = state.map.map(tile=>{
    const current = tile.x === state.position.x && tile.y === state.position.y && state.running;
    const classes = ['tile', tile.type, current?'current':'', !tile.seen?'unseen':''].join(' ');
    const content = current
      ? `${dogMarkup}<span class="mini-overlay"><img class="tile-img" src="${tileImg(tile)}" alt=""></span>`
      : (tile.seen ? `<img class="tile-img" src="${tileImg(tile)}" alt="${tile.type}">` : '');
    return `<div class="${classes}">${content}</div>`;
  }).join('');
}

function render(){
  renderZoneOptions(); renderStats(); renderGear(); renderResources(); renderUpgrades(); renderResearch(); renderCombat(); renderMap();
  $('autoBtn').textContent = `Auto-Raid: ${state.autoRaid ? 'On' : 'Off'}`;
  $('autoBtn').disabled = !state.research.dogWhistle;
}

function save(){
  const payload = {
    resources:state.resources, upgrades:state.upgrades, unlockedZones:state.unlockedZones, zoneId:state.zoneId,
    research:state.research, dog:{level:state.dog.level, xp:state.dog.xp, xpNext:state.dog.xpNext}, autoRaid:state.autoRaid
  };
  localStorage.setItem('barkRaidersSaveV3', JSON.stringify(payload));
}

function load(){
  try{
    const data = JSON.parse(localStorage.getItem('barkRaidersSaveV3') || 'null');
    if(!data) return;
    state.resources = {...state.resources, ...(data.resources || {})};
    state.upgrades = {...state.upgrades, ...(data.upgrades || {})};
    state.research = {...state.research, ...(data.research || {})};
    state.unlockedZones = clamp(data.unlockedZones || 1, 1, ZONES.length);
    state.zoneId = clamp(data.zoneId || 0, 0, state.unlockedZones-1);
    state.autoRaid = !!data.autoRaid;
    if(data.dog){ state.dog.level = data.dog.level || 1; state.dog.xp = data.dog.xp || 0; state.dog.xpNext = data.dog.xpNext || 40; }
  }catch(e){ console.warn('Could not load save', e); }
}

function resetSave(){
  if(confirm('Reset Bark Raiders v0.3 save data?')){
    localStorage.removeItem('barkRaidersSaveV3');
    location.reload();
  }
}

function toggleAuto(){
  if(!state.research.dogWhistle){ log('Research Dog Whistle first to unlock Auto-Raid.'); return; }
  state.autoRaid = !state.autoRaid;
  save(); render();
}

$('startBtn').addEventListener('click', startRaid);
$('returnBtn').addEventListener('click', manualExtract);
$('resetBtn').addEventListener('click', resetSave);
$('autoBtn').addEventListener('click', toggleAuto);
$('zoneSelect').addEventListener('change', e => { state.zoneId = Number(e.target.value); generateMap(); render(); });
window.buyUpgrade = buyUpgrade;
window.buyResearch = buyResearch;

load();
applyUpgrades();
updateGear();
generateMap();
log('Welcome to Bark Raiders v0.3. Bigger gameplay systems and tile sprites are now in.');
log('Tip: extraction gets riskier as threat rises. Research Dog Whistle to unlock Auto-Raid.');
render();
