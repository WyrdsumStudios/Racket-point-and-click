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

  // ---------------------------------------------------------------- firefly lanterns
  function fireflies(onWin) {
    const NEED = 12;
    G.ui.modal('Firefly Lanterns', `<div class="ffgame">
      <p class="bolt-msg" id="ff-msg">Catch fireflies to fill the lanterns and light the path. Leave the red sparkbugs alone.</p>
      <div class="ff-field" id="ff-field"></div>
      <div class="lanterns">${[0, 1, 2].map((i) => `<div class="lantern" data-l="${i}"><i></i><span>0/4</span></div>`).join('')}</div></div>`, { cls: 'ff-modal' });
    const field = $('#ff-field');
    let caught = 0, raf = 0, last = performance.now(), alive = true;
    const bugs = [];
    const spawn = (bad) => {
      const el = document.createElement('button');
      el.className = 'ff' + (bad ? ' bad' : '');
      el.setAttribute('aria-label', bad ? 'sparkbug' : 'firefly');
      const b = { el, x: Math.random() * 90 + 5, y: Math.random() * 80 + 10, vx: (Math.random() - .5) * 18, vy: (Math.random() - .5) * 14, bad, t: Math.random() * 6 };
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!alive) return;
        if (b.bad) {
          Sound.sfx('zap');
          caught = Math.max(0, caught - 1);
          $('#ff-msg').textContent = pickOne(['ZAP! A sparkbug. One firefly escapes in the confusion.', 'Pip hoots a warning. Too late. Sparkbug!']);
          b.x = Math.random() * 90 + 5; b.y = Math.random() * 80 + 10;
        } else {
          Sound.sfx('sparkle');
          caught++;
          el.remove(); bugs.splice(bugs.indexOf(b), 1);
          $('#ff-msg').textContent = caught >= NEED ? 'All three lanterns are glowing!' : pickOne(['Got one!', 'Into the jar.', 'Gentle... gentle... gotcha.', 'It blinks happily in the jar.']);
          if (bugs.filter((x) => !x.bad).length < 4 && caught + bugs.filter((x) => !x.bad).length < NEED + 2) spawn(false);
        }
        update();
        if (caught >= NEED) { alive = false; cancelAnimationFrame(raf); win(onWin, 1000); }
      });
      field.appendChild(el);
      bugs.push(b);
    };
    const update = () => $$('.lantern').forEach((l, i) => {
      const n = Math.max(0, Math.min(4, caught - i * 4));
      l.classList.toggle('lit', n === 4);
      l.style.setProperty('--fill', n / 4);
      $('span', l).textContent = `${n}/4`;
    });
    for (let i = 0; i < 7; i++) spawn(false);
    spawn(true); spawn(true);
    const frame = (now) => {
      if (!$('#ff-field')) { alive = false; return; }
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      bugs.forEach((b) => {
        b.t += dt;
        b.vx += (Math.random() - .5) * 40 * dt; b.vy += (Math.random() - .5) * 40 * dt;
        b.vx = Math.max(-22, Math.min(22, b.vx)); b.vy = Math.max(-18, Math.min(18, b.vy));
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < 3 || b.x > 97) b.vx *= -1; if (b.y < 5 || b.y > 95) b.vy *= -1;
        b.x = Math.max(3, Math.min(97, b.x)); b.y = Math.max(5, Math.min(95, b.y));
        b.el.style.left = b.x + '%'; b.el.style.top = b.y + '%';
        b.el.style.opacity = b.bad ? 1 : .55 + .45 * Math.abs(Math.sin(b.t * 2.2));
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- star map
  function starmap(onWin) {
    const wr = [[1150, 112], [1130, 150], [1170, 190], [1210, 230], [1250, 270], [1236, 300], [1270, 296], [1200, 132]].map(([x, y]) => [Math.round((x - 1110) * 1.4 + 110), Math.round((y - 100) * 1.05 + 22)]);
    const dand = [[200, 130]].concat([0, 1, 2, 3, 4, 5].map((i) => [Math.round(200 + Math.cos(i * Math.PI / 3 - Math.PI / 2) * 72), Math.round(130 + Math.sin(i * Math.PI / 3 - Math.PI / 2) * 72)]));
    const C = [
      { name: 'The Lantern', pts: [[180, 60], [230, 60], [255, 125], [205, 180], [155, 125]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]] },
      { name: 'The Dandelion', pts: dand, edges: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]] },
      { name: 'The Wrench', bonus: true, pts: wr, edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [7, 2]] },
    ];
    let ci = 0, done = [], selS = null, decoys = [];
    const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
    const makeDecoys = () => { decoys = []; while (decoys.length < 9) { const p = [20 + Math.random() * 360, 15 + Math.random() * 230]; if (C[ci].pts.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 34) && decoys.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 30)) decoys.push(p); } };
    G.ui.modal('Star Map Calibration', '<div class="starmap"></div>', { cls: 'star-modal' });
    makeDecoys();
    const draw = (msg) => {
      const el = $('#modal .starmap');
      if (!el) return;
      const c = C[ci];
      const all = [...c.pts.map((p, i) => ({ p, i })), ...decoys.map((p, j) => ({ p, i: 100 + j }))];
      const thumb = `<svg viewBox="0 0 400 260" class="sm-thumb" aria-hidden="true">${c.edges.map(([a, b]) => `<line x1="${c.pts[a][0]}" y1="${c.pts[a][1]}" x2="${c.pts[b][0]}" y2="${c.pts[b][1]}" stroke="#9fd8ff" stroke-width="6"/>`).join('')}${c.pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#eafcff"/>`).join('')}</svg>`;
      el.innerHTML = `<p class="bolt-msg">${esc(msg)}</p>
        <div class="sm-wrap"><div class="sm-ref"><b>${c.name}</b>${thumb}<span>${done.length}/${c.edges.length} lines</span></div>
        <div class="sm-sky"><svg viewBox="0 0 400 260" aria-hidden="true">
          ${done.map((k) => { const [a, b] = k.split('-').map(Number); return `<line x1="${c.pts[a][0]}" y1="${c.pts[a][1]}" x2="${c.pts[b][0]}" y2="${c.pts[b][1]}" stroke="#9fd8ff" stroke-width="2.5"/>`; }).join('')}
        </svg>${all.map(({ p, i }) => `<button class="star ${selS === i ? 'sel' : ''}" data-s="${i}" style="left:${p[0] / 4}%;top:${p[1] / 2.6}%" aria-label="star"></button>`).join('')}</div></div>`;
      $$('[data-s]', el).forEach((b) => b.addEventListener('click', () => {
        const i = +b.dataset.s;
        if (selS === null) { selS = i; Sound.sfx('click'); draw(msg); return; }
        if (selS === i) { selS = null; draw(msg); return; }
        const k = key(selS, i);
        const ok = selS < 100 && i < 100 && c.edges.some(([a, bb]) => key(a, bb) === k);
        selS = null;
        if (ok && !done.includes(k)) {
          done.push(k); Sound.sfx('sparkle');
          if (done.length === c.edges.length) {
            if (ci === C.length - 1) { draw('Racket: "SEE? A wrench. I told you. ...Okay, nav\'s calibrated. Good work, lynx."'); win(onWin, 1400); return; }
            ci++; done = []; makeDecoys();
            draw(C[ci].bonus ? 'Racket: "One more. Top right. The Wrench." Crystal: "That is NOT a real constellation." Racket: "It is now."' : `${C[ci - 1].name} locked in! Next: ${C[ci].name}.`);
            return;
          }
          draw(msg);
        } else if (ok) { draw('Already connected those two.'); } else {
          Sound.sfx('error');
          draw(pickOne(['The line fizzles. Those two aren\'t part of it.', 'Racket: "That star\'s a decoy. Or a satellite. Or a bug on the lens."', 'Nope. Check the shape on the left.']));
        }
      }));
    };
    draw('Rebuild each constellation: tap one star, then another, to draw a line. Copy the shape on the left.');
  }

  // ---------------------------------------------------------------- root maze (rotate the root tiles)
  function roots(onWin) {
    const R = 5, Cc = 6, N = 1, E = 2, S = 4, Wd = 8;
    const rot = (m) => ((m << 1) | (m >> 3)) & 15;
    const DIR = { [N]: [-1, 0, S], [E]: [0, 1, Wd], [S]: [1, 0, N], [Wd]: [0, -1, E] };
    let grid, r0, r1;
    const build = () => {
      r0 = Math.random() * R | 0; r1 = Math.random() * R | 0;
      grid = Array.from({ length: R }, () => Array(Cc).fill(0));
      let r = r0, enter = Wd;
      for (let c = 0; c < Cc; c++) {
        const target = c === Cc - 1 ? r1 : Math.random() * R | 0;
        while (r !== target) { const d = target > r ? S : N; grid[r][c] = enter | d; enter = d === S ? N : S; r += d === S ? 1 : -1; }
        grid[r][c] = enter | E; enter = Wd;
      }
      for (let rr = 0; rr < R; rr++) for (let c = 0; c < Cc; c++) if (!grid[rr][c]) grid[rr][c] = [5, 10, 3, 6, 12, 9, 7, 11][Math.random() * 8 | 0];
      for (let rr = 0; rr < R; rr++) for (let c = 0; c < Cc; c++) { let k = Math.random() * 4 | 0; while (k--) grid[rr][c] = rot(grid[rr][c]); }
    };
    const flow = () => {
      const lit = Array.from({ length: R }, () => Array(Cc).fill(false));
      if (!(grid[r0][0] & Wd)) return { lit, out: false };
      const q = [[r0, 0]]; lit[r0][0] = true;
      while (q.length) {
        const [r, c] = q.shift();
        [N, E, S, Wd].forEach((d) => {
          if (!(grid[r][c] & d)) return;
          const [dr, dc, back] = DIR[d], nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= R || nc < 0 || nc >= Cc || lit[nr][nc] || !(grid[nr][nc] & back)) return;
          lit[nr][nc] = true; q.push([nr, nc]);
        });
      }
      return { lit, out: lit[r1][Cc - 1] && (grid[r1][Cc - 1] & E) };
    };
    do { build(); } while (flow().out);
    let moves = 0;
    G.ui.modal('Root Maze', '<div class="rootgame"></div>', { cls: 'root-modal' });
    const tile = (m, on) => `<svg viewBox="0 0 60 60" aria-hidden="true">${[[N, '30,30 30,0'], [E, '30,30 60,30'], [S, '30,30 30,60'], [Wd, '30,30 0,30']].filter(([d]) => m & d).map(([, pts]) => `<polyline points="${pts}" stroke="${on ? '#7affe4' : '#6a4a30'}" stroke-width="${on ? 12 : 14}" stroke-linecap="round" fill="none"/>`).join('')}<circle cx="30" cy="30" r="${on ? 8 : 7}" fill="${on ? '#eafffb' : '#4a3424'}"/></svg>`;
    const draw = (msg) => {
      const el = $('#modal .rootgame');
      if (!el) return;
      const { lit, out } = flow();
      el.innerHTML = `<p class="bolt-msg">${esc(msg)}</p>
        <div class="rg-wrap"><div class="rg-src" style="top:${(r0 + .5) / R * 100}%">✦</div>
        <div class="rg-grid">${grid.map((row, r) => row.map((m, c) => `<button class="rt ${lit[r][c] ? 'on' : ''}" data-r="${r}" data-c="${c}" aria-label="root tile">${tile(m, lit[r][c])}</button>`).join('')).join('')}</div>
        <div class="rg-exit ${out ? 'on' : ''}" style="top:${(r1 + .5) / R * 100}%">◉</div></div>
        <p class="muted small">Tap a tile to turn it. Moves: ${moves}</p>`;
      $$('.rt', el).forEach((b) => b.addEventListener('click', () => {
        const r = +b.dataset.r, c = +b.dataset.c;
        grid[r][c] = rot(grid[r][c]); moves++; Sound.sfx('click');
        if (flow().out) { draw('The light runs all the way through! The roots shiver and pull apart.'); win(onWin, 1200); return; }
        draw(msg);
      }));
    };
    draw('Turn the roots so the light flows from the glowing seed on the left to the exit on the right.');
  }

  // Bolt Bin III: springs join the party
  const spring = `<svg viewBox="-30 -30 60 90" aria-hidden="true"><path d="M-12,-14 L12,-8 L-12,-2 L12,4 L-12,10 L12,16 L-12,22 L12,28 L-12,34 L12,40" stroke="#c9d0d6" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
  const boltsBase = bolts;
  function boltsAll(round, onWin) {
    if (round !== 3) return boltsBase(round, onWin);
    const kinds = ['S', 'S', 'L', 'L', 'N', 'N', 'W', 'W', 'P', 'P', 'P'];
    const bins = [{ id: 'S', label: 'Small' }, { id: 'L', label: 'Large' }, { id: 'N', label: 'Nuts' }, { id: 'W', label: 'Washers' }, { id: 'P', label: 'Springs' }];
    const items = shuffle([...kinds.map((k, i) => ({ id: i, k, done: false })), { id: 98, k: 'sock' }, { id: 99, k: 'sock' }]);
    let selId = null;
    G.ui.modal('Bolt Bin III: Return of the Sock', '<div class="boltgame"></div>', { cls: 'bolt-modal' });
    const art = (k) => (k === 'sock' ? Art.sock : k === 'N' ? Art2.nut : k === 'W' ? Art2.washer : k === 'P' ? spring : Art.bolt(k));
    const draw = (msg) => {
      const el = $('#modal .boltgame');
      if (!el) return;
      const need = {}, have = {};
      kinds.forEach((k) => { need[k] = (need[k] || 0) + 1; });
      items.forEach((b) => { if (b.done) have[b.k] = (have[b.k] || 0) + 1; });
      el.innerHTML = `<p class="bolt-msg">${esc(msg)}</p>
        <div class="pile">${items.filter((b) => !b.done).map((b) => `<button class="bolt ${selId === b.id ? 'sel' : ''}" data-b="${b.id}" aria-label="${b.k}">${art(b.k)}</button>`).join('')}</div>
        <div class="bins b5">${bins.map((b) => `<button class="bin" data-bin="${b.id}"><span class="bin-label">${b.label}</span><span class="bin-count">${have[b.id] || 0}/${need[b.id]}</span></button>`).join('')}</div>`;
      $$('[data-b]', el).forEach((btn) => btn.addEventListener('click', () => {
        const it = items.find((x) => x.id === +btn.dataset.b);
        if (it.k === 'sock') { Sound.sfx('error'); draw('Racket: "TWO socks now. They\'re breeding. Don\'t touch them. Let nature take its course."'); return; }
        selId = it.id; Sound.sfx('click'); draw(msg);
      }));
      $$('[data-bin]', el).forEach((btn) => btn.addEventListener('click', () => {
        if (selId == null) { draw('Pick something out of the pile first.'); return; }
        const it = items.find((x) => x.id === selId);
        if (it.k === btn.dataset.bin) {
          it.done = true; selId = null; Sound.sfx(it.k === 'P' ? 'spark' : 'clank');
          if (!items.some((x) => x.k !== 'sock' && !x.done)) { draw('Sorted! Even the springs behaved.'); win(onWin); return; }
          draw(pickOne(['Clink.', 'Boing. (That was a spring.)', 'Satisfying.', 'Racket nods. Twice, even.']));
        } else { Sound.sfx('error'); draw(it.k === 'P' ? 'Racket: "Springs go with springs. They get lonely. And bouncy."' : WRONG[it.k] || 'Wrong bin.'); }
      }));
    };
    draw('Springs, nuts, washers and bolts. Tap one, then its bin.');
  }

  // ---------------------------------------------------------------- rope knots (Vex shows a sequence, you repeat it)
  function knots(onWin) {
    const MOVES = [{ id: 'over', label: 'Over', icon: '⤴' }, { id: 'under', label: 'Under', icon: '⤵' }, { id: 'loop', label: 'Loop', icon: '➰' }, { id: 'pull', label: 'Pull', icon: '⇥' }];
    const LEN = [3, 4, 5];
    let round = 0, seq = [], input = [], showing = false;
    G.ui.modal('Rope Knots', `<div class="knots">
      <div class="knot-vex">${Art2.vexPortrait('smug')}<p id="kn-msg">Watch my claws, kid. Then do it back. Magpies are excellent at knots.</p></div>
      <div class="knot-rope" id="kn-rope"></div>
      <div class="knot-pad">${MOVES.map((m) => `<button class="knot-btn" data-k="${m.id}"><span>${m.icon}</span>${m.label}</button>`).join('')}</div>
      <div class="pips">${LEN.map(() => '<i></i>').join('')}</div></div>`, { cls: 'knot-modal' });
    const msg = (t) => { const el = $('#kn-msg'); if (el) el.textContent = t; };
    const rope = () => { const el = $('#kn-rope'); if (el) el.innerHTML = input.map((k) => `<span>${MOVES.find((m) => m.id === k).icon}</span>`).join('') + '<i></i>'; };
    const flash = (id) => { const b = $(`.knot-btn[data-k="${id}"]`); if (!b) return; b.classList.add('lit'); Sound.sfx('blipV'); setTimeout(() => b && b.classList.remove('lit'), 380); };
    const play = () => {
      showing = true; input = []; rope();
      $$('.knot-btn').forEach((b) => (b.disabled = true));
      msg(round === 0 ? 'Watch my claws, kid. Then do it back.' : pickOne(['Longer one. Keep up.', "Don't blink. I'm fast.", 'This is the one that holds a whole bridge. No pressure.']));
      seq.forEach((k, i) => setTimeout(() => flash(k), 700 + i * 560));
      setTimeout(() => { showing = false; $$('.knot-btn').forEach((b) => (b.disabled = false)); msg('Your turn.'); }, 700 + seq.length * 560);
    };
    const newRound = () => { seq = Array.from({ length: LEN[round] }, () => MOVES[Math.random() * 4 | 0].id); Mini._knotSeq = seq; play(); };
    $$('.knot-btn').forEach((b) => b.addEventListener('click', () => {
      if (showing || round >= LEN.length) return;
      const k = b.dataset.k;
      flash(k);
      input.push(k); rope();
      if (seq[input.length - 1] !== k) {
        Sound.sfx('error');
        showing = true;
        msg(pickOne(['That\'s a granny knot. Again.', 'Nope. The bridge would drop you in the canyon. Watch again.', 'Close! Close is how people fall off bridges. Again.']));
        setTimeout(play, 1200);
        return;
      }
      if (input.length === seq.length) {
        Sound.sfx('clank');
        $$('.pips i')[round].classList.add('on');
        round++;
        if (round >= LEN.length) { msg('Ha! That\'ll hold a truck. Nice work, kid.'); win(onWin, 1000); return; }
        msg(pickOne(['Good. Tight. Next one.', 'Not bad for a cat.']));
        setTimeout(newRound, 1100);
      }
    }));
    newRound();
  }

  // ---------------------------------------------------------------- moss grooming (tap the loose, glowing tufts)
  function moss(onWin) {
    const NEED = 10, N = 12;
    let got = 0, grumbles = 0, alive = true;
    const loose = new Set();
    G.ui.modal('Moss Grooming', `<div class="mossgame">
      <p class="bolt-msg" id="ms-msg">Gently brush off the glowing, loose tufts. Don't poke the sleepy bits.</p>
      <div class="moss-back">${Array.from({ length: N }, (_, i) => `<button class="tuft" data-t="${i}" aria-label="moss tuft"></button>`).join('')}<div class="moss-face">ᵕ ᵕ<span id="ms-z">z z</span></div></div>
      <div class="stir-bar"><i id="ms-bar" style="width:0%"></i></div></div>`, { cls: 'moss-modal' });
    const tick = () => {
      if (!alive || !$('.moss-back')) { alive = false; return; }
      const free = [...Array(N).keys()].filter((i) => !loose.has(i));
      const i = free[Math.random() * free.length | 0];
      if (i != null && loose.size < 3) {
        loose.add(i); const b = $(`.tuft[data-t="${i}"]`); b && b.classList.add('loose');
        setTimeout(() => { loose.delete(i); const bb = $(`.tuft[data-t="${i}"]`); bb && bb.classList.remove('loose'); }, 1500);
      }
      setTimeout(tick, 520);
    };
    $$('.tuft').forEach((b) => b.addEventListener('click', () => {
      if (!alive) return;
      const i = +b.dataset.t;
      if (loose.has(i)) {
        loose.delete(i); b.classList.remove('loose'); b.classList.add('brushed'); setTimeout(() => b.classList.remove('brushed'), 400);
        got++; Sound.sfx('sparkle');
        $('#ms-bar').style.width = got / NEED * 100 + '%';
        $('#ms-msg').textContent = got >= NEED ? 'A soft heap of glowing moss! The mossback sighs happily in its sleep.' : pickOne(['Gentle... got it.', 'The mossback purrs. Mossbacks purr?', 'Fluffy.']);
        if (got >= NEED) { alive = false; win(onWin, 1100); }
      } else {
        grumbles++; Sound.sfx('error');
        $('#ms-msg').textContent = grumbles % 3 === 0 ? 'The mossback rolls over with a huge grumble. You lose a tuft. Gentler!' : pickOne(['Hrrmmm. It grumbles in its sleep.', "That bit's still attached. It twitches.", 'An eye opens. ...And closes. Phew.']);
        if (grumbles % 3 === 0 && got > 0) { got--; $('#ms-bar').style.width = got / NEED * 100 + '%'; }
      }
    }));
    setTimeout(tick, 400);
  }

  // ---------------------------------------------------------------- rivet rhythm
  function rivets(onWin) {
    const TOTAL = 16, NEED = 12, SPB = .55, TRAVEL = 1.8;
    const times = Array.from({ length: TOTAL }, (_, i) => 1.2 + i * SPB + (i % 4 === 3 ? SPB * .5 : 0));
    let hit = 0, miss = 0, done = new Set(), t0 = 0, raf = 0, over = false;
    G.ui.modal('Rivet Rhythm', `<div class="rivetgame">
      <p class="bolt-msg" id="rv-msg">Tap RIVET as each rivet lands on the line. Get ${NEED} of ${TOTAL} to seal the plates.</p>
      <div class="rv-plate"><div class="rv-holes">${Array.from({ length: TOTAL }, (_, i) => `<i data-h="${i}"></i>`).join('')}</div></div>
      <div class="rv-track" id="rv-track"><div class="rv-line"></div></div>
      <div class="brow"><span class="muted" id="rv-score">0 / ${NEED}</span><button class="btn big" id="rv-go">RIVET!</button></div></div>`, { cls: 'rivet-modal' });
    const track = $('#rv-track');
    times.forEach((_, i) => { const d = document.createElement('b'); d.className = 'rv-note'; d.dataset.n = i; track.appendChild(d); });
    const score = () => { $('#rv-score').textContent = `${hit} / ${NEED}`; };
    const finish = () => {
      over = true; cancelAnimationFrame(raf);
      if (hit >= NEED) { $('#rv-msg').textContent = 'BAM BAM BAM. Every plate riveted tight. Racket is nodding along to the rhythm.'; win(onWin, 1100); }
      else {
        $('#rv-msg').textContent = `Only ${hit}. Racket: "Wobbly. Let's do that again. I'll count you in."`;
        setTimeout(() => { if ($('#rv-track')) { G.ui.closeModal(); setTimeout(() => rivets(onWin), 300); } }, 1600);
      }
    };
    const frame = (now) => {
      if (!$('#rv-track')) return;
      if (!t0) t0 = now;
      const t = (now - t0) / 1000;
      $$('.rv-note', track).forEach((d) => {
        const i = +d.dataset.n, dt = times[i] - t;
        const x = 12 + (dt / TRAVEL) * 80;
        d.style.left = x + '%';
        d.style.display = done.has(i) || dt > TRAVEL || dt < -.35 ? 'none' : 'block';
        if (dt < -.25 && !done.has(i)) { done.add(i); miss++; }
      });
      if (t > times[TOTAL - 1] + .6 && !over) { finish(); return; }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const go = () => {
      if (over || !t0) return;
      const t = (performance.now() - t0) / 1000;
      let best = -1, bd = 9;
      times.forEach((tt, i) => { if (!done.has(i) && Math.abs(tt - t) < bd) { bd = Math.abs(tt - t); best = i; } });
      if (best >= 0 && bd < .2) {
        done.add(best); hit++; Sound.sfx('clank');
        const h = $(`.rv-holes i[data-h="${hit - 1}"]`); h && h.classList.add('on');
        score();
      } else { Sound.sfx('click'); }
    };
    $('#rv-go').addEventListener('click', go);
    $('.rv-plate').addEventListener('click', go);
  }

  // ---------------------------------------------------------------- Bolt Bin IV: the conveyor
  function conveyor(onWin) {
    const kinds = shuffle(['S', 'S', 'L', 'L', 'N', 'N', 'W', 'W', 'P', 'P', 'S', 'N']);
    const bins = [{ id: 'S', label: 'Small' }, { id: 'L', label: 'Large' }, { id: 'N', label: 'Nuts' }, { id: 'W', label: 'Washers' }, { id: 'P', label: 'Springs' }];
    const spring = `<svg viewBox="-30 -30 60 90" aria-hidden="true"><path d="M-12,-14 L12,-8 L-12,-2 L12,4 L-12,10 L12,16 L-12,22 L12,28 L-12,34 L12,40" stroke="#c9d0d6" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
    const art = (k) => (k === 'sock' ? Art.sock : k === 'N' ? Art2.nut : k === 'W' ? Art2.washer : k === 'P' ? spring : Art.bolt(k));
    const queue = [...kinds]; queue.splice(4, 0, 'sock'); queue.splice(9, 0, 'sock');
    const belt = []; let sel = null, sorted = 0, raf = 0, last = performance.now(), spawnT = 0, alive = true, id = 0;
    G.ui.modal('Bolt Bin IV: The Conveyor', `<div class="convgame">
      <p class="bolt-msg" id="cv-msg">Racket built a conveyor belt. Of course he did. Grab things off the belt and drop them in the right bin before they fall off the end.</p>
      <div class="belt" id="cv-belt"><div class="belt-stripes"></div></div>
      <div class="bins b5">${bins.map((b) => `<button class="bin" data-bin="${b.id}"><span class="bin-label">${b.label}</span></button>`).join('')}</div>
      <div class="brow"><span class="muted" id="cv-count">Sorted 0 / ${kinds.length}</span></div></div>`, { cls: 'bolt-modal' });
    const beltEl = $('#cv-belt');
    const add = (k) => {
      const el = document.createElement('button');
      el.className = 'cv-item'; el.innerHTML = art(k); el.setAttribute('aria-label', k);
      const it = { id: id++, k, x: -8, el };
      el.addEventListener('click', () => {
        if (k === 'sock') { Sound.sfx('error'); $('#cv-msg').textContent = 'Racket: "Let the socks ride. They\'re on a journey."'; return; }
        sel = it; $$('.cv-item', beltEl).forEach((e) => e.classList.remove('sel')); el.classList.add('sel'); Sound.sfx('click');
      });
      beltEl.appendChild(el); belt.push(it);
    };
    $$('[data-bin]').forEach((b) => b.addEventListener('click', () => {
      if (!sel || !alive) { $('#cv-msg').textContent = 'Grab something off the belt first.'; return; }
      if (sel.k === b.dataset.bin) {
        Sound.sfx(sel.k === 'P' ? 'spark' : 'clank'); sorted++;
        sel.el.remove(); belt.splice(belt.indexOf(sel), 1); sel = null;
        $('#cv-count').textContent = `Sorted ${sorted} / ${kinds.length}`;
        if (sorted >= kinds.length) { alive = false; cancelAnimationFrame(raf); $('#cv-msg').textContent = 'Belt clear! Racket: "Efficient. Terrifyingly efficient."'; win(onWin, 1000); }
      } else { Sound.sfx('error'); $('#cv-msg').textContent = WRONG[sel.k] || 'Wrong bin.'; }
    }));
    const frame = (now) => {
      if (!alive || !$('#cv-belt')) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      spawnT -= dt;
      if (spawnT <= 0 && queue.length && belt.length < 5) { add(queue.shift()); spawnT = 1.6; }
      belt.slice().forEach((it) => {
        it.x += dt * 15;
        it.el.style.left = it.x + '%';
        if (it.x > 100) {
          it.el.remove(); belt.splice(belt.indexOf(it), 1);
          if (it === sel) sel = null;
          if (it.k !== 'sock') { queue.push(it.k); $('#cv-msg').textContent = pickOne(['Plink. It fell off the end. It\'ll come round again.', 'Racket: "It\'s fine. The belt loops. Like my life."']); }
          else queue.push('sock');
        }
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- core balance: keep three bars in the band
  function coreBalance(onWin) {
    const BARS = [{ id: 'heat', name: 'Heat', c: '#ff8a5a' }, { id: 'flux', name: 'Flux', c: '#9fd8ff' }, { id: 'press', name: 'Pressure', c: '#9fffd0' }];
    const vals = [50, 50, 50], drift = [0, 0, 0], BAND = [38, 62];
    let prog = 0, raf = 0, last = performance.now(), alive = true, t = 0;
    G.ui.modal('Core Balance', `<div class="coregame">
      <p class="bolt-msg" id="cb-msg">The core is spinning up. Keep all three bars inside the green band while the spin gauge fills.</p>
      <div class="cb-bars">${BARS.map((b, i) => `<div class="cb-col"><div class="cb-bar"><i class="band"></i><b style="background:${b.c}"></b></div><span>${b.name}</span>
        <div class="cb-btns"><button class="btn" data-i="${i}" data-d="1" aria-label="raise ${b.name}">▲</button><button class="btn" data-i="${i}" data-d="-1" aria-label="lower ${b.name}">▼</button></div></div>`).join('')}</div>
      <div class="cb-spin"><span>Spin</span><div class="stir-bar"><i id="cb-prog" style="width:0%"></i></div></div></div>`, { cls: 'core-modal' });
    $$('[data-i]').forEach((btn) => btn.addEventListener('click', () => {
      const i = +btn.dataset.i;
      vals[i] = Math.max(0, Math.min(100, vals[i] + 9 * +btn.dataset.d));
      Sound.sfx('click');
    }));
    const frame = (now) => {
      if (!alive || !$('.cb-bars')) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
      const speed = 1 + Math.min(1.4, prog / 60);
      for (let i = 0; i < 3; i++) {
        drift[i] += (Math.random() - .5) * 40 * dt;
        drift[i] = Math.max(-14, Math.min(14, drift[i]));
        vals[i] = Math.max(0, Math.min(100, vals[i] + drift[i] * dt * 2.2 * speed + Math.sin(t * (1.1 + i * .4)) * dt * 6));
      }
      const ok = vals.every((v) => v >= BAND[0] && v <= BAND[1]);
      prog = Math.max(0, Math.min(100, prog + (ok ? 9 : -6) * dt));
      $$('.cb-bar b').forEach((b, i) => { b.style.bottom = vals[i] + '%'; b.parentElement.classList.toggle('out', vals[i] < BAND[0] || vals[i] > BAND[1]); });
      $('#cb-prog').style.width = prog + '%';
      if (prog >= 100) { alive = false; $('#cb-msg').textContent = 'The core settles into a smooth, steady hum. No KA-THUNK. Racket lets out a breath he has been holding for twenty years.'; win(onWin, 1400); return; }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- form in triplicate (STEWARD-9's paperwork)
  function forms(onWin) {
    const FIELDS = [
      { id: 'name', label: 'Name', opts: ['Crystal Lynx', 'CRYSTAL LYNX', 'C. Lynx'] },
      { id: 'ship', label: 'Vessel', opts: ['The Dandelion', 'DANDELION (scout)', 'Dandelion'] },
      { id: 'date', label: 'Date', opts: ['3rd moonrise', 'Tuesday?', '40 years late'] },
      { id: 'init', label: 'Initials', opts: ['CL in box A', 'CL in box B', 'RKT in box A'] },
    ];
    const COPIES = [
      { id: 'white', name: 'White copy', want: ['Crystal Lynx', 'The Dandelion', '3rd moonrise', 'CL in box A'], rules: 'Full name as spoken. Vessel with its article. Today\'s date. Initial box A.' },
      { id: 'yellow', name: 'Yellow copy', want: ['CRYSTAL LYNX', 'DANDELION (scout)', '3rd moonrise', 'CL in box B'], rules: 'Yellow copies are SHOUTED: name in capitals, vessel with its class. Today\'s date. Yellow copies are initialled in box B, naturally.' },
      { id: 'pink', name: 'Pink copy', want: ['C. Lynx', 'Dandelion', '40 years late', 'RKT in box A'], rules: 'The pink copy is abbreviated: initial and surname, bare vessel name. Backdated to the Gilded Gull\'s departure. Requires the MECHANIC\'s initials.' },
    ];
    const COMPLAINT = {
      name: ['I am afraid that is not how one writes a name on a {c}, madam.', 'The name field is... creative. Regrettably, creativity is not permitted.'],
      ship: ['The vessel name is incorrectly formatted for a {c}.', 'Is that a ship or a mood? Please consult the rules on the {c}.'],
      date: ['That date is not valid on a {c}. Time is very important to me. I have had a lot of it.', 'Ah. The {c} is particular about dates.'],
      init: ['You have initialled the wrong initial.', 'Those initials are in the wrong box. Or are the wrong initials. Possibly both. It is very upsetting.'],
    };
    const state = COPIES.map(() => FIELDS.map(() => 0));
    let tab = 0, tries = 0;
    G.ui.modal('Form 27-B/6, in Triplicate', '<div class="formgame"></div>', { cls: 'form-modal' });
    const draw = (msg) => {
      const el = $('#modal .formgame');
      if (!el) return;
      const c = COPIES[tab];
      el.innerHTML = `<div class="knot-vex steward-say">${Art4.stewardPortrait(msg && msg.bad ? 'alarm' : 'polite')}<p>${esc(msg ? msg.t : 'Request for Release of Ship\'s Property. In triplicate, please. Each copy has its own small rules. Tap a field to change it.')}</p></div>
        <div class="form-tabs">${COPIES.map((cc, i) => `<button class="form-tab ${cc.id} ${i === tab ? 'on' : ''}" data-tab="${i}">${cc.name}</button>`).join('')}</div>
        <div class="form-sheet ${c.id}">
          <div class="form-head">GILDED GULL LINES · FORM 27-B/6 · ${c.name.toUpperCase()}</div>
          <p class="form-rules">${esc(c.rules)}</p>
          ${FIELDS.map((f, i) => `<button class="form-field" data-f="${i}"><span>${f.label}</span><b>${esc(f.opts[state[tab][i]])}</b><i>tap to change</i></button>`).join('')}
        </div>
        <div class="brow"><span class="muted">Submissions: ${tries}</span><button class="btn big" id="form-submit">Submit all three copies</button></div>`;
      $$('[data-tab]', el).forEach((b) => b.addEventListener('click', () => { tab = +b.dataset.tab; Sound.sfx('click'); draw(msg); }));
      $$('[data-f]', el).forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.f; state[tab][i] = (state[tab][i] + 1) % 3; Sound.sfx('click'); draw(msg); }));
      $('#form-submit', el).addEventListener('click', () => {
        tries++;
        for (let ci = 0; ci < COPIES.length; ci++) {
          for (let fi = 0; fi < FIELDS.length; fi++) {
            if (FIELDS[fi].opts[state[ci][fi]] !== COPIES[ci].want[fi]) {
              Sound.sfx('error'); tab = ci;
              draw({ bad: true, t: pickOne(COMPLAINT[FIELDS[fi].id]).replace('{c}', COPIES[ci].name.toLowerCase()) });
              return;
            }
          }
        }
        Sound.sfx('success');
        draw({ t: 'Stamped, stamped and stamped. This is the most beautiful paperwork I have seen in forty years. One flux coil, released.' });
        win(onWin, 1400);
      });
    };
    draw();
  }

  // ---------------------------------------------------------------- launch checklist: call and response
  function checklist(onWin) {
    const SW = [
      { id: 'fuel', label: 'Fuel pump', icon: '⛽' }, { id: 'core', label: 'Core feed', icon: '◎' }, { id: 'thr', label: 'Thrusters', icon: '⇶' },
      { id: 'nav', label: 'Nav', icon: '✦' }, { id: 'hull', label: 'Hull seal', icon: '▣' }, { id: 'radio', label: 'Radio', icon: '📻' },
      { id: 'lights', label: 'Lights', icon: '☀' }, { id: 'rail', label: 'Rail clamps', icon: '⫶' }, { id: 'snack', label: 'Snack drawer', icon: '🍜' },
    ];
    const CALLS = [['fuel', 'Fuel pump!'], ['core', 'Core feed!'], ['hull', 'Hull seal!'], ['nav', 'Nav... nav online!'], ['thr', 'Thrusters to standby!'], ['radio', "Radio! Somebody tell Vex we're doing this!"], ['snack', '...Snack drawer. Don\'t look at me like that. It\'s on the list.'], ['rail', 'Rail clamps! Release!']];
    let step = 0, timer = 0, raf = 0, t0 = 0, alive = true;
    const LIMIT = 5;
    G.ui.modal('Launch Checklist', `<div class="checkgame">
      <div class="knot-vex racket-say">${Art.portrait('r', 'soft')}<p id="lc-call">Okay. Okay. I call it, you flip it. My hands are... it's fine. You flip it.</p></div>
      <div class="stir-bar"><i id="lc-time" style="width:100%"></i></div>
      <div class="lc-pad">${SW.map((s) => `<button class="lc-sw" data-s="${s.id}"><span>${s.icon}</span>${s.label}<i></i></button>`).join('')}</div>
      <div class="pips">${CALLS.map(() => '<i></i>').join('')}</div></div>`, { cls: 'check-modal' });
    const call = () => {
      if (!$('#lc-call')) return;
      $('#lc-call').textContent = `Racket: "${CALLS[step][1]}"`;
      Sound.sfx('blipR'); t0 = performance.now();
    };
    const frame = (now) => {
      if (!alive || !$('#lc-time')) return;
      const left = Math.max(0, 1 - (now - t0) / 1000 / LIMIT);
      $('#lc-time').style.width = left * 100 + '%';
      if (left <= 0) { $('#lc-call').textContent = `Racket: "...${CALLS[step][1]}" (He says it again, quieter. His paw is shaking.)`; t0 = performance.now(); }
      raf = requestAnimationFrame(frame);
    };
    $$('.lc-sw').forEach((b) => b.addEventListener('click', () => {
      if (!alive) return;
      if (b.dataset.s === CALLS[step][0]) {
        Sound.sfx('clank'); b.classList.add('on');
        $$('.pips i')[step].classList.add('on');
        step++;
        if (step >= CALLS.length) {
          alive = false; cancelAnimationFrame(raf);
          $('#lc-call').textContent = 'Racket: "...Check. All check." He looks at you. "Ignition, lynx. Together."';
          win(onWin, 1600); return;
        }
        $('#lc-call').textContent = pickOne(['Racket: "Check."', 'Crystal: "Check!"', 'Racket: "...Check. Good."']);
        setTimeout(call, 700);
      } else { Sound.sfx('error'); $('#lc-call').textContent = pickOne(['Racket: "Not that one! ...Sorry. Not that one."', 'Racket: "That\'s the lights. We need the lights eventually. Not now."', 'Racket: "Breathe. I\'m saying that to me. You breathe too."']); }
    }));
    setTimeout(() => { call(); raf = requestAnimationFrame(frame); }, 1600);
  }

  return { coreBalance, forms, checklist, bolts: (r, cb) => (r === 4 ? conveyor(cb) : boltsAll(r, cb)), tune, wires, breakers, gasket, fireflies, starmap, roots, knots, moss, rivets };
})();
