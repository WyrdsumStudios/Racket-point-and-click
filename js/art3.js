/* Racket's Garage — art3.js
 * Phase 3 artwork: the Deep Woods, the Glade and its ancient glowing tree, the Old Wreck,
 * Pip the little purple owl-critter, scanner pings, new icons and the navigation schematic.
 */
const Art3 = (() => {
  let seed = 1;
  const srand = (s) => { seed = s; };
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const f1 = (n) => (+n).toFixed(1);
  const sparkle = Art.sparkle;

  const DEFS = `
  <linearGradient id="g-deep-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#03080f"/><stop offset=".5" stop-color="#08202a"/><stop offset="1" stop-color="#0e3a3a"/>
  </linearGradient>
  <linearGradient id="g-glade-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0a0b1e"/><stop offset=".5" stop-color="#1c1e40"/><stop offset="1" stop-color="#3a3060"/>
  </linearGradient>
  <linearGradient id="g-wreck-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#050b10"/><stop offset=".6" stop-color="#10262a"/><stop offset="1" stop-color="#1c3a32"/>
  </linearGradient>
  <linearGradient id="g-biolum" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#9ffff0"/><stop offset="1" stop-color="#2ad4b0" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="g-blossom">
    <stop offset="0" stop-color="#fff2fb"/><stop offset=".5" stop-color="#ffb8e6" stop-opacity=".8"/><stop offset="1" stop-color="#d070c0" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="g-firefly">
    <stop offset="0" stop-color="#fffbd0"/><stop offset=".4" stop-color="#ffe46a" stop-opacity=".7"/><stop offset="1" stop-color="#ffcf3a" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="g-moss" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#4a7a3a"/><stop offset="1" stop-color="#22401e"/>
  </linearGradient>
  <linearGradient id="g-oldhull" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8a8f88"/><stop offset=".6" stop-color="#5a5f58"/><stop offset="1" stop-color="#2e322e"/>
  </linearGradient>`;

  // ---------- creatures ----------
  // Pip: the little purple critter from the crash site. In the deep woods it turns out to have wings.
  const pip = (fed, wings = true) => `<g class="pip">
    ${wings ? `<g class="pip-wings"><path d="M-18,-2 Q-44,-20 -40,8 Q-30,4 -18,8Z" fill="#6a52a8"/><path d="M18,-2 Q44,-20 40,8 Q30,4 18,8Z" fill="#6a52a8"/></g>` : ''}
    <path d="M-14,10 L-20,22 M-6,12 L-8,24 M6,12 L8,24 M14,10 L20,22" stroke="#3a2f45" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="0" cy="0" rx="22" ry="18" fill="#8a72c8"/><ellipse cx="0" cy="5" rx="14" ry="10" fill="#b8a6ec"/>
    <path d="M-16,-12 L-12,-24 L-6,-14 M16,-12 L12,-24 L6,-14" fill="#8a72c8" stroke="#8a72c8" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="-8" cy="-4" r="7" fill="#fff"/><circle cx="8" cy="-4" r="7" fill="#fff"/>
    <circle cx="-7" cy="-3" r="4" fill="#1b1424"/><circle cx="9" cy="-3" r="4" fill="#1b1424"/><circle cx="-5.5" cy="-5" r="1.4" fill="#fff"/><circle cx="10.5" cy="-5" r="1.4" fill="#fff"/>
    <path d="M-3,3 L0,7 L3,3Z" fill="#e2b84a"/>
    ${fed ? '<path d="M-14,8 Q-18,2 -22,6 M14,8 Q18,2 22,6" stroke="#ff9ad0" stroke-width="2" fill="none"/>' : ''}
    <circle cx="-16" cy="-28" r="3.5" fill="#9fffe0"/><circle cx="16" cy="-28" r="3.5" fill="#9fffe0"/>
  </g>`;

  const fireflies = (n, sd, box) => {
    srand(sd);
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = box[0] + rnd() * box[2], y = box[1] + rnd() * box[3];
      s += `<g class="firefly" style="animation-delay:${f1(rnd() * 6)}s;--fx:${f1(rnd() * 60 - 30)}px;--fy:${f1(rnd() * 50 - 25)}px"><circle cx="${f1(x)}" cy="${f1(y)}" r="9" fill="url(#g-firefly)"/><circle cx="${f1(x)}" cy="${f1(y)}" r="2" fill="#fffbd0"/></g>`;
    }
    return s;
  };

  const glowTree = (x, base, h, w, sd) => {
    srand(sd);
    let t = `<path d="M${x - w},${base} Q${x - w * .6},${base - h * .5} ${x - w * .25},${base - h} L${x + w * .25},${base - h} Q${x + w * .6},${base - h * .5} ${x + w},${base}Z" fill="#0b1d22"/>`;
    for (let i = 1; i < 7; i++) {
      const y = base - h * (i / 7), ww = w * (1 - i / 9);
      t += `<path d="M${f1(x - ww)},${f1(y)} Q${x},${f1(y + 8)} ${f1(x + ww)},${f1(y)}" stroke="#5fffe0" stroke-width="2.5" fill="none" opacity="${f1(.35 + rnd() * .5)}"/>`;
    }
    for (let i = 0; i < 4; i++) {
      const sx = x + (rnd() - .5) * w * 1.2, sy = base - h * (.55 + rnd() * .4), len = 60 + rnd() * 120;
      t += `<path d="M${f1(sx)},${f1(sy)} q${f1(rnd() * 20 - 10)},${f1(len / 2)} 0,${f1(len)}" stroke="url(#g-biolum)" stroke-width="3" fill="none" class="tendril" style="animation-delay:${f1(rnd() * 4)}s"/>`;
    }
    t += `<ellipse cx="${x}" cy="${base - h}" rx="${w * 2.6}" ry="${w * 1.3}" fill="#0f3a3a"/><ellipse cx="${x}" cy="${base - h}" rx="${w * 2.6}" ry="${w * 1.3}" fill="#3fe0c0" opacity=".08"/>`;
    return t;
  };

  // =====================================================================
  //  DEEP WOODS
  // =====================================================================
  function deepBg() {
    srand(5150);
    let s = `<rect width="1600" height="900" fill="url(#g-deep-sky)"/>`;
    for (let i = 0; i < 40; i++) s += `<circle cx="${(rnd() * 1600) | 0}" cy="${(rnd() * 160) | 0}" r="${f1(rnd() * 1.2 + .3)}" fill="#cffff4" opacity="${f1(rnd() * .5 + .1)}"/>`;
    for (let i = 0; i < 10; i++) s += glowTree(60 + i * 165 + rnd() * 40, 560, 380 + rnd() * 120, 18 + rnd() * 8, 20 + i);
    s += `<rect y="320" width="1600" height="320" fill="url(#g-fog)"/>`;
    for (let i = 0; i < 6; i++) s += glowTree(120 + i * 290 + rnd() * 60, 640, 520 + rnd() * 120, 30 + rnd() * 10, 60 + i);
    s += `<path d="M0,630 Q400,606 800,622 T1600,618 L1600,900 L0,900Z" fill="#0d2420"/>
      <path d="M0,650 Q500,640 900,660 T1600,650 L1600,900 L0,900Z" fill="#102c26"/>`;
    srand(77);
    for (let i = 0; i < 26; i++) { const x = rnd() * 1600, y = 680 + rnd() * 200, r = 6 + rnd() * 10; s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#1e5a48"/><circle cx="${f1(x)}" cy="${f1(y - r * .3)}" r="${f1(r * .5)}" fill="#5fffc8" opacity=".25"/>`; }
    s += `<rect y="560" width="1600" height="200" fill="url(#g-fog)" class="fog-drift"/>`;
    s += fireflies(22, 9, [0, 300, 1600, 450]);
    return s;
  }
  const deep = {
    northPath: (lit) => `<g>
      <ellipse cx="820" cy="560" rx="120" ry="110" fill="#020507" opacity=".95" filter="url(#f-blur24)"/>
      <path d="M730,640 Q790,600 820,470 Q850,600 910,640Z" fill="#020507" opacity=".7" filter="url(#f-blur10)"/>
      ${lit ? `<ellipse cx="820" cy="560" rx="110" ry="100" fill="#ffe46a" opacity=".1" filter="url(#f-blur24)"/>
        ${[[760, 600], [800, 530], [820, 470]].map(([x, y], i) => `<g><path d="M${x},${y + 30} L${x},${y}" stroke="#3a2a20" stroke-width="3"/><rect x="${x - 9}" y="${y - 16}" width="18" height="22" rx="5" fill="#ffe46a" opacity=".85"/><circle cx="${x}" cy="${y - 5}" r="${26 - i * 5}" fill="url(#g-firefly)"/></g>`).join('')}`
        : `<text x="820" y="560" font-size="34" fill="#2a4a48" text-anchor="middle" font-family="Fredoka, sans-serif">· · ·</text>`}
    </g>`,
    roots: (cleared) => `<g>
      <ellipse cx="1420" cy="570" rx="170" ry="170" fill="#020507" opacity=".9" filter="url(#f-blur24)"/>
      ${cleared
        ? `<path d="M1330,720 Q1380,560 1420,430 Q1460,560 1520,720Z" fill="#183a32" opacity=".9"/><path d="M1290,700 Q1300,560 1320,420 M1560,700 Q1550,560 1540,410" stroke="#3a2a1c" stroke-width="22" fill="none" stroke-linecap="round"/>`
        : [0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${1270 + i * 8},${720 - i * 4} Q${1360 + i * 30},${560 - i * 20} ${1300 + i * 40},${420 + i * 6} T${1560 - i * 10},${440 + i * 30}" stroke="${i % 2 ? '#3a2a1c' : '#4a3424'}" stroke-width="${16 - i}" fill="none" stroke-linecap="round"/>`).join('') + '<circle cx="1420" cy="560" r="8" fill="#5fffe0" opacity=".6"/>'}
    </g>`,
    mossback: () => `<g class="mossback">
      <ellipse cx="220" cy="740" rx="150" ry="22" fill="#000" opacity=".4"/>
      <path d="M80,740 Q90,620 220,600 Q350,610 360,740Z" fill="url(#g-moss)"/>
      ${[[150, 640], [210, 620], [270, 640], [320, 680], [120, 690]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#9fffd0" opacity=".7"/>`).join('')}
      <path d="M100,690 Q130,660 170,670" stroke="#7aaa5a" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="342" cy="712" rx="34" ry="26" fill="#3a5a30"/>
      <path d="M332,706 Q338,702 344,706 M350,706 Q356,702 362,706" stroke="#0e1a0e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M342,722 Q348,726 354,722" stroke="#0e1a0e" stroke-width="2" fill="none"/>
      <text x="300" y="660" font-size="16" fill="#cfe" opacity=".7" class="zzz">z</text>
    </g>`,
    drifters: () => `<g>
      ${[[1050, 250, 1], [1140, 300, .7], [980, 330, .55]].map(([x, y, s], i) => `<g class="drifter" style="animation-delay:${i * 1.3}s" transform="translate(${x},${y}) scale(${s})">
        <path d="M-30,0 Q-30,-34 0,-36 Q30,-34 30,0 Q15,6 0,2 Q-15,6 -30,0Z" fill="#b8a6ec" opacity=".75"/>
        <path d="M-18,2 q-4,30 2,50 M-6,3 q4,34 -2,58 M6,3 q-4,30 2,52 M18,2 q4,28 -2,46" stroke="#e6d8ff" stroke-width="2.5" fill="none" opacity=".7"/>
        <circle cx="-8" cy="-14" r="3" fill="#2a1a40"/><circle cx="8" cy="-14" r="3" fill="#2a1a40"/>
        <circle r="44" fill="#b8a6ec" opacity=".12"/></g>`).join('')}
    </g>`,
    pipBranch: (fed) => `<g>
      <path d="M220,470 Q330,440 460,462" stroke="#1c2a28" stroke-width="16" stroke-linecap="round" fill="none"/>
      <path d="M380,452 Q400,430 420,440" stroke="#1c2a28" stroke-width="6" fill="none"/>
      ${fed ? '' : `<g transform="translate(400,432)">${pip(false)}</g>`}
    </g>`,
    hollowLog: (fed) => `<g>
      <ellipse cx="580" cy="760" rx="110" ry="16" fill="#000" opacity=".4"/>
      <path d="M470,760 Q470,690 520,686 L660,690 Q700,700 700,740 L690,760Z" fill="#3a2e24" stroke="#1a140e" stroke-width="3"/>
      <ellipse cx="672" cy="724" rx="26" ry="34" fill="#140e0a"/>
      ${fed ? `<g transform="translate(560,676)">${pip(true)}</g><circle cx="672" cy="724" r="20" fill="#5fffe0" opacity=".25"/>` : ''}
    </g>`,
    exit: () => `<g class="exit-arrow left"><path d="M120,800 L64,830 L120,860" stroke="#9fffe6" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M152,800 L96,830 L152,860" stroke="#9fffe6" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/></g>`,
  };

  // =====================================================================
  //  THE GLADE — the ancient glowing tree
  // =====================================================================
  function gladeBg() {
    srand(4242);
    let s = `<rect width="1600" height="900" fill="url(#g-glade-sky)"/>`;
    for (let i = 0; i < 160; i++) s += `<circle cx="${(rnd() * 1600) | 0}" cy="${(rnd() * 420) | 0}" r="${f1(rnd() * 1.6 + .3)}" fill="#fff" opacity="${f1(rnd() * .7 + .2)}"/>`;
    for (let i = 0; i < 8; i++) s += glowTree(i * 230 + rnd() * 60, 600, 300 + rnd() * 80, 14, 300 + i);
    s += `<path d="M0,620 Q400,600 800,612 T1600,606 L1600,900 L0,900Z" fill="#14202a"/>
      <circle cx="800" cy="420" r="520" fill="#ffb8e6" opacity=".06" filter="url(#f-blur24)"/>`;
    // the elder tree: twisting trunk + vast blossom canopy
    s += `<path d="M560,780 Q620,640 660,520 Q640,420 700,330 L760,300 Q800,420 860,300 L920,330 Q960,430 940,520 Q980,640 1060,780Z" fill="#3a2a30"/>
      <path d="M660,520 Q720,560 760,460 Q800,560 860,470 Q900,560 940,520" stroke="#5a3a48" stroke-width="10" fill="none"/>
      <path d="M700,700 Q760,600 740,480 M900,700 Q840,600 870,470" stroke="#ffb8e6" stroke-width="3" fill="none" opacity=".45"/>
      <path d="M560,780 Q480,770 380,800 M1060,780 Q1160,770 1280,806 M640,770 Q600,820 520,860 M980,770 Q1040,830 1120,866" stroke="#3a2a30" stroke-width="26" fill="none" stroke-linecap="round"/>
      <path d="M700,330 Q560,260 420,280 M760,300 Q700,180 600,130 M860,300 Q900,170 1010,120 M920,330 Q1060,260 1200,290" stroke="#3a2a30" stroke-width="22" fill="none" stroke-linecap="round"/>`;
    srand(55);
    for (let i = 0; i < 70; i++) { const a = rnd() * Math.PI, r = 160 + rnd() * 560, x = 800 + Math.cos(a) * r * 1.1, y = 300 - Math.sin(a) * r * .5; s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(30 + rnd() * 50)}" fill="url(#g-blossom)" opacity="${f1(.5 + rnd() * .5)}"/>`; }
    for (let i = 0; i < 18; i++) s += `<circle class="petal" style="animation-delay:${f1(rnd() * 9)}s;--px:${f1(rnd() * 120 - 60)}px" cx="${f1(300 + rnd() * 1000)}" cy="${f1(100 + rnd() * 200)}" r="4" fill="#ffd8f0"/>`;
    // pool
    s += `<ellipse cx="320" cy="760" rx="200" ry="40" fill="#1a2a4a"/><ellipse cx="320" cy="756" rx="180" ry="30" fill="#3a5a8a" opacity=".6"/>
      <ellipse cx="300" cy="752" rx="80" ry="8" fill="#ffd8f0" opacity=".35"/>`;
    return s;
  }
  const glade = {
    crystals: (S) => {
      const taken = S.flags.starTaken, scan = S.flags.scannerFixed;
      let c = '';
      [[880, 700, 26], [910, 690, 34], [945, 702, 22], [975, 694, 30], [1005, 704, 20], [1030, 698, 26]].forEach(([x, y, h], i) => {
        const star = i === 3;
        if (star && taken) return;
        c += `<path d="M${x - 8},${y} L${x},${y - h} L${x + 8},${y}Z" fill="${star && scan ? '#d8e8ff' : 'url(#g-crystal)'}" stroke="${star && scan ? '#fff' : '#0f5a54'}" stroke-width="1.5"/>`;
      });
      return `<g><circle cx="960" cy="690" r="90" fill="url(#g-teal-glow)" class="pulse"/>${c}
        ${scan && !taken ? `${ping(975, 676)}${sparkle(975, 660, .7, .2)}` : ''}</g>`;
    },
    exit: () => `<g class="exit-arrow"><path d="M1500,770 L1556,800 L1500,830" stroke="#ffd8f0" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M1468,770 L1524,800 L1468,830" stroke="#ffd8f0" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/></g>`,
  };

  // =====================================================================
  //  THE OLD WRECK — the Long Shot
  // =====================================================================
  function wreckBg() {
    srand(1999);
    let s = `<rect width="1600" height="900" fill="url(#g-wreck-sky)"/>`;
    for (let i = 0; i < 8; i++) s += glowTree(i * 220 + rnd() * 50, 580, 360 + rnd() * 100, 20, 900 + i);
    s += `<rect y="300" width="1600" height="300" fill="url(#g-fog)"/>
      <path d="M0,640 Q400,620 800,634 T1600,628 L1600,900 L0,900Z" fill="#12261e"/>`;
    // the hull: long fuselage, nose on the left, torn open in the middle
    s += `<path d="M200,560 Q190,420 300,360 L1300,300 Q1460,310 1480,460 L1470,660 L230,690Z" fill="url(#g-oldhull)" stroke="#232723" stroke-width="5"/>
      <path d="M560,690 L560,450 Q700,380 860,384 Q960,400 980,470 L980,676Z" fill="#0c1410"/>`;
    // ribs, like the garage ceiling
    for (let x = 600; x < 980; x += 70) s += `<path d="M${x},680 L${x},${470 - (x - 600) * .05} Q${x + 30},420 ${x + 60},${470 - (x - 600) * .05}" stroke="#3a3f3c" stroke-width="9" fill="none"/>`;
    s += `<path d="M300,360 L1300,300 M240,520 L1470,470" stroke="#3e423e" stroke-width="4"/>
      <path d="M1230,320 L1300,300 L1290,640 L1220,650Z" fill="#c4643a" opacity=".55"/>`;
    // moss + roots draped over everything
    srand(31);
    for (let i = 0; i < 26; i++) { const x = 230 + rnd() * 1220, y = 300 + rnd() * 60 + (x > 560 && x < 980 ? 80 : 0); s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(30 + rnd() * 50)}" ry="${f1(10 + rnd() * 12)}" fill="url(#g-moss)"/>`; }
    for (let i = 0; i < 9; i++) { const x = 260 + rnd() * 1180; s += `<path d="M${f1(x)},330 q${f1(rnd() * 40 - 20)},${f1(150 + rnd() * 100)} ${f1(rnd() * 30 - 15)},${f1(300 + rnd() * 100)}" stroke="#3a2a1c" stroke-width="${f1(6 + rnd() * 8)}" fill="none" stroke-linecap="round"/>`; }
    s += `<path d="M1080,690 Q1060,500 1100,300 Q1120,180 1060,60" stroke="#2a2018" stroke-width="40" fill="none"/>
      <circle cx="1060" cy="80" r="120" fill="#0f3a3a"/><circle cx="1060" cy="80" r="120" fill="#3fe0c0" opacity=".08"/>`;
    s += fireflies(14, 41, [100, 300, 1400, 400]);
    return s;
  }
  const wreck = {
    cockpit: (S) => `<g>
      <path d="M220,540 Q212,430 300,376 L440,368 L460,540Z" fill="#4a4f48"/>
      <path d="M250,470 Q260,410 310,392 L420,388 L428,470Z" fill="#16302e" stroke="#2a2e2a" stroke-width="4"/>
      <path d="M300,400 L340,440 L320,460 M360,396 L390,430" stroke="#cfe" stroke-width="2" opacity=".6"/>
      ${!S.flags.recorderTaken ? `<rect x="380" y="490" width="44" height="30" rx="4" fill="#e57a38" stroke="#7a3812" stroke-width="2"/><path d="M386,498 L418,498 M386,506 L410,506" stroke="#fff3e0" stroke-width="2"/>${S.flags.wreckStory ? sparkle(402, 492, .6, .4) : ''}` : ''}
      ${!S.flags.wreckStory ? sparkle(330, 430, .7, 1) : ''}
    </g>`,
    nameplate: () => `<g><rect x="600" y="340" width="230" height="44" rx="6" fill="#2a2e2a" stroke="#c9a052" stroke-width="3" transform="rotate(-3 715 362)"/>
      <text x="715" y="372" font-size="28" text-anchor="middle" fill="#e2b84a" font-family="Fredoka, sans-serif" font-weight="600" letter-spacing="4" transform="rotate(-3 715 362)">LONG SHOT</text>
      <ellipse cx="800" cy="356" rx="40" ry="10" fill="url(#g-moss)" transform="rotate(-3 715 362)"/></g>`,
    tally: () => `<g><rect x="620" y="480" width="290" height="130" rx="4" fill="#3a3f3a" opacity=".85"/>
      ${Array.from({ length: 14 }, (_, g) => `<g transform="translate(${634 + (g % 7) * 38},${494 + Math.floor(g / 7) * 56})"><path d="M0,0 L0,36 M7,0 L7,36 M14,0 L14,36 M21,0 L21,36 M-4,30 L25,6" stroke="#c9d0d6" stroke-width="2.4" opacity=".75"/></g>`).join('')}
    </g>`,
    hold: (S) => `<g>
      <path d="M1000,676 L1000,440 L1220,420 L1220,670Z" fill="#0a100c" stroke="#3a3f3a" stroke-width="5"/>
      <path d="M1000,440 L960,600 M1220,420 L1260,580" stroke="#4a4f48" stroke-width="8"/>
      ${[[1030, 600, 70, 60], [1110, 610, 80, 52], [1060, 560, 60, 40]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#3a2e24" stroke="#1a140e" stroke-width="2"/>`).join('')}
      ${!S.flags.coilTaken ? `<g transform="translate(1150,580)"><circle r="14" fill="none" stroke="url(#g-copper)" stroke-width="6"/><circle r="6" fill="#5fffe0"/></g>${sparkle(1150, 568, .7, .8)}` : ''}
    </g>`,
    exit: () => deep.exit(),
  };

  // scanner ping: concentric rings marking something hidden
  const ping = (x, y) => `<g class="ping" pointer-events="none"><circle cx="${x}" cy="${y}" r="10" fill="none" stroke="#7affe4" stroke-width="3"/><circle cx="${x}" cy="${y}" r="10" fill="none" stroke="#7affe4" stroke-width="2" class="ping2"/></g>`;
  const hidden = {
    meteorite: () => `<g><ellipse cx="940" cy="800" rx="34" ry="10" fill="#000" opacity=".4"/><path d="M914,800 Q912,778 934,772 Q960,770 966,792 Q960,806 940,806Z" fill="#3a3448"/><circle cx="932" cy="786" r="4" fill="#b8a6ff"/><circle cx="948" cy="792" r="3" fill="#b8a6ff"/>${ping(940, 788)}</g>`,
    washer: () => `<g><circle cx="640" cy="772" r="12" fill="none" stroke="#e2b84a" stroke-width="5"/>${ping(640, 772)}</g>`,
    floorboard: () => `<g><rect x="440" y="770" width="110" height="18" rx="2" fill="#5a4a3e" stroke="#2a201a" stroke-width="2" transform="rotate(-3 495 779)"/>${ping(495, 778)}</g>`,
  };
  const drawer = (S) => `<g>${S.flags.scannerTaken ? '' : sparkle(925, 532, .5, 1.6)}</g>`;
  const logCut = () => `<g>
    <ellipse cx="820" cy="690" rx="420" ry="30" fill="#000" opacity=".4"/>
    <path d="M420,690 Q430,600 520,590 L720,584 L730,712 L520,712 Q430,712 420,690Z" fill="#3a2e24" stroke="#1a140e" stroke-width="4"/>
    <path d="M900,580 L1150,570 Q1240,572 1250,650 Q1240,700 1150,700 L910,706Z" fill="#3a2e24" stroke="#1a140e" stroke-width="4"/>
    <ellipse cx="726" cy="648" rx="24" ry="62" fill="#c98a4a"/><ellipse cx="904" cy="644" rx="24" ry="62" fill="#c98a4a"/>
    <ellipse cx="726" cy="648" rx="12" ry="34" fill="none" stroke="#7a4a20" stroke-width="2"/><ellipse cx="904" cy="644" rx="12" ry="34" fill="none" stroke="#7a4a20" stroke-width="2"/>
    <path d="M440,640 Q380,600 360,540 M450,670 Q370,680 330,640" stroke="#2a2018" stroke-width="12" fill="none" stroke-linecap="round"/>
  </g>`;
  const toDeep = () => `<g class="exit-arrow up"><path d="M786,560 L816,512 L846,560" stroke="#9fffe6" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M786,590 L816,542 L846,590" stroke="#9fffe6" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/></g>`;

  // =====================================================================
  //  ICONS
  // =====================================================================
  Object.assign(Art.ICONS, {
    broken_scanner: `<rect x="12" y="10" width="40" height="44" rx="8" fill="#5a6066" stroke="#2a2e32" stroke-width="2.5"/><circle cx="32" cy="28" r="11" fill="#16302e"/><path d="M26,22 L36,32 M34,20 L30,30" stroke="#cfe" stroke-width="2"/><rect x="20" y="44" width="24" height="5" rx="2" fill="#2a2e32"/>`,
    scanner: `<rect x="12" y="10" width="40" height="44" rx="8" fill="#5a6066" stroke="#2a2e32" stroke-width="2.5"/><circle cx="32" cy="28" r="11" fill="#0d3a34"/><circle cx="32" cy="28" r="7" fill="none" stroke="#7affe4" stroke-width="2"/><circle cx="32" cy="28" r="2.5" fill="#7affe4"/><rect x="20" y="44" width="24" height="5" rx="2" fill="#7affe4" opacity=".7"/>`,
    resonance_coil: `<circle cx="32" cy="32" r="18" fill="none" stroke="url(#g-copper)" stroke-width="8"/><circle cx="32" cy="32" r="7" fill="#5fffe0"/><circle cx="32" cy="32" r="22" fill="url(#g-teal-glow)" opacity=".5"/>`,
    ration_paste: `<rect x="14" y="16" width="36" height="34" rx="6" fill="#d86a2a" stroke="#7a3812" stroke-width="2"/><rect x="14" y="16" width="36" height="9" rx="4" fill="#b9541c"/><text x="32" y="44" font-size="10" text-anchor="middle" fill="#fff3e0" font-family="Nunito, sans-serif" font-weight="800">PASTE</text>`,
    star_crystal: `<circle cx="32" cy="32" r="24" fill="#b8c8ff" opacity=".25"/><path d="M32 6 L44 30 L32 58 L20 30Z" fill="#d8e8ff" stroke="#6a7ad0" stroke-width="2"/>${[[28, 22], [36, 30], [30, 40], [34, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#3a4aa0"/>`).join('')}`,
    nav_chip: `<rect x="14" y="14" width="36" height="36" rx="4" fill="#1e3a30" stroke="#4fd1b8" stroke-width="2"/>${[20, 28, 36, 44].map((y) => `<path d="M8 ${y} L14 ${y} M50 ${y} L56 ${y}" stroke="#c9a052" stroke-width="2.5"/>`).join('')}<path d="M22 32 L30 24 L38 36 L44 26" stroke="#7affe4" stroke-width="2" fill="none"/>`,
    flight_recorder: `<rect x="12" y="16" width="40" height="32" rx="5" fill="#e57a38" stroke="#7a3812" stroke-width="2.5"/><path d="M18 26 L46 26 M18 34 L40 34" stroke="#fff3e0" stroke-width="2.5"/><rect x="40" y="38" width="8" height="6" rx="1" fill="#2a1a10"/>`,
    meteorite: `<path d="M12 40 Q10 20 30 14 Q52 12 54 34 Q50 52 30 52Z" fill="#3a3448" stroke="#1a1424" stroke-width="2"/><circle cx="26" cy="28" r="4" fill="#b8a6ff"/><circle cx="40" cy="38" r="3" fill="#b8a6ff"/><circle cx="36" cy="24" r="2" fill="#e6d8ff"/>`,
    lucky_washer: `<circle cx="32" cy="32" r="20" fill="#e2b84a" stroke="#a8822a" stroke-width="3"/><circle cx="32" cy="32" r="8" fill="#14100d"/><path d="M18 24 Q24 16 34 15" stroke="#fffbe8" stroke-width="3" fill="none"/>`,
    mushroom_spores: `<rect x="16" y="22" width="32" height="30" rx="5" fill="#8a6a4a" stroke="#4a3424" stroke-width="2"/><rect x="14" y="16" width="36" height="9" rx="3" fill="#5a3f2e"/><path d="M24 44 L24 36 M24 36 Q24 28 32 28 Q40 28 40 36Z M32 44 L32 36" stroke="#f2ead8" stroke-width="2" fill="#c0392b"/><circle cx="29" cy="32" r="1.5" fill="#fff"/>`,
    long_shot_patch: `<circle cx="32" cy="32" r="24" fill="#1f4f43" stroke="#e2b84a" stroke-width="3"/><path d="M18 30 Q32 20 46 30 L42 36 Q32 30 22 36Z" fill="#23252a"/><circle cx="27" cy="31" r="2" fill="#86d65e"/><circle cx="37" cy="31" r="2" fill="#86d65e"/><text x="32" y="48" font-size="7" text-anchor="middle" fill="#e2b84a" font-family="Fredoka, sans-serif" font-weight="600">LONG SHOT</text>`,
  });

  // =====================================================================
  //  NAV SCHEMATIC
  // =====================================================================
  function navSchematic(parts, charged, t = 0, calibrated) {
    return `<svg viewBox="0 0 400 240" class="schematic" aria-hidden="true">
      <rect width="400" height="240" fill="#0d1a17"/>
      ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="240" stroke="#173029"/>`).join('')}
      <circle cx="200" cy="122" r="${70 + t * 20}" fill="none" stroke="#2a4a44" stroke-width="2"/>
      <circle cx="200" cy="122" r="46" fill="none" stroke="#2a4a44" stroke-width="2" stroke-dasharray="4 6"/>
      ${calibrated || charged ? `<path d="M150,90 L185,105 L215,80 L250,100 M170,150 L200,135 L235,160" stroke="#9fd8ff" stroke-width="2" opacity="${.6 + t * .4}"/>${[[150, 90], [185, 105], [215, 80], [250, 100], [170, 150], [200, 135], [235, 160]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#eafcff"/>`).join('')}` : ''}
      <g class="${parts.starcrystal ? 'part-in' : 'part-ghost'}" data-part="starcrystal"><path d="M200,96 L216,122 L200,150 L184,122Z" fill="${parts.starcrystal ? '#d8e8ff' : 'none'}" stroke="#4fd1b8" stroke-width="2" stroke-dasharray="${parts.starcrystal ? 0 : '5 4'}"/></g>
      <g class="${parts.chip ? 'part-in' : 'part-ghost'}" data-part="chip"><rect x="300" y="100" width="46" height="46" rx="4" fill="${parts.chip ? '#1e3a30' : 'none'}" stroke="#4fd1b8" stroke-width="2" stroke-dasharray="${parts.chip ? 0 : '6 5'}"/>${parts.chip ? '<path d="M310,124 L318,116 L326,130 L336,118" stroke="#7affe4" stroke-width="2" fill="none"/>' : ''}</g>
      <path d="M246,122 L300,122" stroke="#4fd1b8" stroke-width="2" stroke-dasharray="${parts.chip && parts.starcrystal ? 0 : '4 4'}"/>
      ${t > 0 ? `<circle cx="200" cy="122" r="${90 * t}" fill="#9fd8ff" opacity="${.25 * (1 - t) + .1}"/>` : ''}
      <text x="16" y="24" fill="#4fd1b8" font-family="ui-monospace, monospace" font-size="12">NAVIGATION // ${charged ? 'CONFIDENT. MOOD: HOPEFUL' : 'CONFUSED. MOOD: ???'}</text>
      <text x="16" y="226" fill="#4fd1b8" font-family="ui-monospace, monospace" font-size="11" opacity=".7">STAR CHART ${parts.starcrystal ? 'OK' : '--'} · CHIP ${parts.chip ? 'OK' : '--'} · CALIBRATION ${calibrated ? 'OK' : '--'}</text>
    </svg>`;
  }

  return { DEFS, pip, deepBg, deep, gladeBg, glade, wreckBg, wreck, hidden, drawer, logCut, toDeep, ping, navSchematic };
})();
