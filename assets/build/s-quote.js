/* s-quote: owned by the quote section builder.
   The three-step enquiry card (validation per step, honeypot, aria-live status, endpoint or mailto send)
   and the sketched house beside it that draws itself as the steps are completed. */
(function(){
  var d=document, sec=d.getElementById('contact'); if(!sec)return;
  var f=sec.querySelector('form[data-enquiry]'); if(!f)return;
  var S=window.SITE||{}, $=function(s,r){return (r||sec).querySelector(s)}, $$=function(s,r){return [].slice.call((r||sec).querySelectorAll(s))};
  var has=function(v){return v!=null&&v!==''&&!(Array.isArray(v)&&!v.length)};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* WhatsApp link from SITE (the page fills the phone, email and map links) */
  var wa=d.getElementById('qc-wa');
  if(wa&&has(S.whatsapp))wa.href='https://wa.me/'+String(S.whatsapp).replace(/\D/g,'');

  /* ---------- the sketch: lines that overshoot their corners, drawn with stroke-dashoffset ---------- */
  var sk=d.getElementById('qc-sketch'), seed=11, base=0, k=0, cid=0;
  function rnd(){seed=seed*16807%2147483647;return (seed-1)/2147483646}
  function n(v){return Math.round(v*10)/10}
  function at(t){base=t;k=0}
  function L(x1,y1,x2,y2,o,cls){
    o=o==null?4:o;
    var dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)||1,ux=dx/len,uy=dy/len,a=o*(.35+rnd()*.85),b=o*(.35+rnd()*.85);
    var sx=x1-ux*a+(rnd()-.5)*.8,sy=y1-uy*a+(rnd()-.5)*.8,ex=x2+ux*b+(rnd()-.5)*.8,ey=y2+uy*b+(rnd()-.5)*.8;
    var bow=(rnd()-.5)*Math.min(2.4,len*.025),mx=(sx+ex)/2-uy*bow,my=(sy+ey)/2+ux*bow;
    var s='<path class="d'+(cls?' '+cls:'')+'" pathLength="1" style="--d:'+(base+k*.07).toFixed(2)+'s" d="M'+n(sx)+' '+n(sy)+'Q'+n(mx)+' '+n(my)+' '+n(ex)+' '+n(ey)+'"/>';
    k++;return s;
  }
  function box(x1,y1,x2,y2,open,cls){return L(x1,y1,x1,y2,4,cls)+L(x1,y1,x2,y1,4,cls)+L(x2,y1,x2,y2,4,cls)+(open?'':L(x1,y2,x2,y2,4,cls))}
  function win(x1,y1,x2,y2,m){
    var s=box(x1,y1,x2,y2,false), i;
    if(m==='cross'){s+=L((x1+x2)/2,y1,(x1+x2)/2,y2,0)+L(x1,(y1+y2)/2,x2,(y1+y2)/2,0)}
    else if(m>0){for(i=1;i<=m;i++)s+=L(x1+(x2-x1)*i/(m+1),y1,x1+(x2-x1)*i/(m+1),y2,0)}
    return s+L(x1-4,y2+3,x2+4,y2+3,1);
  }
  function hatch(pts,gap,slope,cls,delay){
    var id='qc-c'+(cid++), xs=pts.filter(function(_,i){return i%2===0}), ys=pts.filter(function(_,i){return i%2===1});
    var x0=Math.min.apply(0,xs),x1=Math.max.apply(0,xs),y0=Math.min.apply(0,ys),y1=Math.max.apply(0,ys),h=y1-y0,p='',x;
    for(x=x0-h*Math.abs(slope);x<x1+h*Math.abs(slope);x+=gap)p+='M'+n(x)+' '+y1+'L'+n(x+h*slope)+' '+y0;
    var poly=[];for(var i=0;i<pts.length;i+=2)poly.push(pts[i]+','+pts[i+1]);
    return '<clipPath id="'+id+'"><polygon points="'+poly.join(' ')+'"/></clipPath><path class="f '+cls+'" style="--d:'+delay+'s" clip-path="url(#'+id+')" d="'+p+'"/>';
  }
  function lit(x1,y1,x2,y2,delay){return '<rect class="f lit" style="--d:'+delay+'s" x="'+(x1+1.5)+'" y="'+(y1+1.5)+'" width="'+(x2-x1-3)+'" height="'+(y2-y1-3)+'"/>'}
  function knob(x,y,delay){return '<circle class="f knob" style="--d:'+delay+'s" cx="'+x+'" cy="'+y+'" r="1.9"/>'}
  function slab(x1,x2){at(0);return L(x1,186,x2,186)+L(x1,186,x1,196,2)+L(x2,186,x2,196,2)+hatch([x1,186,x2,186,x2,196,x1,196],6,1,'hatch',.5)+dim(x1,x2)}
  function dim(x1,x2){at(.7);return L(x1,212,x2,212,0,'dim')+L(x1,207,x1,217,0,'dim')+L(x2,207,x2,217,0,'dim')+L(x1-3,215,x1+3,209,0,'dim')+L(x2-3,215,x2+3,209,0,'dim')}
  function g(cls,inner){return '<g class="'+cls+'">'+inner+'</g>'}
  var T={
    home:function(){
      return g('s1',slab(70,290))+
        g('s2',(at(0),L(84,186,84,124)+L(276,186,276,124)+L(84,124,276,124))+(at(.45),win(106,138,146,168,'cross')+win(214,138,254,168,'cross')))+
        g('s3',lit(106,138,146,168,1.2)+(at(0),L(70,125,180,58)+L(180,58,290,125)+L(70,125,290,125))+hatch([84,121,180,63,276,121],9,-.55,'shade',.9)+(at(.5),L(228,88,228,66,3)+L(228,66,244,66,3)+L(244,66,244,97,3))+(at(.7),box(166,146,194,186,true))+knob(188,167,1.1))},
    extension:function(){
      return g('s1',g('ghost',(at(0),L(40,196,40,128)+L(32,128,98,78)+L(98,78,164,128)+L(32,128,164,128)+win(58,146,90,170,'cross')+box(110,156,134,196,true))))+g('s1',slab(160,322))+
        g('s2',(at(0),L(316,186,316,136)+L(160,136,316,136))+(at(.4),win(176,148,268,180,2)))+
        g('s3',lit(176,148,268,180,1.2)+(at(0),L(154,131,324,123)+L(324,123,324,136,2))+(at(.6),box(282,150,306,186,true))+knob(301,169,1))},
    shopfront:function(){
      return g('s1',slab(70,290))+
        g('s2',(at(0),L(80,186,80,72)+L(280,186,280,72)+L(80,72,280,72)+L(80,122,280,122,0))+(at(.4),win(100,86,134,110,1)+win(163,86,197,110,1)+win(226,86,260,110,1)+box(94,142,196,186,true)+L(145,142,145,186,0)))+
        g('s3',lit(94,142,196,186,1.3)+(at(0),box(74,62,286,72,true))+(at(.35),L(86,126,274,126)+L(86,126,80,138,2)+L(274,126,280,138,2)+L(80,138,280,138))+hatch([86,126,274,126,280,138,80,138],10,0,'hatch',.9)+(at(.7),box(214,146,250,186,true))+knob(244,167,1.1))},
    warehouse:function(){
      return g('s1',slab(40,320))+
        g('s2',(at(0),L(52,186,52,118)+L(308,186,308,118)+L(52,118,308,118))+(at(.4),win(68,128,112,144,1)+win(248,128,292,144,1)))+
        g('s3',lit(68,128,112,144,1.3)+(at(0),L(40,119,180,86)+L(180,86,320,119)+L(40,119,320,119))+hatch([52,116,180,89,308,116],10,-.5,'shade',.9)+(at(.5),box(140,134,220,186,true)+L(140,148,220,148,0)+L(140,161,220,161,0)+L(140,174,220,174,0))+(at(.8),box(236,152,256,186,true)))},
    storey:function(){
      return g('s1',slab(92,268))+
        g('s2',(at(0),L(102,186,102,98)+L(258,186,258,98)+L(102,98,258,98)+L(102,141,258,141,0))+(at(.45),win(118,108,152,130,1)+win(208,108,242,130,1)+win(118,152,152,176,'cross')))+
        g('s3',lit(118,152,152,176,1.2)+(at(0),L(90,99,132,56)+L(132,56,228,56)+L(228,56,270,99)+L(90,99,270,99))+hatch([102,96,134,59,226,59,258,96],9,-.6,'shade',.9)+(at(.6),box(202,146,230,186,true))+knob(224,167,1))}
  };
  var TYPE={'New home':'home','Renovation or extension':'extension','Commercial fit-out':'shopfront','Light commercial':'warehouse','Knockdown rebuild':'storey','Not sure yet':'home'};
  var NAME={'New home':'a new home','Renovation or extension':'an extension','Commercial fit-out':'a shopfront fit-out','Light commercial':'a warehouse','Knockdown rebuild':'a knockdown rebuild','Not sure yet':'to be decided'};
  var capType=null;
  if(sk){
    var svg='<svg viewBox="0 0 360 228" role="presentation" focusable="false">'+g('site on',g('s1',(at(0),L(14,196,346,196,6)+L(22,196,25,190,0)+L(28,196,28,189,0)+L(332,196,335,190,0)+L(338,196,338,189,0))));
    /* each job: a faint pencil under-drawing (its own wobble), then the ink lines that draw in stage by stage */
    Object.keys(T).forEach(function(t){var u=T[t]();svg+='<g class="g'+(t==='home'?' on':'')+'" data-house="'+t+'"><g class="under">'+u+'</g>'+T[t]()+'</g>'});
    sk.innerHTML=svg+'</svg><figcaption><span class="sc">Sketch</span><b>a new home</b></figcaption>';
    capType=sk.querySelector('figcaption b');
  }

  /* ---------- the three steps ---------- */
  var wrap=f.closest('.qc-cardwrap'), steps=$$('.qc-step',f), dots=$$('.qc-dots li',f), no=$('.qc-no span',f),
      back=$('.qc-back',f), next=$('.qc-next',f), send=$('.qc-send',f), again=$('.qc-again',f), status=$('.qc-status',f), sum=$('.qc-sum',f),
      cur=0, busy=false, seen=false, sent=false;
  var EMAIL=/^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  var MSG={type:'Please tick the kind of job.',have:'Please tick what you have so far.',start:'Please tick roughly when you would like to start.',state:'Please choose the state the site is in.',
    name:'Please add your name.',phone:'Please add a phone number so we can call you.',phonebad:'Please check the phone number. It needs at least 8 digits.',
    email:'Please add an email address.',emailbad:'Please check the email address.',suburb:'Please add the suburb of the site.',postcode:'Please check the postcode. Australian postcodes have 4 digits.'};
  var ORDER=[['type','Type of job'],['have','Plans and approvals'],['start','Start'],['state','State'],['budget','Budget (AUD)'],['name','Name'],['phone','Phone'],['email','Email'],['suburb','Suburb'],['postcode','Postcode'],['message','About the job'],['design','Sketch'],['page','Page']];
  function say(msg,kind){status.className='form-status qc-status'+(kind?' '+kind:'');status.textContent=msg}
  function picked(name){var el=f.querySelector('input[name="'+name+'"]:checked');return el?el.value:''}

  function house(){
    if(!sk)return;
    var v=picked('type'), t=TYPE[v]||'home';
    $$('.g',sk).forEach(function(el){el.classList.toggle('on',el.getAttribute('data-house')===t)});
    if(capType)capType.textContent=NAME[v]||'a new home';
    sk.setAttribute('data-stage',seen?(sent?3:cur+1):0);
  }
  function paint(){
    steps.forEach(function(s,i){s.classList.toggle('on',i===cur)});
    dots.forEach(function(o,i){if(i===cur)o.setAttribute('aria-current','step');else o.removeAttribute('aria-current');o.classList.toggle('done',i<cur)});
    if(no)no.textContent=cur+1;
    if(wrap)wrap.setAttribute('data-cur',cur);
    back.hidden=cur===0;next.hidden=cur===steps.length-1;send.hidden=cur!==steps.length-1;
    house();
  }
  function summary(){
    var parts=[picked('type'),picked('have'),picked('start'),f.elements.state.value].filter(Boolean);
    sum.textContent='';if(!parts.length){sum.hidden=true;return}
    var b=d.createElement('b');b.textContent='On this card: ';sum.appendChild(b);
    sum.appendChild(d.createTextNode(parts.join(', ')+'.'));
    var c=d.createElement('button');c.type='button';c.textContent='Change';c.addEventListener('click',function(){status.textContent='';go(0,true)});sum.appendChild(c);
    sum.hidden=false;
  }
  function mark(el,bad){if(bad)el.setAttribute('aria-invalid','true');else el.removeAttribute('aria-invalid')}
  function validate(i){
    var s=steps[i], bad=null, msg='';
    ['type','have','start'].forEach(function(nm){
      var r=s.querySelector('input[name="'+nm+'"]'); if(!r)return;
      var set=r.closest('.qc-set'), miss=!picked(nm); set.classList.toggle('bad',miss);
      if(miss&&!bad){bad=r;msg=MSG[nm]}
    });
    $$('select,input:not([type=radio]),textarea',s).forEach(function(el){
      var v=(el.value||'').trim(), w='', nm=el.name;
      if(el.required&&!v)w=MSG[nm]||'Please check the highlighted field.';
      else if(nm==='email'&&v&&!EMAIL.test(v))w=MSG.emailbad;
      else if(nm==='phone'&&v&&(v.replace(/\D/g,'').length<8||/[^\d\s()+.-]/.test(v)))w=MSG.phonebad;
      else if(nm==='postcode'&&v&&!/^\d{4}$/.test(v))w=MSG.postcode;
      mark(el,!!w); if(w&&!bad){bad=el;msg=w}
    });
    if(bad){say(msg);bad.focus();return false}
    say('');return true;
  }
  function into(){
    /* keep the top of the card in view on phones when the step changes */
    var t=wrap.getBoundingClientRect().top, top=(parseFloat(getComputedStyle(d.documentElement).scrollPaddingTop)||84);
    if(t<0||t>innerHeight*.5)scrollBy({top:t-top,behavior:reduce?'auto':'smooth'});
  }
  function go(n,backwards){
    if(busy||n===cur)return;busy=true;
    var from=steps[cur], to=steps[n];
    if(n===steps.length-1)summary();
    from.classList.toggle('back',!!backwards);to.classList.toggle('back',!!backwards);
    from.classList.add('leave');
    setTimeout(function(){
      from.classList.remove('leave','on','back');cur=n;paint();
      to.classList.add('enter');
      var h=to.querySelector('h3');if(h)h.focus({preventScroll:true});
      into();
      setTimeout(function(){to.classList.remove('enter','back');busy=false},reduce?0:950);
    },reduce?0:450);
  }
  back.addEventListener('click',function(){status.textContent='';go(cur-1,true)});
  next.addEventListener('click',function(){if(validate(cur))go(cur+1)});
  $$('input[type=radio]',f).forEach(function(r){r.addEventListener('change',function(){
    var set=r.closest('.qc-set');if(set)set.classList.remove('bad');
    if(!status.classList.contains('ok'))say('');
    house();
  })});
  $$('select,input:not([type=radio]),textarea',f).forEach(function(el){['input','change'].forEach(function(ev){el.addEventListener(ev,function(){
    if(el.getAttribute('aria-invalid')){mark(el,false);if(!/\b(ok|info)\b/.test(status.className))say('')}
  })})});
  /* Enter moves on a step (the native submit button is hidden until the last step) */
  f.addEventListener('keydown',function(e){
    if(e.key!=='Enter'||e.isComposing)return;
    var t=e.target; if(t.tagName==='TEXTAREA'||t.tagName==='BUTTON'||t.tagName==='A')return;
    if(t.closest('.qc-step')){e.preventDefault();if(cur<steps.length-1){if(validate(cur))go(cur+1)}else submit()}
  });

  /* the house draws its slab when the section first comes into view */
  if(sk){
    if(reduce||!('IntersectionObserver' in window)){seen=true;house()}
    else{var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){seen=true;house();io.disconnect()}},{threshold:.25});io.observe(sk.offsetParent?sk:wrap)}
  }
  paint();

  /* ---------- send: SITE.formEndpoint if set, otherwise the visitor's email app ---------- */
  function collect(){
    var data={};new FormData(f).forEach(function(v,key){v=String(v).trim();if(key!=='website'&&v)data[key]=v});
    data.page=location.href.split('#')[0];
    data.subject=(f.getAttribute('data-subject')||'Quote request')+(data.name?' from '+data.name:'');
    return data;
  }
  function body(data){return ORDER.filter(function(p){return data[p[0]]}).map(function(p){return p[1]+': '+data[p[0]]}).join('\n')}
  function done(){
    sent=true;house();
    f.classList.add('sent');
    back.hidden=next.hidden=send.hidden=true;again.hidden=false;
    say('Thank you. We have your details and will call you within one business day.','ok');
    into();
  }
  function submit(){
    if(busy)return;
    if(cur<steps.length-1){if(validate(cur))go(cur+1);return}
    for(var i=0;i<steps.length;i++){if(!validate(i)){if(i!==cur){var m=status.textContent;go(i,true);setTimeout(function(){say(m)},reduce?0:500)}return}}
    var hp=f.querySelector('[data-hp] input');if(hp&&hp.value){done();return}
    var data=collect();
    if(!S.formEndpoint){
      location.href='mailto:'+(S.email||'')+'?subject='+encodeURIComponent(data.subject)+'&body='+encodeURIComponent(body(data));
      sent=true;house();
      say('Your email app should open with this card filled in. Press send there and we will call you within one business day.','info');
      return;
    }
    if(S.web3formsKey)data.access_key=S.web3formsKey;
    data.from_name='3M Construction website';
    send.disabled=true;say('Sending…','info');
    fetch(S.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)})
      .then(function(r){if(!r.ok)throw 0;return r.json().catch(function(){return {}})})
      .then(function(j){if(j&&j.success===false)throw 0;send.disabled=false;done()})
      .catch(function(){send.disabled=false;say('Sorry, that did not send. Please call or email us instead.')});
  }
  f.addEventListener('submit',function(e){e.preventDefault();submit()});
  again.addEventListener('click',function(){
    f.reset();$$('[aria-invalid]',f).forEach(function(el){el.removeAttribute('aria-invalid')});
    f.classList.remove('sent');again.hidden=true;say('');sum.hidden=true;
    sent=false;steps.forEach(function(s){s.classList.remove('on','enter','leave','back')});cur=0;paint();
    var h=steps[0].querySelector('h3');if(h)h.focus({preventScroll:true});
  });
})();
