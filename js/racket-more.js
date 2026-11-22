/* Racket's Garage — racket-more.js
 * More of Racket: extra backstory for "Tell me about yourself" and a much bigger pool of
 * "Just thought I'd hang out" moments. Entries unlock with friendship tier and story progress,
 * so there's always something new to hear as the game goes on.
 *
 * Lore entry:  { id, need: tier, when?: (G) => bool, lines, f }
 * Hang entry:  { need: tier, when?: (G) => bool, lines, choices? }
 */
(() => {
  const F = (G) => G.S.flags;

  // ---------------------------------------------------------------- backstory
  // The first four keep their old order so existing saves carry on where they left off.
  DATA.lore.forEach((l, i) => { l.id = l.id || `base${i}`; });
  DATA.lore.push(
    {
      id: 'name', need: 1,
      lines: [
        R('grump', "Racket. My mom said I was the loudest baby on the whole mining colony."),
        R('smirk', "Name stuck. I've spent my entire life trying to live it down."),
        C('smug', "How's that going?"),
        R('grump', "Badly. Thank you for asking."),
      ], f: 2,
    },
    {
      id: 'toaster', need: 1,
      lines: [
        R('smirk', "I once fixed a toaster so well it achieved flight."),
        C('surprised', "...Flight?"),
        R('smirk', "Briefly. Very briefly. Vex still has the scorch mark on her ceiling. She calls it 'the Racket Incident'. There have been several Racket Incidents."),
      ], f: 2,
    },
    {
      id: 'mechanic', need: 2,
      lines: [
        R('soft', "Mom fixed water pumps on the colony. I was the kid handing her the wrong wrench. Every single time."),
        R('soft', "Took me years to hand her the right one first try. She cried. Over a wrench. I didn't get it then."),
        R('soft', "...I get it now. You did that thing with the gasket and I had to go stand in the yard for a minute."),
      ], f: 3,
    },
    {
      id: 'mask', need: 2,
      lines: [
        R('grump', "People see the mask and think 'thief'. Grew up getting followed around every shop on the colony."),
        R('soft', "So I fix things. Hard to call somebody a thief while he's fixing your stuff for free."),
        C('worried', "Racket... that's not fair. That happened to you."),
        R('smirk', "Nope. But it made me a really, really good mechanic. Out of spite. Spite is an excellent fuel. Burns clean."),
      ], f: 3,
    },
    {
      id: 'noodles', need: 2, when: (G) => !!F(G).noodles,
      lines: [
        R('grump', "The noodles? Only thing I know how to cook. Mom's recipe."),
        R('smirk', "I told you the secret was more hot sauce. I lied. There's no secret. It's just hot sauce."),
        R('soft', "...She'd have liked you. She liked anybody who ate a second cup without being asked."),
      ], f: 3,
    },
    {
      id: 'vexmeet', need: 2, when: (G) => !!F(G).vexMet,
      lines: [
        R('grump', "How I met Vex? Scrapyard auction. We bid on the same engine. She won."),
        R('smirk', "Then she couldn't lift it. I could. We've been arguing about who owns that engine for twenty-six years."),
        C('happy', "Who has it now?"),
        R('grump', "...It's under her bed. She thinks I don't know. I've always known."),
      ], f: 3,
    },
    {
      id: 'goggles', need: 3,
      lines: [
        R('soft', "These goggles? They were Mom's. Lenses are scratched to heck. I can barely see out of them."),
        C('neutral', "You could replace the lenses."),
        R('soft', "I could. I won't. Some things you keep scratched."),
      ], f: 3,
    },
    {
      id: 'firstnight', need: 3, when: (G) => !!F(G).wreckStory,
      lines: [
        R('soft', "First night after the Long Shot came down, I sat in her cockpit and talked to her. Like she could hear me."),
        R('soft', "Told her it wasn't her fault. Nav fails. Ridges are tall. Ships come down."),
        R('soft', "...Took me fifteen years to say the same thing to me."),
      ], f: 4,
    },
    {
      id: 'pip', need: 3, when: (G) => !!F(G).pipFed,
      lines: [
        R('grump', "That purple pest. Pip. You know it's been stealing bolts out of my bin for YEARS?"),
        R('smirk', "Used to think I was losing my mind. Counting bolts at midnight. Short every time."),
        R('soft', "...Now it sits on the bay door and watches me work. I leave a bolt out for it. Don't tell it I do that on purpose."),
      ], f: 3,
    },
    {
      id: 'roof', need: 4,
      lines: [
        R('soft', "Favourite place? The roof. Obviously."),
        R('soft', "Before you got here, the roof was where I went to be alone."),
        R('soft', "...Now it's where I go to not be."),
      ], f: 4,
    },
    {
      id: 'scared', need: 4, when: (G) => !!(F(G).phase4 || F(G).roofTalk),
      lines: [
        R('soft', "I'm scared of a lot of stuff, lynx. Engines that go quiet. Engines that go loud."),
        R('soft', "Being needed. Not being needed."),
        R('grump', "...Mostly those last two. Don't make a face. You asked."),
        C('happy', "I'm glad you told me."),
        R('soft', "...Yeah. Me too."),
      ], f: 4,
    },
    {
      id: 'home', need: 4, when: (G) => !!G.S.repairs.core,
      lines: [
        R('soft', "When we went up in her... I opened my eyes and looked down and saw the garage. Tiny little light in the trees."),
        R('soft', "And I thought: that's home. Didn't think that about anywhere for a long, long time."),
        R('grump', "...Okay. That's enough feelings. I'm going to go hit something with a hammer. Lovingly."),
      ], f: 4,
    },
  );

  D.lore = (G) => {
    const S = G.S, t = G.tier();
    // which entries have been heard (older saves only stored a count of the first ones)
    if (!S.talked.loreSeen) S.talked.loreSeen = DATA.lore.slice(0, S.talked.lore || 0).map((l) => l.id);
    const seen = S.talked.loreSeen;
    const back = () => { G.tmp.again = true; return 'hub'; };
    const unheard = DATA.lore.filter((l) => !seen.includes(l.id));
    const ready = unheard.filter((l) => t >= l.need && (!l.when || l.when(G)));
    if (!ready.length) {
      if (unheard.length) {
        return { lines: [R(t === 0 ? 'grump' : 'soft', t === 0 ? "Nope. Ask me again when I like you. So, never." : pick(["...Some other time, lynx. Ask me again later.", "Not today. There's more. Just... not today.", "Ask me again after we've fixed something else. I talk better with grease on my hands."]))], go: back };
      }
      return { lines: [R('soft', pick(["That's everything, lynx. You know me better than anybody now. Even Vex.", "I'm out of stories. You've heard them all. ...Make some new ones with me."]))], go: back };
    }
    const L = ready[0];
    return { lines: [...L.lines, FX((G) => { seen.push(L.id); S.talked.lore = seen.length; G.friend(L.f); })], go: back };
  };

  // ---------------------------------------------------------------- hanging out
  const H = (need, lines, extra = {}) => ({ need, lines, ...extra });
  const HANG = [
    // gruff
    H(0, [R('grump', "You're just gonna... stand there? Great. Love that for me."), R('grump', "Fine. Don't touch anything shiny.")]),
    H(0, [R('grump', "I charge for company."), C('surprised', "Really?"), R('smirk', "No. I just don't offer it.")]),
    H(0, [R('grump', "If you're staying, sort those washers. No. Don't. I'll do it. You'll do it wrong."), N("He does it himself, muttering. He sorts them wrong.")]),
    H(0, [N("You stand next to him while he works. He pointedly ignores you for four whole minutes."), R('grump', "...You're still here."), C('happy', "I'm still here."), R('grump', "...Hm.")]),
    // warming
    H(1, [R('grump', "Hand me the ten mil. No, the other ten mil."), C('neutral', "They're the same wrench."), R('shock', "They are NOT the same wrench.")]),
    H(1, [R('grump', "You hum when you think. You know that?"), C('surprised', "I do not."), R('smirk', "You're doing it right now.")]),
    H(1, [R('grump', "Hold this. ...By the handle. Who holds a wrench like that?"), C('smug', "Someone who just fixed your radio?"), R('grump', "...Hold it however you want.")]),
    H(1, [N("You both sit on the bench and watch the rain hit the bay door."), R('grump', "...Rain's good for the mushrooms."), C('happy', "That's nice."), R('grump', "Don't make it nice. It's just rain.")]),
    H(1, [R('grump', "Name three tools on that pegboard. Go."), C('neutral', "Hammer. Saw. ...Pointy one?"), R('shock', "POINTY ONE?"), R('grump', "We're starting lessons tomorrow. Seven sharp.")], { choices: [
      { t: "Seven? That's so early.", say: [R('smirk', "Engines don't sleep in. Neither do mechanics.")] },
      { t: "I'll be there. With coffee.", f: 1, say: [R('soft', "...With coffee. Okay. Fine. Seven-fifteen.")] },
    ] }),
    // teasing
    H(2, [R('smirk', "For a crash pilot, you're not totally useless, lynx."), C('happy', "Was that a compliment?"), R('grump', "It was an observation. Don't frame it.")]),
    H(2, [R('soft', "Pass me that rag. ...Thanks."), C('surprised', "Did you just say thanks?"), R('grump', "I say thanks. I'm not an animal. ...Okay, technically.")]),
    H(2, [N("Racket hands you a bolt without looking. You hand him the right nut without looking. Neither of you says anything."), R('smirk', "...Huh. We're good at that."), C('happy', "We are.")]),
    H(2, [R('smirk', "Bet you can't spin a wrench on one claw."), N("You can. You do. Twice."), R('shock', "...Okay, who taught you that."), C('smug', "You did. Last week. You were showing off.")]),
    H(2, [R('grump', "Radio's playing the slow song again."), N("He turns it up anyway. Just a little."), R('soft', "...It's a good song. Don't tell the radio.")]),
    H(2, [R('smirk', "Rate my workbench. One to ten."), C('neutral', "Seven?"), R('shock', "SEVEN?")], { choices: [
      { t: "Okay, eight. For the vise.", say: [R('smirk', "The vise IS beautiful. Eight is fair.")] },
      { t: "It's a ten. It's your workbench. It's perfect.", f: 1, say: [R('soft', "...Yeah. It is. Thanks, lynx.")] },
    ] }),
    H(2, [R('grump', "You've got grease on your nose."), N("He licks his thumb and goes to wipe it, then realises what he's doing and freezes."), R('grump', "...Use a rag. Rags exist. Here's a rag.")], { when: (G) => !!G.S.flags.phase1 }),
    // fond
    H(3, [R('soft', "Place is less quiet with you around."), R('grump', "That's a complaint. Mostly.")]),
    H(3, [N("He hands you a mug without saying anything. It's your favourite. He knows which one is your favourite."), C('happy', "...Thank you."), R('soft', "It's just a mug.")]),
    H(3, [R('soft', "You can nap on the couch, you know. If you're tired. I'll keep it down."), N("He does not keep it down. He drops a wrench forty seconds later. But he whispers 'sorry' afterwards, which is new.")]),
    H(3, [R('smirk', "Teach me one of your pilot things."), C('happy', "Like what?"), R('soft', "Like... how you know where you're going. Up there. With all that nothing around you.")], { choices: [
      { t: "You pick a star and you trust it.", f: 1, say: [R('soft', "...Pick a star and trust it. Huh."), R('grump', "I'm picking the Wrench. Don't argue.")] },
      { t: "Honestly? I usually don't. I just go.", f: 1, say: [R('laugh', "HA. That explains the mushroom patch."), R('soft', "...I like that, though. Just going.")] },
    ] }),
    H(3, [R('grump', "Vex says I smile more now."), R('grump', "I don't smile more. I have a face. Faces do things."), N("He is smiling right now.")], { when: (G) => !!G.S.flags.vexMet }),
    H(3, [N("Pip lands on the workbench, steals a bolt, and flies off. Racket doesn't even look up."), R('soft', "Let it go. It earned that one.")], { when: (G) => !!G.S.flags.pipFed }),
    H(3, [R('soft', "That patch looks good on you, by the way. On the jacket."), R('grump', "...I'm just saying the stitching's good. I did good stitching.")], { when: (G) => !!G.S.flags.patch }),
    // family
    H(4, [R('soft', "Stay as long as you want, lynx. Place feels wrong without you now."), R('grump', "...Don't quote me.")]),
    H(4, [N("You sit on the couch together. He falls asleep halfway through a sentence about torque specs, head tipping onto your shoulder."), N("You don't move for a very long time.")]),
    H(4, [R('soft', "Hey. ...You ever think about what would've happened if you'd crashed somewhere else?"), C('neutral', "Sometimes."), R('soft', "Me too. I don't like it. Crash here. Always crash here.")]),
    H(4, [R('smirk', "Rock paper scissors for who makes the noodles."), N("He throws rock. He always throws rock. You let him win anyway."), R('smirk', "...You let me win."), C('smug', "I would never.")]),
    H(4, [R('soft', "I used to count ships going over. From the roof. None, most nights."), R('soft', "...Haven't counted in weeks. Forgot to. Too busy."), R('grump', "Your fault. Thanks.")], { when: (G) => !!G.S.flags.phase2 }),
    H(4, [N("Vex texts him a picture of a gold doorknob. He shows it to you. You both laugh until your sides hurt."), R('laugh', "She's ridiculous. I love her. Don't tell her. I'll deny it under oath.")], { when: (G) => !!G.S.flags.roofTalk }),
    H(4, [R('soft', "Sometimes I walk up to the hangar just to look at the rail. Where she went up."), R('soft', "...Where WE went up."), R('grump', "Anyway. I need to oil the rail. That's why I go. Oil.")], { when: (G) => !!G.S.repairs.core }),
    H(4, [R('grump', "You know the shop's got your name on it now."), R('soft', "Same size letters. ...I measured. Twice.")], { when: (G) => G.S.flags.ending === 'stay' }),
    H(4, [R('soft', "Where to next, co-pilot?"), C('happy', "Anywhere. You pick a star."), R('smirk', "...The Wrench. It's always the Wrench.")], { when: (G) => G.S.flags.ending === 'together' }),
    H(4, [R('soft', "Your postcards are my favourite thing on the pegboard."), R('grump', "...Second favourite. The vise is first. ...Tied. They're tied.")], { when: (G) => G.S.flags.ending === 'return' }),
  ];

  D.hang = (G) => {
    const S = G.S, t = G.tier();
    const n = S.talked.hang || 0;
    const pool = HANG.map((h, i) => ({ ...h, i })).filter((h) => t >= h.need && (!h.when || h.when(G)));
    // prefer the ones you haven't heard yet, and the ones closest to how close you two are now
    const heard = S.talked.hangSeen || (S.talked.hangSeen = []);
    let options = pool.filter((h) => !heard.includes(h.i));
    if (!options.length) { S.talked.hangSeen = []; options = pool; }
    if (options.length > 1) options = options.filter((h) => h.i !== G.tmp.lastHang);
    const best = Math.max(...options.map((h) => h.need));
    const near = options.filter((h) => h.need >= best - 1);
    const from = near.length ? near : options;
    const pickH = from[Math.random() * from.length | 0];
    G.tmp.lastHang = pickH.i;
    const lines = [...pickH.lines];
    if (n >= 3 && t < 2 && !pickH.choices && Math.random() < .4) lines.push(R('grump', "Don't you have a ship to fix?"));
    lines.push(FX((G) => { S.talked.hang = n + 1; if (!S.talked.hangSeen.includes(pickH.i)) S.talked.hangSeen.push(pickH.i); if (n < 3) G.friend(2); }));
    return pickH.choices ? { lines, choices: pickH.choices } : { lines };
  };
})();
