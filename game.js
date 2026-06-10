const $ = (id) => document.getElementById(id);

const RESOURCES = ['food', 'water', 'wood', 'metal', 'fabric', 'medicine', 'gunParts', 'ammo'];
const ICONS = { food:'🥫', water:'💧', wood:'🪵', metal:'⚙️', fabric:'🧵', medicine:'🩹', gunParts:'🔩', ammo:'🔸' };

const SPRITES = {
  shiba: 'assets/shiba-raider.svg',
  pom: 'assets/pomeranian-raider.svg',
  bulldog: 'assets/bulldog-raider.svg',
  collie: 'assets/collie-raider.svg',
  dachshund: 'assets/dachshund-raider.svg',
  rat: 'assets/rat-bandit.svg',
  crow: 'assets/crow-bandit.svg',
  raccoon: 'assets/raccoon-bandit.svg',
  stray: 'assets/stray-bandit.svg',
  alpha: 'assets/alpha-boss.svg',
};

const TILE_ART = {
  base:'assets/tile-base.svg', crate:'assets/tile-crate.svg', tree:'assets/tile-tree.svg', grove:'assets/tile-grove.svg',
  food:'assets/tile-food.svg', water:'assets/tile-water.svg', scrap:'assets/tile-scrap.svg', medical:'assets/tile-medical.svg',
  weapon:'assets/tile-weapon.svg', event:'assets/tile-event.svg', enemy:'assets/tile-enemy.svg', rare:'assets/tile-rare.svg',
  boss:'assets/tile-boss.svg', cleared:'assets/tile-cleared.svg', empty:'assets/tile-empty.svg',
};

const DOGS = {
  shiba: { name:'Mochi', breed:'Shiba Inu Raider', sprite:SPRITES.shiba, desc:'Balanced scout. Good crit and reliable combat.', hp:0, attack:1, defence:0, crit:5, speed:0, carry:0, scout:0, rare:0, extract:0 },
  pom: { name:'Pip', breed:'Pomeranian Chaos Raider', sprite:SPRITES.pom, desc:'Tiny chaos looter. Better rare finds and dodge, but fragile.', hp:-8, attack:0, defence:-1, crit:8, speed:1, carry:-4, scout:0, rare:8, extract:4 },
  bulldog: { name:'Buster', breed:'Bulldog Tank', sprite:SPRITES.bulldog, desc:'Slow but sturdy. Best for boss pushing.', hp:16, attack:0, defence:3, crit:-2, speed:-1, carry:4, scout:0, rare:0, extract:-2 },
  collie: { name:'Scout', breed:'Border Collie Pathfinder', sprite:SPRITES.collie, desc:'Fast route-finder. Better scouting and extraction.', hp:-2, attack:0, defence:0, crit:0, speed:1, carry:0, scout:1, rare:0, extract:8 },
  dachshund: { name:'Noodle', breed:'Dachshund Sneak', sprite:SPRITES.dachshund, desc:'Sneaky scavenger. Lower threat and better extraction.', hp:-4, attack:-1, defence:0, crit:4, speed:0, carry:2, scout:0, rare:3, extract:12 },
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
  {type:'weapon', weight:7}, {type:'event', weight:9}, {type:'enemy', weight:15}, {type:'rare', weight:4},
];

const UPGRADE_DEFS = {
  weapons:{ name:'Weapons Bench', icon:'🔫', desc:'Improves weapon damage, crit chance, and ammo reserve.', cost:l=>({metal:4*l, wood:2*l, gunParts:1*l, ammo:2*l}), apply:(l,d)=>{d.attackBase=8+(l-1)*4; d.critBase=6+(l-1)*2; d.ammoMax=14+(l-1)*4;} },
  armour:{ name:'Armour Bench', icon:'🦺', desc:'Improves max HP and defence.', cost:l=>({metal:5*l, fabric:3*l, wood:1*l}), apply:(l,d)=>{d.maxHpBase=38+(l-1)*12; d.defenceBase=2+(l-1)*2;} },
  medical:{ name:'Medical Bench', icon:'🩹', desc:'Better healing and stronger emergency bandages.', cost:l=>({medicine:3*l, water:2*l, fabric:2*l}), apply:(l,d)=>{d.healBetween=2+(l-1)*2; d.medkitPower=6+(l-1)*4;} },
  storage:{ name:'Storage Crate', icon:'📦', desc:'More total carry weight.', cost:l=>({wood:5*l, fabric:4*l, metal:2*l}), apply:(l,d)=>{d.carryMaxBase=22+(l-1)*12;} },
  pack:{ name:'Backpack Rack', icon:'🎒', desc:'More inventory slots for resource types.', cost:l=>({fabric:5*l, wood:3*l, metal:2*l}), apply:(l,d)=>{d.inventorySlots=4+(l-1);} },
  water:{ name:'Water Filter', icon:'💧', desc:'Reduces weather penalties and thirst drain.', cost:l=>({water:5*l, metal:2*l, wood:2*l}), apply:(l,d)=>{d.weatherResistance=l-1;} },
  watch:{ name:'Watch Tower', icon:'🗼', desc:'Improves scouting, speed, and extraction safety.', cost:l=>({wood:4*l, metal:3*l, fabric:1*l}), apply:(l,d)=>{d.speedBase=1+Math.floor((l-1)/2); d.scoutRange=1+Math.floor((l-1)/2); d.extractBonus=(l-1)*5;} },
};

const RESEARCH = {
  dogWhistle:{ name:'Dog Whistle', desc:'Unlocks Auto-Raid.', cost:()=>({metal:10, wood:8, fabric:6, gunParts:2}) },
  ammoPress:{ name:'Ammo Press', desc:'Start each raid with +5 ammo reserve.', cost:()=>({metal:14, gunParts:5, wood:6}) },
  paddedHarness:{ name:'Padded Harness', desc:'Adds +10 carry limit and +1 defence.', cost:()=>({fabric:14, metal:8, medicine:4}) },
  bossMap:{ name:'Boss Trail Map', desc:'Boss tile reveals earlier and boss crit improves.', cost:()=>({wood:10, metal:10, gunParts:4}) },
  kennelRoster:{ name:'Kennel Roster', desc:'Unlocks all dog raider roles permanently.', cost:()=>({food:10, water:10, wood:14, fabric:8}) },
};

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
  running:false, mode:'idle', seconds:0, ticker:null, autoRaid:false,
  zoneId:0, unlockedZones:1, planId:'balanced', dogId:'shiba', lootFilter:{}, weather:null, modifier:null, threat:0,
  map:[], roamEnemies:[], mapSize:12, position:{x:0,y:0}, revealedTiles:0, combat:null, pendingChoice:null, activeEventTile:null,
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
  const d=state.dog;
  Object.entries(UPGRADE_DEFS).forEach(([key,def])=>def.apply(state.upgrades[key],d));
  const dogDef=currentDogDef();
  d.name=dogDef.name; d.breed=dogDef.breed; d.sprite=dogDef.sprite;
  d.maxHp=d.maxHpBase+(d.level-1)*4+dogDef.hp+(state.equipment.armour.hp||0);
  d.attack=d.attackBase+Math.floor((d.level-1)*1.5)+dogDef.attack+(state.equipment.weapon.attack||0);
  d.defence=d.defenceBase+Math.floor((d.level-1)/3)+dogDef.defence+(state.equipment.armour.defence||0);
  d.crit=d.critBase+2+Math.floor((d.level-1)/2)+dogDef.crit+(state.equipment.weapon.crit||0)+(state.equipment.charm.crit||0);
  d.speed=Math.max(1,d.speedBase+dogDef.speed);
  d.carryMax=d.carryMaxBase+dogDef.carry+(state.equipment.armour.carry||0);
  d.scoutRange=Math.max(1,d.scoutRange+dogDef.scout);
  d.extractBonus=(d.extractBonus||0)+dogDef.extract+(state.equipment.charm.extract||0);
  d.rareBonus=dogDef.rare+(state.equipment.charm.rare||0);
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
  for(let yy=y-range; yy<=y+range; yy++){
    for(let xx=x-range; xx<=x+range; xx++){
      const t=getTile(xx,yy);
      if(t && !t.seen){ t.seen=true; state.revealedTiles++; }
    }
  }
}

function generateMap(){
  const zone=currentZone();
  state.map=[]; state.mapSize=zone.mapSize; state.revealedTiles=0;
  const table=buildTileTable();
  for(let y=0;y<zone.mapSize;y++){
    for(let x=0;x<zone.mapSize;x++){
      const t=weightedPick(table);
      state.map.push({x,y,type:t.type,seen:false,cleared:false});
    }
  }
  Object.assign(getTile(0,0),{type:'base',seen:true,cleared:true});
  Object.assign(getTile(zone.mapSize-1,zone.mapSize-1),{type:'boss',seen:!!state.research.bossMap,cleared:false});

  for(let i=0;i<24;i++){
    const tile=getTile(rand(zone.mapSize),rand(zone.mapSize));
    if(!tile || tile.type==='base' || tile.type==='boss') continue;
    const plan=currentPlan();
    if(plan.focus==='wood') tile.type = i%2 ? 'tree' : 'grove';
    else if(plan.focus==='scrap') tile.type = i%2 ? 'scrap' : 'weapon';
    else if(plan.focus==='medical') tile.type = i%2 ? 'medical' : 'event';
    else if(i%6===0) tile.type='enemy';
    else if(i%6===1) tile.type='crate';
    else if(i%6===2) tile.type='scrap';
    else if(i%6===3) tile.type='tree';
    else if(i%6===4) tile.type='grove';
    else tile.type='event';
  }

  state.position={x:0,y:0};
  revealAround(0,0,state.dog.scoutRange);
}

function mapPoint(tile){
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
    state.roamEnemies.push({id:`roamer-${Date.now()}-${i}`,template,sprite:template.sprite,name:template.name,hp,maxHp:hp,left:pos.left,top:pos.top,targetLeft:pos.left,targetTop:pos.top,active:true,aggro:8+state.zoneId*1.5+(template.behavior==='chaser'?4:0)});
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
  const p={rare:10,weapon:9,medical:8,crate:7,scrap:7,grove:7,tree:6,food:6,water:6,event:6,enemy:4,empty:2};
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
    const da=Math.abs(a.x-state.position.x)+Math.abs(a.y-state.position.y);
    const db=Math.abs(b.x-state.position.x)+Math.abs(b.y-state.position.y);
    const pa=tilePriority(a), pb=tilePriority(b);
    if(pa!==pb) return pb-pa;
    return da-db;
  });
  return pool[0]||null;
}

function stepToward(target){
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
  state.raidLoot[type]+=gain; state.dog.carry+=gain; return gain;
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
  const current=state.equipment[category];
  if(item.score>current.score){
    state.equipment[category]={...item};
    log(`Gear drop! Equipped ${item.rarity} ${item.name} in ${category} slot.`);
    applyUpgrades();
  } else {
    addRaidLoot('metal',1);
    log(`Gear drop found (${item.name}), but current ${category} is better. Scrapped for metal.`);
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
  state.threat+=tile.type==='rare'?7:3;
  state.encounterText=`Looted ${tile.type}: ${found.join(' ')||'pack full'}.`;
  log(`${state.dog.name} looted ${tile.type}: ${found.join(' ')||'pack full'}.`);
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
    state.threat+=4; notes.push(`${e.name} calls more trouble. Threat rises.`);
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
  if(e.behavior==='hazards' && e.round%2===0){ state.dog.hp=Math.max(1,state.dog.hp-4); state.threat+=3; notes.push('Trolley Tyrant scatters scrap hazards.'); }
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

function resolveTile(tile){
  if(!tile || tile.cleared || tile.type==='base') return;
  if(['crate','tree','grove','food','water','scrap','medical','weapon','rare'].includes(tile.type)) lootTile(tile);
  else if(tile.type==='event') beginEventChoice(tile);
  else if(tile.type==='enemy') startCombat(pick(currentZone().enemies),false);
  else if(tile.type==='boss') startCombat(currentZone().boss,true);
  else { tile.cleared=true; state.encounterText='Quiet block. Nothing useful here.'; }

  weatherDrain();

  if(state.threat>=100 && state.mode!=='combat' && state.mode!=='choice'){ log('Threat hit 100%. Forced extraction!'); endRaid(Math.random()*100<extractChance()); return; }
  if(state.dog.carry>=state.dog.carryMax && state.mode!=='combat' && state.mode!=='choice'){
    const plan = currentPlan();
    if(plan.focus === 'boss' || plan.boss){
      state.encounterText = `${state.dog.name}'s pack is full, but Boss Hunt continues. New loot will be ignored or swapped.`;
      log(`${state.dog.name}'s pack is full, but keeps pushing for the boss.`);
    } else {
      log(`${state.dog.name}'s pack is full. Extracting.`);
      endRaid(true);
    }
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

function tickRaid(){
  state.seconds++;
  if(state.mode!=='choice') state.threat=clamp(state.threat+(state.modifier?.bossRush?1.2:.65)+(state.weather?.threat||0)/30,0,100);
  updateRoamingEnemies();
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
  state.weather=pick(WEATHER); state.modifier=pick(MODIFIERS);
  state.running=true; state.mode='roaming'; state.seconds=0;
  state.threat=clamp(8+(state.weather.threat||0)+(state.modifier.threat||0)+(currentPlan().threat||0),0,70);
  state.raidLoot=emptyRes(); state.combat=null; state.pendingChoice=null; state.activeEventTile=null;
  state.encounterText='Raid started.';
  computeRaidStats();
  state.dog.hp=state.dog.maxHp; state.dog.carry=0; state.dog.ammo=Math.min(state.dog.ammoMax,state.resources.ammo+Math.min(2,state.modifier?.ammoBonus||0));
  generateMap(); generateRoamingEnemies();
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
  if(bossClear) log(`${state.dog.name} returned victorious after defeating ${currentZone().boss.name}.`);
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
  $('dogSelect').innerHTML=Object.entries(DOGS).map(([id,dog])=>{
    const locked=false;
    return `<option value="${id}" ${id===state.dogId?'selected':''} ${locked?'disabled':''}>${dog.name} — ${dog.breed}</option>`;
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
  $('mapSummary').textContent=`${currentZone().description} · ${currentPlan().name} · Revealed ${state.revealedTiles}/${state.map.length} tiles`;
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
    $('enemySprite').src=currentZone().bossSprite; $('enemyName').textContent=state.running?'Scanning...':'No target'; $('enemyType').textContent=state.running?'Looking for trouble':'Wandering the zone';
    $('enemyHpText').textContent='--'; $('enemyHpBar').style.width='0%'; $('combatState').textContent=state.running?'Roaming':'Idle'; $('combatState').className='pill muted-pill';
  }
  $('encounterText').textContent=state.encounterText;
}

function tileImg(tile){ if(tile.cleared && tile.type!=='base') return TILE_ART.cleared; return TILE_ART[tile.type]||TILE_ART.empty; }
function mapEnemySprite(tile){ if(tile.type==='boss') return currentZone().boss.sprite; if(tile.type==='enemy'){ const list=currentZone().enemies; return list[(tile.x*7+tile.y*11)%list.length].sprite; } return null; }

function renderMap(){
  const pois=state.map.map(tile=>{
    const point=mapPoint(tile); const current=tile.x===state.position.x && tile.y===state.position.y && state.running;
    const classes=['poi',tile.type,current?'current':'',!tile.seen?'unseen':'',tile.cleared?'cleared':''].join(' ');
    const enemySprite=mapEnemySprite(tile);
    let hpWidth=tile.type==='boss'?100:72;
    if(current && state.combat?.enemy) hpWidth=clamp(state.combat.enemy.hp/state.combat.enemy.maxHp*100,0,100);
    const health=(!tile.cleared && tile.seen && ['enemy','boss'].includes(tile.type))?`<div class="map-hp"><span style="width:${hpWidth}%"></span></div>`:'';
    const img=enemySprite && tile.seen && !tile.cleared?`<img class="map-enemy-sprite" src="${enemySprite}" alt="${tile.type}">`:`<img class="tile-img" src="${tileImg(tile)}" alt="${tile.type}">`;
    return `<div class="${classes}" style="left:${point.left}%;top:${point.top}%">${tile.seen?img:''}${health}</div>`;
  }).join('');

  const roamers=state.running?state.roamEnemies.filter(e=>e.active).map(e=>{
    const inCombat=state.combat?.enemy?.sourceId===e.id;
    const hp=inCombat?state.combat.enemy.hp:e.hp, maxHp=inCombat?state.combat.enemy.maxHp:e.maxHp;
    const hpWidth=clamp(hp/maxHp*100,0,100);
    return `<div class="aggro-ring" style="left:${e.left}%;top:${e.top}%"></div><div class="map-roamer ${inCombat?'current':''}" style="left:${e.left}%;top:${e.top}%"><img src="${e.sprite}" alt="${e.name}"><div class="map-hp"><span style="width:${hpWidth}%"></span></div></div>`;
  }).join(''):'';

  const dogPoint=dogMapPosition();
  const dog=state.running?`<img class="map-dog" src="${state.dog.sprite}" alt="dog" style="left:${dogPoint.left}%;top:${dogPoint.top}%">`:'';
  $('map').innerHTML=pois+roamers+dog;
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

function render(){
  renderZoneOptions(); renderPlanOptions(); renderDogOptions(); renderLootFilter(); renderStats(); renderGear(); renderEquipment(); renderResources(); renderPackManager(); renderUpgrades(); renderResearch(); renderKennel(); renderChoice(); renderCombat(); renderMap();
  $('autoBtn').textContent=`Auto-Raid: ${state.autoRaid?'On':'Off'}`;
  $('autoBtn').disabled=!state.research.dogWhistle;
}

function toggleLootFilter(type){
  ensureLootFilter();
  state.lootFilter[type] = !state.lootFilter[type];
  save();
  render();
}

function save(){
  localStorage.setItem('barkRaidersSaveV8', JSON.stringify({
    resources:state.resources, upgrades:state.upgrades, unlockedZones:state.unlockedZones, zoneId:state.zoneId, planId:state.planId, dogId:state.dogId, lootFilter:state.lootFilter,
    research:state.research, dog:{level:state.dog.level,xp:state.dog.xp,xpNext:state.dog.xpNext}, autoRaid:state.autoRaid, equipment:state.equipment
  }));
}

function load(){
  try{
    const data=JSON.parse(localStorage.getItem('barkRaidersSaveV8') || localStorage.getItem('barkRaidersSaveV7') || 'null');
    if(!data) return;
    state.resources={...state.resources,...(data.resources||{})};
    state.upgrades={...state.upgrades,...(data.upgrades||{})};
    state.research={...state.research,...(data.research||{})};
    state.unlockedZones=clamp(data.unlockedZones||1,1,ZONES.length);
    state.zoneId=clamp(data.zoneId||0,0,state.unlockedZones-1);
    state.planId=data.planId||'balanced'; state.dogId=data.dogId||'shiba'; state.lootFilter={...state.lootFilter, ...(data.lootFilter||{})}; state.autoRaid=!!data.autoRaid;
    if(data.dog){ state.dog.level=data.dog.level||1; state.dog.xp=data.dog.xp||0; state.dog.xpNext=data.dog.xpNext||40; }
    if(data.equipment) state.equipment={...state.equipment,...data.equipment};
  } catch(e){ console.warn('Could not load save', e); }
}

function resetSave(){ if(confirm('Reset Bark Raiders v0.8 save data?')){ localStorage.removeItem('barkRaidersSaveV8'); localStorage.removeItem('barkRaidersSaveV7'); location.reload(); } }
function toggleAuto(){ if(!state.research.dogWhistle){ log('Research Dog Whistle first to unlock Auto-Raid.'); return; } state.autoRaid=!state.autoRaid; save(); render(); }

$('startBtn').addEventListener('click', startRaid);
$('returnBtn').addEventListener('click', manualExtract);
$('resetBtn').addEventListener('click', resetSave);
$('autoBtn').addEventListener('click', toggleAuto);
$('zoneSelect').addEventListener('change', e=>{ state.zoneId=Number(e.target.value); generateMap(); render(); });
$('planSelect').addEventListener('change', e=>{ state.planId=e.target.value; generateMap(); render(); });
$('dogSelect').addEventListener('change', e=>{ state.dogId=e.target.value; applyUpgrades(); updateGear(); render(); });

window.buyUpgrade=buyUpgrade;
window.buyResearch=buyResearch;
window.resolveChoice=resolveChoice;
window.dropLoot=dropLoot;
window.dropStack=dropStack;
window.toggleLootFilter=toggleLootFilter;

load();
applyUpgrades(); updateGear(); generateMap();
ensureLootFilter();
log('Welcome to Bark Raiders v0.8. Loot filters and pack management are now in.');
log('Tip: for boss attempts, use Boss Hunt and untick low-priority loot so the dog keeps pushing instead of filling the pack.');
render();
