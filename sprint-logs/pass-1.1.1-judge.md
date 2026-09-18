# Judge 1.1.1 gate splinters

MoA synth REJECT. Extra `}` on spark loop. `this.effects.push(splinter.setDepth(61))` is wrong — updater needs {obj,life,vx,vy}. A had no motion. B tweened x only.

Antigrav 67s ACCEPT vs live: +17 lines, fx_dust 0x6a4428, left/up, effects protocol, reducedMotion. Git --stat 1998 was stale index.

Shipped antigrav hunk as v1.1.1.
