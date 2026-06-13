import { el, toast, flashScreen } from "../shared/ui.js";
import { centerOf } from "../shared/fx.js";

const BUDGET = 17;

const PEOPLE = [
  { id: 0, label: "1", time: 1, bg: "#86efac", bg2: "#4ade80", name: "Sprinter" },
  { id: 1, label: "2", time: 2, bg: "#a7f3d0", bg2: "#34d399", name: "Jogger" },
  { id: 2, label: "5", time: 5, bg: "#fde68a", bg2: "#f59e0b", name: "Hiker" },
  { id: 3, label: "10", time: 10, bg: "#fca5a5", bg2: "#ef4444", name: "Elder" }
];

const SOLUTION = [
  { pair: [0, 1], from: "L", desc: "1 + 2 cross over (2 min)" },
  { pair: [0],     from: "R", desc: "1 walks the torch back (1 min, total 3)" },
  { pair: [2, 3], from: "L", desc: "5 + 10 cross over (10 min, total 13)" },
  { pair: [1],     from: "R", desc: "2 walks the torch back (2 min, total 15)" },
  { pair: [0, 1], from: "L", desc: "1 + 2 cross over (2 min, total 17)" }
];

function fmtMins(n) { return `${n} min`; }

export function mount(root, { fx }) {
  const state = {
    side: PEOPLE.map(() => "L"), // L / R per person
    torch: "L",
    selected: [],                 // up to 2 person ids on the torch side
    timeUsed: 0,
    crossing: false,
    won: false,
    lost: false
  };

  const head = el("div", { class: "scene-head" }, [
    el("span", { class: "scene-eyebrow", text: "Logic · Bridge & torch" }),
    el("h1", { class: "scene-title", text: "Cross the bridge in 17 minutes." }),
    el("p", { class: "scene-lede", text: "Four people must cross a rickety bridge at night. The bridge fits at most two people. Anyone crossing needs the only flashlight, and pairs walk at the slower person's pace. They take 1, 2, 5, and 10 minutes alone. Get everyone across in 17 minutes or less." })
  ]);

  const grid = el("div", { class: "scene-grid" });

  // Stage
  const stage = el("div", { class: "bridge-stage" });
  const clock = el("div", { class: "bridge-clock" }, [
    el("div", {}, [
      el("div", { class: "clock-label", text: "Time used" }),
      el("div", { class: "clock-time", id: "clock-time", text: "0 min" })
    ]),
    el("div", { class: "clock-budget", id: "clock-budget", text: `Budget · ${BUDGET} min` })
  ]);

  const banks = el("div", { class: "scene-banks" }, [
    el("div", { class: "bank-zone", id: "bank-left" }, [
      el("span", { class: "bank-label", text: "Near side" }),
      el("div", { class: "bank-people", id: "people-left" })
    ]),
    el("div", { class: "bridge-span", id: "bridge-span" }, [
      el("div", { class: "bridge-rope top" }),
      el("div", { class: "bridge-deck" }),
      el("div", { class: "bridge-rope bot" }),
      el("div", { class: "bridge-crossers", id: "crossers" }),
      el("div", { class: "torch-marker", id: "torch", style: { left: "0%" } })
    ]),
    el("div", { class: "bank-zone", id: "bank-right" }, [
      el("span", { class: "bank-label", text: "Far side" }),
      el("div", { class: "bank-people", id: "people-right" })
    ])
  ]);

  const status = el("div", { class: "bridge-status", id: "status" }, [
    el("p", { id: "status-line", text: "Pick one or two people on the near side, then send them across with the torch." }),
    el("button", { class: "btn primary", id: "cross-btn", text: "Send across", disabled: true })
  ]);

  stage.append(clock, banks, status);

  // Controls
  const controls = el("div", {});
  const story = el("section", { class: "panel" }, [
    el("h2", { class: "panel-title", text: "Rules" }),
    el("ol", { class: "story-steps" }, [
      el("li", { html: "<strong>One torch.</strong> Anyone crossing must have it." }),
      el("li", { html: "<strong>At most two on the bridge.</strong> A pair walks at the slower person's pace." }),
      el("li", { html: "<strong>Someone must walk the torch back.</strong> The torch never throws itself." }),
      el("li", { html: "<strong>Cross times:</strong> 1, 2, 5, and 10 minutes. Beat 17 total." })
    ])
  ]);

  const log = el("section", { class: "panel" }, [
    el("div", { class: "panel-row" }, [
      el("h2", { class: "panel-title", text: "Trip log" }),
      el("span", { class: "pill moves-pill", id: "moves-pill", text: "0 trips" })
    ]),
    el("ol", { id: "log-list", style: { margin: "10px 0 0", padding: 0, listStyle: "none", display: "grid", gap: "6px" } })
  ]);

  const actions = el("section", { class: "panel" }, [
    el("div", { class: "btn-group" }, [
      el("button", { class: "btn ghost", id: "reset-btn", text: "Reset" }),
      el("button", { class: "btn ghost", id: "reveal-btn", text: "Show the solution" })
    ])
  ]);

  controls.append(story, log, actions);

  const solution = el("section", { class: "solution", id: "solution", hidden: true }, [
    el("h2", { class: "solution-title", text: "The optimal route — exactly 17 minutes" }),
    el("p", { html: "1. <strong>1 + 2 cross.</strong> Two minutes pass." }),
    el("p", { html: "2. <strong>1 walks the torch back.</strong> Three minutes." }),
    el("p", { html: "3. <strong>5 + 10 cross.</strong> Ten more, thirteen total." }),
    el("p", { html: "4. <strong>2 walks the torch back.</strong> Fifteen." }),
    el("p", { html: "5. <strong>1 + 2 cross.</strong> Seventeen on the nose." }),
    el("p", { class: "card-blurb", text: "The trick: don't waste the 10-minute crosser as a torch carrier. Get the two slowest across together so their times overlap." })
  ]);

  grid.append(stage, controls);
  root.append(head, grid, solution);

  // Refs
  const leftBank = stage.querySelector("#people-left");
  const rightBank = stage.querySelector("#people-right");
  const torchEl = stage.querySelector("#torch");
  const crossersEl = stage.querySelector("#crossers");
  const clockTime = stage.querySelector("#clock-time");
  const clockBudget = stage.querySelector("#clock-budget");
  const statusLine = stage.querySelector("#status-line");
  const statusEl = stage.querySelector("#status");
  const crossBtn = stage.querySelector("#cross-btn");
  const logList = log.querySelector("#log-list");
  const movesPill = log.querySelector("#moves-pill");

  function personNode(p, locked) {
    const node = el("div", {
      class: `person${state.selected.includes(p.id) ? " selected" : ""}${locked ? " locked" : ""}`,
      "data-id": p.id,
      role: "button",
      tabindex: "0",
      style: { "--avatar-bg": p.bg, "--avatar-bg2": p.bg2 }
    }, [
      el("div", { class: "avatar", text: p.label }),
      el("div", { class: "time", text: fmtMins(p.time) })
    ]);
    if (!locked) {
      node.addEventListener("click", () => toggleSelect(p.id));
      node.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSelect(p.id); }
      });
    }
    return node;
  }

  function toggleSelect(id) {
    if (state.crossing || state.won || state.lost) return;
    if (state.side[id] !== state.torch) {
      toast("That person is on the other side.");
      return;
    }
    const idx = state.selected.indexOf(id);
    if (idx >= 0) state.selected.splice(idx, 1);
    else if (state.selected.length < 2) state.selected.push(id);
    else {
      // Replace the older selection
      state.selected.shift();
      state.selected.push(id);
    }
    render();
  }

  function render() {
    leftBank.replaceChildren();
    rightBank.replaceChildren();
    crossersEl.replaceChildren();

    for (const p of PEOPLE) {
      const side = state.side[p.id];
      const locked = side !== state.torch || state.crossing || state.won || state.lost;
      const node = personNode(p, locked);
      (side === "L" ? leftBank : rightBank).appendChild(node);
    }

    // Torch position
    torchEl.style.left = state.torch === "L" ? "4%" : "calc(100% - 30px)";

    clockTime.textContent = `${state.timeUsed} min`;
    clockTime.classList.toggle("danger", state.timeUsed > BUDGET - 4 && state.timeUsed <= BUDGET);
    clockTime.classList.toggle("over", state.timeUsed > BUDGET);
    clockBudget.textContent = `Budget · ${BUDGET} min  ·  Remaining ${Math.max(0, BUDGET - state.timeUsed)}`;

    crossBtn.disabled = state.selected.length === 0 || state.crossing || state.won || state.lost;
    if (state.selected.length === 0) {
      crossBtn.textContent = "Send across";
    } else if (state.selected.length === 1) {
      const p = PEOPLE[state.selected[0]];
      crossBtn.textContent = `Send ${p.label} (${p.time} min)`;
    } else {
      const a = PEOPLE[state.selected[0]];
      const b = PEOPLE[state.selected[1]];
      const slower = Math.max(a.time, b.time);
      crossBtn.textContent = `Send ${a.label} + ${b.label} (${slower} min)`;
    }
  }

  function addLog(desc) {
    const li = document.createElement("li");
    li.style.display = "grid";
    li.style.gridTemplateColumns = "20px 1fr auto";
    li.style.gap = "8px";
    li.style.alignItems = "center";
    li.style.padding = "8px 10px";
    li.style.borderRadius = "8px";
    li.style.background = "var(--surface)";
    li.style.border = "1px solid var(--border)";
    li.style.fontSize = "0.88rem";
    li.style.color = "var(--muted)";
    const idx = logList.children.length + 1;
    const num = document.createElement("strong");
    num.style.color = "var(--accent)";
    num.textContent = `${idx}.`;
    const txt = document.createElement("span");
    txt.textContent = desc;
    const time = document.createElement("strong");
    time.style.color = "var(--text)";
    time.style.fontVariantNumeric = "tabular-nums";
    time.textContent = `${state.timeUsed} min`;
    li.append(num, txt, time);
    logList.appendChild(li);
    movesPill.textContent = `${logList.children.length} trip${logList.children.length === 1 ? "" : "s"}`;
  }

  async function doCross() {
    if (state.crossing || state.won || state.lost || state.selected.length === 0) return;
    state.crossing = true;
    const ids = [...state.selected];
    const pair = ids.map(i => PEOPLE[i]);
    const slowest = Math.max(...pair.map(p => p.time));
    const fromSide = state.torch;
    const toSide = fromSide === "L" ? "R" : "L";

    // Build pawns animating across
    const placements = ids.map((id, idx) => {
      const p = PEOPLE[id];
      const pawn = el("div", { class: "crossing-pawn", "data-id": id, style: { left: fromSide === "L" ? "6%" : "calc(94% - 36px)", bottom: `${22 + idx * 8}px` } }, [
        el("div", { class: "person crossing", style: { "--avatar-bg": p.bg, "--avatar-bg2": p.bg2 } }, [
          el("div", { class: "avatar", text: p.label }),
          el("div", { class: "time", text: fmtMins(p.time) })
        ])
      ]);
      crossersEl.appendChild(pawn);
      return pawn;
    });

    state.selected = [];
    // Hide originals on the bank
    render();
    // Re-add pawns since render cleared crossersEl
    placements.forEach(p => crossersEl.appendChild(p));

    // Animate — use setTimeout (not RAF) so the cross still progresses when the tab is backgrounded
    await new Promise(r => setTimeout(r, 16));
    const endPos = fromSide === "L" ? "calc(100% - 32px)" : "6%";
    placements.forEach(p => { p.style.left = endPos; });
    torchEl.style.left = toSide === "L" ? "4%" : "calc(100% - 30px)";

    await new Promise(r => setTimeout(r, fx?.reduced ? 80 : 700));

    // Land
    for (const id of ids) state.side[id] = toSide;
    state.torch = toSide;
    state.timeUsed += slowest;
    placements.forEach(p => p.remove());

    const desc = pair.length === 2
      ? `${pair[0].label} + ${pair[1].label} cross (${slowest} min)`
      : `${pair[0].label} walks the torch back (${slowest} min)`;
    addLog(desc);

    state.crossing = false;
    checkOutcome();
    render();
  }

  function checkOutcome() {
    const everyone = state.side.every(s => s === "R");
    if (everyone && state.timeUsed <= BUDGET) {
      state.won = true;
      statusEl.className = "bridge-status win";
      statusLine.textContent = `All four across in ${state.timeUsed} minute${state.timeUsed === 1 ? "" : "s"} — that's the gold standard.`;
      const r = centerOf(statusEl);
      fx.confetti(r.x, r.y, ["#86efac", "#fde68a", "#60a5fa", "#f4c35b"], 110);
      flashScreen();
      return;
    }
    if (everyone && state.timeUsed > BUDGET) {
      state.won = true; // still a "done" state
      statusEl.className = "bridge-status lose";
      statusLine.textContent = `All four across, but it took ${state.timeUsed} minutes — ${state.timeUsed - BUDGET} over budget. Reset and try again.`;
      return;
    }
    if (state.timeUsed > BUDGET) {
      state.lost = true;
      statusEl.className = "bridge-status lose";
      statusLine.textContent = `Time is up at ${state.timeUsed} minutes — over the ${BUDGET}-minute budget. Reset and try again.`;
      return;
    }
    statusEl.className = "bridge-status";
    const onTorch = PEOPLE.filter(p => state.side[p.id] === state.torch).map(p => p.label).join(", ");
    statusLine.textContent = `Torch is on the ${state.torch === "L" ? "near" : "far"} side. Available: ${onTorch || "nobody — impossible state"}.`;
  }

  crossBtn.addEventListener("click", doCross);

  actions.querySelector("#reset-btn").addEventListener("click", () => {
    state.side = PEOPLE.map(() => "L");
    state.torch = "L";
    state.selected = [];
    state.timeUsed = 0;
    state.crossing = false;
    state.won = false;
    state.lost = false;
    statusEl.className = "bridge-status";
    statusLine.textContent = "Pick one or two people on the near side, then send them across with the torch.";
    logList.replaceChildren();
    movesPill.textContent = "0 trips";
    render();
  });

  actions.querySelector("#reveal-btn").addEventListener("click", () => {
    solution.hidden = false;
    solution.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  render();
  checkOutcome();
  return () => {};
}
