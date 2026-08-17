# KRC Session Handoff

## Resume protocol
1. Read `docs/aaa-50-iteration-plan.md` (active 50-release program).
2. Read this handoff.
3. `git status --short` and `public/index.html` before editing public files.

## Current state — 2026-08-17 (v1.0.8)
- Repo: `/Users/davidpence/kingdom-rush-clone`
- Upstream: `https://github.com/wdavidpence/kingdom-rush-clone.git`
- Live: `https://wdavidpence.github.io/kingdom-rush-clone/`
- Committed baseline before this pass: v1.0.7
- v1.0.8 promotes campaign/HUD polish, tooltips, version marker, `__KRC_GAME__` hook, and fixes `updateEnemyVisual` `dt` ReferenceError.

## Legal
Original competitor only. No Kingdom Rush art, names, maps, audio, or equivalence claims.

## Next
Start plan item 1 as v1.0.9: custom display type + HUD type hierarchy.

## Verify
- `node --check public/src/*.js`
- `for t in tests/*.test.mjs; do node "$t"; done`
- `bash scripts/smoke-static.sh`
- Live: Forest Gate click → two Rangers → CALL → enemies march, no JS errors
