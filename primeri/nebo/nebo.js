/* НЕБО: общие скрипты (шапка, меню, появление блоков, демо-формы) */
(function(){
'use strict';
window.NEBO_TYPES={
  matte:{name:'Матовый',price:490},satin:{name:'Сатиновый',price:550},gloss:{name:'Глянцевый',price:590},
  color:{name:'Цветной глянец',price:690},stars:{name:'Звёздное небо',price:2900},twolevel:{name:'Двухуровневый',price:1900},
  lines:{name:'Световые линии',price:1400},soaring:{name:'Парящий',price:890},clouds:{name:'Фотопечать «Облака»',price:1500}
};
var hdr=document.querySelector('.hdr');
var dark=document.querySelector('[data-dark-under-header]');
function onScroll(){
  if(!hdr||!dark)return;
  var r=dark.getBoundingClientRect();
  hdr.classList.toggle('over',r.bottom>72&&!hdr.classList.contains('open'));
}
if(dark){addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);addEventListener('load',onScroll);onScroll()}
var bg=document.querySelector('.burger');
if(bg)bg.addEventListener('click',function(){var o=hdr.classList.toggle('open');bg.setAttribute('aria-expanded',o);onScroll()});

var rv=[].slice.call(document.querySelectorAll('.rv'));
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
  rv.forEach(function(el){io.observe(el)});
}else rv.forEach(function(el){el.classList.add('in')});

[].forEach.call(document.querySelectorAll('form[data-demo]'),function(f){
  f.addEventListener('submit',function(e){e.preventDefault();
    var err=f.querySelector('.err'),ok=f.querySelector('.ok'),name=f.querySelector('[name=name]'),ph=f.querySelector('[name=phone]');
    var m=name&&!name.value.trim()?'Укажите имя.':ph&&ph.value.replace(/\D/g,'').length<10?'Укажите номер телефона.':'';
    err.hidden=!m;err.textContent=m;ok.hidden=!!m;
    if(!m)ok.textContent=name.value.trim()+', спасибо! Замерщик позвонит в течение 15 минут. (Демо: заявка никуда не отправлена.)';
  })});
})();
