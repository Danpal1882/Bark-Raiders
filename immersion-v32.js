(function(){
  const CHATTER={
    milo:['Fresh stock, mostly dry. Mostly.','Bulk goods cost less than funerals.','I heard the city blocks shifted again last night.'],
    patch:['Hold still. I have clean thread somewhere.','Armour stops holes. Medicine closes the rest.','Bring me medicine and I will keep your pack moving.'],
    bolt:['Recoil is a training problem. Broken parts are my problem.','I can repair anything that still has a serial number-shaped patch.','Long barrels for streets. Shotguns for corridors.'],
    rook:['Information weighs nothing and costs plenty.','The crows saw a boss patrol two floors up.','Unique gear always has a previous owner.'],
    hub:['Back already? The kettle is still warm.','Check your armour condition before dispatch.','A full magazine is not the same thing as a good plan.'],
  };
  function speak(id='hub'){
    const line=pick(CHATTER[id]||CHATTER.hub);
    state.dialogue=state.dialogue||[];state.dialogue.unshift(`${id==='hub'?'Kennel Quartermaster':id[0].toUpperCase()+id.slice(1)}: "${line}"`);
    state.dialogue=state.dialogue.slice(0,12);log(`💬 ${line}`);
  }

  const baseStartCombat=startCombat;
  startCombat=function(enemy,bossFight=false,sourceId=null){
    if(bossFight&&state.world?.ready&&!sourceId){
      const prop=state.world.props.find(item=>{const node=state.map.find(room=>room.id===item.roomId);return node?.type==='boss';});
      if(prop){
        sourceId=`boss-world-${state.seconds}`;
        const hp=Math.round(enemy.hp*(state.weather?.enemy||1)*currentPlan().enemy);
        state.world.enemies.push({id:sourceId,template:enemy,x:prop.x,y:prop.y,path:[],hp,maxHp:hp,active:true,facing:-1,think:99,poseUntil:0,hitUntil:0});
        state.roamEnemies.push({id:sourceId,template:enemy,sprite:enemy.sprite,name:enemy.name,hp,maxHp:hp,active:true});
      }
    }
    baseStartCombat(enemy,bossFight,sourceId);
    if(state.combat?.enemy){
      state.combat.enemy.penetration=bossFight?12+state.zoneId*4:4+state.zoneId*2;
      if(Math.random()<.5)pushDialogue(`${enemy.name}: "${pick(['Drop the pack and walk away.','Wrong room, kennel dog.','That gear will look better on me.','You picked a loud way to arrive.'])}"`);
    }
  };

  const baseBuyHub=buyHubOffer;
  buyHubOffer=function(index){baseBuyHub(index);if(Math.random()<.75)speak('hub');};
  const baseRenderHub=renderHubTrader;
  renderHubTrader=function(){
    baseRenderHub();
    const grid=$('hubTraderGrid');if(grid&&!grid.querySelector('.npc-chatter')){
      grid.insertAdjacentHTML('afterbegin',`<article class="upgrade npc-chatter"><strong>Kennel Quartermaster</strong><p>${pick(CHATTER.hub)}</p><button class="ghost" onclick="npcSpeakV32('hub')">Talk</button></article>`);
    }
  };
  window.npcSpeakV32=function(id){speak(id);save();render();};
  window.immersionV32={speak,CHATTER};
})();
