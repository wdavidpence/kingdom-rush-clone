KRC 1.3.5 MoA ONE task: rewrite drawTitan so the stone titan reads as a giant at play scale.

Play scale ~70px (make 88x80, setScale(size/30), live size 24).
Wow bar: HEAD + SHOULDERS + FISTS/LEGS. Fat #141008 outline 3.0. Gray stone vs moss. Huge eyes. Not a brown boulder.

Keep make("enemy_titan", 88, 80 and w0-w3/enrage/dead wrappers. Do not change 88,80.
Do NOT edit drawScout, drawBrute, drawFlyer.

LIVE wrappers:
    make("enemy_titan", 88, 80, (ctx) => drawTitan(ctx, 0));
    make("enemy_titan_w0", 88, 80, (ctx) => drawTitan(ctx, 0));
    make("enemy_titan_w1", 88, 80, (ctx) => drawTitan(ctx, 1));
    make("enemy_titan_w2", 88, 80, (ctx) => drawTitan(ctx, 2));
    make("enemy_titan_w3", 88, 80, (ctx) => drawTitan(ctx, 3));
    make("enemy_titan_enrage", 88, 80, (ctx) => drawTitanEnrage(ctx));
    make("enemy_titan_dead", 88, 80, (ctx) => drawTitanDead(ctx));

LIVE drawTitan:
    const drawTitan = (ctx, frame = 0) => {
      shadow(ctx, 44, 72, 36, 9, 0.48);
      const f = frame % 4;

      const bodyX = f === 0 ? 20 : f === 2 ? 24 : 22;
      const bodyY = (f === 1 || f === 3) ? 20 : 22;
      const headX = f === 0 ? 42 : f === 2 ? 46 : 44;
      const headY = (f === 1 || f === 3) ? 14 : 16;
      const OUT = "#141008";

      const stoneG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#dfd8cc"], [0.45, "#948c80"], [0.85, "#524a42"], [1, "#28221c"]]);
      const darkStoneG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#7c746a"], [0.6, "#484038"], [1, "#1c1612"]]);
      const mossG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#98c840"], [0.6, "#588820"], [1, "#244408"]]);

      // Heavy Stomp Legs & Plated Stone Greaves
      if (f === 0) {
        // Left heavy forward slam
        rounded(ctx, 21, 42, 18, 26, 6, stoneG(21, 42, 39, 68), OUT, 3.0);
        rounded(ctx, 14, 62, 26, 10, 4, darkStoneG(14, 62, 40, 72), OUT, 2.8);
        // Stomp dust puff
        ellipse(ctx, 24, 70, 12, 4, "rgba(220, 205, 180, 0.65)");
        // Right trailing back
        rounded(ctx, 52, 43, 16, 22, 5, darkStoneG(52, 43, 68, 65), OUT, 3.0);
        rounded(ctx, 51, 60, 18, 8, 3.5, darkStoneG(51, 60, 69, 68), OUT, 2.6);
      } else if (f === 1) {
        // Left planted
        rounded(ctx, 25, 42, 17, 26, 6, stoneG(25, 42, 42, 68), OUT, 3.0);
        rounded(ctx, 22, 63, 22, 9, 3.5, darkStoneG(22, 63, 44, 72), OUT, 2.8);
        // Right lifted passing knee
        rounded(ctx, 49, 36, 18, 20, 6, darkStoneG(49, 36, 67, 56), OUT, 3.0);
        rounded(ctx, 48, 50, 20, 9, 3.5, darkStoneG(48, 50, 68, 59), OUT, 2.6);
      } else if (f === 2) {
        // Left trailing back
        rounded(ctx, 20, 43, 16, 22, 5, darkStoneG(20, 43, 36, 65), OUT, 3.0);
        rounded(ctx, 18, 60, 18, 8, 3.5, darkStoneG(18, 60, 36, 68), OUT, 2.6);
        // Right heavy forward slam
        rounded(ctx, 49, 42, 18, 26, 6, stoneG(49, 42, 67, 68), OUT, 3.0);
        rounded(ctx, 48, 62, 26, 10, 4, darkStoneG(48, 62, 74, 72), OUT, 2.8);
        // Stomp dust puff
        ellipse(ctx, 62, 70, 12, 4, "rgba(220, 205, 180, 0.65)");
      } else {
        // Left lifted passing knee
        rounded(ctx, 21, 36, 18, 20, 6, darkStoneG(21, 36, 39, 56), OUT, 3.0);
        rounded(ctx, 20, 50, 20, 9, 3.5, darkStoneG(20, 50, 40, 59), OUT, 2.6);
        // Right planted
        rounded(ctx, 47, 42, 17, 26, 6, stoneG(47, 42, 64, 68), OUT, 3.0);
        rounded(ctx, 44, 63, 22, 9, 3.5, darkStoneG(44, 63, 66, 72), OUT, 2.8);
      }

      // Massive Crag Shoulders with Jagged Granite Spikes
      poly(ctx, [[bodyX - 4, bodyY + 8], [bodyX - 10, bodyY - 4], [bodyX + 6, bodyY - 1]], stoneG(bodyX - 10, bodyY - 4, bodyX + 6, bodyY + 8), OUT, 2.6);
      poly(ctx, [[bodyX + 48, bodyY + 8], [bodyX + 54, bodyY - 4], [bodyX + 38, bodyY - 1]], stoneG(bodyX + 38, bodyY - 4, bodyX + 54, bodyY + 8), OUT, 2.6);

      // Colossal Torso Granite Monolith
      rounded(ctx, bodyX, bodyY, 44, 34, 10, stoneG(bodyX, bodyY, bodyX + 44, bodyY + 34), OUT, 3.2);

      // Glowing Amber / Magma Fissure Cracks in Torso
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(bodyX + 12, bodyY + 6);
      ctx.lineTo(bodyX + 18, bodyY + 20);
      ctx.lineTo(bodyX + 28, bodyY + 14);
      ctx.moveTo(bodyX + 32, bodyY + 6);
      ctx.lineTo(bodyX + 30, bodyY + 22);
      ctx.lineTo(bodyX + 22, bodyY + 30);
      ctx.stroke();

      ctx.strokeStyle = "#ff7700";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(bodyX + 12, bodyY + 6);
      ctx.lineTo(bodyX + 18, bodyY + 20);
      ctx.lineTo(bodyX + 28, bodyY + 14);
      ctx.moveTo(bodyX + 32, bodyY + 6);
      ctx.lineTo(bodyX + 30, bodyY + 22);
      ctx.lineTo(bodyX + 22, bodyY + 30);
      ctx.stroke();

      ctx.strokeStyle = "#fff080";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bodyX + 13, bodyY + 7);
      ctx.lineTo(bodyX + 18, bodyY + 20);
      ctx.moveTo(bodyX + 31, bodyY + 7);
      ctx.lineTo(bodyX + 30, bodyY + 22);
      ctx.stroke();

      // Lush Moss Patches on shoulders & chest
      ellipse(ctx, bodyX + 8, bodyY + 12, 7, 4, mossG(bodyX + 1, bodyY + 8, bodyX + 15, bodyY + 16), OUT, 1.8);
      ellipse(ctx, bodyX + 36, bodyY + 18, 6, 3.5, mossG(bodyX + 30, bodyY + 14, bodyX + 42, bodyY + 22), OUT, 1.8);

      // Chiseled Stone Head
      ellipse(ctx, headX, headY, 17, 15, stoneG(headX - 16, headY - 14, headX + 16, headY + 15), OUT, 3.0);
      // Heavy Brow Ridge Slab
      rounded(ctx, headX - 15, headY - 8, 30, 7, 3, darkStoneG(headX - 15, headY - 8, headX + 15, headY - 1), OUT, 2.4);

      // Huge Expressive Cream / Amber Eyes
      ellipse(ctx, headX - 6.5, headY + 1, 4.2, 4.8, "#fffbe0", OUT, 2.4);
      ellipse(ctx, headX + 6.5, headY + 1, 4.2, 4.8, "#fffbe0", OUT, 2.4);
      // Molten amber pupils
      ellipse(ctx, headX - 6.5, headY + 1.2, 2.4, 2.8, "#d04400");
      ellipse(ctx, headX + 6.5, headY + 1.2, 2.4, 2.8, "#d04400");
      ellipse(ctx, headX - 6.5, headY + 1.2, 1.2, 1.6, "#ffe640");
      ellipse(ctx, headX + 6.5, headY + 1.2, 1.2, 1.6, "#ffe640");
      // Eye glint
      ellipse(ctx, headX - 7.5, headY - 0.5, 1.2, 1.2, "#ffffff");
      ellipse(ctx, headX + 5.5, headY - 0.5, 1.2, 1.2, "#ffffff");

      // Chiseled Granite Jaw / Mouth
      rounded(ctx, headX - 8, headY + 7, 16, 6, 2, darkStoneG(headX - 8, headY + 7, headX + 8, headY + 13), OUT, 1.8);

      // Massive Boulder Fists
      let lFistX, lFistY, rFistX, rFistY;
      if (f === 0) {
        lFistX = bodyX - 9; lFistY = bodyY + 24; rFistX = bodyX + 53; rFistY = bodyY + 18;
      } else if (f === 1) {
        lFistX = bodyX - 7; lFistY = bodyY + 21; rFistX = bodyX + 51; rFistY = bodyY + 11;
      } else if (f === 2) {
        lFistX = bodyX - 7; lFistY = bodyY + 18; rFistX = bodyX + 55; rFistY = bodyY + 24;
      } else {
        lFistX = bodyX - 7; lFistY = bodyY + 11; rFistX = bodyX + 49; rFistY = bodyY + 21;
      }

      ellipse(ctx, lFistX, lFistY, 13, 13, stoneG(lFistX - 12, lFistY - 12, lFistX + 12, lFistY + 12), OUT, 3.0);
      ellipse(ctx, rFistX, rFistY, 13, 13, stoneG(rFistX - 12, rFistY - 12, rFistX + 12, rFistY + 12), OUT, 3.0);
      // Boulder Knuckle Ridges
      rounded(ctx, lFistX - 8, lFistY - 4, 16, 7, 2, darkStoneG(lFistX - 8, lFistY - 4, lFistX + 8, lFistY + 3), OUT, 1.8);
      rounded(ctx, rFistX - 8, rFistY - 4, 16, 7, 2, darkStoneG(rFistX - 8, rFistY - 4, rFistX + 8, rFistY + 3), OUT, 1.8);
    };


HELPERS only:
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
radGrad(ctx, x, y, r0, r1, [[t,color],...])
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
rounded(ctx, x, y, w, h, r, fill, stroke, line)
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)
face(ctx, cx, cy, eye, pupil, angry)

OPTIONAL public/src/game-data.js LIVE:
    titan: { name: "Titan", hp: 540, speed: 26, armor: 8, bounty: 48, leak: 4, color: 0x8e8379, size: 24 },
Allowed only: size: 24 → size: 26.

HARD: { x: 100, y: 375 }, bannerY=98, campaign, version, scout/brute/flyer.
No CONFIG. No make(fn). No placeholders.

Output only ```diff:public/src/krc-art.js and optional ```diff:public/src/game-data.js
Hunks must apply to LIVE drawTitan and make("enemy_titan", 88, 80.
