(function(){
  const $=id=>document.getElementById(id);

  const DOGS={
    shiba:{label:'Shiba Inu',portrait:'assets/sprites/v34/dog/01.png',combat:'assets/sprites/v34/dog/06.png',map:{
      down:['assets/sprites/v36/dog/down/01.svg','assets/sprites/v36/dog/down/02.svg','assets/sprites/v36/dog/down/04.svg','assets/sprites/v36/dog/down/03.svg'],
      left:['assets/sprites/v36/dog/left/01.svg','assets/sprites/v36/dog/left/02.svg','assets/sprites/v36/dog/left/04.svg','assets/sprites/v36/dog/left/03.svg'],
      up:['assets/sprites/v36/dog/up/01.svg','assets/sprites/v36/dog/up/02.svg','assets/sprites/v36/dog/up/04.svg','assets/sprites/v36/dog/up/03.svg'],
      right:['assets/sprites/v36/dog/right/01.svg','assets/sprites/v36/dog/right/02.svg','assets/sprites/v36/dog/right/04.svg','assets/sprites/v36/dog/right/03.svg'],
    }},
    lab:{label:'Labrador',portrait:'assets/sprites/v34/breeds/lab/01.png',combat:'assets/sprites/v34/breeds/lab/04.png',map:['assets/sprites/v34/breeds/lab/01.png','assets/sprites/v34/breeds/lab/02.png','assets/sprites/v34/breeds/lab/03.png','assets/sprites/v34/breeds/lab/02.png']},
    jack:{label:'Jack Russell',portrait:'assets/sprites/v34/breeds/jack/01.png',combat:'assets/sprites/v34/breeds/jack/04.png',map:['assets/sprites/v34/breeds/jack/01.png','assets/sprites/v34/breeds/jack/02.png','assets/sprites/v34/breeds/jack/03.png','assets/sprites/v34/breeds/jack/02.png']},
    collie:{label:'Collie',portrait:'assets/sprites/v34/breeds/collie/01.png',combat:'assets/sprites/v34/breeds/collie/04.png',map:['assets/sprites/v34/breeds/collie/01.png','assets/sprites/v34/breeds/collie/02.png','assets/sprites/v34/breeds/collie/03.png','assets/sprites/v34/breeds/collie/02.png']},
    dachshund:{label:'Dachshund',portrait:'assets/sprites/v34/breeds/dachshund/01.png',combat:'assets/sprites/v34/breeds/dachshund/04.png',map:['assets/sprites/v34/breeds/dachshund/01.png','assets/sprites/v34/breeds/dachshund/02.png','assets/sprites/v34/breeds/dachshund/03.png','assets/sprites/v34/breeds/dachshund/02.png']},
    pom:{label:'Pomeranian',portrait:'assets/sprites/v34/breeds/pom/01.png',combat:'assets/sprites/v34/breeds/pom/04.png',map:['assets/sprites/v34/breeds/pom/01.png','assets/sprites/v34/breeds/pom/02.png','assets/sprites/v34/breeds/pom/03.png','assets/sprites/v34/breeds/pom/02.png']},
    bulldog:{label:'Bulldog',portrait:'assets/sprites/v34/breeds/bulldog/01.png',combat:'assets/sprites/v34/breeds/bulldog/04.png',map:['assets/sprites/v34/breeds/bulldog/01.png','assets/sprites/v34/breeds/bulldog/02.png','assets/sprites/v34/breeds/bulldog/03.png','assets/sprites/v34/breeds/bulldog/02.png']},
    greyhound:{label:'Greyhound',portrait:'assets/sprites/v34/breeds/greyhound/01.png',combat:'assets/sprites/v34/breeds/greyhound/04.png',map:['assets/sprites/v34/breeds/greyhound/01.png','assets/sprites/v34/breeds/greyhound/02.png','assets/sprites/v34/breeds/greyhound/03.png','assets/sprites/v34/breeds/greyhound/02.png']},
  };
  const ENEMIES={
    rat:{label:'Rat',portrait:'assets/sprites/v34/enemies/01-01.png',combat:'assets/sprites/v34/enemies/01-04.png',walk:['assets/sprites/v34/enemies/01-01.png','assets/sprites/v34/enemies/01-02.png','assets/sprites/v34/enemies/01-01.png','assets/sprites/v34/enemies/01-03.png'],hit:'assets/sprites/v34/enemies/01-06.png'},
    raccoon:{label:'Raccoon',portrait:'assets/sprites/v34/enemies/02-01.png',combat:'assets/sprites/v34/enemies/02-04.png',walk:['assets/sprites/v34/enemies/02-01.png','assets/sprites/v34/enemies/02-02.png','assets/sprites/v34/enemies/02-01.png','assets/sprites/v34/enemies/02-03.png'],hit:'assets/sprites/v34/enemies/02-06.png'},
    crow:{label:'Crow',portrait:'assets/sprites/v34/enemies/03-01.png',combat:'assets/sprites/v34/enemies/03-04.png',walk:['assets/sprites/v34/enemies/03-01.png','assets/sprites/v34/enemies/03-02.png','assets/sprites/v34/enemies/03-01.png','assets/sprites/v34/enemies/03-03.png'],hit:'assets/sprites/v34/enemies/03-06.png'},
    stray:{label:'Stray',portrait:'assets/sprites/v34/enemies/04-01.png',combat:'assets/sprites/v34/enemies/04-04.png',walk:['assets/sprites/v34/enemies/04-01.png','assets/sprites/v34/enemies/04-02.png','assets/sprites/v34/enemies/04-01.png','assets/sprites/v34/enemies/04-03.png'],hit:'assets/sprites/v34/enemies/04-06.png'},
  };

  function activeBreed(){
    return state.roster?.find(item=>item.id===state.dogId)?.breed || state.dogId || 'shiba';
  }
  function dogSet(breed=activeBreed()){
    return DOGS[breed]||DOGS.shiba;
  }
  function dogPortrait(breed=activeBreed(),mode='portrait'){
    const set=dogSet(breed);
    return mode==='combat' ? (set.combat||set.portrait) : set.portrait;
  }
  function dogMapFrame(breed=activeBreed(),direction='down',step=0){
    const set=dogSet(breed);
    if(Array.isArray(set.map))return set.map[step%set.map.length]||set.portrait;
    const frames=set.map?.[direction]||set.map?.down;
    return frames?.[step%frames.length]||set.portrait;
  }
  function enemyKind(enemy){
    const text=String(`${enemy?.sprite||''} ${enemy?.name||''} ${enemy?.template?.sprite||''} ${enemy?.template?.name||''}`).toLowerCase();
    if(text.includes('crow')||text.includes('baron')||text.includes('barnstorm'))return'crow';
    if(text.includes('raccoon')||text.includes('tyrant')||text.includes('mouldback')||text.includes('geargrinder'))return'raccoon';
    if(text.includes('stray')||text.includes('hound')||text.includes('dog')||text.includes('furnace')||text.includes('butcher'))return'stray';
    return'rat';
  }
  function enemySet(enemy){
    return ENEMIES[enemyKind(enemy)]||ENEMIES.rat;
  }
  function enemyPortrait(enemy,mode='portrait'){
    const set=enemySet(enemy);
    return mode==='combat' ? (set.combat||set.portrait) : set.portrait;
  }
  function enemyMapFrame(enemy,step=0,hit=false){
    const set=enemySet(enemy);
    if(hit)return set.hit||set.combat||set.portrait;
    return set.walk[step%set.walk.length]||set.portrait;
  }
  function setImg(id,src){
    const el=$(id);
    if(el&&src)el.src=src;
  }
  function currentRosterByName(name){
    return state.roster?.find(item=>item.name===name)||null;
  }
  function refreshDomSprites(){
    setImg('heroDogSprite',dogPortrait(activeBreed(),'portrait'));
    setImg('combatDogSprite',state.mode==='combat'?dogPortrait(activeBreed(),'combat'):dogPortrait(activeBreed(),'portrait'));
    if($('creatorPreviewSprite')){
      const breed=$('modalRaiderBreed')?.value||activeBreed();
      $('creatorPreviewSprite').src=dogPortrait(breed,'portrait');
    }
    document.querySelectorAll('img.mini-dog').forEach(img=>{
      const roster=currentRosterByName(img.alt);
      if(roster)img.src=dogPortrait(roster.breed,'portrait');
    });
    if(state.combat?.enemy)setImg('enemySprite',enemyPortrait(state.combat.enemy,'combat'));
  }
  function markSpriteCards(){
    document.querySelectorAll('.fighter-card').forEach(card=>card.dataset.spriteResolver='v43');
  }

  const api={DOGS,ENEMIES,activeBreed,dogSet,dogPortrait,dogMapFrame,enemyKind,enemySet,enemyPortrait,enemyMapFrame,refreshDomSprites};
  window.spriteV43=api;

  const baseRender=render;
  render=function(){
    baseRender();
    refreshDomSprites();
    markSpriteCards();
  };

  const baseRenderCombat=renderCombat;
  renderCombat=function(){
    baseRenderCombat();
    refreshDomSprites();
    markSpriteCards();
  };

  const baseStart=startCombat;
  startCombat=function(enemy,bossFight=false,sourceId=null){
    const result=baseStart(enemy,bossFight,sourceId);
    refreshDomSprites();
    return result;
  };

  function audit(){
    return {
      version:'v0.43',
      activeBreed:activeBreed(),
      dogPortrait:dogPortrait(),
      dogCombat:dogPortrait(activeBreed(),'combat'),
      enemyPortrait:state.combat?.enemy?enemyPortrait(state.combat.enemy,'combat'):null,
      oldVisibleSprites:[...document.querySelectorAll('img')].filter(img=>/(raider|bandit|boss)\\.svg$/i.test(img.getAttribute('src')||'')).map(img=>img.getAttribute('src')),
      markedCards:document.querySelectorAll('.fighter-card[data-sprite-resolver="v43"]').length,
    };
  }
  window.gameplayV43={audit,refreshDomSprites};
  try{render();}catch(err){console.warn('v0.43 render refresh failed',err);}
})();
