/* Racket's Garage — art.js
 * All artwork is hand-built SVG so the game stays a single, dependency-free web app.
 * Scene coordinates use a 1600x900 canvas. Characters are drawn with their feet at (0,0).
 */
const Art = (() => {
  // ---------- tiny helpers ----------
  let seed = 1;
  const srand = (s) => { seed = s; };
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const f1 = (n) => (+n).toFixed(1);

  // ---------- shared gradients & filters ----------
  const DEFS = `
  <linearGradient id="g-wall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1b1411"/><stop offset=".5" stop-color="#3a2920"/><stop offset="1" stop-color="#4b3426"/>
  </linearGradient>
  <linearGradient id="g-floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#4a423b"/><stop offset=".35" stop-color="#36302b"/><stop offset="1" stop-color="#1d1917"/>
  </linearGradient>
  <linearGradient id="g-night" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0a1a27"/><stop offset=".55" stop-color="#15404a"/><stop offset="1" stop-color="#2d6c5f"/>
  </linearGradient>
  <linearGradient id="g-dusk" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0c1626"/><stop offset=".35" stop-color="#1a3a4e"/><stop offset=".62" stop-color="#3a6a64"/><stop offset=".8" stop-color="#8b7b62"/><stop offset="1" stop-color="#6a5a48"/>
  </linearGradient>
  <linearGradient id="g-ground" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2b4033"/><stop offset=".4" stop-color="#1f3026"/><stop offset="1" stop-color="#0f1813"/>
  </linearGradient>
  <linearGradient id="g-fog" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7fb6a6" stop-opacity="0"/><stop offset=".6" stop-color="#9cc9b6" stop-opacity=".28"/><stop offset="1" stop-color="#9cc9b6" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="g-lamp">
    <stop offset="0" stop-color="#ffd890" stop-opacity=".6"/><stop offset=".45" stop-color="#ffb45e" stop-opacity=".18"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="g-teal-glow">
    <stop offset="0" stop-color="#7affe4" stop-opacity=".8"/><stop offset=".5" stop-color="#2ad4b0" stop-opacity=".25"/><stop offset="1" stop-color="#2ad4b0" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="g-crt-glow">
    <stop offset="0" stop-color="#7dffb0" stop-opacity=".35"/><stop offset="1" stop-color="#3dff8a" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="g-vignette" cx=".5" cy=".5" r=".72">
    <stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05080a" stop-opacity=".62"/>
  </radialGradient>
  <linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#b6fff2"/><stop offset=".5" stop-color="#4bb7b0"/><stop offset="1" stop-color="#1b5560"/>
  </linearGradient>
  <linearGradient id="g-hull" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f6f0e2"/><stop offset=".55" stop-color="#dbd1bb"/><stop offset="1" stop-color="#998f7a"/>
  </linearGradient>
  <linearGradient id="g-metal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#d3d9de"/><stop offset=".5" stop-color="#9aa3aa"/><stop offset="1" stop-color="#5d666d"/>
  </linearGradient>
  <linearGradient id="g-copper" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f3b37a"/><stop offset="1" stop-color="#a5552a"/>
  </linearGradient>
  <linearGradient id="g-crystal" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#d4fff6"/><stop offset=".45" stop-color="#4fe0c4"/><stop offset="1" stop-color="#177a72"/>
  </linearGradient>
  <linearGradient id="g-couch" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#9a5638"/><stop offset="1" stop-color="#5e2f1d"/>
  </linearGradient>
  <linearGradient id="g-wood" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7a5539"/><stop offset="1" stop-color="#4a3122"/>
  </linearGradient>
  <filter id="f-blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="f-blur10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="f-blur24" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24"/></filter>
  <filter id="f-grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.25 0 0 0 -.5"/>
  </filter>`;

  // ---------- common overlays ----------
  const overlays = () => `
    <rect class="grain" width="1600" height="900" filter="url(#f-grain)" opacity=".55" pointer-events="none"/>
    <rect width="1600" height="900" fill="url(#g-vignette)" pointer-events="none"/>`;

  const sparkle = (x, y, s = 1, delay = 0) => `
    <g class="sparkle" style="animation-delay:${delay}s" transform="translate(${x},${y}) scale(${s})" pointer-events="none">
      <path d="M0,-14 L3,-3 L14,0 L3,3 L0,14 L-3,3 L-14,0 L-3,-3Z" fill="#eafff8"/>
      <circle r="5" fill="#9ffff0" opacity=".7" filter="url(#f-blur3)"/>
    </g>`;

  // =====================================================================
  //  CHARACTERS
  // =====================================================================

  /* Racket — tall raccoon mechanic. Feet at (0,0), ~530 units tall. */
  function racket(mood = 'grump') {
    const F = '#8d929b', FD = '#5f646d', FL = '#cfd2d7', M = '#23252a', W = '#efeae0', H = '#1d1e22';
    const SU = '#2f6f60', SD = '#1f4f43', SL = '#43927e', BR = '#5b3b25', BS = '#cfa456';

    const tail = [
      [102, -86, 17, 14, -110, 1], [110, -112, 22, 18, -95, 0], [113, -142, 25, 20, -80, 1],
      [107, -172, 27, 21, -65, 0], [93, -200, 27, 20, -50, 1], [73, -222, 25, 18, -35, 0], [52, -238, 21, 15, -20, 1],
    ].map(([x, y, rx, ry, r, d]) =>
      `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${x} ${y})" fill="${d ? H : F}"/>` +
      (d ? '' : `<ellipse cx="${x - 4}" cy="${y - 6}" rx="${rx * .55}" ry="${ry * .35}" transform="rotate(${r} ${x} ${y})" fill="${FL}" opacity=".35"/>`)
    ).join('');

    const lids = {
      grump: `<path d="M-29,-472 L-11,-472 L-11,-460 L-29,-465Z" fill="${M}"/><path d="M11,-472 L29,-472 L29,-465 L11,-460Z" fill="${M}"/>`,
      smirk: `<path d="M-29,-472 L-11,-472 L-11,-462.5 L-29,-463.5Z" fill="${M}"/><path d="M11,-472 L29,-472 L29,-467 L11,-466Z" fill="${M}"/>`,
      soft: `<path d="M-29,-472 L-11,-472 L-11,-462 Q-20,-465 -29,-462Z" fill="${M}"/><path d="M11,-472 L29,-472 L29,-462 Q20,-465 11,-462Z" fill="${M}"/>`,
      shock: '',
      laugh: `<path d="M-29,-472 L-11,-472 L-11,-454 L-29,-454Z" fill="${M}"/><path d="M11,-472 L29,-472 L29,-454 L11,-454Z" fill="${M}"/>
              <path d="M-27,-460 Q-20,-467 -13,-460 M13,-460 Q20,-467 27,-460" stroke="${W}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    }[mood] ?? '';
    const brows = {
      grump: 'M-35,-483 L-11,-475 M35,-483 L11,-475',
      smirk: 'M-35,-484 L-11,-478 M35,-490 L11,-486',
      soft: 'M-33,-481 Q-22,-486 -11,-481 M33,-481 Q22,-486 11,-481',
      shock: 'M-33,-488 Q-22,-494 -11,-489 M33,-488 Q22,-494 11,-489',
      laugh: 'M-33,-482 Q-22,-487 -11,-482 M33,-482 Q22,-487 11,-482',
    }[mood];
    const mouth = {
      grump: `<path d="M-10,-428 Q0,-433 10,-428" stroke="${H}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
      smirk: `<path d="M-10,-430 Q3,-428 12,-436" stroke="${H}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
      soft: `<path d="M-9,-432 Q0,-426 9,-432" stroke="${H}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
      shock: `<ellipse cx="0" cy="-428" rx="4.5" ry="5.5" fill="${H}"/>`,
      laugh: `<path d="M-11,-433 Q0,-418 11,-433Z" fill="#6a2427" stroke="${H}" stroke-width="2" stroke-linejoin="round"/>`,
    }[mood];
    const eye = (x) => `<ellipse cx="${x}" cy="-462" rx="7.4" ry="6.6" fill="#f2eee3"/>
      <circle cx="${x + 1}" cy="-461.5" r="4.8" fill="#86d65e"/><circle cx="${x + 1}" cy="-461.5" r="2.4" fill="#0f1210"/>
      <circle cx="${x + 2.8}" cy="-463.6" r="1.4" fill="#fff"/>`;

    return `<g class="racket">
      <ellipse cx="10" cy="0" rx="78" ry="13" fill="#000" opacity=".35"/>
      <g class="r-tail">${tail}</g>
      <!-- legs -->
      <path d="M-50,-264 L-4,-264 L-9,-140 L-14,-40 L-45,-40 L-47,-140Z" fill="${SU}"/>
      <path d="M2,-264 L48,-264 L47,-140 L43,-40 L12,-40 L8,-140Z" fill="${SD}"/>
      <path d="M-44,-160 Q-30,-150 -10,-158 L-11,-124 Q-30,-118 -45,-126Z" fill="${SD}" opacity=".7"/>
      <rect x="-47" y="-50" width="35" height="12" rx="3" fill="${SL}"/><rect x="11" y="-50" width="35" height="12" rx="3" fill="${SU}"/>
      <!-- boots -->
      <path d="M-46,-40 L-12,-40 L-10,-12 L-10,0 L-66,0 Q-68,-12 -52,-16Z" fill="#3e2b20"/>
      <path d="M12,-40 L46,-40 L52,-16 Q66,-12 66,0 L10,0 L10,-12Z" fill="#35251b"/>
      <rect x="-68" y="-6" width="58" height="6" rx="2" fill="#18110d"/><rect x="10" y="-6" width="58" height="6" rx="2" fill="#18110d"/>
      <path d="M-44,-30 L-14,-30" stroke="#6a4a36" stroke-width="2"/><path d="M14,-30 L44,-30" stroke="#5a3e2e" stroke-width="2"/>
      <g class="r-upper">
        <!-- back arm (hanging, holding wrench) -->
        <path d="M-56,-394 L-70,-322" stroke="${SU}" stroke-width="30" stroke-linecap="round"/>
        <ellipse cx="-70" cy="-322" rx="17" ry="11" fill="${SL}"/>
        <path d="M-70,-318 L-72,-254" stroke="${F}" stroke-width="21" stroke-linecap="round"/>
        <g transform="translate(-73,-250) rotate(6)">
          <rect x="-5" y="2" width="10" height="84" rx="4" fill="url(#g-metal)" stroke="#4d555b" stroke-width="1.5"/>
          <path d="M-14,82 Q-16,100 0,104 Q16,100 14,82 L7,82 L7,92 L-7,92 L-7,82Z" fill="url(#g-metal)" stroke="#4d555b" stroke-width="1.5"/>
        </g>
        <circle cx="-73" cy="-250" r="12" fill="${H}"/><path d="M-80,-246 Q-73,-238 -66,-246" stroke="#3a3c42" stroke-width="2" fill="none"/>
        <!-- torso -->
        <path d="M-58,-406 Q-66,-330 -52,-262 L52,-262 Q66,-330 58,-406 Q0,-421 -58,-406Z" fill="${SU}"/>
        <path d="M20,-412 Q60,-404 58,-400 Q66,-330 52,-262 L24,-262 Q36,-330 20,-412Z" fill="${SD}" opacity=".55"/>
        <path d="M-20,-414 L0,-372 L20,-414Z" fill="${W}"/>
        <path d="M-12,-414 L0,-388 L12,-414Z" fill="${FL}"/>
        <path d="M-34,-414 L-14,-410 L0,-372 L-22,-392Z" fill="${SL}"/><path d="M34,-414 L14,-410 L0,-372 L22,-392Z" fill="${SL}"/>
        <path d="M0,-372 L0,-264" stroke="${SD}" stroke-width="3"/>
        <rect x="-46" y="-372" width="28" height="24" rx="3" fill="${SD}"/><rect x="-46" y="-372" width="28" height="8" rx="2" fill="${SL}"/>
        <path d="M-40,-362 L-38,-342" stroke="#d9c88f" stroke-width="2.5"/>
        <ellipse cx="32" cy="-358" rx="19" ry="9" fill="${W}"/>
        <text x="32" y="-355" font-size="8" text-anchor="middle" fill="#28302d" font-family="Fredoka, Nunito, sans-serif" font-weight="700">RACKET</text>
        <!-- grease smudges -->
        <ellipse cx="-24" cy="-300" rx="9" ry="5" fill="#122a24" opacity=".5"/><ellipse cx="38" cy="-318" rx="6" ry="3" fill="#122a24" opacity=".45"/>
        <!-- tool belt -->
        <rect x="-57" y="-278" width="114" height="17" rx="3" fill="${BR}"/>
        <rect x="-8" y="-279" width="16" height="19" rx="2" fill="none" stroke="${BS}" stroke-width="3.5"/>
        <rect x="-52" y="-264" width="24" height="28" rx="4" fill="#6c4630"/><rect x="26" y="-264" width="26" height="30" rx="4" fill="#6c4630"/>
        <path d="M-46,-264 L-46,-280 M-38,-264 L-40,-284" stroke="#a9b1b7" stroke-width="3"/>
        <path d="M34,-264 L36,-290 M42,-264 L46,-286" stroke="#d9a441" stroke-width="3"/>
        <path d="M50,-258 Q64,-240 58,-214 Q50,-224 44,-246Z" fill="#a8473a"/>
        <!-- front arm (hand on hip) -->
        <path d="M56,-395 L92,-326" stroke="${SU}" stroke-width="30" stroke-linecap="round"/>
        <path d="M60,-392 L90,-334" stroke="${SD}" stroke-width="10" stroke-linecap="round" opacity=".5"/>
        <ellipse cx="92" cy="-326" rx="17" ry="11" transform="rotate(30 92 -326)" fill="${SL}"/>
        <path d="M90,-320 L62,-276" stroke="${F}" stroke-width="21" stroke-linecap="round"/>
        <circle cx="58" cy="-270" r="12.5" fill="${H}"/>
        <!-- neck -->
        <rect x="-16" y="-436" width="32" height="30" rx="8" fill="${FD}"/>
        <g class="r-head">
          <!-- ears -->
          <path d="M-44,-476 Q-56,-522 -45,-530 Q-28,-518 -14,-497Z" fill="${FD}"/>
          <path d="M-38,-485 Q-46,-512 -42,-518 Q-31,-509 -23,-496Z" fill="${FL}"/>
          <path d="M44,-476 Q56,-522 45,-530 Q28,-518 14,-497Z" fill="${FD}"/>
          <path d="M38,-485 Q46,-512 42,-518 Q31,-509 23,-496Z" fill="${FL}"/>
          <!-- cheek fluff -->
          <path d="M-40,-466 L-62,-450 L-46,-446 L-60,-430 L-38,-434 L-46,-420 L-24,-428Z" fill="${F}"/>
          <path d="M40,-466 L62,-450 L46,-446 L60,-430 L38,-434 L46,-420 L24,-428Z" fill="${F}"/>
          <ellipse cx="0" cy="-460" rx="46" ry="40" fill="${F}"/>
          <path d="M-30,-436 Q0,-418 30,-436 Q20,-424 0,-420 Q-20,-424 -30,-436Z" fill="${W}" opacity=".85"/>
          <path d="M-6,-500 Q0,-503 6,-500 L3,-474 L-3,-474Z" fill="${FD}"/>
          <!-- mask -->
          <path d="M-49,-468 Q-34,-482 -12,-472 Q0,-466 12,-472 Q34,-482 49,-468 Q44,-450 26,-449 Q12,-452 0,-454 Q-12,-452 -26,-449 Q-44,-450 -49,-468Z" fill="${M}"/>
          ${eye(-20)}${eye(20)}
          ${lids}
          <ellipse class="lid" cx="-20" cy="-462" rx="8.5" ry="7.5" fill="${M}"/>
          <ellipse class="lid" cx="20" cy="-462" rx="8.5" ry="7.5" fill="${M}"/>
          <path d="${brows}" stroke="${W}" stroke-width="5.5" stroke-linecap="round" fill="none"/>
          <!-- muzzle -->
          <path d="M-26,-448 Q-24,-422 0,-418 Q24,-422 26,-448 Q14,-456 0,-454 Q-14,-456 -26,-448Z" fill="${W}"/>
          <ellipse cx="0" cy="-445" rx="8.5" ry="6" fill="${H}"/><ellipse cx="-2.5" cy="-447" rx="2.6" ry="1.5" fill="#6b6e75"/>
          <path d="M0,-439 L0,-432" stroke="${H}" stroke-width="2"/>
          ${mouth}
          <path d="M-20,-440 L-52,-446 M-20,-436 L-50,-434 M20,-440 L52,-446 M20,-436 L50,-434" stroke="${W}" stroke-width="1.3" opacity=".7"/>
          <!-- goggles -->
          <path d="M-46,-487 Q0,-501 46,-487" stroke="${BR}" stroke-width="7" fill="none"/>
          <circle cx="-16" cy="-497" r="10.5" fill="#2f9f92" stroke="${BS}" stroke-width="4"/>
          <circle cx="16" cy="-497" r="10.5" fill="#2f9f92" stroke="${BS}" stroke-width="4"/>
          <path d="M-21,-501 Q-17,-505 -12,-503 M11,-501 Q15,-505 20,-503" stroke="#c9fff5" stroke-width="2" fill="none" stroke-linecap="round"/>
        </g>
      </g>
    </g>`;
  }

  /* Crystal Lynx — explorer. Feet at (0,0), ~500 units tall, facing right by default. */
  function crystal(mood = 'neutral') {
    const F = '#d8ae73', FL = '#f6e8cc', SP = '#9a7243', D = '#2a1e16', J = '#b85a32', JD = '#8b3f22', JL = '#d77a4c',
      CO = '#f1e6d0', P = '#394150', PD = '#2a303b', BO = '#5d3d29', TE = '#2f8f80';
    const brows = {
      neutral: 'M-26,-428 Q-16,-432 -7,-428 M26,-428 Q16,-432 7,-428',
      happy: 'M-26,-430 Q-16,-435 -7,-430 M26,-430 Q16,-435 7,-430',
      worried: 'M-26,-428 Q-16,-430 -7,-435 M26,-428 Q16,-430 7,-435',
      smug: 'M-26,-427 L-7,-428 M26,-431 Q16,-435 7,-431',
      surprised: 'M-26,-433 Q-16,-439 -7,-434 M26,-433 Q16,-439 7,-434',
    }[mood] || '';
    const eye = (x, s = 1) => `<path d="M${x - 10},-416 Q${x},-426 ${x + 10},-416 Q${x},-409 ${x - 10},-416Z" fill="#fbf6e8"/>
      <circle cx="${x + 1}" cy="-416.5" r="4.9" fill="#bcc23e"/><ellipse cx="${x + 1}" cy="-416.5" rx="1.7" ry="${4 * s}" fill="${D}"/>
      <circle cx="${x + 2.6}" cy="-418.6" r="1.3" fill="#fff"/>
      <path d="M${x - 10},-416 Q${x},-426 ${x + 10},-416" stroke="${D}" stroke-width="2.4" fill="none"/>`;
    let eyes = eye(-15) + eye(15);
    if (mood === 'happy') eyes = `<path d="M-24,-414 Q-15,-424 -6,-414 M6,-414 Q15,-424 24,-414" stroke="${D}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    if (mood === 'smug') eyes += `<path d="M-26,-424 L-4,-424 L-4,-416 L-26,-417Z M4,-424 L26,-424 L26,-417 L4,-416Z" fill="${F}"/>`;
    const mouth = {
      happy: `<path d="M-9,-394 Q0,-385 9,-394 Q0,-390 -9,-394Z" fill="#7a3a3a" stroke="${D}" stroke-width="1.8"/>`,
      surprised: `<ellipse cx="0" cy="-391" rx="3.5" ry="4.5" fill="#7a3a3a"/>`,
      worried: `<path d="M-6,-391 Q0,-395 6,-391" stroke="${D}" stroke-width="2" fill="none"/>`,
    }[mood] || `<path d="M0,-398 Q-4,-391 -9,-393 M0,-398 Q4,-391 9,-393" stroke="${D}" stroke-width="2" fill="none" stroke-linecap="round"/>`;

    return `<g class="crystal">
      <ellipse cx="0" cy="0" rx="62" ry="11" fill="#000" opacity=".35"/>
      <!-- bobtail -->
      <ellipse cx="-38" cy="-236" rx="14" ry="12" fill="${F}"/><ellipse cx="-46" cy="-234" rx="7" ry="8" fill="${D}"/>
      <!-- legs -->
      <path d="M-36,-236 L-4,-236 L-8,-130 L-10,-60 L-34,-60 L-36,-130Z" fill="${PD}"/>
      <path d="M4,-236 L36,-236 L34,-130 L32,-60 L10,-60 L8,-130Z" fill="${P}"/>
      <!-- boots -->
      <path d="M-37,-112 L-8,-112 L-8,-14 Q0,-12 6,-7 L6,0 L-38,0 L-37,-14Z" fill="#4b3122"/>
      <path d="M9,-112 L35,-112 L35,-14 Q44,-12 50,-7 L50,0 L8,0 L9,-14Z" fill="${BO}"/>
      <rect x="-39" y="-116" width="33" height="10" rx="3" fill="#7a5238"/><rect x="7" y="-116" width="30" height="10" rx="3" fill="#7a5238"/>
      <rect x="-39" y="-5" width="46" height="5" rx="2" fill="#1b130e"/><rect x="7" y="-5" width="45" height="5" rx="2" fill="#1b130e"/>
      <g class="c-upper">
        <!-- back arm -->
        <path d="M-48,-362 L-60,-292" stroke="${JD}" stroke-width="25" stroke-linecap="round"/>
        <path d="M-60,-292 L-58,-232" stroke="${JD}" stroke-width="21" stroke-linecap="round"/>
        <ellipse cx="-58" cy="-232" rx="13" ry="7" fill="${CO}"/>
        <circle cx="-58" cy="-222" r="10" fill="${F}"/>
        <!-- torso (flight jacket) -->
        <path d="M-48,-372 Q-55,-300 -45,-228 L45,-228 Q55,-300 48,-372 Q0,-386 -48,-372Z" fill="${J}"/>
        <path d="M18,-378 Q48,-374 48,-372 Q55,-300 45,-228 L22,-228 Q32,-300 18,-378Z" fill="${JD}" opacity=".5"/>
        <path d="M-2,-366 L-2,-232" stroke="${JD}" stroke-width="3"/>
        <rect x="-40" y="-330" width="24" height="18" rx="3" fill="${JD}"/><rect x="18" y="-322" width="22" height="22" rx="3" fill="${JD}"/>
        <circle cx="29" cy="-345" r="9" fill="${TE}"/><path d="M29,-352 L31,-347 L36,-346 L32,-343 L33,-338 L29,-341 L25,-338 L26,-343 L22,-346 L27,-347Z" fill="#e8fff6"/>
        <path d="M-40,-262 L-28,-258 M-36,-270 L-24,-266" stroke="${JL}" stroke-width="2" opacity=".6"/>
        <!-- belt + satchel -->
        <rect x="-46" y="-244" width="92" height="13" rx="3" fill="#3a2a20"/><rect x="-6" y="-245" width="12" height="15" rx="2" fill="none" stroke="#c9a052" stroke-width="3"/>
        <path d="M42,-368 L-40,-250" stroke="${TE}" stroke-width="9" stroke-linecap="round"/>
        <rect x="-62" y="-262" width="36" height="32" rx="7" fill="${BO}"/><rect x="-62" y="-262" width="36" height="12" rx="5" fill="#7a5238"/>
        <!-- collar shearling -->
        <path d="M-41,-374 Q-30,-394 -14,-388 Q0,-381 14,-388 Q30,-394 41,-374 Q24,-364 0,-360 Q-24,-364 -41,-374Z" fill="${CO}"/>
        <!-- front arm -->
        <path d="M48,-362 L62,-296" stroke="${J}" stroke-width="25" stroke-linecap="round"/>
        <path d="M62,-296 L44,-252" stroke="${J}" stroke-width="21" stroke-linecap="round"/>
        <ellipse cx="44" cy="-252" rx="13" ry="7" transform="rotate(-60 44 -252)" fill="${CO}"/>
        <circle cx="40" cy="-246" r="10" fill="${F}"/>
        <!-- neck -->
        <rect x="-13" y="-390" width="26" height="22" rx="6" fill="${F}"/>
        <g class="c-head">
          <!-- ears + tufts -->
          <path d="M-36,-432 Q-46,-472 -35,-482 Q-22,-464 -10,-446Z" fill="${F}" stroke="${D}" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M-31,-440 Q-38,-466 -34,-472 Q-25,-460 -18,-448Z" fill="${FL}"/>
          <path d="M-35,-481 Q-41,-498 -40,-512 Q-34,-497 -31,-480Z" fill="${D}"/>
          <path d="M36,-432 Q46,-472 35,-482 Q22,-464 10,-446Z" fill="${F}" stroke="${D}" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M31,-440 Q38,-466 34,-472 Q25,-460 18,-448Z" fill="${FL}"/>
          <path d="M35,-481 Q41,-498 40,-512 Q34,-497 31,-480Z" fill="${D}"/>
          <!-- ruffs -->
          <path d="M-36,-428 Q-50,-408 -60,-378 L-47,-386 L-50,-366 L-36,-380 L-32,-364 L-20,-382 Q-34,-398 -36,-428Z" fill="${FL}"/>
          <path d="M36,-428 Q50,-408 60,-378 L47,-386 L50,-366 L36,-380 L32,-364 L20,-382 Q34,-398 36,-428Z" fill="${FL}"/>
          <path d="M-44,-398 L-54,-382 M-40,-390 L-44,-372 M44,-398 L54,-382 M40,-390 L44,-372" stroke="${D}" stroke-width="2" opacity=".7"/>
          <ellipse cx="0" cy="-412" rx="40" ry="36" fill="${F}"/>
          <path d="M-6,-446 L-3,-430 M6,-446 L3,-430 M0,-448 L0,-432" stroke="${SP}" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="-28" cy="-398" r="2" fill="${SP}"/><circle cx="-33" cy="-404" r="1.6" fill="${SP}"/><circle cx="28" cy="-398" r="2" fill="${SP}"/><circle cx="33" cy="-404" r="1.6" fill="${SP}"/>
          <ellipse cx="0" cy="-394" rx="21" ry="14" fill="${FL}"/>
          ${eyes}
          <ellipse class="lid" cx="-15" cy="-416" rx="11" ry="7" fill="${F}"/>
          <ellipse class="lid" cx="15" cy="-416" rx="11" ry="7" fill="${F}"/>
          <path d="M-25,-416 L-34,-408 M25,-416 L34,-408" stroke="${D}" stroke-width="2" stroke-linecap="round"/>
          <path d="${brows}" stroke="${D}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          <path d="M-5,-405 L5,-405 L0,-399Z" fill="#d68680"/>
          ${mouth}
          <path d="M-16,-396 L-44,-400 M-16,-392 L-42,-388 M16,-396 L44,-400 M16,-392 L42,-388" stroke="#fffaf0" stroke-width="1.2" opacity=".8"/>
        </g>
      </g>
    </g>`;
  }

  /* Portrait: crop of the full-body character, framed head & shoulders. */
  function portrait(who, mood) {
    if (who === 'r') return `<svg viewBox="-105 -545 210 210" aria-hidden="true">${racket(mood || 'grump')}</svg>`;
    return `<svg viewBox="-95 -520 190 190" aria-hidden="true">${crystal(mood || 'neutral')}</svg>`;
  }

  // =====================================================================
  //  THE SHIP — "Dandelion"
  // =====================================================================
  function ship(o = {}) {
    const dmg = o.damaged !== false;
    return `<g class="ship">
      <rect x="-322" y="-48" width="76" height="70" rx="16" fill="url(#g-metal)" stroke="#4d555b" stroke-width="3"/>
      <rect x="-312" y="-36" width="56" height="8" rx="3" fill="#6d767c"/>
      <ellipse cx="-322" cy="-13" rx="13" ry="31" fill="#23272b" stroke="#4d555b" stroke-width="3"/>
      ${o.glow ? `<ellipse class="engine-glow" cx="-330" cy="-13" rx="34" ry="40" fill="url(#g-teal-glow)"/>` : ''}
      <path d="M-205,-52 L-252,-130 L-186,-128 L-140,-62Z" fill="#ddd3bc" stroke="#7d745f" stroke-width="3" stroke-linejoin="round"/>
      <path d="M-230,-112 L-193,-111 L-179,-92 L-218,-92Z" fill="#d36a32"/>
      <path d="M-262,12 Q-285,-28 -230,-58 L110,-82 Q235,-74 288,-14 Q248,32 120,42 L-205,42 Q-252,42 -262,12Z" fill="url(#g-hull)" stroke="#7d745f" stroke-width="3"/>
      <path d="M-252,-6 L252,-24 Q263,-18 271,-8 L-249,8Z" fill="#d36a32"/>
      <path d="M-60,-74 L-56,40 M60,-80 L64,42 M-180,-62 L-176,42" stroke="#a49a84" stroke-width="2" fill="none"/>
      <path d="M95,-78 Q175,-118 238,-42 Q180,-35 110,-38Z" fill="url(#g-glass)" stroke="#55625f" stroke-width="3"/>
      <path d="M118,-72 Q160,-94 196,-66" stroke="#eafffb" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>
      <path d="M-150,22 L-72,96 L38,96 L22,28Z" fill="#cfc5ae" stroke="#7d745f" stroke-width="3" stroke-linejoin="round"/>
      <path d="M-80,86 L36,86 L38,96 L-72,96Z" fill="#d36a32"/>
      <text x="-40" y="28" font-size="17" font-family="Fredoka, Nunito, sans-serif" font-weight="600" fill="#6e624d" letter-spacing="3">DANDELION</text>
      <rect x="-152" y="-38" width="46" height="28" rx="5" fill="${o.glow ? '#3ff0cc' : '#5a524a'}" stroke="#463f37" stroke-width="2"/>
      ${o.glow ? `<rect x="-152" y="-38" width="46" height="28" rx="5" fill="url(#g-teal-glow)" class="pulse"/>` : `<path d="M-146,-30 L-112,-18" stroke="#2a2622" stroke-width="2"/>`}
      ${dmg ? `
        <ellipse cx="-90" cy="-20" rx="48" ry="22" fill="#1c1a17" opacity=".45" filter="url(#f-blur3)"/>
        <ellipse cx="190" cy="10" rx="40" ry="16" fill="#1c1a17" opacity=".4" filter="url(#f-blur3)"/>
        <path d="M150,-80 L170,-62 L162,-50 L186,-40 M170,-62 L196,-70" stroke="#e9fff9" stroke-width="2" fill="none" opacity=".85"/>
        <path d="M-10,40 L4,74 L30,70 L22,42Z" fill="#bdb39c" stroke="#7d745f" stroke-width="2"/>
        <path d="M8,72 L4,86 M22,70 L28,84" stroke="#e0b04a" stroke-width="2"/>` : ''}
    </g>`;
  }

  // =====================================================================
  //  GARAGE
  // =====================================================================
  function garageBg() {
    srand(7);
    let s = `<rect width="1600" height="900" fill="url(#g-wall)"/>`;
    // planks
    for (let x = 0; x < 1170; x += 58) {
      s += `<rect x="${x}" y="70" width="57" height="590" fill="${rnd() > .5 ? '#000' : '#ffdcb0'}" opacity="${(0.015 + rnd() * 0.05).toFixed(3)}"/>
            <line x1="${x}" y1="70" x2="${x}" y2="660" stroke="#120c09" stroke-width="2.5" opacity=".7"/>
            <circle cx="${x + 8}" cy="${120 + (rnd() * 20 | 0)}" r="2" fill="#140e0b"/><circle cx="${x + 8}" cy="${560 + (rnd() * 20 | 0)}" r="2" fill="#140e0b"/>`;
    }
    // corrugated lower band
    s += `<rect x="0" y="580" width="1170" height="80" fill="#3a423e"/>`;
    for (let x = 0; x < 1170; x += 14) s += `<rect x="${x}" y="580" width="7" height="80" fill="#4b5550" opacity=".7"/>`;
    s += `<rect x="0" y="576" width="1170" height="8" fill="#2a2420"/>`;
    // rust streaks
    for (let i = 0; i < 9; i++) { const x = rnd() * 1150; s += `<rect x="${f1(x)}" y="584" width="${f1(3 + rnd() * 6)}" height="${f1(20 + rnd() * 50)}" fill="#8a4a2a" opacity=".35"/>`; }
    // ceiling + beams (curved freighter ribs — a lore hint)
    s += `<rect width="1600" height="78" fill="#140f0c"/>
      <path d="M0,78 Q400,40 800,60 T1600,70 L1600,0 L0,0Z" fill="#0f0b09"/>
      <rect x="0" y="70" width="1600" height="16" fill="#2a1d16"/>`;
    for (let x = 120; x < 1600; x += 260) s += `<path d="M${x - 70},86 Q${x},30 ${x + 70},86" stroke="#3a3f3c" stroke-width="10" fill="none"/><circle cx="${x}" cy="52" r="5" fill="#59605c"/>`;
    // floor
    s += `<rect y="655" width="1600" height="245" fill="url(#g-floor)"/>
      <rect y="652" width="1600" height="8" fill="#211a16"/>`;
    for (let i = 0; i < 9; i++) { const x = i * 200 - 100; s += `<line x1="${x + 40}" y1="660" x2="${x - 120}" y2="900" stroke="#1d1917" stroke-width="2" opacity=".6"/>`; }
    s += `<line x1="0" y1="760" x2="1600" y2="760" stroke="#1d1917" stroke-width="2" opacity=".5"/>`;
    for (let i = 0; i < 7; i++) s += `<ellipse cx="${f1(200 + rnd() * 1200)}" cy="${f1(700 + rnd() * 170)}" rx="${f1(30 + rnd() * 60)}" ry="${f1(8 + rnd() * 14)}" fill="#0d0b0a" opacity=".35"/>`;
    // bay opening to the outside
    s += `<rect x="1170" y="150" width="420" height="505" fill="url(#g-night)"/>`;
    for (let i = 0; i < 40; i++) s += `<circle cx="${f1(1175 + rnd() * 410)}" cy="${f1(160 + rnd() * 160)}" r="${f1(.6 + rnd() * 1.2)}" fill="#fff" opacity="${f1(.3 + rnd() * .6)}"/>`;
    s += `<circle cx="1490" cy="215" r="26" fill="#e9f3e6"/><circle cx="1482" cy="208" r="5" fill="#cfdccb"/><circle cx="1498" cy="224" r="3.5" fill="#cfdccb"/>
      <circle cx="1490" cy="215" r="60" fill="#e9f3e6" opacity=".08" filter="url(#f-blur10)"/>`;
    s += `<path d="M1170,470 Q1200,380 1230,460 Q1250,350 1290,450 Q1320,390 1350,470 Q1390,330 1430,460 Q1470,380 1500,470 Q1540,360 1590,450 L1590,655 L1170,655Z" fill="#0f2b2c"/>
      <path d="M1170,540 Q1230,480 1280,540 Q1340,470 1400,545 Q1460,490 1520,540 Q1560,500 1590,530 L1590,655 L1170,655Z" fill="#0a2022"/>
      <rect x="1170" y="590" width="420" height="65" fill="#1c2a22"/>`;
    for (let i = 0; i < 14; i++) s += `<circle class="spore" style="animation-delay:${f1(rnd() * 6)}s" cx="${f1(1180 + rnd() * 400)}" cy="${f1(420 + rnd() * 200)}" r="2.4" fill="#8fffd9"/>`;
    // rolled door + pillars
    s += `<rect x="1150" y="118" width="450" height="46" fill="#4a524e"/>`;
    for (let x = 1150; x < 1600; x += 12) s += `<rect x="${x}" y="118" width="6" height="46" fill="#5d6863"/>`;
    s += `<rect x="1150" y="160" width="450" height="6" fill="#2b302d"/>
      <rect x="1150" y="150" width="28" height="510" fill="#3b3430"/>`;
    for (let y = 160; y < 660; y += 36) s += `<path d="M1150,${y} L1178,${y + 18} L1178,${y + 30} L1150,${y + 12}Z" fill="#d6a43a" opacity=".85"/>`;
    // high shelf with clutter
    s += `<rect x="360" y="150" width="300" height="12" fill="#5a3f2e"/><path d="M380,162 L392,180 M640,162 L628,180" stroke="#3a2a20" stroke-width="5"/>
      <rect x="372" y="118" width="22" height="32" rx="3" fill="#7a8c6a"/><rect x="398" y="124" width="18" height="26" rx="3" fill="#a3683a"/>
      <rect x="420" y="108" width="14" height="42" fill="#5c4a7a"/><rect x="436" y="112" width="12" height="38" fill="#7a3a3a"/><rect x="450" y="106" width="15" height="44" fill="#3a5a6a"/>
      <ellipse cx="610" cy="140" rx="30" ry="10" fill="#2b2b2b"/><ellipse cx="610" cy="130" rx="30" ry="10" fill="#353535"/>`;
    // tire stack & barrel (right side, behind Racket)
    s += `<g><ellipse cx="1060" cy="640" rx="52" ry="16" fill="#151515"/><rect x="1008" y="600" width="104" height="40" fill="#1e1e1e"/><ellipse cx="1060" cy="600" rx="52" ry="16" fill="#2a2a2a"/>
      <rect x="1008" y="560" width="104" height="40" fill="#1e1e1e"/><ellipse cx="1060" cy="560" rx="52" ry="16" fill="#2a2a2a"/><ellipse cx="1060" cy="560" rx="24" ry="7" fill="#0e0e0e"/></g>`;
    // hanging lamps (cords + shades)
    [560, 900].forEach((x) => {
      s += `<line x1="${x}" y1="80" x2="${x}" y2="150" stroke="#111" stroke-width="3"/>
        <path d="M${x - 34},178 L${x - 14},150 L${x + 14},150 L${x + 34},178Z" fill="#2f5f52"/>
        <ellipse cx="${x}" cy="178" rx="34" ry="6" fill="#ffe2a6"/><circle cx="${x}" cy="176" r="8" fill="#fff6dc"/>`;
    });
    return s;
  }

  function garageFg() {
    return `<g pointer-events="none" style="mix-blend-mode:screen">
      <ellipse cx="560" cy="360" rx="330" ry="300" fill="url(#g-lamp)"/>
      <ellipse cx="900" cy="360" rx="330" ry="300" fill="url(#g-lamp)"/>
      <path d="M526,180 L594,180 L760,760 L360,760Z" fill="#ffd890" opacity=".05"/>
      <path d="M866,180 L934,180 L1100,760 L700,760Z" fill="#ffd890" opacity=".05"/>
      <ellipse cx="560" cy="780" rx="260" ry="50" fill="#ffcf85" opacity=".07"/>
      <ellipse cx="900" cy="780" rx="260" ry="50" fill="#ffcf85" opacity=".07"/>
      <ellipse cx="1380" cy="420" rx="260" ry="240" fill="#46d6b8" opacity=".05"/>
    </g>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle class="mote" style="animation-delay:${i * 1.3}s" cx="${480 + i * 70}" cy="${300 + (i % 3) * 90}" r="1.8" fill="#ffe9b8" pointer-events="none"/>`).join('')}`;
  }

  const garage = {
    window: () => `<g>
      <rect x="68" y="138" width="274" height="210" rx="6" fill="#1a120e"/>
      <rect x="82" y="152" width="246" height="186" fill="url(#g-night)"/>
      <circle cx="150" cy="198" r="22" fill="#e8f1e4"/><circle cx="144" cy="192" r="4" fill="#cfdccb"/><circle cx="158" cy="205" r="3" fill="#cfdccb"/>
      <circle cx="268" cy="182" r="11" fill="#bfe7d8"/>
      <circle cx="150" cy="198" r="50" fill="#e8f1e4" opacity=".08" filter="url(#f-blur10)"/>
      <circle cx="110" cy="170" r="1.2" fill="#fff"/><circle cx="230" cy="168" r="1" fill="#fff"/><circle cx="300" cy="215" r="1.3" fill="#fff"/><circle cx="196" cy="230" r="1" fill="#fff"/>
      <path d="M82,300 Q100,250 118,295 Q132,240 150,292 Q172,255 190,300 Q214,236 236,296 Q258,262 276,300 Q300,248 328,296 L328,338 L82,338Z" fill="#0c2626"/>
      <circle cx="132" cy="318" r="3" fill="#8fffd9" opacity=".8"/><circle cx="252" cy="312" r="2.5" fill="#8fffd9" opacity=".7"/>
      <rect x="202" y="152" width="7" height="186" fill="#1a120e"/><rect x="82" y="242" width="246" height="7" fill="#1a120e"/>
      <path d="M92,152 L150,152 L92,230Z" fill="#fff" opacity=".05"/>
      <rect x="58" y="338" width="294" height="14" rx="3" fill="#5a3f2e"/>
    </g>`,
    radio: (fixed) => `<g>
      <rect x="188" y="296" width="114" height="44" rx="9" fill="#7a4a2e" stroke="#3e2617" stroke-width="3"/>
      <rect x="198" y="304" width="46" height="28" rx="5" fill="#3a2a20"/>
      ${[0, 1, 2, 3, 4].map((i) => `<line x1="202" y1="${308 + i * 5}" x2="240" y2="${308 + i * 5}" stroke="#5a4232" stroke-width="2"/>`).join('')}
      <rect x="252" y="306" width="40" height="12" rx="3" fill="${fixed ? '#ffcf6a' : '#3b3226'}"/>
      ${fixed ? `<rect x="250" y="303" width="44" height="18" rx="4" fill="#ffcf6a" opacity=".35" filter="url(#f-blur3)"/>` : ''}
      <circle cx="262" cy="328" r="5" fill="#c9a052"/><circle cx="282" cy="328" r="5" fill="#c9a052"/>
      <path d="M290,296 L318,256" stroke="#9aa3aa" stroke-width="2.5"/><circle cx="318" cy="256" r="3" fill="#c9a052"/>
      ${fixed ? `<g class="notes" pointer-events="none"><text x="300" y="286" fill="#ffe3a0" font-size="22">♪</text><text x="322" y="270" fill="#9fffe0" font-size="18" style="animation-delay:.9s">♫</text></g>` : ''}
    </g>`,
    jobBoard: (S) => {
      const n = (x, y, r, c, txt, done) => `<g transform="rotate(${r} ${x + 22} ${y + 18})"><rect x="${x}" y="${y}" width="46" height="38" fill="${c}"/>
        <line x1="${x + 6}" y1="${y + 12}" x2="${x + 38}" y2="${y + 12}" stroke="#6a5a48" stroke-width="2"/><line x1="${x + 6}" y1="${y + 20}" x2="${x + 34}" y2="${y + 20}" stroke="#6a5a48" stroke-width="2"/>
        <text x="${x + 23}" y="${y + 33}" font-size="8" text-anchor="middle" fill="#5a3a2a" font-family="Nunito, sans-serif" font-weight="700">${txt}</text>
        ${done ? `<path d="M${x + 8},${y + 22} L${x + 18},${y + 32} L${x + 40},${y + 6}" stroke="#2f9f6a" stroke-width="4" fill="none" stroke-linecap="round"/>` : ''}
        <circle cx="${x + 23}" cy="${y + 3}" r="3.5" fill="#d0463a"/></g>`;
      return `<g><rect x="360" y="196" width="128" height="150" rx="5" fill="#5a3f2e"/><rect x="368" y="204" width="112" height="134" fill="#b88b5a"/>
        <text x="424" y="224" font-size="15" text-anchor="middle" fill="#3b2617" font-family="Fredoka, sans-serif" font-weight="600">JOBS</text>
        ${n(374, 232, -5, '#f3ead2', 'RADIO', S.jobs.radio === 'done')}${n(426, 236, 4, '#e8f0d0', 'BOLTS', S.jobs.bolts === 'done')}
        ${n(398, 284, -2, '#f0dccf', 'SCRAP', S.jobs.scrap === 'done')}</g>`;
    },
    shelfRocket: () => `<g transform="translate(520,104)">
      <path d="M0,46 Q-3,14 12,0 Q27,14 24,46Z" fill="#d9d2c0"/><path d="M0,46 L-8,48 L0,30Z M24,46 L32,48 L24,30Z" fill="#c4643a"/>
      <circle cx="12" cy="22" r="5" fill="#4fd1b8"/></g>`,
    terminal: (S) => `<g>
      <circle cx="565" cy="452" r="120" fill="url(#g-crt-glow)"/>
      <rect x="470" y="520" width="200" height="16" rx="3" fill="#6b4a33"/><rect x="470" y="534" width="200" height="6" fill="#3e2a1d"/>
      <rect x="482" y="540" width="12" height="120" fill="#3e2a1d"/><rect x="646" y="540" width="12" height="120" fill="#3e2a1d"/>
      <rect x="500" y="580" width="110" height="80" fill="#5a4030"/><path d="M500,620 L610,620 M555,580 L555,660" stroke="#3e2a1d" stroke-width="3"/>
      <rect x="494" y="392" width="146" height="124" rx="12" fill="#c9c2ae" stroke="#7d7564" stroke-width="3"/>
      <rect x="508" y="406" width="118" height="88" rx="9" fill="#06221a"/>
      <g class="crt-text" font-family="ui-monospace, monospace" font-size="11" fill="#6dffa7">
        <text x="516" y="424">JUNKNET OS</text>
        <text x="516" y="440">${S.flags.termUnlocked ? '&gt; WELCOME RKT' : '&gt; PASSWORD?'}</text>
        <text x="516" y="456">&gt; 3 DEALS (SKETCHY)</text>
        <text x="516" y="474" class="blink">█</text>
      </g>
      <rect x="508" y="406" width="118" height="88" rx="9" fill="url(#g-crt-glow)" opacity=".5"/>
      <rect x="500" y="503" width="132" height="14" rx="3" fill="#a8a08c"/>
      <rect x="612" y="396" width="26" height="24" fill="#f5e47a" transform="rotate(8 625 408)"/>
      <text x="624" y="412" font-size="6" text-anchor="middle" fill="#6a5a20" transform="rotate(8 625 408)" font-family="Nunito, sans-serif">hint→</text>
    </g>`,
    mug: () => `<g><rect x="646" y="490" width="20" height="26" rx="3" fill="#e9e2cf"/><path d="M666,496 Q676,503 666,510" stroke="#e9e2cf" stroke-width="4" fill="none"/>
      <path d="M650,486 Q654,476 650,468 M658,486 Q662,474 658,464" stroke="#fff" stroke-width="1.5" fill="none" opacity=".35"/></g>`,
    pegboard: (S, pryOnBoard) => {
      let holes = '';
      for (let y = 186; y < 404; y += 18) for (let x = 704; x < 1004; x += 18) holes += `<circle cx="${x}" cy="${y}" r="2" fill="#5a4328"/>`;
      return `<g><rect x="690" y="172" width="324" height="240" rx="4" fill="#8f6e4a" stroke="#5a4328" stroke-width="4"/>${holes}
        <!-- hammer -->
        <rect x="716" y="200" width="10" height="90" rx="3" fill="#7a5539"/><rect x="700" y="192" width="42" height="18" rx="3" fill="#6d767c"/>
        <!-- wrenches -->
        ${[0, 1, 2, 3].map((i) => `<g transform="translate(${764 + i * 22},196)"><rect x="-4" y="0" width="8" height="${70 + i * 12}" rx="3" fill="url(#g-metal)"/><circle cx="0" cy="0" r="8" fill="none" stroke="#a9b1b7" stroke-width="5"/></g>`).join('')}
        <!-- saw -->
        <path d="M870,200 L940,200 L940,232 L870,252Z" fill="#c9d0d6" stroke="#6d767c" stroke-width="2"/><rect x="852" y="196" width="22" height="34" rx="6" fill="#a8473a"/>
        <!-- screwdrivers -->
        ${[0, 1, 2].map((i) => `<rect x="${862 + i * 18}" y="280" width="9" height="34" rx="3" fill="${['#d6a43a', '#2f8f80', '#c4643a'][i]}"/><rect x="${865 + i * 18}" y="314" width="3" height="40" fill="#a9b1b7"/>`).join('')}
        <!-- pry bar slot -->
        ${pryOnBoard
          ? `<g><path d="M956,196 L966,392" stroke="#b5352a" stroke-width="10" stroke-linecap="round"/><path d="M956,196 Q950,182 962,178" stroke="#b5352a" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M966,392 L978,398" stroke="#a9b1b7" stroke-width="9" stroke-linecap="round"/></g>${sparkle(962, 290, .8, .4)}`
          : `<path d="M956,196 L966,392 M956,196 Q950,182 962,178 M966,392 L978,398" stroke="#f2ead8" stroke-width="3" stroke-dasharray="7 6" fill="none" opacity=".75"/>`}
        <!-- goggles diagram -->
        <rect x="900" y="300" width="40" height="52" fill="#efe6cc" transform="rotate(-6 920 326)"/><path d="M906,316 L934,312 M906,326 L930,322 M906,336 L934,332" stroke="#7a6a50" stroke-width="2" transform="rotate(-6 920 326)"/>
      </g>`;
    },
    workbench: (S) => `<g>
      <rect x="682" y="486" width="340" height="26" rx="4" fill="#7a5539"/><rect x="682" y="486" width="340" height="6" rx="3" fill="#9a7250"/>
      <rect x="692" y="512" width="320" height="44" fill="#4f3626"/>
      <rect x="700" y="518" width="140" height="32" rx="3" fill="#5f4230"/><rect x="852" y="518" width="150" height="32" rx="3" fill="#5f4230"/>
      <circle cx="770" cy="534" r="4" fill="#c9a052"/><circle cx="927" cy="534" r="4" fill="#c9a052"/>
      <rect x="696" y="556" width="16" height="104" fill="#3a281c"/><rect x="992" y="556" width="16" height="104" fill="#3a281c"/>
      <rect x="712" y="620" width="280" height="10" fill="#3a281c"/>
      <rect x="730" y="598" width="60" height="22" rx="3" fill="#2f6f60"/><rect x="800" y="602" width="44" height="18" rx="3" fill="#8a3f22"/>
      <!-- vise -->
      <rect x="690" y="462" width="44" height="26" rx="3" fill="#3f6f62"/><rect x="684" y="456" width="56" height="10" rx="3" fill="#2f5f52"/><rect x="734" y="470" width="24" height="5" fill="#a9b1b7"/>
      <!-- scattered gears -->
      <circle cx="790" cy="480" r="10" fill="none" stroke="#a9b1b7" stroke-width="5" stroke-dasharray="4 3"/>
      <circle cx="812" cy="482" r="6" fill="none" stroke="#c9a052" stroke-width="4" stroke-dasharray="3 2"/>
      <!-- fuel cell cradle -->
      <rect x="836" y="472" width="96" height="16" rx="4" fill="#3b4440"/>
      ${S.parts.casing || S.repairs.fuel ? `<rect x="850" y="${S.repairs.fuel ? 470 : 420}" width="68" height="${S.repairs.fuel ? 0 : 54}" rx="10" fill="url(#g-metal)" stroke="#4d555b" stroke-width="2"/>` : ''}
      ${S.parts.crystal && !S.repairs.fuel ? `<path d="M884,428 L896,446 L884,468 L872,446Z" fill="url(#g-crystal)"/><circle cx="884" cy="448" r="26" fill="url(#g-teal-glow)" class="pulse"/>` : ''}
      ${S.parts.wiring && !S.repairs.fuel ? `<path d="M850,452 Q830,440 846,430 Q862,422 850,412" stroke="url(#g-copper)" stroke-width="4" fill="none"/><path d="M918,452 Q938,440 922,430" stroke="url(#g-copper)" stroke-width="4" fill="none"/>` : ''}
      <!-- clamp lamp -->
      <path d="M990,486 L998,430 L960,404" stroke="#2f5f52" stroke-width="5" fill="none"/><path d="M944,396 L972,392 L968,414Z" fill="#2f5f52"/>
    </g>`,
    boltBin: (sorted) => `<g>
      <rect x="944" y="452" width="68" height="36" rx="4" fill="#4d6670" stroke="#2c3c42" stroke-width="3"/>
      ${sorted
        ? `<line x1="966" y1="452" x2="966" y2="488" stroke="#2c3c42" stroke-width="3"/><line x1="989" y1="452" x2="989" y2="488" stroke="#2c3c42" stroke-width="3"/>
           ${[952, 975, 998].map((x, i) => `<rect x="${x}" y="${446 - i * 2}" width="${8 + i * 2}" height="${10 + i * 3}" rx="2" fill="#a9b1b7"/>`).join('')}`
        : `<path d="M948,456 L958,440 L966,452 L976,436 L986,450 L996,438 L1008,456Z" fill="#a9b1b7"/><circle cx="970" cy="446" r="3" fill="#6d767c"/><circle cx="992" cy="448" r="3" fill="#6d767c"/>
           <path d="M998,440 Q1006,428 1014,436 L1010,446Z" fill="#c94a8a"/>`}
    </g>`,
    couch: (S, mittsOnCouch) => `<g>
      <ellipse cx="230" cy="726" rx="210" ry="20" fill="#000" opacity=".4"/>
      <path d="M58,592 Q56,560 92,556 L370,556 Q404,560 402,592 L402,640 L58,640Z" fill="url(#g-couch)"/>
      <rect x="40" y="610" width="70" height="108" rx="26" fill="#874a30"/><rect x="350" y="610" width="70" height="108" rx="26" fill="#874a30"/>
      <rect x="92" y="626" width="132" height="44" rx="14" fill="#a35e3e"/><rect x="232" y="626" width="132" height="44" rx="14" fill="#9d593a"/>
      <rect x="84" y="664" width="290" height="50" rx="10" fill="#6e3824"/>
      <rect x="150" y="572" width="60" height="12" fill="#9aa3aa" opacity=".8" transform="rotate(-8 180 578)"/>
      <rect x="290" y="640" width="40" height="10" fill="#9aa3aa" opacity=".8" transform="rotate(12 310 645)"/>
      <path d="M300,560 Q330,620 312,700 L360,700 Q368,620 350,560Z" fill="#2f6f60"/>
      <path d="M306,580 L352,580 M309,610 L356,610 M311,640 L360,640 M312,670 L361,670" stroke="#215044" stroke-width="5"/>
      <path d="M322,560 L318,700 M338,560 L340,700" stroke="#43927e" stroke-width="3"/>
      <rect x="66" y="714" width="14" height="14" fill="#2a1a12"/><rect x="380" y="714" width="14" height="14" fill="#2a1a12"/>
      ${mittsOnCouch ? `<g transform="translate(64,580) rotate(-14)"><path d="M0,40 L0,14 Q0,0 12,0 Q24,0 24,14 L24,18 Q32,14 34,22 Q36,28 26,32 L24,40Z" fill="#c0392b"/><rect x="-2" y="36" width="28" height="9" rx="3" fill="#f2ead8"/><circle cx="8" cy="14" r="2" fill="#f2ead8"/><circle cx="16" cy="24" r="2" fill="#f2ead8"/></g>${sparkle(76, 590, .7, 1.1)}` : ''}
      ${S.flags.noodles ? `<g><path d="M372,598 L380,628 L398,628 L406,598Z" fill="#f2ead8"/><rect x="370" y="594" width="38" height="6" rx="2" fill="#c0392b"/><path d="M380,592 Q384,580 380,570 M394,592 Q398,578 394,566" stroke="#fff" stroke-width="1.5" fill="none" opacity=".5"/>
        <path d="M44,598 L52,628 L70,628 L78,598Z" fill="#f2ead8"/><rect x="42" y="594" width="38" height="6" rx="2" fill="#2f8f80"/></g>` : ''}
    </g>`,
    bayShip: (S) => `<g>
      <ellipse cx="1385" cy="652" rx="210" ry="18" fill="#000" opacity=".45"/>
      <path d="M1290,650 L1300,600 M1480,650 L1470,600" stroke="#d6a43a" stroke-width="10"/>
      <rect x="1270" y="640" width="44" height="12" fill="#3b3430"/><rect x="1456" y="640" width="44" height="12" fill="#3b3430"/>
      <g transform="translate(1385,540) scale(.66)">${ship({ damaged: true, glow: S.repairs.fuel })}</g>
      ${S.repairs.fuel ? '' : sparkle(1290, 520, .6, 2.1)}
    </g>`,
    exit: () => `<g class="exit-arrow">
      <path d="M1500,770 L1556,800 L1500,830" stroke="#9fffe6" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
      <path d="M1468,770 L1524,800 L1468,830" stroke="#9fffe6" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/>
    </g>`,
  };

  // =====================================================================
  //  CRASH SITE
  // =====================================================================
  function alienTree(x, y, s, c1, c2, sd) {
    srand(sd);
    let t = `<path d="M${x - 20 * s},${y} Q${x - 6 * s},${y - 140 * s} ${x + 14 * s},${y - 262 * s} L${x + 38 * s},${y - 256 * s} Q${x + 20 * s},${y - 140 * s} ${x + 22 * s},${y} Z" fill="#2b2a24"/>
      <path d="M${x + 4 * s},${y} Q${x + 10 * s},${y - 140 * s} ${x + 28 * s},${y - 250 * s}" stroke="#3d3a30" stroke-width="${4 * s}" fill="none"/>
      <path d="M${x - 20 * s},${y} Q${x - 50 * s},${y - 8 * s} ${x - 70 * s},${y + 6 * s} M${x + 22 * s},${y} Q${x + 50 * s},${y - 6 * s} ${x + 76 * s},${y + 8 * s}" stroke="#2b2a24" stroke-width="${12 * s}" fill="none" stroke-linecap="round"/>`;
    const blobs = [[-80, 10, 72], [0, -36, 98], [84, 0, 78], [34, 44, 70], [-34, 36, 62], [-50, -40, 60], [60, -50, 58]];
    blobs.forEach(([dx, dy, r]) => { t += `<circle cx="${f1(x + 26 * s + dx * s)}" cy="${f1(y - 300 * s + dy * s)}" r="${f1(r * s)}" fill="${c1}"/>`; });
    blobs.forEach(([dx, dy, r]) => { t += `<circle cx="${f1(x + 18 * s + dx * s)}" cy="${f1(y - 314 * s + dy * s)}" r="${f1(r * s * .62)}" fill="${c2}" opacity=".55"/>`; });
    for (let i = 0; i < 9; i++) {
      const px = x + 26 * s + (rnd() - .5) * 230 * s, py = y - 300 * s + (rnd() - .4) * 150 * s;
      t += `<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(5 * s)}" fill="#a8ffe6"/><circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(14 * s)}" fill="#6fffd8" opacity=".25" filter="url(#f-blur3)"/>`;
    }
    return t;
  }

  const mush = (x, y, s, c = '#7fffe0') => `<g transform="translate(${x},${y}) scale(${s})">
    <rect x="-3" y="-22" width="6" height="22" rx="3" fill="#d9e6d6"/><path d="M-16,-20 Q0,-40 16,-20Z" fill="${c}"/>
    <circle cx="0" cy="-26" r="22" fill="${c}" opacity=".18" filter="url(#f-blur3)"/></g>`;

  function crashBg(S) {
    srand(42);
    const towed = S.flags.shipTowed;
    let s = `<rect width="1600" height="900" fill="url(#g-dusk)"/>`;
    for (let i = 0; i < 110; i++) s += `<circle cx="${(rnd() * 1600) | 0}" cy="${(rnd() * 400) | 0}" r="${f1(rnd() * 1.6 + .4)}" fill="#fff" opacity="${(rnd() * .6 + .2).toFixed(2)}"/>`;
    // aurora
    s += `<path d="M-50,170 Q300,90 620,170 T1250,140 T1700,180" stroke="#4fffc8" stroke-width="50" fill="none" opacity=".13" filter="url(#f-blur24)"/>
      <path d="M-50,220 Q380,150 700,230 T1700,210" stroke="#9a7aff" stroke-width="40" fill="none" opacity=".09" filter="url(#f-blur24)"/>`;
    // ringed planet
    s += `<g transform="rotate(-14 1170 150)">
      <ellipse cx="1170" cy="150" rx="128" ry="24" fill="none" stroke="#d8efe4" stroke-width="6" opacity=".5"/>
      <circle cx="1170" cy="150" r="72" fill="#9cc6b6"/><path d="M1100,140 Q1170,120 1240,140 L1242,156 Q1170,138 1098,158Z" fill="#7aa89a" opacity=".7"/>
      <path d="M1102,168 Q1170,150 1238,170" stroke="#b9dccd" stroke-width="7" fill="none" opacity=".6"/>
      <path d="M1042,150 A128,24 0 0,0 1298,150" fill="none" stroke="#e6fff4" stroke-width="6" opacity=".75"/></g>
      <circle cx="300" cy="104" r="26" fill="#eaf0e2"/><circle cx="292" cy="98" r="5" fill="#cfd8c6"/><circle cx="308" cy="112" r="3.5" fill="#cfd8c6"/>
      <circle cx="300" cy="104" r="70" fill="#eaf0e2" opacity=".07" filter="url(#f-blur10)"/>`;
    // ridges + fog
    const ridge = (base, amp, col, sd) => {
      srand(sd); let d = `M0,${base}`;
      for (let x = 0; x <= 1600; x += 50) d += ` Q${x + 25},${f1(base - amp * (.4 + rnd()))} ${x + 50},${f1(base - amp * rnd() * .5)}`;
      return `<path d="${d} L1600,900 L0,900Z" fill="${col}"/>`;
    };
    s += ridge(470, 90, '#1d3d44', 3) + `<rect y="380" width="1600" height="200" fill="url(#g-fog)"/>` + ridge(530, 70, '#152e34', 5);
    // distant garage glow through trees (right)
    s += `<circle cx="1525" cy="478" r="120" fill="url(#g-lamp)"/>
      <rect x="1505" y="462" width="14" height="12" fill="#ffcf7a"/><rect x="1524" y="462" width="14" height="12" fill="#ffcf7a"/>
      <path d="M1540,440 L1540,420" stroke="#2a2420" stroke-width="8"/>
      <g class="chimney-smoke" pointer-events="none"><circle cx="1542" cy="404" r="10" fill="#cfd8d2" opacity=".18" filter="url(#f-blur3)"/><circle cx="1548" cy="380" r="14" fill="#cfd8d2" opacity=".14" filter="url(#f-blur3)"/><circle cx="1556" cy="350" r="18" fill="#cfd8d2" opacity=".1" filter="url(#f-blur3)"/></g>`;
    // far trees
    s += alienTree(1000, 560, .5, '#173a3a', '#21504a', 11) + alienTree(160, 560, .55, '#173a3a', '#21504a', 12) + alienTree(1440, 570, .6, '#173a3a', '#21504a', 13);
    // ground
    s += `<path d="M0,600 Q400,566 800,592 T1600,586 L1600,900 L0,900Z" fill="url(#g-ground)"/>
      <path d="M1150,900 Q1290,730 1600,650 L1600,712 Q1370,770 1270,900Z" fill="#4a4030" opacity=".55"/>`;
    // crater
    s += `<ellipse cx="770" cy="705" rx="300" ry="66" fill="#0e140f"/><ellipse cx="770" cy="700" rx="260" ry="50" fill="#1a1a14"/>
      <ellipse cx="770" cy="700" rx="230" ry="40" fill="#24201a" opacity=".8"/>
      <path d="M470,702 Q520,672 590,684 M1000,690 Q1050,676 1072,700" stroke="#3a3326" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    if (towed) s += `<path d="M820,700 Q1050,700 1260,820 Q1300,846 1330,900 M850,722 Q1060,724 1240,840 Q1270,866 1290,900" stroke="#0d0f0c" stroke-width="14" fill="none" opacity=".55" stroke-dasharray="18 8"/>`;
    // big trees
    s += alienTree(300, 640, 1.15, '#1e5a52', '#2e8a76', 21) + alienTree(1350, 625, 1.0, '#1c5450', '#2b7f70', 22);
    // ground details
    srand(77);
    for (let i = 0; i < 40; i++) {
      const x = rnd() * 1600, y = 640 + rnd() * 250;
      s += `<path d="M${f1(x)},${f1(y)} q-4,-18 -10,-26 M${f1(x)},${f1(y)} q2,-20 6,-30 M${f1(x)},${f1(y)} q8,-14 16,-20" stroke="#2f5a43" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    }
    s += mush(560, 640, 1) + mush(585, 648, .7, '#b8a2ff') + mush(1110, 640, .9) + mush(1135, 650, .6) + mush(210, 820, 1.2) + mush(240, 836, .8, '#b8a2ff') + mush(1500, 860, 1.1);
    s += `<path d="M90,860 Q120,820 170,848 Q200,826 230,860Z" fill="#26362c"/><ellipse cx="980" cy="850" rx="50" ry="18" fill="#2a2e28"/>`;
    for (let i = 0; i < 18; i++) s += `<circle class="spore" style="animation-delay:${f1(rnd() * 8)}s" cx="${f1(rnd() * 1600)}" cy="${f1(450 + rnd() * 380)}" r="${f1(1.6 + rnd() * 2)}" fill="#9fffe0"/>`;
    return s;
  }

  const crash = {
    ship: () => `<g>
      <g transform="translate(770,610) rotate(-11)">${ship({ damaged: true })}</g>
      <ellipse cx="900" cy="672" rx="200" ry="22" fill="#0b0d0a" opacity=".5"/>
      <g class="smoke" pointer-events="none">
        ${[0, 1, 2, 3, 4].map((i) => `<circle style="animation-delay:${i * 1.1}s" cx="${600 + i * 6}" cy="560" r="${26 + i * 4}" fill="#9aa39e" opacity=".0" filter="url(#f-blur10)"/>`).join('')}
      </g>
      <g class="sparks-loop" pointer-events="none"><circle cx="915" cy="620" r="3" fill="#ffd36a"/><circle cx="925" cy="612" r="2" fill="#fff2b0"/></g>
    </g>`,
    tracks: () => `<g><rect x="900" y="690" width="200" height="40" fill="transparent"/></g>`,
    debris: (hasCasing) => `<g>
      <ellipse cx="1150" cy="700" rx="120" ry="18" fill="#000" opacity=".4"/>
      <path d="M1046,700 L1080,640 L1150,628 L1210,650 L1252,700Z" fill="#6a6250" stroke="#3e392e" stroke-width="3"/>
      ${hasCasing ? `<rect x="1110" y="640" width="56" height="40" rx="9" fill="url(#g-metal)" stroke="#4d555b" stroke-width="2"/>${sparkle(1136, 652, .8, .7)}` : ''}
      <path d="M1060,690 L1102,612 L1206,600 L1236,676Z" fill="url(#g-hull)" stroke="#7d745f" stroke-width="3" transform="${hasCasing ? '' : 'rotate(28 1240 690) translate(30,10)'}"/>
      <path d="M1108,626 L1196,616" stroke="#d36a32" stroke-width="8" transform="${hasCasing ? '' : 'rotate(28 1240 690) translate(30,10)'}"/>
      <circle cx="1120" cy="640" r="3" fill="#7d745f"/><circle cx="1190" cy="632" r="3" fill="#7d745f"/>
    </g>`,
    hullScrap: () => `<g><ellipse cx="370" cy="752" rx="66" ry="10" fill="#000" opacity=".35"/>
      <path d="M312,748 L330,716 L408,706 L428,740Z" fill="url(#g-hull)" stroke="#7d745f" stroke-width="3"/>
      <path d="M332,730 L410,720" stroke="#d36a32" stroke-width="6"/>${sparkle(372, 722, .6, 1.5)}</g>`,
    antenna: () => `<g><ellipse cx="1310" cy="726" rx="50" ry="9" fill="#000" opacity=".35"/>
      <path d="M1272,722 L1300,680 L1318,698 L1352,650" stroke="#c9d0d6" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle cx="1352" cy="650" r="9" fill="#d36a32"/><path d="M1262,724 L1290,724" stroke="#6d767c" stroke-width="10" stroke-linecap="round"/>${sparkle(1330, 672, .6, .2)}</g>`,
    locker: (hasFuse) => `<g><ellipse cx="240" cy="712" rx="64" ry="10" fill="#000" opacity=".4"/>
      <g transform="rotate(-8 240 670)"><rect x="190" y="634" width="100" height="70" rx="6" fill="#d86a2a" stroke="#7a3812" stroke-width="3"/>
      <rect x="196" y="640" width="88" height="10" fill="#b9541c"/><path d="M220,672 L260,672 M240,652 L240,692" stroke="#fff3e0" stroke-width="7"/>
      <path d="M190,634 L208,606 L300,606 L290,634Z" fill="#e57a38" stroke="#7a3812" stroke-width="3"/></g>
      ${hasFuse ? sparkle(250, 628, .6, 2.4) : ''}</g>`,
    crystals: (hasCrystal) => `<g>
      <circle cx="110" cy="610" r="110" fill="url(#g-teal-glow)" class="pulse"/>
      <path d="M40,700 L58,600 L82,700Z" fill="url(#g-crystal)" stroke="#0f5a54" stroke-width="2"/>
      <path d="M70,700 L104,520 L136,700Z" fill="url(#g-crystal)" stroke="#0f5a54" stroke-width="2"/>
      <path d="M120,700 L158,574 L178,700Z" fill="url(#g-crystal)" stroke="#0f5a54" stroke-width="2"/>
      <path d="M90,600 L104,520 L110,620Z" fill="#eafffb" opacity=".5"/>
      ${hasCrystal ? `<path d="M150,690 L170,640 L190,690 L170,704Z" fill="#c9fff4" stroke="#2fd1b2" stroke-width="2"/>${sparkle(170, 660, .7, .9)}` : `<path d="M154,700 L166,684 L184,700Z" fill="#177a72"/>`}
      <ellipse cx="110" cy="704" rx="90" ry="12" fill="#0b1a16"/>
    </g>`,
    critter: () => `<g class="critter">
      <path d="M352,454 Q380,440 430,452" stroke="#2b2a24" stroke-width="14" stroke-linecap="round" fill="none"/>
      <g transform="translate(392,432)">
        <path d="M-14,10 L-20,22 M-6,12 L-8,24 M6,12 L8,24 M14,10 L20,22" stroke="#3a2f45" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="0" cy="0" rx="22" ry="16" fill="#8a72c8"/><ellipse cx="0" cy="4" rx="14" ry="9" fill="#b8a6ec"/>
        <circle cx="-8" cy="-4" r="6" fill="#fff"/><circle cx="8" cy="-4" r="6" fill="#fff"/><circle cx="-7" cy="-3" r="3.4" fill="#1b1424"/><circle cx="9" cy="-3" r="3.4" fill="#1b1424"/>
        <path d="M-6,-14 Q-10,-28 -16,-30 M6,-14 Q10,-28 16,-30" stroke="#3a2f45" stroke-width="2" fill="none"/>
        <circle cx="-16" cy="-30" r="3.5" fill="#9fffe0"/><circle cx="16" cy="-30" r="3.5" fill="#9fffe0"/>
      </g></g>`,
    exit: () => `<g class="exit-arrow">
      <path d="M1520,560 L1566,590 L1520,620" stroke="#ffe0a0" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M1490,560 L1536,590 L1490,620" stroke="#ffe0a0" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/>
    </g>`,
  };

  // =====================================================================
  //  ITEM ICONS (64x64)
  // =====================================================================
  const ICONS = {
    datapad: `<rect x="14" y="8" width="36" height="48" rx="6" fill="#2c3a40" stroke="#9fe" stroke-width="2"/><rect x="19" y="14" width="26" height="32" rx="2" fill="#2fd1b2" opacity=".85"/>
      <path d="M22 38 L28 29 L33 34 L42 22" stroke="#0b2a24" stroke-width="2.5" fill="none"/><circle cx="32" cy="51" r="2.5" fill="#9fe"/>`,
    pry_bar: `<path d="M16 54 L44 16 Q48 8 56 11" stroke="#c0392b" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M16 54 L9 50" stroke="#bfc6cc" stroke-width="7" stroke-linecap="round"/>`,
    oven_mitts: `<path d="M18 54 L18 24 Q18 10 30 10 Q42 10 42 24 L42 28 Q50 24 52 32 Q54 38 44 42 L42 54Z" fill="#c0392b"/><rect x="16" y="50" width="28" height="9" rx="3" fill="#f2ead8"/>
      <circle cx="26" cy="22" r="2.2" fill="#f2ead8"/><circle cx="34" cy="32" r="2.2" fill="#f2ead8"/><circle cx="26" cy="40" r="2.2" fill="#f2ead8"/>`,
    hull_scrap: `<path d="M8 46 L16 20 L50 14 L58 40Z" fill="#e2d8c2" stroke="#7d745f" stroke-width="2.5"/><path d="M14 34 L54 28" stroke="#d36a32" stroke-width="5"/><circle cx="20" cy="22" r="2" fill="#7d745f"/><circle cx="48" cy="18" r="2" fill="#7d745f"/>`,
    antenna: `<path d="M12 52 L26 30 L34 38 L50 14" stroke="#c9d0d6" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="50" cy="14" r="6" fill="#d36a32"/><rect x="6" y="50" width="20" height="7" rx="3" fill="#6d767c"/>`,
    spare_fuse: `<rect x="12" y="24" width="40" height="16" rx="6" fill="#bff3ff" opacity=".55" stroke="#7fb8c4" stroke-width="2"/><rect x="6" y="22" width="10" height="20" rx="3" fill="#c9a052"/><rect x="48" y="22" width="10" height="20" rx="3" fill="#c9a052"/>
      <path d="M16 32 Q22 26 28 32 T40 32 T48 32" stroke="#ff9a3c" stroke-width="2" fill="none"/>`,
    cell_casing: `<rect x="16" y="10" width="32" height="46" rx="9" fill="url(#g-metal)" stroke="#4d555b" stroke-width="2.5"/><rect x="16" y="20" width="32" height="5" fill="#6d767c"/><rect x="16" y="42" width="32" height="5" fill="#6d767c"/>
      <path d="M40 28 Q44 32 40 36" stroke="#4d555b" stroke-width="2" fill="none"/>`,
    charge_crystal: `<circle cx="32" cy="32" r="24" fill="url(#g-teal-glow)"/><path d="M32 6 L46 28 L32 58 L18 28Z" fill="url(#g-crystal)" stroke="#0f5a54" stroke-width="2"/><path d="M32 6 L36 28 L32 58" stroke="#eafffb" stroke-width="1.5" fill="none" opacity=".7"/>`,
    wiring: `<path d="M10 40 Q10 20 24 22 Q38 24 34 36 Q30 46 42 46 Q56 46 54 28" stroke="url(#g-copper)" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="48" y="18" width="12" height="12" rx="2" fill="#3b4440"/><rect x="4" y="38" width="12" height="10" rx="2" fill="#3b4440"/>
      <path d="M26 22 l2 -4 M34 26 l4 -2" stroke="#7a3a1a" stroke-width="2"/>`,
    garage_key: `<circle cx="20" cy="22" r="11" fill="none" stroke="#d9b45a" stroke-width="5"/><path d="M28 30 L52 54 M44 46 L50 40 M48 50 L54 44" stroke="#d9b45a" stroke-width="5" stroke-linecap="round"/>
      <circle cx="44" cy="16" r="10" fill="#8d929b"/><path d="M36 15 Q44 9 52 15 L50 19 Q44 16 38 19Z" fill="#23252a"/><circle cx="41" cy="16" r="1.5" fill="#86d65e"/><circle cx="47" cy="16" r="1.5" fill="#86d65e"/>`,
  };
  const icon = (id) => `<svg viewBox="0 0 64 64" aria-hidden="true">${ICONS[id] || ''}</svg>`;

  // Fuel cell schematic for the workbench
  function fuelCellSchematic(parts, charged, charge = 0) {
    return `<svg viewBox="0 0 400 240" class="schematic" aria-hidden="true">
      <rect width="400" height="240" fill="#0d1a17"/>
      ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="240" stroke="#173029" stroke-width="1"/>`).join('')}
      ${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${i * 20}" x2="400" y2="${i * 20}" stroke="#173029" stroke-width="1"/>`).join('')}
      <circle cx="200" cy="120" r="${60 + charge * 60}" fill="url(#g-teal-glow)" opacity="${charged ? 1 : charge}"/>
      <g class="${parts.wiring ? 'part-in' : 'part-ghost'}" data-part="wiring">
        <path d="M150,90 Q110,70 130,50 Q150,30 120,20 M250,90 Q290,70 270,50 Q250,30 280,20 M150,160 Q110,180 130,200 M250,160 Q290,180 270,200" stroke="${parts.wiring ? 'url(#g-copper)' : '#4fd1b8'}" stroke-width="${parts.wiring ? 6 : 2}" fill="none" stroke-dasharray="${parts.wiring ? '0' : '6 5'}"/>
      </g>
      <g class="${parts.casing ? 'part-in' : 'part-ghost'}" data-part="casing">
        <rect x="150" y="50" width="100" height="140" rx="22" fill="${parts.casing ? 'url(#g-metal)' : 'none'}" stroke="${parts.casing ? '#4d555b' : '#4fd1b8'}" stroke-width="${parts.casing ? 4 : 2}" stroke-dasharray="${parts.casing ? '0' : '8 6'}"/>
        ${parts.casing ? `<rect x="150" y="76" width="100" height="10" fill="#6d767c"/><rect x="150" y="156" width="100" height="10" fill="#6d767c"/><rect x="172" y="92" width="56" height="58" rx="8" fill="#14211e"/>` : ''}
      </g>
      <g class="${parts.crystal ? 'part-in' : 'part-ghost'}" data-part="crystal">
        <path d="M200,94 L218,120 L200,148 L182,120Z" fill="${parts.crystal ? 'url(#g-crystal)' : 'none'}" stroke="#4fd1b8" stroke-width="2" stroke-dasharray="${parts.crystal ? '0' : '5 4'}"/>
        ${parts.crystal ? `<circle cx="200" cy="120" r="${22 + charge * 20}" fill="url(#g-teal-glow)" class="pulse"/>` : ''}
      </g>
      <text x="16" y="24" fill="#4fd1b8" font-family="ui-monospace, monospace" font-size="12">FUEL CELL // ${charged ? 'ONLINE' : 'ASSEMBLY'}</text>
      <text x="16" y="226" fill="#4fd1b8" font-family="ui-monospace, monospace" font-size="11" opacity=".7">SEALS ${parts.casing ? 'OK' : '--'} · CORE ${parts.crystal ? 'OK' : '--'} · LINES ${parts.wiring ? 'OK' : '--'}</text>
    </svg>`;
  }

  // Bolt for the sorting mini-game
  const bolt = (size) => {
    const s = { S: .6, M: .85, L: 1.12 }[size];
    return `<svg viewBox="-30 -30 60 90" aria-hidden="true"><g transform="scale(${s})">
      <path d="M-18,-10 L-9,-24 L9,-24 L18,-10 L9,4 L-9,4Z" fill="url(#g-metal)" stroke="#4d555b" stroke-width="2"/>
      <rect x="-7" y="4" width="14" height="50" fill="#b9c0c7" stroke="#6d767c" stroke-width="1.5"/>
      ${[12, 20, 28, 36, 44].map((y) => `<line x1="-7" y1="${y}" x2="7" y2="${y + 4}" stroke="#6d767c" stroke-width="1.5"/>`).join('')}
    </g></svg>`;
  };
  const sock = `<svg viewBox="0 0 60 90" aria-hidden="true"><path d="M20,6 L42,6 L42,52 Q42,70 26,76 Q8,80 6,66 Q6,56 20,52Z" fill="#c94a8a"/><rect x="20" y="6" width="22" height="10" fill="#f2ead8"/><circle cx="31" cy="34" r="4" fill="#f2ead8"/><circle cx="24" cy="60" r="4" fill="#f2ead8"/></svg>`;

  function titleArt() {
    const S = { flags: {}, jobs: {}, parts: {}, repairs: {} };
    return garageBg() + garage.window() + garage.radio(true) + garage.couch(S, false) + garage.workbench(S) + garage.pegboard(S, true) +
      garage.bayShip(S) + `<g transform="translate(1090,800)">${racket('smirk')}</g><g transform="translate(830,812) scale(.94)">${crystal('happy')}</g>` +
      garageFg() + `<rect width="1600" height="900" fill="#0a1210" opacity=".45"/>` + overlays();
  }

  return { DEFS, overlays, racket, crystal, portrait, ship, garageBg, garageFg, garage, crashBg, crash, icon, fuelCellSchematic, bolt, sock, titleArt, sparkle };
})();
