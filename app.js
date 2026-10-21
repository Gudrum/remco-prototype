(function(){
  const qs=(s,p=document)=>p.querySelector(s), qsa=(s,p=document)=>[...p.querySelectorAll(s)];
  let selectedCar={name:'Toyota RAV4',price:58,image:'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=88'};
  let miniStep=1;

  const showView=name=>{
    qsa('.app-view').forEach(v=>v.classList.toggle('active',v.dataset.view===name));
    qsa('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));
  };
  qsa('[data-nav]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.nav)));

  qsa('[data-app-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    qsa('[data-app-filter]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    const f=btn.dataset.appFilter;
    qsa('.app-car-card').forEach(c=>c.classList.toggle('hidden',f!=='all'&&c.dataset.appCategory!==f));
  }));

  qs('#appSearch')?.addEventListener('input',e=>{
    const q=e.target.value.toLowerCase().trim();
    qsa('.app-car-card').forEach(c=>{
      const hay=(c.dataset.appName+' '+c.dataset.appCategory).toLowerCase();
      c.classList.toggle('hidden',q&&!hay.includes(q));
    });
  });

  const closeSheets=()=>qsa('.app-sheet').forEach(s=>s.classList.remove('open'));
  qsa('.app-car-card').forEach(card=>card.addEventListener('click',()=>{
    selectedCar={name:card.dataset.appName,price:Number(card.dataset.appPrice),image:card.dataset.appImage};
    qs('#sheetCarImage').src=selectedCar.image;qs('#sheetCarName').textContent=selectedCar.name;qs('#sheetCarPrice').textContent='$'+selectedCar.price+'/día';
    closeSheets();qs('#carSheet').classList.add('open');
  }));
  qsa('[data-open-trip]').forEach(b=>b.addEventListener('click',()=>{closeSheets();qs('#tripSheet').classList.add('open');}));
  qsa('[data-close-sheet]').forEach(b=>b.addEventListener('click',()=>b.closest('.app-sheet').classList.remove('open')));

  const openCenter=id=>{qsa('.center-modal').forEach(m=>m.classList.remove('open'));qs(id)?.classList.add('open');};
  qsa('[data-open-qr]').forEach(b=>b.addEventListener('click',()=>openCenter('#qrModal')));
  qsa('[data-open-docs]').forEach(b=>b.addEventListener('click',()=>openCenter('#docsModal')));
  qsa('[data-close-center]').forEach(b=>b.addEventListener('click',()=>b.closest('.center-modal').classList.remove('open')));

  qsa('[data-extend-trip]').forEach(b=>b.addEventListener('click',()=>{
    b.textContent='Extensión solicitada ✓';b.style.background='#e7f8e9';b.style.color='#247640';
  }));

  const today=new Date(),pad=n=>String(n).padStart(2,'0'),fmt=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
  const p=new Date(today);p.setDate(p.getDate()+3);const r=new Date(today);r.setDate(r.getDate()+7);
  if(qs('#miniPickup')){qs('#miniPickup').value=fmt(p);qs('#miniPickup').min=fmt(today);}
  if(qs('#miniReturn')){qs('#miniReturn').value=fmt(r);qs('#miniReturn').min=fmt(p);}

  const showMiniStep=()=>{
    qsa('[data-mini-step]').forEach(s=>s.classList.toggle('active',Number(s.dataset.miniStep)===miniStep));
    const back=qs('#miniBack'); if(back)back.style.visibility=miniStep===1?'hidden':'visible';
    const next=qs('#miniNext'); if(next){next.style.display=miniStep===4?'none':'block';next.textContent=miniStep===3?'Confirmar demo':'Continuar';}
    if(miniStep===3)renderMiniSummary();
  };
  const openMiniBooking=()=>{
    qs('#carSheet')?.classList.remove('open');
    qs('#miniCarImage').src=selectedCar.image;qs('#miniCarName').textContent=selectedCar.name;qs('#miniCarPrice').textContent='$'+selectedCar.price+'/día';
    miniStep=1;showMiniStep();qs('#miniBooking').classList.add('open');
  };
  qs('#sheetBookBtn')?.addEventListener('click',openMiniBooking);
  qsa('[data-close-mini]').forEach(b=>b.addEventListener('click',()=>qs('#miniBooking').classList.remove('open')));
  qs('#miniBack')?.addEventListener('click',()=>{if(miniStep>1){miniStep--;showMiniStep();}});

  const getMiniDays=()=>{
    const a=new Date(qs('#miniPickup').value),b=new Date(qs('#miniReturn').value);
    return Math.max(1,Math.ceil((b-a)/(86400000)));
  };
  qs('#miniPickup')?.addEventListener('change',()=>{
    const start=qs('#miniPickup').value;qs('#miniReturn').min=start;
    if(qs('#miniReturn').value<=start){const d=new Date(start);d.setDate(d.getDate()+1);qs('#miniReturn').value=fmt(d);}
  });
  const renderMiniSummary=()=>{
    const days=getMiniDays();
    qs('#miniSummaryCar').textContent=selectedCar.name;qs('#miniSummaryDays').textContent=days+' días';qs('#miniSummaryTotal').textContent='$'+(days*selectedCar.price).toFixed(0);
  };
  qs('#miniNext')?.addEventListener('click',()=>{
    if(miniStep===1){
      if(!qs('#miniPickup').value||!qs('#miniReturn').value||new Date(qs('#miniReturn').value)<=new Date(qs('#miniPickup').value)){alert('Selecciona fechas válidas.');return;}
      miniStep=2;showMiniStep();return;
    }
    if(miniStep===2){
      const n=qs('#miniName').value.trim(),e=qs('#miniEmail').value.trim(),ph=qs('#miniPhone').value.trim();
      if(!n||!e||!ph){alert('Completa nombre, correo y teléfono.');return;}
      if(!/^[^@]+@[^@]+\.[^@]+$/.test(e)){alert('Ingresa un correo válido.');return;}
      miniStep=3;showMiniStep();return;
    }
    if(miniStep===3){
      miniStep=4;
      qs('#miniConfirmCode').textContent='REM-'+new Date().getFullYear()+'-'+String(Math.floor(1000+Math.random()*8999));
      showMiniStep();
    }
  });

  // Subtle app entrance motion
  qsa('.trip-hero,.quick-card,.discover-strip,.app-car-card,.trip-list-card,.wallet-card,.doc-list button').forEach((el,i)=>{
    el.style.opacity='0';el.style.transform='translateY(10px)';
    setTimeout(()=>{el.style.transition='opacity .45s ease, transform .45s ease';el.style.opacity='1';el.style.transform='none';},90+i*45);
  });
})();