KRC 1.3.17 qwen35 ONE task (not MoA): rewrite drawHeroCaptainAttack so the captain's attack pose reads vs idle.

Play scale keep 64x72. Wow: HELM + FACE + CAPE + RAISED SWORD. Fat #141008. Huge cream eyes. Blue/gold. Distinct lunge vs idle. Not a stamp.

Keep:
    make("hero_captain_attack", 64, 72, drawHeroCaptainAttack);
Do not change 64, 72.
Do NOT edit drawScout, drawBrute, drawFlyer, drawTitan, drawBossIdle, projectile_magic, drawHeroCaptainIdle, drawHeroCaptainAbility.

LIVE drawHeroCaptainAttack:
    const drawHeroCaptainAttack = (ctx) => {
      shadow(ctx, 34, 65, 28, 6.5, 0.48);
      const OUT = "#141008";

      const capeG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#8ec0f8"], [0.45, "#2a62a8"], [1, "#0c1830"]]);
      const armorG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#ffffff"], [0.4, "#bcd2e8"], [1, "#546e88"]]);
      const goldG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff6b8"], [0.5, "#dca828"], [1, "#6a4a08"]]);
      const skinG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff4dc"], [0.5, "#e2aa70"], [1, "#8e5628"]]);

      // Swept Cape billowing back
      poly(ctx, [[6, 23], [42, 25], [34, 60], [8, 64], [0, 44]], capeG(0, 23, 42, 64), OUT, 2.8);
      poly(ctx, [[0, 44], [8, 64], [34, 60], [31, 56], [9, 59], [3, 42]], goldG(0, 42, 34, 64), OUT, 1.4);

      // Lunging Legs (Deep dynamic lunge)
      poly(ctx, [[14, 40], [24, 40], [12, 60], [4, 58]], linGrad(ctx, 4, 40, 24, 60, [[0, "#7eaadc"], [1, "#182c44"]]), OUT, 2.6);
      rounded(ctx, 2, 55, 14, 8.5, 3, linGrad(ctx, 2, 55, 2, 64, [[0, "#324458"], [1, "#0e141c"]]), OUT, 2.2);

      poly(ctx, [[34, 40], [46, 40], [50, 60], [38, 60]], linGrad(ctx, 34, 40, 50, 60, [[0, "#7eaadc"], [1, "#182c44"]]), OUT, 2.6);
      rounded(ctx, 38, 55, 15, 8.5, 3, linGrad(ctx, 38, 55, 38, 64, [[0, "#324458"], [1, "#0e141c"]]), OUT, 2.2);

      // Torso turned in aggressive forward swing
      rounded(ctx, 18, 23, 32, 26, 7, armorG(18, 23, 50, 49), OUT, 3.0);
      // Gold trim & royal crest
      ctx.strokeStyle = goldG(18, 23, 50, 49);
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(21, 30); ctx.lineTo(34, 40); ctx.lineTo(47, 30);
      ctx.stroke();
      poly(ctx, [[34, 31], [38, 37], [34, 43], [30, 37]], goldG(30, 31, 38, 43), OUT, 1.8);
      ellipse(ctx, 34, 37, 2, 2, "#4a78c0");

      // Pauldrons
      ellipse(ctx, 18, 28, 8.5, 7.5, armorG(10, 21, 26, 36), OUT, 2.4);
      ellipse(ctx, 45, 29, 9, 8, armorG(36, 21, 54, 37), OUT, 2.4);

      // Head & Helm angled forward
      ellipse(ctx, 34, 15, 12.5, 11.5, skinG(22, 3, 46, 27), OUT, 2.6);
      rounded(ctx, 19, 3, 29, 11.5, 4, goldG(19, 3, 48, 15), OUT, 2.6);
      poly(ctx, [[34, 0], [26, 6], [42, 6]], goldG(26, 0, 42, 6), OUT, 2.0);
      poly(ctx, [[19, 5], [12, 1], [16, 9]], goldG(12, 1, 19, 9), OUT, 1.8);
      poly(ctx, [[48, 5], [55, 1], [51, 9]], goldG(48, 1, 55, 9), OUT, 1.8);
      ellipse(ctx, 34, 5.5, 3.2, 3.2, "#ff2233", OUT, 1.5);
      ellipse(ctx, 33.5, 4.8, 1, 1, "#ffffff");

      // Fierce Attack Eyes
      ellipse(ctx, 29, 15, 3.2, 3.6, "#fffbe0", OUT, 2.0);
      ellipse(ctx, 39, 15, 3.2, 3.6, "#fffbe0", OUT, 2.0);
      ellipse(ctx, 29.5, 15.3, 1.6, 2.0, "#0e1828");
      ellipse(ctx, 39.5, 15.3, 1.6, 2.0, "#0e1828");
      ellipse(ctx, 29.5, 15.3, 0.9, 1.2, "#3a70b0");
      ellipse(ctx, 39.5, 15.3, 0.9, 1.2, "#3a70b0");
      ellipse(ctx, 28.6, 14.2, 0.9, 0.9, "#ffffff");
      ellipse(ctx, 38.6, 14.2, 0.9, 0.9, "#ffffff");

      // Determined attack brow
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(26, 12.5); ctx.lineTo(31, 14.5);
      ctx.moveTo(42, 12.5); ctx.lineTo(37, 14.5);
      ctx.stroke();

      // Shield pulled back
      poly(ctx, [[1, 25], [18, 23], [20, 51], [10, 57], [0, 47]], goldG(0, 23, 20, 57), OUT, 2.6);
      poly(ctx, [[9, 31], [14, 37], [9, 45], [4, 37]], linGrad(ctx, 4, 31, 14, 45, [[0, "#4a82cc"], [1, "#14284c"]]), OUT, 1.6);
      ellipse(ctx, 9, 37, 2.2, 2.2, "#fff2a0", OUT, 1.0);

      // Sword Swing Arc (Translucent cyan/white glowing crescent trail)
      ctx.beginPath();
      ctx.arc(36, 36, 24, -Math.PI * 0.6, Math.PI * 0.15);
      ctx.strokeStyle = "rgba(180,225,255,0.7)";
      ctx.lineWidth = 5.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(36, 36, 24, -Math.PI * 0.45, Math.PI * 0.1);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // Slashing Blade (Driving forward across canvas)
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 5.4;
      ctx.beginPath();
      ctx.moveTo(44, 34);
      ctx.lineTo(60, 18);
      ctx.stroke();

      ctx.strokeStyle = linGrad(ctx, 44, 34, 60, 18, [[0, "#88b4e0"], [0.5, "#d8ecff"], [1, "#ffffff"]]);
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(44, 34);
      ctx.lineTo(60, 18);
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(43, 33);
      ctx.lineTo(59, 17);
      ctx.stroke();

      // Sword hilt & pommel
      rounded(ctx, 40, 34, 8, 4.5, 1.5, goldG(40, 34, 48, 38.5), OUT, 1.6);

      // Slash Impact Sparkle at tip (within bounds)
      poly(ctx, [[59, 14], [61, 18], [63, 18], [61, 20], [62, 23], [59, 21], [56, 23], [57, 20], [55, 18], [58, 18]], "#ffffff");
      ellipse(ctx, 59, 18, 1.5, 1.5, "#ffe875");
    };

HELPERS: poly/linGrad/radGrad/ellipse/rounded/shadow/speckles/face live arities.
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

HARD: { x: 100, y: 375 }, bannerY=98. No CONFIG. No make(fn).

Output ```diff:public/src/krc-art.js only.
