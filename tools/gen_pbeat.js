// Regenerates the P_BEAT table embedded in js/ai.js.  Usage: node tools/gen_pbeat.js
import { readFileSync, writeFileSync } from 'node:fs';
import { computePBeat } from '../js/ai.js';
const path = new URL('../js/ai.js', import.meta.url);
const src = readFileSync(path, 'utf8');
const literal = JSON.stringify(computePBeat());
const out = src.replace(/\/\*P_BEAT_START\*\/[\s\S]*?\/\*P_BEAT_END\*\//, `/*P_BEAT_START*/${literal}/*P_BEAT_END*/`);
writeFileSync(path, out);
console.log('P_BEAT written:', literal.length, 'chars');
