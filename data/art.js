// ──────────────────────────────────────────────────────────────────────────
// Illustrated goat with distinct body-language poses.
//
// This stands in for photo-realistic photos/clips in the MVP. Each pose is a
// full SVG so the child can clearly "read" how the goat feels:
//
//   neutral  – calm, looking at the child, a little unsure
//   yes      – leans in, ears soft, happy: "I'd like that"
//   no       – turns her head away, steps back: "I need space"
//   happy    – delighted after a welcome pet/brush
//   content  – relaxed, eyes closed, enjoying a brush
//
// To use real media later: keep these pose keys and return an <img>/<video>
// element instead of inline SVG.
// ──────────────────────────────────────────────────────────────────────────

// Pick the right visuals for an animal + pose.
//   • If the animal profile has an `images` map with this pose, use the
//     designer's real picture.
//   • Otherwise fall back to the built-in illustrated goat below.
// This is the ONLY place that decides "SVG vs real art", so swapping a
// designer's images in is just a matter of filling the `images` map in
// data/animals.js — no other code changes.
function renderPose(animal, pose) {
  const src = animal && animal.images && animal.images[pose];
  if (src) {
    return `<img class="animal-photo" src="${src}" alt="${animal.name} the ${animal.species}" />`;
  }
  return goatArt(pose); // built-in placeholder art
}

function goatArt(pose) {
  // Per-pose differences in head turn, ears, eyes, mouth, body lean, tail.
  const P = {
    neutral: { headRot: 0,  bodyX: 0,   ears: "perk",  eyes: "open",   mouth: "neutral", tail: 0,   blush: false, sparkle: false },
    // Ears forward/perked = alert and interested (real goat body language).
    yes:     { headRot: -6, bodyX: 14,  ears: "perk",  eyes: "open",   mouth: "smile",   tail: 18,  blush: true,  sparkle: true  },
    no:      { headRot: 32, bodyX: -16, ears: "back",  eyes: "away",   mouth: "neutral", tail: -8,  blush: false, sparkle: false },
    // Deliberately SUBTLE — a small head turn, not a full turn-away. This is
    // the cue we want children to learn to notice.
    hesitant:{ headRot: 14, bodyX: -4,  ears: "back",  eyes: "away",   mouth: "neutral", tail: 2,   blush: false, sparkle: false },
    happy:   { headRot: -3, bodyX: 6,   ears: "soft",  eyes: "happy",  mouth: "bigsmile",tail: 24,  blush: true,  sparkle: true  },
    content: { headRot: 4,  bodyX: 0,   ears: "soft",  eyes: "closed", mouth: "smile",   tail: 10,  blush: true,  sparkle: false },
  }[pose] || {};

  const earLeft = {
    perk: "M205,150 q-34,-12 -44,18 q22,8 46,2 Z",
    soft: "M205,158 q-36,4 -40,34 q24,2 44,-14 Z",
    back: "M205,150 q-30,-22 -52,-4 q18,16 50,16 Z",
  }[P.ears];

  const earRight = {
    perk: "M268,150 q34,-12 44,18 q-22,8 -46,2 Z",
    soft: "M268,158 q36,4 40,34 q-24,2 -44,-14 Z",
    back: "M268,150 q30,-22 52,-4 q-18,16 -50,16 Z",
  }[P.ears];

  const eyes = {
    open:   `<circle cx="218" cy="196" r="9" fill="#2a2018"/><circle cx="255" cy="196" r="9" fill="#2a2018"/>
             <circle cx="221" cy="193" r="3" fill="#fff"/><circle cx="258" cy="193" r="3" fill="#fff"/>`,
    happy:  `<path d="M209,198 q9,-12 18,0" stroke="#2a2018" stroke-width="5" fill="none" stroke-linecap="round"/>
             <path d="M246,198 q9,-12 18,0" stroke="#2a2018" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    closed: `<path d="M209,197 q9,8 18,0" stroke="#2a2018" stroke-width="5" fill="none" stroke-linecap="round"/>
             <path d="M246,197 q9,8 18,0" stroke="#2a2018" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    away:   `<circle cx="232" cy="196" r="9" fill="#2a2018"/><circle cx="269" cy="196" r="9" fill="#2a2018"/>
             <circle cx="229" cy="193" r="3" fill="#fff"/><circle cx="266" cy="193" r="3" fill="#fff"/>`,
  }[P.eyes];

  const mouth = {
    neutral:  `<path d="M236,236 q6,4 12,0" stroke="#7a5b46" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
    smile:    `<path d="M230,234 q12,12 24,0" stroke="#7a5b46" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
    bigsmile: `<path d="M226,232 q16,18 32,0" stroke="#7a5b46" stroke-width="4" fill="none" stroke-linecap="round"/>
               <path d="M232,238 q10,7 20,0" fill="#e98a8a"/>`,
  }[P.mouth];

  const blush = P.blush
    ? `<ellipse cx="206" cy="218" rx="11" ry="7" fill="#f7b7b7" opacity="0.55"/>
       <ellipse cx="270" cy="218" rx="11" ry="7" fill="#f7b7b7" opacity="0.55"/>`
    : "";

  const sparkle = P.sparkle
    ? `<g fill="#ffe08a"><path d="M330,120 l4,10 10,4 -10,4 -4,10 -4,-10 -10,-4 10,-4 Z"/>
       <path d="M150,150 l3,7 7,3 -7,3 -3,7 -3,-7 -7,-3 7,-3 Z"/></g>`
    : "";

  return `
  <svg viewBox="0 0 480 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Clover the goat">
    <!-- soft ground shadow -->
    <ellipse cx="240" cy="392" rx="120" ry="20" fill="#000" opacity="0.08"/>

    <g transform="translate(${P.bodyX},0)">
      <!-- back legs -->
      <rect x="196" y="320" width="20" height="60" rx="9" fill="#e9e1d6"/>
      <rect x="262" y="320" width="20" height="60" rx="9" fill="#e9e1d6"/>
      <!-- body -->
      <ellipse cx="240" cy="306" rx="96" ry="74" fill="#f3ece1"/>
      <ellipse cx="240" cy="306" rx="96" ry="74" fill="none" stroke="#ddd2c2" stroke-width="2"/>
      <!-- belly patch -->
      <ellipse cx="240" cy="332" rx="64" ry="40" fill="#fbf6ee"/>
      <!-- front legs -->
      <rect x="212" y="332" width="20" height="56" rx="9" fill="#f3ece1"/>
      <rect x="248" y="332" width="20" height="56" rx="9" fill="#f3ece1"/>
      <rect x="212" y="378" width="20" height="12" rx="5" fill="#bfae97"/>
      <rect x="248" y="378" width="20" height="12" rx="5" fill="#bfae97"/>
      <!-- tail -->
      <g transform="rotate(${P.tail} 330 286)">
        <path d="M326,282 q26,-6 22,18 q-14,6 -24,-6 Z" fill="#e9e1d6"/>
      </g>
    </g>

    <!-- head group (turns to show yes/no) -->
    <g transform="rotate(${P.headRot} 240 210)">
      <!-- ears (behind head) -->
      <path d="${earLeft}" fill="#e4d9c8"/>
      <path d="${earRight}" fill="#e4d9c8"/>
      <!-- horns -->
      <path d="M214,150 q-8,-30 4,-40 q8,16 6,40 Z" fill="#cdbfa6"/>
      <path d="M260,150 q8,-30 -4,-40 q-8,16 -6,40 Z" fill="#cdbfa6"/>
      <!-- head -->
      <ellipse cx="237" cy="200" rx="62" ry="58" fill="#f6f0e6"/>
      <!-- snout -->
      <ellipse cx="237" cy="232" rx="34" ry="28" fill="#fbf6ee"/>
      <ellipse cx="226" cy="230" rx="3.4" ry="4.6" fill="#a98c74"/>
      <ellipse cx="248" cy="230" rx="3.4" ry="4.6" fill="#a98c74"/>
      <!-- little beard -->
      <path d="M230,256 q7,18 14,0 q-2,10 -7,12 q-5,-2 -7,-12 Z" fill="#e4d9c8"/>
      ${blush}
      ${eyes}
      ${mouth}
    </g>

    ${sparkle}
  </svg>`;
}
