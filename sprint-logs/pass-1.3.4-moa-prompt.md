KRC 1.3.4 MoA ONE task: rewrite drawFlyer so the Wisp is a readable flying enemy at play scale.

Play scale ~40px (make 80x72, setScale(size/30), live size 15).
Wow bar: at 40px you must read WING/AURA + CORE + FACE. Cyan/white vs dark #141008 outline 2.8-3.2. Not a blue smudge.

Keep make("enemy_flyer", 80, 72 and w0-w3/dead wrappers. Do not change 80,72.
Do NOT edit drawScout or drawBrute.

LIVE wrappers:
    make("enemy_flyer", 80, 72, (ctx) => drawFlyer(ctx, 0));
    make("enemy_flyer_w0", 80, 72, (ctx) => drawFlyer(ctx, 0));
    make("enemy_flyer_w1", 80, 72, (ctx) => drawFlyer(ctx, 1));
    make("enemy_flyer_w2", 80, 72, (ctx) => drawFlyer(ctx, 2));
    make("enemy_flyer_w3", 80, 72, (ctx) => drawFlyer(ctx, 3));
    make("enemy_flyer_dead", 80, 72, (ctx) => drawFlyerDead(ctx));

LIVE drawFlyer:
    const drawFlyer = (ctx, frame = 0) => {
      const f = frame % 4;

      let bodyY, headY, shRx, shRy, shA, lWing, rWing, tailQuad;
      if (f === 0) {
        // High upstroke glide
        bodyY = 37; headY = 25; shRx = 17; shRy = 5.2; shA = 0.28;
        lWing = [[30, bodyY - 6], [8, bodyY - 24], [4, bodyY - 12], [14, bodyY - 2], [28, bodyY + 2]];
        rWing = [[50, bodyY - 6], [72, bodyY - 24], [76, bodyY - 12], [66, bodyY - 2], [52, bodyY + 2]];
        tailQuad = [48, 59, 56, 55];
      } else if (f === 1) {
        // Powerful downstroke push
        bodyY = 34; headY = 22; shRx = 15.5; shRy = 4.8; shA = 0.25;
        lWing = [[30, bodyY - 4], [6, bodyY - 10], [2, bodyY + 2], [14, bodyY + 8], [28, bodyY + 4]];
        rWing = [[50, bodyY - 4], [74, bodyY - 10], [78, bodyY + 2], [66, bodyY + 8], [52, bodyY + 4]];
        tailQuad = [48, 55, 56, 51];
      } else if (f === 2) {
        // Full bottom stroke scoop
        bodyY = 32; headY = 20; shRx = 14; shRy = 4.2; shA = 0.22;
        lWing = [[30, bodyY - 2], [10, bodyY + 6], [6, bodyY + 18], [18, bodyY + 16], [28, bodyY + 6]];
        rWing = [[50, bodyY - 2], [70, bodyY + 6], [74, bodyY + 18], [62, bodyY + 16], [52, bodyY + 6]];
        tailQuad = [50, 48, 58, 44];
      } else {
        // Wing recovery lift
        bodyY = 35; headY = 23; shRx = 15.5; shRy = 4.8; shA = 0.25;
        lWing = [[30, bodyY - 5], [14, bodyY - 16], [10, bodyY - 4], [20, bodyY + 2], [28, bodyY + 1]];
        rWing = [[50, bodyY - 5], [66, bodyY - 16], [70, bodyY - 4], [60, bodyY + 2], [52, bodyY + 1]];
        tailQuad = [47, 57, 55, 53];
      }

      shadow(ctx, 40, 60, shRx, shRy, shA);

      // Wings
      poly(
        ctx,
        lWing,
        linGrad(ctx, lWing[1][0], lWing[1][1], lWing[4][0], lWing[4][1], [[0, "rgba(210,248,255,.9)"], [1, "rgba(60,140,180,.6)"]]),
        "#4aa0c0",
        1.5
      );
      poly(
        ctx,
        rWing,
        linGrad(ctx, rWing[1][0], rWing[1][1], rWing[4][0], rWing[4][1], [[0, "rgba(210,248,255,.9)"], [1, "rgba(60,140,180,.6)"]]),
        "#4aa0c0",
        1.5
      );
      // Wing leading edge highlight
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lWing[0][0], lWing[0][1]);
      ctx.lineTo(lWing[1][0], lWing[1][1]);
      ctx.moveTo(rWing[0][0], rWing[0][1]);
      ctx.lineTo(rWing[1][0], rWing[1][1]);
      ctx.stroke();

      // Tail
      ctx.strokeStyle = "#48a0c0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, bodyY + 14);
      ctx.quadraticCurveTo(tailQuad[0], tailQuad[1], tailQuad[2], tailQuad[3]);
      ctx.stroke();

      // Body
      ellipse(ctx, 40, bodyY, 14, 16, linGrad(ctx, 28, bodyY - 14, 52, bodyY + 14, [[0, "#e0f8ff"], [0.5, "#60c0e0"], [1, "#206080"]]), "#184858", 2);
      // Belly plates
      ellipse(ctx, 40, bodyY + 3, 7, 9, "rgba(255,255,255,.3)");

      // Head
      ellipse(ctx, 40, headY, 10, 10, linGrad(ctx, 32, headY - 8, 48, headY + 8, [[0, "#f0fcff"], [1, "#48a0c0"]]), "#184858", 1.8);
      face(ctx, 40, headY, "#e8f8ff", "#082028");

      // Horn crest
      poly(ctx, [[40, headY - 14], [34, headY - 6], [46, headY - 6]], "#a0e0f0", "#184858", 1.2);
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
    flyer: { name: "Wisp", hp: 104, speed: 72, armor: 0, bounty: 14, leak: 1, color: 0x73d9ff, size: 15, flying: true },
Allowed only: size: 15 → size: 18.

HARD: { x: 100, y: 375 }, bannerY=98, campaign, version, drawScout, drawBrute.
No CONFIG. No make(fn). No placeholders.

Output only ```diff:public/src/krc-art.js and optional ```diff:public/src/game-data.js
Hunks must apply to LIVE drawFlyer and make("enemy_flyer", 80, 72.
