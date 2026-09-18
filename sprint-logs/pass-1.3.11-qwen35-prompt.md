KRC 1.3.11 qwen35 ONE task (not MoA): rewrite drawBossIdle so the Warden reads as a boss at play scale.

Play scale ~96px (make 96x88, size 30). Wow: CROWN/HELM + BODY + WEAPON. Fat #141008. Violet/gold. Huge eyes. Not a purple blob.

Keep make("enemy_boss", 96, 88, (ctx) => drawBossIdle(ctx));
Do not change 96,88. Do NOT edit drawScout, drawBrute, drawFlyer, drawTitan.

LIVE:
    make("enemy_boss", 96, 88, (ctx) => drawBossIdle(ctx));

LIVE drawBossIdle:
    const drawBossIdle = (ctx) => {
      shadow(ctx, 48, 76, 38, 10, 0.48);
      const OUT = "#141008";

      const capeG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#c080f0"], [0.45, "#7a249c"], [1, "#200630"]]);
      const armorG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#eeb8ff"], [0.45, "#9830ba"], [1, "#3c0c50"]]);
      const goldG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff4a8"], [0.5, "#e0ac2c"], [1, "#70500a"]]);

      // Royal Flowing Amethyst Cape
      poly(
        ctx,
        [[16, 26], [80, 26], [92, 72], [48, 81], [4, 72]],
        capeG(16, 26, 80, 81),
        OUT,
        3.2
      );
      // Gold hem trim on cape
      poly(ctx, [[4, 72], [48, 81], [92, 72], [90, 68], [48, 76], [6, 68]], goldG(4, 68, 92, 81), OUT, 1.8);

      // Heavy Armored Torso Cuirass
      rounded(ctx, 26, 26, 44, 38, 9, armorG(26, 26, 70, 64), OUT, 3.2);

      // Ornate Gold Chest Chevron & Core Arcane Gem
      poly(ctx, [[48, 34], [56, 46], [48, 56], [40, 46]], goldG(40, 34, 56, 56), OUT, 2.0);
      ellipse(ctx, 48, 45, 4.0, 4.0, "#ff40b0", OUT, 1.8);
      ellipse(ctx, 47, 44, 1.4, 1.4, "#ffffff");

      // Curved Royal Pauldrons
      ellipse(ctx, 22, 33, 14, 12, armorG(8, 21, 36, 45), OUT, 2.8);
      ellipse(ctx, 74, 33, 14, 12, armorG(60, 21, 88, 45), OUT, 2.8);
      // Gold pauldron rims
      ctx.strokeStyle = goldG(8, 21, 36, 45);
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(22, 33, 9, Math.PI * 0.75, Math.PI * 1.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(74, 33, 9, Math.PI * 1.2, Math.PI * 2.25);
      ctx.stroke();

      // Royal Head
      ellipse(ctx, 48, 20, 17, 16, armorG(31, 4, 65, 36), OUT, 3.0);

      // Huge Cream Eyes (Menacing Warlord gaze)
      ellipse(ctx, 42, 20, 4.5, 5.2, "#fffbe0", OUT, 2.4);
      ellipse(ctx, 54, 20, 4.5, 5.2, "#fffbe0", OUT, 2.4);
      // Intense amethyst pupil core
      ellipse(ctx, 42.5, 20.5, 2.5, 3.0, "#4a0660");
      ellipse(ctx, 53.5, 20.5, 2.5, 3.0, "#4a0660");
      ellipse(ctx, 42.5, 20.5, 1.2, 1.6, "#e860ff");
      ellipse(ctx, 53.5, 20.5, 1.2, 1.6, "#e860ff");
      // White glint
      ellipse(ctx, 41.2, 18.8, 1.4, 1.4, "#ffffff");
      ellipse(ctx, 52.8, 18.8, 1.4, 1.4, "#ffffff");
      // Furious Brow
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(36, 15); ctx.lineTo(45, 18);
      ctx.moveTo(60, 15); ctx.lineTo(51, 18);
      ctx.stroke();

      // 5-Spire Grand Crown
      poly(
        ctx,
        [[26, 13], [30, 2], [37, 10], [48, -1], [59, 10], [66, 2], [70, 13]],
        goldG(26, -1, 70, 13),
        OUT,
        2.2
      );
      ellipse(ctx, 48, 6.5, 5.0, 5.0, "#ff20a0", OUT, 1.8);
      ellipse(ctx, 47, 5.5, 1.5, 1.5, "#ffffff");

      // Heavy Golden Arcane Staff
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 5.6;
      ctx.beginPath();
      ctx.moveTo(74, 72);
      ctx.lineTo(84, 14);
      ctx.stroke();

      ctx.strokeStyle = goldG(74, 72, 84, 14);
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.moveTo(74, 72);
      ctx.lineTo(84, 14);
      ctx.stroke();

      // Dragon Prongs grasping orb
      poly(ctx, [[78, 17], [84, 23], [90, 17]], goldG(78, 17, 90, 23), OUT, 2.0);

      // Radiant Arcane Orb
      ellipse(
        ctx,
        84,
        12,
        12,
        12,
        radGrad(ctx, 82, 10, 1, 12, [[0, "#ffffff"], [0.35, "#f090ff"], [0.75, "#b020e0"], [1, "rgba(90,10,140,0.15)"]]),
        OUT,
        2.6
      );
      ellipse(ctx, 81, 9, 3, 3, "#ffffff");

      // Arcane Aura Ring at feet
      ctx.strokeStyle = "rgba(220,150,255,.55)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(48, 50, 36, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
    };

HELPERS: poly/linGrad/radGrad/ellipse/rounded/shadow/speckles/face live arities.

OPTIONAL game-data.js LIVE:
    boss: { name: "Warden", hp: 1180, speed: 22, armor: 7, bounty: 130, leak: 8, color: 0xcd65e6, size: 30, phases: true },
Allowed only: size: 30 → size: 32.

HARD: { x: 100, y: 375 }, bannerY=98. No CONFIG. No make(fn).

Output ```diff:public/src/krc-art.js and optional ```diff:public/src/game-data.js
