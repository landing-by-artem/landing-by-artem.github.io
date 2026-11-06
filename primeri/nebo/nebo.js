/* НЕБО: рисует интерьеры с разными натяжными потолками на <canvas data-ceil="..."> */
(function(){
'use strict';

var TYPES={
  matte:   {name:'Матовый',            price:490},
  satin:   {name:'Сатиновый',          price:550},
  gloss:   {name:'Глянцевый',          price:590},
  color:   {name:'Цветной глянец',     price:690},
  stars:   {name:'Звёздное небо',      price:2900},
  twolevel:{name:'Двухуровневый',      price:1900},
  lines:   {name:'Световые линии',     price:1400},
  soaring: {name:'Парящий',            price:890},
  clouds:  {name:'Фотопечать «Облака»',price:1500}
};
window.NEBO_TYPES=TYPES;

function rng(seed){var a=seed>>>0||1;return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shade(hex,amt){var n=parseInt(hex.slice(1),16),r=(n>>16)+amt,g=(n>>8&255)+amt,b=(n&255)+amt;r=Math.max(0,Math.min(255,r));g=Math.max(0,Math.min(255,g));b=Math.max(0,Math.min(255,b));return 'rgb('+r+','+g+','+b+')'}
function lerp(a,b,t){return a+(b-a)*t}

function draw(cv){
  var box=cv.getBoundingClientRect(),w=Math.round(box.width),h=Math.round(box.height);
  if(!w||!h)return;
  var dpr=Math.min(window.devicePixelRatio||1,2);
  cv.width=w*dpr;cv.height=h*dpr;
  var c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);
  var type=cv.dataset.ceil||'matte',wall=cv.dataset.wall||'#E9DFD3',accent=cv.dataset.color||'#FF3D8B',r=rng(+(cv.dataset.seed||7));
  var night=(type==='stars'||type==='lines'||type==='twolevel'||cv.dataset.night==='1');
  var x0=w*.24,x1=w*.76,y0=h*.36,y1=h*.8;
  function P(u,v){var l=lerp(0,x0,v),rr=lerp(w,x1,v);return[lerp(l,rr,u),lerp(0,y0,v)]}
  function poly(pts){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath()}
  var dim=night?-70:0;

  /* walls */
  var g=c.createLinearGradient(0,0,x0,0);g.addColorStop(0,shade(wall,-40+dim));g.addColorStop(1,shade(wall,-12+dim));
  poly([[0,0],[x0,y0],[x0,y1],[0,h]]);c.fillStyle=g;c.fill();
  g=c.createLinearGradient(w,0,x1,0);g.addColorStop(0,shade(wall,-46+dim));g.addColorStop(1,shade(wall,-16+dim));
  poly([[w,0],[w,h],[x1,y1],[x1,y0]]);c.fillStyle=g;c.fill();
  g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(wall,4+dim));g.addColorStop(1,shade(wall,-8+dim));
  c.fillStyle=g;c.fillRect(x0,y0,x1-x0,y1-y0);

  /* window on back wall */
  var wx=x0+(x1-x0)*.56,wy=y0+(y1-y0)*.14,ww=(x1-x0)*.3,wh=(y1-y0)*.5;
  g=c.createLinearGradient(0,wy,0,wy+wh);
  if(night){g.addColorStop(0,'#1A1550');g.addColorStop(1,'#3B2C7A')}else{g.addColorStop(0,'#BFE4FF');g.addColorStop(1,'#FFF1D6')}
  c.fillStyle=g;c.fillRect(wx,wy,ww,wh);
  c.strokeStyle=shade(wall,30+dim);c.lineWidth=Math.max(2,w*.006);c.strokeRect(wx,wy,ww,wh);
  c.beginPath();c.moveTo(wx+ww/2,wy);c.lineTo(wx+ww/2,wy+wh);c.stroke();
  /* art on wall */
  c.fillStyle=night?'#FF3D8B':'#6C2BFF';c.fillRect(x0+(x1-x0)*.12,y0+(y1-y0)*.2,(x1-x0)*.2,(y1-y0)*.28);
  c.fillStyle=night?'#FFC531':'#FFC531';c.beginPath();c.arc(x0+(x1-x0)*.22,y0+(y1-y0)*.34,(x1-x0)*.05,0,7);c.fill();

  /* floor */
  g=c.createLinearGradient(0,y1,0,h);g.addColorStop(0,night?'#3A2617':'#B07A4F');g.addColorStop(1,night?'#22150C':'#7A4E2E');
  poly([[0,h],[x0,y1],[x1,y1],[w,h]]);c.fillStyle=g;c.fill();
  c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=1;
  for(var i=1;i<9;i++){var t=i/9;c.beginPath();c.moveTo(lerp(x0,x1,t),y1);c.lineTo(lerp(0,w,t),h);c.stroke()}

  /* sofa */
  var sx=x0+(x1-x0)*.08,sw=(x1-x0)*.46,sy=y1-(y1-y0)*.26;
  c.fillStyle=night?'#4B2E86':'#2B3BFF';
  c.beginPath();c.roundRect?c.roundRect(sx,sy,sw,(y1-sy)+h*.03,8):c.rect(sx,sy,sw,(y1-sy)+h*.03);c.fill();
  c.fillStyle=night?'#5D3AA3':'#4B59FF';c.fillRect(sx+sw*.06,sy+(y1-sy)*.45,sw*.88,(y1-sy)*.5);
  c.fillStyle='#FFC531';c.fillRect(sx+sw*.12,sy+(y1-sy)*.2,sw*.16,(y1-sy)*.32);
  /* plant */
  c.fillStyle='#2F8F5B';c.beginPath();c.ellipse(x1-(x1-x0)*.08,y1-(y1-y0)*.28,(x1-x0)*.05,(y1-y0)*.18,0,0,7);c.fill();
  c.fillStyle='#E25E3E';c.fillRect(x1-(x1-x0)*.12,y1-(y1-y0)*.12,(x1-x0)*.08,(y1-y0)*.12+h*.02);

  /* ceiling */
  var C=[[0,0],[w,0],[x1,y0],[x0,y0]];
  c.save();poly(C);c.clip();
  function base(top,bottom){var gg=c.createLinearGradient(0,0,0,y0);gg.addColorStop(0,top);gg.addColorStop(1,bottom);c.fillStyle=gg;c.fillRect(0,0,w,y0)}
  function spot(u,v,col){var p=P(u,v),s=(1-v*.6)*w*.012+2;var rg=c.createRadialGradient(p[0],p[1],0,p[0],p[1],s*5);rg.addColorStop(0,col||'rgba(255,240,200,.9)');rg.addColorStop(1,'rgba(255,240,200,0)');c.fillStyle=rg;c.fillRect(p[0]-s*5,p[1]-s*5,s*10,s*10);c.fillStyle='#fff';c.beginPath();c.ellipse(p[0],p[1],s,s*.45,0,0,7);c.fill()}
  function glowLine(pts,col,width){c.save();c.strokeStyle=col;c.lineWidth=width;c.lineCap='round';c.shadowColor=col;c.shadowBlur=width*6;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(var k=1;k<pts.length;k++)c.lineTo(pts[k][0],pts[k][1]);c.stroke();c.restore()}
  function reflection(alpha){c.save();c.globalAlpha=alpha;
    c.fillStyle=night?'#6C5BD0':'#DDEFFF';var a=P(.6,.55),b=P(.86,.55),d=P(.86,.92),e=P(.6,.92);poly([a,b,d,e]);c.fill();
    c.fillStyle=night?'#FF3D8B':'#B9A6FF';a=P(.14,.6);b=P(.34,.6);d=P(.34,.9);e=P(.14,.9);poly([a,b,d,e]);c.fill();
    c.restore();
    var sh=c.createLinearGradient(0,0,w,y0);sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(.45,'rgba(255,255,255,'+(alpha*.9)+')');sh.addColorStop(.55,'rgba(255,255,255,0)');c.fillStyle=sh;c.fillRect(0,0,w,y0)}
  function spots(){for(var a=0;a<3;a++)for(var b=0;b<3;b++)spot(.2+a*.3,.15+b*.32)}

  if(type==='matte'||type==='satin'||type==='soaring'){
    base(type==='satin'?'#FFFDF7':'#F6F3EE',type==='satin'?'#E9E4DA':'#E4E0D8');
    if(type==='satin'){var sg=c.createLinearGradient(0,0,w,y0);sg.addColorStop(.3,'rgba(255,255,255,0)');sg.addColorStop(.5,'rgba(255,255,255,.55)');sg.addColorStop(.7,'rgba(255,255,255,0)');c.fillStyle=sg;c.fillRect(0,0,w,y0)}
    if(type==='soaring'){glowLine([[0,0],[x0,y0],[x1,y0],[w,0]],'#FFE8B0',Math.max(2,w*.006));spots()}
    else{var cp=P(.5,.45);c.restore();c.save();
      c.strokeStyle='#333';c.lineWidth=1.5;c.beginPath();c.moveTo(cp[0],cp[1]);c.lineTo(cp[0],cp[1]+h*.12);c.stroke();
      var lg=c.createRadialGradient(cp[0],cp[1]+h*.15,0,cp[0],cp[1]+h*.15,w*.16);lg.addColorStop(0,'rgba(255,230,160,.55)');lg.addColorStop(1,'rgba(255,230,160,0)');c.fillStyle=lg;c.fillRect(0,0,w,h);
      c.fillStyle='#FFC531';c.beginPath();c.moveTo(cp[0]-w*.05,cp[1]+h*.17);c.lineTo(cp[0]+w*.05,cp[1]+h*.17);c.lineTo(cp[0]+w*.025,cp[1]+h*.12);c.lineTo(cp[0]-w*.025,cp[1]+h*.12);c.closePath();c.fill();
      c.restore();c.save();poly(C);c.clip()}
  }
  else if(type==='gloss'||type==='color'){
    if(type==='gloss')base('#FFFFFF','#DCD9E4');else base(shade(accent,10),shade(accent,-60));
    reflection(type==='gloss'?.35:.28);spots();
  }
  else if(type==='stars'){
    var sg2=c.createLinearGradient(0,0,0,y0);sg2.addColorStop(0,'#05031A');sg2.addColorStop(.6,'#1B0F4D');sg2.addColorStop(1,'#3A1A7A');c.fillStyle=sg2;c.fillRect(0,0,w,y0);
    var neb=c.createRadialGradient(w*.62,y0*.35,0,w*.62,y0*.35,w*.32);neb.addColorStop(0,'rgba(255,61,139,.35)');neb.addColorStop(1,'rgba(255,61,139,0)');c.fillStyle=neb;c.fillRect(0,0,w,y0);
    var n=Math.round(w*.9);for(var k=0;k<n;k++){var u=r(),v=Math.pow(r(),.8),p=P(u,v),s=r()*1.4*(1-v*.5)+.3;c.fillStyle='rgba(255,255,255,'+(.4+r()*.6)+')';c.beginPath();c.arc(p[0],p[1],s,0,7);c.fill();if(r()>.97){var gl=c.createRadialGradient(p[0],p[1],0,p[0],p[1],s*8);gl.addColorStop(0,'rgba(200,220,255,.8)');gl.addColorStop(1,'rgba(200,220,255,0)');c.fillStyle=gl;c.fillRect(p[0]-s*8,p[1]-s*8,s*16,s*16)}}
    var cs=P(.15,.2),ce=P(.35,.38);glowLine([cs,ce],'rgba(255,255,255,.8)',1.2);
  }
  else if(type==='twolevel'){
    base('#EDE9F4','#CFC8DC');
    var a=P(.18,.18),b=P(.82,.18),d=P(.82,.86),e=P(.18,.86);
    var ig=c.createLinearGradient(0,a[1],0,d[1]);ig.addColorStop(0,shade(accent,-30));ig.addColorStop(1,shade(accent,-80));poly([a,b,d,e]);c.fillStyle=ig;c.fill();
    reflection(.18);glowLine([a,b,d,e,a],'#7FE9FF',Math.max(2,w*.005));
    var e1=P(.1,.06),e2=P(.9,.06);spot(.1,.1);spot(.9,.1);spot(.1,.92);spot(.9,.92);
  }
  else if(type==='lines'){
    base('#2A2540','#3A3356');
    [.3,.5,.7].forEach(function(u){glowLine([P(u,0),P(u,1)],'#FFFFFF',Math.max(2,w*.005))});
    glowLine([P(0,.62),P(1,.62)],'#FFFFFF',Math.max(2,w*.005));
  }
  else if(type==='clouds'){
    base('#3E9BFF','#B5E2FF');
    for(var q=0;q<9;q++){var cu=r(),cv2=r()*.9,pp=P(cu,cv2),sc=(1-cv2*.6)*w*.06;
      for(var m=0;m<6;m++){var ox=(r()-.5)*sc*2.4,oy=(r()-.5)*sc*.6,rad=sc*(.5+r()*.6);var cg=c.createRadialGradient(pp[0]+ox,pp[1]+oy,0,pp[0]+ox,pp[1]+oy,rad);cg.addColorStop(0,'rgba(255,255,255,.95)');cg.addColorStop(.6,'rgba(255,255,255,.6)');cg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=cg;c.fillRect(pp[0]+ox-rad,pp[1]+oy-rad,rad*2,rad*2)}}
  }
  else if(type==='old'){
    base('#D9D2C3','#BDB4A3');
    c.strokeStyle='rgba(70,55,40,.55)';c.lineWidth=1.3;
    for(var z=0;z<6;z++){var st=P(r(),r()*.9),ang=r()*6.28;c.beginPath();c.moveTo(st[0],st[1]);for(var y=0;y<14;y++){ang+=(r()-.5)*.9;st=[st[0]+Math.cos(ang)*w*.018,st[1]+Math.sin(ang)*w*.009];c.lineTo(st[0],st[1]);if(r()>.85){var bx=st[0],by=st[1],ba2=ang+(r()-.5)*2;c.moveTo(bx,by);c.lineTo(bx+Math.cos(ba2)*w*.03,by+Math.sin(ba2)*w*.015);c.moveTo(st[0],st[1])}}c.stroke()}
    for(var z2=0;z2<4;z2++){var sp=P(r(),r()*.8),sr=w*(.03+r()*.05);var stg=c.createRadialGradient(sp[0],sp[1],0,sp[0],sp[1],sr);stg.addColorStop(0,'rgba(150,115,60,.45)');stg.addColorStop(.7,'rgba(150,115,60,.25)');stg.addColorStop(1,'rgba(150,115,60,0)');c.fillStyle=stg;c.fillRect(sp[0]-sr,sp[1]-sr,sr*2,sr*2)}
    var lp=P(.5,.45);c.restore();c.save();c.strokeStyle='#222';c.beginPath();c.moveTo(lp[0],lp[1]);c.lineTo(lp[0],lp[1]+h*.1);c.stroke();c.fillStyle='#FFF6C8';c.beginPath();c.arc(lp[0],lp[1]+h*.11,w*.012,0,7);c.fill();c.save();poly(C);c.clip();
  }
  c.restore();
  /* ceiling edge + wall glow */
  if(night||type==='soaring'){var wg=c.createLinearGradient(0,y0,0,y0+h*.12);wg.addColorStop(0,type==='lines'||type==='soaring'?'rgba(255,240,210,.25)':'rgba(127,233,255,.18)');wg.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=wg;c.fillRect(x0,y0,x1-x0,h*.12)}
  c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=1;poly(C);c.stroke();
}
window.NEBO_DRAW=draw;

var canvases=[].slice.call(document.querySelectorAll('canvas[data-ceil]'));
function all(){canvases.forEach(draw)}
if('ResizeObserver' in window){var ro=new ResizeObserver(function(es){es.forEach(function(e){draw(e.target)})});canvases.forEach(function(c){ro.observe(c)})}
else{window.addEventListener('resize',all)}
all();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(all);

/* before / after */
var ba=document.getElementById('ba');
if(ba){var inp=ba.querySelector('input'),clip=ba.querySelector('.after-clip'),bar=ba.querySelector('.bar'),knob=ba.querySelector('.knob');
  function set(v){clip.style.clipPath='inset(0 0 0 '+v+'%)';bar.style.left=v+'%';knob.style.left=v+'%'}
  inp.addEventListener('input',function(){set(inp.value)});set(inp.value)}

/* demo forms */
[].forEach.call(document.querySelectorAll('form[data-demo]'),function(f){
  f.addEventListener('submit',function(e){e.preventDefault();
    var err=f.querySelector('.err'),ok=f.querySelector('.ok'),name=f.querySelector('[name=name]'),ph=f.querySelector('[name=phone]');
    var m=name&&!name.value.trim()?'Укажите имя.':ph&&ph.value.replace(/\D/g,'').length<10?'Укажите номер телефона.':'';
    err.hidden=!m;err.textContent=m;ok.hidden=!!m;
    if(!m)ok.textContent=(name?name.value.trim()+', спасибо! ':'Спасибо! ')+'Замерщик позвонит в течение 15 минут. (Демо: заявка никуда не отправлена.)';
  })});
})();
