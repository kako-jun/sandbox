/**
 * スケールユーティリティ
 *
 * このモジュールは、スケールに関する機能を提供します。
 * スケールの生成、スケールの分析、スケールの変換など、
 * スケールの基本的な操作に対応します。
 *
 * @module scales
 */

import { getNoteFromIndex, getNoteIndex, isValidNote, normalizeNotation } from "./notes";

/**
 * スケールの定義
 */
export interface ScaleInfo {
  /** スケールの音名配列 */
  notes: string[];
  /** ルート音 */
  root: string;
  /** スケールのタイプ */
  type: ScaleType;
}

export type ScaleType =
  | "major"
  | "minor"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian"
  | "locrian"
  | "harmonic"
  | "melodic";

/**
 * スケールのパターン定義
 */
const SCALE_PATTERNS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  harmonic: [0, 2, 3, 5, 7, 8, 11],
  melodic: [0, 2, 3, 5, 7, 9, 11],
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
export function generateScale(root: string, type: ScaleType): ScaleInfo {
  if (!root || typeof root !== "string") {
    throw new Error("ルート音は文字列である必要があります");
  }

  if (!type || !(type in SCALE_PATTERNS)) {
    throw new Error(`無効なスケールタイプです: ${type}`);
  }

  const pattern = SCALE_PATTERNS[type];
  const rootIndex = getNoteIndex(root);
  const notes = pattern.map((interval) => {
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
export function generateScaleFromKey(scaleKey: string): ScaleInfo {
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
export function getDiatonicChords(scale: ScaleInfo | string): string[] {
  const scaleObj = typeof scale === "string" ? generateScaleFromKey(scale) : scale;
  const chordTypes = ["", "m", "m", "", "7", "m", "dim"];
  return scaleObj.notes.map((note, index) => note + chordTypes[index]);
}

/**
 * スケールの音名を取得します
 *
 * @param scaleKey - スケールのキー（例：C, Am, G#m）
 * @returns スケールの音名配列
 *
 * @example
 * ```ts
 * getScaleNoteNames("C")  // => ["C", "D", "E", "F", "G", "A", "B"]
 * getScaleNoteNames("Am") // => ["A", "B", "C", "D", "E", "F", "G"]
 * ```
 */
export function getScaleNoteNames(scaleKey: string): string[];
export function getScaleNoteNames(root: string, type: string): string[];
export function getScaleNoteNames(arg1: string, arg2?: string): string[] {
  let root: string;
  let isMinor: boolean;
  if (typeof arg2 === "string") {
    root = arg1;
    isMinor = arg2 === "minor";
  } else {
    isMinor = arg1.endsWith("m");
    root = isMinor ? arg1.slice(0, -1) : arg1;
  }
  if (!isValidNote(root)) return [];
  const rootIndex = getNoteIndex(root);
  if (rootIndex === null) return [];
  const intervals = isMinor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  return intervals.map((interval) => getNoteFromIndex(rootIndex + interval));
}

// function getSharpNote(index: number): string {
//   const sharpNotes = ["C", "C＃", "D", "D＃", "E", "F", "F＃", "G", "G＃", "A", "A＃", "B"];
//   return sharpNotes[index];
// }

// function getFlatNote(index: number): string {
//   const flatNotes = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
//   return flatNotes[index];
// }

/**
 * スケールのテキスト表現を取得します
 *
 * @param scaleKey - スケールのキー（例：C, Am, G#m）
 * @returns スケールのテキスト表現
 *
 * @example
 * ```ts
 * getScaleText("C")  // => "Cメジャー"
 * getScaleText("Am") // => "Aマイナー"
 * ```
 */
export function getScaleText(scaleKey: string): string;
export function getScaleText(root: string, type: string): string;
export function getScaleText(arg1: string, arg2?: string): string {
  let root: string;
  let isMinor: boolean;
  if (typeof arg2 === "string") {
    root = arg1;
    isMinor = arg2 === "minor";
  } else {
    isMinor = arg1.endsWith("m");
    root = isMinor ? arg1.slice(0, -1) : arg1;
  }
  if (!isValidNote(root)) return "";
  return `${root}${isMinor ? "マイナー" : "メジャー"}`;
}

export function getScaleType(scale: string): ScaleType {
  if (!scale || typeof scale !== "string") {
    return "major";
  }

  if (scale.endsWith("m")) {
    return "minor";
  }

  return "major";
}

export function getScaleRoot(scale: string): string {
  if (!scale || typeof scale !== "string") {
    return "";
  }

  const root = scale.endsWith("m") ? scale.slice(0, -1) : scale;
  return isValidNote(root) ? root : "";
}

export function getScaleNotes(scale: string): string[] {
  const root = getScaleRoot(scale);
  const type = getScaleType(scale);
  return getScaleNoteNames(root, type);
}

export function getScaleChords(scale: string): string[] {
  const root = getScaleRoot(scale);
  const type = getScaleType(scale);
  return getScaleDiatonicChords(root, type);
}

export function getScaleChordsWith7th(scale: string): string[] {
  const root = getScaleRoot(scale);
  const type = getScaleType(scale);
  return getScaleDiatonicChordsWith7th(root, type);
}

export function getScaleTextFromString(scale: string): string {
  const root = getScaleRoot(scale);
  const type = getScaleType(scale);
  return getScaleText(root, type);
}

/**
 * スケールのダイアトニックコードを取得します
 *
 * @param scaleKey - スケールのキー（例：C, Am, G#m）
 * @returns ダイアトニックコードの配列
 *
 * @example
 * ```ts
 * getScaleDiatonicChords("C")  // => ["C", "Dm", "Em", "F", "G", "Am", "Bdim"]
 * getScaleDiatonicChords("Am") // => ["Am", "Bdim", "C", "Dm", "Em", "F", "G"]
 * ```
 */
export function getScaleDiatonicChords(scaleKey: string): string[];
export function getScaleDiatonicChords(root: string, type: string): string[];
export function getScaleDiatonicChords(arg1: string, arg2?: string): string[] {
  let root: string;
  let isMinor: boolean;
  if (typeof arg2 === "string") {
    root = arg1;
    isMinor = arg2 === "minor";
  } else {
    isMinor = arg1.endsWith("m");
    root = isMinor ? arg1.slice(0, -1) : arg1;
  }
  if (!isValidNote(root)) return [];
  const rootIndex = getNoteIndex(root);
  if (rootIndex === null) return [];
  const intervals = isMinor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const qualities = isMinor ? ["m", "dim", "", "m", "m", "", ""] : ["", "m", "m", "", "", "m", "dim"];
  return intervals.map((interval, i) => getNoteFromIndex(rootIndex + interval) + qualities[i]);
}

/**
 * スケールのダイアトニック7thコードを取得します
 *
 * @param scaleKey - スケールのキー（例：C, Am, G#m）
 * @returns ダイアトニック7thコードの配列
 *
 * @example
 * ```ts
 * getScaleDiatonicChordsWith7th("C")  // => ["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7b5"]
 * getScaleDiatonicChordsWith7th("Am") // => ["Am7", "Bm7b5", "Cmaj7", "Dm7", "Em7", "Fmaj7", "G7"]
 * ```
 */
export function getScaleDiatonicChordsWith7th(scaleKey: string): string[];
export function getScaleDiatonicChordsWith7th(root: string, type: string): string[];
export function getScaleDiatonicChordsWith7th(arg1: string, arg2?: string): string[] {
  let root: string;
  let isMinor: boolean;
  if (typeof arg2 === "string") {
    root = arg1;
    isMinor = arg2 === "minor";
  } else {
    isMinor = arg1.endsWith("m");
    root = isMinor ? arg1.slice(0, -1) : arg1;
  }
  if (!isValidNote(root)) return [];
  const rootIndex = getNoteIndex(root);
  if (rootIndex === null) return [];
  const intervals = isMinor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const qualities = isMinor
    ? ["m7", "m7b5", "maj7", "m7", "m7", "maj7", "7"]
    : ["maj7", "m7", "m7", "maj7", "7", "m7", "m7b5"];
  return intervals.map((interval, i) => getNoteFromIndex(rootIndex + interval) + qualities[i]);
}

export class Scale {
  private readonly root: string;
  private readonly type: ScaleType;
  private readonly notes: string[];

  constructor(root: string, type: ScaleType) {
    if (!isValidNote(root)) {
      throw new Error(`Invalid root note: ${root}`);
    }
    this.root = normalizeNotation(root);
    this.type = type;
    const scaleInfo = generateScale(this.root, this.type);
    this.notes = scaleInfo.notes;
  }

  getNotes(): string[] {
    return this.notes;
  }

  getType(): ScaleType {
    return this.type;
  }

  toString(): string {
    return this.root + (this.type === "minor" ? "m" : "");
  }
}
