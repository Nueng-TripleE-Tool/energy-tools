/*!
 * te-insight.js — ระบบเก็บสถิติการใช้งานเครื่องมือ energy-tools (ระยะ 0 / ก้อน 0A)
 * อ.หนึ่ง กลับทวี × Triple E Technology — 2569
 * 0B: ปุ่ม 💬 ความคิดเห็น + ⭐ Pro (fake-door/ลงชื่อรอใช้) + แบบสอบถาม 3 ข้อ (ชวนเมื่อเปิดเครื่องมือครบ 3 ครั้ง)
 *     ซ่อนปุ่มลอยในหน้าใดได้ด้วย <body data-te-fab="off">
 *
 * หลักการ
 *  - ไม่เก็บตัวเลขที่ผู้ใช้กรอกเด็ดขาด เก็บเฉพาะ "พฤติกรรม" (เปิด/คำนวณ/สลับแท็บ/บันทึก/พิมพ์)
 *  - ไม่ยินยอม หรือยังไม่ตอบ → ส่งเฉพาะจำนวนครั้งแบบไม่มีรหัสผู้ใช้
 *  - ยินยอม → แนบรหัสนิรนามแบบสุ่ม เพื่อดูการกลับมาใช้ซ้ำ
 *  - เปิดไฟล์จากเครื่อง (file://) หรือ offline → ไม่ส่งอะไร และเครื่องมือทำงานตามปกติ
 *
 * ใส่ในเครื่องมือด้วยบรรทัดเดียวก่อน </body>:
 *   <script src="../te-insight.js" defer></script>
 * เรียกใช้เองได้:  TE_INSIGHT.track('feature', 'pro-report-word')
 *                 ปุ่มใด ๆ ที่มี data-te-feature="ชื่อฟีเจอร์" จะถูกนับอัตโนมัติ
 */
(function () {
  'use strict';
  if (window.TE_INSIGHT) return;

  var ENDPOINT = 'https://te-insight.nk-triplee.workers.dev';   // ← แก้ให้ตรงกับชื่อ Worker จริง
  var VERSION = '0B-2569.10.04';
  var CF_WA_TOKEN = '51f5031fa4f94310b268102ab1bb261c';   // ก้อน 0C: token ของ Cloudflare Web Analytics (ว่าง = ปิด)
  var KEY_CONSENT = 'te_consent', KEY_VID = 'te_vid', KEY_SID = 'te_sid';

  /* ---------- พื้นฐาน ---------- */
  var scriptEl = document.currentScript;
  var BASE = scriptEl ? scriptEl.src.replace(/[^\/]*$/, '') : './';
  var qs = new URLSearchParams(location.search);
  var TEST = qs.get('teinsight') === 'test';
  if (qs.get('teinsight_endpoint') && TEST) ENDPOINT = qs.get('teinsight_endpoint');
  var ACTIVE = location.protocol === 'https:' || TEST;          // file:// = ปิด

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function sstore(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function rid() { var a = new Uint8Array(9); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.random() * 256; }); return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function clip(s, n) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, n || 60); }

  function toolName() {
    var p = location.pathname.split('/').pop() || 'index.html';
    var n = p.replace(/\.html?$/i, '') || 'index';
    if (n === 'reader' && qs.get('b')) n = 'book:' + clip(qs.get('b'), 40);
    return n;
  }
  var TOOL = toolName();
  var DEV = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
  var REF = (function () { try { var r = document.referrer ? new URL(document.referrer).hostname : ''; return r === location.hostname ? 'internal' : r; } catch (e) { return ''; } })();

  function consent() { return store(KEY_CONSENT); }            // 'yes' | 'no' | null
  function ids() {
    if (consent() !== 'yes') return { vid: null, sid: null };
    var v = store(KEY_VID); if (!v) { v = rid(); store(KEY_VID, v); }
    var s = sstore(KEY_SID); if (!s) { s = rid(); sstore(KEY_SID, s); }
    return { vid: v, sid: s };
  }

  /* ---------- คิวและการส่ง ---------- */
  var queue = [], timer = null;
  function track(ev, detail, tool) {
    if (!ACTIVE) return;
    queue.push({ ev: ev, detail: detail == null ? null : clip(detail, 80), tool: tool || TOOL, ts: Date.now() });
    if (queue.length >= 25) flush(); else if (!timer) timer = setTimeout(flush, 8000);
  }
  function flush(useBeacon) {
    clearTimeout(timer); timer = null;
    if (!queue.length || !ACTIVE) return;
    var i = ids();
    var payload = JSON.stringify({ v: VERSION, vid: i.vid, sid: i.sid, dev: DEV, ref: REF, events: queue.splice(0, 40) });
    var url = ENDPOINT + '/e';
    try {
      if (useBeacon && navigator.sendBeacon && navigator.sendBeacon(url, new Blob([payload], { type: 'text/plain' }))) return;
      fetch(url, { method: 'POST', body: payload, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(function () {});
    } catch (e) { /* เงียบ ไม่รบกวนเครื่องมือ */ }
    if (queue.length) flush(useBeacon);
  }

  /* ---------- ตรวจจับพฤติกรรมอัตโนมัติ (ไม่ต้องแก้โค้ดเครื่องมือ) ---------- */
  var RE_TAB = /(goTab|switchTab|showTab|selectTab|openTab|setTab|\btab\()/i;
  var RE_CALC = /(คำนวณ|วิเคราะห์|ประเมิน|จำลอง|calculate|compute|analy[sz]e|simulate|\brun\b)/i;
  var RE_SAMPLE = /(loadSample|loadExample|ตัวอย่าง|sample|example|demo)/i;
  var lastHit = {};
  function throttled(key, ms) { var t = Date.now(); if (lastHit[key] && t - lastHit[key] < (ms || 2500)) return true; lastHit[key] = t; return false; }
  function label(el) { return clip(el.getAttribute('data-te-label') || el.getAttribute('aria-label') || el.textContent || el.title || el.id, 40); }

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('button,a,[onclick],[role=tab],[data-tab],[data-te-feature],.tab,.tab-btn,.tab-button,.nav-tab') : null;
    if (!el || el.closest('#te-consent,.tei-ov,.tei-fab,.tei-toast')) return;
    var oc = el.getAttribute('onclick') || '';
    var cls = (el.className && el.className.baseVal === undefined ? el.className : '') || '';

    var feat = el.getAttribute('data-te-feature');
    if (feat) { track('feature', feat); return; }               // ก้อน 0B: เปิดหน้า Pro ด้วย (ดูด้านล่าง)
    if (el.tagName === 'A' && el.hasAttribute('download')) { track('export', extOf(el.getAttribute('download'))); return; }
    if (/print/i.test(oc)) return;                                   // นับผ่าน beforeprint แทน
    if (RE_TAB.test(oc) || /(^|\s)(tab|tab-btn|tab-button|nav-tab)(\s|$)/.test(cls) || el.getAttribute('role') === 'tab' || el.hasAttribute('data-tab')) {
      var t = label(el); if (!throttled('tab:' + t, 800)) track('tab', t); return;
    }
    if (RE_SAMPLE.test(oc) || (el.tagName === 'BUTTON' && RE_SAMPLE.test(el.textContent || ''))) { if (!throttled('sample', 1500)) track('sample', label(el)); return; }
    if (RE_CALC.test(el.textContent || '') || /calc|compute|run|solve|analy/i.test(oc)) {
      var c = label(el); if (!throttled('calc:' + c)) track('calc', c);
    }
  }, true);

  // ไฟล์ที่ดาวน์โหลดด้วย a.click() ในสคริปต์ (JSON / CSV / XLSX / PNG / DOCX)
  function extOf(name) { var m = /\.([a-z0-9]{1,5})$/i.exec(name || ''); return m ? m[1].toLowerCase() : 'file'; }
  try {
    var origClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      try { if (this.hasAttribute('download') && !this.isConnected) track('export', extOf(this.getAttribute('download'))); } catch (e) {}
      return origClick.apply(this, arguments);
    };
  } catch (e) {}

  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el && el.type === 'file' && el.files && el.files.length) track('import', extOf(el.files[0].name));
  }, true);

  window.addEventListener('beforeprint', function () { if (!throttled('print', 5000)) track('print', null); });
  window.addEventListener('error', function (e) { if (!throttled('err', 10000)) track('error', clip((e.message || 'error') + ' @' + (e.lineno || ''), 80)); });

  // เวลาใช้งานจริง (นับเฉพาะตอนหน้าต่างเปิดอยู่)
  var visibleSince = document.visibilityState === 'visible' ? Date.now() : null, engagedMs = 0, timeSent = false;
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { if (visibleSince) { engagedMs += Date.now() - visibleSince; visibleSince = null; } sendTime(); flush(true); }
    else visibleSince = Date.now();
  });
  window.addEventListener('pagehide', function () { if (visibleSince) { engagedMs += Date.now() - visibleSince; visibleSince = null; } sendTime(); flush(true); });
  function sendTime() {
    var sec = Math.round(engagedMs / 1000);
    if (sec >= 5 && !timeSent) { timeSent = true; track('time', String(Math.min(sec, 4 * 3600))); }
  }

  /* ---------- แบนเนอร์ขอความยินยอม (PDPA) ---------- */
  function showBanner(force) {
    if (!ACTIVE || (!force && consent())) return;
    if (document.getElementById('te-consent')) return;
    var css = document.createElement('style');
    css.textContent =
      '#te-consent{position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483000;max-width:760px;margin:0 auto;' +
      'background:#0b2545;color:#eef4f8;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.28);padding:14px 16px;' +
      'font:14px/1.55 "IBM Plex Sans Thai",system-ui,sans-serif;display:flex;gap:12px;flex-wrap:wrap;align-items:center}' +
      '#te-consent p{margin:0;flex:1 1 360px}#te-consent a{color:#7fe0d6}' +
      '#te-consent button{border:0;border-radius:8px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer}' +
      '#te-consent .y{background:#14b8a6;color:#062a2a}#te-consent .n{background:transparent;color:#eef4f8;border:1px solid #5b7894}' +
      '@media print{#te-consent{display:none!important}}';
    var box = document.createElement('div');
    box.id = 'te-consent'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'การเก็บสถิติการใช้งาน');
    box.innerHTML =
      '<p>เว็บนี้เก็บ<b>สถิติการใช้งาน</b>แบบไม่ระบุตัวตน (เช่น เปิดเครื่องมือใด กดคำนวณกี่ครั้ง) เพื่อพัฒนาเครื่องมือ ' +
      '<b>ไม่เก็บตัวเลขที่ท่านกรอก</b> — ' +
      '<a href="' + BASE + 'privacy.html" target="_blank" rel="noopener">อ่านนโยบายความเป็นส่วนตัว</a></p>' +
      '<button class="n" type="button">เฉพาะที่จำเป็น</button><button class="y" type="button">ยินยอม</button>';
    document.head.appendChild(css); document.body.appendChild(box);
    box.querySelector('.y').onclick = function () { setConsent('yes'); };
    box.querySelector('.n').onclick = function () { setConsent('no'); };
  }
  function setConsent(v) {
    var prev = consent();
    store(KEY_CONSENT, v);
    if (v === 'no') store(KEY_VID, null);
    var b = document.getElementById('te-consent'); if (b) b.remove();
    if (prev !== v) track('consent', v);
  }

  /* =====================================================================
   * ก้อน 0B — ความคิดเห็น · แบบสอบถาม 3 ข้อ · ฟีเจอร์ Pro (fake-door) · ลงชื่อรอใช้
   * [แก้ไข 4 ต.ค. 2569] ก้อน 0B
   * ===================================================================== */
  var PRO_FEATURES = [
    { id: 'pro-report-word',  icon: '📄', t: 'ออกรายงาน Word/PDF ภาษาไทยอัตโนมัติ', d: 'รูปแบบรายงานตรวจวัดมาตรฐาน ไม่มีลายน้ำ แก้ไขต่อได้' },
    { id: 'pro-cloud-save',   icon: '☁️', t: 'บันทึกโครงการบนคลาวด์ หลายโรงงาน', d: 'เปิดต่อได้ทุกเครื่อง เก็บประวัติการตรวจวัดย้อนหลัง' },
    { id: 'pro-field-form',   icon: '📱', t: 'แบบฟอร์มเก็บข้อมูลหน้างานบนมือถือ', d: 'กรอกหน้างาน offline แล้วส่งเข้าเครื่องมือได้ทันที' },
    { id: 'pro-ecm-ghg',      icon: '🌱', t: 'สรุปมาตรการ + ผลลด GHG ทั้งโรงงาน', d: 'รวมผลจากทุกเครื่องมือ ผลประหยัด ระยะคืนทุน tCO₂e' },
    { id: 'expert-raw-data',  icon: '🧑‍🔧', t: 'ส่งข้อมูลดิบ ให้ผู้เชี่ยวชาญวิเคราะห์และออกรายงาน', d: 'รายงานเทคนิค + สรุปผู้บริหาร โดยทีม Triple E' },
    { id: 'plant-model',      icon: '🏭', t: 'แบบจำลองการใช้ทรัพยากรทั้งโรงงาน', d: 'จากแผนการผลิต → พลังงาน น้ำ วัตถุดิบ ต้นทุน และ GHG' }
  ];
  var ROLES = ['วิศวกรโรงงาน/อาคาร', 'ผชร./ผอส.', 'ที่ปรึกษา/ผู้ตรวจสอบพลังงาน', 'ผู้บริหาร/เจ้าของกิจการ', 'อาจารย์/นักวิจัย', 'นักศึกษา', 'อื่น ๆ'];
  var SECTORS = ['โรงไฟฟ้า/พลังงาน', 'อาหารและเครื่องดื่ม', 'ปาล์ม/ชีวมวล/น้ำตาล', 'เคมี/ปิโตรเคมี/พลาสติก', 'โลหะ/เหล็ก', 'สิ่งทอ/ยาง/กระดาษ', 'อาคาร/โรงแรม/โรงพยาบาล', 'หน่วยงานรัฐ/สถานศึกษา', 'อื่น ๆ'];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function opts(a) { return '<option value="">— เลือก —</option>' + a.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join(''); }

  var uiReady = false;
  function ensureUI() {
    if (uiReady) return; uiReady = true;
    var css = document.createElement('style');
    css.textContent =
      '.tei-fab{position:fixed;right:14px;bottom:14px;z-index:2147482000;display:flex;gap:8px;font:600 14px/1 "IBM Plex Sans Thai",Sarabun,system-ui,sans-serif}' +
      '.tei-fab button{border:0;border-radius:22px;padding:10px 14px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.22);font:inherit}' +
      '.tei-fab .fb{background:#0b2545;color:#fff}.tei-fab .pro{background:#d4ac0d;color:#2b2100}' +
      '.tei-ov{position:fixed;inset:0;background:rgba(5,15,25,.55);z-index:2147483100;display:flex;align-items:center;justify-content:center;padding:16px}' +
      '.tei-md{background:#fff;color:#1f2d3a;width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.35);font:15px/1.6 "IBM Plex Sans Thai",Sarabun,system-ui,sans-serif}' +
      '.tei-md header{position:sticky;top:0;z-index:1;background:linear-gradient(120deg,#0b2545,#1a5276 55%,#0f8b8d);color:#fff;padding:14px 18px;border-radius:14px 14px 0 0;display:flex;justify-content:space-between;align-items:center}' +
      '.tei-md header b{font-size:1.05rem}.tei-md header button{background:transparent;border:0;color:#fff;font-size:1.3rem;cursor:pointer}' +
      '.tei-bd{padding:14px 18px}.tei-bd label{display:block;font-weight:600;margin:10px 0 4px;font-size:.92rem}' +
      '.tei-bd select,.tei-bd textarea,.tei-bd input[type=email]{width:100%;box-sizing:border-box;border:1px solid #c9d6e2;border-radius:8px;padding:8px 10px;font:inherit}' +
      '.tei-bd textarea{min-height:80px}.tei-note{color:#6b7c8c;font-size:.83rem}' +
      '.tei-stars button{background:none;border:0;font-size:1.6rem;cursor:pointer;color:#c9d6e2;padding:0 2px}.tei-stars button.on{color:#d4ac0d}' +
      '.tei-ck{display:flex;gap:8px;align-items:flex-start;font-weight:400!important;font-size:.88rem!important}' +
      '.tei-ft{display:flex;justify-content:flex-end;gap:8px;padding:0 18px 16px}' +
      '.tei-ft button{border:0;border-radius:8px;padding:9px 16px;font:inherit;font-weight:600;cursor:pointer}.tei-ok{background:#0f8b8d;color:#fff}.tei-cx{background:#eef3f7;color:#1f2d3a}' +
      '.tei-feat{display:flex;gap:10px;align-items:flex-start;border:1px solid #dbe4ec;border-radius:10px;padding:10px;margin:8px 0}' +
      '.tei-feat .i{font-size:1.5rem;line-height:1}.tei-feat .x{flex:1}.tei-feat .x b{display:block}.tei-feat .x span{color:#6b7c8c;font-size:.86rem}' +
      '.tei-feat button{border:1px solid #0f8b8d;background:#fff;color:#0f8b8d;border-radius:8px;padding:6px 10px;font:inherit;font-weight:600;cursor:pointer;white-space:nowrap}' +
      '.tei-feat button.on{background:#0f8b8d;color:#fff}' +
      '.tei-toast{position:fixed;right:14px;bottom:66px;z-index:2147482500;max-width:330px;background:#fff;color:#1f2d3a;border-left:5px solid #0f8b8d;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.25);padding:12px 14px;font:14px/1.55 "IBM Plex Sans Thai",Sarabun,system-ui,sans-serif}' +
      '.tei-toast button{margin:8px 6px 0 0;border:0;border-radius:7px;padding:6px 12px;font:inherit;font-weight:600;cursor:pointer}' +
      '.tei-hp{position:absolute;left:-9999px}' +
      '@media print{.tei-fab,.tei-ov,.tei-toast{display:none!important}}' +
      '@media (max-width:560px){.tei-fab .lbl{display:none}}';
    document.head.appendChild(css);
    if (document.body.getAttribute('data-te-fab') !== 'off') {
      var fab = document.createElement('div'); fab.className = 'tei-fab';
      fab.innerHTML = '<button class="pro" type="button" title="ฟีเจอร์ Pro ที่กำลังพัฒนา">⭐<span class="lbl"> Pro</span></button>' +
                      '<button class="fb" type="button" title="ส่งความคิดเห็น">💬<span class="lbl"> ความคิดเห็น</span></button>';
      document.body.appendChild(fab);
      fab.querySelector('.fb').onclick = function () { track('feature', 'ui-feedback-open'); openFeedback('feedback'); };
      fab.querySelector('.pro').onclick = function () { track('feature', 'ui-pro-open'); openPro(); };
    }
  }

  function modal(title, body, okText, onOk) {
    var ov = document.createElement('div'); ov.className = 'tei-ov';
    ov.innerHTML = '<div class="tei-md" role="dialog" aria-modal="true"><header><b>' + title + '</b><button type="button" aria-label="ปิด">×</button></header>' +
      '<div class="tei-bd">' + body + '<input class="tei-hp" name="website" tabindex="-1" autocomplete="off"></div>' +
      '<div class="tei-ft"><span class="tei-msg tei-note" style="margin-right:auto;align-self:center"></span>' +
      '<button type="button" class="tei-cx">ปิด</button>' + (okText ? '<button type="button" class="tei-ok">' + okText + '</button>' : '') + '</div></div>';
    document.body.appendChild(ov);
    var close = function () { ov.remove(); };
    ov.querySelector('header button').onclick = close; ov.querySelector('.tei-cx').onclick = close;
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    if (okText) ov.querySelector('.tei-ok').onclick = function () { onOk(ov, close); };
    return ov;
  }
  function msg(ov, t, bad) { var m = ov.querySelector('.tei-msg'); m.textContent = t; m.style.color = bad ? '#b71c1c' : '#1d8348'; }
  function val(ov, n) { var el = ov.querySelector('[name="' + n + '"]'); return el ? (el.type === 'checkbox' ? el.checked : el.value.trim()) : ''; }
  function emailBlock(note) {
    return '<label>อีเมล (ไม่บังคับ)</label><input type="email" name="email" placeholder="name@company.com">' +
      '<label class="tei-ck"><input type="checkbox" name="cc"> ยินยอมให้ติดต่อกลับทางอีเมลนี้ ' + (note || '') + ' — ' +
      '<a href="' + BASE + 'privacy.html" target="_blank" rel="noopener">นโยบายความเป็นส่วนตัว</a></label>';
  }
  function postFeedback(data, ov, close, thanks) {
    if (val(ov, 'website')) { close(); return; }               // honeypot กันบอท
    var email = val(ov, 'email'), cc = val(ov, 'cc');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg(ov, 'รูปแบบอีเมลไม่ถูกต้อง', true); return; }
    if (email && !cc) { msg(ov, 'กรุณาติ๊กยินยอมให้ติดต่อกลับ หรือเว้นอีเมลว่าง', true); return; }
    data.vid = ids().vid; data.tool = TOOL; data.email = email; data.consent_contact = cc && email ? 1 : 0;
    if (!ACTIVE) { msg(ov, 'โหมด offline — ส่งไม่ได้ กรุณาเปิดจากเว็บไซต์', true); return; }
    ov.querySelector('.tei-ok').disabled = true; msg(ov, 'กำลังส่ง…');
    fetch(ENDPOINT + '/feedback', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'text/plain' } })
      .then(function (r) { if (!r.ok) throw 0; msg(ov, thanks || 'ขอบคุณครับ ได้รับข้อมูลแล้ว'); setTimeout(close, 1400); })
      .catch(function () { ov.querySelector('.tei-ok').disabled = false; msg(ov, 'ส่งไม่สำเร็จ ลองใหม่อีกครั้ง', true); });
  }

  function openFeedback(kind) {
    ensureUI();
    var survey = kind === 'survey';
    var body = (survey ? '<p class="tei-note" style="margin:0">3 ข้อ ใช้เวลาไม่ถึง 1 นาที ช่วยให้เราพัฒนาเครื่องมือได้ตรงความต้องการ</p>' :
        '<label>ความพึงพอใจต่อเครื่องมือนี้</label><div class="tei-stars">' + [1, 2, 3, 4, 5].map(function (i) { return '<button type="button" data-v="' + i + '">★</button>'; }).join('') + '</div>') +
      '<label>1) ท่านคือ</label><select name="role">' + opts(ROLES) + '</select>' +
      '<label>2) ประเภทกิจการที่ท่านดูแล/ให้บริการ</label><select name="sector">' + opts(SECTORS) + '</select>' +
      '<label>3) ' + (survey ? 'อยากให้เครื่องมือช่วยงานอะไรเพิ่ม' : 'ความคิดเห็น / ปัญหาที่พบ / อยากให้เพิ่มอะไร') + '</label>' +
      '<textarea name="message" maxlength="1500" placeholder="เช่น อยากได้รายงาน Word, อยากให้รองรับเชื้อเพลิง..., พบค่าผิดที่แท็บ..."></textarea>' +
      emailBlock('เพื่อรับคำตอบ');
    var rating = 0;
    var ov = modal(survey ? 'แบบสอบถามสั้น 3 ข้อ' : 'ส่งความคิดเห็น', body, 'ส่ง', function (ov, close) {
      var role = val(ov, 'role'), sector = val(ov, 'sector'), m = val(ov, 'message');
      if (survey && (!role || !sector)) { msg(ov, 'กรุณาเลือกข้อ 1 และ 2', true); return; }
      if (!survey && !m && !rating) { msg(ov, 'กรุณาให้คะแนนหรือพิมพ์ความคิดเห็น', true); return; }
      store('te_survey', 'done');
      postFeedback({ kind: kind, rating: rating || null, role: role, sector: sector, message: m }, ov, close);
    });
    [].forEach.call(ov.querySelectorAll('.tei-stars button'), function (b) {
      b.onclick = function () { rating = +b.getAttribute('data-v'); [].forEach.call(ov.querySelectorAll('.tei-stars button'), function (x) { x.classList.toggle('on', +x.getAttribute('data-v') <= rating); }); };
    });
  }

  function openPro(focusId) {
    ensureUI();
    var chosen = {};
    if (focusId) chosen[focusId] = 1;
    var body = '<p class="tei-note" style="margin:0 0 4px">ฟีเจอร์เหล่านี้กำลังพัฒนาเป็นบริการแบบสมาชิก กด <b>สนใจ</b> ได้หลายข้อ — เราจะเปิดตามลำดับความสนใจ</p>' +
      PRO_FEATURES.map(function (f) {
        return '<div class="tei-feat"><div class="i">' + f.icon + '</div><div class="x"><b>' + f.t + '</b><span>' + f.d + '</span></div>' +
          '<button type="button" data-f="' + f.id + '"' + (chosen[f.id] ? ' class="on"' : '') + '>' + (chosen[f.id] ? '✓ สนใจ' : 'สนใจ') + '</button></div>';
      }).join('') +
      '<label>ท่านคือ</label><select name="role">' + opts(ROLES) + '</select>' +
      emailBlock('เมื่อฟีเจอร์เปิดให้ทดลองใช้');
    var ov = modal('⭐ Pro — กำลังพัฒนา', body, 'ลงชื่อรอใช้', function (ov, close) {
      var list = Object.keys(chosen);
      if (!list.length) { msg(ov, 'กรุณากด "สนใจ" อย่างน้อย 1 ข้อ', true); return; }
      postFeedback({ kind: 'waitlist', role: val(ov, 'role'), message: list.join(',') }, ov, close, 'ลงชื่อแล้ว ขอบคุณครับ');
    });
    [].forEach.call(ov.querySelectorAll('.tei-feat button'), function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-f');
        if (chosen[id]) { delete chosen[id]; b.classList.remove('on'); b.textContent = 'สนใจ'; }
        else { chosen[id] = 1; b.classList.add('on'); b.textContent = '✓ สนใจ'; track('feature', id); }
      };
    });
  }

  // ปุ่มในเครื่องมือที่มี data-te-feature → นับแล้วเปิดหน้า Pro ที่เลือกข้อนั้นไว้
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-te-feature]') : null;
    if (el) { e.preventDefault(); openPro(el.getAttribute('data-te-feature')); }
  });

  // ชวนตอบแบบสอบถาม เมื่อเปิดเครื่องมือครบ 3 ครั้ง (นับในเบราว์เซอร์เท่านั้น ไม่ส่งออก)
  function maybeSurvey() {
    if (!ACTIVE || store('te_survey') || TOOL === 'index' || TOOL === 'privacy') return;
    var n = (+store('te_opens') || 0) + 1; store('te_opens', String(n));
    if (n < 3 || sstore('te_survey_shown')) return;
    sstore('te_survey_shown', '1');
    setTimeout(function () {
      if (document.querySelector('.tei-ov') || document.getElementById('te-consent')) return;
      var t = document.createElement('div'); t.className = 'tei-toast';
      t.innerHTML = '<b>ช่วยเราพัฒนาเครื่องมือ</b><br>ตอบ 3 ข้อ ไม่ถึง 1 นาที<br>' +
        '<button type="button" style="background:#0f8b8d;color:#fff">ตอบเลย</button><button type="button" style="background:#eef3f7">ไว้ทีหลัง</button><button type="button" style="background:none;color:#6b7c8c">ไม่ต้องถามอีก</button>';
      document.body.appendChild(t);
      var b = t.querySelectorAll('button');
      b[0].onclick = function () { t.remove(); track('feature', 'ui-survey-open'); openFeedback('survey'); };
      b[1].onclick = function () { t.remove(); };
      b[2].onclick = function () { t.remove(); store('te_survey', 'never'); };
    }, 45000);
  }

  /* ---------- API สาธารณะ ---------- */
  window.TE_INSIGHT = {
    version: VERSION, tool: TOOL,
    track: track, flush: flush,
    consent: consent, setConsent: setConsent,
    openSettings: function () { showBanner(true); },
    endpoint: function () { return ENDPOINT; },
    ids: ids,
    openFeedback: function () { openFeedback('feedback'); },
    openSurvey: function () { openFeedback('survey'); },
    openPro: openPro
  };

  function start() {
    track('open', DEV);
    if (CF_WA_TOKEN && location.protocol === 'https:') {          // ก้อน 0C: Cloudflare Web Analytics (ไม่ใช้ cookie)
      var wa = document.createElement('script'); wa.defer = true; wa.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      wa.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_WA_TOKEN })); document.head.appendChild(wa);
    }
    showBanner(false);
    if (TOOL !== 'privacy') ensureUI();
    maybeSurvey();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
