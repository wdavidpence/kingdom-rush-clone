/**
 * KRC v1.6.2 hero selection — pure persistence + DOM-lite picker.
 */

export const HERO_STORAGE_KEY = "krc_hero_pick";

export const HEROES = Object.freeze([
  Object.freeze({ id: "captain", name: "Captain Alder", role: "HUNT", desc: "Charging duelist" }),
  Object.freeze({ id: "sentinel", name: "Sentinel Bryne", role: "HOLD", desc: "Unmoving bulwark" }),
]);

export function heroById(id) {
  return HEROES.find((hero) => hero.id === id) || null;
}

export function persistHeroPick(id) {
  const hero = heroById(id);
  if (!hero) return null;
  try {
    if (typeof localStorage !== "undefined" && localStorage) {
      localStorage.setItem(HERO_STORAGE_KEY, hero.id);
    }
  } catch {
    /* private mode / quota */
  }
  return hero;
}

export function readHeroPick() {
  try {
    if (typeof localStorage === "undefined" || !localStorage) return null;
    const id = localStorage.getItem(HERO_STORAGE_KEY);
    return heroById(id) ? id : null;
  } catch {
    return null;
  }
}

/**
 * Build two tap cards into containerEl. Reuses .shell / .brand / .subtitle.
 * Persists krc_hero_pick then invokes onPick(hero).
 */
export function renderHeroPicker(containerEl, onPick) {
  if (!containerEl || typeof document === "undefined") return null;
  containerEl.innerHTML = "";
  const root = document.createElement("div");
  root.className = "shell";
  root.style.cssText = "display:flex;flex-direction:column;gap:12px;padding:18px;max-width:360px;margin:0 auto;";

  const title = document.createElement("div");
  title.className = "brand";
  title.textContent = "Choose your hero";
  title.style.cssText = "color:#ffd866;font:700 18px Cinzel,serif;text-align:center;";
  root.appendChild(title);

  const sub = document.createElement("div");
  sub.className = "subtitle";
  sub.textContent = "Tap a champion. Saved for this campaign.";
  sub.style.cssText = "color:#cfc4a2;font:12px 'Source Sans 3',sans-serif;text-align:center;";
  root.appendChild(sub);

  for (const hero of HEROES) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "subtitle";
    card.dataset.heroId = hero.id;
    card.style.cssText = [
      "display:block",
      "width:100%",
      "text-align:left",
      "padding:14px 16px",
      "border:2px solid #d8b548",
      "background:#162414",
      "color:#fff2ba",
      "cursor:pointer",
      "border-radius:6px",
    ].join(";");
    const name = document.createElement("div");
    name.className = "brand";
    name.textContent = hero.name;
    name.style.cssText = "font:700 15px Cinzel,serif;color:#ffd866;";
    const role = document.createElement("div");
    role.className = "subtitle";
    role.textContent = hero.role;
    role.style.cssText = "font:700 11px 'Source Sans 3',sans-serif;color:#f5c85a;margin-top:4px;";
    const desc = document.createElement("div");
    desc.className = "subtitle";
    desc.textContent = hero.desc;
    desc.style.cssText = "font:12px 'Source Sans 3',sans-serif;color:#efe4c4;margin-top:2px;";
    card.appendChild(name);
    card.appendChild(role);
    card.appendChild(desc);
    card.addEventListener("click", () => {
      persistHeroPick(hero.id);
      if (typeof onPick === "function") onPick(hero);
    });
    root.appendChild(card);
  }

  containerEl.appendChild(root);
  return root;
}

const api = Object.freeze({
  HEROES,
  HERO_STORAGE_KEY,
  heroById,
  persistHeroPick,
  readHeroPick,
  renderHeroPicker,
});

if (typeof window !== "undefined") {
  window.KRCHeroSelect = api;
}

export default api;
