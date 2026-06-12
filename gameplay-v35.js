(function(){
  const $=id=>document.getElementById(id);
  const clampValue=(value,min,max)=>Math.max(min,Math.min(max,value));
  const saved=()=>{try{return JSON.parse(localStorage.getItem('barkRaidersSaveV9')||'{}');}catch{return{};}};
  const v35=saved().v35||{sound:true};

  function toast(title,text,kind='reward'){
    let stack=$('gameToastStackV35');
    if(!stack){stack=document.createElement('div');stack.id='gameToastStackV35';stack.className='game-toast-stack';document.body.appendChild(stack);}
    const card=document.createElement('div');
    card.className=`game-toast v35-toast ${kind}`;
    card.innerHTML=`<strong>${title}</strong><span>${text}</span>`;
    stack.appendChild(card);
    setTimeout(()=>card.remove(),3000);
  }

  let audioContext=null;
  function tone(frequency=280,duration=.08,type='square',volume=.025,slide=0){
    if(!v35.sound)return;
    try{
      audioContext=audioContext||new (window.AudioContext||window.webkitAudioContext)();
      const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime;
      oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,now);
      if(slide)oscillator.frequency.exponentialRampToValueAtTime(Math.max(30,frequency+slide),now+duration);
      gain.gain.setValueAtTime(volume,now);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
      oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(now);oscillator.stop(now+duration);
    }catch{}
  }
  document.addEventListener('pointerdown',()=>{if(audioContext?.state==='suspended')audioContext.resume();},{passive:true});

  function snapshotLoot(){
    return Object.fromEntries(RESOURCES.map(key=>[key,key==='ammo'?state.dog.ammo:(state.raidLoot[key]||0)]));
  }
  function lootDelta(before){
    return RESOURCES.map(key=>[key,(key==='ammo'?state.dog.ammo:(state.raidLoot[key]||0))-(before[key]||0)]).filter(([,amount])=>amount>0);
  }

  const baseApply=applyUpgrades;
  applyUpgrades=function(){
    baseApply();
    state.dog.ammoMax+=4;
  };

  const baseStart=startRaid;
  startRaid=function(){
    const reserve=Math.max(0,18-(state.resources.ammo||0));
    if(reserve){
      const issued=Math.min(6,reserve);
      state.resources.ammo=(state.resources.ammo||0)+issued;
      log(`Kennel reserve issued ${issued} emergency rounds.`);
    }
    baseStart();
    tone(180,.1,'sawtooth',.018,120);
    setTimeout(()=>tone(310,.12,'triangle',.018,90),85);
  };

  const baseLoot=lootTile;
  lootTile=function(tile){
    const before=snapshotLoot(),label=tile.roomName||tile.type;
    baseLoot(tile);
    const found=lootDelta(before);
    if(found.length){
      const text=found.slice(0,4).map(([key,amount])=>`+${amount} ${key}`).join(' · ');
      toast('Cache searched',text,found.some(([key])=>key==='gunParts'||key==='medicine')?'victory':'reward');
      tone(found.some(([key])=>key==='gunParts')?520:390,.08,'triangle',.022,100);
      $('map')?.classList.add('loot-open-v35');
      setTimeout(()=>$('map')?.classList.remove('loot-open-v35'),420);
    }else toast('Cache searched',`${label}: nothing useful fit in the pack.`,'muted');
  };

  window.tacticalRetreatV35=function(){
    if(!state.running||state.mode!=='combat')return false;
    const hpRatio=state.dog.hp/Math.max(1,state.dog.maxHp);
    const enemyRatio=state.combat.enemy.hp/Math.max(1,state.combat.enemy.maxHp);
    const chance=clampValue(extractChance()+8+state.dog.speed*3+(hpRatio>.5?5:0)-(enemyRatio>.7?7:0),30,96);
    state.encounterText=`${state.dog.name} uses cover to break contact. Extraction safety: ${chance}%.`;
    log(`Tactical retreat rolled against ${chance}% safety.`);
    tone(145,.16,'sawtooth',.025,-55);
    endRaid(Math.random()*100<chance);
    return true;
  };

  const baseFight=fightRound;
  fightRound=function(){
    const combat=state.combat;
    if(!combat)return baseFight();
    const hpBefore=state.dog.hp,enemyBefore=combat.enemy.hp,ammoBefore=state.dog.ammo;
    baseFight();
    if(state.dog.hp<hpBefore){tone(115,.11,'sawtooth',.035,-35);document.body.classList.add('player-hit-v35');setTimeout(()=>document.body.classList.remove('player-hit-v35'),180);}
    else if(state.combat&&state.combat.enemy.hp<enemyBefore)tone(ammoBefore-state.dog.ammo>1?210:260,.06,'square',.018,-45);
    if(state.combat&&state.dog.hp<=Math.ceil(state.dog.maxHp*.3)&&state.dog.ammo<=2&&!state.combat.v35Warned){
      state.combat.v35Warned=true;
      toast('Break contact advised',`${state.dog.hp} HP and ${state.dog.ammo} rounds remain.`,'danger');
      tone(180,.1,'square',.02,-60);
    }
  };

  const baseWin=winCombat;
  winCombat=function(enemy){
    const boss=enemy.bossFight,name=enemy.name;
    baseWin(enemy);
    tone(boss?620:470,.12,'triangle',.025,160);
    if(boss)setTimeout(()=>tone(880,.18,'triangle',.022,120),110);
    toast(boss?'Unique target eliminated':'Hostile cleared',boss?`${name} dropped a themed reward.`:`${state.dog.name} can resume scavenging.`,'victory');
  };

  function activeDog(){
    return state.roster?.find(dog=>dog.id===state.dogId)||state.roster?.[0];
  }
  function breedArt(dog){
    const breed=dog?.breed||'shiba';
    return breed==='shiba'?'assets/sprites/v34/dog/01.png':`assets/sprites/v34/breeds/${breed}/01.png`;
  }
  function gearSummary(item,fallback){
    if(!item)return`<span class="empty">${fallback}</span>`;
    const durability=item.durabilityMax?` · ${item.durability}/${item.durabilityMax}`:'';
    return `<strong>${item.name}</strong><span>${item.rarity||'Common'}${durability}</span>`;
  }
  function renderLoadoutPortrait(){
    const roster=$('rosterPanel'),dog=activeDog();
    if(!roster||!dog||!window.gearV32)return;
    let panel=$('loadoutPortraitV35');
    if(!panel){panel=document.createElement('section');panel.id='loadoutPortraitV35';panel.className='loadout-portrait-v35';roster.insertAdjacentElement('afterend',panel);}
    const weapon=gearV32.activeWeapon(),helmet=gearV32.equipped('helmet'),body=gearV32.equipped('armour'),pack=gearV32.equipped('backpack');
    panel.innerHTML=`<div class="loadout-portrait-heading"><div><strong>Field Loadout</strong><span>Equipment currently visible in ${dog.name}'s raid profile.</span></div><span class="idle-badge">READY</span></div>
      <div class="loadout-portrait-body">
        <div class="dog-loadout-stage ${body?'armoured':''} ${helmet?'helmeted':''}">
          <div class="kennel-spotlight"></div><img src="${breedArt(dog)}" alt="${dog.name} in field gear">
          <span class="field-ready-label">FIELD READY</span>
        </div>
        <div class="loadout-slot-list">
          <article><small>Weapon</small>${gearSummary(weapon,'No weapon')}</article>
          <article><small>Helmet</small>${gearSummary(helmet,'No helmet')}</article>
          <article><small>Body</small>${gearSummary(body,'No body armour')}</article>
          <article><small>Pack</small>${gearSummary(pack,'No pack')}</article>
        </div>
      </div>`;
  }

  function renderCombatControls(){
    const panel=document.querySelector('.compact-combat'),enemy=state.combat?.enemy;
    if(!panel)return;
    let controls=$('combatControlsV35');
    if(!controls){controls=document.createElement('div');controls.id='combatControlsV35';controls.className='combat-controls-v35';panel.appendChild(controls);}
    if(!enemy){controls.innerHTML='';controls.classList.add('hidden');return;}
    const danger=state.dog.hp<=Math.ceil(state.dog.maxHp*.35)||state.dog.ammo<=2;
    const weapon=gearV32?.activeWeapon?.();
    controls.classList.remove('hidden');
    controls.innerHTML=`<div class="combat-readout ${danger?'danger':''}"><span>${weapon?.name||state.equipment.weapon.name}</span><strong>${state.dog.ammo} rounds · ${Math.max(0,enemy.hp)} target HP</strong></div>
      <button class="ghost retreat-button-v35" onclick="tacticalRetreatV35()">Break Contact</button>`;
  }

  function renderSoundSetting(){
    const settings=document.querySelector('.settings-grid');
    if(!settings||$('soundToggleV35'))return;
    const row=document.createElement('label');row.className='setting-row';row.innerHTML=`<span>Combat sounds</span><input id="soundToggleV35" type="checkbox" ${v35.sound?'checked':''}>`;settings.appendChild(row);
    $('soundToggleV35').addEventListener('change',event=>{v35.sound=event.target.checked;save();});
  }

  const baseSave=save;
  save=function(){
    baseSave();
    const data=saved();data.v35=v35;localStorage.setItem('barkRaidersSaveV9',JSON.stringify(data));
  };
  const baseRender=render;
  render=function(){
    baseRender();
    renderLoadoutPortrait();
    renderCombatControls();
    renderSoundSetting();
    document.body.classList.toggle('combat-danger-v35',!!state.combat&&(state.dog.hp<=state.dog.maxHp*.35||state.dog.ammo<=2));
  };

  applyUpgrades();
  render();
  window.gameplayV35={tacticalRetreat:tacticalRetreatV35,renderLoadoutPortrait};
})();
