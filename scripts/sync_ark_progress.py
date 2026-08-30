#!/usr/bin/env python3
"""Synchronize accepted ARK frontend-SWE submissions to the public dashboard."""
import datetime as dt
import json
import re
import subprocess
from pathlib import Path

ROOT = Path('/home/agent/frontend-swe-practice')
TASKS = ROOT / 'public/tasks.json'
PROGRESS = ROOT / 'public/progress.json'
DB_URI = 'file:/var/lib/kosmos-sync/prod/ark.db?mode=ro'
SOURCES = {'bigfrontend': 'BigFrontEnd', 'greatfrontend': 'GreatFrontEnd', 'coderun': 'CodeRun', 'codewars': 'Codewars'}

def norm(value: str) -> str:
    return re.sub(r'\s+', ' ', value.replace(' — завершено', '').strip().lower())

def run(*args):
    subprocess.run(args, cwd=ROOT, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

run('git', 'pull', '--ff-only')
tasks = json.loads(TASKS.read_text())['tasks']
by_key = {(t['source'], norm(t['title'])): t for t in tasks}
query = """
SELECT title,
       json_extract(props_json, '$.source') AS source,
       json_extract(props_json, '$.submittedAt') AS submittedAt,
       COALESCE(json_extract(props_json, '$.accepted'), 1) AS accepted
FROM objects
WHERE type_id = 'coding_submission_obj' AND deleted_at IS NULL
"""
result = subprocess.run(
    ['sudo', '-n', 'sqlite3', '-readonly', '-json', '/var/lib/kosmos-sync/prod/ark.db', query],
    check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
)
rows = json.loads(result.stdout)
completed = {}
for row in rows:
    title, source, submitted_at, accepted = row['title'], row['source'], row['submittedAt'], row['accepted']
    source = SOURCES.get(source or '')
    if not accepted or not source or not title or not submitted_at:
        continue
    key = (source, norm(title))
    task = by_key.get(key)
    # ARK stores the BFE memoization task under its original title;
    # the curated list uses the equivalent general memo() formulation.
    if not task and source == 'BigFrontEnd' and norm(title) == '122. implement memoizeone()':
        task = by_key.get((source, norm('Implement a general memoization function - `memo()`')))
    if task:
        completed[f'{source}|{task["title"]}'] = {'completed': True, 'completedAt': submitted_at}

next_doc = {'updatedAt': dt.datetime.now(dt.timezone.utc).isoformat(), 'completed': completed}
old = json.loads(PROGRESS.read_text()) if PROGRESS.exists() else {}
if old.get('completed') == next_doc['completed']:
    print('UNCHANGED 0')
else:
    PROGRESS.write_text(json.dumps(next_doc, ensure_ascii=False, indent=2) + '\n')
    run('git', 'add', 'public/progress.json')
    run('git', 'commit', '-m', 'Sync ARK practice progress')
    run('git', 'push')
    print(f'UPDATED {len(completed)}')
