#!/bin/bash
set -euo pipefail
WT=/Users/davidpence/kingdom-rush-clone-antigrav
PROMPT=/Users/davidpence/kingdom-rush-clone/sprint-logs/pass-1.1.7-prompt.md
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
python3 - <<'PY'
from pathlib import Path
a=Path("/Users/davidpence/kingdom-rush-clone-antigrav/public/src/game.js").read_text()
b=Path("/Users/davidpence/kingdom-rush-clone/public/src/game.js").read_text()
print("live_lines", len(b.splitlines()), "agy_lines", len(a.splitlines()), "delta", len(a.splitlines())-len(b.splitlines()))
print("gate", "{ x: 100, y: 375 }" in a)
print("intelBg", "campaignIntelBg" in a)
PY
