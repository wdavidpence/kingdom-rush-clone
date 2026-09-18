#!/usr/bin/env python3
"""moa2735 pass 1.0.103: barracks doorway guards. 1800s each. Diff only."""
import json, time, urllib.request
from pathlib import Path

LOG = Path("/Users/davidpence/kingdom-rush-clone/sprint-logs")
PROMPT = (LOG / "pass-1.0.103-moa-prompt.md").read_text()
MODELS = [
    ("qwen27", "http://192.168.86.100:1234/v1/chat/completions", "qwen3.6-27b-mlx"),
    ("qwen35ud", "http://100.122.149.120:8000/v1/chat/completions", "qwen3.6-35b-a3b-ud-mlx"),
]


def ask(name, url, model):
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a careful Phaser canvas artist. Output only the requested diff fence. No prose after it."},
            {"role": "user", "content": PROMPT},
        ],
        "temperature": 0.6,
        "max_tokens": 8000,
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
        rec["finish"] = (body.get("choices") or [{}])[0].get("finish_reason")
        rec["usage"] = body.get("usage")
        rec["success"] = bool(rec["content"])
    except Exception as e:
        rec["seconds"] = round(time.perf_counter() - t0, 2)
        rec["success"] = False
        rec["error"] = f"{type(e).__name__}: {e}"
        rec["content"] = ""
    return rec


def main():
    for name, url, model in MODELS:
        print(f"START {name}", flush=True)
        rec = ask(name, url, model)
        slim = {k: v for k, v in rec.items() if k != "content"}
        slim["content_len"] = len(rec.get("content") or "")
        (LOG / f"pass-1.0.103-{name}.json").write_text(json.dumps(slim, indent=2))
        (LOG / f"pass-1.0.103-{name}.txt").write_text(rec.get("content") or rec.get("error") or "")
        print(json.dumps(slim), flush=True)


if __name__ == "__main__":
    main()
