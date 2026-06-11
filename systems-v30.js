(function(){
  const STARTER_CONSUMABLES={smoke:1,decoy:0,medkit:1,lucky:0,token:0,map:1};
  const CRAFTING={
    smoke:{amount:1,cost:{fabric:3,wood:1},note:'A quick escape from the first non-boss fight.'},
    decoy:{amount:1,cost:{fabric:2,wood:2,metal:1},note:'Lowers roaming enemy aggression for one raid.'},
    medkit:{amount:1,cost:{medicine:3,fabric:2},note:'Automatically restores health once per raid.'},
    lucky:{amount:1,cost:{food:3,medicine:1},note:'Improves rare loot and gear odds for one raid.'},
    token:{amount:1,cost:{metal:4,gunParts:1},note:'Discounts one trader purchase during a raid.'},
    map:{amount:1,cost:{wood:2,fabric:2},note:'Reveals additional ground at raid start.'},
  };
  const SLOT_ICONS={weapon:'🔫',armour:'🦺',charm:'🦴'};
  const THEMES=['aurora','sunset','ocean','classic'];

  function savedV30(){try{return JSON.parse(localStorage.getItem('barkRaidersSaveV9')||'{}');}catch{return {};}}
  const saved=savedV30();
  state.consumables={...STARTER_CONSUMABLES,...(saved.consumables||state.consumables||{})};
  state.raidConsumablesFound={};
  state.settings.theme=THEMES.includes(saved.theme||state.settings.theme)?(saved.theme||state.settings.theme):'aurora';
  state.selectedConsumables=state.selectedConsumables.filter(id=>(state.consumables[id]||0)>0);

  function applyTheme(){document.documentElement.dataset.theme=state.settings.theme||'aurora';if($('themeSelect'))$('themeSelect').value=state.settings.theme||'aurora';}
  window.switchKennelView=function(view){document.querySelectorAll('[data-kennel-view]').forEach(button=>button.classList.toggle('active',button.dataset.kennelView===view));document.querySelectorAll('[data-kennel-panel]').forEach(panel=>panel.classList.toggle('active',panel.dataset.kennelPanel===view));};
  function statLine(item){const labels={attack:'ATK',crit:'CRIT',ammo:'AMMO',hp:'HP',defence:'DEF',carry:'CARRY',rare:'RARE',extract:'EXTRACT'};return Object.entries(labels).filter(([key])=>Number(item[key])).map(([key,label])=>`<span><b>+${item[key]}</b> ${label}</span>`).join('');}

  renderGear=function(){$('gearGrid').innerHTML=`<div class="support-card"><span class="gear-icon">🩹</span><div><strong>Field Aid</strong><span>${state.dog.medkitPower} HP bandages</span></div></div><div class="support-card"><span class="gear-icon">🎒</span><div><strong>Raid Pack</strong><span>${state.dog.carryMax} carry · ${state.dog.inventorySlots} slots</span></div></div>`;};
  renderEquipment=function(){$('equipmentGrid').innerHTML=Object.entries(state.equipment).map(([slot,item])=>`<article class="equipped-card rarity-${String(item.rarity||'starter').toLowerCase()}"><span class="gear-icon">${SLOT_ICONS[slot]||'⭐'}</span><div class="equipped-copy"><span class="slot-label">${slot}</span><strong>${item.name}</strong><div class="gear-stats">${statLine(item)||'<span>Starter equipment</span>'}</div></div><span class="rarity-pill">${item.rarity||'Starter'}</span></article>`).join('');};
  renderEquipmentInventory=function(){$('inventoryGrid').innerHTML=Object.entries(state.equipmentInventory).map(([category,items])=>`<section class="inventory-group"><div class="inventory-group-title"><span>${SLOT_ICONS[category]}</span><strong>${category}</strong><small>${items.length} owned</small></div><div class="inventory-list">${items.map((item,index)=>{const equipped=state.equipment[category]?.name===item.name;return `<article class="inventory-item ${equipped?'equipped':''}"><div><strong>${item.name}</strong><span>${item.rarity||'Unknown'} · score ${item.score||0} ${gearDeltaText(category,item)}</span><div class="gear-stats">${statLine(item)}</div></div><button class="${equipped?'equipped-button':'ghost'}" ${equipped||state.running?'disabled':''} onclick="equipItem('${category}',${index})">${equipped?'Equipped':'Equip'}</button></article>`;}).join('')}</div></section>`).join('');};

  renderConsumableSetup=function(){$('consumableSetup').innerHTML=Object.entries(CONSUMABLES).map(([id,item])=>{const count=state.consumables[id]||0;const checked=state.selectedConsumables.includes(id);const disabled=state.running||count<=0||(!checked&&state.selectedConsumables.length>=2);return `<label class="consumable-card ${checked?'selected':''} ${count<=0?'empty':''}"><input type="checkbox" ${checked?'checked':''} ${disabled?'disabled':''} onchange="toggleConsumable('${id}')"><span class="consumable-icon">${item.icon}</span><span class="consumable-copy"><strong>${item.name}</strong><small>${item.desc}</small></span><span class="stock-badge">${count} owned</span></label>`;}).join('');};
  renderCrafting=function(){if(!$('craftingGrid'))return;$('craftingGrid').innerHTML=Object.entries(CRAFTING).map(([id,recipe])=>{const item=CONSUMABLES[id];return `<article class="craft-card"><div class="craft-icon">${item.icon}</div><div><strong>${item.name}</strong><p>${recipe.note}</p><span>Cost: ${costText(recipe.cost)}</span></div><div class="craft-action"><span>${state.consumables[id]||0} owned</span><button ${!state.running&&canPay(recipe.cost)?'':'disabled'} onclick="craftConsumable('${id}')">Craft</button></div></article>`;}).join('');};
  window.craftConsumable=function(id){const recipe=CRAFTING[id];if(!recipe||state.running||!canPay(recipe.cost))return;pay(recipe.cost);state.consumables[id]=(state.consumables[id]||0)+recipe.amount;log(`Crafted ${CONSUMABLES[id].name}.`);save();render();};

  const baseToggleConsumable=toggleConsumable;
  toggleConsumable=function(id){if((state.consumables[id]||0)<=0){state.selectedConsumables=state.selectedConsumables.filter(key=>key!==id);render();return;}baseToggleConsumable(id);};
  window.toggleConsumable=toggleConsumable;
  const baseStartRaid=startRaid;
  startRaid=function(){if(state.running)return;state.selectedConsumables=state.selectedConsumables.filter(id=>(state.consumables[id]||0)>0).slice(0,2);state.selectedConsumables.forEach(id=>state.consumables[id]=Math.max(0,(state.consumables[id]||0)-1));state.raidConsumablesFound={};baseStartRaid();save();};
  const baseLootTile=lootTile;
  lootTile=function(tile){baseLootTile(tile);const chance=tile.type==='medical'?.34:tile.type==='rare'?.24:tile.type==='crate'?.08:0;if(chance&&Math.random()<chance){const pool=tile.type==='medical'?['medkit','smoke','decoy']:['lucky','token','map'];const id=pick(pool);state.raidConsumablesFound[id]=(state.raidConsumablesFound[id]||0)+1;log(`Supply found: ${CONSUMABLES[id].name}. Keep it by extracting.`);}};
  const baseBankRaidLoot=bankRaidLoot;
  bankRaidLoot=function(){baseBankRaidLoot();Object.entries(state.raidConsumablesFound||{}).forEach(([id,amount])=>{state.consumables[id]=(state.consumables[id]||0)+amount;});state.raidConsumablesFound={};};
  const baseHubTraderOffers=hubTraderOffers;
  hubTraderOffers=function(){return [...baseHubTraderOffers(),{label:'Field Medkit',desc:'Adds 1 Emergency Medkit to kennel stock.',cost:{medicine:3,fabric:2},effect:()=>state.consumables.medkit++},{label:'Scavenger Supply Tin',desc:'Adds a random raid consumable.',cost:{food:6,water:4,metal:3},effect:()=>{const id=pick(Object.keys(CONSUMABLES));state.consumables[id]++;}},{label:'Map Scrap Bundle',desc:'Adds 2 Map Scraps to kennel stock.',cost:{wood:5,fabric:4},effect:()=>state.consumables.map+=2}];};

  const baseRenderSettings=renderSettings;renderSettings=function(){baseRenderSettings();applyTheme();};
  const baseSave=save;save=function(){baseSave();const data=savedV30();data.consumables=state.consumables;data.theme=state.settings.theme;localStorage.setItem('barkRaidersSaveV9',JSON.stringify(data));};
  const baseRender=render;render=function(){baseRender();renderCrafting();applyTheme();};
  $('themeSelect')?.addEventListener('change',event=>{state.settings.theme=THEMES.includes(event.target.value)?event.target.value:'aurora';applyTheme();save();});
  applyTheme();render();
})();