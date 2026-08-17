# KRC next 20 polishes (from v1.0.37)

Legal: original competitor only. Kingdom Rush is a genre bar, not a copy target. No KR art, names, maps, audio, or indistinguishability claims.

Shipped through 1.0.37: presentation 1–18 plus combat juice through coin bursts (plan 24), plus extra service slices (HUD 390, shop taps, notch banner, reduced-motion stills, stingers, persist mix, board plaques).

Each item is one numbered patch after syntax / tests / `git diff --check` / live Forest Gate → CALL / portrait gates. Publish only verified slices.

| Rel | Slice | Player-visible acceptance |
|---|---|---|
| 1.0.38 | Tiny camera punch on hero ability + Warden shield/rage | Punch fires on CHG/BAN/HEAL and boss phase change; skipped under reduced-motion; intensity ≤ 0.008; existing death/explode shakes unchanged |
| 1.0.39 | Kill-streak / last-hit pops that do not hide HP | Combo pops above corpse, HP bar stays readable |
| 1.0.40 | Range preview as terrain decal | Pad/tower range reads as ground stain, not a raw circle |
| 1.0.41 | Slow / burn / armor materials on enemies | Debuff readable at a glance without extra text |
| 1.0.42 | Hex / disable feedback on the tower itself | Hexed tower looks cursed/offline, not only an enemy ring |
| 1.0.43 | End-of-wave cleanup and battlefield calm | Dust/corpses settle; music/ambience eases after last leak risk |
| 1.0.44 | Second hero with a different job (hold vs hunt) | Original name/art; distinct loop from Captain |
| 1.0.45 | High-tier specializations — first family, two original paths | Choice is visible before spend; no KR path names |
| 1.0.46 | Remaining families get two original high-tier paths | Same rule as 1.0.45 |
| 1.0.47 | Star rewards unlock a cosmetic or tactical bonus | 3-star grant is visible on campaign board |
| 1.0.48 | Fourth original map + unique topology | New node; Forest Gate stays (100,375) |
| 1.0.49 | Fifth original map + unique modifier | Distinct from 1.0.48 |
| 1.0.50 | Iron challenge (lean gold / no-build / rush) | Preview text names the rule before CALL |
| 1.0.51 | New enemy + one new counterplay rule | Role badge + tower counter in UI |
| 1.0.52 | Guard rally that feels like commanding a squad | Rally tap moves the whole squad with cloth/dust |
| 1.0.53 | Spell upgrades earned from stars | MET/ICE/RLY gain a visible rank, not only cooldown |
| 1.0.54 | Campaign briefings that teach the next threat | One short briefing card per unlocked node |
| 1.0.55 | Economy retune after live 5-map runs | Gold/lives/bounty numbers from recorded probes, not guesses |
| 1.0.56 | Layered combat mix: bow / rune / mortar / steel | Four families distinguishable with mute off |
| 1.0.57 | Map ambience beds (forest / stone / marsh) | Bed starts after first tap; mute/reduced-motion still kill it |

After 1.0.57: remaining program items are music rise/fall on CALL, wooden UI ticks, full campaign live acceptance, and Pages root verification.

Hard contracts for every slice: Forest Gate node `(100,375)`, `bannerY = 98`, bounty math and `Math.floor(spent * 0.55)` unchanged unless the slice is 1.0.55.
