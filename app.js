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
  let intro, pose = "neutral";
  if (mem.befriended > 0) {
    state.round.progress = 1;
    pose = "happy";
    intro =
      `${a.name} trots straight over — she remembers her friend! ` +
      `Her trust in you carries on. Ask first, then choose kindly.`;
  } else if (memIsReturningVisit(a.id)) {
    intro =
      `${a.name} perks up — she remembers you visiting before! ` +
      `Earn her trust by reading how she feels each time — ask first, then choose kindly.`;
  } else {
    intro =
      `This is ${a.name}. She's ${a.personality}. ` +
      `Earn her trust by reading how she feels each time — ask first, then choose kindly.`;
  }
  setGoat($("#goat-stage"), pose);
  $("#speech").textContent = intro;
  speak(intro);
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
    const spoke = speak(res.line, () => winRound(res.line));
    if (!spoke) setTimeout(() => winRound(res.line), 900);
  } else {
    speak(res.line);
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
  speak(res.line);
}

function winRound(line) {
  const wasFriend = memIsFriend(state.animal.id);
  memRecordBefriended(state.animal.id);
  const panel = $("#win-panel");
  const winText = wasFriend
    ? `You and ${state.animal.name} are closer than ever. She's so happy you came back!`
    : `You read ${state.animal.name}'s feelings beautifully and earned her trust. You're friends now!`;
  $(".win-text", panel).textContent = winText;
  speak(winText);
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
  bubble("goat", `Yay! I'm so happy you adopted me. Ask me anything about myself! 💛`);
  buildSuggestions();
  show("adopt-screen");
  $("#ask-input").value = "";
}

function bubble(who, text) {
  const b = document.createElement("div");
  b.className = "bubble " + who;
  b.textContent = text;
  $("#chat").appendChild(b);
  b.scrollIntoView({ behavior: "smooth", block: "end" });
  if (who === "goat") speak(text); // Clover reads her answers aloud
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

// ── event wiring ──────────────────────────────────────────────────────────────
async function init() {
  // Try the Supabase CMS first; falls back to built-in animals if unconfigured
  // or offline. Either way, ANIMALS is ready before we draw the board.
  await loadAnimalsFromDB();
  buildBoard();

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

  $("#ask-send").addEventListener("click", () => ask());
  $("#ask-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") ask();
  });
}

document.addEventListener("DOMContentLoaded", init);
