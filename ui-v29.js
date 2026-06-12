(function(){
  const mapHeading=$('map')?.closest('.map-panel')?.querySelector('h2');
  if(mapHeading) mapHeading.textContent='Raid World';

  const mapSummary=$('mapSummary');
  if(mapSummary && !state.currentBoss) mapSummary.textContent='Explore the district and locate extraction.';

  const rightPanel=document.querySelector('.right-panel');
  const rightHeading=rightPanel?.querySelector('h2');
  if(rightHeading) rightHeading.textContent='Field Intel';

  rightPanel?.querySelectorAll('details').forEach(details=>{
    const label=details.querySelector('summary')?.textContent.trim();
    details.open=['Active Contract','Raid Loot'].includes(label);
  });

  const consumables=[...document.querySelectorAll('details')].find(details=>
    details.querySelector('summary')?.textContent.trim()==='Consumables'
  );
  if(consumables) consumables.open=false;
})();
