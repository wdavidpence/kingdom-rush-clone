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
- [ ] 11. Split static gameplay data (maps, towers, enemies, waves) from scene behavior.
- [ ] 12. Add stable entity IDs and explicit state fields for robust targeting and cleanup.
- [ ] 13. Replace magic layout numbers with named UI/map constants where practical.
- [ ] 14. Add reusable helpers for particles, floating combat text, and audio calls.
- [ ] 15. Add safe scene cleanup/reset paths to prevent stale sounds or entities.
- [ ] 16. Add a lightweight save/preferences layer for audio and accessibility settings.
- [ ] 17. Add a campaign-state model for map unlocks, stars, and best results.
- [ ] 18. Add deterministic QA/query parameters for map, wave, and combat testing.
- [ ] 19. Add runtime invariant checks in QA mode for gold/lives/entity counts.
- [ ] 20. Validate JavaScript syntax and static asset links after each refactor milestone.

### C. Core Kingdom-Rush-style tactical loop (original implementation)
- [ ] 21. Make each tower family’s role, target rules, and counterplay immediately legible.
- [ ] 22. Improve target selection so towers prioritize the most progressed eligible enemy reliably.
- [ ] 23. Upgrade guard deployment into a visible rally-point and blocking system.
- [ ] 24. Add clear troop respawn/readiness feedback and richer melee encounters.
- [ ] 25. Add unique high-tier tower abilities with cooldown/level gating.
- [ ] 26. Add enemy traits with readable iconography: armor, flying, swarm, and elite.
- [ ] 27. Add a swarm/split archetype and verify safe death-chain handling.
- [ ] 28. Add a support/control archetype that changes placement decisions without invalidating towers.
- [ ] 29. Give the final boss telegraphed phases and a tactical counterplay window.
- [ ] 30. Retune economy, costs, rewards, wave density, and life loss through complete campaign runs.

### D. Campaign, progression, and UX
- [ ] 31. Add a campaign-selection view with original map cards and locked/unlocked states.
- [ ] 32. Track and show one-to-three-star performance after every map.
- [ ] 33. Add brief map-specific objectives/tutorial callouts without interrupting play.
- [ ] 34. Add optional early-wave start bonus to reward decisive play.
- [ ] 35. Improve tower selection presentation with named roles, stats, affordability, and range preview.
- [ ] 36. Improve upgrade/sell panel with refund clarity and maximum-level feedback.
- [ ] 37. Improve hero selection, path movement, level feedback, respawn feedback, and skill targeting.
- [ ] 38. Add pause, restart, mute, and reduced-motion controls.
- [ ] 39. Improve keyboard/mouse support while retaining touch-first controls.
- [ ] 40. Improve responsive layout for portrait phones, landscape phones, tablets, and desktop browsers.

### E. Original audiovisual polish
- [ ] 41. Redraw terrain, path, build pads, and gates with a more cohesive original storybook palette.
- [ ] 42. Add distinct idle/move/attack/hit/death animation cues to all enemy families.
- [ ] 43. Add tower firing recoil, projectile trails, impact flashes, and controlled screen shake.
- [ ] 44. Add richer guard/hero silhouettes, motion cues, and combat readability.
- [ ] 45. Add original UI ornamentation, type hierarchy, and high-contrast status indicators.
- [ ] 46. Add layered original procedural ambience and combat SFX mixing with volume control.
- [ ] 47. Add music intensity transitions that respond to active waves without abrupt resets.
- [ ] 48. Add colorblind-safe/contrast-conscious cues beyond hue alone.

### F. Verification and release
- [ ] 49. Run scripted QA plus desktop and touch-browser smoke tests; fix all discovered blockers.
- [ ] 50. Update README, release notes, plan/handoff, commit the polished 1.0, and push when authenticated.

## Validation gates

- **Refactor gate (after step 20):** game launches; QA Ember test passes; no JavaScript syntax errors; build/call/upgrade/sell remains usable.
- **Gameplay gate (after step 30):** each tower has a purpose; a full three-map campaign is winnable with at least two viable strategies; no unavoidable leak spikes.
- **Polish gate (after step 48):** feedback is readable at mobile scale, audio has an accessible mute path, and every UI action provides a response.
- **Release gate (step 50):** static server smoke test, browser smoke test, clean git status, documentation complete, commit created; push only if existing credentials permit it.

## Change log

- 2026-07-18 — Steps 01–05 complete. Repository baseline is commit `7e95612`; implementation work begins with foundation/refactor and replayability polish.
