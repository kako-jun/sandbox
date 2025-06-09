/**
 * 音楽理論の基本となる音程のコアモジュール
 * 音程の計算、判定、表示に関する機能を提供します。
 */

import { getNoteIndex } from "./notes";

/**
 * 音程の定義
 */
export interface IntervalDefinition {
  /** 音程の種類（完全、長、短、増、減） */
  quality: "perfect" | "major" | "minor" | "augmented" | "diminished";
  /** 音程の度数（1-8） */
  degree: number;
  /** 半音数 */
  semitones: number;
  /** 表示名 */
  displayName: string;
}

/**
 * 音程の定義マッピング
 */
export const INTERVAL_DEFINITIONS: Record<string, IntervalDefinition> = {
  "P1": { quality: "perfect", degree: 1, semitones: 0, displayName: "完全1度" },
  "m2": { quality: "minor", degree: 2, semitones: 1, displayName: "短2度" },
  "M2": { quality: "major", degree: 2, semitones: 2, displayName: "長2度" },
  "m3": { quality: "minor", degree: 3, semitones: 3, displayName: "短3度" },
  "M3": { quality: "major", degree: 3, semitones: 4, displayName: "長3度" },
  "P4": { quality: "perfect", degree: 4, semitones: 5, displayName: "完全4度" },
  "P5": { quality: "perfect", degree: 5, semitones: 7, displayName: "完全5度" },
  "m6": { quality: "minor", degree: 6, semitones: 8, displayName: "短6度" },
  "M6": { quality: "major", degree: 6, semitones: 9, displayName: "長6度" },
  "m7": { quality: "minor", degree: 7, semitones: 10, displayName: "短7度" },
  "M7": { quality: "major", degree: 7, semitones: 11, displayName: "長7度" },
  "P8": { quality: "perfect", degree: 8, semitones: 12, displayName: "完全8度" },
  "A1": { quality: "augmented", degree: 1, semitones: 1, displayName: "増1度" },
  "d2": { quality: "diminished", degree: 2, semitones: 0, displayName: "減2度" },
  "A2": { quality: "augmented", degree: 2, semitones: 3, displayName: "増2度" },
  "d3": { quality: "diminished", degree: 3, semitones: 2, displayName: "減3度" },
  "A3": { quality: "augmented", degree: 3, semitones: 5, displayName: "増3度" },
  "d4": { quality: "diminished", degree: 4, semitones: 4, displayName: "減4度" },
  "A4": { quality: "augmented", degree: 4, semitones: 6, displayName: "増4度" },
  "d5": { quality: "diminished", degree: 5, semitones: 6, displayName: "減5度" },
  "A5": { quality: "augmented", degree: 5, semitones: 8, displayName: "増5度" },
  "d6": { quality: "diminished", degree: 6, semitones: 7, displayName: "減6度" },
  "A6": { quality: "augmented", degree: 6, semitones: 10, displayName: "増6度" },
  "d7": { quality: "diminished", degree: 7, semitones: 9, displayName: "減7度" },
  "A7": { quality: "augmented", degree: 7, semitones: 12, displayName: "増7度" },
  "d8": { quality: "diminished", degree: 8, semitones: 11, displayName: "減8度" },
  "A8": { quality: "augmented", degree: 8, semitones: 13, displayName: "増8度" }
};

/**
 * 2つの音の間の半音数を計算します
 * 
 * @param note1 - 1つ目の音名
 * @param note2 - 2つ目の音名
 * @returns 半音数（正の値は上向き、負の値は下向き）
 * @throws {Error} 無効な音名が指定された場合
 * 
 * @example
 * ```ts
 * getHalfStepDistance("C", "E")  // => 4
 * getHalfStepDistance("E", "C")  // => -4
 * ```
 */
export function getHalfStepDistance(note1: string, note2: string): number {
  if (!note1 || !note2 || typeof note1 !== "string" || typeof note2 !== "string") {
    throw new Error("音名は文字列である必要があります");
  }

  const index1 = getNoteIndex(note1);
  const index2 = getNoteIndex(note2);
  return index2 - index1;
}

/**
 * 音程の名前を取得します
 * 
 * @param semitones - 半音数
 * @param degree - 音程の度数（1-8）
 * @returns 音程の名前（例：M3, P5）
 * @throws {Error} 無効な半音数または度数が指定された場合
 * 
 * @example
 * ```ts
 * getIntervalName(4, 3)  // => "M3"
 * getIntervalName(7, 5)  // => "P5"
 * ```
 */
export function getIntervalName(semitones: number, degree: number): string {
  if (typeof semitones !== "number" || typeof degree !== "number") {
    throw new Error("半音数と度数は数値である必要があります");
  }

  if (degree < 1 || degree > 8) {
    throw new Error(`無効な度数です: ${degree}（1-8の範囲で指定してください）`);
  }

  // 音程の種類を判定
  let quality: "perfect" | "major" | "minor" | "augmented" | "diminished";
  if ([0, 5, 7, 12].includes(semitones)) {
    quality = "perfect";
  } else if ([2, 4, 9, 11].includes(semitones)) {
    quality = "major";
  } else if ([1, 3, 8, 10].includes(semitones)) {
    quality = "minor";
  } else if (semitones > 12) {
    quality = "augmented";
  } else {
    quality = "diminished";
  }

  // 音程の記号を生成
  const qualitySymbol = {
    perfect: "P",
    major: "M",
    minor: "m",
    augmented: "A",
    diminished: "d"
  }[quality];

  return `${qualitySymbol}${degree}`;
}

/**
 * 2つの音の間の音程を取得します
 * 
 * @param note1 - 1つ目の音名
 * @param note2 - 2つ目の音名
 * @returns 音程の定義
 * @throws {Error} 無効な音名が指定された場合
 * 
 * @example
 * ```ts
 * getInterval("C", "E")  // => { quality: "major", degree: 3, semitones: 4, displayName: "長3度" }
 * getInterval("C", "G")  // => { quality: "perfect", degree: 5, semitones: 7, displayName: "完全5度" }
 * ```
 */
export function getInterval(note1: string, note2: string): IntervalDefinition {
  if (!note1 || typeof note1 !== "string") {
    throw new Error("1つ目の音名は文字列である必要があります");
  }

  if (!note2 || typeof note2 !== "string") {
    throw new Error("2つ目の音名は文字列である必要があります");
  }

  const index1 = getNoteIndex(note1);
  const index2 = getNoteIndex(note2);

  const semitones = (index2 - index1 + 12) % 12;
  const degree = Math.abs(index2 - index1) % 7 + 1;

  const intervalKey = getIntervalKey(degree, semitones);
  const definition = INTERVAL_DEFINITIONS[intervalKey];

  if (!definition) {
    throw new Error(`無効な音程です: ${note1}から${note2}`);
  }

  return definition;
}

/**
 * 音程のキーを取得します
 * 
 * @param degree - 音程の度数（1-8）
 * @param semitones - 音程の半音数（0-12）
 * @returns 音程のキー（例: "M3", "P5"）
 * @throws {Error} 無効な度数や半音数が指定された場合
 * 
 * @example
 * ```ts
 * getIntervalKey(3, 4)  // => "M3"
 * getIntervalKey(5, 7)  // => "P5"
 * ```
 */
function getIntervalKey(degree: number, semitones: number): string {
  if (degree < 1 || degree > 8) {
    throw new Error(`無効な度数です: ${degree}`);
  }

  if (semitones < 0 || semitones > 12) {
    throw new Error(`無効な半音数です: ${semitones}`);
  }

  const perfectIntervals = [0, 5, 7, 12]; // 完全音程の半音数
  const isPerfect = perfectIntervals.includes(semitones);

  if (isPerfect) {
    return `P${degree}`;
  }

  const majorIntervals = [2, 4, 9, 11]; // 長音程の半音数
  const isMajor = majorIntervals.includes(semitones);

  return isMajor ? `M${degree}` : `m${degree}`;
}

/**
 * 2つの音が半音階関係にあるかどうかを判定します
 * 
 * @param note1 - 1つ目の音名
 * @param note2 - 2つ目の音名
 * @returns 半音階関係の場合はtrue、それ以外はfalse
 * @throws {Error} 無効な音名が指定された場合
 * 
 * @example
 * ```ts
 * isChromatic("C", "C＃")  // => true
 * isChromatic("C", "D")    // => false
 * ```
 */
export function isChromatic(note1: string, note2: string): boolean {
  if (!note1 || !note2 || typeof note1 !== "string" || typeof note2 !== "string") {
    throw new Error("音名は文字列である必要があります");
  }

  const semitones = Math.abs(getHalfStepDistance(note1, note2));
  return semitones === 1;
}
