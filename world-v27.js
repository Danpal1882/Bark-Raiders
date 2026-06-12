(function(){
  const WORLD_W=40;
  const WORLD_H=26;
  const VIEW_W=24;
  const VIEW_H=16;
  const TILE=28;
  const PROP_ASSETS={
    base:'assets/tile-base.svg',
    crate:'assets/tile-crate.svg',
    tree:'assets/tile-tree.svg',
    grove:'assets/tile-grove.svg',
    food:'assets/tile-food.svg',
    water:'assets/tile-water.svg',
    scrap:'assets/tile-scrap.svg',
    medical:'assets/tile-medical.svg',
    weapon:'assets/tile-weapon.svg',
    event:'assets/tile-event.svg',
    trader:'assets/tile-trader.svg',
    enemy:'assets/tile-enemy.svg',
    rare:'assets/tile-rare.svg',
    boss:'assets/tile-boss.svg',
    empty:'assets/tile-empty.svg',
  };
  const PALETTES={
    city:{floor:'#34363a',floor2:'#2c2f33',wall:'#17191c',line:'#565a60',accent:'#d2b870',fog:'#111317'},
    sewer:{floor:'#263a31',floor2:'#1f3029',wall:'#0d1814',line:'#426a55',accent:'#87bd88',fog:'#0c1512'},
    factory:{floor:'#3b302a',floor2:'#302621',wall:'#171311',line:'#74513d',accent:'#db894c',fog:'#15110f'},
    farmland:{floor:'#3d4028',floor2:'#33351f',wall:'#171b12',line:'#626a37',accent:'#d5b960',fog:'#11140e'},
  };
  const images=new Map();
  let frame=0;
  let lastTime=performance.now();
  let baseGenerateMap=generateMap;
  let baseRenderMap=renderMap;
  let baseGenerateRoamingEnemies=generateRoamingEnemies;
  let baseUpdateRoamingEnemies=updateRoamingEnemies;
  let baseMoveDog=moveDog;

  function image(src){
    if(!images.has(src)){
      const img=new Image();
      img.src=src;
      images.set(src,img);
    }
    return images.get(src);
  }

  function worldState(){
    if(!state.world) state.world={};
    return state.world;
  }

  function key(x,y){ return `${x},${y}`; }
  function worldRandom(seed){
    let value=2166136261;
    for(const char of String(seed)){
      value^=char.charCodeAt(0);
      value=Math.imul(value,16777619);
    }
    return function(){
      value+=0x6D2B79F5;
      let t=value;
      t=Math.imul(t^(t>>>15),t|1);
      t^=t+Math.imul(t^(t>>>7),t|61);
      return ((t^(t>>>14))>>>0)/4294967296;
    };
  }
  function inside(x,y){ return x>=0 && y>=0 && x<WORLD_W && y<WORLD_H; }
  function floorAt(world,x,y){ return inside(x,y) && world.tiles[y][x]===1; }
  function distance2d(a,b){ return Math.hypot(a.x-b.x,a.y-b.y); }

  function carveCell(world,x,y){
    if(inside(x,y)) world.tiles[y][x]=1;
  }

  function carveRoom(world,cx,cy,w,h){
    const left=clamp(Math.round(cx-w/2),1,WORLD_W-w-2);
    const top=clamp(Math.round(cy-h/2),1,WORLD_H-h-2);
    for(let y=top;y<top+h;y++) for(let x=left;x<left+w;x++) carveCell(world,x,y);
    return {left,top,w,h,cx:left+Math.floor(w/2),cy:top+Math.floor(h/2)};
  }

  function carveCorridor(world,a,b,rng){
    let x=a.x;
    let y=a.y;
    const horizontalFirst=rng()>.5;
    const stepX=()=>{ while(x!==b.x){ x+=Math.sign(b.x-x); carveCell(world,x,y); carveCell(world,x,y+1); } };
    const stepY=()=>{ while(y!==b.y){ y+=Math.sign(b.y-y); carveCell(world,x,y); carveCell(world,x+1,y); } };
    if(horizontalFirst){ stepX(); stepY(); } else { stepY(); stepX(); }
  }

  function cellForRoom(room){
    return {
      x:clamp(3+Math.round((room.gridX/12)*(WORLD_W-7)),3,WORLD_W-4),
      y:clamp(3+Math.round((room.gridY/8)*(WORLD_H-7)),3,WORLD_H-4),
    };
  }

  function nearestFloor(world,x,y){
    if(floorAt(world,x,y)) return {x,y};
    for(let radius=1;radius<8;radius++){
      for(let yy=y-radius;yy<=y+radius;yy++) for(let xx=x-radius;xx<=x+radius;xx++){
        if(floorAt(world,xx,yy)) return {x:xx,y:yy};
      }
    }
    return {x:2,y:2};
  }

  function randomFloor(world,rng,awayFrom){
    for(let attempt=0;attempt<500;attempt++){
      const x=1+Math.floor(rng()*(WORLD_W-2));
      const y=1+Math.floor(rng()*(WORLD_H-2));
      if(floorAt(world,x,y) && (!awayFrom || Math.hypot(x-awayFrom.x,y-awayFrom.y)>5)) return {x,y};
    }
    return nearestFloor(world,2,2);
  }

  function buildWorld(){
    const rng=worldRandom(`${state.mapSeed}-world-v27`);
    const world={
      width:WORLD_W,
      height:WORLD_H,
      tileSize:TILE,
      tiles:Array.from({length:WORLD_H},()=>Array(WORLD_W).fill(0)),
      rooms:[],
      props:[],
      enemies:[],
      dog:{x:2,y:2,path:[],targetProp:null,facing:1,moving:false},
      discovered:new Set(),
      searched:0,
      camera:{x:0,y:0},
      seed:state.mapSeed,
      ready:true,
    };

    state.map.forEach(room=>{
      const center=cellForRoom(room);
      const chamber=carveRoom(world,center.x,center.y,room.critical?7:5,room.critical?5:4);
      world.rooms[room.id]={...chamber,nodeId:room.id};
    });
    state.map.forEach(room=>{
      room.links.forEach(id=>{
        if(room.id>=id || !world.rooms[id]) return;
        carveCorridor(world,{x:world.rooms[room.id].cx,y:world.rooms[room.id].cy},{x:world.rooms[id].cx,y:world.rooms[id].cy},rng);
      });
    });

    state.map.forEach(room=>{
      const chamber=world.rooms[room.id];
      const position=nearestFloor(world,chamber.cx+(rng()>.5?1:-1),chamber.cy+(rng()>.5?1:-1));
      world.props.push({
        id:`prop-${room.id}`,
        roomId:room.id,
        type:room.type,
        x:position.x+.5,
        y:position.y+.5,
        searched:room.cleared,
        pulse:rng()*Math.PI*2,
      });
    });

    const entrance=state.map.find(room=>room.role==='entrance') || state.map[0];
    const start=world.rooms[entrance.id];
      world.dog.x=start.cx+.5;
      world.dog.y=start.cy+.5;
    world.camera.x=clamp(world.dog.x-VIEW_W/2,0,WORLD_W-VIEW_W);
    world.camera.y=clamp(world.dog.y-VIEW_H/2,0,WORLD_H-VIEW_H);
    revealWorld(world,world.dog.x,world.dog.y,5);
    state.world=world;
    syncNodePosition(world);
    return world;
  }

  function neighbours(world,x,y){
    return [[1,0],[-1,0],[0,1],[0,-1]]
      .map(([dx,dy])=>({x:x+dx,y:y+dy}))
      .filter(cell=>floorAt(world,cell.x,cell.y));
  }

  function findPath(world,start,end){
    const from={x:Math.floor(start.x),y:Math.floor(start.y)};
    const to=nearestFloor(world,Math.floor(end.x),Math.floor(end.y));
    const queue=[from];
    const previous=new Map([[key(from.x,from.y),null]]);
    while(queue.length){
      const current=queue.shift();
      if(current.x===to.x && current.y===to.y) break;
      neighbours(world,current.x,current.y).forEach(next=>{
        const id=key(next.x,next.y);
        if(!previous.has(id)){
          previous.set(id,current);
          queue.push(next);
        }
      });
    }
    if(!previous.has(key(to.x,to.y))) return [];
    const result=[];
    let cursor=to;
    while(cursor && !(cursor.x===from.x && cursor.y===from.y)){
      result.unshift({x:cursor.x+.5,y:cursor.y+.5});
      cursor=previous.get(key(cursor.x,cursor.y));
    }
    return result;
  }

  function revealWorld(world,x,y,radius){
    const cx=Math.floor(x);
    const cy=Math.floor(y);
    for(let yy=cy-radius;yy<=cy+radius;yy++) for(let xx=cx-radius;xx<=cx+radius;xx++){
      if(inside(xx,yy) && Math.hypot(xx-cx,yy-cy)<=radius+.4) world.discovered.add(key(xx,yy));
    }
  }

  function targetScore(prop){
    const room=state.map[prop.roomId];
    if(!room || prop.searched || room.cleared || room.type==='base') return -Infinity;
    return tilePriority(room)+(room.type==='boss'&&currentPlan().focus!=='boss'?-8:0);
  }

  function chooseWorldTarget(world){
    const options=world.props.filter(prop=>targetScore(prop)>-Infinity);
    options.sort((a,b)=>{
      const score=targetScore(b)-targetScore(a);
      return score || distance2d(world.dog,a)-distance2d(world.dog,b);
    });
    return options[0] || null;
  }

  function setDogTarget(world,prop){
    if(!prop) return;
    world.dog.targetProp=prop.id;
    world.dog.path=findPath(world,world.dog,prop);
  }

  function syncNodePosition(world){
    let closest=state.map[0];
    let best=Infinity;
    state.map.forEach(room=>{
      const chamber=world.rooms[room.id];
      if(!chamber) return;
      const d=Math.hypot(world.dog.x-(chamber.cx+.5),world.dog.y-(chamber.cy+.5));
      if(d<best){ best=d; closest=room; }
    });
    if(closest) state.position={x:closest.x,y:closest.y};
  }

  function searchNearbyProp(world){
    const prop=world.props.find(item=>!item.searched && distance2d(world.dog,item)<.85);
    if(!prop) return false;
    const room=state.map[prop.roomId];
    prop.searched=true;
    world.searched++;
    world.dog.path=[];
    world.dog.targetProp=null;
    if(room){
      state.position={x:room.x,y:room.y};
      revealAround(room.x,room.y,state.dog.scoutRange);
      resolveTile(room);
      prop.type=room.type;
    }
    return true;
  }

  function spawnEnemies(){
    const world=worldState();
    if(!world.ready) return;
    const rng=worldRandom(`${world.seed}-enemies`);
    const count=3+state.zoneId+(state.modifier?.enemyBoost?2:0)+(currentPlan().roamers||0);
    world.enemies=[];
    state.roamEnemies=[];
    for(let i=0;i<count;i++){
      const template=pick(currentZone().enemies);
      const position=randomFloor(world,rng,world.dog);
      const hp=Math.round(template.hp*(state.weather?.enemy||1)*currentPlan().enemy);
      const enemy={
        id:`world-enemy-${i}`,
        template,
        sprite:template.sprite,
        name:template.name,
        x:position.x+.5,
        y:position.y+.5,
        path:[],
        target:null,
        hp,
        maxHp:hp,
        active:true,
        facing:-1,
        think:rng()*2,
      };
      world.enemies.push(enemy);
      state.roamEnemies.push({id:enemy.id,template,sprite:enemy.sprite,name:enemy.name,hp,maxHp:hp,active:true,left:0,top:0});
    }
  }

  function updateDog(world,dt){
    if(!state.running || state.mode!=='roaming') return;
    if(!world.dog.path.length){
      if(searchNearbyProp(world)) return;
      setDogTarget(world,chooseWorldTarget(world));
      if(!world.dog.path.length && !world.dog.targetProp && !chooseWorldTarget(world)) endRaid(true);
    }
    const next=world.dog.path[0];
    if(!next) return;
    const dx=next.x-world.dog.x;
    const dy=next.y-world.dog.y;
    const distance=Math.hypot(dx,dy);
    const speed=1.55+state.dog.speed*.24;
    world.dog.moving=true;
    world.dog.facing=dx<0?-1:dx>0?1:world.dog.facing;
    if(distance<speed*dt){
      world.dog.x=next.x;
      world.dog.y=next.y;
      world.dog.path.shift();
      revealWorld(world,world.dog.x,world.dog.y,4+Math.min(2,state.dog.scoutRange));
      syncNodePosition(world);
      searchNearbyProp(world);
    }else{
      world.dog.x+=dx/distance*speed*dt;
      world.dog.y+=dy/distance*speed*dt;
    }
  }

  function updateEnemies(world,dt){
    if(!state.running || state.mode!=='roaming') return;
    const rng=Math.random;
    world.enemies.forEach(enemy=>{
      if(!enemy.active) return;
      const source=state.roamEnemies.find(item=>item.id===enemy.id);
      if(source && source.active===false){ enemy.active=false; return; }
      enemy.think-=dt;
      const dogDistance=distance2d(enemy,world.dog);
      if(enemy.think<=0 || !enemy.path.length){
        const chase=dogDistance<6.5 || enemy.template.behavior==='chaser';
        const destination=chase
          ? {x:world.dog.x,y:world.dog.y}
          : randomFloor(world,rng,enemy);
        enemy.path=findPath(world,enemy,destination);
        enemy.think=chase?.45:1.5+Math.random()*2;
      }
      const next=enemy.path[0];
      if(next){
        const dx=next.x-enemy.x;
        const dy=next.y-enemy.y;
        const distance=Math.hypot(dx,dy);
        const speed=enemy.template.behavior==='chaser'?1.45:1.05;
        enemy.facing=dx<0?-1:dx>0?1:enemy.facing;
        if(distance<speed*dt){ enemy.x=next.x; enemy.y=next.y; enemy.path.shift(); }
        else { enemy.x+=dx/distance*speed*dt; enemy.y+=dy/distance*speed*dt; }
      }
      if(distance2d(enemy,world.dog)<.9){
        startCombat(enemy.template,false,enemy.id);
      }
    });
  }

  function canvasSetup(){
    const map=$('map');
    if(!map) return null;
    let canvas=map.querySelector('#raidWorldCanvas');
    if(!canvas){
      map.innerHTML='';
      canvas=document.createElement('canvas');
      canvas.id='raidWorldCanvas';
      canvas.width=VIEW_W*TILE;
      canvas.height=VIEW_H*TILE;
      canvas.setAttribute('aria-label','Top-down dungeon raid world');
      map.appendChild(canvas);
      const overlay=document.createElement('div');
      overlay.className='world-overlay';
      overlay.innerHTML='<span class="world-mode">AUTO SCAVENGE</span><span class="world-progress"></span>';
      map.appendChild(overlay);
    }
    return canvas;
  }

  function drawTile(ctx,world,palette,x,y){
    const px=x*TILE;
    const py=y*TILE;
    if(world.tiles[y][x]){
      ctx.fillStyle=(x+y)%2?palette.floor:palette.floor2;
      ctx.fillRect(px,py,TILE,TILE);
      ctx.strokeStyle=palette.line;
      ctx.globalAlpha=.16;
      ctx.strokeRect(px+.5,py+.5,TILE-1,TILE-1);
      ctx.globalAlpha=1;
    }else{
      ctx.fillStyle=palette.wall;
      ctx.fillRect(px,py,TILE,TILE);
      if((x*13+y*7)%11===0){
        ctx.fillStyle='rgba(255,255,255,.025)';
        ctx.fillRect(px+4,py+5,TILE-8,4);
      }
    }
  }

  function drawProp(ctx,world,prop,time){
    if(prop.searched) return;
    const room=state.map[prop.roomId];
    if(!room || room.type==='empty') return;
    const src=PROP_ASSETS[room.type] || PROP_ASSETS.empty;
    const img=image(src);
    const bob=Math.sin(time*2.2+prop.pulse)*2;
    const size=room.type==='boss'?48:room.type==='base'?42:34;
    const x=prop.x*TILE-size/2;
    const y=prop.y*TILE-size/2+bob;
    ctx.fillStyle='rgba(0,0,0,.35)';
    ctx.beginPath();
    ctx.ellipse(prop.x*TILE,prop.y*TILE+14,size*.34,6,0,0,Math.PI*2);
    ctx.fill();
    if(img.complete) ctx.drawImage(img,x,y,size,size);
    if(distance2d(world.dog,prop)<2.2){
      ctx.strokeStyle='#ffd970';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.arc(prop.x*TILE,prop.y*TILE,22+Math.sin(time*4)*2,0,Math.PI*2);
      ctx.stroke();
    }
  }

  function drawActor(ctx,actor,src,size,facing,time,active=true){
    if(!active) return;
    const img=image(src);
    const x=actor.x*TILE;
    const y=actor.y*TILE;
    ctx.fillStyle='rgba(0,0,0,.42)';
    ctx.beginPath();
    ctx.ellipse(x,y+size*.28,size*.28,6,0,0,Math.PI*2);
    ctx.fill();
    ctx.save();
    ctx.translate(x,y-Math.sin(time*7)*1.5);
    ctx.scale(facing,1);
    if(img.complete) ctx.drawImage(img,-size/2,-size*.72,size,size);
    ctx.restore();
  }

  function drawFog(ctx,world,palette){
    ctx.fillStyle=palette.fog;
    ctx.globalAlpha=.94;
    for(let y=0;y<WORLD_H;y++) for(let x=0;x<WORLD_W;x++){
      if(!world.discovered.has(key(x,y))) ctx.fillRect(x*TILE,y*TILE,TILE+1,TILE+1);
    }
    ctx.globalAlpha=1;
  }

  function drawWorld(time=performance.now()){
    const world=worldState();
    const canvas=canvasSetup();
    if(!canvas || !world.ready) return;
    const ctx=canvas.getContext('2d');
    const palette=PALETTES[biomeKey()] || PALETTES.city;
    const targetCameraX=clamp(world.dog.x-VIEW_W/2,0,WORLD_W-VIEW_W);
    const targetCameraY=clamp(world.dog.y-VIEW_H/2,0,WORLD_H-VIEW_H);
    world.camera.x+=(targetCameraX-world.camera.x)*.08;
    world.camera.y+=(targetCameraY-world.camera.y)*.08;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.translate(-world.camera.x*TILE,-world.camera.y*TILE);
    for(let y=0;y<WORLD_H;y++) for(let x=0;x<WORLD_W;x++) drawTile(ctx,world,palette,x,y);
    world.props.forEach(prop=>drawProp(ctx,world,prop,time/1000));
    world.enemies.forEach(enemy=>drawActor(ctx,enemy,enemy.sprite,42,enemy.facing,time/1000,enemy.active));
    drawActor(ctx,world.dog,state.dog.sprite,48,world.dog.facing,time/1000,true);
    drawFog(ctx,world,palette);

    const currentEnemy=world.enemies.find(enemy=>enemy.id===state.combat?.enemy?.sourceId);
    if(currentEnemy){
      ctx.strokeStyle='#e96c60';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.arc(currentEnemy.x*TILE,currentEnemy.y*TILE,24,0,Math.PI*2);
      ctx.stroke();
    }
    ctx.restore();
    const overlay=$('map')?.querySelector('.world-progress');
    if(overlay) overlay.textContent=`${world.searched}/${world.props.filter(prop=>state.map[prop.roomId]?.type!=='base').length} searched · ${world.enemies.filter(enemy=>enemy.active).length} hostiles`;
  }

  function loop(now){
    const dt=Math.min(.05,(now-lastTime)/1000);
    lastTime=now;
    const world=worldState();
    if(world.ready){
      updateDog(world,dt);
      updateEnemies(world,dt);
      drawWorld(now);
    }
    frame=requestAnimationFrame(loop);
  }

  generateMap=function(seedOverride){
    baseGenerateMap(seedOverride);
    buildWorld();
  };
  generateRoamingEnemies=function(){
    spawnEnemies();
  };
  updateRoamingEnemies=function(){
    // Continuous world AI runs in requestAnimationFrame.
  };
  moveDog=function(){
    const world=worldState();
    if(!world.ready) return baseMoveDog();
    if(!world.dog.path.length) setDogTarget(world,chooseWorldTarget(world));
  };
  renderMap=function(){
    canvasSetup();
    drawWorld();
  };

  window.worldV27={
    rebuild:()=>{ buildWorld(); spawnEnemies(); render(); },
    findPath:(from,to)=>findPath(worldState(),from,to),
    state:()=>worldState(),
  };

  if(state.map?.length) buildWorld();
  const mapHeading=$('map')?.closest('.map-panel')?.querySelector('h2');
  if(mapHeading) mapHeading.textContent='Raid World';
  cancelAnimationFrame(frame);
  frame=requestAnimationFrame(loop);
  render();
})();
