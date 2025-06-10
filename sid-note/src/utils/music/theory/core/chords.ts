/**
 * コードユーティリティ
 *
 * このモジュールは、コードに関する機能を提供します。
 * コードの解析、コードの正規化、コードの構成音の取得など、
 * コードの基本的な操作に対応します。
 *
 * @module chords
 */

import { getEnharmonicNotes, isValidNote, normalizeNotation } from "./notes";

/**
 * コードの構成音の定義
 */
export interface ChordTone {
  /** 音名 */
  pitch: string;
  /** 音程 */
  interval: string;
  /** 弦番号（1-6） */
  string: number;
  /** フレット番号（0-24） */
  fret: number;
}

export interface ChordFlags {
  isMinor: boolean;
  isDiminished: boolean;
  isAugmented: boolean;
  isSus2: boolean;
  isSus4: boolean;
  hasMaj7: boolean;
  has7: boolean;
  has9: boolean;
  hasAdd9: boolean;
  has11: boolean;
  hasAdd11: boolean;
  has13: boolean;
  hasAdd13: boolean;
  hasFlat9: boolean;
  hasSharp9: boolean;
  hasSharp11: boolean;
  isDim: boolean;
  isAug: boolean;
  has6: boolean;
  hasFlat5: boolean;
  hasSharp5: boolean;
}

/**
 * コード構造の定義
 */
export interface ChordStructure {
  /** ルート音の音程 */
  root: string;
  /** 3度の音程 */
  third: string | null;
  /** 5度の音程 */
  fifth: string | null;
  /** 7度の音程（オプション） */
  seventh?: string | null;
  /** 拡張音の音程（オプション） */
  extensions: string[];
}

/**
 * コード構造の定義マップ
 */
const CHORD_STRUCTURES: Record<string, ChordStructure> = {
  "": { root: "1", third: "3", fifth: "5", extensions: [] },
  "maj7": { root: "1", third: "3", fifth: "5", seventh: "7", extensions: [] },
  "m7": { root: "1", third: "♭3", fifth: "5", seventh: "♭7", extensions: [] },
  "7": { root: "1", third: "3", fifth: "5", seventh: "♭7", extensions: [] },
  "m": { root: "1", third: "♭3", fifth: "5", extensions: [] },
  "dim": { root: "1", third: "♭3", fifth: "♭5", extensions: [] },
  "aug": { root: "1", third: "3", fifth: "♯5", extensions: [] },
  "sus4": { root: "1", third: "4", fifth: "5", extensions: [] },
  "add9": { root: "1", third: "3", fifth: "5", extensions: ["9"] },
  "6": { root: "1", third: "3", fifth: "5", extensions: ["6"] },
  "9": { root: "1", third: "3", fifth: "5", seventh: "♭7", extensions: ["9"] },
  "m_maj7": { root: "1", third: "♭3", fifth: "5", seventh: "7", extensions: [] },
  "m6": { root: "1", third: "♭3", fifth: "5", extensions: ["6"] },
  "m9": { root: "1", third: "♭3", fifth: "5", seventh: "♭7", extensions: ["9"] },
  "M9": { root: "1", third: "3", fifth: "5", seventh: "7", extensions: ["9"] },
  "m_maj9": { root: "1", third: "♭3", fifth: "5", seventh: "7", extensions: ["9"] },
  "sus2": { root: "1", third: "2", fifth: "5", extensions: [] },
  "5": { root: "1", third: "1", fifth: "5", extensions: [] },
  "8": { root: "1", third: "1", fifth: "1", extensions: ["8"] },
};

/**
 * コード名からルート音を抽出します
 *
 * @param chordName - コード名
 * @returns ルート音
 * @throws {Error} 無効なコード名が指定された場合
 *
 * @example
 * ```ts
 * extractRootNote("C")     // => "C"
 * extractRootNote("Cm7")   // => "C"
 * extractRootNote("F#maj7") // => "F#"
 * ```
 */
export function extractRootNote(chordName: string): string {
  if (!chordName || typeof chordName !== "string") {
    throw new Error("コード名は文字列である必要があります");
  }

  const match = /^([A-G][#♯＃b♭]?)/.exec(chordName);
  if (!match) {
    throw new Error(`無効なコード名です: ${chordName}`);
  }

  return normalizeNotation(match[1]);
}

/**
 * コード名からコードタイプを抽出します
 *
 * @param chordName - コード名
 * @returns コードタイプ
 * @throws {Error} 無効なコード名が指定された場合
 *
 * @example
 * ```ts
 * extractChordType("C")     // => ""
 * extractChordType("Cm7")   // => "m7"
 * extractChordType("F#maj7") // => "maj7"
 * ```
 */
export function extractChordType(chordName: string): string {
  if (!chordName || typeof chordName !== "string") {
    throw new Error("コード名は文字列である必要があります");
  }

  const match = /^[A-G][#♯＃b♭]?(.*?)(?:\/|$)/.exec(chordName);
  return match ? match[1] : "";
}

/**
 * コード構造を取得します
 *
 * @param chordType - コードタイプ
 * @returns コード構造
 * @throws {Error} 無効なコードタイプが指定された場合
 *
 * @example
 * ```ts
 * getChordStructure("")     // => { root: "1", third: "3", fifth: "5", extensions: [] }
 * getChordStructure("m7")   // => { root: "1", third: "♭3", fifth: "5", seventh: "♭7", extensions: [] }
 * ```
 */
export function getChordStructure(chordType: string): ChordStructure {
  if (!chordType || typeof chordType !== "string") {
    return { root: "1", third: "3", fifth: "5", seventh: null, extensions: [] };
  }

  const structure = CHORD_STRUCTURES[chordType];
  if (!structure) {
    return { root: "1", third: "3", fifth: "5", seventh: null, extensions: [] };
  }

  return structure;
}

export function parseChordFlags(chordType: string): ChordFlags {
  const flags: ChordFlags = {
    isMinor: false,
    isDiminished: false,
    isAugmented: false,
    isSus2: false,
    isSus4: false,
    hasMaj7: false,
    has7: false,
    has9: false,
    hasAdd9: false,
    has11: false,
    hasAdd11: false,
    has13: false,
    hasAdd13: false,
    hasFlat9: false,
    hasSharp9: false,
    hasSharp11: false,
    isDim: false,
    isAug: false,
    has6: false,
    hasFlat5: false,
    hasSharp5: false,
  };

  if (!chordType) return flags;

  // マイナー
  if (chordType.includes("m")) {
    flags.isMinor = true;
  }

  // ディミニッシュ
  if (chordType.includes("dim") || chordType.includes("°")) {
    flags.isDiminished = true;
    flags.isDim = true;
  }

  // オーギュメント
  if (chordType.includes("aug") || chordType.includes("+")) {
    flags.isAugmented = true;
    flags.isAug = true;
  }

  // サスペンデッド
  if (chordType.includes("sus2")) {
    flags.isSus2 = true;
  }
  if (chordType.includes("sus4")) {
    flags.isSus4 = true;
  }

  // セブンス
  if (chordType.includes("maj7")) {
    flags.hasMaj7 = true;
    flags.has7 = true;
  } else if (chordType.includes("7")) {
    flags.has7 = true;
  }

  // 6th
  if (chordType.includes("6")) {
    flags.has6 = true;
  }

  // フラット5
  if (chordType.includes("b5")) {
    flags.hasFlat5 = true;
  }

  // シャープ5
  if (chordType.includes("#5")) {
    flags.hasSharp5 = true;
  }

  // 9th
  if (chordType.includes("add9")) {
    flags.hasAdd9 = true;
  } else if (chordType.includes("9")) {
    flags.has9 = true;
  }

  // フラット9
  if (chordType.includes("b9")) {
    flags.hasFlat9 = true;
  }

  // シャープ9
  if (chordType.includes("#9")) {
    flags.hasSharp9 = true;
  }

  // 11th
  if (chordType.includes("add11")) {
    flags.hasAdd11 = true;
  } else if (chordType.includes("11")) {
    flags.has11 = true;
  }

  // シャープ11
  if (chordType.includes("#11")) {
    flags.hasSharp11 = true;
  }

  // 13th
  if (chordType.includes("add13")) {
    flags.hasAdd13 = true;
  } else if (chordType.includes("13")) {
    flags.has13 = true;
  }

  return flags;
}

export function createChordStructure(flags: ChordFlags): ChordStructure {
  const structure: ChordStructure = {
    root: "1",
    third: "3",
    fifth: "5",
    seventh: null,
    extensions: [],
  };

  // マイナー
  if (flags.isMinor) {
    structure.third = "♭3";
  }

  // ディミニッシュ
  if (flags.isDiminished) {
    structure.third = "♭3";
    structure.fifth = "♭5";
  }

  // オーギュメント
  if (flags.isAugmented) {
    structure.fifth = "♯5";
  }

  // サスペンデッド
  if (flags.isSus2) {
    structure.third = "2";
  }
  if (flags.isSus4) {
    structure.third = "4";
  }

  // セブンス
  if (flags.hasMaj7) {
    structure.seventh = "7";
  } else if (flags.has7) {
    structure.seventh = "♭7";
  }

  // 6th
  if (flags.has6) {
    structure.extensions.push("6");
  }

  // フラット5
  if (flags.hasFlat5) {
    structure.fifth = "♭5";
  }

  // シャープ5
  if (flags.hasSharp5) {
    structure.fifth = "♯5";
  }

  // 9th
  if (flags.hasAdd9) {
    structure.extensions.push("9");
  } else if (flags.has9) {
    structure.extensions.push("9");
  }

  // フラット9
  if (flags.hasFlat9) {
    structure.extensions.push("♭9");
  }

  // シャープ9
  if (flags.hasSharp9) {
    structure.extensions.push("♯9");
  }

  // 11th
  if (flags.hasAdd11) {
    structure.extensions.push("11");
  } else if (flags.has11) {
    structure.extensions.push("11");
  }

  // シャープ11
  if (flags.hasSharp11) {
    structure.extensions.push("♯11");
  }

  // 13th
  if (flags.hasAdd13) {
    structure.extensions.push("13");
  } else if (flags.has13) {
    structure.extensions.push("13");
  }

  return structure;
}

export function parseChord(chordName: string): { rootNote: string; chordType: string; bassNote?: string } {
  if (!chordName || typeof chordName !== "string") {
    throw new Error("コード名は文字列である必要があります");
  }

  const [mainPart, bassPart] = chordName.split("/");
  const rootNote = extractRootNote(mainPart);
  const chordType = extractChordType(mainPart);
  const bassNote = bassPart ? extractRootNote(bassPart) : undefined;

  return { rootNote, chordType, bassNote };
}

export function extractSlashBass(chordName: string): string | undefined {
  if (!chordName || typeof chordName !== "string") {
    return undefined;
  }

  const parts = chordName.split("/");
  if (parts.length !== 2) {
    return undefined;
  }

  const bassNote = extractRootNote(parts[1]);
  return isValidNote(bassNote) ? bassNote : undefined;
}

export function normalizeAccidental(note: string): string {
  if (!note || typeof note !== "string") {
    return "";
  }

  return normalizeNotation(note);
}

export function normalizePitch(pitch: string): string {
  if (!pitch || typeof pitch !== "string") {
    return "";
  }
  const match = /^([A-G][#♯＃b♭]?)([0-8])$/.exec(pitch);
  if (!match) {
    throw new Error("ピッチにはオクターブを指定する必要があります");
  }
  const [, notePart, octavePart] = match;
  const normalizedNote = normalizeNotation(notePart);
  // 異名同音がある場合は両方返す
  const enharmonics = [normalizedNote, ...getEnharmonicNotes(normalizedNote)].filter(Boolean);
  const uniq = Array.from(new Set(enharmonics));
  return uniq.length > 1 ? `${uniq.join("/")}${octavePart}` : `${normalizedNote}${octavePart}`;
}

export function normalizeInterval(interval: string): string {
  if (!interval || typeof interval !== "string") {
    return "";
  }
  // 例: 3m → ♭3, 7M → 7, 3 → 3
  return interval
    .replace(/3m/g, "♭3")
    .replace(/7m/g, "♭7")
    .replace(/b/g, "♭")
    .replace(/#/g, "＃")
    .replace(/♯/g, "＃");
}

export class Chord {
  private rootNote: string;
  private chordType: string;

  constructor(rootNote: string, chordType: string = '') {
    if (!isValidNote(rootNote)) {
      throw new Error(`Invalid root note: ${rootNote}`);
    }
    this.rootNote = normalizeNotation(rootNote);
    this.chordType = chordType;
  }

  toString(): string {
    return this.rootNote + this.chordType;
  }

  equals(other: Chord): boolean {
    return this.toString() === other.toString();
  }
}
