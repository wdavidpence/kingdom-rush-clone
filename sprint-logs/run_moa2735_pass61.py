#!/usr/bin/env python3
"""moa2735 pass runner: qwen27 then qwen35, 1800s each, extract files into worktree."""
import json, re, time, urllib.request
from pathlib import Path

ROOT = Path("/Users/davidpence/kingdom-rush-clone-moa")
LOG = Path("/Users/davidpence/kingdom-rush-clone/sprint-logs")
PROMPT = (LOG / "pass-1.0.61-prompt.md").read_text()
ART = (ROOT / "public/src/krc-art.js").read_text()
GAME_HEAD = "\n".join((ROOT / "public/src/game.js").read_text().splitlines()[0:20])
VIS = "\n".join((ROOT / "public/src/game.js").read_text().splitlines()[3795:3875])
SPAWN = "\n".join((ROOT / "public/src/game.js").read_text().splitlines()[3428:3456])

TASK = f"""{PROMPT}

WORKTREE: {ROOT}
You cannot browse the filesystem. Return complete replacement files as fenced blocks:

```path:public/src/krc-art.js
...full file...
```

and if game.js must change, also:

```path:public/src/game.js
...full file...
```

If a file is too large, return a unified diff in:

```diff:public/src/game.js
...
```

Do not write prose after the last code fence.

CURRENT public/src/krc-art.js (full):
{ART}

CURRENT public/src/game.js head:
{GAME_HEAD}

CURRENT spawnEnemy excerpt:
{SPAWN}

CURRENT updateEnemyVisual excerpt:
{VIS}
"""

MODELS = [
    ("qwen27", "http://192.168.86.100:1234/v1/chat/completions", "qwen3.6-27b-mlx"),
    ("qwen35ud", "http://100.122.149.120:8000/v1/chat/completions", "qwen3.6-35b-a3b-ud-mlx"),
]


def ask(name, url, model):
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a careful Phaser 3 game artist-engineer. Output only the requested files."},
            {"role": "user", "content": TASK},
        ],
        "temperature": 0.6,
        "max_tokens": 20000,
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
    t0 = time.perf_counter()
    rec = {"worker": name, "model": model}
    try:
        with urllib.request.urlopen(req, timeout=1800) as resp:
            body = json.loads(resp.read().decode())
        rec["seconds"] = round(time.perf_counter() - t0, 2)
        msg = (body.get("choices") or [{}])[0].get("message") or {}
        rec["content"] = msg.get("content") or ""
        rec["reasoning_len"] = len(msg.get("reasoning_content") or "")
        rec["finish"] = (body.get("choices") or [{}])[0].get("finish_reason")
        rec["usage"] = body.get("usage")
        rec["success"] = bool(rec["content"])
    except Exception as e:
        rec["seconds"] = round(time.perf_counter() - t0, 2)
        rec["success"] = False
        rec["error"] = f"{type(e).__name__}: {e}"
        rec["content"] = ""
    return rec


def extract(text, dest: Path):
    written = []
    for m in re.finditer(r"```path:([^\n]+)\n(.*?)```", text or "", re.S):
        rel = m.group(1).strip()
        body = m.group(2)
        if rel.startswith("/") or ".." in rel:
            continue
        path = dest / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(body)
        written.append(rel)
    return written


def main():
    results = []
    for name, url, model in MODELS:
        print(f"START {name}", flush=True)
        rec = ask(name, url, model)
        out = LOG / f"pass-1.0.61-{name}.json"
        slim = {k: v for k, v in rec.items() if k != "content"}
        slim["content_len"] = len(rec.get("content") or "")
        out.write_text(json.dumps(slim, indent=2))
        (LOG / f"pass-1.0.61-{name}.txt").write_text(rec.get("content") or rec.get("error") or "")
        print(json.dumps(slim), flush=True)
        results.append(rec)
    # Prefer first successful content that extracts a file; else second.
    applied = []
    for rec in results:
        files = extract(rec.get("content") or "", ROOT)
        if files:
            applied = {"worker": rec["worker"], "files": files}
            break
    (LOG / "pass-1.0.61-moa-apply.json").write_text(json.dumps(applied, indent=2))
    print("APPLIED", applied, flush=True)


if __name__ == "__main__":
    main()
