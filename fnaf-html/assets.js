/* =========================================================
   Five Nights no SENAI — carregador de imagens
   ========================================================= */
(function () {
  'use strict';

  const MANIFEST = {
    bunny: 'assets/characters/bunny.jpg',
    chicken: 'assets/characters/chicken.jpg',
    foxy: 'assets/characters/foxy.jpg',
    bear: 'assets/characters/bear.jpg',
    stage: 'assets/rooms/stage.jpg',
    dining: 'assets/rooms/dining.jpg',
    kitchen: 'assets/rooms/kitchen.jpg',
    closet: 'assets/rooms/closet.jpg',
    westhall: 'assets/rooms/westhall.jpg',
    officehall: 'assets/rooms/officehall.jpg',
    vent: 'assets/rooms/vent.jpg',
    concrete: 'assets/textures/concrete.jpg',
  };

  const images = {};
  const loaded = {};
  let progress = 0;
  let started = false;

  function get(key) {
    return loaded[key] ? images[key] : null;
  }

  function isReady(key) {
    return !!loaded[key];
  }

  function load(onProgress) {
    if (started) {
      if (onProgress) onProgress(1);
      return Promise.resolve();
    }
    started = true;

    const entries = Object.keys(MANIFEST);
    const total = entries.length;

    return Promise.all(entries.map((key) => new Promise((resolve) => {
      const img = new Image();
      let done = false;

      const finish = (ok) => {
        if (done) return;
        done = true;
        if (ok) {
          images[key] = img;
          loaded[key] = true;
        }
        progress += 1;
        if (onProgress) onProgress(progress / total);
        resolve();
      };

      img.onload = () => {
        if (img.naturalWidth > 0) finish(true);
        else finish(false);
      };
      img.onerror = () => finish(false);
      img.decoding = 'async';
      img.src = MANIFEST[key];

      if (img.complete && img.naturalWidth > 0) finish(true);
    }))).then(() => {
      if (onProgress) onProgress(1);
    });
  }

  window.GameAssets = {
    manifest: MANIFEST,
    get,
    isReady,
    load,
  };
})();
