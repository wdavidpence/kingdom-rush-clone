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

    make("tower_archer", 96, 96, (ctx) => {
      const cfg = {
        stoneHi: "#9aab7a",
        stone: "#6a8050",
        stoneLo: "#3a4a2c",
        woodHi: "#c4a060",
        woodLo: "#6a4828",
      };
      towerBase(ctx, cfg);
      // watchtower cabin
      rounded(ctx, 30, 22, 36, 28, 4, linGrad(ctx, 30, 22, 66, 50, [[0, "#8fbe62"], [0.5, "#5a8a3e"], [1, "#2e4e24"]]), "#1e2a14", 2.2);
      // window slit
      rounded(ctx, 42, 30, 12, 14, 2, "#1a140c", "rgba(255,230,150,.3)", 1);
      // archer silhouette
      ellipse(ctx, 48, 26, 5, 5, "#f0d0a0", "#3a2818", 1);
      ctx.strokeStyle = "#e8d090";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(48, 28, 8, -1.2, 1.2);
      ctx.stroke();
      // peaked thatch roof
      roofTiles(ctx, [[18, 28], [48, 4], [78, 28]], "#d8e070", "#6a9038", "#243018");
      // leaf trim
      ctx.strokeStyle = "#f5f0a0";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(24, 27);
      ctx.lineTo(48, 8);
      ctx.lineTo(72, 27);
      ctx.stroke();
      // hanging banner
      poly(ctx, [[28, 50], [28, 66], [34, 62], [40, 66], [40, 50]], "#4a8038", "#1a3018", 1);
      // ivy
      ctx.strokeStyle = "rgba(120,200,80,.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(26, 55);
      ctx.quadraticCurveTo(20, 62, 28, 72);
      ctx.stroke();
    });

    make("tower_mage", 96, 96, (ctx) => {
      const cfg = {
        stoneHi: "#9a8fd0",
        stone: "#5a5098",
        stoneLo: "#2e2860",
        woodHi: "#b0a0e0",
        woodLo: "#4a3a80",
      };
      towerBase(ctx, cfg);
      // crystal shaft
      poly(
        ctx,
        [[38, 70], [32, 28], [48, 10], [64, 28], [58, 70]],
        linGrad(ctx, 32, 10, 64, 70, [[0, "#e8e0ff"], [0.35, "#8a78e8"], [1, "#3a2a78"]]),
        "#1e1848",
        2.4
      );
      // glowing orb
      ellipse(ctx, 48, 22, 12, 12, radGrad(ctx, 44, 18, 2, 14, [[0, "#ffffff"], [0.4, "#c8b8ff"], [1, "rgba(80,60,180,.2)"]]), "#f0e8ff", 2);
      ellipse(ctx, 48, 22, 5, 5, "#ffffff");
      // rune rings
      ctx.strokeStyle = "rgba(230,210,255,.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(48, 40, 10, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(48, 52, 12, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      // floating sparks
      for (const [sx, sy] of [[28, 24], [68, 30], [36, 14], [60, 16]]) {
        ellipse(ctx, sx, sy, 2.2, 2.2, "rgba(220,200,255,.85)");
      }
      // purple pennant
      poly(ctx, [[62, 48], [78, 44], [74, 52], [78, 58], [62, 54]], "#a080ff", "#302060", 1);
    });

    make("tower_artillery", 96, 96, (ctx) => {
      const cfg = {
        stoneHi: "#c09058",
        stone: "#8a6038",
        stoneLo: "#4a3018",
        woodHi: "#e0b068",
        woodLo: "#7a4820",
      };
      towerBase(ctx, cfg);
      // timber frame
      woodPlank(ctx, 26, 24, 44, 30, "#c89858", "#6a4018");
      // mortar barrel
      rounded(ctx, 34, 18, 40, 16, 7, linGrad(ctx, 34, 18, 74, 34, [[0, "#6a5848"], [0.5, "#3a2c20"], [1, "#1a120c"]]), "#0e0a08", 2);
      ellipse(ctx, 74, 24, 7, 7, "#1a120c", "#f0c060", 2);
      ellipse(ctx, 74, 24, 3, 3, "#402818");
      // iron bands
      ctx.strokeStyle = "#d0a050";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(42, 20);
      ctx.lineTo(42, 32);
      ctx.moveTo(56, 19);
      ctx.lineTo(56, 33);
      ctx.stroke();
      // powder keg
      ellipse(ctx, 30, 42, 8, 10, linGrad(ctx, 24, 34, 36, 52, [[0, "#8a5030"], [1, "#3a2010"]]), "#1a1008", 1.5);
      // smoke puff
      ellipse(ctx, 80, 14, 6, 5, "rgba(200,190,170,.45)");
      ellipse(ctx, 86, 10, 4, 4, "rgba(200,190,170,.35)");
      // roof awning
      roofTiles(ctx, [[20, 30], [48, 12], [76, 30]], "#f0b050", "#a06028", "#3a2010");
    });

    make("tower_barracks", 96, 96, (ctx) => {
      const cfg = {
        stoneHi: "#c0a868",
        stone: "#8a7440",
        stoneLo: "#4a3c22",
        woodHi: "#e8d080",
        woodLo: "#8a6828",
      };
      towerBase(ctx, cfg);
      // fort keep
      rounded(ctx, 26, 20, 44, 34, 4, linGrad(ctx, 26, 20, 70, 54, [[0, "#e0c878"], [0.45, "#a88840"], [1, "#5a4820"]]), "#2a1e10", 2.2);
      // door
      rounded(ctx, 40, 36, 16, 18, 3, "#2a1a10", "#d0b060", 1.5);
      ellipse(ctx, 52, 46, 1.5, 1.5, "#f0d070");
      // crenellations
      for (let i = 0; i < 4; i += 1) {
        rounded(ctx, 28 + i * 11, 12, 8, 12, 2, linGrad(ctx, 0, 12, 0, 24, [[0, "#f0e0a0"], [1, "#8a7030"]]), "#2a1e10", 1.2);
      }
      // crest shield
      poly(ctx, [[48, 22], [58, 28], [54, 40], [48, 44], [42, 40], [38, 28]], linGrad(ctx, 38, 22, 58, 44, [[0, "#fff0b0"], [1, "#c09030"]]), "#3a2810", 1.5);
      ctx.strokeStyle = "#5a3818";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(48, 26);
      ctx.lineTo(48, 40);
      ctx.moveTo(42, 32);
      ctx.lineTo(54, 32);
      ctx.stroke();
      // torch
      rounded(ctx, 70, 34, 4, 14, 1, "#4a3018");
      ellipse(ctx, 72, 30, 5, 7, radGrad(ctx, 72, 28, 1, 7, [[0, "#fff8c0"], [0.4, "#ff9020"], [1, "rgba(180,40,0,.1)"]]));
    });

    // —— Enemies ——
    const limbs = (ctx, skin, outline, y = 42) => {
      // legs
      rounded(ctx, 28, y, 7, 14, 3, skin, outline, 1.4);
      rounded(ctx, 41, y, 7, 14, 3, skin, outline, 1.4);
      // boots
      rounded(ctx, 26, y + 11, 10, 5, 2, "#3a2818", outline, 1);
      rounded(ctx, 40, y + 11, 10, 5, 2, "#3a2818", outline, 1);
    };

    const face = (ctx, cx, cy, eye = "#f6f0c2", pupil = "#101008", angry = false) => {
      ellipse(ctx, cx - 5, cy, 2.4, 2.8, eye);
      ellipse(ctx, cx + 5, cy, 2.4, 2.8, eye);
      ellipse(ctx, cx - 4.5, cy + 0.3, 1.2, 1.5, pupil);
      ellipse(ctx, cx + 5.5, cy + 0.3, 1.2, 1.5, pupil);
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
      // cheek highlight
      ctx.strokeStyle = "rgba(255,255,255,.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 4, 5, Math.PI, Math.PI * 1.5);
      ctx.stroke();
    };

    make("enemy_scout", 80, 72, (ctx) => {
      shadow(ctx, 40, 62, 20, 6);
      limbs(ctx, "#6a9038", "#2a4018", 44);
      // body tunic
      rounded(ctx, 26, 28, 28, 22, 8, linGrad(ctx, 26, 28, 54, 50, [[0, "#d8f080"], [0.5, "#8aba48"], [1, "#3a6020"]]), "#2a4018", 2);
      // head
      ellipse(ctx, 40, 22, 13, 13, linGrad(ctx, 30, 12, 50, 34, [[0, "#e0f890"], [1, "#6a9030"]]), "#2a4018", 2);
      // ears
      poly(ctx, [[26, 18], [18, 10], [28, 22]], "#8aba48", "#2a4018", 1.2);
      poly(ctx, [[54, 18], [62, 10], [52, 22]], "#8aba48", "#2a4018", 1.2);
      face(ctx, 40, 22);
      // spear
      ctx.strokeStyle = "#8a6030";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(54, 48);
      ctx.lineTo(68, 12);
      ctx.stroke();
      poly(ctx, [[68, 8], [72, 16], [64, 14]], "#d0d8e0", "#3a4048", 1);
      // arm
      rounded(ctx, 48, 32, 12, 6, 3, "#6a9038", "#2a4018", 1.2);
    });

    make("enemy_brute", 80, 72, (ctx) => {
      shadow(ctx, 40, 62, 24, 7);
      limbs(ctx, "#8a5030", "#3a2010", 44);
      rounded(ctx, 22, 26, 36, 26, 10, linGrad(ctx, 22, 26, 58, 52, [[0, "#f0c080"], [0.5, "#c07038"], [1, "#603018"]]), "#3a2010", 2.2);
      // shoulders
      ellipse(ctx, 24, 32, 8, 8, "#a05828", "#3a2010", 1.5);
      ellipse(ctx, 56, 32, 8, 8, "#a05828", "#3a2010", 1.5);
      ellipse(ctx, 40, 18, 15, 14, linGrad(ctx, 28, 8, 52, 30, [[0, "#f8d0a0"], [1, "#a05828"]]), "#3a2010", 2);
      // tusks / horns
      ellipse(ctx, 26, 10, 5, 7, "#e8d0a8", "#4a3018", 1.2);
      ellipse(ctx, 54, 10, 5, 7, "#e8d0a8", "#4a3018", 1.2);
      face(ctx, 40, 18, "#f8f0c8", "#101008", true);
      // club
      rounded(ctx, 58, 28, 10, 28, 4, linGrad(ctx, 58, 28, 68, 56, [[0, "#8a6040"], [1, "#3a2010"]]), "#1a1008", 1.5);
      ellipse(ctx, 63, 28, 9, 8, "#6a4830", "#1a1008", 1.5);
      speckles(ctx, 54, 22, 18, 14, 8, "rgba(0,0,0,.25)", 1.5);
    });

    make("enemy_shield", 80, 72, (ctx) => {
      shadow(ctx, 40, 62, 22, 6);
      limbs(ctx, "#8a9098", "#2a3038", 44);
      // plate body
      rounded(ctx, 26, 26, 28, 24, 6, linGrad(ctx, 26, 26, 54, 50, [[0, "#e8eef0"], [0.5, "#98a0a8"], [1, "#4a545c"]]), "#2a3038", 2.2);
      // helmet
      ellipse(ctx, 40, 18, 14, 13, linGrad(ctx, 28, 8, 52, 30, [[0, "#f0f4f8"], [1, "#6a747c"]]), "#2a3038", 2);
      rounded(ctx, 28, 12, 24, 8, 3, "#4a545c", "#1a2028", 1);
      // visor slit
      rounded(ctx, 32, 18, 16, 4, 1, "#0a0c10");
      // kite shield
      poly(
        ctx,
        [[18, 24], [34, 22], [36, 48], [26, 56], [16, 48]],
        linGrad(ctx, 16, 22, 36, 56, [[0, "#d0d8e0"], [0.5, "#708090"], [1, "#384048"]]),
        "#1a2028",
        2
      );
      poly(ctx, [[22, 30], [30, 30], [28, 42], [24, 42]], "#c0a040", "#4a3810", 1);
      // sword
      ctx.strokeStyle = "#c0c8d0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(54, 50);
      ctx.lineTo(64, 18);
      ctx.stroke();
      rounded(ctx, 50, 48, 12, 5, 2, "#6a4830", "#2a1810", 1);
    });

    make("enemy_ember", 80, 72, (ctx) => {
      shadow(ctx, 40, 62, 18, 5, 0.3);
      // flame body
      poly(
        ctx,
        [[40, 6], [24, 28], [30, 30], [20, 48], [34, 42], [40, 58], [46, 42], [60, 48], [50, 30], [56, 28]],
        linGrad(ctx, 40, 6, 40, 58, [[0, "#fff8c0"], [0.35, "#ffb040"], [0.7, "#e04820"], [1, "#601808"]]),
        "#4a1808",
        2
      );
      ellipse(ctx, 40, 36, 14, 16, radGrad(ctx, 36, 30, 2, 18, [[0, "#fff8e0"], [0.4, "#ff9040"], [1, "rgba(160,30,10,.15)"]]));
      // eyes
      ellipse(ctx, 34, 32, 3, 4, "#fff8c0");
      ellipse(ctx, 46, 32, 3, 4, "#fff8c0");
      ellipse(ctx, 34, 32, 1.5, 2, "#401008");
      ellipse(ctx, 46, 32, 1.5, 2, "#401008");
      // embers
      for (const [x, y, r] of [[22, 18, 3], [58, 22, 2.5], [30, 10, 2], [52, 12, 2.5], [44, 4, 2]]) {
        ellipse(ctx, x, y, r, r, "rgba(255,200,80,.75)");
      }
    });

    make("enemy_brood", 80, 72, (ctx) => {
      shadow(ctx, 40, 60, 22, 6);
      // spider legs
      ctx.strokeStyle = "#4a2030";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      for (const [x0, y0, x1, y1] of [
        [28, 36, 10, 28],
        [28, 40, 8, 44],
        [28, 44, 12, 56],
        [52, 36, 70, 28],
        [52, 40, 72, 44],
        [52, 44, 68, 56],
      ]) {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo((x0 + x1) / 2, y0 - 8, x1, y1);
        ctx.stroke();
      }
      // abdomen
      ellipse(ctx, 40, 44, 16, 14, linGrad(ctx, 28, 34, 52, 56, [[0, "#f0b0c8"], [0.5, "#b05878"], [1, "#501828"]]), "#301018", 2);
      // thorax + head
      ellipse(ctx, 40, 28, 12, 11, linGrad(ctx, 30, 20, 50, 38, [[0, "#f8c0d0"], [1, "#803050"]]), "#301018", 2);
      // multi eyes
      for (const [dx, dy] of [[-5, -2], [5, -2], [-3, 3], [3, 3], [0, -5]]) {
        ellipse(ctx, 40 + dx, 26 + dy, 1.8, 1.8, "#ffe060");
        ellipse(ctx, 40 + dx, 26 + dy, 0.8, 0.8, "#101008");
      }
      // fangs
      poly(ctx, [[36, 34], [34, 40], [38, 36]], "#f0e0f0", "#401828", 1);
      poly(ctx, [[44, 34], [46, 40], [42, 36]], "#f0e0f0", "#401828", 1);
    });

    make("enemy_flyer", 80, 72, (ctx) => {
      shadow(ctx, 40, 60, 16, 5, 0.25);
      // wings
      poly(
        ctx,
        [[30, 30], [8, 18], [4, 28], [12, 36], [28, 38]],
        linGrad(ctx, 4, 18, 30, 38, [[0, "rgba(200,245,255,.85)"], [1, "rgba(60,140,180,.55)"]]),
        "#4aa0c0",
        1.5
      );
      poly(
        ctx,
        [[50, 30], [72, 18], [76, 28], [68, 36], [52, 38]],
        linGrad(ctx, 50, 18, 76, 38, [[0, "rgba(200,245,255,.85)"], [1, "rgba(60,140,180,.55)"]]),
        "#4aa0c0",
        1.5
      );
      // body
      ellipse(ctx, 40, 36, 14, 16, linGrad(ctx, 28, 22, 52, 50, [[0, "#e0f8ff"], [0.5, "#60c0e0"], [1, "#206080"]]), "#184858", 2);
      ellipse(ctx, 40, 24, 10, 10, linGrad(ctx, 32, 16, 48, 32, [[0, "#f0fcff"], [1, "#48a0c0"]]), "#184858", 1.8);
      face(ctx, 40, 24, "#e8f8ff", "#082028");
      // horn crest
      poly(ctx, [[40, 10], [34, 18], [46, 18]], "#a0e0f0", "#184858", 1.2);
      // tail
      ctx.strokeStyle = "#48a0c0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, 50);
      ctx.quadraticCurveTo(48, 58, 56, 54);
      ctx.stroke();
    });

    make("enemy_hexer", 80, 72, (ctx) => {
      shadow(ctx, 40, 62, 20, 6);
      limbs(ctx, "#6a5090", "#2a1848", 44);
      // robe
      poly(
        ctx,
        [[24, 28], [56, 28], [60, 54], [40, 58], [20, 54]],
        linGrad(ctx, 24, 28, 56, 58, [[0, "#d0c0ff"], [0.45, "#7858c8"], [1, "#302058"]]),
        "#201038",
        2.2
      );
      // hood
      poly(ctx, [[24, 30], [40, 8], [56, 30], [48, 34], [40, 20], [32, 34]], linGrad(ctx, 24, 8, 56, 34, [[0, "#e8d8ff"], [1, "#4a3080"]]), "#201038", 2);
      // face shadow
      ellipse(ctx, 40, 28, 8, 7, "#1a1030");
      ellipse(ctx, 36, 28, 2, 2.2, "#c080ff");
      ellipse(ctx, 44, 28, 2, 2.2, "#c080ff");
      // staff
      ctx.strokeStyle = "#6a4830";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(58, 58);
      ctx.lineTo(66, 12);
      ctx.stroke();
      ellipse(ctx, 66, 12, 8, 8, radGrad(ctx, 64, 10, 1, 8, [[0, "#fff"], [0.4, "#c0a0ff"], [1, "rgba(80,40,160,.2)"]]), "#e0d0ff", 1.5);
      // rune motes
      for (const [x, y] of [[22, 20], [30, 14], [50, 16]]) ellipse(ctx, x, y, 2, 2, "rgba(200,160,255,.8)");
    });

    make("enemy_titan", 88, 80, (ctx) => {
      shadow(ctx, 44, 70, 30, 8);
      // heavy legs
      rounded(ctx, 28, 48, 12, 20, 4, linGrad(ctx, 28, 48, 40, 68, [[0, "#b0a898"], [1, "#4a4038"]]), "#2a241e", 2);
      rounded(ctx, 48, 48, 12, 20, 4, linGrad(ctx, 48, 48, 60, 68, [[0, "#b0a898"], [1, "#4a4038"]]), "#2a241e", 2);
      // torso
      rounded(ctx, 22, 24, 44, 32, 8, linGrad(ctx, 22, 24, 66, 56, [[0, "#d0c8b8"], [0.5, "#888078"], [1, "#403830"]]), "#2a241e", 2.4);
      // stone cracks
      ctx.strokeStyle = "rgba(30,24,18,.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(36, 28);
      ctx.lineTo(40, 44);
      ctx.lineTo(48, 38);
      ctx.moveTo(52, 30);
      ctx.lineTo(56, 48);
      ctx.stroke();
      // moss
      ellipse(ctx, 30, 36, 6, 3, "rgba(100,160,70,.45)");
      ellipse(ctx, 58, 42, 5, 3, "rgba(100,160,70,.4)");
      // head
      ellipse(ctx, 44, 18, 16, 14, linGrad(ctx, 30, 8, 58, 30, [[0, "#e0d8c8"], [1, "#686058"]]), "#2a241e", 2);
      // glowing eyes
      ellipse(ctx, 38, 18, 3, 3.5, "#ffe060");
      ellipse(ctx, 50, 18, 3, 3.5, "#ffe060");
      ellipse(ctx, 38, 18, 1.4, 1.8, "#402008");
      ellipse(ctx, 50, 18, 1.4, 1.8, "#402008");
      // brow ridge
      rounded(ctx, 30, 10, 28, 6, 2, "#585048", "#2a241e", 1);
      // fists
      ellipse(ctx, 18, 44, 10, 10, "#888078", "#2a241e", 2);
      ellipse(ctx, 70, 44, 10, 10, "#888078", "#2a241e", 2);
    });

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
    make("soldier_guard", 56, 60, (ctx) => {
      shadow(ctx, 28, 52, 18, 5);
      // legs
      rounded(ctx, 18, 36, 8, 14, 3, "#5a4830", "#2a1e10", 1.2);
      rounded(ctx, 30, 36, 8, 14, 3, "#5a4830", "#2a1e10", 1.2);
      // body armor
      rounded(ctx, 14, 22, 28, 20, 5, linGrad(ctx, 14, 22, 42, 42, [[0, "#e8d080"], [0.5, "#a88840"], [1, "#5a4020"]]), "#2a1e10", 1.8);
      // head
      ellipse(ctx, 28, 16, 10, 10, linGrad(ctx, 20, 8, 36, 24, [[0, "#ffe8b8"], [1, "#c09050"]]), "#4a3018", 1.6);
      // helm
      rounded(ctx, 18, 6, 20, 10, 4, linGrad(ctx, 18, 6, 38, 16, [[0, "#f0e0a0"], [1, "#8a7030"]]), "#3a2810", 1.4);
      ellipse(ctx, 24, 15, 1.6, 1.8, "#1a120c");
      ellipse(ctx, 32, 15, 1.6, 1.8, "#1a120c");
      // shield
      poly(ctx, [[10, 24], [20, 22], [22, 40], [16, 46], [8, 40]], linGrad(ctx, 8, 22, 22, 46, [[0, "#fff0b0"], [1, "#8a6820"]]), "#3a2810", 1.4);
      // spear
      ctx.strokeStyle = "#8a6030";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(40, 42);
      ctx.lineTo(48, 10);
      ctx.stroke();
      poly(ctx, [[48, 6], [52, 14], [44, 12]], "#d0d8e0", "#303840", 1);
    });

    make("hero_captain", 64, 72, (ctx) => {
      shadow(ctx, 32, 62, 22, 6, 0.4);
      // cape
      poly(ctx, [[18, 28], [46, 28], [52, 58], [32, 62], [12, 58]], linGrad(ctx, 18, 28, 46, 62, [[0, "#5a90d0"], [1, "#183050"]]), "#0c1828", 1.8);
      // legs
      rounded(ctx, 22, 44, 8, 16, 3, "#2a4060", "#101828", 1.2);
      rounded(ctx, 34, 44, 8, 16, 3, "#2a4060", "#101828", 1.2);
      // armor torso
      rounded(ctx, 18, 26, 28, 24, 6, linGrad(ctx, 18, 26, 46, 50, [[0, "#70a0e0"], [0.5, "#3060a0"], [1, "#183050"]]), "#0c1828", 2);
      // gold trim
      ctx.strokeStyle = "#e8c860";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(22, 30, 20, 14);
      // head
      ellipse(ctx, 32, 18, 11, 11, linGrad(ctx, 22, 8, 42, 28, [[0, "#ffe8b0"], [1, "#c09048"]]), "#4a3018", 1.6);
      // crown helm
      rounded(ctx, 20, 6, 24, 10, 3, linGrad(ctx, 20, 6, 44, 16, [[0, "#f8e080"], [1, "#a87828"]]), "#4a3010", 1.4);
      poly(ctx, [[32, 0], [26, 8], [38, 8]], "#f0d060", "#4a3010", 1);
      face(ctx, 32, 18);
      // shield
      poly(ctx, [[10, 28], [22, 26], [24, 48], [16, 54], [8, 48]], linGrad(ctx, 8, 26, 24, 54, [[0, "#fff0b8"], [1, "#a08030"]]), "#3a2810", 1.5);
      // sword
      ctx.strokeStyle = "#d0d8e8";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(48, 48);
      ctx.lineTo(56, 14);
      ctx.stroke();
      rounded(ctx, 44, 46, 12, 5, 2, "#8a6030", "#2a1810", 1);
      // blade tip glow
      ellipse(ctx, 56, 12, 3, 3, "rgba(200,220,255,.7)");
    });

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
