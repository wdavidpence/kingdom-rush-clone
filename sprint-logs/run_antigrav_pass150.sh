#!/bin/bash
set -euo pipefail
WT=/Users/davidpence/kingdom-rush-clone-antigrav
PROMPT=/Users/davidpence/kingdom-rush-clone/sprint-logs/pass-1.3.19-antigrav-hexer.md
START=$(date +%s)
/Users/davidpence/.local/bin/agy \
  --dangerously-skip-permissions \
  --model gemini-3.7-flash-high \
  --effort high \
  --mode accept-edits \
  --add-dir "$WT" \
  --print-timeout 45m \
  --new-project \
  --prompt="$(cat "$PROMPT")"
END=$(date +%s)
echo "ANTIGRAV_ELAPSED=$((END-START))"
python3 - <<'PY'
from pathlib import Path
wt=Path("/Users/davidpence/kingdom-rush-clone-antigrav")
art=(wt/"public/src/krc-art.js").read_text()
js=(wt/"public/src/game.js").read_text()
print("gate", "{ x: 100, y: 375 }" in js)
print("hexer80", 'make("enemy_hexer", 80, 72' in art)
print("captain64", 'make("hero_captain_idle", 64, 72' in art)
print("magic36", 'make("projectile_magic", 36, 36' in art)
PY
