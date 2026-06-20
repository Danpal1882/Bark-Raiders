(function(){
  const $=id=>document.getElementById(id);
  const esc=window.esc || (value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])));
  const metaKey='barkRaidersMetaV50';
  const resourceIcons={food:'🍖',water:'💧',wood:'🪵',metal:'⚙️',fabric:'🧵',medicine:'💊',gunParts:'🔩',ammo:'🔫'};

  function defaults(){
    return {
      safeDefaultsApplied:false,
      stats:{raids:0,lootBanked:0,enemiesDefeated:0,floorsCleared:0,bossesCleared:0,comfortRuns:0},
      claimed:{}
    };
  }

  function meta(){
    const base=defaults();
    state.v50=state.v50||{};
    state.v50.safeDefaultsApplied=!!state.v50.safeDefaultsApplied;
    state.v50.stats={...defaults().stats, ...(state.v50.stats||{})};
    state.v50.claimed={...defaults().claimed, ...(state.v50.claimed||{})};
    Object.keys(base).forEach(key=>{
      if(key!=='stats'&&key!=='claimed'&&!(key in state.v50)) state.v50[key]=base[key];
    });
    return state.v50;
  }

  function loadMeta(){
    try{
      const saved=JSON.parse(localStorage.getItem(metaKey)||'{}');
      state.v50={...defaults(), ...(saved.v50||saved||{})};
    }catch{
      state.v50=defaults();
    }
    meta();
  }

  function saveMeta(){
    try{localStorage.setItem(metaKey,JSON.stringify({v50:meta()}));}catch{}
  }

  function totalLoot(loot={}){
    return Object.entries(loot).filter(([key])=>key!=='ammo').reduce((sum,[,value])=>sum+(Number(value)||0),0);
  }

  function give(cost){
    Object.entries(cost||{}).forEach(([key,value])=>{
      if(key==='treats') state.treats=(state.treats||0)+value;
      else if(state.resources&&key in state.resources) state.resources[key]+=value;
    });
  }

  const goals=[
    {id:'firstHaul', title:'First proper haul', desc:'Bank 25 supplies from raids.', need:25, stat:'lootBanked', reward:{ammo:12,medicine:2}},
    {id:'pestControl', title:'Clear the path', desc:'Defeat 3 hostiles.', need:3, stat:'enemiesDefeated', reward:{medicine:3,treats:1}},
    {id:'routeFinder', title:'Find the stairs', desc:'Clear any non-boss floor exit.', need:1, stat:'floorsCleared', reward:{wood:10,metal:6}},
    {id:'bossReady', title:'Boss prep', desc:'Complete 3 raids or clear a boss.', need:3, stat:'raids', altStat:'bossesCleared', reward:{gunParts:3,ammo:18,treats:2}},
  ];

  function goalProgress(goal){
    const m=meta();
    const primary=m.stats[goal.stat]||0;
    const alt=goal.altStat ? (m.stats[goal.altStat]||0)*goal.need : 0;
    return Math.min(goal.need, Math.max(primary, alt));
  }

  function rewardText(reward){
    return Object.entries(reward||{}).map(([key,value])=>`${resourceIcons[key]||''}${value} ${key}`).join(', ');
  }

  function claimReadyGoals(){
    const m=meta();
    goals.forEach(goal=>{
      if(m.claimed[goal.id] || goalProgress(goal)<goal.need) return;
      m.claimed[goal.id]=true;
      give(goal.reward);
      const text=`v0.5 goal complete: ${goal.title}. Reward: ${rewardText(goal.reward)}.`;
      if(typeof log==='function') log(text);
      if(typeof pushDialogue==='function') pushDialogue(`Kennel Board: "${goal.title} complete. Supplies added."`);
    });
    saveMeta();
  }

  function isFreshSave(){
    return !(state.raidHistory&&state.raidHistory.length) && !state.lastRaidSummary && !state.running;
  }

  function applySafeDefaults(){
    const m=meta();
    if(m.safeDefaultsApplied || !isFreshSave()) return;
    state.planId='safe';
    state.contractId='pest';
    state.autoExtract=true;
    state.autoExtractRule='safe';
    m.safeDefaultsApplied=true;
    saveMeta();
  }

  function prepComfortRun(){
    meta().stats.comfortRuns=(meta().stats.comfortRuns||0)+1;
    if(typeof applyQuickProfile==='function') applyQuickProfile('safe');
    state.planId='safe';
    state.contractId='pest';
    state.autoExtract=true;
    state.autoExtractRule='safe';
    state.settings.speed=Math.min(Number(state.settings.speed||1000),800);
    if(state.resources.ammo<24) state.resources.ammo=24;
    try{generateMap();}catch{}
    saveMeta();
    if(typeof save==='function') save();
    if(typeof render==='function') render();
    if(typeof log==='function') log('Comfort Run prepared: Safe Sniff, Pest Control, Safe Auto-Extract, and a starter ammo buffer.');
  }
  window.prepComfortRunV50=prepComfortRun;

  function bestNextGoal(){
    return goals.find(goal=>!meta().claimed[goal.id]) || goals[goals.length-1];
  }

  function ensureSessionPanel(){
    const setup=document.querySelector('.setup-panel');
    if(!setup) return null;
    let panel=setup.querySelector('.session-goals-v50');
    if(!panel){
      panel=document.createElement('section');
      panel.className='session-goals-v50';
      const controls=setup.querySelector('.controls');
      setup.insertBefore(panel,controls||setup.firstChild);
    }
    return panel;
  }

  function renderSessionPanel(){
    const panel=ensureSessionPanel();
    if(!panel) return;
    const m=meta();
    const next=bestNextGoal();
    const rows=goals.map(goal=>{
      const progress=goalProgress(goal);
      const done=m.claimed[goal.id];
      const ready=!done&&progress>=goal.need;
      return `<article class="${done?'done':ready?'ready':''}">
        <div>
          <strong>${esc(goal.title)}</strong>
          <span>${esc(goal.desc)}</span>
          <small>${progress}/${goal.need} • Reward: ${esc(rewardText(goal.reward))}</small>
        </div>
        <b>${done?'Done':ready?'Claimed':'Next'}</b>
      </article>`;
    }).join('');
    panel.innerHTML=`<div class="session-head-v50">
      <div>
        <span class="guide-tag-v47">v0.5 session</span>
        <strong>${esc(next?.title||'Keep raiding')}</strong>
        <p>${esc(next?.desc||'Run, bank, upgrade, repeat.')}</p>
      </div>
      <button type="button" onclick="prepComfortRunV50()">Comfort Run</button>
    </div>
    <div class="session-stats-v50">
      <span>${m.stats.raids||0} raids</span>
      <span>${m.stats.lootBanked||0} loot banked</span>
      <span>${m.stats.enemiesDefeated||0} hostiles cleared</span>
    </div>
    <div class="session-list-v50">${rows}</div>`;
  }

  function enhanceSummary(){
    const root=$('raidSummary')?.querySelector('.raid-debrief-v38') || $('raidSummary');
    if(!root||root.querySelector('.session-summary-v50')) return;
    const m=meta();
    const next=bestNextGoal();
    root.insertAdjacentHTML('beforeend',`<section class="session-summary-v50">
      <strong>Session progress</strong>
      <span>${esc(m.stats.raids||0)} raids · ${esc(m.stats.lootBanked||0)} loot banked · ${esc(m.stats.enemiesDefeated||0)} hostiles cleared</span>
      <span>Next goal: ${esc(next?.title||'Free play')} (${next?`${goalProgress(next)}/${next.need}`:'complete'})</span>
    </section>`);
  }

  loadMeta();
  applySafeDefaults();

  const baseMake=makeRaidHistoryEntry;
  makeRaidHistoryEntry=function(success,bossClear=false,floorClear=false,lootBeforeBank={},newInjuries=[]){
    const banked=success ? totalLoot(lootBeforeBank) : Math.floor(totalLoot(lootBeforeBank)*.65);
    baseMake(success,bossClear,floorClear,lootBeforeBank,newInjuries);
    const m=meta();
    m.stats.raids++;
    m.stats.lootBanked+=banked;
    if(floorClear) m.stats.floorsCleared++;
    if(bossClear) m.stats.bossesCleared++;
    claimReadyGoals();
    if(state.lastRaidSummary){
      state.lastRaidSummary.v50Session={...m.stats};
      state.lastRaidSummary.v50NextGoal=bestNextGoal()?.title||'Free play';
    }
    saveMeta();
  };

  const baseWin=winCombat;
  winCombat=function(enemy){
    const wasBoss=!!enemy?.bossFight;
    baseWin(enemy);
    const m=meta();
    m.stats.enemiesDefeated++;
    if(wasBoss) m.stats.bossesCleared=Math.max(m.stats.bossesCleared||0,1);
    claimReadyGoals();
    saveMeta();
  };

  const baseShow=showRaidSummary;
  showRaidSummary=function(){
    baseShow();
    enhanceSummary();
    renderSessionPanel();
  };

  const baseRender=render;
  render=function(){
    applySafeDefaults();
    baseRender();
    renderSessionPanel();
  };

  window.gameplayV50={
    version:'v0.50',
    goals,
    prepComfortRun,
    audit(){
      return {
        version:'v0.50',
        panelPresent:!!document.querySelector('.session-goals-v50'),
        safeDefaultsApplied:!!meta().safeDefaultsApplied,
        stats:{...meta().stats},
        claimed:{...meta().claimed},
        nextGoal:bestNextGoal()?.id||null,
        summaryEnhanced:!!document.querySelector('.session-summary-v50')
      };
    }
  };

  try{renderSessionPanel();}catch(err){console.warn('v0.50 session panel failed',err);}
})();
