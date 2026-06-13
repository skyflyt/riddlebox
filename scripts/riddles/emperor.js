import { el, toast, flashScreen } from "../shared/ui.js";
import { centerOf } from "../shared/fx.js";

const TOTAL_WHITE = 50;
const TOTAL_BLACK = 50;
const MAX_CHANCE = 0.5 + 0.5 * (49 / 99);
const HISTORY_LIMIT = 6;
const POUR_INTERVAL = 70;

function fmtPct(v) { return `${(v * 100).toFixed(2)}%`; }

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
  // ─── Marble model: 100 persistent objects, each with a home (tray / A / B) ───
  const marbles = [];
  const nodeToMarble = new WeakMap();
  let idc = 0;
  function makeMarble(color) {
    const id = idc++;
    const node = document.createElement("span");
    node.className = `marble ${color}`;
    node.dataset.id = String(id);
    const m = { id, color, loc: "tray", node, seed: id * 991 + (color === "white" ? 13 : 29) };
    nodeToMarble.set(node, m);
    return m;
  }
  // Interleave colours so the tray reads as a real mixed pile.
  for (let i = 0; i < Math.max(TOTAL_WHITE, TOTAL_BLACK); i += 1) {
    if (i < TOTAL_WHITE) marbles.push(makeMarble("white"));
    if (i < TOTAL_BLACK) marbles.push(makeMarble("black"));
  }

  const stats = { draws: 0, wins: 0, history: [], busy: false, crowned: false };

  // ─── Build DOM ───
  const head = el("div", { class: "scene-head" }, [
    el("span", { class: "scene-eyebrow", text: "Probability · The Emperor's Proposition" }),
    el("h1", { class: "scene-title", text: "Split the marbles. Bet your life." }),
    el("p", { class: "scene-lede", text: "You stand before the emperor with 50 white and 50 black marbles and two empty jars. Place every marble — into either jar, however you like. He'll close his eyes, pick a jar at random, and draw one marble. White: you walk free. Black: you don't." })
  ]);

  const grid = el("div", { class: "scene-grid" });

  // ─── LEFT: the court ───
  const court = el("div", { class: "emperor-court" });
  const figure = el("div", { class: "emperor-figure", html: emperorSvg() });

  function jarCard(letter) {
    const glass = el("div", { class: "jar-glass", "data-jar": letter }, [
      el("span", { class: "jar-mouth", "aria-hidden": "true" }),
      el("span", { class: "jar-hint", "data-jar-hint": letter, text: "hold to pour" }),
      el("div", { class: "marbles", "data-marbles": letter })
    ]);
    const card = el("div", { class: "jar-card", "data-jar": letter }, [
      el("div", { class: "jar-head" }, [
        el("div", { class: "jar-label" }, [
          el("span", { class: "jar-letter", text: `Jar ${letter}` }),
          el("span", { class: "jar-count", "data-jar-count": letter, text: "empty" })
        ]),
        el("span", { class: "jar-odds", "data-jar-odds": letter, text: "—" })
      ]),
      glass
    ]);
    return { card, glass };
  }
  const jA = jarCard("A");
  const jB = jarCard("B");
  const jars = el("div", { class: "jars" }, [jA.card, jB.card]);

  function pileCard(color, label) {
    return el("div", { class: `tray-pile ${color}`, "data-pile": color }, [
      el("button", { class: "pile-chip armed", type: "button", "data-arm": color, "aria-pressed": "true" }, [
        el("span", { class: `chip-dot ${color}`, "aria-hidden": "true" }),
        el("span", { class: "chip-label", text: label }),
        el("span", { class: "chip-count", "data-pile-count": color, text: "50" })
      ]),
      el("div", { class: "pile-basin" }, [el("div", { class: "marbles", "data-marbles": color === "white" ? "trayW" : "trayB" })])
    ]);
  }
  const trayRow = el("div", { class: "tray-row", "data-basin": "tray" }, [pileCard("white", "White"), pileCard("black", "Black")]);
  const tray = el("div", { class: "tray-card" }, [
    el("div", { class: "tray-head" }, [
      el("span", { class: "tray-title", text: "Marbles in hand" }),
      el("span", { class: "tray-caption", "data-tray-caption": "1", text: "Tap a pile to choose what pours · hold a jar to pour" })
    ]),
    trayRow
  ]);

  const verdict = el("div", { class: "verdict", text: "Drag marbles into both jars — or hold over a jar to pour. Then let the emperor draw." });
  court.append(figure, jars, tray, verdict);

  // ─── RIGHT: controls ───
  const controls = el("div", {});

  const story = el("section", { class: "panel" }, [
    el("h2", { class: "panel-title", text: "How to play" }),
    el("ol", { class: "story-steps" }, [
      el("li", { html: "<strong>Drag marbles</strong> from either pile into a jar. Drag between jars to rebalance. Both jars take any colour." }),
      el("li", { html: "<strong>Hold over a jar to pour</strong> a stream. <strong>Tap the White or Black pile</strong> to pour just that colour — or leave both lit to pour a mix. <strong>Tap a marble in a jar</strong> to drop it back." }),
      el("li", { html: "<strong>Place all 100</strong> with neither jar empty, then the emperor picks a jar and pulls one marble. White means freedom." })
    ])
  ]);

  const oddsPanel = el("section", { class: "panel" }, [
    el("div", { class: "panel-row" }, [
      el("h2", { class: "panel-title", text: "Your odds" }),
      el("span", { class: "pill", id: "rank-pill", text: "Empty jars" })
    ]),
    el("div", { class: "odds-readout" }, [
      el("div", { class: "odds-value", id: "odds-value", text: "—" }),
      el("div", { class: "odds-meter" }, [
        el("span", { id: "odds-fill" }),
        el("i", { class: "odds-marker fifty", title: "50% baseline" }),
        el("i", { class: "odds-marker cap", title: "74.747% ceiling" })
      ])
    ]),
    el("p", { class: "card-blurb", id: "rank-note", style: { marginTop: "10px" }, text: "Start dropping marbles into both jars." })
  ]);

  const actions = el("section", { class: "panel" }, [
    el("button", { class: "btn primary", id: "draw-btn", style: { width: "100%" }, disabled: true }, ["Let the emperor draw"]),
    el("div", { class: "btn-group", style: { marginTop: "10px" } }, [
      el("button", { class: "btn ghost", id: "best-btn" }, ["Show best split"]),
      el("button", { class: "btn ghost", id: "chaos-btn" }, ["Chaos split"]),
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

  controls.append(story, oddsPanel, actions, historyPanel);
  grid.append(court, controls);
  root.append(head, grid, solution);

  // ─── Refs ───
  // The hand is two colour piles; jar contents are single layers.
  const layers = {
    trayW: tray.querySelector('[data-marbles="trayW"]'),
    trayB: tray.querySelector('[data-marbles="trayB"]'),
    A: jA.glass.querySelector('[data-marbles="A"]'),
    B: jB.glass.querySelector('[data-marbles="B"]')
  };
  const dropTargets = { tray: trayRow, A: jA.glass, B: jB.glass };
  const armed = { white: true, black: true };
  let pourTurn = 0;
  const refs = {
    countA: court.querySelector('[data-jar-count="A"]'),
    countB: court.querySelector('[data-jar-count="B"]'),
    oddsA: court.querySelector('[data-jar-odds="A"]'),
    oddsB: court.querySelector('[data-jar-odds="B"]'),
    hintA: court.querySelector('[data-jar-hint="A"]'),
    hintB: court.querySelector('[data-jar-hint="B"]'),
    trayCaption: court.querySelector('[data-tray-caption="1"]'),
    pileCountW: court.querySelector('[data-pile-count="white"]'),
    pileCountB: court.querySelector('[data-pile-count="black"]'),
    chipW: court.querySelector('[data-arm="white"]'),
    chipB: court.querySelector('[data-arm="black"]'),
    pileW: court.querySelector('.tray-pile.white'),
    pileB: court.querySelector('.tray-pile.black'),
    figure, verdict,
    jarA: jA.card, jarB: jB.card,
    oddsValue: oddsPanel.querySelector("#odds-value"),
    oddsFill: oddsPanel.querySelector("#odds-fill"),
    rankPill: oddsPanel.querySelector("#rank-pill"),
    rankNote: oddsPanel.querySelector("#rank-note"),
    drawBtn: actions.querySelector("#draw-btn"),
    bestBtn: actions.querySelector("#best-btn"),
    chaosBtn: actions.querySelector("#chaos-btn"),
    simBtn: actions.querySelector("#sim-btn"),
    resetBtn: actions.querySelector("#reset-btn"),
    history: historyPanel.querySelector("#history"),
    streak: historyPanel.querySelector("#streak"),
    solution
  };

  // ─── Counts & probability ───
  function tally() {
    const c = { wA: 0, bA: 0, wB: 0, bB: 0, wT: 0, bT: 0 };
    for (const m of marbles) {
      const key = (m.color === "white" ? "w" : "b") + (m.loc === "tray" ? "T" : m.loc);
      c[key] += 1;
    }
    return c;
  }

  function chanceFromCounts(c) {
    const tA = c.wA + c.bA;
    const tB = c.wB + c.bB;
    if (tA === 0 || tB === 0) return 0;
    return 0.5 * (c.wA / tA) + 0.5 * (c.wB / tB);
  }

  function rankFor(c) {
    if (c >= MAX_CHANCE - 1e-7) return ["good", "Crown split", "This is the ceiling. The emperor is furious."];
    if (c >= 0.72) return ["good", "Almost there", "You're seconds from the famous trick."];
    if (c >= 0.66) return ["info", "Loaded", "Strong edge. One smaller jar can still tip more."];
    if (c >= 0.56) return ["info", "Tilted", "Better than fair, not yet impressive."];
    if (c > 0.5001) return ["info", "Hairline edge", "Technically winning. Spiritually suspicious."];
    if (c < 0.4999) return ["bad", "Cursed split", "You're helping the black marbles. Bold choice."];
    return ["", "Fair coin", "Asymmetry is your friend. Lonelier jars win harder."];
  }

  // ─── Layout: pack each container, animate moves with FLIP ───
  function fit(layer, count, kind) {
    const r = layer.getBoundingClientRect();
    const W = r.width || 280;
    const H = r.height || 120;
    const gap = kind === "tray" ? 5 : 3;
    const min = 8;
    let size = 17;
    let cols = 1;
    for (; size >= min; size -= 1) {
      const cell = size + gap;
      cols = Math.max(1, Math.floor(W / cell));
      const rows = Math.ceil(Math.max(count, 1) / cols);
      if (rows * cell <= H || size === min) break;
    }
    return { W, H, size, cols, cell: size + gap };
  }

  function positionFor(kind, i, f, m) {
    const { cols, cell, size, W, H } = f;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const rng = seeded(m.seed);
    const slack = Math.max(0, cell - size) * 0.8;
    const jx = (rng() - 0.5) * slack;
    const jy = (rng() - 0.5) * slack;
    const x0 = (W - cols * cell) / 2;
    const cx = x0 + col * cell + cell / 2 + jx;
    const cy = kind === "tray"
      ? row * cell + cell / 2 + jy + 2
      : H - (row * cell + cell / 2) - jy - 2; // jars fill bottom-up
    return { x: cx - size / 2, y: cy - size / 2, size };
  }

  let dragId = -1; // marble currently being hand-dragged (excluded from FLIP)

  function layoutAll(animate) {
    const doAnim = animate && !fx.reduced;
    const firsts = doAnim ? new Map() : null;
    if (doAnim) for (const m of marbles) if (m.id !== dragId) firsts.set(m, m.node.getBoundingClientRect());

    const inHand = marbles.filter(m => m.loc === "tray");
    const jobs = [
      { layer: layers.A, kind: "jar", list: marbles.filter(m => m.loc === "A") },
      { layer: layers.B, kind: "jar", list: marbles.filter(m => m.loc === "B") },
      { layer: layers.trayW, kind: "tray", list: inHand.filter(m => m.color === "white") },
      { layer: layers.trayB, kind: "tray", list: inHand.filter(m => m.color === "black") }
    ];

    for (const job of jobs) {
      const f = fit(job.layer, job.list.length, job.kind);
      job.list.forEach((m, i) => {
        if (m.id === dragId) return;
        if (m.node.parentNode !== job.layer) job.layer.appendChild(m.node);
        const p = positionFor(job.kind, i, f, m);
        m.node.style.transform = "";
        m.node.style.left = `${p.x}px`;
        m.node.style.top = `${p.y}px`;
        m.node.style.width = `${p.size}px`;
        m.node.style.height = `${p.size}px`;
      });
    }

    if (doAnim) {
      for (const m of marbles) {
        if (m.id === dragId || !firsts.has(m)) continue;
        const first = firsts.get(m);
        const last = m.node.getBoundingClientRect();
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          m.node.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
            { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" }
          );
        }
      }
    }
  }

  // ─── Render readouts ───
  function render() {
    const c = tally();
    const tA = c.wA + c.bA;
    const tB = c.wB + c.bB;
    const inHand = c.wT + c.bT;
    const bothFilled = tA > 0 && tB > 0;
    const placed = inHand === 0;
    const valid = placed && bothFilled;
    const chance = bothFilled ? chanceFromCounts(c) : 0;

    refs.countA.textContent = tA ? `${c.wA} white · ${c.bA} black (${tA})` : "empty";
    refs.countB.textContent = tB ? `${c.wB} white · ${c.bB} black (${tB})` : "empty";
    refs.oddsA.textContent = tA ? `${(100 * c.wA / tA).toFixed(1)}%` : "—";
    refs.oddsB.textContent = tB ? `${(100 * c.wB / tB).toFixed(1)}%` : "—";
    refs.hintA.style.opacity = tA ? "0" : "";
    refs.hintB.style.opacity = tB ? "0" : "";

    // Hand piles: per-colour counts, armed state, and a plain-language caption.
    refs.pileCountW.textContent = String(c.wT);
    refs.pileCountB.textContent = String(c.bT);
    const armW = armed.white && c.wT > 0;
    const armB = armed.black && c.bT > 0;
    refs.chipW.classList.toggle("armed", armed.white);
    refs.chipB.classList.toggle("armed", armed.black);
    refs.chipW.setAttribute("aria-pressed", String(armed.white));
    refs.chipB.setAttribute("aria-pressed", String(armed.black));
    refs.chipW.disabled = c.wT === 0;
    refs.chipB.disabled = c.bT === 0;
    refs.pileW.classList.toggle("dim", !armed.white);
    refs.pileB.classList.toggle("dim", !armed.black);
    refs.pileW.classList.toggle("depleted", c.wT === 0);
    refs.pileB.classList.toggle("depleted", c.bT === 0);
    if (inHand === 0) {
      refs.trayCaption.textContent = "Hand empty — all 100 placed";
    } else {
      const pours = `${armW ? "white" : ""}${armW && armB ? " + " : ""}${armB ? "black" : ""}` || "nothing — tap a pile";
      refs.trayCaption.textContent = `Hold a jar to pour ${pours} · ${inHand} in hand`;
    }

    if (bothFilled) {
      refs.oddsValue.textContent = fmtPct(chance);
      refs.oddsFill.style.width = `${chance * 100}%`;
    } else {
      refs.oddsValue.textContent = "—";
      refs.oddsFill.style.width = "0%";
    }

    let pillKind, title, note;
    if (!bothFilled) {
      [pillKind, title, note] = ["", "Empty jars", placed
        ? "One jar is empty — the emperor needs a choice."
        : "Drop marbles into both jars to see your odds."];
    } else {
      [pillKind, title, note] = rankFor(chance);
      if (!placed) note = `${note} (${inHand} still in hand — place them to draw)`;
    }
    refs.rankPill.className = `pill ${pillKind}`;
    refs.rankPill.textContent = title;
    refs.rankNote.textContent = note;

    refs.drawBtn.disabled = stats.busy || !valid;

    if (valid && chance >= MAX_CHANCE - 1e-7 && !stats.crowned) {
      stats.crowned = true;
      toast("Crown split found: 1 white in Jar A, everything else in Jar B.");
      const r = refs.oddsValue.getBoundingClientRect();
      fx.burst(r.left + r.width / 2, r.top + r.height / 2, ["#f4c35b", "#fffaf0", "#4ade80", "#60a5fa"], 110, 12);
      flashScreen();
    } else if (chance < MAX_CHANCE - 1e-7) {
      stats.crowned = false;
    }

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
    refs.streak.textContent = stats.draws === 0 ? "—" : `${stats.wins}/${stats.draws} wins · ${fmtPct(stats.wins / stats.draws)}`;
  }

  // ─── Pointer gestures: drag a marble, tap to return, hold-to-pour ───
  function targetAt(x, y) {
    for (const loc of ["A", "B", "tray"]) {
      const r = dropTargets[loc].getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return loc;
    }
    return null;
  }

  function setHighlight(loc) {
    for (const k of ["A", "B", "tray"]) dropTargets[k].classList.toggle("drop-active", k === loc);
  }
  function clearHighlight() { setHighlight(null); }

  function beginDrag(node, ev) {
    const m = nodeToMarble.get(node);
    if (!m) return;
    let dragging = false;
    const startX = ev.clientX;
    const startY = ev.clientY;
    try { node.setPointerCapture(ev.pointerId); } catch {}

    const move = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!dragging && Math.hypot(dx, dy) > 6) {
        dragging = true;
        dragId = m.id;
        node.classList.add("dragging");
      }
      if (dragging) {
        node.style.transform = `translate(${dx}px, ${dy}px) scale(1.3)`;
        setHighlight(targetAt(e.clientX, e.clientY));
      }
    };
    const up = (e) => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", up);
      try { node.releasePointerCapture(ev.pointerId); } catch {}
      clearHighlight();
      node.classList.remove("dragging");
      dragId = -1;
      if (!dragging) {
        // Tap: a marble resting in a jar goes back to your hand.
        if (m.loc !== "tray") { m.loc = "tray"; layoutAll(true); afterChange(); }
        else { node.style.transform = ""; }
        return;
      }
      const target = targetAt(e.clientX, e.clientY);
      if (target && target !== m.loc) m.loc = target;
      layoutAll(true);
      afterChange();
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", up);
  }

  // Pick the next marble to pour, honouring the armed colours. When both
  // are armed, alternate so the stream feels like a genuine mix.
  function nextPourMarble() {
    const hand = marbles.filter(m => m.loc === "tray");
    const whites = hand.filter(m => m.color === "white");
    const blacks = hand.filter(m => m.color === "black");
    const wantW = armed.white && whites.length;
    const wantB = armed.black && blacks.length;
    let pool = null;
    if (wantW && wantB) {
      pool = (pourTurn % 2 === 0) ? whites : blacks;
      pourTurn += 1;
    } else if (wantW) {
      pool = whites;
    } else if (wantB) {
      pool = blacks;
    }
    return pool && pool.length ? pool[pool.length - 1] : null;
  }

  function beginPour(loc, glass, ev) {
    let active = true;
    let timer = 0;
    try { glass.setPointerCapture(ev.pointerId); } catch {}
    glass.classList.add("pouring");
    const pourOne = () => {
      if (!active) return;
      const m = nextPourMarble();
      if (!m) { stop(); return; }
      m.loc = loc;
      layoutAll(true);
      afterChange();
      timer = window.setTimeout(pourOne, POUR_INTERVAL);
    };
    function stop() {
      if (!active) return;
      active = false;
      window.clearTimeout(timer);
      glass.classList.remove("pouring");
      try { glass.releasePointerCapture(ev.pointerId); } catch {}
      glass.removeEventListener("pointerup", stop);
      glass.removeEventListener("pointercancel", stop);
    }
    glass.addEventListener("pointerup", stop);
    glass.addEventListener("pointercancel", stop);
    pourOne(); // a quick tap pours exactly one
  }

  function onPointerDown(e) {
    if (stats.busy || e.button === 2) return;
    const marbleEl = e.target.closest(".marble");
    if (marbleEl) { e.preventDefault(); beginDrag(marbleEl, e); return; }
    const glass = e.target.closest(".jar-glass");
    if (glass) { e.preventDefault(); beginPour(glass.dataset.jar, glass, e); }
  }

  function afterChange() {
    render(); // render() owns crown detection + de-duplication
  }

  // Tap a pile to pour only that colour; tap the already-sole pile to go
  // back to pouring both. Always leaves at least one colour armed.
  function tapPile(color) {
    if (stats.busy) return;
    const other = color === "white" ? "black" : "white";
    if (armed[color] && !armed[other]) {
      armed.white = true;
      armed.black = true;
    } else {
      armed[color] = true;
      armed[other] = false;
    }
    pourTurn = 0;
    render();
  }

  // ─── The draw ───
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
    // Race a timeout so a backgrounded tab (where WAAPI pauses and
    // anim.finished never settles) can't strand the scene mid-draw.
    await Promise.race([anim.finished.catch(() => {}), wait(1100)]);
    m.remove();
  }

  function sampleDraw() {
    const c = tally();
    const jar = Math.random() < 0.5 ? "A" : "B";
    const w = jar === "A" ? c.wA : c.wB;
    const b = jar === "A" ? c.bA : c.bB;
    const total = w + b;
    return { jar, white: total > 0 && Math.random() < w / total };
  }

  function setBusy(b) {
    stats.busy = b;
    [refs.drawBtn, refs.bestBtn, refs.chaosBtn, refs.simBtn, refs.resetBtn].forEach(btn => { btn.disabled = b; });
    if (!b) render();
  }

  async function drawOne() {
    if (stats.busy) return;
    const c = tally();
    if (c.wT + c.bT !== 0 || (c.wA + c.bA) === 0 || (c.wB + c.bB) === 0) return;
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
    const c = tally();
    if (c.wT + c.bT !== 0 || (c.wA + c.bA) === 0 || (c.wB + c.bB) === 0) {
      toast("Fill both jars with all 100 marbles first.");
      return;
    }
    let wins = 0;
    for (let i = 0; i < rounds; i += 1) if (sampleDraw().white) wins += 1;
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

  // ─── Bulk configurations ───
  function showBest() {
    if (stats.busy) return;
    let firstWhite = true;
    for (const m of marbles) {
      if (m.color === "white" && firstWhite) { m.loc = "A"; firstWhite = false; }
      else m.loc = "B";
    }
    layoutAll(true);
    afterChange();
    refs.verdict.className = "verdict";
    refs.verdict.textContent = "1 white in Jar A. Everything else in Jar B. Now ask him to draw.";
    refs.solution.hidden = false;
    refs.solution.scrollIntoView({ behavior: "smooth", block: "nearest" });
    toast("The trap is set.");
  }

  function chaosSplit() {
    if (stats.busy) return;
    for (const m of marbles) m.loc = Math.random() < 0.5 ? "A" : "B";
    if (marbles.every(m => m.loc === "B")) marbles[0].loc = "A";
    if (marbles.every(m => m.loc === "A")) marbles[0].loc = "B";
    layoutAll(true);
    afterChange();
    refs.verdict.className = "verdict";
    refs.verdict.textContent = "Marbles flung at random. Let's see what fate you built.";
  }

  function reset() {
    for (const m of marbles) m.loc = "tray";
    armed.white = true; armed.black = true; pourTurn = 0;
    stats.draws = 0; stats.wins = 0; stats.history = []; stats.crowned = false;
    refs.verdict.className = "verdict";
    refs.verdict.textContent = "Drag marbles into both jars — or hold over a jar to pour. Then let the emperor draw.";
    refs.solution.hidden = true;
    layoutAll(true);
    render();
  }

  // ─── Wire ───
  court.addEventListener("pointerdown", onPointerDown);
  refs.chipW.addEventListener("click", () => tapPile("white"));
  refs.chipB.addEventListener("click", () => tapPile("black"));
  refs.drawBtn.addEventListener("click", drawOne);
  refs.bestBtn.addEventListener("click", showBest);
  refs.chaosBtn.addEventListener("click", chaosSplit);
  refs.simBtn.addEventListener("click", () => simulate(1000));
  refs.resetBtn.addEventListener("click", reset);

  const onResize = () => layoutAll(false);
  window.addEventListener("resize", onResize);

  // Initial paint. The scene is already in the DOM, so containers measure
  // synchronously — lay out now (rAF can be throttled in background tabs),
  // then refine on the next frame in case late layout shifts the boxes.
  layoutAll(false);
  render();
  requestAnimationFrame(() => layoutAll(false));

  return () => { window.removeEventListener("resize", onResize); };
}
