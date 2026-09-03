// Pure rules engine for Cuban Cubilete. No DOM, no randomness, no storage.

export const NEGRO = 1;   // 9  — "Negro"
export const GALLEGO = 2; // 10 — "Gallego"
export const JACK = 3;    // J  — "Jeva"
export const QUEEN = 4;   // Q  — "Cundanga"
export const KING = 5;    // K  — "Rey"
export const ACE = 6;     // A  — "As" (wild, drawn as a spade)

export const FACES = [NEGRO, GALLEGO, JACK, QUEEN, KING, ACE];
export const NON_ACE_FACES_DESC = [KING, QUEEN, JACK, GALLEGO, NEGRO];

export const FACE_NAME = { 1: 'Negro', 2: 'Gallego', 3: 'Jeva', 4: 'Cundanga', 5: 'Rey', 6: 'As' };
export const FACE_PLURAL = { 1: 'Negros', 2: 'Gallegos', 3: 'Jevas', 4: 'Cundangas', 5: 'Reyes', 6: 'Ases' };
export const FACE_SHORT = { 1: '9', 2: '10', 3: 'J', 4: 'Q', 5: 'K', 6: 'A' };

/** Parse "A K Q J 10 9" style strings into face ints (handy for tests). */
export function parseDice(str) {
  const map = { A: ACE, K: KING, Q: QUEEN, J: JACK, '10': GALLEGO, '9': NEGRO };
  return str.trim().split(/\s+/).map((t) => {
    const v = map[t.toUpperCase()];
    if (!v) throw new Error('bad die token ' + t);
    return v;
  });
}

/**
 * Evaluate five dice. Aces are wild toward any other face.
 * Returns { count, face, natural, aces, isCarabina, name }.
 */
export function evaluate(dice) {
  if (!Array.isArray(dice) || dice.length !== 5) throw new Error('evaluate needs 5 dice');
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const d of dice) counts[d]++;
  const aces = counts[ACE];
  let best;
  if (aces === 5) {
    best = { count: 5, face: ACE, natural: true, aces };
  } else {
    for (const f of NON_ACE_FACES_DESC) {
      const count = counts[f] + aces;
      // faces iterate high→low, so a strictly greater count is needed to replace
      if (!best || count > best.count) best = { count, face: f, natural: aces === 0, aces };
    }
  }
  best.isCarabina = best.count === 5;
  best.name = best.isCarabina ? carabinaName(best) : null;
  return best;
}

/** >0 if a beats b, <0 if b beats a, 0 tie. Naturalness is not a ranking key. */
export function compare(a, b) {
  if (a.count !== b.count) return a.count - b.count;
  return a.face - b.face;
}

/** Patas awarded to the round winner for this hand. */
export function scoreFor(hand) {
  if (hand.count < 5) return 1;
  if (hand.face === ACE) return 10;
  if (hand.face === KING) return hand.natural ? 5 : 2;
  return 1;
}

export function carabinaName(hand) {
  if (hand.count !== 5) return null;
  if (hand.face === ACE) return 'Carabina de Ases';
  if (hand.face === KING) return hand.natural ? 'Carabina de Reyes Naturales' : 'Carabina de Reyes No Naturales';
  return 'Carabina de ' + FACE_PLURAL[hand.face];
}

/** Best hand among an array of hands; returns { best, winners: [indices] }. */
export function bestOf(hands) {
  let best = null;
  let winners = [];
  hands.forEach((h, i) => {
    if (!h) return;
    if (!best || compare(h, best) > 0) { best = h; winners = [i]; }
    else if (compare(h, best) === 0) winners.push(i);
  });
  return { best, winners };
}
