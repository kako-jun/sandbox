/**
 * スケールユーティリティ
 * 
 * このモジュールは、スケールに関する機能を提供します。
 * スケールの生成、スケールの分析、スケールの変換など、
 * スケールの基本的な操作に対応します。
 * 
 * @module scales
 */

import { getNoteIndex } from "@/utils/music/theory/core/notes";

/**
 * スケールの定義
 */
export interface Scale {
  /** スケールの音名配列 */
  notes: string[];
  /** ルート音 */
  root: string;
  /** スケールのタイプ */
  type: "major" | "minor" | "dorian" | "phrygian" | "lydian" | "mixolydian" | "locrian";
}

/**
 * スケールのパターン定義
 */
const SCALE_PATTERNS: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
};

/**
 * スケールを生成します
 * 
 * @param root - ルート音
 * @param type - スケールのタイプ
 * @returns スケール
 * @throws {Error} 無効なルート音またはスケールタイプが指定された場合
 * 
 * @example
 * ```ts
 * generateScale("C", "major")  // => { notes: ["C", "D", "E", "F", "G", "A", "B"], root: "C", type: "major" }
 * generateScale("A", "minor")  // => { notes: ["A", "B", "C", "D", "E", "F", "G"], root: "A", type: "minor" }
 * ```
 */
export function generateScale(root: string, type: keyof typeof SCALE_PATTERNS): Scale {
  if (!root || typeof root !== "string") {
    throw new Error("ルート音は文字列である必要があります");
  }

  if (!type || !(type in SCALE_PATTERNS)) {
    throw new Error(`無効なスケールタイプです: ${type}`);
  }

  const pattern = SCALE_PATTERNS[type];
  const rootIndex = getNoteIndex(root);
  const notes = pattern.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return getNoteFromIndex(noteIndex);
  });

  return {
    notes,
    root,
    type,
  };
}

/**
 * スケールのダイアトニックコードを取得します
 * 
 * @param scale - スケール
 * @returns ダイアトニックコードの配列
 * 
 * @example
 * ```ts
 * const scale = generateScale("C", "major");
 * getDiatonicChords(scale)  // => ["C", "Dm", "Em", "F", "G7", "Am", "Bdim"]
 * ```
 */
export function getDiatonicChords(scale: Scale): string[] {
  if (!scale || typeof scale !== "object") {
    throw new Error("スケールはオブジェクトである必要があります");
  }

  const chordTypes = ["", "m", "m", "", "7", "m", "dim"];
  return scale.notes.map((note, index) => note + chordTypes[index]);
}

/**
 * インデックスから音名を取得します
 * 
 * @param index - 音名のインデックス（0-11）
 * @returns 音名
 */
function getNoteFromIndex(index: number): string {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return notes[index];
}
