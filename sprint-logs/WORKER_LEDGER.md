# KRC worker ledger — AAA sprite sprint

| time | worker | test | seconds | success | notes |
|---|---|---|---|---|---|
| 2026-08-19 | qwen27 smoke | exact MOA2735_OK | 12.07 | PASS | empty content if max_tokens=64; needs 4k+ |
| 2026-08-19 | qwen35ud smoke | exact MOA2735_OK | 4.13 | PASS | same reasoning-token trap |
| 2026-08-19 | antigrav smoke | models list | n/a | FAIL then PASS | first FAIL: not signed in; after user OAuth, models list works |
| 2026-08-19 | antigrav smoke | ANTIGRAV_OK print | 18.67 | PARTIAL | authenticated; ignored exact-string, wrote timeout help |
| 2026-08-19 | antigrav pass 1.0.61 attempt 1 | walk sheets | 21 | FAIL | `--print` positional prompt ignored; wrote CLI help; 0 file edits |
| 2026-08-19 | antigrav pass 1.0.61 attempt 2 | walk sheets | 133 | PASS | shipped v1.0.61 |
| 2026-08-19 | antigrav pass 1.0.62 | roster frames | 177 | PASS | shipped v1.0.62 |
| 2026-08-19 | antigrav pass 1.0.63 | tower fire | 245 | PASS | shipped v1.0.63 |
| 2026-08-19 | antigrav pass 1.0.64 | hero poses | 182 | PASS | shipped v1.0.64 |
| 2026-08-19 | antigrav pass 1.0.65 | guard poses | 187 | PASS | shipped v1.0.65 |
| 2026-08-19 | antigrav pass 1.0.66 | 128px rangers | 231 | PASS | shipped v1.0.66 |
| 2026-08-19 | antigrav pass 1.0.67 | 128px other towers | running | pending | |
| 2026-08-19 | qwen27 pass 1.0.61 | walk sheets | 1186.49 | FAIL | finish=length, truncated, no closed file fence |
| 2026-08-19 | qwen35ud pass 1.0.61 | walk sheets | 532.41 | FAIL | finish=length, truncated, APPLIED [] |
