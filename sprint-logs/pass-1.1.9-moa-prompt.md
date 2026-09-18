You are qwen2735 PenceMOA. SAME assignment. Output ONLY ```diff:public/src/game.js

LIVE locked node hover inside MAPS.forEach((map, index) => {  — use index, not campaignNodes, not biomeIndex:

        } else {
          nodeBg.setInteractive({ useHandCursor: true });
          nodeBg.on("pointerover", () => {
            this.showTooltip(nx, ny - 50, `${map.name}\\nLOCKED — Clear previous map to unlock!`);
            this.setCampaignIntel(index, true);
          });
          nodeBg.on("pointerout", () => {
            this.hideTooltip();
          });
        }

Add biome stroke on over, restore 0x4a554a on out. Colors [0x7ec86a, 0xb8c4d0, 0xff7030, 0x7ec8e8, 0xd4a878]. Do not skip Forest Gate.
