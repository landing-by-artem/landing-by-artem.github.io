/* НЕБО: комната с натяжным потолком в WebGL.
   Каждый вид потолка собирается в свою небольшую программу (так шейдер лёгкий для любой видеокарты).
   new NeboRoom(canvas, {type, wall, color, spots, lines, split, still}) ; room.set({...})
   Если WebGL недоступен, показывается готовая картинка img/room-<type>.jpg */
(function(){
'use strict';
var TYPES=['matte','satin','gloss','color','stars','twolevel','lines','soaring','clouds','old'];
var BASE=(function(){var s=document.currentScript&&document.currentScript.src;return s?s.replace(/[^\/]*$/,''):''})();

var VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
var COMMON=[
'precision highp float;',
'uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;',
'uniform vec3 uWall;uniform vec3 uColor;uniform float uSpots;uniform float uLines;uniform float uSplit;',
'const float W=2.6;const float H=2.7;const float ZB=-3.6;const float ZF=3.2;',
'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
' return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}',
'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}',
'vec3 gEm;float gRefl;',
'float hitBox(vec3 ro,vec3 rd,vec3 bmin,vec3 bmax){vec3 i=1./rd;vec3 t0=(bmin-ro)*i,t1=(bmax-ro)*i;vec3 tn=min(t0,t1),tf=max(t0,t1);',
' float a=max(max(tn.x,tn.y),tn.z),b=min(min(tf.x,tf.y),tf.z);return (a>0.&&a<b)?a:1e9;}',
/* returns (t,id). id: 0 ceil,1 floor,2 wallL,3 wallR,4 back,5 front,6 seat,7 backrest */
'vec2 trace(vec3 ro,vec3 rd){rd=sign(rd)*max(abs(rd),vec3(1e-4));',
' float tx=((rd.x>0.?W:-W)-ro.x)/rd.x;float ty=((rd.y>0.?H:0.)-ro.y)/rd.y;float tz=((rd.z>0.?ZF:ZB)-ro.z)/rd.z;',
' float t=tx;float id=rd.x>0.?3.:2.;',
' if(ty<t){t=ty;id=rd.y>0.?0.:1.;}',
' if(tz<t){t=tz;id=rd.z>0.?5.:4.;}',
' float s1=hitBox(ro,rd,vec3(-1.5,0.,-3.6),vec3(1.5,.46,-2.62));if(s1<t){t=s1;id=6.;}',
' float s2=hitBox(ro,rd,vec3(-1.5,0.,-3.6),vec3(1.5,.92,-3.28));if(s2<t){t=s2;id=7.;}',
' return vec2(t,id);}',
'vec3 nrm(vec3 p,float id){',
' if(id<.5)return vec3(0.,-1.,0.);if(id<1.5)return vec3(0.,1.,0.);if(id<2.5)return vec3(1.,0.,0.);if(id<3.5)return vec3(-1.,0.,0.);if(id<4.5)return vec3(0.,0.,1.);if(id<5.5)return vec3(0.,0.,-1.);',
' vec3 c=id<6.5?vec3(0.,.23,-3.11):vec3(0.,.46,-3.44);vec3 e=id<6.5?vec3(1.5,.23,.49):vec3(1.5,.46,.16);vec3 d=(p-c)/e;vec3 a=abs(d);',
' if(a.x>a.y&&a.x>a.z)return vec3(sign(d.x),0.,0.);if(a.y>a.z)return vec3(0.,sign(d.y),0.);return vec3(0.,0.,sign(d.z));}',
'vec3 seg(vec3 p,vec3 n,vec3 a,vec3 b,vec3 col,float k){vec3 ab=b-a;float h=clamp(dot(p-a,ab)/dot(ab,ab),0.,1.);vec3 l=a+ab*h-p;float d=length(l);',
' return col*max(dot(n,l/d),0.)/(1.+d*d*k);}',
'vec3 pt(vec3 p,vec3 n,vec3 lp,vec3 col,float k){vec3 l=lp-p;float d=length(l);return col*max(dot(n,l/d),0.)/(1.+d*d*k);}',
'vec2 spotPos(float i){float r=floor(i/2.);return vec2(mod(i,2.)<.5?-1.25:1.25,-2.9+r*1.45);}',
'float ao(vec3 p,vec3 n){float d=9.;',
' if(abs(n.x)<.5)d=min(d,W-abs(p.x));if(abs(n.y)<.5)d=min(d,min(p.y,H-p.y));if(abs(n.z)<.5)d=min(d,p.z-ZB);',
' return 1.-.55*exp(-d*3.2);}',
/* albedo + emissive of walls/floor/sofa */
'vec3 room(vec3 p,vec3 n,float id){gEm=vec3(0.);vec3 a;',
' if(id<1.5){float pl=floor(p.x*3.2);float h=hash(vec2(pl,floor(p.z*.7+hash(vec2(pl))*3.)));',
'  a=vec3(.42,.28,.18)*(.78+.32*h)*(.9+.1*noise(p.xz*vec2(2.,30.)));',
'  vec2 r=abs(p.xz-vec2(0.,-1.55))-vec2(1.9,1.15);if(max(r.x,r.y)<0.)a=vec3(.70,.67,.62);',
'  vec2 sb=abs(p.xz-vec2(0.,-3.1))-vec2(1.5,.5);float sd=length(max(sb,0.));a*=1.-.55*exp(-sd*7.);}',
' else if(id<5.5){a=uWall;',
'  if(id<2.5&&p.z>-2.85&&p.z<-.95&&p.y>.85&&p.y<2.25){bool f=abs(p.z+1.9)<.03||abs(p.y-1.55)<.03||p.z<-2.8||p.z>-1.0||p.y<.9||p.y>2.2;',
'   if(f)a=vec3(.9);else{gEm=NIGHT?mix(vec3(.02,.03,.09),vec3(.06,.07,.2),(p.y-.85)/1.4):mix(vec3(1.4,1.35,1.25),vec3(.9,1.15,1.6),(p.y-.85)/1.4)*1.3;a=vec3(0.);}}',
'  if(id>3.5&&id<4.5&&abs(p.x)<.62&&p.y>1.22&&p.y<1.95){a=abs(p.x)>.58||p.y<1.26||p.y>1.91?vec3(.08):mix(vec3(.85,.42,.24),vec3(.95,.86,.72),step(1.65+.15*sin(p.x*5.),p.y));}}',
' else{a=vec3(.16,.17,.2);}',
' return a;}',
/* cheap light: window + ambient (used for reflections) */
'vec3 base(vec3 p,vec3 n){vec3 wc=NIGHT?vec3(.06,.08,.17):vec3(2.6,2.5,2.34);return pt(p,n,vec3(-2.35,1.55,-1.9),wc,.22)+(NIGHT?vec3(.03,.035,.06):vec3(.2,.19,.18));}'
].join('\n');

/* per type: NIGHT, ceiling function and extra lights */
var T={};
var SPOTS_L='for(int i=0;i<8;i++){float fi=float(i);vec2 s=spotPos(fi);L+=step(fi+.5,uSpots)*pt(p,n,vec3(s.x,H-.12,s.y),SPOTC,.9);}';
var SPOTS_E='for(int i=0;i<8;i++){float fi=float(i);float d=length(p.xz-spotPos(fi));em+=step(fi+.5,uSpots)*vec3(1.,.93,.8)*(smoothstep(.075,.06,d)*3.+exp(-d*9.)*SPOTG);}';
function day(ceil,refl){return {night:false,spots:true,ceil:ceil,refl:refl,extra:''}}
T.matte=day('a=vec3(.92,.915,.9);','0.');
T.satin=day('a=vec3(.96,.95,.93);','.10');
T.gloss=day('a=vec3(.96,.96,.97);','.42');
T.color=day('a=uColor;','.36');
T.clouds=day('vec2 q=p.xz*.42+vec2(uTime*.02,0.);float c=smoothstep(.42,.85,fbm(q*1.6));a=mix(vec3(.32,.58,.93),vec3(.62,.8,.98),clamp((p.z+3.6)/6.,0.,1.));a=mix(a,vec3(1.),c);','0.');
T.stars={night:true,spots:false,refl:'0.',extra:'L+=pt(p,n,vec3(1.95,1.35,-3.1),vec3(1.,.7,.42)*.9,1.2)+vec3(.03,.035,.07);',
 ceil:'vec2 q=p.xz;a=vec3(.012,.014,.035);float neb=fbm(q*.45+vec2(uTime*.01,0.));em+=mix(vec3(.05,.02,.12),vec3(.02,.06,.16),noise(q*.3))*neb*neb*1.6;'+
 'for(int k=0;k<2;k++){float fk=float(k);vec2 g=q*(7.+6.*fk)+fk*31.;vec2 id=floor(g);vec2 f=fract(g)-.5;float h=hash(id);'+
 'if(h>.86-fk*.06){vec2 o=vec2(hash(id+3.1),hash(id+7.7))-.5;float d=length(f-o*.6);float tw=.55+.45*sin(uTime*(1.5+h*3.)+h*40.);'+
 'em+=vec3(.9,.95,1.)*smoothstep(.07,0.,d)*tw*(2.6-1.4*fk)+vec3(.6,.7,1.)*exp(-d*22.)*tw*(.5-.35*fk);}}'+
 'float ss=fract(uTime*.09);vec2 sp=vec2(-2.+ss*5.,-3.+ss*3.);vec2 dir=vec2(.857,.514);vec2 rel=q-sp;float al=dot(rel,dir);float pr=length(rel-dir*al);'+
 'em+=vec3(1.)*smoothstep(.02,0.,pr)*smoothstep(-.9,0.,al)*step(al,0.)*smoothstep(.0,.15,ss)*smoothstep(.45,.3,ss)*1.6;'};
T.twolevel={night:true,spots:true,refl:'refl',extra:'vec3 c=uColor*1.4;float y=H-.2;L+=seg(p,n,vec3(-1.7,y,-2.9),vec3(1.7,y,-2.9),c,1.6)+seg(p,n,vec3(-1.7,y,1.),vec3(1.7,y,1.),c,1.6)+seg(p,n,vec3(-1.7,y,-2.9),vec3(-1.7,y,1.),c,1.6)+seg(p,n,vec3(1.7,y,-2.9),vec3(1.7,y,1.),c,1.6);',
 ceil:'vec2 dd=abs(p.xz-vec2(0.,-.95))-vec2(1.62,1.88);float inner=max(dd.x,dd.y);'+
 'if(inner<0.){a=mix(vec3(.95),uColor,.45);refl=.3;em+=uColor*exp(inner*9.)*1.1;}else{a=vec3(.95);em+=uColor*exp(-inner*14.)*.35;}em+=uColor*smoothstep(.025,0.,abs(inner))*2.;'};
T.lines={night:true,spots:false,refl:'0.',extra:'float nl=max(uLines,1.);for(int i=0;i<5;i++){float fi=float(i);float x=(fi-(nl-1.)*.5)*1.05;L+=step(fi+.5,nl)*seg(p,n,vec3(x,H-.03,-3.4),vec3(x,H-.03,2.6),vec3(.95,.97,1.)*1.15,1.3);}',
 ceil:'a=vec3(.9);float nl=max(uLines,1.);for(int i=0;i<5;i++){float fi=float(i);float d=abs(p.x-(fi-(nl-1.)*.5)*1.05);em+=step(fi+.5,nl)*(vec3(1.)*smoothstep(.035,.02,d)*2.4+vec3(.8,.85,1.)*exp(-d*30.)*.5);}'};
T.soaring={night:true,spots:false,refl:'0.',extra:'vec3 c=vec3(1.,.83,.6)*1.5;float y=H-.04;L+=seg(p,n,vec3(-W+.02,y,ZB+.02),vec3(W-.02,y,ZB+.02),c,1.4)+seg(p,n,vec3(-W+.02,y,ZB),vec3(-W+.02,y,ZF),c,1.4)+seg(p,n,vec3(W-.02,y,ZB),vec3(W-.02,y,ZF),c,1.4);',
 ceil:'a=vec3(.93);float d=min(W-abs(p.x),p.z-ZB);em+=vec3(1.,.85,.62)*(smoothstep(.03,.0,d)*2.+exp(-d*14.)*.25);',wallglow:true};
T.old={night:false,spots:false,refl:'0.',extra:'L+=pt(p,n,vec3(0.,H-.35,-.9),vec3(1.,.82,.55)*1.1,.8)-vec3(.05);',
 ceil:'vec2 q=p.xz;a=vec3(.80,.76,.68)*(.85+.2*fbm(q*3.));float st=fbm(q*.8+4.);a*=1.-smoothstep(.55,.8,st)*.35*vec3(.8,1.,1.25);'+
 'float cr=abs(fbm(q*.9+9.)-.5);a*=1.-smoothstep(.012,.0,cr)*.75*smoothstep(.35,.6,fbm(q*.5+1.));float bl=length(q-vec2(0.,-.9));em+=vec3(1.,.8,.5)*smoothstep(.09,.07,bl)*2.5;'};

function build(type,split){
  var t=T[type],o=T.old;var night=t.night?'true':'false';
  var s='#define NIGHTV '+night+'\n'+COMMON.replace(/NIGHT/g,'NIGHTV')+'\n#define em gEm\n#define refl gRefl\n';
  s+='vec3 lightT(vec3 p,vec3 n){vec3 L=base(p,n);'+(t.spots?SPOTS_L.replace('SPOTC',t.night?'vec3(.95,.82,.65)':'vec3(.55,.47,.37)'):'')+t.extra+'return L;}\n';
  s+='vec3 ceilT(vec3 p){gEm=vec3(0.);gRefl='+t.refl.replace('refl','0.')+';vec3 a=vec3(.93);'+t.ceil+(t.spots?SPOTS_E.replace('SPOTG',t.night?'.35':'.08'):'')+'return a;}\n';
  if(split){
    s+='vec3 lightO(vec3 p,vec3 n){vec3 L=base(p,n);'+o.extra+'return L;}\n';
    s+='vec3 ceilO(vec3 p){gEm=vec3(0.);gRefl=0.;vec3 a=vec3(.93);'+o.ceil+'return a;}\n';
  }
  s+='vec3 scene(vec3 ro,vec3 rd,bool useOld){vec2 h=trace(ro,rd);float id=h.y;vec3 p=ro+rd*h.x;vec3 n=nrm(p,id);vec3 a;vec3 L;gRefl=0.;\n';
  s+=' if(id<.5){'+(split?'if(useOld){a=ceilO(p);}else{a=ceilT(p);}':'a=ceilT(p);')+'}else{a=room(p,n,id);}\n';
  s+=' vec3 E=gEm;float R=gRefl;\n';
  s+=(split?' if(useOld)L=lightO(p,n);else L=lightT(p,n);\n':' L=lightT(p,n);\n');
  if(t.wallglow)s+=' if(id>1.5&&id<5.5)E+=vec3(1.,.83,.6)*exp(-(H-p.y)*4.)*.5*a;\n';
  s+=' vec3 c=a*L*ao(p,n)+E;\n';
  if(t.refl!=='0.'){
    s+=' if(R>0.){vec3 rr=reflect(rd,n);vec2 h2=trace(p+n*.002,rr);vec3 p2=p+rr*h2.x;vec3 n2=nrm(p2,h2.y);vec3 a2=room(p2,n2,h2.y);\n';
    s+='  vec3 c2=a2*base(p2,n2)*ao(p2,n2)+gEm;float fr=R+(1.-R)*pow(1.-max(dot(-rd,n),0.),5.)*.6;c=mix(c,c2,clamp(fr,0.,.85))*(1.+R*.15);}\n';
  }
  s+=' return c;}\n';
  s+='void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;vec3 ro=vec3(uMouse.x*.25,1.32,2.55);float yaw=uMouse.x*.12,pit=.27+uMouse.y*.05;\n';
  s+=' vec3 f=normalize(vec3(sin(yaw),sin(pit),-cos(yaw)*cos(pit)));vec3 r=normalize(cross(f,vec3(0,1,0)));vec3 u=cross(r,f);\n';
  s+=' float fov=uRes.x/uRes.y<1.?1.25:.95;vec3 rd=normalize(f+(uv.x*r+uv.y*u)*fov);\n';
  s+=' vec3 c=scene(ro,rd,'+(split?'gl_FragCoord.x/uRes.x<uSplit':'false')+');\n';
  s+=' c*=1.05;c=clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);c=pow(c,vec3(.4545));\n';
  s+=' float v=length((gl_FragCoord.xy/uRes)-.5);c*=1.-.25*v*v;gl_FragColor=vec4(c,1.);}\n';
  return s;
}

function glBad(){try{var v=+localStorage.getItem('gl-fail');return v&&Date.now()-v<864e5}catch(e){return false}}
function hex(h){h=(h||'#e8dccb').replace('#','');var n=parseInt(h,16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255].map(function(v){return Math.pow(v,2.2)})}

function NeboRoom(cv,o){
  o=o||{};var self=this;this.cv=cv;this.o=o;
  this.s={type:o.type||'gloss',wall:hex(o.wall),color:hex(o.color||'#9b2c4a'),spots:o.spots==null?4:o.spots,lines:o.lines==null?3:o.lines,split:o.split==null?-1:o.split};
  this.split=o.split!=null;
  this.box=cv.parentNode;
  /* overlay for cross-fades and fallback picture */
  var ov=this.ov=document.createElement('canvas');ov.setAttribute('aria-hidden','true');
  ov.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity .9s ease';
  if(getComputedStyle(this.box).position==='static')this.box.style.position='relative';
  cv.insertAdjacentElement('afterend',ov);
  this.poster();
  var gl=null;if(!glBad())try{gl=cv.getContext('webgl',{antialias:false,alpha:false,preserveDrawingBuffer:!!o.keep,powerPreference:'low-power'})}catch(e){}
  if(!gl){this.fail();return}
  this.gl=gl;this.ok=true;this.progs={};
  cv.addEventListener('webglcontextlost',function(e){e.preventDefault();self.fail()});
  var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  this.m=[0,0];this.mt=[0,0];this.vis=true;this.start=performance.now();this.last=0;this.dirty=true;
  this.q=(o.quality||1)*(window.NEBO_Q||1);
  this.reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!o.still&&!this.reduce)addEventListener('pointermove',function(e){self.mt=[e.clientX/innerWidth*2-1,-(e.clientY/innerHeight*2-1)];self.loop()},{passive:true});
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){self.vis=es[0].isIntersecting;if(self.vis){self.dirty=true;self.loop()}}).observe(cv);
  document.addEventListener('visibilitychange',function(){if(!document.hidden){self.dirty=true;self.loop()}});
  addEventListener('resize',function(){self.dirty=true;self.loop()});
  if(!this.prog(this.s.type)){this.fail();return}
  this.loop();
}
NeboRoom.TYPES=TYPES;
NeboRoom.prototype.poster=function(){var b=this.box;b.style.backgroundImage='url('+BASE+'img/room-'+(this.split?'split':this.s.type)+'.jpg)';b.style.backgroundSize='cover';b.style.backgroundPosition='center'};
NeboRoom.prototype.fail=function(){this.ok=false;this.ov.style.opacity='0';this.cv.style.visibility='hidden';this.cv.classList.add('nogl');this.poster()};
NeboRoom.prototype.prog=function(type){
  var key=type+(this.split?'+split':'');if(this.progs[key])return this.progs[key];
  var gl=this.gl;function sh(t,s){var x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS)&&!gl.isContextLost()){console.warn(gl.getShaderInfoLog(x));return null}return x}
  var v=sh(gl.VERTEX_SHADER,VS),f=sh(gl.FRAGMENT_SHADER,build(type,this.split));if(!v||!f)return null;
  var p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)&&!gl.isContextLost())return null;
  var U={};['uRes','uTime','uMouse','uWall','uColor','uSpots','uLines','uSplit'].forEach(function(k){U[k]=gl.getUniformLocation(p,k)});
  var a=gl.getAttribLocation(p,'p');
  return this.progs[key]={p:p,U:U,a:a};
};
NeboRoom.prototype.set=function(o){var s=this.s,prev=s.type;
  if(o.type&&o.type!==s.type&&T[o.type]){s.type=o.type;this.fade(prev)}
  if(o.wall)s.wall=hex(o.wall);if(o.color)s.color=hex(o.color);
  if(o.spots!=null)s.spots=Math.min(8,o.spots);if(o.lines!=null)s.lines=o.lines;if(o.split!=null)s.split=o.split;
  if(!this.ok){this.poster();return}
  this.dirty=true;this.loop();};
NeboRoom.prototype.fade=function(){
  var ov=this.ov,cv=this.cv;if(!this.ok)return;
  try{ov.width=cv.width;ov.height=cv.height;var c=ov.getContext('2d');this.draw();c.drawImage(cv,0,0)}catch(e){return}
  ov.style.transition='none';ov.style.opacity='1';void ov.offsetWidth;ov.style.transition='opacity .9s ease';
  var self=this;requestAnimationFrame(function(){self.draw();requestAnimationFrame(function(){ov.style.opacity='0'})});
};
NeboRoom.prototype.loop=function(){if(this.raf||!this.ok)return;var self=this;this.raf=requestAnimationFrame(function(){self.raf=0;self.frame()})};
NeboRoom.prototype.draw=function(){
  var gl=this.gl,cv=this.cv,s=this.s;var P=this.prog(s.type);if(!P){this.fail();return false}
  var w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return false;
  var scale=Math.min(devicePixelRatio||1,1.25)*this.q*(w>1100?.62:w>700?.72:.8);
  var W=Math.round(w*scale),H=Math.round(h*scale);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
  gl.viewport(0,0,W,H);gl.useProgram(P.p);gl.enableVertexAttribArray(P.a);gl.vertexAttribPointer(P.a,2,gl.FLOAT,false,0,0);
  var U=P.U,t=this.reduce||this.o.still?3:(performance.now()-this.start)/1000;
  gl.uniform2f(U.uRes,W,H);gl.uniform1f(U.uTime,t);gl.uniform2f(U.uMouse,this.m[0],this.m[1]);
  gl.uniform3fv(U.uWall,s.wall);gl.uniform3fv(U.uColor,s.color);gl.uniform1f(U.uSpots,s.spots);gl.uniform1f(U.uLines,s.lines);gl.uniform1f(U.uSplit,s.split);
  gl.drawArrays(gl.TRIANGLES,0,3);
  if(!this.shown){this.shown=true;var b=this.box,me=this;setTimeout(function(){if(me.ok&&!me.gl.isContextLost())b.style.backgroundImage='none'},1200)}
  return true;
};
NeboRoom.prototype.frame=function(){
  if(!this.ok||!this.vis||document.hidden)return;
  var now=performance.now();
  var dm=Math.abs(this.mt[0]-this.m[0])+Math.abs(this.mt[1]-this.m[1]);
  this.m[0]+=(this.mt[0]-this.m[0])*.08;this.m[1]+=(this.mt[1]-this.m[1])*.08;
  var animated=(this.s.type==='stars'||this.s.type==='clouds')&&!this.reduce&&!this.o.still;
  if(this.dirty||dm>.002||(animated&&now-this.last>33)){this.dirty=false;this.last=now;this.draw()}
  if(dm>.002||animated)this.loop();
};
window.NeboRoom=NeboRoom;
})();
