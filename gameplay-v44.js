(function(){
  const $=id=>document.getElementById(id);

  const BREED_BALANCE={
    shiba:{hp:4,attack:1,defence:1,crit:3,speed:0,carry:2,scout:0,rare:0,extract:2,heal:0},
    jack:{hp:0,attack:3,defence:0,crit:5,speed:1,carry:0,scout:0,rare:0,extract:0,heal:0},
    collie:{hp:2,attack:0,defence:0,crit:2,speed:1,carry:2,scout:1,rare:0,extract:6,heal:0},
    dachshund:{hp:0,attack:0,defence:1,crit:2,speed:0,carry:5,scout:0,rare:4,extract:6,heal:0},
    pom:{hp:-2,attack:0,defence:0,crit:6,speed:1,carry:0,scout:0,rare:7,extract:2,heal:0},
    bulldog:{hp:8,attack:1,defence:2,crit:0,speed:-1,carry:5,scout:0,rare:0,extract:0,heal:0},
    lab:{hp:6,attack:0,defence:1,crit:0,speed:0,carry:2,scout:0,rare:0,extract:2,heal:4},
    greyhound:{hp:-4,attack:0,defence:-1,crit:3,speed:2,carry:0,scout:1,rare:0,extract:6,heal:0},
  };

  const CLASS_RULES={
    pistol:{burst:1,accuracy:2,damage:.96},
    'machine pistol':{burst:2,accuracy:-5,damage:.78},
    smg:{burst:2,accuracy:-3,damage:.82},
    shotgun:{burst:1,accuracy:-7,damage:1.08,closeBonus:1.12},
    rifle:{burst:1,accuracy:0,damage:1},
    'machine gun':{burst:3,accuracy:-8,damage:.74},
  };

  function activeWeapon(){
    return window.gearV32?.activeWeapon?.() || state.equipment?.weapon || null;
  }
  function condition(item){
    return window.gearV32?.condition?.(item) ?? 1;
  }
  function weaponPower(item=activeWeapon()){
    if(!item) return state.dog?.attack || 0;
    const damage=item.damage || Math.max(8,(item.attack||0)*2.2);
    const penetration=item.penetration || 0;
    const fireRate=item.fireRate || 2.5;
    const recoil=item.recoil || 28;
    return Math.round((damage*.8)+(penetration*.12)+(fireRate*.55)-Math.max(0,recoil-35)*.05);
  }
  function weaponAttackBonus(item=activeWeapon()){
    if(!item) return 0;
    const damage=item.damage || Math.max(8,(item.attack||0)*2.2);
    const penetration=item.penetration || 0;
    return Math.max(1,Math.round((damage*.46+penetration*.055)*condition(item)));
  }
  function armourDefenceBonus(){
    const body=window.gearV32?.equipped?.('armour');
    const helmet=window.gearV32?.equipped?.('helmet');
    if(body||helmet){
      const bodyArmour=(body?.armour||0)*condition(body);
      const helmetArmour=(helmet?.armour||0)*condition(helmet);
      return Math.round((bodyArmour+helmetArmour)*.6);
    }
    return state.equipment?.armour?.defence || 0;
  }
  function reconcileVisibleStats(){
    if(!state?.dog) return;
    const weapon=activeWeapon();
    if(state.equipment?.weapon && weapon?.damage){
      state.equipment.weapon.attack=weaponAttackBonus(weapon);
      state.equipment.weapon.power=weaponPower(weapon);
    }
    if(state.equipment?.armour){
      state.equipment.armour.defence=armourDefenceBonus();
    }
    if(weapon?.damage){
      const levelBonus=Math.floor((state.dog.level-1)*1.5);
      const breedAttack=(currentDogDef?.().attack)||0;
      state.dog.attack=state.dog.attackBase+levelBonus+breedAttack+weaponAttackBonus(weapon);
    }
    if(state.equipment?.armour){
      const levelDefence=Math.floor((state.dog.level-1)/3);
      const breedDefence=(currentDogDef?.().defence)||0;
      state.dog.defence=state.dog.defenceBase+levelDefence+breedDefence+armourDefenceBonus();
      if(state.research?.paddedHarness) state.dog.defence+=1;
    }
  }

  if(window.BREEDS_V23){
    Object.entries(BREED_BALANCE).forEach(([key,stats])=>{
      if(window.BREEDS_V23[key]) Object.assign(window.BREEDS_V23[key],stats);
    });
  }

  const baseApply=applyUpgrades;
  applyUpgrades=function(){
    baseApply();
    reconcileVisibleStats();
  };

  const baseCompute=computeRaidStats;
  computeRaidStats=function(){
    baseCompute();
    reconcileVisibleStats();
  };

  const baseBossMechanic=bossMechanic;
  bossMechanic=function(e,notes){
    const beforeHp=state.dog.hp;
    baseBossMechanic(e,notes);
    if(e?.bossFight && e.behavior==='armourCheck' && e.round%2===0 && weaponPower()>=24 && state.dog.hp<beforeHp){
      state.dog.hp=beforeHp;
      const index=notes.findIndex(note=>String(note).includes('punishes weak weapons'));
      if(index>=0) notes[index]='Alpha Hound tests the armour, but the current weapon has enough punch.';
    }
  };

  if(window.gearV32?.fireWeapon){
    const originalFire=window.gearV32.fireWeapon;
    window.gearV32.fireWeapon=function(enemy){
      const weapon=activeWeapon();
      if(!weapon?.damage) return originalFire(enemy);
      if(!state.weaponRuntime.loaded || state.weaponRuntime.weaponId!==weapon.id){
        state.weaponRuntime={weaponId:weapon.id,loaded:weapon.magSize||1};
      }
      if(state.weaponRuntime.loaded<=0){
        state.weaponRuntime.loaded=weapon.magSize||1;
        return{reload:true,weapon};
      }
      const rules=CLASS_RULES[weapon.weaponClass]||CLASS_RULES.pistol;
      const shots=Math.min(rules.burst,state.weaponRuntime.loaded,state.dog.ammo);
      if(shots<=0) return{dry:true,weapon};
      state.weaponRuntime.loaded-=shots;
      state.dog.ammo-=shots;

      const accuracy=clamp(92-(weapon.recoil||25)*.52+(state.dog.crit||0)*.22+(rules.accuracy||0),42,94);
      let hits=0,total=0,crit=false;
      for(let i=0;i<shots;i++){
        if(Math.random()*100<=accuracy){
          hits++;
          const c=Math.random()*100<Math.min(45,(state.dog.crit||0)+(weapon.crit||0));
          crit ||= c;
          const closeBonus=rules.closeBonus||1;
          total+=Math.round((weapon.damage||10)*rules.damage*closeBonus*condition(weapon)*(c?1.45:1));
        }
      }
      if(weapon.durabilityMax){
        weapon.durability=Math.max(0,(weapon.durability||weapon.durabilityMax)-Math.max(1,Math.ceil(shots*.35)));
      }
      const armour=(enemy?.def||0)*1.8;
      const penetration=(weapon.penetration||0)*.13;
      const mitigation=Math.max(0,armour-penetration);
      const damage=hits?Math.max(1,Math.round(total-mitigation)):0;
      return{damage,shots,hits,hit:hits>0,crit,weapon,accuracy:Math.round(accuracy)};
    };
  }

  const baseStartRaid=startRaid;
  startRaid=function(){
    const result=baseStartRaid();
    const floor=Math.ceil((state.dog.ammoMax||14)*.62);
    if(state.running && state.dog.ammo<floor){
      const extra=floor-state.dog.ammo;
      state.dog.ammo+=extra;
      log(`Packed ${extra} kennel reserve ammo after loadout check.`);
    }
    return result;
  };

  function estimateShots(enemy,weapon=activeWeapon()){
    if(!enemy||!weapon) return null;
    const rules=CLASS_RULES[weapon.weaponClass]||CLASS_RULES.pistol;
    const perRound=Math.max(1,Math.round((weapon.damage||10)*rules.damage*rules.burst-(enemy.def||0)*1.8+(weapon.penetration||0)*.13));
    return Math.max(1,Math.ceil((enemy.hp||enemy.maxHp||1)/perRound));
  }
  function audit(){
    reconcileVisibleStats();
    const weapon=activeWeapon();
    const enemies=currentZone?.().enemies||[];
    return{
      version:'v0.44',
      breed:state.roster?.find(item=>item.id===state.dogId)?.breed||state.dogId,
      dog:{
        hp:state.dog.maxHp,
        attack:state.dog.attack,
        defence:state.dog.defence,
        crit:state.dog.crit,
        ammoMax:state.dog.ammoMax,
      },
      weapon:weapon?{
        name:weapon.name,
        class:weapon.weaponClass||weapon.slot,
        damage:weapon.damage||null,
        penetration:weapon.penetration||0,
        recoil:weapon.recoil||0,
        magSize:weapon.magSize||null,
        power:weaponPower(weapon),
        visibleAttackBonus:weaponAttackBonus(weapon),
      }:null,
      armour:{
        visibleDefenceBonus:armourDefenceBonus(),
        summary:state.equipment?.armour?.name||'No armour',
      },
      enemyTtk:enemies.map(enemy=>({name:enemy.name,hp:enemy.hp,def:enemy.def,rounds:estimateShots(enemy,weapon)})),
      alphaCheckPasses:weaponPower(weapon)>=24,
    };
  }

  window.balanceV44={audit,weaponPower,weaponAttackBonus,armourDefenceBonus,reconcileVisibleStats,BREED_BALANCE};
  try{applyUpgrades();render();}catch(err){console.warn('v0.44 balance refresh failed',err);}
})();
