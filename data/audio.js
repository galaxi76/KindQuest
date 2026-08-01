// ──────────────────────────────────────────────────────────────────────────
// Recorded voice lines.
//
// If audio/clover/<key>.mp3 exists, we play the recording. If it doesn't (or
// fails to load), we silently fall back to the browser's text-to-speech. So
// you can record lines a few at a time and the app keeps working throughout.
//
// See audio/RECORDING_SCRIPT.md for the list of lines and their filenames.
// ──────────────────────────────────────────────────────────────────────────

const AUDIO = {
  base: "audio/clover/",
  // Tried in order. .m4a is what iPhone Voice Memos exports, so recordings can
  // be dropped in with no conversion; .mp3 and .wav work too.
  exts: [".mp3", ".m4a", ".wav"],
  missing: new Set(), // keys with no recording at all — don't retry this session
  current: null,      // the clip playing right now
};

// Try to play a recorded line.
//   onEnd  – the clip finished playing
//   onFail – there is no recording for this key; the caller should use TTS
function playRecorded(key, onEnd, onFail) {
  if (!key || AUDIO.missing.has(key)) return false;
  if (typeof TTS !== "undefined" && TTS.muted) return false;

  stopRecorded();
  const v = typeof ASSET_V !== "undefined" ? ASSET_V : "";
  let settled = false;

  // Walk the extension list until one loads; if none do, there's no recording.
  const tryExt = (i) => {
    if (i >= AUDIO.exts.length) {
      settled = true;
      AUDIO.missing.add(key); // don't try this key again this session
      AUDIO.current = null;
      onFail && onFail();
      return;
    }
    const el = new Audio(`${AUDIO.base}${key}${AUDIO.exts[i]}?v=${v}`);
    AUDIO.current = el;
    el.addEventListener("ended", () => {
      if (!settled) { settled = true; onEnd && onEnd(); }
    });
    el.addEventListener("error", () => { if (!settled) tryExt(i + 1); });
    const attempt = el.play();
    if (attempt && attempt.catch) attempt.catch(() => { if (!settled) tryExt(i + 1); });
  };

  tryExt(0);
  return true;
}

function stopRecorded() {
  if (AUDIO.current) {
    AUDIO.current.pause();
    AUDIO.current = null;
  }
}

// Has this key already been shown to be missing? (lets speak() skip the wait)
function recordedKnownMissing(key) {
  return !key || AUDIO.missing.has(key);
}
