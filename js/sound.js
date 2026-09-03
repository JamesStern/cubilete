// Tiny Web Audio synth — no audio files, nothing to fetch offline.
let ctx = null;
let muted = false;

export function setMuted(m) { muted = !!m; }
export function isMuted() { return muted; }

let unlocked = false;
// A few ms of silence as a WAV: playing it through <audio> on the first tap moves iOS to the
// "playback" audio session so Web Audio is heard in a home-screen app (and past the silent switch).
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';

/** Call from a user gesture (touchend/click) to unlock iOS audio. Safe to call repeatedly. */
export function unlock() {
  try {
    if ('audioSession' in navigator) { try { navigator.audioSession.type = 'playback'; } catch (_) { /* ignore */ } }
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    if (!unlocked) {
      // the classic unlock: play a silent buffer inside the gesture
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf; src.connect(ctx.destination); src.start(0);
      const a = new Audio(SILENT_WAV);
      a.setAttribute('playsinline', '');
      const pr = a.play();
      if (pr && pr.catch) pr.catch(() => {});
      unlocked = true;
    }
  } catch (_) { /* no audio available */ }
}

function noiseBuffer() {
  const len = ctx.sampleRate * 0.4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function burst(t, dur, freq, gain) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 1.2;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(ctx.destination);
  src.start(t); src.stop(t + dur + 0.02);
}

function tone(t, freq, dur, type = 'triangle', gain = 0.12) {
  const o = ctx.createOscillator();
  o.type = type; o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t); o.stop(t + dur + 0.05);
}

export function play(name) {
  if (muted || !ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  switch (name) {
    case 'shake':
      for (let i = 0; i < 7; i++) burst(t + i * 0.085 + Math.random() * 0.02, 0.06, 1800 + Math.random() * 900, 0.5);
      break;
    case 'reveal':
      for (let i = 0; i < 5; i++) burst(t + i * 0.06, 0.05, 2600 + i * 200, 0.35);
      break;
    case 'click': burst(t, 0.03, 3000, 0.25); break;
    case 'hold': tone(t, 660, 0.08, 'sine', 0.08); break;
    case 'pata': tone(t, 523, 0.18); tone(t + 0.16, 784, 0.3); break;
    case 'fanfare':
      [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(t + i * 0.13, f, 0.28, 'triangle', 0.14));
      tone(t + 0.8, 1319, 0.9, 'triangle', 0.16);
      break;
    case 'lose': tone(t, 330, 0.25, 'sine', 0.1); tone(t + 0.25, 262, 0.5, 'sine', 0.1); break;
    default: break;
  }
}
