#!/usr/bin/env python3
"""WP-30 build: inline the question data (data_th.json) and the site's standard L0 lock
block (copied verbatim from tools/Tool_CoolingLoad_Selector.html) into the tool template.
Run: python3 -I _wp30/build.py   (from repo root or anywhere)"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
tpl = open(os.path.join(HERE, 'tool_template.html'), encoding='utf-8').read()
data = json.load(open(os.path.join(HERE, 'data_th.json'), encoding='utf-8'))
data.pop('note', None)
data['version'] = 'SSST v1.0d_Metric (DOE) — WP-30 r1'
src = open(os.path.join(ROOT, 'tools', 'Tool_CoolingLoad_Selector.html'), encoding='utf-8').read()
m = re.search(r'<script data-te-lock="L0-r1">.*?</script>', src, re.S)
assert m, 'lock block not found'
assert tpl.count('/*__TE_LOCK__*/') == 1 and tpl.count('/*__SSST_DATA__*/') == 1
js = json.dumps(data, ensure_ascii=False, indent=0).replace('</', '<\\/')
out = tpl.replace('/*__TE_LOCK__*/', m.group(0)).replace('/*__SSST_DATA__*/', js)
dst = os.path.join(ROOT, 'tools', 'Tool_Steam_System_Scoping.html')
open(dst, 'w', encoding='utf-8').write(out)
print('wrote', dst, len(out.encode('utf-8')), 'bytes')
