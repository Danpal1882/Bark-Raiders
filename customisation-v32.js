(function(){
  const options={
    marking:[['classic','Classic mask'],['blaze','White blaze'],['dark-mask','Dark mask'],['freckles','Freckles']],
    eyes:[['brown','Brown eyes'],['amber','Amber eyes'],['blue','Blue eyes'],['green','Green eyes']],
    ears:[['natural','Natural ears'],['notched','Notched ear'],['floppy','Soft ear tips']],
    scarf:[['none','No neckwear'],['red','Red scarf'],['blue','Blue bandana'],['yellow','Gold neckerchief']],
    harness:[['#27777c','Teal harness'],['#7359a8','Purple harness'],['#a94747','Red harness'],['#4d6b3f','Ranger harness']],
  };
  const labels={marking:'Face Marking',eyes:'Eye Colour',ears:'Ear Style',scarf:'Neckwear',harness:'Harness Colour'};

  function addCreatorControls(){
    const form=document.querySelector('.creator-form');
    if(!form||document.getElementById('dogCustomisationFields'))return;
    const wrap=document.createElement('fieldset');
    wrap.id='dogCustomisationFields';wrap.className='creator-customisation';
    wrap.innerHTML=`<legend>Appearance</legend>${Object.entries(options).map(([key,values])=>`<label>${labels[key]}<select data-dog-custom="${key}">${values.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></label>`).join('')}`;
    form.appendChild(wrap);
    wrap.querySelectorAll('[data-dog-custom]').forEach(select=>{
      const key=select.dataset.dogCustom;select.value=state.customisation[key]||options[key][0][0];
      select.addEventListener('change',()=>{state.customisation[key]=select.value;updatePreview();save();});
    });
  }

  function overlayMarkup(){
    const c=state.customisation||{};
    return `<div class="dog-custom-overlay marking-${c.marking||'classic'} ears-${c.ears||'natural'}">
      <i class="custom-eyes eyes-${c.eyes||'brown'}"></i>
      <i class="custom-scarf scarf-${c.scarf||'none'}"></i>
      <i class="custom-harness" style="--harness:${c.harness||'#27777c'}"></i>
    </div>`;
  }
  function updatePreview(){
    const preview=document.querySelector('.creator-preview');
    if(!preview)return;
    preview.querySelector('.dog-custom-overlay')?.remove();
    preview.insertAdjacentHTML('beforeend',overlayMarkup());
    preview.classList.add('animated-preview');
  }

  function drawLoadout(ctx,world,time){
    const dog=world?.dog;if(!dog||!window.gearV32)return;
    const weapon=gearV32.activeWeapon(),helmet=gearV32.equipped('helmet'),body=gearV32.equipped('armour'),pack=gearV32.equipped('backpack');
    const x=dog.x*28,y=dog.y*28,facing=dog.facing||1,bob=Math.sin(time/150)*.8;
    ctx.save();ctx.translate(x,y+bob);ctx.scale(facing,1);ctx.lineJoin='round';ctx.lineCap='round';
    if(pack){ctx.fillStyle='#394955';ctx.strokeStyle='#152027';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(-21,-29,7,17,2);ctx.fill();ctx.stroke();}
    if(body){ctx.strokeStyle=state.customisation?.harness||'#27777c';ctx.lineWidth=4;ctx.globalAlpha=.9;ctx.beginPath();ctx.roundRect(-12,-25,24,17,5);ctx.stroke();ctx.globalAlpha=1;if(body.armour>=8){ctx.fillStyle='#687681';ctx.globalAlpha=.72;ctx.fillRect(-8,-22,16,5);ctx.globalAlpha=1;}}
    if(helmet){ctx.fillStyle=helmet.armour>=6?'#596671':'#667a69';ctx.strokeStyle='#172127';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-34,10,Math.PI,Math.PI*2);ctx.lineTo(9,-30);ctx.lineTo(5,-30);ctx.lineTo(3,-37);ctx.lineTo(-3,-37);ctx.lineTo(-5,-30);ctx.lineTo(-9,-30);ctx.closePath();ctx.fill();ctx.stroke();}
    if(weapon){
      ctx.strokeStyle='#151b20';ctx.fillStyle=weapon.rarity==='Unique'?'#d46b45':'#48535c';ctx.lineWidth=2;
      const length=weapon.weaponClass==='rifle'||weapon.weaponClass==='machine gun'?27:weapon.weaponClass==='shotgun'?25:16;
      ctx.beginPath();ctx.roundRect(7,-23,length,5,2);ctx.fill();ctx.stroke();
      ctx.fillStyle='#293238';ctx.fillRect(11,-18,5,7);
      if(weapon.weaponClass==='shotgun'){ctx.strokeStyle='#9a784e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(12,-19);ctx.lineTo(25,-19);ctx.stroke();}
    }
    if(state.customisation?.scarf&&state.customisation.scarf!=='none'){ctx.strokeStyle={red:'#d64d4d',blue:'#497fd2',yellow:'#d9ad43'}[state.customisation.scarf];ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-9,-30);ctx.lineTo(10,-30);ctx.stroke();}
    ctx.restore();
  }

  const baseRender=render;
  render=function(){baseRender();addCreatorControls();updatePreview();};
  window.customisationV32={drawLoadout,updatePreview};
  addCreatorControls();updatePreview();render();
})();
