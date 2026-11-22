/* Racket's Garage — data2.js
 * Phase 2: the Junkyard, Scrapqueen Vex, the thrusters, the test-fire and the roof.
 * Same node format as data.js. Vex speaks as 'v'.
 */
const V = (mood, text) => ['v', mood, text];

// ---------------------------------------------------------------------------
// ITEMS
// ---------------------------------------------------------------------------
Object.assign(DATA.items, {
  crane_lever: { name: 'Crane Lever Handle', r: "Big Bertha's control lever. Snapped clean off. Vex probably threw it in a tantrum. Vex has a lot of tantrums." },
  copper_sheet: { name: 'Copper Gasket Sheet', r: "Copper sheet. Soft enough to cut, tough enough to take thruster heat. Half of a good gasket." },
  gilded_hubcap: { name: 'Gilded Hubcap', r: "Gold-plated hubcap. Completely useless. Vex will lose her mind over it. She likes shiny things. It's a bird thing." },
  rubber_duck: { name: 'Space Duck', r: "A rubber duck in a tiny space helmet. Somebody loved this. Somebody also threw it in a junkyard." },
  left_boot: { name: 'One Left Boot', r: "One boot. Left. Somewhere out there, a right boot is also having a bad day." },
  mystery_can: { name: 'Unlabeled Can', r: "Could be beans. Could be coolant. Could be a tiny portal. Don't open it. Sell it to someone braver." },
  trophy: { name: 'Bowling Trophy', r: "'Second Place, Verdance Bowling League.' Second place. Ouch. Somebody wanted first." },
  bent_forks: { name: 'Bucket of Bent Forks', r: "Every fork is bent the same way. That's not a coincidence. Don't think about it too hard." },
  cutting_torch: {
    name: (G) => (G.S.flags.torchFueled ? 'Cutting Torch' : 'Cutting Torch (empty)'),
    r: (G) => (G.S.flags.torchFueled ? "Vex's old cutting torch, fueled and hissing. Cuts through metal like it's butter. Don't cut through butter. Waste of a good torch." : "Vex's old cutting torch. No fuel. A torch without fuel is just an angry stick."),
  },
  torch_fuel: { name: 'Torch Fuel Canister', r: "Pressurized torch fuel. Don't drop it. Don't sneeze near it. Find the torch it goes in." },
  thruster_nozzles: { name: 'Thruster Nozzle Set', r: "Twin thruster nozzles off an old Hauler-7. Better than the ones you crumpled. Don't tell Vex they're good." },
  noodle_cup: { name: 'Empty Noodle Cup', r: "My noodle cup. From the... noodle night. It's yours now. It's just a cup. Don't make it weird." },
  ember_resin: { name: 'Ember-Bark Resin', r: "Ember-bark resin in a noodle cup. Heat-proof, sticky, smells like burnt caramel. The other half of a good gasket." },
  gasket: { name: 'Heat-Proof Gasket', r: "Copper gasket sealed with ember resin. You cut that? ...Clean edges. Fine. It's good. It's really good." },
});
Object.assign(DATA.sellPrices, { rubber_duck: 6, left_boot: 3, mystery_can: 5, trophy: 6, bent_forks: 2 });
DATA.buyers = {
  hull_scrap: ['scrapmonger_88', 'i buy anything. ANYTHING.'],
  antenna: ['scrapmonger_88', 'i buy anything. ANYTHING.'],
  rubber_duck: ['duck_enthusiast', 'OMG is that a SPACE duck?? name your price. no wait, I name it. 6.'],
  left_boot: ['scrapmonger_88', 'one boot. sure. why not. i have a pile.'],
  mystery_can: ['definitely_not_hungry', 'i will open it. for science. and lunch.'],
  trophy: ['bowling_league_1st', "this was MINE. someone stole it in '09. ...wait, this says second."],
  bent_forks: ['spoon_guy', 'not spoons, but i respect the bend.'],
};

// Searchable piles in the junkyard: one find per search, in order.
DATA.piles = {
  tires: { name: 'Tire Mountain', finds: ['rubber_duck', 'crane_lever', 'left_boot'], empty: "Just tires now. Tires all the way down." },
  appliances: { name: 'Appliance heap', finds: ['mystery_can', 'copper_sheet', 'trophy'], empty: "A fridge, a washer and a toaster with scorch marks. Nothing useful left." },
  shiny: { name: 'Shiny pile', finds: [null, 'bent_forks', 'gilded_hubcap'], empty: "Hubcaps, foil and one very confused mirror. Nothing left worth taking.", nothing: "Mostly foil wrappers. Something gold glints deeper down." },
};

DATA.repairs = {
  fuel: { name: 'Fuel Cell', parts: DATA.parts },
  thrusters: {
    name: 'Thrusters',
    parts: [
      { key: 'nozzles', item: 'thruster_nozzles', name: 'Thruster nozzle set', where: "Junkyard, under the Hauler-7 wreck. Lift it with Vex's crane, then cut them free with a torch." },
      { key: 'gasket', item: 'gasket', name: 'Heat-proof gasket', where: 'Craft it here: copper sheet (junkyard) + ember-bark resin (woods edge).' },
    ],
  },
};

DATA.fuelPrice = 30;
DATA.listings.splice(1, 1, { id: 'thrusters', name: 'Thruster Nozzle Set', status: 'SOLD', seller: 'scrapqueen_vex', stars: 5,
  blurb: "Seller note: 'Under a wreck in my yard. Come get 'em. If you can.'" });
DATA.listings.push(
  { id: 'fuel', name: 'Cutting Torch Fuel Canister', price: 30, seller: 'scrapqueen_vex', stars: 4, phase: 2,
    blurb: "Pressurized. Don't drop it. Don't sneeze near it. No refunds if you explode." },
  { id: 'wrench', name: 'Emotional Support Wrench', price: 50, seller: 'feelings_hardware', stars: 5, phase: 2,
    blurb: "Holds you while you hold it. Fits most bolts and most feelings." },
  { id: 'boot', name: 'Right Boot (looking for left)', price: 12, status: 'SEEKING PARTNER', seller: 'lonely_cobbler', stars: 3, phase: 2,
    blurb: "One right boot. Will pay for a left one. Will cry if it's a match." },
  { id: 'keychain', name: 'Raccoon Keychain', status: 'OUT OF STOCK', seller: 'rkt', stars: 5, phase: 2,
    blurb: "Seller note: 'I'm not making more. They come with keys. Stop asking.'" },
);

DATA.jobs.push(
  { id: 'bolts2', title: 'BOLT BIN: THE SEQUEL', body: "Somebody (Vex) dumped nuts and washers in my bolt bin. Fix it.", reward: '12 cr', game: 'bolts2', phase: 2 },
  { id: 'tune', title: 'TUNE THE TOW TRUCK', body: "She's coughing. Tighten her up. Gently. She's sensitive.", reward: '12 cr', game: 'tune', phase: 2 },
  { id: 'wires', title: 'UNTANGLE MY WIRING', body: "Workbench wiring's a rat's nest. Not a figure of speech. There was a rat.", reward: '12 cr', game: 'wires', phase: 2 },
);
DATA.jobs.find((j) => j.id === 'bolts').game = 'bolts1';

// ---------------------------------------------------------------------------
// DIALOGUE
// ---------------------------------------------------------------------------
D.toJunkyard = {
  lines: [
    R('grump', "Junkyard? Fine. I'm coming. Somebody has to stop Vex from robbing you blind."),
    C('surprised', "Who's Vex?"),
    R('grump', "Nobody. An old... nobody. Get in the truck."),
  ],
};

D.vexIntro = {
  cast: ['v', 'r', 'c'],
  lines: [
    N("Floodlights buzz over mountains of scrap. A tall magpie in a welding apron leans in the doorway of a shack covered in hubcaps."),
    V('smug', "Well, well. Racket. Thought you'd died out in those woods. Hoped, a little."),
    R('grump', "Vex. Still running the galaxy's worst junkyard, I see."),
    V('smug', "Second worst. Have you seen your garage lately?"),
    V('neutral', "And who's this? Another one of your little projects?"),
  ],
  choices: [
    { t: "I'm Crystal. My ship crashed out by Racket's place.", f: 1, say: [V('smug', "Crashed near Racket. Rough week. Two disasters at once.")], go: 'vexIntro2' },
    { t: "I'm nobody's project.", f: 2, say: [V('delight', "Ha! She bites. I like her already."), R('smirk', "Don't. She'll want to keep you.")], go: 'vexIntro2' },
    { t: "Love the hubcaps.", f: 1, say: [V('delight', "Finally, someone with TASTE."), R('grump', "Don't encourage her.")], go: 'vexIntro2' },
  ],
};
D.vexIntro2 = {
  lines: [
    V('smug', "So. You need parts. Bet you can't tell a thruster from a toaster, kid."),
    R('grump', "She can."),
    N("It comes out quiet. Racket doesn't look at either of you."),
    R('grump', "She rebuilt a fuel cell yesterday. From scrap. Cleaner welds than you've ever done."),
    V('shock', "..."),
    V('smug', "Racket. Sticking up for somebody. Now I've seen everything."),
    R('grump', "I'm not sticking up. I'm correcting."),
  ],
  choices: [
    { t: "(quietly) Thanks, Racket.", f: 3, say: [R('grump', "Don't make it a thing."), R('soft', "...You're welcome.")], go: 'vexIntro3' },
    { t: "Cleaner than yours too, right?", f: 2, say: [R('smirk', "Don't push it, lynx.")], go: 'vexIntro3' },
  ],
};
D.vexIntro3 = {
  lines: [
    V('neutral', "Fine. You want thruster nozzles. The only good set on this moon is under that Hauler-7 wreck."),
    V('annoyed', "The wreck's under my crane. My crane, Big Bertha, has been dead for a month."),
    V('smug', "Get Bertha running and you can pull whatever you want out of that wreck. Fair's fair."),
    R('shock', "Fair. She said fair. Somebody write that down. It's never happened before."),
    V('annoyed', "Don't you have trees to go brood under?"),
    R('grump', "I do, actually. I'm heading back."),
    R(G => (G.tier() >= 2 ? 'soft' : 'grump'), "If she tries to sell you a 'genuine' anything, it's fake. Holler if you need me."),
    N("He stomps off toward the truck. Vex watches him go, then looks at you a little differently."),
    V('neutral', "...Huh. He used to leave without saying bye."),
  ],
  end: (G) => G.vexIntroDone(),
};

D.vexHub = (G) => {
  const S = G.S, F = S.flags;
  const greet = G.tmp.vexAgain ? pick(["What else?", "Anything else, kid?"])
    : F.reconciled ? pick(["Kid! My favourite meddler.", "If you're here to make me hug anyone else, I'm busy."])
    : F.craneLifted ? pick(["Bertha's purring. You're alright, kid.", "My favourite crane mechanic. Don't tell Racket I said that."])
      : pick(["What do you want?", "Kid. You're back.", "Make it quick, the floodlights cost money."]);
  G.tmp.vexAgain = false;
  const back = () => { G.tmp.vexAgain = true; return 'vexHub'; };
  return {
    cast: ['v', 'c'],
    lines: [V(F.craneLifted ? 'smug' : 'neutral', greet)],
    choices: [
      { t: "How do I get Big Bertha running?", if: () => !F.craneLifted, go: 'vexCrane' },
      { t: "Can I borrow your cutting torch?", if: () => !F.torchGot && !G.has('gilded_hubcap'), go: 'vexTorchAsk' },
      { t: "I found a gold hubcap for your wall.", if: () => !F.torchGot && G.has('gilded_hubcap'), go: 'vexTrade' },
      { t: "Where do I get fuel for this torch?", if: () => F.torchGot && !F.torchFueled, say: [V('smug', "JunkNet. Seller scrapqueen_vex. Great seller. Five stars. Very attractive."), V('neutral', "Thirty credits. Racket's job board'll get you there.")], go: back },
      { t: "I found something from the Long Shot.", if: () => G.has('flight_recorder'), go: 'vexRecorder' },
      { t: "Is this... your lucky washer?", if: () => G.has('lucky_washer'), run: (G) => G.giveWasher() },
      { t: "Why do you want stuff from the Long Shot wreck?", if: () => F.phase2 && !F.recorderGiven, say: [V('neutral', "...It was our ship. Mine and Racket's. Went down in those woods twenty years ago."), V('annoyed', "I don't do the woods. Too many memories, not enough hubcaps."), V('neutral', "If there's anything left in that cockpit, I want it. Bring it to me and I'll make it worth your while.")], go: back },
      { t: "What's the story with you and Racket?", if: () => !F.reconciled, go: 'vexLore' },
      { t: "Come up on the garage roof tonight. You and Racket.", if: () => F.phase4 && !F.vexInvited && !F.roofTalk, go: 'inviteVex' },
      { t: "Racket's being weird about the engine core.", if: () => F.phase4 && !F.crateOpened, say: [V('neutral', "Course he is. It's the same model as the Long Shot's. Same KA-THUNK."), V('neutral', "He kept her regulator, you know. Locked crate behind the garage. Twenty years, never opened it."), V('smug', "He'll open it when he's ready. Or after he and I finally have a real talk. Which we won't. Because he's him. ...Unless somebody makes us.")], go: back },
      { t: "So... you and Racket are good now?", if: () => F.reconciled, say: [V('smug', "We're FINE. We had one hug. It was terrible. We'll never speak of it."), V('neutral', "...He called me yesterday. To complain about a bolt. It was the nicest phone call I've had in years.")], go: back },
      { t: "Are you... scrapmonger_88?", if: () => S.sold.length > 0 && !S.talked.alias, go: 'vexAlias' },
      { t: "See you around.", say: [V('smug', pick(["Don't touch anything on your way out.", "Mind the dog. There's no dog. Mind it anyway."]))] },
    ],
  };
};
D.vexCrane = (G) => {
  const F = G.S.flags, lines = [];
  if (!F.leverIn) lines.push(G.has('crane_lever')
    ? V('neutral', "That's Bertha's lever! Stick it back in her cab. Gently. She bites.")
    : V('annoyed', "Lever snapped off last winter. I threw it... somewhere. Probably Tire Mountain. I throw a lot of things at Tire Mountain."));
  if (!F.cranePower) lines.push(V('smug', "Then the breaker box on her base. Get every breaker green. Each one flips its neighbours too, because whoever wired it was an idiot."), V('neutral', "Whoever wired it was me."));
  if (F.leverIn && F.cranePower) lines.push(V('delight', "Lever's in, power's on. What are you waiting for? Pull it!"));
  return { lines, go: () => { G.tmp.vexAgain = true; return 'vexHub'; } };
};
D.vexTorchAsk = {
  lines: [
    V('smug', "Borrow? Kid, nobody borrows. You trade."),
    V('neutral', "See my hubcap wall? One gap. Bottom row. It's been empty for six years. It needs gold."),
    V('delight', "Bring me a gold hubcap and the torch is yours. Dig around. That shiny pile's got layers."),
  ],
  go: () => { G.tmp.vexAgain = true; return 'vexHub'; },
};
D.vexTrade = {
  lines: [
    N("You hold up the gilded hubcap. Vex goes very, very still."),
    V('delight', "Ohhh. Oh, she's beautiful."),
    V('delight', "Look at that shine. Look at that RIM."),
    FX((G) => G.tradeHubcap()),
    N("She hangs it in the gap with trembling claws, then shoves a battered torch into your hands without looking away from the wall."),
    V('smug', "Torch is yours. Fuel's not included. JunkNet sells canisters. Or so I hear."),
    V('neutral', "...I sell them."),
  ],
  go: () => { G.tmp.vexAgain = true; return 'vexHub'; },
};
DATA.vexLore = [
  [
    V('neutral', "Racket and me? We ran a salvage crew. Best on this side of the moon."),
    V('smug', "He flew. I haggled. We made a lot of money and spent it on really bad food."),
    C('surprised', "So what happened?"),
    V('neutral', "His ship went down over the ridge. I was on it. ...Until I wasn't. He hasn't told you."),
    V('neutral', "...Course he hasn't. Not my story, kid."),
  ],
  [
    V('neutral', "He used to laugh. Loud, dumb, honking laugh. Scared birds out of trees. Scared ME out of trees."),
    V('smug', "Haven't heard it in years."),
    V('neutral', "If you ever hear it? You did something right."),
  ],
];
D.vexLore = (G) => {
  const i = G.S.talked.vexLore || 0;
  const back = () => { G.tmp.vexAgain = true; return 'vexHub'; };
  if (i >= DATA.vexLore.length) return { lines: [V('annoyed', "That's all you get. Go ask him. He might even answer you.")], go: back };
  return { lines: [...DATA.vexLore[i], FX((G) => { G.S.talked.vexLore = i + 1; })], go: back };
};
D.vexAlias = {
  lines: [
    V('shock', "..."),
    V('neutral', "I have no idea what you're talking about."),
    V('smug', "...Don't tell anyone. It's bad for my reputation to pay that well."),
    FX((G) => { G.S.talked.alias = true; }),
  ],
  go: () => { G.tmp.vexAgain = true; return 'vexHub'; },
};
DATA.giveVex = {
  rubber_duck: "A space duck? ...Sell it on JunkNet. Some weirdo will pay six for it. Not me. I'm not the weirdo.",
  left_boot: "I have four hundred left boots. Sell it. Somebody online is looking for a partner boot.",
  mystery_can: "Don't open that in my yard.",
  trophy: "Second place. I know the feeling. Racket always got first.",
  bent_forks: "Those were straight when I threw them out. I swear.",
  crane_lever: "Bertha's lever! Put it in her cab, not in my face.",
  copper_sheet: "Good copper. Cut it right and it'll seal a thruster. Racket can show you. Or not. He's a terrible teacher.",
  cutting_torch: "It's yours now. No returns. No refunds. No take-backsies.",
  thruster_nozzles: "Hauler-7 nozzles. Good metal. Tell Racket I said they're the best on the moon. Watch his face.",
  garage_key: "He gave you a KEY? ...With a raccoon keychain? Oh, that's adorable. That's disgusting. That's adorable.",
  datapad: "Cloud pictures? Seriously? ...That one's nice.",
};

// --- Racket, Phase 2 additions ---------------------------------------------
D.hintThrusters = (G) => {
  const S = G.S, F = S.flags, lines = [];
  const back = () => { G.tmp.again = true; return 'hub'; };
  if (!F.vexMet) { lines.push(R('grump', "Thrusters need nozzles. Only good set's at the junkyard. Map. I'll come with you, apparently. Don't make it weird.")); return { lines, go: back }; }
  if (!F.craneLifted) {
    if (!F.leverIn) lines.push(R('grump', G.has('crane_lever') ? "You've got Bertha's lever. Stick it in her cab." : "Bertha needs her control lever. Vex probably threw it at a pile. She throws things at piles."));
    if (!F.cranePower) lines.push(R('smirk', "And her breaker box is a puzzle. Every switch flips its neighbours. Vex loves a puzzle she can make somebody else do."));
    if (F.leverIn && F.cranePower) lines.push(R('grump', "Lever's in, power's on. Go pull the lever. Stand back."));
  }
  const haveNoz = S.parts.nozzles || G.has('thruster_nozzles');
  if (!haveNoz) {
    if (!F.torchGot) lines.push(R('grump', "Those nozzles'll be welded to the wreck. You need a cutting torch. Vex has one. She'll want something shiny. She always wants something shiny."));
    else if (!F.torchFueled) lines.push(R('grump', () => `Torch is empty. JunkNet sells fuel, ${DATA.fuelPrice} credits. You've got ${S.credits}. Job board's got new chores. You're welcome.`));
    else if (F.craneLifted) lines.push(R('smirk', "Torch is fueled, wreck's up. Go cut those nozzles free. Gently. Like they're mine."));
  }
  const haveGasket = S.parts.gasket || G.has('gasket');
  if (!haveGasket) {
    const copper = G.has('copper_sheet'), resin = G.has('ember_resin');
    if (!copper) lines.push(R('grump', "Gasket needs heat-proof stuff. Copper sheet for the shape. Junkyard's full of old appliances. Copper's inside."));
    if (!resin) {
      if (!F.cupTaken && !G.has('noodle_cup')) lines.push(R('soft', "And ember-bark resin for the seal. It grows at the edge of the woods. Hard as glass till you heat it, then it drips. Bring something to catch it."), R('grump', "...My old noodle cup's on the couch. Take it. Don't make it weird."));
      else lines.push(R('grump', "Ember-bark resin. Edge of the woods, past your crash site. Heat it with the torch, catch it in the cup."));
    }
    if (copper && resin) lines.push(R('grump', "Copper and resin. Workbench. Cut the gasket. Measure twice."));
  }
  if (haveNoz && haveGasket) lines.push(R('grump', "That's everything. Workbench. Bolt it on. Then we test-fire. Ear protection recommended."));
  if (!lines.length) lines.push(R('grump', "Keep going. You're close. I can smell it. Or that's the junkyard. Hard to say."));
  return { lines, go: back };
};

D.racketVex = (G) => {
  const n = G.S.talked.racketVex || 0;
  const back = () => { G.tmp.again = true; return 'hub'; };
  const sets = [
    [R('grump', "Vex? We flew together. Long time ago."), C('neutral', "She said you were the best crew on the moon."), R('shock', "She said that?"), R('grump', "...She's fine. Don't tell her I said fine.")],
    [R('grump', "She still has that hubcap wall? Six years she's been waiting to fill that gap."), R('smirk', "...You filled it. She's gonna like you forever now. Sorry.")],
  ];
  if (n >= sets.length || (n === 1 && !G.S.flags.torchGot)) return { lines: [R('grump', "That's enough about Vex. I've got a headache just thinking about her.")], go: back };
  return { lines: [...sets[n], FX((G) => { G.S.talked.racketVex = n + 1; if (n === 0) G.friend(2); })], go: back };
};

DATA.lore.push({
  need: 3,
  lines: [
    R('soft', "That toy rocket on the shelf? First thing I ever built. I was six. It didn't fly."),
    R('soft', "Mom kept it anyway. Said it'd fly when I was ready."),
    C('happy', "Did it?"),
    R('smirk', "It's a toy, lynx. ...But I kept it too."),
  ], f: 4,
});

DATA.giveRacket = Object.assign(DATA.giveRacket, {
  crane_lever: "That's Bertha's lever. Vex threw it, didn't she. She throws things.",
  copper_sheet: "Good copper. Gasket stuff. Hang on to it.",
  gilded_hubcap: "Oh no. Vex is gonna cry when she sees that. Happy cry. Worse than regular cry.",
  rubber_duck: "...Can I keep the duck? No. Sell it. ...Okay, sell it.",
  left_boot: "Somebody online is looking for one of those. Probably.",
  mystery_can: "Don't open it in here.",
  trophy: "Second place. Story of my life. Sell it.",
  bent_forks: "Why would you bring me this.",
  cutting_torch: "Vex gave you her torch? Huh. She must actually like you.",
  torch_fuel: "Fuel goes in the torch. Not near my face.",
  thruster_nozzles: "Hauler-7 nozzles. ...Those are good. Don't tell Vex.",
  noodle_cup: "That's my cup. ...It's your cup now. Don't make it weird.",
  ember_resin: "Ember resin! Smells like burnt caramel. Workbench. Gasket.",
  gasket: "Hand it to the workbench, not me.",
});

D.thrustersFit = {
  lines: [
    N("Racket hauls the bay door all the way open and drags two chairs to a safe distance. Then a third chair, behind the other two."),
    R('grump', "Okay. Throttle to ten percent. TEN. Not twenty. Not 'let's see what she does.' Ten."),
    C('smug', "Ten. Got it."),
    FX((G) => G.fireThrusters()),
    N("The Dandelion ROARS. Teal fire blasts out of her new nozzles, rattling every tool on the pegboard."),
    R('shock', "NOT INSIDE— okay. Okay! That's why the floor's concrete!"),
    N("And then Racket laughs. A loud, honking, ridiculous laugh that rattles the windows harder than the engine."),
    R('laugh', "HA! HAHA! Listen to her! LISTEN to her!"),
  ],
  choices: [
    { t: "Racket! You LAUGHED!", f: 3, say: [R('shock', "I did not."), R('laugh', "...Okay, I did. Don't tell Vex.")] },
    { t: "She sounds amazing!", f: 2, say: [R('laugh', "She sounds like a dragon with hiccups! It's beautiful!")] },
    { t: "(laugh along with him)", f: 3, say: [N("For a minute you're both just laughing in a garage full of smoke."), R('soft', "...Yeah. Yeah.")] },
  ],
  end: (G) => G.roofScene(),
};

D.roof = (G) => {
  const t = G.tier();
  return {
    lines: [
      N("Later that night, the garage roof creaks under you. The sky is so full of stars it looks spilled."),
      R('soft', "Used to come up here every night. Count the ships going over."),
      C('neutral', "How many?"),
      R('soft', "Most nights? None."),
    ],
    choices: [
      { t: "Racket... how did you end up out here?", f: 3, go: 'roof2' },
      { t: "Do you miss flying?", f: 3, go: 'roof2' },
      { t: "(sit with him quietly)", f: 2, say: [N("The crickets fill the quiet. After a while, he talks anyway.")], go: 'roof2' },
    ],
  };
};
D.roof2 = (G) => {
  const t = G.tier();
  return {
    lines: [
      R('soft', "I was hauling cargo. With Vex, if you can believe it. Back when we could stand each other."),
      R('soft', "Nav went out over the ridge. Alarms everywhere. I told her to bail."),
      R('smirk', "She did. Landed in a tree, swearing the whole way down. She's fine. Obviously. You've met her."),
      R('soft', "I stayed with the ship. Rode her down. Alone. And Vex and me... we never really talked about it. After."),
      N("He stops. His ears go flat. For a long moment he just looks at the trees."),
      R('grump', "...You see that cluster up there? Looks like a wrench."),
      C('smug', "That looks nothing like a wrench."),
      R('smirk', "Agree to disagree."),
      N("You let him change the subject. He notices. He doesn't say anything, but he leans his shoulder against yours."),
      R(t >= 3 ? 'soft' : 'smirk', t >= 3 ? "...Glad you crashed here, lynx. Not glad you crashed. Glad it was here." : "You did good today, lynx. Really good."),
      R('grump', "Tomorrow, the woods. That fallen tree isn't gonna cut itself."),
    ],
    end: (G) => G.phaseEnd(2),
  };
};

// Phase 2 idle lines get mixed in once you're in Phase 2
DATA.idle2 = [
  ["Vex. Ugh. VEX.", "*mutters about magpies*"],
  ["Junkyard dust in my fur. Again. Thanks, Vex.", "*inspects the Dandelion's engine, nods approvingly*"],
  ["Hey lynx. Bertha's really running? Huh. Good job.", "*whistles, badly*"],
  ["You're getting good at this, lynx. Don't let it go to your head. Let it go to your hands.", "*hums the song from the radio*"],
  ["Hey lynx. Pass the torch. Thanks, partner.", "*whistles the radio song, nearly in tune*"],
];
