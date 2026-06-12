(function(){
  const $=id=>document.getElementById(id);
  const JOBS={
    scrap:{name:'Scrap Patrol',icon:'🔩',desc:'Slow, dependable metal and gun-part finds.',rate:{metal:1.5,gunParts:.16}},
    forage:{name:'Supply Run',icon:'🥫',desc:'Brings home food, water, and occasional medicine.',rate:{food:1.4,water:1.2,medicine:.12}},
    timber:{name:'Timber Watch',icon:'🪵',desc:'Collects wood and fabric for kennel projects.',rate:{wood:1.5,fabric:.38}},
  };
  const DEFAULT_APPEARANCE={marking:'classic',eyes:'brown',ears:'natural',scarf:'none',harness:'#27777c'};
  const saved=(()=>{try{return JSON.parse(localStorage.getItem('barkRaidersSaveV9')||'{}');}catch{return {};}})();
  state.kennelJobs=saved.kennelJobs||{};
  state.raiderAppearances=saved.raiderAppearances||{};
  let activeRaiderId=null;

  function raider(){
    return state.roster?.find(item=>item.id===state.dogId)||state.roster?.[0]||null;
  }
  function appearanceFor(id){
    return {...DEFAULT_APPEARANCE,...(state.raiderAppearances[id]||{})};
  }
  function syncAppearance(){
    const current=raider();
    if(!current)return;
    if(!state.raiderAppearances[current.id]){
      const creating=!$('creatorModal')?.classList.contains('hidden');
      const firstAppearance=Object.keys(state.raiderAppearances).length===0;
      state.raiderAppearances[current.id]={
        ...DEFAULT_APPEARANCE,
        ...(current.appearance||{}),
        ...((creating||firstAppearance)?(state.customisation||{}):{}),
      };
    }
    current.appearance={...appearanceFor(current.id)};
    if(activeRaiderId!==current.id){
      activeRaiderId=current.id;
      state.customisation={...appearanceFor(current.id)};
    }
  }
  function saveAppearance(values){
    const current=raider();
    if(!current)return;
    state.raiderAppearances[current.id]={...appearanceFor(current.id),...values};
    current.appearance={...state.raiderAppearances[current.id]};
    state.customisation={...current.appearance};
  }

  function jobProgress(entry,now=Date.now()){
    if(!entry)return{hours:0,rewards:{}};
    const hours=Math.max(0,Math.min(8,(now-entry.started)/3600000));
    const def=JOBS[entry.job],rewards={};
    Object.entries(def?.rate||{}).forEach(([key,rate])=>rewards[key]=Math.floor(hours*rate));
    return{hours,rewards};
  }
  function rewardText(rewards){
    return Object.entries(rewards).filter(([,value])=>value>0).map(([key,value])=>`${ICONS[key]||'•'} ${value}`).join(' ');
  }
  window.assignKennelJobV33=function(id,job){
    const dog=state.roster?.find(item=>item.id===id);
    if(!dog||!JOBS[job]||id===state.dogId||dog.injuries?.length)return;
    state.kennelJobs[id]={job,started:Date.now()};
    log(`${dog.name} started ${JOBS[job].name}.`);
    save();render();
  };
  window.claimKennelJobV33=function(id){
    const entry=state.kennelJobs[id],dog=state.roster?.find(item=>item.id===id);
    if(!entry||!dog)return;
    const progress=jobProgress(entry);
    const total=Object.values(progress.rewards).reduce((sum,value)=>sum+value,0);
    if(total<=0){log(`${dog.name} has not found anything yet.`);return;}
    Object.entries(progress.rewards).forEach(([key,value])=>state.resources[key]=(state.resources[key]||0)+value);
    entry.started=Date.now();
    log(`${dog.name} returned from ${JOBS[entry.job].name}: ${rewardText(progress.rewards)}.`);
    showToast(`${dog.name} brought supplies home`,rewardText(progress.rewards),'reward');
    save();render();
  };
  window.stopKennelJobV33=function(id){
    if(!state.kennelJobs[id])return;
    claimKennelJobV33(id);
    delete state.kennelJobs[id];
    save();render();
  };

  function renderAssignments(){
    const rosterPanel=$('rosterPanel');
    if(!rosterPanel||!state.roster)return;
    let panel=$('kennelAssignmentsV33');
    if(!panel){
      panel=document.createElement('section');
      panel.id='kennelAssignmentsV33';
      panel.className='kennel-assignments';
      rosterPanel.insertAdjacentElement('afterend',panel);
    }
    panel.innerHTML=`<div class="assignment-heading"><div><strong>Kennel Assignments</strong><span>Idle raiders gather supplies for up to 8 hours.</span></div><span class="idle-badge">PASSIVE</span></div>
      <div class="assignment-list">${state.roster.map(dog=>{
        const entry=state.kennelJobs[dog.id],progress=jobProgress(entry),active=dog.id===state.dogId,injured=dog.injuries?.length;
        if(entry)return `<article class="assignment-card working"><div><strong>${JOBS[entry.job].icon} ${dog.name}</strong><span>${JOBS[entry.job].name} · ${progress.hours.toFixed(1)}h / 8h</span><div class="job-progress"><i style="width:${Math.round(progress.hours/8*100)}%"></i></div><small>${rewardText(progress.rewards)||'Searching...'}</small></div><div class="assignment-actions"><button onclick="claimKennelJobV33('${dog.id}')">Claim</button><button class="ghost" onclick="stopKennelJobV33('${dog.id}')">Stop</button></div></article>`;
        return `<article class="assignment-card"><div><strong>${dog.name}</strong><span>${active?'Active raider':injured?'Needs recovery':'Available for kennel work'}</span></div><div class="job-buttons">${Object.entries(JOBS).map(([id,job])=>`<button class="ghost" ${active||injured?'disabled':''} title="${job.desc}" onclick="assignKennelJobV33('${dog.id}','${id}')">${job.icon} ${job.name}</button>`).join('')}</div></article>`;
      }).join('')}</div>`;
  }

  function renderAppearanceEditor(){
    const rosterPanel=$('rosterPanel'),current=raider();
    if(!rosterPanel||!current)return;
    let panel=$('activeRaiderStyleV33');
    if(!panel){
      panel=document.createElement('section');
      panel.id='activeRaiderStyleV33';
      panel.className='active-raider-style';
      rosterPanel.insertAdjacentElement('afterend',panel);
    }
    const currentLook=appearanceFor(current.id);
    const options={
      marking:[['classic','Classic mask'],['blaze','White blaze'],['dark-mask','Dark mask'],['freckles','Freckles']],
      eyes:[['brown','Brown'],['amber','Amber'],['blue','Blue'],['green','Green']],
      ears:[['natural','Natural'],['notched','Notched'],['floppy','Soft tips']],
      scarf:[['none','No neckwear'],['red','Red scarf'],['blue','Blue bandana'],['yellow','Gold neckerchief']],
      harness:[['#27777c','Teal'],['#7359a8','Purple'],['#a94747','Red'],['#4d6b3f','Ranger']],
    };
    panel.innerHTML=`<div class="assignment-heading"><div><strong>${current.name}'s Look</strong><span>Appearance is saved to this raider.</span></div><span class="idle-badge">STYLE</span></div><div class="raider-style-grid">${Object.entries(options).map(([key,values])=>`<label>${key==='eyes'?'Eyes':key==='ears'?'Ears':key==='scarf'?'Neckwear':key==='harness'?'Harness':'Marking'}<select data-active-style="${key}">${values.map(([value,label])=>`<option value="${value}" ${currentLook[key]===value?'selected':''}>${label}</option>`).join('')}</select></label>`).join('')}</div>`;
    panel.querySelectorAll('[data-active-style]').forEach(select=>select.addEventListener('change',()=>{
      saveAppearance({[select.dataset.activeStyle]:select.value});
      save();render();
    }));
  }

  function comparison(item){
    const worn=window.gearV32?.equipped?.(item.slot);
    if(!worn||worn.id===item.id)return'';
    const delta=(item.score||0)-(worn.score||0);
    return `<span class="compare-pill ${delta>0?'better':delta<0?'worse':'same'}">${delta>0?'+':''}${delta} vs equipped</span>`;
  }
  const baseInventory=renderEquipmentInventory;
  renderEquipmentInventory=function(){
    baseInventory();
    document.querySelectorAll('.inventory-group').forEach(group=>{
      const cards=[...group.querySelectorAll('.inventory-item')];
      cards.sort((a,b)=>{
        const ai=a.classList.contains('equipped')?1:0,bi=b.classList.contains('equipped')?1:0;
        if(ai!==bi)return bi-ai;
        const as=Number(a.querySelector('span')?.textContent.match(/score (\d+)/)?.[1]||0);
        const bs=Number(b.querySelector('span')?.textContent.match(/score (\d+)/)?.[1]||0);
        return bs-as;
      });
      const list=group.querySelector('.inventory-list');cards.forEach(card=>list.appendChild(card));
    });
    document.querySelectorAll('.inventory-item').forEach(card=>{
      const name=card.querySelector('strong')?.textContent;
      const item=state.stash?.find(entry=>entry.name===name);
      const target=card.querySelector('div > span');
      if(item&&target&&!card.querySelector('.compare-pill'))target.insertAdjacentHTML('afterend',comparison(item));
    });
  };

  function ensureFxLayer(){
    const map=$('map');if(!map)return null;
    let layer=$('combatFxV33');
    if(!layer){layer=document.createElement('div');layer.id='combatFxV33';layer.className='combat-fx-layer';map.appendChild(layer);}
    return layer;
  }
  function showFx(text,kind='hit'){
    const layer=ensureFxLayer();if(!layer)return;
    const effect=document.createElement('span');effect.className=`combat-fx ${kind}`;effect.textContent=text;
    layer.appendChild(effect);setTimeout(()=>effect.remove(),950);
  }
  function showToast(title,text,kind='reward'){
    let stack=$('gameToastStackV33');
    if(!stack){stack=document.createElement('div');stack.id='gameToastStackV33';stack.className='game-toast-stack';document.body.appendChild(stack);}
    const toast=document.createElement('div');toast.className=`game-toast ${kind}`;toast.innerHTML=`<strong>${title}</strong><span>${text}</span>`;
    stack.appendChild(toast);setTimeout(()=>toast.remove(),3400);
  }
  if(window.gearV32){
    const baseFire=gearV32.fireWeapon;
    gearV32.fireWeapon=function(enemy){
      const result=baseFire(enemy);
      if(result.reload)showFx('RELOAD','reload');
      else if(result.dry)showFx('NO AMMO','danger');
      else if(result.hit)showFx(`${result.crit?'CRIT ':''}-${result.damage}`,result.crit?'crit':'hit');
      else showFx('MISS','miss');
      return result;
    };
    const baseAbsorb=gearV32.absorbDamage;
    gearV32.absorbDamage=function(raw,penetration){
      const result=baseAbsorb(raw,penetration);
      showFx(`-${result.damage}`,result.blocked?'armour':'danger');
      return result;
    };
  }
  const baseWin=winCombat;
  winCombat=function(enemy){
    const boss=enemy.bossFight,name=enemy.name;
    baseWin(enemy);
    showToast(boss?'Boss defeated':'Area secured',boss?`${name}'s unique reward is ready.`:`${state.dog.name} keeps moving.`,'victory');
  };

  const baseSave=save;
  save=function(){
    const founderJustChosen=state.v23?.needsFounder===false&&!$('creatorModal')?.classList.contains('hidden');
    if(founderJustChosen)saveAppearance(state.customisation||DEFAULT_APPEARANCE);
    syncAppearance();
    baseSave();
    const data=(()=>{try{return JSON.parse(localStorage.getItem('barkRaidersSaveV9')||'{}');}catch{return {};}})();
    data.kennelJobs=state.kennelJobs;
    data.raiderAppearances=state.raiderAppearances;
    localStorage.setItem('barkRaidersSaveV9',JSON.stringify(data));
  };
  const baseRender=render;
  render=function(){
    syncAppearance();
    baseRender();
    renderAppearanceEditor();
    renderAssignments();
    ensureFxLayer();
  };

  document.addEventListener('change',event=>{
    const key=event.target?.dataset?.dogCustom;
    if(!key)return;
    if(!$('creatorModal')?.classList.contains('hidden'))return;
    saveAppearance({[key]:event.target.value});
  });
  document.addEventListener('click',event=>{
    if(event.target?.id!=='createRaiderModalBtn')return;
    setTimeout(()=>{
      activeRaiderId=null;
      syncAppearance();
      saveAppearance(state.customisation||DEFAULT_APPEARANCE);
      save();render();
    },0);
  });

  syncAppearance();
  render();
  window.polishV33={JOBS,jobProgress,appearanceFor,showFx,showToast};
})();
