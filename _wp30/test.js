/* WP-30 browser test — run from repo root:
   (cd /home/claude/wt/wp30 && python3 -m http.server 8911 --bind 127.0.0.1 >/tmp/wp30.log 2>&1 &); sleep 1; node _wp30/test.js
   Prereq: python3 -I _wp30/check_data.py (writes _wp30/random_sets.json from the .xls) */
const { chromium } = require('/home/claude/gk/node_modules/playwright');
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'tools', 'Tool_Steam_System_Scoping.html');
const URL0 = 'http://127.0.0.1:8911/tools/Tool_Steam_System_Scoping.html';
const SETS = JSON.parse(fs.readFileSync(path.join(__dirname, 'random_sets.json'), 'utf8'));
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const R = {}; const fails = [];
const ok = (k, cond, info) => { R[k] = { pass: !!cond, info }; if (!cond) fails.push(k + ': ' + JSON.stringify(info).slice(0, 600)); };
const THAI = /[฀-๿]/;

async function newPage(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: opts.w || 1280, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errs = [];
  await page.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
  page.on('pageerror', e => errs.push(String(e && e.message || e)));
  page.on('dialog', d => d.accept());
  await page.goto(URL0 + (opts.q || ''), { waitUntil: 'load' });
  await page.waitForTimeout(400);
  return { ctx, page, errs };
}
const readScreen = page => page.evaluate(() => {
  const n = id => { const e = document.getElementById(id); return e ? Number(e.textContent.trim()) : NaN; };
  return { total: n('sum_total'), hdr: n('hdr_total'), max: n('sum_max'), cat: { 1: n('cs_1'), 2: n('cs_2'), 3: n('cs_3'), 4: n('cs_4') },
    q: Object.fromEntries([...document.querySelectorAll('#qtab td[id^="qs_"]')].map(td => [td.id.slice(3), Number(td.textContent)])) };
});
const sameCat = (a, b) => [1, 2, 3, 4].every(k => a[k] === b[k]);

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--no-sandbox'] });

  /* ---- 7: static checks ---- */
  const html = fs.readFileSync(FILE, 'utf8');
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)].filter(m => !/application\/json/.test(m[1]));
  let checkOk = 0, checkErr = [];
  scripts.forEach((m, i) => { const f = path.join(OUT, 'inline_' + i + '.js'); fs.writeFileSync(f, m[2]);
    try { cp.execFileSync('node', ['--check', f], { stdio: 'pipe' }); checkOk++; } catch (e) { checkErr.push(i + ': ' + String(e.stderr)); } });
  const htmlNoScript = html.replace(/<script[\s\S]*?<\/script>/g, '');
  const dOpen = (htmlNoScript.match(/<div\b/g) || []).length, dClose = (htmlNoScript.match(/<\/div>/g) || []).length;
  const staticIds = [...htmlNoScript.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const dupStatic = staticIds.filter((x, i) => staticIds.indexOf(x) !== i);
  const linkFiles = [...new Set([...html.matchAll(/f:'([A-Za-z_]+\.html)'/g)].map(m => m[1]))];
  const missingLinks = linkFiles.filter(f => !fs.existsSync(path.join(ROOT, 'tools', f)));
  ok('7_node_check', checkErr.length === 0 && checkOk === scripts.length, { inlineScripts: scripts.length, passed: checkOk, errors: checkErr });
  ok('7_div_balance_static', dOpen === dClose, { open: dOpen, close: dClose });
  ok('4b_link_targets_exist', missingLinks.length === 0, { linked: linkFiles, missing: missingLinks });
  ok('ins_te_insight_once', (html.match(/te-insight\.js/g) || []).length === 1, {});

  /* ---- TH desktop: best / worst with real clicks ---- */
  let { ctx, page, errs } = await newPage(browser);
  const thErrs = errs;
  const qcat = await page.evaluate(() => Object.fromEntries(QS.map(q => [q.id, q.cat])));
  async function clickSet(set) {
    await page.evaluate(() => clearAll(true));
    for (const c of [1, 2, 3, 4]) {
      await page.click('.tab[data-tab="c' + c + '"]');
      for (const id of set.ids) { const q = id.split('_')[1]; if (qcat[q] !== c) continue; await page.click('#' + id); }
    }
    await page.click('.tab[data-tab="sum"]');
    return readScreen(page);
  }
  const best = await clickSet(SETS[0]), worst = await clickSet(SETS[1]);
  ok('2a_best_340', best.total === 340 && best.hdr === 340 && sameCat(best.cat, { 1: 90, 2: 140, 3: 80, 4: 30 }), best);
  ok('2b_worst_0', worst.total === 0 && worst.hdr === 0 && sameCat(worst.cat, { 1: 0, 2: 0, 3: 0, 4: 0 }), worst);
  // DOM id duplicates after full render
  const dupDom = await page.evaluate(() => { const ids = [...document.querySelectorAll('[id]')].map(e => e.id); return ids.filter((x, i) => ids.indexOf(x) !== i); });
  ok('7_no_duplicate_ids', dupStatic.length === 0 && dupDom.length === 0, { staticDup: dupStatic, domDup: [...new Set(dupDom)] });
  const domDiv = await page.evaluate(() => document.querySelectorAll('div').length);
  R['7_div_balance_static'].info.renderedDivs = domDiv;

  /* ---- 200 random sets (DOM clicks inside the page) ---- */
  let mism = [], nrnd = 0;
  for (const s of SETS.slice(2)) {
    const got = await page.evaluate(ids => { clearAll(true); ids.forEach(id => document.getElementById(id).click()); return null; }, s.ids);
    const sc = await readScreen(page); nrnd++;
    if (sc.total !== s.total || sc.hdr !== s.total || !sameCat(sc.cat, s.cat)) mism.push({ set: s.name, exp: [s.total, s.cat], got: [sc.total, sc.cat] });
  }
  ok('2c_random_200', nrnd === 200 && mism.length === 0, { sets: nrnd, mismatches: mism.length, first: mism.slice(0, 3) });

  /* ---- 4: save -> load ---- */
  await page.evaluate(() => fillExample());
  await page.click('.tab[data-tab="basic"]'); await page.fill('#b_hours', '6100'); await page.fill('#p_date', '2026-11-23');
  const before = { sc: await readScreen(page), inputs: await page.evaluate(() => TE_JSON.collect()) };
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('text=💾 บันทึก JSON')]);
  const saved = path.join(OUT, 'saved_job.json'); await dl.saveAs(saved);
  await ctx.close();
  ({ ctx, page, errs } = await newPage(browser));
  const loadErrs = errs;
  await page.setInputFiles('#fileLoad', saved); await page.waitForTimeout(500);
  const after = { sc: await readScreen(page), inputs: await page.evaluate(() => TE_JSON.collect()) };
  const diffKeys = Object.keys(before.inputs).filter(k => before.inputs[k] !== after.inputs[k]);
  ok('4_save_load', diffKeys.length === 0 && JSON.stringify(before.sc) === JSON.stringify(after.sc) && before.sc.total > 0,
    { total: [before.sc.total, after.sc.total], cat: [before.sc.cat, after.sc.cat], inputsCompared: Object.keys(before.inputs).length, diffKeys });

  /* ---- 5: number parity TH vs EN (same page, same answers) + no Thai in EN ---- */
  const blocks = ['hdrBadge', 'introCard', 'tabs', 'pane-basic', 'pane-c1', 'pane-c2', 'pane-c3', 'pane-c4', 'sumCard', 'prioCard', 'qtabCard', 'basicSumCard', 'nextCard', 'foot'];
  const digits = () => page.evaluate(bl => { const o = {}; document.querySelectorAll('.tabpane').forEach(p => p.style.display = 'grid');
    bl.forEach(id => { const e = document.getElementById(id); o[id] = e ? (e.textContent.match(/\d+(?:\.\d+)?/g) || []).join(' ') : null; });
    document.querySelectorAll('.tabpane').forEach(p => p.style.display = ''); return o; }, blocks);
  const dTH = await digits();
  await page.evaluate(() => TE_I18N.setLang('en')); await page.waitForTimeout(500);
  const dEN = await digits();
  const parityBad = blocks.filter(b => dTH[b] !== dEN[b]).map(b => ({ b, th: dTH[b], en: dEN[b] }));
  const thaiLeft = await page.evaluate(() => { document.querySelectorAll('.tabpane').forEach(p => p.style.display = 'grid');
    const chip = document.getElementById('teLangChip'); const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) { const n = w.currentNode, p = n.parentElement; if (!p || /SCRIPT|STYLE/.test(p.tagName)) continue; if (chip && chip.contains(n)) continue;
      if (/[฀-๿]/.test(n.nodeValue)) out.push(n.nodeValue.trim().slice(0, 80)); }
    document.querySelectorAll('[title],[placeholder],[aria-label]').forEach(e => { if (chip && chip.contains(e)) return; ['title', 'placeholder', 'aria-label'].forEach(a => { const v = e.getAttribute(a); if (v && /[฀-๿]/.test(v)) out.push('@' + a + ':' + v.slice(0, 60)); }); });
    document.querySelectorAll('.tabpane').forEach(p => p.style.display = ''); return { out, title: document.title }; });
  ok('5a_EN_no_thai', thaiLeft.out.length === 0 && !THAI.test(thaiLeft.title), { thaiNodes: thaiLeft.out.slice(0, 10), count: thaiLeft.out.length, title: thaiLeft.title });
  ok('5b_numbers_TH_eq_EN', parityBad.length === 0, { blocksCompared: blocks.length, mismatches: parityBad });
  const scEN = await readScreen(page);
  ok('5c_scores_same_after_lang_switch', JSON.stringify(scEN) === JSON.stringify(after.sc), { th: after.sc.total, en: scEN.total });
  await page.screenshot({ path: path.join(OUT, 'en_summary.png'), fullPage: false });

  /* ---- 6: print view ---- */
  await page.evaluate(() => TE_I18N.setLang && 0);
  await page.emulateMedia({ media: 'print' });
  const pr = await page.evaluate(() => { const vis = id => { const e = document.getElementById(id); return !!e && getComputedStyle(e).display !== 'none' && e.offsetHeight > 0; };
    return { sum: vis('pane-sum'), basicPane: vis('pane-basic'), c1: vis('pane-c1'), tabs: getComputedStyle(document.querySelector('.tabs')).display,
      rows: document.querySelectorAll('#qtab td[id^="qs_"]').length, bars: [1, 2, 3, 4].every(k => vis('bar_' + k)), total: document.getElementById('sum_total').textContent,
      prHead: vis('prHead') }; });
  const pdfPath = path.join(OUT, 'print_en.pdf'); await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  let pdfTxt = ''; try { pdfTxt = cp.execFileSync('pdftotext', ['-layout', pdfPath, '-']).toString(); } catch (e) { }
  const qids = Object.keys(after.sc.q);
  const pdfHasAll = qids.every(id => pdfTxt.includes(id)) && /Total scoping tool questionnaire score/i.test(pdfTxt) && pdfTxt.includes(String(after.sc.total));
  ok('6_print_summary', pr.sum && !pr.basicPane && !pr.c1 && pr.tabs === 'none' && pr.rows === 26 && pr.bars && pr.prHead && pdfHasAll,
    { ...pr, pdfQids: qids.filter(id => pdfTxt.includes(id)).length, pdfChars: pdfTxt.length });
  await page.emulateMedia({ media: 'screen' });
  await ctx.close();

  /* ---- TH print pdf too (evidence) ---- */
  ({ ctx, page, errs } = await newPage(browser));
  const thErrs2 = errs;
  await page.evaluate(() => fillExample());
  await page.pdf({ path: path.join(OUT, 'print_th.pdf'), format: 'A4', printBackground: true });
  let thTxt = ''; try { thTxt = cp.execFileSync('pdftotext', ['-layout', path.join(OUT, 'print_th.pdf'), '-']).toString(); } catch (e) { }
  R['6_print_summary'].info.thPdfQids = qids.filter(id => thTxt.includes(id)).length;
  await ctx.close();

  /* ---- 3: errors TH / EN (fresh ?lang=en load) / 390 px, no horizontal page scroll ---- */
  ({ ctx, page, errs } = await newPage(browser, { q: '?lang=en' }));
  const enErrs = errs;
  await page.evaluate(() => fillExample());
  const enFresh = await page.evaluate(() => ({ lang: TE_I18N.lang, thai: [...document.querySelectorAll('.wrap, header, .foot')].map(e => e.innerText).join(' ').match(/[฀-๿]+/g) }));
  const enFreshSc = await readScreen(page);
  R['5a_EN_no_thai'].info.freshLoad = enFresh;
  if (enFresh.thai) { R['5a_EN_no_thai'].pass = false; fails.push('5a fresh EN load has Thai'); }
  await ctx.close();
  const mob = {};
  for (const lang of ['th', 'en']) {
    ({ ctx, page, errs } = await newPage(browser, { w: 390, q: '?lang=' + lang }));
    await page.evaluate(() => fillExample());
    const tabs = ['basic', 'c1', 'c2', 'c3', 'c4', 'sum']; const sw = {};
    for (const t of tabs) { await page.click('.tab[data-tab="' + t + '"]'); await page.waitForTimeout(80);
      sw[t] = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth);
      await page.screenshot({ path: path.join(OUT, 'm390_' + lang + '_' + t + '.png'), fullPage: false }); }
    const wideEls = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.right > window.innerWidth + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('.scroll-x'); }).slice(0, 5).map(e => e.tagName + '.' + e.className + '#' + e.id));
    mob[lang] = { overflowPx: sw, wideEls, errors: errs.slice() };
    await page.click('.tab[data-tab="sum"]'); await page.screenshot({ path: path.join(OUT, 'm390_' + lang + '_sum_full.png'), fullPage: true });
    await ctx.close();
  }
  const allErr = { th: thErrs.concat(thErrs2), load: loadErrs, enFresh: enErrs, m390_th: mob.th.errors, m390_en: mob.en.errors };
  const nErr = Object.values(allErr).reduce((a, b) => a + b.length, 0);
  ok('3_js_errors_zero', nErr === 0, allErr);
  ok('7b_390px_no_hscroll', ['th', 'en'].every(l => Object.values(mob[l].overflowPx).every(v => v <= 0)), mob);
  ok('5d_example_scores_fresh_EN_eq_TH', JSON.stringify(enFreshSc) === JSON.stringify(after.sc), { th: [after.sc.total, after.sc.cat], en: [enFreshSc.total, enFreshSc.cat] });

  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'test_result.json'), JSON.stringify(R, null, 1));
  for (const [k, v] of Object.entries(R)) console.log((v.pass ? 'PASS ' : 'FAIL ') + k + '  ' + JSON.stringify(v.info).slice(0, 300));
  console.log(fails.length ? '\nFAILED: ' + fails.length : '\nALL PASS (' + Object.keys(R).length + ' checks)');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
