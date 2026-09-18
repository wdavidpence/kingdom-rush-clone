#!/usr/bin/env python3
"""PenceMOA qwen2735 1.1.8 gale campaign board. SAME assignment."""
import json, time, urllib.request, concurrent.futures
from pathlib import Path

LOG = Path("/Users/davidpence/kingdom-rush-clone/sprint-logs")
TASK = (LOG / "pass-1.1.8-moa-prompt.md").read_text()
A = ("qwen27", "http://192.168.86.100:1234/v1/chat/completions", "qwen3.6-27b-mlx")
B = ("qwen35ud", "http://100.122.149.120:8000/v1/chat/completions", "qwen3.6-35b-a3b-ud-mlx")
PLAN_SYS = "Give a concise implementation plan only. No code."
CODE_SYS = "Output ONLY one ```diff:public/src/krc-art.js fence using poly() or ellipse(). Do not rewrite Forest/Stone/Ember/Ash."
SYNTH_SYS = "Synthesize ONE final diff. Output ONLY ```diff:public/src/krc-art.js. Gale clouds/cliffs after the existing gale strokes. poly/ellipse only."


def ask(url, model, system, user, max_tokens=20000, timeout=1800):
    payload = {
        "model": model,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
        "temperature": 0.6,
        "max_tokens": max_tokens,
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
    t0 = time.perf_counter()
    rec = {"model": model}
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = json.loads(resp.read().decode())
        rec["seconds"] = round(time.perf_counter() - t0, 2)
        msg = (body.get("choices") or [{}])[0].get("message") or {}
        rec["text"] = msg.get("content") or ""
        rec["finish"] = (body.get("choices") or [{}])[0].get("finish_reason")
        rec["usage"] = body.get("usage")
        rec["ok"] = bool(rec["text"])
    except Exception as e:
        rec["seconds"] = round(time.perf_counter() - t0, 2)
        rec["ok"] = False
        rec["error"] = f"{type(e).__name__}: {e}"
        rec["text"] = ""
    return rec


def candidate(name, url, model):
    print(f"PLAN {name}", flush=True)
    plan = ask(url, model, PLAN_SYS, "Plan this assignment:\n\n" + TASK, 4000)
    print(f"CODE {name} plan_s={plan.get('seconds')}", flush=True)
    code = ask(url, model, CODE_SYS, TASK + "\n\nPLAN:\n" + (plan.get("text") or "") + "\n\nReturn the diff now.")
    print(f"DONE {name} code_s={code.get('seconds')} ok={code.get('ok')}", flush=True)
    return {"name": name, "plan": plan, "code": code}


def main():
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        fa = pool.submit(candidate, *A)
        fb = pool.submit(candidate, *B)
        ca, cb = fa.result(), fb.result()
    (LOG / "pass-1.1.8-moa-synth-input.txt").write_text("A\n" + (ca["code"].get("text") or "") + "\nB\n" + (cb["code"].get("text") or ""))
    print("SYNTH qwen27", flush=True)
    synth = ask(A[1], A[2], SYNTH_SYS, "TASK:\n" + TASK + "\n\nCANDIDATE A:\n" + (ca["code"].get("text") or "[missing]") + "\n\nCANDIDATE B:\n" + (cb["code"].get("text") or "[missing]"))
    (LOG / "pass-1.1.8-moa-synth.txt").write_text(synth.get("text") or "")
    print(json.dumps({"synth_ok": synth.get("ok"), "synth_s": synth.get("seconds"), "len": len(synth.get("text") or "")}), flush=True)


if __name__ == "__main__":
    main()
