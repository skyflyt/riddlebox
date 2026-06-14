import { mountClassicRiddle } from "../shared/classic.js";

export function mount(root, ctx) {
  return mountClassicRiddle(root, ctx, {
    eyebrow: "Breakfast logic",
    lede: "A classic kitchen riddle where breaking the thing is the first useful step.",
    question: "What has to be broken before you can use it?",
    answerLabel: "an egg",
    answers: ["egg", "an egg"],
    hints: [
      "You usually crack it.",
      "Breakfast is the friendly version of the answer."
    ],
    explanation: [
      "An <strong>egg</strong> has to be cracked before you can cook with it or eat what is inside.",
      "The wording makes breaking sound like damage, but here it is the normal way to begin."
    ],
    success: "Nailed it — crack first, usefulness second.",
    symbol: "◯",
    palette: ["#fef3c7", "#f4c35b", "#fb7185", "#f8fafc"]
  });
}
