import { FXEngine } from "./shared/fx.js";
import { el, clear } from "./shared/ui.js";
import { renderHub } from "./hub.js";
import * as emperor from "./riddles/emperor.js";
import * as bulbs from "./riddles/bulbs.js";
import * as monty from "./riddles/monty.js";
import * as crossing from "./riddles/crossing.js";

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
    document.body.dataset.theme = "";
    document.title = "Riddlebox — classic puzzles, made playable";
    backBtn.hidden = true;
    renderHub(view, RIDDLES, (rid) => navigate(rid));
    window.scrollTo({ top: 0, behavior: "instant" });
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
  window.scrollTo({ top: 0, behavior: "instant" });
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
