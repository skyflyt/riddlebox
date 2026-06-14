import { mountClassicRiddle } from "../shared/classic.js";

export function mount(root, ctx) {
  return mountClassicRiddle(root, ctx, {
    eyebrow: "Trail",
    lede: "This one sounds like subtraction until you picture yourself walking away.",
    question: "The more you take, the more you leave behind. What are they?",
    answerLabel: "footsteps",
    answers: ["footsteps", "steps", "foot prints", "footprints"],
    hints: [
      "Taking one usually means moving forward.",
      "Look behind you, not in your hands."
    ],
    explanation: [
      "<strong>Footsteps</strong> are taken as you walk, and each step can leave a mark or trace behind.",
      "The trick is that the word take means to walk, not to remove."
    ],
    success: "Yep — every step adds to the trail behind you.",
    symbol: "••",
    palette: ["#c4b5fd", "#f4c35b", "#a7f3d0", "#f8fafc"]
  });
}
