/* Racket's Garage — audio.js
 * Everything is synthesized with WebAudio: ambience, a gentle generative score, and sound effects.
 * Nothing plays until the player's first tap (browser autoplay rules).
 */
const Sound = (() => {
  let ctx = null, master, sfxG, ambG, musG, noiseBuf;
  const prefs = { sound: true, music: true, station: 0 };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem('rg-prefs') || '{}')); } catch (e) { /* storage blocked */ }
  const savePrefs = () => { try { localStorage.setItem('rg-prefs', JSON.stringify(prefs)); } catch (e) { /* ignore */ } };

  let amb = null, ambKind = null, musicOn = false, sched = null, nextT = 0, beat = 0;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = .8; master.connect(ctx.destination);
    sfxG = gain(.7); ambG = gain(.55); musG = gain(.0);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d[i] = last * 3.5; } // brown-ish noise
    if (ambKind) setAmbience(ambKind, true);
    if (prefs.music) startMusic();
  }
  function gain(v, dest = master) { const g = ctx.createGain(); g.gain.value = v; g.connect(dest); return g; }
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function tone(freq, { type = 'sine', t = 0, a = .005, d = .15, v = .3, dest = sfxG, slide = null } = {}) {
    if (!ctx) return;
    const now = ctx.currentTime + t;
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, now);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, now + a + d);
    const g = ctx.createGain();
    g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(v, now + a); g.gain.exponentialRampToValueAtTime(.0001, now + a + d);
    o.connect(g); g.connect(dest); o.start(now); o.stop(now + a + d + .05);
  }
  function noise({ t = 0, a = .005, d = .2, v = .3, f = 1000, q = 1, type = 'bandpass', dest = sfxG, sweep = null } = {}) {
    if (!ctx) return;
    const now = ctx.currentTime + t;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, now); fl.Q.value = q;
    if (sweep) fl.frequency.exponentialRampToValueAtTime(sweep, now + a + d);
    const g = ctx.createGain();
    g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(v, now + a); g.gain.exponentialRampToValueAtTime(.0001, now + a + d);
    src.connect(fl); fl.connect(g); g.connect(dest);
    src.start(now, Math.random()); src.stop(now + a + d + .05);
  }

  const SFX = {
    click: () => tone(760, { d: .05, v: .1, slide: 540 }),
    pickup: () => [660, 880, 1320].forEach((f, i) => tone(f, { type: 'triangle', t: i * .07, d: .14, v: .16 })),
    error: () => tone(150, { type: 'square', d: .18, v: .06, slide: 105 }),
    clank: () => { noise({ f: 2400, q: 4, d: .22, v: .6 }); tone(260, { type: 'triangle', d: .35, v: .22, slide: 120 }); },
    zap: () => { tone(1500, { type: 'sawtooth', d: .25, v: .06, slide: 160 }); noise({ f: 5000, type: 'highpass', d: .16, v: .25 }); },
    coin: () => { tone(988, { type: 'square', d: .07, v: .05 }); tone(1319, { type: 'square', t: .08, d: .24, v: .05 }); },
    success: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, { type: 'triangle', t: i * .09, d: .6, v: .14 })),
    whoosh: () => noise({ f: 300, sweep: 1800, q: .8, a: .12, d: .45, v: .35 }),
    blipR: () => tone(140 + Math.random() * 45, { type: 'square', d: .035, v: .03 }),
    blipC: () => tone(470 + Math.random() * 90, { type: 'triangle', d: .035, v: .055 }),
    blipN: () => tone(320, { type: 'sine', d: .03, v: .025 }),
    blipV: () => tone(300 + Math.random() * 70, { type: 'sawtooth', d: .03, v: .025 }),
    rummage: () => { for (let i = 0; i < 4; i++) noise({ t: i * .09, f: 900 + Math.random() * 2000, q: 3, d: .07, v: .35 }); tone(180, { type: 'triangle', t: .3, d: .2, v: .12, slide: 120 }); },
    torch: () => { noise({ f: 3000, type: 'highpass', a: .05, d: .6, v: .3 }); noise({ f: 700, q: 1, a: .05, d: .6, v: .2 }); },
    crane: () => { tone(70, { type: 'sawtooth', a: .3, d: 2.3, v: .06, slide: 110 }); noise({ f: 400, q: 2, a: .3, d: 2.3, v: .15 }); },
    roar: () => {
      if (!ctx) return;
      noise({ f: 180, q: .7, a: .15, d: 3.2, v: .9, sweep: 420 });
      noise({ f: 1400, q: .6, a: .2, d: 2.8, v: .35 });
      tone(48, { type: 'sawtooth', a: .15, d: 3, v: .12, slide: 70 });
    },
    step: () => noise({ f: 420, q: 1.2, d: .05, v: .07 }),
    spark: () => noise({ f: 6500, q: 3, d: .05, v: .18 }),
    sparkle: () => [1568, 2093, 2637].forEach((f, i) => tone(f, { t: i * .05, d: .2, v: .05 })),
    hum: (dur = 3) => {
      if (!ctx) return;
      const now = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(60, now); o.frequency.exponentialRampToValueAtTime(420, now + dur);
      const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(300, now); fl.frequency.exponentialRampToValueAtTime(2400, now + dur);
      const g = ctx.createGain(); g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(.09, now + .3); g.gain.setValueAtTime(.09, now + dur - .1); g.gain.exponentialRampToValueAtTime(.0001, now + dur + .2);
      o.connect(fl); fl.connect(g); g.connect(sfxG); o.start(now); o.stop(now + dur + .3);
    },
    drone: () => { tone(220, { type: 'sawtooth', d: .8, v: .03, slide: 260 }); noise({ f: 900, q: 4, d: .8, v: .08 }); },
  };
  function sfx(name, ...args) { if (!ctx || !prefs.sound) return; if (ctx.state === 'suspended') ctx.resume(); SFX[name]?.(...args); }

  // ---------- ambience ----------
  function setAmbience(kind, force) {
    if (kind === ambKind && !force && amb) return;
    ambKind = kind;
    stopAmb();
    if (!ctx || !prefs.sound) return;
    const a = { nodes: [], alive: true };
    amb = a;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const fl = ctx.createBiquadFilter(); const g = ctx.createGain();
    src.connect(fl); fl.connect(g); g.connect(ambG);
    g.gain.setValueAtTime(.0001, ctx.currentTime);
    if (kind === 'garage') {
      fl.type = 'lowpass'; fl.frequency.value = 260;
      g.gain.exponentialRampToValueAtTime(.18, ctx.currentTime + .6);
      const o = ctx.createOscillator(); o.frequency.value = 58; const og = ctx.createGain(); og.gain.value = .018;
      o.connect(og); og.connect(ambG); o.start(); a.nodes.push(o);
    } else if (kind === 'junk') {
      fl.type = 'bandpass'; fl.frequency.value = 340; fl.Q.value = .7;
      g.gain.exponentialRampToValueAtTime(.3, ctx.currentTime + .6);
      const o = ctx.createOscillator(); o.frequency.value = 120; const og = ctx.createGain(); og.gain.value = .006;
      o.connect(og); og.connect(ambG); o.start(); a.nodes.push(o);
      const clang = () => { if (!a.alive) return; noise({ f: 1800 + Math.random() * 1500, q: 8, d: .3, v: .05, dest: ambG }); setTimeout(clang, 5000 + Math.random() * 8000); };
      setTimeout(clang, 3000);
    } else {
      fl.type = 'bandpass'; fl.frequency.value = 520; fl.Q.value = .5;
      g.gain.exponentialRampToValueAtTime(.32, ctx.currentTime + .6);
      const lfo = ctx.createOscillator(); lfo.frequency.value = .07; const lg = ctx.createGain(); lg.gain.value = 260;
      lfo.connect(lg); lg.connect(fl.frequency); lfo.start(); a.nodes.push(lfo);
    }
    src.start(); a.nodes.push(src);
    // crickets (both scenes) and alien birds (outdoors)
    const cricket = () => {
      if (!a.alive) return;
      const n = 2 + (Math.random() * 3 | 0), f = 4000 + Math.random() * 600, v = kind === 'garage' ? .012 : .02;
      for (let i = 0; i < n; i++) tone(f, { t: i * .07, d: .04, v, dest: ambG });
      setTimeout(cricket, 900 + Math.random() * 2600);
    };
    const bird = () => {
      if (!a.alive) return;
      const b = 1400 + Math.random() * 900;
      tone(b, { type: 'sine', d: .18, v: .03, slide: b * 1.6, dest: ambG });
      tone(b * 1.5, { type: 'sine', t: .22, d: .22, v: .025, slide: b * .9, dest: ambG });
      setTimeout(bird, 4000 + Math.random() * 7000);
    };
    setTimeout(cricket, 600);
    if (kind === 'forest') setTimeout(bird, 2500);
  }
  function stopAmb() {
    if (!amb) return;
    amb.alive = false;
    amb.nodes.forEach((n) => { try { n.stop(); } catch (e) { /* already stopped */ } });
    amb = null;
  }

  // ---------- music ----------
  const STATIONS = [
    { name: 'Moonlight Lo-fi', bpm: 66, per: 8, chords: [[57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 59, 64], [55, 59, 62, 66]], scale: [69, 72, 74, 76, 79, 81] },
    { name: 'Banjo Bop FM', bpm: 108, per: 4, pluck: true, chords: [[55, 59, 62], [60, 64, 67], [62, 66, 69], [55, 59, 62]], scale: [67, 69, 71, 74, 76, 79] },
  ];
  function pad(ch, t, dur) {
    ch.forEach((m) => {
      [0, 5].forEach((det) => {
        const o = ctx.createOscillator(); o.type = det ? 'triangle' : 'sine'; o.frequency.value = mtof(m); o.detune.value = det;
        const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 1100;
        const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.022, t + 1.4);
        g.gain.setValueAtTime(.022, t + dur - .6); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .8);
        o.connect(fl); fl.connect(g); g.connect(musG); o.start(t); o.stop(t + dur + 1);
      });
    });
  }
  function pluck(m, t, d, v, type = 'triangle') {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = mtof(m);
    const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(musG); o.start(t); o.stop(t + d + .05);
  }
  function playBeat(st, b, t, spb) {
    const inBar = b % st.per, ch = st.chords[Math.floor(b / st.per) % st.chords.length];
    if (st.pluck) {
      [0, .5].forEach((off, k) => pluck(ch[(inBar * 2 + k) % ch.length] + 12, t + off * spb, .3, .05));
      if (inBar % 2 === 0) pluck(ch[0] - 12, t, .4, .09, 'sine');
      if (Math.random() < .25) pluck(st.scale[Math.random() * st.scale.length | 0] + 12, t + spb * .25, .2, .03, 'square');
    } else {
      if (inBar === 0) pad(ch, t, spb * st.per);
      if (inBar === 0 || inBar === 4) pluck(ch[0] - 12, t, spb * 3, .07, 'sine');
      if (Math.random() < .42) pluck(st.scale[Math.random() * st.scale.length | 0], t + (Math.random() < .5 ? 0 : spb / 2), 1.6, .045);
    }
  }
  function tick() {
    if (!ctx || !musicOn) return;
    const st = STATIONS[prefs.station % STATIONS.length], spb = 60 / st.bpm;
    while (nextT < ctx.currentTime + .4) { playBeat(st, beat, nextT, spb); nextT += spb; beat++; }
  }
  function startMusic() {
    if (!ctx || musicOn) return;
    musicOn = true; nextT = ctx.currentTime + .15; beat = 0;
    musG.gain.cancelScheduledValues(ctx.currentTime); musG.gain.setValueAtTime(.0001, ctx.currentTime); musG.gain.exponentialRampToValueAtTime(.38, ctx.currentTime + 1);
    sched = setInterval(tick, 90);
  }
  function stopMusic() {
    musicOn = false; clearInterval(sched);
    if (ctx) { musG.gain.cancelScheduledValues(ctx.currentTime); musG.gain.setValueAtTime(musG.gain.value || .0001, ctx.currentTime); musG.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .6); }
  }

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });

  return {
    init, sfx, setAmbience, prefs,
    stations: STATIONS,
    toggleSound(on = !prefs.sound) { prefs.sound = on; savePrefs(); if (on) setAmbience(ambKind, true); else stopAmb(); return on; },
    toggleMusic(on = !prefs.music) { prefs.music = on; savePrefs(); if (on) startMusic(); else stopMusic(); return on; },
    setStation(i) { prefs.station = i; savePrefs(); if (musicOn) { stopMusic(); setTimeout(() => { prefs.music = true; startMusic(); }, 650); } else { prefs.music = true; startMusic(); } },
  };
})();
