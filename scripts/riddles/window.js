import { mountClassicRiddle } from "../shared/classic.js";

export function mount(root, ctx) {
  return mountClassicRiddle(root, ctx, {
    eyebrow: "Literal thinking",
    lede: "A riddle that sounds like science fiction until you stop imagining a gadget.",
    question: "What invention lets you look right through a wall?",
    answerLabel: "a window",
    answers: ["window", "a window"],
    hints: [
      "It is usually installed inside the wall.",
      "The trick is that the wall has a transparent part."
    ],
    explanation: [
      "A <strong>window</strong> lets you see through a wall because it replaces part of that wall with glass.",
      "The wording makes it sound like x-ray vision, but the answer is ordinary architecture."
    ],
    success: "Yep — sometimes the obvious answer is the trapdoor.",
    symbol: "▦",
    palette: ["#93c5fd", "#38bdf8", "#f8fafc", "#f4c35b"]
  });
}
