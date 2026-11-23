#!/usr/bin/env python3
"""WP-30 criterion 1: read questions/options/points straight from the DOE .xls (xlrd) and compare
with the data block embedded in tools/Tool_Steam_System_Scoping.html.
Also writes _wp30/xls_ref.json (reference extracted from the .xls) and _wp30/random_sets.json
(200 random answer sets + expected totals computed here from the .xls only) for test.js.
Run: python3 -I _wp30/check_data.py"""
import json, os, re, random, sys
import xlrd
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
XLS = '/mnt/user-data/uploads/Ref. Program/SteamSystemScopingTool_Metric.xls'
HTML = os.path.join(ROOT, 'tools', 'Tool_Steam_System_Scoping.html')
norm = lambda s: re.sub(r'\s+', ' ', str(s)).strip()

wb = xlrd.open_workbook(XLS)
# ---- sheets 3-6 -> category 1-4 ----
ref = []      # list of questions
secs = []
for cat, si in enumerate([2, 3, 4, 5], start=1):
    sh = wb.sheet_by_index(si)
    cv = lambda r, c: sh.cell_value(r, c) if c < sh.ncols else ''
    cur = None; cursec = None
    for r in range(sh.nrows):
        a, b, c, d = cv(r, 0), cv(r, 1), cv(r, 2), cv(r, 3)
        sb = norm(b)
        if sb.startswith('What To Do') and cursec: cursec['todo'] = norm(sb[len('What To Do'):]); continue
        if sb.startswith('Why Important') and cursec: cursec['why'] = norm(sb[len('Why Important'):]); continue
        if isinstance(a, str) and re.fullmatch(r'[A-Z]{2}\d', a.strip()):
            cur = {'id': a.strip(), 'cat': cat, 'sec': cursec['title'], 'q': sb, 'items': [], 'opts': [], 'none': None}
            ref.append(cur)
            if c != '' and d != '':          # single-choice: first option on the question row
                cur['opts'].append({'en': norm(c), 'pts': float(d)})
            continue
        if not a and sb and c == '' and d == '' and r + 1 < sh.nrows and norm(cv(r + 1, 1)).startswith('What To Do'):
            cursec = {'title': sb, 'cat': cat}; secs.append(cursec); cur = None; continue
        if cur is not None and c != '' and isinstance(d, float):
            if sb:                            # multi-select item: label in col B, 'yes' in col C
                assert norm(c).lower() == 'yes', (cur['id'], c)
                cur['items'].append({'en': sb, 'pts': d})
            elif cur['items']:
                cur['none'] = {'en': norm(c), 'pts': d}
            else:
                cur['opts'].append({'en': norm(c), 'pts': d})
        elif cur is not None and not sb and c == '' and d == '':
            pass
for q in ref:
    q['type'] = 'multi' if q['items'] else 'single'
    q['max'] = sum(i['pts'] for i in q['items']) if q['items'] else max(o['pts'] for o in q['opts'])
# ---- sheet 7 summary (possible score per question & short titles) ----
s7 = wb.sheet_by_index(6); summ = {}; catmax = {}
for r in range(s7.nrows):
    t = norm(s7.cell_value(r, 0))
    m = re.match(r'([A-Z]{2}\d):\s*(.+)', t)
    if m: summ[m.group(1)] = {'short': m.group(2), 'possible': s7.cell_value(r, 1)}
for r, k in [(74, 1), (75, 2), (76, 3), (77, 4)]:
    catmax[k] = s7.cell_value(r, 1)
total_possible = s7.cell_value(79, 1)

fails = []
def chk(cond, msg):
    if not cond: fails.append(msg)
chk(len(ref) == 26, 'xls question count %d' % len(ref))
for q in ref:
    chk(summ.get(q['id'], {}).get('possible') == q['max'], 'sheet7 possible mismatch %s' % q['id'])
cm = {k: sum(q['max'] for q in ref if q['cat'] == k) for k in (1, 2, 3, 4)}
chk(cm == {1: 90, 2: 140, 3: 80, 4: 30} and cm == catmax, 'xls category max %r / sheet7 %r' % (cm, catmax))
chk(sum(cm.values()) == 340 == total_possible, 'xls total')

# ---- tool data block ----
html = open(HTML, encoding='utf-8').read()
m = re.search(r'<script type="application/json" id="ssst-data">(.*?)</script>', html, re.S)
tool = json.loads(m.group(1).replace('<\\/', '</'))
tq = tool['qs']; tsec = {s['id']: s for s in tool['secs']}
chk(len(tq) == 26, 'tool question count %d' % len(tq))
chk([q['id'] for q in tq] == [q['id'] for q in ref], 'question order/ids differ')
tmax = {}; tcat = {1: 0, 2: 0, 3: 0, 4: 0}; nopt = 0
for x, q in zip(ref, tq):
    i = x['id']
    chk(q['type'] == x['type'], '%s type %s vs xls %s' % (i, q['type'], x['type']))
    chk(norm(q['q']['en']) == x['q'], '%s question text differs' % i)
    chk(norm(q['short']['en']) == summ[i]['short'], '%s short title differs' % i)
    chk(tsec[q['sec']]['cat'] == x['cat'], '%s category' % i)
    chk(norm(tsec[q['sec']]['en']).lower() == x['sec'].lower(), '%s section title %r vs %r' % (i, tsec[q['sec']]['en'], x['sec']))
    src = x['items'] if x['type'] == 'multi' else x['opts']
    chk(len(q['opts']) == len(src), '%s option count' % i)
    for o, so in zip(q['opts'], src):
        nopt += 1
        chk(norm(o['en']) == so['en'], '%s option text %r vs %r' % (i, o['en'], so['en']))
        chk(float(o['pts']) == so['pts'], '%s option points %s vs %s' % (i, o['pts'], so['pts']))
        chk(bool(o.get('th')), '%s option missing Thai' % i)
    if x['type'] == 'multi':
        chk(q.get('none') and norm(q['none']['en']) == x['none']['en'] and x['none']['pts'] == 0, '%s none option' % i)
    mx = sum(o['pts'] for o in q['opts']) if q['type'] == 'multi' else max(o['pts'] for o in q['opts'])
    tmax[i] = mx; tcat[tsec[q['sec']]['cat']] += mx
    chk(mx == x['max'] == summ[i]['possible'], '%s max %s vs xls %s' % (i, mx, x['max']))
for s in secs:
    ts = [v for v in tool['secs'] if norm(v['en']).lower() == s['title'].lower()]
    chk(len(ts) == 1, 'section %r missing' % s['title'])
    if ts:
        chk(norm(ts[0]['todo']['en']) == s['todo'], 'section %s todo text differs' % ts[0]['id'])
        chk(norm(ts[0]['why']['en']) == s['why'], 'section %s why text differs' % ts[0]['id'])
chk(tcat == {1: 90, 2: 140, 3: 80, 4: 30}, 'tool category max %r' % tcat)
chk(sum(tcat.values()) == 340, 'tool total %d' % sum(tcat.values()))

print('xls questions: %d · options/items checked: %d · sections: %d' % (len(ref), nopt, len(secs)))
print('per-question max (xls = tool = sheet 7):', ' '.join('%s=%g' % (k, v) for k, v in tmax.items()))
print('category max tool:', tcat, '· xls:', cm, '· sheet7:', catmax, '· total:', sum(tcat.values()), '/', total_possible)
json.dump({'questions': ref, 'sheet7': summ, 'catmax': cm}, open(os.path.join(HERE, 'xls_ref.json'), 'w'), ensure_ascii=False, indent=1)

# ---- answer sets for the browser test, scored HERE from the .xls only ----
def score(ans):
    tot = 0; cat = {1: 0, 2: 0, 3: 0, 4: 0}
    for q in ref:
        a = ans.get(q['id']); s = 0
        if q['type'] == 'multi':
            if isinstance(a, list): s = sum(q['items'][k]['pts'] for k in a)
        elif a is not None: s = q['opts'][a]['pts']
        cat[q['cat']] += s; tot += s
    return tot, cat
def ids_for(ans):
    out = []
    for q in ref:
        a = ans.get(q['id'])
        if q['type'] == 'multi':
            if a == 'none': out.append('q_%s_none' % q['id'])
            elif isinstance(a, list): out += ['q_%s_%d' % (q['id'], k) for k in a]
        elif a is not None: out.append('q_%s_%d' % (q['id'], a))
    return out
rng = random.Random(30)
sets = []
best = {q['id']: (list(range(len(q['items']))) if q['type'] == 'multi' else max(range(len(q['opts'])), key=lambda k: q['opts'][k]['pts'])) for q in ref}
worst = {q['id']: ('none' if q['type'] == 'multi' else min(range(len(q['opts'])), key=lambda k: q['opts'][k]['pts'])) for q in ref}
for name, ans in [('best', best), ('worst', worst)]:
    t, c = score(ans); sets.append({'name': name, 'ids': ids_for(ans), 'total': t, 'cat': c})
for n in range(200):
    ans = {}
    for q in ref:
        r = rng.random()
        if r < 0.08: continue            # ~8 % unanswered
        if q['type'] == 'multi':
            sub = [k for k in range(len(q['items'])) if rng.random() < 0.5]
            ans[q['id']] = sub if sub else 'none'
        else:
            ans[q['id']] = rng.randrange(len(q['opts']))
    t, c = score(ans); sets.append({'name': 'rnd%03d' % n, 'ids': ids_for(ans), 'total': t, 'cat': c})
json.dump(sets, open(os.path.join(HERE, 'random_sets.json'), 'w'), indent=0)
print('answer sets written: %d (best=%g, worst=%g, random=200)' % (len(sets), sets[0]['total'], sets[1]['total']))
if fails:
    print('FAIL (%d):' % len(fails)); [print('  -', f) for f in fails]; sys.exit(1)
print('CRITERION 1: PASS')
