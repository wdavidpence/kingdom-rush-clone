KRC 1.1.7 SAME assignment. Surgical only.

File public/src/game.js.

1) Where intelBg is created (~2695), also set this.campaignIntelBg = intelBg (and keep overlay.add).
2) In setCampaignIntel, after setting title/body, stroke this.campaignIntelBg with biome color by index:
   [0x7ec86a, 0xb8c4d0, 0xff7030, 0x7ec8e8, 0xd4a878]
   locked -> 0x4a554a
   this.campaignIntelBg.setStrokeStyle(2, color, 0.88)

Do not move Forest Gate { x: 100, y: 375 } or bannerY=98. Do not bump version.

node --check public/src/game.js
