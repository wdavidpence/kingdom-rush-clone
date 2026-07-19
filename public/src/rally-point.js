(() => {
  /** Snaps a rally command to the nearest point of a traversable polyline path. */
  function place(path, x, y) {
    if (!Array.isArray(path) || path.length < 2 || !Number.isFinite(x) || !Number.isFinite(y)) return null;
    let best = null;
    let bestDistanceSq = Infinity;
    for (let segment = 0; segment < path.length - 1; segment += 1) {
      const start = path[segment];
      const end = path[segment + 1];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const lengthSq = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((x - start.x) * dx + (y - start.y) * dy) / lengthSq));
      const point = { x: start.x + t * dx, y: start.y + t * dy, segment };
      const distanceSq = (x - point.x) ** 2 + (y - point.y) ** 2;
      if (distanceSq < bestDistanceSq) {
        best = point;
        bestDistanceSq = distanceSq;
      }
    }
    return best;
  }

  window.KRCRallyPoint = Object.freeze({ place });
})();
