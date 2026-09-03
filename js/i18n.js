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
    'setup.table': 'The table', 'setup.seats': '2 – 6 seats', 'setup.addSeat': '+ Another seat',
    'setup.target': 'First to {n} patas', 'setup.targetLabel': 'Game length', 'setup.level.casual': 'Casual', 'setup.level.sharp': 'Sharp', 'setup.levelLabel': 'The computers play',
    'hint.btn': 'Ask Papa', 'hint.keep': 'Papa would keep these and roll again', 'hint.keepNone': 'Papa would roll all five again', 'hint.stand': 'Papa would stand here',
    'tab.title': 'The bar tab', 'tab.open': 'Bar tab', 'tab.owes': '{name} now owes {n} rounds', 'tab.owes_1': '{name} now owes a round', 'tab.square': 'The house is square.',
    'tab.settle': 'Settle up', 'tab.clear': 'Clear the record', 'tab.confirmSettle': 'Mark every round as bought?', 'tab.confirmClear': 'Erase the whole record?',
    'tab.empty': 'No games on the tab yet. Play one.', 'tab.games': 'Games', 'tab.wins': 'Wins', 'tab.carabinas': 'Carabinas', 'tab.best': 'Best hand', 'tab.owed': 'Rounds owed',
    'tab.hints': '{n} hints', 'tab.hints_1': '1 hint', 'tab.owedShort': 'owed', 'tab.statGames': '{n} games', 'tab.statGames_1': '1 game', 'tab.statWins': '{n} wins', 'tab.statWins_1': '1 win', 'tab.statCarabinas': '{n} carabinas', 'tab.statCarabinas_1': '1 carabina', 'tab.recent': 'Last games', 'tab.gameLine': '{winner} won to {target} · {buyer} bought the round', 'tab.bought': '{n} bought',
    'meet.btn': 'Meet the players', 'meet.title': 'The regulars',
    'meet.levelTitle': 'Casual or Sharp?', 'meet.levelText': 'Every computer seat has its own style — that is who they are, and it never changes. <b>Casual</b> and <b>Sharp</b> is how well they play it. Sharp always makes the play their odds favour. Casual picks any reasonable play, so they leave a pata on the table now and then.',
    'meet.style.cool': 'plays the odds', 'meet.style.gambler': 'chases carabinas', 'meet.style.cautious': 'stands early',
    'meet.ignacio': "Hudson's opponent at the Floridita. Works out the exact odds every roll and never chases: he will stand on a modest hand when the numbers say so, and stand after one throw to cap the table when that pays.",
    'meet.papa': 'Plays for the big one. Values a carabina far above what it is worth on the tab, so he will break a made hand rolling for five — and sometimes it lands.',
    'meet.lil': 'Keeps what she has. Discounts every extra roll, stands with a pair when the table lets her, and likes to open with one throw so everybody else gets one.',
    'meet.pedrico': 'The bartender. Plays the house odds, straight down the middle, and keeps the tab.',
    'meet.house': 'Anyone else you seat at the table takes one of the regulars\' styles in turn.',
    'tut.link': 'How to play', 'tut.firstTime': 'First time? Learn in one hand:', 'tut.next': 'Next', 'tut.skip': 'Skip', 'tut.play': 'Play for real', 'tut.stepOf': '{n} of {m}',
    'tut.welcome': "Welcome to the Floridita. You're <b>Hudson</b>; <b>Ignacio</b> is across the bar. We'll play one round together: five dice, up to three rolls, and the best hand takes a <b>pata</b>.",
    'tut.faces': 'The six faces, high to low. The <b>As</b> (the spade) is wild — it counts as whatever face you need.',
    'tut.draw': 'First, who opens the round: everyone rolls one die and the highest face opens. Tap <b>Roll the die</b>.',
    'tut.drawDone': 'An As — you open. The opener sets the pace: however many rolls you use, that is the most anyone else gets this round. Tap <b>Open the round</b>.',
    'tut.roll1': 'Shake the cup. Tap <b>Roll</b>.',
    'tut.hold': 'A pair of Reyes. The game is most-of-a-kind, so keep the two Reyes: <b>tap them</b> and they drop into your hand.',
    'tut.roll2': 'Now roll the other three. Tap <b>Roll</b>.',
    'tut.holdAce': 'Three Reyes — the As counts as a Rey. <b>Keep the As</b> as well.',
    'tut.roll3': 'Last roll. Tap <b>Roll</b>.',
    'tut.final': '<b>Four Reyes.</b> A strong hand — and since you used all three rolls, Ignacio gets three as well. (Standing after one roll would have limited him to one.) Tap Next to pass the cup.',
    'tut.ignacio': 'Ignacio has to beat Four Reyes. Watch which dice he keeps.',
    'tut.result': 'Four Cundangas against Four Reyes: same count, so the <b>higher face wins</b>. One pata for you; first to 10 takes the game. Had he tied you, you would both roll once more — a <i>desempate</i>.',
    'tut.carabina': "One more thing. <b>Five of a kind is a carabina</b> and ends the round on the spot. Five Reyes with no As is worth 5 patas, Reyes with Ases 2, and five Ases wins the game outright.",
    'tut.done': "That's the whole game. Papa, Honest Lil and Pedrico are waiting at the table.",
    'setup.start': 'Start', 'setup.startSub': 'everyone rolls one die — highest opens', 'setup.rules': 'Rules', 'setup.settings': 'Settings',
    'setup.a2hs': 'To play offline: <b>Share ⇧ → Add to Home Screen</b>, then open it from the icon once while online.',
    'seat.human': 'Person', 'seat.ai': 'Computer', 'seat.name': 'Name', 'seat.player': 'Player {n}',
    'top.round': 'ROUND {n}', 'top.opening': 'OPENING',
    'felt.draw': 'one die each', 'felt.hold': 'tap a die to keep it', 'felt.ai': 'the computer is choosing', 'felt.final': 'final hand',
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
    'setup.table': 'La mesa', 'setup.seats': '2 – 6 sillas', 'setup.addSeat': '+ Otra silla',
    'setup.target': 'Se juega a {n} patas', 'setup.targetLabel': 'Duración', 'setup.level.casual': 'Relajado', 'setup.level.sharp': 'Afilado', 'setup.levelLabel': 'Las máquinas',
    'hint.btn': 'Pregúntale a Papa', 'hint.keep': 'Papa guardaría estos y tiraría otra vez', 'hint.keepNone': 'Papa tiraría los cinco otra vez', 'hint.stand': 'Papa se plantaría aquí',
    'tab.title': 'La cuenta del bar', 'tab.open': 'La cuenta', 'tab.owes': '{name} ya debe {n} rondas', 'tab.owes_1': '{name} debe una ronda', 'tab.square': 'Nadie debe nada.',
    'tab.settle': 'Saldar', 'tab.clear': 'Borrar el historial', 'tab.confirmSettle': '¿Dar todas las rondas por pagadas?', 'tab.confirmClear': '¿Borrar todo el historial?',
    'tab.empty': 'Todavía no hay partidas en la cuenta. Juega una.', 'tab.games': 'Partidas', 'tab.wins': 'Victorias', 'tab.carabinas': 'Carabinas', 'tab.best': 'Mejor mano', 'tab.owed': 'Rondas debidas',
    'tab.hints': '{n} pistas', 'tab.hints_1': '1 pista', 'tab.owedShort': 'debidas', 'tab.statGames': '{n} partidas', 'tab.statGames_1': '1 partida', 'tab.statWins': '{n} victorias', 'tab.statWins_1': '1 victoria', 'tab.statCarabinas': '{n} carabinas', 'tab.statCarabinas_1': '1 carabina', 'tab.recent': 'Últimas partidas', 'tab.gameLine': '{winner} ganó a {target} · {buyer} pagó la ronda', 'tab.bought': '{n} pagadas',
    'meet.btn': 'Los jugadores', 'meet.title': 'Los habituales',
    'meet.levelTitle': '¿Relajado o afilado?', 'meet.levelText': 'Cada máquina tiene su propio estilo: eso es quién es, y no cambia. <b>Relajado</b> y <b>Afilado</b> es lo bien que lo juega. Afilado siempre hace la jugada que sus probabilidades favorecen. Relajado elige cualquier jugada razonable, así que de vez en cuando deja una pata en la mesa.',
    'meet.style.cool': 'juega las probabilidades', 'meet.style.gambler': 'persigue carabinas', 'meet.style.cautious': 'se planta temprano',
    'meet.ignacio': 'El rival de Hudson en El Floridita. Calcula las probabilidades exactas en cada tirada y nunca persigue: se planta con una mano modesta cuando los números lo dicen, y se planta a la primera para limitar la mesa cuando conviene.',
    'meet.papa': 'Juega a lo grande. Valora una carabina mucho más de lo que vale en la cuenta, así que rompe una mano hecha para tirar por cinco… y a veces sale.',
    'meet.lil': 'Se queda con lo que tiene. Descuenta cada tirada extra, se planta con un par cuando la mesa se lo permite, y le gusta abrir con una sola tirada para que los demás tengan una.',
    'meet.pedrico': 'El cantinero. Juega las probabilidades de la casa, derecho por el medio, y lleva la cuenta.',
    'meet.house': 'Cualquier otro que sientes a la mesa toma por turno el estilo de uno de los habituales.',
    'tut.link': 'Cómo se juega', 'tut.firstTime': '¿Primera vez? Aprende en una mano:', 'tut.next': 'Siguiente', 'tut.skip': 'Saltar', 'tut.play': 'Jugar de verdad', 'tut.stepOf': '{n} de {m}',
    'tut.welcome': 'Bienvenido al Floridita. Tú eres <b>Hudson</b>; <b>Ignacio</b> está al otro lado de la barra. Jugamos una ronda juntos: cinco dados, hasta tres tiradas, y la mejor mano se lleva una <b>pata</b>.',
    'tut.faces': 'Las seis caras, de mayor a menor. El <b>As</b> (la pica) es comodín: cuenta como la cara que necesites.',
    'tut.draw': 'Primero, quién abre la ronda: cada uno tira un dado y la cara más alta abre. Toca <b>Tirar el dado</b>.',
    'tut.drawDone': 'Un As: abres tú. Quien abre marca el ritmo: las tiradas que uses son las máximas para los demás en esta ronda. Toca <b>Abrir la ronda</b>.',
    'tut.roll1': 'Agita el cubilete. Toca <b>Tirar</b>.',
    'tut.hold': 'Par de Reyes. El juego es tener más dados iguales, así que guarda los dos Reyes: <b>tócalos</b> y bajan a tu mano.',
    'tut.roll2': 'Ahora tira los otros tres. Toca <b>Tirar</b>.',
    'tut.holdAce': 'Tres Reyes: el As cuenta como Rey. <b>Guarda también el As</b>.',
    'tut.roll3': 'Última tirada. Toca <b>Tirar</b>.',
    'tut.final': '<b>Cuatro Reyes.</b> Buena mano, y como usaste las tres tiradas, Ignacio también tiene tres. (Plantarte a la primera lo habría limitado a una.) Toca Siguiente para pasar el cubilete.',
    'tut.ignacio': 'Ignacio tiene que batir Cuatro Reyes. Mira qué dados guarda.',
    'tut.result': 'Cuatro Cundangas contra Cuatro Reyes: mismo número, así que <b>gana la cara más alta</b>. Una pata para ti; a 10 se gana la partida. Si hubiera empatado, tirarían una vez más los dos: un <i>desempate</i>.',
    'tut.carabina': 'Una cosa más. <b>Cinco iguales es una carabina</b> y termina la ronda al instante. Cinco Reyes sin As valen 5 patas, Reyes con Ases 2, y cinco Ases ganan la partida.',
    'tut.done': 'Eso es todo el juego. Papa, Honest Lil y Pedrico esperan en la mesa.',
    'setup.start': 'Empezar', 'setup.startSub': 'un dado cada uno — el más alto abre', 'setup.rules': 'Reglas', 'setup.settings': 'Ajustes',
    'setup.a2hs': 'Para jugar sin conexión: <b>Compartir ⇧ → Añadir a pantalla de inicio</b>, y ábrelo desde el icono una vez con internet.',
    'seat.human': 'Persona', 'seat.ai': 'Máquina', 'seat.name': 'Nombre', 'seat.player': 'Jugador {n}',
    'top.round': 'RONDA {n}', 'top.opening': 'SALIDA',
    'felt.draw': 'un dado cada uno', 'felt.hold': 'toca un dado para guardarlo', 'felt.ai': 'la máquina elige', 'felt.final': 'mano final',
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
