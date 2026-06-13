import { el, toast, flashScreen } from "../shared/ui.js";
import { centerOf } from "../shared/fx.js";

const N = 12;
const MAX_WEIGHINGS = 3;

export function mount(root, { fx }) {
  const state = {
    secretBall: Math.floor(Math.random() * N),                       // 0..11
    secretDir: Math.random() < 0.5 ? "heavier" : "lighter",
    pos: Array.from({ length: N }, () => "tray"),                    // tray | left | right
    weighings: [],                                                   // {left:[], right:[], result:"lt"|"eq"|"gt"}
    phase: "weighing",                                               // weighing | guessing | done
    guessId: null,
    guessDir: null,
    won: false
  };

  // Build DOM
  const head = el("div", { class: "scene-head" }, [
    el("span", { class: "scene-eyebrow", text: "Deduction · The 12-ball problem" }),
    el("h1", { class: "scene-title", text: "Find the odd ball in three weighings." }),
    el("p", { class: "scene-lede", text: "Twelve balls look identical. One is the odd one out — heavier or lighter, you don't know which. The balance scale tells you which side is heavier, or that both are equal. You get three weighings. Find the odd ball and say whether it's heavy or light." })
  ]);

  const grid = el("div", { class: "scene-grid" });

  // Stage
  const stage = el("div", { class: "balance-stage" });

  const top = el("div", { class: "balance-top" }, [
    el("p", { style: { margin: 0, color: "var(--muted)" }, html: "Click a ball to cycle <strong>tray → left → right → tray</strong>." }),
    el("div", { class: "weighings-pill" }, [
      el("span", { id: "weigh-count", text: "0 / 3" }),
      el("span", { class: "lamp", id: "lamp-1" }),
      el("span", { class: "lamp", id: "lamp-2" }),
      el("span", { class: "lamp", id: "lamp-3" })
    ])
  ]);

  const tray = el("div", { class: "balls-tray", id: "tray" });

  const scale = el("div", { class: "balance-scale" }, [
    el("div", { class: "scale-pan left", id: "pan-left" }, [
      el("div", { class: "scale-rope" }),
      el("div", { class: "pan-tray", id: "pan-left-tray" })
    ]),
    el("div", { class: "scale-fulcrum" }, [
      el("div", { class: "fulcrum-beam", id: "fulcrum-beam" }),
      el("div", { class: "fulcrum-post" }),
      el("div", { class: "fulcrum-base" })
    ]),
    el("div", { class: "scale-pan right", id: "pan-right" }, [
      el("div", { class: "scale-rope" }),
      el("div", { class: "pan-tray", id: "pan-right-tray" })
    ])
  ]);

  const controlsRow = el("div", { class: "balance-controls" }, [
    el("button", { class: "btn primary", id: "weigh-btn", text: "Weigh" }),
    el("button", { class: "btn ghost", id: "clear-btn", text: "Clear pans" }),
    el("span", { class: "spacer" }),
    el("button", { class: "btn", id: "guess-btn", text: "I know the answer" })
  ]);

  const statusLine = el("p", { class: "balance-status", id: "balance-status", text: "Place balls on the pans and weigh. You have three weighings." });

  const guessPanel = el("div", { class: "guess-panel hidden", id: "guess-panel" }, [
    el("p", { style: { margin: 0, color: "var(--muted)" }, html: "Click the ball you think is odd, then choose its direction." }),
    el("div", { class: "guess-row" }, [
      el("label", { text: "Direction:" }),
      el("div", { class: "direction-toggle", id: "direction-toggle" }, [
        el("button", { type: "button", "data-dir": "heavier", text: "Heavier" }),
        el("button", { type: "button", "data-dir": "lighter", text: "Lighter" })
      ])
    ]),
    el("div", { class: "btn-group" }, [
      el("button", { class: "btn primary", id: "submit-guess", text: "Submit answer", disabled: true }),
      el("button", { class: "btn ghost", id: "cancel-guess", text: "Cancel" })
    ])
  ]);

  stage.append(top, tray, scale, controlsRow, statusLine, guessPanel);

  // Side controls
  const controls = el("div", {});
  const story = el("section", { class: "panel" }, [
    el("h2", { class: "panel-title", text: "Rules" }),
    el("ol", { class: "story-steps" }, [
      el("li", { html: "<strong>12 balls, 1 odd.</strong> It's heavier or lighter — you don't know which." }),
      el("li", { html: "<strong>Place any balls on either pan</strong> and weigh. The scale tilts toward the heavier side or stays even." }),
      el("li", { html: "<strong>Three weighings.</strong> Pick the odd ball and its direction to win." })
    ])
  ]);

  const histPanel = el("section", { class: "panel" }, [
    el("h2", { class: "panel-title", text: "Weighing log" }),
    el("ol", { class: "weigh-history", id: "weigh-history" }, [
      el("li", { style: { color: "var(--dim)", gridTemplateColumns: "1fr", textAlign: "center", fontStyle: "italic" }, text: "Nothing weighed yet" })
    ])
  ]);

  const actions = el("section", { class: "panel" }, [
    el("div", { class: "btn-group" }, [
      el("button", { class: "btn ghost", id: "reset-btn", text: "New puzzle" }),
      el("button", { class: "btn ghost", id: "reveal-btn", text: "Show the strategy" })
    ])
  ]);

  controls.append(story, histPanel, actions);

  const solution = el("section", { class: "solution", id: "solution", hidden: true }, [
    el("h2", { class: "solution-title", text: "The classic strategy" }),
    el("p", { html: "<strong>First weighing:</strong> put balls 1–4 on the left, 5–8 on the right. Set 9–12 aside." }),
    el("p", { html: "If the scale <strong>balances</strong>, the odd ball is in 9–12 and you have two weighings to find it among four. Weigh 9, 10, 11 against three known-good balls; the tilt direction tells you both <em>which group</em> and <em>which direction</em>. One more weighing isolates it." }),
    el("p", { html: "If the scale <strong>tips</strong>, the odd ball is in 1–8, and you already know one side's candidates would be heavy if odd, the other side's would be light if odd. The second weighing rearranges them (e.g. swap two from each side) so the tilt — or lack of tilt — narrows it to one or two suspects, and the third confirms which." }),
    el("p", { class: "card-blurb", text: "It's tight: 3 weighings give 3³=27 distinguishable outcomes, and you need 24 (12 balls × 2 directions). Every weighing has to carry real information." })
  ]);

  grid.append(stage, controls);
  root.append(head, grid, solution);

  // Refs
  const trayEl = stage.querySelector("#tray");
  const leftPan = stage.querySelector("#pan-left-tray");
  const rightPan = stage.querySelector("#pan-right-tray");
  const weighBtn = stage.querySelector("#weigh-btn");
  const clearBtn = stage.querySelector("#clear-btn");
  const guessBtn = stage.querySelector("#guess-btn");
  const submitGuess = stage.querySelector("#submit-guess");
  const cancelGuess = stage.querySelector("#cancel-guess");
  const statusEl = stage.querySelector("#balance-status");
  const beam = stage.querySelector("#fulcrum-beam");
  const panLeft = stage.querySelector("#pan-left");
  const panRight = stage.querySelector("#pan-right");
  const weighCount = stage.querySelector("#weigh-count");
  const historyList = histPanel.querySelector("#weigh-history");
  const directionToggle = guessPanel.querySelector("#direction-toggle");

  function makeBall(id) {
    const place = state.pos[id];
    const cls = ["ball-chip"];
    if (place === "left") cls.push("left");
    else if (place === "right") cls.push("right");
    if (state.phase === "guessing" && state.guessId === id) cls.push("guess-target");
    if (state.phase === "done") cls.push("disabled");
    const node = el("div", {
      class: cls.join(" "),
      "data-id": id,
      role: "button",
      tabindex: state.phase === "done" ? "-1" : "0",
      text: String(id + 1)
    });
    node.addEventListener("click", () => onBallClick(id));
    node.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onBallClick(id); } });
    return node;
  }

  function onBallClick(id) {
    if (state.phase === "done") return;
    if (state.phase === "guessing") {
      state.guessId = id;
      submitGuess.disabled = state.guessDir === null;
      renderTray();
      return;
    }
    const cur = state.pos[id];
    const next = cur === "tray" ? "left" : cur === "left" ? "right" : "tray";
    state.pos[id] = next;
    renderTray();
  }

  function renderTray() {
    trayEl.replaceChildren();
    leftPan.replaceChildren();
    rightPan.replaceChildren();
    for (let i = 0; i < N; i += 1) {
      const node = makeBall(i);
      if (state.pos[i] === "tray") trayEl.appendChild(node);
      else if (state.pos[i] === "left") leftPan.appendChild(node);
      else rightPan.appendChild(node);
    }
  }

  function weighed() {
    return state.weighings.length;
  }

  function ballWeight(i) {
    if (i !== state.secretBall) return 1;
    return state.secretDir === "heavier" ? 1.1 : 0.9;
  }

  function doWeigh() {
    if (state.phase !== "weighing") return;
    const leftIds = [];
    const rightIds = [];
    for (let i = 0; i < N; i += 1) {
      if (state.pos[i] === "left") leftIds.push(i);
      else if (state.pos[i] === "right") rightIds.push(i);
    }
    if (leftIds.length === 0 || rightIds.length === 0) {
      toast("Put balls on both pans first.");
      return;
    }
    if (leftIds.length !== rightIds.length) {
      toast("Pans must have the same number of balls.");
      return;
    }
    const leftWeight = leftIds.reduce((s, i) => s + ballWeight(i), 0);
    const rightWeight = rightIds.reduce((s, i) => s + ballWeight(i), 0);
    let result;
    if (Math.abs(leftWeight - rightWeight) < 1e-9) result = "eq";
    else if (leftWeight > rightWeight) result = "gt"; // left side heavier
    else result = "lt"; // right side heavier

    state.weighings.push({ left: leftIds, right: rightIds, result });

    // Animate beam
    const tilt = result === "eq" ? 0 : result === "gt" ? -7 : 7;
    beam.style.setProperty("--tilt", `${tilt}deg`);
    panLeft.classList.toggle("down", result === "gt");
    panLeft.classList.toggle("up", result === "lt");
    panRight.classList.toggle("down", result === "lt");
    panRight.classList.toggle("up", result === "gt");

    updateHistory();
    weighCount.textContent = `${state.weighings.length} / ${MAX_WEIGHINGS}`;
    for (let i = 1; i <= MAX_WEIGHINGS; i += 1) {
      stage.querySelector(`#lamp-${i}`).classList.toggle("used", i <= state.weighings.length);
    }

    const phrase = result === "eq" ? "balanced" : result === "gt" ? "left side heavier" : "right side heavier";
    statusEl.className = "balance-status";
    statusEl.textContent = `Weighing ${state.weighings.length}: ${phrase}. ${state.weighings.length >= MAX_WEIGHINGS ? "Out of weighings — make your call." : "Plan the next weighing."}`;

    if (state.weighings.length >= MAX_WEIGHINGS) {
      weighBtn.disabled = true;
    }
  }

  function updateHistory() {
    historyList.replaceChildren();
    if (state.weighings.length === 0) {
      const li = document.createElement("li");
      li.style.color = "var(--dim)";
      li.style.gridTemplateColumns = "1fr";
      li.style.textAlign = "center";
      li.style.fontStyle = "italic";
      li.textContent = "Nothing weighed yet";
      historyList.appendChild(li);
      return;
    }
    state.weighings.forEach((w, i) => {
      const arrow = w.result === "eq" ? "=" : w.result === "gt" ? "▶" : "◀";
      const cls = w.result === "eq" ? "eq" : w.result === "gt" ? "gt" : "lt";
      const li = document.createElement("li");
      li.append(
        el("span", { class: "num", text: `#${i + 1}` }),
        el("span", { class: "side-lr", text: `${w.left.map(b => b + 1).join(",")}  vs  ${w.right.map(b => b + 1).join(",")}` }),
        el("span", { class: `result ${cls}`, text: arrow })
      );
      historyList.appendChild(li);
    });
  }

  function clearPans() {
    for (let i = 0; i < N; i += 1) state.pos[i] = "tray";
    beam.style.setProperty("--tilt", "0deg");
    panLeft.classList.remove("down", "up");
    panRight.classList.remove("down", "up");
    renderTray();
  }

  function enterGuess() {
    state.phase = "guessing";
    state.guessId = null;
    state.guessDir = null;
    guessPanel.classList.remove("hidden");
    statusEl.textContent = "Click the ball you think is odd, then pick heavier or lighter.";
    submitGuess.disabled = true;
    directionToggle.querySelectorAll("button").forEach(b => b.classList.remove("on"));
    renderTray();
  }

  function cancelGuessing() {
    state.phase = "weighing";
    state.guessId = null;
    state.guessDir = null;
    guessPanel.classList.add("hidden");
    statusEl.textContent = state.weighings.length >= MAX_WEIGHINGS
      ? "Out of weighings — make your call when ready."
      : "Place balls on the pans and weigh. You have three weighings.";
    renderTray();
  }

  function submitAnswer() {
    if (state.guessId === null || state.guessDir === null) return;
    state.phase = "done";
    guessPanel.classList.add("hidden");
    const correctBall = state.guessId === state.secretBall;
    const correctDir = state.guessDir === state.secretDir;
    state.won = correctBall && correctDir;
    if (state.won) {
      statusEl.className = "balance-status good";
      statusEl.textContent = `Ball ${state.secretBall + 1} was ${state.secretDir}. You got it.`;
      const r = centerOf(stage);
      fx.confetti(r.x, r.y, ["#fde68a", "#86efac", "#60a5fa", "#f4c35b"], 120);
      flashScreen();
    } else {
      statusEl.className = "balance-status bad";
      const truth = `Ball ${state.secretBall + 1} was ${state.secretDir}.`;
      const yours = `You said ball ${state.guessId + 1}, ${state.guessDir}.`;
      statusEl.textContent = `${truth} ${yours}`;
    }
    weighBtn.disabled = true;
    guessBtn.disabled = true;
    clearBtn.disabled = true;
    renderTray();
  }

  function resetPuzzle() {
    state.secretBall = Math.floor(Math.random() * N);
    state.secretDir = Math.random() < 0.5 ? "heavier" : "lighter";
    state.pos = Array.from({ length: N }, () => "tray");
    state.weighings = [];
    state.phase = "weighing";
    state.guessId = null;
    state.guessDir = null;
    state.won = false;
    beam.style.setProperty("--tilt", "0deg");
    panLeft.classList.remove("down", "up");
    panRight.classList.remove("down", "up");
    weighCount.textContent = "0 / 3";
    for (let i = 1; i <= MAX_WEIGHINGS; i += 1) {
      stage.querySelector(`#lamp-${i}`).classList.remove("used");
    }
    weighBtn.disabled = false;
    guessBtn.disabled = false;
    clearBtn.disabled = false;
    statusEl.className = "balance-status";
    statusEl.textContent = "Fresh puzzle. Place balls on the pans and weigh.";
    guessPanel.classList.add("hidden");
    updateHistory();
    renderTray();
  }

  // Wire
  weighBtn.addEventListener("click", doWeigh);
  clearBtn.addEventListener("click", clearPans);
  guessBtn.addEventListener("click", enterGuess);
  cancelGuess.addEventListener("click", cancelGuessing);
  submitGuess.addEventListener("click", submitAnswer);
  directionToggle.querySelectorAll("button").forEach(b => {
    b.addEventListener("click", () => {
      state.guessDir = b.dataset.dir;
      directionToggle.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
      submitGuess.disabled = state.guessId === null;
    });
  });
  actions.querySelector("#reset-btn").addEventListener("click", resetPuzzle);
  actions.querySelector("#reveal-btn").addEventListener("click", () => {
    solution.hidden = false;
    solution.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  renderTray();
  return () => {};
}
