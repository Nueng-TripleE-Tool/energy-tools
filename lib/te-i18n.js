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

var TITLE0=null,DICT={"บัญชี": "Account", "TH-TOH-01 ย้ายไปรวมกับ TH-BLR-01": "TH-TOH-01 merged into TH-BLR-01", "MG-PLT-01 ภาพรวมโรงงาน — Triple E Energy Tools Pro": "MG-PLT-01 Plant Dashboard — Triple E Energy Tools Pro", "EL-MTR-01 ทะเบียนมอเตอร์และ VSD — Triple E Energy Tools Pro": "EL-MTR-01 Motor & VSD Register — Triple E Energy Tools Pro", "TH-BLR-02 ประเมินมาตรการหม้อไอน้ำ — Triple E Energy Tools Pro": "TH-BLR-02 Boiler ECM Assessment — Triple E Energy Tools Pro", "เครื่องมือ Pro · Triple E Energy Tools": "Pro Tools · Triple E Energy Tools", "TH-STM-02 แบบจำลองระบบไอน้ำ (Steam System Model) — Triple E Energy Tools Pro": "TH-STM-02 Steam System Model — Triple E Energy Tools Pro", "TH-BLR-01 ประสิทธิภาพหม้อไอน้ำ — Triple E Energy Tools Pro": "TH-BLR-01 Boiler Efficiency — Triple E Energy Tools Pro", "Hot Air Dryer Assessment — เครื่องมือประเมินประสิทธิภาพเตาอบลมร้อน | Triple E Technology": "Hot Air Dryer Assessment — Hot-Air Dryer Efficiency Tool | Triple E Technology", "Steam Accumulator — ขนาดถังสะสมไอน้ำจากโปรไฟล์โหลด · Triple E Energy Tools Pro": "Steam Accumulator — Accumulator Sizing from Load Profile · Triple E Energy Tools Pro", "Steam &amp; Condensate Suite — 35 ตัวคำนวณท่อ-คอนเดนเสท-วาล์ว · Triple E Energy Tools Pro": "Steam & Condensate Suite — 35 Pipe/Condensate/Valve Calculators · Triple E Energy Tools Pro", "Steam & Condensate Suite — 35 ตัวคำนวณท่อ-คอนเดนเสท-วาล์ว · Triple E Energy Tools Pro": "Steam & Condensate Suite — 35 Pipe/Condensate/Valve Calculators · Triple E Energy Tools Pro", "TH-HWG-01 ย้ายไปรวมกับ TH-BLR-01": "TH-HWG-01 merged into TH-BLR-01", "MG-ECM-01 บัญชีมาตรการอนุรักษ์พลังงาน — Triple E Energy Tools Pro": "MG-ECM-01 ECM Portfolio — Triple E Energy Tools Pro", "Cascade Control Simulator — ตั้งค่าลำดับการทำงานเครื่องอัดอากาศ · หม้อไอน้ำ · เครื่องทำน้ำเย็น | Triple E Technology": "Cascade Control Simulator — Sequencing for Air Compressors · Boilers · Chillers | Triple E Technology", "Baseline Buster — นักล่าสมการพลังงาน · Energy Skills Lab": "Baseline Buster · Energy Skills Lab", "ภารกิจลมเย็น (Psychro Quest) — Energy Skills Lab": "Psychro Quest — Energy Skills Lab", "EF Selector v4.0 — เครื่องมือเลือกค่า Emission Factor (Official TGO Data) | TripleE Technology": "EF Selector v4.0 — Emission Factor Selector (Official TGO Data) | TripleE Technology", "ปราบแอร์ตัวร้าย — Energy Sense Games": "AC Monster Rescue — Energy Sense Games", "Carbon Trader — ภารกิจโรงงานคาร์บอนต่ำ · Energy Skills Lab": "Carbon Trader — Low-Carbon Factory Mission · Energy Skills Lab", "ช่างปลอดภัย LOTO — Energy Skills Lab": "LOTO Safety Tech — Energy Skills Lab", "Process Heating Assessment (PHAST-style) | การประเมินเตาอุตสาหกรรม — Triple E Technology": "Process Heating Assessment (PHAST-style) | Industrial Furnace Assessment — Triple E Technology", "PID Hero — จอมจูนลูปควบคุม · Energy Skills Lab": "PID Hero — Control Loop Tuning · Energy Skills Lab", "ช่างวัดมือทอง — Energy Skills Lab": "Measurement Master — Energy Skills Lab", "โรงงานหรรษา — Energy Sense Games": "Factory Fun — Energy Sense Games", "เครื่องคำนวณการสูญเสียพลังงานในระบบส่งจ่ายสารทำงาน | Distribution System Energy Loss Calculator": "Distribution System Energy Loss Calculator", "Cooling Load & HVAC Selector — โหลดความเย็น เลือกแอร์/ชิลเลอร์ + CDD": "Cooling Load & HVAC Selector — Cooling Load, AC/Chiller Selection + CDD", "เชฟเชื้อเพลิง — Energy Skills Lab": "Fuel Chef — Energy Skills Lab", "เกมนักสืบพลังงาน — Energy Sense Games": "Energy Detective — Energy Sense Games", "Thai Gas Grid — เกมบริหารความมั่นคงก๊าซธรรมชาติไทย | Triple E Energy Tools": "Thai Gas Grid — Energy Security Mission | Triple E Energy Tools", "กัปตันหม้อไอน้ำ — Energy Sense Games": "Boiler Captain — Energy Sense Games", "เกมเมืองคาร์บอนต่ำ — Energy Sense Games": "Low-Carbon City — Energy Sense Games", "ต่อตู้สตาร์ทมอเตอร์ — Energy Skills Lab": "Motor Starter Panel — Energy Skills Lab", "กะเช้าห้องหม้อไอน้ำ — Energy Skills Lab": "Morning Shift in the Boiler Room — Energy Skills Lab", "สงครามพีค — Energy Skills Lab": "Peak Wars — Energy Skills Lab", "ปั๊มพาเหรด — Energy Skills Lab": "Pump Parade — Energy Skills Lab", "หมอเครื่องจักร (Machine Doctor) — Energy Skills Lab": "Machine Doctor — Energy Skills Lab", "ช่างแอร์มือโปร — Energy Skills Lab": "Pro HVAC Tech — Energy Skills Lab", "เกมล่าไอน้ำรั่ว — Energy Sense Games": "Steam Leak Hunt — Energy Sense Games", "Thailand CDD Analyzer — Cooling Degree Days 77 จังหวัด": "Thailand CDD Analyzer — Cooling Degree Days, 77 Provinces", "เกมบ้านประหยัดไฟ — Energy Sense Games": "Energy-Saving Home — Energy Sense Games", "TH-TOH-01 ประสิทธิภาพหม้อต้มน้ำมันร้อน — Triple E Energy Tools Pro": "TH-TOH-01 Thermal Oil Heater Efficiency — Triple E Energy Tools Pro", "TH-BLR-01 (ตัวอย่างหน้าจอ Demo) — Triple E Energy Tools": "TH-BLR-01 (Demo Screen) — Triple E Energy Tools", "TH-HWG-01 ประสิทธิภาพหม้อต้มน้ำร้อน — Triple E Energy Tools Pro": "TH-HWG-01 Hot Water Generator Efficiency — Triple E Energy Tools Pro", "บริการและแพ็กเกจ — Energy Engineering Tools": "Services & Packages — Energy Engineering Tools", "นโยบายความเป็นส่วนตัว — Energy Engineering Tools": "Privacy Policy — Energy Engineering Tools", "สมาชิก Pro · Triple E Energy Tools": "Pro Membership · Triple E Energy Tools"}  /* คำกลาง: ป้าย ⭐ Pro ที่ Worker แทรกทุกการ์ด */,RX=[[/^(.+?) — ย้ายไประดับ Pro \| Triple E Energy Tools$/,'$1 — Moved to Pro | Triple E Energy Tools']],orig=new WeakMap(),origAttr=new WeakMap(),applied=false,obs=null,pending=false;

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
  var w=(root.ownerDocument||root).createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
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
  try{if(!root&&document.title&&hasThai(document.title)){var tt=tr(document.title);if(tt!==document.title){if(TITLE0==null)TITLE0=document.title;document.title=tt;}}}catch(e){}
  applied=true;
}
function revertTh(){
  try{if(TITLE0!=null){document.title=TITLE0;TITLE0=null;}}catch(e){}
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
    /* r5 (6 พ.ย. 2569): ส่งภาษาไปหน้าที่ฝังใน iframe (เช่น Turbine/Air-Con Suite, ECM deep) และหน้าแม่ — ไม่งั้นกด EN แล้วเนื้อหาใน iframe ยังเป็นไทย */
    try{for(var i=0;i<window.frames.length;i++){try{var w=window.frames[i];if(w.TE_I18N&&w.TE_I18N.lang!==v)w.TE_I18N.setLang(v);}catch(e){}}}catch(e){}
    try{if(window.parent&&window.parent!==window){var pw=window.parent;if(pw.TE_I18N&&pw.TE_I18N.lang!==v)pw.TE_I18N.setLang(v);}}catch(e){}
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
/* [EN r3] หน้าต่างรายงาน (window.open + document.write) และไฟล์ดาวน์โหลด (Blob: CSV/HTML/Word) — แปลในโหมด en เท่านั้น */
function trDoc(d){try{
  if(!d||!d.body)return;
  walk(d.body,function(n){var v=n.nodeValue,t2=tr(v,n.parentNode&&n.parentNode.nodeName==='OPTION');if(t2!==v)n.nodeValue=t2;});
  d.body.querySelectorAll('[title],[placeholder],[alt],[aria-label]').forEach(function(el){['title','placeholder','alt','aria-label'].forEach(function(a){var v=el.getAttribute(a);if(v&&hasThai(v)){var t2=tr(v);if(t2!==v)el.setAttribute(a,t2);}});});
  if(d.title&&hasThai(d.title))d.title=tr(d.title);
  try{if(d.documentElement)d.documentElement.lang='en';}catch(e){}
}catch(e){}}
function watchWin(w){
  if(!w)return;var n=0,ob=null;
  (function tick(){
    try{var d=w.document;
      if(d&&d.body&&d.body.childNodes.length){trDoc(d);
        if(!ob&&w.MutationObserver){ob=new w.MutationObserver(function(){if(LANG==='en')trDoc(d);});ob.observe(d.body,{childList:true,subtree:true,characterData:true});}}
    }catch(e){return;}  /* ต่างโดเมน = เลิก */
    if(++n<40)setTimeout(tick,n<10?50:250);
  })();
  try{var d0=w.document,ow=d0.write,oc=d0.close;
    d0.write=function(){var r=ow.apply(d0,arguments);return r;};
    d0.close=function(){var r=oc.apply(d0,arguments);if(LANG==='en')trDoc(d0);return r;};
  }catch(e){}
}
(function(){
  var oo=window.open;
  if(typeof oo==='function')window.open=function(){var w=oo.apply(window,arguments);try{if(LANG==='en')watchWin(w);}catch(e){}return w;};
  var OB=window.Blob;
  if(typeof OB==='function'){
    var NB=function(parts,opt){
      try{
        if(LANG==='en'&&parts&&parts.length){
          var ty=String(opt&&opt.type||'').toLowerCase();
          var isHtml=/html|msword|officedocument\.wordprocessingml|vnd\.ms-excel/.test(ty), isTxt=false;  /* CSV/JSON = ไฟล์ข้อมูลที่การ์ดโหลดกลับได้ (.tejob, TE_ECM, CSV) — ไม่แปล กันค่า option ภาษาไทยเพี้ยนตอนโหลดกลับ */
          if(isHtml||isTxt){
            parts=[].map.call(parts,function(p){
              if(typeof p!=='string'||!hasThai(p))return p;
              if(isHtml&&/<\w/.test(p)&&window.DOMParser){
                try{var full=/<html[\s>]/i.test(p);var dd=new DOMParser().parseFromString(p,'text/html');trDoc(dd);
                  var out=full?(/^\s*<!doctype/i.test(p)?'<!DOCTYPE html>\n':'')+dd.documentElement.outerHTML:dd.body.innerHTML;
                  /* คงหัว XML/Office namespace ของไฟล์ Word: ถ้าหายไปให้คืนแบบแปลรายบรรทัดแทน */
                  if(/xmlns:w=|urn:schemas-microsoft-com/i.test(p)&&!/urn:schemas-microsoft-com/i.test(out))throw 0;
                  return out;}catch(e){}
              }
              if(/json/.test(ty))return p.replace(/"((?:[^"\\]|\\.)*[\u0E00-\u0E7F](?:[^"\\]|\\.)*)"/g,function(m,q){var t=tr(q);return t===q?m:JSON.stringify(t);});
              /* CSV/ข้อความ: แปลทีละช่อง (คั่นด้วย , ; tab) และทีละบรรทัด */
              return p.split('\n').map(function(line){
                if(!hasThai(line))return line;
                var whole=tr(line);if(whole!==line)return whole;
                return line.replace(/("(?:[^"]|"")*"|[^,;\t]+)/g,function(cell){
                  var q=/^".*"$/.test(cell),v=q?cell.slice(1,-1).replace(/""/g,'"'):cell;
                  if(!hasThai(v))return cell;var t=tr(v.trim());if(t===v.trim())return cell;
                  return q?'"'+t.replace(/"/g,'""')+'"':(/[,;\t"]/.test(t)?'"'+t.replace(/"/g,'""')+'"':t);});
              }).join('\n');
            });
          }
        }
      }catch(e){}
      return new OB(parts,opt);};
    NB.prototype=OB.prototype;try{Object.setPrototypeOf(NB,OB);}catch(e){}
    window.Blob=NB;
  }
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
