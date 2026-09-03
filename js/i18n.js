// UI strings in English (default) and Spanish. Game terms — the faces, the hands, carabinas,
// patas, desempate — stay in their proper Cuban Spanish in both languages.
import { FACE_NAME, FACE_PLURAL } from './rules.js';

export const LANGS = ['en', 'es'];
let lang = 'en';
export function setLang(l) { lang = LANGS.includes(l) ? l : 'en'; }
export function getLang() { return lang; }

const DICT = {
  en: {
    'lang.name': 'English',
    'setup.table': 'The table', 'setup.seats': '2 – 6 seats', 'setup.addSeat': '+ Another seat', 'setup.target': 'First to 10 patas',
    'setup.start': 'Start', 'setup.startSub': 'everyone rolls one die — highest opens', 'setup.rules': 'Rules', 'setup.settings': 'Settings',
    'setup.a2hs': 'To play offline: <b>Share ⇧ → Add to Home Screen</b>, then open it from the icon once while online.',
    'seat.human': 'Person', 'seat.ai': 'Computer', 'seat.name': 'Name', 'seat.player': 'Player {n}',
    'top.round': 'ROUND {n}', 'top.opening': 'OPENING',
    'felt.draw': 'one die each', 'felt.hold': 'tap a die to keep it', 'felt.ai': 'the computer is choosing',
    'msg.drawWhat': 'Roll one die', 'msg.drawSub': 'Highest opens the round', 'msg.drawDone': 'Rolls {face} and opens',
    'msg.open': 'Opens the round', 'msg.shake': 'Shake the cup', 'msg.roll': 'Roll {n} of {max}',
    'msg.rollsUsed': '{n} rolls', 'msg.rollsUsed_1': '1 roll', 'msg.toBeat': 'to beat: <b>{hand}</b> ({name})',
    'msg.cap': 'max {n} rolls', 'msg.cap_1': 'max 1 roll', 'msg.desempate': 'Desempate', 'msg.desempateSub': 'One roll each · {names}',
    'msg.handoff': 'Your roll', 'msg.patas': '+{n} patas', 'msg.patas_1': '+1 pata',
    'btn.drawRoll': 'Roll the die', 'btn.drawRollSub': 'one die', 'btn.waiting': '{name} rolls…',
    'btn.openRound': 'Open the round', 'btn.opens': '{name} opens', 'btn.roll': 'Roll', 'btn.rollFirst': 'shake the cup',
    'btn.rollAgain': 'roll the loose dice', 'btn.stand': 'Stand', 'btn.standSub': 'keep this hand', 'btn.thinking': '{name} is thinking…',
    'btn.tiebreakSub': 'one roll, all five', 'btn.next': 'Next round', 'btn.result': 'See the result',
    'btn.rematch': 'Rematch', 'btn.rematchSub': 'same table', 'btn.newTable': 'New table', 'btn.close': 'Close',
    'resume.title': "There's a game on the table", 'resume.round': 'Round {n}', 'resume.continue': 'Keep playing',
    'settings.title': 'Settings', 'settings.sound': 'Sound', 'settings.soundSub': 'the iPhone silent switch also applies',
    'settings.language': 'Language', 'settings.update': 'Check for updates', 'settings.installed': 'installed on the home screen',
    'settings.browser': 'open in the browser', 'settings.check': 'Check', 'settings.rules': 'Rules', 'settings.view': 'View',
    'settings.abandon': 'Abandon the game', 'settings.abandonSub': 'clears the current table', 'settings.quit': 'Quit',
    'confirm.abandon': 'Abandon the game?',
    'log.title': 'The notebook', 'log.empty': 'Nothing yet.',
    'handoff.title': 'Pass the cup', 'handoff.draw': 'rolls one die', 'handoff.turn': "it's your roll", 'handoff.desempate': 'rolls the desempate', 'handoff.btn': 'I have the cup',
    'roundEnd.title': 'Round {n}', 'roundEnd.has': 'now has {n}', 'roundEnd.tiebreak': 'won the desempate', 'roundEnd.skipped': "didn't get to roll",
    'gameOver.title': 'Game over', 'gameOver.patas': '{n} patas', 'gameOver.buys': '{name} buys the round of daiquiris.',
    'gameOver.rounds': '{n} rounds', 'gameOver.rounds_1': '1 round', 'gameOver.carabinas': '{n} carabinas', 'gameOver.carabinas_1': '1 carabina',
    'toast.noSw': 'No service worker (localhost or https?)', 'toast.offline': 'Offline', 'toast.updating': 'Updating… tap to reload',
    'toast.upToDate': "You're up to date", 'toast.failed': "Couldn't check", 'toast.newVersion': 'New version — tap to reload',
    'log.draw': 'One die each: highest opens.',
    'log.cap': '{name} stands after {n} rolls: everyone else gets at most {n}.', 'log.cap_1': '{name} stands after one roll: everyone else gets one.',
    'log.hand': '{name}: {hand}.', 'log.tie': 'Tie between {names}. Desempate!',
    'log.carabina': '{hand}! {name} takes {n} patas.', 'log.carabina_1': '{hand}! {name} takes 1 pata.',
    'log.pata': 'One pata to {name} with {hand}.', 'log.drawTie': 'Tied on {face}: {names} roll again.',
    'log.opener': '{name} rolls {face} and opens.', 'log.win': '{name} wins the game!', 'log.rematch': 'Rematch. One die each.',
    'log.desempateRoll': 'Desempate — {name}: {hand}.', 'log.tieAgain': 'Tied again. Once more.',
    'hand.high': '{face} high', 'hand.pair': 'Pair of {faces}', 'hand.three': 'Three {faces}', 'hand.four': 'Four {faces}',
    'rules.title': 'How to play Cubilete',
    'rules.faces': 'The faces', 'rules.facesText': 'Highest to lowest: <b>As</b> (♠), <b>Rey</b> (K), <b>Cundanga</b> (Q), <b>Jeva</b> (J), <b>Gallego</b> (10), <b>Negro</b> (9). <b>The As is wild</b>: it counts as any face.',
    'rules.roll': 'The roll', 'rules.roll1': 'Five dice, up to <b>three rolls</b>. Keep any dice and roll the rest again, or stand.',
    'rules.roll2': 'Whoever <b>opens</b> the round sets the cap: if they stand after one roll, everyone else gets one roll.',
    'rules.win': 'Who wins the round', 'rules.win1': 'The hand with <b>the most dice of a kind</b> (counting Ases) wins. Same count: the higher face wins.',
    'rules.win2': 'Tie: the tied players roll once more (a <i>desempate</i>).',
    'rules.win3': 'The winner takes <b>one pata</b> and opens the next round. First to <b>10 patas</b> wins.',
    'rules.carabinas': 'Carabinas', 'rules.c1': '<b>Five of a kind</b> is a carabina: the round ends on the spot and nobody else rolls.',
    'rules.c2': '<b>Carabina de Reyes Naturales</b> (five Reyes, no As): 5 patas.', 'rules.c3': '<b>Carabina de Reyes No Naturales</b> (Reyes with Ases): 2 patas.',
    'rules.c4': '<b>Carabina de Ases</b> (five Ases): 10 patas — wins the game.', 'rules.c5': 'Every other carabina is worth one pata.',
    'quips': ['"Roll as if it didn\'t matter, and let it matter."', 'Constante, another round of Papa Dobles.', 'The sea is still out there. The dice are here.', "Nobody wins every time at the Floridita; but the drinks are good.", "Shake it hard — the cup won't break."],
  },
  es: {
    'lang.name': 'Español',
    'setup.table': 'La mesa', 'setup.seats': '2 – 6 sillas', 'setup.addSeat': '+ Otra silla', 'setup.target': 'Se juega a 10 patas',
    'setup.start': 'Empezar', 'setup.startSub': 'un dado cada uno — el más alto abre', 'setup.rules': 'Reglas', 'setup.settings': 'Ajustes',
    'setup.a2hs': 'Para jugar sin conexión: <b>Compartir ⇧ → Añadir a pantalla de inicio</b>, y ábrelo desde el icono una vez con internet.',
    'seat.human': 'Persona', 'seat.ai': 'Máquina', 'seat.name': 'Nombre', 'seat.player': 'Jugador {n}',
    'top.round': 'RONDA {n}', 'top.opening': 'SALIDA',
    'felt.draw': 'un dado cada uno', 'felt.hold': 'toca un dado para guardarlo', 'felt.ai': 'la máquina elige',
    'msg.drawWhat': 'Tira un dado', 'msg.drawSub': 'El más alto abre la ronda', 'msg.drawDone': 'Saca {face} y abre',
    'msg.open': 'Abre la ronda', 'msg.shake': 'Agita el cubilete', 'msg.roll': 'Tirada {n} de {max}',
    'msg.rollsUsed': '{n} tiradas', 'msg.rollsUsed_1': '1 tirada', 'msg.toBeat': 'a batir: <b>{hand}</b> ({name})',
    'msg.cap': 'máx {n} tiradas', 'msg.cap_1': 'máx 1 tirada', 'msg.desempate': 'Desempate', 'msg.desempateSub': 'Una tirada · {names}',
    'msg.handoff': 'Le toca', 'msg.patas': '+{n} patas', 'msg.patas_1': '+1 pata',
    'btn.drawRoll': 'Tirar el dado', 'btn.drawRollSub': 'un dado', 'btn.waiting': '{name} tira…',
    'btn.openRound': 'Abrir la ronda', 'btn.opens': '{name} abre', 'btn.roll': 'Tirar', 'btn.rollFirst': 'agita el cubilete',
    'btn.rollAgain': 'tira los sueltos', 'btn.stand': 'Plantarse', 'btn.standSub': 'quedarse así', 'btn.thinking': '{name} piensa…',
    'btn.tiebreakSub': 'una tirada, los cinco', 'btn.next': 'Siguiente ronda', 'btn.result': 'Ver resultado',
    'btn.rematch': 'Revancha', 'btn.rematchSub': 'misma mesa', 'btn.newTable': 'Nueva mesa', 'btn.close': 'Cerrar',
    'resume.title': 'Hay una partida en la mesa', 'resume.round': 'Ronda {n}', 'resume.continue': 'Seguir jugando',
    'settings.title': 'Ajustes', 'settings.sound': 'Sonido', 'settings.soundSub': 'el interruptor de silencio del iPhone también manda',
    'settings.language': 'Idioma', 'settings.update': 'Buscar actualización', 'settings.installed': 'instalada en pantalla de inicio',
    'settings.browser': 'abierta en el navegador', 'settings.check': 'Buscar', 'settings.rules': 'Reglas', 'settings.view': 'Ver',
    'settings.abandon': 'Abandonar la partida', 'settings.abandonSub': 'se borra la mesa actual', 'settings.quit': 'Salir',
    'confirm.abandon': '¿Abandonar la partida?',
    'log.title': 'La libreta', 'log.empty': 'Nada todavía.',
    'handoff.title': 'Pásale el cubilete', 'handoff.draw': 'tira un dado', 'handoff.turn': 'le toca tirar', 'handoff.desempate': 'tira el desempate', 'handoff.btn': 'Aquí estoy',
    'roundEnd.title': 'Ronda {n}', 'roundEnd.has': 'lleva {n}', 'roundEnd.tiebreak': 'ganó el desempate', 'roundEnd.skipped': 'no llegó a tirar',
    'gameOver.title': 'Se acabó la partida', 'gameOver.patas': '{n} patas', 'gameOver.buys': '{name} paga la ronda de daiquirís.',
    'gameOver.rounds': '{n} rondas', 'gameOver.rounds_1': '1 ronda', 'gameOver.carabinas': '{n} carabinas', 'gameOver.carabinas_1': '1 carabina',
    'toast.noSw': 'Sin service worker (¿localhost o https?)', 'toast.offline': 'Sin conexión', 'toast.updating': 'Actualizando… toca para recargar',
    'toast.upToDate': 'Estás al día', 'toast.failed': 'No se pudo comprobar', 'toast.newVersion': 'Nueva versión — toca para recargar',
    'log.draw': 'Un dado cada uno: el más alto abre.',
    'log.cap': '{name} se planta a la segunda: máximo {n} tiradas para los demás.', 'log.cap_1': '{name} se planta a la primera: una tirada para los demás.',
    'log.hand': '{name}: {hand}.', 'log.tie': 'Empate entre {names}. ¡Desempate!',
    'log.carabina': '¡{hand}! {name} gana {n} patas.', 'log.carabina_1': '¡{hand}! {name} gana 1 pata.',
    'log.pata': 'Una pata para {name} con {hand}.', 'log.drawTie': 'Empate a {face}: vuelven a tirar {names}.',
    'log.opener': '{name} saca {face} y abre.', 'log.win': '¡{name} gana la partida!', 'log.rematch': 'Revancha. Un dado cada uno.',
    'log.desempateRoll': 'Desempate — {name}: {hand}.', 'log.tieAgain': 'Otro empate. Se repite.',
    'hand.high': '{face} alto', 'hand.pair': 'Par de {faces}', 'hand.three': 'Tres {faces}', 'hand.four': 'Cuatro {faces}',
    'rules.title': 'Reglas del Cubilete',
    'rules.faces': 'Las caras', 'rules.facesText': 'De mayor a menor: <b>As</b> (♠), <b>Rey</b> (K), <b>Cundanga</b> (Q), <b>Jeva</b> (J), <b>Gallego</b> (10), <b>Negro</b> (9). <b>El As es comodín</b>: cuenta como cualquier cara.',
    'rules.roll': 'La tirada', 'rules.roll1': 'Cinco dados, hasta <b>tres tiradas</b>. Guarda los que quieras y vuelve a tirar el resto, o plántate.',
    'rules.roll2': 'Quien <b>abre</b> la ronda marca el máximo: si se planta a la primera, los demás solo tienen una tirada.',
    'rules.win': 'Quién gana la ronda', 'rules.win1': 'Gana la mano con <b>más dados iguales</b> (contando los Ases). A igual número, la cara más alta.',
    'rules.win2': 'Empate: los empatados tiran una vez más (desempate).',
    'rules.win3': 'El ganador se lleva <b>una pata</b> y abre la siguiente ronda. Se juega a <b>10 patas</b>.',
    'rules.carabinas': 'Carabinas', 'rules.c1': '<b>Cinco iguales</b> es una carabina: la ronda termina al instante y los demás ya no tiran.',
    'rules.c2': '<b>Carabina de Reyes Naturales</b> (cinco Reyes sin As): 5 patas.', 'rules.c3': '<b>Carabina de Reyes No Naturales</b> (Reyes con Ases): 2 patas.',
    'rules.c4': '<b>Carabina de Ases</b> (cinco Ases): 10 patas — se gana la partida.', 'rules.c5': 'Las demás carabinas valen una pata.',
    'quips': ['«Hay que tirar como si no importara, y que importe.»', 'Constante, otra ronda de Papa Dobles.', 'El mar sigue ahí afuera. Los dados, aquí.', 'Nadie gana siempre en El Floridita; pero se bebe bien.', 'Tira fuerte, que el cubilete no se rompe.'],
  },
};

/** Translate a key. `{name}` placeholders come from `p`; a `_1` variant is used when p.n === 1. */
export function t(key, p = {}, l = lang) {
  const d = DICT[l] || DICT.en;
  let s = (p.n === 1 && (d[key + '_1'] ?? DICT.en[key + '_1'])) || d[key] || DICT.en[key];
  if (s === undefined) return key;
  if (Array.isArray(s)) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (p[k] === undefined ? '' : String(p[k])));
}

/** Label for any hand. Carabinas keep their proper name; faces keep their Cuban names. */
export function handLabel(hand, l = lang) {
  if (hand.count === 5) return hand.name;
  if (hand.count === 1) return t('hand.high', { face: FACE_NAME[hand.face] }, l);
  const key = { 2: 'hand.pair', 3: 'hand.three', 4: 'hand.four' }[hand.count];
  return t(key, { faces: FACE_PLURAL[hand.face] }, l);
}

/** Render a structured log entry {k, p} from game.js. */
export function logLine(entry, l = lang) {
  if (typeof entry === 'string') return entry; // pre-i18n saved games
  const p = { ...entry.p };
  if (p.hand) p.hand = handLabel(p.hand, l);
  if (p.face) p.face = FACE_NAME[p.face];
  if (Array.isArray(p.names)) p.names = p.names.join(l === 'es' ? ' y ' : ' & ');
  return t(entry.k, p, l);
}

export function quips(l = lang) { return t('quips', {}, l); }
