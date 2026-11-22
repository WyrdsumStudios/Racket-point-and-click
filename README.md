# Racket's Garage

A cozy, slightly gritty sci-fi point-and-click adventure. Crystal Lynx crash-lands her scout ship, the *Dandelion*, in the woods of an alien moon. The only mechanic for miles is Racket, a tall, grumpy, sarcastic raccoon who agrees to fix it mostly so she'll leave. Scavenge parts, earn scrap credits, shop a very sketchy parts marketplace, and slowly win him over.

**Status: Phase 3 play-test build** (Phases 1, 2 and 3 are playable).

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

## Project layout

```
index.html        page shell (HUD, scene, inventory tray, dialogue, modals, title)
css/style.css     all styling and animation
js/audio.js       WebAudio ambience, music and sound effects
js/art.js         Phase 1 artwork as hand-built SVG (scenes, characters, items)
js/art2.js        Phase 2 artwork (junkyard, Vex, woods edge, roof, new items)
js/art3.js        Phase 3 artwork (deep woods, glade, old wreck, Pip, new items)
js/data.js        Phase 1 items, dialogue trees, banter, shop listings, jobs
js/data2.js       Phase 2 items, dialogue (Vex, test-fire, roof), listings, jobs
js/data3.js       Phase 3 items, dialogue (the wreck, Vex and Racket, the patch), listings
js/minigames.js   bolt sorting, tune-up, wires, breakers, gasket, fireflies, star map, root maze
js/engine.js      state, scenes and hotspots, walking, dialogue runner, modals, saving
```

### Adding content

- **Dialogue** lives in `js/data.js`. A node is `{ lines, choices, go, end }`. `lines` are `[who, mood, text]`, where `who` is `'r'` (Racket), `'c'` (Crystal), `'n'` (narrator) or `'fx'` (run a function). A choice is `{ t, f, say, go, if }`, where `f` is the hidden friendship change. A node can also be a function `(G) => node` so it can react to state.
- **Scenes and hotspots** live in `SCENES` in `js/engine.js`. Each hotspot has a hit box, a walk-to x, a draw function from `art.js`, an `act` handler and an optional `accepts` list of items.
- **Racket's moods** in art are `grump`, `smirk`, `soft`, `shock` and `laugh`. Vex's are `smug`, `neutral`, `annoyed`, `shock` and `delight`. Crystal's are `neutral`, `happy`, `worried`, `smug` and `surprised`.

## Roadmap

- **Next:** hull plating (something big crashed in the canyon) and the engine core, which is making a new noise.
- **Later:** the abandoned station on the ridge, and whatever happens when the Dandelion can fly again.
