(function(){
  const W=48,H=32,VW=30,VH=20,T=24;
  const palettes={
    city:['#34363a','#2c2f33','#20242a','#565a60'],
    sewer:['#263a31','#1f3029','#14261f','#426a55'],
    factory:['#3b302a','#302621','#211b18','#74513d'],
    farmland:['#3d4028','#33351f','#202613','#626a37'],
  };
  const art={
    base:'assets/sprites/v34/loot/03-06.png',crate:'assets/sprites/v34/loot/01-01.png',tree:'assets/tile-tree.svg',
    grove:'assets/tile-grove.svg',food:'assets/sprites/v34/loot/01-04.png',water:'assets/sprites/v34/loot/01-05.png',
    scrap:'assets/sprites/v34/loot/01-06.png',medical:'assets/sprites/v34/loot/01-03.png',weapon:'assets/sprites/v34/loot/02-01.png',
    event:'assets/tile-event.svg',exit:'assets/sprites/v36/floor-exit.svg',trader:'assets/sprites/v34/loot/03-04.png',
    enemy:'assets/tile-enemy.svg',rare:'assets/sprites/v34/loot/02-03.png',boss:'assets/sprites/v34/loot/02-03.png',
  };
  const cache=new Map();
  const WALK_FRAMES=[0,1,0,2];
  let frame=0,last=performance.now(),baseGenerate=generateMap,baseMove=moveDog;
  const K=(x,y)=>`${x},${y}`;
  const inside=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  const floor=(w,x,y)=>inside(x,y)&&w.tiles[y][x]===1;
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const SHIBA_FRAMES=[
    'assets/sprites/v34/dog/01.png','assets/sprites/v34/dog/02.png',
    'assets/sprites/v34/dog/03.png','assets/sprites/v34/dog/04.png',
    'assets/sprites/v34/dog/05.png','assets/sprites/v34/dog/06.png',
    'assets/sprites/v34/dog/07.png','assets/sprites/v34/dog/08.png',
  ];
  const SHIBA_DIRECTIONAL=Object.fromEntries(['down','left','up','right'].map(direction=>[
    direction,Array.from({length:4},(_,i)=>`assets/sprites/v36/dog/${direction}/${String(i+1).padStart(2,'0')}.svg`)
  ]));
  const BREED_FRAMES=Object.fromEntries(['jack','collie','dachshund','pom','bulldog','lab','greyhound'].map(key=>[
    key,Array.from({length:5},(_,i)=>`assets/sprites/v34/breeds/${key}/${String(i+1).padStart(2,'0')}.png`)
  ]));
  function activeBreedKey(){
    const rosterDog=state.roster?.find(item=>item.id===state.dogId);
    return rosterDog?.breed||'shiba';
  }
  const ENEMY_FRAMES={
    rat:Array.from({length:6},(_,i)=>`assets/sprites/v34/enemies/01-${String(i+1).padStart(2,'0')}.png`),
    raccoon:Array.from({length:6},(_,i)=>`assets/sprites/v34/enemies/02-${String(i+1).padStart(2,'0')}.png`),
    crow:Array.from({length:6},(_,i)=>`assets/sprites/v34/enemies/03-${String(i+1).padStart(2,'0')}.png`),
    stray:Array.from({length:6},(_,i)=>`assets/sprites/v34/enemies/04-${String(i+1).padStart(2,'0')}.png`),
  };
  const ENVIRONMENT={
    city:Array.from({length:6},(_,i)=>`assets/sprites/v34/environment/01-${String(i+1).padStart(2,'0')}.png`),
    sewer:Array.from({length:6},(_,i)=>`assets/sprites/v34/environment/02-${String(i+1).padStart(2,'0')}.png`),
    factory:Array.from({length:6},(_,i)=>`assets/sprites/v34/environment/03-${String(i+1).padStart(2,'0')}.png`),
    farmland:Array.from({length:6},(_,i)=>`assets/sprites/v34/environment/04-${String(i+1).padStart(2,'0')}.png`),
  };
  function enemyKind(enemy){
    const src=String(enemy?.template?.sprite||enemy?.sprite||'').toLowerCase(),name=String(enemy?.template?.name||enemy?.name||'').toLowerCase();
    if(src.includes('crow')||name.includes('crow'))return'crow';
    if(src.includes('raccoon')||name.includes('raccoon')||name.includes('tyrant'))return'raccoon';
    if(src.includes('stray')||src.includes('alpha')||name.includes('hound')||name.includes('dog'))return'stray';
    return'rat';
  }
  function weaponProfile(){
    const equipped=window.gearV32?.activeWeapon?.();
    if(equipped) return {
      name:equipped.name, range:equipped.range||5.8,
      color:equipped.weaponClass==='rifle'?'#8ee8ff':equipped.weaponClass==='shotgun'?'#ffd36b':equipped.weaponClass?.includes('machine')||equipped.weaponClass==='smg'?'#ffe28a':'#ffc75b',
      width:equipped.weaponClass==='shotgun'?4:equipped.weaponClass==='rifle'?2:3,
      speed:equipped.weaponClass==='rifle'?27:equipped.weaponClass==='shotgun'?18:22,
    };
    const name=String(state.equipment?.weapon?.name||'pistol').toLowerCase();
    if(name.includes('shotgun')) return {name:'Shotgun',range:3.4,color:'#ffd36b',width:4,speed:18};
    if(name.includes('rifle')||name.includes('carbine')) return {name:'Rifle',range:8.5,color:'#8ee8ff',width:2,speed:27};
    if(name.includes('smg')||name.includes('machine')) return {name:'SMG',range:5.4,color:'#ffe28a',width:2,speed:24};
    if(name.includes('bow')||name.includes('crossbow')) return {name:'Bolt',range:7,color:'#d8ff9a',width:2,speed:16};
    if(name.includes('blade')||name.includes('bat')||name.includes('club')) return {name:'Melee',range:1.15,color:'#ffffff',width:0,speed:0};
    return {name:'Pistol',range:5.8,color:'#ffc75b',width:3,speed:22};
  }
  function enemyProfile(enemy){
    const name=String(enemy?.name||'').toLowerCase();
    if(name.includes('crow')) return {name:'Scrap rifle',range:7,color:'#ef8cff',width:2,speed:22};
    if(name.includes('raccoon')) return {name:'Junk pistol',range:5.8,color:'#ff8b67',width:3,speed:18};
    if(name.includes('rat')) return {name:'Sling shot',range:4.8,color:'#c6ef73',width:3,speed:14};
    return {name:'Close assault',range:3.8,color:'#ff6c69',width:3,speed:16};
  }
  function lineOfSight(w,a,b){
    let x0=Math.floor(a.x),y0=Math.floor(a.y),x1=Math.floor(b.x),y1=Math.floor(b.y);
    const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;
    let error=dx+dy;
    while(true){
      if(!floor(w,x0,y0)) return false;
      if(x0===x1&&y0===y1) return true;
      const e2=2*error;
      if(e2>=dy){error+=dy;x0+=sx;}
      if(e2<=dx){error+=dx;y0+=sy;}
    }
  }
  function rng(seed){
    let v=2166136261;
    for(const c of String(seed)){v^=c.charCodeAt(0);v=Math.imul(v,16777619);}
    return()=>{v+=0x6D2B79F5;let t=v;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
  }
  function img(src){
    if(!cache.has(src)){const i=new Image();i.src=src;cache.set(src,i);}
    return cache.get(src);
  }
  function cell(w,x,y){if(inside(x,y))w.tiles[y][x]=1;}
  function room(w,x,y,width,height,label){
    for(let yy=y;yy<y+height;yy++)for(let xx=x;xx<x+width;xx++)cell(w,xx,yy);
    const value={x,y,w:width,h:height,cx:x+Math.floor(width/2),cy:y+Math.floor(height/2),label,index:w.rooms.length};
    w.rooms.push(value);return value;
  }
  function band(w,x1,y1,x2,y2,width=2){
    if(y1===y2)for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)for(let n=0;n<width;n++)cell(w,x,y1+n);
    else for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)for(let n=0;n<width;n++)cell(w,x1+n,y);
  }
  function corridor(w,a,b,r,width=2){
    let x=a.x,y=a.y;
    const dig=()=>{for(let n=0;n<width;n++){cell(w,x+n,y);cell(w,x,y+n);}};
    const sx=()=>{while(x!==b.x){x+=Math.sign(b.x-x);dig();}};
    const sy=()=>{while(y!==b.y){y+=Math.sign(b.y-y);dig();}};
    dig();if(r()>.5){sx();sy();}else{sy();sx();}
  }
  function layout(w,r){
    const key=biomeKey();
    w.kind={city:'city-grid',sewer:'sewer-network',factory:'factory-floor',farmland:'farm-tracks'}[key];
    if(key==='city'){
      [7,16,25].forEach(y=>band(w,2,y,45,y,3));[8,23,38].forEach(x=>band(w,x,2,x,29,3));
      [[2,2,6,5],[11,2,11,5],[26,2,11,5],[41,2,5,5],[2,11,6,5],[11,11,11,5],[26,11,11,5],[41,11,5,5],[2,20,6,5],[11,20,11,5],[26,20,11,5],[41,20,5,5],[11,28,11,3],[26,28,11,3]].forEach((v,i)=>room(w,...v,i%3?'building':'courtyard'));
      band(w,4,29,43,29,2);
    }else if(key==='sewer'){
      band(w,5,5,42,5,3);band(w,5,25,42,25,3);band(w,5,5,5,27,3);band(w,40,5,40,27,3);band(w,23,5,23,27,3);band(w,5,15,42,15,3);
      [[3,3,7,6],[20,3,8,6],[38,3,7,6],[3,13,7,6],[20,13,8,6],[38,13,7,6],[3,23,7,7],[20,23,8,7],[38,23,7,7],[12,10,7,5],[30,19,7,5]].forEach((v,i)=>room(w,...v,i%3===1?'junction':'maintenance'));
      band(w,8,9,23,9);band(w,25,21,40,21);band(w,14,9,14,16);band(w,33,16,33,21);
    }else if(key==='factory'){
      [[2,3,13,9],[18,2,14,11],[35,4,11,8],[3,17,17,12],[23,16,10,7],[36,17,10,12],[23,25,10,5]].forEach((v,i)=>room(w,...v,'hall '+(i+1)));
      band(w,14,7,18,7,3);band(w,31,7,35,7,3);band(w,9,11,9,18,3);band(w,19,20,24,20,3);band(w,31,19,36,19,3);band(w,28,11,28,26,3);band(w,10,14,41,14);band(w,16,7,16,25);band(w,33,8,33,26);
    }else{
      [[2,3,11,8],[18,2,12,8],[36,3,10,9],[4,18,13,11],[21,16,11,8],[36,19,10,10],[20,26,12,5],[14,11,7,5],[31,11,7,5]].forEach((v,i)=>room(w,...v,'field '+(i+1)));
      [[8,8,24,7],[24,7,41,8],[8,8,10,23],[10,23,26,20],[26,20,41,24],[26,20,26,28],[24,7,26,20],[10,23,26,28],[41,8,41,24]].forEach((v,i)=>corridor(w,{x:v[0],y:v[1]},{x:v[2],y:v[3]},r,i%3?2:3));
      band(w,17,13,34,13);
    }
  }
  function nearFloor(w,x,y){
    if(floor(w,x,y))return{x,y};
    for(let d=1;d<10;d++)for(let yy=y-d;yy<=y+d;yy++)for(let xx=x-d;xx<=x+d;xx++)if(floor(w,xx,yy))return{x:xx,y:yy};
    return{x:2,y:2};
  }
  function neighbours(w,x,y){return[[1,0],[-1,0],[0,1],[0,-1]].map(v=>({x:x+v[0],y:y+v[1]})).filter(v=>floor(w,v.x,v.y));}
  function path(w,a,b){
    const start={x:Math.floor(a.x),y:Math.floor(a.y)},end=nearFloor(w,Math.floor(b.x),Math.floor(b.y)),q=[start],prev=new Map([[K(start.x,start.y),null]]);
    while(q.length){const c=q.shift();if(c.x===end.x&&c.y===end.y)break;for(const n of neighbours(w,c.x,c.y)){const k=K(n.x,n.y);if(!prev.has(k)){prev.set(k,c);q.push(n);}}}
    if(!prev.has(K(end.x,end.y)))return[];
    const result=[];let c=end;while(c&&!(c.x===start.x&&c.y===start.y)){result.unshift({x:c.x+.5,y:c.y+.5});c=prev.get(K(c.x,c.y));}return result;
  }
  function reveal(w,x,y,d=5){for(let yy=Math.floor(y)-d;yy<=y+d;yy++)for(let xx=Math.floor(x)-d;xx<=x+d;xx++)if(inside(xx,yy)&&Math.hypot(xx-x,yy-y)<=d+.5)w.seen.add(K(xx,yy));}
  function build(){
    const r=rng(`${state.mapSeed}-world-v29`),w={tiles:Array.from({length:H},()=>Array(W).fill(0)),rooms:[],nodeRooms:[],props:[],enemies:[],projectiles:[],particles:[],dog:{x:2,y:2,path:[],target:null,facing:1,direction:'down',poseUntil:0,hitUntil:0,trailAt:0},camera:{x:0,y:0,shakeUntil:0,shakePower:0},seen:new Set(),searched:0,ready:true};
    layout(w,r);
    const entrance=state.map.find(v=>v.role==='entrance')||state.map[0],terminal=state.map.find(v=>['boss','exit'].includes(v.type)||['boss','exit'].includes(v.role));
    const start=w.rooms.reduce((a,b)=>Math.hypot(a.cx-W/2,a.cy-H/2)<Math.hypot(b.cx-W/2,b.cy-H/2)?a:b,w.rooms[0]),finish=w.rooms.reduce((a,b)=>Math.abs(b.cx-start.cx)+Math.abs(b.cy-start.cy)>Math.abs(a.cx-start.cx)+Math.abs(a.cy-start.cy)?b:a,w.rooms[0]);
    const available=w.rooms.filter(v=>v!==start&&v!==finish);state.map.forEach((node,i)=>{const rr=node===entrance?start:node===terminal?finish:available[i%available.length];w.nodeRooms[node.id]=rr;const x=rr.x+1+Math.floor(r()*Math.max(1,rr.w-2)),y=rr.y+1+Math.floor(r()*Math.max(1,rr.h-2));w.props.push({roomId:node.id,x:x+.5,y:y+.5,searched:node.cleared,pulse:r()*6});});
    w.dog.x=start.cx+.5;w.dog.y=start.cy+.5;reveal(w,w.dog.x,w.dog.y);state.world=w;return w;
  }
  function target(w){return w.props.filter(p=>{const n=state.map.find(v=>v.id===p.roomId);return n&&!p.searched&&!n.cleared&&n.type!=='base';}).sort((a,b)=>tilePriority(state.map.find(v=>v.id===b.roomId))-tilePriority(state.map.find(v=>v.id===a.roomId))||dist(w.dog,a)-dist(w.dog,b))[0];}
  function search(w){
    const p=w.props.find(v=>!v.searched&&dist(w.dog,v)<.85);if(!p)return false;
    const n=state.map.find(v=>v.id===p.roomId);p.searched=true;w.searched++;w.dog.path=[];w.dog.target=null;
    for(let i=0;i<12;i++)w.particles.push({x:p.x,y:p.y-.2,vx:(Math.random()-.5)*1.8,vy:-.5-Math.random()*1.4,life:.55+Math.random()*.35,max:.9,color:i%3?'#ffd56a':'#8be4ff',size:1.5+Math.random()*2});
    if(n){state.position={x:n.x,y:n.y};revealAround(n.x,n.y,state.dog.scoutRange);resolveTile(n);}return true;
  }
  function randomFloor(w,r,away){
    for(let i=0;i<500;i++){const x=1+Math.floor(r()*(W-2)),y=1+Math.floor(r()*(H-2));if(floor(w,x,y)&&dist({x,y},away)>6)return{x:x+.5,y:y+.5};}return{x:24.5,y:16.5};
  }
  function spawn(){
    const w=state.world;if(!w?.ready)return;const r=rng(`${state.mapSeed}-hostiles`);w.enemies=[];state.roamEnemies=[];
    for(let i=0;i<3+state.zoneId+(currentPlan().roamers||0);i++){const template=pick(currentZone().enemies),pos=randomFloor(w,r,w.dog),hp=Math.round(template.hp*(state.weather?.enemy||1)*currentPlan().enemy),patrol=randomFloor(w,r,pos),e={id:`world-enemy-${i}`,template,x:pos.x,y:pos.y,path:[],hp,maxHp:hp,active:true,facing:-1,think:r()*2,poseUntil:0,hitUntil:0,alert:'patrol',lastSeen:null,patrol,awareness:0};w.enemies.push(e);state.roamEnemies.push({id:e.id,template,sprite:template.sprite,name:template.name,hp,maxHp:hp,active:true,left:0,top:0,alert:e.alert});}
  }
  function syncEnemySource(e){const source=state.roamEnemies.find(v=>v.id===e.id);if(source){source.hp=e.hp;source.maxHp=e.maxHp;source.active=e.active;source.alert=e.alert;source.left=e.x;source.top=e.y;}return source;}
  function updateEnemyIntent(w,e,dt){
    const source=syncEnemySource(e);
    if(!e.active||source?.active===false){e.active=false;return false;}
    const ep=enemyProfile(e.template),distance=dist(e,w.dog),visible=lineOfSight(w,e,w.dog);
    const hearRange=5.5+state.zoneId*.6,spotRange=8+state.zoneId*.8+(e.template.behavior==='chaser'?2.5:0),attackRange=Math.min(Math.max(2.2,ep.range),Math.max(2.4,weaponProfile().range+.75));
    if(visible&&distance<=spotRange){e.awareness=Math.min(100,e.awareness+dt*(distance<=attackRange?170:95));e.lastSeen={x:w.dog.x,y:w.dog.y};}
    else if(distance<=hearRange){e.awareness=Math.min(82,e.awareness+dt*36);e.lastSeen=e.lastSeen||{x:w.dog.x,y:w.dog.y};}
    else e.awareness=Math.max(0,e.awareness-dt*18);
    const prior=e.alert;
    e.alert=e.awareness>82?'engaging':e.awareness>38?'investigating':'patrol';
    if(prior!==e.alert&&e.alert!=='patrol')e.poseUntil=performance.now()+450;
    if(e.alert==='engaging'&&visible&&distance<=attackRange){e.path=[];startCombat(e.template,false,e.id);return true;}
    e.think-=dt;
    if(e.think<=0||!e.path.length){
      const destination=e.alert==='engaging'?w.dog:e.alert==='investigating'?(e.lastSeen||w.dog):e.patrol;
      e.path=path(w,e,destination);
      if(e.alert==='patrol'&&(!e.path.length||dist(e,e.patrol)<1.1))e.patrol=randomFloor(w,Math.random,w.dog);
      e.think=e.alert==='patrol'?1.2+Math.random()*1.4:.35+Math.random()*.35;
    }
    return false;
  }
  function update(w,dt){
    if(!state.running||state.mode!=='roaming')return;
    if(!w.dog.path.length){if(search(w))return;const p=target(w);if(p){w.dog.target=p;w.dog.path=path(w,w.dog,p);}else endRaid(true);}
    const n=w.dog.path[0];if(n){if(!floor(w,Math.floor(n.x),Math.floor(n.y))){w.dog.path=[];w.dog.target=null;return;}const dx=n.x-w.dog.x,dy=n.y-w.dog.y,d=Math.hypot(dx,dy),speed=1.12+state.dog.speed*.18;if(Math.abs(dx)>Math.abs(dy)){w.dog.direction=dx<0?'left':'right';w.dog.facing=dx<0?-1:1;}else if(Math.abs(dy)>.02)w.dog.direction=dy<0?'up':'down';w.directionsSeen=w.directionsSeen||new Set();w.directionsSeen.add(w.dog.direction);if(d<speed*dt){if(floor(w,Math.floor(n.x),Math.floor(n.y))){w.dog.x=n.x;w.dog.y=n.y;}w.dog.path.shift();reveal(w,w.dog.x,w.dog.y,5);search(w);}else{const nextX=w.dog.x+dx/d*speed*dt,nextY=w.dog.y+dy/d*speed*dt;if(floor(w,Math.floor(nextX),Math.floor(nextY))){w.dog.x=clamp(nextX,.5,W-.5);w.dog.y=clamp(nextY,.5,H-.5);}else w.dog.path=[];}if(performance.now()-w.dog.trailAt>240){w.dog.trailAt=performance.now();w.particles.push({x:w.dog.x-w.dog.facing*.11,y:w.dog.y+.36,vx:(Math.random()-.5)*.08,vy:-.03-Math.random()*.05,life:.32+Math.random()*.12,max:.45,color:keyDust(),size:.8+Math.random()*.8});}}
    for(const e of w.enemies){
      if(updateEnemyIntent(w,e,dt))break;
      const p=e.path[0];
      if(p){const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy),speed=1.05;e.facing=dx<0?-1:1;if(d<speed*dt){e.x=p.x;e.y=p.y;e.path.shift();}else{e.x+=dx/d*speed*dt;e.y+=dy/d*speed*dt;}}
      syncEnemySource(e);
    }
    w.particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.9*dt;p.life-=dt;});
    w.particles=w.particles.filter(p=>p.life>0);
  }
  function keyDust(){return({city:'#a9a39b',sewer:'#72a88a',factory:'#bc825c',farmland:'#b4aa65'})[biomeKey()]||'#aaa';}
  function canvas(){
    const map=$('map');if(!map)return;let c=map.querySelector('#raidWorldCanvas');if(!c){map.innerHTML='';c=document.createElement('canvas');c.id='raidWorldCanvas';c.width=VW*T;c.height=VH*T;map.appendChild(c);const o=document.createElement('div');o.className='world-overlay';o.innerHTML='<span class="world-mode">AUTO SCAVENGE</span><span class="world-progress"></span>';map.appendChild(o);}return c;
  }
  function draw(time=performance.now()){
    const w=state.world,c=canvas();if(!w?.ready||!c)return;const x=c.getContext('2d'),key=biomeKey(),p=palettes[key]||palettes.city,camX=clamp(w.dog.x-VW/2,0,W-VW),camY=clamp(w.dog.y-VH/2,0,H-VH);w.camera.x=camX;w.camera.y=camY;const shaking=time<w.camera.shakeUntil&&!document.body.classList.contains('reduce-motion'),shakeX=shaking?(Math.random()-.5)*w.camera.shakePower:0,shakeY=shaking?(Math.random()-.5)*w.camera.shakePower:0;x.clearRect(0,0,c.width,c.height);x.save();x.translate(-w.camera.x*T+shakeX,-w.camera.y*T+shakeY);
    for(let y=0;y<H;y++)for(let xx=0;xx<W;xx++){
      x.fillStyle=floor(w,xx,y)?((xx+y)%2?p[0]:p[1]):p[2];x.fillRect(xx*T,y*T,T,T);
      if(floor(w,xx,y)){
        x.strokeStyle=p[3];x.globalAlpha=.18;x.strokeRect(xx*T+.5,y*T+.5,T-1,T-1);
        x.globalAlpha=.13;
        if(biomeKey()==='city'){x.strokeStyle='#b7bcc1';x.beginPath();x.moveTo(xx*T+4,y*T+T-5);x.lineTo(xx*T+T-4,y*T+5);x.stroke();}
        if(biomeKey()==='sewer'){x.fillStyle='#70c28d';x.beginPath();x.arc(xx*T+7+(y%3)*5,y*T+20,3,0,Math.PI*2);x.fill();}
        if(biomeKey()==='factory'){x.strokeStyle='#d78c4b';x.lineWidth=2;x.beginPath();x.moveTo(xx*T+3,y*T+8);x.lineTo(xx*T+T-3,y*T+8);x.stroke();}
        if(biomeKey()==='farmland'){x.strokeStyle='#9eb35e';x.beginPath();x.moveTo(xx*T+5,y*T+4);x.lineTo(xx*T+5,y*T+T-4);x.stroke();}
        x.globalAlpha=1;
      }else{
        x.globalAlpha=.26;
        if(key==='city'){x.strokeStyle='#626b73';x.strokeRect(xx*T+3,y*T+3,T-6,T-6);x.beginPath();x.moveTo(xx*T+4,y*T+8);x.lineTo(xx*T+T-4,y*T+8);x.stroke();}
        if(key==='sewer'){x.strokeStyle='#4e876c';x.beginPath();x.arc(xx*T+T/2,y*T+T/2,5+(xx+y)%4,0,Math.PI);x.stroke();}
        if(key==='factory'){x.strokeStyle='#8a5d43';x.beginPath();x.moveTo(xx*T+4,y*T+T/2);x.lineTo(xx*T+T-4,y*T+T/2);x.stroke();}
        if(key==='farmland'){x.strokeStyle='#758449';x.beginPath();x.moveTo(xx*T+5,y*T+3);x.lineTo(xx*T+5,y*T+T-3);x.moveTo(xx*T+12,y*T+3);x.lineTo(xx*T+12,y*T+T-3);x.stroke();}
        x.globalAlpha=1;
      }
    }
    const scenery=ENVIRONMENT[key]||ENVIRONMENT.city;
    for(let y=0;y<H;y++)for(let xx=0;xx<W;xx++){
      const adjacent=!floor(w,xx,y)&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>floor(w,xx+dx,y+dy));
      if(adjacent&&(xx*7+y*5)%4===0){
        const image=img(scenery[(xx*17+y*11)%scenery.length]);
        if(image.complete)x.drawImage(image,xx*T-6,y*T-12,T+12,T+12);
      }else if(floor(w,xx,y)&&(xx*31+y*19)%113===0){
        const image=img(scenery[2+((xx+y)%4)]);
        if(image.complete)x.save(),x.globalAlpha=.72,x.drawImage(image,xx*T-4,y*T-8,T+8,T+8),x.restore();
      }
    }
    const activeTarget=w.dog.target||w.dog.path?.[0];if(activeTarget){x.save();x.strokeStyle='#7ce8d4';x.fillStyle='rgba(124,232,212,.1)';x.lineWidth=2;x.setLineDash([7,6]);x.beginPath();x.moveTo(w.dog.x*T,w.dog.y*T-10);x.lineTo(activeTarget.x*T,activeTarget.y*T-10);x.stroke();x.setLineDash([]);x.beginPath();x.arc(activeTarget.x*T,activeTarget.y*T-10,10+Math.sin(time/160)*2,0,Math.PI*2);x.fill();x.stroke();x.restore();}
    for(const prop of w.props){if(prop.searched)continue;const n=state.map.find(v=>v.id===prop.roomId);if(!n||n.type==='empty')continue;const i=img(art[n.type]||art.event),size=n.type==='boss'?48:n.type==='exit'?54:34,bob=Math.sin(time/450+prop.pulse)*2;if(['crate','rare','weapon','medical','exit'].includes(n.type)){x.save();x.globalAlpha=.16+.07*Math.sin(time/260+prop.pulse);x.fillStyle=n.type==='rare'?'#bc85ff':'#72d9ff';x.beginPath();x.ellipse(prop.x*T,prop.y*T+8,size*.48,size*.22,0,0,Math.PI*2);x.fill();x.restore();}if(i.complete)x.drawImage(i,prop.x*T-size/2,prop.y*T-size/2+bob,size,size);}
    const actor=(a,src,size,facing,opts={})=>{const i=img(src);const bob=opts.bob||0,scaleX=opts.scaleX||1,scaleY=opts.scaleY||1;x.save();x.translate(a.x*T,a.y*T+bob);x.scale(facing*scaleX,scaleY);if(opts.shadow!==false){x.fillStyle='rgba(0,0,0,.26)';x.beginPath();x.ellipse(0,size*.18,size*.28,size*.065,0,0,Math.PI*2);x.fill();}if(i.complete)x.drawImage(i,-size/2,-size*.86,size,size);x.restore();};
    w.enemies.forEach(e=>{
      if(!e.active)return;
      const frames=ENEMY_FRAMES[enemyKind(e)],moving=e.path.length>0&&state.mode==='roaming';
      const pose=time<e.hitUntil?5:time<e.poseUntil?4:moving?1+Math.floor(time/190)%3:0;
      const resolvedEnemyFrame=window.spriteV43?.enemyMapFrame?.(e.template||e,Math.floor(time/210)%4,time<e.hitUntil);
      const alertColor=e.alert==='engaging'?'#ff6f70':e.alert==='investigating'?'#ffd166':'#73d7ff';
      const pulse=1+Math.sin(time/180)*.08,range=e.alert==='patrol'?3.2:e.alert==='investigating'?5.2:6.6;
      x.save();x.globalAlpha=e.alert==='patrol'?.13:e.alert==='investigating'?.2:.28;x.strokeStyle=alertColor;x.lineWidth=2;x.beginPath();x.arc(e.x*T,e.y*T-8,range*T*pulse,0,Math.PI*2);x.stroke();x.restore();
      if(time<e.poseUntil){x.save();x.globalAlpha=.25+.15*Math.sin(time/55);x.strokeStyle='#ff776e';x.lineWidth=2;x.beginPath();x.arc(e.x*T,e.y*T-13,23,0,Math.PI*2);x.stroke();x.restore();}
      actor(e,resolvedEnemyFrame||frames[pose],58,e.facing,{bob:moving?Math.sin(time/190)*1.1:0,scaleY:moving?1+Math.sin(time/190)*.015:1});
      x.save();x.font='800 10px system-ui, sans-serif';x.textAlign='center';x.fillStyle=alertColor;x.strokeStyle='rgba(0,0,0,.75)';x.lineWidth=3;const label=e.alert==='engaging'?'ENGAGE':e.alert==='investigating'?'ALERT':'PATROL';x.strokeText(label,e.x*T,e.y*T-54);x.fillText(label,e.x*T,e.y*T-54);x.restore();
      if(state.combat?.enemy?.sourceId===e.id&&state.combat.enemy.bossFight)drawBossDetails(x,e,state.combat.enemy,time);
    });
    const breedKey=activeBreedKey();
    if(breedKey==='shiba'){
      const moving=w.dog.path.length>0&&state.mode==='roaming';
      if(moving||time>=w.dog.poseUntil&&time>=w.dog.hitUntil){
        const direction=w.dog.direction||'down',frames=SHIBA_DIRECTIONAL[direction]||SHIBA_DIRECTIONAL.down;
        const step=moving?WALK_FRAMES[Math.floor(time/210)%WALK_FRAMES.length]:0;
        const footBob=moving?Math.sin(time/210*Math.PI*2)*.9:0;
        const resolvedDogFrame=window.spriteV43?.dogMapFrame?.('shiba',direction,step);
        actor(w.dog,resolvedDogFrame||frames[step]||frames[0],72,1,{bob:footBob,scaleY:moving?1+Math.sin(time/210*Math.PI*2)*.012:1});
      }else{
        const pose=time<w.dog.hitUntil?6:5;
        actor(w.dog,SHIBA_FRAMES[pose],72,w.dog.facing,{bob:0});
      }
    }else if(BREED_FRAMES[breedKey]){
      const moving=w.dog.path.length>0&&state.mode==='roaming';
      const step=moving?Math.floor(time/210)%4:0;
      const resolvedDogFrame=window.spriteV43?.dogMapFrame?.(breedKey,w.dog.direction||'down',step);
      actor(w.dog,resolvedDogFrame||BREED_FRAMES[breedKey][moving?1+step:0],70,w.dog.facing,{bob:moving?Math.sin(time/210*Math.PI*2)*.9:0});
    }else actor(w.dog,state.dog.sprite,48,w.dog.facing);
    w.projectiles=w.projectiles.filter(projectile=>{
      const elapsed=time-projectile.started,progress=clamp(elapsed/projectile.duration,0,1);
      const px=projectile.from.x+(projectile.to.x-projectile.from.x)*progress;
      const py=projectile.from.y+(projectile.to.y-projectile.from.y)*progress;
      const tail=Math.max(0,progress-.16);
      const tx=projectile.from.x+(projectile.to.x-projectile.from.x)*tail;
      const ty=projectile.from.y+(projectile.to.y-projectile.from.y)*tail;
      x.save();x.strokeStyle=projectile.color;x.fillStyle=projectile.color;x.lineWidth=projectile.width;x.shadowColor=projectile.color;x.shadowBlur=9;
      x.beginPath();x.moveTo(tx*T,ty*T-12);x.lineTo(px*T,py*T-12);x.stroke();
      x.beginPath();x.arc(px*T,py*T-12,Math.max(2,projectile.width),0,Math.PI*2);x.fill();
      if(progress>.82){x.globalAlpha=(progress-.82)/.18;x.beginPath();x.arc(projectile.to.x*T,projectile.to.y*T-12,5+progress*7,0,Math.PI*2);x.stroke();}
      x.restore();
      return progress<1;
    });
    for(const particle of w.particles){x.save();x.globalAlpha=Math.max(0,particle.life/particle.max);x.fillStyle=particle.color;x.beginPath();x.arc(particle.x*T,particle.y*T,particle.size,0,Math.PI*2);x.fill();x.restore();}
    const combatEnemy=w.enemies.find(e=>e.active&&e.id===state.combat?.enemy?.sourceId);
    x.fillStyle=p[2];x.globalAlpha=.94;for(let y=0;y<H;y++)for(let xx=0;xx<W;xx++){const combatVisible=state.mode==='combat'&&combatEnemy&&(Math.hypot(xx+.5-combatEnemy.x,y+.5-combatEnemy.y)<4.2||Math.hypot(xx+.5-w.dog.x,y+.5-w.dog.y)<3.6);if(!w.seen.has(K(xx,y))&&!combatVisible)x.fillRect(xx*T,y*T,T+1,T+1);}x.globalAlpha=1;
    if(state.mode==='combat'&&combatEnemy){x.save();x.strokeStyle='rgba(255,217,112,.85)';x.fillStyle='rgba(255,217,112,.1)';x.lineWidth=2;x.setLineDash([6,5]);x.beginPath();x.moveTo(w.dog.x*T,w.dog.y*T-28);x.lineTo(combatEnemy.x*T,combatEnemy.y*T-28);x.stroke();x.setLineDash([]);[w.dog,combatEnemy].forEach(a=>{x.beginPath();x.ellipse(a.x*T,a.y*T+3,26+Math.sin(time/120)*2,18,0,0,Math.PI*2);x.fill();x.stroke();});x.restore();}
    x.restore();
    const vignette=x.createRadialGradient(c.width/2,c.height/2,c.height*.22,c.width/2,c.height/2,c.width*.68);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(2,7,10,.38)');x.fillStyle=vignette;x.fillRect(0,0,c.width,c.height);
    const o=$('map')?.querySelector('.world-progress');if(o){const alerts=w.enemies.filter(v=>v.active&&v.alert!=='patrol').length;o.textContent=`${w.searched}/${w.props.filter(v=>state.map.find(n=>n.id===v.roomId)?.type!=='base').length} searched · ${w.enemies.filter(v=>v.active).length} hostiles${alerts?` · ${alerts} alerted`:''}`;}
  }
  function audit(){
    const w=state.world;if(!w?.ready)return{ready:false};const start={x:Math.floor(w.dog.x),y:Math.floor(w.dog.y)},q=[start],seen=new Set([K(start.x,start.y)]);while(q.length){const c=q.shift();for(const n of neighbours(w,c.x,c.y))if(!seen.has(K(n.x,n.y))){seen.add(K(n.x,n.y));q.push(n);}}const count=w.tiles.flat().filter(Boolean).length,term=w.props.find(v=>{const n=state.map.find(x=>x.id===v.roomId);return['boss','exit'].includes(n?.type);});return{ready:true,layoutKind:w.kind,chambers:w.rooms.length,floorCount:count,reachableFloorCount:seen.size,connected:seen.size===count,terminalReachable:!!term&&path(w,start,term).length>0,propsOnFloor:w.props.every(v=>floor(w,Math.floor(v.x),Math.floor(v.y))),dogOnFloor:floor(w,Math.floor(w.dog.x),Math.floor(w.dog.y)),cameraInBounds:w.camera.x>=0&&w.camera.x<=W-VW&&w.camera.y>=0&&w.camera.y<=H-VH,directionsSeen:[...(w.directionsSeen||[])],enemyAlerts:w.enemies.reduce((acc,e)=>{if(e.active)acc[e.alert||'patrol']=(acc[e.alert||'patrol']||0)+1;return acc;},{})};}
  function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(state.world?.ready){update(state.world,dt);draw(now);}frame=requestAnimationFrame(loop);}
  generateMap=function(seed){baseGenerate(seed);build();};
  generateRoamingEnemies=spawn;updateRoamingEnemies=function(){};
  moveDog=function(){const w=state.world;if(!w?.ready)return baseMove();if(!w.dog.path.length){const p=target(w);if(p)w.dog.path=path(w,w.dog,p);}};
  renderMap=function(){canvas();draw();};
  function fireProjectile(side='dog'){
    const w=state.world,enemy=w?.enemies.find(e=>e.id===state.combat?.enemy?.sourceId&&e.active);
    if(!w?.ready||!enemy)return;
    const dogShot=side==='dog',profile=dogShot?weaponProfile():enemyProfile(enemy.template);
    if(profile.width<=0)return;
    const from=dogShot?w.dog:enemy,to=dogShot?enemy:w.dog,distance=dist(from,to);
    if(dogShot){w.dog.facing=to.x<from.x?-1:1;w.dog.direction=Math.abs(to.x-from.x)>Math.abs(to.y-from.y)?(to.x<from.x?'left':'right'):(to.y<from.y?'up':'down');w.dog.poseUntil=performance.now()+300;enemy.hitUntil=performance.now()+260;}
    else{enemy.poseUntil=performance.now()+420;w.dog.hitUntil=performance.now()+260;}
    w.camera.shakeUntil=performance.now()+(dogShot?110:180);w.camera.shakePower=dogShot?2.2:4;
    const muzzle=dogShot?w.dog:enemy,impact=dogShot?enemy:w.dog;
    for(let i=0;i<8;i++)w.particles.push({x:muzzle.x+muzzle.facing*.35,y:muzzle.y-.5,vx:muzzle.facing*(.5+Math.random())+(Math.random()-.5)*.3,vy:(Math.random()-.5)*.5,life:.12+Math.random()*.12,max:.24,color:profile.color,size:1.5+Math.random()*2});
    for(let i=0;i<6;i++)w.particles.push({x:impact.x,y:impact.y-.35,vx:(Math.random()-.5)*1.3,vy:-.4-Math.random(),life:.25+Math.random()*.25,max:.5,color:dogShot?'#ffbc79':'#ff6d71',size:1.2+Math.random()*1.8});
    w.projectiles.push({from:{x:from.x,y:from.y},to:{x:to.x,y:to.y},started:performance.now(),duration:Math.max(150,distance/profile.speed*1000),color:profile.color,width:profile.width,side});
  }
  function drawBossDetails(ctx,enemy,boss,time){
    const name=String(boss.name||''),x=enemy.x*T,y=enemy.y*T-20,pulse=1+Math.sin(time/170)*.08;
    ctx.save();ctx.translate(x,y);ctx.scale(pulse,pulse);ctx.lineWidth=2;ctx.shadowBlur=10;
    if(/Rat King|Drain Queen/.test(name)){ctx.fillStyle='#e4bf52';ctx.strokeStyle='#503719';ctx.shadowColor='#e4bf52';ctx.beginPath();ctx.moveTo(-13,-24);ctx.lineTo(-9,-37);ctx.lineTo(-2,-28);ctx.lineTo(5,-39);ctx.lineTo(12,-25);ctx.closePath();ctx.fill();ctx.stroke();}
    if(/Gutter|Mouldback|Drain/.test(name)){ctx.strokeStyle='#78e39b';ctx.shadowColor='#78e39b';ctx.beginPath();ctx.arc(0,0,25,0,Math.PI*2);ctx.stroke();}
    if(/Alpha|Old Yard|Furnace/.test(name)){ctx.strokeStyle='#ff754f';ctx.shadowColor='#ff754f';ctx.beginPath();ctx.moveTo(-20,12);ctx.lineTo(0,24);ctx.lineTo(20,12);ctx.stroke();}
    if(/Geargrinder|Trolley/.test(name)){ctx.strokeStyle='#f3a14d';ctx.shadowColor='#f3a14d';for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.strokeRect(20,-2,8,4);}}
    if(/Crow|Barnstorm/.test(name)){ctx.strokeStyle='#8bdcff';ctx.shadowColor='#8bdcff';ctx.beginPath();ctx.moveTo(-28,-5);ctx.lineTo(-13,-17);ctx.moveTo(28,-5);ctx.lineTo(13,-17);ctx.stroke();}
    ctx.restore();
  }
  window.worldV29={rebuild:()=>{build();spawn();render();},state:()=>state.world,tick:dt=>{if(state.world?.ready){update(state.world,dt);draw(performance.now());}},audit,fireProjectile,weaponProfile,enemyProfile,lineOfSight};
  if(state.map?.length)build();cancelAnimationFrame(frame);frame=requestAnimationFrame(loop);render();
})();
