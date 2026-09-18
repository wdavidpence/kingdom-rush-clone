KRC 1.3.23 qwen35 ONE task (not MoA): rewrite drawBarracksL2 so the barracks reads as a STONE KEEP + barracks door at ~46px, not a brown box.

Keep signature: const drawBarracksL2 = (ctx) => {
Keep 128 wrappers. Fat #141008. Door + battlements must read at field size.

Do NOT edit drawScout, drawBrute, drawFlyer, drawTitan, drawBossIdle, projectile_magic,
drawHeroCaptainIdle/Attack/Ability, drawMageCrystal128, drawArcherL2, drawArcherL3.

LIVE drawBarracksL2:
    const drawBarracksL2 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Grassy Rampart Berm
      shadow(ctx, 64, 116, 50, 12, 0.44);
      shadow(ctx, 64, 117, 38, 7, 0.58);

      ellipse(ctx, 64, 110, 48, 14, linGrad(ctx, 24, 96, 104, 122, [[0, "#5a7036"], [0.4, "#3e4f24"], [1, "#1c2610"]]), "#141008", 3.2);
      ctx.strokeStyle = "rgba(160, 215, 80, 0.4)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(64, 108, 44, 10, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      ellipse(ctx, 26, 114, 5, 3, "#686a5a", "#141008", 1.2);
      ellipse(ctx, 38, 118, 5.5, 3.2, "#585a4a", "#141008", 1.2);
      ellipse(ctx, 90, 116, 5, 3.2, "#5c5e4e", "#141008", 1.2);
      ellipse(ctx, 100, 113, 4, 2.5, "#6c6e5e", "#141008", 1.2);

      // 2. Heavy Dressed Fortress Stone Plinth (Foundation Y=80 to 112)
      rounded(ctx, 28, 80, 72, 32, 4, linGrad(ctx, 28, 80, 100, 112, [[0, "#c6b480"], [0.35, "#988452"], [0.75, "#66542e"], [1, "#3c2e16"]]), "#141008", 2.8);

      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(30, 90); ctx.lineTo(98, 90);
      ctx.moveTo(30, 100); ctx.lineTo(98, 100);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 245, 205, 0.35)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(30, 91.5); ctx.lineTo(98, 91.5);
      ctx.moveTo(30, 101.5); ctx.lineTo(98, 101.5);
      ctx.stroke();

      speckles(ctx, 30, 82, 68, 28, 24, "rgba(0,0,0,0.18)", 1.2);
      speckles(ctx, 30, 82, 68, 28, 14, "rgba(255,245,210,0.2)", 1.0);

      // 3. Two-Story Keep Tower Body with Corner Sentry Turrets (Y=32 to 84)
      rounded(ctx, 26, 36, 76, 50, 4, linGrad(ctx, 26, 36, 102, 86, [[0, "#dac890"], [0.3, "#ac965e"], [0.7, "#766236"], [1, "#44361a"]]), "#141008", 2.8);

      // Corner stone quoins
      for (const [qx, qy, qw, qh] of [
        [26, 40, 8, 7], [26, 49, 11, 7], [26, 58, 8, 7], [26, 67, 11, 7], [26, 76, 8, 7],
        [94, 40, 8, 7], [91, 49, 11, 7], [94, 58, 8, 7], [91, 67, 11, 7], [94, 76, 8, 7],
      ]) {
        rounded(ctx, qx, qy, qw, qh, 1.5, linGrad(ctx, qx, qy, qx + qw, qy + qh, [[0, "#eedcaa"], [1, "#867240"]]), "#141008", 1.2);
      }

      // Flank Arrow Loops
      rounded(ctx, 34, 50, 4, 12, 1.5, "#141008", "#141008", 1);
      rounded(ctx, 31, 54, 10, 3, 1, "#141008", "#141008", 1);
      rounded(ctx, 90, 50, 4, 12, 1.5, "#141008", "#141008", 1);
      rounded(ctx, 87, 54, 10, 3, 1, "#141008", "#141008", 1);

      // 4. Machicolation Corbels Course (Y=28 to 38)
      for (let i = 0; i < 7; i += 1) {
        const cx = 26 + i * 12.5;
        poly(ctx, [[cx - 3.5, 38], [cx + 3.5, 38], [cx + 5, 30], [cx - 5, 30]], linGrad(ctx, cx - 5, 30, cx + 5, 38, [[0, "#eedcaa"], [1, "#7c6838"]]), "#141008", 1.4);
      }

      // Parapet Base Stringcourse Beam
      rounded(ctx, 18, 28, 92, 8, 2, linGrad(ctx, 18, 28, 110, 36, [[0, "#f0deaa"], [0.35, "#beaa70"], [1, "#66542a"]]), "#141008", 2.2);

      // 5. Crenellated Merlons (7 Battlement teeth, Y=14 to 30)
      for (let i = 0; i < 7; i += 1) {
        const mx = 20 + i * 13;
        rounded(ctx, mx, 16, 10, 14, 1.5, linGrad(ctx, mx, 16, mx + 10, 30, [[0, "#faeab6"], [0.4, "#c8b478"], [1, "#746234"]]), "#141008", 1.8);
        rounded(ctx, mx - 0.5, 14, 11, 3.5, 1.2, "#fff2c8", "#141008", 1.0);
        rounded(ctx, mx + 4, 19, 2.5, 6, 0.8, "#141008");
      }

      // Twin Corner Sentry Turrets (Bartizans, Y=10 to 32)
      // Left Turret
      rounded(ctx, 16, 12, 10, 20, 2, linGrad(ctx, 16, 12, 26, 32, [[0, "#fae6b4"], [0.5, "#b8a064"], [1, "#5c4a24"]]), "#141008", 1.8);
      rounded(ctx, 19, 16, 3, 7, 1, "#141008");
      // Right Turret
      rounded(ctx, 102, 12, 10, 20, 2, linGrad(ctx, 102, 12, 112, 32, [[0, "#fae6b4"], [0.5, "#b8a064"], [1, "#5c4a24"]]), "#141008", 1.8);
      rounded(ctx, 106, 16, 3, 7, 1, "#141008");

      // 6. Grand Arched Gateway & Portcullis (Y=54 to 90)
      poly(
        ctx,
        [[42, 88], [42, 66], [64, 52], [86, 66], [86, 88], [82, 88], [82, 68], [64, 56], [46, 68], [46, 88]],
        linGrad(ctx, 42, 52, 86, 88, [[0, "#fae6b4"], [0.5, "#b8a064"], [1, "#5c4a24"]]),
        "#141008",
        2.4
      );
      poly(ctx, [[58, 56], [70, 56], [72, 49], [56, 49]], "#fff4c8", "#141008", 1.4);
      rounded(ctx, 42, 87, 44, 5, 1.5, "#685834", "#141008", 1.4);

      // Oak double doors & heavy iron portcullis dropped halfway
      rounded(ctx, 46, 58, 36, 30, 4, "#141008");
      rounded(ctx, 47, 68, 16.5, 20, 2, linGrad(ctx, 47, 68, 63.5, 88, [[0, "#4a2a14"], [1, "#1c0e04"]]), "#141008", 1.4);
      rounded(ctx, 64.5, 68, 16.5, 20, 2, linGrad(ctx, 64.5, 68, 81, 88, [[0, "#422410"], [1, "#140802"]]), "#141008", 1.4);

      // Spiked Iron Portcullis Grille
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (const gx of [51, 57, 64, 71, 77]) {
        ctx.moveTo(gx, 54); ctx.lineTo(gx, 74);
        poly(ctx, [[gx, 74], [gx - 1.5, 77], [gx + 1.5, 77]], "#141008");
      }
      ctx.moveTo(48, 60); ctx.lineTo(80, 60);
      ctx.moveTo(48, 68); ctx.lineTo(80, 68);
      ctx.stroke();

      // 7. Dual Heraldic Heater Shields & Wall Torches
      // Left Shield (Crimson + Gold Cross)
      const sL = [[48, 42], [60, 42], [58, 50], [54, 55], [50, 50]];
      poly(ctx, sL, linGrad(ctx, 48, 42, 60, 55, [[0, "#ffffff"], [0.4, "#ea3826"], [1, "#640a06"]]), "#141008", 1.6);
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(54, 43); ctx.lineTo(54, 53);
      ctx.moveTo(50, 47); ctx.lineTo(58, 47);
      ctx.stroke();

      // Right Shield (Azure + Silver Star)
      const sR = [[68, 42], [80, 42], [78, 50], [74, 55], [70, 50]];
      poly(ctx, sR, linGrad(ctx, 68, 42, 80, 55, [[0, "#ffffff"], [0.4, "#3068b8"], [1, "#102454"]]), "#141008", 1.6);
      ellipse(ctx, 74, 48, 1.6, 1.6, "#ffffff");

      // Wall Torch Sconces
      for (const tx of [31, 95]) {
        rounded(ctx, tx, 58, 3.5, 12, 1, "#36302a", "#141008", 1.0);
        ellipse(ctx, tx + 1.8, 54, 5, 7, radGrad(ctx, tx + 1.8, 53, 1, 7, [[0, "#ffffff"], [0.4, "#ffa820"], [1, "rgba(200,40,0,0)"]]));
      }

      // Twin Crimson Pennants flying from corner sentry turrets
      // Left Pennant
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(20, 16); ctx.lineTo(20, 2);
      ctx.stroke();
      poly(ctx, [[20, 3], [36, 6], [30, 11], [36, 16], [20, 13]], linGrad(ctx, 20, 3, 36, 16, [[0, "#d83424"], [0.6, "#9e1810"], [1, "#540804"]]), "#141008", 1.2);

      // Right Pennant
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(108, 16); ctx.lineTo(108, 2);
      ctx.stroke();
      poly(ctx, [[108, 3], [124, 6], [118, 11], [124, 16], [108, 13]], linGrad(ctx, 108, 3, 124, 16, [[0, "#d83424"], [0.6, "#9e1810"], [1, "#540804"]]), "#141008", 1.2);
    };

HELPERS: poly/linGrad/radGrad/ellipse/rounded/shadow/speckles/face live arities.
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

HARD: { x: 100, y: 375 }, bannerY=98. No CONFIG. No make(fn).

Output ```diff:public/src/krc-art.js only.
