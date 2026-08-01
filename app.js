// ──────────────────────────────────────────────────────────────────────────
// App wiring: gameboard → meet & consent game → adopt & ask.
// State is tiny on purpose; the interesting logic lives in data/brain.js.
// ──────────────────────────────────────────────────────────────────────────

const state = {
  animal: null, // current animal profile
  round: null,  // current round (from newRound)
};

// ── tiny helpers ───────────────────────────────────────────────────────────
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function show(screenId) {
  $$(".screen").forEach((s) => s.classList.remove("active"));
  $(`#${screenId}`).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setGoat(stageEl, pose) {
  stageEl.innerHTML = renderPose(state.animal, pose);
}

function setNames(animal) {
  $$(".aname").forEach((el) => (el.textContent = animal.name));
}

// ── Screen 1: gameboard ─────────────────────────────────────────────────────
function buildBoard() {
  const board = $("#board");
  board.innerHTML = "";
  Object.values(ANIMALS).forEach((a) => {
    const tile = document.createElement("button");
    tile.className = "tile " + (a.playable ? "playable" : "locked");
    tile.innerHTML =
      `<span class="face">${a.emoji}</span>` +
      `<span class="tname">${a.name}</span>` +
      (memIsFriend(a.id) ? `<span class="friend-mark" title="You're friends!">💛</span>` : "") +
      (a.playable ? "" : `<span class="lock">soon</span>`);
    if (a.playable) tile.addEventListener("click", () => startPlay(a));
    board.appendChild(tile);
  });
}

// ── Screen 2: meet & consent game ────────────────────────────────────────────
function startPlay(animal) {
  state.animal = animal;
  setNames(animal);
  memRecordVisit(animal.id);
  beginRound();
  show("play-screen");
}

function beginRound() {
  const a = state.animal;
  state.round = newRound(a);
  const mem = memFor(a.id);

  // She remembers you: returning friends get a warmer welcome, and trust
  // carries over — the friendship meter starts with one heart already filled.
  let intro, pose = "neutral", introAudio;
  if (mem.befriended > 0) {
    state.round.progress = 1;
    pose = "happy";
    introAudio = "intro-friend";
    intro =
      `${a.name} trots straight over — she remembers her friend! ` +
      `Her trust in you carries on. Ask first, then choose kindly.`;
  } else if (memIsReturningVisit(a.id)) {
    introAudio = "intro-return";
    intro =
      `${a.name} perks up — she remembers you visiting before! ` +
      `Earn her trust by reading how she feels each time — ask first, then choose kindly.`;
  } else {
    introAudio = "intro-first";
    intro =
      `This is ${a.name}. She's ${a.personality}. ` +
      `Earn her trust by reading how she feels each time — ask first, then choose kindly.`;
  }
  setGoat($("#goat-stage"), pose);
  $("#speech").textContent = intro;
  speak(intro, null, introAudio);
  $("#win-panel").classList.add("hidden");
  $("#ask-panel").classList.add("hidden");
  buildPlayQuestions();
  updateMeter();
  $$(".choice").forEach((b) => (b.disabled = false));
}

// Draw the friendship meter: filled hearts for progress, outlines for what's left.
function updateMeter() {
  const { progress, goal } = state.round;
  let pips = "";
  for (let i = 0; i < goal; i++) {
    const filled = i < progress;
    pips += `<span class="${filled ? "pip-fill" : ""}">${filled ? "💛" : "🤍"}</span>`;
  }
  $("#trust-meter").innerHTML =
    `<span class="meter-label">Friendship</span><span class="meter-hearts">${pips}</span>`;
}

// Tapping "Ask" reveals the question chips; the other choices are actions.
function onChoice(action) {
  const { round, animal } = state;
  if (!round || round.finished) return;

  ttsStop(); // tapping any action interrupts whatever Clover was saying

  if (action === "ask") {
    $("#ask-panel").classList.toggle("hidden");
    return;
  }

  $("#ask-panel").classList.add("hidden");
  const res = resolveChoice(action, round, animal);
  setGoat($("#goat-stage"), res.pose);
  $("#speech").textContent = res.line;
  updateMeter(); // a correct action ('progress'/'pass') just filled a heart

  if (res.outcome === "progress") fxHeart(round.progress - 1);

  if (res.outcome === "pass") {
    fxWin();
    $$(".choice").forEach((b) => (b.disabled = true));
    // Let her FINISH the last line before the win message interrupts her.
    // If the voice is off (or unsupported), fall back to a short pause.
    const spoke = speak(res.line, () => winRound(res.line), res.audio);
    if (!spoke) setTimeout(() => winRound(res.line), 900);
  } else {
    speak(res.line, null, res.audio);
  }
  // 'progress' continues the round at a new beat; 'gentle' keeps the same beat.
}

function buildPlayQuestions() {
  const wrap = $("#play-questions");
  wrap.innerHTML = "";
  playQuestions().forEach((q) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = q.label;
    b.addEventListener("click", () => askDuringPlay(q.kind));
    wrap.appendChild(b);
  });
}

function askDuringPlay(kind) {
  ttsStop();
  const res = resolvePlayQuestion(kind, state.round, state.animal);
  setGoat($("#goat-stage"), res.pose);
  $("#speech").textContent = res.line;
  speak(res.line, null, res.audio);
}

function winRound(line) {
  const wasFriend = memIsFriend(state.animal.id);
  memRecordBefriended(state.animal.id);
  const panel = $("#win-panel");
  const winText = wasFriend
    ? `You and ${state.animal.name} are closer than ever. She's so happy you came back!`
    : `You read ${state.animal.name}'s feelings beautifully and earned her trust. You're friends now!`;
  $(".win-text", panel).textContent = winText;
  speak(winText, null, wasFriend ? "win-again" : "win-first");
  panel.classList.remove("hidden");
  panel.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ── Screen 3: adopt & ask ─────────────────────────────────────────────────────
function adopt() {
  const a = state.animal;
  setNames(a);
  memRecordAdopted(a.id);
  fxAdopt();
  setGoat($("#cert-goat"), "happy");
  $("#chat").innerHTML = "";
  bubble("goat", `Yay! I'm so happy you adopted me. Ask me anything about myself! 💛`, "adopt-hello");
  buildSuggestions();
  show("adopt-screen");
  $("#ask-input").value = "";
}

function bubble(who, text, audioKey) {
  const b = document.createElement("div");
  b.className = "bubble " + who;
  b.textContent = text;
  $("#chat").appendChild(b);
  b.scrollIntoView({ behavior: "smooth", block: "end" });
  // Clover reads her answers aloud. Q&A answers vary too much to pre-record,
  // so these stay on text-to-speech — except her fixed adoption greeting.
  if (who === "goat") speak(text, null, audioKey);
}

function ask(q) {
  const question = (q ?? $("#ask-input").value).trim();
  if (!question) return;
  ttsStop(); // asking something new interrupts her current answer
  bubble("me", question);
  $("#ask-input").value = "";
  // Rules-based (offline & safe). To use Claude instead, swap in askWithLLM().
  const answer = answerQuestion(question, state.animal, {
    closeFriend: memIsFriend(state.animal.id),
  });
  setTimeout(() => bubble("goat", answer), 350);
}

function buildSuggestions() {
  const chips = [
    "Where are you from?",
    "What's your favorite food?",
    "What are you scared of?",
    "What do you love?",
    "Who's your best friend?",
  ];
  // Close friends get to ask for secrets. 🤫
  if (memIsFriend(state.animal.id)) chips.push("Tell me a secret!");
  const wrap = $("#suggestions");
  wrap.innerHTML = "";
  chips.forEach((c) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = c;
    b.addEventListener("click", () => ask(c));
    wrap.appendChild(b);
  });
}

// ── Parents' Corner ───────────────────────────────────────────────────────────
function openParents(open) {
  ttsStop();
  $("#parents-panel").classList.toggle("hidden", !open);
  $("#parents-backdrop").classList.toggle("hidden", !open);
}

// Ask the browser for the family's location (once, never stored), then show the
// closest sanctuary on a map. Falls back gracefully if they decline or it fails.
function findSanctuary() {
  const out = $("#sanctuary-result");
  if (!navigator.geolocation) {
    return showSanctuary(SANCTUARIES[0], null, "Your browser can't share location.");
  }
  out.innerHTML = `<p class="sanctuary-status">Looking for sanctuaries near you…</p>`;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      showSanctuary(nearestSanctuary(latitude, longitude), latitude);
    },
    () => showSanctuary(SANCTUARIES[0], null,
      "No location shared — here's one to explore anyway."),
    { timeout: 8000, maximumAge: 600000 }
  );
}

function showSanctuary(s, gotLocation, note) {
  const km = s.km != null ? Math.round(s.km) : null;
  const distance = km != null ? `${km.toLocaleString()} km away` : s.country;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;

  // Be honest when the nearest one is far. A tester in a country we don't cover
  // yet should see "we're still building this", not a 9,000 km "day out".
  let reach = "";
  if (km != null && km > 500) {
    reach = `<p class="sanctuary-status">
      The closest sanctuary we know of is <strong>${km.toLocaleString()} km</strong> away —
      our map is still growing and may not cover your area yet.
      Know a farm sanctuary near you? We'd love to add it. 💛</p>`;
  } else if (km != null && km <= 150) {
    reach = `<p class="sanctuary-status">Close enough for a day out. 🌿</p>`;
  }

  $("#sanctuary-result").innerHTML = `
    ${note ? `<p class="sanctuary-status">${note}</p>` : ""}
    ${reach}
    <div class="sanctuary-card">
      <h4>${s.name}</h4>
      <p class="sanctuary-meta">${s.country} · ${distance}</p>
      ${s.notes ? `<p class="sanctuary-meta">${s.notes}</p>` : ""}
      ${s.verified ? "" : `<p class="sanctuary-unverified">
        ⓘ We haven't confirmed this listing yet — please check their website
        before travelling.</p>`}
      <a href="${s.site}" target="_blank" rel="noopener noreferrer">Visit their website ↗</a>
      &nbsp;·&nbsp;
      <a href="${directions}" target="_blank" rel="noopener noreferrer">Directions ↗</a>
    </div>
    <div id="sanctuary-map" class="sanctuary-map"></div>
    <p class="sanctuary-legend">
      <span class="pin-dot pin-near"></span> nearest to you
      &nbsp; <span class="pin-dot pin-other"></span> other sanctuaries
      &nbsp;·&nbsp; <button id="show-all-sanctuaries" class="linkish">Show all</button>
    </p>
    <p class="sanctuary-note">
      Sample listing — always check opening times and visiting rules with the
      sanctuary before you travel. Many welcome children by appointment only.
    </p>`;

  drawSanctuaryMap(s);
}

// Interactive Leaflet map (free pan + zoom in AND out). Falls back to a static
// OpenStreetMap embed if Leaflet couldn't load — the panel still works offline.
let sanctuaryMap = null;
function drawSanctuaryMap(s) {
  const host = $("#sanctuary-map");
  if (typeof L === "undefined") {
    const d = 0.06;
    const bbox = [s.lng - d, s.lat - d / 2, s.lng + d, s.lat + d / 2].join("%2C");
    host.outerHTML =
      `<iframe class="sanctuary-map" loading="lazy" title="Map showing ${s.name}"
        src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${s.lat}%2C${s.lng}"></iframe>`;
    return;
  }

  if (sanctuaryMap) sanctuaryMap.remove(); // tear down any previous map
  sanctuaryMap = L.map(host, { scrollWheelZoom: false }).setView([s.lat, s.lng], 11);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    minZoom: 2, // zooming all the way out to the whole world is allowed
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(sanctuaryMap);

  // EVERY sanctuary gets a pin, so zooming out reveals the whole network.
  // The nearest one is marked in green and opened; the rest are soft dots.
  const pins = [];
  SANCTUARIES.forEach((x) => {
    const isNearest = x.name === s.name;
    const popup =
      `<strong>${x.name}</strong><br>${x.country}` +
      (x.site ? `<br><a href="${x.site}" target="_blank" rel="noopener noreferrer">Website ↗</a>` : "");
    const marker = isNearest
      ? L.circleMarker([x.lat, x.lng], {
          radius: 10, color: "#4e9a3f", fillColor: "#6bbf59", fillOpacity: 1, weight: 3,
        })
      : L.circleMarker([x.lat, x.lng], {
          radius: 7, color: "#7c6f5f", fillColor: "#ffce5c", fillOpacity: 0.9, weight: 2,
        });
    marker.addTo(sanctuaryMap).bindPopup(popup);
    if (isNearest) marker.openPopup();
    pins.push([x.lat, x.lng]);
  });

  // "Show all" zooms out to fit every sanctuary in view.
  $("#show-all-sanctuaries")?.addEventListener("click", () => {
    sanctuaryMap.closePopup(); // otherwise the open bubble hides nearby pins
    if (pins.length) sanctuaryMap.fitBounds(pins, { padding: [30, 30] });
  });

  // The panel animates open; nudge Leaflet to re-measure once it's settled.
  setTimeout(() => sanctuaryMap.invalidateSize(), 250);
}

// ── event wiring ──────────────────────────────────────────────────────────────
async function init() {
  // Try the Supabase CMS first; falls back to built-in animals if unconfigured
  // or offline. Either way, ANIMALS is ready before we draw the board.
  await loadAnimalsFromDB();
  buildBoard();
  loadSanctuariesFromDB(); // not awaited — the map isn't needed to start playing

  $$(".choice").forEach((btn) =>
    btn.addEventListener("click", () => onChoice(btn.dataset.action))
  );

  $$("[data-nav='board']").forEach((b) =>
    // Rebuild the board on return so fresh friendship hearts show up.
    b.addEventListener("click", () => { ttsStop(); buildBoard(); show("board-screen"); })
  );

  $("#play-screen").addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "adopt") { ttsStop(); adopt(); }
    if (action === "again") { ttsStop(); beginRound(); }
  });

  const ttsBtn = $("#tts-btn");
  const drawTtsBtn = () => {
    ttsBtn.textContent = ttsEnabled() ? "🔊" : "🔇";
    ttsBtn.setAttribute("aria-label", ttsEnabled() ? "Turn voice off" : "Turn voice on");
  };
  ttsBtn.addEventListener("click", () => { ttsToggle(); drawTtsBtn(); });
  drawTtsBtn();

  $("#parents-btn").addEventListener("click", () => openParents(true));
  $("#parents-close").addEventListener("click", () => openParents(false));
  $("#parents-backdrop").addEventListener("click", () => openParents(false));
  $("#find-sanctuary").addEventListener("click", findSanctuary);

  $("#ask-send").addEventListener("click", () => ask());
  $("#ask-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") ask();
  });
}

document.addEventListener("DOMContentLoaded", init);
