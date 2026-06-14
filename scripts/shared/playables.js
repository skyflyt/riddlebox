import { el, toast, flashScreen } from "./ui.js";
import { centerOf } from "./fx.js";

function shell(root, { fx, riddle }, config) {
  const head = el("div", { class: "scene-head" }, [
    el("span", { class: "scene-eyebrow", text: `${riddle.category} · ${config.eyebrow}` }),
    el("h1", { class: "scene-title", text: riddle.title }),
    el("p", { class: "scene-lede", text: config.lede })
  ]);

  const stage = el("div", { class: `play-stage ${config.className || ""}` });
  const status = el("p", { class: "play-status-text", text: config.status || "Make a move." });
  const movePill = el("span", { class: "pill info", text: "0 moves" });

  const rules = el("section", { class: "panel" }, [
    el("h2", { class: "panel-title", text: "Rules" }),
    el("ol", { class: "story-steps" }, config.rules.map(rule => el("li", { html: rule })))
  ]);

  const statusPanel = el("section", { class: "panel" }, [
    el("div", { class: "panel-row" }, [
      el("h2", { class: "panel-title", text: "Status" }),
      movePill
    ]),
    status
  ]);

  const resetBtn = el("button", { class: "btn ghost", type: "button", text: "Reset" });
  const revealBtn = el("button", { class: "btn ghost", type: "button", text: "Show solution" });
  const actions = el("section", { class: "panel" }, [
    el("h2", { class: "panel-title", text: "Actions" }),
    el("div", { class: "btn-group" }, [resetBtn, revealBtn])
  ]);

  const solution = el("section", { class: "solution", hidden: true }, [
    el("h2", { class: "solution-title", text: config.solutionTitle || "One clean solution" }),
    ...config.solution.map(text => el("p", { html: text }))
  ]);

  const side = el("div", {}, [rules, statusPanel, actions]);
  root.append(head, el("div", { class: "scene-grid" }, [stage, side]), solution);

  revealBtn.addEventListener("click", () => {
    solution.hidden = false;
    solution.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  return {
    stage,
    status,
    movePill,
    resetBtn,
    setStatus(text, kind = "") {
      status.textContent = text;
      status.className = `play-status-text ${kind}`;
    },
    setMoves(moves) {
      movePill.textContent = `${moves} move${moves === 1 ? "" : "s"}`;
    },
    win(text, node = stage, palette = config.palette || ["#f4c35b", "#60a5fa", "#4ade80"]) {
      this.setStatus(text, "good");
      const c = centerOf(node);
      fx?.confetti?.(c.x, c.y, palette, 90);
      flashScreen();
    }
  };
}

function button(text, onClick, className = "btn ghost") {
  return el("button", { class: className, type: "button", text, onclick: onClick });
}

export function mountWaterJugs(root, ctx) {
  const ui = shell(root, ctx, {
    eyebrow: "Water jugs",
    lede: "Measure exactly four liters using only a three-liter jug, a five-liter jug, and the nerve to pour water back and forth.",
    className: "water-game",
    status: "Get either jug to exactly 4 liters.",
    rules: [
      "<strong>Fill</strong> a jug completely, <strong>empty</strong> a jug, or <strong>pour</strong> one jug into the other.",
      "There are no markings except full and empty.",
      "Win when either jug contains exactly <strong>4 liters</strong>."
    ],
    solution: [
      "Fill the 5L jug. Pour it into the 3L jug, leaving 2L in the 5L jug.",
      "Empty the 3L jug. Pour the 2L into it.",
      "Fill the 5L jug again. Pour into the 3L jug until it is full. The 5L jug now has <strong>4L</strong>."
    ],
    palette: ["#67e8f9", "#60a5fa", "#f8fafc"]
  });
  const caps = { small: 3, big: 5 };
  const state = { small: 0, big: 0, moves: 0, won: false };

  function apply(fn) {
    if (state.won) return;
    const before = `${state.small}/${state.big}`;
    fn();
    if (`${state.small}/${state.big}` !== before) state.moves += 1;
    render();
  }

  function pour(from, to) {
    const amount = Math.min(state[from], caps[to] - state[to]);
    state[from] -= amount;
    state[to] += amount;
  }

  function jug(id, label) {
    const level = state[id] / caps[id];
    return el("div", { class: "jug-card" }, [
      el("div", { class: "jug", style: { "--level": level } }, [
        el("div", { class: "jug-water" }),
        el("strong", { text: `${state[id]}L` })
      ]),
      el("h3", { text: `${label} (${caps[id]}L)` }),
      el("div", { class: "btn-group" }, [
        button("Fill", () => apply(() => { state[id] = caps[id]; })),
        button("Empty", () => apply(() => { state[id] = 0; }))
      ])
    ]);
  }

  function render() {
    ui.stage.replaceChildren(
      el("div", { class: "jug-row" }, [jug("small", "Small jug"), jug("big", "Big jug")]),
      el("div", { class: "btn-group play-center" }, [
        button("Pour 3L -> 5L", () => apply(() => pour("small", "big")), "btn primary"),
        button("Pour 5L -> 3L", () => apply(() => pour("big", "small")), "btn primary")
      ])
    );
    ui.setMoves(state.moves);
    if (!state.won && (state.small === 4 || state.big === 4)) {
      state.won = true;
      ui.win(`Measured exactly 4 liters in ${state.moves} moves.`);
    } else if (!state.won) {
      ui.setStatus(`Small: ${state.small}/3L. Big: ${state.big}/5L.`);
    }
  }

  ui.resetBtn.addEventListener("click", () => {
    Object.assign(state, { small: 0, big: 0, moves: 0, won: false });
    render();
  });
  render();
  return () => {};
}

export function mountHanoi(root, ctx) {
  const ui = shell(root, ctx, {
    eyebrow: "Towers of Hanoi",
    lede: "Move the whole stack to the right peg. Bigger disks may never sit on smaller disks.",
    className: "hanoi-game",
    status: "Select a peg, then select a destination peg.",
    rules: [
      "Move one top disk at a time.",
      "A larger disk cannot be placed on a smaller disk.",
      "Move all disks from the left peg to the right peg."
    ],
    solution: [
      "For three disks: move small to right, medium to middle, small to middle, large to right, small to left, medium to right, small to right.",
      "The recursive trick is to move the smaller stack out of the way, move the largest disk, then rebuild the stack."
    ],
    palette: ["#f4c35b", "#c4b5fd", "#86efac"]
  });
  const state = { pegs: [[3, 2, 1], [], []], selected: null, moves: 0, won: false };

  function top(peg) { return state.pegs[peg][state.pegs[peg].length - 1]; }

  function choose(peg) {
    if (state.won) return;
    if (state.selected === null) {
      if (!top(peg)) return toast("Pick a peg with a disk.");
      state.selected = peg;
      render();
      return;
    }
    if (state.selected === peg) {
      state.selected = null;
      render();
      return;
    }
    const disk = top(state.selected);
    const dest = top(peg);
    if (dest && dest < disk) {
      toast("Bigger disks cannot sit on smaller disks.");
      state.selected = null;
      render();
      return;
    }
    state.pegs[state.selected].pop();
    state.pegs[peg].push(disk);
    state.selected = null;
    state.moves += 1;
    render();
  }

  function render() {
    ui.stage.replaceChildren(el("div", { class: "hanoi-board" }, state.pegs.map((peg, idx) =>
      el("button", { class: `peg ${state.selected === idx ? "selected" : ""}`, type: "button", onclick: () => choose(idx) }, [
        el("span", { class: "peg-post" }),
        el("span", { class: "peg-base" }),
        ...peg.map(disk => el("span", { class: `disk d${disk}`, text: String(disk) }))
      ])
    )));
    ui.setMoves(state.moves);
    if (!state.won && state.pegs[2].length === 3) {
      state.won = true;
      ui.win(`Stack moved in ${state.moves} moves. Minimum is 7.`);
    } else if (!state.won) {
      ui.setStatus(state.selected === null ? "Select a peg with a top disk." : "Now pick a legal destination peg.");
    }
  }

  ui.resetBtn.addEventListener("click", () => {
    state.pegs = [[3, 2, 1], [], []];
    state.selected = null;
    state.moves = 0;
    state.won = false;
    render();
  });
  render();
  return () => {};
}

export function mountLightsOut(root, ctx) {
  const ui = shell(root, ctx, {
    eyebrow: "Lights Out",
    lede: "Every switch flips itself and its neighbors. Turn the whole board dark.",
    className: "lights-game",
    status: "Turn every light off.",
    rules: [
      "Pressing a light toggles that light plus its up, down, left, and right neighbors.",
      "Lit cells glow. Dark cells stay quiet.",
      "Win when the board is completely dark."
    ],
    solution: [
      "This layout was scrambled by pressing top-left, top-middle, middle-left, center, and bottom-right.",
      "Because toggles commute and undo themselves, pressing those same cells again solves it."
    ],
    palette: ["#fef08a", "#60a5fa", "#111827"]
  });
  const startClicks = [0, 1, 3, 4, 8];
  const state = { cells: Array(9).fill(false), moves: 0, won: false };

  function toggleRaw(idx) {
    const r = Math.floor(idx / 3);
    const c = idx % 3;
    [[r, c], [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([rr, cc]) => {
      if (rr >= 0 && rr < 3 && cc >= 0 && cc < 3) state.cells[rr * 3 + cc] = !state.cells[rr * 3 + cc];
    });
  }

  function press(idx) {
    if (state.won) return;
    toggleRaw(idx);
    state.moves += 1;
    render();
  }

  function reset() {
    state.cells = Array(9).fill(false);
    startClicks.forEach(toggleRaw);
    state.moves = 0;
    state.won = false;
    render();
  }

  function render() {
    ui.stage.replaceChildren(el("div", { class: "lights-board" }, state.cells.map((on, idx) =>
      el("button", { class: `light-cell ${on ? "on" : ""}`, type: "button", onclick: () => press(idx), "aria-label": `Toggle light ${idx + 1}` })
    )));
    ui.setMoves(state.moves);
    if (!state.won && state.cells.every(v => !v)) {
      state.won = true;
      ui.win(`All lights out in ${state.moves} moves.`);
    } else if (!state.won) {
      ui.setStatus(`${state.cells.filter(Boolean).length} lights still on.`);
    }
  }

  ui.resetBtn.addEventListener("click", reset);
  reset();
  return () => {};
}

export function mountEightPuzzle(root, ctx) {
  const ui = shell(root, ctx, {
    eyebrow: "Sliding tiles",
    lede: "Slide numbered tiles into the blank space until the board reads left-to-right.",
    className: "slide-game",
    status: "Click a tile next to the blank space.",
    rules: [
      "Only tiles next to the blank can move.",
      "Arrange the board as 1, 2, 3 / 4, 5, 6 / 7, 8, blank.",
      "Every move uses the blank as the open space."
    ],
    solution: [
      "This starter is close on purpose: slide 5 down, then slide 8 left.",
      "Bigger sliding puzzles use the same idea: solve rows and corners while preserving the ordered pieces."
    ],
    palette: ["#93c5fd", "#f4c35b", "#f8fafc"]
  });
  const start = [1, 2, 3, 4, 0, 6, 7, 5, 8];
  const goal = "1,2,3,4,5,6,7,8,0";
  const state = { tiles: [...start], moves: 0, won: false };

  function isAdjacent(a, b) {
    const ar = Math.floor(a / 3), ac = a % 3;
    const br = Math.floor(b / 3), bc = b % 3;
    return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
  }

  function move(idx) {
    if (state.won) return;
    const blank = state.tiles.indexOf(0);
    if (!isAdjacent(idx, blank)) return toast("That tile is not next to the blank.");
    [state.tiles[idx], state.tiles[blank]] = [state.tiles[blank], state.tiles[idx]];
    state.moves += 1;
    render();
  }

  function render() {
    ui.stage.replaceChildren(el("div", { class: "slide-board" }, state.tiles.map((tile, idx) =>
      tile === 0
        ? el("span", { class: "slide-tile blank" })
        : el("button", { class: "slide-tile", type: "button", text: String(tile), onclick: () => move(idx) })
    )));
    ui.setMoves(state.moves);
    if (!state.won && state.tiles.join(",") === goal) {
      state.won = true;
      ui.win(`Solved in ${state.moves} moves.`);
    } else if (!state.won) {
      ui.setStatus("Click a numbered tile adjacent to the blank.");
    }
  }

  ui.resetBtn.addEventListener("click", () => {
    state.tiles = [...start];
    state.moves = 0;
    state.won = false;
    render();
  });
  render();
  return () => {};
}

export function mountNim(root, ctx) {
  const ui = shell(root, ctx, {
    eyebrow: "21 sticks",
    lede: "A small strategy duel: take one, two, or three sticks. Whoever takes the last stick wins.",
    className: "nim-game",
    status: "You move first. Take 1, 2, or 3 sticks.",
    rules: [
      "You and the box alternate taking sticks.",
      "Each turn removes 1, 2, or 3 sticks.",
      "The player who takes the last stick wins."
    ],
    solution: [
      "The winning idea is to leave a multiple of four after your turn.",
      "With 21 sticks, take 1 first. Then whenever the box takes N, take 4 - N."
    ],
    palette: ["#f4c35b", "#f87171", "#86efac"]
  });
  const state = { remaining: 21, moves: 0, done: false, lastComputer: 0 };

  function computerMove() {
    if (state.remaining <= 0) return;
    let take = state.remaining % 4;
    if (take === 0) take = Math.min(3, state.remaining);
    take = Math.max(1, Math.min(3, take));
    state.remaining -= take;
    state.lastComputer = take;
    state.moves += 1;
    if (state.remaining <= 0) {
      state.done = true;
      ui.setStatus(`The box took ${take} and took the last stick. Try the multiple-of-four trick.`, "bad");
    }
  }

  function take(n) {
    if (state.done) return;
    if (n > state.remaining) return toast("Not that many sticks left.");
    state.remaining -= n;
    state.moves += 1;
    if (state.remaining <= 0) {
      state.done = true;
      render();
      ui.win(`You took the last stick in ${state.moves} turns.`);
      return;
    }
    computerMove();
    render();
  }

  function render() {
    ui.stage.replaceChildren(
      el("div", { class: "stick-pile" }, Array.from({ length: state.remaining }, (_, i) => el("span", { class: "stick", style: { "--tilt": `${(i % 5) - 2}deg` } }))),
      el("div", { class: "btn-group play-center" }, [1, 2, 3].map(n => button(`Take ${n}`, () => take(n), "btn primary")))
    );
    ui.setMoves(state.moves);
    if (!state.done) {
      ui.setStatus(state.lastComputer ? `The box took ${state.lastComputer}. ${state.remaining} sticks remain.` : `${state.remaining} sticks remain.`);
    }
  }

  ui.resetBtn.addEventListener("click", () => {
    Object.assign(state, { remaining: 21, moves: 0, done: false, lastComputer: 0 });
    render();
  });
  render();
  return () => {};
}

export function mountRiverTrio(root, ctx) {
  const ui = shell(root, ctx, {
    eyebrow: "Constraint crossing",
    lede: "Three guides and three monsters need to cross. Monsters can never outnumber guides on either bank.",
    className: "river-trio-game",
    status: "Select one or two passengers on the boat side.",
    rules: [
      "The boat carries one or two passengers.",
      "On either bank, if any guides are present, monsters may not outnumber them.",
      "Move everyone to the far bank without ever leaving an unsafe bank."
    ],
    solution: [
      "The key is using monster-only return trips early, then pairing guides across once the counts are balanced.",
      "After each crossing, check both banks before you celebrate."
    ],
    palette: ["#86efac", "#fca5a5", "#60a5fa"]
  });
  const people = [
    { id: "G1", kind: "guide", label: "G1" },
    { id: "G2", kind: "guide", label: "G2" },
    { id: "G3", kind: "guide", label: "G3" },
    { id: "M1", kind: "monster", label: "M1" },
    { id: "M2", kind: "monster", label: "M2" },
    { id: "M3", kind: "monster", label: "M3" }
  ];
  const state = { side: Object.fromEntries(people.map(p => [p.id, "L"])), boat: "L", selected: [], moves: 0, won: false };

  function safe(sideMap) {
    return ["L", "R"].every(side => {
      const guides = people.filter(p => p.kind === "guide" && sideMap[p.id] === side).length;
      const monsters = people.filter(p => p.kind === "monster" && sideMap[p.id] === side).length;
      return guides === 0 || monsters <= guides;
    });
  }

  function toggle(id) {
    if (state.won || state.side[id] !== state.boat) return;
    const idx = state.selected.indexOf(id);
    if (idx >= 0) state.selected.splice(idx, 1);
    else if (state.selected.length < 2) state.selected.push(id);
    else toast("Boat only has two seats.");
    render();
  }

  function sail() {
    if (state.selected.length === 0 || state.won) return toast("Select at least one passenger.");
    const next = { ...state.side };
    const to = state.boat === "L" ? "R" : "L";
    state.selected.forEach(id => { next[id] = to; });
    if (!safe(next)) return toast("That would leave a bank unsafe.");
    state.side = next;
    state.boat = to;
    state.selected = [];
    state.moves += 1;
    render();
  }

  function bank(side, title) {
    return el("div", { class: "river-bank" }, [
      el("span", { class: "bank-label", text: title }),
      el("div", { class: "river-people" }, people.filter(p => state.side[p.id] === side).map(p =>
        el("button", {
          class: `river-token ${p.kind} ${state.selected.includes(p.id) ? "selected" : ""}`,
          type: "button",
          text: p.label,
          onclick: () => toggle(p.id)
        })
      ))
    ]);
  }

  function render() {
    ui.stage.replaceChildren(
      el("div", { class: "river-trio-board" }, [
        bank("L", "Near bank"),
        el("div", { class: "river-channel" }, [
          el("button", { class: "boat-btn btn primary", type: "button", onclick: sail, text: `Sail ${state.boat === "L" ? "->" : "<-"}` }),
          el("span", { class: `boat-side ${state.boat === "L" ? "left" : "right"}`, text: "Boat" })
        ]),
        bank("R", "Far bank")
      ])
    );
    ui.setMoves(state.moves);
    if (!state.won && people.every(p => state.side[p.id] === "R")) {
      state.won = true;
      ui.win(`Everyone crossed safely in ${state.moves} trips.`);
    } else if (!state.won) {
      ui.setStatus(`Boat is on the ${state.boat === "L" ? "near" : "far"} bank. Selected: ${state.selected.join(", ") || "none"}.`);
    }
  }

  ui.resetBtn.addEventListener("click", () => {
    state.side = Object.fromEntries(people.map(p => [p.id, "L"]));
    state.boat = "L";
    state.selected = [];
    state.moves = 0;
    state.won = false;
    render();
  });
  render();
  return () => {};
}

export function mountFrogSwap(root, ctx) {
  const ui = shell(root, ctx, {
    eyebrow: "Frog swap",
    lede: "Swap the two frog teams. Frogs move forward into a blank space or jump one frog.",
    className: "frog-game",
    status: "Move every frog to the opposite side.",
    rules: [
      "Green frogs move right. Purple frogs move left.",
      "A frog can slide into the adjacent blank or jump over one frog into the blank.",
      "The goal is purple, purple, purple, blank, green, green, green."
    ],
    solution: [
      "Alternate jumps and slides so the blank travels through the line.",
      "The pattern is slide, jump, jump, slide, jump, jump, jump, slide, then mirror it back down."
    ],
    palette: ["#86efac", "#c4b5fd", "#f4c35b"]
  });
  const start = [">", ">", ">", "_", "<", "<", "<"];
  const goal = "<,<,<,_,>,>,>";
  const state = { slots: [...start], moves: 0, won: false };

  function legal(i) {
    const frog = state.slots[i];
    if (frog === "_") return null;
    const dir = frog === ">" ? 1 : -1;
    if (state.slots[i + dir] === "_") return i + dir;
    if (state.slots[i + dir] && state.slots[i + dir * 2] === "_") return i + dir * 2;
    return null;
  }

  function move(i) {
    if (state.won) return;
    const target = legal(i);
    if (target == null) return toast("That frog cannot move.");
    [state.slots[i], state.slots[target]] = [state.slots[target], state.slots[i]];
    state.moves += 1;
    render();
  }

  function render() {
    ui.stage.replaceChildren(el("div", { class: "frog-board" }, state.slots.map((slot, idx) =>
      el("button", {
        class: `frog-slot ${slot === "_" ? "blank" : slot === ">" ? "green" : "purple"}`,
        type: "button",
        text: slot === "_" ? "" : slot,
        onclick: () => move(idx),
        "aria-label": slot === "_" ? "Blank space" : `Move frog ${idx + 1}`
      })
    )));
    ui.setMoves(state.moves);
    if (!state.won && state.slots.join(",") === goal) {
      state.won = true;
      ui.win(`Frogs swapped in ${state.moves} moves.`);
    } else if (!state.won) {
      ui.setStatus("Click a frog that can move forward into or over the blank.");
    }
  }

  ui.resetBtn.addEventListener("click", () => {
    state.slots = [...start];
    state.moves = 0;
    state.won = false;
    render();
  });
  render();
  return () => {};
}

export function mountMagicSquare(root, ctx) {
  const ui = shell(root, ctx, {
    eyebrow: "Magic square",
    lede: "Place the digits 1 through 9 so every row, column, and diagonal adds to 15.",
    className: "magic-game",
    status: "Select a number, then place it in the square.",
    rules: [
      "Use each number from 1 to 9 exactly once.",
      "Every row, column, and diagonal must total 15.",
      "Click a placed number to remove it."
    ],
    solution: [
      "One classic Lo Shu square is 8 1 6 / 3 5 7 / 4 9 2.",
      "The center must be 5. Opposite cells pair to 10."
    ],
    palette: ["#f0abfc", "#f4c35b", "#60a5fa"]
  });
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const state = { cells: Array(9).fill(null), selected: null, moves: 0, won: false };

  function check() {
    return state.cells.every(Boolean) && wins.every(line => line.reduce((sum, idx) => sum + state.cells[idx], 0) === 15);
  }

  function place(idx) {
    if (state.won) return;
    if (state.cells[idx]) {
      state.selected = state.cells[idx];
      state.cells[idx] = null;
      render();
      return;
    }
    if (!state.selected) return toast("Pick a number first.");
    state.cells[idx] = state.selected;
    state.selected = null;
    state.moves += 1;
    render();
  }

  function render() {
    const available = [1,2,3,4,5,6,7,8,9].filter(n => !state.cells.includes(n));
    ui.stage.replaceChildren(
      el("div", { class: "magic-board" }, state.cells.map((n, idx) =>
        el("button", { class: "magic-cell", type: "button", text: n ? String(n) : "", onclick: () => place(idx) })
      )),
      el("div", { class: "number-tray" }, available.map(n =>
        el("button", { class: `number-chip ${state.selected === n ? "selected" : ""}`, type: "button", text: String(n), onclick: () => { state.selected = n; render(); } })
      ))
    );
    ui.setMoves(state.moves);
    if (!state.won && check()) {
      state.won = true;
      ui.win(`Magic square complete in ${state.moves} placements.`);
    } else if (!state.won) {
      ui.setStatus(state.selected ? `Selected ${state.selected}. Place it in the grid.` : "Select an unused number.");
    }
  }

  ui.resetBtn.addEventListener("click", () => {
    state.cells = Array(9).fill(null);
    state.selected = null;
    state.moves = 0;
    state.won = false;
    render();
  });
  render();
  return () => {};
}

export function mountFourQueens(root, ctx) {
  const ui = shell(root, ctx, {
    eyebrow: "Four queens",
    lede: "Place four queens on a 4x4 board so none can attack another.",
    className: "queens-game",
    status: "Place four non-attacking queens.",
    rules: [
      "Click a square to add or remove a queen.",
      "Queens attack along rows, columns, and diagonals.",
      "Win when four queens are placed with zero attacks."
    ],
    solution: [
      "One solution uses columns 2, 4, 1, 3 from top row to bottom row.",
      "Another solution is its mirror: 3, 1, 4, 2."
    ],
    palette: ["#f8fafc", "#f4c35b", "#c4b5fd"]
  });
  const state = { queens: new Set(), moves: 0, won: false };

  function attacks(a, b) {
    const ar = Math.floor(a / 4), ac = a % 4;
    const br = Math.floor(b / 4), bc = b % 4;
    return ar === br || ac === bc || Math.abs(ar - br) === Math.abs(ac - bc);
  }

  function conflicts(idx) {
    return [...state.queens].some(other => other !== idx && attacks(idx, other));
  }

  function toggle(idx) {
    if (state.won) return;
    if (state.queens.has(idx)) state.queens.delete(idx);
    else if (state.queens.size < 4) state.queens.add(idx);
    else return toast("Only four queens go on this board.");
    state.moves += 1;
    render();
  }

  function render() {
    ui.stage.replaceChildren(el("div", { class: "queen-board" }, Array.from({ length: 16 }, (_, idx) =>
      el("button", {
        class: `queen-cell ${(Math.floor(idx / 4) + idx) % 2 ? "dark" : "light"} ${state.queens.has(idx) ? "has-queen" : ""} ${conflicts(idx) ? "conflict" : ""}`,
        type: "button",
        text: state.queens.has(idx) ? "Q" : "",
        onclick: () => toggle(idx)
      })
    )));
    ui.setMoves(state.moves);
    const solved = state.queens.size === 4 && [...state.queens].every(q => !conflicts(q));
    if (!state.won && solved) {
      state.won = true;
      ui.win(`Four queens placed safely in ${state.moves} moves.`);
    } else if (!state.won) {
      const bad = [...state.queens].filter(conflicts).length;
      ui.setStatus(`${state.queens.size}/4 queens placed${bad ? `, ${bad} in conflict` : ""}.`);
    }
  }

  ui.resetBtn.addEventListener("click", () => {
    state.queens = new Set();
    state.moves = 0;
    state.won = false;
    render();
  });
  render();
  return () => {};
}

export function mountMastermind(root, ctx) {
  const ui = shell(root, ctx, {
    eyebrow: "Mini Mastermind",
    lede: "Crack a hidden three-color code. Each guess tells you exact hits and near misses.",
    className: "mastermind-game",
    status: "Build a three-color guess.",
    rules: [
      "Choose three colors, then submit the row.",
      "Black pips mean right color in the right slot. White pips mean right color in the wrong slot.",
      "Solve the code within eight guesses."
    ],
    solution: [
      "This board uses a fixed code: <strong>blue, yellow, red</strong>.",
      "Use exact hits to lock positions, then rotate near-miss colors into the open slots."
    ],
    palette: ["#60a5fa", "#fde68a", "#f87171"]
  });
  const colors = [
    { id: "blue", hex: "#60a5fa" },
    { id: "yellow", hex: "#fde68a" },
    { id: "red", hex: "#f87171" },
    { id: "green", hex: "#86efac" },
    { id: "purple", hex: "#c4b5fd" }
  ];
  const secret = ["blue", "yellow", "red"];
  const state = { guess: [null, null, null], rows: [], moves: 0, done: false };

  function score(guess) {
    let exact = 0;
    let near = 0;
    const remainingSecret = [];
    const remainingGuess = [];
    for (let i = 0; i < 3; i += 1) {
      if (guess[i] === secret[i]) exact += 1;
      else {
        remainingSecret.push(secret[i]);
        remainingGuess.push(guess[i]);
      }
    }
    remainingGuess.forEach(color => {
      const idx = remainingSecret.indexOf(color);
      if (idx >= 0) {
        near += 1;
        remainingSecret.splice(idx, 1);
      }
    });
    return { exact, near };
  }

  function addColor(color) {
    if (state.done) return;
    const idx = state.guess.indexOf(null);
    if (idx < 0) return toast("Clear a slot or submit this guess.");
    state.guess[idx] = color;
    render();
  }

  function submit() {
    if (state.done) return;
    if (state.guess.some(v => !v)) return toast("Fill all three slots.");
    const result = score(state.guess);
    state.rows.push({ guess: [...state.guess], ...result });
    state.moves += 1;
    state.guess = [null, null, null];
    if (result.exact === 3 || state.rows.length >= 8) state.done = true;
    render();
  }

  function renderPeg(color, className = "code-peg") {
    const def = colors.find(c => c.id === color);
    return el("span", { class: className, style: { "--peg": def?.hex || "transparent" }, title: color || "empty" });
  }

  function render() {
    ui.stage.replaceChildren(
      el("div", { class: "mastermind-current" }, state.guess.map((color, idx) =>
        el("button", { class: "code-slot", type: "button", onclick: () => { state.guess[idx] = null; render(); } }, [renderPeg(color)])
      )),
      el("div", { class: "color-tray" }, colors.map(c =>
        el("button", { class: "color-choice", type: "button", style: { "--peg": c.hex }, "aria-label": c.id, onclick: () => addColor(c.id) })
      )),
      el("div", { class: "btn-group play-center" }, [button("Submit guess", submit, "btn primary")]),
      el("div", { class: "guess-list" }, state.rows.map(row =>
        el("div", { class: "guess-row" }, [
          el("span", { class: "guess-pegs" }, row.guess.map(color => renderPeg(color))),
          el("span", { class: "score-pegs" }, [
            ...Array.from({ length: row.exact }, () => el("i", { class: "score exact" })),
            ...Array.from({ length: row.near }, () => el("i", { class: "score near" }))
          ])
        ])
      ))
    );
    ui.setMoves(state.moves);
    const last = state.rows[state.rows.length - 1];
    if (last?.exact === 3) {
      ui.win(`Code cracked in ${state.moves} guesses.`);
    } else if (state.done) {
      ui.setStatus("Eight guesses used. Reveal the solution and try again.", "bad");
    } else {
      ui.setStatus(last ? `${last.exact} exact, ${last.near} near on the last guess.` : "Build a three-color guess.");
    }
  }

  ui.resetBtn.addEventListener("click", () => {
    state.guess = [null, null, null];
    state.rows = [];
    state.moves = 0;
    state.done = false;
    render();
  });
  render();
  return () => {};
}
