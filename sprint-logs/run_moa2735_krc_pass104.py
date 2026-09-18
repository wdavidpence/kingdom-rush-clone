#!/usr/bin/env python3
"""PenceMOA qwen2735 for KRC: SAME assignment, plan -> two candidates -> qwen27 synth.

Not sequential solo jobs. Matches 20-tier/stress10 pair protocol.
temp 0.6, max_tokens 20000, 1800s per call.
"""
import json, time, urllib.request, concurrent.futures
from pathlib import Path

LOG = Path("/Users/davidpence/kingdom-rush-clone/sprint-logs")
TASK = (LOG / "pass-1.0.104-moa-prompt.md").read_text()
A = ("qwen27", "http://192.168.86.100:1234/v1/chat/completions", "qwen3.6-27b-mlx")
B = ("qwen35ud", "http://100.122.149.120:8000/v1/chat/completions", "qwen3.6-35b-a3b-ud-mlx")
PLAN_SYS = "Give a concise drawing plan only. No code. No diffs."
CODE_SYS = "Output ONLY one ```diff:public/src/krc-art.js fence. No prose after it."
SYNTH_SYS = "You synthesize one final diff from two candidates. Output ONLY one ```diff:public/src/krc-art.js fence."


def ask(url, model, system, user, max_tokens=20000, timeout=1800):
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
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
    print(f"DONE {name} code_s={code.get('seconds')} ok={code.get('ok')} finish={code.get('finish')}", flush=True)
    return {"name": name, "plan": plan, "code": code}


def slim(rec):
    out = {}
    for k, v in rec.items():
        if k == "text":
            out["text_len"] = len(v or "")
            out["text_head"] = (v or "")[:400]
        elif k == "plan":
            out["plan"] = slim(v) if isinstance(v, dict) else v
        elif k == "code":
            out["code"] = slim(v) if isinstance(v, dict) else v
        else:
            out[k] = v
    return out


def main():
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        fa = pool.submit(candidate, *A)
        fb = pool.submit(candidate, *B)
        ca, cb = fa.result(), fb.result()
    (LOG / "pass-1.0.104-moa-cand-qwen27.txt").write_text((ca["code"].get("text") or "") + "\n---PLAN---\n" + (ca["plan"].get("text") or ""))
    (LOG / "pass-1.0.104-moa-cand-qwen35ud.txt").write_text((cb["code"].get("text") or "") + "\n---PLAN---\n" + (cb["plan"].get("text") or ""))
    print("SYNTH qwen27", flush=True)
    synth_user = (
        "Same assignment. Merge the better parts of A and B into ONE diff. Guards must be 24-28px with separate head/torso/legs/shield/spear.\n\n"
        "TASK:\n" + TASK + "\n\nCANDIDATE A (qwen27):\n" + (ca["code"].get("text") or "[missing]")
        + "\n\nCANDIDATE B (qwen35ud):\n" + (cb["code"].get("text") or "[missing]")
    )
    synth = ask(A[1], A[2], SYNTH_SYS, synth_user)
    (LOG / "pass-1.0.104-moa-synth.txt").write_text(synth.get("text") or synth.get("error") or "")
    ledger = {
        "protocol": "PenceMOA qwen2735 plan+candidates+synth",
        "a": {"name": ca["name"], "plan": slim(ca["plan"]), "code": slim(ca["code"])},
        "b": {"name": cb["name"], "plan": slim(cb["plan"]), "code": slim(cb["code"])},
        "synth": slim(synth),
    }
    (LOG / "pass-1.0.104-moa-ledger.json").write_text(json.dumps(ledger, indent=2))
    print(json.dumps({"synth_ok": synth.get("ok"), "synth_s": synth.get("seconds"), "synth_len": len(synth.get("text") or "")}), flush=True)


if __name__ == "__main__":
    main()
