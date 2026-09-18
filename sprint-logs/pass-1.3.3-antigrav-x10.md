KRC v1.3.3 antigrav 10-UPGRADE: shop portraits must read as faces, not dark stamps.
Work in THIS repo (kingdom-rush-clone-antigrav). IN ORDER. After each: node --check public/src/krc-art.js and public/src/game.js.
Do not bump version. Do not touch campaign, { x: 100, y: 375 }, bannerY=98, bounty 0.55.
Do not edit drawScout or drawBrute (MoA owns those).

Helpers only:
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
radGrad(ctx, x, y, r0, r1, [[t,color],...])
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
rounded(ctx, x, y, w, h, r, fill, stroke, line)
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

LIVE wrappers (keep 72,72):
    make("portrait_archer", 72, 72, drawPortraitArcher);
    make("portrait_mage", 72, 72, drawPortraitMage);
    make("portrait_artillery", 72, 72, drawPortraitArtillery);
    make("portrait_barracks", 72, 72, drawPortraitBarracks);

Wow bar: at ~28px (72 * 0.38) a player must see FACE + ROLE COLOR. Huge head, cream eyes, fat #141008 rim. Drop tiny masonry.

1. drawPortraitArcher — ranger face, green hood, bow silhouette.
2. drawPortraitMage — rune mage face, violet hood, glowing eye.
3. drawPortraitArtillery — bombardier face, bronze helm, mortar hint.
4. drawPortraitBarracks — captain/guard face, gold helm.
5. LIVE game.js `iconScale: 0.38,` (shop tower buttons, two sites ~1999 and ~2120) → `iconScale: 0.52,` only those 0.38 values.
6. LIVE game.js `iconScale: 0.44,` (~2848) → `iconScale: 0.56,`
7. Do not change iconScale 0.64 or 0.48.
8. Keep portrait fallback make("portrait_archer", 32, 32 in game.js untouched.
9. If a drawPortrait* helper is missing, skip that number.
10. node --check after the last portrait.

No placeholders. No fake APIs. No CONFIG. No pad_empty rewrite.
