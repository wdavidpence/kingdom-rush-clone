/**
 * KRC v1.5.2 AftermathLedger — pure, deterministic ring-buffer of battlefield stains.
 * No Phaser, no DOM, no timers, no Math.random, no Date. Never stores functions.
 */

const KINDS = Object.freeze(["corpse", "scorch", "arrow", "crater"]);

function sanitizeEntry(event, clock) {
  if (!event || typeof event !== "object") return null;
  if (!KINDS.includes(event.kind)) return null;
  const t = Number.isFinite(event.t) ? event.t : clock;
  return {
    kind: event.kind,
    x: Number(event.x) || 0,
    y: Number(event.y) || 0,
    t,
    rot: Number(event.rot) || 0,
    kind2: event.kind2 == null ? null : String(event.kind2),
  };
}

export class AftermathLedger {
  constructor(maxEntries = 48) {
    const cap = Number(maxEntries);
    this.maxEntries = Number.isFinite(cap) && cap > 0 ? Math.floor(cap) : 48;
    this._clock = 0;
    this.entries = [];
  }

  record(event) {
    const stored = sanitizeEntry(event, this._clock);
    if (!stored) return null;
    if (!Number.isFinite(event?.t)) this._clock += 1;
    else if (event.t >= this._clock) this._clock = event.t + 1;
    this.entries.push(stored);
    while (this.entries.length > this.maxEntries) this.evictOldest();
    return stored;
  }

  evictOldest() {
    if (!this.entries.length) return null;
    return this.entries.shift();
  }

  capTo(maxKeep) {
    const cap = Math.max(0, Math.floor(Number(maxKeep)));
    const evicted = [];
    while (this.entries.length > cap) {
      const old = this.evictOldest();
      if (old) evicted.push(old);
    }
    return evicted;
  }

  snapshot() {
    return {
      maxEntries: this.maxEntries,
      clock: this._clock,
      entries: this.entries.map((entry) => ({
        kind: entry.kind,
        x: entry.x,
        y: entry.y,
        t: entry.t,
        rot: entry.rot,
        kind2: entry.kind2,
      })),
    };
  }

  restore(json) {
    let data = json;
    if (typeof json === "string") {
      data = JSON.parse(json);
    }
    this.entries = [];
    if (!data || typeof data !== "object") {
      this._clock = 0;
      return this;
    }
    if (Number.isFinite(data.maxEntries) && data.maxEntries > 0) {
      this.maxEntries = Math.floor(data.maxEntries);
    }
    this._clock = Number.isFinite(data.clock) ? data.clock : 0;
    const list = Array.isArray(data.entries) ? data.entries : Array.isArray(data) ? data : [];
    for (const event of list) {
      const stored = sanitizeEntry(event, this._clock);
      if (!stored) continue;
      this.entries.push(stored);
      if (stored.t >= this._clock) this._clock = stored.t + 1;
    }
    while (this.entries.length > this.maxEntries) this.evictOldest();
    return this;
  }
}

if (typeof globalThis !== "undefined") {
  globalThis.KRCAftermath = { AftermathLedger };
}
