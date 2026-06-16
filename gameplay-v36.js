(function(){
  const $=id=>document.getElementById(id);
  const baseEnd=endRaid;
  function syncDispatchControls(){
    const values={zoneSelect:state.zoneId,floorSelect:state.floorId,planSelect:state.planId,dogSelect:state.dogId,contractSelect:state.contractId};
    Object.entries(values).forEach(([id,value])=>{const el=$(id);if(el)el.value=String(value);});
  }

  endRaid=function(success,bossClear=false,floorClear=false){
    const wasAuto=!!state.autoRaid;
    const key=biomeKey();
    const completedFloor=currentFloor();
    const completedObjective=!!success&&(!!floorClear||!!bossClear);
    const canAdvance=completedObjective&&completedFloor<10;

    if(wasAuto)state.autoRaid=false;
    baseEnd(success,bossClear,floorClear);
    state.autoRaid=wasAuto;

    if(!wasAuto)return;
    if(completedObjective){
      state.biomeFloors[key]=Math.max(Number(state.biomeFloors[key])||1,Math.min(10,completedFloor+1));
    }

    if(completedObjective&&completedFloor>=10){
      state.autoRaid=false;
      log('Auto-Raid route complete: floor 10 cleared.');
      save();render();
      return;
    }

    if(canAdvance){
      state.floorId=Math.min(completedFloor+1,maxUnlockedFloor(key));
      log(`Auto-Raid descending to ${floorLabel()}.`);
    }else if(!success){
      log(`Auto-Raid regrouping before retrying ${floorLabel()}.`);
    }
    save();render();
    syncDispatchControls();
    window.setTimeout(()=>{if(!state.running&&state.autoRaid){syncDispatchControls();startRaid();}},state.research.dogWhistle?500:1200);
  };

  const baseRender=render;
  render=function(){
    baseRender();
    const terminal=state.map?.find(room=>room.role==='exit'||room.role==='boss');
    const summary=$('mapSummary');
    if(summary&&state.running&&terminal){
      const objective=isBossFloor()?`Boss gate: ${state.currentBoss?.name||'locked'}`:`Exit: ${terminal.roomName}`;
      summary.title=objective;
    }
  };

  window.gameplayV36={
    floorChainAudit(){
      const terminal=state.map?.find(room=>room.role==='exit'||room.role==='boss');
      return {
        floor:currentFloor(),
        bossFloor:isBossFloor(),
        terminalType:terminal?.type||null,
        terminalRole:terminal?.role||null,
        autoRaid:!!state.autoRaid,
      };
    },
  };
  render();
})();
