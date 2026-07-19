# KRC Manual Regression Checklist

Run this checklist from a static local server before every release candidate.

## Launch
- [ ] Start the game through a web server; do not open the HTML file directly.
- [ ] Confirm the title overlay appears and `TAP TO START` unlocks audio after interaction.
- [ ] Confirm the game fits a portrait phone viewport and a desktop browser without page scrolling.

## Build and economy
- [ ] Build Rangers, Runes, Mortar, and Guard on empty round pads.
- [ ] Attempt an unaffordable build and confirm gold is unchanged with useful feedback.
- [ ] Select a built tower: range preview and next upgrade cost appear.
- [ ] Upgrade each tower once, then sell one; confirm refund and pad reset are correct.

## Combat and waves
- [ ] Start a wave only after the tutorial’s minimum tower condition is met.
- [ ] Confirm arrows, magic, and mortars hit eligible targets; mortars do not target flying units.
- [ ] Confirm Guard soldiers spawn, block ground enemies, attack, die, and respawn.
- [ ] Confirm flying enemies bypass blockers and can be damaged by eligible towers.
- [ ] Confirm armor/slow/splash feedback produces no console errors.
- [ ] Confirm a leak reduces lives and zero lives opens the defeat overlay.

## Hero and spells
- [ ] Select the Captain and send him to a road point.
- [ ] Use Charge, Banner, and Heal in valid states; cooldowns and feedback update.
- [ ] Use Meteor, Frost, and Rally during a wave; cooldowns and effects update.
- [ ] Let the Captain fall; confirm a visible recovery and safe respawn.

## Campaign and end states
- [ ] Clear one map; confirm the next map starts with the stated carry-over rules.
- [ ] Clear the final map; confirm victory overlay and restart work.
- [ ] Reload after a complete run; confirm no stale entities, overlays, or looping audio persist.

## QA URLs
- [ ] Visit `?qa=1&emberTest=1`; confirm `document.body.dataset.krcEmberTest` is `pass`.
- [ ] Visit `?qa=1&broodTest=1`; confirm `document.body.dataset.krcBroodTest` is `pass`.
- [ ] Visit `?qa=1&map=2&startWave=8`; confirm map and wave selection are honored.

## Release rule
Every box must pass. A console exception, invisible input target, stuck entity, bad layout, or broken sound path is a release blocker.
