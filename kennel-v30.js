(function(){
  const $=id=>document.getElementById(id);

  if(!document.querySelector('.kennel-screen')){
    const oldKennel=document.querySelector('.admin-drawer[data-tab-panel="kennel"]');
    if(oldKennel){
      const nodes={};
      [
        'kennelBase','rosterPanel','creatorPanel','openCreatorBtn','recoveryPanel',
        'hubTraderGrid','marketPanel','upgrades','questGrid','perkGrid','researchGrid'
      ].forEach(id=>{ nodes[id]=$(id); });

      const kennel=document.createElement('section');
      kennel.className='kennel-screen tab-panel';
      kennel.dataset.tabPanel='kennel';
      kennel.innerHTML=`
        <header class="kennel-header panel">
          <div>
            <p class="eyebrow">Kennel command</p>
            <h2>Pack Headquarters</h2>
            <p class="muted">Manage the pack, build supplies, trade, and plan the next run.</p>
          </div>
          <nav class="kennel-nav" aria-label="Kennel sections">
            <button class="kennel-nav-btn active" data-kennel-view="pack" onclick="switchKennelView('pack')">Pack</button>
            <button class="kennel-nav-btn" data-kennel-view="workshop" onclick="switchKennelView('workshop')">Workshop</button>
            <button class="kennel-nav-btn" data-kennel-view="trade" onclick="switchKennelView('trade')">Trade</button>
            <button class="kennel-nav-btn" data-kennel-view="tasks" onclick="switchKennelView('tasks')">Tasks</button>
          </nav>
        </header>
        <div class="kennel-view active" data-kennel-panel="pack">
          <article class="panel kennel-card kennel-roster-card">
            <div class="panel-title-row"><div><h3>Raiders</h3><p class="muted small">Your active pack and new recruits.</p></div><span data-slot="openCreatorBtn"></span></div>
            <div data-slot="rosterPanel"></div><div data-slot="creatorPanel"></div>
          </article>
          <article class="panel kennel-card"><h3>Recovery</h3><div data-slot="recoveryPanel"></div></article>
          <article class="panel kennel-card"><h3>Base Overview</h3><div data-slot="kennelBase"></div></article>
        </div>
        <div class="kennel-view" data-kennel-panel="workshop">
          <article class="panel kennel-card kennel-wide-card"><div class="panel-title-row"><div><h3>Field Crafting</h3><p class="muted small">Turn raid materials into single-use supplies.</p></div></div><div id="craftingGrid" class="crafting-grid"></div></article>
          <article class="panel kennel-card"><h3>Stations</h3><div data-slot="upgrades"></div></article>
          <article class="panel kennel-card"><h3>Research</h3><div data-slot="researchGrid"></div></article>
          <article class="panel kennel-card"><h3>Treat Perks</h3><div data-slot="perkGrid"></div></article>
        </div>
        <div class="kennel-view" data-kennel-panel="trade">
          <article class="panel kennel-card"><h3>Hub Trader</h3><div data-slot="hubTraderGrid"></div></article>
          <article class="panel kennel-card"><h3>Scav Market</h3><div data-slot="marketPanel"></div></article>
        </div>
        <div class="kennel-view" data-kennel-panel="tasks">
          <article class="panel kennel-card kennel-wide-card"><h3>Noticeboard</h3><div data-slot="questGrid"></div></article>
        </div>`;

      Object.entries(nodes).forEach(([id,node])=>{
        const slot=kennel.querySelector(`[data-slot="${id}"]`);
        if(slot && node) slot.replaceWith(node);
      });
      oldKennel.replaceWith(kennel);
    }
  }

  if(!$('themeSelect')){
    const settings=document.querySelector('.settings-grid');
    if(settings){
      const row=document.createElement('label');
      row.className='setting-row';
      row.innerHTML=`<span>Colour Theme</span><select id="themeSelect"><option value="aurora">Aurora</option><option value="sunset">Sunset</option><option value="ocean">Ocean</option><option value="classic">Classic</option></select>`;
      settings.prepend(row);
    }
  }
})();
