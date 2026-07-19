# KRC Session Handoff

## Resume protocol
1. Read `docs/kingdom-rush-inspired-1.0-plan.md` first.
2. Read this handoff second.
3. Inspect `git status --short` and the served `public/index.html` before editing any `public/` file.
4. Continue the earliest unchecked plan item; update both documents immediately after verified progress.

## Current state — 2026-07-18
- Repository: `/mnt/c/Users/wdavi/Projects/kingdom-rush-clone`
- Upstream: `https://github.com/wdavidpence/kingdom-rush-clone.git`
- Baseline upstream commit: `7e95612 Add hero abilities and guard ranged attacks`
- Initial audit: a single Phaser 3 scene in `public/src/game.js` (about 1,828 lines), static `public/index.html`, and `public/styles.css`; three built-in maps, four towers, seven enemy types, one hero, three spells, and Kenney audio are already functional.
- Persistent memory: Hermes built-in memory is active, confirmed with `hermes memory status`.
- No GitHub CLI is installed. `origin` uses HTTPS. Pushing needs existing credential-helper/SSH access; do not ask the user unless a push actually fails after all local verification.

## Working constraints
- Preserve an **original** title, world, art, audio, map shapes, text, and code. Use Kingdom Rush only as a genre/mechanics/presentation reference; do not import, recreate, or claim its proprietary assets.
- Do not let sibling agents edit `public/index.html`; inspect it before each edit cycle.
- Prioritize static, dependency-free browser delivery; Phaser is loaded through jsDelivr.
- Use `python3 -m http.server <port> --bind 127.0.0.1` via tracked background process for browser testing.
- Existing QA hook: `?qa=1&emberTest=1` writes pass/fail to `document.body.dataset.krcEmberTest`.
- Static campaign data lives in `public/src/game-data.js`, exposed as `window.KRCGameData` and loaded before `game.js`; its contract test is `node tests/game-data.test.mjs`.
- Stable entity identities and lifecycle transitions are supplied by `public/src/entity-state.js`, loaded before `game.js`; its contract test is `node tests/entity-state.test.mjs`.
- The current worktree includes a pre-existing, uncommitted mage chain-hit change in `public/src/game.js`; preserve it unless its owner directs otherwise.

## Next milestone
Continue plan steps 24–26, 28–30. The earliest unchecked item is **24: add clear troop respawn/readiness feedback and richer melee encounters**. Guard rally snapping is isolated in `public/src/rally-point.js`, loaded before `game.js`; run `node tests/rally-point.test.mjs`. Preserve the existing uncommitted mage chain-hit change while working in `game.js`.

## Verification evidence so far
- Repository cloned successfully and baseline was clean.
- Hermes reported: `Built-in: always active`.
- Public research and the local Kingdom Rush design-analysis reference confirm the intended genre pillars: fixed build pads, four tower roles, blocking units, wave economy, upgrades, spells/heroes, and animated audiovisual feedback.
