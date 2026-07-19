# KRC Session Handoff

## Resume protocol
1. Read `docs/kingdom-rush-inspired-1.0-plan.md` first.
2. Read this handoff second.
3. Inspect `git status --short` and the served `public/index.html` before editing any `public/` file.
4. Continue the earliest unchecked plan item; update both documents immediately after verified progress.

## Current state — 2026-07-19
- Repository: `/mnt/c/Users/wdavi/Projects/kingdom-rush-clone`
- Upstream: `https://github.com/wdavidpence/kingdom-rush-clone.git`
- Live Pages: `https://wdavidpence.github.io/kingdom-rush-clone/`
- Baseline includes modular data/targeting/rally/campaign helpers plus barracks readiness (step 24).
- Persistent memory: Hermes built-in memory is active (`hermes memory status` → Built-in always active).
- Working tree policy: commit reviewable units; do not bundle unrelated WIP. Preserve original IP boundaries.

## Working constraints
- Preserve an **original** title, world, art, audio, map shapes, text, and code. Use Kingdom Rush only as a genre/mechanics/presentation reference; do not import, recreate, or claim its proprietary assets.
- Always read `public/index.html` before writing it (sibling-agent overwrite pitfall).
- Prioritize static, dependency-free browser delivery; Phaser is loaded through jsDelivr.
- Use `python3 -m http.server <port> --bind 127.0.0.1` via tracked background process for browser testing.
- Existing QA hook: `?qa=1&emberTest=1` writes pass/fail to `document.body.dataset.krcEmberTest`.
- Contract tests: `for t in tests/*.test.mjs; do node \"$t\"; done`
- Barracks readiness helper: `public/src/barracks-readiness.js` → `window.KRCBarracksReadiness` (loaded before `game.js`).

## Next milestone
Earliest unchecked item is **25: Add unique high-tier tower abilities with cooldown/level gating**.
Then 26, 28–30, then campaign/UX (31–40), AV polish (41–48), release (49–50).

## Verification evidence (step 24)
- `node tests/barracks-readiness.test.mjs` PASS
- Full Node contract suite PASS
- `node --check` on all `public/src/*.js` PASS
- `git diff --check` clean
- Static server delivered `index.html`, `barracks-readiness.js`, `game.js` HTTP 200
