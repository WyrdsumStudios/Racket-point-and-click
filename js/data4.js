/* Racket's Garage — data4.js
 * Phase 4: the Canyon and the hull plating. A road trip with Vex, the wreck of the luxury liner
 * Gilded Gull and its very polite robot steward, a hull plate that goes mysteriously missing,
 * and the engine core's new noise getting worse.
 * STEWARD-9 speaks as 's'.
 */
const ST = (mood, text) => ['s', mood, text];

Object.assign(DATA.items, {
  hull_plates: { name: (G) => (G.S.flags.plateFound ? 'Hull Plates (3)' : 'Hull Plates (2... ?)'), r: (G) => (G.S.flags.plateFound ? "Three hull plates off the Gilded Gull. Fancy metal. Fancier than your ship deserves." : "Two hull plates. Vex loaded three. Must've fallen off the truck. Tragic. Anyway.") },
  gold_rivets: { name: 'Gold Rivets', r: "Gold-plated rivets from a luxury liner's purser desk. Ridiculous. They'll hold. Don't tell Vex we're using gold as hardware." },
  rivet_gun: { name: 'Rivet Gun', r: "My rivet gun. Older than you. Louder than you. Treat her with respect." },
  moss_sealant: { name: 'Mossback Moss', r: "Moss off a mossback. Seals anything it touches, and it glows. Nature's sealant. Smells like a wet nap." },
  boarding_pass: { name: 'Commemorative Boarding Pass', r: "A souvenir boarding pass for the Gilded Gull. Collector's edition. The robot down there might actually accept it. Robots love paperwork." },
});
Object.assign(DATA.giveRacket, {
  hull_plates: "Workbench. ...Don't count them in front of me.",
  gold_rivets: "Gold rivets. Ugh. Fine. They're good rivets.",
  rivet_gun: "My gun. Workbench. Ears covered.",
  moss_sealant: "Mossback moss! You groomed a mossback? Respect.",
  boarding_pass: "Take that to the robot. Robots love paperwork.",
});
Object.assign(DATA.giveVex, {
  hull_plates: "Liner plates. Gorgeous. I'd frame them. Racket will rivet them. Philistine.",
  gold_rivets: "GOLD. RIVETS. ...I'm going to need you to stop showing me those.",
  boarding_pass: "Show it to the tin can, not me.",
  moss_sealant: "Moss. Not shiny. Pass.",
});

DATA.repairs.hull = {
  name: 'Hull Plating',
  parts: [
    { key: 'plates', item: 'hull_plates', name: 'Hull plates (3)', where: 'The Gilded Gull wreck, at the bottom of the canyon.' },
    { key: 'sealant', item: 'moss_sealant', name: 'Mossback moss sealant', where: 'The sleeping mossback in the Deep Woods sheds it when groomed. Gently.' },
  ],
};

DATA.listings.push(
  { id: 'pass', name: 'Gilded Gull Commemorative Boarding Pass', price: 30, seller: 'gull_fan_club', stars: 5, phase: 4,
    blurb: "Collector's edition! Gold foil! Mint condition! Will not actually get you on a boat that sank forty years ago. Probably." },
  { id: 'core', name: 'Engine Core (slightly haunted)', price: 9999, seller: 'not_a_pirate_77', stars: 1, phase: 4,
    blurb: "Makes a noise. Then a different noise. Then a third noise we don't talk about." },
  { id: 'tour', name: 'Guided Tour of the Gilded Gull', status: 'SOLD OUT', seller: 'gull_tours', stars: 4, phase: 4,
    blurb: "Sold out since the ship sank. Refunds pending. Forty years pending." },
);
DATA.jobs.push(
  { id: 'bolts4', title: 'BOLT BIN IV', body: "I built a conveyor belt. Don't ask why. Sort what comes down it. The socks ride free.", reward: '16 cr', game: 'bolts4', phase: 4 },
);

// ---------------------------------------------------------------------------
// DIALOGUE
// ---------------------------------------------------------------------------
D.hintHull = (G) => {
  const S = G.S, F = S.flags, lines = [];
  const back = () => { G.tmp.again = true; return 'hub'; };
  if (!F.canyonSeen) { lines.push(R('grump', "Hull plating. Something huge went down in the canyon forty years ago. The Gilded Gull. A luxury liner."), R('smirk', "Nobody's salvaged it, because nobody can get down there. Map. Canyon. Vex will probably insist on coming. She hears 'gold trim' from three valleys away.")); return { lines, go: back }; }
  if (!F.bridgeFixed) lines.push(R('grump', "Bridge is out? Vex knows knots. Magpie thing. Let her teach you. Try not to roll your eyes, she can hear it."));
  if (F.bridgeFixed && !F.boarded) lines.push(R('smirk', F.passBought || G.has('boarding_pass') ? "Got a boarding pass? Show it to the robot. Robots love paperwork." : "A robot steward won't let you aboard without a pass? Ha. JunkNet sells everything. Check for a souvenir one."));
  if (F.boarded && !F.platesGot) lines.push(R('grump', "Cut the plates off the hull with the torch. Vex's winch can haul them up. She'll complain the whole time. Let her."));
  if (F.boarded && !F.rivetsGot) lines.push(R('grump', "And rivets. A liner that fancy'll have spares somewhere. The purser's desk, maybe."));
  if (!F.gunTaken) lines.push(R('grump', "Rivet gun's on the pegboard. She kicks. Hold her like you mean it."));
  if (!F.mossTaken && !S.parts.sealant) lines.push(R('soft', "For sealant: the mossback in the Deep Woods. Its moss seals anything. It sheds when you groom it. Gently."));
  if (F.platesGot && F.plateMissing && !F.plateFound) lines.push(R('grump', "The third plate? ...Probably fell off the truck. Happens. Don't look at me like that."), R('grump', "...Don't wave the scanner at me either."));
  if (!lines.length) lines.push(R('grump', "Workbench. Plates, moss, rivets. Then we pressure-test her. Then... yeah. Then the engine core."));
  return { lines, go: back };
};

D.toCanyon = {
  lines: [
    N("A horn blares outside. Vex's truck, piled high with rope, winches and empty crates."),
    V('delight', "KID! Canyon trip! I heard there's a whole luxury liner down there with gold trim on EVERYTHING."),
    R('grump', "The Gilded Gull. Went down forty years ago. Nobody's salvaged her because nobody can get down there."),
    V('smug', "Nobody had ME."),
    R('grump', "I'm staying. The engine core's making the noise again. Somebody has to stand here and glare at it."),
    R('soft', "...Bring her back in one piece, Vex."),
    V('smug', "Which one, the kid or the hull plates?"),
    R('grump', "VEX."),
  ],
};
D.canyonIntro = {
  cast: ['v', 'c'],
  lines: [
    N("The canyon opens up below you like a crack in the world, striped red and teal. Far, far down, something gold glints."),
    V('delight', "There she is. The Gilded Gull. Forty years of nobody touching her trim."),
    V('annoyed', "...And the bridge is out. Of course. Good thing magpies are excellent at knots. Grab the rope from my truck."),
  ],
};
D.vexCanyon = (G) => {
  const F = G.S.flags;
  const back = () => { G.tmp.vexAgain = true; return 'vexCanyon'; };
  const greet = G.tmp.vexAgain ? 'What else?' : !F.bridgeFixed ? "Rope's in the truck. Bring it to the bridge and I'll teach you." : !F.boarded ? "That tin can down there won't let us aboard. Rude." : !F.platesGot ? "Cut 'em loose and I'll winch 'em up." : "We got what we came for. Mostly. I may have pocketed a doorknob. A gold one.";
  G.tmp.vexAgain = false;
  return {
    cast: ['v', 'c'],
    lines: [V('smug', greet)],
    choices: [
      { t: "Why'd you really come along?", if: () => !G.S.talked.vexWhy, say: [V('neutral', "...Gold trim. Obviously."), V('neutral', "And Racket doesn't leave that garage. Hasn't in twenty years. Somebody has to keep you from falling in a canyon on his behalf."), V('smug', "He'd be unbearable. More unbearable."), FX((G) => { G.S.talked.vexWhy = true; })], go: back },
      { t: "Has Racket said anything about... after the ship's fixed?", if: () => G.S.flags.platesGot, say: [V('neutral', "He doesn't say. He does. Have you noticed he's been fixing your ship slower lately?"), V('smug', "I've seen that raccoon rebuild a hauler in a weekend. Just saying.")], go: back },
      { t: "See you up top.", say: [V('smug', "Mind the edge. It's a long way down and I'm not climbing after you.")] },
    ],
  };
};

D.stewardMeet = (G) => {
  const F = G.S.flags, pass = G.has('boarding_pass');
  return {
    cast: ['s', 'c'],
    lines: F.stewardMet ? [ST(pass ? 'happy' : 'polite', pass ? 'Ah! A passenger with documentation! May I?' : 'Welcome back! Have you located your boarding pass? I shall wait. I am very good at waiting. I have been waiting forty years.')] : [
      N("A tall, polished robot in a faded sash steps out of the gangway with a soft whirr. One teal eye blinks on."),
      ST('polite', "Welcome aboard the Gilded Gull! I am STEWARD-9, at your service."),
      ST('polite', "We are currently experiencing a minor delay of... forty years, three months and eleven days. Thank you for your patience."),
      ST('polite', "May I see your boarding pass?"),
      V('shock', "It's still RUNNING?"),
      ...(pass ? [] : [C('neutral', "Um. We don't have one."), ST('alarm', "I am terribly sorry. Passengers must present a valid boarding pass. The gift shop is... (static) ...closed."), V('smug', "Can I bribe you?"), ST('polite', "Bribery is not accepted, madam. Tips are."), C('happy', "...A gift shop pass. Like a souvenir one. I bet JunkNet has one.")]),
      FX((G) => { G.S.flags.stewardMet = true; }),
    ],
    choices: pass ? [{ t: "(Hand over the commemorative boarding pass.)", go: 'stewardBoard' }] : [{ t: "We'll be back.", say: [ST('polite', 'I shall be here. Forever, presumably.')] }],
  };
};
D.stewardBoard = {
  cast: ['s', 'v', 'c'],
  lines: [
    ST('polite', "Scanning... Commemorative edition. Gold foil. Mint condition."),
    ST('happy', "Most valid! Welcome aboard, Ms. Lynx. And... guest."),
    V('annoyed', "GUEST?!"),
    ST('polite', "The cargo deck is off-limits, but the exterior hull plating is, I'm sad to say, no longer structurally required. Please, take what you need."),
    ST('polite', "And do visit the purser's desk. I believe there are spare rivets. Gold-plated. We were a very fancy ship."),
    V('delight', "Gold. Plated. Rivets. ...I think I'm in love with a robot."),
    FX((G) => G.board()),
  ],
};

D.plateMissing = {
  lines: [
    N("Back at the garage, you lean the plates against the bench and count them."),
    C('surprised', "One... two... Racket, Vex loaded THREE plates. I watched her."),
    R('grump', "Huh. Must've fallen off the truck. Tragic. Anyway."),
    N("He immediately becomes very interested in a perfectly clean wrench."),
    C('smug', "...Uh huh."),
  ],
  end: (G) => G.plateMissingDone(),
};
D.plateConfession = (G) => ({
  lines: [
    N("The scanner pings under the workbench. Behind a box of rags: the third plate. Racket doesn't even pretend to be surprised."),
    R('soft', "...Okay. I hid it."),
    R('soft', "Every part we fix, that ship gets a little closer to flying. And when it flies... you go with it."),
    R('soft', "This place was quiet for twenty years. I was fine with quiet. Then you crashed into my mushrooms, and now quiet sounds terrible."),
    R('grump', "It was a stupid thing to do. I know it was stupid. I'm a grown raccoon hiding sheet metal under a workbench."),
  ],
  choices: [
    { t: "Racket. I'd come back. Every time.", f: 3, say: [R('shock', "..."), R('soft', "...Yeah?"), R('soft', "...Okay. Okay. Good. That's— good.")], go: 'plateConfession2' },
    { t: "You know you could come with me, right?", f: 3, say: [R('shock', "Me? Leave the garage?"), R('soft', "...Huh. Nobody's ever asked me that."), R('grump', "Don't ask me that while I'm emotional. Ask me when there's an engine core.")], go: 'plateConfession2' },
    { t: "Let's not think about that yet. Let's just fix her. Together.", f: 3, say: [R('soft', "...Together. Yeah. I can do together.")], go: 'plateConfession2' },
  ],
});
D.plateConfession2 = {
  lines: [
    R('grump', "Take the plate. Fix your ship. And never tell Vex about this."),
    N("Somewhere outside, a truck horn honks twice. Very smugly."),
    R('grump', "...She already knows. Of course she knows."),
  ],
  end: (G) => G.plateFoundDone(),
};

D.hullDone = {
  cast: ['r', 'v', 'c'],
  lines: [
    N("The pressure gauge holds steady. Not a single hiss. The Dandelion's hull gleams, gold rivets and all."),
    R('smirk', "Airtight. Fancy. Ridiculous. Perfect."),
    N("Vex lets herself in through the bay door without knocking, carrying a bag of sprinkles."),
    V('delight', "I heard a pressure test! I brought sprinkles! It's a party!"),
    R('grump', "Nobody said party."),
    V('smug', "Kid. Make the drinks. Something shiny for me. Something gross for him."),
  ],
  choices: [
    { t: "One French Vanilla Monstrosity, coming up.", say: [N("You make it exactly right. Racket takes it, sniffs it, and drinks the whole thing without breathing."), V('shock', "...Three creamers? Is that—"), V('delight', "IS THAT THE MONSTROSITY? I KNEW IT! TWENTY YEARS I'VE SUSPECTED!"), R('grump', "I don't know what you're talking about. This is regular coffee. For adults.")], go: 'hullDone2' },
    { t: "Sprinkles for everyone. Even Racket.", say: [N("Racket looks at the rainbow sprinkles on his mug for a long, long time."), R('grump', "...It looks like a disco."), N("He drinks it anyway. He has sprinkles on his whiskers. Nobody tells him."), V('delight', "Nobody tell him.")], go: 'hullDone2' },
  ],
};
D.hullDone2 = {
  lines: [
    N("For a while it's just the three of you, the radio, and the Dandelion gleaming in the bay."),
    N("Then, from deep inside the ship: KA-THUNK. Whirrrrr. Clank... clank... CLANK."),
    N("A puff of teal sparks drifts out of the engine housing."),
    R('shock', "..."),
    V('neutral', "...What was that."),
    R('grump', "That's the new noise."),
    R('soft', "...That's not a good noise."),
  ],
  end: (G) => G.phaseEnd(4),
};

DATA.idle4 = [
  ['*glares at the engine core*'],
  ['*glares at the engine core. It clanks. He glares harder.*'],
  ["Vex texted me a picture of a gold doorknob. Thirty times.", '*listens to the engine core, frowning*'],
  ["Hey lynx. ...Nice rivets. On the ship, I mean. You did good.", "*hums, then catches himself, then keeps humming*"],
  ["Hey lynx. Thanks for not making it weird. The plate thing. ...Okay, you made it a LITTLE weird.", "*listens to the engine core. It clanks. He pats it like a nervous horse.*"],
];
