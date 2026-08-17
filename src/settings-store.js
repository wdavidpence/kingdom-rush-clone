/**
 * KRC Settings Store — dependency-free, original KRC game utility.
 * Provides a simple localStorage-backed settings layer for mute / reduced-motion preferences.
 */

(function () {
  "use strict";

  var STORAGE_KEY = "krc.settings.v1";
  var DEFAULTS = Object.freeze({ muted: false, reducedMotion: false, musicVolume: 0.6, sfxVolume: 1.0 });

  /**
   * Load settings from localStorage. Returns a fresh defaults object when
   * storage is missing or malformed; never throws.
   */
  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === null) return Object.assign({}, DEFAULTS);
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return Object.assign({}, DEFAULTS);
      var result = Object.assign({}, DEFAULTS, parsed);
      if (typeof result.musicVolume === "number" && !isNaN(result.musicVolume)) {
        result.musicVolume = Math.max(0, Math.min(1, result.musicVolume));
      } else {
        result.musicVolume = DEFAULTS.musicVolume;
      }
      if (typeof result.sfxVolume === "number" && !isNaN(result.sfxVolume)) {
        result.sfxVolume = Math.max(0, Math.min(1, result.sfxVolume));
      } else {
        result.sfxVolume = DEFAULTS.sfxVolume;
      }
      if (typeof result.muted !== "boolean") result.muted = DEFAULTS.muted;
      if (typeof result.reducedMotion !== "boolean") result.reducedMotion = DEFAULTS.reducedMotion;
      return result;
    } catch (_) {
      return Object.assign({}, DEFAULTS);
    }
  }

  /**
   * Save a partial settings object. Boolean `muted`/`reducedMotion` and
   * numeric `musicVolume`/`sfxVolume` (clamped 0-1) are merged; everything else is ignored.
   */
  function save(partial) {
    var stored = load();
    if (partial !== null && typeof partial === "object") {
      for (var key in partial) {
        if (Object.prototype.hasOwnProperty.call(partial, key)) {
          if ((key === "muted" || key === "reducedMotion") &&
              typeof partial[key] === "boolean") {
            stored[key] = partial[key];
          } else if ((key === "musicVolume" || key === "sfxVolume") &&
                     typeof partial[key] === "number" && !isNaN(partial[key])) {
            stored[key] = Math.max(0, Math.min(1, partial[key]));
          }
        }
      }
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch (_) { /* return in-memory settings when storage is unavailable */ }
    return Object.assign({}, stored);
  }

  /**
   * Reset settings to defaults. Removes the storage entry safely (no-op if
   * already absent) and returns a fresh default object.
   */
  function reset() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (_) { /* ignore storage errors on reset */ }
    return Object.assign({}, DEFAULTS);
  }

  /** @namespace KRCSettings */
  var KRCSettings = { load: load, save: save, reset: reset };
  window.KRCSettings = KRCSettings;
})();
