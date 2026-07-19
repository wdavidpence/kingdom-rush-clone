(() => {
  const TERMINAL_STATES = new Set(["removed"]);

  function createRegistry() {
    let sequence = 0;

    function create(kind, fields = {}) {
      sequence += 1;
      return { id: `${kind}-${sequence}`, state: "active", ...fields };
    }

    function transition(entity, nextState) {
      if (!entity || TERMINAL_STATES.has(entity.state)) return false;
      entity.state = nextState;
      return true;
    }

    function isActive(entity) {
      return !!entity && entity.state === "active";
    }

    return Object.freeze({ create, transition, isActive });
  }

  window.KRCEntityState = Object.freeze({ createRegistry });
})();
