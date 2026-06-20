(function(){
  const $=id=>document.getElementById(id);

  function ensureDock(){
    const mapColumn=document.querySelector('.map-column');
    if(!mapColumn) return null;
    let dock=mapColumn.querySelector('.mobile-raid-dock-v54');
    if(!dock){
      dock=document.createElement('section');
      dock.className='mobile-raid-dock-v54';
      mapColumn.insertBefore(dock,mapColumn.firstChild);
    }
    return dock;
  }

  function pct(value,max){
    return `${Math.max(0,Math.min(100,Math.round((value/Math.max(1,max))*100)))}%`;
  }

  function renderDock(){
    const dock=ensureDock();
    if(!dock) return;
    const hp=pct(state.dog.hp,state.dog.maxHp);
    const ammo=pct(state.dog.ammo,state.dog.ammoMax);
    const carry=pct(state.dog.carry,state.dog.carryMax);
    dock.innerHTML=`<div class="mobile-raid-status-v54">
      <strong>${state.running?'Raid Running':'Ready to Raid'}</strong>
      <span>${state.dog.name} · ${currentBiome().name} F${currentFloor()} · Safe Extract ${state.autoExtract?'On':'Off'}</span>
    </div>
    <div class="mobile-raid-bars-v54">
      <span title="Health"><b style="width:${hp}"></b></span>
      <span title="Ammo"><b class="ammo" style="width:${ammo}"></b></span>
      <span title="Carry"><b class="carry" style="width:${carry}"></b></span>
    </div>
    <div class="mobile-raid-actions-v54">
      <button type="button" onclick="startRaid()" ${state.running?'disabled':''}>Start</button>
      <button type="button" class="ghost" onclick="manualExtract()" ${state.running?'':'disabled'}>Extract</button>
      <button type="button" class="ghost" onclick="toggleAuto()">${state.autoRaid?'Auto On':'Auto Off'}</button>
    </div>`;
  }

  const baseRender=render;
  render=function(){
    baseRender();
    renderDock();
  };

  const baseStart=startRaid;
  startRaid=function(){
    const result=baseStart();
    renderDock();
    return result;
  };

  const baseManualExtract=manualExtract;
  manualExtract=function(){
    const result=baseManualExtract();
    renderDock();
    return result;
  };

  window.gameplayV54={
    version:'v0.54',
    audit(){
      const dock=document.querySelector('.mobile-raid-dock-v54');
      const controls=[...document.querySelectorAll('button,.tab-btn,select,input')]
        .filter(el=>{
          if(el.closest('.modal.hidden,.hidden')) return false;
          const r=el.getBoundingClientRect();
          return r.width>0 && r.height>0 && getComputedStyle(el).visibility!=='hidden';
        });
      const targetHeight=el=>{
        if(['checkbox','radio'].includes(el.type||'')){
          const label=el.closest('label');
          if(label) return label.getBoundingClientRect().height;
        }
        return el.getBoundingClientRect().height;
      };
      return {
        version:'v0.54',
        dockPresent:!!dock,
        dockText:dock?.textContent?.trim()||'',
        viewport:{width:window.innerWidth,height:window.innerHeight},
        mobileLayout:window.matchMedia('(max-width: 760px)').matches,
        mapHeight:Math.round($('map')?.getBoundingClientRect().height||0),
        touchTargets:controls.every(el=>targetHeight(el)>=32),
      };
    }
  };

  try{renderDock();}catch(err){console.warn('v0.54 mobile dock failed',err);}
})();
