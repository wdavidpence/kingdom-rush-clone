# Judge 1.3.8 qwen35 titan

Single 35b, not MoA. plan 80s truncated, code 275s ok.
API: PASS enough to apply reconstructed drawTitan + size 26. 88x80 kept. No CONFIG.

Wow: see field shot ~76px. Also fixed local crash: drawDenWolf/drawUnitWolf were missing after pad/den merge (judge merge hole, not agent).

Warden 35b launched cron c05d4d48ae92.
