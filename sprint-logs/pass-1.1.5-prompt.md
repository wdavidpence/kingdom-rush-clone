KRC 1.1.5 SAME assignment. Surgical only.

File public/src/krc-art.js function drawMageFire ONLY.

LIVE end of function:
      ellipse(ctx, 120, 28, 5, 5, "#f8eeff", "#a070ff", 1);
      ellipse(ctx, 90, 38, 2.2, 2.2, "#ffffff");
      ellipse(ctx, 108, 24, 1.8, 1.8, "#ffe8ff");
    };

Before the closing of drawMageFire, add 3 more white/lilac spark ellipses along the bolt (x 95-118, y 22-36). Use existing ellipse(). Do not rewrite the mage. Do not bump version.

node --check public/src/krc-art.js
