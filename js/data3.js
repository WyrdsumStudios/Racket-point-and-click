/* Racket's Garage — data3.js
 * Phase 3: the Deep Woods, the Glade, the Old Wreck (the Long Shot), the navigation repair,
 * Racket's story, Racket and Vex clearing the air, and the patch.
 */

// ---------------------------------------------------------------------------
// ITEMS
// ---------------------------------------------------------------------------
Object.assign(DATA.items, {
  broken_scanner: { name: 'Broken Scanner', r: "My old scanner. Cracked lens, dead coil. Used to find anything with this thing. Then I lost the coil. And the touch." },
  scanner: { name: 'Scanner', r: "My old scanner, pinging again. Finds anything hidden nearby. Technique is: wave it around like a lunatic. Works every time." },
  resonance_coil: {
    name: 'Resonance Coil',
    r: (G) => (G.S.flags.wreckStory ? "The Long Shot's resonance coil. Only thing on her that still works. Stubborn. Like her pilot." : "A resonance coil, off an old hauler. Huh. Haven't seen one of these in... a long time."),
  },
  ration_paste: { name: 'Ration Paste', c: "Ration paste. Formerly ration bars. It smells like cinnamon and regret.", r: "That's not food. Pip thinks it's food. Pip is wrong, but committed." },
  star_crystal: { name: 'Star-Chart Crystal', r: "A star-chart crystal. Holds a map of the whole sky inside it. Old trees grow them. Nobody knows why. I like that nobody knows why." },
  nav_chip: { name: 'Navigation Chip', r: "Nav chip. Tells your ship where it is and where it's going. Wish they made one for people." },
  flight_recorder: { name: 'Flight Recorder', r: "The Long Shot's flight recorder. ...Give it to Vex. She should hear what's on it." },
  meteorite: { name: 'Meteorite', r: "A real meteorite. Fell out of the sky and landed somewhere it didn't plan to. Relatable. Star nerds pay good money." },
  lucky_washer: { name: 'Gold Washer', r: "That's Vex's lucky washer. She lost it twenty years ago and blamed me. Give it back to her. Watch her face." },
  mushroom_spores: { name: 'Old Spore Tin', r: "...That's my mom's spore tin. Where did you— give me that. Gently. Please." },
  long_shot_patch: { name: 'LONG SHOT Patch', r: "The Long Shot's crew patch. It's yours now. Wear it like you mean it." },
});
Object.assign(DATA.sellPrices, { meteorite: 25 });
Object.assign(DATA.buyers, { meteorite: ['star_nerd_42', 'A REAL METEORITE?? shut up. SHUT UP. 25 credits!!'] });

DATA.repairs.nav = {
  name: 'Navigation',
  parts: [
    { key: 'starcrystal', item: 'star_crystal', name: 'Star-chart crystal', where: 'Deep in the woods, in the roots of the ancient glowing tree. The scanner can tell which one.' },
    { key: 'chip', item: 'nav_chip', name: 'Navigation chip', where: 'JunkNet has one, for a lot. Or Vex might have a spare, for the right trade.' },
  ],
};

DATA.navBack = { price: 150, status: null, name: 'Navigation Chip (definitely not stolen)', blurb: "BACK IN STOCK! Definitely not stolen. Okay, slightly stolen. It fell off a ship. My ship. Which I stole." };
DATA.listings.push(
  { id: 'wanted', name: 'WANTED: anything from the old LONG SHOT wreck', status: 'WANTED', seller: 'scrapqueen_vex', stars: 5, phase: 3,
    blurb: "Deep Woods, past the fallen tree. I don't do the woods. Paying well. Asking for a friend. The friend is me." },
  { id: 'jar', name: 'Artisanal Firefly Jar', price: 15, seller: 'jar_jar_jars', stars: 4, phase: 3,
    blurb: "Hand-blown glass. Fireflies sold separately. Fireflies also free. In the woods. Please buy my jar." },
  { id: 'moss', name: 'Moss Remover (for wrecks)', price: 40, seller: 'tidy_tim', stars: 2, phase: 3,
    blurb: "Removes moss from old ships. Review from rkt: 'Leave the moss alone.'" },
);
DATA.jobs.push(
  { id: 'bolts3', title: 'BOLT BIN III', body: "The socks have multiplied. Also: springs. Sort everything. Do NOT touch the socks.", reward: '14 cr', game: 'bolts3', phase: 3 },
);

// ---------------------------------------------------------------------------
// DIALOGUE
// ---------------------------------------------------------------------------
D.hintNav = (G) => {
  const S = G.S, F = S.flags, lines = [];
  const back = () => { G.tmp.again = true; return 'hub'; };
  const has = (k, item) => S.parts[k] || G.has(item);
  if (!F.logCut) {
    lines.push(R('grump', "Navigation needs three things. A star-chart crystal, a working scanner and a nav chip."));
    lines.push(R('grump', "The crystal grows deep in the woods. So: that fallen tree. You've got a torch. Go make some sawdust."));
  }
  if (!F.scannerTaken) lines.push(R('grump', "Scanner... I've got an old one. Workbench drawer. It's dead, though."));
  else if (!F.scannerFixed) {
    lines.push(G.has('resonance_coil')
      ? R('smirk', "You found a coil? Workbench. Bring my scanner back to life.")
      : R('soft', "Scanner needs a resonance coil. Haven't seen one since— doesn't matter. Old things end up in the woods. Look there."));
  }
  if (F.logCut && !F.gladeLit) lines.push(R('grump', "The big old tree's past a stretch of woods so dark you can't see your paws. You need light. Fireflies. That purple pest seems to know the way."));
  if (F.logCut && !F.rootsCleared) lines.push(R('grump', "There's an old path east, choked with roots. Light runs through roots, if you line them up."), R('soft', "...I wouldn't go that way. No reason. Just wouldn't."));
  if (!has('starcrystal', 'star_crystal') && F.gladeLit) lines.push(R('grump', F.scannerFixed ? "Glade crystals all look the same. Your scanner won't think so." : "Glade crystals all look the same. A working scanner'll pick out the star-chart one."));
  if (!has('chip', 'nav_chip')) lines.push(R('grump', F.reconciled ? "Nav chip? ...Check your pockets. Vex gave you one, didn't she." : "Nav chip. That pirate on JunkNet's got one back in stock. Costs a fortune. Or... Vex might have a spare. She'll want something. She always does."));
  if (has('starcrystal', 'star_crystal') && has('chip', 'nav_chip') && F.scannerFixed) lines.push(R('grump', "That's everything. Workbench. Calibrate the star map, then boot her up."));
  if (!lines.length) lines.push(R('grump', "You're close, lynx. Keep going."));
  return { lines, go: back };
};

D.deepIntro = {
  cast: ['c'],
  lines: [
    C('surprised', "Oh. Oh, wow."),
    N("Trees taller than towers, ringed in soft teal light. Fireflies drift through the fog. Something enormous and mossy snores nearby."),
    C('happy', "It's the most beautiful place I've ever crashed near."),
  ],
};
D.gladeIntro = {
  cast: ['c'],
  lines: [
    N("The path opens into a glade. In the middle stands a tree so old the whole forest seems to have grown up around it, its blossoms glowing pink and white against the stars."),
    C('surprised', "It feels... awake. Like it's been waiting for somebody."),
    C('neutral', "And there, in the roots: crystals. Dozens of them. One of them has to be the star chart."),
  ],
};
D.wreckIntro = {
  cast: ['c'],
  lines: [
    N("Through the roots: a ship. A huge old cargo hauler, half swallowed by the forest, moss growing over everything."),
    C('surprised', "Those curved ribs... they look exactly like the beams in Racket's garage ceiling."),
  ],
};

D.wreckStory = {
  lines: [
    N("Tucked in the cockpit visor is a faded photo: a young raccoon in brass goggles and a magpie with a ridiculous crest, both laughing at something off camera."),
    C('surprised', "Racket... and Vex?"),
    R('soft', "Thought I smelled torch smoke."),
    N("Racket stands in the torn doorway. He doesn't come in."),
    R('soft', "You found her. The Long Shot."),
    R('soft', "Vex and me hauled cargo in her for six years. Best ship I ever flew."),
    R('soft', "Nav died over the ridge. Total blackout. I knew we weren't clearing those trees."),
    R('soft', "One escape pod. Just the one. So I told Vex to take it. She argued. She always argues. So I made it an order."),
    R('soft', "She went. She was fine. I rode the Long Shot down. Right here."),
    N("He touches the tally marks on the wall without looking at them."),
    R('soft', "Two hundred and some days, I waited for a rescue ship. Counted every one. Then one morning I picked up a wrench instead of the chalk."),
    R('soft', "Built the garage out of her bones. Figured if nobody was coming for me, I'd be the one who was there. For the next crash."),
    R('soft', "Vex found me, eventually. Alive. Grumpy. She'd been so sure she'd left me to die. I think she never forgave herself."),
    R('soft', "And I never told her I'd have done it again. Every time. Too proud. So we bicker instead. It's easier."),
  ],
  choices: [
    { t: "(step close and hug him)", f: 4, say: [N("He goes stiff as a wrench. Then, slowly, he doesn't."), R('soft', "...Okay. Okay. That's enough."), R('soft', "...Ten more seconds.")], go: 'wreckStory2' },
    { t: "(sit nearby and give him space)", f: 4, say: [N("You sit on a mossy crate and say nothing. After a while, he comes in and sits too. It's the good kind of quiet."), R('soft', "...Thanks. For not saying anything.")], go: 'wreckStory2' },
    { t: "You were the one who was there. For me.", f: 4, say: [R('shock', "..."), R('soft', "...Yeah. I guess I was.")], go: 'wreckStory2' },
  ],
};
D.wreckStory2 = {
  lines: [
    R('grump', "Anyway. That's a lot of feelings for a Tuesday. Is it Tuesday? It feels like a Tuesday."),
    R('grump', "If you're after a resonance coil, there's one in the cargo hold. Only thing on her that still works. Stubborn. Like her pilot."),
    R('grump', "And grab the flight recorder from the cockpit. Vex has been asking about this wreck on JunkNet for years. She should have it."),
    R('soft', "...Don't tell her I said she should have it."),
    R('grump', "I'm going home. I'm making noodles. Don't take forever, lynx."),
  ],
  end: (G) => G.wreckStoryDone(),
};

D.vexRecorder = (G) => ({
  cast: ['v', 'c'],
  lines: [
    N("Vex sees the orange box and stops talking. That never happens."),
    V('shock', "...That's the Long Shot's recorder."),
    N("She plugs it into a battered speaker. Static. Alarms. Then a younger, grumpier Racket:"),
    N("\"Vex. Take the pod. That's an order. ...I've got her. Go. I'll see you on the ground.\""),
    V('neutral', "...He said he'd see me on the ground. I forgot that part. All I remember is leaving."),
    V('neutral', "Twenty years I figured he blamed me. Like I ran out on him."),
  ],
  choices: [
    { t: "He doesn't blame you. He'd tell you to go again.", f: 2, say: [V('shock', "He said that?"), V('neutral', "...He never said that to ME.")], go: 'vexRecorder2' },
    { t: "You should hear it from him, not me.", f: 2, say: [V('annoyed', "Ugh. You sound like a greeting card."), V('neutral', "...A smart greeting card.")], go: 'vexRecorder2' },
  ],
});
D.vexRecorder2 = (G) => ({
  lines: [
    V('smug', "...Fine. FINE. I'm going to the garage. Tonight. Before I lose my nerve."),
    ...(G.S.flags.chipBought || G.S.parts.chip || G.has('nav_chip')
      ? [V('annoyed', "Wait. You bought that pirate's nav chip? ...Here. A hundred and fifty credits. He owes me. Don't ask."), FX((G) => G.addCredits(150))]
      : [V('neutral', "And take this. Nav chip. I pulled it off the Long Shot's sister ship years ago."), V('neutral', "Kept it in case he ever wanted to fly again. ...Guess somebody does."), FX((G) => G.give('nav_chip'))]),
    V('smug', "Don't make it weird."),
  ],
  end: (G) => G.reconcileScene(),
});

D.reconcile = {
  cast: ['r', 'v', 'c'],
  lines: [
    N("That evening, Vex stands in the garage doorway holding the orange flight recorder. Racket sees it and goes very still."),
    R('grump', "...Vex."),
    V('neutral', "You told me you'd see me on the ground."),
    R('soft', "...Yeah. I did."),
    V('annoyed', "You never came looking. I had to find YOU. In a tree house made out of our ship."),
    R('grump', "It's a garage."),
    V('annoyed', "It's a TREE HOUSE, Racket."),
  ],
  choices: [
    { t: "Racket. Tell her what you told me.", f: 3, say: [R('soft', "...I'd do it again. Tell you to go. Every time. You didn't run out on me, Vex. You did what I asked."), R('soft', "I'm glad you took the pod. I've always been glad.")], go: 'reconcile2' },
    { t: "She's been carrying this for twenty years, Racket.", f: 3, say: [R('soft', "...I know. I'm sorry, Vex. I should've said it ages ago."), R('soft', "You did what I asked. I'd ask again. I'm glad you're alive. That's the whole thing.")], go: 'reconcile2' },
    { t: "(step back and let them talk)", f: 3, say: [N("You step back. For once, neither of them needs a referee."), R('soft', "...I'm glad you took the pod, Vex. I've always been glad. I just never said it.")], go: 'reconcile2' },
  ],
};
D.reconcile2 = {
  lines: [
    V('neutral', "...You big, stubborn, trash-panda idiot."),
    R('smirk', "Missed you too, bird brain."),
    N("And then, astonishingly, they hug. Briefly. Aggressively. With a lot of back-slapping."),
    V('smug', "This never happened."),
    R('grump', "Never."),
    V('delight', "Kid. ...Thanks. For dragging this old box out of the woods. And him out of his head."),
    R('soft', "Yeah. Thanks, lynx."),
  ],
  end: (G) => G.reconcileDone(),
};

D.spores = {
  lines: [
    N("Racket turns the dented tin over in his paws like it might break."),
    R('soft', "...That's my mom's spore tin. I thought I lost it. Years ago."),
    R('soft', "It was under the floorboard? I must've hidden it from myself. That's... very me."),
  ],
  choices: [
    { t: "Let's replant your mushroom patch. I owe you one.", f: 5, say: [R('soft', "...Yeah. Yeah, okay."), R('smirk', "You dig. I supervise. Loudly.")] },
    { t: "She'd want them to grow.", f: 5, say: [R('soft', "...She would. She really would."), R('grump', "Don't look at me. I've got something in my eye. It's sawdust. Shut up.")] },
  ],
  end: (G) => G.sporesDone(),
};

D.navDone = {
  lines: [
    N("The Dandelion's console flickers. A soft synthetic voice: NAVIGATION ONLINE. CURRENT LOCATION: VERDANCE. CURRENT MOOD: HOPEFUL."),
    C('happy', "Hopeful! She's hopeful, Racket!"),
    R('smirk', "Hopeful. Huh. Even your ship's going soft on me."),
  ],
  end: (G) => G.patchScene(),
};
D.patch = {
  lines: [
    R('grump', "Hold still. Turn around. ...No, the other around."),
    N("He's holding a faded round patch: a raccoon mask over the words LONG SHOT."),
    R('soft', "Crew patch. From the Long Shot. Was on my jacket the day she went down."),
    R('soft', "Figured it should fly again. And you're... you're crew. So."),
    FX((G) => G.give('long_shot_patch')),
  ],
  choices: [
    { t: "Racket... I'll wear it every day.", f: 3, say: [R('grump', "Every day is a lot. Most days. Fine. Every day.")] },
    { t: "(let him sew it onto your sleeve)", f: 3, say: [N("He sews it on himself, tongue poking out in concentration. The stitches are perfect. Obviously.")] },
  ],
  end: (G) => { G.wearPatch(); G.dlg('patch2'); },
};
D.patch2 = {
  lines: [
    R('soft', "There. Looks good on you, sweetheart."),
    N("Silence. A very long silence."),
    C('smug', "...Did you just call me sweetheart?"),
    R('shock', "I said lynx."),
    C('smug', "You said sweetheart."),
    R('grump', "I said LYNX. Clearly. Loudly. L-Y-N-X."),
    N("His ears have gone very, very pink."),
    R('soft', "...Get some sleep. Hull plating's next. And the engine core's making a new noise. I don't like the new noise."),
  ],
  end: (G) => G.phaseEnd(3),
};

// --- small bubbles + reactions ---------------------------------------------
DATA.idle3 = [
  ["*hums the radio song*"],
  ["*polishes the Dandelion's nav panel, then pretends he wasn't*"],
  ["Hey lynx. ...Nothing. Just checking you're still here.", "You hungry? I'm making noodles anyway."],
  ["Hey lynx. ...Nothing. Just checking you're still here.", "Vex called. Four times. About nothing. It was... nice. Don't tell her.", "*sewing something. Hides it when you look.*"],
  ["Hey lynx. Come look at this gasket. ...No reason. I just like when you look at stuff with me.", "You still wearing the patch? ...Good. Just checking."],
];
Object.assign(DATA.giveRacket, {
  broken_scanner: "My old scanner. Dead as a doornail. Needs a resonance coil. Good luck.",
  scanner: "She's pinging! Go wave it around. Old scanners find old secrets.",
  resonance_coil: "That coil's from the Long Shot. ...Workbench. Fix the scanner.",
  ration_paste: "That's not food. Pip thinks it's food. Pip is wrong, but committed.",
  star_crystal: "A star-chart crystal. Huh. The old tree gave you one. It doesn't do that for just anybody.",
  nav_chip: "Nav chip. Workbench. Don't let it go to your head. It goes in the ship.",
  flight_recorder: "Give that to Vex. Not me. ...Please.",
  meteorite: "Sell it. Star nerds go feral for those.",
  lucky_washer: "Vex's lucky washer. Give it back to her. You'll see a magpie cry. Rare sight.",
  long_shot_patch: "It's yours. Wear it.",
});
Object.assign(DATA.giveVex, {
  meteorite: "Sell it to the star nerd. They pay stupid money. Stupid, beautiful money.",
  star_crystal: "Don't. Shiny. Don't show me shiny things I can't have.",
  nav_chip: "I know that chip. ...Put it in the kid's ship. It deserves to fly.",
  scanner: "Racket's old scanner? He used to find me with that thing when I hid. ...Ping somebody else.",
  resonance_coil: "That's a Long Shot coil. Where'd you— ...the woods. Course.",
  long_shot_patch: "He gave you his patch? ...He gave you his PATCH. Oh, kid. He's done for.",
  mushroom_spores: "His mom's spore tin. Give it to HIM, not me. Watch him pretend he isn't crying.",
  broken_scanner: "Dead. Like my patience. Fix it.",
});
