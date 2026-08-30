(() => {
  const STORAGE_KEY = "krc.campaign.v2";
  const LEGACY_KEY = "krc.campaign.v1";
  const TALENT_IDS = ["fordGold", "bulwarkVigor", "swiftQuiver", "runeDepth", "emberRain", "orderlyReturn"];

  function emptyTalents() {
    const talents = {};
    for (const id of TALENT_IDS) talents[id] = 0;
    return talents;
  }

  function finiteStars(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }

  function finiteRank(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }

  function create(mapCount) {
    return {
      unlocked: Array.from({ length: mapCount }, (_, index) => index === 0),
      results: {},
      earnedStars: 0,
      talents: emptyTalents(),
    };
  }

  function normalizeTalents(value) {
    const src = value && typeof value.talents === "object" && value.talents ? value.talents : {};
    const talents = emptyTalents();
    for (const id of TALENT_IDS) talents[id] = finiteRank(src[id]);
    return talents;
  }

  function normalize(value, mapCount) {
    const fresh = create(mapCount);
    if (!value || !Array.isArray(value.unlocked) || !value.results || typeof value.results !== "object") return fresh;
    fresh.unlocked = fresh.unlocked.map((_, index) => Boolean(value.unlocked[index]) || index === 0);
    fresh.results = value.results;
    fresh.earnedStars = finiteStars(value.earnedStars);
    fresh.talents = normalizeTalents(value);
    return fresh;
  }

  function recordWin(state, mapIndex, stars, gold) {
    const key = String(mapIndex);
    const previous = state.results[key] || { stars: 0, bestGold: 0 };
    const awarded = Math.max(1, Math.min(3, stars));
    state.results[key] = {
      stars: Math.max(previous.stars, awarded),
      bestGold: Math.max(previous.bestGold, gold),
    };
    state.earnedStars = finiteStars(state.earnedStars) + awarded;
    if (!state.talents || typeof state.talents !== "object") state.talents = emptyTalents();
    if (mapIndex + 1 < state.unlocked.length) state.unlocked[mapIndex + 1] = true;
    return state;
  }

  function readStorage(key) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function load(mapCount) {
    const current = readStorage(STORAGE_KEY);
    if (current) return normalize(current, mapCount);
    const legacy = readStorage(LEGACY_KEY);
    if (legacy) {
      const migrated = normalize(legacy, mapCount);
      migrated.earnedStars = 0;
      save(migrated);
      return migrated;
    }
    return create(mapCount);
  }

  function save(state) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
    return state;
  }

  window.KRCCampaign = Object.freeze({ create, recordWin, load, save, normalize });
})();
