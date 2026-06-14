import { mountClassicRiddle } from "../shared/classic.js";

export function mount(root, ctx) {
  return mountClassicRiddle(root, ctx, {
    eyebrow: "Keys",
    lede: "The object has plenty of keys. The trick is that none of them belong to a door.",
    question: "What has many keys, but cannot open a single lock?",
    answerLabel: "a piano",
    answers: ["piano", "a piano", "keyboard", "a keyboard"],
    hints: [
      "The keys are usually black and white.",
      "You press them to make music, not to open anything."
    ],
    explanation: [
      "A <strong>piano</strong> has many keys, but they play notes instead of turning locks.",
      "A keyboard answer gets partial credit in real life, but the classic answer is piano."
    ],
    success: "Correct — those keys make songs, not entry.",
    symbol: "♪",
    palette: ["#f8fafc", "#111827", "#f4c35b", "#60a5fa"]
  });
}
