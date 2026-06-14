import { FXEngine } from "./shared/fx.js";
import { el, clear } from "./shared/ui.js";
import { renderHub } from "./hub.js";
import * as emperor from "./riddles/emperor.js";
import * as bulbs from "./riddles/bulbs.js";
import * as monty from "./riddles/monty.js";
import * as crossing from "./riddles/crossing.js";
import * as bridge from "./riddles/bridge.js";
import * as balls from "./riddles/balls.js";
import * as waterJugs from "./riddles/water-jugs.js";
import * as hanoi from "./riddles/hanoi.js";
import * as lightsOut from "./riddles/lights-out.js";
import * as eightPuzzle from "./riddles/eight-puzzle.js";
import * as nim from "./riddles/nim.js";
import * as riverTrio from "./riddles/river-trio.js";
import * as frogSwap from "./riddles/frog-swap.js";
import * as magicSquare from "./riddles/magic-square.js";
import * as fourQueens from "./riddles/four-queens.js";
import * as mastermind from "./riddles/mastermind.js";

const RIDDLES = [
  {
    id: "emperor",
    title: "The Emperor's Proposition",
    category: "Probability",
    difficulty: 3,
    blurb: "100 marbles. 2 jars. The emperor draws once. Find the split that beats a coin flip.",
    module: emperor,
    theme: "emperor"
  },
  {
    id: "bulbs",
    title: "Three Switches, Three Bulbs",
    category: "Logic",
    difficulty: 2,
    blurb: "Three switches, three bulbs, one trip to the other room. Identify them all.",
    module: bulbs,
    theme: "bulbs"
  },
  {
    id: "monty",
    title: "The Monty Hall Show",
    category: "Probability",
    difficulty: 2,
    blurb: "Pick a door. The host opens a goat. Stay or switch — and why does it matter?",
    module: monty,
    theme: "monty"
  },
  {
    id: "crossing",
    title: "Wolf, Goat & Cabbage",
    category: "Constraint",
    difficulty: 1,
    blurb: "One boat. Two free seats. Nobody eats anybody. Ferry them across.",
    module: crossing,
    theme: "crossing"
  },
  {
    id: "bridge",
    title: "Bridge & Torch",
    category: "Logic",
    difficulty: 3,
    blurb: "Four people. One flashlight. Seventeen minutes. Don't waste the slowest pair.",
    module: bridge,
    theme: "bridge"
  },
  {
    id: "balls",
    title: "The 12-Ball Problem",
    category: "Deduction",
    difficulty: 4,
    blurb: "One of twelve is heavier or lighter. Find it in three weighings on a balance.",
    module: balls,
    theme: "balls"
  },
  {
    id: "water-jugs",
    title: "The 3L / 5L Water Jugs",
    category: "Measurement",
    difficulty: 2,
    blurb: "Fill, empty, and pour between two unmarked jugs until exactly four liters appear.",
    module: waterJugs,
    theme: "water-jugs"
  },
  {
    id: "hanoi",
    title: "Towers of Hanoi",
    category: "Sequencing",
    difficulty: 2,
    blurb: "Move the stack across three pegs without ever placing a large disk on a small one.",
    module: hanoi,
    theme: "hanoi"
  },
  {
    id: "lights-out",
    title: "Lights Out",
    category: "Toggle",
    difficulty: 3,
    blurb: "Every press flips a plus-shaped cluster. Turn the board completely dark.",
    module: lightsOut,
    theme: "lights-out"
  },
  {
    id: "eight-puzzle",
    title: "The 8-Puzzle",
    category: "Sliding",
    difficulty: 2,
    blurb: "Slide numbered tiles through the blank space until the grid is in order.",
    module: eightPuzzle,
    theme: "eight-puzzle"
  },
  {
    id: "nim",
    title: "21 Sticks",
    category: "Strategy",
    difficulty: 2,
    blurb: "Take 1, 2, or 3 sticks. Whoever takes the last one wins.",
    module: nim,
    theme: "nim"
  },
  {
    id: "river-trio",
    title: "Guides & Monsters",
    category: "Constraint",
    difficulty: 4,
    blurb: "Move three guides and three monsters across without ever letting monsters outnumber guides.",
    module: riverTrio,
    theme: "river-trio"
  },
  {
    id: "frog-swap",
    title: "Frog Swap",
    category: "Sequencing",
    difficulty: 3,
    blurb: "Slide and jump two frog teams until they trade sides.",
    module: frogSwap,
    theme: "frog-swap"
  },
  {
    id: "magic-square",
    title: "The 15 Magic Square",
    category: "Number",
    difficulty: 3,
    blurb: "Place 1 through 9 so every row, column, and diagonal totals fifteen.",
    module: magicSquare,
    theme: "magic-square"
  },
  {
    id: "four-queens",
    title: "Four Queens",
    category: "Spatial",
    difficulty: 3,
    blurb: "Place four queens on a 4x4 board so none can attack another.",
    module: fourQueens,
    theme: "four-queens"
  },
  {
    id: "mastermind",
    title: "Mini Mastermind",
    category: "Deduction",
    difficulty: 3,
    blurb: "Guess a hidden three-color code from exact-hit and near-miss clues.",
    module: mastermind,
    theme: "mastermind"
  }
];

const RIDDLE_INDEX = new Map(RIDDLES.map(r => [r.id, r]));

const view = document.getElementById("view");
const backBtn = document.querySelector('[data-action="home"]');
const fx = new FXEngine(document.getElementById("fx-canvas"));

let activeTeardown = null;

function setView(id) {
  if (activeTeardown) { try { activeTeardown(); } catch {} activeTeardown = null; }
  clear(view);

  if (!id || !RIDDLE_INDEX.has(id)) {
    document.body.dataset.view = "hub";
    delete document.body.dataset.theme;
    document.title = "Riddlebox — classic puzzles, made playable";
    backBtn.hidden = true;
    renderHub(view, RIDDLES, (rid) => navigate(rid));
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }

  const riddle = RIDDLE_INDEX.get(id);
  document.body.dataset.view = "riddle";
  document.body.dataset.theme = riddle.theme;
  document.title = `${riddle.title} — Riddlebox`;
  backBtn.hidden = false;

  const scene = el("section", { class: "scene" });
  view.appendChild(scene);
  activeTeardown = riddle.module.mount(scene, { fx, riddle });
  window.scrollTo({ top: 0, behavior: "auto" });
}

function navigate(id) {
  const hash = id ? `#/${id}` : "#/";
  if (window.location.hash !== hash) window.location.hash = hash;
  else routeFromHash();
}

function routeFromHash() {
  const hash = window.location.hash || "#/";
  const id = hash.replace(/^#\/?/, "").trim();
  setView(id);
}

backBtn.addEventListener("click", () => navigate(null));
window.addEventListener("hashchange", routeFromHash);
routeFromHash();
