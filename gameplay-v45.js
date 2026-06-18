(function(){
  const $=id=>document.getElementById(id);

  const CLASS_RULES={
    pistol:{burst:1,accuracy:2,damage:.96,label:'Reliable sidearm'},
    'machine pistol':{burst:2,accuracy:-5,damage:.78,label:'Fast sidearm'},
    smg:{burst:2,accuracy:-3,damage:.82,label:'Close spray'},
    shotgun:{burst:1,accuracy:-7,damage:1.08,closeBonus:1.12,label:'Close burst'},
    rifle:{burst:1,accuracy:0,damage:1,label:'Mid-long rifle'},
    'machine gun':{burst:3,accuracy:-8,damage:.74,label:'Sustained fire'},
  };

  const WEAPON_TUNING={
    servicePistol:{damage:13,penetration:8,recoil:22,magSize:17,fireRate:3.2,crit:3},
    heavyPistol:{damage:19,penetration:16,recoil:36,magSize:8,fireRate:2.1,crit:5},
    machinePistol:{damage:9,penetration:7,recoil:46,magSize:20,fireRate:9.5,crit:1},
    pumpShotgun:{damage:32,penetration:13,recoil:62,magSize:6,fireRate:1.1,crit:2},
    tacticalShotgun:{damage:27,penetration:16,recoil:52,magSize:8,fireRate:2.1,crit:3},
    compactSmg:{damage:11,penetration:10,recoil:39,magSize:30,fireRate:10.5,crit:2},
    compactPdw:{damage:10,penetration:14,recoil:32,magSize:50,fireRate:11.2,crit:2},
    umpSmg:{damage:15,penetration:17,recoil:43,magSize:25,fireRate:7.2,crit:3},
    carbine:{damage:18,penetration:22,recoil:33,magSize:30,fireRate:8.1,crit:3},
    assaultRifle:{damage:22,penetration:29,recoil:45,magSize:30,fireRate:6.4,crit:4},
    bullpupRifle:{damage:19,penetration:24,recoil:30,magSize:30,fireRate:7.5,crit:5},
    battleRifle:{damage:29,penetration:39,recoil:58,magSize:20,fireRate:4.2,crit:6},
    marksmanRifle:{damage:32,penetration:42,recoil:54,magSize:20,fireRate:3.6,crit:8},
    lightMachineGun:{damage:18,penetration:27,recoil:54,magSize:60,fireRate:8.5,crit:2},
  };

  const NAME_TO_KEY={
    'Bark-17 Service Pistol':'servicePistol',
    'Starter Bark-17 Service Pistol':'servicePistol',
    'Mutt-11 .45':'heavyPistol',
    'Yap-93 Machine Pistol':'machinePistol',
    'Retriever-870 Breacher':'pumpShotgun',
    'SPAWS-12 Scav Shotgun':'tacticalShotgun',
    'MPaw-5 Burrow SMG':'compactSmg',
    'Paw-90 Cache PDW':'compactPdw',
    'UMPaw-45 Yard SMG':'umpSmg',
    'Mutt-4 Patrol Carbine':'carbine',
    'AK-9 Bone Rattler':'assaultRifle',
    'AUGgie A3 Bullpup':'bullpupRifle',
    'SCARF-H Battle Rifle':'battleRifle',
    'Good-Boy M14 Marksman':'marksmanRifle',
    'M249 Pack Automatic':'lightMachineGun',
  };

  function clampLocal(value,min,max){return Math.max(min,Math.min(max,value));}
  function activeWeapon(){return window.gearV32?.activeWeapon?.() || state.equipment?.weapon || null;}
  function selectedZone(){
    if(!state.running&&$('zoneSelect')&&typeof ZONES!=='undefined'){
      const zone=ZONES[Number($('zoneSelect').value)];
      if(zone) return zone;
    }
    return currentZone?.();
  }
  function activeArmourPieces(){
    return ['armour','helmet'].map(slot=>window.gearV32?.equipped?.(slot)).filter(Boolean);
  }
  function condition(item){return window.gearV32?.condition?.(item) ?? 1;}
  function keyForWeapon(item){
    if(!item) return null;
    if(item.baseKey) return item.baseKey;
    const cleanName=String(item.name||'').replace(/^(Stable|High-Velocity|Extended|Reinforced|Lightweight|Field-Tested)\s+/,'');
    return NAME_TO_KEY[cleanName] || Object.entries(window.gearV32?.WEAPONS||{}).find(([,base])=>base.visual===item.visual&&base.weaponClass===item.weaponClass)?.[0] || null;
  }
  function applyTuning(item){
    const key=keyForWeapon(item);
    const tune=key&&WEAPON_TUNING[key];
    if(!tune) return item;
    Object.assign(item,tune,{baseKey:key});
    if(item.rarity&&item.rarity!=='Common'&&item.rarity!=='Unique'){
      const mult={Uncommon:1.08,Rare:1.18,Epic:1.32,Legendary:1.5}[item.rarity]||1;
      ['damage','penetration','crit'].forEach(stat=>{item[stat]=Math.max(1,Math.round(item[stat]*mult));});
    }
    item.score=Math.round((item.damage||0)+(item.armour||0)*2+(item.hp||0)*.4+(item.carry||0)*.25+(item.crit||0)+(item.penetration||0)*.2);
    return item;
  }
  function tuneDatabase(){
    const weapons=window.gearV32?.WEAPONS||{};
    Object.entries(WEAPON_TUNING).forEach(([key,tune])=>{if(weapons[key])Object.assign(weapons[key],tune,{baseKey:key});});
    (state.stash||[]).forEach(item=>{if(item.damage)applyTuning(item);});
    window.gearV32?.syncLegacy?.();
    window.balanceV44?.reconcileVisibleStats?.();
  }

  function weaponModel(weapon=activeWeapon()){
    if(!weapon) return null;
    const rules=CLASS_RULES[weapon.weaponClass]||CLASS_RULES.pistol;
    const accuracy=clampLocal(92-(weapon.recoil||25)*.52+(state.dog?.crit||0)*.22+(rules.accuracy||0),42,94);
    const perShot=(weapon.damage||10)*(rules.damage||1)*(rules.closeBonus||1)*condition(weapon);
    const expectedHits=(rules.burst||1)*(accuracy/100);
    return{weapon,rules,accuracy,burst:rules.burst||1,perShot,expectedHits};
  }
  function expectedRoundDamage(enemy,weapon=activeWeapon()){
    const model=weaponModel(weapon);
    if(!model||!enemy) return 1;
    const mitigation=Math.max(0,(enemy.def||0)*1.8-(weapon.penetration||0)*.13);
    return Math.max(1,Math.round((model.perShot*model.expectedHits)-mitigation));
  }
  function roundsToKill(enemy,weapon=activeWeapon()){
    return Math.max(1,Math.ceil((enemy?.hp||enemy?.maxHp||1)/expectedRoundDamage(enemy,weapon)));
  }
  function ammoToKill(enemy,weapon=activeWeapon()){
    const model=weaponModel(weapon);
    return roundsToKill(enemy,weapon)*(model?.burst||1);
  }
  function enemyDamageAfterArmour(enemy){
    const pieces=activeArmourPieces();
    if(!pieces.length) return Math.max(1,(enemy?.atk||1)-state.dog.defence);
    const expectedBlock=pieces.reduce((sum,piece)=>sum+((piece.armour||0)*condition(piece)*(piece.coverage||.5)),0);
    return Math.max(1,Math.round((enemy?.atk||1)-expectedBlock));
  }
  function zoneMatrix(zone=selectedZone(),weapon=activeWeapon()){
    if(!zone||!weapon) return null;
    const regular=zone.enemies.map(enemy=>({
      name:enemy.name,
      hp:enemy.hp,
      def:enemy.def,
      atk:enemy.atk,
      rounds:roundsToKill(enemy,weapon),
      ammo:ammoToKill(enemy,weapon),
      incoming:enemyDamageAfterArmour(enemy),
    }));
    const boss={...zone.boss,rounds:roundsToKill(zone.boss,weapon),ammo:ammoToKill(zone.boss,weapon),incoming:enemyDamageAfterArmour(zone.boss)};
    const avgRounds=regular.reduce((sum,row)=>sum+row.rounds,0)/Math.max(1,regular.length);
    const avgAmmo=regular.reduce((sum,row)=>sum+row.ammo,0)/Math.max(1,regular.length);
    return{zone:zone.name,regular,boss,avgRounds:+avgRounds.toFixed(1),avgAmmo:+avgAmmo.toFixed(1)};
  }
  function bossReadiness(matrix=zoneMatrix()){
    if(!matrix) return{label:'Unknown',tone:'warn'};
    const ammoRatio=matrix.boss.ammo/Math.max(1,state.dog.ammoMax||1);
    if(matrix.boss.rounds<=5&&ammoRatio<=.45) return{label:'Boss-ready',tone:'good'};
    if(matrix.boss.rounds<=8&&ammoRatio<=.7) return{label:'Possible, risky',tone:'warn'};
    return{label:'Under-gunned',tone:'bad'};
  }
  function bestZones(){
    const weapon=activeWeapon();
    if(!weapon||typeof ZONES==='undefined') return[];
    return ZONES.map(zone=>({zone:zone.name,id:zone.id,matrix:zoneMatrix(zone,weapon)}))
      .map(row=>({...row,readiness:bossReadiness(row.matrix)}));
  }
  function routeAdvice(matrix=zoneMatrix()){
    if(!matrix) return 'Pick a route to preview whether the current loadout is ready.';
    const ready=bossReadiness(matrix);
    if(ready.tone==='good') return `${matrix.zone} looks clean for this weapon. Push boss floors if supplies are healthy.`;
    if(ready.tone==='warn') return `${matrix.zone} is playable, but pack ammo and repair armour before boss floors.`;
    const safer=bestZones().find(row=>row.readiness.tone!=='bad');
    if(safer) return `${matrix.zone} is rough with this weapon. Safer prep target: ${safer.zone}.`;
    return `${matrix.zone} is under-gunned. Run scrap/weapon caches or buy a Modern Arms Crate before pushing bosses.`;
  }
  function allWeaponMatrix(){
    if(typeof ZONES==='undefined') return[];
    return Object.values(window.gearV32?.WEAPONS||{}).map(base=>{
      const weapon=applyTuning({...base,rarity:'Common'});
      const rows=ZONES.map(zone=>{
        const matrix=zoneMatrix(zone,weapon);
        return{zone:zone.name,regularRounds:matrix.avgRounds,bossRounds:matrix.boss.rounds,bossAmmo:matrix.boss.ammo};
      });
      return{name:weapon.name,class:weapon.weaponClass,power:window.balanceV44?.weaponPower?.(weapon)||0,rows};
    });
  }
  function statPill(label,value,tone=''){
    return`<span class="balance-pill ${tone}"><b>${value}</b>${label}</span>`;
  }
  function renderBalanceIntel(){
    const grid=$('equipmentGrid');
    if(!grid) return;
    let panel=$('balanceIntelV45');
    if(!panel){
      panel=document.createElement('section');
      panel.id='balanceIntelV45';
      panel.className='balance-intel-v45';
      grid.insertAdjacentElement('beforebegin',panel);
    }
    const weapon=activeWeapon();
    const matrix=zoneMatrix();
    if(!weapon||!matrix){panel.innerHTML='<strong>Loadout Intel</strong><p class="muted tiny">No active weapon data yet.</p>';return;}
    const model=weaponModel(weapon);
    const ready=bossReadiness(matrix);
    const best=bestZones().map(row=>`<span class="${row.readiness.tone}">${row.zone}: ${row.readiness.label}</span>`).join('');
    panel.innerHTML=`
      <div class="balance-intel-heading">
        <div><span class="slot-label">Loadout Intel</span><strong>${weapon.name}</strong></div>
        <span class="readiness-chip ${ready.tone}">${ready.label}</span>
      </div>
      <div class="balance-pill-row">
        ${statPill('power',window.balanceV44?.weaponPower?.(weapon)||0)}
        ${statPill('hit',`${Math.round(model.accuracy)}%`)}
        ${statPill('avg rounds',matrix.avgRounds)}
        ${statPill('avg ammo',matrix.avgAmmo)}
        ${statPill('boss rounds',matrix.boss.rounds,ready.tone)}
      </div>
      <p class="balance-copy">Against ${matrix.zone}: regular fights average ${matrix.avgRounds} rounds and the boss needs about ${matrix.boss.ammo} ammo. Expected incoming hits after armour: ${matrix.regular.map(row=>`${row.name} ${row.incoming}`).join(', ')}.</p>
      <p class="balance-advice">${routeAdvice(matrix)}</p>
      <div class="balance-zone-strip">${best}</div>
    `;
  }

  const previousItemStats=window.itemStatsV32;
  window.itemStatsV32=function(item){
    const base=previousItemStats?previousItemStats(item):'';
    if(!item?.damage) return base;
    const tuned=applyTuning({...item});
    const matrix=zoneMatrix(selectedZone(),tuned);
    const model=weaponModel(tuned);
    const extra=[
      `${window.balanceV44?.weaponPower?.(tuned)||0} POW`,
      `${Math.round(model?.accuracy||0)}% HIT`,
      matrix?`${matrix.avgRounds} AVG TTK`:'',
      matrix?`${matrix.boss.rounds} BOSS TTK`:'',
    ].filter(Boolean).map(value=>`<span class="v45-stat">${value}</span>`).join('');
    return `${base}${extra}`;
  };

  const baseRender=render;
  render=function(){
    tuneDatabase();
    baseRender();
    renderBalanceIntel();
  };

  ['zoneSelect','floorSelect','planSelect'].forEach(id=>{
    const el=$(id);
    if(el&&!el.dataset.balanceV45Listener){
      el.dataset.balanceV45Listener='true';
      el.addEventListener('change',()=>window.setTimeout(()=>{try{tuneDatabase();renderBalanceIntel();}catch{}},0));
    }
  });

  function audit(){
    tuneDatabase();
    const matrix=zoneMatrix();
    return{
      version:'v0.45',
      activeWeapon:activeWeapon()?.name||null,
      currentZone:matrix,
      readiness:bossReadiness(matrix),
      allWeapons:allWeaponMatrix(),
      panelPresent:!!$('balanceIntelV45'),
    };
  }

  window.balanceV45={audit,zoneMatrix,allWeaponMatrix,bossReadiness,expectedRoundDamage,roundsToKill,ammoToKill,tuneDatabase};
  try{tuneDatabase();render();}catch(err){console.warn('v0.45 balance intel failed',err);}
})();
