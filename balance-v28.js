(function(){
  const breeds=window.BREEDS_V23;
  if(!breeds) return;

  const balance={
    shiba:{role:'Balanced scavenger',trait:'Steady Paws: useful boosts across combat, carrying, and extraction.',hp:4,attack:1,defence:1,crit:3,speed:0,carry:2,scout:0,rare:0,extract:2,heal:0},
    jack:{role:'Aggressive scrapper',trait:'First In: higher damage, critical chance, and movement speed.',hp:0,attack:2,defence:0,crit:6,speed:1,carry:0,scout:0,rare:0,extract:0,heal:0},
    collie:{role:'Pathfinder scout',trait:'Route Sense: reveals farther, moves faster, and extracts more safely.',hp:2,attack:0,defence:0,crit:2,speed:1,carry:2,scout:1,rare:0,extract:6,heal:0},
    dachshund:{role:'Cache specialist',trait:'Burrow Nose: carries more and improves rare finds and extraction.',hp:0,attack:0,defence:1,crit:2,speed:0,carry:4,scout:0,rare:4,extract:6,heal:0},
    pom:{role:'Lucky skirmisher',trait:'Chaos Luck: better critical hits, rare loot, and quick movement.',hp:-2,attack:0,defence:0,crit:5,speed:1,carry:0,scout:0,rare:7,extract:2,heal:0},
    bulldog:{role:'Armoured hauler',trait:'Hard Head: much tougher and able to haul a larger pack.',hp:8,attack:1,defence:2,crit:0,speed:0,carry:4,scout:0,rare:0,extract:0,heal:0},
    lab:{role:'Recovery specialist',trait:'Field Medic: tougher bandages plus a sturdy all-round frame.',hp:6,attack:0,defence:1,crit:0,speed:0,carry:2,scout:0,rare:0,extract:2,heal:4},
    greyhound:{role:'Fast runner',trait:'Breakaway: exceptional movement and dodge with safer extraction.',hp:-4,attack:0,defence:-1,crit:3,speed:2,carry:0,scout:1,rare:0,extract:5,heal:0},
  };

  Object.entries(balance).forEach(([key,stats])=>{
    if(breeds[key]) Object.assign(breeds[key],stats);
  });

  const baseApplyUpgrades=applyUpgrades;
  applyUpgrades=function(){
    baseApplyUpgrades();
    const raider=window.currentRaider?.();
    const breed=raider && breeds[raider.breed];
    if(breed?.heal) state.dog.medkitPower+=breed.heal;
  };

  window.breedBalanceV28=balance;
  applyUpgrades();
  updateGear();
})();
