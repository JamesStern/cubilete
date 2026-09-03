// Renderer, input, AI driver, persistence and PWA glue for Cubilete.
import * as G from './game.js';
import * as R from './rules.js';
import { decide } from './ai.js';
import { faceSVG, miniHand, cupSVG } from './dice.js';
import * as S from './sound.js';
import { APP_VERSION } from './version.js';
import { t, handLabel, logLine, quips, setLang, getLang, LANGS } from './i18n.js';

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
setLang(state.settings.lang || 'en');
document.documentElement.lang = getLang();

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
    <button class="langpill" id="lang-toggle" aria-label="language">${LANGS.filter((l) => l !== getLang()).map((l) => t('lang.name', {}, l)).join('')}</button>
    <div class="panel">
      <div class="box">
        <h2>${t('setup.table')} <small>${t('setup.seats')}</small></h2>
        <div id="seats"></div>
        <div class="addrow"><button id="add-seat">${t('setup.addSeat')}</button><small>${t('setup.target')}</small></div>
      </div>
    </div>
    <div class="foot">
      <button class="btn" id="start">${t('setup.start')}<small>${t('setup.startSub')}</small></button>
      <div class="links"><button id="open-rules">${t('setup.rules')}</button><button id="open-settings">${t('setup.settings')}</button></div>
      ${isIphone && !standalone ? `<div class="a2hs">${t('setup.a2hs')}</div>` : ''}
    </div>
  </div>`;
  renderSeats();
  app.querySelector('#add-seat').addEventListener('click', () => { if (seats.length < 6) { seats.push({ name: G.DEFAULT_NAMES[seats.length] || t('seat.player', { n: seats.length + 1 }), type: 'ai' }); renderSeats(); } });
  app.querySelector('#lang-toggle').addEventListener('click', () => { S.play('click'); switchLang(LANGS.find((l) => l !== getLang())); });
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
      <input type="text" maxlength="16" value="${esc(s.name)}" placeholder="${G.DEFAULT_NAMES[i] || t('seat.name')}" autocapitalize="words" enterkeyhint="done">
      <div class="type"><button data-t="human" class="${s.type === 'human' ? 'on' : ''}">${t('seat.human')}</button><button data-t="ai" class="${s.type === 'ai' ? 'on' : ''}">${t('seat.ai')}</button></div>
      <button class="rm" ${seats.length <= 2 ? 'disabled style="visibility:hidden"' : ''} aria-label="remove">×</button>
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
      <div class="right"><button class="iconbtn" id="btn-log" aria-label="log">☰</button><button class="iconbtn" id="btn-settings" aria-label="settings">⚙</button></div>
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
  app.querySelector('#roundlbl').innerHTML = r ? t('top.round', { n: r.number }) : t('top.opening');
  updateScores();
  updateDice();
  updateMessage();
  updateControls();
  app.querySelector('#ticker').textContent = state.log.length ? logLine(state.log[state.log.length - 1]) : '';
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
    felt.textContent = t('felt.draw');
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
    box.innerHTML = [0, 1, 2, 3, 4].map((i) => `<button class="die blank" data-i="${i}" aria-label="die ${i + 1}"></button>`).join('');
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
  felt.textContent = holdable ? (state.players[state.turn.player].type === 'human' ? t('felt.hold') : t('felt.ai')) : '';
}

const T = t;
function updateMessage() {
  const m = app.querySelector('#message');
  const ph = state.phase;
  const actor = G.currentActor(state);
  let who = '', what = '', sub = '';
  if (ph === 'draw') { who = pname(actor); what = t('msg.drawWhat'); sub = t('msg.drawSub'); }
  else if (ph === 'draw-done') { who = pname(state.draw.opener); what = t('msg.drawDone', { face: R.FACE_NAME[state.draw.rolls[state.draw.opener]] }); }
  else if (ph === 'turn') {
    const t = state.turn; const r = state.round;
    who = pname(t.player) + (state.players[t.player].type === 'ai' ? '<span class="thinking"></span>' : '');
    what = t.hand ? handLabel(t.hand) : (r.turnPtr === 0 ? T('msg.open') : T('msg.shake'));
    sub = T('msg.roll', { n: Math.min(t.rollsUsed + 1, t.maxRolls), max: t.maxRolls });
    if (t.rollsUsed >= t.maxRolls) sub = T('msg.rollsUsed', { n: t.rollsUsed });
    const best = G.bestOnTable(state);
    if (best) {
      const owner = r.order.find((i) => r.results[i] && R.compare(r.results[i].hand, best) === 0);
      sub += ' · ' + T('msg.toBeat', { hand: handLabel(best), name: pname(owner) });
    }
    if (r.rollCap && r.rollCap < G.MAX_ROLLS && r.turnPtr > 0) sub += `<span class="cap">${T('msg.cap', { n: r.rollCap })}</span>`;
  } else if (ph === 'desempate') {
    const d = state.desempate;
    who = pname(actor); what = T('msg.desempate'); sub = T('msg.desempateSub', { names: d.contenders.map((i) => pname(i)).join(' · ') });
  } else if (ph === 'handoff') { who = pname(state.handoff.to); what = T('msg.handoff'); }
  else if (ph === 'round-end' || ph === 'game-over') {
    const r = state.round;
    who = pname(r.winner); what = handLabel(r.winningHand); sub = T('msg.patas', { n: r.patasAwarded });
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
  if (ph === 'draw') html = human ? `<button class="btn" data-a="draw" ${busy ? 'disabled' : ''}>${t('btn.drawRoll')}<small>${t('btn.drawRollSub')}</small></button>` : `<button class="btn" disabled>${t('btn.waiting', { name: pname(actor) })}</button>`;
  else if (ph === 'draw-done') html = `<button class="btn" data-a="continue">${t('btn.openRound')}<small>${t('btn.opens', { name: pname(state.draw.opener) })}</small></button>`;
  else if (ph === 'turn') {
    const tn = state.turn;
    if (human) {
      html = `<button class="btn" data-a="roll" ${busy || tn.rollsUsed >= tn.maxRolls ? 'disabled' : ''}>${t('btn.roll')}<small>${tn.rollsUsed === 0 ? t('btn.rollFirst') : t('btn.rollAgain')}</small></button>
              <button class="btn secondary" data-a="stop" ${busy || tn.rollsUsed < 1 ? 'disabled' : ''}>${t('btn.stand')}<small>${t('btn.standSub')}</small></button>`;
    } else html = `<button class="btn" disabled>${t('btn.thinking', { name: pname(actor) })}</button>`;
  } else if (ph === 'desempate') html = human ? `<button class="btn" data-a="roll" ${busy ? 'disabled' : ''}>${t('btn.roll')}<small>${t('btn.tiebreakSub')}</small></button>` : `<button class="btn" disabled>${t('btn.waiting', { name: pname(actor) })}</button>`;
  else if (ph === 'round-end') html = `<button class="btn" data-a="continue">${state.players.some((p) => p.patas >= state.targetPatas) ? t('btn.result') : t('btn.next')}</button>`;
  else if (ph === 'game-over') html = `<button class="btn" data-a="rematch">${t('btn.rematch')}</button><button class="btn secondary" data-a="new">${t('btn.newTable')}</button>`;
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
function quip() { const q = quips(); return q[(state.round ? state.round.number : 0) % q.length]; }
function switchLang(l) {
  dispatch({ type: 'SET_SETTING', key: 'lang', value: l });
  setLang(l);
  document.documentElement.lang = l;
  ui.screen = ''; ui.overlayKey = null;
  render();
}

function renderOverlay() {
  let key = ''; let html = '';
  const ph = state.phase;
  if (ui.resumePrompt) {
    key = 'resume';
    html = `<div class="card"><div class="checker"></div><h2>${t('resume.title')}</h2><p>${t('resume.round', { n: state.round ? state.round.number : '—' })} · ${state.players.map((p) => `${esc(p.name)} ${p.patas}`).join(' · ')}</p>
      <div class="actions"><button class="btn" data-o="resume">${t('resume.continue')}</button><button class="btn secondary" data-o="abandon">${t('btn.newTable')}</button></div></div>`;
  } else if (ui.settingsOpen) {
    key = 'settings';
    const standalone = window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
    html = `<div class="card settings"><div class="checker"></div><h2>${t('settings.title')}</h2>
      <div class="row"><span>${t('settings.language')}</span><div class="seg">${LANGS.map((l) => `<button data-o="lang" data-l="${l}" class="${getLang() === l ? 'on' : ''}">${t('lang.name', {}, l)}</button>`).join('')}</div></div>
      <div class="row"><span>${t('settings.sound')}<small>${t('settings.soundSub')}</small></span><button class="toggle ${state.settings.muted ? '' : 'on'}" data-o="mute" aria-label="sound"></button></div>
      <div class="row"><span>${t('settings.update')}<small>${standalone ? t('settings.installed') : t('settings.browser')}</small></span><button class="btn ghost" style="flex:0 0 auto;padding:8px 12px;font-size:12px" data-o="update">${t('settings.check')}</button></div>
      <div class="row"><span>${t('settings.rules')}</span><button class="btn ghost" style="flex:0 0 auto;padding:8px 12px;font-size:12px" data-o="rules">${t('settings.view')}</button></div>
      ${ph !== 'setup' ? `<div class="row"><span>${t('settings.abandon')}<small>${t('settings.abandonSub')}</small></span><button class="btn ghost" style="flex:0 0 auto;padding:8px 12px;font-size:12px" data-o="abandon">${t('settings.quit')}</button></div>` : ''}
      <div class="actions"><button class="btn" data-o="close">${t('btn.close')}</button></div>
      <div class="version">Cubilete ${APP_VERSION}</div></div>`;
  } else if (ui.rulesOpen) {
    key = 'rules';
    html = `<div class="card rules"><div class="checker"></div><h2 style="text-align:center">${t('rules.title')}</h2>
      <div class="faces">${[R.ACE, R.KING, R.QUEEN, R.JACK, R.GALLEGO, R.NEGRO].map((f) => `<div class="f"><span class="mini-die md">${faceSVG(f)}</span>${R.FACE_NAME[f]}</div>`).join('')}</div>
      <h3>${t('rules.faces')}</h3><p>${t('rules.facesText')}</p>
      <h3>${t('rules.roll')}</h3><ul><li>${t('rules.roll1')}</li><li>${t('rules.roll2')}</li></ul>
      <h3>${t('rules.win')}</h3><ul><li>${t('rules.win1')}</li><li>${t('rules.win2')}</li><li>${t('rules.win3')}</li></ul>
      <h3>${t('rules.carabinas')}</h3><ul><li>${t('rules.c1')}</li><li>${t('rules.c2')}</li><li>${t('rules.c3')}</li><li>${t('rules.c4')}</li><li>${t('rules.c5')}</li></ul>
      <div class="actions"><button class="btn" data-o="close">${t('btn.close')}</button></div></div>`;
  } else if (ui.logOpen) {
    key = 'log';
    html = `<div class="card"><div class="checker"></div><h2>${t('log.title')}</h2><div class="summary">${state.log.slice().reverse().map((l) => `<div class="row"><span>${esc(logLine(l))}</span></div>`).join('') || `<p>${t('log.empty')}</p>`}</div>
      <div class="actions"><button class="btn" data-o="close">${t('btn.close')}</button></div></div>`;
  } else if (ph === 'handoff') {
    key = 'handoff' + state.handoff.to + state.handoff.resume;
    const what = t('handoff.' + state.handoff.resume);
    html = `<div class="card handoff"><div class="checker"></div><h2>${t('handoff.title')}</h2><div class="cup">${cupSVG()}</div><h1>${pname(state.handoff.to)}</h1><p>${what}</p>
      <div class="actions"><button class="btn" data-o="continue">${t('handoff.btn')}</button></div></div>`;
  } else if (ph === 'round-end') {
    const r = state.round;
    key = 'round-end' + r.number;
    const h = r.winningHand;
    const carab = h.count === 5;
    const gameOver = state.players.some((p) => p.patas >= state.targetPatas);
    const winnerDice = r.desempate ? r.desempate.results[r.winner].dice : r.results[r.winner].dice;
    const rows = r.order.map((i) => {
      const res = r.results[i];
      if (!res) return `<div class="row skipped"><span class="who">${pname(i)}</span><span class="lbl">${t('roundEnd.skipped')}</span></div>`;
      return `<div class="row ${i === r.winner ? 'win' : ''}"><span class="who">${pname(i)}</span>${miniHand(res.dice)}<span class="lbl">${handLabel(res.hand)}</span></div>`;
    }).join('');
    const bang = getLang() === 'es' ? `¡${esc(h.name)}!` : `${esc(h.name)}!`;
    html = `<div class="card ${carab ? 'carabina' : ''}"><div class="checker"></div>
      ${carab ? `<h1>${bang}</h1>` : `<h2>${t('roundEnd.title', { n: r.number })}</h2>`}
      <div class="hand-big">${winnerDice.map((v) => `<div class="die ${carab ? 'carabina' : 'win'}">${faceSVG(v)}</div>`).join('')}</div>
      <div class="big">${pname(r.winner)}</div>
      <p>${carab ? '' : esc(handLabel(h)) + ' — '}<b>${t('msg.patas', { n: r.patasAwarded })}</b> · ${t('roundEnd.has', { n: state.players[r.winner].patas })}</p>
      ${r.desempate ? `<p class="quip">${t('roundEnd.tiebreak')}</p>` : ''}
      <div class="summary">${rows}</div>
      <p class="quip">${quip()}</p>
      <div class="actions"><button class="btn" data-o="continue">${gameOver ? t('btn.result') : t('btn.next')}<small>${gameOver ? '' : t('btn.opens', { name: pname(r.winner) })}</small></button></div></div>`;
  } else if (ph === 'game-over') {
    key = 'game-over';
    const sorted = state.players.slice().sort((a, b) => b.patas - a.patas);
    const loser = sorted[sorted.length - 1];
    html = `<div class="card carabina"><div class="checker"></div><h2>${t('gameOver.title')}</h2><div class="big">${pname(state.winner)}</div><p><b>${t('gameOver.patas', { n: state.players[state.winner].patas })}</b></p>
      <p class="quip">${t('gameOver.buys', { name: esc(loser.name) })}</p>
      <div class="scoreboard">${sorted.map((p) => `<div class="row ${p.id === state.winner ? 'champ' : ''}"><span>${esc(p.name)}<span class="meta">${t('gameOver.rounds', { n: p.roundsWon })}${p.carabinas ? ` · ${t('gameOver.carabinas', { n: p.carabinas })}` : ''}</span></span><span class="n">${p.patas}</span></div>`).join('')}</div>
      <div class="actions"><button class="btn" data-o="rematch">${t('btn.rematch')}<small>${t('btn.rematchSub')}</small></button><button class="btn secondary" data-o="new">${t('btn.newTable')}</button></div></div>`;
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
      if (ui.resumePrompt || confirm(t('confirm.abandon'))) { ui.resumePrompt = false; ui.settingsOpen = false; ui.overlayKey = null; dispatch({ type: 'NEW_GAME' }); render(); }
      break;
    case 'close': ui.settingsOpen = false; ui.rulesOpen = false; ui.logOpen = false; ui.overlayKey = null; renderOverlay(); break;
    case 'rules': ui.settingsOpen = false; ui.rulesOpen = true; ui.overlayKey = null; renderOverlay(); break;
    case 'mute': dispatch({ type: 'SET_SETTING', key: 'muted', value: !state.settings.muted }); S.setMuted(!!state.settings.muted); ui.overlayKey = null; renderOverlay(); break;
    case 'update': checkForUpdate(); break;
    case 'lang': { const l = e.currentTarget.dataset.l; if (l !== getLang()) { ui.settingsOpen = true; switchLang(l); } break; }
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
  if (!swReg) { showToast(navigator.onLine ? t('toast.noSw') : t('toast.offline')); return; }
  try {
    await swReg.update();
    if (swReg.waiting) { swReg.waiting.postMessage({ type: 'SKIP_WAITING' }); showToast(t('toast.updating'), () => location.reload()); }
    else showToast(navigator.onLine ? t('toast.upToDate') : t('toast.offline'));
  } catch (_) { showToast(t('toast.failed')); }
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      swReg = await navigator.serviceWorker.register('./sw.js');
      swReg.addEventListener('updatefound', () => {
        const nw = swReg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) showToast(t('toast.newVersion'), () => location.reload());
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
