// Debug script for chord alias
const fs = require("fs");
const path = require("path");

// Read the TypeScript files and check the actual implementation
const chordFile = fs.readFileSync(path.join(__dirname, "src/utils/music/theory/core/chords.ts"), "utf-8");
console.log("extractChordType function from chords.ts:");

// Find extractChordType function
const extractChordTypeMatch = chordFile.match(/export function extractChordType[\s\S]*?(?=export|$)/);
if (extractChordTypeMatch) {
  console.log(extractChordTypeMatch[0]);
}

const aliasFile = fs.readFileSync(path.join(__dirname, "src/utils/music/theory/chord/alias.ts"), "utf-8");
console.log("\ngetChordNameAliases function from alias.ts:");

// Find getChordNameAliases function
const getChordNameAliasesMatch = aliasFile.match(/export function getChordNameAliases[\s\S]*?(?=export|$)/);
if (getChordNameAliasesMatch) {
  console.log(getChordNameAliasesMatch[0]);
}
