(function(){
  const WORLD_W=48;
  const WORLD_H=32;
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
    exit:'assets/tile-event.svg',
    empty:'assets/tile-empty.svg',
  };
  const PALETTES={
    city:{floor:'#34363a',floor2:'#2c2f33',wall:'#17191c',line:'#565a60',accent:'#d2b870',fog:'#111317'},
    sewer:{floor:'#263a31',floor2:'#1f3029',wall:'#0d1814',line:'#426a55',accent:'#87bd88',fog:'#0c1512'},
    factory:{floor:'#3b302a',floor2:'#302621',wall:'#171311',line:'#74513d',accent:'#db894c',fog:'#15110f'},
    farmland:{floor:'#3d4028',floor2:'#33351f',wall:'#171b12',line:'#626a37',accent:'#d5b960',fog:'#11140e'},
  };
  const BIOME_DECOR={
    city:[
      {src:'assets/env-city-rubble.svg',size:30},
      {src:'assets/env-city-car.svg',size:45},
      {src:'assets/env-city-lamp.svg',size:34},
    ],
    sewer:[
      {src:'assets/env-sewer-pipe.svg',size:40},
      {src:'assets/env-sewer-sludge.svg',size:34},
      {src:'assets/env-sewer-grate.svg',size:30},
    ],
    factory:[
      {src:'assets/env-factory-machine.svg',size:44},
      {src:'assets/env-factory-barrel.svg',size:31},
      {src:'assets/env-factory-pallet.svg',size:36},
    ],
    farmland:[
      {src:'assets/env-farmland-hay.svg',size:38},
      {src:'assets/env-farmland-fence.svg',size:42},
      {src:'assets/env-farmland-cart.svg',size:44},
    ],
  };
  const BIOME_CACHES={
    city:'assets/cache-city.svg',
    sewer:'assets/cache-sewer.svg',
    factory:'assets/cache-factory.svg',
    farmland:'assets/cache-farmland.svg',
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

  function carveRoom(world,left,top,w,h){
    for(let y=top;y<top+h;y++) for(let x=left;x<left+w;x++) carveCell(world,x,y);
    return {left,top,w,h,cx:left+Math.floor(w/2),cy:top+Math.floor(h/2)};
  }

  function carveCorridor(world,a,b,rng,width=2){
    let x=a.x;
    let y=a.y;
    const horizontalFirst=rng()>.5;
    const dig=()=>{ for(let offset=0;offset<width;offset++) carveCell(world,x+(horizontalFirst?0:offset),y+(horizontalFirst?offset:0)); };
    const stepX=()=>{ while(x!==b.x){ x+=Math.sign(b.x-x); dig(); } };
    const stepY=()=>{ while(y!==b.y){ y+=Math.sign(b.y-y); dig(); } };
    dig();
    if(horizontalFirst){ stepX(); stepY(); } else { stepY(); stepX(); }
  }

  function addChamber(world,left,top,w,h,label){
    const chamber={...carveRoom(world,left,top,w,h),index:world.chambers.length,label};
    world.chambers.push(chamber);
    return chamber;
  }

  function carveBand(world,x1,y1,x2,y2,width=2){
    const horizontal=y1===y2;
    if(horizontal){
      const start=Math.min(x1,x2);
      const end=Math.max(x1,x2);
      for(let x=start;x<=end;x++) for(let offset=0;offset<width;offset++) carveCell(world,x,y1+offset);
    }else{
      const start=Math.min(y1,y2);
      const end=Math.max(y1,y2);
      for(let y=start;y<=end;y++) for(let offset=0;offset<width;offset++) carveCell(world,x1+offset,y);
    }
  }

  function buildCityLayout(world,rng){
    world.layoutKind='city-grid';
    [7,16,25].forEach(y=>carveBand(world,2,y,45,y,3));
    [8,23,38].forEach(x=>carveBand(world,x,2,x,29,3));
    const blocks=[
      [2,2,6,5],[11,2,11,5],[26,2,11,5],[41,2,5,5],
      [2,11,6,5],[11,11,11,5],[26,11,11,5],[41,11,5,5],
      [2,20,6,5],[11,20,11,5],[26,20,11,5],[41,20,5,5],
      [11,28,11,3],[26,28,11,3],
    ];
    blocks.forEach((block,index)=>{
      const chamber=addChamber(world,...block,index%3===0?'courtyard':'building');
      const streetX=chamber.cx<16?8:chamber.cx<32?23:38;
      carveBand(world,Math.min(chamber.cx,streetX),chamber.cy,Math.max(chamber.cx,streetX),chamber.cy,2);
    });
    carveBand(world,4,29,43,29,2);
  }

  function buildSewerLayout(world,rng){
    world.layoutKind='sewer-network';
    carveBand(world,5,5,42,5,3);
    carveBand(world,5,25,42,25,3);
    carveBand(world,5,5,5,27,3);
    carveBand(world,40,5,40,27,3);
    carveBand(world,23,5,23,27,3);
    carveBand(world,5,15,42,15,3);
    [[3,3,7,6],[20,3,8,6],[38,3,7,6],[3,13,7,6],[20,13,8,6],[38,13,7,6],
      [3,23,7,7],[20,23,8,7],[38,23,7,7],[12,10,7,5],[30,19,7,5]].forEach((room,index)=>{
      addChamber(world,...room,index%3===1?'junction':'maintenance');
    });
    carveBand(world,8,9,23,9,2);
    carveBand(world,25,21,40,21,2);
    carveBand(world,14,9,14,16,2);
    carveBand(world,33,16,33,21,2);
  }

  function buildFactoryLayout(world,rng){
    world.layoutKind='factory-floor';
    const halls=[
      [2,3,13,9,'loading bay'],[18,2,14,11,'assembly'],[35,4,11,8,'warehouse'],
      [3,17,17,12,'machine hall'],[23,16,10,7,'control'],[36,17,10,12,'storage'],
      [23,25,10,5,'utilities'],
    ];
    halls.forEach(hall=>addChamber(world,...hall));
    carveBand(world,14,7,18,7,3);
    carveBand(world,31,7,35,7,3);
    carveBand(world,9,11,9,18,3);
    carveBand(world,19,20,24,20,3);
    carveBand(world,31,19,36,19,3);
    carveBand(world,28,11,28,17,3);
    carveBand(world,28,21,28,26,3);
    carveBand(world,10,14,41,14,2);
    carveBand(world,16,7,16,25,2);
    carveBand(world,33,8,33,26,2);
  }

  function buildFarmlandLayout(world,rng){
    world.layoutKind='farm-tracks';
    const clearings=[
      [2,3,11,8,'farmhouse'],[18,2,12,8,'orchard'],[36,3,10,9,'barn'],
      [4,18,13,11,'west field'],[21,16,11,8,'pond'],[36,19,10,10,'east field'],
      [20,26,12,5,'farmyard'],
    ];
    clearings.forEach(room=>addChamber(world,...room));
    const tracks=[
      [{x:8,y:8},{x:24,y:7}],[{x:24,y:7},{x:41,y:8}],
      [{x:8,y:8},{x:10,y:23}],[{x:10,y:23},{x:26,y:20}],
      [{x:26,y:20},{x:41,y:24}],[{x:26,y:20},{x:26,y:28}],
      [{x:24,y:7},{x:26,y:20}],[{x:10,y:23},{x:26,y:28}],
      [{x:41,y:8},{x:41,y:24}],
    ];
    tracks.forEach(([a,b],index)=>carveCorridor(world,a,b,rng,index%3===0?3:2));
    addChamber(world,14,11,7,5,'hedgerow gap');
    addChamber(world,31,11,7,5,'crossroads');
    carveBand(world,17,13,34,13,2);
  }

  function buildBiomeLayout(world,rng){
    const builders={
      city:buildCityLayout,
      sewer:buildSewerLayout,
      factory:buildFactoryLayout,
      farmland:buildFarmlandLayout,
    };
    (builders[biomeKey()] || buildCityLayout)(world,rng);
  }

  function splitRegion(region,depth,rng,leaves){
    const canVertical=region.w>=15;
    const canHorizontal=region.h>=12;
    if(depth<=0 || (!canVertical && !canHorizontal)){
      leaves.push(region);
      return {region,leaf:true};
    }
    let vertical;
    if(!canHorizontal) vertical=true;
    else if(!canVertical) vertical=false;
    else if(region.w/region.h>1.25) vertical=true;
    else if(region.h/region.w>1.25) vertical=false;
    else vertical=rng()>.5;
    const span=vertical?region.w:region.h;
    const minimum=vertical?7:6;
    const split=clamp(Math.floor(span*(.38+rng()*.24)),minimum,span-minimum);
    const first=vertical
      ? {x:region.x,y:region.y,w:split,h:region.h}
      : {x:region.x,y:region.y,w:region.w,h:split};
    const second=vertical
      ? {x:region.x+split,y:region.y,w:region.w-split,h:region.h}
      : {x:region.x,y:region.y+split,w:region.w,h:region.h-split};
    return {
      region,
      vertical,
      first:splitRegion(first,depth-1,rng,leaves),
      second:splitRegion(second,depth-1,rng,leaves),
    };
  }

  function roomInLeaf(world,leaf,rng,index){
    const marginX=1+Math.floor(rng()*Math.min(3,Math.max(1,(leaf.w-5)/2)));
    const marginY=1+Math.floor(rng()*Math.min(3,Math.max(1,(leaf.h-4)/2)));
    const maxW=Math.max(5,leaf.w-marginX-1);
    const maxH=Math.max(4,leaf.h-marginY-1);
    const w=clamp(5+Math.floor(rng()*Math.max(1,maxW-4)),5,maxW);
    const h=clamp(4+Math.floor(rng()*Math.max(1,maxH-3)),4,maxH);
    const left=clamp(leaf.x+marginX,1,WORLD_W-w-1);
    const top=clamp(leaf.y+marginY,1,WORLD_H-h-1);
    return {...carveRoom(world,left,top,w,h),index};
  }

  function connectPartition(world,node,rng){
    if(node.leaf) return world.chambers.find(room=>room.leaf===node.region);
    const first=connectPartition(world,node.first,rng);
    const second=connectPartition(world,node.second,rng);
    const a={
      x:clamp(first.cx+Math.floor((rng()-.5)*Math.min(4,first.w-2)),first.left+1,first.left+first.w-2),
      y:clamp(first.cy+Math.floor((rng()-.5)*Math.min(3,first.h-2)),first.top+1,first.top+first.h-2),
    };
    const b={
      x:clamp(second.cx+Math.floor((rng()-.5)*Math.min(4,second.w-2)),second.left+1,second.left+second.w-2),
      y:clamp(second.cy+Math.floor((rng()-.5)*Math.min(3,second.h-2)),second.top+1,second.top+second.h-2),
    };
    carveCorridor(world,a,b,rng,rng()>.82?3:2);
    world.connections.push({a:first.index,b:second.index});
    return rng()>.5?first:second;
  }

  function chamberDistance(a,b){
    return Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy);
  }

  function roomCell(chamber,rng,occupied){
    for(let attempt=0;attempt<80;attempt++){
      const x=chamber.left+1+Math.floor(rng()*Math.max(1,chamber.w-2));
      const y=chamber.top+1+Math.floor(rng()*Math.max(1,chamber.h-2));
      if(!occupied.has(key(x,y))){
        occupied.add(key(x,y));
        return {x,y};
      }
    }
    return {x:chamber.cx,y:chamber.cy};
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
    const rng=worldRandom(`${state.mapSeed}-world-v28`);
    const world={
      width:WORLD_W,
      height:WORLD_H,
      tileSize:TILE,
      tiles:Array.from({length:WORLD_H},()=>Array(WORLD_W).fill(0)),
      rooms:[],
      chambers:[],
      connections:[],
      props:[],
      decor:[],
      enemies:[],
      dog:{x:2,y:2,path:[],targetProp:null,facing:1,moving:false},
      discovered:new Set(),
      searched:0,
      camera:{x:0,y:0},
      seed:state.mapSeed,
      ready:true,
    };

    buildBiomeLayout(world,rng);

    const entranceNode=state.map.find(room=>room.role==='entrance') || state.map[0];
    const terminalNode=state.map.find(room=>['boss','exit'].includes(room.type) || ['boss','exit'].includes(room.role));
    const entranceChamber=world.chambers.reduce((best,room)=>room.cx+room.cy<best.cx+best.cy?room:best,world.chambers[0]);
    const terminalChamber=world.chambers.reduce((best,room)=>chamberDistance(entranceChamber,room)>chamberDistance(entranceChamber,best)?room:best,world.chambers[0]);
    const assignments=new Map();
    assignments.set(entranceNode.id,entranceChamber);
    if(terminalNode) assignments.set(terminalNode.id,terminalChamber);
    const available=world.chambers
      .filter(room=>room!==entranceChamber && room!==terminalChamber)
      .sort((a,b)=>chamberDistance(entranceChamber,a)-chamberDistance(entranceChamber,b));
    state.map.forEach((room,index)=>{
      if(!assignments.has(room.id)) assignments.set(room.id,available[index%Math.max(1,available.length)] || entranceChamber);
      world.rooms[room.id]={...assignments.get(room.id),nodeId:room.id};
    });

    const occupied=new Set([key(entranceChamber.cx,entranceChamber.cy)]);
    state.map.forEach(room=>{
      const chamber=assignments.get(room.id);
      const position=roomCell(chamber,rng,occupied);
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

    const decorOptions=BIOME_DECOR[biomeKey()] || BIOME_DECOR.city;
    world.chambers.forEach(chamber=>{
      const count=2+Math.floor(rng()*4);
      for(let i=0;i<count;i++){
        const position=roomCell(chamber,rng,occupied);
        const option=decorOptions[(chamber.index+i)%decorOptions.length];
        world.decor.push({...option,x:position.x+.5,y:position.y+.5,flip:rng()>.5?-1:1,alpha:.76+rng()*.2});
      }
    });

    const start=world.rooms[entranceNode.id];
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
    const room=state.map.find(item=>item.id===prop.roomId);
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
    const room=state.map.find(item=>item.id===prop.roomId);
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
      const biome=biomeKey();
      const variation=(x*37+y*61)%17;
      if(biome==='city' && variation===0){
        ctx.strokeStyle='rgba(222,215,188,.22)';
        ctx.beginPath();
        ctx.moveTo(px+5,py+7);
        ctx.lineTo(px+13,py+12);
        ctx.lineTo(px+9,py+21);
        ctx.stroke();
      }else if(biome==='sewer' && variation<2){
        ctx.fillStyle='rgba(98,166,117,.17)';
        ctx.beginPath();
        ctx.ellipse(px+14,py+17,9,4,0,0,Math.PI*2);
        ctx.fill();
      }else if(biome==='factory' && variation===1){
        ctx.fillStyle='rgba(219,137,76,.2)';
        for(let stripe=-8;stripe<32;stripe+=9){
          ctx.beginPath();
          ctx.moveTo(px+stripe,py+TILE);
          ctx.lineTo(px+stripe+5,py+TILE);
          ctx.lineTo(px+stripe+TILE,py);
          ctx.lineTo(px+stripe+TILE-5,py);
          ctx.fill();
        }
      }else if(biome==='farmland' && variation<3){
        ctx.strokeStyle='rgba(191,190,104,.2)';
        ctx.beginPath();
        ctx.moveTo(px+8,py+22);
        ctx.quadraticCurveTo(px+11,py+11,px+13,py+6);
        ctx.moveTo(px+13,py+14);
        ctx.lineTo(px+18,py+10);
        ctx.stroke();
      }
      ctx.fillStyle='rgba(0,0,0,.22)';
      if(!floorAt(world,x,y-1)) ctx.fillRect(px,py,TILE,4);
      if(!floorAt(world,x-1,y)) ctx.fillRect(px,py,4,TILE);
      ctx.fillStyle='rgba(255,255,255,.08)';
      if(!floorAt(world,x,y+1)) ctx.fillRect(px,py+TILE-2,TILE,2);
      if(!floorAt(world,x+1,y)) ctx.fillRect(px+TILE-2,py,2,TILE);
    }else{
      ctx.fillStyle=palette.wall;
      ctx.fillRect(px,py,TILE,TILE);
      if((x*13+y*7)%11===0){
        ctx.fillStyle='rgba(255,255,255,.025)';
        ctx.fillRect(px+4,py+5,TILE-8,4);
      }
    }
  }

  function drawDecor(ctx,item){
    const img=image(item.src);
    if(!img.complete) return;
    ctx.save();
    ctx.globalAlpha=item.alpha;
    ctx.translate(item.x*TILE,item.y*TILE);
    ctx.scale(item.flip,1);
    ctx.drawImage(img,-item.size/2,-item.size*.7,item.size,item.size);
    ctx.restore();
  }

  function drawProp(ctx,world,prop,time){
    if(prop.searched) return;
    const room=state.map.find(item=>item.id===prop.roomId);
    if(!room || room.type==='empty') return;
    const src=(room.type==='crate' || room.type==='rare')
      ? BIOME_CACHES[biomeKey()]
      : PROP_ASSETS[room.type] || PROP_ASSETS.empty;
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

  function auditWorld(world=worldState()){
    if(!world.ready) return {ready:false};
    const start={x:Math.floor(world.dog.x),y:Math.floor(world.dog.y)};
    const queue=[start];
    const seen=new Set([key(start.x,start.y)]);
    while(queue.length){
      const current=queue.shift();
      neighbours(world,current.x,current.y).forEach(next=>{
        const id=key(next.x,next.y);
        if(!seen.has(id)){
          seen.add(id);
          queue.push(next);
        }
      });
    }
    const floorCount=world.tiles.flat().filter(Boolean).length;
    const terminal=world.props.find(prop=>{
      const room=state.map.find(item=>item.id===prop.roomId);
      return ['boss','exit'].includes(room?.type) || ['boss','exit'].includes(room?.role);
    });
    const terminalPath=terminal ? findPath(world,start,terminal) : [];
    return {
      ready:true,
      layoutKind:world.layoutKind,
      chambers:world.chambers.length,
      connections:world.connections.length,
      floorCount,
      reachableFloorCount:seen.size,
      connected:seen.size===floorCount,
      terminalReachable:!!terminal && (terminalPath.length>0 || distance2d(start,terminal)<1),
      propsOnFloor:world.props.every(prop=>floorAt(world,Math.floor(prop.x),Math.floor(prop.y))),
      decorOnFloor:world.decor.every(item=>floorAt(world,Math.floor(item.x),Math.floor(item.y))),
    };
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
    world.decor.forEach(item=>drawDecor(ctx,item));
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
    if(overlay) overlay.textContent=`${world.searched}/${world.props.filter(prop=>state.map.find(room=>room.id===prop.roomId)?.type!=='base').length} searched · ${world.enemies.filter(enemy=>enemy.active).length} hostiles`;
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

  window.worldV28={
    rebuild:()=>{ buildWorld(); spawnEnemies(); render(); },
    findPath:(from,to)=>findPath(worldState(),from,to),
    state:()=>worldState(),
    audit:()=>auditWorld(),
  };

  if(state.map?.length) buildWorld();
  const mapHeading=$('map')?.closest('.map-panel')?.querySelector('h2');
  if(mapHeading) mapHeading.textContent='Raid World';
  cancelAnimationFrame(frame);
  frame=requestAnimationFrame(loop);
  render();
})();
