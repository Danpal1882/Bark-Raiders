(function(){
  const $=id=>document.getElementById(id);
  const baseMake=makeRaidHistoryEntry;
  const baseShow=showRaidSummary;
  const baseHistory=renderRaidHistory;

  function resourceList(text){
    return text&&text.trim()?text:'No secured loot';
  }
  function nextStep(r){
    if(!r.success)return `Recover ${r.dog}, repair the plan, and retry ${r.biome} Floor ${r.floor}.`;
    if(r.bossClear)return r.floor>=10?'Biome route complete. Send another raider for farming or change biome.':`Boss beaten. Scout Floor ${Math.min(10,r.floor+1)} next.`;
    if(r.floorClear)return `Exit found. Continue to Floor ${Math.min(10,r.floor+1)} or extract manually to bank progress.`;
    return `Supplies secured. Upgrade the kennel or run another sweep.`;
  }
  function outcomeTone(r){
    if(r.bossClear)return 'Boss route cleared';
    if(r.floorClear)return 'Exit route found';
    if(r.success)return 'Clean extraction';
    return 'Rough extraction';
  }
  function timeline(r){
    const steps=[
      {label:'Entered',text:`${r.biome} Floor ${r.floor} on ${r.plan}.`},
      {label:r.success?'Extracted':'Retreated',text:r.success?'Returned to the kennel with the pack intact.':'Lost momentum and dropped part of the pack.'},
      {label:'Progress',text:r.progressText||'No new floor unlocked.'},
      {label:'Next',text:nextStep(r)},
    ];
    return steps.map(step=>`<article><strong>${step.label}</strong><span>${step.text}</span></article>`).join('');
  }

  makeRaidHistoryEntry=function(success,bossClear=false,floorClear=false,lootBeforeBank={},newInjuries=[]){
    const beforeFloor=currentFloor(),beforeBiome=currentBiome().name,beforePlan=currentPlan().name,beforeDog=state.dog.name;
    baseMake(success,bossClear,floorClear,lootBeforeBank,newInjuries);
    const r=state.lastRaidSummary;
    if(!r)return;
    const enhanced={...r,bossClear:!!bossClear,floorClear:!!floorClear};
    Object.assign(r,{
      bossClear:!!bossClear,
      floorClear:!!floorClear,
      routeTone:outcomeTone(enhanced),
      nextStep:nextStep(enhanced),
      loopSteps:[
        `Entered ${beforeBiome} Floor ${beforeFloor}`,
        `${success?'Extracted':'Retreated'} as ${beforeDog}`,
        resourceList(r.lootText),
        r.progressText||'No new floor',
      ],
      plan:beforePlan,
    });
  };

  showRaidSummary=function(){
    if(!state.lastRaidSummary)return baseShow();
    const r=state.lastRaidSummary;
    $('raidSummary').innerHTML=`<section class="raid-debrief-v38 ${r.success?'success':'fail'}">
      <div class="debrief-hero-v38">
        <div>
          <span class="eyebrow-v38">${r.routeTone||outcomeTone(r)}</span>
          <h3>${r.result}</h3>
          <p>${r.biome} Floor ${r.floor} · ${r.dog} · ${r.duration}</p>
        </div>
        <strong>${r.success?'SAFE':'HURT'}</strong>
      </div>
      <div class="debrief-grid-v38">
        <article><strong>Loot Banked</strong><span>${resourceList(r.lootText)}</span></article>
        <article><strong>Contract</strong><span>${r.contract||'No Contract'}</span></article>
        <article><strong>Injuries</strong><span>${r.injuryText||'None'}</span></article>
        <article><strong>Floor Progress</strong><span>${r.progressText||'No new floor'}</span></article>
      </div>
      <div class="raid-timeline-v38">${timeline(r)}</div>
      <div class="next-run-v38"><strong>Recommended next run</strong><span>${r.nextStep||nextStep(r)}</span></div>
    </section>`;
    $('summaryModal').classList.remove('hidden');
  };

  renderRaidHistory=function(){
    const rows=(state.raidHistory||[]).slice(0,12).map(r=>`<div class="history-row ${r.success?'success':'fail'}">
      <strong>${r.result} <small>${r.routeTone||outcomeTone(r)}</small></strong>
      <span>${r.biome} F${r.floor} · ${r.plan} · ${r.dog} · ${r.duration}</span>
      <span>${resourceList(r.lootText)} · ${r.nextStep||nextStep(r)}</span>
    </div>`).join('');
    $('raidHistory').innerHTML=rows||'<p class="muted">No raids logged yet.</p>';
  };

  renderRaidHistory();
  window.gameplayV38={nextStep,outcomeTone};
})();
