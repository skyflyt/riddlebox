import { mountClassicRiddle } from "../shared/classic.js";

export function mount(root, ctx) {
  return mountClassicRiddle(root, ctx, {
    eyebrow: "Teeth",
    lede: "The riddle borrows a body part, then hands it to a completely harmless object.",
    question: "What has many teeth, but cannot bite?",
    answerLabel: "a comb",
    answers: ["comb", "a comb", "hair comb", "a hair comb"],
    hints: [
      "The teeth are all in a row.",
      "You use it on hair."
    ],
    explanation: [
      "A <strong>comb</strong> has teeth, but they are just the little prongs that pass through hair.",
      "They can snag, but they cannot bite."
    ],
    success: "Correct — teeth, yes; dental threat, no.",
    symbol: "≡",
    palette: ["#fca5a5", "#f4c35b", "#f8fafc", "#c4b5fd"]
  });
}
