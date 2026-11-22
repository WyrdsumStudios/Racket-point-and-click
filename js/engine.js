/* Racket's Garage — engine.js
 * State, scenes, hotspots, walking, dialogue, inventory, modals, saving.
 */
(() => {
  const SAVE_KEY = 'rackets-garage-save-v1';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  const fresh = () => ({
    v: 1, scene: 'crash', inv: ['datapad'], flags: {}, friend: 0, credits: 0,
    parts: { casing: false, crystal: false, wiring: false }, repairs: { fuel: false },
    jobs: { radio: 'hidden', bolts: 'hidden', scrap: 'hidden' }, sold: [], talked: {},
    pos: { crash: 560, garage: 820 }, station: 0,
  });
  let S = fresh();
  let sel = null;            // selected inventory item
  let busy = false;          // walking / cutscene lock
  let lastInput = Date.now(), lastIdle = Date.now();
  let saveTimer = null;

  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }, 250);
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      const f = fresh();
      return { ...f, ...d, flags: { ...d.flags }, parts: { ...f.parts, ...d.parts }, repairs: { ...f.repairs, ...d.repairs }, jobs: { ...f.jobs, ...d.jobs }, pos: { ...f.pos, ...d.pos }, talked: { ...d.talked } };
    } catch (e) { return null; }
  }

  // ---------------------------------------------------------------------------
  // GAME API (used by data.js dialogue functions)
  // ---------------------------------------------------------------------------
  const TIER_NAMES = ['Unimpressed', 'Grudgingly tolerable', 'Growing on him', "Fond (he'd deny it)", 'Family'];
  const G = {
    get S() { return S; },
    tmp: {},
    has: (id) => S.inv.includes(id),
    give(id, quiet) {
      if (!S.inv.includes(id)) S.inv.push(id);
      if (!quiet) Sound.sfx('pickup');
      renderTray(id); save();
    },
    take(id) { S.inv = S.inv.filter((i) => i !== id); if (sel === id) setSel(null); renderTray(); save(); },
    friend(n) {
      S.friend = clamp(S.friend + n, 0, 100);
      if (n >= 3 && S.scene === 'garage' && S.flags.metRacket) warmPuff();
      save();
    },
    tier() { const f = S.friend; return f < 15 ? 0 : f < 35 ? 1 : f < 60 ? 2 : f < 85 ? 3 : 4; },
    rMood() { return ['grump', 'grump', 'smirk', 'soft', 'soft'][G.tier()]; },
    addCredits(n) { S.credits += n; Sound.sfx('coin'); floatText(`+${n} cr`); updateHud(); save(); },
    introDone,
    finishRadio,
    returnItem,
    nightScene,
    phaseEnd,
  };
  window.G = G;

  // ---------------------------------------------------------------------------
  // SCENES
  // ---------------------------------------------------------------------------
  const pryOnBoard = () => !S.flags.pryTaken || S.flags.pryReturned;
  const mittsOnCouch = () => !S.flags.mittsTaken || S.flags.mittsReturned;
  // During the late-night noodle scene Racket sits with you by the couch.
  const rX = () => (S.flags.noodles && !S.flags.phase1 ? 150 : 1090);

  const SCENES = {
    garage: {
      name: "Racket's Garage", floor: 800, amb: 'garage',
      bg: () => Art.garageBg(), fg: () => Art.garageFg(),
      hs: [
        { id: 'window', label: 'Window', hit: [70, 140, 272, 148], walk: 240, draw: () => Art.garage.window(), act: actWindow },
        { id: 'radio', label: () => (S.flags.radioFixed ? 'Radio' : 'Busted radio'), hit: [184, 250, 140, 94], walk: 250, accepts: ['spare_fuse'], draw: () => Art.garage.radio(S.flags.radioFixed), act: actRadio },
        { id: 'rocket', label: 'Toy rocket', hit: [506, 96, 54, 58], walk: 540, draw: () => Art.garage.shelfRocket(), act: () => say('c', "A little toy rocket, carefully dusted. The only clean thing in this whole garage.") },
        { id: 'jobs', label: 'Job board', hit: [358, 194, 132, 154], walk: 430, draw: () => Art.garage.jobBoard(S), act: openJobs },
        { id: 'terminal', label: 'Computer terminal', hit: [488, 388, 152, 134], walk: 570, draw: () => Art.garage.terminal(S), act: openTerminal },
        { id: 'mug', label: 'Mug', hit: [640, 460, 44, 60], walk: 640, draw: () => Art.garage.mug(), act: actMug },
        { id: 'pegboard', label: () => (pryOnBoard() ? 'Pegboard (pry bar)' : 'Pegboard'), hit: [690, 172, 324, 240], walk: 900, draw: () => Art.garage.pegboard(S, pryOnBoard()), act: actPegboard },
        { id: 'workbench', label: 'Workbench', hit: [680, 420, 258, 200], walk: 840, accepts: ['cell_casing', 'charge_crystal', 'wiring'], draw: () => Art.garage.workbench(S), act: openWorkbench },
        { id: 'bolts', label: 'Bolt bin', hit: [940, 428, 78, 64], walk: 940, draw: () => Art.garage.boltBin(S.jobs.bolts === 'done'), act: actBolts },
        { id: 'couch', label: () => (mittsOnCouch() && !S.flags.crystalTaken ? 'Couch (oven mitts?)' : 'Couch'), hit: [40, 550, 384, 180], walk: 250, draw: () => Art.garage.couch(S, mittsOnCouch()), act: actCouch },
        { id: 'ship', label: 'The Dandelion', show: () => S.flags.shipTowed, hit: [1186, 360, 394, 290], walk: 1290, draw: () => Art.garage.bayShip(S), act: () => openShip() },
        { id: 'racket', label: 'Racket', hit: () => [rX() - 68, 250, 140, 550], walk: () => (rX() > 600 ? 945 : 330), anyItem: true, draw: () => `<g transform="translate(${rX()},800)">${Art.racket(G.rMood())}</g>`, act: actRacket },
        { id: 'exit', label: 'To the crash site', hit: [1440, 740, 150, 110], walk: 1470, draw: () => Art.garage.exit(), act: () => go('crash') },
      ],
      onEnter() {
        if (!S.flags.metRacket) setTimeout(() => dlg('intro'), 500);
      },
    },
    crash: {
      name: 'Crash Site', floor: 812, amb: 'forest',
      bg: () => Art.crashBg(S), fg: () => '',
      hs: [
        { id: 'critter', label: 'Fuzzy critter', hit: [356, 394, 80, 74], walk: 400, draw: () => Art.crash.critter(), act: actCritter },
        { id: 'crystals', label: 'Glowing crystal vein', hit: [36, 500, 170, 212], walk: 200, accepts: ['oven_mitts'], draw: () => Art.crash.crystals(!S.flags.crystalTaken), act: actCrystals },
        { id: 'locker', label: 'Emergency locker', hit: [184, 596, 120, 116], walk: 250, draw: () => Art.crash.locker(!S.flags.fuseTaken), act: actLocker },
        { id: 'ship', label: 'The Dandelion', show: () => !S.flags.shipTowed, hit: [480, 410, 600, 290], walk: 720, draw: () => Art.crash.ship(), act: () => openShip(true) },
        { id: 'tracks', label: 'Tow tracks', show: () => S.flags.shipTowed, hit: [560, 650, 420, 90], walk: 760, act: () => say('c', "Tow tracks, heading for the garage. He hauled the Dandelion off with a truck held together by duct tape and spite.") },
        { id: 'scrap', label: 'Bent hull panel', show: () => !S.flags.scrapTaken, hit: [304, 700, 130, 64], walk: 372, draw: () => Art.crash.hullScrap(), act: actScrap },
        { id: 'debris', label: 'Wreckage', hit: [1040, 596, 220, 114], walk: 1110, accepts: ['pry_bar'], draw: () => Art.crash.debris(!S.flags.casingTaken), act: actDebris },
        { id: 'antenna', label: 'Folded antenna', show: () => !S.flags.antennaTaken, hit: [1256, 640, 110, 92], walk: 1300, draw: () => Art.crash.antenna(), act: actAntenna },
        { id: 'exit', label: () => (S.flags.metRacket ? "To Racket's garage" : 'Light through the trees'), hit: [1420, 400, 180, 290], walk: 1470, draw: () => Art.crash.exit(), act: actCrashExit },
      ],
      onEnter() {},
    },
  };

  // ---------------------------------------------------------------------------
  // RENDERING
  // ---------------------------------------------------------------------------
  const sceneEl = $('#scene');
  function render() {
    const sc = SCENES[S.scene];
    let h = sc.bg();
    for (const hs of sc.hs) {
      if (hs.show && !hs.show()) continue;
      const [x, y, w, hh] = typeof hs.hit === 'function' ? hs.hit() : hs.hit;
      h += `<g data-hs="${hs.id}" class="hs">${hs.draw ? hs.draw() : ''}<rect class="hit" x="${x}" y="${y}" width="${w}" height="${hh}" rx="18"/></g>`;
    }
    const cx = S.pos[S.scene];
    h += `<g id="crystal" transform="translate(${cx},${sc.floor}) scale(.94)" pointer-events="none"><g class="c-flip" transform="scale(${G.tmp.face || 1},1)"><g class="c-bob">${Art.crystal(G.tmp.cMood || 'neutral')}</g></g></g>`;
    h += sc.fg() + Art.overlays();
    sceneEl.innerHTML = h;
  }
  function refresh() { render(); updateHud(); renderTray(); save(); }

  function objective() {
    const F = S.flags;
    if (!F.sawDiag) return "Check the ship's diagnostics.";
    if (!F.metRacket) return 'Find help. There\'s a light through the trees.';
    if (!S.repairs.fuel) {
      const have = DATA.parts.filter((p) => S.parts[p.key] || G.has(p.item)).length;
      if (have === 3) return 'Assemble the fuel cell at the workbench.';
      return `Fix the fuel cell: casing, charge crystal, wiring (${have}/3 found).`;
    }
    if (!F.phase1) return 'Talk to Racket.';
    return 'Phase 1 complete! Thrusters and the Junkyard are next.';
  }
  function updateHud() {
    $('#loc').textContent = SCENES[S.scene].name;
    $('#obj').textContent = objective();
    $('#credits b').textContent = S.credits;
    $('[data-act="sound"]').classList.toggle('off', !Sound.prefs.sound);
    $('[data-act="music"]').classList.toggle('off', !Sound.prefs.music);
  }

  // ---------- inventory tray ----------
  const DEFAULT_DESC = 'Tap an item to inspect it. With an item selected, tap something in the scene to use it.';
  function itemDesc(id) {
    const it = DATA.items[id];
    if (!it) return '';
    if (S.flags.metRacket && it.r) return { who: 'Racket says', text: it.r };
    return { who: 'Crystal thinks', text: it.c || it.r };
  }
  function renderTray(flash) {
    const inv = $('#inv');
    const slots = Math.max(8, S.inv.length);
    let h = '';
    for (let i = 0; i < slots; i++) {
      const id = S.inv[i];
      h += id
        ? `<button class="slot${sel === id ? ' sel' : ''}${flash === id ? ' flash' : ''}" data-item="${id}" aria-label="${esc(DATA.items[id].name)}">${Art.icon(id)}</button>`
        : `<div class="slot empty"></div>`;
    }
    inv.innerHTML = h;
    const d = sel ? itemDesc(sel) : null;
    $('#desc').innerHTML = d
      ? `<div class="desc-name">${esc(DATA.items[sel].name)}</div><div class="desc-text"><span class="desc-who">${d.who}:</span> ${esc(d.text)}</div><div class="desc-hint">Now tap something in the scene to use it, or tap the item again to put it away.</div>`
      : `<div class="desc-text muted">${DEFAULT_DESC}</div>`;
    $('#stage').classList.toggle('using', !!sel);
  }
  function setSel(id) { sel = id; renderTray(); }

  // ---------------------------------------------------------------------------
  // BUBBLES, TOASTS, CARDS
  // ---------------------------------------------------------------------------
  const bubbleTimers = {};
  function say(who, text, delay = 0) {
    const run = () => {
      const stage = $('#bubbles');
      $$(`.bubble.${who}`, stage).forEach((b) => b.remove());
      const pos = who === 'r' ? [rX(), 240] : who === 'c' ? [S.pos[S.scene], 330] : [800, 870];
      const b = document.createElement('div');
      b.className = `bubble ${who}`;
      b.innerHTML = `${who === 'r' ? '<span class="b-name">Racket</span>' : ''}${esc(text)}`;
      b.style.top = pos[1] / 9 + '%';
      b.style.left = pos[0] / 16 + '%';
      stage.appendChild(b);
      // keep the bubble inside the stage, but leave its tail pointing at the speaker
      const sw = stage.clientWidth, bw = b.offsetWidth, ax = pos[0] / 1600 * sw;
      const left = clamp(ax, bw / 2 + 8, sw - bw / 2 - 8);
      b.style.left = left + 'px';
      b.style.setProperty('--tail', clamp(bw / 2 + (ax - left), 18, bw - 18) + 'px');
      Sound.sfx(who === 'r' ? 'blipR' : who === 'c' ? 'blipC' : 'blipN');
      const dur = 2400 + text.length * 48;
      clearTimeout(bubbleTimers[who]);
      bubbleTimers[who] = setTimeout(() => { b.classList.add('out'); setTimeout(() => b.remove(), 300); }, dur);
      b.addEventListener('click', () => b.remove());
    };
    if (delay) setTimeout(run, delay); else run();
    return 2400 + text.length * 48;
  }
  function floatText(t) {
    const el = document.createElement('div');
    el.className = 'float-text'; el.textContent = t;
    $('#hud').appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }
  function warmPuff() {
    const el = document.createElement('div');
    el.className = 'warm-puff';
    el.style.left = rX() / 16 + '%'; el.style.top = 220 / 9 + '%';
    el.innerHTML = '<svg viewBox="0 0 40 40"><path d="M20,34 C6,24 4,14 11,9 C16,6 20,10 20,13 C20,10 24,6 29,9 C36,14 34,24 20,34Z" fill="#7fffe0" opacity=".9"/></svg>';
    $('#bubbles').appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  function card(text, cb, opts = {}) {
    const el = $('#card');
    el.innerHTML = `<div class="card-inner">${opts.title ? `<h2>${esc(opts.title)}</h2>` : ''}<p>${esc(text)}</p>${opts.html || ''}<div class="card-hint">${opts.noTap ? '' : 'Tap to continue'}</div></div>`;
    el.classList.remove('hidden');
    requestAnimationFrame(() => el.classList.add('show'));
    const close = () => {
      el.classList.remove('show');
      setTimeout(() => { el.classList.add('hidden'); cb && cb(); }, 450);
    };
    if (!opts.noTap) {
      setTimeout(() => el.addEventListener('click', close, { once: true }), 350);
    }
    return close;
  }

  // ---------------------------------------------------------------------------
  // WALKING
  // ---------------------------------------------------------------------------
  function walkTo(x, cb) {
    const sc = SCENES[S.scene];
    x = clamp(x, 90, 1520);
    const from = S.pos[S.scene], dist = Math.abs(x - from);
    if (dist < 10) { cb && cb(); return; }
    G.tmp.face = x > from ? 1 : -1;
    const el = $('#crystal');
    $('.c-flip', el).setAttribute('transform', `scale(${G.tmp.face},1)`);
    el.classList.add('walking');
    busy = true;
    const dur = dist / .62, t0 = performance.now();
    let lastStep = 0;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const cx = from + (x - from) * e;
      S.pos[S.scene] = cx;
      el.setAttribute('transform', `translate(${cx},${sc.floor}) scale(.94)`);
      if (now - lastStep > 260) { Sound.sfx('step'); lastStep = now; }
      if (t < 1) requestAnimationFrame(step);
      else { el.classList.remove('walking'); busy = false; save(); cb && cb(); }
    };
    requestAnimationFrame(step);
  }

  // ---------------------------------------------------------------------------
  // INPUT ON THE SCENE
  // ---------------------------------------------------------------------------
  const isBlocked = () => busy || Dlg.open || !$('#modal').classList.contains('hidden') || !$('#card').classList.contains('hidden') || !$('#title').classList.contains('hidden');
  function sceneCoords(e) {
    const r = sceneEl.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width * 1600, (e.clientY - r.top) / r.height * 900];
  }
  function findHs(id) { return SCENES[S.scene].hs.find((h) => h.id === id); }
  const label = (hs) => (typeof hs.label === 'function' ? hs.label() : hs.label);

  sceneEl.addEventListener('click', (e) => {
    lastInput = Date.now();
    if (isBlocked()) return;
    const g = e.target.closest('[data-hs]');
    if (g) { onHotspot(findHs(g.dataset.hs)); return; }
    const [x, y] = sceneCoords(e);
    if (y > 660) { if (sel) setSel(null); walkTo(x); }
  });
  const tip = $('#tooltip');
  sceneEl.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const g = e.target.closest('[data-hs]');
    if (!g || isBlocked()) { tip.classList.remove('show'); return; }
    const hs = findHs(g.dataset.hs);
    tip.textContent = sel ? `Use ${DATA.items[sel].name} on ${label(hs)}` : label(hs);
    const r = $('#stage').getBoundingClientRect();
    tip.style.left = (e.clientX - r.left) + 'px';
    tip.style.top = (e.clientY - r.top) + 'px';
    tip.classList.add('show');
  });
  sceneEl.addEventListener('pointerleave', () => tip.classList.remove('show'));

  const WRONG = ["That doesn't go there.", "Nope. Not even a little.", "Creative. Wrong, but creative.", "I don't think that's how that works."];
  function onHotspot(hs) {
    if (!hs) return;
    tip.classList.remove('show');
    Sound.sfx('click');
    const item = sel;
    const doIt = () => {
      if (item) {
        if (hs.anyItem || (hs.accepts && hs.accepts.includes(item))) hs.act(item);
        else { Sound.sfx('error'); say('c', WRONG[Math.random() * WRONG.length | 0]); }
        setSel(null);
      } else hs.act();
    };
    const wx = typeof hs.walk === 'function' ? hs.walk() : hs.walk;
    if (wx != null) walkTo(wx, doIt); else doIt();
  }

  // ---------------------------------------------------------------------------
  // TRAVEL
  // ---------------------------------------------------------------------------
  function go(scene) {
    if (scene === S.scene) return;
    Sound.sfx('whoosh');
    const stage = $('#stage');
    stage.classList.add('fade');
    busy = true;
    setTimeout(() => {
      S.scene = scene;
      S.pos[scene] = 1440;
      G.tmp.face = -1;
      setSel(null);
      $('#bubbles').innerHTML = '';
      refresh();
      Sound.setAmbience(SCENES[scene].amb);
      stage.classList.remove('fade');
      setTimeout(() => {
        busy = false;
        walkTo(scene === 'garage' ? 1310 : 1250, () => SCENES[scene].onEnter());
      }, 350);
    }, 450);
  }

  // ---------------------------------------------------------------------------
  // HOTSPOT ACTIONS — GARAGE
  // ---------------------------------------------------------------------------
  function actWindow() {
    say('c', 'Two moons tonight. The crash was almost worth the view.');
    if (S.flags.metRacket) say('r', G.tier() >= 2 ? "...Yeah. It's a good view." : "It's geology. Don't get sentimental.", 2600);
  }
  function actMug() {
    say('c', "WORLD'S OKAYEST MECHANIC. The handle's been glued back on. Twice.");
    if (S.flags.metRacket && !S.flags.mugJoke) { S.flags.mugJoke = true; say('r', 'Three times, now. Thanks to somebody.', 3000); }
  }
  function actRadio() {
    if (S.flags.radioFixed) {
      const next = ((S.station || 0) + 1) % (Sound.stations.length + 1);
      S.station = next;
      if (next < Sound.stations.length) {
        Sound.setStation(next); updateHud();
        say('n', DATA.stationLines[next]);
      } else {
        Sound.toggleMusic(false); updateHud();
        say('c', 'Click. Radio off.');
        say('r', G.tier() >= 2 ? 'Aw, I liked that one.' : 'Thank you.', 1600);
      }
      save();
      return;
    }
    if (G.has('spare_fuse')) {
      if (!S.flags.metRacket) { say('c', "Somebody's radio. I shouldn't mess with it without asking."); return; }
      G.take('spare_fuse');
      dlg('radioFix');
      return;
    }
    say('c', 'Just static. And something that might be a very sad trombone.');
    if (S.flags.metRacket) say('r', "It's busted. Needs a fuse. Like my spirit needs a vacation.", 2600);
  }
  function finishRadio() {
    S.flags.radioFixed = true;
    S.jobs.radio = 'done';
    S.station = 0;
    Sound.setStation(0);
    G.friend(6);
    G.addCredits(15);
    refresh();
  }
  function actPegboard() {
    if (!S.flags.metRacket) { say('c', "Lots of tools. Not mine, though."); return; }
    if (pryOnBoard()) {
      if (S.flags.casingTaken) { say('c', "I'm done with the pry bar. It looks happy back on its hook."); return; }
      S.flags.pryTaken = true; S.flags.pryReturned = false;
      G.give('pry_bar');
      say('c', 'Mind if I borrow this?');
      say('r', G.tier() >= 2 ? 'Go ahead, lynx. Bring it back straight.' : 'Bring it back straight.', 1500);
      refresh();
      return;
    }
    say('c', 'A chalk outline where the pry bar goes. He drew an outline. Of course he did.');
  }
  function actCouch() {
    if (mittsOnCouch() && !S.flags.crystalTaken && S.flags.metRacket) {
      S.flags.mittsTaken = true; S.flags.mittsReturned = false;
      G.give('oven_mitts');
      say('c', "Oven mitts. On the couch. I'm not going to ask.");
      say('r', "Don't ask.", 2200);
      refresh();
      return;
    }
    if (S.flags.noodles) { say('c', 'Two empty noodle cups, side by side. Neither of us threw ours out yet.'); return; }
    say('c', 'The couch sags in a very raccoon-shaped way. Weirdly comfy.');
  }
  function actBolts() {
    if (!S.flags.metRacket) { say('c', 'A bin of bolts. And... a sock?'); return; }
    if (S.jobs.bolts === 'done') { say('c', "Perfectly sorted. He pretended he wasn't impressed."); return; }
    openBoltGame();
  }
  function actRacket(item) {
    if (item) {
      if (item === 'pry_bar' && S.flags.casingTaken) { dlg('retPry'); return; }
      if (item === 'oven_mitts' && S.flags.crystalTaken) { dlg('retMitts'); return; }
      say('r', DATA.giveRacket[item] || 'What am I supposed to do with that?');
      return;
    }
    G.tmp.again = false;
    dlg('hub');
  }
  function returnItem(id) {
    G.take(id);
    if (id === 'pry_bar') { S.flags.pryReturned = true; G.friend(4); }
    if (id === 'oven_mitts') { S.flags.mittsReturned = true; G.friend(3); }
    refresh();
  }

  // ---------------------------------------------------------------------------
  // HOTSPOT ACTIONS — CRASH SITE
  // ---------------------------------------------------------------------------
  const CRITTER = ["A fuzzy, six-legged critter blinks at me. I blink back. We're friends now.", "It's chewing on one of my bolts. Honestly? Respect.", "It made a tiny 'mrrp.' My heart can't take this.", "It scurries off toward the deep woods... then comes right back. It's keeping an eye on me."];
  function actCritter() {
    const i = S.talked.critter || 0;
    S.talked.critter = i + 1;
    say('c', CRITTER[i % CRITTER.length]);
    save();
  }
  function actCrystals() {
    if (S.flags.crystalTaken) { say('c', 'The vein still hums, but I took the only piece that broke loose.'); return; }
    if (G.has('oven_mitts')) {
      S.flags.crystalTaken = true;
      Sound.sfx('sparkle');
      G.give('charge_crystal');
      say('c', "Got it! A raw charge crystal. It's humming, like it knows something.");
      refresh();
      return;
    }
    Sound.sfx('zap');
    shake();
    G.tmp.cMood = 'surprised'; render();
    setTimeout(() => { G.tmp.cMood = null; render(); }, 1400);
    say('c', S.flags.metRacket ? "OW! Hot! Stupidly hot! ...Mitts. He said mitts." : "OW! Hot! I'll need something heat-proof to grab that.");
  }
  function actLocker() {
    if (S.flags.fuseTaken) { say('c', "Just my ration bars, which have reached a new state of matter. They can stay."); return; }
    S.flags.fuseTaken = true;
    G.give('spare_fuse');
    say('c', 'My emergency locker! One spare ship-grade fuse... and ration bars that are now a paste.');
    refresh();
  }
  function actScrap() {
    S.flags.scrapTaken = true;
    G.give('hull_scrap');
    say('c', "A chunk of hull plating. Can't fix it, but somebody out there buys scrap, right?");
    refresh();
  }
  function actAntenna() {
    S.flags.antennaTaken = true;
    G.give('antenna');
    say('c', 'My comm antenna, folded like a lawn chair. Sorry, buddy.');
    refresh();
  }
  function actDebris() {
    if (S.flags.casingTaken) { say('c', 'Just a sad, bent hull plate now.'); return; }
    if (G.has('pry_bar')) {
      Sound.sfx('clank');
      shake();
      setTimeout(() => {
        Sound.sfx('clank');
        S.flags.casingTaken = true;
        G.give('cell_casing');
        say('c', 'Hnnngh... got it! The fuel cell casing. Dented, but the seals look good.');
        refresh();
      }, 500);
      return;
    }
    say('c', S.flags.metRacket
      ? "Something's glinting under that hull plate. Way too heavy to lift by paw. ...His pry bar would do it."
      : "Something's glinting under that hull plate. Way too heavy to lift by paw. I need something to pry with.");
  }
  function actCrashExit() {
    if (!S.flags.sawDiag) { say('c', 'Diagnostics first. Panic second.'); return; }
    go('garage');
  }
  function shake() { const s = $('#stage'); s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake'); }

  // ---------------------------------------------------------------------------
  // DIALOGUE RUNNER
  // ---------------------------------------------------------------------------
  const Dlg = {
    open: false, node: null, queue: [], typing: null, waiting: false, done: null,
    el: $('#dlg'), log: $('#dlg-log'), choices: $('#dlg-choices'),
    resolve(n) {
      let node = typeof n === 'string' ? DATA.dlg[n] : n;
      if (typeof node === 'function') node = node(G);
      return node;
    },
    start(id) {
      const node = this.resolve(id);
      this.open = true;
      this.log.innerHTML = '';
      this.choices.innerHTML = '';
      const cast = node.cast || ['r', 'c'];
      this.el.classList.toggle('solo', !cast.includes('r'));
      $('#p-r').innerHTML = Art.portrait('r', G.rMood());
      $('#p-c').innerHTML = Art.portrait('c', 'neutral');
      this.el.classList.remove('hidden');
      requestAnimationFrame(() => this.el.classList.add('show'));
      tip.classList.remove('show');
      this.run(node);
    },
    run(node) { this.node = node; this.queue = [...(node.lines || [])]; this.next(); },
    next() {
      while (this.queue.length && this.queue[0][0] === 'fx') this.queue.shift()[1](G);
      if (this.queue.length) return this.show(this.queue.shift());
      const n = this.node;
      if (n.choices) {
        const cs = n.choices.filter((c) => !c.if || c.if(G));
        this.renderChoices(cs);
        return;
      }
      this.finish();
    },
    finish() {
      const n = this.node;
      if (n.go) {
        const g = typeof n.go === 'function' ? n.go(G) : n.go;
        if (g) { this.run(this.resolve(g)); return; }
      }
      this.close();
      if (n.end) n.end(G);
    },
    show([who, mood, text]) {
      const t = typeof text === 'function' ? text(G) : text;
      if (who === 'r') $('#p-r').innerHTML = Art.portrait('r', mood);
      if (who === 'c') $('#p-c').innerHTML = Art.portrait('c', mood);
      this.el.dataset.speaker = who;
      const b = document.createElement('div');
      b.className = `line ${who}`;
      b.innerHTML = who === 'n' ? '<span class="txt"></span>' : `<span class="who">${who === 'r' ? 'Racket' : 'Crystal'}</span><span class="txt"></span>`;
      this.log.appendChild(b);
      this.log.scrollTop = this.log.scrollHeight;
      const span = $('.txt', b);
      let i = 0;
      this.waiting = false;
      $('#dlg-next').classList.remove('show');
      clearInterval(this.typing);
      const blip = who === 'r' ? 'blipR' : who === 'c' ? 'blipC' : 'blipN';
      this.typing = setInterval(() => {
        i += 1;
        span.textContent = t.slice(0, i);
        if (i % 2 === 0 && t[i] && t[i] !== ' ') Sound.sfx(blip);
        this.log.scrollTop = this.log.scrollHeight;
        if (i >= t.length) this.endType();
      }, 20);
      this.fullText = t; this.span = span;
    },
    endType() {
      clearInterval(this.typing); this.typing = null;
      if (this.span) this.span.textContent = this.fullText;
      this.waiting = true;
      $('#dlg-next').classList.add('show');
      this.log.scrollTop = this.log.scrollHeight;
    },
    tap() {
      if (!this.open || this.choices.childElementCount) return;
      if (this.typing) { this.endType(); return; }
      if (this.waiting) { this.waiting = false; $('#dlg-next').classList.remove('show'); this.next(); }
    },
    renderChoices(cs) {
      $('#dlg-next').classList.remove('show');
      this.el.dataset.speaker = 'c';
      this.choices.innerHTML = cs.map((c, i) => `<button class="choice" data-i="${i}">${esc(c.t)}</button>`).join('');
      $$('.choice', this.choices).forEach((btn) => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const c = cs[+btn.dataset.i];
        Sound.sfx('click');
        this.choices.innerHTML = '';
        const b = document.createElement('div');
        b.className = 'line c';
        b.innerHTML = `<span class="who">Crystal</span><span class="txt">${esc(c.t)}</span>`;
        this.log.appendChild(b);
        if (c.f) G.friend(c.f);
        if (c.run) c.run(G);
        const end = this.node.end;
        this.run({ lines: c.say || [], go: c.go, end: c.go ? null : (c.end || end) });
      }));
      this.log.scrollTop = this.log.scrollHeight;
    },
    close() {
      clearInterval(this.typing); this.typing = null;
      this.open = false;
      this.el.classList.remove('show');
      setTimeout(() => { if (!this.open) this.el.classList.add('hidden'); }, 250);
      render();
      updateHud();
    },
  };
  $('#dlg').addEventListener('click', () => Dlg.tap());
  document.addEventListener('keydown', (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && Dlg.open) { e.preventDefault(); Dlg.tap(); }
    if (e.key === 'Escape' && !$('#modal').classList.contains('hidden')) closeModal();
  });
  function dlg(id) { Dlg.start(id); }

  // ---------------------------------------------------------------------------
  // MODALS
  // ---------------------------------------------------------------------------
  let onModalClose = null;
  function modal(title, body, opts = {}) {
    const m = $('#modal');
    $('.modal-card', m).className = `modal-card ${opts.cls || ''}`;
    $('.modal-title', m).textContent = title;
    $('.modal-body', m).innerHTML = body;
    m.classList.remove('hidden');
    requestAnimationFrame(() => m.classList.add('show'));
    onModalClose = opts.onClose || null;
    tip.classList.remove('show');
    return $('.modal-body', m);
  }
  function closeModal() {
    const m = $('#modal');
    if (m.classList.contains('hidden')) return;
    m.classList.remove('show');
    setTimeout(() => m.classList.add('hidden'), 220);
    const cb = onModalClose; onModalClose = null;
    render(); updateHud(); renderTray(); save();
    if (cb) setTimeout(cb, 240);
  }
  $('#modal .x').addEventListener('click', () => { Sound.sfx('click'); closeModal(); });
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });

  // ---------- Ship status / diagnostics ----------
  const SYSTEMS = [
    { id: 'fuel', name: 'Fuel Cell', diag: 'CRITICAL. Casing ejected, charge crystal shattered, wiring fried.', lockedHint: null },
    { id: 'thrusters', name: 'Thrusters', diag: 'OFFLINE. Nozzles crumpled on impact.', lockedHint: 'Racket: "Junkyard. Tomorrow. One thing at a time."' },
    { id: 'nav', name: 'Navigation', diag: 'CONFUSED. Current location: "???". Current mood: "???".', lockedHint: 'Needs a nav chip. Someone online is selling one. Suspiciously.' },
    { id: 'hull', name: 'Hull Plating', diag: 'HAS SEEN BETTER DAYS. Three breaches, one dent shaped like a face.', lockedHint: 'Something big and metal crashed out in the canyon, years ago...' },
    { id: 'core', name: 'Engine Core', diag: 'STABLE-ISH. Making a noise. A new noise.', lockedHint: 'Racket goes quiet when you ask about this one.' },
  ];
  function openShip(fromCrash) {
    const first = fromCrash && !S.flags.sawDiag;
    const fuelParts = DATA.parts.map((p) => {
      const st = S.parts[p.key] ? 'installed' : G.has(p.item) ? 'found' : 'missing';
      const lbl = { installed: 'Installed', found: 'Found: bring it to the workbench', missing: S.flags.metRacket ? p.where : 'Missing' }[st];
      return `<li class="part ${st}"><span class="chk">${st === 'installed' ? '✔' : st === 'found' ? '●' : '○'}</span><span class="pn">${p.name}</span><span class="pw">${esc(lbl)}</span></li>`;
    }).join('');
    const rows = SYSTEMS.map((s) => {
      if (s.id === 'fuel') {
        const done = S.repairs.fuel;
        return `<div class="sys ${done ? 'done' : 'active'}"><div class="sys-head"><span class="sys-name">${s.name}</span><span class="chip ${done ? 'ok' : 'bad'}">${done ? 'ONLINE' : 'CRITICAL'}</span></div>
          ${done ? '<p class="sys-note">Humming happily. Racket pretends he isn\'t proud of it.</p>' : `<p class="sys-note">${esc(s.diag)}</p><ul class="parts">${fuelParts}</ul>`}</div>`;
      }
      return `<div class="sys locked"><div class="sys-head"><span class="sys-name">${s.name}</span><span class="chip warn">${first ? 'DAMAGED' : 'LOCKED'}</span></div>
        <p class="sys-note">${esc(first || !S.flags.metRacket ? s.diag : s.lockedHint)}</p></div>`;
    }).join('');
    const intro = first
      ? `<p class="lead">DANDELION // SELF-DIAGNOSTIC v2.1<br><span class="muted">Running... running... oh dear.</span></p>`
      : `<p class="lead">Ship repairs: ${S.repairs.fuel ? 1 : 0} / 5 systems online.</p>`;
    modal(first ? 'Ship Diagnostics' : 'The Dandelion', intro + `<div class="systems">${rows}</div>`, {
      cls: 'ship-modal',
      onClose: first ? () => { S.flags.sawDiag = true; updateHud(); save(); dlg('afterDiag'); } : null,
    });
  }

  // ---------- Job board ----------
  function openJobs() {
    if (!S.flags.metRacket) { say('c', 'A job board. Somebody around here has chores.'); return; }
    const notes = DATA.jobs.map((j, i) => {
      const st = S.jobs[j.id];
      let status = st === 'done' ? 'DONE' : 'OPEN';
      if (j.id === 'scrap' && st !== 'done') status = `${S.sold.length}/2 SOLD`;
      return `<div class="note n${i} ${st === 'done' ? 'done' : ''}"><div class="pin"></div><h3>${j.title}</h3><p>${esc(j.body)}</p><div class="note-foot"><span>${j.reward}</span><b>${status}</b></div>${st === 'done' ? '<div class="stamp">PAID</div>' : ''}</div>`;
    }).join('');
    modal('Job Board', `<div class="board">${notes}
      <div class="note n3 flavor"><div class="pin"></div><h3>LOST</h3><p>My patience. If found, keep it.</p></div>
      <div class="note n4 flavor"><div class="pin"></div><h3>NO SOLICITORS</h3><p>This means you, Gary.</p></div></div>`, { cls: 'jobs-modal' });
  }

  // ---------- JunkNet terminal ----------
  let termTab = 'buy';
  function openTerminal() {
    if (!S.flags.metRacket) { say('c', "Someone's computer. Better not snoop. ...Yet."); return; }
    modal('JunkNet', '', { cls: 'term-modal' });
    renderTerminal();
  }
  function renderTerminal(msg) {
    const body = $('#modal .modal-body');
    if (!S.flags.termUnlocked) {
      body.innerHTML = `<div class="crt"><pre>JUNKNET OS v0.3 (definitely licensed)
USER: RACKET
PASSWORD: ________</pre>
        <div class="sticky">Password hint: what everybody calls me that I HATE. -R</div>
        <div class="pw-opts">${['password', 'trashpanda', 'grumpyface'].map((p) => `<button class="term-btn" data-pw="${p}">${p}</button>`).join('')}</div>
        <pre class="term-msg">${msg ? esc(msg) : ''}</pre></div>`;
      $$('[data-pw]', body).forEach((b) => b.addEventListener('click', () => {
        const p = b.dataset.pw;
        if (p === 'trashpanda') {
          S.flags.termUnlocked = true; Sound.sfx('success'); save();
          renderTerminal('ACCESS GRANTED. Welcome back, RACKET.\n1 unread message: "stop calling me trash panda" (from: yourself)');
          if (!S.flags.pwJoke) { S.flags.pwJoke = true; setTimeout(() => { if (S.scene === 'garage') say('r', 'You figured out my password. Great. Fantastic. Love that.'); }, 600); }
        } else {
          Sound.sfx('error');
          renderTerminal(p === 'password' ? 'ACCESS DENIED. He is not THAT careless.' : 'ACCESS DENIED. Accurate, though.');
        }
      }));
      return;
    }
    const sellable = S.inv.filter((i) => DATA.sellPrices[i]);
    const listings = DATA.listings.map((l) => {
      const owned = l.id === 'wiring' && (G.has('wiring') || S.parts.wiring);
      let btn;
      if (owned) btn = `<span class="tag ok">PURCHASED</span>`;
      else if (l.status) btn = `<span class="tag">${l.status}</span>`;
      else if (l.id === 'wiring') btn = `<button class="term-btn buy" data-buy="wiring" ${S.credits < l.price ? 'disabled' : ''}>${S.credits < l.price ? `NEED ${l.price} CR` : `BUY · ${l.price} CR`}</button>`;
      else btn = `<button class="term-btn" data-joke="${l.id}">${l.price.toLocaleString()} CR</button>`;
      return `<div class="listing ${l.id === 'wiring' ? 'hot' : ''}"><div class="l-main"><div class="l-name">${esc(l.name)}</div><div class="l-blurb">${esc(l.blurb)}</div>
        <div class="l-seller">seller: ${l.seller} ${'★'.repeat(l.stars)}${'☆'.repeat(5 - l.stars)}</div></div><div class="l-act">${btn}</div></div>`;
    }).join('');
    const sell = sellable.length
      ? sellable.map((i) => `<div class="listing"><div class="l-main"><div class="l-name">${esc(DATA.items[i].name)}</div><div class="l-blurb">Buyer scrapmonger_88: "i buy anything. ANYTHING."</div></div>
          <div class="l-act"><button class="term-btn buy" data-sell="${i}">SELL · ${DATA.sellPrices[i]} CR</button></div></div>`).join('')
      : `<p class="muted">Nothing to sell. Scrap from your crash site sells here.</p>`;
    body.innerHTML = `<div class="crt">
      <div class="term-top"><span>JUNKNET · logged in as RACKET</span><span class="term-cr">${S.credits} CR</span></div>
      <div class="term-tabs"><button class="term-tab ${termTab === 'buy' ? 'on' : ''}" data-tab="buy">BUY</button><button class="term-tab ${termTab === 'sell' ? 'on' : ''}" data-tab="sell">SELL${sellable.length ? ` (${sellable.length})` : ''}</button></div>
      ${msg ? `<pre class="term-msg">${esc(msg)}</pre>` : ''}
      <div class="listings">${termTab === 'buy' ? listings : sell}</div></div>`;
    $$('[data-tab]', body).forEach((b) => b.addEventListener('click', () => { termTab = b.dataset.tab; Sound.sfx('click'); renderTerminal(); }));
    $$('[data-joke]', body).forEach((b) => b.addEventListener('click', () => {
      Sound.sfx('error');
      renderTerminal(b.dataset.joke === 'muffler' ? `INSUFFICIENT FUNDS. You have ${S.credits} CR. You need 9,999 CR. And a reason.` : 'INSUFFICIENT FUNDS. Also, rude to even look.');
    }));
    $$('[data-buy]', body).forEach((b) => b.addEventListener('click', () => {
      if (S.credits < DATA.wiringPrice) return;
      S.credits -= DATA.wiringPrice;
      Sound.sfx('coin'); updateHud(); save();
      closeModal();
      setTimeout(() => {
        Sound.sfx('drone');
        card('Thirty seconds later, a rattling delivery drone kicks open the window, drops a box marked FRAGILE(ISH), and flees into the night.', () => {
          G.give('wiring');
          say('c', 'Copper wiring harness! It has... tiny teeth marks.');
          say('r', "Possum. Classic. It'll work.", 2600);
          refresh();
        });
      }, 300);
    }));
    $$('[data-sell]', body).forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.sell;
      G.take(id);
      S.sold.push(id);
      G.addCredits(DATA.sellPrices[id]);
      let m = `SOLD: ${DATA.items[id].name}. scrapmonger_88 says "pleasure doing business. dont tell anyone."`;
      if (S.sold.length >= 2 && S.jobs.scrap !== 'done') {
        S.jobs.scrap = 'done'; G.friend(3);
        m += '\nJOB COMPLETE: Haul scrap.';
        setTimeout(() => { if (S.scene === 'garage') say('r', "You cleaned up my woods AND made money. ...Huh. Efficient."); }, 400);
      }
      save();
      renderTerminal(m);
    }));
  }

  // ---------- Workbench ----------
  const BENCH_LINES = {
    casing: 'Seat it. Gently. GENTLY. ...Okay, that works.',
    crystal: 'Careful, that thing bites. Ha. Literally.',
    wiring: 'Red to red. Not that red. The other red. ...Good.',
  };
  function openWorkbench(item) {
    if (!S.flags.metRacket) return;
    if (S.repairs.fuel) {
      modal('Workbench', `<div class="bench">${Art.fuelCellSchematic({ casing: 1, crystal: 1, wiring: 1 }, true, 1)}
        <p class="lead">The fuel cell is installed and humming. Next up: <b>thrusters</b>. Racket says the junkyard's where you'll find them.</p></div>`, { cls: 'bench-modal' });
      return;
    }
    modal('Workbench: Fuel Cell', '<div class="bench"></div>', { cls: 'bench-modal' });
    renderBench();
    if (item) { const p = DATA.parts.find((pp) => pp.item === item); if (p && !S.parts[p.key]) setTimeout(() => installPart(p.key), 300); }
  }
  function renderBench(justKey, line) {
    const el = $('#modal .bench');
    if (!el) return;
    const all = DATA.parts.every((p) => S.parts[p.key]);
    const rows = DATA.parts.map((p) => {
      const inst = S.parts[p.key], have = G.has(p.item);
      return `<div class="bench-row ${inst ? 'installed' : have ? 'ready' : 'missing'}">
        <div class="bench-icon">${have || inst ? Art.icon(p.item) : '<span>?</span>'}</div>
        <div class="bench-info"><b>${p.name}</b><span>${inst ? 'Installed' : have ? 'In your pack. Ready to install.' : esc(p.where)}</span></div>
        <div>${inst ? '<span class="tag ok">✔</span>' : have ? `<button class="btn" data-install="${p.key}">Install</button>` : '<span class="tag">Missing</span>'}</div></div>`;
    }).join('');
    el.innerHTML = `<div class="schem-wrap">${Art.fuelCellSchematic(S.parts, false, 0)}<div class="sparks"></div></div>
      <div class="bench-line">${line ? `<b>Racket:</b> ${esc(line)}` : `<b>Racket:</b> ${all ? "That's all three. Seal it up and charge it. Don't blink." : "Bring me parts. Well, bring the BENCH parts. I'll watch."}`}</div>
      <div class="bench-rows">${rows}</div>
      <div class="bench-foot"><div class="charge-bar"><i></i></div><button class="btn big" id="btn-charge" ${all ? '' : 'disabled'}>Seal &amp; Charge</button></div>`;
    if (justKey) { const g = $(`[data-part="${justKey}"]`, el); if (g) g.classList.add('just'); burst(14); }
    $$('[data-install]', el).forEach((b) => b.addEventListener('click', () => installPart(b.dataset.install)));
    $('#btn-charge', el).addEventListener('click', chargeCell);
  }
  function installPart(key) {
    const p = DATA.parts.find((pp) => pp.key === key);
    if (!G.has(p.item)) return;
    S.parts[key] = true;
    G.take(p.item);
    Sound.sfx('clank');
    setTimeout(() => Sound.sfx('spark'), 120);
    renderBench(key, BENCH_LINES[key]);
    updateHud(); save();
  }
  function burst(n) {
    const box = $('#modal .sparks');
    if (!box) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 120;
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d - 30 + 'px');
      s.style.animationDelay = Math.random() * .15 + 's';
      box.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }
  }
  function chargeCell() {
    const el = $('#modal .bench');
    const btn = $('#btn-charge', el);
    btn.disabled = true; btn.textContent = 'Charging...';
    $$('[data-install]', el).forEach((b) => (b.disabled = true));
    $('#modal .x').disabled = true;
    Sound.sfx('hum', 3);
    const bar = $('.charge-bar i', el), wrap = $('.schem-wrap', el);
    const t0 = performance.now(), dur = 3000;
    let lastSpark = 0;
    $('.bench-line', el).innerHTML = '<b>Racket:</b> Here we go. Easy... easy...';
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      bar.style.width = t * 100 + '%';
      wrap.firstElementChild.outerHTML = Art.fuelCellSchematic(S.parts, false, t);
      if (now - lastSpark > 180) { burst(4); Sound.sfx('spark'); lastSpark = now; }
      if (t < 1) { requestAnimationFrame(step); return; }
      S.repairs.fuel = true;
      ['casing', 'crystal', 'wiring'].forEach((k) => { S.parts[k] = true; });
      Sound.sfx('success');
      burst(30);
      wrap.firstElementChild.outerHTML = Art.fuelCellSchematic(S.parts, true, 1);
      wrap.classList.add('flash');
      G.friend(10);
      save();
      $('#modal .x').disabled = false;
      $('.bench-line', el).innerHTML = '<b>FUEL CELL ONLINE.</b> The Dandelion\'s engine glows teal for the first time since the crash.';
      $('.bench-rows', el).innerHTML = '';
      $('.bench-foot', el).innerHTML = '<button class="btn big" id="btn-done">Nice!</button>';
      onModalClose = () => dlg('fuelDone');
      $('#btn-done', el).addEventListener('click', closeModal);
    };
    requestAnimationFrame(step);
  }

  // ---------- Bolt sorting mini-game ----------
  let bolts = [], boltSel = null;
  function openBoltGame() {
    const sizes = ['S', 'S', 'S', 'M', 'M', 'M', 'L', 'L', 'L'];
    bolts = sizes.map((s, i) => ({ id: i, size: s, done: false }));
    bolts.push({ id: 99, size: 'sock', done: false });
    for (let i = bolts.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[bolts[i], bolts[j]] = [bolts[j], bolts[i]]; }
    boltSel = null;
    modal('Sort the Bolt Bin', '<div class="boltgame"></div>', { cls: 'bolt-modal' });
    renderBolts('Tap a bolt, then tap the bin it belongs in.');
  }
  function renderBolts(msg) {
    const el = $('#modal .boltgame');
    if (!el) return;
    const counts = { S: 0, M: 0, L: 0 };
    bolts.forEach((b) => { if (b.done && counts[b.size] != null) counts[b.size]++; });
    el.innerHTML = `<p class="bolt-msg">${esc(msg)}</p>
      <div class="pile">${bolts.filter((b) => !b.done).map((b) => `<button class="bolt ${boltSel === b.id ? 'sel' : ''}" data-b="${b.id}" aria-label="${b.size === 'sock' ? 'sock' : 'bolt'}">${b.size === 'sock' ? Art.sock : Art.bolt(b.size)}</button>`).join('')}</div>
      <div class="bins">${['S', 'M', 'L'].map((s) => `<button class="bin" data-bin="${s}"><span class="bin-label">${{ S: 'Small', M: 'Medium', L: 'Large' }[s]}</span><span class="bin-count">${counts[s]}/3</span></button>`).join('')}</div>`;
    $$('[data-b]', el).forEach((b) => b.addEventListener('click', () => {
      const bo = bolts.find((x) => x.id === +b.dataset.b);
      if (bo.size === 'sock') { Sound.sfx('error'); renderBolts('Racket: "Leave the sock. The sock stays. Don\'t ask about the sock."'); return; }
      boltSel = bo.id; Sound.sfx('click'); renderBolts(msg);
    }));
    $$('[data-bin]', el).forEach((b) => b.addEventListener('click', () => {
      if (boltSel == null) { renderBolts('Pick a bolt first.'); return; }
      const bo = bolts.find((x) => x.id === boltSel);
      if (bo.size === b.dataset.bin) {
        bo.done = true; boltSel = null; Sound.sfx('clank');
        if (bolts.filter((x) => x.size !== 'sock' && !x.done).length === 0) { finishBolts(); return; }
        renderBolts(['Clink.', 'Clank. Nice.', 'Into the bin it goes.', 'Satisfying.'][Math.random() * 4 | 0]);
      } else {
        Sound.sfx('error');
        renderBolts(['Racket: "That\'s a medium. Are you even looking?"', 'Racket: "Wrong bin. I can hear it being wrong."', 'Racket: "Nope. Size matters. In bolts."'][Math.random() * 3 | 0]);
      }
    }));
  }
  function finishBolts() {
    S.jobs.bolts = 'done';
    G.friend(4);
    G.addCredits(10);
    Sound.sfx('success');
    closeModal();
    say('r', '...Sorted by size AND thread pitch? Who hurt you? Ten credits.', 400);
  }

  // ---------- Map ----------
  function openMap() {
    const locs = [
      { id: 'crash', name: 'Crash Site', note: 'Where the Dandelion came down.', open: true },
      { id: 'garage', name: "Racket's Garage", note: S.flags.sawDiag ? 'Grumpy raccoon. Good tools.' : 'Check your ship first.', open: S.flags.sawDiag },
      { id: 'junkyard', name: 'The Junkyard', note: S.flags.phase1 ? 'Racket: "Tomorrow. Bring snacks."' : 'Racket: "Not yet. Fuel cell first."', open: false },
      { id: 'woods', name: 'The Deep Woods', note: 'A fallen tree blocks the path. Something to cut through it would help.', open: false },
      { id: 'canyon', name: '???', note: 'Racket goes quiet about the canyon.', open: false },
      { id: 'station', name: '???', note: 'A light blinks on the ridge some nights.', open: false },
    ];
    modal('Map', `<div class="map">${locs.map((l) => `<button class="loc ${l.open ? '' : 'locked'} ${l.id === S.scene ? 'here' : ''}" data-loc="${l.id}" ${l.open ? '' : 'disabled'}>
      <span class="loc-name">${l.name}${l.id === S.scene ? ' <em>(you are here)</em>' : ''}</span><span class="loc-note">${esc(l.note)}</span></button>`).join('')}</div>`, { cls: 'map-modal' });
    $$('[data-loc]', $('#modal')).forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.loc;
      closeModal();
      if (id !== S.scene) setTimeout(() => go(id), 250);
    }));
  }

  // ---------- Menu ----------
  function openMenu() {
    modal('Menu', `<div class="menu">
      <button class="btn" data-m="sound">${Sound.prefs.sound ? 'Sound: ON' : 'Sound: OFF'}</button>
      <button class="btn" data-m="music">${Sound.prefs.music ? 'Music: ON' : 'Music: OFF'}</button>
      <button class="btn" data-m="title">Back to title</button>
      <button class="btn danger" data-m="reset">Restart from the beginning</button>
      <p class="muted small">Progress saves automatically in this browser.</p></div>`, { cls: 'menu-modal' });
    $$('[data-m]', $('#modal')).forEach((b) => b.addEventListener('click', () => {
      const m = b.dataset.m;
      if (m === 'sound') { Sound.toggleSound(); updateHud(); openMenu(); }
      if (m === 'music') { Sound.toggleMusic(); updateHud(); openMenu(); }
      if (m === 'title') { closeModal(); showTitle(); }
      if (m === 'reset') {
        b.outerHTML = '<div class="confirm"><span>Erase all progress?</span><button class="btn danger" data-m2="yes">Yes, restart</button><button class="btn" data-m2="no">Cancel</button></div>';
        $('[data-m2="yes"]').addEventListener('click', () => { closeModal(); newGame(); });
        $('[data-m2="no"]').addEventListener('click', openMenu);
      }
    }));
  }

  // ---------------------------------------------------------------------------
  // STORY BEATS
  // ---------------------------------------------------------------------------
  function introDone() {
    S.flags.metRacket = true;
    S.jobs = { radio: 'open', bolts: 'open', scrap: 'open' };
    save();
    card('Racket hitches the Dandelion to a tow truck held together with duct tape and spite. Ten minutes later, it\'s sitting in his bay.', () => {
      S.flags.shipTowed = true;
      refresh();
      say('r', "Well? Crash site's that way. Shoo.", 300);
    });
  }
  function nightScene() {
    card('Later that night...', () => {
      S.flags.noodles = true;
      S.pos.garage = 340;
      G.tmp.face = -1;
      refresh();
      setTimeout(() => dlg('noodles'), 400);
    });
  }
  function phaseEnd() {
    S.flags.phase1 = true;
    S.pos.garage = 820;
    save();
    render();
    updateHud();
    const close = card('', null, {
      title: 'End of Phase 1',
      noTap: true,
      html: `<div class="phase-end">
        <p>The fuel cell hums, the Dandelion glows, and somebody gave you a key on a raccoon keychain.</p>
        <p class="opinion">Racket's opinion of you: <em>${TIER_NAMES[G.tier()]}</em></p>
        <p class="muted">Coming next: <b>The Junkyard</b> (thruster parts, a cutting torch, a grumpy scrap dealer), then <b>The Deep Woods</b>.</p>
        <div class="row"><button class="btn big" id="pe-stay">Keep exploring</button><button class="btn" id="pe-title">Back to title</button></div></div>`,
    });
    $('#pe-stay').addEventListener('click', () => { Sound.sfx('click'); close(); });
    $('#pe-title').addEventListener('click', () => { Sound.sfx('click'); close(); setTimeout(showTitle, 460); });
  }

  // ---------------------------------------------------------------------------
  // IDLE BANTER
  // ---------------------------------------------------------------------------
  setInterval(() => {
    if (S.scene !== 'garage' || !S.flags.metRacket || isBlocked()) return;
    const now = Date.now();
    if (now - lastInput > 22000 && now - lastIdle > 26000) {
      lastIdle = now;
      const pool = DATA.idle[Math.min(G.tier(), DATA.idle.length - 1)];
      let line = pool[Math.random() * pool.length | 0];
      if (line.includes('radio') && !S.flags.radioFixed) line = pool[0];
      say('r', line);
    }
  }, 1000);
  document.addEventListener('pointerdown', () => { lastInput = Date.now(); }, true);

  // ---------------------------------------------------------------------------
  // HUD + TRAY INPUT
  // ---------------------------------------------------------------------------
  $('#hud').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    Sound.init();
    const a = b.dataset.act;
    if (a !== 'sound' && a !== 'music' && (Dlg.open || busy || !$('#card').classList.contains('hidden'))) return;
    Sound.sfx('click');
    if (a === 'hint') { sceneEl.classList.add('reveal'); setTimeout(() => sceneEl.classList.remove('reveal'), 1800); }
    if (a === 'ship') openShip();
    if (a === 'map') openMap();
    if (a === 'menu') openMenu();
    if (a === 'sound') { Sound.toggleSound(); updateHud(); }
    if (a === 'music') { Sound.toggleMusic(); updateHud(); }
  });
  $('#inv').addEventListener('click', (e) => {
    const b = e.target.closest('[data-item]');
    if (!b || Dlg.open) return;
    Sound.sfx('click');
    setSel(sel === b.dataset.item ? null : b.dataset.item);
  });

  // ---------------------------------------------------------------------------
  // TITLE / NEW GAME / CONTINUE
  // ---------------------------------------------------------------------------
  function showTitle() {
    const t = $('#title');
    $('#title-art').innerHTML = Art.titleArt();
    $('#btn-continue').hidden = !loadSave();
    t.classList.remove('hidden');
    requestAnimationFrame(() => t.classList.add('show'));
    syncTitleToggles();
  }
  function hideTitle() {
    const t = $('#title');
    t.classList.remove('show');
    setTimeout(() => t.classList.add('hidden'), 500);
  }
  function syncTitleToggles() {
    $('#t-sound').classList.toggle('off', !Sound.prefs.sound);
    $('#t-music').classList.toggle('off', !Sound.prefs.music);
  }
  function newGame() {
    S = fresh();
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
    G.tmp = {};
    sel = null;
    hideTitle();
    render(); updateHud(); renderTray();
    Sound.setAmbience('forest');
    card('Somewhere over the forest moon of Verdance, a little scout ship called the Dandelion was having a very bad day.', () => {
      Sound.sfx('clank'); shake();
      card('KRRR-THOOOM.', () => {
        save();
        setTimeout(() => dlg('wake'), 300);
      });
    });
  }
  function continueGame() {
    const d = loadSave();
    if (!d) { newGame(); return; }
    S = d; G.tmp = {}; sel = null;
    hideTitle();
    if (Sound.prefs.music && S.flags.radioFixed && S.station < Sound.stations.length) Sound.setStation(S.station);
    refresh();
    Sound.setAmbience(SCENES[S.scene].amb);
    // Resume an interrupted story beat
    if (S.repairs.fuel && !S.flags.noodles) setTimeout(() => dlg('fuelDone'), 500);
    else if (S.flags.noodles && !S.flags.phase1) setTimeout(() => dlg('noodles'), 500);
    else if (S.flags.metRacket && !S.flags.shipTowed) { S.flags.shipTowed = true; refresh(); }
    else SCENES[S.scene].onEnter();
  }
  $('#btn-new').addEventListener('click', () => {
    Sound.init();
    Sound.sfx('click');
    if (loadSave()) {
      const box = $('.title-btns');
      if (!box.querySelector('.confirm')) {
        box.insertAdjacentHTML('beforeend', '<div class="confirm"><span>Start over? Your saved game will be erased.</span><button class="btn danger" id="t-yes">Start over</button><button class="btn" id="t-no">Cancel</button></div>');
        $('#t-yes').addEventListener('click', () => { box.querySelector('.confirm').remove(); newGame(); });
        $('#t-no').addEventListener('click', () => box.querySelector('.confirm').remove());
      }
      return;
    }
    newGame();
  });
  $('#btn-continue').addEventListener('click', () => { Sound.init(); Sound.sfx('click'); continueGame(); });
  $('#t-sound').addEventListener('click', () => { Sound.init(); Sound.toggleSound(); syncTitleToggles(); updateHud(); });
  $('#t-music').addEventListener('click', () => { Sound.init(); Sound.toggleMusic(); syncTitleToggles(); updateHud(); });

  // ---------------------------------------------------------------------------
  // BOOT
  // ---------------------------------------------------------------------------
  $('#defs').innerHTML = `<defs>${Art.DEFS}</defs>`;
  render(); updateHud(); renderTray();
  showTitle();
})();
