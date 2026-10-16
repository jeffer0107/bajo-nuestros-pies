(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const fmt=new Intl.NumberFormat('es-AR');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // These curves are copied from the other prototype, not from a calibrated scientific model.
 let soilMode='natural';
 const plantLayer=document.querySelector('.soil-native-plants');
 for(let i=0;i<15;i++){const plant=document.createElement('i');plant.style.left=(4+i*6.2)+'%';const bloom=document.createElement('span');bloom.className='soil-flower';plant.append(bloom);plantLayer.append(plant);}
 function updateSoil(){
  const y=Number($('soil-year-slider').value);
  plantLayer.classList.toggle('is-restored',soilMode==='restored');
  const inf=soilMode==='natural'?Math.min(100,Math.round(5+y/60*28)):Math.min(95,Math.round(45+y/60*50));
  const veg=soilMode==='natural'?(y<40?Math.round(y/40*14):Math.round(14+(y-40)/20*24)):Math.min(92,Math.round(25+Math.pow(y/60,.65)*67));
  $('soil-year-out').textContent='Año '+y;
  $('soil-year-slider').setAttribute('aria-valuetext',y+' años en un escenario ilustrativo');
  $('soil-inf-val').textContent=inf+' %';$('soil-veg-val').textContent=veg+' %';
  $('soil-inf-bar').style.width=inf+'%';$('soil-veg-bar').style.width=veg+'%';
  $('soil-tech-note').textContent=soilMode==='natural'?'Escenario sin intervención: la recuperación del sitio se representa como lenta e irregular.':'Escenario con restauración: preparar el suelo y favorecer la vegetación nativa puede ayudar a recuperar el sitio.';
  plantLayer.style.setProperty('--plant-scale',String(.2+veg/100));
  [...plantLayer.children].forEach((plant,i)=>{plant.style.opacity=String(i<Math.ceil(veg/100*15)?1:.12);});
 }
 document.querySelectorAll('[data-soil]').forEach(button=>button.addEventListener('click',()=>{
  soilMode=button.dataset.soil;
  document.querySelectorAll('[data-soil]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  updateSoil();
 }));
 $('soil-year-slider').addEventListener('input',updateSoil);updateSoil();

 // Historical totals are illustrative; no unsupported historical state breakdown is generated.
 const historicalTotals={2009:11200,2011:12150,2013:13200,2015:14350,2017:15480,2019:16600,2021:17550,2023:18400,2024:18700};
 const historicalYears=Object.keys(historicalTotals).map(Number);
 const years=[...Array.from({length:16},(_,i)=>2009+i),2026];
 const keys=['total','active','declared','paused','sealed'];
 const finalValues=[19629,13771,3669,1535,654];
 let timer=null;
 function stop(){if(timer!==null)clearInterval(timer);timer=null;$('time-play-btn').textContent='▶ Reproducir';$('time-play-btn').setAttribute('aria-pressed','false');}
 function updateGrowth(){
  const y=years[Number($('time-slider').value)],final=y===2026;
  let total=19629;
  if(!final){
   const prev=historicalYears.filter(n=>n<=y).pop(),next=historicalYears.find(n=>n>=y);
   total=historicalTotals[y]??Math.round(historicalTotals[prev]+(historicalTotals[next]-historicalTotals[prev])*(y-prev)/(next-prev));
  }
  const values=final?finalValues:[total,0,0,0,0];
  $('time-year-label').textContent=final?'Ago. 2026':String(y);
  $('time-slider').setAttribute('aria-valuetext',final?'Agosto de 2026':y+', total estimativo');
  document.querySelectorAll('[data-growth-detail]').forEach(row=>row.hidden=!final);
  keys.forEach((key,i)=>{$('growth-'+key+'-value').textContent=fmt.format(values[i]);$('growth-'+key+'-bar').style.width=(values[i]/19629*100)+'%';});
 }
 $('time-slider').addEventListener('input',()=>{stop();updateGrowth();});
 $('time-play-btn').addEventListener('click',()=>{
  if(timer!==null){stop();return;}
  const last=years.length-1;
  if(reduced.matches){$('time-slider').value=Number($('time-slider').value)>=last?0:Number($('time-slider').value)+1;updateGrowth();return;}
  if(Number($('time-slider').value)>=last)$('time-slider').value=0;
  updateGrowth();$('time-play-btn').textContent='Ⅱ Pausar';$('time-play-btn').setAttribute('aria-pressed','true');
  timer=setInterval(()=>{const next=Number($('time-slider').value)+1;if(next>last){stop();return;}$('time-slider').value=next;updateGrowth();if(next===last)stop();},650);
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 const visibility=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();});visibility.observe($('time-slider'));
 reduced.addEventListener('change',()=>{if(reduced.matches)stop();});updateGrowth();

})();

(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const slider=$('cost-wells');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const format=new Intl.NumberFormat('es-AR');
 const money=value=>'US$'+format.format(Math.round(value));
 const millions=value=>{const m=value/1000000;return m>=1000?'≈ USD '+format.format(Math.round(m))+' M':'USD '+m.toLocaleString('es-AR',{maximumFractionDigits:1})+' M';};
 const presets=document.querySelectorAll('#costo-cierre [data-wells]');
 let frame=null,shown=Number(slider.value)*500000,target=shown;
 function finish(){if(frame!==null)cancelAnimationFrame(frame);frame=null;shown=target;$('cost-total-number').textContent=millions(target);}
 function update(animate=true,reflect=false){
  const count=Number(slider.value);target=count*500000;
  $('cost-wells-output').textContent=format.format(count);
  slider.setAttribute('aria-valuetext',format.format(count)+' pozos');
  $('cost-total-accessible').textContent=money(target);
  $('cost-calculation').textContent=format.format(count)+(count===1?' pozo':' pozos')+' × US$500.000 = '+money(target);
  presets.forEach(button=>{const active=Number(button.dataset.wells)===count;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  if(reflect)$('cost-reflection').hidden=false;
  if(frame!==null)cancelAnimationFrame(frame);
  if(!animate||reduced.matches){finish();return;}
  const from=shown,destination=target;let start=null;
  function step(now){
   if(start===null)start=now;
   const t=Math.min(1,(now-start)/280);
   shown=from+(destination-from)*(1-Math.pow(1-t,3));
   $('cost-total-number').textContent=millions(shown);
   if(t<1)frame=requestAnimationFrame(step);else {shown=destination;frame=null;}
  }
  frame=requestAnimationFrame(step);
 }
 slider.addEventListener('input',()=>update(true,true));
 presets.forEach(button=>button.addEventListener('click',()=>{slider.value=button.dataset.wells;update(true,true);}));
 reduced.addEventListener('change',()=>{if(reduced.matches)finish();});update(false);

 const root=$('monitor-demo');
 document.querySelectorAll('[data-monitor]').forEach(button=>button.addEventListener('click',()=>{
  const alert=button.dataset.monitor==='alert';root.dataset.monitorState=alert?'alert':'normal';
  $('monitor-state-label').textContent=alert?'ALERTA PARA REVISIÓN':'MONITOREO NORMAL';
  $('monitor-screen-label').textContent=alert?'REVISAR SEÑAL':'EN SEGUIMIENTO';
  $('monitor-message').textContent=alert?'Anomalía detectada.':'Sin anomalías detectadas por los sensores simulados.';
  $('monitor-next-step').textContent=alert?'El operador verifica la señal y define la respuesta: reparación, nuevas comprobaciones o abandono definitivo, según el diagnóstico y la normativa aplicable.':'Los datos están disponibles para acompañar al equipo, planificar revisiones y mantener el seguimiento del pozo.';
  document.querySelectorAll('[data-monitor]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
 }));
})();
