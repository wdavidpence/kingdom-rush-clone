KRC 1.3.21 qwen35 ONE task (not MoA): rewrite drawMageCrystal128 so the mage tower reads as a CRYSTAL SPIRE at ~64px, not a hut.

Keep signature: const drawMageCrystal128 = (ctx, isFire = false) => {
Keep 128 wrappers. isFire=true = hotter white core / more shards. isFire=false = calmer glow.
Wow: fat #141008, huge crystal silhouette, white-hot core. Not a purple box.

Do NOT edit drawScout, drawBrute, drawFlyer, drawTitan, drawBossIdle, projectile_magic,
drawHeroCaptainIdle/Attack/Ability.

LIVE drawMageCrystal128:
    const drawMageCrystal128 = (ctx, isFire = false) => {
      // Levitating secondary crystal shards
      const sideCrystals = [
        [36, 26, 5, 14, "#8ae8ff", "#5028c0"],
        [92, 26, 5, 14, "#b48aff", "#3a1890"],
      ];
      for (const [cx, cy, cw, ch, col0, col1] of sideCrystals) {
        poly(ctx, [[cx, cy - ch / 2], [cx + cw / 2, cy], [cx, cy + ch / 2], [cx - cw / 2, cy]], linGrad(ctx, cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2, [[0, col0], [1, col1]]), "#141008", 1.6);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy - ch / 2); ctx.lineTo(cx, cy + ch / 2);
        ctx.stroke();
      }

      if (!isFire) {
        // Ambient crystal glow aura
        ellipse(ctx, 64, 22, 26, 24, radGrad(ctx, 64, 22, 2, 26, [[0, "rgba(220, 200, 255, 0.45)"], [0.5, "rgba(140, 90, 240, 0.2)"], [1, "rgba(60, 20, 150, 0)"]]));

        // Main Arcane Crystal Multi-Faceted Volume with bold outline
        // 1. Facet: Back / Left side shadow facet
        poly(ctx, [[64, 6], [48, 22], [54, 38], [64, 40]], linGrad(ctx, 48, 6, 64, 40, [[0, "#9872e8"], [0.5, "#582cb4"], [1, "#280e6e"]]), "#141008", 2.4);

        // 2. Facet: Back / Right side facet
        poly(ctx, [[64, 6], [80, 22], [74, 38], [64, 40]], linGrad(ctx, 64, 6, 80, 40, [[0, "#c0a0ff"], [0.5, "#7a46e0"], [1, "#3c168c"]]), "#141008", 2.4);

        // 3. Facet: Center Front Left prism facet
        poly(ctx, [[64, 6], [48, 22], [64, 25]], linGrad(ctx, 48, 6, 64, 25, [[0, "#d8c4ff"], [0.45, "#8e5ef0"], [1, "#4e24b4"]]), "#141008", 1.8);

        // 4. Facet: Center Front Right illuminated facet (Sunlight & power gleam)
        poly(ctx, [[64, 6], [80, 22], [64, 25]], linGrad(ctx, 64, 6, 80, 25, [[0, "#ffffff"], [0.35, "#c8b0ff"], [0.75, "#9062f4"], [1, "#5a2ac8"]]), "#141008", 1.8);

        // 5. Facet: Lower Center Left facet
        poly(ctx, [[48, 22], [64, 25], [64, 40], [54, 38]], linGrad(ctx, 48, 22, 64, 40, [[0, "#703ec4"], [1, "#2c0e6c"]]), "#141008", 1.8);

        // 6. Facet: Lower Center Right facet
        poly(ctx, [[80, 22], [64, 25], [64, 40], [74, 38]], linGrad(ctx, 64, 22, 80, 40, [[0, "#9462f4"], [1, "#42168e"]]), "#141008", 1.8);

        // Internal Glowing Mana Core
        ellipse(ctx, 64, 23, 7, 7, radGrad(ctx, 62, 21, 1, 7, [[0, "#ffffff"], [0.5, "#d6beff"], [1, "rgba(140,80,240,0.3)"]]), "#ffffff", 1.2);
        ellipse(ctx, 64, 23, 3, 3, "#ffffff");

        // Specular Vertex & Ridge Highlights
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(64, 6); ctx.lineTo(64, 25); ctx.lineTo(64, 40);
        ctx.moveTo(64, 6); ctx.lineTo(80, 22);
        ctx.stroke();

        ctx.strokeStyle = "rgba(160, 235, 255, 0.85)";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(64, 25); ctx.lineTo(48, 22);
        ctx.moveTo(64, 25); ctx.lineTo(80, 22);
        ctx.stroke();

        ellipse(ctx, 64, 6.5, 1.8, 1.8, "#ffffff");

        // Concentric 3D Tilted Rune Rings
        // Upper Ring
        ctx.strokeStyle = "rgba(160, 225, 255, 0.85)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(64, 20, 22, 7, -0.08, 0, Math.PI * 2);
        ctx.stroke();

        // Lower Ring
        ctx.strokeStyle = "rgba(215, 170, 255, 0.75)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(64, 32, 26, 8, 0.05, 0, Math.PI * 2);
        ctx.stroke();

        // Floating Rune Nodes on rings
        for (const [rx, ry] of [[44, 20], [84, 19], [40, 32], [88, 33], [64, 39]]) {
          ellipse(ctx, rx, ry, 1.8, 1.8, "#ffffff", "#70d4ff", 0.8);
        }

        // Drifting Spark Motes
        for (const [sx, sy, r] of [[24, 18, 1.8], [104, 20, 1.8], [48, 8, 1.4], [80, 10, 1.5], [32, 38, 1.2], [96, 36, 1.4]]) {
          ellipse(ctx, sx, sy, r, r, "#ffffff", "#b894ff", 0.8);
        }
      } else {
        // —— FIRE STATE: Overcharged Crystalline Mana Nova & Rune Flare ——
        // Massive outer radiant aura
        ellipse(ctx, 64, 22, 40, 38, radGrad(ctx, 64, 22, 3, 40, [[0, "#ffffff"], [0.25, "rgba(225,200,255,0.95)"], [0.55, "rgba(150,90,255,0.55)"], [0.85, "rgba(80,210,255,0.25)"], [1, "rgba(40,10,140,0)"]]));

        // 8-Point Arcane Starburst Ray Flares with fat outlines
        const rays = [
          [[64, 22], [64, -6]],
          [[64, 22], [64, 50]],
          [[64, 22], [22, 22]],
          [[64, 22], [106, 22]],
          [[64, 22], [32, -2]],
          [[64, 22], [96, -2]],
          [[64, 22], [32, 46]],
          [[64, 22], [96, 46]],
        ];
        ctx.strokeStyle = "#141008";
        ctx.lineWidth = 4.0;
        for (const [r0, r1] of rays) {
          ctx.beginPath();
          ctx.moveTo(r0[0], r0[1]); ctx.lineTo(r1[0], r1[1]);
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
        ctx.lineWidth = 2.8;
        for (const [r0, r1] of rays) {
          ctx.beginPath();
          ctx.moveTo(r0[0], r0[1]); ctx.lineTo(r1[0], r1[1]);
          ctx.stroke();
        }
        ctx.strokeStyle = "#8ae8ff";
        ctx.lineWidth = 1.4;
        for (const [r0, r1] of rays) {
          ctx.beginPath();
          ctx.moveTo(r0[0], r0[1]); ctx.lineTo(r1[0], r1[1]);
          ctx.stroke();
        }

        // Blazing Crystal Body in supercharged state
        poly(ctx, [[64, 4], [46, 22], [54, 38], [64, 41], [74, 38], [82, 22]], linGrad(ctx, 46, 4, 82, 41, [[0, "#ffffff"], [0.3, "#e2d2ff"], [0.7, "#a878ff"], [1, "#5424c8"]]), "#141008", 2.8);

        // Blinding Incandescent Core
        ellipse(ctx, 64, 22, 16, 16, radGrad(ctx, 62, 18, 2, 16, [[0, "#ffffff"], [0.5, "#e6dcff"], [1, "#9c6eff"]]), "#141008", 2.4);
        ellipse(ctx, 64, 22, 8, 8, "#ffffff");

        // Lightning Fractures crackling down crystal
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(64, 6); ctx.lineTo(60, 16); ctx.lineTo(67, 24); ctx.lineTo(62, 33); ctx.lineTo(64, 40);
        ctx.moveTo(60, 16); ctx.lineTo(50, 22);
        ctx.moveTo(67, 24); ctx.lineTo(78, 22);
        ctx.stroke();

        // Hyper-Charged Blazing Rune Flare Rings
        ctx.strokeStyle = "rgba(140, 235, 255, 0.95)";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.ellipse(64, 20, 26, 8, -0.08, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(235, 185, 255, 0.95)";
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.ellipse(64, 32, 30, 9, 0.05, 0, Math.PI * 2);
        ctx.stroke();

        // Blazing Rune Glyphs around the flare
        for (const [gx, gy] of [[38, 20], [90, 20], [34, 32], [94, 32], [64, 12], [64, 40]]) {
          ellipse(ctx, gx, gy, 2.5, 2.5, "#ffffff", "#141008", 1.0);
          ellipse(ctx, gx, gy, 1.2, 1.2, "#6fe4ff");
        }

        // High-energy spark burst
        for (const [sx, sy, r] of [
          [16, 12, 2.5], [112, 14, 2.5], [26, 32, 2.2], [102, 34, 2.2],
          [44, -2, 2.0], [84, -2, 2.0], [38, 48, 2.2], [90, 48, 2.2],
          [64, -8, 2.5], [14, 24, 2.0], [114, 24, 2.0], [64, 52, 2.2]
        ]) {
          ellipse(ctx, sx, sy, r, r, "#ffffff", "#8ae8ff", 1);
        }
      }
    };

HELPERS: poly/linGrad/radGrad/ellipse/rounded/shadow/speckles/face live arities.
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

HARD: { x: 100, y: 375 }, bannerY=98. No CONFIG. No make(fn).

Output ```diff:public/src/krc-art.js only.
