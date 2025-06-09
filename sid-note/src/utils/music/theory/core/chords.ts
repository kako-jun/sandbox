/**
 * コードユーティリティ
 * 
 * このモジュールは、コードに関する機能を提供します。
 * コードの解析、コードの正規化、コードの構成音の取得など、
 * コードの基本的な操作に対応します。
 * 
 * @module chords
 */


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

/**
 * コード構造の定義
 */
export interface ChordStructure {
  /** ルート音の音程 */
  root: string;
  /** 3度の音程 */
  third: string;
  /** 5度の音程 */
  fifth: string;
  /** 7度の音程（オプション） */
  seventh?: string;
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

  // コード名の先頭から音名を抽出
  const match = chordName.match(/^[A-G][#♯♭b]?/);
  if (!match) {
    throw new Error(`無効なコード名です: ${chordName}`);
  }

  return match[0];
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

  // ルート音を除いた部分をコードタイプとして抽出
  const rootNote = extractRootNote(chordName);
  return chordName.slice(rootNote.length);
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
    throw new Error("コードタイプは文字列である必要があります");
  }

  const structure = CHORD_STRUCTURES[chordType];
  if (!structure) {
    throw new Error(`無効なコードタイプです: ${chordType}`);
  }

  return structure;
}
