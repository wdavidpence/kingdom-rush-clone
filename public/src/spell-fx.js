const clampNumber = (value, minimum, maximum, fallback) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, number));
};

const clampStage = (stage) => {
  const result = { ...stage };
  if (Object.hasOwn(result, "r")) result.r = clampNumber(result.r, 2, Number.MAX_SAFE_INTEGER, 2);
  if (Object.hasOwn(result, "count")) result.count = clampNumber(result.count, 1, Number.MAX_SAFE_INTEGER, 1);
  if (Object.hasOwn(result, "t")) result.t = Math.max(0, clampNumber(result.t, 0, Number.MAX_SAFE_INTEGER, 0));
  return Object.freeze(result);
};

const makeSpell = (spell) => Object.freeze({
  stages: Object.freeze(spell.stages.map(clampStage)),
  durationMs: clampNumber(spell.durationMs, 800, 2500, 800),
});

export const SPELL_FX = Object.freeze({
  meteor: makeSpell({
    stages: [
      { t: 0, kind: "shadow", r: 60, alpha: 0.25 },
      { t: 120, kind: "impact", r: 34, color: 0xff7a2f },
      { t: 260, kind: "ring", r: 78, color: 0xffc86a },
      { t: 620, kind: "smoke", count: 7, drift: 18 },
    ],
    durationMs: 1500,
  }),
  frost: makeSpell({
    stages: [
      { t: 0, kind: "breath", r: 52, color: 0x9fe8ff, alpha: 0.5 },
      { t: 150, kind: "shards", count: 9, color: 0xd8f6ff },
      { t: 420, kind: "icePatch", r: 58, color: 0x8fd4ee },
    ],
    durationMs: 1300,
  }),
  rally: makeSpell({
    stages: [
      { t: 0, kind: "bannerPulse", r: 24, color: 0xffd866 },
      { t: 200, kind: "hornRings", count: 3, gap: 150, color: 0xf4e6c8 },
      { t: 700, kind: "dustFeet", count: 6, color: 0xc8b088 },
    ],
    durationMs: 1600,
  }),
});

export const projectileTrails = Object.freeze({
  arrow: Object.freeze({ len: 26, color: 0xd8c56a, dots: 4, fade: "linear" }),
  rune: Object.freeze({ len: 34, color: 0x9d8fff, dots: 6, fade: "glow" }),
  bomb: Object.freeze({ len: 20, color: 0xff9a4a, dots: 5, fade: "smoke" }),
});

// Small deterministic generator for renderer-owned variation. It never uses Math.random.
export const createLcg = (seed = 1) => {
  let state = Number.isFinite(Number(seed)) ? Number(seed) >>> 0 : 1;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

export const trailPoints = (trailKey, steps = 8) => {
  const trail = projectileTrails[trailKey];
  if (!trail) return [];
  const count = Math.max(1, Math.floor(clampNumber(steps, 1, 1024, 8)));
  const random = createLcg(`${trailKey}:${count}`.split("").reduce((hash, char) => ((hash * 31 + char.charCodeAt(0)) >>> 0), 2166136261));
  return Array.from({ length: count }, (_, index) => ({
    x: (index / Math.max(1, count - 1)) * trail.len,
    y: (random() - 0.5) * 8,
    alpha: 1 - index / count,
  }));
};

if (typeof window !== "undefined") {
  window.KRCSpellFx = Object.freeze({ SPELL_FX, projectileTrails, trailPoints, stageEvents, createLcg });
}

export function stageEvents(spellKey, nowMs, elapsedMs = 0) {
  const spell = SPELL_FX[spellKey];
  if (!spell) return [];
  const now = Number(nowMs);
  const elapsed = Number(elapsedMs);
  if (!Number.isFinite(now) || !Number.isFinite(elapsed)) return [];
  const start = Math.max(0, Math.min(now, elapsed));
  const end = Math.max(0, now);
  return spell.stages
    .filter((stage) => stage.t <= end && (stage.t > start || (start === 0 && end === 0 && stage.t === 0)))
    .map((stage) => stage.kind);
}
