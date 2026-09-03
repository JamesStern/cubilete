# Cubilete

The traditional Cuban dice game, built as an offline-first web app for the iPhone home screen — styled after a cigar lounge by the sea, with a nod to Hudson's drinks-for-dice sessions at El Floridita in *Islands in the Stream*.

**Play:** https://jamesstern.github.io/cubilete/

## Install on iPhone (works offline afterwards)

1. Open the link above in **Safari** (must be online this one time).
2. Tap **Share ⇧ → Add to Home Screen → Add**.
3. Open it **from the new icon once while still online**. The home-screen app has its own storage, so this first launch is what saves every file to the phone.
4. That's it. Airplane mode, no signal, whatever — the icon opens the game from your phone.

Updates: when a new version has been published, the app shows a "Nueva versión" toast on launch (or use *Ajustes → Buscar actualización*). Tap it to reload.

## Rules as implemented

Five poker dice: **As** (♠, wild), **Rey** (K), **Cundanga** (Q), **Jeva** (J), **Gallego** (10, red pips), **Negro** (9, black pips).

- Each turn is up to three rolls from the cup; keep any dice, re-roll the rest, or stand.
- The player who **opens** the round sets the cap: if they stand after one roll, everyone else gets one roll.
- Hands rank by **how many of a kind** (aces count toward any face), then by face. Ties are settled by a one-roll *desempate* among the tied players.
- The round winner takes **one pata** and opens the next round. First to **10 patas** wins.
- **Five of a kind is a Carabina** and ends the round instantly — the remaining players don't roll.
  - Carabina de Reyes **naturales** (five real kings): 5 patas
  - Carabina de Reyes **no naturales** (kings + aces): 2 patas
  - Carabina de **Ases** (five real aces): 10 patas, game over
  - Any other five of a kind: 1 pata

Source rules: https://www.onsitecigars.com/how-to-play-cubilete/ (gaps filled with the standard Cuban conventions above).

## Features

- English by default; switch to Spanish from the title screen or Settings. Game terms (As, Rey, Cundanga, Jeva, Gallego, Negro, patas, desempate, and every *Carabina de …*) keep their proper names in both languages.
- Pass-and-play at one phone: 2–6 seats, any mix of people and computer players.
- The computer plays an exact expected-value strategy (full enumeration of the 252 hand states, target-aware: it knows what it has to beat, how many players follow, and how the opener's cap changes the odds).
- Session scoreboard with patas, rounds and carabinas; the game resumes exactly where you left it if the app is closed.
- Carabinas are detected, named and celebrated.

## Development

No build step, no dependencies.

```bash
python3 -m http.server 8765        # then open http://localhost:8765/
node tests/tests.js                # rules, state machine, AI, and build guards
python3 tools/make_icons.py        # regenerate icons/ (Pillow, with a macOS fallback)
node tools/gen_pbeat.js            # regenerate the AI probability table in js/ai.js
```

Debugging rolls: set `localStorage.debugRolls = "[6,6,6,6,6]"` in the console — the next dice come off that queue.

### Deploying an update

1. Bump `VERSION` in `sw.js` **and** `APP_VERSION` in `js/version.js` (the tests fail if they disagree).
2. `node tests/tests.js`
3. Commit and push to `main`; GitHub Pages redeploys in a minute or two.

## Layout

```
index.html            app shell + iOS meta tags
manifest.webmanifest  PWA manifest
sw.js                 service worker: precache everything, cache-first
css/style.css         the lounge
js/rules.js           evaluator, comparison, scoring (pure)
js/game.js            state machine / reducer (pure, serializable)
js/ai.js              exact DP opponent (pure)
js/i18n.js            English/Spanish strings and hand labels
js/dice.js            SVG dice faces and the leather cup
js/sound.js           Web Audio synth
js/ui.js              rendering, input, AI driver, persistence, SW registration
icons/                generated PNGs
tools/                icon + probability-table generators
tests/                framework-free test suite (node or browser)
```
