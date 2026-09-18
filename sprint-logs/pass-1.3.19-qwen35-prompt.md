KRC 1.3.19 qwen35 ONE task (not MoA): rewrite drawHeroCaptainAbility so the rally pose is OBVIOUSLY not idle.

Play scale keep 64x72. Wow: HELM + FACE + FLARED CAPE + SWORD OVERHEAD + GOLD AURA RING.
Fat #141008. Huge cream eyes. Blue/gold.
MUST differ from idle: idle has sword at rest-right and shield left. Ability = two-hand overhead rally, shield down/back, ground gold ring.

Keep:
    make("hero_captain_ability", 64, 72, drawHeroCaptainAbility);
Do not change 64, 72.
Do NOT edit drawScout, drawBrute, drawFlyer, drawTitan, drawBossIdle, projectile_magic, drawHeroCaptainIdle, drawHeroCaptainAttack.

LIVE drawHeroCaptainAbility:
    const drawHeroCaptainAbility = (ctx) => {
      shadow(ctx, 32, 66, 28, 7.5, 0.5);
      const OUT = "#141008";

      const capeG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#8ec0f8"], [0.45, "#2a62a8"], [1, "#0c1830"]]);
      const armorG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#ffffff"], [0.4, "#bcd2e8"], [1, "#546e88"]]);
      const goldG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff6b8"], [0.5, "#dca828"], [1, "#6a4a08"]]);
      const skinG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff4dc"], [0.5, "#e2aa70"], [1, "#8e5628"]]);

      // Radiating Golden Holy Nova Aura
      ellipse(ctx, 32, 24, 29, 23, radGrad(ctx, 32, 24, 6, 29, [[0, "rgba(255,248,180,0.8)"], [0.45, "rgba(255,210,70,0.4)"], [0.8, "rgba(255,170,30,0.15)"], [1, "rgba(255,150,0,0)"]]));

      // Golden Holy Light Beams
      poly(ctx, [[32, 24], [10, 8], [14, 4]], "rgba(255,240,160,0.28)");
      poly(ctx, [[32, 24], [54, 8], [50, 4]], "rgba(255,240,160,0.28)");
      poly(ctx, [[32, 24], [6, 26], [6, 20]], "rgba(255,240,160,0.22)");
      poly(ctx, [[32, 24], [58, 26], [58, 20]], "rgba(255,240,160,0.22)");

      // Cape spread wide and billowing heroically
      poly(ctx, [[2, 29], [20, 24], [22, 56], [6, 63]], capeG(2, 24, 22, 63), OUT, 2.6);
      poly(ctx, [[2, 29], [6, 63], [10, 60], [6, 32]], goldG(2, 29, 10, 63), OUT, 1.4);

      poly(ctx, [[62, 29], [44, 24], [42, 56], [58, 63]], capeG(42, 24, 62, 63), OUT, 2.6);
      poly(ctx, [[62, 29], [58, 63], [54, 60], [58, 32]], goldG(54, 29, 62, 63), OUT, 1.4);

      poly(ctx, [[14, 24], [50, 24], [56, 64], [32, 70], [8, 64]], capeG(8, 24, 56, 70), OUT, 3.0);
      poly(ctx, [[8, 64], [32, 70], [56, 64], [54, 60], [32, 66], [10, 60]], goldG(8, 60, 56, 70), OUT, 1.6);

      // Sturdy Braced Legs
      rounded(ctx, 16, 40, 12, 22, 4, linGrad(ctx, 16, 40, 28, 62, [[0, "#7eaadc"], [1, "#182c44"]]), OUT, 2.6);
      rounded(ctx, 36, 40, 12, 22, 4, linGrad(ctx, 36, 40, 48, 62, [[0, "#7eaadc"], [1, "#182c44"]]), OUT, 2.6);
      rounded(ctx, 14, 56, 15, 8.5, 3, linGrad(ctx, 14, 56, 14, 65, [[0, "#324458"], [1, "#0e141c"]]), OUT, 2.2);
      rounded(ctx, 35, 56, 15, 8.5, 3, linGrad(ctx, 35, 56, 35, 65, [[0, "#324458"], [1, "#0e141c"]]), OUT, 2.2);

      // Regal Cuirass
      rounded(ctx, 15, 23, 34, 27, 7, armorG(15, 23, 49, 50), OUT, 3.0);
      ctx.strokeStyle = goldG(15, 23, 49, 50);
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(18, 30); ctx.lineTo(32, 40); ctx.lineTo(46, 30);
      ctx.stroke();
      poly(ctx, [[32, 31], [36, 37], [32, 43], [28, 37]], goldG(28, 31, 36, 43), OUT, 1.8);
      ellipse(ctx, 32, 37, 2, 2, "#4a78c0");

      // Pauldrons
      ellipse(ctx, 15, 28, 9, 8, armorG(6, 20, 24, 36), OUT, 2.4);
      ellipse(ctx, 49, 28, 9, 8, armorG(40, 20, 58, 36), OUT, 2.4);
      ellipse(ctx, 15, 28, 3.5, 3.5, goldG(12, 25, 18, 31), OUT, 1.4);
      ellipse(ctx, 49, 28, 3.5, 3.5, goldG(46, 25, 52, 31), OUT, 1.4);

      // Head looking up in inspiration
      ellipse(ctx, 32, 16, 13, 12, skinG(20, 4, 44, 28), OUT, 2.6);
      rounded(ctx, 17, 3, 30, 12, 4, goldG(17, 3, 47, 15), OUT, 2.6);
      poly(ctx, [[32, 0], [24, 6], [40, 6]], goldG(24, 0, 40, 6), OUT, 2.0);
      poly(ctx, [[17, 5], [10, 0], [14, 9]], goldG(10, 0, 17, 9), OUT, 1.8);
      poly(ctx, [[47, 5], [54, 0], [50, 9]], goldG(47, 0, 54, 9), OUT, 1.8);
      ellipse(ctx, 32, 5.5, 3.5, 3.5, "#ff2233", OUT, 1.5);
      ellipse(ctx, 31.5, 4.8, 1, 1, "#ffffff");

      // Inspired Glowing Eyes
      ellipse(ctx, 27, 16, 3.2, 3.6, "#fffbe0", OUT, 2.0);
      ellipse(ctx, 37, 16, 3.2, 3.6, "#fffbe0", OUT, 2.0);
      ellipse(ctx, 27.5, 16.3, 1.6, 2.0, "#0e1828");
      ellipse(ctx, 37.5, 16.3, 1.6, 2.0, "#0e1828");
      ellipse(ctx, 27.5, 16.3, 1.0, 1.3, "#4ea8ff");
      ellipse(ctx, 37.5, 16.3, 1.0, 1.3, "#4ea8ff");
      ellipse(ctx, 26.6, 15.2, 0.9, 0.9, "#ffffff");
      ellipse(ctx, 36.6, 15.2, 0.9, 0.9, "#ffffff");

      // Heroic rally mouth
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(29, 21); ctx.lineTo(35, 21);
      ctx.stroke();

      // Shield held proudly on left arm
      poly(ctx, [[2, 21], [20, 19], [22, 49], [12, 56], [1, 46]], goldG(1, 19, 22, 56), OUT, 2.6);
      poly(ctx, [[11, 29], [16, 35], [11, 43], [6, 35]], linGrad(ctx, 6, 29, 16, 43, [[0, "#4a82cc"], [1, "#14284c"]]), OUT, 1.6);
      ellipse(ctx, 11, 35, 2.2, 2.2, "#fff2a0", OUT, 1.0);

      // Sword Raised High Overhead for Rally (Contained within canvas y: 4..24)
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 5.6;
      ctx.beginPath();
      ctx.moveTo(48, 22);
      ctx.lineTo(48, 4);
      ctx.stroke();

      ctx.strokeStyle = linGrad(ctx, 48, 22, 48, 4, [[0, "#8ebcf0"], [0.5, "#dcf0ff"], [1, "#ffffff"]]);
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(48, 22);
      ctx.lineTo(48, 4);
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(47.5, 22);
      ctx.lineTo(47.5, 4);
      ctx.stroke();

      // Sword Crossguard & Pommel
      rounded(ctx, 42, 21, 12, 4.5, 1.5, goldG(42, 21, 54, 25.5), OUT, 1.6);
      ellipse(ctx, 48, 26, 2.8, 2.8, goldG(45, 23, 51, 29), OUT, 1.2);

      // Gleaming Rally Starburst at Blade Tip (y: 1..10, x: 42..54)
      poly(ctx, [[48, 1], [50, 3], [54, 4], [50, 5], [48, 7], [46, 5], [42, 4], [46, 3]], "#ffffff", goldG(42, 1, 54, 7), 1.2);
      ellipse(ctx, 48, 4, 2.2, 2.2, "#ffffff");
      ellipse(ctx, 48, 4, 4.5, 4.5, "rgba(255,255,200,0.5)");
    };

HELPERS: poly/linGrad/radGrad/ellipse/rounded/shadow/speckles/face live arities.
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

HARD: { x: 100, y: 375 }, bannerY=98. No CONFIG. No make(fn).

Output ```diff:public/src/krc-art.js only.
