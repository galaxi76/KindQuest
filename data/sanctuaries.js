// ──────────────────────────────────────────────────────────────────────────
// Farm sanctuaries a family can actually visit — the "Parents' Corner" map.
//
// ⚠️ PROTOTYPE DATA. These are real, well-known sanctuaries, but the
// coordinates are APPROXIMATE and opening details are deliberately omitted.
// Verify every entry (and ideally get the sanctuary's permission) before this
// ships to real families. Add your partner sanctuaries here.
//
// Each entry: { name, country, lat, lng, site }
// ──────────────────────────────────────────────────────────────────────────

const SANCTUARIES = [
  // ── Israel ──
  { name: "Freedom Farm Sanctuary", country: "Israel", lat: 32.3600, lng: 34.9200,
    site: "https://freedomfarm.co.il" },

  // ── United States ──
  { name: "Farm Sanctuary — Watkins Glen", country: "USA", lat: 42.3800, lng: -76.8700,
    site: "https://www.farmsanctuary.org" },
  { name: "Woodstock Farm Sanctuary", country: "USA", lat: 41.9300, lng: -73.9900,
    site: "https://woodstocksanctuary.org" },
  { name: "Catskill Animal Sanctuary", country: "USA", lat: 41.8400, lng: -74.0500,
    site: "https://casanctuary.org" },
  { name: "Gentle Barn — California", country: "USA", lat: 34.4200, lng: -118.5600,
    site: "https://www.gentlebarn.org" },
  { name: "PIGS Animal Sanctuary", country: "USA", lat: 38.6300, lng: -78.6600,
    site: "https://pigs.org" },

  // ── United Kingdom & Europe ──
  { name: "Hillside Animal Sanctuary", country: "UK", lat: 52.7300, lng: 1.3200,
    site: "https://www.hillside.org.uk" },
  { name: "Goodheart Animal Sanctuaries", country: "UK", lat: 52.3300, lng: -2.2500,
    site: "https://goodheartanimalsanctuaries.com" },
  { name: "Land van Morgen", country: "Netherlands", lat: 52.0900, lng: 5.1200,
    site: "https://landvanmorgen.nl" },
  { name: "Hof Butenland", country: "Germany", lat: 53.4700, lng: 8.0500,
    site: "https://www.hof-butenland.de" },
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
