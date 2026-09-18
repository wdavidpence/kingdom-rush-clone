KRC v1.2.1 SAME assignment. Hermes judge only.

PREVIOUS 1.2.0 REJECT: antigrav stacked lineStyles — still a tan ribbon. moa2735 invented renderSetPiece / make(fn,w,h) / ...data... placeholders. Those diffs cannot apply.

LIVE signatures (copy these, do not invent APIs):

public/src/krc-art.js line 8181:
    make("gate_arch", 96, 64, (ctx) => {
Helpers already in file: shadow, rounded, linGrad, poly, ellipse, speckles, radGrad.
Replace that whole make("gate_arch"... }); block with make("gate_arch", 128, 96, (ctx) => { ... }).
Must read at 390px: dark arch hole, timber doors, two lanterns, ivy. Not 1px mortar sludge.

public/src/game.js LIVE:
        this.gateImage = this.add.image(378, 588, "gate_arch").setDepth(-5).setScale(1.58);
        this.gateLeakOverlay = this.add.image(378, 588, "gate_leak").setDepth(-4.8).setScale(1.58).setAlpha(0);

If gate is 128x96, setScale(1.0) and keep near (378, 588). Do not invent renderSetPiece.

PATH RUTS (mapIndex===0 only): ADD two offset Phaser graphics strokes along this.path (normals ±8..12px), dark packed-earth grooves ON TOP of existing tile_dirt. Do NOT delete the tile_dirt loop. Do NOT replace the road with one fat lineStyle.

HARD: { x: 100, y: 375 }, bannerY = 98, bounty 0.55, no version bump, no campaign nodes.
node --check both js files.
NO placeholders like ...data... NO fake functions.
Output unified diffs that apply to the live lines above.
