/**
 * 音楽記譜法の処理ユーティリティ
 * 記譜記号や音符の表現に関する機能を提供します。
 */

import { parsePitch } from "./notes";

// 五線の高さを計算するための基準値マッピング
const lineBaseMap = new Map([
  ["C", -2],
  ["D", -1],
  ["E", 0],
  ["F", 1],
  ["G", 2],
  ["A", 3],
  ["B", 4],
]);

/**
 * 五線譜上の位置を計算します（効率的なアルゴリズム版）
 */
export const calculateLinePosition = (note: string, octave: number): number | null => {
  const baseNote = note.charAt(0);
  const base = lineBaseMap.get(baseNote);
  if (base === undefined) return null;

  // オクターブ4を基準とした位置計算
  let position = base + (octave - 4) * 7;

  // シャープ/フラット記号による位置の微調整
  if (note.includes("＃")) {
    position += 0.5;
  } else if (note.includes("♭")) {
    position -= 0.5;
  }

  return position;
};

/**
 * ピッチ文字列から五線譜上の位置を計算します（互換性のためのラッパー）
 */
export const getLine = (pitch: string): number | null => {
  const parsed = parsePitch(pitch);
  if (!parsed) return null;
  return calculateLinePosition(parsed.note, parsed.octave);
};

/**
 * 音符の種類を文字列で返します。
 * 正規表記に変換された音価の説明を返します。
 *
 * @example
 * ```ts
 * getValueText("whole")        => "Whole Note"        // 全音符
 * getValueText("dotted_half")  => "Dotted Half Note"  // 付点2分音符
 * getValueText("triplet_8th")  => "8th Triplet"       // 8分3連符
 * ```
 */
export const getValueText = (value: string) => {
  switch (value) {
    case "whole":
      return "Whole Note";
    case "dotted_whole":
      return "Dotted Whole Note";
    case "half":
      return "Half Note";
    case "dotted_half":
      return "Dotted Half Note";
    case "quarter":
      return "Quarter Note";
    case "dotted_quarter":
      return "Dotted Quarter Note";
    case "8th":
      return "8th Note";
    case "dotted_8th":
      return "Dotted 8th Note";
    case "16th":
      return "16th Note";
    case "dotted_16th":
      return "Dotted 16th Note";
    case "triplet_quarter":
      return "Quarter Triplet";
    case "triplet_8th":
      return "8th Triplet";
    case "triplet_16th":
      return "16th Triplet";
  }

  return "";
};
