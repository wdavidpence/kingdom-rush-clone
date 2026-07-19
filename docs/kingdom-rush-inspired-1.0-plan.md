# KRC 1.0 Kingdom-Rush-Inspired Refactor and Polish Plan

> Progress source of truth: update this file and `docs/session-handoff.md` after every completed item. New sessions must read both before making changes.

**Goal:** Ship a polished, original fantasy tower-defense game that captures the readability, tactical rhythm, build-pad strategy, animated combat feedback, and mobile playability associated with classic Kingdom Rush—without copying its protected art, audio, names, maps, text, or code.

**Current baseline:** Phaser 3 static app; three consecutive maps; four original tower families; hero, guard units, spells, ten waves/map, procedural art, and Kenney-licensed audio assets.

**Reference research completed 2026-07-18:** Original Kingdom Rush (Ironhide, 2011) is a medieval-fantasy tower defense game built around fixed build sites, four foundational tower families (archer, barracks, mage, artillery), gold-driven wave defense, hero/reinforcement-style blocking, tower upgrades, and high-impact animated feedback. Sources reviewed: Ironhide strategy-guide search result; Armor Games listing; contemporary gameplay listings/reviews; Kingdom Rush Wiki search results; this repository's existing design analysis. The target is genre fidelity and original execution—not a literal asset or behavior copy.

**Definition of done:** A player can complete a three-map campaign on desktop or touch screens; all builds/upgrades/sells/spells/hero commands work; every enemy archetype has a legible counterplay role; sound and visual feedback are clear and optional; no runtime errors occur in smoke paths; repository documentation explains launch, controls, attribution, and QA.

## 50-step checklist

### A. Foundation, safety, and research
- [x] 01. Locate and clone the repository; record its upstream and clean baseline.
- [x] 02. Verify Hermes built-in persistent memory is enabled.
- [x] 03. Research the original game's visible and mechanical pillars from reputable public references.
- [x] 04. Audit the current HTML, CSS, game loop, assets, data, and existing QA hooks.
- [x] 05. Write this durable 50-step plan and the session handoff.
- [x] 06. Preserve original-IP boundaries in documentation and all player-facing content.
- [x] 07. Add a reproducible local launch and smoke-test command.
- [x] 08. Add a concise manual regression checklist for build, wave, hero, spell, victory, and defeat flows.
- [x] 09. Inventory third-party audio licenses and state attribution requirements.
- [x] 10. Establish a versioned 1.0 acceptance checklist and release notes.

### B. Architecture and game-data refactor
- [x] 11. Split static gameplay data (maps, towers, enemies, waves) from scene behavior.
- [x] 12. Add stable entity IDs and explicit state fields for robust targeting and cleanup.
- [x] 13. Replace magic layout numbers with named UI/map constants where practical.
- [x] 14. Add reusable helpers for particles, floating combat text, and audio calls.
- [x] 15. Add safe scene cleanup/reset paths to prevent stale sounds or entities.
- [x] 16. Add a lightweight save/preferences layer for audio and accessibility settings.
- [x] 17. Add a campaign-state model for map unlocks, stars, and best results.
- [x] 18. Add deterministic QA/query parameters for map, wave, and combat testing.
- [x] 19. Add runtime invariant checks in QA mode for gold/lives/entity counts.
- [x] 20. Validate JavaScript syntax and static asset links after each refactor milestone.

### C. Core Kingdom-Rush-style tactical loop (original implementation)
- [x] 21. Make each tower family’s role, target rules, and counterplay immediately legible.
- [x] 22. Improve target selection so towers prioritize the most progressed eligible enemy reliably.
- [x] 23. Upgrade guard deployment into a visible rally-point and blocking system.
- [x] 24. Add clear troop respawn/readiness feedback and richer melee encounters.
- [x] 25. Add unique high-tier tower abilities with cooldown/level gating.
- [x] 26. Add enemy traits with readable iconography: armor, flying, swarm, and elite.
- [x] 27. Add a swarm/split archetype and verify safe death-chain handling.
- [x] 28. Add a support/control archetype that changes placement decisions without invalidating towers.
- [x] 29. Give the final boss telegraphed phases and a tactical counterplay window.
- [x] 30. Retune economy, costs, rewards, wave density, and life loss through complete campaign runs.

### D. Campaign, progression, and UX
- [x] 31. Add a campaign-selection view with original map cards and locked/unlocked states.
- [x] 32. Track and show one-to-three-star performance after every map.
- [x] 33. Add brief map-specific objectives/tutorial callouts without interrupting play.
- [x] 34. Add optional early-wave start bonus to reward decisive play.
- [x] 35. Improve tower selection presentation with named roles, stats, affordability, and range preview.
- [x] 36. Improve upgrade/sell panel with refund clarity and maximum-level feedback.
- [x] 37. Improve hero selection, path movement, level feedback, respawn feedback, and skill targeting.
- [x] 38. Add pause, restart, mute, and reduced-motion controls.
- [x] 39. Improve keyboard/mouse support while retaining touch-first controls.
- [x] 40. Improve responsive layout for portrait phones, landscape phones, tablets, and desktop browsers.

### E. Original audiovisual polish
- [x] 41. Redraw terrain, path, build pads, and gates with a more cohesive original storybook palette.
- [x] 42. Add distinct idle/move/attack/hit/death animation cues to all enemy families.
- [x] 43. Add tower firing recoil, projectile trails, impact flashes, and controlled screen shake.
- [x] 44. Add richer guard/hero silhouettes, motion cues, and combat readability.
- [x] 45. Add original UI ornamentation, type hierarchy, and high-contrast status indicators.
- [x] 46. Add layered original procedural ambience and combat SFX mixing with volume control.
- [x] 47. Add music intensity transitions that respond to active waves without abrupt resets.
- [x] 48. Add colorblind-safe/contrast-conscious cues beyond hue alone.

### F. Verification and release
- [x] 49. Run scripted QA plus desktop and touch-browser smoke tests; fix all discovered blockers.
- [x] 50. Update README, release notes, plan/handoff, commit the polished 1.0, and push when authenticated.

## Validation gates

- **Refactor gate (after step 20):** game launches; QA Ember test passes; no JavaScript syntax errors; build/call/upgrade/sell remains usable.
- **Gameplay gate (after step 30):** each tower has a purpose; a full three-map campaign is winnable with at least two viable strategies; no unavoidable leak spikes.
- **Polish gate (after step 48):** feedback is readable at mobile scale, audio has an accessible mute path, and every UI action provides a response.
- **Release gate (step 50):** static server smoke test, browser smoke test, clean git status, documentation complete, commit created; push only if existing credentials permit it.

## Change log

- 2026-07-18 — Steps 01–05 complete. Repository baseline is commit `7e95612`; implementation work begins with foundation/refactor and replayability polish.
- 2026-07-19 — Step 11 complete: extracted map, tower, enemy, and wave definitions to `public/src/game-data.js`; added a Node contract test and verified script syntax plus static server delivery.
- 2026-07-19 — Step 12 complete: added stable per-scene entity IDs and lifecycle states for heroes, towers, enemies, soldiers, and projectiles, with a dependency-free contract test.
- 2026-07-19 — Step 13 complete: extracted screen, shop, path, and gate layout constants to `public/src/layout.js`; verified its contract and all JavaScript syntax.
- 2026-07-19 — Step 15 complete: registered shutdown cleanup to stop sounds, detach input, and clear transient effects/entities before scene restarts.
- 2026-07-19 — Step 17 complete: added local campaign state for unlocks, best stars, and best gold; final-map wins persist results.
- 2026-07-19 — Step 21 complete: defined concise original tower roles, targeting rules, and counterplay in static data; added AIR/ARM/AOE/HOLD shop cues and detailed selection guidance.
- 2026-07-19 — Step 22 complete: replaced screen-coordinate target scoring with a pure, path-distance-aware targeting helper that consistently selects the furthest eligible living enemy and respects anti-air rules.
- 2026-07-19 — Step 23 complete: Guards now spawn and return to visible road rally markers; selecting a Guard enables an explicit tap-road command, and units redirect safely when the marker changes.
- 2026-07-19 — Step 24 complete: barracks show READY/TRN readiness badges and training meters; fallen troops flash FALLEN and begin training; melee adds clash sparks, periodic CLASH crits, combat HP-bar tint, and faster idle regen.
- 2026-07-19 — Step 25 complete: level-gated tower abilities (Volley, Rune Nova, Barrage, Hold Fast) with cooldowns; restored missing mage chain lightning; mage/artillery/archer AA rules corrected so artillery remains ground-only.
- 2026-07-19 — Step 26 complete: enemies show compact ARM/FLY/SWM/ELT trait badges derived from pure trait metadata.
- 2026-07-19 — Steps 28–30 complete: Hexer support aura slows nearby tower fire rates; Warden boss has telegraphed shield/rage phases with mage counterplay window; economy retuned (280 start gold, 20 lives, stronger wave gold, hexer wave).
- 2026-07-19 — Steps 31–50 complete: campaign map select + stars, early-call bonus, richer tower/hero UX and keyboard controls, responsive shell, map palette/juice/music intensity polish, full contract suite green, 1.0 docs updated for release.
