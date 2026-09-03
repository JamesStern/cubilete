// Renderer, input, AI driver, persistence and PWA glue for Cubilete.
import * as G from './game.js';
import * as R from './rules.js';
import { decide } from './ai.js';
import { faceSVG, miniHand, cupSVG } from './dice.js';
import * as S from './sound.js';
import { APP_VERSION } from './version.js';

const KEY = 'cubilete.state';
const SEATS_KEY = 'cubilete.seats';
const app = document.getElementById('app');
const overlayEl = document.createElement('div');
document.body.appendChild(overlayEl);

/* ---------- randomness (with a debug hook: localStorage.debugRolls = "[6,6,6,6,6]") ---------- */
function rollDie() {
  try {
    const dbg = localStorage.getItem('debugRolls');
    if (dbg) {
      const arr = JSON.parse(dbg);
      if (arr.length) { const v = arr.shift(); localStorage.setItem('debugRolls', JSON.stringify(arr)); return v; }
    }
  } catch (_) { /* ignore */ }
  const buf = new Uint32Array(1);
  let v;
  do { crypto.getRandomValues(buf); v = buf[0]; } while (v >= 4294967292); // reject the biased tail
  return 1 + (v % 6);
}

/* ---------- state + persistence ---------- */
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s && s.version === 1 && s.phase) return s;
  } catch (_) { /* ignore */ }
  return null;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* ignore */ } }

let state = load();
const ui = {
  resumePrompt: !!(state && state.phase !== 'setup'),
  settingsOpen: false, rulesOpen: false, logOpen: false, overlayKey: null,
  busy: false, pendingTumble: null, screen: '', diceMode: '',
};
if (!state) state = G.initialState();
S.setMuted(!!state.settings.muted);

let aiTimer = null;
function dispatch(action) {
  const next = G.reduce(state, action, rollDie);
  if (next === state) return;
  const prev = state;
  state = next;
  save();
  render();
  afterDispatch(prev, action);
}

function afterDispatch(prev) {
  if (state.phase === 'round-end' && prev.phase !== 'round-end') {
    const h = state.round.winningHand;
    if (h && h.count === 5) { S.play('fanfare'); confetti(); }
    else S.play('pata');
  }
  if (state.phase === 'game-over' && prev.phase !== 'game-over') { S.play('fanfare'); confetti(); }
  if (state.phase === 'setup') releaseWake(); else requestWake();
  scheduleAi();
}

/* ---------- AI driver ---------- */
function scheduleAi() {
  clearTimeout(aiTimer);
  if (ui.busy || ui.resumePrompt || !G.isAiToAct(state)) return;
  let delay = 900;
  if (state.phase === 'turn' && state.turn.rollsUsed > 0) delay = 1200;
  if (state.phase === 'draw') delay = 800;
  aiTimer = setTimeout(aiStep, delay);
}
function aiStep() {
  if (ui.busy || ui.resumePrompt || !G.isAiToAct(state)) return;
  switch (state.phase) {
    case 'draw': S.play('reveal'); dispatch({ type: 'DRAW_ROLL' }); break;
    case 'desempate': doRoll(); break;
    case 'turn': {
      const t = state.turn;
      if (t.rollsUsed === 0) { doRoll(); return; }
      const d = decide(G.aiInputs(state));
      if (d.stop) { dispatch({ type: 'STOP' }); return; }
      if (d.hold.some((h, i) => h !== t.held[i])) { S.play('hold'); dispatch({ type: 'SET_HOLD', held: d.hold }); return; }
      doRoll();
      break;
    }
    default: break;
  }
}

/* ---------- rolling with the cup animation ---------- */
function doRoll() {
  if (ui.busy) return;
  const cup = document.getElementById('cup');
  ui.busy = true;
  updateControls();
  if (state.phase === 'turn' && state.turn.dice) {
    document.querySelectorAll('#dice .die').forEach((el, i) => { if (!state.turn.held[i]) el.classList.add('in-cup'); });
  } else if (state.phase === 'desempate') {
    document.querySelectorAll('#dice .die').forEach((el) => el.classList.add('in-cup'));
  }
  if (cup) { cup.classList.remove('shaking'); void cup.offsetWidth; cup.classList.add('shaking'); }
  S.play('shake');
  setTimeout(() => {
    if (cup) cup.classList.remove('shaking');
    ui.pendingTumble = state.phase === 'turn' && state.turn.dice ? state.turn.held.map((h) => !h) : [true, true, true, true, true];
    ui.busy = false;
    S.play('reveal');
    dispatch({ type: 'ROLL' });
  }, 720);
}

/* ---------- render ---------- */
function render() {
  if (state.phase === 'setup') renderSetup();
  else { ensureTable(); updateTable(); }
  renderOverlay();
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pname = (i) => esc(state.players[i].name);

/* ----- setup screen ----- */
let seats = null;
function loadSeats() {
  if (seats) return seats;
  try { const raw = localStorage.getItem(SEATS_KEY); if (raw) seats = JSON.parse(raw); } catch (_) { /* ignore */ }
  if (!seats && state.lastPlayers) seats = state.lastPlayers;
  if (!Array.isArray(seats) || seats.length < 2) seats = [{ name: 'Hudson', type: 'human' }, { name: 'Papa', type: 'ai' }];
  return seats;
}
function saveSeats() { try { localStorage.setItem(SEATS_KEY, JSON.stringify(seats)); } catch (_) { /* ignore */ } }

function renderSetup() {
  if (ui.screen === 'setup') return;
  ui.screen = 'setup';
  ui.diceMode = '';
  loadSeats();
  const isIphone = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const standalone = window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  app.innerHTML = `
  <div class="setup">
    <div class="hero">
      <div class="cupart">${cupSVG()}</div>
      <h1>CUBILETE</h1>
      <div class="sub">El Floridita · La Habana</div>
      <div class="checker stripe"></div>
    </div>
    <div class="panel">
      <div class="box">
        <h2>La mesa <small>2 – 6 sillas</small></h2>
        <div id="seats"></div>
        <div class="addrow"><button id="add-seat">+ Otra silla</button><small>Se juega a 10 patas</small></div>
      </div>
    </div>
    <div class="foot">
      <button class="btn" id="start">Empezar<small>un dado cada uno — el más alto abre</small></button>
      <div class="links"><button id="open-rules">Reglas · Rules</button><button id="open-settings">Ajustes</button></div>
      ${isIphone && !standalone ? '<div class="a2hs">Para jugar sin conexión: <b>Compartir ⇧ → Añadir a pantalla de inicio</b>, y ábrelo desde el icono una vez con internet.</div>' : ''}
    </div>
  </div>`;
  renderSeats();
  app.querySelector('#add-seat').addEventListener('click', () => { if (seats.length < 6) { seats.push({ name: G.DEFAULT_NAMES[seats.length] || `Jugador ${seats.length + 1}`, type: 'ai' }); renderSeats(); } });
  app.querySelector('#start').addEventListener('click', () => {
    saveSeats();
    ui.screen = '';
    dispatch({ type: 'SETUP_CONFIRM', players: seats.map((s) => ({ name: s.name, type: s.type })) });
  });
  app.querySelector('#open-rules').addEventListener('click', () => { ui.rulesOpen = true; renderOverlay(); });
  app.querySelector('#open-settings').addEventListener('click', () => { ui.settingsOpen = true; renderOverlay(); });
}
function renderSeats() {
  const box = app.querySelector('#seats');
  if (!box) return;
  box.innerHTML = seats.map((s, i) => `
    <div class="seatrow" data-i="${i}">
      <span class="idx">${i + 1}</span>
      <input type="text" maxlength="16" value="${esc(s.name)}" placeholder="${G.DEFAULT_NAMES[i] || 'Nombre'}" autocapitalize="words" enterkeyhint="done">
      <div class="type"><button data-t="human" class="${s.type === 'human' ? 'on' : ''}">Persona</button><button data-t="ai" class="${s.type === 'ai' ? 'on' : ''}">Máquina</button></div>
      <button class="rm" ${seats.length <= 2 ? 'disabled style="visibility:hidden"' : ''} aria-label="quitar">×</button>
    </div>`).join('');
  box.querySelectorAll('.seatrow').forEach((row) => {
    const i = Number(row.dataset.i);
    row.querySelector('input').addEventListener('input', (e) => { seats[i].name = e.target.value; });
    row.querySelector('input').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });
    row.querySelectorAll('.type button').forEach((b) => b.addEventListener('click', () => { seats[i].type = b.dataset.t; S.play('click'); renderSeats(); }));
    row.querySelector('.rm').addEventListener('click', () => { seats.splice(i, 1); renderSeats(); });
  });
  const add = app.querySelector('#add-seat');
  if (add) add.style.visibility = seats.length >= 6 ? 'hidden' : 'visible';
}

/* ----- table screen ----- */
function ensureTable() {
  if (ui.screen === 'table') return;
  ui.screen = 'table';
  ui.diceMode = '';
  app.innerHTML = `
  <header>
    <div class="checker"></div>
    <div class="topbar">
      <div class="brand">CUBILETE<small>El Floridita · La Habana</small></div>
      <div class="round" id="roundlbl"></div>
      <div class="right"><button class="iconbtn" id="btn-log" aria-label="registro">☰</button><button class="iconbtn" id="btn-settings" aria-label="ajustes">⚙</button></div>
    </div>
  </header>
  <div class="scores" id="scores"></div>
  <div class="table">
    <div class="onTable" id="onTable"></div>
    <div class="arena">
      <div class="cup" id="cup">${cupSVG()}</div>
      <div class="dice" id="dice"></div>
      <div class="felt-hint" id="felt"></div>
      <div class="felt-line"></div>
    </div>
    <div class="message" id="message"></div>
  </div>
  <div class="controls" id="controls"></div>
  <div class="ticker" id="ticker"></div>`;
  app.querySelector('#btn-settings').addEventListener('click', () => { S.play('click'); ui.settingsOpen = true; renderOverlay(); });
  app.querySelector('#btn-log').addEventListener('click', () => { S.play('click'); ui.logOpen = true; renderOverlay(); });
  app.querySelector('#controls').addEventListener('click', onControl);
  app.querySelector('#dice').addEventListener('click', onDieTap);
}

function updateTable() {
  const r = state.round;
  app.querySelector('#roundlbl').innerHTML = r ? `RONDA ${r.number}` : 'SALIDA';
  updateScores();
  updateDice();
  updateMessage();
  updateControls();
  app.querySelector('#ticker').textContent = state.log[state.log.length - 1] || '';
}

function updateScores() {
  const actor = G.currentActor(state);
  const r = state.round;
  app.querySelector('#scores').innerHTML = state.players.map((p) => {
    const res = r && r.results[p.id];
    const chips = Array.from({ length: Math.min(p.patas, 10) }, (_, k) => `<i class="${k >= 5 ? 'big' : ''}"></i>`).join('');
    const hand = res ? miniHand(res.dice) : (r && r.winner === null && actor === p.id && state.phase !== 'round-end' ? '<span style="opacity:.6">…</span>' : '<span style="opacity:.35">—</span>');
    return `<div class="seat ${actor === p.id ? 'active' : ''} ${r && r.openerIdx === p.id ? 'opener' : ''}">
      <div class="name">${esc(p.name)}${p.type === 'ai' ? ' <span class="ai">⚙</span>' : ''}</div>
      <div class="patas">${p.patas}</div>
      <div class="chips">${chips}</div>
      <div class="hand">${hand}</div>
    </div>`;
  }).join('');
}

function updateDice() {
  const box = app.querySelector('#dice');
  const cup = app.querySelector('#cup');
  const felt = app.querySelector('#felt');
  const ph = state.phase;
  if (ph === 'draw' || ph === 'draw-done' || (ph === 'handoff' && state.handoff.resume === 'draw')) {
    ui.diceMode = 'draw';
    const d = state.draw;
    box.className = 'dice draw-dice';
    box.innerHTML = d.contenders.map((i) => {
      const v = d.rolls[i];
      return `<div class="slot"><button class="die ${v ? '' : 'blank'} ${d.done && d.opener === i ? 'win' : ''}" disabled>${v ? faceSVG(v) : ''}</button><span>${pname(i)}</span></div>`;
    }).join('');
    cup.classList.remove('hidden');
    felt.textContent = 'un dado cada uno';
    return;
  }
  let dice = null; let held = [false, false, false, false, false]; let rolled = null; let highlight = '';
  if (ph === 'turn' || (ph === 'handoff' && state.handoff.resume === 'turn')) {
    dice = state.turn.dice; held = state.turn.held;
    if (ph === 'handoff') dice = null;
  } else if (ph === 'desempate' || (ph === 'handoff' && state.handoff.resume === 'desempate')) {
    const d = state.desempate;
    const prev = d.contenders[d.ptr - 1];
    dice = ph === 'desempate' && prev !== undefined ? d.results[prev].dice : null;
  } else if (ph === 'round-end' || ph === 'game-over') {
    const r = state.round;
    if (r && r.winner !== null) {
      const src = r.desempate ? r.desempate.results[r.winner] : r.results[r.winner];
      dice = src ? src.dice : null;
      highlight = r.winningHand && r.winningHand.count === 5 ? 'carabina' : 'win';
    }
  }
  if (ui.diceMode !== 'five') {
    ui.diceMode = 'five';
    box.className = 'dice';
    box.innerHTML = [0, 1, 2, 3, 4].map((i) => `<button class="die blank" data-i="${i}" aria-label="dado ${i + 1}"></button>`).join('');
  }
  const els = box.querySelectorAll('.die');
  els.forEach((el, i) => {
    const v = dice ? dice[i] : null;
    if (el.dataset.v !== String(v)) { el.dataset.v = String(v); el.innerHTML = v ? faceSVG(v) : ''; }
    el.classList.toggle('blank', !v);
    el.classList.toggle('held', !!(dice && held[i]));
    el.classList.remove('in-cup');
    el.classList.toggle('win', highlight === 'win');
    el.classList.toggle('carabina', highlight === 'carabina');
    const canHold = ph === 'turn' && dice && state.players[state.turn.player].type === 'human' && state.turn.rollsUsed >= 1 && state.turn.rollsUsed < state.turn.maxRolls && !ui.busy;
    el.disabled = !canHold;
  });
  if (ui.pendingTumble) {
    els.forEach((el, i) => { if (ui.pendingTumble[i] && dice) { el.classList.remove('tumble'); void el.offsetWidth; el.classList.add('tumble'); } });
    ui.pendingTumble = null;
    setTimeout(() => els.forEach((el) => el.classList.remove('tumble')), 900);
  }
  cup.classList.toggle('hidden', ph === 'round-end' || ph === 'game-over');
  const holdable = ph === 'turn' && dice && state.turn.rollsUsed >= 1 && state.turn.rollsUsed < state.turn.maxRolls;
  felt.textContent = holdable ? (state.players[state.turn.player].type === 'human' ? 'toca un dado para guardarlo' : 'la máquina elige') : '';
}

function updateMessage() {
  const m = app.querySelector('#message');
  const ph = state.phase;
  const actor = G.currentActor(state);
  let who = '', what = '', sub = '';
  if (ph === 'draw') { who = pname(actor); what = 'Tira un dado'; sub = 'El más alto abre la ronda'; }
  else if (ph === 'draw-done') { who = pname(state.draw.opener); what = `Saca ${R.FACE_NAME[state.draw.rolls[state.draw.opener]]} y abre`; }
  else if (ph === 'turn') {
    const t = state.turn; const r = state.round;
    who = pname(t.player) + (state.players[t.player].type === 'ai' ? '<span class="thinking"></span>' : '');
    what = t.hand ? R.handLabel(t.hand) : (r.turnPtr === 0 ? 'Abre la ronda' : 'Agita el cubilete');
    sub = `Tirada ${Math.min(t.rollsUsed + 1, t.maxRolls)} de ${t.maxRolls}`;
    if (t.rollsUsed >= t.maxRolls) sub = `${t.rollsUsed} tirada${t.rollsUsed > 1 ? 's' : ''}`;
    const best = G.bestOnTable(state);
    if (best) {
      const owner = r.order.find((i) => r.results[i] && R.compare(r.results[i].hand, best) === 0);
      sub += ` · a batir: <b>${R.handLabel(best)}</b> (${pname(owner)})`;
    }
    if (r.rollCap && r.rollCap < G.MAX_ROLLS && r.turnPtr > 0) sub += `<span class="cap">máx ${r.rollCap} tirada${r.rollCap > 1 ? "s" : ""}</span>`;
  } else if (ph === 'desempate') {
    const d = state.desempate;
    who = pname(actor); what = 'Desempate'; sub = `Una tirada · ${d.contenders.map((i) => pname(i)).join(' · ')}`;
  } else if (ph === 'handoff') { who = pname(state.handoff.to); what = 'Le toca'; }
  else if (ph === 'round-end' || ph === 'game-over') {
    const r = state.round;
    who = pname(r.winner); what = R.handLabel(r.winningHand); sub = `+${r.patasAwarded} pata${r.patasAwarded > 1 ? 's' : ''}`;
  }
  m.innerHTML = `<div class="who">${who}</div><div class="what">${what}</div><div class="sub">${sub}</div>`;
}

function updateControls() {
  const c = app.querySelector('#controls');
  if (!c) return;
  const ph = state.phase;
  const actor = G.currentActor(state);
  const human = actor !== null && state.players[actor].type === 'human';
  const busy = ui.busy;
  let html = '';
  if (ph === 'draw') html = human ? `<button class="btn" data-a="draw" ${busy ? 'disabled' : ''}>Tirar el dado<small>roll one die</small></button>` : `<button class="btn" disabled>${pname(actor)} tira…</button>`;
  else if (ph === 'draw-done') html = `<button class="btn" data-a="continue">Abrir la ronda<small>${pname(state.draw.opener)} opens</small></button>`;
  else if (ph === 'turn') {
    const t = state.turn;
    if (human) {
      html = `<button class="btn" data-a="roll" ${busy || t.rollsUsed >= t.maxRolls ? 'disabled' : ''}>Tirar<small>${t.rollsUsed === 0 ? 'shake the cup' : 'roll the loose dice'}</small></button>
              <button class="btn secondary" data-a="stop" ${busy || t.rollsUsed < 1 ? 'disabled' : ''}>Plantarse<small>stand</small></button>`;
    } else html = `<button class="btn" disabled>${pname(actor)} piensa…</button>`;
  } else if (ph === 'desempate') html = human ? `<button class="btn" data-a="roll" ${busy ? 'disabled' : ''}>Tirar<small>one roll, all five</small></button>` : `<button class="btn" disabled>${pname(actor)} tira…</button>`;
  else if (ph === 'round-end') html = `<button class="btn" data-a="continue">${state.players.some((p) => p.patas >= state.targetPatas) ? 'Ver resultado' : 'Siguiente ronda'}</button>`;
  else if (ph === 'game-over') html = `<button class="btn" data-a="rematch">Revancha</button><button class="btn secondary" data-a="new">Nueva mesa</button>`;
  c.innerHTML = html;
}

function onControl(e) {
  const b = e.target.closest('button[data-a]');
  if (!b || b.disabled) return;
  S.play('click');
  switch (b.dataset.a) {
    case 'draw': S.play('reveal'); dispatch({ type: 'DRAW_ROLL' }); break;
    case 'roll': doRoll(); break;
    case 'stop': dispatch({ type: 'STOP' }); break;
    case 'continue': dispatch({ type: 'CONTINUE' }); break;
    case 'rematch': dispatch({ type: 'REMATCH' }); break;
    case 'new': dispatch({ type: 'NEW_GAME' }); break;
    default: break;
  }
}
function onDieTap(e) {
  const el = e.target.closest('.die[data-i]');
  if (!el || el.disabled) return;
  S.play('hold');
  dispatch({ type: 'TOGGLE_HOLD', i: Number(el.dataset.i) });
}

/* ----- overlays ----- */
const QUIPS = [
  '«Hay que tirar como si no importara, y que importe.»',
  'Constante, otra ronda de Papa Dobles.',
  'El mar sigue ahí afuera. Los dados, aquí.',
  'Nadie gana siempre en El Floridita; pero se bebe bien.',
  'Tira fuerte, que el cubilete no se rompe.',
];
function quip() { return QUIPS[(state.round ? state.round.number : 0) % QUIPS.length]; }

function renderOverlay() {
  let key = ''; let html = '';
  const ph = state.phase;
  if (ui.resumePrompt) {
    key = 'resume';
    html = `<div class="card"><div class="checker"></div><h2>Hay una partida en la mesa</h2><p>Ronda ${state.round ? state.round.number : '—'} · ${state.players.map((p) => `${esc(p.name)} ${p.patas}`).join(' · ')}</p>
      <div class="actions"><button class="btn" data-o="resume">Seguir jugando</button><button class="btn secondary" data-o="abandon">Nueva mesa</button></div></div>`;
  } else if (ui.settingsOpen) {
    key = 'settings';
    const standalone = window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
    html = `<div class="card settings"><div class="checker"></div><h2>Ajustes</h2>
      <div class="row"><span>Sonido<small>el interruptor de silencio del iPhone también manda</small></span><button class="toggle ${state.settings.muted ? '' : 'on'}" data-o="mute" aria-label="sonido"></button></div>
      <div class="row"><span>Buscar actualización<small>${standalone ? 'instalada en pantalla de inicio' : 'abierta en el navegador'}</small></span><button class="btn ghost" style="flex:0 0 auto;padding:8px 12px;font-size:12px" data-o="update">Buscar</button></div>
      <div class="row"><span>Reglas · Rules</span><button class="btn ghost" style="flex:0 0 auto;padding:8px 12px;font-size:12px" data-o="rules">Ver</button></div>
      ${ph !== 'setup' ? '<div class="row"><span>Abandonar la partida<small>se borra la mesa actual</small></span><button class="btn ghost" style="flex:0 0 auto;padding:8px 12px;font-size:12px" data-o="abandon">Salir</button></div>' : ''}
      <div class="actions"><button class="btn" data-o="close">Cerrar</button></div>
      <div class="version">Cubilete ${APP_VERSION}</div></div>`;
  } else if (ui.rulesOpen) {
    key = 'rules';
    html = `<div class="card rules"><div class="checker"></div><h2 style="text-align:center">Reglas del Cubilete</h2>
      <div class="faces">${[R.ACE, R.KING, R.QUEEN, R.JACK, R.GALLEGO, R.NEGRO].map((f) => `<div class="f"><span class="mini-die md">${faceSVG(f)}</span>${R.FACE_NAME[f]}</div>`).join('')}</div>
      <h3>Las caras</h3><p>De mayor a menor: As (♠), Rey, Cundanga (Q), Jeva (J), Gallego (10), Negro (9). <b>El As es comodín</b>: cuenta como cualquier cara.</p>
      <h3>La tirada</h3><ul><li>Cinco dados, hasta <b>tres tiradas</b>. Guarda los que quieras y vuelve a tirar el resto, o plántate.</li><li>Quien <b>abre</b> la ronda marca el máximo: si se planta a la primera, los demás solo tienen una tirada.</li></ul>
      <h3>Quién gana la ronda</h3><ul><li>Gana la mano con <b>más dados iguales</b> (contando los Ases). A igual número, la cara más alta.</li><li>Empate: los empatados tiran una vez más (desempate).</li><li>El ganador se lleva <b>una pata</b> y abre la siguiente ronda. Se juega a <b>10 patas</b>.</li></ul>
      <h3>Carabinas</h3><ul><li><b>Cinco iguales</b> es una carabina: la ronda termina al instante y los demás ya no tiran.</li><li><b>Carabina de Reyes naturales</b> (cinco Reyes sin As): 5 patas.</li><li><b>Carabina de Reyes no naturales</b> (Reyes con Ases): 2 patas.</li><li><b>Carabina de Ases</b> (cinco Ases): 10 patas — se gana la partida.</li><li>Las demás carabinas valen una pata.</li></ul>
      <h3>In English</h3><p style="font-size:13px;opacity:.85">Five poker dice, up to three rolls, aces wild. Most-of-a-kind wins the round (higher face breaks ties); the opener's roll count caps everyone else. Round winner takes one <i>pata</i>; five of a kind (a <i>carabina</i>) ends the round on the spot — natural kings 5, kings with aces 2, five aces wins outright. First to 10.</p>
      <div class="actions"><button class="btn" data-o="close">Cerrar</button></div></div>`;
  } else if (ui.logOpen) {
    key = 'log';
    html = `<div class="card"><div class="checker"></div><h2>La libreta</h2><div class="summary">${state.log.slice().reverse().map((l) => `<div class="row"><span>${esc(l)}</span></div>`).join('') || '<p>Nada todavía.</p>'}</div>
      <div class="actions"><button class="btn" data-o="close">Cerrar</button></div></div>`;
  } else if (ph === 'handoff') {
    key = 'handoff' + state.handoff.to + state.handoff.resume;
    const what = { draw: 'tira un dado', turn: 'le toca tirar', desempate: 'tira el desempate' }[state.handoff.resume];
    html = `<div class="card handoff"><div class="checker"></div><h2>Pásale el cubilete</h2><div class="cup">${cupSVG()}</div><h1>${pname(state.handoff.to)}</h1><p>${what}</p>
      <div class="actions"><button class="btn" data-o="continue">Aquí estoy<small>I have the cup</small></button></div></div>`;
  } else if (ph === 'round-end') {
    const r = state.round;
    key = 'round-end' + r.number;
    const h = r.winningHand;
    const carab = h.count === 5;
    const gameOver = state.players.some((p) => p.patas >= state.targetPatas);
    const winnerDice = r.desempate ? r.desempate.results[r.winner].dice : r.results[r.winner].dice;
    const rows = r.order.map((i) => {
      const res = r.results[i];
      if (!res) return `<div class="row skipped"><span class="who">${pname(i)}</span><span class="lbl">no llegó a tirar</span></div>`;
      return `<div class="row ${i === r.winner ? 'win' : ''}"><span class="who">${pname(i)}</span>${miniHand(res.dice)}<span class="lbl">${R.handLabel(res.hand)}</span></div>`;
    }).join('');
    html = `<div class="card ${carab ? 'carabina' : ''}"><div class="checker"></div>
      ${carab ? `<h1>¡${esc(h.name)}!</h1>` : `<h2>Ronda ${r.number}</h2>`}
      <div class="hand-big">${winnerDice.map((v) => `<div class="die ${carab ? 'carabina' : 'win'}">${faceSVG(v)}</div>`).join('')}</div>
      <div class="big">${pname(r.winner)}</div>
      <p>${carab ? '' : esc(R.handLabel(h)) + ' — '}<b>+${r.patasAwarded} pata${r.patasAwarded > 1 ? 's' : ''}</b> · lleva ${state.players[r.winner].patas}</p>
      ${r.desempate ? '<p class="quip">ganó el desempate</p>' : ''}
      <div class="summary">${rows}</div>
      <p class="quip">${quip()}</p>
      <div class="actions"><button class="btn" data-o="continue">${gameOver ? 'Ver resultado' : 'Siguiente ronda'}<small>${gameOver ? '' : pname(r.winner) + ' abre'}</small></button></div></div>`;
  } else if (ph === 'game-over') {
    key = 'game-over';
    const sorted = state.players.slice().sort((a, b) => b.patas - a.patas);
    const loser = sorted[sorted.length - 1];
    html = `<div class="card carabina"><div class="checker"></div><h2>Se acabó la partida</h2><div class="big">${pname(state.winner)}</div><p><b>${state.players[state.winner].patas} patas</b></p>
      <p class="quip">${esc(loser.name)} paga la ronda de daiquirís.</p>
      <div class="scoreboard">${sorted.map((p) => `<div class="row ${p.id === state.winner ? 'champ' : ''}"><span>${esc(p.name)}<span class="meta">${p.roundsWon} ronda${p.roundsWon === 1 ? '' : 's'}${p.carabinas ? ` · ${p.carabinas} carabina${p.carabinas > 1 ? 's' : ''}` : ''}</span></span><span class="n">${p.patas}</span></div>`).join('')}</div>
      <div class="actions"><button class="btn" data-o="rematch">Revancha<small>same table</small></button><button class="btn secondary" data-o="new">Nueva mesa</button></div></div>`;
  }
  if (key === ui.overlayKey) return;
  ui.overlayKey = key;
  overlayEl.innerHTML = html ? `<div class="overlay">${html}</div>` : '';
  overlayEl.querySelectorAll('[data-o]').forEach((b) => b.addEventListener('click', onOverlay));
}

function onOverlay(e) {
  const a = e.currentTarget.dataset.o;
  S.play('click');
  switch (a) {
    case 'resume': ui.resumePrompt = false; ui.overlayKey = null; render(); scheduleAi(); requestWake(); break;
    case 'abandon':
      if (ui.resumePrompt || confirm('¿Abandonar la partida?')) { ui.resumePrompt = false; ui.settingsOpen = false; ui.overlayKey = null; dispatch({ type: 'NEW_GAME' }); render(); }
      break;
    case 'close': ui.settingsOpen = false; ui.rulesOpen = false; ui.logOpen = false; ui.overlayKey = null; renderOverlay(); break;
    case 'rules': ui.settingsOpen = false; ui.rulesOpen = true; ui.overlayKey = null; renderOverlay(); break;
    case 'mute': dispatch({ type: 'SET_SETTING', key: 'muted', value: !state.settings.muted }); S.setMuted(!!state.settings.muted); ui.overlayKey = null; renderOverlay(); break;
    case 'update': checkForUpdate(); break;
    case 'continue': dispatch({ type: 'CONTINUE' }); break;
    case 'rematch': dispatch({ type: 'REMATCH' }); break;
    case 'new': dispatch({ type: 'NEW_GAME' }); break;
    default: break;
  }
}

/* ---------- confetti ---------- */
function confetti() {
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#f5b82e', '#f1e6c8', '#a8262b', '#1f7a8c', '#ffffff'];
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = 2.2 + Math.random() * 2.2 + 's';
    p.style.animationDelay = Math.random() * 0.8 + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 5500);
}

/* ---------- toast ---------- */
let toastEl = null;
function showToast(text, onTap) {
  if (toastEl) toastEl.remove();
  toastEl = document.createElement('button');
  toastEl.className = 'toast';
  toastEl.textContent = text;
  toastEl.addEventListener('click', () => { toastEl.remove(); toastEl = null; if (onTap) onTap(); });
  document.body.appendChild(toastEl);
  if (!onTap) setTimeout(() => { if (toastEl) { toastEl.remove(); toastEl = null; } }, 2600);
}

/* ---------- PWA: service worker + updates ---------- */
let swReg = null;
async function checkForUpdate() {
  if (!swReg) { showToast(navigator.onLine ? 'Sin service worker (¿localhost o https?)' : 'Sin conexión'); return; }
  try {
    await swReg.update();
    if (swReg.waiting) { swReg.waiting.postMessage({ type: 'SKIP_WAITING' }); showToast('Actualizando… toca para recargar', () => location.reload()); }
    else showToast(navigator.onLine ? 'Estás al día' : 'Sin conexión');
  } catch (_) { showToast('No se pudo comprobar'); }
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      swReg = await navigator.serviceWorker.register('./sw.js');
      swReg.addEventListener('updatefound', () => {
        const nw = swReg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) showToast('Nueva versión — toca para recargar', () => location.reload());
        });
      });
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') swReg.update().catch(() => {}); });
    } catch (_) { /* offline or unsupported */ }
  });
}

/* ---------- wake lock + audio unlock ---------- */
let wake = null;
async function requestWake() {
  try { if ('wakeLock' in navigator && !wake) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch (_) { /* ignore */ }
}
function releaseWake() { try { if (wake) wake.release(); } catch (_) { /* ignore */ } wake = null; }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && state.phase !== 'setup') requestWake(); });
document.addEventListener('pointerdown', S.unlock, { passive: true });
document.addEventListener('touchstart', S.unlock, { passive: true });

/* ---------- go ---------- */
render();
if (!ui.resumePrompt) { scheduleAi(); if (state.phase !== 'setup') requestWake(); }
