KRC 1.1.2 SAME assignment. Surgical only.

File public/src/krc-art.js, drawBarracksGate128 FIRE else only. The two doorway guards (comments Left Guard / Right Guard).

BUG: left spear polys at x=69-71 stab through the right guard at x=70.

Fix:
- Keep each guard 24-28px tall (head+torso+legs+shield+spear).
- Left spear must stay on the LEFT of the left body (x <= 52).
- Right spear stays on the RIGHT of the right body (x >= 82).
- Do not shrink below 24px. Do not rewrite the tower. Do not bump version.
- Forest Gate (100,375) and bannerY=98 are not in this file; do not touch game.js.

node --check public/src/krc-art.js
