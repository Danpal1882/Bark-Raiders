(function(){
  const $=id=>document.getElementById(id);

  const BREED_PORTRAITS={
    shiba:'assets/sprites/v34/dog/01.png',
    lab:'assets/sprites/v34/breeds/lab/01.png',
    jack:'assets/sprites/v34/breeds/jack/01.png',
    collie:'assets/sprites/v34/breeds/collie/01.png',
    dachshund:'assets/sprites/v34/breeds/dachshund/01.png',
    pom:'assets/sprites/v34/breeds/pom/01.png',
    bulldog:'assets/sprites/v34/breeds/bulldog/01.png',
    greyhound:'assets/sprites/v34/breeds/greyhound/01.png',
  };
  const ENEMY_PORTRAITS={
    rat:'assets/sprites/v34/enemies/01-01.png',
    raccoon:'assets/sprites/v34/enemies/02-01.png',
    crow:'assets/sprites/v34/enemies/03-01.png',
    stray:'assets/sprites/v34/enemies/04-01.png',
  };

  function activeBreed(){
    const rosterDog=state.roster?.find(item=>item.id===state.dogId);
    return rosterDog?.breed||state.dogId||'shiba';
  }
  function dogPortrait(){
    return BREED_PORTRAITS[activeBreed()]||BREED_PORTRAITS.shiba;
  }
  function enemyKind(enemy){
    const text=String(`${enemy?.sprite||''} ${enemy?.name||''} ${enemy?.template?.sprite||''} ${enemy?.template?.name||''}`).toLowerCase();
    if(text.includes('crow')||text.includes('baron')||text.includes('barnstorm'))return'crow';
    if(text.includes('raccoon')||text.includes('tyrant')||text.includes('mouldback')||text.includes('geargrinder'))return'raccoon';
    if(text.includes('stray')||text.includes('hound')||text.includes('dog')||text.includes('furnace')||text.includes('butcher'))return'stray';
    return'rat';
  }
  function enemyPortrait(enemy){
    return ENEMY_PORTRAITS[enemyKind(enemy)];
  }
  function worldEnemy(){
    return state.world?.enemies?.find(item=>item.id===state.combat?.enemy?.sourceId);
  }
  function syncCombatFromWorld(){
    const e=worldEnemy();
    if(!e||!state.combat?.enemy)return null;
    state.combat.enemy.maxHp=e.maxHp||state.combat.enemy.maxHp;
    state.combat.enemy.hp=Math.min(state.combat.enemy.hp,state.combat.enemy.maxHp);
    if(e.hp<state.combat.enemy.hp)state.combat.enemy.hp=e.hp;
    return e;
  }
  function syncWorldFromCombat(){
    const e=worldEnemy();
    if(!e||!state.combat?.enemy)return null;
    e.maxHp=state.combat.enemy.maxHp||e.maxHp;
    e.hp=clamp(state.combat.enemy.hp,0,e.maxHp||state.combat.enemy.maxHp||1);
    const source=state.roamEnemies?.find(item=>item.id===e.id);
    if(source){
      source.hp=e.hp;
      source.maxHp=e.maxHp;
      source.active=e.active;
    }
    return e;
  }

  const baseStartCombat=startCombat;
  startCombat=function(enemy,bossFight=false,sourceId=null){
    const result=baseStartCombat(enemy,bossFight,sourceId);
    const e=syncCombatFromWorld();
    if(e&&state.combat?.enemy){
      state.combat.enemy.sprite=enemyPortrait(e.template||state.combat.enemy);
      state.encounterText=`Visible combat: ${state.dog.name} engages ${state.combat.enemy.name}. Damage is now tracked on the map and combat card.`;
    }
    return result;
  };

  const baseFight=fightRound;
  fightRound=function(){
    if(state.combat?.enemy?.sourceId)syncCombatFromWorld();
    baseFight();
    const e=syncWorldFromCombat();
    if(e&&state.combat?.enemy&&state.combat.enemy.hp<=0){
      e.hp=0;
      e.active=false;
      const source=state.roamEnemies?.find(item=>item.id===e.id);
      if(source){source.hp=0;source.active=false;}
    }
  };

  const baseWin=winCombat;
  winCombat=function(enemy){
    const e=worldEnemy();
    if(e){
      e.hp=0;
      e.active=false;
      const source=state.roamEnemies?.find(item=>item.id===e.id);
      if(source){source.hp=0;source.active=false;}
    }
    baseWin(enemy);
  };

  const baseRenderCombat=renderCombat;
  renderCombat=function(){
    baseRenderCombat();
    if($('combatDogSprite'))$('combatDogSprite').src=dogPortrait();
    if($('heroDogSprite'))$('heroDogSprite').src=dogPortrait();
    if(state.combat?.enemy){
      const e=worldEnemy();
      if(e)syncWorldFromCombat();
      const portrait=enemyPortrait(e?.template||state.combat.enemy);
      if($('enemySprite'))$('enemySprite').src=portrait;
      if(e&&$('enemyHpText')){
        $('enemyHpText').textContent=`${Math.max(0,Math.round(e.hp))} / ${e.maxHp} HP`;
        $('enemyHpBar').style.width=`${clamp(e.hp/e.maxHp*100,0,100)}%`;
      }
    }
  };

  const baseRender=render;
  render=function(){
    baseRender();
    if($('combatDogSprite'))$('combatDogSprite').src=dogPortrait();
    if($('heroDogSprite'))$('heroDogSprite').src=dogPortrait();
  };

  function audit(){
    const e=worldEnemy();
    return {
      version:'v0.42',
      dogPortrait:dogPortrait(),
      enemyPortrait:state.combat?.enemy?enemyPortrait(e?.template||state.combat.enemy):null,
      combatHp:state.combat?.enemy?.hp??null,
      worldHp:e?.hp??null,
      worldActive:e?.active??null,
    };
  }

  window.gameplayV42={audit,dogPortrait,enemyPortrait,syncCombatFromWorld,syncWorldFromCombat};
  try{render();}catch(err){console.warn('v0.42 render refresh failed',err);}
})();
