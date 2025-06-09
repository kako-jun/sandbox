/**
 * 音楽理論の基本となる記譜法のコアモジュール
 * 五線譜上の位置計算や音符の表示に関する機能を提供します。
 */

/**
 * 音符の種類を表す型定義
 */
export type NoteValue = "whole" | "half" | "quarter" | "eighth" | "sixteenth" | "thirty-second";

/**
 * 音符の定義
 */
export interface NoteValueDefinition {
  /** 音符の種類 */
  type: NoteValue;
  /** 表示名 */
  displayName: string;
  /** 音符の長さ（拍数） */
  duration: number;
  /** 音符の画像パス */
  imagePath: string;
}

/**
 * 音符の定義マッピング
 */
export const NOTE_VALUE_DEFINITIONS: Record<NoteValue, NoteValueDefinition> = {
  "whole": {
    type: "whole",
    displayName: "全音符",
    duration: 4,
    imagePath: "/images/notes/whole.png"
  },
  "half": {
    type: "half",
    displayName: "2分音符",
    duration: 2,
    imagePath: "/images/notes/half.png"
  },
  "quarter": {
    type: "quarter",
    displayName: "4分音符",
    duration: 1,
    imagePath: "/images/notes/quarter.png"
  },
  "eighth": {
    type: "eighth",
    displayName: "8分音符",
    duration: 0.5,
    imagePath: "/images/notes/eighth.png"
  },
  "sixteenth": {
    type: "sixteenth",
    displayName: "16分音符",
    duration: 0.25,
    imagePath: "/images/notes/sixteenth.png"
  },
  "thirty-second": {
    type: "thirty-second",
    displayName: "32分音符",
    duration: 0.125,
    imagePath: "/images/notes/thirty-second.png"
  }
};

/**
 * 五線譜上の位置を計算します
 * 
 * @param pitch - ピッチ（例：C4, F#3）
 * @returns 五線譜上の位置（0が中央のC4）
 * @throws {Error} 無効なピッチが指定された場合
 * 
 * @example
 * ```ts
 * calculateLinePosition("C4")  // => 0
 * calculateLinePosition("E4")  // => 2
 * calculateLinePosition("G3")  // => -2
 * ```
 */
export function calculateLinePosition(pitch: string): number {
  if (!pitch || typeof pitch !== "string") {
    throw new Error("ピッチは文字列である必要があります");
  }

  const note = pitch[0].toUpperCase();
  const octave = parseInt(pitch.slice(1), 10);

  if (isNaN(octave) || octave < 0 || octave > 8) {
    throw new Error(`無効なオクターブです: ${pitch}`);
  }

  const noteIndex = "CDEFGAB".indexOf(note);
  if (noteIndex === -1) {
    throw new Error(`無効な音名です: ${pitch}`);
  }

  // 中央のC4を基準（0）として位置を計算
  const basePosition = noteIndex - 2; // C4を0とするための調整
  const octaveDifference = octave - 4; // オクターブ4を基準とする
  return basePosition + (octaveDifference * 7);
}

/**
 * 五線譜上の線の位置を取得します
 * 
 * @param position - 五線譜上の位置
 * @returns 線の位置（0-4、-1は線の上、5は線の下）
 * @throws {Error} 無効な位置が指定された場合
 * 
 * @example
 * ```ts
 * getLine(0)   // => 2
 * getLine(2)   // => 3
 * getLine(-2)  // => 1
 * ```
 */
export function getLine(position: number): number {
  if (typeof position !== "number") {
    throw new Error("位置は数値である必要があります");
  }

  // 位置を0-4の範囲に正規化
  const normalizedPosition = ((position % 5) + 5) % 5;
  return normalizedPosition;
}

/**
 * 音符の表示テキストを取得します
 * 
 * @param noteValue - 音符の種類
 * @returns 音符の表示テキスト
 * @throws {Error} 無効な音符の種類が指定された場合
 * 
 * @example
 * ```ts
 * getValueText("quarter")  // => "4分音符"
 * getValueText("eighth")   // => "8分音符"
 * ```
 */
export function getValueText(noteValue: NoteValue): string {
  if (!noteValue || !(noteValue in NOTE_VALUE_DEFINITIONS)) {
    throw new Error(`無効な音符の種類です: ${noteValue}`);
  }

  return NOTE_VALUE_DEFINITIONS[noteValue].displayName;
}
