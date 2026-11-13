/* s-services: tabbed showcase with a slow autoplay and a 12-slat photo reveal.
   Without JS the four articles stay stacked. Reduced motion: tabs only, no autoplay, no slats. */
(function(){
  var d=document, sec=d.getElementById('services'); if(!sec)return;
  var box=sec.querySelector('.svc-show'), list=sec.querySelector('.svc-tabs'); if(!box||!list)return;
  var tabs=[].slice.call(list.querySelectorAll('[role=tab]')), panels=[].slice.call(sec.querySelectorAll('.svc-panel'));
  if(!tabs.length||tabs.length!==panels.length)return;

  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io='IntersectionObserver' in window;
  var lite=d.documentElement.classList.contains('lite')||(matchMedia('(pointer:coarse)').matches&&(navigator.hardwareConcurrency||8)<=4);
  var motion=!reduce&&io;
  var cur=0, seen=!motion, auto=motion, onScreen=false, hover=false, focus=false;

  list.hidden=false;
  box.classList.add('is-tabs');
  panels.forEach(function(p,i){
    p.setAttribute('role','tabpanel');
    p.setAttribute('aria-labelledby',tabs[i].id);
    p.tabIndex=0;
    p.classList.toggle('is-on',i===0);
    if(!motion)return;
    var ph=p.querySelector('.svc-ph'); if(!ph)return;
    var s=d.createElement('span'), n=lite?6:12;
    s.className='svc-slats'; s.setAttribute('aria-hidden','true'); s.style.setProperty('--n',n);
    for(var k=0;k<n;k++){var e=d.createElement('i');e.style.setProperty('--i',k);s.appendChild(e)}
    ph.appendChild(s);
    s.lastChild.addEventListener('animationend',function(){if(p.classList.contains('svc-open'))p.classList.add('svc-done')});
  });
  if(motion)panels[0].classList.add('svc-wait');

  /* every time a panel shows, its photo opens through the slats */
  function reveal(p){
    if(!motion)return;
    p.classList.remove('svc-open','svc-done','svc-wait');
    void p.offsetWidth;
    p.classList.add('svc-open');
  }

  function select(i,user){
    if(user)stop();
    if(i===cur&&(seen||!user))return;
    cur=i;
    tabs.forEach(function(t,j){var on=j===i;t.setAttribute('aria-selected',on?'true':'false');t.tabIndex=on?0:-1});
    panels.forEach(function(p,j){p.classList.toggle('is-on',j===i)});
    if(motion){seen=true;reveal(panels[i])}
    sync();
  }

  /* slow autoplay: one round through the four, paused on hover, focus, off-screen and in a hidden tab */
  function stop(){auto=false;box.classList.remove('svc-auto','svc-paused')}
  function sync(){if(!auto)return;box.classList.toggle('svc-paused',!(seen&&onScreen&&!hover&&!focus&&!d.hidden))}
  tabs.forEach(function(t,i){
    var bar=t.querySelector('.svc-bar i');
    if(bar)bar.addEventListener('animationend',function(){
      if(!auto||i!==cur)return;
      var n=(cur+1)%tabs.length;
      if(n===0){stop()}
      select(n,false);
    });
    t.addEventListener('click',function(){select(i,true)});
    t.addEventListener('keydown',function(e){
      var k=e.key,n=null,L=tabs.length;
      if(k==='ArrowRight'||k==='ArrowDown')n=(i+1)%L;
      else if(k==='ArrowLeft'||k==='ArrowUp')n=(i-1+L)%L;
      else if(k==='Home')n=0;
      else if(k==='End')n=L-1;
      if(n===null)return;
      e.preventDefault();select(n,true);tabs[n].focus();
    });
  });

  if(auto){
    box.classList.add('svc-auto','svc-paused');
    box.addEventListener('mouseenter',function(){hover=true;sync()});
    box.addEventListener('mouseleave',function(){hover=false;sync()});
    box.addEventListener('focusin',function(){focus=true;sync()});
    box.addEventListener('focusout',function(e){if(!box.contains(e.relatedTarget)){focus=false;sync()}});
    /* a visitor touching the article to read it has chosen to stay on it */
    sec.querySelector('.svc-panels').addEventListener('touchstart',stop,{passive:true});
    d.addEventListener('visibilitychange',sync);
  }

  if(motion){
    new IntersectionObserver(function(es){onScreen=es[0].intersectionRatio>=.3;sync()},{threshold:[0,.3]}).observe(box);
    /* first entry: open the photo once it is properly in view */
    var first=new IntersectionObserver(function(es){
      if(!es[0].isIntersecting)return;
      first.disconnect();
      if(!seen){seen=true;reveal(panels[cur])}
      sync();
    },{threshold:.35});
    first.observe(panels[0].querySelector('.svc-ph')||panels[0]);
  }
})();
