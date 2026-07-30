// ──────────────────────────────────────────────────────────────────────────
// Animal profiles.
//
// Everything the game knows about an animal lives here. Both the body-language
// reactions AND the question-and-answer mode read from this single object, so
// adding a new playable animal is just a matter of dropping in another profile
// (and, later, swapping `art` for real photos/clips).
// ──────────────────────────────────────────────────────────────────────────

const ANIMALS = {
  goat: {
    id: "goat",
    name: "Clover",
    species: "goat",
    age: "3 years old",
    emoji: "🐐",
    playable: true,

    // A gentle, age-appropriate rescue story.
    rescueStory:
      "When I was a tiny baby, someone gave me away as a present, far too soon " +
      "from my mama. But the kind lady who got me soon understood something " +
      "important: a goat shouldn't grow up alone in a house — we need open space " +
      "to play and friends of our own kind! So she found a wonderful animal " +
      "rescuer named Nora, and I stayed safe with Nora and her friendly dogs for " +
      "a little while. Then I came here, to the sanctuary — my forever home, with " +
      "sunny meadows and friends who love me. 💚",

    personality: "friendly and a little mischievous, but gentle — she still likes to be asked first",

    likes: ["chin scratches", "being brushed softly", "crunchy apple slices", "racing to be FIRST to the fresh hay and carrots", "sunny naps", "her best friend, a sheep named Pip"],
    dislikes: ["sudden grabs", "having her ears touched", "loud noises", "being rushed"],

    // ── EXTRA STORY ────────────────────────────────────────────────────────
    // Add as many facts as you like here. Each entry has:
    //   q : a list of keywords/phrases that should trigger this answer
    //   a : Clover's answer, in her own voice (kept short & kind for kids)
    // The Q&A checks these FIRST, so this is where the rich storyline lives.
    // You can keep adding entries forever without touching any game code.
    knowledge: [
      { q: ["sleep", "bed", "night", "where do you sleep"],
        a: ["At night I curl up in a cozy barn on a big pile of soft straw, right next to Pip. 🌙",
            "I sleep in the barn with all my friends. Pip snores a tiny bit — but don't tell her I said so! 🤫"] },
      { q: ["weather", "rain", "cold", "winter"],
        a: ["I don't like cold rainy days — I stay snug in the barn until the sun comes back out. ☔",
            "Sunny days are my favorite! Rain makes my fur all soggy. ☀️"] },
      { q: ["play", "games", "do for fun", "climb"],
        a: ["I LOVE to climb! There's a big wooden ramp in the meadow and I hop right to the top. 🐐",
            "My favorite game is king of the hill with my goat friends. I usually win — I'm the best climber! 👑",
            "I like zoomies in the meadow — running super fast in circles for no reason at all. Wheee!"] },
      { q: ["sad", "cry", "lonely before", "alone before", "mama", "mom", "mother", "miss"],
        a: ["When I was a baby I was taken away from my mama too soon, and that felt scary. But now I'm safe, and I have so many friends who love me. 💛",
            "Sometimes I think about my mama. When I feel a little sad, Pip sits close to me until I feel better. 💛"] },
      { q: ["friends", "brothers", "gang", "ofir", "itai", "bechor", "musketeers", "other goats", "goat friends", "play with"],
        a: ["I have three best goat friends here — Ofir, Itai, and little Bechor! We all arrived as babies around the same time and have been inseparable ever since. Everyone calls us the four musketeers. 🐐💚",
            "Everyone calls me, Ofir, Itai and Bechor the four musketeers — we do everything together! 🐐",
            "Bechor is the littlest of my goat friends, and the silliest. He once got his head stuck in the hay feeder! 🤭",
            "Ofir and Itai were born here just two weeks before I arrived — we've been a gang ever since."] },
      { q: ["mischievous", "naughty", "cheeky", "trouble", "silly", "funny", "friendly", "nice"],
        a: ["I'm super friendly, but I'm a little mischievous too! I always try to be the very FIRST one to the fresh hay and crunchy carrots. Hee hee! 🥕🐐",
            "Maya says I'm a cheeky one. When she brings the hay, I always wiggle to the front of the line! 🥕"] },
      { q: ["caretaker", "human", "who looks after", "farmer", "vet"],
        a: ["A kind caretaker named Maya brings me apple slices and checks I'm healthy. She's gentle and always asks before she touches me.",
            "Maya looks after all of us. She talks to me softly and always asks before she pets me — just like you can!"] },
      { q: ["color", "look like", "fur", "spots"],
        a: "I have soft cream-colored fur, two little horns, and a fuzzy beard. I think I'm quite handsome! ✨" },
      // Secrets — only shared once you're friends (close: true).
      { q: ["secret", "tell me something", "special", "just between us"],
        close: true,
        a: ["Okay, but just between us friends... I hide the yummiest hay behind the climbing ramp so Bechor can't find it first. 🤫",
            "Since you're my friend, I'll tell you: sometimes at night, Pip and I sneak to the fence to watch the stars. ✨",
            "Promise not to tell? Once I nibbled a hole in Maya's hat, and she still doesn't know it was me! 🤭"] },
    ],

    // What "yes, I'd like that" looks like for Clover.
    comfortSignals: "leans in close, ears soft and floppy, and gives a happy little wag",
    // What "no thank you, I need space" looks like for Clover.
    discomfortSignals: "steps back, turns her head away, and flicks her tail",
    // The SUBTLE version of "not right now" — the cue we want kids to learn
    // to notice, since real animals often signal quietly before clearly.
    hesitantSignals: "turns her head just a little to the side and looks away",

    favoriteFood: "crunchy apple slices",
    bestFriend: "a fluffy sheep named Pip",
    fearOf: "loud, sudden noises",

    // ── PHOTO-REALISTIC ART ────────────────────────────────────────────────
    // Full-scene photos (same meadow/tree/light in every pose). Delete this
    // block to fall back to the built-in illustrated goat.
    // Web-optimised JPEGs; the full-size originals live in images/clover/originals/.
    images: {
      neutral:  "images/clover/neutral.jpg",  // calm, looking at child
      yes:      "images/clover/yes.jpg",      // leaning in, ears perked forward
      no:       "images/clover/no.jpg",       // clear refusal — hiding behind the tree
      hesitant: "images/clover/hesitant.jpg", // SUBTLE refusal — head turned slightly away
      happy:    "images/clover/happy.jpg",    // delighted after a pet
      content:  "images/clover/content.jpg",  // eyes closed, ears drooped, being brushed
    },
  },

  // Placeholder slots so the gameboard can show "coming soon" friends.
  // Copy the goat profile to make any of these playable.
  pig:   { id: "pig",   name: "Marigold", species: "pig",   emoji: "🐷", playable: false },
  cow:   { id: "cow",   name: "Daisy",    species: "cow",   emoji: "🐮", playable: false },
  sheep: { id: "sheep", name: "Pip",      species: "sheep", emoji: "🐑", playable: false },
  hen:   { id: "hen",   name: "Penny",    species: "hen",   emoji: "🐔", playable: false },
  duck:  { id: "duck",  name: "Waddle",   species: "duck",  emoji: "🦆", playable: false },
};
