// Pure, serializable game state machine for Cubilete. reduce(state, action, rollDie) → new state.
// rollDie() must return an int 1..6 (face constants from rules.js). No DOM, no storage.
import { evaluate, compare, scoreFor, bestOf } from './rules.js';
import { personaFor } from './personas.js';

export const DEFAULT_NAMES = ['Hudson', 'Ignacio', 'Papa', 'Honest Lil', 'Pedrico', 'Constante'];
export const MAX_ROLLS = 3;
export const MAX_LOG = 40;

export function initialState() {
  return {
    version: 1,
    phase: 'setup',
    players: [],
    targetPatas: 10,
    phoneHolder: null,
    draw: null,
    round: null,
    turn: null,
    desempate: null,
    handoff: null,
    log: [],
    settings: { muted: false, lang: 'en' },
  };
}

const clone = (s) => JSON.parse(JSON.stringify(s));

function log(s, k, p = {}) {
  s.log.push({ k, p });
  if (s.log.length > MAX_LOG) s.log.splice(0, s.log.length - MAX_LOG);
}

const name = (s, i) => s.players[i].name;

function humanCount(s) {
  return s.players.filter((p) => p.type === 'human').length;
}

/** Gate a phase behind the pass-the-phone interstitial when a different human must act. */
function gate(s, playerIdx, resume) {
  const p = s.players[playerIdx];
  if (p.type === 'human' && s.phoneHolder !== playerIdx) {
    s.handoff = { to: playerIdx, resume };
    s.phase = 'handoff';
  } else {
    s.handoff = null;
    s.phase = resume;
  }
}

function startDraw(s, contenders) {
  s.draw = { contenders, ptr: 0, rolls: {} };
  gate(s, contenders[0], 'draw');
}

function startRound(s, openerIdx, number) {
  const n = s.players.length;
  const order = [];
  for (let k = 0; k < n; k++) order.push((openerIdx + k) % n);
  s.round = {
    number, openerIdx, rollCap: null, order, turnPtr: 0,
    results: {}, carabina: null, winner: null, patasAwarded: 0,
  };
  s.desempate = null;
  newTurn(s, order[0], MAX_ROLLS);
}

function newTurn(s, playerIdx, maxRolls) {
  s.turn = { player: playerIdx, dice: null, held: [false, false, false, false, false], rollsUsed: 0, maxRolls, hand: null };
  gate(s, playerIdx, 'turn');
}

/** Remember each player's best hand of the game (for the record). */
function noteHand(s, idx, hand) {
  const p = s.players[idx];
  const b = p.bestHand;
  const c = b ? compare(hand, b) : 1;
  if (c > 0 || (c === 0 && hand.natural && !b.natural)) p.bestHand = { count: hand.count, face: hand.face, natural: hand.natural, name: hand.name };
}

function newGameId() {
  // not from rollDie: the scripted roller in tests must not be consumed by ids
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function finishTurn(s) {
  const t = s.turn;
  const r = s.round;
  r.results[t.player] = { dice: t.dice.slice(), hand: t.hand, rolls: t.rollsUsed };
  noteHand(s, t.player, t.hand);
  if (r.turnPtr === 0) {
    r.rollCap = t.rollsUsed;
    if (r.rollCap < MAX_ROLLS) log(s, 'log.cap', { name: name(s, t.player), n: r.rollCap });
  }
  log(s, 'log.hand', { name: name(s, t.player), hand: t.hand });
  r.turnPtr++;
  if (r.turnPtr < r.order.length) {
    newTurn(s, r.order[r.turnPtr], r.rollCap);
  } else {
    resolve(s);
  }
}

function resolve(s) {
  const r = s.round;
  const idxs = r.order.filter((i) => r.results[i]);
  const { winners } = bestOf(idxs.map((i) => r.results[i].hand));
  const tied = winners.map((w) => idxs[w]);
  if (tied.length === 1) {
    endRound(s, tied[0], r.results[tied[0]].hand);
  } else {
    log(s, 'log.tie', { names: tied.map((i) => name(s, i)) });
    startDesempate(s, tied);
  }
}

function startDesempate(s, contenders) {
  s.turn = null;
  s.desempate = { contenders, ptr: 0, results: {} };
  gate(s, contenders[0], 'desempate');
}

function endRound(s, winnerIdx, hand) {
  const r = s.round;
  const patas = scoreFor(hand);
  const p = s.players[winnerIdx];
  p.patas += patas;
  p.roundsWon++;
  if (hand.count === 5) p.carabinas++;
  r.winner = winnerIdx;
  r.patasAwarded = patas;
  r.winningHand = hand;
  s.turn = null;
  s.desempate = null;
  s.handoff = null;
  if (hand.count === 5) log(s, 'log.carabina', { name: p.name, hand, n: patas });
  else log(s, 'log.pata', { name: p.name, hand });
  s.phase = 'round-end';
}

function rollFive(rollDie) {
  return [rollDie(), rollDie(), rollDie(), rollDie(), rollDie()];
}

export function reduce(prev, action, rollDie) {
  const s = clone(prev);
  switch (action.type) {
    case 'SETUP_CONFIRM': {
      const seats = action.players;
      if (!seats || seats.length < 2 || seats.length > 6) return prev;
      s.players = seats.map((p, i) => {
        const nm = (p.name || DEFAULT_NAMES[i]).trim().slice(0, 16) || DEFAULT_NAMES[i];
        const type = p.type === 'ai' ? 'ai' : 'human';
        return {
          id: i, name: nm, type, patas: 0, roundsWon: 0, carabinas: 0, bestHand: null, hints: 0,
          persona: type === 'ai' ? (p.persona || personaFor(nm, i)) : null,
          level: type === 'ai' ? (p.level === 'casual' ? 'casual' : 'sharp') : null,
        };
      });
      s.targetPatas = [5, 10, 15].includes(action.targetPatas) ? action.targetPatas : 10;
      s.gameId = newGameId();
      s.log = [];
      // one human at the table never needs to pass the phone
      s.phoneHolder = humanCount(s) === 1 ? s.players.findIndex((p) => p.type === 'human') : null;
      log(s, 'log.draw');
      startDraw(s, s.players.map((p) => p.id));
      return s;
    }
    case 'DRAW_ROLL': {
      if (s.phase !== 'draw') return prev;
      const d = s.draw;
      const who = d.contenders[d.ptr];
      d.rolls[who] = rollDie();
      d.ptr++;
      if (d.ptr < d.contenders.length) {
        gate(s, d.contenders[d.ptr], 'draw');
        return s;
      }
      let hi = 0;
      for (const i of d.contenders) hi = Math.max(hi, d.rolls[i]);
      const tied = d.contenders.filter((i) => d.rolls[i] === hi);
      if (tied.length > 1) {
        log(s, 'log.drawTie', { face: hi, names: tied.map((i) => name(s, i)) });
        s.draw = { contenders: tied, ptr: 0, rolls: {}, previous: d.rolls };
        gate(s, tied[0], 'draw');
        return s;
      }
      log(s, 'log.opener', { name: name(s, tied[0]), face: hi });
      s.draw = { ...d, done: true, opener: tied[0] };
      s.phase = 'draw-done';
      return s;
    }
    case 'CONTINUE': {
      if (s.phase === 'handoff') {
        s.phoneHolder = s.handoff.to;
        s.phase = s.handoff.resume;
        s.handoff = null;
        return s;
      }
      if (s.phase === 'draw-done') {
        startRound(s, s.draw.opener, 1);
        s.draw = null;
        return s;
      }
      if (s.phase === 'round-end') {
        const r = s.round;
        if (s.players.some((p) => p.patas >= s.targetPatas)) {
          s.phase = 'game-over';
          s.winner = s.players.reduce((b, p) => (p.patas > s.players[b].patas ? p.id : b), 0);
          log(s, 'log.win', { name: name(s, s.winner) });
          return s;
        }
        startRound(s, r.winner, r.number + 1);
        return s;
      }
      return prev;
    }
    case 'ROLL': {
      if (s.phase === 'turn') {
        const t = s.turn;
        if (t.rollsUsed >= t.maxRolls) return prev;
        if (t.dice === null) t.dice = rollFive(rollDie);
        else t.dice = t.dice.map((v, i) => (t.held[i] ? v : rollDie()));
        t.rollsUsed++;
        t.hand = evaluate(t.dice);
        t.lastRolled = t.held.map((h) => !h);
        if (t.hand.count === 5) {
          s.round.results[t.player] = { dice: t.dice.slice(), hand: t.hand, rolls: t.rollsUsed };
          noteHand(s, t.player, t.hand);
          s.round.carabina = { player: t.player, hand: t.hand };
          endRound(s, t.player, t.hand);
          return s;
        }
        return s;
      }
      if (s.phase === 'desempate') {
        const d = s.desempate;
        if (d.ptr >= d.contenders.length) return prev;
        const who = d.contenders[d.ptr];
        const dice = rollFive(rollDie);
        const hand = evaluate(dice);
        d.results[who] = { dice, hand };
        noteHand(s, who, hand);
        log(s, 'log.desempateRoll', { name: name(s, who), hand });
        d.ptr++;
        if (d.ptr < d.contenders.length) gate(s, d.contenders[d.ptr], 'desempate');
        // else: all have rolled — the table shows the last hand until STOP resolves it
        return s;
      }
      return prev;
    }
    case 'TOGGLE_HOLD': {
      if (s.phase !== 'turn') return prev;
      const t = s.turn;
      if (t.rollsUsed < 1 || t.rollsUsed >= t.maxRolls) return prev;
      const i = action.i;
      if (i < 0 || i > 4) return prev;
      t.held[i] = !t.held[i];
      return s;
    }
    case 'SET_HOLD': {
      if (s.phase !== 'turn') return prev;
      const t = s.turn;
      if (t.rollsUsed < 1 || t.rollsUsed >= t.maxRolls) return prev;
      t.held = action.held.slice(0, 5).map(Boolean);
      return s;
    }
    case 'STOP': {
      if (s.phase === 'desempate') {
        const d = s.desempate;
        if (d.ptr < d.contenders.length) return prev;
        const { winners } = bestOf(d.contenders.map((i) => d.results[i].hand));
        const tied = winners.map((w) => d.contenders[w]);
        if (tied.length === 1) {
          if (d.results[tied[0]].hand.count === 5) s.round.carabina = { player: tied[0], hand: d.results[tied[0]].hand };
          s.round.desempate = d;
          endRound(s, tied[0], d.results[tied[0]].hand);
        } else {
          log(s, 'log.tieAgain');
          startDesempate(s, tied);
        }
        return s;
      }
      if (s.phase !== 'turn') return prev;
      if (s.turn.rollsUsed < 1) return prev;
      finishTurn(s);
      return s;
    }
    case 'HINT_USED': {
      if (s.phase !== 'turn') return prev;
      s.players[s.turn.player].hints = (s.players[s.turn.player].hints || 0) + 1;
      return s;
    }
    case 'REMATCH': {
      if (s.phase !== 'game-over') return prev;
      for (const p of s.players) { p.patas = 0; p.roundsWon = 0; p.carabinas = 0; p.bestHand = null; p.hints = 0; }
      s.gameId = newGameId();
      s.winner = null;
      s.round = null;
      s.log = [];
      log(s, 'log.rematch');
      startDraw(s, s.players.map((p) => p.id));
      return s;
    }
    case 'NEW_GAME': {
      const fresh = initialState();
      fresh.settings = s.settings;
      fresh.lastPlayers = s.players.map((p) => ({ name: p.name, type: p.type, level: p.level }));
      fresh.lastTarget = s.targetPatas;
      return fresh;
    }
    case 'SET_SETTING': {
      s.settings[action.key] = action.value;
      return s;
    }
    default:
      return prev;
  }
}

/* ---------- selectors ---------- */

/** Index of the player whose input drives the current phase, or null. */
export function currentActor(s) {
  switch (s.phase) {
    case 'handoff': return s.handoff.to;
    case 'draw': return s.draw.contenders[s.draw.ptr];
    case 'turn': return s.turn.player;
    case 'desempate': return s.desempate.contenders[Math.min(s.desempate.ptr, s.desempate.contenders.length - 1)];
    default: return null;
  }
}

/** True when the current turn has used every roll and only needs to be closed with STOP. */
export function turnComplete(s) {
  if (s.phase === 'desempate') return s.desempate.ptr >= s.desempate.contenders.length;
  return s.phase === 'turn' && s.turn.dice !== null && s.turn.rollsUsed >= s.turn.maxRolls;
}

export function isAiToAct(s) {
  const a = currentActor(s);
  return a !== null && s.phase !== 'handoff' && s.players[a].type === 'ai';
}

/** Best hand already on the table this round (excluding the current player), or null. */
export function bestOnTable(s) {
  const r = s.round;
  if (!r) return null;
  const hands = r.order.filter((i) => r.results[i] && (!s.turn || i !== s.turn.player)).map((i) => r.results[i].hand);
  return bestOf(hands).best;
}

/** Inputs for ai.decide() from the current turn. */
export function aiInputs(s) {
  const r = s.round;
  const t = s.turn;
  return {
    dice: t.dice, held: t.held, rollsUsed: t.rollsUsed, maxRolls: t.maxRolls,
    isOpener: r.turnPtr === 0,
    bestOnTable: bestOnTable(s),
    opponentsAfter: r.order.length - r.turnPtr - 1,
    rollCap: r.rollCap,
  };
}

export { compare };
