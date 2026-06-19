(function(){
  const $=id=>document.getElementById(id);
  const esc=window.esc || (value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])));
  const guideKey='barkRaidersGuideV47';
  let guideHidden=false;
  try{guideHidden=JSON.parse(localStorage.getItem(guideKey)||'{}').hidden===true;}catch{}

  function saveGuideHidden(){
    try{localStorage.setItem(guideKey,JSON.stringify({hidden:guideHidden,at:new Date().toISOString()}));}catch{}
  }

  function isFirstRaid(){
    return !(state.raidHistory&&state.raidHistory.length) && !state.running && !state.lastRaidSummary;
  }

  function guidePhase(){
    if(state.combat) return {
      tag:'Combat',
      title:'Keep the fight readable',
      body:'Active enemies are revealed through fog. Watch HP, ammo, and the floating hit text before deciding to extract.',
      steps:['Damage text means shots are landing.','Low ammo means extract or search ammo crates.','Use Loadout Detail after the run if fights feel slow.']
    };
    if(state.running) return {
      tag:'In raid',
      title:'Loot, scout, extract',
      body:'Search rooms until the pack is nearly full or the route gets risky. Extracting alive banks the run.',
      steps:['Green crates and room props can hide supplies.','The floor exit unlocks the next area.','Manual Extract is valid when HP or ammo drops.']
    };
    if(state.lastRaidSummary) return {
      tag:'Debrief',
      title:'Read the next step',
      body:'The post-raid report now calls out what changed and what to fix before the next dispatch.',
      steps:['Bank useful supplies.','Repair or swap weak gear.','Push the next floor only when the loadout looks ready.']
    };
    return {
      tag:isFirstRaid()?'First raid':'Raid prep',
      title:isFirstRaid()?'Your first Bark Raiders loop':'Prep the next run',
      body:isFirstRaid()
        ? 'Pick a biome, check the plan, then Start. The aim is simple: find loot, survive contact, and extract before the dog gets overwhelmed.'
        : 'Before dispatch, check route, contract, auto-extract, and loadout pressure.',
      steps:['Start with Safe Sniff if unsure.','Keep Auto-Extract on Safe for hands-off runs.','If Loadout Intel warns you, upgrade or buy supplies first.']
    };
  }

  function ensureGuide(){
    const mapPanel=document.querySelector('.dashboard-map-panel');
    if(!mapPanel) return null;
    let guide=mapPanel.querySelector('.first-raid-guide-v47');
    if(!guide){
      guide=document.createElement('section');
      guide.className='first-raid-guide-v47';
      const fieldCard=mapPanel.querySelector('.field-task-card-v40');
      if(fieldCard) fieldCard.insertAdjacentElement('afterend',guide);
      else mapPanel.insertBefore(guide,$('map')||mapPanel.firstChild);
    }
    return guide;
  }

  function renderGuide(){
    const guide=ensureGuide();
    if(!guide) return;
    const phase=guidePhase();
    const shouldShow=!guideHidden || isFirstRaid() || state.running;
    guide.classList.toggle('hidden',!shouldShow);
    guide.innerHTML=`<div>
      <span class="guide-tag-v47">${esc(phase.tag)}</span>
      <strong>${esc(phase.title)}</strong>
      <p>${esc(phase.body)}</p>
      <ol>${phase.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol>
    </div>
    <button class="ghost guide-dismiss-v47" type="button">${guideHidden?'Show tips':'Hide tips'}</button>`;
    guide.querySelector('button')?.addEventListener('click',()=>{
      guideHidden=!guideHidden;
      saveGuideHidden();
      renderGuide();
    });
  }

  function snapshotRun(lootBeforeBank){
    const lootTotal=Object.entries(lootBeforeBank||{}).filter(([key])=>key!=='ammo').reduce((sum,[,value])=>sum+(Number(value)||0),0);
    return {
      hp:state.dog?.hp||0,
      maxHp:state.dog?.maxHp||1,
      ammo:state.dog?.ammo||0,
      ammoMax:state.dog?.ammoMax||1,
      carry:state.dog?.carry||lootTotal,
      carryMax:state.dog?.carryMax||1,
      lootTotal,
      threat:state.threat||0,
      weapon:state.equipment?.weapon?.name || window.gearV32?.activeWeapon?.()?.name || 'current weapon',
      armour:state.equipment?.armour?.name || 'current armour'
    };
  }

  function recommendation(r){
    const snap=r.v47||{};
    const hpPct=snap.hp/Math.max(1,snap.maxHp);
    const ammoPct=snap.ammo/Math.max(1,snap.ammoMax);
    const carryPct=snap.carry/Math.max(1,snap.carryMax);
    if(!r.success){
      if(r.injuryText) return `Recover ${r.dog}, then buy or craft medicine before retrying ${r.biome} Floor ${r.floor}.`;
      return `Retry ${r.biome} Floor ${r.floor} with Safe auto-extract and a steadier route plan.`;
    }
    if(r.bossClear) return r.floor>=10
      ? 'That biome route is cleared. Farm safer floors for supplies or switch biome for fresh bosses.'
      : `Boss down. Repair gear, refill ammo, then scout Floor ${Math.min(10,(r.floor||1)+1)}.`;
    if(r.floorClear) return `Floor exit found. Refill ammo and push Floor ${Math.min(10,(r.floor||1)+1)} when the loadout intel looks green.`;
    if(ammoPct<=0.25) return `Ammo ended low (${snap.ammo||0}/${snap.ammoMax||0}). Buy, craft, or loot ammo before the next run.`;
    if(hpPct<=0.45) return `HP ended low (${snap.hp||0}/${snap.maxHp||0}). Heal up and consider stronger armour before pushing deeper.`;
    if(carryPct>=0.85) return 'Pack was nearly full. That is a good extraction point: bank it, upgrade storage, then run again.';
    if(!snap.lootTotal) return 'No loot secured. Try Safe Sniff or a supply-focused contract to build early resources.';
    return 'Solid run. Spend the loot on a practical upgrade, then either repeat for supplies or push the next floor.';
  }

  function outcomeLabel(r){
    if(r.bossClear) return 'Boss sweep complete';
    if(r.floorClear) return 'Route advanced';
    if(r.success) return 'Supplies banked';
    return 'Recovery run needed';
  }

  function enhanceSummary(){
    const r=state.lastRaidSummary;
    const root=$('raidSummary')?.querySelector('.raid-debrief-v38') || $('raidSummary');
    if(!r||!root||root.querySelector('.debrief-next-v47')) return;
    const snap=r.v47||{};
    const next=recommendation(r);
    r.nextStep=next;
    const hpText=snap.maxHp?`${snap.hp}/${snap.maxHp} HP`:'HP not recorded';
    const ammoText=snap.ammoMax?`${snap.ammo}/${snap.ammoMax} ammo`:'Ammo not recorded';
    const carryText=snap.carryMax?`${snap.carry}/${snap.carryMax} carry`:'Carry not recorded';
    root.insertAdjacentHTML('beforeend',`<section class="debrief-next-v47">
      <div>
        <span class="guide-tag-v47">${esc(outcomeLabel(r))}</span>
        <strong>Next best move</strong>
        <p>${esc(next)}</p>
      </div>
      <div class="debrief-metrics-v47">
        <span>${esc(hpText)}</span>
        <span>${esc(ammoText)}</span>
        <span>${esc(carryText)}</span>
        <span>${esc(r.gearFoundText||'No gear recovered')}</span>
      </div>
    </section>`);
  }

  const baseMake=makeRaidHistoryEntry;
  makeRaidHistoryEntry=function(success,bossClear=false,floorClear=false,lootBeforeBank={},newInjuries=[]){
    const snap=snapshotRun(lootBeforeBank);
    baseMake(success,bossClear,floorClear,lootBeforeBank,newInjuries);
    if(state.lastRaidSummary){
      state.lastRaidSummary.v47=snap;
      state.lastRaidSummary.v47Recommendation=recommendation(state.lastRaidSummary);
      state.lastRaidSummary.nextStep=state.lastRaidSummary.v47Recommendation;
    }
  };

  const baseShow=showRaidSummary;
  showRaidSummary=function(){
    baseShow();
    enhanceSummary();
    renderGuide();
  };

  const baseHistory=renderRaidHistory;
  renderRaidHistory=function(){
    baseHistory();
    const rows=$('raidHistory')?.querySelectorAll('.history-row');
    if(!rows) return;
    (state.raidHistory||[]).slice(0,12).forEach((r,index)=>{
      if(!rows[index]||rows[index].querySelector('.history-next-v47')) return;
      rows[index].insertAdjacentHTML('beforeend',`<span class="history-next-v47">Next: ${esc(r.v47Recommendation||r.nextStep||recommendation(r))}</span>`);
    });
  };

  const baseRender=render;
  render=function(){
    baseRender();
    renderGuide();
  };

  window.gameplayV47={
    version:'v0.47',
    recommendation,
    audit(){
      return {
        version:'v0.47',
        guidePresent:!!document.querySelector('.first-raid-guide-v47'),
        guideHidden,
        firstRaid:isFirstRaid(),
        summaryEnhanced:!!document.querySelector('.debrief-next-v47'),
        lastRecommendation:state.lastRaidSummary?.v47Recommendation||null
      };
    }
  };

  try{renderGuide();}catch(err){console.warn('v0.47 guide refresh failed',err);}
})();
