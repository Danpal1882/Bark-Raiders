(function(){
  const $=id=>document.getElementById(id);
  const feedback={dogHits:0,enemyHits:0,misses:0,reloads:0,last:[]};

  function combatPanel(){
    return document.querySelector('.compact-combat') || document.querySelector('.combat-panel');
  }
  function ensureFxLayer(){
    const panel=combatPanel();
    if(!panel) return null;
    let layer=panel.querySelector('.combat-fx-layer[data-v46-layer="true"]');
    if(!layer){
      layer=document.createElement('div');
      layer.className='combat-fx-layer';
      layer.dataset.v46Layer='true';
      panel.appendChild(layer);
    }
    return layer;
  }
  function floatFx(text,type='hit',side='enemy'){
    const layer=ensureFxLayer();
    if(!layer||!text) return;
    const el=document.createElement('span');
    el.className=`combat-fx ${type} side-${side}`;
    el.textContent=text;
    el.style.left=side==='dog'?'28%':side==='enemy'?'72%':'50%';
    el.style.top=type==='reload'?'58%':'42%';
    layer.appendChild(el);
    window.setTimeout(()=>el.remove(),950);
    feedback.last.unshift({text,type,side,at:Date.now()});
    feedback.last=feedback.last.slice(0,8);
  }
  function flashCard(selector,cls){
    const card=document.querySelector(selector);
    if(!card) return;
    card.classList.remove('v46-hit','v46-shoot','v46-guard');
    void card.offsetWidth;
    card.classList.add(cls);
    window.setTimeout(()=>card.classList.remove(cls),420);
  }
  function revealCombatActors(){
    try{
      window.gameplayV41?.revealCombatSource?.();
      const w=window.worldV29?.state?.();
      const enemy=w?.enemies?.find(item=>item.id===state.combat?.enemy?.sourceId);
      if(enemy&&state.combat?.enemy){
        enemy.hitUntil=Math.max(enemy.hitUntil||0,performance.now()+140);
      }
    }catch{}
  }
  function feedbackFromDelta(before,after){
    if(!before||!after) return;
    const enemyDamage=Math.max(0,Math.round(before.enemyHp-after.enemyHp));
    const dogDamage=Math.max(0,Math.round(before.dogHp-after.dogHp));
    const ammoSpent=Math.max(0,before.ammo-after.ammo);
    const enemyGone=before.enemyHp>0 && (!state.combat || after.enemyHp<=0);

    if(enemyDamage>0||enemyGone){
      feedback.dogHits++;
      flashCard('.fighter-card.enemy','v46-hit');
      flashCard('.fighter-card.ally','v46-shoot');
      floatFx(enemyGone?'CLEARED':`-${enemyDamage}`,'crit','enemy');
    }else if(ammoSpent>0){
      feedback.misses++;
      flashCard('.fighter-card.ally','v46-shoot');
      floatFx('MISS','miss','enemy');
    }
    if(dogDamage>0){
      feedback.enemyHits++;
      flashCard('.fighter-card.ally','v46-hit');
      floatFx(`-${dogDamage}`,'danger','dog');
    }
    if(ammoSpent===0&&state.combat&&before.enemyHp===after.enemyHp){
      feedback.reloads++;
      floatFx('RELOAD / HOLD','reload','mid');
    }
    revealCombatActors();
  }

  const baseFight=fightRound;
  fightRound=function(){
    const before=state.combat?{
      enemyHp:state.combat.enemy.hp,
      dogHp:state.dog.hp,
      ammo:state.dog.ammo,
    }:null;
    baseFight();
    const after={
      enemyHp:state.combat?.enemy?.hp||0,
      dogHp:state.dog.hp,
      ammo:state.dog.ammo,
    };
    feedbackFromDelta(before,after);
  };

  const baseStart=startCombat;
  startCombat=function(enemy,bossFight=false,sourceId=null){
    const result=baseStart(enemy,bossFight,sourceId);
    revealCombatActors();
    if(state.combat?.enemy){
      floatFx(bossFight?'BOSS CONTACT':'CONTACT','reload','mid');
      document.body.classList.add('combat-feedback-v46');
    }
    return result;
  };

  const baseRender=render;
  render=function(){
    baseRender();
    ensureFxLayer();
    document.body.classList.toggle('combat-feedback-v46',!!state.combat);
  };

  function audit(){
    const w=window.worldV29?.audit?.()||null;
    return{
      version:'v0.46',
      feedback:{...feedback,last:[...feedback.last]},
      fxLayer:!!document.querySelector('.combat-fx-layer[data-v46-layer="true"]'),
      combatClass:document.body.classList.contains('combat-feedback-v46'),
      world:w?{
        dogOnFloor:w.dogOnFloor,
        cameraInBounds:w.cameraInBounds,
        directionsSeen:w.directionsSeen,
      }:null,
      shibaWalk:window.spriteV43?.DOGS?.shiba?.map?.down||null,
    };
  }

  window.gameplayV46={audit,floatFx};
  try{render();}catch(err){console.warn('v0.46 feedback refresh failed',err);}
})();
