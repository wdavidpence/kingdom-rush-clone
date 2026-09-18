#!/bin/bash
set -euo pipefail
WT=/Users/davidpence/kingdom-rush-clone-antigrav
PROMPT=/Users/davidpence/kingdom-rush-clone/sprint-logs/pass-1.0.61-prompt.md
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
git -C "$WT" status --short
git -C "$WT" diff --stat
