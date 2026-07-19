(() => {
  const STORAGE_KEY = "krc.campaign.v1";

  function create(mapCount) {
    return { unlocked: Array.from({ length: mapCount }, (_, index) => index === 0), results: {} };
  }

  function normalize(value, mapCount) {
    const fresh = create(mapCount);
    if (!value || !Array.isArray(value.unlocked) || !value.results || typeof value.results !== "object") return fresh;
    fresh.unlocked = fresh.unlocked.map((_, index) => Boolean(value.unlocked[index]) || index === 0);
    fresh.results = value.results;
    return fresh;
  }

  function recordWin(state, mapIndex, stars, gold) {
    const key = String(mapIndex);
    const previous = state.results[key] || { stars: 0, bestGold: 0 };
    state.results[key] = { stars: Math.max(previous.stars, Math.max(1, Math.min(3, stars))), bestGold: Math.max(previous.bestGold, gold) };
    if (mapIndex + 1 < state.unlocked.length) state.unlocked[mapIndex + 1] = true;
    return state;
  }

  function load(mapCount) {
    try { return normalize(JSON.parse(window.localStorage.getItem(STORAGE_KEY)), mapCount); } catch (_) { return create(mapCount); }
  }

  function save(state) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
    return state;
  }

  window.KRCCampaign = Object.freeze({ create, recordWin, load, save });
})();
