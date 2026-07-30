# Sanctuary Friends

A kids' web app (ages ~4–8) that teaches **consent, empathy, and respect for
animals** through interaction with rescued farm-sanctuary animals. The child
meets an animal, reads its body language, asks before touching, and earns its
trust by responding kindly. The transferable lesson: *asking first is kind —
with animals and with people.*

MVP animal: **Clover the goat**.

## How to run

No build step — plain static HTML/CSS/JS.

- **Quickest:** open `index.html` directly in a browser (everything works offline).
- **Local server** (needed if you add the optional Claude-powered Q&A):
  ```
  cd "farm-sanctuary-friends"
  python3 -m http.server 4173
  ```
  Then open http://localhost:4173 (on a phone use the Mac's LAN IP, same Wi-Fi).

## Project structure

```
index.html        3 screens: gameboard → play → adopt/Q&A. Loads the scripts below.
styles.css        All styling. Kid-friendly: big targets, rounded, tap-first.
app.js            UI wiring & game-state machine. Thin — logic lives in data/brain.js.
data/animals.js   Animal PROFILES (story, likes/dislikes, knowledge, images). Content lives here.
data/brain.js     The "brain": consent rules engine + Q&A. No DOM.
data/art.js       Illustrated goat SVG with poses, + renderPose() image-swap point.
images/           Designer artwork goes here. See images/DESIGNER_BRIEF.md.
```

## How the game works (current design)

A **round is a sequence of ~7 "beats"** (`ROUND_GOAL` in `data/brain.js`), shown
as a **friendship meter** of hearts. Each beat the animal wants ONE thing:

- `desire: "affection"` → correct response is **Pet** or **Brush**
- `desire: "space"` → correct response is **Give space**

The child reads the beat (often by tapping **Ask**), responds, and a correct
read fills one heart and the mood re-rolls (`nextBeat`). Fill the meter to
befriend the animal and unlock **adoption + open Q&A**. Wrong reads are *gentle*
— never scary, never punishing — and keep the same beat so the child can fix it.
Crucially, "Give space" is NOT an instant win; befriending requires reading many
beats correctly, so the child both pets AND respects space over a round.

### The four choices

| Choice | Job | Resolves in |
|--------|-----|-------------|
| 💬 **Ask** | *communicate* — reveals question chips; animal answers (body language + words) | `resolvePlayQuestion` |
| 🤚 **Pet** / 🧹 **Brush** | *touch* — good only when she wants affection | `resolveChoice` |
| 🌿 **Give space** | *the respectful action* — good only when she wants space | `resolveChoice` |

`Ask` chips: "May I pet you?" (clear consent signal), "How are you feeling?"
(softer hint), "What do you like?" / "What don't you like?".

## Adding / editing content (no code needed)

- **Richer backstory:** add entries to the `knowledge: [{ q: [keywords], a: "..." }]`
  array in `data/animals.js`. The Q&A checks these FIRST. Grow it freely.
- **Core facts:** edit the standard profile fields (`rescueStory`, `likes`,
  `dislikes`, `favoriteFood`, `bestFriend`, `fearOf`, `comfortSignals`, etc.).
- **Real artwork:** drop 5 PNGs in `images/<name>/` (`neutral`, `yes`, `no`,
  `happy`, `content`) and uncomment the `images:` block in the profile.
  `renderPose()` in `data/art.js` then uses them instead of the built-in SVG.
  Full spec: `images/DESIGNER_BRIEF.md`.
- **New animal:** copy the goat profile in `data/animals.js`, set
  `playable: true`, add its `images/<name>/` folder. The gameboard auto-lists it.

## Supabase (optional CMS)

Animal content can be served from a Supabase database instead of the built-in
`data/animals.js`, so animals/backstories can be edited without code.

- **Schema + seed:** `supabase/schema.sql` (an `animals` table; scalars as
  columns, `likes`/`dislikes`/`knowledge`/`images` as JSONB) and
  `supabase/seed.sql` (mirrors the built-in data). Run both in the Supabase SQL
  Editor once.
- **Config:** paste the Project URL + **anon** key into
  `data/supabase-config.js`. Blank = stays offline on built-in animals.
- **Loader:** `data/db.js` `loadAnimalsFromDB()` fetches via the REST endpoint
  (no library/build step) and replaces `ANIMALS` in place. `init()` in `app.js`
  awaits it before drawing the board. **Any failure falls back to the built-in
  animals**, so the app never breaks offline. Keep `data/animals.js` in sync
  with the DB as the fallback.
- **Keys:** only the public **anon** key goes in the browser (read-only via RLS
  policy "Public can read animals"). Never the service_role key or DB password.
- **Q&A backend (Phase 2, not built yet):** a Supabase Edge Function would hold
  the Anthropic key, read the animal's row, and call Claude with a kid-safe
  system prompt locked to the backstory — replacing `askWithLLM()`'s stub.

## Conventions & gotchas

- **Cache busting:** script/style tags in `index.html` carry `?v=N`. **Bump N**
  on every edit so browsers don't run stale JS. (A symptom of stale JS once was
  "Ask" instantly completing a round — old code didn't know the action.)
- **Safety first (kids' app):** keep all copy warm, simple, short. No failure
  shaming; the animal is never harmed or frightened. "No / needs space" reads as
  *shy*, not *scared*.
- **Q&A is rules-based & offline** by design (predictable + safe). An optional
  Claude-powered version is stubbed as `askWithLLM()` in `data/brain.js`; it
  needs a small backend to hold the API key and locks Claude to the profile facts.
- `app.js` holds tiny state (`state.animal`, `state.round`); all decisions live
  in `data/brain.js` and read only from the animal profile.

## Roadmap / open threads

- Decide whether to ship the Claude-powered Q&A (richer answers) vs. keep the
  rules-based list.
- Real designer artwork for Clover (see brief).
- More playable animals (pig, cow, sheep, hen, duck are placeholder tiles).
- Eventual native mobile packaging (e.g. Capacitor) once the flow is proven —
  build stays responsive web until then.
