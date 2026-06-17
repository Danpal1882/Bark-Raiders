(function(){
  const $=id=>document.getElementById(id);

  function ensureControls(){
    const tabs=document.querySelector('.top-tabs');
    if(!tabs||document.querySelector('.view-toggle-v41'))return;
    const wrap=document.createElement('div');
    wrap.className='view-toggle-v41';
    wrap.innerHTML=`
      <button id="raidFocusBtnV41" class="ghost" type="button">Raid Focus</button>
      <button id="raidDetailBtnV41" class="ghost" type="button">Loadout Detail</button>
    `;
    tabs.appendChild(wrap);
    $('raidFocusBtnV41')?.addEventListener('click',()=>setRaidFocus(true,true));
    $('raidDetailBtnV41')?.addEventListener('click',()=>setRaidFocus(false,true));
  }

  function onRaidTab(){
    return document.querySelector('.tab-btn.active')?.dataset?.tab==='raid';
  }

  function setRaidFocus(enabled,manual=false){
    state.v41=state.v41||{};
    if(manual)state.v41.manualRaidFocus=enabled;
    state.v41.raidFocus=!!enabled;
    document.body.classList.toggle('raid-focus-v41',!!enabled&&onRaidTab());
    $('raidFocusBtnV41')?.classList.toggle('active',!!enabled);
    $('raidDetailBtnV41')?.classList.toggle('active',!enabled);
  }

  function autoFocus(){
    state.v41=state.v41||{};
    if(state.v41.manualRaidFocus===undefined)state.v41.manualRaidFocus=true;
    setRaidFocus(onRaidTab()&&state.v41.manualRaidFocus,false);
  }

  function revealCombatSource(){
    const w=state.world;
    const enemy=w?.enemies?.find(item=>item.id===state.combat?.enemy?.sourceId);
    if(!w?.ready||!enemy)return false;
    const key=(x,y)=>`${x},${y}`;
    for(const actor of [w.dog,enemy]){
      for(let yy=Math.floor(actor.y)-4;yy<=Math.floor(actor.y)+4;yy++){
        for(let xx=Math.floor(actor.x)-4;xx<=Math.floor(actor.x)+4;xx++){
          if(Math.hypot(xx+.5-actor.x,yy+.5-actor.y)<=4.2)w.seen.add(key(xx,yy));
        }
      }
    }
    return true;
  }

  const baseSwitch=switchTab;
  switchTab=function(tab){
    baseSwitch(tab);
    autoFocus();
  };
  window.switchTab=switchTab;

  const baseStart=startRaid;
  startRaid=function(){
    baseStart();
    state.v41=state.v41||{};
    state.v41.manualRaidFocus=true;
    autoFocus();
  };

  const baseEnd=endRaid;
  endRaid=function(success,bossClear=false,floorClear=false){
    baseEnd(success,bossClear,floorClear);
    autoFocus();
  };

  const baseStartCombat=startCombat;
  startCombat=function(enemy,bossFight=false,sourceId=null){
    const result=baseStartCombat(enemy,bossFight,sourceId);
    revealCombatSource();
    if(state.combat?.enemy){
      state.encounterText=`Visible combat: ${state.dog.name} has line of contact with ${state.combat.enemy.name}. ${state.encounterText}`;
    }
    autoFocus();
    return result;
  };

  const baseFight=fightRound;
  fightRound=function(){
    revealCombatSource();
    baseFight();
    revealCombatSource();
  };

  const baseRender=render;
  render=function(){
    baseRender();
    ensureControls();
    autoFocus();
    const inCombat=!!state.combat;
    document.body.classList.toggle('combat-visible-v41',inCombat);
    if(inCombat&&$('combatState')&&state.combat?.enemy){
      $('combatState').title='Combatants are revealed through fog while fighting.';
    }
  };

  function audit(){
    return {
      version:'v0.41',
      raidFocus:document.body.classList.contains('raid-focus-v41'),
      combatVisibleClass:document.body.classList.contains('combat-visible-v41'),
      controls:!!document.querySelector('.view-toggle-v41'),
      worldAudit:window.worldV29?.audit?.()||null,
    };
  }

  window.gameplayV41={setRaidFocus,audit,revealCombatSource};
  ensureControls();
  autoFocus();
  try{render();}catch(err){console.warn('v0.41 render refresh failed',err);}
})();
