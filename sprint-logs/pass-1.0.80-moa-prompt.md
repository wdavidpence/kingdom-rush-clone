KRC v1.0.80 cohesion. Small patch only.

Repo files already at v1.0.79. Do NOT return whole krc-art.js.

Task: In public/src/game.js and public/index.html only:
1. Bump KRC_VERSION and visible version strings to 1.0.80
2. Cache-bust krc-art.js and game.js query to v=20260819-80
3. If there is a fallback 32x32 tower/enemy bake in makeTextures, leave it as last-resort only.

Do not change gold, lives, bounty, Forest Gate (100,375), bannerY.

Return ONLY:

```diff:public/index.html
...unified diff...
```

```diff:public/src/game.js
...unified diff of version lines only...
```
