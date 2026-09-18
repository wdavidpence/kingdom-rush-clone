# Judge 1.3.2 antigrav

Elapsed 248s. Tests 12/12. APIs clean: no make() size changes, scout untouched, gate node + bannerY intact.

| # | item | API | Wow | verdict |
|---|---|---|---|---|
| 1 | portraits 72x72 | keep | still dark shop stamps | REJECT Wow |
| 2 | pad_empty | keep 72x48 | 3D ring but gray, less CTA than gold coin | REJECT Wow |
| 3 | tree_pine | keep | pointier, still picket-line | WEAK ACCEPT |
| 4 | tree_oak | keep | rounder vs pine | WEAK ACCEPT |
| 5 | sun patches | ok, Forest Gate only | barely visible lime blobs | WEAK ACCEPT |
| 6 | icon_gold/heart | keep 24x24 | slightly crisper | ACCEPT |
| 7 | fx_spark | keep 24x24 | not seen in field shot | HOLD |
| 8 | cloud_soft | keep 80x36 | not obvious | HOLD |
| 9 | projectile_arrow 44x20 | keep | not seen in field shot | HOLD |
| 10 | infoBg 0.78→0.9 | exact live line | tiny | ACCEPT |

Overall: well-formed 10-pack, not Wow. Do not merge to live. Leave in antigrav worktree.
Do not rewrite antigrav art.
