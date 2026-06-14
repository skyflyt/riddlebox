import { mountClassicRiddle } from "../shared/classic.js";

export function mount(root, ctx) {
  return mountClassicRiddle(root, ctx, {
    eyebrow: "Bathroom paradox",
    lede: "A small household contradiction: it succeeds by getting soaked.",
    question: "What gets wetter the more it dries?",
    answerLabel: "a towel",
    answers: ["towel", "a towel"],
    hints: [
      "It dries something else.",
      "You probably own several and forget to hang them up properly."
    ],
    explanation: [
      "A <strong>towel</strong> dries you or another surface by absorbing water.",
      "So the more drying it does, the wetter the towel itself becomes."
    ],
    success: "Correct — heroic, damp, and probably on the floor.",
    symbol: "≈",
    palette: ["#67e8f9", "#60a5fa", "#f8fafc", "#a7f3d0"]
  });
}
