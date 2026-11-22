/* Racket's Garage — data.js
 * Items, dialogue, banter and shop listings. Dialogue nodes look like:
 *   { lines: [[who, mood, text]...], choices: [{ t, f, say, go, if, run }], go, end }
 * who: 'r' Racket, 'c' Crystal, 'n' narrator, 'fx' = run a function.
 * text can be a string or a function (G) => string. Nodes can also be functions (G) => node.
 * f = hidden friendship change when the player picks that choice.
 */
const R = (mood, text) => ['r', mood, text];
const C = (mood, text) => ['c', mood, text];
const N = (text) => ['n', null, text];
const FX = (fn) => ['fx', fn];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const DATA = {};

// ---------------------------------------------------------------------------
// ITEMS — `r` is Racket's take (shown once you've met him); `c` is Crystal's
// before then.
// ---------------------------------------------------------------------------
DATA.items = {
  datapad: { name: 'Datapad', c: "My datapad. Ship diagnostics, star charts, and four hundred photos of clouds.", r: "Your fancy datapad. Shows your ship's sad little damage report. And, apparently, four hundred photos of clouds." },
  pry_bar: { name: "Racket's Pry Bar", r: "My good pry bar. Bring it back straight, or don't bring yourself back." },
  oven_mitts: { name: 'Oven Mitts', r: "Heat-proof up to 'stupidly hot.' Rated for casseroles and alien crystals. Not at the same time." },
  hull_scrap: { name: 'Bent Hull Panel', c: "A chunk of the Dandelion's hull. Can't be fixed, but scrap's worth something to somebody.", r: "A bent hull panel. Junk. JunkNet buys junk. That's the whole business model." },
  antenna: { name: 'Folded Antenna', c: "My comm antenna, folded like a lawn chair. Sorry, buddy.", r: "Your antenna, folded like a lawn chair. Worth a few credits to someone with low standards." },
  spare_fuse: { name: 'Ship-Grade Fuse', c: "A spare fuse from my emergency locker. Rated for starships, so it'll handle pretty much anything.", r: "Ship-grade fuse. Total overkill for a radio. I respect overkill." },
  cell_casing: { name: 'Fuel Cell Casing', r: "Fuel cell casing. Dented, but the seals held. You got lucky. Don't get used to it." },
  charge_crystal: { name: 'Raw Charge Crystal', r: "Raw charge crystal. Hums like it knows something you don't. Don't lick it." },
  wiring: { name: 'Copper Wiring Harness', r: "Copper harness, lightly chewed. The chewing's a feature. Probably." },
  garage_key: { name: 'Spare Garage Key', r: "Spare key to my garage. The raccoon keychain came with it. It CAME with it." },
};
DATA.sellPrices = { hull_scrap: 8, antenna: 8 };
DATA.parts = [
  { key: 'casing', item: 'cell_casing', name: 'Fuel cell casing', where: 'Crash site, pinned under wreckage. Needs something to pry with.' },
  { key: 'crystal', item: 'charge_crystal', name: 'Charge crystal', where: 'The glowing vein at the crash site. Way too hot to touch bare-pawed.' },
  { key: 'wiring', item: 'wiring', name: 'Copper wiring', where: "JunkNet, on Racket's terminal. 35 credits." },
];
DATA.wiringPrice = 35;

// ---------------------------------------------------------------------------
// DIALOGUE
// ---------------------------------------------------------------------------
DATA.dlg = {};
const D = DATA.dlg;

D.wake = {
  cast: ['c'],
  lines: [
    C('worried', "Ow. Okay. Okay! Still got all my whiskers."),
    C('worried', "The Dandelion... oh no. Oh, girl, look at you."),
    C('neutral', "Right. Diagnostics first. Panic second."),
  ],
};

D.afterDiag = {
  cast: ['c'],
  lines: [
    C('worried', "Fuel cell's toast. Thrusters, nav, hull... she's not flying anywhere."),
    C('surprised', "Wait. Is that chimney smoke, through the trees? And a light?"),
    C('happy', "Somebody lives out here! Maybe somebody with tools."),
  ],
};

// --- First meeting ---------------------------------------------------------
D.intro = {
  lines: [
    N("A tall raccoon in grease-stained coveralls is elbow-deep in an engine. He doesn't look up."),
    R('grump', "We're closed."),
  ],
  choices: [
    { t: "The sign out front says open.", f: 2, say: [R('smirk', "The sign's a liar. I painted it in a better mood.")], go: 'intro2' },
    { t: "My ship crashed. I need a mechanic.", f: 1, say: [R('grump', "And I need a nap. Look at us. Neither of us getting what we want.")], go: 'intro2' },
    { t: "Is that... a raccoon in a jumpsuit?", f: 0, say: [R('shock', "Coveralls."), R('grump', "It's a raccoon in COVERALLS. And he was having a perfectly quiet evening.")], go: 'intro2' },
  ],
};
D.intro2 = {
  lines: [
    N("He finally looks up, squinting past you at the smoke drifting over the treetops."),
    R('shock', "...Hold on. That boom that knocked my mug off the shelf. That was you?"),
  ],
  choices: [
    { t: "Guilty.", f: 1, say: [R('grump', "At least you're honest. Annoying, but honest.")], go: 'intro3' },
    { t: "Technically? That was gravity.", f: 2, say: [R('smirk', "Oh good. A comedian. Love that for me.")], go: 'intro3' },
    { t: "Your mug's fine, right?", f: 2, say: [R('grump', "Handle came off. Again."), R('smirk', "...Thanks for asking, I guess.")], go: 'intro3' },
  ],
};
D.intro3 = {
  lines: [
    R('grump', "You flattened my mushroom patch. Three years, I grew those."),
    C('worried', "I'm so sorry. I'll pay for them. I'll... okay, I can't pay for anything right now."),
    R('grump', "Course you can't."),
    N("He lets out the sigh of a raccoon who already knows how this ends."),
    R('grump', "Fine. Here's the deal. I fix your ship. You leave my planet. I go back to enjoying the silence. Everybody wins."),
    R('smirk', "Mostly me."),
  ],
  choices: [
    { t: "Deal. Thank you. Really.", f: 1, say: [R('grump', "Don't thank me. I'm doing it so you'll leave.")], go: 'intro4' },
    { t: "You're kind of sweet, you know that?", f: 2, say: [R('shock', "..."), R('grump', "Say that again and the deal's off.")], go: 'intro4' },
    { t: "Your planet? You own the whole planet?", f: 1, say: [R('smirk', "Feels like it, out here. Nobody to argue with. Until now.")], go: 'intro4' },
  ],
};
D.intro4 = {
  lines: [
    R('grump', "I'll tow your wreck into my bay. You go back to the crash site and grab whatever fell off it."),
    R('grump', "Start with the fuel cell. Without it, that ship's a very expensive lawn ornament."),
    R('grump', "Pry bar's on the pegboard. Oven mitts are on the couch. Don't ask why the mitts are on the couch."),
    R('grump', "Anything you can't scrounge, you buy on JunkNet. My terminal. With credits. Which you don't have."),
    R('smirk', "Job board's by the window. I don't do charity. I do chores."),
    R('grump', "Name's Racket. Don't wear it out."),
    C('happy', "Crystal. Crystal Lynx."),
    R('grump', "Course it is."),
  ],
  end: (G) => G.introDone(),
};

// --- Talking to Racket (hub) -----------------------------------------------
D.hub = (G) => {
  const t = G.tier(), S = G.S;
  const again = G.tmp.again;
  G.tmp.again = false;
  const greet = again
    ? pick(t >= 2 ? ["What else, lynx?", "Anything else?"] : ["What else?", "Anything else, or are we done?"])
    : pick([
      ["What.", "You again.", "Make it quick.", "I'm busy. I'm always busy. What?"],
      ["Yeah, yeah. What do you need?", "You're standing in my light. ...What is it?", "Back already?"],
      ["What's up, lynx?", "Back already? Couldn't stay away, huh, lynx?", "Hey. What do you need?"],
      ["Hey, lynx. You eat today?", "There she is. What's up?"],
      ["Hey, lynx. There you are. What's up?", "Hey, lynx. Place felt too quiet. What's up?"],
    ][t]);
  const back = () => { G.tmp.again = true; return 'hub'; };
  return {
    lines: [R(G.rMood(), greet)],
    choices: [
      { t: "Where do I find parts for the fuel cell?", if: () => !S.repairs.fuel, go: 'hintFuel' },
      { t: "How do I fix the thrusters?", if: () => S.repairs.fuel && S.flags.phase1 && !S.repairs.thrusters, go: 'hintThrusters' },
      { t: "What's next for the ship?", if: () => S.repairs.fuel && !S.flags.phase1, say: [R('grump', "Thrusters. And for that we need the junkyard. Tomorrow."), R('smirk', "Tonight, you rest. That's an order. I'm very bossy.")], go: back },
      { t: "How do I fix the navigation?", if: () => S.repairs.thrusters && S.flags.phase2 && !S.repairs.nav, go: 'hintNav' },
      { t: "What's next for the ship?", if: () => S.repairs.thrusters && !S.flags.phase2, say: [R('grump', "Navigation. Which means the Deep Woods. Which means that fallen tree."), R('smirk', "Tomorrow, lynx. Tonight the torch stays off. ...Mostly.")], go: back },
      { t: "What's next for the ship?", if: () => S.repairs.nav && !S.flags.phase3, say: [R('grump', "Hull plating. Three breaches and a dent shaped like a face."), R('soft', "And the engine core. It's making a new noise. I don't like the new noise.")], go: back },
      { t: "How do I fix the hull?", if: () => S.flags.phase3 && !S.repairs.hull, go: 'hintHull' },
      { t: "About the engine core...", if: () => S.flags.phase4 && !S.flags.coreTalked, go: 'coreTalk' },
      { t: "How do I fix the engine core?", if: () => S.flags.phase4 && S.flags.coreTalked && !S.repairs.core, go: 'hintCore' },
      { t: "About that locked crate out back...", if: () => S.flags.crateSeen && !S.flags.crateOpened, run: (G) => G.askCrate() },
      { t: "Meet me on the roof tonight. Vex is coming.", if: () => S.flags.phase4 && !S.flags.racketInvited && !S.flags.roofTalk, go: 'inviteRacket' },
      { t: "So... the engine core.", if: () => S.repairs.hull && !S.flags.phase4, say: [R('grump', "Yeah. The noise."), R('soft', "...I've heard that noise before. Twenty years ago. Right before the Long Shot's nav went dark."), R('grump', "Not saying it means anything. Just saying I've heard it.")], go: back },
      { t: "Here. I found this under a floorboard.", if: () => G.has('mushroom_spores'), go: 'spores' },
      { t: "Got any work for me?", go: 'hintJobs' },
      { t: "So... you and Vex?", if: () => S.flags.vexMet, go: 'racketVex' },
      { t: "Tell me about yourself.", go: 'lore' },
      { t: "Just thought I'd hang out for a bit.", go: 'hang' },
      { t: "Here's your pry bar back. Still straight.", if: () => G.has('pry_bar') && S.flags.casingTaken, go: 'retPry' },
      { t: "Returning your oven mitts.", if: () => G.has('oven_mitts') && S.flags.crystalTaken, go: 'retMitts' },
      { t: "Never mind.", say: [R(G.rMood(), pick([["Great. Bye.", "Riveting talk."], ["Okay.", "Mm-hm."], ["Sure thing, lynx.", "Holler if you need me."], ["Don't go far."], ["Don't go far, okay?"]][t]))] },
    ],
  };
};

D.hintFuel = (G) => {
  const S = G.S, have = (k, item) => S.parts[k] || G.has(item);
  const lines = [];
  const missing = DATA.parts.filter((p) => !have(p.key, p.item));
  if (missing.length === 3) lines.push(R('grump', "Fuel cell needs three things. A casing, a charge crystal, and wiring that isn't fried to a crisp."));
  if (!have('casing', 'cell_casing')) {
    lines.push(G.has('pry_bar')
      ? R('grump', "You've got my pry bar. Casing's under some wreckage out at your crash. Pry. Lift. Bring it home.")
      : R('grump', "Your casing popped off in the crash. Probably pinned under some wreckage. Take my pry bar. Pegboard."));
  }
  if (!have('crystal', 'charge_crystal')) {
    lines.push(G.has('oven_mitts')
      ? R('smirk', "Mitts on, grab a crystal from that vein by your wreck. Don't lick it.")
      : R('grump', "Your crash cracked open a crystal vein. Raw charge crystal, hot enough to curl your whiskers. Mitts. Couch."));
  }
  if (!have('wiring', 'wiring')) {
    if (S.credits < DATA.wiringPrice) lines.push(R('grump', () => `Wiring, you buy. JunkNet, ${DATA.wiringPrice} credits. You've got ${S.credits}. Job board's by the window.`));
    else lines.push(R('smirk', "You've got the credits. Terminal. Go shop. Try not to get scammed. Okay, you'll get scammed a little."));
    if (!S.flags.termUnlocked) lines.push(R('grump', "Password's on the sticky note. ...Don't read the sticky note."));
  }
  if (!missing.length) {
    const installed = DATA.parts.every((p) => S.parts[p.key]);
    lines.push(installed
      ? R('grump', "It's all on the bench. Seal it and charge it. Go on.")
      : R('grump', "That's everything. Workbench. Put it together. I'll supervise. Loudly."));
  }
  return { lines, go: () => { G.tmp.again = true; return 'hub'; } };
};

D.hintJobs = (G) => {
  const J = G.S.jobs, lines = [];
  if (J.radio !== 'done') lines.push(R('grump', "Radio's been dead a week. Needs a fuse. Bet that fancy ship of yours carried a spare."));
  if (J.bolts !== 'done') lines.push(R('grump', "Bolt bin needs sorting. Small, medium, large. Even you can manage that."));
  if (J.scrap !== 'done') lines.push(R('smirk', "Your wreck shed scrap all over the woods. JunkNet buys scrap. Barely."));
  if (G.S.flags.phase1) {
    if (J.bolts2 !== 'done') lines.push(R('grump', "Somebody dumped nuts and washers in my bolt bin. I have a suspect. She has feathers."));
    if (J.tune !== 'done') lines.push(R('grump', "Tow truck's coughing. Needs a tune-up. Gentle hands. Good timing."));
    if (J.wires !== 'done') lines.push(R('grump', "Workbench wiring's a mess. Match 'em up. If it sparks, it's wrong."));
    if (G.S.flags.vexMet) lines.push(R('smirk', "And junk from Vex's piles sells on JunkNet. Somebody always buys it. Usually Vex."));
  }
  if (!lines.length) lines.push(R('smirk', "I'm out of new jobs. But the board takes repeat customers. Couple credits a go."));
  return { lines, go: () => { G.tmp.again = true; return 'hub'; } };
};

DATA.lore = [
  {
    need: 0,
    lines: [
      R('grump', "Not much to tell. Got a garage. Got tools. Usually don't got visitors."),
      C('neutral', "Why live way out here in the woods?"),
      R('grump', "Trees don't ask questions."),
      R('smirk', "...Present company excluded."),
    ], f: 3,
  },
  {
    need: 1,
    lines: [
      R('grump', "See those curved beams up in the ceiling? This garage used to be a cargo hauler. The bones of this place used to fly."),
      C('surprised', "Wait. You crashed here too?"),
      R('grump', "Didn't say that."),
      R('soft', "...Didn't not say it, either."),
    ], f: 3,
  },
  {
    need: 2,
    lines: [
      R('soft', "The mushrooms. They were my mom's thing. She grew 'em on every rock we ever lived on."),
      R('soft', "Figured I'd keep it going. Something that stays put, y'know?"),
      C('worried', "Racket... I'm really sorry about the patch."),
      R('smirk', "Eh. They grow back. That's the whole point of mushrooms."),
      R('smirk', "You still owe me, though."),
    ], f: 4,
  },
];
D.lore = (G) => {
  const S = G.S, i = S.talked.lore || 0, t = G.tier();
  const back = () => { G.tmp.again = true; return 'hub'; };
  if (i >= DATA.lore.length) return { lines: [R('smirk', t >= 2 ? "That's all the free backstory you get, lynx." : "That's all the free backstory you get.")], go: back };
  const L = DATA.lore[i];
  if (t < L.need) {
    return { lines: [R('grump', t === 0 ? "Nope. Ask me again when I like you. So, never." : "...Maybe some other time.")], go: back };
  }
  return { lines: [...L.lines, FX((G) => { S.talked.lore = i + 1; G.friend(L.f); })], go: back };
};

DATA.hang = [
  [
    [R('grump', "You're just gonna... stand there? Great. Love that for me."), R('grump', "Fine. Don't touch anything shiny.")],
    [R('grump', "I charge for company."), C('surprised', "Really?"), R('smirk', "No. I just don't offer it.")],
  ],
  [
    [R('grump', "Hand me the ten mil. No, the other ten mil."), C('neutral', "They're the same wrench."), R('shock', "They are NOT the same wrench.")],
    [R('grump', "You hum when you think. You know that?"), C('surprised', "I do not."), R('smirk', "You're doing it right now.")],
    [R('grump', "Hold this. ...By the handle. Who holds a wrench like that?"), C('smug', "Someone who just fixed your radio?"), R('grump', "...Hold it however you want.")],
  ],
  [
    [R('smirk', "For a crash pilot, you're not totally useless, lynx."), C('happy', "Was that a compliment?"), R('grump', "It was an observation. Don't frame it.")],
    [R('soft', "Pass me that rag. ...Thanks."), C('surprised', "Did you just say thanks?"), R('grump', "I say thanks. I'm not an animal. ...Okay, technically.")],
  ],
  [
    [R('soft', "Place is less quiet with you around."), R('grump', "That's a complaint. Mostly.")],
  ],
  [
    [R('soft', "Stay as long as you want, lynx. Place feels wrong without you now."), R('grump', "...Don't quote me.")],
  ],
];
D.hang = (G) => {
  const S = G.S, t = G.tier();
  const n = S.talked.hang || 0;
  const lines = [...pick(DATA.hang[Math.min(t, DATA.hang.length - 1)])];
  if (n >= 3 && t < 2 && Math.random() < .5) lines.push(R('grump', "Don't you have a ship to fix?"));
  lines.push(FX((G) => { S.talked.hang = n + 1; if (n < 3) G.friend(2); }));
  return { lines };
};

D.retPry = (G) => ({
  lines: [
    R('shock', "...It's straight. You brought it back straight."),
    R(G.tier() >= 1 ? 'smirk' : 'grump', G.tier() >= 1 ? "Huh. Look at you." : "Huh."),
    FX((G) => G.returnItem('pry_bar')),
  ],
});
D.retMitts = {
  lines: [
    R('smirk', "Back on the couch. Where they belong. Obviously."),
    FX((G) => G.returnItem('oven_mitts')),
  ],
};

// --- Radio job -------------------------------------------------------------
D.radioFix = (G) => ({
  lines: [
    N("You pop out the burnt fuse, slot in the ship-grade one, and give the radio a gentle smack."),
    N("Music crackles to life. Something slow and warm, with a lonely slide guitar."),
    R('shock', "...Huh."),
    R('grump', "It works."),
  ],
  choices: [
    { t: "You're welcome.", f: 2, say: [R('smirk', "Didn't say thanks."), R('grump', "...Fifteen credits. Don't let it go to your head.")] },
    { t: "Bet you missed having music.", f: 4, say: [R('soft', "...Yeah. Gets real quiet out here."), R('grump', "Fifteen credits. And quit looking at me like that.")] },
  ],
  end: (G) => G.finishRadio(),
});

// --- Fuel cell done + the first friendship moment --------------------------
D.fuelDone = (G) => ({
  lines: [
    N("The fuel cell hums. A soft teal glow spills across the garage."),
    R('shock', "...Huh."),
    R(G.tier() >= 2 ? 'soft' : 'grump', "Clean welds. Tight seals. Who taught you to work like that?"),
  ],
  choices: [
    { t: "My dad. He fixed ships, back home.", f: 3, say: [R('soft', "...He did good."), R('grump', "With you, I mean. Not the ship. The ship's a disaster.")] },
    { t: "Holo-tutorials. Lots and lots of holo-tutorials.", f: 2, say: [R('smirk', "Course. Kids today.")] },
    { t: "I've been watching you. You're good at this.", f: 3, say: [R('shock', "..."), R('grump', "Don't get sappy on me. We've got four more systems to go.")] },
  ],
  end: (G) => G.nightScene(),
});

D.noodles = {
  lines: [
    N("Racket drops onto the couch beside you and holds out a steaming cup of noodles."),
    R('grump', "Here. Don't make it weird."),
    C('surprised', "You made me dinner?"),
    R('grump', "I boiled water. Twice. I wasn't gonna eat in front of you. I'm not a monster."),
  ],
  choices: [
    { t: "Thank you, Racket. Really.", f: 3, say: [R('soft', "...Yeah, yeah. Eat before it gets cold.")], go: 'noodles2' },
    { t: "These are surprisingly good!", f: 2, say: [R('smirk', "It's the hot sauce. Secret recipe. The secret is more hot sauce.")], go: 'noodles2' },
    { t: "Careful. I might start thinking you like me.", f: 2, say: [R('shock', "..."), R('grump', "Eat your noodles.")], go: 'noodles2' },
  ],
};
D.noodles2 = (G) => {
  const t = G.tier(), radio = G.S.flags.radioFixed;
  return {
    lines: [
      N(radio ? "For a while there's just the radio, the crickets, and a whole lot of slurping." : "For a while there's just the crickets, and a whole lot of slurping."),
      R(t >= 2 ? 'soft' : 'grump', t >= 2 ? "Hey. Lynx. ...You did good today." : "...You didn't completely blow it today. That's something."),
      N("He digs in a pocket and tosses something into your lap. A key, on a little raccoon keychain."),
      R('grump', "Spare key. So you stop knocking. The knocking's worse than you being here."),
      C('happy', "Racket... is this a raccoon keychain?"),
      R('grump', "It came with the key."),
      C('smug', "Keys don't come with—"),
      R('shock', "IT CAME WITH THE KEY."),
      FX((G) => G.give('garage_key')),
      R('grump', "Get some sleep. Tomorrow we hit the junkyard. Those thrusters won't scavenge themselves."),
      R(t >= 2 ? 'soft' : 'grump', t >= 2 ? "Night, lynx." : "...Night."),
    ],
    end: (G) => G.phaseEnd(),
  };
};

// ---------------------------------------------------------------------------
// BANTER — speech bubbles Racket mutters when you hang around the garage
// ---------------------------------------------------------------------------
DATA.idle = [
  ["*grumbles at a carburetor*", "Who keeps moving my wrench? ...Oh. Me. I do.", "Don't touch that. Or that. Or— just don't touch.", "Mushroom patch. Three years. Just saying.", "*clank* ...Nobody saw that."],
  ["You still here? ...Okay.", "*mutters something about fuel ratios*", "If you're gonna stand there, at least look busy.", "Radio's better than silence. Don't tell it I said that."],
  ["Hey lynx, hand me that. ...No, the OTHER that.", "Hm. Not bad. The engine, I mean. Not you. ...You're also not bad.", "*hums along with the radio, badly*", "You hungry? I'm not offering. Just asking."],
  ["Lynx, c'mere, look at this gasket. Isn't it beautiful? ...Don't laugh.", "You're gonna miss this place. ...Or whatever."],
  ["Hey lynx. Pass the grease. ...And stay a while.", "*hums, then catches you listening and stops. Then keeps humming.*"],
];

// Racket's reaction when you hand him an item
DATA.giveRacket = {
  datapad: "Put your cloud pictures away. ...Okay, that one's nice. Put it away.",
  hull_scrap: "I've got my own garbage, thanks. Sell it on JunkNet.",
  antenna: "That's not an antenna anymore. That's modern art. Sell it.",
  spare_fuse: "Ship-grade fuse? Wasted on a starship. ...My radio, on the other hand.",
  cell_casing: "Don't hand ME parts. Hand the workbench parts.",
  charge_crystal: "Get that thing away from my whiskers. Workbench.",
  wiring: "Chewed. Classic possum. It'll work. Workbench.",
  garage_key: "It's yours. Keep it. Quit waving it at me.",
  pry_bar: "Keep it till you've dug out that casing. THEN bring it back. Straight.",
  oven_mitts: "Mitts are for crystals. Go get a crystal.",
};

// ---------------------------------------------------------------------------
// JUNKNET listings (Racket's sketchy parts marketplace)
// ---------------------------------------------------------------------------
DATA.listings = [
  { id: 'wiring', name: 'Copper Wiring Harness (lightly chewed)', price: 35, seller: 'possum_pete', stars: 3,
    blurb: "Works great!! Previous owner was a space possum. He's fine. The harness is fine. Everyone is fine." },
  { id: 'thrusters', name: 'Thruster Nozzle Set', status: 'OUT OF STOCK', seller: 'scrapqueen_vex', stars: 5,
    blurb: "Seller note: 'try the junkyard, cheapskate.'" },
  { id: 'nav', name: "Navigation Chip (definitely not stolen)", price: 400, status: 'UNAVAILABLE', seller: 'not_a_pirate_77', stars: 1,
    blurb: "Seller is currently 'evading some light authorities.' Check back later." },
  { id: 'muffler', name: 'Quantum Muffler', price: 9999, seller: 'LuxuryParts™', stars: 4,
    blurb: "Makes your ship sound like a sad trombone. Mandatory in three star systems." },
  { id: 'mystery', name: 'Mystery Box', status: 'SOLD OUT', seller: '???', stars: 2,
    blurb: "Contents: regret. Top review: 'Got a smaller mystery box inside.'" },
];

DATA.jobs = [
  { id: 'radio', title: 'FIX MY RADIO', body: "It only plays static and sadness. Needs a fuse.", reward: '15 cr' },
  { id: 'bolts', title: 'SORT THE BOLT BIN', body: "Small. Medium. Large. Don't ask about the sock.", reward: '10 cr' },
  { id: 'scrap', title: 'HAUL SCRAP', body: "Your wreck littered my woods. Sell the scrap on JunkNet. Keep the money. Clean my woods.", reward: '8 cr each' },
];

DATA.stationLines = [
  "♪ WKRK Moonlight. Slow tunes for slow nights.",
  "♪ Banjo Bop FM. All banjo, all the time. No refunds.",
];
