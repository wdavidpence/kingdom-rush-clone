/**
 * KRC original painterly art atlas.
 * Canvas-baked textures only — no third-party or commercial game art.
 * Genre-inspired readability (bold outline, warm fantasy palette), not a copy.
 */
(() => {
  const bake = (scene) => {
    const make = (key, w, h, draw) => {
      if (scene.textures.exists(key)) scene.textures.remove(key);
      const texture = scene.textures.createCanvas(key, w, h);
      const ctx = texture.getContext();
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      draw(ctx, w, h);
      texture.refresh();
    };

    const ellipse = (ctx, x, y, rx, ry, fill, stroke = null, line = 1) => {
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = line;
        ctx.stroke();
      }
    };

    const rounded = (ctx, x, y, w, h, r, fill, stroke = null, line = 1) => {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = line;
        ctx.stroke();
      }
    };

    const poly = (ctx, points, fill, stroke = null, line = 1) => {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = line;
        ctx.stroke();
      }
    };

    const linGrad = (ctx, x0, y0, x1, y1, stops) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      for (const [p, c] of stops) g.addColorStop(p, c);
      return g;
    };

    const radGrad = (ctx, x, y, r0, r1, stops) => {
      const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
      for (const [p, c] of stops) g.addColorStop(p, c);
      return g;
    };

    const shadow = (ctx, x, y, rx, ry, a = 0.38) => {
      ellipse(ctx, x, y, rx, ry, `rgba(8,6,4,${a})`);
    };

    const speckles = (ctx, x, y, w, h, n, color, size = 1.2) => {
      ctx.fillStyle = color;
      for (let i = 0; i < n; i += 1) {
        const px = x + ((i * 47) % w);
        const py = y + ((i * 31 + 13) % h);
        ctx.fillRect(px, py, size, size * 0.7);
      }
    };

    const stoneBrick = (ctx, x, y, w, h, c0, c1, c2) => {
      rounded(ctx, x, y, w, h, 5, linGrad(ctx, x, y, x, y + h, [[0, c0], [0.55, c1], [1, c2]]), "#1a140f", 2);
      ctx.strokeStyle = "rgba(255,240,200,.18)";
      ctx.lineWidth = 1;
      for (let row = 0; row < 3; row += 1) {
        const yy = y + 6 + row * ((h - 10) / 3);
        ctx.beginPath();
        ctx.moveTo(x + 4, yy);
        ctx.lineTo(x + w - 4, yy);
        ctx.stroke();
        const off = row % 2 ? 8 : 0;
        for (let col = 0; col < 3; col += 1) {
          const xx = x + 10 + off + col * ((w - 12) / 3);
          ctx.beginPath();
          ctx.moveTo(xx, yy);
          ctx.lineTo(xx, yy + (h - 12) / 3);
          ctx.stroke();
        }
      }
      speckles(ctx, x + 3, y + 3, w - 6, h - 6, 18, "rgba(0,0,0,.12)", 1.1);
      speckles(ctx, x + 3, y + 3, w - 6, h - 6, 10, "rgba(255,245,210,.14)", 1);
    };

    const woodPlank = (ctx, x, y, w, h, c0, c1) => {
      rounded(ctx, x, y, w, h, 3, linGrad(ctx, x, y, x + w, y + h, [[0, c0], [1, c1]]), "#2a1a10", 1.5);
      ctx.strokeStyle = "rgba(70,40,18,.45)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i += 1) {
        const xx = x + (w * i) / 4;
        ctx.beginPath();
        ctx.moveTo(xx, y + 2);
        ctx.lineTo(xx - 1, y + h - 2);
        ctx.stroke();
      }
    };

    const roofTiles = (ctx, points, c0, c1, outline) => {
      poly(ctx, points, linGrad(ctx, points[0][0], points[0][1], points[2][0], points[2][1], [[0, c0], [1, c1]]), outline, 2.4);
      ctx.strokeStyle = "rgba(40,20,10,.35)";
      ctx.lineWidth = 1.2;
      const midY = (points[0][1] + points[1][1]) / 2 + 6;
      for (let i = 0; i < 4; i += 1) {
        const t = 0.2 + i * 0.18;
        const y = points[1][1] + (points[0][1] - points[1][1]) * t + 8;
        ctx.beginPath();
        ctx.moveTo(points[0][0] + 6 + i * 2, y);
        ctx.lineTo(points[2][0] - 6 - i * 2, y);
        ctx.stroke();
      }
      void midY;
    };

    // —— Build pad ——
    make("pad_empty", 72, 48, (ctx) => {
      const cx = 36;
      const cy = 29;
      const OUT = "#141008";

      // 1. Soft Ground Shadow
      shadow(ctx, cx, cy + 9, 32, 8, 0.48);

      // 2. Heavy Carved Stone Foundation Plinth
      ellipse(
        ctx,
        cx,
        cy + 2,
        31,
        15,
        linGrad(ctx, 8, 16, 64, 44, [
          [0, "#9e8b72"],
          [0.45, "#685640"],
          [1, "#261a10"],
        ]),
        OUT,
        2.8
      );

      // Stone slab radial segmentation marks
      ctx.strokeStyle = "rgba(20, 12, 6, 0.65)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(14, 30); ctx.lineTo(8, 33);
      ctx.moveTo(58, 30); ctx.lineTo(64, 33);
      ctx.moveTo(24, 41); ctx.lineTo(22, 45);
      ctx.moveTo(48, 41); ctx.lineTo(50, 45);
      ctx.stroke();

      // 3. Inner Stepped Flagstone Terrace
      ellipse(
        ctx,
        cx,
        cy,
        24,
        11.5,
        linGrad(ctx, 14, 18, 58, 40, [
          [0, "#d8bf90"],
          [0.45, "#967e58"],
          [1, "#443420"],
        ]),
        OUT,
        2.2
      );

      // 4. Vibrant Golden CTA Ring (Outer glow + bold gold ring + inner shine)
      ctx.strokeStyle = "rgba(255, 215, 0, 0.35)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 19, 8.8, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = OUT;
      ctx.lineWidth = 4.6;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 19, 8.8, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = linGrad(ctx, 17, 20, 55, 38, [
        [0, "#fff8d0"],
        [0.4, "#ffd030"],
        [1, "#b57814"],
      ]);
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 19, 8.8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Inner thin highlight ridge
      ctx.strokeStyle = "rgba(255, 255, 240, 0.85)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 0.5, 14, 6.0, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Cardinal Gold Studs
      const studs = [[17, cy], [55, cy], [cx, 20.5], [cx, 37.5]];
      for (const [sx, sy] of studs) {
        ellipse(ctx, sx, sy, 3.2, 2.2, linGrad(ctx, sx - 2, sy - 2, sx + 2, sy + 2, [[0, "#ffffff"], [0.5, "#ffd54f"], [1, "#c08010"]]), OUT, 1.2);
      }

      // 6. Central Glowing Gold CTA Hammer / Diamond Rune
      poly(
        ctx,
        [[cx, cy - 8.5], [cx + 6, cy], [cx, cy + 8.5], [cx - 6, cy]],
        linGrad(ctx, cx - 6, cy - 8, cx + 6, cy + 8, [
          [0, "#ffffff"],
          [0.35, "#fff090"],
          [0.8, "#e5a720"],
          [1, "#804e0a"],
        ]),
        OUT,
        2.0
      );

      // Diamond core spark
      ellipse(ctx, cx, cy, 2.2, 2.2, "#ffffff");
    });

    // —— Towers (96×96 for detail) ——
    const towerBase = (ctx, cfg) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      shadow(ctx, 48, 88, 36, 10, 0.5);
      ellipse(ctx, 48, 82, 36, 14, linGrad(ctx, 20, 72, 76, 92, [[0, "#6a8248"], [1, "#1a2810"]]), "#12180c", 2.4);
      stoneBrick(ctx, 20, 50, 56, 34, cfg.stoneHi, cfg.stone, cfg.stoneLo);
      woodPlank(ctx, 16, 46, 64, 12, cfg.woodHi, cfg.woodLo);
      for (let i = 0; i < 6; i += 1) {
        const x = 20 + i * 10;
        rounded(ctx, x, 38, 9, 12, 2, linGrad(ctx, x, 38, x, 50, [[0, cfg.stoneHi], [1, cfg.stone]]), "#12100c", 1.8);
      }
    };

    // —— Rangers Tower (128×128 detailed rebuild) ——
    const drawArcherIvy128 = (ctx) => {
      // Left stone and timber ivy
      ctx.strokeStyle = "#1a3010";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(26, 112);
      ctx.bezierCurveTo(24, 98, 32, 88, 30, 76);
      ctx.bezierCurveTo(28, 68, 36, 62, 34, 54);
      ctx.stroke();

      const leftLeaves = [
        [26, 110, 3.5, 3.2],
        [23, 102, 4.0, 3.5],
        [28, 95, 4.2, 3.8],
        [25, 87, 3.8, 3.4],
        [32, 82, 4.5, 4.0],
        [28, 74, 4.0, 3.6],
        [34, 68, 4.2, 3.8],
        [30, 60, 3.5, 3.2],
        [36, 54, 3.2, 3.0],
      ];
      for (const [lx, ly, rx, ry] of leftLeaves) {
        ellipse(ctx, lx, ly, rx, ry, linGrad(ctx, lx - rx, ly - ry, lx + rx, ly + ry, [[0, "#7ec83a"], [0.5, "#428220"], [1, "#1e4812"]]), "#10260a", 1);
        ctx.strokeStyle = "rgba(180, 255, 110, 0.65)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(lx, ly - ry + 1);
        ctx.lineTo(lx, ly + ry - 1);
        ctx.stroke();
      }

      // Right corner ivy shoot
      ctx.strokeStyle = "#1a3010";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(98, 110);
      ctx.bezierCurveTo(102, 98, 94, 88, 96, 78);
      ctx.stroke();

      const rightLeaves = [
        [98, 107, 3.2, 2.8],
        [101, 98, 3.8, 3.4],
        [95, 90, 4.0, 3.5],
        [97, 81, 3.5, 3.0],
      ];
      for (const [lx, ly, rx, ry] of rightLeaves) {
        ellipse(ctx, lx, ly, rx, ry, linGrad(ctx, lx - rx, ly - ry, lx + rx, ly + ry, [[0, "#7ec83a"], [0.5, "#428220"], [1, "#1e4812"]]), "#10260a", 1);
        ctx.strokeStyle = "rgba(180, 255, 110, 0.65)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(lx, ly - ry + 1);
        ctx.lineTo(lx, ly + ry - 1);
        ctx.stroke();
      }
    };

    const drawArcherTowerBody128 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Base Earth Mound
      shadow(ctx, 64, 118, 50, 12, 0.5);
      shadow(ctx, 64, 119, 38, 7, 0.6);
      ellipse(ctx, 64, 110, 48, 15, linGrad(ctx, 24, 96, 104, 122, [[0, "#546a32"], [0.4, "#3c4d22"], [1, "#1c2610"]]), "#141008", 3.2);
      rounded(ctx, 30, 78, 68, 34, 5, linGrad(ctx, 32, 80, 96, 110, [[0, "#98a284"], [0.35, "#707a60"], [0.75, "#4c543e"], [1, "#2a3020"]]), "#141008", 3.0);
      ctx.strokeStyle = "rgba(145, 205, 75, 0.45)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(64, 108, 42, 10, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      // Foundation stones embedded in earth
      ellipse(ctx, 28, 114, 4.5, 2.5, "#686e60", "#2c3028", 1);
      ellipse(ctx, 40, 118, 5, 3, "#545a4c", "#2c3028", 1);
      ellipse(ctx, 88, 116, 4.5, 3, "#606658", "#2c3028", 1);
      ellipse(ctx, 98, 113, 3.5, 2.2, "#747a6c", "#2c3028", 1);

      // 2. Stone Masonry Plinth (Foundation Y=80 to 110)
      rounded(ctx, 32, 80, 64, 30, 4, linGrad(ctx, 32, 80, 96, 110, [[0, "#98a284"], [0.35, "#707a60"], [0.75, "#4c543e"], [1, "#2a3020"]]), "#141008", 2.8);

      // Stone block mortar lines (3 courses)
      ctx.strokeStyle = "#161c10";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(34, 90);
      ctx.lineTo(94, 90);
      ctx.moveTo(34, 100);
      ctx.lineTo(94, 100);
      ctx.stroke();

      // Stone block top bevel highlights
      ctx.strokeStyle = "rgba(255, 255, 220, 0.35)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(34, 91.5);
      ctx.lineTo(94, 91.5);
      ctx.moveTo(34, 101.5);
      ctx.lineTo(94, 101.5);
      ctx.stroke();

      // Vertical mortar joints
      ctx.strokeStyle = "#161c10";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(52, 81); ctx.lineTo(52, 90);
      ctx.moveTo(76, 81); ctx.lineTo(76, 90);
      ctx.moveTo(44, 90); ctx.lineTo(44, 100);
      ctx.moveTo(64, 90); ctx.lineTo(64, 100);
      ctx.moveTo(84, 90); ctx.lineTo(84, 100);
      ctx.moveTo(54, 100); ctx.lineTo(54, 109);
      ctx.moveTo(74, 100); ctx.lineTo(74, 109);
      ctx.stroke();

      // Masonry speckling & texture
      speckles(ctx, 34, 82, 60, 26, 24, "rgba(0,0,0,0.16)", 1.2);
      speckles(ctx, 34, 82, 60, 26, 16, "rgba(255,250,210,0.2)", 1.0);

      // Iron corner anchor plates
      rounded(ctx, 32, 92, 5, 12, 1.5, "#302a24", "#120e0a", 1);
      rounded(ctx, 91, 92, 5, 12, 1.5, "#302a24", "#120e0a", 1);
      ellipse(ctx, 34.5, 95, 1, 1, "#ffd060");
      ellipse(ctx, 34.5, 101, 1, 1, "#ffd060");
      ellipse(ctx, 93.5, 95, 1, 1, "#ffd060");
      ellipse(ctx, 93.5, 101, 1, 1, "#ffd060");

      // 3. Cantilevered Timber Corbel Struts
      poly(ctx, [[40, 92], [46, 94], [34, 80], [28, 80]], linGrad(ctx, 28, 80, 46, 94, [[0, "#a06830"], [1, "#44240c"]]), "#201004", 1.5);
      poly(ctx, [[88, 92], [82, 94], [94, 80], [100, 80]], linGrad(ctx, 82, 80, 100, 94, [[0, "#8a5424"], [1, "#361a06"]]), "#201004", 1.5);
      poly(ctx, [[58, 90], [70, 90], [72, 80], [56, 80]], linGrad(ctx, 56, 80, 72, 90, [[0, "#9c622c"], [1, "#3c1e0a"]]), "#201004", 1.5);

      // 4. Main Timber Platform Rim Beam (Y=72 to 82)
      rounded(ctx, 22, 72, 84, 10, 3, linGrad(ctx, 22, 72, 106, 82, [[0, "#c68c48"], [0.25, "#9c642c"], [0.75, "#683c14"], [1, "#3c1e08"]]), "#141008", 2.8);

      // Horizontal wood grain fibers & sunlight highlight
      ctx.strokeStyle = "rgba(50, 22, 6, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, 75); ctx.lineTo(104, 75);
      ctx.moveTo(26, 78); ctx.lineTo(102, 78);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 235, 175, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(24, 73.5); ctx.lineTo(104, 73.5);
      ctx.stroke();

      // End-grain caps & iron studs
      ellipse(ctx, 25, 77, 2, 3, "#542e10", "#221004", 1);
      ellipse(ctx, 103, 77, 2, 3, "#42220a", "#221004", 1);
      for (const sx of [30, 46, 64, 82, 98]) {
        ellipse(ctx, sx, 77, 1.4, 1.4, "#2c221c", "#120c08", 1);
        ellipse(ctx, sx - 0.3, 76.7, 0.5, 0.5, "#ffebaa");
      }

      // 5. Watchtower Timber Cabin Walls (Y=42 to 74)
      rounded(ctx, 34, 42, 60, 32, 3, linGrad(ctx, 34, 42, 94, 74, [[0, "#a8723a"], [0.3, "#825022"], [0.7, "#583010"], [1, "#341806"]]), "#141008", 2.6);

      // Vertical timber planks with individual tones and grain
      const planks = [
        [34, 12, "#9e6832", "#6e4018"],
        [46, 12, "#b07a3e", "#7e4c20"],
        [58, 12, "#a46e34", "#74441c"],
        [70, 12, "#98622c", "#683a16"],
        [82, 12, "#885422", "#582c0e"],
      ];
      for (const [px, pw, c0, c1] of planks) {
        rounded(ctx, px + 0.5, 43, pw - 1, 30, 1.5, linGrad(ctx, px, 43, px + pw, 73, [[0, c0], [1, c1]]));
        ctx.strokeStyle = "#1a0c04";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(px, 43); ctx.lineTo(px, 73);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 235, 180, 0.22)";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(px + 1.5, 44); ctx.lineTo(px + 1.5, 72);
        ctx.stroke();

        ctx.strokeStyle = "rgba(42, 18, 4, 0.28)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(px + pw * 0.4, 45);
        ctx.quadraticCurveTo(px + pw * 0.6, 58, px + pw * 0.4, 71);
        ctx.stroke();

        ellipse(ctx, px + pw * 0.5, 45, 0.9, 0.9, "#281e18");
        ellipse(ctx, px + pw * 0.5, 71, 0.9, 0.9, "#281e18");
      }

      // Corner heavy timber posts
      rounded(ctx, 32, 40, 6, 34, 2, linGrad(ctx, 32, 40, 38, 74, [[0, "#8e5826"], [1, "#462208"]]), "#1a0c04", 1.5);
      rounded(ctx, 90, 40, 6, 34, 2, linGrad(ctx, 90, 40, 96, 74, [[0, "#724018"], [1, "#341604"]]), "#1a0c04", 1.5);

      // Side diagonal cross-braces
      poly(ctx, [[34, 44], [44, 72], [41, 72], [34, 52]], "#6c3e18", "#1c0a02", 1);
      poly(ctx, [[94, 44], [84, 72], [87, 72], [94, 52]], "#5a3010", "#1c0a02", 1);

      // 6. Watch Opening / Embrasure (Y=44 to 68)
      rounded(ctx, 46, 44, 36, 24, 3, linGrad(ctx, 46, 44, 82, 68, [[0, "#140c06"], [0.5, "#22140a"], [1, "#0c0602"]]), "#160a02", 1.8);
      ellipse(ctx, 64, 54, 15, 8, "rgba(240, 180, 90, 0.12)");

      // 7. Timber Windowsill / Parapet Breastwork (Y=64 to 72)
      rounded(ctx, 44, 64, 40, 8, 2, linGrad(ctx, 44, 64, 84, 72, [[0, "#ba8444"], [0.4, "#8a5424"], [1, "#4c280c"]]), "#200e04", 1.6);
      ctx.strokeStyle = "rgba(255, 235, 175, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(45, 65); ctx.lineTo(83, 65);
      ctx.stroke();

      rounded(ctx, 62, 64, 4, 6, 1, "#1c0e04", "#2a1408", 0.8);
    };

    const drawThatchRoof128 = (ctx) => {
      shadow(ctx, 64, 45, 38, 6, 0.55);

      // Tier 1: Lower Flared Thatched Eave (Y=20 to 56)
      const eavePoly = [
        [14, 52],
        [64, 20],
        [114, 52],
        [108, 56],
        [64, 28],
        [20, 56],
      ];
      poly(ctx, eavePoly, linGrad(ctx, 64, 20, 64, 56, [[0, "#f4dc7c"], [0.35, "#d4aa44"], [0.75, "#8e641c"], [1, "#4a320a"]]), "#141008", 3.0);

      rounded(ctx, 18, 53, 5, 4, 1, "#583212", "#141008", 1.2);
      rounded(ctx, 105, 53, 5, 4, 1, "#46240a", "#141008", 1.2);

      ctx.strokeStyle = "rgba(60, 36, 8, 0.55)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let i = 0; i < 9; i += 1) {
        const sx = 22 + i * 9.5;
        const sy = 54 - Math.abs(sx - 64) * 0.45;
        ctx.arc(sx, sy, 5, 0.1, Math.PI * 0.95);
      }
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i < 7; i += 1) {
        const sx = 32 + i * 9.5;
        const sy = 46 - Math.abs(sx - 64) * 0.48;
        ctx.arc(sx, sy, 4.5, 0.1, Math.PI * 0.95);
      }
      ctx.stroke();

      ctx.strokeStyle = "rgba(65, 38, 8, 0.35)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 14; i += 1) {
        const rx0 = 24 + i * 5.8;
        const ry0 = 50 - Math.abs(rx0 - 64) * 0.55;
        ctx.beginPath();
        ctx.moveTo(rx0, ry0);
        ctx.lineTo(rx0 + (rx0 < 64 ? -1.5 : 1.5), ry0 + 5);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(255, 246, 180, 0.75)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(22, 51); ctx.lineTo(64, 22); ctx.lineTo(106, 51);
      ctx.stroke();

      // Tier 2: Upper Thatched Tier / Stepped Apex Cap (Y=10 to 36)
      const upperPoly = [
        [30, 32],
        [64, 10],
        [98, 32],
        [92, 36],
        [64, 17],
        [36, 36],
      ];
      poly(ctx, upperPoly, linGrad(ctx, 64, 10, 64, 36, [[0, "#fff49e"], [0.35, "#e0ba50"], [0.75, "#9c7020"], [1, "#52380c"]]), "#141008", 2.8);

      ctx.strokeStyle = "rgba(60, 36, 8, 0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const sx = 38 + i * 9.5;
        const sy = 34 - Math.abs(sx - 64) * 0.5;
        ctx.arc(sx, sy, 4.5, 0.1, Math.PI * 0.95);
      }
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 248, 190, 0.85)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(34, 31); ctx.lineTo(64, 11); ctx.lineTo(94, 31);
      ctx.stroke();

      // Tier 3: Crossed Ridge Timbers & Peak Finial (Y=2 to 20)
      poly(ctx, [[58, 16], [70, 4], [74, 8], [62, 20]], linGrad(ctx, 58, 4, 74, 20, [[0, "#aa723a"], [1, "#542e0e"]]), "#261204", 1.4);
      poly(ctx, [[70, 16], [58, 4], [54, 8], [66, 20]], linGrad(ctx, 54, 4, 70, 20, [[0, "#905a28"], [1, "#442006"]]), "#261204", 1.4);

      rounded(ctx, 61, 9, 6, 7, 2, "#e2d6a4", "#48381c", 1.2);
      ctx.strokeStyle = "#7c683c";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(61, 11); ctx.lineTo(67, 11);
      ctx.moveTo(61, 14); ctx.lineTo(67, 14);
      ctx.stroke();

      poly(ctx, [[64, 2], [67, 7], [64, 9], [61, 7]], linGrad(ctx, 61, 2, 67, 9, [[0, "#ffd860"], [0.4, "#b87e40"], [1, "#643810"]]), "#261204", 1.2);
    };

    const drawArcherBanner128 = (ctx, isFire = false) => {
      ellipse(ctx, 41, 73.5, 1.8, 1.8, "#2c2420", "#100c0a", 1);
      ellipse(ctx, 51, 73.5, 1.8, 1.8, "#2c2420", "#100c0a", 1);

      if (!isFire) {
        const bannerPoints = [
          [38, 75],
          [54, 75],
          [54, 102],
          [46, 95],
          [38, 102],
        ];
        poly(ctx, bannerPoints, linGrad(ctx, 38, 75, 54, 102, [[0, "#2c5e32"], [0.45, "#1e4624"], [1, "#102c16"]]), "#0a1c0e", 1.2);

        ctx.strokeStyle = "#ffd854";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(39.5, 76);
        ctx.lineTo(39.5, 100);
        ctx.lineTo(46, 94);
        ctx.lineTo(52.5, 100);
        ctx.lineTo(52.5, 76);
        ctx.stroke();

        ctx.strokeStyle = "#ffe26a";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(46, 85, 4.5, -1.2, 1.2);
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(43, 85); ctx.lineTo(49, 85);
        ctx.stroke();
        poly(ctx, [[49, 85], [47, 83.5], [47, 86.5]], "#ffffff");

        ellipse(ctx, 38, 102.5, 1.4, 1.4, "#ffd854", "#705410", 0.8);
        ellipse(ctx, 54, 102.5, 1.4, 1.4, "#ffd854", "#705410", 0.8);
      } else {
        const bannerPoints = [
          [38, 75],
          [54, 75],
          [60, 103],
          [51, 96],
          [41, 105],
        ];
        poly(ctx, bannerPoints, linGrad(ctx, 38, 75, 60, 104, [[0, "#326838"], [0.4, "#224e28"], [1, "#102c16"]]), "#0a1c0e", 1.2);

        ctx.strokeStyle = "rgba(120, 220, 130, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(44, 76);
        ctx.quadraticCurveTo(49, 90, 48, 98);
        ctx.stroke();

        ctx.strokeStyle = "#ffd854";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(39.5, 76);
        ctx.lineTo(42.5, 103);
        ctx.lineTo(51, 95);
        ctx.lineTo(58.5, 101);
        ctx.lineTo(52.5, 76);
        ctx.stroke();

        ctx.strokeStyle = "#ffe26a";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(48, 86, 4.5, -1.0, 1.4);
        ctx.stroke();

        ellipse(ctx, 41, 105.5, 1.4, 1.4, "#ffd854", "#705410", 0.8);
        ellipse(ctx, 60, 103.5, 1.4, 1.4, "#ffd854", "#705410", 0.8);
      }
    };

    const drawArcherIdle = (ctx) => {
      drawArcherTowerBody128(ctx);

      // Quiver slung over left shoulder
      poly(ctx, [[51, 44], [56, 41], [58, 54], [53, 55]], "#6e3e1c", "#241206", 1.2);
      for (let i = 0; i < 3; i += 1) {
        const ax = 52 + i * 2.2;
        const ay = 40 - i * 1.5;
        ctx.strokeStyle = "#d49a52";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ax, ay + 4); ctx.lineTo(ax, ay);
        ctx.stroke();
        poly(ctx, [[ax, ay], [ax - 1.5, ay + 2.5], [ax + 1.5, ay + 2.5]], i === 1 ? "#ea3424" : "#f6f2e4", "#201008", 0.8);
      }

      // Torso & Hunter Cloak
      poly(ctx, [[54, 52], [74, 52], [76, 65], [52, 65]], linGrad(ctx, 54, 52, 74, 65, [[0, "#366834"], [0.4, "#244a22"], [1, "#142a12"]]), "#0e1e0c", 1.2);
      ctx.strokeStyle = "#542e12";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(57, 53); ctx.lineTo(69, 64);
      ctx.stroke();
      ellipse(ctx, 63, 58.5, 1.2, 1.2, "#ffd248", "#5a3a0e", 0.8);

      // Archer Head & Ranger Cowl
      rounded(ctx, 58, 43, 12, 13, 5, linGrad(ctx, 58, 43, 70, 56, [[0, "#3a7036"], [0.5, "#285226"], [1, "#163014"]]), "#0e1e0c", 1.2);
      ellipse(ctx, 64, 49, 4, 4.5, "#f6d5ae", "#3a2214", 1);
      ctx.fillStyle = "rgba(18, 36, 16, 0.7)";
      ctx.fillRect(60, 46, 8, 2.5);
      ctx.fillStyle = "#22140a";
      ctx.fillRect(62, 49, 1.6, 1.2);
      ctx.fillRect(65, 49, 1.6, 1.2);

      // Crimson & Gold Ranger Cap Feather
      poly(ctx, [[60, 44], [49, 39], [55, 46]], linGrad(ctx, 60, 44, 49, 39, [[0, "#ea3824"], [1, "#b81c0e"]]), "#500a04", 1);
      ctx.strokeStyle = "#ffd248";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(59, 44); ctx.lineTo(50, 40);
      ctx.stroke();

      // Curved Yew Longbow (Resting against parapet)
      ctx.strokeStyle = "#2a1406";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(74, 38);
      ctx.quadraticCurveTo(78, 52, 74, 66);
      ctx.stroke();

      ctx.strokeStyle = linGrad(ctx, 74, 38, 78, 66, [[0, "#d89646"], [0.5, "#b07230"], [1, "#7c4818"]]);
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(74, 38);
      ctx.quadraticCurveTo(78, 52, 74, 66);
      ctx.stroke();

      ellipse(ctx, 74, 38, 1.2, 1.2, "#ffe268");
      ellipse(ctx, 74, 66, 1.2, 1.2, "#ffe268");

      rounded(ctx, 75.5, 50, 2.5, 5, 1, "#30180a", "#120804", 0.8);

      ctx.strokeStyle = "rgba(255, 255, 235, 0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(74, 39); ctx.lineTo(74, 65);
      ctx.stroke();

      // Archer Hands
      ellipse(ctx, 76, 52, 1.8, 1.8, "#543014", "#201006", 0.8);
      ellipse(ctx, 75.5, 52, 1.0, 1.0, "#f6d5ae");
      rounded(ctx, 56, 63.5, 4, 3, 1, "#f6d5ae", "#3a2214", 0.8);

      // Structure overlays
      drawThatchRoof128(ctx);
      drawArcherBanner128(ctx, false);
      drawArcherIvy128(ctx);
    };

    const drawArcherFire = (ctx) => {
      drawArcherTowerBody128(ctx);

      // Quiver slung over back
      poly(ctx, [[46, 47], [51, 44], [54, 56], [49, 57]], "#6e3e1c", "#141008", 1.4);
      for (let i = 0; i < 2; i += 1) {
        const ax = 48 + i * 2.4;
        const ay = 43 - i * 1.5;
        ctx.strokeStyle = "#d49a52";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ax, ay + 4); ctx.lineTo(ax, ay);
        ctx.stroke();
        poly(ctx, [[ax, ay], [ax - 1.5, ay + 2.5], [ax + 1.5, ay + 2.5]], "#f6f2e4", "#141008", 0.8);
      }

      // Trailing Cloak & Torso Angled Forward
      poly(ctx, [[48, 54], [58, 49], [75, 48], [76, 65], [50, 65]], linGrad(ctx, 48, 49, 76, 65, [[0, "#3a7036"], [0.4, "#244a22"], [1, "#122610"]]), "#141008", 2.0);

      // Archer Head & Hood Leaning Forward
      ellipse(ctx, 68, 45, 5.5, 6, linGrad(ctx, 63, 40, 73, 51, [[0, "#3a7036"], [0.5, "#285226"], [1, "#142c12"]]), "#141008", 1.6);
      ellipse(ctx, 71, 46, 4, 4.5, "#f6d5ae", "#141008", 1.2);
      ctx.fillStyle = "rgba(18, 36, 16, 0.75)";
      ctx.fillRect(68, 43, 6, 2.5);
      ctx.fillStyle = "#141008";
      ctx.fillRect(72, 46, 1.8, 1.2);

      // Crimson Feather Whipping Back in Wind
      poly(ctx, [[65, 43], [51, 40], [57, 45]], linGrad(ctx, 65, 43, 51, 40, [[0, "#ea3824"], [1, "#b81c0e"]]), "#141008", 1.2);
      ctx.strokeStyle = "#ffd248";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(64, 43); ctx.lineTo(52, 41);
      ctx.stroke();

      // Right Drawing Arm (Back to cheek)
      ctx.strokeStyle = "#326230";
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(63, 51); ctx.lineTo(55, 52); ctx.lineTo(65, 47);
      ctx.stroke();
      ellipse(ctx, 65, 47, 2, 2, "#f6d5ae", "#141008", 1.0);

      // Left Bow Arm (Thrust forward holding bow)
      ctx.strokeStyle = "#326230";
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(72, 49); ctx.lineTo(80, 48); ctx.lineTo(88, 47);
      ctx.stroke();
      rounded(ctx, 77, 46.5, 6, 3.5, 1, "#583014", "#141008", 1.0);
      ellipse(ctx, 88, 47, 2, 2, "#f6d5ae", "#141008", 1.0);

      // Fully Drawn / Snapping Recurve Longbow with fat outline
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(88, 47);
      ctx.bezierCurveTo(94, 37, 94, 29, 90, 25);
      ctx.moveTo(88, 47);
      ctx.bezierCurveTo(94, 57, 94, 65, 90, 69);
      ctx.stroke();

      ctx.strokeStyle = linGrad(ctx, 88, 25, 94, 69, [[0, "#ffb854"], [0.5, "#d88832"], [1, "#8a4c18"]]);
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(88, 47);
      ctx.bezierCurveTo(94, 37, 94, 29, 90, 25);
      ctx.moveTo(88, 47);
      ctx.bezierCurveTo(94, 57, 94, 65, 90, 69);
      ctx.stroke();

      ellipse(ctx, 90, 25, 1.8, 1.8, "#ffe474", "#141008", 1.0);
      ellipse(ctx, 90, 69, 1.8, 1.8, "#ffe474", "#141008", 1.0);

      // Taut Snapping Bowstring (V-Shape from tips to release point)
      ctx.strokeStyle = "rgba(255, 255, 245, 0.95)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(90, 25);
      ctx.lineTo(66, 47);
      ctx.lineTo(90, 69);
      ctx.stroke();

      // Loosed Bodkin Arrow Projecting Forward-Right
      ctx.strokeStyle = "#fff8d0";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(70, 47.5);
      ctx.lineTo(120, 42);
      ctx.stroke();

      poly(ctx, [[70, 47.5], [63, 44.5], [66, 47.5], [63, 50.5]], "#ea3424", "#141008", 1.0);
      poly(ctx, [[120, 42], [126, 41.5], [120, 41], [115, 41.5]], "#ffffff", "#141008", 1.0);
      ellipse(ctx, 124, 41.5, 1.8, 1.8, "#ffffff");

      // Kinetic Bow Flash / Muzzle Release Flash Starburst & Spark VFX
      // Radiant Gold-White Flash Star at Bow Center (88, 47)
      ellipse(ctx, 88, 47, 9, 9, radGrad(ctx, 88, 47, 1, 9, [[0, "#ffffff"], [0.4, "#fff080"], [0.8, "#ffa020"], [1, "rgba(255,140,0,0)"]]));
      
      // 4-point Golden Flash Star with fat outline
      poly(ctx, [
        [88, 35],
        [90.5, 44.5],
        [100, 47],
        [90.5, 49.5],
        [88, 59],
        [85.5, 49.5],
        [76, 47],
        [85.5, 44.5],
      ], linGrad(ctx, 76, 35, 100, 59, [[0, "#ffffff"], [0.5, "#ffe860"], [1, "#ff9010"]]), "#141008", 1.2);
      
      // Pure white center star glint
      ellipse(ctx, 88, 47, 2.5, 2.5, "#ffffff");

      // Kinetic arrow release spark motes & speed lines
      ellipse(ctx, 96, 42, 1.4, 1.4, "#ffffff", "#141008", 0.8);
      ellipse(ctx, 98, 52, 1.3, 1.3, "#ffffff", "#141008", 0.8);
      ellipse(ctx, 80, 42, 1.2, 1.2, "#ffffff", "#141008", 0.8);
      ellipse(ctx, 106, 43, 1.8, 1.0, "rgba(255, 248, 200, 0.9)", "#141008", 0.6);
      ellipse(ctx, 103, 40, 1.2, 1.2, "#ffffff", "#ffd850", 0.8);
      ellipse(ctx, 110, 42, 1.2, 1.0, "#ffffff", "#ffd850", 0.8);
      ellipse(ctx, 115, 41, 1.0, 1.0, "#ffffff", "#ffd850", 0.8);
      ellipse(ctx, 122, 44, 1.3, 1.1, "#ffffff", "#ffd850", 0.8);

      // Structure overlays
      drawThatchRoof128(ctx);
      drawArcherBanner128(ctx, true);
      drawArcherIvy128(ctx);
    };

    const drawArcherL2 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Base Earth Mound
      shadow(ctx, 64, 118, 50, 12, 0.52);
      shadow(ctx, 64, 119, 38, 7, 0.62);
      ellipse(ctx, 64, 110, 48, 15, linGrad(ctx, 24, 96, 104, 122, [[0, "#546a32"], [0.4, "#3c4d22"], [1, "#1c2610"]]), "#141c0a", 3);
      ctx.strokeStyle = "rgba(145, 205, 75, 0.45)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(64, 108, 42, 10, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      ellipse(ctx, 28, 114, 4.5, 2.5, "#686e60", "#2c3028", 1);
      ellipse(ctx, 40, 118, 5, 3, "#545a4c", "#2c3028", 1);
      ellipse(ctx, 88, 116, 4.5, 3, "#606658", "#2c3028", 1);
      ellipse(ctx, 98, 113, 3.5, 2.2, "#747a6c", "#2c3028", 1);

      // 2. Reinforced Stone Plinth (Y=78 to 110)
      rounded(ctx, 30, 78, 68, 32, 4, linGrad(ctx, 30, 78, 98, 110, [[0, "#98a284"], [0.35, "#707a60"], [0.75, "#4c543e"], [1, "#2a3020"]]), "#1a2012", 2.2);

      ctx.strokeStyle = "#161c10";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(32, 88); ctx.lineTo(96, 88);
      ctx.moveTo(32, 98); ctx.lineTo(96, 98);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 220, 0.35)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(32, 89.5); ctx.lineTo(96, 89.5);
      ctx.moveTo(32, 99.5); ctx.lineTo(96, 99.5);
      ctx.stroke();

      speckles(ctx, 32, 80, 64, 28, 24, "rgba(0,0,0,0.16)", 1.2);
      speckles(ctx, 32, 80, 64, 28, 16, "rgba(255,250,210,0.2)", 1.0);

      // Iron corner anchor plates with brass rivets
      rounded(ctx, 29, 88, 5, 14, 1.5, "#302a24", "#120e0a", 1);
      rounded(ctx, 94, 88, 5, 14, 1.5, "#302a24", "#120e0a", 1);
      ellipse(ctx, 31.5, 92, 1, 1, "#ffd060");
      ellipse(ctx, 31.5, 98, 1, 1, "#ffd060");
      ellipse(ctx, 96.5, 92, 1, 1, "#ffd060");
      ellipse(ctx, 96.5, 98, 1, 1, "#ffd060");

      // Cantilevered Timber Corbel Struts
      poly(ctx, [[38, 90], [44, 92], [32, 78], [26, 78]], linGrad(ctx, 26, 78, 44, 92, [[0, "#a06830"], [1, "#44240c"]]), "#201004", 1.5);
      poly(ctx, [[90, 90], [84, 92], [96, 78], [102, 78]], linGrad(ctx, 84, 78, 102, 90, [[0, "#8a5424"], [1, "#361a06"]]), "#201004", 1.5);
      poly(ctx, [[58, 88], [70, 88], [72, 78], [56, 78]], linGrad(ctx, 56, 78, 72, 88, [[0, "#9c622c"], [1, "#3c1e0a"]]), "#201004", 1.5);

      // 3. Lower Timber Watch-Room Gallery (Y=50 to 78)
      rounded(ctx, 20, 70, 88, 10, 3, linGrad(ctx, 20, 70, 108, 80, [[0, "#c68c48"], [0.25, "#9c642c"], [0.75, "#683c14"], [1, "#3c1e08"]]), "#221004", 2);
      ctx.strokeStyle = "rgba(255, 235, 175, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(22, 71.5); ctx.lineTo(106, 71.5);
      ctx.stroke();

      rounded(ctx, 32, 46, 64, 26, 2, linGrad(ctx, 32, 46, 96, 72, [[0, "#9e6832"], [0.5, "#7a461c"], [1, "#442208"]]), "#1e0e04", 2);

      // Vertical planks & cross-braces
      for (let px = 36; px <= 92; px += 14) {
        ctx.strokeStyle = "#1a0c04";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px, 47); ctx.lineTo(px, 71);
        ctx.stroke();
      }
      poly(ctx, [[34, 48], [44, 70], [41, 70], [34, 55]], "#5c3214", "#1a0802", 0.9);
      poly(ctx, [[94, 48], [84, 70], [87, 70], [94, 55]], "#5c3214", "#1a0802", 0.9);

      // Quiver rack on lower right wall
      poly(ctx, [[88, 54], [93, 52], [95, 64], [90, 65]], "#6e3e1c", "#241206", 1.0);
      for (let qi = 0; qi < 3; qi += 1) {
        const qx = 89 + qi * 2;
        ctx.strokeStyle = "#d49a52";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(qx, 54); ctx.lineTo(qx, 50 - qi);
        ctx.stroke();
        poly(ctx, [[qx, 50 - qi], [qx - 1.2, 52 - qi], [qx + 1.2, 52 - qi]], "#ea3424", "#201008", 0.6);
      }

      // Lower embrasure window with Sentry Ranger
      rounded(ctx, 46, 50, 36, 18, 3, "#140c06", "#160a02", 1.5);
      ellipse(ctx, 56, 58, 4, 4, "#f6d5ae", "#3a2214", 0.8);
      rounded(ctx, 53, 54, 8, 8, 3, "#366834", "#0e1e0c", 0.8);
      poly(ctx, [[54, 54], [47, 51], [51, 56]], "#ea3824", "#500a04", 0.8);

      // 4. Mid-Story Flared Thatched Eave Skirt (Y=38 to 52)
      const midEave = [
        [16, 50],
        [64, 36],
        [112, 50],
        [106, 54],
        [64, 41],
        [22, 54],
      ];
      poly(ctx, midEave, linGrad(ctx, 64, 36, 64, 54, [[0, "#f6de82"], [0.35, "#d8ae48"], [0.75, "#926820"], [1, "#4e340c"]]), "#241604", 2.0);
      ctx.strokeStyle = "rgba(60, 36, 8, 0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < 9; i += 1) {
        const sx = 24 + i * 9.5;
        const sy = 52 - Math.abs(sx - 64) * 0.35;
        ctx.arc(sx, sy, 4.5, 0.1, Math.PI * 0.95);
      }
      ctx.stroke();

      // 5. Upper Watch Platform / Crow's Nest (Y=20 to 38)
      rounded(ctx, 36, 22, 56, 18, 2, linGrad(ctx, 36, 22, 92, 40, [[0, "#1c1008"], [0.5, "#2a160a"], [1, "#120804"]]), "#160a02", 1.6);

      // Timber corner posts
      rounded(ctx, 34, 18, 5, 22, 1.5, linGrad(ctx, 34, 18, 39, 40, [[0, "#9c6834"], [1, "#44240a"]]), "#1a0c02", 1.2);
      rounded(ctx, 89, 18, 5, 22, 1.5, linGrad(ctx, 89, 18, 94, 40, [[0, "#8a5426"], [1, "#3c1e08"]]), "#1a0c02", 1.2);

      // Upper Timber Balustrade Rail
      rounded(ctx, 32, 32, 64, 6, 1.5, linGrad(ctx, 32, 32, 96, 38, [[0, "#ba8444"], [0.5, "#8a5424"], [1, "#4c280c"]]), "#200e04", 1.4);
      ctx.strokeStyle = "rgba(255, 235, 175, 0.4)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(33, 33); ctx.lineTo(95, 33);
      ctx.stroke();

      // Main Ranger Marksman in Upper Balcony
      // Cloak & Torso
      poly(ctx, [[56, 26], [72, 26], [74, 34], [54, 34]], linGrad(ctx, 56, 26, 72, 34, [[0, "#366834"], [1, "#142a12"]]), "#0e1e0c", 1.0);
      // Head & Cowl
      rounded(ctx, 60, 20, 10, 10, 4, linGrad(ctx, 60, 20, 70, 30, [[0, "#3a7036"], [1, "#163014"]]), "#0e1e0c", 1.0);
      ellipse(ctx, 65, 24, 3.5, 3.5, "#f6d5ae", "#3a2214", 0.8);
      poly(ctx, [[61, 21], [53, 17], [57, 23]], "#ea3824", "#500a04", 0.8);

      // Curved Yew Longbow in Hand
      ctx.strokeStyle = "#2a1406";
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(74, 15); ctx.quadraticCurveTo(78, 25, 74, 35);
      ctx.stroke();
      ctx.strokeStyle = linGrad(ctx, 74, 15, 78, 35, [[0, "#d89646"], [0.5, "#b07230"], [1, "#7c4818"]]);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(74, 15); ctx.quadraticCurveTo(78, 25, 74, 35);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 235, 0.85)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(74, 16); ctx.lineTo(74, 34);
      ctx.stroke();

      // 6. Upper Thatched Gable Roof & Apex Spire (Y=2 to 24)
      const topRoofPoly = [
        [24, 22],
        [64, 4],
        [104, 22],
        [98, 26],
        [64, 10],
        [30, 26],
      ];
      poly(ctx, topRoofPoly, linGrad(ctx, 64, 4, 64, 26, [[0, "#fff49e"], [0.35, "#e0ba50"], [0.75, "#9c7020"], [1, "#52380c"]]), "#241604", 2.0);

      ctx.strokeStyle = "rgba(60, 36, 8, 0.55)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let i = 0; i < 7; i += 1) {
        const sx = 34 + i * 9.5;
        const sy = 24 - Math.abs(sx - 64) * 0.45;
        ctx.arc(sx, sy, 4.2, 0.1, Math.PI * 0.95);
      }
      ctx.stroke();

      // Ridge crossed timbers
      poly(ctx, [[59, 11], [69, 1], [73, 5], [63, 15]], linGrad(ctx, 59, 1, 73, 15, [[0, "#aa723a"], [1, "#542e0e"]]), "#261204", 1.2);
      poly(ctx, [[69, 11], [59, 1], [55, 5], [65, 15]], linGrad(ctx, 55, 1, 69, 15, [[0, "#905a28"], [1, "#442006"]]), "#261204", 1.2);

      // Bronze Arrow Weathervane Finial
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(64, 0); ctx.lineTo(64, 7);
      ctx.moveTo(59, 2); ctx.lineTo(69, 2);
      ctx.stroke();
      poly(ctx, [[69, 2], [66, 0.5], [66, 3.5]], "#ffd854");
      ellipse(ctx, 64, 2, 1.2, 1.2, "#ffffff");

      // 7. Twin Forest-Green Pennants (Left & Right)
      // Left Banner
      poly(ctx, [[34, 74], [48, 74], [44, 98], [38, 93], [32, 98]], linGrad(ctx, 32, 74, 48, 98, [[0, "#326838"], [0.45, "#224e28"], [1, "#102c16"]]), "#0a1c0e", 1.2);
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(33.5, 75); ctx.lineTo(33.5, 96); ctx.lineTo(38, 92); ctx.lineTo(42.5, 96); ctx.lineTo(46.5, 75);
      ctx.stroke();
      // Right Banner
      poly(ctx, [[80, 74], [94, 74], [96, 98], [90, 93], [84, 98]], linGrad(ctx, 80, 74, 96, 98, [[0, "#326838"], [0.45, "#224e28"], [1, "#102c16"]]), "#0a1c0e", 1.2);
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(81.5, 75); ctx.lineTo(85.5, 96); ctx.lineTo(90, 92); ctx.lineTo(94.5, 96); ctx.lineTo(94.5, 75);
      ctx.stroke();

      drawArcherIvy128(ctx);
    };

    const drawArcherL3 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Broad Fortified Earth Mound
      shadow(ctx, 64, 116, 52, 13, 0.48);
      shadow(ctx, 64, 117, 40, 7, 0.62);

      ellipse(ctx, 64, 110, 50, 15, linGrad(ctx, 20, 96, 108, 122, [[0, "#5a7238"], [0.4, "#3e5226"], [1, "#1c2810"]]), "#121a08", 3);
      ctx.strokeStyle = "rgba(160, 220, 85, 0.5)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(64, 108, 46, 11, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      // 2. Monumental Ashlar Granite Plinth (Foundation Y=74 to 112)
      rounded(ctx, 26, 74, 76, 36, 4, linGrad(ctx, 26, 74, 102, 110, [[0, "#a4b090"], [0.35, "#788468"], [0.75, "#505a44"], [1, "#2c3424"]]), "#161c10", 2.4);

      // Stone block mortar courses (4 courses)
      ctx.strokeStyle = "#161c10";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(28, 83); ctx.lineTo(100, 83);
      ctx.moveTo(28, 92); ctx.lineTo(100, 92);
      ctx.moveTo(28, 101); ctx.lineTo(100, 101);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 225, 0.35)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(28, 84.5); ctx.lineTo(100, 84.5);
      ctx.moveTo(28, 93.5); ctx.lineTo(100, 93.5);
      ctx.moveTo(28, 102.5); ctx.lineTo(100, 102.5);
      ctx.stroke();

      speckles(ctx, 28, 76, 72, 32, 28, "rgba(0,0,0,0.18)", 1.2);
      speckles(ctx, 28, 76, 72, 32, 18, "rgba(255,250,210,0.22)", 1.0);

      // Corner heavy ashlar quoins
      for (const [qx, qy] of [[26, 76], [26, 92], [96, 76], [96, 92]]) {
        rounded(ctx, qx, qy, 6, 14, 1.5, "#2a3224", "#12160e", 1);
        ellipse(ctx, qx + 3, qy + 4, 1.2, 1.2, "#ffd452");
        ellipse(ctx, qx + 3, qy + 10, 1.2, 1.2, "#ffd452");
      }

      // Glowing Wildwood Lantern on Left Plinth Bracket
      rounded(ctx, 22, 82, 3, 14, 1, "#4a3212", "#1a1004", 0.8);
      ellipse(ctx, 20, 92, 7, 8, radGrad(ctx, 20, 92, 1, 7, [[0, "rgba(255,245,180,0.85)"], [0.5, "rgba(255,180,40,0.45)"], [1, "rgba(255,140,0,0)"]]));
      rounded(ctx, 17, 88, 6, 8, 1.5, linGrad(ctx, 17, 88, 23, 96, [[0, "#ffd860"], [1, "#8a5010"]]), "#301804", 1.0);

      // 3. Citadel Mid-Tier Deck & Twin Flanking Bartizan Turrets (Y=44 to 76)
      rounded(ctx, 14, 68, 100, 11, 3, linGrad(ctx, 14, 68, 114, 79, [[0, "#cca054"], [0.25, "#a26e32"], [0.75, "#6e4216"], [1, "#40220a"]]), "#221004", 2.2);
      ctx.strokeStyle = "rgba(255, 235, 175, 0.5)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(16, 69.5); ctx.lineTo(112, 69.5);
      ctx.stroke();

      // Left Flank Watch Turret (X=16 to 34, Y=40 to 68)
      rounded(ctx, 16, 46, 18, 22, 2, linGrad(ctx, 16, 46, 34, 68, [[0, "#8a5828"], [1, "#3c1e08"]]), "#1a0c02", 1.5);
      rounded(ctx, 20, 52, 4, 8, 1, "#120802");
      // Left Turret Conical Roof
      poly(ctx, [[12, 46], [25, 30], [38, 46]], linGrad(ctx, 25, 30, 25, 46, [[0, "#6ca87a"], [0.5, "#427850"], [1, "#1e4428"]]), "#102616", 1.8);
      ellipse(ctx, 25, 30, 2, 2, "#ffd452", "#503808", 0.8);

      // Right Flank Watch Turret (X=94 to 112, Y=40 to 68)
      rounded(ctx, 94, 46, 18, 22, 2, linGrad(ctx, 94, 46, 112, 68, [[0, "#8a5828"], [1, "#3c1e08"]]), "#1a0c02", 1.5);
      rounded(ctx, 104, 52, 4, 8, 1, "#120802");
      // Right Turret Conical Roof
      poly(ctx, [[90, 46], [103, 30], [116, 46]], linGrad(ctx, 103, 30, 103, 46, [[0, "#6ca87a"], [0.5, "#427850"], [1, "#1e4428"]]), "#102616", 1.8);
      ellipse(ctx, 103, 30, 2, 2, "#ffd452", "#503808", 0.8);

      // Center Citadel Lower Hall (Y=44 to 68)
      rounded(ctx, 32, 44, 64, 25, 2, linGrad(ctx, 32, 44, 96, 69, [[0, "#aa7438"], [0.5, "#7e4a1e"], [1, "#442208"]]), "#1e0e04", 2);
      for (let px = 38; px <= 90; px += 13) {
        ctx.strokeStyle = "#1a0c04";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px, 45); ctx.lineTo(px, 68);
        ctx.stroke();
      }

      // 4. Lower Sweeping Grand Thatched Eave (Y=32 to 48)
      const grandMidEave = [
        [8, 46],
        [64, 28],
        [120, 46],
        [114, 50],
        [64, 34],
        [14, 50],
      ];
      poly(ctx, grandMidEave, linGrad(ctx, 64, 28, 64, 50, [[0, "#fae48e"], [0.35, "#dcba52"], [0.75, "#9c7224"], [1, "#543a0e"]]), "#241604", 2.2);

      ctx.strokeStyle = "rgba(60, 36, 8, 0.55)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let i = 0; i < 11; i += 1) {
        const sx = 18 + i * 9.2;
        const sy = 48 - Math.abs(sx - 64) * 0.32;
        ctx.arc(sx, sy, 4.8, 0.1, Math.PI * 0.95);
      }
      ctx.stroke();

      // 5. Grand Upper Marksman Pavilion & Dual Rangers (Y=14 to 34)
      rounded(ctx, 34, 16, 60, 18, 2, linGrad(ctx, 34, 16, 94, 34, [[0, "#1c1008"], [0.5, "#2a160a"], [1, "#120804"]]), "#160a02", 1.6);

      // Carved Gilded Balustrade
      rounded(ctx, 30, 24, 68, 7, 1.5, linGrad(ctx, 30, 24, 98, 31, [[0, "#ffd864"], [0.5, "#c49232"], [1, "#6a440e"]]), "#241204", 1.4);
      for (let bx = 34; bx <= 94; bx += 8) {
        ellipse(ctx, bx, 27.5, 1.2, 1.2, "#ffffff", "#503808", 0.6);
      }

      // Sentry Ranger on Left
      rounded(ctx, 42, 14, 9, 10, 3, "#326230", "#0e1e0c", 0.8);
      ellipse(ctx, 46, 18, 3.2, 3.2, "#f6d5ae", "#3a2214", 0.8);
      poly(ctx, [[43, 15], [36, 11], [40, 17]], "#ea3824", "#500a04", 0.8);

      // Master Ranger Marksman in Center-Right
      rounded(ctx, 66, 12, 11, 12, 4, linGrad(ctx, 66, 12, 77, 24, [[0, "#3a7036"], [1, "#163014"]]), "#0e1e0c", 1.0);
      ellipse(ctx, 72, 17, 3.8, 3.8, "#f6d5ae", "#3a2214", 0.8);
      poly(ctx, [[67, 13], [58, 8], [63, 15]], linGrad(ctx, 67, 13, 58, 8, [[0, "#ffd854"], [1, "#ea3824"]]), "#500a04", 0.8);

      // Master Gilded Recurve Longbow with Glowing Bodkin Arrow
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(82, 6); ctx.quadraticCurveTo(87, 18, 82, 30);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 240, 0.95)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(82, 7); ctx.lineTo(82, 29);
      ctx.stroke();

      // Glowing Arrowhead Tip
      ellipse(ctx, 92, 17, 3, 3, radGrad(ctx, 92, 17, 1, 3, [[0, "#ffffff"], [0.5, "#a8f0ff"], [1, "rgba(80,200,255,0)"]]));
      poly(ctx, [[90, 17], [96, 16], [90, 18]], "#ffffff");

      // 6. Grand High Gable Pavilion Roof & Gilded Falcon Finial (Y=-2 to 20)
      const highGablePoly = [
        [22, 18],
        [64, 0],
        [106, 18],
        [100, 22],
        [64, 6],
        [28, 22],
      ];
      poly(ctx, highGablePoly, linGrad(ctx, 64, 0, 64, 22, [[0, "#fff8b8"], [0.35, "#e8c85c"], [0.75, "#a67a26"], [1, "#5c4010"]]), "#241604", 2.2);

      ctx.strokeStyle = "rgba(60, 36, 8, 0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < 8; i += 1) {
        const sx = 32 + i * 9.2;
        const sy = 20 - Math.abs(sx - 64) * 0.42;
        ctx.arc(sx, sy, 4.2, 0.1, Math.PI * 0.95);
      }
      ctx.stroke();

      // Soaring Gilded Falcon / Eagle Finial at Peak (Y=-4 to 8)
      // Spreading Golden Wings
      poly(ctx, [[64, -2], [52, -6], [58, 2], [64, 0]], linGrad(ctx, 52, -6, 64, 2, [[0, "#fff090"], [1, "#b88020"]]), "#3a2404", 1.0);
      poly(ctx, [[64, -2], [76, -6], [70, 2], [64, 0]], linGrad(ctx, 76, -6, 64, 2, [[0, "#fff090"], [1, "#b88020"]]), "#3a2404", 1.0);
      // Falcon Head & Spire
      poly(ctx, [[64, -7], [66, -2], [64, 4], [62, -2]], "#ffe868", "#4a3006", 1.2);
      ellipse(ctx, 64, -2, 2, 2, "#ffffff", "#ffd452", 0.8);

      // 7. Grand Emerald & Gold War Standards
      // Left Grand Standard (flying from Left Turret)
      poly(ctx, [[14, 52], [32, 52], [30, 84], [22, 77], [12, 86]], linGrad(ctx, 12, 52, 32, 86, [[0, "#387840"], [0.45, "#22542a"], [1, "#0e2c14"]]), "#08180c", 1.4);
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(15, 53); ctx.lineTo(15, 82); ctx.lineTo(22, 76); ctx.lineTo(28, 80); ctx.lineTo(30, 53);
      ctx.stroke();
      ellipse(ctx, 22, 64, 3.5, 2.5, "#ffe268", "#503808", 0.8);

      // Right Grand Standard (flying from Right Turret)
      poly(ctx, [[96, 52], [114, 52], [116, 86], [106, 77], [98, 84]], linGrad(ctx, 96, 52, 116, 86, [[0, "#387840"], [0.45, "#22542a"], [1, "#0e2c14"]]), "#08180c", 1.4);
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(98, 53); ctx.lineTo(100, 80); ctx.lineTo(106, 76); ctx.lineTo(113, 82); ctx.lineTo(113, 53);
      ctx.stroke();
      ellipse(ctx, 106, 64, 3.5, 2.5, "#ffe268", "#503808", 0.8);

      drawArcherIvy128(ctx);
    };

    make("tower_archer_idle", 128, 128, drawArcherIdle);
    make("tower_archer", 128, 128, drawArcherIdle);
    make("tower_archer_l2", 128, 128, drawArcherL2);
    make("tower_archer_l3", 128, 128, drawArcherL3);
    make("tower_archer_fire", 128, 128, drawArcherFire);

    // —— Runes / Mage Spire (128×128 detailed rebuild) ——
    const drawMageSpireBody128 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Arcane Earthen Mound
      shadow(ctx, 64, 118, 50, 12, 0.55);
      shadow(ctx, 64, 119, 38, 7, 0.62);
      ellipse(ctx, 64, 110, 48, 15, linGrad(ctx, 24, 96, 104, 122, [[0, "#3e3a6a"], [0.4, "#28224c"], [1, "#120e28"]]), "#141008", 3.2);
      ctx.strokeStyle = "rgba(180, 150, 255, 0.4)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(64, 108, 42, 10, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      // Arcane foundation stones embedded in earth
      ellipse(ctx, 28, 114, 4.5, 2.5, "#524874", "#141008", 1.2);
      ellipse(ctx, 40, 118, 5, 3, "#423862", "#141008", 1.2);
      ellipse(ctx, 88, 116, 4.5, 3, "#483e6a", "#141008", 1.2);
      ellipse(ctx, 98, 113, 3.5, 2.2, "#584e7a", "#141008", 1.2);

      // 2. Mystic Obsidian & Violet Slate Stone Plinth (Y=80 to 110)
      rounded(ctx, 30, 78, 68, 32, 4, linGrad(ctx, 30, 78, 98, 110, [[0, "#8272b2"], [0.35, "#584888"], [0.75, "#382864"], [1, "#201440"]]), "#141008", 2.8);

      // Stone block mortar lines (3 courses)
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(32, 88); ctx.lineTo(96, 88);
      ctx.moveTo(32, 98); ctx.lineTo(96, 98);
      ctx.stroke();

      // Stone block top bevel highlights
      ctx.strokeStyle = "rgba(230, 210, 255, 0.35)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(32, 89.5); ctx.lineTo(96, 89.5);
      ctx.moveTo(32, 99.5); ctx.lineTo(96, 99.5);
      ctx.stroke();

      // Vertical mortar joints
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(48, 79); ctx.lineTo(48, 88);
      ctx.moveTo(78, 79); ctx.lineTo(78, 88);
      ctx.moveTo(40, 88); ctx.lineTo(40, 98);
      ctx.moveTo(64, 88); ctx.lineTo(64, 98);
      ctx.moveTo(88, 88); ctx.lineTo(88, 98);
      ctx.moveTo(52, 98); ctx.lineTo(52, 109);
      ctx.moveTo(76, 98); ctx.lineTo(76, 109);
      ctx.stroke();

      // Stone texture speckles
      speckles(ctx, 32, 80, 64, 28, 22, "rgba(0,0,0,0.2)", 1.2);
      speckles(ctx, 32, 80, 64, 28, 16, "rgba(220,200,255,0.22)", 1.0);

      // Engraved glowing runes on plinth stones
      ctx.strokeStyle = "rgba(180, 225, 255, 0.85)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      // Left rune glyph
      ctx.moveTo(42, 91); ctx.lineTo(45, 95); ctx.lineTo(42, 96);
      ctx.moveTo(41, 93); ctx.lineTo(46, 93);
      // Center rune glyph
      ctx.moveTo(64, 81); ctx.lineTo(64, 86); ctx.moveTo(61, 83); ctx.lineTo(67, 83);
      ctx.moveTo(62, 81); ctx.lineTo(66, 86);
      // Right rune glyph
      ctx.moveTo(85, 91); ctx.lineTo(87, 93); ctx.lineTo(85, 96);
      ctx.moveTo(88, 91); ctx.lineTo(86, 96);
      ctx.stroke();

      // Gold anchor brackets with amethyst jewels on plinth corners
      rounded(ctx, 29, 89, 5, 15, 1.5, "#d4aa44", "#141008", 1.2);
      rounded(ctx, 94, 89, 5, 15, 1.5, "#d4aa44", "#141008", 1.2);
      ellipse(ctx, 31.5, 96.5, 1.6, 2.2, "#e090ff", "#141008", 0.8);
      ellipse(ctx, 96.5, 96.5, 1.6, 2.2, "#e090ff", "#141008", 0.8);

      // 3. Cantilevered Corbel Supports & Dais Rim (Y=70 to 82)
      poly(ctx, [[38, 90], [44, 92], [32, 78], [26, 78]], linGrad(ctx, 26, 78, 44, 92, [[0, "#7462a4"], [1, "#281850"]]), "#141008", 1.8);
      poly(ctx, [[90, 90], [84, 92], [96, 78], [102, 78]], linGrad(ctx, 84, 78, 102, 92, [[0, "#665496"], [1, "#201244"]]), "#141008", 1.8);

      // Main Dais Rim Platform
      rounded(ctx, 22, 70, 84, 12, 3, linGrad(ctx, 22, 70, 106, 82, [[0, "#9e8cd4"], [0.3, "#705ca6"], [0.7, "#463478"], [1, "#281a52"]]), "#141008", 2.8);
      ctx.strokeStyle = "rgba(240, 225, 255, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(24, 72); ctx.lineTo(104, 72);
      ctx.stroke();

      // Gilded runic band along dais rim
      ctx.strokeStyle = "#ffd452";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(26, 76); ctx.lineTo(102, 76);
      ctx.stroke();
      for (const gx of [30, 47, 64, 81, 98]) {
        ellipse(ctx, gx, 76, 1.4, 1.4, "#a6e4ff", "#141008", 0.8);
      }

      // 4. Arcane Spire Tower Shaft & Flanking Pylons (Y=38 to 74)
      // Main central tapered spire shaft
      const shaftPoly = [
        [36, 70],
        [44, 38],
        [84, 38],
        [92, 70],
      ];
      poly(ctx, shaftPoly, linGrad(ctx, 36, 38, 92, 70, [[0, "#7a6aa8"], [0.3, "#544682"], [0.7, "#362660"], [1, "#1c103c"]]), "#141008", 3.0);

      // Vertical shaft bevels
      ctx.strokeStyle = "rgba(220, 205, 255, 0.35)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(52, 39); ctx.lineTo(48, 70);
      ctx.stroke();
      ctx.strokeStyle = "rgba(20, 10, 40, 0.55)";
      ctx.beginPath();
      ctx.moveTo(76, 39); ctx.lineTo(80, 70);
      ctx.stroke();

      // Flanking Crystal-Cradle Buttress Pylons
      // Left pylon
      poly(ctx, [[26, 70], [34, 70], [40, 42], [32, 36], [26, 46]], linGrad(ctx, 26, 36, 40, 70, [[0, "#8e7ebc"], [0.5, "#58488a"], [1, "#261652"]]), "#141008", 2.2);
      poly(ctx, [[32, 36], [37, 30], [41, 36], [40, 42]], linGrad(ctx, 32, 30, 41, 42, [[0, "#ffd860"], [1, "#966818"]]), "#141008", 1.4);
      ellipse(ctx, 36.5, 32, 2.2, 2.8, "#6fe4ff", "#141008", 1.0);

      // Right pylon
      poly(ctx, [[102, 70], [94, 70], [88, 42], [96, 36], [102, 46]], linGrad(ctx, 88, 36, 102, 70, [[0, "#7c6ca8"], [0.5, "#483a78"], [1, "#1e0e44"]]), "#141008", 2.2);
      poly(ctx, [[96, 36], [91, 30], [87, 36], [88, 42]], linGrad(ctx, 87, 30, 96, 42, [[0, "#ffd860"], [1, "#966818"]]), "#141008", 1.4);
      ellipse(ctx, 91.5, 32, 2.2, 2.8, "#6fe4ff", "#141008", 1.0);

      // 5. Sanctum Vault / Mystic Archway (Embrasure Y=48 to 68)
      rounded(ctx, 50, 46, 28, 22, 11, "#0e061c", "#141008", 2.4);
      // Inner glowing arcane vortex
      ellipse(ctx, 64, 57, 10, 8, radGrad(ctx, 64, 57, 1, 10, [[0, "#ffffff"], [0.4, "#a878ff"], [0.8, "#5028aa"], [1, "rgba(20,6,50,0)"]]));
      // Astral Tracery
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(64, 52, 8, Math.PI, Math.PI * 2);
      ctx.moveTo(64, 52); ctx.lineTo(64, 66);
      ctx.stroke();
      ellipse(ctx, 64, 52, 1.8, 1.8, "#6fe4ff");

      // 6. Gold Runic Conduit Veins running from sanctum up to crystal cradle
      ctx.strokeStyle = "#ffd248";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(56, 46); ctx.lineTo(52, 38); ctx.lineTo(58, 34);
      ctx.moveTo(72, 46); ctx.lineTo(76, 38); ctx.lineTo(70, 34);
      ctx.stroke();

      // Top Crystal Cradle Collar Ring (Y=34 to 42)
      rounded(ctx, 44, 34, 40, 8, 3, linGrad(ctx, 44, 34, 84, 42, [[0, "#ffd868"], [0.5, "#d49a2a"], [1, "#744c0c"]]), "#141008", 2.2);
      for (const cx of [48, 56, 64, 72, 80]) {
        ellipse(ctx, cx, 38, 1.4, 1.4, "#8ae8ff", "#141008", 0.8);
      }
    };

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

    const drawMagePennant128 = (ctx, isFire = false) => {
      // Golden banner rod on left/right battlement
      rounded(ctx, 84, 52, 28, 3, 1, "#ffd452", "#141008", 1.0);
      ellipse(ctx, 112, 53.5, 2, 2, "#ffd452", "#141008", 1.0);

      if (!isFire) {
        const p = [
          [86, 54],
          [108, 54],
          [104, 76],
          [96, 70],
          [88, 78],
        ];
        poly(ctx, p, linGrad(ctx, 86, 54, 108, 78, [[0, "#845ed8"], [0.45, "#5a34b0"], [1, "#2e126c"]]), "#141008", 1.6);
        ctx.strokeStyle = "#ffd452";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(88, 55); ctx.lineTo(89, 75); ctx.lineTo(96, 69); ctx.lineTo(103, 73); ctx.lineTo(106, 55);
        ctx.stroke();
        // Golden eye / runic sigil on banner
        ellipse(ctx, 96, 62, 3, 2, "#ffe074", "#141008", 1.0);
        ellipse(ctx, 96, 62, 1.2, 1.2, "#401888");
      } else {
        // Flapping violently in mana wind
        const p = [
          [86, 54],
          [116, 48],
          [110, 64],
          [120, 74],
          [88, 62],
        ];
        poly(ctx, p, linGrad(ctx, 86, 48, 120, 74, [[0, "#a074ff"], [0.45, "#7040d8"], [1, "#3c168c"]]), "#141008", 1.8);
        ctx.strokeStyle = "#ffe468";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(88, 55); ctx.lineTo(114, 49); ctx.lineTo(109, 63); ctx.lineTo(118, 72);
        ctx.stroke();
      }
    };

    const drawMageIdle = (ctx) => {
      drawMageSpireBody128(ctx);
      drawMagePennant128(ctx, false);
      drawMageCrystal128(ctx, false);
    };

    const drawMageFire = (ctx) => {
      drawMageSpireBody128(ctx);
      drawMagePennant128(ctx, true);
      drawMageCrystal128(ctx, true);
      ellipse(ctx, 104, 36, 18, 18, radGrad(ctx, 104, 36, 2, 18, [
        [0, "#fff8ff"],
        [0.35, "#c8a0ff"],
        [1, "rgba(70, 16, 140, 0)"],
      ]));
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(74, 50);
      ctx.quadraticCurveTo(94, 28, 120, 28);
      ctx.stroke();
      ctx.strokeStyle = "rgba(220, 180, 255, 0.95)";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(74, 50);
      ctx.quadraticCurveTo(94, 28, 120, 28);
      ctx.stroke();
      ellipse(ctx, 120, 28, 5.5, 5.5, "#f8eeff", "#141008", 1.4);
      ellipse(ctx, 90, 38, 2.4, 2.4, "#ffffff", "#141008", 0.8);
      ellipse(ctx, 108, 24, 2.0, 2.0, "#ffe8ff");
      ellipse(ctx, 105, 28, 1.8, 1.8, "#ffffff");
      ellipse(ctx, 98, 34, 1.8, 1.8, "#ffe8ff");
      ellipse(ctx, 115, 24, 2.0, 2.0, "#f8eeff");
    };

    const drawMageL2 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Arcane Earthen Mound
      shadow(ctx, 64, 116, 48, 11, 0.45);
      shadow(ctx, 64, 117, 36, 6, 0.58);

      ellipse(ctx, 64, 110, 46, 14, linGrad(ctx, 24, 96, 104, 122, [[0, "#3e3a6a"], [0.4, "#28224c"], [1, "#120e28"]]), "#141008", 3.2);
      ctx.strokeStyle = "rgba(180, 150, 255, 0.4)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(64, 108, 42, 10, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      ellipse(ctx, 28, 114, 4.5, 2.5, "#524874", "#141008", 1.2);
      ellipse(ctx, 40, 118, 5, 3, "#423862", "#141008", 1.2);
      ellipse(ctx, 88, 116, 4.5, 3, "#483e6a", "#141008", 1.2);
      ellipse(ctx, 98, 113, 3.5, 2.2, "#584e7a", "#141008", 1.2);

      // 2. Mystic Obsidian & Violet Slate Plinth (Y=78 to 110)
      rounded(ctx, 30, 78, 68, 32, 4, linGrad(ctx, 30, 78, 98, 110, [[0, "#8272b2"], [0.35, "#584888"], [0.75, "#382864"], [1, "#201440"]]), "#141008", 2.8);

      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(32, 88); ctx.lineTo(96, 88);
      ctx.moveTo(32, 98); ctx.lineTo(96, 98);
      ctx.stroke();

      ctx.strokeStyle = "rgba(230, 210, 255, 0.35)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(32, 89.5); ctx.lineTo(96, 89.5);
      ctx.moveTo(32, 99.5); ctx.lineTo(96, 99.5);
      ctx.stroke();

      speckles(ctx, 32, 80, 64, 28, 22, "rgba(0,0,0,0.2)", 1.2);
      speckles(ctx, 32, 80, 64, 28, 16, "rgba(220,200,255,0.22)", 1.0);

      // Glowing Cyan Runes Engraved on Plinth
      ctx.strokeStyle = "rgba(160, 230, 255, 0.85)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(42, 92); ctx.lineTo(46, 96); ctx.lineTo(42, 97);
      ctx.moveTo(41, 94); ctx.lineTo(47, 94);
      ctx.moveTo(64, 82); ctx.lineTo(64, 87); ctx.moveTo(61, 84); ctx.lineTo(67, 84);
      ctx.moveTo(84, 92); ctx.lineTo(87, 95); ctx.lineTo(84, 97);
      ctx.stroke();

      // Gold brackets with Amethyst gems
      rounded(ctx, 29, 89, 5, 15, 1.5, "#d4aa44", "#141008", 1.2);
      rounded(ctx, 94, 89, 5, 15, 1.5, "#d4aa44", "#141008", 1.2);
      ellipse(ctx, 31.5, 96.5, 1.8, 2.2, "#e090ff", "#141008", 0.8);
      ellipse(ctx, 96.5, 96.5, 1.8, 2.2, "#e090ff", "#141008", 0.8);

      // 3. Cantilevered Corbel Supports & Dais Rim (Y=68 to 80)
      poly(ctx, [[36, 88], [42, 90], [30, 76], [24, 76]], linGrad(ctx, 24, 76, 42, 90, [[0, "#7462a4"], [1, "#281850"]]), "#141008", 1.8);
      poly(ctx, [[92, 88], [86, 90], [98, 76], [104, 76]], linGrad(ctx, 86, 76, 104, 88, [[0, "#665496"], [1, "#201244"]]), "#141008", 1.8);

      rounded(ctx, 22, 70, 84, 10, 3, linGrad(ctx, 22, 70, 106, 80, [[0, "#9e8cd4"], [0.3, "#705ca6"], [0.7, "#463478"], [1, "#281a52"]]), "#141008", 2.8);
      ctx.strokeStyle = "#ffd452";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(26, 75); ctx.lineTo(102, 75);
      ctx.stroke();
      for (const gx of [30, 44, 58, 70, 84, 98]) {
        ellipse(ctx, gx, 75, 1.3, 1.3, "#a6e4ff", "#141008", 0.8);
      }

      // 4. Spire Tower Shaft & Quadruple Focus Pylons (Y=36 to 72)
      const shaftPoly = [
        [36, 70],
        [44, 38],
        [84, 38],
        [92, 70],
      ];
      poly(ctx, shaftPoly, linGrad(ctx, 36, 38, 92, 70, [[0, "#7a6aa8"], [0.3, "#544682"], [0.7, "#362660"], [1, "#1c103c"]]), "#141008", 3.0);

      // Pylons (Dual-tiered brackets on left and right)
      // Left outer pylon
      poly(ctx, [[24, 70], [32, 70], [38, 44], [30, 36], [24, 46]], linGrad(ctx, 24, 36, 38, 70, [[0, "#8e7ebc"], [1, "#261652"]]), "#141008", 1.8);
      poly(ctx, [[30, 36], [35, 30], [39, 36], [38, 42]], linGrad(ctx, 30, 30, 39, 42, [[0, "#ffd860"], [1, "#966818"]]), "#141008", 1.2);
      ellipse(ctx, 34.5, 32, 2, 2.5, "#6fe4ff", "#141008", 0.8);

      // Left inner pylon
      poly(ctx, [[34, 70], [42, 70], [46, 48], [40, 42]], linGrad(ctx, 34, 42, 46, 70, [[0, "#7c6ca8"], [1, "#201244"]]), "#141008", 1.6);

      // Right outer pylon
      poly(ctx, [[104, 70], [96, 70], [90, 44], [98, 36], [104, 46]], linGrad(ctx, 90, 36, 104, 70, [[0, "#7c6ca8"], [1, "#1e0e44"]]), "#141008", 1.8);
      poly(ctx, [[98, 36], [93, 30], [89, 36], [90, 42]], linGrad(ctx, 89, 30, 98, 42, [[0, "#ffd860"], [1, "#966818"]]), "#141008", 1.2);
      ellipse(ctx, 93.5, 32, 2, 2.5, "#6fe4ff", "#141008", 0.8);

      // Right inner pylon
      poly(ctx, [[94, 70], [86, 70], [82, 48], [88, 42]], linGrad(ctx, 82, 42, 94, 70, [[0, "#6e5e98"], [1, "#1a0c3c"]]), "#141008", 1.6);

      // 5. Sanctum Vault & Astral Galaxy Vortex (Y=46 to 66)
      rounded(ctx, 50, 46, 28, 22, 11, "#0e061c", "#141008", 2.4);
      ellipse(ctx, 64, 57, 10, 8, radGrad(ctx, 64, 57, 1, 10, [[0, "#ffffff"], [0.35, "#a878ff"], [0.75, "#5028aa"], [1, "rgba(20,6,50,0)"]]));
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(64, 52, 8, Math.PI, Math.PI * 2);
      ctx.moveTo(64, 52); ctx.lineTo(64, 66);
      ctx.stroke();
      ellipse(ctx, 64, 52, 1.8, 1.8, "#6fe4ff");

      // Top Crystal Cradle Collar Ring (Y=32 to 40)
      rounded(ctx, 44, 34, 40, 7, 3, linGrad(ctx, 44, 34, 84, 41, [[0, "#ffd868"], [0.5, "#d49a2a"], [1, "#744c0c"]]), "#141008", 2.0);
      for (const cx of [48, 56, 64, 72, 80]) {
        ellipse(ctx, cx, 37.5, 1.3, 1.3, "#8ae8ff", "#141008", 0.8);
      }

      // 6. Floating Dual-Tier Arcane Crystals & Satellite Shards
      // Orbiting Crystal Shards
      for (const [cx, cy, cw, ch, col0, col1] of [
        [32, 22, 5, 14, "#8ae8ff", "#5028c0"],
        [96, 22, 5, 14, "#b48aff", "#3a1890"],
        [44, 10, 4, 10, "#d8c4ff", "#4e24b4"],
        [84, 10, 4, 10, "#8ae8ff", "#3a1890"],
      ]) {
        poly(ctx, [[cx, cy - ch / 2], [cx + cw / 2, cy], [cx, cy + ch / 2], [cx - cw / 2, cy]], linGrad(ctx, cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2, [[0, col0], [1, col1]]), "#141008", 1.4);
      }

      // Ambient crystal glow aura
      ellipse(ctx, 64, 20, 28, 26, radGrad(ctx, 64, 20, 2, 28, [[0, "rgba(230, 210, 255, 0.5)"], [0.5, "rgba(140, 90, 240, 0.22)"], [1, "rgba(60, 20, 150, 0)"]]));

      // Primary Faceted Violet Crystal (Y=14 to 38)
      poly(ctx, [[64, 14], [48, 25], [54, 38], [64, 40], [74, 38], [80, 25]], linGrad(ctx, 48, 14, 80, 40, [[0, "#ffffff"], [0.35, "#c8b0ff"], [0.7, "#8e5ef0"], [1, "#3c168c"]]), "#141008", 2.2);
      poly(ctx, [[64, 14], [80, 25], [64, 27]], linGrad(ctx, 64, 14, 80, 27, [[0, "#ffffff"], [0.4, "#d8c4ff"], [1, "#9062f4"]]), "#141008", 1.6);

      // Internal Mana Core
      ellipse(ctx, 64, 26, 6, 6, radGrad(ctx, 62, 24, 1, 6, [[0, "#ffffff"], [0.5, "#d6beff"], [1, "rgba(140,80,240,0.3)"]]), "#ffffff", 1.0);

      // Elevated Floating Diamond Focus Crystal (Y=2 to 14)
      poly(ctx, [[64, 2], [70, 8], [64, 14], [58, 8]], linGrad(ctx, 58, 2, 70, 14, [[0, "#ffffff"], [0.4, "#a8e8ff"], [1, "#5028c0"]]), "#141008", 1.6);
      ellipse(ctx, 64, 8, 2, 2, "#ffffff");

      // Power beam connecting crystals
      ctx.strokeStyle = "rgba(180, 240, 255, 0.85)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(64, 14); ctx.lineTo(64, 18);
      ctx.stroke();

      // Triple Concentric Glowing Magic Orbit Rings
      ctx.strokeStyle = "rgba(160, 225, 255, 0.85)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(64, 16, 24, 7, -0.1, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(220, 175, 255, 0.8)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(64, 28, 28, 8, 0.08, 0, Math.PI * 2);
      ctx.stroke();

      for (const [rx, ry] of [[42, 16], [86, 16], [38, 28], [90, 28], [64, 36]]) {
        ellipse(ctx, rx, ry, 1.8, 1.8, "#ffffff", "#70d4ff", 0.8);
      }

      // Twin Violet-and-Gold Pennants (Left & Right)
      // Right Banner
      rounded(ctx, 86, 52, 26, 3, 1, "#ffd452", "#141008", 1.0);
      poly(ctx, [[88, 54], [108, 54], [104, 76], [96, 70], [88, 78]], linGrad(ctx, 88, 54, 108, 78, [[0, "#845ed8"], [0.45, "#5a34b0"], [1, "#2e126c"]]), "#141008", 1.6);
      ctx.strokeStyle = "#ffd452";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(90, 55); ctx.lineTo(91, 75); ctx.lineTo(96, 69); ctx.lineTo(103, 73); ctx.lineTo(106, 55);
      ctx.stroke();

      // Left Banner
      rounded(ctx, 16, 52, 26, 3, 1, "#ffd452", "#141008", 1.0);
      poly(ctx, [[40, 54], [20, 54], [24, 76], [32, 70], [40, 78]], linGrad(ctx, 20, 54, 40, 78, [[0, "#845ed8"], [0.45, "#5a34b0"], [1, "#2e126c"]]), "#141008", 1.6);
      ctx.strokeStyle = "#ffd452";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(38, 55); ctx.lineTo(37, 75); ctx.lineTo(32, 69); ctx.lineTo(25, 73); ctx.lineTo(22, 55);
      ctx.stroke();

      // Arcane sparkles
      for (const [sx, sy, r] of [[20, 16, 1.8], [108, 18, 1.8], [48, 6, 1.4], [80, 6, 1.5]]) {
        ellipse(ctx, sx, sy, r, r, "#ffffff", "#b894ff", 0.8);
      }
    };

    const drawMageL3 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Floating Arcane Mound
      shadow(ctx, 64, 116, 52, 13, 0.48);
      shadow(ctx, 64, 117, 40, 7, 0.62);

      ellipse(ctx, 64, 110, 50, 15, linGrad(ctx, 20, 96, 108, 122, [[0, "#483e78"], [0.4, "#2e2456"], [1, "#140e30"]]), "#141008", 3.2);
      ctx.strokeStyle = "rgba(190, 160, 255, 0.5)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(64, 108, 46, 11, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      // Levitating Arcane Megaliths around plinth
      const megaliths = [
        [20, 108, 8, 14, "#483e74"],
        [108, 108, 8, 14, "#483e74"],
        [28, 115, 6, 8, "#3a3064"],
        [100, 115, 6, 8, "#3a3064"],
      ];
      for (const [mx, my, mw, mh, mcol] of megaliths) {
        poly(ctx, [[mx, my - mh / 2], [mx + mw / 2, my], [mx, my + mh / 2], [mx - mw / 2, my]], linGrad(ctx, mx - mw / 2, my - mh / 2, mx + mw / 2, my + mh / 2, [[0, "#7a6ca8"], [1, mcol]]), "#141008", 1.6);
        ctx.strokeStyle = "rgba(160, 230, 255, 0.7)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(mx, my - mh / 2 + 1); ctx.lineTo(mx, my + mh / 2 - 1);
        ctx.stroke();
      }

      // 2. Monumental Stepped Obsidian Plinth & Leyline Fissures (Y=72 to 112)
      rounded(ctx, 26, 72, 76, 38, 4, linGrad(ctx, 26, 72, 102, 110, [[0, "#9280c8"], [0.35, "#66529e"], [0.75, "#423074"], [1, "#24164a"]]), "#141008", 3.0);

      // Plinth course mortar
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(28, 82); ctx.lineTo(100, 82);
      ctx.moveTo(28, 92); ctx.lineTo(100, 92);
      ctx.moveTo(28, 102); ctx.lineTo(100, 102);
      ctx.stroke();

      // Glowing Leyline Fissures (Cyan & Magenta energy flowing up plinth)
      ctx.strokeStyle = "rgba(140, 235, 255, 0.9)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(38, 106); ctx.lineTo(44, 94); ctx.lineTo(40, 84); ctx.lineTo(48, 74);
      ctx.moveTo(90, 106); ctx.lineTo(84, 94); ctx.lineTo(88, 84); ctx.lineTo(80, 74);
      ctx.moveTo(64, 108); ctx.lineTo(64, 82);
      ctx.stroke();

      // Heavy Gold Anchor Buttresses with Sapphires
      for (const [bx, by] of [[24, 84], [98, 84]]) {
        rounded(ctx, bx, by, 6, 18, 2, "#ffd452", "#141008", 1.4);
        ellipse(ctx, bx + 3, by + 9, 2.2, 3, "#50b8ff", "#141008", 1.0);
      }

      // 3. Spire Architecture & Soaring Winged Pylons (Y=20 to 74)
      rounded(ctx, 16, 66, 96, 10, 3, linGrad(ctx, 16, 66, 112, 76, [[0, "#b09ee6"], [0.3, "#826eb8"], [0.7, "#52408a"], [1, "#302064"]]), "#141008", 2.8);
      ctx.strokeStyle = "#ffd452";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(18, 71); ctx.lineTo(110, 71);
      ctx.stroke();
      for (const gx of [24, 40, 56, 72, 88, 104]) {
        ellipse(ctx, gx, 71, 1.4, 1.4, "#a6f0ff", "#141008", 0.8);
      }

      // Sweeping Celestial Left Pylon Wing (Soaring from 14,70 to 28,20)
      const leftWingPoly = [
        [18, 68],
        [32, 68],
        [38, 32],
        [28, 18],
        [22, 34],
      ];
      poly(ctx, leftWingPoly, linGrad(ctx, 18, 18, 38, 68, [[0, "#a894e4"], [0.45, "#6e58aa"], [1, "#301e68"]]), "#141008", 2.4);
      poly(ctx, [[28, 18], [34, 12], [38, 20], [38, 32]], linGrad(ctx, 28, 12, 38, 32, [[0, "#fff090"], [1, "#b88020"]]), "#141008", 1.4);
      ellipse(ctx, 33, 16, 2.5, 3.2, "#8ae8ff", "#141008", 1.0);

      // Sweeping Celestial Right Pylon Wing (Soaring from 96,68 to 110,20)
      const rightWingPoly = [
        [110, 68],
        [96, 68],
        [90, 32],
        [100, 18],
        [106, 34],
      ];
      poly(ctx, rightWingPoly, linGrad(ctx, 90, 18, 110, 68, [[0, "#a894e4"], [0.45, "#6e58aa"], [1, "#301e68"]]), "#141008", 2.4);
      poly(ctx, [[100, 18], [94, 12], [90, 20], [90, 32]], linGrad(ctx, 90, 12, 100, 32, [[0, "#fff090"], [1, "#b88020"]]), "#141008", 1.4);
      ellipse(ctx, 95, 16, 2.5, 3.2, "#8ae8ff", "#141008", 1.0);

      // Center Spire Shaft
      poly(ctx, [[34, 68], [42, 32], [86, 32], [94, 68]], linGrad(ctx, 34, 32, 94, 68, [[0, "#8a78bc"], [0.35, "#5c4a92"], [1, "#241450"]]), "#141008", 3.0);

      // 4. Grand Star Sanctum (Y=38 to 62)
      rounded(ctx, 48, 38, 32, 24, 12, "#0a0418", "#141008", 2.4);
      // Radiant Star Core Nexus
      ellipse(ctx, 64, 50, 12, 10, radGrad(ctx, 64, 50, 1, 12, [[0, "#ffffff"], [0.3, "#e0b8ff"], [0.65, "#8a48ff"], [1, "rgba(20,4,60,0)"]]));
      ellipse(ctx, 64, 50, 4, 4, "#ffffff");

      // Triple-Tiered Crystal Collar Dais (Y=24 to 34)
      rounded(ctx, 40, 26, 48, 8, 3, linGrad(ctx, 40, 26, 88, 34, [[0, "#ffe278"], [0.5, "#d49a2a"], [1, "#744c0c"]]), "#141008", 2.0);
      for (const cx of [44, 52, 60, 68, 76, 84]) {
        ellipse(ctx, cx, 30, 1.4, 1.4, "#a6f0ff", "#141008", 0.8);
      }

      // 5. Colossal Master Arcanum Crystal & Astral Astrolabe (Y=-2 to 36)
      // Radiant Radiant Aura
      ellipse(ctx, 64, 16, 36, 32, radGrad(ctx, 64, 16, 3, 36, [[0, "rgba(255, 255, 255, 0.7)"], [0.3, "rgba(220, 190, 255, 0.45)"], [0.65, "rgba(130, 80, 240, 0.2)"], [1, "rgba(40, 10, 120, 0)"]]));

      // Vertical Celestial Flare Beam
      ctx.strokeStyle = "rgba(200, 245, 255, 0.75)";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(64, -6); ctx.lineTo(64, 38);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(64, -6); ctx.lineTo(64, 38);
      ctx.stroke();

      // Master Hyper-Faceted Prismatic Crystal (Y=0 to 34, X=44 to 84)
      poly(ctx, [[64, 0], [46, 16], [54, 32], [64, 34], [74, 32], [82, 16]], linGrad(ctx, 46, 0, 82, 34, [[0, "#ffffff"], [0.3, "#e6d6ff"], [0.6, "#a874ff"], [1, "#4e1ebc"]]), "#141008", 2.4);
      poly(ctx, [[64, 0], [82, 16], [64, 19]], linGrad(ctx, 64, 0, 82, 19, [[0, "#ffffff"], [0.4, "#d8c4ff"], [1, "#9460f4"]]), "#141008", 1.6);
      poly(ctx, [[64, 0], [46, 16], [64, 19]], linGrad(ctx, 46, 0, 64, 19, [[0, "#ffffff"], [0.4, "#b890ff"], [1, "#6a34d4"]]), "#141008", 1.6);

      // Blazing White Star Heart
      ellipse(ctx, 64, 16, 7, 7, radGrad(ctx, 63, 15, 1, 7, [[0, "#ffffff"], [0.5, "#eedeff"], [1, "rgba(160,100,255,0.4)"]]), "#ffffff", 1.2);
      ellipse(ctx, 64, 16, 3, 3, "#ffffff");

      // 6. Grand Golden Celestial Astrolabe Ring System
      ctx.strokeStyle = "rgba(140, 235, 255, 0.95)";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(64, 12, 28, 9, -0.12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 215, 100, 0.95)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(64, 22, 32, 10, 0.08, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(240, 180, 255, 0.9)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(64, 30, 26, 8, -0.04, 0, Math.PI * 2);
      ctx.stroke();

      // Constellation of Orbiting Elemental Mana Crystals
      for (const [cx, cy, col0, col1] of [
        [36, 10, "#6fe8ff", "#186090"],
        [92, 10, "#ff8ee8", "#8a186c"],
        [26, 24, "#ffd452", "#966010"],
        [102, 24, "#b894ff", "#4a1c9a"],
        [46, 32, "#8ae8ff", "#2060aa"],
        [82, 32, "#ffa0b8", "#9a2040"],
      ]) {
        poly(ctx, [[cx, cy - 4], [cx + 3, cy], [cx, cy + 4], [cx - 3, cy]], linGrad(ctx, cx - 3, cy - 4, cx + 3, cy + 4, [[0, "#ffffff"], [0.35, col0], [1, col1]]), "#141008", 1.2);
        ellipse(ctx, cx, cy, 1.0, 1.0, "#ffffff");
      }

      // 7. Twin Grand Celestial War Standards (Flowing from Soaring Pylons)
      // Left Grand Standard
      rounded(ctx, 10, 48, 22, 3, 1, "#ffd452", "#141008", 1.0);
      poly(ctx, [[32, 50], [12, 50], [16, 82], [24, 75], [32, 84]], linGrad(ctx, 12, 50, 32, 84, [[0, "#8a60e0"], [0.45, "#5c34b8"], [1, "#2c0e70"]]), "#141008", 1.8);
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(30, 51); ctx.lineTo(29, 81); ctx.lineTo(24, 74); ctx.lineTo(17, 79); ctx.lineTo(14, 51);
      ctx.stroke();
      ellipse(ctx, 22, 63, 3.5, 2.5, "#ffe268", "#141008", 1.0);

      // Right Grand Standard
      rounded(ctx, 96, 48, 22, 3, 1, "#ffd452", "#141008", 1.0);
      poly(ctx, [[96, 50], [116, 50], [112, 82], [104, 75], [96, 84]], linGrad(ctx, 96, 50, 116, 84, [[0, "#8a60e0"], [0.45, "#5c34b8"], [1, "#2c0e70"]]), "#141008", 1.8);
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(98, 51); ctx.lineTo(99, 81); ctx.lineTo(104, 74); ctx.lineTo(111, 79); ctx.lineTo(114, 51);
      ctx.stroke();
      ellipse(ctx, 106, 63, 3.5, 2.5, "#ffe268", "#141008", 1.0);

      // Stardust Sparkles
      for (const [sx, sy, r] of [
        [14, 10, 2.2], [114, 12, 2.2], [22, 38, 1.8], [106, 38, 1.8],
        [50, -4, 1.6], [78, -4, 1.6], [64, -8, 2.4]
      ]) {
        ellipse(ctx, sx, sy, r, r, "#ffffff", "#8ae8ff", 0.8);
      }
    };

    make("tower_mage_idle", 128, 128, drawMageIdle);
    make("tower_mage", 128, 128, drawMageIdle);
    make("tower_mage_l2", 128, 128, drawMageL2);
    make("tower_mage_l3", 128, 128, drawMageL3);
    make("tower_mage_fire", 128, 128, drawMageFire);

    // —— Iron Mortar / Artillery Redoubt (128×128 detailed rebuild) ——
    const drawArtilleryRedoubt128 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Scorched Berm
      shadow(ctx, 64, 118, 52, 13, 0.55);
      shadow(ctx, 64, 119, 40, 8, 0.65);
      ellipse(ctx, 64, 110, 50, 15, linGrad(ctx, 24, 96, 104, 122, [[0, "#5e4c34"], [0.4, "#3e301e"], [1, "#1c140a"]]), "#141008", 3.2);
      ctx.strokeStyle = "rgba(180, 140, 75, 0.35)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(64, 108, 44, 10, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      // Heavy granite foundation boulders
      ellipse(ctx, 26, 114, 5, 3, "#645648", "#141008", 1.2);
      ellipse(ctx, 38, 118, 5.5, 3.2, "#524638", "#141008", 1.2);
      ellipse(ctx, 90, 116, 5, 3.2, "#584a3c", "#141008", 1.2);
      ellipse(ctx, 100, 113, 4, 2.5, "#685848", "#141008", 1.2);

      // 2. Heavy Dressed Quarry Stone Plinth (Foundation Y=80 to 110)
      rounded(ctx, 30, 80, 68, 30, 4, linGrad(ctx, 30, 80, 98, 110, [[0, "#b89064"], [0.35, "#886240"], [0.75, "#583a22"], [1, "#321e10"]]), "#141008", 2.8);

      // Stone block mortar lines (3 courses)
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(32, 90); ctx.lineTo(96, 90);
      ctx.moveTo(32, 100); ctx.lineTo(96, 100);
      ctx.stroke();

      // Stone block top bevel highlights
      ctx.strokeStyle = "rgba(255, 235, 190, 0.35)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(32, 91.5); ctx.lineTo(96, 91.5);
      ctx.moveTo(32, 101.5); ctx.lineTo(96, 101.5);
      ctx.stroke();

      // Vertical mortar joints
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(48, 81); ctx.lineTo(48, 90);
      ctx.moveTo(76, 81); ctx.lineTo(76, 90);
      ctx.moveTo(40, 90); ctx.lineTo(40, 100);
      ctx.moveTo(64, 90); ctx.lineTo(64, 100);
      ctx.moveTo(88, 90); ctx.lineTo(88, 100);
      ctx.moveTo(52, 100); ctx.lineTo(52, 109);
      ctx.moveTo(78, 100); ctx.lineTo(78, 109);
      ctx.stroke();

      // Masonry texture speckles & gunpowder soot
      speckles(ctx, 32, 82, 64, 26, 26, "rgba(0,0,0,0.22)", 1.2);
      speckles(ctx, 32, 82, 64, 26, 14, "rgba(255,230,170,0.18)", 1.0);

      // Heavy Iron corner plates with square bolts
      rounded(ctx, 29, 90, 6, 14, 1.5, "#34302c", "#141008", 1.2);
      rounded(ctx, 93, 90, 6, 14, 1.5, "#34302c", "#141008", 1.2);
      ellipse(ctx, 32, 94, 1.2, 1.2, "#ffd452");
      ellipse(ctx, 32, 100, 1.2, 1.2, "#ffd452");
      ellipse(ctx, 96, 94, 1.2, 1.2, "#ffd452");
      ellipse(ctx, 96, 100, 1.2, 1.2, "#ffd452");

      // 3. Cantilevered Timber Corbel Struts
      poly(ctx, [[38, 92], [45, 94], [32, 80], [24, 80]], linGrad(ctx, 24, 80, 45, 94, [[0, "#a46c34"], [1, "#44240c"]]), "#141008", 1.8);
      poly(ctx, [[90, 92], [83, 94], [96, 80], [104, 80]], linGrad(ctx, 83, 80, 104, 92, [[0, "#8c5624"], [1, "#361a06"]]), "#141008", 1.8);
      poly(ctx, [[58, 90], [70, 90], [72, 80], [56, 80]], linGrad(ctx, 56, 80, 72, 90, [[0, "#9c642e"], [1, "#3e1e0a"]]), "#141008", 1.8);

      // 4. Heavy Reinforced Timber Firing Platform (Y=68 to 82)
      rounded(ctx, 18, 68, 92, 14, 3, linGrad(ctx, 18, 68, 110, 82, [[0, "#c48846"], [0.25, "#96602c"], [0.75, "#623812"], [1, "#3a1e08"]]), "#141008", 2.6);

      // Woodgrain fibers
      ctx.strokeStyle = "rgba(45, 20, 6, 0.45)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(20, 72); ctx.lineTo(108, 72);
      ctx.moveTo(22, 76); ctx.lineTo(106, 76);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 235, 175, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(20, 69.5); ctx.lineTo(108, 69.5);
      ctx.stroke();

      // Platform iron edge studs
      for (const sx of [24, 40, 56, 72, 88, 104]) {
        ellipse(ctx, sx, 75, 1.4, 1.4, "#2a2622", "#141008", 1.0);
        ellipse(ctx, sx - 0.3, 74.7, 0.5, 0.5, "#ffd452");
      }

      // 5. Heavy Cast-Iron Turntable Carriage Base (Y=62 to 70)
      ellipse(ctx, 64, 66, 26, 7, linGrad(ctx, 38, 59, 90, 73, [[0, "#4e4844"], [0.5, "#2e2a26"], [1, "#161412"]]), "#141008", 2.2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(64, 65, 23, 5.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      for (const tx of [44, 54, 64, 74, 84]) {
        ellipse(ctx, tx, 66, 1.2, 1.2, "#d4aa44", "#141008", 0.8);
      }
    };

    const drawArtilleryProps128 = (ctx) => {
      // 1. Munitions on Platform
      // Black Powder Kegs on Left Platform (X=22, Y=52..67)
      rounded(ctx, 22, 52, 12, 15, 3, linGrad(ctx, 22, 52, 34, 67, [[0, "#8a502c"], [0.5, "#5a3014"], [1, "#2e1406"]]), "#141008", 1.8);
      // Iron Hoops on Keg
      ctx.strokeStyle = "#383430";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(22, 55); ctx.lineTo(34, 55);
      ctx.moveTo(22, 63); ctx.lineTo(34, 63);
      ctx.stroke();
      ctx.strokeStyle = "#e8b850";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(23, 56); ctx.lineTo(33, 56);
      ctx.stroke();

      // Second smaller powder keg behind
      rounded(ctx, 32, 48, 10, 13, 2.5, linGrad(ctx, 32, 48, 42, 61, [[0, "#7c4424"], [1, "#261004"]]), "#141008", 1.4);
      ctx.strokeStyle = "#383430";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(32, 51); ctx.lineTo(42, 51);
      ctx.moveTo(32, 58); ctx.lineTo(42, 58);
      ctx.stroke();

      // Pyramid Stack of Heavy Cast-Iron Cannonballs on Right Platform (X=86 to 102, Y=56 to 68)
      // Bottom row: 2 cannonballs
      ellipse(ctx, 88, 64, 4.5, 4.5, linGrad(ctx, 85, 60, 92, 68, [[0, "#56504a"], [0.4, "#2c2824"], [1, "#100e0c"]]), "#141008", 1.4);
      ellipse(ctx, 86.5, 62.5, 1.2, 1.2, "#ffffff");
      ellipse(ctx, 97, 64, 4.5, 4.5, linGrad(ctx, 94, 60, 101, 68, [[0, "#56504a"], [0.4, "#2c2824"], [1, "#100e0c"]]), "#141008", 1.4);
      ellipse(ctx, 95.5, 62.5, 1.2, 1.2, "#ffffff");
      // Top cannonball
      ellipse(ctx, 92.5, 57, 4.5, 4.5, linGrad(ctx, 89.5, 53, 96.5, 61, [[0, "#625a54"], [0.4, "#34302c"], [1, "#12100e"]]), "#141008", 1.4);
      ellipse(ctx, 91, 55.5, 1.3, 1.3, "#ffffff");

      // 2. Left Timber Shelter Canopy (Over powder kegs, Y=16 to 50)
      // Timber support post
      rounded(ctx, 20, 28, 5, 40, 1.5, linGrad(ctx, 20, 28, 25, 68, [[0, "#9c6834"], [1, "#44240a"]]), "#141008", 1.6);
      // Diagonal support brace
      poly(ctx, [[24, 38], [34, 28], [31, 28], [24, 44]], "#74461c", "#141008", 1.2);

      // Awning Roof Tiles (Terracotta & Cedar shingles)
      const awningPoly = [
        [12, 34],
        [36, 16],
        [60, 32],
        [54, 37],
        [36, 23],
        [16, 39],
      ];
      poly(ctx, awningPoly, linGrad(ctx, 36, 16, 36, 39, [[0, "#e88c3a"], [0.4, "#b45a1c"], [1, "#54240a"]]), "#141008", 2.6);

      // Shingle tile ridges & edge highlights
      ctx.strokeStyle = "rgba(255, 230, 180, 0.5)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(14, 34); ctx.lineTo(36, 17); ctx.lineTo(58, 32);
      ctx.stroke();

      ctx.strokeStyle = "rgba(40, 12, 4, 0.4)";
      ctx.lineWidth = 1.0;
      for (let i = 0; i < 4; i += 1) {
        const sx = 20 + i * 9;
        const sy = 33 - Math.abs(sx - 36) * 0.65;
        ctx.beginPath();
        ctx.moveTo(sx, sy); ctx.lineTo(sx + (sx < 36 ? -2 : 2), sy + 4);
        ctx.stroke();
      }
    };

    const drawArtilleryMortar128 = (ctx, isFire = false) => {
      if (!isFire) {
        // —— IDLE STATE: Iron Mortar Primed at 45° ——
        // Lazy wisp of fuse smoke from vent
        ellipse(ctx, 42, 36, 4.5, 3.5, "rgba(210,200,185,0.4)");
        ellipse(ctx, 38, 30, 6, 5, "rgba(210,200,185,0.3)");
        ellipse(ctx, 34, 23, 7, 5.5, "rgba(210,200,185,0.2)");

        // Trunnion Cheek Brackets (Holding the axle)
        poly(ctx, [[46, 64], [58, 64], [56, 46], [48, 46]], linGrad(ctx, 46, 46, 58, 64, [[0, "#56504a"], [1, "#1c1814"]]), "#141008", 2.0);
        poly(ctx, [[70, 64], [82, 64], [80, 46], [72, 46]], linGrad(ctx, 70, 46, 82, 64, [[0, "#48423c"], [1, "#141210"]]), "#141008", 2.0);

        // Heavy Cast-Iron Mortar Barrel (Angled from breech at 44,52 to muzzle at 76,28)
        const barrelPoly = [
          [38, 48],
          [48, 36],
          [74, 22],
          [84, 34],
          [58, 58],
          [44, 58],
        ];
        poly(ctx, barrelPoly, linGrad(ctx, 38, 22, 84, 58, [[0, "#6e665e"], [0.25, "#4e4842"], [0.65, "#2a2622"], [1, "#12100e"]]), "#141008", 2.8);

        // Spherical Breech Cascabell
        ellipse(ctx, 43, 53, 9, 8, linGrad(ctx, 36, 46, 50, 60, [[0, "#6e665e"], [0.5, "#3c3630"], [1, "#12100e"]]), "#141008", 2.2);
        ellipse(ctx, 36, 55, 3, 3, "#342e28", "#141008", 1.2);

        // Metallic Longitudinal Specular Sheen
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(46, 40); ctx.lineTo(76, 25);
        ctx.stroke();

        // Bronze Reinforce Hoops / Rings
        // Breech hoop
        ctx.strokeStyle = linGrad(ctx, 42, 44, 52, 54, [[0, "#ffd868"], [0.5, "#c49232"], [1, "#60400c"]]);
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(42, 43); ctx.lineTo(51, 54);
        ctx.stroke();

        // Mid-trunnion hoop
        ctx.strokeStyle = linGrad(ctx, 54, 34, 66, 46, [[0, "#ffd868"], [0.5, "#c49232"], [1, "#60400c"]]);
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(55, 33); ctx.lineTo(65, 45);
        ctx.stroke();

        // Trunnion axle bolt
        ellipse(ctx, 60, 48, 3.5, 3.5, "#d4a438", "#141008", 1.4);
        ellipse(ctx, 59, 47, 1.2, 1.2, "#fff0a0");

        // Flared Muzzle Ring & Dark Bore
        ellipse(ctx, 79, 28, 8, 10, linGrad(ctx, 72, 18, 86, 38, [[0, "#f8d06c"], [0.5, "#b88428"], [1, "#54340a"]]), "#141008", 2.4);
        // Inner Dark Rifled Bore Opening
        ellipse(ctx, 79, 28, 5.5, 7.5, linGrad(ctx, 74, 21, 84, 35, [[0, "#080604"], [1, "#1c140e"]]), "#141008", 1.8);
        ellipse(ctx, 80, 27, 3, 4, "#060402");
      } else {
        // —— FIRE STATE: Violent Recoil & Massive Volumetric Muzzle Flash ——
        // Recoil Vibration / Dust at base
        ctx.strokeStyle = "rgba(220, 180, 110, 0.7)";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(20, 70); ctx.lineTo(14, 76);
        ctx.moveTo(106, 70); ctx.lineTo(112, 76);
        ctx.stroke();

        // 3 Volumetric backblast smoke ellipses behind the barrel
        ellipse(ctx, 22, 60, 8, 6.5, "rgba(65,55,48,0.8)", "#141008", 1.2);
        ellipse(ctx, 16, 52, 9.5, 7.5, "rgba(85,75,66,0.7)", "#141008", 1.0);
        ellipse(ctx, 28, 48, 7.5, 6, "rgba(105,95,84,0.65)", "#141008", 1.0);

        // Recoiled Kicked-Back Barrel (Pitched up steeply, breech rammed down-left)
        const barrelPoly = [
          [28, 54],
          [40, 36],
          [62, 18],
          [74, 28],
          [52, 60],
          [36, 62],
        ];
        poly(ctx, barrelPoly, linGrad(ctx, 28, 18, 74, 62, [[0, "#7a7066"], [0.25, "#524a42"], [0.65, "#2e2822"], [1, "#14100c"]]), "#141008", 3.0);

        // Breech cascabell kicked down
        ellipse(ctx, 32, 58, 9, 8, linGrad(ctx, 25, 51, 39, 65, [[0, "#7a7066"], [0.5, "#403830"], [1, "#14100c"]]), "#141008", 2.2);

        // Glowing red-hot bronze bands
        ctx.strokeStyle = "#ffb040";
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(33, 47); ctx.lineTo(44, 58);
        ctx.moveTo(46, 34); ctx.lineTo(58, 47);
        ctx.stroke();

        // Recoil Breech Shockwave Arcs
        ctx.strokeStyle = "rgba(255, 190, 80, 0.85)";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(26, 56, 12, 2.1, 4.2);
        ctx.stroke();

        // Red-Hot Glowing Muzzle Lip
        ellipse(ctx, 68, 23, 9, 11, linGrad(ctx, 60, 12, 76, 34, [[0, "#fff0a0"], [0.4, "#ff8c20"], [1, "#941800"]]), "#141008", 2.6);
        ellipse(ctx, 68, 23, 5, 7, "#ff3800");

        // MASSIVE VOLUMETRIC MUZZLE FIREBALL (Expanding forward and up, breaking 128 box top-right)
        // Layer 1: Outer Roaring Crimson / Orange Flame Lobes with fat outline
        const flamePoly = [
          [68, 23],
          [82, 4],
          [100, -6],
          [122, -8],
          [136, 6],
          [138, 22],
          [128, 38],
          [108, 46],
          [88, 42],
          [76, 32],
        ];
        poly(ctx, flamePoly, linGrad(ctx, 68, 23, 138, 10, [[0, "#ffffff"], [0.2, "#ffe850"], [0.55, "#ff5500"], [0.85, "#cc1200"], [1, "#640400"]]), "#141008", 2.8);

        // Layer 2: Inner Incandescent Golden Core
        const corePoly = [
          [68, 23],
          [86, 9],
          [106, 0],
          [124, 6],
          [128, 20],
          [112, 32],
          [84, 29],
        ];
        poly(ctx, corePoly, linGrad(ctx, 68, 23, 128, 12, [[0, "#ffffff"], [0.45, "#fff280"], [1, "#ff8810"]]));

        // Layer 3: Blinding White Ignition Heart
        ellipse(ctx, 76, 21, 9, 8, "#ffffff");

        // Flying Burning Shrapnel Sparks & Embers (scattering top-right)
        for (const [bx, by, br] of [
          [134, -4, 2.6], [140, 12, 2.4], [132, 28, 2.2], [118, -10, 2.2],
          [124, 40, 2.0], [108, 50, 1.8], [98, -8, 2.0], [86, 0, 1.8],
          [114, 26, 2.2], [130, 4, 2.4]
        ]) {
          ellipse(ctx, bx, by, br, br, "#ffffff", "#141008", 1.0);
        }

        // Billowing Heavy Volumetric Gunpowder Smoke Clouds Curling Over Canopy
        ellipse(ctx, 84, 8, 12, 10, "rgba(70,62,54,0.85)", "#141008", 1.4);
        ellipse(ctx, 98, 2, 10, 8, "rgba(95,85,75,0.75)");
        ellipse(ctx, 66, 6, 11, 8, "rgba(80,72,64,0.8)");
        ellipse(ctx, 48, 10, 9, 7, "rgba(110,100,90,0.65)");
      }
    };

    const drawArtilleryIdle = (ctx) => {
      drawArtilleryRedoubt128(ctx);
      drawArtilleryProps128(ctx);
      drawArtilleryMortar128(ctx, false);
    };

    const drawArtilleryFire = (ctx) => {
      drawArtilleryRedoubt128(ctx);
      drawArtilleryProps128(ctx);
      drawArtilleryMortar128(ctx, true);
    };

    const drawArtilleryL2 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Scorched Berm
      shadow(ctx, 64, 116, 50, 12, 0.45);
      shadow(ctx, 64, 117, 38, 7, 0.6);

      ellipse(ctx, 64, 110, 48, 14, linGrad(ctx, 24, 96, 104, 122, [[0, "#5e4c34"], [0.4, "#3e301e"], [1, "#1c140a"]]), "#141008", 3.2);
      ctx.strokeStyle = "rgba(180, 140, 75, 0.35)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(64, 108, 44, 10, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      // 2. Heavy Dressed Quarry Stone Plinth with Riveted Iron Plates (Y=78 to 110)
      rounded(ctx, 28, 78, 72, 32, 4, linGrad(ctx, 28, 78, 100, 110, [[0, "#b89064"], [0.35, "#886240"], [0.75, "#583a22"], [1, "#321e10"]]), "#141008", 2.8);

      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(30, 88); ctx.lineTo(98, 88);
      ctx.moveTo(30, 98); ctx.lineTo(98, 98);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 235, 190, 0.35)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(30, 89.5); ctx.lineTo(98, 89.5);
      ctx.moveTo(30, 99.5); ctx.lineTo(98, 99.5);
      ctx.stroke();

      speckles(ctx, 30, 80, 68, 28, 28, "rgba(0,0,0,0.22)", 1.2);
      speckles(ctx, 30, 80, 68, 28, 16, "rgba(255,230,170,0.18)", 1.0);

      // Heavy Iron corner plates with square bolts
      rounded(ctx, 27, 86, 7, 18, 1.5, "#34302c", "#141008", 1.2);
      rounded(ctx, 94, 86, 7, 18, 1.5, "#34302c", "#141008", 1.2);
      for (const by of [90, 96, 101]) {
        ellipse(ctx, 30.5, by, 1.2, 1.2, "#ffd452");
        ellipse(ctx, 97.5, by, 1.2, 1.2, "#ffd452");
      }

      // 3. Cantilevered Timber Corbel Struts
      poly(ctx, [[36, 90], [43, 92], [30, 78], [22, 78]], linGrad(ctx, 22, 78, 43, 92, [[0, "#a46c34"], [1, "#44240c"]]), "#141008", 1.8);
      poly(ctx, [[92, 90], [85, 92], [98, 78], [106, 78]], linGrad(ctx, 85, 78, 106, 90, [[0, "#8c5624"], [1, "#361a06"]]), "#141008", 1.8);
      poly(ctx, [[56, 88], [72, 88], [74, 78], [54, 78]], linGrad(ctx, 54, 78, 74, 88, [[0, "#9c642e"], [1, "#3e1e0a"]]), "#141008", 1.8);

      // 4. Expanded Reinforced Timber Firing Platform (Y=66 to 80)
      rounded(ctx, 14, 66, 100, 14, 3, linGrad(ctx, 14, 66, 114, 80, [[0, "#c48846"], [0.25, "#96602c"], [0.75, "#623812"], [1, "#3a1e08"]]), "#141008", 2.6);
      ctx.strokeStyle = "rgba(255, 235, 175, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(16, 67.5); ctx.lineTo(112, 67.5);
      ctx.stroke();

      for (const sx of [20, 36, 52, 68, 84, 100]) {
        ellipse(ctx, sx, 73, 1.4, 1.4, "#2a2622", "#141008", 1.0);
        ellipse(ctx, sx - 0.3, 72.7, 0.5, 0.5, "#ffd452");
      }

      // Cast-Iron Turntable Carriage Base (Y=60 to 68)
      ellipse(ctx, 64, 64, 28, 7, linGrad(ctx, 36, 57, 92, 71, [[0, "#4e4844"], [0.5, "#2e2a26"], [1, "#161412"]]), "#141008", 2.2);
      for (const tx of [42, 53, 64, 75, 86]) {
        ellipse(ctx, tx, 64, 1.2, 1.2, "#d4aa44", "#141008", 0.8);
      }

      // 5. Left Dual Munitions Canopy & Stacked Barrels (X=12 to 50, Y=16 to 66)
      // Heavy timber posts
      rounded(ctx, 16, 26, 5, 42, 1.5, linGrad(ctx, 16, 26, 21, 68, [[0, "#9c6834"], [1, "#44240a"]]), "#141008", 1.6);
      rounded(ctx, 42, 28, 4, 38, 1.5, linGrad(ctx, 42, 28, 46, 66, [[0, "#8a5426"], [1, "#3c1e08"]]), "#141008", 1.4);

      // Multi-tier Shingle Roof Canopy
      const canopyL2 = [
        [10, 32],
        [32, 14],
        [54, 30],
        [48, 35],
        [32, 21],
        [14, 37],
      ];
      poly(ctx, canopyL2, linGrad(ctx, 32, 14, 32, 37, [[0, "#e88c3a"], [0.4, "#b45a1c"], [1, "#54240a"]]), "#141008", 2.6);
      ctx.strokeStyle = "rgba(255, 230, 180, 0.5)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(12, 32); ctx.lineTo(32, 15); ctx.lineTo(52, 30);
      ctx.stroke();

      // Stack of 3 Powder Barrels (2 on bottom, 1 on top)
      rounded(ctx, 18, 50, 11, 14, 2.5, linGrad(ctx, 18, 50, 29, 64, [[0, "#8a502c"], [1, "#2e1406"]]), "#141008", 1.4);
      rounded(ctx, 28, 50, 11, 14, 2.5, linGrad(ctx, 28, 50, 39, 64, [[0, "#7c4424"], [1, "#261004"]]), "#141008", 1.4);
      rounded(ctx, 23, 38, 11, 13, 2.5, linGrad(ctx, 23, 38, 34, 51, [[0, "#965830"], [1, "#321606"]]), "#141008", 1.4);

      // Barrel Iron Hoops with danger stripe
      for (const [bx, by] of [[18, 50], [28, 50], [23, 38]]) {
        ctx.strokeStyle = "#383430";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(bx, by + 3); ctx.lineTo(bx + 11, by + 3);
        ctx.moveTo(bx, by + 10); ctx.lineTo(bx + 11, by + 10);
        ctx.stroke();
      }

      // 6. Right Munitions Bay: Cannonballs & Pulley Crane (X=84 to 110, Y=26 to 68)
      // Timber Hoist Crane Post & Arm
      rounded(ctx, 102, 28, 4, 38, 1.5, linGrad(ctx, 102, 28, 106, 66, [[0, "#9c6834"], [1, "#44240a"]]), "#141008", 1.4);
      poly(ctx, [[90, 28], [106, 28], [106, 32], [90, 32]], "#8a5426", "#141008", 1.2);
      poly(ctx, [[96, 38], [104, 30], [104, 34], [98, 40]], "#6e3e18", "#141008", 1.0);
      // Pulley wheel & chain
      ellipse(ctx, 92, 33, 2.5, 2.5, "#d4aa44", "#141008", 1.0);
      ctx.strokeStyle = "#383430";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(92, 35); ctx.lineTo(92, 45);
      ctx.stroke();
      // Lifting tongs
      poly(ctx, [[89, 45], [95, 45], [94, 49], [90, 49]], "#2a2622", "#141008", 1.0);

      // Stacked Cannonball Pyramid on Right (4 cannonballs)
      ellipse(ctx, 84, 62, 4.5, 4.5, linGrad(ctx, 81, 58, 88, 66, [[0, "#56504a"], [1, "#100e0c"]]), "#141008", 1.4);
      ellipse(ctx, 82.5, 60.5, 1.2, 1.2, "#ffffff");
      ellipse(ctx, 93, 62, 4.5, 4.5, linGrad(ctx, 90, 58, 97, 66, [[0, "#56504a"], [1, "#100e0c"]]), "#141008", 1.4);
      ellipse(ctx, 91.5, 60.5, 1.2, 1.2, "#ffffff");
      ellipse(ctx, 102, 62, 4.5, 4.5, linGrad(ctx, 99, 58, 106, 66, [[0, "#56504a"], [1, "#100e0c"]]), "#141008", 1.4);
      ellipse(ctx, 100.5, 60.5, 1.2, 1.2, "#ffffff");
      ellipse(ctx, 88.5, 55, 4.5, 4.5, linGrad(ctx, 85.5, 51, 92.5, 59, [[0, "#625a54"], [1, "#12100e"]]), "#141008", 1.4);
      ellipse(ctx, 87, 53.5, 1.3, 1.3, "#ffffff");

      // 7. Reinforced Heavy Siege Mortar with 4 Bronze Bands (Y=20 to 58)
      // Fuse smoke
      ellipse(ctx, 40, 32, 4.5, 3.5, "rgba(210,200,185,0.4)");
      ellipse(ctx, 36, 26, 6, 5, "rgba(210,200,185,0.3)");
      ellipse(ctx, 32, 19, 7, 5.5, "rgba(210,200,185,0.2)");

      // Trunnion Cheek Brackets
      poly(ctx, [[44, 62], [58, 62], [56, 44], [46, 44]], linGrad(ctx, 44, 44, 58, 62, [[0, "#56504a"], [1, "#1c1814"]]), "#141008", 2.0);
      poly(ctx, [[70, 62], [84, 62], [82, 44], [72, 44]], linGrad(ctx, 70, 44, 84, 62, [[0, "#48423c"], [1, "#141210"]]), "#141008", 2.0);

      // Heavy Mortar Barrel
      const barrelL2 = [
        [36, 46],
        [46, 34],
        [74, 20],
        [86, 32],
        [60, 58],
        [44, 58],
      ];
      poly(ctx, barrelL2, linGrad(ctx, 36, 20, 86, 58, [[0, "#6e665e"], [0.25, "#4e4842"], [0.65, "#2a2622"], [1, "#12100e"]]), "#141008", 2.8);

      // Spherical Breech Cascabell
      ellipse(ctx, 41, 52, 9.5, 8.5, linGrad(ctx, 34, 45, 48, 59, [[0, "#6e665e"], [0.5, "#3c3630"], [1, "#12100e"]]), "#141008", 2.2);
      ellipse(ctx, 34, 54, 3.2, 3.2, "#342e28", "#141008", 1.2);

      // 4 Heavy Bronze Reinforcement Hoops
      for (const [hx0, hy0, hx1, hy1, hw] of [
        [40, 42, 49, 53, 3.0],
        [48, 34, 58, 47, 3.2],
        [58, 27, 68, 40, 3.2],
        [68, 21, 78, 33, 3.4],
      ]) {
        ctx.strokeStyle = linGrad(ctx, hx0, hy0, hx1, hy1, [[0, "#ffd868"], [0.5, "#c49232"], [1, "#60400c"]]);
        ctx.lineWidth = hw;
        ctx.beginPath();
        ctx.moveTo(hx0, hy0); ctx.lineTo(hx1, hy1);
        ctx.stroke();
      }

      // Trunnion axle bolt & elevation handwheel
      ellipse(ctx, 60, 47, 4, 4, "#d4a438", "#141008", 1.4);
      ellipse(ctx, 59, 46, 1.4, 1.4, "#fff0a0");

      // Flared Muzzle Ring & Rifled Dark Bore
      ellipse(ctx, 80, 26, 8.5, 11, linGrad(ctx, 72, 16, 88, 36, [[0, "#f8d06c"], [0.5, "#b88428"], [1, "#54340a"]]), "#141008", 2.6);
      ellipse(ctx, 80, 26, 6, 8, linGrad(ctx, 74, 19, 86, 33, [[0, "#080604"], [1, "#1c140e"]]), "#141008", 1.8);
      ellipse(ctx, 81, 25, 3.5, 4.5, "#060402");
    };

    const drawArtilleryL3 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Scorched Heavy Foundation Mound
      shadow(ctx, 64, 116, 52, 13, 0.5);
      shadow(ctx, 64, 117, 40, 7, 0.65);

      ellipse(ctx, 64, 110, 50, 15, linGrad(ctx, 20, 96, 108, 122, [[0, "#52422e"], [0.4, "#362818"], [1, "#181008"]]), "#141008", 3.2);
      ctx.strokeStyle = "rgba(200, 160, 90, 0.4)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(64, 108, 46, 11, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      // 2. Heavy Bastioned Granite Redoubt with Dwarven Iron Plating (Y=72 to 112)
      rounded(ctx, 24, 72, 80, 38, 4, linGrad(ctx, 24, 72, 104, 110, [[0, "#b89468"], [0.35, "#86603c"], [0.75, "#52361e"], [1, "#2c1a0c"]]), "#141008", 2.8);

      // Stone block courses
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(26, 82); ctx.lineTo(102, 82);
      ctx.moveTo(26, 92); ctx.lineTo(102, 92);
      ctx.moveTo(26, 102); ctx.lineTo(102, 102);
      ctx.stroke();

      speckles(ctx, 26, 74, 76, 34, 30, "rgba(0,0,0,0.24)", 1.2);
      speckles(ctx, 26, 74, 76, 34, 18, "rgba(255,230,170,0.2)", 1.0);

      // Dwarven Iron Armor Plating & Heavy Rivets
      for (const [px, py, pw, ph] of [
        [24, 76, 10, 32],
        [94, 76, 10, 32],
        [50, 84, 28, 24],
      ]) {
        rounded(ctx, px, py, pw, ph, 2, linGrad(ctx, px, py, px + pw, py + ph, [[0, "#484440"], [0.5, "#2a2622"], [1, "#141210"]]), "#141008", 1.6);
        ctx.strokeStyle = "rgba(255, 215, 100, 0.4)";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(px + 1.5, py + 1.5, pw - 3, ph - 3);
        ellipse(ctx, px + 3, py + 4, 1.2, 1.2, "#ffd452");
        ellipse(ctx, px + pw - 3, py + 4, 1.2, 1.2, "#ffd452");
        ellipse(ctx, px + 3, py + ph - 4, 1.2, 1.2, "#ffd452");
        ellipse(ctx, px + pw - 3, py + ph - 4, 1.2, 1.2, "#ffd452");
      }

      // 3. Full-Width Armored Battery Gun-Deck & Steel Blast Mantlets (Y=58 to 76)
      rounded(ctx, 12, 60, 104, 16, 3, linGrad(ctx, 12, 60, 116, 76, [[0, "#cca054"], [0.25, "#9e6830"], [0.75, "#643c14"], [1, "#3c1e08"]]), "#141008", 2.6);

      // Crenellated Steel Blast Shields along rim
      for (const bx of [16, 32, 48, 64, 80, 96]) {
        rounded(ctx, bx, 56, 12, 8, 1.5, linGrad(ctx, bx, 56, bx + 12, 64, [[0, "#5a544e"], [1, "#201c18"]]), "#141008", 1.4);
        ellipse(ctx, bx + 6, 60, 1.2, 1.2, "#ffd452");
      }

      // Massive Geared Steel Turntable Platform Base
      ellipse(ctx, 64, 58, 30, 8, linGrad(ctx, 34, 50, 94, 66, [[0, "#5c5650"], [0.5, "#34302c"], [1, "#181412"]]), "#141008", 2.4);
      for (const tx of [38, 48, 58, 70, 80, 90]) {
        ellipse(ctx, tx, 58, 1.4, 1.4, "#ffd452", "#141008", 0.8);
      }

      // 4. Steaming Boiler Furnace Stack on Left (X=14 to 36, Y=14 to 62)
      // Cylindrical Iron Furnace Body
      rounded(ctx, 16, 30, 18, 30, 3, linGrad(ctx, 16, 30, 34, 60, [[0, "#48423c"], [0.5, "#2c2824"], [1, "#141210"]]), "#141008", 1.8);
      // Glowing Firebox Grate Door
      rounded(ctx, 20, 46, 10, 10, 2, "#180802", "#141008", 1.2);
      ellipse(ctx, 25, 51, 3.5, 3.5, radGrad(ctx, 25, 51, 1, 4, [[0, "#ffffff"], [0.4, "#ff8c18"], [1, "rgba(200,20,0,0)"]]));

      // Chimney Stack Pipe & Cap (Y=12 to 32)
      poly(ctx, [[21, 30], [29, 30], [28, 14], [22, 14]], linGrad(ctx, 21, 14, 29, 30, [[0, "#56504a"], [1, "#24201c"]]), "#141008", 1.4);
      ellipse(ctx, 25, 14, 5, 2.5, "#34302c", "#141008", 1.2);

      // Volumetric Dark Coal Smoke Clouds & Fiery Sparks
      ellipse(ctx, 24, 6, 8, 6, "rgba(60,54,48,0.75)");
      ellipse(ctx, 18, 0, 7, 5, "rgba(80,74,68,0.65)");
      ellipse(ctx, 30, -2, 6, 4.5, "rgba(95,88,80,0.55)");
      ellipse(ctx, 23, 10, 1.2, 1.2, "#ffb040");
      ellipse(ctx, 27, 7, 1.0, 1.0, "#ff8810");

      // 5. Armored Munitions Bunker on Right (X=86 to 114, Y=30 to 62)
      // Steel-Plated Ammo Chest
      rounded(ctx, 88, 44, 24, 16, 2, linGrad(ctx, 88, 44, 112, 60, [[0, "#524c46"], [0.5, "#302c28"], [1, "#161412"]]), "#141008", 1.6);
      ctx.strokeStyle = "#ffd452";
      ctx.lineWidth = 0.8;
      ctx.strokeRect(89.5, 45.5, 21, 13);

      // Giant Armor-Piercing Artillery Shells (3 massive golden brass shells)
      for (const [sx, sy] of [[92, 34], [99, 34], [106, 34]]) {
        poly(ctx, [[sx, sy + 12], [sx + 5, sy + 12], [sx + 5, sy + 4], [sx + 2.5, sy], [sx, sy + 4]], linGrad(ctx, sx, sy, sx + 5, sy + 12, [[0, "#ffe074"], [0.5, "#d49a2a"], [1, "#6a4008"]]), "#141008", 1.2);
        ellipse(ctx, sx + 2.5, sy + 2, 0.8, 0.8, "#ffffff");
      }

      // Overhead Heavy Loading Crane Arm (X=84 to 110, Y=18 to 36)
      rounded(ctx, 106, 18, 5, 42, 1.5, linGrad(ctx, 106, 18, 111, 60, [[0, "#9c6834"], [1, "#44240a"]]), "#141008", 1.6);
      poly(ctx, [[88, 18], [110, 18], [110, 23], [88, 23]], "#484440", "#141008", 1.4);
      ellipse(ctx, 92, 24, 3, 3, "#ffd452", "#141008", 1.0);

      // 6. Colossal Titan Siege Cannon / Dreadnought Bombard (Y=14 to 58)
      // Pneumatic Hydraulic Recoil Dampers under barrel
      poly(ctx, [[42, 54], [62, 40], [64, 43], [44, 57]], linGrad(ctx, 42, 40, 64, 57, [[0, "#8a8278"], [1, "#302c28"]]), "#141008", 1.4);

      // Giant Cast-Iron Bombard Barrel (Pitched at 40°)
      const titanBarrel = [
        [32, 44],
        [44, 30],
        [78, 14],
        [92, 28],
        [64, 56],
        [42, 56],
      ];
      poly(ctx, titanBarrel, linGrad(ctx, 32, 14, 92, 56, [[0, "#7a7268"], [0.25, "#524a42"], [0.65, "#2c2622"], [1, "#12100e"]]), "#141008", 3.2);

      // Massive Spherical Breech Cascabell
      ellipse(ctx, 38, 50, 11, 10, linGrad(ctx, 30, 42, 46, 58, [[0, "#7a7268"], [0.5, "#423a32"], [1, "#14100c"]]), "#141008", 2.4);
      ellipse(ctx, 29, 52, 4, 4, "#3a342c", "#141008", 1.4);

      // 5 Ornate Golden-Bronze Reinforce Hoops
      for (const [hx0, hy0, hx1, hy1, hw] of [
        [37, 40, 48, 52, 3.4],
        [46, 32, 58, 45, 3.6],
        [56, 25, 68, 38, 3.6],
        [66, 19, 78, 32, 3.8],
        [76, 14, 86, 26, 4.0],
      ]) {
        ctx.strokeStyle = linGrad(ctx, hx0, hy0, hx1, hy1, [[0, "#ffe478"], [0.45, "#d49e32"], [1, "#6a400c"]]);
        ctx.lineWidth = hw;
        ctx.beginPath();
        ctx.moveTo(hx0, hy0); ctx.lineTo(hx1, hy1);
        ctx.stroke();
      }

      // Trunnion axle bolt & heavy gear
      ellipse(ctx, 58, 45, 5, 5, "#ffd452", "#141008", 1.6);
      ellipse(ctx, 57, 44, 1.8, 1.8, "#ffffff");

      // Colossal Flared Golden Muzzle Ring & Menacing Rifled Bore
      ellipse(ctx, 86, 21, 10, 13, linGrad(ctx, 76, 10, 96, 32, [[0, "#ffe880"], [0.45, "#c89028"], [1, "#543008"]]), "#141008", 2.8);
      ellipse(ctx, 86, 21, 7, 9.5, linGrad(ctx, 80, 13, 92, 29, [[0, "#040202"], [1, "#18100c"]]), "#141008", 2.0);
      ellipse(ctx, 87, 20, 4, 5.5, "#000000");

      // 7. Twin Industrial Battle Standards with Crossed Cannon Crests
      // Left Flag
      poly(ctx, [[14, 46], [28, 46], [26, 68], [21, 63], [14, 69]], linGrad(ctx, 14, 46, 28, 69, [[0, "#b82414"], [0.5, "#801206"], [1, "#400402"]]), "#141008", 1.4);
      ctx.strokeStyle = "#ffd452";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(15, 47); ctx.lineTo(15, 67); ctx.lineTo(21, 62); ctx.lineTo(25, 66); ctx.lineTo(27, 47);
      ctx.stroke();
      ellipse(ctx, 21, 56, 2.5, 2.5, "#ffd452", "#141008", 0.8);

      // Right Flag
      poly(ctx, [[100, 46], [114, 46], [114, 69], [107, 63], [102, 68]], linGrad(ctx, 100, 46, 114, 69, [[0, "#b82414"], [0.5, "#801206"], [1, "#400402"]]), "#141008", 1.4);
      ctx.strokeStyle = "#ffd452";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(101, 47); ctx.lineTo(103, 66); ctx.lineTo(107, 62); ctx.lineTo(113, 67); ctx.lineTo(113, 47);
      ctx.stroke();
      ellipse(ctx, 107, 56, 2.5, 2.5, "#ffd452", "#141008", 0.8);
    };

    make("tower_artillery_idle", 128, 128, drawArtilleryIdle);
    make("tower_artillery", 128, 128, drawArtilleryIdle);
    make("tower_artillery_l2", 128, 128, drawArtilleryL2);
    make("tower_artillery_l3", 128, 128, drawArtilleryL3);
    make("tower_artillery_fire", 128, 128, drawArtilleryFire);

    // —— Fort Keep / Barracks (128×128 detailed rebuild) ——
    const drawBarracksKeep128 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Grassy Rampart Berm
      shadow(ctx, 64, 118, 52, 13, 0.52);
      shadow(ctx, 64, 119, 40, 8, 0.6);
      ellipse(ctx, 64, 110, 50, 15, linGrad(ctx, 24, 96, 104, 122, [[0, "#5a7036"], [0.4, "#3e4f24"], [1, "#1c2610"]]), "#141008", 3.2);
      ctx.strokeStyle = "rgba(160, 215, 80, 0.4)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(64, 108, 44, 10, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      // Foundation boulders embedded in turf
      ellipse(ctx, 26, 114, 5, 3, "#686a5a", "#141008", 1.2);
      ellipse(ctx, 38, 118, 5.5, 3.2, "#585a4a", "#141008", 1.2);
      ellipse(ctx, 90, 116, 5, 3.2, "#5c5e4e", "#141008", 1.2);
      ellipse(ctx, 100, 113, 4, 2.5, "#6c6e5e", "#141008", 1.2);

      // 2. Heavy Dressed Fortress Stone Plinth (Foundation Y=82 to 112)
      rounded(ctx, 30, 82, 68, 30, 4, linGrad(ctx, 30, 82, 98, 112, [[0, "#c6b480"], [0.35, "#988452"], [0.75, "#66542e"], [1, "#3c2e16"]]), "#141008", 2.8);

      // Stone block mortar courses
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(32, 92); ctx.lineTo(96, 92);
      ctx.moveTo(32, 102); ctx.lineTo(96, 102);
      ctx.stroke();

      // Stone block top bevel highlights
      ctx.strokeStyle = "rgba(255, 245, 205, 0.35)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(32, 93.5); ctx.lineTo(96, 93.5);
      ctx.moveTo(32, 103.5); ctx.lineTo(96, 103.5);
      ctx.stroke();

      // Vertical mortar joints
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(46, 83); ctx.lineTo(46, 92);
      ctx.moveTo(80, 83); ctx.lineTo(80, 92);
      ctx.moveTo(38, 92); ctx.lineTo(38, 102);
      ctx.moveTo(64, 92); ctx.lineTo(64, 102);
      ctx.moveTo(90, 92); ctx.lineTo(90, 102);
      ctx.moveTo(50, 102); ctx.lineTo(50, 111);
      ctx.moveTo(76, 102); ctx.lineTo(76, 111);
      ctx.stroke();

      speckles(ctx, 32, 84, 64, 26, 24, "rgba(0,0,0,0.18)", 1.2);
      speckles(ctx, 32, 84, 64, 26, 14, "rgba(255,245,210,0.2)", 1.0);

      // 3. Solid Stone Keep Tower Body (Y=42 to 86)
      rounded(ctx, 28, 42, 72, 44, 4, linGrad(ctx, 28, 42, 100, 86, [[0, "#dac890"], [0.3, "#ac965e"], [0.7, "#766236"], [1, "#44361a"]]), "#141008", 2.8);

      // Corner stone quoins (interlocking corner blocks)
      const quoins = [
        [28, 44, 8, 7], [28, 53, 11, 7], [28, 62, 8, 7], [28, 71, 11, 7],
        [92, 44, 8, 7], [89, 53, 11, 7], [92, 62, 8, 7], [89, 71, 11, 7],
      ];
      for (const [qx, qy, qw, qh] of quoins) {
        rounded(ctx, qx, qy, qw, qh, 1.5, linGrad(ctx, qx, qy, qx + qw, qy + qh, [[0, "#eedcaa"], [1, "#867240"]]), "#141008", 1.2);
      }

      // Arrow loops / crosslet embrasures on flank walls
      // Left arrow loop
      rounded(ctx, 38, 54, 4, 12, 1.5, "#141008", "#141008", 1);
      rounded(ctx, 35, 58, 10, 3, 1, "#141008", "#141008", 1);
      // Right arrow loop
      rounded(ctx, 86, 54, 4, 12, 1.5, "#141008", "#141008", 1);
      rounded(ctx, 83, 58, 10, 3, 1, "#141008", "#141008", 1);

      // 4. Machicolations / Corbel Course (Y=34 to 44)
      for (let i = 0; i < 5; i += 1) {
        const cx = 32 + i * 16;
        poly(ctx, [[cx - 4, 44], [cx + 4, 44], [cx + 6, 36], [cx - 6, 36]], linGrad(ctx, cx - 6, 36, cx + 6, 44, [[0, "#eedcaa"], [1, "#7c6838"]]), "#141008", 1.4);
      }

      // Parapet Base Stringcourse Beam
      rounded(ctx, 22, 34, 84, 8, 2, linGrad(ctx, 22, 34, 106, 42, [[0, "#f0deaa"], [0.35, "#beaa70"], [1, "#66542a"]]), "#141008", 2.2);

      // 5. Crenellated Merlons (5 Battlement teeth, Y=18 to 36)
      for (let i = 0; i < 5; i += 1) {
        const mx = 24 + i * 16.5;
        // Merlon block
        rounded(ctx, mx, 20, 13, 16, 2, linGrad(ctx, mx, 20, mx + 13, 36, [[0, "#faeab6"], [0.4, "#c8b478"], [1, "#746234"]]), "#141008", 2.0);
        // Merlon capstone coping
        rounded(ctx, mx - 1, 18, 15, 4, 1.5, "#fff2c8", "#141008", 1.2);
        // Merlon center arrow slit
        rounded(ctx, mx + 5, 23, 3, 7, 1, "#141008");
      }
    };

    const drawBarracksGate128 = (ctx, isFire = false) => {
      // Grand Arched Stone Portal (Center 64, Y=56 to 92)
      // Dressed Stone Portal Frame
      poly(
        ctx,
        [[44, 90], [44, 68], [64, 54], [84, 68], [84, 90], [80, 90], [80, 70], [64, 58], [48, 70], [48, 90]],
        linGrad(ctx, 44, 54, 84, 90, [[0, "#fae6b4"], [0.5, "#b8a064"], [1, "#5c4a24"]]),
        "#141008",
        2.4
      );

      // Stone Keystone at apex
      poly(ctx, [[60, 58], [68, 58], [70, 51], [58, 51]], "#fff4c8", "#141008", 1.4);

      // Stone threshold step
      rounded(ctx, 44, 89, 40, 5, 1.5, "#685834", "#141008", 1.4);

      if (!isFire) {
        // —— IDLE GATE: Fortified Oak Double Doors Closed ——
        // Doorway shadow recess
        rounded(ctx, 48, 60, 32, 30, 4, "#141008");

        // Left Oak Door Leaf
        rounded(ctx, 49, 62, 14.5, 27, 2, linGrad(ctx, 49, 62, 63.5, 89, [[0, "#4a2a14"], [0.5, "#321a0a"], [1, "#1c0e04"]]), "#141008", 1.4);
        // Right Oak Door Leaf
        rounded(ctx, 64.5, 62, 14.5, 27, 2, linGrad(ctx, 64.5, 62, 79, 89, [[0, "#422410"], [0.5, "#2a1408"], [1, "#140802"]]), "#141008", 1.4);

        // Vertical timber plank lines
        ctx.strokeStyle = "#141008";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(56, 63); ctx.lineTo(56, 88);
        ctx.moveTo(71.5, 63); ctx.lineTo(71.5, 88);
        ctx.stroke();

        // Heavy Wrought-Iron Strap Hinges across both leaves
        for (const hy of [67, 81]) {
          poly(ctx, [[49, hy], [61, hy], [62, hy + 2], [49, hy + 2]], "#282420", "#141008", 1.0);
          poly(ctx, [[79, hy], [67, hy], [66, hy + 2], [79, hy + 2]], "#282420", "#141008", 1.0);
          ellipse(ctx, 52, hy + 1, 0.9, 0.9, "#ffd452");
          ellipse(ctx, 59, hy + 1, 0.9, 0.9, "#ffd452");
          ellipse(ctx, 69, hy + 1, 0.9, 0.9, "#ffd452");
          ellipse(ctx, 76, hy + 1, 0.9, 0.9, "#ffd452");
        }

        // Iron Ring Pull Handles & Center Lock Plate
        ellipse(ctx, 61.5, 75, 2, 2.5, "#24201c", "#141008", 1.2);
        ellipse(ctx, 66.5, 75, 2, 2.5, "#24201c", "#141008", 1.2);
        ellipse(ctx, 64, 75, 1.2, 1.2, "#ffd452");

        // Portcullis Grille in arch transom
        ctx.strokeStyle = "#141008";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(54, 58); ctx.lineTo(54, 63);
        ctx.moveTo(64, 55); ctx.lineTo(64, 63);
        ctx.moveTo(74, 58); ctx.lineTo(74, 63);
        ctx.moveTo(50, 60); ctx.lineTo(78, 60);
        ctx.stroke();
      } else {
        // —— FIRE STATE: Gate Swung Wide & Golden Muster Light Surge ——
        // Open door portal glowing with blazing muster radiance
        rounded(ctx, 48, 60, 32, 30, 4, linGrad(ctx, 48, 60, 80, 90, [[0, "#ffffff"], [0.35, "#ffea74"], [0.75, "#ff9418"], [1, "#8a3406"]]), "#141008", 2.2);
        ellipse(ctx, 64, 76, 12, 16, radGrad(ctx, 64, 74, 2, 16, [[0, "#ffffff"], [0.5, "#fff0a0"], [1, "rgba(255,140,20,0)"]]));

        // Golden light spilled onto threshold
        ellipse(ctx, 64, 91, 16, 5, "rgba(255, 235, 120, 0.7)");

        // Left open door leaf angled inward
        poly(ctx, [[48, 63], [54, 65], [54, 88], [48, 86]], "#2c160a", "#141008", 1.4);
        // Right open door leaf angled inward
        poly(ctx, [[80, 63], [74, 65], [74, 88], [80, 86]], "#241006", "#141008", 1.4);
        // Left Guard (x=56) — moa2735 synth 1.0.104
        poly(ctx, [[54, 60], [62, 60], [63, 64], [57, 64]], "#d4af37", "#141008", 1.2);
        poly(ctx, [[55, 61.5], [62.5, 61.5], [62.8, 63], [56.2, 63]], "#141008");
        poly(ctx, [[53, 65], [63, 65], [64, 76], [52, 76]], "#8b0000", "#141008", 1.2);
        poly(ctx, [[54, 77], [58, 77], [57, 86], [53, 86]], "#d4af37", "#141008", 1.2);
        poly(ctx, [[60, 77], [64, 77], [65, 86], [61, 86]], "#d4af37", "#141008", 1.2);
        poly(ctx, [[47, 65], [53, 64], [54, 76], [48, 77]], "#d4af37", "#141008", 1.2);
        poly(ctx, [[49, 50], [51, 49], [50, 86], [48, 87]], "#d4af37", "#141008", 1.2);
        poly(ctx, [[49, 50], [51, 49], [50, 46]], "#d4af37", "#141008", 1.2);
        // Right Guard (x=72, ahead)
        poly(ctx, [[70, 63], [78, 63], [79, 67], [73, 67]], "#d4af37", "#141008", 1.2);
        poly(ctx, [[71, 64.5], [78.5, 64.5], [78.8, 66], [72.2, 66]], "#141008");
        poly(ctx, [[69, 68], [79, 68], [80, 79], [68, 79]], "#8b0000", "#141008", 1.2);
        poly(ctx, [[70, 80], [74, 80], [73, 89], [69, 89]], "#d4af37", "#141008", 1.2);
        poly(ctx, [[76, 80], [80, 80], [81, 89], [77, 89]], "#d4af37", "#141008", 1.2);
        poly(ctx, [[68, 68], [74, 67], [75, 79], [69, 80]], "#d4af37", "#141008", 1.2);
        poly(ctx, [[85, 53], [87, 52], [86, 89], [84, 90]], "#d4af37", "#141008", 1.2);
        poly(ctx, [[85, 53], [87, 52], [86, 49]], "#d4af37", "#141008", 1.2);
      }
    };

    const drawBarracksProps128 = (ctx, isFire = false) => {
      // 1. Knightly Heraldic Heater Shield mounted above gate (Center 64, Y=42 to 58)
      const shieldPoly = [
        [54, 42],
        [74, 42],
        [72, 52],
        [64, 59],
        [56, 52],
      ];
      poly(ctx, shieldPoly, linGrad(ctx, 54, 42, 74, 59, [[0, "#ffffff"], [0.3, "#f4d060"], [1, "#9c7018"]]), "#141008", 2.2);

      // Heraldic Field: Royal Crimson & Azure Quartered or Crimson with Gold Chevron
      poly(ctx, [[56, 44], [72, 44], [70, 51], [64, 56], [58, 51]], "#c42418");
      // Golden Chevron & Cross
      ctx.strokeStyle = "#ffe670";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(58, 46); ctx.lineTo(64, 52); ctx.lineTo(70, 46);
      ctx.moveTo(64, 44); ctx.lineTo(64, 55);
      ctx.stroke();
      ellipse(ctx, 64, 48, 1.5, 1.5, "#ffffff");

      if (isFire) {
        // Divine Valor Aura around Shield
        ellipse(ctx, 64, 50, 16, 14, radGrad(ctx, 64, 50, 2, 16, [[0, "rgba(255,255,255,0.8)"], [0.5, "rgba(255,220,90,0.5)"], [1, "rgba(255,180,30,0)"]]));
      }

      // 2. Torch Sconces on Flanking Walls
      // Left Torch (X=33, Y=56..72)
      rounded(ctx, 31, 62, 3.5, 12, 1, "#36302a", "#141008", 1.0);
      // Right Torch (X=93, Y=56..72)
      rounded(ctx, 93.5, 62, 3.5, 12, 1, "#36302a", "#141008", 1.0);

      if (!isFire) {
        // Idle Torches
        ellipse(ctx, 33, 58, 4.5, 6, radGrad(ctx, 33, 57, 1, 6, [[0, "#ffffff"], [0.4, "#ffa820"], [1, "rgba(200,40,0,0)"]]));
        ellipse(ctx, 95, 58, 4.5, 6, radGrad(ctx, 95, 57, 1, 6, [[0, "#ffffff"], [0.4, "#ffa820"], [1, "rgba(200,40,0,0)"]]));

        // Idle Flagpole & Pennant on Left Battlement (X=36, Y=4 to 22)
        ctx.strokeStyle = "#141008";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(36, 22); ctx.lineTo(36, 4);
        ctx.stroke();
        poly(ctx, [[36, 2], [38, 6], [36, 5], [34, 6]], "#ffd860", "#141008", 1.0);

        // Small swallowtail pennant
        poly(ctx, [[36, 6], [54, 9], [48, 15], [54, 21], [36, 18]], linGrad(ctx, 36, 6, 54, 21, [[0, "#d83424"], [0.6, "#9e1810"], [1, "#540804"]]), "#141008", 1.4);
        ctx.strokeStyle = "#ffd854";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(38, 12); ctx.lineTo(46, 12);
        ctx.stroke();
      } else {
        // —— FIRE STATE: War Horn Sounding, Massive War Banner, Roaring Torches ——
        // Roaring high flame bursts
        ellipse(ctx, 33, 55, 7, 10, radGrad(ctx, 33, 53, 1, 9, [[0, "#ffffff"], [0.35, "#fff0a0"], [0.7, "#ff7818"], [1, "rgba(200,20,0,0)"]]));
        ellipse(ctx, 95, 55, 7, 10, radGrad(ctx, 95, 53, 1, 9, [[0, "#ffffff"], [0.35, "#fff0a0"], [0.7, "#ff7818"], [1, "rgba(200,20,0,0)"]]));
        ellipse(ctx, 31, 46, 1.5, 1.5, "#fff0a0");
        ellipse(ctx, 97, 46, 1.5, 1.5, "#fff0a0");

        // Tall Iron Flagpole with Gold Spearhead Finial (X=34, Y=-6 to 24)
        ctx.strokeStyle = "#141008";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(34, 24); ctx.lineTo(34, -4);
        ctx.stroke();
        poly(ctx, [[34, -8], [37, -2], [34, -4], [31, -2]], "#fff080", "#141008", 1.2);

        // Grand Billowing Crimson & Gold War Standard (X=34 to 76, Y=-4 to 26)
        const bannerPoly = [
          [34, -3],
          [74, -5],
          [64, 8],
          [76, 22],
          [34, 15],
        ];
        poly(ctx, bannerPoly, linGrad(ctx, 34, -5, 76, 22, [[0, "#ea3826"], [0.45, "#b81c10"], [1, "#640a06"]]), "#141008", 2.2);

        // Golden Embroidered Chevron Crest on War Standard
        ctx.strokeStyle = "#ffe868";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(42, 0); ctx.lineTo(54, 8); ctx.lineTo(42, 14);
        ctx.stroke();
        ellipse(ctx, 54, 8, 2, 2, "#ffffff", "#141008", 1.0);

        // Sounding Brass War Horn at Right Battlement (X=78 to 102, Y=6 to 20)
        poly(ctx, [[76, 18], [84, 13], [98, 7], [101, 12], [86, 18], [76, 21]], linGrad(ctx, 76, 7, 101, 21, [[0, "#fff090"], [0.5, "#e0b034"], [1, "#805814"]]), "#141008", 1.6);
        ellipse(ctx, 100, 9.5, 3.5, 6, "#3c2008", "#141008", 1.5);

        // Concentric Expanding Acoustic Rally Shockwaves
        ctx.strokeStyle = "#ffe880";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(100, 9.5, 9, -0.85, 0.85);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 230, 120, 0.75)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(100, 9.5, 16, -0.85, 0.85);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 210, 90, 0.45)";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(100, 9.5, 23, -0.85, 0.85);
        ctx.stroke();
      }
    };

    const drawBarracksIdle = (ctx) => {
      drawBarracksKeep128(ctx);
      drawBarracksGate128(ctx, false);
      drawBarracksProps128(ctx, false);
    };

    const drawBarracksFire = (ctx) => {
      drawBarracksKeep128(ctx);
      drawBarracksGate128(ctx, true);
      drawBarracksProps128(ctx, true);
    };

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

    const drawBarracksL3 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Monumental Rampart Berm
      shadow(ctx, 64, 116, 54, 13, 0.48);
      shadow(ctx, 64, 117, 42, 7, 0.62);

      ellipse(ctx, 64, 110, 52, 15, linGrad(ctx, 18, 96, 110, 122, [[0, "#5a7238"], [0.4, "#3e5226"], [1, "#1a240e"]]), "#141008", 3.2);
      ctx.strokeStyle = "rgba(160, 220, 85, 0.45)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(64, 108, 48, 11, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      // 2. Monumental Fortress Foundation (Y=72 to 112)
      rounded(ctx, 22, 72, 84, 40, 4, linGrad(ctx, 22, 72, 106, 112, [[0, "#d0be88"], [0.35, "#9e8c56"], [0.75, "#6a5830"], [1, "#3c2e16"]]), "#141008", 2.8);

      // Stone block mortar courses
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(24, 82); ctx.lineTo(104, 82);
      ctx.moveTo(24, 92); ctx.lineTo(104, 92);
      ctx.moveTo(24, 102); ctx.lineTo(104, 102);
      ctx.stroke();

      speckles(ctx, 24, 74, 80, 36, 32, "rgba(0,0,0,0.18)", 1.2);
      speckles(ctx, 24, 74, 80, 36, 18, "rgba(255,245,210,0.22)", 1.0);

      // 3. Soaring Twin Flank Battle Spire Towers (Left X=10..36, Right X=92..118, Y=10 to 76)
      // Left Spire Tower Body
      rounded(ctx, 12, 24, 24, 54, 3, linGrad(ctx, 12, 24, 36, 78, [[0, "#eedcaa"], [0.4, "#b09c64"], [1, "#5c4a24"]]), "#141008", 2.4);
      rounded(ctx, 20, 34, 6, 12, 2, "#141008", "#141008", 1.0);
      rounded(ctx, 20, 54, 6, 12, 2, "#141008", "#141008", 1.0);

      // Left Spire Conical Roof (Slate/Copper, Y=6 to 24)
      poly(ctx, [[8, 24], [24, 6], [40, 24]], linGrad(ctx, 8, 6, 40, 24, [[0, "#4878a8"], [0.5, "#2a4e76"], [1, "#142c48"]]), "#141008", 2.4);
      ellipse(ctx, 24, 6, 3, 3, "#ffd452", "#141008", 1.2);
      poly(ctx, [[24, 0], [25.5, 4], [24, 6], [22.5, 4]], "#ffd452");

      // Right Spire Tower Body
      rounded(ctx, 92, 24, 24, 54, 3, linGrad(ctx, 92, 24, 116, 78, [[0, "#eedcaa"], [0.4, "#b09c64"], [1, "#5c4a24"]]), "#141008", 2.4);
      rounded(ctx, 102, 34, 6, 12, 2, "#141008", "#141008", 1.0);
      rounded(ctx, 102, 54, 6, 12, 2, "#141008", "#141008", 1.0);

      // Right Spire Conical Roof (Slate/Copper, Y=6 to 24)
      poly(ctx, [[88, 24], [104, 6], [120, 24]], linGrad(ctx, 88, 6, 120, 24, [[0, "#4878a8"], [0.5, "#2a4e76"], [1, "#142c48"]]), "#141008", 2.4);
      ellipse(ctx, 104, 6, 3, 3, "#ffd452", "#141008", 1.2);
      poly(ctx, [[104, 0], [105.5, 4], [104, 6], [102.5, 4]], "#ffd452");

      // 4. Central Grand Command Keep Body (Y=24 to 76)
      rounded(ctx, 32, 26, 64, 50, 3, linGrad(ctx, 32, 26, 96, 76, [[0, "#dac890"], [0.35, "#ac965e"], [0.75, "#766236"], [1, "#44361a"]]), "#141008", 2.6);

      // Machicolation corbels along central keep (Y=22 to 30)
      for (let i = 0; i < 6; i += 1) {
        const cx = 36 + i * 11;
        poly(ctx, [[cx - 3, 30], [cx + 3, 30], [cx + 4.5, 22], [cx - 4.5, 22]], linGrad(ctx, cx - 4.5, 22, cx + 4.5, 30, [[0, "#faeab6"], [1, "#7c6838"]]), "#141008", 1.2);
      }

      // Parapet Stringcourse & 7 Central Merlons (Y=12 to 24)
      rounded(ctx, 30, 20, 68, 6, 1.5, linGrad(ctx, 30, 20, 98, 26, [[0, "#fae8b4"], [1, "#6a562a"]]), "#141008", 1.8);
      for (let i = 0; i < 5; i += 1) {
        const mx = 34 + i * 13;
        rounded(ctx, mx, 10, 10, 12, 1.5, linGrad(ctx, mx, 10, mx + 10, 22, [[0, "#fff4c8"], [0.4, "#cca868"], [1, "#746234"]]), "#141008", 1.6);
        rounded(ctx, mx - 0.5, 8, 11, 3, 1, "#fff6d4", "#141008", 1.0);
      }

      // Roaring Iron Fire-Basket Braziers on Keep Battlements
      for (const bx of [40, 88]) {
        rounded(ctx, bx - 3, 14, 6, 6, 1.5, "#2a2420", "#141008", 1.2);
        ellipse(ctx, bx, 11, 4.5, 6, radGrad(ctx, bx, 10, 1, 6, [[0, "#ffffff"], [0.4, "#ffa818"], [1, "rgba(200,20,0,0)"]]));
      }

      // 5. Monumental Grand Gateway & Open Radiant Guard-Hall (Y=52 to 92)
      poly(
        ctx,
        [[40, 90], [40, 64], [64, 48], [88, 64], [88, 90], [84, 90], [84, 66], [64, 52], [44, 66], [44, 90]],
        linGrad(ctx, 40, 48, 88, 90, [[0, "#fae6b4"], [0.5, "#b8a064"], [1, "#5c4a24"]]),
        "#141008",
        2.4
      );

      // Carved Golden Lion Keystone
      poly(ctx, [[58, 52], [70, 52], [72, 44], [56, 44]], "#ffd860", "#141008", 1.4);
      ellipse(ctx, 64, 48, 3, 3, "#ffffff", "#ffd452", 0.8);

      // Open Arched Doorway with Warm Radiant Light Spilling Out
      rounded(ctx, 44, 56, 40, 34, 4, linGrad(ctx, 44, 56, 84, 90, [[0, "#ffffff"], [0.35, "#ffe874"], [0.75, "#e08818"], [1, "#6a2404"]]), "#141008", 2.2);
      ellipse(ctx, 64, 76, 14, 16, radGrad(ctx, 64, 74, 2, 16, [[0, "#ffffff"], [0.5, "#fff0a0"], [1, "rgba(255,140,20,0)"]]));

      // Spiked Iron Portcullis Raised
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (const gx of [49, 55, 61, 67, 73, 79]) {
        ctx.moveTo(gx, 50); ctx.lineTo(gx, 65);
        poly(ctx, [[gx, 65], [gx - 1.5, 68], [gx + 1.5, 68]], "#141008");
      }
      ctx.moveTo(46, 56); ctx.lineTo(82, 56);
      ctx.moveTo(46, 62); ctx.lineTo(82, 62);
      ctx.stroke();

      // 6. Grand Royal Paladin Heraldic Crest above Gateway (Center 64, Y=36 to 52)
      const crestPoly = [
        [52, 34],
        [76, 34],
        [74, 46],
        [64, 54],
        [54, 46],
      ];
      poly(ctx, crestPoly, linGrad(ctx, 52, 34, 76, 54, [[0, "#ffffff"], [0.3, "#f4d060"], [1, "#9c7018"]]), "#141008", 2.2);
      poly(ctx, [[54, 36], [74, 36], [72, 45], [64, 51], [56, 45]], "#c42418");

      // Golden Lion-and-Cross inside Crest
      ctx.strokeStyle = "#ffe874";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(64, 36); ctx.lineTo(64, 49);
      ctx.moveTo(56, 42); ctx.lineTo(72, 42);
      ctx.stroke();
      ellipse(ctx, 64, 42, 2, 2, "#ffffff");

      // 7. Twin Grand Royal War Standards (Billowing from Spires)
      // Left Grand Standard
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(14, 28); ctx.lineTo(14, -2);
      ctx.stroke();
      poly(ctx, [[14, -2], [14, 22], [42, 12], [32, 2], [42, -8]], linGrad(ctx, 14, -8, 42, 22, [[0, "#e83424"], [0.5, "#ac160c"], [1, "#540602"]]), "#141008", 1.8);
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(16, 0); ctx.lineTo(34, 0); ctx.lineTo(24, 7);
      ctx.stroke();

      // Right Grand Standard
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(114, 28); ctx.lineTo(114, -2);
      ctx.stroke();
      poly(ctx, [[114, -2], [114, 22], [86, 12], [96, 2], [86, -8]], linGrad(ctx, 86, -8, 114, 22, [[0, "#e83424"], [0.5, "#ac160c"], [1, "#540602"]]), "#141008", 1.8);
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(112, 0); ctx.lineTo(94, 0); ctx.lineTo(104, 7);
      ctx.stroke();
    };

    make("tower_barracks_idle", 128, 128, drawBarracksIdle);
    make("tower_barracks", 128, 128, drawBarracksIdle);
    make("tower_barracks_l2", 128, 128, drawBarracksL2);
    make("tower_barracks_l3", 128, 128, drawBarracksL3);
    make("tower_barracks_fire", 128, 128, drawBarracksFire);

    // —— HUD Shop Portraits (72×72 Cropped Tower Portraits) ——
    const drawPortraitArcher = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Framed Badge Background & Fat #141008 Rim
      const bgGrad = linGrad(ctx, 3, 3, 69, 69, [
        [0, "#1d4416"],
        [0.45, "#0e240a"],
        [1, "#051204"],
      ]);
      rounded(ctx, 3, 3, 66, 66, 8, bgGrad, "#141008", 3.2);

      // Inner woodland bronze bezel
      const rimGrad = linGrad(ctx, 5, 5, 67, 67, [
        [0, "#e8c85c"],
        [0.45, "#966c24"],
        [1, "#442c0a"],
      ]);
      rounded(ctx, 5, 5, 62, 62, 6, null, rimGrad, 1.8);

      // Ambient forest canopy radial glow behind head
      const forestGlow = radGrad(ctx, 36, 34, 4, 30, [
        [0, "rgba(100, 210, 65, 0.45)"],
        [0.6, "rgba(40, 100, 25, 0.16)"],
        [1, "rgba(10, 25, 10, 0)"],
      ]);
      ellipse(ctx, 36, 34, 28, 28, forestGlow);

      // 2. Shoulders & Cloak (Torso base)
      const cloakGrad = linGrad(ctx, 16, 48, 56, 68, [
        [0, "#3e7c34"],
        [0.45, "#255420"],
        [1, "#122a0e"],
      ]);
      poly(ctx, [[8, 68], [15, 52], [28, 48], [44, 48], [57, 52], [64, 68]], cloakGrad, "#141008", 2.6);

      // Leather shoulder strap & golden buckle
      poly(ctx, [[18, 68], [26, 50], [33, 50], [25, 68]], "#7a4c20", "#141008", 1.6);
      rounded(ctx, 26, 53, 7, 5, 1.5, "#ffd452", "#141008", 1.2);

      // 3. Quiver & Arrow Fletchings on Left Shoulder
      rounded(ctx, 11, 26, 11, 20, 3, "#6b3c18", "#141008", 1.8);
      poly(ctx, [[14, 20], [14, 28], [16, 28], [16, 20]], "#d8a458", "#141008", 1.0);
      poly(ctx, [[12, 14], [18, 14], [15, 21]], "#ea3624", "#141008", 1.0);
      poly(ctx, [[18, 18], [18, 26], [20, 26], [20, 18]], "#d8a458", "#141008", 1.0);
      poly(ctx, [[16, 12], [22, 12], [19, 19]], "#fff8e0", "#141008", 1.0);

      // 4. Recurve Bow Silhouette on Right Edge
      const bowGrad = linGrad(ctx, 55, 12, 67, 64, [
        [0, "#ffd070"],
        [0.4, "#aa6e28"],
        [1, "#442408"],
      ]);
      poly(ctx, [[55, 12], [64, 24], [65, 48], [57, 64], [60, 64], [68, 48], [67, 24], [58, 12]], bowGrad, "#141008", 2.2);
      rounded(ctx, 62, 33, 5, 8, 1.5, "#e8d8b0", "#141008", 1.2);
      poly(ctx, [[56, 14], [56, 62], [57.5, 62], [57.5, 14]], "#fbfbf0", "#141008", 0.8);

      // 5. Green Hood (Back dome & framing)
      const hoodGrad = linGrad(ctx, 18, 8, 54, 52, [
        [0, "#48903c"],
        [0.45, "#2b6224"],
        [1, "#153610"],
      ]);
      poly(ctx, [[36, 8], [55, 18], [53, 46], [47, 52], [25, 52], [19, 46], [17, 18]], hoodGrad, "#141008", 3.0);

      // Crimson & Gold Ranger Cap Feather
      const featherGrad = linGrad(ctx, 12, 8, 28, 22, [
        [0, "#ea3624"],
        [0.6, "#b01c0c"],
        [1, "#5c0804"],
      ]);
      poly(ctx, [[28, 16], [11, 8], [19, 22]], featherGrad, "#141008", 1.8);
      poly(ctx, [[27, 17], [13, 9], [15, 10], [28, 18]], "#ffd700");

      // 6. Ranger Face & Skin
      const skinGrad = linGrad(ctx, 24, 22, 48, 47, [
        [0, "#ffeed8"],
        [0.45, "#e8b87e"],
        [1, "#a86c34"],
      ]);
      poly(ctx, [[24, 25], [48, 25], [47, 40], [42, 47], [30, 47], [25, 40]], skinGrad, "#141008", 2.4);
      ellipse(ctx, 36, 43, 7, 3.5, "rgba(160, 80, 40, 0.28)");

      // Hair strands framing face
      poly(ctx, [[23, 25], [29, 26], [26, 32]], "#d89e44", "#141008", 1.2);
      poly(ctx, [[49, 25], [43, 26], [46, 32]], "#d89e44", "#141008", 1.2);

      // Hood shadow over forehead
      poly(ctx, [[22, 23], [36, 26], [50, 23], [48, 28], [36, 30], [24, 28]], "rgba(14, 32, 10, 0.65)");

      // Eyebrows
      poly(ctx, [[24, 29], [33, 31], [32, 33], [24, 30]], "#2e1a0a");
      poly(ctx, [[48, 29], [39, 31], [40, 33], [48, 30]], "#2e1a0a");

      // 7. Cream Eyes & Glints
      // Left Eye
      ellipse(ctx, 29, 34, 4.2, 3.8, "#fef6dc", "#141008", 2.2);
      const leftIris = linGrad(ctx, 27, 32, 31, 36, [[0, "#3e8c34"], [0.6, "#184414"], [1, "#0a1c08"]]);
      ellipse(ctx, 29.5, 34, 2.3, 2.5, leftIris);
      ellipse(ctx, 29.8, 34, 1.2, 1.4, "#141008");
      ellipse(ctx, 28.2, 32.7, 0.9, 0.9, "#ffffff");

      // Right Eye
      ellipse(ctx, 43, 34, 4.2, 3.8, "#fef6dc", "#141008", 2.2);
      const rightIris = linGrad(ctx, 41, 32, 45, 36, [[0, "#3e8c34"], [0.6, "#184414"], [1, "#0a1c08"]]);
      ellipse(ctx, 42.5, 34, 2.3, 2.5, rightIris);
      ellipse(ctx, 42.2, 34, 1.2, 1.4, "#141008");
      ellipse(ctx, 41.2, 32.7, 0.9, 0.9, "#ffffff");

      // 8. Nose & Smile
      poly(ctx, [[35, 33], [37, 38], [34, 39], [38, 39]], "#c88a4e", "#141008", 1.4);
      poly(ctx, [[32, 43], [36, 44], [41, 42]], null, "#141008", 2.0);
      ellipse(ctx, 36, 44.5, 2.5, 1.0, "rgba(230, 140, 100, 0.45)");

      // 9. Hood Front Cowl / Neck Wrap
      const cowlGrad = linGrad(ctx, 24, 46, 48, 58, [
        [0, "#48903c"],
        [0.5, "#2b6224"],
        [1, "#122a0e"],
      ]);
      poly(ctx, [[22, 46], [36, 52], [50, 46], [48, 54], [36, 58], [24, 54]], cowlGrad, "#141008", 2.2);

      // Corner rivets on badge
      for (const [cx, cy] of [[7, 7], [65, 7], [7, 65], [65, 65]]) {
        ellipse(ctx, cx, cy, 1.6, 1.6, "#ffd452", "#141008", 1.0);
        ellipse(ctx, cx - 0.4, cy - 0.4, 0.5, 0.5, "#ffffff");
      }
    };

    const drawPortraitMage = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Framed Badge Background & Fat #141008 Rim
      const bgGrad = linGrad(ctx, 3, 3, 69, 69, [
        [0, "#28124c"],
        [0.45, "#140628"],
        [1, "#070212"],
      ]);
      rounded(ctx, 3, 3, 66, 66, 8, bgGrad, "#141008", 3.2);

      // Inner celestial gold & violet bezel
      const rimGrad = linGrad(ctx, 5, 5, 67, 67, [
        [0, "#ffd864"],
        [0.45, "#9c52ea"],
        [1, "#3c1068"],
      ]);
      rounded(ctx, 5, 5, 62, 62, 6, null, rimGrad, 1.8);

      // Ambient radial mana glow behind head
      const manaGlow = radGrad(ctx, 36, 32, 2, 32, [
        [0, "rgba(190, 110, 255, 0.55)"],
        [0.5, "rgba(95, 30, 200, 0.22)"],
        [1, "rgba(15, 4, 35, 0)"],
      ]);
      ellipse(ctx, 36, 32, 30, 30, manaGlow);

      // 2. Shoulders & Mystic Robes (Torso base)
      const robeGrad = linGrad(ctx, 16, 48, 56, 68, [
        [0, "#6a34b8"],
        [0.45, "#421884"],
        [1, "#1e0844"],
      ]);
      poly(ctx, [[8, 68], [15, 52], [28, 48], [44, 48], [57, 52], [64, 68]], robeGrad, "#141008", 2.6);

      // Golden Runic Stole / Collar Band
      const stoleGrad = linGrad(ctx, 28, 48, 44, 68, [
        [0, "#ffd868"],
        [0.5, "#d49a2a"],
        [1, "#66400c"],
      ]);
      poly(ctx, [[28, 48], [44, 48], [46, 68], [26, 68]], stoleGrad, "#141008", 1.8);

      // Glowing Mana Crystal on Chest
      ellipse(ctx, 36, 58, 3.5, 3.5, "#70f0ff", "#141008", 1.2);
      ellipse(ctx, 36, 58, 1.3, 1.3, "#ffffff");

      // 3. Floating Mana Crystal & Shimmers on Left/Right
      const crystalGrad = linGrad(ctx, 9, 24, 19, 40, [
        [0, "#ffffff"],
        [0.45, "#b080ff"],
        [1, "#401080"],
      ]);
      poly(ctx, [[14, 24], [19, 32], [14, 40], [9, 32]], crystalGrad, "#141008", 1.4);
      ellipse(ctx, 14, 32, 2.0, 2.0, "#70f0ff");

      // 4. Wizard Violet Hood (Outer shape & back dome)
      const hoodGrad = linGrad(ctx, 17, 7, 55, 52, [
        [0, "#8246d8"],
        [0.45, "#5220a4"],
        [1, "#260a56"],
      ]);
      poly(ctx, [[36, 7], [56, 17], [54, 46], [47, 52], [25, 52], [18, 46], [16, 17]], hoodGrad, "#141008", 3.0);

      // Gilded Trim on Hood Edge
      const trimGrad = linGrad(ctx, 19, 9, 53, 26, [
        [0, "#ffe278"],
        [0.5, "#d4a030"],
        [1, "#7c520e"],
      ]);
      poly(ctx, [[36, 9], [53, 18], [51, 26], [47, 24], [36, 14], [25, 24], [21, 26], [19, 18]], trimGrad, "#141008", 1.4);

      // Forehead Runic Focus Gem
      ellipse(ctx, 36, 20, 3.0, 3.0, "#70f0ff", "#141008", 1.2);
      ellipse(ctx, 36, 20, 1.0, 1.0, "#ffffff");

      // 5. Rune Mage Face & Skin
      const skinGrad = linGrad(ctx, 24, 22, 48, 46, [
        [0, "#f8e8f8"],
        [0.45, "#d6bada"],
        [1, "#8e689a"],
      ]);
      poly(ctx, [[24, 25], [48, 25], [46, 38], [42, 46], [30, 46], [26, 38]], skinGrad, "#141008", 2.4);

      // White / Silver Wizard Mustache & Pointed Beard
      const beardGrad = linGrad(ctx, 28, 38, 44, 49, [
        [0, "#ffffff"],
        [0.5, "#d8d0e8"],
        [1, "#8880a0"],
      ]);
      poly(ctx, [[28, 40], [36, 49], [44, 40], [40, 38], [36, 41], [32, 38]], beardGrad, "#141008", 1.6);

      // Deep hood shadow over upper face
      poly(ctx, [[22, 23], [36, 26], [50, 23], [48, 28], [36, 30], [24, 28]], "rgba(20, 6, 45, 0.72)");

      // Arched wizard eyebrows
      poly(ctx, [[24, 28], [33, 29], [32, 31], [24, 29]], "#e0d8f0");
      poly(ctx, [[48, 28], [39, 29], [40, 31], [48, 29]], "#e0d8f0");

      // 6. Glowing Eye (Left) & Mystic Cream Eye (Right)
      // Left Eye: Blazing Arcane Rune Eye
      const auraGlow = radGrad(ctx, 29, 34, 1, 7, [
        [0, "rgba(130, 245, 255, 0.85)"],
        [0.5, "rgba(80, 160, 255, 0.45)"],
        [1, "rgba(50, 0, 180, 0)"],
      ]);
      ellipse(ctx, 29, 34, 7.0, 6.0, auraGlow);
      ellipse(ctx, 29, 34, 4.2, 3.8, "#f0fbff", "#141008", 2.2);
      ellipse(ctx, 29.2, 34, 2.6, 2.6, "#50e0ff");
      ellipse(ctx, 29.2, 34, 1.4, 1.4, "#ffffff");

      // Right Eye: Mystic Cream Eye
      ellipse(ctx, 43, 34, 4.2, 3.8, "#fef6dc", "#141008", 2.2);
      const rightIris = linGrad(ctx, 41, 32, 45, 36, [
        [0, "#a860ff"],
        [0.6, "#5e1cb8"],
        [1, "#260658"],
      ]);
      ellipse(ctx, 42.5, 34, 2.4, 2.5, rightIris);
      ellipse(ctx, 42.2, 34, 1.2, 1.4, "#141008");
      ellipse(ctx, 41.2, 32.7, 0.9, 0.9, "#ffffff");

      // 7. Nose & Mystic Glyphs
      poly(ctx, [[35, 33], [37, 37], [34, 38], [38, 38]], "#b894be", "#141008", 1.4);

      // Orbiting magic motes
      ellipse(ctx, 58, 22, 1.6, 1.6, "#ffffff");
      ellipse(ctx, 16, 48, 1.3, 1.3, "#70f0ff");
      ellipse(ctx, 54, 52, 1.2, 1.2, "#ffd860");

      // Corner rivets on badge
      for (const [cx, cy] of [[7, 7], [65, 7], [7, 65], [65, 65]]) {
        ellipse(ctx, cx, cy, 1.6, 1.6, "#70f0ff", "#141008", 1.0);
        ellipse(ctx, cx - 0.4, cy - 0.4, 0.5, 0.5, "#ffffff");
      }
    };

    const drawPortraitArtillery = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Framed Badge Background & Fat #141008 Rim
      const bgGrad = linGrad(ctx, 3, 3, 69, 69, [
        [0, "#3e1808"],
        [0.45, "#1c0a03"],
        [1, "#0a0301"],
      ]);
      rounded(ctx, 3, 3, 66, 66, 8, bgGrad, "#141008", 3.2);

      // Inner heavy bronze & iron bezel
      const rimGrad = linGrad(ctx, 5, 5, 67, 67, [
        [0, "#f5d76e"],
        [0.45, "#b87c24"],
        [1, "#4e2806"],
      ]);
      rounded(ctx, 5, 5, 62, 62, 6, null, rimGrad, 1.8);

      // Ambient radial furnace heat glow behind bombardier
      const furnaceGlow = radGrad(ctx, 36, 36, 3, 30, [
        [0, "rgba(255, 130, 20, 0.48)"],
        [0.6, "rgba(180, 50, 10, 0.18)"],
        [1, "rgba(30, 8, 0, 0)"],
      ]);
      ellipse(ctx, 36, 36, 28, 28, furnaceGlow);

      // 2. Shoulders & Heavy Leather Apron / Armor
      const apronGrad = linGrad(ctx, 15, 50, 57, 68, [
        [0, "#743a18"],
        [0.45, "#4c220c"],
        [1, "#261004"],
      ]);
      poly(ctx, [[8, 68], [15, 54], [26, 50], [46, 50], [57, 54], [64, 68]], apronGrad, "#141008", 2.6);

      // Heavy iron shoulder pauldron on left
      const pauldronGrad = linGrad(ctx, 8, 52, 20, 66, [
        [0, "#8894a0"],
        [0.5, "#48525c"],
        [1, "#20262c"],
      ]);
      rounded(ctx, 8, 52, 13, 14, 3, pauldronGrad, "#141008", 1.8);
      ellipse(ctx, 14, 59, 1.3, 1.3, "#ffd860", "#141008", 0.8);

      // 3. Mortar Cannon Hint on Right Edge
      const ironMuzzle = linGrad(ctx, 48, 44, 66, 68, [
        [0, "#6c747e"],
        [0.45, "#383e46"],
        [1, "#181c20"],
      ]);
      poly(ctx, [[50, 68], [48, 52], [64, 44], [67, 60]], ironMuzzle, "#141008", 2.2);

      // Polished bronze muzzle ring
      const bronzeCollar = linGrad(ctx, 48, 42, 64, 52, [
        [0, "#ffd868"],
        [0.5, "#c48c24"],
        [1, "#664008"],
      ]);
      ellipse(ctx, 56, 48, 7.5, 4.2, bronzeCollar, "#141008", 1.6);

      // Glowing hot bore
      ellipse(ctx, 56, 48, 4.5, 2.4, "#240400", "#ff6600", 1.0);
      ellipse(ctx, 56, 48, 1.8, 1.0, "#ffaa00");

      // Burning fuse line & spark
      poly(ctx, [[48, 52], [45, 47], [46, 44]], null, "#d0a070", 1.4);
      ellipse(ctx, 46, 43, 2.4, 2.4, "#ffaa00");
      ellipse(ctx, 46, 43, 1.0, 1.0, "#ffffff");

      // 4. Bombardier Face & Bushy Red/Ginger Beard
      const skinGrad = linGrad(ctx, 23, 22, 49, 46, [
        [0, "#ffeed8"],
        [0.45, "#e2a874"],
        [1, "#9e5828"],
      ]);
      poly(ctx, [[23, 24], [49, 24], [48, 38], [44, 46], [28, 46], [24, 38]], skinGrad, "#141008", 2.4);

      // Soot smudges
      ellipse(ctx, 26, 34, 3.2, 2.0, "rgba(20, 12, 8, 0.35)");
      ellipse(ctx, 46, 34, 3.2, 2.0, "rgba(20, 12, 8, 0.35)");

      // Massive bristling ginger beard & mustache
      const beardGrad = linGrad(ctx, 18, 38, 54, 58, [
        [0, "#e85c24"],
        [0.45, "#b83810"],
        [1, "#5a1404"],
      ]);
      poly(ctx, [[20, 38], [18, 48], [26, 56], [36, 58], [46, 56], [54, 48], [52, 38], [46, 40], [36, 42], [26, 40]], beardGrad, "#141008", 2.4);

      // Curled bushy mustache
      const mustacheGrad = linGrad(ctx, 21, 37, 51, 45, [
        [0, "#ff7834"],
        [0.5, "#d04414"],
        [1, "#741c06"],
      ]);
      poly(ctx, [[21, 40], [29, 37], [36, 40], [43, 37], [51, 40], [45, 45], [36, 43], [27, 45]], mustacheGrad, "#141008", 1.8);

      // Golden beard ring clasp
      rounded(ctx, 33, 53, 6, 4, 1.2, "#ffd860", "#141008", 1.0);

      // 5. Heavy Bronze Bombardier Helmet & Welding Goggles
      const helmGrad = linGrad(ctx, 18, 6, 54, 25, [
        [0, "#ffeb94"],
        [0.4, "#d8a436"],
        [1, "#784e12"],
      ]);
      poly(ctx, [[18, 22], [22, 10], [36, 6], [50, 10], [54, 22], [48, 25], [24, 25]], helmGrad, "#141008", 2.8);

      // Heavy riveted brow band
      const browGrad = linGrad(ctx, 17, 20, 55, 26, [
        [0, "#f5d76e"],
        [0.5, "#be8828"],
        [1, "#66400c"],
      ]);
      rounded(ctx, 17, 20, 38, 6, 2, browGrad, "#141008", 1.8);
      ellipse(ctx, 21, 23, 1.1, 1.1, "#fff0a0", "#141008", 0.7);
      ellipse(ctx, 51, 23, 1.1, 1.1, "#fff0a0", "#141008", 0.7);

      // Brass Welding Goggles on Forehead
      poly(ctx, [[16, 14], [56, 14], [56, 18], [16, 18]], "#3a2214", "#141008", 1.0);

      // Left Goggle Lens
      ellipse(ctx, 28, 15, 5.0, 4.5, "#d49a2a", "#141008", 1.6);
      const glassLeft = linGrad(ctx, 25, 12, 31, 18, [[0, "#a8f4ff"], [0.5, "#48c8e8"], [1, "#146888"]]);
      ellipse(ctx, 28, 15, 3.5, 3.0, glassLeft);
      ellipse(ctx, 26.5, 13.5, 0.8, 0.8, "#ffffff");

      // Right Goggle Lens
      ellipse(ctx, 44, 15, 5.0, 4.5, "#d49a2a", "#141008", 1.6);
      const glassRight = linGrad(ctx, 41, 12, 47, 18, [[0, "#a8f4ff"], [0.5, "#48c8e8"], [1, "#146888"]]);
      ellipse(ctx, 44, 15, 3.5, 3.0, glassRight);
      ellipse(ctx, 42.5, 13.5, 0.8, 0.8, "#ffffff");

      // Goggle Bridge
      poly(ctx, [[33, 15], [39, 15], [39, 17], [33, 17]], "#ffd860", "#141008", 1.0);

      // 6. Huge Fiery Cream Eyes & Bristling Eyebrows
      poly(ctx, [[23, 27], [33, 28], [32, 31], [23, 29]], "#88240a");
      poly(ctx, [[49, 27], [39, 28], [40, 31], [49, 29]], "#88240a");

      // Left Eye
      ellipse(ctx, 29, 32, 4.2, 3.8, "#fff4dc", "#141008", 2.2);
      const leftIris = linGrad(ctx, 27, 30, 31, 34, [[0, "#743a14"], [0.6, "#3a1a06"], [1, "#140a02"]]);
      ellipse(ctx, 29.5, 32, 2.3, 2.5, leftIris);
      ellipse(ctx, 29.8, 32, 1.2, 1.4, "#141008");
      ellipse(ctx, 28.2, 30.7, 0.9, 0.9, "#ffffff");

      // Right Eye
      ellipse(ctx, 43, 32, 4.2, 3.8, "#fff4dc", "#141008", 2.2);
      const rightIris = linGrad(ctx, 41, 30, 45, 34, [[0, "#743a14"], [0.6, "#3a1a06"], [1, "#140a02"]]);
      ellipse(ctx, 42.5, 32, 2.3, 2.5, rightIris);
      ellipse(ctx, 42.2, 32, 1.2, 1.4, "#141008");
      ellipse(ctx, 41.2, 30.7, 0.9, 0.9, "#ffffff");

      // 7. Broad Nose
      poly(ctx, [[34, 30], [38, 30], [40, 35], [32, 35]], "#d08c52", "#141008", 1.4);

      // Sparks drifting in air
      ellipse(ctx, 16, 26, 1.3, 1.3, "#ffaa00");
      ellipse(ctx, 60, 24, 1.5, 1.5, "#ff6600");
      ellipse(ctx, 22, 60, 1.0, 1.0, "#ffd860");

      // Corner rivets on badge
      for (const [cx, cy] of [[7, 7], [65, 7], [7, 65], [65, 65]]) {
        ellipse(ctx, cx, cy, 1.6, 1.6, "#ffd452", "#141008", 1.0);
        ellipse(ctx, cx - 0.4, cy - 0.4, 0.5, 0.5, "#ffffff");
      }
    };

    const drawPortraitBarracks = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Framed Badge Background & Fat #141008 Rim
      const bgGrad = linGrad(ctx, 3, 3, 69, 69, [
        [0, "#1a2c44"],
        [0.45, "#0c1828"],
        [1, "#040810"],
      ]);
      rounded(ctx, 3, 3, 66, 66, 8, bgGrad, "#141008", 3.2);

      // Inner knightly gold & steel bezel
      const rimGrad = linGrad(ctx, 5, 5, 67, 67, [
        [0, "#ffd700"],
        [0.45, "#c89424"],
        [1, "#543808"],
      ]);
      rounded(ctx, 5, 5, 62, 62, 6, null, rimGrad, 1.8);

      // Ambient radiant gold / torchlight glow behind captain
      const torchGlow = radGrad(ctx, 36, 32, 4, 30, [
        [0, "rgba(255, 215, 80, 0.42)"],
        [0.6, "rgba(180, 130, 30, 0.16)"],
        [1, "rgba(10, 20, 35, 0)"],
      ]);
      ellipse(ctx, 36, 32, 28, 28, torchGlow);

      // 2. Shoulders & Gilded Armor / Royal Blue Cape
      const cloakGrad = linGrad(ctx, 15, 48, 57, 68, [
        [0, "#2a548e"],
        [0.5, "#183664"],
        [1, "#0a1832"],
      ]);
      poly(ctx, [[8, 68], [15, 52], [26, 48], [46, 48], [57, 52], [64, 68]], cloakGrad, "#141008", 2.6);

      // Gilded plate gorget / neck armor
      const gorgetGrad = linGrad(ctx, 24, 52, 48, 68, [
        [0, "#fff0a4"],
        [0.45, "#d4a43c"],
        [1, "#745018"],
      ]);
      poly(ctx, [[24, 52], [48, 52], [44, 68], [28, 68]], gorgetGrad, "#141008", 2.0);
      ellipse(ctx, 36, 60, 2.6, 2.6, "#ffd700", "#141008", 1.0);

      // Golden lion pauldron on left shoulder
      const pauldronGrad = linGrad(ctx, 8, 50, 21, 66, [
        [0, "#fff4b0"],
        [0.5, "#cca038"],
        [1, "#6c4814"],
      ]);
      rounded(ctx, 8, 50, 13, 15, 3, pauldronGrad, "#141008", 1.8);

      // Guard shield hint on right shoulder
      const shieldGrad = linGrad(ctx, 54, 48, 66, 66, [
        [0, "#285288"],
        [1, "#0c1c36"],
      ]);
      poly(ctx, [[54, 48], [66, 48], [66, 62], [57, 66]], shieldGrad, "#141008", 1.8);
      poly(ctx, [[54, 48], [66, 48], [66, 52], [54, 52]], "#ffd700", "#141008", 1.0);

      // 3. Captain Face & Strong Jaw
      const skinGrad = linGrad(ctx, 24, 22, 48, 47, [
        [0, "#fff2dc"],
        [0.45, "#e5b47a"],
        [1, "#9e6630"],
      ]);
      poly(ctx, [[24, 25], [48, 25], [47, 40], [42, 47], [30, 47], [25, 40]], skinGrad, "#141008", 2.4);

      // Chainmail coif under chin & cheeks
      const mailGrad = linGrad(ctx, 22, 36, 50, 48, [
        [0, "#7a8898"],
        [1, "#343e4a"],
      ]);
      poly(ctx, [[22, 36], [26, 48], [30, 48], [25, 36]], mailGrad, "#141008", 1.2);
      poly(ctx, [[50, 36], [46, 48], [42, 48], [47, 36]], mailGrad, "#141008", 1.2);

      // 4. Magnificent Gilded Captain's Helmet with Crimson Plume
      // Crimson & Gold Crest Plume
      const plumeGrad = linGrad(ctx, 30, 3, 42, 11, [
        [0, "#ff4434"],
        [0.5, "#d01c10"],
        [1, "#660804"],
      ]);
      poly(ctx, [[36, 3], [29, 11], [43, 11]], plumeGrad, "#141008", 1.8);
      rounded(ctx, 32, 8, 8, 4, 1, "#ffd700", "#141008", 1.0);

      // Gilded Helmet Dome & Cheek Guards
      const helmGrad = linGrad(ctx, 20, 9, 52, 26, [
        [0, "#fff4b4"],
        [0.42, "#dbaa3c"],
        [1, "#744e16"],
      ]);
      poly(ctx, [[20, 24], [23, 12], [36, 9], [49, 12], [52, 24], [47, 26], [25, 26]], helmGrad, "#141008", 2.8);

      // Golden Visor Brow
      const visorGrad = linGrad(ctx, 19, 18, 53, 24, [
        [0, "#fff8c0"],
        [0.5, "#e5b642"],
        [1, "#865814"],
      ]);
      rounded(ctx, 19, 18, 34, 6, 2, visorGrad, "#141008", 1.8);

      // Golden Nasal Guard extending down between eyes
      const nasalGrad = linGrad(ctx, 34, 22, 38, 32, [
        [0, "#ffd864"],
        [1, "#94621a"],
      ]);
      poly(ctx, [[34, 22], [38, 22], [37, 32], [35, 32]], nasalGrad, "#141008", 1.4);

      // Visor ventilation rivets
      ellipse(ctx, 23, 21, 1.0, 1.0, "#141008");
      ellipse(ctx, 49, 21, 1.0, 1.0, "#141008");

      // 5. Stalwart Eyes & Resolute Brow
      poly(ctx, [[22, 24], [34, 26], [33, 28], [22, 26]], "#2a1e12");
      poly(ctx, [[50, 24], [38, 26], [39, 28], [50, 26]], "#2a1e12");

      // Left Eye
      ellipse(ctx, 29, 32, 4.2, 3.8, "#fef6dc", "#141008", 2.2);
      const leftIris = linGrad(ctx, 27, 30, 31, 34, [[0, "#366094"], [0.6, "#183254"], [1, "#0a1626"]]);
      ellipse(ctx, 29.5, 32, 2.3, 2.5, leftIris);
      ellipse(ctx, 29.8, 32, 1.2, 1.4, "#141008");
      ellipse(ctx, 28.2, 30.7, 0.9, 0.9, "#ffffff");

      // Right Eye
      ellipse(ctx, 43, 32, 4.2, 3.8, "#fef6dc", "#141008", 2.2);
      const rightIris = linGrad(ctx, 41, 30, 45, 34, [[0, "#366094"], [0.6, "#183254"], [1, "#0a1626"]]);
      ellipse(ctx, 42.5, 32, 2.3, 2.5, rightIris);
      ellipse(ctx, 42.2, 32, 1.2, 1.4, "#141008");
      ellipse(ctx, 41.2, 30.7, 0.9, 0.9, "#ffffff");

      // 6. Nose & Firm Mouth
      poly(ctx, [[35, 32], [37, 37], [34, 38], [38, 38]], "#ca9056", "#141008", 1.4);
      poly(ctx, [[31, 42], [36, 42.5], [41, 42]], null, "#141008", 2.0);

      // Helmet Highlight
      poly(ctx, [[24, 13], [36, 10], [48, 13]], null, "rgba(255,255,255,0.7)", 1.2);

      // Corner rivets on badge
      for (const [cx, cy] of [[7, 7], [65, 7], [7, 65], [65, 65]]) {
        ellipse(ctx, cx, cy, 1.6, 1.6, "#ffd700", "#141008", 1.0);
        ellipse(ctx, cx - 0.4, cy - 0.4, 0.5, 0.5, "#ffffff");
      }
    };

    make("portrait_archer", 72, 72, drawPortraitArcher);
    make("portrait_mage", 72, 72, drawPortraitMage);
    make("portrait_artillery", 72, 72, drawPortraitArtillery);
    make("portrait_barracks", 72, 72, drawPortraitBarracks);

    // —— Enemies ——
    const face = (ctx, cx, cy, eye = "#f6f0c2", pupil = "#101008", angry = false) => {
      // Eye sclera
      ellipse(ctx, cx - 5, cy, 2.4, 2.8, eye);
      ellipse(ctx, cx + 5, cy, 2.4, 2.8, eye);
      // Pupils
      ellipse(ctx, cx - 4.5, cy + 0.3, 1.2, 1.5, pupil);
      ellipse(ctx, cx + 5.5, cy + 0.3, 1.2, 1.5, pupil);
      // Eye glint highlights
      ellipse(ctx, cx - 5.2, cy - 0.7, 0.6, 0.6, "#ffffff");
      ellipse(ctx, cx + 4.8, cy - 0.7, 0.6, 0.6, "#ffffff");

      // Eyebrows
      ctx.strokeStyle = "#1a120c";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (angry) {
        ctx.moveTo(cx - 9, cy - 5);
        ctx.lineTo(cx - 2, cy - 2);
        ctx.moveTo(cx + 9, cy - 5);
        ctx.lineTo(cx + 2, cy - 2);
      } else {
        ctx.moveTo(cx - 8, cy - 4);
        ctx.lineTo(cx - 3, cy - 2);
        ctx.moveTo(cx + 8, cy - 4);
        ctx.lineTo(cx + 3, cy - 2);
      }
      ctx.stroke();

      // Nose bridge / tip subtle shading
      ctx.strokeStyle = "rgba(40, 20, 10, 0.28)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 1);
      ctx.lineTo(cx - 1, cy + 2.5);
      ctx.lineTo(cx + 1, cy + 2.5);
      ctx.stroke();

      // Warm cheek flush / blush
      ellipse(ctx, cx - 7, cy + 2, 2.2, 1.4, "rgba(220, 90, 60, 0.16)");
      ellipse(ctx, cx + 7, cy + 2, 2.2, 1.4, "rgba(220, 90, 60, 0.16)");

      // Mouth
      ctx.strokeStyle = "#5a2818";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(cx, cy + 5.2, 3.4, 0.18, Math.PI - 0.18);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 210, 180, 0.35)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.arc(cx, cy + 4.8, 2.6, 0.3, Math.PI - 0.3);
      ctx.stroke();

      // Cheek highlight
      ctx.strokeStyle = "rgba(255,255,255,.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 4, 5, Math.PI, Math.PI * 1.5);
      ctx.stroke();
    };

    const drawScout = (ctx, frame = 0) => {
      shadow(ctx, 40, 64, 18, 5, 0.4);
      const f = frame % 4;
      const bob = (f === 1 || f === 3) ? -2 : 0;
      const outline = "#141008";

      // Legs & Boots (chunky, fat outline)
      const lX = f === 0 ? 24 : (f === 1 ? 30 : (f === 2 ? 38 : 26));
      const rX = f === 0 ? 54 : (f === 1 ? 46 : (f === 2 ? 40 : 52));
      rounded(ctx, lX - 6, 42 + bob, 12, 18, 3, linGrad(ctx, lX - 6, 42 + bob, lX + 6, 60 + bob, [[0, "#8ab432"], [1, "#5a7820"]]), outline, 3);
      rounded(ctx, lX - 7, 58 + bob, 14, 6, 2, linGrad(ctx, lX - 7, 58 + bob, lX + 7, 64 + bob, [[0, "#5c3a1e"], [1, "#2b1a0c"]]), outline, 3);
      rounded(ctx, rX - 6, 42 + bob, 12, 18, 3, linGrad(ctx, rX - 6, 42 + bob, rX + 6, 60 + bob, [[0, "#8ab432"], [1, "#5a7820"]]), outline, 3);
      rounded(ctx, rX - 7, 58 + bob, 14, 6, 2, linGrad(ctx, rX - 7, 58 + bob, rX + 7, 64 + bob, [[0, "#5c3a1e"], [1, "#2b1a0c"]]), outline, 3);

      // Back Arm
      rounded(ctx, 24 + bob, 28, 10, 16, 3, linGrad(ctx, 24 + bob, 28, 34 + bob, 44, [[0, "#6b8c2a"], [1, "#3d5916"]]), outline, 3);

      // Tunic (Lime)
      rounded(ctx, 26, 24 + bob, 28, 20, 5, linGrad(ctx, 26, 24 + bob, 54, 44 + bob, [[0, "#d4ff3a"], [1, "#78c218"]]), outline, 3);

      // Belt & Buckle
      rounded(ctx, 27, 40 + bob, 26, 5, 2, linGrad(ctx, 27, 40 + bob, 53, 45 + bob, [[0, "#4a2e18"], [1, "#261508"]]), outline, 3);
      rounded(ctx, 37, 39 + bob, 6, 7, 1.5, linGrad(ctx, 37, 39 + bob, 43, 46 + bob, [[0, "#e8c84a"], [1, "#9e7b20"]]), outline, 3);

      // Head
      ellipse(ctx, 40, 18 + bob, 14, 13, linGrad(ctx, 26, 5 + bob, 54, 31 + bob, [[0, "#e8ff7a"], [1, "#8ab432"]]), outline, 3);

      // Ears
      poly(ctx, [[26, 14 + bob], [14, 8 + bob], [25, 22 + bob]], linGrad(ctx, 14, 8 + bob, 26, 22 + bob, [[0, "#d4f568"], [1, "#7a9e28"]]), outline, 3);
      poly(ctx, [[54, 14 + bob], [66, 8 + bob], [55, 22 + bob]], linGrad(ctx, 66, 8 + bob, 54, 22 + bob, [[0, "#d4f568"], [1, "#7a9e28"]]), outline, 3);

      // Face: Huge cream eyes (readable at play scale)
      ellipse(ctx, 35, 18 + bob, 4.5, 3.5, "#fdf6e3", outline, 2.8);
      ellipse(ctx, 45, 18 + bob, 4.5, 3.5, "#fdf6e3", outline, 2.8);
      ellipse(ctx, 35, 18 + bob, 2.5, 2.0, "#1a1008");
      ellipse(ctx, 45, 18 + bob, 2.5, 2.0, "#1a1008");
      ellipse(ctx, 35.5, 17.5 + bob, 0.8, 0.6, "#ffffff");
      ellipse(ctx, 45.5, 17.5 + bob, 0.8, 0.6, "#ffffff");

      // Spear Shaft
      poly(ctx, [[51, 30 + bob], [54, 30 + bob], [66, 10 + bob], [63, 10 + bob]], linGrad(ctx, 51, 30 + bob, 66, 10 + bob, [[0, "#8a6030"], [1, "#5c3a1e"]]), outline, 2.8);

      // Spearhead
      poly(ctx, [[64, 10 + bob], [57, 22 + bob], [71, 22 + bob]], linGrad(ctx, 57, 10 + bob, 71, 22 + bob, [[0, "#e8f0f4"], [1, "#9aaab2"]]), outline, 2.8);

      // Front Arm & Hand
      rounded(ctx, 48, 28 + bob, 10, 14, 3, linGrad(ctx, 48, 28 + bob, 58, 42 + bob, [[0, "#8ab43e"], [1, "#567820"]]), outline, 3);
      ellipse(ctx, 54, 36 + bob, 4, 3, linGrad(ctx, 50, 33 + bob, 58, 39 + bob, [[0, "#c8e67a"], [1, "#7a9e32"]]), outline, 3);
    };

    const drawScoutDead = (ctx) => {
      shadow(ctx, 40, 56, 26, 5, 0.35);
      const outline = "#2a4018";
      const skinLit = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#d8f26a"], [0.45, "#88bc3c"], [1, "#446820"]]);
      const skinShaded = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#769c34"], [0.5, "#4c6e22"], [1, "#263e12"]]);

      // Broken spear lying on ground
      ctx.strokeStyle = "#8a6030";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, 58);
      ctx.lineTo(32, 53);
      ctx.moveTo(40, 54);
      ctx.lineTo(66, 48);
      ctx.stroke();

      // Broken spear splintered shaft ends & chipped spearhead razor edge
      poly(ctx, [[32, 53], [34, 52], [33, 55]], "#6a4620");
      poly(ctx, [[40, 54], [38, 55], [39, 52]], "#6a4620");

      // Spearhead
      poly(ctx, [[74, 46], [64, 42], [66, 52]], linGrad(ctx, 64, 42, 74, 52, [[0, "#d8e2eb"], [1, "#7a8898"]]), "#3a4048", 1);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(64, 42); ctx.lineTo(74, 46);
      ctx.stroke();

      // Back leg & boot
      poly(ctx, [[26, 46], [16, 50], [14, 55], [24, 52]], skinShaded(14, 46, 26, 55), outline, 1.2);
      rounded(ctx, 10, 51, 8, 5, 2, "#3a2818", outline, 1);

      // Front leg & boot
      poly(ctx, [[30, 48], [24, 56], [28, 58], [36, 50]], skinLit(24, 48, 36, 58), outline, 1.2);
      rounded(ctx, 23, 55, 9, 4.5, 2, "#3a2818", outline, 1);

      // Back arm
      rounded(ctx, 18, 41, 10, 5, 2.5, skinShaded(18, 41, 28, 46), outline, 1);

      // Torso collapsed prone
      rounded(ctx, 25, 40, 26, 14, 6, linGrad(ctx, 25, 40, 51, 54, [[0, "#d8ec7c"], [0.5, "#80b03e"], [1, "#2c4c16"]]), outline, 1.8);
      // Tattered cloth folds on collapsed tunic
      ctx.strokeStyle = "rgba(18, 42, 10, 0.45)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(28, 44); ctx.lineTo(34, 49);
      ctx.moveTo(38, 43); ctx.lineTo(44, 48);
      ctx.stroke();
      rounded(ctx, 33, 40.5, 4, 13, 1, "#4e3620");
      rounded(ctx, 32, 45, 6, 4, 1, "#d4af37", "#2a1e10", 0.8);

      // Head resting on dirt
      ellipse(ctx, 52, 45, 11, 10, linGrad(ctx, 44, 37, 60, 53, [[0, "#d8f26a"], [0.5, "#88bc3c"], [1, "#446820"]]), outline, 1.8);

      // Hair strands limp on ground
      poly(ctx, [[43, 39], [37, 36], [42, 42]], "#203410", "#122008", 0.8);
      poly(ctx, [[46, 37], [41, 33], [47, 40]], "#2c4616", "#122008", 0.8);

      // Limp ears flopped backward
      poly(ctx, [[54, 37], [68, 34], [58, 42]], skinShaded(54, 34, 68, 42), outline, 1.2);
      poly(ctx, [[58, 41], [72, 42], [59, 47]], skinLit(58, 41, 72, 47), outline, 1.2);

      // Knocked out X eye
      ctx.strokeStyle = "#1a280c";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(49, 42);
      ctx.lineTo(54, 47);
      ctx.moveTo(54, 42);
      ctx.lineTo(49, 47);
      ctx.stroke();

      // Slack mouth
      ctx.strokeStyle = "#243410";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(47, 50);
      ctx.lineTo(51, 51);
      ctx.stroke();

      // Front arm draped limp
      rounded(ctx, 42, 46, 11, 5, 2.5, skinLit(42, 46, 53, 51), outline, 1.1);
      ellipse(ctx, 41, 48.5, 3, 2.5, skinLit(39, 46, 43, 50), outline, 1);
    };

    make("enemy_scout", 80, 72, (ctx) => drawScout(ctx, 0));
    make("enemy_scout_w0", 80, 72, (ctx) => drawScout(ctx, 0));
    make("enemy_scout_w1", 80, 72, (ctx) => drawScout(ctx, 1));
    make("enemy_scout_w2", 80, 72, (ctx) => drawScout(ctx, 2));
    make("enemy_scout_w3", 80, 72, (ctx) => drawScout(ctx, 3));
    make("enemy_scout_dead", 80, 72, (ctx) => drawScoutDead(ctx));
    const drawDrift = (ctx, frame = 0) => {
      const f = frame % 4;
      const OUT = "#141008";
      const bobY = f === 0 ? 0 : f === 1 ? -3 : f === 2 ? -1 : -2;
      const swayX = f === 0 ? 1 : f === 1 ? 2 : f === 2 ? -1 : -2;

      // 1. Spectral ground contact / shadow
      shadow(ctx, 40, 63, 18, 5, 0.32);
      ellipse(ctx, 40, 63, 12, 3, "rgba(80, 210, 255, 0.16)");

      // 2. Outer phase halo / ethereal radiant aura
      ellipse(
        ctx,
        40 + swayX,
        33 + bobY,
        26,
        28,
        radGrad(ctx, 40 + swayX, 32 + bobY, 4, 26, [
          [0, "rgba(220, 250, 255, 0.45)"],
          [0.45, "rgba(90, 215, 255, 0.22)"],
          [0.8, "rgba(30, 140, 210, 0.08)"],
          [1, "rgba(10, 50, 90, 0)"],
        ])
      );

      // 3. Ethereal Trailing Wisps (Animated Tail Tendrils)
      let tailPoints;
      if (f === 0) {
        tailPoints = [
          [22, 42 + bobY],
          [20, 56 + bobY],
          [26, 52 + bobY],
          [34, 62 + bobY],
          [40, 53 + bobY],
          [48, 64 + bobY],
          [54, 54 + bobY],
          [60, 58 + bobY],
          [58, 42 + bobY],
        ];
      } else if (f === 1) {
        tailPoints = [
          [22, 42 + bobY],
          [18, 54 + bobY],
          [24, 50 + bobY],
          [32, 60 + bobY],
          [42, 51 + bobY],
          [50, 61 + bobY],
          [56, 51 + bobY],
          [62, 55 + bobY],
          [58, 42 + bobY],
        ];
      } else if (f === 2) {
        tailPoints = [
          [22, 42 + bobY],
          [22, 58 + bobY],
          [28, 54 + bobY],
          [36, 64 + bobY],
          [38, 55 + bobY],
          [46, 62 + bobY],
          [52, 53 + bobY],
          [58, 60 + bobY],
          [58, 42 + bobY],
        ];
      } else {
        tailPoints = [
          [22, 42 + bobY],
          [19, 55 + bobY],
          [25, 51 + bobY],
          [33, 61 + bobY],
          [41, 52 + bobY],
          [47, 63 + bobY],
          [55, 52 + bobY],
          [61, 57 + bobY],
          [58, 42 + bobY],
        ];
      }

      poly(
        ctx,
        tailPoints,
        linGrad(ctx, 20, 42 + bobY, 60, 64 + bobY, [
          [0, "#98ecff"],
          [0.4, "#38b4dc"],
          [0.8, "#146892"],
          [1, "#0a3048"],
        ]),
        OUT,
        2.6
      );

      // 4. Ghost Main Torso & Flowing Shroud
      const bodyPoints = [
        [24, 30 + bobY],
        [20, 44 + bobY],
        [32, 48 + bobY],
        [48, 48 + bobY],
        [60, 44 + bobY],
        [56, 30 + bobY],
      ];
      poly(
        ctx,
        bodyPoints,
        linGrad(ctx, 20, 28 + bobY, 60, 48 + bobY, [
          [0, "#e8fcff"],
          [0.35, "#80e2f8"],
          [0.75, "#258eb8"],
          [1, "#0d4360"],
        ]),
        OUT,
        2.8
      );

      // 5. Readable Glowing Soul Core
      ellipse(
        ctx,
        40 + swayX,
        36 + bobY,
        9,
        11,
        radGrad(ctx, 40 + swayX, 35 + bobY, 1, 10, [
          [0, "#ffffff"],
          [0.35, "#a6f6ff"],
          [0.7, "#1ec0e8"],
          [1, "rgba(8, 90, 140, 0)"],
        ])
      );

      // Diamond core rune / soul crystal
      poly(
        ctx,
        [
          [40 + swayX, 29 + bobY],
          [45 + swayX, 36 + bobY],
          [40 + swayX, 43 + bobY],
          [35 + swayX, 36 + bobY],
        ],
        linGrad(ctx, 35 + swayX, 29 + bobY, 45 + swayX, 43 + bobY, [
          [0, "#ffffff"],
          [0.5, "#d4f8ff"],
          [1, "#54d4f8"],
        ]),
        OUT,
        1.6
      );

      // 6. Ghost Cowl / Hood
      const hoodPoints = [
        [40 + swayX, 10 + bobY],
        [53 + swayX, 18 + bobY],
        [55 + swayX, 30 + bobY],
        [40 + swayX, 33 + bobY],
        [25 + swayX, 30 + bobY],
        [27 + swayX, 18 + bobY],
      ];
      poly(
        ctx,
        hoodPoints,
        linGrad(ctx, 25 + swayX, 10 + bobY, 55 + swayX, 33 + bobY, [
          [0, "#ffffff"],
          [0.3, "#c8f6ff"],
          [0.7, "#42b8dc"],
          [1, "#124e70"],
        ]),
        OUT,
        3.0
      );

      // Deep hood opening shadow
      ellipse(
        ctx,
        40 + swayX,
        24 + bobY,
        10.5,
        7.5,
        linGrad(ctx, 40 + swayX, 17 + bobY, 40 + swayX, 31 + bobY, [
          [0, "#081622"],
          [0.55, "#0c2536"],
          [1, "#103c54"],
        ])
      );

      // 7. Huge Cream Eyes (readable at ~40-50px)
      // Left eye
      ellipse(ctx, 34.5 + swayX, 23.5 + bobY, 3.6, 4.4, "#fdfbe4", OUT, 1.8);
      // Right eye
      ellipse(ctx, 45.5 + swayX, 23.5 + bobY, 3.6, 4.4, "#fdfbe4", OUT, 1.8);

      // Pupils
      ellipse(ctx, 35.2 + swayX, 24.0 + bobY, 1.8, 2.3, "#081822");
      ellipse(ctx, 44.8 + swayX, 24.0 + bobY, 1.8, 2.3, "#081822");

      // Bright specular glints
      ellipse(ctx, 34.0 + swayX, 22.4 + bobY, 1.0, 1.0, "#ffffff");
      ellipse(ctx, 43.8 + swayX, 22.4 + bobY, 1.0, 1.0, "#ffffff");

      // Ghostly brow crease
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(29 + swayX, 20 + bobY);
      ctx.lineTo(38 + swayX, 21.5 + bobY);
      ctx.moveTo(51 + swayX, 20 + bobY);
      ctx.lineTo(42 + swayX, 21.5 + bobY);
      ctx.stroke();

      // 8. Ghost Wispy Hands
      const handLeftX = 18 + (f === 1 ? -2 : 0);
      const handRightX = 62 + (f === 3 ? 2 : 0);
      const handY = 34 + bobY;

      poly(
        ctx,
        [
          [handLeftX + 6, handY - 4],
          [handLeftX, handY - 2],
          [handLeftX - 3, handY + 3],
          [handLeftX + 2, handY + 6],
          [handLeftX + 7, handY + 3],
        ],
        linGrad(ctx, handLeftX - 3, handY - 4, handLeftX + 7, handY + 6, [
          [0, "#ffffff"],
          [0.5, "#a8f4ff"],
          [1, "#28a0c8"],
        ]),
        OUT,
        2.0
      );

      poly(
        ctx,
        [
          [handRightX - 6, handY - 4],
          [handRightX, handY - 2],
          [handRightX + 3, handY + 3],
          [handRightX - 2, handY + 6],
          [handRightX - 7, handY + 3],
        ],
        linGrad(ctx, handRightX - 7, handY - 4, handRightX + 3, handY + 6, [
          [0, "#ffffff"],
          [0.5, "#a8f4ff"],
          [1, "#28a0c8"],
        ]),
        OUT,
        2.0
      );

      // Phase glint specks
      ellipse(ctx, 24 + swayX, 16 + bobY, 1.4, 1.4, "#ffffff");
      ellipse(ctx, 56 + swayX, 16 + bobY, 1.4, 1.4, "#ffffff");
      ellipse(ctx, 40 + swayX, 48 + bobY, 1.6, 1.6, "#a0f2ff");
    };

    const drawDriftDead = (ctx) => {
      const OUT = "#141008";
      shadow(ctx, 40, 60, 22, 6, 0.28);

      // Dissolving spectral mist pool
      ellipse(
        ctx,
        40,
        56,
        20,
        8,
        linGrad(ctx, 20, 48, 60, 64, [
          [0, "rgba(200, 245, 255, 0.7)"],
          [0.5, "rgba(60, 175, 225, 0.4)"],
          [1, "rgba(10, 40, 75, 0)"],
        ]),
        OUT,
        2.0
      );

      // Collapsed shroud
      ellipse(
        ctx,
        42,
        51,
        12,
        7,
        linGrad(ctx, 30, 44, 54, 58, [
          [0, "#c0f0ff"],
          [0.5, "#48b0d4"],
          [1, "#144e70"],
        ]),
        OUT,
        2.2
      );

      // Knocked-out X eye
      ctx.strokeStyle = "#081822";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(39, 49); ctx.lineTo(43, 53);
      ctx.moveTo(43, 49); ctx.lineTo(39, 53);
      ctx.stroke();

      // Dissipating spirit motes rising
      ellipse(ctx, 30, 42, 2.5, 2.5, "rgba(180, 245, 255, 0.65)");
      ellipse(ctx, 48, 36, 3.0, 3.0, "rgba(140, 230, 255, 0.55)");
      ellipse(ctx, 38, 27, 2.0, 2.0, "rgba(100, 210, 255, 0.45)");
      ellipse(ctx, 52, 22, 1.5, 1.5, "rgba(80, 190, 245, 0.35)");
    };

    make("enemy_drift", 80, 72, (ctx) => drawDrift(ctx, 0));
    make("enemy_drift_w0", 80, 72, (ctx) => drawDrift(ctx, 0));
    make("enemy_drift_w1", 80, 72, (ctx) => drawDrift(ctx, 1));
    make("enemy_drift_w2", 80, 72, (ctx) => drawDrift(ctx, 2));
    make("enemy_drift_w3", 80, 72, (ctx) => drawDrift(ctx, 3));
    make("enemy_drift_dead", 80, 72, (ctx) => drawDriftDead(ctx));

    const drawBrute = (ctx, frame = 0) => {
      shadow(ctx, 40, 62, 24, 7, 0.42);
      const f = frame % 4;

      const bodyX = f === 0 ? 20 : f === 2 ? 24 : 22;
      const bodyY = (f === 1 || f === 3) ? 25 : 27;
      const headX = f === 0 ? 38 : f === 2 ? 42 : 40;
      const headY = (f === 1 || f === 3) ? 15 : 17;
      const headTilt = f === 0 ? -0.06 : f === 2 ? 0.06 : 0;

      const OUT = "#141008";

      const skinG = (x0,y0,x1,y1) => linGrad(ctx, x0,y0,x1,y1, [[0,'#f5c89a'], [0.6,'#b36b32'], [1,'#5e2810']]);
      const ironG = (x0,y0,x1,y1) => linGrad(ctx, x0,y0,x1,y1, [[0,'#3a3e48'], [0.5,'#22262e'], [1,'#0d0e12']]);

      // Ground contact (simplified for scale)
      ellipse(ctx, 40 + (f===1?-2:f===3?2:0), 60, 28, 5.5, "rgba(14,8,4,0.6)");

      // Legs & Iron Greaves/Boots (bold, heavy stride)
      if (f === 0 || f === 2) {
        const lX = f===0 ? 24 : 18;
        rounded(ctx, lX, bodyY+18, 12, 20, 4, skinG(lX,bodyY+18,lX+12,bodyY+38), OUT, 3.0);
        rounded(ctx, lX-1, bodyY+34, 14, 7, 2.5, ironG(lX-1,bodyY+34,lX+13,bodyY+41), OUT, 2.8);
        const rX = f===0 ? 52 : 48;
        rounded(ctx, rX, bodyY+16, 12, 20, 4, skinG(rX,bodyY+16,rX+12,bodyY+36), OUT, 3.0);
        rounded(ctx, rX-1, bodyY+32, 14, 7, 2.5, ironG(rX-1,bodyY+32,rX+13,bodyY+39), OUT, 2.8);
      } else {
        rounded(ctx, 26, bodyY+18, 13, 20, 4.5, skinG(26,bodyY+18,39,bodyY+38), OUT, 3.0);
        rounded(ctx, 25, bodyY+34, 15, 7, 2.5, ironG(25,bodyY+34,40,bodyY+41), OUT, 2.8);
        rounded(ctx, 45, bodyY+16, 13, 20, 4.5, skinG(45,bodyY+16,58,bodyY+36), OUT, 3.0);
        rounded(ctx, 44, bodyY+32, 15, 7, 2.5, ironG(44,bodyY+32,59,bodyY+39), OUT, 2.8);
      }

      // Torso Hide Base (bold volume)
      rounded(ctx, bodyX, bodyY, 38, 28, 10, skinG(bodyX,bodyY,bodyX+38,bodyY+28), OUT, 3.0);

      // Iron Chest Plate (high contrast vs hide)
      poly(ctx, [[bodyX+5, bodyY+4], [bodyX+33, bodyY+4], [bodyX+31, bodyY+20], [bodyX+7, bodyY+20]], ironG(bodyX+5,bodyY+4,bodyX+33,bodyY+20), OUT, 3.0);
      for(const [rx,ry] of [[bodyX+10,bodyY+8],[bodyX+28,bodyY+8],[bodyX+19,bodyY+15]]) {
        ellipse(ctx, rx, ry, 1.8, 1.8, "#e0d8c4", OUT, 0);
      }

      // Shoulders (Armored, wide bruiser taper)
      const lShX = bodyX - 2; const lShY = bodyY + 6;
      const rShX = bodyX + 38; const rShY = bodyY + 6;
      ellipse(ctx, lShX, lShY, 10.5, 9.5, ironG(lShX,lShY,lShX+21,lShY+19), OUT, 3.2);
      ellipse(ctx, rShX, rShY, 10.5, 9.5, ironG(rShX,rShY,rShX+21,rShY+19), OUT, 3.2);
      poly(ctx, [[lShX-4,lShY-6],[lShX+2,lShY-10],[lShX+8,lShY-6]], ironG(lShX-4,lShY-10,lShX+8,lShY-6), OUT, 2.8);
      poly(ctx, [[rShX-4,rShY-6],[rShX+2,rShY-10],[rShX+8,rShY-6]], ironG(rShX-4,rShY-10,rShX+8,rShY-6), OUT, 2.8);

      // Far Arm (Left)
      const fArmX = bodyX - 6; const fArmY = bodyY + 14;
      rounded(ctx, fArmX, fArmY, 9, 18, 4, skinG(fArmX,fArmY,fArmX+9,fArmY+18), OUT, 2.8);
      ellipse(ctx, fArmX+4, fArmY+16, 5.5, 5.5, ironG(fArmX,fArmY+14,fArmX+8,fArmY+20), OUT, 2.5);

      // Head (Larger, bold outline)
      ctx.save();
      ctx.translate(headX, headY);
      ctx.rotate(headTilt);

      // Bold topknot (no fine strands)
      poly(ctx, [[-3,-14],[0,-22],[3,-14]], ironG(-3,-22,3,-14), OUT, 2.5);

      ellipse(ctx, 0, 0, 16.5, 15, skinG(-14,-13,14,12), OUT, 3.0);

      // Jaw guard (iron vs hide)
      poly(ctx, [[-12,6],[-8,14],[0,16],[8,14],[12,6]], ironG(-12,6,12,16), OUT, 2.8);

      // Huge Eyes (explicit for 48px readability)
      ellipse(ctx, -6, 0, 5.5, 4.2, "#f8f0c8", OUT, 1.5);
      ellipse(ctx, 6, 0, 5.5, 4.2, "#f8f0c8", OUT, 1.5);
      face(ctx, 0, 0, "#f8f0c8", "#101008", true);

      // Tusks (bold, high contrast)
      ellipse(ctx, -14, -8, 5.5, 8, linGrad(ctx,-17,-13,-10,-4,[ [0,'#fff'],[0.5,'#f0e6d2'],[1,'#8c7a54'] ]), OUT, 2.0);
      ellipse(ctx, 14, -8, 5.5, 8, linGrad(ctx,10,-13,17,-4,[ [0,'#fff'],[0.5,'#f0e6d2'],[1,'#8c7a54'] ]), OUT, 2.0);

      ctx.restore();

      // Right Arm & Club (Foreground, bold silhouette)
      const clubX = bodyX + 36; const clubY = bodyY + 4;
      ctx.save();
      ctx.translate(clubX, clubY);
      const rot = f===0 ? -0.2 : f===1 ? 0.05 : f===2 ? 0.3 : -0.05;
      ctx.rotate(rot);

      rounded(ctx, -4, 8, 10, 22, 4.5, skinG(-4,8,6,30), OUT, 2.8);
      rounded(ctx, -5, 16, 12, 8, 3, ironG(-5,16,7,24), OUT, 2.8);

      rounded(ctx, -3, -10, 7, 28, 2.5, linGrad(ctx,-3,-10,4,18,[ [0,'#9c7a56'],[0.5,'#6e4a28'],[1,'#3a2010'] ]), OUT, 3.0);
      ellipse(ctx, 0.5, -14, 12, 10, ironG(-11,-23,12,-5), OUT, 3.0);

      poly(ctx, [[-10,-6],[10,-6],[9,-2],[-9,-2]], "#e8edf2", OUT, 1.5);
      poly(ctx, [[-12,-14],[-8,-18],[-8,-10]], "#e0d8c4", OUT, 2.0);
      poly(ctx, [[12,-14],[8,-18],[8,-10]], "#e0d8c4", OUT, 2.0);
      poly(ctx, [[0,-23],[-3,-19],[3,-19]], "#e0d8c4", OUT, 2.0);

      ellipse(ctx, 0.5, 12, 6, 6, skinG(-3,9,6,15), OUT, 2.5);

      ctx.restore();
    };


    const drawBruteDead = (ctx) => {
      shadow(ctx, 40, 58, 34, 7, 0.45);
      const outline = "#3a2010";
      const bruteSkinLit = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#f8d2a6"], [0.45, "#c4763e"], [1, "#662e14"]]);
      const bruteSkinShaded = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#a4582a"], [0.5, "#6e3216"], [1, "#3c1608"]]);

      // Dropped club lying flat
      ctx.save();
      ctx.translate(14, 52);
      ctx.rotate(0.12);
      rounded(ctx, 0, -3, 22, 6, 2, linGrad(ctx, 0, -3, 0, 3, [[0, "#9c6e48"], [1, "#2e1608"]]), "#1a1008", 1.4);
      ellipse(ctx, 24, 0, 8, 7, linGrad(ctx, 16, -7, 32, 7, [[0, "#8a5c3c"], [1, "#26140a"]]), "#1a1008", 1.4);
      for (const [ix, iy] of [[20, -5], [28, -4], [24, 5]]) {
        ellipse(ctx, ix, iy, 1.5, 1.5, "#d0a870", "#2a1808", 0.7);
      }
      poly(ctx, [[32, 0], [35, -2], [35, 2]], "#e8edf2", "#2a1808", 0.7);
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(35, -2); ctx.lineTo(32, 0); ctx.stroke();
      ctx.restore();

      // Back leg & boot
      poly(ctx, [[18, 46], [8, 52], [10, 58], [22, 53]], bruteSkinShaded(8, 46, 22, 58), outline, 2.2);
      rounded(ctx, 4, 52, 9, 5.5, 2, "#361a0c", outline, 1.1);

      // Front leg & boot
      poly(ctx, [[24, 48], [16, 56], [20, 60], [28, 54]], bruteSkinLit(16, 48, 28, 60), outline, 2.2);
      rounded(ctx, 13, 56, 10, 5.5, 2, "#361a0c", outline, 1.1);

      // Heavy muscular torso collapsed forward
      rounded(ctx, 24, 38, 34, 20, 8, bruteSkinLit(24, 38, 58, 58), outline, 2.2);

      // Collapsed hide war-kilt folds
      poly(ctx, [[28, 48], [38, 48], [39, 54], [27, 54]], linGrad(ctx, 27, 48, 39, 54, [[0, "#5a341a"], [1, "#261208"]]), outline, 1.1);
      ctx.strokeStyle = "rgba(18, 6, 2, 0.55)"; ctx.lineWidth = 1.0; ctx.beginPath(); ctx.moveTo(33, 48); ctx.lineTo(33, 54); ctx.stroke();

      // Muscle creases
      ctx.strokeStyle = "rgba(40, 14, 6, 0.45)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(34, 42);
      ctx.lineTo(48, 44);
      ctx.moveTo(32, 48);
      ctx.lineTo(46, 50);
      ctx.stroke();

      // Left shoulder & limp arm
      ellipse(ctx, 28, 42, 8, 7, bruteSkinLit(20, 35, 36, 49), outline, 1.5);
      rounded(ctx, 18, 48, 12, 6, 3, bruteSkinShaded(18, 48, 30, 54), outline, 1.2);
      ellipse(ctx, 17, 51, 4, 4, bruteSkinLit(13, 47, 21, 55), outline, 1.1);

      // Massive head slumped on dirt
      ellipse(ctx, 58, 44, 13, 12, bruteSkinLit(45, 32, 71, 56), outline, 2);

      // Slumped topknot hair strands on dirt
      poly(ctx, [[69, 44], [76, 47], [70, 49]], "#140a04", "#0a0402", 0.8);
      ctx.strokeStyle = "rgba(215, 165, 115, 0.45)"; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(69, 45); ctx.lineTo(75, 47); ctx.stroke();

      // Horns (one chipped)
      ellipse(ctx, 64, 35, 4, 6, "#faecc8", "#4a3018", 1.1);
      ellipse(ctx, 55, 34, 3.5, 4.5, "#faecc8", "#4a3018", 1.1);

      // Knocked out X eye
      ctx.strokeStyle = "#2a1408";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(56, 42);
      ctx.lineTo(61, 47);
      ctx.moveTo(61, 42);
      ctx.lineTo(56, 47);
      ctx.stroke();

      // Tusk & jaw
      ellipse(ctx, 62, 49, 3, 5, "#ffffff", "#4a3018", 1);

      // Dust speckles
      speckles(ctx, 12, 54, 56, 8, 5, "rgba(200, 180, 160, 0.4)", 1.5);
    };

    make("enemy_brute", 80, 72, (ctx) => drawBrute(ctx, 0));
    make("enemy_brute_w0", 80, 72, (ctx) => drawBrute(ctx, 0));
    make("enemy_brute_w1", 80, 72, (ctx) => drawBrute(ctx, 1));
    make("enemy_brute_w2", 80, 72, (ctx) => drawBrute(ctx, 2));
    make("enemy_brute_w3", 80, 72, (ctx) => drawBrute(ctx, 3));
    make("enemy_brute_dead", 80, 72, (ctx) => drawBruteDead(ctx));

    const drawShield = (ctx, frame = 0) => {
      shadow(ctx, 40, 63, 24, 7, 0.45);
      const f = frame % 4;
      const bodyY = (f === 1 || f === 3) ? 23 : 25;
      const headY = (f === 1 || f === 3) ? 15 : 17;
      const OUT = "#141008";

      const steelG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#ffffff"], [0.25, "#d4dde6"], [0.65, "#7a8a99"], [1, "#36424e"]]);
      const darkSteelG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#8292a0"], [0.5, "#475564"], [1, "#1e262e"]]);
      const goldG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff2a8"], [0.5, "#e0ad28"], [1, "#7a5508"]]);
      const clothG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#9c2424"], [0.6, "#661414"], [1, "#360808"]]);

      // Legs / Greaves & Sabatons
      if (f === 0) {
        // Left leg forward stride
        poly(ctx, [[26, 42], [35, 42], [28, 55], [19, 55]], steelG(19, 42, 35, 55), OUT, 2.8);
        rounded(ctx, 16, 53, 14, 7, 3, darkSteelG(16, 53, 30, 60), OUT, 2.6);
        // Right leg trailing
        poly(ctx, [[43, 42], [52, 42], [57, 53], [48, 54]], darkSteelG(43, 42, 57, 54), OUT, 2.8);
        rounded(ctx, 47, 51, 13, 6.5, 3, darkSteelG(47, 51, 60, 58), OUT, 2.6);
      } else if (f === 1) {
        // Left leg planted
        rounded(ctx, 27, 40, 11, 16, 4, steelG(27, 40, 38, 56), OUT, 2.8);
        rounded(ctx, 25, 54, 15, 7, 3, darkSteelG(25, 54, 40, 61), OUT, 2.6);
        // Right leg lifted passing
        poly(ctx, [[43, 39], [51, 39], [53, 48], [45, 49]], darkSteelG(43, 39, 53, 49), OUT, 2.8);
        rounded(ctx, 44, 46, 12, 6.5, 3, darkSteelG(44, 46, 56, 53), OUT, 2.6);
      } else if (f === 2) {
        // Left leg trailing
        poly(ctx, [[26, 42], [35, 42], [22, 54], [14, 53]], darkSteelG(14, 42, 35, 54), OUT, 2.8);
        rounded(ctx, 13, 51, 13, 6.5, 3, darkSteelG(13, 51, 26, 58), OUT, 2.6);
        // Right leg forward stride
        poly(ctx, [[43, 42], [52, 42], [58, 55], [49, 55]], steelG(43, 42, 58, 55), OUT, 2.8);
        rounded(ctx, 47, 53, 14, 7, 3, darkSteelG(47, 53, 61, 60), OUT, 2.6);
      } else {
        // Left leg lifted passing
        poly(ctx, [[26, 39], [34, 39], [36, 48], [28, 49]], darkSteelG(26, 39, 36, 49), OUT, 2.8);
        rounded(ctx, 27, 46, 12, 6.5, 3, darkSteelG(27, 46, 39, 53), OUT, 2.6);
        // Right leg planted
        rounded(ctx, 42, 40, 11, 16, 4, steelG(42, 40, 53, 56), OUT, 2.8);
        rounded(ctx, 40, 54, 15, 7, 3, darkSteelG(40, 54, 55, 61), OUT, 2.6);
      }

      // Crimson under-tabard / sash
      rounded(ctx, 27, bodyY + 12, 26, 14, 3, clothG(27, bodyY + 12, 53, bodyY + 26), OUT, 2.6);
      poly(ctx, [[35, bodyY + 24], [40, bodyY + 28], [45, bodyY + 24]], "#ffe08a", OUT, 1.5);

      // Heavy Cuirass (Breastplate)
      rounded(ctx, 24, bodyY, 32, 22, 7, steelG(24, bodyY, 56, bodyY + 22), OUT, 3.0);
      // Gold trim on armor
      poly(ctx, [[26, bodyY + 2], [32, bodyY + 2], [40, bodyY + 10], [48, bodyY + 2], [54, bodyY + 2], [53, bodyY + 6], [40, bodyY + 14], [27, bodyY + 6]], goldG(26, bodyY, 54, bodyY + 14), OUT, 1.8);
      // Breastplate center ridge highlight
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(40, bodyY + 3);
      ctx.lineTo(40, bodyY + 20);
      ctx.stroke();

      // Right shoulder pauldron (behind arm)
      rounded(ctx, 50, bodyY - 2, 14, 12, 4, steelG(50, bodyY - 2, 64, bodyY + 10), OUT, 2.6);
      ellipse(ctx, 57, bodyY + 2, 4, 3, goldG(53, bodyY - 1, 61, bodyY + 5), OUT, 1.5);

      // Knight Greathelm
      ellipse(ctx, 40, headY, 15, 14, steelG(25, headY - 14, 55, headY + 14), OUT, 3.0);
      // Helm brow ridge
      rounded(ctx, 26, headY - 6, 28, 8, 3, darkSteelG(26, headY - 6, 54, headY + 2), OUT, 2.2);
      // Visor slit with glowing intense cream/amber eye glint
      rounded(ctx, 29, headY - 1, 22, 5.5, 2, "#080604", OUT, 2.0);
      ellipse(ctx, 36, headY + 1.5, 3.2, 1.8, "#fff8d0");
      ellipse(ctx, 44, headY + 1.5, 3.2, 1.8, "#fff8d0");
      ellipse(ctx, 36.5, headY + 1.5, 1.5, 1.6, "#ff9900");
      ellipse(ctx, 44.5, headY + 1.5, 1.5, 1.6, "#ff9900");
      // Gold crest / cross on helmet
      poly(ctx, [[38, headY - 13], [42, headY - 13], [42, headY - 4], [38, headY - 4]], goldG(38, headY - 13, 42, headY - 4), OUT, 1.5);
      poly(ctx, [[34, headY - 10], [46, headY - 10], [46, headY - 7], [34, headY - 7]], goldG(34, headY - 10, 46, headY - 7), OUT, 1.5);
      // Plume / feather on top of helmet
      poly(ctx, [[40, headY - 12], [46, headY - 20], [39, headY - 17], [34, headY - 20]], linGrad(ctx, 34, headY - 20, 46, headY - 12, [[0, "#ff4040"], [0.6, "#b81414"], [1, "#500606"]]), OUT, 2.0);

      // Massive Heavy Shield (Left arm side)
      let shDx = 0, shDy = 0, shRot = 0;
      if (f === 0) { shDx = 0; shDy = 0; shRot = 0; }
      else if (f === 1) { shDx = -1; shDy = -2; shRot = -0.06; }
      else if (f === 2) { shDx = 1; shDy = 1; shRot = 0.05; }
      else { shDx = 0; shDy = -1; shRot = -0.02; }

      ctx.save();
      ctx.translate(22 + shDx, bodyY + 11 + shDy);
      ctx.rotate(shRot);
      // Shield plate
      poly(
        ctx,
        [[-10, -16], [11, -16], [13, 11], [0, 22], [-12, 11]],
        steelG(-12, -16, 13, 22),
        OUT,
        3.0
      );
      // Shield thick gold rim
      poly(
        ctx,
        [[-7, -13], [8, -13], [10, 8], [0, 17], [-9, 8]],
        clothG(-9, -13, 10, 17),
        goldG(-9, -13, 10, 17),
        2.2
      );
      // Shield gold cross emblem
      poly(ctx, [[-2, -10], [3, -10], [3, 12], [-2, 12]], goldG(-2, -10, 3, 12), OUT, 1.5);
      poly(ctx, [[-6, -3], [7, -3], [7, 2], [-6, 2]], goldG(-6, -3, 7, 2), OUT, 1.5);
      // Highlight on shield bevel
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-9, -14);
      ctx.lineTo(9, -14);
      ctx.stroke();
      ctx.restore();

      // Right Arm with Heavy Sword
      let sw0x, sw0y, sw1x, sw1y;
      if (f === 0) {
        sw0x = 55; sw0y = bodyY + 22; sw1x = 68; sw1y = bodyY - 10;
      } else if (f === 1) {
        sw0x = 54; sw0y = bodyY + 19; sw1x = 66; sw1y = bodyY - 14;
      } else if (f === 2) {
        sw0x = 56; sw0y = bodyY + 18; sw1x = 70; sw1y = bodyY - 8;
      } else {
        sw0x = 55; sw0y = bodyY + 21; sw1x = 67; sw1y = bodyY - 12;
      }

      // Sword Blade (Thick & glistening)
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 5.2;
      ctx.beginPath();
      ctx.moveTo(sw0x, sw0y);
      ctx.lineTo(sw1x, sw1y);
      ctx.stroke();

      ctx.strokeStyle = "#e8f0f8";
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(sw0x, sw0y);
      ctx.lineTo(sw1x, sw1y);
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(sw0x - 0.7, sw0y);
      ctx.lineTo(sw1x - 0.7, sw1y);
      ctx.stroke();

      // Sword Crossguard & Pommel
      ctx.save();
      ctx.translate(sw0x, sw0y);
      const swAngle = Math.atan2(sw1y - sw0y, sw1x - sw0x);
      ctx.rotate(swAngle + Math.PI / 2);
      rounded(ctx, -8, -3, 16, 5, 2, goldG(-8, -3, 8, 2), OUT, 2.2);
      rounded(ctx, -2.5, 2, 5, 8, 2, "#4a321c", OUT, 1.8);
      ellipse(ctx, 0, 11, 3.5, 3.5, goldG(-3, 8, 3, 14), OUT, 2.0);
      // Armored gauntlet holding sword
      ellipse(ctx, 0, 3, 4.5, 4.5, steelG(-4, 0, 4, 7), OUT, 2.2);
      ctx.restore();
    };

    const drawShieldDead = (ctx) => {
      shadow(ctx, 40, 58, 34, 7, 0.45);
      const OUT = "#141008";
      const steelG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#ffffff"], [0.25, "#d4dde6"], [0.65, "#7a8a99"], [1, "#36424e"]]);
      const darkSteelG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#8292a0"], [0.5, "#475564"], [1, "#1e262e"]]);
      const goldG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff2a8"], [0.5, "#e0ad28"], [1, "#7a5508"]]);
      const clothG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#9c2424"], [0.6, "#661414"], [1, "#360808"]]);

      // Fallen large shield tilted in dirt
      poly(
        ctx,
        [[12, 52], [36, 44], [48, 56], [32, 64], [14, 60]],
        steelG(12, 44, 48, 64),
        OUT,
        3.0
      );
      poly(ctx, [[18, 50], [33, 46], [39, 54], [26, 59]], clothG(18, 46, 39, 59), goldG(18, 46, 39, 59), 2.0);
      // Crack on fallen shield
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(22, 48);
      ctx.lineTo(29, 53);
      ctx.lineTo(26, 58);
      ctx.stroke();

      // Dropped broadsword
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 5.0;
      ctx.beginPath();
      ctx.moveTo(52, 58);
      ctx.lineTo(76, 53);
      ctx.stroke();

      ctx.strokeStyle = "#d4dde6";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(52, 58);
      ctx.lineTo(76, 53);
      ctx.stroke();

      rounded(ctx, 48, 55, 7, 6, 2, goldG(48, 55, 55, 61), OUT, 2.0);

      // Crumpled plate armor body
      rounded(ctx, 30, 40, 26, 17, 6, steelG(30, 40, 56, 57), OUT, 3.0);
      rounded(ctx, 34, 46, 18, 7, 2, clothG(34, 46, 52, 53), OUT, 2.0);

      // Armored legs slumped
      poly(ctx, [[48, 47], [64, 49], [62, 56], [46, 54]], darkSteelG(46, 47, 64, 56), OUT, 2.6);
      rounded(ctx, 60, 49, 11, 6, 2.5, darkSteelG(60, 49, 71, 55), OUT, 2.2);

      // Helmet fallen askew
      ellipse(ctx, 28, 41, 13, 12, steelG(18, 32, 38, 50), OUT, 3.0);
      rounded(ctx, 21, 40, 14, 4, 1.5, "#080604", OUT, 1.8);
      poly(ctx, [[28, 29], [32, 29], [32, 36], [28, 36]], goldG(28, 29, 32, 36), OUT, 1.5);
    };

    make("enemy_shield", 80, 72, (ctx) => drawShield(ctx, 0));
    make("enemy_shield_w0", 80, 72, (ctx) => drawShield(ctx, 0));
    make("enemy_shield_w1", 80, 72, (ctx) => drawShield(ctx, 1));
    make("enemy_shield_w2", 80, 72, (ctx) => drawShield(ctx, 2));
    make("enemy_shield_w3", 80, 72, (ctx) => drawShield(ctx, 3));
    make("enemy_shield_dead", 80, 72, (ctx) => drawShieldDead(ctx));

    const drawEmber = (ctx, frame = 0) => {
      const f = frame % 4;
      const shY = (f === 1 || f === 3) ? 61 : 63;
      const shR = (f === 1 || f === 3) ? 18 : 22;
      shadow(ctx, 40, shY, shR, 6, 0.45);
      const OUT = "#141008";

      const flameG = (y0, y1) => linGrad(ctx, 40, y0, 40, y1, [[0, "#ffffff"], [0.25, "#ffe650"], [0.55, "#ff6a14"], [0.85, "#d01c04"], [1, "#540804"]]);
      const crustG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#4a3b32"], [0.5, "#2c1e18"], [1, "#120a08"]]);
      const magmaG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff59a"], [0.5, "#ff7700"], [1, "#ba1100"]]);

      // Running stride & flame shape variants
      let flamePoly, coreX, coreY, headY, legL, legR, embers;
      if (f === 0) {
        // Left stride forward
        flamePoly = [
          [36, 4], [22, 22], [28, 25], [14, 44], [26, 42],
          [30, 52], [42, 45], [54, 52], [52, 34], [62, 24], [48, 18]
        ];
        coreX = 38; coreY = 32; headY = 24;
        legL = [[24, 42], [32, 42], [20, 57], [13, 56]];
        legR = [[44, 42], [52, 42], [59, 54], [50, 55]];
        embers = [[18, 16, 3.5], [62, 16, 3.0], [28, 8, 2.5], [54, 10, 3.0], [42, 2, 2.2]];
      } else if (f === 1) {
        // Left planted, right lift
        flamePoly = [
          [40, 2], [24, 20], [30, 23], [18, 41], [29, 39],
          [34, 50], [44, 43], [58, 48], [54, 30], [64, 20], [50, 14]
        ];
        coreX = 40; coreY = 30; headY = 22;
        legL = [[25, 40], [35, 40], [29, 57], [22, 57]];
        legR = [[45, 38], [53, 38], [56, 48], [48, 49]];
        embers = [[16, 20, 3.0], [64, 12, 3.5], [32, 5, 2.8], [58, 8, 2.5], [40, 1, 2.0]];
      } else if (f === 2) {
        // Right stride forward
        flamePoly = [
          [44, 4], [28, 18], [18, 24], [26, 34], [24, 52],
          [36, 45], [48, 52], [54, 42], [66, 44], [52, 25], [58, 22]
        ];
        coreX = 42; coreY = 32; headY = 24;
        legL = [[24, 42], [32, 42], [18, 54], [11, 55]];
        legR = [[44, 42], [52, 42], [60, 57], [53, 56]];
        embers = [[14, 18, 3.2], [62, 22, 3.0], [26, 9, 2.5], [52, 6, 3.2], [46, 3, 2.4]];
      } else {
        // Right planted, left lift
        flamePoly = [
          [38, 3], [22, 19], [28, 22], [16, 40], [28, 38],
          [33, 49], [43, 42], [56, 47], [52, 29], [62, 19], [48, 13]
        ];
        coreX = 40; coreY = 31; headY = 23;
        legL = [[23, 38], [31, 38], [34, 48], [26, 49]];
        legR = [[43, 40], [53, 40], [47, 57], [40, 57]];
        embers = [[20, 14, 3.0], [60, 16, 3.0], [30, 6, 2.5], [56, 11, 2.8], [38, 2, 2.0]];
      }

      // Obsidian / magma runner legs
      poly(ctx, legL, crustG(10, 38, 35, 57), OUT, 2.8);
      poly(ctx, legR, crustG(40, 38, 65, 57), OUT, 2.8);
      // Magma knee glow
      ellipse(ctx, (legL[0][0] + legL[2][0]) / 2, (legL[0][1] + legL[2][1]) / 2, 3, 3, "#ff7700");
      ellipse(ctx, (legR[0][0] + legR[2][0]) / 2, (legR[0][1] + legR[2][1]) / 2, 3, 3, "#ff7700");

      // Main Outer Flame Body
      poly(ctx, flamePoly, flameG(flamePoly[0][1], 54), OUT, 3.0);

      // Charcoal Crust Armor Plates (Shoulders & Torso ribs)
      rounded(ctx, coreX - 16, coreY - 4, 10, 16, 3, crustG(coreX - 16, coreY - 4, coreX - 6, coreY + 12), OUT, 2.4);
      rounded(ctx, coreX + 6, coreY - 4, 10, 16, 3, crustG(coreX + 6, coreY - 4, coreX + 16, coreY + 12), OUT, 2.4);
      rounded(ctx, coreX - 8, coreY + 4, 16, 12, 4, crustG(coreX - 8, coreY + 4, coreX + 8, coreY + 16), OUT, 2.4);
      // Magma cracks on crust
      ctx.strokeStyle = "#ffe460";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(coreX - 4, coreY + 6);
      ctx.lineTo(coreX + 4, coreY + 10);
      ctx.moveTo(coreX - 12, coreY + 2);
      ctx.lineTo(coreX - 8, coreY + 6);
      ctx.moveTo(coreX + 12, coreY + 2);
      ctx.lineTo(coreX + 8, coreY + 6);
      ctx.stroke();

      // Blazing Radiant Core
      ellipse(ctx, coreX, coreY - 2, 12, 14, radGrad(ctx, coreX, coreY - 3, 1, 14, [[0, "#ffffff"], [0.35, "#fff060"], [0.75, "#ff5500"], [1, "rgba(200,20,0,0)"]]));

      // Huge Cream Eyes (Bold & readable)
      const eyeDx = f === 0 ? -1 : f === 2 ? 1 : 0;
      const eyeLeftX = coreX - 6 + eyeDx;
      const eyeRightX = coreX + 6 + eyeDx;
      const eY = headY;

      // Eye sclera (Huge cream)
      ellipse(ctx, eyeLeftX, eY, 4.0, 4.8, "#fffbe0", OUT, 2.4);
      ellipse(ctx, eyeRightX, eY, 4.0, 4.8, "#fffbe0", OUT, 2.4);
      // Burning pupils
      ellipse(ctx, eyeLeftX + (eyeDx ? eyeDx * 0.5 : 0), eY + 0.3, 2.2, 2.8, "#4a0800");
      ellipse(ctx, eyeRightX + (eyeDx ? eyeDx * 0.5 : 0), eY + 0.3, 2.2, 2.8, "#4a0800");
      // Fire glint highlight
      ellipse(ctx, eyeLeftX - 1.0, eY - 1.2, 1.2, 1.2, "#ffffff");
      ellipse(ctx, eyeRightX - 1.0, eY - 1.2, 1.2, 1.2, "#ffffff");
      // Fierce Brow
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(eyeLeftX - 4, eY - 4);
      ctx.lineTo(eyeLeftX + 3, eY - 2);
      ctx.moveTo(eyeRightX + 4, eY - 4);
      ctx.lineTo(eyeRightX - 3, eY - 2);
      ctx.stroke();

      // Bold Sparks & Floating Fire Motes
      for (const [x, y, r] of embers) {
        ellipse(ctx, x, y, r, r, "#ffcc00", OUT, 1.5);
        ellipse(ctx, x - 0.4, y - 0.4, r * 0.5, r * 0.5, "#ffffff");
      }
    };

    const drawEmberDead = (ctx) => {
      shadow(ctx, 40, 58, 28, 7, 0.45);
      const OUT = "#141008";
      const crustG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#5a4840"], [0.5, "#2a1c18"], [1, "#100604"]]);

      // Crumbled charcoal cinder mound
      poly(
        ctx,
        [[16, 56], [24, 42], [38, 46], [48, 40], [60, 44], [66, 56], [42, 62]],
        crustG(16, 40, 66, 62),
        OUT,
        2.8
      );

      // Glowing magma cracks in charcoal
      ctx.strokeStyle = "#ff4400";
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(26, 52);
      ctx.lineTo(36, 48);
      ctx.lineTo(44, 53);
      ctx.moveTo(46, 46);
      ctx.lineTo(56, 50);
      ctx.stroke();

      ctx.strokeStyle = "#fff060";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(28, 52);
      ctx.lineTo(35, 48);
      ctx.moveTo(47, 47);
      ctx.lineTo(53, 50);
      ctx.stroke();

      ellipse(ctx, 34, 38, 3.5, 2.5, "rgba(90, 80, 75, 0.5)");
      ellipse(ctx, 48, 34, 4.5, 3, "rgba(90, 80, 75, 0.4)");
      ellipse(ctx, 42, 26, 3, 2, "rgba(110, 100, 95, 0.3)");
      ellipse(ctx, 54, 22, 2.2, 1.5, "rgba(120, 110, 105, 0.2)");

      // Cooling cinders
      for (const [cx, cy] of [[20, 58], [24, 60], [58, 59], [62, 57]]) {
        ellipse(ctx, cx, cy, 1.5, 1.2, "#2a1a14");
      }
    };

    make("enemy_ember", 80, 72, (ctx) => drawEmber(ctx, 0));
    make("enemy_ember_w0", 80, 72, (ctx) => drawEmber(ctx, 0));
    make("enemy_ember_w1", 80, 72, (ctx) => drawEmber(ctx, 1));
    make("enemy_ember_w2", 80, 72, (ctx) => drawEmber(ctx, 2));
    make("enemy_ember_w3", 80, 72, (ctx) => drawEmber(ctx, 3));
    make("enemy_ember_dead", 80, 72, (ctx) => drawEmberDead(ctx));

    const drawBrood = (ctx, frame = 0) => {
      shadow(ctx, 40, 62, 26, 7, 0.45);
      const f = frame % 4;
      const headY = (f === 1 || f === 3) ? 25 : 27;
      const abdY = (f === 1 || f === 3) ? 42 : 44;
      const OUT = "#141008";

      const chitinG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#ff80c0"], [0.35, "#c83884"], [0.75, "#70184a"], [1, "#28061a"]]);
      const venomG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#d8ff60"], [0.6, "#58d010"], [1, "#185804"]]);
      const legG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#a03068"], [0.6, "#501434"], [1, "#180410"]]);

      // Thick Jointed Insect Legs - Tripod Gait
      let legSegments;
      if (f === 0) {
        legSegments = [
          // [kneeX, kneeY, footX, footY] from left body (28, headY+6)
          [[16, headY - 4, 8, headY + 18], [14, headY + 6, 6, headY + 28], [18, headY + 16, 12, headY + 34]],
          // from right body (52, headY+6)
          [[64, headY - 1, 72, headY + 22], [66, headY + 9, 74, headY + 31], [62, headY + 14, 68, headY + 32]]
        ];
      } else if (f === 1) {
        legSegments = [
          [[18, headY - 1, 14, headY + 16], [12, headY + 4, 6, headY + 27], [20, headY + 12, 16, headY + 31]],
          [[62, headY - 4, 70, headY + 18], [68, headY + 6, 75, headY + 33], [60, headY + 16, 69, headY + 35]]
        ];
      } else if (f === 2) {
        legSegments = [
          [[18, headY - 1, 10, headY + 22], [12, headY + 8, 7, headY + 31], [20, headY + 14, 14, headY + 32]],
          [[64, headY - 4, 72, headY + 18], [66, headY + 6, 74, headY + 28], [62, headY + 16, 68, headY + 34]]
        ];
      } else {
        legSegments = [
          [[16, headY - 4, 10, headY + 18], [14, headY + 6, 5, headY + 33], [18, headY + 16, 11, headY + 35]],
          [[62, headY - 1, 66, headY + 16], [68, headY + 4, 74, headY + 27], [60, headY + 12, 64, headY + 31]]
        ];
      }

      // Draw Legs with thick jointed silhouette
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const leftOrigins = [[28, headY + 2], [26, headY + 8], [28, headY + 14]];
      const rightOrigins = [[52, headY + 2], [54, headY + 8], [52, headY + 14]];

      for (let i = 0; i < 3; i += 1) {
        const l = legSegments[0][i];
        const lo = leftOrigins[i];
        // Outer thick stroke
        ctx.strokeStyle = OUT;
        ctx.lineWidth = 4.8;
        ctx.beginPath();
        ctx.moveTo(lo[0], lo[1]);
        ctx.lineTo(l[0], l[1]);
        ctx.lineTo(l[2], l[3]);
        ctx.stroke();
        // Inner fill
        ctx.strokeStyle = legG(lo[0], lo[1], l[2], l[3]);
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(lo[0], lo[1]);
        ctx.lineTo(l[0], l[1]);
        ctx.lineTo(l[2], l[3]);
        ctx.stroke();

        const r = legSegments[1][i];
        const ro = rightOrigins[i];
        ctx.strokeStyle = OUT;
        ctx.lineWidth = 4.8;
        ctx.beginPath();
        ctx.moveTo(ro[0], ro[1]);
        ctx.lineTo(r[0], r[1]);
        ctx.lineTo(r[2], r[3]);
        ctx.stroke();
        ctx.strokeStyle = legG(ro[0], ro[1], r[2], r[3]);
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(ro[0], ro[1]);
        ctx.lineTo(r[0], r[1]);
        ctx.lineTo(r[2], r[3]);
        ctx.stroke();
      }

      // Large Swollen Abdomen (Venom Sac with Split Carapace)
      ellipse(ctx, 40, abdY, 19, 15, chitinG(20, abdY - 14, 60, abdY + 15), OUT, 3.0);
      // Bioluminescent venom split / glow in center
      poly(ctx, [[37, abdY - 10], [43, abdY - 10], [46, abdY + 4], [40, abdY + 12], [34, abdY + 4]], venomG(34, abdY - 10, 46, abdY + 12), OUT, 2.0);
      // Carapace spine ridges
      poly(ctx, [[28, abdY - 6], [22, abdY - 2], [29, abdY + 2]], chitinG(22, abdY - 6, 29, abdY + 2), OUT, 2.0);
      poly(ctx, [[52, abdY - 6], [58, abdY - 2], [51, abdY + 2]], chitinG(51, abdY - 6, 58, abdY + 2), OUT, 2.0);
      // Glowing toxic spots
      ellipse(ctx, 33, abdY + 4, 2.8, 2.2, "#a8ff30");
      ellipse(ctx, 47, abdY + 4, 2.8, 2.2, "#a8ff30");

      // Armored Cephalothorax (Head + Upper Shell)
      ellipse(ctx, 40, headY, 15, 13, chitinG(25, headY - 12, 55, headY + 13), OUT, 3.0);
      // Shell crest plate
      rounded(ctx, 30, headY - 10, 20, 8, 4, chitinG(30, headY - 10, 50, headY - 2), OUT, 2.2);

      // Huge Expressive Cream Eyes (Bug compound gaze)
      ellipse(ctx, 34, headY - 1, 4.2, 4.8, "#fffbe0", OUT, 2.4);
      ellipse(ctx, 46, headY - 1, 4.2, 4.8, "#fffbe0", OUT, 2.4);
      // Emerald / Toxic pupils
      ellipse(ctx, 34.5, headY - 0.5, 2.4, 3.0, "#083010");
      ellipse(ctx, 45.5, headY - 0.5, 2.4, 3.0, "#083010");
      ellipse(ctx, 34.5, headY - 0.5, 1.2, 1.6, "#58d010");
      ellipse(ctx, 45.5, headY - 0.5, 1.2, 1.6, "#58d010");
      // Eye glint highlights
      ellipse(ctx, 33.2, headY - 2.2, 1.2, 1.2, "#ffffff");
      ellipse(ctx, 44.8, headY - 2.2, 1.2, 1.2, "#ffffff");
      // Secondary glowing micro eyes
      ellipse(ctx, 40, headY - 6, 1.8, 1.8, "#ffe060", OUT, 1.2);
      ellipse(ctx, 36, headY - 5.5, 1.4, 1.4, "#ffe060");
      ellipse(ctx, 44, headY - 5.5, 1.4, 1.4, "#ffe060");

      // Heavy curved dripping mandibles / fangs
      const fangSpread = (f === 1 || f === 3) ? 1.5 : 0;
      poly(ctx, [[35 - fangSpread, headY + 7], [30 - fangSpread, headY + 16], [38 - fangSpread, headY + 11]], linGrad(ctx, 30, headY + 7, 38, headY + 16, [[0, "#ffffff"], [0.5, "#e0f0c0"], [1, "#80a840"]]), OUT, 2.2);
      poly(ctx, [[45 + fangSpread, headY + 7], [50 + fangSpread, headY + 16], [42 + fangSpread, headY + 11]], linGrad(ctx, 42, headY + 7, 50, headY + 16, [[0, "#ffffff"], [0.5, "#e0f0c0"], [1, "#80a840"]]), OUT, 2.2);
      // Venom droplet
      ellipse(ctx, 30 - fangSpread, headY + 17, 1.5, 2.0, "#90ff20");
    };

    const drawBroodDead = (ctx) => {
      shadow(ctx, 40, 58, 28, 7, 0.45);
      const OUT = "#141008";
      const chitinG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#c03878"], [0.5, "#70184a"], [1, "#28061a"]]);

      // Toxic slime puddle
      ellipse(ctx, 40, 58, 24, 6, "rgba(90, 210, 20, 0.5)");

      // Curled spider legs tightly curled upward
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 4.2;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(32, 50); ctx.quadraticCurveTo(16, 36, 22, 26); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(34, 54); ctx.quadraticCurveTo(12, 46, 18, 32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(48, 50); ctx.quadraticCurveTo(64, 36, 58, 26); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(46, 54); ctx.quadraticCurveTo(68, 46, 62, 32); ctx.stroke();

      ctx.strokeStyle = "#501434";
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(32, 50); ctx.quadraticCurveTo(16, 36, 22, 26); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(34, 54); ctx.quadraticCurveTo(12, 46, 18, 32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(48, 50); ctx.quadraticCurveTo(64, 36, 58, 26); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(46, 54); ctx.quadraticCurveTo(68, 46, 62, 32); ctx.stroke();

      // Burst cracked abdomen
      ellipse(ctx, 40, 50, 18, 12, chitinG(22, 40, 58, 62), OUT, 2.8);
      // Abdomen rupture crack leaking slime
      poly(ctx, [[35, 47], [45, 49], [40, 56]], "#88ff20", OUT, 1.8);

      // Deflated Cephalothorax
      ellipse(ctx, 40, 42, 12, 9, chitinG(28, 34, 52, 50), OUT, 2.6);

      // Dead milky eyes
      ellipse(ctx, 35, 41, 3.2, 3.2, "#d0d8d0", OUT, 1.8);
      ellipse(ctx, 45, 41, 3.2, 3.2, "#d0d8d0", OUT, 1.8);
      // Limp broken fangs
      poly(ctx, [[37, 46], [33, 52], [38, 49]], "#d8e0d0", OUT, 1.5);
      poly(ctx, [[43, 46], [47, 52], [42, 49]], "#d8e0d0", OUT, 1.5);
    };

    make("enemy_brood", 80, 72, (ctx) => drawBrood(ctx, 0));
    make("enemy_brood_w0", 80, 72, (ctx) => drawBrood(ctx, 0));
    make("enemy_brood_w1", 80, 72, (ctx) => drawBrood(ctx, 1));
    make("enemy_brood_w2", 80, 72, (ctx) => drawBrood(ctx, 2));
    make("enemy_brood_w3", 80, 72, (ctx) => drawBrood(ctx, 3));
    make("enemy_brood_dead", 80, 72, (ctx) => drawBroodDead(ctx));

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
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(40, bodyY + 14);
      ctx.quadraticCurveTo(tailQuad[0], tailQuad[1], tailQuad[2], tailQuad[3]);
      ctx.stroke();

      // Core/Aura - radial gradient for pop at play scale
      const aura = radGrad(ctx, 40, bodyY - 2, 3, 16, [[0, "rgba(255,255,255,.8)"], [0.3, "rgba(160,240,255,.4)"], [1, "rgba(40,160,200,0)"]]);
      ellipse(ctx, 40, bodyY - 2, 15, 17, aura, "#141008", 3);

      // Body - bright cyan core with dark outline for readability
      const bodyFill = linGrad(ctx, 28, bodyY - 14, 52, bodyY + 14, [[0, "#f8fcff"], [0.5, "#30b8e0"], [1, "#207090"]]);
      ellipse(ctx, 40, bodyY + 2, 13.5, 15.5, bodyFill, "#141008", 3);

      // Belly plates
      ellipse(ctx, 40, bodyY + 5, 6.5, 8.5, "rgba(255,255,255,.35)", "#141008", 1.5);

      // Head
      const headFill = linGrad(ctx, 32, headY - 8, 48, headY + 8, [[0, "#ffffff"], [1, "#50c4e4"]]);
      ellipse(ctx, 40, headY, 9.5, 9.5, headFill, "#141008", 3);

      // Face - stark contrast
      face(ctx, 40, headY, "#ffffff", "#141008");

      // Horn crest
      poly(ctx, [[40, headY - 13], [35, headY - 6], [45, headY - 6]], "#c0f0ff", "#141008", 2.5);
    };

    const drawFlyerDead = (ctx) => {
      shadow(ctx, 40, 58, 30, 6, 0.35);
      ellipse(ctx, 40, 57, 24, 4, "rgba(80, 140, 170, 0.2)");

      // Broken wings crumpled on ground
      poly(
        ctx,
        [[30, 50], [8, 54], [14, 44], [24, 46], [32, 52]],
        linGrad(ctx, 8, 44, 32, 54, [[0, "rgba(160,220,240,.7)"], [1, "rgba(40,100,140,.5)"]]),
        "#2a7090",
        1.3
      );
      poly(
        ctx,
        [[50, 50], [72, 54], [66, 44], [56, 46], [48, 52]],
        linGrad(ctx, 72, 44, 48, 54, [[0, "rgba(160,220,240,.7)"], [1, "rgba(40,100,140,.5)"]]),
        "#2a7090",
        1.3
      );
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, 50); ctx.lineTo(14, 44);
      ctx.moveTo(50, 50); ctx.lineTo(66, 44);
      ctx.stroke();

      // Limp body lying flat
      ellipse(ctx, 40, 50, 13, 9, linGrad(ctx, 28, 42, 52, 58, [[0, "#d0f0fa"], [0.5, "#48a8c8"], [1, "#184860"]]), "#103040", 1.8);
      ellipse(ctx, 40, 52, 7, 5, "rgba(255,255,255,.25)");

      // Slumped head & broken crest
      ellipse(ctx, 52, 46, 8, 7, linGrad(ctx, 46, 40, 58, 52, [[0, "#e8f8fc"], [1, "#3890b0"]]), "#103040", 1.6);
      poly(ctx, [[54, 40], [60, 36], [56, 42]], "#80c8d8", "#103040", 1);

      // Knocked out X eye
      ctx.strokeStyle = "#082028";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(50, 43); ctx.lineTo(54, 47);
      ctx.moveTo(54, 43); ctx.lineTo(50, 47);
      ctx.stroke();

      // Limp tail coiled on ground
      ctx.strokeStyle = "#3890b0";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(30, 52);
      ctx.quadraticCurveTo(20, 56, 24, 60);
      ctx.quadraticCurveTo(28, 62, 34, 59);
      ctx.stroke();
    };

    make("enemy_flyer", 80, 72, (ctx) => drawFlyer(ctx, 0));
    make("enemy_flyer_w0", 80, 72, (ctx) => drawFlyer(ctx, 0));
    make("enemy_flyer_w1", 80, 72, (ctx) => drawFlyer(ctx, 1));
    make("enemy_flyer_w2", 80, 72, (ctx) => drawFlyer(ctx, 2));
    make("enemy_flyer_w3", 80, 72, (ctx) => drawFlyer(ctx, 3));
    make("enemy_flyer_dead", 80, 72, (ctx) => drawFlyerDead(ctx));

    const drawHexer = (ctx, frame = 0) => {
      shadow(ctx, 40, 63, 24, 7, 0.45);
      const f = frame % 4;
      const headOffset = (f === 1 || f === 3) ? -1 : 0;
      const OUT = "#141008";

      const robeG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#a074e8"], [0.4, "#6838a8"], [0.8, "#3c1868"], [1, "#180830"]]);
      const goldG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff4a0"], [0.5, "#d4a428"], [1, "#6a4a08"]]);
      const woodG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#8a6040"], [0.6, "#54341c"], [1, "#261408"]]);

      // Walking feet beneath flowing robe
      if (f === 0) {
        rounded(ctx, 26, 49, 10, 8, 3, "#3a2214", OUT, 2.4);
        rounded(ctx, 44, 48, 9, 7.5, 2.5, "#241208", OUT, 2.2);
      } else if (f === 1) {
        rounded(ctx, 27, 49, 10, 8, 3, "#3a2214", OUT, 2.4);
        rounded(ctx, 42, 44, 9, 7.5, 2.5, "#241208", OUT, 2.2);
      } else if (f === 2) {
        rounded(ctx, 24, 48, 9, 7.5, 2.5, "#241208", OUT, 2.2);
        rounded(ctx, 42, 49, 10, 8, 3, "#3a2214", OUT, 2.4);
      } else {
        rounded(ctx, 28, 44, 9, 7.5, 2.5, "#241208", OUT, 2.2);
        rounded(ctx, 40, 49, 10, 8, 3, "#3a2214", OUT, 2.4);
      }

      // Flowing Heavy Robe Body
      let robePoly;
      if (f === 0) {
        robePoly = [[22, 26], [56, 26], [62, 54], [40, 59], [17, 56]];
      } else if (f === 1) {
        robePoly = [[22, 25], [56, 25], [60, 55], [41, 60], [19, 55]];
      } else if (f === 2) {
        robePoly = [[22, 26], [56, 26], [64, 56], [42, 58], [20, 54]];
      } else {
        robePoly = [[22, 25], [56, 25], [61, 55], [41, 59], [18, 55]];
      }

      poly(ctx, robePoly, robeG(20, 25, 60, 60), OUT, 3.0);
      // Gold runic hem trim
      poly(ctx, [[robePoly[4][0] + 2, robePoly[4][1] - 4], [robePoly[3][0], robePoly[3][1] - 4], [robePoly[2][0] - 2, robePoly[2][1] - 4], [robePoly[2][0], robePoly[2][1]], [robePoly[3][0], robePoly[3][1]], [robePoly[4][0], robePoly[4][1]]], goldG(17, 50, 64, 60), OUT, 1.8);

      // Left arm / hand hex curse gesture
      let handX, handY, handRot;
      if (f === 0) { handX = 16; handY = 34; handRot = -0.15; }
      else if (f === 1) { handX = 13; handY = 28; handRot = -0.35; }
      else if (f === 2) { handX = 17; handY = 36; handRot = 0.1; }
      else { handX = 14; handY = 31; handRot = -0.2; }

      ctx.save();
      ctx.translate(handX, handY);
      ctx.rotate(handRot);
      // Robe sleeve
      poly(ctx, [[-4, -6], [8, -8], [12, 6], [-2, 8]], robeG(-4, -8, 12, 8), OUT, 2.6);
      // Hand casting hex spark
      ellipse(ctx, -2, 1, 3.8, 3.8, "#cca8e8", OUT, 2.0);
      // Floating curse orb in left palm
      ellipse(ctx, -6, 1, 4.5, 4.5, radGrad(ctx, -6, 1, 1, 5, [[0, "#ffffff"], [0.4, "#d880ff"], [1, "rgba(80,0,140,0)"]]));
      ctx.restore();

      // Occult Mantle / Cowl Shoulders
      poly(ctx, [[18, 26 + headOffset], [40, 34 + headOffset], [60, 26 + headOffset], [52, 18 + headOffset], [26, 18 + headOffset]], robeG(18, 18, 60, 34), OUT, 2.8);
      // Gold clasp / brooch
      ellipse(ctx, 40, 28 + headOffset, 4.5, 4.5, goldG(36, 24, 44, 32), OUT, 2.0);
      ellipse(ctx, 40, 28 + headOffset, 2.2, 2.2, "#ff40a0");

      // Deep Occult Horned Hood
      const hoodTop = 6 + headOffset;
      const hoodMid = 18 + headOffset;
      const hoodBot = 30 + headOffset;
      poly(
        ctx,
        [[20, hoodBot], [14, hoodTop + 6], [32, hoodTop], [40, hoodTop - 2], [48, hoodTop], [64, hoodTop + 6], [58, hoodBot], [49, hoodBot + 3], [39, hoodMid + 2], [29, hoodBot + 3]],
        robeG(14, hoodTop - 2, 64, hoodBot + 3),
        OUT,
        3.0
      );

      // Deep hooded face shadow
      const faceY = 26 + headOffset;
      ellipse(ctx, 39, faceY, 10, 8.5, "#0a0414", OUT, 2.4);

      // Huge Cream Glowing Eyes (Mystic sinister gaze)
      ellipse(ctx, 34, faceY - 0.5, 3.8, 4.5, "#fffbe0", OUT, 2.2);
      ellipse(ctx, 44, faceY - 0.5, 3.8, 4.5, "#fffbe0", OUT, 2.2);
      // Vivid violet/crimson pupil core
      ellipse(ctx, 34.5, faceY, 2.0, 2.5, "#600880");
      ellipse(ctx, 43.5, faceY, 2.0, 2.5, "#600880");
      ellipse(ctx, 34.5, faceY, 1.0, 1.4, "#d860ff");
      ellipse(ctx, 43.5, faceY, 1.0, 1.4, "#d860ff");
      // White glint highlights
      ellipse(ctx, 33.2, faceY - 1.5, 1.2, 1.2, "#ffffff");
      ellipse(ctx, 42.8, faceY - 1.5, 1.2, 1.2, "#ffffff");
      // Angry hood shadow brow
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(30, faceY - 4.5);
      ctx.lineTo(37, faceY - 2);
      ctx.moveTo(48, faceY - 4.5);
      ctx.lineTo(41, faceY - 2);
      ctx.stroke();

      // Heavy Gnarled Occult Staff
      let st0x, st0y, st1x, st1y, orbR;
      if (f === 0) {
        st0x = 58; st0y = 59; st1x = 68; st1y = 11; orbR = 8.5;
      } else if (f === 1) {
        // Staff raised high & pulsing
        st0x = 57; st0y = 57; st1x = 70; st1y = 7; orbR = 10;
      } else if (f === 2) {
        // Staff thrust forward
        st0x = 59; st0y = 59; st1x = 66; st1y = 13; orbR = 8.5;
      } else {
        st0x = 58; st0y = 58; st1x = 67; st1y = 9; orbR = 9.0;
      }

      // Staff shaft (Bold wood)
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 5.2;
      ctx.beginPath();
      ctx.moveTo(st0x, st0y);
      ctx.lineTo(st1x, st1y);
      ctx.stroke();

      ctx.strokeStyle = woodG(st0x, st0y, st1x, st1y);
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(st0x, st0y);
      ctx.lineTo(st1x, st1y);
      ctx.stroke();

      // Right armored/sleeved hand gripping staff
      ellipse(ctx, (st0x * 0.45 + st1x * 0.55), (st0y * 0.45 + st1y * 0.55), 4.5, 4.5, robeG(0, 0, 10, 10), OUT, 2.0);

      // Staff Head: Dragon Claw / Horned Fork holding crystal
      ctx.save();
      ctx.translate(st1x, st1y);
      poly(ctx, [[-6, 4], [6, 4], [8, -6], [4, -3], [0, 2], [-4, -3], [-8, -6]], goldG(-8, -6, 8, 4), OUT, 2.2);

      // Glowing Occult Orb / Hex Core
      ellipse(
        ctx,
        0,
        -5,
        orbR,
        orbR,
        radGrad(ctx, -2, -7, 1, orbR, [[0, "#ffffff"], [0.35, "#e0b0ff"], [0.75, "#9c3aff"], [1, "rgba(70,10,140,0.2)"]]),
        OUT,
        2.4
      );
      // Bright core glint
      ellipse(ctx, -2, -7, 2.5, 2.5, "#ffffff");
      ctx.restore();

      // Rune particles / glowing magic sparks
      let motes;
      if (f === 0) motes = [[20, 20], [30, 12], [52, 14]];
      else if (f === 1) motes = [[16, 14], [32, 6], [56, 8], [12, 24]];
      else if (f === 2) motes = [[22, 22], [28, 16], [50, 16]];
      else motes = [[18, 16], [30, 10], [54, 12], [48, 20]];

      for (const [mx, my] of motes) {
        ellipse(ctx, mx, my, 2.5, 2.5, "#e8b4ff", OUT, 1.5);
        ellipse(ctx, mx - 0.4, my - 0.4, 1.2, 1.2, "#ffffff");
      }
    };

    const drawHexerDead = (ctx) => {
      shadow(ctx, 40, 58, 30, 7, 0.45);
      const OUT = "#141008";
      const robeG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#8a58d0"], [0.5, "#502888"], [1, "#180830"]]);
      const woodG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#7a5030"], [0.6, "#4a2c16"], [1, "#201006"]]);

      // Collapsed robe puddle
      poly(
        ctx,
        [[14, 56], [26, 42], [46, 40], [64, 46], [68, 58], [42, 63]],
        robeG(14, 40, 68, 63),
        OUT,
        3.0
      );
      poly(ctx, [[28, 48], [42, 45], [48, 54], [34, 57]], "#d4a428", OUT, 1.8);

      // Empty deflated cowl / hood
      poly(
        ctx,
        [[22, 46], [34, 34], [48, 44], [40, 52], [26, 50]],
        robeG(22, 34, 48, 52),
        OUT,
        2.6
      );
      ellipse(ctx, 35, 45, 7, 5, "#080210", OUT, 1.8);

      // Snapped wooden staff
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 5.0;
      ctx.beginPath();
      ctx.moveTo(16, 59);
      ctx.lineTo(44, 48);
      ctx.moveTo(48, 47);
      ctx.lineTo(60, 42);
      ctx.stroke();

      ctx.strokeStyle = woodG(16, 59, 60, 42);
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(16, 59);
      ctx.lineTo(44, 48);
      ctx.moveTo(48, 47);
      ctx.lineTo(60, 42);
      ctx.stroke();

      // Shattered crystal shards
      poly(ctx, [[60, 41], [67, 37], [64, 44]], "#e8d0ff", OUT, 1.8);
      poly(ctx, [[63, 47], [69, 44], [66, 50]], "#c490ff", OUT, 1.8);

      // Extinguishing rune dust
      for (const [sx, sy] of [[20, 40], [48, 36], [56, 56], [28, 60]]) {
        ellipse(ctx, sx, sy, 1.8, 1.8, "rgba(210, 140, 255, 0.7)");
      }
    };

    make("enemy_hexer", 80, 72, (ctx) => drawHexer(ctx, 0));
    make("enemy_hexer_w0", 80, 72, (ctx) => drawHexer(ctx, 0));
    make("enemy_hexer_w1", 80, 72, (ctx) => drawHexer(ctx, 1));
    make("enemy_hexer_w2", 80, 72, (ctx) => drawHexer(ctx, 2));
    make("enemy_hexer_w3", 80, 72, (ctx) => drawHexer(ctx, 3));
    make("enemy_hexer_dead", 80, 72, (ctx) => drawHexerDead(ctx));

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

    const drawTitanEnrage = (ctx) => {
      shadow(ctx, 44, 72, 38, 10, 0.52);
      const OUT = "#141008";
      const bodyX = 22;
      const bodyY = 22;
      const headX = 44;
      const headY = 14;

      const magmaG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#ffdd60"], [0.4, "#ff5500"], [0.8, "#aa1100"], [1, "#400400"]]);
      const darkStoneG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#84786c"], [0.6, "#4c3e34"], [1, "#1c140e"]]);

      // Planted wide power stomp legs
      rounded(ctx, 16, 42, 20, 26, 6, darkStoneG(16, 42, 36, 68), OUT, 3.0);
      rounded(ctx, 10, 62, 28, 10, 4, darkStoneG(10, 62, 38, 72), OUT, 2.8);
      rounded(ctx, 52, 42, 20, 26, 6, darkStoneG(52, 42, 72, 68), OUT, 3.0);
      rounded(ctx, 50, 62, 28, 10, 4, darkStoneG(50, 62, 78, 72), OUT, 2.8);

      // Ground shockwaves on both sides
      ctx.strokeStyle = "#ff6600";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(24, 69, 13, Math.PI * 0.7, Math.PI * 2.3);
      ctx.arc(64, 69, 13, Math.PI * 0.7, Math.PI * 2.3);
      ctx.stroke();

      // Jagged erupting granite shoulder spikes
      poly(ctx, [[bodyX - 4, bodyY + 4], [bodyX - 12, bodyY - 8], [bodyX + 4, bodyY - 2]], "#685040", OUT, 2.4);
      poly(ctx, [[bodyX + 48, bodyY + 4], [bodyX + 56, bodyY - 8], [bodyX + 40, bodyY - 2]], "#685040", OUT, 2.4);

      // Torso with erupting molten core
      rounded(ctx, bodyX, bodyY, 44, 34, 10, magmaG(bodyX, bodyY, bodyX + 44, bodyY + 34), OUT, 3.2);

      // Molten magma fissure cracks
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(bodyX + 11, bodyY + 7);
      ctx.lineTo(bodyX + 18, bodyY + 18);
      ctx.lineTo(bodyX + 28, bodyY + 14);
      ctx.moveTo(bodyX + 33, bodyY + 7);
      ctx.lineTo(bodyX + 30, bodyY + 22);
      ctx.stroke();

      // Head roaring upward
      ellipse(ctx, headX, headY, 17, 15, magmaG(headX - 14, headY - 10, headX + 14, headY + 12), OUT, 3.0);

      // Blazing red-orange rage eyes
      ellipse(ctx, headX - 6.5, headY - 1, 4.5, 4.8, "#fffbe0", OUT, 2.2);
      ellipse(ctx, headX + 6.5, headY - 1, 4.5, 4.8, "#fffbe0", OUT, 2.2);
      ellipse(ctx, headX - 6.5, headY - 1, 2.8, 3.2, "#ff2200");
      ellipse(ctx, headX + 6.5, headY - 1, 2.8, 3.2, "#ff2200");
      ellipse(ctx, headX - 6.5, headY - 1, 1.4, 1.8, "#fff060");
      ellipse(ctx, headX + 6.5, headY - 1, 1.4, 1.8, "#fff060");

      // Roaring stone maw
      rounded(ctx, headX - 7, headY + 5, 14, 7, 2, "#180602", OUT, 2.0);
      ellipse(ctx, headX, headY + 8, 4, 2.2, "#ff9900");

      // Brow ridge angled in rage
      rounded(ctx, headX - 15, headY - 9, 30, 7, 2.5, "#4a2818", OUT, 2.4);

      // BOTH FISTS RAISED HIGH OVERHEAD in rage slam!
      const lFistX = bodyX - 4;
      const lFistY = bodyY + 1;
      const rFistX = bodyX + 48;
      const rFistY = bodyY + 1;

      ellipse(ctx, lFistX, lFistY, 14, 14, magmaG(lFistX - 12, lFistY - 12, lFistX + 12, lFistY + 12), OUT, 3.0);
      ellipse(ctx, rFistX, rFistY, 14, 14, magmaG(rFistX - 12, rFistY - 12, rFistX + 12, rFistY + 12), OUT, 3.0);

      // Magma veins on raised knuckles
      ctx.strokeStyle = "#ffe860";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(lFistX, lFistY, 8, Math.PI * 1.1, Math.PI * 1.8);
      ctx.arc(rFistX, rFistY, 8, Math.PI * 1.2, Math.PI * 1.9);
      ctx.stroke();

      // Rage sparks
      for (const [ex, ey] of [[lFistX - 4, lFistY - 8], [lFistX + 5, lFistY - 10], [rFistX - 2, rFistY - 9], [rFistX + 7, rFistY - 7], [headX, headY - 10]]) {
        ellipse(ctx, ex, ey, 2.2, 2.2, "#ffe060", OUT, 1.2);
      }
    };

    const drawTitanDead = (ctx) => {
      shadow(ctx, 44, 68, 40, 9, 0.48);
      const OUT = "#141008";
      const stoneG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#dfd8cc"], [0.5, "#888078"], [1, "#302820"]]);

      // Center fractured torso slab
      poly(
        ctx,
        [[26, 62], [30, 42], [58, 40], [64, 58], [46, 67]],
        stoneG(26, 40, 64, 67),
        OUT,
        3.0
      );

      // Deep fracture crack
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(42, 41);
      ctx.lineTo(46, 53);
      ctx.lineTo(39, 59);
      ctx.lineTo(44, 66);
      ctx.stroke();

      // Left fallen fist boulder
      ellipse(ctx, 18, 58, 12, 10, stoneG(8, 50, 28, 66), OUT, 2.8);

      // Right fallen fist boulder
      ellipse(ctx, 72, 58, 12, 10, stoneG(62, 50, 82, 66), OUT, 2.8);

      // Dislodged head resting in rubble
      ellipse(ctx, 48, 42, 14, 12, stoneG(36, 32, 60, 52), OUT, 2.8);
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(40, 38);
      ctx.lineTo(54, 40);
      ctx.stroke();

      // Extinguished eye sockets
      ellipse(ctx, 44, 43, 3.2, 2.6, "#18120c", OUT, 1.5);
      ellipse(ctx, 53, 44, 3.2, 2.6, "#18120c", OUT, 1.5);

      // Moss & gravel rubble
      ellipse(ctx, 35, 52, 6, 3.5, "rgba(80,140,40,.5)");
      ellipse(ctx, 58, 54, 5, 3.0, "rgba(80,140,40,.45)");
      for (const [rx, ry, s] of [[10, 64, 2.5], [14, 66, 2], [70, 66, 2.5], [78, 63, 2], [44, 68, 2.2]]) {
        rounded(ctx, rx, ry, s * 2, s * 1.5, 1, "#686058", OUT, 1.4);
      }
    };

    make("enemy_titan", 88, 80, (ctx) => drawTitan(ctx, 0));
    make("enemy_titan_w0", 88, 80, (ctx) => drawTitan(ctx, 0));
    make("enemy_titan_w1", 88, 80, (ctx) => drawTitan(ctx, 1));
    make("enemy_titan_w2", 88, 80, (ctx) => drawTitan(ctx, 2));
    make("enemy_titan_w3", 88, 80, (ctx) => drawTitan(ctx, 3));
    make("enemy_titan_enrage", 88, 80, (ctx) => drawTitanEnrage(ctx));
    make("enemy_titan_dead", 88, 80, (ctx) => drawTitanDead(ctx));

    const drawBossDead = (ctx) => {
      shadow(ctx, 48, 76, 42, 10, 0.48);
      const OUT = "#141008";

      const capeG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#a86cd8"], [0.5, "#541870"], [1, "#180424"]]);
      const armorG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#e8b0ff"], [0.45, "#8a2caa"], [1, "#320642"]]);
      const goldG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff2a0"], [0.5, "#d4a428"], [1, "#664808"]]);

      // Torn purple velvet cape
      poly(
        ctx,
        [[12, 68], [26, 46], [70, 44], [86, 66], [48, 77]],
        capeG(12, 44, 86, 77),
        OUT,
        3.0
      );

      // Collapsed ornate armor
      rounded(ctx, 26, 44, 42, 24, 7, armorG(26, 44, 68, 68), OUT, 3.0);
      ellipse(ctx, 24, 52, 10, 9, armorG(14, 43, 34, 61), OUT, 2.2);
      ellipse(ctx, 68, 52, 10, 9, armorG(58, 43, 78, 61), OUT, 2.2);

      // Fallen head
      ellipse(ctx, 48, 38, 14, 13, armorG(34, 25, 62, 51), OUT, 2.8);
      // X eyes
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(42, 35); ctx.lineTo(47, 40); ctx.moveTo(47, 35); ctx.lineTo(42, 40);
      ctx.moveTo(51, 35); ctx.lineTo(56, 40); ctx.moveTo(56, 35); ctx.lineTo(51, 40);
      ctx.stroke();

      // Fallen crown
      poly(ctx, [[60, 36], [65, 24], [72, 31], [78, 22], [84, 33], [66, 40]], goldG(60, 22, 84, 40), OUT, 2.0);

      // Broken orb staff
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 5.2;
      ctx.beginPath();
      ctx.moveTo(16, 72);
      ctx.lineTo(76, 56);
      ctx.stroke();

      ctx.strokeStyle = "#d4a428";
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(16, 72);
      ctx.lineTo(76, 56);
      ctx.stroke();

      ellipse(ctx, 80, 55, 7, 7, radGrad(ctx, 79, 54, 1, 7, [[0, "#ffffff"], [0.5, "#d080ff"], [1, "rgba(90,10,140,0.3)"]]), OUT, 2.0);
    };

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

    const drawBossShield = (ctx) => {
      shadow(ctx, 48, 76, 40, 10, 0.5);
      const OUT = "#141008";

      const capeG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#a86cd8"], [0.5, "#541870"], [1, "#180424"]]);
      const armorG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#eeb8ff"], [0.45, "#9830ba"], [1, "#3c0c50"]]);
      const goldG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff4a8"], [0.5, "#e0ac2c"], [1, "#70500a"]]);

      // Defensive swept-back cape
      poly(
        ctx,
        [[22, 28], [80, 28], [90, 72], [54, 78], [20, 72]],
        capeG(20, 28, 90, 78),
        OUT,
        3.0
      );

      // Braced armored torso
      rounded(ctx, 30, 28, 40, 36, 8, armorG(30, 28, 70, 64), OUT, 3.2);

      // Right pauldron
      ellipse(ctx, 75, 33, 13, 11, armorG(62, 22, 88, 44), OUT, 2.6);

      // Head braced behind barrier
      ellipse(ctx, 50, 22, 16, 15, armorG(34, 7, 66, 37), OUT, 3.0);
      ellipse(ctx, 45, 22, 4.2, 4.8, "#fffbe0", OUT, 2.2);
      ellipse(ctx, 55, 22, 4.2, 4.8, "#fffbe0", OUT, 2.2);
      ellipse(ctx, 45.5, 22.5, 2.4, 2.8, "#1a0840");
      ellipse(ctx, 54.5, 22.5, 2.4, 2.8, "#1a0840");
      ellipse(ctx, 44.5, 21.0, 1.2, 1.2, "#ffffff");
      ellipse(ctx, 53.5, 21.0, 1.2, 1.2, "#ffffff");

      // Crown
      poly(
        ctx,
        [[30, 14], [34, 4], [40, 11], [50, 1], [60, 11], [66, 4], [70, 14]],
        goldG(30, 1, 70, 14),
        OUT,
        2.2
      );

      // Staff upright channeling
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 5.6;
      ctx.beginPath();
      ctx.moveTo(76, 72);
      ctx.lineTo(82, 14);
      ctx.stroke();

      ctx.strokeStyle = goldG(76, 72, 82, 14);
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.moveTo(76, 72);
      ctx.lineTo(82, 14);
      ctx.stroke();

      // Blazing channeled orb
      ellipse(
        ctx,
        82,
        12,
        11,
        11,
        radGrad(ctx, 80, 10, 1, 11, [[0, "#ffffff"], [0.4, "#d0a0ff"], [1, "rgba(120,40,200,0.15)"]]),
        OUT,
        2.4
      );

      // Massive Crystal Aegis Shield (Foreground)
      const shieldPts = [[10, 20], [44, 14], [48, 50], [33, 76], [7, 54]];
      poly(
        ctx,
        shieldPts,
        linGrad(ctx, 7, 14, 48, 76, [
          [0, "rgba(255, 240, 255, 0.95)"],
          [0.35, "rgba(195, 130, 255, 0.88)"],
          [0.7, "rgba(120, 50, 200, 0.82)"],
          [1, "rgba(50, 15, 105, 0.75)"]
        ]),
        OUT,
        3.0
      );
      // Shield faceted energy ribs
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(10, 20); ctx.lineTo(30, 44); ctx.lineTo(44, 14);
      ctx.moveTo(7, 54); ctx.lineTo(30, 44); ctx.lineTo(48, 50);
      ctx.moveTo(30, 44); ctx.lineTo(33, 76);
      ctx.stroke();

      // Golden runic crest in center of shield
      poly(ctx, [[30, 34], [37, 44], [30, 54], [23, 44]], goldG(23, 34, 37, 54), OUT, 2.0);
      ellipse(ctx, 30, 44, 3.5, 3.5, "#ffffff", OUT, 1.5);
    };

    const drawBossRage = (ctx) => {
      shadow(ctx, 48, 76, 44, 11, 0.52);
      const OUT = "#141008";

      const rageCapeG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#ff4060"], [0.4, "#b01848"], [0.75, "#580620"], [1, "#180008"]]);
      const rageArmorG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#ff8098"], [0.45, "#c82050"], [1, "#440614"]]);
      const goldG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff4a8"], [0.5, "#e0ac2c"], [1, "#70500a"]]);

      // Flared ragged fiery fury cape
      poly(
        ctx,
        [[8, 22], [48, 24], [88, 22], [96, 62], [82, 75], [64, 69], [48, 77], [32, 69], [14, 75], [0, 62]],
        rageCapeG(8, 22, 88, 77),
        OUT,
        3.2
      );

      // Surging fiery chest armor
      rounded(ctx, 26, 26, 44, 38, 9, rageArmorG(26, 26, 70, 64), OUT, 3.2);

      // Magma fissures on chest
      ctx.strokeStyle = "#ffe880";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(34, 34); ctx.lineTo(44, 46); ctx.lineTo(38, 56);
      ctx.moveTo(62, 34); ctx.lineTo(52, 46); ctx.lineTo(58, 56);
      ctx.stroke();

      // Glowing heart gem
      ellipse(ctx, 48, 45, 5.0, 5.0, "#ffffff", OUT, 2.0);

      // Spiked pauldrons
      ellipse(ctx, 20, 31, 14, 12, rageArmorG(6, 19, 34, 43), OUT, 2.8);
      ellipse(ctx, 76, 31, 14, 12, rageArmorG(62, 19, 90, 43), OUT, 2.8);

      // Head & enraged roaring expression
      ellipse(ctx, 48, 18, 17, 16, rageArmorG(31, 2, 65, 34), OUT, 3.0);

      // Blazing fiery crimson eyes
      ellipse(ctx, 42, 18, 4.5, 5.2, "#fffbe0", OUT, 2.4);
      ellipse(ctx, 54, 18, 4.5, 5.2, "#fffbe0", OUT, 2.4);
      ellipse(ctx, 42.5, 18.5, 2.8, 3.2, "#ff1122");
      ellipse(ctx, 53.5, 18.5, 2.8, 3.2, "#ff1122");
      ellipse(ctx, 42.5, 18.5, 1.4, 1.8, "#ffffff");
      ellipse(ctx, 53.5, 18.5, 1.4, 1.8, "#ffffff");

      // Roaring snarl mouth
      rounded(ctx, 43, 25, 10, 5, 2, "#180004", OUT, 1.8);

      // Furious brow
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(36, 13); ctx.lineTo(45, 16);
      ctx.moveTo(60, 13); ctx.lineTo(51, 16);
      ctx.stroke();

      // Blazing crown with fire horns
      poly(
        ctx,
        [[26, 11], [28, -2], [37, 8], [48, -3], [59, 8], [68, -2], [70, 11]],
        goldG(26, -3, 70, 11),
        OUT,
        2.2
      );

      // Raised overhead staff with blazing plasma sun orb
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 6.0;
      ctx.beginPath();
      ctx.moveTo(66, 70);
      ctx.lineTo(84, 8);
      ctx.stroke();

      ctx.strokeStyle = "#f5c040";
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(66, 70);
      ctx.lineTo(84, 8);
      ctx.stroke();

      // Massive blazing plasma sun orb
      ellipse(
        ctx,
        84,
        7,
        15,
        15,
        radGrad(ctx, 84, 7, 2, 15, [[0, "#ffffff"], [0.35, "#ff6080"], [0.75, "#d01040"], [1, "rgba(160,0,40,0.1)"]]),
        OUT,
        2.8
      );
      ellipse(ctx, 82, 5, 4, 4, "#ffffff");
    };

    make("enemy_boss", 96, 88, (ctx) => drawBossIdle(ctx));
    make("enemy_boss_idle", 96, 88, (ctx) => drawBossIdle(ctx));
    make("enemy_boss_shield", 96, 88, (ctx) => drawBossShield(ctx));
    make("enemy_boss_rage", 96, 88, (ctx) => drawBossRage(ctx));
    make("enemy_boss_dead", 96, 88, (ctx) => drawBossDead(ctx));

    // —— Projectiles (Original KRC Authored Missiles) ——
    make("projectile_arrow", 44, 20, (ctx) => {
      const OUT = "#141008";

      // 1. Fat Wooden Shaft (Dark outline + rich wood gradient)
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 4.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(6, 10);
      ctx.lineTo(34, 10);
      ctx.stroke();

      ctx.strokeStyle = linGrad(ctx, 6, 7, 34, 13, [
        [0, "#f4c680"],
        [0.45, "#b57732"],
        [1, "#54300e"],
      ]);
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(6, 10);
      ctx.lineTo(34, 10);
      ctx.stroke();

      // Top shaft highlight line
      ctx.strokeStyle = "rgba(255, 245, 210, 0.75)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(8, 9);
      ctx.lineTo(32, 9);
      ctx.stroke();

      // 2. Bold Whipping Cord Bindings
      rounded(ctx, 30, 7.5, 3.5, 5, 1.5, "#e63946", OUT, 1.4);
      rounded(ctx, 16, 7.5, 3, 5, 1.5, "#d49a28", OUT, 1.2);

      // 3. Bold Fletchings (Upper & lower aerodynamic feathers)
      const fletchGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [
        [0, "#ffffff"],
        [0.35, "#fff0a0"],
        [0.75, "#e09020"],
        [1, "#7a380a"],
      ]);

      // Upper feather
      poly(
        ctx,
        [[7, 9], [2, 3], [14, 4], [17, 9]],
        fletchGrad(2, 3, 17, 9),
        OUT,
        2.4
      );
      // Lower feather
      poly(
        ctx,
        [[7, 11], [2, 17], [14, 16], [17, 11]],
        fletchGrad(2, 17, 17, 11),
        OUT,
        2.4
      );

      // Feather quill spine
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(5, 10);
      ctx.lineTo(17, 10);
      ctx.stroke();

      // 4. Heavy Steel Broadhead Arrowhead (Fat outline)
      const steelGradLit = linGrad(ctx, 31, 4, 43, 10, [
        [0, "#ffffff"],
        [0.4, "#dbe7f0"],
        [1, "#8699a8"],
      ]);
      const steelGradShadow = linGrad(ctx, 31, 16, 43, 10, [
        [0, "#485a6a"],
        [0.5, "#6b8094"],
        [1, "#283440"],
      ]);

      // Broadhead top facet
      poly(ctx, [[32, 10], [31, 4], [43, 10]], steelGradLit, OUT, 2.6);
      // Broadhead bottom facet
      poly(ctx, [[32, 10], [43, 10], [31, 16]], steelGradShadow, OUT, 2.6);

      // Razor cutting edge gleam
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(31.5, 4.5);
      ctx.lineTo(42.5, 10);
      ctx.stroke();

      // Tip sparkle star glint
      ellipse(ctx, 42.5, 10, 2.0, 2.0, "#ffffff");
    });

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

    make("projectile_bomb", 40, 40, (ctx) => {
      const cx = 19;
      const cy = 22;
      const r = 13;
      const OUT = "#141008";

      // 1. Motion Shadow
      shadow(ctx, cx, cy + 12, 14, 5, 0.4);

      // 2. Cast Iron Spherical Body (Fat #141008 outline)
      const ironGrad = radGrad(ctx, cx - 4, cy - 4, 1.5, r + 1, [
        [0, "#9ab0c8"],
        [0.25, "#58687a"],
        [0.6, "#2c3440"],
        [0.9, "#161b22"],
        [1, "#0a0c10"],
      ]);
      ellipse(ctx, cx, cy, r, r, ironGrad, OUT, 3.0);

      // Specular Glint
      ellipse(ctx, cx - 4.5, cy - 5, 3.2, 2.2, "rgba(255, 255, 255, 0.85)");
      ellipse(ctx, cx - 5, cy - 5.2, 1.2, 1.0, "#ffffff");

      // 3. Heavy Brass Fuse Collar
      const spoutX = cx + 8;
      const spoutY = cy - 9;
      poly(
        ctx,
        [[spoutX - 4, spoutY + 2], [spoutX - 1, spoutY - 4], [spoutX + 5, spoutY - 1], [spoutX + 2, spoutY + 5]],
        linGrad(ctx, spoutX - 3, spoutY - 3, spoutX + 4, spoutY + 4, [
          [0, "#fff090"],
          [0.45, "#d49a24"],
          [1, "#5a3a0a"],
        ]),
        OUT,
        2.2
      );
      ellipse(ctx, spoutX + 2, spoutY - 2.5, 3.2, 1.8, "#140a02", OUT, 1.4);

      // 4. Burning Braided Fuse
      const fuseStartX = spoutX + 2;
      const fuseStartY = spoutY - 2.5;
      const fuseTipX = 34;
      const fuseTipY = 6;

      ctx.strokeStyle = OUT;
      ctx.lineWidth = 4.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(fuseStartX, fuseStartY);
      ctx.quadraticCurveTo(33, 12, fuseTipX, fuseTipY);
      ctx.stroke();

      ctx.strokeStyle = linGrad(ctx, fuseStartX, fuseStartY, fuseTipX, fuseTipY, [
        [0, "#e8b870"],
        [0.6, "#b07430"],
        [1, "#ff6600"],
      ]);
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(fuseStartX, fuseStartY);
      ctx.quadraticCurveTo(33, 12, fuseTipX, fuseTipY);
      ctx.stroke();

      // 5. Fiery Sizzling Spark Burst
      ellipse(
        ctx,
        fuseTipX,
        fuseTipY,
        8,
        8,
        radGrad(ctx, fuseTipX, fuseTipY, 1, 8, [
          [0, "rgba(255, 255, 220, 0.95)"],
          [0.35, "rgba(255, 140, 20, 0.8)"],
          [0.75, "rgba(220, 40, 0, 0.35)"],
          [1, "rgba(80, 0, 0, 0)"],
        ])
      );

      poly(
        ctx,
        [
          [fuseTipX, fuseTipY - 6],
          [fuseTipX + 2, fuseTipY - 2],
          [fuseTipX + 6, fuseTipY - 2.5],
          [fuseTipX + 3, fuseTipY + 2],
          [fuseTipX + 5, fuseTipY + 6],
          [fuseTipX, fuseTipY + 3],
          [fuseTipX - 4, fuseTipY + 5],
          [fuseTipX - 2.5, fuseTipY],
          [fuseTipX - 6, fuseTipY - 2.5],
          [fuseTipX - 2, fuseTipY - 2],
        ],
        "#fff270",
        OUT,
        1.5
      );

      ellipse(ctx, fuseTipX, fuseTipY, 2.2, 2.2, "#ffffff");
      ellipse(ctx, fuseTipX + 5, fuseTipY - 5, 1.4, 1.4, "#ffaa20", OUT, 0.8);
      ellipse(ctx, fuseTipX - 4, fuseTipY - 5, 1.2, 1.2, "#ff4400", OUT, 0.8);
    });

    // —— Projectile Trail Stamps (Original KRC VFX) ——
    make("fx_trail_arrow", 32, 14, (ctx) => {
      const trailGrad = linGrad(ctx, 1, 7, 31, 7, [
        [0, "rgba(240, 180, 60, 0)"],
        [0.35, "rgba(255, 215, 100, 0.45)"],
        [0.75, "rgba(255, 245, 180, 0.85)"],
        [1, "#ffffff"],
      ]);

      poly(
        ctx,
        [[1, 7], [16, 2.5], [30, 4], [32, 7], [30, 10], [16, 11.5]],
        trailGrad
      );

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(8, 7);
      ctx.lineTo(31, 7);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 235, 140, 0.65)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(14, 4.5); ctx.lineTo(26, 3.5);
      ctx.moveTo(14, 9.5); ctx.lineTo(26, 10.5);
      ctx.stroke();
    });

    make("fx_trail_magic", 24, 24, (ctx) => {
      const cx = 12;
      const cy = 12;
      const OUT = "#141008";

      // Radiant aura
      ellipse(
        ctx,
        cx,
        cy,
        11,
        11,
        radGrad(ctx, cx, cy, 1, 11, [
          [0, "rgba(255, 255, 255, 0.95)"],
          [0.35, "rgba(190, 120, 255, 0.7)"],
          [0.7, "rgba(56, 189, 248, 0.35)"],
          [1, "rgba(20, 0, 80, 0)"],
        ])
      );

      // Arcane star rune with crisp outline
      poly(
        ctx,
        [[cx, cy - 9], [cx + 3, cy - 2], [cx + 9, cy], [cx + 3, cy + 2], [cx, cy + 9], [cx - 3, cy + 2], [cx - 9, cy], [cx - 3, cy - 2]],
        linGrad(ctx, cx - 7, cy - 7, cx + 7, cy + 7, [
          [0, "#ffffff"],
          [0.45, "#e0b0ff"],
          [1, "#38bdf8"],
        ]),
        OUT,
        1.5
      );

      ellipse(ctx, cx, cy, 2.5, 2.5, "#ffffff");
    });

    make("fx_trail_bomb", 28, 28, (ctx) => {
      const cx = 14;
      const cy = 14;
      const OUT = "#141008";

      // Billowing smoke puffs with dark outline
      const puffs = [
        { x: cx - 3, y: cy - 3, r: 8.5, c: "#48404a" },
        { x: cx + 3.5, y: cy - 2, r: 7.5, c: "#605664" },
        { x: cx - 2, y: cy + 3.5, r: 8, c: "#38323c" },
        { x: cx + 3, y: cy + 3, r: 7, c: "#4a4250" },
      ];
      for (const p of puffs) {
        ellipse(ctx, p.x, p.y, p.r, p.r, p.c, OUT, 1.4);
      }

      // Center ember burst
      ellipse(
        ctx,
        cx,
        cy,
        4.5,
        4.5,
        radGrad(ctx, cx, cy, 0.5, 4.5, [
          [0, "#ffffff"],
          [0.4, "#ffd040"],
          [0.8, "#ff4400"],
          [1, "rgba(200, 30, 0, 0)"],
        ]),
        OUT,
        0.8
      );
    });

    make("fx_trail_smoke", 24, 24, (ctx) => {
      const cx = 12;
      const cy = 12;
      const OUT = "#141008";

      // Volumetric overlapping thick smoke puff lobes with fat outline
      const puffs = [
        { x: cx - 2.5, y: cy - 2.0, rx: 7.0, ry: 6.5, fill: linGrad(ctx, cx - 7, cy - 7, cx + 2, cy + 2, [[0, "#827888"], [0.5, "#564e5c"], [1, "#2e2832"]]) },
        { x: cx + 3.0, y: cy - 1.5, rx: 6.5, ry: 6.0, fill: linGrad(ctx, cx - 2, cy - 6, cx + 7, cy + 3, [[0, "#988e9e"], [0.5, "#6a6070"], [1, "#36303c"]]) },
        { x: cx - 1.5, y: cy + 3.0, rx: 7.0, ry: 6.0, fill: linGrad(ctx, cx - 6, cy - 1, cx + 3, cy + 7, [[0, "#766c7c"], [0.5, "#4c4452"], [1, "#26202a"]]) },
        { x: cx + 2.5, y: cy + 2.5, rx: 6.0, ry: 5.5, fill: linGrad(ctx, cx - 1, cy - 1, cx + 6, cy + 6, [[0, "#8c8292"], [0.5, "#5c5462"], [1, "#2c2632"]]) },
        { x: cx, y: cy, rx: 7.5, ry: 7.0, fill: radGrad(ctx, cx - 1, cy - 1, 1, 7.5, [[0, "#b4aab8"], [0.45, "#786e7e"], [0.85, "#423a48"], [1, "#221c26"]]) },
      ];

      for (const p of puffs) {
        ellipse(ctx, p.x, p.y, p.rx, p.ry, p.fill, OUT, 1.4);
      }

      // Soft top highlight & ash speckles
      ellipse(ctx, cx - 1, cy - 2.5, 3.5, 2.0, "rgba(255, 255, 255, 0.35)");
      speckles(ctx, cx - 6, cy - 6, 12, 12, 6, "rgba(20, 16, 24, 0.4)", 0.8);
    });

    // —— Spell Impact Effects (Original KRC VFX) ——
    const drawFxMeteor0 = (ctx) => {
      const cx = 64;
      const cy = 64;
      const OUT = "#141008";

      // 1. Dark Crater Ring (Charred Basalt Impact Basin & Ground Scorch)
      shadow(ctx, cx, cy + 4, 52, 46, 0.65);

      // Charred outer crater bedrock ring (diameter ~100px, radius 50)
      ellipse(
        ctx,
        cx,
        cy,
        50,
        48,
        linGrad(ctx, cx - 48, cy - 48, cx + 48, cy + 48, [
          [0, "#2c1c18"],
          [0.35, "#180e0a"],
          [0.7, "#0d0604"],
          [1, "#1c100b"],
        ]),
        OUT,
        3.2
      );

      // Jagged basalt slag chunks along the crater rim
      const rimChunks = 10;
      for (let i = 0; i < rimChunks; i += 1) {
        const ca = (i / rimChunks) * Math.PI * 2 + 0.2;
        const cr = 46 + (i % 2 === 0 ? 3 : -2);
        const rpx = cx + Math.cos(ca) * cr;
        const rpy = cy + Math.sin(ca) * (cr * 0.95);
        poly(
          ctx,
          [
            [rpx - 4, rpy - 2],
            [rpx + 3, rpy - 4],
            [rpx + 5, rpy + 3],
            [rpx - 2, rpy + 4],
          ],
          i % 2 === 0 ? "#241610" : "#140a08",
          OUT,
          1.6
        );
      }

      // Inner crater depression bed
      ellipse(
        ctx,
        cx,
        cy,
        38,
        36,
        linGrad(ctx, cx, cy - 36, cx, cy + 36, [
          [0, "#120806"],
          [0.5, "#1e0c08"],
          [1, "#0a0402"],
        ]),
        OUT,
        2.0
      );

      // Glowing thermal magma cracks in the crater bed
      ctx.strokeStyle = "#ff4500";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 12);
      ctx.lineTo(cx - 4, cy - 2);
      ctx.lineTo(cx + 24, cy - 16);
      ctx.moveTo(cx - 4, cy - 2);
      ctx.lineTo(cx - 10, cy + 22);
      ctx.lineTo(cx - 26, cy + 26);
      ctx.moveTo(cx - 4, cy - 2);
      ctx.lineTo(cx + 20, cy + 16);
      ctx.lineTo(cx + 30, cy + 22);
      ctx.stroke();

      ctx.strokeStyle = "#ffe460";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy - 11);
      ctx.lineTo(cx - 4, cy - 2);
      ctx.lineTo(cx + 22, cy - 15);
      ctx.moveTo(cx - 4, cy - 2);
      ctx.lineTo(cx - 9, cy + 20);
      ctx.lineTo(cx - 24, cy + 24);
      ctx.moveTo(cx - 4, cy - 2);
      ctx.lineTo(cx + 18, cy + 15);
      ctx.lineTo(cx + 28, cy + 21);
      ctx.stroke();

      // Scorch soot speckles around the charred crater ring
      speckles(ctx, cx - 46, cy - 44, 92, 88, 32, "rgba(0, 0, 0, 0.75)", 1.5);

      // 2. Black-Outlined Fire Spikes (Sharp high-contrast flame explosion)
      // Primary radiating blast spikes (12 spikes with alternating reach)
      const numSpikes = 12;
      for (let i = 0; i < numSpikes; i += 1) {
        const angle = (i / numSpikes) * Math.PI * 2 + (i % 2 === 0 ? 0 : 0.08);
        const len = i % 2 === 0 ? 54 : 42;
        const width = i % 2 === 0 ? 10.0 : 7.0;
        const tipX = cx + Math.cos(angle) * len;
        const tipY = cy + Math.sin(angle) * len;
        const perpX = -Math.sin(angle) * width;
        const perpY = Math.cos(angle) * width;
        const base1X = cx + Math.cos(angle) * 14 + perpX;
        const base1Y = cy + Math.sin(angle) * 14 + perpY;
        const base2X = cx + Math.cos(angle) * 14 - perpX;
        const base2Y = cy + Math.sin(angle) * 14 - perpY;

        poly(
          ctx,
          [[base1X, base1Y], [tipX, tipY], [base2X, base2Y]],
          linGrad(ctx, cx, cy, tipX, tipY, [
            [0, "#ffffff"],
            [0.2, "#fff050"],
            [0.5, "#ff6200"],
            [0.8, "#c61200"],
            [1, "#400400"],
          ]),
          OUT,
          2.2
        );
      }

      // Secondary inner fire tongues with black outline for dense layered burst
      const numInner = 8;
      for (let i = 0; i < numInner; i += 1) {
        const angle = ((i + 0.5) / numInner) * Math.PI * 2;
        const len = 32;
        const width = 6.5;
        const tipX = cx + Math.cos(angle) * len;
        const tipY = cy + Math.sin(angle) * len;
        const perpX = -Math.sin(angle) * width;
        const perpY = Math.cos(angle) * width;
        const base1X = cx + Math.cos(angle) * 10 + perpX;
        const base1Y = cy + Math.sin(angle) * 10 + perpY;
        const base2X = cx + Math.cos(angle) * 10 - perpX;
        const base2Y = cy + Math.sin(angle) * 10 - perpY;

        poly(
          ctx,
          [[base1X, base1Y], [tipX, tipY], [base2X, base2Y]],
          linGrad(ctx, cx, cy, tipX, tipY, [
            [0, "#ffffff"],
            [0.35, "#fff870"],
            [0.75, "#ff7400"],
            [1, "#9e0e00"],
          ]),
          OUT,
          1.8
        );
      }

      // 3. White-Hot Core (Detonation fireball + incandescent flare star)
      // Molten core fireball with black outline
      ellipse(
        ctx,
        cx,
        cy,
        24,
        24,
        radGrad(ctx, cx, cy, 0, 24, [
          [0, "#ffffff"],
          [0.45, "#ffffff"],
          [0.75, "#fff070"],
          [0.92, "#ff7010"],
          [1, "#ba1400"],
        ]),
        OUT,
        2.4
      );

      // Pure white incandescent core disk
      ellipse(ctx, cx, cy, 12, 12, "#ffffff");

      // Brilliant 4-pointed primary white-hot flare cross
      poly(
        ctx,
        [
          [cx, cy - 38],
          [cx + 4.5, cy - 5.5],
          [cx + 38, cy],
          [cx + 4.5, cy + 5.5],
          [cx, cy + 38],
          [cx - 4.5, cy + 5.5],
          [cx - 38, cy],
          [cx - 4.5, cy - 5.5],
        ],
        "#ffffff"
      );

      // Secondary 4-pointed diagonal flare star
      poly(
        ctx,
        [
          [cx - 20, cy - 20],
          [cx, cy - 4],
          [cx + 20, cy - 20],
          [cx + 4, cy],
          [cx + 20, cy + 20],
          [cx, cy + 4],
          [cx - 20, cy + 20],
          [cx - 4, cy],
        ],
        "#fffde0"
      );

      // High-contrast molten flying sparks / incandescent slag shards
      const sparks = [
        [cx + 42, cy - 30, 3.2],
        [cx - 38, cy - 36, 2.8],
        [cx + 40, cy + 36, 3.0],
        [cx - 42, cy + 28, 2.8],
        [cx + 10, cy - 44, 2.6],
        [cx - 16, cy + 44, 2.8],
        [cx + 46, cy + 6, 2.6],
        [cx - 46, cy - 8, 2.7],
      ];
      for (const [sx, sy, sr] of sparks) {
        ellipse(ctx, sx, sy, sr, sr, "#ff9900", OUT, 1.2);
        ellipse(ctx, sx, sy, sr * 0.55, sr * 0.55, "#ffffff");
      }
    };

    const drawFxMeteor1 = (ctx) => {
      const cx = 64;
      const cy = 64;
      const OUT = "#141008";

      // Expanding charred shockwave rim
      ctx.strokeStyle = "rgba(255, 120, 20, 0.45)";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(cx, cy, 56, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#ffd040";
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(cx, cy, 56, 0, Math.PI * 2);
      ctx.stroke();

      // Outer smoke & fireball tendrils
      const numTendrils = 10;
      for (let i = 0; i < numTendrils; i += 1) {
        const a = (i / numTendrils) * Math.PI * 2 + 0.15;
        const tx = cx + Math.cos(a) * 48;
        const ty = cy + Math.sin(a) * 48;
        ellipse(
          ctx,
          tx,
          ty,
          16,
          14,
          radGrad(ctx, tx, ty, 1, 16, [
            [0, "#ffa030"],
            [0.5, "#b02008"],
            [0.85, "#4a1008"],
            [1, "rgba(40, 6, 2, 0)"],
          ]),
          OUT,
          1.2
        );
      }

      // Ragged radiating blast spikes
      for (let i = 0; i < 8; i += 1) {
        const angle = (i / 8) * Math.PI * 2 + 0.35;
        const tipX = cx + Math.cos(angle) * 60;
        const tipY = cy + Math.sin(angle) * 60;
        const pX = -Math.sin(angle) * 7;
        const pY = Math.cos(angle) * 7;
        poly(
          ctx,
          [[cx + Math.cos(angle) * 28 + pX, cy + Math.sin(angle) * 28 + pY], [tipX, tipY], [cx + Math.cos(angle) * 28 - pX, cy + Math.sin(angle) * 28 - pY]],
          linGrad(ctx, cx, cy, tipX, tipY, [[0, "#ff8c1a"], [0.6, "#aa1a00"], [1, "#280400"]]),
          OUT,
          1.4
        );
      }

      // Molten crater crust with glowing magma fissures
      ellipse(ctx, cx, cy, 36, 36, linGrad(ctx, 28, 28, 100, 100, [[0, "#3a1810"], [0.5, "#220c06"], [1, "#120402"]]), OUT, 2.4);

      // Magma cracks branching outward
      ctx.strokeStyle = "#ff3300";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy - 9); ctx.lineTo(cx, cy); ctx.lineTo(cx + 20, cy - 14);
      ctx.moveTo(cx, cy); ctx.lineTo(cx - 9, cy + 20); ctx.lineTo(cx - 22, cy + 24);
      ctx.moveTo(cx, cy); ctx.lineTo(cx + 16, cy + 16); ctx.lineTo(cx + 26, cy + 22);
      ctx.stroke();

      ctx.strokeStyle = "#ffe860";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - 17, cy - 9); ctx.lineTo(cx, cy); ctx.lineTo(cx + 19, cy - 14);
      ctx.moveTo(cx, cy); ctx.lineTo(cx - 9, cy + 19);
      ctx.moveTo(cx, cy); ctx.lineTo(cx + 15, cy + 16);
      ctx.stroke();

      // Glowing molten core center
      ellipse(ctx, cx, cy, 18, 18, radGrad(ctx, cx, cy, 0, 18, [[0, "#ffffff"], [0.4, "#fff080"], [0.8, "#ff6010"], [1, "#b01000"]]), OUT, 1.6);
      ellipse(ctx, cx, cy, 8, 8, "#ffffff");

      // Dispersed ember sparkles
      speckles(ctx, 16, 16, 96, 96, 24, "#ffea80", 2.0);
    };

    const drawFxIce0 = (ctx) => {
      const cx = 64;
      const cy = 64;
      const OUT = "#141008";

      // 1. 6 Primary Glacial Spires with faceted white crystal shards & chevron needles
      const numArms = 6;
      for (let i = 0; i < numArms; i += 1) {
        const a = (i / numArms) * Math.PI * 2 - Math.PI / 2;
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        const perpX = -sinA;
        const perpY = cosA;

        const tipLen = 58;
        const tipX = cx + cosA * tipLen;
        const tipY = cy + sinA * tipLen;

        const midLen = 32;
        const midW = 6.5;
        const midX = cx + cosA * midLen;
        const midY = cy + sinA * midLen;

        const baseLen = 14;
        const baseX = cx + cosA * baseLen;
        const baseY = cy + sinA * baseLen;

        // Chevron side barb / needle shards branching outward from mid-spire (at ~26px)
        const barbBaseDist = 26;
        const barbBaseX = cx + cosA * barbBaseDist;
        const barbBaseY = cy + sinA * barbBaseDist;
        for (const dir of [-1, 1]) {
          const barbAngle = a + dir * (Math.PI * 0.35);
          const barbLen = 17;
          const barbTipX = barbBaseX + Math.cos(barbAngle) * barbLen;
          const barbTipY = barbBaseY + Math.sin(barbAngle) * barbLen;
          const barbPerpX = -Math.sin(barbAngle) * 3;
          const barbPerpY = Math.cos(barbAngle) * 3;
          const barbMidX = barbBaseX + Math.cos(barbAngle) * (barbLen * 0.45);
          const barbMidY = barbBaseY + Math.sin(barbAngle) * (barbLen * 0.45);

          // Outer Barb Shard (White highlight + Ice Cyan facet)
          poly(
            ctx,
            [
              [barbBaseX, barbBaseY],
              [barbMidX + barbPerpX, barbMidY + barbPerpY],
              [barbTipX, barbTipY],
              [barbMidX - barbPerpX, barbMidY - barbPerpY],
            ],
            linGrad(ctx, barbBaseX, barbBaseY, barbTipX, barbTipY, [
              [0, "#e8faff"],
              [0.4, "#ffffff"],
              [1, "#8be0ff"],
            ]),
            OUT,
            1.6
          );

          // Barb spine ridge
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(barbBaseX, barbBaseY);
          ctx.lineTo(barbTipX, barbTipY);
          ctx.stroke();
        }

        // Secondary smaller distal chevron barbs near the tip (at ~42px)
        const subBarbDist = 42;
        const subBarbBaseX = cx + cosA * subBarbDist;
        const subBarbBaseY = cy + sinA * subBarbDist;
        for (const dir of [-1, 1]) {
          const subAngle = a + dir * (Math.PI * 0.38);
          const subLen = 10;
          const subTipX = subBarbBaseX + Math.cos(subAngle) * subLen;
          const subTipY = subBarbBaseY + Math.sin(subAngle) * subLen;
          const subPerpX = -Math.sin(subAngle) * 2;
          const subPerpY = Math.cos(subAngle) * 2;

          poly(
            ctx,
            [
              [subBarbBaseX, subBarbBaseY],
              [subBarbBaseX + subPerpX, subBarbBaseY + subPerpY],
              [subTipX, subTipY],
              [subBarbBaseX - subPerpX, subBarbBaseY - subPerpY],
            ],
            "#ffffff",
            OUT,
            1.4
          );
        }

        // Primary Spire: Left facet (Pure White highlight)
        poly(
          ctx,
          [
            [baseX, baseY],
            [midX + perpX * midW, midY + perpY * midW],
            [tipX, tipY],
            [cx + cosA * 20, cy + sinA * 20],
          ],
          linGrad(ctx, baseX, baseY, tipX, tipY, [
            [0, "#ffffff"],
            [0.6, "#ffffff"],
            [1, "#dff6ff"],
          ]),
          OUT,
          2.0
        );

        // Primary Spire: Right facet (Light Crystalline Ice Blue)
        poly(
          ctx,
          [
            [baseX, baseY],
            [tipX, tipY],
            [midX - perpX * midW, midY - perpY * midW],
          ],
          linGrad(ctx, baseX, baseY, tipX, tipY, [
            [0, "#ffffff"],
            [0.35, "#b5eeff"],
            [1, "#4eb8f0"],
          ]),
          OUT,
          2.0
        );

        // Primary Center Spine Ridge (Bright glint)
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx + cosA * 12, cy + sinA * 12);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        // Tip Diamond Accent Glint
        const starTipX = cx + cosA * 61;
        const starTipY = cy + sinA * 61;
        poly(
          ctx,
          [
            [starTipX, starTipY - 3],
            [starTipX + 2, starTipY],
            [starTipX, starTipY + 3],
            [starTipX - 2, starTipY],
          ],
          "#ffffff",
          OUT,
          1.0
        );
      }

      // 2. 6 Secondary Intermediate Crystal Diamond Shards (between primary spires)
      for (let i = 0; i < numArms; i += 1) {
        const a = ((i + 0.5) / numArms) * Math.PI * 2 - Math.PI / 2;
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        const perpX = -sinA;
        const perpY = cosA;

        const tipLen = 38;
        const tipX = cx + cosA * tipLen;
        const tipY = cy + sinA * tipLen;

        const midLen = 22;
        const midW = 4.8;
        const midX = cx + cosA * midLen;
        const midY = cy + sinA * midLen;

        const baseLen = 12;
        const baseX = cx + cosA * baseLen;
        const baseY = cy + sinA * baseLen;

        // Left facet (White)
        poly(
          ctx,
          [[baseX, baseY], [midX + perpX * midW, midY + perpY * midW], [tipX, tipY]],
          linGrad(ctx, baseX, baseY, tipX, tipY, [[0, "#ffffff"], [0.5, "#e6faff"], [1, "#a8e8ff"]]),
          OUT,
          1.6
        );

        // Right facet (Ice Cyan)
        poly(
          ctx,
          [[baseX, baseY], [tipX, tipY], [midX - perpX * midW, midY - perpY * midW]],
          linGrad(ctx, baseX, baseY, tipX, tipY, [[0, "#d8f8ff"], [0.5, "#68ccf8"], [1, "#2880c8"]]),
          OUT,
          1.6
        );

        // Center spine line
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
      }

      // 3. Central Hexagonal Ice-Blue Gem Core
      const hexPts = [];
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        hexPts.push([cx + Math.cos(a) * 16, cy + Math.sin(a) * 16]);
      }
      poly(
        ctx,
        hexPts,
        radGrad(ctx, cx, cy, 2, 16, [
          [0, "#ffffff"],
          [0.3, "#a0f0ff"],
          [0.65, "#38b0f0"],
          [1, "#0e4884"],
        ]),
        OUT,
        2.2
      );

      // Inner 12-point Brilliant White Crystal Star
      const starPts = [];
      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? 12 : 5;
        starPts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      poly(ctx, starPts, "#ffffff", OUT, 1.4);

      // Center diamond core jewel
      poly(
        ctx,
        [
          [cx, cy - 5],
          [cx + 4, cy],
          [cx, cy + 5],
          [cx - 4, cy],
        ],
        linGrad(ctx, cx - 4, cy - 5, cx + 4, cy + 5, [
          [0, "#ffffff"],
          [0.5, "#d8f8ff"],
          [1, "#60c8f8"],
        ]),
        OUT,
        1.2
      );

      // Central glint dot
      ellipse(ctx, cx, cy, 1.5, 1.5, "#ffffff");
    };

    const drawFxIce1 = (ctx) => {
      const cx = 64;
      const cy = 64;
      const OUT = "#141008";

      // Expanding crystalline shockwave ring (12-sided faceted ring)
      const ringPts = [];
      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * Math.PI * 2;
        ringPts.push([cx + Math.cos(a) * 52, cy + Math.sin(a) * 52]);
      }
      poly(ctx, ringPts, null, "rgba(160, 230, 255, 0.75)", 2.8);

      // Radiating frost fracture lines extending outward
      ctx.strokeStyle = "#80d8ff";
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 24, cy + Math.sin(a) * 24);
        ctx.lineTo(cx + Math.cos(a) * 58, cy + Math.sin(a) * 58);
        ctx.stroke();
      }

      // Shattered ice shards drifting in radial burst
      const shardOffsets = [
        [0, 48, 12, 5],
        [Math.PI * 0.25, 52, 10, 4],
        [Math.PI * 0.5, 46, 13, 6],
        [Math.PI * 0.75, 54, 9, 4],
        [Math.PI, 48, 12, 5],
        [Math.PI * 1.25, 52, 11, 4.5],
        [Math.PI * 1.5, 47, 13, 5.5],
        [Math.PI * 1.75, 53, 10, 4],
      ];

      for (const [a, dist, slen, sw] of shardOffsets) {
        const sx = cx + Math.cos(a) * dist;
        const sy = cy + Math.sin(a) * dist;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(a + 0.4);
        poly(
          ctx,
          [[0, -slen / 2], [sw / 2, 0], [0, slen / 2], [-sw / 2, 0]],
          linGrad(ctx, -sw / 2, -slen / 2, sw / 2, slen / 2, [[0, "#ffffff"], [0.5, "#90e0ff"], [1, "#2878b8"]]),
          OUT,
          1.4
        );
        ctx.restore();
      }

      // Frost snowflake filigree in center
      const hexGrad = radGrad(ctx, cx, cy, 2, 28, [
        [0, "#ffffff"],
        [0.4, "#b0efff"],
        [0.75, "#58bcf0"],
        [1, "rgba(20, 80, 150, 0.1)"],
      ]);
      ellipse(ctx, cx, cy, 26, 26, hexGrad);

      // 6-arm snowflake center star
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2;
        const armX = cx + Math.cos(a) * 22;
        const armY = cy + Math.sin(a) * 22;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(armX, armY);
        // Branching barbs
        const bx1 = cx + Math.cos(a) * 14;
        const by1 = cy + Math.sin(a) * 14;
        const pX = -Math.sin(a) * 5;
        const pY = Math.cos(a) * 5;
        ctx.moveTo(bx1 + pX, by1 + pY);
        ctx.lineTo(bx1, by1);
        ctx.lineTo(bx1 - pX, by1 - pY);
        ctx.stroke();
      }

      // Glowing ice glints
      ellipse(ctx, cx, cy, 4, 4, "#ffffff");
      speckles(ctx, 16, 16, 96, 96, 18, "rgba(200, 245, 255, 0.8)", 1.5);
    };

    const drawFxRally0 = (ctx) => {
      const cx = 64;
      const cy = 64;
      const OUT = "#141008";

      // Radiant solar gold aura
      const aura = radGrad(ctx, cx, cy, 8, 62, [
        [0, "rgba(255, 240, 150, 0.55)"],
        [0.45, "rgba(255, 200, 50, 0.3)"],
        [0.8, "rgba(200, 130, 20, 0.12)"],
        [1, "rgba(100, 50, 5, 0)"],
      ]);
      ellipse(ctx, cx, cy, 60, 60, aura);

      // 12-point Golden Heraldic Sunburst Rays (Alternating lengths)
      const numRays = 12;
      for (let i = 0; i < numRays; i += 1) {
        const a = (i / numRays) * Math.PI * 2;
        const isLong = i % 2 === 0;
        const len = isLong ? 58 : 42;
        const w = isLong ? 7.5 : 5.5;
        const tipX = cx + Math.cos(a) * len;
        const tipY = cy + Math.sin(a) * len;
        const perpX = -Math.sin(a) * w;
        const perpY = Math.cos(a) * w;

        poly(
          ctx,
          [[cx + Math.cos(a) * 14 + perpX, cy + Math.sin(a) * 14 + perpY], [tipX, tipY], [cx + Math.cos(a) * 14 - perpX, cy + Math.sin(a) * 14 - perpY]],
          linGrad(ctx, cx, cy, tipX, tipY, [
            [0, "#ffffff"],
            [0.35, "#ffe570"],
            [0.7, "#e5aa20"],
            [1, "#7c4808"],
          ]),
          OUT,
          1.8
        );

        // Core ray highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
      }

      // Golden laurel wreath / wings arching upward
      // Left wing
      poly(
        ctx,
        [[cx - 8, cy + 18], [cx - 28, cy + 16], [cx - 36, cy], [cx - 28, cy - 20], [cx - 16, cy - 24], [cx - 20, cy - 10], [cx - 18, cy + 8]],
        linGrad(ctx, cx - 36, cy - 24, cx - 8, cy + 18, [[0, "#fff5a0"], [0.5, "#e5b030"], [1, "#8a5010"]]),
        OUT,
        1.8
      );
      // Right wing
      poly(
        ctx,
        [[cx + 8, cy + 18], [cx + 28, cy + 16], [cx + 36, cy], [cx + 28, cy - 20], [cx + 16, cy - 24], [cx + 20, cy - 10], [cx + 18, cy + 8]],
        linGrad(ctx, cx + 36, cy - 24, cx + 8, cy + 18, [[0, "#fff5a0"], [0.5, "#e5b030"], [1, "#8a5010"]]),
        OUT,
        1.8
      );

      // Central Valor Shield Seal
      poly(
        ctx,
        [[cx, cy - 22], [cx + 18, cy - 14], [cx + 14, cy + 12], [cx, cy + 24], [cx - 14, cy + 12], [cx - 18, cy - 14]],
        linGrad(ctx, cx - 18, cy - 22, cx + 18, cy + 24, [
          [0, "#ffffff"],
          [0.35, "#ffea84"],
          [0.7, "#d49a20"],
          [1, "#6a3e08"],
        ]),
        OUT,
        2.2
      );

      // Inner royal chevron emblem
      poly(
        ctx,
        [[cx, cy - 14], [cx + 9, cy - 6], [cx, cy + 14], [cx - 9, cy - 6]],
        linGrad(ctx, cx - 9, cy - 14, cx + 9, cy + 14, [[0, "#3e64a4"], [0.5, "#204278"], [1, "#0c1a32"]]),
        OUT,
        1.2
      );

      // Golden Valor Crown / Star atop shield
      poly(
        ctx,
        [[cx, cy - 10], [cx + 3, cy - 2], [cx + 8, cy], [cx + 3, cy + 2], [cx, cy + 8], [cx - 3, cy + 2], [cx - 8, cy], [cx - 3, cy - 2]],
        linGrad(ctx, cx - 8, cy - 10, cx + 8, cy + 8, [[0, "#ffffff"], [0.5, "#fff0a0"], [1, "#d09820"]]),
        OUT,
        1.0
      );
      ellipse(ctx, cx, cy - 1, 2.5, 2.5, "#ffffff");

      // Sparkling valor stars
      const glints = [
        [cx + 36, cy - 36],
        [cx - 36, cy - 36],
        [cx + 42, cy + 28],
        [cx - 42, cy + 28],
        [cx, cy - 54],
        [cx, cy + 54],
      ];
      for (const [gx, gy] of glints) {
        ellipse(ctx, gx, gy, 2.5, 2.5, "#ffffff");
        ellipse(ctx, gx, gy, 4.5, 1.2, "rgba(255,245,180,0.9)");
        ellipse(ctx, gx, gy, 1.2, 4.5, "rgba(255,245,180,0.9)");
      }
    };

    const drawFxRally1 = (ctx) => {
      const cx = 64;
      const cy = 64;
      const OUT = "#141008";

      // Expanding valor banner seal ring
      ctx.strokeStyle = "rgba(255, 220, 100, 0.5)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 50, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#ffd440";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(cx, cy, 50, 0, Math.PI * 2);
      ctx.stroke();

      // 4 Cardinal Banner Pennant Chevron Points (North, South, East, West)
      for (let i = 0; i < 4; i += 1) {
        const a = (i / 4) * Math.PI * 2;
        const tipX = cx + Math.cos(a) * 60;
        const tipY = cy + Math.sin(a) * 60;
        const pX = -Math.sin(a) * 9;
        const pY = Math.cos(a) * 9;
        const b1X = cx + Math.cos(a) * 44 + pX;
        const b1Y = cy + Math.sin(a) * 44 + pY;
        const b2X = cx + Math.cos(a) * 44 - pX;
        const b2Y = cy + Math.sin(a) * 44 - pY;

        poly(
          ctx,
          [[b1X, b1Y], [tipX, tipY], [b2X, b2Y]],
          linGrad(ctx, cx, cy, tipX, tipY, [[0, "#ffffff"], [0.4, "#ffd040"], [1, "#8a5410"]]),
          OUT,
          1.6
        );
      }

      // Radiating valor light rays
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        ctx.strokeStyle = "rgba(255, 240, 160, 0.65)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20);
        ctx.lineTo(cx + Math.cos(a) * 54, cy + Math.sin(a) * 54);
        ctx.stroke();
      }

      // Inner ornate rune ring
      ctx.strokeStyle = "#f0c840";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing central sun medallion
      const sunGrad = radGrad(ctx, cx, cy, 0, 24, [
        [0, "#ffffff"],
        [0.35, "#fff490"],
        [0.7, "#f0b830"],
        [1, "#804808"],
      ]);
      ellipse(ctx, cx, cy, 24, 24, sunGrad, OUT, 2.0);

      // Central 8-point cross star
      poly(
        ctx,
        [
          [cx, cy - 16],
          [cx + 4, cy - 4],
          [cx + 16, cy],
          [cx + 4, cy + 4],
          [cx, cy + 16],
          [cx - 4, cy + 4],
          [cx - 16, cy],
          [cx - 4, cy - 4],
        ],
        "#ffffff",
        OUT,
        1.2
      );
      ellipse(ctx, cx, cy, 3.5, 3.5, "#fff8b0", OUT, 1.0);

      // Courage particles
      speckles(ctx, 16, 16, 96, 96, 20, "rgba(255, 235, 140, 0.85)", 1.6);
    };

    make("fx_meteor", 128, 128, drawFxMeteor0);
    make("fx_meteor_0", 128, 128, drawFxMeteor0);
    make("fx_meteor_1", 128, 128, drawFxMeteor1);
    make("fx_ice", 128, 128, drawFxIce0);
    make("fx_ice_0", 128, 128, drawFxIce0);
    make("fx_ice_1", 128, 128, drawFxIce1);
    make("fx_rally", 128, 128, drawFxRally0);
    make("fx_rally_0", 128, 128, drawFxRally0);
    make("fx_rally_1", 128, 128, drawFxRally1);

    // —— Authored VFX Overlay Sprites (Original KRC) ——
    const drawFxDust = (ctx) => {
      const cx = 16;
      const cy = 16;
      const OUT = "#2a1c10";

      // 1. Soft Ground Shadow
      shadow(ctx, cx, cy + 6, 12, 4, 0.35);

      // 2. Billowy Cloud Lobes with Dark Outlines
      const lobes = [
        { x: cx - 6, y: cy + 2, rx: 7, ry: 6, c0: "#f6ede0", c1: "#c8b494", c2: "#7c6448" },
        { x: cx + 6, y: cy + 1, rx: 7.5, ry: 6.5, c0: "#fbf6ec", c1: "#d8c4a4", c2: "#887054" },
        { x: cx - 1, y: cy - 4, rx: 7.5, ry: 7, c0: "#ffffff", c1: "#e0d0b4", c2: "#968060" },
        { x: cx + 3, y: cy + 4, rx: 6, ry: 5, c0: "#ede2ce", c1: "#bca686", c2: "#745e42" },
        { x: cx - 4, y: cy + 4, rx: 5.5, ry: 4.5, c0: "#e6d8c0", c1: "#b49e7e", c2: "#6c563a" },
        { x: cx, y: cy, rx: 8, ry: 7.5, c0: "#ffffff", c1: "#dccdb0", c2: "#8c7658" },
      ];

      for (const lobe of lobes) {
        ellipse(
          ctx,
          lobe.x,
          lobe.y,
          lobe.rx,
          lobe.ry,
          linGrad(ctx, lobe.x, lobe.y - lobe.ry, lobe.x, lobe.y + lobe.ry, [
            [0, lobe.c0],
            [0.5, lobe.c1],
            [1, lobe.c2],
          ]),
          OUT,
          1.8
        );
      }

      // Sunlit top highlight
      ellipse(ctx, cx - 1, cy - 6, 4, 2, "rgba(255, 255, 255, 0.85)");
    };

    const drawFxSpark = (ctx) => {
      const cx = 12;
      const cy = 12;
      const OUT = "#141008";

      // 1. Radiant glow bloom
      ellipse(
        ctx,
        cx,
        cy,
        11,
        11,
        radGrad(ctx, cx, cy, 1, 11, [
          [0, "rgba(255, 255, 255, 0.95)"],
          [0.35, "rgba(255, 225, 100, 0.7)"],
          [0.7, "rgba(255, 120, 20, 0.3)"],
          [1, "rgba(200, 40, 0, 0)"],
        ])
      );

      // 2. 4-pointed Star Flare with dark rim outline
      poly(
        ctx,
        [[cx, 1], [cx + 2.5, cy - 2.5], [23, cy], [cx + 2.5, cy + 2.5], [cx, 23], [cx - 2.5, cy + 2.5], [1, cy], [cx - 2.5, cy - 2.5]],
        linGrad(ctx, 1, 1, 23, 23, [
          [0, "#fffde0"],
          [0.5, "#ffd54f"],
          [1, "#ff9800"],
        ]),
        OUT,
        2.0
      );

      // 3. Diagonal cross sub-rays (45 deg glints)
      poly(
        ctx,
        [[cx - 6, cy - 6], [cx, cy - 1.2], [cx + 6, cy + 6], [cx, cy + 1.2]],
        "#ffffff",
        OUT,
        1.0
      );
      poly(
        ctx,
        [[cx - 6, cy + 6], [cx - 1.2, cy], [cx + 6, cy - 6], [cx + 1.2, cy]],
        "#ffffff",
        OUT,
        1.0
      );

      // 4. White-Hot Diamond Core
      poly(
        ctx,
        [[cx, cy - 4], [cx + 4, cy], [cx, cy + 4], [cx - 4, cy]],
        "#ffffff",
        OUT,
        1.2
      );
      ellipse(ctx, cx, cy, 2.2, 2.2, "#ffffff");
    };

    const drawFxLeaf = (ctx) => {
      const OUT = "#141008";

      // Curved Stem
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 3.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(3, 21);
      ctx.quadraticCurveTo(6, 18, 8, 15);
      ctx.stroke();

      ctx.strokeStyle = "#385618";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(3, 21);
      ctx.quadraticCurveTo(6, 18, 8, 15);
      ctx.stroke();

      // Bold Swirling Leaf Polygon
      poly(
        ctx,
        [[6, 16], [2, 9], [9, 3], [21, 3], [20, 11], [13, 17]],
        linGrad(ctx, 4, 15, 21, 3, [
          [0, "#427a18"],
          [0.45, "#78c028"],
          [1, "#bcf250"],
        ]),
        OUT,
        2.4
      );

      // Shaded underside lobe
      poly(
        ctx,
        [[6, 16], [13, 17], [20, 11], [14, 10], [9, 13]],
        linGrad(ctx, 6, 16, 20, 10, [
          [0, "#22440c"],
          [0.6, "#366814"],
          [1, "#4e8c1e"],
        ]),
        OUT,
        1.6
      );

      // Bright yellow-green midrib spine
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(6, 16);
      ctx.quadraticCurveTo(12, 11, 20, 3.5);
      ctx.stroke();
    };

    make("fx_dust", 32, 32, drawFxDust);
    make("fx_spark", 24, 24, drawFxSpark);
    make("fx_leaf", 24, 24, drawFxLeaf);

    // —— Units ——
    const drawSoldierGuardWalk = (ctx, frame = 0) => {
      const f = frame % 4;
      const bodyY = (f === 1 || f === 3) ? 19 : 21;
      const headY = (f === 1 || f === 3) ? 13 : 15;
      const helmY = (f === 1 || f === 3) ? 4 : 6;
      const OUT = "#141008";

      shadow(ctx, 28, 53, (f === 0 || f === 2) ? 20 : 18, 5.5, 0.45);

      const nearLegGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#846848"], [0.48, "#584028"], [1, "#2a1c10"]]);
      const farLegGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#584028"], [0.5, "#382414"], [1, "#1a0e08"]]);
      const bootGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#543c24"], [0.5, "#362414"], [1, "#1a0e06"]]);
      const bronzeG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff4b0"], [0.45, "#d4aa44"], [1, "#724e1c"]]);
      const steelG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#ffffff"], [0.5, "#d4dde6"], [1, "#6a7888"]]);

      // Legs: stride vs passing
      if (f === 0) {
        poly(ctx, [[30, 35], [37, 35], [43, 47], [35, 48]], farLegGrad(30, 35, 43, 48), OUT, 2.4);
        rounded(ctx, 35, 46, 11, 6, 2.5, bootGrad(35, 46, 35, 52), OUT, 2.0);
        poly(ctx, [[18, 35], [25, 35], [19, 48], [12, 48]], nearLegGrad(18, 35, 12, 48), OUT, 2.6);
        rounded(ctx, 9, 47, 12, 6, 2.5, bootGrad(9, 47, 9, 53), OUT, 2.2);
      } else if (f === 1) {
        rounded(ctx, 18, 33, 9, 15, 3, nearLegGrad(18, 33, 27, 48), OUT, 2.6);
        rounded(ctx, 16, 47, 12, 6, 2.5, bootGrad(16, 47, 16, 53), OUT, 2.2);
        poly(ctx, [[30, 33], [37, 33], [39, 41], [33, 42]], farLegGrad(30, 33, 39, 42), OUT, 2.4);
        rounded(ctx, 33, 39, 10, 5.5, 2, bootGrad(33, 39, 33, 45), OUT, 2.0);
      } else if (f === 2) {
        poly(ctx, [[18, 35], [25, 35], [13, 47], [7, 46]], farLegGrad(18, 35, 13, 47), OUT, 2.4);
        rounded(ctx, 5, 45, 11, 6, 2.5, bootGrad(5, 45, 5, 51), OUT, 2.0);
        poly(ctx, [[30, 35], [37, 35], [43, 48], [35, 48]], nearLegGrad(30, 35, 43, 48), OUT, 2.6);
        rounded(ctx, 36, 47, 12, 6, 2.5, bootGrad(36, 47, 36, 53), OUT, 2.2);
      } else {
        poly(ctx, [[18, 33], [25, 33], [27, 41], [21, 42]], farLegGrad(18, 33, 27, 41), OUT, 2.4);
        rounded(ctx, 20, 39, 10, 5.5, 2, bootGrad(20, 39, 20, 45), OUT, 2.0);
        rounded(ctx, 30, 33, 9, 15, 3, nearLegGrad(30, 33, 39, 48), OUT, 2.6);
        rounded(ctx, 29, 47, 12, 6, 2.5, bootGrad(29, 47, 29, 53), OUT, 2.2);
      }

      // Gambeson / Tunic
      poly(ctx, [[15, bodyY + 14], [41, bodyY + 14], [42, bodyY + 20], [14, bodyY + 20]], linGrad(ctx, 14, bodyY + 14, 42, bodyY + 20, [[0, "#6c5034"], [0.5, "#4a321c"], [1, "#2c1c0e"]]), OUT, 2.0);

      // Bronze Cuirass
      rounded(ctx, 14, bodyY, 28, 18, 5, bronzeG(14, bodyY, 42, bodyY + 18), OUT, 2.8);
      // Breastplate center ridge
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(28, bodyY + 2);
      ctx.lineTo(28, bodyY + 14);
      ctx.stroke();

      // Head & Face
      ellipse(ctx, 28, headY, 11, 10.5, linGrad(ctx, 18, headY - 8, 38, headY + 8, [[0, "#fff2d6"], [0.45, "#e5b478"], [1, "#9e6630"]]), OUT, 2.4);

      // Huge Cream Eyes & Face
      ellipse(ctx, 24, headY, 2.8, 3.2, "#fffbe0", OUT, 1.8);
      ellipse(ctx, 32, headY, 2.8, 3.2, "#fffbe0", OUT, 1.8);
      ellipse(ctx, 24.5, headY + 0.3, 1.4, 1.8, "#1a120c");
      ellipse(ctx, 32.5, headY + 0.3, 1.4, 1.8, "#1a120c");
      ellipse(ctx, 23.8, headY - 0.7, 0.7, 0.7, "#ffffff");
      ellipse(ctx, 31.8, headY - 0.7, 0.7, 0.7, "#ffffff");
      // Resolute Eyebrows
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(21, headY - 3); ctx.lineTo(26, headY - 2);
      ctx.moveTo(35, headY - 3); ctx.lineTo(30, headY - 2);
      ctx.stroke();

      // Bronze Helmet with Crest
      rounded(ctx, 17, helmY, 22, 10, 4, bronzeG(17, helmY, 39, helmY + 10), OUT, 2.6);
      poly(ctx, [[28, helmY - 5], [24, helmY + 2], [32, helmY + 2]], linGrad(ctx, 24, helmY - 5, 32, helmY + 2, [[0, "#ff4040"], [0.5, "#d4aa44"], [1, "#724e1c"]]), OUT, 2.0);

      // Shield (Left arm)
      let shDx = 0, shDy = 0, shRot = 0;
      if (f === 0) { shDx = 0; shDy = 0; shRot = -0.04; }
      else if (f === 1) { shDx = 1; shDy = -1; shRot = 0.02; }
      else if (f === 2) { shDx = 2; shDy = 0; shRot = 0.05; }
      else { shDx = 1; shDy = -1; shRot = -0.02; }

      ctx.save();
      ctx.translate(16 + shDx, bodyY + 10 + shDy);
      ctx.rotate(shRot);
      poly(ctx, [[-7, -12], [5, -14], [7, 7], [0, 14], [-9, 7]], bronzeG(-9, -14, 7, 14), OUT, 2.6);
      poly(ctx, [[-4, -7], [2, -7], [1, 3], [-5, 3]], linGrad(ctx, -5, -7, 2, 3, [[0, "#4a78c0"], [1, "#182c50"]]), OUT, 1.5);
      ctx.restore();

      // Large Readable Spear (Right arm)
      let sp0x, sp0y, sp1x, sp1y;
      if (f === 0) { sp0x = 38; sp0y = bodyY + 19; sp1x = 48; sp1y = bodyY - 14; }
      else if (f === 1) { sp0x = 37; sp0y = bodyY + 17; sp1x = 46; sp1y = bodyY - 17; }
      else if (f === 2) { sp0x = 39; sp0y = bodyY + 16; sp1x = 50; sp1y = bodyY - 13; }
      else { sp0x = 38; sp0y = bodyY + 18; sp1x = 47; sp1y = bodyY - 16; }

      // Spear Shaft (Thick & bold)
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 4.8;
      ctx.beginPath();
      ctx.moveTo(sp0x, sp0y);
      ctx.lineTo(sp1x, sp1y);
      ctx.stroke();

      ctx.strokeStyle = "#8a6030";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(sp0x, sp0y);
      ctx.lineTo(sp1x, sp1y);
      ctx.stroke();

      // Spearhead
      const ang = Math.atan2(sp1y - sp0y, sp1x - sp0x);
      const tipX = sp1x + Math.cos(ang) * 11;
      const tipY = sp1y + Math.sin(ang) * 11;
      const pX = -Math.sin(ang) * 4.5;
      const pY = Math.cos(ang) * 4.5;
      poly(ctx, [[tipX, tipY], [sp1x + pX, sp1y + pY], [sp1x - pX, sp1y - pY]], steelG(sp1x - 4, sp1y - 4, tipX, tipY), OUT, 2.2);
      // Spearhead glint
      ellipse(ctx, tipX - 0.5, tipY - 0.5, 1.5, 1.5, "#ffffff");

      // Right gauntlet gripping spear
      ellipse(ctx, (sp0x * 0.4 + sp1x * 0.6), (sp0y * 0.4 + sp1y * 0.6), 3.5, 3.5, bronzeG(0, 0, 10, 10), OUT, 1.8);
    };

    const drawSoldierGuardAttack = (ctx) => {
      shadow(ctx, 30, 53, 22, 5.5, 0.45);
      const OUT = "#141008";

      const nearLegGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#846848"], [0.48, "#584028"], [1, "#2a1c10"]]);
      const farLegGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#584028"], [0.5, "#382414"], [1, "#1a0e08"]]);
      const bootGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#543c24"], [0.5, "#362414"], [1, "#1a0e06"]]);
      const bronzeG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff4b0"], [0.45, "#d4aa44"], [1, "#724e1c"]]);
      const steelG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#ffffff"], [0.5, "#d4dde6"], [1, "#6a7888"]]);

      // Lunging Legs
      poly(ctx, [[16, 35], [23, 35], [16, 49], [9, 49]], nearLegGrad(16, 35, 9, 49), OUT, 2.6);
      rounded(ctx, 7, 47, 12, 6, 2.5, bootGrad(7, 47, 7, 53), OUT, 2.2);
      poly(ctx, [[29, 35], [36, 35], [46, 48], [39, 49]], farLegGrad(29, 35, 46, 48), OUT, 2.4);
      rounded(ctx, 42, 47, 11, 5.5, 2.5, bootGrad(42, 47, 42, 52), OUT, 2.0);

      // Gambeson & Cuirass
      poly(ctx, [[17, 36], [43, 36], [44, 42], [16, 42]], linGrad(ctx, 16, 36, 44, 42, [[0, "#6c5034"], [0.5, "#4a321c"], [1, "#2c1c0e"]]), OUT, 2.0);
      rounded(ctx, 17, 22, 28, 18, 5, bronzeG(17, 22, 45, 40), OUT, 2.8);

      // Head & Helm forward
      ellipse(ctx, 31, 15, 11, 10.5, linGrad(ctx, 21, 7, 41, 23, [[0, "#fff2d6"], [0.45, "#e5b478"], [1, "#9e6630"]]), OUT, 2.4);
      rounded(ctx, 20, 5, 22, 10, 4, bronzeG(20, 5, 42, 15), OUT, 2.6);

      // Angry Eyes
      ellipse(ctx, 27, 15, 2.8, 3.2, "#fffbe0", OUT, 1.8);
      ellipse(ctx, 35, 15, 2.8, 3.2, "#fffbe0", OUT, 1.8);
      ellipse(ctx, 27.5, 15.3, 1.4, 1.8, "#1a120c");
      ellipse(ctx, 35.5, 15.3, 1.4, 1.8, "#1a120c");
      ellipse(ctx, 26.8, 14.3, 0.7, 0.7, "#ffffff");
      ellipse(ctx, 34.8, 14.3, 0.7, 0.7, "#ffffff");
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(24, 12); ctx.lineTo(29, 14);
      ctx.moveTo(38, 12); ctx.lineTo(33, 14);
      ctx.stroke();

      // Shield pulled back
      poly(ctx, [[6, 24], [15, 22], [17, 40], [12, 46], [4, 40]], bronzeG(4, 22, 17, 46), OUT, 2.4);
      poly(ctx, [[8, 29], [13, 29], [12, 36], [7, 36]], linGrad(ctx, 7, 29, 13, 36, [[0, "#4a78c0"], [1, "#182c50"]]), OUT, 1.4);

      // Spear Thrust (Lunged forward)
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 4.8;
      ctx.beginPath();
      ctx.moveTo(26, 28);
      ctx.lineTo(46, 24);
      ctx.stroke();

      ctx.strokeStyle = "#8a6030";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(26, 28);
      ctx.lineTo(46, 24);
      ctx.stroke();

      poly(ctx, [[55, 22], [45, 18], [47, 23], [45, 28]], steelG(45, 18, 55, 23), OUT, 2.2);
      ellipse(ctx, 55, 22, 2.5, 2.5, "#ffffff");
    };

    const drawSoldierGuardBlock = (ctx) => {
      shadow(ctx, 28, 53, 22, 6, 0.45);
      const OUT = "#141008";

      const nearLegGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#846848"], [0.48, "#584028"], [1, "#2a1c10"]]);
      const farLegGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#584028"], [0.5, "#382414"], [1, "#1a0e08"]]);
      const bootGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#543c24"], [0.5, "#362414"], [1, "#1a0e06"]]);
      const bronzeG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff4b0"], [0.45, "#d4aa44"], [1, "#724e1c"]]);
      const steelG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#ffffff"], [0.5, "#d4dde6"], [1, "#6a7888"]]);

      // Legs wide braced defensive stance
      poly(ctx, [[14, 37], [21, 37], [15, 50], [8, 50]], nearLegGrad(14, 37, 8, 50), OUT, 2.6);
      rounded(ctx, 6, 48, 12, 6, 2.5, bootGrad(6, 48, 6, 54), OUT, 2.2);
      poly(ctx, [[33, 37], [40, 37], [46, 50], [39, 50]], farLegGrad(33, 37, 46, 50), OUT, 2.4);
      rounded(ctx, 38, 48, 12, 6, 2.5, bootGrad(38, 48, 38, 54), OUT, 2.0);

      // Torso hunkered
      rounded(ctx, 14, 23, 28, 19, 5, bronzeG(14, 23, 42, 42), OUT, 2.8);

      // Head & Helm peering over shield
      ellipse(ctx, 28, 16, 11, 10.5, linGrad(ctx, 18, 8, 38, 24, [[0, "#fff2d6"], [0.45, "#e5b478"], [1, "#9e6630"]]), OUT, 2.4);
      rounded(ctx, 17, 6, 22, 10, 4, bronzeG(17, 6, 39, 16), OUT, 2.6);

      ellipse(ctx, 24, 16, 2.8, 3.2, "#fffbe0", OUT, 1.8);
      ellipse(ctx, 32, 16, 2.8, 3.2, "#fffbe0", OUT, 1.8);
      ellipse(ctx, 24.5, 16.3, 1.4, 1.8, "#1a120c");
      ellipse(ctx, 32.5, 16.3, 1.4, 1.8, "#1a120c");
      ellipse(ctx, 23.8, 15.3, 0.7, 0.7, "#ffffff");
      ellipse(ctx, 31.8, 15.3, 0.7, 0.7, "#ffffff");

      // Spear upright in guard behind shield
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 4.8;
      ctx.beginPath();
      ctx.moveTo(39, 46);
      ctx.lineTo(44, 7);
      ctx.stroke();

      ctx.strokeStyle = "#8a6030";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(39, 46);
      ctx.lineTo(44, 7);
      ctx.stroke();

      poly(ctx, [[44, 2], [49, 11], [39, 9]], steelG(39, 2, 49, 11), OUT, 2.2);
      ellipse(ctx, 44, 2, 1.5, 1.5, "#ffffff");

      // Massive Shield Prominent Forward Block
      poly(ctx, [[13, 19], [37, 17], [40, 42], [25, 51], [10, 42]], bronzeG(10, 17, 40, 51), OUT, 3.0);
      poly(ctx, [[25, 26], [31, 33], [25, 40], [19, 33]], linGrad(ctx, 19, 26, 31, 40, [[0, "#4a78c0"], [1, "#182c50"]]), OUT, 1.8);
      ellipse(ctx, 25, 33, 3.2, 3.2, "#ffe080", OUT, 1.2);
    };

    make("soldier_guard", 56, 60, (ctx) => drawSoldierGuardWalk(ctx, 0));
    make("soldier_guard_walk0", 56, 60, (ctx) => drawSoldierGuardWalk(ctx, 0));
    make("soldier_guard_walk1", 56, 60, (ctx) => drawSoldierGuardWalk(ctx, 1));
    make("soldier_guard_walk2", 56, 60, (ctx) => drawSoldierGuardWalk(ctx, 2));
    make("soldier_guard_walk3", 56, 60, (ctx) => drawSoldierGuardWalk(ctx, 3));
    make("soldier_guard_attack", 56, 60, drawSoldierGuardAttack);
    make("soldier_guard_block", 56, 60, drawSoldierGuardBlock);

    const drawHeroCaptainIdle = (ctx) => {
      shadow(ctx, 32, 66, 26, 7, 0.48);
      const OUT = "#141008";

      const capeG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#8ec0f8"], [0.45, "#2a62a8"], [1, "#0c1830"]]);
      const armorG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#ffffff"], [0.4, "#bcd2e8"], [1, "#546e88"]]);
      const goldG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff6b8"], [0.5, "#dca828"], [1, "#6a4a08"]]);
      const skinG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff4dc"], [0.5, "#e2aa70"], [1, "#8e5628"]]);

      // Flowing Blue Commander Cape
      poly(
        ctx,
        [[12, 24], [52, 24], [60, 62], [32, 69], [4, 62]],
        capeG(12, 24, 52, 69),
        OUT,
        3.0
      );
      // Gold cape trim
      poly(ctx, [[4, 62], [32, 69], [60, 62], [58, 58], [32, 65], [6, 58]], goldG(4, 58, 60, 69), OUT, 1.6);

      // Armored Legs & Boots
      rounded(ctx, 17, 40, 11, 22, 4, linGrad(ctx, 17, 40, 28, 62, [[0, "#7eaadc"], [1, "#182c44"]]), OUT, 2.6);
      rounded(ctx, 36, 40, 11, 22, 4, linGrad(ctx, 36, 40, 47, 62, [[0, "#7eaadc"], [1, "#182c44"]]), OUT, 2.6);
      rounded(ctx, 15, 56, 14, 8.5, 3, linGrad(ctx, 15, 56, 15, 65, [[0, "#324458"], [1, "#0e141c"]]), OUT, 2.2);
      rounded(ctx, 35, 56, 14, 8.5, 3, linGrad(ctx, 35, 56, 35, 65, [[0, "#324458"], [1, "#0e141c"]]), OUT, 2.2);

      // Heavy Plate Cuirass
      rounded(ctx, 15, 23, 34, 27, 7, armorG(15, 23, 49, 50), OUT, 3.0);
      // Gold Royal Trim & Lion Chevron
      ctx.strokeStyle = goldG(15, 23, 49, 50);
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(18, 30); ctx.lineTo(32, 40); ctx.lineTo(46, 30);
      ctx.stroke();
      poly(ctx, [[32, 31], [36, 37], [32, 43], [28, 37]], goldG(28, 31, 36, 43), OUT, 1.8);
      ellipse(ctx, 32, 37, 2, 2, "#4a78c0");

      // Pauldrons
      ellipse(ctx, 16, 29, 9, 8, armorG(7, 21, 25, 37), OUT, 2.4);
      ellipse(ctx, 48, 29, 9, 8, armorG(39, 21, 57, 37), OUT, 2.4);
      ellipse(ctx, 16, 29, 3.5, 3.5, goldG(13, 26, 19, 32), OUT, 1.4);
      ellipse(ctx, 48, 29, 3.5, 3.5, goldG(45, 26, 51, 32), OUT, 1.4);

      // Hero Head (Clear & bold)
      ellipse(ctx, 32, 16, 13, 12, skinG(20, 4, 44, 28), OUT, 2.6);

      // Huge Cream Eyes
      ellipse(ctx, 27, 16, 3.2, 3.6, "#fffbe0", OUT, 2.0);
      ellipse(ctx, 37, 16, 3.2, 3.6, "#fffbe0", OUT, 2.0);
      ellipse(ctx, 27.5, 16.3, 1.6, 2.0, "#0e1828");
      ellipse(ctx, 37.5, 16.3, 1.6, 2.0, "#0e1828");
      ellipse(ctx, 27.5, 16.3, 0.9, 1.2, "#3a70b0");
      ellipse(ctx, 37.5, 16.3, 0.9, 1.2, "#3a70b0");
      ellipse(ctx, 26.6, 15.2, 0.9, 0.9, "#ffffff");
      ellipse(ctx, 36.6, 15.2, 0.9, 0.9, "#ffffff");

      // Confident hero brows & mouth
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(24, 13); ctx.lineTo(29, 14.5);
      ctx.moveTo(40, 13); ctx.lineTo(35, 14.5);
      ctx.stroke();

      // Winged Knight Helm with Gold Wings & Ruby
      rounded(ctx, 17, 3, 30, 12, 4, goldG(17, 3, 47, 15), OUT, 2.6);
      // Wing crests
      poly(ctx, [[32, -2], [24, 6], [40, 6]], goldG(24, -2, 40, 6), OUT, 2.0);
      poly(ctx, [[17, 5], [10, -2], [14, 9]], goldG(10, -2, 17, 9), OUT, 1.8);
      poly(ctx, [[47, 5], [54, -2], [50, 9]], goldG(47, -2, 54, 9), OUT, 1.8);
      ellipse(ctx, 32, 5.5, 3.2, 3.2, "#ff2233", OUT, 1.5);
      ellipse(ctx, 31.5, 4.8, 1, 1, "#ffffff");

      // Kite Shield (Left arm)
      poly(ctx, [[3, 23], [21, 21], [23, 51], [13, 59], [1, 49]], goldG(1, 21, 23, 59), OUT, 2.8);
      poly(ctx, [[12, 31], [17, 37], [12, 45], [7, 37]], linGrad(ctx, 7, 31, 17, 45, [[0, "#4a82cc"], [1, "#14284c"]]), OUT, 1.6);
      ellipse(ctx, 12, 37, 2.5, 2.5, "#fff2a0", OUT, 1.0);

      // Hero Broadsword (Right arm)
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 5.2;
      ctx.beginPath();
      ctx.moveTo(50, 48);
      ctx.lineTo(58, 10);
      ctx.stroke();

      ctx.strokeStyle = "#e8f2ff";
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(50, 48);
      ctx.lineTo(58, 10);
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(49, 47);
      ctx.lineTo(57, 10);
      ctx.stroke();

      // Sword guard & pommel
      rounded(ctx, 44, 46, 14, 5.5, 2, goldG(44, 46, 58, 52), OUT, 1.8);
      ellipse(ctx, 58, 9, 3.5, 3.5, goldG(55, 6, 61, 12), OUT, 1.5);
    };

    const drawHeroCaptainAttack = (ctx) => {
      shadow(ctx, 34, 64, 28, 7, 0.5);
      const OUT = "#141008";

      const capeG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#8ec0f8"], [0.45, "#2a62a8"], [1, "#0c1830"]]);
      const armorG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#ffffff"], [0.4, "#bcd2e8"], [1, "#546e88"]]);
      const goldG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff6b8"], [0.5, "#dca828"], [1, "#6a4a08"]]);
      const skinG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff4dc"], [0.5, "#e2aa70"], [1, "#8e5628"]]);

      // Swept Cape
      poly(ctx, [[6, 23], [44, 25], [36, 60], [10, 64], [0, 44]], capeG(0, 23, 44, 64), OUT, 2.8);

      // Lunging Legs
      poly(ctx, [[16, 40], [26, 40], [14, 60], [6, 58]], linGrad(ctx, 6, 40, 26, 60, [[0, "#7eaadc"], [1, "#182c44"]]), OUT, 2.6);
      poly(ctx, [[36, 40], [48, 40], [52, 60], [40, 60]], linGrad(ctx, 36, 40, 52, 60, [[0, "#7eaadc"], [1, "#182c44"]]), OUT, 2.6);
      rounded(ctx, 4, 56, 14, 8.5, 3, "#1a2838", OUT, 2.0);
      rounded(ctx, 40, 56, 15, 8.5, 3, "#1a2838", OUT, 2.0);

      // Torso turned in swing
      rounded(ctx, 19, 23, 32, 26, 7, armorG(19, 23, 51, 49), OUT, 3.0);
      ellipse(ctx, 21, 29, 9, 8, armorG(12, 21, 30, 37), OUT, 2.4);

      // Head & Helm angled
      ellipse(ctx, 36, 15, 13, 12, skinG(24, 3, 48, 27), OUT, 2.6);
      rounded(ctx, 21, 3, 30, 12, 4, goldG(21, 3, 51, 15), OUT, 2.6);
      poly(ctx, [[36, -2], [28, 6], [44, 6]], goldG(28, -2, 44, 6), OUT, 2.0);
      ellipse(ctx, 36, 5.5, 3.2, 3.2, "#ff2233", OUT, 1.5);

      // Fierce Attack Eyes
      ellipse(ctx, 31, 15, 3.2, 3.6, "#fffbe0", OUT, 2.0);
      ellipse(ctx, 41, 15, 3.2, 3.6, "#fffbe0", OUT, 2.0);
      ellipse(ctx, 31.5, 15.3, 1.6, 2.0, "#0e1828");
      ellipse(ctx, 41.5, 15.3, 1.6, 2.0, "#0e1828");
      ellipse(ctx, 30.6, 14.2, 0.9, 0.9, "#ffffff");
      ellipse(ctx, 40.6, 14.2, 0.9, 0.9, "#ffffff");

      // Shield pulled back
      poly(ctx, [[1, 25], [19, 23], [21, 51], [11, 57], [0, 47]], goldG(0, 23, 21, 57), OUT, 2.6);

      // Sword Swing Arc
      ctx.beginPath();
      ctx.arc(40, 34, 24, -Math.PI * 0.55, Math.PI * 0.15);
      ctx.strokeStyle = "rgba(180,225,255,0.65)";
      ctx.lineWidth = 6;
      ctx.stroke();

      // Slashing Blade
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 5.6;
      ctx.beginPath();
      ctx.moveTo(48, 34);
      ctx.lineTo(64, 16);
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.moveTo(48, 34);
      ctx.lineTo(64, 16);
      ctx.stroke();

      // Slash Impact Sparkle
      poly(ctx, [[63, 12], [65, 17], [70, 17], [66, 20], [68, 25], [63, 21], [58, 25], [60, 20], [56, 17], [61, 17]], "#ffffff");
    };

    const drawHeroCaptainAbility = (ctx) => {
      shadow(ctx, 32, 66, 28, 8, 0.52);
      const OUT = "#141008";

      const capeG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#8ec0f8"], [0.45, "#2a62a8"], [1, "#0c1830"]]);
      const armorG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#ffffff"], [0.4, "#bcd2e8"], [1, "#546e88"]]);
      const goldG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff6b8"], [0.5, "#dca828"], [1, "#6a4a08"]]);
      const skinG = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#fff4dc"], [0.5, "#e2aa70"], [1, "#8e5628"]]);

      // Radiating Golden Holy Nova Aura
      ellipse(ctx, 32, 22, 30, 24, radGrad(ctx, 32, 22, 6, 30, [[0, "rgba(255,245,160,0.7)"], [0.5, "rgba(255,200,60,0.35)"], [1, "rgba(255,160,20,0)"]]));

      // Cape spread wide
      poly(ctx, [[2, 30], [20, 25], [22, 56], [6, 63]], capeG(2, 25, 22, 63), OUT, 2.6);
      poly(ctx, [[62, 30], [44, 25], [42, 56], [58, 63]], capeG(42, 25, 62, 63), OUT, 2.6);
      poly(ctx, [[14, 25], [50, 25], [56, 64], [32, 70], [8, 64]], capeG(8, 25, 56, 70), OUT, 3.0);

      // Sturdy Legs
      rounded(ctx, 16, 40, 12, 22, 4, linGrad(ctx, 16, 40, 28, 62, [[0, "#7eaadc"], [1, "#182c44"]]), OUT, 2.6);
      rounded(ctx, 36, 40, 12, 22, 4, linGrad(ctx, 36, 40, 48, 62, [[0, "#7eaadc"], [1, "#182c44"]]), OUT, 2.6);
      rounded(ctx, 14, 56, 15, 8.5, 3, "#1a2838", OUT, 2.0);
      rounded(ctx, 35, 56, 15, 8.5, 3, "#1a2838", OUT, 2.0);

      // Torso
      rounded(ctx, 15, 23, 34, 27, 7, armorG(15, 23, 49, 50), OUT, 3.0);
      ellipse(ctx, 16, 29, 9, 8, armorG(7, 21, 25, 37), OUT, 2.4);
      ellipse(ctx, 48, 29, 9, 8, armorG(39, 21, 57, 37), OUT, 2.4);

      // Head
      ellipse(ctx, 32, 15, 13, 12, skinG(20, 3, 44, 27), OUT, 2.6);
      rounded(ctx, 17, 2, 30, 12, 4, goldG(17, 2, 47, 14), OUT, 2.6);
      poly(ctx, [[32, -3], [24, 5], [40, 5]], goldG(24, -3, 40, 5), OUT, 2.0);
      ellipse(ctx, 32, 4.5, 3.5, 3.5, "#ff2233", OUT, 1.5);

      // Glowing Eyes in Rally
      ellipse(ctx, 27, 15, 3.2, 3.6, "#fffbe0", OUT, 2.0);
      ellipse(ctx, 37, 15, 3.2, 3.6, "#fffbe0", OUT, 2.0);
      ellipse(ctx, 27.5, 15.3, 1.6, 2.0, "#0e1828");
      ellipse(ctx, 37.5, 15.3, 1.6, 2.0, "#0e1828");
      ellipse(ctx, 26.6, 14.2, 0.9, 0.9, "#ffffff");
      ellipse(ctx, 36.6, 14.2, 0.9, 0.9, "#ffffff");

      // Shield Left
      poly(ctx, [[1, 21], [19, 19], [21, 49], [11, 56], [0, 46]], goldG(0, 19, 21, 56), OUT, 2.6);

      // Sword Raised High Overhead for Rally
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 5.6;
      ctx.beginPath();
      ctx.moveTo(46, 16);
      ctx.lineTo(46, -2);
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(46, 16);
      ctx.lineTo(46, -2);
      ctx.stroke();

      // Gleaming Rally Starburst at Tip
      poly(ctx, [[46, -6], [48, -2], [53, -2], [49, 1], [51, 6], [46, 3], [41, 6], [43, 1], [39, -2], [44, -2]], "#fffde0", goldG(39, -6, 53, 6), 1.2);
      ellipse(ctx, 46, 0, 3.5, 3.5, "#ffffff");
    };

    make("hero_captain_idle", 64, 72, drawHeroCaptainIdle);
    make("hero_captain", 64, 72, drawHeroCaptainIdle);
    make("hero_captain_attack", 64, 72, drawHeroCaptainAttack);
    make("hero_captain_ability", 64, 72, drawHeroCaptainAbility);

    // —— Props ——
    make("tree_pine", 56, 80, (ctx) => {
      const OUT = "#141008";

      // 1. Ground Shadow
      shadow(ctx, 28, 75, 18, 5.5, 0.45);

      // 2. Heavy Gnarled Pine Trunk
      rounded(ctx, 23, 50, 10, 26, 3, linGrad(ctx, 23, 50, 33, 76, [
        [0, "#8a5828"],
        [0.45, "#5a3414"],
        [1, "#261408"],
      ]), OUT, 2.4);

      // Root flares
      poly(ctx, [[21, 74], [25, 68], [25, 75]], "#3a200a", OUT, 1.4);
      poly(ctx, [[35, 74], [31, 68], [31, 75]], "#281406", OUT, 1.4);

      // 3. Sharp Conical Pine Tiers (Bottom to top)
      const tiers = [
        // [topY, halfWidth, height, hiColor, loColor]
        [38, 24, 24, "#44802c", "#14280c"],
        [26, 20, 22, "#589838", "#183210"],
        [14, 16, 20, "#70b446", "#1c3c14"],
        [4, 12, 18, "#8ec854", "#244c1a"],
      ];

      for (const [top, hw, h, hi, lo] of tiers) {
        // Jagged bough polygon
        poly(
          ctx,
          [
            [28, top],
            [28 + hw, top + h],
            [28 + hw * 0.6, top + h - 3],
            [28 + hw * 0.3, top + h],
            [28, top + h - 2],
            [28 - hw * 0.3, top + h],
            [28 - hw * 0.6, top + h - 3],
            [28 - hw, top + h],
          ],
          linGrad(ctx, 28 - hw, top, 28 + hw, top + h, [
            [0, hi],
            [0.6, lo],
            [1, "#0c1806"],
          ]),
          OUT,
          2.6
        );

        // Sunlit left edge highlight
        ctx.strokeStyle = "rgba(235, 255, 180, 0.55)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(28, top + 1);
        ctx.lineTo(28 - hw + 2, top + h - 1);
        ctx.stroke();
      }
    });

    make("tree_oak", 64, 72, (ctx) => {
      const OUT = "#141008";

      // 1. Ground Shadow
      shadow(ctx, 32, 67, 22, 6, 0.45);

      // 2. Thick Gnarled Oak Trunk & Forked Boughs
      poly(
        ctx,
        [[26, 36], [22, 67], [42, 67], [38, 36], [48, 28], [44, 24], [34, 34], [28, 26], [24, 28]],
        linGrad(ctx, 22, 24, 48, 67, [
          [0, "#9c6838"],
          [0.45, "#68401c"],
          [1, "#281608"],
        ]),
        OUT,
        2.6
      );

      // 3. Billowing Round Foliage Canopy (Clustered Spherical Lobes)
      const lobes = [
        // [cx, cy, rx, ry, hiColor, loColor]
        [32, 24, 20, 18, "#82c442", "#285814"],
        [16, 26, 14, 13, "#68a832", "#1e440e"],
        [48, 24, 14, 13, "#96d84e", "#2c6018"],
        [24, 14, 12, 11, "#b0f064", "#38781e"],
        [42, 13, 11, 10, "#c2f872", "#408422"],
        [32, 8, 12, 9, "#d0ff84", "#489026"],
        [32, 34, 16, 11, "#4e8824", "#16340a"],
      ];

      for (const [x, y, rx, ry, hi, lo] of lobes) {
        ellipse(
          ctx,
          x,
          y,
          rx,
          ry,
          linGrad(ctx, x - rx * 0.7, y - ry * 0.7, x + rx * 0.7, y + ry * 0.7, [
            [0, hi],
            [0.55, lo],
            [1, "#0e2206"],
          ]),
          OUT,
          2.6
        );
      }

      // Canopy top sunlit rim
      ellipse(ctx, 28, 10, 6, 3.5, "rgba(255, 255, 220, 0.7)");
      ellipse(ctx, 42, 14, 4.5, 2.5, "rgba(255, 255, 220, 0.6)");
    });

    make("rock_moss", 40, 28, (ctx) => {
      const OUT = "#141008";
      // Ground shadow
      shadow(ctx, 20, 23, 17, 4.5, 0.44);

      // Boulder main outline and shaded body
      poly(
        ctx,
        [[5, 19], [9, 9], [19, 4], [31, 7], [36, 17], [32, 24], [16, 25], [6, 22]],
        linGrad(ctx, 6, 4, 36, 25, [
          [0, "#d8ded4"],
          [0.3, "#9aa294"],
          [0.65, "#525a4e"],
          [1, "#1c221a"],
        ]),
        OUT,
        2.6
      );

      // Top-lit faceted highlight plane (High contrast)
      poly(
        ctx,
        [[9, 9], [19, 4], [31, 7], [25, 13], [12, 13]],
        linGrad(ctx, 9, 4, 31, 13, [
          [0, "#ffffff"],
          [0.45, "#e0e6da"],
          [1, "#a8b2a2"],
        ]),
        OUT,
        1.5
      );

      // Front-shaded lower facet
      poly(
        ctx,
        [[12, 13], [25, 13], [36, 17], [32, 24], [20, 21]],
        linGrad(ctx, 12, 13, 36, 24, [
          [0, "#687262"],
          [0.6, "#3a4236"],
          [1, "#1e241c"],
        ]),
        OUT,
        1.4
      );

      // Bright specular glint edge
      ctx.strokeStyle = "rgba(255, 255, 240, 0.85)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(10, 8.5);
      ctx.lineTo(19, 4.5);
      ctx.lineTo(30, 7.2);
      ctx.stroke();

      // Deep rock crevice fracture
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(25, 13);
      ctx.lineTo(29, 21);
      ctx.stroke();

      // Lush high-contrast moss cap
      poly(
        ctx,
        [[10, 11], [16, 6], [25, 6], [28, 11], [22, 15], [14, 14]],
        linGrad(ctx, 10, 6, 28, 15, [
          [0, "#bdf848"],
          [0.45, "#6ecd22"],
          [1, "#22520a"],
        ]),
        OUT,
        1.8
      );

      // Vibrant moss scallops
      ellipse(ctx, 13, 8, 3.5, 2.5, "#a6ee34");
      ellipse(ctx, 21, 8, 4.0, 3.0, "#92de28");
      ellipse(ctx, 26, 11.5, 3.0, 2.2, "#64b01c");

      // Crisp speckles for granite texture
      speckles(ctx, 8, 7, 24, 14, 12, "rgba(10,16,12,0.30)", 1.2);
      speckles(ctx, 8, 7, 24, 14, 8, "rgba(255,255,240,0.35)", 1.0);
    });

    make("bush_round", 36, 28, (ctx) => {
      const OUT = "#141008";
      // Ground shadow
      shadow(ctx, 18, 24, 16, 4.5, 0.42);

      // Base shadow foliage mass
      ellipse(
        ctx,
        18,
        16,
        16,
        10,
        linGrad(ctx, 18, 6, 18, 26, [
          [0, "#488220"],
          [0.6, "#204a10"],
          [1, "#0c2206"],
        ]),
        OUT,
        2.6
      );

      // Left leaf lobe
      ellipse(
        ctx,
        11,
        14,
        8.5,
        7.5,
        linGrad(ctx, 5, 8, 18, 20, [
          [0, "#88d03c"],
          [0.5, "#4e9220"],
          [1, "#1a420a"],
        ]),
        OUT,
        1.8
      );

      // Right leaf lobe
      ellipse(
        ctx,
        25,
        14,
        8.5,
        7.5,
        linGrad(ctx, 18, 8, 32, 20, [
          [0, "#7ac030"],
          [0.5, "#408018"],
          [1, "#163808"],
        ]),
        OUT,
        1.8
      );

      // Crown top-center leaf lobe
      ellipse(
        ctx,
        18,
        10,
        10,
        8,
        linGrad(ctx, 10, 2, 26, 18, [
          [0, "#b8f654"],
          [0.4, "#76c62c"],
          [1, "#265810"],
        ]),
        OUT,
        2.0
      );

      // Sunlit rim highlights
      ellipse(ctx, 16, 6.5, 5, 2.2, "rgba(240, 255, 180, 0.75)");
      ellipse(ctx, 10, 11, 3.5, 1.8, "rgba(225, 255, 160, 0.55)");
      ellipse(ctx, 24, 11, 3.5, 1.8, "rgba(215, 250, 150, 0.5)");

      // Plump ruby berries
      const berries = [
        [13, 16],
        [22, 13],
        [17, 19],
        [26, 18],
      ];
      for (const [bx, by] of berries) {
        ellipse(
          ctx,
          bx,
          by,
          2.4,
          2.4,
          linGrad(ctx, bx - 1, by - 1, bx + 2, by + 2, [
            [0, "#ff6868"],
            [0.5, "#d81e1e"],
            [1, "#660606"],
          ]),
          OUT,
          1.2
        );
        ellipse(ctx, bx - 0.7, by - 0.7, 0.7, 0.7, "#ffffff");
      }
    });

    make("flower_patch", 28, 20, (ctx) => {
      const OUT = "#141008";
      // Ground shadow
      shadow(ctx, 14, 17, 12, 3.0, 0.36);

      // Stems
      ctx.strokeStyle = "#1a3a0c";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(8, 11); ctx.lineTo(8, 17);
      ctx.moveTo(15, 7); ctx.lineTo(15, 17);
      ctx.moveTo(21, 11); ctx.lineTo(21, 17);
      ctx.moveTo(13, 14); ctx.lineTo(13, 17);
      ctx.stroke();

      // Leaves
      poly(ctx, [[8, 14], [4, 13], [7, 16]], "#52a822", OUT, 1.0);
      poly(ctx, [[15, 13], [19, 12], [16, 15]], "#4ca020", OUT, 1.0);
      poly(ctx, [[21, 14], [25, 13], [22, 16]], "#4ca020", OUT, 1.0);

      // 1. Golden Marigold (8, 10)
      ellipse(
        ctx,
        8,
        10,
        4.6,
        4.6,
        linGrad(ctx, 5, 7, 11, 13, [
          [0, "#fff888"],
          [0.45, "#f8be22"],
          [1, "#c0680a"],
        ]),
        OUT,
        1.6
      );
      ellipse(ctx, 8, 10, 1.8, 1.8, "#682806");
      ellipse(ctx, 7.3, 9.3, 0.6, 0.6, "#ffffff");

      // 2. Rosy Poppy (15, 6)
      ellipse(
        ctx,
        15,
        6,
        4.8,
        4.8,
        linGrad(ctx, 12, 3, 18, 9, [
          [0, "#ffa0c6"],
          [0.45, "#eb3a76"],
          [1, "#8c0e3a"],
        ]),
        OUT,
        1.6
      );
      ellipse(ctx, 15, 6, 1.8, 1.8, "#fff2a4", OUT, 0.8);
      ellipse(ctx, 14.3, 5.3, 0.6, 0.6, "#ffffff");

      // 3. Royal Bluebell (21, 10)
      ellipse(
        ctx,
        21,
        10,
        4.4,
        4.4,
        linGrad(ctx, 18, 7, 24, 13, [
          [0, "#bce4ff"],
          [0.45, "#428ef4"],
          [1, "#163a8e"],
        ]),
        OUT,
        1.6
      );
      ellipse(ctx, 21, 10, 1.6, 1.6, "#ffffff");

      // 4. Tangerine Primrose (13, 14)
      ellipse(
        ctx,
        13,
        14,
        4.2,
        4.2,
        linGrad(ctx, 10, 11, 16, 17, [
          [0, "#ffe066"],
          [0.45, "#ff7a18"],
          [1, "#b02a08"],
        ]),
        OUT,
        1.6
      );
      ellipse(ctx, 13, 14, 1.6, 1.6, "#fffce6", OUT, 0.8);
    });

    make("ruin_pillar", 28, 48, (ctx) => {
      const OUT = "#141008";
      // Ground shadow
      shadow(ctx, 14, 44, 12, 4.5, 0.42);

      // Base stepped plinth
      rounded(ctx, 3, 38, 22, 8, 2.5, linGrad(ctx, 3, 38, 25, 46, [
        [0, "#b4ac9a"],
        [0.45, "#787060"],
        [1, "#363026"],
      ]), OUT, 2.4);

      // Lower pedestal collar
      rounded(ctx, 5, 34, 18, 5, 1.5, linGrad(ctx, 5, 34, 23, 39, [
        [0, "#c2bca8"],
        [0.5, "#888070"],
        [1, "#443e32"],
      ]), OUT, 2.0);

      // Fluted pillar shaft
      rounded(ctx, 6, 12, 16, 23, 2, linGrad(ctx, 6, 12, 22, 35, [
        [0, "#d0caba"],
        [0.35, "#9c9484"],
        [0.75, "#5e5648"],
        [1, "#2c261e"],
      ]), OUT, 2.4);

      // Vertical fluting grooves & highlights
      ctx.strokeStyle = "rgba(255, 255, 235, 0.45)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(8.5, 14); ctx.lineTo(8.5, 33);
      ctx.moveTo(13.5, 14); ctx.lineTo(13.5, 33);
      ctx.moveTo(18.5, 14); ctx.lineTo(18.5, 33);
      ctx.stroke();

      ctx.strokeStyle = "rgba(20, 14, 8, 0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(11, 14); ctx.lineTo(11, 33);
      ctx.moveTo(16, 14); ctx.lineTo(16, 33);
      ctx.moveTo(21, 14); ctx.lineTo(21, 33);
      ctx.stroke();

      // Broken / jagged top capital
      poly(ctx, [
        [3, 5],
        [11, 3],
        [24, 7],
        [25, 12],
        [18, 14],
        [4, 12],
      ], linGrad(ctx, 3, 3, 25, 14, [
        [0, "#ded8c8"],
        [0.4, "#a8a090"],
        [1, "#4e4638"],
      ]), OUT, 2.4);

      // Fractured top jagged stone detail
      poly(ctx, [[11, 3], [16, 1], [24, 7], [18, 7]], "#ece6d6", OUT, 1.4);

      // Deep diagonal fracture crack
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(6, 26);
      ctx.lineTo(12, 22);
      ctx.lineTo(16, 25);
      ctx.lineTo(22, 21);
      ctx.stroke();

      // Lush ancient moss creeping on base and crevices
      ellipse(ctx, 7, 36, 4.5, 3.0, linGrad(ctx, 3, 33, 11, 39, [[0, "#a4e840"], [1, "#366816"]]), OUT, 1.4);
      ellipse(ctx, 20, 39, 4.0, 2.5, linGrad(ctx, 16, 37, 24, 42, [[0, "#8ed432"], [1, "#2a5410"]]), OUT, 1.2);
      ellipse(ctx, 18, 23, 3.2, 2.2, linGrad(ctx, 15, 21, 21, 25, [[0, "#98dc38"], [1, "#285210"]]), OUT, 1.0);

      // Speckles for weathered stone patina
      speckles(ctx, 5, 13, 18, 22, 10, "rgba(0,0,0,0.18)", 1.1);
      speckles(ctx, 5, 13, 18, 22, 6, "rgba(255,255,230,0.25)", 1.0);
    });

    make("banner_flag", 28, 44, (ctx) => {
      const OUT = "#141008";

      // 1. Ground Shadow
      shadow(ctx, 6, 42, 6, 2.5, 0.45);

      // 2. Stout Wooden Flagpole
      rounded(ctx, 4, 3, 4.5, 39, 1.5, linGrad(ctx, 4, 3, 8.5, 42, [
        [0, "#9e6c38"],
        [0.5, "#684420"],
        [1, "#281408"],
      ]), OUT, 2.2);

      // 3. Golden Finial / Spearhead Topper
      poly(ctx, [[6, 0], [9, 5], [6, 7], [3, 5]], linGrad(ctx, 3, 0, 9, 7, [
        [0, "#ffffff"],
        [0.4, "#ffd54f"],
        [1, "#996515"],
      ]), OUT, 1.6);
      ellipse(ctx, 6, 5, 2.5, 2.5, "#ffd54f", OUT, 1.2);

      // 4. Fluttering Double-Swallowtail Crimson Pennant
      const flagGrad = linGrad(ctx, 8, 4, 27, 28, [
        [0, "#ff4d4d"],
        [0.45, "#d62828"],
        [1, "#6b0f1a"],
      ]);

      poly(
        ctx,
        [
          [8, 5],
          [26, 9],
          [20, 16],
          [27, 23],
          [8, 27],
        ],
        flagGrad,
        OUT,
        2.6
      );

      // Golden heraldry cross / star on flag
      poly(
        ctx,
        [[14, 11], [16, 15], [14, 19], [12, 15]],
        linGrad(ctx, 12, 11, 16, 19, [
          [0, "#ffffff"],
          [0.5, "#ffd54f"],
          [1, "#b57c1e"],
        ]),
        OUT,
        1.4
      );
      ellipse(ctx, 14, 15, 1.5, 1.5, "#ffffff");

      // Gold pennant border trim
      ctx.strokeStyle = "#ffd54f";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(8, 6); ctx.lineTo(25, 9.5);
      ctx.moveTo(8, 26); ctx.lineTo(26, 22.5);
      ctx.stroke();

      // Top and bottom mounting cord rings
      rounded(ctx, 3.5, 5, 5.5, 3, 1, "#ffd54f", OUT, 1.0);
      rounded(ctx, 3.5, 25, 5.5, 3, 1, "#ffd54f", OUT, 1.0);
    });

    make("gate_arch", 128, 96, (ctx) => {
      const OUT = "#141008";

      // 1. Foundation plinth & ground shadow
      shadow(ctx, 64, 91, 58, 6, 0.55);

      // Stone plinth base (High contrast granite)
      rounded(ctx, 6, 80, 116, 12, 3, linGrad(ctx, 6, 80, 6, 92, [
        [0, "#9e8e7c"],
        [0.4, "#6e5e4c"],
        [1, "#24180e"]
      ]), OUT, 2.8);

      // Threshold stone paving
      poly(ctx, [[34, 79], [94, 79], [98, 88], [30, 88]], linGrad(ctx, 34, 79, 34, 88, [
        [0, "#988470"],
        [1, "#362414"]
      ]), OUT, 2.0);

      ctx.strokeStyle = OUT;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(48, 79); ctx.lineTo(46, 88);
      ctx.moveTo(64, 79); ctx.lineTo(64, 88);
      ctx.moveTo(80, 79); ctx.lineTo(82, 88);
      ctx.stroke();

      // 2. Flanking Watchtowers (High contrast stone with bold #141008 silhouette)
      // Left Tower
      rounded(ctx, 4, 14, 34, 68, 3, linGrad(ctx, 4, 14, 38, 82, [
        [0, "#b0a08e"],
        [0.35, "#7a6a58"],
        [0.8, "#4c3e30"],
        [1, "#1e140c"]
      ]), OUT, 3.0);

      // Left tower cornice & merlons
      poly(ctx, [[2, 14], [40, 14], [38, 19], [4, 19]], linGrad(ctx, 2, 14, 2, 19, [
        [0, "#c8b8a4"],
        [1, "#645444"]
      ]), OUT, 2.0);
      rounded(ctx, 4, 5, 9, 11, 2, linGrad(ctx, 4, 5, 4, 16, [[0, "#c8b8a4"], [1, "#6a5a4a"]]), OUT, 1.8);
      rounded(ctx, 16.5, 5, 9, 11, 2, linGrad(ctx, 16.5, 5, 16.5, 16, [[0, "#c8b8a4"], [1, "#6a5a4a"]]), OUT, 1.8);
      rounded(ctx, 29, 5, 9, 11, 2, linGrad(ctx, 29, 5, 29, 16, [[0, "#c8b8a4"], [1, "#6a5a4a"]]), OUT, 1.8);

      // Left conical terracotta roof
      poly(ctx, [[2, 14], [21, 1], [40, 14]], linGrad(ctx, 2, 1, 40, 14, [
        [0, "#ff5e3e"],
        [0.45, "#bd341a"],
        [1, "#541006"]
      ]), OUT, 2.4);
      ellipse(ctx, 21, 2, 3.5, 3.5, "#ffd54f", OUT, 1.4);
      // Left arrow slit
      rounded(ctx, 18, 32, 6, 15, 3, "#060404", OUT, 1.8);
      rounded(ctx, 16, 47, 10, 3.5, 1, "#8e7e6c", OUT, 1.2);

      // Right Tower
      rounded(ctx, 90, 14, 34, 68, 3, linGrad(ctx, 90, 14, 124, 82, [
        [0, "#b0a08e"],
        [0.35, "#7a6a58"],
        [0.8, "#4c3e30"],
        [1, "#1e140c"]
      ]), OUT, 3.0);

      // Right tower cornice & merlons
      poly(ctx, [[88, 14], [126, 14], [124, 19], [90, 19]], linGrad(ctx, 88, 14, 88, 19, [
        [0, "#c8b8a4"],
        [1, "#645444"]
      ]), OUT, 2.0);
      rounded(ctx, 90, 5, 9, 11, 2, linGrad(ctx, 90, 5, 90, 16, [[0, "#c8b8a4"], [1, "#6a5a4a"]]), OUT, 1.8);
      rounded(ctx, 102.5, 5, 9, 11, 2, linGrad(ctx, 102.5, 5, 102.5, 16, [[0, "#c8b8a4"], [1, "#6a5a4a"]]), OUT, 1.8);
      rounded(ctx, 115, 5, 9, 11, 2, linGrad(ctx, 115, 5, 115, 16, [[0, "#c8b8a4"], [1, "#6a5a4a"]]), OUT, 1.8);

      // Right conical terracotta roof
      poly(ctx, [[88, 14], [107, 1], [126, 14]], linGrad(ctx, 88, 1, 126, 14, [
        [0, "#ff5e3e"],
        [0.45, "#bd341a"],
        [1, "#541006"]
      ]), OUT, 2.4);
      ellipse(ctx, 107, 2, 3.5, 3.5, "#ffd54f", OUT, 1.4);
      // Right arrow slit
      rounded(ctx, 104, 32, 6, 15, 3, "#060404", OUT, 1.8);
      rounded(ctx, 102, 47, 10, 3.5, 1, "#8e7e6c", OUT, 1.2);

      // 3. Central Fortified Gatehouse Masonry Wall
      rounded(ctx, 28, 18, 72, 64, 3, linGrad(ctx, 28, 18, 100, 82, [
        [0, "#a89886"],
        [0.35, "#746452"],
        [0.75, "#443628"],
        [1, "#1c120a"]
      ]), OUT, 3.0);

      // Parapet cornice ledge across central wall
      poly(ctx, [[30, 18], [98, 18], [96, 23], [32, 23]], linGrad(ctx, 30, 18, 30, 23, [
        [0, "#c8b8a6"],
        [1, "#685848"]
      ]), OUT, 1.8);

      // Central wall crenellations (merlons)
      for (let i = 0; i < 3; i += 1) {
        const mx = 37 + i * 20;
        rounded(ctx, mx, 8, 14, 12, 2, linGrad(ctx, mx, 8, mx, 20, [[0, "#c8b8a4"], [1, "#6a5a4a"]]), OUT, 1.8);
        rounded(ctx, mx - 1, 6.5, 16, 3.5, 1, linGrad(ctx, mx, 6.5, mx, 10, [[0, "#e0d0bc"], [1, "#8a7a68"]]), OUT, 1.2);
      }

      // Ashlar Stone Block Coursing
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      // Left tower courses
      ctx.moveTo(5, 31); ctx.lineTo(37, 31);
      ctx.moveTo(5, 48); ctx.lineTo(37, 48);
      ctx.moveTo(5, 65); ctx.lineTo(37, 65);
      // Right tower courses
      ctx.moveTo(91, 31); ctx.lineTo(123, 31);
      ctx.moveTo(91, 48); ctx.lineTo(123, 48);
      ctx.moveTo(91, 65); ctx.lineTo(123, 65);
      // Vertical joints
      ctx.moveTo(18, 15); ctx.lineTo(18, 31);
      ctx.moveTo(28, 31); ctx.lineTo(28, 48);
      ctx.moveTo(14, 48); ctx.lineTo(14, 65);
      ctx.moveTo(25, 65); ctx.lineTo(25, 80);
      ctx.moveTo(110, 15); ctx.lineTo(110, 31);
      ctx.moveTo(100, 31); ctx.lineTo(100, 48);
      ctx.moveTo(114, 48); ctx.lineTo(114, 65);
      ctx.moveTo(103, 65); ctx.lineTo(103, 80);
      ctx.stroke();

      // 4. CENTER HOLE PITCH BLACK (#060404)
      // Outer stone voussoir arch frame
      rounded(ctx, 34, 25, 60, 57, 24, linGrad(ctx, 34, 25, 94, 82, [
        [0, "#9e8e7c"],
        [0.45, "#746452"],
        [1, "#261a10"]
      ]), OUT, 3.0);

      // Deep dark gothic portal arch cavity
      rounded(ctx, 38, 29, 52, 53, 20, "#060404", OUT, 2.8);

      // Carved stone keystone at arch apex
      poly(ctx, [[57, 20], [71, 20], [68, 33], [60, 33]], linGrad(ctx, 57, 20, 71, 33, [
        [0, "#f4e4cc"],
        [0.45, "#b0a08a"],
        [1, "#60503e"]
      ]), OUT, 2.2);
      ellipse(ctx, 64, 26, 3.5, 3.5, "#ffd54f", OUT, 1.4);

      // Portcullis iron grate in upper black cavity
      ctx.strokeStyle = "#1a1614";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(46, 33); ctx.lineTo(46, 43);
      ctx.moveTo(55, 30); ctx.lineTo(55, 43);
      ctx.moveTo(64, 29); ctx.lineTo(64, 43);
      ctx.moveTo(73, 30); ctx.lineTo(73, 43);
      ctx.moveTo(82, 33); ctx.lineTo(82, 43);
      ctx.moveTo(42, 37); ctx.lineTo(86, 37);
      ctx.stroke();

      // 5. TWO TIMBER DOOR LEAVES IN THE HOLE (Rich oak + wrought iron)
      // Left door leaf
      rounded(ctx, 41, 39, 22, 43, 3, linGrad(ctx, 41, 39, 63, 82, [
        [0, "#b86830"],
        [0.35, "#884820"],
        [0.75, "#5a2c12"],
        [1, "#261006"]
      ]), OUT, 2.2);

      // Right door leaf
      rounded(ctx, 65, 39, 22, 43, 3, linGrad(ctx, 65, 39, 87, 82, [
        [0, "#b06028"],
        [0.35, "#80401a"],
        [0.75, "#522610"],
        [1, "#220c04"]
      ]), OUT, 2.2);

      // Center dark door divide seam
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(64, 39); ctx.lineTo(64, 82);
      ctx.stroke();

      // Oak timber vertical planks
      ctx.strokeStyle = "rgba(20,8,4,0.95)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(48, 40); ctx.lineTo(48, 82);
      ctx.moveTo(55, 40); ctx.lineTo(55, 82);
      ctx.moveTo(73, 40); ctx.lineTo(73, 82);
      ctx.moveTo(80, 40); ctx.lineTo(80, 82);
      ctx.stroke();

      // Heavy wrought iron hinge straps
      rounded(ctx, 41, 45, 21, 5, 1.5, linGrad(ctx, 41, 45, 62, 50, [[0, "#747884"], [0.4, "#40444e"], [1, "#181a20"]]), OUT, 1.6);
      rounded(ctx, 41, 69, 21, 5, 1.5, linGrad(ctx, 41, 69, 62, 74, [[0, "#747884"], [0.4, "#40444e"], [1, "#181a20"]]), OUT, 1.6);
      rounded(ctx, 65, 45, 21, 5, 1.5, linGrad(ctx, 65, 45, 86, 50, [[0, "#747884"], [0.4, "#40444e"], [1, "#181a20"]]), OUT, 1.6);
      rounded(ctx, 65, 69, 21, 5, 1.5, linGrad(ctx, 65, 69, 86, 74, [[0, "#747884"], [0.4, "#40444e"], [1, "#181a20"]]), OUT, 1.6);

      // Steel rivet studs
      const rivets = [44, 51, 58, 70, 77, 84];
      for (let r = 0; r < rivets.length; r += 1) {
        const rx = rivets[r];
        ellipse(ctx, rx, 47.5, 1.5, 1.5, "#ffffff", OUT, 0.8);
        ellipse(ctx, rx, 71.5, 1.5, 1.5, "#ffffff", OUT, 0.8);
      }

      // Brass door ring knockers
      ellipse(ctx, 57, 57, 3, 3, "#ffd54f", OUT, 1.2);
      ellipse(ctx, 57, 62, 4.2, 5.0, null, "#ffd54f", 2.0);
      ellipse(ctx, 71, 57, 3, 3, "#ffd54f", OUT, 1.2);
      ellipse(ctx, 71, 62, 4.2, 5.0, null, "#ffd54f", 2.0);

      // 6. Heraldic Hanging Wall Banners (Rich Crimson & Gold)
      // Left Banner
      rounded(ctx, 21, 26, 13, 3.5, 1, "#ffd54f", OUT, 1.2);
      poly(ctx, [[22, 29], [33, 29], [33, 58], [27.5, 63], [22, 58]], linGrad(ctx, 22, 29, 33, 63, [
        [0, "#ff3d3d"],
        [0.45, "#c41818"],
        [1, "#540606"]
      ]), OUT, 2.0);
      ctx.strokeStyle = "#ffd54f";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(24, 30); ctx.lineTo(31, 30); ctx.lineTo(31, 56); ctx.lineTo(27.5, 59.5); ctx.lineTo(24, 56); ctx.closePath();
      ctx.stroke();

      // Right Banner
      rounded(ctx, 94, 26, 13, 3.5, 1, "#ffd54f", OUT, 1.2);
      poly(ctx, [[95, 29], [106, 29], [106, 58], [100.5, 63], [95, 58]], linGrad(ctx, 95, 29, 106, 63, [
        [0, "#ff3d3d"],
        [0.45, "#c41818"],
        [1, "#540606"]
      ]), OUT, 2.0);
      ctx.strokeStyle = "#ffd54f";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(97, 30); ctx.lineTo(104, 30); ctx.lineTo(104, 56); ctx.lineTo(100.5, 59.5); ctx.lineTo(97, 56); ctx.closePath();
      ctx.stroke();

      // 7. TWO GLOWING IRON LANTERNS (High contrast gold radiance)
      // Left Lantern
      rounded(ctx, 29, 43, 10, 12, 2, "#181412", OUT, 1.6);
      ellipse(ctx, 34, 49, 16, 16, radGrad(ctx, 34, 49, 2, 16, [
        [0, "rgba(255, 255, 200, 0.95)"],
        [0.35, "rgba(255, 180, 40, 0.65)"],
        [0.75, "rgba(255, 80, 0, 0.25)"],
        [1, "rgba(255, 40, 0, 0)"]
      ]));
      ellipse(ctx, 34, 49, 3.8, 4.8, "#ffd54f", OUT, 1.2);
      ellipse(ctx, 34, 49, 2.0, 2.6, "#ffffff");

      // Right Lantern
      rounded(ctx, 89, 43, 10, 12, 2, "#181412", OUT, 1.6);
      ellipse(ctx, 94, 49, 16, 16, radGrad(ctx, 94, 49, 2, 16, [
        [0, "rgba(255, 255, 200, 0.95)"],
        [0.35, "rgba(255, 180, 40, 0.65)"],
        [0.75, "rgba(255, 80, 0, 0.25)"],
        [1, "rgba(255, 40, 0, 0)"]
      ]));
      ellipse(ctx, 94, 49, 3.8, 4.8, "#ffd54f", OUT, 1.2);
      ellipse(ctx, 94, 49, 2.0, 2.6, "#ffffff");

      // 8. Crisp Vibrant Ivy Vines & Leaf Clusters
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(8, 80); ctx.bezierCurveTo(6, 62, 14, 48, 9, 32);
      ctx.moveTo(34, 21); ctx.bezierCurveTo(45, 23, 52, 17, 60, 22);
      ctx.moveTo(120, 80); ctx.bezierCurveTo(122, 62, 114, 48, 119, 32);
      ctx.stroke();

      const ivyLeaves = [
        [8, 74, 4.5, 3.2], [12, 65, 4.0, 3.0], [7, 54, 4.2, 3.2],
        [11, 44, 4.5, 3.2], [8, 34, 4.0, 3.0], [13, 24, 4.2, 3.0],
        [36, 22, 4.2, 3.0], [45, 21, 4.5, 3.2], [53, 23, 3.8, 2.8],
        [92, 22, 4.2, 3.0], [83, 21, 4.5, 3.2], [75, 23, 3.8, 2.8],
        [120, 74, 4.5, 3.2], [116, 65, 4.0, 3.0], [121, 54, 4.2, 3.2],
        [117, 44, 4.5, 3.2], [120, 34, 4.0, 3.0], [115, 24, 4.2, 3.0]
      ];

      for (let i = 0; i < ivyLeaves.length; i += 1) {
        const [lx, ly, rx, ry] = ivyLeaves[i];
        ellipse(ctx, lx, ly, rx, ry, (i % 2 === 0) ? "#48b828" : "#60d034", OUT, 1.2);
        ellipse(ctx, lx - 0.5, ly - 0.5, rx * 0.45, ry * 0.45, "#bcfc58");
      }
    });

    make("gate_leak", 128, 96, (ctx) => {
      // 1. High contrast radiant breach flare radiating from breached doorway (x: 64, y: 55)
      ellipse(ctx, 64, 55, 52, 38, radGrad(ctx, 64, 55, 2, 52, [
        [0, "rgba(255, 255, 250, 1.0)"],
        [0.18, "rgba(255, 215, 70, 0.95)"],
        [0.42, "rgba(255, 70, 20, 0.88)"],
        [0.72, "rgba(190, 10, 10, 0.50)"],
        [1, "rgba(100, 0, 0, 0)"]
      ]));

      // 2. High-intensity portal breach core
      ellipse(ctx, 64, 55, 26, 30, radGrad(ctx, 64, 55, 0, 26, [
        [0, "#ffffff"],
        [0.35, "#fff080"],
        [0.7, "rgba(255, 95, 20, 0.92)"],
        [1, "rgba(255, 40, 10, 0)"]
      ]));

      // 3. Searing breach lightning fissures fracturing through the gate doors and stone arch
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Outer crimson thermal halo
      ctx.strokeStyle = "rgba(255, 40, 10, 0.85)";
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(64, 78); ctx.lineTo(60, 58); ctx.lineTo(68, 46); ctx.lineTo(57, 34); ctx.lineTo(64, 20);
      ctx.moveTo(60, 58); ctx.lineTo(44, 52); ctx.lineTo(34, 42);
      ctx.moveTo(68, 46); ctx.lineTo(84, 52); ctx.lineTo(94, 42);
      ctx.stroke();

      // Searing electric orange mid-streak
      ctx.strokeStyle = "#ff7700";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(64, 78); ctx.lineTo(60, 58); ctx.lineTo(68, 46); ctx.lineTo(57, 34); ctx.lineTo(64, 20);
      ctx.moveTo(60, 58); ctx.lineTo(44, 52); ctx.lineTo(34, 42);
      ctx.moveTo(68, 46); ctx.lineTo(84, 52); ctx.lineTo(94, 42);
      ctx.stroke();

      // Blazing white-hot core strike
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(64, 78); ctx.lineTo(60, 58); ctx.lineTo(68, 46); ctx.lineTo(57, 34); ctx.lineTo(64, 20);
      ctx.moveTo(60, 58); ctx.lineTo(44, 52); ctx.lineTo(34, 42);
      ctx.moveTo(68, 46); ctx.lineTo(84, 52); ctx.lineTo(94, 42);
      ctx.stroke();

      // 4. Critical distress breach glow across walls and parapets
      rounded(ctx, 12, 16, 104, 66, 4, "rgba(255, 40, 20, 0.38)");
      poly(ctx, [[14, 20], [32, 20], [32, 58], [23, 64], [14, 58]], "rgba(255, 70, 20, 0.45)");
      poly(ctx, [[96, 20], [114, 20], [114, 58], [105, 64], [96, 58]], "rgba(255, 70, 20, 0.45)");

      // 5. Fiery breach spark motes & shard diamonds
      for (let s = 0; s < 18; s += 1) {
        const sx = 36 + (s * 37) % 56;
        const sy = 24 + (s * 23 + 7) % 46;
        ellipse(ctx, sx, sy, 4.0, 4.0, "rgba(255, 140, 20, 0.5)");
        ellipse(ctx, sx, sy, 2.2, 2.2, "#ffffff");
      }
    });

    make("cloud_soft", 80, 36, (ctx) => {
      // 1. Soft Shaded Underside Base
      ellipse(
        ctx,
        40,
        24,
        34,
        10,
        linGrad(ctx, 40, 16, 40, 34, [
          [0, "rgba(225, 240, 255, 0.7)"],
          [1, "rgba(165, 195, 235, 0.45)"],
        ])
      );

      // 2. Billowing Cumulus Domes (Bright volumetric lobes)
      const lobes = [
        // [cx, cy, rx, ry, topCol, botCol]
        { x: 22, y: 20, rx: 17, ry: 12, t: "#ffffff", b: "rgba(200, 225, 255, 0.7)" },
        { x: 60, y: 20, rx: 16, ry: 11, t: "#ffffff", b: "rgba(195, 220, 250, 0.7)" },
        { x: 40, y: 16, rx: 21, ry: 14, t: "#ffffff", b: "rgba(215, 235, 255, 0.8)" },
        { x: 30, y: 12, rx: 15, ry: 10, t: "#ffffff", b: "rgba(230, 245, 255, 0.9)" },
        { x: 50, y: 13, rx: 14, ry: 9.5, t: "#ffffff", b: "rgba(230, 245, 255, 0.9)" },
      ];

      for (const l of lobes) {
        ellipse(
          ctx,
          l.x,
          l.y,
          l.rx,
          l.ry,
          linGrad(ctx, l.x, l.y - l.ry, l.x, l.y + l.ry, [
            [0, l.t],
            [0.6, l.b],
            [1, "rgba(175, 205, 245, 0.3)"],
          ])
        );
      }

      // 3. Sunlit Silver Lining Highlights on Top Rims
      ellipse(ctx, 38, 7, 12, 4.5, "rgba(255, 255, 255, 0.95)");
      ellipse(ctx, 24, 11, 8, 3.5, "rgba(255, 255, 255, 0.9)");
      ellipse(ctx, 52, 10, 8, 3.5, "rgba(255, 255, 255, 0.9)");
    });

    make("path_mark", 24, 16, (ctx) => {
      // Subtle organic worn road marker (soft ground shadow + embedded stepping stone + worn highlight)
      shadow(ctx, 12, 8.5, 9, 4.5, 0.22);
      ellipse(
        ctx,
        12,
        8,
        8,
        4.2,
        linGrad(ctx, 4, 4, 20, 12, [
          [0, "rgba(215, 195, 170, 0.42)"],
          [0.55, "rgba(165, 140, 115, 0.35)"],
          [1, "rgba(95, 75, 55, 0.28)"],
        ]),
        "rgba(55, 40, 25, 0.28)",
        0.8
      );
      ellipse(ctx, 11, 6.8, 5, 2.0, "rgba(255, 245, 225, 0.22)");
      speckles(ctx, 6, 5, 12, 6, 4, "rgba(0, 0, 0, 0.15)", 0.8);
    });
        // —— Path and terrain tile sprites ——
    const drawDirtTile = (ctx, variant = 0) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Base Loam Foundation (Continuous horizontal gradient, no vertical edge seams)
      rounded(ctx, 0, 0, 54, 48, 0, linGrad(ctx, 0, 0, 0, 48, [
        [0, "#321e10"],
        [0.15, "#4c311a"],
        [0.32, "#28170c"],
        [0.5, "#82572e"],
        [0.68, "#28170c"],
        [0.85, "#4c311a"],
        [1, "#2e1a0c"]
      ]));

      // 2. Continuous Wagon Wheel Ruts (Aligned across x=0..54 for seamless ribbon flow)
      // Top rut (y=11..17)
      rounded(ctx, 0, 11, 54, 7, 0, linGrad(ctx, 0, 11, 0, 18, [
        [0, "#180d06"],
        [0.45, "#2a180c"],
        [1, "#442a16"]
      ]));
      ctx.beginPath();
      ctx.moveTo(0, 14.5); ctx.lineTo(54, 14.5);
      ctx.strokeStyle = "rgba(14, 7, 3, 0.65)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 18); ctx.lineTo(54, 18);
      ctx.strokeStyle = "rgba(225, 185, 130, 0.22)";
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Bottom rut (y=31..37)
      rounded(ctx, 0, 31, 54, 7, 0, linGrad(ctx, 0, 31, 0, 38, [
        [0, "#180d06"],
        [0.45, "#2a180c"],
        [1, "#442a16"]
      ]));
      ctx.beginPath();
      ctx.moveTo(0, 34.5); ctx.lineTo(54, 34.5);
      ctx.strokeStyle = "rgba(14, 7, 3, 0.65)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 31); ctx.lineTo(54, 31);
      ctx.strokeStyle = "rgba(225, 185, 130, 0.22)";
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // 3. Raised Central Road Crown (y=19..29)
      rounded(ctx, 0, 19, 54, 11, 0, linGrad(ctx, 0, 19, 0, 30, [
        [0, "#5e3c1e"],
        [0.3, "#8e6134"],
        [0.55, "#a47340"],
        [0.8, "#82562c"],
        [1, "#4e3118"]
      ]));
      ctx.beginPath();
      ctx.moveTo(0, 24.5); ctx.lineTo(54, 24.5);
      ctx.strokeStyle = "rgba(255, 220, 160, 0.24)";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // 4. Variant-specific natural ground details (all sharing the same continuous rut layout)
      if (variant === 0) {
        // tile_dirt: Crisp embedded pebbles & fine loam grains
        const pebbles = [
          [10, 25, 2.8, 1.8, "#8e8476", "#3e362c"],
          [26, 9, 2.4, 1.6, "#7c7264", "#342c22"],
          [42, 40, 3.2, 2.0, "#9a9082", "#443c32"],
          [48, 23, 2.2, 1.5, "#7a7062", "#322a20"],
        ];
        for (const [px, py, prx, pry, fill, stroke] of pebbles) {
          shadow(ctx, px + 0.5, py + 1.2, prx * 1.1, pry * 0.9, 0.45);
          ellipse(ctx, px, py, prx, pry, fill, stroke, 0.8);
          ellipse(ctx, px - 0.5, py - 0.4, prx * 0.45, pry * 0.4, "rgba(255,245,225,0.45)");
        }
        speckles(ctx, 2, 2, 50, 44, 24, "rgba(10, 5, 2, 0.28)", 1.2);
        speckles(ctx, 2, 2, 50, 44, 16, "rgba(255, 230, 175, 0.22)", 1.0);
      } else if (variant === 1) {
        // tile_dirt_b: Alternate stone scatter & subtle dry loam fracture
        const pebbles = [
          [6, 39, 2.6, 1.8, "#887e70", "#3a3228"],
          [18, 26, 3.0, 2.0, "#9c9284", "#463e34"],
          [35, 8, 2.2, 1.5, "#766c5e", "#30281e"],
          [46, 26, 2.5, 1.7, "#8e8476", "#3e362c"],
        ];
        for (const [px, py, prx, pry, fill, stroke] of pebbles) {
          shadow(ctx, px + 0.5, py + 1.2, prx * 1.1, pry * 0.9, 0.45);
          ellipse(ctx, px, py, prx, pry, fill, stroke, 0.8);
          ellipse(ctx, px - 0.5, py - 0.4, prx * 0.45, pry * 0.4, "rgba(255,245,225,0.45)");
        }
        // Small soil fracture in center crown
        ctx.strokeStyle = "rgba(24, 12, 5, 0.5)";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(22, 22); ctx.lineTo(26, 25); ctx.lineTo(31, 23);
        ctx.stroke();

        speckles(ctx, 2, 2, 50, 44, 24, "rgba(10, 5, 2, 0.28)", 1.2);
        speckles(ctx, 2, 2, 50, 44, 16, "rgba(255, 230, 175, 0.22)", 1.0);
      } else {
        // tile_dirt_c: Clustered roadside gravel & earth clods
        const pebbles = [
          [14, 8, 2.5, 1.7, "#7e7466", "#362e24"],
          [28, 41, 3.4, 2.2, "#968c7e", "#423a30"],
          [38, 24, 2.4, 1.6, "#8a8072", "#3c342a"],
          [50, 10, 2.2, 1.5, "#746a5c", "#2e261c"],
        ];
        for (const [px, py, prx, pry, fill, stroke] of pebbles) {
          shadow(ctx, px + 0.5, py + 1.2, prx * 1.1, pry * 0.9, 0.45);
          ellipse(ctx, px, py, prx, pry, fill, stroke, 0.8);
          ellipse(ctx, px - 0.5, py - 0.4, prx * 0.45, pry * 0.4, "rgba(255,245,225,0.45)");
        }
        speckles(ctx, 2, 2, 50, 44, 26, "rgba(10, 5, 2, 0.3)", 1.2);
        speckles(ctx, 2, 2, 50, 44, 18, "rgba(255, 230, 175, 0.24)", 1.0);
      }
    };
    make("tile_dirt", 54, 48, (ctx) => drawDirtTile(ctx, 0));
    make("tile_dirt_b", 54, 48, (ctx) => drawDirtTile(ctx, 1));
    make("tile_dirt_c", 54, 48, (ctx) => drawDirtTile(ctx, 2));

    make("tile_stone", 54, 48, (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Dark mountain slate bedrock and mortar bed
      rounded(ctx, 0, 0, 54, 48, 0, linGrad(ctx, 0, 0, 0, 48, [
        [0, "#14181c"],
        [0.5, "#222a32"],
        [1, "#101418"]
      ]));

      // 2. Seamless Interlocking Chiseled Flagstones (Modular 27px periodicity across width 54)
      const flagstones = [
        // Row 1 (top, y=2..15): Two 27px pavers spanning [0..27] and [27..54]
        { pts: [[1, 3], [26, 2], [26, 15], [1, 15]], c0: "#8695a6", c1: "#526070", c2: "#323c46" },
        { pts: [[28, 2], [53, 3], [53, 15], [28, 15]], c0: "#94a3b4", c1: "#5c6b7c", c2: "#38434e" },

        // Row 2 (middle, y=17..30): Staggered course split seamlessly at boundaries ([0..13], [15..39], [41..54])
        { pts: [[1, 18], [13, 17], [13, 30], [1, 30]], c0: "#8c9ba8", c1: "#586674", c2: "#36404a" },
        { pts: [[15, 17], [39, 18], [39, 30], [15, 30]], c0: "#98a8ba", c1: "#607082", c2: "#3c4856" },
        { pts: [[41, 18], [53, 17], [53, 30], [41, 30]], c0: "#8493a2", c1: "#505e6c", c2: "#303a44" },

        // Row 3 (bottom, y=32..45): Two 27px pavers matching Row 1 periodicity
        { pts: [[1, 33], [26, 32], [26, 45], [1, 45]], c0: "#808f9e", c1: "#4e5c6a", c2: "#2e3840" },
        { pts: [[28, 32], [53, 33], [53, 45], [28, 45]], c0: "#8fa0b0", c1: "#586878", c2: "#36424c" },
      ];

      for (const stone of flagstones) {
        // Deep mortar shadow
        poly(ctx, stone.pts.map(([x, y]) => [x + 1, y + 1]), "rgba(8, 12, 16, 0.7)");
        // Flagstone body
        const [x0, y0] = stone.pts[0];
        const [x2, y2] = stone.pts[2];
        poly(ctx, stone.pts, linGrad(ctx, x0, y0, x2, y2, [
          [0, stone.c0],
          [0.48, stone.c1],
          [1, stone.c2]
        ]), "#101418", 1.4);

        // Sunlit chisel bevel highlights on top and left rims
        ctx.strokeStyle = "rgba(240, 250, 255, 0.5)";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(stone.pts[3][0] + 1, stone.pts[3][1] - 1);
        ctx.lineTo(stone.pts[0][0] + 1, stone.pts[0][1] + 1);
        ctx.lineTo(stone.pts[1][0] - 1, stone.pts[1][1] + 1);
        ctx.stroke();

        // Chiseled surface micro-fracture
        const midX = (stone.pts[0][0] + stone.pts[1][0]) / 2;
        const midY = (stone.pts[0][1] + stone.pts[2][1]) / 2;
        ctx.strokeStyle = "rgba(14, 18, 24, 0.4)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(midX - 2.5, midY - 2);
        ctx.lineTo(midX + 2, midY + 1.5);
        ctx.stroke();
      }

      // 3. Continuous horizontal mortar groove shadow lines
      ctx.strokeStyle = "#0d1114";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 16); ctx.lineTo(54, 16);
      ctx.moveTo(0, 31); ctx.lineTo(54, 31);
      ctx.stroke();

      ctx.strokeStyle = "rgba(225, 240, 255, 0.3)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, 17); ctx.lineTo(54, 17);
      ctx.moveTo(0, 32); ctx.lineTo(54, 32);
      ctx.stroke();

      // 4. Crevice moss & lichen accents in internal joints
      const mossClumps = [
        [27, 16, 3, 2], [14, 31, 2.5, 1.8], [40, 31, 2.8, 1.8],
        [14, 16, 2.2, 1.5], [40, 16, 2.2, 1.5], [27, 31, 3, 2],
      ];
      for (const [mx, my, mrx, mry] of mossClumps) {
        ellipse(ctx, mx, my, mrx, mry, linGrad(ctx, mx - mrx, my - mry, mx + mrx, my + mry, [
          [0, "#749658"],
          [1, "#283c1c"]
        ]), "#121c0e", 0.6);
      }

      // 5. Granite stone speckles
      speckles(ctx, 1, 1, 52, 46, 28, "rgba(0, 0, 0, 0.25)", 1.1);
      speckles(ctx, 1, 1, 52, 46, 18, "rgba(240, 250, 255, 0.28)", 0.9);
    });

    make("tile_ember", 54, 48, (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Subterranean glowing magma underbed
      rounded(ctx, 0, 0, 54, 48, 0, linGrad(ctx, 0, 0, 0, 48, [
        [0, "#2c0600"],
        [0.25, "#701400"],
        [0.5, "#b83000"],
        [0.75, "#761600"],
        [1, "#240400"]
      ]));

      // 2. Continuous Magma River Veins (Matching entry and exit Y coordinates across x=0 and x=54)
      // Wide thermal bloom
      ctx.strokeStyle = "rgba(255, 70, 0, 0.65)";
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.moveTo(0, 18); ctx.quadraticCurveTo(27, 24, 54, 18);
      ctx.moveTo(0, 34); ctx.quadraticCurveTo(27, 28, 54, 34);
      ctx.stroke();

      // Searing orange mid-core
      ctx.strokeStyle = "#ff7700";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(0, 18); ctx.quadraticCurveTo(27, 24, 54, 18);
      ctx.moveTo(0, 34); ctx.quadraticCurveTo(27, 28, 54, 34);
      ctx.stroke();

      // Molten yellow inner core
      ctx.strokeStyle = "#ffea60";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 18); ctx.quadraticCurveTo(27, 24, 54, 18);
      ctx.moveTo(0, 34); ctx.quadraticCurveTo(27, 28, 54, 34);
      ctx.stroke();

      // White-hot filament
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, 18); ctx.quadraticCurveTo(27, 24, 54, 18);
      ctx.moveTo(0, 34); ctx.quadraticCurveTo(27, 28, 54, 34);
      ctx.stroke();

      // 3. Basaltic Obsidian Crust Plates (High contrast, modular seamless fit)
      const basaltPlates = [
        // Upper left plate
        { pts: [[1, 2], [25, 2], [23, 16], [1, 15]], c0: "#48322e", c1: "#281a18", c2: "#120a08" },
        // Upper right plate
        { pts: [[29, 2], [53, 2], [53, 15], [31, 16]], c0: "#4c3632", c1: "#2c1e1c", c2: "#140c0a" },
        // Center plate island
        { pts: [[14, 21], [40, 21], [38, 29], [16, 29]], c0: "#503834", c1: "#2e201e", c2: "#160e0c" },
        // Lower left plate
        { pts: [[1, 37], [25, 36], [23, 46], [1, 46]], c0: "#442e2a", c1: "#261816", c2: "#100806" },
        // Lower right plate
        { pts: [[29, 36], [53, 37], [53, 46], [31, 46]], c0: "#48322e", c1: "#281a18", c2: "#120a08" },
      ];

      for (const plate of basaltPlates) {
        const [x0, y0] = plate.pts[0];
        const [x2, y2] = plate.pts[2];
        poly(ctx, plate.pts, linGrad(ctx, x0, y0, x2, y2, [
          [0, plate.c0],
          [0.45, plate.c1],
          [1, plate.c2]
        ]), "#080404", 1.4);

        // Crust top cooling rim highlight
        ctx.strokeStyle = "rgba(220, 175, 160, 0.35)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(plate.pts[3][0] + 1, plate.pts[3][1] - 1);
        ctx.lineTo(plate.pts[0][0] + 1, plate.pts[0][1] + 1);
        ctx.lineTo(plate.pts[1][0] - 1, plate.pts[1][1] + 1);
        ctx.stroke();

        // Thermal stress micro-cracks glowing
        const cx = (plate.pts[0][0] + plate.pts[2][0]) / 2;
        const cy = (plate.pts[0][1] + plate.pts[2][1]) / 2;
        ctx.strokeStyle = "rgba(255, 140, 30, 0.55)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy - 2); ctx.lineTo(cx + 3, cy + 1.5);
        ctx.stroke();
      }

      // 4. Glowing cinder motes and sulfur crust deposits
      const embers = [
        [18, 20, 1.8, "#fff490"],
        [36, 20, 1.6, "#ffd040"],
        [27, 26, 2.0, "#ffaa20"],
        [9, 36, 1.4, "#ff7700"],
        [45, 35, 1.4, "#ff8800"],
      ];
      for (const [ex, ey, er, ec] of embers) {
        ellipse(ctx, ex, ey, er * 2.4, er * 2.4, "rgba(255, 90, 0, 0.4)");
        ellipse(ctx, ex, ey, er, er, ec);
      }

      // Sulfur crust deposits along thermal fissures
      const sulfurDeposits = [
        [20, 18, 2.5, 1.2], [34, 18, 2.5, 1.2], [27, 31, 3, 1.4],
      ];
      for (const [sx, sy, srx, sry] of sulfurDeposits) {
        ellipse(ctx, sx, sy, srx, sry, "rgba(235, 190, 50, 0.7)");
      }

      // Charred soot speckling
      speckles(ctx, 1, 1, 52, 46, 30, "rgba(0, 0, 0, 0.35)", 1.2);
      speckles(ctx, 1, 1, 52, 46, 16, "rgba(255, 160, 50, 0.32)", 1.0);
    });

    make("tile_dirt_edge", 54, 16, (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // Broken turf embankment with softer gradient transition
      rounded(ctx, 0, 0, 54, 16, 0, linGrad(ctx, 0, 0, 0, 16, [
        [0, "#2a3e16"],
        [0.4, "#442c16"],
        [1, "#221206"]
      ]));
      // Overhanging grass blades with organic soft tips
      for (let i = 0; i < 10; i += 1) {
        const gx = 2 + i * 5.4;
        const gh = 4.5 + (i % 3) * 2.6;
        poly(ctx, [[gx - 2, 0], [gx + 2, 0], [gx + 0.4, gh]], "#6eb032", "#1e340c", 0.6);
      }
      // Loam crumbs & gravel
      ellipse(ctx, 14, 10, 2.5, 1.6, "#827666", "#302a20", 0.6);
      ellipse(ctx, 38, 9, 2.2, 1.4, "#928472", "#362e24", 0.6);
      speckles(ctx, 1, 1, 52, 14, 14, "rgba(0, 0, 0, 0.24)", 1.0);
    });

    make("tile_stone_edge", 54, 16, (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // Mountain slate curb border with soft shadow
      rounded(ctx, 0, 0, 54, 16, 0, linGrad(ctx, 0, 0, 0, 16, [
        [0, "#1c2024"],
        [0.5, "#343c44"],
        [1, "#14181c"]
      ]));
      // Soft rounded curb stones
      for (let i = 0; i < 4; i += 1) {
        const sx = 2 + i * 13;
        rounded(ctx, sx, 2, 11, 12, 2.0, linGrad(ctx, sx, 2, sx + 11, 14, [
          [0, "#7a8a9a"],
          [1, "#3a444e"]
        ]), "#101418", 1.0);
        ctx.strokeStyle = "rgba(240, 250, 255, 0.4)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(sx + 1.5, 3.5); ctx.lineTo(sx + 9.5, 3.5);
        ctx.stroke();
      }
      // Alpine moss in crevices
      ellipse(ctx, 13, 8, 2.2, 2.0, "#5a7444");
      ellipse(ctx, 39, 8, 2.2, 2.0, "#5a7444");
      speckles(ctx, 1, 1, 52, 14, 14, "rgba(0, 0, 0, 0.22)", 1.0);
    });

    make("tile_ember_edge", 54, 16, (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // Charred basalt rim with soft radiating thermal glow
      rounded(ctx, 0, 0, 54, 16, 0, linGrad(ctx, 0, 0, 0, 16, [
        [0, "#1a0e0c"],
        [0.45, "#421206"],
        [1, "#100604"]
      ]));
      // Soft glowing lava rim fissure
      ctx.strokeStyle = "rgba(255, 90, 0, 0.6)";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(0, 8); ctx.lineTo(18, 11); ctx.lineTo(36, 6); ctx.lineTo(54, 9);
      ctx.stroke();
      ctx.strokeStyle = "#ffa828";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, 8); ctx.lineTo(18, 11); ctx.lineTo(36, 6); ctx.lineTo(54, 9);
      ctx.stroke();
      for (let i = 0; i < 4; i += 1) {
        const bx = 3 + i * 13;
        poly(ctx, [[bx, 2], [bx + 10, 3], [bx + 8, 13], [bx + 1, 12]], "#2e1e1a", "#080404", 0.9);
      }
      ellipse(ctx, 24, 9, 1.6, 1.6, "#fff490");
      speckles(ctx, 1, 1, 52, 14, 16, "rgba(0, 0, 0, 0.32)", 1.1);
    });

    // UI chip icons for shop
    make("icon_gold", 24, 24, (ctx) => {
      // 1. Soft Ground Drop Shadow
      shadow(ctx, 12, 19.5, 8.5, 3.2, 0.45);

      // 2. Thick 3D Golden Coin Edge / Rim
      ellipse(
        ctx,
        12,
        13.5,
        9.5,
        8.5,
        linGrad(ctx, 3, 10, 21, 22, [
          [0, "#8a5810"],
          [0.5, "#523204"],
          [1, "#281502"],
        ]),
        "#1a0e04",
        1.6
      );

      // 3. Front Coin Face Bevel Rim
      ellipse(
        ctx,
        12,
        11.5,
        9.5,
        8.5,
        linGrad(ctx, 4, 3, 20, 19, [
          [0, "#fffbe0"],
          [0.25, "#ffd54f"],
          [0.65, "#f59e0b"],
          [1, "#78350f"],
        ]),
        "#1c0d02",
        1.8
      );

      // 4. Raised Outer Gold Border
      ellipse(
        ctx,
        12,
        11.5,
        8.5,
        7.5,
        linGrad(ctx, 4, 4, 20, 18, [
          [0, "#fff59d"],
          [0.35, "#ffca28"],
          [0.8, "#d97706"],
          [1, "#854d0e"],
        ])
      );

      // 5. Recessed Inner Coin Bed
      ellipse(
        ctx,
        12,
        11.5,
        6.8,
        6.0,
        linGrad(ctx, 5, 5, 19, 17, [
          [0, "#b45309"],
          [0.3, "#f59e0b"],
          [0.85, "#fbbf24"],
          [1, "#fef3c7"],
        ]),
        "#78350f",
        1.0
      );

      // 6. Embossed "G" Emblem (Engraved shadow + lit face)
      ctx.font = "900 11px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#3d1f04";
      ctx.fillText("G", 12.2, 12.6);
      ctx.fillStyle = "#fffde7";
      ctx.fillText("G", 11.8, 11.2);
      ctx.fillStyle = "#ffd54f";
      ctx.fillText("G", 12, 11.8);

      // 7. Specular Sparkle & Glint
      ellipse(ctx, 7.5, 7.2, 2.2, 1.2, "#ffffff");
      poly(ctx, [[7.5, 5.2], [8.5, 7.2], [7.5, 9.2], [6.5, 7.2]], "#ffffff");
      ctx.beginPath();
      ctx.arc(12, 11.5, 8.2, 0.2 * Math.PI, 0.6 * Math.PI);
      ctx.strokeStyle = "rgba(255, 245, 180, 0.55)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    make("icon_heart", 24, 24, (ctx) => {
      // 1. Soft Ground Drop Shadow
      shadow(ctx, 12, 21.5, 7.8, 2.6, 0.45);

      // 2. Thick 3D Bottom Extrusion
      ctx.beginPath();
      ctx.moveTo(12, 21.8);
      ctx.bezierCurveTo(4, 15.5, 2, 9, 6.5, 5.5);
      ctx.bezierCurveTo(9.5, 3.2, 12, 6, 12, 7.8);
      ctx.bezierCurveTo(12, 6, 14.5, 3.2, 17.5, 5.5);
      ctx.bezierCurveTo(22, 9, 20, 15.5, 12, 21.8);
      ctx.fillStyle = "#4a040e";
      ctx.fill();
      ctx.strokeStyle = "#1a0104";
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // 3. Main Plump Heart Body (Vibrant candy ruby gradient)
      ctx.beginPath();
      ctx.moveTo(12, 20.2);
      ctx.bezierCurveTo(4.2, 14.2, 2.2, 8.2, 6.8, 4.8);
      ctx.bezierCurveTo(9.8, 2.8, 12, 5.5, 12, 7.2);
      ctx.bezierCurveTo(12, 5.5, 14.2, 2.8, 17.2, 4.8);
      ctx.bezierCurveTo(21.8, 8.2, 19.8, 14.2, 12, 20.2);
      ctx.fillStyle = linGrad(ctx, 6, 4, 18, 20, [
        [0, "#ff5370"],
        [0.35, "#f43f5e"],
        [0.7, "#be123c"],
        [1, "#881337"],
      ]);
      ctx.fill();
      ctx.strokeStyle = "#1a0104";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 4. Glossy 3D Highlights
      ellipse(
        ctx,
        7.8,
        6.8,
        2.8,
        1.8,
        linGrad(ctx, 5, 5, 10, 8, [
          [0, "#ffffff"],
          [0.6, "rgba(255,255,255,0.7)"],
          [1, "rgba(255,200,210,0)"],
        ])
      );
      ellipse(ctx, 6.8, 5.8, 1.1, 0.8, "#ffffff");
      ellipse(ctx, 16.2, 6.8, 1.8, 1.2, "rgba(255,255,255,0.65)");

      // 5. Crescent Ambient Rim Reflection
      ctx.beginPath();
      ctx.moveTo(5.5, 11);
      ctx.quadraticCurveTo(7.5, 15.5, 11.5, 18.5);
      ctx.strokeStyle = "rgba(255, 170, 190, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    make("campaign_board_bg", 360, 300, (ctx) => {
      // 1. Heavy Polished Walnut Outer Frame
      rounded(
        ctx,
        0,
        0,
        360,
        300,
        14,
        linGrad(ctx, 0, 0, 360, 300, [
          [0, "#3e2412"],
          [0.35, "#2a160a"],
          [0.75, "#1c0d06"],
          [1, "#100602"],
        ]),
        "#080301",
        2.5
      );

      // 2. Beveled Inner Wood Edge
      rounded(ctx, 4, 4, 352, 292, 11, null, "#5c381c", 1.2);

      // 3. Gilded Gold Inlay Filigree Border
      rounded(
        ctx,
        6,
        6,
        348,
        288,
        10,
        null,
        linGrad(ctx, 6, 6, 354, 294, [
          [0, "#fff59d"],
          [0.3, "#ffd54f"],
          [0.7, "#d97706"],
          [1, "#78350f"],
        ]),
        1.8
      );

      // 4. Four Gilded Corner Cornerpieces
      const corners = [
        [10, 10],
        [350, 10],
        [10, 290],
        [350, 290],
      ];
      for (const [cx, cy] of corners) {
        ellipse(ctx, cx, cy, 3.5, 3.5, "#ffd54f", "#3e2410", 1.2);
      }

      // 5. High-Contrast Antique Parchment Map Bed (Crisp warm ivory to aged gold)
      const mapGrad = linGrad(ctx, 10, 10, 350, 290, [
        [0, "#fffcf2"],
        [0.2, "#fbf4e2"],
        [0.55, "#f3e5c4"],
        [0.85, "#e5cca0"],
        [1, "#cca86e"],
      ]);
      rounded(ctx, 10, 10, 340, 280, 8, mapGrad, "#241306", 2.2);

      // 6. Vintage Cartographic Neatlines (Double inner chart borders)
      rounded(ctx, 14, 14, 332, 272, 6, null, "#784e24", 1.2);
      rounded(ctx, 16, 16, 328, 268, 5, null, "#b5884a", 0.8);

      // 7. Subtle Parchment Texture Speckles
      speckles(ctx, 18, 18, 324, 264, 55, "rgba(95, 60, 25, 0.08)", 1.1);
      speckles(ctx, 20, 20, 320, 260, 35, "rgba(255, 255, 255, 0.35)", 1.0);

      // 8. Rhumb / Navigation Lines
      ctx.strokeStyle = "rgba(130, 90, 50, 0.12)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(18, 150);
      ctx.lineTo(342, 150);
      ctx.moveTo(180, 18);
      ctx.lineTo(180, 282);
      ctx.moveTo(18, 18);
      ctx.lineTo(342, 282);
      ctx.moveTo(18, 282);
      ctx.lineTo(342, 18);
      ctx.stroke();

      // 9. Coastal Seas & Waters (South & Southeast Ocean)
      ellipse(
        ctx,
        335,
        275,
        95,
        65,
        linGrad(ctx, 270, 220, 360, 300, [
          [0, "rgba(90, 155, 195, 0.85)"],
          [0.45, "rgba(50, 115, 160, 0.9)"],
          [1, "rgba(20, 65, 105, 0.95)"],
        ])
      );
      ellipse(
        ctx,
        185,
        294,
        135,
        38,
        linGrad(ctx, 120, 270, 260, 300, [
          [0, "rgba(80, 140, 180, 0.75)"],
          [1, "rgba(25, 75, 115, 0.88)"],
        ])
      );

      // Coastline Wave Ripple Contours
      ctx.strokeStyle = "rgba(185, 230, 255, 0.65)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(130, 276);
      ctx.bezierCurveTo(180, 266, 250, 248, 336, 222);
      ctx.moveTo(140, 282);
      ctx.bezierCurveTo(190, 272, 260, 255, 340, 230);
      ctx.stroke();

      // Mini Caravel Sailing Ship at (235, 275)
      poly(
        ctx,
        [
          [226, 276],
          [244, 276],
          [240, 282],
          [229, 282],
        ],
        "#4a2a12",
        "#180c04",
        1.0
      );
      poly(ctx, [[228, 275], [231, 268], [234, 275]], "#ffffff", "#3a2010", 0.7);
      poly(ctx, [[235, 274], [238, 266], [242, 274]], "#fffde7", "#3a2010", 0.7);
      poly(ctx, [[238, 266], [243, 267], [238, 269]], "#d32f2f");

      // ==========================================
      // 10. BIOME A: FOREST GATE (Southwest ~ x:30-130, y:190-280)
      // ==========================================
      ellipse(
        ctx,
        78,
        236,
        68,
        46,
        linGrad(ctx, 20, 190, 135, 280, [
          [0, "rgba(76, 175, 80, 0.88)"],
          [0.45, "rgba(46, 125, 50, 0.92)"],
          [1, "rgba(18, 65, 24, 0.96)"],
        ])
      );

      // Winding Sapphire River
      ctx.beginPath();
      ctx.moveTo(140, 192);
      ctx.bezierCurveTo(100, 212, 78, 242, 50, 280);
      ctx.strokeStyle = "#1565c0";
      ctx.lineWidth = 5.5;
      ctx.stroke();
      ctx.strokeStyle = "#64b5f6";
      ctx.lineWidth = 2.8;
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Stone/Wood Bridge at (72, 245)
      poly(
        ctx,
        [
          [66, 240],
          [78, 244],
          [76, 250],
          [64, 246],
        ],
        "#6d4c41",
        "#1b0e07",
        1.2
      );

      // High-Contrast Multi-tiered Pine Trees & Canopy
      const forestPines = [
        [34, 258, 10, 20],
        [46, 212, 12, 24],
        [62, 262, 11, 22],
        [82, 214, 13, 26],
        [98, 256, 12, 24],
        [116, 228, 11, 22],
        [128, 250, 10, 20],
        [56, 230, 9, 18],
        [106, 210, 10, 20],
      ];
      for (const [px, py, hw, hh] of forestPines) {
        // Tree Trunk
        rounded(ctx, px - 1.8, py + 2, 3.6, 7, 1, "#4e342e", "#1b0e07", 0.9);

        // Bottom tier
        poly(
          ctx,
          [
            [px, py - hh * 0.4],
            [px - hw, py + 4],
            [px + hw, py + 4],
          ],
          linGrad(ctx, px - hw, py - hh, px + hw, py + 4, [
            [0, "#66bb6a"],
            [0.4, "#2e7d32"],
            [1, "#0d3311"],
          ]),
          "#081f0a",
          1.1
        );

        // Middle tier
        poly(
          ctx,
          [
            [px, py - hh * 0.75],
            [px - hw * 0.8, py - hh * 0.1],
            [px + hw * 0.8, py - hh * 0.1],
          ],
          linGrad(ctx, px - hw, py - hh, px + hw, py, [
            [0, "#81c784"],
            [0.45, "#388e3c"],
            [1, "#144218"],
          ]),
          "#081f0a",
          1.0
        );

        // Top crown
        poly(
          ctx,
          [
            [px, py - hh],
            [px - hw * 0.55, py - hh * 0.5],
            [px + hw * 0.55, py - hh * 0.5],
          ],
          linGrad(ctx, px - hw, py - hh, px + hw, py, [
            [0, "#a5d6a7"],
            [0.5, "#4caf50"],
            [1, "#1b5e20"],
          ]),
          "#081f0a",
          1.0
        );
      }

      // Small Castle Guardtower at (36, 204)
      rounded(ctx, 32, 194, 8, 14, 2, "#90a4ae", "#1c2833", 1.2);
      poly(
        ctx,
        [
          [30, 194],
          [36, 187],
          [42, 194],
        ],
        "#e53935",
        "#1a0505",
        1.0
      );

      // ==========================================
      // 11. BIOME B: STONE PASS (Center ~ x:130-225, y:120-195)
      // ==========================================
      ellipse(
        ctx,
        178,
        162,
        60,
        40,
        linGrad(ctx, 130, 120, 225, 195, [
          [0, "rgba(176, 190, 197, 0.9)"],
          [0.55, "rgba(96, 125, 139, 0.92)"],
          [1, "rgba(38, 50, 56, 0.95)"],
        ])
      );

      // Towering Jagged Mountain Horns with Glacial Snow Mantles
      // Peak 1: West Crag
      poly(
        ctx,
        [
          [132, 178],
          [152, 118],
          [170, 178],
        ],
        linGrad(ctx, 132, 118, 170, 178, [
          [0, "#eceff1"],
          [0.4, "#90a4ae"],
          [1, "#263238"],
        ]),
        "#0f171a",
        1.6
      );
      poly(
        ctx,
        [
          [132, 178],
          [152, 118],
          [148, 178],
        ],
        linGrad(ctx, 132, 118, 152, 178, [
          [0, "#ffffff"],
          [0.5, "#cfd8dc"],
          [1, "#607d8b"],
        ])
      );
      poly(
        ctx,
        [
          [146, 134],
          [152, 118],
          [158, 134],
          [152, 130],
        ],
        "#ffffff",
        "#b0bec5",
        0.8
      );

      // Peak 2: Grand Central Horn
      poly(
        ctx,
        [
          [160, 172],
          [185, 96],
          [214, 172],
        ],
        linGrad(ctx, 160, 96, 214, 172, [
          [0, "#ffffff"],
          [0.35, "#78909c"],
          [1, "#1a252c"],
        ]),
        "#0a1014",
        1.8
      );
      poly(
        ctx,
        [
          [160, 172],
          [185, 96],
          [182, 172],
        ],
        linGrad(ctx, 160, 96, 185, 172, [
          [0, "#ffffff"],
          [0.4, "#cfd8dc"],
          [1, "#546e7a"],
        ])
      );
      poly(
        ctx,
        [
          [175, 120],
          [185, 96],
          [196, 120],
          [189, 114],
          [182, 118],
        ],
        "#ffffff",
        "#b0bec5",
        0.9
      );

      // Peak 3: East Sentinel
      poly(
        ctx,
        [
          [198, 176],
          [222, 116],
          [244, 176],
        ],
        linGrad(ctx, 198, 116, 244, 176, [
          [0, "#eceff1"],
          [0.45, "#78909c"],
          [1, "#212d34"],
        ]),
        "#0e161a",
        1.6
      );
      poly(
        ctx,
        [
          [198, 176],
          [222, 116],
          [218, 176],
        ],
        linGrad(ctx, 198, 116, 222, 176, [
          [0, "#ffffff"],
          [0.45, "#b0bec5"],
          [1, "#455a64"],
        ])
      );
      poly(
        ctx,
        [
          [216, 132],
          [222, 116],
          [228, 132],
          [222, 128],
        ],
        "#ffffff",
        "#b0bec5",
        0.8
      );

      // ==========================================
      // 12. BIOME C: EMBER MARSH (Mid-Right ~ x:235-325, y:75-145)
      // ==========================================
      ellipse(
        ctx,
        280,
        110,
        58,
        38,
        linGrad(ctx, 235, 75, 325, 145, [
          [0, "#4a1208"],
          [0.5, "#2a0806"],
          [1, "#120304"],
        ])
      );

      // Large Center Magma Caldera Lake
      ellipse(
        ctx,
        275,
        112,
        22,
        11,
        linGrad(ctx, 255, 102, 295, 122, [
          [0, "#ffffff"],
          [0.22, "#fff59d"],
          [0.55, "#ff6d00"],
          [0.85, "#c62828"],
          [1, "#3e0a0a"],
        ]),
        "#1a0204",
        1.8
      );
      ellipse(ctx, 274, 111, 12, 5, "#fff9c4");

      // East Magma Pool
      ellipse(
        ctx,
        306,
        98,
        16,
        8,
        linGrad(ctx, 292, 90, 320, 106, [
          [0, "#fffde7"],
          [0.35, "#ff9100"],
          [0.8, "#b71c1c"],
          [1, "#4a0505"],
        ]),
        "#1c0404",
        1.5
      );
      ellipse(ctx, 305, 97, 8, 3.5, "#fffde7");

      // Glowing Magma Fissure Lines
      ctx.beginPath();
      ctx.moveTo(242, 126);
      ctx.bezierCurveTo(258, 118, 268, 114, 275, 112);
      ctx.bezierCurveTo(288, 110, 298, 102, 318, 100);
      ctx.strokeStyle = "#ff3d00";
      ctx.lineWidth = 3.2;
      ctx.stroke();
      ctx.strokeStyle = "#ffff8d";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Jagged Black Basalt Crags
      poly(
        ctx,
        [
          [252, 120],
          [257, 100],
          [264, 120],
        ],
        "#1c1014",
        "#0a0406",
        1.2
      );
      poly(
        ctx,
        [
          [294, 106],
          [300, 88],
          [308, 106],
        ],
        "#241418",
        "#0a0406",
        1.2
      );

      // ==========================================
      // 13. BIOME D: GALE REACH (Top-Right ~ x:260-345, y:15-75)
      // ==========================================
      ellipse(
        ctx,
        305,
        45,
        48,
        28,
        linGrad(ctx, 260, 15, 345, 75, [
          [0, "#e0f2fe"],
          [0.4, "#7dd3fc"],
          [0.8, "#0284c7"],
          [1, "#0369a1"],
        ])
      );

      // Windswept Azure Spires & Needles
      poly(
        ctx,
        [
          [282, 54],
          [296, 22],
          [308, 54],
        ],
        linGrad(ctx, 282, 22, 308, 54, [
          [0, "#ffffff"],
          [0.5, "#bae6fd"],
          [1, "#0369a1"],
        ]),
        "#082f49",
        1.5
      );
      poly(
        ctx,
        [
          [310, 58],
          [326, 18],
          [340, 58],
        ],
        linGrad(ctx, 310, 18, 340, 58, [
          [0, "#ffffff"],
          [0.4, "#93c5fd"],
          [1, "#1e3a8a"],
        ]),
        "#0f172a",
        1.5
      );

      // Billowing Wind Clouds & Ribbons
      ellipse(ctx, 288, 32, 14, 6, "rgba(255,255,255,0.9)", "#38bdf8", 0.8);
      ellipse(ctx, 328, 26, 16, 7, "rgba(255,255,255,0.95)", "#38bdf8", 0.8);
      ctx.beginPath();
      ctx.moveTo(270, 24);
      ctx.bezierCurveTo(290, 16, 320, 28, 344, 20);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // ==========================================
      // 14. BIOME E: ASH SPIRE (Top-Left ~ x:55-135, y:55-135)
      // ==========================================
      ellipse(
        ctx,
        92,
        98,
        48,
        34,
        linGrad(ctx, 55, 55, 135, 135, [
          [0, "#574338"],
          [0.5, "#30221c"],
          [1, "#170f0c"],
        ])
      );

      // Grand Cinder Cone Volcano
      poly(
        ctx,
        [
          [62, 126],
          [92, 60],
          [122, 126],
        ],
        linGrad(ctx, 92, 60, 92, 126, [
          [0, "#443028"],
          [0.4, "#261a15"],
          [1, "#120b08"],
        ]),
        "#090504",
        1.8
      );
      poly(
        ctx,
        [
          [62, 126],
          [92, 60],
          [88, 126],
        ],
        linGrad(ctx, 62, 60, 92, 126, [
          [0, "#66483c"],
          [0.5, "#3d281e"],
          [1, "#1e120c"],
        ])
      );

      // Glowing Volcanic Caldera Rim & Crater
      ellipse(ctx, 92, 60, 9, 4.5, "#ff3d00", "#120402", 1.2);
      ellipse(ctx, 92, 60, 5, 2.2, "#ffea00");

      // Rising Volcanic Ash Plume
      ellipse(ctx, 94, 46, 15, 8, "rgba(60, 50, 45, 0.75)", "#181210", 1.0);
      ellipse(ctx, 98, 38, 12, 6, "rgba(80, 70, 65, 0.65)", "#221a16", 0.8);
      ellipse(ctx, 88, 50, 1.2, 1.2, "#ff9100");
      ellipse(ctx, 96, 44, 1.0, 1.0, "#ff3d00");

      // ==========================================
      // 15. HIGH-CONTRAST IMPERIAL COBBLESTONE HIGHWAY
      // ==========================================
      const highways = [
        // Forest Gate -> Stone Pass
        [[40, 230], [90, 200], [145, 160]],
        // Stone Pass -> Ember Marsh
        [[145, 160], [195, 130], [248, 103]],
        // Ember Marsh -> Gale Reach
        [[248, 103], [265, 65], [278, 30]],
        // Forest Gate -> Ash Spire
        [[40, 230], [60, 165], [88, 103]],
        // Ash Spire -> Stone Pass
        [[88, 103], [115, 135], [145, 160]],
      ];

      for (const pts of highways) {
        // 1. Shaded road bed base
        ctx.strokeStyle = "rgba(45, 26, 12, 0.65)";
        ctx.lineWidth = 7;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
        ctx.stroke();

        // 2. High-contrast packed golden cobble road
        ctx.strokeStyle = "#e5bc72";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
        ctx.stroke();

        // 3. Center road trail dashed line
        ctx.strokeStyle = "#805124";
        ctx.lineWidth = 1.2;
        if (ctx.setLineDash) ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
        ctx.stroke();
        if (ctx.setLineDash) ctx.setLineDash([]);
      }

      // ==========================================
      // 16. MASTER COMPASS ROSE (Bottom-Right ~ x:318, y:250)
      // ==========================================
      const cx = 318;
      const cy = 250;

      // Outer Gilded Compass Disc
      ellipse(ctx, cx, cy, 20, 20, "rgba(254, 248, 235, 0.95)", "#3e2410", 1.8);
      ellipse(ctx, cx, cy, 16, 16, null, "#8a5c2a", 1.0);

      // 8-Point Faceted Nautical Star
      // North Point (Pure White / Deep Crimson)
      poly(
        ctx,
        [
          [cx, cy - 18],
          [cx + 3.5, cy - 2],
          [cx, cy],
        ],
        "#c62828"
      );
      poly(
        ctx,
        [
          [cx, cy - 18],
          [cx - 3.5, cy - 2],
          [cx, cy],
        ],
        "#ffffff"
      );

      // South Point
      poly(
        ctx,
        [
          [cx, cy + 18],
          [cx + 3.5, cy + 2],
          [cx, cy],
        ],
        "#f57f17"
      );
      poly(
        ctx,
        [
          [cx, cy + 18],
          [cx - 3.5, cy + 2],
          [cx, cy],
        ],
        "#3e2723"
      );

      // East Point
      poly(
        ctx,
        [
          [cx + 18, cy],
          [cx + 2, cy - 3.5],
          [cx, cy],
        ],
        "#f57f17"
      );
      poly(
        ctx,
        [
          [cx + 18, cy],
          [cx + 2, cy + 3.5],
          [cx, cy],
        ],
        "#3e2723"
      );

      // West Point
      poly(
        ctx,
        [
          [cx - 18, cy],
          [cx - 2, cy - 3.5],
          [cx, cy],
        ],
        "#ffffff"
      );
      poly(
        ctx,
        [
          [cx - 18, cy],
          [cx - 2, cy + 3.5],
          [cx, cy],
        ],
        "#c62828"
      );

      // Diagonal minor points (NE, NW, SE, SW)
      poly(
        ctx,
        [
          [cx + 11, cy - 11],
          [cx + 2, cy - 1],
          [cx, cy],
          [cx + 1, cy - 2],
        ],
        "#ffd54f"
      );
      poly(
        ctx,
        [
          [cx - 11, cy - 11],
          [cx - 2, cy - 1],
          [cx, cy],
          [cx - 1, cy - 2],
        ],
        "#ffffff"
      );
      poly(
        ctx,
        [
          [cx + 11, cy + 11],
          [cx + 2, cy + 1],
          [cx, cy],
          [cx + 1, cy + 2],
        ],
        "#3e2723"
      );
      poly(
        ctx,
        [
          [cx - 11, cy + 11],
          [cx - 2, cy + 1],
          [cx, cy],
          [cx - 1, cy + 2],
        ],
        "#c62828"
      );

      // Center Gilded Boss
      ellipse(ctx, cx, cy, 3.5, 3.5, "#ffd54f", "#2b1606", 1.2);

      // Calligraphic "N" Direction Indicator
      ctx.fillStyle = "#8a1515";
      ctx.font = "bold 11px Georgia, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("N", cx, cy - 24);
    });
  };

  window.KRCArt = { bake };
})();
