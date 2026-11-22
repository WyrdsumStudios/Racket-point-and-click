/* Racket's Garage — engine.js
 * State, scenes, hotspots, walking, dialogue, inventory, modals, saving.
 * Phase 1: crash site + garage + fuel cell. Phase 2: junkyard + woods edge + thrusters.
 */
(() => {
  const SAVE_KEY = 'rackets-garage-save-v1';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const val = (v, ...a) => (typeof v === 'function' ? v(...a) : v);

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  const fresh = () => ({
    v: 2, scene: 'crash', inv: ['datapad'], flags: {}, friend: 0, credits: 0,
    parts: { casing: false, crystal: false, wiring: false, nozzles: false, gasket: false, starcrystal: false, chip: false },
    repairs: { fuel: false, thrusters: false, nav: false },
    jobs: { radio: 'hidden', bolts: 'hidden', scrap: 'hidden', bolts2: 'hidden', tune: 'hidden', wires: 'hidden', bolts3: 'hidden' },
    sold: [], talked: {}, piles: { tires: 0, appliances: 0, shiny: 0 },
    pos: { crash: 560, garage: 820, junkyard: 300, woods: 1250, roof: 800, deep: 300, glade: 1250, wreck: 300 }, station: 0, played: {},
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
      return {
        ...f, ...d, flags: { ...d.flags }, parts: { ...f.parts, ...d.parts }, repairs: { ...f.repairs, ...d.repairs },
        jobs: { ...f.jobs, ...d.jobs }, pos: { ...f.pos, ...d.pos }, talked: { ...d.talked }, piles: { ...f.piles, ...d.piles }, sold: d.sold || [], played: { ...d.played },
      };
    } catch (e) { return null; }
  }
  // Bring older saves forward (Phase 1 saves keep working).
  function migrate() {
    if (S.flags.phase1) ['bolts2', 'tune', 'wires'].forEach((j) => { if (S.jobs[j] === 'hidden') S.jobs[j] = 'open'; });
    if (S.flags.phase2 && S.jobs.bolts3 === 'hidden') S.jobs.bolts3 = 'open';
    S.v = 3;
  }

  // ---------------------------------------------------------------------------
  // GAME API (used by data*.js dialogue functions and minigames.js)
  // ---------------------------------------------------------------------------
  const TIER_NAMES = ['Unimpressed', 'Grudgingly tolerable', 'Growing on him', "Fond (he'd deny it)", 'Family'];
  const G = {
    get S() { return S; },
    tmp: {},
    has: (id) => S.inv.includes(id),
    give(id, quiet) {
      if (!S.inv.includes(id)) S.inv.push(id);
      // a torch and its fuel snap together on their own
      if (G.has('cutting_torch') && G.has('torch_fuel')) {
        S.inv = S.inv.filter((i) => i !== 'torch_fuel');
        S.flags.torchFueled = true;
        setTimeout(() => say('c', 'The fuel canister clicks into the torch. FSSSHHH. Oh, that is a good sound.'), 900);
      }
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
    introDone, finishRadio, returnItem, nightScene, phaseEnd,
    vexIntroDone, tradeHubcap, fireThrusters, roofScene,
    giveWasher, wreckStoryDone, reconcileScene, reconcileDone, sporesDone, patchScene, wearPatch, dlg: (id) => dlg(id),
  };
  window.G = G;

  // ---------------------------------------------------------------------------
  // SCENES
  // ---------------------------------------------------------------------------
  const F = () => S.flags;
  const pryOnBoard = () => !S.flags.pryTaken || S.flags.pryReturned;
  const mittsOnCouch = () => !S.flags.mittsTaken || S.flags.mittsReturned;
  const racketAtJunk = () => S.scene === 'junkyard' && !S.flags.racketLeftJunk;
  // Racket's spot: the bench normally, the couch during noodle night, by the crane on the first junkyard trip.
  const rX = () => (S.scene === 'junkyard' ? 600 : S.scene === 'wreck' ? 1300 : S.flags.noodles && !S.flags.phase1 ? 150 : 1090);
  const vexX = () => (S.scene === 'garage' ? 640 : 1395);
  const VEX_X = 1395;
  const BENCH_ITEMS = ['cell_casing', 'charge_crystal', 'wiring', 'thruster_nozzles', 'gasket', 'copper_sheet', 'ember_resin', 'star_crystal', 'nav_chip', 'broken_scanner', 'resonance_coil'];
  const P3 = () => !!S.flags.phase2;

  const SCENES = {
    garage: {
      name: "Racket's Garage", floor: 800, amb: 'garage',
      bg: () => Art.garageBg(), fg: () => Art.garageFg(),
      entry: [1440, 1310],
      hs: [
        { id: 'window', label: 'Window', hit: [70, 140, 272, 148], walk: 240, draw: () => Art.garage.window(), act: actWindow },
        { id: 'radio', label: () => (F().radioFixed ? 'Radio' : 'Busted radio'), hit: [184, 250, 140, 94], walk: 250, accepts: ['spare_fuse'], draw: () => Art.garage.radio(F().radioFixed), act: actRadio },
        { id: 'rocket', label: 'Toy rocket', hit: [506, 96, 54, 58], walk: 540, draw: () => Art.garage.shelfRocket(), act: () => say('c', "A little toy rocket, carefully dusted. The only clean thing in this whole garage.") },
        { id: 'jobs', label: 'Job board', hit: [358, 194, 132, 154], walk: 430, draw: () => Art.garage.jobBoard(S), act: openJobs },
        { id: 'terminal', label: 'Computer terminal', hit: [488, 388, 152, 134], walk: 570, draw: () => Art.garage.terminal(S), act: openTerminal },
        { id: 'mug', label: 'Mug', hit: [640, 460, 44, 60], walk: 640, draw: () => Art.garage.mug(), act: actMug },
        { id: 'pegboard', label: () => (pryOnBoard() ? 'Pegboard (pry bar)' : 'Pegboard'), hit: [690, 172, 324, 240], walk: 900, draw: () => Art.garage.pegboard(S, pryOnBoard()), act: actPegboard },
        { id: 'workbench', label: 'Workbench', hit: [680, 420, 258, 200], walk: 840, accepts: BENCH_ITEMS, draw: () => Art.garage.workbench(S), act: openWorkbench },
        { id: 'drawer', label: 'Workbench drawer', show: () => P3() && !F().scannerTaken, hit: [852, 514, 150, 40], walk: 900, draw: () => Art3.drawer(S), act: actDrawer },
        { id: 'floorboard', label: 'Loose floorboard', show: () => F().scannerFixed && !F().sporesTaken, hit: [430, 756, 130, 46], walk: 500, draw: () => Art3.hidden.floorboard(), act: actFloorboard },
        { id: 'bolts', label: 'Bolt bin', hit: [940, 428, 78, 64], walk: 940, draw: () => Art.garage.boltBin(S.jobs.bolts === 'done' && (!F().phase1 || S.jobs.bolts2 === 'done')), act: actBolts },
        { id: 'couch', label: () => (mittsOnCouch() && !F().crystalTaken ? 'Couch (oven mitts?)' : F().phase1 && !F().cupTaken ? 'Couch (noodle cups)' : 'Couch'), hit: [40, 550, 384, 180], walk: 250, draw: () => Art.garage.couch(S, mittsOnCouch()), act: actCouch },
        { id: 'ship', label: 'The Dandelion', show: () => F().shipTowed, hit: [1186, 360, 394, 290], walk: 1290, draw: () => Art.garage.bayShip(S, G.tmp.testFire), act: () => openShip() },
        { id: 'racket', label: 'Racket', hit: () => [rX() - 68, 250, 140, 550], walk: () => (rX() > 600 ? 945 : 330), anyItem: true, draw: () => `<g transform="translate(${rX()},800)">${Art.racket(G.tmp.testFire ? 'laugh' : G.rMood())}</g>`, act: actRacket },
        { id: 'vexG', label: 'Vex', show: () => !!G.tmp.vexVisit, hit: [580, 250, 130, 560], walk: 760, draw: () => `<g transform="translate(640,806) scale(-1,1)">${Art2.vex('neutral')}</g>`, act: () => say('v', "Don't mind me. Just standing in a tree house.") },
        { id: 'exit', label: 'To the crash site', hit: [1440, 740, 150, 110], walk: 1470, draw: () => Art.garage.exit(), act: () => go('crash') },
      ],
      onEnter() { if (!F().metRacket) setTimeout(() => dlg('intro'), 500); },
    },
    crash: {
      name: 'Crash Site', floor: 812, amb: 'forest',
      bg: () => Art.crashBg(S), fg: () => '',
      entry: (from) => (from === 'woods' ? [60, 300] : [1440, 1250]),
      hs: [
        { id: 'toWoods', label: 'To the woods edge', show: () => F().phase1, hit: [20, 380, 110, 110], walk: 130, draw: () => Art2.crashToWoods(), act: () => go('woods') },
        { id: 'critter', label: 'Fuzzy critter', hit: [356, 394, 80, 74], walk: 400, draw: () => Art.crash.critter(), act: actCritter },
        { id: 'crystals', label: 'Glowing crystal vein', hit: [36, 500, 170, 212], walk: 200, accepts: ['oven_mitts'], draw: () => Art.crash.crystals(!F().crystalTaken), act: actCrystals },
        { id: 'locker', label: 'Emergency locker', hit: [184, 596, 120, 116], walk: 250, draw: () => Art.crash.locker(!F().fuseTaken), act: actLocker },
        { id: 'ship', label: 'The Dandelion', show: () => !F().shipTowed, hit: [480, 410, 600, 290], walk: 720, draw: () => Art.crash.ship(), act: () => openShip(true) },
        { id: 'tracks', label: 'Tow tracks', show: () => F().shipTowed, hit: [560, 650, 420, 90], walk: 760, act: () => say('c', "Tow tracks, heading for the garage. He hauled the Dandelion off with a truck held together by duct tape and spite.") },
        { id: 'scrap', label: 'Bent hull panel', show: () => !F().scrapTaken, hit: [304, 700, 130, 64], walk: 372, draw: () => Art.crash.hullScrap(), act: actScrap },
        { id: 'debris', label: 'Wreckage', hit: [1040, 596, 220, 114], walk: 1110, accepts: ['pry_bar'], draw: () => Art.crash.debris(!F().casingTaken), act: actDebris },
        { id: 'antenna', label: 'Folded antenna', show: () => !F().antennaTaken, hit: [1256, 640, 110, 92], walk: 1300, draw: () => Art.crash.antenna(), act: actAntenna },
        { id: 'meteorite', label: 'Something buried', show: () => F().scannerFixed && !F().meteoriteTaken, hit: [890, 750, 100, 70], walk: 940, draw: () => Art3.hidden.meteorite(), act: () => findHidden('meteoriteTaken', 'meteorite', 'The scanner pings... a meteorite! Buried right by my crater. Fellow falling-from-the-sky enjoyer.') },
        { id: 'sprouts', label: 'Mushroom sprouts', show: () => !!F().mushroomsPlanted, hit: [600, 740, 140, 60], walk: 670, draw: () => `<g>${[620, 650, 680, 710].map((x, i) => `<g transform="translate(${x},${790 - (i % 2) * 8})"><rect x="-2" y="-14" width="4" height="14" fill="#e8e2d0"/><path d="M-9,-12 Q0,-26 9,-12Z" fill="#c0392b"/><circle cx="-3" cy="-16" r="1.5" fill="#fff"/></g>`).join('')}</g>`, act: () => say('c', "Racket's mushroom patch, replanted. Tiny red caps already. He visits them every morning and pretends he's just 'checking the crater'.") },
        { id: 'exit', label: () => (F().metRacket ? "To Racket's garage" : 'Light through the trees'), hit: [1420, 400, 180, 290], walk: 1470, draw: () => Art.crash.exit(), act: actCrashExit },
      ],
      onEnter() {},
    },
    junkyard: {
      name: "Vex's Junkyard", floor: 812, amb: 'junk',
      bg: () => Art2.junkBg(), fg: () => Art2.junkFg(),
      entry: [60, 300],
      hs: [
        { id: 'tires', label: 'Tire Mountain', hit: [20, 520, 170, 200], walk: 170, draw: () => Art2.junk.tires(pileLeft('tires')), act: () => actPile('tires') },
        { id: 'crane', label: () => (F().leverIn ? 'Crane cab (lever)' : 'Crane cab'), hit: [196, 470, 152, 170], walk: 270, accepts: ['crane_lever'], draw: () => Art2.junk.crane(S), act: actCraneCab },
        { id: 'breaker', label: 'Breaker box', hit: [368, 548, 76, 100], walk: 410, draw: () => Art2.junk.breaker(S), act: actBreaker },
        { id: 'shiny', label: 'Shiny pile', hit: [450, 610, 160, 110], walk: 520, draw: () => Art2.junk.shiny(pileLeft('shiny')), act: () => actPile('shiny') },
        { id: 'wreck', label: 'Hauler-7 wreck', hit: () => (F().craneLifted ? [636, 340, 330, 180] : [636, 520, 330, 190]), walk: 800, draw: () => Art2.junk.wreck(S), act: actWreck },
        { id: 'nozzles', label: 'Thruster nozzles', show: () => F().craneLifted && !F().nozzlesTaken, hit: [700, 630, 200, 86], walk: 800, accepts: ['cutting_torch'], act: actNozzles },
        { id: 'appliances', label: 'Appliance heap', hit: [980, 500, 210, 220], walk: 1080, draw: () => Art2.junk.appliances(pileLeft('appliances')), act: () => actPile('appliances') },
        { id: 'booth', label: 'Hubcap wall', hit: [1214, 350, 150, 100], walk: 1180, draw: () => Art2.junk.booth(S), act: actHubcapWall },
        { id: 'vex', label: 'Scrapqueen Vex', hit: [1330, 250, 130, 560], walk: 1205, anyItem: true, draw: () => `<g transform="translate(${VEX_X},806)">${Art2.vex(F().craneLifted ? 'smug' : 'neutral')}</g>`, act: actVex },
        { id: 'washer', label: 'Something gold', show: () => F().scannerFixed && !F().washerTaken, hit: [600, 740, 80, 60], walk: 640, draw: () => Art3.hidden.washer(), act: () => findHidden('washerTaken', 'lucky_washer', 'The scanner pings... a gold washer, trodden into the dirt. Hang on. Vex wears washers.') },
        { id: 'racketJ', label: 'Racket', show: racketAtJunk, hit: [532, 250, 140, 550], walk: 480, draw: () => `<g transform="translate(600,806)">${Art.racket('grump')}</g>`, act: () => say('r', "Don't look at me. This is Vex's circus.") },
        { id: 'exit', label: "Back to Racket's garage", hit: [20, 740, 150, 110], walk: 110, draw: () => Art2.junk.exit(), act: () => go('garage') },
      ],
      onEnter() { if (!F().vexMet) setTimeout(() => dlg('vexIntro'), 500); },
    },
    woods: {
      name: 'Woods Edge', floor: 812, amb: 'forest',
      bg: () => Art2.woodsBg(), fg: () => '',
      entry: [1440, 1250],
      hs: [
        { id: 'ember', label: 'Ember-bark tree', hit: [100, 380, 220, 330], walk: 300, accepts: ['cutting_torch', 'noodle_cup'], draw: () => Art2.woods.ember(S), act: actEmber },
        { id: 'log', label: 'Fallen tree', hit: [420, 560, 840, 160], walk: 820, accepts: ['cutting_torch'], draw: () => (F().logCut ? Art3.logCut() : Art2.woods.log(S)), act: actLog },
        { id: 'toDeep', label: 'Into the Deep Woods', show: () => !!F().logCut, hit: [740, 470, 160, 140], walk: 815, draw: () => Art3.toDeep(), act: () => go('deep') },
        { id: 'path', label: 'Dark path', show: () => !F().logCut, hit: [740, 440, 160, 110], walk: 820, act: () => say('c', 'Two yellow eyes blink at me from the dark. Something growls. I wave. It growls again, but... friendlier?') },
        { id: 'critter', label: 'Fuzzy critter', hit: [1006, 518, 70, 70], walk: 1040, draw: () => Art2.woods.critter(), act: actWoodsCritter },
        { id: 'flowers', label: 'Bell flowers', hit: [1320, 700, 170, 110], walk: 1400, draw: () => Art2.woods.flowers(), act: () => { Sound.sfx('sparkle'); say('c', 'Bell-shaped flowers. When the wind blows, they actually chime. I love this moon.'); } },
        { id: 'exit', label: 'Back to the crash site', hit: [1440, 740, 150, 110], walk: 1470, draw: () => Art2.woods.exit(), act: () => go('crash') },
      ],
      onEnter() {
        if (!F().woodsSeen) { F().woodsSeen = true; save(); setTimeout(() => say('c', "The edge of the Deep Woods. It's darker in there. And it's... humming?"), 300); }
      },
    },
    deep: {
      name: 'The Deep Woods', floor: 820, amb: 'forest',
      bg: () => Art3.deepBg(), fg: () => '',
      entry: (from) => (from === 'glade' ? [820, 820] : from === 'wreck' ? [1440, 1200] : [60, 300]),
      hs: [
        { id: 'mossback', label: 'Sleeping mossback', hit: [80, 590, 290, 160], walk: 380, draw: () => Art3.deep.mossback(), act: actMossback },
        { id: 'drifters', label: 'Drifters', hit: [940, 200, 260, 200], walk: 1060, draw: () => Art3.deep.drifters(), act: () => { Sound.sfx('sparkle'); say('c', 'Floating jelly-creatures, drifting like slow balloons. One bumps my nose. It feels like a sneeze made of light.'); } },
        { id: 'pip', label: () => (F().pipMet ? 'Pip' : 'Purple critter'), show: () => !F().pipFed, hit: [350, 380, 100, 90], walk: 400, accepts: ['ration_paste'], draw: () => Art3.deep.pipBranch(false), act: actPip },
        { id: 'branch', label: 'Branch', show: () => !!F().pipFed, hit: [220, 430, 240, 50], walk: 340, draw: () => Art3.deep.pipBranch(true), act: () => say('c', "Pip's old branch. Pip has moved to the hollow log and is guarding it with great seriousness.") },
        { id: 'log', label: () => (F().pipFed ? 'Hollow log (shortcut)' : 'Hollow log'), hit: [470, 680, 240, 90], walk: 560, draw: () => Art3.deep.hollowLog(F().pipFed), act: actHollowLog },
        { id: 'north', label: () => (F().gladeLit ? 'Lantern path (to the glade)' : 'Dark path'), hit: [690, 410, 260, 230], walk: 820, act: actNorthPath, draw: () => Art3.deep.northPath(F().gladeLit) },
        { id: 'roots', label: () => (F().rootsCleared ? 'Path east (old wreck)' : 'Tangled roots'), hit: [1260, 390, 310, 330], walk: 1300, act: actRoots, draw: () => Art3.deep.roots(F().rootsCleared) },
        { id: 'exit', label: 'Back to the woods edge', hit: [20, 780, 150, 100], walk: 110, draw: () => Art3.deep.exit(), act: () => go('woods') },
      ],
      onEnter() { if (!F().deepSeen) { F().deepSeen = true; save(); setTimeout(() => dlg('deepIntro'), 300); } },
    },
    glade: {
      name: 'The Glade', floor: 820, amb: 'forest',
      bg: () => Art3.gladeBg(), fg: () => '',
      entry: [1440, 1250],
      hs: [
        { id: 'tree', label: 'The ancient glowing tree', hit: [620, 260, 360, 380], walk: 760, act: actElderTree },
        { id: 'crystals', label: 'Crystals in the roots', show: () => !F().starTaken, hit: [860, 630, 200, 100], walk: 960, draw: () => Art3.glade.crystals(S), act: actStarCrystals },
        { id: 'crystals2', label: 'Crystals in the roots', show: () => !!F().starTaken, hit: [860, 630, 200, 100], walk: 960, draw: () => Art3.glade.crystals(S), act: () => say('c', 'The other crystals hum softly. The tree only gave me the one I needed.') },
        { id: 'pool', label: 'Still pool', hit: [130, 700, 380, 110], walk: 420, act: () => say('c', 'The pool reflects the blossoms so perfectly it looks like a second tree, growing down into the stars.') },
        { id: 'exit', label: 'Back to the Deep Woods', hit: [1440, 740, 150, 110], walk: 1470, draw: () => Art3.glade.exit(), act: () => go('deep') },
      ],
      onEnter() { if (!F().gladeSeen) { F().gladeSeen = true; save(); setTimeout(() => dlg('gladeIntro'), 300); } },
    },
    wreck: {
      name: 'The Old Wreck', floor: 820, amb: 'forest',
      bg: () => Art3.wreckBg(), fg: () => '',
      entry: [60, 300],
      hs: [
        { id: 'cockpit', label: 'Cockpit', hit: [220, 340, 250, 210], walk: 380, draw: () => Art3.wreck.cockpit(S), act: actCockpit },
        { id: 'nameplate', label: 'Nameplate', hit: [596, 330, 240, 64], walk: 700, draw: () => Art3.wreck.nameplate(), act: () => say('c', F().wreckStory ? 'LONG SHOT. Best ship he ever flew.' : 'LONG SHOT. ...Why does that feel familiar?') },
        { id: 'tally', label: 'Scratches on the hull', hit: [620, 470, 300, 150], walk: 760, draw: () => Art3.wreck.tally(), act: () => say('c', F().wreckStory ? 'Two hundred and some days. And then he stopped counting and started building.' : 'Tally marks. Hundreds of them, in groups of five. Somebody was counting days. A lot of days.') },
        { id: 'hold', label: 'Cargo hold', hit: [990, 420, 240, 260], walk: 1100, draw: () => Art3.wreck.hold(S), act: actHold },
        { id: 'racketW', label: 'Racket', show: () => !!G.tmp.racketWreck, hit: [1232, 250, 140, 560], walk: 1150, draw: () => `<g transform="translate(1300,806)">${Art.racket('soft')}</g>`, act: () => {} },
        { id: 'exit', label: 'Back to the Deep Woods', hit: [20, 780, 150, 100], walk: 110, draw: () => Art3.wreck.exit(), act: () => go('deep') },
      ],
      onEnter() { if (!F().wreckSeen) { F().wreckSeen = true; save(); setTimeout(() => dlg('wreckIntro'), 300); } },
    },
    roof: {
      name: 'Garage Roof', floor: 0, amb: 'forest', noCrystal: true,
      bg: () => Art2.roof(S, G.rMood(), 'neutral'), fg: () => '',
      entry: [800, 800], hs: [], onEnter() {},
    },
  };
  const pileLeft = (id) => DATA.piles[id].finds.length - S.piles[id];

  // ---------------------------------------------------------------------------
  // RENDERING
  // ---------------------------------------------------------------------------
  const sceneEl = $('#scene');
  function render() {
    const sc = SCENES[S.scene];
    Art.state.patch = !!S.flags.patch;
    let h = sc.bg();
    for (const hs of sc.hs) {
      if (hs.show && !hs.show()) continue;
      const [x, y, w, hh] = val(hs.hit);
      h += `<g data-hs="${hs.id}" class="hs">${hs.draw ? hs.draw() : ''}<rect class="hit" x="${x}" y="${y}" width="${w}" height="${hh}" rx="18"/></g>`;
    }
    if (!sc.noCrystal) {
      const cx = S.pos[S.scene];
      h += `<g id="crystal" transform="translate(${cx},${sc.floor}) scale(.94)" pointer-events="none"><g class="c-flip" transform="scale(${G.tmp.face || 1},1)"><g class="c-bob">${Art.crystal(G.tmp.cMood || 'neutral')}</g></g></g>`;
    }
    h += sc.fg() + Art.overlays();
    sceneEl.innerHTML = h;
  }
  function refresh() { render(); updateHud(); renderTray(); save(); }

  function objective() {
    const f = S.flags;
    if (!f.sawDiag) return "Check the ship's diagnostics.";
    if (!f.metRacket) return 'Find help. There\'s a light through the trees.';
    if (!S.repairs.fuel) {
      const have = DATA.parts.filter((p) => S.parts[p.key] || G.has(p.item)).length;
      if (have === 3) return 'Assemble the fuel cell at the workbench.';
      return `Fix the fuel cell: casing, charge crystal, wiring (${have}/3 found).`;
    }
    if (!f.phase1) return 'Talk to Racket.';
    if (!S.repairs.thrusters) {
      if (!f.vexMet) return 'Head to the Junkyard. Open the map.';
      if (!f.craneLifted) return `Get Vex's crane running: lever ${f.leverIn ? '✔' : '✗'}, power ${f.cranePower ? '✔' : '✗'}.`;
      const noz = S.parts.nozzles || G.has('thruster_nozzles'), gas = S.parts.gasket || G.has('gasket');
      const n = (noz ? 1 : 0) + (f.torchFueled || noz ? 1 : 0) + (gas ? 1 : 0);
      if (noz && gas) return 'Fit the thrusters at the workbench.';
      return `Fix the thrusters: nozzle set, cutting torch, heat-proof gasket (${n}/3).`;
    }
    if (!f.phase2) return 'Enjoy the view.';
    if (!S.repairs.nav) {
      if (!f.logCut) return 'Cut through the fallen tree at the Woods Edge.';
      const star = S.parts.starcrystal || G.has('star_crystal'), chip = S.parts.chip || G.has('nav_chip');
      const n = (star ? 1 : 0) + (f.scannerFixed ? 1 : 0) + (chip ? 1 : 0);
      if (n === 3) return 'Calibrate and boot the navigation at the workbench.';
      return `Fix the navigation: star-chart crystal, scanner, nav chip (${n}/3).`;
    }
    if (!f.phase3) return 'Talk to Racket.';
    return 'Phase 3 complete! Hull plating and the engine core are next.';
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
  const itemName = (id) => val(DATA.items[id].name, G);
  function itemDesc(id) {
    const it = DATA.items[id];
    if (!it) return '';
    if (S.flags.metRacket && it.r) return { who: 'Racket says', text: val(it.r, G) };
    return { who: 'Crystal thinks', text: val(it.c || it.r, G) };
  }
  function renderTray(flash) {
    const inv = $('#inv');
    const slots = Math.max(8, S.inv.length);
    let h = '';
    for (let i = 0; i < slots; i++) {
      const id = S.inv[i];
      h += id
        ? `<button class="slot${sel === id ? ' sel' : ''}${flash === id ? ' flash' : ''}" data-item="${id}" aria-label="${esc(itemName(id))}">${Art.icon(id)}</button>`
        : `<div class="slot empty"></div>`;
    }
    inv.innerHTML = h;
    const d = sel ? itemDesc(sel) : null;
    $('#desc').innerHTML = d
      ? `<div class="desc-name">${esc(itemName(sel))}</div><div class="desc-text"><span class="desc-who">${d.who}:</span> ${esc(d.text)}</div><div class="desc-hint">Now tap something in the scene to use it, or tap the item again to put it away.</div>`
      : `<div class="desc-text muted">${DEFAULT_DESC}</div>`;
    $('#stage').classList.toggle('using', !!sel);
  }
  function setSel(id) { sel = id; renderTray(); }

  // ---------------------------------------------------------------------------
  // BUBBLES, TOASTS, CARDS
  // ---------------------------------------------------------------------------
  const bubbleTimers = {};
  const NAMES = { r: 'Racket', v: 'Vex' };
  function say(who, text, delay = 0) {
    const run = () => {
      const stage = $('#bubbles');
      $$(`.bubble.${who}`, stage).forEach((b) => b.remove());
      const pos = who === 'r' ? [rX(), 240] : who === 'v' ? [vexX(), 230] : who === 'c' ? [S.pos[S.scene], 330] : [800, 870];
      const b = document.createElement('div');
      b.className = `bubble ${who}`;
      b.innerHTML = `${NAMES[who] ? `<span class="b-name">${NAMES[who]}</span>` : ''}${esc(text)}`;
      b.style.top = pos[1] / 9 + '%';
      b.style.left = pos[0] / 16 + '%';
      stage.appendChild(b);
      // keep the bubble inside the stage, but leave its tail pointing at the speaker
      const sw = stage.clientWidth, bw = b.offsetWidth, ax = pos[0] / 1600 * sw;
      const left = clamp(ax, bw / 2 + 8, sw - bw / 2 - 8);
      b.style.left = left + 'px';
      b.style.setProperty('--tail', clamp(bw / 2 + (ax - left), 18, bw - 18) + 'px');
      Sound.sfx(who === 'r' ? 'blipR' : who === 'c' ? 'blipC' : who === 'v' ? 'blipV' : 'blipN');
      const dur = 2400 + text.length * 48;
      clearTimeout(bubbleTimers[who]);
      bubbleTimers[who] = setTimeout(() => { b.classList.add('out'); setTimeout(() => b.remove(), 300); }, dur);
      b.addEventListener('click', () => b.remove());
    };
    // a delayed line is dropped if the player has moved to another scene meanwhile
    const scene = S.scene;
    if (delay) setTimeout(() => { if (S.scene === scene) run(); }, delay); else run();
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
    if (!opts.noTap) setTimeout(() => el.addEventListener('click', close, { once: true }), 350);
    return close;
  }
  function shake() { const s = $('#stage'); s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake'); }

  // ---------------------------------------------------------------------------
  // WALKING
  // ---------------------------------------------------------------------------
  function walkTo(x, cb) {
    const sc = SCENES[S.scene];
    if (sc.noCrystal) { cb && cb(); return; }
    x = clamp(x, 60, 1540);
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
  const findHs = (id) => SCENES[S.scene].hs.find((h) => h.id === id);
  const label = (hs) => val(hs.label);

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
    tip.textContent = sel ? `Use ${itemName(sel)} on ${label(hs)}` : label(hs);
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
    const wx = val(hs.walk);
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
      const from = S.scene;
      S.scene = scene;
      const [startX, walkX] = val(SCENES[scene].entry, from);
      S.pos[scene] = startX;
      G.tmp.face = walkX >= startX ? 1 : -1;
      setSel(null);
      $('#bubbles').innerHTML = '';
      refresh();
      Sound.setAmbience(SCENES[scene].amb);
      stage.classList.remove('fade');
      setTimeout(() => {
        busy = false;
        walkTo(walkX, () => SCENES[scene].onEnter());
      }, 350);
    }, 450);
  }
  function travel(id) {
    if (id === 'junkyard' && !F().vexMet) {
      if (S.scene === 'garage') { Dlg.start({ ...DATA.dlg.toJunkyard, end: () => go('junkyard') }); return; }
      card("Racket meets you at the junkyard gate in his tow truck, grumbling before you even get out.", () => go('junkyard'));
      return;
    }
    go(id);
  }

  // ---------------------------------------------------------------------------
  // HOTSPOT ACTIONS — GARAGE
  // ---------------------------------------------------------------------------
  function actWindow() {
    say('c', 'Two moons tonight. The crash was almost worth the view.');
    if (F().metRacket) say('r', G.tier() >= 2 ? "...Yeah. It's a good view." : "It's geology. Don't get sentimental.", 2600);
  }
  function actMug() {
    say('c', "WORLD'S OKAYEST MECHANIC. The handle's been glued back on. Twice.");
    if (F().metRacket && !F().mugJoke) { F().mugJoke = true; say('r', 'Three times, now. Thanks to somebody.', 3000); }
  }
  function actRadio() {
    if (F().radioFixed) {
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
      if (!F().metRacket) { say('c', "Somebody's radio. I shouldn't mess with it without asking."); return; }
      G.take('spare_fuse');
      dlg('radioFix');
      return;
    }
    say('c', 'Just static. And something that might be a very sad trombone.');
    if (F().metRacket) say('r', "It's busted. Needs a fuse. Like my spirit needs a vacation.", 2600);
  }
  function finishRadio() {
    F().radioFixed = true;
    S.jobs.radio = 'done';
    S.station = 0;
    Sound.setStation(0);
    G.friend(6);
    G.addCredits(15);
    refresh();
  }
  function actPegboard() {
    if (!F().metRacket) { say('c', "Lots of tools. Not mine, though."); return; }
    if (pryOnBoard()) {
      if (F().casingTaken) { say('c', "I'm done with the pry bar. It looks happy back on its hook."); return; }
      F().pryTaken = true; F().pryReturned = false;
      G.give('pry_bar');
      say('c', 'Mind if I borrow this?');
      say('r', G.tier() >= 2 ? 'Go ahead, lynx. Bring it back straight.' : 'Bring it back straight.', 1500);
      refresh();
      return;
    }
    say('c', 'A chalk outline where the pry bar goes. He drew an outline. Of course he did.');
  }
  function actCouch() {
    if (mittsOnCouch() && !F().crystalTaken && F().metRacket) {
      F().mittsTaken = true; F().mittsReturned = false;
      G.give('oven_mitts');
      say('c', "Oven mitts. On the couch. I'm not going to ask.");
      say('r', "Don't ask.", 2200);
      refresh();
      return;
    }
    if (F().phase1 && !F().cupTaken) {
      F().cupTaken = true;
      G.give('noodle_cup');
      say('c', "One of our noodle cups from the other night. Could be useful for... something.");
      say('r', "That's my cup. ...Keep it. Don't make it weird.", 2600);
      refresh();
      return;
    }
    if (F().noodles) { say('c', F().cupTaken ? 'His noodle cup, still on the arm of the couch. He kept it. Of course he did.' : 'Two empty noodle cups, side by side. Neither of us threw ours out yet.'); return; }
    say('c', 'The couch sags in a very raccoon-shaped way. Weirdly comfy.');
  }
  function actBolts() {
    if (!F().metRacket) { say('c', 'A bin of bolts. And... a sock?'); return; }
    if (S.jobs.bolts !== 'done') { playJob('bolts'); return; }
    if (F().phase1 && S.jobs.bolts2 !== 'done') { playJob('bolts2'); return; }
    if (P3() && S.jobs.bolts3 !== 'done') { playJob('bolts3'); return; }
    playJob(P3() ? 'bolts3' : F().phase1 ? 'bolts2' : 'bolts');
  }
  function actRacket(item) {
    if (item) {
      if (item === 'pry_bar' && F().casingTaken) { dlg('retPry'); return; }
      if (item === 'oven_mitts' && F().crystalTaken) { dlg('retMitts'); return; }
      if (item === 'mushroom_spores') { dlg('spores'); return; }
      say('r', DATA.giveRacket[item] || 'What am I supposed to do with that?');
      return;
    }
    G.tmp.again = false;
    dlg('hub');
  }
  function returnItem(id) {
    G.take(id);
    if (id === 'pry_bar') { F().pryReturned = true; G.friend(4); }
    if (id === 'oven_mitts') { F().mittsReturned = true; G.friend(3); }
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
    if (F().crystalTaken) { say('c', 'The vein still hums, but I took the only piece that broke loose.'); return; }
    if (G.has('oven_mitts')) {
      F().crystalTaken = true;
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
    say('c', F().metRacket ? "OW! Hot! Stupidly hot! ...Mitts. He said mitts." : "OW! Hot! I'll need something heat-proof to grab that.");
  }
  function actLocker() {
    if (F().fuseTaken) {
      if (P3() && !F().pasteTaken) { F().pasteTaken = true; G.give('ration_paste'); say('c', 'My old ration bars, now officially paste. Someone, somewhere, might want this.'); refresh(); return; }
      say('c', F().pasteTaken ? 'An empty emergency locker. It did its job.' : "Just my ration bars, which have reached a new state of matter. They can stay."); return;
    }
    F().fuseTaken = true;
    G.give('spare_fuse');
    say('c', 'My emergency locker! One spare ship-grade fuse... and ration bars that are now a paste.');
    refresh();
  }
  function actScrap() {
    F().scrapTaken = true;
    G.give('hull_scrap');
    say('c', "A chunk of hull plating. Can't fix it, but somebody out there buys scrap, right?");
    refresh();
  }
  function actAntenna() {
    F().antennaTaken = true;
    G.give('antenna');
    say('c', 'My comm antenna, folded like a lawn chair. Sorry, buddy.');
    refresh();
  }
  function actDebris() {
    if (F().casingTaken) { say('c', 'Just a sad, bent hull plate now.'); return; }
    if (G.has('pry_bar')) {
      Sound.sfx('clank');
      shake();
      setTimeout(() => {
        Sound.sfx('clank');
        F().casingTaken = true;
        G.give('cell_casing');
        say('c', 'Hnnngh... got it! The fuel cell casing. Dented, but the seals look good.');
        refresh();
      }, 500);
      return;
    }
    say('c', F().metRacket
      ? "Something's glinting under that hull plate. Way too heavy to lift by paw. ...His pry bar would do it."
      : "Something's glinting under that hull plate. Way too heavy to lift by paw. I need something to pry with.");
  }
  function actCrashExit() {
    if (!F().sawDiag) { say('c', 'Diagnostics first. Panic second.'); return; }
    go('garage');
  }

  // ---------------------------------------------------------------------------
  // HOTSPOT ACTIONS — JUNKYARD
  // ---------------------------------------------------------------------------
  const FOUND_LINES = {
    crane_lever: "A red lever handle, snapped clean off. That has to be from the crane!",
    copper_sheet: "A sheet of copper from inside an old fridge. Soft, heat-proof... gasket material!",
    gilded_hubcap: "Ooh. A gold-plated hubcap. Vex is going to lose her mind.",
  };
  function actPile(id) {
    const P = DATA.piles[id], i = S.piles[id];
    if (racketAtJunk()) { say('c', "Let's talk to the magpie first."); return; }
    if (i >= P.finds.length) { say('c', P.empty); return; }
    S.piles[id] = i + 1;
    Sound.sfx('rummage');
    shake();
    const item = P.finds[i];
    setTimeout(() => {
      if (!item) { say('c', P.nothing); refresh(); return; }
      G.give(item);
      say('c', FOUND_LINES[item] || `Found: ${itemName(item)}. ${pickLine()}`);
      refresh();
    }, 450);
  }
  const pickLine = () => ['Junk. But sellable junk.', 'Somebody on JunkNet will want this.', "One person's trash is... still trash. But sellable."][Math.random() * 3 | 0];
  function actCraneCab(item) {
    if (racketAtJunk()) { say('c', "Let's talk to the magpie first."); return; }
    if (!F().leverIn) {
      if (item === 'crane_lever' || G.has('crane_lever')) {
        G.take('crane_lever'); F().leverIn = true;
        Sound.sfx('clank');
        say('c', "Click. Bertha's lever is back where it belongs.");
        if (!F().cranePower) say('v', "Now the breakers, kid! Box on her base!", 2200);
        refresh();
        return;
      }
      say('c', "The control lever's snapped off. Just a sad little stub. The handle has to be around here somewhere.");
      return;
    }
    if (!F().cranePower) { Sound.sfx('error'); say('c', "Lever's in. I pull it and... nothing. Not even a groan. No power."); return; }
    if (F().craneLifted) { say('c', "Big Bertha's holding the wreck up. Good girl."); return; }
    liftWreck();
  }
  function liftWreck() {
    busy = true;
    Sound.sfx('crane');
    say('c', 'Here goes... PULL!');
    const w = $('.wreck-lift', sceneEl), c = $('.cable', sceneEl);
    requestAnimationFrame(() => { w && w.classList.add('up'); c && c.classList.add('up'); });
    setTimeout(() => Sound.sfx('clank'), 900);
    setTimeout(() => Sound.sfx('clank'), 1800);
    setTimeout(() => {
      F().craneLifted = true;
      busy = false;
      refresh();
      say('v', 'SHE LIVES! BERTHA LIVES! Oh, I could kiss you. I won\'t. But I could.');
      say('c', "There! Under the wreck, a pair of copper thruster nozzles. They're welded to the frame, though.", 3600);
    }, 2800);
  }
  function actBreaker() {
    if (racketAtJunk()) { say('c', "Let's talk to the magpie first."); return; }
    if (F().cranePower) { say('c', 'All green. Big Bertha has power.'); return; }
    Mini.breakers(() => {
      F().cranePower = true;
      Sound.sfx('crane');
      refresh();
      say('c', 'Every breaker green! I can hear Bertha humming.');
      say('v', F().leverIn ? "Power's on! Now pull her lever!" : "Power! Now she just needs her lever back!", 2400);
    });
  }
  function actWreck() {
    if (F().craneLifted) { say('c', F().nozzlesTaken ? 'Bertha is still holding the wreck up. Show-off.' : 'Bertha is holding the wreck up. The nozzles are right underneath.'); return; }
    say('c', "The Hauler-7 wreck. Underneath, I can just see a gleam of copper. Way, way too heavy to lift.");
  }
  function actNozzles() {
    if (!F().torchGot) { say('c', "They're welded to the wreck's frame. I need something to cut them free."); return; }
    if (!F().torchFueled) { Sound.sfx('error'); say('c', 'Click... click. The torch is empty. No fuel.'); return; }
    busy = true;
    sceneEl.insertAdjacentHTML('beforeend', Art2.junk.cutting());
    Sound.sfx('torch'); setTimeout(() => Sound.sfx('torch'), 700); setTimeout(() => Sound.sfx('torch'), 1400);
    setTimeout(() => {
      busy = false;
      F().nozzlesTaken = true;
      G.give('thruster_nozzles');
      refresh();
      say('c', 'Got them! Twin thruster nozzles, barely a scratch.');
      say('v', "Careful with those— oh. You're actually good at that. Annoying.", 2600);
    }, 2100);
  }
  function actHubcapWall() {
    say('c', F().torchGot ? 'The hubcap wall, complete. The gold one in the middle practically glows. Vex keeps looking at it.' : 'Dozens of hubcaps, polished to a shine. There is one empty gap, bottom row. It looks... sad.');
  }
  function actVex(item) {
    if (!F().vexMet) { dlg('vexIntro'); return; }
    if (item) {
      if (item === 'gilded_hubcap' && !F().torchGot) { dlg('vexTrade'); return; }
      if (item === 'flight_recorder') { dlg('vexRecorder'); return; }
      if (item === 'lucky_washer') { giveWasher(); return; }
      say('v', DATA.giveVex[item] || "I don't buy in person. JunkNet. Different name. Not telling you which.");
      return;
    }
    G.tmp.vexAgain = false;
    dlg('vexHub');
  }
  function giveWasher() {
    G.take('lucky_washer');
    F().washerGiven = true;
    say('v', "MY WASHER! Twenty years! I blamed Racket for this! ...Here. Twenty credits. And if you tell anyone I teared up, I'll deny it.");
    G.addCredits(20);
    refresh();
  }
  function vexIntroDone() {
    F().vexMet = true;
    F().racketLeftJunk = true;
    G.friend(0);
    refresh();
  }
  function tradeHubcap() {
    G.take('gilded_hubcap');
    F().torchGot = true;
    G.give('cutting_torch');
    refresh();
  }

  // ---------------------------------------------------------------------------
  // HOTSPOT ACTIONS — WOODS EDGE
  // ---------------------------------------------------------------------------
  function actEmber() {
    if (F().resinTaken) { say('c', "The ember-bark still glows, but I've got all the resin I need."); return; }
    if (!F().torchGot) { say('c', 'Glowing amber resin, hard as glass and warm to the touch. Heat would soften it.'); return; }
    if (!F().torchFueled) { Sound.sfx('error'); say('c', 'Click... click. No fuel in the torch.'); return; }
    Sound.sfx('torch');
    if (!G.has('noodle_cup')) { say('c', "It's melting! ...and dripping straight into the dirt. I need something to catch it in."); return; }
    G.take('noodle_cup');
    F().resinTaken = true;
    setTimeout(() => {
      G.give('ember_resin');
      say('c', 'FSSSH... the resin melts right into the noodle cup. Smells like burnt caramel!');
      refresh();
    }, 600);
  }
  function actLog() {
    if (F().logCut) { say('c', 'A neat gap in the fallen tree. The path into the Deep Woods is open.'); return; }
    if (F().torchFueled && P3()) {
      busy = true;
      sceneEl.insertAdjacentHTML('beforeend', Art2.junk.cutting().replace(/800/g, '815').replace(/668/g, '640'));
      Sound.sfx('torch'); setTimeout(() => Sound.sfx('torch'), 700); setTimeout(() => Sound.sfx('torch'), 1400);
      setTimeout(() => { Sound.sfx('clank'); F().logCut = true; busy = false; refresh(); say('c', "FSSSSHHH... there! A gap in the log, just wide enough. Here goes nothing."); }, 2200);
      return;
    }
    if (F().torchFueled) {
      F().sawPath = true; save();
      say('c', "I could cut through this with the torch... but it's pitch black in there, and something just growled. Tomorrow. Definitely tomorrow.");
      render();
      return;
    }
    say('c', 'A massive fallen tree blocks the path into the Deep Woods. Way too big to climb. Something that cuts through wood, maybe?');
  }
  const WOODS_CRITTER = ["It's the little six-legged critter from my crash site! It followed me!", "It's guarding the path. Or napping on it. Hard to tell.", "It chirps at the dark path, then at me. I think it wants to show me something in there."];
  function actWoodsCritter() {
    const i = S.talked.wcrit || 0;
    S.talked.wcrit = i + 1;
    say('c', WOODS_CRITTER[i % WOODS_CRITTER.length]);
    save();
  }

  // ---------------------------------------------------------------------------
  // HOTSPOT ACTIONS — PHASE 3
  // ---------------------------------------------------------------------------
  function findHidden(flag, item, line) {
    F()[flag] = true;
    Sound.sfx('sparkle');
    G.give(item);
    say('c', line);
    refresh();
  }
  function actDrawer() {
    F().scannerTaken = true;
    G.give('broken_scanner');
    say('c', 'Under a pile of rags: an old handheld scanner. Cracked lens. Dead as a doornail.');
    say('r', "Huh. My old scanner. Haven't seen that in years. Needs a resonance coil. Haven't seen one of THOSE since—", 2600);
    say('r', "...Doesn't matter. Try the woods.", 7600);
    refresh();
  }
  function actFloorboard() {
    F().sporesTaken = true;
    Sound.sfx('sparkle');
    G.give('mushroom_spores');
    say('c', "The scanner pings under a loose floorboard. Inside: a dented little tin. 'SPORES - MOM'. I should give this to Racket.");
    refresh();
  }
  function sporesDone() {
    G.take('mushroom_spores');
    F().sporesGiven = true; F().mushroomsPlanted = true;
    refresh();
    setTimeout(() => say('n', 'That evening, Racket replants his mushroom patch at the crash site. He hums the whole time.'), 400);
  }
  function actMossback() {
    const i = S.talked.moss || 0; S.talked.moss = i + 1; save();
    say('c', ['A huge, mossy creature, snoring gently. Flowers are growing on its back. It does not care about me at all. Respect.', "It opens one sleepy eye, looks at me, and goes back to sleep. I've been approved.", 'Its snores make the fireflies bounce.'][i % 3]);
  }
  function actPip(item) {
    if (!F().pipMet) { F().pipMet = true; save(); }
    if (item === 'ration_paste' || G.has('ration_paste')) {
      G.take('ration_paste');
      F().pipFed = true;
      Sound.sfx('sparkle');
      refresh();
      say('c', "Pip gobbles the ration paste in three bites, hoots, and flutters down to the hollow log. There's a tunnel through it, glowing faintly!");
      setTimeout(() => say('n', 'Shortcut unlocked: you can now travel straight to the Deep Woods, the Glade and the Old Wreck from the map.'), 3600);
      return;
    }
    const i = S.talked.pip || 0; S.talked.pip = i + 1; save();
    say('c', [
      "The little purple critter from my crash site! It unfolds... WINGS? It's an owl. A six-legged owl. I'm calling you Pip.",
      'Pip sniffs my bag hopefully, then looks at me like I have failed it personally. It wants a snack.',
      "Pip hoots at the hollow log, then at my bag. Something to eat... I think I left ration paste in my emergency locker.",
    ][Math.min(i, 2)]);
  }
  function actHollowLog() {
    if (F().pipFed) { say('c', "Pip's shortcut: a glowing tunnel through the log. Now I can travel straight here from the map. Pip looks extremely proud."); return; }
    say('c', 'A big hollow log. Something glows faintly inside. Too dark to crawl through without a guide.');
  }
  function actNorthPath() {
    if (F().gladeLit) { go('glade'); return; }
    if (!F().gladeHint) { F().gladeHint = true; say('c', "It's pitch black that way. But the fireflies keep drifting toward it... If I catch enough, I could light the path."); setTimeout(() => startFireflies(), 2600); return; }
    startFireflies();
  }
  function startFireflies() {
    Mini.fireflies(() => {
      if (!F().gladeLit) { F().gladeLit = true; G.friend(1); say('c', 'Three firefly lanterns, glowing all the way down the path!'); }
      else bumpPlayed('fireflies');
      refresh();
    });
  }
  function actRoots() {
    if (F().rootsCleared) { go('wreck'); return; }
    Mini.roots(() => {
      if (!F().rootsCleared) { F().rootsCleared = true; say('c', 'The roots shiver and pull apart. There is a path east, and something big and metal at the end of it.'); }
      else bumpPlayed('roots');
      refresh();
    });
  }
  function actElderTree() {
    const i = S.talked.elder || 0; S.talked.elder = i + 1; save();
    say('c', [
      "I put my paw on the bark. It's warm. And under my paw, I swear, something like a heartbeat. Very slow. Very old.",
      'Blossoms drift down around me. Each one glows for a moment on the grass before it fades.',
      'Racket says nobody knows why these old trees grow star crystals. Standing here, I think the tree just likes the sky.',
    ][i % 3]);
  }
  function actStarCrystals() {
    if (!F().scannerFixed) { say('c', 'Dozens of crystals, all glowing the same soft teal. One of them is a star chart... but which one? I need something that can see inside them.'); return; }
    F().starTaken = true;
    Sound.sfx('success');
    G.give('star_crystal');
    say('c', "The scanner pings one crystal brighter than all the rest. It slides free as if the tree is handing it to me. Thank you.");
    refresh();
  }
  function actCockpit() {
    if (!F().wreckStory) {
      G.tmp.racketWreck = true;
      render();
      dlg('wreckStory');
      return;
    }
    if (!F().recorderTaken) {
      F().recorderTaken = true;
      G.give('flight_recorder');
      say('c', "The Long Shot's flight recorder. Still in one piece. Vex should have this.");
      refresh();
      return;
    }
    say('c', 'The faded photo is still tucked in the visor. Two kids, laughing. I left it where it belongs.');
  }
  function actHold() {
    if (F().coilTaken) { say('c', 'Old crates and moss. Nothing left that still works.'); return; }
    F().coilTaken = true;
    Sound.sfx('pickup');
    G.give('resonance_coil');
    say('c', F().wreckStory ? "The resonance coil. Still humming, after all these years. Stubborn." : 'In the cargo hold, under moss: a resonance coil, still faintly humming. That is exactly what the scanner needs!');
    refresh();
  }
  function wreckStoryDone() {
    F().wreckStory = true;
    G.tmp.racketWreck = false;
    refresh();
    say('c', '...I think that was the most he has ever said in one go.', 600);
  }
  function reconcileScene() {
    $('#bubbles').innerHTML = '';
    G.take('flight_recorder');
    F().recorderGiven = true;
    save();
    card('That evening, a battered truck rattles up to the garage, and somebody very nervous knocks on the bay door.', () => {
      S.scene = 'garage';
      S.pos.garage = 900;
      G.tmp.vexVisit = true;
      G.tmp.face = 1;
      refresh();
      Sound.setAmbience('garage');
      setTimeout(() => dlg('reconcile'), 500);
    });
  }
  function reconcileDone() {
    F().reconciled = true;
    refresh();
    setTimeout(() => {
      say('v', "I'm leaving. Before somebody sees me being nice.");
      setTimeout(() => { G.tmp.vexVisit = false; refresh(); }, 2600);
    }, 400);
  }
  function patchScene() {
    $('#bubbles').innerHTML = '';
    card('Later, when the garage is quiet...', () => {
      S.pos.garage = 900; G.tmp.face = 1;
      refresh();
      setTimeout(() => dlg('patch'), 400);
    });
  }
  function wearPatch() {
    G.take('long_shot_patch');
    F().patch = true;
    refresh();
  }
  const bumpPlayed = (id) => { S.played[id] = (S.played[id] || 0) + 1; G.addCredits(2); say('r', 'Again? ...Fine. Two credits. Go wild.', 300); };

  // ---------------------------------------------------------------------------
  // DIALOGUE RUNNER
  // ---------------------------------------------------------------------------
  const NPC = { r: { name: 'Racket', portrait: (m) => Art.portrait('r', m || G.rMood()) }, v: { name: 'Vex', portrait: (m) => Art2.vexPortrait(m) } };
  const Dlg = {
    open: false, node: null, queue: [], typing: null, waiting: false,
    el: $('#dlg'), log: $('#dlg-log'), choices: $('#dlg-choices'),
    resolve(n) {
      let node = typeof n === 'string' ? DATA.dlg[n] : n;
      if (typeof node === 'function') node = node(G);
      return node;
    },
    setNpc(who, mood) {
      $('#p-r').innerHTML = NPC[who].portrait(mood);
      $('.dlg-portrait.left .pname').textContent = NPC[who].name;
      this.el.classList.toggle('npc-vex', who === 'v');
    },
    start(id) {
      const node = this.resolve(id);
      this.open = true;
      this.log.innerHTML = '';
      this.choices.innerHTML = '';
      const cast = node.cast || ['r', 'c'];
      this.el.classList.toggle('solo', !cast.includes('r') && !cast.includes('v'));
      this.setNpc(cast.includes('v') ? 'v' : 'r');
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
      if (n.choices) { this.renderChoices(n.choices.filter((c) => !c.if || c.if(G))); return; }
      this.finish();
    },
    finish() {
      const n = this.node;
      if (n.go) {
        const g = val(n.go, G);
        if (g) { this.run(this.resolve(g)); return; }
      }
      this.close();
      if (n.end) n.end(G);
    },
    show([who, moodIn, text]) {
      const t = val(text, G), mood = val(moodIn, G);
      if (who === 'r' || who === 'v') this.setNpc(who, mood);
      if (who === 'c') $('#p-c').innerHTML = Art.portrait('c', mood);
      this.el.dataset.speaker = who === 'v' ? 'r' : who;
      const b = document.createElement('div');
      b.className = `line ${who}`;
      b.innerHTML = who === 'n' ? '<span class="txt"></span>' : `<span class="who">${NAMES[who] || 'Crystal'}</span><span class="txt"></span>`;
      this.log.appendChild(b);
      this.log.scrollTop = this.log.scrollHeight;
      const span = $('.txt', b);
      let i = 0;
      this.waiting = false;
      $('#dlg-next').classList.remove('show');
      clearInterval(this.typing);
      const blip = who === 'r' ? 'blipR' : who === 'c' ? 'blipC' : who === 'v' ? 'blipV' : 'blipN';
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
  let onModalClose = null, modalHideTimer = null;
  function modal(title, body, opts = {}) {
    const m = $('#modal');
    clearTimeout(modalHideTimer);
    $('.modal-card', m).className = `modal-card ${opts.cls || ''}`;
    $('.modal-title', m).textContent = title;
    $('.modal-body', m).innerHTML = body;
    $('#modal .x').disabled = false;
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
    modalHideTimer = setTimeout(() => m.classList.add('hidden'), 220);
    const cb = onModalClose; onModalClose = null;
    render(); updateHud(); renderTray(); save();
    if (cb) setTimeout(cb, 240);
  }
  $('#modal .x').addEventListener('click', () => { Sound.sfx('click'); closeModal(); });
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
  G.ui = { modal, closeModal, say };

  // ---------- Ship status / diagnostics ----------
  const SYSTEMS = [
    { id: 'fuel', name: 'Fuel Cell', diag: 'CRITICAL. Casing ejected, charge crystal shattered, wiring fried.' },
    { id: 'thrusters', name: 'Thrusters', diag: 'OFFLINE. Nozzles crumpled on impact.', lockedHint: 'Racket: "Junkyard. One thing at a time."' },
    { id: 'nav', name: 'Navigation', diag: 'CONFUSED. Current location: "???". Current mood: "???".', lockedHint: 'Needs a nav chip. Someone online is selling one. Suspiciously.' },
    { id: 'hull', name: 'Hull Plating', diag: 'HAS SEEN BETTER DAYS. Three breaches, one dent shaped like a face.', lockedHint: 'Something big and metal crashed out in the canyon, years ago...' },
    { id: 'core', name: 'Engine Core', diag: 'STABLE-ISH. Making a noise. A new noise.', lockedHint: 'Racket goes quiet when you ask about this one.' },
  ];
  function partRows(key) {
    const rep = DATA.repairs[key];
    let rows = rep.parts.map((p) => {
      const st = S.parts[p.key] ? 'installed' : G.has(p.item) ? 'found' : 'missing';
      const lbl = { installed: 'Installed', found: 'Found: bring it to the workbench', missing: F().metRacket ? p.where : 'Missing' }[st];
      return `<li class="part ${st}"><span class="chk">${st === 'installed' ? '✔' : st === 'found' ? '●' : '○'}</span><span class="pn">${p.name}</span><span class="pw">${esc(lbl)}</span></li>`;
    }).join('');
    if (key === 'thrusters') {
      const ok = F().torchFueled || F().nozzlesTaken;
      const lbl = ok ? 'Fueled and ready' : F().torchGot ? 'Got it, but it needs fuel (JunkNet)' : 'Vex has one. She wants something shiny.';
      rows = rows.replace('</li>', `</li><li class="part ${ok ? 'installed' : F().torchGot ? 'found' : 'missing'}"><span class="chk">${ok ? '✔' : F().torchGot ? '●' : '○'}</span><span class="pn">Cutting torch (tool)</span><span class="pw">${esc(lbl)}</span></li>`);
    }
    if (key === 'nav') {
      const sf = F().scannerFixed;
      const lbl = sf ? 'Fixed and pinging' : F().scannerTaken ? 'Needs a resonance coil (somewhere in the woods)' : "Racket's old one is in a garage drawer";
      rows += `<li class="part ${sf ? 'installed' : F().scannerTaken ? 'found' : 'missing'}"><span class="chk">${sf ? '✔' : F().scannerTaken ? '●' : '○'}</span><span class="pn">Working scanner</span><span class="pw">${esc(lbl)}</span></li>`;
    }
    return rows;
  }
  function openShip(fromCrash) {
    const first = fromCrash && !F().sawDiag;
    const online = (S.repairs.fuel ? 1 : 0) + (S.repairs.thrusters ? 1 : 0) + (S.repairs.nav ? 1 : 0);
    const rows = SYSTEMS.map((s) => {
      const done = S.repairs[s.id];
      const active = (s.id === 'fuel' && !done) || (s.id === 'thrusters' && S.repairs.fuel && F().phase1 && !done) || (s.id === 'nav' && S.repairs.thrusters && P3() && !done);
      if (done) return `<div class="sys done"><div class="sys-head"><span class="sys-name">${s.name}</span><span class="chip ok">ONLINE</span></div><p class="sys-note">${s.id === 'fuel' ? "Humming happily. Racket pretends he isn't proud of it." : s.id === 'thrusters' ? 'Test-fired. Roars like a dragon with hiccups.' : 'CONFIDENT. Current location: Verdance. Current mood: hopeful.'}</p></div>`;
      if (active) return `<div class="sys active"><div class="sys-head"><span class="sys-name">${s.name}</span><span class="chip bad">${s.id === 'fuel' ? 'CRITICAL' : 'OFFLINE'}</span></div><p class="sys-note">${esc(s.diag)}</p><ul class="parts">${partRows(s.id)}</ul></div>`;
      return `<div class="sys locked"><div class="sys-head"><span class="sys-name">${s.name}</span><span class="chip warn">${first ? 'DAMAGED' : 'LOCKED'}</span></div>
        <p class="sys-note">${esc(first || !F().metRacket ? s.diag : s.lockedHint)}</p></div>`;
    }).join('');
    const intro = first
      ? `<p class="lead">DANDELION // SELF-DIAGNOSTIC v2.1<br><span class="muted">Running... running... oh dear.</span></p>`
      : `<p class="lead">Ship repairs: ${online} / 5 systems online.</p>`;
    modal(first ? 'Ship Diagnostics' : 'The Dandelion', intro + `<div class="systems">${rows}</div>`, {
      cls: 'ship-modal',
      onClose: first ? () => { F().sawDiag = true; updateHud(); save(); dlg('afterDiag'); } : null,
    });
  }

  // ---------- Job board + chores ----------
  const JOB_GAMES = {
    bolts: { run: (cb) => Mini.bolts(1, cb), reward: 10, f: 4, line: '...Sorted by size AND thread pitch? Who hurt you? Ten credits.' },
    bolts2: { run: (cb) => Mini.bolts(2, cb), reward: 12, f: 3, line: "Nuts with nuts, washers with washers. Vex is gonna hate how organised this is. Twelve credits." },
    tune: { run: (cb) => Mini.tune(cb), reward: 12, f: 3, line: "Listen to that idle. Smooth. ...Okay, you've got good hands. Twelve credits." },
    wires: { run: (cb) => Mini.wires(cb), reward: 12, f: 3, line: "Not a single spark. Who ARE you? Twelve credits. And my respect. Don't spend it all at once." },
    bolts3: { run: (cb) => Mini.bolts(3, cb), reward: 14, f: 3, line: "You sorted the springs AND left the socks alone. You understand this place now, lynx. Fourteen credits." },
  };
  const FUN = [
    { id: 'fireflies', name: 'FIREFLY LANTERNS', body: 'Catch fireflies, light lanterns. Pip referees.', ok: () => F().gladeLit, run: (cb) => Mini.fireflies(cb) },
    { id: 'roots', name: 'ROOT MAZE', body: 'Turn the roots, guide the light.', ok: () => F().rootsCleared, run: (cb) => Mini.roots(cb) },
    { id: 'starmap', name: 'STAR MAP', body: 'Rebuild constellations. Yes, the Wrench counts.', ok: () => F().navCalibrated, run: (cb) => Mini.starmap(cb) },
    { id: 'breakers', name: "BERTHA'S BREAKERS", body: 'Get every breaker green.', ok: () => F().cranePower, run: (cb) => Mini.breakers(cb) },
    { id: 'gasket', name: 'GASKET CUTTING', body: 'Trace the outline, 1 to 16.', ok: () => S.repairs.thrusters, run: (cb) => Mini.gasket(cb) },
  ];
  const REPLAY_LINES = ['Again? ...Fine. Two credits. Go wild.', "You just like doing that, huh. Me too. Don't tell anyone.", 'Two credits. And a nod. *nods*', 'You know these are chores, right? ...Okay. Two credits.'];
  function playJob(id) {
    const J = JOB_GAMES[id];
    const replay = S.jobs[id] === 'done';
    J.run(() => {
      if (!replay) {
        S.jobs[id] = 'done';
        G.friend(J.f);
        G.addCredits(J.reward);
        say('r', J.line, 300);
      } else {
        G.addCredits(2);
        say('r', REPLAY_LINES[Math.random() * REPLAY_LINES.length | 0], 300);
      }
      refresh();
    });
  }
  const scrapSold = () => S.sold.filter((i) => i === 'hull_scrap' || i === 'antenna').length;
  function openJobs() {
    if (!F().metRacket) { say('c', 'A job board. Somebody around here has chores.'); return; }
    const jobs = DATA.jobs.filter((j) => !j.phase || F().phase1);
    const notes = jobs.map((j, i) => {
      const st = S.jobs[j.id];
      let status = st === 'done' ? 'DONE' : 'OPEN';
      if (j.id === 'scrap' && st !== 'done') status = `${scrapSold()}/2 SOLD`;
      const btn = JOB_GAMES[j.id] ? `<button class="btn note-btn" data-job="${j.id}">${st === 'done' ? 'Play again · 2 cr' : 'Start'}</button>` : '';
      return `<div class="note n${i % 5} ${st === 'done' ? 'done' : ''}"><div class="pin"></div><h3>${j.title}</h3><p>${esc(j.body)}</p><div class="note-foot"><span>${j.reward}</span><b>${status}</b></div>${btn}${st === 'done' ? '<div class="stamp">PAID</div>' : ''}</div>`;
    }).join('');
    const fun = FUN.filter((g) => g.ok());
    const funNotes = fun.length ? `<div class="fun-head">FOR FUN · 2 cr a go</div>${fun.map((g) => `<div class="note fun"><div class="pin"></div><h3>${g.name}</h3><p>${esc(g.body)}</p><button class="btn note-btn" data-fun="${g.id}">Play</button></div>`).join('')}` : '';
    modal('Job Board', `<div class="board">${notes}${funNotes}
      <div class="note n3 flavor"><div class="pin"></div><h3>LOST</h3><p>My patience. If found, keep it.</p></div>
      <div class="note n4 flavor"><div class="pin"></div><h3>NO SOLICITORS</h3><p>This means you, Gary.${F().vexMet ? ' And you, Vex.' : ''}</p></div></div>`, { cls: 'jobs-modal' });
    $$('[data-job]', $('#modal')).forEach((b) => b.addEventListener('click', () => { Sound.sfx('click'); playJob(b.dataset.job); }));
    $$('[data-fun]', $('#modal')).forEach((b) => b.addEventListener('click', () => {
      Sound.sfx('click');
      const g = FUN.find((x) => x.id === b.dataset.fun);
      g.run(() => { S.played[g.id] = (S.played[g.id] || 0) + 1; G.addCredits(2); say('r', REPLAY_LINES[Math.random() * REPLAY_LINES.length | 0], 300); refresh(); });
    }));
  }

  // ---------- JunkNet terminal ----------
  let termTab = 'buy';
  function openTerminal() {
    if (!F().metRacket) { say('c', "Someone's computer. Better not snoop. ...Yet."); return; }
    modal('JunkNet', '', { cls: 'term-modal' });
    renderTerminal();
  }
  const owned = (id) => (id === 'wiring' ? G.has('wiring') || S.parts.wiring : id === 'fuel' ? !!F().fuelBought : id === 'nav' ? !!F().chipBought || (P3() && (G.has('nav_chip') || S.parts.chip)) : false);
  const buyable = (l) => l.id === 'wiring' || l.id === 'fuel' || (l.id === 'nav' && P3());
  const listing = (l) => (l.id === 'nav' && P3() ? { ...l, ...DATA.navBack } : l);
  function renderTerminal(msg) {
    const body = $('#modal .modal-body');
    if (!F().termUnlocked) {
      body.innerHTML = `<div class="crt"><pre>JUNKNET OS v0.3 (definitely licensed)
USER: RACKET
PASSWORD: ________</pre>
        <div class="sticky">Password hint: what everybody calls me that I HATE. -R</div>
        <div class="pw-opts">${['password', 'trashpanda', 'grumpyface'].map((p) => `<button class="term-btn" data-pw="${p}">${p}</button>`).join('')}</div>
        <pre class="term-msg">${msg ? esc(msg) : ''}</pre></div>`;
      $$('[data-pw]', body).forEach((b) => b.addEventListener('click', () => {
        const p = b.dataset.pw;
        if (p === 'trashpanda') {
          F().termUnlocked = true; Sound.sfx('success'); save();
          renderTerminal('ACCESS GRANTED. Welcome back, RACKET.\n1 unread message: "stop calling me trash panda" (from: yourself)');
          if (!F().pwJoke) { F().pwJoke = true; setTimeout(() => { if (S.scene === 'garage') say('r', 'You figured out my password. Great. Fantastic. Love that.'); }, 600); }
        } else {
          Sound.sfx('error');
          renderTerminal(p === 'password' ? 'ACCESS DENIED. He is not THAT careless.' : 'ACCESS DENIED. Accurate, though.');
        }
      }));
      return;
    }
    const sellable = S.inv.filter((i) => DATA.sellPrices[i]);
    const listings = DATA.listings.filter((l) => !l.phase || (l.phase === 2 ? F().phase1 : F().phase2)).map(listing).map((l) => {
      let btn;
      if (owned(l.id)) btn = `<span class="tag ok">PURCHASED</span>`;
      else if (l.status) btn = `<span class="tag">${l.status}</span>`;
      else if (buyable(l)) btn = `<button class="term-btn buy" data-buy="${l.id}" ${S.credits < l.price ? 'disabled' : ''}>${S.credits < l.price ? `NEED ${l.price} CR` : `BUY · ${l.price} CR`}</button>`;
      else btn = `<button class="term-btn" data-joke="${l.id}">${l.price.toLocaleString()} CR</button>`;
      return `<div class="listing ${buyable(l) && !owned(l.id) ? 'hot' : ''}"><div class="l-main"><div class="l-name">${esc(l.name)}</div><div class="l-blurb">${esc(l.blurb)}</div>
        <div class="l-seller">seller: ${l.seller} ${'★'.repeat(l.stars)}${'☆'.repeat(5 - l.stars)}</div></div><div class="l-act">${btn}</div></div>`;
    }).join('');
    const sell = sellable.length
      ? sellable.map((i) => { const [buyer, quote] = DATA.buyers[i] || ['scrapmonger_88', 'i buy anything.']; return `<div class="listing"><div class="l-main"><div class="l-name">${esc(itemName(i))}</div><div class="l-blurb">Buyer ${buyer}: "${esc(quote)}"</div></div>
          <div class="l-act"><button class="term-btn buy" data-sell="${i}">SELL · ${DATA.sellPrices[i]} CR</button></div></div>`; }).join('')
      : `<p class="muted">Nothing to sell. Junk from the crash site and the junkyard sells here.</p>`;
    body.innerHTML = `<div class="crt">
      <div class="term-top"><span>JUNKNET · logged in as RACKET</span><span class="term-cr">${S.credits} CR</span></div>
      <div class="term-tabs"><button class="term-tab ${termTab === 'buy' ? 'on' : ''}" data-tab="buy">BUY</button><button class="term-tab ${termTab === 'sell' ? 'on' : ''}" data-tab="sell">SELL${sellable.length ? ` (${sellable.length})` : ''}</button></div>
      ${msg ? `<pre class="term-msg">${esc(msg)}</pre>` : ''}
      <div class="listings">${termTab === 'buy' ? listings : sell}</div></div>`;
    $$('[data-tab]', body).forEach((b) => b.addEventListener('click', () => { termTab = b.dataset.tab; Sound.sfx('click'); renderTerminal(); }));
    $$('[data-joke]', body).forEach((b) => b.addEventListener('click', () => {
      Sound.sfx('error');
      const j = b.dataset.joke;
      renderTerminal(j === 'jar' ? 'INSUFFICIENT INTEREST. Racket: "We are not buying a jar."' : j === 'moss' ? 'PURCHASE BLOCKED BY USER rkt. Reason: "leave the moss alone."' : j === 'muffler' ? `INSUFFICIENT FUNDS. You have ${S.credits} CR. You need 9,999 CR. And a reason.` : j === 'wrench' ? 'INSUFFICIENT FUNDS. The wrench understands. The wrench is always here for you.' : 'INSUFFICIENT FUNDS. Also, rude to even look.');
    }));
    $$('[data-buy]', body).forEach((b) => b.addEventListener('click', () => {
      const l = listing(DATA.listings.find((x) => x.id === b.dataset.buy));
      if (S.credits < l.price || owned(l.id)) return;
      S.credits -= l.price;
      if (l.id === 'fuel') F().fuelBought = true;
      if (l.id === 'nav') F().chipBought = true;
      Sound.sfx('coin'); updateHud(); save();
      closeModal();
      const second = F().droneSeen;
      F().droneSeen = true;
      setTimeout(() => {
        Sound.sfx('drone');
        card(second ? 'The same rattling delivery drone. It looks at you. You look at it. It drops the box and flees again.' : 'Thirty seconds later, a rattling delivery drone kicks open the window, drops a box marked FRAGILE(ISH), and flees into the night.', () => {
          if (l.id === 'wiring') {
            G.give('wiring');
            say('c', 'Copper wiring harness! It has... tiny teeth marks.');
            say('r', "Possum. Classic. It'll work.", 2600);
          } else if (l.id === 'nav') {
            G.give('nav_chip');
            say('c', 'A nav chip! It is wrapped in a pirate flag. Of course it is.');
            say('r', 'Expensive. ...Vex would have given you one for free, you know.', 2600);
          } else {
            G.give('torch_fuel');
            if (!F().torchFueled) say('c', 'Torch fuel! Now I just need a torch to put it in.');
            say('r', "Don't drop that. I mean it. Don't.", 2600);
          }
          refresh();
        });
      }, 300);
    }));
    $$('[data-sell]', body).forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.sell;
      G.take(id);
      S.sold.push(id);
      G.addCredits(DATA.sellPrices[id]);
      const [buyer] = DATA.buyers[id] || ['scrapmonger_88'];
      let m = `SOLD: ${itemName(id)} to ${buyer}.`;
      if (buyer === 'scrapmonger_88') m += ' "pleasure doing business. dont tell anyone."';
      if (scrapSold() >= 2 && S.jobs.scrap !== 'done') {
        S.jobs.scrap = 'done'; G.friend(3);
        m += '\nJOB COMPLETE: Haul scrap.';
        setTimeout(() => { if (S.scene === 'garage') say('r', "You cleaned up my woods AND made money. ...Huh. Efficient."); }, 400);
      }
      save();
      renderTerminal(m);
    }));
  }

  // ---------- Workbench (one repair at a time) ----------
  const BENCH_LINES = {
    casing: 'Seat it. Gently. GENTLY. ...Okay, that works.',
    crystal: 'Careful, that thing bites. Ha. Literally.',
    wiring: 'Red to red. Not that red. The other red. ...Good.',
    nozzles: 'Line up the flange. Torque it down. Hauler-7 nozzles, on a scout ship. Vex would be furious. I love it.',
    gasket: 'Gasket goes between the nozzles and the engine. Seat it flat. ...That seal is perfect. Huh.',
  };
  const currentRepair = () => (!S.repairs.fuel ? 'fuel' : F().phase1 && !S.repairs.thrusters ? 'thrusters' : P3() && !S.repairs.nav ? 'nav' : null);
  const schematic = (key, parts, charged, t) => (key === 'fuel' ? Art.fuelCellSchematic(parts, charged, t) : key === 'thrusters' ? Art2.thrusterSchematic(parts, charged, t) : Art3.navSchematic(parts, charged, t, F().navCalibrated));
  function openWorkbench(item) {
    if (!F().metRacket) return;
    const key = currentRepair();
    if (!key) {
      const next = S.repairs.nav ? 'Fuel cell, thrusters and navigation are online. Next up: <b>hull plating</b> and <b>the engine core</b>. The engine core is making a new noise.' : S.repairs.thrusters ? 'Fuel cell and thrusters are done. Next up: <b>navigation</b>. Racket mutters something about the Deep Woods.' : 'The fuel cell is installed and humming. Next up: <b>thrusters</b>. Racket says the junkyard\'s where you\'ll find them.';
      const done = S.repairs.nav ? 'nav' : S.repairs.thrusters ? 'thrusters' : 'fuel';
      modal('Workbench', `<div class="bench">${schematic(done, { casing: 1, crystal: 1, wiring: 1, nozzles: 1, gasket: 1, starcrystal: 1, chip: 1 }, true, 1)}<p class="lead">${next}</p></div>`, { cls: 'bench-modal' });
      return;
    }
    modal(`Workbench: ${DATA.repairs[key].name}`, '<div class="bench"></div>', { cls: 'bench-modal' });
    renderBench(key);
    if (item) {
      const p = DATA.repairs[key].parts.find((pp) => pp.item === item);
      if (p && !S.parts[p.key]) setTimeout(() => installPart(key, p.key), 300);
      else if ((item === 'copper_sheet' || item === 'ember_resin') && key === 'thrusters') setTimeout(() => craftGasket(), 300);
      else if ((item === 'broken_scanner' || item === 'resonance_coil') && key === 'nav') setTimeout(() => fixScanner(), 300);
    }
  }
  function renderBench(key, justKey, line) {
    const el = $('#modal .bench');
    if (!el) return;
    const rep = DATA.repairs[key];
    const all = rep.parts.every((p) => S.parts[p.key]) && (key !== 'nav' || F().navCalibrated);
    const partsIn = rep.parts.every((p) => S.parts[p.key]);
    let rows = rep.parts.map((p) => {
      const inst = S.parts[p.key], have = G.has(p.item);
      let action = inst ? '<span class="tag ok">✔</span>' : have ? `<button class="btn" data-install="${p.key}">Install</button>` : '<span class="tag">Missing</span>';
      let info = inst ? 'Installed' : have ? 'In your pack. Ready to install.' : esc(p.where);
      if (p.key === 'gasket' && !inst && !have) {
        const c = G.has('copper_sheet'), r = G.has('ember_resin');
        if (c && r) { action = '<button class="btn" data-craft="gasket">Cut gasket</button>'; info = 'Copper sheet + ember resin in your pack. Time to cut!'; }
        else info = `Copper sheet ${c ? '✔' : '✗'} · Ember resin ${r ? '✔' : '✗'}. ${esc(p.where)}`;
      }
      return `<div class="bench-row ${inst ? 'installed' : have ? 'ready' : 'missing'}">
        <div class="bench-icon">${have || inst ? Art.icon(p.item) : '<span>?</span>'}</div>
        <div class="bench-info"><b>${p.name}</b><span>${info}</span></div><div>${action}</div></div>`;
    }).join('');
    if (key === 'nav') {
      const sf = F().scannerFixed, hasS = G.has('broken_scanner'), hasC = G.has('resonance_coil');
      const sAct = sf ? '<span class="tag ok">✔</span>' : hasS && hasC ? '<button class="btn" data-fix="scanner">Fix scanner</button>' : '<span class="tag">Broken</span>';
      const sInfo = sf ? 'Pinging happily. It also reveals hidden things everywhere.' : !F().scannerTaken ? "Racket's old scanner is somewhere in the garage. Try the workbench drawer." : `Scanner ${hasS ? '✔' : '✗'} · Resonance coil ${hasC ? '✔' : '✗'}. A coil might turn up in the woods.`;
      const cAct = F().navCalibrated ? '<span class="tag ok">✔</span>' : partsIn && sf ? '<button class="btn" data-cal="1">Calibrate</button>' : '<span class="tag">Waiting</span>';
      const cInfo = F().navCalibrated ? 'Star map locked in. (Yes, including the Wrench.)' : 'Needs the crystal and chip installed and a working scanner.';
      rows += `<div class="bench-row ${sf ? 'installed' : hasS && hasC ? 'ready' : 'missing'}"><div class="bench-icon">${Art.icon(sf ? 'scanner' : 'broken_scanner')}</div><div class="bench-info"><b>Scanner (tool)</b><span>${sInfo}</span></div><div>${sAct}</div></div>
        <div class="bench-row ${F().navCalibrated ? 'installed' : partsIn && sf ? 'ready' : 'missing'}"><div class="bench-icon">${Art.icon('star_crystal')}</div><div class="bench-info"><b>Star map calibration</b><span>${cInfo}</span></div><div>${cAct}</div></div>`;
    }
    const idle = key === 'fuel'
      ? (all ? "That's all three. Seal it up and charge it. Don't blink." : "Bring me parts. Well, bring the BENCH parts. I'll watch.")
      : key === 'thrusters' ? (all ? "Nozzles on, gasket seated. Let's hear her. Test-fire when you're ready." : 'Nozzles and a gasket. Bring me both and we make some noise.')
        : (all ? 'Calibrated. Boot her up, lynx. Let\'s see where she thinks she is.' : 'Star crystal, nav chip, working scanner. Then we teach her the sky.');
    el.innerHTML = `<div class="schem-wrap">${schematic(key, S.parts, false, 0)}<div class="sparks"></div></div>
      <div class="bench-line"><b>Racket:</b> ${esc(line || idle)}</div>
      <div class="bench-rows">${rows}</div>
      <div class="bench-foot"><div class="charge-bar"><i></i></div><button class="btn big" id="btn-charge" ${all ? '' : 'disabled'}>${key === 'fuel' ? 'Seal &amp; Charge' : key === 'thrusters' ? 'Fit &amp; Test-fire' : 'Boot navigation'}</button></div>`;
    if (justKey) { const g = $(`[data-part="${justKey}"]`, el); if (g) g.classList.add('just'); burst(14); }
    $$('[data-install]', el).forEach((b) => b.addEventListener('click', () => installPart(key, b.dataset.install)));
    $$('[data-craft]', el).forEach((b) => b.addEventListener('click', craftGasket));
    $$('[data-fix]', el).forEach((b) => b.addEventListener('click', fixScanner));
    $$('[data-cal]', el).forEach((b) => b.addEventListener('click', calibrate));
    $('#btn-charge', el).addEventListener('click', () => chargeRepair(key));
  }
  function installPart(key, pk) {
    const p = DATA.repairs[key].parts.find((pp) => pp.key === pk);
    if (!G.has(p.item)) return;
    S.parts[pk] = true;
    G.take(p.item);
    Sound.sfx('clank');
    setTimeout(() => Sound.sfx('spark'), 120);
    renderBench(key, pk, BENCH_LINES[pk]);
    updateHud(); save();
  }
  function craftGasket() {
    if (!(G.has('copper_sheet') && G.has('ember_resin'))) return;
    closeModal();
    setTimeout(() => Mini.gasket(() => {
      G.take('copper_sheet'); G.take('ember_resin');
      G.give('gasket');
      G.friend(2);
      setTimeout(() => openWorkbench(), 350);
    }), 260);
  }
  function fixScanner() {
    if (!(G.has('broken_scanner') && G.has('resonance_coil'))) return;
    G.take('broken_scanner'); G.take('resonance_coil');
    F().scannerFixed = true;
    G.give('scanner');
    G.friend(2);
    Sound.sfx('success');
    renderBench('nav', null, "Hah! She's pinging! Go wave her around everywhere. Old scanners find old secrets. Even in places you've already been.");
    updateHud(); save();
  }
  function calibrate() {
    closeModal();
    setTimeout(() => Mini.starmap(() => {
      F().navCalibrated = true;
      G.friend(2);
      save();
      setTimeout(() => openWorkbench(), 350);
    }), 260);
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
  function chargeRepair(key) {
    const el = $('#modal .bench');
    const btn = $('#btn-charge', el);
    btn.disabled = true; btn.textContent = key === 'fuel' ? 'Charging...' : key === 'thrusters' ? 'Bolting on...' : 'Booting...';
    $$('[data-install],[data-craft],[data-fix],[data-cal]', el).forEach((b) => (b.disabled = true));
    $('#modal .x').disabled = true;
    Sound.sfx('hum', 3);
    const bar = $('.charge-bar i', el), wrap = $('.schem-wrap', el);
    const t0 = performance.now(), dur = 3000;
    let lastSpark = 0;
    $('.bench-line', el).innerHTML = `<b>Racket:</b> ${key === 'fuel' ? 'Here we go. Easy... easy...' : key === 'thrusters' ? 'Torque check... seal check... okay. Okay. This is the fun part.' : 'Star chart loading... chip handshake... come on, girl, find yourself. ...I talk to ships. Shut up.'}`;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      bar.style.width = t * 100 + '%';
      wrap.firstElementChild.outerHTML = schematic(key, S.parts, false, t);
      if (now - lastSpark > 180) { burst(4); Sound.sfx('spark'); lastSpark = now; }
      if (t < 1) { requestAnimationFrame(step); return; }
      S.repairs[key] = true;
      Sound.sfx('success');
      burst(30);
      wrap.firstElementChild.outerHTML = schematic(key, S.parts, true, 1);
      wrap.classList.add('flash');
      G.friend(10);
      save();
      $('#modal .x').disabled = false;
      $('.bench-line', el).innerHTML = key === 'fuel'
        ? '<b>FUEL CELL ONLINE.</b> The Dandelion\'s engine glows teal for the first time since the crash.'
        : key === 'thrusters' ? '<b>THRUSTERS FITTED.</b> Racket is already dragging the bay door open, looking like a kid on his birthday.'
          : '<b>NAVIGATION ONLINE.</b> The star map spins up on the Dandelion\'s console, and it finally knows where it is.';
      $('.bench-rows', el).innerHTML = '';
      $('.bench-foot', el).innerHTML = `<button class="btn big" id="btn-done">${key === 'fuel' ? 'Nice!' : key === 'thrusters' ? "Let's fire her up!" : 'Where are we?'}</button>`;
      onModalClose = () => dlg(key === 'fuel' ? 'fuelDone' : key === 'thrusters' ? 'thrustersFit' : 'navDone');
      $('#btn-done', el).addEventListener('click', closeModal);
    };
    requestAnimationFrame(step);
  }

  // ---------- Map ----------
  function openMap() {
    const f = S.flags;
    const locs = [
      { id: 'crash', name: 'Crash Site', note: 'Where the Dandelion came down.', open: true },
      { id: 'garage', name: "Racket's Garage", note: f.sawDiag ? 'Grumpy raccoon. Good tools.' : 'Check your ship first.', open: f.sawDiag },
      { id: 'junkyard', name: "Vex's Junkyard", note: f.phase1 ? (f.vexMet ? 'Scrap, floodlights and one very opinionated magpie.' : 'Racket: "Fine. I\'m coming with you."') : 'Racket: "Not yet. Fuel cell first."', open: !!f.phase1 },
      { id: 'woods', name: 'Woods Edge', note: f.phase1 ? 'Past the crash site. Ember-bark trees and a fallen tree.' : 'Racket: "Stay out of the woods. For now."', open: !!f.phase1 },
      { id: 'deep', name: 'The Deep Woods', note: f.logCut ? (f.pipFed ? "Pip's shortcut. Teal trees, fireflies, a snoring mossback." : 'Walk in from the Woods Edge. Pip might know a shortcut.') : f.phase2 ? 'Cut through the fallen tree at the Woods Edge first.' : 'A fallen tree blocks the path.', open: !!(f.logCut && f.pipFed) },
      { id: 'glade', name: 'The Glade', note: f.gladeLit ? 'The ancient glowing tree.' : 'Somewhere past the dark path.', open: !!(f.gladeLit && f.pipFed) },
      { id: 'wreck', name: 'The Old Wreck', note: f.rootsCleared ? (f.wreckStory ? 'The Long Shot.' : 'A mossy old hauler, swallowed by roots.') : 'Something past the tangled roots.', open: !!(f.rootsCleared && f.pipFed) },
      { id: 'canyon', name: '???', note: f.phase3 ? 'Hull plating. Something big and metal crashed in the canyon. (Coming next)' : 'Racket goes quiet about the canyon.', open: false },
      { id: 'station', name: '???', note: 'A light blinks on the ridge some nights.', open: false },
    ];
    modal('Map', `<div class="map">${locs.map((l) => `<button class="loc ${l.open ? '' : 'locked'} ${l.id === S.scene ? 'here' : ''}" data-loc="${l.id}" ${l.open ? '' : 'disabled'}>
      <span class="loc-name">${l.name}${l.id === S.scene ? ' <em>(you are here)</em>' : ''}</span><span class="loc-note">${esc(l.note)}</span></button>`).join('')}</div>`, { cls: 'map-modal' });
    $$('[data-loc]', $('#modal')).forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.loc;
      closeModal();
      if (id !== S.scene) setTimeout(() => travel(id), 250);
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
    F().metRacket = true;
    S.jobs.radio = 'open'; S.jobs.bolts = 'open'; S.jobs.scrap = 'open';
    save();
    card('Racket hitches the Dandelion to a tow truck held together with duct tape and spite. Ten minutes later, it\'s sitting in his bay.', () => {
      F().shipTowed = true;
      refresh();
      say('r', "Well? Crash site's that way. Shoo.", 300);
    });
  }
  function nightScene() {
    $('#bubbles').innerHTML = '';
    card('Later that night...', () => {
      F().noodles = true;
      S.pos.garage = 340;
      G.tmp.face = -1;
      refresh();
      setTimeout(() => dlg('noodles'), 400);
    });
  }
  function fireThrusters() {
    G.tmp.testFire = true;
    render();
    Sound.sfx('roar');
    const st = $('#stage');
    st.classList.add('rumbling');
    setTimeout(() => st.classList.remove('rumbling'), 3200);
  }
  function roofScene() {
    $('#bubbles').innerHTML = '';
    card('Later, up on the garage roof...', () => {
      G.tmp.testFire = false;
      S.scene = 'roof';
      refresh();
      Sound.setAmbience('forest');
      setTimeout(() => dlg('roof'), 500);
    });
  }
  function phaseEnd(n = 1) {
    if (n === 1) { F().phase1 = true; migrate(); S.pos.garage = 820; }
    else if (n === 2) { F().phase2 = true; migrate(); S.scene = 'garage'; S.pos.garage = 820; Sound.setAmbience('garage'); }
    else { F().phase3 = true; S.pos.garage = 820; }
    save();
    render();
    updateHud();
    const P = n === 1
      ? { lead: 'The fuel cell hums, the Dandelion glows, and somebody gave you a key on a raccoon keychain.', next: '<b>Phase 2: The Junkyard.</b> Open the map when you\'re ready. Racket\'s coming with you, whether he likes it or not.' }
      : n === 2 ? { lead: 'The thrusters roar, Racket laughed out loud for the first time in years, and he almost told you how he crashed here.', next: '<b>Phase 3: The Deep Woods.</b> Cut through the fallen tree at the Woods Edge. Bring the torch.' }
        : { lead: 'The Dandelion knows where she is. Racket told you everything, Vex and Racket finally cleared the air, and there\'s a LONG SHOT patch on your sleeve.', next: 'Coming next: <b>hull plating</b> (something big crashed in the canyon) and <b>the engine core</b>, which is making a new noise. Racket does not like the new noise.' };
    const close = card('', null, {
      title: `End of Phase ${n}`,
      noTap: true,
      html: `<div class="phase-end">
        <p>${P.lead}</p>
        <p class="opinion">Racket's opinion of you: <em>${TIER_NAMES[G.tier()]}</em></p>
        <p class="muted">${P.next}</p>
        <div class="row"><button class="btn big" id="pe-stay">Keep exploring</button><button class="btn" id="pe-title">Back to title</button></div></div>`,
    });
    $('#pe-stay').addEventListener('click', () => { Sound.sfx('click'); close(); });
    $('#pe-title').addEventListener('click', () => { Sound.sfx('click'); close(); setTimeout(showTitle, 460); });
  }

  // ---------------------------------------------------------------------------
  // IDLE BANTER
  // ---------------------------------------------------------------------------
  setInterval(() => {
    if (S.scene !== 'garage' || !F().metRacket || isBlocked()) return;
    const now = Date.now();
    if (now - lastInput > 22000 && now - lastIdle > 26000) {
      lastIdle = now;
      const t = Math.min(G.tier(), DATA.idle.length - 1);
      let pool = DATA.idle[t];
      if (F().phase1 && DATA.idle2) pool = pool.concat(DATA.idle2[Math.min(t, DATA.idle2.length - 1)].filter((l) => F().vexMet || !/Vex|Bertha/.test(l)));
      if (P3() && DATA.idle3) pool = pool.concat(DATA.idle3[Math.min(t, DATA.idle3.length - 1)].filter((l) => (F().reconciled || !/Vex called/.test(l)) && (!F().patch || !/sewing/.test(l))));
      let line = pool[Math.random() * pool.length | 0];
      if (line.includes('radio') && !F().radioFixed) line = pool[0];
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
    if (a === 'map') { if (S.scene === 'roof') return; openMap(); }
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
    migrate();
    hideTitle();
    if (Sound.prefs.music && F().radioFixed && S.station < Sound.stations.length) Sound.setStation(S.station);
    if (S.scene === 'roof' && F().phase2) S.scene = 'garage';
    refresh();
    Sound.setAmbience(SCENES[S.scene].amb);
    // Resume an interrupted story beat
    if (S.scene === 'roof') setTimeout(() => dlg('roof'), 500);
    else if (S.repairs.thrusters && !F().phase2) setTimeout(() => roofScene(), 400);
    else if (S.repairs.nav && !F().patch) setTimeout(() => patchScene(), 400);
    else if (S.repairs.nav && F().patch && !F().phase3) setTimeout(() => dlg('patch2'), 500);
    else if (F().recorderGiven && !F().reconciled) { S.scene = 'garage'; G.tmp.vexVisit = true; refresh(); setTimeout(() => dlg('reconcile'), 500); }
    else if (S.repairs.fuel && !F().noodles) setTimeout(() => dlg('fuelDone'), 500);
    else if (F().noodles && !F().phase1) setTimeout(() => dlg('noodles'), 500);
    else if (F().metRacket && !F().shipTowed) { F().shipTowed = true; refresh(); }
    else if (S.scene === 'junkyard' && F().vexMet && !F().racketLeftJunk) { F().racketLeftJunk = true; refresh(); }
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
  $('#defs').innerHTML = `<defs>${Art.DEFS}${Art2.DEFS}${Art3.DEFS}</defs>`;
  render(); updateHud(); renderTray();
  showTitle();
})();
