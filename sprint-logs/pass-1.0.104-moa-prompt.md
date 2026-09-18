You are moa2735. Phaser canvas artist. Output ONLY a unified diff fence.

Task: KRC barracks FIRE doorway. File public/src/krc-art.js, drawBarracksGate128 isFire else only.

After the two open door leaf polys, ADD two charging guards that READ AT 390px:
- Height 24-28px (not 8-14). Head, torso, two legs, shield, spear as SEPARATE shapes
- Dark outline #0e1e0c, crimson/gold fills
- Left guard ~x=56, right ~x=72 slightly ahead
- Must look like men, not two ovals

Do not rewrite idle. Do not dump the file.

CURRENT isFire end:

        poly(ctx, [[48, 63], [54, 65], [54, 88], [48, 86]], "#2c160a", "#0c0400", 1.2);
        poly(ctx, [[80, 63], [74, 65], [74, 88], [80, 86]], "#241006", "#0c0400", 1.2);

Helpers: ellipse(ctx,x,y,rx,ry,fill,stroke,line) poly(ctx,pts,fill,stroke,line)

Return ONLY:

```diff:public/src/krc-art.js
@@
         poly(ctx, [[80, 63], [74, 65], [74, 88], [80, 86]], "#241006", "#0c0400", 1.2);
+        ...guards...
```
