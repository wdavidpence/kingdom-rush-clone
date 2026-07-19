# KRC — Original Fantasy Tower Defense

KRC is an original, touch-first fantasy tower-defense campaign made with Phaser 3 and static browser files. It draws on the best *genre* qualities of classic lane-defense games—fixed build pads, four complementary tower roles, troops that hold the line, a controllable hero, spells, upgrades, and short dramatic waves—without using another game's art, audio, maps, dialogue, characters, or code.

## Play locally

From the repository root:

```bash
bash scripts/smoke-static.sh
python3 -m http.server 4173 --directory public --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/` in a modern browser. The first tap/click starts audio, as browsers require.

## Controls

- Choose **Rangers**, **Runes**, **Mortar**, or **Guard**, then tap/click a round build pad.
- Select a built tower to see its range and **upgrade** or **sell** it.
- Tap **CALL** when ready to begin the next wave.
- Tap the **Captain**, then tap the road to move him into the fight.
- While the Captain is selected, use **CHG**, **BAN**, and **HEAL**.
- Use **MET**, **ICE**, and **RLY** to manage difficult enemy packs.

## Tower roles

| Tower | Role | Counterplay |
| --- | --- | --- |
| Rangers | Fast anti-air physical damage | Strong against mobile flyers; weaker into armor |
| Runes | Magic damage and slowing | Reliable into armored enemies; limited area damage |
| Mortar | Long-range splash damage | Best into clustered ground enemies; cannot hit flyers |
| Guard | Road blockers and melee support | Creates choke points; flyers bypass soldiers |

## Campaign

The campaign currently contains three original maps—Forest Gate, Stone Pass, and Ember Marsh—with escalating ten-wave battles. Clear a map to carry a bounded gold/lives reward into the next one.

## Quality assurance

- Static preflight: `bash scripts/smoke-static.sh`
- Manual playtest checklist: `docs/manual-regression-checklist.md`
- 1.0 release gate: `docs/1.0-acceptance.md`
- Durable build plan: `docs/kingdom-rush-inspired-1.0-plan.md`
- Cross-session handoff: `docs/session-handoff.md`

For a quick built-in combat regression check, load:

```text
http://127.0.0.1:4173/?qa=1&emberTest=1
```

Then inspect `document.body.dataset.krcEmberTest`; it must read `pass`.

## Credits and licensing

KRC gameplay, procedural visuals, characters, maps, UI, and code are original. The included Kenney audio files are credited in `docs/third-party-assets.md`; public Kenney asset listings identify their game assets as CC0 1.0.
