/* Racket's Garage — art2.js
 * Phase 2 artwork: the Junkyard, Scrapqueen Vex, the Woods Edge, the garage roof,
 * new item icons, the thruster schematic and mini-game pieces. Same 1600x900 canvas.
 */
const Art2 = (() => {
  let seed = 1;
  const srand = (s) => { seed = s; };
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const f1 = (n) => (+n).toFixed(1);
  const sparkle = Art.sparkle;

  const DEFS = `
  <linearGradient id="g-junk-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#140f14"/><stop offset=".45" stop-color="#2c1d1f"/><stop offset=".75" stop-color="#5a3a2c"/><stop offset="1" stop-color="#7a5236"/>
  </linearGradient>
  <linearGradient id="g-junk-ground" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3b3027"/><stop offset=".5" stop-color="#2a221c"/><stop offset="1" stop-color="#14100d"/>
  </linearGradient>
  <linearGradient id="g-flood" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffe8b0" stop-opacity=".45"/><stop offset="1" stop-color="#ffd28a" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="g-rust" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#9a5a34"/><stop offset="1" stop-color="#5a2f1a"/>
  </linearGradient>
  <linearGradient id="g-crane" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#e2b23a"/><stop offset="1" stop-color="#9a6e1c"/>
  </linearGradient>
  <linearGradient id="g-wood-dusk" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0b1420"/><stop offset=".45" stop-color="#1c2f3e"/><stop offset=".8" stop-color="#3a4a52"/><stop offset="1" stop-color="#4a4038"/>
  </linearGradient>
  <linearGradient id="g-roof-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#050a16"/><stop offset=".55" stop-color="#0c2234"/><stop offset="1" stop-color="#1d4a4a"/>
  </linearGradient>
  <radialGradient id="g-amber-glow">
    <stop offset="0" stop-color="#ffc24a" stop-opacity=".8"/><stop offset=".5" stop-color="#ff8a2a" stop-opacity=".25"/><stop offset="1" stop-color="#ff6a1a" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="g-torch-glow">
    <stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".3" stop-color="#9fe8ff" stop-opacity=".6"/><stop offset="1" stop-color="#4fb8ff" stop-opacity="0"/>
  </radialGradient>`;

  // =====================================================================
  //  SCRAPQUEEN VEX — a tall magpie salvage dealer. Feet at (0,0).
  // =====================================================================
  function vex(mood = 'smug') {
    const B = '#1c1d24', BL = '#2d2f3a', W = '#eeece6', IR = '#2fb3a8', IR2 = '#5a6fe0', A = '#7a4a2c', AD = '#55321d', BK = '#3c3d44', G = '#e2b84a';
    const lid = {
      smug: `<path d="M-19,-470 L3,-470 L3,-459 L-19,-461Z" fill="${B}"/>`,
      annoyed: `<path d="M-19,-472 L3,-472 L3,-458 L-19,-464Z" fill="${B}"/>`,
      delight: '',
      neutral: `<path d="M-19,-472 L3,-472 L3,-465 L-19,-465Z" fill="${B}"/>`,
    }[mood] ?? '';
    const brow = {
      smug: 'M-22,-474 L5,-478', shock: 'M-22,-482 Q-8,-489 5,-482', annoyed: 'M-22,-478 L5,-470', delight: 'M-22,-480 Q-8,-487 5,-480', neutral: 'M-22,-476 L5,-476',
    }[mood];
    const mouth = mood === 'delight'
      ? `<path d="M-30,-436 Q-44,-430 -58,-436" stroke="#111" stroke-width="2" fill="none"/>`
      : `<path d="M-22,-438 L-52,-438" stroke="#111" stroke-width="2"/>`;
    return `<g class="vex">
      <ellipse cx="0" cy="0" rx="70" ry="12" fill="#000" opacity=".35"/>
      <!-- tail feathers -->
      <g class="v-tail">
        <path d="M20,-250 Q70,-150 96,-20 L72,-16 Q52,-140 2,-236Z" fill="${B}"/>
        <path d="M24,-238 Q66,-150 86,-30" stroke="${IR}" stroke-width="5" fill="none" opacity=".8"/>
        <path d="M10,-248 Q46,-140 54,-30 L36,-28 Q30,-140 -6,-236Z" fill="${BL}"/>
        <path d="M14,-236 Q40,-150 46,-40" stroke="${IR2}" stroke-width="4" fill="none" opacity=".7"/>
      </g>
      <!-- legs + boots -->
      <path d="M-34,-260 L-4,-260 L-8,-130 L-12,-46 L-36,-46 L-38,-130Z" fill="#3a3a44"/>
      <path d="M4,-260 L34,-260 L34,-130 L32,-46 L8,-46 L6,-130Z" fill="#2e2e37"/>
      <path d="M-38,-56 L-10,-56 L-8,0 L-56,0 Q-58,-16 -40,-22Z" fill="#241d1a"/>
      <path d="M8,-56 L34,-56 L40,-22 Q58,-16 56,0 L6,0Z" fill="#1e1816"/>
      <rect x="-58" y="-6" width="50" height="6" rx="2" fill="#0e0b0a"/><rect x="6" y="-6" width="52" height="6" rx="2" fill="#0e0b0a"/>
      <circle cx="-24" cy="-40" r="2.5" fill="${G}"/><circle cx="20" cy="-40" r="2.5" fill="${G}"/>
      <g class="v-upper">
        <!-- torso -->
        <path d="M-50,-400 Q-58,-320 -44,-252 L44,-252 Q58,-320 50,-400 Q0,-414 -50,-400Z" fill="${B}"/>
        <path d="M-30,-404 Q0,-394 30,-404 Q34,-340 22,-290 L-22,-290 Q-34,-340 -30,-404Z" fill="${W}"/>
        <path d="M-50,-398 Q-62,-370 -58,-340" stroke="${IR}" stroke-width="7" fill="none" opacity=".75"/>
        <path d="M50,-398 Q62,-370 58,-340" stroke="${IR2}" stroke-width="7" fill="none" opacity=".7"/>
        <!-- welding apron -->
        <path d="M-36,-360 L36,-360 L46,-150 Q0,-138 -46,-150Z" fill="${A}"/>
        <path d="M-36,-360 L-46,-398 M36,-360 L46,-398" stroke="${AD}" stroke-width="6"/>
        <rect x="-24" y="-300" width="48" height="30" rx="4" fill="${AD}"/>
        <path d="M-12,-300 L-12,-322 M4,-300 L8,-326" stroke="#a9b1b7" stroke-width="3"/>
        <path d="M-30,-230 Q-10,-222 8,-236 M10,-190 Q24,-184 36,-196" stroke="#2a180e" stroke-width="3" fill="none" opacity=".6"/>
        <ellipse cx="22" cy="-210" rx="9" ry="5" fill="#2a180e" opacity=".4"/>
        <!-- washer necklace -->
        <path d="M-26,-402 Q0,-372 26,-402" stroke="#8a8f96" stroke-width="2" fill="none"/>
        ${[-16, -6, 6, 16].map((x, i) => `<circle cx="${x}" cy="${-388 + (i === 1 || i === 2 ? 6 : 0)}" r="4.5" fill="none" stroke="${i === 1 ? G : '#b9c0c7'}" stroke-width="2.5"/>`).join('')}
        <!-- crossed arms -->
        <path d="M-48,-392 L-62,-330" stroke="${B}" stroke-width="27" stroke-linecap="round"/>
        <path d="M48,-392 L62,-330" stroke="${B}" stroke-width="27" stroke-linecap="round"/>
        <path d="M-62,-332 L34,-318" stroke="${BL}" stroke-width="22" stroke-linecap="round"/>
        <path d="M62,-322 L-30,-306" stroke="${B}" stroke-width="22" stroke-linecap="round"/>
        <path d="M-56,-326 L-30,-320" stroke="${IR}" stroke-width="4" opacity=".6"/>
        <ellipse cx="40" cy="-318" rx="14" ry="11" fill="#c9a26a"/><ellipse cx="-36" cy="-306" rx="14" ry="11" fill="#b8915a"/>
        <!-- neck + goggles -->
        <rect x="-15" y="-428" width="30" height="30" rx="8" fill="${B}"/>
        <path d="M-30,-408 Q0,-392 30,-408" stroke="#4a3020" stroke-width="5" fill="none"/>
        <circle cx="-12" cy="-404" r="8" fill="#2a3a40" stroke="${G}" stroke-width="3"/><circle cx="12" cy="-404" r="8" fill="#2a3a40" stroke="${G}" stroke-width="3"/>
        <g class="v-head">
          <!-- crest -->
          <path d="M-20,-484 L-30,-526 L-12,-498 L-8,-540 L4,-500 L16,-530 L18,-492 L34,-512 L28,-480Z" fill="${B}"/>
          <path d="M-30,-526 L-24,-512 M-8,-540 L-6,-522 M16,-530 L14,-514" stroke="${IR}" stroke-width="3" stroke-linecap="round"/>
          <ellipse cx="0" cy="-456" rx="40" ry="40" fill="${B}"/>
          <path d="M30,-470 Q42,-456 34,-436" stroke="${IR2}" stroke-width="4" fill="none" opacity=".6"/>
          <!-- eye (3/4 view, facing left) -->
          <ellipse cx="-8" cy="-462" rx="11" ry="10" fill="#f6f2e6"/>
          <circle cx="-10" cy="-462" r="6.2" fill="#3a1e10"/><circle cx="-10" cy="-462" r="3" fill="#000"/><circle cx="-7.5" cy="-465" r="2" fill="#fff"/>
          ${mood === 'delight' ? '<path d="M-4,-472 l2,-6 l2,6 l6,2 l-6,2 l-2,6 l-2,-6 l-6,-2Z" fill="#fff8d0"/>' : ''}
          ${lid}
          <ellipse class="lid" cx="-8" cy="-462" rx="12" ry="11" fill="${B}"/>
          <path d="${brow}" stroke="${IR}" stroke-width="4" stroke-linecap="round"/>
          <circle cx="22" cy="-464" r="4" fill="#f6f2e6"/><circle cx="21" cy="-464" r="2.2" fill="#000"/>
          <!-- beak -->
          <path d="M-22,-450 L-66,-440 L-22,-428Z" fill="${BK}"/>
          <path d="M-22,-450 L-66,-440" stroke="#5a5b62" stroke-width="2"/>
          ${mouth}
          <path d="M-50,-436 L-70,-424" stroke="#d9c48a" stroke-width="2.5" stroke-linecap="round"/>
          <!-- gold hoop -->
          <circle cx="28" cy="-430" r="7" fill="none" stroke="${G}" stroke-width="3"/>
        </g>
      </g>
    </g>`;
  }
  const vexPortrait = (mood) => `<svg viewBox="-110 -560 210 210" aria-hidden="true">${vex(mood || 'smug')}</svg>`;

  // =====================================================================
  //  JUNKYARD
  // =====================================================================
  function junkBg() {
    srand(301);
    let s = `<rect width="1600" height="900" fill="url(#g-junk-sky)"/>`;
    for (let i = 0; i < 50; i++) s += `<circle cx="${(rnd() * 1600) | 0}" cy="${(rnd() * 260) | 0}" r="${f1(rnd() * 1.3 + .4)}" fill="#fff" opacity="${f1(rnd() * .4 + .1)}"/>`;
    s += `<circle cx="1240" cy="120" r="34" fill="#e8d8c0" opacity=".85"/><circle cx="1240" cy="120" r="90" fill="#e8c890" opacity=".08" filter="url(#f-blur10)"/>`;
    // distant scrap mountains
    const heap = (base, amp, col, sd) => {
      srand(sd); let d = `M0,${base}`;
      for (let x = 0; x <= 1600; x += 40) d += ` L${x + 20},${f1(base - amp * (.3 + rnd()))} L${x + 40},${f1(base - amp * rnd() * .6)}`;
      return `<path d="${d} L1600,900 L0,900Z" fill="${col}"/>`;
    };
    s += heap(470, 170, '#22181a', 5) + heap(520, 120, '#1a1314', 9);
    // silhouettes of junk on the far heaps
    srand(44);
    for (let i = 0; i < 12; i++) {
      const x = rnd() * 1600, y = 360 + rnd() * 110;
      s += i % 3 ? `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(30 + rnd() * 50)}" height="${f1(16 + rnd() * 26)}" fill="#120d0e" transform="rotate(${f1(rnd() * 40 - 20)} ${f1(x)} ${f1(y)})"/>` : `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(14 + rnd() * 16)}" fill="none" stroke="#120d0e" stroke-width="9"/>`;
    }
    // chain-link fence
    s += `<g opacity=".55"><rect x="0" y="470" width="1600" height="4" fill="#5a5048"/>`;
    for (let x = 0; x < 1600; x += 22) s += `<path d="M${x},474 L${x + 22},560 M${x + 22},474 L${x},560" stroke="#4a4038" stroke-width="1.4"/>`;
    for (let x = 60; x < 1600; x += 220) s += `<rect x="${x}" y="456" width="7" height="110" fill="#5a5048"/>`;
    s += `</g>`;
    // ground
    s += `<path d="M0,560 Q400,548 800,560 T1600,556 L1600,900 L0,900Z" fill="url(#g-junk-ground)"/>`;
    srand(12);
    for (let i = 0; i < 6; i++) { const x = 200 + rnd() * 1200, y = 740 + rnd() * 130; s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(50 + rnd() * 70)}" ry="${f1(8 + rnd() * 10)}" fill="#0b0a0e" opacity=".6"/><ellipse cx="${f1(x - 10)}" cy="${f1(y - 2)}" rx="${f1(30)}" ry="3" fill="#7a5ab0" opacity=".25"/>`; }
    for (let i = 0; i < 22; i++) { const x = rnd() * 1600, y = 600 + rnd() * 280; s += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(6 + rnd() * 16)}" height="${f1(3 + rnd() * 5)}" fill="${['#6a5a4a', '#8a6a3a', '#4a5a5a'][i % 3]}" transform="rotate(${f1(rnd() * 180)} ${f1(x)} ${f1(y)})"/>`; }
    // floodlight poles
    [120, 1080].forEach((x) => {
      s += `<rect x="${x - 5}" y="140" width="10" height="440" fill="#2a2522"/><rect x="${x - 40}" y="128" width="80" height="22" rx="4" fill="#3a3530"/>
        ${[-26, 0, 26].map((d) => `<circle cx="${x + d}" cy="139" r="8" fill="#fff4d0"/>`).join('')}`;
    });
    return s;
  }
  function junkFg() {
    return `<g pointer-events="none" style="mix-blend-mode:screen">
      <path d="M80,150 L160,150 L460,820 L-200,820Z" fill="url(#g-flood)"/>
      <path d="M1040,150 L1120,150 L1460,820 L760,820Z" fill="url(#g-flood)"/>
      <ellipse cx="130" cy="140" rx="90" ry="40" fill="#fff0c0" opacity=".25" filter="url(#f-blur10)"/>
      <ellipse cx="1090" cy="140" rx="90" ry="40" fill="#fff0c0" opacity=".25" filter="url(#f-blur10)"/>
    </g>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<circle class="mote" style="animation-delay:${i * 1.7}s" cx="${180 + i * 210}" cy="${330 + (i % 2) * 120}" r="2" fill="#ffe0a0" pointer-events="none"/>`).join('')}`;
  }

  const junk = {
    tires: (left) => `<g>
      <ellipse cx="96" cy="722" rx="96" ry="14" fill="#000" opacity=".45"/>
      ${[[40, 690], [110, 694], [74, 652], [146, 656], [56, 612], [124, 616], [90, 574]].slice(0, left > 0 ? 7 : 5).map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="40" ry="26" fill="#1c1c1e" stroke="#2c2c30" stroke-width="3"/><ellipse cx="${x}" cy="${y}" rx="18" ry="10" fill="#0a0a0b"/>`).join('')}
      ${left > 0 ? sparkle(96, 600, .6, .3) : ''}
      <rect x="20" y="520" width="80" height="22" rx="3" fill="#c9a052" transform="rotate(-8 60 530)"/>
      <text x="60" y="536" font-size="13" text-anchor="middle" fill="#3a2a10" font-family="Fredoka, sans-serif" font-weight="600" transform="rotate(-8 60 530)">TIRE MTN</text>
    </g>`,
    appliances: (left) => `<g>
      <ellipse cx="1080" cy="722" rx="110" ry="14" fill="#000" opacity=".45"/>
      <rect x="990" y="610" width="90" height="110" rx="6" fill="#c9c2ae" stroke="#7d7564" stroke-width="3"/><rect x="1000" y="622" width="70" height="40" rx="4" fill="#9aa39e"/><circle cx="1035" cy="690" r="16" fill="#4a5a5a" stroke="#7d7564" stroke-width="3"/>
      <rect x="1080" y="580" width="100" height="140" rx="6" fill="#7a9a8a" stroke="#4a5a52" stroke-width="3" transform="rotate(6 1130 650)"/>
      <rect x="1090" y="596" width="14" height="40" rx="3" fill="#c9d0d6" transform="rotate(6 1130 650)"/>
      <rect x="1010" y="530" width="120" height="80" rx="8" fill="#8a4a3a" stroke="#4a2a20" stroke-width="3" transform="rotate(-10 1070 570)"/>
      <circle cx="1050" cy="566" r="22" fill="#2a1a16" transform="rotate(-10 1070 570)"/>
      <path d="M1140,540 L1170,500 L1186,512 L1158,550Z" fill="#a9b1b7"/>
      ${left > 0 ? sparkle(1100, 560, .6, 1.2) : ''}
    </g>`,
    shiny: (left) => `<g>
      <ellipse cx="528" cy="720" rx="86" ry="12" fill="#000" opacity=".45"/>
      <path d="M450,720 L476,660 L520,640 L570,650 L606,720Z" fill="#5a5048"/>
      ${[[480, 680], [530, 660], [570, 690], [510, 700]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="18" ry="12" fill="${i === 1 && left > 0 ? '#e2b84a' : '#b9c0c7'}" stroke="#6d767c" stroke-width="2"/>`).join('')}
      <path d="M548,640 L560,600 M556,640 L574,604 M564,642 L586,610" stroke="#c9d0d6" stroke-width="3"/>
      ${left > 0 ? sparkle(532, 650, .7, 2) : ''}
    </g>`,
    crane: (S) => {
      const lifted = S.flags.craneLifted;
      let lattice = '';
      for (let i = 0; i < 9; i++) { const t0 = i / 9, t1 = (i + 1) / 9; const x0 = 300 + 480 * t0, y0 = 450 - 300 * t0, x1 = 300 + 480 * t1, y1 = 450 - 300 * t1; lattice += `<path d="M${f1(x0)},${f1(y0)} L${f1(x1)},${f1(y1 - 26)} M${f1(x0)},${f1(y0 - 26)} L${f1(x1)},${f1(y1)}" stroke="#b88a24" stroke-width="4"/>`; }
      return `<g>
        <!-- tracks -->
        <rect x="160" y="650" width="290" height="62" rx="28" fill="#2a2522" stroke="#1a1614" stroke-width="4"/>
        ${[190, 240, 290, 340, 390, 420].map((x) => `<circle cx="${x}" cy="681" r="17" fill="#3a3530" stroke="#1a1614" stroke-width="3"/>`).join('')}
        <rect x="190" y="630" width="230" height="24" fill="url(#g-crane)"/>
        <!-- cab -->
        <path d="M200,640 L200,488 Q200,476 212,476 L330,476 Q344,476 344,490 L344,640Z" fill="url(#g-crane)" stroke="#7a5414" stroke-width="3"/>
        <rect x="216" y="494" width="70" height="56" rx="6" fill="#20343a" stroke="#7a5414" stroke-width="3"/>
        <path d="M226,500 L250,500 L226,530Z" fill="#9fe8ff" opacity=".25"/>
        <rect x="292" y="510" width="40" height="110" rx="4" fill="#c99a2a"/>
        <path d="M220,570 L340,570 M220,600 L340,600" stroke="#7a5414" stroke-width="3"/>
        <rect x="236" y="572" width="16" height="22" fill="#d6a43a"/>
        <path d="M200,600 L180,612 L200,620Z" fill="#8a4a2a"/>
        <text x="270" y="626" font-size="16" text-anchor="middle" fill="#5a3a10" font-family="Fredoka, sans-serif" font-weight="600">BIG BERTHA</text>
        ${S.flags.leverIn ? `<path d="M268,560 L282,520" stroke="#c0392b" stroke-width="6" stroke-linecap="round"/><circle cx="282" cy="520" r="6" fill="#c0392b"/>` : `<path d="M268,560 L272,550" stroke="#5a5048" stroke-width="6" stroke-linecap="round"/>`}
        <!-- rust patches -->
        <ellipse cx="320" cy="520" rx="14" ry="20" fill="#7a3a1a" opacity=".55"/><ellipse cx="214" cy="610" rx="10" ry="12" fill="#7a3a1a" opacity=".55"/>
        <!-- boom -->
        <path d="M300,450 L780,150" stroke="url(#g-crane)" stroke-width="10"/><path d="M300,424 L780,124" stroke="url(#g-crane)" stroke-width="10"/>
        ${lattice}
        <circle cx="300" cy="440" r="16" fill="#7a5414"/><rect x="770" y="116" width="34" height="44" rx="6" fill="#7a5414"/>
        <circle cx="787" cy="150" r="9" fill="#3a3530"/>
        <!-- floodlight on cab -->
        <rect x="320" y="456" width="28" height="18" rx="3" fill="#3a3530"/>
        ${S.flags.cranePower ? `<circle cx="334" cy="465" r="6" fill="#fff4d0"/><circle cx="334" cy="465" r="26" fill="#ffe8a0" opacity=".3" filter="url(#f-blur3)"/>` : '<circle cx="334" cy="465" r="6" fill="#5a5048"/>'}
        <!-- cable (scales when the wreck lifts) -->
        <rect class="cable ${lifted ? 'up' : ''}" x="785" y="150" width="4" height="410" fill="#2a2522"/>
      </g>`;
    },
    breaker: (S) => `<g>
      <rect x="374" y="560" width="64" height="76" rx="6" fill="#6d767c" stroke="#3a3f44" stroke-width="3"/>
      <rect x="382" y="570" width="48" height="56" rx="3" fill="#2a2e32"/>
      ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${386 + c * 15}" y="${574 + r * 17}" width="10" height="13" rx="2" fill="${S.flags.cranePower ? '#4fe08a' : (r + c) % 2 ? '#e0614f' : '#4fe08a'}"/>`).join('')).join('')}
      <path d="M380,560 L378,540 L394,540" stroke="#2a2522" stroke-width="3" fill="none"/>
      <text x="406" y="652" font-size="11" text-anchor="middle" fill="#ffd36a" font-family="Nunito, sans-serif" font-weight="700">⚡ DANGER-ISH</text>
    </g>`,
    wreck: (S) => {
      const lifted = S.flags.craneLifted;
      return `<g>
        ${!S.flags.nozzlesTaken ? `<g class="nozzles">
          <path d="M716,690 L746,640 L790,640 L790,700 L716,700Z" fill="url(#g-copper)" stroke="#7a3a1a" stroke-width="3"/>
          <path d="M812,700 L812,640 L856,640 L886,690 L886,700Z" fill="url(#g-copper)" stroke="#7a3a1a" stroke-width="3"/>
          <ellipse cx="746" cy="670" rx="8" ry="28" fill="#2a1a12"/><ellipse cx="856" cy="670" rx="8" ry="28" fill="#2a1a12"/>
          <path d="M700,700 L900,700 L900,712 L700,712Z" fill="#4a4038"/>
          <path d="M790,654 L812,654 M790,680 L812,680" stroke="#a9b1b7" stroke-width="6"/>
          ${lifted ? sparkle(800, 640, .8, .5) : ''}
        </g>` : `<path d="M700,700 L900,700 L900,712 L700,712Z" fill="#4a4038"/>`}
        <g class="wreck-lift ${lifted ? 'up' : ''}">
          <path d="M640,700 L660,600 L720,566 L900,560 L960,612 L950,700Z" fill="#5a6066" stroke="#2a2e32" stroke-width="4"/>
          <path d="M660,600 L960,612 M700,700 L720,566 M840,700 L860,562" stroke="#3a3f44" stroke-width="3"/>
          <path d="M680,640 L940,650" stroke="#c4643a" stroke-width="12" opacity=".75"/>
          <rect x="740" y="590" width="50" height="30" rx="5" fill="#20343a" stroke="#2a2e32" stroke-width="3"/>
          <ellipse cx="900" cy="660" rx="30" ry="18" fill="#7a3a1a" opacity=".5"/>
          <text x="800" y="680" font-size="18" text-anchor="middle" fill="#2a2e32" font-family="Fredoka, sans-serif" font-weight="600" opacity=".7">HAULER-7</text>
          <path d="M786,560 L786,546 M770,546 L802,546" stroke="#2a2522" stroke-width="5"/>
        </g>
      </g>`;
    },
    booth: (S) => {
      const filled = S.flags.torchGot;
      let caps = '';
      [[1250, 380], [1296, 380], [1342, 380], [1250, 426], [1342, 426], [1296, 426]].forEach(([x, y], i) => {
        const gap = i === 5;
        caps += gap && !filled
          ? `<circle cx="${x}" cy="${y}" r="17" fill="none" stroke="#e2b84a" stroke-width="2" stroke-dasharray="4 4"/>`
          : `<circle cx="${x}" cy="${y}" r="17" fill="${gap ? '#e2b84a' : ['#c9d0d6', '#b9c0c7', '#d9dee2'][i % 3]}" stroke="#6d767c" stroke-width="2"/><circle cx="${x}" cy="${y}" r="6" fill="${gap ? '#a8822a' : '#8a929a'}"/>`;
      });
      return `<g>
        <path d="M1210,720 L1210,350 L1400,322 L1590,350 L1590,720Z" fill="url(#g-rust)"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => `<rect x="${1212 + i * 27}" y="340" width="12" height="380" fill="#000" opacity=".12"/>`).join('')}
        <path d="M1196,356 L1400,316 L1604,356" stroke="#3a2a20" stroke-width="12" fill="none"/>
        <rect x="1236" y="244" width="300" height="64" rx="6" fill="#2a1d1a" stroke="#e2b84a" stroke-width="3"/>
        <text x="1386" y="274" font-size="26" text-anchor="middle" fill="#ffd36a" font-family="Fredoka, sans-serif" font-weight="600">VEX'S SALVAGE</text>
        <text x="1386" y="298" font-size="14" text-anchor="middle" fill="#e8d8c0" font-family="Nunito, sans-serif" font-weight="700">NO HAGGLING · HAGGLING EXTRA</text>
        <path d="M1260,308 L1260,344 M1512,308 L1512,344" stroke="#2a1d1a" stroke-width="4"/>
        ${caps}
        <rect x="1420" y="560" width="160" height="22" fill="#5a3f2e"/><rect x="1430" y="582" width="140" height="138" fill="#4a3324"/>
        <rect x="1440" y="540" width="40" height="20" rx="3" fill="#2f8f80"/><path d="M1500,560 L1510,530 L1520,560Z" fill="#c9d0d6"/>
        <circle cx="1560" cy="520" r="12" fill="#ffcf6a"/><circle cx="1560" cy="520" r="50" fill="#ffcf6a" opacity=".18" filter="url(#f-blur10)"/>
        <path d="M1560,470 L1560,508" stroke="#2a1d1a" stroke-width="3"/>
      </g>`;
    },
    exit: () => `<g class="exit-arrow left"><path d="M120,770 L64,800 L120,830" stroke="#ffe0a0" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M152,770 L96,800 L152,830" stroke="#ffe0a0" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/></g>`,
    cutting: () => `<g pointer-events="none"><circle cx="800" cy="668" r="46" fill="url(#g-torch-glow)"/>${[0, 1, 2, 3, 4, 5].map((i) => `<circle class="spark-fly" style="animation-delay:${i * .12}s;--dx:${(i % 2 ? 1 : -1) * (20 + i * 9)}px;--dy:${-30 - i * 8}px" cx="800" cy="668" r="3" fill="#fff3b0"/>`).join('')}</g>`,
  };

  // =====================================================================
  //  WOODS EDGE
  // =====================================================================
  function woodsBg() {
    srand(808);
    let s = `<rect width="1600" height="900" fill="url(#g-wood-dusk)"/>`;
    for (let i = 0; i < 60; i++) s += `<circle cx="${(rnd() * 1600) | 0}" cy="${(rnd() * 240) | 0}" r="${f1(rnd() * 1.4 + .3)}" fill="#fff" opacity="${f1(rnd() * .5 + .2)}"/>`;
    // dense tree wall
    const trunk = (x, w, col) => `<path d="M${x - w},900 Q${x - w * .6},500 ${x - w * .3},0 L${x + w * .3},0 Q${x + w * .6},500 ${x + w},900Z" fill="${col}"/>`;
    for (let i = 0; i < 14; i++) s += trunk(i * 120 + rnd() * 50, 22 + rnd() * 16, '#10202a');
    s += `<rect y="300" width="1600" height="300" fill="url(#g-fog)"/>`;
    for (let i = 0; i < 9; i++) s += trunk(80 + i * 190 + rnd() * 60, 34 + rnd() * 18, '#152a30');
    // canopy glow blobs
    for (let i = 0; i < 26; i++) s += `<circle cx="${f1(rnd() * 1600)}" cy="${f1(rnd() * 260)}" r="${f1(40 + rnd() * 80)}" fill="${rnd() > .5 ? '#1e4a44' : '#2a3a5a'}" opacity=".7"/>`;
    for (let i = 0; i < 20; i++) { const x = rnd() * 1600, y = 40 + rnd() * 260; s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="4" fill="#a8ffe6"/><circle cx="${f1(x)}" cy="${f1(y)}" r="12" fill="#6fffd8" opacity=".25" filter="url(#f-blur3)"/>`; }
    // ground + path
    s += `<path d="M0,620 Q500,596 900,612 T1600,606 L1600,900 L0,900Z" fill="#1a2a22"/>
      <path d="M620,900 Q700,720 780,610 L860,610 Q960,720 1080,900Z" fill="#3a3326" opacity=".7"/>
      <path d="M760,610 Q800,540 820,470 Q840,540 880,610Z" fill="#05080a" opacity=".85"/>
      <g class="eyes"><circle cx="808" cy="520" r="4" fill="#ffd36a"/><circle cx="828" cy="520" r="4" fill="#ffd36a"/></g>`;
    srand(91);
    for (let i = 0; i < 40; i++) { const x = rnd() * 1600, y = 640 + rnd() * 250; s += `<path d="M${f1(x)},${f1(y)} q-4,-18 -10,-26 M${f1(x)},${f1(y)} q2,-20 6,-30" stroke="#2f5a43" stroke-width="3" fill="none" stroke-linecap="round"/>`; }
    for (let i = 0; i < 16; i++) s += `<circle class="spore" style="animation-delay:${f1(rnd() * 8)}s" cx="${f1(rnd() * 1600)}" cy="${f1(420 + rnd() * 380)}" r="${f1(1.6 + rnd() * 2)}" fill="#9fffe0"/>`;
    return s;
  }
  const woods = {
    log: (S) => `<g>
      <ellipse cx="820" cy="690" rx="420" ry="30" fill="#000" opacity=".4"/>
      <path d="M420,690 Q430,600 520,590 L1150,570 Q1240,572 1250,650 Q1240,700 1150,700 L520,712 Q430,712 420,690Z" fill="#3a2e24" stroke="#1a140e" stroke-width="4"/>
      <path d="M520,610 L1150,592 M520,650 L1160,630 M540,690 L1150,676" stroke="#2a2018" stroke-width="5" opacity=".8"/>
      <ellipse cx="1200" cy="635" rx="50" ry="62" fill="#6a5238" stroke="#1a140e" stroke-width="4"/>
      <ellipse cx="1200" cy="635" rx="34" ry="44" fill="none" stroke="#4a3828" stroke-width="3"/><ellipse cx="1200" cy="635" rx="18" ry="24" fill="none" stroke="#4a3828" stroke-width="3"/>
      <path d="M440,640 Q380,600 360,540 M450,670 Q370,680 330,640 M430,700 Q380,740 340,760" stroke="#2a2018" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M600,600 Q620,560 660,570 M900,585 Q930,540 960,560" stroke="#2f5a43" stroke-width="6" fill="none" stroke-linecap="round"/>
      ${[640, 760, 1000].map((x) => `<circle cx="${x}" cy="590" r="6" fill="#7fffe0" opacity=".7"/>`).join('')}
      ${S.flags.sawPath ? `<path d="M780,600 L800,700" stroke="#ffe0a0" stroke-width="3" stroke-dasharray="8 8"/>` : ''}
    </g>`,
    ember: (S) => {
      const has = !S.flags.resinTaken;
      return `<g>
        <circle cx="200" cy="520" r="160" fill="url(#g-amber-glow)" class="pulse"/>
        <path d="M150,900 Q160,640 170,380 L240,380 Q250,640 270,900Z" fill="#4a2a1c"/>
        <path d="M170,500 Q140,470 150,430 M240,460 Q280,440 300,400" stroke="#4a2a1c" stroke-width="18" fill="none" stroke-linecap="round"/>
        ${[[180, 460], [214, 520], [190, 590], [226, 640]].map(([x, y]) => `<path d="M${x - 8},${y} L${x + 8},${y + 4}" stroke="#ff8a3a" stroke-width="3" opacity=".9"/>`).join('')}
        <circle cx="205" cy="290" r="110" fill="#5a2a1a"/><circle cx="150" cy="320" r="70" fill="#7a3a1e"/><circle cx="260" cy="320" r="76" fill="#6a321c"/>
        ${[[160, 270], [240, 250], [200, 330], [270, 330], [130, 340]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#ffc24a"/>`).join('')}
        ${has ? `<path d="M210,560 Q222,580 218,610 Q212,630 204,610 Q198,584 210,560Z" fill="#ffb02a" stroke="#c46a10" stroke-width="2"/>
          <ellipse cx="212" cy="600" rx="16" ry="22" fill="url(#g-amber-glow)"/>${sparkle(212, 590, .7, .6)}` : `<path d="M206,580 Q210,590 208,600" stroke="#c46a10" stroke-width="3"/>`}
      </g>`;
    },
    flowers: () => `<g>
      ${[[1340, 760], [1380, 740], [1420, 770], [1460, 750]].map(([x, y], i) => `<path d="M${x},${y + 40} Q${x + 4},${y + 10} ${x},${y}" stroke="#2f5a43" stroke-width="4" fill="none"/>
        <path d="M${x - 12},${y} Q${x},${y - 24} ${x + 12},${y} Q${x},${y + 6} ${x - 12},${y}Z" fill="${i % 2 ? '#b8a2ff' : '#7fd8ff'}"/><circle cx="${x}" cy="${y + 2}" r="3" fill="#fff8d0"/>`).join('')}
    </g>`,
    critter: () => `<g class="critter" transform="translate(1040,560)">
      <path d="M-14,10 L-20,22 M-6,12 L-8,24 M6,12 L8,24 M14,10 L20,22" stroke="#3a2f45" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="0" cy="0" rx="22" ry="16" fill="#8a72c8"/><ellipse cx="0" cy="4" rx="14" ry="9" fill="#b8a6ec"/>
      <circle cx="-8" cy="-4" r="6" fill="#fff"/><circle cx="8" cy="-4" r="6" fill="#fff"/><circle cx="-7" cy="-3" r="3.4" fill="#1b1424"/><circle cx="9" cy="-3" r="3.4" fill="#1b1424"/>
      <path d="M-6,-14 Q-10,-28 -16,-30 M6,-14 Q10,-28 16,-30" stroke="#3a2f45" stroke-width="2" fill="none"/>
      <circle cx="-16" cy="-30" r="3.5" fill="#9fffe0"/><circle cx="16" cy="-30" r="3.5" fill="#9fffe0"/></g>`,
    exit: () => `<g class="exit-arrow"><path d="M1500,770 L1556,800 L1500,830" stroke="#9fffe6" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M1468,770 L1524,800 L1468,830" stroke="#9fffe6" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/></g>`,
  };
  const crashToWoods = () => `<g class="exit-arrow left"><path d="M86,400 L36,430 L86,460" stroke="#9fffe6" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M116,400 L66,430 L116,460" stroke="#9fffe6" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/></g>`;

  // =====================================================================
  //  GARAGE ROOF (cutscene)
  // =====================================================================
  function roof(S, rMood, cMood) {
    srand(1234);
    let s = `<rect width="1600" height="900" fill="url(#g-roof-sky)"/>
      <path d="M-100,520 Q400,220 900,260 T1800,80" stroke="#9fd8ff" stroke-width="140" fill="none" opacity=".07" filter="url(#f-blur24)"/>
      <path d="M-100,500 Q420,250 900,280 T1800,110" stroke="#d8c8ff" stroke-width="60" fill="none" opacity=".08" filter="url(#f-blur24)"/>`;
    for (let i = 0; i < 260; i++) { const r = rnd(); s += `<circle cx="${(rnd() * 1600) | 0}" cy="${(rnd() * 560) | 0}" r="${f1(r * r * 2.2 + .3)}" fill="#fff" opacity="${f1(rnd() * .7 + .2)}"${r > .9 ? ' class="twinkle"' : ''}/>`; }
    // "wrench" constellation
    const wr = [[1130, 150], [1170, 190], [1210, 230], [1250, 270], [1236, 300], [1270, 296], [1200, 132], [1150, 112]];
    s += `<path d="M1150,112 L1130,150 L1170,190 L1210,230 L1250,270 M1236,300 L1250,270 L1270,296 M1200,132 L1170,190" stroke="#9fd8ff" stroke-width="1.5" opacity=".35"/>`;
    wr.forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="3.2" fill="#eafcff"/>`; });
    s += `<circle cx="300" cy="140" r="34" fill="#eaf0e2"/><circle cx="300" cy="140" r="90" fill="#eaf0e2" opacity=".07" filter="url(#f-blur10)"/><circle cx="420" cy="100" r="13" fill="#bfe7d8"/>`;
    // forest horizon + garage light
    s += `<path d="M0,600 Q60,540 120,590 Q180,520 260,590 Q330,530 400,592 Q470,520 560,590 Q640,540 720,596 Q800,526 880,592 Q960,540 1040,594 Q1120,520 1200,590 Q1280,540 1360,592 Q1440,530 1520,590 Q1570,560 1600,580 L1600,900 L0,900Z" fill="#0a1c1e"/>`;
    for (let i = 0; i < 20; i++) s += `<circle cx="${f1(rnd() * 1600)}" cy="${f1(600 + rnd() * 60)}" r="2.6" fill="#8fffd9" opacity=".7"/>`;
    // roof
    s += `<path d="M0,720 L1600,690 L1600,900 L0,900Z" fill="#3a423e"/>`;
    for (let x = 0; x < 1600; x += 26) s += `<path d="M${x},${720 - x * 30 / 1600} L${x},900" stroke="#4b5550" stroke-width="10"/>`;
    s += `<path d="M0,720 L1600,690" stroke="#2a2420" stroke-width="10"/>
      <rect x="1240" y="560" width="70" height="140" fill="#5a3f2e"/><rect x="1230" y="552" width="90" height="16" fill="#3a2a20"/>
      <g class="chimney-smoke" pointer-events="none"><circle cx="1275" cy="530" r="14" fill="#cfd8d2" opacity=".18" filter="url(#f-blur3)"/><circle cx="1285" cy="496" r="20" fill="#cfd8d2" opacity=".12" filter="url(#f-blur3)"/></g>
      <path d="M560,712 Q660,690 760,708 L770,736 L556,738Z" fill="#2f6f60" opacity=".9"/>
      <path d="M560,712 L770,736" stroke="#43927e" stroke-width="3"/>`;
    s += `<g transform="translate(860,716) scale(.78)">${Art.racket(rMood || 'soft')}</g><g transform="translate(680,722) scale(.74)">${Art.crystal(cMood || 'neutral')}</g>`;
    return s;
  }

  // =====================================================================
  //  ICONS
  // =====================================================================
  Object.assign(Art.ICONS, {
    crane_lever: `<path d="M18 54 L42 14" stroke="#c0392b" stroke-width="8" stroke-linecap="round"/><circle cx="42" cy="14" r="8" fill="#c0392b"/><rect x="10" y="48" width="18" height="10" rx="3" fill="#6d767c"/>`,
    copper_sheet: `<path d="M8 20 L48 10 L56 44 L16 54Z" fill="url(#g-copper)" stroke="#7a3a1a" stroke-width="2.5"/><path d="M18 24 L44 18 M20 34 L48 28 M22 44 L50 38" stroke="#ffd2a8" stroke-width="1.5" opacity=".6"/>`,
    gilded_hubcap: `<circle cx="32" cy="32" r="24" fill="#e2b84a" stroke="#a8822a" stroke-width="3"/><circle cx="32" cy="32" r="9" fill="#a8822a"/>${[0, 60, 120, 180, 240, 300].map((a) => `<line x1="32" y1="32" x2="${32 + 20 * Math.cos(a * Math.PI / 180)}" y2="${32 + 20 * Math.sin(a * Math.PI / 180)}" stroke="#fff3c0" stroke-width="2.5"/>`).join('')}<circle cx="24" cy="22" r="4" fill="#fffbe8" opacity=".8"/>`,
    rubber_duck: `<ellipse cx="30" cy="42" rx="20" ry="13" fill="#f2c94c"/><circle cx="38" cy="24" r="12" fill="#f2c94c"/><path d="M48 24 L58 26 L48 30Z" fill="#e67e22"/><circle cx="41" cy="21" r="2.2" fill="#222"/><circle cx="38" cy="24" r="15" fill="#bff3ff" opacity=".35" stroke="#e8fbff" stroke-width="2"/>`,
    left_boot: `<path d="M18 8 L36 8 L36 40 Q50 42 56 50 L56 56 L14 56 Z" fill="#5d3d29" stroke="#3a2418" stroke-width="2.5"/><rect x="14" y="52" width="42" height="5" fill="#1b130e"/><path d="M20 18 L34 18 M20 26 L34 26" stroke="#d9c48a" stroke-width="2"/>`,
    mystery_can: `<rect x="18" y="10" width="28" height="46" rx="4" fill="#9aa3aa" stroke="#4d555b" stroke-width="2.5"/><ellipse cx="32" cy="11" rx="14" ry="4" fill="#c9d0d6"/><text x="32" y="40" font-size="22" text-anchor="middle" fill="#2a2e32" font-family="Fredoka, sans-serif" font-weight="600">?</text>`,
    trophy: `<path d="M20 10 L44 10 L42 30 Q32 40 22 30Z" fill="#c9a052" stroke="#8a6a2a" stroke-width="2"/><path d="M20 14 Q8 16 14 26 L21 27 M44 14 Q56 16 50 26 L43 27" stroke="#c9a052" stroke-width="3" fill="none"/><rect x="29" y="36" width="6" height="10" fill="#c9a052"/><rect x="20" y="46" width="24" height="10" rx="2" fill="#5a3f2e"/><text x="32" y="26" font-size="12" text-anchor="middle" fill="#6a4a1a" font-family="Fredoka, sans-serif" font-weight="600">2</text>`,
    bent_forks: `<path d="M14 54 L20 22 L34 22 L40 54Z" fill="#6d767c"/><path d="M22 24 Q20 10 28 6 M27 24 Q26 10 34 8 M32 24 Q34 12 42 12" stroke="#c9d0d6" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    cutting_torch: `<rect x="8" y="30" width="30" height="14" rx="5" fill="#3a4448"/><path d="M38 34 L52 30 L52 44 L38 40Z" fill="#a9b1b7"/><rect x="14" y="20" width="12" height="12" rx="2" fill="#c0392b"/><path d="M52 37 L60 37" stroke="#7fd8ff" stroke-width="3" stroke-linecap="round"/>`,
    torch_fuel: `<rect x="20" y="12" width="24" height="44" rx="10" fill="#c0392b" stroke="#7a1f16" stroke-width="2.5"/><rect x="27" y="6" width="10" height="8" rx="2" fill="#6d767c"/><path d="M26 30 L38 30 M26 38 L38 38" stroke="#fff3e0" stroke-width="3"/><text x="32" y="51" font-size="8" text-anchor="middle" fill="#fff3e0" font-family="Nunito, sans-serif" font-weight="800">FUEL</text>`,
    thruster_nozzles: `<path d="M6 44 L18 20 L30 20 L30 48 L6 48Z" fill="url(#g-copper)" stroke="#7a3a1a" stroke-width="2"/><path d="M34 48 L34 20 L46 20 L58 44 L58 48Z" fill="url(#g-copper)" stroke="#7a3a1a" stroke-width="2"/><ellipse cx="18" cy="34" rx="3" ry="11" fill="#2a1a12"/><ellipse cx="46" cy="34" rx="3" ry="11" fill="#2a1a12"/>`,
    noodle_cup: `<path d="M14 18 L20 54 L44 54 L50 18Z" fill="#f2ead8" stroke="#bfb39a" stroke-width="2"/><rect x="12" y="14" width="40" height="7" rx="2" fill="#c0392b"/><path d="M22 32 Q32 38 42 32" stroke="#c0392b" stroke-width="2" fill="none"/>`,
    ember_resin: `<path d="M14 18 L20 54 L44 54 L50 18Z" fill="#f2ead8" stroke="#bfb39a" stroke-width="2"/><rect x="12" y="14" width="40" height="7" rx="2" fill="#c0392b"/><ellipse cx="32" cy="22" rx="18" ry="5" fill="#ffb02a"/><circle cx="32" cy="30" r="20" fill="url(#g-amber-glow)"/>`,
    gasket: `<rect x="10" y="10" width="44" height="44" rx="14" fill="url(#g-copper)" stroke="#7a3a1a" stroke-width="2.5"/><rect x="21" y="21" width="22" height="22" rx="7" fill="#1a1412"/>${[[16, 16], [48, 16], [16, 48], [48, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#1a1412"/>`).join('')}<path d="M12 30 Q14 20 22 14" stroke="#ffb02a" stroke-width="2" fill="none" opacity=".8"/>`,
  });

  // =====================================================================
  //  THRUSTER SCHEMATIC + MINI-GAME PIECES
  // =====================================================================
  function thrusterSchematic(parts, charged, charge = 0) {
    return `<svg viewBox="0 0 400 240" class="schematic" aria-hidden="true">
      <rect width="400" height="240" fill="#0d1a17"/>
      ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="240" stroke="#173029"/>`).join('')}
      ${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${i * 20}" x2="400" y2="${i * 20}" stroke="#173029"/>`).join('')}
      <rect x="230" y="70" width="140" height="100" rx="20" fill="#3b4440" stroke="#5a6066" stroke-width="3"/>
      <text x="300" y="126" text-anchor="middle" fill="#7a8a84" font-family="ui-monospace, monospace" font-size="11">ENGINE</text>
      <g class="${parts.gasket ? 'part-in' : 'part-ghost'}" data-part="gasket">
        <rect x="206" y="66" width="22" height="108" rx="8" fill="${parts.gasket ? 'url(#g-copper)' : 'none'}" stroke="${parts.gasket ? '#7a3a1a' : '#4fd1b8'}" stroke-width="${parts.gasket ? 3 : 2}" stroke-dasharray="${parts.gasket ? 0 : '6 5'}"/>
      </g>
      <g class="${parts.nozzles ? 'part-in' : 'part-ghost'}" data-part="nozzles">
        <path d="M206,76 L120,56 L120,110 L206,108Z M206,132 L120,130 L120,184 L206,164Z" fill="${parts.nozzles ? 'url(#g-copper)' : 'none'}" stroke="${parts.nozzles ? '#7a3a1a' : '#4fd1b8'}" stroke-width="${parts.nozzles ? 3 : 2}" stroke-dasharray="${parts.nozzles ? 0 : '7 5'}"/>
      </g>
      ${charge > 0 ? `<path d="M120,60 Q${120 - 120 * charge},83 ${120 - 160 * charge},83 Q${120 - 120 * charge},90 120,106Z M120,134 Q${120 - 120 * charge},157 ${120 - 160 * charge},157 Q${120 - 120 * charge},164 120,180Z" fill="#7affe4" opacity="${.4 + charge * .5}"/>` : ''}
      <text x="16" y="24" fill="#4fd1b8" font-family="ui-monospace, monospace" font-size="12">THRUSTERS // ${charged ? 'TEST-FIRE OK' : 'ASSEMBLY'}</text>
      <text x="16" y="226" fill="#4fd1b8" font-family="ui-monospace, monospace" font-size="11" opacity=".7">NOZZLES ${parts.nozzles ? 'OK' : '--'} · GASKET ${parts.gasket ? 'OK' : '--'}</text>
    </svg>`;
  }
  const nut = `<svg viewBox="-30 -30 60 90" aria-hidden="true"><g transform="translate(0,14)"><path d="M-20,0 L-10,-17 L10,-17 L20,0 L10,17 L-10,17Z" fill="url(#g-metal)" stroke="#4d555b" stroke-width="2"/><circle r="8" fill="#2a2e32"/></g></svg>`;
  const washer = `<svg viewBox="-30 -30 60 90" aria-hidden="true"><g transform="translate(0,14)"><circle r="19" fill="url(#g-metal)" stroke="#4d555b" stroke-width="2"/><circle r="8" fill="#2a2e32"/><path d="M-12,-10 Q-4,-16 6,-14" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/></g></svg>`;

  return { DEFS, vex, vexPortrait, junkBg, junkFg, junk, woodsBg, woods, crashToWoods, roof, thrusterSchematic, nut, washer };
})();
