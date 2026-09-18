KRC 1.2.10 persistent battlefield. SAME assignment both models.

Live game.js already has this.worldStains.

1. After meteor burst0 (~line 6274):
          const burst0 = this.add.image(target.x, target.y, ...
Add a scorch:
          const scorch = this.add.ellipse(target.x, target.y + 8, 44, 18, 0x1a1008, 0.45).setDepth(-12);
          this.worldStains = this.worldStains || [];
          this.worldStains.push(scorch);
          if (this.worldStains.length > 12) this.worldStains.shift()?.destroy?.();

2. Scout death: change delay: 720 to delay: 2200 in the scout fade tween (~4755-4763).

HARD: do not touch { x: 100, y: 375 }, bannerY=98, campaign, version.

Output only ```diff:public/src/game.js
Do not invent setDuration or assets.
