// Framework-free test runner. `node tests/tests.js` or open tests/tests.html.
import * as R from '../js/rules.js';
import * as G from '../js/game.js';
import * as AI from '../js/ai.js';
import { APP_VERSION } from '../js/version.js';
import { handLabel, logLine, t, setLang } from '../js/i18n.js';

const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
const out = [];
let pass = 0;
let fail = 0;
const print = (s) => { out.push(s); if (isNode) console.log(s); };

function test(name, fn) {
  try { fn(); pass++; print('ok   ' + name); }
  catch (e) { fail++; print('FAIL ' + name + '\n     ' + (e && e.message)); }
}
const eq = (a, b, msg = '') => { if (a !== b) throw new Error(`${msg} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const deepEq = (a, b, msg = '') => { const x = JSON.stringify(a); const y = JSON.stringify(b); if (x !== y) throw new Error(`${msg} expected ${y}, got ${x}`); };
const ok = (c, msg = 'assertion') => { if (!c) throw new Error(msg); };

/* ---------- rules ---------- */
const { ACE, KING, QUEEN, JACK, GALLEGO, NEGRO } = R;
const table = [
  ['K K K K K', 5, KING, true, 5, 'Carabina de Reyes Naturales'],
  ['A A A A A', 5, ACE, true, 10, 'Carabina de Ases'],
  ['A A A A K', 5, KING, false, 2, 'Carabina de Reyes No Naturales'],
  ['K K A A Q', 4, KING, false, 1, null],
  ['Q Q Q A A', 5, QUEEN, false, 1, 'Carabina de Cundangas'],
  ['9 9 9 9 9', 5, NEGRO, true, 1, 'Carabina de Negros'],
  ['A A 9 9 9', 5, NEGRO, false, 1, 'Carabina de Negros'],
  ['A A A A 9', 5, NEGRO, false, 1, 'Carabina de Negros'],
  ['K Q J 10 9', 1, KING, true, 1, null],
  ['Q J 10 9 9', 2, NEGRO, true, 1, null],
  ['A Q J 10 9', 2, QUEEN, false, 1, null],
  ['A K K 9 9', 3, KING, false, 1, null],
  ['J J J J 10', 4, JACK, true, 1, null],
  ['A 10 10 J J', 3, JACK, false, 1, null],
];
for (const [dice, count, face, natural, patas, name] of table) {
  test(`evaluate ${dice}`, () => {
    const h = R.evaluate(R.parseDice(dice));
    eq(h.count, count, 'count'); eq(h.face, face, 'face'); eq(h.natural, natural, 'natural');
    eq(R.scoreFor(h), patas, 'patas'); eq(h.name, name, 'name'); eq(h.isCarabina, count === 5);
  });
}
test('evaluate is permutation invariant', () => {
  const d = R.parseDice('A K K 9 Q');
  const a = R.evaluate(d);
  const b = R.evaluate([d[4], d[2], d[0], d[3], d[1]]);
  deepEq(a, b);
});
test('compare: count beats face', () => {
  ok(R.compare(R.evaluate(R.parseDice('K K K 9 9')), R.evaluate(R.parseDice('Q Q Q Q 9'))) < 0);
});
test('compare: natural is not a key (tie → desempate)', () => {
  eq(R.compare(R.evaluate(R.parseDice('K K A Q 9')), R.evaluate(R.parseDice('K K K J 10'))), 0);
});
test('handLabel keeps the proper terms in both languages', () => {
  eq(handLabel(R.evaluate(R.parseDice('K K K 9 Q')), 'en'), 'Three Reyes');
  eq(handLabel(R.evaluate(R.parseDice('9 9 Q J 10')), 'en'), 'Pair of Negros');
  eq(handLabel(R.evaluate(R.parseDice('K Q J 10 9')), 'en'), 'Rey high');
  eq(handLabel(R.evaluate(R.parseDice('K K K K K')), 'en'), 'Carabina de Reyes Naturales');
  eq(handLabel(R.evaluate(R.parseDice('K K K 9 Q')), 'es'), 'Tres Reyes');
  eq(handLabel(R.evaluate(R.parseDice('9 9 Q J 10')), 'es'), 'Par de Negros');
  eq(handLabel(R.evaluate(R.parseDice('K Q J 10 9')), 'es'), 'Rey alto');
});
test('t() falls back to English and handles the _1 plural variant', () => {
  eq(t('msg.patas', { n: 2 }, 'en'), '+2 patas'); eq(t('msg.patas', { n: 1 }, 'en'), '+1 pata');
  eq(t('btn.roll', {}, 'es'), 'Tirar'); eq(t('nope', {}, 'es'), 'nope');
});
test('log entries render in both languages', () => {
  const e = { k: 'log.carabina', p: { name: 'Hudson', hand: R.evaluate(R.parseDice('K K K K K')), n: 5 } };
  eq(logLine(e, 'en'), 'Carabina de Reyes Naturales! Hudson takes 5 patas.');
  eq(logLine(e, 'es'), '¡Carabina de Reyes Naturales! Hudson gana 5 patas.');
  eq(logLine({ k: 'log.drawTie', p: { face: KING, names: ['A', 'B'] } }, 'en'), 'Tied on Rey: A & B roll again.');
  eq(logLine('legacy string'), 'legacy string');
});
test('every log key produced by game.js exists in the dictionary', () => {
  setLang('en');
  const roll = makeRoller([]);
  let s = drawTo(setup4(roll), roll, 0);
  let steps = 0;
  while (s.phase !== 'round-end' && steps++ < 60) s = rollAndSettle(s, roll);
  for (const e of s.log) ok(typeof e === 'object' && logLine(e) !== e.k, 'untranslated ' + JSON.stringify(e));
});

/* ---------- game reducer ---------- */
function makeRoller(script) {
  const q = script.slice();
  let seed = 12345;
  const roller = () => {
    if (q.length) return q.shift();
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return 1 + (seed % 6);
  };
  roller.push = (...v) => q.push(...v);
  roller.pending = () => q.length;
  return roller;
}
/** dispatch, auto-passing handoff screens; returns new state */
function go(s, action, roll) {
  let n = s;
  while (n.phase === 'handoff') n = G.reduce(n, { type: 'CONTINUE' }, roll);
  n = G.reduce(n, action, roll);
  while (n.phase === 'handoff') n = G.reduce(n, { type: 'CONTINUE' }, roll);
  return n;
}
/** ROLL, then close the turn with STOP if it used its last roll (what the UI does after the dice settle). */
function rollAndSettle(s, roll) {
  s = go(s, { type: 'ROLL' }, roll);
  if (G.turnComplete(s)) s = go(s, { type: 'STOP' }, roll);
  return s;
}
function setup4(roll) {
  let s = G.initialState();
  s = G.reduce(s, { type: 'SETUP_CONFIRM', players: [
    { name: 'Hudson', type: 'human' }, { name: 'Papa', type: 'human' }, { name: 'Bobby', type: 'ai' }, { name: 'Roberto', type: 'ai' },
  ] }, roll);
  return s;
}
/** play through the draw so that `opener` opens (all others roll 9, opener rolls K) */
function drawTo(s, roll, opener) {
  while (s.phase !== 'draw-done') {
    const who = G.currentActor(s);
    roll.push(who === opener ? KING : NEGRO);
    s = go(s, { type: 'DRAW_ROLL' }, roll);
  }
  return go(s, { type: 'CONTINUE' }, roll);
}

test('setup gates first human behind handoff', () => {
  const roll = makeRoller([]);
  const s = setup4(roll);
  eq(s.phase, 'handoff'); eq(s.handoff.to, 0); eq(s.handoff.resume, 'draw');
});
test('single human never sees handoff', () => {
  const roll = makeRoller([]);
  let s = G.initialState();
  s = G.reduce(s, { type: 'SETUP_CONFIRM', players: [{ name: 'A', type: 'ai' }, { name: 'H', type: 'human' }] }, roll);
  eq(s.phase, 'draw'); eq(s.phoneHolder, 1);
});
test('draw: tie re-draws among tied only, winner opens', () => {
  const roll = makeRoller([KING, JACK, KING, NEGRO]);
  let s = setup4(roll);
  for (let i = 0; i < 4; i++) s = go(s, { type: 'DRAW_ROLL' }, roll);
  eq(s.phase, 'draw'); deepEq(s.draw.contenders, [0, 2]);
  roll.push(QUEEN, ACE);
  s = go(s, { type: 'DRAW_ROLL' }, roll);
  s = go(s, { type: 'DRAW_ROLL' }, roll);
  eq(s.phase, 'draw-done'); eq(s.draw.opener, 2);
  s = go(s, { type: 'CONTINUE' }, roll);
  eq(s.phase, 'turn'); eq(s.turn.player, 2); eq(s.round.openerIdx, 2); deepEq(s.round.order, [2, 3, 0, 1]);
  eq(s.turn.maxRolls, 3);
});
test('opener stopping after 1 roll caps everyone at 1; their single ROLL completes the turn, STOP closes it', () => {
  const roll = makeRoller([]);
  let s = drawTo(setup4(roll), roll, 0);
  roll.push(KING, QUEEN, JACK, GALLEGO, NEGRO);
  s = go(s, { type: 'ROLL' }, roll);
  eq(s.turn.rollsUsed, 1);
  s = go(s, { type: 'STOP' }, roll);
  eq(s.round.rollCap, 1); eq(s.turn.player, 1); eq(s.turn.maxRolls, 1);
  roll.push(NEGRO, NEGRO, QUEEN, JACK, GALLEGO);
  s = go(s, { type: 'ROLL' }, roll);
  eq(s.phase, 'turn'); eq(s.turn.player, 1, 'still on the table so the dice can be seen'); ok(G.turnComplete(s));
  eq(G.reduce(s, { type: 'ROLL' }, roll), s, 'no more rolls');
  eq(G.reduce(s, { type: 'TOGGLE_HOLD', i: 0 }, roll), s, 'no holding after the last roll');
  s = go(s, { type: 'STOP' }, roll);
  eq(s.turn.player, 2); eq(s.turn.maxRolls, 1);
  ok(s.round.results[1], 'result recorded');
});
test('opener using all 3 rolls: cap 3, holds respected', () => {
  const roll = makeRoller([]);
  let s = drawTo(setup4(roll), roll, 0);
  roll.push(KING, KING, NEGRO, NEGRO, QUEEN);
  s = go(s, { type: 'ROLL' }, roll);
  s = go(s, { type: 'TOGGLE_HOLD', i: 0 }, roll);
  s = go(s, { type: 'TOGGLE_HOLD', i: 1 }, roll);
  roll.push(KING, JACK, GALLEGO);
  s = go(s, { type: 'ROLL' }, roll);
  deepEq(s.turn.dice, [KING, KING, KING, JACK, GALLEGO]);
  eq(s.turn.hand.count, 3);
  s = go(s, { type: 'TOGGLE_HOLD', i: 2 }, roll);
  roll.push(QUEEN, QUEEN);
  s = rollAndSettle(s, roll);
  eq(s.round.rollCap, 3); eq(s.turn.player, 1); eq(s.turn.maxRolls, 3);
  deepEq(s.round.results[0].dice, [KING, KING, KING, QUEEN, QUEEN]);
});
test('mid-turn carabina by 2nd player ends the round immediately; winner opens next', () => {
  const roll = makeRoller([]);
  let s = drawTo(setup4(roll), roll, 0);
  roll.push(KING, QUEEN, JACK, GALLEGO, NEGRO); s = go(s, { type: 'ROLL' }, roll); s = go(s, { type: 'STOP' }, roll);
  eq(s.turn.player, 1);
  roll.push(KING, KING, ACE, ACE, KING);
  s = go(s, { type: 'ROLL' }, roll);
  eq(s.phase, 'round-end');
  eq(Object.keys(s.round.results).length, 2);
  eq(s.round.carabina.player, 1);
  eq(s.round.winner, 1); eq(s.round.patasAwarded, 2);
  eq(s.players[1].patas, 2); eq(s.players[1].carabinas, 1); eq(s.players[1].roundsWon, 1);
  s = go(s, { type: 'CONTINUE' }, roll);
  eq(s.phase, 'turn'); eq(s.round.number, 2); eq(s.round.openerIdx, 1); eq(s.turn.player, 1); eq(s.turn.maxRolls, 3);
});
test('natural five kings = 5 patas', () => {
  const roll = makeRoller([]);
  let s = drawTo(setup4(roll), roll, 0);
  roll.push(KING, KING, KING, KING, KING);
  s = go(s, { type: 'ROLL' }, roll);
  eq(s.phase, 'round-end'); eq(s.round.patasAwarded, 5); eq(s.round.winningHand.name, 'Carabina de Reyes Naturales');
});
test('desempate: tied best hands re-roll; three-way then two-way', () => {
  const roll = makeRoller([]);
  let s = drawTo(setup4(roll), roll, 0);
  // everyone: pair of kings, one roll each
  roll.push(KING, KING, QUEEN, JACK, NEGRO); s = go(s, { type: 'ROLL' }, roll); s = go(s, { type: 'STOP' }, roll);
  roll.push(KING, KING, JACK, GALLEGO, NEGRO); s = rollAndSettle(s, roll);
  roll.push(KING, KING, QUEEN, GALLEGO, NEGRO); s = rollAndSettle(s, roll);
  roll.push(QUEEN, QUEEN, JACK, GALLEGO, NEGRO); s = rollAndSettle(s, roll);
  eq(s.phase, 'desempate'); deepEq(s.desempate.contenders, [0, 1, 2]);
  roll.push(QUEEN, QUEEN, QUEEN, JACK, NEGRO); s = go(s, { type: 'ROLL' }, roll);
  roll.push(QUEEN, QUEEN, QUEEN, GALLEGO, NEGRO); s = go(s, { type: 'ROLL' }, roll);
  roll.push(KING, JACK, JACK, GALLEGO, NEGRO); s = go(s, { type: 'ROLL' }, roll);
  eq(s.phase, 'desempate'); deepEq(s.desempate.contenders, [0, 1]);
  roll.push(KING, QUEEN, JACK, GALLEGO, NEGRO); s = go(s, { type: 'ROLL' }, roll);
  roll.push(NEGRO, NEGRO, QUEEN, JACK, GALLEGO); s = go(s, { type: 'ROLL' }, roll);
  eq(s.phase, 'round-end'); eq(s.round.winner, 1); eq(s.round.patasAwarded, 1); eq(s.players[1].patas, 1);
});
test('Carabina de Ases = 10 patas → game over on CONTINUE', () => {
  const roll = makeRoller([]);
  let s = drawTo(setup4(roll), roll, 3);
  roll.push(ACE, ACE, ACE, ACE, ACE);
  s = go(s, { type: 'ROLL' }, roll);
  eq(s.round.patasAwarded, 10);
  s = go(s, { type: 'CONTINUE' }, roll);
  eq(s.phase, 'game-over'); eq(s.winner, 3);
  s = go(s, { type: 'REMATCH' }, roll);
  eq(s.players[3].patas, 0); ok(s.phase === 'draw' || s.phase === 'handoff');
});
test('illegal actions are no-ops returning the same object', () => {
  const roll = makeRoller([]);
  let s = drawTo(setup4(roll), roll, 0);
  eq(G.reduce(s, { type: 'TOGGLE_HOLD', i: 0 }, roll), s, 'hold before roll');
  eq(G.reduce(s, { type: 'STOP' }, roll), s, 'stop before roll');
  roll.push(KING, QUEEN, JACK, GALLEGO, NEGRO); s = go(s, { type: 'ROLL' }, roll);
  roll.push(1, 2, 3, 4, 5); s = go(s, { type: 'ROLL' }, roll);
  roll.push(1, 2, 3, 4, 5); s = rollAndSettle(s, roll);
  eq(s.turn.player, 1);
  eq(G.reduce(s, { type: 'CONTINUE' }, roll), s, 'continue during turn');
});
test('state survives JSON round trip through a whole scripted round', () => {
  const roll = makeRoller([]);
  let s = drawTo(setup4(roll), roll, 0);
  let steps = 0;
  while (s.phase !== 'round-end' && steps++ < 60) {
    s = rollAndSettle(s, roll);
    deepEq(JSON.parse(JSON.stringify(s)), s);
  }
  eq(s.phase, 'round-end');
});
test('handoff fires only when the next human differs from the phone holder', () => {
  const roll = makeRoller([]);
  let s = drawTo(setup4(roll), roll, 0);
  eq(s.phoneHolder, 0);
  roll.push(KING, QUEEN, JACK, GALLEGO, NEGRO);
  s = G.reduce(s, { type: 'ROLL' }, roll);
  s = G.reduce(s, { type: 'STOP' }, roll);
  eq(s.phase, 'handoff'); eq(s.handoff.to, 1);
  s = G.reduce(s, { type: 'CONTINUE' }, roll);
  eq(s.phase, 'turn'); eq(s.phoneHolder, 1);
  roll.push(1, 2, 3, 4, 5); s = G.reduce(s, { type: 'ROLL' }, roll);
  s = G.reduce(s, { type: 'STOP' }, roll);
  eq(s.phase, 'turn'); eq(s.turn.player, 2, 'AI seat needs no handoff');
});
test('aiInputs reflects table state', () => {
  const roll = makeRoller([]);
  let s = drawTo(setup4(roll), roll, 0);
  roll.push(KING, KING, KING, JACK, NEGRO); s = go(s, { type: 'ROLL' }, roll); s = go(s, { type: 'STOP' }, roll);
  const inp = G.aiInputs(s);
  eq(inp.isOpener, false); eq(inp.opponentsAfter, 2); eq(inp.rollCap, 1); eq(inp.bestOnTable.count, 3); eq(inp.maxRolls, 1);
});

/* ---------- AI ---------- */
const H = (str) => R.evaluate(R.parseDice(str));
test('AI holds four kings and rerolls the odd die', () => {
  const d = AI.decide({ dice: R.parseDice('K K K K 9'), held: [false, false, false, false, false], rollsUsed: 1, maxRolls: 3, isOpener: true, bestOnTable: null, opponentsAfter: 1, rollCap: null });
  deepEq(d.hold, [true, true, true, true, false]); eq(d.stop, false);
});
test('AI stops on a carabina', () => {
  const d = AI.decide({ dice: R.parseDice('A A A A 9'), held: [false, false, false, false, false], rollsUsed: 1, maxRolls: 3, isOpener: true, bestOnTable: null, opponentsAfter: 1, rollCap: null });
  eq(d.stop, true);
});
test('AI as last player facing four kings does not stop on a pair', () => {
  const d = AI.decide({ dice: R.parseDice('Q Q J 10 9'), held: [false, false, false, false, false], rollsUsed: 1, maxRolls: 3, isOpener: false, bestOnTable: H('K K K K 9'), opponentsAfter: 0, rollCap: 3 });
  eq(d.stop, false);
});
test('AI as last player already winning keeps the winning dice and rolls for a carabina', () => {
  const d = AI.decide({ dice: R.parseDice('K K K J 9'), held: [false, false, false, false, false], rollsUsed: 1, maxRolls: 3, isOpener: false, bestOnTable: H('Q Q J 10 9'), opponentsAfter: 0, rollCap: 3 });
  eq(d.stop, false); deepEq(d.hold, [true, true, true, false, false]);
});
test('AI as last player facing a stronger hand that it cannot beat by holding rolls everything useful', () => {
  const d = AI.decide({ dice: R.parseDice('Q Q 9 9 J'), held: [false, false, false, false, false], rollsUsed: 2, maxRolls: 3, isOpener: false, bestOnTable: H('K K K K 9'), opponentsAfter: 0, rollCap: 3 });
  eq(d.stop, false);
});
test('AI opener with three kings on roll 1 and 5 opponents prefers to stop and cap (or not) — decision is sane', () => {
  const d = AI.decide({ dice: R.parseDice('K K K J 9'), held: [false, false, false, false, false], rollsUsed: 1, maxRolls: 3, isOpener: true, bestOnTable: null, opponentsAfter: 5, rollCap: null });
  if (!d.stop) deepEq(d.hold, [true, true, true, false, false]);
});
test('AI keeps the ace when it counts toward the held face', () => {
  const d = AI.decide({ dice: R.parseDice('A K K 10 9'), held: [false, false, false, false, false], rollsUsed: 1, maxRolls: 3, isOpener: true, bestOnTable: null, opponentsAfter: 2, rollCap: null });
  eq(d.stop, false); deepEq(d.hold, [true, true, true, false, false]);
});
test('AI prefers previously held dice when mapping the hold', () => {
  const d = AI.decide({ dice: R.parseDice('K 9 K J 9'), held: [false, false, true, false, false], rollsUsed: 1, maxRolls: 3, isOpener: true, bestOnTable: null, opponentsAfter: 1, rollCap: null });
  ok(d.hold[2], 'kept index 2');
});
test('AI decide runs under 50ms after warm-up', () => {
  const inp = { dice: R.parseDice('K Q J 10 9'), held: [false, false, false, false, false], rollsUsed: 1, maxRolls: 3, isOpener: true, bestOnTable: null, opponentsAfter: 3, rollCap: null };
  AI.decide(inp);
  const t0 = Date.now();
  for (let i = 0; i < 5; i++) AI.decide(inp);
  ok((Date.now() - t0) / 5 < 50, 'too slow: ' + (Date.now() - t0) / 5 + 'ms');
});
test('P_BEAT is embedded and equals computePBeat()', () => {
  ok(AI.P_BEAT, 'P_BEAT not generated — run node tools/gen_pbeat.js');
  deepEq(AI.P_BEAT, AI.computePBeat());
});
test('P_BEAT is monotone in rolls and in target strength', () => {
  const T = AI.P_BEAT || AI.computePBeat();
  const classes = Object.keys(T[1]);
  for (const c of classes) ok(T[1][c] <= T[2][c] + 1e-9 && T[2][c] <= T[3][c] + 1e-9, 'rolls monotone ' + c);
  const rank = (c) => Number(c[0]) * 10 + Number(c[1]);
  const sorted = classes.slice().sort((a, b) => rank(a) - rank(b));
  for (let cap = 1; cap <= 3; cap++) for (let i = 1; i < sorted.length; i++) ok(T[cap][sorted[i]] <= T[cap][sorted[i - 1]] + 1e-9, 'target monotone ' + sorted[i]);
  ok(T[3]['15'] > 0.9, 'beating K-high with 3 rolls should be near certain');
  ok(T[1]['45'] < 0.05, 'beating four kings with 1 roll is rare');
});

/* ---------- build guards (node only) ---------- */
if (isNode) {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const root = new URL('..', import.meta.url).pathname;
  test('sw.js PRECACHE lists every shipped file', () => {
    const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
    const list = [...sw.matchAll(/'(\.\/[^']+)'/g)].map((m) => m[1]);
    const shipped = ['./index.html', './manifest.webmanifest'];
    for (const dir of ['js', 'css', 'icons']) for (const f of fs.readdirSync(path.join(root, dir))) if (!f.startsWith('.')) shipped.push(`./${dir}/${f}`);
    for (const f of shipped) ok(list.includes(f), 'missing from PRECACHE: ' + f);
    for (const f of list) if (f !== './') ok(fs.existsSync(path.join(root, f)), 'PRECACHE names missing file: ' + f);
  });
  test('sw.js VERSION matches js/version.js APP_VERSION', () => {
    const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
    eq(sw.match(/const VERSION = '([^']+)'/)[1], APP_VERSION);
  });
}

print(`\n${pass} passed, ${fail} failed`);
if (isNode) process.exitCode = fail ? 1 : 0;
export const results = { out, pass, fail };
