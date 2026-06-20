(function(){
  const $=id=>document.getElementById(id);
  const esc=window.esc || (value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])));
  const allowedPlans=new Set(['safe','wood','scrap','medical']);
  const hiddenRows=new Set(['planSelect','extractSelect','profileSelect']);
  const prefKey='barkRaidersIdleV52';
  let userTouchedSafeExtract=false;

  try{
    const saved=JSON.parse(localStorage.getItem(prefKey)||'{}');
    userTouchedSafeExtract=!!saved.touched;
    if(saved.touched){
      state.autoExtract=!!saved.safeExtract;
      state.autoExtractRule=state.autoExtract?'safe':'off';
    }
  }catch{}

  function savePref(){
    try{localStorage.setItem(prefKey,JSON.stringify({touched:true,safeExtract:!!state.autoExtract,at:new Date().toISOString()}));}catch{}
  }

  function shouldBossPlan(){
    try{return typeof isBossFloor==='function' && isBossFloor();}catch{return false;}
  }

  function normalizeRoute(){
    if(state.running) return;
    if(!allowedPlans.has(state.planId) || state.planId==='balanced' || state.planId==='deep' || state.planId==='boss'){
      state.planId=shouldBossPlan()?'boss':'safe';
    }
    if(!userTouchedSafeExtract && !state.raidHistory?.length && !state.lastRaidSummary){
      state.autoExtract=true;
      state.autoExtractRule='safe';
    }else if(state.autoExtract){
      state.autoExtractRule='safe';
    }else {
      state.autoExtractRule='off';
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
    if(state.planId==='wood') return 'Wood-focused idle route';
    if(state.planId==='scrap') return 'Scrap-focused idle route';
    if(state.planId==='medical') return 'Medical idle route';
    if(state.planId==='boss') return 'Boss floor route';
    return 'Safe idle route';
  }

  function setSafeExtract(enabled){
    userTouchedSafeExtract=true;
    state.autoExtract=!!enabled;
    state.autoExtractRule=enabled?'safe':'off';
    if($('extractSelect')) $('extractSelect').value=state.autoExtractRule;
    savePref();
    try{save(); render();}catch{}
    if(typeof log==='function'){
      log(enabled?'Safe Extract enabled: raiders retreat at low HP or high threat.':'Safe Extract disabled: raids continue until extraction, failure, or floor clear.');
    }
  }
  window.setSafeExtractV52=setSafeExtract;

  function setIdleFocus(focus){
    if(state.running) return;
    state.planId=focus||'safe';
    if(focus==='wood') state.contractId='wood';
    if(focus==='medical') state.contractId='medical';
    if(focus==='scrap' && state.contractId==='none') state.contractId='trader';
    normalizeRoute();
    try{generateMap();}catch{}
    try{save(); render();}catch{}
    if(typeof log==='function') log(`Idle route set: ${routeName()}. Safe Extract is ${state.autoExtract?'enabled':'disabled'}.`);
  }
  window.setIdleFocusV52=setIdleFocus;

  function renderIdlePanel(){
    normalizeRoute();
    labelHiddenRows();
    const panel=ensureIdlePanel();
    if(!panel) return;
    const boss=shouldBossPlan();
    panel.innerHTML=`<div>
      <span class="guide-tag-v47">Idle mode</span>
      <strong>Simple raids, optional safety</strong>
      <p>Pick a biome, floor, dog, and contract. Safe Extract is optional: when ticked, the kennel pulls your raider out at low HP or high threat.</p>
    </div>
    <label class="safe-extract-v52">
      <input type="checkbox" ${state.autoExtract?'checked':''} onchange="setSafeExtractV52(this.checked)">
      <span><strong>Use Safe Extract</strong><small>Recommended for idle play. Turn it off if you want riskier hands-on runs.</small></span>
    </label>
    <div class="idle-route-v51">
      <button type="button" class="${state.planId==='safe'||boss?'active':''}" onclick="setIdleFocusV52('safe')" ${boss?'disabled':''}>Safe Run</button>
      <button type="button" class="${state.planId==='wood'?'active':''}" onclick="setIdleFocusV52('wood')" ${boss?'disabled':''}>Wood</button>
      <button type="button" class="${state.planId==='scrap'?'active':''}" onclick="setIdleFocusV52('scrap')" ${boss?'disabled':''}>Scrap</button>
      <button type="button" class="${state.planId==='medical'?'active':''}" onclick="setIdleFocusV52('medical')" ${boss?'disabled':''}>Meds</button>
    </div>
    <small>${esc(routeName())} · Safe Extract: ${state.autoExtract?'On':'Off'}</small>`;
  }

  const baseRenderPlanOptions=renderPlanOptions;
  renderPlanOptions=function(){
    baseRenderPlanOptions();
    normalizeRoute();
    const select=$('planSelect');
    if(select) select.value=state.planId;
  };

  const baseRenderStats=renderStats;
  renderStats=function(){
    normalizeRoute();
    baseRenderStats();
    const status=$('statusText');
    if(status&&!state.running) status.textContent=`Resting at the kennel. Safe Extract is ${state.autoExtract?'on':'off'}.`;
  };

  const baseRender=render;
  render=function(){
    normalizeRoute();
    baseRender();
    renderIdlePanel();
  };

  const baseStart=startRaid;
  startRaid=function(){
    normalizeRoute();
    if($('planSelect')) $('planSelect').value=state.planId;
    if($('extractSelect')) $('extractSelect').value=state.autoExtract?'safe':'off';
    return baseStart();
  };

  const baseShow=showRaidSummary;
  showRaidSummary=function(){
    baseShow();
    renderIdlePanel();
  };

  toggleAutoExtract=function(){
    setSafeExtract(!state.autoExtract);
  };

  window.gameplayV52={
    version:'v0.52',
    setIdleFocus,
    setSafeExtract,
    audit(){
      return {
        version:'v0.52',
        idlePanel:!!document.querySelector('.idle-mode-v51'),
        checkbox:!!document.querySelector('.safe-extract-v52 input'),
        hiddenRows:[...hiddenRows].every(id=>$(id)?.closest?.('.form-row')?.classList.contains('idle-hidden-v51')),
        autoExtract:state.autoExtract,
        autoExtractRule:state.autoExtractRule,
        planId:state.planId,
        route:routeName()
      };
    }
  };

  try{renderIdlePanel();}catch(err){console.warn('v0.52 idle checkbox failed',err);}
})();
