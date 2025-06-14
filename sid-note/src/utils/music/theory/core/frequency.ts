/**
 * 音楽理論の基本となる周波数計算のコアモジュール
 * 音名とオクターブから周波数を計算する機能を提供します。
 */

import { getEnharmonicNotes, normalizeNotation } from "./notes";

/**
 * 音名の型定義
 */
export type NoteName = "C" | "C＃" | "D" | "D＃" | "E" | "F" | "F＃" | "G" | "G＃" | "A" | "A＃" | "B" |
                      "D♭" | "E♭" | "G♭" | "A♭" | "B♭";

/**
 * 基準となる音の周波数マッピング
 * 各音の基準周波数（オクターブ4の周波数）
 */
export const BASE_FREQUENCIES: Record<NoteName, number> = {
  "C": 261.63,  // C4
  "C＃": 277.18, "D♭": 277.18,
  "D": 293.66,
  "D＃": 311.13, "E♭": 311.13,
  "E": 329.63,
  "F": 349.23,
  "F＃": 369.99, "G♭": 369.99,
  "G": 392.00,
  "G＃": 415.30, "A♭": 415.30,
  "A": 440.00,
  "A＃": 466.16, "B♭": 466.16,
  "B": 493.88
};

/**
 * 音名とオクターブから周波数を計算します
 *
 * @param note - 音名（例：C, C＃, B♭）
 * @param octave - オクターブ（0-8）
 * @returns 計算された周波数（Hz）
 * @throws {Error} 無効な音名またはオクターブが指定された場合
 *
 * @example
 * ```ts
 * calculateFrequency("C", 4)   // => 261.63
 * calculateFrequency("A", 4)   // => 440.00
 * calculateFrequency("C＃", 4)  // => 277.18
 * ```
 */
export function calculateFrequency(note: string, octave: number): number | null {
  if (!note || typeof note !== "string") {
    return null;
  }
  if (typeof octave !== "number" || octave < 0 || octave > 8) {
    return null;
  }
  const normalizedNote = normalizeNotation(note) as NoteName;
  if (normalizedNote in BASE_FREQUENCIES) {
    const baseFrequency = BASE_FREQUENCIES[normalizedNote];
    const octaveDifference = octave - 4;
    return Math.round(baseFrequency * Math.pow(2, octaveDifference) * 100) / 100;
  }
  // 異名同音を探索
  const enharmonics = getEnharmonicNotes(normalizedNote);
  for (const enh of enharmonics) {
    if (enh in BASE_FREQUENCIES) {
      const baseFrequency = BASE_FREQUENCIES[enh as NoteName];
      const octaveDifference = octave - 4;
      return Math.round(baseFrequency * Math.pow(2, octaveDifference) * 100) / 100;
    }
  }
  return null;
}
