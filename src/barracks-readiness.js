(() => {
  function wantedCount(level) {
    const lv = Number(level) || 0;
    if (lv >= 4) return 3;
    if (lv >= 2) return 2;
    return 1;
  }

  function respawnCooldown(level) {
    const lv = Number(level) || 0;
    if (lv >= 4) return 5.0;
    if (lv >= 1) return 6.0;
    return 7.5;
  }

  function readinessState({ alive = 0, wanted = 1, cooldown = 0, maxCooldown = 1 } = {}) {
    const missing = Math.max(0, wanted - alive);
    if (missing <= 0) {
      return { status: "ready", missing: 0, progress: 1, label: "READY" };
    }
    if (cooldown > 0) {
      const max = Math.max(0.001, maxCooldown || cooldown);
      const progress = Math.max(0, Math.min(1, 1 - cooldown / max));
      const seconds = Math.max(1, Math.ceil(cooldown));
      return {
        status: "training",
        missing,
        progress,
        label: `TRN ${seconds}s`,
      };
    }
    return {
      status: "understrength",
      missing,
      progress: alive / Math.max(1, wanted),
      label: `${alive}/${wanted}`,
    };
  }

  function idleRegen(hp, maxHp, dt, inCombat) {
    if (inCombat) return hp;
    const rate = 5; // HP per second while idle (KR-style)
    return Math.min(maxHp, hp + rate * dt);
  }

  function meleeStrike({ attackerDamage = 0, bannerBonus = 1, isCritWindow = false } = {}) {
    const base = Math.max(0, attackerDamage) * (bannerBonus || 1);
    if (isCritWindow) {
      return { damage: base * 1.35, flash: "crit" };
    }
    return { damage: base, flash: "hit" };
  }

  window.KRCBarracksReadiness = Object.freeze({
    wantedCount,
    respawnCooldown,
    readinessState,
    idleRegen,
    meleeStrike,
  });
})();
