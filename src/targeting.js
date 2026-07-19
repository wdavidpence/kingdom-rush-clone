(() => {
  const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

  /**
   * Returns the distance an enemy has advanced along the current polyline path.
   * The enemy's segment is the completed path-point index used by game.js.
   */
  function pathProgress(path, enemy) {
    if (!Array.isArray(path) || path.length < 2 || !enemy) return -Infinity;
    const lastSegment = path.length - 2;
    const segment = Math.max(0, Math.min(lastSegment, Number.isInteger(enemy.seg) ? enemy.seg : 0));
    let progress = 0;
    for (let index = 0; index < segment; index += 1) progress += distance(path[index], path[index + 1]);
    const start = path[segment];
    const end = path[segment + 1];
    const length = distance(start, end);
    if (!length) return progress;
    const projection = ((enemy.x - start.x) * (end.x - start.x) + (enemy.y - start.y) * (end.y - start.y)) / (length * length);
    return progress + Math.max(0, Math.min(1, projection)) * length;
  }

  /**
   * Selects the furthest progressed living enemy that is eligible and within range.
   * Equal-progress ties are stable by entity id so a frame cannot randomly retarget.
   */
  function findBestTarget({ path, tower, range, enemies, canHitFlying }) {
    let best = null;
    let bestProgress = -Infinity;
    for (const enemy of enemies || []) {
      if (!enemy || enemy.dead || (!canHitFlying && enemy.base?.flying)) continue;
      if (distance(tower, enemy) > range) continue;
      const progress = pathProgress(path, enemy);
      if (progress > bestProgress || (progress === bestProgress && String(enemy.id) < String(best?.id))) {
        best = enemy;
        bestProgress = progress;
      }
    }
    return best;
  }

  window.KRCTargeting = Object.freeze({ pathProgress, findBestTarget });
})();
