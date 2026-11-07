/* ПОЛОК: иллюстрации, данные, бронь пара, меню и расчёт банкета */
(function(){
'use strict';
var P=window.POLOK={};
var rub=P.rub=function(n){return Math.round(n).toLocaleString('ru-RU')+' ₽'};

/* ---------- illustrations ---------- */
function birch(x,y,h){var s='<rect x="'+x+'" y="'+(y-h)+'" width="9" height="'+h+'" rx="3" fill="#FBF8F2"/>';for(var i=1;i<6;i++)s+='<rect x="'+(x+(i%2?0:3))+'" y="'+(y-h+i*h/6)+'" width="'+(i%2?5:6)+'" height="3" fill="#2A2420"/>';
  s+='<ellipse cx="'+(x+4)+'" cy="'+(y-h)+'" rx="30" ry="24" fill="#6E8B5A"/><ellipse cx="'+(x-12)+'" cy="'+(y-h+18)+'" rx="18" ry="14" fill="#7FA066"/><ellipse cx="'+(x+20)+'" cy="'+(y-h+14)+'" rx="20" ry="15" fill="#5C7A4A"/>';return s}
var ILL={
  banya:function(night){var bg=night?'#1E3B32':'#D6E7EC',gr=night?'#28493F':'#FBF8F2';
    var s='<rect width="400" height="300" fill="'+bg+'"/>'+(night?'<circle cx="330" cy="60" r="22" fill="#F7E7B8"/><g fill="#FBF8F2"><circle cx="60" cy="40" r="1.5"/><circle cx="120" cy="70" r="1.2"/><circle cx="210" cy="30" r="1.6"/><circle cx="270" cy="90" r="1.1"/><circle cx="370" cy="120" r="1.3"/></g>':'<circle cx="330" cy="60" r="26" fill="#F2B544"/>')+
    '<path d="M0 230 C100 215 300 225 400 210 L400 300 L0 300Z" fill="'+gr+'"/>'+birch(40,236,110)+birch(352,226,90)+
    '<g class="steam" fill="none" stroke="#FBF8F2" stroke-width="6" stroke-linecap="round" opacity=".8"><path d="M250 70 c-12 -14 12 -24 0 -38"/><path d="M262 66 c-12 -14 12 -24 0 -38"/><path d="M238 72 c-12 -14 12 -24 0 -38"/></g>'+
    '<rect x="240" y="80" width="22" height="40" fill="#5A4636"/>'+
    '<path d="M110 140 L200 82 L290 140Z" fill="#2A2420"/>'+
    '<rect x="122" y="138" width="156" height="92" fill="#A8693F"/>';
    for(var i=0;i<6;i++)s+='<rect x="118" y="'+(140+i*15)+'" width="164" height="12" rx="6" fill="'+(i%2?'#B9784B':'#9E6038')+'"/>';
    s+='<rect x="186" y="176" width="32" height="54" rx="4" fill="'+(night?'#F2B544':'#5A4636')+'"/><rect x="142" y="160" width="28" height="22" rx="3" fill="'+(night?'#F2B544':'#D6E7EC')+'" stroke="#2A2420" stroke-width="3"/><rect x="232" y="160" width="28" height="22" rx="3" fill="'+(night?'#F2B544':'#D6E7EC')+'" stroke="#2A2420" stroke-width="3"/>'+
    (night?'<path d="M186 230 L160 300 L246 300 L218 230Z" fill="#F2B544" opacity=".22"/>':'')+
    '<ellipse cx="310" cy="262" rx="46" ry="14" fill="#7FB8C8"/><ellipse cx="310" cy="258" rx="46" ry="12" fill="#A8693F" opacity=".0"/><path d="M264 262 a46 14 0 0 0 92 0" fill="none" stroke="#5A4636" stroke-width="6"/>'+
    '<g fill="none" stroke="#FBF8F2" stroke-width="4" stroke-linecap="round" opacity=".7"><path d="M296 250 c-6 -8 6 -14 0 -22"/><path d="M318 250 c-6 -8 6 -14 0 -22"/></g>';
    return s},
  pary:function(){return '<rect width="400" height="300" fill="#E35A24"/><circle cx="200" cy="330" r="190" fill="#F2B544" opacity=".35"/>'+
    '<g class="steam" fill="none" stroke="#FBF8F2" stroke-width="7" stroke-linecap="round" opacity=".85"><path d="M150 120 c-16 -18 16 -30 0 -50"/><path d="M200 110 c-16 -18 16 -30 0 -50"/><path d="M250 120 c-16 -18 16 -30 0 -50"/></g>'+
    '<path d="M120 170 L280 170 L268 250 L132 250Z" fill="#9E6038"/><rect x="112" y="160" width="176" height="16" rx="8" fill="#5A4636"/><path d="M132 200 h136 M134 226 h132" stroke="#5A4636" stroke-width="5"/>'+
    '<path d="M300 150 l60 -70" stroke="#5A4636" stroke-width="9" stroke-linecap="round"/><ellipse cx="300" cy="158" rx="22" ry="12" fill="#5A4636"/>'+
    '<g transform="rotate(-25 80 150)"><rect x="74" y="150" width="12" height="70" rx="5" fill="#9E6038"/><g fill="#5C7A4A"><ellipse cx="80" cy="120" rx="34" ry="44"/></g><g fill="#7FA066"><ellipse cx="62" cy="110" rx="14" ry="22"/><ellipse cx="98" cy="112" rx="14" ry="22"/><ellipse cx="80" cy="92" rx="14" ry="20"/></g></g>'},
  massage:function(){return '<rect width="400" height="300" fill="#D6E7EC"/><circle cx="320" cy="80" r="60" fill="#FBF8F2" opacity=".7"/>'+
    '<rect x="70" y="170" width="260" height="22" rx="10" fill="#A8693F"/><rect x="90" y="190" width="12" height="70" fill="#5A4636"/><rect x="298" y="190" width="12" height="70" fill="#5A4636"/>'+
    '<ellipse cx="300" cy="152" rx="26" ry="20" fill="#E9B98F"/><path d="M90 170 C110 130 270 130 280 168Z" fill="#E9B98F"/><path d="M100 172 C120 150 200 146 250 162 L250 172Z" fill="#FBF8F2"/><path d="M286 140 c10 -14 30 -12 36 4" fill="#2A2420"/>'+
    '<g fill="#2A2420"><ellipse cx="170" cy="140" rx="18" ry="7"/><ellipse cx="200" cy="134" rx="16" ry="6"/><ellipse cx="228" cy="140" rx="14" ry="6"/></g>'+
    '<rect x="40" y="230" width="18" height="30" rx="3" fill="#FBF8F2"/><path d="M49 230 c-6 -10 6 -14 0 -22" fill="#F2B544"/><g fill="#6E8B5A"><ellipse cx="350" cy="240" rx="10" ry="22" transform="rotate(20 350 240)"/><ellipse cx="365" cy="236" rx="9" ry="20" transform="rotate(-15 365 236)"/></g>'},
  food:function(){return '<rect width="400" height="300" fill="#F2B544"/><rect x="0" y="210" width="400" height="90" fill="#9E6038"/><path d="M0 210 h400" stroke="#5A4636" stroke-width="6"/>'+
    '<g class="steam" fill="none" stroke="#FBF8F2" stroke-width="6" stroke-linecap="round" opacity=".9"><path d="M150 120 c-12 -14 12 -24 0 -40"/><path d="M175 116 c-12 -14 12 -24 0 -40"/></g>'+
    '<path d="M110 150 h110 a10 10 0 0 1 10 10 c0 40 -24 60 -65 60 c-41 0 -65 -20 -65 -60 a10 10 0 0 1 10 -10z" fill="#2A2420"/><rect x="104" y="142" width="122" height="14" rx="7" fill="#3B332D"/>'+
    '<ellipse cx="300" cy="200" rx="64" ry="18" fill="#FBF8F2"/><path d="M246 196 C250 160 350 160 354 196Z" fill="#C97A3A"/><path d="M262 178 l18 6 l18 -8 l18 8 l18 -6" stroke="#8C4F22" stroke-width="4" fill="none"/>'+
    '<g><rect x="40" y="168" width="34" height="42" rx="6" fill="#FBF8F2"/><path d="M74 180 h10 a8 8 0 0 1 0 16 h-10" stroke="#FBF8F2" stroke-width="5" fill="none"/><rect x="40" y="176" width="34" height="14" fill="#B5262E" opacity=".85"/></g>'},
  samovar:function(){return '<rect width="400" height="300" fill="#1E3B32"/><circle cx="200" cy="160" r="120" fill="#28493F"/>'+
    '<g class="steam" fill="none" stroke="#FBF8F2" stroke-width="5" stroke-linecap="round" opacity=".7"><path d="M200 50 c-10 -12 10 -20 0 -34"/></g>'+
    '<rect x="186" y="56" width="28" height="26" rx="4" fill="#C9973A"/><path d="M150 90 h100 l14 90 h-128z" fill="#E3B04B"/><ellipse cx="200" cy="90" rx="52" ry="12" fill="#F2C766"/><path d="M136 180 h128 l-20 40 h-88z" fill="#C9973A"/><rect x="170" y="220" width="60" height="16" rx="4" fill="#9E7428"/>'+
    '<path d="M150 110 c-30 0 -30 40 0 40" stroke="#C9973A" stroke-width="8" fill="none"/><path d="M250 110 c30 0 30 40 0 40" stroke="#C9973A" stroke-width="8" fill="none"/><path d="M200 168 h40 v8 h-10" stroke="#9E7428" stroke-width="7" fill="none"/>'+
    '<g><path d="M290 216 h50 l-6 26 h-38z" fill="#FBF8F2"/><ellipse cx="315" cy="216" rx="25" ry="6" fill="#B5262E"/></g><g><path d="M60 216 h50 l-6 26 h-38z" fill="#FBF8F2"/><ellipse cx="85" cy="216" rx="25" ry="6" fill="#B07A3A"/></g>'}
};
P.ill=function(k,a){return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+ILL[k](a)+'</svg>'};
[].forEach.call(document.querySelectorAll('[data-ill]'),function(el){el.innerHTML=P.ill(el.dataset.ill,el.dataset.night==='1')});

/* ---------- data ---------- */
P.SESS={
  wd:[['10:00','Лёгкий пар',1500,'Для первого раза: мягкий жар и травяной чай'],['14:00','Травяной пар',1800,'Пармейстер парит с мятой, чабрецом и душицей'],['18:00','Вечерний пар',2200,'Ритуал с пармейстером, медовый скраб, купель']],
  we:[['10:00','Утренний пар',1900,'Бодрый пар, контрастная купель, блины после'],['14:00','Дубовый пар',2200,'Дубовые веники и солевой скраб'],['18:00','Огненный пар',2600,'Самый жаркий ритуал вечера с двумя пармейстерами'],['21:30','Ночной пар',2400,'Под звёздами: свечи, купель и горячий сбитень']]
};
P.sessFor=function(d){var w=d.getDay();return (w===0||w===5||w===6)?P.SESS.we:P.SESS.wd};
P.MASS=[['Парение веником 1 на 1',30,2500],['Классический массаж',60,3500],['Медовый массаж',40,2800],['Массаж спины',30,2000],['Солевой скраб',30,2200],['Пилинг рукавицей',40,2600]];
P.MENU={
  'Закуски':[['Квашеная капуста с клюквой','с подсолнечным маслом',290],['Сало с горчицей','на бородинском хлебе',390],['Хрустящие огурчики','бочковые, с укропом',270],['Солёные грузди','со сметаной и луком',420]],
  'Горячее':[['Уха по-царски','три вида рыбы, расстегай',590],['Щи суточные','томлёные в печи',420],['Пельмени ручной лепки','говядина и свинина',490],['Шашлык из свиной шеи','с луком и аджикой',790]],
  'Из печи':[['Пирог с капустой','порция',260],['Курник','с курицей и грибами',340],['Расстегай с рыбой','с бульоном',290],['Блины с икрой','три штуки',690]],
  'Напитки':[['Морс клюквенный','0,5 л',220],['Квас хлебный','0,5 л, свой',190],['Иван-чай','чайник 0,8 л',350],['Сбитень горячий','мёд и пряности',260]]
};

/* ---------- helpers ---------- */
P.chips=function(id,items,cb){var box=document.getElementById(id);if(!box)return;box.innerHTML='';items.forEach(function(it){var b=document.createElement('button');b.type='button';b.className='chip';b.innerHTML='<span></span>'+(it.s?'<small></small>':'');b.children[0].textContent=it.t;if(it.s)b.children[1].textContent=it.s;b.setAttribute('aria-pressed',!!it.on);b.disabled=!!it.off;b.onclick=function(){cb(it.v)};box.appendChild(b)})};
P.menuList=function(box,list){box.innerHTML='';list.forEach(function(m){var d=document.createElement('div');d.className='mi';d.innerHTML='<span class="n"><b></b><small></small></span><span class="dots"></span><span class="p"></span>';d.querySelector('b').textContent=m[0];d.querySelector('small').textContent=m[1];d.querySelector('.p').textContent=typeof m[2]==='number'?rub(m[2]):m[2];box.appendChild(d)})};
P.tabs=function(tabsId,listId,data,start){var cur=start||Object.keys(data)[0];function r(){var t=document.getElementById(tabsId);t.innerHTML='';Object.keys(data).forEach(function(k){var b=document.createElement('button');b.type='button';b.className='tab';b.setAttribute('role','tab');b.setAttribute('aria-selected',k===cur);b.textContent=k;b.onclick=function(){cur=k;r()};t.appendChild(b)});P.menuList(document.getElementById(listId),data[cur])}r()};
var DN=['вс','пн','вт','ср','чт','пт','сб'],MN=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
P.fd=function(d){return DN[d.getDay()]+', '+d.getDate()+' '+MN[d.getMonth()]};
P.days=function(n){var out=[],d=new Date();d.setHours(0,0,0,0);for(var i=0;i<n;i++){var x=new Date(d);x.setDate(d.getDate()+i);out.push(x)}return out};
P.seats=function(d,t){var s=(d.getDate()*7+parseInt(t)*3)%17;return Math.max(0,s-2)};
P.isPast=function(d,t){var now=new Date();if(d.toDateString()!==now.toDateString())return false;var h=parseInt(t);return now.getHours()>=h};
P.check=function(nameId,phoneId,errId){var n=document.getElementById(nameId).value.trim(),p=document.getElementById(phoneId).value.replace(/\D/g,''),e=document.getElementById(errId);var m=!n?'Укажите имя.':p.length<10?'Укажите номер телефона.':'';e.hidden=!m;e.textContent=m;return m?null:n};
})();
