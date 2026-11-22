/* Racket's Garage — data5.js
 * Phase 5 (finale): the engine core. Racket is scared of it. The roof talk, the crate, STEWARD-9's
 * paperwork, the ignition at the Old Hangar, the test flight, three endings, credits and free play.
 */

Object.assign(DATA.items, {
  core_regulator: { name: "Long Shot's Core Regulator", r: "The Long Shot's core regulator. Same model as yours. It's the one part that didn't fail that day. I kept it. I don't know why I kept it. ...I know why I kept it." },
  flux_coil: { name: 'Gilded Gull Flux Coil', r: "A flux coil off a luxury liner. Gold-wound. Released in triplicate. That robot is the most organised thing on this moon." },
});
Object.assign(DATA.giveRacket, {
  core_regulator: "...Workbench. Please. Don't make me hold it.",
  flux_coil: "Gold-wound coil. Fancy. Workbench.",
});
Object.assign(DATA.giveVex, {
  core_regulator: "...That's from the Long Shot. He opened the crate? For you? ...Kid. He really loves you. Don't tell him I said love.",
  flux_coil: "GOLD-WOUND. I'm going to need you to put that away before I do something I regret.",
});

DATA.repairs.core = {
  name: 'Engine Core',
  parts: [
    { key: 'regulator', item: 'core_regulator', name: "Long Shot's core regulator", where: "Racket keeps it in a locked crate behind the garage. It's his to open." },
    { key: 'coil', item: 'flux_coil', name: 'Replacement flux coil', where: 'STEWARD-9 on the Gilded Gull will release one. With the correct paperwork. In triplicate.' },
  ],
};

DATA.listings.push(
  { id: 'calm', name: 'Calming Tea for Nervous Mechanics', price: 12, seller: 'featherhug_88', stars: 5, phase: 5,
    blurb: "For a friend. Not for me. My friend is a raccoon. Don't make it weird." },
  { id: 'form', name: 'Blank Form 27-B/6 (pack of 3)', status: 'OUT OF STOCK', seller: 'gull_lines_admin', stars: 5, phase: 5,
    blurb: "Out of stock for forty years. Please ask your nearest steward. He has a drawer full." },
);

// ---------------------------------------------------------------------------
// DIALOGUE
// ---------------------------------------------------------------------------
D.coreTalk = {
  lines: [
    R('grump', "The engine core. Yeah."),
    N("He picks up a wrench that is already spotless and starts polishing it."),
    R('soft', "It's the same model, lynx. Same make, same year, same noise. The one in the Long Shot made that exact KA-THUNK the morning she went down."),
    R('grump', "So we're gonna fix it. Properly. And we're gonna test it somewhere with room to fail. The old hangar, up the hill out back. Vex and me used to launch from there."),
    R('grump', "It needs a regulator and a coil. I'll... think about the regulator."),
    N("He polishes the wrench harder."),
  ],
  choices: [
    { t: "You're scared of it. That's okay.", f: 2, say: [R('shock', "I'm not— "), R('soft', "...Yeah. I'm scared of it. Happy?"), R('soft', "...Thanks for saying it's okay.")] },
    { t: "We'll do it together. Like everything else.", f: 2, say: [R('soft', "...Together. Yeah. You keep saying that. I keep liking it.")] },
  ],
  end: (G) => { G.S.flags.coreTalked = true; G.ui.say('r', "Coffee maker's making a weird noise too. Everything's making noises. I hate noises.", 600); },
};

D.hintCore = (G) => {
  const S = G.S, F = S.flags, lines = [];
  const back = () => { G.tmp.again = true; return 'hub'; };
  if (!F.coreTalked) return { lines: [R('grump', "...The core. Right. Ask me properly. Use the other option. I need a second.")], go: back };
  if (!S.parts.regulator && !G.has('core_regulator')) {
    if (!F.crateOpened) lines.push(R('soft', "Regulator. I have one. In a crate. Out back. Locked."), R('grump', "...Ask me about the crate when you're ready to make me open it."));
  }
  if (!S.parts.coil && !G.has('flux_coil')) lines.push(R('grump', "Coil. A liner as fancy as the Gilded Gull carried spare flux coils. That robot'll want paperwork. Lots of paperwork."));
  if (!F.corePrimed || !F.coreTuned) lines.push(R('smirk', "Then we prime her from your fuel cell, the one from day one, and tune her to the star chart. Everything we fixed, it all comes back around."));
  if (F.coreBuilt) lines.push(R('soft', "She's built. Up to the hangar. ...I'll meet you there. Give me a minute."));
  if (!lines.length) lines.push(R('grump', "Workbench. Spin her up. Keep the bars level. I'll... watch. From slightly further away."));
  return { lines, go: back };
};

D.crateNotYet = {
  lines: [
    R('soft', "...The crate. Yeah."),
    R('grump', "Not yet, lynx. I'm not... not yet."),
    N("He looks out the bay door, toward the roof, then at you."),
    R('soft', "Maybe after I've said some stuff I never said. To Vex. Up there. ...Forget I said that."),
  ],
};
D.crateOpen = {
  cast: ['r', 'c'],
  lines: [
    N("Racket kneels by the crate behind the garage. The key's on a string around his neck. It always was."),
    R('soft', "Okay. Okay. It's just a box."),
    N("The lid creaks open. Inside, wrapped in an old flight jacket: two stamped metal tags on a chain, RKT and VX. A faded photo of a young raccoon and a magpie with a ridiculous crest, laughing in a cockpit. And a battered little wrench."),
    R('soft', "Our crew tags. Vex left hers on the console when she took the pod. I never gave it back."),
    R('smirk', "That's my first wrench. Ten mil. The OTHER ten mil."),
    C('happy', "They're the same wrench, Racket."),
    R('laugh', "They are NOT the same wrench."),
    N("Under it all, wrapped in a rag: a heavy, teal-lined part stamped LONG SHOT."),
    R('soft', "The core regulator. Only part of her that didn't fail that day. I pulled it out of the wreck the first week and never looked at it again."),
    R('soft', "...Take it. She'd want to fly again. Even if it's in somebody else's ship."),
    FX((G) => G.give('core_regulator')),
  ],
  choices: [
    { t: "(hold the photo up next to his face) You haven't changed a bit.", f: 2, say: [R('grump', "I've got WAY more grey."), R('soft', "...Thanks, lynx.")] },
    { t: "Should Vex have her tag back?", f: 3, say: [R('soft', "...Yeah. Yeah, she should."), N("He tucks the VX tag into his pocket. For later.")] },
    { t: "(just sit with him for a minute)", f: 2, say: [N("You sit on the edge of the crate together. The crickets sing. After a while, he closes the lid. Gently.")] },
  ],
  end: (G) => G.crateDone(),
};

// --- the roof talk (optional) -----------------------------------------------
D.inviteVex = {
  cast: ['v', 'c'],
  lines: [
    C('neutral', "Vex. Come up on the garage roof tonight. Racket too. You two need to talk. Properly."),
    V('shock', "...We talked. There was a hug. It was horrible."),
    C('smug', "You had a hug. You never had the talk."),
    V('annoyed', "Ugh. You're right. I hate that you're right. ...Fine. I'll bring snacks. Shiny ones."),
    FX((G) => { G.S.flags.vexInvited = true; }),
  ],
};
D.inviteRacket = {
  lines: [
    C('neutral', "Meet me on the roof tonight. Vex is coming."),
    R('shock', "Vex? On MY roof?"),
    R('grump', "...Is this a talk? This feels like a talk. I can smell a talk."),
    R('soft', "...Fine. I'll bring the good noodles."),
    FX((G) => { G.S.flags.racketInvited = true; }),
  ],
};
D.roofTalk = {
  cast: ['r', 'v', 'c'],
  lines: [
    N("Three people on a roof. Nobody knows where to sit. Vex sits on the chimney. It's warm. She pretends that was the plan."),
    V('smug', "So. The kid says we have to Talk. Capital T."),
    R('grump', "We already talked. There was a hug."),
    V('annoyed', "It was a terrible hug."),
    R('grump', "It was a FINE hug."),
    N("Silence. A very long silence. Somewhere below, a cricket gives up."),
  ],
  choices: [
    { t: "Vex. Tell him what you told me.", f: 2, go: 'roofTalk2' },
    { t: "Racket. Start with the pod.", f: 2, go: 'roofTalk2' },
    { t: "(open the snacks loudly and wait)", f: 2, say: [N("You open a bag of Vex's shiny snacks. Crinkle. Crinkle. CRINKLE. Both of them break at once.")], go: 'roofTalk2' },
  ],
};
D.roofTalk2 = {
  lines: [
    V('annoyed', "You TOLD me to go."),
    R('soft', "I know. I'd tell you again."),
    V('annoyed', "That's the PROBLEM. You decided for both of us. And then you sat in the woods for twenty years and never once asked me for help."),
    R('soft', "...I didn't want you to see me need it."),
    V('neutral', "I'd have come. I'd have come in a heartbeat, you stubborn, stupid—"),
    R('soft', "I know. That's why I didn't ask. ...That was stupid."),
    V('smug', "Very."),
    R('soft', "Vex. ...I need help. With the core. It's the same model. My hands go shaky just looking at it. I can't do the ignition alone."),
    N("Vex looks at him for a long moment. Her crest goes soft and flat."),
    V('neutral', "...Yeah. I'll be there. Front row. Holding the fire extinguisher."),
    R('soft', "Here. You left this on the console."),
    N("He holds out a little stamped tag: VX. Vex takes it very carefully, like it might fly off."),
  ],
  choices: [
    { t: "Group hug?", f: 3, say: [V('annoyed', "Absolutely not."), R('grump', "Never."), N("Thirty seconds later, it is absolutely a group hug. Nobody will ever speak of it. Pip, on the chimney, sees everything.")] },
    { t: "(quietly let them have this)", f: 3, say: [N("You look at the stars and let them have their moment. Out of the corner of your eye: Vex bumping her shoulder into his. Him bumping back.")] },
  ],
  end: (G) => G.roofTalkDone(),
};

// --- STEWARD-9 and the coil -------------------------------------------------
D.stewardCoil = {
  cast: ['s', 'c'],
  lines: [
    ST('polite', "Welcome back, Ms. Lynx! How may I serve you?"),
    C('neutral', "We need a flux coil for an engine core. The ship's very important. To someone very important."),
    ST('happy', "A flux coil! We have several. Gold-wound. Very fancy."),
    ST('polite', "To release ship's property, I shall require Form 27-B/6, Request for Release of Ship's Property."),
    ST('polite', "In triplicate."),
    C('surprised', "...Triplicate?"),
    ST('happy', "White, yellow and pink. Each copy has its own small rules. I have a drawer full of blanks. I have been waiting forty years for someone to fill one in."),
  ],
  end: (G) => G.startForms(),
};

// --- ignition + flight + ending ----------------------------------------------
D.ignition = {
  cast: ['r', 'v', 'c'],
  lines: [
    N("The fog rolls over the hilltop. The Dandelion sits on the old launch rail, engine core glowing teal. Vex stands by the control tower with a fire extinguisher she clearly brought for emotional support."),
    R('soft', "Okay. Last bolt. That's all. Just one last bolt."),
    N("He holds up his first wrench, the little ten mil from the crate. His paw is shaking so badly it rattles."),
    R('soft', "...Twenty years, and I still can't— "),
  ],
  choices: [
    { t: "(put your paw over his and steady it)", f: 3, say: [N("You put your paw over his. Together, you turn the bolt. It clicks home."), R('soft', "...Thanks, lynx.")] },
    { t: "We'll do it together. Like everything else.", f: 3, say: [N("You wrap your paw around the wrench with his. One turn. Click."), R('soft', "Together. Yeah.")] },
  ],
  end: (G) => G.startChecklist(),
};
D.testFlight = (G) => ({
  cast: ['r', 'v', 'c'],
  lines: [
    N("The Dandelion leaps off the rail, punches through the fog, and suddenly there's nothing but stars."),
    N("Racket is in the co-pilot's seat with his eyes squeezed shut, gripping the armrests so hard they creak."),
    C('happy', "Racket. Racket! Open your eyes."),
    N("He opens one eye. Below you, the whole moon glows: the teal woods, the canyon's red stripe, the junkyard floodlights, and one tiny warm light in the trees. The garage."),
    R('shock', "...Oh."),
    R('laugh', "OH! HA! HAHA! She FLIES! Lynx, she FLIES!"),
    V('delight', "Tower to Dandelion: you're both IDIOTS and it's BEAUTIFUL. Come down before I cry on the radio."),
    R('soft', "...The engine's quiet. No noise. Just humming."),
    R('soft', "Sounds like a ship that wants to go places."),
  ],
  end: (G) => G.afterFlight(),
});
D.endingChoice = (G) => ({
  cast: ['r', 'v', 'c'],
  lines: [
    N("Later, the party winds down. Empty mugs everywhere. STEWARD-9 is teaching Pip to waltz. The mossback is asleep on the launch rail."),
    N("Racket finds you by the Dandelion. He doesn't say anything for a while."),
    R('soft', "So. She flies."),
    R('soft', "...Your ship's fixed, lynx. You can go anywhere now."),
    R('grump', "Which is great. That was the deal. I fix your ship, you leave, I get my silence back. Everybody wins."),
    R('soft', "...Mostly me. Supposedly."),
  ],
  choices: [
    { t: "I'll come back. Every time.", go: 'endReturn' },
    { t: "Come with me.", go: 'endTogether' },
    { t: "I'm staying.", go: 'endStay' },
  ],
});
D.endReturn = {
  lines: [
    R('shock', "...Every time?"),
    C('happy', "Every time. You're my mechanic. Nobody else is allowed to touch her."),
    R('soft', "...Good. Nobody else would do it right anyway."),
    R('grump', "Call when you land somewhere. Every week. I'll pretend I'm busy."),
  ],
  end: (G) => G.ending('return'),
};
D.endTogether = {
  lines: [
    R('shock', "Me? Leave? The garage, the mushrooms, the..."),
    R('soft', "...Lynx, I haven't left this moon in twenty years."),
    V('annoyed', "GO, you idiot."),
    N("Vex is standing right behind you both. She has been there the whole time. She is not even pretending otherwise."),
    V('neutral', "I'll watch the garage. I'll water your stupid mushrooms. I'll sit on your stupid couch. Go."),
    R('soft', "...You'd do that?"),
    V('smug', "You told me to go once. I'm returning the favour. Properly, this time. Go see some stars, Racket."),
  ],
  end: (G) => G.ending('together'),
};
D.endStay = {
  lines: [
    R('shock', "...Staying? Here? On purpose?"),
    C('happy', "The Dandelion can be our showpiece. And you're the best mechanic on this side of the moon. The next ship that crashes into the mushrooms? We fix it together."),
    R('soft', "...Partners, then."),
    R('grump', "My name goes first on the sign."),
    C('smug', "Same size letters."),
    R('soft', "...Fine. Same size letters."),
  ],
  end: (G) => G.ending('stay'),
};

DATA.endings = {
  return: {
    title: 'Every Time',
    epilogue: 'Months later, the pegboard has a new row: postcards. Ringed planets, ice moons, a city made of glass. Each one says the same thing on the back: "Still flying. Still yours. Make noodles. -C."\n\nAnd on a quiet evening, a little cream-and-orange ship drops out of the clouds over the woods, right on time.',
    last: "You're late. ...Noodles are on. Sit down. Tell me everything. Slowly.",
  },
  together: {
    title: 'Co-Pilots',
    epilogue: 'The garage sign now reads: "BACK SOON. ASK VEX." Vex has rearranged every tool on the pegboard. She will deny it forever.\n\nSomewhere out among the stars, the Dandelion flies with a grumpy raccoon in the co-pilot seat, a photo of two co-pilots taped to the dash, and a LONG SHOT patch on a lynx\'s sleeve.',
    last: "Move over, lynx. Co-pilot's seat is mine. ...Don't touch my seat. ...Okay, you can touch my seat.",
  },
  stay: {
    title: 'Racket & Lynx',
    epilogue: 'The Dandelion gleams in the bay, polished every Sunday, the pride of the garage. Over the door, a new sign: "RACKET & LYNX · REPAIRS". Same size letters.\n\nThe first customer crashes into the mushroom patch three weeks later. Racket pretends to be furious. He is delighted.',
    last: "Then quit standing there. We've got a shop to open. ...Glad you stayed, lynx.",
  },
};

DATA.idle5 = [
  ['*cleans a tool that is already clean*', '*glares at the coffee maker. The coffee maker gurgles back.*'],
  ['*cleans a wrench that is already clean*', '"Don\'t you gurgle at me." (He is talking to the coffee maker.)'],
  ['*polishes the same bolt for the fourth time*', 'Coffee maker and I are fighting. It started it.'],
  ['*cleans a spotless wrench, then catches you watching* ...It had a smudge. Invisible smudge.', '*listens to the engine core, then very deliberately doesn\'t*'],
  ['Hey lynx. ...Thanks for not rushing me. With the core.', '*cleans a clean tool, then puts it down and just sits with you for a bit*'],
];
DATA.idleFree = [
  ['*hums the radio song*', 'Place is busy these days. I hate it. I love it. Don\'t tell anyone.'],
];
