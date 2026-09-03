// The regulars: how each computer seat plays, and what it says. Pure.
export const PERSONAS = {
  ignacio: { style: 'cool' },     // the man Hudson plays in the book: exact, needling
  papa:    { style: 'gambler' },  // chases carabinas
  lil:     { style: 'cautious' }, // stands early, caps the table
  pedrico: { style: 'cool' },     // the bartender: dry
  house:   { style: 'cool' },     // anyone else
};
export const STYLES = ['cool', 'gambler', 'cautious'];
export const LEVELS = ['casual', 'sharp'];
export const EVENTS = ['stand', 'cap', 'rollOn', 'win', 'lose', 'carabina', 'tie', 'owes', 'tab'];

const BY_NAME = { ignacio: 'ignacio', papa: 'papa', 'honest lil': 'lil', lil: 'lil', pedrico: 'pedrico', constante: 'pedrico' };
const ROTATION = ['ignacio', 'papa', 'lil', 'pedrico', 'house'];

export function personaFor(name, seatIdx = 0) {
  const k = BY_NAME[String(name || '').trim().toLowerCase()];
  return k || ROTATION[seatIdx % ROTATION.length];
}

// {rival} = the human the table is needling; {n} = a number when the event has one.
const LINES = {
  ignacio: {
    en: {
      stand: ['I stand. Your move, {rival}.', 'That will do. Beat it if you can.', 'Enough. I know when a hand is finished.', 'I stand, and I stand well.'],
      cap: ['One roll for everybody. You can thank me later.', 'I stand on the first. Let us see what one throw does for you.', 'One roll each. Keep it honest.'],
      rollOn: ['Again.', 'The cup is not empty yet.', 'One more, for the look of it.'],
      win: ['As expected.', 'The pata is mine, {rival}. Write it down.', 'You threw well. I threw better.', 'Another one for the ledger.'],
      lose: ['Well thrown. It happens.', 'Take it. I will have it back.', 'Luck, {rival}. Nothing more.'],
      carabina: ['Carabina. Nobody else throws tonight.', 'There it is. Put the cup down.', 'Five of a kind. The round is finished.'],
      tie: ['A tie. Fine. Once more, the two of us.', 'Equal hands. The cup decides.', 'We throw again. I do not mind.'],
      owes: ['I owe the round. Pedrico, the same for everyone.', 'The drinks are on me tonight. Do not get used to it.', 'I buy. You will not see it twice.'],
      tab: ['Read it slowly, Pedrico. Some of us are behind.', 'The tab is long and {rival} is on most of it.', 'Everybody pays eventually.'],
    },
    es: {
      stand: ['Me planto. Te toca, {rival}.', 'Con eso basta. Bátelo si puedes.', 'Ya. Sé cuándo una mano está terminada.', 'Me planto, y me planto bien.'],
      cap: ['Una tirada para todos. Luego me lo agradeces.', 'Me planto a la primera. A ver qué te da una sola.', 'Una tirada cada uno. Que sea limpio.'],
      rollOn: ['Otra vez.', 'El cubilete no está vacío todavía.', 'Una más, por elegancia.'],
      win: ['Como esperaba.', 'La pata es mía, {rival}. Apúntalo.', 'Tiraste bien. Yo tiré mejor.', 'Otra para la libreta.'],
      lose: ['Bien tirado. Pasa.', 'Tómala. La recupero.', 'Suerte, {rival}. Nada más.'],
      carabina: ['Carabina. Nadie más tira esta noche.', 'Ahí está. Baja el cubilete.', 'Cinco iguales. La ronda se acabó.'],
      tie: ['Empate. Bien. Otra vez, nosotros dos.', 'Manos iguales. Decide el cubilete.', 'Tiramos otra vez. No me importa.'],
      owes: ['Debo la ronda. Pedrico, lo mismo para todos.', 'Hoy invito yo. No te acostumbres.', 'Pago yo. No lo verás dos veces.'],
      tab: ['Léela despacio, Pedrico. Algunos van atrás.', 'La cuenta es larga y {rival} está en casi toda.', 'Todo el mundo paga tarde o temprano.'],
    },
  },
  papa: {
    en: {
      stand: ['Fine. I stand. But it hurt.', 'I stand, and I hate it.', 'Standing is for people with something to lose.'],
      cap: ['One roll each. Now it is a game.', 'I stand on the first throw. Let it be quick.', 'One throw. The brave ones like it that way.'],
      rollOn: ['Roll them. Always roll them.', 'The carabina is in there somewhere.', 'Again, and hard.', 'You do not get five kings by standing.'],
      win: ['Ha. That is how it is done.', 'The pata is mine and the daiquiri is next.', 'Good. Now the next one.'],
      lose: ['Take it, take it. I was going for the carabina.', 'I threw for the big one and got the small one.', 'Well done, {rival}. I will remember it.'],
      carabina: ['CARABINA. Pedrico, the double!', 'There. That is what the cup is for.', 'Five. Look at them. Look at them.'],
      tie: ['A tie? Good. I like a second throw.', 'Equal. Give me the cup.', 'Again, then. Louder this time.'],
      owes: ['I buy. Frozen, no sugar, for the table.', 'The round is mine. It was worth it.', 'I owe the drinks. Pedrico, make them big.'],
      tab: ['Read the tab, Pedrico. Whoever owes the most is the one who lived.', 'A long tab is a good sign.', 'Nobody remembers who paid. They remember who threw.'],
    },
    es: {
      stand: ['Bueno. Me planto. Pero duele.', 'Me planto, y lo odio.', 'Plantarse es para los que tienen algo que perder.'],
      cap: ['Una tirada cada uno. Ahora sí es un juego.', 'Me planto a la primera. Que sea rápido.', 'Una tirada. A los valientes les gusta así.'],
      rollOn: ['Tíralos. Siempre tíralos.', 'La carabina anda por ahí.', 'Otra vez, y fuerte.', 'Cinco reyes no salen plantándose.'],
      win: ['Ja. Así se hace.', 'La pata es mía y el daiquirí viene después.', 'Bien. Ahora la siguiente.'],
      lose: ['Toma, toma. Yo iba por la carabina.', 'Tiré a lo grande y salió lo pequeño.', 'Bien hecho, {rival}. Me acordaré.'],
      carabina: ['¡CARABINA! ¡Pedrico, el doble!', 'Ahí. Para eso es el cubilete.', 'Cinco. Míralos. Míralos.'],
      tie: ['¿Empate? Bien. Me gusta tirar dos veces.', 'Iguales. Dame el cubilete.', 'Otra vez, pues. Más fuerte.'],
      owes: ['Invito yo. Frappé, sin azúcar, para la mesa.', 'La ronda es mía. Valió la pena.', 'Debo los tragos. Pedrico, que sean grandes.'],
      tab: ['Lee la cuenta, Pedrico. El que más debe es el que más vivió.', 'Una cuenta larga es buena señal.', 'Nadie recuerda quién pagó. Recuerdan quién tiró.'],
    },
  },
  lil: {
    en: {
      stand: ['I stand, honey. A pata is a pata.', 'That is plenty for me.', 'I keep what I have. Always have.'],
      cap: ['One roll for the rest of you. Sorry, sweetheart.', 'I stand on the first, and now you all do too.', 'One throw each. Do not look at me like that.'],
      rollOn: ['Just the loose ones.', 'One more, carefully.', 'I will try a little.'],
      win: ['See? Patience.', 'A small pata, but mine.', 'Thank you, boys.'],
      lose: ['Oh well. Next round.', 'Good for you, {rival}.', 'I was not greedy and I still lost. Imagine.'],
      carabina: ['Oh! Look at that! Carabina!', 'Would you look at that. Five.', 'Well. I did not expect that, honey.'],
      tie: ['A tie. All right, once more.', 'The same hand. Again then.', 'We throw again. Gently.'],
      owes: ['I buy the round. Do not tell anybody.', 'The drinks are mine tonight, boys.', 'I owe it. Pedrico, put it on my page.'],
      tab: ['Pedrico keeps a very honest tab.', 'Look at that tab. Somebody has been unlucky.', 'Mine is short. I stand early.'],
    },
    es: {
      stand: ['Me planto, mi vida. Una pata es una pata.', 'Con eso me sobra.', 'Me quedo con lo que tengo. Siempre.'],
      cap: ['Una tirada para los demás. Perdona, cariño.', 'Me planto a la primera, y ahora ustedes también.', 'Una tirada cada uno. No me mires así.'],
      rollOn: ['Solo los sueltos.', 'Una más, con cuidado.', 'Voy a probar un poquito.'],
      win: ['¿Ves? Paciencia.', 'Una pata chiquita, pero mía.', 'Gracias, muchachos.'],
      lose: ['Bueno. La próxima.', 'Bien por ti, {rival}.', 'No fui codiciosa y perdí igual. Imagínate.'],
      carabina: ['¡Ay! ¡Mira eso! ¡Carabina!', 'Mira nada más. Cinco.', 'Vaya. No me lo esperaba, mi vida.'],
      tie: ['Empate. Está bien, otra vez.', 'La misma mano. Otra, pues.', 'Tiramos otra vez. Despacito.'],
      owes: ['Invito la ronda. No se lo digas a nadie.', 'Hoy los tragos van por mí, muchachos.', 'La debo. Pedrico, ponla en mi página.'],
      tab: ['Pedrico lleva una cuenta muy honesta.', 'Mira esa cuenta. Alguien ha tenido mala suerte.', 'La mía es corta. Me planto temprano.'],
    },
  },
  pedrico: {
    en: {
      stand: ['I stand.', 'Enough for the house.', 'That is the hand.'],
      cap: ['One roll each. I have glasses to wash.', 'I stand on the first. The bar closes eventually.', 'One throw. Keep it moving.'],
      rollOn: ['Again.', 'Once more.', 'The loose ones.'],
      win: ['The house wins. Naturally.', 'A pata for the bar.', 'Thank you. Same again?'],
      lose: ['Your pata. Your drink is not free, though.', 'Well thrown, {rival}.', 'The bar loses one. The bar is still open.'],
      carabina: ['Carabina. I will pour my own.', 'Five. Even I am surprised.', 'That is a carabina. Round over.'],
      tie: ['A tie. Once more, and then somebody pays.', 'Same hand. Throw.', 'Again. I am not in a hurry.'],
      owes: ['The house buys. It happens.', 'This round is on me. Do not spread it around.', 'I owe the round. Pouring.'],
      tab: ['I keep the tab. It is all here.', 'Nobody has argued with this tab yet.', 'Read it and pay it, gentlemen.'],
    },
    es: {
      stand: ['Me planto.', 'Suficiente para la casa.', 'Esa es la mano.'],
      cap: ['Una tirada cada uno. Tengo vasos que lavar.', 'Me planto a la primera. El bar cierra en algún momento.', 'Una tirada. Que siga.'],
      rollOn: ['Otra vez.', 'Una más.', 'Los sueltos.'],
      win: ['Gana la casa. Naturalmente.', 'Una pata para el bar.', 'Gracias. ¿Lo mismo?'],
      lose: ['Tu pata. El trago no es gratis, eso sí.', 'Bien tirado, {rival}.', 'El bar pierde una. El bar sigue abierto.'],
      carabina: ['Carabina. Me sirvo yo mismo.', 'Cinco. Hasta yo me sorprendo.', 'Eso es una carabina. Se acabó la ronda.'],
      tie: ['Empate. Otra vez, y luego alguien paga.', 'La misma mano. Tira.', 'Otra. No tengo prisa.'],
      owes: ['Invita la casa. Pasa.', 'Esta ronda va por mí. No lo cuentes.', 'Debo la ronda. Sirviendo.'],
      tab: ['Yo llevo la cuenta. Está todo aquí.', 'Nadie ha discutido esta cuenta todavía.', 'Léanla y páguenla, señores.'],
    },
  },
  house: {
    en: {
      stand: ['I stand.', 'Good enough.', 'That is my hand.'],
      cap: ['One roll each.', 'I stand on the first.', 'One throw for the table.'],
      rollOn: ['Again.', 'One more.', 'Rolling.'],
      win: ['My pata.', 'Thank you.', 'That one is mine.'],
      lose: ['Yours.', 'Well thrown.', 'Next round.'],
      carabina: ['Carabina!', 'Five of a kind.', 'Round over.'],
      tie: ['A tie. Again.', 'Same hand. Once more.', 'We throw again.'],
      owes: ['I buy the round.', 'The drinks are on me.', 'I owe it.'],
      tab: ['The tab is the tab.', 'It is all written down.', 'Somebody pays.'],
    },
    es: {
      stand: ['Me planto.', 'Suficiente.', 'Esa es mi mano.'],
      cap: ['Una tirada cada uno.', 'Me planto a la primera.', 'Una tirada para la mesa.'],
      rollOn: ['Otra vez.', 'Una más.', 'Tirando.'],
      win: ['Mi pata.', 'Gracias.', 'Esa es mía.'],
      lose: ['Tuya.', 'Bien tirado.', 'La próxima.'],
      carabina: ['¡Carabina!', 'Cinco iguales.', 'Se acabó la ronda.'],
      tie: ['Empate. Otra vez.', 'La misma mano. Una más.', 'Tiramos otra vez.'],
      owes: ['Invito la ronda.', 'Los tragos van por mí.', 'La debo.'],
      tab: ['La cuenta es la cuenta.', 'Está todo apuntado.', 'Alguien paga.'],
    },
  },
};

/** A line for a persona and event; `seed` picks deterministically so reloads repeat the same line. */
export function line(persona, event, lang = 'en', params = {}, seed = 0) {
  const p = LINES[persona] || LINES.house;
  const arr = (p[lang] || p.en)[event] || p.en[event] || [];
  if (!arr.length) return '';
  const s = arr[Math.abs(Math.floor(seed)) % arr.length];
  return s.replace(/\{(\w+)\}/g, (_, k) => (params[k] === undefined ? '' : String(params[k])));
}

export function _lines() { return LINES; }
