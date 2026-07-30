// ──────────────────────────────────────────────────────────────────────────
// Friendship memory — the animals remember you between visits.
//
// Stored in localStorage ON THIS DEVICE ONLY: no accounts, no servers, no
// child data leaves the browser. Cleared if the browser data is cleared.
//
// Shape: { [animalId]: { visits: n, befriended: n, adopted: true/false } }
//   visits     – how many times the child has started a round with this animal
//   befriended – how many rounds they've completed (0 = not yet friends)
//   adopted    – completed the adoption step at least once
// ──────────────────────────────────────────────────────────────────────────

const MEM_KEY = "sf-friendship";

function memLoad() {
  try {
    return JSON.parse(localStorage.getItem(MEM_KEY)) || {};
  } catch {
    return {};
  }
}

function memSave(all) {
  localStorage.setItem(MEM_KEY, JSON.stringify(all));
}

function memFor(animalId) {
  return memLoad()[animalId] || { visits: 0, befriended: 0, adopted: false };
}

function memUpdate(animalId, patch) {
  const all = memLoad();
  all[animalId] = { ...memFor(animalId), ...patch };
  memSave(all);
  return all[animalId];
}

function memRecordVisit(animalId) {
  return memUpdate(animalId, { visits: memFor(animalId).visits + 1 });
}

function memRecordBefriended(animalId) {
  return memUpdate(animalId, { befriended: memFor(animalId).befriended + 1 });
}

function memRecordAdopted(animalId) {
  return memUpdate(animalId, { adopted: true });
}

// Are they friends already? (completed at least one round together)
function memIsFriend(animalId) {
  return memFor(animalId).befriended > 0;
}
