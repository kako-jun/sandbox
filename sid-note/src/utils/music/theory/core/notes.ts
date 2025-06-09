/**
 * 音楽理論の基本となる音名処理のコアモジュール
 * 音名の正規化、解析、比較などの基本機能を提供します。
 */

/**
 * 音名ユーティリティ
 * 
 * このモジュールは、音名に関する機能を提供します。
 * 音名の正規化、音名の検証、音名の変換など、
 * 音名の基本的な操作に対応します。
 * 
 * @module notes
 */

/**
 * 音名の定義
 */
export type NoteName = "C" | "D" | "E" | "F" | "G" | "A" | "B";

/**
 * 変化記号の定義
 */
export type Accidental = "♯" | "♭" | "";

/**
 * 音名の正規化マップ
 */
const NOTE_NORMALIZATION_MAP: Record<string, string> = {
  "C#": "C♯", "Db": "D♭", "D#": "D♯", "Eb": "E♭",
  "E#": "E♯", "Fb": "F♭", "F#": "F♯", "Gb": "G♭",
  "G#": "G♯", "Ab": "A♭", "A#": "A♯", "Bb": "B♭",
  "B#": "B♯", "Cb": "C♭"
};

/**
 * 音名の正規化マップ（逆方向）
 */
const REVERSE_NOTE_NORMALIZATION_MAP: Record<string, string> = {
  "C♯": "C#", "D♭": "Db", "D♯": "D#", "E♭": "Eb",
  "E♯": "E#", "F♭": "Fb", "F♯": "F#", "G♭": "Gb",
  "G♯": "G#", "A♭": "Ab", "A♯": "A#", "B♭": "Bb",
  "B♯": "B#", "C♭": "Cb"
};

/**
 * 音名を正規化します
 * 
 * @param note - 正規化する音名
 * @returns 正規化された音名
 * @throws {Error} 無効な音名が指定された場合
 * 
 * @example
 * ```ts
 * normalizeNotation("C#")  // => "C♯"
 * normalizeNotation("Db")  // => "D♭"
 * ```
 */
export function normalizeNotation(note: string): string {
  if (!note || typeof note !== "string") {
    throw new Error("音名は文字列である必要があります");
  }

  const normalized = NOTE_NORMALIZATION_MAP[note];
  if (!normalized) {
    throw new Error(`無効な音名です: ${note}`);
  }

  return normalized;
}

/**
 * 音名が有効かどうかを判定します
 * 
 * @param note - 判定する音名
 * @returns 有効な場合はtrue、そうでない場合はfalse
 * 
 * @example
 * ```ts
 * isValidNoteName("C#")  // => true
 * isValidNoteName("H")   // => false
 * ```
 */
export function isValidNoteName(note: string): boolean {
  if (!note || typeof note !== "string") {
    return false;
  }

  return note in NOTE_NORMALIZATION_MAP;
}

/**
 * 音名のインデックスを取得します
 * 
 * @param note - 音名
 * @returns 音名のインデックス（0-11）
 * @throws {Error} 無効な音名が指定された場合
 * 
 * @example
 * ```ts
 * getNoteIndex("C")  // => 0
 * getNoteIndex("C#") // => 1
 * ```
 */
export function getNoteIndex(note: string): number {
  if (!note || typeof note !== "string") {
    throw new Error("音名は文字列である必要があります");
  }

  const normalized = normalizeNotation(note);
  const baseNote = normalized[0];
  const accidental = normalized.slice(1);

  const baseIndex = "CDEFGAB".indexOf(baseNote);
  if (baseIndex === -1) {
    throw new Error(`無効な音名です: ${note}`);
  }

  const accidentalOffset = accidental === "♯" ? 1 : accidental === "♭" ? -1 : 0;
  return (baseIndex + accidentalOffset + 12) % 12;
}

/**
 * 音名を英語表記に変換します
 * 
 * @param note - 変換する音名
 * @returns 英語表記の音名
 * @throws {Error} 無効な音名が指定された場合
 * 
 * @example
 * ```ts
 * toEnglishNotation("C♯")  // => "C#"
 * toEnglishNotation("D♭")  // => "Db"
 * ```
 */
export function toEnglishNotation(note: string): string {
  if (!note || typeof note !== "string") {
    throw new Error("音名は文字列である必要があります");
  }

  const english = REVERSE_NOTE_NORMALIZATION_MAP[note];
  if (!english) {
    throw new Error(`無効な音名です: ${note}`);
  }

  return english;
}

/**
 * ピッチ情報の型定義
 */
export interface PitchInfo {
  /** 音名（例：C, C＃, B♭） */
  note: string;
  /** オクターブ（0-8） */
  octave: number;
}

/**
 * 調号の位置情報の型定義
 */
export interface KeyPosition {
  /** 調号の位置（外側、内側、なし） */
  circle: "outer" | "inner" | "none";
  /** 調号のインデックス */
  index: number;
}

/**
 * 基本音名の配列
 */
export const BASIC_NOTES: readonly NoteName[] = ["C", "D", "E", "F", "G", "A", "B"];

/**
 * クロマティック音名の定義
 */
const CHROMATIC_NOTES: Record<string, string[]> = {
  "sharp": ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  "flat": ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
};

/**
 * 指定された音名が有効な音名かどうかを判定します（オクターブなし）
 * 
 * @param note - 判定する音名
 * @returns 有効な音名の場合はtrue、それ以外はfalse
 * 
 * @example
 * ```ts
 * isValidNote("C")    // => true
 * isValidNote("C4")   // => false
 * isValidNote("H")    // => false
 * ```
 */
export function isValidNote(note: string): boolean {
  if (!note || typeof note !== "string") {
    return false;
  }
  return isValidNoteName(note) && !/\d/.test(note);
}

/**
 * 指定されたピッチが有効な音楽的ピッチかどうかを判定します
 * 
 * @param pitch - 判定するピッチ（例：C4, F#3, Bb5）
 * @returns 有効なピッチの場合はtrue、それ以外はfalse
 * 
 * @example
 * ```ts
 * isValidPitch("C4")   // => true
 * isValidPitch("F#3")  // => true
 * isValidPitch("H4")   // => false
 * ```
 */
export function isValidPitch(pitch: string): boolean {
  if (!pitch || typeof pitch !== "string") {
    return false;
  }
  const parsed = parsePitch(pitch);
  return parsed !== null;
}

/**
 * ピッチ文字列を解析します
 * 
 * @param pitch - 解析するピッチ文字列
 * @returns 解析結果のPitchInfo、無効な場合はnull
 * @throws {Error} 無効なピッチが指定された場合
 * 
 * @example
 * ```ts
 * parsePitch("C4")   // => { note: "C", octave: 4 }
 * parsePitch("F#3")  // => { note: "F＃", octave: 3 }
 * ```
 */
export function parsePitch(pitch: string): PitchInfo {
  if (!pitch || typeof pitch !== "string") {
    throw new Error("ピッチは文字列である必要があります");
  }

  // ピッチ文字列から音名部分とオクターブ部分を抽出
  const match = /^([A-G][#♯＃b♭]?)([0-8])$/.exec(pitch.trim());
  if (!match) {
    throw new Error(`無効なピッチです: ${pitch}`);
  }

  const [, notePart, octavePart] = match;
  const normalizedNote = normalizeNotation(notePart);
  const parsedOctave = parseInt(octavePart, 10);

  if (parsedOctave < 0 || parsedOctave > 8) {
    throw new Error(`無効なオクターブです: ${octavePart}（0-8の範囲で指定してください）`);
  }

  return { note: normalizedNote, octave: parsedOctave };
}

/**
 * インデックスから音名を取得します
 * 
 * @param index - インデックス（0-11）
 * @param useFlat - フラット表記を使用するかどうか
 * @returns 音名
 * @throws {Error} 無効なインデックスが指定された場合
 * 
 * @example
 * ```ts
 * getNoteFromIndex(0)  // => "C"
 * getNoteFromIndex(1)  // => "C#"
 * getNoteFromIndex(1, true)  // => "Db"
 * ```
 */
export function getNoteFromIndex(index: number, useFlat: boolean = false): string {
  if (index < 0 || index > 11) {
    throw new Error(`無効なインデックスです: ${index}`);
  }

  return CHROMATIC_NOTES[useFlat ? "flat" : "sharp"][index];
}

/**
 * 2つのピッチを比較します
 * 
 * @param pitch1 - 比較するピッチ1
 * @param pitch2 - 比較するピッチ2
 * @returns 同じピッチの場合はtrue、それ以外はfalse
 * @throws {Error} 無効なピッチが指定された場合
 * 
 * @example
 * ```ts
 * comparePitch("C4", "C4")   // => true
 * comparePitch("C4", "C#4")  // => false
 * ```
 */
export function comparePitch(pitch1: string, pitch2: string): boolean {
  const parsed1 = parsePitch(pitch1);
  const parsed2 = parsePitch(pitch2);
  return parsed1.note === parsed2.note && parsed1.octave === parsed2.octave;
}

/**
 * 2つの音名を比較します
 * 
 * @param note1 - 比較する音名1
 * @param note2 - 比較する音名2
 * @returns 同じ音名の場合はtrue、それ以外はfalse
 * @throws {Error} 無効な音名が指定された場合
 * 
 * @example
 * ```ts
 * compareNotes("C", "C")    // => true
 * compareNotes("C#", "Db")  // => false
 * ```
 */
export function compareNotes(note1: string, note2: string): boolean {
  const normalized1 = normalizeNotation(note1);
  const normalized2 = normalizeNotation(note2);
  return normalized1 === normalized2;
}

/**
 * 異名同音の音名を取得します
 * 
 * @param noteName - 音名（例：C＃, D♭）
 * @returns 異名同音の音名の配列
 * @throws {Error} 無効な音名が指定された場合
 * 
 * @example
 * ```ts
 * getEnharmonicNotes("C＃")  // => ["D♭"]
 * getEnharmonicNotes("D♭")   // => ["C＃"]
 * ```
 */
export function getEnharmonicNotes(noteName: string): string[] {
  const normalizedInput = normalizeNotation(noteName);
  const index = getNoteIndex(normalizedInput);

  const candidates = [CHROMATIC_NOTES.sharp[index], CHROMATIC_NOTES.flat[index]].filter(
    (n, i, arr) => arr.indexOf(n) === i
  );

  const enharmonics = candidates.filter((note) => note !== normalizedInput);
  return enharmonics.length === 0 ? [normalizedInput] : enharmonics;
}

/**
 * デフォルトのオクターブを追加します
 * 
 * @param pitch - ピッチ文字列
 * @param defaultOctave - デフォルトのオクターブ（デフォルト: 4）
 * @returns オクターブが追加されたピッチ文字列
 * @throws {Error} 無効なピッチが指定された場合
 * 
 * @example
 * ```ts
 * addDefaultOctave("C")     // => "C4"
 * addDefaultOctave("C", 3)  // => "C3"
 * ```
 */
export function addDefaultOctave(pitch: string, defaultOctave = 4): string {
  if (!pitch || typeof pitch !== "string") {
    throw new Error("ピッチは文字列である必要があります");
  }

  if (/\d$/.test(pitch)) {
    return pitch;
  }

  if (!isValidNote(pitch)) {
    throw new Error(`無効な音名です: ${pitch}`);
  }

  return `${pitch}${defaultOctave}`;
}

/**
 * 調号の位置情報を取得します
 * 
 * @param scale - スケールのキー（例：C, Am, G#m）
 * @returns 調号の位置情報
 * @throws {Error} 無効なスケールが指定された場合
 * 
 * @example
 * ```ts
 * getKeyPosition("C")   // => { circle: "none", index: 0 }
 * getKeyPosition("Am")  // => { circle: "inner", index: 0 }
 * ```
 */
export function getKeyPosition(scale: string): KeyPosition {
  if (!scale || typeof scale !== "string") {
    throw new Error("スケールは文字列である必要があります");
  }

  const isMinor = scale.endsWith("m");
  const root = isMinor ? scale.slice(0, -1) : scale;

  if (!isValidNote(root)) {
    throw new Error(`無効なスケールです: ${scale}`);
  }

  const index = getNoteIndex(root);
  const circle = isMinor ? "inner" : "outer";

  return { circle, index };
}
