/**
 * KRC v1.6.2 tower specialization — pure validator, no DOM, no random.
 */

export const SPEC_TREE = Object.freeze({
  rangers: Object.freeze([
    Object.freeze({ id: "falcon", name: "Falcon Roost", bonus: Object.freeze({ rate: 0.85 }) }),
    Object.freeze({ id: "marksman", name: "Longshot Nest", bonus: Object.freeze({ range: 1.18, damage: 1.12 }) }),
  ]),
  mage: Object.freeze([
    Object.freeze({ id: "storm", name: "Storm Rune", bonus: Object.freeze({ chain: true }) }),
    Object.freeze({ id: "frost", name: "Hoarfrost Rune", bonus: Object.freeze({ slow: 1.5 }) }),
  ]),
  artillery: Object.freeze([
    Object.freeze({ id: "siege", name: "Siege Bash", bonus: Object.freeze({ damage: 1.3, splash: 1.2 }) }),
    Object.freeze({ id: "cluster", name: "Cluster Batter", bonus: Object.freeze({ shots: 2 }) }),
  ]),
  barracks: Object.freeze([
    Object.freeze({ id: "bulwark", name: "Iron Bulwark", bonus: Object.freeze({ soldierHp: 1.45 }) }),
    Object.freeze({ id: "spearwall", name: "Spearwall", bonus: Object.freeze({ damage: 1.35 }) }),
  ]),
});

export function familyForType(type) {
  if (type === "archer") return "rangers";
  if (type === "rangers" || type === "mage" || type === "artillery" || type === "barracks") return type;
  return null;
}

function specById(family, specId) {
  const branch = SPEC_TREE[family];
  if (!Array.isArray(branch)) return null;
  return branch.find((entry) => entry.id === specId) || null;
}

function currentId(current) {
  if (current == null || current === "") return null;
  if (typeof current === "string") return current;
  if (typeof current === "object" && typeof current.id === "string") return current.id;
  return null;
}

/**
 * Pure validator. Requires tier >= 4 and a valid specId on the family.
 * Idempotent re-pick of the same spec returns the same spec object.
 * Switching away from an already-chosen spec is rejected (null).
 */
export function chooseSpec(family, current, tier, specId) {
  if (!(Number(tier) >= 4)) return null;
  const held = currentId(current);
  const next = specById(family, specId);
  if (!next) return null;
  if (held && held !== specId) return null;
  if (held === specId) {
    const same = specById(family, held);
    return same;
  }
  return next;
}

/** Fixed specialization gold cost. */
export function specCost(_family, _tier) {
  return 260;
}

const api = Object.freeze({ SPEC_TREE, chooseSpec, specCost, familyForType });

if (typeof window !== "undefined") {
  window.KRCTowerSpec = api;
}

export default api;
