/* ЗАРЯД: WebGL-эффекты. new ZCharge(canvas,{mode:'field'|'orb',charge:0..1}); .set({charge}) */
(function(){
'use strict';
var VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
var FS=[
'precision highp float;',
'uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uCharge;uniform float uMode;uniform float uScroll;',
'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}',
'float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}',
'vec3 volt(float x){return mix(vec3(.55,.75,.08),vec3(.85,1.,.25),clamp(x,0.,1.));}',
'vec3 field(vec2 uv){',
' float t=uTime*.09;vec2 p=uv*1.25;',
' vec2 m=uMouse*vec2(uRes.x/uRes.y,1.)*.5;vec2 dm=uv-m;float md=length(dm);',
' p-=dm*.45*exp(-md*md*5.);',
' vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t));',
' vec2 r=vec2(fbm(p+2.6*q+vec2(1.7,9.2)+t*1.3),fbm(p+2.6*q+vec2(8.3,2.8)-t));',
' float f=fbm(p+2.8*r);',
' float k=.6+.4*exp(-md*1.8)+uCharge*.4;',
' float a1=pow(1.-abs(f*2.-1.),70.*(1.3-k*.4));',
' float a2=pow(1.-abs(fbm(p*1.9+r*2.2-t*.6)*2.-1.),90.);',
' float glow=exp(-md*md*3.);',
' float e=a1*k*1.3+a2*.7*(.3+glow);',
' vec3 c=vec3(.018,.019,.016);',
' c+=volt(.2+f*.6)*e*1.6+vec3(1.,1.,.9)*pow(e,2.)*.7;',
' c+=volt(.2)*smoothstep(.45,.95,f)*.05;',
' c+=volt(.4)*glow*.05;',
' return c;}',
'vec3 orb(vec2 uv){',
' float t=uTime*.4;float ch=uCharge;float R=.26+.1*ch;float d=length(uv);vec3 c=vec3(0.);',
' vec3 col=mix(vec3(.35,.36,.33),vec3(.8,1.,.22),smoothstep(0.,.35,ch));',
' if(d<R){vec3 n=vec3(uv,sqrt(R*R-d*d))/R;',
'  float a=t*(.4+ch);mat2 rot=mat2(cos(a),-sin(a),sin(a),cos(a));vec3 nn=n;nn.xz=rot*nn.xz;',
'  float pl=fbm(nn.xy*3.+nn.z*2.+vec2(t*.7,-t*.4));float pl2=1.-abs(fbm(nn.yz*4.+pl*2.+t)*2.-1.);',
'  float vein=pow(pl2,mix(6.,14.,1.-ch));',
'  c=col*(.08+.55*pl*(.25+ch))+col*vein*(.4+1.6*ch)+vec3(1.)*pow(vein,3.)*ch*1.2;',
'  float fres=pow(1.-n.z,2.5);c+=col*fres*(.5+ch);',
'  c*=.55+.45*n.z+.2;}',
' float rim=exp(-max(d-R,0.)*(28.-14.*ch));c+=col*rim*(.25+.9*ch)*step(R,d);',
' vec2 dir=uv/max(d,1e-4);float rays=fbm(dir*2.+vec2(d*6.-t*2.));float arc=1.-abs(fbm(dir*1.6+vec2(t*.3,d*3.-t*1.5)+dir.yx*.7)*2.-1.);',
' c+=col*pow(arc,22.)*smoothstep(R+.35*ch+.05,R,d)*step(R,d)*(.3+1.8*ch);',
' c+=col*exp(-d*3.)*.12*ch*(.6+.4*rays);',
' return c;}',
'void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;vec3 c;',
' if(uMode<.5){c=field(uv);float v=length(gl_FragCoord.xy/uRes-.5);c*=1.-.6*v*v;c*=1.-uScroll*.6;}else c=orb(uv)+vec3(.0173);',
' c=1.-exp(-c*1.6);c=pow(c,vec3(.9));c+=(hash(gl_FragCoord.xy+fract(uTime))-.5)/255.;',
' gl_FragColor=vec4(c,1.);}'
].join('\n');

function ZCharge(cv,o){
  o=o||{};this.cv=cv;var gl=null;try{gl=cv.getContext('webgl',{antialias:false,alpha:false,preserveDrawingBuffer:!!o.keep,powerPreference:'low-power'})}catch(e){}
  if(!gl){(cv.style.visibility='hidden',cv.parentNode.classList.add('nogl'));this.ok=false;return}
  var me=this;cv.addEventListener('webglcontextlost',function(e){e.preventDefault();me.ok=false;(cv.style.visibility='hidden',cv.parentNode.classList.add('nogl'))});
  this.ok=true;this.gl=gl;
  function sh(t,s){var x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(x));return x}
  var pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){(cv.style.visibility='hidden',cv.parentNode.classList.add('nogl'));this.ok=false;return}gl.useProgram(pr);
  var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var U=this.U={};['uRes','uTime','uMouse','uCharge','uMode','uScroll'].forEach(function(k){U[k]=gl.getUniformLocation(pr,k)});
  this.mode=o.mode==='orb'?1:0;this.charge=o.charge||0;this.ct=this.charge;this.m=[.5,.2];this.mt=[.5,.2];this.vis=true;this.start=performance.now();this.scroll=0;
  this.q=(o.quality||1)*(window.GLQ||1);
  var self=this;
  addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();self.mt=[((e.clientX-r.left)/r.width)*2-1,-(((e.clientY-r.top)/r.height)*2-1)]},{passive:true});
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){self.vis=es[0].isIntersecting;if(self.vis)self.loop()}).observe(cv);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)self.loop()});
  this.reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.loop();
}
ZCharge.prototype.set=function(o){if(o.charge!=null)this.ct=o.charge;if(o.scroll!=null)this.scroll=o.scroll;this.loop()};
ZCharge.prototype.loop=function(){if(this.raf||!this.ok)return;var s=this;this.raf=requestAnimationFrame(function(){s.raf=0;s.frame()})};
ZCharge.prototype.frame=function(){
  if(!this.ok||!this.vis||document.hidden)return;var now=performance.now();if(now-(this.lt||0)<30){this.loop();return}this.lt=now;
  var gl=this.gl,cv=this.cv,U=this.U,w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
  var dpr=Math.min(devicePixelRatio||1,1.25)*this.q*(this.mode===0?(w>1100?.55:w>700?.65:.75):.8);
  var W=Math.round(w*dpr),H=Math.round(h*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
  gl.viewport(0,0,W,H);
  this.m[0]+=(this.mt[0]-this.m[0])*.04;this.m[1]+=(this.mt[1]-this.m[1])*.04;
  this.charge+=(this.ct-this.charge)*.06;
  var t=this.reduce?4:(performance.now()-this.start)/1000;
  gl.uniform2f(U.uRes,W,H);gl.uniform1f(U.uTime,t);gl.uniform2f(U.uMouse,this.m[0],this.m[1]);
  gl.uniform1f(U.uCharge,this.charge);gl.uniform1f(U.uMode,this.mode);gl.uniform1f(U.uScroll,this.scroll);
  gl.drawArrays(gl.TRIANGLES,0,3);
  if(!this.vis||document.hidden)return;
  if(this.reduce&&Math.abs(this.ct-this.charge)<.002)return;
  this.loop();
};
window.ZCharge=ZCharge;
})();
