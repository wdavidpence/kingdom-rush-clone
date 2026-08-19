# STATUS
## Task
KRC AAA upgrades on the 5 hardest visual fails. Hermes implementing.

## Done
v1.0.80 local: HUD rail, full spell names, opaque campaign backdrop, richer pad/trees/map, hero/gate/pad scale, face mouths.
Syntax: game.js + krc-art.js node --check OK. Phaser 3.80.1 boots. bannerY=98 and Forest Gate (100,375) unchanged.

## Last error / blocker
Headless Chrome screenshots capture empty canvas (WebGL ReadPixels stall). Playwright MCP died mid-verify.

## Next step
Push v1.0.80 to main + gh-pages. Visually confirm HUD/campaign in a real browser. Then another art cohesion pass if still sticker-like.

## Do NOT
- Change Forest Gate (100,375) or bannerY=98
- Use Claude/Opus
- Claim AAA without a real-browser screenshot
