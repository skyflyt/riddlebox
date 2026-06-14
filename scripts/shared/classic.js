import { el, toast, flashScreen } from "./ui.js";
import { centerOf } from "./fx.js";

function normalizeAnswer(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(a|an|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function defaultAnswerCheck(answers) {
  const accepted = answers.map(normalizeAnswer);
  return (value) => accepted.includes(normalizeAnswer(value));
}

export function mountClassicRiddle(root, { fx, riddle }, config) {
  const state = {
    hintIndex: 0,
    attempts: 0,
    solved: false
  };

  const isCorrect = config.checkAnswer || defaultAnswerCheck(config.answers || []);
  const palette = config.palette || ["#f4c35b", "#60a5fa", "#4ade80", "#f8fafc"];

  const head = el("div", { class: "scene-head" }, [
    el("span", { class: "scene-eyebrow", text: `${riddle.category} · ${config.eyebrow || "Classic riddle"}` }),
    el("h1", { class: "scene-title", text: riddle.title }),
    el("p", { class: "scene-lede", text: config.lede })
  ]);

  const question = el("section", { class: "classic-stage" }, [
    el("div", { class: "classic-orb", "aria-hidden": "true" }, [
      el("span", { text: config.symbol || "?" })
    ]),
    el("div", { class: "classic-copy" }, [
      el("span", { class: "classic-label", text: "Riddle" }),
      el("p", { class: "classic-question", text: config.question })
    ]),
    el("form", { class: "classic-answer", id: "answer-form" }, [
      el("label", { for: "answer-input", text: "Your answer" }),
      el("div", { class: "classic-answer-row" }, [
        el("input", {
          id: "answer-input",
          name: "answer",
          type: "text",
          autocomplete: "off",
          spellcheck: "false",
          placeholder: config.placeholder || "Type a guess"
        }),
        el("button", { class: "btn primary", type: "submit", text: "Check" })
      ]),
      el("p", { class: "classic-feedback", id: "classic-feedback", text: "Try it before you peek." })
    ])
  ]);

  const hints = el("section", { class: "panel" }, [
    el("div", { class: "panel-row" }, [
      el("h2", { class: "panel-title", text: "Hints" }),
      el("span", { class: "pill info", id: "hint-pill", text: `${config.hints.length} ready` })
    ]),
    el("p", { class: "classic-hint", id: "classic-hint", text: "No hint revealed yet." }),
    el("button", { class: "btn ghost", id: "hint-btn", type: "button", text: "Show a hint" })
  ]);

  const answer = el("section", { class: "solution", id: "solution", hidden: true }, [
    el("h2", { class: "solution-title", text: config.answerTitle || `Answer: ${config.answerLabel}` }),
    ...config.explanation.map(text => el("p", { html: text }))
  ]);

  const actions = el("section", { class: "panel" }, [
    el("h2", { class: "panel-title", text: "Actions" }),
    el("div", { class: "btn-group" }, [
      el("button", { class: "btn ghost", id: "reveal-btn", type: "button", text: "Reveal answer" }),
      el("button", { class: "btn ghost", id: "reset-btn", type: "button", text: "Reset" })
    ])
  ]);

  const grid = el("div", { class: "scene-grid" }, [
    question,
    el("div", {}, [hints, actions])
  ]);

  root.append(head, grid, answer);

  const form = question.querySelector("#answer-form");
  const input = question.querySelector("#answer-input");
  const feedback = question.querySelector("#classic-feedback");
  const hintText = hints.querySelector("#classic-hint");
  const hintPill = hints.querySelector("#hint-pill");
  const hintBtn = hints.querySelector("#hint-btn");
  const revealBtn = actions.querySelector("#reveal-btn");
  const resetBtn = actions.querySelector("#reset-btn");

  function revealSolution(scroll = true) {
    answer.hidden = false;
    if (scroll) answer.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function setSolved() {
    if (state.solved) return;
    state.solved = true;
    feedback.className = "classic-feedback good";
    feedback.textContent = config.success || `Yep — ${config.answerLabel}.`;
    revealSolution(false);
    const c = centerOf(question);
    fx?.confetti?.(c.x, c.y, palette, 80);
    flashScreen();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.solved) return;
    const guess = input.value;
    if (!normalizeAnswer(guess)) {
      toast("Put a guess in the box first.");
      input.focus();
      return;
    }
    state.attempts += 1;
    if (isCorrect(guess)) {
      setSolved();
      return;
    }
    feedback.className = "classic-feedback bad";
    feedback.textContent = state.attempts === 1
      ? "Not quite. Riddles love a sneaky literal answer."
      : "Still not it. Grab a hint or try another angle.";
  });

  hintBtn.addEventListener("click", () => {
    if (state.hintIndex >= config.hints.length) {
      toast("That's all the hints for this one.");
      return;
    }
    hintText.textContent = config.hints[state.hintIndex];
    state.hintIndex += 1;
    hintPill.textContent = `${config.hints.length - state.hintIndex} left`;
    if (state.hintIndex >= config.hints.length) hintBtn.disabled = true;
  });

  revealBtn.addEventListener("click", () => {
    feedback.className = "classic-feedback";
    feedback.textContent = `Answer: ${config.answerLabel}`;
    revealSolution(true);
  });

  resetBtn.addEventListener("click", () => {
    state.hintIndex = 0;
    state.attempts = 0;
    state.solved = false;
    input.value = "";
    feedback.className = "classic-feedback";
    feedback.textContent = "Try it before you peek.";
    hintText.textContent = "No hint revealed yet.";
    hintPill.textContent = `${config.hints.length} ready`;
    hintBtn.disabled = false;
    answer.hidden = true;
    input.focus();
  });

  return () => {};
}
