/* te-i18n.js — ชั้นสลับภาษา TH⇄EN สำหรับเครื่องมือทุกตัว (Free + Pro) · r1 (5 พ.ย. 2569)
   Triple E Energy Tools · ลิขสิทธิ์ อ.หนึ่ง กลับทวี
   หลักการ: ไฟล์เดียวสองภาษา — ข้อความไทยในหน้าเป็นต้นฉบับ, แผนที่คำแปลสลับเป็น EN ที่ชั้น DOM
   ตัวคำนวณ/ตัวเลขไม่ถูกแตะ (กติกา parity: ลำดับตัวเลข TH ต้องเท่า EN ทุกหน้า)

   การใช้ในการ์ด (วางท้ายไฟล์ หลังสคริปต์หลัก):
     <script src="../lib/te-i18n.js"></script>
     <script>TE_I18N.set({
        "ประสิทธิภาพหม้อไอน้ำ":"Boiler Efficiency",
        ...                              // สตริงตรงตัว (exact text-node / placeholder / title / aria-label)
     },[
        [/รั่วรวม/g,"Total leak"],       // (ทางเลือก) กฎ regex สำหรับประโยค dynamic ที่มีตัวเลขปน
        [/บาท\/ปี/g,"THB/yr"]
     ]);</script>

   ลำดับภาษา: ?lang=en|th → localStorage te_lang → 'th'
   การ์ดรุ่นใหม่ที่มีระบบ U.lang (S/T สองภาษาในตัว) : TE_I18N จะ sync ค่าภาษาให้ แล้วไม่ยุ่งกับ DOM ของมัน
   ทุก element ที่โมดูลนี้สร้างติด class "te-uix" */
(function(){
'use strict';
var ATTRS=['placeholder','title','aria-label','data-tip'];
function qlang(){try{var m=location.search.match(/[?&]lang=(en|th)\b/);return m?m[1]:null;}catch(e){return null;}}
function lsGet(){try{return localStorage.getItem('te_lang')||localStorage.getItem('te.lang');}catch(e){return null;}}
function lsSet(v){try{localStorage.setItem('te_lang',v);localStorage.setItem('te.lang',v);}catch(e){}}  /* คีย์เดียวกับ te-ui เพื่อให้สองระบบเห็นภาษาตรงกัน */
var LANG=qlang()||lsGet()||'th';
if(qlang())lsSet(LANG);

var DICT={"บัญชี":"Account"}  /* คำกลาง: ป้าย ⭐ Pro ที่ Worker แทรกทุกการ์ด */,RX=[],orig=new WeakMap(),origAttr=new WeakMap(),applied=false,obs=null,pending=false;

function hasThai(s){return /[฀-๿]/.test(s);}
function tr(s,allowFb){
  if(!s)return s;
  var t=s.trim();
  if(!hasThai(t))return s;
  if(DICT[t]!=null)return s.replace(t,DICT[t]);
  var out=s,hit=false;
  for(var i=0;i<RX.length;i++){var r=RX[i];
    if(r[0].test(out)){out=out.replace(r[0],r[1]);hit=true;}
    r[0].lastIndex=0;}
  if(!hit&&allowFb&&FALLBACK.test(t)){out=s.replace(t,t.replace(FALLBACK,'$2'));hit=true;}
  return hit?out:s;
}
/* fallback กลาง (เฉพาะข้อความใน <option> เท่านั้น — กันตัดประโยคทั่วไป): ป้ายสองภาษา "ไทย — English" (เช่น dropdown คลังเชื้อเพลิง) → แสดงเฉพาะส่วน English
   ใช้เมื่อไม่มีคำแปลเฉพาะในการ์ดเท่านั้น · ฝั่งขวาต้องขึ้นต้นด้วยอักษรละตินและไม่มีอักษรไทย */
var FALLBACK=/^([^—]*[\u0E00-\u0E7F][^—]*) — ([A-Za-z0-9(][^\u0E00-\u0E7F]*)$/;
function walk(root,fn){
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
    var p=n.parentNode;if(!p)return NodeFilter.FILTER_REJECT;
    var tg=p.nodeName;if(tg==='SCRIPT'||tg==='STYLE'||tg==='NOSCRIPT')return NodeFilter.FILTER_REJECT;
    return hasThai(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;}},false);
  var list=[];while(w.nextNode())list.push(w.currentNode);
  list.forEach(fn);
}
function applyEn(root){
  walk(root||document.body,function(n){
    var v=n.nodeValue,t2=tr(v,n.parentNode&&n.parentNode.nodeName==='OPTION');
    if(t2!==v){orig.set(n,v);n.nodeValue=t2;}  /* เก็บต้นฉบับไทยล่าสุดเสมอ (การ์ดเปลี่ยนข้อความเดิมเป็นไทยชุดใหม่ได้) */
  });
  var SEL='input,textarea,[title],[aria-label],[data-tip],button,option,optgroup,img[alt]';
  var els=[].slice.call((root||document).querySelectorAll(SEL));if(root&&root.matches&&root.matches(SEL))els.push(root);
  els.forEach(function(el){
    ATTRS.concat(['alt','value','label']).forEach(function(a){
      if(a==='value'&&!(el.tagName==='INPUT'&&/button|submit/.test(el.type||'')))return;
      if(a==='label'&&el.tagName!=='OPTGROUP')return;  /* หัวกลุ่มใน dropdown */
      var v=el.getAttribute&&el.getAttribute(a);if(!v||!hasThai(v))return;
      var t2=tr(v);if(t2!==v){
        var m=origAttr.get(el)||{};if(m[a]==null){m[a]=v;origAttr.set(el,m);}
        el.setAttribute(a,t2);}
    });});
  applied=true;
}
function revertTh(){
  walk(document.body,function(n){if(orig.has(n))n.nodeValue=orig.get(n);});
  document.querySelectorAll('input,textarea,[title],[aria-label],[data-tip],button,option,optgroup,img[alt]').forEach(function(el){
    var m=origAttr.get(el);if(!m)return;
    for(var a in m)el.setAttribute(a,m[a]);
  });
  /* text node ที่ถูก re-render จะเป็นไทยอยู่แล้ว */
  applied=false;
}
function schedule(){
  if(LANG!=='en'||pending)return;pending=true;
  /* r2: rAF หยุดในแท็บพื้นหลัง/iframe ที่ซ่อน — ใช้ setTimeout คู่ ใครถึงก่อนทำ */
  var ran=false;function run(){if(ran)return;ran=true;pending=false;try{applyEn();}catch(e){}}
  try{requestAnimationFrame(run);}catch(e){}setTimeout(run,60);
}
function trNode(n){var v=n.nodeValue;if(!v||!hasThai(v))return;var p=n.parentNode;if(!p)return;var tg=p.nodeName;if(tg==='SCRIPT'||tg==='STYLE'||tg==='NOSCRIPT')return;
  var t2=tr(v,tg==='OPTION');if(t2!==v){orig.set(n,v);n.nodeValue=t2;}}
function startObs(){
  if(obs)return;
  /* r3: แปลทันทีใน callback (microtask — ก่อนเบราว์เซอร์วาดจอ) → ไม่กะพริบไทย/อังกฤษในเกม/การ์ดที่เขียนข้อความทุกเฟรม */
  obs=new MutationObserver(function(ms){
    if(LANG!=='en')return;
    for(var i=0;i<ms.length;i++){var m=ms[i];
      try{
        if(m.type==='characterData'){trNode(m.target);continue;}
        if(m.type==='attributes'){var v=m.target.getAttribute&&m.target.getAttribute(m.attributeName);if(v&&hasThai(v)&&m.target.isConnected)applyEn(m.target.parentNode||m.target);continue;}
        for(var j=0;j<m.addedNodes.length;j++){var a=m.addedNodes[j];if(!a.isConnected)continue;
          if(a.nodeType===3)trNode(a);else if(a.nodeType===1)applyEn(a);}
      }catch(e){}
    }
  });
  obs.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS.concat(['alt','value','label'])});
}

/* ชิปสลับภาษา */
function chip(){
  if(document.getElementById('teLangChip'))return;
  if(document.querySelector('.te-langsw'))return;    /* การ์ดที่ mount สวิตช์ภาษาของ te-ui แล้ว ไม่ซ้ำ */
  var b=document.createElement('div');b.id='teLangChip';b.className='te-uix';b.setAttribute('role','group');b.setAttribute('aria-label','ภาษา / Language');
  b.style.cssText='position:fixed;left:14px;bottom:16px;z-index:99970;display:flex;align-items:center;gap:2px;background:#fff;border:2px solid #0d9488;border-radius:999px;padding:3px;box-shadow:0 4px 14px rgba(15,42,74,.28);font:700 14px/1 system-ui,"Sarabun",sans-serif';
  b.innerHTML='<span style="padding:0 6px 0 8px;font-size:16px" aria-hidden="true">🌐</span>'+
    '<button type="button" data-l="th" style="border:0;border-radius:999px;padding:7px 12px;cursor:pointer;font:inherit">ไทย</button>'+
    '<button type="button" data-l="en" style="border:0;border-radius:999px;padding:7px 12px;cursor:pointer;font:inherit">EN</button>';
  [].forEach.call(b.querySelectorAll('button'),function(x){x.onclick=function(){var v=x.getAttribute('data-l');if(v===LANG)return;
    try{if(window.U&&U.lang&&typeof U.lang.set==='function'){lsSet(v);U.lang.set(v);return;}}catch(e){}  /* การ์ด te-ui: สลับแบบรีโหลด ป้าย S/T เปลี่ยนครบ */
    if(v==='th'){lsSet('th');try{var u=new URL(location.href);u.searchParams.set('lang','th');location.href=u.toString();return;}catch(e){location.reload();return;}}  /* กลับไทย = โหลดใหม่ (ส่วนที่เครื่องยนต์วาดเป็น EN ไม่มีต้นฉบับให้คืน) */
    TE_I18N.setLang(v);};});
  document.body.appendChild(b);paintChip();
}
function paintChip(){var c=document.getElementById('teLangChip');if(!c)return;
  [].forEach.call(c.querySelectorAll('button'),function(x){var on=x.getAttribute('data-l')===LANG;
    x.style.background=on?'#0d9488':'transparent';x.style.color=on?'#fff':'#0f2a4a';x.setAttribute('aria-pressed',on?'true':'false');
    x.title=x.getAttribute('data-l')==='en'?'Switch to English':'สลับเป็นภาษาไทย';});}
function syncULang(){ /* ห้ามเรียก U.lang.set ที่นี่ — มันรีโหลดหน้า; สองระบบตรงกันผ่าน localStorage/?lang อยู่แล้ว
   แต่ให้ข้อความของเครื่องยนต์ (TE.I18N: QC/disclaimer/วันที่) ตามภาษาเดียวกัน */
  try{if(window.TE&&TE.I18N&&typeof TE.I18N.set==='function')TE.I18N.set(LANG);}catch(e){}
  try{document.documentElement.lang=LANG;}catch(e){}
}

var TE_I18N={
  _ver:'TE_I18N r1-2569',
  get lang(){return LANG;},
  t:function(th,en){return LANG==='en'?(en!=null?en:(DICT[th]!=null?DICT[th]:th)):th;},
  set:function(map,rx){
    for(var k in map)if(map[k])DICT[k.trim()]=map[k];
    (rx||[]).forEach(function(r){RX.push(r);});
    if(window.__teI18nCanvasReset)window.__teI18nCanvasReset();
    function go(){syncULang();chip();startObs();if(LANG==='en')applyEn();}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
  },
  setLang:function(v){
    if(v!=='en'&&v!=='th')return;
    LANG=v;lsSet(v);
    paintChip();
    syncULang();
    if(v==='en')applyEn();else revertTh();
    try{document.dispatchEvent(new CustomEvent('te-lang',{detail:{lang:v}}));}catch(e){}
  },
  apply:function(root){if(LANG==='en')applyEn(root);},
  has:function(k){return k!=null&&DICT[String(k).trim()]!=null;},  /* r3: ให้สคริปต์กลาง (te-insight) เติมเฉพาะคำที่หน้ายังไม่ได้แปลเอง */
  missing:function(){ /* รายการสตริงไทยบนหน้าที่ยังไม่มีคำแปล (ไว้ตรวจงาน) */
    var out={};walk(document.body,function(n){var t=n.nodeValue.trim();
      if(t&&hasThai(t)&&DICT[t]==null){var h=false;RX.forEach(function(r){if(r[0].test(t))h=true;r[0].lastIndex=0;});if(!h)out[t]=(out[t]||0)+1;}});
    return Object.keys(out).sort();
  }
};
window.TE_I18N=TE_I18N;
/* [EN r1] ข้อความ alert/confirm/prompt ของการ์ด — แปลผ่านแผนที่เดียวกันเมื่อเป็นโหมด en */
(function(){
  ['alert','confirm','prompt'].forEach(function(fn){
    var orig=window[fn];if(typeof orig!=='function')return;
    window[fn]=function(msg){
      var a=[].slice.call(arguments);
      try{if(LANG==='en'&&typeof msg==='string'&&hasThai(msg))a[0]=msg.split('\n').map(function(line){return tr(line);}).join('\n');}catch(e){}
      return orig.apply(window,a);};
  });
})();
/* [EN r2] ข้อความที่วาดบน canvas (กราฟ Chart.js, เกม) — แปลตอน fillText/strokeText/measureText เมื่อโหมด en · มี cache กันช้าในเกมที่วาดทุกเฟรม */
(function(){
  var C=window.CanvasRenderingContext2D;if(!C||!C.prototype)return;
  var cache=Object.create(null),n=0;
  window.__teI18nCanvasReset=function(){cache=Object.create(null);n=0;};
  function cv(t){
    if(LANG!=='en'||typeof t!=='string'||!hasThai(t))return t;
    var r=cache[t];if(r!==undefined)return r;
    try{r=tr(t);}catch(e){r=t;}
    if(n<5000){cache[t]=r;n++;}
    return r;}
  ['fillText','strokeText','measureText'].forEach(function(fn){
    var orig=C.prototype[fn];if(typeof orig!=='function')return;
    C.prototype[fn]=function(text){
      if(typeof text==='string'&&LANG==='en'){var a=[].slice.call(arguments);a[0]=cv(text);return orig.apply(this,a);}
      return orig.apply(this,arguments);};
  });
})();
})();
