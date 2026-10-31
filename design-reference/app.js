(()=>{
 const root=document.documentElement;
 let theme='dark';try{theme=localStorage.getItem('fa-theme')||'dark'}catch(e){}
 function applyTheme(v){theme=v;root.dataset.theme=v;document.querySelectorAll('.theme-toggle').forEach(b=>{b.setAttribute('aria-label','Switch to '+(v==='dark'?'light':'dark')+' theme');b.title='Switch to '+(v==='dark'?'light':'dark')+' theme'});try{localStorage.setItem('fa-theme',v)}catch(e){}}
 applyTheme(theme);
 document.querySelectorAll('.theme-toggle').forEach(b=>b.addEventListener('click',()=>applyTheme(theme==='dark'?'light':'dark')));
 const allDrawers=[...document.querySelectorAll('.mobile-drawer')];
 allDrawers.forEach(drawer=>drawer.querySelectorAll('a').forEach((link,index)=>link.style.setProperty('--link-index',String(index))));
 function closeAllMenus(){
   document.querySelectorAll('.mobile-drawer.open').forEach(drawer=>drawer.classList.remove('open'));
   document.querySelectorAll('.hamburger').forEach(btn=>{btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-label','Open navigation menu');btn.classList.remove('is-active');});
   document.body.classList.remove('menu-open');
 }
 document.querySelectorAll('.hamburger').forEach(btn=>btn.addEventListener('click',()=>{
   const drawer=btn.closest('header').querySelector('.mobile-drawer');
   const opening=!drawer.classList.contains('open');
   closeAllMenus();
   if(opening){
     drawer.classList.add('open');
     btn.classList.add('is-active');
     btn.setAttribute('aria-expanded','true');
     btn.setAttribute('aria-label','Close navigation menu');
     document.body.classList.add('menu-open');
   }
 }));
 allDrawers.forEach(drawer=>drawer.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>closeAllMenus())));
 document.addEventListener('click',e=>{
   if(document.body.classList.contains('menu-open') && !e.target.closest('.mobile-drawer') && !e.target.closest('.hamburger')) closeAllMenus();
 });
 window.addEventListener('keydown',e=>{if(e.key==='Escape')closeAllMenus()});
 window.addEventListener('resize',()=>{if(window.innerWidth>900)closeAllMenus()});
 // Two-stage navigation with NO abrupt swaps and no direction-based show/hide.
 // The hero nav travels upward at about 1/4 page-scroll velocity, damped over time.
 // The floating nav slides downward only after the hero has passed, and stays
 // visible throughout the rest of the document regardless of scroll direction.
 const floating=document.querySelector('.floating-header');
 const hero=document.querySelector('[data-header-hero]');
 const heroNav=document.querySelector('.hero-header');
 const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let shown=false, frame=0, lastTime=0;
 let currentY=0, currentOpacity=1;
 function updateScrollNavigation(timestamp){
   frame=0;
   if(!floating||!hero)return;
   const scrollTop=window.scrollY || window.pageYOffset || 0;
   const heroBottom=hero.getBoundingClientRect().bottom;
   // 24px hysteresis prevents repeated toggling at the hero boundary.
   if (!shown && heroBottom <= -8) shown=true;
   else if (shown && heroBottom >= 32) shown=false;
   floating.classList.toggle('visible',shown);
   floating.setAttribute('aria-hidden',String(!shown));
   floating.inert=!shown;
   if(!shown && document.body.classList.contains('menu-open') && floating.querySelector('.mobile-drawer.open')){
     closeAllMenus();
   }
   if(heroNav){
     // 490px of scroll -> ~118px nav travel, visibly slower than the content.
     const goalY=Math.min(118,Math.max(0,scrollTop*.24));
     const goalOpacity=Math.max(0,1-Math.max(0,scrollTop-45)/470);
     const dt=lastTime ? Math.min(64,timestamp-lastTime) : 16;
     const factor=reduceMotion?1:(1-Math.exp(-dt/200));
     currentY+=(goalY-currentY)*factor;
     currentOpacity+=(goalOpacity-currentOpacity)*factor;
     heroNav.style.setProperty('--hero-nav-y',currentY.toFixed(2)+'px');
     heroNav.style.setProperty('--hero-nav-opacity',currentOpacity.toFixed(3));
     const hidden=currentOpacity<.04;
     heroNav.classList.toggle('nav-inactive',hidden);
     if(hidden && heroNav.querySelector('.mobile-drawer.open')) closeAllMenus();
     heroNav.inert=hidden;
     heroNav.setAttribute('aria-hidden',String(hidden));
     lastTime=timestamp;
     if(Math.abs(currentY-goalY)>.13||Math.abs(currentOpacity-goalOpacity)>.004){
       frame=requestAnimationFrame(updateScrollNavigation);
     }
   }
 }
 function queueUpdate(){if(!frame)frame=requestAnimationFrame(updateScrollNavigation)}
 window.addEventListener('scroll',queueUpdate,{passive:true});
 window.addEventListener('resize',queueUpdate,{passive:true});
 queueUpdate();
 document.querySelectorAll('.cv-trigger').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.getElementById('cvModal')?.classList.add('open');}));
 const modal=document.getElementById('cvModal');document.querySelectorAll('[data-close-cv]').forEach(b=>b.addEventListener('click',()=>modal?.classList.remove('open')));modal?.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});window.addEventListener('keydown',e=>{if(e.key==='Escape')modal?.classList.remove('open')});
 const photo=document.getElementById('photoInput');photo?.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f||!f.type.startsWith('image/'))return;const url=URL.createObjectURL(f);const img=document.getElementById('portraitImage');img.onload=()=>URL.revokeObjectURL(url);img.src=url;img.style.display='block';const placeholder=document.getElementById('portraitSvg');if(placeholder)placeholder.style.display='none';});
 const form=document.querySelector('.demo-form');form?.addEventListener('submit',e=>{e.preventDefault();const status=form.querySelector('.form-status');if(status){status.hidden=false;status.textContent='Preview only — your form is valid, but no message was sent. The backend will be connected after design approval.';}else{alert('Design preview only — the contact backend is not connected yet.');}});
})();


// V7 interactive DESIGN preview: these are scripted answers, not a live AI model.
(()=>{
 const scripted={
   work:{question:'What can Faizan help build?',answer:'Faizan works across full-stack applications, API integrations, and technology project delivery, including digital banking solutions.'},
   banking:{question:'What is his banking experience?',answer:'He has worked on digital banking projects involving customer channels, service integrations, kiosks, and coordination across technical teams.'},
   contact:{question:'How can I get in touch?',answer:'You can reach Faizan through the Contact page by email, or use Let’s Chat on WhatsApp once a professional contact number is connected.'}
 };
 document.querySelectorAll('.mini-ai-question').forEach(button=>button.addEventListener('click',()=>{
   const data=scripted[button.dataset.aiQuestion];if(!data)return;
   const q=document.getElementById('miniAiQuestion'),a=document.getElementById('miniAiAnswer');
   if(!q||!a)return;
   q.textContent=data.question;a.textContent=data.answer;
   a.classList.remove('answer-updating');void a.offsetWidth;a.classList.add('answer-updating');
   document.querySelectorAll('.mini-ai-question').forEach(other=>{other.classList.toggle('is-selected',other===button);other.setAttribute('aria-pressed',String(other===button));});
 }));
 document.querySelectorAll('.mini-ai-question').forEach(button=>button.setAttribute('aria-pressed',String(button.classList.contains('is-selected'))));
 const modal=document.createElement('div');
 modal.className='whatsapp-preview-backdrop';
 modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','WhatsApp preview');
 modal.innerHTML='<div class="whatsapp-preview-box"><div class="eyebrow">LET’S CHAT</div><h3>WhatsApp connection coming soon</h3><p>This is a design preview. Once Faizan chooses a public WhatsApp number, this button will open a direct chat with a prefilled message. No chat is opened yet.</p><button type="button" class="btn btn-primary whatsapp-preview-close">Got it</button></div>';
 if(document.querySelector('.whatsapp-preview-trigger')){
   document.body.appendChild(modal);
   document.querySelectorAll('.whatsapp-preview-trigger').forEach(button=>button.addEventListener('click',()=>{modal.classList.add('open');modal.querySelector('.whatsapp-preview-close').focus();}));
   modal.querySelector('.whatsapp-preview-close').addEventListener('click',()=>modal.classList.remove('open'));
   modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});
   document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.classList.remove('open')});
 }
})();


// V8 FOOTER DESIGN PREVIEW: copyright and smooth back-to-top.
(()=>{
  document.querySelectorAll('.footer-year').forEach(el=>el.textContent=String(new Date().getFullYear()));
  document.querySelectorAll('.footer-backtop').forEach(button=>button.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})));
})();

// V12: Focused hero-to-About scroll. No arbitrary animation on every wheel tick.
(()=>{
  document.querySelectorAll('.hero-learn-more').forEach(trigger=>{
    trigger.addEventListener('click',event=>{
      const target=document.getElementById('home-about');
      if(!target)return;
      event.preventDefault();
      const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const offset=window.innerWidth<=620?5:16;
      const y=target.getBoundingClientRect().top+window.scrollY+offset;
      window.scrollTo({top:y,behavior:reduce?'instant':'smooth'});
    });
  });
  document.querySelectorAll('[data-link-pending]').forEach(button=>button.addEventListener('click',()=>{
    const message=document.getElementById('socialLinkNote');
    if(message){message.textContent='LinkedIn profile URL will be connected after confirmation.';message.hidden=false;}
  }));
})();


// V14: relaxed, accessible, single-open FAQ accordion.
// Opening another answer collapses the previous one at the same time.
(()=>{
  const items=[...document.querySelectorAll('.faq-item')];
  function setOpen(item,open){
    const button=item.querySelector('.faq-trigger');
    const panel=item.querySelector('.faq-panel');
    if(!button||!panel)return;
    item.classList.toggle('is-open',open);
    button.setAttribute('aria-expanded',String(open));
    panel.setAttribute('aria-hidden',String(!open));
    panel.inert=!open;
  }
  items.forEach(item=>{
    const button=item.querySelector('.faq-trigger');
    if(!button)return;
    button.addEventListener('click',()=>{
      const willOpen=!item.classList.contains('is-open');
      items.forEach(other=>setOpen(other,other===item&&willOpen));
    });
  });
})();

// V15 — Visual direction A/B selector for homepage About section.
(()=>{
  const buttons=[...document.querySelectorAll('[data-about-mode]')];
  const visual=document.getElementById('aboutVisual');
  const portrait=document.getElementById('aboutPortraitPanel');
  if(!buttons.length||!visual||!portrait)return;
  function setMode(mode){
    visual.hidden=mode!=='visual';portrait.hidden=mode!=='portrait';
    buttons.forEach(b=>{const on=b.dataset.aboutMode===mode;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));});
  }
  buttons.forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.aboutMode)));
  const input=document.getElementById('aboutPhotoInput');
  const img=document.getElementById('aboutPortraitImage');
  const placeholder=document.getElementById('aboutPortraitPlaceholder');
  const change=document.getElementById('aboutChangePhoto');
  let priorUrl;
  input?.addEventListener('change',()=>{
    const file=input.files?.[0];if(!file||!file.type.startsWith('image/'))return;
    const url=URL.createObjectURL(file);
    if(priorUrl)URL.revokeObjectURL(priorUrl);
    priorUrl=url;img.src=url;img.hidden=false;placeholder.hidden=true;change.hidden=false;
  });
  window.addEventListener('pagehide',()=>{if(priorUrl)URL.revokeObjectURL(priorUrl)},{once:true});
  setMode('visual');
})();
