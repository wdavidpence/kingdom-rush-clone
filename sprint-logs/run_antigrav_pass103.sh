#!/bin/bash
set -euo pipefail
WT=/Users/davidpence/kingdom-rush-clone-antigrav
PROMPT=/Users/davidpence/kingdom-rush-clone/sprint-logs/pass-1.0.103-prompt.md
START=$(date +%s)
/Users/davidpence/.local/bin/agy \
  --dangerously-skip-permissions \
  --model gemini-3.7-flash-high \
  --effort high \
  --mode accept-edits \
  --add-dir "$WT" \
  --print-timeout 30m \
  --new-project \
  --prompt="$(cat "$PROMPT")"
END=$(date +%s)
echo "ANTIGRAV_ELAPSED=$((END-START))"
git -C "$WT" status --short || true
python3 - <<'PY'
from pathlib import Path
p=Path("/Users/davidpence/kingdom-rush-clone-antigrav/public/src/krc-art.js")
t=p.read_text() if p.exists() else ""
print("art_chars", len(t), "guards_hint", t.count("spear") + t.count("guard"))
PY
