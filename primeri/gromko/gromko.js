/* ГРОМКО: товары, рисунки одежды, корзина между страницами */
(function(){
'use strict';
var P=[
 {id:'hoodie',name:'Худи «ГРОМЧЕ»',cat:'top',type:'hoodie',price:5490,old:6490,print:'ГРОМЧЕ',stock:7,tag:'Хит',colors:[['Лайм','#C6FF00'],['Розовый','#FF2E88'],['Чёрный','#1A1A1A'],['Лаванда','#B9A6FF']],pop:10,desc:'Плотный футер 380 г/м², свободный крой, двойной капюшон и вышитая надпись на груди.'},
 {id:'tee',name:'Футболка «ШУМ»',cat:'top',type:'tee',price:2490,print:'ШУМ',stock:23,tag:'New',colors:[['Белый','#FFFFFF'],['Кобальт','#2B3BFF'],['Розовый','#FF2E88']],pop:9,desc:'Хлопок 220 г/м², оверсайз с опущенным плечом. Принт шелкографией, не трескается после стирок.'},
 {id:'cargo',name:'Карго «ДВИЖ»',cat:'bottom',type:'pants',price:4990,print:'',stock:4,tag:'Мало',colors:[['Олива','#8A9A3B'],['Чёрный','#1A1A1A'],['Кобальт','#2B3BFF']],pop:8,desc:'Шесть карманов, регулируемые манжеты и ремень в комплекте. Плотный рипстоп.'},
 {id:'sweat',name:'Свитшот «ЭХО»',cat:'top',type:'long',price:3990,print:'ЭХО',stock:12,colors:[['Лаванда','#B9A6FF'],['Лайм','#C6FF00'],['Белый','#FFFFFF']],pop:7,desc:'Мягкий начёс внутри, рукава с резинкой, крупный объёмный принт на груди.'},
 {id:'bomber',name:'Бомбер «ВОЛНА»',cat:'top',type:'bomber',price:7990,print:'',stock:3,tag:'Мало',colors:[['Розовый','#FF2E88'],['Оранжевый','#FF6A13'],['Чёрный','#1A1A1A']],pop:6,desc:'Нейлон с утеплителем, контрастная подкладка, металлическая молния и карман на рукаве.'},
 {id:'cap',name:'Кепка «Г»',cat:'acc',type:'cap',price:1790,print:'Г',stock:30,colors:[['Чёрный','#1A1A1A'],['Лайм','#C6FF00'],['Розовый','#FF2E88']],pop:5,desc:'Шесть клиньев, изогнутый козырёк и вышитая буква. Размер регулируется ремешком.'},
 {id:'bag',name:'Шопер «ГРОМКО»',cat:'acc',type:'bag',price:1290,print:'ГРОМКО',stock:50,tag:'New',colors:[['Белый','#FFFFFF'],['Лайм','#C6FF00']],pop:4,desc:'Плотный канвас, длинные ручки на плечо, внутренний карман на молнии.'},
 {id:'socks',name:'Носки «ТИК-ТАК»',cat:'acc',type:'socks',price:690,print:'',stock:40,colors:[['Розовый','#FF2E88'],['Кобальт','#2B3BFF'],['Лайм','#C6FF00']],pop:3,desc:'Хлопок с эластаном, высокие, с вязаным полосатым узором.'}
];
var CATS={top:'Верх',bottom:'Низ',acc:'Аксессуары'};
var BG=['#C6FF00','#FF2E88','#2B3BFF','#B9A6FF','#FF6A13','#FFFFFF'];
window.G={P:P,CATS:CATS};

function light(hex){var n=parseInt(hex.slice(1),16);return ((n>>16)*299+(n>>8&255)*587+(n&255)*114)/1000>150}
function svg(p,color){
  var s='stroke="#0A0A0A" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"',f='fill="'+color+'"',ink=light(color)?'#0A0A0A':'#FFFFFF',body='';
  var LONG='M62 40 L86 30 Q100 44 114 30 L138 40 L160 62 L174 152 L152 156 L140 96 L140 174 L60 174 L60 96 L48 156 L26 152 L40 62 Z';
  switch(p.type){
    case 'tee':body='<path '+f+' '+s+' d="M60 40 L85 30 Q100 44 115 30 L140 40 L172 72 L150 94 L138 84 L138 172 L62 172 L62 84 L50 94 L28 72 Z"/>';break;
    case 'long':body='<path '+f+' '+s+' d="'+LONG+'"/><path '+s+' fill="none" d="M62 162 L138 162"/>';break;
    case 'hoodie':body='<path '+f+' '+s+' d="'+LONG+'"/><path '+f+' '+s+' d="M78 38 Q100 -2 122 38 Q100 56 78 38 Z"/><path '+s+' fill="none" d="M74 132 L126 132 L120 160 L80 160 Z"/><path '+s+' d="M94 50 L92 74 M106 50 L108 74" fill="none"/>';break;
    case 'bomber':body='<path '+f+' '+s+' d="'+LONG+'"/><rect x="60" y="160" width="80" height="14" fill="#0A0A0A"/><rect x="26" y="146" width="24" height="10" fill="#0A0A0A" transform="rotate(4 38 151)"/><rect x="150" y="146" width="24" height="10" fill="#0A0A0A" transform="rotate(-4 162 151)"/><path stroke="'+ink+'" stroke-width="4" stroke-dasharray="4 4" d="M100 40 L100 160"/><path '+s+' fill="#0A0A0A" d="M86 30 Q100 44 114 30 L112 26 Q100 36 88 26 Z"/>';break;
    case 'pants':body='<path '+f+' '+s+' d="M62 22 L138 22 L148 178 L112 178 L100 78 L88 178 L52 178 Z"/><path '+s+' fill="none" d="M62 34 L138 34"/><rect '+s+' fill="none" x="56" y="96" width="22" height="30" rx="3"/><rect '+s+' fill="none" x="122" y="96" width="22" height="30" rx="3"/>';break;
    case 'cap':body='<path '+f+' '+s+' d="M44 124 Q46 56 104 56 Q158 58 158 124 Z"/><path fill="#0A0A0A" '+s+' d="M30 124 Q100 106 184 130 Q112 146 30 132 Z"/><circle cx="104" cy="56" r="6" fill="#0A0A0A"/>';break;
    case 'bag':body='<path '+s+' fill="none" stroke-width="7" d="M74 72 Q74 22 100 22 Q126 22 126 72"/><path '+f+' '+s+' d="M50 70 L150 70 L156 178 L44 178 Z"/>';break;
    case 'socks':body='<path '+f+' '+s+' d="M54 24 L84 24 L84 114 L112 136 Q124 156 104 164 L58 148 Q46 142 54 120 Z"/><path '+f+' '+s+' d="M104 24 L134 24 L134 114 L162 136 Q174 156 154 164 L108 148 Q96 142 104 120 Z"/><path stroke="#0A0A0A" stroke-width="5" d="M54 40 L84 40 M54 54 L84 54 M104 40 L134 40 M104 54 L134 54"/>';break;
  }
  var txt='';
  if(p.print){var y=p.type==='bag'?132:p.type==='cap'?104:p.type==='hoodie'?104:96,size=p.print.length>4?13:p.print.length>2?20:30;
    txt='<text x="'+(p.type==='cap'?104:100)+'" y="'+y+'" text-anchor="middle" font-family="Rubik Mono One, Arial Black, sans-serif" font-size="'+size+'" fill="'+ink+'">'+p.print+'</text>'}
  return '<svg viewBox="0 0 200 200" role="img" aria-label="'+p.name+'">'+body+txt+'</svg>';
}
G.svg=svg;
G.bg=function(p,ci){var c=p.colors[ci||0][1];var opts=BG.filter(function(b){return b.toLowerCase()!==c.toLowerCase()});return opts[(p.id.length+(ci||0))%opts.length]};
G.find=function(id){for(var i=0;i<P.length;i++)if(P[i].id===id)return P[i];return null};
G.rub=function(n){return n.toLocaleString('ru-RU')+' ₽'};

/* cart store */
var mem=[];
G.load=function(){try{var v=JSON.parse(localStorage.getItem('gromko_cart')||'[]');return Array.isArray(v)?v:[]}catch(e){return mem}};
G.save=function(c){mem=c;try{localStorage.setItem('gromko_cart',JSON.stringify(c))}catch(e){}G.badge()};
G.add=function(id,ci,size){var c=G.load();var f=c.filter(function(x){return x.id===id&&x.ci===ci&&x.size===size})[0];if(f)f.qty++;else c.push({id:id,ci:ci,size:size,qty:1});G.save(c)};
G.badge=function(){var n=G.load().reduce(function(s,x){return s+x.qty},0);[].forEach.call(document.querySelectorAll('[data-cart-count]'),function(b){b.textContent=n})};

G.card=function(p){
  var a=document.createElement('a');a.className='card';a.href='tovar.html?id='+p.id;
  a.innerHTML='<div class="pic" style="background:'+G.bg(p,0)+'">'+(p.tag?'<span class="tag'+(p.tag==='Мало'?' pink':'')+'">'+p.tag+'</span>':'')+svg(p,p.colors[0][1])+'</div><div class="card-meta"><div class="row"><h3></h3><span class="price">'+G.rub(p.price)+'</span></div><div class="dots">'+p.colors.map(function(c){return '<i style="background:'+c[1]+'" title="'+c[0]+'"></i>'}).join('')+'</div></div>';
  a.querySelector('h3').textContent=p.name;return a};

document.addEventListener('DOMContentLoaded',G.badge);
window.addEventListener('storage',G.badge);
})();
