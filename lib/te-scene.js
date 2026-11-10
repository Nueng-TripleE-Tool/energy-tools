/* te-scene.js — แกนกลางภาพเคลื่อนไหว + คำอธิบาย + first-run + ประโยคตัดสินผล (ชั้น UI · ไม่มีสูตรคำนวณ)
   Triple E Energy Tools Pro/Expert · r1 (4 พ.ย. 2569) · ลิขสิทธิ์ อ.หนึ่ง กลับทวี
   กติกา: scene อ่านผลที่คำนวณแล้วมาแสดงเท่านั้น ห้ามคำนวณเอง · ทุก element ที่โมดูลนี้สร้างติด class "te-uix"
   API:
     TE_SCENE.reg(id,def) / mount(host,id,opts) / update(host,vals) / snapshot(host) / setAnim(on)
     TE_SCENE.k — ชุดช่างวาด: pipe, flame, steamJet, bubbles, gauge, tank, box, txt, hotspot, band, fan, drop
     TE_HELP.set(dict) / mark(elOrId,key) / auto(map) / attach(root)   — ⓘ: วัดที่ไหน · ค่าปกติ · ค่าแทน
     TE_FR.bar(anchor,opts) / tour(steps) / chip()                     — เปิดครั้งแรกไม่ว่าง
     TE_VERDICT.html(st,txt) / put(el,st,txt)                          — ประโยคตัดสินผลใต้ KPI
   เหตุการณ์: คลิกจุดบนภาพ → host ยิง CustomEvent 'te-hotspot' {detail:{group}} (ตรงกับ TE_SVG_BOILER) */
(function(){
'use strict';
var NS='http://www.w3.org/2000/svg';
/* [EN r1 5 พ.ย. 2569] ภาษา: ?lang → TE_I18N → localStorage te.lang · โหลด te-scene-en.js เฉพาะเมื่อเป็น en */
function isEn(){try{var m=location.search.match(/[?&]lang=(en|th)\b/);if(m)return m[1]==='en';
  if(window.TE_I18N&&TE_I18N.lang)return TE_I18N.lang==='en';
  return (localStorage.getItem('te_lang')||localStorage.getItem('te.lang'))==='en';}catch(e){return false;}}
var SELF_SRC=(document.currentScript&&document.currentScript.src)||'';
function loadEn(){if(window.TE_HELP_EN||!isEn()||!SELF_SRC)return;if(document.getElementById('te-scene-en-js'))return;
  var sc=document.createElement('script');sc.id='te-scene-en-js';sc.src=SELF_SRC.replace(/te-scene\.js(\?.*)?$/,'te-scene-en.js$1');
  sc.onload=function(){try{ /* แถบ first-run ที่สร้างก่อนไฟล์ EN มาถึง → เปลี่ยนป้ายปุ่มคงที่ */
    var E=window.TE_SCENE_EN;document.querySelectorAll('.te-frbar').forEach(function(b){
      var q=function(sel,k){var x=b.querySelector(sel);if(x)x.textContent=E[k];};
      q('.bDemo','demo');q('.bTour','tour');q('.bOpen','open');var x=b.querySelector('.bX');if(x)x.title=E.hide;});
    var c=document.querySelector('.te-frchip');if(c)c.title=E.chip;}catch(e){}
    try{_enRefresh();}catch(e){}};
  document.head.appendChild(sc);}
try{loadEn();}catch(e){}
/* [R7 8 พ.ย. 2569] สลับภาษาสดด้วยชิป 🌐 (ไม่รีโหลด) → โหลดคำแปล ⓘ ตอนนั้น + รีเฟรชสิ่งที่วาดไว้แล้ว
   เดิม loadEn ถูกเรียกครั้งเดียวตอนเปิดหน้า → เข้าโหมดไทยแล้วสลับเป็น EN ⓘ จะตกกลับไทยทุกการ์ด */
var _lastHp=null;
function _enRefresh(){
  try{document.querySelectorAll('.te-hbtn').forEach(function(b){b.title=L('helpTitle','คำอธิบาย');});}catch(e){}
  try{if(window.TE_PARAM&&TE_PARAM.repaint)TE_PARAM.repaint();}catch(e){}
  try{if(hpop&&_lastHp&&document.body.contains(_lastHp.btn))showHp(_lastHp.btn,_lastHp.key);}catch(e){}
}
document.addEventListener('te-lang',function(){
  try{if(isEn()&&!window.TE_HELP_EN)loadEn();else _enRefresh();}catch(e){}
});
function L(k,th){return (isEn()&&window.TE_SCENE_EN&&TE_SCENE_EN[k])||th;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

/* ───────────────── สไตล์กลาง (ฉีดครั้งเดียว) ───────────────── */
var CSS=[
'@keyframes teS-dash{to{stroke-dashoffset:-24px}}',
'@keyframes teS-dashR{to{stroke-dashoffset:24px}}',
'@keyframes teS-flick{0%{transform:scale(.92,.86)}100%{transform:scale(1.06,1.1)}}',
'@keyframes teS-rise{0%{transform:translate(0,0) scale(.6);opacity:.9}100%{transform:translate(10px,-34px) scale(1.9);opacity:0}}',
'@keyframes teS-jet{0%{transform:translate(0,0) scale(.5);opacity:.95}100%{transform:translate(var(--jx,22px),var(--jy,-10px)) scale(1.8);opacity:0}}',
'@keyframes teS-bub{0%{transform:translateY(0);opacity:.9}100%{transform:translateY(-26px);opacity:0}}',
'@keyframes teS-spin{to{transform:rotate(360deg)}}',
'@keyframes teS-pulse{0%,100%{opacity:1}50%{opacity:.45}}',
'@keyframes teS-ping{0%{r:9;opacity:.85}100%{r:20;opacity:0}}',
'@keyframes teS-drop{0%{transform:translateY(0);opacity:.95}100%{transform:translateY(28px);opacity:0}}',
'.te-scene{position:relative}',
'.te-scene svg{display:block;width:100%;height:auto;font-family:inherit}',
'.te-scene .tsP{fill:none;stroke-linecap:round}',
'.te-scene .tsPd{stroke-dasharray:10 14;animation:teS-dash var(--spd,1.1s) linear infinite}',
'.te-scene .tsPdR{stroke-dasharray:10 14;animation:teS-dashR var(--spd,1.1s) linear infinite}',
'.te-scene .tsFl{transform-box:fill-box;transform-origin:50% 92%;animation:teS-flick .42s ease-in-out infinite alternate}',
'.te-scene .tsRise{transform-box:fill-box;animation:teS-rise 1.7s linear infinite}',
'.te-scene .tsJet{transform-box:fill-box;animation:teS-jet 1s linear infinite}',
'.te-scene .tsBub{transform-box:fill-box;animation:teS-bub 1.8s linear infinite}',
'.te-scene .tsSpin{transform-box:fill-box;transform-origin:50% 50%;animation:teS-spin var(--spd,2.4s) linear infinite}',
'.te-scene .tsPulse{animation:teS-pulse 1.4s ease-in-out infinite}',
'.te-scene .tsPing{animation:teS-ping 1.4s ease-out infinite;pointer-events:none}',
'.te-scene .tsDrop{transform-box:fill-box;animation:teS-drop 1.3s linear infinite}',
'[data-te-anim="off"] .te-scene *,.te-scene.still *{animation:none!important}',
'.te-repfig{margin:14px 0 0;break-inside:avoid}.te-repfig figcaption{font-size:.74rem;color:#64748b;margin-top:4px;text-align:center}@media print{.te-norep{display:none!important}}',
'.te-scene .tsHot{cursor:pointer}',
'.te-scene .tsHot circle.c{fill:#0B7373;stroke:#fff;stroke-width:2}',
'.te-scene .tsHot text{fill:#fff;font-weight:700;pointer-events:none}',
'.te-scene .tsHot.on circle.c{fill:#F2A33A}',
'.te-scene .tsHot:hover circle.c{filter:brightness(1.2)}',
/* ── ⓘ ── */
'.te-hbtn{display:inline-flex;flex:none;align-items:center;justify-content:center;width:13px;height:13px;margin-left:3px;border-radius:50%;border:1px solid #58a8a8;background:#eef9f9;color:#0B7373;font:700 9px/1 sans-serif;cursor:pointer;vertical-align:-1px;user-select:none;position:relative}.te-hbtn::after{content:\"\";position:absolute;inset:-5px}label .te-hbtn{margin-top:0}',
'.te-hbtn:hover{background:#0B7373;color:#fff}',
'button.te-hbtn,.te-hbtn{box-sizing:border-box!important;width:13px!important;height:13px!important;min-width:0!important;min-height:0!important;max-width:13px!important;max-height:13px!important;padding:0!important;margin:0 0 0 3px!important;font:700 9px/1 sans-serif!important;letter-spacing:0!important;box-shadow:none!important;filter:none!important;text-transform:none!important;overflow:hidden}',
'.te-hpop{position:fixed;z-index:99990;max-width:330px;background:#0F2A4A;color:#eef5fa;border-radius:10px;padding:9px 11px;font-size:12.5px;line-height:1.6;box-shadow:0 8px 28px rgba(0,0,0,.35)}',
'.te-hpop b{color:#7fd8d8}.te-hpop .hT{font-weight:700;color:#fff;margin-bottom:3px;font-size:13px}',
'.te-hpop .hRow{display:flex;gap:6px;margin-top:3px;align-items:flex-start}.te-hpop .hRow .ic{flex:none;width:18px;text-align:center;line-height:1.6}.te-hpop .hRow>span:last-child{flex:1}',
/* ── first-run ── */
'.te-frbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:10px 0 14px;padding:12px 14px;border:1.5px dashed #12A4A4;border-radius:12px;background:linear-gradient(135deg,#f0fbfb,#eef5fa)}',
'.te-frbar .t{flex:1 1 220px;min-width:200px;font-size:13px;line-height:1.55;color:#0F2A4A}',
'.te-frbar .t b{font-size:14px}',
'.te-frbar button{border:0;border-radius:9px;padding:9px 14px;font:600 13px/1.2 inherit;cursor:pointer}',
'.te-frbar .bDemo{background:#0B7373;color:#fff}.te-frbar .bDemo:hover{background:#12A4A4}',
'.te-frbar .bTour{background:#fff;color:#0B7373;border:1.5px solid #0B7373}.te-frbar .bTour:hover{background:#e6f4f4}',
'.te-frbar .bOpen{background:#fff;color:#44607a;border:1.5px solid #9db8c8}.te-frbar .bOpen:hover{background:#eef5f9}',
'.te-frbar .bX{background:none;color:#8aa0b2;font-size:16px;padding:4px 8px}.te-frbar .bX:hover{color:#334}',
'.te-frchip{position:fixed;right:14px;bottom:14px;z-index:99980;width:34px;height:34px;border-radius:50%;border:0;background:#0B7373;color:#fff;font:700 16px/1 sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25)}',
'.te-frchip:hover{background:#12A4A4}',
'.te-trmask{position:fixed;inset:0;z-index:99985;pointer-events:none}',
'.te-trbox{position:fixed;z-index:99986;border:2px solid #F2A33A;border-radius:10px;box-shadow:0 0 0 9999px rgba(10,30,50,.55);pointer-events:none;transition:all .25s}',
'.te-trtip{position:fixed;z-index:99987;max-width:300px;background:#fff;border-radius:10px;padding:12px 14px;font-size:13px;line-height:1.6;color:#17324e;box-shadow:0 10px 30px rgba(0,0,0,.35)}',
'.te-trtip .n{font-weight:700;color:#0B7373;margin-bottom:4px}',
'.te-trtip .bt{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}',
'.te-trtip button{border:0;border-radius:7px;padding:6px 12px;font:600 12px/1 inherit;cursor:pointer}',
'.te-trtip .nx{background:#0B7373;color:#fff}.te-trtip .sk{background:#eef2f5;color:#44607a}',
/* ── verdict ── */
'.te-verd{display:flex;gap:8px;align-items:flex-start;margin:8px 0;padding:9px 12px;border-radius:9px;font-size:13px;line-height:1.6}',
'.te-verd .ic{flex:none;font-size:14px}',
'.te-verd.ok{background:#e9f7ef;color:#14532d;border-left:4px solid #16a34a}',
'.te-verd.warn{background:#fdf5e4;color:#713f12;border-left:4px solid #F2A33A}',
'.te-verd.bad{background:#fdeeee;color:#7a1f1f;border-left:4px solid #dc2626}',
'.te-verd.info{background:#eef5fa;color:#17324e;border-left:4px solid #3b82f6}'
].join('\n');
function injectCss(){if(document.getElementById('te-scene-css'))return;var st=document.createElement('style');st.id='te-scene-css';st.className='te-uix';st.textContent=CSS;document.head.appendChild(st);}

/* ───────────────── การเดิน/หยุดภาพเคลื่อนไหว ───────────────── */
var animOn=true;
function applyAnim(){var off=!animOn||document.hidden||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  document.documentElement.setAttribute('data-te-anim',off?'off':'on');}
try{document.addEventListener('visibilitychange',applyAnim);
    if(window.matchMedia)matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',applyAnim);}catch(e){}

/* ───────────────── ชุดช่างวาด k ───────────────── */
var k={
 svg:function(w,h,inner,vb){return '<svg xmlns="'+NS+'" viewBox="'+(vb||('0 0 '+w+' '+h))+'" role="img">'+inner+'</svg>';},
 /* ท่อ: เส้นพื้น + เส้นประวิ่ง ทิศตาม rev, ความเร็ว spd (s) · ปิดการไหลด้วย flow:false */
 pipe:function(d,o){o=o||{};var w=o.w||10,col=o.col||'#9fb3c2',fl=o.flow!==false;
   return '<path class="tsP" d="'+d+'" stroke="'+col+'" stroke-width="'+w+'" opacity=".45"/>'+
     (fl?'<path class="tsP '+(o.rev?'tsPdR':'tsPd')+'" data-role="'+(o.role||'')+'" d="'+d+'" stroke="'+(o.col2||col)+'" stroke-width="'+Math.max(2,w-5)+'" style="--spd:'+(o.spd||1.1)+'s"/>':'');},
 flame:function(x,y,s,id){s=s||1;return '<g class="tsFl" '+(id?'data-role="'+id+'"':'')+' transform="translate('+x+','+y+') scale('+s+')">'+
   '<path d="M0,0 C-14,-8 -12,-30 0,-44 C4,-28 14,-26 12,-12 C20,-20 22,-10 16,-2 Z" fill="#ff9a2e"/>'+
   '<path d="M0,-4 C-7,-9 -6,-22 0,-30 C3,-20 8,-18 7,-9 Z" fill="#ffd54f"/></g>';},
 steamJet:function(x,y,o){o=o||{};var jx=o.dx==null?22:o.dx,jy=o.dy==null?-10:o.dy,n=o.n||3,out='';
   for(var i=0;i<n;i++)out+='<circle class="tsJet" data-role="'+(o.role||'jet')+'" cx="'+x+'" cy="'+y+'" r="'+(o.r||4)+'" fill="#e6f0f6" opacity=".9" style="--jx:'+jx+'px;--jy:'+jy+'px;animation-delay:'+(i*0.33)+'s"/>';
   return '<g data-jet="1">'+out+'</g>';},
 bubbles:function(x,y,w,n){n=n||4;var out='';for(var i=0;i<n;i++){var bx=x+(i/(n-1||1))*w;
   out+='<circle class="tsBub" cx="'+bx+'" cy="'+y+'" r="'+(2.5+(i%3))+'" fill="#fff" opacity=".8" style="animation-delay:'+(i*0.45)+'s"/>';}return out;},
 drops:function(x,y,n,col){n=n||3;var out='';for(var i=0;i<n;i++)out+='<circle class="tsDrop" cx="'+(x+i*7)+'" cy="'+y+'" r="2.6" fill="'+(col||'#4aa3df')+'" style="animation-delay:'+(i*0.4)+'s"/>';return out;},
 fan:function(x,y,r,spd){return '<g transform="translate('+x+','+y+')"><circle r="'+r+'" fill="#dfe7ee" stroke="#8fa1b0" stroke-width="2"/>'+
   '<g class="tsSpin" style="--spd:'+(spd||1.6)+'s"><path d="M0,-'+(r*.78)+' L'+(r*.2)+',0 L0,'+(r*.78)+' L-'+(r*.2)+',0 Z" fill="#8fa1b0"/><path d="M-'+(r*.78)+',0 L0,'+(r*.2)+' L'+(r*.78)+',0 L0,-'+(r*.2)+' Z" fill="#8fa1b0"/></g><circle r="3" fill="#44607a"/></g>';},
 tank:function(x,y,w,h,o){o=o||{};var lv=Math.max(0,Math.min(1,o.level==null?0.5:o.level)),ry=o.ry==null?12:o.ry;
   return '<g data-role="'+(o.role||'tank')+'" transform="translate('+x+','+y+')">'+
   '<rect width="'+w+'" height="'+h+'" rx="'+ry+'" fill="url(#tsSteel)" stroke="#8fa1b0" stroke-width="2"/>'+
   '<clipPath id="tsc_'+(o.role||'t')+'"><rect width="'+w+'" height="'+h+'" rx="'+ry+'"/></clipPath>'+
   '<rect data-part="level" clip-path="url(#tsc_'+(o.role||'t')+')" x="0" y="'+(h*(1-lv)).toFixed(1)+'" width="'+w+'" height="'+(h*lv).toFixed(1)+'" fill="url(#tsWater)"/>'+
   (o.bub!==false?'<g clip-path="url(#tsc_'+(o.role||'t')+')">'+k.bubbles(w*.2,h*(1-lv)+14,w*.6)+'</g>':'')+'</g>';},
 gauge:function(x,y,r,o){o=o||{};var v=Math.max(0,Math.min(1,o.v==null?.5:o.v)),a=(-120+v*240)*Math.PI/180;
   var nx=x+Math.sin(a)*r*.72,ny=y-Math.cos(a)*r*.72,col=o.col||'#0B7373';
   return '<g data-role="'+(o.role||'g')+'"><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#fff" stroke="#8fa1b0" stroke-width="2"/>'+
   '<path d="M'+(x-r*.7)+' '+(y+r*.55)+' A '+r*.85+' '+r*.85+' 0 1 1 '+(x+r*.7)+' '+(y+r*.55)+'" fill="none" stroke="#dfe7ee" stroke-width="4"/>'+
   '<line data-part="needle" x1="'+x+'" y1="'+y+'" x2="'+nx.toFixed(1)+'" y2="'+ny.toFixed(1)+'" stroke="'+col+'" stroke-width="3" stroke-linecap="round"/>'+
   '<circle cx="'+x+'" cy="'+y+'" r="3.4" fill="'+col+'"/>'+
   (o.label?'<text x="'+x+'" y="'+(y+r+14)+'" text-anchor="middle" font-size="11" fill="#44607a">'+esc(o.label)+'</text>':'')+
   '<text data-part="val" x="'+x+'" y="'+(y+r*.62)+'" text-anchor="middle" font-size="11.5" font-weight="700" fill="#17324e">'+esc(o.text||'')+'</text></g>';},
 box:function(x,y,w,h,o){o=o||{};return '<g transform="translate('+x+','+y+')"><rect width="'+w+'" height="'+h+'" rx="'+(o.rx==null?8:o.rx)+'" fill="'+(o.fill||'url(#tsSteel)')+'" stroke="'+(o.stroke||'#8fa1b0')+'" stroke-width="2"/>'+
   (o.label?'<text x="'+w/2+'" y="'+(h/2+4)+'" text-anchor="middle" font-size="'+(o.fs||12)+'" font-weight="600" fill="'+(o.tcol||'#17324e')+'">'+esc(o.label)+'</text>':'')+'</g>';},
 txt:function(x,y,s,o){o=o||{};return '<text x="'+x+'" y="'+y+'" font-size="'+(o.fs||12)+'" '+(o.anchor?'text-anchor="'+o.anchor+'"':'')+' font-weight="'+(o.fw||400)+'" fill="'+(o.col||'#44607a')+'">'+esc(s)+'</text>';},
 /* จุดกรอก: วงเลข คลิกแล้วยิง te-hotspot(group) */
 hotspot:function(x,y,n,group,label){return '<g class="tsHot" data-g="'+group+'" transform="translate('+x+','+y+')">'+
   '<circle class="tsPing" r="9" fill="none" stroke="#0B7373" stroke-width="2"/>'+
   '<circle class="c" r="11"/><text y="4" text-anchor="middle" font-size="12">'+n+'</text>'+
   (label?'<text y="26" text-anchor="middle" font-size="10.5" fill="#44607a" style="pointer-events:none">'+esc(label)+'</text>':'')+'</g>';},
 /* สีตามสถานะ: v เทียบช่วง [goodLo,goodHi,warnHi] → เขียว/ส้ม/แดง */
 band:function(v,goodLo,goodHi,warnHi){if(!isFinite(v))return '#9db8c8';
   if(v>=goodLo&&v<=goodHi)return '#16a34a';if(v<=warnHi)return '#F2A33A';return '#dc2626';},
 heat:function(t,t0,t1){var r=Math.max(0,Math.min(1,(t-t0)/((t1-t0)||1)));
   return 'rgb('+Math.round(70+r*185)+','+Math.round(130-r*60)+','+Math.round(200-r*160)+')';},
 defs:'<defs>'+
  '<linearGradient id="tsSteel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8eef3"/><stop offset="1" stop-color="#aebdc9"/></linearGradient>'+
  '<linearGradient id="tsWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4ea"/><stop offset="1" stop-color="#2f7fb5"/></linearGradient>'+
  '<linearGradient id="tsHotW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6b26b"/><stop offset="1" stop-color="#e06666"/></linearGradient>'+
  '<linearGradient id="tsAir" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bfe3f7"/><stop offset="1" stop-color="#7cc4ea"/></linearGradient>'+
  '</defs>'
};

/* ───────────────── TE_SCENE ───────────────── */
var REG={};
var TE_SCENE={
 _ver:'TE_SCENE r1-2569', k:k, NS:NS,
 reg:function(id,def){REG[id]=def;return def;},
 get:function(id){return REG[id];},
 mount:function(host,id,opts){injectCss();applyAnim();var def=REG[id];if(!def||!host)return null;
   host.classList.add('te-scene','te-uix');host.setAttribute('data-scene',id);
   host.innerHTML=def.build(k,opts||{});
   host.addEventListener('click',function(e){var h=e.target.closest('.tsHot');if(!h)return;
     host.querySelectorAll('.tsHot').forEach(function(x){x.classList.toggle('on',x===h);});
     host.dispatchEvent(new CustomEvent('te-hotspot',{detail:{group:h.getAttribute('data-g')},bubbles:true}));});
   host._sceneDef=def;return host;},
 update:function(host,vals){if(!host||!host._sceneDef||!host._sceneDef.update)return;host._sceneDef.update(host,vals||{},k);},
 setActive:function(host,g){if(!host)return;host.querySelectorAll('.tsHot').forEach(function(x){x.classList.toggle('on',x.getAttribute('data-g')===g);});},
 snapshot:function(host){var svg=host&&host.querySelector('svg');if(!svg)return '';var c=svg.cloneNode(true);
   c.querySelectorAll('[class*="ts"]').forEach(function(e){e.style&&(e.style.animation='none');});
   c.removeAttribute('width');c.setAttribute('style','width:100%;max-width:760px');
   return '<div class="te-scene still">'+c.outerHTML+'</div>';},
 /* [F4 10 พ.ย. 2569] ภาพนิ่งของ scene ลงส่วนรายงาน: วางเป็น figure.te-uix ต่อท้าย afterEl (อยู่นอก afterEl จึงไม่หายเมื่อรายงานถูกเขียนใหม่)
    อัปเดตเองเมื่อ scene หรือรายงานเปลี่ยน · id ในสำเนาเติม _rp กันชนกับภาพสด · ตอนพิมพ์ซ่อนภาพสด (te-norep) เหลือภาพนิ่งใบเดียว
    cap = [ไทย, อังกฤษ] */
 toReport:function(host,afterEl,cap){var self=this;if(!host||!afterEl||host._rpFig)return null;
   var fig=document.createElement('figure');fig.className='te-uix te-repfig';afterEl.parentNode.insertBefore(fig,afterEl.nextSibling);
   host._rpFig=fig;host.classList.add('te-norep');var tm=null;
   function draw(){tm=null;var h=self.snapshot(host);if(!h){fig.style.display='none';return;}
     h=h.replace(/\bid="([^"]+)"/g,'id="$1_rp"').replace(/url\(#([^)]+)\)/g,'url(#$1_rp)').replace(/href="#([^"]+)"/g,'href="#$1_rp"').replace(/<animate[^>]*\/>|<animate[\s\S]*?<\/animate[^>]*>/g,'');
     fig.style.display='';fig.innerHTML=h+'<figcaption>'+((isEn()?cap&&cap[1]:cap&&cap[0])||'')+'</figcaption>';}
   function later(){if(!tm)tm=setTimeout(draw,150);}
   try{var mo=new MutationObserver(later);mo.observe(host,{subtree:true,childList:true,attributes:true,characterData:true});
     mo.observe(afterEl,{childList:true});}catch(e){}
   document.addEventListener('te-lang',function(){setTimeout(later,120);});later();return fig;},
 setAnim:function(on){animOn=!!on;applyAnim();},
 allowAnim:function(tier){try{if(window.TE&&TE.TIER&&TE.TIER.can)return TE.TIER.can(tier,'ui.animation');}catch(e){}return true;},
 /* ทำผังนิ่งให้ไหล: วางเส้นประวิ่งทับ line/path/polyline ที่เป็นท่อ (วาดตามทิศการไหลอยู่แล้ว)
    o: {minW:ความหนาขั้นต่ำที่ถือเป็นท่อ, color, opacity, skip:fn(el)->true=ข้าม} */
 flowify:function(svg,o){o=o||{};if(!svg||svg.getAttribute('data-flowify'))return 0;
  injectCss();applyAnim();svg.setAttribute('data-flowify','1');
  var holder=svg.closest&&svg.closest('.te-scene')?null:(svg.parentElement&&svg.parentElement.classList.add('te-scene'));
  var minW=o.minW==null?2.2:o.minW,n=0;
  [].slice.call(svg.querySelectorAll('line,path,polyline')).forEach(function(L){
    if(L.closest('defs,marker'))return;
    if(o.skip&&o.skip(L))return;
    var w=parseFloat(L.getAttribute('stroke-width')||getComputedStyle(L).strokeWidth||0);
    var st=L.getAttribute('stroke')||'';
    if(!(w>=minW)||!st||st==='none')return;
    if((L.getAttribute('fill')||'none')!=='none'&&L.tagName!=='line')return;
    var d;
    if(L.tagName==='line'){var x1=+L.getAttribute('x1'),y1=+L.getAttribute('y1'),x2=+L.getAttribute('x2'),y2=+L.getAttribute('y2');
      if(Math.abs(x1-x2)<1&&Math.abs(y1-y2)<1)return;d='M'+x1+','+y1+' L'+x2+','+y2;}
    else if(L.tagName==='polyline'){var p=(L.getAttribute('points')||'').trim();if(!p)return;d='M'+p.replace(/\s+/g,' L');}
    else d=L.getAttribute('d');
    if(!d)return;
    try{if(L.getTotalLength&&L.getTotalLength()<14)return;}catch(e){}
    var t=document.createElementNS(NS,'path');
    t.setAttribute('d',d);t.setAttribute('class','tsP tsPd te-uix');
    t.setAttribute('stroke',o.color||'#ffffff');t.setAttribute('stroke-opacity',o.opacity==null?'.8':o.opacity);
    t.setAttribute('stroke-width',Math.max(1.2,w*0.42));t.setAttribute('fill','none');
    if(L.getAttribute('transform'))t.setAttribute('transform',L.getAttribute('transform'));
    t.style.setProperty('--spd',(1.2+Math.random()*0.5).toFixed(2)+'s');
    t.style.pointerEvents='none';
    L.parentNode.insertBefore(t,L.nextSibling);n++;});
  return n;}
};

/* ───────────────── TE_HELP — ⓘ รายช่อง ───────────────── */
/* โครง: key → {t:ชื่อ, w:วัดที่ไหน, n:ค่าปกติ, f:ไม่มีให้ใช้} — ข้อความรอ อ.หนึ่ง ตรวจก่อนเผยแพร่จริง */
var DICT={
 o2:{t:'O₂ ในไอเสีย (%)',w:'วัดที่ทางออกไอเสียก่อน economizer ด้วย flue gas analyzer',n:'เชื้อเพลิงแข็ง 4–8 % · น้ำมัน 3–5 % · ก๊าซ 2–4 %',f:'ใช้ 6 % (เชื้อเพลิงแข็ง) แล้วหมายเหตุว่าเป็นค่าสมมติฐาน'},
 co:{t:'CO ในไอเสีย (ppm)',w:'วัดพร้อม O₂ จุดเดียวกัน',n:'ก๊าซ/น้ำมัน < 200 ppm · ชีวมวลเป้าปฏิบัติ ≤ 400–500 ppm (งานตรวจวัดจริง)',f:'ก๊าซ/น้ำมันใช้ 0–50 · ชีวมวลใช้ 200–400'},
 tg:{t:'อุณหภูมิไอเสีย Tg (°C)',w:'วัดที่ปล่องหลังอุปกรณ์แลกเปลี่ยนความร้อนตัวสุดท้าย',n:'150–250 °C · สูงกว่า 250 น่าติด economizer',f:'อ่านจากเกจหน้าปล่องหรือ DCS'},
 ta:{t:'อุณหภูมิอากาศเข้า Ta (°C)',w:'วัดที่ปากทางเข้าพัดลมอากาศเผาไหม้',n:'30–35 °C ในไทย',f:'ใช้ 32 °C'},
 tamb:{t:'อุณหภูมิแวดล้อม (°C)',w:'วัดใกล้อุปกรณ์ ในที่ร่ม',n:'30–35 °C',f:'ใช้ 32 °C',e:'วัดหน้างาน 14:00 ได้ 34.5 → กรอก 34.5'},
 steamP:{t:'ความดันไอน้ำ (bar g)',w:'เกจที่ header หรือหน้าหม้อไอน้ำ',n:'ตามพิกัดเครื่อง เช่น 8–10 bar g',f:'อ่านจากเกจหน้าเครื่อง'},
 steamT:{t:'อุณหภูมิไอน้ำ (°C)',w:'หัววัดที่ท่อไอน้ำออก (ถ้าเป็นไอดงเท่านั้น)',n:'ไออิ่มตัวไม่ต้องกรอก ระบบคิดจากความดัน',f:'เว้นว่างถ้าเป็นไออิ่มตัว',e:'ไออิ่มตัว 10 barg เว้นว่าง · superheat กรอกเช่น 220'},
 ws:{t:'อัตราผลิตไอน้ำ (t/h)',w:'มิเตอร์ไอน้ำ หรือประเมินจากน้ำป้อน',n:'40–90 % ของพิกัด',f:'ใช้ชั่วโมงผลิต × ภาระเฉลี่ยจากบันทึกหม้อไอน้ำ'},
 fw:{t:'อุณหภูมิน้ำป้อน (°C)',w:'หัววัดที่ถัง feed water หรือทางเข้า economizer',n:'มี condensate กลับ 60–90 °C (ถังป้อนควร ≥ 85 °C) · ไม่มี 30–35 °C',f:'deaerator แบบมีแรงดันใช้ 105 °C · ถังเปิดใช้ 85 °C'},
 fuelF:{t:'อัตราใช้เชื้อเพลิง (kg/h)',w:'จากสเกลป้อน, จำนวนรอบรถตัก หรือยอดซื้อรายเดือน ÷ ชั่วโมงเดิน',n:'—',f:'ยอดซื้อรายเดือน ÷ ชั่วโมงเดินเครื่อง',e:'หม้อไอน้ำไม้สับ 10 t/h ไอน้ำ ≈ 2,300–2,600 kg/h'},
 moist:{t:'ความชื้นเชื้อเพลิง M (%)',w:'อบตัวอย่างหรือใช้ค่าจากผู้ขาย',n:'ไม้สับ 35–50 · กะลาปาล์ม 15–25 · แกลบ 8–12',f:'ใช้ค่ากลางของชนิดเชื้อเพลิงจากคลัง'},
 hrs:{t:'ชั่วโมงทำงาน (h/ปี)',w:'จากบันทึกเดินเครื่องหรือกะการผลิต',n:'1 กะ≈2,000 · 2 กะ≈4,000 · 24 ชม.≈8,000',f:'ใช้ 8,000 สำหรับโรงงานเดิน 24 ชม.',e:'2 กะ 6 วัน/สัปดาห์ → กรอก 5,000'},
 priceE:{t:'ค่าไฟฟ้า (฿/kWh)',w:'บิลการไฟฟ้า: ค่าไฟเฉลี่ย = ยอดจ่าย ÷ หน่วย',n:'3.5–4.5 ฿/kWh',f:'ใช้ 4.0 ฿/kWh',e:'บิล กฟภ. TOU: (ค่าพลังงาน+demand+Ft) ÷ kWh → เช่น 4.2'},
 priceF:{t:'ราคาเชื้อเพลิง (฿/kg)',w:'ใบส่งของหรือสัญญาซื้อ',n:'ประมาณการ พ.ย. 2569: รากไม้ 1.0–1.3 · ไม้สับ 1.5–2.0 · กะลา 2.5–4 · wood pellet 3.5–4.0 · ถ่านหิน 6.0–6.5 ฿/kg',f:'ปรับตามใบส่งของจริง — ราคาผันผวนตามฤดู/ภาค'},
 kw:{t:'กำลังไฟฟ้า (kW)',w:'วัดด้วย power meter ที่ตู้ MCC หรืออ่านจากมิเตอร์',n:'—',f:'ใช้ A×V×√3×PF ถ้ามีแค่แอมป์มิเตอร์'},
 pf:{t:'Power Factor',w:'จากบิลไฟฟ้าหรือ power meter',n:'> 0.85 จึงไม่โดนค่าปรับ (กฟภ. คิด 56.07 ฿/kvar ส่วนที่ kvar สูงสุดเกิน 61.97 % ของ kW สูงสุด)',f:'ดูในบิลการไฟฟ้า ช่อง kVar'},
 thd:{t:'THD (%)',w:'วัดด้วย power quality analyzer ที่บัสหลัก',n:'PCC 1–69 kV: THDv < 5 % (แรงต่ำ ≤ 1 kV: 8 %) · กระแสเป็น TDD ตาม Isc/IL ทั่วไป 5–15 %',f:'ต้องวัดจริง ไม่ควรสมมติ'},
 flow:{t:'อัตราการไหล (m³/h)',w:'มิเตอร์วัดการไหล หรือ ultrasonic clamp-on',n:'—',f:'ใช้พิกัดปั๊ม × % วาล์วเปิด (หยาบ)',e:'ปั๊มหอผึ่ง chiller 500 TR ≈ 300–380 m³/h'},
 head:{t:'เฮดปั๊ม (m)',w:'เกจความดันหน้า–หลังปั๊ม: ΔP(bar)×10.2',n:'—',f:'อ่านจาก nameplate ที่จุดทำงานออกแบบ',e:'ระบบน้ำหล่อเย็นโรงงานชั้นเดียว ≈ 20–30 m'},
 dt:{t:'ΔT น้ำเย็น (°C)',w:'อุณหภูมิน้ำกลับ − น้ำจ่าย ที่ chiller',n:'ออกแบบ 5–7 °C · ต่ำกว่า 3 คือ Low ΔT',f:'วัดด้วยหัววัดแปะท่อ (ติดฉนวนทับ)'},
 kwrt:{t:'kW/RT',w:'กำลังไฟ chiller ÷ ตันความเย็นที่ทำได้จริง',n:'water-cooled centrifugal ใหม่ 0.50–0.60 · เกิน 0.8 ควรตรวจ · air-cooled ใช้เกณฑ์แยก ≈ 1.0–1.2',f:'คำนวณจาก kW และ Q ที่วัดได้'},
 appr:{t:'Approach หอผึ่งน้ำ (°C)',w:'อุณหภูมิน้ำออกหอ − กระเปาะเปียกอากาศ',n:'3–5 °C · เกิน 7 แปลว่าหอเสื่อม',f:'วัดกระเปาะเปียกด้วย sling psychrometer'},
 range:{t:'Range หอผึ่งน้ำ (°C)',w:'น้ำเข้าหอ − น้ำออกหอ',n:'4–6 °C ตามภาระ',f:'—'},
 pdisc:{t:'ความดันจ่ายลม (bar g)',w:'เกจที่ header ลมอัดหลังถังพัก',n:'6–7 bar g · ทุก 1 bar ที่ลดได้ ≈ ประหยัด 7 %',f:'อ่านเกจหน้าเครื่อง',e:'เกจ header อ่าน 7.0 ขณะโหลดเต็ม → กรอก 7.0'},
 pdp:{t:'Pressure Dew Point (°C)',w:'dew point meter หลัง dryer',n:'refrigerated 3–10 °C · desiccant −20 ถึง −40',f:'ใช้สเปก dryer'},
 leak:{t:'อัตรารั่วลมอัด (%)',w:'ทดสอบ load/unload ช่วงหยุดผลิต: %รั่ว = T_load/(T_load+T_unload)',n:'โรงงานดูแลดี < 10 % · ไม่ดูแล 20–30 % (US DOE)',f:'ทดสอบคืนวันหยุด 30 นาที'},
 effm:{t:'ประสิทธิภาพมอเตอร์ (%)',w:'nameplate หรือตาราง IE class',n:'IEC 60034-30-1 (4 โพล): 22 kW IE1≈90 · IE3≈93 % · 55 kW IE1≈92.1 · IE3≈94.6 %',f:'ใช้ตาราง IE ตามขนาดและรุ่นปี'},
 load:{t:'โหลดแฟกเตอร์ (%)',w:'kW ที่วัด ÷ kW พิกัด',n:'มอเตอร์ควร 60–90 %',f:'วัดแอมป์เทียบพิกัด (หยาบ)'},
 condRet:{t:'Condensate กลับ (%)',w:'ปริมาณน้ำร้อนกลับถัง feed ÷ น้ำป้อนทั้งหมด',n:'ควร > 60 % ถ้าโรงงานไม่ปนเปื้อน',f:'ประเมินจากจำนวนจุดที่ต่อท่อกลับ'},
 blow:{t:'โบลว์ดาวน์ (%)',w:'จาก TDS น้ำหม้อ/น้ำป้อน หรือเวลาที่เปิดวาล์ว',n:'3–8 %',f:'ใช้ TDS: %BD = TDSfw/(TDSb−TDSfw)×100'},
 orif:{t:'ขนาดรูกับดักไอน้ำ (mm)',w:'สเปกกับดักหรือตารางผู้ผลิต',n:'กับดักโรงงานทั่วไป 3–6 mm',f:'ใช้ 3 mm ถ้าไม่ทราบ (ค่าปลอดภัย)'},
 u:{t:'ค่า U (W/m²K)',w:'คำนวณย้อนจาก Q, พื้นที่ และ LMTD ที่วัดได้',n:'ลดลง > 20 % จากตอนสะอาด ควรล้าง',f:'ใช้ค่าตอน commissioning เป็นฐาน'},
 copN:{t:'COP ระบบทำความเย็น',w:'ความเย็นที่ทำได้ (kW) ÷ ไฟฟ้าที่ใช้ (kW)',n:'NH₃ อุตสาหกรรม 2.5–4.5 ตามอุณหภูมิ',f:'วัด kW และประเมิน Q จากภาระ'},
 wob:{t:'Wobbe Index',w:'คำนวณจากองค์ประกอบก๊าซ (ใบ CoA)',n:'±5 % จากค่าออกแบบหัวเผา',f:'ขอ CoA จากผู้ส่งก๊าซ'},
 lrad:{t:'สูญเสียผิวเปลือก Lrad (%)',w:'ค่าอ้างอิงตามขนาดหม้อไอน้ำ (ABMA) หรือวัดอุณหภูมิผิวจริง',n:'หม้อ ~10 t/h ≈ 0.8–2 % (โหลดต่ำค่ายิ่งสูง · BS 845 ให้ ≤ 1 % ที่โหลดเต็ม)',f:'ใช้ 1–1.5 % แล้วติดสถานะ "ค่าอ้างอิง"'},
 cref:{t:'คาร์บอนในเถ้า (%)',w:'เก็บตัวอย่างเถ้าส่งแล็บ (LOI)',n:'เชื้อเพลิงปนไปกับเถ้าไม่ควรเกิน 5 % (เกณฑ์ Triple E) · FB มัก 1–5 % · ตะกรับพบได้ถึง 15 % = โอกาสปรับแต่ง',f:'ใช้ 5 % แล้วหมายเหตุ'},
 cap:{t:'เงินลงทุน (บาท)',w:'ใบเสนอราคาหรือประมาณการ',n:'—',f:'ใส่ประมาณการหยาบแล้วติดหมายเหตุ',e:'VSD 75 kW พร้อมติดตั้ง ≈ 150,000–250,000 บาท'},
 life:{t:'อายุมาตรการ (ปี)',w:'อายุอุปกรณ์หลักของมาตรการ',n:'ฉนวน 5–10 · VSD 10 · หัวเผา 10–15',f:'ใช้ 10 ปีเป็นค่ากลาง'}
};
var hpop=null;
function hideHp(){if(hpop){hpop.remove();hpop=null;}}
function showHp(btn,key){hideHp();var d=DICT[key];if(!d)return;injectCss();_lastHp={btn:btn,key:key};
 if(isEn()&&!window.TE_HELP_EN){try{loadEn();}catch(e){}}  /* [R7] เปิด ⓘ ก่อนคำแปลมาถึง → เปิดใหม่อัตโนมัติเมื่อโหลดเสร็จ */
 if(isEn()){var en=(window.TE_HELP_EN_CARD&&TE_HELP_EN_CARD[key])||(window.TE_HELP_EN&&TE_HELP_EN[key]);if(en)d=en;}
 hpop=document.createElement('div');hpop.className='te-hpop te-uix';
 hpop.innerHTML='<div class="hT">'+esc(d.t)+'</div>'+
  '<div class="hRow"><span class="ic">📍</span><span><b>'+L('where','วัดที่ไหน:')+'</b> '+esc(d.w)+'</span></div>'+
  (d.n&&d.n!=='—'?'<div class="hRow"><span class="ic">📏</span><span><b>'+L('typical','ค่าปกติ:')+'</b> '+esc(d.n)+'</span></div>':'')+
  (d.f&&d.f!=='—'?'<div class="hRow"><span class="ic">🧭</span><span><b>'+L('nodata','ถ้าไม่มีข้อมูล:')+'</b> '+esc(d.f)+'</span></div>':'')+
  (d.e?'<div class="hRow"><span class="ic">✏️</span><span><b>'+L('example','ตัวอย่างการกรอก:')+'</b> '+esc(d.e)+'</span></div>':'');
 document.body.appendChild(hpop);
 var r=btn.getBoundingClientRect(),pw=hpop.offsetWidth,ph=hpop.offsetHeight;
 var x=Math.min(Math.max(8,r.left-10),innerWidth-pw-8), y=r.bottom+8; if(y+ph>innerHeight-8)y=r.top-ph-8;
 hpop.style.left=x+'px';hpop.style.top=Math.max(8,y)+'px';}
document.addEventListener('click',function(e){if(!e.target.closest||(!e.target.closest('.te-hbtn')&&!e.target.closest('.te-hpop')))hideHp();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')hideHp();});
var TE_HELP={
 _ver:'TE_HELP r2-2569', DICT:DICT,
 set:function(d){for(var kk in d)DICT[kk]=d[kk];},
 has:function(key){return !!DICT[key];},
 mark:function(el,key){if(typeof el==='string')el=document.getElementById(el);if(!el||!DICT[key])return;
  if(el._hbtn)return;injectCss();
  var b=document.createElement('button');b.type='button';b.className='te-hbtn te-uix';b.textContent='i';b.title=L('helpTitle','คำอธิบาย');
  b.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();if(hpop){hideHp();}else showHp(b,key);});
  var lab=el.closest&&el.closest('label');
  var anchor=null;
  if(lab){anchor=lab.querySelector('.unit')||null;if(anchor)lab.insertBefore(b,anchor);else{
    var inp=lab.querySelector('input,select,textarea');if(inp)lab.insertBefore(b,inp);else lab.appendChild(b);}}
  else if(el.previousElementSibling&&/LABEL|SPAN|DIV/.test(el.previousElementSibling.tagName)&&el.previousElementSibling.offsetHeight<40)el.previousElementSibling.appendChild(b);
  else el.parentNode&&el.parentNode.insertBefore(b,el);
  el._hbtn=b;},
 auto:function(map){for(var id in map)TE_HELP.mark(id,map[id]);},
 attach:function(root){(root||document).querySelectorAll('[data-help]').forEach(function(el){TE_HELP.mark(el,el.getAttribute('data-help'));});}
};

/* ───────────────── TE_FR — เปิดครั้งแรกไม่ว่าง ───────────────── */
function lsGet(k2){try{return localStorage.getItem(k2);}catch(e){return null;}}
function lsSet(k2,v){try{localStorage.setItem(k2,v);}catch(e){}}
var frState={};
var TE_FR={
 _ver:'TE_FR r1-2569',
 /* bar(anchor,{key,title,sub,demo,tour,open}) — demo: fn | selector · open: fn | selector · tour: [{sel,text,title}] */
 bar:function(anchor,o){o=o||{};injectCss();if(typeof anchor==='string')anchor=document.querySelector(anchor);if(!anchor)return null;
  var key='teFR_'+(o.key||location.pathname);frState[key]=o;
  if(lsGet(key)&&!o.force)return null;
  var bar=document.createElement('div');bar.className='te-frbar te-uix';
  bar.innerHTML='<div class="t"><b>'+esc(o.title||L('frTitle','ใช้ครั้งแรก?'))+'</b><br>'+esc(o.sub||L('frSub','กดดูตัวอย่างเพื่อเห็นภาพรวมก่อน แล้วค่อยแทนด้วยข้อมูลโรงงานของท่าน'))+'</div>'+
   (o.demo?'<button type="button" class="bDemo">'+L('demo','▶ ดูผลตัวอย่างทันที')+'</button>':'')+
   (o.tour&&o.tour.length?'<button type="button" class="bTour">'+L('tour','✍ กรอกเองทีละขั้น')+'</button>':'')+
   (o.open?'<button type="button" class="bOpen">'+L('open','📂 เปิดไฟล์งาน')+'</button>':'')+
   '<button type="button" class="bX" title="'+L('hide','ซ่อน')+'">✕</button>';
  function run(x){if(typeof x==='function')return x();var el=document.querySelector(x);el&&el.click();}
  var bd=bar.querySelector('.bDemo');if(bd)bd.onclick=function(){run(o.demo);lsSet(key,'1');bar.remove();TE_FR.chip(key);};
  var bt=bar.querySelector('.bTour');if(bt)bt.onclick=function(){bar.remove();TE_FR.tour(o.tour,function(){lsSet(key,'1');TE_FR.chip(key);});};
  var bo=bar.querySelector('.bOpen');if(bo)bo.onclick=function(){run(o.open);lsSet(key,'1');bar.remove();TE_FR.chip(key);};
  bar.querySelector('.bX').onclick=function(){lsSet(key,'1');bar.remove();TE_FR.chip(key);};
  anchor.parentNode.insertBefore(bar,anchor);
  return bar;},
 chip:function(key){injectCss();if(document.querySelector('.te-frchip'))return;
  var c=document.createElement('button');c.type='button';c.className='te-frchip te-uix';c.textContent='?';c.title=L('chip','แนะนำการใช้งาน');
  c.onclick=function(){var o=frState[key]||{};c.remove();try{localStorage.removeItem(key);}catch(e){}
    o.force=true;var firstCard=document.querySelector('.te-frbar-anchor')||document.body.firstElementChild;
    TE_FR.bar(o._anchor||firstCard,o);window.scrollTo({top:0,behavior:'smooth'});};
  document.body.appendChild(c);},
 /* ทัวร์ไฮไลต์ทีละจุด */
 tour:function(steps,done){injectCss();if(!steps||!steps.length){done&&done();return;}
  var i=0,box=document.createElement('div'),tip=document.createElement('div');
  box.className='te-trbox te-uix';tip.className='te-trtip te-uix';
  document.body.appendChild(box);document.body.appendChild(tip);
  function end(){box.remove();tip.remove();done&&done();}
  function show(){var s=steps[i],el=document.querySelector(s.sel);
   if(!el){i++;return i<steps.length?show():end();}
   el.scrollIntoView({behavior:'smooth',block:'center'});
   setTimeout(function(){var r=el.getBoundingClientRect();
    box.style.cssText='left:'+(r.left-6)+'px;top:'+(r.top-6)+'px;width:'+(r.width+12)+'px;height:'+(r.height+12)+'px';
    tip.innerHTML='<div class="n">'+(i+1)+'/'+steps.length+(s.title?' · '+esc(s.title):'')+'</div>'+esc(s.text||'')+
     '<div class="bt"><button type="button" class="sk">'+L('skip','ข้าม')+'</button><button type="button" class="nx">'+(i===steps.length-1?L('done','จบ ✓'):L('next','ถัดไป ›'))+'</button></div>';
    var ty=r.bottom+12;if(ty+tip.offsetHeight>innerHeight-10)ty=Math.max(10,r.top-tip.offsetHeight-12);
    tip.style.left=Math.min(Math.max(10,r.left),innerWidth-320)+'px';tip.style.top=ty+'px';
    tip.querySelector('.nx').onclick=function(){i++;i<steps.length?show():end();};
    tip.querySelector('.sk').onclick=end;},380);}
  show();}
};

/* ───────────────── TE_VERDICT ───────────────── */
var VIC={ok:'✅',warn:'⚠️',bad:'⛔',info:'ℹ️'};
var TE_VERDICT={
 _ver:'TE_VERDICT r1-2569',
 html:function(st,txt){injectCss();return '<div class="te-verd te-uix '+st+'"><span class="ic">'+(VIC[st]||'ℹ️')+'</span><span>'+txt+'</span></div>';},
 put:function(el,st,txt){if(typeof el==='string')el=document.getElementById(el);if(!el)return;
  var v=el.querySelector(':scope > .te-verd');if(v)v.remove();
  el.insertAdjacentHTML('beforeend',TE_VERDICT.html(st,txt));},
 clear:function(el){if(typeof el==='string')el=document.getElementById(el);if(!el)return;
  el.querySelectorAll(':scope > .te-verd').forEach(function(x){x.remove();});}
};

/* ───────────────── ผูก global ───────────────── */
window.TE_SCENE=TE_SCENE;window.TE_HELP=TE_HELP;window.TE_FR=TE_FR;window.TE_VERDICT=TE_VERDICT;
try{if(window.TE&&!TE._locked){TE.SCENE=TE_SCENE;TE.HELP=TE_HELP;TE.FR=TE_FR;TE.VERDICT=TE_VERDICT;}}catch(e){}
if(document.readyState!=='loading'){injectCss();applyAnim();}
else document.addEventListener('DOMContentLoaded',function(){injectCss();applyAnim();});
})();

/* ════════════════════════════════════════════════════════════════════════
   te-scene r2 (7 พ.ย. 2569) — ก้อน R0 ของแผนตรวจแก้เครื่องมือทั้งหมด
   เพิ่ม 3 อย่างโดยไม่แตะโค้ด r1 ข้างบน (ใช้เฉพาะ public API):
   1) TE_PARAM — ค่าร่วมข้ามแท็บ: สืบทอด + แก้ทับรายช่อง (ต้นแบบจาก TH-CAS Rev.03)
   2) TE_HELP.autoByLabel — ผูก ⓘ ให้ช่องที่ป้ายเข้าชุดคำร่วม (ใช้ได้ทั้ง Free/Pro)
   3) TE_FR.autoBar — แถบเปิดครั้งแรกอัตโนมัติ เมื่อหน้าว่างเกินเกณฑ์และมีปุ่มตัวอย่าง
   ปิดทั้งก้อนได้ด้วย window.TE_UX0=false ก่อนโหลดไฟล์นี้
   ════════════════════════════════════════════════════════════════════════ */
(function(){
if(typeof window==='undefined')return;
function $id(x){return document.getElementById(x);}
function en(){try{var l=window.TE_I18N&&TE_I18N.lang;if(typeof l==='function')l=l();return l==='en'||/[?&]lang=en/.test(location.search);}catch(e){return /[?&]lang=en/.test(location.search);}}  /* [EN r2] TE_I18N.lang เป็น getter ไม่ใช่ฟังก์ชัน */

/* ───────────── 1 · TE_PARAM ───────────── */
var P_CSS='.te-inh{display:flex;align-items:center;gap:6px;font-size:.72rem;color:var(--muted,#5b6b7b);margin-top:3px;flex-wrap:wrap}'+
'.te-inh .btn{border:1px solid var(--line,#e2e8f0);background:var(--soft,#f7fafd);color:var(--muted,#5b6b7b);border-radius:7px;padding:1px 7px;font-size:.70rem;cursor:pointer;font-family:inherit}'+
'.te-inh .btn:hover{border-color:var(--accent,#12a4a4);color:var(--accent,#12a4a4)}'+
'.te-inh.ovr{color:var(--warn,#e08a00)}.te-inh.ovr .btn{border-color:var(--warn,#e08a00);color:var(--warn,#e08a00)}'+
'input.te-inherited,select.te-inherited{background:var(--soft,#f7fafd);border-style:dashed}'+
'input.te-overridden,select.te-overridden{border-left:3px solid var(--warn,#e08a00)}'+
'.te-ovrbadge{display:inline-block;margin-left:8px;background:rgba(224,138,0,.18);color:#b36b00;border:1px solid rgba(224,138,0,.5);border-radius:999px;padding:1px 10px;font-size:.74rem;cursor:pointer}';
var TE_PARAM=(function(){
 var DEFS=null,MAP={},OVR={},LAST={},_busy=false,_host=null,_cssDone=false,_lsKey='teOvr_'+location.pathname;
 function css(){if(_cssDone)return;_cssDone=true;var st=document.createElement('style');st.className='te-uix';st.textContent=P_CSS;document.head.appendChild(st);}
 function val(id){var e=$id(id);if(!e)return NaN;var v=parseFloat(e.value);return isFinite(v)?v:NaN;}
 function expect(key,m){var v=val(DEFS[key].own);if(!isFinite(v))return null;return m.to?m.to(v):v;}
 function fmt(v){return Math.round(v*10000)/10000;}
 function T(th,e2){return en()&&e2?e2:th;}
 function chip(id){
   var e=$id(id);if(!e)return null;
   var c=e.parentNode.querySelector('.te-inh');
   if(!c){c=document.createElement('div');c.className='te-inh te-uix';
     c.innerHTML='<span class="txt"></span><button type="button" class="btn"></button>';
     e.parentNode.insertBefore(c,e.nextSibling);
     c.querySelector('.btn').addEventListener('click',function(ev){ev.preventDefault();
       if(OVR[id]){OVR[id]=false;push(MAP[id].key);}else OVR[id]=true;
       paint(id);save();recalc();});}
   return c;}
 function paint(id){
   var r=MAP[id],e=$id(id);if(!r||!e)return;var c=chip(id);if(!c)return;
   var exp=expect(r.key,r.m),cur=parseFloat(e.value);
   var same=(exp===null)||(isFinite(cur)&&Math.abs(cur-exp)<=Math.abs(exp||1)*1e-6);
   if(!OVR[id]&&!same&&isFinite(cur)&&exp!==null)OVR[id]=true;
   e.readOnly=!OVR[id]&&e.tagName==='INPUT';
   if(e.tagName==='SELECT')e.classList.toggle('te-lock',!OVR[id]);
   e.classList.toggle('te-inherited',!OVR[id]);
   e.classList.toggle('te-overridden',!!OVR[id]);
   if(OVR[id]){c.className='te-inh te-uix ovr';
     c.querySelector('.txt').innerHTML='✎ <b>'+T('แก้ทับเฉพาะที่นี่','overridden here')+'</b> · '+r.def.src+' = '+(exp===null?'–':fmt(exp));
     c.querySelector('.btn').textContent='⟲ '+T('ใช้ค่าร่วม','use shared');}
   else{c.className='te-inh te-uix';
     c.querySelector('.txt').innerHTML='↳ '+T('ค่าร่วม จาก ','shared from ')+r.def.src;
     c.querySelector('.btn').textContent='✎ '+T('แก้ทับ','override');}}
 function push(key){var d=DEFS[key];if(!d)return;_busy=true;
   d.mir.forEach(function(m){if(OVR[m.id])return;var e=$id(m.id);if(!e)return;var v=expect(key,m);if(v===null)return;e.value=v;});
   _busy=false;d.mir.forEach(function(m){paint(m.id);});}
 function pushAll(){Object.keys(DEFS).forEach(function(k){push(k);var e=$id(DEFS[k].own);if(e)LAST[k]=e.value;});}
 function syncOwners(){if(!DEFS)return;Object.keys(DEFS).forEach(function(k){var e=$id(DEFS[k].own);if(!e)return;if(LAST[k]!==e.value){LAST[k]=e.value;push(k);}});}
 function save(){try{localStorage.setItem(_lsKey,JSON.stringify(OVR));}catch(e){}}
 function load(){try{var o=JSON.parse(localStorage.getItem(_lsKey)||'{}');if(o&&typeof o==='object')OVR=o;}catch(e){}}
 function recalc(){try{if(typeof window.ensureAllCalc==='function')ensureAllCalc();else if(typeof window.recalcAll==='function')recalcAll();}catch(e){}}
 function count(){return Object.keys(OVR).filter(function(k){return OVR[k]&&MAP[k];}).length;}
 function badge(){
   var n=count(),b=$id('teOvrBadge');
   if(!b){var h=(_host&&$id(_host))||document.querySelector('header')||document.body;if(!h)return;
     b=document.createElement('span');b.id='teOvrBadge';b.className='te-ovrbadge te-uix';h.appendChild(b);}
   b.textContent=n?('✎ '+T('แก้ทับค่าร่วม ','shared overridden: ')+n+T(' ช่อง',' fields')):'';b.hidden=!n;}
 function repaint(){Object.keys(MAP).forEach(paint);badge();}
 return {
  _ver:'TE_PARAM r2-2569',
  /* use(defs,opt) — defs: {key:{own:id, src:'ข้อความที่มา', mir:[{id, to?, back?}]}} · opt.badgeHost: id ที่จะวางป้ายนับ */
  use:function(defs,opt){
    DEFS=defs;_host=opt&&opt.badgeHost;css();load();MAP={};
    Object.keys(DEFS).forEach(function(k){DEFS[k].mir.forEach(function(m){if($id(m.id))MAP[m.id]={key:k,def:DEFS[k],m:m};});});
    Object.keys(DEFS).forEach(function(k){var e=$id(DEFS[k].own);if(!e)return;
      ['input','change'].forEach(function(ev){e.addEventListener(ev,function(){if(!_busy){push(k);badge();}});});});
    Object.keys(MAP).forEach(function(id){var e=$id(id);
      ['input','change'].forEach(function(ev){e.addEventListener(ev,function(){if(_busy)return;OVR[id]=true;paint(id);badge();save();});});});
    pushAll();badge();
    if(typeof window.ensureAllCalc==='function'){var _e=window.ensureAllCalc;
      window.ensureAllCalc=function(){var r=_e.apply(this,arguments);try{syncOwners();repaint();}catch(e){}return r;};}
    return TE_PARAM;},
  sync:syncOwners,repaint:repaint,overrides:function(){return Object.keys(OVR).filter(function(k){return OVR[k]&&MAP[k];}).map(function(id){var r=MAP[id],e=$id(id);return {id:id,value:e?e.value:null,shared:expect(r.key,r.m),src:r.def.src};});}
 };
})();
window.TE_PARAM=window.TE_PARAM||TE_PARAM;
try{if(window.TE&&!TE._locked&&!TE.PARAM)TE.PARAM=TE_PARAM;}catch(e){}

/* ───────────── 2 · คีย์ ⓘ ร่วมชุดใหม่ (รอ อ.หนึ่ง ตรวจ — ดูตารางทวน 7 พ.ย. 2569) ───────────── */
if(window.TE_HELP){
TE_HELP.set({
 rh:{t:'ความชื้นสัมพัทธ์ (%)',w:'hygrometer ณ จุดที่สนใจ หรือสถานีอุตุฯ ที่ใกล้ที่สุดในวันที่วัด',n:'ค่าเฉลี่ยประเทศไทย 65–80 %',f:'70 %'},
 patm:{t:'ความดันบรรยากาศ (bar a)',w:'barometer หรือคิดจากความสูงของที่ตั้ง (ลดราว 0.012 bar ต่อ 100 m)',n:'ระดับน้ำทะเล 1.013 · เชียงใหม่ (310 m) ≈ 0.977',f:'1.013'},
 efgrid:{t:'ค่า EF ไฟฟ้ากริด (kgCO₂e/kWh)',w:'ตารางค่าสัมประสิทธิ์การปล่อย GHG ของ อบก. (TGO) ฉบับล่าสุด',n:'Grid Mix ปัจจุบัน ~0.4750 kgCO₂e/kWh',f:'ใช้ค่าตั้งต้นของเครื่องมือ แล้วระบุปีของตารางในรายงาน'},
 dstat:{t:'สถานะข้อมูล',w:'ระบุว่าเล่มนี้ยืนบนอะไร — ตรวจวัดจริง / ตัวแทนช่วงเวลา / ค่าออกแบบ',n:'งานตรวจประเมินควรเป็น "ตรวจวัดจริง" อย่างน้อยสำหรับ kW และความดัน',f:'เลือก "ค่าออกแบบ" แล้วเขียนข้อจำกัดไว้ท้ายรายงาน'},
 fbasis:{t:'ฐานอ้างอิงของอัตราไหล',w:'ดูหน่วยบนเครื่องวัดหรือใบรายงาน แล้วเลือกให้ตรง',n:'FAD = สภาวะทางเข้าจริง · Nm³ 0 °C · Sm³ 15 °C · ANR 20 °C/65 % · SCFM มีหลายนิยาม ต้องระบุ',f:'ถามผู้วัด — เดาฐานผิดคลาดได้ถึง 8 %'}
});

/* ───────────── 3 · ผูก ⓘ ตามป้าย (ศัพท์ร่วมที่ทุกเครื่องมือใช้) · [EN r2 7 พ.ย. 2569] เพิ่มรูปแบบป้ายภาษาอังกฤษ ให้โหมด EN ได้ ⓘ ครบเท่าโหมดไทย ───────────── */
var LBL_MAP=[
 [/ค่าไฟฟ้า|ค่าไฟ(เฉลี่ย)?\s*\(|บาท\/kWh|electricity\s*(price|cost|tariff)|THB\/kWh|฿\/kWh/i,'priceE'],
 [/ชั่วโมง(ทำงาน|เดิน|ใช้งาน|ผลิต)[^)]*(ปี|yr)|ชั่วโมง\/ปี|(operating|running|production|working)\s*hours[^)]*(year|yr)|hours?\s*(per|\/)\s*(year|yr)|h\/yr/i,'hrs'],
 [/ความชื้นสัมพัทธ์|relative\s*humidity/i,'rh'],
 [/ความดันบรรยากาศ|atmospheric\s*pressure|barometric/i,'patm'],
 [/EF\s*(ไฟฟ้า|กริด)|ค่า\s*EF|emission\s*factor/i,'efgrid'],
 [/อุณหภูมิ(แวดล้อม|อากาศแวดล้อม|ห้อง)\s*\(|(ambient|room)\s*(air\s*)?temperature\s*\(/i,'tamb'],
 [/ราคาเชื้อเพลิง|บาท\/(ตัน|ลิตร|กก|kg)|fuel\s*(price|cost)|THB\/(t|ton|tonne|L|litre|kg)\b/i,'priceF'],
 [/kW\s*วัดจริง|กำลังไฟฟ้าวัดจริง|measured\s*(kW|power)/i,'kw'],
 [/สถานะข้อมูล|data\s*status/i,'dstat'],
 [/ฐาน(ของ)?อัตราไหล|ฐานอ้างอิง.*(ไหล|FAD)|flow\s*(reference\s*)?basis|basis\s*of\s*(the\s*)?(measured\s*)?flow/i,'fbasis']
];
TE_HELP.autoByLabel=function(map){
 map=map||LBL_MAP;var n=0;
 var els=document.querySelectorAll('input[id],select[id]');
 for(var i=0;i<els.length;i++){var e=els[i];
   if(e._hbtn||e.type==='checkbox'||e.type==='file'||e.type==='radio')continue;
   if(e.closest&&(e.closest('table')||e.closest('.te-uix')))continue;
   var l=document.querySelector('label[for="'+e.id+'"]');
   if(!l&&e.parentElement){var p=e.parentElement;for(var k2=0;k2<2&&p&&!l;k2++){l=p.querySelector('label');if(!l)p=p.parentElement;}}
   if(!l)continue;var txt=(l.textContent||'').replace(/\s+/g,' ').trim();
   if(!txt||txt.length>70)continue;
   for(var j=0;j<map.length;j++){if(map[j][0].test(txt)){TE_HELP.mark(e,map[j][1]);n++;break;}}}
 return n;};
}

/* ───────────── 4 · แถบเปิดครั้งแรกอัตโนมัติ ───────────── */
if(window.TE_FR){
(function(){
 var own=false,_bar=TE_FR.bar;
 TE_FR.bar=function(){own=true;return _bar.apply(TE_FR,arguments);};
 TE_FR.autoBar=function(){
  if(own||document.querySelector('.te-frbar'))return null;
  var ins=document.querySelectorAll('input[type=number]');
  if(ins.length<8)return null;
  var blank=0;for(var i=0;i<ins.length;i++){if(!String(ins[i].value||'').trim())blank++;}
  if(blank/ins.length<0.25)return null;
  var demo=null,open=null;
  var bs=document.querySelectorAll('button');
  for(var j=0;j<bs.length;j++){var t=(bs[j].textContent||'');
    if(!demo&&/ตัวอย่าง|example/i.test(t)&&!/ลบ|ล้าง/.test(t))demo=bs[j];
    if(!open&&/เปิดไฟล์|\.tejob|open file/i.test(t)&&!bs[j].hidden)open=bs[j];}
  if(!demo)return null;
  var anchor=document.querySelector('.wrap .card, .card, main, body>div');
  if(!anchor)return null;
  var fn=(location.pathname.split('/').pop()||'page').replace(/\.html?$/,'');
  return _bar.call(TE_FR,anchor,{key:'auto_'+fn,
    title:en()?'First time with this tool?':'ใช้เครื่องมือนี้ครั้งแรก?',
    sub:en()?'Load the example to see the whole picture first, then replace it with your plant data.':'กด "ดูผลตัวอย่าง" เพื่อเห็นภาพรวมก่อน แล้วค่อยแทนด้วยข้อมูลโรงงานของท่าน',
    demo:function(){try{demo.click();}catch(e){}},
    open:open?function(){try{open.click();}catch(e){}}:null});
 };
})();
}

/* ───────────── 5 · เปิดเองเมื่อโหลด (ปิดด้วย window.TE_UX0=false) ───────────── */
function boot(){
 if(window.TE_UX0===false)return;
 try{if(window.TE_HELP&&TE_HELP.autoByLabel)TE_HELP.autoByLabel();}catch(e){}
 try{if(window.TE_FR&&TE_FR.autoBar)TE_FR.autoBar();}catch(e){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,700);});
else setTimeout(boot,700);
})();

/* ═══════════════ TE_GUIDE r1 (7 พ.ย. 2569) — กล่อง "วิธีกรอกทีละขั้น" สำหรับช่องกรอกที่ซับซ้อน ═══════════════
   ที่มา: ผู้ใช้แจ้งว่าถ้าไม่มีพื้นฐาน/ประสบการณ์จะสับสน (เช่น โปรไฟล์ภาระ 24 ชม. ของ TH-CAS)
   TE_GUIDE.add(target, {id, title:{th,en}, steps:[{h:{th,en}, b:{th,en}|function}], live:function(){return html}, open:true})
   - target = element หรือ id · วางกล่องไว้ "ก่อน" target
   - ขั้นใดเป็นฟังก์ชัน → คำนวณใหม่ทุกครั้งที่ refresh (ใช้แสดงตัวอย่างที่ผูกกับค่าที่ผู้ใช้กรอกจริง)
   - เปิดครั้งแรกอัตโนมัติ · ผู้ใช้พับแล้วจำไว้ (localStorage) · สองภาษาตาม TE_I18N
   ═════════════════════════════════════════════════════════════════════════════════════════════════════════ */
(function(){
if(typeof window==='undefined'||window.TE_GUIDE)return;
function en(){try{var l=window.TE_I18N&&TE_I18N.lang;if(typeof l==='function')l=l();return l==='en'||/[?&]lang=en/.test(location.search);}catch(e){return false;}}
function L(o){if(o==null)return '';if(typeof o==='function')return o();if(typeof o==='string')return o;return en()?(o.en||o.th):(o.th||o.en);}
var CSS='.te-gd{border:1px solid #cfe3f3;background:#f6fbff;border-radius:12px;margin:8px 0 10px;font-size:.8rem;line-height:1.55;color:#1f3347}'+
'.te-gd>summary{cursor:pointer;list-style:none;padding:7px 12px;font-weight:700;color:#0b3d91;display:flex;gap:8px;align-items:center}'+
'.te-gd>summary::-webkit-details-marker{display:none}.te-gd>summary .chev{margin-left:auto;font-weight:400;color:#5b6b7b;font-size:.74rem}'+
'.te-gd ol{margin:0;padding:2px 14px 10px 34px}.te-gd li{margin:5px 0}.te-gd li b.h{color:#0b3d91}'+
'.te-gd .live{margin:0 12px 10px;padding:6px 10px;border-radius:8px;background:#fff;border:1px dashed #9cc4e4}'+
'.te-gd table{border-collapse:collapse;margin:4px 0;font-size:.76rem}.te-gd td,.te-gd th{border:1px solid #d7e4ee;padding:3px 7px;text-align:left;vertical-align:top}.te-gd th{background:#eaf3fb}'+
'.te-gd code{background:#eef3f8;border-radius:4px;padding:0 4px;font-size:.76rem}'+
'[data-theme=dark] .te-gd{background:#14212e;border-color:#2b4157;color:#d7e4ee}[data-theme=dark] .te-gd .live{background:#0f1a24}';
var cssDone=false,REG=[];
function css(){if(cssDone)return;cssDone=true;var s=document.createElement('style');s.className='te-uix';s.textContent=CSS;document.head.appendChild(s);}
function key(id){return 'teGd_'+location.pathname+'_'+id;}
function render(r){
  var d=r.el;
  d.querySelector('summary .t').textContent='📘 '+L(r.o.title);
  d.querySelector('summary .chev').textContent=d.open?L({th:'พับเก็บ ▲',en:'collapse ▲'}):L({th:'กดเพื่อดูวิธีกรอก ▼',en:'show how to fill in ▼'});
  var h='';(r.o.steps||[]).forEach(function(s){h+='<li><b class="h">'+L(s.h)+'</b> '+L(s.b)+'</li>';});
  d.querySelector('ol').innerHTML=h;
  var lv=d.querySelector('.live');
  if(r.o.live){var x='';try{x=r.o.live()||'';}catch(e){}lv.innerHTML=x;lv.hidden=!x;}else lv.hidden=true;
}
var TE_GUIDE={
 _ver:'TE_GUIDE r1-2569',
 add:function(target,o){
  if(typeof target==='string')target=document.getElementById(target);
  if(!target||!target.parentNode||!o||!o.id)return null;
  if(document.getElementById('te-gd-'+o.id))return null;
  css();
  var d=document.createElement('details');d.className='te-gd te-uix';d.id='te-gd-'+o.id;
  var st=null;try{st=localStorage.getItem(key(o.id));}catch(e){}
  d.open=st?st==='1':(o.open!==false);
  d.innerHTML='<summary><span class="t"></span><span class="chev"></span></summary><ol></ol><div class="live"></div>';
  (o.before===false?target.parentNode.insertBefore(d,target.nextSibling):target.parentNode.insertBefore(d,target));
  var r={el:d,o:o};REG.push(r);
  d.addEventListener('toggle',function(){try{localStorage.setItem(key(o.id),d.open?'1':'0');}catch(e){}render(r);});
  render(r);return d;},
 refresh:function(){REG.forEach(function(r){try{render(r);}catch(e){}});},
 list:function(){return REG.map(function(r){return r.o.id;});}
};
window.TE_GUIDE=TE_GUIDE;
document.addEventListener('te-lang',function(){setTimeout(TE_GUIDE.refresh,50);});
var t=null;document.addEventListener('input',function(e){if(!REG.length||(e.target&&e.target.closest&&e.target.closest('.te-gd')))return;clearTimeout(t);t=setTimeout(TE_GUIDE.refresh,250);});
})();
