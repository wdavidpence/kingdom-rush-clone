You are qwen2735 PenceMOA. SAME assignment for both models. Output ONLY a diff fence.

Task: public/src/game.js triggerGateLeak. After the existing 7-spark for-loop, add 8 wood splinters (fx_dust tint 0x6a4428 or brown rectangles) flying left from gx,gy via this.effects.push. Do not change Forest Gate node or bannerY. Do not rewrite the whole function.

CURRENT tail of the spark loop start:

        for (let i = 0; i < 7; i += 1) {
          const spark = this.textures.exists("fx_spark")
            ? this.add.image(gx - 6 + (Math.random() - 0.5) * 12, gy + (Math.random() - 0.5) * 12, "fx_spark").setScale(0.35 + Math.random() * 0.2).setTint(0xffe066).setAlpha(0.95).setDepth(61)
            : this.add.circle(gx - 6 + (Math.random() - 0.5) * 12, gy + (Math.random() - 0.5) * 12, 1.8 + Math.random() * 1.6, 0xffe066, 0.95).setDepth(61);

Return ONLY:

```diff:public/src/game.js
@@
...
```
