(function(){
  const qs=(s,p=document)=>p.querySelector(s), qsa=(s,p=document)=>[...p.querySelectorAll(s)];

  // Date defaults
  const today=new Date();
  const pad=n=>String(n).padStart(2,'0');
  const fmt=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
  const pickup=new Date(today); pickup.setDate(today.getDate()+3);
  const ret=new Date(today); ret.setDate(today.getDate()+7);
  ['pickupDate','bookingPickup'].forEach(id=>{const el=qs('#'+id); if(el){el.value=fmt(pickup);el.min=fmt(today);}});
  ['returnDate','bookingReturn'].forEach(id=>{const el=qs('#'+id); if(el){el.value=fmt(ret);el.min=fmt(pickup);}});

  // Reveal motion
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}});
  },{threshold:.12});
  qsa('.reveal').forEach(el=>revealObserver.observe(el));

  // Pointer glow and parallax
  const glow=qs('#cursorGlow');
  const stage=qs('#heroStage');
  window.addEventListener('pointermove',e=>{
    if(glow){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';glow.style.opacity='1';}
    if(stage && window.innerWidth>900){
      const r=stage.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      const car=qs('.hero-car',stage);
      if(car) car.style.transform='rotateY('+(-5+x*5)+'deg) rotateX('+(1-y*3)+'deg) translate3d('+(x*7)+'px,'+(y*5)+'px,0)';
    }
  });
  window.addEventListener('pointerleave',()=>{if(glow)glow.style.opacity='0';});

  // Kinetic hero word
  const words=['friction.','waiting.','guesswork.','limits.'];
  const kinetic=qs('#kineticWord'); let wi=0;
  if(kinetic) setInterval(()=>{kinetic.style.opacity='0';kinetic.style.transform='translateY(10px) skewX(-5deg)';setTimeout(()=>{wi=(wi+1)%words.length;kinetic.textContent=words[wi];kinetic.style.opacity='1';kinetic.style.transform='none';},220);},2700);

  // Magnetic buttons
  qsa('.magnetic').forEach(btn=>{
    btn.addEventListener('pointermove',e=>{if(window.innerWidth<900)return;const r=btn.getBoundingClientRect();const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;btn.style.transform='translate('+(x*.08)+'px,'+(y*.08)+'px)';});
    btn.addEventListener('pointerleave',()=>btn.style.transform='');
  });

  // Fleet filters
  qsa('.filter-chip').forEach(chip=>chip.addEventListener('click',()=>{
    qsa('.filter-chip').forEach(c=>c.classList.remove('active'));chip.classList.add('active');
    const f=chip.dataset.filter;
    qsa('.vehicle-card').forEach(card=>card.classList.toggle('hidden',f!=='all'&&card.dataset.category!==f));
  }));

  const categorySelect=qs('#categorySelect');
  qs('#searchVehicles')?.addEventListener('click',()=>{
    const f=categorySelect?.value||'all';
    const chip=qs('.filter-chip[data-filter="'+f+'"]')||qs('.filter-chip[data-filter="all"]');
    chip?.click();
    qs('#fleet')?.scrollIntoView({behavior:'smooth'});
  });

  // Hearts
  qsa('.heart').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();btn.textContent=btn.textContent==='♡'?'♥':'♡';btn.style.color=btn.textContent==='♥'?'#ef4444':'';}));

  // Story progress
  const storyCards=qsa('[data-story]'), progress=qs('#storyProgress');
  const updateStory=()=>{
    if(!storyCards.length||!progress)return;
    const mid=window.innerHeight*.58;
    let active=0;
    storyCards.forEach((c,i)=>{if(c.getBoundingClientRect().top<mid)active=i+1;});
    progress.style.width=(active/storyCards.length*100)+'%';
  };
  window.addEventListener('scroll',updateStory,{passive:true}); updateStory();

  // Vehicle modal
  let selected={name:'Toyota RAV4',price:58,image:'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=85'};
  const modal=qs('#vehicleModal');
  function openVehicle(card){
    selected={name:card.dataset.name,price:Number(card.dataset.price),image:card.dataset.image};
    qs('#modalVehicleImage').src=selected.image;
    qs('#modalVehicleName').textContent=selected.name;
    qs('#modalVehiclePrice').textContent='$'+selected.price+'/día';
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  }
  function closeVehicle(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  qsa('[data-vehicle-detail]').forEach(btn=>btn.addEventListener('click',()=>openVehicle(btn.closest('.vehicle-card'))));
  qsa('[data-close-modal]').forEach(el=>el.addEventListener('click',closeVehicle));

  // Booking wizard
  const booking=qs('#bookingLayer');
  let step=1;
  let days=4;
  const getDays=()=>{
    const a=new Date(qs('#bookingPickup')?.value||fmt(pickup)), b=new Date(qs('#bookingReturn')?.value||fmt(ret));
    days=Math.max(1,Math.ceil((b-a)/(1000*60*60*24))); return days;
  };
  function syncSelected(){
    ['bookingVehicleName','summaryVehicleName'].forEach(id=>{const el=qs('#'+id);if(el)el.textContent=selected.name;});
    ['bookingVehicleImage','summaryVehicleImage'].forEach(id=>{const el=qs('#'+id);if(el)el.src=selected.image;});
    if(qs('#bookingVehiclePrice'))qs('#bookingVehiclePrice').textContent='$'+selected.price;
    if(qs('#bookingLocation')&&qs('#pickupLocation'))qs('#bookingLocation').value=qs('#pickupLocation').value;
    if(qs('#bookingPickup')&&qs('#pickupDate'))qs('#bookingPickup').value=qs('#pickupDate').value;
    if(qs('#bookingReturn')&&qs('#returnDate'))qs('#bookingReturn').value=qs('#returnDate').value;
  }
  function openBooking(){
    closeVehicle(); syncSelected(); step=1; showStep(); booking.classList.add('open');booking.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';calcTotal();
  }
  function closeBooking(){booking.classList.remove('open');booking.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  qsa('[data-open-booking]').forEach(el=>el.addEventListener('click',openBooking));
  qs('#bookSelectedVehicle')?.addEventListener('click',openBooking);
  qsa('[data-close-booking]').forEach(el=>el.addEventListener('click',closeBooking));

  function showStep(){
    qsa('.booking-step').forEach(s=>s.classList.toggle('active',Number(s.dataset.step)===step));
    qsa('[data-step-dot]').forEach(dot=>dot.classList.toggle('active',Number(dot.dataset.stepDot)<=Math.min(step,4)));
    const footer=qs('#bookingFooter');
    if(footer)footer.style.display=step===5?'none':'grid';
    const back=qs('#bookingBack'); if(back)back.style.visibility=step===1?'hidden':'visible';
    const next=qs('#bookingNext'); if(next)next.textContent=step===4?'Confirmar demo':'Continuar';
    if(step===4)renderSummary();
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function calcTotal(){
    getDays();
    let perDay=selected.price;
    let oneTime=0;
    qsa('[data-addon]:checked').forEach(a=>{const v=Number(a.value); if(a.dataset.addon==='Entrega especial')oneTime+=v; else perDay+=v;});
    const total=perDay*days+oneTime;
    if(qs('#bookingRunningTotal'))qs('#bookingRunningTotal').textContent='$'+total.toFixed(0);
    return {total,perDay,oneTime};
  }
  qsa('[data-addon]').forEach(a=>a.addEventListener('change',calcTotal));
  ['bookingPickup','bookingReturn'].forEach(id=>qs('#'+id)?.addEventListener('change',()=>{const p=qs('#bookingPickup'),r=qs('#bookingReturn');if(p&&r){r.min=p.value;if(r.value<=p.value){const d=new Date(p.value);d.setDate(d.getDate()+1);r.value=fmt(d);}}calcTotal();}));

  function validStep(){
    if(step===1){
      const p=qs('#bookingPickup')?.value,r=qs('#bookingReturn')?.value;
      if(!p||!r||new Date(r)<=new Date(p)){alert('Selecciona fechas válidas para continuar.');return false;}
    }
    if(step===3){
      const name=qs('#driverName')?.value.trim(),email=qs('#driverEmail')?.value.trim(),phone=qs('#driverPhone')?.value.trim();
      if(!name||!email||!phone){alert('Completa nombre, correo y teléfono para continuar el demo.');return false;}
      if(!/^[^@]+@[^@]+\.[^@]+$/.test(email)){alert('Ingresa un correo válido.');return false;}
    }
    return true;
  }
  qs('#bookingNext')?.addEventListener('click',()=>{
    if(!validStep())return;
    if(step<4){step++;showStep();}
    else{
      step=5;
      const code='REM-'+new Date().getFullYear()+'-'+String(Math.floor(1000+Math.random()*8999));
      if(qs('#confirmationCode'))qs('#confirmationCode').textContent=code;
      showStep();
    }
  });
  qs('#bookingBack')?.addEventListener('click',()=>{if(step>1){step--;showStep();}});

  function renderSummary(){
    const d=getDays(), calc=calcTotal();
    const p=new Date(qs('#bookingPickup').value),r=new Date(qs('#bookingReturn').value);
    const opts={day:'2-digit',month:'short'};
    qs('#summaryDates').textContent=p.toLocaleDateString('es-EC',opts)+' — '+r.toLocaleDateString('es-EC',opts)+' · '+d+' días';
    const lines=qs('#summaryLines'); lines.innerHTML='';
    const base=document.createElement('div');base.innerHTML='<span>'+d+' días · tarifa base</span><strong>$'+(selected.price*d).toFixed(0)+'</strong>';lines.appendChild(base);
    qsa('[data-addon]:checked').forEach(a=>{const row=document.createElement('div');const v=Number(a.value),amount=a.dataset.addon==='Entrega especial'?v:v*d;row.innerHTML='<span>'+a.dataset.addon+'</span><strong>$'+amount.toFixed(0)+'</strong>';lines.appendChild(row);});
    qs('#summaryTotal').textContent='$'+calc.total.toFixed(0);
  }

  // ESC
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(booking.classList.contains('open'))closeBooking();else if(modal.classList.contains('open'))closeVehicle();}});

  // Fake file upload feedback
  qs('#licenseFile')?.addEventListener('change',e=>{const box=e.target.previousElementSibling;if(e.target.files[0])box.innerHTML='<strong>✓ '+e.target.files[0].name+'</strong><small>Documento listo para validación</small>';});
})();