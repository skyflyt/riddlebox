import { mountClassicRiddle } from "../shared/classic.js";

export function mount(root, ctx) {
  return mountClassicRiddle(root, ctx, {
    eyebrow: "Heads or tails",
    lede: "A tiny pocket object with two named sides and absolutely no anatomy.",
    question: "What has a head and a tail, but no body?",
    answerLabel: "a coin",
    answers: ["coin", "a coin"],
    hints: [
      "You can flip it.",
      "One side is called heads; the other is called tails."
    ],
    explanation: [
      "A <strong>coin</strong> has a heads side and a tails side.",
      "The riddle borrows animal words, then switches to the language of chance."
    ],
    success: "Right — no body, just a clean 50/50.",
    symbol: "$",
    palette: ["#fde68a", "#f4c35b", "#f8fafc", "#34d399"]
  });
}
