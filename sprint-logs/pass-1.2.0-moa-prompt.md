KRC 1.2.0 Forest Gate set-piece. SAME assignment for both models.

Edit public/src/krc-art.js make("gate_arch") starting near line 8181 (currently 96x64 muddy stamp). Rebuild at 128x96 or 160x96: dark arch, lanterns, ivy, timber doors. Also make("gate_leak") aligned to the opening.

If needed, edit public/src/game.js only for gate image size/scale at (378, 588) and Forest Gate path ruts (mapIndex===0) in strokePath or dressBattlefield.

Do not touch campaign nodes, { x: 100, y: 375 }, bannerY = 98, version, or bounty math.

Output unified diffs only. Prefer ```diff:public/src/krc-art.js then optional ```diff:public/src/game.js.
