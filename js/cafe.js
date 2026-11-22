/* Racket's Garage — cafe.js
 * The Garage Café: a coffee cart in the corner of the garage and a step-by-step drink-making game.
 * Mug → base (espresso / coffee / cocoa) → steam milk → creamers & syrups → topping → latte art → serve.
 * Racket reacts to every drink in character (warmer with friendship). Vex drops by sometimes.
 */
const Cafe = (() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pick = (a) => a[Math.random() * a.length | 0];

  // ------------------------------------------------------------------ recipes
  const ADDS = {
    fv: { name: 'French vanilla creamer', color: '#f3e3b8' },
    og: { name: 'Coffee creamer', color: '#efe6d6' },
    hz: { name: 'Hazelnut creamer', color: '#d9b48a' },
    vanilla: { name: 'Vanilla syrup', color: '#f6ecc8' },
    caramel: { name: 'Caramel syrup', color: '#c9802a' },
    hazelnut: { name: 'Hazelnut syrup', color: '#a8703a' },
    ember: { name: 'Ember-bark spice syrup', color: '#e0702a' },
  };
  const TOPS = { none: 'Nothing', whip: 'Whipped cream', mallow: 'Marshmallows', cinnamon: 'Cinnamon dusting', sprinkles: 'Sprinkles' };
  const MUGS = [
    { id: 'okayest', name: "WORLD'S OKAYEST", body: '#e9e2cf', band: '#2f6f60' },
    { id: 'speckle', name: 'Teal speckled', body: '#4fa898', band: '#2a6a5e' },
    { id: 'chipped', name: 'Chipped orange', body: '#d86a2a', band: '#a8481c' },
    { id: 'raccoon', name: 'Raccoon mug', body: '#8d929b', band: '#23252a' },
  ];
  const R = (id, group, name, base, milk, adds, top, blurb, art = false) => ({ id, group, name, base, milk, adds, top, blurb, art });
  const RECIPES = [
    R('monster', 'Racket\'s "not" favourite', 'The French Vanilla Monstrosity', 'coffee', 'none', ['fv', 'og', 'hz'], 'none', 'Brewed coffee, no milk. French vanilla, coffee AND hazelnut creamer. All three. One cup. Racket says it\'s gross.'),
    R('cocoa', 'Hot chocolate', 'Classic Hot Chocolate', 'cocoa', 'normal', [], 'none', 'Melted cocoa, steamed milk. Simple. Perfect.'),
    R('cocoa_whip', 'Hot chocolate', 'Hot Chocolate with Whipped Cream', 'cocoa', 'normal', [], 'whip', 'Cocoa, steamed milk, a cloud of whipped cream.'),
    R('cocoa_mallow', 'Hot chocolate', 'Hot Chocolate with Marshmallows', 'cocoa', 'normal', [], 'mallow', 'Cocoa, steamed milk, little marshmallows. The small ones.'),
    R('latte_vanilla', 'Lattes', 'Vanilla Latte', 'espresso', 'normal', ['vanilla'], 'none', 'Espresso, steamed milk, vanilla syrup.', true),
    R('latte_caramel', 'Lattes', 'Caramel Latte', 'espresso', 'normal', ['caramel'], 'none', 'Espresso, steamed milk, caramel syrup.', true),
    R('latte_hazelnut', 'Lattes', 'Hazelnut Latte', 'espresso', 'normal', ['hazelnut'], 'none', 'Espresso, steamed milk, hazelnut syrup.', true),
    R('latte_ember', 'Lattes', 'Ember-Bark Spice Latte (seasonal)', 'espresso', 'normal', ['ember'], 'cinnamon', 'Espresso, steamed milk, ember-bark spice syrup, cinnamon on top. Tastes like the woods in autumn.', true),
    R('capp_dry', 'Cappuccinos', 'Dry Cappuccino', 'espresso', 'dry', [], 'none', 'Espresso and lots of airy foam. Steam the milk a little longer.', true),
    R('capp_wet', 'Cappuccinos', 'Wet Cappuccino', 'espresso', 'wet', [], 'none', 'Espresso and silky, creamy milk. Steam it a little shorter.', true),
    R('capp_cinn', 'Cappuccinos', 'Cinnamon Cappuccino', 'espresso', 'normal', [], 'cinnamon', 'Espresso, foamy milk, cinnamon dusting.', true),
  ];
  const MILK_ZONES = { normal: [55, 75], wet: [40, 58], dry: [72, 90] };
  const SHOT_ZONE = [45, 70];

  // ------------------------------------------------------------------ Racket's reactions (tier groups: 0 = gruff, 1 = warming, 2 = fond)
  const RX = {
    monster: [
      ["Three creamers? That's not coffee. That's a dessert with a drinking problem.", '*He drinks the entire thing.*', "...It's fine. I'll finish it so it doesn't go to waste."],
      ['Ugh. Gross. Disgusting. Who taught you this?', '*He drains the mug in one go.*', '...Is there more? For science.'],
      ['The Monstrosity. You know about the Monstrosity.', '*He drinks it without stopping to breathe.*', "...Don't tell Vex. She'll never let me live it down."],
    ],
    cocoa: [["Hot chocolate. What am I, six?", "...It's good. Shut up."], ['Cocoa. Classic. My mom used to make this when the generator died.'], ['...This tastes like when the power went out and Mom made cocoa on the camp stove.', 'Thanks, lynx.']],
    cocoa_whip: [['Whipped cream. You think I\'m soft.'], ["Got whipped cream on my nose, didn't I. Don't— don't laugh."], ["Cream mustache. I know. I'm keeping it. It's a look."]],
    cocoa_mallow: [['Marshmallows. They float around like they own the place.'], ["I'm eating the marshmallows first. That's the correct way. Fight me."], ['You used the little ones. Not the big ones.', '...You know me too well, lynx.']],
    latte_vanilla: [['Vanilla. Basic.', '...Smooth, though.'], ['Vanilla latte. Respectable. Like a good wrench.'], ['Vanilla. Simple, done right. That\'s my whole philosophy, lynx.']],
    latte_caramel: [['Caramel. Sticky. Like my workbench.'], ["Caramel latte. Okay. That's good. That's actually good."], ["You put a little extra caramel in, didn't you. I can tell.", '...Keep doing that.']],
    latte_hazelnut: [['Hazelnut. Tastes like a fancy squirrel.'], ['Hazelnut. Nutty. Like me, according to Vex.'], ['Hazelnut. ...This is dangerously close to the Monstrosity. I approve.']],
    latte_ember: [['Ember spice? Tastes like the woods are on fire. In a nice way?'], ["Ember-bark spice. It's that time of year, huh. Leaves going teal."], ['Ember spice season.', '...First one I\'ve had with company in a long time.']],
    capp_dry: [["This is all foam. I'm drinking a cloud."], ['Dry cappuccino. Fluffy. Very fluffy. Is my mustache foamy? Don\'t answer.'], ['Light as air. Like the Dandelion\'s gonna be, once she flies.']],
    capp_wet: [['Wet cappuccino. Basically a latte with ambition.'], ['Creamy. Okay. Okay, this is good.'], ['Silky. You\'ve got good hands, lynx. Ships AND coffee.']],
    capp_cinn: [['Cinnamon. Smells like Vex\'s shack. Ugh.', '...Still drinking it.'], ['Cinnamon on top. Fancy. You\'re getting fancy.'], ['Cinnamon dusting. Somebody\'s showing off.', '...Show off more. I like it.']],
  };
  const BAD = {
    scald: ['Scalded milk. I can taste the regret.', '...I\'ll drink it. I\'m not a quitter. But I\'m judging.'],
    sour: ['That shot\'s sour. Pulled it too short. Like my patience.'],
    bitter: ['Bitter. Over-pulled. Like my personality, apparently.'],
    wrong: ['This is... a choice. Thank you for your choice.', 'Did you mean to make this? Be honest.', "I don't know what this is. I don't hate it. I don't understand it."],
  };
  const ART_LINES = {
    heart: ['Is that a heart? ...It\'s a blob. A heart-shaped blob. Whatever.', 'A heart. ...Okay. I\'m not drinking that part.'],
    leaf: ['A leaf. Very artsy. Very woods.', 'A leaf. Like the ember-bark ones. Pretty.'],
    wrench: ['IS THAT A WRENCH?', 'IS THAT A WRENCH?! ...That is the best thing anybody has ever put in my coffee.'],
  };
  const MUG_LINES = { okayest: 'My mug! ...Good choice.', raccoon: 'The raccoon mug. Coincidence? I think not.', chipped: 'The chipped one. Watch your lip.' };

  // ------------------------------------------------------------------ the cart in the garage scene
  function cartArt(S) {
    const on = !!S.flags.phase1;
    return `<g class="cafe-cart">
      <rect x="356" y="370" width="122" height="10" rx="2" fill="#5a3f2e"/>
      ${['#f3e3b8', '#efe6d6', '#d9b48a', '#c9802a', '#e0702a'].map((c, i) => `<rect x="${362 + i * 23}" y="${348 - (i % 2) * 6}" width="14" height="${22 + (i % 2) * 6}" rx="3" fill="${c}" stroke="#3a2a20" stroke-width="1.5"/><rect x="${364 + i * 23}" y="${344 - (i % 2) * 6}" width="10" height="5" fill="#3a2a20"/>`).join('')}
      ${[0, 1, 2, 3].map((i) => `<path d="M${368 + i * 28},382 L${368 + i * 28},390" stroke="#3a2a20" stroke-width="2"/><rect x="${360 + i * 28}" y="390" width="16" height="16" rx="3" fill="${MUGS[i].body}"/>`).join('')}
      <rect x="352" y="470" width="130" height="14" rx="3" fill="#7a5539"/><rect x="358" y="484" width="118" height="70" fill="#4f3626"/>
      <path d="M368,500 L466,500 M368,526 L466,526" stroke="#3a281c" stroke-width="3"/>
      <rect x="364" y="414" width="64" height="56" rx="8" fill="#b8bfc6" stroke="#5d666d" stroke-width="3"/>
      <rect x="370" y="420" width="52" height="14" rx="3" fill="#2f6f60"/>
      <circle cx="${on ? 382 : 382}" cy="427" r="3" fill="${on ? '#7affe4' : '#5a5048'}"/>
      <rect x="384" y="440" width="24" height="10" rx="2" fill="#5d666d"/><rect x="390" y="450" width="12" height="6" fill="#3a3f44"/>
      <rect x="388" y="458" width="16" height="12" rx="2" fill="#e9e2cf"/>
      <path d="M436,470 L436,446 Q436,436 448,436 L462,436 Q474,436 474,446 L474,470Z" fill="#c4643a" stroke="#7a3812" stroke-width="2"/>
      <path d="M474,446 Q486,444 484,456" stroke="#7a3812" stroke-width="3" fill="none"/><rect x="448" y="430" width="14" height="7" rx="2" fill="#7a3812"/>
      ${on ? '<path d="M392,410 Q388,398 394,388 M402,410 Q406,396 400,386" stroke="#fff" stroke-width="1.5" fill="none" opacity=".4" class="steam"/>' : '<rect x="368" y="444" width="56" height="16" rx="2" fill="#f2ead8" transform="rotate(-8 396 452)"/><text x="396" y="456" font-size="9" text-anchor="middle" fill="#8a3a2a" font-family="Nunito, sans-serif" font-weight="800" transform="rotate(-8 396 452)">BROKEN</text>'}
      <rect x="380" y="536" width="74" height="14" rx="2" fill="#f2ead8" opacity=".9"/><text x="417" y="547" font-size="9" text-anchor="middle" fill="#3a2a20" font-family="Fredoka, sans-serif" font-weight="600">GARAGE CAFÉ</text>
    </g>`;
  }

  // ------------------------------------------------------------------ cup preview
  function cup(st) {
    const mug = MUGS.find((m) => m.id === st.mug) || MUGS[0];
    const base = { espresso: '#4a2a18', coffee: '#5a3620', cocoa: '#6a3a24' }[st.base?.type];
    let fill = base || 'none';
    if (base && st.milk && st.milk.type !== 'none') fill = st.base.type === 'cocoa' ? '#8a5638' : '#b88a62';
    if (base && st.adds?.length && (!st.milk || st.milk.type === 'none')) fill = '#a8784e';
    const foam = st.milk && st.milk.type !== 'none' ? (st.milk.val > 70 ? 16 : st.milk.val > 50 ? 10 : 6) : 0;
    const top = st.top;
    return `<svg viewBox="0 0 200 200" class="cafe-cup" aria-hidden="true">
      <ellipse cx="100" cy="180" rx="70" ry="10" fill="#000" opacity=".3"/>
      <path d="M150,80 Q186,84 184,112 Q182,140 146,138" stroke="${mug.body}" stroke-width="14" fill="none"/>
      <path d="M40,60 L48,172 Q100,186 152,172 L160,60Z" fill="${mug.body}" stroke="#2a2420" stroke-width="3"/>
      <rect x="44" y="120" width="112" height="14" fill="${mug.band}" opacity=".8"/>
      ${mug.id === 'okayest' ? '<text x="100" y="152" font-size="10" text-anchor="middle" fill="#2a2420" font-family="Fredoka, sans-serif" font-weight="600">OKAYEST</text>' : ''}
      ${mug.id === 'raccoon' ? '<path d="M84,150 Q100,140 116,150 L112,156 Q100,150 88,156Z" fill="#23252a"/><circle cx="93" cy="151" r="2" fill="#86d65e"/><circle cx="107" cy="151" r="2" fill="#86d65e"/>' : ''}
      ${mug.id === 'speckle' ? [60, 80, 120, 140, 70, 130].map((x, i) => `<circle cx="${x}" cy="${90 + (i % 3) * 22}" r="2.5" fill="#e9fff8" opacity=".7"/>`).join('') : ''}
      ${mug.id === 'chipped' ? '<path d="M120,60 L126,68 L132,60Z" fill="#2a2420"/>' : ''}
      <ellipse cx="100" cy="62" rx="60" ry="12" fill="#2a2420"/>
      ${base ? `<ellipse cx="100" cy="64" rx="56" ry="10" fill="${fill}"/>` : ''}
      ${foam ? `<ellipse cx="100" cy="${62 - foam / 4}" rx="54" ry="${8 + foam / 3}" fill="${st.milk.scald ? '#e8d0b8' : '#f4ead8'}"/>` : ''}
      ${(st.adds || []).map((a, i) => `<path d="M${70 + i * 18},62 q8,-6 16,0" stroke="${ADDS[a].color}" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')}
      ${st.art ? artShape(st.art, 100, 58, .5, '#8a5a34') : ''}
      ${top === 'whip' ? '<path d="M56,58 Q60,30 80,38 Q88,18 108,30 Q128,20 134,40 Q150,40 144,58Z" fill="#fffaf2" stroke="#e8dcc8" stroke-width="2"/>' : ''}
      ${top === 'mallow' ? [64, 82, 100, 118, 134, 90, 112].map((x, i) => `<rect x="${x - 7}" y="${48 + (i > 4 ? -8 : (i % 2) * 4)}" width="14" height="12" rx="3" fill="#fffaf2" stroke="#e8dcc8"/>`).join('') : ''}
      ${top === 'cinnamon' ? [70, 84, 96, 108, 122, 132, 90, 114].map((x, i) => `<circle cx="${x}" cy="${56 + (i % 3) * 4}" r="2" fill="#8a4a20"/>`).join('') : ''}
      ${top === 'sprinkles' ? [68, 80, 92, 104, 116, 128, 74, 98, 122, 86, 110].map((x, i) => `<rect x="${x}" y="${52 + (i % 3) * 5}" width="7" height="2.5" rx="1" fill="${['#ff6aa8', '#7affe4', '#ffe46a', '#9a8aff', '#ff9a3c'][i % 5]}" transform="rotate(${i * 37} ${x} ${54 + (i % 3) * 5})"/>`).join('') : ''}
      ${base ? '<path d="M86,40 Q80,26 88,14 M106,40 Q112,24 104,10" stroke="#fff" stroke-width="2" fill="none" opacity=".35" class="steam"/>' : ''}
    </svg>`;
  }
  const ART_PTS = {
    heart: [[0, 14], [-12, 2], [-14, -8], [-8, -14], [0, -8], [8, -14], [14, -8], [12, 2]],
    leaf: [[0, 16], [-8, 8], [-12, -2], [-6, -12], [0, -16], [6, -12], [12, -2], [8, 8]],
    wrench: [[-12, 14], [-4, 6], [4, -2], [8, -10], [4, -16], [14, -14], [14, -4], [10, -6]],
  };
  function artShape(id, cx, cy, s, col) {
    const p = ART_PTS[id];
    return `<path d="M${p.map(([x, y]) => `${cx + x * s * 3},${cy + y * s * 1.1}`).join(' L')}${id === 'wrench' ? '' : ' Z'}" fill="${id === 'wrench' ? 'none' : col}" stroke="${col}" stroke-width="3" stroke-linejoin="round" opacity=".85"/>`;
  }

  // ------------------------------------------------------------------ flow
  let st = null, vexHere = false;
  const STEPS = ['Mug', 'Base', 'Milk', 'Add-ins', 'Topping', 'Latte art', 'Serve'];

  function open() {
    const S = G.S;
    if (!S.cafe) S.cafe = { made: {}, monster: 0, vex: 0 };
    vexHere = !!S.flags.vexMet && (!S.cafe.vexSeen || Math.random() < .35);
    if (vexHere) S.cafe.vexSeen = true;
    menu();
  }

  function frame(title, inner, opts = {}) {
    const stepIdx = st ? STEPS.indexOf(opts.step) : -1;
    G.ui.modal('Garage Café', `<div class="cafe">
      ${st ? `<div class="cafe-steps">${STEPS.map((s, i) => `<span class="${i < stepIdx ? 'done' : i === stepIdx ? 'on' : ''}">${s}</span>`).join('')}</div>` : ''}
      <div class="cafe-main">
        ${st ? `<div class="cafe-side">${cup(st)}<div class="cafe-recipe"><b>${esc(st.r.name)}</b><span>${esc(st.r.blurb)}</span></div></div>` : ''}
        <div class="cafe-panel"><h3>${esc(title)}</h3>${inner}</div>
      </div></div>`, { cls: 'cafe-modal' });
  }

  function menu() {
    st = null;
    const groups = [...new Set(RECIPES.map((r) => r.group))];
    const vexNote = vexHere ? `<div class="cafe-vex">${Art2.vexPortrait('smug')}<div><b>Vex dropped by!</b><span>"Make me something with sprinkles, kid. The shiny ones. I'm not picky. I'm extremely picky."</span></div></div>` : '';
    frame('What are we making?', `${vexNote}
      ${groups.map((g) => `<div class="cafe-group"><div class="cafe-gname">${esc(g)}</div><div class="cafe-drinks">${RECIPES.filter((r) => r.group === g).map((r) => `<button class="cafe-drink" data-r="${r.id}"><b>${esc(r.name)}</b><span>${esc(r.blurb)}</span>${G.S.cafe.made[r.id] ? `<i>made ${G.S.cafe.made[r.id]}×</i>` : ''}</button>`).join('')}</div></div>`).join('')}`);
    $$('[data-r]', $('#modal')).forEach((b) => b.addEventListener('click', () => {
      Sound.sfx('click');
      st = { r: RECIPES.find((r) => r.id === b.dataset.r), adds: [], issues: [] };
      stepMug();
    }));
  }

  function stepMug() {
    frame('Pick a mug', `<div class="cafe-opts">${MUGS.map((m) => `<button class="cafe-opt mug" data-m="${m.id}"><i style="background:${m.body};border-color:${m.band}"></i>${esc(m.name)}</button>`).join('')}</div>`, { step: 'Mug' });
    $$('[data-m]', $('#modal')).forEach((b) => b.addEventListener('click', () => { Sound.sfx('clank'); st.mug = b.dataset.m; stepBase(); }));
  }

  function stepBase() {
    frame('Make the base', `<p class="cafe-hint">Espresso for lattes and cappuccinos, brewed coffee for drip drinks, cocoa for hot chocolate.</p>
      <div class="cafe-opts"><button class="cafe-opt" data-b="espresso">☕ Pull an espresso shot</button><button class="cafe-opt" data-b="coffee">🫖 Brew coffee</button><button class="cafe-opt" data-b="cocoa">🍫 Melt cocoa</button></div>`, { step: 'Base' });
    $$('[data-b]', $('#modal')).forEach((b) => b.addEventListener('click', () => {
      const t = b.dataset.b;
      Sound.sfx('click');
      if (t !== st.r.base) st.issues.push('wrong');
      if (t === 'espresso') return timing('Pull the shot', 'Stop when the stream turns golden.', 2400, [SHOT_ZONE], (v) => {
        st.base = { type: 'espresso', val: v };
        if (v < SHOT_ZONE[0]) st.issues.push('sour'); else if (v > SHOT_ZONE[1]) st.issues.push('bitter');
        stepMilk();
      }, 'Base', 'Pull!');
      if (t === 'coffee') { st.base = { type: 'coffee' }; Sound.sfx('drone'); return busyStep('Brewing...', 'Drip... drip... drip. The garage smells amazing.', stepMilk, 'Base'); }
      stir();
    }));
  }

  function stir() {
    let n = 0;
    const draw = () => {
      frame('Melt the cocoa', `<p class="cafe-hint">Stir until it's smooth. (${n}/6)</p><div class="stir-bar"><i style="width:${n / 6 * 100}%"></i></div><button class="btn big" id="cafe-stir">Stir!</button>`, { step: 'Base' });
      $('#cafe-stir').addEventListener('click', () => { n++; Sound.sfx('click'); if (n >= 6) { st.base = { type: 'cocoa' }; Sound.sfx('sparkle'); stepMilk(); } else draw(); });
    };
    draw();
  }

  function stepMilk() {
    const want = st.r.milk;
    const zone = MILK_ZONES[want === 'none' ? 'normal' : want];
    frame('Steam the milk?', `<p class="cafe-hint">Lattes, cappuccinos and cocoa want steamed milk. ${want === 'dry' ? 'A dry cappuccino wants it extra foamy: steam a bit longer.' : want === 'wet' ? 'A wet cappuccino wants it silky: stop a bit earlier.' : want === 'none' ? 'This one doesn\'t need milk at all.' : 'Stop in the green. Too long and it scalds.'}</p>
      <div class="cafe-opts"><button class="cafe-opt" data-k="steam">♨ Steam milk</button><button class="cafe-opt" data-k="skip">Skip milk</button></div>`, { step: 'Milk' });
    $$('[data-k]', $('#modal')).forEach((b) => b.addEventListener('click', () => {
      Sound.sfx('click');
      if (b.dataset.k === 'skip') {
        if (want !== 'none') st.issues.push('wrong');
        st.milk = { type: 'none' };
        return stepAdds();
      }
      if (want === 'none') st.issues.push('wrong');
      timing('Steam the milk', 'Stop in the green. Past the red line, it scalds.', 3000, [zone], (v) => {
        const scald = v >= 92;
        st.milk = { type: want, val: v, scald };
        if (scald) st.issues.push('scald');
        else if (v < zone[0] || v > zone[1]) st.issues.push('milk');
        stepAdds();
      }, 'Milk', 'Stop!', true);
    }));
  }

  function stepAdds() {
    const draw = () => {
      frame('Creamers and syrups', `<p class="cafe-hint">Tap to add or remove. Check the recipe on the left.</p>
        <div class="cafe-opts">${Object.entries(ADDS).map(([k, a]) => `<button class="cafe-opt add ${st.adds.includes(k) ? 'sel' : ''}" data-a="${k}"><i style="background:${a.color}"></i>${esc(a.name)}</button>`).join('')}</div>
        <button class="btn big" id="cafe-next">Next</button>`, { step: 'Add-ins' });
      $$('[data-a]', $('#modal')).forEach((b) => b.addEventListener('click', () => {
        const k = b.dataset.a;
        st.adds = st.adds.includes(k) ? st.adds.filter((x) => x !== k) : [...st.adds, k];
        Sound.sfx(st.adds.includes(k) ? 'pickup' : 'click');
        draw();
      }));
      $('#cafe-next').addEventListener('click', () => {
        const want = [...st.r.adds].sort().join(), got = [...st.adds].sort().join();
        if (want !== got) st.issues.push('adds');
        Sound.sfx('click');
        stepTop();
      });
    };
    draw();
  }

  function stepTop() {
    frame('Top it off', `<div class="cafe-opts">${Object.entries(TOPS).map(([k, n]) => `<button class="cafe-opt" data-t="${k}">${esc(n)}</button>`).join('')}</div>`, { step: 'Topping' });
    $$('[data-t]', $('#modal')).forEach((b) => b.addEventListener('click', () => {
      st.top = b.dataset.t;
      Sound.sfx(st.top === 'sprinkles' ? 'sparkle' : 'click');
      if (st.top !== st.r.top && !(st.top === 'sprinkles' && vexHere)) st.issues.push('top');
      if (st.r.art && st.top !== 'whip' && st.top !== 'mallow' && st.milk && st.milk.type !== 'none') stepArt(); else stepServe();
    }));
  }

  function stepArt() {
    frame('Latte art (optional)', `<p class="cafe-hint">Pour a little shape into the foam, or skip it.</p>
      <div class="cafe-opts"><button class="cafe-opt" data-x="heart">♥ Heart</button><button class="cafe-opt" data-x="leaf">🍃 Leaf</button><button class="cafe-opt" data-x="wrench">🔧 Little wrench</button><button class="cafe-opt" data-x="skip">Skip</button></div>`, { step: 'Latte art' });
    $$('[data-x]', $('#modal')).forEach((b) => b.addEventListener('click', () => {
      Sound.sfx('click');
      if (b.dataset.x === 'skip') return stepServe();
      trace(b.dataset.x);
    }));
  }

  function trace(shape) {
    const pts = ART_PTS[shape];
    let next = 0;
    const draw = (msg) => {
      const path = pts.slice(0, next).map(([x, y], i) => `${i ? 'L' : 'M'}${100 + x * 4},${100 + y * 4}`).join(' ');
      frame('Latte art', `<p class="cafe-hint">${esc(msg)}</p>
        <div class="art-board"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="92" fill="#b88a62"/><circle cx="100" cy="100" r="80" fill="#f4ead8"/>
          <path d="${path}" stroke="#8a5a34" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          ${pts.map(([x, y], i) => `<button class="gdot ${i < next ? 'done' : ''} ${i === next ? 'next' : ''}" data-i="${i}" style="left:${(100 + x * 4) / 2}%;top:${(100 + y * 4) / 2}%">${i + 1}</button>`).join('')}</div>`, { step: 'Latte art' });
      $$('[data-i]', $('#modal')).forEach((b) => b.addEventListener('click', () => {
        if (+b.dataset.i !== next) { Sound.sfx('error'); draw('Pour in order: follow the numbers.'); return; }
        next++; Sound.sfx('click');
        if (next === pts.length) { st.art = shape; Sound.sfx('sparkle'); setTimeout(stepServe, 450); draw('Beautiful pour!'); return; }
        draw('Keep pouring...');
      }));
    };
    draw('Tap the dots in order to pour the shape.');
  }

  function stepServe() {
    frame('Serve it!', `<p class="cafe-hint">Who gets it?</p>
      <div class="cafe-opts"><button class="cafe-opt" data-s="r">Hand it to Racket</button>${vexHere ? '<button class="cafe-opt" data-s="v">Hand it to Vex</button>' : ''}</div>`, { step: 'Serve' });
    $$('[data-s]', $('#modal')).forEach((b) => b.addEventListener('click', () => { Sound.sfx('pickup'); react(b.dataset.s); }));
  }

  // ------------------------------------------------------------------ scoring + reactions
  function react(who) {
    const S = G.S, r = st.r, t = G.tier();
    const g = t <= 1 ? 0 : t === 2 ? 1 : 2;
    const issues = [...new Set(st.issues)];
    const stars = Math.max(0, 3 - issues.length);
    S.cafe.made[r.id] = (S.cafe.made[r.id] || 0) + 1;
    let lines = [], mood = 'grump', reward = '';
    if (who === 'v') {
      S.cafe.vex = (S.cafe.vex || 0) + 1;
      if (r.id === 'monster') lines = ["...Wait. Three creamers? Is this Racket's Monstrosity?", 'HA! I KNEW IT! I knew he secretly loved this thing!', '*She drinks it anyway. Every drop.*'];
      if (st.top === 'sprinkles') { lines.push(pick(['SPRINKLES! Look at them SHINE! Kid, you get me.', 'Ooh. Shiny. Crunchy. Perfect. Racket never puts sprinkles on ANYTHING.', 'Sprinkles. The correct number of sprinkles is "all of them". You nailed it.'])); G.addCredits(3); reward = '+3 cr tip from Vex'; mood = 'delight'; }
      else lines.push(pick(["No sprinkles? What am I, a raccoon?", "It's good. It's fine. It's not SHINY, but it's fine."]));
      showResult('v', mood, lines, stars, reward);
      G.ui.say('v', lines[lines.length - 1]);
      return;
    }
    // Racket
    if (issues.includes('scald')) lines = [...BAD.scald];
    else if (issues.includes('sour')) lines = [...BAD.sour];
    else if (issues.includes('bitter')) lines = [...BAD.bitter];
    else if (stars <= 1) lines = [pick(BAD.wrong)];
    else lines = [...RX[r.id][g]];
    if (stars === 2 && !issues.some((i) => ['scald', 'sour', 'bitter'].includes(i))) lines.push("...Bit off from the recipe. I'll drink it anyway.");
    if (st.art && stars >= 2) lines.push(ART_LINES[st.art][g >= 1 ? 1 : 0]);
    if (st.top === 'sprinkles' && r.top !== 'sprinkles') lines.push('Sprinkles? Was this meant for Vex? It looks like a disco. ...Tastes fine.');
    if (MUG_LINES[st.mug] && Math.random() < .5) lines.push(MUG_LINES[st.mug]);
    mood = stars === 3 ? (g >= 1 ? 'soft' : 'smirk') : stars === 2 ? 'smirk' : 'grump';
    // friendship + tips (kept small so the café stays a cozy extra)
    if (stars === 3) {
      if (r.id === 'monster') {
        S.cafe.monster = (S.cafe.monster || 0) + 1;
        if (S.cafe.monster <= 3) G.friend(2);
        lines.push(t >= 3 ? 'You got it exactly right. French vanilla first, then coffee, then hazelnut. ...You pay attention, lynx. I like that.' : 'That was... exactly right. How did you— never mind. Don\'t tell anyone.');
        mood = 'soft';
        if (S.cafe.monster === 1) reward = 'Racket liked that more than he\'ll ever admit.';
      } else if (S.cafe.made[r.id] === 1) G.friend(1);
      G.addCredits(2);
      reward = reward || '+2 cr in the tip jar';
    }
    showResult('r', mood, lines, stars, reward);
    G.ui.say('r', lines[lines.length - 1]);
  }

  function showResult(who, mood, lines, stars, reward) {
    const portrait = who === 'r' ? Art.portrait('r', mood) : Art2.vexPortrait(mood);
    frame(who === 'r' ? 'Racket takes a sip...' : 'Vex takes a sip...', `
      <div class="cafe-react ${who}"><div class="pframe">${portrait}</div><div class="cafe-lines">${lines.map((l) => `<p class="${l.startsWith('*') ? 'act' : ''}">${esc(l.replace(/^\*|\*$/g, ''))}</p>`).join('')}</div></div>
      <div class="cafe-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      ${reward ? `<p class="cafe-reward">${esc(reward)}</p>` : ''}
      <div class="cafe-opts"><button class="btn big" id="cafe-again">Make another</button><button class="btn" id="cafe-done">Done</button></div>`, { step: 'Serve' });
    Sound.sfx(stars === 3 ? 'success' : 'click');
    $('#cafe-again').addEventListener('click', () => { Sound.sfx('click'); menu(); });
    $('#cafe-done').addEventListener('click', () => { Sound.sfx('click'); st = null; G.ui.closeModal(); });
  }

  // ------------------------------------------------------------------ shared widgets
  function timing(title, hint, dur, zones, done, step, label, scald) {
    frame(title, `<p class="cafe-hint">${esc(hint)}</p>
      <div class="tbar">${zones.map(([a, b]) => `<i class="z" style="left:${a}%;width:${b - a}%"></i>`).join('')}${scald ? '<i class="scald" style="left:92%;width:8%"></i>' : ''}<b class="fill"></b></div>
      <button class="btn big" id="cafe-stop">${esc(label)}</button>`, { step });
    const fill = $('.tbar .fill');
    const t0 = performance.now();
    let raf = 0, stopped = false;
    Sound.sfx(scald ? 'hum' : 'drone', dur / 1000);
    const stop = (v) => { if (stopped) return; stopped = true; cancelAnimationFrame(raf); Sound.sfx('click'); setTimeout(() => done(v), 350); };
    const tick = (now) => {
      if (!$('.tbar')) return;
      const v = Math.min(100, (now - t0) / dur * 100);
      fill.style.width = v + '%';
      if (v >= 100) { stop(100); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    $('#cafe-stop').addEventListener('click', () => stop(parseFloat(fill.style.width) || 0));
  }
  function busyStep(title, hint, next, step) {
    frame(title, `<p class="cafe-hint">${esc(hint)}</p><div class="stir-bar"><i class="brewing"></i></div>`, { step });
    setTimeout(next, 1300);
  }

  // a gentle nudge in Racket's idle banter once the café is open
  if (DATA.idle2) DATA.idle2.forEach((pool) => pool.push('*glances at the coffee corner. Then at you. Then back at the coffee corner.*'));

  // ------------------------------------------------------------------ Café Rush (finale edition)
  const RUSH = [
    { who: 'Racket', pic: () => Art.portrait('r', 'laugh'), order: 'The French Vanilla Monstrosity. "Regular coffee. For adults."', want: { base: 'coffee', milk: 'none', adds: ['fv', 'og', 'hz'], top: 'none' }, ok: '"...Perfect. Don\'t tell anyone. Everyone already knows. Don\'t tell them anyway."', bad: '"That\'s not the Monstrosity. That\'s a Monstrosity. Different thing."' },
    { who: 'Vex', pic: () => Art2.vexPortrait('delight'), order: 'Anything. With. SPRINKLES.', want: { base: '*', milk: '*', adds: '*', top: 'sprinkles' }, ok: '"SHINY! Kid, I\'d hug you, but I already used up my hug for the decade."', bad: '"Where are the SPRINKLES? I\'m being punished."' },
    { who: 'STEWARD-9', pic: () => Art4.stewardPortrait('happy'), order: 'Oil, lightly frothed. "If it is no trouble."', want: { base: 'oil', milk: 'froth', adds: [], top: 'none' }, ok: '"Exquisite. Notes of gearbox and a hint of 1978. Thank you, Ms. Lynx."', bad: '"How... interesting. I shall drink it out of politeness. I do not drink."' },
    { who: 'Pip', pic: () => `<svg viewBox="-50 -50 100 100" aria-hidden="true">${Art3.pip(true)}</svg>`, order: 'Just the whipped cream. Pip is small. No coffee for Pip.', want: { base: 'none', milk: 'none', adds: [], top: 'whip' }, ok: 'Pip dives face-first into the whipped cream and emerges a very happy cloud.', bad: 'Pip looks at the cup. Pip looks at you. Pip is disappointed but forgiving.' },
    { who: 'The mossback', pic: () => '<svg viewBox="70 580 300 180" aria-hidden="true">' + Art3.deep.mossback() + '</svg>', order: 'One cocoa. Bucket-sized. With marshmallows. (It followed Pip up the hill.)', want: { base: 'cocoa', milk: 'steam', adds: [], top: 'mallow' }, ok: 'A deep, happy rumble. Several flowers on its back bloom at once.', bad: 'It drinks it anyway, sleepily. It is very forgiving. It is mostly asleep.' },
    { who: 'Crystal (you!)', pic: () => Art.portrait('c', 'happy'), order: 'An Ember-Bark Spice Latte. You earned it.', want: { base: 'espresso', milk: 'steam', adds: ['ember'], top: 'cinnamon' }, ok: 'It tastes like the woods in autumn, and like the whole adventure.', bad: 'It\'s... fine. You\'re too happy to care.' },
  ];
  function rush(onDone) {
    let i = 0, score = 0, timer = 0, t0 = 0;
    const cur = { base: null, milk: null, adds: [], top: null };
    const reset = () => { cur.base = null; cur.milk = null; cur.adds = []; cur.top = null; };
    const row = (label, key, opts, multi) => `<div class="rush-row"><span>${label}</span><div>${opts.map(([v, n]) => `<button class="cafe-opt sm ${multi ? (cur.adds.includes(v) ? 'sel' : '') : cur[key] === v ? 'sel' : ''}" data-k="${key}" data-v="${v}">${esc(n)}</button>`).join('')}</div></div>`;
    const draw = (msg) => {
      const o = RUSH[i];
      G.ui.modal('Café Rush: Celebration Order', `<div class="rush">
        <div class="rush-top"><span>Order ${i + 1} of ${RUSH.length}</span><span>★ ${score}</span></div>
        <div class="rush-ticket"><div class="pframe">${o.pic()}</div><div><b>${esc(o.who)}</b><p>${esc(o.order)}</p></div></div>
        <div class="stir-bar"><i id="rush-time" style="width:100%"></i></div>
        ${msg ? `<p class="cafe-reward">${esc(msg)}</p>` : ''}
        ${row('Base', 'base', [['coffee', 'Coffee'], ['espresso', 'Espresso'], ['cocoa', 'Cocoa'], ['oil', 'Motor oil'], ['none', 'Nothing']])}
        ${row('Milk', 'milk', [['steam', 'Steamed'], ['froth', 'Lightly frothed'], ['none', 'None']])}
        ${row('Add', 'adds', Object.entries(ADDS).map(([k, a]) => [k, k === 'hazelnut' ? 'Hazelnut syrup' : a.name.replace(' creamer', ' cr.').replace(' syrup', '')]), true)}
        ${row('Top', 'top', [['whip', 'Whipped cream'], ['mallow', 'Marshmallows'], ['cinnamon', 'Cinnamon'], ['sprinkles', 'Sprinkles'], ['none', 'Nothing']])}
        <button class="btn big" id="rush-serve">Serve!</button></div>`, { cls: 'rush-modal' });
      $$('[data-k]', $('#modal')).forEach((b) => b.addEventListener('click', () => {
        const k = b.dataset.k, v = b.dataset.v;
        if (k === 'adds') cur.adds = cur.adds.includes(v) ? cur.adds.filter((x) => x !== v) : [...cur.adds, v]; else cur[k] = v;
        Sound.sfx('click'); draw(msg);
      }));
      $('#rush-serve').addEventListener('click', serve);
      tick();
    };
    const tick = () => {
      cancelAnimationFrame(timer);
      const loop = (now) => {
        const el = $('#rush-time'); if (!el) return;
        el.style.width = Math.max(0, 1 - (now - t0) / 30000) * 100 + '%';
        timer = requestAnimationFrame(loop);
      };
      timer = requestAnimationFrame(loop);
    };
    const serve = () => {
      const o = RUSH[i], w = o.want;
      const late = performance.now() - t0 > 30000;
      const match = (k) => w[k] === '*' || (k === 'adds' ? [...w.adds].sort().join() === [...cur.adds].sort().join() : cur[k] === w[k] || (cur[k] == null && w[k] === 'none'));
      const ok = ['base', 'milk', 'adds', 'top'].every(match);
      if (ok) score += late ? 1 : 2;
      Sound.sfx(ok ? 'success' : 'error');
      const line = (ok ? o.ok : o.bad) + (ok && late ? ' (A little cold. Still loved.)' : '');
      i++; reset();
      if (i >= RUSH.length) {
        cancelAnimationFrame(timer);
        const stars = score >= 11 ? 3 : score >= 7 ? 2 : 1;
        G.ui.modal('Café Rush: Celebration Order', `<div class="rush"><div class="rush-ticket"><div class="pframe">${o.pic()}</div><div><b>${esc(o.who)}</b><p>${esc(line)}</p></div></div>
          <div class="cafe-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
          <p class="cafe-hint">${stars === 3 ? 'Everybody got exactly what they wanted. Even the mossback.' : 'A couple of mix-ups. Nobody minds. It is a party.'}</p>
          <button class="btn big" id="rush-done">Back to the party</button></div>`, { cls: 'rush-modal' });
        $('#rush-done').addEventListener('click', () => { G.ui.closeModal(); onDone && onDone(stars); });
        return;
      }
      t0 = performance.now();
      draw(line);
    };
    t0 = performance.now();
    draw();
  }

  return { open, cartArt, RECIPES, rush };
})();
