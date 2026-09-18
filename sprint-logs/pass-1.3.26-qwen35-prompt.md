KRC 1.3.26 qwen35 ONE task (not MoA): rewrite drawSoldierGuardWalk so barracks soldiers read as KR-style GUARDS at ~40px: helm, shield, spear, walk cycle.

Keep signature: const drawSoldierGuardWalk = (ctx, frame = 0) => {
Keep frame % 4 bob. Fat #141008. Face via face() if used live.

Do NOT edit drawScout, drawBrute, drawFlyer, drawTitan, drawBossIdle, projectile_magic,
drawHeroCaptainIdle/Attack/Ability, drawMageCrystal128, drawBarracksL2,
drawSoldierGuardAttack, drawSoldierGuardBlock.

LIVE drawSoldierGuardWalk:
    const drawSoldierGuardWalk = (ctx, frame = 0) => {
      const f = frame % 4;
      const bodyY = (f === 1 || f === 3) ? 19 : 21;
      const headY = (f === 1 || f === 3) ? 13 : 15;
      const helmY = (f === 1 || f === 3) ? 4 : 6;
      const OUT = "#141008";

      shadow(ctx, 28, 53, (f === 0 || f === 2) ? 21 : 18, 5.5, 0.46);

      const nearLegGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#8a6c4c"], [0.48, "#5c422a"], [1, "#2a1c10"]]);
      const farLegGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#5a4028"], [0.5, "#3a2616"], [1, "#1a0e08"]]);
      const bootGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#5a4026"], [0.5, "#382414"], [1, "#180c06"]]);
      const bronzeG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff6be"], [0.45, "#d8ac44"], [1, "#704c1a"]]);
      const steelG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#ffffff"], [0.45, "#dce5ee"], [1, "#667688"]]);

      // Legs: distinct stride vs passing bounce
      if (f === 0) {
        // Frame 0: Left stride forward, right leg back
        poly(ctx, [[29, 35], [37, 35], [44, 47], [36, 48]], farLegGrad(29, 35, 44, 48), OUT, 2.6);
        rounded(ctx, 35, 46, 12, 6.5, 2.5, bootGrad(35, 46, 35, 52.5), OUT, 2.2);
        poly(ctx, [[18, 35], [26, 35], [19, 48], [11, 48]], nearLegGrad(18, 35, 11, 48), OUT, 2.8);
        rounded(ctx, 8, 47, 13, 6.5, 2.5, bootGrad(8, 47, 8, 53.5), OUT, 2.4);
      } else if (f === 1) {
        // Frame 1: Upward passing step — left leg planted, right leg lifted
        rounded(ctx, 17, 33, 10, 15, 3, nearLegGrad(17, 33, 27, 48), OUT, 2.8);
        rounded(ctx, 15, 47, 13, 6.5, 2.5, bootGrad(15, 47, 15, 53.5), OUT, 2.4);
        poly(ctx, [[29, 33], [37, 33], [40, 41], [33, 42]], farLegGrad(29, 33, 40, 42), OUT, 2.6);
        rounded(ctx, 33, 39, 11, 6, 2, bootGrad(33, 39, 33, 45), OUT, 2.2);
      } else if (f === 2) {
        // Frame 2: Right stride forward, left leg back
        poly(ctx, [[18, 35], [26, 35], [13, 47], [6, 46]], farLegGrad(18, 35, 13, 47), OUT, 2.6);
        rounded(ctx, 4, 45, 12, 6.5, 2.5, bootGrad(4, 45, 4, 51.5), OUT, 2.2);
        poly(ctx, [[29, 35], [37, 35], [44, 48], [36, 48]], nearLegGrad(29, 35, 44, 48), OUT, 2.8);
        rounded(ctx, 36, 47, 13, 6.5, 2.5, bootGrad(36, 47, 36, 53.5), OUT, 2.4);
      } else {
        // Frame 3: Upward passing step — right leg planted, left leg lifted
        poly(ctx, [[18, 33], [26, 33], [28, 41], [21, 42]], farLegGrad(18, 33, 28, 41), OUT, 2.6);
        rounded(ctx, 20, 39, 11, 6, 2, bootGrad(20, 39, 20, 45), OUT, 2.2);
        rounded(ctx, 29, 33, 10, 15, 3, nearLegGrad(29, 33, 39, 48), OUT, 2.8);
        rounded(ctx, 28, 47, 13, 6.5, 2.5, bootGrad(28, 47, 28, 53.5), OUT, 2.4);
      }

      // Gambeson / Tunic
      poly(ctx, [[14, bodyY + 14], [42, bodyY + 14], [43, bodyY + 20], [13, bodyY + 20]], linGrad(ctx, 13, bodyY + 14, 43, bodyY + 20, [[0, "#725436"], [0.5, "#4c341e"], [1, "#2a1a0c"]]), OUT, 2.2);

      // Bronze Cuirass
      rounded(ctx, 13, bodyY, 30, 18, 5, bronzeG(13, bodyY, 43, bodyY + 18), OUT, 3.0);
      // Breastplate center ridge highlight
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(28, bodyY + 2);
      ctx.lineTo(28, bodyY + 14);
      ctx.stroke();

      // Head & Face
      ellipse(ctx, 28, headY, 11.5, 11, linGrad(ctx, 17, headY - 8, 39, headY + 8, [[0, "#fff2d6"], [0.45, "#e5b478"], [1, "#9e6630"]]), OUT, 2.6);

      // Huge Cream Eyes & Face (high readability at ~28px)
      ellipse(ctx, 23.5, headY, 3.2, 3.6, "#fffbe0", OUT, 2.0);
      ellipse(ctx, 32.5, headY, 3.2, 3.6, "#fffbe0", OUT, 2.0);
      ellipse(ctx, 24.2, headY + 0.3, 1.6, 2.0, "#141008");
      ellipse(ctx, 33.2, headY + 0.3, 1.6, 2.0, "#141008");
      ellipse(ctx, 23.4, headY - 0.8, 0.9, 0.9, "#ffffff");
      ellipse(ctx, 32.4, headY - 0.8, 0.9, 0.9, "#ffffff");

      // Resolute Eyebrows
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(20, headY - 3.5); ctx.lineTo(26, headY - 2);
      ctx.moveTo(36, headY - 3.5); ctx.lineTo(30, headY - 2);
      ctx.stroke();

      // Bronze Helmet with Red Crest
      rounded(ctx, 16, helmY, 24, 11, 4, bronzeG(16, helmY, 40, helmY + 11), OUT, 2.8);
      poly(ctx, [[28, helmY - 6], [23, helmY + 2], [33, helmY + 2]], linGrad(ctx, 23, helmY - 6, 33, helmY + 2, [[0, "#ff3838"], [0.5, "#d4aa44"], [1, "#724e1c"]]), OUT, 2.2);

      // Shield (Left arm) — readable at ~28px
      let shDx = 0, shDy = 0, shRot = 0;
      if (f === 0) { shDx = 0; shDy = 0; shRot = -0.04; }
      else if (f === 1) { shDx = 1; shDy = -1; shRot = 0.02; }
      else if (f === 2) { shDx = 2; shDy = 0; shRot = 0.05; }
      else { shDx = 1; shDy = -1; shRot = -0.02; }

      ctx.save();
      ctx.translate(15 + shDx, bodyY + 10 + shDy);
      ctx.rotate(shRot);
      // Shield bronze rim & body
      poly(ctx, [[-8, -13], [6, -15], [8, 8], [0, 16], [-10, 8]], bronzeG(-10, -15, 8, 16), OUT, 2.8);
      // Vibrant royal blue heraldic field
      poly(ctx, [[-5, -8], [3, -8], [2, 4], [-6, 4]], linGrad(ctx, -6, -8, 3, 4, [[0, "#4a7ec8"], [0.6, "#245098"], [1, "#12244a"]]), OUT, 1.8);
      // Golden center boss
      ellipse(ctx, -1.5, -2, 1.8, 1.8, "#ffe480", OUT, 1.0);
      ctx.restore();

      // Large Readable Spear (Right arm)
      let sp0x, sp0y, sp1x, sp1y;
      if (f === 0) { sp0x = 38; sp0y = bodyY + 19; sp1x = 48; sp1y = bodyY - 14; }
      else if (f === 1) { sp0x = 37; sp0y = bodyY + 17; sp1x = 46; sp1y = bodyY - 17; }
      else if (f === 2) { sp0x = 39; sp0y = bodyY + 16; sp1x = 50; sp1y = bodyY - 13; }
      else { sp0x = 38; sp0y = bodyY + 18; sp1x = 47; sp1y = bodyY - 16; }

      // Spear Shaft (Thick & bold)
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 5.0;
      ctx.beginPath();
      ctx.moveTo(sp0x, sp0y);
      ctx.lineTo(sp1x, sp1y);
      ctx.stroke();

      ctx.strokeStyle = linGrad(ctx, sp0x, sp0y, sp1x, sp1y, [[0, "#6e4820"], [0.5, "#9e6e34"], [1, "#d49a4e"]]);
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(sp0x, sp0y);
      ctx.lineTo(sp1x, sp1y);
      ctx.stroke();

      // Spearhead (Large & shiny)
      const ang = Math.atan2(sp1y - sp0y, sp1x - sp0x);
      const tipX = sp1x + Math.cos(ang) * 12;
      const tipY = sp1y + Math.sin(ang) * 12;
      const pX = -Math.sin(ang) * 5.0;
      const pY = Math.cos(ang) * 5.0;
      poly(ctx, [[tipX, tipY], [sp1x + pX, sp1y + pY], [sp1x - pX, sp1y - pY]], steelG(sp1x - 5, sp1y - 5, tipX, tipY), OUT, 2.6);
      // Spearhead bright center glint
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(sp1x, sp1y);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      ellipse(ctx, tipX - 0.5, tipY - 0.5, 1.8, 1.8, "#ffffff");

      // Right gauntlet gripping spear
      ellipse(ctx, (sp0x * 0.4 + sp1x * 0.6), (sp0y * 0.4 + sp1y * 0.6), 3.8, 3.8, bronzeG(0, 0, 10, 10), OUT, 2.0);
    };

HELPERS: poly/linGrad/radGrad/ellipse/rounded/shadow/speckles/face live arities.
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

HARD: { x: 100, y: 375 }, bannerY=98. No CONFIG. No make(fn).

Output ```diff:public/src/krc-art.js only.
