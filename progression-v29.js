(function(){
  const baseGenerateMap=generateMap;

  function terminalNode(){
    return state.map.find(room=>room.role==='boss' || room.role==='exit') || state.map[state.map.length-1];
  }

  function normalizeFloor(){
    const terminal=terminalNode();
    if(!terminal) return;

    if(isBossFloor()){
      state.currentBoss=state.currentBoss || chooseDungeonBoss();
      terminal.role='boss';
      terminal.type='boss';
      terminal.roomName=`${state.currentBoss.name}'s Den`;
      terminal.seen=!!state.research.bossMap;
    }else{
      state.currentBoss=null;
      terminal.role='exit';
      terminal.type='exit';
      terminal.roomName=`${currentBiome().name} Extraction`;
      terminal.seen=false;
    }

    terminal.cleared=false;
    terminal.locked=false;
    if(terminal.hazard==='locked') terminal.hazard=null;

    const entrance=state.map.find(room=>room.role==='entrance') || state.map[0];
    if(typeof validateDungeonGraph==='function'){
      state.mapValidation=validateDungeonGraph(state.map,entrance.id,terminal.id);
      state.mapValidation.terminalReachable=state.mapValidation.bossReachable;
    }
  }

  generateMap=function(seedOverride){
    baseGenerateMap(seedOverride);
    normalizeFloor();
  };

  window.progressionV29={
    normalize:normalizeFloor,
    audit(){
      const terminal=terminalNode();
      return {
        floor:currentFloor(),
        bossFloor:isBossFloor(),
        currentBoss:state.currentBoss?.name || null,
        terminalRole:terminal?.role || null,
        terminalType:terminal?.type || null,
        valid:!!state.mapValidation?.valid,
      };
    },
  };

  if(state.map?.length) normalizeFloor();
})();
