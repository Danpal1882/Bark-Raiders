(function(){
  const $=id=>document.getElementById(id);
  const baseApply=applyUpgrades;
  applyUpgrades=function(){
    baseApply();
    state.dog.ammoMax+=8;
  };

  const baseStart=startRaid;
  startRaid=function(){
    if(state.resources.ammo<12)state.resources.ammo=Math.min(12,state.resources.ammo+4);
    baseStart();
  };

  const baseLoot=lootTile;
  lootTile=function(tile){
    const lowAmmo=state.dog.ammo<=Math.ceil(state.dog.ammoMax*.4);
    baseLoot(tile);
    if(['crate','weapon','rare','scrap'].includes(tile.type)&&(lowAmmo||Math.random()<.38)){
      const amount=tile.type==='weapon'||tile.type==='rare'?4+rand(5):2+rand(4);
      const gained=addRaidLoot('ammo',amount);
      if(gained){
        state.encounterText+=` Ammo cache: ${gained}.`;
        log(`${state.dog.name} found ${gained} emergency ammo.`);
      }
    }
  };

  window.retreatFromCombatV34=function(reason='Out of ammunition'){
    if(!state.running||state.mode!=='combat')return false;
    const chance=clamp(extractChance()+12+state.dog.speed*3,45,98);
    const success=Math.random()*100<chance;
    state.encounterText=`${reason}. ${state.dog.name} breaks contact and heads for extraction.`;
    log(`${state.dog.name} retreats from combat at ${chance}% extraction safety.`);
    endRaid(success);
    return true;
  };

  const baseFight=fightRound;
  fightRound=function(){
    if(state.mode==='combat'&&state.dog.ammo<=0){
      retreatFromCombatV34();
      return;
    }
    baseFight();
  };

  function upgradeArt(){
    const files=[
      'assets/sprites/v34/loot/03-01.png','assets/sprites/v34/loot/03-02.png',
      'assets/sprites/v34/loot/03-03.png','assets/sprites/v34/loot/03-04.png',
      'assets/sprites/v34/loot/03-05.png','assets/sprites/v34/loot/03-06.png',
    ];
    document.querySelectorAll('#kennelBase .station').forEach((card,index)=>{
      if(card.querySelector('.station-art-v34'))return;
      const image=document.createElement('img');
      image.className='station-art-v34';
      image.src=files[index%files.length];
      image.alt='';
      card.prepend(image);
      card.querySelector('.station-icon')?.classList.add('hidden');
    });
  }
  function breedIdle(key){
    if(key==='shiba')return'assets/sprites/v34/dog/01.png';
    return `assets/sprites/v34/breeds/${key}/01.png`;
  }
  function refreshDogArt(){
    const current=state.roster?.find(item=>item.id===state.dogId);
    if(current&&$('heroDogSprite'))$('heroDogSprite').src=breedIdle(current.breed);
    document.querySelectorAll('#rosterPanel .mini-dog').forEach((image,index)=>{
      const dog=state.roster?.[index];
      if(dog)image.src=breedIdle(dog.breed);
    });
    const previewBreed=$('modalRaiderBreed')?.value;
    if(previewBreed&&$('creatorPreviewSprite'))$('creatorPreviewSprite').src=breedIdle(previewBreed);
    if(state.combat?.enemy&&$('enemySprite')){
      const name=String(state.combat.enemy.name||'').toLowerCase();
      const row=name.includes('crow')?'03':name.includes('raccoon')||name.includes('tyrant')?'02':name.includes('hound')||name.includes('stray')||name.includes('dog')?'04':'01';
      $('enemySprite').src=`assets/sprites/v34/enemies/${row}-01.png`;
    }
  }

  const baseRender=render;
  render=function(){
    baseRender();
    upgradeArt();
    refreshDogArt();
    if($('ammoText')&&state.running&&state.dog.ammo<=Math.ceil(state.dog.ammoMax*.2)){
      $('ammoText').classList.add('low-ammo-v34');
    }else $('ammoText')?.classList.remove('low-ammo-v34');
  };

  applyUpgrades();
  render();
  window.gameplayV34={retreat:retreatFromCombatV34};
})();
