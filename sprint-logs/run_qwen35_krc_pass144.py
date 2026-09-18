#!/usr/bin/env python3
"""Single-worker qwen3.6-35b-ud captain ability. Not MoA. 3600s/request."""
import json, time, urllib.request
from pathlib import Path

LOG = Path("/Users/davidpence/kingdom-rush-clone/sprint-logs")
TASK = (LOG / "pass-1.3.19-qwen35-prompt.md").read_text()
URL = "http://100.122.149.120:8000/v1/chat/completions"
MODEL = "qwen3.6-35b-a3b-ud-mlx"
PLAN_SYS = "Give a concise implementation plan only. No code."
CODE_SYS = (
    "Output unified diffs only. Target live const drawHeroCaptainAbility = (ctx) => { "
    "and keep make(\"hero_captain_ability\", 64, 72, drawHeroCaptainAbility); "
    "Do not change 64, 72. Do not edit drawScout, drawBrute, drawFlyer, drawTitan, "
    "drawBossIdle, projectile_magic, drawHeroCaptainIdle, or drawHeroCaptainAttack. "
    "Pose MUST be overhead rally, not idle. "
    "Use only poly/linGrad/radGrad/ellipse/rounded/shadow/speckles/face "
    "with live arities: shadow(ctx,x,y,rx,ry,a) speckles(ctx,x,y,w,h,n,color,size). "
    "Never invent CONFIG, settings, make(fn), make(name, fn), or renderSetPiece. "
    "Do not touch { x: 100, y: 375 } or bannerY=98."
)


def ask(system, user, max_tokens=20000, timeout=3600):
    payload = {
        "model": MODEL,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
        "temperature": 0.6,
        "max_tokens": max_tokens,
    }
    req = urllib.request.Request(
        URL, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"}
    )
    t0 = time.perf_counter()
    rec = {"model": MODEL}
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


def main():
    print("PLAN qwen35ud", flush=True)
    plan = ask(PLAN_SYS, "Plan this assignment:\n\n" + TASK, 4000)
    print(f"CODE qwen35ud plan_s={plan.get('seconds')} ok={plan.get('ok')}", flush=True)
    code = ask(
        CODE_SYS,
        TASK + "\n\nPLAN:\n" + (plan.get("text") or "") + "\n\nReturn the diffs now.",
    )
    print(f"DONE qwen35ud code_s={code.get('seconds')} ok={code.get('ok')}", flush=True)
    rec = {"name": "qwen35ud", "plan": plan, "code": code}
    (LOG / "pass-1.3.19-qwen35.json").write_text(json.dumps(rec, indent=2)[:200000])
    (LOG / "pass-1.3.19-qwen35-code.txt").write_text(code.get("text") or "")
    print(
        json.dumps(
            {
                "ok": code.get("ok"),
                "code_s": code.get("seconds"),
                "plan_s": plan.get("seconds"),
                "len": len(code.get("text") or ""),
                "error": code.get("error"),
            }
        ),
        flush=True,
    )


if __name__ == "__main__":
    main()
