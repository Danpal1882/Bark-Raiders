(function(){
  const $=id=>document.getElementById(id);
  const esc=window.esc || (value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])));
  const allowedPlans=new Set(['safe','wood','scrap','medical']);
  const hiddenRows=new Set(['planSelect','extractSelect','profileSelect']);

  function shouldBossPlan(){
    try{return typeof isBossFloor==='function' && isBossFloor();}catch{return false;}
  }

  function simplifyRaidSettings(){
    if(state.running) return;
    state.autoExtract=true;
    state.autoExtractRule='safe';
    if(!allowedPlans.has(state.planId) || state.planId==='balanced' || state.planId==='deep' || state.planId==='boss'){
      state.planId=shouldBossPlan()?'boss':'safe';
    }
  }

  function labelHiddenRows(){
    hiddenRows.forEach(id=>{
      const el=$(id);
      const row=el?.closest?.('.form-row');
      if(row) row.classList.add('idle-hidden-v51');
    });
    document.querySelector('.mini-actions')?.classList.add('idle-hidden-v51');
    $('autoExtractBtn')?.classList.add('idle-hidden-v51');
  }

  function ensureIdlePanel(){
    const setup=document.querySelector('.setup-panel');
    if(!setup) return null;
    let panel=setup.querySelector('.idle-mode-v51');
    if(!panel){
      panel=document.createElement('section');
      panel.className='idle-mode-v51';
      const controls=setup.querySelector('.controls');
      setup.insertBefore(panel,controls||setup.firstChild);
    }
    return panel;
  }

  function routeName(){
    if(state.planId==='wood') return 'Wood-focused safe route';
    if(state.planId==='scrap') return 'Scrap-focused safe route';
    if(state.planId==='medical') return 'Medical safe route';
    if(state.planId==='boss') return 'Boss floor, safety enabled';
    return 'Safe idle route';
  }

  function setIdleFocus(focus){
    if(state.running) return;
    state.planId=focus||'safe';
    state.autoExtract=true;
    state.autoExtractRule='safe';
    if(focus==='wood') state.contractId='wood';
    if(focus==='medical') state.contractId='medical';
    if(focus==='scrap' && state.contractId==='none') state.contractId='trader';
    try{generateMap();}catch{}
    try{save(); render();}catch{}
    if(typeof log==='function') log(`Idle route set: ${routeName()}. Safe extraction remains on.`);
  }
  window.setIdleFocusV51=setIdleFocus;

  function renderIdlePanel(){
    simplifyRaidSettings();
    labelHiddenRows();
    const panel=ensureIdlePanel();
    if(!panel) return;
    const boss=shouldBossPlan();
    panel.innerHTML=`<div>
      <span class="guide-tag-v47">Idle mode</span>
      <strong>Safe extract is always on</strong>
      <p>Pick a biome, floor, dog, and contract. The kennel handles the route and pulls your raider out at low HP or high threat.</p>
    </div>
    <div class="idle-route-v51">
      <button type="button" class="${state.planId==='safe'||boss?'active':''}" onclick="setIdleFocusV51('safe')" ${boss?'disabled':''}>Safe Run</button>
      <button type="button" class="${state.planId==='wood'?'active':''}" onclick="setIdleFocusV51('wood')" ${boss?'disabled':''}>Wood</button>
      <button type="button" class="${state.planId==='scrap'?'active':''}" onclick="setIdleFocusV51('scrap')" ${boss?'disabled':''}>Scrap</button>
      <button type="button" class="${state.planId==='medical'?'active':''}" onclick="setIdleFocusV51('medical')" ${boss?'disabled':''}>Meds</button>
    </div>
    <small>${esc(routeName())} · Auto-extract: Safe</small>`;
  }

  const baseRenderPlanOptions=renderPlanOptions;
  renderPlanOptions=function(){
    baseRenderPlanOptions();
    simplifyRaidSettings();
    const select=$('planSelect');
    if(select) select.value=state.planId;
  };

  const baseRenderStats=renderStats;
  renderStats=function(){
    simplifyRaidSettings();
    baseRenderStats();
    const status=$('statusText');
    if(status&&!state.running) status.textContent='Resting at the kennel. Idle safety is ready.';
  };

  const baseRender=render;
  render=function(){
    simplifyRaidSettings();
    baseRender();
    renderIdlePanel();
  };

  const baseStart=startRaid;
  startRaid=function(){
    simplifyRaidSettings();
    if($('planSelect')) $('planSelect').value=state.planId;
    if($('extractSelect')) $('extractSelect').value='safe';
    return baseStart();
  };

  const baseShow=showRaidSummary;
  showRaidSummary=function(){
    baseShow();
    renderIdlePanel();
  };

  toggleAutoExtract=function(){
    state.autoExtract=true;
    state.autoExtractRule='safe';
    if($('extractSelect')) $('extractSelect').value='safe';
    try{save(); render();}catch{}
    if(typeof log==='function') log('Safe Auto-Extract stays enabled for idle raids.');
  };

  window.gameplayV51={
    version:'v0.51',
    setIdleFocus,
    audit(){
      return {
        version:'v0.51',
        idlePanel:!!document.querySelector('.idle-mode-v51'),
        hiddenRows:[...hiddenRows].every(id=>$(id)?.closest?.('.form-row')?.classList.contains('idle-hidden-v51')),
        autoExtract:state.autoExtract,
        autoExtractRule:state.autoExtractRule,
        planId:state.planId,
        route:routeName()
      };
    }
  };

  try{renderIdlePanel();}catch(err){console.warn('v0.51 idle cleanup failed',err);}
})();
