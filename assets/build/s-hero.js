/* hero crane: measures the headline so the hook meets it at every size (re-measured when fonts load and on resize),
   and lets the parked hook sway only while the hero is on screen and the tab is visible. No scroll handlers. */
(function(){
  var d=document, hero=d.querySelector('.hero'), hc=hero&&hero.querySelector('.hc');
  if(!hc)return;
  var h1=d.getElementById('h1'), rig=hc.querySelector('.hc-rig'), issue=hero.querySelector('.issue'), type=hero.querySelector('.issue .type'), trolley=hc.querySelector('.hc-trolley');
  if(!h1||!rig||!issue||!type)return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, lite=d.documentElement.classList.contains('lite');
  var ctx=d.createElement('canvas').getContext('2d');
  /* rig units: hook pivot below the jib line, hook block height to the bottom of the bowl, bowl offset, lift distance in px */
  var PIVOT=14, HOOK=24.5, BOWL=3.5, LIFT=40, JIB=312;

  function prop(n,f){var v=parseFloat(getComputedStyle(hc).getPropertyValue(n));return isNaN(v)?f:v}
  function set(n,v){hc.style.setProperty(n,String(Math.round(v*1000)/1000))}
  function offTop(el){var y=0;while(el&&el!==hero){y+=el.offsetTop;el=el.offsetParent}return y}
  function glyph(node,i){var r=d.createRange();r.setStart(node,i);r.setEnd(node,i+1);return r.getBoundingClientRect()}

  function measure(){
    hc.style.removeProperty('--mx');
    var s=prop('--s',1), wide=prop('--wide',1)===1, hr=hero.getBoundingClientRect(), tr=type.getBoundingClientRect(), textL=tr.left-hr.left;
    if(!wide){
      /* stand the mast on the dateline's left rule, with room for the counter-jib */
      var ir=issue.getBoundingClientRect(), rule=Math.min(160,(ir.width-tr.width-28)/2), ruleL=textL-14-rule;
      hc.style.setProperty('--mx',Math.round(Math.max(ruleL+Math.min(28,rule*.35),100*s+8))+'px');
    }
    var mx=rig.offsetLeft, jy=rig.offsetTop;
    /* the hook takes the first letter of the headline that sits clear of the mast and of the dateline text */
    var node=h1.firstChild; if(!node||node.nodeType!==3)return;
    var cs=getComputedStyle(h1), h1r=h1.getBoundingClientRect(), top0=offTop(h1), pick=null, first=null;
    ctx.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
    for(var i=0;i<node.data.length;i++){
      var c=node.data.charAt(i); if(!/[A-Za-z]/.test(c))continue;
      var r=glyph(node,i), m=ctx.measureText(c), asc=m.fontBoundingBoxAscent||r.height*.78, ink=m.actualBoundingBoxAscent||r.height*.6;
      var cx=r.left-hr.left+((m.actualBoundingBoxRight||r.width)-(m.actualBoundingBoxLeft||0))/2;
      var cand={R:(cx-mx)/s+BOWL, top:top0+(r.top-h1r.top)+asc-ink, cx:cx};
      if(!first)first=cand;
      if(cx>textL-8)break;
      if(cand.R>=70){pick=cand;break}
    }
    pick=pick||first; if(!pick)return;
    var R=Math.min(Math.max(pick.R,40),JIB), Lr=prop('--Lr',22);
    var L=Math.max((pick.top+1-jy)/s-PIVOT-HOOK,4), Ld=L+LIFT/s;
    set('--R',R);set('--L',L);set('--Ld',Ld);set('--Hl',Ld);set('--k1',L/Ld);set('--kr',Lr/Ld);
  }
  measure();
  if(d.fonts&&d.fonts.ready)d.fonts.ready.then(measure);
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(measure,150)});

  /* once parked, the hook sways very slightly; paused off screen and in a hidden tab */
  if(reduce||lite)return;
  var on=false, idle=false;
  function live(){hc.classList.toggle('live',on&&!d.hidden)}
  function rest(){if(idle)return;idle=true;hc.classList.add('idle');live()}
  if(trolley)trolley.addEventListener('animationend',function(e){if(e.animationName==='hc-back')rest()});
  setTimeout(rest,Math.max(500,5000-performance.now()));
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){on=es[0].isIntersecting;live()}).observe(hero)}else{on=true;live()}
  d.addEventListener('visibilitychange',live);
})();
