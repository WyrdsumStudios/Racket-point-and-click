# Racket's Garage

A cozy, slightly gritty sci-fi point-and-click adventure. Crystal Lynx crash-lands her scout ship, the *Dandelion*, in the woods of an alien moon. The only mechanic for miles is Racket, a tall, grumpy, sarcastic raccoon who agrees to fix it mostly so she'll leave. Scavenge parts, earn scrap credits, shop a very sketchy parts marketplace, and slowly win him over.

**Status: Phase 4 play-test build** (Phases 1 to 4 are playable).

## Play

It's a plain HTML/CSS/JS web app with no build step and no dependencies.

- Open `index.html` in a browser, or
- serve the folder (for example `python3 -m http.server`) and visit `http://localhost:8000`.

It works on desktop (mouse and keyboard) and on tablets (touch, landscape or portrait). Progress autosaves to the browser's localStorage.

**Controls:** tap things in the scene to look at them, pick them up or use them. Tap an inventory item to select it, then tap something in the scene to use it there. Tap the floor to walk. The eye button in the top bar highlights everything you can interact with.

## What's in Phase 1

- **Scenes:** the Crash Site and Racket's Garage (workbench, ship bay, terminal, couch, radio, job board, bolt bin).
- **First repair, the fuel cell.** It needs three parts, each found a different way:
  - **Casing:** pinned under wreckage at the crash site. Borrow Racket's pry bar from the pegboard.
  - **Charge crystal:** a glowing vein at the crash site, too hot to touch. Grab the oven mitts from the couch.
  - **Copper wiring:** bought on JunkNet, Racket's terminal, for 35 credits. Earn credits from the job board: fix the radio with the spare fuse from your ship's locker, sort the bolt bin, and sell crash scrap.
- **Workbench assembly** with a short install and charge animation.
- **Chat-style dialogue** with 2–3 choices, plus idle banter if you hang around the garage.
- **Hidden friendship meter.** Choices, returning borrowed tools, finishing jobs and spending time with Racket all raise it. His greetings, moods, banter and backstory unlock as it grows. He starts calling her "lynx" once he warms up. "Sweetheart" slips out exactly once, late in the game, and he denies it.
- **Story beat:** after the first repair, a late-night noodle scene and a gift.
- **Audio:** synthesized ambience, a gentle generative score, two radio stations once you fix the radio, and sound effects. Sound and music toggle separately.

## What's in Phase 2

- **New scenes:** Vex's Junkyard (floodlit scrap heaps, Big Bertha the crane, Vex's hubcap shack), the Woods Edge (past the crash site), and the garage roof.
- **Scrapqueen Vex:** a magpie salvage dealer and Racket's old flying partner. On the first trip Racket comes along, and when Vex picks on Crystal he quietly sticks up for her.
- **Second repair, the thrusters:**
  - **Nozzle set:** under the Hauler-7 wreck. Get Big Bertha running: find her lever in Tire Mountain, then solve the breaker-box puzzle. Lift the wreck and cut the nozzles free with a torch.
  - **Cutting torch:** Vex trades it for a gold hubcap buried in the shiny pile. Fuel comes from JunkNet (30 cr).
  - **Heat-proof gasket:** cut at the workbench from a copper sheet (appliance heap) and ember-bark resin. The resin is melted off a tree at the woods edge with the torch and caught in Racket's old noodle cup.
- **Junk to sell:** searchable piles hold funny junk with new JunkNet buyers, plus new listings.
- **Mini-games:** Bolt Bin: The Sequel (nuts and washers), Tune the Tow Truck (timing), Untangle the Wiring (matching), Big Bertha's breaker box (lights-out) and Cut the Gasket (dot to dot). Shop chores pay credits the first time and can be replayed from the job board for a couple of credits.
- **Story beats:** a test-fire where Racket finally laughs, and a quiet night on the roof where he almost tells you how he crashed. Friendship can reach tier 3.
- **The Deep Woods tease:** the torch could cut through the fallen tree... tomorrow.

## What's in Phase 3

- **New scenes:** the Deep Woods (bioluminescent trees, fog, fireflies, drifting jelly-creatures and a snoring mossback), the Glade with its ancient glowing tree, and the Old Wreck: Racket's original ship, the *Long Shot*, swallowed by roots.
- **Third repair, navigation:**
  - **Star-chart crystal:** in the roots of the ancient tree. Only the scanner can tell which crystal it is.
  - **Scanner:** Racket's old one, in the workbench drawer. It needs a resonance coil from the Long Shot's cargo hold. Once fixed, it reveals hidden things in every scene, old ones included: a meteorite at the crash site, Vex's lucky washer at the junkyard, and Racket's mom's spore tin under a garage floorboard.
  - **Nav chip:** back in stock on JunkNet for 150 credits, or Vex trades one for the Long Shot's flight recorder.
  - **Calibration:** the Star Map mini-game at the workbench.
- **Pip:** the little purple critter from the crash site turns out to be a six-legged owl. Feed it the old ration paste and it opens a shortcut, so the woods scenes appear on the map.
- **Mini-games:** Firefly Lanterns (light the dark path), Root Maze (rotate roots to guide light), Star Map (rebuild constellations, including Racket's Wrench), and Bolt Bin III. Beaten story mini-games can be replayed from the job board's "For fun" section.
- **Story:** at the wreck, Racket tells how he crashed. He ordered Vex into the only escape pod, rode the Long Shot down alone, waited over two hundred days, then built the garage from her bones. Comfort him or give him space. Bring Vex the flight recorder and help the two of them finally clear the air. Afterwards Racket gives Crystal the Long Shot's crew patch for her jacket. Friendship can reach tier 4.
- **Backstory fix:** the Phase 2 roof scene now makes it clear the person he told to bail was Vex, and that she landed safely.

## What's in Phase 4

- **New scenes:** the Canyon Rim (red-and-teal canyon at sunset, Vex's truck, a broken rope bridge) and the Gilded Gull, a sunken luxury liner at the bottom of the canyon, still guarded by STEWARD-9, an extremely polite robot steward who has been waiting forty years.
- **Fourth repair, hull plating:**
  - **Hull plates:** fix the rope bridge with Vex (Rope Knots), get aboard the Gilded Gull with a commemorative boarding pass from JunkNet (robots love paperwork), and cut the plates loose with the torch. Vex winches them up.
  - **Gold rivets:** from the liner's purser's desk. The rivet gun is on Racket's pegboard.
  - **Sealant:** groom the sleeping mossback in the Deep Woods for its glowing moss (Moss Grooming).
  - At the workbench: install the plates and moss, rivet them in time (Rivet Rhythm), then pressure-test.
- **Story:** Vex road-trips with Crystal while Racket stays home glaring at the engine core. One of the three plates goes missing back at the garage. The scanner finds it under the workbench, and Racket admits he hid it because a fixed ship means Crystal leaves. Crystal's answers are reassuring but leave the ending open. The hull celebration finally exposes Racket's love of the French Vanilla Monstrosity to Vex, then the engine core makes the new noise.
- **Mini-games:** Rope Knots (repeat Vex's sequence), Moss Grooming (brush the glowing tufts), Rivet Rhythm, and Bolt Bin IV (a conveyor belt). All join the job board's For Fun section once beaten.

## The Garage Café

A coffee cart in the garage corner, under the job board: an old espresso machine, a kettle, mismatched mugs and a creamer shelf. It's broken until Phase 1 is done, then Racket fixes it ("Don't make it weird. ...Make me something.").

- **Making a drink, step by step:** pick a mug, then pull an espresso shot (timing), brew coffee or melt cocoa (stir). Steam the milk on a timing bar: too long and it scalds, and dry and wet cappuccinos want different zones. Add creamers or syrups, pick a topping, then optionally pour latte art by tracing a heart, a leaf or a little wrench.
- **Menu:** the French Vanilla Monstrosity (French vanilla, coffee and hazelnut creamers in one cup: Racket's secret favourite), three hot chocolates (classic, whipped cream, marshmallows), four lattes (vanilla, caramel, hazelnut, seasonal ember-bark spice) and three cappuccinos (dry, wet, cinnamon).
- **Racket reacts** to every drink in character, warmer as friendship grows, with extra lines for latte art, scalded milk, a sour or bitter shot, the wrong recipe, and his own mug. A perfect Monstrosity earns a special line and a small friendship boost. Perfect drinks add 2 credits to the tip jar.
- **Vex drops by** sometimes and orders anything with sprinkles, because it's shiny. Sprinkles get you a 3-credit tip. Hand her the Monstrosity and she finally learns Racket's secret.
- **Replayable** any time, like the shop chores.

## Project layout

```
index.html        page shell (HUD, scene, inventory tray, dialogue, modals, title)
css/style.css     all styling and animation
js/audio.js       WebAudio ambience, music and sound effects
js/art.js         Phase 1 artwork as hand-built SVG (scenes, characters, items)
js/art2.js        Phase 2 artwork (junkyard, Vex, woods edge, roof, new items)
js/art3.js        Phase 3 artwork (deep woods, glade, old wreck, Pip, new items)
js/art4.js        Phase 4 artwork (canyon rim, Gilded Gull, STEWARD-9, new items)
js/data.js        Phase 1 items, dialogue trees, banter, shop listings, jobs
js/data2.js       Phase 2 items, dialogue (Vex, test-fire, roof), listings, jobs
js/data3.js       Phase 3 items, dialogue (the wreck, Vex and Racket, the patch), listings
js/data4.js       Phase 4 items, dialogue (the canyon, STEWARD-9, the hidden plate), listings
js/minigames.js   bolt sorting, tune-up, wires, breakers, gasket, fireflies, star map, root maze, knots, moss, rivets, conveyor
js/cafe.js        the Garage Café: coffee cart art, drink-making game, Racket and Vex reactions
js/engine.js      state, scenes and hotspots, walking, dialogue runner, modals, saving
```

### Adding content

- **Dialogue** lives in `js/data.js`. A node is `{ lines, choices, go, end }`. `lines` are `[who, mood, text]`, where `who` is `'r'` (Racket), `'c'` (Crystal), `'n'` (narrator) or `'fx'` (run a function). A choice is `{ t, f, say, go, if }`, where `f` is the hidden friendship change. A node can also be a function `(G) => node` so it can react to state.
- **Scenes and hotspots** live in `SCENES` in `js/engine.js`. Each hotspot has a hit box, a walk-to x, a draw function from `art.js`, an `act` handler and an optional `accepts` list of items.
- **Racket's moods** in art are `grump`, `smirk`, `soft`, `shock` and `laugh`. Vex's are `smug`, `neutral`, `annoyed`, `shock` and `delight`. Crystal's are `neutral`, `happy`, `worried`, `smug` and `surprised`.

## Roadmap

- **Next:** the engine core (KA-THUNK, whirr, CLANK) and the blinking light on the ridge.
- **The finale:** what happens when the Dandelion can fly again. Does Crystal leave, stay, or take Racket with her? That one is still the author's call.
