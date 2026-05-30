// Generates subtitles.srt and subtitles.vtt from the single source of truth
// (src/config/script.json). One cue per scene, timed to the scene durations.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/config/script.json"), "utf8")
);

function ts(sec, comma) {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(Math.floor(sec % 60)).padStart(2, "0");
  const ms = String(Math.round((sec - Math.floor(sec)) * 1000)).padStart(3, "0");
  return `${h}:${m}:${s}${comma ? "," : "."}${ms}`;
}

let t = 0;
const srt = [];
const vtt = ["WEBVTT", ""];

scriptData.scenes.forEach((sc, i) => {
  const start = t;
  const end = t + sc.seconds;
  t = end;
  srt.push(
    `${i + 1}`,
    `${ts(start, true)} --> ${ts(end, true)}`,
    sc.subtitle,
    ""
  );
  vtt.push(`${ts(start, false)} --> ${ts(end, false)}`, sc.subtitle, "");
});

const outDir = path.join(__dirname, "../../public/videos");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "subtitles.srt"), srt.join("\n"), "utf8");
fs.writeFileSync(path.join(outDir, "subtitles.vtt"), vtt.join("\n"), "utf8");
console.log(`subtitles.srt + subtitles.vtt written (${scriptData.scenes.length} cues, ${t}s total)`);
