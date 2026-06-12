(function(){
  if(!window.worldV29) return;

  const baseFightRound=fightRound;
  fightRound=function(){
    if(!state.combat) return;
    const combatEnemy=state.combat.enemy;
    const enemy=state.world?.enemies?.find(item=>item.id===state.combat.enemy.sourceId);
    if(!enemy) return baseFightRound();

    const dog=state.world.dog;
    const dogWeapon=window.worldV29.weaponProfile();
    const enemyWeapon=window.worldV29.enemyProfile(enemy.template);
    let distance=Math.hypot(enemy.x-dog.x,enemy.y-dog.y);
    const notes=[];

    if(distance>dogWeapon.range){
      const step=Math.min(.9,distance-dogWeapon.range+.1);
      dog.x+=(enemy.x-dog.x)/distance*step;
      dog.y+=(enemy.y-dog.y)/distance*step;
      dog.facing=enemy.x<dog.x?-1:1;
      notes.push(`${state.dog.name} closes to firing range.`);
      distance=Math.hypot(enemy.x-dog.x,enemy.y-dog.y);
    }else{
      const shot=window.gearV32?.fireWeapon?.(combatEnemy);
      if(shot?.reload){
        notes.push(`${state.dog.name} reloads ${shot.weapon.name}.`);
      }else if(shot?.dry){
        notes.push(`${state.dog.name}'s weapon is dry.`);
      }else if(shot){
        if(shot.shots)window.worldV29.fireProjectile('dog');
        combatEnemy.hp-=shot.damage;
        notes.push(shot.hit?`${state.dog.name} lands ${shot.hits}/${shot.shots} shots for ${shot.damage}${shot.crit?' crit':''}.`:`${state.dog.name} misses with ${shot.weapon.name}.`);
      }else{
        const hasAmmo=state.dog.ammo>0;
        const crit=Math.random()*100<state.dog.crit;
        const outgoing=Math.max(1,state.dog.attack+(hasAmmo?3:0)-combatEnemy.def+(crit?6:0));
        if(hasAmmo){state.dog.ammo--;window.worldV29.fireProjectile('dog');}
        combatEnemy.hp-=outgoing;
        notes.push(`${state.dog.name} hits ${combatEnemy.name} for ${outgoing}${crit?' crit':''}.`);
      }
      if(combatEnemy.hp<=0){log(notes.join(' '));winCombat(combatEnemy);return;}
    }

    bossMechanic(combatEnemy,notes);
    distance=Math.hypot(enemy.x-dog.x,enemy.y-dog.y);
    if(distance>enemyWeapon.range){
      const step=Math.min(.75,distance-enemyWeapon.range+.1);
      enemy.x+=(dog.x-enemy.x)/distance*step;
      enemy.y+=(dog.y-enemy.y)/distance*step;
      enemy.facing=dog.x<enemy.x?-1:1;
      notes.push(`${combatEnemy.name} advances.`);
    }else{
      window.setTimeout(()=>window.worldV29.fireProjectile('enemy'),180);
      const dodgeChance=Math.min(28,state.dog.speed*4+(state.research.bossMap&&combatEnemy.bossFight?3:0));
      if(Math.random()*100<dodgeChance) notes.push(`${state.dog.name} dodges the shot.`);
      else{
        const raw=Math.max(1,combatEnemy.atk);
        const protectedHit=window.gearV32?.absorbDamage?.(raw,combatEnemy.penetration||enemyWeapon.penetration||0);
        const incoming=protectedHit?protectedHit.damage:Math.max(1,raw-state.dog.defence);
        state.dog.hp-=incoming;
        notes.push(`${combatEnemy.name} hits back for ${incoming}${protectedHit?.blocked?` (${protectedHit.blocked} blocked by ${protectedHit.piece.name})`:''}.`);
        enemyBehaviourHit(combatEnemy,notes);
      }
    }

    if(state.dog.hp>0&&state.dog.hp<=Math.ceil(state.dog.maxHp*.3)&&hasConsumable('medkit')){
      useConsumable('medkit');
      const heal=Math.ceil(state.dog.maxHp*.45);
      state.dog.hp=Math.min(state.dog.maxHp,state.dog.hp+heal);
      notes.push(`Emergency Medkit triggers for ${heal} HP.`);
    }
    if(state.dog.hp<=0){
      state.dog.hp=0;log(notes.join(' '));
      state.encounterText=`${state.dog.name} was beaten by ${combatEnemy.name} and retreated to the kennel.`;
      endRaid(false);return;
    }
    if(state.dog.hp<=Math.ceil(state.dog.maxHp*.35)&&state.raidLoot.medicine>0){
      state.raidLoot.medicine--;state.dog.carry=Math.max(0,state.dog.carry-1);
      state.dog.hp=Math.min(state.dog.maxHp,state.dog.hp+state.dog.medkitPower);
      notes.push(`${state.dog.name} uses a bandage for ${state.dog.medkitPower} HP.`);
    }
    state.encounterText=`Range ${distance.toFixed(1)} tiles. ${notes.join(' ')}`;
    log(notes.join(' '));
  };

  const baseRenderCombat=renderCombat;
  renderCombat=function(){
    baseRenderCombat();
    if(!state.combat||!state.world?.ready) return;
    const enemy=state.world.enemies.find(item=>item.id===state.combat.enemy.sourceId);
    if(!enemy) return;
    const distance=Math.hypot(enemy.x-state.world.dog.x,enemy.y-state.world.dog.y);
    const dogWeapon=window.worldV29.weaponProfile();
    $('combatState').textContent=`${dogWeapon.name} · ${distance.toFixed(1)} tiles`;
  };

  const baseRenderV31=render;
  render=function(){
    baseRenderV31();
    if(!String(state.dog.breed||'').includes('Shiba')) return;
    const active=state.mode==='combat'?'assets/sprites/shiba-v31/web/03.png':'assets/sprites/shiba-v31/web/01.png';
    if($('combatDogSprite')) $('combatDogSprite').src=active;
    if($('heroDogSprite')) $('heroDogSprite').src='assets/sprites/shiba-v31/web/01.png';
    if($('creatorPreviewSprite')&&String($('modalRaiderBreed')?.value||'shiba')==='shiba') $('creatorPreviewSprite').src='assets/sprites/shiba-v31/web/01.png';
  };
  render();
})();
