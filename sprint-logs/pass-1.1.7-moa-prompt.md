You are qwen2735 PenceMOA. SAME assignment. Output ONLY ```diff:public/src/game.js

LIVE:
      const intelBg = this.add.rectangle(W / 2, 532, 348, 70, 0x1a140c, 0.94)
        .setStrokeStyle(2, 0xf5c85a, 0.88)
        .setDepth(502);

    setCampaignIntel(index, locked) {
      if (!this.campaignIntelTitle || !this.campaignIntelBody) return;

Add this.campaignIntelBg = intelBg at create time.
In setCampaignIntel stroke it with biome [0x7ec86a, 0xb8c4d0, 0xff7030, 0x7ec8e8, 0xd4a878] or 0x4a554a if locked.
Do not invent campaignNodes. Do not skip Forest Gate.
