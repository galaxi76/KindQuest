# KindQuest — voice recording script

Record these 16 lines, save each as `audio/clover/<filename>.mp3`, and they
replace the robotic browser voice. **Record as many or as few as you like** —
any line without a recording quietly falls back to text-to-speech, so you can
do five today and the rest later.

## How to record

- **Phone voice memo is fine.** Quiet room, phone ~20cm away, off to the side
  (not straight at your mouth — avoids popping on "p" sounds).
- **Voice:** warm, unhurried, like reading a picture book to one child.
  Slightly slower than normal speech. Smile while reading — it's audible.
- **Leave a beat of silence** at the start and end of each clip, then trim it.
- **Export as .mp3**, mono is fine, 128kbps is plenty.
- **Filenames must match exactly** (lowercase, hyphens, `.mp3`).

Two voices work well: yours as a warm narrator, or someone doing Clover
herself. Pick one and stay consistent — the lines mix narration and her voice.

## The lines

### Meeting her

**`intro-first.mp3`** — first time ever meeting Clover
> This is Clover. She's friendly and a little mischievous, but gentle — she still likes to be asked first. Earn her trust by reading how she feels each time — ask first, then choose kindly.

**`intro-return.mp3`** — child has visited before but isn't a friend yet
> Clover perks up — she remembers you visiting before! Earn her trust by reading how she feels each time — ask first, then choose kindly.

**`intro-friend.mp3`** — child already befriended her in an earlier visit
> Clover trots straight over — she remembers her friend! Her trust in you carries on. Ask first, then choose kindly.

### Asking her things

**`ask-yes.mp3`** — she'd like affection
> You ask gently, "May I pet you?" Clover walks right up and turns her neck and side toward you, relaxed and easy. That's how a goat says yes — she'd love a pet or a brush!

**`ask-no.mp3`** — clear no
> You ask gently, "May I pet you?" Clover steps back, turns her head away, and flicks her tail. She turns away — that looks like she needs space right now.

**`ask-hesitant.mp3`** — subtle no (read this one softer, more uncertain)
> You ask gently, "May I pet you?" Clover turns her head just a little to the side and looks away. It's small, but that's still a no for now — she'd like some space.

**`feeling-yes.mp3`**
> Clover looks bright and relaxed right now. She looks like she'd enjoy a pet.

**`feeling-hesitant.mp3`**
> Clover seems a little unsure right now — see how her head is turned away? She might want some space.

### Touching her

**`ask-first.mp3`** — child reached for her without greeting her (kind, not scolding)
> Wait — you haven't said hello yet! Clover doesn't know what you want. Tap "Ask" to check with her first.

**`pet-good.mp3`**
> Clover leans into your hand and gives a happy little wag.

**`brush-good.mp3`**
> Clover closes her eyes and leans into the soft brushing. She loves it!

**`touch-wrong-pet.mp3`** — gentle, never disappointed
> Clover steps back — she isn't ready to be petted right now. That's okay! Try "Ask" or "Give space."

**`touch-wrong-brush.mp3`**
> Clover steps back — she isn't ready to be brushed right now. That's okay! Try "Ask" or "Give space."

### Giving her space

**`space-good.mp3`** — warm; this is the most important lesson in the app
> You gave Clover room to breathe. She settles, and trusts you a little more.

**`space-wrong.mp3`**
> That's gentle of you — but Clover was actually hoping to be petted this time. Try asking how she's feeling!

### Winning and adopting

**`win-first.mp3`** — celebratory
> You read Clover's feelings beautifully and earned her trust. You're friends now!

**`win-again.mp3`**
> You and Clover are closer than ever. She's so happy you came back!

**`adopt-hello.mp3`** — Clover's own voice, delighted
> Yay! I'm so happy you adopted me. Ask me anything about myself!

## Not recorded

Her question answers (backstory, likes, secrets) vary and pick random
variants, so they stay on text-to-speech. If you later want those recorded
too, the fixed ones in `knowledge` could each get a clip.

## When the files are ready

Drop them in `audio/clover/` and ask Claude to check them in — filenames get
verified, and the cache version bumped so browsers pick them up.
