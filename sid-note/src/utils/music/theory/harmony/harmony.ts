/**
 * 和声ユーティリティ
 * 
 * このモジュールは、和声に関する機能を提供します。
 * 和声の進行、和声の分析、和声の変換など、
 * 和声の基本的な操作に対応します。
 * 
 * @module harmony
 */


/**
 * 和声の進行の定義
 */
export interface ChordProgression {
  /** コードの配列 */
  chords: string[];
  /** キー */
  key: string;
  /** 進行のタイプ */
  type: "major" | "minor";
}

/**
 * 主要な和声進行パターン
 */
const PROGRESSION_PATTERNS: Record<string, string[]> = {
  "I-IV-V": ["", "sus4", "7"],
  "I-V-vi-IV": ["", "7", "m", "sus4"],
  "ii-V-I": ["m", "7", ""],
  "I-vi-IV-V": ["", "m", "sus4", "7"],
  "vi-IV-I-V": ["m", "sus4", "", "7"],
};

/**
 * 和声進行を生成します
 * 
 * @param key - キー
 * @param pattern - 進行パターン
 * @returns 和声進行
 * @throws {Error} 無効なキーまたはパターンが指定された場合
 * 
 * @example
 * ```ts
 * generateProgression("C", "I-IV-V")     // => { chords: ["C", "F", "G7"], key: "C", type: "major" }
 * generateProgression("Am", "vi-IV-I-V") // => { chords: ["Am", "F", "C", "G7"], key: "Am", type: "minor" }
 * ```
 */
export function generateProgression(key: string, pattern: string): ChordProgression {
  if (!key || typeof key !== "string") {
    throw new Error("キーは文字列である必要があります");
  }

  if (!pattern || typeof pattern !== "string") {
    throw new Error("進行パターンは文字列である必要があります");
  }

  const progression = PROGRESSION_PATTERNS[pattern];
  if (!progression) {
    throw new Error(`無効な進行パターンです: ${pattern}`);
  }

  const isMinor = key.toLowerCase().endsWith("m");
  const rootNote = isMinor ? key.slice(0, -1) : key;
  const chords = progression.map((type, index) => {
    const degree = getDegreeFromIndex(index, isMinor);
    const note = getNoteFromDegree(rootNote, degree);
    return note + type;
  });

  return {
    chords,
    key,
    type: isMinor ? "minor" : "major",
  };
}

/**
 * インデックスから音度を取得します
 * 
 * @param index - インデックス
 * @param isMinor - マイナーキーかどうか
 * @returns 音度（1-7）
 */
function getDegreeFromIndex(index: number, isMinor: boolean): number {
  const majorDegrees = [1, 4, 5, 6, 4, 1, 5];
  const minorDegrees = [6, 4, 1, 5, 4, 6, 5];
  return isMinor ? minorDegrees[index] : majorDegrees[index];
}

/**
 * 音度から音名を取得します
 * 
 * @param rootNote - ルート音
 * @param degree - 音度（1-7）
 * @returns 音名
 */
function getNoteFromDegree(rootNote: string, degree: number): string {
  const notes = ["C", "D", "E", "F", "G", "A", "B"];
  const rootIndex = notes.indexOf(rootNote);
  const noteIndex = (rootIndex + degree - 1) % 7;
  return notes[noteIndex];
}

/**
 * ダイアトニックコードの定義
 */
const DIATONIC_CHORDS: Record<string, string[]> = {
  "C": ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
  "G": ["G", "Am", "Bm", "C", "D", "Em", "F#dim"],
  "D": ["D", "Em", "F#m", "G", "A", "Bm", "C#dim"],
  "A": ["A", "Bm", "C#m", "D", "E", "F#m", "G#dim"],
  "E": ["E", "F#m", "G#m", "A", "B", "C#m", "D#dim"],
  "B": ["B", "C#m", "D#m", "E", "F#", "G#m", "A#dim"],
  "F#": ["F#", "G#m", "A#m", "B", "C#", "D#m", "E#dim"],
  "C#": ["C#", "D#m", "E#m", "F#", "G#", "A#m", "B#dim"],
  "F": ["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"],
  "Bb": ["Bb", "Cm", "Dm", "Eb", "F", "Gm", "Adim"],
  "Eb": ["Eb", "Fm", "Gm", "Ab", "Bb", "Cm", "Ddim"],
  "Ab": ["Ab", "Bbm", "Cm", "Db", "Eb", "Fm", "Gdim"],
  "Db": ["Db", "Ebm", "Fm", "Gb", "Ab", "Bbm", "Cdim"],
  "Gb": ["Gb", "Abm", "Bbm", "Cb", "Db", "Ebm", "Fdim"],
  "Cb": ["Cb", "Dbm", "Ebm", "Fb", "Gb", "Abm", "Bbdim"],
};

/**
 * キーからダイアトニックコードを取得します
 * 
 * @param key - キー（例: "C", "G", "D"）
 * @returns ダイアトニックコードの配列
 * @throws {Error} 無効なキーが指定された場合
 * 
 * @example
 * ```ts
 * getDiatonicChords("C")  // => ["C", "Dm", "Em", "F", "G", "Am", "Bdim"]
 * getDiatonicChords("G")  // => ["G", "Am", "Bm", "C", "D", "Em", "F#dim"]
 * ```
 */
export function getDiatonicChords(key: string): string[] {
  if (!key || typeof key !== "string") {
    throw new Error("キーは文字列である必要があります");
  }

  const chords = DIATONIC_CHORDS[key];
  if (!chords) {
    throw new Error(`無効なキーです: ${key}`);
  }

  return chords;
}

/**
 * コードが指定されたキーのダイアトニックコードかどうかを判定します
 * 
 * @param chord - コード名
 * @param key - キー
 * @returns ダイアトニックコードかどうか
 * @throws {Error} 無効なコード名やキーが指定された場合
 * 
 * @example
 * ```ts
 * isDiatonicChord("C", "C")  // => true
 * isDiatonicChord("Dm", "C") // => true
 * isDiatonicChord("F#", "C") // => false
 * ```
 */
export function isDiatonicChord(chord: string, key: string): boolean {
  if (!chord || typeof chord !== "string") {
    throw new Error("コード名は文字列である必要があります");
  }

  if (!key || typeof key !== "string") {
    throw new Error("キーは文字列である必要があります");
  }

  const diatonicChords = getDiatonicChords(key);
  return diatonicChords.includes(chord);
} 