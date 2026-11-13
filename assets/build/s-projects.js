/* s-projects: owned by the projects section builder */
/* From the archive: comparison sliders (a range input drives the split, so mouse, touch and keyboard
   all work), a single sweep on the first plate that hands over on any input, and filter tabs. */
(function(){
  var sec=document.getElementById('projects'); if(!sec) return;
  var d=document, $$=function(s,r){return [].slice.call((r||sec).querySelectorAll(s))};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var grid=sec.querySelector('.pj-grid'), cards=$$('.pj-card');

  /* sliders */
  $$('.pj-cmp').forEach(function(c){
    var inp=c.querySelector('input[type=range]'); if(!inp) return;
    function set(){var v=+inp.value;c.style.setProperty('--pj-x',v+'%');inp.setAttribute('aria-valuetext',v===50?'Half plan, half built':v+'% plan, '+(100-v)+'% built')}
    /* any visitor input ends the sweep where it stands, and the visitor carries on from there */
    function takeOver(){
      c.dataset.touched='1';
      if(!c.classList.contains('pj-sweep')) return;
      var v=parseFloat(getComputedStyle(c).getPropertyValue('--pj-x'));
      c.classList.remove('pj-sweep');
      if(v>=0&&v<=100) inp.value=Math.round(v);
      set();
    }
    ['pointerdown','touchstart','keydown','focus','wheel'].forEach(function(t){inp.addEventListener(t,takeOver,{passive:true})});
    inp.addEventListener('input',function(){takeOver();set()});
    inp.addEventListener('pointerdown',function(){c.classList.add('pj-drag')});
    ['pointerup','pointercancel','blur'].forEach(function(t){inp.addEventListener(t,function(){c.classList.remove('pj-drag')})});
    c.addEventListener('animationend',function(e){if(e.target===c&&c.classList.contains('pj-sweep')){c.classList.remove('pj-sweep');inp.value=50;set()}});
    set();
  });

  /* the first plate sweeps once when it is well on screen (needs a registered --pj-x to interpolate) */
  var canSweep=!reduce&&window.CSS&&CSS.registerProperty&&'IntersectionObserver' in window;
  var first=sec.querySelector('.pj-cmp');
  if(canSweep&&first){
    var t=null, io=new IntersectionObserver(function(es){
      var e=es[0];
      if(e.isIntersecting&&!t){t=setTimeout(function(){
        io.disconnect();
        if(first.dataset.touched||d.hidden||!first.offsetParent) return;
        first.classList.add('pj-sweep');
      },650)}
      else if(!e.isIntersecting&&t){clearTimeout(t);t=null}
    },{threshold:.65});
    io.observe(first);
  }

  /* layout helpers: a lower middle column in the three-up grid, and the visible count */
  function layout(){
    var vis=cards.filter(function(c){return !c.hidden});
    grid.setAttribute('data-n',vis.length);
    vis.forEach(function(c,i){c.classList.toggle('pj-mid',i%3===1);c.style.setProperty('--i',i)});
    return vis;
  }

  /* filter tabs: All, Residential, Commercial */
  var bar=sec.querySelector('.pj-filter'), tabs=$$('.pj-tab'), status=sec.querySelector('.pj-status'), cur='all', busy=null;
  if(bar&&tabs.length){
    var count=function(f){return cards.filter(function(c){return f==='all'||c.dataset.cat===f}).length};
    tabs.forEach(function(b){var i=b.querySelector('i');if(i)i.textContent=count(b.dataset.f)});
    bar.hidden=false;
    function apply(f){
      if(f===cur) return; cur=f;
      tabs.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.f===f)});
      var n=count(f);
      status.textContent='Showing '+n+(f==='all'?'':' '+f)+' project'+(n===1?'':'s')+'.';
      function swap(){
        cards.forEach(function(c){c.hidden=!(f==='all'||c.dataset.cat===f);c.classList.remove('pj-enter')});
        var vis=layout();
        if(!reduce){void grid.offsetWidth;vis.forEach(function(c){c.classList.add('in','pj-enter')})}
        else vis.forEach(function(c){c.classList.add('in')});
        grid.classList.remove('pj-out');
      }
      clearTimeout(busy);
      if(reduce){swap();return}
      grid.classList.add('pj-out');
      busy=setTimeout(swap,460);
    }
    tabs.forEach(function(b){b.addEventListener('click',function(){apply(b.dataset.f)})});
    /* arrow keys move between the three tabs */
    bar.addEventListener('keydown',function(e){
      var k=e.key, i=tabs.indexOf(d.activeElement); if(i<0) return;
      var j=k==='ArrowRight'?(i+1)%tabs.length:k==='ArrowLeft'?(i+tabs.length-1)%tabs.length:k==='Home'?0:k==='End'?tabs.length-1:-1;
      if(j>=0){e.preventDefault();tabs[j].focus()}
    });
  }
  layout();
})();
