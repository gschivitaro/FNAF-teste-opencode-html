/* =========================================================
   Five Nights no SENAI — motor do jogo
   HTML5 + CSS + JavaScript + WebAudio + imagens locais
   ========================================================= */
(() => {
  'use strict';

  /* ---------------- utilidades ---------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const roll = (level) => level > 0 && Math.random() * 20 < level;
  const pad = (v) => String(v).padStart(2, '0');

  /* ---------------- constantes ---------------- */
  const HOUR_SECONDS = 45;
  const NIGHTS = 6;
  const AI_TICK = 5;

  const AI_LEVELS = {
    1: { bunny: 1, chicken: 1, foxy: 1, bear: 0 },
    2: { bunny: 3, chicken: 2, foxy: 2, bear: 0 },
    3: { bunny: 5, chicken: 4, foxy: 3, bear: 1 },
    4: { bunny: 7, chicken: 6, foxy: 5, bear: 3 },
    5: { bunny: 10, chicken: 9, foxy: 8, bear: 5 },
    6: { bunny: 13, chicken: 12, foxy: 11, bear: 7 },
  };

  const DIFF_LABEL = {
    1: 'Iniciante',
    2: 'Fácil',
    3: 'Médio',
    4: 'Difícil',
    5: 'Pesadelo',
    6: 'Noite final',
  };

  const DRAIN = [0, 0.045, 0.095, 0.16, 0.24, 0.33, 0.44, 0.56, 0.70];

  const BOT_NAMES = {
    bunny: 'Coelho',
    chicken: 'Galinha',
    foxy: 'Raposa',
    bear: 'Urso',
  };

  const SCARE_TEXT = {
    bunny: 'O Coelho entrou pela porta esquerda.',
    chicken: 'A Galinha entrou pela porta direita.',
    foxy: 'A Raposa correu pelo corredor. Você não fechou a porta a tempo.',
    bear: 'O Urso saiu do duto e apagou o seu turno.',
  };

  const CAMERAS = [
    { id: 'stage', code: 'CAM 1A', name: 'Palco', room: 'stage', x: 4, y: 4, w: 43, h: 23 },
    { id: 'dining', code: 'CAM 1B', name: 'Refeitório', room: 'dining', x: 4, y: 30, w: 43, h: 27 },
    { id: 'kitchen', code: 'CAM 2A', name: 'Cozinha', room: 'kitchen', x: 55, y: 4, w: 41, h: 23 },
    { id: 'closet', code: 'CAM 3B', name: 'Depósito', room: 'closet', x: 55, y: 30, w: 41, h: 18 },
    { id: 'vents', code: 'CAM 5', name: 'Dutos', room: 'vent', x: 55, y: 51, w: 41, h: 9 },
    { id: 'westhall', code: 'CAM 2B', name: 'Corredor Oeste', room: 'westhall', x: 4, y: 62, w: 30, h: 34 },
    { id: 'officehall', code: 'CAM 4A', name: 'Hall do Escritório', room: 'officehall', x: 39, y: 66, w: 23, h: 30 },
    { id: 'easthall', code: 'CAM 3A', name: 'Corredor Leste', room: 'westhall', mirror: true, x: 66, y: 62, w: 30, h: 34 },
  ];

  const CAM_BY_ID = {};
  CAMERAS.forEach((cam) => { CAM_BY_ID[cam.id] = cam; });

  const PRESETS = {
    easy: { bunny: 2, chicken: 2, foxy: 2, bear: 0 },
    normal: { bunny: 5, chicken: 5, foxy: 5, bear: 2 },
    hard: { bunny: 10, chicken: 9, foxy: 8, bear: 6 },
    nightmare: { bunny: 20, chicken: 20, foxy: 20, bear: 20 },
  };

  /* ---------------- DOM ---------------- */
  const el = {
    app: $('#app'),
    loading: $('#loading'),
    loadFill: $('#load-fill'),
    loadText: $('#load-text'),
    menu: $('#menu'),
    game: $('#game'),
    scene: $('#scene'),
    nights: $('#nights'),
    howto: $('#howto'),
    howtoBtn: $('#howto-btn'),
    customBtn: $('#custom-btn'),
    custom: $('#custom'),
    customTotal: $('#custom-total'),
    aiBunny: $('#ai-bunny'),
    aiChicken: $('#ai-chicken'),
    aiFoxy: $('#ai-foxy'),
    aiBear: $('#ai-bear'),
    aiBunnyVal: $('#ai-bunny-val'),
    aiChickenVal: $('#ai-chicken-val'),
    aiFoxyVal: $('#ai-foxy-val'),
    aiBearVal: $('#ai-bear-val'),
    customStart: $('#custom-start'),
    customBack: $('#custom-back'),
    settingsBtn: $('#settings-btn'),
    creditsBtn: $('#credits-btn'),
    hudNight: $('#hud-night'),
    hudTime: $('#hud-time'),
    pauseBtn: $('#pause-btn'),
    power: $('.power'),
    powerFill: $('#power-fill'),
    powerPct: $('#power-pct'),
    usage: $('#usage-bars'),
    btnDoorL: $('#btn-door-left'),
    btnDoorR: $('#btn-door-right'),
    btnLightL: $('#btn-light-left'),
    btnLightR: $('#btn-light-right'),
    vents: $('#vents'),
    btnVentL: $('#btn-vent-left'),
    btnVentR: $('#btn-vent-right'),
    camTab: $('#cam-tab'),
    camview: $('#camview'),
    camLabel: $('#cam-label'),
    camMap: $('#cam-map'),
    camClose: $('#cam-close'),
    camCanvas: $('#cam-canvas'),
    leftDoor: $('#left-door'),
    rightDoor: $('#right-door'),
    leftSil: $('#left-sil'),
    rightSil: $('#right-sil'),
    dark: $('#dark-overlay'),
    scare: $('#scare'),
    scareFace: $('#scare-face'),
    flash: $('#flash'),
    nightIntro: $('#night-intro'),
    introNight: $('#intro-night'),
    pause: $('#pause'),
    pauseResume: $('#pause-resume'),
    pauseSettings: $('#pause-settings'),
    pauseRestart: $('#pause-restart'),
    pauseMenu: $('#pause-menu'),
    gameover: $('#gameover'),
    gameoverMsg: $('#gameover-msg'),
    retry: $('#retry-btn'),
    menuBtn: $('#menu-btn'),
    win: $('#win'),
    winTitle: $('.win-title'),
    winMsg: $('#win-msg'),
    nextBtn: $('#next-btn'),
    winMenuBtn: $('#win-menu-btn'),
    settings: $('#settings'),
    settingsClose: $('#settings-close'),
    setVolume: $('#set-volume'),
    setVolumeVal: $('#set-volume-val'),
    setMute: $('#set-mute'),
    setShake: $('#set-shake'),
    setGrain: $('#set-grain'),
    setFlash: $('#set-flash'),
    credits: $('#credits'),
    creditsClose: $('#credits-close'),
  };

  const camCanvas = el.camCanvas;
  const camCtx = camCanvas.getContext('2d');

  /* ---------------- preferências ---------------- */
  const DEFAULT_SETTINGS = {
    volume: 75,
    mute: false,
    shake: true,
    grain: true,
    flash: true,
  };

  const settings = { ...DEFAULT_SETTINGS };

  function loadSettings() {
    try {
      const raw = localStorage.getItem('fnaf_senai_settings');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed.volume === 'number') settings.volume = clamp(parsed.volume, 0, 100);
      if (typeof parsed.mute === 'boolean') settings.mute = parsed.mute;
      if (typeof parsed.shake === 'boolean') settings.shake = parsed.shake;
      if (typeof parsed.grain === 'boolean') settings.grain = parsed.grain;
      if (typeof parsed.flash === 'boolean') settings.flash = parsed.flash;
    } catch (e) { /* ignore */ }
  }

  function saveSettings() {
    try {
      localStorage.setItem('fnaf_senai_settings', JSON.stringify(settings));
    } catch (e) { /* ignore */ }
  }

  function applySettings() {
    el.setVolume.value = String(settings.volume);
    el.setVolumeVal.textContent = settings.volume + '%';
    el.setMute.checked = settings.mute;
    el.setShake.checked = settings.shake;
    el.setGrain.checked = settings.grain;
    el.setFlash.checked = settings.flash;

    el.app.classList.toggle('no-shake', !settings.shake);
    el.app.classList.toggle('no-grain', !settings.grain);
    el.app.classList.toggle('no-flash', !settings.flash);

    Sfx.setVolume(settings.volume, settings.mute);
  }

  /* ---------------- áudio sintetizado ---------------- */
  const Sfx = {
    ctx: null,
    master: null,
    noiseBuf: null,
    ambient: null,
    staticGain: null,
    volume: DEFAULT_SETTINGS.volume,
    muted: DEFAULT_SETTINGS.mute,

    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : (this.volume / 100) * 0.82;
      this.master.connect(this.ctx.destination);

      const len = Math.floor(this.ctx.sampleRate * 2);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;

      this.buildStatic();
    },

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    suspend() {
      if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
    },

    setVolume(value, muted) {
      this.volume = value;
      this.muted = muted;
      if (!this.master) return;
      const target = muted ? 0 : (value / 100) * 0.82;
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(target, t, 0.05);
    },

    time() {
      return this.ctx ? this.ctx.currentTime : 0;
    },

    noiseSource() {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      src.loop = true;
      return src;
    },

    burst(opts = {}) {
      if (!this.ctx) return;
      const { dur = 0.2, gain = 0.25, type = 'lowpass', freq = 800, q = 0.8, when = 0 } = opts;
      const t = this.time() + when;
      const src = this.noiseSource();
      const filt = this.ctx.createBiquadFilter();
      filt.type = type;
      filt.frequency.setValueAtTime(freq, t);
      filt.Q.value = q;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.002, gain), t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(filt);
      filt.connect(g);
      g.connect(this.master);
      src.start(t);
      src.stop(t + dur + 0.05);
    },

    tone(opts = {}) {
      if (!this.ctx) return;
      const { freq = 220, dur = 0.3, type = 'sine', gain = 0.15, slide = 0, when = 0 } = opts;
      const t = this.time() + when;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, freq), t);
      if (slide) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
      }
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.002, gain), t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(this.master);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    },

    buildStatic() {
      if (!this.ctx) return;
      const src = this.noiseSource();
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'highpass';
      filt.frequency.value = 1100;
      const g = this.ctx.createGain();
      g.gain.value = 0;
      src.connect(filt);
      filt.connect(g);
      g.connect(this.master);
      src.start();
      this.staticGain = g;
    },

    setStatic(on) {
      if (!this.ctx || !this.staticGain) return;
      const t = this.time();
      const g = this.staticGain.gain;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(on ? 0.085 : 0, t + 0.14);
    },

    startAmbient() {
      if (!this.ctx || this.ambient) return;
      const ctx = this.ctx;
      const out = ctx.createGain();
      out.gain.value = 0.0001;
      out.connect(this.master);

      const o1 = ctx.createOscillator();
      o1.type = 'sine';
      o1.frequency.value = 52;
      const o2 = ctx.createOscillator();
      o2.type = 'sine';
      o2.frequency.value = 78;
      o2.detune.value = 8;
      const og = ctx.createGain();
      og.gain.value = 0.16;
      o1.connect(og);
      o2.connect(og);
      og.connect(out);

      const n = this.noiseSource();
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 240;
      const ng = ctx.createGain();
      ng.gain.value = 0.22;
      n.connect(f);
      f.connect(ng);
      ng.connect(out);

      o1.start();
      o2.start();
      n.start();

      out.gain.exponentialRampToValueAtTime(0.13, this.time() + 1.4);
      this.ambient = { out, nodes: [o1, o2, n] };
    },

    stopAmbient() {
      if (!this.ambient) return;
      const { out, nodes } = this.ambient;
      const t = this.time();
      try {
        out.gain.cancelScheduledValues(t);
        out.gain.setValueAtTime(out.gain.value, t);
        out.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        nodes.forEach((n) => {
          try { n.stop(t + 0.7); } catch (e) { /* ignore */ }
        });
      } catch (e) { /* ignore */ }
      this.ambient = null;
    },

    light() {
      this.burst({ dur: 0.07, gain: 0.09, type: 'highpass', freq: 1800 });
    },

    door() {
      this.burst({ dur: 0.4, gain: 0.3, type: 'lowpass', freq: 520 });
      this.tone({ freq: 82, dur: 0.35, type: 'sine', gain: 0.28, slide: -30 });
    },

    vent() {
      this.burst({ dur: 0.32, gain: 0.22, type: 'bandpass', freq: 480, q: 2.2 });
      this.tone({ freq: 120, dur: 0.3, type: 'square', gain: 0.08, slide: -45 });
    },

    step() {
      this.burst({ dur: 0.18, gain: 0.11, type: 'lowpass', freq: 260 });
    },

    thump() {
      this.burst({ dur: 0.25, gain: 0.2, type: 'lowpass', freq: 180 });
      this.tone({ freq: 58, dur: 0.3, type: 'sine', gain: 0.22, slide: -16 });
    },

    bearMove() {
      this.burst({ dur: 0.4, gain: 0.18, type: 'lowpass', freq: 150 });
      this.tone({ freq: 46, dur: 0.55, type: 'sine', gain: 0.24, slide: -12 });
    },

    bearRetreat() {
      this.burst({ dur: 0.55, gain: 0.14, type: 'lowpass', freq: 220 });
      this.tone({ freq: 74, dur: 0.6, type: 'triangle', gain: 0.1, slide: -30 });
    },

    foxyMove() {
      this.tone({ freq: 900, dur: 0.18, type: 'square', gain: 0.05, slide: -520 });
      this.burst({ dur: 0.22, gain: 0.12, type: 'highpass', freq: 1500 });
    },

    run() {
      for (let i = 0; i < 7; i++) {
        this.burst({ dur: 0.09, gain: 0.2, type: 'lowpass', freq: 520, when: i * 0.14 });
      }
    },

    powerDown() {
      this.tone({ freq: 420, dur: 1.5, type: 'sawtooth', gain: 0.09, slide: -370 });
      this.burst({ dur: 1, gain: 0.18, type: 'lowpass', freq: 300 });
    },

    musicBox() {
      const notes = [659, 587, 523, 587, 659, 523, 440, 523, 587, 659, 587, 523, 440, 392, 440, 523];
      notes.forEach((f, i) => {
        this.tone({ freq: f / 2, dur: 0.55, type: 'triangle', gain: 0.05, when: 0.4 + i * 0.42 });
      });
    },

    winChime() {
      [523, 659, 784, 1046].forEach((f, i) => {
        this.tone({ freq: f, dur: 0.6, type: 'triangle', gain: 0.11, when: i * 0.17 });
      });
    },

    scream() {
      this.burst({ dur: 1.5, gain: 0.45, type: 'highpass', freq: 320 });
      [92, 128, 167].forEach((f, i) => {
        this.tone({ freq: f, dur: 1.3, type: 'sawtooth', gain: 0.13, slide: -60 - i * 18, when: i * 0.02 });
      });
      this.tone({ freq: 61, dur: 1.2, type: 'square', gain: 0.11, slide: -30 });
    },
  };

  /* ---------------- estado / timers ---------------- */
  let state = null;
  let raf = 0;
  let timers = [];
  let unlocked = 1;
  let mouseX = 0.5;
  let lastConfig = null;
  let customAI = { ...PRESETS.normal };

  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  function clearTimers() {
    timers.forEach((id) => clearTimeout(id));
    timers = [];
  }

  function normalizeAI(ai) {
    return {
      bunny: clamp(Number(ai.bunny) || 0, 0, 20),
      chicken: clamp(Number(ai.chicken) || 0, 0, 20),
      foxy: clamp(Number(ai.foxy) || 0, 0, 20),
      bear: clamp(Number(ai.bear) || 0, 0, 20),
    };
  }

  /* ---------------- imagens / desenho ---------------- */
  const noiseFrames = [];
  const camSize = { w: 0, h: 0, dpr: 1 };

  function image(key) {
    return window.GameAssets ? window.GameAssets.get(key) : null;
  }

  function imagePath(key) {
    if (window.GameAssets && window.GameAssets.manifest && window.GameAssets.manifest[key]) {
      return window.GameAssets.manifest[key];
    }
    return 'assets/characters/' + key + '.jpg';
  }

  function buildNoiseFrames() {
    for (let f = 0; f < 7; f++) {
      const c = document.createElement('canvas');
      c.width = 180;
      c.height = 120;
      const cx = c.getContext('2d');
      const img = cx.createImageData(180, 120);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      cx.putImageData(img, 0, 0);
      noiseFrames.push(c);
    }
  }

  function resizeCamCanvas() {
    const rect = camCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    camSize.w = Math.max(1, Math.round(rect.width));
    camSize.h = Math.max(1, Math.round(rect.height));
    camSize.dpr = dpr;
    camCanvas.width = Math.round(camSize.w * dpr);
    camCanvas.height = Math.round(camSize.h * dpr);
    camCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawCover(ctx, img, x, y, w, h, zoom = 1, mirror = false) {
    if (!img || !img.width || !img.height) return false;
    const scale = Math.max(w / img.width, h / img.height) * zoom;
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;
    ctx.save();
    if (mirror) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, dx - x, dy - y, dw, dh);
    } else {
      ctx.drawImage(img, dx, dy, dw, dh);
    }
    ctx.restore();
    return true;
  }

  function drawCharacter(ctx, type, cx, bottom, heightFrac, alpha = 0.9, mirror = false) {
    const img = image(type);
    if (!img) return;
    const h = camSize.h * heightFrac;
    const w = h * (img.width / img.height);
    const x = cx - w / 2;
    const y = bottom - h;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = alpha;
    ctx.filter = 'brightness(0.9) contrast(1.3) saturate(0.62)';
    if (mirror) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, w, h);
    } else {
      ctx.drawImage(img, x, y, w, h);
    }
    ctx.restore();
  }

  function drawFallbackRoom(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#151b1b');
    g.addColorStop(0.6, '#0b0f0f');
    g.addColorStop(1, '#040505');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = w * 0.1; x < w; x += w * 0.1) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h * 0.65);
      ctx.stroke();
    }
    for (let y = h * 0.12; y < h * 0.65; y += h * 0.12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, h * 0.65, w, h * 0.35);
  }

  function drawRoomImage(cam, ts) {
    const w = camSize.w;
    const h = camSize.h;
    const ctx = camCtx;
    const room = image(cam.room) || image('westhall');
    const zoom = 1.04 + Math.sin(ts / 4200) * 0.006;

    ctx.save();
    ctx.filter = 'brightness(0.66) contrast(1.18) saturate(0.56)';
    if (!room || !drawCover(ctx, room, 0, 0, w, h, zoom, !!cam.mirror)) {
      drawFallbackRoom(ctx, w, h);
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(34, 58, 44, 0.075)';
    ctx.fillRect(0, 0, w, h);

    if (cam.id === 'kitchen') {
      ctx.fillStyle = 'rgba(210, 224, 212, 0.035)';
      ctx.fillRect(0, 0, w, h);
    }
  }

  function botsInCam(id) {
    const list = [];
    if (!state) return list;
    const bots = state.bots;

    if (id === 'stage') {
      if (bots.bear.pos === 'stage') list.push({ type: 'bear', side: '' });
      if (bots.bunny.pos === 'stage') list.push({ type: 'bunny', side: '' });
      if (bots.chicken.pos === 'stage') list.push({ type: 'chicken', side: '' });
    } else if (id === 'dining') {
      if (bots.bear.pos === 'dining') list.push({ type: 'bear', side: '' });
      if (bots.bunny.pos === 'dining') list.push({ type: 'bunny', side: '' });
      if (bots.chicken.pos === 'dining') list.push({ type: 'chicken', side: '' });
    } else if (id === 'westhall') {
      if (bots.bunny.pos === 'westhall') list.push({ type: 'bunny', side: '' });
      if (bots.foxy.stage === 2) list.push({ type: 'foxy', side: '' });
    } else if (id === 'easthall') {
      if (bots.chicken.pos === 'easthall') list.push({ type: 'chicken', side: '' });
    } else if (id === 'closet') {
      if (bots.foxy.stage === 1) list.push({ type: 'foxy', side: '' });
    } else if (id === 'officehall') {
      if (bots.bear.pos === 'officehall') list.push({ type: 'bear', side: '' });
    } else if (id === 'vents') {
      if (bots.bear.pos === 'ventLeft') list.push({ type: 'bear', side: 'E' });
      if (bots.bear.pos === 'ventRight') list.push({ type: 'bear', side: 'D' });
    }

    return list;
  }

  function drawCamBots(ts) {
    if (!state) return;
    const w = camSize.w;
    const h = camSize.h;
    const ctx = camCtx;
    const entries = botsInCam(state.cam);
    const pockets = {
      stage: {
        bear: { x: 0.50, bottom: 0.83, size: 0.72 },
        bunny: { x: 0.30, bottom: 0.88, size: 0.62 },
        chicken: { x: 0.70, bottom: 0.88, size: 0.60 },
      },
      dining: {
        bear: { x: 0.50, bottom: 0.88, size: 0.74 },
        bunny: { x: 0.34, bottom: 0.92, size: 0.66 },
        chicken: { x: 0.67, bottom: 0.92, size: 0.64 },
      },
      westhall: {
        bunny: { x: 0.60, bottom: 0.96, size: 0.78 },
        foxy: { x: 0.32, bottom: 0.97, size: 0.82 },
      },
      easthall: {
        chicken: { x: 0.48, bottom: 0.96, size: 0.78 },
      },
      closet: {
        foxy: { x: 0.52, bottom: 0.98, size: 0.86 },
      },
      officehall: {
        bear: { x: 0.50, bottom: 1.01, size: 0.92 },
      },
      vents: {
        bear: { x: 0.50, bottom: 1.02, size: 0.92 },
      },
    };

    const spots = pockets[state.cam] || {};
    entries.forEach((entry, index) => {
      const spot = spots[entry.type] || { x: 0.5, bottom: 0.9, size: 0.7 };
      const sway = Math.sin(ts / 1600 + index * 1.8) * 0.006;
      const drop = entry.side === 'E' ? -0.02 : entry.side === 'D' ? 0.01 : 0;
      ctx.save();
      if (entry.type === 'bear') {
        const glow = ctx.createRadialGradient(
          spot.x * w, (spot.bottom - spot.size * 0.62) * h, 0,
          spot.x * w, (spot.bottom - spot.size * 0.62) * h, h * 0.34
        );
        glow.addColorStop(0, 'rgba(90, 10, 8, 0.18)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }
      drawCharacter(ctx, entry.type, (spot.x + sway) * w, (spot.bottom + drop) * h, spot.size, entry.type === 'foxy' ? 0.84 : 0.9);
      ctx.restore();

      if (entry.side) {
        ctx.save();
        ctx.fillStyle = 'rgba(215, 200, 170, 0.85)';
        ctx.font = 'bold ' + Math.max(10, Math.round(w * 0.012)) + 'px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillText('DUTO ' + entry.side, spot.x * w, h * 0.14);
        ctx.restore();
      }
    });
  }

  function drawCamera(ts) {
    if (!state || !state.camsOpen) return;
    if (!camSize.w || !camSize.h) resizeCamCanvas();

    const w = camSize.w;
    const h = camSize.h;
    const ctx = camCtx;
    const cam = CAM_BY_ID[state.cam] || CAMERAS[0];

    ctx.clearRect(0, 0, w, h);
    drawRoomImage(cam, ts);
    drawCamBots(ts);

    if (noiseFrames.length) {
      const f = noiseFrames[((ts / 52) | 0) % noiseFrames.length];
      ctx.save();
      ctx.globalAlpha = state.cam === 'kitchen' ? 0.25 : 0.12;
      ctx.drawImage(f, 0, 0, w, h);
      ctx.restore();
    }

    const bandY = ((ts * 0.00016) % 1) * h;
    const band = ctx.createLinearGradient(0, bandY - h * 0.12, 0, bandY + h * 0.12);
    band.addColorStop(0, 'rgba(255,255,255,0)');
    band.addColorStop(0.5, 'rgba(255,255,255,0.032)');
    band.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = band;
    ctx.fillRect(0, bandY - h * 0.12, w, h * 0.24);

    const vg = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.2,
      w / 2, h / 2, Math.max(w, h) * 0.72
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.74)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);

    const stamp = 'CAM ' + cam.code.replace('CAM ', '') + '  ' + pad(Math.floor((ts / 1000) % 60));
    ctx.save();
    ctx.fillStyle = 'rgba(190, 205, 185, 0.48)';
    ctx.font = Math.max(9, Math.round(w * 0.009)) + 'px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(stamp, w * 0.02, h - h * 0.035);
    ctx.restore();
  }

  /* ---------------- HUD / escritório ---------------- */
  function currentUsage() {
    if (!state || state.powerOut) return 1;
    let usage = 1;
    if (state.leftDoor) usage++;
    if (state.rightDoor) usage++;
    if (state.leftLight) usage++;
    if (state.rightLight) usage++;
    if (state.ventLeftClosed) usage++;
    if (state.ventRightClosed) usage++;
    if (state.camsOpen) usage++;
    return Math.min(8, usage);
  }

  function timeLabel(time) {
    const hour = Math.floor(time / HOUR_SECONDS);
    if (hour <= 0) return '12 AM';
    if (hour >= 6) return '6 AM';
    return hour + ' AM';
  }

  function updateHUD() {
    if (!state) return;

    el.hudTime.textContent = timeLabel(state.time);

    const power = Math.max(0, state.power);
    el.powerPct.textContent = Math.round(power) + '%';
    el.powerFill.style.width = power + '%';
    el.power.classList.toggle('mid', power <= 50 && power > 25);
    el.power.classList.toggle('low', power <= 25);

    const usage = currentUsage();
    const bars = el.usage.children;
    for (let i = 0; i < bars.length; i++) {
      bars[i].classList.toggle('on', i < usage);
      bars[i].classList.toggle('high', i >= 3 && i < usage);
    }
  }

  function setSilhouette(node, type, show) {
    if (!show) {
      if (node.dataset.type) {
        node.innerHTML = '';
        node.dataset.type = '';
      }
      node.classList.remove('show');
      return;
    }

    if (node.dataset.type !== type) {
      node.innerHTML = '<img src="' + imagePath(type) + '" alt="">';
      node.dataset.type = type;
    }
    node.classList.add('show');
  }

  function updateOfficeVisuals() {
    if (!state) return;
    const powered = !state.powerOut;

    el.leftDoor.classList.toggle('closed', state.leftDoor);
    el.rightDoor.classList.toggle('closed', state.rightDoor);
    el.leftDoor.classList.toggle('lit', state.leftLight && powered);
    el.rightDoor.classList.toggle('lit', state.rightLight && powered);

    el.btnDoorL.classList.toggle('active', state.leftDoor);
    el.btnDoorR.classList.toggle('active', state.rightDoor);
    el.btnLightL.classList.toggle('active', state.leftLight && powered);
    el.btnLightR.classList.toggle('active', state.rightLight && powered);

    const showLeft = powered && state.leftLight && !state.leftDoor && state.bots.bunny.pos === 'leftdoor';
    const showRight = powered && state.rightLight && !state.rightDoor && state.bots.chicken.pos === 'rightdoor';
    setSilhouette(el.leftSil, 'bunny', showLeft);
    setSilhouette(el.rightSil, 'chicken', showRight);

    const bearActive = state.ai.bear > 0;
    el.vents.classList.toggle('hidden', !bearActive || !powered);
    el.btnVentL.classList.toggle('active', state.ventLeftClosed);
    el.btnVentR.classList.toggle('active', state.ventRightClosed);
    el.btnVentL.classList.toggle('danger', state.bots.bear.pos === 'ventLeft' && !state.ventLeftClosed);
    el.btnVentR.classList.toggle('danger', state.bots.bear.pos === 'ventRight' && !state.ventRightClosed);

    const bearNear = state.bots.bear.pos === 'officehall' ||
      state.bots.bear.pos === 'ventLeft' ||
      state.bots.bear.pos === 'ventRight';
    el.game.classList.toggle('bear-near', bearNear && powered);
  }

  function applyParallax() {
    if (!state || !state.running || state.paused || state.intro || state.camsOpen || state.powerOut) {
      el.scene.style.transform = 'translateX(0)';
      return;
    }
    const shift = (0.5 - mouseX) * 6;
    el.scene.style.transform = 'translateX(' + shift.toFixed(2) + '%)';
  }

  /* ---------------- câmeras ---------------- */
  function updateCamLabel() {
    if (!state) return;
    const cam = CAM_BY_ID[state.cam];
    if (!cam) return;
    el.camLabel.textContent = cam.code + ' · ' + cam.name.toUpperCase();
  }

  function updateMapState() {
    if (!state) return;
    $$('.cam-btn', el.camMap).forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.cam === state.cam);
    });
  }

  function openCams() {
    if (!state || !state.running || state.paused || state.intro || state.powerOut || state.camsOpen) return;
    state.camsOpen = true;
    el.camview.classList.remove('hidden');
    el.game.classList.add('cams-open');
    resizeCamCanvas();
    updateCamLabel();
    updateMapState();
    Sfx.setStatic(true);
    Sfx.burst({ dur: 0.12, gain: 0.1, type: 'highpass', freq: 1500 });
    updateHUD();
    drawCamera(performance.now());
  }

  function closeCams(silent) {
    if (!state) return;
    const wasOpen = state.camsOpen;
    state.camsOpen = false;
    el.camview.classList.add('hidden');
    el.game.classList.remove('cams-open');
    Sfx.setStatic(false);
    if (wasOpen && !silent) {
      Sfx.burst({ dur: 0.1, gain: 0.09, type: 'highpass', freq: 1200 });
    }
    updateHUD();
  }

  function toggleCams() {
    if (!state || !state.running || state.paused || state.intro) return;
    if (state.camsOpen) closeCams(false);
    else openCams();
  }

  function selectCam(id) {
    if (!state || !state.running || state.paused || !state.camsOpen) return;
    if (!CAM_BY_ID[id] || state.cam === id) return;
    state.cam = id;
    updateCamLabel();
    updateMapState();
    el.camview.classList.remove('switching');
    void el.camview.offsetWidth;
    el.camview.classList.add('switching');
    window.setTimeout(() => {
      if (el.camview) el.camview.classList.remove('switching');
    }, 190);
    Sfx.burst({ dur: 0.16, gain: 0.13, type: 'highpass', freq: 900 });
    Sfx.burst({ dur: 0.05, gain: 0.08, type: 'lowpass', freq: 300 });
  }

  /* ---------------- ações do jogador ---------------- */
  function canAct() {
    return !!state && state.running && !state.paused && !state.intro && !state.powerOut && !state.scare;
  }

  function toggleDoor(side) {
    if (!canAct()) return;
    if (side === 'left') state.leftDoor = !state.leftDoor;
    else state.rightDoor = !state.rightDoor;
    Sfx.door();
    updateOfficeVisuals();
    updateHUD();
  }

  function toggleLight(side) {
    if (!canAct()) return;
    if (side === 'left') state.leftLight = !state.leftLight;
    else state.rightLight = !state.rightLight;

    Sfx.light();

    const atDoor = side === 'left'
      ? state.bots.bunny.pos === 'leftdoor'
      : state.bots.chicken.pos === 'rightdoor';
    const on = side === 'left' ? state.leftLight : state.rightLight;

    if (atDoor && on) {
      Sfx.tone({ freq: 96, dur: 0.55, type: 'sine', gain: 0.08, slide: -18 });
    }

    updateOfficeVisuals();
    updateHUD();
  }

  function toggleVent(side) {
    if (!canAct() || state.ai.bear <= 0) return;
    if (side === 'left') state.ventLeftClosed = !state.ventLeftClosed;
    else state.ventRightClosed = !state.ventRightClosed;
    Sfx.vent();
    updateOfficeVisuals();
    updateHUD();
  }

  /* ---------------- IA ---------------- */
  function aiStep(type) {
    if (!state || !state.running || state.powerOut || state.paused) return;
    if (!roll(state.ai[type])) return;

    const bot = state.bots[type];

    if (type === 'bunny') {
      if (bot.pos === 'stage') bot.pos = 'dining';
      else if (bot.pos === 'dining') bot.pos = 'westhall';
      else if (bot.pos === 'westhall') {
        if (state.leftDoor) {
          bot.pos = 'dining';
          Sfx.thump();
        } else {
          bot.pos = 'leftdoor';
          Sfx.thump();
        }
      } else if (bot.pos === 'leftdoor') {
        if (state.leftDoor) {
          bot.pos = 'dining';
          Sfx.thump();
        } else {
          triggerScare('bunny');
          return;
        }
      }
    } else if (type === 'chicken') {
      if (bot.pos === 'stage') bot.pos = 'dining';
      else if (bot.pos === 'dining') bot.pos = 'easthall';
      else if (bot.pos === 'easthall') {
        if (state.rightDoor) {
          bot.pos = 'dining';
          Sfx.thump();
        } else {
          bot.pos = 'rightdoor';
          Sfx.thump();
        }
      } else if (bot.pos === 'rightdoor') {
        if (state.rightDoor) {
          bot.pos = 'dining';
          Sfx.thump();
        } else {
          triggerScare('chicken');
          return;
        }
      }
    } else if (type === 'bear') {
      if (bot.pos === 'stage') {
        bot.pos = 'dining';
        Sfx.bearMove();
      } else if (bot.pos === 'dining') {
        bot.pos = 'officehall';
        Sfx.bearMove();
      } else if (bot.pos === 'officehall') {
        bot.pos = Math.random() < 0.5 ? 'ventLeft' : 'ventRight';
        state.bearVentTimer = 7;
        state.bearStare = 0;
        Sfx.bearMove();
      }
    }

    if (state && state.running && Math.random() < 0.42) Sfx.step();
  }

  function tickAI() {
    if (!state || !state.running) return;
    aiStep('bunny');
    if (!state || !state.running) return;
    aiStep('chicken');
    if (!state || !state.running) return;
    aiStep('bear');
  }

  function foxyCooldown(level) {
    return clamp(27 - level * 1.05, 4.5, 27);
  }

  function resetFoxy() {
    state.bots.foxy.stage = 0;
    state.foxyTimer = 0;
    state.foxyRun = 0;
  }

  function updateFoxy(dt) {
    if (!state || state.ai.foxy <= 0 || state.powerOut) return;

    if (state.foxyRun > 0) {
      if (state.camsOpen) {
        resetFoxy();
        Sfx.foxyMove();
        return;
      }
      state.foxyRun -= dt;
      if (state.foxyRun <= 0) {
        state.foxyRun = 0;
        if (state.leftDoor) {
          resetFoxy();
          Sfx.thump();
        } else {
          triggerScare('foxy');
        }
      }
      return;
    }

    if (state.camsOpen) {
      if (state.cam === 'closet' || (state.cam === 'westhall' && state.bots.foxy.stage === 2)) {
        state.foxyTimer = 0;
      } else {
        state.foxyTimer += dt * 0.28;
      }
    } else {
      state.foxyTimer += dt;
    }

    const limit = foxyCooldown(state.ai.foxy);
    if (state.foxyTimer >= limit) {
      state.foxyTimer = 0;
      if (state.bots.foxy.stage < 3) {
        state.bots.foxy.stage++;
        if (state.bots.foxy.stage === 3) {
          Sfx.run();
          state.foxyRun = 2.2;
        } else {
          Sfx.foxyMove();
        }
      }
    }
  }

  function updateBear(dt) {
    if (!state || state.ai.bear <= 0 || state.powerOut) return;
    const bot = state.bots.bear;

    if (bot.pos === 'officehall') {
      if (state.camsOpen && state.cam === 'officehall') {
        state.bearStare += dt;
        if (state.bearStare > 1.65) {
          bot.pos = 'dining';
          state.bearStare = 0;
          Sfx.bearRetreat();
        }
      } else {
        state.bearStare = Math.max(0, state.bearStare - dt * 0.7);
      }
    }

    if (bot.pos === 'ventLeft' || bot.pos === 'ventRight') {
      const closed = bot.pos === 'ventLeft' ? state.ventLeftClosed : state.ventRightClosed;
      state.bearVentTimer -= dt * (closed ? 2 : 1);
      if (state.bearVentTimer <= 0) {
        state.bearVentTimer = 0;
        if (closed) {
          bot.pos = 'dining';
          state.bearStare = 0;
          Sfx.bearRetreat();
        } else {
          triggerScare('bear');
        }
      }
    }
  }

  /* ---------------- fluxo da noite ---------------- */
  function showScreen(name) {
    $$('.screen').forEach((screen) => {
      screen.classList.toggle('active', screen.id === name);
    });
  }

  function clearGameClasses() {
    el.game.classList.remove('cams-open', 'bear-near', 'shake-1', 'shake-2');
    el.scene.style.transform = 'translateX(0)';
  }

  function startGame(night, options = {}) {
    Sfx.init();
    Sfx.resume();
    clearTimers();
    cancelAnimationFrame(raf);

    const mode = night ? 'night' : 'custom';
    const ai = normalizeAI(night ? AI_LEVELS[night] : (options.ai || customAI));
    const totalAI = ai.bunny + ai.chicken + ai.foxy + ai.bear;
    const powerMult = mode === 'night'
      ? (night === 6 ? 1.15 : 1)
      : 1 + totalAI / 180;

    lastConfig = { night: night || 0, mode, ai: { ...ai } };

    el.gameover.classList.add('hidden');
    el.win.classList.add('hidden');
    el.pause.classList.add('hidden');
    el.dark.classList.remove('on');
    el.scare.classList.remove('active');
    el.scareFace.innerHTML = '';
    el.flash.classList.remove('go');
    el.camview.classList.add('hidden');
    el.nightIntro.classList.add('hidden');
    el.nightIntro.classList.remove('go');
    el.leftSil.innerHTML = '';
    el.rightSil.innerHTML = '';
    el.leftSil.dataset.type = '';
    el.rightSil.dataset.type = '';
    el.leftSil.classList.remove('show');
    el.rightSil.classList.remove('show');
    clearGameClasses();

    state = {
      night: night || 0,
      mode,
      ai,
      powerMult,
      running: false,
      intro: true,
      paused: false,
      scare: false,
      over: false,
      won: false,
      powerOut: false,
      powerOutTimer: 0,
      time: 0,
      power: 100,
      lastTs: 0,
      camsOpen: false,
      cam: 'stage',
      leftDoor: false,
      rightDoor: false,
      leftLight: false,
      rightLight: false,
      ventLeftClosed: false,
      ventRightClosed: false,
      aiClock: 0,
      foxyTimer: 0,
      foxyRun: 0,
      bearStare: 0,
      bearVentTimer: 0,
      bots: {
        bunny: { pos: 'stage' },
        chicken: { pos: 'stage' },
        foxy: { stage: 0 },
        bear: { pos: 'stage' },
      },
    };

    el.hudNight.textContent = mode === 'night' ? 'Noite ' + night : 'Personalizada';
    el.introNight.textContent = mode === 'night' ? 'Noite ' + night : 'Noite Personalizada';

    updateHUD();
    updateOfficeVisuals();
    updateCamLabel();
    updateMapState();
    showScreen('game');

    el.nightIntro.classList.remove('hidden');
    void el.nightIntro.offsetWidth;
    el.nightIntro.classList.add('go');

    Sfx.startAmbient();

    later(() => {
      if (!state || state.scare || state.over) return;
      el.nightIntro.classList.add('hidden');
      el.nightIntro.classList.remove('go');
      state.intro = false;
      state.running = true;
      state.lastTs = performance.now();
      raf = requestAnimationFrame(loop);
    }, 2280);
  }

  function goMenu() {
    clearTimers();
    cancelAnimationFrame(raf);
    Sfx.stopAmbient();
    Sfx.setStatic(false);
    Sfx.resume();
    state = null;

    el.scare.classList.remove('active');
    el.scareFace.innerHTML = '';
    el.flash.classList.remove('go');
    el.dark.classList.remove('on');
    el.camview.classList.add('hidden');
    el.nightIntro.classList.add('hidden');
    el.nightIntro.classList.remove('go');
    el.gameover.classList.add('hidden');
    el.win.classList.add('hidden');
    el.pause.classList.add('hidden');
    el.settings.classList.add('hidden');
    el.credits.classList.add('hidden');
    el.leftSil.innerHTML = '';
    el.rightSil.innerHTML = '';
    el.leftSil.dataset.type = '';
    el.rightSil.dataset.type = '';
    el.leftSil.classList.remove('show');
    el.rightSil.classList.remove('show');
    clearGameClasses();

    showScreen('menu');
    renderMenu();
  }

  function startPowerOut() {
    if (!state || state.powerOut) return;
    const s = state;
    s.powerOut = true;
    s.power = 0;
    s.leftDoor = false;
    s.rightDoor = false;
    s.leftLight = false;
    s.rightLight = false;
    s.ventLeftClosed = false;
    s.ventRightClosed = false;
    s.foxyRun = 0;
    s.bots.foxy.stage = 0;
    s.powerOutTimer = rnd(6.5, 12);

    closeCams(true);
    el.dark.classList.add('on');
    updateOfficeVisuals();
    updateHUD();

    Sfx.stopAmbient();
    Sfx.powerDown();

    later(() => {
      if (state && state.powerOut && !state.scare && !state.paused) Sfx.musicBox();
    }, 900);
  }

  function triggerScare(type) {
    if (!state || state.scare) return;
    const s = state;
    s.scare = true;
    s.running = false;
    s.paused = false;
    clearTimers();

    closeCams(true);
    Sfx.stopAmbient();
    Sfx.setStatic(false);
    Sfx.scream();

    el.dark.classList.remove('on');
    el.pause.classList.add('hidden');
    el.nightIntro.classList.add('hidden');
    el.scareFace.innerHTML = '<img src="' + imagePath(type) + '" alt="">';
    el.scare.classList.add('active');

    el.flash.classList.remove('go');
    void el.flash.offsetWidth;
    el.flash.classList.add('go');

    el.game.classList.remove('shake-1', 'shake-2');
    void el.game.offsetWidth;
    el.game.classList.add('shake-2');

    later(() => {
      el.scare.classList.remove('active');
      el.scareFace.innerHTML = '';
      el.flash.classList.remove('go');
      el.game.classList.remove('shake-1', 'shake-2');
      showGameOver(type);
    }, 1800);
  }

  function showGameOver(type) {
    if (!state) return;
    state.over = true;
    const reached = timeLabel(state.time);
    const modeName = state.mode === 'night' ? 'Noite ' + state.night : 'Noite Personalizada';
    el.gameoverMsg.textContent = (SCARE_TEXT[type] || 'Algo te pegou.') +
      ' Você chegou a ' + reached + ' da ' + modeName + '.';
    el.gameover.classList.remove('hidden');
    Sfx.setStatic(false);
  }

  function winNight() {
    if (!state || state.scare || state.over) return;
    const s = state;
    s.running = false;
    s.won = true;
    clearTimers();
    Sfx.stopAmbient();
    Sfx.setStatic(false);
    Sfx.winChime();

    closeCams(true);
    el.dark.classList.remove('on');
    el.pause.classList.add('hidden');
    el.nightIntro.classList.add('hidden');
    el.winTitle.textContent = '6 AM';

    if (s.mode === 'night') {
      if (s.night < NIGHTS) {
        if (unlocked < s.night + 1) {
          unlocked = s.night + 1;
          saveProgress();
        }
        el.nextBtn.classList.remove('hidden');
        el.nextBtn.dataset.night = String(s.night + 1);
        el.winMsg.textContent = 'Noite ' + s.night + ' concluída com ' + Math.round(s.power) +
          '% de energia. A Noite ' + (s.night + 1) + ' foi desbloqueada.';
      } else {
        el.nextBtn.classList.add('hidden');
        unlocked = NIGHTS;
        saveProgress();
        el.winMsg.textContent = 'Você sobreviveu à Noite 6 com ' + Math.round(s.power) +
          '% de energia. O turno da madrugada acabou... por enquanto.';
      }
    } else {
      el.nextBtn.classList.add('hidden');
      el.winMsg.textContent = 'Noite Personalizada concluída com ' + Math.round(s.power) +
        '% de energia. Você escolheu a própria dificuldade e sobreviveu.';
    }

    renderMenu();
    el.win.classList.remove('hidden');
  }

  /* ---------------- atualização ---------------- */
  function update(dt, ts) {
    const s = state;
    if (!s || !s.running || s.paused) return;

    s.time += dt;
    if (s.time >= HOUR_SECONDS * 6) {
      winNight();
      return;
    }

    if (!s.powerOut) {
      const usage = currentUsage();
      s.power = Math.max(0, s.power - DRAIN[usage] * s.powerMult * dt);
      if (s.power <= 0) startPowerOut();
    }

    if (!s.powerOut) {
      s.aiClock += dt;
      let guard = 0;
      while (s.aiClock >= AI_TICK && guard < 4) {
        s.aiClock -= AI_TICK;
        guard++;
        tickAI();
        if (!state || !state.running) return;
      }

      updateFoxy(dt);
      if (!state || !state.running) return;

      updateBear(dt);
      if (!state || !state.running) return;
    } else {
      s.powerOutTimer -= dt;
      if (s.powerOutTimer <= 0) {
        triggerScare('bear');
        return;
      }
    }

    updateHUD();
    updateOfficeVisuals();
    drawCamera(ts);
  }

  function loop(ts) {
    if (!state || !state.running) return;
    if (!state.lastTs) state.lastTs = ts;

    let dt = (ts - state.lastTs) / 1000;
    state.lastTs = ts;
    dt = clamp(dt, 0, 0.1);

    if (!state.paused) update(dt, ts);
    if (state && state.running) raf = requestAnimationFrame(loop);
  }

  /* ---------------- pausa ---------------- */
  function openPause() {
    if (!state || !state.running || state.paused || state.intro || state.scare) return;
    state.paused = true;
    el.pause.classList.remove('hidden');
    Sfx.suspend();
  }

  function closePause() {
    if (!state || !state.paused) return;
    el.pause.classList.add('hidden');
    state.paused = false;
    state.lastTs = performance.now();
    Sfx.resume();
  }

  function restartNight() {
    if (!lastConfig) return;
    el.pause.classList.add('hidden');
    const config = lastConfig;
    if (config.night > 0) startGame(config.night);
    else startGame(0, { ai: config.ai });
  }

  /* ---------------- menu / progresso ---------------- */
  function loadProgress() {
    try {
      const value = parseInt(localStorage.getItem('fnaf_senai_unlocked') || '1', 10);
      unlocked = clamp(isNaN(value) ? 1 : value, 1, NIGHTS);
    } catch (e) {
      unlocked = 1;
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem('fnaf_senai_unlocked', String(unlocked));
    } catch (e) { /* ignore */ }
  }

  function renderMenu() {
    el.nights.innerHTML = '';
    for (let n = 1; n <= NIGHTS; n++) {
      const button = document.createElement('button');
      button.type = 'button';
      const locked = n > unlocked;
      button.className = 'night-btn night-' + n + (locked ? ' locked' : '');
      button.innerHTML = '<span class="n">Noite ' + n + '</span>' +
        '<span class="d">' + (locked ? 'Bloqueada' : DIFF_LABEL[n]) + '</span>';
      if (locked) {
        button.disabled = true;
        button.setAttribute('aria-disabled', 'true');
      } else {
        button.addEventListener('click', () => startGame(n));
      }
      el.nights.appendChild(button);
    }
  }

  function buildUsageBars() {
    el.usage.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      el.usage.appendChild(document.createElement('i'));
    }
  }

  function buildMap() {
    el.camMap.innerHTML = '';
    CAMERAS.forEach((cam) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cam-btn';
      button.dataset.cam = cam.id;
      button.style.left = cam.x + '%';
      button.style.top = cam.y + '%';
      button.style.width = cam.w + '%';
      button.style.height = cam.h + '%';
      button.innerHTML = '<span class="code">' + cam.code + '</span>' + cam.name;
      button.addEventListener('click', () => selectCam(cam.id));
      el.camMap.appendChild(button);
    });
  }

  /* ---------------- noite personalizada ---------------- */
  function loadCustom() {
    try {
      const raw = localStorage.getItem('fnaf_senai_custom');
      if (!raw) return;
      customAI = normalizeAI(JSON.parse(raw));
    } catch (e) {
      customAI = { ...PRESETS.normal };
    }
  }

  function saveCustom() {
    try {
      localStorage.setItem('fnaf_senai_custom', JSON.stringify(customAI));
    } catch (e) { /* ignore */ }
  }

  function syncCustomUI() {
    el.aiBunny.value = String(customAI.bunny);
    el.aiChicken.value = String(customAI.chicken);
    el.aiFoxy.value = String(customAI.foxy);
    el.aiBear.value = String(customAI.bear);
    el.aiBunnyVal.textContent = String(customAI.bunny);
    el.aiChickenVal.textContent = String(customAI.chicken);
    el.aiFoxyVal.textContent = String(customAI.foxy);
    el.aiBearVal.textContent = String(customAI.bear);
    const total = customAI.bunny + customAI.chicken + customAI.foxy + customAI.bear;
    el.customTotal.textContent = 'Dificuldade total: ' + total + '/80';
  }

  function readCustomUI() {
    customAI = normalizeAI({
      bunny: el.aiBunny.value,
      chicken: el.aiChicken.value,
      foxy: el.aiFoxy.value,
      bear: el.aiBear.value,
    });
    syncCustomUI();
    saveCustom();
    return { ...customAI };
  }

  function setCustom(ai) {
    customAI = normalizeAI(ai);
    syncCustomUI();
    saveCustom();
  }

  /* ---------------- configurações / créditos ---------------- */
  function openSettings() {
    el.settings.classList.remove('hidden');
  }

  function closeSettings() {
    el.settings.classList.add('hidden');
  }

  function openCredits() {
    el.credits.classList.remove('hidden');
  }

  function closeCredits() {
    el.credits.classList.add('hidden');
  }

  function bindSettings() {
    el.setVolume.addEventListener('input', () => {
      settings.volume = clamp(Number(el.setVolume.value) || 0, 0, 100);
      el.setVolumeVal.textContent = settings.volume + '%';
      applySettings();
      saveSettings();
    });

    el.setMute.addEventListener('change', () => {
      settings.mute = el.setMute.checked;
      applySettings();
      saveSettings();
    });

    el.setShake.addEventListener('change', () => {
      settings.shake = el.setShake.checked;
      applySettings();
      saveSettings();
    });

    el.setGrain.addEventListener('change', () => {
      settings.grain = el.setGrain.checked;
      applySettings();
      saveSettings();
    });

    el.setFlash.addEventListener('change', () => {
      settings.flash = el.setFlash.checked;
      applySettings();
      saveSettings();
    });
  }

  /* ---------------- entrada ---------------- */
  function bindInput() {
    el.btnDoorL.addEventListener('click', () => toggleDoor('left'));
    el.btnDoorR.addEventListener('click', () => toggleDoor('right'));
    el.btnLightL.addEventListener('click', () => toggleLight('left'));
    el.btnLightR.addEventListener('click', () => toggleLight('right'));
    el.btnVentL.addEventListener('click', () => toggleVent('left'));
    el.btnVentR.addEventListener('click', () => toggleVent('right'));
    el.camTab.addEventListener('click', toggleCams);
    el.camClose.addEventListener('click', () => closeCams(false));
    el.pauseBtn.addEventListener('click', openPause);
    el.pauseResume.addEventListener('click', closePause);
    el.pauseRestart.addEventListener('click', restartNight);
    el.pauseMenu.addEventListener('click', goMenu);
    el.pauseSettings.addEventListener('click', openSettings);

    el.retry.addEventListener('click', restartNight);
    el.menuBtn.addEventListener('click', goMenu);
    el.winMenuBtn.addEventListener('click', goMenu);
    el.nextBtn.addEventListener('click', () => {
      const next = parseInt(el.nextBtn.dataset.night || '1', 10);
      startGame(clamp(next, 1, NIGHTS));
    });

    el.howtoBtn.addEventListener('click', () => {
      el.howto.classList.toggle('hidden');
    });

    el.customBtn.addEventListener('click', () => {
      syncCustomUI();
      showScreen('custom');
    });

    el.customBack.addEventListener('click', () => {
      showScreen('menu');
    });

    el.customStart.addEventListener('click', () => {
      const ai = readCustomUI();
      startGame(0, { ai });
    });

    [el.aiBunny, el.aiChicken, el.aiFoxy, el.aiBear].forEach((slider) => {
      slider.addEventListener('input', readCustomUI);
    });

    $$('.preset', el.custom).forEach((button) => {
      button.addEventListener('click', () => {
        const preset = PRESETS[button.dataset.preset];
        if (preset) setCustom(preset);
      });
    });

    el.settingsBtn.addEventListener('click', openSettings);
    el.settingsClose.addEventListener('click', closeSettings);
    el.creditsBtn.addEventListener('click', openCredits);
    el.creditsClose.addEventListener('click', closeCredits);

    document.addEventListener('mousemove', (event) => {
      mouseX = event.clientX / Math.max(1, window.innerWidth);
      applyParallax();
    });

    window.addEventListener('resize', () => {
      if (state && state.camsOpen) resizeCamCanvas();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state && state.running && !state.paused && !state.intro) {
        openPause();
      }
    });

    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;

      if (event.code === 'Escape') {
        if (!el.settings.classList.contains('hidden')) {
          closeSettings();
        } else if (!el.credits.classList.contains('hidden')) {
          closeCredits();
        } else if (state && state.paused) {
          closePause();
        } else if (state && state.camsOpen) {
          closeCams(false);
        } else if (state && state.running && !state.intro) {
          openPause();
        } else if (state && (state.over || state.won)) {
          goMenu();
        }
        return;
      }

      if (event.code === 'KeyM') {
        settings.mute = !settings.mute;
        applySettings();
        saveSettings();
        return;
      }

      if (event.code === 'KeyP') {
        if (state && state.running && !state.intro && !state.scare) {
          if (state.paused) closePause();
          else openPause();
        }
        event.preventDefault();
        return;
      }

      if (!state || !state.running || state.paused || state.intro || state.scare) return;

      switch (event.code) {
        case 'Space':
        case 'KeyC':
          event.preventDefault();
          toggleCams();
          break;
        case 'KeyA':
          event.preventDefault();
          toggleDoor('left');
          break;
        case 'KeyD':
          event.preventDefault();
          toggleDoor('right');
          break;
        case 'KeyQ':
          event.preventDefault();
          toggleLight('left');
          break;
        case 'KeyE':
          event.preventDefault();
          toggleLight('right');
          break;
        case 'KeyZ':
          event.preventDefault();
          toggleVent('left');
          break;
        case 'KeyX':
          event.preventDefault();
          toggleVent('right');
          break;
        default:
          break;
      }
    });
  }

  /* ---------------- inicialização ---------------- */
  function finishLoading() {
    el.loadFill.style.width = '100%';
    el.loadText.textContent = 'Pronto. Escolha uma noite.';
    window.setTimeout(() => {
      el.loading.classList.add('hidden');
    }, 420);
  }

  function init() {
    buildNoiseFrames();
    buildUsageBars();
    buildMap();
    loadProgress();
    loadCustom();
    loadSettings();
    applySettings();
    renderMenu();
    syncCustomUI();
    bindSettings();
    bindInput();

    if (window.GameAssets && typeof window.GameAssets.load === 'function') {
      window.GameAssets.load((progress) => {
        const percent = Math.round(clamp(progress, 0, 1) * 100);
        el.loadFill.style.width = percent + '%';
        el.loadText.textContent = 'Carregando imagens... ' + percent + '%';
      }).then(finishLoading).catch(finishLoading);
    } else {
      finishLoading();
    }
  }

  init();
})();
