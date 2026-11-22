# Racket's Garage

A cozy, slightly gritty sci-fi point-and-click adventure. Crystal Lynx crash-lands her scout ship, the *Dandelion*, in the woods of an alien moon. The only mechanic for miles is Racket, a tall, grumpy, sarcastic raccoon who agrees to fix it mostly so she'll leave. Scavenge parts, earn scrap credits, shop a very sketchy parts marketplace, and slowly win him over.

**Status: Phase 1 play-test build.**

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
- **Hidden friendship meter.** Choices, returning borrowed tools, finishing jobs and spending time with Racket all raise it. His greetings, moods, banter and backstory unlock as it grows. He starts calling her "lynx" once he warms up, and "sweetheart" slips out only at the highest level.
- **Story beat:** after the first repair, a late-night noodle scene and a gift.
- **Audio:** synthesized ambience, a gentle generative score, two radio stations once you fix the radio, and sound effects. Sound and music toggle separately.

## Project layout

```
index.html        page shell (HUD, scene, inventory tray, dialogue, modals, title)
css/style.css     all styling and animation
js/audio.js       WebAudio ambience, music and sound effects
js/art.js         all artwork as hand-built SVG (scenes, characters, items)
js/data.js        items, dialogue trees, banter, shop listings, jobs
js/engine.js      state, scenes and hotspots, walking, dialogue runner, modals, saving
```

### Adding content

- **Dialogue** lives in `js/data.js`. A node is `{ lines, choices, go, end }`. `lines` are `[who, mood, text]`, where `who` is `'r'` (Racket), `'c'` (Crystal), `'n'` (narrator) or `'fx'` (run a function). A choice is `{ t, f, say, go, if }`, where `f` is the hidden friendship change. A node can also be a function `(G) => node` so it can react to state.
- **Scenes and hotspots** live in `SCENES` in `js/engine.js`. Each hotspot has a hit box, a walk-to x, a draw function from `art.js`, an `act` handler and an optional `accepts` list of items.
- **Racket's moods** in art are `grump`, `smirk`, `soft`, `shock` and `laugh`. Crystal's are `neutral`, `happy`, `worried`, `smug` and `surprised`.

## Roadmap

- **Phase 2:** the Junkyard (scrap piles, a grumpy scrap dealer, thruster parts, a cutting torch) and the Deep Woods (the torch clears a blocked path, critters, hidden parts, a rescue moment).
- **Later:** a canyon wreck and an abandoned station, a scanner that reveals hidden parts, the remaining repairs (thrusters, navigation, hull plating, engine core), and more friendship moments.
