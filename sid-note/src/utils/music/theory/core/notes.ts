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
    return "";
  }

  // 基本音名はそのまま返す
  if (BASIC_NOTES.includes(note as NoteName)) {
    return note;
  }

  // シャープとフラットの正規化（core内では＃と♭に統一）
  const normalized = note
    .replace(/[#♯]/g, "＃")
    .replace(/[b♭]/g, "♭");

  // 正規化された音名が有効かチェック（直接パターンマッチング）
  const pattern = /^[A-G][＃♭]$/;
  if (!pattern.test(normalized)) {
    return "";
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

  // 基本音名のチェック
  if (BASIC_NOTES.includes(note as NoteName)) {
    return true;
  }

  // シャープとフラットの音名のチェック（正規化後の＃と♭のみ）
  const pattern = /^[A-G][＃♭]$/;
  return pattern.test(note);
}

/**
 * 音名のインデックスを取得します
 *
 * @param note - 音名
 * @returns 音名のインデックス（0-11）、無効な音名の場合は-1
 *
 * @example
 * ```ts
 * getNoteIndex("C")  // => 0
 * getNoteIndex("C#") // => 1
 * getNoteIndex("H")  // => -1
 * ```
 */
export function getNoteIndex(note: string): number {
  if (!note || typeof note !== "string") {
    return -1;
  }

  const normalized = normalizeNotation(note);
  if (!normalized) {
    return -1;
  }

  const baseNote = normalized[0];
  const accidental = normalized.slice(1);

  const baseIndex = "CDEFGAB".indexOf(baseNote);
  if (baseIndex === -1) {
    return -1;
  }

  // C=0, D=2, E=4, F=5, G=7, A=9, B=11 のマッピング
  const chromaticMap = [0, 2, 4, 5, 7, 9, 11];
  const chromaticIndex = chromaticMap[baseIndex];

  const accidentalOffset = accidental === "＃" ? 1 : accidental === "♭" ? -1 : 0;
  return (chromaticIndex + accidentalOffset + 12) % 12;
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
  // 正規化してからチェック
  const normalized = normalizeNotation(note);
  return normalized !== "" && !/\d/.test(note);
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
export function parsePitch(pitch: string): PitchInfo | null {
  if (!pitch || typeof pitch !== "string") {
    return null;
  }

  const match = /^([A-G][#♯＃b♭]?)([0-8])$/.exec(pitch);
  if (!match) {
    return null;
  }

  const [, notePart, octavePart] = match;
  const normalizedNote = normalizeNotation(notePart);
  const octave = parseInt(octavePart, 10);

  if (!normalizedNote || octave < 0 || octave > 8) {
    return null;
  }

  return { note: normalizedNote, octave };
}

/**
 * インデックスから音名を取得します
 *
 * @param index - 音名のインデックス（0-11）
 * @param useFlat - フラット表記を使用するかどうか（デフォルト: false）
 * @returns 音名
 *
 * @example
 * ```ts
 * getNoteFromIndex(0)      // => "C"
 * getNoteFromIndex(1)      // => "C＃"
 * getNoteFromIndex(1, true) // => "D♭"
 * getNoteFromIndex(-1)     // => "B"
 * ```
 */
export function getNoteFromIndex(index: number, useFlat: boolean = false): string {
  const notes = useFlat ? ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"] :
    ["C", "C＃", "D", "D＃", "E", "F", "F＃", "G", "G＃", "A", "A＃", "B"];
  return notes[index % 12];
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

  if (!parsed1 || !parsed2) {
    return false;
  }

  return compareNotes(parsed1.note, parsed2.note) && parsed1.octave === parsed2.octave;
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
  if (!note1 || !note2) {
    return false;
  }

  const index1 = getNoteIndex(note1);
  const index2 = getNoteIndex(note2);

  return index1 === index2;
}

/**
 * 異名同音を取得します
 *
 * @param note - 音名
 * @returns 異名同音の配列、異名同音がない場合は元の音名のみを含む配列
 *
 * @example
 * ```ts
 * getEnharmonicNotes("C＃")  // => ["D♭"]
 * getEnharmonicNotes("C")    // => ["C"]
 * ```
 */
export function getEnharmonicNotes(note: string): string[] {
  if (!note || typeof note !== "string") {
    return [];
  }

  const normalized = normalizeNotation(note);
  if (!normalized) {
    return [];
  }

  // 基本音名の場合は異名同音なし
  if (BASIC_NOTES.includes(normalized as NoteName)) {
    return [normalized];
  }

  // シャープとフラットの異名同音を取得
  const index = getNoteIndex(normalized);
  if (index === -1) {
    return [];
  }

  const sharpNote = getNoteFromIndex(index, false);
  const flatNote = getNoteFromIndex(index, true);

  if (sharpNote === normalized) {
    return [normalized, flatNote];
  } else {
    return [normalized, sharpNote];
  }
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
    throw new Error(`無効なピッチです: ${pitch}`);
  }

  return pitch + defaultOctave.toString();
}

/**
 * 調のキー位置を取得します
 *
 * @param scale - 調名（例：C, Am, F#, Dm）
 * @returns キー位置情報
 *
 * @example
 * ```ts
 * getKeyPosition("C")   // => { circle: "outer", index: 0 }
 * getKeyPosition("Am")  // => { circle: "inner", index: 0 }
 * ```
 */
export function getKeyPosition(scale: string): KeyPosition {
  const majorKeys = ["C", "G", "D", "A", "E", "B", "F＃", "D♭", "A♭", "E♭", "B♭", "F"];
  const minorKeys = ["Am", "Em", "Bm", "F＃m", "C＃m", "G＃m", "D＃m", "B♭m", "Fm", "Cm", "Gm", "Dm"];

  const majorIndex = majorKeys.indexOf(scale);
  const minorIndex = minorKeys.indexOf(scale);

  if (majorIndex !== -1) {
    return {
      circle: "outer",
      index: majorIndex,
    };
  } else if (minorIndex !== -1) {
    return {
      circle: "inner",
      index: minorIndex,
    };
  }

  return {
    circle: "none",
    index: -1,
  };
}

export class Note {
  private note: string;
  private octave: number;

  constructor(note: string, octave: number = 4) {
    if (!isValidNote(note)) {
      throw new Error(`Invalid note: ${note}`);
    }
    this.note = normalizeNotation(note);
    this.octave = octave;
  }

  getOctave(): number {
    return this.octave;
  }

  toString(): string {
    return this.note;
  }

  isMajor(): boolean {
    // 音名が基本音名（C, D, E, F, G, A, B）の場合はメジャー
    return BASIC_NOTES.includes(this.note as NoteName);
  }

  equals(other: Note): boolean {
    return this.note === other.note;
  }
}
