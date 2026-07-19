# KRC — Original Fantasy Tower Defense

KRC is an original, touch-first fantasy tower-defense campaign made with Phaser 3 and static browser files. It draws on the best *genre* qualities of classic lane-defense games—fixed build pads, four complementary tower roles, troops that hold the line, a controllable hero, spells, upgrades, and short dramatic waves—without using another game's art, audio, maps, dialogue, characters, or code.

## Play

- **Live:** https://wdavidpence.github.io/kingdom-rush-clone/
- **Local:**

```bash
bash scripts/smoke-static.sh
python3 -m http.server 4173 --directory public --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/`. The first tap/click starts audio (browser requirement).

## Controls

Touch / mouse
- Choose **Rangers**, **Runes**, **Mortar**, or **Guard**, then tap a round build pad (range preview shows).
- Select a built tower to upgrade / sell (sell shows refund gold).
- Tap **CALL** early for a gold bonus, or when ready for the next wave.
- Tap **Captain**, then the road to move him. Use **CHG**, **BAN**, **HEAL**.
- Spells: **MET**, **ICE**, **RLY**. Guards: tap road to set **RLY** rally.
- Pause, mute, and reduced-motion toggles are on the HUD.

Keyboard
- `1–4` tower types · `Space` CALL · `U` upgrade · `S` sell · `H` hero · `P` pause · `M` mute · `R` reduced motion · `Esc` clear selection

## Tower roles

| Tower | Role | High-tier ability | Counterplay |
| --- | --- | --- | --- |
| Rangers | Fast anti-air | **Volley** multi-shot | Strong vs flyers; weaker into armor |
| Runes | Magic + slow | **Rune Nova** + chain lightning | Reliable into armor |
| Mortar | Ground splash | **Barrage** delayed blast | Best vs swarms; cannot hit flyers |
| Guard | Road blockers | **Hold Fast** harden/heal | Creates choke points; flyers bypass |

## Enemies & campaign

- Traits badges: ARM · FLY · SWM · CTL · ELT
- **Hexer** support units aura-slow nearby towers (place beyond aura or kill supports first).
- **Warden** final boss: telegraphed shield phase (pierce with Runes) then rage phase (spawn adds).
- Three original maps with unlocks + 1–3 stars from lives remaining.
- Campaign map select persists best stars/gold in local storage.

## Quality assurance

```bash
for t in tests/*.test.mjs; do node "$t"; done
bash scripts/smoke-static.sh
```

QA URL: `http://127.0.0.1:4173/?qa=1&emberTest=1` → `document.body.dataset.krcEmberTest` must be `pass`.

Docs: `docs/kingdom-rush-inspired-1.0-plan.md`, `docs/session-handoff.md`, `docs/1.0-acceptance.md`, `docs/manual-regression-checklist.md`.

## Credits

Original KRC gameplay, procedural art, characters, maps, UI, and code. Kenney audio credited in `docs/third-party-assets.md` (CC0).
