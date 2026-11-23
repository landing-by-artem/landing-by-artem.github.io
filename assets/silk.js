/* Лента из светящихся нитей на первом экране. new Silk(canvas) ; .set({scroll}) */
(function(){
'use strict';
var VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
var FS=[
'precision highp float;',
'uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uScroll;uniform float uNarrow;',
'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
'void main(){',
' vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;float px=1./uRes.y;',
' float t=uTime;float x=uv.x;',
' float ax=uRes.x/uRes.y;',
' vec2 m=uMouse*vec2(ax,1.)*.5;',
' float c=mix(x/ax*.5+.12,.26,uNarrow)+.06*sin(x*1.3+t*.35)+.035*sin(x*2.7-t*.22);',
' c+=(m.y-c)*.55*exp(-(x-m.x)*(x-m.x)*2.6);',
' c+=uScroll*.25;',
' float w=(.035+.2*(.5+.5*sin(x*1.05-t*.3)))*(1.+uScroll*1.6);',
' float tw=x*2.4+t*.4;',
' vec3 col=vec3(0.);',
' for(int i=0;i<34;i++){',
'  float fi=float(i);float ph=fi/34.*6.2832;',
'  float a=tw+ph;float y=c+w*cos(a)+.012*sin(x*9.+fi*1.7+t);',
'  float z=sin(a);',
'  float d=abs(uv.y-y);',
'  float th=px*(.7+.6*(z*.5+.5));',
'  float core=exp(-d*d/(th*th));',
'  float glow=exp(-d/(px*14.))*.06;',
'  float br=.25+.75*smoothstep(-1.,1.,z);',
'  vec3 tint=mod(fi,7.)<.5?vec3(1.,.18,.53):mix(vec3(.62,.64,.72),vec3(1.),z*.5+.5);',
'  col+=tint*(core+glow)*br;',
' }',
' float fade=smoothstep(-.05,.3,x/ax);',
' fade=mix(fade,1.,uNarrow*.5);',
' col*=fade*(1.-uScroll*.85);',
' col+=vec3(1.,.18,.53)*exp(-length(uv-vec2(.35*ax,c))*2.2)*.05*(1.-uScroll);',
' vec3 bg=vec3(.043,.043,.047);',
' vec3 o=bg+col;o=1.-exp(-o*1.15);o=pow(o,vec3(.95));',
' o+=(hash(gl_FragCoord.xy+fract(t))-.5)/255.;',
' gl_FragColor=vec4(o,1.);}'
].join('\n');
function Silk(cv){
  var gl=null;try{gl=cv.getContext('webgl',{antialias:false,alpha:false,powerPreference:'low-power'})}catch(e){}this.cv=cv;
  if(!gl){cv.classList.add('nogl');this.ok=false;return}this.ok=true;this.gl=gl;
  var me=this;cv.addEventListener('webglcontextlost',function(e){e.preventDefault();me.ok=false;cv.classList.add('nogl')});
  function sh(t,s){var x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(x));return x}
  var pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){cv.classList.add('nogl');this.ok=false;return}gl.useProgram(pr);
  var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var U=this.U={};['uRes','uTime','uMouse','uScroll','uNarrow'].forEach(function(k){U[k]=gl.getUniformLocation(pr,k)});
  this.m=[.45,.0];this.mt=[.45,.0];this.scroll=0;this.vis=true;this.start=performance.now();
  var s=this;
  addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();s.mt=[((e.clientX-r.left)/r.width)*2-1,-(((e.clientY-r.top)/r.height)*2-1)]},{passive:true});
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){s.vis=es[0].isIntersecting;if(s.vis)s.loop()}).observe(cv);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)s.loop()});
  this.reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.loop();
}
Silk.prototype.set=function(o){if(o.scroll!=null)this.scroll=o.scroll;if(this.reduce)this.loop()};
Silk.prototype.loop=function(){if(this.raf||!this.ok)return;var s=this;this.raf=requestAnimationFrame(function(){s.raf=0;s.frame()})};
Silk.prototype.frame=function(){
  if(!this.ok||!this.vis||document.hidden)return;var now=performance.now();if(now-(this.lt||0)<30){this.loop();return}this.lt=now;
  var gl=this.gl,cv=this.cv,U=this.U,w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
  var dpr=Math.min(devicePixelRatio||1,1.5)*(window.GLQ||1)*(w>1100?.75:1);
  var W=Math.round(w*dpr),H=Math.round(h*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
  gl.viewport(0,0,W,H);
  this.m[0]+=(this.mt[0]-this.m[0])*.05;this.m[1]+=(this.mt[1]-this.m[1])*.05;
  var t=this.reduce?6:(performance.now()-this.start)/1000;
  gl.uniform2f(U.uRes,W,H);gl.uniform1f(U.uTime,t);gl.uniform2f(U.uMouse,this.m[0],this.m[1]);gl.uniform1f(U.uScroll,this.scroll);gl.uniform1f(U.uNarrow,w<760?1:0);
  gl.drawArrays(gl.TRIANGLES,0,3);
  if(!this.vis||document.hidden||this.reduce)return;
  this.loop();
};
window.Silk=Silk;
})();
