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
- Gameplay gate (steps 01–30, including 27) complete except continue campaign/UX from **31**.
- Persistent memory: Hermes built-in memory active.

## Working constraints
- Original IP only — Kingdom Rush is genre reference, not asset source.
- Always read `public/index.html` before writing it.
- Contract tests: `for t in tests/*.test.mjs; do node "$t"; done`
- Load order ends with: ... enemy-traits.js → game.js

## Next milestone
Earliest unchecked: **31. Add a campaign-selection view with original map cards and locked/unlocked states.**
Then 32–40 campaign/UX, 41–48 AV polish, 49–50 release.

## Latest verification
- Full contract suite PASS
- `node --check` all public/src/*.js PASS
- `git diff --check` clean
