// ──────────────────────────────────────────────────────────────────────────
// Celebration effects ("juice"): confetti bursts + gentle WebAudio tones.
// No libraries, no audio files — everything is generated in the browser.
//
// fxHeart(n)  – small sparkle burst + rising note when heart n fills
// fxWin()     – big confetti + happy chime when the round is won
// fxAdopt()   – full-screen confetti rain on adoption
//
// All sounds respect the 🔊 toggle (TTS.muted) so one switch silences the app.
// ──────────────────────────────────────────────────────────────────────────

const FX = { ctx: null };

// ── sounds ──────────────────────────────────────────────────────────────────
function fxAudioCtx() {
  if (!FX.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    FX.ctx = new AC();
  }
  if (FX.ctx.state === "suspended") FX.ctx.resume();
  return FX.ctx;
}

function fxMuted() {
  return typeof TTS !== "undefined" && TTS.muted;
}

// One soft bell-like note.
function fxNote(freq, when = 0, dur = 0.35, vol = 0.18) {
  const ctx = fxAudioCtx();
  if (!ctx || fxMuted()) return;
  const t = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

// Rising pentatonic scale — each filled heart plays the next step up,
// so progress literally sounds like climbing. 🎵
const FX_SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.7, 1318.5, 1568.0, 1760.0];

function fxHeartSound(step) {
  fxNote(FX_SCALE[Math.min(step, FX_SCALE.length - 1)] || 523.25);
}

function fxFanfare() {
  // A happy little arpeggio: C E G C
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => fxNote(f, i * 0.12, 0.5, 0.2));
  fxNote(1318.5, 0.5, 0.8, 0.15);
}

// ── confetti ────────────────────────────────────────────────────────────────
const FX_COLORS = ["#ffce5c", "#ef8aa0", "#6bbf59", "#bfe3f5", "#c9a2e8", "#ff9f68"];
const FX_SHAPES = ["✦", "●", "▲", "■", "♥"];

function fxLayer() {
  let layer = document.getElementById("fx-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "fx-layer";
    document.body.appendChild(layer);
  }
  return layer;
}

// Burst `count` particles from screen point (x, y).
function fxBurst(x, y, count = 14, power = 90) {
  const layer = fxLayer();
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "fx-p";
    p.textContent = FX_SHAPES[Math.floor(Math.random() * FX_SHAPES.length)];
    p.style.color = FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = power * (0.4 + Math.random() * 0.9);
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    p.style.setProperty("--dy", Math.sin(angle) * dist - 40 + "px");
    p.style.setProperty("--rot", (Math.random() * 540 - 270) + "deg");
    p.style.fontSize = 10 + Math.random() * 12 + "px";
    layer.appendChild(p);
    setTimeout(() => p.remove(), 1100);
  }
}

// Full-screen falling confetti rain for the big moments.
function fxRain(count = 60) {
  const layer = fxLayer();
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "fx-rain";
    p.textContent = FX_SHAPES[Math.floor(Math.random() * FX_SHAPES.length)];
    p.style.color = FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)];
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDelay = Math.random() * 0.9 + "s";
    p.style.animationDuration = 1.4 + Math.random() * 1.4 + "s";
    p.style.fontSize = 12 + Math.random() * 14 + "px";
    layer.appendChild(p);
    setTimeout(() => p.remove(), 3200);
  }
}

// ── public API (called from app.js) ─────────────────────────────────────────
function fxHeart(step) {
  const meter = document.getElementById("trust-meter");
  if (meter) {
    const r = meter.getBoundingClientRect();
    fxBurst(r.left + r.width / 2, r.top + r.height / 2, 12, 70);
  }
  fxHeartSound(step);
}

function fxWin() {
  const stage = document.getElementById("goat-stage");
  const r = stage
    ? stage.getBoundingClientRect()
    : { left: innerWidth / 2 - 50, top: innerHeight / 3, width: 100, height: 100 };
  fxBurst(r.left + r.width / 2, r.top + r.height / 2, 26, 150);
  fxRain(40);
  fxFanfare();
}

function fxAdopt() {
  fxRain(80);
  fxFanfare();
}
