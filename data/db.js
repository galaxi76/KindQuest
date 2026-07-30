// ──────────────────────────────────────────────────────────────────────────
// Optional Supabase loader for animal content (the "CMS").
//
// If data/supabase-config.js has a url + anonKey, this fetches animals from the
// database and replaces the built-in ANIMALS with them. If the config is empty
// OR the network fails, the app silently keeps the built-in animals from
// data/animals.js — so KindQuest ALWAYS works, even fully offline.
//
// We call Supabase's REST endpoint directly (no extra library / no build step),
// which keeps the app a plain static site.
// ──────────────────────────────────────────────────────────────────────────

async function loadAnimalsFromDB() {
  const cfg = typeof SUPABASE_CONFIG !== "undefined" ? SUPABASE_CONFIG : null;
  if (!cfg || !cfg.url || !cfg.anonKey) {
    return { source: "built-in", ok: false, reason: "no config" };
  }

  try {
    const url = `${cfg.url.replace(/\/$/, "")}/rest/v1/animals?select=*&order=sort_order`;
    // New-style keys (sb_publishable_...) go in `apikey` only; the Bearer
    // header is just for legacy JWT anon keys (which start with "ey").
    const headers = { apikey: cfg.anonKey };
    if (cfg.anonKey.startsWith("ey")) headers.Authorization = `Bearer ${cfg.anonKey}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Supabase responded ${res.status}`);

    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) throw new Error("no rows returned");

    // Keep the built-in artwork as a fallback for rows that don't name any.
    const builtInImages = {};
    Object.values(ANIMALS).forEach((a) => {
      if (a.images) builtInImages[a.id] = a.images;
    });

    // Replace ANIMALS in place so app.js keeps using the same object reference.
    Object.keys(ANIMALS).forEach((k) => delete ANIMALS[k]);
    rows.forEach((r) => {
      const animal = rowToAnimal(r);
      if (!animal.images && builtInImages[r.id]) animal.images = builtInImages[r.id];
      ANIMALS[r.id] = animal;
    });

    console.info(`[db] Loaded ${rows.length} animals from Supabase.`);
    return { source: "supabase", ok: true, count: rows.length };
  } catch (err) {
    // Never break the app: fall back to the built-in animals.
    console.warn("[db] Using built-in animals (Supabase load failed):", err.message);
    return { source: "built-in", ok: false, error: err.message };
  }
}

// Map a database row (snake_case columns) to the profile shape the rest of the
// app expects (camelCase keys used by app.js / brain.js / art.js).
function rowToAnimal(r) {
  const a = {
    id: r.id,
    name: r.name,
    species: r.species,
    age: r.age,
    emoji: r.emoji,
    playable: !!r.playable,
    personality: r.personality,
    rescueStory: r.rescue_story,
    likes: r.likes || [],
    dislikes: r.dislikes || [],
    knowledge: r.knowledge || [],
    comfortSignals: r.comfort_signals,
    discomfortSignals: r.discomfort_signals,
    hesitantSignals: r.hesitant_signals,
    favoriteFood: r.favorite_food,
    bestFriend: r.best_friend,
    fearOf: r.fear_of,
  };
  if (r.images) a.images = r.images; // only present if a designer image set exists
  return a;
}
