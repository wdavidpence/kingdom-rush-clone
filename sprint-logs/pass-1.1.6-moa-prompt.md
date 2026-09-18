You are qwen2735 PenceMOA. SAME assignment both models. Output ONLY ```diff:public/src/game.js

LIVE campaign node hover (do not invent APIs, do not move Forest Gate 100,375):

          const onOver = () => {
            nodeBg.setStrokeStyle(3.5, 0xfff0a0, 1);
            labelBg.setStrokeStyle(2, 0xfff0a0, 1);

          const onOut = () => {
            nodeBg.setStrokeStyle(3, 0xf5c85a, 1);
            labelBg.setStrokeStyle(1.5, 0xd8b548, 1);

Hover stroke must be biome by index: Forest 0x7ec86a, Stone 0xb8c4d0, Ember 0xff7030, Gale 0x7ec8e8, Ash 0xd4a878.
onOut stays gold. Surgical. No extra functions unless a local const biomeStroke = [...] inside the forEach.
