/* s-people: owned by the people section builder. People photo wipes, the footer "Where we build" line and the footer skyline */
(function(){
  var d=document, S=window.SITE||{}, root=d.documentElement;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IO='IntersectionObserver' in window;

  /* footer: where we build, from SITE.areas (the page hides the line while it is empty) */
  var ar=d.getElementById('foot-areas'), A=S.areas;
  if(ar){
    var list=Array.isArray(A)?A.filter(function(x){return x!=null&&String(x).trim()!==''}):(A?[String(A)]:[]);
    if(list.length){ar.textContent=list.join(' · ');ar.parentNode.hidden=false}
    else ar.parentNode.hidden=true;
  }

  /* people: each photo opens with a clip-path wipe as it enters */
  var sec=d.getElementById('people');
  if(sec&&IO&&!reduce){
    var figs=[].slice.call(sec.querySelectorAll('.pp-fig'));
    sec.classList.add('pp-on');
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.18,rootMargin:'0px 0px -40px 0px'});
    figs.forEach(function(f){io.observe(f)});
  }

  /* footer skyline: the crane draws in once, the load sways only while on screen, slow cursor parallax on fine pointers */
  var foot=d.querySelector('footer.foot'), sky=foot&&foot.querySelector('.foot-sky');
  if(!foot||!sky||reduce||!IO)return;
  foot.classList.add('sky-on');
  var onScreen=false;
  function live(){sky.classList.toggle('live',onScreen&&!d.hidden)}
  new IntersectionObserver(function(es){
    onScreen=es[0].isIntersecting;
    if(onScreen)sky.classList.add('drawn');
    live();
    if(!onScreen)reset();
  },{threshold:.25}).observe(sky);
  d.addEventListener('visibilitychange',live);

  var fine=matchMedia('(pointer:fine)').matches&&!root.classList.contains('lite');
  var L=[[sky.querySelector('.sk-far'),3],[sky.querySelector('.sk-mid'),7],[sky.querySelector('.sk-near'),12]];
  var tx=0,cx=0,raf=0;
  function step(){
    cx+=(tx-cx)*.045;
    L.forEach(function(l){if(l[0])l[0].style.transform='translate3d('+(-cx*l[1]).toFixed(2)+'px,0,0)'});
    raf=Math.abs(tx-cx)>.002?requestAnimationFrame(step):0;
  }
  function kick(){if(!raf)raf=requestAnimationFrame(step)}
  function reset(){tx=0;kick()}
  if(fine){
    addEventListener('pointermove',function(e){if(!sky.classList.contains('live'))return;tx=e.clientX/innerWidth*2-1;kick()},{passive:true});
    d.addEventListener('pointerleave',reset);
  }
})();
