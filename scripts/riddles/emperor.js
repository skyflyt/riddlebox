import { el, clear, toast, flashScreen } from "../shared/ui.js";
import { centerOf } from "../shared/fx.js";

const TOTAL_WHITE = 50;
const TOTAL_BLACK = 50;
const MAX_CHANCE = 0.5 + 0.5 * (49 / 99);
const HISTORY_LIMIT = 6;

function chanceFor(wA, bA) {
  const wB = TOTAL_WHITE - wA;
  const bB = TOTAL_BLACK - bA;
  const tA = wA + bA;
  const tB = wB + bB;
  if (tA === 0 || tB === 0) return 0;
  return 0.5 * (wA / tA) + 0.5 * (wB / tB);
}

function fmtPct(v) { return `${(v * 100).toFixed(2)}%`; }

function clampSplit(nw, nb) {
  let w = Math.max(0, Math.min(TOTAL_WHITE, Math.round(Number(nw) || 0)));
  let b = Math.max(0, Math.min(TOTAL_BLACK, Math.round(Number(nb) || 0)));
  if (w + b === 0) w = 1;
  if ((TOTAL_WHITE - w) + (TOTAL_BLACK - b) === 0) {
    if (b > 0) b -= 1; else w -= 1;
  }
  return { w, b };
}

function seeded(seed) {
  let t = seed + 0x6D2B79F5;
  return () => {
    t |= 0;
    t = (t + 0x6D2B79F5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function renderMarbles(container, white, black, key) {
  const total = white + black;
  const frag = document.createDocumentFragment();
  const kinds = [];
  for (let i = 0; i < white; i += 1) kinds.push("white");
  for (let i = 0; i < black; i += 1) kinds.push("black");

  kinds.forEach((kind, i) => {
    const rng = seeded(key * 991 + i * 73 + total * 17 + (kind === "white" ? 13 : 29));
    const cols = total > 30 ? 10 : 7;
    const row = Math.floor(i / cols);
    const col = i % cols;
    const xStep = cols > 1 ? 100 / cols : 50;
    const x = xStep / 2 + col * xStep + (rng() - 0.5) * (xStep * 0.5);
    const y = 90 - row * 7 - rng() * 4;
    const m = document.createElement("span");
    m.className = `marble ${kind}`;
    m.style.setProperty("--x", `${Math.max(8, Math.min(92, x))}%`);
    m.style.setProperty("--y", `${Math.max(14, Math.min(92, y))}%`);
    m.style.setProperty("--s", `${10 + rng() * 6}px`);
    m.style.setProperty("--delay", `${-rng() * 2400}ms`);
    frag.appendChild(m);
  });

  container.replaceChildren(frag);
}

function emperorSvg() {
  return `
  <svg viewBox="0 0 260 280" role="img" aria-label="The emperor">
    <path d="M43 268c9-70 42-105 88-105s79 35 86 105H43z" fill="#5b193d"/>
    <path d="M70 268c9-48 30-75 61-75 33 0 54 27 62 75H70z" fill="#29172b" stroke="#f4c35b" stroke-width="4"/>
    <path d="M105 158h52v36c-10 10-37 10-52 0v-36z" fill="#d49d78"/>
    <ellipse cx="131" cy="112" rx="63" ry="70" fill="#e6b184"/>
    <path d="M76 125c8 47 30 81 55 81 26 0 48-35 56-81-18 23-37 32-56 32s-38-9-55-32z" fill="#f2eadb" stroke="#b9aa8d" stroke-width="2"/>
    <path d="M70 94c11-45 35-66 64-66 32 0 55 24 61 66-16-20-37-29-63-29-25 0-46 9-62 29z" fill="#2b2030"/>
    <path d="M61 54l27-40 28 38 24-45 30 45 26-38 20 75H42l19-35z" fill="#f4c35b" stroke="#7a4d12" stroke-width="4"/>
    <path d="M49 78h164v28H49z" fill="#a86d1e"/>
    <circle cx="89" cy="84" r="8" fill="#109b96"/>
    <circle cx="130" cy="84" r="8" fill="#e65c73"/>
    <circle cx="171" cy="84" r="8" fill="#fffaf0"/>
    <circle cx="108" cy="113" r="5" fill="#1a1317"/>
    <circle cx="154" cy="113" r="5" fill="#1a1317"/>
    <path d="M92 100c10-8 20-9 31-3" stroke="#2d1a1f" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M139 97c12-5 23-4 32 4" stroke="#2d1a1f" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M132 116c-7 18-5 25 7 28" stroke="#2d1a1f" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M110 156c16 10 34 10 50 0" stroke="#2d1a1f" stroke-width="4" fill="none" stroke-linecap="round"/>
  </svg>`;
}

export function mount(root, { fx }) {
  const state = { wA: 25, bA: 25 };
  const stats = { draws: 0, wins: 0, history: [], best: chanceFor(25, 25), bestToast: false, busy: false };

  // Build DOM
  const head = el("div", { class: "scene-head" }, [
    el("span", { class: "scene-eyebrow", text: "Probability · The Emperor's Proposition" }),
    el("h1", { class: "scene-title", text: "Split the marbles. Bet your life." }),
    el("p", { class: "scene-lede", text: "You stand before the emperor with 50 white and 50 black marbles and two empty jars. Place every marble. He'll close his eyes, pick a jar at random, and draw one marble. White: you walk free. Black: you don't." })
  ]);

  const grid = el("div", { class: "scene-grid" });

  // ─── LEFT: Stage ───
  const court = el("div", { class: "emperor-court" });
  const figure = el("div", { class: "emperor-figure", html: emperorSvg() });
  const jarA = el("div", { class: "jar-card", "data-jar": "A" }, [
    el("div", { class: "jar-head" }, [
      el("div", { class: "jar-label" }, [
        el("span", { class: "jar-letter", text: "Jar A" }),
        el("span", { class: "jar-count", "data-jar-count": "A", text: "25 + 25" })
      ]),
      el("span", { class: "jar-odds", "data-jar-odds": "A", text: "50.00%" })
    ]),
    el("div", { class: "jar-glass" }, [el("div", { class: "marbles", "data-marbles": "A" })])
  ]);
  const jarB = el("div", { class: "jar-card", "data-jar": "B" }, [
    el("div", { class: "jar-head" }, [
      el("div", { class: "jar-label" }, [
        el("span", { class: "jar-letter", text: "Jar B" }),
        el("span", { class: "jar-count", "data-jar-count": "B", text: "25 + 25" })
      ]),
      el("span", { class: "jar-odds", "data-jar-odds": "B", text: "50.00%" })
    ]),
    el("div", { class: "jar-glass" }, [el("div", { class: "marbles", "data-marbles": "B" })])
  ]);
  const jars = el("div", { class: "jars" }, [jarA, jarB]);
  const verdict = el("div", { class: "verdict", text: "Set the split. Then ask the emperor to draw." });
  court.append(figure, jars, verdict);

  // ─── RIGHT: Controls ───
  const controls = el("div", {});

  const story = el("section", { class: "panel" }, [
    el("h2", { class: "panel-title", text: "How it works" }),
    el("ol", { class: "story-steps" }, [
      el("li", { html: "<strong>Place every marble.</strong> 50 white and 50 black, split between two jars however you want." }),
      el("li", { html: "<strong>Neither jar may be empty.</strong> Even a single marble counts." }),
      el("li", { html: "<strong>The emperor picks a jar at random</strong>, then pulls one marble. White means freedom." })
    ])
  ]);

  const oddsPanel = el("section", { class: "panel" }, [
    el("div", { class: "panel-row" }, [
      el("h2", { class: "panel-title", text: "Your odds" }),
      el("span", { class: "pill", id: "rank-pill", text: "Fair coin" })
    ]),
    el("div", { class: "odds-readout" }, [
      el("div", { class: "odds-value", id: "odds-value", text: "50.00%" }),
      el("div", { class: "odds-meter" }, [
        el("span", { id: "odds-fill" }),
        el("i", { class: "odds-marker fifty", title: "50% baseline" }),
        el("i", { class: "odds-marker cap", title: "74.747% ceiling" })
      ])
    ]),
    el("p", { class: "card-blurb", id: "rank-note", style: { marginTop: "10px" }, text: "Start by sliding the split." })
  ]);

  function sliderRow(kind, max, valueId, label) {
    return el("div", { class: "slider-row" }, [
      el("div", { class: "row-head" }, [
        el("span", { text: label }),
        el("span", { class: "value", id: valueId, text: "25" })
      ]),
      el("div", { class: "stepper" }, [
        el("button", { type: "button", "data-step": `${kind}:-1`, "aria-label": `Move one ${kind} from Jar A` }, ["−"]),
        el("input", { id: `${kind}-slider`, type: "range", min: "0", max: String(max), value: "25" }),
        el("button", { type: "button", "data-step": `${kind}:1`, "aria-label": `Move one ${kind} to Jar A` }, ["+"])
      ])
    ]);
  }

  const splitPanel = el("section", { class: "panel" }, [
    el("h2", { class: "panel-title", text: "Jar A holds…" }),
    sliderRow("white", TOTAL_WHITE, "white-value", "White marbles"),
    sliderRow("black", TOTAL_BLACK, "black-value", "Black marbles")
  ]);

  const actions = el("section", { class: "panel" }, [
    el("button", { class: "btn primary", id: "draw-btn", style: { width: "100%" } }, ["Let the emperor draw"]),
    el("div", { class: "btn-group", style: { marginTop: "10px" } }, [
      el("button", { class: "btn ghost", id: "best-btn" }, ["Show the trick"]),
      el("button", { class: "btn ghost", id: "sim-btn" }, ["Run 1,000 draws"]),
      el("button", { class: "btn ghost", id: "reset-btn" }, ["Reset"])
    ])
  ]);

  const historyPanel = el("section", { class: "panel" }, [
    el("div", { class: "panel-row" }, [
      el("h2", { class: "panel-title", text: "Recent draws" }),
      el("span", { id: "streak", class: "pill", text: "—" })
    ]),
    el("ul", { class: "history", id: "history" })
  ]);

  const solution = el("section", { class: "solution", id: "solution", hidden: true }, [
    el("h2", { class: "solution-title", text: "The trick" }),
    el("p", { html: "Put <strong>1 white marble</strong> in Jar A and the rest — <strong>49 white + 50 black</strong> — in Jar B." }),
    el("p", { html: "Half the time the emperor picks Jar A: guaranteed white. Half the time he picks Jar B: 49/99 white. Total: <code>0.5 × 1 + 0.5 × (49/99) ≈ 74.747%</code>." }),
    el("p", { class: "card-blurb", text: "You can't beat that. Any other split either dilutes the lone-white jar or thickens the other one with black." })
  ]);

  controls.append(story, oddsPanel, splitPanel, actions, historyPanel);

  grid.append(court, controls);
  root.append(head, grid, solution);

  // ─── Refs ───
  const refs = {
    marblesA: court.querySelector('[data-marbles="A"]'),
    marblesB: court.querySelector('[data-marbles="B"]'),
    countA: court.querySelector('[data-jar-count="A"]'),
    countB: court.querySelector('[data-jar-count="B"]'),
    oddsA: court.querySelector('[data-jar-odds="A"]'),
    oddsB: court.querySelector('[data-jar-odds="B"]'),
    figure,
    jarA, jarB,
    verdict,
    oddsValue: oddsPanel.querySelector("#odds-value"),
    oddsFill: oddsPanel.querySelector("#odds-fill"),
    rankPill: oddsPanel.querySelector("#rank-pill"),
    rankNote: oddsPanel.querySelector("#rank-note"),
    whiteSlider: splitPanel.querySelector("#white-slider"),
    blackSlider: splitPanel.querySelector("#black-slider"),
    whiteValue: splitPanel.querySelector("#white-value"),
    blackValue: splitPanel.querySelector("#black-value"),
    drawBtn: actions.querySelector("#draw-btn"),
    bestBtn: actions.querySelector("#best-btn"),
    simBtn: actions.querySelector("#sim-btn"),
    resetBtn: actions.querySelector("#reset-btn"),
    history: historyPanel.querySelector("#history"),
    streak: historyPanel.querySelector("#streak"),
    solution
  };

  function rankFor(c) {
    if (c >= MAX_CHANCE - 1e-7) return ["good", "Crown split", "This is the ceiling. The emperor is furious."];
    if (c >= 0.72) return ["good", "Almost there", "You're seconds from the famous trick."];
    if (c >= 0.66) return ["info", "Loaded", "Strong edge. One smaller jar can still tip more."];
    if (c >= 0.56) return ["info", "Tilted", "Better than fair, not yet impressive."];
    if (c > 0.5001) return ["info", "Hairline edge", "Technically winning. Spiritually suspicious."];
    if (c < 0.4999) return ["bad", "Cursed split", "You're helping the black marbles. Bold choice."];
    return ["", "Fair coin", "Start sliding. Asymmetry is your friend."];
  }

  function setSplit(nw, nb, sparkle = true) {
    const { w, b } = clampSplit(nw, nb);
    state.wA = w;
    state.bA = b;
    render();
    if (sparkle) {
      const c = chanceFor(state.wA, state.bA);
      const rect = refs.oddsValue.getBoundingClientRect();
      const palette = c > 0.7 ? ["#f4c35b", "#fffaf0", "#4ade80"] : ["#94a3b8", "#f4c35b"];
      fx.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, palette, c > 0.7 ? 22 : 8, 4);
    }
  }

  function render() {
    const wB = TOTAL_WHITE - state.wA;
    const bB = TOTAL_BLACK - state.bA;
    const tA = state.wA + state.bA;
    const tB = wB + bB;
    const chance = chanceFor(state.wA, state.bA);
    const oddsA = tA > 0 ? state.wA / tA : 0;
    const oddsB = tB > 0 ? wB / tB : 0;

    refs.countA.textContent = `${state.wA} white · ${state.bA} black (${tA})`;
    refs.countB.textContent = `${wB} white · ${bB} black (${tB})`;
    refs.oddsA.textContent = `${(oddsA * 100).toFixed(1)}%`;
    refs.oddsB.textContent = `${(oddsB * 100).toFixed(1)}%`;
    refs.oddsValue.textContent = fmtPct(chance);
    refs.oddsFill.style.setProperty("--chance", `${chance * 100}%`);
    refs.oddsFill.style.width = `${chance * 100}%`;
    refs.whiteValue.textContent = state.wA;
    refs.blackValue.textContent = state.bA;
    refs.whiteSlider.value = String(state.wA);
    refs.blackSlider.value = String(state.bA);

    const [pillKind, title, note] = rankFor(chance);
    refs.rankPill.className = `pill ${pillKind}`;
    refs.rankPill.textContent = title;
    refs.rankNote.textContent = note;

    if (chance > stats.best) stats.best = chance;

    if (chance >= MAX_CHANCE - 1e-7 && !stats.bestToast) {
      stats.bestToast = true;
      toast("Crown split found: 1 white in Jar A, everything else in Jar B.");
      const r = refs.oddsValue.getBoundingClientRect();
      fx.burst(r.left + r.width / 2, r.top + r.height / 2, ["#f4c35b", "#fffaf0", "#4ade80", "#60a5fa"], 110, 12);
      flashScreen();
    }

    renderMarbles(refs.marblesA, state.wA, state.bA, 1);
    renderMarbles(refs.marblesB, wB, bB, 2);
    renderHistory();
  }

  function renderHistory() {
    const frag = document.createDocumentFragment();
    if (!stats.history.length) {
      const li = document.createElement("li");
      li.style.color = "var(--dim)";
      li.style.fontStyle = "italic";
      li.style.gridTemplateColumns = "1fr";
      li.style.textAlign = "center";
      li.textContent = "No draws yet";
      frag.appendChild(li);
    } else {
      stats.history.forEach(item => {
        const li = document.createElement("li");
        li.className = item.white ? "win" : "lose";
        const dot = document.createElement("span");
        dot.className = `mini-marble ${item.white ? "white" : "black"}`;
        const text = document.createElement("span");
        text.textContent = item.batch ? item.label : `Jar ${item.jar} → ${item.white ? "white" : "black"}`;
        const tag = document.createElement("strong");
        tag.style.color = item.white ? "#86efac" : "#fecaca";
        tag.textContent = item.batch ? "burst" : (item.white ? "free" : "lost");
        li.append(dot, text, tag);
        frag.appendChild(li);
      });
    }
    refs.history.replaceChildren(frag);

    if (stats.draws === 0) {
      refs.streak.textContent = "—";
    } else {
      refs.streak.textContent = `${stats.wins}/${stats.draws} wins · ${fmtPct(stats.wins / stats.draws)}`;
    }
  }

  function setBusy(b) {
    stats.busy = b;
    refs.drawBtn.disabled = b;
    refs.bestBtn.disabled = b;
    refs.simBtn.disabled = b;
    refs.resetBtn.disabled = b;
    splitPanel.querySelectorAll("[data-step]").forEach(btn => { btn.disabled = b; });
  }

  function wait(ms) { return new Promise(res => setTimeout(res, ms)); }

  async function flyMarble(from, to, kind) {
    if (fx.reduced) return;
    const m = document.createElement("span");
    m.className = `flying-marble ${kind}`;
    m.style.left = `${from.x - 15}px`;
    m.style.top = `${from.y - 15}px`;
    document.body.appendChild(m);
    const arc = -120 - Math.random() * 60;
    const anim = m.animate([
      { transform: "translate(0,0) scale(1)" },
      { transform: `translate(${(to.x - from.x) * 0.5}px, ${arc}px) scale(1.5)` },
      { transform: `translate(${to.x - from.x}px, ${to.y - from.y}px) scale(1)` }
    ], { duration: 800, easing: "cubic-bezier(.17,.84,.26,1)" });
    try { await anim.finished; } catch {}
    m.remove();
  }

  function sampleDraw() {
    const wB = TOTAL_WHITE - state.wA;
    const bB = TOTAL_BLACK - state.bA;
    const jar = Math.random() < 0.5 ? "A" : "B";
    const wCount = jar === "A" ? state.wA : wB;
    const bCount = jar === "A" ? state.bA : bB;
    const total = wCount + bCount;
    return { jar, white: total > 0 && Math.random() < wCount / total };
  }

  async function drawOne() {
    if (stats.busy) return;
    setBusy(true);
    const result = sampleDraw();
    const station = result.jar === "A" ? refs.jarA : refs.jarB;
    const from = centerOf(station);
    const to = centerOf(refs.verdict);
    refs.verdict.className = "verdict";
    refs.verdict.textContent = `The emperor reaches into Jar ${result.jar}...`;
    station.classList.add("chosen");
    refs.figure.classList.add("commanding");
    fx.burst(from.x, from.y, ["#f4c35b", "#fffaf0"], 14, 4);
    await wait(fx.reduced ? 40 : 520);
    await flyMarble(from, to, result.white ? "white" : "black");

    stats.draws += 1;
    if (result.white) stats.wins += 1;
    stats.history.unshift(result);
    stats.history = stats.history.slice(0, HISTORY_LIMIT);

    if (result.white) {
      refs.verdict.className = "verdict win";
      refs.verdict.textContent = `Jar ${result.jar} gives WHITE. You go free.`;
      fx.confetti(to.x, to.y, ["#f4c35b", "#fffaf0", "#4ade80", "#60a5fa"], 90);
      flashScreen();
    } else {
      refs.verdict.className = "verdict lose";
      refs.verdict.textContent = `Jar ${result.jar} gives BLACK. The court goes silent.`;
      fx.burst(to.x, to.y, ["#5b193d", "#15151d", "#e65c73"], 36, 6);
    }

    renderHistory();
    await wait(220);
    station.classList.remove("chosen");
    refs.figure.classList.remove("commanding");
    setBusy(false);
  }

  function simulate(rounds = 1000) {
    if (stats.busy) return;
    let wins = 0;
    for (let i = 0; i < rounds; i += 1) {
      const r = sampleDraw();
      if (r.white) wins += 1;
    }
    stats.draws += rounds;
    stats.wins += wins;
    stats.history.unshift({ batch: true, white: wins / rounds > 0.5, label: `${rounds} draws · ${wins} white (${fmtPct(wins / rounds)})` });
    stats.history = stats.history.slice(0, HISTORY_LIMIT);
    refs.verdict.className = "verdict";
    refs.verdict.textContent = `${rounds} simulated draws: ${wins} white (${fmtPct(wins / rounds)}).`;
    const r = centerOf(refs.verdict);
    fx.burst(r.x, r.y, ["#f4c35b", "#60a5fa", "#4ade80"], 80, 9);
    renderHistory();
  }

  // ─── Wire ───
  refs.whiteSlider.addEventListener("input", e => setSplit(e.target.value, state.bA, false));
  refs.blackSlider.addEventListener("input", e => setSplit(state.wA, e.target.value, false));
  splitPanel.querySelectorAll("[data-step]").forEach(btn => {
    btn.addEventListener("click", () => {
      const [kind, amount] = btn.dataset.step.split(":");
      const n = Number(amount);
      if (kind === "white") setSplit(state.wA + n, state.bA);
      else setSplit(state.wA, state.bA + n);
    });
  });
  refs.drawBtn.addEventListener("click", drawOne);
  refs.bestBtn.addEventListener("click", () => {
    setSplit(1, 0);
    refs.solution.hidden = false;
    refs.solution.scrollIntoView({ behavior: "smooth", block: "nearest" });
    toast("The trap is set.");
  });
  refs.simBtn.addEventListener("click", () => simulate(1000));
  refs.resetBtn.addEventListener("click", () => {
    state.wA = 25; state.bA = 25;
    stats.draws = 0; stats.wins = 0; stats.history = []; stats.best = chanceFor(25, 25); stats.bestToast = false;
    refs.verdict.className = "verdict";
    refs.verdict.textContent = "Set the split. Then ask the emperor to draw.";
    refs.solution.hidden = true;
    render();
  });

  render();
  return () => {};
}
