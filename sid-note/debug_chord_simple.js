// デバッグ用のダミー関数
const extractRootNote = (chord) => {
  console.log(`extractRootNote called with: ${chord}`);
  if (chord.startsWith("C♭") || chord.startsWith("Cb")) return "C♭";
  if (chord.startsWith("E♯") || chord.startsWith("E#")) return "E♯";
  if (chord.startsWith("F♭") || chord.startsWith("Fb")) return "F♭";
  if (chord.startsWith("B♯") || chord.startsWith("B#")) return "B♯";
  return chord.charAt(0) + (chord.charAt(1) === "♭" || chord.charAt(1) === "＃" ? chord.charAt(1) : "");
};

const normalizeNotation = (noteName) => {
  console.log(`normalizeNotation called with: ${noteName}`);
  return noteName.replace(/[#♯]/g, "＃").replace(/[b]/g, "♭");
};

const isValidNoteName = (noteName) => {
  console.log(`isValidNoteName called with: ${noteName}`);
  return true; // デバッグ用に常にtrueを返す
};

const testChords = ["C♭", "Cb", "C#", "C＃", "E♯", "E#", "F♭", "Fb", "B♯", "B#"];

testChords.forEach((chord) => {
  console.log(`\n${chord}:`);
  console.log(`  normalizeNotation: "${normalizeNotation(chord)}"`);
  console.log(`  isValidNoteName: ${isValidNoteName(chord)}`);
  console.log(`  extractRootNote: "${extractRootNote(chord)}"`);
});
