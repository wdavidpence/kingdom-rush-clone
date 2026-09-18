KRC 1.1.6 SAME assignment. Surgical only. Not spark spam.

File public/src/game.js campaign node onOver/onOut (MAPS.forEach around node interactivity).

LIVE unlocked hover:
          const onOver = () => {
            nodeBg.setStrokeStyle(3.5, 0xfff0a0, 1);
            labelBg.setStrokeStyle(2, 0xfff0a0, 1);
            ...
          };
          const onOut = () => {
            nodeBg.setStrokeStyle(3, 0xf5c85a, 1);
            labelBg.setStrokeStyle(1.5, 0xd8b548, 1);
            ...
          };

Change: hover stroke uses biome color by index, not generic gold.
0 Forest 0x7ec86a
1 Stone 0xb8c4d0
2 Ember 0xff7030
3 Gale 0x7ec8e8
4 Ash 0xd4a878

onOut still restores gold 0xf5c85a / 0xd8b548.

HARD RULE: do not move Forest Gate { x: 100, y: 375 } or bannerY=98.
Do not bump version. Do not rewrite the campaign overlay.

node --check public/src/game.js
