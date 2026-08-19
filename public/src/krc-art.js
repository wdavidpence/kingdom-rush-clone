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

    const drawScout = (ctx, frame = 0) => {
      shadow(ctx, 40, 62, 20, 6);
      const f = frame % 4;
      const bodyY = (f === 1 || f === 3) ? 26 : 28;
      const headY = (f === 1 || f === 3) ? 20 : 22;
      const earY = (f === 1 || f === 3) ? -2 : 0;

      const skin = "#6a9038";
      const skinDark = "#4f6e28";
      const outline = "#2a4018";
      const boot = "#3a2818";

      // Far/back arm (drawn behind torso)
      if (f === 0) {
        rounded(ctx, 20, bodyY + 6, 8, 5, 2.5, skinDark, outline, 1.2);
      } else if (f === 1) {
        rounded(ctx, 22, bodyY + 7, 8, 5, 2.5, skinDark, outline, 1.2);
      } else if (f === 2) {
        rounded(ctx, 25, bodyY + 8, 9, 5, 2.5, skinDark, outline, 1.2);
      } else {
        rounded(ctx, 22, bodyY + 7, 8, 5, 2.5, skinDark, outline, 1.2);
      }

      // Legs: stride contact vs passing
      if (f === 0) {
        // Left forward contact
        poly(ctx, [[28, 43], [34, 43], [27, 54], [21, 54]], skin, outline, 1.4);
        rounded(ctx, 18, 52, 11, 5, 2, boot, outline, 1);
        // Right back trailing
        poly(ctx, [[42, 43], [48, 43], [54, 52], [48, 53]], skinDark, outline, 1.4);
        rounded(ctx, 47, 51, 9, 5, 2, boot, outline, 1);
      } else if (f === 1) {
        // Left planted straight
        rounded(ctx, 29, 41, 7, 14, 3, skin, outline, 1.4);
        rounded(ctx, 27, 53, 11, 5, 2, boot, outline, 1);
        // Right lifted passing knee
        poly(ctx, [[42, 40], [48, 40], [50, 47], [44, 48]], skinDark, outline, 1.4);
        rounded(ctx, 44, 45, 9, 5, 2, boot, outline, 1);
      } else if (f === 2) {
        // Left back trailing
        poly(ctx, [[28, 43], [34, 43], [23, 53], [17, 52]], skinDark, outline, 1.4);
        rounded(ctx, 16, 51, 9, 5, 2, boot, outline, 1);
        // Right forward contact
        poly(ctx, [[42, 43], [48, 43], [53, 54], [47, 54]], skin, outline, 1.4);
        rounded(ctx, 45, 52, 11, 5, 2, boot, outline, 1);
      } else {
        // Left lifted passing knee
        poly(ctx, [[28, 40], [34, 40], [36, 47], [30, 48]], skinDark, outline, 1.4);
        rounded(ctx, 29, 45, 9, 5, 2, boot, outline, 1);
        // Right planted straight
        rounded(ctx, 41, 41, 7, 14, 3, skin, outline, 1.4);
        rounded(ctx, 39, 53, 11, 5, 2, boot, outline, 1);
      }

      // Body tunic
      rounded(ctx, 26, bodyY, 28, 22, 8, linGrad(ctx, 26, bodyY, 54, bodyY + 22, [[0, "#d8f080"], [0.5, "#8aba48"], [1, "#3a6020"]]), outline, 2);
      // Belt and buckle
      ctx.fillStyle = "#3a2818";
      ctx.fillRect(27, bodyY + 14, 26, 3.5);
      rounded(ctx, 38, bodyY + 13.5, 5, 4.5, 1, "#d4af37", "#2a1e10", 0.8);

      // Head
      ellipse(ctx, 40, headY, 13, 13, linGrad(ctx, 30, headY - 10, 50, headY + 12, [[0, "#e0f890"], [1, "#6a9030"]]), outline, 2);
      // Specular rim light on head
      ctx.strokeStyle = "rgba(255,255,255,.32)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(40, headY, 11, -Math.PI * 0.85, -Math.PI * 0.15);
      ctx.stroke();

      // Ears
      poly(ctx, [[26, headY - 4], [18, headY - 12 + earY], [28, headY]], "#8aba48", outline, 1.2);
      poly(ctx, [[54, headY - 4], [62, headY - 12 + earY], [52, headY]], "#8aba48", outline, 1.2);
      poly(ctx, [[26, headY - 4], [20, headY - 10 + earY], [27, headY - 1]], "rgba(230,250,160,.4)");
      poly(ctx, [[54, headY - 4], [60, headY - 10 + earY], [53, headY - 1]], "rgba(230,250,160,.4)");

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
      ], linGrad(ctx, sx1 - 4, sy1 - 4, tX, tY, [[0, "#d0d8e0"], [0.6, "#ffffff"], [1, "#9aa8b8"]]), "#3a4048", 1);
      ellipse(ctx, tX - 1, tY - 1, 1.5, 1.5, "#ffffff");

      // Front arm
      ctx.save();
      ctx.translate(armX + armW / 2, armY + armH / 2);
      ctx.rotate(armRot);
      rounded(ctx, -armW / 2, -armH / 2, armW, armH, 3, skin, outline, 1.2);
      ellipse(ctx, armW / 2 - 2, 0, 3, 3, skin, outline, 1);
      ctx.restore();
    };

    make("enemy_scout", 80, 72, (ctx) => drawScout(ctx, 0));
    make("enemy_scout_w0", 80, 72, (ctx) => drawScout(ctx, 0));
    make("enemy_scout_w1", 80, 72, (ctx) => drawScout(ctx, 1));
    make("enemy_scout_w2", 80, 72, (ctx) => drawScout(ctx, 2));
    make("enemy_scout_w3", 80, 72, (ctx) => drawScout(ctx, 3));

    const drawBrute = (ctx, frame = 0) => {
      shadow(ctx, 40, 62, 24, 7);
      const f = frame % 4;

      const bodyX = f === 0 ? 21 : f === 2 ? 23 : 22;
      const bodyY = (f === 1 || f === 3) ? 24 : 26;
      const headX = f === 0 ? 39 : f === 2 ? 41 : 40;
      const headY = (f === 1 || f === 3) ? 16 : 18;
      const headTilt = f === 0 ? -0.05 : f === 2 ? 0.05 : 0;

      const skin = "#8a5030";
      const skinDark = "#603018";
      const outline = "#3a2010";
      const boot = "#3a2010";

      // Far fist / arm (Left side)
      if (f === 0) {
        ellipse(ctx, 16, bodyY + 12, 7, 7, skin, outline, 1.4);
      } else if (f === 1) {
        ellipse(ctx, 18, bodyY + 10, 6.5, 6.5, skin, outline, 1.4);
      } else if (f === 2) {
        ellipse(ctx, 22, bodyY + 9, 6, 6, skinDark, outline, 1.4);
      } else {
        ellipse(ctx, 19, bodyY + 10, 6.5, 6.5, skin, outline, 1.4);
      }

      // Legs: heavy stride vs passing
      if (f === 0) {
        // Left forward heavy plant
        poly(ctx, [[25, 43], [34, 43], [28, 55], [19, 54]], skin, outline, 1.6);
        rounded(ctx, 17, 52, 13, 6.5, 2.5, boot, outline, 1.2);
        // Right trailing back
        poly(ctx, [[46, 43], [54, 43], [59, 52], [52, 53]], skinDark, outline, 1.6);
        rounded(ctx, 51, 50, 11, 6, 2.5, boot, outline, 1.2);
      } else if (f === 1) {
        // Left planted straight
        rounded(ctx, 26, 41, 9, 15, 4, skin, outline, 1.6);
        rounded(ctx, 24, 53, 13, 6.5, 2.5, boot, outline, 1.2);
        // Right lifted passing
        poly(ctx, [[46, 41], [54, 41], [55, 47], [48, 48]], skinDark, outline, 1.6);
        rounded(ctx, 47, 45, 11, 6, 2.5, boot, outline, 1.2);
      } else if (f === 2) {
        // Left trailing back
        poly(ctx, [[26, 43], [34, 43], [22, 52], [16, 51]], skinDark, outline, 1.6);
        rounded(ctx, 15, 50, 11, 6, 2.5, boot, outline, 1.2);
        // Right forward heavy plant
        poly(ctx, [[45, 43], [54, 43], [58, 55], [49, 54]], skin, outline, 1.6);
        rounded(ctx, 48, 52, 13, 6.5, 2.5, boot, outline, 1.2);
      } else {
        // Left lifted passing
        poly(ctx, [[26, 41], [34, 41], [35, 47], [28, 48]], skinDark, outline, 1.6);
        rounded(ctx, 27, 45, 11, 6, 2.5, boot, outline, 1.2);
        // Right planted straight
        rounded(ctx, 44, 41, 9, 15, 4, skin, outline, 1.6);
        rounded(ctx, 42, 53, 13, 6.5, 2.5, boot, outline, 1.2);
      }

      // Torso
      rounded(ctx, bodyX, bodyY, 36, 26, 10, linGrad(ctx, bodyX, bodyY, bodyX + 36, bodyY + 26, [[0, "#f0c080"], [0.5, "#c07038"], [1, "#603018"]]), outline, 2.2);
      // Chest muscle lines
      ctx.strokeStyle = "rgba(60,20,10,.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bodyX + 18, bodyY + 6);
      ctx.lineTo(bodyX + 18, bodyY + 18);
      ctx.moveTo(bodyX + 10, bodyY + 12);
      ctx.quadraticCurveTo(bodyX + 18, bodyY + 16, bodyX + 26, bodyY + 12);
      ctx.stroke();

      // Shoulders with rim highlights
      const leftShX = bodyX + 2;
      const leftShY = bodyY + 6;
      const rightShX = bodyX + 34;
      const rightShY = bodyY + 6;
      ellipse(ctx, leftShX, leftShY, 8.5, 8.5, "#a05828", outline, 1.5);
      ellipse(ctx, rightShX, rightShY, 8.5, 8.5, "#a05828", outline, 1.5);
      ctx.strokeStyle = "rgba(255,240,200,.3)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(leftShX, leftShY, 6.5, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(rightShX, rightShY, 6.5, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();

      // Head
      ctx.save();
      ctx.translate(headX, headY);
      ctx.rotate(headTilt);
      ellipse(ctx, 0, 0, 15, 14, linGrad(ctx, -12, -10, 12, 12, [[0, "#f8d0a0"], [1, "#a05828"]]), outline, 2);

      // Brow ridge highlight
      ctx.strokeStyle = "rgba(255,245,210,.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-10, -6);
      ctx.lineTo(10, -6);
      ctx.stroke();

      // Tusks / Horns
      ellipse(ctx, -14, -8, 5, 7.5, "#e8d0a8", "#4a3018", 1.2);
      ellipse(ctx, 14, -8, 5, 7.5, "#e8d0a8", "#4a3018", 1.2);
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
      rounded(ctx, -4, 0, 8, 26, 3, linGrad(ctx, -4, 0, 4, 26, [[0, "#8a6040"], [1, "#3a2010"]]), "#1a1008", 1.5);
      // Club head
      ellipse(ctx, 0, -2, 9.5, 8.5, "#6a4830", "#1a1008", 1.5);
      // Wood grain & speckles
      speckles(ctx, -6, -8, 12, 14, 7, "rgba(0,0,0,.35)", 1.4);
      speckles(ctx, -5, -7, 10, 12, 4, "rgba(255,230,180,.25)", 1.2);
      // Iron studs on club
      for (const [ix, iy] of [[-6, -2], [6, -2], [0, -8], [0, 4]]) {
        ellipse(ctx, ix, iy, 1.8, 1.8, "#d0a870", "#2a1808", 0.8);
      }
      // Right fist holding club handle
      ellipse(ctx, 0, 10, 4.5, 4.5, skin, outline, 1.2);
      ctx.restore();
    };

    make("enemy_brute", 80, 72, (ctx) => drawBrute(ctx, 0));
    make("enemy_brute_w0", 80, 72, (ctx) => drawBrute(ctx, 0));
    make("enemy_brute_w1", 80, 72, (ctx) => drawBrute(ctx, 1));
    make("enemy_brute_w2", 80, 72, (ctx) => drawBrute(ctx, 2));
    make("enemy_brute_w3", 80, 72, (ctx) => drawBrute(ctx, 3));

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

    make("enemy_shield", 80, 72, (ctx) => drawShield(ctx, 0));
    make("enemy_shield_w0", 80, 72, (ctx) => drawShield(ctx, 0));
    make("enemy_shield_w1", 80, 72, (ctx) => drawShield(ctx, 1));
    make("enemy_shield_w2", 80, 72, (ctx) => drawShield(ctx, 2));
    make("enemy_shield_w3", 80, 72, (ctx) => drawShield(ctx, 3));

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

    make("enemy_ember", 80, 72, (ctx) => drawEmber(ctx, 0));
    make("enemy_ember_w0", 80, 72, (ctx) => drawEmber(ctx, 0));
    make("enemy_ember_w1", 80, 72, (ctx) => drawEmber(ctx, 1));
    make("enemy_ember_w2", 80, 72, (ctx) => drawEmber(ctx, 2));
    make("enemy_ember_w3", 80, 72, (ctx) => drawEmber(ctx, 3));

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

    make("enemy_brood", 80, 72, (ctx) => drawBrood(ctx, 0));
    make("enemy_brood_w0", 80, 72, (ctx) => drawBrood(ctx, 0));
    make("enemy_brood_w1", 80, 72, (ctx) => drawBrood(ctx, 1));
    make("enemy_brood_w2", 80, 72, (ctx) => drawBrood(ctx, 2));
    make("enemy_brood_w3", 80, 72, (ctx) => drawBrood(ctx, 3));

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

    make("enemy_flyer", 80, 72, (ctx) => drawFlyer(ctx, 0));
    make("enemy_flyer_w0", 80, 72, (ctx) => drawFlyer(ctx, 0));
    make("enemy_flyer_w1", 80, 72, (ctx) => drawFlyer(ctx, 1));
    make("enemy_flyer_w2", 80, 72, (ctx) => drawFlyer(ctx, 2));
    make("enemy_flyer_w3", 80, 72, (ctx) => drawFlyer(ctx, 3));

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

    make("enemy_hexer", 80, 72, (ctx) => drawHexer(ctx, 0));
    make("enemy_hexer_w0", 80, 72, (ctx) => drawHexer(ctx, 0));
    make("enemy_hexer_w1", 80, 72, (ctx) => drawHexer(ctx, 1));
    make("enemy_hexer_w2", 80, 72, (ctx) => drawHexer(ctx, 2));
    make("enemy_hexer_w3", 80, 72, (ctx) => drawHexer(ctx, 3));

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

    make("enemy_titan", 88, 80, (ctx) => drawTitan(ctx, 0));
    make("enemy_titan_w0", 88, 80, (ctx) => drawTitan(ctx, 0));
    make("enemy_titan_w1", 88, 80, (ctx) => drawTitan(ctx, 1));
    make("enemy_titan_w2", 88, 80, (ctx) => drawTitan(ctx, 2));
    make("enemy_titan_w3", 88, 80, (ctx) => drawTitan(ctx, 3));

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
