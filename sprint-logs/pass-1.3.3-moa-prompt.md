KRC 1.3.3 MoA ONE task: rewrite drawBrute so the brute is a readable armored bruiser at play scale.

Play scale is ~48px (make 80x72, setScale(base.size/30), live size 18).
Wow bar: at 48px you must read HEAD + SHOULDERS + WEAPON + BODY without squinting. Fat #141008 outline 2.8-3.2. Orange-brown hide vs dark iron. Huge eyes. No hairline folds.

Keep make("enemy_brute", 80, 72 and all enemy_brute_w0..w3 / dead wrappers.
Do NOT change canvas 80,72. Do NOT rename drawBrute. Do NOT edit drawScout (already shipped).

LIVE wrappers (do not change signatures):
    make("enemy_brute", 80, 72, (ctx) => drawBrute(ctx, 0));
    make("enemy_brute_w0", 80, 72, (ctx) => drawBrute(ctx, 0));
    make("enemy_brute_w1", 80, 72, (ctx) => drawBrute(ctx, 1));
    make("enemy_brute_w2", 80, 72, (ctx) => drawBrute(ctx, 2));
    make("enemy_brute_w3", 80, 72, (ctx) => drawBrute(ctx, 3));
    make("enemy_brute_dead", 80, 72, (ctx) => drawBruteDead(ctx));

LIVE drawBrute (replace the function body; keep (ctx, frame = 0)):
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
      ellipse(ctx, fArmX, fArmY, fArmR, fArmR, bruteSkinShaded(fArmX - fArmR, fArmY - fArmR, fArmX + fArmR, fArmY + fArmR), outline, 2.2);
      // Arm hide wrap cross-straps
      ctx.strokeStyle = "#4e2a14";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(fArmX - 4, fArmY + 2); ctx.lineTo(fArmX + 4, fArmY - 2);
      ctx.moveTo(fArmX - 4, fArmY - 2); ctx.lineTo(fArmX + 4, fArmY + 2);
      ctx.stroke();
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

      // Heavy leather war-kilt cloth & hide folds
      poly(ctx, [[bodyX + 7, bodyY + 20], [bodyX + 29, bodyY + 20], [bodyX + 31, bodyY + 27], [bodyX + 5, bodyY + 27]], linGrad(ctx, bodyX + 5, bodyY + 20, bodyX + 31, bodyY + 27, [[0, "#5a341a"], [1, "#261208"]]), outline, 1.3);
      // Vertical hide tension fold creases
      ctx.strokeStyle = "rgba(18, 6, 2, 0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bodyX + 13, bodyY + 20); ctx.lineTo(bodyX + 12, bodyY + 27);
      ctx.moveTo(bodyX + 19, bodyY + 20); ctx.lineTo(bodyX + 19, bodyY + 27);
      ctx.moveTo(bodyX + 24, bodyY + 20); ctx.lineTo(bodyX + 25, bodyY + 27);
      ctx.stroke();
      // Fold crest highlights
      ctx.strokeStyle = "rgba(230, 180, 130, 0.35)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(bodyX + 14, bodyY + 20); ctx.lineTo(bodyX + 13, bodyY + 26);
      ctx.moveTo(bodyX + 20, bodyY + 20); ctx.lineTo(bodyX + 20, bodyY + 26);
      ctx.stroke();
      // Frayed hide bottom cut notches
      poly(ctx, [[bodyX + 10, bodyY + 26], [bodyX + 12, bodyY + 29], [bodyX + 14, bodyY + 26]], "#1c0c04");
      poly(ctx, [[bodyX + 22, bodyY + 26], [bodyX + 24, bodyY + 29], [bodyX + 26, bodyY + 26]], "#1c0c04");

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

      // Topknot & coarse orc hair crest strands
      poly(ctx, [[-4, -13], [0, -22], [4, -13]], linGrad(ctx, -4, -22, 4, -13, [[0, "#2c1808"], [1, "#140a04"]]), outline, 1.0);
      poly(ctx, [[0, -22], [-2, -26], [3, -22]], "#140a04");
      // Leather cord wrapping on topknot
      rounded(ctx, -3, -16, 6, 2.5, 1, "#b48a4c", "#3a2010", 0.6);
      // Hair strand specular highlights
      ctx.strokeStyle = "rgba(215, 165, 115, 0.45)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-1, -14); ctx.lineTo(-1, -24);
      ctx.moveTo(1, -14); ctx.lineTo(2, -23);
      ctx.stroke();

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

      // Brow & chin bristle tufts
      ctx.strokeStyle = "rgba(24, 10, 4, 0.65)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-4, 10); ctx.lineTo(-3, 13);
      ctx.moveTo(0, 11); ctx.lineTo(0, 14);
      ctx.moveTo(4, 10); ctx.lineTo(3, 13);
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
      // Chiseled wood club facet edges
      ctx.strokeStyle = "rgba(255, 230, 180, 0.35)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-6, -7); ctx.lineTo(0, -9); ctx.lineTo(6, -7);
      ctx.stroke();
      // Iron studs on club
      for (const [ix, iy] of [[-6, -2], [6, -2], [0, -8], [0, 4]]) {
        ellipse(ctx, ix, iy, 1.8, 1.8, linGrad(ctx, ix - 1, iy - 1, ix + 1, iy + 1, [[0, "#fff0b0"], [0.5, "#d0a870"], [1, "#3a2010"]]), "#2a1808", 0.8);
      }
      // Iron spikes with sharp gleaming edge highlights
      poly(ctx, [[-11, -2], [-8, -4], [-8, 0]], "#e8edf2", "#2a1808", 0.7);
      poly(ctx, [[11, -2], [8, -4], [8, 0]], "#e8edf2", "#2a1808", 0.7);
      poly(ctx, [[0, -11], [-2, -8], [2, -8]], "#e8edf2", "#2a1808", 0.7);
      // Spike razor edge gleams
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-8, -4); ctx.lineTo(-11, -2);
      ctx.moveTo(8, -4); ctx.lineTo(11, -2);
      ctx.moveTo(-2, -8); ctx.lineTo(0, -11);
      ctx.stroke();
      // Right fist holding club handle
      ellipse(ctx, 0, 10, 4.5, 4.5, bruteSkinLit(-4, 8, 4, 14), outline, 1.2);
      ctx.restore();
    };

HELPERS only:
make(key, w, h, draw)
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
radGrad(ctx, x, y, r0, r1, [[t,color],...])
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
rounded(ctx, x, y, w, h, r, fill, stroke, line)
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)
face(ctx, cx, cy, eye, pupil, angry)

OPTIONAL public/src/game-data.js LIVE:
    brute: { name: "Brute", hp: 148, speed: 42, armor: 3, bounty: 13, leak: 1, color: 0xe4a25d, size: 18 },
Allowed only: size: 18 → size: 20. Nothing else.

HARD: do not touch { x: 100, y: 375 }, bannerY=98, campaign, version, drawScout, other enemies, towers.
No CONFIG. No make(fn). No placeholders. No renderSetPiece.

Output only:
```diff:public/src/krc-art.js
```
and optional
```diff:public/src/game-data.js
```
Hunks must apply to LIVE drawBrute and LIVE make("enemy_brute", 80, 72 wrappers.
