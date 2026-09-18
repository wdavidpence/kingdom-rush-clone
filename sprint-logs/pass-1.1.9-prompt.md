KRC 1.1.9 SAME assignment. Surgical only.

File public/src/game.js locked campaign node hover (else branch of MAPS.forEach).

LIVE:
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

On locked pointerover, also nodeBg.setStrokeStyle(2.5, biomeColor, 0.85) using [0x7ec86a, 0xb8c4d0, 0xff7030, 0x7ec8e8, 0xd4a878][index].
On pointerout restore setStrokeStyle(2, 0x4a554a, 0.7).
Do not skip Forest Gate. Do not move { x: 100, y: 375 }. Do not bump version.

node --check public/src/game.js
