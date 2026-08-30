/**
 * KRC v1.6.4 star-spend talent tree — pure, deterministic, JSON-safe.
 * No DOM, no random, no network.
 */

export const TALENTS = Object.freeze([
  Object.freeze({ id: "fordGold", name: "Ford Gold", cost: 1, maxRank: 3, rankBonus: 0.08 }),
  Object.freeze({ id: "bulwarkVigor", name: "Bulwark Vigor", cost: 1, maxRank: 3, rankBonus: 0.06 }),
  Object.freeze({ id: "swiftQuiver", name: "Swift Quiver", cost: 2, maxRank: 3, rankBonus: -0.06 }),
  Object.freeze({ id: "runeDepth", name: "Rune Depth", cost: 2, maxRank: 3, rankBonus: 0.08 }),
  Object.freeze({ id: "emberRain", name: "Ember Rain", cost: 3, maxRank: 3, rankBonus: 0.1 }),
  Object.freeze({ id: "orderlyReturn", name: "Orderly Return", cost: 2, maxRank: 3, rankBonus: -0.15 }),
]);

const TALENT_BY_ID = Object.freeze(Object.fromEntries(TALENTS.map((talent) => [talent.id, talent])));

const MOD_KEYS = Object.freeze({
  fordGold: "gold",
  bulwarkVigor: "soldierHp",
  swiftQuiver: "rate",
  runeDepth: "mageDmg",
  emberRain: "meteor",
  orderlyReturn: "heroRespawn",
});

function cloneState(state) {
  try {
    return JSON.parse(JSON.stringify(state ?? {}));
  } catch {
    return {};
  }
}

function finiteStars(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

function finiteRank(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

export function normalizeTalentState(state) {
  const next = cloneState(state);
  const src = next.talents && typeof next.talents === "object" ? next.talents : {};
  const talents = {};
  for (const talent of TALENTS) {
    talents[talent.id] = Math.min(talent.maxRank, finiteRank(src[talent.id]));
  }
  next.talents = talents;
  next.earnedStars = finiteStars(next.earnedStars);
  return next;
}

function identityMods() {
  return { gold: 1, soldierHp: 1, rate: 1, mageDmg: 1, meteor: 1, heroRespawn: 1 };
}

/**
 * Spend one rank. Validates wallet + cap. Atomic: input state is never mutated.
 * @returns {{ok:boolean,state:object}}
 */
export function spendStar(state, talentId) {
  const next = normalizeTalentState(state);
  const talent = TALENT_BY_ID[talentId];
  if (!talent) return { ok: false, state: next };
  const rank = next.talents[talent.id] || 0;
  if (rank >= talent.maxRank) return { ok: false, state: next };
  if (next.earnedStars < talent.cost) return { ok: false, state: next };
  next.earnedStars -= talent.cost;
  next.talents[talent.id] = rank + 1;
  return { ok: true, state: next };
}

/**
 * Refund every spent star cost, reset ranks. Wallet/ranks never go negative.
 */
export function refundAll(state) {
  const next = normalizeTalentState(state);
  let refund = 0;
  for (const talent of TALENTS) {
    const rank = next.talents[talent.id] || 0;
    refund += rank * talent.cost;
    next.talents[talent.id] = 0;
  }
  next.earnedStars = finiteStars(next.earnedStars) + refund;
  return next;
}

/**
 * Aggregated multipliers for ranks >= 1. Base identity is 1.
 * talentModIds optionally filters by talent id or mod key.
 */
export function applyTalents(state, talentModIds) {
  const next = normalizeTalentState(state);
  const mods = identityMods();
  const filter = Array.isArray(talentModIds)
    ? new Set(talentModIds.filter((id) => typeof id === "string"))
    : null;
  for (const talent of TALENTS) {
    const rank = next.talents[talent.id] || 0;
    if (rank < 1) continue;
    const key = MOD_KEYS[talent.id];
    if (!key) continue;
    if (filter && !filter.has(talent.id) && !filter.has(key)) continue;
    mods[key] = 1 + rank * talent.rankBonus;
  }
  return mods;
}

const api = Object.freeze({
  TALENTS,
  spendStar,
  refundAll,
  applyTalents,
  normalizeTalentState,
});

if (typeof window !== "undefined") {
  window.KRCTalents = api;
}

export default api;
