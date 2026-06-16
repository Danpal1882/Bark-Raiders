(function(){
  const RARITY={
    Common:{mult:1,color:'#b8c5c9'}, Uncommon:{mult:1.08,color:'#72d99b'},
    Rare:{mult:1.18,color:'#67b9ff'}, Epic:{mult:1.32,color:'#bd8cff'},
    Legendary:{mult:1.5,color:'#ffc85e'}, Unique:{mult:1.62,color:'#ff795e'},
  };
  const WEAPONS={
    servicePistol:{name:'Bark-17 Service Pistol',slot:'sidearm',weaponClass:'pistol',damage:13,range:5.8,recoil:22,magSize:17,fireRate:3.2,penetration:8,crit:3,ammoType:'9mm',visual:'pistol',inspiredBy:'G17'},
    heavyPistol:{name:'Mutt-11 .45',slot:'sidearm',weaponClass:'pistol',damage:18,range:5.2,recoil:34,magSize:8,fireRate:2.2,penetration:15,crit:5,ammoType:'.45',visual:'heavy-pistol',inspiredBy:'M1911'},
    machinePistol:{name:'Yap-93 Machine Pistol',slot:'sidearm',weaponClass:'machine pistol',damage:9,range:4.8,recoil:48,magSize:20,fireRate:9.5,penetration:6,crit:1,ammoType:'9mm',visual:'machine-pistol',inspiredBy:'93R'},
    pumpShotgun:{name:'Retriever-870 Breacher',slot:'primary',weaponClass:'shotgun',damage:30,range:3.5,recoil:62,magSize:6,fireRate:1.1,penetration:12,crit:2,ammoType:'12 gauge',visual:'pump-shotgun',inspiredBy:'870'},
    tacticalShotgun:{name:'SPAWS-12 Scav Shotgun',slot:'primary',weaponClass:'shotgun',damage:25,range:4,recoil:52,magSize:8,fireRate:2.1,penetration:14,crit:3,ammoType:'12 gauge',visual:'tactical-shotgun',inspiredBy:'SPAS-12'},
    compactSmg:{name:'MPaw-5 Burrow SMG',slot:'primary',weaponClass:'smg',damage:11,range:5.6,recoil:40,magSize:30,fireRate:10.5,penetration:9,crit:2,ammoType:'9mm',visual:'smg',inspiredBy:'MP5'},
    compactPdw:{name:'Paw-90 Cache PDW',slot:'primary',weaponClass:'smg',damage:10,range:6.2,recoil:33,magSize:50,fireRate:11.2,penetration:13,crit:2,ammoType:'5.7mm',visual:'smg',inspiredBy:'P90'},
    umpSmg:{name:'UMPaw-45 Yard SMG',slot:'primary',weaponClass:'smg',damage:15,range:5.4,recoil:45,magSize:25,fireRate:7.2,penetration:16,crit:3,ammoType:'.45',visual:'smg',inspiredBy:'UMP45'},
    carbine:{name:'Mutt-4 Patrol Carbine',slot:'primary',weaponClass:'rifle',damage:18,range:7.6,recoil:34,magSize:30,fireRate:8.1,penetration:21,crit:3,ammoType:'5.56',visual:'assault-rifle',inspiredBy:'M4'},
    assaultRifle:{name:'AK-9 Bone Rattler',slot:'primary',weaponClass:'rifle',damage:22,range:7.8,recoil:46,magSize:30,fireRate:6.4,penetration:28,crit:4,ammoType:'7.62',visual:'assault-rifle',inspiredBy:'AKM'},
    bullpupRifle:{name:'AUGgie A3 Bullpup',slot:'primary',weaponClass:'rifle',damage:19,range:8.6,recoil:31,magSize:30,fireRate:7.5,penetration:23,crit:5,ammoType:'5.56',visual:'assault-rifle',inspiredBy:'AUG A3'},
    battleRifle:{name:'SCARF-H Battle Rifle',slot:'primary',weaponClass:'rifle',damage:28,range:9,recoil:58,magSize:20,fireRate:4.2,penetration:38,crit:6,ammoType:'7.62',visual:'battle-rifle',inspiredBy:'SCAR-H'},
    marksmanRifle:{name:'Good-Boy M14 Marksman',slot:'primary',weaponClass:'rifle',damage:31,range:10.2,recoil:54,magSize:20,fireRate:3.6,penetration:40,crit:8,ammoType:'7.62',visual:'battle-rifle',inspiredBy:'M14'},
    lightMachineGun:{name:'M249 Pack Automatic',slot:'primary',weaponClass:'machine gun',damage:18,range:7.8,recoil:55,magSize:60,fireRate:8.5,penetration:26,crit:2,ammoType:'5.56 belt',visual:'lmg',inspiredBy:'M249'},
  };
  const ARMOUR={
    earcutHelmet:{name:'Ear-Cut Patrol Helmet',slot:'helmet',armour:3,durabilityMax:36,coverage:.28,hp:2,visual:'patrol-helmet'},
    riotHelmet:{name:'Riot Hound Helmet',slot:'helmet',armour:6,durabilityMax:55,coverage:.38,hp:4,visual:'riot-helmet'},
    softVest:{name:'Padded Field Vest',slot:'armour',armour:4,durabilityMax:48,coverage:.58,hp:6,carry:2,visual:'soft-vest'},
    plateCarrier:{name:'Canine Plate Carrier',slot:'armour',armour:8,durabilityMax:72,coverage:.72,hp:10,carry:-2,visual:'plate-carrier'},
    riotSuit:{name:'Kennel Riot Armour',slot:'armour',armour:12,durabilityMax:95,coverage:.84,hp:16,carry:-5,visual:'riot-suit'},
    scoutPack:{name:'Scout Day Pack',slot:'backpack',carry:10,slots:1,durabilityMax:45,visual:'scout-pack'},
    raidPack:{name:'Long-Raid Pack',slot:'backpack',carry:20,slots:2,durabilityMax:65,visual:'raid-pack'},
  };
  const CHARMS={
    luckyBone:{name:'Lucky Bone',slot:'charm',crit:2,rare:1,extract:0},
    compass:{name:'Brass Trail Compass',slot:'charm',crit:0,rare:1,extract:7},
    dogTags:{name:'Old Kennel Tags',slot:'charm',crit:4,rare:2,extract:2},
  };
  const BOSS_UNIQUES={
    'Rat King':{...WEAPONS.machinePistol,name:"Rat King's Rattler",rarity:'Unique',damage:12,recoil:35,magSize:28,visual:'rat-rattler'},
    'Crow Baron':{...WEAPONS.battleRifle,name:"Baron's Longbeak",rarity:'Unique',damage:33,range:10,crit:9,visual:'longbeak-rifle'},
    'Alley Butcher':{...WEAPONS.tacticalShotgun,name:"Butcher's Door-Kicker",rarity:'Unique',damage:34,penetration:24,visual:'butcher-shotgun'},
    'Gutter Maw':{...ARMOUR.riotHelmet,name:'Gutter Rebreather',rarity:'Unique',armour:8,durabilityMax:70,visual:'gutter-mask'},
    'Drain Queen':{...ARMOUR.plateCarrier,name:"Drain Queen's Carapace",rarity:'Unique',armour:11,durabilityMax:88,visual:'drain-carapace'},
    'Mouldback Raccoon':{...ARMOUR.raidPack,name:'Mouldback Salvage Rig',rarity:'Unique',carry:28,slots:3,visual:'salvage-rig'},
    'Alpha Hound':{...ARMOUR.riotSuit,name:"Alpha's Breach Armour",rarity:'Unique',armour:15,durabilityMax:120,visual:'alpha-armour'},
    'Geargrinder Raccoon':{...WEAPONS.lightMachineGun,name:'Geargrinder Rotary LMG',rarity:'Unique',magSize:80,recoil:47,visual:'geargrinder-lmg'},
    'Furnace Stray':{...WEAPONS.assaultRifle,name:'Furnace Heat Rifle',rarity:'Unique',damage:25,penetration:32,visual:'furnace-rifle'},
    'Trolley Tyrant':{...ARMOUR.riotSuit,name:'Trolley-Built Bulwark',rarity:'Unique',armour:17,durabilityMax:135,carry:-2,visual:'trolley-bulwark'},
    'Barnstorm Crow':{...WEAPONS.battleRifle,name:'Barnstorm Marksman Rifle',rarity:'Unique',range:11,crit:11,visual:'barnstorm-rifle'},
    'Old Yard Dog':{...ARMOUR.plateCarrier,name:"Old Yard Dog's Harness",rarity:'Unique',armour:13,durabilityMax:105,carry:4,visual:'yard-harness'},
  };
  const AFFIXES=[
    {name:'Stable',apply:item=>{if(item.recoil)item.recoil=Math.max(8,item.recoil-8);}},
    {name:'High-Velocity',apply:item=>{if(item.penetration)item.penetration+=6;if(item.range)item.range+=.5;}},
    {name:'Extended',apply:item=>{if(item.magSize)item.magSize=Math.round(item.magSize*1.25);}},
    {name:'Reinforced',apply:item=>{if(item.durabilityMax)item.durabilityMax=Math.round(item.durabilityMax*1.25);}},
    {name:'Lightweight',apply:item=>{item.carry=(item.carry||0)+3;if(item.recoil)item.recoil+=4;}},
    {name:'Field-Tested',apply:item=>{if(item.damage)item.damage+=3;if(item.armour)item.armour+=2;}},
  ];
  const SLOT_LABELS={primary:'Primary',sidearm:'Sidearm',helmet:'Helmet',armour:'Body Armour',backpack:'Backpack',charm:'Charm'};
  const ALL_BASES={...WEAPONS,...ARMOUR,...CHARMS};
  let sequence=0;

  const saved=(()=>{try{return JSON.parse(localStorage.getItem('barkRaidersSaveV9')||'{}');}catch{return {};}})();
  function uid(){return `gear-${Date.now().toString(36)}-${(++sequence).toString(36)}`;}
  function finish(item,rarity='Common'){
    const copy={...item,id:item.id||uid(),rarity:item.rarity||rarity};
    if(copy.durabilityMax) copy.durability=Math.min(copy.durability??copy.durabilityMax,copy.durabilityMax);
    copy.score=Math.round((copy.damage||0)+(copy.armour||0)*2+(copy.hp||0)*.4+(copy.carry||0)*.25+(copy.crit||0)+(copy.penetration||0)*.2);
    return copy;
  }
  function starter(){
    return [
      finish({...WEAPONS.servicePistol,name:'Starter Bark-17 Service Pistol'},'Common'),
      finish({...ARMOUR.softVest,name:'Scrap-Lined Field Vest'},'Common'),
      finish({...ARMOUR.earcutHelmet,name:'Open-Ear Scout Cap',armour:1,durabilityMax:24},'Common'),
      finish({...ARMOUR.scoutPack,name:'Small Backpack',carry:8},'Common'),
      finish({...CHARMS.luckyBone},'Common'),
    ];
  }
  const LEGACY_WEAPON_NAMES={
    'Starter Service Pistol':'Starter Bark-17 Service Pistol',
    'K9 Service Pistol':'Bark-17 Service Pistol',
    'Ironpaw .45':'Mutt-11 .45',
    'Yap-9 Machine Pistol':'Yap-93 Machine Pistol',
    'Kennel Breacher':'Retriever-870 Breacher',
    'SP-12 Scav Shotgun':'SPAWS-12 Scav Shotgun',
    'Burrow MP':'MPaw-5 Burrow SMG',
    'AR-K9 Patrol Rifle':'AK-9 Bone Rattler',
    'Old Guard Battle Rifle':'SCARF-H Battle Rifle',
    'Pack Support LMG':'M249 Pack Automatic',
  };
  state.stash=Array.isArray(saved.stash)&&saved.stash.length?saved.stash.map(item=>finish({...item,name:LEGACY_WEAPON_NAMES[item.name]||item.name},item.rarity)):starter();
  state.loadout=saved.loadout||{};
  function find(id){return state.stash.find(item=>item.id===id);}
  function firstSlot(slot){return state.stash.find(item=>item.slot===slot);}
  ['sidearm','armour','helmet','backpack','charm'].forEach(slot=>{if(!find(state.loadout[slot]))state.loadout[slot]=firstSlot(slot)?.id||null;});
  if(state.loadout.primary&&!find(state.loadout.primary))state.loadout.primary=null;
  state.activeWeaponSlot=saved.activeWeaponSlot==='sidearm'?'sidearm':(state.loadout.primary?'primary':'sidearm');
  state.weaponRuntime=saved.weaponRuntime||{loaded:0};
  state.customisation=saved.customisation||{marking:'classic',eyes:'brown',ears:'natural',scarf:'none',harness:'#27777c'};

  function equipped(slot){return find(state.loadout[slot]);}
  function activeWeapon(){return equipped(state.activeWeaponSlot)||equipped('primary')||equipped('sidearm');}
  function condition(item){return item?.durabilityMax?Math.max(.15,(item.durability||0)/item.durabilityMax):1;}
  function syncLegacy(){
    const weapon=activeWeapon()||finish(WEAPONS.servicePistol);
    const body=equipped('armour')||{},helmet=equipped('helmet')||{},pack=equipped('backpack')||{},charm=equipped('charm')||{};
    state.equipment.weapon={...weapon,attack:Math.round((weapon.damage||10)*.38*condition(weapon)),ammo:Math.max(0,Math.round((weapon.magSize||10)/10)-1)};
    state.equipment.armour={name:[body.name,helmet.name].filter(Boolean).join(' + ')||'No armour',rarity:body.rarity||helmet.rarity||'Common',hp:(body.hp||0)+(helmet.hp||0),defence:Math.round(((body.armour||0)*condition(body)+(helmet.armour||0)*condition(helmet))*.55),carry:(body.carry||0)+(pack.carry||0),score:(body.score||0)+(helmet.score||0)+(pack.score||0)};
    state.equipment.charm={...charm,name:charm.name||'No charm'};
  }
  syncLegacy();

  function rollRarity(source='enemy'){
    const bonus=(state.dog.rareBonus||0)+(source==='boss'?30:source==='rare'?14:source==='weapon'?8:0);
    const roll=Math.random()*100-bonus*.35;
    return roll<2?'Legendary':roll<8?'Epic':roll<22?'Rare':roll<48?'Uncommon':'Common';
  }
  function generateItem(source='enemy',forcedSlot=null){
    const rarity=rollRarity(source);
    const allowed=Object.values(ALL_BASES).filter(item=>!forcedSlot||item.slot===forcedSlot);
    const base={...pick(allowed)};
    const mult=RARITY[rarity].mult;
    ['damage','penetration','armour','hp','carry','crit','extract','rare'].forEach(key=>{if(base[key])base[key]=Math.max(1,Math.round(base[key]*mult));});
    if(base.durabilityMax)base.durabilityMax=Math.round(base.durabilityMax*mult);
    const affix=rarity==='Common'?null:pick(AFFIXES);if(affix){affix.apply(base);base.name=`${affix.name} ${base.name}`;base.affix=affix.name;}
    return finish(base,rarity);
  }
  function addItem(item,autoEquip=true){
    item=finish(item,item.rarity);state.stash.push(item);
    const current=equipped(item.slot);
    if(autoEquip&&(!current||item.score>current.score)){state.loadout[item.slot]=item.id;if(['primary','sidearm'].includes(item.slot))state.activeWeaponSlot=item.slot;syncLegacy();applyUpgrades();log(`Equipped ${item.rarity} ${item.name}.`);}
    else log(`Recovered ${item.rarity} ${item.name} to the stash.`);
    return item;
  }

  const baseApply=applyUpgrades;
  applyUpgrades=function(){
    syncLegacy();baseApply();
    const pack=equipped('backpack');
    state.dog.inventorySlots+=pack?.slots||0;
  };

  maybeDropGear=function(source='enemy'){
    const chance=(source==='boss'?100:source==='rare'?38:source==='weapon'?28:9)+(state.dog.rareBonus||0);
    if(Math.random()*100>chance)return null;
    return addItem(generateItem(source),true);
  };

  window.equipV32=function(id){
    if(state.running)return;const item=find(id);if(!item)return;
    state.loadout[item.slot]=item.id;if(['primary','sidearm'].includes(item.slot))state.activeWeaponSlot=item.slot;
    syncLegacy();applyUpgrades();save();render();
  };
  window.switchWeaponV32=function(slot){
    if(!equipped(slot))return;state.activeWeaponSlot=slot;state.weaponRuntime.loaded=0;syncLegacy();applyUpgrades();save();render();
  };
  window.repairV32=function(id){
    if(state.running)return;const item=find(id);if(!item?.durabilityMax)return;
    const missing=item.durabilityMax-(item.durability||0);const cost={metal:Math.max(1,Math.ceil(missing/12)),fabric:Math.max(0,Math.ceil(missing/24))};
    if(!canPay(cost)){log(`Not enough materials to repair ${item.name}.`);return;}
    pay(cost);item.durability=item.durabilityMax;syncLegacy();applyUpgrades();log(`${item.name} repaired.`);save();render();
  };
  window.salvageV32=function(id){
    if(state.running||Object.values(state.loadout).includes(id))return;
    const index=state.stash.findIndex(item=>item.id===id);if(index<0)return;
    const [item]=state.stash.splice(index,1);state.resources.metal+=(item.rarity==='Epic'||item.rarity==='Legendary'?4:2);if(item.damage)state.resources.gunParts+=1;log(`Salvaged ${item.name}.`);save();render();
  };

  function protection(){
    const body=equipped('armour'),helmet=equipped('helmet');
    return [body,helmet].filter(Boolean);
  }
  function absorbDamage(raw,penetration=0){
    const pieces=protection();
    const covered=pieces.filter(item=>Math.random()<(item.coverage||.5));
    const piece=covered.length?covered.sort((a,b)=>(b.coverage||0)-(a.coverage||0))[0]:null;
    if(!piece)return{damage:raw,blocked:0,piece:null};
    const effective=Math.max(0,(piece.armour||0)*condition(piece)-penetration*.18);
    const blocked=Math.min(raw-1,Math.max(0,Math.round(effective)));
    const damage=Math.max(1,raw-blocked);
    const wear=Math.max(1,Math.ceil(raw*.45+penetration*.08));piece.durability=Math.max(0,(piece.durability||0)-wear);
    syncLegacy();return{damage,blocked,piece};
  }
  function fireWeapon(enemy){
    const weapon=activeWeapon();if(!weapon)return{damage:1,shots:1,hit:true,crit:false,weapon:null};
    if(!state.weaponRuntime.loaded||state.weaponRuntime.weaponId!==weapon.id){state.weaponRuntime={weaponId:weapon.id,loaded:weapon.magSize||1};}
    if(state.weaponRuntime.loaded<=0){state.weaponRuntime.loaded=weapon.magSize||1;return{reload:true,weapon};}
    const burst=weapon.weaponClass==='machine gun'?3:weapon.weaponClass==='smg'||weapon.weaponClass==='machine pistol'?2:1;
    const shots=Math.min(burst,state.weaponRuntime.loaded,state.dog.ammo);
    if(shots<=0)return{dry:true,weapon};
    state.weaponRuntime.loaded-=shots;state.dog.ammo-=shots;
    const accuracy=Math.max(48,94-(weapon.recoil||20)*.55+state.dog.crit*.25);
    let hits=0,total=0,crit=false;
    for(let i=0;i<shots;i++){if(Math.random()*100<=accuracy){hits++;const c=Math.random()*100<state.dog.crit+(weapon.crit||0);crit||=c;total+=Math.round((weapon.damage||10)*condition(weapon)*(c?1.5:1));}}
    if(weapon.durabilityMax)weapon.durability=Math.max(0,(weapon.durability||weapon.durabilityMax)-Math.max(1,Math.ceil(shots*.3)));
    const mitigation=Math.max(0,(enemy.def||0)*2-(weapon.penetration||0)*.15);
    return{damage:hits?Math.max(1,Math.round(total-mitigation)):0,shots,hits,hit:hits>0,crit,weapon};
  }
  function bossUnique(name){
    const unique=BOSS_UNIQUES[name];if(!unique)return null;
    if(state.stash.some(item=>item.name===unique.name))return null;
    return addItem(finish(unique,'Unique'),false);
  }

  const baseWinCombat=winCombat;
  winCombat=function(enemy){
    const boss=enemy.bossFight;const name=enemy.name;baseWinCombat(enemy);
    if(boss){const drop=bossUnique(name);if(drop){log(`BOSS UNIQUE: ${drop.name} recovered.`);save();render();}}
  };

  const baseHub=hubTraderOffers;
  hubTraderOffers=function(){return[...baseHub(),{label:'Field Repairs',desc:'Repairs all equipped armour and weapons.',cost:{metal:8,fabric:5,gunParts:2},effect:()=>{Object.values(state.loadout).map(find).filter(Boolean).forEach(item=>{if(item.durabilityMax)item.durability=item.durabilityMax;});syncLegacy();}},{label:'Modern Arms Crate',desc:'Generates a random primary or sidearm.',cost:{metal:18,gunParts:8,ammo:8},effect:()=>addItem(generateItem('rare',Math.random()<.7?'primary':'sidearm'),false)}];};

  renderEquipment=function(){
    $('equipmentGrid').innerHTML=Object.entries(SLOT_LABELS).map(([slot,label])=>{
      const item=equipped(slot),active=['primary','sidearm'].includes(slot)&&state.activeWeaponSlot===slot;
      return `<article class="equipped-card ${active?'active-weapon':''}">
        <span class="gear-icon">${slot==='helmet'?'⛑️':slot==='armour'?'🦺':slot==='backpack'?'🎒':slot==='charm'?'🦴':'🔫'}</span>
        <div class="equipped-copy"><span class="slot-label">${label}</span><strong>${item?.name||'Empty'}</strong>
        <div class="gear-stats">${item?itemStatsV32(item):'<span>No item equipped</span>'}</div></div>
        ${item?.rarity?`<span class="rarity-pill" style="border-color:${RARITY[item.rarity]?.color||'#aaa'}">${item.rarity}</span>`:''}
        ${item&&['primary','sidearm'].includes(slot)&&!active?`<button class="ghost" onclick="switchWeaponV32('${slot}')">Use</button>`:''}
      </article>`;
    }).join('');
  };
  window.itemStatsV32=function(item){
    const stats=[];
    if(item.damage)stats.push(`${item.damage} DMG`,`${item.range} RNG`,`${item.recoil} REC`,`${item.magSize} MAG`,`${item.fireRate}/s`,`${item.penetration} PEN`);
    if(item.armour)stats.push(`${item.armour} ARM`,`${Math.round((item.coverage||0)*100)}% COV`);
    if(item.carry)stats.push(`${item.carry>0?'+':''}${item.carry} CARRY`);
    if(item.durabilityMax)stats.push(`${item.durability}/${item.durabilityMax} DUR`);
    return stats.map(value=>`<span>${value}</span>`).join('');
  };
  renderEquipmentInventory=function(){
    $('inventoryGrid').innerHTML=Object.keys(SLOT_LABELS).map(slot=>{
      const items=state.stash.filter(item=>item.slot===slot);
      return `<section class="inventory-group"><div class="inventory-group-title"><strong>${SLOT_LABELS[slot]}</strong><small>${items.length} owned</small></div><div class="inventory-list">${items.map(item=>{
        const worn=state.loadout[slot]===item.id;
        return `<article class="inventory-item ${worn?'equipped':''}"><div><strong>${item.name}</strong><span>${item.rarity} · score ${item.score}</span><div class="gear-stats">${itemStatsV32(item)}</div></div><div class="item-actions"><button ${worn||state.running?'disabled':''} onclick="equipV32('${item.id}')">${worn?'Equipped':'Equip'}</button>${item.durabilityMax&&item.durability<item.durabilityMax?`<button class="ghost" onclick="repairV32('${item.id}')">Repair</button>`:''}<button class="ghost" ${worn?'disabled':''} onclick="salvageV32('${item.id}')">Salvage</button></div></article>`;
      }).join('')}</div></section>`;
    }).join('');
  };

  const baseSave=save;
  save=function(){syncLegacy();baseSave();const data=savedV32();data.stash=state.stash;data.loadout=state.loadout;data.activeWeaponSlot=state.activeWeaponSlot;data.weaponRuntime=state.weaponRuntime;data.customisation=state.customisation;localStorage.setItem('barkRaidersSaveV9',JSON.stringify(data));};
  function savedV32(){try{return JSON.parse(localStorage.getItem('barkRaidersSaveV9')||'{}');}catch{return {};}}

  window.gearV32={WEAPONS,ARMOUR,BOSS_UNIQUES,activeWeapon,equipped,condition,absorbDamage,fireWeapon,generateItem,addItem,syncLegacy};
  applyUpgrades();updateGear();render();
})();
