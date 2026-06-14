import { mountClassicRiddle } from "../shared/classic.js";

export function mount(root, ctx) {
  return mountClassicRiddle(root, ctx, {
    eyebrow: "Echo",
    lede: "A quick one about sound, reflection, and the weird way empty spaces talk back.",
    question: "I have no mouth, but I repeat what you say. You hear me when sound comes back to you. What am I?",
    answerLabel: "an echo",
    answers: ["echo", "an echo"],
    hints: [
      "It needs a sound before it can answer.",
      "Caves, canyons, and empty gyms are very good at making one."
    ],
    explanation: [
      "An <strong>echo</strong> is reflected sound. It feels like a reply, but it is really your own voice bouncing back.",
      "The riddle works because it describes conversation with no speaker."
    ],
    success: "Yep — the room is talking back. Echo.",
    symbol: ")))",
    palette: ["#7dd3fc", "#a78bfa", "#f8fafc", "#38bdf8"]
  });
}
