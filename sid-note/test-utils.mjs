// 新しい汎用ユーティリティ関数の動作確認
import { extractChordType, extractRootNote } from "./src/utils/music/theory/note/stringDecomposition";

console.log("=== 新しい汎用ユーティリティ関数のテスト ===");

// extractRootNote のテスト
console.log("extractRootNote テスト:");
console.log('extractRootNote("C7"):', extractRootNote("C7"));
console.log('extractRootNote("F＃m7"):', extractRootNote("F＃m7"));
console.log('extractRootNote("Am/G"):', extractRootNote("Am/G"));

// extractChordType のテスト
console.log("\nextractChordType テスト:");
console.log('extractChordType("C7"):', extractChordType("C7"));
console.log('extractChordType("F＃m7"):', extractChordType("F＃m7"));
console.log('extractChordType("Am/G"):', extractChordType("Am/G"));
console.log('extractChordType("C"):', extractChordType("C"));
