# STATUS
## Task
KRC AAA 20-pass sprite/character/graphics sprint. Hermes is critic/judge/orchestrator only. Workers: antigrav (agy) + moa2735.

## Done
- Synced live repo to `/Users/davidpence/kingdom-rush-clone` at `30e41dc` (v1.0.60).
- Installed `agy` 1.1.15 at `/Users/davidpence/.local/bin/agy`.
- moa2735 smoke: qwen27 12.07s PASS; qwen35ud 4.13s PASS (max_tokens 4000).
- antigrav smoke: FAIL — Google OAuth required. User is signing in.
- Sprint plan written: `docs/aaa-sprite-sprint-20.md`.

## Current file state
- `public/src/krc-art.js`: 979-line single-pose painterly atlas.
- `public/src/game.js`: 6348 lines; motion is bob/squash, not frames.
- Live Pages: gh-pages branch, https://wdavidpence.github.io/kingdom-rush-clone/

## Last error / blocker
agy: Authentication required / timed out. Waiting for user `agy` sign-in.

## Next step
Re-test agy. Then dispatch pass 1.0.61 (Scout+Brute walk sheets) to both workers with 30m budgets.

## Do NOT
- Author game art or game code as Hermes.
- Use Claude/Anthropic.
- Change Forest Gate (100,375), bannerY=98, or bounty math.
- Copy Kingdom Rush assets or claim indistinguishability.
- Use Ornith as a write worker.
