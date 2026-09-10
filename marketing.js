(() => {
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const body=document.body;
  function openApp(service){body.classList.remove('marketing-mode');body.classList.add('app-active');document.documentElement.scrollTop=0;document.body.scrollTop=0;qs('#mobileDrawer')?.classList.remove('open');setTimeout(()=>window.dispatchEvent(new Event('resize')),120);if(service){setTimeout(()=>{const target=qs(`[data-super-service="${service}"]`)||qs(`[data-service="${service}"]`);if(target)target.click()},220)}}
  function openSite(){body.classList.remove('app-active');body.classList.add('marketing-mode');window.scrollTo({top:0,behavior:'instant'});history.replaceState(null,'',location.pathname)}
  qsa('[data-open-app]').forEach(b=>b.addEventListener('click',()=>openApp(b.dataset.serviceJump||'')));
  qs('#backToSite')?.addEventListener('click',openSite);
  qs('#siteMenu')?.addEventListener('click',()=>{const d=qs('#mobileDrawer'),m=qs('#siteMenu');const open=!d?.classList.contains('open');d?.classList.toggle('open',open);m?.classList.toggle('open',open);m?.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)});
  qsa('#mobileDrawer a').forEach(a=>a.addEventListener('click',()=>{qs('#mobileDrawer')?.classList.remove('open');qs('#siteMenu')?.classList.remove('open');qs('#siteMenu')?.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')}));
  const cookie=qs('#cookieCard');if(localStorage.getItem('ride_cookie_choice'))cookie.hidden=true;qsa('[data-cookie-open]').forEach(b=>b.addEventListener('click',()=>{cookie.hidden=false}));
  qs('#cookieAccept')?.addEventListener('click',()=>{localStorage.setItem('ride_cookie_choice','accepted');cookie.hidden=true});
  qs('#cookieManage')?.addEventListener('click',()=>{localStorage.setItem('ride_cookie_choice','essential');cookie.hidden=true;qs('#toast')&&(qs('#toast').textContent='Preferensi disimpan: penyimpanan esensial saja.',qs('#toast').classList.add('show'),setTimeout(()=>qs('#toast').classList.remove('show'),2200))});
  qsa('.h-scroll,.benefit-scroll,.product-scroll').forEach(track=>{const controls=document.createElement('div');controls.className='carousel-controls';controls.innerHTML='<button aria-label="Geser ke kiri">‹</button><button aria-label="Geser ke kanan">›</button>';track.after(controls);const [prev,next]=controls.querySelectorAll('button');prev.onclick=()=>track.scrollBy({left:-Math.max(280,track.clientWidth*.7),behavior:'smooth'});next.onclick=()=>track.scrollBy({left:Math.max(280,track.clientWidth*.7),behavior:'smooth'})});
  if(location.hash==='#app')openApp();
})();
