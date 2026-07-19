(() => {
  function destroyAll(objects) {
    for (const object of objects || []) object?.destroy?.();
  }

  window.KRCSceneCleanup = Object.freeze({ destroyAll });
})();
