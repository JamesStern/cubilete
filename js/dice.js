// Inline SVG art: the six faces (modelled on a Cuban poker-dice set) and the leather cup.
import { ACE, KING, QUEEN, JACK, GALLEGO, NEGRO } from './rules.js';

const INK = '#1c2230';
const RED = '#a3262a';
const SPADE = 'M50 12C50 12 19 40 19 58c0 12 10 19 20 14 4-2 7-5 9-9-1 11-6 19-14 25h32c-8-6-13-14-14-25 2 4 5 7 9 9 10 5 20-2 20-14C81 40 50 12 50 12z';

function corner(letter) {
  return `<text x="12" y="24" font-size="15" font-family="Copperplate, 'Copperplate Gothic', Georgia, serif" font-weight="700" fill="${INK}">${letter}</text>
  <text x="88" y="76" font-size="15" font-family="Copperplate, 'Copperplate Gothic', Georgia, serif" font-weight="700" fill="${INK}" transform="rotate(180 88 76)">${letter}</text>
  <text x="80" y="24" font-size="10" fill="${INK}">★</text><text x="20" y="84" font-size="10" fill="${INK}">★</text>`;
}

function pips(rows, color) {
  let out = '';
  rows.forEach(([y, xs]) => { for (const x of xs) out += `<ellipse cx="${x}" cy="${y}" rx="6" ry="5.6" fill="${color}"/>`; });
  return out;
}

const FACE_BODY = {
  [ACE]: `<path d="${SPADE}" fill="${INK}"/>`,
  [KING]: `${corner('K')}
    <path d="M32 44l6-14 12 10 -6-20 12 20 -6-20 12 20 6-14v22H32z" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
    <text x="50" y="80" text-anchor="middle" font-size="36" font-family="Copperplate, 'Copperplate Gothic', Georgia, serif" font-weight="700" fill="${INK}">K</text>`,
  [QUEEN]: `${corner('Q')}
    <path d="M34 40c6-10 26-10 32 0M34 40v8h32v-8M50 22a5 5 0 1 0 0.1 0" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M42 36l8 6 8-6" fill="none" stroke="${INK}" stroke-width="2"/>
    <text x="50" y="80" text-anchor="middle" font-size="36" font-family="Copperplate, 'Copperplate Gothic', Georgia, serif" font-weight="700" fill="${INK}">Q</text>`,
  [JACK]: `${corner('J')}
    <path d="M36 46c0-12 8-20 16-24 4 10 14 12 14 22-6-4-10 0-14 4-6-6-12-4-16-2z" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M52 22c6-6 12-8 18-6" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    <text x="50" y="80" text-anchor="middle" font-size="36" font-family="Copperplate, 'Copperplate Gothic', Georgia, serif" font-weight="700" fill="${INK}">J</text>`,
  [GALLEGO]: pips([[22, [20, 40, 60, 80]], [50, [36, 64]], [78, [20, 40, 60, 80]]], RED),
  [NEGRO]: pips([[22, [20, 40, 60, 80]], [50, [50]], [78, [20, 40, 60, 80]]], INK),
};

/** Full-size die face SVG. */
export function faceSVG(v) {
  return `<svg viewBox="0 0 100 100" class="face" aria-hidden="true">${FACE_BODY[v] || ''}</svg>`;
}

/** Tiny die (inline-block) for scoreboards and logs. */
export function miniDie(v, extraClass = '') {
  return `<span class="mini-die ${extraClass}">${faceSVG(v)}</span>`;
}

export function miniHand(dice) {
  return `<span class="mini-hand">${dice.map((d) => miniDie(d)).join('')}</span>`;
}

/** The leather cup. */
export function cupSVG() {
  return `<svg viewBox="0 0 120 170" class="cup-svg" aria-hidden="true">
  <defs>
    <linearGradient id="leather" x1="0" x2="1">
      <stop offset="0" stop-color="#6b3a1c"/><stop offset=".18" stop-color="#a86a3a"/><stop offset=".45" stop-color="#c8865a"/>
      <stop offset=".7" stop-color="#9c5d33"/><stop offset="1" stop-color="#5a2e15"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" x2="1"><stop offset="0" stop-color="#3a1d0c"/><stop offset=".5" stop-color="#7a4a28"/><stop offset="1" stop-color="#2e150a"/></linearGradient>
  </defs>
  <path d="M14 14 L106 14 L98 156 Q60 168 22 156 Z" fill="url(#leather)"/>
  <ellipse cx="60" cy="14" rx="46" ry="9" fill="url(#rim)"/>
  <ellipse cx="60" cy="14" rx="40" ry="6" fill="#1a0c05"/>
  <path d="M60 22 L60 158" stroke="#3a1d0c" stroke-width="3" opacity=".6"/>
  <path d="M60 24 L60 156" stroke="#e8c79a" stroke-width="1.2" stroke-dasharray="3 4" opacity=".8"/>
  <path d="M30 60 q30 10 60 0" stroke="#3a1d0c" stroke-width="1" fill="none" opacity=".35"/>
  <path d="M28 110 q32 12 64 0" stroke="#3a1d0c" stroke-width="1" fill="none" opacity=".35"/>
  <path d="M22 156 Q60 168 98 156 L100 160 Q60 174 20 160 Z" fill="#2e150a"/>
</svg>`;
}
