import { mountClassicRiddle } from "../shared/classic.js";

export function mount(root, ctx) {
  return mountClassicRiddle(root, ctx, {
    eyebrow: "Wordplay",
    lede: "This is less about time than spelling. Say the words slowly and inspect the letters.",
    question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
    answerLabel: "the letter M",
    answers: ["m", "letter m", "the letter m"],
    hints: [
      "Count letters, not calendar time.",
      "Minute has one. Moment has two."
    ],
    explanation: [
      "The answer is the <strong>letter M</strong>.",
      "<code>minute</code> contains one M, <code>moment</code> contains two, and <code>thousand years</code> contains none."
    ],
    success: "Exactly — this one hides in the spelling.",
    symbol: "M",
    palette: ["#f0abfc", "#f4c35b", "#93c5fd", "#f8fafc"]
  });
}
