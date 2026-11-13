/* s-process: owned by the process section builder.
   The timber frame beside "Thirty weeks on site" draws one part per diary entry.
   Laptops: an entry counts once its top passes 60% of the screen (IntersectionObserver
   class changes only, nothing tied to the scroll position). Phones and tablets: the
   frame draws once, in order, when it comes on screen. Reduced motion or no
   IntersectionObserver: the frame stays finished. */
(function(){
  var sec=document.getElementById('process'); if(!sec) return;
  var pf=sec.querySelector('.pf'), entries=[].slice.call(sec.querySelectorAll('.entry'));
  if(!pf||!entries.length||!('IntersectionObserver' in window)) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var wide=matchMedia('(min-width:1100px)'), N=5, shown=0, target=0, timer=null, played=false, seen=false;

  function paint(n){for(var i=1;i<=N;i++)pf.classList.toggle('g'+i,i<=n)}
  /* move one stage at a time so a jump (a nav link, a reload mid-page) still draws in build order */
  function step(){
    timer=null; if(shown===target) return;
    shown+=target>shown?1:-1; paint(shown);
    if(shown!==target) timer=setTimeout(step,target<shown?140:wide.matches?720:900);
  }
  function go(n){target=n; if(!timer) step()}

  function reached(){var line=innerHeight*.6,n=0;entries.forEach(function(e,i){if(e.getBoundingClientRect().top<line)n=i+1});return Math.min(n,N)}
  function update(){
    var n=reached();
    entries.forEach(function(e,i){e.classList.toggle('pf-on',i<n)});
    if(wide.matches) go(n);
    else if(seen&&!played){played=true;go(N)}
  }

  pf.classList.add('armed'); paint(0);
  var io=new IntersectionObserver(update,{rootMargin:'0px 0px -40% 0px'});
  entries.forEach(function(e){io.observe(e)});
  /* phones and tablets: the sheet sits above the entries and draws once */
  new IntersectionObserver(function(es){if(es[0].isIntersecting){seen=true;update()}},{threshold:.35}).observe(pf);
  var onChange=function(){if(wide.matches)update();else{played=true;go(N)}};
  if(wide.addEventListener)wide.addEventListener('change',onChange);else if(wide.addListener)wide.addListener(onChange);
})();
