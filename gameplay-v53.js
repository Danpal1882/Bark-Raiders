(function(){
  const $=id=>document.getElementById(id);
  const metaKey='barkRaidersMetaV53';
  const charmName='Springy Long-Dog Charm';
  const charmDef={
    name:charmName,
    slot:'charm',
    rarity:'Unique',
    crit:7,
    rare:8,
    extract:10,
    visual:'spring-longdog',
    note:'A little pull-along spring dog from an old toy box. Somehow, it always stretches back to the kennel.',
  };

  function meta(){
    state.v53={found:false,sightings:0,lastLine:'',...(state.v53||{})};
    return state.v53;
  }

  function loadMeta(){
    try{
      const saved=JSON.parse(localStorage.getItem(metaKey)||'{}');
      state.v53={...meta(), ...(saved.v53||saved||{})};
    }catch{
      meta();
    }
  }

  function saveMeta(){
    try{localStorage.setItem(metaKey,JSON.stringify({v53:meta()}));}catch{}
  }

  function ownsCharm(){
    return (state.stash||[]).some(item=>item.name===charmName)
      || (state.equipmentInventory?.charm||[]).some(item=>item.name===charmName);
  }

  function awardCharm(autoEquip=false){
    const m=meta();
    if(ownsCharm()){
      m.found=true;
      saveMeta();
      return null;
    }
    let item=null;
    if(window.gearV32?.addItem){
      item=window.gearV32.addItem({...charmDef},autoEquip);
    }else{
      state.equipmentInventory.charm=state.equipmentInventory.charm||[];
      item={...charmDef,score:21};
      state.equipmentInventory.charm.push(item);
      if(autoEquip){
        state.equipment.charm={...item};
        try{applyUpgrades();}catch{}
      }
    }
    m.found=true;
    m.lastLine='A springy long-dog toy sproings out of the rubble and points back toward home.';
    saveMeta();
    if(typeof pushDialogue==='function') pushDialogue('Toy box whisper: "No raider gets left behind."');
    if(typeof log==='function') log(`Easter egg found: ${charmName}.`);
    return item;
  }

  function shouldSpringEvent(tile){
    if(meta().found || ownsCharm()) return false;
    const biome=typeof currentBiome==='function' ? currentBiome().name : '';
    const baseChance=biome==='Old Mall' ? .22 : .07;
    const typeBoost=tile?.type==='event' ? .06 : tile?.type==='rare' ? .08 : 0;
    return Math.random() < baseChance + typeBoost;
  }

  function springEvent(tile){
    meta().sightings++;
    meta().lastLine='A dusty toy box gives a tiny metallic boing.';
    saveMeta();
    state.mode='choice';
    state.activeEventTile=tile;
    state.pendingChoice={
      text:'A battered toy box rattles under the rubble. Inside is a cheerful spring-bodied long-dog toy, still trying very hard to follow someone home.',
      options:[
        {
          label:'Clip it to the collar',
          effect:()=>{
            awardCharm(true);
            addRaidLoot('fabric',2);
            state.threat=Math.max(0,state.threat-6);
            log('The springy long-dog charm bounces happily. The route home feels easier.');
          },
        },
        {
          label:'Boing it across the room',
          effect:()=>{
            awardCharm(false);
            addRaidLoot('metal',2);
            addRaidLoot('wood',2);
            state.threat=Math.max(0,state.threat-3);
            log('The toy sproings across the floor and knocks loose a stash.');
          },
        },
        {
          label:'Leave the toy box closed',
          effect:()=>{
            state.threat=Math.max(0,state.threat-4);
            log('Left the strange toy box alone. It gives one polite little boing behind you.');
          },
        },
      ],
    };
    state.encounterText='A strange toy box is waiting for a choice.';
    try{render();}catch{}
  }

  loadMeta();

  const baseBeginEventChoice=beginEventChoice;
  beginEventChoice=function(tile){
    if(shouldSpringEvent(tile)) return springEvent(tile);
    return baseBeginEventChoice(tile);
  };

  const baseLootTile=lootTile;
  lootTile=function(tile){
    const result=baseLootTile(tile);
    if(tile?.type==='rare' && shouldSpringEvent(tile)){
      awardCharm(false);
      state.encounterText=`A toy-box Easter egg was tucked into the cache: ${charmName}.`;
      try{render();}catch{}
    }
    return result;
  };

  const baseShow=showRaidSummary;
  showRaidSummary=function(){
    baseShow();
    const root=$('raidSummary')?.querySelector('.raid-debrief-v38') || $('raidSummary');
    if(root && meta().found && !root.querySelector('.spring-easter-v53')){
      root.insertAdjacentHTML('beforeend',`<section class="spring-easter-v53">
        <strong>Springy Long-Dog Found</strong>
        <span>The little toy-box charm is now in your gear stash. It boosts rare finds and safer extracts.</span>
      </section>`);
    }
  };

  const baseItemStats=window.itemStatsV32;
  if(baseItemStats){
    window.itemStatsV32=function(item){
      const base=baseItemStats(item);
      if(item?.slot!=='charm') return base;
      const stats=[];
      if(item.crit) stats.push(`${item.crit}% CRIT`);
      if(item.rare) stats.push(`${item.rare} RARE`);
      if(item.extract) stats.push(`${item.extract} EXTRACT`);
      return `${base}${stats.map(value=>`<span>${value}</span>`).join('')}`;
    };
  }

  window.gameplayV53={
    version:'v0.53',
    awardCharm,
    triggerSpringEvent:springEvent,
    audit(){
      return {
        version:'v0.53',
        found:!!meta().found || ownsCharm(),
        sightings:meta().sightings,
        ownsCharm:ownsCharm(),
        charm:(state.stash||[]).find(item=>item.name===charmName) || null,
      };
    }
  };
})();
