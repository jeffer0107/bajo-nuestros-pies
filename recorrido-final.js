(() => {
 'use strict';
 const slider=document.getElementById('history-growth');
 const buildings=document.querySelectorAll('[data-arrival]');
 function updateHistory(){
  const progress=Number(slider.value);
  buildings.forEach(building=>building.classList.toggle('visible',progress>=Number(building.dataset.arrival)));
  const stage=progress>=100?'Un pequeño barrio alrededor del pozo.':progress>=65?'Más casas, caminos y edificios.':progress>=30?'Pequeñas construcciones y campamentos.':'Paisaje árido y pozo petrolero.';
  slider.setAttribute('aria-valuetext',stage+' Evolución simbólica.');
 }
 slider.addEventListener('input',updateHistory);
 updateHistory();
})();


(() => {
 'use strict';
 const root=document.getElementById('well-data');
 if(!root)return;
 const bars=root.querySelector('.historical-data-panel');
 const panel=root.querySelector('.registered-data-panel');
 const count=root.querySelector('#registered-well-count');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const format=new Intl.NumberFormat('es-AR');
 let frame=null,started=false;
 function finish(){if(frame!==null)cancelAnimationFrame(frame);frame=null;count.textContent=format.format(19629);}
 function countUp(){
  if(started)return;started=true;
  if(reduced.matches){finish();return;}
  let start=null;
  function step(now){
   if(start===null)start=now;
   const progress=Math.min(1,(now-start)/1100);
   count.textContent=format.format(Math.round(19629*(1-Math.pow(1-progress,3))));
   if(progress<1)frame=requestAnimationFrame(step);else frame=null;
  }
  frame=requestAnimationFrame(step);
 }
 if(!('IntersectionObserver' in window)){bars.classList.add('data-revealed');finish();return;}
 // The final values remain readable when JavaScript is unavailable.
 bars.classList.add('data-animation-ready');
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   if(entry.target===bars)bars.classList.add('data-revealed');
   else countUp();
   observer.unobserve(entry.target);
  });
 },{threshold:.15});
 observer.observe(bars);observer.observe(panel);
 reduced.addEventListener('change',()=>{if(reduced.matches){bars.classList.add('data-revealed');if(started)finish();}});
})();
