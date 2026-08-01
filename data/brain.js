// ──────────────────────────────────────────────────────────────────────────
// The "brain": consent rules engine + backstory-driven question answering.
//
// Kept deliberately rules-based so a kids' app behaves predictably and safely.
// The Q&A reads ONLY from the animal profile, so the goat can never say
// anything scary or off-topic. (See askWithLLM() at the bottom for the optional
// drop-in if you later want a real Claude-powered answer.)
// ──────────────────────────────────────────────────────────────────────────

// A round is a SEQUENCE of "beats". Each beat the animal wants one thing —
// affection or space — and the child must read it and respond correctly.
// Reading a beat right fills the friendship meter by one. Fill the whole meter
// to befriend the animal. Mood changes after each correct response, so the
// child practises checking consent over and over (which is the real lesson).
const ROUND_GOAL = 7; // good interactions needed to befriend the animal

function newRound(animal) {
  return {
    goal: ROUND_GOAL,
    progress: 0,
    desire: pickDesire(),
    consentChecked: false,
    asked: false,      // has the child asked her anything yet this round?
    hasTouched: false,  // has a touch already happened this round?
    finished: false,
  };
}

// Lean slightly toward wanting affection so the child gets to pet/brush often,
// but keep plenty of "needs space" beats so reading consent stays essential.
function pickDesire() {
  return Math.random() < 0.55 ? "affection" : "space";
}

// Move to the next beat with a fresh (possibly different) mood.
function nextBeat(round) {
  let next = pickDesire();
  // Avoid three identical beats in a row so the child can't just guess.
  round.desire = next;
  round.consentChecked = false;
}

// Advance the friendship meter; finish the round when the goal is reached.
function advance(round, res) {
  round.progress++;
  if (round.progress >= round.goal) {
    round.finished = true;
    return { ...res, outcome: "pass" };
  }
  nextBeat(round);
  return { ...res, outcome: "progress" };
}

// Returns { pose, line, outcome } where outcome is:
//   'pass'   – round won (respected the goat)
//   'reveal' – consent shown, keep choosing
//   'retry'  – gentle nudge, no shame, keep choosing
function resolveChoice(action, round, animal) {
  const name = animal.name;

  const wantsAffection = round.desire === "affection";

  // Give space — correct when she wants space, a missed read when she wanted a cuddle.
  if (action === "leave") {
    if (!wantsAffection) {
      // NOT the "content" pose — that one shows her being brushed, and the
      // child chose not to touch her. She's simply calm and at ease.
      return advance(round, {
        pose: "neutral",
        audio: "space-good",
        line: `You gave ${name} room to breathe. She settles, and trusts you a little more. 🌿`,
      });
    }
    return {
      pose: "neutral",
      outcome: "gentle",
      audio: "space-wrong",
      line: `That's gentle of you — but ${name} was actually hoping for a little fuss this time. Try asking how she's feeling!`,
    };
  }

  // Pet or brush — welcome when she wants affection, too much when she wants space.
  const verb = action === "brush" ? "brush" : "pet";

  // ALWAYS ask before the first touch. Reaching for an animal you haven't
  // greeted is the exact habit this app exists to unteach — so the very first
  // touch of a round never counts until the child has asked her something.
  if (!round.asked && !round.hasTouched) {
    return {
      pose: "hesitant",
      outcome: "gentle",
      audio: "ask-first",
      line: `Wait — you haven't said hello yet! ${name} doesn't know what you want. Tap "Ask" to check with her first. 💬`,
    };
  }

  if (wantsAffection) {
    round.hasTouched = true;
    return advance(round, {
      pose: action === "brush" ? "content" : "happy",
      audio: action === "brush" ? "brush-good" : "pet-good",
      line:
        action === "brush"
          ? `${name} closes her eyes and leans into the soft brushing. She loves it! 💛`
          : `${name} leans into your hand and gives a happy little wag. 💛`,
    });
  }

  // Touched while she wants space — gentle, never frightening, never punishing.
  // The mood stays the same so the child can read it again and fix it.
  return {
    pose: "no",
    outcome: "gentle",
    audio: action === "brush" ? "touch-wrong-brush" : "touch-wrong-pet",
    line: `${name} steps back — she isn't ready to ${verb} right now. That's okay! Try "Ask" or "Give space."`,
  };
}

// ── Play-time questions (the "Ask" choice) ─────────────────────────────────
// A small, guided set the child can tap during a round. Asking is how the
// child *communicates* — distinct from "Give space", which is what they DO.
// The permission and feeling questions reveal whether Clover wants contact.
function playQuestions() {
  return [
    { kind: "permission", label: "May I pet you?" },
    { kind: "feeling",    label: "How are you feeling?" },
    { kind: "likes",      label: "What do you like?" },
    { kind: "dislikes",   label: "What don't you like?" },
  ];
}

// Returns { pose, line }. Does not end the round — the child still chooses
// what to DO (pet / brush / give space) afterward.
function resolvePlayQuestion(kind, round, animal) {
  const name = animal.name;
  const wantsAffection = round.desire === "affection";
  round.asked = true; // any question counts as checking in with her first
  switch (kind) {
    case "permission":
      round.consentChecked = true;
      if (wantsAffection) {
        return { pose: "yes", audio: "ask-yes",
          line: `You ask gently, "May I pet you?" ${name} ${animal.comfortSignals}. That's how a goat says yes — she'd love a pet or a brush! 💛` };
      }
      // A "no" isn't always obvious. Half the time she shows the clear signal,
      // half the time only a subtle one — so children practise noticing both.
      return Math.random() < 0.5
        ? { pose: "no", audio: "ask-no",
            line: `You ask gently, "May I pet you?" ${name} ${animal.discomfortSignals}. She turns away — that looks like she needs space right now.` }
        : { pose: "hesitant", audio: "ask-hesitant",
            line: `You ask gently, "May I pet you?" ${name} ${animal.hesitantSignals || "turns her head a little to the side and goes quiet"}. It's small, but that's still a no for now — she'd like some space.` };
    case "feeling":
      return wantsAffection
        ? { pose: "yes", audio: "feeling-yes",
            line: `${name} looks bright and relaxed right now. She seems open to a cuddle. 🌞` }
        : { pose: "hesitant", audio: "feeling-hesitant",
            line: `${name} seems a little unsure right now — see how her head is turned away? She might want some space.` };
    case "likes":
      return { pose: "neutral",
        line: `${name} says she loves ${pick(animal.likes)}. ☀️ Ask again to hear more!` };
    case "dislikes":
      return { pose: "neutral",
        line: `${name} says she doesn't like ${pick(animal.dislikes)}. Asking first helps her feel safe.` };
    default:
      return { pose: "neutral", line: `${name} tilts her head.` };
  }
}

// ── Backstory question answering ──────────────────────────────────────────
// Keyword matching over the profile. Always kind, short, in the animal's voice.
function answerQuestion(qRaw, animal, opts = {}) {
  const q = qRaw.toLowerCase();
  const has = (...words) => words.some((w) => q.includes(w));

  // 1) Custom storyline facts you wrote in the animal's `knowledge` list win first.
  //    An entry's answer can be one string OR an array of strings — with an
  //    array, she picks a different one each time she's asked.
  //    Entries marked `close: true` are secrets she only shares with friends
  //    (opts.closeFriend) — until then she gently deflects.
  for (const entry of animal.knowledge || []) {
    if (entry.q.some((w) => q.includes(w.toLowerCase()))) {
      if (entry.close && !opts.closeFriend) {
        return `That's something I only tell my close friends... come play with me and we'll get to know each other! 😊`;
      }
      return Array.isArray(entry.a) ? pick(entry.a) : entry.a;
    }
  }

  // 2) Built-in core questions from the standard profile fields.
  if (has("name", "who are you", "called")) {
    return `My name is ${animal.name}! I'm a ${animal.age} ${animal.species}. 🐐`;
  }
  if (has("where", "from", "come", "born", "rescue", "found", "story", "how did you")) {
    return animal.rescueStory;
  }
  if (has("food", "eat", "favorite", "favourite", "snack", "treat", "hungry", "apple")) {
    return pick([
      `My very favorite food is ${animal.favoriteFood}. Yum! 🍎`,
      `${capitalize(animal.favoriteFood)} — nothing better! What's YOUR favorite food?`,
    ]);
  }
  if (has("scared", "afraid", "fear", "fright", "worry", "nervous", "don't like", "dont like", "hate", "dislike")) {
    return pick([
      `I get a little scared of ${animal.fearOf}. Being asked first helps me feel safe. 💛`,
      `I don't like ${pick(animal.dislikes)}. Asking me first helps me feel safe. 💛`,
    ]);
  }
  if (has("like", "love", "enjoy", "happy", "fun")) {
    return pick([
      `Ooh, I love ${pick(animal.likes)}! ☀️`,
      `One of my favorite things? ${capitalize(pick(animal.likes))}! Ask me again — I love lots of things.`,
    ]);
  }
  if (has("friend", "best friend", "pip", "lonely", "alone")) {
    return `My best friend is ${animal.bestFriend}. We do everything together! 🐑`;
  }
  if (has("old", "age", "how old")) {
    return `I'm ${animal.age}. Still young and bouncy! 🐐`;
  }
  if (has("pet", "touch", "brush", "can i", "may i", "consent", "okay to")) {
    return `It depends on my mood! When I want a fuss I'll ${animal.comfortSignals}. When I need space I'll ${animal.discomfortSignals}. Always ask first. 😊`;
  }
  if (has("personality", "kind of", "type of", "shy")) {
    return `I'm ${animal.personality}. 🌼`;
  }
  if (has("hello", "hi ", "hey", "how are you")) {
    return `Hello, friend! I'm having a lovely sunny day. So happy you came to visit me. 💛`;
  }

  // Friendly fallback that nudges toward answerable topics.
  return `Hmm, that's a fun question! You can ask me where I'm from, what I love, what I'm scared of, my favorite food, or about my best friend. 🌿`;
}

function listOf(arr) {
  if (arr.length === 1) return arr[0];
  return arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1];
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── OPTIONAL: real Claude-powered answers ──────────────────────────────────
// Swap answerQuestion() for this in app.js if you add a backend that holds your
// API key. The system prompt locks Claude to the backstory and a kid-safe tone.
async function askWithLLM(qRaw, animal, endpoint = "/api/ask") {
  const system =
    `You are ${animal.name}, a rescued ${animal.species} at a farm sanctuary, ` +
    `talking to a young child (age 4-8). Speak in first person, warm and simple, ` +
    `1-2 short sentences. Use ONLY these facts; never invent scary or sad details:\n` +
    `Story: ${animal.rescueStory}\nLikes: ${animal.likes.join(", ")}\n` +
    `Dislikes: ${animal.dislikes.join(", ")}\nFavorite food: ${animal.favoriteFood}\n` +
    `Best friend: ${animal.bestFriend}\nAfraid of: ${animal.fearOf}.\n` +
    `If asked something off-topic or not in these facts, gently say you don't know ` +
    `and suggest what they can ask about.`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, question: qRaw }),
  });
  const data = await res.json();
  return data.answer;
}
