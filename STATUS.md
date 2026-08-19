# STATUS
## Task
KRC AAA 20-pass sprite sprint. Hermes judge only. Workers: antigrav + moa2735.

## Done
- v1.0.61–v1.0.69 shipped to main + gh-pages.
- Latest: `4920d7f` / live https://wdavidpence.github.io/kingdom-rush-clone/
- antigrav is the only shippable worker. moa2735 1.0.61 truncated FAIL both models.

## Current file state
- `/Users/davidpence/kingdom-rush-clone` main at v1.0.69
- Worker tree `/Users/davidpence/kingdom-rush-clone-antigrav` used for all antigrav edits
- `public/src/krc-art.js` ~5k lines canvas atlas

## Last error / blocker
1.0.69 first bake crashed (`drawMageFire` missing). Repair shipped. Always browser-check bake after art edits.

## Next step
Judge/ship 1.0.70 death poses (running), then 1.0.71–1.0.80 per docs/aaa-sprite-sprint-20.md.

## Do NOT
- Author game art as Hermes
- Use Claude/Opus on agy
- Trust worker summaries; verify keys in Playwright
- Change Forest Gate (100,375) or bannerY=98
