/*! te-ui.js — ชั้น UI กลางของการ์ด Pro/Expert · Triple E Energy Tools r2 (3 พ.ย. 2569)
 *  ต้องโหลด te-core.js ก่อน · ห้ามมีสูตรคำนวณในไฟล์นี้ (สูตรอยู่ใน te-core เท่านั้น)
 *  r2: สองภาษา th/en ทุกส่วนประกอบ (นโยบาย 3 พ.ย. 2569: th = ไทย+ศัพท์เทคนิคอังกฤษ · en = อังกฤษ 100%)
 *  ส่วนประกอบ: TE_UI.lang · tier · fuelPicker · sourceSelect · qcPanel · issuer · report · json · fmt */
(function(root){
  var TE=root.TE; if(!TE) throw new Error('te-ui.js: ต้องโหลด te-core.js ก่อน / load te-core.js first');
  function $(id){return document.getElementById(id);}
  function el(tag,attrs,html){var e=document.createElement(tag);if(attrs)for(var k in attrs){if(k==='style')e.style.cssText=attrs[k];else e.setAttribute(k,attrs[k]);}if(html!=null)e.innerHTML=html;return e;}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
  function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}

  /* ── ภาษา: ?lang=en → ที่เลือกไว้ → th · เปลี่ยนภาษา = เขียน URL ใหม่แล้วโหลดหน้าใหม่ (ป้ายคงที่ทั้งหน้า) ── */
  var lang=(function(){var m=/[?&]lang=(\w+)/.exec(location.search||'');var l=((m&&m[1])||lsGet('te.lang')||'th').toLowerCase();
    l=(l==='en')?'en':'th'; if(TE.I18N)TE.I18N.set(l); try{document.documentElement.lang=l;}catch(e){} return l;})();
  function TT(th,en){return lang==='en'?(en!=null?en:th):th;}
  function fx(v,d){return (v==null||!isFinite(v))?'–':Number(v).toLocaleString(lang==='en'?'en-US':'th-TH',{minimumFractionDigits:d,maximumFractionDigits:d});}
  var langApi={
    current:lang, tt:TT,
    set:function(l){l=(l==='en')?'en':'th';lsSet('te.lang',l);
      var u=new URL(location.href);u.searchParams.set('lang',l);location.href=u.toString();},
    mountSwitch:function(host){
      var w=el('span',{'class':'te-langsw'},['th','en'].map(function(l){return '<button type="button" data-l="'+l+'" class="'+(l===lang?'on':'')+'">'+l.toUpperCase()+'</button>';}).join(''));
      host.appendChild(w);
      w.addEventListener('click',function(e){var l=e.target.getAttribute('data-l');if(l&&l!==lang)langApi.set(l);});
    }
  };

  /* ── สิทธิ์ (ระยะต้นแบบ: ยังไม่เชื่อมระบบสมาชิก) ──
     ลำดับหาระดับ: ?tier= ใน URL → ค่าที่เลือกไว้ในเบราว์เซอร์ → 'pro'
     เมื่อมีระบบหลังบ้าน ให้แทน resolve() ด้วยค่าจากโทเคนสมาชิกที่เซิร์ฟเวอร์ลงนาม — ห้ามเชื่อค่าจาก URL ในระบบจริง */
  var tier={
    current:'pro', listeners:[],
    resolve:function(){var q=(new URLSearchParams(location.search)).get('tier');var t=(q||lsGet('te.devTier')||'pro').toLowerCase();return TE.TIER.TIERS.indexOf(t)>=0?t:'pro';},
    set:function(t){this.current=t;lsSet('te.devTier',t);TE.TIER.apply(t);document.documentElement.setAttribute('data-tier',t);this.listeners.forEach(function(f){try{f(t);}catch(e){console.error(e);}});},
    on:function(f){this.listeners.push(f);},
    can:function(f){return TE.TIER.can(this.current,f);},
    mountSwitch:function(host){
      var w=el('div',{'class':'te-tierbar'}),self=this;
      w.innerHTML='<span class="te-tierbar-l">'+TT('โหมดทดสอบสิทธิ์ (ยังไม่เชื่อมระบบสมาชิก):','Tier test mode (membership not connected):')+'</span>'+TE.TIER.TIERS.map(function(t){return '<button type="button" data-t="'+t+'">'+t[0].toUpperCase()+t.slice(1)+'</button>';}).join('');
      host.appendChild(w);
      w.addEventListener('click',function(e){var t=e.target.getAttribute('data-t');if(t)self.set(t);});
      this.on(function(t){[].forEach.call(w.querySelectorAll('button'),function(b){b.classList.toggle('on',b.getAttribute('data-t')===t);});});
    }
  };

  /* ── ตัวเลือกเชื้อเพลิง: Free = dropdown คลัง 70 · Pro/Expert = ค้นหา + ฐานข้อมูล Phyllis + ปรับความชื้น ── */
  function fuelPicker(host,opts){
    opts=opts||{}; var state={src:null,id:null,M:null,fuel:null}, dbLoading=false;
    host.classList.add('te-fuel');
    host.innerHTML=
      '<div class="te-fuel-free" data-te-feature="fuel.dropdown"><label>'+TT('เชื้อเพลิงจากคลัง 70 รายการ','Fuel from 70-item library')+'</label><select class="te-fuel-dd"></select></div>'+
      '<div class="te-fuel-pro" data-te-feature="fuel.search"><div class="te-row"><div class="te-grow"><label>'+TT('ค้นหาเชื้อเพลิง (ไทย/อังกฤษ/เลข ID)','Search fuel (name or ID)')+'</label>'+
      '<input type="search" class="te-fuel-q" placeholder="'+TT('เช่น แกลบ, กะลาปาล์ม, rice straw, 1240','e.g. rice husk, palm kernel shell, 1240')+'"></div>'+
      '<div style="width:150px" data-te-feature="fuel.moisture"><label>'+TT('ความชื้นปัจจุบัน M (%)','Current moisture M (%)')+'</label><input type="number" class="te-fuel-m" min="0" max="95" step="0.1"></div></div>'+
      '<div class="te-muted te-fuel-cnt"></div><ul class="te-fuel-res"></ul></div>'+
      '<div class="te-fuel-sel"></div>';
    var dd=host.querySelector('.te-fuel-dd'), q=host.querySelector('.te-fuel-q'), mIn=host.querySelector('.te-fuel-m'), res=host.querySelector('.te-fuel-res'), cnt=host.querySelector('.te-fuel-cnt'), sel=host.querySelector('.te-fuel-sel');
    dd.innerHTML='<option value="">'+TT('— เลือกเชื้อเพลิง —','— select fuel —')+'</option>'+TE.FUEL.dropdown().map(function(g){return '<optgroup label="'+g.label+'">'+g.items.map(function(i){return '<option value="'+i.id+'">'+esc(lang==='en'?(i.name||i.label):i.label)+'</option>';}).join('')+'</optgroup>';}).join('');
    function loadDB(cb){
      if(TE.FUELDB) return cb();
      if(!tier.can('fuel.db')||dbLoading||!opts.dbUrl) return cb();
      dbLoading=true; var s=document.createElement('script'); s.src=opts.dbUrl; s.onload=function(){dbLoading=false;cb();}; s.onerror=function(){dbLoading=false;cnt.textContent=TT('โหลดฐานข้อมูลเชื้อเพลิงไม่สำเร็จ','Failed to load fuel database');cb();}; document.head.appendChild(s);
    }
    function search(){
      var t=q.value.trim(); if(!t){res.innerHTML='';cnt.textContent='';return;}
      var lib=TE.FUEL.search(t).map(function(f){return {src:'lib',id:f.id,t:lang==='en'?f.name:((f.nameTh||'')+' — '+f.name),g:TT('คลัง','Library')};});
      var db=(TE.FUELDB&&tier.can('fuel.db'))?TE.FUELDB.search(t,{usable:true,limit:60}).map(function(r){return {src:'db',id:r.id,t:r.mat+(r.nameTh&&lang!=='en'?' · '+r.nameTh:'')+' #'+r.id,g:r.q.grade};}):[];
      cnt.textContent=TT('พบในคลัง '+lib.length+' · ฐานข้อมูล Phyllis '+db.length+' รายการ (เฉพาะที่คำนวณได้)','Library: '+lib.length+' · Phyllis database: '+db.length+' usable records');
      res.innerHTML=lib.concat(db).map(function(x){return '<li data-s="'+x.src+'" data-id="'+x.id+'">'+esc(x.t)+'<span class="te-grade g'+x.g+'">'+x.g+'</span></li>';}).join('');
    }
    function build(){
      if(!state.src) return null;
      var M=(mIn.value===''||!tier.can('fuel.moisture'))?null:+mIn.value, f;
      if(state.src==='lib'){f=Object.assign({},TE.FUEL.byId(state.id)); if(M!==null&&M!==f.m) f=TE.FUEL.atMoisture(f,M);}
      else f=TE.FUELDB.toFuel(state.id,M);
      return f;
    }
    function commit(){
      try{state.fuel=build();}catch(e){sel.innerHTML='<div class="te-warn">'+esc(e.message)+'</div>';return;}
      var f=state.fuel; if(!f){sel.innerHTML='';if(opts.onChange)opts.onChange(null);return;}
      if(mIn&&mIn.value==='') mIn.placeholder=fx(f.m,1);
      sel.innerHTML='<div class="te-fuel-card"><b>'+esc(lang==='en'?f.name:(f.nameTh&&f.nameTh!==f.name?f.nameTh+' — '+f.name:f.name))+'</b>'+
        '<div class="te-chips">'+['c','h','o','n','s','ash','m'].map(function(k){return '<span>'+({c:'C',h:'H',o:'O',n:'N',s:'S',ash:TT('เถ้า','Ash'),m:'M'})[k]+' '+fx(f[k],2)+'</span>';}).join('')+'</div>'+
        '<div class="te-muted">HHV '+fx(f.hhv,3)+' · LHV '+fx(f.lhv,3)+' MJ/kg '+TT('(ฐานที่ได้รับ)','(as received)')+' · k '+fx(f.k,4)+' · CO₂max '+fx(f.co2,2)+' %</div>'+
        '<div class="te-muted te-small">'+esc(f.src||'')+(f.hvSrc?' · '+esc(f.hvSrc):'')+'</div>'+
        ((f.warnings&&f.warnings.length)?'<div class="te-warn te-small">'+f.warnings.map(esc).join(' · ')+'</div>':'')+'</div>';
      if(opts.onChange) opts.onChange(f);
    }
    dd.addEventListener('change',function(){state.src=dd.value?'lib':null;state.id=+dd.value;commit();});
    q.addEventListener('input',function(){loadDB(search);});
    res.addEventListener('click',function(e){var li=e.target.closest('li');if(!li)return;state.src=li.getAttribute('data-s');state.id=+li.getAttribute('data-id');
      [].forEach.call(res.children,function(x){x.classList.toggle('on',x===li);});commit();});
    mIn.addEventListener('input',commit);
    tier.on(function(t){ if(!TE.TIER.can(t,'fuel.search')&&state.src==='db'){state.src=null;} if(!TE.TIER.can(t,'fuel.moisture'))mIn.value=''; commit(); });
    return {
      get:function(){return state.fuel;},
      state:function(){return {src:state.src,id:state.id,M:mIn.value};},
      restore:function(s){if(!s||!s.src)return;var go=function(){state.src=s.src;state.id=+s.id;if(s.src==='lib')dd.value=s.id;mIn.value=s.M||'';commit();};if(s.src==='db')loadDB(go);else go();}
    };
  }

  /* ── ที่มาของค่า (ธรรมนูญหัวข้อ 8) ── */
  var SRC_EN={measured:'Measured',plant:'Plant data',design:'Design/nameplate',reference:'Reference/assumption',default:'System default'};
  function srcLabel(k){return lang==='en'?(SRC_EN[k]||k):(TE.QC.SOURCES[k]||k);}
  function sourceSelects(root){
    var opts=Object.keys(TE.QC.SOURCES).map(function(k){return '<option value="'+k+'">'+srcLabel(k)+'</option>';}).join('');
    [].forEach.call((root||document).querySelectorAll('[data-src]'),function(inp){
      if(inp.nextElementSibling&&inp.nextElementSibling.classList.contains('te-src'))return;
      var s=el('select',{'class':'te-src','id':'src_'+inp.id,'title':TT('ที่มาของค่า','Value source'),'data-te-feature':'qc.sourceDeclare'},opts); s.value=inp.getAttribute('data-src')||'measured';
      inp.parentNode.insertBefore(s,inp.nextSibling);
    });
  }
  function sourcesOf(ids){var o={};ids.forEach(function(id){var s=$('src_'+id);o[id]=s?s.value:null;});return o;}

  /* ── แผงคัดกรองคุณภาพข้อมูล (TE.QC) ── */
  function qcPanel(host,qc){
    var lv={pass:TT('ผ่าน','Pass'),warn:TT('ควรตรวจ','Check'),fail:TT('ไม่ผ่าน','Fail')};
    host.innerHTML='<div class="te-qc-sum"><span class="ok">'+lv.pass+' '+qc.count.pass+'</span><span class="wa">'+lv.warn+' '+qc.count.warn+'</span><span class="fa">'+lv.fail+' '+qc.count.fail+'</span></div>'+
      '<table class="te-tbl"><tr><th>'+TT('รายการ','Item')+'</th><th class="r">'+TT('ค่า','Value')+'</th><th>'+TT('ที่มา','Source')+'</th><th>'+TT('ผล','Result')+'</th></tr>'+qc.items.map(function(i){
        return '<tr class="qc-'+i.level+'"><td>'+esc(i.label)+'</td><td class="r">'+(i.value===''||i.value==null?'–':esc(i.value))+' '+esc(i.unit)+'</td><td>'+(i.source?esc(srcLabel(i.source)):'–')+'</td><td>'+lv[i.level]+(i.msg?' — '+esc(i.msg):'')+'</td></tr>';}).join('')+'</table>';
  }

  /* ── ข้อมูลผู้จัดทำ (ธรรมนูญหัวข้อ 8) ── */
  var ISSUER_FIELDS=[['company',['ชื่อบริษัท/ผู้จัดทำ','Company / issuer'],1],['address',['ที่อยู่','Address'],1],['phone',['โทรศัพท์','Phone'],1],['email',['อีเมล','Email'],1],
    ['author',['ชื่อผู้จัดทำรายงาน','Report author'],1],['position',['ตำแหน่ง','Position'],1],
    ['license',['เลขใบอนุญาต (กว./ผู้ชำนาญการ)','License no.'],0],['taxId',['เลขประจำตัวผู้เสียภาษี','Tax ID'],0],['jobNo',['เลขที่ใบงาน','Job no.'],0],['contractNo',['เลขที่สัญญา','Contract no.'],0],
    ['clientName',['ชื่อผู้ว่าจ้าง (โรงงาน)','Client (plant)'],1],['clientCode',['รหัสลูกค้าภาษาอังกฤษ (ใช้ในชื่อไฟล์)','Client code (for file names)'],0],['clientAddress',['ที่อยู่ผู้ว่าจ้าง','Client address'],0]];
  var issuer={
    data:{custom:[],reviewer:'',approver:''},
    load:function(){try{var d=JSON.parse(lsGet('te.issuer')||'null');if(d)this.data=Object.assign(this.data,d);}catch(e){}return this.data;},
    save:function(){lsSet('te.issuer',JSON.stringify(this.data));},
    mount:function(host){
      var self=this; this.load();
      host.innerHTML='<div class="te-grid2">'+ISSUER_FIELDS.map(function(f){return '<div><label>'+TT(f[1][0],f[1][1])+(f[2]?' <span class="te-req">*</span>':'')+'</label><input data-iss="'+f[0]+'" value="'+esc(self.data[f[0]]||'')+'"></div>';}).join('')+'</div>'+
        '<div data-te-feature="issuer.reviewer" class="te-grid2"><div><label>'+TT('ผู้ตรวจสอบ','Reviewer')+'</label><input data-iss="reviewer" value="'+esc(self.data.reviewer||'')+'"></div><div><label>'+TT('ผู้อนุมัติ','Approver')+'</label><input data-iss="approver" value="'+esc(self.data.approver||'')+'"></div></div>'+
        '<div data-te-feature="issuer.customRefs"><label>'+TT('เลขอ้างอิงเพิ่มเติม (เพิ่มได้ไม่จำกัด)','Custom reference numbers')+'</label><div class="te-customrefs"></div><button type="button" class="te-btn-sm te-addref">+ '+TT('เพิ่มช่องเลขอ้างอิง','Add reference field')+'</button></div>'+
        '<div data-te-feature="brand.userLogo" class="te-grid2"><div><label>'+TT('โลโก้ผู้จัดทำ (PNG/SVG)','Issuer logo (PNG/SVG)')+'</label><input type="file" accept="image/png,image/svg+xml" data-logo="logoUser"></div><div><label>'+TT('โลโก้ผู้ว่าจ้าง','Client logo')+'</label><input type="file" accept="image/png,image/svg+xml" data-logo="logoClient"></div></div>'+
        '<div data-te-feature="brand.signature"><label>'+TT('ภาพลายเซ็นผู้จัดทำ (PNG พื้นโปร่งใส)','Author signature image (transparent PNG)')+'</label><input type="file" accept="image/png" data-logo="sign1"></div>'+
        '<div class="te-muted te-small">'+TT('ข้อมูลนี้เก็บในเบราว์เซอร์นี้เท่านั้นในระยะต้นแบบ · ระบบจริงเก็บในบัญชีสมาชิก และภาพลายเซ็นไม่ถูกบันทึกลงไฟล์ .te.json','Prototype: stored in this browser only. Production stores this in the member account; signature images are never written into .te.json files.')+'</div>';
      var cr=host.querySelector('.te-customrefs');
      function drawRefs(){cr.innerHTML=self.data.custom.map(function(r,i){return '<div class="te-row"><input placeholder="'+TT('ชื่อ เช่น เลขโครงการ พพ.','Label e.g. DEDE project no.')+'" data-cr="'+i+'" data-k="k" value="'+esc(r.k)+'"><input placeholder="'+TT('ค่า','Value')+'" data-cr="'+i+'" data-k="v" value="'+esc(r.v)+'"><button type="button" class="te-btn-sm" data-del="'+i+'">'+TT('ลบ','Remove')+'</button></div>';}).join('');}
      drawRefs();
      host.addEventListener('input',function(e){var t=e.target,k=t.getAttribute('data-iss');if(k){self.data[k]=t.value;self.save();}
        var c=t.getAttribute('data-cr');if(c!=null){self.data.custom[+c][t.getAttribute('data-k')]=t.value;self.save();}});
      host.addEventListener('click',function(e){if(e.target.classList.contains('te-addref')){self.data.custom.push({k:'',v:''});drawRefs();}
        var d=e.target.getAttribute('data-del');if(d!=null){self.data.custom.splice(+d,1);self.save();drawRefs();}});
      host.addEventListener('change',function(e){var k=e.target.getAttribute('data-logo');if(!k||!e.target.files[0])return;var r=new FileReader();r.onload=function(){self.data[k]=r.result;self.save();};r.readAsDataURL(e.target.files[0]);});
    },
    missing:function(){var d=this.data;return ISSUER_FIELDS.filter(function(f){return f[2]&&!String(d[f[0]]||'').trim();}).map(function(f){return TT(f[1][0],f[1][1]);});}
  };

  /* ── รายงาน: นโยบายจาก TE.TIER.report(tier) · วันที่/คำประกาศตามภาษา (TE.REPORT/TE.I18N) ──
     ระยะต้นแบบ: เลขรายงาน/รหัสตรวจสอบสร้างในเบราว์เซอร์และติดป้าย DRAFT — ระบบจริงออกโดยเซิร์ฟเวอร์ */
  function reportNo(card){var d=new Date(),y=lang==='en'?String(d.getFullYear()):String(d.getFullYear()+543).slice(2),m=('0'+(d.getMonth()+1)).slice(-2);return 'TE-'+y+m+'-'+String(Math.floor(Math.random()*9000)+1000)+'-DRAFT';}
  var report={
    build:function(o){ // o={card,title,bodyHtml,keyNums}
      var t=tier.current, pol=TE.TIER.report(t), d=issuer.data, no=reportNo(o.card), vc=TE.REPORT.verifyCode({no:no,k:o.keyNums});
      var dateLine=TE.I18N?TE.I18N.dateStr(new Date(),lang):TE.REPORT.thaiDate(new Date());
      var head='<div class="rp-head">'+(d.logoUser&&tier.can('brand.userLogo')?'<img src="'+d.logoUser+'" class="rp-logo">':'')+
        '<div class="rp-org"><b>'+esc(d.company||'')+'</b><br>'+esc(d.address||'')+'<br>'+esc([d.phone,d.email].filter(Boolean).join(' · '))+'</div>'+
        (d.logoClient&&tier.can('client.logo')?'<img src="'+d.logoClient+'" class="rp-logo">':'')+'</div>';
      var refs=[[TT('เลขที่รายงาน','Report no.'),no],[TT('วันที่','Date'),dateLine],[TT('รหัสการ์ด','Card code'),o.card],[TT('ผู้ว่าจ้าง','Client'),d.clientName],[TT('ที่อยู่ผู้ว่าจ้าง','Client address'),d.clientAddress],[TT('เลขผู้เสียภาษี','Tax ID'),d.taxId],[TT('เลขที่ใบงาน','Job no.'),d.jobNo],[TT('เลขที่สัญญา','Contract no.'),d.contractNo]]
        .concat(tier.can('issuer.customRefs')?(d.custom||[]).filter(function(r){return r.k;}).map(function(r){return [r.k,r.v];}):[]).filter(function(r){return r[1];});
      var sig=['<td><div class="rp-sig">'+(d.sign1&&tier.can('brand.signature')?'<img src="'+d.sign1+'">':'')+'</div>'+esc(d.author||'')+'<br>'+esc(d.position||'')+(d.license?'<br>'+esc(d.license):'')+'<br>'+TT('ผู้จัดทำ','Issuer')+'</td>'];
      if(tier.can('issuer.reviewer')){if(d.reviewer)sig.push('<td><div class="rp-sig"></div>'+esc(d.reviewer)+'<br>'+TT('ผู้ตรวจสอบ','Reviewer')+'</td>');if(d.approver)sig.push('<td><div class="rp-sig"></div>'+esc(d.approver)+'<br>'+TT('ผู้อนุมัติ','Approver')+'</td>');}
      var disc=TE.REPORT.disclaimer(t,lang);
      var foot=(pol.footer?'<div class="rp-foot">'+esc(t==='free'&&TE.I18N?TE.I18N.t('report.footer.free',lang):pol.footer)+'</div>':'')+(pol.watermark?'<div class="rp-wm">'+esc(pol.watermark)+'</div>':'')+
        '<div class="rp-vc">'+esc(disc)+(pol.verifyCode?'<br>'+TT('เลขที่รายงาน','Report no.')+' '+no+' · '+TT('รหัสตรวจสอบ','Verify code')+' '+vc+' · '+TT('ต้นแบบ: เลขจริงออกโดยระบบเซิร์ฟเวอร์','Prototype: production numbers are issued server-side'):'')+'</div>';
      return {no:no,vc:vc,pol:pol,html:'<div class="rp">'+(t==='free'?'':head)+'<h1>'+esc(o.title)+'</h1>'+
        (t==='free'?'<div class="rp-vc">'+esc(dateLine)+'</div>':'<table class="rp-ref">'+refs.map(function(r){return '<tr><th>'+esc(r[0])+'</th><td>'+esc(r[1])+'</td></tr>';}).join('')+'</table>')+
        o.bodyHtml+(t==='free'?'':'<table class="rp-sigs"><tr>'+sig.join('')+'</tr></table>')+foot+'</div>'};
    },
    output:function(r,fmt,fileBase){
      if(fmt==='docx'){var html='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>'+REPORT_CSS+'</style></head><body>'+r.html+'</body></html>';
        download(new Blob(['﻿'+html],{type:'application/msword'}),fileBase+'.doc');return;}
      var w=window.open('','_blank'); if(!w){alert(TT('เบราว์เซอร์บล็อกหน้าต่างพิมพ์ — อนุญาต pop-up แล้วลองใหม่','Print window blocked — allow pop-ups and retry'));return;}
      w.document.write('<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><title>'+esc(fileBase)+'</title><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;600&display=swap" rel="stylesheet"><style>'+REPORT_CSS+'</style></head><body>'+r.html+'<script>setTimeout(function(){print()},600)<\/script></body></html>');
      w.document.close();
    }
  };
  var REPORT_CSS='body{font-family:"IBM Plex Sans Thai",Tahoma,sans-serif;color:#1c2b3a;margin:18mm 16mm;font-size:12.5px}h1{font-size:18px;color:#0f2a4a;border-bottom:2px solid #12a4a4;padding-bottom:6px}h2{font-size:14px;color:#0f2a4a;margin-top:16px}'+
    'table{border-collapse:collapse;width:100%;margin:6px 0}td,th{border:1px solid #cfd8e3;padding:4px 6px;text-align:left}th{background:#eef3f8}.r{text-align:right}'+
    '.rp-head{display:flex;justify-content:space-between;align-items:center;gap:12px}.rp-logo{max-height:56px}.rp-org{flex:1;font-size:11.5px}.rp-ref th{width:28%}'+
    '.rp-sigs td{border:none;text-align:center;vertical-align:bottom;padding-top:24px}.rp-sig{height:52px;border-bottom:1px solid #555;margin:0 18px 4px}.rp-sig img{max-height:50px}'+
    '.rp-foot{margin-top:18px;text-align:center;color:#5b6b7b;font-size:11px}.rp-wm{position:fixed;right:10mm;bottom:6mm;font-size:9px;color:#9aa8b6}.rp-vc{margin-top:10px;font-size:10px;color:#5b6b7b}';

  /* ── JSON (ธรรมนูญ: ส่งออกทุกระดับ · เปิดไฟล์เฉพาะ Pro/Expert) ── */
  function download(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},1500);}
  var json={
    export:function(o){var d=TE.JSON2.exportCard(Object.assign({tier:tier.current},o));download(new Blob([JSON.stringify(d,null,1)],{type:'application/json'}),TE.JSON2.exportFileName(d));return d;},
    open:function(file,cb){var r=new FileReader();r.onload=function(){var obj;try{obj=JSON.parse(r.result);}catch(e){alert(TT('ไฟล์ JSON ไม่ถูกต้อง','Invalid JSON file'));return;}
      var res=TE.JSON2.importCard(obj,tier.current);if(!res.ok){alert(lang==='en'&&TE.I18N?TE.I18N.t('tier.noOpen','en'):res.reason);return;}cb(res);};r.readAsText(file);}
  };

  /* ── Free: เตือนก่อนออก/รีเฟรช ── */
  var dirty=false;
  document.addEventListener('input',function(){dirty=true;},true);
  window.addEventListener('beforeunload',function(e){if(dirty&&tier.can('session.warnUnload')){e.preventDefault();e.returnValue=TT('ข้อมูลที่กรอกจะหาย — ส่งออกไฟล์เก็บไว้ได้ เปิดกลับมาคำนวณต่อได้ในระดับ Pro','Entered data will be lost — export a file; it can be reopened in Pro tier.');return e.returnValue;}});

  root.TE_UI={_ver:'TE_UI r2-2569',$:$,el:el,esc:esc,fx:fx,tt:TT,lang:langApi,tier:tier,fuelPicker:fuelPicker,sourceSelects:sourceSelects,sourcesOf:sourcesOf,srcLabel:srcLabel,qcPanel:qcPanel,issuer:issuer,report:report,json:json,download:download,REPORT_CSS:REPORT_CSS};
})(window);
