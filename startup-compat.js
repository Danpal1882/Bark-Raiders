(function(){
  window.fmt = window.fmt || function(seconds){
    const total=Math.max(0,Math.floor(Number(seconds)||0));
    return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
  };

  function ensureExpeditionState(){
    state.biomeFloors = {
      city:1,
      sewer:1,
      factory:1,
      farmland:1,
      ...(state.biomeFloors || {}),
    };
    state.floorId = Number(state.floorId) || 1;
    state.injuries = Array.isArray(state.injuries) ? state.injuries : [];
    state.dialogue = Array.isArray(state.dialogue) ? state.dialogue : [];
  }

  window.biomeKey = function(){
    const keys = Object.keys(BIOMES);
    return keys[state.zoneId % keys.length] || keys[0] || 'city';
  };

  window.maxUnlockedFloor = function(key){
    ensureExpeditionState();
    const floor = Number(state.biomeFloors[key || biomeKey()]) || 1;
    return Math.max(1, Math.min(10, floor));
  };

  window.currentFloor = function(){
    ensureExpeditionState();
    return Math.max(1, Math.min(maxUnlockedFloor(), Number(state.floorId) || 1));
  };

  window.isBossFloor = function(floor){
    return [3, 6, 10].includes(Number(floor ?? currentFloor()));
  };

  window.floorLabel = function(){
    return `${currentBiome().name} Floor ${currentFloor()}`;
  };

  window.pushDialogue = function(line){
    ensureExpeditionState();
    if(!line) return;
    state.dialogue.unshift(String(line));
    state.dialogue = state.dialogue.slice(0, 8);
  };
})();
