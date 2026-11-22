/* Racket's Garage — minigames.js
 * Little chores and puzzles. Each one opens in the shared modal and calls onWin() when solved.
 *   Mini.bolts(round, onWin)   sort the bolt bin (round 1: bolts, round 2: + nuts & washers)
 *   Mini.tune(onWin)           tune the tow truck: tighten when the needle is in the green
 *   Mini.wires(onWin)          untangle the workbench wiring: match each wire to its port
 *   Mini.breakers(onWin)       Vex's crane breaker box: get every breaker green
 *   Mini.gasket(onWin)         cut a gasket: trace the outline dot to dot
 * The engine provides G.ui = { modal, closeModal, say }.
 */
const Mini = (() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pickOne = (a) => a[Math.random() * a.length | 0];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const win = (onWin, delay = 650) => { Sound.sfx('success'); setTimeout(() => { G.ui.closeModal(); onWin && onWin(); }, delay); };

  // ---------------------------------------------------------------- bolts
  const BINS1 = [{ id: 'S', label: 'Small' }, { id: 'M', label: 'Medium' }, { id: 'L', label: 'Large' }];
  const BINS2 = [...BINS1, { id: 'N', label: 'Nuts' }, { id: 'W', label: 'Washers' }];
  const WRONG = {
    S: "Racket: \"That's a small. Look at it. It's tiny. It's practically a baby.\"",
    M: 'Racket: "That\'s a medium. Are you even looking?"',
    L: 'Racket: "That one\'s a large. Like my disappointment."',
    N: 'Racket: "That\'s a NUT. Nuts go with the nuts. Like at a family reunion."',
    W: 'Racket: "Washer. Flat, round, has a hole. Like a donut you can\'t eat."',
  };
  function bolts(round, onWin) {
    const kinds = round === 2 ? ['S', 'S', 'M', 'M', 'L', 'L', 'N', 'N', 'N', 'W', 'W', 'W'] : ['S', 'S', 'S', 'M', 'M', 'M', 'L', 'L', 'L'];
    const bins = round === 2 ? BINS2 : BINS1;
    const items = shuffle([...kinds.map((k, i) => ({ id: i, k, done: false })), { id: 99, k: 'sock', done: false }]);
    let selId = null;
    G.ui.modal(round === 2 ? 'Bolt Bin: The Sequel' : 'Sort the Bolt Bin', '<div class="boltgame"></div>', { cls: 'bolt-modal' });
    const draw = (msg) => {
      const el = $('#modal .boltgame');
      if (!el) return;
      const need = {}, have = {};
      kinds.forEach((k) => { need[k] = (need[k] || 0) + 1; });
      items.forEach((b) => { if (b.done) have[b.k] = (have[b.k] || 0) + 1; });
      const art = (k) => (k === 'sock' ? Art.sock : k === 'N' ? Art2.nut : k === 'W' ? Art2.washer : Art.bolt(k));
      el.innerHTML = `<p class="bolt-msg">${esc(msg)}</p>
        <div class="pile">${items.filter((b) => !b.done).map((b) => `<button class="bolt ${selId === b.id ? 'sel' : ''}" data-b="${b.id}" aria-label="${b.k}">${art(b.k)}</button>`).join('')}</div>
        <div class="bins b${bins.length}">${bins.map((b) => `<button class="bin" data-bin="${b.id}"><span class="bin-label">${b.label}</span><span class="bin-count">${have[b.id] || 0}/${need[b.id]}</span></button>`).join('')}</div>`;
      $$('[data-b]', el).forEach((btn) => btn.addEventListener('click', () => {
        const it = items.find((x) => x.id === +btn.dataset.b);
        if (it.k === 'sock') {
          Sound.sfx('error');
          draw(round === 2 ? 'Racket: "The sock is BACK? ...Leave it. The sock has seen things."' : 'Racket: "Leave the sock. The sock stays. Don\'t ask about the sock."');
          return;
        }
        selId = it.id; Sound.sfx('click'); draw(msg);
      }));
      $$('[data-bin]', el).forEach((btn) => btn.addEventListener('click', () => {
        if (selId == null) { draw('Pick something out of the pile first.'); return; }
        const it = items.find((x) => x.id === selId);
        if (it.k === btn.dataset.bin) {
          it.done = true; selId = null; Sound.sfx('clank');
          if (!items.some((x) => x.k !== 'sock' && !x.done)) { draw('Sorted! Every last one.'); win(onWin); return; }
          draw(pickOne(['Clink.', 'Clank. Nice.', 'Into the bin it goes.', 'Satisfying.', 'Racket nods. Barely.']));
        } else {
          Sound.sfx('error');
          draw(WRONG[it.k]);
        }
      }));
    };
    draw(round === 2 ? 'Now with nuts and washers. Tap one, then tap its bin.' : 'Tap a bolt, then tap the bin it belongs in.');
  }

  // ---------------------------------------------------------------- tune-up (timing)
  function tune(onWin) {
    G.ui.modal('Tune the Tow Truck', `<div class="tune">
      <p class="bolt-msg" id="tune-msg">Tighten each bolt when the needle's in the green. Three good turns and she purrs.</p>
      <svg viewBox="-160 -150 320 175" class="gauge" aria-hidden="true">
        <path d="M-130,0 A130,130 0 0,1 130,0" fill="none" stroke="#2a3d36" stroke-width="26"/>
        <path id="tune-zone" d="" fill="none" stroke="#4fe08a" stroke-width="26"/>
        ${Array.from({ length: 11 }, (_, i) => { const a = Math.PI * (1 - i / 10); return `<line x1="${Math.cos(a) * 112}" y1="${-Math.sin(a) * 112}" x2="${Math.cos(a) * 100}" y2="${-Math.sin(a) * 100}" stroke="#6d7d77" stroke-width="3"/>`; }).join('')}
        <g id="tune-needle"><path d="M-5,0 L0,-120 L5,0Z" fill="#ffcf6a"/></g>
        <circle r="12" fill="#3b4440" stroke="#ffcf6a" stroke-width="3"/>
        <text y="22" text-anchor="middle" fill="#a8b6ab" font-size="12" font-family="Nunito, sans-serif" font-weight="700">RPM-ish</text>
      </svg>
      <div class="pips" id="tune-pips"><i></i><i></i><i></i></div>
      <button class="btn big" id="tune-go">Tighten!</button></div>`, { cls: 'tune-modal' });
    let hits = 0, ang = 0, dir = 1, speed = 70, zone = null, raf = 0, last = performance.now(), cool = false;
    const arc = (a0, a1) => {
      const p = (a) => { const r = Math.PI * (1 - (a + 90) / 180); return `${(Math.cos(r) * 130).toFixed(1)},${(-Math.sin(r) * 130).toFixed(1)}`; };
      return `M${p(a0)} A130,130 0 0,1 ${p(a1)}`;
    };
    const newZone = () => {
      const w = [34, 24, 16][Math.min(hits, 2)];
      const c = (Math.random() * 120 - 60);
      zone = [c - w / 2, c + w / 2];
      $('#tune-zone').setAttribute('d', arc(zone[0], zone[1]));
    };
    newZone();
    const frame = (now) => {
      if (!$('#tune-needle')) { cancelAnimationFrame(raf); return; }
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      ang += dir * speed * dt;
      if (ang > 88) { ang = 88; dir = -1; } if (ang < -88) { ang = -88; dir = 1; }
      $('#tune-needle').setAttribute('transform', `rotate(${ang.toFixed(1)})`);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const go = () => {
      if (cool || hits >= 3) return;
      const msg = $('#tune-msg');
      if (ang >= zone[0] && ang <= zone[1]) {
        hits++; Sound.sfx('clank');
        $$('#tune-pips i')[hits - 1].classList.add('on');
        if (hits >= 3) { msg.textContent = 'VROOM. The tow truck purrs like a very large, very greasy cat.'; cancelAnimationFrame(raf); win(onWin, 900); return; }
        speed += 38; newZone();
        msg.textContent = pickOne(['Perfect torque.', 'Ooh, that\'s the spot.', 'Racket: "...Not bad."']);
      } else {
        Sound.sfx('error');
        msg.textContent = pickOne(['Racket: "Too early. Patience. Like fishing, but louder."', 'Racket: "Missed. The truck felt that. Emotionally."', 'Racket: "Green, lynx. GREEN. The happy color."', 'Clunk. The engine coughs at you.']);
        cool = true; setTimeout(() => { cool = false; }, 350);
      }
    };
    $('#tune-go').addEventListener('click', go);
    $('.gauge').addEventListener('click', go);
  }

  // ---------------------------------------------------------------- wires
  function wires(onWin) {
    const W = [
      { id: 'r', color: '#e0503c', sym: '●', name: 'red' }, { id: 'b', color: '#3c8ee0', sym: '■', name: 'blue' },
      { id: 'y', color: '#e8c63c', sym: '▲', name: 'yellow' }, { id: 'g', color: '#3cc07a', sym: '◆', name: 'green' },
      { id: 'o', color: '#e0843c', sym: '★', name: 'orange' },
    ];
    const left = shuffle([...W]), right = shuffle([...W]);
    const done = {};
    let sel = null;
    G.ui.modal('Untangle the Wiring', '<div class="wires"></div>', { cls: 'wire-modal' });
    const draw = (msg) => {
      const el = $('#modal .wires');
      if (!el) return;
      const y = (i) => 30 + i * 52;
      const lines = Object.keys(done).map((id) => {
        const li = left.findIndex((w) => w.id === id), ri = right.findIndex((w) => w.id === id), w = W.find((x) => x.id === id);
        return `<path d="M60,${y(li)} C160,${y(li)} 180,${y(ri)} 280,${y(ri)}" stroke="${w.color}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      }).join('');
      el.innerHTML = `<p class="bolt-msg">${esc(msg)}</p>
        <div class="wire-board">
          <svg viewBox="0 0 340 270" aria-hidden="true">${lines}
            ${left.map((w, i) => `<path d="M0,${y(i)} L60,${y(i)}" stroke="${w.color}" stroke-width="7" stroke-linecap="round"/>`).join('')}
            ${right.map((w, i) => `<path d="M280,${y(i)} L340,${y(i)}" stroke="${w.color}" stroke-width="7" stroke-linecap="round" opacity=".55"/>`).join('')}
          </svg>
          <div class="wcol l">${left.map((w, i) => `<button class="wbtn ${sel === w.id ? 'sel' : ''} ${done[w.id] ? 'ok' : ''}" data-l="${w.id}" style="top:${y(i) / 270 * 100}%;--c:${w.color}" aria-label="${w.name} wire">${w.sym}</button>`).join('')}</div>
          <div class="wcol r">${right.map((w, i) => `<button class="wbtn ${done[w.id] ? 'ok' : ''}" data-r="${w.id}" style="top:${y(i) / 270 * 100}%;--c:${w.color}" aria-label="${w.name} port">${w.sym}</button>`).join('')}</div>
        </div>`;
      $$('[data-l]', el).forEach((b) => b.addEventListener('click', () => { if (done[b.dataset.l]) return; sel = b.dataset.l; Sound.sfx('click'); draw(msg); }));
      $$('[data-r]', el).forEach((b) => b.addEventListener('click', () => {
        if (!sel) { draw('Pick a wire on the left first.'); return; }
        if (b.dataset.r === sel) {
          done[sel] = true; sel = null; Sound.sfx('spark');
          if (Object.keys(done).length === W.length) { draw('All connected. Nothing is on fire. Racket looks almost proud.'); win(onWin, 900); return; }
          draw(pickOne(['Click. Connected.', 'Bzzt. In a good way.', 'Racket: "Red to red. Not that red. ...Okay, that red."']));
        } else {
          Sound.sfx('zap');
          sel = null;
          draw(pickOne(['ZAP. Your whiskers frizz. Wrong port.', 'Racket: "If it sparks, it\'s wrong. That\'s the whole system."', 'Sparks! The lights flicker. Racket: "Lynx."']));
        }
      }));
    };
    draw('Tap a wire on the left, then the matching port on the right.');
  }

  // ---------------------------------------------------------------- breakers (lights out)
  function breakers(onWin) {
    const N = 3;
    let grid, start, moves = 0;
    const press = (g, i) => {
      const r = Math.floor(i / N), c = i % N;
      [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < N && cc >= 0 && cc < N) g[rr * N + cc] = !g[rr * N + cc];
      });
    };
    do {
      grid = Array(N * N).fill(true);
      const presses = shuffle([...Array(N * N).keys()]).slice(0, 3);
      presses.forEach((i) => press(grid, i));
    } while (grid.every(Boolean));
    start = [...grid];
    G.ui.modal("Big Bertha's Breaker Box", '<div class="breakers"></div>', { cls: 'breaker-modal' });
    const draw = (msg) => {
      const el = $('#modal .breakers');
      if (!el) return;
      el.innerHTML = `<p class="bolt-msg">${esc(msg)}</p>
        <div class="bgrid">${grid.map((on, i) => `<button class="brk ${on ? 'on' : ''}" data-i="${i}" aria-label="breaker ${i + 1} ${on ? 'on' : 'off'}"><span></span></button>`).join('')}</div>
        <div class="brow"><span class="muted">Flips: ${moves}</span><button class="btn" id="brk-reset">Reset</button></div>`;
      $$('[data-i]', el).forEach((b) => b.addEventListener('click', () => {
        press(grid, +b.dataset.i); moves++; Sound.sfx('clank');
        if (grid.every(Boolean)) { draw('All green! Somewhere, Big Bertha hums awake.'); win(onWin, 900); return; }
        draw(moves === 6 ? 'Vex (shouting from the shack): "Each one flips its neighbours too! I wired it! Badly!"' : msg);
      }));
      $('#brk-reset', el).addEventListener('click', () => { grid = [...start]; moves = 0; Sound.sfx('click'); draw('Back to how you found it.'); });
    };
    draw('Get every breaker green. Each switch also flips the ones next to it.');
  }

  // ---------------------------------------------------------------- gasket (dot to dot)
  function gasket(onWin) {
    // a rounded-square gasket with bolt tabs, traced clockwise
    const pts = [[150, 40], [210, 40], [250, 20], [270, 60], [260, 120], [270, 180], [250, 220], [210, 200], [150, 200], [90, 200], [50, 220], [30, 180], [40, 120], [30, 60], [50, 20], [90, 40]];
    let next = 0;
    G.ui.modal('Cut the Gasket', '<div class="gasket"></div>', { cls: 'gasket-modal' });
    const draw = (msg) => {
      const el = $('#modal .gasket');
      if (!el) return;
      const path = pts.slice(0, next).map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ') + (next === pts.length ? ' Z' : '');
      el.innerHTML = `<p class="bolt-msg">${esc(msg)}</p>
        <div class="gasket-board"><svg viewBox="0 0 300 240" aria-hidden="true">
          <rect x="10" y="6" width="280" height="228" rx="10" fill="url(#g-copper)" opacity=".9"/>
          <path d="M18,14 L282,14" stroke="#ffd2a8" stroke-width="2" opacity=".5"/>
          <rect x="110" y="90" width="80" height="60" rx="16" fill="none" stroke="#7a3a1a" stroke-width="2" stroke-dasharray="5 5"/>
          ${next === pts.length ? `<path d="${path}" fill="#ffb02a" opacity=".35"/>` : ''}
          <path d="${path}" stroke="#fff3b0" stroke-width="4" fill="none" stroke-linejoin="round"/>
        </svg>
        ${pts.map((p, i) => `<button class="gdot ${i < next ? 'done' : ''} ${i === next ? 'next' : ''}" data-i="${i}" style="left:${p[0] / 300 * 100}%;top:${p[1] / 240 * 100}%" aria-label="point ${i + 1}">${i + 1}</button>`).join('')}</div>`;
      $$('[data-i]', el).forEach((b) => b.addEventListener('click', () => {
        const i = +b.dataset.i;
        if (i === next) {
          next++; Sound.sfx('spark');
          if (next === pts.length) { draw('Clean cut. Racket holds it up to the light. "...Huh. Perfect seal."'); win(onWin, 1100); return; }
          draw(next === 1 ? 'Keep going, in order.' : msg);
        } else if (i < next) {
          draw('Already cut that bit.');
        } else {
          Sound.sfx('error');
          draw(pickOne(['Racket: "Clockwise. Like a clock. You\'ve seen a clock."', 'Racket: "In ORDER, lynx. One, two, three. Numbers."', 'The torch sputters. Wrong spot.']));
        }
      }));
    };
    draw('Trace the outline with the torch: tap the dots in order, 1 to 16.');
  }

  return { bolts, tune, wires, breakers, gasket };
})();
