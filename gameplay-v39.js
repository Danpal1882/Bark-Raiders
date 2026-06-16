(function(){
  const $=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const slotOrder=['primary','sidearm','helmet','armour','backpack','charm'];

  const BOSS_IDENTITY={
    'Rat King':{
      title:'Swarm monarch of the broken underground',
      prep:'Bring a high-capacity weapon. Swarm pressure spikes every third round.',
      tell:'The room starts squeaking before the crown appears.',
      tactic:'Clear the adds fast and keep ammunition topped up.',
      weakness:'SMGs and machine pistols',
      reward:'Rat King\'s Rattler',
    },
    'Crow Baron':{
      title:'Skyline fence with a stolen rifle collection',
      prep:'Protect your pack. The Baron steals loot during long fights.',
      tell:'Shiny scraps vanish from the floor as feathers drift down.',
      tactic:'Use accurate rifles or sidearms before he drains the haul.',
      weakness:'Accurate rifles',
      reward:'Baron\'s Longbeak',
    },
    'Alley Butcher':{
      title:'Close-range brute of the city backstreets',
      prep:'Armour condition matters. Bleeds punish slow fights.',
      tell:'Blade marks scrape across the concrete.',
      tactic:'Burst him down with shotguns or high damage rifles.',
      weakness:'Shotguns and armour',
      reward:'Butcher\'s Door-Kicker',
    },
    'Gutter Maw':{
      title:'Toxic sewer ambusher',
      prep:'Pack medicine and expect poison pressure.',
      tell:'Green bubbles crawl across the water before it attacks.',
      tactic:'Short fights are safest; retreat if HP drops early.',
      weakness:'High damage primaries',
      reward:'Gutter Rebreather',
    },
    'Drain Queen':{
      title:'Brood queen beneath the old tunnels',
      prep:'Sustained fire beats the summons.',
      tell:'The drain lids rattle in a perfect circle.',
      tactic:'Use weapons with enough magazine size to handle adds.',
      weakness:'LMGs and SMGs',
      reward:'Drain Queen\'s Carapace',
    },
    'Mouldback Raccoon':{
      title:'Scrap hoarder with a very grabby backpack',
      prep:'Expect metal and gun parts to get stolen if the fight drags.',
      tell:'Mouldy cloth and stolen buckles hang from the walls.',
      tactic:'High penetration helps punch through the salvage rig.',
      weakness:'Penetrating rifles',
      reward:'Mouldback Salvage Rig',
    },
    'Alpha Hound':{
      title:'Factory champion in heavy plates',
      prep:'Do not bring weak weapons. Armour checks hit hard.',
      tell:'Every footstep sounds like a kennel gate slamming.',
      tactic:'Use high penetration rifles or a repaired shotgun.',
      weakness:'Penetration',
      reward:'Alpha\'s Breach Armour',
    },
    'Geargrinder Raccoon':{
      title:'Workshop saboteur who turns rooms into traps',
      prep:'Hazards raise threat and chip HP.',
      tell:'Loose gears spin before the first shot.',
      tactic:'End the fight quickly and repair armour afterwards.',
      weakness:'Stable automatic fire',
      reward:'Geargrinder Rotary LMG',
    },
    'Furnace Stray':{
      title:'Heat-scarred rifle dog of the furnace floor',
      prep:'Burns ignore comfort. Bring medicine and solid armour.',
      tell:'The air shimmers orange before the door opens.',
      tactic:'Fight at range with penetration and keep HP above danger.',
      weakness:'Battle rifles',
      reward:'Furnace Heat Rifle',
    },
    'Trolley Tyrant':{
      title:'Farmland scrap-tank on wheels',
      prep:'Long fight, heavy armour, hazard pressure.',
      tell:'A bent trolley squeals across the barn floor.',
      tactic:'Use your best repaired weapon and expect a bruising clear.',
      weakness:'High penetration uniques',
      reward:'Trolley-Built Bulwark',
    },
    'Barnstorm Crow':{
      title:'Field sniper with a taste for stolen supplies',
      prep:'Loot theft and range pressure make slow weapons risky.',
      tell:'Straw moves against the wind.',
      tactic:'Bring accuracy, crit, and a backup sidearm.',
      weakness:'Accurate rifles',
      reward:'Barnstorm Marksman Rifle',
    },
    'Old Yard Dog':{
      title:'Relentless farm guardian',
      prep:'Threat rises quickly, so plan your extraction.',
      tell:'A chain drags behind the next wall.',
      tactic:'Keep moving, keep firing, and avoid arriving exhausted.',
      weakness:'Reliable mid-range weapons',
      reward:'Old Yard Dog\'s Harness',
    },
  };

  function bossIntel(name){
    return BOSS_IDENTITY[name] || {
      title:'Unknown boss threat',
      prep:'Bring repaired armour, spare medicine, and enough ammo.',
      tell:'Something important waits on this floor.',
      tactic:'Watch the combat log and extract early if the run turns bad.',
      weakness:'Balanced loadout',
      reward:window.gearV32?.BOSS_UNIQUES?.[name]?.name || 'Unknown unique',
    };
  }
  function activeWeapon(){
    return window.gearV32?.activeWeapon?.() || state?.equipment?.weapon || null;
  }
  function equipped(slot){
    return window.gearV32?.equipped?.(slot) || state?.equipment?.[slot] || null;
  }
  function itemCondition(item){
    if(!item?.durabilityMax)return 1;
    return Math.max(0,(item.durability||0)/item.durabilityMax);
  }
  function conditionLabel(item){
    if(!item?.durabilityMax)return 'No durability';
    const pct=Math.round(itemCondition(item)*100);
    return pct>=85?'Excellent':pct>=55?'Serviceable':pct>=30?'Worn':'Critical';
  }
  function gearLine(item){
    if(!item)return 'Empty slot';
    const parts=[item.rarity,item.weaponClass||item.slot,`score ${item.score||0}`];
    if(item.damage)parts.push(`${item.damage} dmg`,`${item.penetration||0} pen`,`${item.magSize||0} mag`);
    if(item.armour)parts.push(`${item.armour} armour`,`${Math.round((item.coverage||0)*100)}% cover`);
    if(item.durabilityMax)parts.push(`${item.durability||0}/${item.durabilityMax} durability`);
    return parts.filter(Boolean).join(' - ');
  }
  function allEquipped(){
    return slotOrder.map(slot=>equipped(slot)).filter(Boolean);
  }
  function repairCost(items){
    return items.reduce((cost,item)=>{
      if(!item?.durabilityMax)return cost;
      const missing=Math.max(0,item.durabilityMax-(item.durability||0));
      cost.metal+=Math.ceil(missing/12);
      cost.fabric+=Math.ceil(missing/28);
      if(item.damage)cost.gunParts+=Math.ceil(missing/48);
      return cost;
    },{metal:0,fabric:0,gunParts:0});
  }
  function cleanCost(cost){
    return Object.fromEntries(Object.entries(cost).filter(([,v])=>v>0));
  }
  function costTextSafe(cost){
    try{return costText(cost);}catch{return Object.entries(cost).map(([k,v])=>`${k} ${v}`).join(', ');}
  }
  function canRepairAny(){
    return allEquipped().some(item=>item.durabilityMax && (item.durability||0)<item.durabilityMax);
  }

  window.repairEquippedV39=function(){
    if(state.running)return;
    const worn=allEquipped().filter(item=>item.durabilityMax && (item.durability||0)<item.durabilityMax);
    if(!worn.length){log('All equipped gear is already repaired.');return;}
    const cost=cleanCost(repairCost(worn));
    if(!canPay(cost)){log(`Not enough resources for field maintenance: ${costTextSafe(cost)}.`);return;}
    pay(cost);
    worn.forEach(item=>{item.durability=item.durabilityMax;});
    window.gearV32?.syncLegacy?.();
    applyUpgrades();
    log(`Field maintenance complete: ${worn.length} equipped item${worn.length===1?'':'s'} repaired.`);
    save();render();
  };

  window.compareGearV39=function(id){
    const item=state.stash?.find(entry=>entry.id===id);
    if(!item)return '';
    const current=equipped(item.slot);
    if(!current || current.id===item.id)return 'Currently best equipped slot item.';
    const delta=(item.score||0)-(current.score||0);
    const sign=delta>0?'+':'';
    return `${sign}${delta} score vs equipped ${current.name}`;
  };

  const baseMaybeDrop=maybeDropGear;
  maybeDropGear=function(source='enemy'){
    const before=new Set((state.stash||[]).map(item=>item.id));
    const drop=baseMaybeDrop(source);
    const found=(state.stash||[]).filter(item=>!before.has(item.id));
    if(found.length){
      state.v39=state.v39||{};
      state.v39.raidGearFinds=state.v39.raidGearFinds||[];
      found.forEach(item=>state.v39.raidGearFinds.push({
        name:item.name,
        rarity:item.rarity,
        slot:item.slot,
        score:item.score||0,
        source,
      }));
      state.v39.raidGearFinds=state.v39.raidGearFinds.slice(-8);
    }
    return drop;
  };

  const baseStartCombat=startCombat;
  startCombat=function(enemy,bossFight=false,sourceId=null){
    if(bossFight&&enemy){
      const intel=bossIntel(enemy.name);
      enemy.v39Intel=intel;
      state.v39=state.v39||{};
      state.v39.activeBossIntel={name:enemy.name,...intel};
      pushDialogue(`Intel: ${enemy.name} - ${intel.tactic}`);
    }
    return baseStartCombat(enemy,bossFight,sourceId);
  };

  const baseBossMechanic=bossMechanic;
  bossMechanic=function(e,notes){
    baseBossMechanic(e,notes);
    if(!e?.bossFight || !notes)return;
    const intel=bossIntel(e.name);
    if(e.round===1)notes.push(`Intel read: ${intel.prep}`);
    if(e.round>1 && e.round%4===0)notes.push(`Counterplay: ${intel.weakness}.`);
  };

  const baseWinCombat=winCombat;
  winCombat=function(enemy){
    const wasBoss=!!enemy?.bossFight;
    const name=enemy?.name;
    const beforeNames=new Set((state.stash||[]).map(item=>item.name));
    if(wasBoss&&name){
      const intel=bossIntel(name);
      const uniqueDef=window.gearV32?.BOSS_UNIQUES?.[name]||null;
      const alreadyOwned=uniqueDef ? (state.stash||[]).some(item=>item.name===uniqueDef.name) : false;
      const unique=uniqueDef&&!alreadyOwned&&window.gearV32?.addItem ? window.gearV32.addItem(uniqueDef,false) : null;
      state.v39=state.v39||{};
      state.v39.pendingBossClear={name,title:intel.title,reward:intel.reward,unique:unique?{name:unique.name,slot:unique.slot,score:unique.score||0}:null,alreadyOwned};
    }
    baseWinCombat(enemy);
    if(wasBoss&&name){
      const unique=(state.stash||[]).find(item=>!beforeNames.has(item.name) && item.rarity==='Unique') || null;
      const intel=bossIntel(name);
      state.v39=state.v39||{};
      state.v39.lastBossClear={name,title:intel.title,reward:intel.reward,unique:unique?{name:unique.name,slot:unique.slot,score:unique.score||0}:null};
    }
  };

  const baseMake=makeRaidHistoryEntry;
  makeRaidHistoryEntry=function(success,bossClear=false,floorClear=false,lootBeforeBank={},newInjuries=[]){
    const gearFinds=[...(state.v39?.raidGearFinds||[])];
    const bossClearData=state.v39?.pendingBossClear||state.v39?.lastBossClear||null;
    baseMake(success,bossClear,floorClear,lootBeforeBank,newInjuries);
    const r=state.lastRaidSummary;
    if(r){
      r.gearFinds=gearFinds;
      r.gearFoundText=gearFinds.length?gearFinds.map(item=>`${item.rarity} ${item.name}`).join(', '):'No gear recovered';
      if(bossClearData){
        r.bossName=bossClearData.name;
        r.bossTitle=bossClearData.title;
        r.bossRewardText=bossClearData.unique?`${bossClearData.unique.name} recovered`:`${bossClearData.reward} already owned or not recovered`;
      }
    }
    if(state.v39){
      state.v39.raidGearFinds=[];
      state.v39.lastBossClear=null;
      state.v39.pendingBossClear=null;
    }
  };

  const baseShow=showRaidSummary;
  showRaidSummary=function(){
    baseShow();
    const r=state.lastRaidSummary;
    const root=$('raidSummary')?.querySelector('.raid-debrief-v38');
    if(!r||!root)return;
    const grid=root.querySelector('.debrief-grid-v38');
    if(grid&&!grid.querySelector('.debrief-gear-v39')){
      grid.insertAdjacentHTML('beforeend',`<article class="debrief-gear-v39"><strong>Gear Found</strong><span>${esc(r.gearFoundText||'No gear recovered')}</span></article>`);
    }
    if(r.bossName&&!root.querySelector('.boss-clear-v39')){
      root.insertAdjacentHTML('beforeend',`<div class="boss-clear-v39"><strong>${esc(r.bossName)} cleared</strong><span>${esc(r.bossTitle||'Boss defeated')}</span><span>${esc(r.bossRewardText||'Unique reward checked')}</span></div>`);
    }
  };

  const baseHistory=renderRaidHistory;
  renderRaidHistory=function(){
    baseHistory();
    const rows=$('raidHistory')?.querySelectorAll('.history-row');
    if(!rows)return;
    (state.raidHistory||[]).slice(0,12).forEach((r,i)=>{
      if(!rows[i]||rows[i].querySelector('.history-gear-v39'))return;
      if(r.gearFinds?.length||r.bossRewardText){
        rows[i].insertAdjacentHTML('beforeend',`<span class="history-gear-v39">${esc(r.bossRewardText||r.gearFoundText||'Gear recovered')}</span>`);
      }
    });
  };

  const baseRenderEquipment=renderEquipment;
  renderEquipment=function(){
    baseRenderEquipment();
    const grid=$('equipmentGrid');
    if(!grid)return;
    const equippedItems=allEquipped();
    const durable=equippedItems.filter(item=>item.durabilityMax);
    const avg=durable.length?Math.round(durable.reduce((sum,item)=>sum+itemCondition(item),0)/durable.length*100):100;
    const weapon=activeWeapon();
    const cost=cleanCost(repairCost(durable.filter(item=>(item.durability||0)<item.durabilityMax)));
    grid.insertAdjacentHTML('afterbegin',`<article class="gear-maintenance-v39">
      <div>
        <span class="eyebrow-v39">Field Maintenance</span>
        <strong>${avg}% average condition</strong>
        <span>Active: ${esc(weapon?.name||'No weapon')} - ${esc(gearLine(weapon))}</span>
        <span>Repair cost: ${Object.keys(cost).length?esc(costTextSafe(cost)):'No repairs needed'}</span>
      </div>
      <button class="ghost" ${canRepairAny()&&!state.running?'':'disabled'} onclick="repairEquippedV39()">Repair Equipped</button>
    </article>`);
    grid.querySelectorAll('.equipped-card').forEach(card=>{
      const slot=card.querySelector('.slot-label')?.textContent?.toLowerCase()||'';
      const item=slot.includes('primary')?equipped('primary'):slot.includes('sidearm')?equipped('sidearm'):slot.includes('helmet')?equipped('helmet'):slot.includes('body')?equipped('armour'):slot.includes('backpack')?equipped('backpack'):slot.includes('charm')?equipped('charm'):null;
      if(item?.durabilityMax&&!card.querySelector('.condition-strip-v39')){
        card.insertAdjacentHTML('beforeend',`<div class="condition-strip-v39"><span style="width:${Math.round(itemCondition(item)*100)}%"></span></div><small class="condition-label-v39">${conditionLabel(item)}</small>`);
      }
    });
  };

  const baseInventory=renderEquipmentInventory;
  renderEquipmentInventory=function(){
    baseInventory();
    $('inventoryGrid')?.querySelectorAll('.inventory-item').forEach(card=>{
      const button=card.querySelector('button[onclick^="equipV32"]');
      const id=button?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
      if(id&&!card.querySelector('.compare-v39')){
        card.querySelector('div')?.insertAdjacentHTML('beforeend',`<small class="compare-v39">${esc(window.compareGearV39(id))}</small>`);
      }
    });
  };

  const baseBossIntel=renderBossIntel;
  renderBossIntel=function(){
    baseBossIntel();
    const panel=$('bossIntel');
    if(!panel)return;
    panel.querySelectorAll('.intel-card').forEach(card=>{
      const strong=card.querySelector('strong');
      const name=strong?.textContent?.replace(/[^\w\s'-]/g,'').trim();
      if(!name||!BOSS_IDENTITY[name]||card.querySelector('.boss-sweep-v39'))return;
      const intel=bossIntel(name);
      card.insertAdjacentHTML('beforeend',`<span class="boss-sweep-v39">Prep: ${esc(intel.prep)}</span><span>Unique: ${esc(intel.reward)}</span>`);
    });
  };

  const baseBounty=typeof renderBountyBoard==='function'?renderBountyBoard:null;
  if(baseBounty){
    renderBountyBoard=function(){
      baseBounty();
      const panel=$('bountyBoard');
      if(!panel)return;
      panel.querySelectorAll('.intel-card').forEach(card=>{
        const strong=card.querySelector('strong');
        const name=strong?.textContent?.replace(/[^\w\s'-]/g,'').trim();
        if(!name||!BOSS_IDENTITY[name]||card.querySelector('.boss-sweep-v39'))return;
        const intel=bossIntel(name);
        card.insertAdjacentHTML('beforeend',`<span class="boss-sweep-v39">Weakness: ${esc(intel.weakness)}</span><span>Unique: ${esc(intel.reward)}</span>`);
      });
    };
  }

  function allBosses(){
    return Object.values(BOSS_POOLS||{}).flat().map(b=>b.name);
  }
  function bossSweepAudit(){
    const bosses=allBosses();
    const uniques=window.gearV32?.BOSS_UNIQUES||{};
    return {
      version:'v0.39',
      bosses:bosses.length,
      identities:Object.keys(BOSS_IDENTITY).length,
      missingIdentity:bosses.filter(name=>!BOSS_IDENTITY[name]),
      missingUnique:bosses.filter(name=>!uniques[name]),
      duplicateBosses:bosses.filter((name,index)=>bosses.indexOf(name)!==index),
      gearSlots:slotOrder.filter(slot=>!!equipped(slot)),
      activeWeapon:activeWeapon()?.name||'None',
      repairableEquipped:allEquipped().filter(item=>item.durabilityMax&&(item.durability||0)<item.durabilityMax).map(item=>item.name),
      bossFloors:[3,6,10],
    };
  }

  window.gameplayV39={BOSS_IDENTITY,bossIntel,bossSweepAudit,repairEquipped:window.repairEquippedV39};
  try{render();}catch(err){console.warn('v0.39 render refresh failed',err);}
})();
