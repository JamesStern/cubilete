// A guided first round: scripted dice plus a sequence of coach steps. Pure.
// Dice queue (consumed by rollDie in tutorial mode), in the order the reducer asks for them:
//   draw: Hudson 6 (As), Ignacio 1 (Negro)
//   Hudson roll 1: K K Q 10 9 → keep the two Reyes
//   Hudson roll 2 (dice 3-5): A J 9   → K K A J 9 = Three Reyes → keep the As too
//   Hudson roll 3 (dice 4-5): K 9     → K K A K 9 = Four Reyes
//   Ignacio: Q Q Q J 9 → keeps QQQ → Q 9 → keeps QQQQ → J  = Four Cundangas
export const TUTORIAL_QUEUE = [6, 1, 5, 5, 4, 2, 1, 6, 3, 1, 5, 1, 4, 4, 4, 3, 1, 4, 1, 3];

export const TUTORIAL_SEATS = [{ name: 'Hudson', type: 'human' }, { name: 'Ignacio', type: 'ai', level: 'sharp' }];

const maskMatch = (s, mask) => s.phase === 'turn' && s.turn.held.every((h, i) => h === !!mask[i]);

/**
 * Each step: `allow` lists the UI actions permitted ('draw','continue','roll','hold'); `done(state)` advances;
 * `next` shows a Next button (true, or the action it dispatches); `mask` marks dice to keep; `holdSettle` pauses the auto-stand.
 */
export const TUTORIAL_STEPS = [
  { id: 'welcome', allow: [], next: true },
  { id: 'faces', allow: [], next: true, faces: true },
  { id: 'draw', allow: ['draw'], done: (s) => s.phase === 'draw-done' },
  { id: 'drawDone', allow: ['continue'], done: (s) => s.phase === 'turn' },
  { id: 'roll1', allow: ['roll'], done: (s) => s.phase === 'turn' && s.turn.rollsUsed >= 1 },
  { id: 'hold', allow: ['hold'], mask: [1, 1, 0, 0, 0], done: (s) => maskMatch(s, [1, 1, 0, 0, 0]) },
  { id: 'roll2', allow: ['roll'], done: (s) => s.phase === 'turn' && s.turn.rollsUsed >= 2 },
  { id: 'holdAce', allow: ['hold'], mask: [1, 1, 1, 0, 0], done: (s) => maskMatch(s, [1, 1, 1, 0, 0]) },
  { id: 'roll3', allow: ['roll'], done: (s) => s.phase === 'turn' && s.turn.rollsUsed >= 3 },
  { id: 'final', allow: [], next: 'stop', holdSettle: true },
  { id: 'ignacio', allow: [], done: (s) => s.phase === 'round-end' },
  { id: 'result', allow: [], next: true },
  { id: 'carabina', allow: [], next: true },
  { id: 'done', allow: [], finish: true },
];
