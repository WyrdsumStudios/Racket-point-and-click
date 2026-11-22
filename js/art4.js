/* Racket's Garage — art4.js
 * Phase 4 artwork: the Canyon Rim, the wreck of the luxury liner Gilded Gull, STEWARD-9,
 * Vex's truck, the hidden hull plate, new icons and the hull schematic.
 */
const Art4 = (() => {
  let seed = 1;
  const srand = (s) => { seed = s; };
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const f1 = (n) => (+n).toFixed(1);
  const sparkle = Art.sparkle;
  const ping = Art3.ping;

  const DEFS = `
  <linearGradient id="g-canyon-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2a1a3a"/><stop offset=".45" stop-color="#7a3a4a"/><stop offset=".75" stop-color="#e08a4a"/><stop offset="1" stop-color="#f2c27a"/>
  </linearGradient>
  <linearGradient id="g-mesa" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#b8583a"/><stop offset="1" stop-color="#6a2e22"/>
  </linearGradient>
  <linearGradient id="g-mesa-far" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8a4a5a"/><stop offset="1" stop-color="#5a3048"/>
  </linearGradient>
  <linearGradient id="g-chasm" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3a1a20"/><stop offset=".6" stop-color="#1a2a30"/><stop offset="1" stop-color="#0e3a3a"/>
  </linearGradient>
  <linearGradient id="g-sand" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#d8955a"/><stop offset="1" stop-color="#8a4a2a"/>
  </linearGradient>
  <linearGradient id="g-liner" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f6eedc"/><stop offset=".6" stop-color="#d8cbb0"/><stop offset="1" stop-color="#8a7a60"/>
  </linearGradient>
  <linearGradient id="g-gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffe08a"/><stop offset=".5" stop-color="#d9a441"/><stop offset="1" stop-color="#8a6420"/>
  </linearGradient>`;

  // ---------- characters ----------
  function steward(mood = 'polite') {
    const eye = { polite: '#7affe4', alarm: '#ff7a6a', happy: '#ffe46a' }[mood] || '#7affe4';
    return `<g class="steward">
      <ellipse cx="0" cy="0" rx="46" ry="9" fill="#000" opacity=".35"/>
      <path d="M-14,-150 L-20,-10 L-34,0 L-6,0 L-2,-150Z M14,-150 L20,-10 L34,0 L6,0 L2,-150Z" fill="#b8a888" stroke="#5a4a30" stroke-width="2"/>
      <circle cx="-11" cy="-80" r="5" fill="url(#g-gold)"/><circle cx="11" cy="-80" r="5" fill="url(#g-gold)"/>
      <g class="st-upper">
        <path d="M-40,-300 Q-46,-210 -26,-150 L26,-150 Q46,-210 40,-300 Q0,-312 -40,-300Z" fill="#f2e8d0" stroke="#5a4a30" stroke-width="3"/>
        <path d="M-40,-300 L-24,-150 M40,-300 L24,-150" stroke="#d8c8a8" stroke-width="4"/>
        <path d="M-30,-296 L22,-170" stroke="#c4643a" stroke-width="9"/>
        <text x="-2" y="-228" font-size="9" fill="#fff3e0" font-family="Fredoka, sans-serif" font-weight="600" transform="rotate(66 -2 -228)">STEWARD</text>
        ${[-270, -245, -220].map((y) => `<circle cx="0" cy="${y}" r="4" fill="url(#g-gold)"/>`).join('')}
        <path d="M-40,-290 L-72,-230 L-80,-190" stroke="#b8a888" stroke-width="12" stroke-linecap="round" fill="none"/>
        <ellipse cx="-80" cy="-186" rx="40" ry="7" fill="url(#g-gold)" stroke="#8a6420" stroke-width="2"/>
        <path d="M40,-290 L64,-240 L56,-200" stroke="#b8a888" stroke-width="12" stroke-linecap="round" fill="none"/>
        <circle cx="56" cy="-196" r="9" fill="#d8c8a8"/>
        <rect x="-8" y="-322" width="16" height="22" fill="#8a7a60"/>
        <path d="M-18,-306 L0,-298 L18,-306 L18,-292 L0,-300 L-18,-292Z" fill="#23252a"/>
        <circle cx="0" cy="-354" r="34" fill="#f2e8d0" stroke="#5a4a30" stroke-width="3"/>
        <rect x="-26" y="-366" width="52" height="22" rx="11" fill="#1a1c22"/>
        <circle cx="0" cy="-355" r="8" fill="${eye}"/><circle cx="0" cy="-355" r="16" fill="${eye}" opacity=".25"/>
        <path d="M-18,-388 L-22,-402 M18,-388 L22,-402" stroke="#8a7a60" stroke-width="3"/><circle cx="-22" cy="-404" r="4" fill="url(#g-gold)"/><circle cx="22" cy="-404" r="4" fill="url(#g-gold)"/>
        <path d="M-12,-332 Q0,-326 12,-332" stroke="#8a7a60" stroke-width="2" fill="none"/>
      </g>
    </g>`;
  }
  const stewardPortrait = (m) => `<svg viewBox="-100 -430 200 200" aria-hidden="true">${steward(m)}</svg>`;

  // ---------- canyon rim ----------
  function rimBg(S) {
    srand(4040);
    let s = `<rect width="1600" height="900" fill="url(#g-canyon-sky)"/>
      <circle cx="1240" cy="380" r="70" fill="#ffe8b0" opacity=".85"/><circle cx="1240" cy="380" r="160" fill="#ffd08a" opacity=".15" filter="url(#f-blur24)"/>`;
    for (let i = 0; i < 30; i++) s += `<circle cx="${(rnd() * 1600) | 0}" cy="${(rnd() * 200) | 0}" r="${f1(rnd() * 1.2 + .3)}" fill="#fff" opacity="${f1(rnd() * .5 + .2)}"/>`;
    // far mesas
    s += `<path d="M0,500 L120,500 L150,452 L340,452 L370,500 L520,500 L560,440 L760,440 L790,490 L1000,490 L1040,430 L1230,430 L1260,482 L1440,482 L1480,446 L1600,446 L1600,600 L0,600Z" fill="url(#g-mesa-far)"/>
      <path d="M0,530 L1600,530" stroke="#e8a06a" stroke-width="3" opacity=".25"/>`;
    // the chasm with the liner far below
    s += `<path d="M560,900 L600,600 Q840,560 1100,600 L1140,900Z" fill="url(#g-chasm)"/>
      <path d="M640,760 Q850,720 1060,760" stroke="#7affe4" stroke-width="30" opacity=".12" filter="url(#f-blur10)"/>
      <g opacity=".85"><path d="M760,800 L960,770 L990,792 L770,826Z" fill="#e8dcc0"/><path d="M770,806 L980,778" stroke="url(#g-gold)" stroke-width="3"/>${[790, 820, 850, 880, 910].map((x, i) => `<circle cx="${x}" cy="${798 - i * 4}" r="2.5" fill="#ffe8a0"/>`).join('')}</g>
      ${sparkle(880, 786, .5, .4)}`;
    // near rims
    s += `<path d="M0,620 Q300,600 600,600 L560,900 L0,900Z" fill="url(#g-mesa)"/>
      <path d="M1100,600 Q1350,596 1600,610 L1600,900 L1140,900Z" fill="url(#g-mesa)"/>
      <path d="M0,660 Q300,644 590,648 M1108,650 Q1350,646 1600,660" stroke="#e8a06a" stroke-width="5" opacity=".35" fill="none"/>
      <path d="M0,740 Q300,724 576,730 M1124,730 Q1350,726 1600,742" stroke="#4fd1b8" stroke-width="4" opacity=".25" fill="none"/>`;
    srand(13);
    for (let i = 0; i < 14; i++) { const x = rnd() < .5 ? rnd() * 520 : 1150 + rnd() * 430, y = 650 + rnd() * 220; s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(10 + rnd() * 20)}" ry="${f1(5 + rnd() * 8)}" fill="#5a2a1c"/>`; }
    // arch rock
    s += `<path d="M1260,610 L1280,420 Q1360,360 1440,420 L1470,610 L1430,610 L1420,470 Q1360,430 1310,470 L1300,610Z" fill="#9a4a30" stroke="#5a2a1c" stroke-width="3"/>`;
    return s;
  }
  const rim = {
    bridge: (fixed) => `<g>
      <rect x="586" y="540" width="14" height="80" fill="#5a3f2e"/><rect x="1100" y="540" width="14" height="80" fill="#5a3f2e"/>
      ${fixed
        ? `<path d="M600,560 Q850,640 1100,560" stroke="#c9a06a" stroke-width="4" fill="none"/><path d="M600,600 Q850,680 1100,600" stroke="#c9a06a" stroke-width="4" fill="none"/>
           ${Array.from({ length: 16 }, (_, i) => { const t = (i + .5) / 16, x = 600 + 500 * t, y = 600 + 80 * 4 * t * (1 - t) * .5 * 2; return `<rect x="${f1(x - 12)}" y="${f1(y - 4)}" width="24" height="9" rx="2" fill="#8a5a34" stroke="#4a2e1a"/>`; }).join('')}`
        : `<path d="M600,560 Q640,620 650,700 M600,600 Q630,660 640,760 M1100,560 Q1070,620 1060,690 M1100,600 Q1080,660 1074,740" stroke="#c9a06a" stroke-width="4" fill="none"/>
           <rect x="630" y="690" width="22" height="8" fill="#8a5a34" transform="rotate(70 640 694)"/><rect x="1050" y="680" width="22" height="8" fill="#8a5a34" transform="rotate(-60 1060 684)"/>`}
    </g>`,
    truck: () => `<g>
      <ellipse cx="240" cy="690" rx="190" ry="18" fill="#000" opacity=".35"/>
      <path d="M70,660 L70,590 Q72,570 96,568 L230,566 L262,520 Q270,510 286,510 L360,510 Q386,512 392,540 L404,600 L404,660Z" fill="#4a3a6a" stroke="#23182e" stroke-width="3"/>
      <path d="M272,528 L352,528 L366,584 L262,584Z" fill="#2a3a50" stroke="#23182e" stroke-width="2"/>
      <rect x="80" y="530" width="64" height="40" fill="#8a5a34" stroke="#4a2e1a" stroke-width="2"/><rect x="150" y="540" width="56" height="30" fill="#7a4a2c" stroke="#4a2e1a" stroke-width="2"/>
      <circle cx="120" cy="530" r="20" fill="none" stroke="#c9a06a" stroke-width="6"/>
      <circle cx="140" cy="664" r="28" fill="#1a1416" stroke="#3a3040" stroke-width="5"/><circle cx="140" cy="664" r="10" fill="#d9a441"/>
      <circle cx="340" cy="664" r="28" fill="#1a1416" stroke="#3a3040" stroke-width="5"/><circle cx="340" cy="664" r="10" fill="#d9a441"/>
      ${[100, 160, 220].map((x, i) => `<circle cx="${x}" cy="610" r="10" fill="${['#c9d0d6', '#e2b84a', '#c9d0d6'][i]}" stroke="#6d767c" stroke-width="2"/>`).join('')}
      <rect x="396" y="612" width="14" height="10" rx="2" fill="#ffe46a"/>
      <text x="200" y="645" font-size="14" text-anchor="middle" fill="#e2b84a" font-family="Fredoka, sans-serif" font-weight="600">VEX'S SALVAGE</text>
    </g>`,
    exitLeft: () => Art3.deep.exit(),
    down: () => `<g class="exit-arrow"><path d="M1500,720 L1556,750 L1500,780" stroke="#ffe0a0" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M1468,720 L1524,750 L1468,780" stroke="#ffe0a0" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/></g>`,
  };

  // ---------- the Gilded Gull ----------
  function gullBg() {
    srand(7070);
    let s = `<rect width="1600" height="900" fill="url(#g-canyon-sky)"/>
      <path d="M0,0 L380,0 L420,200 L360,420 L400,900 L0,900Z" fill="url(#g-mesa)"/>
      <path d="M1600,0 L1240,0 L1200,230 L1260,460 L1220,900 L1600,900Z" fill="url(#g-mesa)"/>
      <path d="M0,300 L390,320 M0,520 L380,540 M1600,280 L1210,300 M1600,540 L1240,520" stroke="#4fd1b8" stroke-width="5" opacity=".25"/>
      <path d="M0,200 L410,214 M1600,180 L1220,196" stroke="#e8a06a" stroke-width="4" opacity=".3"/>`;
    // the liner
    s += `<path d="M120,620 Q100,420 260,330 L1300,250 Q1480,260 1540,420 L1500,600 Q1200,640 120,640Z" fill="url(#g-liner)" stroke="#5a4a30" stroke-width="5"/>
      <path d="M150,470 Q600,410 1520,400" stroke="url(#g-gold)" stroke-width="16" fill="none"/>
      <path d="M150,500 Q600,444 1510,430" stroke="#c4643a" stroke-width="5" fill="none" opacity=".7"/>
      <path d="M300,330 L360,240 L1180,190 L1260,250" fill="#e8dcc0" stroke="#5a4a30" stroke-width="4"/>
      ${Array.from({ length: 14 }, (_, i) => `<circle cx="${300 + i * 70}" cy="${380 - i * 4}" r="12" fill="#2a3a40" stroke="url(#g-gold)" stroke-width="3"/>`).join('')}
      ${Array.from({ length: 10 }, (_, i) => `<rect x="${400 + i * 76}" y="${232 - i * 3.5}" width="40" height="22" rx="4" fill="#2a3a40" stroke="url(#g-gold)" stroke-width="2"/>`).join('')}
      <text x="900" y="370" font-size="40" text-anchor="middle" fill="#8a6420" font-family="Fredoka, sans-serif" font-weight="600" letter-spacing="10" transform="rotate(-3 900 370)">GILDED GULL</text>
      <path d="M880,190 L900,90 L960,92 L950,188Z" fill="#c4643a" stroke="#5a2a1c" stroke-width="3"/><rect x="884" y="110" width="68" height="14" fill="url(#g-gold)"/>`;
    // sand + debris
    s += `<path d="M0,640 Q400,600 800,630 T1600,620 L1600,900 L0,900Z" fill="url(#g-sand)"/>
      <path d="M1300,640 Q1420,560 1560,600 L1600,660 L1280,670Z" fill="#c9884e"/>`;
    srand(71);
    for (let i = 0; i < 8; i++) { const x = rnd() * 1500 + 50, y = 680 + rnd() * 180; s += `<path d="M${f1(x)},${f1(y)} q30,-10 60,0" stroke="#7a4a2a" stroke-width="4" fill="none" opacity=".6"/>`; }
    s += `<g transform="translate(1180,760) rotate(-12)"><rect x="-40" y="-8" width="80" height="12" rx="3" fill="#f2e8d0" stroke="#8a7a60"/><path d="M-30,4 L-36,30 M30,4 L36,30" stroke="#8a7a60" stroke-width="5"/><path d="M-36,-8 L-50,-40" stroke="#f2e8d0" stroke-width="10"/></g>
      <g transform="translate(260,760)"><circle r="26" fill="none" stroke="#e0503c" stroke-width="12"/><circle r="26" fill="none" stroke="#fff" stroke-width="12" stroke-dasharray="20 20"/></g>`;
    return s;
  }
  const gull = {
    gangway: () => `<g>
      <path d="M620,640 L640,460 L740,450 L760,640Z" fill="#2a2420" stroke="#5a4a30" stroke-width="4"/>
      <path d="M640,460 Q690,420 740,450" stroke="url(#g-gold)" stroke-width="6" fill="none"/>
      <path d="M560,700 L630,630 L770,630 L840,700Z" fill="#8a7a60" stroke="#5a4a30" stroke-width="3"/>
      <path d="M580,690 L640,636 M820,690 L760,636" stroke="url(#g-gold)" stroke-width="4"/>
    </g>`,
    plates: (S) => `<g>
      ${[[1080, 320], [1170, 312], [1260, 304]].map(([x, y], i) => `<path d="M${x},${y} L${x + 80},${y - 6} L${x + 84},${y + 120} L${x + 4},${y + 126}Z" fill="${S.flags.platesGot ? '#5a5048' : 'url(#g-liner)'}" stroke="#5a4a30" stroke-width="3"/>
        ${S.flags.platesGot ? '' : [[10, 10], [70, 6], [12, 112], [74, 108]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="4" fill="url(#g-gold)"/>`).join('')}`).join('')}
      ${S.flags.platesGot ? '' : `${sparkle(1210, 360, .7, .4)}`}
    </g>`,
    purser: (S) => `<g>
      <rect x="300" y="420" width="220" height="150" rx="10" fill="#2a2420" stroke="url(#g-gold)" stroke-width="5"/>
      <rect x="316" y="436" width="188" height="118" rx="6" fill="#3a2a30"/>
      <path d="M330,520 L490,520 L490,554 L330,554Z" fill="#6a3a2a"/>
      <text x="410" y="470" font-size="16" text-anchor="middle" fill="#ffe08a" font-family="Fredoka, sans-serif" font-weight="600">PURSER</text>
      ${S.flags.rivetsGot ? '' : `<rect x="390" y="494" width="40" height="26" rx="4" fill="#bff3ff" opacity=".4" stroke="#8a7a60"/>${[396, 404, 412, 420].map((x) => `<circle cx="${x}" cy="510" r="3" fill="url(#g-gold)"/>`).join('')}${S.flags.boarded ? sparkle(410, 500, .6, 1.2) : ''}`}
    </g>`,
    exitLeft: () => Art3.deep.exit(),
  };

  const hiddenPlate = () => `<g><path d="M846,604 L930,598 L934,618 L848,624Z" fill="url(#g-liner)" stroke="#5a4a30" stroke-width="2"/><circle cx="856" cy="610" r="2.5" fill="url(#g-gold)"/><circle cx="922" cy="606" r="2.5" fill="url(#g-gold)"/>${ping(890, 612)}</g>`;

  Object.assign(Art.ICONS, {
    hull_plates: `<path d="M8 14 L40 10 L42 50 L10 54Z" fill="#e8dcc0" stroke="#5a4a30" stroke-width="2"/><path d="M22 18 L54 14 L56 52 L24 56Z" fill="#f6eedc" stroke="#5a4a30" stroke-width="2"/>${[[28, 20], [50, 18], [30, 50], [52, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#d9a441"/>`).join('')}`,
    gold_rivets: `<rect x="14" y="18" width="36" height="38" rx="6" fill="#bff3ff" opacity=".45" stroke="#7fb8c4" stroke-width="2"/><rect x="12" y="12" width="40" height="8" rx="3" fill="#8a7a60"/>${[[22, 34], [32, 30], [42, 36], [26, 46], [38, 46], [32, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#e2b84a" stroke="#8a6420" stroke-width="1"/>`).join('')}`,
    rivet_gun: `<path d="M10 24 L44 24 L44 38 L28 38 L24 54 L14 54 L16 38 L10 38Z" fill="#2f6f60" stroke="#1f4f43" stroke-width="2"/><rect x="44" y="27" width="12" height="8" fill="#a9b1b7"/><circle cx="58" cy="31" r="2.5" fill="#e2b84a"/>`,
    moss_sealant: `<path d="M12 40 Q10 22 28 20 Q34 10 46 18 Q58 22 54 38 Q52 52 32 52 Q14 52 12 40Z" fill="#4a7a3a"/><circle cx="26" cy="32" r="3" fill="#9fffd0"/><circle cx="40" cy="28" r="3" fill="#9fffd0"/><circle cx="36" cy="42" r="2.5" fill="#9fffd0"/><path d="M18 36 Q24 30 30 34" stroke="#7aaa5a" stroke-width="3" fill="none"/>`,
    boarding_pass: `<rect x="6" y="18" width="52" height="28" rx="4" fill="#f6eedc" stroke="#8a6420" stroke-width="2"/><path d="M42 18 L42 46" stroke="#8a6420" stroke-width="1.5" stroke-dasharray="3 3"/><text x="24" y="30" font-size="6" text-anchor="middle" fill="#8a6420" font-family="Fredoka, sans-serif" font-weight="600">GILDED</text><text x="24" y="38" font-size="6" text-anchor="middle" fill="#8a6420" font-family="Fredoka, sans-serif" font-weight="600">GULL</text><circle cx="50" cy="32" r="4" fill="#d9a441"/>`,
  });

  function hullSchematic(parts, charged, t = 0, extra = {}) {
    return `<svg viewBox="0 0 400 240" class="schematic" aria-hidden="true">
      <rect width="400" height="240" fill="#0d1a17"/>
      ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="240" stroke="#173029"/>`).join('')}
      <path d="M40,140 Q30,100 70,82 L280,70 Q350,74 370,120 Q350,160 280,166 L80,166 Q50,166 40,140Z" fill="none" stroke="#4fd1b8" stroke-width="2"/>
      <g class="${parts.plates ? 'part-in' : 'part-ghost'}" data-part="plates">${[[110, 86], [170, 82], [230, 80]].map(([x, y]) => `<rect x="${x}" y="${y}" width="50" height="70" rx="4" fill="${parts.plates ? '#e8dcc0' : 'none'}" stroke="#4fd1b8" stroke-width="2" stroke-dasharray="${parts.plates ? 0 : '5 4'}"/>`).join('')}</g>
      ${extra.riveted || charged ? [[110, 86], [170, 82], [230, 80]].map(([x, y]) => [[6, 6], [44, 6], [6, 64], [44, 64], [25, 6], [25, 64]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="2.6" fill="#e2b84a"/>`).join('')).join('') : ''}
      <g class="${parts.sealant ? 'part-in' : 'part-ghost'}" data-part="sealant"><path d="M108,84 L282,76 M108,158 L282,152" stroke="${parts.sealant ? '#9fffd0' : '#4fd1b8'}" stroke-width="${parts.sealant ? 5 : 2}" stroke-dasharray="${parts.sealant ? 0 : '5 4'}" opacity=".85"/></g>
      ${t > 0 ? `<rect x="40" y="70" width="${330 * t}" height="96" fill="#7affe4" opacity=".12"/>` : ''}
      <text x="16" y="24" fill="#4fd1b8" font-family="ui-monospace, monospace" font-size="12">HULL // ${charged ? 'SEALED. NO FACE-SHAPED DENTS.' : 'THREE BREACHES, ONE DENT SHAPED LIKE A FACE'}</text>
      <text x="16" y="226" fill="#4fd1b8" font-family="ui-monospace, monospace" font-size="11" opacity=".7">PLATES ${parts.plates ? 'OK' : '--'} · RIVETS ${extra.riveted ? 'OK' : '--'} · SEAL ${parts.sealant ? 'OK' : '--'}</text>
    </svg>`;
  }

  return { DEFS, steward, stewardPortrait, rimBg, rim, gullBg, gull, hiddenPlate, hullSchematic };
})();
