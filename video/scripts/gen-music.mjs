// Generates an ORIGINAL cinematic ambient pad as a 44.1kHz stereo 16-bit WAV.
// Zero dependencies, fully offline, no copyrighted material.
// Slow crossfading chord progression (Cmaj -> Amin -> Fmaj -> Gmaj) with a
// sub-bass warmth layer, octave shimmer, and a gentle global tremolo + fades.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/config/script.json"), "utf8")
);
const DURATION = scriptData.scenes.reduce((s, sc) => s + sc.seconds, 0); // seconds
const SR = 44100;
const N = Math.floor(DURATION * SR);

const CHORDS = [
  [130.81, 164.81, 196.0], // C major
  [110.0, 130.81, 164.81], // A minor
  [87.31, 110.0, 130.81], // F major
  [98.0, 123.47, 146.83], // G major
];

const STEP = 7.0; // seconds between chord onsets
const SEG = 9.0; // seconds each chord sustains (overlap = crossfade)
const FADE = 1.2; // seconds attack/release of each segment

// Raised-cosine envelope for one segment, returns gain at absolute time t
function segEnv(t, start) {
  const local = t - start;
  if (local < 0 || local > SEG) return 0;
  if (local < FADE) return 0.5 - 0.5 * Math.cos((Math.PI * local) / FADE);
  if (local > SEG - FADE)
    return 0.5 - 0.5 * Math.cos((Math.PI * (SEG - local)) / FADE);
  return 1;
}

const numSegments = Math.ceil((DURATION + SEG) / STEP);

const left = new Float32Array(N);
const right = new Float32Array(N);

for (let i = 0; i < N; i++) {
  const t = i / SR;
  let sL = 0;
  let sR = 0;

  for (let seg = 0; seg < numSegments; seg++) {
    const start = seg * STEP;
    const env = segEnv(t, start);
    if (env <= 0) continue;
    const chord = CHORDS[seg % CHORDS.length];

    for (let v = 0; v < chord.length; v++) {
      const f = chord[v];
      // root + octave shimmer, slight detune for stereo width
      const main = Math.sin(2 * Math.PI * f * t);
      const oct = Math.sin(2 * Math.PI * f * 2 * t) * 0.16;
      const detuneL = Math.sin(2 * Math.PI * (f * 1.003) * t) * 0.5;
      const detuneR = Math.sin(2 * Math.PI * (f * 0.997) * t) * 0.5;
      const voiceL = (main + oct + detuneL) * env;
      const voiceR = (main + oct + detuneR) * env;
      sL += voiceL;
      sR += voiceR;
    }
    // sub-bass warmth from the chord root
    const sub = Math.sin(2 * Math.PI * (chord[0] / 2) * t) * env * 0.5;
    sL += sub;
    sR += sub;
  }

  // gentle tremolo movement (0.08 Hz)
  const trem = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.08 * t);

  // global fades
  let g = 1;
  if (t < 2) g = t / 2;
  if (t > DURATION - 3) g = Math.max(0, (DURATION - t) / 3);

  const master = 0.05 * trem * g; // keep it a soft bed
  left[i] = Math.max(-1, Math.min(1, sL * master));
  right[i] = Math.max(-1, Math.min(1, sR * master));
}

// ---- write 16-bit PCM stereo WAV ----
const bytesPerSample = 2;
const dataSize = N * 2 * bytesPerSample;
const buffer = Buffer.alloc(44 + dataSize);
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(2, 22); // stereo
buffer.writeUInt32LE(SR, 24);
buffer.writeUInt32LE(SR * 2 * bytesPerSample, 28);
buffer.writeUInt16LE(2 * bytesPerSample, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataSize, 40);

let off = 44;
for (let i = 0; i < N; i++) {
  buffer.writeInt16LE((left[i] * 32767) | 0, off);
  off += 2;
  buffer.writeInt16LE((right[i] * 32767) | 0, off);
  off += 2;
}

const outDir = path.join(__dirname, "../public/audio");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "ambient.wav");
fs.writeFileSync(outPath, buffer);
console.log(`ambient.wav written: ${(buffer.length / 1024 / 1024).toFixed(2)} MB, ${DURATION}s`);
