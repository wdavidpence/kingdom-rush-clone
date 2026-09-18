#!/bin/bash
set -euo pipefail
WT=/Users/davidpence/kingdom-rush-clone-antigrav
PROMPT=/Users/davidpence/kingdom-rush-clone/sprint-logs/pass-1.3.4-antigrav-x20.md
START=$(date +%s)
/Users/davidpence/.local/bin/agy \
  --dangerously-skip-permissions \
  --model gemini-3.7-flash-high \
  --effort high \
  --mode accept-edits \
  --add-dir "$WT" \
  --print-timeout 90m \
  --new-project \
  --prompt="$(cat "$PROMPT")"
END=$(date +%s)
echo "ANTIGRAV_ELAPSED=$((END-START))"
python3 - <<'PY'
from pathlib import Path
root=Path("/Users/davidpence/kingdom-rush-clone")
wt=Path("/Users/davidpence/kingdom-rush-clone-antigrav")
for name in ["public/src/krc-art.js","public/src/game.js"]:
    a=(wt/name).read_text(); b=(root/name).read_text()
    print(name, "live", len(b.splitlines()), "agy", len(a.splitlines()), "delta", len(a.splitlines())-len(b.splitlines()))
g=(wt/"public/src/game.js").read_text()
art=(wt/"public/src/krc-art.js").read_text()
print("gate", "{ x: 100, y: 375 }" in g)
print("banner", "bannerY = 98" in g)
print("scout_kept", 'outline = "#141008"' in art and "const drawScout" in art)
print("flyer_sig", 'make("enemy_flyer", 80, 72' in art)
print("brute_sig", 'make("enemy_brute", 80, 72' in art)
PY
