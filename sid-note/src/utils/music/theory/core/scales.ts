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
 * スケールキーからScaleオブジェクトを生成します
 *
 * @param scaleKey - スケールのキー（例：C, Am, G#m）
 * @returns Scaleオブジェクト
 * @throws {Error} 無効なスケールキーが指定された場合
 */
export function generateScaleFromKey(scaleKey: string): Scale {
  if (!scaleKey || typeof scaleKey !== "string") {
    throw new Error("スケールキーは文字列である必要があります");
  }

  const isMinor = scaleKey.endsWith("m");
  const root = isMinor ? scaleKey.slice(0, -1) : scaleKey;
  return generateScale(root, isMinor ? "minor" : "major");
}

/**
 * スケールのダイアトニックコードを取得します
 *
 * @param scale - スケールまたはスケールキー
 * @returns ダイアトニックコードの配列
 *
 * @example
 * ```ts
 * getDiatonicChords("C")  // => ["C", "Dm", "Em", "F", "G7", "Am", "Bdim"]
 * getDiatonicChords("Am") // => ["A", "Bdim", "C", "Dm", "Em", "F", "G"]
 * ```
 */
export function getDiatonicChords(scale: Scale | string): string[] {
  const scaleObj = typeof scale === "string" ? generateScaleFromKey(scale) : scale;
  const chordTypes = ["", "m", "m", "", "7", "m", "dim"];
  return scaleObj.notes.map((note, index) => note + chordTypes[index]);
}

/**
 * スケールの音名を取得します
 *
 * @param scaleKey - スケールのキー（例：C, Am, G#m）
 * @returns スケールの音名配列
 * @throws {Error} 無効なスケールキーが指定された場合
 *
 * @example
 * ```ts
 * getScaleNoteNames("C")  // => ["C", "D", "E", "F", "G", "A", "B"]
 * getScaleNoteNames("Am") // => ["A", "B", "C", "D", "E", "F", "G"]
 * ```
 */
export function getScaleNoteNames(scaleKey: string): string[] {
  try {
    const scale = generateScaleFromKey(scaleKey);
    return scale.notes;
  } catch (error) {
    console.error(`無効なスケールキーです: ${scaleKey}`, error);
    return [];
  }
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

/**
 * スケールのテキスト表現を取得します
 *
 * @param scaleKey - スケールのキー（例：C, Am, G#m）
 * @returns スケールのテキスト表現
 *
 * @example
 * ```ts
 * getScaleText("C")  // => "C Major"
 * getScaleText("Am") // => "A Minor"
 * ```
 */
export function getScaleText(scaleKey: string): string {
  if (!scaleKey || typeof scaleKey !== "string") {
    throw new Error("スケールキーは文字列である必要があります");
  }

  const isMinor = scaleKey.endsWith("m");
  const root = isMinor ? scaleKey.slice(0, -1) : scaleKey;
  return `${root} ${isMinor ? "Minor" : "Major"}`;
}
