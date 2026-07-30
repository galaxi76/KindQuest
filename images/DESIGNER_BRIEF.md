# Artwork brief — KindQuest

Hand this to your designer. Each playable animal needs **5 images**, one per
emotional state. The game swaps between them to show the child how the animal
feels, so the *emotion must be obvious at a glance* to a 4–8 year old.

## What to deliver (per animal)

For Clover the goat, 5 files:

| File name      | Emotion / pose                          | Body language to show                                  |
|----------------|-----------------------------------------|--------------------------------------------------------|
| `neutral.png`  | Calm, a little unsure                   | Standing, looking toward the viewer, relaxed but still |
| `yes.png`      | "I'd like that" (consent given)         | Leaning IN, ears soft, gentle happy expression         |
| `no.png`       | "I need space" (consent declined)       | Head/body turned AWAY, stepping back, tail flick       |
| `happy.png`    | Delighted after a welcome pet           | Big happy expression, leaning toward viewer            |
| `content.png`  | Relaxed, enjoying a brush               | Eyes closed/soft, peaceful, settled                    |

The contrast between **yes** (leaning in) and **no** (turning away) is the most
important thing in the whole app — make those two read instantly.

## Technical specs

- **Format:** PNG with a **transparent background** (the app places the animal
  on its own meadow/sky background). No baked-in scenery.
- **Style:** warm, friendly, photo-realistic *or* soft illustration — your call,
  but keep all 5 images the same style, same animal, same lighting and angle so
  it looks like one goat changing mood (not 5 different goats).
- **Size:** at least **800 × 800 px**, square-ish canvas, animal centered.
- **Consistency:** same character design across all 5 (same horns, fur color,
  markings) so kids recognize her.
- Keep it gentle — never scary, never showing the animal hurt or distressed.
  "No" should read as *shy / needs space*, not *frightened*.

## Where the files go

Put the 5 files in a folder named after the animal:

```
images/
  clover/
    neutral.png
    yes.png
    no.png
    happy.png
    content.png
```

Then I (or you) uncomment the `images:` block in `data/animals.js` and the game
instantly uses the real artwork instead of the placeholder. No other changes.

## Adding more animals later

Same recipe: a `images/<name>/` folder with the same 5 file names, plus a
profile in `data/animals.js`. That's it.
