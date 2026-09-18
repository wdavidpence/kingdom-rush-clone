# Judge 1.3.17 qwen35 captain attack

Single 35b, not MoA. plan 67s ok, code 261s ok.
API: PASS. Only drawHeroCaptainAttack. 64x72 kept. speckles used correctly.

Wow: REJECT. Field ~65px still reads as idle (helm/cape/up-sword). No lunge/raised slash vs idle shot. Reverted to pre-35b attack.

Idle captain remains WEAK ACCEPT. Do not re-judge idle.
