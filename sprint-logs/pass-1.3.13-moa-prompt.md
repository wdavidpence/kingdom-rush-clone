KRC 1.3.13 MoA ONE task: thicken live mage bolt so a rune diamond + trail reads at ~24px play scale.

Do NOT change canvas size. Keep make("projectile_magic", 36, 36, (ctx) => {.
"Reads at 24px" = fatter #141008 outline, hotter white core, keep bolt/rune silhouette. Not a new 24x24 texture. Not a purple circle.

LIVE public/src/krc-art.js (replace ONLY the body inside this make; keep 36, 36):
    make("projectile_magic", 36, 36, (ctx) => {
      const cx = 18;
      const cy = 18;
      const OUT = "#141008";

      // 1. Radiant Arcane Glow Aura
      ellipse(
        ctx,
        cx,
        cy,
        16,
        16,
        radGrad(ctx, cx, cy, 2, 16, [
          [0, "rgba(255, 255, 255, 0.95)"],
          [0.3, "rgba(190, 120, 255, 0.75)"],
          [0.65, "rgba(56, 189, 248, 0.4)"],
          [1, "rgba(20, 10, 80, 0)"],
        ])
      );

      // 2. Trailing Arcane Comet Wisps (Thick & bold)
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 4.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy - 6); ctx.lineTo(cx - 14, cy - 4);
      ctx.moveTo(cx - 2, cy + 6); ctx.lineTo(cx - 14, cy + 4);
      ctx.moveTo(cx - 4, cy); ctx.lineTo(cx - 16, cy);
      ctx.stroke();

      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy - 6); ctx.lineTo(cx - 14, cy - 4);
      ctx.moveTo(cx - 2, cy + 6); ctx.lineTo(cx - 14, cy + 4);
      ctx.moveTo(cx - 4, cy); ctx.lineTo(cx - 16, cy);
      ctx.stroke();

      // 3. Primary Arcane Diamond Rune Core (Fat #141008 outline)
      const diamondOuter = [
        [cx + 14, cy],
        [cx + 1, cy - 11],
        [cx - 12, cy],
        [cx + 1, cy + 11],
      ];
      poly(
        ctx,
        diamondOuter,
        linGrad(ctx, cx - 12, cy, cx + 14, cy, [
          [0, "#6b21a8"],
          [0.35, "#a855f7"],
          [0.7, "#38bdf8"],
          [1, "#ffffff"],
        ]),
        OUT,
        2.8
      );

      // 4. Inner Crystalline Rune Facet
      const diamondInner = [
        [cx + 8, cy],
        [cx + 1, cy - 6],
        [cx - 6, cy],
        [cx + 1, cy + 6],
      ];
      poly(
        ctx,
        diamondInner,
        linGrad(ctx, cx - 6, cy - 6, cx + 8, cy + 6, [
          [0, "#ffffff"],
          [0.4, "#e0f2fe"],
          [0.8, "#c084fc"],
          [1, "#7c3aed"],
        ]),
        OUT,
        1.8
      );

      // 5. Orbiting Rune Sparks (Bold & clear)
      ellipse(ctx, cx + 6, cy - 9, 3.2, 3.2, "#38bdf8", OUT, 1.8);
      ellipse(ctx, cx + 6, cy + 9, 3.2, 3.2, "#38bdf8", OUT, 1.8);
      ellipse(ctx, cx - 8, cy - 7, 2.8, 2.8, "#e879f9", OUT, 1.6);
      ellipse(ctx, cx - 8, cy + 7, 2.8, 2.8, "#e879f9", OUT, 1.6);

      // 6. White-Hot Energy Core
      ellipse(ctx, cx + 1, cy, 3.5, 3.5, "#ffffff");
      ellipse(ctx, cx + 6, cy - 9, 1.2, 1.2, "#ffffff");
      ellipse(ctx, cx + 6, cy + 9, 1.2, 1.2, "#ffffff");
    });

HELPERS (live arities — use only these):
poly(ctx, points, fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
radGrad(ctx, x, y, r0, r1, [[t,color],...])
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
rounded(ctx, x, y, w, h, r, fill, stroke, line)
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

OPTIONAL game.js LIVE (only this line, only this change):
        projectile.sprite.setScale(tower.type === "artillery" ? 1.1 : 0.9);
Allowed only: mage path 0.9 → 1.2, e.g.
        projectile.sprite.setScale(tower.type === "artillery" ? 1.1 : tower.type === "mage" ? 1.2 : 0.9);
Do not invent CONFIG, settings, or projectileScale objects.

HARD: Forest Gate { x: 100, y: 375 }, bannerY=98. No campaign. No version. No drawScout/drawBrute/drawFlyer/drawTitan/drawBossIdle.

Output only ```diff:public/src/krc-art.js and optional ```diff:public/src/game.js
No placeholders. No fake APIs. No make(fn).
