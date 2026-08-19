# KRC AAA Sprite Sprint — 20 verified releases

Legal: original KRC names, art, maps, audio, and code only. Kingdom Rush is a genre bar, never a copy target. No KR art, names, maps, audio, or indistinguishability claims.

Judge: Hermes (harsh critic). Coders: antigrav (`agy` / gemini-3.7-flash-high) and moa2735 (qwen3.6-27b-mlx @ .100 + qwen3.6-35b-a3b-ud-mlx @ .120). Hermes does not author game art or game code.

Baseline: v1.0.60. Presentation is competent canvas-baked silhouettes. Characters are still single-pose blobs with bob/squash faking motion. That is not AAA.

Each item is one numbered patch after syntax / tests / `git diff --check` / live Forest Gate → two Rangers → CALL / portrait gate. Publish main + gh-pages together.

Hard contracts: Forest Gate node `(100,375)`, `bannerY = 98`, bounty math and `Math.floor(spent * 0.55)` unchanged.

## Passes (v1.0.61–v1.0.80)

| Rel | Slice | Player-visible acceptance |
|---|---|---|
| 1.0.61 | Scout + Brute 4-frame walk sheets | Marching reads as stride, not a bobbing sticker. reducedMotion stays on frame 0. |
| 1.0.62 | Remaining roster walk/fly frames | Shield/ember/brood/flyer/hexer/titan cycle distinct frames. |
| 1.0.63 | Tower fire / recoil pose frames | Each family flashes a fire pose on shot, then idle. |
| 1.0.64 | Hero idle / attack / ability poses | Captain is a character, not a statue. |
| 1.0.65 | Guard walk / attack / block frames | Squad motion reads as soldiers, not sliding tokens. |
| 1.0.66 | 128px Rangers tower material rebuild | Wood grain, thatch layers, visible archer, not a green hut. |
| 1.0.67 | 128px Runes / Mortar / Guard rebuild | Crystal, iron, fort keep readable at phone distance. |
| 1.0.68 | Rim light, AO, skin on characters | Faces and limbs have volume, not flat fills. |
| 1.0.69 | Tower L2/L3 distinct morph art | Upgrade changes silhouette, not only a numeral. |
| 1.0.70 | Death poses per enemy family | Corpses are posed, then fade. No shared puff-only death. |
| 1.0.71 | Warden / Titan phase art | Shield and rage are painted, not only a tint. |
| 1.0.72 | Spell impact sprite set | MET / ICE / RLY have authored bursts. |
| 1.0.73 | Projectile + trail sprite upgrade | Arrow / rune / bomb are readable missiles. |
| 1.0.74 | Path and terrain tile sprites | Dirt ruts / stone / ember crust replace the tan ribbon. |
| 1.0.75 | Gate / exit painted set-piece | Leak flash hits a real door and banners. |
| 1.0.76 | Shop portraits match in-world sprites | HUD icons are cropped portraits of the new towers. |
| 1.0.77 | Hair / cloth / weapon microdetail | Close look at hero, guards, scout, brute holds up. |
| 1.0.78 | Sprite lighting / map tint cohesion | Units sit in the map light, not pasted on top. |
| 1.0.79 | Authored VFX overlay sprites | Dust, sparks, leaves are sprites, not only circles. |
| 1.0.80 | Cohesion pass | Shared outline weight, scale, palette. Critic cannot call it a prototype sticker sheet. |

## Worker rules

- antigrav file writes: `agy --print --print-timeout 30m --model gemini-3.7-flash-high` only. Never Opus.
- moa2735: temp 0.6, max_tokens 20000, 1800s budget per model. Plan privately, then code.
- One visual slice per release. Prefer new helper files over dumping 200 lines into `game.js`.
- Hermes judges diffs, tests, and live browser. Worker summaries are not evidence.
