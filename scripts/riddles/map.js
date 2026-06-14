import { mountClassicRiddle } from "../shared/classic.js";

export function mount(root, ctx) {
  return mountClassicRiddle(root, ctx, {
    eyebrow: "Map",
    lede: "This one is a tiny geography trap: everything is represented, but nothing is really there.",
    question: "I have cities, but no houses. I have forests, but no trees. I have rivers, but no water. What am I?",
    answerLabel: "a map",
    answers: ["map", "a map"],
    hints: [
      "It shows places without containing them.",
      "You fold it, zoom it, or pin it to a wall."
    ],
    explanation: [
      "A <strong>map</strong> can show cities, forests, and rivers as symbols or labels.",
      "The riddle is about representation: the map points to things without being those things."
    ],
    success: "Exactly — the whole world, flattened into symbols.",
    symbol: "⌖",
    palette: ["#86efac", "#38bdf8", "#fef08a", "#f8fafc"]
  });
}
