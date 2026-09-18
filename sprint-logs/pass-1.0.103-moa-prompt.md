You are moa2735 (qwen3.6-27b + qwen3.6-35b-ud). Phaser canvas artist. Output ONLY a unified diff.

Task: KRC barracks doorway soldiers. File public/src/krc-art.js function drawBarracksGate128, FIRE branch only (isFire else).

After the two open door leaves (the poly calls at 48,63 and 80,63), ADD two charging guards in the glowing doorway:
- Left guard: oval body, round helmet, small round shield on left, spear forward-right
- Right guard: same, slightly ahead
- Height 10-14px, dark outline #0e1e0c, fill gold/crimson so they read at 390px
- Do not replace the gate glow. Do not rewrite idle branch. Do not dump the whole file.

Helpers already in file: ellipse(ctx,x,y,rx,ry,fill,stroke,line), poly(ctx,points,fill,stroke,line), rounded(...)

Return ONLY:

```diff:public/src/krc-art.js
@@
 context lines from the isFire else
-old
+new
```

CURRENT isFire else of drawBarracksGate128:

        // —— FIRE STATE: Gate Swung Wide & Golden Muster Light Surge ——
        rounded(ctx, 48, 60, 32, 30, 4, linGrad(ctx, 48, 60, 80, 90, [[0, "#ffffff"], [0.35, "#ffea74"], [0.75, "#ff9418"], [1, "#8a3406"]]), "#1a0800", 1.8);
        ellipse(ctx, 64, 76, 12, 16, radGrad(ctx, 64, 74, 2, 16, [[0, "#ffffff"], [0.5, "#fff0a0"], [1, "rgba(255,140,20,0)"]]));
        ellipse(ctx, 64, 91, 16, 5, "rgba(255, 235, 120, 0.7)");
        poly(ctx, [[48, 63], [54, 65], [54, 88], [48, 86]], "#2c160a", "#0c0400", 1.2);
        poly(ctx, [[80, 63], [74, 65], [74, 88], [80, 86]], "#241006", "#0c0400", 1.2);

Insert the two guards after those polys, before the closing of the else.
