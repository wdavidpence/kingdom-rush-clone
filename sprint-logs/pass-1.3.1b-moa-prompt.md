KRC 1.3.1b MoA ONE task: thicken the live mage bolt so it reads at ~24px on screen.

Do NOT change canvas size. Keep make("projectile_magic", 36, 36, (ctx) => {.
"Reads at 24px" = fatter outline, higher contrast core, keep a bolt/rune silhouette. Not a new 24x24 texture.

LIVE public/src/krc-art.js (replace ONLY the body inside this make; keep 36, 36):
    make("projectile_magic", 36, 36, (ctx) => {
      const cx = 18;
      const cy = 18;

      // 1. Soft radiant plasma aura (multi-stop violet & cyan)
      const aura = radGrad(ctx, cx, cy, 2, 17, [
        [0, "rgba(255, 255, 255, 0.95)"],
        [0.22, "rgba(215, 160, 255, 0.8)"],
        [0.5, "rgba(130, 70, 255, 0.45)"],
        [0.8, "rgba(40, 190, 255, 0.2)"],
        [1, "rgba(20, 10, 80, 0)"],
      ]);
      ellipse(ctx, cx, cy, 17, 17, aura);

      // 2. Trailing comet plasma wisps (pointing left / backward)
      ctx.strokeStyle = "rgba(190, 140, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy - 7);
      ctx.quadraticCurveTo(cx - 10, cy - 10, cx - 15, cy - 6);
      ctx.moveTo(cx - 2, cy + 7);
      ctx.quadraticCurveTo(cx - 10, cy + 10, cx - 15, cy + 6);
      ctx.moveTo(cx - 4, cy);
      ctx.lineTo(cx - 16, cy);
      ctx.stroke();

      // 3. Primary Arcane Rune Diamond Core
      const diamondOuter = [
        [cx + 14, cy],
        [cx, cy - 10],
        [cx - 11, cy],
        [cx, cy + 10],
      ];
      poly(
        ctx,
        diamondOuter,
        linGrad(ctx, cx - 11, cy, cx + 14, cy, [
          [0, "#5b15d9"],
          [0.35, "#9333ea"],
          [0.7, "#38bdf8"],
          [1, "#ffffff"],
        ]),
        "#180638",
        1.5
      );

      // 4. Inner Crystalline Rune Core
      const diamondInner = [
        [cx + 8, cy],
        [cx, cy - 6],
        [cx - 6, cy],
        [cx, cy + 6],
      ];
      poly(
        ctx,
        diamondInner,
        linGrad(ctx, cx - 6, cy - 6, cx + 8, cy + 6, [
          [0, "#ffffff"],
          [0.4, "#e0f2fe"],
          [0.75, "#a855f7"],
          [1, "#6366f1"],
        ]),
        "#311068",
        1
      );

      // 5. Orbiting Arcane Runes / Energy Motes
      const motes = [
        { x: cx + 6, y: cy - 9, r: 2.2, c: "#38bdf8" },
        { x: cx + 6, y: cy + 9, r: 2.2, c: "#38bdf8" },
        { x: cx - 8, y: cy - 7, r: 1.8, c: "#c084fc" },
        { x: cx - 8, y: cy + 7, r: 1.8, c: "#c084fc" },
      ];
      for (const m of motes) {
        ellipse(ctx, m.x, m.y, m.r, m.r, m.c, "#1a0836", 0.8);
        ellipse(ctx, m.x, m.y, m.r * 0.45, m.r * 0.45, "#ffffff");
      }

      // 6. Arcane Cross-Spark / White-Hot Star Glint
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx + 1, cy - 7); ctx.lineTo(cx + 1, cy + 7);
      ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 8, cy);
      ctx.stroke();

      ellipse(ctx, cx + 1, cy, 2.5, 2.5, "#ffffff");
    });

HELPERS (use these arities only; do not invent others):
make(key, w, h, draw)  // draw(ctx) or draw(ctx,w,h)
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
radGrad(ctx, x, y, r0, r1, [[t,color],...])
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
rounded(ctx, x, y, w, h, r, fill, stroke, line)
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

OPTIONAL public/src/game.js LIVE line:
      projectile.sprite.setScale(tower.type === "artillery" ? 1.1 : 0.9);
Allowed replacement (mage only, keep archer at 0.9):
      projectile.sprite.setScale(tower.type === "artillery" ? 1.1 : tower.type === "mage" ? 1.2 : 0.9);
Do not invent CONFIG, settings, or projectileScale objects.

HARD: do not touch { x: 100, y: 375 }, bannerY=98, campaign, version.
Do not invent renderSetPiece, make(fn), make(name, fn), or placeholders.

Output only:
```diff:public/src/krc-art.js
```
and optional
```diff:public/src/game.js
```
Hunks must apply to the LIVE 36,36 make() and the LIVE setScale line.
