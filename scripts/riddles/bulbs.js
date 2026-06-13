import { el, toast, flashScreen } from "../shared/ui.js";
import { centerOf } from "../shared/fx.js";

// Internally we assign hidden mapping: switches [0,1,2] → bulbs [0,1,2] permutation.
// Bulb heats while its switch is ON. Heat decays slowly when off.
// Heat units are abstract; thresholds defined below.

const HEAT_RATE = 1.0; // units per second on
const COOL_RATE = 0.25; // units per second off
const HEAT_MAX = 10;
const HOT_THRESHOLD = 4; // bulb feels hot
const WARM_THRESHOLD = 0.8; // bulb feels warm

function bulbSvg() {
  return `
  <svg viewBox="0 0 130 180" aria-hidden="true">
    <path class="glow" d="M65 14c-22 0-38 16-38 38 0 16 8 26 14 34 5 7 8 12 8 18h32c0-6 3-11 8-18 6-8 14-18 14-34 0-22-16-38-38-38z"/>
    <path class="filament" d="M52 92c4-8 9-12 13-12s9 4 13 12" stroke-width="2"/>
    <path class="filament" d="M58 78c2-6 5-8 7-8s5 2 7 8" stroke-width="2"/>
    <rect x="50" y="108" width="30" height="14" rx="3" fill="#4b5563"/>
    <rect x="50" y="124" width="30" height="12" rx="3" fill="#374151"/>
    <rect x="54" y="138" width="22" height="22" rx="2" fill="#1f2937"/>
    <line x1="58" y1="115" x2="72" y2="115" stroke="#1f2937" stroke-width="1.4"/>
    <line x1="58" y1="130" x2="72" y2="130" stroke="#1f2937" stroke-width="1.4"/>
  </svg>`;
}

export function mount(root, { fx }) {
  // Hidden permutation: switch i controls hiddenMap[i] bulb
  const perm = [0, 1, 2];
  for (let i = perm.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const hiddenMap = perm; // switch index → bulb index

  // Bulb heat per bulb index
  const bulbHeat = [0, 0, 0];
  const switchOn = [false, false, false];
  // For UI: how long current state has held
  const switchSince = [Date.now(), Date.now(), Date.now()];
  let lastTick = performance.now();
  let phase = "switching"; // "switching" | "observing" | "done"
  let frameId;

  // Build DOM
  const head = el("div", { class: "scene-head" }, [
    el("span", { class: "scene-eyebrow", text: "Logic · Three switches, three bulbs" }),
    el("h1", { class: "scene-title", text: "Find each bulb's switch." }),
    el("p", { class: "scene-lede", text: "Three switches in this room. Three bulbs in the next. You may flip the switches as much as you like, but you only walk into the bulb room once. Then you must say which switch controls which bulb." })
  ]);

  const grid = el("div", { class: "scene-grid" });

  const room = el("div", { class: "room" }, [
    el("div", { class: "room-tag", id: "room-tag", text: "The switch room" }),
    el("div", { class: "switch-grid", id: "switch-area" }),
    el("div", { class: "room-foot" }, [
      el("p", { class: "room-status", id: "status", text: "Heat the bulbs by leaving a switch on. They cool down when you turn them off." }),
      el("button", { class: "btn primary", id: "walk-btn", text: "Walk into the bulb room →" })
    ])
  ]);

  const controls = el("div", {});
  const story = el("section", { class: "panel" }, [
    el("h2", { class: "panel-title", text: "Rules" }),
    el("ol", { class: "story-steps" }, [
      el("li", { html: "<strong>Flip switches freely</strong> in this room. Each bulb heats slowly while its switch is on." }),
      el("li", { html: "<strong>You can only walk through the door once.</strong> Once you're in the bulb room, the switches are gone." }),
      el("li", { html: "<strong>In the bulb room</strong>, you can look at each bulb and touch it to feel hot, warm, or cool." }),
      el("li", { html: "Then say which switch controls which bulb. <strong>Get all three right.</strong>" })
    ])
  ]);

  const hint = el("section", { class: "panel" }, [
    el("h2", { class: "panel-title", text: "What's known" }),
    el("ul", { id: "hint-list", style: { margin: 0, paddingLeft: "18px", color: "var(--muted)", lineHeight: "1.6", fontSize: "0.92rem" } }, [
      el("li", { text: "A bulb is BRIGHT only if its switch is on right now." }),
      el("li", { text: "A bulb gets HOT after the switch has been on a while." }),
      el("li", { text: "A bulb cools off when its switch is off, but slowly." })
    ])
  ]);

  const actions = el("section", { class: "panel" }, [
    el("div", { class: "btn-group" }, [
      el("button", { class: "btn ghost", id: "hint-btn", text: "I need a hint" }),
      el("button", { class: "btn ghost", id: "reveal-btn", text: "Show me the trick" }),
      el("button", { class: "btn ghost", id: "reset-btn", text: "Start over" })
    ])
  ]);

  controls.append(story, hint, actions);

  // Solution panel
  const solution = el("section", { class: "solution", id: "solution", hidden: true }, [
    el("h2", { class: "solution-title", text: "The classic solution" }),
    el("p", { html: "Flip <strong>switch 1 ON</strong> and leave it for a few minutes. The bulb it controls heats up." }),
    el("p", { html: "Turn <strong>switch 1 OFF</strong>. Flip <strong>switch 2 ON</strong>. Walk into the bulb room immediately." }),
    el("p", { html: "<strong>The lit bulb is switch 2.</strong> Touch the others — the <strong>warm/hot one is switch 1</strong>. The <strong>cool one is switch 3</strong>." })
  ]);

  grid.append(room, controls);
  root.append(head, grid, solution);

  // Build switch UI
  const switchArea = room.querySelector("#switch-area");
  switchArea.replaceChildren(...[0, 1, 2].map(i => {
    const toggle = el("button", { class: "toggle", type: "button", "data-switch": i, "aria-pressed": "false" }, [
      el("span", { class: "label-on", text: "ON" }),
      el("span", { class: "label-off", text: "OFF" }),
      el("span", { class: "lever" })
    ]);
    toggle.addEventListener("click", () => flipSwitch(i));
    return el("div", { class: "switch-panel", "data-switch": i }, [
      el("header", {}, [
        el("h3", { text: `Switch ${i + 1}` }),
        el("time", { "data-time": i, text: "off · 0:00" })
      ]),
      toggle,
      el("div", { class: "switch-meta" }, [
        el("span", { text: "State" }),
        el("strong", { "data-state": i, text: "OFF" })
      ])
    ]);
  }));

  const walkBtn = room.querySelector("#walk-btn");
  const statusEl = room.querySelector("#status");
  const roomTag = room.querySelector("#room-tag");
  const hintBtn = actions.querySelector("#hint-btn");
  const revealBtn = actions.querySelector("#reveal-btn");
  const resetBtn = actions.querySelector("#reset-btn");

  function flipSwitch(i) {
    if (phase !== "switching") return;
    switchOn[i] = !switchOn[i];
    switchSince[i] = Date.now();
    const toggle = switchArea.querySelector(`button.toggle[data-switch="${i}"]`);
    const stateLabel = switchArea.querySelector(`[data-state="${i}"]`);
    toggle.classList.toggle("on", switchOn[i]);
    toggle.setAttribute("aria-pressed", String(switchOn[i]));
    stateLabel.textContent = switchOn[i] ? "ON" : "OFF";
  }

  function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function tick(now) {
    const dt = (now - lastTick) / 1000;
    lastTick = now;
    if (phase === "switching") {
      for (let i = 0; i < 3; i += 1) {
        const bulbIdx = hiddenMap[i];
        if (switchOn[i]) bulbHeat[bulbIdx] = Math.min(HEAT_MAX, bulbHeat[bulbIdx] + dt * HEAT_RATE);
        else bulbHeat[bulbIdx] = Math.max(0, bulbHeat[bulbIdx] - dt * COOL_RATE);
        const elapsed = (Date.now() - switchSince[i]) / 1000;
        const t = switchArea.querySelector(`[data-time="${i}"]`);
        if (t) t.textContent = `${switchOn[i] ? "on" : "off"} · ${fmtTime(elapsed)}`;
      }
    }
    frameId = requestAnimationFrame(tick);
  }
  frameId = requestAnimationFrame(t => { lastTick = t; tick(t); });

  function tempLabel(heat, lit) {
    if (lit) return ["hot", "Hot & bright"];
    if (heat >= HOT_THRESHOLD) return ["hot", "Hot"];
    if (heat >= WARM_THRESHOLD) return ["warm", "Warm"];
    return ["cool", "Cool"];
  }

  function buildBulbRoom() {
    const litArr = hiddenMap.map((_, swIdx) => switchOn[swIdx]); // by switch index... we want by bulb index
    // We'll compute lit per bulb:
    const litByBulb = [false, false, false];
    for (let i = 0; i < 3; i += 1) if (switchOn[i]) litByBulb[hiddenMap[i]] = true;

    roomTag.textContent = "The bulb room";
    statusEl.innerHTML = "Look at each bulb. <strong>Touch it</strong> to feel the temperature, then assign a switch.";
    walkBtn.textContent = "Submit your answers";
    walkBtn.disabled = true;

    const bulbArea = el("div", { class: "bulb-grid" });
    const touched = [false, false, false];
    const guesses = [null, null, null]; // bulb index → switch number (1..3)

    function maybeEnableSubmit() {
      walkBtn.disabled = !guesses.every(g => g !== null);
    }

    for (let b = 0; b < 3; b += 1) {
      const lit = litByBulb[b];
      const cell = el("div", { class: "bulb-cell" });
      const bulb = el("div", { class: `bulb${lit ? " lit" : ""}`, "data-bulb": b, html: bulbSvg() });
      const tempPill = el("span", { class: "bulb-temp cool", text: lit ? "Hot & bright" : "Tap to touch" });

      bulb.addEventListener("click", () => {
        if (touched[b]) return;
        touched[b] = true;
        const [cls, txt] = tempLabel(bulbHeat[b], lit);
        tempPill.className = `bulb-temp ${cls}`;
        tempPill.textContent = txt;
        const c = centerOf(bulb);
        fx.burst(c.x, c.y, cls === "hot" ? ["#f87171", "#fde68a"] : cls === "warm" ? ["#fde68a", "#f4c35b"] : ["#bfdbfe", "#60a5fa"], 14, 4);
      });

      if (lit) {
        touched[b] = true; // bright is obvious
      }

      const sel = el("select", { "aria-label": `Assign switch to bulb ${b + 1}` }, [
        el("option", { value: "", text: "Switch?" }),
        el("option", { value: "1", text: "Switch 1" }),
        el("option", { value: "2", text: "Switch 2" }),
        el("option", { value: "3", text: "Switch 3" })
      ]);
      sel.addEventListener("change", () => {
        guesses[b] = sel.value ? Number(sel.value) : null;
        maybeEnableSubmit();
      });

      cell.append(bulb, tempPill, el("div", { class: "assign" }, [
        el("label", { text: `Bulb ${b + 1}` }),
        sel
      ]));
      bulbArea.appendChild(cell);
    }

    switchArea.replaceWith(bulbArea);
    bulbArea.id = "bulb-area";

    return { litByBulb, guesses };
  }

  function checkAnswer(state) {
    // guesses[bulbIdx] = switch number (1-based)
    // hiddenMap[switchIdx] = bulbIdx; we want the inverse: bulbIdx → switchIdx
    const correctByBulb = [];
    for (let s = 0; s < 3; s += 1) correctByBulb[hiddenMap[s]] = s + 1;
    let correct = 0;
    for (let b = 0; b < 3; b += 1) {
      if (state.guesses[b] === correctByBulb[b]) correct += 1;
    }
    return { correct, correctByBulb };
  }

  let bulbState = null;

  walkBtn.addEventListener("click", () => {
    if (phase === "switching") {
      phase = "observing";
      bulbState = buildBulbRoom();
      walkBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    if (phase === "observing" && bulbState) {
      const { correct, correctByBulb } = checkAnswer(bulbState);
      phase = "done";
      walkBtn.disabled = true;
      const verdict = el("div", { class: `verdict-line ${correct === 3 ? "win" : "lose"}` });
      if (correct === 3) {
        verdict.textContent = "All three correct — you walked through that door once and figured it out.";
        const c = centerOf(walkBtn);
        fx.confetti(c.x, c.y, ["#f4c35b", "#fde68a", "#4ade80", "#60a5fa"], 100);
        flashScreen();
      } else {
        verdict.textContent = `${correct}/3 correct. The right answer: ${correctByBulb.map((s, b) => `Bulb ${b + 1} = Switch ${s}`).join(" · ")}.`;
      }
      statusEl.replaceWith(verdict);
    }
  });

  hintBtn.addEventListener("click", () => {
    toast("Heat can leave a trace even after the switch is off — but only if you waited.");
  });

  revealBtn.addEventListener("click", () => {
    solution.hidden = false;
    solution.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  resetBtn.addEventListener("click", () => {
    cancelAnimationFrame(frameId);
    root.innerHTML = "";
    mount(root, { fx });
  });

  return () => { cancelAnimationFrame(frameId); };
}
