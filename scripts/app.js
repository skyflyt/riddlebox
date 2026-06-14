import { FXEngine } from "./shared/fx.js";
import { el, clear } from "./shared/ui.js";
import { renderHub } from "./hub.js";
import * as emperor from "./riddles/emperor.js";
import * as bulbs from "./riddles/bulbs.js";
import * as monty from "./riddles/monty.js";
import * as crossing from "./riddles/crossing.js";
import * as bridge from "./riddles/bridge.js";
import * as balls from "./riddles/balls.js";
import * as echo from "./riddles/echo.js";
import * as keys from "./riddles/keys.js";
import * as map from "./riddles/map.js";
import * as egg from "./riddles/egg.js";
import * as footsteps from "./riddles/footsteps.js";
import * as towel from "./riddles/towel.js";
import * as coin from "./riddles/coin.js";
import * as letterM from "./riddles/letter-m.js";
import * as windowRiddle from "./riddles/window.js";
import * as comb from "./riddles/comb.js";

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
    id: "echo",
    title: "The Talking Room",
    category: "Classic",
    difficulty: 1,
    blurb: "No mouth, no body, but it repeats what you say when sound comes back.",
    module: echo,
    theme: "echo"
  },
  {
    id: "keys",
    title: "Keys Without Locks",
    category: "Classic",
    difficulty: 1,
    blurb: "Many keys, zero doors. Name the object before it starts playing.",
    module: keys,
    theme: "keys"
  },
  {
    id: "map",
    title: "Cities Without Houses",
    category: "Classic",
    difficulty: 1,
    blurb: "Cities, forests, and rivers are all present, but none of them are real.",
    module: map,
    theme: "map"
  },
  {
    id: "egg",
    title: "Break It First",
    category: "Classic",
    difficulty: 1,
    blurb: "Sometimes the first useful move is the one that sounds destructive.",
    module: egg,
    theme: "egg"
  },
  {
    id: "footsteps",
    title: "What You Leave Behind",
    category: "Classic",
    difficulty: 2,
    blurb: "The more you take, the more evidence trails along behind you.",
    module: footsteps,
    theme: "footsteps"
  },
  {
    id: "towel",
    title: "The Damp Helper",
    category: "Classic",
    difficulty: 1,
    blurb: "It gets wetter every time it does its job correctly.",
    module: towel,
    theme: "towel"
  },
  {
    id: "coin",
    title: "Head, Tail, No Body",
    category: "Classic",
    difficulty: 1,
    blurb: "Two named sides, no anatomy, and a habit of deciding things.",
    module: coin,
    theme: "coin"
  },
  {
    id: "letter-m",
    title: "Minute, Moment, Millennium",
    category: "Wordplay",
    difficulty: 2,
    blurb: "Once in a minute, twice in a moment, and never in a thousand years.",
    module: letterM,
    theme: "letter-m"
  },
  {
    id: "window",
    title: "Through the Wall",
    category: "Classic",
    difficulty: 1,
    blurb: "The invention sounds like x-ray vision until you notice the glass.",
    module: windowRiddle,
    theme: "window"
  },
  {
    id: "comb",
    title: "Teeth That Cannot Bite",
    category: "Classic",
    difficulty: 1,
    blurb: "Many teeth in a row, but not a single one is dangerous.",
    module: comb,
    theme: "comb"
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
