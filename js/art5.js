/* Racket's Garage — art5.js
 * Phase 5 (finale) artwork: Behind the Garage and Racket's locked crate, the Old Hangar on the hill,
 * the Dandelion on the launch rail, ending decor, the engine-core schematic and credit callbacks.
 */
const Art5 = (() => {
  let seed = 1;
  const srand = (s) => { seed = s; };
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const f1 = (n) => (+n).toFixed(1);
  const sparkle = Art.sparkle;

  const DEFS = `
  <linearGradient id="g-hill-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#071020"/><stop offset=".5" stop-color="#16304a"/><stop offset="1" stop-color="#3a5a6a"/>
  </linearGradient>
  <linearGradient id="g-hangar" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#6a7470"/><stop offset="1" stop-color="#3a423e"/>
  </linearGradient>
  <linearGradient id="g-fog2" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#c8dcd8" stop-opacity="0"/><stop offset=".5" stop-color="#c8dcd8" stop-opacity=".35"/><stop offset="1" stop-color="#c8dcd8" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="g-core">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#9ffff0"/><stop offset=".6" stop-color="#2ad4b0" stop-opacity=".5"/><stop offset="1" stop-color="#2ad4b0" stop-opacity="0"/>
  </radialGradient>`;

  // ---------------------------------------------------------------- behind the garage
  function yardBg(S) {
    srand(5050);
    let s = `<rect width="1600" height="900" fill="url(#g-night)"/>`;
    for (let i = 0; i < 60; i++) s += `<circle cx="${(rnd() * 1600) | 0}" cy="${(rnd() * 260) | 0}" r="${f1(rnd() * 1.3 + .3)}" fill="#fff" opacity="${f1(rnd() * .6 + .2)}"/>`;
    s += `<circle cx="300" cy="120" r="28" fill="#e8f1e4"/><circle cx="300" cy="120" r="70" fill="#e8f1e4" opacity=".08" filter="url(#f-blur10)"/>`;
    // the hill rising right, with the hangar's silhouette up in the fog
    s += `<path d="M700,640 Q1000,520 1300,360 Q1450,280 1600,250 L1600,900 L700,900Z" fill="#14302e"/>
      <path d="M1300,330 L1300,250 Q1400,200 1500,250 L1500,330Z" fill="#0c1e1e" opacity=".9"/>
      <rect x="1240" y="210" width="260" height="140" fill="url(#g-fog2)"/>
      <path d="M760,640 Q1000,560 1200,450 Q1320,390 1420,350" stroke="#3a3326" stroke-width="22" fill="none" opacity=".8"/>`;
    // the back of the garage
    s += `<rect x="0" y="180" width="720" height="470" fill="#3a2920"/>`;
    for (let x = 0; x < 720; x += 58) s += `<line x1="${x}" y1="180" x2="${x}" y2="650" stroke="#1a120e" stroke-width="3"/>`;
    s += `<path d="M-20,190 L360,90 L740,190" fill="#2a1d16" stroke="#140f0c" stroke-width="8"/>
      <rect x="440" y="150" width="56" height="70" fill="#5a3f2e"/>
      <g class="chimney-smoke"><circle cx="468" cy="130" r="14" fill="#cfd8d2" opacity=".16" filter="url(#f-blur3)"/><circle cx="476" cy="100" r="20" fill="#cfd8d2" opacity=".1" filter="url(#f-blur3)"/></g>
      <rect x="110" y="380" width="120" height="270" rx="4" fill="#5a3f2e" stroke="#2a1d16" stroke-width="4"/><circle cx="210" cy="520" r="6" fill="#c9a052"/>
      <rect x="120" y="340" width="100" height="26" rx="2" fill="#2a3a40"/><path d="M130,352 L210,352" stroke="#ffcf7a" stroke-width="3" opacity=".7"/>
      <rect x="300" y="300" width="160" height="120" fill="#ffcf7a" opacity=".85"/><path d="M380,300 L380,420 M300,360 L460,360" stroke="#3a2920" stroke-width="8"/>`;
    // ground, laundry line, planters
    s += `<path d="M0,640 L1600,640 L1600,900 L0,900Z" fill="#1e2e24"/><path d="M0,640 Q400,630 760,640" stroke="#2a3e30" stroke-width="6"/>
      <path d="M760,300 L760,640 M1080,330 L1080,600" stroke="#4a3424" stroke-width="8"/>
      <path d="M760,320 Q920,350 1080,340" stroke="#c9c2ae" stroke-width="2" fill="none"/>
      <path d="M820,330 L812,410 L852,412 L850,334Z" fill="#2f6f60"/><path d="M880,338 L880,400 L910,400 L912,340Z" fill="#c0392b"/><path d="M960,342 Q966,380 990,382 L994,342Z" fill="#e9e2cf"/>
      ${[[40, 660], [120, 670]].map(([x, y]) => `<rect x="${x}" y="${y}" width="70" height="40" rx="4" fill="#5a3f2e"/>${[0, 1, 2].map((i) => `<g transform="translate(${x + 14 + i * 20},${y})"><rect x="-2" y="-12" width="4" height="12" fill="#e8e2d0"/><path d="M-8,-10 Q0,-22 8,-10Z" fill="#c0392b"/></g>`).join('')}`).join('')}`;
    return s;
  }
  function crate(open) {
    return `<g>
      <ellipse cx="560" cy="728" rx="150" ry="18" fill="#000" opacity=".4"/>
      <path d="M420,720 Q560,700 700,720 L700,740 L420,740Z" fill="#2a2018"/>
      <rect x="440" y="610" width="240" height="116" rx="6" fill="#5a4a3a" stroke="#2a1d16" stroke-width="4"/>
      <path d="M440,646 L680,646 M440,690 L680,690" stroke="#3a2e24" stroke-width="4"/>
      <text x="560" y="676" font-size="26" text-anchor="middle" fill="#c9b8a0" font-family="Fredoka, sans-serif" font-weight="600" opacity=".7">RKT</text>
      ${open
        ? `<path d="M440,610 L460,540 L700,540 L680,610Z" fill="#6a5a48" stroke="#2a1d16" stroke-width="4"/><ellipse cx="560" cy="612" rx="110" ry="14" fill="#ffcf7a" opacity=".25" filter="url(#f-blur10)"/>`
        : `<path d="M430,596 Q560,572 690,596 L700,620 L420,620Z" fill="#2f4a40" opacity=".9"/><rect x="548" y="640" width="24" height="26" rx="4" fill="#8a929a" stroke="#4d555b" stroke-width="2"/><path d="M552,640 Q560,624 568,640" stroke="#8a929a" stroke-width="4" fill="none"/>`}
    </g>`;
  }
  const toHill = () => `<g class="exit-arrow up"><path d="M1170,520 L1200,472 L1230,520" stroke="#9fffe6" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M1170,550 L1200,502 L1230,550" stroke="#9fffe6" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/></g>`;

  // ---------------------------------------------------------------- the Old Hangar
  function hangarBg(S) {
    srand(6060);
    let s = `<rect width="1600" height="900" fill="url(#g-hill-sky)"/>`;
    for (let i = 0; i < 120; i++) s += `<circle cx="${(rnd() * 1600) | 0}" cy="${(rnd() * 360) | 0}" r="${f1(rnd() * 1.5 + .3)}" fill="#fff" opacity="${f1(rnd() * .6 + .2)}"/>`;
    s += `<path d="M1150,112 L1130,150 L1170,190 L1210,230 L1250,270 M1236,300 L1250,270 L1270,296 M1200,132 L1170,190" stroke="#9fd8ff" stroke-width="1.5" fill="none" opacity=".3" transform="translate(-700,-40) scale(.9)"/>`;
    // valley below with the garage's tiny light
    s += `<path d="M0,560 Q400,520 800,560 T1600,540 L1600,900 L0,900Z" fill="#0c1e22"/>
      <circle cx="380" cy="620" r="50" fill="url(#g-lamp)"/><rect x="372" y="612" width="12" height="10" fill="#ffcf7a"/>`;
    // hilltop
    s += `<path d="M0,700 Q500,640 900,660 T1600,640 L1600,900 L0,900Z" fill="#1a2e28"/>`;
    // hangar
    s += `<path d="M60,700 L60,380 Q340,230 640,380 L640,700Z" fill="url(#g-hangar)" stroke="#23282a" stroke-width="5"/>`;
    for (let x = 80; x < 640; x += 22) s += `<path d="M${x},700 L${x},${380 - Math.sin((x - 60) / 580 * Math.PI) * 140}" stroke="#4a524e" stroke-width="6" opacity=".7"/>`;
    s += `<path d="M150,700 L150,470 Q350,380 550,470 L550,700Z" fill="#0a1012"/>
      <path d="M150,470 Q350,380 550,470" stroke="#d6a43a" stroke-width="6" fill="none" stroke-dasharray="20 14"/>
      <text x="350" y="330" font-size="22" text-anchor="middle" fill="#c9c2ae" font-family="Fredoka, sans-serif" font-weight="600" opacity=".75" letter-spacing="6">HANGAR 2</text>
      <text x="350" y="356" font-size="13" text-anchor="middle" fill="#c9c2ae" font-family="Nunito, sans-serif" font-weight="700" opacity=".55">R &amp; V SALVAGE · EST. LONG AGO</text>`;
    // launch rail
    s += `<path d="M600,780 L1520,400" stroke="#3a3f44" stroke-width="30" stroke-linecap="round"/><path d="M600,768 L1520,388" stroke="#8a929a" stroke-width="5"/><path d="M600,792 L1520,412" stroke="#8a929a" stroke-width="5"/>
      ${Array.from({ length: 12 }, (_, i) => { const x = 660 + i * 72, y = 755 - i * 30; return `<path d="M${x},${y} L${x},${y + 90 + i * 6}" stroke="#2a2e32" stroke-width="10"/><circle cx="${x}" cy="${y - 2}" r="4" fill="${i % 2 ? '#ffcf6a' : '#7affe4'}" class="${i % 2 ? 'pulse' : ''}"/>`; }).join('')}`;
    // control tower
    s += `<rect x="1340" y="300" width="40" height="400" fill="#4a524e"/><path d="M1290,300 L1430,300 L1420,180 L1300,180Z" fill="#5a625e" stroke="#23282a" stroke-width="4"/>
      <rect x="1310" y="196" width="100" height="70" fill="#1a2a30"/><rect x="1310" y="196" width="100" height="70" fill="#ffcf7a" class="tower-flicker" opacity=".5"/>
      <path d="M1360,180 L1360,130 M1350,140 L1370,140" stroke="#8a929a" stroke-width="4"/><circle cx="1360" cy="126" r="5" fill="#e0503c" class="pulse"/>`;
    s += `<rect y="420" width="1600" height="260" fill="url(#g-fog2)" class="fog-drift"/><rect y="600" width="1600" height="200" fill="url(#g-fog2)" class="fog-drift" style="animation-delay:-6s"/>`;
    return s;
  }
  const hangar = {
    tower: () => `<g>${sparkle(1360, 230, .5, 1.3)}</g>`,
    nest: (S) => `<g><path d="M1388,184 Q1410,170 1432,184 Q1420,196 1400,196Z" fill="#6a4a30"/><g transform="translate(1410,166) scale(.7)">${Art3.pip(true)}</g></g>`,
    ship: (S) => `<g transform="translate(1060,560) rotate(-22) scale(.6)">${Art.ship({ damaged: false, glow: true, nozzle: true, flames: !!S.flags.coreLit })}${S.flags.coreBuilt ? '<circle cx="-40" cy="-10" r="40" fill="url(#g-core)" class="pulse"/>' : ''}</g>`,
    exit: () => Art3.deep.exit(),
  };

  // ---------------------------------------------------------------- garage extras
  const ladder = () => `<g><path d="M24,560 L52,160 M60,566 L88,166" stroke="#7a5539" stroke-width="7"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${26 + i * 3.1},${520 - i * 44} L${62 + i * 3.1},${526 - i * 44}" stroke="#7a5539" stroke-width="5"/>`).join('')}</g>`;
  const backDoor = () => `<g class="exit-arrow left"><path d="M120,780 L64,810 L120,840" stroke="#9fffe6" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M152,780 L96,810 L152,840" stroke="#9fffe6" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/></g>`;
  function endingDecor(ending) {
    if (ending === 'return') return `<g>${[[712, 312, -8, '#f3ead2'], [748, 330, 5, '#dff3ea'], [790, 318, -3, '#fbe0d0'], [826, 334, 7, '#e8e0ff']].map(([x, y, r, c]) => `<g transform="rotate(${r} ${x + 16} ${y + 12})"><rect x="${x}" y="${y}" width="34" height="24" fill="${c}" stroke="#8a7a60"/><path d="M${x + 4},${y + 8} L${x + 18},${y + 8} M${x + 4},${y + 14} L${x + 14},${y + 14}" stroke="#8a7a60" stroke-width="1.5"/><rect x="${x + 24}" y="${y + 3}" width="7" height="8" fill="#c0392b"/></g>`).join('')}</g>`;
    if (ending === 'together') return `<g transform="rotate(-3 1050 220)"><rect x="1020" y="186" width="62" height="74" fill="#f2ead8" stroke="#5a3f2e" stroke-width="4"/><rect x="1026" y="192" width="50" height="50" fill="#1a3040"/><circle cx="1040" cy="214" r="8" fill="#8d929b"/><circle cx="1062" cy="216" r="8" fill="#d8ae73"/><path d="M1030,236 Q1051,226 1072,236" stroke="#4fd1b8" stroke-width="2" fill="none"/><text x="1051" y="254" font-size="7" text-anchor="middle" fill="#3a2a20" font-family="Nunito, sans-serif" font-weight="800">CO-PILOTS</text></g>`;
    if (ending === 'stay') return `<g><rect x="1196" y="74" width="380" height="40" rx="6" fill="#2a1d1a" stroke="#e2b84a" stroke-width="3"/><text x="1386" y="102" font-size="22" text-anchor="middle" fill="#ffd36a" font-family="Fredoka, sans-serif" font-weight="600" letter-spacing="2">RACKET &amp; LYNX · REPAIRS</text></g>`;
    return '';
  }

  // ---------------------------------------------------------------- icons + schematic
  Object.assign(Art.ICONS, {
    core_regulator: `<rect x="14" y="16" width="36" height="32" rx="6" fill="#5a5f58" stroke="#232723" stroke-width="2.5"/><circle cx="32" cy="32" r="9" fill="#2ad4b0" opacity=".8"/><rect x="10" y="26" width="6" height="12" fill="#c9a052"/><rect x="48" y="26" width="6" height="12" fill="#c9a052"/><text x="32" y="56" font-size="7" text-anchor="middle" fill="#c9a052" font-family="Fredoka, sans-serif" font-weight="600">LONG SHOT</text>`,
    flux_coil: `<circle cx="32" cy="32" r="22" fill="none" stroke="url(#g-gold)" stroke-width="6"/><circle cx="32" cy="32" r="14" fill="none" stroke="url(#g-copper)" stroke-width="5"/><circle cx="32" cy="32" r="5" fill="#9fd8ff"/>`,
    first_wrench: `<g transform="rotate(-35 32 32)"><rect x="28" y="16" width="8" height="40" rx="3" fill="url(#g-metal)" stroke="#4d555b" stroke-width="1.5"/><path d="M22,18 Q20,6 32,4 Q44,6 42,18 L37,18 L37,10 L27,10 L27,18Z" fill="url(#g-metal)" stroke="#4d555b" stroke-width="1.5"/></g><text x="46" y="58" font-size="10" fill="#e2b84a" font-family="Fredoka, sans-serif" font-weight="600">10</text>`,
    monstrosity: `<path d="M14 18 L18 54 L42 54 L46 18Z" fill="#e9e2cf" stroke="#2a2420" stroke-width="2"/><rect x="15" y="34" width="30" height="6" fill="#2f6f60"/><path d="M46 24 Q56 26 54 36 Q52 44 44 44" stroke="#e9e2cf" stroke-width="5" fill="none"/><ellipse cx="30" cy="19" rx="15" ry="4" fill="#a8784e"/><path d="M22 18 q4,-3 8,0 M30 18 q4,-3 8,0" stroke="#f3e3b8" stroke-width="2" fill="none"/>`,
  });
  function coreSchematic(parts, charged, t = 0, steps = {}) {
    const rings = [70, 52, 34].map((r, i) => `<circle cx="200" cy="122" r="${r}" fill="none" stroke="${steps.spun || charged ? '#7affe4' : '#2a4a44'}" stroke-width="${3 - i * .5}" stroke-dasharray="${12 + i * 6} ${8 + i * 4}" class="${steps.spun || charged ? 'spin' : ''}" style="animation-duration:${3 + i}s"/>`).join('');
    return `<svg viewBox="0 0 400 240" class="schematic" aria-hidden="true">
      <rect width="400" height="240" fill="#0d1a17"/>
      ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="240" stroke="#173029"/>`).join('')}
      ${rings}
      ${steps.spun || charged ? `<circle cx="200" cy="122" r="${40 + t * 30}" fill="url(#g-core)" opacity=".8"/>` : ''}
      <g class="${parts.regulator ? 'part-in' : 'part-ghost'}" data-part="regulator"><rect x="70" y="100" width="54" height="44" rx="6" fill="${parts.regulator ? '#5a5f58' : 'none'}" stroke="#4fd1b8" stroke-width="2" stroke-dasharray="${parts.regulator ? 0 : '6 5'}"/>${parts.regulator ? '<text x="97" y="127" font-size="8" text-anchor="middle" fill="#c9a052" font-family="Fredoka, sans-serif">LONG SHOT</text>' : ''}</g>
      <g class="${parts.coil ? 'part-in' : 'part-ghost'}" data-part="coil"><circle cx="318" cy="122" r="24" fill="none" stroke="${parts.coil ? '#e2b84a' : '#4fd1b8'}" stroke-width="${parts.coil ? 6 : 2}" stroke-dasharray="${parts.coil ? 0 : '6 5'}"/></g>
      <path d="M124,122 L130,122 M270,122 L294,122" stroke="#4fd1b8" stroke-width="2"/>
      ${steps.primed ? '<path d="M200,230 L200,196" stroke="#2fd1b2" stroke-width="4"/><text x="208" y="224" font-size="9" fill="#2fd1b2" font-family="ui-monospace, monospace">FUEL CELL</text>' : ''}
      ${steps.tuned ? '<path d="M200,14 L200,50" stroke="#9fd8ff" stroke-width="4"/><text x="208" y="24" font-size="9" fill="#9fd8ff" font-family="ui-monospace, monospace">STAR CHART</text>' : ''}
      <text x="16" y="24" fill="#4fd1b8" font-family="ui-monospace, monospace" font-size="12">ENGINE CORE // ${charged ? 'STABLE. QUIET. PURRING.' : 'KA-THUNK. WHIRR. CLANK.'}</text>
      <text x="16" y="226" fill="#4fd1b8" font-family="ui-monospace, monospace" font-size="10" opacity=".7">REG ${parts.regulator ? 'OK' : '--'} · COIL ${parts.coil ? 'OK' : '--'} · FUEL ${steps.primed ? 'OK' : '--'} · STARS ${steps.tuned ? 'OK' : '--'} · SPIN ${steps.spun ? 'OK' : '--'}</text>
    </svg>`;
  }

  return { DEFS, yardBg, crate, toHill, hangarBg, hangar, ladder, backDoor, endingDecor, coreSchematic };
})();
