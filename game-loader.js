(async function(){
  const response = await fetch('game.js');
  if(!response.ok) throw new Error('Could not load the Bark Raiders game runtime.');

  let source = await response.text();
  source = source.replace(
    "      color:(r.color && breedDef(r.breed || 'shiba').colors[r.color]) ? r.color : Object.keys(breedDef(r.breed || 'shiba').colors)[0],\n      level:r.level || 1,",
    "      color:(r.color && breedDef(r.breed || 'shiba').colors[r.color]) ? r.color : Object.keys(breedDef(r.breed || 'shiba').colors)[0],\n      accent:r.accent || '#8bd77f',\n      level:r.level || 1,"
  );
  source = source.replace(
    '  loadV23Meta();',
    '  window.BREEDS_V23 = BREEDS_V23;\n  window.breedDef = breedDef;\n  window.v23MetaState = v23MetaState;\n  window.ensureRoster = ensureRoster;\n  window.currentRaider = currentRaider;\n  window.masteryFor = masteryFor;\n\n  loadV23Meta();'
  );

  const runtimeUrl = URL.createObjectURL(new Blob([source], {type:'text/javascript'}));
  const runtime = document.createElement('script');
  runtime.src = runtimeUrl;
  runtime.onload = () => {
    URL.revokeObjectURL(runtimeUrl);
    const onboarding = document.createElement('script');
    onboarding.src = 'founder-onboarding.js';
    document.body.appendChild(onboarding);
  };
  runtime.onerror = () => {
    URL.revokeObjectURL(runtimeUrl);
    document.body.textContent = 'Could not start Bark Raiders.';
  };
  document.body.appendChild(runtime);
})().catch(error => {
  console.error(error);
  document.body.textContent = error.message;
});
