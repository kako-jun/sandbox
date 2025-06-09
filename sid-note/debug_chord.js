// デバッグ用スクリプト
// ESM形式を使用
import { extractRootNote } from "./src/utils/music/theory/core/chords.js";
import { isValidNoteName, normalizeNotation } from "./src/utils/music/theory/core/notes.js";

console.log("Testing chord functions:");

const testChords = ["C♭", "Cb", "C#", "C＃", "E♯", "E#", "F♭", "Fb", "B♯", "B#"];

testChords.forEach((chord) => {
  console.log(`${chord}:`);
  console.log(`  normalizeNotation: "${normalizeNotation(chord)}"`);
  console.log(`  isValidNoteName: ${isValidNoteName(chord)}`);
  console.log(`  extractRootNote: "${extractRootNote(chord)}"`);
});
