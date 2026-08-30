/**
 * KRC v1.4.1 Cutscene Engine Core — dependency-free, pure state machine & script validator.
 * No Phaser, no DOM, no timers, no Math.random, no Date.
 */

const DEFAULT_ART_KEYS = Object.freeze([
  "gate",
  "road",
  "forest",
  "marsh",
  "keep",
  "camp",
  "cliff",
  "warden",
]);

/**
 * Validate and normalize a cutscene script.
 * @param {object} script Raw script definition
 * @param {string[]} [registry] Optional array of allowed art keys
 * @returns {object} Normalized script { id, panels, footer, ... }
 */
export function createCutsceneScript(script, registry) {
  if (!script || typeof script !== "object") {
    throw new Error("Cutscene script must be an object");
  }
  if (!Array.isArray(script.panels) || script.panels.length < 1) {
    throw new Error("Cutscene script must have at least 1 panel");
  }

  const allowedKeys = Array.isArray(registry)
    ? registry
    : Array.isArray(script.registry)
    ? script.registry
    : DEFAULT_ART_KEYS;

  const normalizedPanels = script.panels.map((panel, index) => {
    if (!panel || typeof panel !== "object") {
      throw new Error(`Panel at index ${index} must be an object`);
    }

    if (
      typeof panel.caption !== "string" ||
      panel.caption.length === 0 ||
      panel.caption.length > 180
    ) {
      throw new Error(
        `Panel at index ${index} caption must be a non-empty string <= 180 chars (got ${panel.caption?.length ?? 0})`
      );
    }

    if (!allowedKeys.includes(panel.art)) {
      throw new Error(
        `Panel at index ${index} art "${panel.art}" is not one of registry keys: ${allowedKeys.join(", ")}`
      );
    }

    let pan = [0, 0, 0, 0];
    if (panel.pan !== undefined && panel.pan !== null) {
      if (
        !Array.isArray(panel.pan) ||
        panel.pan.length !== 4 ||
        !panel.pan.every((n) => typeof n === "number" && Number.isFinite(n))
      ) {
        throw new Error(
          `Panel at index ${index} pan must contain 4 finite numbers [x0, y0, x1, y1]`
        );
      }
      pan = [panel.pan[0], panel.pan[1], panel.pan[2], panel.pan[3]];
    }

    let minMs = 5200;
    if (panel.minMs !== undefined && panel.minMs !== null) {
      const parsed = Number(panel.minMs);
      if (Number.isFinite(parsed)) {
        minMs = Math.max(2200, Math.min(12000, Math.round(parsed)));
      }
    }

    return Object.freeze({
      art: panel.art,
      paint: panel.paint !== undefined ? panel.paint : null,
      caption: panel.caption,
      speak:
        panel.speak !== undefined && panel.speak !== null
          ? String(panel.speak)
          : script.narrator
          ? String(script.narrator)
          : null,
      pan: Object.freeze(pan),
      minMs,
    });
  });

  return Object.freeze({
    id: script.id ? String(script.id) : "cutscene",
    ...(script.title !== undefined ? { title: String(script.title) } : {}),
    ...(script.narrator !== undefined ? { narrator: String(script.narrator) } : {}),
    ...(script.mapIndex !== undefined ? { mapIndex: Number(script.mapIndex) } : {}),
    footer: script.footer !== undefined ? String(script.footer) : "",
    panels: Object.freeze(normalizedPanels),
  });
}

const INITIAL_STATE = Object.freeze({
  state: "idle",
  status: "idle",
  phase: "idle",
  script: null,
  panelIndex: -1,
  panel: null,
  panelCount: 0,
  reducedMotion: false,
  panelStartedMs: 0,
  phaseStartedMs: 0,
  phaseDurationMs: 0,
  phaseElapsedMs: 0,
  elapsedPanelMs: 0,
  progress: 0,
  canAdvance: false,
  pan: Object.freeze([0, 0, 0, 0]),
  isPlaying: false,
});

/**
 * Pure state reducer for cutscene playback.
 * Actions: START, ADVANCE, TICK, SKIP, DONE.
 * States: idle, playing, panelIn, holding, panelOut, finished.
 * @param {object} state Current cutscene state
 * @param {object|string} action Action to process
 * @param {number} nowMs Current timestamp in ms
 * @returns {object} Next immutable state
 */
export function cutsceneReducer(state = INITIAL_STATE, action, nowMs = 0) {
  const current = state || INITIAL_STATE;
  if (!action) return current;

  const type =
    typeof action === "string"
      ? action.toUpperCase()
      : String(action.type || "").toUpperCase();
  const now =
    typeof nowMs === "number" && Number.isFinite(nowMs)
      ? nowMs
      : current.phaseStartedMs;

  switch (type) {
    case "START": {
      if (!action.script) {
        throw new Error("Cannot START cutscene without a script");
      }
      const script = createCutsceneScript(action.script);
      const reducedMotion = Boolean(action.reducedMotion);
      const panel = script.panels[0];
      const panelInDuration = reducedMotion ? 0 : 420;
      const pan = reducedMotion ? Object.freeze([0, 0, 0, 0]) : panel.pan;

      return Object.freeze({
        state: "panelIn",
        status: "panelIn",
        phase: "panelIn",
        script,
        panelIndex: 0,
        panel,
        panelCount: script.panels.length,
        reducedMotion,
        panelStartedMs: now,
        phaseStartedMs: now,
        phaseDurationMs: panelInDuration,
        phaseElapsedMs: 0,
        elapsedPanelMs: 0,
        progress: 0,
        canAdvance: false,
        pan,
        isPlaying: true,
      });
    }

    case "ADVANCE": {
      if (!current.isPlaying || !current.script) {
        return current;
      }

      // ADVANCE during panelIn completes panelIn instantly (no stuck states)
      if (
        current.state === "panelIn" ||
        current.phase === "panelIn" ||
        current.state === "playing"
      ) {
        const elapsedPanel = Math.max(0, now - current.panelStartedMs);
        return Object.freeze({
          ...current,
          state: "holding",
          status: "holding",
          phase: "holding",
          phaseStartedMs: now,
          phaseDurationMs: current.panel.minMs,
          phaseElapsedMs: 0,
          elapsedPanelMs: elapsedPanel,
          canAdvance: elapsedPanel >= current.panel.minMs,
          progress: Math.min(1, elapsedPanel / current.panel.minMs),
        });
      }

      if (current.state === "holding" || current.phase === "holding") {
        const panelOutDuration = current.reducedMotion ? 0 : 360;
        return Object.freeze({
          ...current,
          state: "panelOut",
          status: "panelOut",
          phase: "panelOut",
          phaseStartedMs: now,
          phaseDurationMs: panelOutDuration,
          phaseElapsedMs: 0,
          canAdvance: false,
          progress: 0,
        });
      }

      if (current.state === "panelOut" || current.phase === "panelOut") {
        const nextIndex = current.panelIndex + 1;
        if (nextIndex < current.script.panels.length) {
          const nextPanel = current.script.panels[nextIndex];
          const panelInDuration = current.reducedMotion ? 0 : 420;
          const pan = current.reducedMotion
            ? Object.freeze([0, 0, 0, 0])
            : nextPanel.pan;
          return Object.freeze({
            ...current,
            state: "panelIn",
            status: "panelIn",
            phase: "panelIn",
            panelIndex: nextIndex,
            panel: nextPanel,
            panelStartedMs: now,
            phaseStartedMs: now,
            phaseDurationMs: panelInDuration,
            phaseElapsedMs: 0,
            elapsedPanelMs: 0,
            progress: 0,
            canAdvance: false,
            pan,
          });
        }
        return Object.freeze({
          ...current,
          state: "finished",
          status: "finished",
          phase: "finished",
          isPlaying: false,
          canAdvance: true,
          phaseStartedMs: now,
          phaseDurationMs: 0,
          phaseElapsedMs: 0,
          progress: 1,
        });
      }

      if (current.state === "finished" || current.phase === "finished") {
        return INITIAL_STATE;
      }

      return current;
    }

    case "TICK": {
      if (!current.isPlaying || !current.script) {
        return current;
      }

      const elapsedPhase = Math.max(0, now - current.phaseStartedMs);
      const elapsedPanel = Math.max(0, now - current.panelStartedMs);

      if (
        current.state === "panelIn" ||
        current.phase === "panelIn" ||
        current.state === "playing"
      ) {
        const duration = current.reducedMotion ? 0 : 420;
        if (elapsedPhase >= duration) {
          return Object.freeze({
            ...current,
            state: "holding",
            status: "holding",
            phase: "holding",
            phaseStartedMs: now,
            phaseDurationMs: current.panel.minMs,
            phaseElapsedMs: 0,
            elapsedPanelMs: elapsedPanel,
            canAdvance: elapsedPanel >= current.panel.minMs,
            progress: Math.min(1, elapsedPanel / current.panel.minMs),
          });
        }
        return Object.freeze({
          ...current,
          phaseElapsedMs: elapsedPhase,
          elapsedPanelMs: elapsedPanel,
          progress: duration > 0 ? Math.min(1, elapsedPhase / duration) : 1,
          canAdvance: false,
        });
      }

      if (current.state === "holding" || current.phase === "holding") {
        const canAdvance = elapsedPanel >= current.panel.minMs;
        // TICK never auto-advances past holding
        return Object.freeze({
          ...current,
          phaseElapsedMs: elapsedPhase,
          elapsedPanelMs: elapsedPanel,
          canAdvance,
          progress: Math.min(1, elapsedPanel / current.panel.minMs),
        });
      }

      if (current.state === "panelOut" || current.phase === "panelOut") {
        const duration = current.reducedMotion ? 0 : 360;
        if (elapsedPhase >= duration) {
          const nextIndex = current.panelIndex + 1;
          if (nextIndex < current.script.panels.length) {
            const nextPanel = current.script.panels[nextIndex];
            const panelInDuration = current.reducedMotion ? 0 : 420;
            const pan = current.reducedMotion
              ? Object.freeze([0, 0, 0, 0])
              : nextPanel.pan;
            return Object.freeze({
              ...current,
              state: "panelIn",
              status: "panelIn",
              phase: "panelIn",
              panelIndex: nextIndex,
              panel: nextPanel,
              panelStartedMs: now,
              phaseStartedMs: now,
              phaseDurationMs: panelInDuration,
              phaseElapsedMs: 0,
              elapsedPanelMs: 0,
              progress: 0,
              canAdvance: false,
              pan,
            });
          }
          return Object.freeze({
            ...current,
            state: "finished",
            status: "finished",
            phase: "finished",
            isPlaying: false,
            canAdvance: true,
            phaseStartedMs: now,
            phaseDurationMs: 0,
            phaseElapsedMs: 0,
            progress: 1,
          });
        }
        return Object.freeze({
          ...current,
          phaseElapsedMs: elapsedPhase,
          progress: duration > 0 ? Math.min(1, elapsedPhase / duration) : 1,
        });
      }

      return current;
    }

    case "SKIP": {
      if (!current.isPlaying && current.state !== "idle") {
        return current;
      }
      return Object.freeze({
        ...current,
        state: "finished",
        status: "finished",
        phase: "finished",
        isPlaying: false,
        canAdvance: true,
        phaseStartedMs: now,
        phaseDurationMs: 0,
        phaseElapsedMs: 0,
        progress: 1,
      });
    }

    case "DONE": {
      return INITIAL_STATE;
    }

    default:
      return current;
  }
}

/**
 * Generate cumulative character-count reveal points for typewriter effect.
 * @param {string} caption Text caption
 * @param {number} [chunkMs=34] Milliseconds per chunk cadence
 * @returns {number[]} Array of cumulative char reveal points (>=2 chunks, last = full length)
 */
export function captionChunks(caption, chunkMs = 34) {
  const str = typeof caption === "string" ? caption.slice(0, 180) : "";
  const total = str.length;

  if (total <= 0) {
    return [0, 0];
  }
  if (total === 1) {
    return [0, 1];
  }

  const step = Math.max(1, Math.floor((Number(chunkMs) || 34) / 34));
  const chunks = [];

  for (let i = step; i < total; i += step) {
    chunks.push(i);
  }
  chunks.push(total);

  if (chunks.length < 2) {
    chunks.unshift(0);
  }

  return chunks;
}

if (typeof window !== "undefined") {
  window.KRCCutsceneCore = Object.freeze({
    createCutsceneScript,
    cutsceneReducer,
    captionChunks,
  });
}
