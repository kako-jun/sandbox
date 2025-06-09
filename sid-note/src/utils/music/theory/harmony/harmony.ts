import { getNoteFrequency } from "@/utils/music/audio/player";

/**
 * 機能和声における度数を示す型
 */
export type FunctionalHarmonyDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * コードのルート音とスケールのルート音から機能和声における度数を判定します。
 * 例: Cスケールにおける Dm は 2度の和音となります。
 */
export function getFunctionalHarmony(scaleRoot: string, chord: string): FunctionalHarmonyDegree | null {
  if (!scaleRoot || !chord) return null;

  // TODO: scaleRootとchordの関係から度数を計算
  // 実際の実装では:
  // 1. コードのルート音を取得
  // 2. スケールの音名配列を取得
  // 3. ルート音がスケールの何番目にあるかを判定

  return null;
}

/**
 * カデンツの種類を示す型
 */
export type CadenceType =
  | "Perfect Cadence" // V-I
  | "Plagal Cadence" // IV-I
  | "Deceptive Cadence" // V-VI
  | "Half Cadence" // *-V
  | "Phrygian Cadence" // *-VII
  | "";

/**
 * 2つの和声度数からカデンツの種類を判定します。
 */
export function cadenceText(from: FunctionalHarmonyDegree, to: FunctionalHarmonyDegree): CadenceType {
  // 無効な度数の場合は空文字を返す
  if (from < 1 || from > 7 || to < 1 || to > 7) return "";

  // カデンツの判定
  if (from === 5 && to === 1) return "Perfect Cadence";
  if (from === 4 && to === 1) return "Plagal Cadence";
  if (from === 5 && to === 6) return "Deceptive Cadence";
  if (to === 5) return "Half Cadence";
  if (to === 7) return "Phrygian Cadence";

  return "";
}

/**
 * コードトーンのラベルを返します。
 */
export function getChordToneLabel(scaleRoot: string, chord: string, pitch: string): string {
  const freq = getNoteFrequency(pitch);
  if (!freq) return "";

  // TODO: 実際のコードトーン判定ロジックを実装
  // 1. スケールのルート音からの相対位置を計算
  // 2. コードの種類に応じて、その音がコードトーンかどうかを判定
  // 3. コードトーンの場合、適切なラベル（Root, 3rd, 5th など）を返す

  return "";
}
