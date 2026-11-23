/* НЕБО: комната с натяжным потолком, отрисованная в WebGL (трассировка лучей в коробке).
   new NeboRoom(canvas, {type, wall, color, spots, lines}) ; room.set({...}) */
(function(){
'use strict';
var TYPES=['matte','satin','gloss','color','stars','twolevel','lines','soaring','clouds','old'];

var VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
var FS=[
'precision highp float;',
'uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;',
'uniform float uA;uniform float uB;uniform float uMix;',
'uniform vec3 uWall;uniform vec3 uColor;uniform float uSpots;uniform float uLines;uniform float uLook;uniform float uSplit;',
'const float W=2.6;const float H=2.7;const float ZB=-3.6;const float ZF=3.2;',
'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
' return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}',
'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}',
/* ray vs axis box from outside */
'vec2 box(vec3 ro,vec3 rd,vec3 bmin,vec3 bmax){vec3 i=1./rd;vec3 t0=(bmin-ro)*i,t1=(bmax-ro)*i;',
' vec3 tn=min(t0,t1),tf=max(t0,t1);return vec2(max(max(tn.x,tn.y),tn.z),min(min(tf.x,tf.y),tf.z));}',
/* trace: returns t, writes normal & id. id: 0 ceil,1 floor,2 wallL,3 wallR,4 back,5 front,6 sofa */
'float trace(vec3 ro,vec3 rd,out vec3 n,out float id){rd=sign(rd)*max(abs(rd),vec3(1e-4))+vec3(step(abs(rd),vec3(0.)))*1e-4;',
' float tx=((rd.x>0.?W:-W)-ro.x)/rd.x;float ty=((rd.y>0.?H:0.)-ro.y)/rd.y;float tz=((rd.z>0.?ZF:ZB)-ro.z)/rd.z;',
' float t=tx;n=vec3(rd.x>0.?-1.:1.,0,0);id=rd.x>0.?3.:2.;',
' if(ty<t){t=ty;n=vec3(0,rd.y>0.?-1.:1.,0);id=rd.y>0.?0.:1.;}',
' if(tz<t){t=tz;n=vec3(0,0,rd.z>0.?-1.:1.);id=rd.z>0.?5.:4.;}',
' vec3 bmin=vec3(-1.5,0.,-3.6),bmax=vec3(1.5,.46,-2.62);vec2 b=box(ro,rd,bmin,bmax);',
' if(b.x>0.&&b.x<b.y&&b.x<t){t=b.x;vec3 p=ro+rd*t;vec3 c=(bmin+bmax)*.5,e=(bmax-bmin)*.5;vec3 d=(p-c)/e;vec3 a=abs(d);n=a.x>a.y&&a.x>a.z?vec3(sign(d.x),0,0):a.y>a.z?vec3(0,sign(d.y),0):vec3(0,0,sign(d.z));id=6.;}',
' bmin=vec3(-1.5,0.,-3.6);bmax=vec3(1.5,.92,-3.28);b=box(ro,rd,bmin,bmax);',
' if(b.x>0.&&b.x<b.y&&b.x<t){t=b.x;vec3 p=ro+rd*t;vec3 c=(bmin+bmax)*.5,e=(bmax-bmin)*.5;vec3 d=(p-c)/e;vec3 a=abs(d);n=a.x>a.y&&a.x>a.z?vec3(sign(d.x),0,0):a.y>a.z?vec3(0,sign(d.y),0):vec3(0,0,sign(d.z));id=6.;}',
' return t;}',
/* segment light */
'vec3 seg(vec3 p,vec3 n,vec3 a,vec3 b,vec3 col,float k){vec3 ab=b-a;float h=clamp(dot(p-a,ab)/dot(ab,ab),0.,1.);vec3 l=a+ab*h-p;float d=length(l);',
' return col*max(dot(n,l/d),0.)/(1.+d*d*k);}',
'vec3 pt(vec3 p,vec3 n,vec3 lp,vec3 col,float k){vec3 l=lp-p;float d=length(l);return col*max(dot(n,l/d),0.)/(1.+d*d*k);}',
'vec2 spotPos(int i){float r=floor(float(i)/2.);return vec2(mod(float(i),2.)<.5?-1.25:1.25,-2.9+r*1.45);}',
'bool night(float ty){return ty>3.5&&ty<7.5;}',
/* light arriving at a surface point */
'vec3 lighting(vec3 p,vec3 n,float ty){',
' bool nt=night(ty);vec3 L=vec3(0.);',
' vec3 wc=nt?vec3(.10,.13,.28)*.6:vec3(1.,.96,.9)*2.6;',
' L+=pt(p,n,vec3(-2.35,1.55,-1.9),wc,.22);',
' L+=nt?vec3(.025,.03,.05):vec3(.20,.19,.18);',
' if(ty<3.5||ty>7.5&&ty<8.5||ty>4.5&&ty<5.5){for(int i=0;i<12;i++){if(float(i)>=uSpots)break;vec2 s=spotPos(i);L+=pt(p,n,vec3(s.x,H-.12,s.y),vec3(1.,.86,.68)*(nt?.95:.55),.9);}}',
' if(ty>8.5){L+=pt(p,n,vec3(0.,H-.35,-.9),vec3(1.,.82,.55)*1.1,.8)-vec3(.05);}',
' if(ty>3.5&&ty<4.5){L+=pt(p,n,vec3(1.95,1.35,-3.1),vec3(1.,.7,.42)*.9,1.2);L+=vec3(.03,.035,.07);}',
' if(ty>5.5&&ty<6.5){float nl=max(uLines,1.);for(int i=0;i<5;i++){if(float(i)>=nl)break;float x=(float(i)-(nl-1.)*.5)*1.05;L+=seg(p,n,vec3(x,H-.03,-3.4),vec3(x,H-.03,2.6),vec3(.95,.97,1.)*1.15,1.3);}}',
' if(ty>4.5&&ty<5.5){vec3 c=uColor*1.4;float y=H-.2;L+=seg(p,n,vec3(-1.7,y,-2.9),vec3(1.7,y,-2.9),c,1.6)+seg(p,n,vec3(-1.7,y,1.),vec3(1.7,y,1.),c,1.6)+seg(p,n,vec3(-1.7,y,-2.9),vec3(-1.7,y,1.),c,1.6)+seg(p,n,vec3(1.7,y,-2.9),vec3(1.7,y,1.),c,1.6);}',
' if(ty>6.5&&ty<7.5){vec3 c=vec3(1.,.83,.6)*1.5;float y=H-.04;L+=seg(p,n,vec3(-W+.02,y,ZB+.02),vec3(W-.02,y,ZB+.02),c,1.4)+seg(p,n,vec3(-W+.02,y,ZB),vec3(-W+.02,y,ZF),c,1.4)+seg(p,n,vec3(W-.02,y,ZB),vec3(W-.02,y,ZF),c,1.4);}',
' return L;}',
/* corner occlusion */
'float ao(vec3 p,vec3 n){float d=9.;',
' if(abs(n.x)<.5)d=min(d,W-abs(p.x));if(abs(n.y)<.5)d=min(d,min(p.y,H-p.y));if(abs(n.z)<.5)d=min(d,p.z-ZB);',
' return 1.-.55*exp(-d*3.2);}',
/* ceiling colour (albedo, emissive) */
'vec3 ceil(vec3 p,float ty,out vec3 em,out float refl){em=vec3(0.);refl=0.;vec3 a=vec3(.93,.925,.91);',
' if(ty<.5){a=vec3(.92,.915,.9);}',
' else if(ty<1.5){a=vec3(.96,.95,.93);refl=.10;}',
' else if(ty<2.5){a=vec3(.96,.96,.97);refl=.42;}',
' else if(ty<3.5){a=uColor;refl=.36;}',
' else if(ty<4.5){vec2 q=p.xz;a=vec3(.012,.014,.035);',
'  float neb=fbm(q*.45+vec2(uTime*.01,0.));em+=mix(vec3(.05,.02,.12),vec3(.02,.06,.16),noise(q*.3))*neb*neb*1.6;',
'  for(int k=0;k<2;k++){vec2 g=q*(k==0?7.:13.)+float(k)*31.;vec2 id=floor(g);vec2 f=fract(g)-.5;float h=hash(id);',
'   if(h>(k==0?.86:.8)){vec2 o=vec2(hash(id+3.1),hash(id+7.7))-.5;float d=length(f-o*.6);float tw=.55+.45*sin(uTime*(1.5+h*3.)+h*40.);',
'    em+=vec3(.9,.95,1.)*smoothstep(.07,0.,d)*tw*(k==0?2.6:1.2);em+=vec3(.6,.7,1.)*exp(-d*22.)*tw*(k==0?.5:.15);}}',
'  float ss=fract(uTime*.09);vec2 sp=vec2(-2.+ss*5.,-3.+ss*3.);vec2 dir=normalize(vec2(5.,3.));vec2 rel=q-sp;float al=dot(rel,dir);float pr=length(rel-dir*al);',
'  em+=vec3(1.)*smoothstep(.02,0.,pr)*smoothstep(-.9,0.,al)*step(al,0.)*smoothstep(.0,.15,ss)*smoothstep(.45,.3,ss)*1.6;}',
' else if(ty<5.5){vec2 q=p.xz;vec2 dd=abs(q-vec2(0.,-.95))-vec2(1.62,1.88);float inner=max(dd.x,dd.y);',
'  if(inner<0.){a=mix(vec3(.95),uColor,.45);refl=.3;em+=uColor*exp(inner*9.)*1.1;}else{a=vec3(.95);em+=uColor*exp(-inner*14.)*.35;}',
'  em+=uColor*smoothstep(.025,0.,abs(inner))*2.;}',
' else if(ty<6.5){a=vec3(.9,.9,.9);float nl=max(uLines,1.);for(int i=0;i<5;i++){if(float(i)>=nl)break;float x=(float(i)-(nl-1.)*.5)*1.05;float d=abs(p.x-x);',
'  em+=vec3(1.)*smoothstep(.035,.02,d)*2.4+vec3(.8,.85,1.)*exp(-d*30.)*.5;}}',
' else if(ty<7.5){a=vec3(.93);float d=min(W-abs(p.x),p.z-ZB);em+=vec3(1.,.85,.62)*(smoothstep(.03,.0,d)*2.+exp(-d*14.)*.25);}',
' else if(ty<8.5){vec2 q=p.xz*.42+vec2(uTime*.02,0.);float c=fbm(q*1.6);c=smoothstep(.42,.85,c);',
'  a=mix(vec3(.32,.58,.93),vec3(.62,.8,.98),clamp((p.z+3.6)/6.,0.,1.));a=mix(a,vec3(1.),c);}',
' else{vec2 q=p.xz;a=vec3(.80,.76,.68)*(.85+.2*fbm(q*3.));float st=fbm(q*.8+4.);a*=1.-smoothstep(.55,.8,st)*.35*vec3(.8,1.,1.25);  float cr=abs(fbm(q*.9+9.)-.5);a*=1.-smoothstep(.012,.0,cr)*.75*smoothstep(.35,.6,fbm(q*.5+1.));  float bl=length(q-vec2(0.,-.9));em+=vec3(1.,.8,.5)*(smoothstep(.09,.07,bl)*2.5);}',
' if(ty<3.5||ty>7.5&&ty<8.5||ty>4.5&&ty<5.5){for(int i=0;i<12;i++){if(float(i)>=uSpots)break;vec2 s=spotPos(i);float d=length(p.xz-s);',
'  em+=vec3(1.,.93,.8)*(smoothstep(.075,.06,d)*3.+exp(-d*9.)*(night(ty)?.35:.08));}}',
' return a;}',
/* surface shade without reflection */
'vec3 surf(vec3 p,vec3 n,float id,float ty,out float refl){refl=0.;vec3 em=vec3(0.);vec3 a;',
' if(id<.5){a=ceil(p,ty,em,refl);}',
' else if(id<1.5){float pl=floor(p.x*3.2);float h=hash(vec2(pl,floor(p.z*.7+hash(vec2(pl))*3.)));',
'  a=vec3(.42,.28,.18)*(.78+.32*h)*(.9+.1*noise(p.xz*vec2(2.,30.)));',
'  vec2 r=abs(p.xz-vec2(0.,-1.55))-vec2(1.9,1.15);if(max(r.x,r.y)<0.)a=vec3(.70,.67,.62)*(.92+.08*noise(p.xz*40.));',
'  vec2 sb=abs(p.xz-vec2(0.,-3.1))-vec2(1.5,.5);float sd=length(max(sb,0.));a*=1.-.55*exp(-sd*7.);refl=.05;}',
' else if(id<5.5){a=uWall;',
'  if(id>1.5&&id<2.5&&p.z>-2.85&&p.z<-.95&&p.y>.85&&p.y<2.25){bool f=abs(p.z+1.9)<.03||abs(p.y-1.55)<.03||p.z<-2.8||p.z>-1.0||p.y<.9||p.y>2.2;',
'   if(f)a=vec3(.9);else{em=night(ty)?mix(vec3(.02,.03,.09),vec3(.06,.07,.2),(p.y-.85)/1.4):mix(vec3(1.4,1.35,1.25),vec3(.9,1.15,1.6),(p.y-.85)/1.4)*1.3;a=vec3(0.);}}',
'  if(id>3.5&&id<4.5&&abs(p.x)<.62&&p.y>1.22&&p.y<1.95){a=abs(p.x)>.58||p.y<1.26||p.y>1.91?vec3(.08):mix(vec3(.85,.42,.24),vec3(.95,.86,.72),smoothstep(.0,.05,p.y-1.5-.15*sin(p.x*5.)));}',
'  if(ty>6.5&&ty<7.5)em+=vec3(1.,.83,.6)*exp(-(H-p.y)*4.)*.5*a;}',
' else{a=vec3(.16,.17,.2)*(.9+.1*noise(p.xy*60.));}',
' vec3 c=a*lighting(p,n,ty)*ao(p,n)+em;',
' return c;}',
'vec3 scene(vec3 ro,vec3 rd,float ty){vec3 n;float id;float t=trace(ro,rd,n,id);vec3 p=ro+rd*t;float refl;',
' vec3 c=surf(p,n,id,ty,refl);',
' if(refl>0.){vec3 rr=reflect(rd,n);vec3 n2;float id2;float t2=trace(p+n*.002,rr,n2,id2);vec3 p2=p+rr*t2;float r2;vec3 c2=surf(p2,n2,id2,ty,r2);',
'  float fr=refl+(1.-refl)*pow(1.-max(dot(-rd,n),0.),5.)*.6;c=mix(c,c2,clamp(fr,0.,.85))*(1.+refl*.15);}',
' return c;}',
'void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;',
' vec3 ro=vec3(uMouse.x*.25,1.32,2.55);',
' float yaw=uMouse.x*.12,pit=.27+uLook+uMouse.y*.05;',
' vec3 f=normalize(vec3(sin(yaw),sin(pit),-cos(yaw)*cos(pit)));vec3 r=normalize(cross(f,vec3(0,1,0)));vec3 u=cross(r,f);',
' float fov=uRes.x/uRes.y<1.?1.25:.95;vec3 rd=normalize(f*1.+(uv.x*r+uv.y*u)*fov);',
' vec3 c;if(uSplit>=0.){float sx=gl_FragCoord.x/uRes.x;c=scene(ro,rd,sx<uSplit?9.:uA);}else{c=scene(ro,rd,uA);if(uMix>.001)c=mix(c,scene(ro,rd,uB),uMix);}',
' c*=1.05;c=clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);c=pow(c,vec3(.4545));',
' c+=(hash(gl_FragCoord.xy+fract(uTime))-.5)/255.;',
' float v=length((gl_FragCoord.xy/uRes)-.5);c*=1.-.25*v*v;',
' gl_FragColor=vec4(c,1.);}'
].join('\n');

function hex(h){h=(h||'#e8dccb').replace('#','');var n=parseInt(h,16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255].map(function(v){return Math.pow(v,2.2)})}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}

function NeboRoom(cv,o){
  o=o||{};this.cv=cv;var gl=cv.getContext('webgl',{antialias:false,alpha:false,preserveDrawingBuffer:!!o.keep});
  if(!gl){cv.classList.add('nogl');this.ok=false;return}
  this.ok=true;this.gl=gl;
  function sh(t,s){var x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(x));return x}
  var pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
  var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var U={};['uRes','uTime','uMouse','uA','uB','uMix','uWall','uColor','uSpots','uLines','uLook','uSplit'].forEach(function(k){U[k]=gl.getUniformLocation(pr,k)});
  this.U=U;
  this.s={a:TYPES.indexOf(o.type||'gloss'),b:0,mix:0,t0:0,wall:hex(o.wall),color:hex(o.color||'#d9a05b'),spots:o.spots==null?4:o.spots,lines:o.lines==null?3:o.lines,look:0,split:o.split==null?-1:o.split};
  this.m=[0,0];this.mt=[0,0];this.q=(o.quality||1)*(window.NEBO_Q||1);this.vis=true;this.start=performance.now();
  var self=this;
  if(!o.still){addEventListener('pointermove',function(e){self.mt=[e.clientX/innerWidth*2-1,-(e.clientY/innerHeight*2-1)]},{passive:true});}
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){self.vis=es[0].isIntersecting;if(self.vis)self.loop()}).observe(cv);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)self.loop()});
  this.reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.still=!!o.still;
  this.loop();
}
NeboRoom.TYPES=TYPES;
NeboRoom.prototype.set=function(o){var s=this.s;
  if(o.type!=null){var i=TYPES.indexOf(o.type);if(i>-1){var cur=s.mix>.5?s.b:s.a;if(i!==cur){if(s.mix>0&&s.mix<1){s.a=cur}s.b=i;s.mix=0;s.t0=performance.now();s.anim=true}}}
  if(o.wall)s.wall=hex(o.wall);if(o.color)s.color=hex(o.color);
  if(o.spots!=null)s.spots=o.spots;if(o.lines!=null)s.lines=o.lines;if(o.look!=null)s.look=o.look;if(o.split!=null)s.split=o.split;
  this.loop();};
NeboRoom.prototype.loop=function(){if(this.raf||!this.ok)return;var self=this;this.raf=requestAnimationFrame(function(){self.raf=0;self.frame()})};
NeboRoom.prototype.frame=function(){
  var gl=this.gl,cv=this.cv,s=this.s,U=this.U;
  var w=cv.clientWidth,h=cv.clientHeight;if(!w||!h){return}
  var dpr=Math.min(devicePixelRatio||1,1.5)*this.q*(w<700?.85:1);
  var W=Math.round(w*dpr),H=Math.round(h*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
  gl.viewport(0,0,W,H);
  this.m[0]+=(this.mt[0]-this.m[0])*.05;this.m[1]+=(this.mt[1]-this.m[1])*.05;
  if(s.anim){var k=Math.min(1,(performance.now()-s.t0)/(this.reduce?1:1100));s.mix=ease(k);if(k>=1){s.a=s.b;s.mix=0;s.anim=false}}
  var t=this.reduce||this.still?3.:(performance.now()-this.start)/1000;
  gl.uniform2f(U.uRes,W,H);gl.uniform1f(U.uTime,t);gl.uniform2f(U.uMouse,this.m[0],this.m[1]);
  gl.uniform1f(U.uA,s.a);gl.uniform1f(U.uB,s.b);gl.uniform1f(U.uMix,s.mix);
  gl.uniform3fv(U.uWall,s.wall);gl.uniform3fv(U.uColor,s.color);gl.uniform1f(U.uSpots,s.spots);gl.uniform1f(U.uLines,s.lines);gl.uniform1f(U.uLook,s.look);gl.uniform1f(U.uSplit,s.split);
  gl.drawArrays(gl.TRIANGLES,0,3);
  if(!this.vis||document.hidden)return;
  if(this.still&&!s.anim)return;
  if(this.reduce&&!s.anim)return;
  this.loop();
};
window.NeboRoom=NeboRoom;
})();
