// ──────────────────────────────────────────────────────────────────────────
// Text-to-speech for Clover's lines, using the browser's built-in speech
// engine (Web Speech API). No keys, no network, works offline — and many
// 4-8 year olds can't read yet, so hearing the words matters.
//
// speak(text)      – say a line in Clover's voice (cancels the previous line)
// ttsToggle()      – mute/unmute, persisted in localStorage
// ttsEnabled()     – current state (for drawing the button)
// ──────────────────────────────────────────────────────────────────────────

const TTS = {
  muted: localStorage.getItem("sf-tts-muted") === "1",
  voice: null,
  supported: "speechSynthesis" in window,
};

// Voices load asynchronously in most browsers; pick one when they arrive.
if (TTS.supported) {
  pickVoice();
  window.speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
}

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;
  const en = voices.filter((v) => v.lang.startsWith("en"));

  // 1) Neural "Premium"/"Enhanced" voices (macOS: download for free in
  //    System Settings → Accessibility → Spoken Content → Manage Voices).
  //    These sound FAR less robotic than the defaults.
  const premiumWishlist = ["Zoe", "Ava", "Samantha", "Allison", "Susan", "Karen"];
  TTS.voice =
    premiumWishlist
      .map((n) => en.find((v) => v.name.includes(n) && /premium|enhanced/i.test(v.name)))
      .find(Boolean) ||
    en.find((v) => /premium|enhanced|natural|neural/i.test(v.name)) ||
    // 2) Chrome on macOS hides the "(Premium)" label but plays the premium
    //    audio under the plain name — so prefer Zoe by name.
    en.find((v) => v.name === "Zoe") ||
    // 3) Decent standard voices as fallback.
    ["Samantha", "Karen", "Moira", "Google US English", "Microsoft Zira"]
      .map((n) => en.find((v) => v.name === n))
      .find(Boolean) ||
    en.find((v) => /female/i.test(v.name)) ||
    en[0] ||
    voices[0];
}

// Speak a line. Optional `onEnd` runs when she finishes (or if speech fails),
// so callers can wait for her to stop talking before saying something else.
// Returns false if nothing will be spoken (muted/unsupported) — the caller
// should then fall back to its own timing.
function speak(text, onEnd) {
  if (!TTS.supported || TTS.muted || !text) return false;
  window.speechSynthesis.cancel(); // one line at a time — no overlapping chatter

  // Strip emoji & symbols so the engine doesn't read "yellow heart" aloud.
  const clean = text
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{FE0F}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return false;

  const u = new SpeechSynthesisUtterance(clean);
  if (TTS.voice) u.voice = TTS.voice;
  u.pitch = 1.25; // a touch higher — friendlier, more "little goat"
  u.rate = 0.95;  // a touch slower for young listeners
  if (onEnd) {
    let done = false;
    const finish = () => { if (!done) { done = true; clearTimeout(timer); onEnd(); } };
    u.onend = finish;
    u.onerror = finish;
    // Watchdog: some browsers (Chrome especially) sometimes never fire 'onend'.
    // Estimate how long the line takes to say and continue anyway, so the game
    // can never get stuck waiting on the speech engine.
    const words = clean.split(/\s+/).length;
    const estimate = Math.min(12000, Math.max(1500, words * 420));
    const timer = setTimeout(finish, estimate);
  }
  window.speechSynthesis.speak(u);
  return true;
}

// Immediately stop whatever is being read (e.g. when the child taps a button).
function ttsStop() {
  if (TTS.supported) window.speechSynthesis.cancel();
}

function ttsToggle() {
  TTS.muted = !TTS.muted;
  localStorage.setItem("sf-tts-muted", TTS.muted ? "1" : "0");
  if (TTS.muted) window.speechSynthesis?.cancel();
  return !TTS.muted;
}

function ttsEnabled() {
  return TTS.supported && !TTS.muted;
}
