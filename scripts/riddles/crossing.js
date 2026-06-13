import { el, toast, flashScreen } from "../shared/ui.js";
import { centerOf } from "../shared/fx.js";

const CREATURES = {
  wolf: {
    name: "Wolf",
    svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="22" r="14" fill="#6b7280"/><polygon points="8,8 14,18 18,8" fill="#6b7280"/><polygon points="32,8 26,18 22,8" fill="#6b7280"/><circle cx="15" cy="20" r="2" fill="#1f2937"/><circle cx="25" cy="20" r="2" fill="#1f2937"/><path d="M16 28 L20 30 L24 28" stroke="#1f2937" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`
  },
  goat: {
    name: "Goat",
    svg: `<svg viewBox="0 0 40 40"><ellipse cx="20" cy="24" rx="14" ry="11" fill="#e7e5e4"/><path d="M14 12 L17 6 M26 12 L23 6" stroke="#a8a29e" stroke-width="2.4" stroke-linecap="round" fill="none"/><circle cx="16" cy="22" r="1.8" fill="#1c1917"/><circle cx="24" cy="22" r="1.8" fill="#1c1917"/><path d="M18 28 Q20 30 22 28" stroke="#1c1917" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`
  },
  cabbage: {
    name: "Cabbage",
    svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="22" r="14" fill="#22c55e"/><path d="M10 18 Q20 8 30 18 M12 24 Q20 16 28 24 M14 30 Q20 24 26 30" stroke="#15803d" fill="none" stroke-width="1.5" stroke-linecap="round"/></svg>`
  },
  farmer: {
    name: "Farmer",
    svg: `<svg viewBox="0 0 40 40"><circle cx="20" cy="12" r="6" fill="#fde68a"/><path d="M10 14 Q20 8 30 14 L28 16 Q20 11 12 16 Z" fill="#92400e"/><rect x="14" y="18" width="12" height="14" rx="2" fill="#1e40af"/><circle cx="20" cy="22" r="0.8" fill="#fde68a"/><rect x="14" y="30" width="5" height="6" fill="#451a03"/><rect x="21" y="30" width="5" height="6" fill="#451a03"/></svg>`
  }
};

const SIDE = { LEFT: "left", RIGHT: "right" };

function unsafe(left) {
  // Without farmer present: goat+wolf is bad, goat+cabbage is bad
  const has = item => left.has(item);
  if (has("goat") && has("wolf")) return "The wolf will eat the goat.";
  if (has("goat") && has("cabbage")) return "The goat will eat the cabbage.";
  return null;
}

export function mount(root, { fx }) {
  const state = {
    leftSide: new Set(["farmer", "wolf", "goat", "cabbage"]),
    rightSide: new Set(),
    boatItems: new Set(),
    boatSide: SIDE.LEFT,
    moves: 0,
    crossing: false,
    won: false,
    lost: false
  };

  // Head
  const head = el("div", { class: "scene-head" }, [
    el("span", { class: "scene-eyebrow", text: "Constraint · Wolf, goat & cabbage" }),
    el("h1", { class: "scene-title", text: "Get all three across — alive." }),
    el("p", { class: "scene-lede", text: "A farmer must ferry a wolf, a goat, and a head of cabbage across a river. The boat only fits the farmer plus one passenger. If the wolf is left alone with the goat, it eats the goat. If the goat is left alone with the cabbage, it eats the cabbage. Find the route." })
  ]);

  const grid = el("div", { class: "scene-grid" });

  const stage = el("div", { class: "river-stage", id: "stage" }, [
    el("div", { class: "bank left", id: "bank-left" }, [
      el("span", { class: "bank-label", text: "Near bank" }),
      el("div", { class: "bank-slots", id: "left-slots" })
    ]),
    el("div", { class: "river" }, [el("div", { class: "boat bobbing", id: "boat" })]),
    el("div", { class: "bank right", id: "bank-right" }, [
      el("span", { class: "bank-label", text: "Far bank" }),
      el("div", { class: "bank-slots", id: "right-slots" })
    ])
  ]);

  const controls = el("div", {});

  const story = el("section", { class: "panel" }, [
    el("h2", { class: "panel-title", text: "Rules" }),
    el("ol", { class: "story-steps" }, [
      el("li", { html: "<strong>The boat carries the farmer plus one passenger.</strong> Click anything to load or unload it." }),
      el("li", { html: "<strong>Click the boat to row across.</strong> The farmer must be in the boat." }),
      el("li", { html: "Don't leave the wolf alone with the goat, or the goat alone with the cabbage." })
    ])
  ]);

  const stats = el("section", { class: "panel" }, [
    el("div", { class: "panel-row" }, [
      el("h2", { class: "panel-title", text: "Trip status" }),
      el("span", { class: "pill moves-pill", id: "moves-pill", text: "0 crossings" })
    ]),
    el("p", { class: "river-status", id: "river-status", style: { margin: "12px 0 0" }, text: "The farmer waits on the near bank with the wolf, the goat, and the cabbage." })
  ]);

  const actions = el("section", { class: "panel" }, [
    el("div", { class: "btn-group" }, [
      el("button", { class: "btn primary", id: "row-btn", text: "Row across" }),
      el("button", { class: "btn ghost", id: "reset-btn", text: "Reset" }),
      el("button", { class: "btn ghost", id: "reveal-btn", text: "Show the solution" })
    ])
  ]);

  controls.append(story, stats, actions);

  const solution = el("section", { class: "solution", id: "solution", hidden: true }, [
    el("h2", { class: "solution-title", text: "The 7-step route" }),
    el("p", { html: "1. Take the <strong>goat</strong> across. (Wolf + cabbage left behind — fine, they don't bother each other.)" }),
    el("p", { html: "2. Row back <strong>alone</strong>." }),
    el("p", { html: "3. Take the <strong>wolf</strong> across." }),
    el("p", { html: "4. Bring the <strong>goat back</strong>." }),
    el("p", { html: "5. Take the <strong>cabbage</strong> across. (Wolf + cabbage on far side — fine.)" }),
    el("p", { html: "6. Row back <strong>alone</strong>." }),
    el("p", { html: "7. Take the <strong>goat</strong> across. Done." })
  ]);

  grid.append(stage, controls);
  root.append(head, grid, solution);

  // Refs
  const leftSlots = stage.querySelector("#left-slots");
  const rightSlots = stage.querySelector("#right-slots");
  const boat = stage.querySelector("#boat");
  const statusEl = stats.querySelector("#river-status");
  const movesPill = stats.querySelector("#moves-pill");
  const rowBtn = actions.querySelector("#row-btn");

  function creatureNode(id, location) {
    const c = CREATURES[id];
    const node = el("div", { class: `creature ${location === "boat" ? "in-boat" : ""}`, "data-id": id, role: "button", tabindex: "0" }, [
      el("div", { class: "crit-art", html: c.svg }),
      el("span", { class: "crit-name", text: c.name })
    ]);
    node.addEventListener("click", () => handleClick(id));
    node.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(id); } });
    return node;
  }

  function handleClick(id) {
    if (state.crossing || state.won || state.lost) return;
    // Farmer must be on the same side as the boat to interact
    const sameSide = (loc) => loc === state.boatSide || loc === "boat";

    if (state.boatItems.has(id)) {
      // unload from boat to current side
      state.boatItems.delete(id);
      if (state.boatSide === SIDE.LEFT) state.leftSide.add(id);
      else state.rightSide.add(id);
      render();
      return;
    }

    const onLeft = state.leftSide.has(id);
    const onRight = state.rightSide.has(id);

    if (onLeft && state.boatSide !== SIDE.LEFT) {
      toast("The boat is on the other bank.");
      return;
    }
    if (onRight && state.boatSide !== SIDE.RIGHT) {
      toast("The boat is on the other bank.");
      return;
    }

    // Farmer always goes solo: but we still represent farmer in boat
    if (id !== "farmer" && !state.boatItems.has("farmer")) {
      // The farmer must be aboard to drive. Auto-board the farmer if he's on this side.
      const farmerSide = state.leftSide.has("farmer") ? SIDE.LEFT : (state.rightSide.has("farmer") ? SIDE.RIGHT : null);
      if (farmerSide === state.boatSide) {
        state.boatItems.add("farmer");
        if (farmerSide === SIDE.LEFT) state.leftSide.delete("farmer");
        else state.rightSide.delete("farmer");
      } else {
        toast("The farmer needs to come back first.");
        return;
      }
    }

    // Capacity: farmer + 1
    const passengers = [...state.boatItems].filter(x => x !== "farmer");
    if (id !== "farmer" && passengers.length >= 1) {
      toast("Only one passenger fits next to the farmer.");
      return;
    }

    // Load into boat
    state.boatItems.add(id);
    if (state.leftSide.has(id)) state.leftSide.delete(id);
    if (state.rightSide.has(id)) state.rightSide.delete(id);
    render();
  }

  async function row() {
    if (state.crossing || state.won || state.lost) return;
    if (!state.boatItems.has("farmer")) {
      toast("The farmer needs to be in the boat.");
      return;
    }
    state.crossing = true;
    state.moves += 1;
    boat.classList.remove("bobbing");
    boat.classList.add("crossing");
    const dir = state.boatSide === SIDE.LEFT ? 1 : -1;
    const stageRect = stage.getBoundingClientRect();
    const dx = (stageRect.width / 2 - 50) * dir * 0.9;
    boat.style.transform = `translateX(${dx}px)`;

    await new Promise(r => setTimeout(r, 950));

    // Land on opposite side
    state.boatSide = state.boatSide === SIDE.LEFT ? SIDE.RIGHT : SIDE.LEFT;
    boat.classList.remove("crossing");
    boat.classList.add("bobbing");
    boat.style.transform = "";

    // Unload everything from the boat to the new side
    const passengers = [...state.boatItems];
    state.boatItems.clear();
    for (const id of passengers) {
      if (state.boatSide === SIDE.LEFT) state.leftSide.add(id);
      else state.rightSide.add(id);
    }
    state.crossing = false;
    checkRules();
    render();
  }

  function checkRules() {
    const dangerSide = state.boatSide === SIDE.LEFT ? state.rightSide : state.leftSide;
    // The side the farmer is NOT on is unsafe if it has bad pairs
    const farmerOnLeft = state.leftSide.has("farmer");
    const otherSide = farmerOnLeft ? state.rightSide : state.leftSide;
    const trouble = unsafe(otherSide);
    if (trouble) {
      state.lost = true;
      statusEl.className = "river-status lose";
      statusEl.textContent = `${trouble} Try again.`;
      return;
    }
    if (state.rightSide.has("wolf") && state.rightSide.has("goat") && state.rightSide.has("cabbage") && state.rightSide.has("farmer")) {
      state.won = true;
      statusEl.className = "river-status win";
      statusEl.textContent = `All three across — in ${state.moves} crossings.`;
      const c = centerOf(boat);
      fx.confetti(c.x, c.y, ["#4ade80", "#fde68a", "#60a5fa", "#f4c35b"], 110);
      flashScreen();
    }
  }

  function render() {
    leftSlots.replaceChildren();
    rightSlots.replaceChildren();
    boat.replaceChildren();

    // Boat — 2 slots
    const slot1 = el("div", { class: "boat-slot" });
    const slot2 = el("div", { class: "boat-slot" });
    boat.append(slot1, slot2);
    const inBoat = [...state.boatItems];
    if (state.boatItems.has("farmer")) {
      slot1.appendChild(creatureNode("farmer", "boat"));
      const other = inBoat.find(x => x !== "farmer");
      if (other) slot2.appendChild(creatureNode(other, "boat"));
    } else if (inBoat[0]) {
      slot1.appendChild(creatureNode(inBoat[0], "boat"));
    }

    for (const id of state.leftSide) {
      leftSlots.appendChild(creatureNode(id, "left"));
    }
    for (const id of state.rightSide) {
      rightSlots.appendChild(creatureNode(id, "right"));
    }

    // Boat position
    boat.style.gridColumn = "2";
    // Make boat horizontally biased toward current side via translate
    const stageRect = stage.getBoundingClientRect();
    const offset = state.boatSide === SIDE.LEFT ? -16 : 16;
    if (!state.crossing) boat.style.transform = `translateX(${offset}px)`;

    movesPill.textContent = `${state.moves} crossing${state.moves === 1 ? "" : "s"}`;

    if (!state.won && !state.lost) {
      const passengers = [...state.boatItems].filter(x => x !== "farmer");
      statusEl.className = "river-status";
      if (state.boatItems.size === 0) {
        statusEl.textContent = `Boat is on the ${state.boatSide === SIDE.LEFT ? "near" : "far"} bank, empty. Load it.`;
      } else if (passengers.length === 0) {
        statusEl.textContent = `Farmer is in the boat alone, on the ${state.boatSide === SIDE.LEFT ? "near" : "far"} side.`;
      } else {
        statusEl.textContent = `Farmer + ${CREATURES[passengers[0]].name.toLowerCase()} ready to cross.`;
      }
    }

    rowBtn.disabled = state.won || state.lost || state.crossing;
  }

  rowBtn.addEventListener("click", row);
  boat.addEventListener("click", e => {
    // ignore clicks on a creature within the boat
    if (e.target.closest(".creature")) return;
    row();
  });

  actions.querySelector("#reset-btn").addEventListener("click", () => {
    state.leftSide = new Set(["farmer", "wolf", "goat", "cabbage"]);
    state.rightSide = new Set();
    state.boatItems = new Set();
    state.boatSide = SIDE.LEFT;
    state.moves = 0;
    state.won = false;
    state.lost = false;
    state.crossing = false;
    statusEl.className = "river-status";
    render();
  });

  actions.querySelector("#reveal-btn").addEventListener("click", () => {
    solution.hidden = false;
    solution.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  render();
  return () => {};
}
