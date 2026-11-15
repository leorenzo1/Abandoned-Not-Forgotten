// Tiny sound effects made with the browser's audio engine (no sound files needed).
const KEY = "anf_muted";
let ctx;
let muted = (() => {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
})();

export const isMuted = () => muted;
export function setMuted(value) {
  muted = value;
  try { localStorage.setItem(KEY, value ? "1" : "0"); } catch { /* ignore */ }
}

const NOTES = {
  click: [[660, 0.06]],
  whoosh: [[300, 0.08], [500, 0.08], [800, 0.1]],
  stamp: [[523, 0.1], [659, 0.1], [784, 0.2]],
  right: [[523, 0.1], [784, 0.22]],
  wrong: [[220, 0.25]],
};

export function playSfx(name) {
  if (muted) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = ctx || new AC();
    if (ctx.state === "suspended") ctx.resume();
    let t = ctx.currentTime;
    for (const [freq, len] of NOTES[name] || []) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = name === "wrong" ? "sawtooth" : "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.15, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + len + 0.02);
      t += len * 0.9;
    }
  } catch { /* sound is optional */ }
}
