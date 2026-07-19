(() => {
  const ABILITIES = Object.freeze({
    archer: Object.freeze({
      id: "volley",
      name: "Volley",
      minLevel: 3,
      cooldown: 8.5,
      description: "Fires extra arrows at nearby ground and air threats.",
    }),
    mage: Object.freeze({
      id: "nova",
      name: "Rune Nova",
      minLevel: 3,
      cooldown: 10,
      description: "Releases a slow burst around the primary target.",
    }),
    artillery: Object.freeze({
      id: "barrage",
      name: "Barrage",
      minLevel: 3,
      cooldown: 12,
      description: "Drops a second delayed blast near the impact zone.",
    }),
    barracks: Object.freeze({
      id: "holdfast",
      name: "Hold Fast",
      minLevel: 3,
      cooldown: 14,
      description: "Hardens active guards and restores a burst of health.",
    }),
  });

  function getAbility(type) {
    return ABILITIES[type] || null;
  }

  function isUnlocked(type, level) {
    const ability = getAbility(type);
    if (!ability) return false;
    return (Number(level) || 0) >= ability.minLevel;
  }

  function canTrigger(tower, nowSeconds = 0) {
    if (!tower || !isUnlocked(tower.type, tower.level)) return false;
    const cd = Number(tower.abilityCooldown) || 0;
    return cd <= 0;
  }

  function afterTrigger(tower) {
    const ability = getAbility(tower?.type);
    if (!ability) return { ...(tower || {}), abilityCooldown: 0, abilityId: null };
    return {
      ...tower,
      abilityCooldown: ability.cooldown,
      abilityId: ability.id,
    };
  }

  function tickCooldown(current, dt) {
    return Math.max(0, (Number(current) || 0) - (Number(dt) || 0));
  }

  window.KRCTowerAbilities = Object.freeze({
    ABILITIES,
    getAbility,
    isUnlocked,
    canTrigger,
    afterTrigger,
    tickCooldown,
  });
})();
