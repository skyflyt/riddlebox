import { el } from "./shared/ui.js";

const CARD_ART = {
  emperor: `
    <svg viewBox="0 0 320 168" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="emperorGlow" cx="50%" cy="100%">
          <stop offset="0%" stop-color="#f4c35b" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#f4c35b" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="320" height="168" fill="url(#emperorGlow)"/>
      <!-- jars -->
      <g transform="translate(70 60)">
        <path d="M0 12c0-6 8-10 28-10s28 4 28 10v60c0 8-14 14-28 14s-28-6-28-14z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.25)" stroke-width="1.6"/>
        <circle cx="18" cy="50" r="4" fill="#f8f3df"/>
        <circle cx="32" cy="58" r="4" fill="#15151d"/>
        <circle cx="44" cy="48" r="4" fill="#f8f3df"/>
        <circle cx="22" cy="64" r="4" fill="#15151d"/>
        <circle cx="38" cy="70" r="4" fill="#f8f3df"/>
      </g>
      <g transform="translate(180 60)">
        <path d="M0 12c0-6 8-10 28-10s28 4 28 10v60c0 8-14 14-28 14s-28-6-28-14z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.25)" stroke-width="1.6"/>
        <circle cx="28" cy="34" r="4" fill="#f8f3df"/>
      </g>
      <!-- crown -->
      <path d="M130 22l8-14 10 14 10-16 12 16 8-14 4 24h-56z" fill="#f4c35b" stroke="#7a4d12" stroke-width="1.4"/>
      <circle cx="145" cy="30" r="2.5" fill="#5b193d"/>
      <circle cx="160" cy="30" r="2.5" fill="#109b96"/>
      <circle cx="175" cy="30" r="2.5" fill="#f8f3df"/>
    </svg>`,
  bulbs: `
    <svg viewBox="0 0 320 168" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="bulbGlow" cx="50%" cy="40%">
          <stop offset="0%" stop-color="#fde68a" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#fde68a" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <g transform="translate(60 30)">
        <circle cx="0" cy="30" r="44" fill="url(#bulbGlow)"/>
        <path d="M-14 14c0-10 6-18 14-18s14 8 14 18-5 14-5 22h-18c0-8-5-12-5-22z" fill="#fde68a" stroke="#a16207" stroke-width="1.4"/>
        <rect x="-7" y="36" width="14" height="10" rx="2" fill="#71717a"/>
        <line x1="-4" y1="40" x2="4" y2="40" stroke="#3f3f46" stroke-width="1.2"/>
      </g>
      <g transform="translate(160 30)">
        <path d="M-14 14c0-10 6-18 14-18s14 8 14 18-5 14-5 22h-18c0-8-5-12-5-22z" fill="#3f3f46" stroke="#a16207" stroke-width="1.4" opacity="0.65"/>
        <rect x="-7" y="36" width="14" height="10" rx="2" fill="#52525b"/>
        <line x1="-4" y1="40" x2="4" y2="40" stroke="#27272a" stroke-width="1.2"/>
      </g>
      <g transform="translate(260 30)">
        <path d="M-14 14c0-10 6-18 14-18s14 8 14 18-5 14-5 22h-18c0-8-5-12-5-22z" fill="#3f3f46" stroke="#a16207" stroke-width="1.4" opacity="0.65"/>
        <rect x="-7" y="36" width="14" height="10" rx="2" fill="#52525b"/>
      </g>
      <!-- switches -->
      <g transform="translate(60 110)">
        <rect x="-16" y="-12" width="32" height="36" rx="4" fill="#1f2937" stroke="#374151" stroke-width="1.2"/>
        <rect x="-6" y="-4" width="12" height="14" rx="2" fill="#f4c35b"/>
      </g>
      <g transform="translate(160 110)">
        <rect x="-16" y="-12" width="32" height="36" rx="4" fill="#1f2937" stroke="#374151" stroke-width="1.2"/>
        <rect x="-6" y="10" width="12" height="14" rx="2" fill="#475569"/>
      </g>
      <g transform="translate(260 110)">
        <rect x="-16" y="-12" width="32" height="36" rx="4" fill="#1f2937" stroke="#374151" stroke-width="1.2"/>
        <rect x="-6" y="10" width="12" height="14" rx="2" fill="#475569"/>
      </g>
    </svg>`,
  monty: `
    <svg viewBox="0 0 320 168" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="curtainGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7f1d1d"/>
          <stop offset="100%" stop-color="#450a0a"/>
        </linearGradient>
      </defs>
      <rect width="320" height="168" fill="url(#curtainGrad)" opacity="0.55"/>
      <g font-family="ui-sans-serif, system-ui, sans-serif" font-weight="700" font-size="32">
        <g transform="translate(50 30)">
          <rect width="60" height="110" rx="4" fill="#1c1917" stroke="#f4c35b" stroke-width="2"/>
          <text x="30" y="68" text-anchor="middle" fill="#f4c35b">1</text>
        </g>
        <g transform="translate(130 30)">
          <rect width="60" height="110" rx="4" fill="#1c1917" stroke="#f4c35b" stroke-width="2"/>
          <text x="30" y="68" text-anchor="middle" fill="#f4c35b">2</text>
        </g>
        <g transform="translate(210 30)">
          <rect width="60" height="110" rx="4" fill="#1c1917" stroke="#f4c35b" stroke-width="2"/>
          <text x="30" y="68" text-anchor="middle" fill="#f4c35b">3</text>
        </g>
      </g>
    </svg>`,
  bridge: `
    <svg viewBox="0 0 320 168" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="bridgeMoon" cx="50%" cy="50%">
          <stop offset="0%" stop-color="#fefce8"/>
          <stop offset="60%" stop-color="#fde68a"/>
          <stop offset="100%" stop-color="#92400e" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="260" cy="38" r="20" fill="url(#bridgeMoon)"/>
      <!-- stars -->
      <circle cx="40" cy="24" r="1.2" fill="#ffffff" opacity="0.7"/>
      <circle cx="90" cy="40" r="1" fill="#ffffff" opacity="0.5"/>
      <circle cx="150" cy="20" r="1.5" fill="#ffffff" opacity="0.6"/>
      <circle cx="200" cy="48" r="1" fill="#ffffff" opacity="0.45"/>
      <circle cx="120" cy="58" r="1" fill="#ffffff" opacity="0.55"/>
      <!-- bridge -->
      <line x1="20" y1="118" x2="300" y2="118" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
      <line x1="20" y1="138" x2="300" y2="138" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <rect x="20" y="120" width="280" height="14" rx="2" fill="#78350f"/>
      <rect x="20" y="120" width="280" height="14" rx="2" fill="url(#bridgePlanks)" opacity="0.6"/>
      <defs>
        <pattern id="bridgePlanks" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#a16207"/>
          <line x1="14" y1="0" x2="14" y2="14" stroke="#451a03" stroke-width="1"/>
        </pattern>
      </defs>
      <!-- people on near side -->
      <g transform="translate(48 92)">
        <circle r="10" fill="#86efac"/>
        <text y="4" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="700" font-size="11" fill="#1a1a2e">1</text>
      </g>
      <g transform="translate(78 92)">
        <circle r="10" fill="#34d399"/>
        <text y="4" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="700" font-size="11" fill="#1a1a2e">2</text>
      </g>
      <!-- torch on bridge -->
      <g transform="translate(180 110)">
        <circle r="9" fill="#fde68a" opacity="0.6"/>
        <circle r="5" fill="#fef08a"/>
      </g>
      <!-- people on far side -->
      <g transform="translate(230 92)">
        <circle r="10" fill="#fde68a"/>
        <text y="4" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="700" font-size="11" fill="#1a1a2e">5</text>
      </g>
      <g transform="translate(262 92)">
        <circle r="10" fill="#fca5a5"/>
        <text y="4" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="700" font-size="11" fill="#1a1a2e">10</text>
      </g>
    </svg>`,
  balls: `
    <svg viewBox="0 0 320 168" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="ballGrad" cx="32%" cy="28%">
          <stop offset="0%" stop-color="#f1f5f9"/>
          <stop offset="60%" stop-color="#94a3b8"/>
          <stop offset="100%" stop-color="#334155"/>
        </radialGradient>
      </defs>
      <!-- post and base -->
      <rect x="156" y="44" width="8" height="80" rx="2" fill="#94a3b8"/>
      <rect x="120" y="120" width="80" height="8" rx="2" fill="#94a3b8"/>
      <!-- beam tilted -->
      <g transform="translate(160 56) rotate(-7)">
        <rect x="-90" y="-3" width="180" height="6" rx="3" fill="#cbd5e1"/>
        <line x1="-72" y1="3" x2="-72" y2="22" stroke="#cbd5e1" stroke-width="1"/>
        <line x1="72" y1="3" x2="72" y2="22" stroke="#cbd5e1" stroke-width="1"/>
      </g>
      <!-- left pan (down) -->
      <g transform="translate(72 100)">
        <path d="M-32 0 Q-28 18 0 18 Q28 18 32 0 Z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.4"/>
        <circle cx="-12" cy="6" r="6" fill="url(#ballGrad)"/>
        <circle cx="2" cy="8" r="6" fill="url(#ballGrad)"/>
        <circle cx="16" cy="6" r="6" fill="url(#ballGrad)"/>
      </g>
      <!-- right pan (up) -->
      <g transform="translate(248 76)">
        <path d="M-32 0 Q-28 18 0 18 Q28 18 32 0 Z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.4"/>
        <circle cx="-12" cy="6" r="6" fill="url(#ballGrad)"/>
        <circle cx="2" cy="8" r="6" fill="url(#ballGrad)"/>
        <circle cx="16" cy="6" r="6" fill="url(#ballGrad)"/>
      </g>
      <!-- 3 extra balls in tray -->
      <g transform="translate(160 152)">
        <circle cx="-14" r="6" fill="url(#ballGrad)"/>
        <circle r="6" fill="url(#ballGrad)"/>
        <circle cx="14" r="6" fill="url(#ballGrad)"/>
      </g>
    </svg>`,
  crossing: `
    <svg viewBox="0 0 320 168" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#0c4a6e" stop-opacity="0.65"/>
        </linearGradient>
      </defs>
      <rect y="60" width="320" height="60" fill="url(#riverGrad)"/>
      <path d="M0 70 Q40 76 80 70 T160 70 T240 70 T320 70" stroke="rgba(255,255,255,0.25)" fill="none" stroke-width="1.4"/>
      <path d="M0 95 Q40 101 80 95 T160 95 T240 95 T320 95" stroke="rgba(255,255,255,0.15)" fill="none" stroke-width="1.4"/>
      <!-- wolf -->
      <g transform="translate(40 38)">
        <circle cx="0" cy="0" r="14" fill="#6b7280"/>
        <polygon points="-10,-12 -6,-4 -2,-12" fill="#6b7280"/>
        <polygon points="10,-12 6,-4 2,-12" fill="#6b7280"/>
        <circle cx="-4" cy="-2" r="2" fill="#1f2937"/>
        <circle cx="4" cy="-2" r="2" fill="#1f2937"/>
      </g>
      <!-- goat -->
      <g transform="translate(95 40)">
        <ellipse cx="0" cy="0" rx="14" ry="11" fill="#e7e5e4"/>
        <path d="M-6 -10 L-3 -16 M6 -10 L3 -16" stroke="#a8a29e" stroke-width="2" stroke-linecap="round"/>
        <circle cx="-4" cy="-2" r="1.8" fill="#1c1917"/>
        <circle cx="4" cy="-2" r="1.8" fill="#1c1917"/>
      </g>
      <!-- cabbage -->
      <g transform="translate(155 42)">
        <circle r="13" fill="#22c55e"/>
        <path d="M-8 -2 Q0 -10 8 -2 M-8 4 Q0 -2 8 4 M-6 8 Q0 4 6 8" stroke="#15803d" fill="none" stroke-width="1.4"/>
      </g>
      <!-- boat -->
      <g transform="translate(220 86)">
        <path d="M-30 0 Q-25 14 -15 14 L15 14 Q25 14 30 0 Z" fill="#a16207" stroke="#78350f" stroke-width="1.4"/>
        <rect x="-2" y="-22" width="4" height="22" fill="#78350f"/>
      </g>
    </svg>`
};

const PLAYABLE_CARD_ART = {
  "water-jugs": { bg: "#0c1b2e", accent: "#67e8f9", accent2: "#60a5fa", glyph: "4L" },
  hanoi: { bg: "#17122a", accent: "#c4b5fd", accent2: "#f4c35b", glyph: "3" },
  "lights-out": { bg: "#1f1d12", accent: "#fef08a", accent2: "#60a5fa", glyph: "X" },
  "eight-puzzle": { bg: "#102033", accent: "#93c5fd", accent2: "#f4c35b", glyph: "8" },
  nim: { bg: "#241909", accent: "#fde68a", accent2: "#f87171", glyph: "21" },
  "river-trio": { bg: "#10251e", accent: "#86efac", accent2: "#38bdf8", glyph: "G/M" },
  "frog-swap": { bg: "#162417", accent: "#86efac", accent2: "#c4b5fd", glyph: "><" },
  "magic-square": { bg: "#25152f", accent: "#f0abfc", accent2: "#93c5fd", glyph: "15" },
  "four-queens": { bg: "#161820", accent: "#fde68a", accent2: "#f8fafc", glyph: "Q" },
  mastermind: { bg: "#101827", accent: "#60a5fa", accent2: "#f87171", glyph: "ooo" }
};

function playableCardArt(theme) {
  const art = PLAYABLE_CARD_ART[theme];
  if (!art) return "";
  return `
    <svg viewBox="0 0 320 168" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="320" height="168" fill="${art.bg}"/>
      <circle cx="250" cy="38" r="72" fill="${art.accent}" opacity="0.12"/>
      <circle cx="72" cy="138" r="90" fill="${art.accent2}" opacity="0.1"/>
      <path d="M24 124 C72 92, 102 148, 150 108 S236 64, 296 94" stroke="${art.accent}" stroke-width="2" fill="none" opacity="0.45"/>
      <path d="M34 42 H286" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <path d="M34 126 H286" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <circle cx="160" cy="84" r="52" fill="rgba(255,255,255,0.06)" stroke="${art.accent}" stroke-width="1.5"/>
      <circle cx="160" cy="84" r="38" fill="${art.accent}" opacity="0.16"/>
      <text x="160" y="99" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="38" font-weight="800" fill="${art.accent}">${art.glyph}</text>
    </svg>`;
}

function difficultyDots(level) {
  const dots = [];
  for (let i = 0; i < 5; i += 1) {
    dots.push(el("span", { class: i < level ? "on" : "" }));
  }
  return el("span", { class: "card-difficulty", "aria-label": `Difficulty ${level} of 5` }, dots);
}

function buildCard(riddle, onSelect) {
  const card = el("button", { class: "riddle-card", type: "button", "aria-label": `Play ${riddle.title}`, onclick: () => onSelect(riddle.id) }, [
    el("div", { class: `card-art ${riddle.theme}`, html: CARD_ART[riddle.theme] || playableCardArt(riddle.theme) }),
    el("div", { class: "card-body" }, [
      el("div", { class: "card-meta" }, [
        el("span", { class: "card-category", text: riddle.category }),
        difficultyDots(riddle.difficulty)
      ]),
      el("h3", { class: "card-title", text: riddle.title }),
      el("p", { class: "card-blurb", text: riddle.blurb })
    ])
  ]);
  return card;
}

export function renderHub(root, riddles, onSelect) {
  const hero = el("div", { class: "hub-hero" }, [
    el("span", { class: "hub-eyebrow", text: "Classic puzzles, made playable" }),
    el("h1", { class: "hub-title", text: "Riddles you can poke at." }),
    el("p", { class: "hub-lede", text: "A small playground of famous logic and probability puzzles — each one set up as a real interactive scene. Read the story, try the trick, then reveal the math." })
  ]);

  const grid = el("div", { class: "hub-grid" }, riddles.map(r => buildCard(r, onSelect)));

  const footnote = el("p", { class: "hub-footnote", html: "Open source. No accounts, no analytics, no servers — every puzzle runs in your browser. <strong>Pick one and start poking.</strong>" });

  root.append(hero, grid, footnote);
}
