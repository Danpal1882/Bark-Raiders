(function(){
  const $=id=>document.getElementById(id);

  function terminalNode(){
    return state.map?.find(room=>room.role==='exit'||room.role==='boss'||room.type==='exit'||room.type==='boss');
  }
  function objectiveText(){
    if(!state.running)return 'Kennel standby';
    if(state.mode==='combat'&&state.combat?.enemy)return `Engage: ${state.combat.enemy.name}`;
    if(state.mode==='choice')return 'Decision needed';
    const terminal=terminalNode();
    if(isBossFloor())return `Find boss gate: ${state.currentBoss?.name||terminal?.roomName||'Unknown target'}`;
    return `Find floor exit: ${terminal?.roomName||'extraction route'}`;
  }
  function routeText(){
    const w=state.world;
    if(!w?.ready)return 'Map warming up';
    const total=w.props.filter(prop=>state.map.find(room=>room.id===prop.roomId)?.type!=='base').length;
    const alerts=w.enemies.reduce((acc,e)=>{if(e.active)acc[e.alert||'patrol']=(acc[e.alert||'patrol']||0)+1;return acc;},{});
    const danger=(alerts.engaging||0)+(alerts.investigating||0);
    const loot=`${w.searched}/${Math.max(1,total)} searched`;
    const hostiles=`${w.enemies.filter(e=>e.active).length} hostiles`;
    return danger?`${loot} · ${danger} alerted · ${hostiles}`:`${loot} · route quiet · ${hostiles}`;
  }
  function ensureFieldHud(){
    return $('mapSummary');
  }
  function updateFieldHud(){
    const hud=ensureFieldHud();
    if(!hud)return;
    hud.classList.toggle('danger-summary-v37',state.mode==='combat'||!!state.world?.enemies?.some(e=>e.active&&e.alert==='engaging'));
    hud.textContent=`${objectiveText()} · ${routeText()}`;
  }

  const baseStart=startRaid;
  startRaid=function(){
    baseStart();
    state.encounterText=`${state.dog.name} is sweeping lanes, watching patrols, and marking the route.`;
    updateFieldHud();
    requestAnimationFrame(updateFieldHud);
  };

  const baseStartCombat=startCombat;
  startCombat=function(enemy,bossFight=false,sourceId=null){
    const source=state.world?.enemies?.find(e=>e.id===sourceId);
    if(source){source.alert='engaging';source.awareness=100;source.poseUntil=performance.now()+650;}
    baseStartCombat(enemy,bossFight,sourceId);
    updateFieldHud();
  };

  const baseRender=render;
  render=function(){
    baseRender();
    updateFieldHud();
    requestAnimationFrame(updateFieldHud);
  };

  window.gameplayV37={objectiveText,routeText,updateFieldHud};
  window.setInterval(updateFieldHud,500);
  updateFieldHud();
})();
