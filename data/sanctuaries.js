// ──────────────────────────────────────────────────────────────────────────
// Farm sanctuaries a family can actually visit — the "Parents' Corner" map.
//
// ⚠️ ALL ENTRIES ARE UNVERIFIED (`verified: false`).
// These are real organisations, but coordinates are APPROXIMATE (town/region
// level, not the visitor entrance) and none has been contacted. Before launch,
// for each one: confirm it still operates, that it welcomes visitors, place the
// pin on the actual entrance, and ideally ask permission to be listed.
// Flip `verified: true` as you check them off.
//
// The app is honest about this: unverified entries are shown (useful for
// testers worldwide) with wording that doesn't promise more than we know.
//
// Each entry: { name, country, lat, lng, site, notes?, verified }
// ──────────────────────────────────────────────────────────────────────────

const SANCTUARIES = [
  // ── Middle East ──
  { name: "Freedom Farm Sanctuary", country: "Israel", lat: 32.3600, lng: 34.9200,
    site: "https://www.freedom-farm.org.il/en/", verified: false },

  // ── North America ──
  { name: "Farm Sanctuary — Watkins Glen", country: "USA", lat: 42.3800, lng: -76.8700,
    site: "https://www.farmsanctuary.org", verified: false },
  { name: "Woodstock Farm Sanctuary", country: "USA", lat: 41.9300, lng: -73.9900,
    site: "https://woodstocksanctuary.org", verified: false },
  { name: "Catskill Animal Sanctuary", country: "USA", lat: 41.8400, lng: -74.0500,
    site: "https://casanctuary.org", verified: false },
  { name: "Gentle Barn — California", country: "USA", lat: 34.4200, lng: -118.5600,
    site: "https://www.gentlebarn.org", verified: false },
  { name: "PIGS Animal Sanctuary", country: "USA", lat: 38.6300, lng: -78.6600,
    site: "https://pigs.org", verified: false },
  { name: "The Donkey Sanctuary of Canada", country: "Canada", lat: 43.5500, lng: -80.2500,
    site: "https://www.thedonkeysanctuary.ca", notes: "Guelph, Ontario", verified: false },
  { name: "North Mountain Animal Sanctuary", country: "Canada", lat: 45.1000, lng: -64.4500,
    site: "https://www.northmountainanimalsanctuary.ca", notes: "Nova Scotia", verified: false },

  // ── South America ──
  { name: "Santuario Equidad", country: "Argentina", lat: -30.7800, lng: -64.6400,
    site: "https://www.santuarioequidad.org", notes: "San Marcos Sierra, Córdoba", verified: false },
  { name: "Elephant Sanctuary Brazil", country: "Brazil", lat: -15.4600, lng: -55.7500,
    site: "https://globalelephants.org", notes: "Elephants, not farm animals", verified: false },

  // ── Europe ──
  { name: "Hillside Animal Sanctuary", country: "UK", lat: 52.7300, lng: 1.3200,
    site: "https://www.hillside.org.uk", verified: false },
  { name: "Goodheart Animal Sanctuaries", country: "UK", lat: 52.3300, lng: -2.2500,
    site: "https://goodheartanimalsanctuaries.com", verified: false },
  { name: "Eden Farmed Animal Sanctuary", country: "Ireland", lat: 53.1000, lng: -7.1000,
    site: "https://www.edenfarmedanimalsanctuary.com", verified: false },
  { name: "Land van Morgen", country: "Netherlands", lat: 52.0900, lng: 5.1200,
    site: "https://landvanmorgen.nl", verified: false },
  { name: "De Zonnegloed", country: "Belgium", lat: 50.9000, lng: 2.7500,
    site: "https://www.dezonnegloed.be", notes: "Oostvleteren", verified: false },
  { name: "Hof Butenland", country: "Germany", lat: 53.4700, lng: 8.0500,
    site: "https://www.hof-butenland.de", verified: false },
  { name: "Gut Aiderbichl", country: "Austria", lat: 47.9400, lng: 13.1900,
    site: "https://www.gut-aiderbichl.com", notes: "Henndorf, near Salzburg", verified: false },
  { name: "Hof Narr", country: "Switzerland", lat: 47.3200, lng: 8.7000,
    site: "https://www.hofnarr.ch", verified: false },
  { name: "GroinGroin", country: "France", lat: 47.9500, lng: 0.2000,
    site: "https://www.groingroin.org", notes: "Sarthe", verified: false },
  { name: "Ippoasi", country: "Italy", lat: 43.7200, lng: 10.4000,
    site: "https://www.ippoasi.org", notes: "Near Pisa", verified: false },
  { name: "El Hogar Animal Sanctuary", country: "Spain", lat: 42.3100, lng: 2.3700,
    site: "https://elhogaranimalsanctuary.org", notes: "Girona region", verified: false },

  // ── Africa ──
  { name: "Farm Sanctuary SA", country: "South Africa", lat: -33.9100, lng: 19.1200,
    site: "https://farmsanctuarysa.org", notes: "Franschhoek — home of Pigcasso", verified: false },

  // ── Asia ──
  { name: "Animal Aid Unlimited", country: "India", lat: 24.5800, lng: 73.6800,
    site: "https://animalaidunlimited.org", notes: "Udaipur, Rajasthan", verified: false },

  // ── Oceania ──
  { name: "Edgar's Mission", country: "Australia", lat: -37.2800, lng: 144.7300,
    site: "https://www.edgarsmission.org.au", notes: "Lancefield, Victoria", verified: false },
  { name: "Greener Pastures Sanctuary", country: "Australia", lat: -32.8400, lng: 115.9200,
    site: "https://greenerpasturessanctuary.org", notes: "Waroona, Western Australia", verified: false },
  { name: "Big Ears Animal Sanctuary", country: "Australia", lat: -43.1500, lng: 147.0700,
    site: "https://www.bigearsanimalsanctuary.com.au", notes: "Tasmania", verified: false },
  { name: "Black Sheep Animal Sanctuary", country: "New Zealand", lat: -41.1300, lng: 175.0700,
    site: "https://www.blacksheepanimalsanctuary.org.nz", verified: false },
];

// Great-circle distance in km between two lat/lng points.
function sanctuaryDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Closest sanctuary to a point, with its distance attached.
function nearestSanctuary(lat, lng) {
  return SANCTUARIES
    .map((s) => ({ ...s, km: sanctuaryDistanceKm(lat, lng, s.lat, s.lng) }))
    .sort((a, b) => a.km - b.km)[0];
}
