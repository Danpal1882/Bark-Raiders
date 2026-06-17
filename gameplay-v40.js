(function(){
  const $=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  const BIOME_TEXTURE={
    city:{
      ambience:[
        'Wind whistles through a bus shelter full of old paw prints.',
        'A burnt-out car ticks softly as it cools in the rain.',
        'Somewhere above, a loose shop sign clacks against brick.',
        'The street smells of wet concrete, rust, and forgotten snacks.',
      ],
      loot:{
        crate:'A collapsed delivery crate spills tins, cables, and chew-marked tape.',
        rare:'A locked corner shop safe blinks with one last battery light.',
        weapon:'A police locker lies half-buried under brick dust.',
        scrap:'A pile of roadworks scrap still has usable brackets.',
        medical:'An abandoned clinic trolley has not been picked clean yet.',
      },
      trader:'A crow broker watches from a vending machine roof.',
      resource:'metal',
    },
    sewer:{
      ambience:[
        'Water slaps against the tunnel wall in slow, suspicious waves.',
        'Pipe steam curls into shapes that almost look like tails.',
        'Something small splashes away before the torch catches it.',
        'The tunnel opens into a maintenance bay covered in chalk marks.',
      ],
      loot:{
        crate:'A waterproof cache is wedged behind a drain cover.',
        rare:'A maintenance vault sits above the flood line.',
        weapon:'A rust-proof locker has been sealed with cable ties.',
        water:'A filtration tank still drips clean water.',
        medical:'A sealed first-aid box floats under a warning sign.',
      },
      trader:'A hooded rat trader taps twice on a pipe and offers a deal.',
      resource:'water',
    },
    factory:{
      ambience:[
        'Conveyor belts creak even though the power is long gone.',
        'A warning light spins lazily over a silent loading bay.',
        'Loose bolts skitter across the floor as machinery settles.',
        'The room smells of oil, hot dust, and old thunder.',
      ],
      loot:{
        crate:'A shipping pallet has split open beside the loading dock.',
        rare:'A supervisor cabinet still has a working magnetic latch.',
        weapon:'A security cage contains tagged weapon parts.',
        scrap:'A press machine has coughed up clean metal offcuts.',
        medical:'A wall-mounted trauma kit survived behind cracked glass.',
      },
      trader:'A masked scrap dealer rolls out from behind a forklift.',
      resource:'gunParts',
    },
    farmland:{
      ambience:[
        'Tall grass parts and then slowly stands back up.',
        'A barn door knocks in the wind like someone asking to come in.',
        'Crows argue on a fence line and go quiet all at once.',
        'Mud, hay, and cold morning air cling to every paw step.',
      ],
      loot:{
        crate:'A feed-store crate hides useful supplies under sacks of grain.',
        rare:'A farmhouse cellar cache is tucked behind loose boards.',
        weapon:'A locked tack room contains old but maintained gear.',
        food:'The pantry shelves still hold scavengable tins.',
        tree:'A fallen branch pile has dry timber inside.',
      },
      trader:'A field trader waves from behind a patched-up wheelbarrow.',
      resource:'food',
    },
  };

  const OBJECTIVE_TEMPLATES=[
    {id:'sweep',label:'Sweep Route',target:4,desc:'Clear 4 non-empty rooms before extracting.',reward:{type:'medicine',amount:2}},
    {id:'cache',label:'Cache Hunter',target:3,desc:'Search 3 loot rooms this raid.',reward:{type:'metal',amount:3}},
    {id:'contact',label:'Local Contact',target:1,desc:'Find a trader or resolve an event.',reward:{type:'fabric',amount:3}},
    {id:'samples',label:'Biome Samples',target:8,desc:'Recover 8 biome-priority supplies.',reward:{type:'ammo',amount:5}},
    {id:'control',label:'Area Control',target:2,desc:'Defeat 2 enemies before extracting.',reward:{type:'gunParts',amount:2}},
  ];

  function biomeKey(){
    return Object.keys(BIOMES).find(key=>BIOMES[key]===currentBiome()) || 'city';
  }
  function texture(){
    return BIOME_TEXTURE[biomeKey()] || BIOME_TEXTURE.city;
  }
  function run(){
    state.v40=state.v40||{};
    return state.v40.run;
  }
  function pickObjective(){
    const key=biomeKey();
    const floor=currentFloor();
    const options=OBJECTIVE_TEMPLATES.filter(obj=>{
      if(isBossFloor()&&obj.id==='contact')return false;
      if(floor<2&&obj.id==='control')return false;
      return true;
    });
    const chosen=options[Math.abs(hashSeed(`${state.mapSeed||Date.now()}-${key}-${floor}`))%options.length];
    const copy={...chosen,progress:0,complete:false,claimed:false};
    if(copy.id==='samples'){
      copy.resource=texture().resource;
      copy.desc=`Recover ${copy.target} ${copy.resource} from this biome.`;
    }
    return copy;
  }
  function rewardText(obj){
    if(!obj?.reward)return 'No bonus reward';
    return `${ICONS[obj.reward.type]||''} ${obj.reward.amount} ${obj.reward.type}`;
  }
  function progressText(obj=run()?.objective){
    if(!obj)return 'No bonus objective';
    return `${obj.label}: ${Math.min(obj.progress||0,obj.target)}/${obj.target}`;
  }
  function addHighlight(text){
    const r=run();
    if(!r||!text)return;
    r.highlights=r.highlights||[];
    if(r.highlights[r.highlights.length-1]!==text)r.highlights.push(text);
    r.highlights=r.highlights.slice(-8);
  }
  function ambienceFor(tile){
    const t=texture();
    const roomText=t.loot[tile?.type] || t.ambience[Math.abs(hashSeed(`${state.mapSeed}-${tile?.id||tile?.x}-${tile?.y}`))%t.ambience.length];
    return roomText;
  }
  function maybeAmbience(tile){
    const r=run();
    if(!r||!tile||tile.type==='base')return;
    r.visited=r.visited||{};
    if(r.visited[tile.id])return;
    r.visited[tile.id]=true;
    if((r.roomsVisited||0)%2===0 || ['rare','weapon','trader','event','boss'].includes(tile.type)){
      const text=tile.type==='trader'?texture().trader:ambienceFor(tile);
      addHighlight(text);
      if(Math.random()<.55 || ['rare','weapon','boss'].includes(tile.type))pushDialogue(`Field note: ${text}`);
    }
    r.roomsVisited=(r.roomsVisited||0)+1;
  }
  function objectiveValue(type){
    const obj=run()?.objective;
    if(!obj)return 0;
    if(obj.id==='sweep'&&type==='room')return 1;
    if(obj.id==='cache'&&type==='loot')return 1;
    if(obj.id==='contact'&&type==='contact')return 1;
    if(obj.id==='control'&&type==='kill')return 1;
    return 0;
  }
  function updateObjective(type,amount=1){
    const r=run(), obj=r?.objective;
    if(!obj||obj.complete)return;
    const gain=objectiveValue(type)*amount;
    if(!gain)return;
    obj.progress=Math.min(obj.target,(obj.progress||0)+gain);
    if(obj.progress>=obj.target)completeObjective();
  }
  function checkSampleObjective(){
    const obj=run()?.objective;
    if(!obj||obj.id!=='samples'||obj.complete)return;
    obj.progress=Math.min(obj.target,state.raidLoot?.[obj.resource]||0);
    if(obj.progress>=obj.target)completeObjective();
  }
  function completeObjective(){
    const r=run(), obj=r?.objective;
    if(!obj||obj.complete)return;
    obj.complete=true;
    const reward=obj.reward||{type:'food',amount:1};
    addRaidLoot(reward.type,reward.amount);
    addHighlight(`Bonus objective complete: ${obj.label}. Reward secured: ${rewardText(obj)}.`);
    log(`Bonus objective complete: ${obj.label}. Reward: ${rewardText(obj)}.`);
    state.encounterText=`Bonus objective complete: ${obj.label}.`;
  }

  const baseStart=startRaid;
  startRaid=function(){
    const wasRunning=state.running;
    baseStart();
    if(wasRunning||!state.running)return;
    state.v40=state.v40||{};
    state.v40.run={
      objective:pickObjective(),
      highlights:[],
      visited:{},
      roomsVisited:0,
      lootRooms:0,
      enemiesDefeated:0,
      contacts:0,
      startedAt:new Date().toISOString(),
    };
    const obj=run().objective;
    addHighlight(`${currentBiome().name} field task: ${obj.desc}`);
    log(`Field task: ${obj.label}. ${obj.desc} Bonus: ${rewardText(obj)}.`);
    state.encounterText=`Raid started. Field task: ${obj.label}.`;
    renderV40Panel();
  };

  const baseResolve=resolveTile;
  resolveTile=function(tile){
    if(tile&&!tile.cleared)maybeAmbience(tile);
    const beforeCleared=!!tile?.cleared;
    const beforeMode=state.mode;
    baseResolve(tile);
    if(tile&&!beforeCleared&&tile.cleared&&tile.type!=='base'){
      updateObjective('room',1);
    }
    if(beforeMode!=='choice'&&state.mode==='choice'){
      updateObjective('contact',1);
    }
  };

  const baseLoot=lootTile;
  lootTile=function(tile){
    const type=tile?.type;
    const room=tile?.roomName||type||'room';
    const before={...state.raidLoot};
    baseLoot(tile);
    if(tile?.cleared){
      const found=RESOURCES.filter(res=>res!=='ammo'&&(state.raidLoot[res]||0)>(before[res]||0)).map(res=>`${ICONS[res]} ${state.raidLoot[res]-before[res]}`).join(' ');
      const text=ambienceFor({type,id:tile.id,x:tile.x,y:tile.y});
      state.encounterText=`${room}: ${text} ${found?`Found ${found}.`:'Pack space was tight.'}`;
      addHighlight(`${room}: ${found||'searched clean'}`);
      updateObjective('loot',1);
      checkSampleObjective();
    }
  };

  if(typeof beginTraderChoice==='function'){
    const baseTrader=beginTraderChoice;
    beginTraderChoice=function(tile){
      addHighlight(texture().trader);
      updateObjective('contact',1);
      return baseTrader(tile);
    };
  }

  const baseWin=winCombat;
  winCombat=function(enemy){
    const wasBoss=!!enemy?.bossFight;
    const name=enemy?.name||'enemy';
    if(wasBoss&&run()){
      addHighlight(`${name} defeated on the boss floor.`);
      updateObjective('kill',1);
    }
    baseWin(enemy);
    const r=run();
    if(r&&!wasBoss){
      r.enemiesDefeated=(r.enemiesDefeated||0)+1;
      addHighlight(`${name} defeated.`);
      updateObjective('kill',1);
    }
  };

  const baseMake=makeRaidHistoryEntry;
  makeRaidHistoryEntry=function(success,bossClear=false,floorClear=false,lootBeforeBank={},newInjuries=[]){
    const snapshot=run()?JSON.parse(JSON.stringify(run())):null;
    baseMake(success,bossClear,floorClear,lootBeforeBank,newInjuries);
    const r=state.lastRaidSummary;
    if(r&&snapshot?.objective){
      r.fieldTask=`${snapshot.objective.label}: ${snapshot.objective.complete?'Complete':'Incomplete'} (${Math.min(snapshot.objective.progress||0,snapshot.objective.target)}/${snapshot.objective.target})`;
      r.fieldHighlights=(snapshot.highlights||[]).slice(-5);
    }
  };

  const baseShow=showRaidSummary;
  showRaidSummary=function(){
    baseShow();
    const r=state.lastRaidSummary;
    const root=$('raidSummary')?.querySelector('.raid-debrief-v38') || $('raidSummary');
    if(!r||!root||root.querySelector('.field-report-v40'))return;
    const highlights=(r.fieldHighlights||[]).map(item=>`<li>${esc(item)}</li>`).join('');
    root.insertAdjacentHTML('beforeend',`<section class="field-report-v40">
      <div><strong>Field Task</strong><span>${esc(r.fieldTask||'No field task recorded')}</span></div>
      <ul>${highlights||'<li>No field notes recorded.</li>'}</ul>
    </section>`);
  };

  const baseHistory=renderRaidHistory;
  renderRaidHistory=function(){
    baseHistory();
    $('raidHistory')?.querySelectorAll('.history-row').forEach((row,index)=>{
      const r=(state.raidHistory||[])[index];
      if(!r||row.querySelector('.field-task-v40'))return;
      row.insertAdjacentHTML('beforeend',`<span class="field-task-v40">${esc(r.fieldTask||'No field task')}</span>`);
    });
  };

  function renderV40Panel(){
    const mapPanel=document.querySelector('.dashboard-map-panel');
    if(!mapPanel)return;
    let card=mapPanel.querySelector('.field-task-card-v40');
    if(!card){
      card=document.createElement('div');
      card.className='field-task-card-v40';
      const map=$('map');
      mapPanel.insertBefore(card,map||mapPanel.lastChild);
    }
    const r=run(), obj=r?.objective;
    if(!state.running||!obj){
      card.innerHTML='<strong>Field Task</strong><span>Kennel standby. Start a raid to receive a local objective.</span>';
      card.classList.remove('complete');
      return;
    }
    card.classList.toggle('complete',!!obj.complete);
    card.innerHTML=`<div><strong>${esc(progressText(obj))}</strong><span>${esc(obj.desc)} Bonus: ${esc(rewardText(obj))}</span></div><small>${esc((r.highlights||[]).slice(-1)[0]||'No field notes yet.')}</small>`;
  }

  const baseRender=render;
  render=function(){
    baseRender();
    renderV40Panel();
  };

  function audit(){
    const objectiveIds=OBJECTIVE_TEMPLATES.map(o=>o.id);
    return {
      version:'v0.40',
      objectiveIds,
      biomeTexture:Object.keys(BIOME_TEXTURE),
      activeObjective:run()?.objective?.id||null,
      highlights:run()?.highlights?.length||0,
    };
  }

  window.gameplayV40={audit,progressText,texture};
  try{render();}catch(err){console.warn('v0.40 render refresh failed',err);}
})();
