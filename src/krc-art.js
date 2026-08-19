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
      shadow(ctx, 36, 36, 28, 8, 0.35);
      ellipse(ctx, 36, 30, 28, 14, linGrad(ctx, 10, 18, 60, 42, [[0, "#6a5a40"], [0.5, "#4a3c2a"], [1, "#2c2218"]]), "#1a140e", 2.5);
      ellipse(ctx, 36, 28, 22, 10, linGrad(ctx, 18, 20, 54, 36, [[0, "#8a7860"], [1, "#524434"]]), "#2a2016", 1.5);
      // stone ring
      ctx.strokeStyle = "#d4b56a";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(36, 28, 18, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,236,170,.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(36, 28, 14, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      // plus gem
      poly(ctx, [[36, 20], [40, 28], [36, 36], [32, 28]], linGrad(ctx, 32, 20, 40, 36, [[0, "#fff2a8"], [1, "#c9a040"]]), "#5a4018", 1.2);
    });

    // —— Towers (96×96 for detail) ——
    const towerBase = (ctx, cfg) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      shadow(ctx, 48, 86, 34, 9, 0.4);
      // earthen mound
      ellipse(ctx, 48, 80, 32, 12, linGrad(ctx, 20, 72, 76, 90, [[0, "#5a6e3a"], [1, "#2a381c"]]), "#1a2410", 1.5);
      // stone plinth
      stoneBrick(ctx, 22, 52, 52, 30, cfg.stoneHi, cfg.stone, cfg.stoneLo);
      // wooden platform lip
      woodPlank(ctx, 18, 48, 60, 10, cfg.woodHi, cfg.woodLo);
      // battlements
      for (let i = 0; i < 5; i += 1) {
        const x = 22 + i * 11;
        rounded(ctx, x, 42, 8, 10, 2, linGrad(ctx, x, 42, x, 52, [[0, cfg.stoneHi], [1, cfg.stone]]), "#1a140f", 1.2);
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
      shadow(ctx, 64, 116, 48, 11, 0.42);
      shadow(ctx, 64, 117, 36, 6, 0.55);

      // Earthen mound
      ellipse(ctx, 64, 110, 46, 14, linGrad(ctx, 24, 96, 104, 122, [[0, "#546a32"], [0.4, "#3c4d22"], [1, "#1c2610"]]), "#141c0a", 2);
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
      rounded(ctx, 32, 80, 64, 30, 4, linGrad(ctx, 32, 80, 96, 110, [[0, "#98a284"], [0.35, "#707a60"], [0.75, "#4c543e"], [1, "#2a3020"]]), "#1a2012", 2.2);

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
      rounded(ctx, 22, 72, 84, 10, 3, linGrad(ctx, 22, 72, 106, 82, [[0, "#c68c48"], [0.25, "#9c642c"], [0.75, "#683c14"], [1, "#3c1e08"]]), "#221004", 2);

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
      rounded(ctx, 34, 42, 60, 32, 3, linGrad(ctx, 34, 42, 94, 74, [[0, "#a8723a"], [0.3, "#825022"], [0.7, "#583010"], [1, "#341806"]]), "#1e0e04", 2);

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
      poly(ctx, eavePoly, linGrad(ctx, 64, 20, 64, 56, [[0, "#f4dc7c"], [0.35, "#d4aa44"], [0.75, "#8e641c"], [1, "#4a320a"]]), "#241604", 2.2);

      rounded(ctx, 18, 53, 5, 4, 1, "#583212", "#201004", 1);
      rounded(ctx, 105, 53, 5, 4, 1, "#46240a", "#201004", 1);

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
      poly(ctx, upperPoly, linGrad(ctx, 64, 10, 64, 36, [[0, "#fff49e"], [0.35, "#e0ba50"], [0.75, "#9c7020"], [1, "#52380c"]]), "#241604", 2.0);

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
      poly(ctx, [[46, 47], [51, 44], [54, 56], [49, 57]], "#6e3e1c", "#241206", 1.2);
      for (let i = 0; i < 2; i += 1) {
        const ax = 48 + i * 2.4;
        const ay = 43 - i * 1.5;
        ctx.strokeStyle = "#d49a52";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ax, ay + 4); ctx.lineTo(ax, ay);
        ctx.stroke();
        poly(ctx, [[ax, ay], [ax - 1.5, ay + 2.5], [ax + 1.5, ay + 2.5]], "#f6f2e4", "#201008", 0.8);
      }

      // Trailing Cloak & Torso Angled Forward
      poly(ctx, [[48, 54], [58, 49], [75, 48], [76, 65], [50, 65]], linGrad(ctx, 48, 49, 76, 65, [[0, "#3a7036"], [0.4, "#244a22"], [1, "#122610"]]), "#0e1e0c", 1.4);

      // Archer Head & Hood Leaning Forward
      ellipse(ctx, 68, 45, 5.5, 6, linGrad(ctx, 63, 40, 73, 51, [[0, "#3a7036"], [0.5, "#285226"], [1, "#142c12"]]), "#0e1e0c", 1.2);
      ellipse(ctx, 71, 46, 4, 4.5, "#f6d5ae", "#3a2214", 1);
      ctx.fillStyle = "rgba(18, 36, 16, 0.75)";
      ctx.fillRect(68, 43, 6, 2.5);
      ctx.fillStyle = "#22140a";
      ctx.fillRect(72, 46, 1.8, 1.2);

      // Crimson Feather Whipping Back in Wind
      poly(ctx, [[65, 43], [51, 40], [57, 45]], linGrad(ctx, 65, 43, 51, 40, [[0, "#ea3824"], [1, "#b81c0e"]]), "#500a04", 1);
      ctx.strokeStyle = "#ffd248";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(64, 43); ctx.lineTo(52, 41);
      ctx.stroke();

      // Right Drawing Arm (Back to cheek)
      ctx.strokeStyle = "#326230";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(63, 51); ctx.lineTo(55, 52); ctx.lineTo(65, 47);
      ctx.stroke();
      ellipse(ctx, 65, 47, 2, 2, "#f6d5ae", "#3a2214", 0.8);

      // Left Bow Arm (Thrust forward holding bow)
      ctx.strokeStyle = "#326230";
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(72, 49); ctx.lineTo(80, 48); ctx.lineTo(88, 47);
      ctx.stroke();
      rounded(ctx, 77, 46.5, 6, 3.5, 1, "#583014", "#201006", 0.8);
      ellipse(ctx, 88, 47, 2, 2, "#f6d5ae", "#3a2214", 0.8);

      // Fully Drawn / Snapping Recurve Longbow
      ctx.strokeStyle = "#281204";
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(88, 47);
      ctx.bezierCurveTo(93, 38, 93, 30, 90, 26);
      ctx.moveTo(88, 47);
      ctx.bezierCurveTo(93, 56, 93, 64, 90, 68);
      ctx.stroke();

      ctx.strokeStyle = linGrad(ctx, 88, 26, 94, 68, [[0, "#e2a048"], [0.5, "#b47632"], [1, "#7c4818"]]);
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(88, 47);
      ctx.bezierCurveTo(93, 38, 93, 30, 90, 26);
      ctx.moveTo(88, 47);
      ctx.bezierCurveTo(93, 56, 93, 64, 90, 68);
      ctx.stroke();

      ellipse(ctx, 90, 26, 1.4, 1.4, "#ffe474", "#6e480e", 0.8);
      ellipse(ctx, 90, 68, 1.4, 1.4, "#ffe474", "#6e480e", 0.8);

      // Taut Snapping Bowstring (V-Shape from tips to release point)
      ctx.strokeStyle = "rgba(255, 255, 245, 0.95)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(90, 26);
      ctx.lineTo(66, 47);
      ctx.lineTo(90, 68);
      ctx.stroke();

      // Loosed Bodkin Arrow Projecting Forward-Right
      ctx.strokeStyle = "#fff6cc";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(70, 47.5);
      ctx.lineTo(118, 42);
      ctx.stroke();

      poly(ctx, [[70, 47.5], [64, 45], [67, 47.5], [64, 50]], "#ea3424", "#4a0a04", 0.8);
      poly(ctx, [[118, 42], [124, 41.5], [118, 41], [114, 41.5]], "#ffffff", "#88b2d8", 1);
      ellipse(ctx, 122, 41.5, 1.5, 1.5, "#ffffff");

      // Kinetic Arrow Release Starburst & Spark VFX
      ctx.strokeStyle = "rgba(255, 245, 160, 0.95)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(88, 41); ctx.lineTo(88, 53);
      ctx.moveTo(82, 47); ctx.lineTo(94, 47);
      ctx.moveTo(84, 43); ctx.lineTo(92, 51);
      ctx.moveTo(84, 51); ctx.lineTo(92, 43);
      ctx.stroke();

      ellipse(ctx, 94, 42, 1.2, 1.2, "#ffffff", "#ffd850", 0.8);
      ellipse(ctx, 96, 52, 1.1, 1.1, "#ffffff", "#ffd850", 0.8);
      ellipse(ctx, 82, 42, 1.0, 1.0, "#ffffff", "#ffd850", 0.8);
      ellipse(ctx, 106, 43, 1.4, 0.8, "rgba(255, 248, 200, 0.75)");

      // Structure overlays
      drawThatchRoof128(ctx);
      drawArcherBanner128(ctx, true);
      drawArcherIvy128(ctx);
    };

    const drawArcherL2 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Base Earth Mound
      shadow(ctx, 64, 116, 48, 11, 0.44);
      shadow(ctx, 64, 117, 36, 6, 0.58);

      ellipse(ctx, 64, 110, 46, 14, linGrad(ctx, 24, 96, 104, 122, [[0, "#546a32"], [0.4, "#3c4d22"], [1, "#1c2610"]]), "#141c0a", 2);
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

      ellipse(ctx, 64, 110, 50, 15, linGrad(ctx, 20, 96, 108, 122, [[0, "#5a7238"], [0.4, "#3e5226"], [1, "#1c2810"]]), "#121a08", 2);
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
      shadow(ctx, 64, 116, 48, 11, 0.45);
      shadow(ctx, 64, 117, 36, 6, 0.58);

      // Arcane-tinged earthen mound
      ellipse(ctx, 64, 110, 46, 14, linGrad(ctx, 24, 96, 104, 122, [[0, "#3e3a6a"], [0.4, "#28224c"], [1, "#120e28"]]), "#0c081e", 2);
      ctx.strokeStyle = "rgba(180, 150, 255, 0.4)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(64, 108, 42, 10, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      // Arcane foundation stones embedded in earth
      ellipse(ctx, 28, 114, 4.5, 2.5, "#524874", "#1e1832", 1);
      ellipse(ctx, 40, 118, 5, 3, "#423862", "#1e1832", 1);
      ellipse(ctx, 88, 116, 4.5, 3, "#483e6a", "#1e1832", 1);
      ellipse(ctx, 98, 113, 3.5, 2.2, "#584e7a", "#1e1832", 1);

      // 2. Mystic Obsidian & Violet Slate Stone Plinth (Y=80 to 110)
      rounded(ctx, 32, 80, 64, 30, 4, linGrad(ctx, 32, 80, 96, 110, [[0, "#8272b2"], [0.35, "#584888"], [0.75, "#382864"], [1, "#201440"]]), "#12082a", 2.2);

      // Stone block mortar lines (3 courses)
      ctx.strokeStyle = "#120826";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(34, 90); ctx.lineTo(94, 90);
      ctx.moveTo(34, 100); ctx.lineTo(94, 100);
      ctx.stroke();

      // Stone block top bevel highlights
      ctx.strokeStyle = "rgba(230, 210, 255, 0.35)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(34, 91.5); ctx.lineTo(94, 91.5);
      ctx.moveTo(34, 101.5); ctx.lineTo(94, 101.5);
      ctx.stroke();

      // Vertical mortar joints
      ctx.strokeStyle = "#120826";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(50, 81); ctx.lineTo(50, 90);
      ctx.moveTo(78, 81); ctx.lineTo(78, 90);
      ctx.moveTo(42, 90); ctx.lineTo(42, 100);
      ctx.moveTo(64, 90); ctx.lineTo(64, 100);
      ctx.moveTo(86, 90); ctx.lineTo(86, 100);
      ctx.moveTo(52, 100); ctx.lineTo(52, 109);
      ctx.moveTo(76, 100); ctx.lineTo(76, 109);
      ctx.stroke();

      // Stone texture speckles
      speckles(ctx, 34, 82, 60, 26, 22, "rgba(0,0,0,0.2)", 1.2);
      speckles(ctx, 34, 82, 60, 26, 16, "rgba(220,200,255,0.22)", 1.0);

      // Engraved glowing runes on plinth stones
      ctx.strokeStyle = "rgba(180, 225, 255, 0.75)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      // Left rune glyph
      ctx.moveTo(44, 93); ctx.lineTo(47, 97); ctx.lineTo(44, 98);
      ctx.moveTo(43, 95); ctx.lineTo(48, 95);
      // Center rune glyph
      ctx.moveTo(64, 83); ctx.lineTo(64, 88); ctx.moveTo(61, 85); ctx.lineTo(67, 85);
      ctx.moveTo(62, 83); ctx.lineTo(66, 88);
      // Right rune glyph
      ctx.moveTo(83, 93); ctx.lineTo(85, 95); ctx.lineTo(83, 98);
      ctx.moveTo(86, 93); ctx.lineTo(84, 98);
      ctx.stroke();

      // Gold anchor brackets with amethyst jewels on plinth corners
      rounded(ctx, 31, 91, 5, 13, 1.5, "#d4aa44", "#4a3408", 1);
      rounded(ctx, 92, 91, 5, 13, 1.5, "#d4aa44", "#4a3408", 1);
      ellipse(ctx, 33.5, 97.5, 1.5, 2, "#e090ff", "#2a084a", 0.8);
      ellipse(ctx, 94.5, 97.5, 1.5, 2, "#e090ff", "#2a084a", 0.8);

      // 3. Cantilevered Corbel Supports & Dais Rim (Y=70 to 82)
      poly(ctx, [[38, 90], [44, 92], [32, 78], [26, 78]], linGrad(ctx, 26, 78, 44, 92, [[0, "#7462a4"], [1, "#281850"]]), "#140a30", 1.5);
      poly(ctx, [[90, 90], [84, 92], [96, 78], [102, 78]], linGrad(ctx, 84, 78, 102, 92, [[0, "#665496"], [1, "#201244"]]), "#140a30", 1.5);

      // Main Dais Rim Platform
      rounded(ctx, 24, 72, 80, 10, 3, linGrad(ctx, 24, 72, 104, 82, [[0, "#9e8cd4"], [0.3, "#705ca6"], [0.7, "#463478"], [1, "#281a52"]]), "#160a34", 2);
      ctx.strokeStyle = "rgba(240, 225, 255, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(26, 73.5); ctx.lineTo(102, 73.5);
      ctx.stroke();

      // Gilded runic band along dais rim
      ctx.strokeStyle = "#ffd452";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(28, 77); ctx.lineTo(100, 77);
      ctx.stroke();
      for (const gx of [32, 48, 64, 80, 96]) {
        ellipse(ctx, gx, 77, 1.3, 1.3, "#a6e4ff", "#1c3854", 0.8);
      }

      // 4. Arcane Spire Tower Shaft & Flanking Pylons (Y=38 to 74)
      // Main central tapered spire shaft
      const shaftPoly = [
        [38, 72],
        [44, 40],
        [84, 40],
        [90, 72],
      ];
      poly(ctx, shaftPoly, linGrad(ctx, 38, 40, 90, 72, [[0, "#7a6aa8"], [0.3, "#544682"], [0.7, "#362660"], [1, "#1c103c"]]), "#100624", 2.2);

      // Vertical shaft bevels (hexagonal / octagonal facet planes)
      ctx.strokeStyle = "rgba(220, 205, 255, 0.3)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(52, 41); ctx.lineTo(48, 72);
      ctx.stroke();
      ctx.strokeStyle = "rgba(20, 10, 40, 0.45)";
      ctx.beginPath();
      ctx.moveTo(76, 41); ctx.lineTo(80, 72);
      ctx.stroke();

      // Flanking Crystal-Cradle Buttress Pylons (Left & Right pylon brackets)
      // Left pylon
      poly(ctx, [[28, 72], [36, 72], [42, 44], [34, 38], [28, 48]], linGrad(ctx, 28, 38, 42, 72, [[0, "#8e7ebc"], [0.5, "#58488a"], [1, "#261652"]]), "#12082c", 1.6);
      poly(ctx, [[34, 38], [39, 32], [43, 38], [42, 44]], linGrad(ctx, 34, 32, 43, 44, [[0, "#ffd860"], [1, "#966818"]]), "#3a2406", 1.2);
      ellipse(ctx, 38.5, 34, 2, 2.5, "#6fe4ff", "#123c52", 0.8);

      // Right pylon
      poly(ctx, [[100, 72], [92, 72], [86, 44], [94, 38], [100, 48]], linGrad(ctx, 86, 38, 100, 72, [[0, "#7c6ca8"], [0.5, "#483a78"], [1, "#1e0e44"]]), "#12082c", 1.6);
      poly(ctx, [[94, 38], [89, 32], [85, 38], [86, 44]], linGrad(ctx, 85, 32, 94, 44, [[0, "#ffd860"], [1, "#966818"]]), "#3a2406", 1.2);
      ellipse(ctx, 89.5, 34, 2, 2.5, "#6fe4ff", "#123c52", 0.8);

      // 5. Sanctum Vault / Mystic Archway (Embrasure Y=48 to 68)
      rounded(ctx, 52, 48, 24, 20, 10, "#0e061c", "#16082e", 2);
      // Inner glowing arcane vortex
      ellipse(ctx, 64, 59, 9, 7, radGrad(ctx, 64, 59, 1, 9, [[0, "#ffffff"], [0.4, "#a878ff"], [0.8, "#5028aa"], [1, "rgba(20,6,50,0)"]]));
      // Astral Tracery
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(64, 54, 7, Math.PI, Math.PI * 2);
      ctx.moveTo(64, 54); ctx.lineTo(64, 68);
      ctx.stroke();
      ellipse(ctx, 64, 54, 1.5, 1.5, "#6fe4ff");

      // 6. Gold Runic Conduit Veins running from sanctum up to crystal cradle
      ctx.strokeStyle = "#ffd248";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(56, 48); ctx.lineTo(52, 40); ctx.lineTo(58, 36);
      ctx.moveTo(72, 48); ctx.lineTo(76, 40); ctx.lineTo(70, 36);
      ctx.stroke();

      // Top Crystal Cradle Collar Ring (Y=34 to 42)
      rounded(ctx, 46, 36, 36, 7, 3, linGrad(ctx, 46, 36, 82, 43, [[0, "#ffd868"], [0.5, "#d49a2a"], [1, "#744c0c"]]), "#2a1604", 1.5);
      for (const cx of [50, 57, 64, 71, 78]) {
        ellipse(ctx, cx, 39.5, 1.2, 1.2, "#8ae8ff", "#123c52", 0.8);
      }
    };

    const drawMageCrystal128 = (ctx, isFire = false) => {
      // Levitating secondary crystal shards
      const sideCrystals = [
        [36, 26, 5, 14, "#8ae8ff", "#5028c0"],
        [92, 26, 5, 14, "#b48aff", "#3a1890"],
      ];
      for (const [cx, cy, cw, ch, col0, col1] of sideCrystals) {
        poly(ctx, [[cx, cy - ch / 2], [cx + cw / 2, cy], [cx, cy + ch / 2], [cx - cw / 2, cy]], linGrad(ctx, cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2, [[0, col0], [1, col1]]), "#120830", 1.2);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy - ch / 2); ctx.lineTo(cx, cy + ch / 2);
        ctx.stroke();
      }

      if (!isFire) {
        // Ambient crystal glow aura
        ellipse(ctx, 64, 22, 26, 24, radGrad(ctx, 64, 22, 2, 26, [[0, "rgba(220, 200, 255, 0.45)"], [0.5, "rgba(140, 90, 240, 0.2)"], [1, "rgba(60, 20, 150, 0)"]]));

        // Main Arcane Crystal Multi-Faceted Volume (Apex at Y=6, Base at Y=40, Width from X=46 to 82)
        // 1. Facet: Back / Left side shadow facet
        poly(ctx, [[64, 6], [48, 22], [54, 38], [64, 40]], linGrad(ctx, 48, 6, 64, 40, [[0, "#9872e8"], [0.5, "#582cb4"], [1, "#280e6e"]]), "#16063e", 1.8);

        // 2. Facet: Back / Right side facet
        poly(ctx, [[64, 6], [80, 22], [74, 38], [64, 40]], linGrad(ctx, 64, 6, 80, 40, [[0, "#c0a0ff"], [0.5, "#7a46e0"], [1, "#3c168c"]]), "#16063e", 1.8);

        // 3. Facet: Center Front Left prism facet
        poly(ctx, [[64, 6], [48, 22], [64, 25]], linGrad(ctx, 48, 6, 64, 25, [[0, "#d8c4ff"], [0.45, "#8e5ef0"], [1, "#4e24b4"]]), "#16063e", 1.4);

        // 4. Facet: Center Front Right illuminated facet (Sunlight & power gleam)
        poly(ctx, [[64, 6], [80, 22], [64, 25]], linGrad(ctx, 64, 6, 80, 25, [[0, "#ffffff"], [0.35, "#c8b0ff"], [0.75, "#9062f4"], [1, "#5a2ac8"]]), "#16063e", 1.4);

        // 5. Facet: Lower Center Left facet
        poly(ctx, [[48, 22], [64, 25], [64, 40], [54, 38]], linGrad(ctx, 48, 22, 64, 40, [[0, "#703ec4"], [1, "#2c0e6c"]]), "#16063e", 1.4);

        // 6. Facet: Lower Center Right facet
        poly(ctx, [[80, 22], [64, 25], [64, 40], [74, 38]], linGrad(ctx, 64, 22, 80, 40, [[0, "#9462f4"], [1, "#42168e"]]), "#16063e", 1.4);

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
        // —— FIRE STATE: Overcharged Crystalline Mana Nova ——
        // Massive outer radiant aura
        ellipse(ctx, 64, 22, 38, 36, radGrad(ctx, 64, 22, 3, 38, [[0, "#ffffff"], [0.25, "rgba(225,200,255,0.95)"], [0.55, "rgba(150,90,255,0.55)"], [0.85, "rgba(80,210,255,0.25)"], [1, "rgba(40,10,140,0)"]]));

        // 8-Point Arcane Starburst Ray Flares
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
        ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
        ctx.lineWidth = 3.2;
        for (const [r0, r1] of rays) {
          ctx.beginPath();
          ctx.moveTo(r0[0], r0[1]); ctx.lineTo(r1[0], r1[1]);
          ctx.stroke();
        }
        ctx.strokeStyle = "#8ae8ff";
        ctx.lineWidth = 1.6;
        for (const [r0, r1] of rays) {
          ctx.beginPath();
          ctx.moveTo(r0[0], r0[1]); ctx.lineTo(r1[0], r1[1]);
          ctx.stroke();
        }

        // Blazing Crystal Body in supercharged state
        poly(ctx, [[64, 4], [46, 22], [54, 38], [64, 41], [74, 38], [82, 22]], linGrad(ctx, 46, 4, 82, 41, [[0, "#ffffff"], [0.3, "#e2d2ff"], [0.7, "#a878ff"], [1, "#5424c8"]]), "#2a0a64", 2.2);

        // Blinding Incandescent Core
        ellipse(ctx, 64, 22, 16, 16, radGrad(ctx, 62, 18, 2, 16, [[0, "#ffffff"], [0.5, "#e6dcff"], [1, "#9c6eff"]]), "#ffffff", 2.5);
        ellipse(ctx, 64, 22, 8, 8, "#ffffff");

        // Lightning Fractures crackling down crystal
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(64, 6); ctx.lineTo(60, 16); ctx.lineTo(67, 24); ctx.lineTo(62, 33); ctx.lineTo(64, 40);
        ctx.moveTo(60, 16); ctx.lineTo(50, 22);
        ctx.moveTo(67, 24); ctx.lineTo(78, 22);
        ctx.stroke();

        // Hyper-Charged Glowing Rune Rings
        ctx.strokeStyle = "rgba(140, 235, 255, 0.95)";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.ellipse(64, 20, 24, 8, -0.08, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(235, 185, 255, 0.95)";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.ellipse(64, 32, 28, 9, 0.05, 0, Math.PI * 2);
        ctx.stroke();

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
      rounded(ctx, 84, 52, 28, 3, 1, "#ffd452", "#523808", 0.8);
      ellipse(ctx, 112, 53.5, 2, 2, "#ffd452", "#523808", 0.8);

      if (!isFire) {
        const p = [
          [86, 54],
          [108, 54],
          [104, 76],
          [96, 70],
          [88, 78],
        ];
        poly(ctx, p, linGrad(ctx, 86, 54, 108, 78, [[0, "#845ed8"], [0.45, "#5a34b0"], [1, "#2e126c"]]), "#120436", 1.2);
        ctx.strokeStyle = "#ffd452";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(88, 55); ctx.lineTo(89, 75); ctx.lineTo(96, 69); ctx.lineTo(103, 73); ctx.lineTo(106, 55);
        ctx.stroke();
        // Golden eye / runic sigil on banner
        ellipse(ctx, 96, 62, 3, 2, "#ffe074", "#4a2c06", 0.8);
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
        poly(ctx, p, linGrad(ctx, 86, 48, 120, 74, [[0, "#a074ff"], [0.45, "#7040d8"], [1, "#3c168c"]]), "#120436", 1.2);
        ctx.strokeStyle = "#ffe468";
        ctx.lineWidth = 1.2;
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
    };

    const drawMageL2 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Arcane Earthen Mound
      shadow(ctx, 64, 116, 48, 11, 0.45);
      shadow(ctx, 64, 117, 36, 6, 0.58);

      ellipse(ctx, 64, 110, 46, 14, linGrad(ctx, 24, 96, 104, 122, [[0, "#3e3a6a"], [0.4, "#28224c"], [1, "#120e28"]]), "#0c081e", 2);
      ctx.strokeStyle = "rgba(180, 150, 255, 0.4)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(64, 108, 42, 10, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      ellipse(ctx, 28, 114, 4.5, 2.5, "#524874", "#1e1832", 1);
      ellipse(ctx, 40, 118, 5, 3, "#423862", "#1e1832", 1);
      ellipse(ctx, 88, 116, 4.5, 3, "#483e6a", "#1e1832", 1);
      ellipse(ctx, 98, 113, 3.5, 2.2, "#584e7a", "#1e1832", 1);

      // 2. Mystic Obsidian & Violet Slate Plinth (Y=78 to 110)
      rounded(ctx, 30, 78, 68, 32, 4, linGrad(ctx, 30, 78, 98, 110, [[0, "#8272b2"], [0.35, "#584888"], [0.75, "#382864"], [1, "#201440"]]), "#12082a", 2.2);

      ctx.strokeStyle = "#120826";
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
      rounded(ctx, 29, 89, 5, 15, 1.5, "#d4aa44", "#4a3408", 1);
      rounded(ctx, 94, 89, 5, 15, 1.5, "#d4aa44", "#4a3408", 1);
      ellipse(ctx, 31.5, 96.5, 1.8, 2.2, "#e090ff", "#2a084a", 0.8);
      ellipse(ctx, 96.5, 96.5, 1.8, 2.2, "#e090ff", "#2a084a", 0.8);

      // 3. Cantilevered Corbel Supports & Dais Rim (Y=68 to 80)
      poly(ctx, [[36, 88], [42, 90], [30, 76], [24, 76]], linGrad(ctx, 24, 76, 42, 90, [[0, "#7462a4"], [1, "#281850"]]), "#140a30", 1.5);
      poly(ctx, [[92, 88], [86, 90], [98, 76], [104, 76]], linGrad(ctx, 86, 76, 104, 88, [[0, "#665496"], [1, "#201244"]]), "#140a30", 1.5);

      rounded(ctx, 22, 70, 84, 10, 3, linGrad(ctx, 22, 70, 106, 80, [[0, "#9e8cd4"], [0.3, "#705ca6"], [0.7, "#463478"], [1, "#281a52"]]), "#160a34", 2);
      ctx.strokeStyle = "#ffd452";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(26, 75); ctx.lineTo(102, 75);
      ctx.stroke();
      for (const gx of [30, 44, 58, 70, 84, 98]) {
        ellipse(ctx, gx, 75, 1.3, 1.3, "#a6e4ff", "#1c3854", 0.8);
      }

      // 4. Spire Tower Shaft & Quadruple Focus Pylons (Y=36 to 72)
      const shaftPoly = [
        [36, 70],
        [44, 38],
        [84, 38],
        [92, 70],
      ];
      poly(ctx, shaftPoly, linGrad(ctx, 36, 38, 92, 70, [[0, "#7a6aa8"], [0.3, "#544682"], [0.7, "#362660"], [1, "#1c103c"]]), "#100624", 2.2);

      // Pylons (Dual-tiered brackets on left and right)
      // Left outer pylon
      poly(ctx, [[24, 70], [32, 70], [38, 44], [30, 36], [24, 46]], linGrad(ctx, 24, 36, 38, 70, [[0, "#8e7ebc"], [1, "#261652"]]), "#12082c", 1.4);
      poly(ctx, [[30, 36], [35, 30], [39, 36], [38, 42]], linGrad(ctx, 30, 30, 39, 42, [[0, "#ffd860"], [1, "#966818"]]), "#3a2406", 1.0);
      ellipse(ctx, 34.5, 32, 2, 2.5, "#6fe4ff", "#123c52", 0.8);

      // Left inner pylon
      poly(ctx, [[34, 70], [42, 70], [46, 48], [40, 42]], linGrad(ctx, 34, 42, 46, 70, [[0, "#7c6ca8"], [1, "#201244"]]), "#12082c", 1.2);

      // Right outer pylon
      poly(ctx, [[104, 70], [96, 70], [90, 44], [98, 36], [104, 46]], linGrad(ctx, 90, 36, 104, 70, [[0, "#7c6ca8"], [1, "#1e0e44"]]), "#12082c", 1.4);
      poly(ctx, [[98, 36], [93, 30], [89, 36], [90, 42]], linGrad(ctx, 89, 30, 98, 42, [[0, "#ffd860"], [1, "#966818"]]), "#3a2406", 1.0);
      ellipse(ctx, 93.5, 32, 2, 2.5, "#6fe4ff", "#123c52", 0.8);

      // Right inner pylon
      poly(ctx, [[94, 70], [86, 70], [82, 48], [88, 42]], linGrad(ctx, 82, 42, 94, 70, [[0, "#6e5e98"], [1, "#1a0c3c"]]), "#12082c", 1.2);

      // 5. Sanctum Vault & Astral Galaxy Vortex (Y=46 to 66)
      rounded(ctx, 50, 46, 28, 22, 11, "#0e061c", "#16082e", 2);
      ellipse(ctx, 64, 57, 10, 8, radGrad(ctx, 64, 57, 1, 10, [[0, "#ffffff"], [0.35, "#a878ff"], [0.75, "#5028aa"], [1, "rgba(20,6,50,0)"]]));
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(64, 52, 8, Math.PI, Math.PI * 2);
      ctx.moveTo(64, 52); ctx.lineTo(64, 66);
      ctx.stroke();
      ellipse(ctx, 64, 52, 1.8, 1.8, "#6fe4ff");

      // Top Crystal Cradle Collar Ring (Y=32 to 40)
      rounded(ctx, 44, 34, 40, 7, 3, linGrad(ctx, 44, 34, 84, 41, [[0, "#ffd868"], [0.5, "#d49a2a"], [1, "#744c0c"]]), "#2a1604", 1.5);
      for (const cx of [48, 56, 64, 72, 80]) {
        ellipse(ctx, cx, 37.5, 1.3, 1.3, "#8ae8ff", "#123c52", 0.8);
      }

      // 6. Floating Dual-Tier Arcane Crystals & Satellite Shards
      // Orbiting Crystal Shards
      for (const [cx, cy, cw, ch, col0, col1] of [
        [32, 22, 5, 14, "#8ae8ff", "#5028c0"],
        [96, 22, 5, 14, "#b48aff", "#3a1890"],
        [44, 10, 4, 10, "#d8c4ff", "#4e24b4"],
        [84, 10, 4, 10, "#8ae8ff", "#3a1890"],
      ]) {
        poly(ctx, [[cx, cy - ch / 2], [cx + cw / 2, cy], [cx, cy + ch / 2], [cx - cw / 2, cy]], linGrad(ctx, cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2, [[0, col0], [1, col1]]), "#120830", 1.0);
      }

      // Ambient crystal glow aura
      ellipse(ctx, 64, 20, 28, 26, radGrad(ctx, 64, 20, 2, 28, [[0, "rgba(230, 210, 255, 0.5)"], [0.5, "rgba(140, 90, 240, 0.22)"], [1, "rgba(60, 20, 150, 0)"]]));

      // Primary Faceted Violet Crystal (Y=14 to 38)
      poly(ctx, [[64, 14], [48, 25], [54, 38], [64, 40], [74, 38], [80, 25]], linGrad(ctx, 48, 14, 80, 40, [[0, "#ffffff"], [0.35, "#c8b0ff"], [0.7, "#8e5ef0"], [1, "#3c168c"]]), "#16063e", 1.6);
      poly(ctx, [[64, 14], [80, 25], [64, 27]], linGrad(ctx, 64, 14, 80, 27, [[0, "#ffffff"], [0.4, "#d8c4ff"], [1, "#9062f4"]]), "#16063e", 1.2);

      // Internal Mana Core
      ellipse(ctx, 64, 26, 6, 6, radGrad(ctx, 62, 24, 1, 6, [[0, "#ffffff"], [0.5, "#d6beff"], [1, "rgba(140,80,240,0.3)"]]), "#ffffff", 1.0);

      // Elevated Floating Diamond Focus Crystal (Y=2 to 14)
      poly(ctx, [[64, 2], [70, 8], [64, 14], [58, 8]], linGrad(ctx, 58, 2, 70, 14, [[0, "#ffffff"], [0.4, "#a8e8ff"], [1, "#5028c0"]]), "#120830", 1.2);
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
      rounded(ctx, 86, 52, 26, 3, 1, "#ffd452", "#523808", 0.8);
      poly(ctx, [[88, 54], [108, 54], [104, 76], [96, 70], [88, 78]], linGrad(ctx, 88, 54, 108, 78, [[0, "#845ed8"], [0.45, "#5a34b0"], [1, "#2e126c"]]), "#120436", 1.2);
      ctx.strokeStyle = "#ffd452";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(90, 55); ctx.lineTo(91, 75); ctx.lineTo(96, 69); ctx.lineTo(103, 73); ctx.lineTo(106, 55);
      ctx.stroke();

      // Left Banner
      rounded(ctx, 16, 52, 26, 3, 1, "#ffd452", "#523808", 0.8);
      poly(ctx, [[40, 54], [20, 54], [24, 76], [32, 70], [40, 78]], linGrad(ctx, 20, 54, 40, 78, [[0, "#845ed8"], [0.45, "#5a34b0"], [1, "#2e126c"]]), "#120436", 1.2);
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

      ellipse(ctx, 64, 110, 50, 15, linGrad(ctx, 20, 96, 108, 122, [[0, "#483e78"], [0.4, "#2e2456"], [1, "#140e30"]]), "#0a0620", 2);
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
        poly(ctx, [[mx, my - mh / 2], [mx + mw / 2, my], [mx, my + mh / 2], [mx - mw / 2, my]], linGrad(ctx, mx - mw / 2, my - mh / 2, mx + mw / 2, my + mh / 2, [[0, "#7a6ca8"], [1, mcol]]), "#12082c", 1.2);
        ctx.strokeStyle = "rgba(160, 230, 255, 0.7)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(mx, my - mh / 2 + 1); ctx.lineTo(mx, my + mh / 2 - 1);
        ctx.stroke();
      }

      // 2. Monumental Stepped Obsidian Plinth & Leyline Fissures (Y=72 to 112)
      rounded(ctx, 26, 72, 76, 38, 4, linGrad(ctx, 26, 72, 102, 110, [[0, "#9280c8"], [0.35, "#66529e"], [0.75, "#423074"], [1, "#24164a"]]), "#12062e", 2.4);

      // Plinth course mortar
      ctx.strokeStyle = "#120628";
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
        rounded(ctx, bx, by, 6, 18, 2, "#ffd452", "#503808", 1.2);
        ellipse(ctx, bx + 3, by + 9, 2.2, 3, "#50b8ff", "#082848", 1);
      }

      // 3. Spire Architecture & Soaring Winged Pylons (Y=20 to 74)
      rounded(ctx, 16, 66, 96, 10, 3, linGrad(ctx, 16, 66, 112, 76, [[0, "#b09ee6"], [0.3, "#826eb8"], [0.7, "#52408a"], [1, "#302064"]]), "#160a3c", 2);
      ctx.strokeStyle = "#ffd452";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(18, 71); ctx.lineTo(110, 71);
      ctx.stroke();
      for (const gx of [24, 40, 56, 72, 88, 104]) {
        ellipse(ctx, gx, 71, 1.4, 1.4, "#a6f0ff", "#1c3854", 0.8);
      }

      // Sweeping Celestial Left Pylon Wing (Soaring from 14,70 to 28,20)
      const leftWingPoly = [
        [18, 68],
        [32, 68],
        [38, 32],
        [28, 18],
        [22, 34],
      ];
      poly(ctx, leftWingPoly, linGrad(ctx, 18, 18, 38, 68, [[0, "#a894e4"], [0.45, "#6e58aa"], [1, "#301e68"]]), "#120634", 1.8);
      poly(ctx, [[28, 18], [34, 12], [38, 20], [38, 32]], linGrad(ctx, 28, 12, 38, 32, [[0, "#fff090"], [1, "#b88020"]]), "#3a2404", 1.2);
      ellipse(ctx, 33, 16, 2.5, 3.2, "#8ae8ff", "#0c3044", 1);

      // Sweeping Celestial Right Pylon Wing (Soaring from 96,68 to 110,20)
      const rightWingPoly = [
        [110, 68],
        [96, 68],
        [90, 32],
        [100, 18],
        [106, 34],
      ];
      poly(ctx, rightWingPoly, linGrad(ctx, 90, 18, 110, 68, [[0, "#a894e4"], [0.45, "#6e58aa"], [1, "#301e68"]]), "#120634", 1.8);
      poly(ctx, [[100, 18], [94, 12], [90, 20], [90, 32]], linGrad(ctx, 90, 12, 100, 32, [[0, "#fff090"], [1, "#b88020"]]), "#3a2404", 1.2);
      ellipse(ctx, 95, 16, 2.5, 3.2, "#8ae8ff", "#0c3044", 1);

      // Center Spire Shaft
      poly(ctx, [[34, 68], [42, 32], [86, 32], [94, 68]], linGrad(ctx, 34, 32, 94, 68, [[0, "#8a78bc"], [0.35, "#5c4a92"], [1, "#241450"]]), "#100628", 2.2);

      // 4. Grand Star Sanctum (Y=38 to 62)
      rounded(ctx, 48, 38, 32, 24, 12, "#0a0418", "#14062a", 2);
      // Radiant Star Core Nexus
      ellipse(ctx, 64, 50, 12, 10, radGrad(ctx, 64, 50, 1, 12, [[0, "#ffffff"], [0.3, "#e0b8ff"], [0.65, "#8a48ff"], [1, "rgba(20,4,60,0)"]]));
      ellipse(ctx, 64, 50, 4, 4, "#ffffff");

      // Triple-Tiered Crystal Collar Dais (Y=24 to 34)
      rounded(ctx, 40, 26, 48, 8, 3, linGrad(ctx, 40, 26, 88, 34, [[0, "#ffe278"], [0.5, "#d49a2a"], [1, "#744c0c"]]), "#2a1604", 1.5);
      for (const cx of [44, 52, 60, 68, 76, 84]) {
        ellipse(ctx, cx, 30, 1.4, 1.4, "#a6f0ff", "#123c52", 0.8);
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
      poly(ctx, [[64, 0], [46, 16], [54, 32], [64, 34], [74, 32], [82, 16]], linGrad(ctx, 46, 0, 82, 34, [[0, "#ffffff"], [0.3, "#e6d6ff"], [0.6, "#a874ff"], [1, "#4e1ebc"]]), "#1c0648", 1.8);
      poly(ctx, [[64, 0], [82, 16], [64, 19]], linGrad(ctx, 64, 0, 82, 19, [[0, "#ffffff"], [0.4, "#d8c4ff"], [1, "#9460f4"]]), "#1c0648", 1.2);
      poly(ctx, [[64, 0], [46, 16], [64, 19]], linGrad(ctx, 46, 0, 64, 19, [[0, "#ffffff"], [0.4, "#b890ff"], [1, "#6a34d4"]]), "#1c0648", 1.2);

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
        poly(ctx, [[cx, cy - 4], [cx + 3, cy], [cx, cy + 4], [cx - 3, cy]], linGrad(ctx, cx - 3, cy - 4, cx + 3, cy + 4, [[0, "#ffffff"], [0.35, col0], [1, col1]]), "#120428", 0.9);
        ellipse(ctx, cx, cy, 1.0, 1.0, "#ffffff");
      }

      // 7. Twin Grand Celestial War Standards (Flowing from Soaring Pylons)
      // Left Grand Standard
      rounded(ctx, 10, 48, 22, 3, 1, "#ffd452", "#523808", 0.8);
      poly(ctx, [[32, 50], [12, 50], [16, 82], [24, 75], [32, 84]], linGrad(ctx, 12, 50, 32, 84, [[0, "#8a60e0"], [0.45, "#5c34b8"], [1, "#2c0e70"]]), "#100438", 1.4);
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(30, 51); ctx.lineTo(29, 81); ctx.lineTo(24, 74); ctx.lineTo(17, 79); ctx.lineTo(14, 51);
      ctx.stroke();
      ellipse(ctx, 22, 63, 3.5, 2.5, "#ffe268", "#4a2c06", 0.8);

      // Right Grand Standard
      rounded(ctx, 96, 48, 22, 3, 1, "#ffd452", "#523808", 0.8);
      poly(ctx, [[96, 50], [116, 50], [112, 82], [104, 75], [96, 84]], linGrad(ctx, 96, 50, 116, 84, [[0, "#8a60e0"], [0.45, "#5c34b8"], [1, "#2c0e70"]]), "#100438", 1.4);
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(98, 51); ctx.lineTo(99, 81); ctx.lineTo(104, 74); ctx.lineTo(111, 79); ctx.lineTo(114, 51);
      ctx.stroke();
      ellipse(ctx, 106, 63, 3.5, 2.5, "#ffe268", "#4a2c06", 0.8);

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
      shadow(ctx, 64, 116, 50, 12, 0.45);
      shadow(ctx, 64, 117, 38, 7, 0.6);

      // Scorched quarry earth mound
      ellipse(ctx, 64, 110, 48, 14, linGrad(ctx, 24, 96, 104, 122, [[0, "#5e4c34"], [0.4, "#3e301e"], [1, "#1c140a"]]), "#120c04", 2);
      ctx.strokeStyle = "rgba(180, 140, 75, 0.35)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(64, 108, 44, 10, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      // Heavy granite foundation boulders
      ellipse(ctx, 26, 114, 5, 3, "#645648", "#241c14", 1);
      ellipse(ctx, 38, 118, 5.5, 3.2, "#524638", "#241c14", 1);
      ellipse(ctx, 90, 116, 5, 3.2, "#584a3c", "#241c14", 1);
      ellipse(ctx, 100, 113, 4, 2.5, "#685848", "#241c14", 1);

      // 2. Heavy Dressed Quarry Stone Plinth (Foundation Y=80 to 110)
      rounded(ctx, 30, 80, 68, 30, 4, linGrad(ctx, 30, 80, 98, 110, [[0, "#b89064"], [0.35, "#886240"], [0.75, "#583a22"], [1, "#321e10"]]), "#1a0e06", 2.2);

      // Stone block mortar lines (3 courses)
      ctx.strokeStyle = "#1a0e06";
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
      ctx.strokeStyle = "#1a0e06";
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
      rounded(ctx, 29, 90, 6, 14, 1.5, "#34302c", "#100c0a", 1);
      rounded(ctx, 93, 90, 6, 14, 1.5, "#34302c", "#100c0a", 1);
      ellipse(ctx, 32, 94, 1.2, 1.2, "#ffd452");
      ellipse(ctx, 32, 100, 1.2, 1.2, "#ffd452");
      ellipse(ctx, 96, 94, 1.2, 1.2, "#ffd452");
      ellipse(ctx, 96, 100, 1.2, 1.2, "#ffd452");

      // 3. Cantilevered Timber Corbel Struts
      poly(ctx, [[38, 92], [45, 94], [32, 80], [24, 80]], linGrad(ctx, 24, 80, 45, 94, [[0, "#a46c34"], [1, "#44240c"]]), "#1a0c04", 1.5);
      poly(ctx, [[90, 92], [83, 94], [96, 80], [104, 80]], linGrad(ctx, 83, 80, 104, 92, [[0, "#8c5624"], [1, "#361a06"]]), "#1a0c04", 1.5);
      poly(ctx, [[58, 90], [70, 90], [72, 80], [56, 80]], linGrad(ctx, 56, 80, 72, 90, [[0, "#9c642e"], [1, "#3e1e0a"]]), "#1a0c04", 1.5);

      // 4. Heavy Reinforced Timber Firing Platform (Y=68 to 82)
      rounded(ctx, 18, 68, 92, 14, 3, linGrad(ctx, 18, 68, 110, 82, [[0, "#c48846"], [0.25, "#96602c"], [0.75, "#623812"], [1, "#3a1e08"]]), "#1e0c02", 2);

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
        ellipse(ctx, sx, 75, 1.4, 1.4, "#2a2622", "#0c0806", 1);
        ellipse(ctx, sx - 0.3, 74.7, 0.5, 0.5, "#ffd452");
      }

      // 5. Heavy Cast-Iron Turntable Carriage Base (Y=62 to 70)
      ellipse(ctx, 64, 66, 26, 7, linGrad(ctx, 38, 59, 90, 73, [[0, "#4e4844"], [0.5, "#2e2a26"], [1, "#161412"]]), "#0c0a08", 1.8);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(64, 65, 23, 5.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      for (const tx of [44, 54, 64, 74, 84]) {
        ellipse(ctx, tx, 66, 1.2, 1.2, "#d4aa44", "#4a3408", 0.8);
      }
    };

    const drawArtilleryProps128 = (ctx) => {
      // 1. Munitions on Platform
      // Black Powder Kegs on Left Platform (X=22, Y=52..67)
      rounded(ctx, 22, 52, 12, 15, 3, linGrad(ctx, 22, 52, 34, 67, [[0, "#8a502c"], [0.5, "#5a3014"], [1, "#2e1406"]]), "#160802", 1.4);
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
      rounded(ctx, 32, 48, 10, 13, 2.5, linGrad(ctx, 32, 48, 42, 61, [[0, "#7c4424"], [1, "#261004"]]), "#160802", 1.2);
      ctx.strokeStyle = "#383430";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(32, 51); ctx.lineTo(42, 51);
      ctx.moveTo(32, 58); ctx.lineTo(42, 58);
      ctx.stroke();

      // Pyramid Stack of Heavy Cast-Iron Cannonballs on Right Platform (X=86 to 102, Y=56 to 68)
      // Bottom row: 2 cannonballs
      ellipse(ctx, 88, 64, 4.5, 4.5, linGrad(ctx, 85, 60, 92, 68, [[0, "#56504a"], [0.4, "#2c2824"], [1, "#100e0c"]]), "#0c0a08", 1.2);
      ellipse(ctx, 86.5, 62.5, 1.2, 1.2, "#ffffff");
      ellipse(ctx, 97, 64, 4.5, 4.5, linGrad(ctx, 94, 60, 101, 68, [[0, "#56504a"], [0.4, "#2c2824"], [1, "#100e0c"]]), "#0c0a08", 1.2);
      ellipse(ctx, 95.5, 62.5, 1.2, 1.2, "#ffffff");
      // Top cannonball
      ellipse(ctx, 92.5, 57, 4.5, 4.5, linGrad(ctx, 89.5, 53, 96.5, 61, [[0, "#625a54"], [0.4, "#34302c"], [1, "#12100e"]]), "#0c0a08", 1.2);
      ellipse(ctx, 91, 55.5, 1.3, 1.3, "#ffffff");

      // 2. Left Timber Shelter Canopy (Over powder kegs, Y=16 to 50)
      // Timber support post
      rounded(ctx, 20, 28, 5, 40, 1.5, linGrad(ctx, 20, 28, 25, 68, [[0, "#9c6834"], [1, "#44240a"]]), "#1a0c02", 1.4);
      // Diagonal support brace
      poly(ctx, [[24, 38], [34, 28], [31, 28], [24, 44]], "#74461c", "#1a0c02", 1);

      // Awning Roof Tiles (Terracotta & Cedar shingles)
      const awningPoly = [
        [12, 34],
        [36, 16],
        [60, 32],
        [54, 37],
        [36, 23],
        [16, 39],
      ];
      poly(ctx, awningPoly, linGrad(ctx, 36, 16, 36, 39, [[0, "#e88c3a"], [0.4, "#b45a1c"], [1, "#54240a"]]), "#200a02", 2.0);

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
        poly(ctx, [[46, 64], [58, 64], [56, 46], [48, 46]], linGrad(ctx, 46, 46, 58, 64, [[0, "#56504a"], [1, "#1c1814"]]), "#0e0c0a", 1.6);
        poly(ctx, [[70, 64], [82, 64], [80, 46], [72, 46]], linGrad(ctx, 70, 46, 82, 64, [[0, "#48423c"], [1, "#141210"]]), "#0e0c0a", 1.6);

        // Heavy Cast-Iron Mortar Barrel (Angled from breech at 44,52 to muzzle at 76,28)
        const barrelPoly = [
          [38, 48],
          [48, 36],
          [74, 22],
          [84, 34],
          [58, 58],
          [44, 58],
        ];
        poly(ctx, barrelPoly, linGrad(ctx, 38, 22, 84, 58, [[0, "#6e665e"], [0.25, "#4e4842"], [0.65, "#2a2622"], [1, "#12100e"]]), "#0a0806", 2.4);

        // Spherical Breech Cascabell
        ellipse(ctx, 43, 53, 9, 8, linGrad(ctx, 36, 46, 50, 60, [[0, "#6e665e"], [0.5, "#3c3630"], [1, "#12100e"]]), "#0a0806", 1.8);
        ellipse(ctx, 36, 55, 3, 3, "#342e28", "#0a0806", 1.2);

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
        ellipse(ctx, 60, 48, 3.5, 3.5, "#d4a438", "#442e08", 1.2);
        ellipse(ctx, 59, 47, 1.2, 1.2, "#fff0a0");

        // Flared Muzzle Ring & Dark Bore
        ellipse(ctx, 79, 28, 8, 10, linGrad(ctx, 72, 18, 86, 38, [[0, "#f8d06c"], [0.5, "#b88428"], [1, "#54340a"]]), "#1a1004", 2);
        // Inner Dark Rifled Bore Opening
        ellipse(ctx, 79, 28, 5.5, 7.5, linGrad(ctx, 74, 21, 84, 35, [[0, "#080604"], [1, "#1c140e"]]), "#000000", 1.5);
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

        // Recoiled Kicked-Back Barrel (Pitched up steeply, breech rammed down-left)
        const barrelPoly = [
          [28, 54],
          [40, 36],
          [62, 18],
          [74, 28],
          [52, 60],
          [36, 62],
        ];
        poly(ctx, barrelPoly, linGrad(ctx, 28, 18, 74, 62, [[0, "#7a7066"], [0.25, "#524a42"], [0.65, "#2e2822"], [1, "#14100c"]]), "#0a0806", 2.4);

        // Breech cascabell kicked down
        ellipse(ctx, 32, 58, 9, 8, linGrad(ctx, 25, 51, 39, 65, [[0, "#7a7066"], [0.5, "#403830"], [1, "#14100c"]]), "#0a0806", 1.8);

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
        ellipse(ctx, 68, 23, 9, 11, linGrad(ctx, 60, 12, 76, 34, [[0, "#fff0a0"], [0.4, "#ff8c20"], [1, "#941800"]]), "#400600", 2.2);
        ellipse(ctx, 68, 23, 5, 7, "#ff3800");

        // MASSIVE VOLUMETRIC MUZZLE FIREBALL (Expanding forward and up)
        // Layer 1: Outer Roaring Crimson / Orange Flame Lobes
        const flamePoly = [
          [68, 23],
          [82, 8],
          [98, 2],
          [116, 8],
          [126, 20],
          [122, 34],
          [106, 44],
          [88, 40],
          [76, 32],
        ];
        poly(ctx, flamePoly, linGrad(ctx, 68, 23, 126, 20, [[0, "#ffffff"], [0.2, "#ffe850"], [0.55, "#ff5500"], [0.85, "#cc1200"], [1, "#640400"]]), "#3a0200", 2);

        // Layer 2: Inner Incandescent Golden Core
        const corePoly = [
          [68, 23],
          [84, 13],
          [102, 10],
          [112, 20],
          [104, 30],
          [82, 28],
        ];
        poly(ctx, corePoly, linGrad(ctx, 68, 23, 112, 20, [[0, "#ffffff"], [0.45, "#fff280"], [1, "#ff8810"]]));

        // Layer 3: Blinding White Ignition Heart
        ellipse(ctx, 74, 22, 7, 7, "#ffffff");

        // Flying Burning Shrapnel Sparks & Embers
        for (const [bx, by, br] of [
          [120, 6, 2.4], [126, 14, 2.2], [124, 38, 2.0], [110, 48, 1.8],
          [96, 48, 1.6], [104, -2, 2.0], [114, 28, 2.2], [88, 2, 1.8]
        ]) {
          ellipse(ctx, bx, by, br, br, "#ffffff", "#ff8800", 1);
        }

        // Billowing Heavy Volumetric Gunpowder Smoke Clouds Curling Over Canopy
        ellipse(ctx, 84, 8, 12, 10, "rgba(70,62,54,0.85)", "#1a1612", 1.2);
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

      ellipse(ctx, 64, 110, 48, 14, linGrad(ctx, 24, 96, 104, 122, [[0, "#5e4c34"], [0.4, "#3e301e"], [1, "#1c140a"]]), "#120c04", 2);
      ctx.strokeStyle = "rgba(180, 140, 75, 0.35)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(64, 108, 44, 10, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      // 2. Heavy Dressed Quarry Stone Plinth with Riveted Iron Plates (Y=78 to 110)
      rounded(ctx, 28, 78, 72, 32, 4, linGrad(ctx, 28, 78, 100, 110, [[0, "#b89064"], [0.35, "#886240"], [0.75, "#583a22"], [1, "#321e10"]]), "#1a0e06", 2.2);

      ctx.strokeStyle = "#1a0e06";
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
      rounded(ctx, 27, 86, 7, 18, 1.5, "#34302c", "#100c0a", 1);
      rounded(ctx, 94, 86, 7, 18, 1.5, "#34302c", "#100c0a", 1);
      for (const by of [90, 96, 101]) {
        ellipse(ctx, 30.5, by, 1.2, 1.2, "#ffd452");
        ellipse(ctx, 97.5, by, 1.2, 1.2, "#ffd452");
      }

      // 3. Cantilevered Timber Corbel Struts
      poly(ctx, [[36, 90], [43, 92], [30, 78], [22, 78]], linGrad(ctx, 22, 78, 43, 92, [[0, "#a46c34"], [1, "#44240c"]]), "#1a0c04", 1.5);
      poly(ctx, [[92, 90], [85, 92], [98, 78], [106, 78]], linGrad(ctx, 85, 78, 106, 90, [[0, "#8c5624"], [1, "#361a06"]]), "#1a0c04", 1.5);
      poly(ctx, [[56, 88], [72, 88], [74, 78], [54, 78]], linGrad(ctx, 54, 78, 74, 88, [[0, "#9c642e"], [1, "#3e1e0a"]]), "#1a0c04", 1.5);

      // 4. Expanded Reinforced Timber Firing Platform (Y=66 to 80)
      rounded(ctx, 14, 66, 100, 14, 3, linGrad(ctx, 14, 66, 114, 80, [[0, "#c48846"], [0.25, "#96602c"], [0.75, "#623812"], [1, "#3a1e08"]]), "#1e0c02", 2);
      ctx.strokeStyle = "rgba(255, 235, 175, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(16, 67.5); ctx.lineTo(112, 67.5);
      ctx.stroke();

      for (const sx of [20, 36, 52, 68, 84, 100]) {
        ellipse(ctx, sx, 73, 1.4, 1.4, "#2a2622", "#0c0806", 1);
        ellipse(ctx, sx - 0.3, 72.7, 0.5, 0.5, "#ffd452");
      }

      // Cast-Iron Turntable Carriage Base (Y=60 to 68)
      ellipse(ctx, 64, 64, 28, 7, linGrad(ctx, 36, 57, 92, 71, [[0, "#4e4844"], [0.5, "#2e2a26"], [1, "#161412"]]), "#0c0a08", 1.8);
      for (const tx of [42, 53, 64, 75, 86]) {
        ellipse(ctx, tx, 64, 1.2, 1.2, "#d4aa44", "#4a3408", 0.8);
      }

      // 5. Left Dual Munitions Canopy & Stacked Barrels (X=12 to 50, Y=16 to 66)
      // Heavy timber posts
      rounded(ctx, 16, 26, 5, 42, 1.5, linGrad(ctx, 16, 26, 21, 68, [[0, "#9c6834"], [1, "#44240a"]]), "#1a0c02", 1.4);
      rounded(ctx, 42, 28, 4, 38, 1.5, linGrad(ctx, 42, 28, 46, 66, [[0, "#8a5426"], [1, "#3c1e08"]]), "#1a0c02", 1.2);

      // Multi-tier Shingle Roof Canopy
      const canopyL2 = [
        [10, 32],
        [32, 14],
        [54, 30],
        [48, 35],
        [32, 21],
        [14, 37],
      ];
      poly(ctx, canopyL2, linGrad(ctx, 32, 14, 32, 37, [[0, "#e88c3a"], [0.4, "#b45a1c"], [1, "#54240a"]]), "#200a02", 2.0);
      ctx.strokeStyle = "rgba(255, 230, 180, 0.5)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(12, 32); ctx.lineTo(32, 15); ctx.lineTo(52, 30);
      ctx.stroke();

      // Stack of 3 Powder Barrels (2 on bottom, 1 on top)
      rounded(ctx, 18, 50, 11, 14, 2.5, linGrad(ctx, 18, 50, 29, 64, [[0, "#8a502c"], [1, "#2e1406"]]), "#160802", 1.2);
      rounded(ctx, 28, 50, 11, 14, 2.5, linGrad(ctx, 28, 50, 39, 64, [[0, "#7c4424"], [1, "#261004"]]), "#160802", 1.2);
      rounded(ctx, 23, 38, 11, 13, 2.5, linGrad(ctx, 23, 38, 34, 51, [[0, "#965830"], [1, "#321606"]]), "#160802", 1.2);

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
      rounded(ctx, 102, 28, 4, 38, 1.5, linGrad(ctx, 102, 28, 106, 66, [[0, "#9c6834"], [1, "#44240a"]]), "#1a0c02", 1.2);
      poly(ctx, [[90, 28], [106, 28], [106, 32], [90, 32]], "#8a5426", "#1a0c02", 1.0);
      poly(ctx, [[96, 38], [104, 30], [104, 34], [98, 40]], "#6e3e18", "#1a0c02", 0.8);
      // Pulley wheel & chain
      ellipse(ctx, 92, 33, 2.5, 2.5, "#d4aa44", "#4a3408", 0.8);
      ctx.strokeStyle = "#383430";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(92, 35); ctx.lineTo(92, 45);
      ctx.stroke();
      // Lifting tongs
      poly(ctx, [[89, 45], [95, 45], [94, 49], [90, 49]], "#2a2622", "#0c0806", 0.8);

      // Stacked Cannonball Pyramid on Right (4 cannonballs)
      ellipse(ctx, 84, 62, 4.5, 4.5, linGrad(ctx, 81, 58, 88, 66, [[0, "#56504a"], [1, "#100e0c"]]), "#0c0a08", 1.2);
      ellipse(ctx, 82.5, 60.5, 1.2, 1.2, "#ffffff");
      ellipse(ctx, 93, 62, 4.5, 4.5, linGrad(ctx, 90, 58, 97, 66, [[0, "#56504a"], [1, "#100e0c"]]), "#0c0a08", 1.2);
      ellipse(ctx, 91.5, 60.5, 1.2, 1.2, "#ffffff");
      ellipse(ctx, 102, 62, 4.5, 4.5, linGrad(ctx, 99, 58, 106, 66, [[0, "#56504a"], [1, "#100e0c"]]), "#0c0a08", 1.2);
      ellipse(ctx, 100.5, 60.5, 1.2, 1.2, "#ffffff");
      ellipse(ctx, 88.5, 55, 4.5, 4.5, linGrad(ctx, 85.5, 51, 92.5, 59, [[0, "#625a54"], [1, "#12100e"]]), "#0c0a08", 1.2);
      ellipse(ctx, 87, 53.5, 1.3, 1.3, "#ffffff");

      // 7. Reinforced Heavy Siege Mortar with 4 Bronze Bands (Y=20 to 58)
      // Fuse smoke
      ellipse(ctx, 40, 32, 4.5, 3.5, "rgba(210,200,185,0.4)");
      ellipse(ctx, 36, 26, 6, 5, "rgba(210,200,185,0.3)");
      ellipse(ctx, 32, 19, 7, 5.5, "rgba(210,200,185,0.2)");

      // Trunnion Cheek Brackets
      poly(ctx, [[44, 62], [58, 62], [56, 44], [46, 44]], linGrad(ctx, 44, 44, 58, 62, [[0, "#56504a"], [1, "#1c1814"]]), "#0e0c0a", 1.6);
      poly(ctx, [[70, 62], [84, 62], [82, 44], [72, 44]], linGrad(ctx, 70, 44, 84, 62, [[0, "#48423c"], [1, "#141210"]]), "#0e0c0a", 1.6);

      // Heavy Mortar Barrel
      const barrelL2 = [
        [36, 46],
        [46, 34],
        [74, 20],
        [86, 32],
        [60, 58],
        [44, 58],
      ];
      poly(ctx, barrelL2, linGrad(ctx, 36, 20, 86, 58, [[0, "#6e665e"], [0.25, "#4e4842"], [0.65, "#2a2622"], [1, "#12100e"]]), "#0a0806", 2.4);

      // Spherical Breech Cascabell
      ellipse(ctx, 41, 52, 9.5, 8.5, linGrad(ctx, 34, 45, 48, 59, [[0, "#6e665e"], [0.5, "#3c3630"], [1, "#12100e"]]), "#0a0806", 1.8);
      ellipse(ctx, 34, 54, 3.2, 3.2, "#342e28", "#0a0806", 1.2);

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
      ellipse(ctx, 60, 47, 4, 4, "#d4a438", "#442e08", 1.4);
      ellipse(ctx, 59, 46, 1.4, 1.4, "#fff0a0");

      // Flared Muzzle Ring & Rifled Dark Bore
      ellipse(ctx, 80, 26, 8.5, 11, linGrad(ctx, 72, 16, 88, 36, [[0, "#f8d06c"], [0.5, "#b88428"], [1, "#54340a"]]), "#1a1004", 2.2);
      ellipse(ctx, 80, 26, 6, 8, linGrad(ctx, 74, 19, 86, 33, [[0, "#080604"], [1, "#1c140e"]]), "#000000", 1.6);
      ellipse(ctx, 81, 25, 3.5, 4.5, "#060402");
    };

    const drawArtilleryL3 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Scorched Heavy Foundation Mound
      shadow(ctx, 64, 116, 52, 13, 0.5);
      shadow(ctx, 64, 117, 40, 7, 0.65);

      ellipse(ctx, 64, 110, 50, 15, linGrad(ctx, 20, 96, 108, 122, [[0, "#52422e"], [0.4, "#362818"], [1, "#181008"]]), "#0e0a04", 2);
      ctx.strokeStyle = "rgba(200, 160, 90, 0.4)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(64, 108, 46, 11, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      // 2. Heavy Bastioned Granite Redoubt with Dwarven Iron Plating (Y=72 to 112)
      rounded(ctx, 24, 72, 80, 38, 4, linGrad(ctx, 24, 72, 104, 110, [[0, "#b89468"], [0.35, "#86603c"], [0.75, "#52361e"], [1, "#2c1a0c"]]), "#160a04", 2.4);

      // Stone block courses
      ctx.strokeStyle = "#160a04";
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
        rounded(ctx, px, py, pw, ph, 2, linGrad(ctx, px, py, px + pw, py + ph, [[0, "#484440"], [0.5, "#2a2622"], [1, "#141210"]]), "#0c0a08", 1.4);
        ctx.strokeStyle = "rgba(255, 215, 100, 0.4)";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(px + 1.5, py + 1.5, pw - 3, ph - 3);
        ellipse(ctx, px + 3, py + 4, 1.2, 1.2, "#ffd452");
        ellipse(ctx, px + pw - 3, py + 4, 1.2, 1.2, "#ffd452");
        ellipse(ctx, px + 3, py + ph - 4, 1.2, 1.2, "#ffd452");
        ellipse(ctx, px + pw - 3, py + ph - 4, 1.2, 1.2, "#ffd452");
      }

      // 3. Full-Width Armored Battery Gun-Deck & Steel Blast Mantlets (Y=58 to 76)
      rounded(ctx, 12, 60, 104, 16, 3, linGrad(ctx, 12, 60, 116, 76, [[0, "#cca054"], [0.25, "#9e6830"], [0.75, "#643c14"], [1, "#3c1e08"]]), "#1a0c02", 2.2);

      // Crenellated Steel Blast Shields along rim
      for (const bx of [16, 32, 48, 64, 80, 96]) {
        rounded(ctx, bx, 56, 12, 8, 1.5, linGrad(ctx, bx, 56, bx + 12, 64, [[0, "#5a544e"], [1, "#201c18"]]), "#0c0a08", 1.2);
        ellipse(ctx, bx + 6, 60, 1.2, 1.2, "#ffd452");
      }

      // Massive Geared Steel Turntable Platform Base
      ellipse(ctx, 64, 58, 30, 8, linGrad(ctx, 34, 50, 94, 66, [[0, "#5c5650"], [0.5, "#34302c"], [1, "#181412"]]), "#0a0806", 2.0);
      for (const tx of [38, 48, 58, 70, 80, 90]) {
        ellipse(ctx, tx, 58, 1.4, 1.4, "#ffd452", "#4a3408", 0.8);
      }

      // 4. Steaming Boiler Furnace Stack on Left (X=14 to 36, Y=14 to 62)
      // Cylindrical Iron Furnace Body
      rounded(ctx, 16, 30, 18, 30, 3, linGrad(ctx, 16, 30, 34, 60, [[0, "#48423c"], [0.5, "#2c2824"], [1, "#141210"]]), "#0a0806", 1.5);
      // Glowing Firebox Grate Door
      rounded(ctx, 20, 46, 10, 10, 2, "#180802", "#0a0400", 1.0);
      ellipse(ctx, 25, 51, 3.5, 3.5, radGrad(ctx, 25, 51, 1, 4, [[0, "#ffffff"], [0.4, "#ff8c18"], [1, "rgba(200,20,0,0)"]]));

      // Chimney Stack Pipe & Cap (Y=12 to 32)
      poly(ctx, [[21, 30], [29, 30], [28, 14], [22, 14]], linGrad(ctx, 21, 14, 29, 30, [[0, "#56504a"], [1, "#24201c"]]), "#0a0806", 1.2);
      ellipse(ctx, 25, 14, 5, 2.5, "#34302c", "#0a0806", 1.0);

      // Volumetric Dark Coal Smoke Clouds & Fiery Sparks
      ellipse(ctx, 24, 6, 8, 6, "rgba(60,54,48,0.75)");
      ellipse(ctx, 18, 0, 7, 5, "rgba(80,74,68,0.65)");
      ellipse(ctx, 30, -2, 6, 4.5, "rgba(95,88,80,0.55)");
      ellipse(ctx, 23, 10, 1.2, 1.2, "#ffb040");
      ellipse(ctx, 27, 7, 1.0, 1.0, "#ff8810");

      // 5. Armored Munitions Bunker on Right (X=86 to 114, Y=30 to 62)
      // Steel-Plated Ammo Chest
      rounded(ctx, 88, 44, 24, 16, 2, linGrad(ctx, 88, 44, 112, 60, [[0, "#524c46"], [0.5, "#302c28"], [1, "#161412"]]), "#0c0a08", 1.4);
      ctx.strokeStyle = "#ffd452";
      ctx.lineWidth = 0.8;
      ctx.strokeRect(89.5, 45.5, 21, 13);

      // Giant Armor-Piercing Artillery Shells (3 massive golden brass shells)
      for (const [sx, sy] of [[92, 34], [99, 34], [106, 34]]) {
        poly(ctx, [[sx, sy + 12], [sx + 5, sy + 12], [sx + 5, sy + 4], [sx + 2.5, sy], [sx, sy + 4]], linGrad(ctx, sx, sy, sx + 5, sy + 12, [[0, "#ffe074"], [0.5, "#d49a2a"], [1, "#6a4008"]]), "#2a1602", 1.0);
        ellipse(ctx, sx + 2.5, sy + 2, 0.8, 0.8, "#ffffff");
      }

      // Overhead Heavy Loading Crane Arm (X=84 to 110, Y=18 to 36)
      rounded(ctx, 106, 18, 5, 42, 1.5, linGrad(ctx, 106, 18, 111, 60, [[0, "#9c6834"], [1, "#44240a"]]), "#1a0c02", 1.4);
      poly(ctx, [[88, 18], [110, 18], [110, 23], [88, 23]], "#484440", "#0c0a08", 1.2);
      ellipse(ctx, 92, 24, 3, 3, "#ffd452", "#4a3408", 0.8);

      // 6. Colossal Titan Siege Cannon / Dreadnought Bombard (Y=14 to 58)
      // Pneumatic Hydraulic Recoil Dampers under barrel
      poly(ctx, [[42, 54], [62, 40], [64, 43], [44, 57]], linGrad(ctx, 42, 40, 64, 57, [[0, "#8a8278"], [1, "#302c28"]]), "#0e0c0a", 1.2);

      // Giant Cast-Iron Bombard Barrel (Pitched at 40°)
      const titanBarrel = [
        [32, 44],
        [44, 30],
        [78, 14],
        [92, 28],
        [64, 56],
        [42, 56],
      ];
      poly(ctx, titanBarrel, linGrad(ctx, 32, 14, 92, 56, [[0, "#7a7268"], [0.25, "#524a42"], [0.65, "#2c2622"], [1, "#12100e"]]), "#080604", 2.6);

      // Massive Spherical Breech Cascabell
      ellipse(ctx, 38, 50, 11, 10, linGrad(ctx, 30, 42, 46, 58, [[0, "#7a7268"], [0.5, "#423a32"], [1, "#14100c"]]), "#080604", 2.0);
      ellipse(ctx, 29, 52, 4, 4, "#3a342c", "#080604", 1.4);

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
      ellipse(ctx, 58, 45, 5, 5, "#ffd452", "#442e08", 1.6);
      ellipse(ctx, 57, 44, 1.8, 1.8, "#ffffff");

      // Colossal Flared Golden Muzzle Ring & Menacing Rifled Bore
      ellipse(ctx, 86, 21, 10, 13, linGrad(ctx, 76, 10, 96, 32, [[0, "#ffe880"], [0.45, "#c89028"], [1, "#543008"]]), "#1a0e02", 2.4);
      ellipse(ctx, 86, 21, 7, 9.5, linGrad(ctx, 80, 13, 92, 29, [[0, "#040202"], [1, "#18100c"]]), "#000000", 1.8);
      ellipse(ctx, 87, 20, 4, 5.5, "#000000");

      // 7. Twin Industrial Battle Standards with Crossed Cannon Crests
      // Left Flag
      poly(ctx, [[14, 46], [28, 46], [26, 68], [21, 63], [14, 69]], linGrad(ctx, 14, 46, 28, 69, [[0, "#b82414"], [0.5, "#801206"], [1, "#400402"]]), "#1a0200", 1.2);
      ctx.strokeStyle = "#ffd452";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(15, 47); ctx.lineTo(15, 67); ctx.lineTo(21, 62); ctx.lineTo(25, 66); ctx.lineTo(27, 47);
      ctx.stroke();

      // Right Flag
      poly(ctx, [[98, 46], [112, 46], [114, 69], [107, 63], [100, 68]], linGrad(ctx, 98, 46, 114, 69, [[0, "#b82414"], [0.5, "#801206"], [1, "#400402"]]), "#1a0200", 1.2);
      ctx.strokeStyle = "#ffd452";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(100, 47); ctx.lineTo(102, 66); ctx.lineTo(107, 62); ctx.lineTo(112, 67); ctx.lineTo(112, 47);
      ctx.stroke();
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
      shadow(ctx, 64, 116, 50, 12, 0.42);
      shadow(ctx, 64, 117, 38, 7, 0.55);

      // Fortified earthen berm
      ellipse(ctx, 64, 110, 48, 14, linGrad(ctx, 24, 96, 104, 122, [[0, "#5a7036"], [0.4, "#3e4f24"], [1, "#1c2610"]]), "#121a0a", 2);
      ctx.strokeStyle = "rgba(160, 215, 80, 0.4)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(64, 108, 44, 10, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      // Foundation boulders embedded in turf
      ellipse(ctx, 26, 114, 5, 3, "#686a5a", "#262a20", 1);
      ellipse(ctx, 38, 118, 5.5, 3.2, "#585a4a", "#262a20", 1);
      ellipse(ctx, 90, 116, 5, 3.2, "#5c5e4e", "#262a20", 1);
      ellipse(ctx, 100, 113, 4, 2.5, "#6c6e5e", "#262a20", 1);

      // 2. Heavy Dressed Fortress Stone Plinth (Foundation Y=82 to 112)
      rounded(ctx, 30, 82, 68, 30, 4, linGrad(ctx, 30, 82, 98, 112, [[0, "#c6b480"], [0.35, "#988452"], [0.75, "#66542e"], [1, "#3c2e16"]]), "#1a1206", 2.2);

      // Stone block mortar courses
      ctx.strokeStyle = "#1a1206";
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
      ctx.strokeStyle = "#1a1206";
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
      rounded(ctx, 28, 42, 72, 44, 4, linGrad(ctx, 28, 42, 100, 86, [[0, "#dac890"], [0.3, "#ac965e"], [0.7, "#766236"], [1, "#44361a"]]), "#1e1406", 2.4);

      // Corner stone quoins (interlocking corner blocks)
      const quoins = [
        [28, 44, 8, 7], [28, 53, 11, 7], [28, 62, 8, 7], [28, 71, 11, 7],
        [92, 44, 8, 7], [89, 53, 11, 7], [92, 62, 8, 7], [89, 71, 11, 7],
      ];
      for (const [qx, qy, qw, qh] of quoins) {
        rounded(ctx, qx, qy, qw, qh, 1.5, linGrad(ctx, qx, qy, qx + qw, qy + qh, [[0, "#eedcaa"], [1, "#867240"]]), "#221808", 1.0);
      }

      // Arrow loops / crosslet embrasures on flank walls
      // Left arrow loop
      rounded(ctx, 38, 54, 4, 12, 1.5, "#140c04", "#241608", 1);
      rounded(ctx, 35, 58, 10, 3, 1, "#140c04", "#241608", 1);
      // Right arrow loop
      rounded(ctx, 86, 54, 4, 12, 1.5, "#140c04", "#241608", 1);
      rounded(ctx, 83, 58, 10, 3, 1, "#140c04", "#241608", 1);

      // 4. Machicolations / Corbel Course (Y=34 to 44)
      for (let i = 0; i < 5; i += 1) {
        const cx = 32 + i * 16;
        poly(ctx, [[cx - 4, 44], [cx + 4, 44], [cx + 6, 36], [cx - 6, 36]], linGrad(ctx, cx - 6, 36, cx + 6, 44, [[0, "#eedcaa"], [1, "#7c6838"]]), "#1e1406", 1.2);
      }

      // Parapet Base Stringcourse Beam
      rounded(ctx, 22, 34, 84, 8, 2, linGrad(ctx, 22, 34, 106, 42, [[0, "#f0deaa"], [0.35, "#beaa70"], [1, "#66542a"]]), "#1e1406", 1.8);

      // 5. Crenellated Merlons (5 Battlement teeth, Y=18 to 36)
      for (let i = 0; i < 5; i += 1) {
        const mx = 24 + i * 16.5;
        // Merlon block
        rounded(ctx, mx, 20, 13, 16, 2, linGrad(ctx, mx, 20, mx + 13, 36, [[0, "#faeab6"], [0.4, "#c8b478"], [1, "#746234"]]), "#1e1406", 1.6);
        // Merlon capstone coping
        rounded(ctx, mx - 1, 18, 15, 4, 1.5, "#fff2c8", "#2c1e08", 1.0);
        // Merlon center arrow slit
        rounded(ctx, mx + 5, 23, 3, 7, 1, "#1c1004");
      }
    };

    const drawBarracksGate128 = (ctx, isFire = false) => {
      // Grand Arched Stone Portal (Center 64, Y=56 to 92)
      // Dressed Stone Portal Frame
      poly(
        ctx,
        [[44, 90], [44, 68], [64, 54], [84, 68], [84, 90], [80, 90], [80, 70], [64, 58], [48, 70], [48, 90]],
        linGrad(ctx, 44, 54, 84, 90, [[0, "#fae6b4"], [0.5, "#b8a064"], [1, "#5c4a24"]]),
        "#1e1406",
        1.8
      );

      // Stone Keystone at apex
      poly(ctx, [[60, 58], [68, 58], [70, 51], [58, 51]], "#fff4c8", "#2c1e08", 1.2);

      // Stone threshold step
      rounded(ctx, 44, 89, 40, 5, 1.5, "#685834", "#1a1004", 1.2);

      if (!isFire) {
        // —— IDLE GATE: Fortified Oak Double Doors Closed ——
        // Doorway shadow recess
        rounded(ctx, 48, 60, 32, 30, 4, "#140c04");

        // Left Oak Door Leaf
        rounded(ctx, 49, 62, 14.5, 27, 2, linGrad(ctx, 49, 62, 63.5, 89, [[0, "#4a2a14"], [0.5, "#321a0a"], [1, "#1c0e04"]]), "#0e0602", 1.2);
        // Right Oak Door Leaf
        rounded(ctx, 64.5, 62, 14.5, 27, 2, linGrad(ctx, 64.5, 62, 79, 89, [[0, "#422410"], [0.5, "#2a1408"], [1, "#140802"]]), "#0e0602", 1.2);

        // Vertical timber plank lines
        ctx.strokeStyle = "#100602";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(56, 63); ctx.lineTo(56, 88);
        ctx.moveTo(71.5, 63); ctx.lineTo(71.5, 88);
        ctx.stroke();

        // Heavy Wrought-Iron Strap Hinges across both leaves
        for (const hy of [67, 81]) {
          poly(ctx, [[49, hy], [61, hy], [62, hy + 2], [49, hy + 2]], "#282420", "#080604", 0.8);
          poly(ctx, [[79, hy], [67, hy], [66, hy + 2], [79, hy + 2]], "#282420", "#080604", 0.8);
          ellipse(ctx, 52, hy + 1, 0.9, 0.9, "#ffd452");
          ellipse(ctx, 59, hy + 1, 0.9, 0.9, "#ffd452");
          ellipse(ctx, 69, hy + 1, 0.9, 0.9, "#ffd452");
          ellipse(ctx, 76, hy + 1, 0.9, 0.9, "#ffd452");
        }

        // Iron Ring Pull Handles & Center Lock Plate
        ellipse(ctx, 61.5, 75, 2, 2.5, "#24201c", "#080604", 1);
        ellipse(ctx, 66.5, 75, 2, 2.5, "#24201c", "#080604", 1);
        ellipse(ctx, 64, 75, 1.2, 1.2, "#ffd452");

        // Portcullis Grille in arch transom
        ctx.strokeStyle = "#201c18";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(54, 58); ctx.lineTo(54, 63);
        ctx.moveTo(64, 55); ctx.lineTo(64, 63);
        ctx.moveTo(74, 58); ctx.lineTo(74, 63);
        ctx.moveTo(50, 60); ctx.lineTo(78, 60);
        ctx.stroke();
      } else {
        // —— FIRE STATE: Gate Swung Wide & Golden Muster Light Surge ——
        // Open door portal glowing with blazing muster radiance
        rounded(ctx, 48, 60, 32, 30, 4, linGrad(ctx, 48, 60, 80, 90, [[0, "#ffffff"], [0.35, "#ffea74"], [0.75, "#ff9418"], [1, "#8a3406"]]), "#1a0800", 1.8);
        ellipse(ctx, 64, 76, 12, 16, radGrad(ctx, 64, 74, 2, 16, [[0, "#ffffff"], [0.5, "#fff0a0"], [1, "rgba(255,140,20,0)"]]));

        // Golden light spilled onto threshold
        ellipse(ctx, 64, 91, 16, 5, "rgba(255, 235, 120, 0.7)");

        // Left open door leaf angled inward
        poly(ctx, [[48, 63], [54, 65], [54, 88], [48, 86]], "#2c160a", "#0c0400", 1.2);
        // Right open door leaf angled inward
        poly(ctx, [[80, 63], [74, 65], [74, 88], [80, 86]], "#241006", "#0c0400", 1.2);
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
      poly(ctx, shieldPoly, linGrad(ctx, 54, 42, 74, 59, [[0, "#ffffff"], [0.3, "#f4d060"], [1, "#9c7018"]]), "#2a1a06", 1.8);

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
      rounded(ctx, 31, 62, 3.5, 12, 1, "#36302a", "#100c08", 0.8);
      // Right Torch (X=93, Y=56..72)
      rounded(ctx, 93.5, 62, 3.5, 12, 1, "#36302a", "#100c08", 0.8);

      if (!isFire) {
        // Idle Torches
        ellipse(ctx, 33, 58, 4.5, 6, radGrad(ctx, 33, 57, 1, 6, [[0, "#ffffff"], [0.4, "#ffa820"], [1, "rgba(200,40,0,0)"]]));
        ellipse(ctx, 95, 58, 4.5, 6, radGrad(ctx, 95, 57, 1, 6, [[0, "#ffffff"], [0.4, "#ffa820"], [1, "rgba(200,40,0,0)"]]));

        // Idle Flagpole & Pennant on Left Battlement (X=36, Y=4 to 22)
        ctx.strokeStyle = "#4a3418";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(36, 22); ctx.lineTo(36, 4);
        ctx.stroke();
        poly(ctx, [[36, 2], [38, 6], [36, 5], [34, 6]], "#ffd860", "#4a3408", 0.8);

        // Small swallowtail pennant
        poly(ctx, [[36, 6], [54, 9], [48, 15], [54, 21], [36, 18]], linGrad(ctx, 36, 6, 54, 21, [[0, "#d83424"], [0.6, "#9e1810"], [1, "#540804"]]), "#200402", 1.0);
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
        ctx.strokeStyle = "#2a2218";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(34, 24); ctx.lineTo(34, -4);
        ctx.stroke();
        poly(ctx, [[34, -8], [37, -2], [34, -4], [31, -2]], "#fff080", "#5a3a10", 1.0);

        // Grand Billowing Crimson & Gold War Standard (X=34 to 76, Y=-4 to 26)
        const bannerPoly = [
          [34, -3],
          [74, -5],
          [64, 8],
          [76, 22],
          [34, 15],
        ];
        poly(ctx, bannerPoly, linGrad(ctx, 34, -5, 76, 22, [[0, "#ea3826"], [0.45, "#b81c10"], [1, "#640a06"]]), "#220402", 1.6);

        // Golden Embroidered Chevron Crest on War Standard
        ctx.strokeStyle = "#ffe868";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(42, 0); ctx.lineTo(54, 8); ctx.lineTo(42, 14);
        ctx.stroke();
        ellipse(ctx, 54, 8, 2, 2, "#ffffff", "#ffd452", 0.8);

        // Sounding Brass War Horn at Right Battlement (X=78 to 102, Y=6 to 20)
        poly(ctx, [[76, 18], [84, 13], [98, 7], [101, 12], [86, 18], [76, 21]], linGrad(ctx, 76, 7, 101, 21, [[0, "#fff090"], [0.5, "#e0b034"], [1, "#805814"]]), "#2c1c04", 1.4);
        ellipse(ctx, 100, 9.5, 3.5, 6, "#3c2008", "#fff2a0", 1.5);

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

      ellipse(ctx, 64, 110, 48, 14, linGrad(ctx, 24, 96, 104, 122, [[0, "#5a7036"], [0.4, "#3e4f24"], [1, "#1c2610"]]), "#121a0a", 2);
      ctx.strokeStyle = "rgba(160, 215, 80, 0.4)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(64, 108, 44, 10, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      ellipse(ctx, 26, 114, 5, 3, "#686a5a", "#262a20", 1);
      ellipse(ctx, 38, 118, 5.5, 3.2, "#585a4a", "#262a20", 1);
      ellipse(ctx, 90, 116, 5, 3.2, "#5c5e4e", "#262a20", 1);
      ellipse(ctx, 100, 113, 4, 2.5, "#6c6e5e", "#262a20", 1);

      // 2. Heavy Dressed Fortress Stone Plinth (Foundation Y=80 to 112)
      rounded(ctx, 28, 80, 72, 32, 4, linGrad(ctx, 28, 80, 100, 112, [[0, "#c6b480"], [0.35, "#988452"], [0.75, "#66542e"], [1, "#3c2e16"]]), "#1a1206", 2.2);

      ctx.strokeStyle = "#1a1206";
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
      rounded(ctx, 26, 36, 76, 50, 4, linGrad(ctx, 26, 36, 102, 86, [[0, "#dac890"], [0.3, "#ac965e"], [0.7, "#766236"], [1, "#44361a"]]), "#1e1406", 2.4);

      // Corner stone quoins
      for (const [qx, qy, qw, qh] of [
        [26, 40, 8, 7], [26, 49, 11, 7], [26, 58, 8, 7], [26, 67, 11, 7], [26, 76, 8, 7],
        [94, 40, 8, 7], [91, 49, 11, 7], [94, 58, 8, 7], [91, 67, 11, 7], [94, 76, 8, 7],
      ]) {
        rounded(ctx, qx, qy, qw, qh, 1.5, linGrad(ctx, qx, qy, qx + qw, qy + qh, [[0, "#eedcaa"], [1, "#867240"]]), "#221808", 1.0);
      }

      // Flank Arrow Loops
      rounded(ctx, 34, 50, 4, 12, 1.5, "#140c04", "#241608", 1);
      rounded(ctx, 31, 54, 10, 3, 1, "#140c04", "#241608", 1);
      rounded(ctx, 90, 50, 4, 12, 1.5, "#140c04", "#241608", 1);
      rounded(ctx, 87, 54, 10, 3, 1, "#140c04", "#241608", 1);

      // 4. Machicolation Corbels Course (Y=28 to 38)
      for (let i = 0; i < 7; i += 1) {
        const cx = 26 + i * 12.5;
        poly(ctx, [[cx - 3.5, 38], [cx + 3.5, 38], [cx + 5, 30], [cx - 5, 30]], linGrad(ctx, cx - 5, 30, cx + 5, 38, [[0, "#eedcaa"], [1, "#7c6838"]]), "#1e1406", 1.2);
      }

      // Parapet Base Stringcourse Beam
      rounded(ctx, 18, 28, 92, 8, 2, linGrad(ctx, 18, 28, 110, 36, [[0, "#f0deaa"], [0.35, "#beaa70"], [1, "#66542a"]]), "#1e1406", 1.8);

      // 5. Crenellated Merlons (7 Battlement teeth, Y=14 to 30)
      for (let i = 0; i < 7; i += 1) {
        const mx = 20 + i * 13;
        rounded(ctx, mx, 16, 10, 14, 1.5, linGrad(ctx, mx, 16, mx + 10, 30, [[0, "#faeab6"], [0.4, "#c8b478"], [1, "#746234"]]), "#1e1406", 1.4);
        rounded(ctx, mx - 0.5, 14, 11, 3.5, 1.2, "#fff2c8", "#2c1e08", 0.9);
        rounded(ctx, mx + 4, 19, 2.5, 6, 0.8, "#1c1004");
      }

      // Twin Corner Sentry Turrets (Bartizans, Y=10 to 32)
      // Left Turret
      rounded(ctx, 16, 12, 10, 20, 2, linGrad(ctx, 16, 12, 26, 32, [[0, "#fae6b4"], [0.5, "#b8a064"], [1, "#5c4a24"]]), "#1e1406", 1.4);
      rounded(ctx, 19, 16, 3, 7, 1, "#1c1004");
      // Right Turret
      rounded(ctx, 102, 12, 10, 20, 2, linGrad(ctx, 102, 12, 112, 32, [[0, "#fae6b4"], [0.5, "#b8a064"], [1, "#5c4a24"]]), "#1e1406", 1.4);
      rounded(ctx, 106, 16, 3, 7, 1, "#1c1004");

      // 6. Grand Arched Gateway & Portcullis (Y=54 to 90)
      poly(
        ctx,
        [[42, 88], [42, 66], [64, 52], [86, 66], [86, 88], [82, 88], [82, 68], [64, 56], [46, 68], [46, 88]],
        linGrad(ctx, 42, 52, 86, 88, [[0, "#fae6b4"], [0.5, "#b8a064"], [1, "#5c4a24"]]),
        "#1e1406",
        1.8
      );
      poly(ctx, [[58, 56], [70, 56], [72, 49], [56, 49]], "#fff4c8", "#2c1e08", 1.2);
      rounded(ctx, 42, 87, 44, 5, 1.5, "#685834", "#1a1004", 1.2);

      // Oak double doors & heavy iron portcullis dropped halfway
      rounded(ctx, 46, 58, 36, 30, 4, "#140c04");
      rounded(ctx, 47, 68, 16.5, 20, 2, linGrad(ctx, 47, 68, 63.5, 88, [[0, "#4a2a14"], [1, "#1c0e04"]]), "#0e0602", 1.2);
      rounded(ctx, 64.5, 68, 16.5, 20, 2, linGrad(ctx, 64.5, 68, 81, 88, [[0, "#422410"], [1, "#140802"]]), "#0e0602", 1.2);

      // Spiked Iron Portcullis Grille
      ctx.strokeStyle = "#282420";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (const gx of [51, 57, 64, 71, 77]) {
        ctx.moveTo(gx, 54); ctx.lineTo(gx, 74);
        poly(ctx, [[gx, 74], [gx - 1.5, 77], [gx + 1.5, 77]], "#282420");
      }
      ctx.moveTo(48, 60); ctx.lineTo(80, 60);
      ctx.moveTo(48, 68); ctx.lineTo(80, 68);
      ctx.stroke();

      // 7. Dual Heraldic Heater Shields & Wall Torches
      // Left Shield (Crimson + Gold Cross)
      const sL = [[48, 42], [60, 42], [58, 50], [54, 55], [50, 50]];
      poly(ctx, sL, linGrad(ctx, 48, 42, 60, 55, [[0, "#ffffff"], [0.4, "#ea3826"], [1, "#640a06"]]), "#2a1a06", 1.4);
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(54, 43); ctx.lineTo(54, 53);
      ctx.moveTo(50, 47); ctx.lineTo(58, 47);
      ctx.stroke();

      // Right Shield (Azure + Silver Star)
      const sR = [[68, 42], [80, 42], [78, 50], [74, 55], [70, 50]];
      poly(ctx, sR, linGrad(ctx, 68, 42, 80, 55, [[0, "#ffffff"], [0.4, "#3068b8"], [1, "#102454"]]), "#2a1a06", 1.4);
      ellipse(ctx, 74, 48, 1.6, 1.6, "#ffffff");

      // Wall Torch Sconces
      for (const tx of [31, 95]) {
        rounded(ctx, tx, 58, 3.5, 12, 1, "#36302a", "#100c08", 0.8);
        ellipse(ctx, tx + 1.8, 54, 5, 7, radGrad(ctx, tx + 1.8, 53, 1, 7, [[0, "#ffffff"], [0.4, "#ffa820"], [1, "rgba(200,40,0,0)"]]));
      }

      // Twin Crimson Pennants flying from corner sentry turrets
      // Left Pennant
      ctx.strokeStyle = "#4a3418";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(20, 16); ctx.lineTo(20, 2);
      ctx.stroke();
      poly(ctx, [[20, 3], [36, 6], [30, 11], [36, 16], [20, 13]], linGrad(ctx, 20, 3, 36, 16, [[0, "#d83424"], [0.6, "#9e1810"], [1, "#540804"]]), "#200402", 0.9);

      // Right Pennant
      ctx.strokeStyle = "#4a3418";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(108, 16); ctx.lineTo(108, 2);
      ctx.stroke();
      poly(ctx, [[108, 3], [124, 6], [118, 11], [124, 16], [108, 13]], linGrad(ctx, 108, 3, 124, 16, [[0, "#d83424"], [0.6, "#9e1810"], [1, "#540804"]]), "#200402", 0.9);
    };

    const drawBarracksL3 = (ctx) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Ground Contact Shadow & Monumental Rampart Berm
      shadow(ctx, 64, 116, 54, 13, 0.48);
      shadow(ctx, 64, 117, 42, 7, 0.62);

      ellipse(ctx, 64, 110, 52, 15, linGrad(ctx, 18, 96, 110, 122, [[0, "#5a7238"], [0.4, "#3e5226"], [1, "#1a240e"]]), "#101808", 2);
      ctx.strokeStyle = "rgba(160, 220, 85, 0.45)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(64, 108, 48, 11, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();

      // 2. Monumental Fortress Foundation (Y=72 to 112)
      rounded(ctx, 22, 72, 84, 40, 4, linGrad(ctx, 22, 72, 106, 112, [[0, "#d0be88"], [0.35, "#9e8c56"], [0.75, "#6a5830"], [1, "#3c2e16"]]), "#1a1206", 2.4);

      // Stone block mortar courses
      ctx.strokeStyle = "#1a1206";
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
      rounded(ctx, 12, 24, 24, 54, 3, linGrad(ctx, 12, 24, 36, 78, [[0, "#eedcaa"], [0.4, "#b09c64"], [1, "#5c4a24"]]), "#1e1406", 2.0);
      rounded(ctx, 20, 34, 6, 12, 2, "#180e04", "#2c1c08", 1.0);
      rounded(ctx, 20, 54, 6, 12, 2, "#180e04", "#2c1c08", 1.0);

      // Left Spire Conical Roof (Slate/Copper, Y=6 to 24)
      poly(ctx, [[8, 24], [24, 6], [40, 24]], linGrad(ctx, 8, 6, 40, 24, [[0, "#4878a8"], [0.5, "#2a4e76"], [1, "#142c48"]]), "#0c1a2e", 2.0);
      ellipse(ctx, 24, 6, 3, 3, "#ffd452", "#503808", 1);
      poly(ctx, [[24, 0], [25.5, 4], [24, 6], [22.5, 4]], "#ffd452");

      // Right Spire Tower Body
      rounded(ctx, 92, 24, 24, 54, 3, linGrad(ctx, 92, 24, 116, 78, [[0, "#eedcaa"], [0.4, "#b09c64"], [1, "#5c4a24"]]), "#1e1406", 2.0);
      rounded(ctx, 102, 34, 6, 12, 2, "#180e04", "#2c1c08", 1.0);
      rounded(ctx, 102, 54, 6, 12, 2, "#180e04", "#2c1c08", 1.0);

      // Right Spire Conical Roof (Slate/Copper, Y=6 to 24)
      poly(ctx, [[88, 24], [104, 6], [120, 24]], linGrad(ctx, 88, 6, 120, 24, [[0, "#4878a8"], [0.5, "#2a4e76"], [1, "#142c48"]]), "#0c1a2e", 2.0);
      ellipse(ctx, 104, 6, 3, 3, "#ffd452", "#503808", 1);
      poly(ctx, [[104, 0], [105.5, 4], [104, 6], [102.5, 4]], "#ffd452");

      // 4. Central Grand Command Keep Body (Y=24 to 76)
      rounded(ctx, 32, 26, 64, 50, 3, linGrad(ctx, 32, 26, 96, 76, [[0, "#dac890"], [0.35, "#ac965e"], [0.75, "#766236"], [1, "#44361a"]]), "#1e1406", 2.2);

      // Machicolation corbels along central keep (Y=22 to 30)
      for (let i = 0; i < 6; i += 1) {
        const cx = 36 + i * 11;
        poly(ctx, [[cx - 3, 30], [cx + 3, 30], [cx + 4.5, 22], [cx - 4.5, 22]], linGrad(ctx, cx - 4.5, 22, cx + 4.5, 30, [[0, "#faeab6"], [1, "#7c6838"]]), "#1e1406", 1.0);
      }

      // Parapet Stringcourse & 7 Central Merlons (Y=12 to 24)
      rounded(ctx, 30, 20, 68, 6, 1.5, linGrad(ctx, 30, 20, 98, 26, [[0, "#fae8b4"], [1, "#6a562a"]]), "#1e1406", 1.5);
      for (let i = 0; i < 5; i += 1) {
        const mx = 34 + i * 13;
        rounded(ctx, mx, 10, 10, 12, 1.5, linGrad(ctx, mx, 10, mx + 10, 22, [[0, "#fff4c8"], [0.4, "#cca868"], [1, "#746234"]]), "#1e1406", 1.2);
        rounded(ctx, mx - 0.5, 8, 11, 3, 1, "#fff6d4", "#2c1e08", 0.8);
      }

      // Roaring Iron Fire-Basket Braziers on Keep Battlements
      for (const bx of [40, 88]) {
        rounded(ctx, bx - 3, 14, 6, 6, 1.5, "#2a2420", "#0c0804", 1.0);
        ellipse(ctx, bx, 11, 4.5, 6, radGrad(ctx, bx, 10, 1, 6, [[0, "#ffffff"], [0.4, "#ffa818"], [1, "rgba(200,20,0,0)"]]));
      }

      // 5. Monumental Grand Gateway & Open Radiant Guard-Hall (Y=52 to 92)
      poly(
        ctx,
        [[40, 90], [40, 64], [64, 48], [88, 64], [88, 90], [84, 90], [84, 66], [64, 52], [44, 66], [44, 90]],
        linGrad(ctx, 40, 48, 88, 90, [[0, "#fae6b4"], [0.5, "#b8a064"], [1, "#5c4a24"]]),
        "#1e1406",
        2.0
      );

      // Carved Golden Lion Keystone
      poly(ctx, [[58, 52], [70, 52], [72, 44], [56, 44]], "#ffd860", "#3a2406", 1.4);
      ellipse(ctx, 64, 48, 3, 3, "#ffffff", "#ffd452", 0.8);

      // Open Arched Doorway with Warm Radiant Light Spilling Out
      rounded(ctx, 44, 56, 40, 34, 4, linGrad(ctx, 44, 56, 84, 90, [[0, "#ffffff"], [0.35, "#ffe874"], [0.75, "#e08818"], [1, "#6a2404"]]), "#1a0800", 1.8);
      ellipse(ctx, 64, 76, 14, 16, radGrad(ctx, 64, 74, 2, 16, [[0, "#ffffff"], [0.5, "#fff0a0"], [1, "rgba(255,140,20,0)"]]));

      // Spiked Iron Portcullis Raised
      ctx.strokeStyle = "#282420";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (const gx of [49, 55, 61, 67, 73, 79]) {
        ctx.moveTo(gx, 50); ctx.lineTo(gx, 65);
        poly(ctx, [[gx, 65], [gx - 1.5, 68], [gx + 1.5, 68]], "#282420");
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
      poly(ctx, crestPoly, linGrad(ctx, 52, 34, 76, 54, [[0, "#ffffff"], [0.3, "#f4d060"], [1, "#9c7018"]]), "#2a1a06", 1.8);
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
      ctx.strokeStyle = "#2a2218";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(14, 28); ctx.lineTo(14, -2);
      ctx.stroke();
      poly(ctx, [[14, -2], [14, 22], [42, 12], [32, 2], [42, -8]], linGrad(ctx, 14, -8, 42, 22, [[0, "#e83424"], [0.5, "#ac160c"], [1, "#540602"]]), "#200200", 1.4);
      ctx.strokeStyle = "#ffd854";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(16, 0); ctx.lineTo(34, 0); ctx.lineTo(24, 7);
      ctx.stroke();

      // Right Grand Standard
      ctx.strokeStyle = "#2a2218";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(114, 28); ctx.lineTo(114, -2);
      ctx.stroke();
      poly(ctx, [[114, -2], [114, 22], [86, 12], [96, 2], [86, -8]], linGrad(ctx, 86, -8, 114, 22, [[0, "#e83424"], [0.5, "#ac160c"], [1, "#540602"]]), "#200200", 1.4);
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

      // Cheek highlight
      ctx.strokeStyle = "rgba(255,255,255,.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 4, 5, Math.PI, Math.PI * 1.5);
      ctx.stroke();
    };

    const drawScout = (ctx, frame = 0) => {
      shadow(ctx, 40, 62, 20, 6, 0.4);
      const f = frame % 4;
      const bodyY = (f === 1 || f === 3) ? 26 : 28;
      const headY = (f === 1 || f === 3) ? 20 : 22;
      const earY = (f === 1 || f === 3) ? -2 : 0;

      const outline = "#2a4018";

      // 2-3 stop warm goblin hide / skin gradients
      const skinLit = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#d8f26a"], [0.45, "#88bc3c"], [1, "#446820"]]);
      const skinShaded = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#769c34"], [0.5, "#4c6e22"], [1, "#263e12"]]);
      const bootGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#5a422a"], [0.5, "#3a2818"], [1, "#1e140c"]]);

      // Contact AO under feet
      if (f === 0) {
        ellipse(ctx, 23, 54.5, 6, 1.8, "rgba(10, 16, 8, 0.7)");
        ellipse(ctx, 51, 53.5, 5, 1.6, "rgba(10, 16, 8, 0.55)");
      } else if (f === 1) {
        ellipse(ctx, 32, 55.5, 6.5, 2, "rgba(10, 16, 8, 0.75)");
        ellipse(ctx, 48, 48, 4, 1.4, "rgba(10, 16, 8, 0.3)");
      } else if (f === 2) {
        ellipse(ctx, 20, 53.5, 5, 1.6, "rgba(10, 16, 8, 0.55)");
        ellipse(ctx, 50, 54.5, 6, 1.8, "rgba(10, 16, 8, 0.7)");
      } else {
        ellipse(ctx, 33, 48, 4, 1.4, "rgba(10, 16, 8, 0.3)");
        ellipse(ctx, 44, 55.5, 6.5, 2, "rgba(10, 16, 8, 0.75)");
      }

      // Far/back arm (drawn behind torso)
      let bArmX, bArmY, bArmW, bArmH;
      if (f === 0) { bArmX = 20; bArmY = bodyY + 6; bArmW = 8; bArmH = 5; }
      else if (f === 1) { bArmX = 22; bArmY = bodyY + 7; bArmW = 8; bArmH = 5; }
      else if (f === 2) { bArmX = 25; bArmY = bodyY + 8; bArmW = 9; bArmH = 5; }
      else { bArmX = 22; bArmY = bodyY + 7; bArmW = 8; bArmH = 5; }
      rounded(ctx, bArmX, bArmY, bArmW, bArmH, 2.5, skinShaded(bArmX, bArmY, bArmX + bArmW, bArmY + bArmH), outline, 1.2);

      // Legs: stride contact vs passing with 3-stop skin/hide volume
      if (f === 0) {
        // Left forward contact
        poly(ctx, [[28, 43], [34, 43], [27, 54], [21, 54]], skinLit(28, 43, 21, 54), outline, 1.4);
        rounded(ctx, 18, 52, 11, 5, 2, bootGrad(18, 52, 18, 57), outline, 1);
        // Cool rim on left forward leg
        ctx.strokeStyle = "rgba(205, 245, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(28, 44);
        ctx.lineTo(21, 54);
        ctx.stroke();
        // Right back trailing
        poly(ctx, [[42, 43], [48, 43], [54, 52], [48, 53]], skinShaded(42, 43, 54, 52), outline, 1.4);
        rounded(ctx, 47, 51, 9, 5, 2, bootGrad(47, 51, 47, 56), outline, 1);
      } else if (f === 1) {
        // Left planted straight
        rounded(ctx, 29, 41, 7, 14, 3, skinLit(29, 41, 36, 55), outline, 1.4);
        rounded(ctx, 27, 53, 11, 5, 2, bootGrad(27, 53, 27, 58), outline, 1);
        // Cool rim on left leg
        ctx.strokeStyle = "rgba(205, 245, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(29, 42);
        ctx.lineTo(29, 53);
        ctx.stroke();
        // Right lifted passing knee
        poly(ctx, [[42, 40], [48, 40], [50, 47], [44, 48]], skinShaded(42, 40, 50, 47), outline, 1.4);
        rounded(ctx, 44, 45, 9, 5, 2, bootGrad(44, 45, 44, 50), outline, 1);
      } else if (f === 2) {
        // Left back trailing
        poly(ctx, [[28, 43], [34, 43], [23, 53], [17, 52]], skinShaded(28, 43, 23, 53), outline, 1.4);
        rounded(ctx, 16, 51, 9, 5, 2, bootGrad(16, 51, 16, 56), outline, 1);
        // Right forward contact
        poly(ctx, [[42, 43], [48, 43], [53, 54], [47, 54]], skinLit(42, 43, 53, 54), outline, 1.4);
        rounded(ctx, 45, 52, 11, 5, 2, bootGrad(45, 52, 45, 57), outline, 1);
      } else {
        // Left lifted passing knee
        poly(ctx, [[28, 40], [34, 40], [36, 47], [30, 48]], skinShaded(28, 40, 36, 47), outline, 1.4);
        rounded(ctx, 29, 45, 9, 5, 2, bootGrad(29, 45, 29, 50), outline, 1);
        // Right planted straight
        rounded(ctx, 41, 41, 7, 14, 3, skinLit(41, 41, 48, 55), outline, 1.4);
        rounded(ctx, 39, 53, 11, 5, 2, bootGrad(39, 53, 39, 58), outline, 1);
      }

      // Contact AO under tunic skirt over legs
      ellipse(ctx, 40, bodyY + 22, 13, 3, "rgba(16, 26, 8, 0.48)");

      // Body tunic
      rounded(ctx, 26, bodyY, 28, 22, 8, linGrad(ctx, 26, bodyY, 54, bodyY + 22, [[0, "#e4f88c"], [0.42, "#90c24a"], [1, "#365c1c"]]), outline, 2);
      // Cool rim on upper-left tunic edge
      ctx.strokeStyle = "rgba(205, 245, 255, 0.45)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(27, bodyY + 14);
      ctx.lineTo(27, bodyY + 6);
      ctx.arcTo(27, bodyY, 34, bodyY, 6);
      ctx.stroke();

      // Belt and buckle
      rounded(ctx, 27, bodyY + 14, 26, 3.5, 1, linGrad(ctx, 27, bodyY + 14, 27, bodyY + 18, [[0, "#4e3620"], [1, "#26180c"]]));
      rounded(ctx, 38, bodyY + 13.5, 5, 4.5, 1, linGrad(ctx, 38, bodyY + 13.5, 43, bodyY + 18, [[0, "#ffea78"], [0.5, "#d4af37"], [1, "#7c5c18"]]), "#2a1e10", 0.8);

      // Contact AO under chin / jaw onto tunic
      ellipse(ctx, 40, headY + 11, 10.5, 3.2, "rgba(16, 28, 8, 0.55)");

      // Head with 3-stop warm goblin gradient
      ellipse(ctx, 40, headY, 13, 13, linGrad(ctx, 30, headY - 11, 50, headY + 12, [[0, "#e8ff9a"], [0.42, "#96c840"], [1, "#507822"]]), outline, 2);

      // Cool rim light on upper-left edge of head
      ctx.strokeStyle = "rgba(205, 245, 255, 0.55)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(40, headY, 11.5, -Math.PI * 0.95, -Math.PI * 0.35);
      ctx.stroke();

      // Forehead warm specular glint
      ellipse(ctx, 36, headY - 5, 3.5, 2, "rgba(255, 255, 255, 0.28)");

      // Ears
      poly(ctx, [[26, headY - 4], [18, headY - 12 + earY], [28, headY]], linGrad(ctx, 18, headY - 12, 28, headY, [[0, "#d8f26a"], [0.5, "#8aba48"], [1, "#507822"]]), outline, 1.2);
      poly(ctx, [[54, headY - 4], [62, headY - 12 + earY], [52, headY]], linGrad(ctx, 52, headY - 12, 62, headY, [[0, "#d8f26a"], [0.5, "#8aba48"], [1, "#507822"]]), outline, 1.2);
      poly(ctx, [[26, headY - 4], [20, headY - 10 + earY], [27, headY - 1]], "rgba(240, 175, 135, 0.45)");
      poly(ctx, [[54, headY - 4], [60, headY - 10 + earY], [53, headY - 1]], "rgba(240, 175, 135, 0.45)");
      // Cool rim on left ear
      ctx.strokeStyle = "rgba(205, 245, 255, 0.5)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(26, headY - 4);
      ctx.lineTo(18, headY - 12 + earY);
      ctx.stroke();

      // Face
      face(ctx, 40, headY);

      // Spear
      ctx.strokeStyle = "#8a6030";
      ctx.lineWidth = 3;
      ctx.beginPath();
      let sx0, sy0, sx1, sy1, armX, armY, armW, armH, armRot;
      if (f === 0) {
        sx0 = 54; sy0 = bodyY + 20; sx1 = 68; sy1 = bodyY - 16;
        armX = 48; armY = bodyY + 4; armW = 12; armH = 6; armRot = 0;
      } else if (f === 1) {
        sx0 = 52; sy0 = bodyY + 18; sx1 = 70; sy1 = bodyY - 13;
        armX = 48; armY = bodyY + 5; armW = 13; armH = 6; armRot = 0.1;
      } else if (f === 2) {
        sx0 = 56; sy0 = bodyY + 16; sx1 = 73; sy1 = bodyY - 18;
        armX = 49; armY = bodyY + 3; armW = 12; armH = 6; armRot = -0.1;
      } else {
        sx0 = 53; sy0 = bodyY + 19; sx1 = 67; sy1 = bodyY - 14;
        armX = 48; armY = bodyY + 4; armW = 12; armH = 6; armRot = 0;
      }
      ctx.moveTo(sx0, sy0);
      ctx.lineTo(sx1, sy1);
      ctx.stroke();

      // Spearhead
      const angle = Math.atan2(sy1 - sy0, sx1 - sx0);
      const tipLen = 10;
      const tX = sx1 + Math.cos(angle) * tipLen;
      const tY = sy1 + Math.sin(angle) * tipLen;
      const perpX = -Math.sin(angle) * 4.5;
      const perpY = Math.cos(angle) * 4.5;
      poly(ctx, [
        [tX, tY],
        [sx1 + perpX, sy1 + perpY],
        [sx1 - perpX, sy1 - perpY]
      ], linGrad(ctx, sx1 - 4, sy1 - 4, tX, tY, [[0, "#d8e2eb"], [0.6, "#ffffff"], [1, "#8a98a8"]]), "#3a4048", 1);
      ellipse(ctx, tX - 1, tY - 1, 1.5, 1.5, "#ffffff");

      // Contact AO behind front arm joint
      ellipse(ctx, armX, armY + armH / 2 + 1, 3.5, 2.2, "rgba(16, 28, 8, 0.45)");

      // Front arm
      ctx.save();
      ctx.translate(armX + armW / 2, armY + armH / 2);
      ctx.rotate(armRot);
      rounded(ctx, -armW / 2, -armH / 2, armW, armH, 3, skinLit(-armW / 2, -armH / 2, armW / 2, armH / 2), outline, 1.2);
      // Cool rim on front arm top edge
      ctx.strokeStyle = "rgba(205, 245, 255, 0.45)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-armW / 2 + 2, -armH / 2 + 0.8);
      ctx.lineTo(armW / 2 - 2, -armH / 2 + 0.8);
      ctx.stroke();
      ellipse(ctx, armW / 2 - 2, 0, 3, 3, skinLit(armW / 2 - 4, -2, armW / 2, 2), outline, 1);
      ctx.restore();
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

      // Spearhead
      poly(ctx, [[74, 46], [64, 42], [66, 52]], linGrad(ctx, 64, 42, 74, 52, [[0, "#d8e2eb"], [1, "#7a8898"]]), "#3a4048", 1);

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
      rounded(ctx, 33, 40.5, 4, 13, 1, "#4e3620");
      rounded(ctx, 32, 45, 6, 4, 1, "#d4af37", "#2a1e10", 0.8);

      // Head resting on dirt
      ellipse(ctx, 52, 45, 11, 10, linGrad(ctx, 44, 37, 60, 53, [[0, "#d8f26a"], [0.5, "#88bc3c"], [1, "#446820"]]), outline, 1.8);

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
    make("enemy_drift_dead", 80, 72, (ctx) => drawScoutDead(ctx));

    const drawBrute = (ctx, frame = 0) => {
      shadow(ctx, 40, 62, 24, 7, 0.42);
      const f = frame % 4;

      const bodyX = f === 0 ? 21 : f === 2 ? 23 : 22;
      const bodyY = (f === 1 || f === 3) ? 24 : 26;
      const headX = f === 0 ? 39 : f === 2 ? 41 : 40;
      const headY = (f === 1 || f === 3) ? 16 : 18;
      const headTilt = f === 0 ? -0.05 : f === 2 ? 0.05 : 0;

      const outline = "#3a2010";

      // 3-stop warm orc / brute hide gradients
      const bruteSkinLit = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#f8d2a6"], [0.45, "#c4763e"], [1, "#662e14"]]);
      const bruteSkinShaded = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#a4582a"], [0.5, "#6e3216"], [1, "#3c1608"]]);
      const bruteBootGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#563018"], [0.5, "#361a0c"], [1, "#1c0c04"]]);

      // Contact AO under heavy brute feet
      if (f === 0) {
        ellipse(ctx, 23.5, 55.5, 7.5, 2.2, "rgba(14, 8, 4, 0.75)");
        ellipse(ctx, 56.5, 53.5, 6, 1.8, "rgba(14, 8, 4, 0.55)");
      } else if (f === 1) {
        ellipse(ctx, 30.5, 56.5, 7.5, 2.4, "rgba(14, 8, 4, 0.78)");
        ellipse(ctx, 52.5, 48, 5, 1.6, "rgba(14, 8, 4, 0.35)");
      } else if (f === 2) {
        ellipse(ctx, 20.5, 53.5, 6, 1.8, "rgba(14, 8, 4, 0.55)");
        ellipse(ctx, 54.5, 55.5, 7.5, 2.2, "rgba(14, 8, 4, 0.75)");
      } else {
        ellipse(ctx, 32.5, 48, 5, 1.6, "rgba(14, 8, 4, 0.35)");
        ellipse(ctx, 48.5, 56.5, 7.5, 2.4, "rgba(14, 8, 4, 0.78)");
      }

      // Far fist / arm (Left side)
      let fArmX, fArmY, fArmR;
      if (f === 0) { fArmX = 16; fArmY = bodyY + 12; fArmR = 7; }
      else if (f === 1) { fArmX = 18; fArmY = bodyY + 10; fArmR = 6.5; }
      else if (f === 2) { fArmX = 22; fArmY = bodyY + 9; fArmR = 6; }
      else { fArmX = 19; fArmY = bodyY + 10; fArmR = 6.5; }
      ellipse(ctx, fArmX, fArmY, fArmR, fArmR, bruteSkinShaded(fArmX - fArmR, fArmY - fArmR, fArmX + fArmR, fArmY + fArmR), outline, 1.4);
      // Contact AO behind far arm
      ellipse(ctx, fArmX + 3, fArmY, 3, 4, "rgba(24, 10, 4, 0.5)");

      // Legs: heavy stride vs passing with 3-stop muscular shading
      if (f === 0) {
        // Left forward heavy plant
        poly(ctx, [[25, 43], [34, 43], [28, 55], [19, 54]], bruteSkinLit(25, 43, 19, 55), outline, 1.6);
        rounded(ctx, 17, 52, 13, 6.5, 2.5, bruteBootGrad(17, 52, 17, 58), outline, 1.2);
        // Cool rim on left forward leg
        ctx.strokeStyle = "rgba(205, 240, 255, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(25, 44);
        ctx.lineTo(19, 54);
        ctx.stroke();
        // Right trailing back
        poly(ctx, [[46, 43], [54, 43], [59, 52], [52, 53]], bruteSkinShaded(46, 43, 59, 52), outline, 1.6);
        rounded(ctx, 51, 50, 11, 6, 2.5, bruteBootGrad(51, 50, 51, 56), outline, 1.2);
      } else if (f === 1) {
        // Left planted straight
        rounded(ctx, 26, 41, 9, 15, 4, bruteSkinLit(26, 41, 35, 56), outline, 1.6);
        rounded(ctx, 24, 53, 13, 6.5, 2.5, bruteBootGrad(24, 53, 24, 59), outline, 1.2);
        // Cool rim on left leg
        ctx.strokeStyle = "rgba(205, 240, 255, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(26, 42);
        ctx.lineTo(26, 53);
        ctx.stroke();
        // Right lifted passing
        poly(ctx, [[46, 41], [54, 41], [55, 47], [48, 48]], bruteSkinShaded(46, 41, 55, 47), outline, 1.6);
        rounded(ctx, 47, 45, 11, 6, 2.5, bruteBootGrad(47, 45, 47, 51), outline, 1.2);
      } else if (f === 2) {
        // Left trailing back
        poly(ctx, [[26, 43], [34, 43], [22, 52], [16, 51]], bruteSkinShaded(26, 43, 22, 52), outline, 1.6);
        rounded(ctx, 15, 50, 11, 6, 2.5, bruteBootGrad(15, 50, 15, 56), outline, 1.2);
        // Right forward heavy plant
        poly(ctx, [[45, 43], [54, 43], [58, 55], [49, 54]], bruteSkinLit(45, 43, 58, 55), outline, 1.6);
        rounded(ctx, 48, 52, 13, 6.5, 2.5, bruteBootGrad(48, 52, 48, 58), outline, 1.2);
      } else {
        // Left lifted passing
        poly(ctx, [[26, 41], [34, 41], [35, 47], [28, 48]], bruteSkinShaded(26, 41, 35, 47), outline, 1.6);
        rounded(ctx, 27, 45, 11, 6, 2.5, bruteBootGrad(27, 45, 27, 51), outline, 1.2);
        // Right planted straight
        rounded(ctx, 44, 41, 9, 15, 4, bruteSkinLit(44, 41, 53, 56), outline, 1.6);
        rounded(ctx, 42, 53, 13, 6.5, 2.5, bruteBootGrad(42, 53, 42, 59), outline, 1.2);
      }

      // Contact AO under groin / pelvis onto thighs
      ellipse(ctx, bodyX + 18, bodyY + 26, 15, 3.5, "rgba(24, 10, 4, 0.55)");

      // Torso with 3-stop muscular volume
      rounded(ctx, bodyX, bodyY, 36, 26, 10, linGrad(ctx, bodyX, bodyY, bodyX + 36, bodyY + 26, [[0, "#fae0bc"], [0.42, "#c8783c"], [1, "#5e2810"]]), outline, 2.2);

      // Cool rim on upper-left torso flank
      ctx.strokeStyle = "rgba(205, 240, 255, 0.4)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(bodyX + 1, bodyY + 12);
      ctx.lineTo(bodyX + 1, bodyY + 22);
      ctx.stroke();

      // Chest muscle lines with deep crease AO in sternum and under pecs
      ctx.strokeStyle = "rgba(40, 14, 6, 0.48)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(bodyX + 18, bodyY + 6);
      ctx.lineTo(bodyX + 18, bodyY + 18);
      ctx.moveTo(bodyX + 10, bodyY + 12);
      ctx.quadraticCurveTo(bodyX + 18, bodyY + 16, bodyX + 26, bodyY + 12);
      ctx.stroke();

      // Shoulders with spherical 3D volume
      const leftShX = bodyX + 2;
      const leftShY = bodyY + 6;
      const rightShX = bodyX + 34;
      const rightShY = bodyY + 6;

      // Shoulder attachment contact AO
      ellipse(ctx, leftShX + 3, leftShY + 2, 4, 5, "rgba(24, 10, 4, 0.45)");
      ellipse(ctx, rightShX - 3, rightShY + 2, 4, 5, "rgba(24, 10, 4, 0.45)");

      ellipse(ctx, leftShX, leftShY, 8.5, 8.5, radGrad(ctx, leftShX - 2.5, leftShY - 2.5, 1, 9, [[0, "#fce4c4"], [0.45, "#c8783c"], [1, "#5e2810"]]), outline, 1.5);
      ellipse(ctx, rightShX, rightShY, 8.5, 8.5, radGrad(ctx, rightShX - 2.5, rightShY - 2.5, 1, 9, [[0, "#fce4c4"], [0.45, "#c8783c"], [1, "#5e2810"]]), outline, 1.5);

      // Cool rim light on left shoulder
      ctx.strokeStyle = "rgba(205, 240, 255, 0.55)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(leftShX, leftShY, 7.5, -Math.PI * 0.9, -Math.PI * 0.25);
      ctx.stroke();

      // Warm highlight on right shoulder
      ctx.strokeStyle = "rgba(255, 240, 200, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(rightShX, rightShY, 6.5, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();

      // Contact AO under massive jaw onto upper chest
      ellipse(ctx, headX, headY + 13, 13.5, 4.2, "rgba(24, 10, 4, 0.65)");

      // Head
      ctx.save();
      ctx.translate(headX, headY);
      ctx.rotate(headTilt);
      ellipse(ctx, 0, 0, 15, 14, linGrad(ctx, -12, -11, 12, 13, [[0, "#fce4c4"], [0.45, "#cc7a3e"], [1, "#662e14"]]), outline, 2);

      // Cool rim light on upper-left curve of head
      ctx.strokeStyle = "rgba(205, 240, 255, 0.55)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 13.5, -Math.PI * 0.95, -Math.PI * 0.35);
      ctx.stroke();

      // Brow ridge highlight
      ctx.strokeStyle = "rgba(255, 245, 210, 0.38)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-10, -6);
      ctx.lineTo(10, -6);
      ctx.stroke();

      // Tusks / Horns with 3-stop ivory gradient
      ellipse(ctx, -14, -8, 5, 7.5, linGrad(ctx, -17, -12, -11, -2, [[0, "#ffffff"], [0.5, "#faecc8"], [1, "#8c6c44"]]), "#4a3018", 1.2);
      ellipse(ctx, 14, -8, 5, 7.5, linGrad(ctx, 11, -12, 17, -2, [[0, "#ffffff"], [0.5, "#faecc8"], [1, "#8c6c44"]]), "#4a3018", 1.2);
      ellipse(ctx, -14.5, -9, 2, 4, "#ffffff");
      ellipse(ctx, 13.5, -9, 2, 4, "#ffffff");

      face(ctx, 0, 0, "#f8f0c8", "#101008", true);
      ctx.restore();

      // Club & Right Arm
      let clubX, clubY, clubRot;
      if (f === 0) {
        clubX = 61; clubY = bodyY + 2; clubRot = -0.15;
      } else if (f === 1) {
        clubX = 62; clubY = bodyY + 4; clubRot = 0.05;
      } else if (f === 2) {
        clubX = 63; clubY = bodyY + 7; clubRot = 0.25;
      } else {
        clubX = 61; clubY = bodyY + 3; clubRot = -0.05;
      }

      ctx.save();
      ctx.translate(clubX, clubY);
      ctx.rotate(clubRot);
      // Shaft / handle
      rounded(ctx, -4, 0, 8, 26, 3, linGrad(ctx, -4, 0, 4, 26, [[0, "#9c6e48"], [0.5, "#6a4022"], [1, "#2e1608"]]), "#1a1008", 1.5);
      // Club head
      ellipse(ctx, 0, -2, 9.5, 8.5, linGrad(ctx, -9, -9, 9, 6, [[0, "#8a5c3c"], [0.5, "#5c3820"], [1, "#26140a"]]), "#1a1008", 1.5);
      // Wood grain & speckles
      speckles(ctx, -6, -8, 12, 14, 7, "rgba(0,0,0,.35)", 1.4);
      speckles(ctx, -5, -7, 10, 12, 4, "rgba(255,230,180,.25)", 1.2);
      // Cool rim on upper-left club curve
      ctx.strokeStyle = "rgba(205, 240, 255, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, -2, 8.5, -Math.PI * 0.9, -Math.PI * 0.3);
      ctx.stroke();
      // Iron studs on club
      for (const [ix, iy] of [[-6, -2], [6, -2], [0, -8], [0, 4]]) {
        ellipse(ctx, ix, iy, 1.8, 1.8, linGrad(ctx, ix - 1, iy - 1, ix + 1, iy + 1, [[0, "#fff0b0"], [0.5, "#d0a870"], [1, "#3a2010"]]), "#2a1808", 0.8);
      }
      // Right fist holding club handle
      ellipse(ctx, 0, 10, 4.5, 4.5, bruteSkinLit(-4, 8, 4, 14), outline, 1.2);
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
      ctx.restore();

      // Back leg & boot
      poly(ctx, [[18, 46], [8, 52], [10, 58], [22, 53]], bruteSkinShaded(8, 46, 22, 58), outline, 1.4);
      rounded(ctx, 4, 52, 9, 5.5, 2, "#361a0c", outline, 1.1);

      // Front leg & boot
      poly(ctx, [[24, 48], [16, 56], [20, 60], [28, 54]], bruteSkinLit(16, 48, 28, 60), outline, 1.4);
      rounded(ctx, 13, 56, 10, 5.5, 2, "#361a0c", outline, 1.1);

      // Heavy muscular torso collapsed forward
      rounded(ctx, 24, 38, 34, 20, 8, bruteSkinLit(24, 38, 58, 58), outline, 2.2);

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
      shadow(ctx, 40, 62, 22, 6);
      const f = frame % 4;
      const bodyY = (f === 1 || f === 3) ? 25 : 27;
      const headY = (f === 1 || f === 3) ? 17 : 19;

      const skin = "#8a9098";
      const skinDark = "#5e6670";
      const outline = "#2a3038";
      const boot = "#3a4048";
      const bootDark = "#242a30";

      // Legs: stride contact vs passing
      if (f === 0) {
        // Left forward contact
        poly(ctx, [[27, 43], [34, 43], [26, 54], [19, 54]], skin, outline, 1.4);
        rounded(ctx, 16, 52, 12, 5.5, 2, boot, outline, 1.1);
        // Right back trailing
        poly(ctx, [[42, 43], [49, 43], [54, 52], [47, 53]], skinDark, outline, 1.4);
        rounded(ctx, 46, 50, 10, 5, 2, bootDark, outline, 1.1);
      } else if (f === 1) {
        // Left planted straight
        rounded(ctx, 28, 41, 8, 14, 3, skin, outline, 1.4);
        rounded(ctx, 26, 53, 12, 5.5, 2, boot, outline, 1.1);
        // Right lifted passing knee
        poly(ctx, [[42, 40], [49, 40], [51, 47], [44, 48]], skinDark, outline, 1.4);
        rounded(ctx, 44, 45, 10, 5, 2, bootDark, outline, 1.1);
      } else if (f === 2) {
        // Left back trailing
        poly(ctx, [[27, 43], [34, 43], [22, 53], [15, 52]], skinDark, outline, 1.4);
        rounded(ctx, 14, 50, 10, 5, 2, bootDark, outline, 1.1);
        // Right forward contact
        poly(ctx, [[42, 43], [49, 43], [54, 54], [47, 54]], skin, outline, 1.4);
        rounded(ctx, 45, 52, 12, 5.5, 2, boot, outline, 1.1);
      } else {
        // Left lifted passing knee
        poly(ctx, [[27, 40], [34, 40], [36, 47], [29, 48]], skinDark, outline, 1.4);
        rounded(ctx, 28, 45, 10, 5, 2, bootDark, outline, 1.1);
        // Right planted straight
        rounded(ctx, 41, 41, 8, 14, 3, skin, outline, 1.4);
        rounded(ctx, 39, 53, 12, 5.5, 2, boot, outline, 1.1);
      }

      // Plate body
      rounded(ctx, 26, bodyY, 28, 24, 6, linGrad(ctx, 26, bodyY, 54, bodyY + 24, [[0, "#e8eef0"], [0.5, "#98a0a8"], [1, "#4a545c"]]), outline, 2.2);
      // Breastplate center ridge & highlight
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(40, bodyY + 3);
      ctx.lineTo(40, bodyY + 20);
      ctx.stroke();

      // Helmet
      ellipse(ctx, 40, headY, 14, 13, linGrad(ctx, 28, headY - 10, 52, headY + 12, [[0, "#f0f4f8"], [1, "#6a747c"]]), outline, 2);
      rounded(ctx, 28, headY - 6, 24, 8, 3, "#4a545c", "#1a2028", 1);
      // Visor slit
      rounded(ctx, 32, headY, 16, 4, 1, "#0a0c10");
      // Specular rim light on helmet
      ctx.strokeStyle = "rgba(255,255,255,.35)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(40, headY, 12, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();

      // Kite shield (left arm side)
      let shDx = 0, shDy = 0, shRot = 0;
      if (f === 0) { shDx = 0; shDy = 0; shRot = 0; }
      else if (f === 1) { shDx = -1; shDy = -2; shRot = -0.06; }
      else if (f === 2) { shDx = 1; shDy = 1; shRot = 0.05; }
      else { shDx = 0; shDy = -1; shRot = -0.02; }

      ctx.save();
      ctx.translate(26 + shDx, bodyY + 13 + shDy);
      ctx.rotate(shRot);
      poly(
        ctx,
        [[-8, -13], [8, -15], [10, 11], [0, 19], [-10, 11]],
        linGrad(ctx, -10, -15, 10, 19, [[0, "#d0d8e0"], [0.5, "#708090"], [1, "#384048"]]),
        "#1a2028",
        2
      );
      poly(ctx, [[-4, -7], [4, -7], [2, 5], [-2, 5]], "#c0a040", "#4a3810", 1);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-7, -12);
      ctx.lineTo(7, -14);
      ctx.stroke();
      ctx.restore();

      // Sword (right arm side)
      let sw0x, sw0y, sw1x, sw1y;
      if (f === 0) {
        sw0x = 54; sw0y = bodyY + 22; sw1x = 64; sw1y = bodyY - 8;
      } else if (f === 1) {
        sw0x = 53; sw0y = bodyY + 20; sw1x = 62; sw1y = bodyY - 12;
      } else if (f === 2) {
        sw0x = 55; sw0y = bodyY + 18; sw1x = 66; sw1y = bodyY - 6;
      } else {
        sw0x = 54; sw0y = bodyY + 21; sw1x = 63; sw1y = bodyY - 10;
      }

      ctx.strokeStyle = "#c0c8d0";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(sw0x, sw0y);
      ctx.lineTo(sw1x, sw1y);
      ctx.stroke();
      // Edge shine
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sw0x - 0.5, sw0y);
      ctx.lineTo(sw1x - 0.5, sw1y);
      ctx.stroke();
      // Guard & hilt
      ctx.save();
      ctx.translate(sw0x, sw0y);
      const swAngle = Math.atan2(sw1y - sw0y, sw1x - sw0x);
      ctx.rotate(swAngle + Math.PI / 2);
      rounded(ctx, -6, -2, 12, 4, 1.5, "#c0a040", "#3a2a10", 1);
      rounded(ctx, -2, 2, 4, 7, 1.5, "#6a4830", "#2a1810", 1);
      ellipse(ctx, 0, 9, 2.5, 2.5, "#d4af37", "#3a2a10", 0.8);
      // Right armored hand holding sword
      ellipse(ctx, 0, 3, 3.5, 3.5, skin, outline, 1.2);
      ctx.restore();
    };

    const drawShieldDead = (ctx) => {
      shadow(ctx, 40, 58, 32, 6, 0.4);
      const outline = "#1a2028";

      // Fallen kite shield tilted flat
      poly(
        ctx,
        [[14, 52], [38, 46], [46, 57], [32, 62], [16, 58]],
        linGrad(ctx, 14, 46, 46, 62, [[0, "#d0d8e0"], [0.5, "#708090"], [1, "#384048"]]),
        "#1a2028",
        2
      );
      poly(ctx, [[22, 51], [32, 48], [35, 55], [25, 57]], "#c0a040", "#4a3810", 1);
      ctx.strokeStyle = "#1a2028";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(20, 49);
      ctx.lineTo(34, 58);
      ctx.stroke();

      // Dropped steel sword
      ctx.strokeStyle = "#c0c8d0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(54, 56);
      ctx.lineTo(74, 53);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(54, 55.5);
      ctx.lineTo(74, 52.5);
      ctx.stroke();
      rounded(ctx, 50, 54, 5, 5, 1.5, "#c0a040", "#3a2a10", 1);

      // Crumpled plate armor body
      rounded(ctx, 32, 40, 24, 16, 5, linGrad(ctx, 32, 40, 56, 56, [[0, "#e8eef0"], [0.5, "#98a0a8"], [1, "#4a545c"]]), outline, 2);
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(34, 48);
      ctx.lineTo(54, 48);
      ctx.stroke();

      // Armored legs slumped back
      poly(ctx, [[48, 48], [62, 50], [60, 55], [46, 53]], "#8a9098", outline, 1.3);
      rounded(ctx, 58, 50, 9, 5, 2, "#3a4048", outline, 1);

      // Helmet fallen askew
      ellipse(ctx, 30, 42, 11, 10, linGrad(ctx, 22, 34, 38, 50, [[0, "#f0f4f8"], [1, "#6a747c"]]), outline, 2);
      rounded(ctx, 24, 42, 12, 3.5, 1, "#0a0c10");
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(26, 36);
      ctx.lineTo(34, 38);
      ctx.stroke();
    };

    make("enemy_shield", 80, 72, (ctx) => drawShield(ctx, 0));
    make("enemy_shield_w0", 80, 72, (ctx) => drawShield(ctx, 0));
    make("enemy_shield_w1", 80, 72, (ctx) => drawShield(ctx, 1));
    make("enemy_shield_w2", 80, 72, (ctx) => drawShield(ctx, 2));
    make("enemy_shield_w3", 80, 72, (ctx) => drawShield(ctx, 3));
    make("enemy_shield_dead", 80, 72, (ctx) => drawShieldDead(ctx));

    const drawEmber = (ctx, frame = 0) => {
      const f = frame % 4;
      const shY = (f === 1 || f === 3) ? 61 : 62;
      const shR = (f === 1 || f === 3) ? 16 : 18;
      shadow(ctx, 40, shY, shR, 5, 0.3);

      let polyPoints, coreX, coreY, coreR, eyeY, embers;
      if (f === 0) {
        // Base / plant left: tip leaning left, left base skirt forward
        polyPoints = [
          [38, 5], [23, 27], [29, 29], [18, 48], [33, 42],
          [39, 58], [47, 43], [60, 49], [51, 31], [57, 28]
        ];
        coreX = 39; coreY = 36; coreR = 15; eyeY = 32;
        embers = [[22, 18, 3], [58, 22, 2.5], [30, 10, 2], [52, 12, 2.5], [44, 4, 2]];
      } else if (f === 1) {
        // Rise / pass: tall vertical flame flare, core lifted
        polyPoints = [
          [41, 3], [25, 25], [31, 28], [22, 46], [35, 39],
          [41, 55], [48, 40], [58, 46], [52, 28], [58, 25]
        ];
        coreX = 41; coreY = 34; coreR = 16; eyeY = 30;
        embers = [[20, 24, 2.5], [62, 18, 3], [34, 6, 2.5], [56, 10, 2], [42, 2, 2]];
      } else if (f === 2) {
        // Plant right: tip leaning right, right base skirt forward
        polyPoints = [
          [43, 6], [26, 29], [32, 31], [21, 50], [35, 43],
          [42, 59], [48, 43], [63, 47], [52, 29], [58, 27]
        ];
        coreX = 42; coreY = 36; coreR = 15; eyeY = 32;
        embers = [[18, 20, 3], [56, 25, 2.5], [28, 12, 2], [50, 8, 3], [46, 5, 2]];
      } else {
        // Compression / recover: wide fiery burst, low center
        polyPoints = [
          [40, 4], [22, 26], [28, 29], [17, 47], [33, 41],
          [40, 56], [47, 41], [61, 48], [49, 30], [56, 26]
        ];
        coreX = 40; coreY = 35; coreR = 16.5; eyeY = 31;
        embers = [[24, 15, 2.5], [60, 20, 2], [32, 8, 3], [54, 14, 2.5], [40, 3, 2.5]];
      }

      // Outer flame body
      poly(
        ctx,
        polyPoints,
        linGrad(ctx, 40, polyPoints[0][1], 40, 58, [[0, "#fff8c0"], [0.35, "#ffb040"], [0.7, "#e04820"], [1, "#601808"]]),
        "#4a1808",
        2
      );

      // Inner glowing core
      ellipse(ctx, coreX, coreY, coreR, coreR + 2, radGrad(ctx, coreX - 3, coreY - 4, 2, coreR + 3, [[0, "#fff8e0"], [0.45, "#ff9040"], [1, "rgba(160,30,10,.15)"]]));

      // Inner bright flame tongue
      poly(
        ctx,
        [[coreX, coreY - 14], [coreX - 7, coreY + 6], [coreX, coreY + 12], [coreX + 7, coreY + 6]],
        linGrad(ctx, coreX, coreY - 14, coreX, coreY + 12, [[0, "#ffffff"], [0.5, "#fff0a0"], [1, "rgba(255,160,40,0)"]])
      );

      // Eyes with burning gaze
      const eyeDx = f === 0 ? -1 : f === 2 ? 1 : 0;
      ellipse(ctx, 34 + eyeDx, eyeY, 3, 4, "#fff8c0");
      ellipse(ctx, 46 + eyeDx, eyeY, 3, 4, "#fff8c0");
      ellipse(ctx, 34 + eyeDx, eyeY, 1.5, 2, "#401008");
      ellipse(ctx, 46 + eyeDx, eyeY, 1.5, 2, "#401008");

      // Sparks / orbiting ember motes
      for (const [x, y, r] of embers) {
        ellipse(ctx, x, y, r, r, "rgba(255,210,90,.85)");
        ellipse(ctx, x - 0.3, y - 0.3, r * 0.45, r * 0.45, "#ffffff");
      }
    };

    const drawEmberDead = (ctx) => {
      shadow(ctx, 40, 58, 26, 6, 0.45);
      ellipse(ctx, 40, 56, 22, 5, "rgba(20, 8, 4, 0.65)");

      // Crumbled charcoal cinder mound
      poly(
        ctx,
        [[18, 56], [26, 44], [38, 48], [46, 42], [58, 46], [64, 56], [42, 60]],
        linGrad(ctx, 20, 42, 60, 60, [[0, "#483834"], [0.5, "#2a1c18"], [1, "#140a08"]]),
        "#1a0c06",
        2
      );

      // Fading magma veins in cracks
      ctx.strokeStyle = "#ff5511";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(28, 52);
      ctx.lineTo(38, 50);
      ctx.lineTo(44, 54);
      ctx.moveTo(46, 48);
      ctx.lineTo(54, 52);
      ctx.stroke();

      ctx.strokeStyle = "#ffcc33";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, 52);
      ctx.lineTo(37, 50);
      ctx.moveTo(47, 49);
      ctx.lineTo(52, 52);
      ctx.stroke();

      // Dimmed eyes
      ellipse(ctx, 36, 49, 2.5, 2, "#401808");
      ellipse(ctx, 46, 47, 2.5, 2, "#401808");
      ellipse(ctx, 36, 49, 1, 0.8, "rgba(255, 120, 40, 0.5)");
      ellipse(ctx, 46, 47, 1, 0.8, "rgba(255, 120, 40, 0.5)");

      // Cool grey smoke wisps rising
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
      shadow(ctx, 40, 60, 22, 6);
      const f = frame % 4;
      const headY = (f === 1 || f === 3) ? 27 : 28;
      const abdY = (f === 1 || f === 3) ? 43 : 44;

      // Spider legs - alternating tripod gait
      ctx.strokeStyle = "#4a2030";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";

      let legCoords;
      if (f === 0) {
        legCoords = [
          [28, headY + 8, 8, 25],   // L1 forward plant
          [28, headY + 12, 11, 46], // L2 mid back
          [28, headY + 16, 9, 58],  // L3 back plant
          [52, headY + 8, 72, 31],  // R1 front mid
          [52, headY + 12, 73, 42], // R2 mid forward plant
          [52, headY + 16, 66, 54], // R3 back mid
        ];
      } else if (f === 1) {
        legCoords = [
          [28, headY + 8, 12, 28],  // L1 lifted pass
          [28, headY + 12, 8, 44],  // L2 planted
          [28, headY + 16, 14, 55], // L3 lifted
          [52, headY + 8, 70, 26],  // R1 reaching
          [52, headY + 12, 70, 46], // R2 passing
          [52, headY + 16, 70, 57], // R3 reaching
        ];
      } else if (f === 2) {
        legCoords = [
          [28, headY + 8, 12, 31],  // L1 front mid
          [28, headY + 12, 7, 42],  // L2 mid forward plant
          [28, headY + 16, 14, 54], // L3 back mid
          [52, headY + 8, 72, 25],  // R1 forward plant
          [52, headY + 12, 69, 46], // R2 mid back
          [52, headY + 16, 71, 58], // R3 back plant
        ];
      } else {
        legCoords = [
          [28, headY + 8, 10, 26],  // L1 reaching
          [28, headY + 12, 10, 46], // L2 passing
          [28, headY + 16, 10, 57], // L3 reaching
          [52, headY + 8, 68, 28],  // R1 lifted pass
          [52, headY + 12, 72, 44], // R2 planted
          [52, headY + 16, 66, 55], // R3 lifted
        ];
      }

      for (const [x0, y0, x1, y1] of legCoords) {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        const midY = Math.min(y0, y1) - 8;
        ctx.quadraticCurveTo((x0 + x1) / 2, midY, x1, y1);
        ctx.stroke();
      }

      // Abdomen
      ellipse(ctx, 40, abdY, 16, 14, linGrad(ctx, 28, abdY - 10, 52, abdY + 12, [[0, "#f0b0c8"], [0.5, "#b05878"], [1, "#501828"]]), "#301018", 2);
      // Abdomen pattern spots
      ellipse(ctx, 40, abdY - 4, 3.5, 2.5, "rgba(255,220,240,.45)");
      ellipse(ctx, 34, abdY + 2, 2.5, 2, "rgba(255,220,240,.35)");
      ellipse(ctx, 46, abdY + 2, 2.5, 2, "rgba(255,220,240,.35)");

      // Thorax + head
      ellipse(ctx, 40, headY, 12, 11, linGrad(ctx, 30, headY - 8, 50, headY + 10, [[0, "#f8c0d0"], [1, "#803050"]]), "#301018", 2);

      // Multi eyes (cluster of glowing spider eyes)
      for (const [dx, dy] of [[-5, -2], [5, -2], [-3, 3], [3, 3], [0, -5]]) {
        ellipse(ctx, 40 + dx, headY - 2 + dy, 1.8, 1.8, "#ffe060");
        ellipse(ctx, 40 + dx, headY - 2 + dy, 0.8, 0.8, "#101008");
      }

      // Fangs
      const fangSpread = (f === 1 || f === 3) ? 1 : 0;
      poly(ctx, [[36 - fangSpread, headY + 6], [33 - fangSpread, headY + 12], [38 - fangSpread, headY + 8]], "#f0e0f0", "#401828", 1);
      poly(ctx, [[44 + fangSpread, headY + 6], [47 + fangSpread, headY + 12], [42 + fangSpread, headY + 8]], "#f0e0f0", "#401828", 1);
    };

    const drawBroodDead = (ctx) => {
      shadow(ctx, 40, 58, 24, 6, 0.35);

      // Curled spider legs tightly tucked
      ctx.strokeStyle = "#381420";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";

      // Left curled legs
      ctx.beginPath(); ctx.moveTo(32, 48); ctx.quadraticCurveTo(18, 38, 22, 30); ctx.quadraticCurveTo(24, 24, 30, 26); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(34, 52); ctx.quadraticCurveTo(14, 48, 18, 36); ctx.quadraticCurveTo(22, 30, 28, 32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(36, 55); ctx.quadraticCurveTo(16, 58, 22, 48); ctx.quadraticCurveTo(26, 42, 32, 44); ctx.stroke();

      // Right curled legs
      ctx.beginPath(); ctx.moveTo(48, 48); ctx.quadraticCurveTo(62, 38, 58, 30); ctx.quadraticCurveTo(56, 24, 50, 26); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(46, 52); ctx.quadraticCurveTo(66, 48, 62, 36); ctx.quadraticCurveTo(58, 30, 52, 32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(44, 55); ctx.quadraticCurveTo(64, 58, 58, 48); ctx.quadraticCurveTo(54, 42, 48, 44); ctx.stroke();

      // Deflated abdomen
      ellipse(ctx, 40, 50, 15, 10, linGrad(ctx, 28, 42, 52, 58, [[0, "#d888a4"], [0.5, "#904060"], [1, "#381020"]]), "#280a14", 2);
      ctx.strokeStyle = "#ffbad0";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(36, 48);
      ctx.lineTo(42, 52);
      ctx.lineTo(46, 49);
      ctx.stroke();

      // Cephalothorax & head
      ellipse(ctx, 40, 42, 10, 8, linGrad(ctx, 32, 36, 48, 48, [[0, "#e89cb4"], [1, "#68203c"]]), "#280a14", 1.8);

      // Extinguished cluster eyes
      for (const [dx, dy] of [[-4, -1], [4, -1], [-2, 2], [2, 2], [0, -3]]) {
        ellipse(ctx, 40 + dx, 41 + dy, 1.4, 1.4, "#806858");
      }

      // Limp fangs
      poly(ctx, [[37, 46], [35, 52], [38, 48]], "#d8c0d0", "#301018", 0.8);
      poly(ctx, [[43, 46], [45, 52], [42, 48]], "#d8c0d0", "#301018", 0.8);
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
      shadow(ctx, 40, 62, 20, 6);
      const f = frame % 4;
      const headOffset = (f === 1 || f === 3) ? -1 : 0;

      const robeMain = "#6a5090";
      const robeDark = "#2a1848";
      const outline = "#201038";

      // Robe skirt & walking feet beneath
      if (f === 0) {
        rounded(ctx, 25, 47, 8, 8, 2.5, "#3a2818", outline, 1);
        rounded(ctx, 44, 46, 7, 7, 2, "#281a10", outline, 1);
      } else if (f === 1) {
        rounded(ctx, 26, 47, 8, 8, 2.5, "#3a2818", outline, 1);
        rounded(ctx, 42, 42, 7, 7, 2, "#281a10", outline, 1);
      } else if (f === 2) {
        rounded(ctx, 23, 46, 7, 7, 2, "#281a10", outline, 1);
        rounded(ctx, 42, 47, 8, 8, 2.5, "#3a2818", outline, 1);
      } else {
        rounded(ctx, 27, 42, 7, 7, 2, "#281a10", outline, 1);
        rounded(ctx, 40, 47, 8, 8, 2.5, "#3a2818", outline, 1);
      }

      // Flowing robe body
      let robePoly;
      if (f === 0) {
        robePoly = [[24, 28], [56, 28], [60, 53], [39, 58], [19, 55]];
      } else if (f === 1) {
        robePoly = [[24, 27], [56, 27], [58, 54], [40, 59], [21, 54]];
      } else if (f === 2) {
        robePoly = [[24, 28], [56, 28], [62, 55], [41, 57], [22, 53]];
      } else {
        robePoly = [[24, 27], [56, 27], [59, 54], [40, 58], [20, 54]];
      }

      poly(
        ctx,
        robePoly,
        linGrad(ctx, 24, 28, 56, 58, [[0, "#d0c0ff"], [0.45, "#7858c8"], [1, "#302058"]]),
        outline,
        2.2
      );

      // Left arm / hand curse gesture
      let handX, handY, handRot;
      if (f === 0) { handX = 18; handY = 35; handRot = -0.1; }
      else if (f === 1) { handX = 15; handY = 30; handRot = -0.3; }
      else if (f === 2) { handX = 19; handY = 37; handRot = 0.1; }
      else { handX = 16; handY = 33; handRot = -0.15; }

      ctx.save();
      ctx.translate(handX, handY);
      ctx.rotate(handRot);
      rounded(ctx, -2, -3, 10, 6, 3, robeMain, robeDark, 1.2);
      ellipse(ctx, -2, 0, 3, 3, "#d0c0ff", outline, 0.8);
      ctx.restore();

      // Hood
      const hoodTop = 8 + headOffset;
      const hoodMid = 20 + headOffset;
      const hoodBot = 30 + headOffset;
      poly(
        ctx,
        [[24, hoodBot], [40, hoodTop], [56, hoodBot], [48, hoodBot + 4], [40, hoodMid], [32, hoodBot + 4]],
        linGrad(ctx, 24, hoodTop, 56, hoodBot + 4, [[0, "#e8d8ff"], [1, "#4a3080"]]),
        outline,
        2
      );

      // Face shadow & glowing eyes
      const faceY = 28 + headOffset;
      ellipse(ctx, 40, faceY, 8, 7, "#1a1030");
      ellipse(ctx, 36, faceY, 2, 2.2, "#d090ff");
      ellipse(ctx, 44, faceY, 2, 2.2, "#d090ff");
      ellipse(ctx, 36, faceY, 1, 1, "#ffffff");
      ellipse(ctx, 44, faceY, 1, 1, "#ffffff");

      // Staff with curse pose changes
      let st0x, st0y, st1x, st1y, orbR;
      if (f === 0) {
        st0x = 58; st0y = 58; st1x = 66; st1y = 12; orbR = 8;
      } else if (f === 1) {
        // Staff raised high & glowing
        st0x = 57; st0y = 56; st1x = 68; st1y = 8; orbR = 9.5;
      } else if (f === 2) {
        // Staff thrust forward
        st0x = 59; st0y = 58; st1x = 64; st1y = 14; orbR = 8;
      } else {
        st0x = 58; st0y = 57; st1x = 65; st1y = 10; orbR = 8.5;
      }

      ctx.strokeStyle = "#6a4830";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(st0x, st0y);
      ctx.lineTo(st1x, st1y);
      ctx.stroke();

      // Right hand holding staff
      ellipse(ctx, (st0x * 0.4 + st1x * 0.6), (st0y * 0.4 + st1y * 0.6), 3.5, 3.5, robeMain, outline, 1);

      // Staff magical orb
      ellipse(
        ctx,
        st1x,
        st1y,
        orbR,
        orbR,
        radGrad(ctx, st1x - 2, st1y - 2, 1, orbR, [[0, "#ffffff"], [0.4, "#c0a0ff"], [1, "rgba(80,40,160,.15)"]]),
        "#e0d0ff",
        1.5
      );
      if (f === 1) {
        // Extra aura ring when casting
        ctx.strokeStyle = "rgba(220,180,255,.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(st1x, st1y, orbR + 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Floating rune motes
      let motes;
      if (f === 0) motes = [[22, 20], [30, 14], [50, 16]];
      else if (f === 1) motes = [[18, 14], [32, 8], [54, 10], [14, 26]];
      else if (f === 2) motes = [[24, 24], [28, 18], [48, 18]];
      else motes = [[20, 18], [30, 12], [52, 14], [46, 22]];

      for (const [mx, my] of motes) {
        ellipse(ctx, mx, my, 2.2, 2.2, "rgba(220,170,255,.85)");
        ellipse(ctx, mx, my, 1, 1, "#ffffff");
      }
    };

    const drawHexerDead = (ctx) => {
      shadow(ctx, 40, 58, 28, 6, 0.4);

      // Collapsed robe puddle
      poly(
        ctx,
        [[16, 56], [28, 44], [46, 42], [62, 48], [66, 58], [42, 62]],
        linGrad(ctx, 16, 42, 66, 62, [[0, "#b8a0f0"], [0.5, "#6040a8"], [1, "#201040"]]),
        "#140828",
        2.2
      );
      ctx.strokeStyle = "rgba(20, 8, 40, 0.5)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(32, 46); ctx.lineTo(44, 58);
      ctx.moveTo(48, 45); ctx.lineTo(56, 56);
      ctx.stroke();

      // Empty deflated hood
      poly(
        ctx,
        [[24, 46], [36, 36], [48, 46], [40, 52], [28, 50]],
        linGrad(ctx, 24, 36, 48, 52, [[0, "#d0c0f8"], [1, "#402070"]]),
        "#140828",
        1.8
      );
      ellipse(ctx, 36, 46, 6, 4, "#0e061c");

      // Broken staff
      ctx.strokeStyle = "#5a3c24";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(18, 58);
      ctx.lineTo(58, 44);
      ctx.stroke();

      // Shattered crystal orb shards
      poly(ctx, [[60, 43], [66, 40], [64, 46]], "#e0d0ff", "#7040b0", 1);
      poly(ctx, [[62, 48], [68, 46], [65, 51]], "#c0a0ff", "#502090", 1);
      ellipse(ctx, 64, 45, 1.5, 1.5, "#ffffff");

      // Fading magic dust
      for (const [sx, sy] of [[22, 42], [48, 38], [54, 58], [30, 60]]) {
        ellipse(ctx, sx, sy, 1.4, 1.4, "rgba(210, 160, 255, 0.7)");
      }
    };

    make("enemy_hexer", 80, 72, (ctx) => drawHexer(ctx, 0));
    make("enemy_hexer_w0", 80, 72, (ctx) => drawHexer(ctx, 0));
    make("enemy_hexer_w1", 80, 72, (ctx) => drawHexer(ctx, 1));
    make("enemy_hexer_w2", 80, 72, (ctx) => drawHexer(ctx, 2));
    make("enemy_hexer_w3", 80, 72, (ctx) => drawHexer(ctx, 3));
    make("enemy_hexer_dead", 80, 72, (ctx) => drawHexerDead(ctx));

    const drawTitan = (ctx, frame = 0) => {
      shadow(ctx, 44, 70, 30, 8);
      const f = frame % 4;

      const bodyX = f === 0 ? 21 : f === 2 ? 23 : 22;
      const bodyY = (f === 1 || f === 3) ? 23 : 25;
      const headX = f === 0 ? 43 : f === 2 ? 45 : 44;
      const headY = (f === 1 || f === 3) ? 17 : 19;

      const stoneLight = "#b0a898";
      const stoneDark = "#4a4038";
      const outline = "#2a241e";

      // Heavy stomp legs
      if (f === 0) {
        // Left forward stomp
        rounded(ctx, 24, 46, 15, 22, 5, linGrad(ctx, 24, 46, 39, 68, [[0, stoneLight], [1, stoneDark]]), outline, 2);
        rounded(ctx, 19, 63, 20, 7.5, 3, "#3a342c", outline, 1.5);
        // Stomp shockwave dust under left foot
        ctx.strokeStyle = "rgba(220,200,170,0.55)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(28, 68, 9, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();

        // Right trailing back
        rounded(ctx, 52, 45, 14, 20, 4, linGrad(ctx, 52, 45, 66, 65, [[0, "#989082"], [1, "#3c342e"]]), outline, 2);
        rounded(ctx, 50, 60, 16, 6.5, 3, "#2a241e", outline, 1.5);
      } else if (f === 1) {
        // Left planted straight
        rounded(ctx, 27, 44, 15, 24, 5, linGrad(ctx, 27, 44, 42, 68, [[0, stoneLight], [1, stoneDark]]), outline, 2);
        rounded(ctx, 25, 63, 19, 7.5, 3, "#3a342c", outline, 1.5);
        // Right high knee lift stomp prep
        rounded(ctx, 49, 39, 15, 18, 4, linGrad(ctx, 49, 39, 64, 57, [[0, "#989082"], [1, "#3c342e"]]), outline, 2);
        rounded(ctx, 48, 52, 17, 7, 3, "#2a241e", outline, 1.5);
      } else if (f === 2) {
        // Left trailing back
        rounded(ctx, 22, 45, 14, 20, 4, linGrad(ctx, 22, 45, 36, 65, [[0, "#989082"], [1, "#3c342e"]]), outline, 2);
        rounded(ctx, 20, 60, 16, 6.5, 3, "#2a241e", outline, 1.5);
        // Right forward stomp
        rounded(ctx, 49, 46, 15, 22, 5, linGrad(ctx, 49, 46, 64, 68, [[0, stoneLight], [1, stoneDark]]), outline, 2);
        rounded(ctx, 49, 63, 20, 7.5, 3, "#3a342c", outline, 1.5);
        // Stomp shockwave dust under right foot
        ctx.strokeStyle = "rgba(220,200,170,0.55)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(60, 68, 9, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();
      } else {
        // Left high knee lift stomp prep
        rounded(ctx, 24, 39, 15, 18, 4, linGrad(ctx, 24, 39, 39, 57, [[0, "#989082"], [1, "#3c342e"]]), outline, 2);
        rounded(ctx, 23, 52, 17, 7, 3, "#2a241e", outline, 1.5);
        // Right planted straight
        rounded(ctx, 46, 44, 15, 24, 5, linGrad(ctx, 46, 44, 61, 68, [[0, stoneLight], [1, stoneDark]]), outline, 2);
        rounded(ctx, 44, 63, 19, 7.5, 3, "#3a342c", outline, 1.5);
      }

      // Torso
      rounded(ctx, bodyX, bodyY, 44, 32, 8, linGrad(ctx, bodyX, bodyY, bodyX + 44, bodyY + 32, [[0, "#d0c8b8"], [0.5, "#888078"], [1, "#403830"]]), outline, 2.4);

      // Stone cracks
      ctx.strokeStyle = "rgba(30,24,18,.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bodyX + 14, bodyY + 4);
      ctx.lineTo(bodyX + 18, bodyY + 20);
      ctx.lineTo(bodyX + 26, bodyY + 14);
      ctx.moveTo(bodyX + 30, bodyY + 6);
      ctx.lineTo(bodyX + 34, bodyY + 24);
      ctx.stroke();

      // Moss patches
      ellipse(ctx, bodyX + 8, bodyY + 12, 6, 3, "rgba(100,160,70,.45)");
      ellipse(ctx, bodyX + 36, bodyY + 18, 5, 3, "rgba(100,160,70,.4)");

      // Head
      ellipse(ctx, headX, headY, 16, 14, linGrad(ctx, headX - 14, headY - 10, headX + 14, headY + 12, [[0, "#e0d8c8"], [1, "#686058"]]), outline, 2);

      // Glowing eyes
      ellipse(ctx, headX - 6, headY, 3, 3.5, "#ffe060");
      ellipse(ctx, headX + 6, headY, 3, 3.5, "#ffe060");
      ellipse(ctx, headX - 6, headY, 1.4, 1.8, "#402008");
      ellipse(ctx, headX + 6, headY, 1.4, 1.8, "#402008");

      // Brow ridge
      rounded(ctx, headX - 14, headY - 8, 28, 6, 2, "#585048", outline, 1);

      // Massive stone fists
      let lFistX, lFistY, rFistX, rFistY;
      if (f === 0) {
        lFistX = bodyX - 7; lFistY = bodyY + 17; rFistX = bodyX + 50; rFistY = bodyY + 23;
      } else if (f === 1) {
        lFistX = bodyX - 5; lFistY = bodyY + 20; rFistX = bodyX + 48; rFistY = bodyY + 20;
      } else if (f === 2) {
        lFistX = bodyX - 5; lFistY = bodyY + 23; rFistX = bodyX + 52; rFistY = bodyY + 17;
      } else {
        lFistX = bodyX - 3; lFistY = bodyY + 20; rFistX = bodyX + 46; rFistY = bodyY + 20;
      }

      ellipse(ctx, lFistX, lFistY, 10, 10, "#888078", outline, 2);
      ellipse(ctx, rFistX, rFistY, 10, 10, "#888078", outline, 2);
      // Knuckle details
      speckles(ctx, lFistX - 5, lFistY - 5, 10, 10, 3, "rgba(255,255,255,0.2)", 1.2);
      speckles(ctx, rFistX - 5, rFistY - 5, 10, 10, 3, "rgba(255,255,255,0.2)", 1.2);
    };

    const drawTitanDead = (ctx) => {
      shadow(ctx, 44, 68, 38, 8, 0.5);
      ellipse(ctx, 44, 66, 32, 6, "rgba(20, 16, 12, 0.45)");
      const outline = "#2a241e";

      // Center fractured torso slab
      poly(
        ctx,
        [[28, 62], [32, 44], [56, 42], [62, 58], [46, 66]],
        linGrad(ctx, 28, 42, 62, 66, [[0, "#d0c8b8"], [0.5, "#888078"], [1, "#383028"]]),
        outline,
        2.4
      );

      // Fissure crack
      ctx.strokeStyle = "#1a140e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(42, 43);
      ctx.lineTo(45, 53);
      ctx.lineTo(39, 58);
      ctx.lineTo(44, 65);
      ctx.stroke();

      // Left fallen fist boulder
      ellipse(ctx, 20, 58, 10, 8, linGrad(ctx, 12, 52, 28, 64, [[0, "#c0b8a8"], [1, "#504840"]]), outline, 2);

      // Right fallen fist boulder
      ellipse(ctx, 70, 58, 10, 8, linGrad(ctx, 62, 52, 78, 64, [[0, "#c0b8a8"], [1, "#504840"]]), outline, 2);

      // Dislodged head resting in rubble
      ellipse(ctx, 48, 42, 13, 11, linGrad(ctx, 38, 34, 58, 50, [[0, "#d8d0c0"], [1, "#585048"]]), outline, 2);
      ctx.strokeStyle = "#1a140e";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(42, 38);
      ctx.lineTo(54, 40);
      ctx.stroke();

      // Extinguished eye sockets
      ellipse(ctx, 44, 43, 2.5, 2, "#1e1814");
      ellipse(ctx, 52, 44, 2.5, 2, "#1e1814");

      // Moss & gravel rubble
      ellipse(ctx, 35, 52, 5, 3, "rgba(90,150,60,.4)");
      ellipse(ctx, 58, 54, 4, 2.5, "rgba(90,150,60,.35)");
      for (const [rx, ry, s] of [[12, 64, 2], [16, 66, 1.5], [68, 66, 2.2], [76, 63, 1.8], [44, 68, 2]]) {
        rounded(ctx, rx, ry, s * 2, s * 1.5, 1, "#686058", "#2a241e", 0.8);
      }
    };

    make("enemy_titan", 88, 80, (ctx) => drawTitan(ctx, 0));
    make("enemy_titan_w0", 88, 80, (ctx) => drawTitan(ctx, 0));
    make("enemy_titan_w1", 88, 80, (ctx) => drawTitan(ctx, 1));
    make("enemy_titan_w2", 88, 80, (ctx) => drawTitan(ctx, 2));
    make("enemy_titan_w3", 88, 80, (ctx) => drawTitan(ctx, 3));
    make("enemy_titan_dead", 88, 80, (ctx) => drawTitanDead(ctx));

    const drawBossDead = (ctx) => {
      shadow(ctx, 48, 76, 40, 9, 0.45);

      // Torn purple cape
      poly(
        ctx,
        [[14, 68], [28, 48], [68, 46], [84, 66], [48, 76]],
        linGrad(ctx, 14, 46, 84, 76, [[0, "#c080d0"], [0.5, "#602078"], [1, "#200830"]]),
        "#140420",
        2.2
      );

      // Collapsed ornate armor
      rounded(ctx, 28, 46, 38, 22, 6, linGrad(ctx, 28, 46, 66, 68, [[0, "#e8a0f8"], [0.5, "#8828a8"], [1, "#380a48"]]), "#1a0424", 2.2);
      ellipse(ctx, 26, 52, 9, 8, "#a050c0", "#1a0424", 1.8);
      ellipse(ctx, 64, 52, 9, 8, "#a050c0", "#1a0424", 1.8);

      // Fallen head
      ellipse(ctx, 50, 40, 13, 12, linGrad(ctx, 40, 30, 60, 50, [[0, "#f0c0f8"], [1, "#781898"]]), "#1a0424", 2);
      ctx.strokeStyle = "#200428";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(45, 38); ctx.lineTo(49, 42); ctx.moveTo(49, 38); ctx.lineTo(45, 42);
      ctx.moveTo(53, 38); ctx.lineTo(57, 42); ctx.moveTo(57, 38); ctx.lineTo(53, 42);
      ctx.stroke();

      // Fallen crown
      poly(ctx, [[62, 38], [66, 28], [72, 34], [78, 26], [82, 36], [64, 42]], linGrad(ctx, 62, 26, 82, 42, [[0, "#fff0b0"], [1, "#a07020"]]), "#3a2008", 1.4);

      // Broken orb staff
      ctx.strokeStyle = "#a07020";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(18, 70);
      ctx.lineTo(76, 56);
      ctx.stroke();
      ellipse(ctx, 80, 55, 6, 6, "rgba(220,120,255,.5)", "#c060e0", 1.5);
    };

    make("enemy_boss", 96, 88, (ctx) => {
      shadow(ctx, 48, 76, 34, 9);
      // cape
      poly(
        ctx,
        [[20, 30], [76, 30], [88, 70], [48, 78], [8, 70]],
        linGrad(ctx, 20, 30, 76, 78, [[0, "#e0a0f0"], [0.5, "#8030a0"], [1, "#301048"]]),
        "#1a0828",
        2.2
      );
      // body armor
      rounded(ctx, 28, 28, 40, 36, 8, linGrad(ctx, 28, 28, 68, 64, [[0, "#f0b0ff"], [0.45, "#a040c0"], [1, "#501868"]]), "#200830", 2.4);
      // pauldrons
      ellipse(ctx, 26, 34, 12, 10, "#c070e0", "#200830", 2);
      ellipse(ctx, 70, 34, 12, 10, "#c070e0", "#200830", 2);
      // head
      ellipse(ctx, 48, 22, 16, 15, linGrad(ctx, 34, 10, 62, 36, [[0, "#f8d0ff"], [1, "#9030b0"]]), "#200830", 2);
      face(ctx, 48, 22, "#ffe8ff", "#200820", true);
      // crown
      poly(ctx, [[30, 14], [34, 4], [40, 12], [48, 2], [56, 12], [62, 4], [66, 14]], linGrad(ctx, 30, 2, 66, 14, [[0, "#fff0c0"], [1, "#c09030"]]), "#4a3010", 1.5);
      ellipse(ctx, 48, 8, 4, 4, "#ff60e0", "#600840", 1);
      // orb staff
      ctx.strokeStyle = "#d0a040";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(72, 70);
      ctx.lineTo(82, 18);
      ctx.stroke();
      ellipse(ctx, 82, 16, 10, 10, radGrad(ctx, 80, 14, 1, 10, [[0, "#fff"], [0.35, "#f080ff"], [1, "rgba(100,20,140,.15)"]]), "#f0c0ff", 2);
      // aura ring
      ctx.strokeStyle = "rgba(240,160,255,.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(48, 48, 36, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    make("enemy_boss_dead", 96, 88, (ctx) => drawBossDead(ctx));

    // —— Projectiles ——
    make("projectile_arrow", 40, 20, (ctx) => {
      // shaft
      ctx.strokeStyle = "#8a5a28";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(6, 10);
      ctx.lineTo(32, 10);
      ctx.stroke();
      // fletching
      poly(ctx, [[6, 10], [0, 4], [8, 10], [0, 16]], "#e8d070", "#5a4018", 1);
      // tip
      poly(ctx, [[28, 6], [40, 10], [28, 14]], "#e8eef0", "#3a4048", 1);
    });

    make("projectile_magic", 32, 32, (ctx) => {
      ellipse(ctx, 16, 16, 14, 14, radGrad(ctx, 12, 12, 2, 14, [[0, "#ffffff"], [0.35, "#c8b0ff"], [1, "rgba(80,60,180,.05)"]]));
      ellipse(ctx, 16, 16, 7, 7, radGrad(ctx, 14, 14, 1, 7, [[0, "#fff"], [1, "#9070ff"]]));
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2;
        ellipse(ctx, 16 + Math.cos(a) * 11, 16 + Math.sin(a) * 11, 2, 2, "rgba(230,210,255,.85)");
      }
    });

    make("projectile_bomb", 36, 36, (ctx) => {
      shadow(ctx, 16, 28, 12, 5, 0.3);
      ellipse(ctx, 16, 20, 13, 13, linGrad(ctx, 6, 10, 26, 30, [[0, "#6a5a48"], [0.5, "#2a2018"], [1, "#0c0806"]]), "#080604", 1.8);
      // highlight
      ellipse(ctx, 12, 15, 4, 3, "rgba(255,240,200,.25)");
      // fuse
      ctx.strokeStyle = "#d0a060";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(22, 10);
      ctx.quadraticCurveTo(28, 4, 30, 8);
      ctx.stroke();
      ellipse(ctx, 30, 6, 5, 5, radGrad(ctx, 29, 5, 1, 5, [[0, "#fff8c0"], [0.4, "#ff9020"], [1, "rgba(200,40,0,.05)"]]));
    });

    // —— Units ——
    const drawSoldierGuardWalk = (ctx, frame = 0) => {
      const f = frame % 4;
      const bodyY = (f === 1 || f === 3) ? 20 : 22;
      const headY = (f === 1 || f === 3) ? 14 : 16;
      const helmY = (f === 1 || f === 3) ? 5 : 7;
      const shY = bodyY + 2;

      shadow(ctx, 28, 52, (f === 0 || f === 2) ? 19 : 17, 5, 0.4);

      // Contact AO under soldier feet
      if (f === 0) {
        ellipse(ctx, 15.5, 49.5, 6, 1.8, "rgba(10, 8, 6, 0.72)");
        ellipse(ctx, 39.5, 48.5, 5, 1.6, "rgba(10, 8, 6, 0.55)");
      } else if (f === 1) {
        ellipse(ctx, 21.5, 49.5, 6.5, 2, "rgba(10, 8, 6, 0.75)");
        ellipse(ctx, 37.5, 41.5, 4, 1.4, "rgba(10, 8, 6, 0.3)");
      } else if (f === 2) {
        ellipse(ctx, 11, 47.5, 5, 1.6, "rgba(10, 8, 6, 0.55)");
        ellipse(ctx, 41.5, 49.5, 6, 1.8, "rgba(10, 8, 6, 0.72)");
      } else {
        ellipse(ctx, 24.5, 41.5, 4, 1.4, "rgba(10, 8, 6, 0.3)");
        ellipse(ctx, 34.5, 49.5, 6.5, 2, "rgba(10, 8, 6, 0.75)");
      }

      // Leather / cloth leg gradients
      const nearLegGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#846848"], [0.48, "#584028"], [1, "#2a1c10"]]);
      const farLegGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#584028"], [0.5, "#382414"], [1, "#1a0e08"]]);
      const bootGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#543c24"], [0.5, "#362414"], [1, "#1a0e06"]]);

      // Legs: stride vs passing
      if (f === 0) {
        // Far/right leg trailing back
        poly(ctx, [[30, 36], [37, 36], [42, 47], [35, 48]], farLegGrad(30, 36, 42, 48), "#24180c", 1.2);
        rounded(ctx, 35, 46, 10, 5, 2, bootGrad(35, 46, 35, 51), "#24180c", 1);
        // Near/left leg stepping forward
        poly(ctx, [[18, 36], [25, 36], [20, 48], [13, 48]], nearLegGrad(18, 36, 13, 48), "#2a1e10", 1.2);
        rounded(ctx, 10, 47, 11, 5.5, 2, bootGrad(10, 47, 10, 52), "#2a1e10", 1);
        // Cool rim on forward leg
        ctx.strokeStyle = "rgba(210, 240, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(18, 37);
        ctx.lineTo(13, 48);
        ctx.stroke();
      } else if (f === 1) {
        // Near/left leg planted straight
        rounded(ctx, 18, 34, 8, 14, 3, nearLegGrad(18, 34, 26, 48), "#2a1e10", 1.2);
        rounded(ctx, 16, 47, 11, 5.5, 2, bootGrad(16, 47, 16, 52), "#2a1e10", 1);
        // Cool rim on left planted leg
        ctx.strokeStyle = "rgba(210, 240, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(18, 35);
        ctx.lineTo(18, 47);
        ctx.stroke();
        // Far/right leg lifting passing knee
        poly(ctx, [[30, 34], [37, 34], [39, 41], [33, 42]], farLegGrad(30, 34, 39, 42), "#24180c", 1.2);
        rounded(ctx, 33, 39, 9, 5, 2, bootGrad(33, 39, 33, 44), "#24180c", 1);
      } else if (f === 2) {
        // Near/left leg trailing back
        poly(ctx, [[18, 36], [25, 36], [14, 47], [8, 46]], farLegGrad(18, 36, 14, 47), "#24180c", 1.2);
        rounded(ctx, 6, 45, 10, 5, 2, bootGrad(6, 45, 6, 50), "#24180c", 1);
        // Far/right leg stepping forward
        poly(ctx, [[30, 36], [37, 36], [42, 48], [35, 48]], nearLegGrad(30, 36, 42, 48), "#2a1e10", 1.2);
        rounded(ctx, 36, 47, 11, 5.5, 2, bootGrad(36, 47, 36, 52), "#2a1e10", 1);
      } else {
        // Near/left leg lifting passing knee
        poly(ctx, [[18, 34], [25, 34], [27, 41], [21, 42]], farLegGrad(18, 34, 27, 41), "#24180c", 1.2);
        rounded(ctx, 20, 39, 9, 5, 2, bootGrad(20, 39, 20, 44), "#24180c", 1);
        // Far/right leg planted straight
        rounded(ctx, 30, 34, 8, 14, 3, nearLegGrad(30, 34, 38, 48), "#2a1e10", 1.2);
        rounded(ctx, 29, 47, 11, 5.5, 2, bootGrad(29, 47, 29, 52), "#2a1e10", 1);
      }

      // Contact AO under armor fauld onto legs
      ellipse(ctx, 28, bodyY + 19, 13, 2.8, "rgba(20, 12, 6, 0.52)");

      // Torso body armor (3-stop golden bronze cuirass)
      rounded(ctx, 14, bodyY, 28, 20, 5, linGrad(ctx, 14, bodyY, 42, bodyY + 20, [[0, "#fff0a4"], [0.42, "#cca448"], [1, "#66481c"]]), "#2a1e10", 1.8);
      // Cool rim on upper-left cuirass
      ctx.strokeStyle = "rgba(210, 240, 255, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(15, bodyY + 12);
      ctx.lineTo(15, bodyY + 4);
      ctx.arcTo(15, bodyY, 20, bodyY, 4);
      ctx.stroke();

      // Armor center ridge & belt
      ctx.strokeStyle = "rgba(255,245,190,0.5)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(28, bodyY + 2);
      ctx.lineTo(28, bodyY + 16);
      ctx.stroke();
      rounded(ctx, 16, bodyY + 14, 24, 4, 1, linGrad(ctx, 16, bodyY + 14, 40, bodyY + 18, [[0, "#48321c"], [1, "#20140a"]]), "#1c1208", 1);
      rounded(ctx, 26, bodyY + 13.5, 4, 5, 1, linGrad(ctx, 26, bodyY + 13.5, 30, bodyY + 18.5, [[0, "#fff0a0"], [0.5, "#d8b248"], [1, "#7c5a1c"]]), "#2a1e10", 0.8);

      // Contact AO under chin / helmet rim onto breastplate neck
      ellipse(ctx, 28, headY + 8, 9, 2.5, "rgba(20, 12, 6, 0.58)");

      // Head with 3-stop warm human skin gradient
      ellipse(ctx, 28, headY, 10, 10, linGrad(ctx, 20, headY - 8, 36, headY + 8, [[0, "#fff2d6"], [0.45, "#e5b478"], [1, "#9e6630"]]), "#4a3018", 1.6);

      // Helmet with 3-stop bronze gradient & cool rim
      rounded(ctx, 18, helmY, 20, 10, 4, linGrad(ctx, 18, helmY, 38, helmY + 10, [[0, "#fff4b0"], [0.45, "#d4aa44"], [1, "#724e1c"]]), "#3a2810", 1.4);
      poly(ctx, [[28, helmY - 4], [25, helmY + 2], [31, helmY + 2]], linGrad(ctx, 25, helmY - 4, 31, helmY + 2, [[0, "#fff4b0"], [1, "#b58e38"]]), "#3a2810", 1);

      // Cool rim light on helmet upper-left
      ctx.strokeStyle = "rgba(210, 240, 255, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(28, headY - 4, 9.5, -Math.PI * 0.95, -Math.PI * 0.35);
      ctx.stroke();

      ellipse(ctx, 24, headY - 1, 1.6, 1.8, "#1a120c");
      ellipse(ctx, 32, headY - 1, 1.6, 1.8, "#1a120c");
      ellipse(ctx, 23.6, headY - 1.4, 0.5, 0.5, "#ffffff");
      ellipse(ctx, 31.6, headY - 1.4, 0.5, 0.5, "#ffffff");

      // Shield (Left arm)
      let shDx = 0, shDy = 0, shRot = 0;
      if (f === 0) { shDx = 0; shDy = 0; shRot = -0.04; }
      else if (f === 1) { shDx = 1; shDy = -1; shRot = 0.02; }
      else if (f === 2) { shDx = 2; shDy = 0; shRot = 0.05; }
      else { shDx = 1; shDy = -1; shRot = -0.02; }

      // Contact AO behind shield
      ellipse(ctx, 18 + shDx, shY + 12 + shDy, 6, 7, "rgba(20, 12, 6, 0.45)");

      ctx.save();
      ctx.translate(16 + shDx, shY + 12 + shDy);
      ctx.rotate(shRot);
      poly(ctx, [[-6, -11], [4, -13], [6, 6], [0, 12], [-8, 6]], linGrad(ctx, -8, -13, 6, 12, [[0, "#fff4be"], [0.45, "#d8b046"], [1, "#78541a"]]), "#3a2810", 1.4);
      poly(ctx, [[-3, -6], [1, -6], [0, 2], [-4, 2]], linGrad(ctx, -4, -6, 1, 2, [[0, "#3e64a4"], [1, "#14223c"]]), "#0e1828", 0.8);
      // Cool rim on upper-left shield edge
      ctx.strokeStyle = "rgba(215, 245, 255, 0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-6, -11);
      ctx.lineTo(4, -13);
      ctx.stroke();
      ctx.restore();

      // Spear (Right arm)
      let sp0x, sp0y, sp1x, sp1y;
      if (f === 0) { sp0x = 39; sp0y = bodyY + 19; sp1x = 48; sp1y = bodyY - 14; }
      else if (f === 1) { sp0x = 38; sp0y = bodyY + 17; sp1x = 46; sp1y = bodyY - 17; }
      else if (f === 2) { sp0x = 40; sp0y = bodyY + 16; sp1x = 50; sp1y = bodyY - 13; }
      else { sp0x = 39; sp0y = bodyY + 18; sp1x = 47; sp1y = bodyY - 16; }

      ctx.strokeStyle = "#8a6030";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sp0x, sp0y);
      ctx.lineTo(sp1x, sp1y);
      ctx.stroke();

      const ang = Math.atan2(sp1y - sp0y, sp1x - sp0x);
      const tipX = sp1x + Math.cos(ang) * 9;
      const tipY = sp1y + Math.sin(ang) * 9;
      const pX = -Math.sin(ang) * 4;
      const pY = Math.cos(ang) * 4;
      poly(ctx, [[tipX, tipY], [sp1x + pX, sp1y + pY], [sp1x - pX, sp1y - pY]], linGrad(ctx, sp1x - 3, sp1y - 3, tipX, tipY, [[0, "#e4ecf4"], [0.6, "#ffffff"], [1, "#7c8c9c"]]), "#2a323c", 1);
      ellipse(ctx, tipX - 0.5, tipY - 0.5, 1, 1, "#ffffff");
      ellipse(ctx, (sp0x * 0.4 + sp1x * 0.6), (sp0y * 0.4 + sp1y * 0.6), 3, 3, linGrad(ctx, 36, bodyY, 44, bodyY + 6, [[0, "#fff0a0"], [1, "#8a6820"]]), "#2a1e10", 1);
    };

    const drawSoldierGuardAttack = (ctx) => {
      shadow(ctx, 30, 53, 22, 5.5, 0.4);

      // Contact AO under lunging feet
      ellipse(ctx, 13, 50, 6.5, 2, "rgba(10, 8, 6, 0.75)");
      ellipse(ctx, 47.5, 48.5, 6, 1.8, "rgba(10, 8, 6, 0.6)");

      const nearLegGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#846848"], [0.48, "#584028"], [1, "#2a1c10"]]);
      const farLegGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#584028"], [0.5, "#382414"], [1, "#1a0e08"]]);
      const bootGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#543c24"], [0.5, "#362414"], [1, "#1a0e06"]]);

      // Legs lunging forward
      poly(ctx, [[16, 36], [23, 36], [16, 49], [9, 49]], nearLegGrad(16, 36, 9, 49), "#2a1e10", 1.3);
      rounded(ctx, 7, 47, 12, 6, 2, bootGrad(7, 47, 7, 53), "#2a1e10", 1.1);
      // Cool rim on front lunge leg
      ctx.strokeStyle = "rgba(210, 240, 255, 0.4)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(16, 37);
      ctx.lineTo(9, 49);
      ctx.stroke();

      poly(ctx, [[29, 36], [36, 36], [46, 48], [39, 49]], farLegGrad(29, 36, 46, 48), "#24180c", 1.3);
      rounded(ctx, 42, 47, 11, 5.5, 2, bootGrad(42, 47, 42, 52), "#24180c", 1.1);

      // Contact AO under armor fauld
      ellipse(ctx, 31, 41, 13, 2.8, "rgba(20, 12, 6, 0.52)");

      // Torso leaned into thrust
      rounded(ctx, 17, 23, 28, 19, 5, linGrad(ctx, 17, 23, 45, 42, [[0, "#fff0a4"], [0.42, "#cca448"], [1, "#66481c"]]), "#2a1e10", 1.8);
      // Cool rim on torso upper-left
      ctx.strokeStyle = "rgba(210, 240, 255, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(18, 33);
      ctx.lineTo(18, 27);
      ctx.arcTo(18, 23, 24, 23, 4);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,245,190,0.5)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(31, 25);
      ctx.lineTo(31, 38);
      ctx.stroke();
      rounded(ctx, 19, 37, 24, 4, 1, linGrad(ctx, 19, 37, 43, 41, [[0, "#48321c"], [1, "#20140a"]]), "#1c1208", 1);

      // Contact AO under chin / helmet
      ellipse(ctx, 31, 24, 9, 2.5, "rgba(20, 12, 6, 0.58)");

      // Head & Helm forward
      ellipse(ctx, 31, 16, 10, 10, linGrad(ctx, 23, 8, 39, 24, [[0, "#fff2d6"], [0.45, "#e5b478"], [1, "#9e6630"]]), "#4a3018", 1.6);
      rounded(ctx, 21, 6, 20, 10, 4, linGrad(ctx, 21, 6, 41, 16, [[0, "#fff4b0"], [0.45, "#d4aa44"], [1, "#724e1c"]]), "#3a2810", 1.4);
      poly(ctx, [[32, 2], [29, 8], [35, 8]], linGrad(ctx, 29, 2, 35, 8, [[0, "#fff4b0"], [1, "#b58e38"]]), "#3a2810", 1);

      // Cool rim light on helmet upper-left
      ctx.strokeStyle = "rgba(210, 240, 255, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(31, 12, 9.5, -Math.PI * 0.95, -Math.PI * 0.35);
      ctx.stroke();

      ellipse(ctx, 27, 15, 1.8, 1.8, "#1a120c");
      ellipse(ctx, 35, 15, 1.8, 1.8, "#1a120c");
      ellipse(ctx, 26.6, 14.6, 0.5, 0.5, "#ffffff");
      ellipse(ctx, 34.6, 14.6, 0.5, 0.5, "#ffffff");
      ctx.strokeStyle = "#1a120c";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(25, 12);
      ctx.lineTo(29, 14);
      ctx.moveTo(37, 12);
      ctx.lineTo(33, 14);
      ctx.stroke();

      // Shield pulled back with contact AO
      ellipse(ctx, 11, 35, 6, 8, "rgba(20, 12, 6, 0.45)");
      poly(ctx, [[6, 25], [15, 23], [17, 41], [12, 46], [4, 41]], linGrad(ctx, 4, 23, 17, 46, [[0, "#fff4be"], [0.45, "#d8b046"], [1, "#78541a"]]), "#3a2810", 1.4);
      poly(ctx, [[9, 30], [13, 30], [12, 37], [8, 37]], linGrad(ctx, 8, 30, 13, 37, [[0, "#3e64a4"], [1, "#14223c"]]), "#0e1828", 0.8);
      // Cool rim on shield
      ctx.strokeStyle = "rgba(215, 245, 255, 0.5)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(6, 25);
      ctx.lineTo(15, 23);
      ctx.stroke();

      // Spear Thrust with motion line
      ctx.strokeStyle = "rgba(255,245,180,0.55)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(28, 28);
      ctx.lineTo(50, 24);
      ctx.stroke();

      ctx.strokeStyle = "#8a6030";
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(26, 29);
      ctx.lineTo(46, 25);
      ctx.stroke();

      rounded(ctx, 28, 26, 12, 6, 2.5, linGrad(ctx, 28, 26, 40, 32, [[0, "#fff0a4"], [0.5, "#cca448"], [1, "#66481c"]]), "#2a1e10", 1.2);
      ellipse(ctx, 39, 29, 3, 3, linGrad(ctx, 36, 26, 42, 32, [[0, "#fff0a0"], [1, "#8a6820"]]), "#2a1e10", 1);

      poly(ctx, [[54, 23], [44, 19], [46, 24], [44, 29]], linGrad(ctx, 44, 19, 54, 24, [[0, "#e4ecf4"], [0.6, "#ffffff"], [1, "#7c8c9c"]]), "#2a323c", 1.2);
      ellipse(ctx, 54, 23, 2.5, 2.5, "rgba(255,255,255,0.95)");
      ellipse(ctx, 54, 23, 4, 4, "rgba(255,230,120,0.4)");
    };

    const drawSoldierGuardBlock = (ctx) => {
      shadow(ctx, 28, 53, 21, 6, 0.4);

      // Contact AO under braced wide feet
      ellipse(ctx, 12, 51, 6.5, 2, "rgba(10, 8, 6, 0.75)");
      ellipse(ctx, 44, 51, 6.5, 2, "rgba(10, 8, 6, 0.75)");

      const nearLegGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#846848"], [0.48, "#584028"], [1, "#2a1c10"]]);
      const farLegGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#584028"], [0.5, "#382414"], [1, "#1a0e08"]]);
      const bootGrad = (x0, y0, x1, y1) => linGrad(ctx, x0, y0, x1, y1, [[0, "#543c24"], [0.5, "#362414"], [1, "#1a0e06"]]);

      // Legs wide braced defensive stance
      poly(ctx, [[14, 38], [21, 38], [15, 50], [8, 50]], nearLegGrad(14, 38, 8, 50), "#2a1e10", 1.3);
      rounded(ctx, 6, 48, 12, 6, 2, bootGrad(6, 48, 6, 54), "#2a1e10", 1.1);
      // Cool rim on left braced leg
      ctx.strokeStyle = "rgba(210, 240, 255, 0.4)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(14, 39);
      ctx.lineTo(8, 50);
      ctx.stroke();

      poly(ctx, [[33, 38], [40, 38], [46, 50], [39, 50]], farLegGrad(33, 38, 46, 50), "#24180c", 1.3);
      rounded(ctx, 38, 48, 12, 6, 2, bootGrad(38, 48, 38, 54), "#24180c", 1.1);

      // Contact AO under torso
      ellipse(ctx, 28, 43, 13, 2.8, "rgba(20, 12, 6, 0.52)");

      // Torso hunkered behind shield
      rounded(ctx, 14, 24, 28, 20, 5, linGrad(ctx, 14, 24, 42, 44, [[0, "#fff0a4"], [0.42, "#cca448"], [1, "#66481c"]]), "#2a1e10", 1.8);

      // Contact AO under chin peering over shield
      ellipse(ctx, 28, 25, 9, 2.5, "rgba(20, 12, 6, 0.58)");

      // Head & Helm peering over shield
      ellipse(ctx, 28, 17, 9.5, 9.5, linGrad(ctx, 20, 9, 36, 25, [[0, "#fff2d6"], [0.45, "#e5b478"], [1, "#9e6630"]]), "#4a3018", 1.6);
      rounded(ctx, 18, 7, 20, 10, 4, linGrad(ctx, 18, 7, 38, 17, [[0, "#fff4b0"], [0.45, "#d4aa44"], [1, "#724e1c"]]), "#3a2810", 1.4);
      poly(ctx, [[28, 3], [25, 9], [31, 9]], linGrad(ctx, 25, 3, 31, 9, [[0, "#fff4b0"], [1, "#b58e38"]]), "#3a2810", 1);

      // Cool rim light on helmet upper-left
      ctx.strokeStyle = "rgba(210, 240, 255, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(28, 13, 9.5, -Math.PI * 0.95, -Math.PI * 0.35);
      ctx.stroke();

      ellipse(ctx, 24, 16, 1.6, 1.8, "#1a120c");
      ellipse(ctx, 32, 16, 1.6, 1.8, "#1a120c");
      ellipse(ctx, 23.6, 15.6, 0.5, 0.5, "#ffffff");
      ellipse(ctx, 31.6, 15.6, 0.5, 0.5, "#ffffff");
      ctx.strokeStyle = "#1a120c";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(22, 14);
      ctx.lineTo(26, 15);
      ctx.moveTo(34, 14);
      ctx.lineTo(30, 15);
      ctx.stroke();

      // Spear upright in guard behind shield
      ctx.strokeStyle = "#8a6030";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(39, 45);
      ctx.lineTo(44, 7);
      ctx.stroke();
      poly(ctx, [[44, 3], [48, 11], [40, 9]], linGrad(ctx, 40, 3, 48, 11, [[0, "#e4ecf4"], [0.6, "#ffffff"], [1, "#7c8c9c"]]), "#2a323c", 1);

      // Shield Prominent Forward Block with contact AO behind it
      ellipse(ctx, 25, 35, 14, 16, "rgba(18, 10, 4, 0.45)");
      poly(ctx, [[14, 20], [36, 18], [39, 42], [25, 50], [11, 42]], linGrad(ctx, 11, 18, 39, 50, [[0, "#fff8d0"], [0.45, "#e0b848"], [1, "#8a621c"]]), "#2a1e10", 1.8);
      // Cool rim on upper shield rim
      ctx.strokeStyle = "rgba(215, 245, 255, 0.6)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(14, 20);
      ctx.lineTo(36, 18);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(16, 22);
      ctx.lineTo(34, 20);
      ctx.lineTo(37, 40);
      ctx.lineTo(25, 47);
      ctx.lineTo(13, 40);
      ctx.closePath();
      ctx.stroke();

      poly(ctx, [[25, 27], [30, 33], [25, 39], [20, 33]], linGrad(ctx, 20, 27, 30, 39, [[0, "#3e64a4"], [1, "#14223c"]]), "#0e1828", 1.2);
      ellipse(ctx, 25, 33, 2.5, 2.5, linGrad(ctx, 23, 31, 27, 35, [[0, "#fff0a0"], [1, "#b58e38"]]), "#3a2810", 0.8);
      ellipse(ctx, 17, 24, 2, 2, "rgba(255,255,255,0.85)");
    };

    make("soldier_guard", 56, 60, (ctx) => drawSoldierGuardWalk(ctx, 0));
    make("soldier_guard_walk0", 56, 60, (ctx) => drawSoldierGuardWalk(ctx, 0));
    make("soldier_guard_walk1", 56, 60, (ctx) => drawSoldierGuardWalk(ctx, 1));
    make("soldier_guard_walk2", 56, 60, (ctx) => drawSoldierGuardWalk(ctx, 2));
    make("soldier_guard_walk3", 56, 60, (ctx) => drawSoldierGuardWalk(ctx, 3));
    make("soldier_guard_attack", 56, 60, drawSoldierGuardAttack);
    make("soldier_guard_block", 56, 60, drawSoldierGuardBlock);

    const drawHeroCaptainIdle = (ctx) => {
      shadow(ctx, 32, 62, 22, 6, 0.42);

      // Contact AO under hero armored boots
      ellipse(ctx, 26, 57.5, 6, 2, "rgba(8, 12, 20, 0.75)");
      ellipse(ctx, 38, 57.5, 6, 2, "rgba(8, 12, 20, 0.75)");

      // Cape (3-stop rich royal blue velvet gradient)
      poly(ctx, [[18, 28], [46, 28], [52, 58], [32, 62], [12, 58]], linGrad(ctx, 18, 28, 46, 62, [[0, "#6ea6ea"], [0.45, "#325c94"], [1, "#142848"]]), "#0c1828", 1.8);
      // Cool rim on left cape edge
      ctx.strokeStyle = "rgba(210, 240, 255, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(18, 30);
      ctx.lineTo(12, 58);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(26, 32);
      ctx.lineTo(22, 56);
      ctx.moveTo(38, 32);
      ctx.lineTo(42, 56);
      ctx.stroke();

      // Legs (Plate armor with 3-stop gradient)
      rounded(ctx, 22, 44, 8, 16, 3, linGrad(ctx, 22, 44, 30, 60, [[0, "#4a70a2"], [0.5, "#264870"], [1, "#122238"]]), "#101828", 1.2);
      rounded(ctx, 34, 44, 8, 16, 3, linGrad(ctx, 34, 44, 42, 60, [[0, "#4a70a2"], [0.5, "#264870"], [1, "#122238"]]), "#101828", 1.2);
      // Cool rim on left leg
      ctx.strokeStyle = "rgba(210, 240, 255, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(22, 45);
      ctx.lineTo(22, 54);
      ctx.stroke();

      rounded(ctx, 21, 54, 10, 6, 2, linGrad(ctx, 21, 54, 21, 60, [[0, "#283850"], [0.5, "#182438"], [1, "#0a101c"]]), "#0e1828", 1);
      rounded(ctx, 33, 54, 10, 6, 2, linGrad(ctx, 33, 54, 33, 60, [[0, "#283850"], [0.5, "#182438"], [1, "#0a101c"]]), "#0e1828", 1);
      ellipse(ctx, 26, 46, 3, 2.5, linGrad(ctx, 24, 44, 28, 48, [[0, "#fff2a0"], [1, "#9c6e20"]]), "#4a3010", 0.8);
      ellipse(ctx, 38, 46, 3, 2.5, linGrad(ctx, 36, 44, 40, 48, [[0, "#fff2a0"], [1, "#9c6e20"]]), "#4a3010", 0.8);

      // Contact AO under chestplate over belt / faulds
      ellipse(ctx, 32, 46, 14, 2.5, "rgba(10, 16, 28, 0.6)");

      // Armor torso (3-stop cobalt/steel plate armor gradient)
      rounded(ctx, 18, 26, 28, 24, 6, linGrad(ctx, 18, 26, 46, 50, [[0, "#92beff"], [0.45, "#386cb0"], [1, "#163458"]]), "#0c1828", 2);
      // Cool rim on left shoulder / torso
      ctx.strokeStyle = "rgba(210, 240, 255, 0.55)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(19, 36);
      ctx.lineTo(19, 29);
      ctx.arcTo(19, 26, 25, 26, 5);
      ctx.stroke();

      // Gold trim
      ctx.strokeStyle = "#e8c860";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(22, 30, 20, 14);
      poly(ctx, [[32, 32], [35, 37], [32, 42], [29, 37]], linGrad(ctx, 29, 32, 35, 42, [[0, "#fff6b8"], [0.5, "#f0d060"], [1, "#8c6018"]]), "#4a3010", 0.8);
      rounded(ctx, 20, 46, 24, 4, 1, linGrad(ctx, 20, 46, 44, 50, [[0, "#4a301c"], [1, "#1c1008"]]), "#120c06", 1);
      rounded(ctx, 30, 45, 4, 6, 1, linGrad(ctx, 30, 45, 34, 51, [[0, "#fff6b8"], [0.5, "#f0d060"], [1, "#8c6018"]]), "#4a3010", 0.8);

      // Contact AO under chin onto gorget
      ellipse(ctx, 32, 27, 10, 3, "rgba(12, 16, 28, 0.65)");

      // Head (3-stop warm hero skin gradient)
      ellipse(ctx, 32, 18, 11, 11, linGrad(ctx, 22, 8, 42, 28, [[0, "#fff4dc"], [0.45, "#e8b87e"], [1, "#a86c34"]]), "#4a3018", 1.6);

      // Crown helm with 3-stop radiant gold gradient & cool rim
      rounded(ctx, 20, 6, 24, 10, 3, linGrad(ctx, 20, 6, 44, 16, [[0, "#fff6ba"], [0.5, "#f0c842"], [1, "#9c6818"]]), "#4a3010", 1.4);
      poly(ctx, [[32, 0], [26, 8], [38, 8]], linGrad(ctx, 26, 0, 38, 8, [[0, "#fff6ba"], [0.5, "#f0d060"], [1, "#9c6818"]]), "#4a3010", 1);
      // Cool rim light on crown top
      ctx.strokeStyle = "rgba(215, 245, 255, 0.65)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(20, 9);
      ctx.lineTo(20, 7);
      ctx.lineTo(26, 8);
      ctx.lineTo(32, 0);
      ctx.stroke();

      ellipse(ctx, 32, 7, 2, 2.5, linGrad(ctx, 30, 5, 34, 9, [[0, "#ff7070"], [0.5, "#d02020"], [1, "#600808"]]));
      face(ctx, 32, 18);

      // Shield with contact AO
      ellipse(ctx, 16, 40, 7, 12, "rgba(12, 16, 28, 0.45)");
      poly(ctx, [[10, 28], [22, 26], [24, 48], [16, 54], [8, 48]], linGrad(ctx, 8, 26, 24, 54, [[0, "#fff6c4"], [0.5, "#dcba4c"], [1, "#967024"]]), "#3a2810", 1.5);
      poly(ctx, [[16, 33], [19, 38], [16, 43], [13, 38]], linGrad(ctx, 13, 33, 19, 43, [[0, "#3e68a8"], [1, "#14223c"]]), "#0e1828", 1);
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1;
      ctx.strokeRect(11, 28, 10, 18);
      // Cool rim on shield upper-left
      ctx.strokeStyle = "rgba(215, 245, 255, 0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(10, 28);
      ctx.lineTo(22, 26);
      ctx.stroke();

      // Sword
      rounded(ctx, 44, 46, 12, 5, 2, linGrad(ctx, 44, 46, 56, 51, [[0, "#a07038"], [1, "#4a2c14"]]), "#2a1810", 1);
      ellipse(ctx, 50, 52, 2.5, 2.5, linGrad(ctx, 48, 50, 52, 54, [[0, "#fff0a0"], [1, "#9c6e20"]]), "#2a1810", 1);
      ctx.strokeStyle = "#d0dcee";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(48, 48);
      ctx.lineTo(56, 14);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(48, 47);
      ctx.lineTo(55, 15);
      ctx.stroke();
      // Blade tip glow
      ellipse(ctx, 56, 12, 3, 3, "rgba(200,220,255,.7)");
    };

    const drawHeroCaptainAttack = (ctx) => {
      shadow(ctx, 34, 63, 26, 6, 0.44);

      // Contact AO under lunging hero boots
      ellipse(ctx, 13.5, 59, 6.5, 2, "rgba(8, 12, 20, 0.75)");
      ellipse(ctx, 44, 59, 7, 2, "rgba(8, 12, 20, 0.75)");

      // Cape billowing leftwards (3-stop gradient)
      poly(ctx, [[16, 26], [42, 26], [32, 54], [12, 60], [2, 46]], linGrad(ctx, 2, 26, 42, 60, [[0, "#6ea6ea"], [0.5, "#2a4870"], [1, "#101e30"]]), "#0c1828", 1.8);
      // Cool rim on billowing cape edge
      ctx.strokeStyle = "rgba(210, 240, 255, 0.45)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(16, 26);
      ctx.lineTo(2, 46);
      ctx.lineTo(12, 60);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(18, 30);
      ctx.lineTo(6, 48);
      ctx.moveTo(28, 30);
      ctx.lineTo(16, 54);
      ctx.stroke();

      // Legs lunging forward
      poly(ctx, [[18, 44], [25, 44], [16, 58], [9, 58]], linGrad(ctx, 9, 44, 25, 58, [[0, "#4a70a2"], [0.5, "#264870"], [1, "#122238"]]), "#0e1828", 1.2);
      rounded(ctx, 7, 56, 11, 6, 2, linGrad(ctx, 7, 56, 7, 62, [[0, "#283850"], [0.5, "#182438"], [1, "#0a101c"]]), "#0e1828", 1);
      // Cool rim on front lunge leg
      ctx.strokeStyle = "rgba(210, 240, 255, 0.45)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(18, 45);
      ctx.lineTo(9, 58);
      ctx.stroke();

      poly(ctx, [[34, 44], [43, 44], [47, 57], [40, 58]], linGrad(ctx, 34, 44, 47, 58, [[0, "#4a70a2"], [0.5, "#264870"], [1, "#122238"]]), "#0e1828", 1.2);
      rounded(ctx, 38, 56, 12, 6, 2, linGrad(ctx, 38, 56, 38, 62, [[0, "#283850"], [0.5, "#182438"], [1, "#0a101c"]]), "#0e1828", 1);
      ellipse(ctx, 42, 48, 3, 2.5, linGrad(ctx, 40, 46, 44, 50, [[0, "#fff2a0"], [1, "#9c6e20"]]), "#4a3010", 0.8);

      // Contact AO under chestplate
      ellipse(ctx, 35, 46, 14, 2.5, "rgba(10, 16, 28, 0.6)");

      // Torso angled forward
      rounded(ctx, 22, 27, 28, 23, 6, linGrad(ctx, 22, 27, 50, 50, [[0, "#92beff"], [0.45, "#386cb0"], [1, "#163458"]]), "#0c1828", 2);
      // Cool rim on torso upper-left
      ctx.strokeStyle = "rgba(210, 240, 255, 0.55)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(23, 37);
      ctx.lineTo(23, 30);
      ctx.arcTo(23, 27, 29, 27, 5);
      ctx.stroke();

      ctx.strokeStyle = "#e8c860";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(26, 31, 18, 13);
      poly(ctx, [[35, 33], [38, 37], [35, 41], [32, 37]], linGrad(ctx, 32, 33, 38, 41, [[0, "#fff6b8"], [0.5, "#f0d060"], [1, "#8c6018"]]), "#4a3010", 0.8);
      rounded(ctx, 24, 46, 23, 4, 1, linGrad(ctx, 24, 46, 47, 50, [[0, "#4a301c"], [1, "#1c1008"]]), "#120c06", 1);

      // Contact AO under chin onto gorget
      ellipse(ctx, 35, 28, 10, 3, "rgba(12, 16, 28, 0.65)");

      // Head focused forward
      ellipse(ctx, 35, 19, 11, 11, linGrad(ctx, 25, 9, 45, 29, [[0, "#fff4dc"], [0.45, "#e8b87e"], [1, "#a86c34"]]), "#4a3018", 1.6);
      rounded(ctx, 23, 7, 24, 10, 3, linGrad(ctx, 23, 7, 47, 17, [[0, "#fff6ba"], [0.5, "#f0c842"], [1, "#9c6818"]]), "#4a3010", 1.4);
      poly(ctx, [[36, 1], [29, 9], [42, 9]], linGrad(ctx, 29, 1, 42, 9, [[0, "#fff6ba"], [0.5, "#f0d060"], [1, "#9c6818"]]), "#4a3010", 1);
      // Cool rim on crown
      ctx.strokeStyle = "rgba(215, 245, 255, 0.65)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(23, 10);
      ctx.lineTo(23, 8);
      ctx.lineTo(29, 9);
      ctx.lineTo(36, 1);
      ctx.stroke();

      ellipse(ctx, 36, 8, 2, 2.5, linGrad(ctx, 34, 6, 38, 10, [[0, "#ff7070"], [0.5, "#d02020"], [1, "#600808"]]));
      face(ctx, 35, 19, "#f6f0c2", "#101008", true);

      // Shield braced for impact with contact AO
      ellipse(ctx, 13, 41, 7, 12, "rgba(12, 16, 28, 0.45)");
      poly(ctx, [[6, 30], [18, 28], [21, 48], [14, 54], [5, 48]], linGrad(ctx, 5, 28, 21, 54, [[0, "#fff6c4"], [0.5, "#dcba4c"], [1, "#967024"]]), "#3a2810", 1.5);
      poly(ctx, [[11, 35], [14, 39], [11, 43], [8, 39]], linGrad(ctx, 8, 35, 14, 43, [[0, "#3e68a8"], [1, "#14223c"]]), "#0e1828", 1);
      // Cool rim on shield
      ctx.strokeStyle = "rgba(215, 245, 255, 0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(6, 30);
      ctx.lineTo(18, 28);
      ctx.stroke();

      // Slash arc energy trail
      ctx.beginPath();
      ctx.arc(38, 36, 24, -Math.PI * 0.45, Math.PI * 0.16);
      ctx.strokeStyle = "rgba(180, 225, 255, 0.45)";
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(38, 36, 24, -Math.PI * 0.35, Math.PI * 0.12);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Sword slashing committed
      rounded(ctx, 42, 30, 12, 7, 3, linGrad(ctx, 42, 30, 54, 37, [[0, "#92beff"], [1, "#163458"]]), "#0c1828", 1.5);
      rounded(ctx, 46, 33, 6, 12, 2, linGrad(ctx, 46, 33, 52, 45, [[0, "#a07038"], [1, "#4a2c14"]]), "#2a1810", 1);
      ellipse(ctx, 44, 39, 2.5, 2.5, linGrad(ctx, 42, 37, 46, 41, [[0, "#fff0a0"], [1, "#9c6e20"]]), "#2a1810", 1);
      ctx.strokeStyle = "#e8f0ff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(49, 34);
      ctx.lineTo(63, 24);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(50, 34);
      ctx.lineTo(63, 24);
      ctx.stroke();

      // Impact spark at strike point
      poly(ctx, [[63, 20], [65, 24], [69, 24], [65, 26], [64, 30], [62, 26], [58, 24], [62, 23]], "#ffffff");
      ellipse(ctx, 63, 24, 3, 3, "rgba(255,240,160,0.85)");
    };

    const drawHeroCaptainAbility = (ctx) => {
      shadow(ctx, 32, 63, 24, 7, 0.45);

      // Radiant halo aura
      const auraGrad = radGrad(ctx, 32, 24, 8, 30, [[0, "rgba(255, 235, 140, 0.5)"], [0.6, "rgba(255, 200, 60, 0.2)"], [1, "rgba(255, 180, 40, 0)"]]);
      ellipse(ctx, 32, 24, 28, 22, auraGrad);

      // Contact AO under resolute stance boots
      ellipse(ctx, 22.5, 58, 6.5, 2, "rgba(8, 12, 20, 0.75)");
      ellipse(ctx, 41.5, 58, 6.5, 2, "rgba(8, 12, 20, 0.75)");

      // Cape billowing wide on both sides (3-stop gradients)
      poly(ctx, [[18, 28], [2, 38], [6, 58], [22, 54]], linGrad(ctx, 2, 28, 22, 58, [[0, "#6ea6ea"], [0.5, "#325c94"], [1, "#142438"]]), "#0c1828", 1.8);
      poly(ctx, [[46, 28], [62, 38], [58, 58], [42, 54]], linGrad(ctx, 42, 28, 62, 58, [[0, "#6ea6ea"], [0.5, "#325c94"], [1, "#142438"]]), "#0c1828", 1.8);
      poly(ctx, [[20, 28], [44, 28], [48, 60], [32, 64], [16, 60]], linGrad(ctx, 16, 28, 48, 64, [[0, "#6ea6ea"], [0.5, "#2a4870"], [1, "#101e30"]]), "#0c1828", 1.8);

      // Cool rim on left billowing cape
      ctx.strokeStyle = "rgba(210, 240, 255, 0.5)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(18, 28);
      ctx.lineTo(2, 38);
      ctx.lineTo(6, 58);
      ctx.stroke();

      // Wide resolute stance
      rounded(ctx, 19, 44, 9, 16, 3, linGrad(ctx, 19, 44, 28, 60, [[0, "#4a70a2"], [0.5, "#264870"], [1, "#122238"]]), "#0e1828", 1.2);
      rounded(ctx, 36, 44, 9, 16, 3, linGrad(ctx, 36, 44, 45, 60, [[0, "#4a70a2"], [0.5, "#264870"], [1, "#122238"]]), "#0e1828", 1.2);
      // Cool rim on left leg
      ctx.strokeStyle = "rgba(210, 240, 255, 0.45)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(19, 45);
      ctx.lineTo(19, 55);
      ctx.stroke();

      rounded(ctx, 17, 55, 11, 6, 2, linGrad(ctx, 17, 55, 17, 61, [[0, "#283850"], [0.5, "#182438"], [1, "#0a101c"]]), "#0e1828", 1);
      rounded(ctx, 36, 55, 11, 6, 2, linGrad(ctx, 36, 55, 36, 61, [[0, "#283850"], [0.5, "#182438"], [1, "#0a101c"]]), "#0e1828", 1);
      ellipse(ctx, 23, 46, 3.5, 3, linGrad(ctx, 20, 43, 26, 49, [[0, "#fff6b8"], [0.5, "#f0d060"], [1, "#8c6018"]]), "#4a3010", 0.8);
      ellipse(ctx, 41, 46, 3.5, 3, linGrad(ctx, 38, 43, 44, 49, [[0, "#fff6b8"], [0.5, "#f0d060"], [1, "#8c6018"]]), "#4a3010", 0.8);

      // Contact AO under chestplate
      ellipse(ctx, 32, 46, 14, 2.5, "rgba(10, 16, 28, 0.6)");

      // Torso proud with glowing trim
      rounded(ctx, 18, 25, 28, 25, 6, linGrad(ctx, 18, 25, 46, 50, [[0, "#9ec8ff"], [0.5, "#3870b8"], [1, "#183860"]]), "#0c1828", 2);
      // Cool rim on left torso
      ctx.strokeStyle = "rgba(210, 240, 255, 0.55)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(19, 36);
      ctx.lineTo(19, 28);
      ctx.arcTo(19, 25, 25, 25, 5);
      ctx.stroke();

      ctx.strokeStyle = "#ffe070";
      ctx.lineWidth = 2;
      ctx.strokeRect(22, 29, 20, 14);
      poly(ctx, [[32, 31], [36, 36], [32, 41], [28, 36]], linGrad(ctx, 28, 31, 36, 41, [[0, "#ffffff"], [0.5, "#fff280"], [1, "#9c6818"]]), "#4a3010", 1);
      rounded(ctx, 20, 46, 24, 4, 1, linGrad(ctx, 20, 46, 44, 50, [[0, "#4a301c"], [1, "#1c1008"]]), "#120c06", 1);
      rounded(ctx, 30, 45, 4, 6, 1, linGrad(ctx, 30, 45, 34, 51, [[0, "#ffffff"], [0.5, "#ffe070"], [1, "#9c6818"]]), "#4a3010", 0.8);

      // Contact AO under chin onto gorget
      ellipse(ctx, 32, 26, 10, 3, "rgba(12, 16, 28, 0.65)");

      // Head & helm with crown crest
      ellipse(ctx, 32, 17, 11, 11, linGrad(ctx, 22, 7, 42, 27, [[0, "#fff4dc"], [0.45, "#e8b87e"], [1, "#a86c34"]]), "#4a3018", 1.6);
      rounded(ctx, 20, 6, 24, 10, 3, linGrad(ctx, 20, 6, 44, 16, [[0, "#fff8b0"], [0.6, "#f0c840"], [1, "#a87828"]]), "#4a3010", 1.5);
      poly(ctx, [[32, 0], [26, 7], [38, 7]], linGrad(ctx, 26, 0, 38, 7, [[0, "#ffffff"], [0.5, "#fff280"], [1, "#a87828"]]), "#4a3010", 1);
      poly(ctx, [[21, 3], [18, 8], [24, 8]], linGrad(ctx, 18, 3, 24, 8, [[0, "#fff490"], [1, "#a87828"]]), "#4a3010", 0.8);
      poly(ctx, [[43, 3], [40, 8], [46, 8]], linGrad(ctx, 40, 3, 46, 8, [[0, "#fff490"], [1, "#a87828"]]), "#4a3010", 0.8);

      // Cool rim light on crown top & left peaks
      ctx.strokeStyle = "rgba(215, 245, 255, 0.65)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(18, 8);
      ctx.lineTo(21, 3);
      ctx.lineTo(24, 8);
      ctx.lineTo(26, 7);
      ctx.lineTo(32, 0);
      ctx.stroke();

      face(ctx, 32, 17, "#fff8d0", "#101008", true);
      ellipse(ctx, 32, 22, 2.5, 2, "#4a1c14", "#2a0a06", 0.8);

      // Shield raised outward with contact AO
      ellipse(ctx, 11, 38, 7, 12, "rgba(12, 16, 28, 0.45)");
      poly(ctx, [[4, 26], [18, 23], [20, 46], [12, 53], [3, 46]], linGrad(ctx, 3, 23, 20, 53, [[0, "#fffde0"], [0.5, "#f0ca50"], [1, "#987020"]]), "#3a2810", 1.6);
      poly(ctx, [[11, 32], [14, 36], [11, 40], [8, 36]], linGrad(ctx, 8, 32, 14, 40, [[0, "#3e68a8"], [1, "#14223c"]]), "#0e1828", 1);
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(6, 26, 11, 18);
      // Cool rim on raised shield
      ctx.strokeStyle = "rgba(215, 245, 255, 0.65)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(4, 26);
      ctx.lineTo(18, 23);
      ctx.stroke();

      // Raised sword skyward
      rounded(ctx, 42, 16, 8, 18, 3, linGrad(ctx, 42, 16, 50, 34, [[0, "#9ec8ff"], [1, "#285088"]]), "#0c1828", 1.5);
      rounded(ctx, 39, 14, 14, 5, 2, linGrad(ctx, 39, 14, 53, 19, [[0, "#fff0a0"], [1, "#9c6e20"]]), "#3a2410", 1);
      ellipse(ctx, 46, 21, 2.5, 2.5, linGrad(ctx, 44, 19, 48, 23, [[0, "#fff0a0"], [1, "#9c6e20"]]), "#3a2410", 0.8);
      ctx.strokeStyle = "#eef4ff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(46, 14);
      ctx.lineTo(46, 3);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(46, 14);
      ctx.lineTo(46, 3);
      ctx.stroke();
      // Radiant star flare at blade tip
      poly(ctx, [[46, 0], [48, 3], [52, 3], [49, 6], [50, 10], [46, 7], [42, 10], [43, 6], [40, 3], [44, 3]], "#fffbbf", "#d4af37", 0.8);
      ellipse(ctx, 46, 4, 3.5, 3.5, "rgba(255,255,255,0.95)");
      ctx.strokeStyle = "rgba(255, 235, 120, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(53, 2);
      ctx.lineTo(57, 1);
      ctx.moveTo(39, 2);
      ctx.lineTo(35, 1);
      ctx.stroke();
    };

    make("hero_captain_idle", 64, 72, drawHeroCaptainIdle);
    make("hero_captain", 64, 72, drawHeroCaptainIdle);
    make("hero_captain_attack", 64, 72, drawHeroCaptainAttack);
    make("hero_captain_ability", 64, 72, drawHeroCaptainAbility);

    // —— Props ——
    make("tree_pine", 56, 72, (ctx) => {
      shadow(ctx, 28, 64, 18, 5, 0.28);
      // trunk
      rounded(ctx, 24, 44, 10, 20, 2, linGrad(ctx, 24, 44, 34, 64, [[0, "#8a6038"], [1, "#3a2410"]]), "#1a1008", 1.2);
      // bark lines
      ctx.strokeStyle = "rgba(40,20,10,.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(27, 48);
      ctx.lineTo(26, 60);
      ctx.moveTo(31, 50);
      ctx.lineTo(32, 62);
      ctx.stroke();
      // layered foliage
      const layers = [
        [[28, 8], [8, 32], [20, 28], [6, 46], [50, 46], [36, 28], [48, 32]],
        [[28, 18], [12, 40], [22, 36], [10, 52], [46, 52], [34, 36], [44, 40]],
      ];
      for (const pts of layers) {
        poly(ctx, pts, linGrad(ctx, 10, 8, 48, 52, [[0, "#8ec060"], [0.5, "#3a6a30"], [1, "#1a3818"]]), "#0e2010", 1.5);
      }
      // snow/highlight tips
      ctx.strokeStyle = "rgba(220,245,180,.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(24, 16);
      ctx.lineTo(18, 28);
      ctx.moveTo(34, 22);
      ctx.lineTo(40, 34);
      ctx.stroke();
    });

    make("tree_oak", 64, 64, (ctx) => {
      shadow(ctx, 32, 56, 20, 5, 0.28);
      rounded(ctx, 28, 34, 10, 22, 2, linGrad(ctx, 28, 34, 38, 56, [[0, "#a07040"], [1, "#4a2810"]]), "#1a1008", 1.2);
      ellipse(ctx, 32, 26, 24, 20, linGrad(ctx, 12, 10, 52, 42, [[0, "#90c050"], [0.5, "#4a8030"], [1, "#204018"]]), "#142810", 2);
      ellipse(ctx, 22, 22, 10, 8, "rgba(160,220,100,.35)");
      ellipse(ctx, 40, 18, 8, 6, "rgba(200,240,140,.25)");
    });

    make("rock_moss", 40, 28, (ctx) => {
      shadow(ctx, 20, 22, 16, 5, 0.28);
      poly(
        ctx,
        [[6, 18], [10, 8], [22, 4], [34, 10], [36, 20], [24, 24], [8, 22]],
        linGrad(ctx, 6, 4, 36, 24, [[0, "#a8aca0"], [0.5, "#686c64"], [1, "#383c34"]]),
        "#1e221c",
        1.5
      );
      ellipse(ctx, 14, 10, 7, 3, "rgba(140,190,80,.55)");
      ellipse(ctx, 26, 14, 5, 2.5, "rgba(120,170,70,.4)");
      speckles(ctx, 8, 8, 24, 12, 10, "rgba(0,0,0,.15)", 1);
    });

    make("bush_round", 36, 28, (ctx) => {
      shadow(ctx, 18, 22, 14, 4, 0.25);
      ellipse(ctx, 18, 14, 15, 11, linGrad(ctx, 6, 6, 30, 22, [[0, "#7ab048"], [1, "#2a5018"]]), "#142810", 1.5);
      ellipse(ctx, 12, 12, 6, 5, "rgba(160,220,90,.4)");
      // berries
      ellipse(ctx, 22, 14, 2, 2, "#d04040");
      ellipse(ctx, 16, 16, 1.8, 1.8, "#e05050");
    });

    make("flower_patch", 28, 20, (ctx) => {
      for (const [x, y, c] of [
        [8, 12, "#f0d060"],
        [16, 8, "#f080a0"],
        [22, 13, "#80c0f0"],
        [12, 14, "#f0a040"],
      ]) {
        ellipse(ctx, x, y, 4, 4, c);
        ellipse(ctx, x, y, 1.5, 1.5, "#fff8c0");
      }
      // stems
      ctx.strokeStyle = "#3a6820";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(8, 12);
      ctx.lineTo(8, 18);
      ctx.moveTo(16, 8);
      ctx.lineTo(16, 18);
      ctx.moveTo(22, 13);
      ctx.lineTo(22, 18);
      ctx.stroke();
    });

    make("ruin_pillar", 28, 48, (ctx) => {
      shadow(ctx, 14, 42, 12, 4, 0.28);
      rounded(ctx, 6, 8, 16, 34, 2, linGrad(ctx, 6, 8, 22, 42, [[0, "#b0a890"], [1, "#585040"]]), "#2a2418", 1.5);
      rounded(ctx, 4, 6, 20, 8, 2, "#c8c0a8", "#2a2418", 1.2);
      rounded(ctx, 4, 38, 20, 6, 2, "#8a8070", "#2a2418", 1.2);
      ellipse(ctx, 12, 20, 4, 2, "rgba(100,160,70,.4)");
    });

    make("banner_flag", 28, 44, (ctx) => {
      // pole
      rounded(ctx, 6, 2, 4, 40, 1, "#6a4830", "#2a1810", 1);
      poly(ctx, [[10, 4], [26, 10], [22, 18], [26, 26], [10, 22]], linGrad(ctx, 10, 4, 26, 26, [[0, "#e07050"], [1, "#802018"]]), "#3a1008", 1.2);
      ellipse(ctx, 8, 2, 3, 3, "#d0a040");
    });

    make("gate_arch", 96, 56, (ctx) => {
      // stone arch
      rounded(ctx, 4, 12, 88, 40, 6, linGrad(ctx, 4, 12, 92, 52, [[0, "#8a7860"], [0.5, "#5a4a38"], [1, "#2a2018"]]), "#1a140e", 2.5);
      // opening
      rounded(ctx, 28, 20, 40, 32, 8, "#0c0a08");
      // wood doors slightly ajar
      rounded(ctx, 30, 24, 16, 28, 2, linGrad(ctx, 30, 24, 46, 52, [[0, "#8a6038"], [1, "#3a2010"]]), "#1a1008", 1.5);
      rounded(ctx, 50, 24, 16, 28, 2, linGrad(ctx, 50, 24, 66, 52, [[0, "#7a5028"], [1, "#2a1808"]]), "#1a1008", 1.5);
      // iron
      ctx.strokeStyle = "#c0a060";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(34, 32, 8, 8);
      ctx.strokeRect(54, 32, 8, 8);
      // battlements
      for (let i = 0; i < 6; i += 1) {
        rounded(ctx, 8 + i * 14, 4, 10, 12, 2, linGrad(ctx, 0, 4, 0, 16, [[0, "#a89878"], [1, "#5a4a30"]]), "#1a140e", 1.2);
      }
      // lanterns
      ellipse(ctx, 20, 28, 4, 5, radGrad(ctx, 20, 27, 1, 5, [[0, "#fff8c0"], [1, "rgba(255,140,40,.2)"]]));
      ellipse(ctx, 76, 28, 4, 5, radGrad(ctx, 76, 27, 1, 5, [[0, "#fff8c0"], [1, "rgba(255,140,40,.2)"]]));
    });

    make("cloud_soft", 80, 36, (ctx) => {
      ellipse(ctx, 24, 20, 18, 12, "rgba(255,255,255,.22)");
      ellipse(ctx, 42, 16, 22, 14, "rgba(255,255,255,.28)");
      ellipse(ctx, 58, 20, 16, 11, "rgba(255,255,255,.2)");
    });

    make("path_mark", 24, 16, (ctx) => {
      ellipse(ctx, 12, 8, 10, 5, "rgba(60,40,20,.25)");
      rounded(ctx, 4, 5, 16, 6, 2, "rgba(180,150,100,.35)");
    });

    // UI chip icons for shop
    make("icon_gold", 24, 24, (ctx) => {
      ellipse(ctx, 12, 12, 10, 10, linGrad(ctx, 4, 4, 20, 20, [[0, "#fff0a0"], [0.5, "#e0a830"], [1, "#8a6010"]]), "#5a4010", 1.5);
      ctx.fillStyle = "#8a6010";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("G", 12, 13);
    });

    make("icon_heart", 24, 24, (ctx) => {
      ctx.fillStyle = "#e05050";
      ctx.beginPath();
      ctx.moveTo(12, 20);
      ctx.bezierCurveTo(4, 14, 2, 8, 7, 5);
      ctx.bezierCurveTo(10, 3, 12, 6, 12, 8);
      ctx.bezierCurveTo(12, 6, 14, 3, 17, 5);
      ctx.bezierCurveTo(22, 8, 20, 14, 12, 20);
      ctx.fill();
      ctx.strokeStyle = "#601818";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    make("campaign_board_bg", 360, 300, (ctx) => {
      // Wood/leather outer frame
      rounded(ctx, 0, 0, 360, 300, 14, linGrad(ctx, 0, 0, 360, 300, [
        [0, "#2c2016"],
        [0.5, "#1e160e"],
        [1, "#140e08"]
      ]), "#4a3824", 3);

      // Gold frame inlay line
      rounded(ctx, 6, 6, 348, 288, 10, null, "#c8a450", 1.5);

      // Parchment map inner background
      const mapGrad = ctx.createLinearGradient(0, 0, 360, 300);
      mapGrad.addColorStop(0, "#e8d8b4");
      mapGrad.addColorStop(0.35, "#d6c296");
      mapGrad.addColorStop(0.7, "#c4b082");
      mapGrad.addColorStop(1, "#b09c70");
      rounded(ctx, 10, 10, 340, 280, 8, mapGrad, "#2a1e12", 2);

      // Painted Regions on the parchment:
      // 1. Forest Gate region (bottom-left)
      ellipse(ctx, 95, 235, 85, 55, radGrad(ctx, 95, 235, 10, 85, [
        [0, "rgba(86, 128, 70, 0.45)"],
        [0.7, "rgba(60, 96, 48, 0.3)"],
        [1, "rgba(60, 96, 48, 0)"]
      ]));
      for (const [tx, ty, r] of [[45, 240, 9], [65, 220, 11], [75, 255, 10], [120, 245, 12], [140, 225, 9]]) {
        ellipse(ctx, tx, ty, r, r * 0.9, "#486838", "#24381b", 0.8);
      }

      // 2. Stone Pass region (middle)
      ellipse(ctx, 195, 160, 90, 60, radGrad(ctx, 195, 160, 10, 90, [
        [0, "rgba(100, 115, 130, 0.4)"],
        [0.7, "rgba(70, 82, 94, 0.25)"],
        [1, "rgba(70, 82, 94, 0)"]
      ]));
      poly(ctx, [[140, 160], [165, 125], [190, 160]], "#62707c", "#2c343c", 1);
      poly(ctx, [[175, 155], [200, 115], [225, 155]], "#748492", "#2c343c", 1);
      poly(ctx, [[210, 165], [235, 130], [260, 165]], "#586470", "#2c343c", 1);
      poly(ctx, [[192, 128], [200, 115], [208, 128]], "#e8f0f8");

      // 3. Ember Marsh region (top-right)
      ellipse(ctx, 285, 95, 75, 55, radGrad(ctx, 285, 95, 10, 75, [
        [0, "rgba(140, 50, 30, 0.45)"],
        [0.7, "rgba(90, 32, 18, 0.25)"],
        [1, "rgba(90, 32, 18, 0)"]
      ]));
      ctx.strokeStyle = "#e85820";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(250, 110);
      ctx.quadraticCurveTo(280, 85, 320, 100);
      ctx.stroke();
      ctx.strokeStyle = "#ffc030";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(250, 110);
      ctx.quadraticCurveTo(280, 85, 320, 100);
      ctx.stroke();

      // Winding road connecting regions
      ctx.strokeStyle = "rgba(160, 125, 80, 0.5)";
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(70, 230);
      ctx.bezierCurveTo(110, 210, 140, 180, 180, 160);
      ctx.bezierCurveTo(215, 140, 240, 110, 280, 90);
      ctx.stroke();

      ctx.strokeStyle = "rgba(220, 185, 125, 0.8)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(70, 230);
      ctx.bezierCurveTo(110, 210, 140, 180, 180, 160);
      ctx.bezierCurveTo(215, 140, 240, 110, 280, 90);
      ctx.stroke();

      // Compass Rose in bottom-right corner
      const cx = 315;
      const cy = 245;
      ellipse(ctx, cx, cy, 17, 17, "rgba(230, 210, 170, 0.6)", "#6a5030", 1);
      poly(ctx, [[cx, cy - 15], [cx + 4, cy - 3], [cx, cy], [cx - 4, cy - 3]], "#8a2424");
      poly(ctx, [[cx, cy + 15], [cx + 4, cy + 3], [cx, cy], [cx - 4, cy + 3]], "#4a3824");
      poly(ctx, [[cx + 15, cy], [cx + 3, cy + 4], [cx, cy], [cx + 3, cy - 4]], "#4a3824");
      poly(ctx, [[cx - 15, cy], [cx - 3, cy + 4], [cx, cy], [cx - 3, cy - 4]], "#4a3824");

      // Banner Ribbon Title at top of map
      rounded(ctx, 100, 16, 160, 24, 4, linGrad(ctx, 100, 16, 260, 40, [[0, "#3a2a1b"], [1, "#1e140a"]]), "#c8a450", 1.2);
      ctx.fillStyle = "#f5d88c";
      ctx.font = "bold 11px Cinzel, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("KINGDOM OF KRC", 180, 28);
    });
  };

  window.KRCArt = { bake };
})();
