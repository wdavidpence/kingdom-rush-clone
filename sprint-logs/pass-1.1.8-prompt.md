KRC 1.1.8 SAME assignment. Surgical only.

File public/src/krc-art.js make("campaign_board_bg") Gale cliffs block ONLY.

LIVE:
      // Gale cliffs (upper)
      ctx.strokeStyle = "rgba(180, 210, 220, 0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(300, 48);
      ctx.quadraticCurveTo(330, 40, 348, 58);
      ctx.moveTo(308, 56);
      ctx.quadraticCurveTo(338, 50, 350, 66);
      ctx.stroke();

After those strokes, add 2-3 wind-cliff polys or a pale cloud ellipse at ~320,52 so Gale reads like Forest pines / Ember lava. Use existing poly/ellipse. Do not rewrite Forest/Stone/Ember/Ash. Do not bump version.

node --check public/src/krc-art.js
