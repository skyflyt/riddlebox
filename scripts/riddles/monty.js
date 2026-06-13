import { el, toast, flashScreen } from "../shared/ui.js";
import { centerOf } from "../shared/fx.js";

const CAR_SVG = `
  <svg viewBox="0 0 100 70" aria-hidden="true">
    <path d="M10 50 L20 30 Q24 22 32 22 L68 22 Q76 22 80 30 L90 50 Z" fill="#f4c35b" stroke="#7a4d12" stroke-width="2"/>
    <path d="M24 32 L30 26 L70 26 L76 32" fill="#fff8dc" stroke="#7a4d12" stroke-width="1.4"/>
    <line x1="50" y1="26" x2="50" y2="32" stroke="#7a4d12" stroke-width="1.4"/>
    <circle cx="28" cy="52" r="8" fill="#1f1408" stroke="#f4c35b" stroke-width="2"/>
    <circle cx="72" cy="52" r="8" fill="#1f1408" stroke="#f4c35b" stroke-width="2"/>
    <circle cx="28" cy="52" r="3" fill="#a8a29e"/>
    <circle cx="72" cy="52" r="3" fill="#a8a29e"/>
  </svg>`;

const GOAT_SVG = `
  <svg viewBox="0 0 100 80" aria-hidden="true">
    <ellipse cx="50" cy="50" rx="32" ry="22" fill="#e7e5e4"/>
    <ellipse cx="78" cy="42" rx="14" ry="13" fill="#e7e5e4"/>
    <path d="M68 30 L65 18 M82 30 L85 18" stroke="#a8a29e" stroke-width="3" stroke-linecap="round"/>
    <circle cx="82" cy="40" r="2" fill="#1c1917"/>
    <path d="M84 46 Q90 46 90 50" stroke="#a8a29e" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M30 70 L30 76 M44 70 L44 76 M56 70 L56 76 M70 68 L70 76" stroke="#a8a29e" stroke-width="3" stroke-linecap="round"/>
  </svg>`;

export function mount(root, { fx }) {
  const state = {
    car: 0,
    picked: null,    // door index
    revealed: null,  // door index opened by host
    finalChoice: null,
    locked: false,
    history: []      // {strategy: "stay"|"switch", won: bool}
  };
  const stats = { stayWins: 0, stayTotal: 0, swWins: 0, swTotal: 0 };

  const head = el("div", { class: "scene-head" }, [
    el("span", { class: "scene-eyebrow", text: "Probability · The Monty Hall problem" }),
    el("h1", { class: "scene-title", text: "Pick a door. The host opens a goat." }),
    el("p", { class: "scene-lede", text: "Three doors. Behind one is a car; behind the others, goats. After you pick, the host — who knows where the car is — opens one of the other doors to reveal a goat. He offers you a final choice: stay with your pick, or switch to the remaining door. Which wins more often?" })
  ]);

  const grid = el("div", { class: "scene-grid" });

  const stage = el("div", { class: "stage-show" });
  const hostLine = el("p", { class: "host-line", id: "host-line", text: "Pick a door." });
  const doors = el("div", { class: "doors", id: "doors" });
  const choices = el("div", { class: "choice-bar", id: "choice-bar" });
  stage.append(hostLine, doors, choices);

  const controls = el("div", {});
  const story = el("section", { class: "panel" }, [
    el("h2", { class: "panel-title", text: "How it works" }),
    el("ol", { class: "story-steps" }, [
      el("li", { html: "<strong>Pick any of three doors.</strong> The car is behind one." }),
      el("li", { html: "<strong>The host opens a different door</strong> to reveal a goat. He'll never open your door or the car." }),
      el("li", { html: "<strong>Stay or switch.</strong> Decide, and see what's behind your final pick." })
    ])
  ]);

  const statsPanel = el("section", { class: "panel" }, [
    el("div", { class: "panel-row" }, [
      el("h2", { class: "panel-title", text: "Running tally" }),
      el("span", { class: "pill", id: "rounds-pill", text: "0 rounds" })
    ]),
    el("div", { class: "stats-grid", style: { marginTop: "10px" } }, [
      el("div", { class: "stat-card stay" }, [
        el("span", { class: "label", text: "Stay wins" }),
        el("span", { class: "value", id: "stay-val", text: "0 / 0" })
      ]),
      el("div", { class: "stat-card switch" }, [
        el("span", { class: "label", text: "Switch wins" }),
        el("span", { class: "value", id: "switch-val", text: "0 / 0" })
      ])
    ]),
    el("p", { id: "stats-note", style: { margin: "12px 0 0", color: "var(--muted)", fontSize: "0.92rem", lineHeight: "1.5" }, text: "Play a few rounds. The pattern shows up quickly." })
  ]);

  const actions = el("section", { class: "panel" }, [
    el("div", { class: "btn-group" }, [
      el("button", { class: "btn ghost", id: "auto-btn", text: "Auto-play 100 rounds" }),
      el("button", { class: "btn ghost", id: "reveal-btn", text: "Why does switching win?" }),
      el("button", { class: "btn ghost", id: "reset-btn", text: "Reset stats" })
    ])
  ]);

  controls.append(story, statsPanel, actions);

  const solution = el("section", { class: "solution", id: "solution", hidden: true }, [
    el("h2", { class: "solution-title", text: "Why switching wins" }),
    el("p", { html: "When you first pick a door, the chance you picked the car is <strong>1/3</strong>. The chance the car is behind one of the other two is <strong>2/3</strong>." }),
    el("p", { html: "The host then opens a goat door from those other two. He's funneling that <strong>2/3</strong> probability into the one remaining unopened door." }),
    el("p", { html: "So <strong>stay = 1/3</strong>, <strong>switch = 2/3</strong>. The host's knowledge changes the math. Run 100 rounds and watch the gap appear." })
  ]);

  grid.append(stage, controls);
  root.append(head, grid, solution);

  // ─── Build doors ───
  function newRound(carIndex = Math.floor(Math.random() * 3)) {
    state.car = carIndex;
    state.picked = null;
    state.revealed = null;
    state.finalChoice = null;
    state.locked = false;
    doors.replaceChildren(...[0, 1, 2].map(i => {
      const door = el("button", { class: "door", "data-door": i, type: "button" }, [
        el("div", { class: "door-number", text: i + 1 }),
        el("div", { class: "door-handle" }),
        el("div", { class: "reveal", html: i === state.car ? CAR_SVG : GOAT_SVG })
      ]);
      door.addEventListener("click", () => pickDoor(i));
      return door;
    }));
    choices.replaceChildren();
    hostLine.textContent = "Pick a door.";
  }

  function pickDoor(i) {
    if (state.locked || state.picked !== null) return;
    state.picked = i;
    state.locked = true;
    doors.querySelectorAll(".door").forEach(d => {
      const idx = Number(d.dataset.door);
      d.classList.toggle("picked", idx === i);
    });
    hostLine.textContent = "Watching the host…";
    setTimeout(hostReveals, 700);
  }

  function hostReveals() {
    // Host opens a non-picked, non-car door.
    const options = [0, 1, 2].filter(d => d !== state.picked && d !== state.car);
    const open = options[Math.floor(Math.random() * options.length)];
    state.revealed = open;
    const doorEl = doors.querySelector(`[data-door="${open}"]`);
    doorEl.classList.add("opened");
    hostLine.textContent = `The host opens door ${open + 1}. A goat. Stay or switch?`;
    state.locked = false;
    renderChoices();
  }

  function renderChoices() {
    const other = [0, 1, 2].find(d => d !== state.picked && d !== state.revealed);
    choices.replaceChildren(
      el("button", { class: "btn", id: "stay-btn" }, [`Stay with door ${state.picked + 1}`]),
      el("button", { class: "btn primary", id: "switch-btn" }, [`Switch to door ${other + 1}`])
    );
    choices.querySelector("#stay-btn").addEventListener("click", () => finish("stay"));
    choices.querySelector("#switch-btn").addEventListener("click", () => finish("switch"));
  }

  function finish(strategy) {
    if (state.locked) return;
    state.locked = true;
    const other = [0, 1, 2].find(d => d !== state.picked && d !== state.revealed);
    state.finalChoice = strategy === "stay" ? state.picked : other;
    const won = state.finalChoice === state.car;

    // Reveal everything
    doors.querySelectorAll(".door").forEach(d => d.classList.add("opened"));
    hostLine.textContent = won
      ? `🎉 Behind door ${state.finalChoice + 1} — the car! You ${strategy === "stay" ? "stayed" : "switched"} and won.`
      : `Behind door ${state.finalChoice + 1} — a goat. The car was behind door ${state.car + 1}.`;

    if (strategy === "stay") { stats.stayTotal += 1; if (won) stats.stayWins += 1; }
    else { stats.swTotal += 1; if (won) stats.swWins += 1; }
    updateStats();

    if (won) {
      const c = centerOf(doors.querySelector(`[data-door="${state.finalChoice}"]`));
      fx.confetti(c.x, c.y, ["#f4c35b", "#fde68a", "#86efac"], 80);
      flashScreen();
    }

    choices.replaceChildren(el("button", { class: "btn primary", id: "next-btn", text: "Next round" }));
    choices.querySelector("#next-btn").addEventListener("click", () => newRound());
  }

  function updateStats() {
    statsPanel.querySelector("#stay-val").textContent = `${stats.stayWins} / ${stats.stayTotal}`;
    statsPanel.querySelector("#switch-val").textContent = `${stats.swWins} / ${stats.swTotal}`;
    statsPanel.querySelector("#rounds-pill").textContent = `${stats.stayTotal + stats.swTotal} rounds`;

    const note = statsPanel.querySelector("#stats-note");
    const total = stats.stayTotal + stats.swTotal;
    if (total < 5) {
      note.textContent = "Play a few rounds. The pattern shows up quickly.";
    } else {
      const stayPct = stats.stayTotal ? Math.round(stats.stayWins / stats.stayTotal * 100) : 0;
      const swPct = stats.swTotal ? Math.round(stats.swWins / stats.swTotal * 100) : 0;
      note.innerHTML = `Stay: <strong>${stayPct}%</strong> · Switch: <strong>${swPct}%</strong>. Math says 33% vs 67%.`;
    }
  }

  function autoPlay(rounds = 100) {
    // Half stay, half switch — illustrative
    for (let i = 0; i < rounds; i += 1) {
      const car = Math.floor(Math.random() * 3);
      const picked = Math.floor(Math.random() * 3);
      // Host opens a non-picked, non-car door
      const opts = [0, 1, 2].filter(d => d !== picked && d !== car);
      const opened = opts[Math.floor(Math.random() * opts.length)];
      const other = [0, 1, 2].find(d => d !== picked && d !== opened);
      const strategy = i % 2 === 0 ? "stay" : "switch";
      const final = strategy === "stay" ? picked : other;
      const won = final === car;
      if (strategy === "stay") { stats.stayTotal += 1; if (won) stats.stayWins += 1; }
      else { stats.swTotal += 1; if (won) stats.swWins += 1; }
    }
    updateStats();
    toast(`${rounds} rounds simulated — check the tally.`);
  }

  actions.querySelector("#auto-btn").addEventListener("click", () => autoPlay(100));
  actions.querySelector("#reveal-btn").addEventListener("click", () => {
    solution.hidden = false;
    solution.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  actions.querySelector("#reset-btn").addEventListener("click", () => {
    stats.stayWins = 0; stats.stayTotal = 0; stats.swWins = 0; stats.swTotal = 0;
    updateStats();
    newRound();
  });

  newRound();
  updateStats();
  return () => {};
}
