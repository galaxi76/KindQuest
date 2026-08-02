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
  exts: [".m4a", ".mp3", ".wav"],
  missing: new Set(),   // keys with no recording at all — don't retry this session
  resolved: new Map(),  // key -> the URL we confirmed exists
  current: null,        // the clip playing right now
};

// Try to play a recorded line.
//   onEnd  – the clip finished playing
//   onFail – there is no recording for this key; the caller should use TTS
function playRecorded(key, onEnd, onFail) {
  if (!key || AUDIO.missing.has(key)) return false;
  if (typeof TTS !== "undefined" && TTS.muted) return false;

  stopRecorded();
  const v = typeof ASSET_V !== "undefined" ? ASSET_V : "";

  // Find which file exists BEFORE playing anything. Probing by attempting
  // playback let a failing element keep running alongside the good one — two
  // overlapping streams, which sounds like an echo chamber.
  const resolveUrl = async () => {
    if (AUDIO.resolved.has(key)) return AUDIO.resolved.get(key);
    for (const ext of AUDIO.exts) {
      const url = `${AUDIO.base}${key}${ext}?v=${v}`;
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (res.ok) { AUDIO.resolved.set(key, url); return url; }
      } catch { /* keep trying the next extension */ }
    }
    return null;
  };

  resolveUrl().then((url) => {
    if (!url) {
      AUDIO.missing.add(key); // no recording for this line — use TTS
      AUDIO.current = null;
      onFail && onFail();
      return;
    }
    stopRecorded(); // in case something started while we were checking
    const el = new Audio(url);
    AUDIO.current = el;
    let settled = false;
    const finish = () => { if (!settled) { settled = true; onEnd && onEnd(); } };
    el.addEventListener("ended", finish);
    el.addEventListener("error", () => { if (!settled) { settled = true; onFail && onFail(); } });
    const attempt = el.play();
    if (attempt && attempt.catch) {
      attempt.catch(() => { if (!settled) { settled = true; onFail && onFail(); } });
    }
  });

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
