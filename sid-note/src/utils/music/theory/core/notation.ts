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
 * 譜面ユーティリティ
 *
 * このモジュールは、譜面に関する機能を提供します。
 * 譜面の生成、譜面の解析、譜面の変換など、
 * 譜面の基本的な操作に対応します。
 *
 * @module notation
 */

import { parsePitch } from "./notes";

/**
 * ピッチの位置を計算します
 *
 * @param note - 音名
 * @param octave - オクターブ
 * @returns 譜面上の位置（0-4）
 * @throws {Error} 無効な音名またはオクターブが指定された場合
 *
 * @example
 * ```ts
 * calculateLinePosition("C", 4)  // => 0
 * calculateLinePosition("E", 4)  // => 1
 * calculateLinePosition("G", 4)  // => 2
 * ```
 */
export function calculateLinePosition(note: string, octave: number): number {
  if (!note || typeof note !== "string") {
    throw new Error("音名は文字列である必要があります");
  }

  if (typeof octave !== "number" || octave < 0 || octave > 8) {
    throw new Error("オクターブは0から8の間である必要があります");
  }

  const pitch = `${note}${octave}`;
  const pitchInfo = parsePitch(pitch);
  if (!pitchInfo) {
    throw new Error(`無効なピッチです: ${pitch}`);
  }

  // 基準となるC4の位置を0として計算
  const baseOctave = 4;
  const baseNote = "C";
  const basePitch = `${baseNote}${baseOctave}`;
  const basePitchInfo = parsePitch(basePitch);
  if (!basePitchInfo) {
    throw new Error(`無効な基準ピッチです: ${basePitch}`);
  }

  // オクターブの差を計算
  const octaveDiff = pitchInfo.octave - basePitchInfo.octave;

  // 音名の差を計算
  const noteDiff = getNoteDiff(pitchInfo.note, basePitchInfo.note);

  // 位置を計算（1オクターブ = 7音）
  const position = octaveDiff * 7 + noteDiff;

  // 0-4の範囲に正規化
  return normalizePosition(position);
}

/**
 * 2つの音名の差を計算します
 *
 * @param note1 - 1つ目の音名
 * @param note2 - 2つ目の音名
 * @returns 音名の差（半音数）
 */
function getNoteDiff(note1: string, note2: string): number {
  const notes = ["C", "D", "E", "F", "G", "A", "B"];
  const index1 = notes.indexOf(note1[0]);
  const index2 = notes.indexOf(note2[0]);
  return (index1 - index2 + 7) % 7;
}

/**
 * 位置を0-4の範囲に正規化します
 *
 * @param position - 位置
 * @returns 正規化された位置
 */
function normalizePosition(position: number): number {
  return ((position % 5) + 5) % 5;
}

/**
 * 五線譜上の線の位置を取得します
 *
 * @param pitch - ピッチ（例：C4, F#3）または五線譜上の位置
 * @returns 線の位置（0-4、-1は線の上、5は線の下）、無効なピッチの場合はnull
 *
 * @example
 * ```ts
 * getLine("C4")  // => 2
 * getLine("E4")  // => 3
 * getLine("G3")  // => 1
 * getLine(0)     // => 2
 * getLine(2)     // => 3
 * getLine(-2)    // => 1
 * ```
 */
export function getLine(pitch: string | number): number | null {
  let position: number;

  if (typeof pitch === "string") {
    const pitchInfo = parsePitch(pitch);
    if (!pitchInfo) {
      return null;
    }
    position = calculateLinePosition(pitchInfo.note, pitchInfo.octave);
  } else if (typeof pitch === "number") {
    position = pitch;
  } else {
    return null;
  }

  // 位置を0-4の範囲に正規化
  return normalizePosition(position);
}

/**
 * 音符の表示テキストを取得します
 *
 * @param noteValue - 音符の種類
 * @returns 音符の表示テキスト
 *
 * @example
 * ```ts
 * getValueText("quarter")  // => "4分音符"
 * getValueText("eighth")   // => "8分音符"
 * ```
 */
export function getValueText(noteValue: NoteValue | string): string {
  if (!noteValue || !(noteValue in NOTE_VALUE_DEFINITIONS)) {
    return "";
  }
  return NOTE_VALUE_DEFINITIONS[noteValue as NoteValue].displayName;
}
