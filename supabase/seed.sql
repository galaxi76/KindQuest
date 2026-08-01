-- ──────────────────────────────────────────────────────────────────────────
-- KindQuest — seed data.
--
-- Run this AFTER schema.sql, in the Supabase SQL Editor. It mirrors the
-- built-in data/animals.js so the database and the offline fallback match.
-- Re-running is safe: it upserts (updates existing rows by id).
--
-- Dollar-quoting ($a$...$a$, $j$...$j$) lets us paste text and JSON containing
-- apostrophes without escaping anything.
-- ──────────────────────────────────────────────────────────────────────────

-- ── Clover the goat (the playable MVP) ─────────────────────────────────────
insert into public.animals
  (id, name, species, age, emoji, playable, sort_order,
   personality, rescue_story, likes, dislikes, knowledge,
   comfort_signals, discomfort_signals, hesitant_signals,
   favorite_food, best_friend, fear_of, images)
values (
  'goat', 'Clover', 'goat', '3 years old', '🐐', true, 1,
  $a$friendly and a little mischievous, but gentle — she still likes to be asked first$a$,
  $a$When I was a tiny baby, someone gave me away as a present, far too soon from my mama. But the kind lady who got me soon understood something important: a goat shouldn't grow up alone in a house — we need open space to play and friends of our own kind! So she found a wonderful animal rescuer named Nora, and I stayed safe with Nora and her friendly dogs for a little while. Then I came here, to the sanctuary — my forever home, with sunny meadows and friends who love me. 💚$a$,
  $j$["chin scratches","being brushed softly","crunchy apple slices","racing to be FIRST to the fresh hay and carrots","sunny naps","her best friend, a sheep named Pip"]$j$::jsonb,
  $j$["sudden grabs","having her ears touched","loud noises","being rushed"]$j$::jsonb,
  $j$[
    {"q":["sleep","bed","night","where do you sleep"],"a":["At night I curl up in a cozy barn on a big pile of soft straw, right next to Pip. 🌙","I sleep in the barn with all my friends. Pip snores a tiny bit — but don't tell her I said so! 🤫"]},
    {"q":["weather","rain","cold","winter"],"a":["I don't like cold rainy days — I stay snug in the barn until the sun comes back out. ☔","Sunny days are my favorite! Rain makes my fur all soggy. ☀️"]},
    {"q":["play","games","do for fun","climb"],"a":["I LOVE to climb! There's a big wooden ramp in the meadow and I hop right to the top. 🐐","My favorite game is king of the hill with my goat friends. I usually win — I'm the best climber! 👑","I like zoomies in the meadow — running super fast in circles for no reason at all. Wheee!"]},
    {"q":["sad","cry","lonely before","alone before","mama","mom","mother","miss"],"a":["When I was a baby I was taken away from my mama too soon, and that felt scary. But now I'm safe, and I have so many friends who love me. 💛","Sometimes I think about my mama. When I feel a little sad, Pip sits close to me until I feel better. 💛"]},
    {"q":["friends","brothers","gang","ofir","itai","bechor","musketeers","other goats","goat friends","play with"],"a":["I have three best goat friends here — Ofir, Itai, and little Bechor! We all arrived as babies around the same time and have been inseparable ever since. Everyone calls us the four musketeers. 🐐💚","Everyone calls me, Ofir, Itai and Bechor the four musketeers — we do everything together! 🐐","Bechor is the littlest of my goat friends, and the silliest. He once got his head stuck in the hay feeder! 🤭","Ofir and Itai were born here just two weeks before I arrived — we've been a gang ever since."]},
    {"q":["mischievous","naughty","cheeky","trouble","silly","funny","friendly","nice"],"a":["I'm super friendly, but I'm a little mischievous too! I always try to be the very FIRST one to the fresh hay and crunchy carrots. Hee hee! 🥕🐐","Maya says I'm a cheeky one. When she brings the hay, I always wiggle to the front of the line! 🥕"]},
    {"q":["caretaker","human","who looks after","farmer","vet"],"a":["A kind caretaker named Maya brings me apple slices and checks I'm healthy. She's gentle and always asks before she touches me.","Maya looks after all of us. She talks to me softly and always asks before she pets me — just like you can!"]},
    {"q":["color","look like","fur","spots"],"a":"I have soft cream-colored fur, two little horns, and a fuzzy beard. I think I'm quite handsome! ✨"},
    {"q":["secret","tell me something","special","just between us"],"close":true,"a":["Okay, but just between us friends... I hide the yummiest hay behind the climbing ramp so Bechor can't find it first. 🤫","Since you're my friend, I'll tell you: sometimes at night, Pip and I sneak to the fence to watch the stars. ✨","Promise not to tell? Once I nibbled a hole in Maya's hat, and she still doesn't know it was me! 🤭"]}
  ]$j$::jsonb,
  $a$walks right up and turns her neck and side toward you, relaxed and easy$a$,
  $a$steps back, turns her head away, and flicks her tail$a$,
  $a$turns her head just a little to the side and looks away$a$,
  $a$crunchy apple slices$a$,
  $a$a fluffy sheep named Pip$a$,
  $a$loud, sudden noises$a$,
  $j${"neutral":"images/clover/neutral.jpg","yes":"images/clover/yes.jpg","no":"images/clover/no.jpg","hesitant":"images/clover/hesitant.jpg","happy":"images/clover/happy.jpg","content":"images/clover/content.jpg"}$j$::jsonb
)
on conflict (id) do update set
  name = excluded.name, species = excluded.species, age = excluded.age,
  emoji = excluded.emoji, playable = excluded.playable, sort_order = excluded.sort_order,
  personality = excluded.personality, rescue_story = excluded.rescue_story,
  likes = excluded.likes, dislikes = excluded.dislikes, knowledge = excluded.knowledge,
  comfort_signals = excluded.comfort_signals, discomfort_signals = excluded.discomfort_signals,
  hesitant_signals = excluded.hesitant_signals,
  favorite_food = excluded.favorite_food, best_friend = excluded.best_friend,
  fear_of = excluded.fear_of, images = excluded.images;

-- ── Placeholder friends (shown as "coming soon" tiles) ─────────────────────
insert into public.animals (id, name, species, emoji, playable, sort_order) values
  ('pig',   'Marigold', 'pig',   '🐷', false, 2),
  ('cow',   'Daisy',    'cow',   '🐮', false, 3),
  ('sheep', 'Pip',      'sheep', '🐑', false, 4),
  ('hen',   'Penny',    'hen',   '🐔', false, 5),
  ('duck',  'Waddle',   'duck',  '🦆', false, 6)
on conflict (id) do update set
  name = excluded.name, species = excluded.species, emoji = excluded.emoji,
  playable = excluded.playable, sort_order = excluded.sort_order;
