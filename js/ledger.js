// The bar tab: who owes rounds, and the all-time record. Pure; storage is ui.js's job.
import { compare } from './rules.js';

export const LEDGER_KEY = 'cubilete.ledger.v1';

export function emptyLedger() {
  return { v: 1, players: {}, games: [], recorded: [] };
}

function betterHand(a, b) {
  if (!a) return false;
  if (!b) return true;
  const c = compare(a, b);
  return c > 0 || (c === 0 && a.natural && !b.natural);
}

/** Index of the player who buys the round: fewest patas, then fewer rounds won, then the later seat. */
export function buyerOf(state) {
  let best = null;
  for (const p of state.players) {
    if (best === null) { best = p; continue; }
    if (p.patas < best.patas || (p.patas === best.patas && (p.roundsWon < best.roundsWon || (p.roundsWon === best.roundsWon && p.id > best.id)))) best = p;
  }
  return best ? best.id : null;
}

function row(L, name, type) {
  return (L.players[name] ||= { games: 0, wins: 0, patas: 0, roundsWon: 0, carabinas: 0, bestHand: null, drinksOwed: 0, drinksBought: 0, hints: 0, type });
}

/** Fold a finished game into the ledger. Idempotent per state.gameId. */
export function recordGame(ledger, state, now = Date.now()) {
  if (state.phase !== 'game-over' || state.tutorial || !state.gameId || ledger.recorded.includes(state.gameId)) return ledger;
  const L = JSON.parse(JSON.stringify(ledger));
  const buyer = buyerOf(state);
  for (const p of state.players) {
    const r = row(L, p.name, p.type);
    r.games++;
    if (p.id === state.winner) r.wins++;
    r.patas += p.patas;
    r.roundsWon += p.roundsWon;
    r.carabinas += p.carabinas;
    r.hints += p.hints || 0;
    r.type = p.type;
    if (betterHand(p.bestHand, r.bestHand)) r.bestHand = { count: p.bestHand.count, face: p.bestHand.face, natural: p.bestHand.natural, name: p.bestHand.name || null };
    if (p.id === buyer) r.drinksOwed++;
  }
  L.games.unshift({
    id: state.gameId, date: now, target: state.targetPatas,
    players: state.players.map((p) => ({ name: p.name, patas: p.patas, type: p.type })),
    winner: state.players[state.winner].name, buyer: state.players[buyer].name,
  });
  L.games = L.games.slice(0, 50);
  L.recorded.push(state.gameId);
  L.recorded = L.recorded.slice(-200);
  return L;
}

/** Mark rounds as bought — for one player, or everyone. */
export function settleUp(ledger, name) {
  const L = JSON.parse(JSON.stringify(ledger));
  for (const [n, r] of Object.entries(L.players)) {
    if (name && n !== name) continue;
    r.drinksBought += r.drinksOwed;
    r.drinksOwed = 0;
  }
  return L;
}

/** Rows for display: most wins first, then most games, then name. */
export function standings(ledger) {
  return Object.entries(ledger.players)
    .map(([name, r]) => ({ name, ...r, winRate: r.games ? r.wins / r.games : 0 }))
    .sort((a, b) => b.wins - a.wins || b.games - a.games || a.name.localeCompare(b.name));
}

export function totalOwed(ledger) {
  return Object.values(ledger.players).reduce((n, r) => n + r.drinksOwed, 0);
}
