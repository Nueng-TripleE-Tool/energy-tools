/* te-svg-boiler.js — ผังหม้อไอน้ำ SVG เคลื่อนไหวผูกกับค่าที่กรอก (ชั้น UI · ไม่มีสูตรคำนวณ)
   Triple E Energy Tools Pro/Expert · r1-2569 (5 ต.ค. 2569) · ลิขสิทธิ์ อ.หนึ่ง กลับทวี
   ใช้ร่วมได้กับการ์ดหม้อไอน้ำ/หม้อต้มน้ำมันร้อน/หม้อต้มน้ำร้อน
   API:
     TE_SVG_BOILER.TYPES                       → [{id,label,sub}]
     TE_SVG_BOILER.mount(host, type)            → วาดผังลงใน host คืน {svg, anchors, type}
     TE_SVG_BOILER.update(host, s)              → ปรับภาพเคลื่อนไหวตามสถานะ s:
         {O2, CO_ppm, Tg, Ta, Ws, F, Lrad, EA, still, qc:{group:'ok'|'warn'|'fail'|'empty'}, tags:{group:'ข้อความ'}, active:'group'}
     กลุ่มจุด (hotspot): fuel · air · flue · steam · fw · shell · ash
     คลิกจุด → host ส่ง event 'te-hotspot' (detail.group)
   ภาพวาดเป็นผังทั่วไปเชิงวิศวกรรม (ไม่อ้างอิงยี่ห้อใด) */
var TE_SVG_BOILER=(function(){
  var NS='http://www.w3.org/2000/svg';
  var TYPES=[
    {id:'FT3',label:'ท่อไฟ 3 กลับ',sub:'Fire-tube 3-pass · น้ำมัน/ก๊าซ'},
    {id:'WTG',label:'ท่อน้ำ + ตะกรับโซ่',sub:'Water-tube + chain grate'},
    {id:'HYB',label:'ไฮบริด ท่อน้ำ/ท่อไฟ',sub:'Hybrid water-/fire-tube + chain grate'}
  ];
  var GROUPS={fuel:'เชื้อเพลิง',air:'อากาศเผาไหม้',flue:'ไอเสียที่ปล่อง',steam:'ไอน้ำ',fw:'น้ำป้อน',shell:'ผนัง/ฉนวน',ash:'เถ้า/กาก'};
  var ORDER=['fuel','air','flue','steam','fw','shell','ash'];

  /* ── ชิ้นส่วนกลาง ── */
  function defs(){return '<defs>'+
    '<linearGradient id="bgSteel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe7ee"/><stop offset=".5" stop-color="#b9c7d3"/><stop offset="1" stop-color="#8fa1b0"/></linearGradient>'+
    '<linearGradient id="bgWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4ea"/><stop offset="1" stop-color="#2f7fb5"/></linearGradient>'+
    '<linearGradient id="bgSteam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8fb"/><stop offset="1" stop-color="#dbe8f1"/></linearGradient>'+
    '<linearGradient id="bgFire" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1a10"/><stop offset="1" stop-color="#1c0e09"/></linearGradient>'+
    '<radialGradient id="bgFlame" cx=".5" cy=".85" r=".8"><stop class="fs0" offset="0" stop-color="#fff6c2"/><stop class="fs1" offset=".45" stop-color="#ffb02e"/><stop class="fs2" offset="1" stop-color="#e2461b" stop-opacity=".15"/></radialGradient>'+
    '<radialGradient id="bgFlameH" cx=".1" cy=".5" r=".9"><stop class="fs0" offset="0" stop-color="#fff6c2"/><stop class="fs1" offset=".45" stop-color="#ffb02e"/><stop class="fs2" offset="1" stop-color="#e2461b" stop-opacity=".15"/></radialGradient>'+
    '<linearGradient id="bgGas" gradientUnits="userSpaceOnUse" x1="150" y1="0" x2="900" y2="0"><stop class="gs0" offset="0" stop-color="#ff6a2b"/><stop class="gs1" offset="1" stop-color="#d9822b"/></linearGradient>'+
    '<pattern id="bpBrick" width="22" height="12" patternUnits="userSpaceOnUse"><rect width="22" height="12" fill="#b9673f"/><path d="M0 6H22M11 0V6M0 6V12M22 6V12" stroke="#8e4a2b" stroke-width="1.2"/></pattern>'+
    '<pattern id="bpTube" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#9fb3c3"/><rect x="1.5" width="7" height="10" fill="#c9d6e1"/></pattern>'+
    '<marker id="bmArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#3a8fd0"/></marker>'+
    '<marker id="bmArrA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#5b8fa8"/></marker>'+
    '</defs>';}
  function ground(){return '<rect x="0" y="470" width="960" height="50" fill="#eef2f6"/><path d="M0 470H960" stroke="#c4cfd9" stroke-width="2"/>';}
  // เปลวไฟแนวตั้ง (โคนอยู่ล่าง)
  function tongue(cx,by,w,h,i){return '<path class="fl" style="animation-delay:-'+(i*0.17).toFixed(2)+'s" d="M'+(cx-w/2)+' '+by+'C'+(cx-w/2)+' '+(by-h*.45)+' '+(cx-w*.15)+' '+(by-h*.6)+' '+cx+' '+(by-h)+'C'+(cx+w*.2)+' '+(by-h*.6)+' '+(cx+w/2)+' '+(by-h*.45)+' '+(cx+w/2)+' '+by+'Z" fill="url(#bgFlame)"/>';}
  function flamesRow(x0,x1,by,h,n){var o='<g class="flames">',w=(x1-x0)/n*1.5;for(var i=0;i<n;i++){var cx=x0+(i+.5)*(x1-x0)/n;o+=tongue(cx,by,w,h*(0.75+0.25*Math.sin(i*1.7)),i);}return o+'</g>';}
  function puffs(cls,x,y,n,r){var o='<g class="'+cls+'">';for(var i=0;i<n;i++)o+='<circle cx="'+(x+(i%2?6:-6))+'" cy="'+y+'" r="'+r+'" style="animation-delay:-'+(i*0.55).toFixed(2)+'s"/>';return o+'</g>';}
  function bubbles(x0,x1,y0,y1,n){var o='<g class="bub">';for(var i=0;i<n;i++){var x=x0+(x1-x0)*((i*37)%100)/100,y=y1-((i*53)%40);o+='<circle cx="'+x.toFixed(0)+'" cy="'+y+'" r="'+(1.6+(i%3)*.7)+'" style="animation-delay:-'+(i*0.31).toFixed(2)+'s"/>';}return o+'</g>';}
  function wave(x0,x1,y,cls){var d='M'+(x0-60)+' '+y;for(var x=x0-60;x<x1+60;x+=30)d+=' q7.5 -4 15 0 t15 0';return '<path class="'+(cls||'wave')+'" d="'+d+'" fill="none" stroke="#e8f5fd" stroke-width="2" opacity=".85"/>';}
  function pipe(d,w,c){return '<path d="'+d+'" fill="none" stroke="'+(c||'#7d8e9c')+'" stroke-width="'+(w||8)+'" stroke-linejoin="round" stroke-linecap="round"/>';}
  function flow(d,cls,w,c){return '<path class="'+cls+'" d="'+d+'" fill="none" stroke="'+(c||'#fff')+'" stroke-width="'+(w||2.2)+'" stroke-linecap="round"/>';}
  function fan(cx,cy,r){return '<g class="fan"><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#d6dee6" stroke="#6b7c8a" stroke-width="2"/><g class="rot" style="transform-origin:'+cx+'px '+cy+'px">'+
    [0,90,180,270].map(function(a){return '<path d="M'+cx+' '+cy+'l'+(r*.75)+' -'+(r*.18)+'v'+(r*.36)+'z" fill="#6b7c8a" transform="rotate('+a+' '+cx+' '+cy+')"/>';}).join('')+'</g><circle cx="'+cx+'" cy="'+cy+'" r="3" fill="#33424f"/></g>';}
  function label(x,y,t,anchor){return '<text x="'+x+'" y="'+y+'" class="lbl" text-anchor="'+(anchor||'middle')+'">'+t+'</text>';}
  function stack(x,w,top){return '<rect x="'+x+'" y="'+top+'" width="'+w+'" height="'+(470-top)+'" fill="url(#bgSteel)" stroke="#6b7c8a"/><rect class="stackHot" x="'+(x+3)+'" y="'+top+'" width="'+(w-6)+'" height="'+(470-top)+'" fill="#e2461b" opacity=".0"/>'+
    puffs('smoke',x+w/2,top-4,6,7);}

  /* ── แบบที่ 1: ท่อไฟ 3 กลับ (น้ำมัน/ก๊าซ) ── */
  function drawFT3(){
    var o='';
    o+=pipe('M0 330H112',6,'#9a7b4f')+label(40,320,'น้ำมัน/ก๊าซ');
    o+=pipe('M95 372V346H112',14,'#9fb0bd')+fan(95,400,28)+flow('M60 405H70M70 392V376','air',2,'#5b8fa8');
    // ซ้อนท้าย: saddles
    o+='<path d="M250 388l-18 82h76l-18-82z M610 388l-18 82h76l-18-82z" fill="#9fb0bd" stroke="#6b7c8a"/>';
    // หัวเผา
    o+='<rect x="112" y="300" width="80" height="60" rx="6" fill="#c84b2f" stroke="#7a2a17"/><rect x="120" y="312" width="22" height="36" rx="3" fill="#f2c88a"/>'+label(152,294,'หัวเผา');
    // ตัวถังเปลือก
    o+='<rect class="shellBody" x="200" y="140" width="520" height="250" rx="34" fill="url(#bgSteel)" stroke="#5f7180" stroke-width="2"/>';
    o+='<clipPath id="bcFT3"><rect x="204" y="144" width="512" height="242" rx="30"/></clipPath><g clip-path="url(#bcFT3)">'+
      '<rect x="200" y="140" width="520" height="70" fill="url(#bgSteam)"/><rect x="200" y="205" width="520" height="190" fill="url(#bgWater)"/>'+wave(200,720,206)+bubbles(230,690,300,385,22)+'</g>';
    // ท่อไฟกลับที่ 3 และ 2
    o+='<g fill="#6a4a3a">'+[216,226,236].map(function(y){return '<rect x="226" y="'+y+'" width="466" height="6" rx="3"/>';}).join('')+'</g>';
    o+='<g fill="#7a4b33">'+[252,262,272,282].map(function(y){return '<rect x="226" y="'+y+'" width="466" height="7" rx="3.5"/>';}).join('')+'</g>';
    // ห้องเผาไหม้ (กลับที่ 1)
    o+='<rect x="206" y="300" width="488" height="62" rx="31" fill="url(#bgFire)" stroke="#2a130b"/>';
    o+='<g class="flameH"><ellipse class="flh" cx="380" cy="331" rx="175" ry="24" fill="url(#bgFlameH)"/><ellipse class="flh" style="animation-delay:-.3s" cx="330" cy="331" rx="120" ry="15" fill="url(#bgFlameH)"/></g>';
    // ห้องกลับทางด้านหลัง/หน้า
    o+='<rect x="692" y="210" width="26" height="152" rx="6" fill="#4a2a1e"/><rect x="180" y="210" width="24" height="84" rx="6" fill="#4a2a1e"/>';
    // ท่อไอเสียไปปล่อง
    o+='<rect x="712" y="208" width="80" height="26" fill="url(#bgSteel)" stroke="#6b7c8a"/>'+stack(780,34,40);
    var gas='M195 331H690M705 331V267H192M192 267V221H705M705 221H797V40';
    o+='<path class="gasBase" d="'+gas+'" fill="none" stroke="url(#bgGas)" stroke-width="6" opacity=".55"/>'+flow(gas,'gas',2.4);
    o+=label(450,380,'กลับที่ 1 ห้องเผาไหม้',null)+label(450,296,'กลับที่ 2')+label(450,213,'กลับที่ 3');
    // ไอน้ำออก
    o+=pipe('M520 140V92H700',10,'#8a9aa8')+'<rect x="508" y="112" width="24" height="16" fill="#5f7180"/>'+puffs('steamP',705,86,5,8)+flow('M520 136V92H698','stm',2,'#ffffff');
    // น้ำป้อน
    o+=pipe('M150 446H300V390',8,'#3a8fd0')+'<circle cx="230" cy="446" r="13" fill="#3a8fd0" stroke="#1d5f91" stroke-width="2"/>'+flow('M150 446H300V392','fwf',2,'#dff1ff')+label(170,436,'น้ำป้อน');
    o+='<rect class="glow" x="200" y="140" width="520" height="250" rx="34" fill="none" stroke="#ff5a2b" stroke-width="7" opacity="0"/>';
    return {svg:o,anchors:{fuel:[60,330],air:[95,400],flue:[797,130],steam:[640,92],fw:[230,446],shell:[300,140]},
      tags:{fuel:[14,244,'start'],air:[14,490,'start'],flue:[772,118,'end'],steam:[600,64,'start'],fw:[250,490,'start'],shell:[318,130,'start']}};
  }

  /* ── แบบที่ 2: ท่อน้ำ + ตะกรับโซ่ (เชื้อเพลิงแข็ง) ── */
  function drawWTG(){
    var o='';
    // ฟีดเดอร์
    o+='<path d="M70 250H170L160 330H96Z" fill="#7d6a52" stroke="#4d3e2c"/><path d="M78 262H162" stroke="#5b4936" stroke-width="10"/>'+label(120,242,'ถังป้อน');
    // เตา: ผนังท่อน้ำ
    o+='<rect class="furn" x="150" y="110" width="300" height="270" fill="url(#bpTube)" stroke="#5f7180" stroke-width="2"/><rect x="164" y="124" width="272" height="250" fill="url(#bgFire)"/>';
    o+=flamesRow(180,425,372,170,9);
    // ตะกรับโซ่
    o+='<rect x="140" y="374" width="335" height="22" rx="11" fill="#4b5560"/><path class="grate" d="M152 376H463M152 394H463" stroke="#a8b4bf" stroke-width="3" stroke-dasharray="10 6"/>'+
      '<circle cx="152" cy="385" r="10" fill="#33424f"/><circle cx="463" cy="385" r="10" fill="#33424f"/>';
    o+='<path class="bed" d="M150 374 L430 374 L430 370 C 300 366 220 356 162 352 Z" fill="#5a3b22"/><g class="ember">'+[190,240,290,340,390].map(function(x,i){return '<circle cx="'+x+'" cy="'+(368-(i%2)*4)+'" r="2.4" fill="#ffb02e" style="animation-delay:-'+(i*.4)+'s"/>';}).join('')+'</g>';
    // ลมใต้ตะกรับ + ลมเหนือเตา
    o+='<rect x="160" y="398" width="300" height="32" fill="#c9d3dc" stroke="#6b7c8a"/>'+label(310,420,'ห้องลมใต้ตะกรับ');
    o+=pipe('M110 440V414H160',16,'#9fb0bd')+fan(110,446,24);
    o+=[200,260,320,380,430].map(function(x){return flow('M'+x+' 428V400','air',2,'#5b8fa8');}).join('');
    o+=pipe('M150 300H128',6,'#9fb0bd')+flow('M126 300H160','air',2,'#5b8fa8');
    // บ่อเถ้า
    o+='<path d="M462 396H508L496 450H474Z" fill="#8a8f95" stroke="#5c6168"/><g class="ashp">'+[478,486,494].map(function(x,i){return '<circle cx="'+x+'" cy="'+(410+i*10)+'" r="2.2" fill="#d9d9d9" style="animation-delay:-'+(i*.5)+'s"/>';}).join('')+'</g>'+label(485,465,'เถ้า');
    // ดรัมไอน้ำ/ดรัมโคลน + แผงท่อ
    o+='<rect x="480" y="70" width="280" height="54" rx="27" fill="url(#bgSteel)" stroke="#5f7180" stroke-width="2"/>';
    o+='<clipPath id="bcWTG"><rect x="483" y="73" width="274" height="48" rx="24"/></clipPath><g clip-path="url(#bcWTG)"><rect x="480" y="97" width="280" height="30" fill="url(#bgWater)"/>'+wave(480,760,98)+'</g>';
    o+='<rect x="500" y="346" width="240" height="44" rx="22" fill="url(#bgSteel)" stroke="#5f7180" stroke-width="2"/>';
    var t='';for(var x=516;x<=724;x+=16)t+='<rect x="'+(x-3)+'" y="122" width="6" height="226" fill="#7fb3d6"/>';o+=t;
    o+='<g class="bub">'+[530,580,630,680,720].map(function(x,i){return '<circle cx="'+x+'" cy="'+(330-i*7)+'" r="2.2" style="animation-delay:-'+(i*.45)+'s"/>';}).join('')+'</g>';
    o+='<path d="M560 150V320M640 180V346M700 124V300" stroke="#5f7180" stroke-width="4"/>'+pipe('M450 118L482 98',8,'#7fb3d6');
    // เครื่องอุ่นน้ำป้อน + ปล่อง
    o+='<rect x="790" y="250" width="56" height="110" fill="url(#bgSteel)" stroke="#6b7c8a"/>'+[262,276,290,304,318,332,346].map(function(y){return '<path d="M796 '+y+'H840" stroke="#3a8fd0" stroke-width="3"/>';}).join('')+label(818,244,'อีโคโนไมเซอร์');
    o+='<rect x="846" y="290" width="26" height="24" fill="url(#bgSteel)" stroke="#6b7c8a"/>'+stack(868,36,40);
    var gas='M300 360V150H530V330H600V150H670V330H740V160H770V300H818V340H886V40';
    o+='<path class="gasBase" d="'+gas+'" fill="none" stroke="url(#bgGas)" stroke-width="6" opacity=".55"/>'+flow(gas,'gas',2.4);
    // ไอน้ำออก
    o+=pipe('M620 70V34H730',10,'#8a9aa8')+puffs('steamP',736,28,5,8)+flow('M620 72V34H728','stm',2,'#ffffff');
    // น้ำป้อน
    o+=pipe('M950 446H818V360M818 250V200H780V97H760',7,'#3a8fd0')+'<circle cx="905" cy="446" r="12" fill="#3a8fd0" stroke="#1d5f91" stroke-width="2"/>'+flow('M950 446H818V360M818 250V200H780V97H762','fwf',2,'#dff1ff')+label(930,436,'น้ำป้อน');
    o+='<g class="glow" opacity="0"><rect x="150" y="110" width="300" height="270" fill="none" stroke="#ff5a2b" stroke-width="7"/><rect x="480" y="70" width="280" height="54" rx="27" fill="none" stroke="#ff5a2b" stroke-width="6"/></g>';
    return {svg:o,anchors:{fuel:[120,290],air:[110,446],flue:[886,150],steam:[680,34],fw:[905,446],shell:[300,110],ash:[485,430]},
      tags:{fuel:[14,204,'start'],air:[14,490,'start'],flue:[862,170,'end'],steam:[560,20,'start'],fw:[770,490,'start'],shell:[160,98,'start'],ash:[520,470,'start']}};
  }

  /* ── แบบที่ 3: ไฮบริด ท่อน้ำ/ท่อไฟ + ตะกรับโซ่ ── */
  function drawHYB(){
    var o='';
    // ฟีดเดอร์
    o+='<path d="M50 286H150L140 360H76Z" fill="#7d6a52" stroke="#4d3e2c"/><path d="M58 298H142" stroke="#5b4936" stroke-width="10"/>'+label(100,278,'ถังป้อน');
    // ห้องเผาไหม้ (ผนังทนไฟ)
    o+='<rect class="furn" x="130" y="300" width="340" height="94" fill="url(#bpBrick)" stroke="#6b3a22" stroke-width="2"/><rect x="146" y="306" width="308" height="86" fill="url(#bgFire)"/>';
    // ส่วนท่อน้ำเหนือห้องเผาไหม้
    o+='<rect x="140" y="146" width="320" height="14" rx="4" fill="url(#bgSteel)" stroke="#5f7180"/><rect x="140" y="292" width="320" height="10" rx="3" fill="url(#bgSteel)" stroke="#5f7180"/>';
    o+='<rect x="146" y="160" width="308" height="132" fill="url(#bgFire)" opacity=".9"/>';
    var t='';for(var x=158;x<=444;x+=16)t+='<rect x="'+(x-3)+'" y="160" width="6" height="132" fill="#7fb3d6"/>';o+=t+label(300,140,'ส่วนท่อน้ำ');
    o+=flamesRow(170,430,392,150,9);
    // ตะกรับโซ่
    o+='<rect x="120" y="392" width="362" height="22" rx="11" fill="#4b5560"/><path class="grate" d="M132 394H470M132 412H470" stroke="#a8b4bf" stroke-width="3" stroke-dasharray="10 6"/>'+
      '<circle cx="132" cy="403" r="10" fill="#33424f"/><circle cx="470" cy="403" r="10" fill="#33424f"/>';
    o+='<path class="bed" d="M130 392 L440 392 L440 388 C 320 384 220 374 142 370 Z" fill="#5a3b22"/><g class="ember">'+[180,230,280,330,380,420].map(function(x,i){return '<circle cx="'+x+'" cy="'+(386-(i%2)*4)+'" r="2.4" fill="#ffb02e" style="animation-delay:-'+(i*.4)+'s"/>';}).join('')+'</g>';
    o+='<rect x="140" y="416" width="320" height="26" fill="#c9d3dc" stroke="#6b7c8a"/>';
    o+=pipe('M90 446V428H140',14,'#9fb0bd')+fan(90,450,22);
    o+=[190,250,310,370,430].map(function(x){return flow('M'+x+' 440V414','air',2,'#5b8fa8');}).join('');
    o+=pipe('M130 340H108',6,'#9fb0bd')+flow('M106 340H140','air',2,'#5b8fa8');
    // บ่อเถ้า
    o+='<path d="M470 414H514L502 462H482Z" fill="#8a8f95" stroke="#5c6168"/><g class="ashp">'+[486,493,500].map(function(x,i){return '<circle cx="'+x+'" cy="'+(426+i*10)+'" r="2.2" fill="#d9d9d9" style="animation-delay:-'+(i*.5)+'s"/>';}).join('')+'</g>';
    // เสารองรับ + ถังท่อไฟยกสูง
    o+='<path d="M600 186V470M800 186V470" stroke="#55626e" stroke-width="12"/><path d="M600 300H800" stroke="#55626e" stroke-width="5"/>';
    o+='<rect class="shellBody" x="520" y="54" width="360" height="132" rx="30" fill="url(#bgSteel)" stroke="#5f7180" stroke-width="2"/>';
    o+='<clipPath id="bcHYB"><rect x="523" y="57" width="354" height="126" rx="27"/></clipPath><g clip-path="url(#bcHYB)"><rect x="520" y="54" width="360" height="30" fill="url(#bgSteam)"/><rect x="520" y="82" width="360" height="110" fill="url(#bgWater)"/>'+wave(520,880,83)+bubbles(540,860,120,178,14)+'</g>';
    o+='<g fill="#6a4a3a">'+[100,112,124,136,148,160].map(function(y){return '<rect x="540" y="'+y+'" width="322" height="6" rx="3"/>';}).join('')+'</g>'+label(630,48,'ถังท่อไฟ');
    // ท่อไอเสียจากส่วนท่อน้ำ → ถังท่อไฟ
    o+='<path d="M454 170H500V130H522V172H500" fill="#5c4033" stroke="#3a2a22"/>';
    // ไซโคลน + ปล่อง
    o+='<rect x="878" y="118" width="22" height="50" fill="#4a2a1e"/><path d="M866 196H912V236L896 290H882L866 236Z" fill="url(#bgSteel)" stroke="#6b7c8a"/>'+label(889,306,'ไซโคลน');
    o+='<rect x="912" y="214" width="16" height="18" fill="url(#bgSteel)" stroke="#6b7c8a"/>'+stack(926,28,30);
    var gas='M300 380V160M300 160V152H476V150H511V142H870V176H889V210H940V30';
    o+='<path class="gasBase" d="'+gas+'" fill="none" stroke="url(#bgGas)" stroke-width="6" opacity=".55"/>'+flow(gas,'gas',2.4);
    // ท่อน้ำขึ้น/ลง ระหว่างส่วนท่อน้ำกับถังท่อไฟ
    o+=pipe('M170 146V22H560V54',8,'#7fb3d6')+pipe('M840 186V236H468',8,'#3a8fd0');
    o+=flow('M170 146V22H560V54','riser',2,'#e8f5fd');
    // ไอน้ำออก
    o+=pipe('M700 54V18H790',10,'#8a9aa8')+puffs('steamP',796,12,5,8)+flow('M700 56V18H788','stm',2,'#ffffff');
    // น้ำป้อน
    o+=pipe('M660 452H760V186',7,'#3a8fd0')+'<circle cx="700" cy="452" r="12" fill="#3a8fd0" stroke="#1d5f91" stroke-width="2"/>'+flow('M660 452H760V188','fwf',2,'#dff1ff')+label(640,442,'น้ำป้อน');
    o+='<g class="glow" opacity="0"><rect x="130" y="146" width="340" height="248" fill="none" stroke="#ff5a2b" stroke-width="7"/><rect x="520" y="54" width="360" height="132" rx="30" fill="none" stroke="#ff5a2b" stroke-width="6"/></g>';
    return {svg:o,anchors:{fuel:[100,320],air:[90,450],flue:[940,110],steam:[760,18],fw:[700,452],shell:[650,186],ash:[492,446]},
      tags:{fuel:[14,236,'start'],air:[14,490,'start'],flue:[912,334,'end'],steam:[812,34,'start'],fw:[560,494,'start'],shell:[620,214,'start'],ash:[520,488,'start']}};
  }

  var DRAW={FT3:drawFT3,WTG:drawWTG,HYB:drawHYB};

  function mount(host,type){
    type=DRAW[type]?type:'WTG';
    var d=DRAW[type]();
    var hot='<g class="hots">'+ORDER.filter(function(g){return d.anchors[g];}).map(function(g,i){var a=d.anchors[g],tg=d.tags[g];
      return '<g class="tagg" data-g="'+g+'"><text class="tag" x="'+tg[0]+'" y="'+tg[1]+'" text-anchor="'+tg[2]+'"></text></g>'+
        '<g class="hs" data-g="'+g+'" tabindex="0" role="button" aria-label="'+GROUPS[g]+'"><circle class="ring" cx="'+a[0]+'" cy="'+a[1]+'" r="15"/><circle class="dot" cx="'+a[0]+'" cy="'+a[1]+'" r="11"/>'+
        '<text class="num" x="'+a[0]+'" y="'+(a[1]+4)+'" text-anchor="middle">'+(ORDER.indexOf(g)+1)+'</text></g>';}).join('')+'</g>';
    host.innerHTML='<svg class="te-boiler" viewBox="0 0 960 520" width="100%" role="img" aria-label="ผังหม้อไอน้ำ '+type+'">'+defs()+ground()+d.svg+hot+'</svg>';
    host.setAttribute('data-btype',type);
    host.querySelectorAll('.hs').forEach(function(h){
      function fire(){host.dispatchEvent(new CustomEvent('te-hotspot',{detail:{group:h.getAttribute('data-g')},bubbles:true}));}
      h.addEventListener('click',fire);h.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fire();}});});
    return {svg:host.querySelector('svg'),anchors:d.anchors,type:type};
  }

  /* ── ผูกภาพกับค่า ── */
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function mix(c1,c2,t){var a=parseInt(c1.slice(1),16),b=parseInt(c2.slice(1),16);function ch(s){return Math.round(((a>>s)&255)*(1-t)+((b>>s)&255)*t);}return '#'+((1<<24)+(ch(16)<<16)+(ch(8)<<8)+ch(0)).toString(16).slice(1);}
  function dur(sel,root,s){root.querySelectorAll(sel).forEach(function(e){e.style.animationDuration=s.toFixed(2)+'s';});}
  function update(host,s){
    var svg=host.querySelector('svg'); if(!svg) return; s=s||{};
    svg.classList.toggle('still',!!s.still);
    var O2=isFinite(s.O2)?s.O2:6, CO=isFinite(s.CO_ppm)?s.CO_ppm:0, Tg=isFinite(s.Tg)?s.Tg:200, EA=isFinite(s.EA)?s.EA:O2/(20.9-O2);
    // เปลวไฟ: O₂ ต่ำ/CO สูง = ส้มเข้มมีเขม่า · พอดี = เหลืองส้มแกนสว่าง · O₂ สูง = ซีด เล็ก สั่นเร็ว
    var rich=clamp((3-O2)/3,0,1)+clamp(CO/1500,0,1)*.6, lean=clamp((O2-7)/7,0,1);
    var c0=mix(mix('#fff6c2','#ffd36b',rich),'#fffbe8',lean), c1=mix(mix('#ffb02e','#d9480f',rich),'#ffe08a',lean), c2=mix(mix('#e2461b','#5a1d0c',rich),'#f7c873',lean);
    svg.querySelectorAll('.fs0').forEach(function(e){e.setAttribute('stop-color',c0);});
    svg.querySelectorAll('.fs1').forEach(function(e){e.setAttribute('stop-color',c1);});
    svg.querySelectorAll('.fs2').forEach(function(e){e.setAttribute('stop-color',c2);});
    var fscale=clamp(1.05-lean*.35+rich*.1,.6,1.2);
    svg.querySelectorAll('.flames,.flameH').forEach(function(g){g.style.setProperty('--fsc',fscale.toFixed(2));});
    dur('.fl,.flh',svg,clamp(.9-lean*.45,.35,1.1));
    // ไอเสีย: สีตามอุณหภูมิ (120 °C ฟ้าอมเขียว → 300 °C แดง) ความเร็วตามปริมาตรไอเสีย (อากาศส่วนเกิน)
    var tt=clamp((Tg-120)/180,0,1), cg=tt<.5?mix('#3fa7a7','#e0a12b',tt*2):mix('#e0a12b','#d1302b',(tt-.5)*2);
    svg.querySelectorAll('.gs1').forEach(function(e){e.setAttribute('stop-color',cg);});
    svg.querySelectorAll('.stackHot').forEach(function(e){e.setAttribute('opacity',(tt*.55).toFixed(2));});
    dur('.gas',svg,clamp(2.4/(1+EA),.5,2.4));
    // ควันปลายปล่อง: CO สูง = เทาเข้ม · ต่ำ = จาง
    var sm=clamp(.12+CO/900,.12,.85);
    svg.querySelectorAll('.smoke circle').forEach(function(e){e.setAttribute('fill',mix('#d7dde3','#4b4f55',clamp(CO/1200,0,1)));e.style.setProperty('--op',sm.toFixed(2));});
    // อากาศ: เร็วขึ้นเมื่ออากาศส่วนเกินมาก
    dur('.air',svg,clamp(1.6/(0.6+EA),.35,2));
    svg.querySelectorAll('.rot').forEach(function(e){e.style.animationDuration=clamp(1.2/(0.6+EA),.25,2).toFixed(2)+'s';});
    // ไอน้ำ/น้ำป้อน: ความเร็วตามอัตราผลิตไอน้ำ
    var ws=isFinite(s.Ws)&&s.Ws>0?s.Ws:0, ld=clamp(ws/15,0.15,1.6);
    dur('.steamP circle',svg,clamp(3.2/ld,1.2,8)); dur('.stm,.fwf,.riser',svg,clamp(2/ld,.5,6));
    svg.querySelectorAll('.steamP').forEach(function(e){e.style.opacity=ws>0?'1':'.15';});
    // ตะกรับ: ความเร็วตามอัตราป้อนเชื้อเพลิง
    var F=isFinite(s.F)&&s.F>0?s.F:0; dur('.grate',svg,clamp(9000/(F+300),1.2,20));
    // ผนังร้อน: ตามสัดส่วนสูญเสียทางผนัง
    var L=isFinite(s.Lrad)?s.Lrad:0; svg.querySelectorAll('.glow').forEach(function(e){e.setAttribute('opacity',clamp((L-0.4)/3,0,.75).toFixed(2));});
    // จุดตรวจวัด
    var qc=s.qc||{}, tags=s.tags||{};
    svg.querySelectorAll('.hs').forEach(function(h){var g=h.getAttribute('data-g');h.setAttribute('data-q',qc[g]||'empty');h.classList.toggle('on',s.active===g);});
    svg.querySelectorAll('.tagg').forEach(function(t){var g=t.getAttribute('data-g'),tx=t.querySelector('text'),x=tx.getAttribute('x');
      tx.innerHTML=String(tags[g]||'').split('\n').map(function(l,i){return '<tspan x="'+x+'" dy="'+(i?15:0)+'">'+l.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];})+'</tspan>';}).join('');
      t.style.display=(s.hideTags||!tags[g])?'none':'';});
  }
  // ภาพนิ่งสำหรับรายงาน: คัดลอก SVG ปัจจุบัน ตัดการเคลื่อนไหว
  function snapshot(host){var svg=host.querySelector('svg');if(!svg)return '';var c=svg.cloneNode(true);c.classList.add('still');c.removeAttribute('width');c.setAttribute('style','width:100%;max-width:720px');
    c.querySelectorAll('.smoke,.steamP,.bub,.ember,.ashp,.ring,.gas,.air,.stm,.fwf,.riser').forEach(function(e){e.remove();});
    // หน้ารายงานไม่มี CSS ของผัง → ใส่สไตล์เป็น attribute
    var QC={ok:'#12a4a4',warn:'#e08a00',fail:'#d1495b',empty:'#9aa7b3'};
    c.querySelectorAll('.hs').forEach(function(h){var q=h.getAttribute('data-q')||'empty',d=h.querySelector('.dot');d.setAttribute('fill','#fff');d.setAttribute('stroke',QC[q]);d.setAttribute('stroke-width','3');
      var n=h.querySelector('.num');n.setAttribute('font-size','12');n.setAttribute('font-weight','700');n.setAttribute('fill','#0f2a4a');});
    c.querySelectorAll('.tag').forEach(function(t){t.setAttribute('font-size','13');t.setAttribute('font-weight','600');t.setAttribute('fill','#0f2a4a');t.setAttribute('font-family','monospace');});
    c.querySelectorAll('.lbl').forEach(function(t){t.setAttribute('font-size','12');t.setAttribute('fill','#41505d');});
    c.querySelectorAll('.tagg').forEach(function(t){if(t.style.display==='none')t.remove();});
    return c.outerHTML;}

  /* สไตล์ของผัง (ฉีดครั้งเดียว) */
  var CSS='.te-boiler{display:block;background:#f9fbfd;border-radius:12px}'+
    '.te-boiler .lbl{font:600 12px "IBM Plex Sans Thai",sans-serif;fill:#41505d}'+
    '.te-boiler .tag{font:600 13px "IBM Plex Mono",monospace;fill:#0f2a4a;paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round}'+
    '.te-boiler .hs{cursor:pointer;outline:none}.te-boiler .hs .dot{fill:#fff;stroke:#12a4a4;stroke-width:3}.te-boiler .hs .num{font:700 12px "IBM Plex Mono",monospace;fill:#0f2a4a;pointer-events:none}'+
    '.te-boiler .hs .ring{fill:none;stroke:#12a4a4;stroke-width:2;opacity:0}'+
    '.te-boiler .hs[data-q=warn] .dot{stroke:#e08a00}.te-boiler .hs[data-q=fail] .dot{stroke:#d1495b;fill:#fdecec}.te-boiler .hs[data-q=empty] .dot{stroke:#9aa7b3;stroke-dasharray:3 3}'+
    '.te-boiler .hs.on .dot{fill:#0f2a4a}.te-boiler .hs.on .num{fill:#fff}.te-boiler .hs.on .ring,.te-boiler .hs:hover .ring,.te-boiler .hs:focus .ring{opacity:1;animation:teb-ping 1.6s ease-out infinite}'+
    '@keyframes teb-ping{0%{r:13;opacity:.9}100%{r:26;opacity:0}}'+
    '.te-boiler .flames,.te-boiler .flameH{--fsc:1}'+
    '.te-boiler .fl{transform-box:fill-box;transform-origin:50% 100%;animation:teb-flick .8s ease-in-out infinite alternate}'+
    '@keyframes teb-flick{0%{transform:scale(calc(var(--fsc)*.92),calc(var(--fsc)*.85))}100%{transform:scale(calc(var(--fsc)*1.05),calc(var(--fsc)*1.08))}}'+
    '.te-boiler .flh{transform-box:fill-box;transform-origin:0% 50%;animation:teb-flickh .7s ease-in-out infinite alternate}'+
    '@keyframes teb-flickh{0%{transform:scale(calc(var(--fsc)*.9),.9)}100%{transform:scale(calc(var(--fsc)*1.04),1.08)}}'+
    '.te-boiler .gas{stroke-dasharray:6 14;animation:teb-dash 1.2s linear infinite;opacity:.9}'+
    '.te-boiler .air{stroke-dasharray:5 7;animation:teb-dash 1s linear infinite}.te-boiler .stm,.te-boiler .fwf,.te-boiler .riser{stroke-dasharray:5 9;animation:teb-dash 1.4s linear infinite}'+
    '.te-boiler .grate{animation:teb-dash 4s linear infinite}'+
    '@keyframes teb-dash{to{stroke-dashoffset:-40}}'+
    '.te-boiler .rot{animation:teb-rot 1s linear infinite}@keyframes teb-rot{to{transform:rotate(360deg)}}'+
    '.te-boiler .smoke circle{--op:.3;fill:#ccc;opacity:0;transform-box:fill-box;transform-origin:center;animation:teb-rise 3.3s ease-out infinite}'+
    '@keyframes teb-rise{0%{transform:translate(0,0) scale(.6);opacity:var(--op)}100%{transform:translate(18px,-46px) scale(2.2);opacity:0}}'+
    '.te-boiler .steamP circle{fill:#fff;stroke:#d5e3ee;opacity:0;transform-box:fill-box;transform-origin:center;animation:teb-rise2 3s ease-out infinite}'+
    '@keyframes teb-rise2{0%{transform:translate(0,0) scale(.5);opacity:.95}100%{transform:translate(26px,-30px) scale(2);opacity:0}}'+
    '.te-boiler .bub circle{fill:#e8f5fd;opacity:.8;animation:teb-bub 2.6s linear infinite}@keyframes teb-bub{0%{transform:translateY(0);opacity:0}15%{opacity:.85}100%{transform:translateY(-70px);opacity:0}}'+
    '.te-boiler .wave{animation:teb-wave 3s linear infinite}@keyframes teb-wave{to{transform:translateX(30px)}}'+
    '.te-boiler .ember circle{animation:teb-emb 1.3s ease-in-out infinite alternate}@keyframes teb-emb{to{opacity:.2}}'+
    '.te-boiler .ashp circle{animation:teb-ash 2.4s linear infinite}@keyframes teb-ash{0%{transform:translateY(-8px);opacity:0}30%{opacity:1}100%{transform:translateY(18px);opacity:0}}'+
    '.te-boiler.still *,.te-boiler.still *::before{animation-play-state:paused!important}'+
    '@media (prefers-reduced-motion:reduce){.te-boiler *{animation-play-state:paused!important}}';
  if(typeof document!=='undefined'&&!document.getElementById('te-svg-boiler-css')){var st=document.createElement('style');st.id='te-svg-boiler-css';st.textContent=CSS;document.head.appendChild(st);}
  return {_ver:'TE_SVG_BOILER r1-2569',TYPES:TYPES,GROUPS:GROUPS,ORDER:ORDER,mount:mount,update:update,snapshot:snapshot};
})();
