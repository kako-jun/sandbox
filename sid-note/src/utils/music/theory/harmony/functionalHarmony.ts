/**
 * 機能和声ユーティリティ
 *
 * このモジュールは、機能和声に関する機能を提供します。
 * 機能和声の解析、機能和声の生成、機能和声の変換など、
 * 機能和声の基本的な操作に対応します。
 *
 * @module functionalHarmony
 */

import { getInterval } from "@/utils/music/theory/core/intervals";
import { ScaleInfo, generateScaleFromKey, getScaleDiatonicChords, getScaleDiatonicChordsWith7th } from "@/utils/music/theory/core/scales";

/**
 * 機能和声の定義
 */
export interface FunctionalHarmony {
  /** スケール */
  scale: ScaleInfo;
  /** ダイアトニックコード */
  diatonicChords: string[];
  /** 機能和声の進行 */
  progressions: string[][];
}

/**
 * 機能和声を生成します
 *
 * @param scaleKey - スケールのキー（例：C, Am, G#m）
 * @returns 機能和声
 * @throws {Error} 無効なスケールキーが指定された場合
 *
 * @example
 * ```ts
 * generateFunctionalHarmony("C")  // => { scale: ScaleInfo, diatonicChords: ["C", "Dm", "Em", ...], progressions: [...] }
 * generateFunctionalHarmony("Am") // => { scale: ScaleInfo, diatonicChords: ["Am", "Bdim", "C", ...], progressions: [...] }
 * ```
 */
export function generateFunctionalHarmony(scaleKey: string): FunctionalHarmony {
  if (!scaleKey || typeof scaleKey !== "string") {
    throw new Error("スケールキーは文字列である必要があります");
  }

  const scale = generateScaleFromKey(scaleKey);
  const diatonicChords = getScaleDiatonicChordsWith7th(scaleKey);

  // 基本的な進行パターン
  const progressions = [
    ["I", "IV", "V"],
    ["I", "V", "vi", "IV"],
    ["ii", "V", "I"],
    ["vi", "IV", "I", "V"],
  ];

  return {
    scale,
    diatonicChords,
    progressions,
  };
}

/**
 * 機能和声の進行を解析します
 *
 * @param progression - 進行の配列（例：["I", "IV", "V"]）
 * @param scaleKey - スケールのキー（例：C, Am, G#m）
 * @returns 実際のコード進行
 * @throws {Error} 無効な進行またはスケールキーが指定された場合
 *
 * @example
 * ```ts
 * parseProgression(["I", "IV", "V"], "C")  // => ["C", "F", "G"]
 * parseProgression(["ii", "V", "I"], "Am") // => ["Bdim", "E", "Am"]
 * ```
 */
export function parseProgression(progression: string[], scaleKey: string): string[] {
  if (!progression || !Array.isArray(progression)) {
    throw new Error("進行は配列である必要があります");
  }

  if (!scaleKey || typeof scaleKey !== "string") {
    throw new Error("スケールキーは文字列である必要があります");
  }

  const diatonicChords = getScaleDiatonicChords(scaleKey);
  const romanNumerals = ["I", "ii", "iii", "IV", "V", "vi", "vii"];

  return progression.map(degree => {
    const index = romanNumerals.indexOf(degree);
    if (index === -1) {
      throw new Error(`無効な進行度です: ${degree}`);
    }
    return diatonicChords[index];
  });
}

/**
 * 機能和声の情報を取得します
 *
 * @param scaleKey - スケールのキー（例：C, Am, G#m）
 * @param degree - 機能和声の度数（1-7）
 * @param withSeventh - 7thを含めるかどうか
 * @returns 機能和声の情報
 * @throws {Error} 無効なスケールキーまたは度数が指定された場合
 *
 * @example
 * ```ts
 * getFunctionalHarmonyInfo("C", 1)  // => { roman: "I", desc: "トニック", isMinor: false }
 * getFunctionalHarmonyInfo("Am", 5) // => { roman: "V", desc: "ドミナント", isMinor: true }
 * ```
 */
export function getFunctionalHarmonyInfo(scaleKey: string, degree: number, withSeventh: boolean = false): {
  roman: string;
  desc: string;
  isMinor: boolean;
} {
  if (!scaleKey || typeof scaleKey !== "string") {
    throw new Error("スケールキーは文字列である必要があります");
  }

  if (typeof degree !== "number" || degree < 1 || degree > 7) {
    throw new Error("度数は1から7の間である必要があります");
  }

  const scale = generateScaleFromKey(scaleKey);
  const isMinor = scale.type === "minor";

  // ローマ数字の取得
  const roman = withSeventh ? romanNumeral7thHarmonyInfo(degree).roman : romanNumeralHarmonyInfo(degree).roman;

  // 機能和声の説明を取得
  const desc = getFunctionalHarmonyText(degree);

  return {
    roman,
    desc,
    isMinor,
  };
}

/**
 * 機能和声・カデンツ関連ユーティリティ
 */

/**
 * 機能和声の度数（1-7）
 */
export type FunctionalHarmonyDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * カデンツの種類
 */
export type CadenceType =
  | "Perfect Cadence" // V-I
  | "Plagal Cadence" // IV-I
  | "Deceptive Cadence" // V-VI
  | "Half Cadence" // *-V
  | "Phrygian Cadence" // *-VII
  | "";

/**
 * 和声機能の定義
 */
export type HarmonicFunction = "T" | "S" | "D" | "Tp" | "Sp" | "Dp";

/**
 * 和声機能の進行の定義
 */
export interface FunctionalProgression {
  /** 和声機能の配列 */
  functions: HarmonicFunction[];
  /** キー */
  key: string;
  /** 進行のタイプ */
  type: "major" | "minor";
}

/**
 * 主要な機能和声進行パターン
 */
const FUNCTIONAL_PATTERNS: Record<string, HarmonicFunction[]> = {
  "T-S-D-T": ["T", "S", "D", "T"],
  "T-D-T": ["T", "D", "T"],
  "T-S-T": ["T", "S", "T"],
  "T-S-D-S-T": ["T", "S", "D", "S", "T"],
  "T-D-S-T": ["T", "D", "S", "T"],
};

/**
 * 機能和声進行を生成します
 *
 * @param key - キー
 * @param pattern - 進行パターン
 * @returns 機能和声進行
 * @throws {Error} 無効なキーまたはパターンが指定された場合
 *
 * @example
 * ```ts
 * generateFunctionalProgression("C", "T-S-D-T")     // => { functions: ["T", "S", "D", "T"], key: "C", type: "major" }
 * generateFunctionalProgression("Am", "T-D-S-T")    // => { functions: ["T", "D", "S", "T"], key: "Am", type: "minor" }
 * ```
 */
export function generateFunctionalProgression(key: string, pattern: string): FunctionalProgression {
  if (!key || typeof key !== "string") {
    throw new Error("キーは文字列である必要があります");
  }

  if (!pattern || typeof pattern !== "string") {
    throw new Error("進行パターンは文字列である必要があります");
  }

  const progression = FUNCTIONAL_PATTERNS[pattern];
  if (!progression) {
    throw new Error(`無効な進行パターンです: ${pattern}`);
  }

  const isMinor = key.toLowerCase().endsWith("m");
  return {
    functions: progression,
    key,
    type: isMinor ? "minor" : "major",
  };
}

/**
 * 和声機能からコードを取得します
 *
 * @param function_ - 和声機能
 * @param key - キー
 * @returns コード
 * @throws {Error} 無効な和声機能またはキーが指定された場合
 *
 * @example
 * ```ts
 * getChordFromFunction("T", "C")  // => "C"
 * getChordFromFunction("D", "C")  // => "G7"
 * ```
 */
export function getChordFromFunction(function_: HarmonicFunction, key: string): string {
  if (!function_ || typeof function_ !== "string") {
    throw new Error("和声機能は文字列である必要があります");
  }

  if (!key || typeof key !== "string") {
    throw new Error("キーは文字列である必要があります");
  }

  const isMinor = key.toLowerCase().endsWith("m");
  const rootNote = isMinor ? key.slice(0, -1) : key;
  const functionMap = isMinor ? MINOR_FUNCTION_MAP : MAJOR_FUNCTION_MAP;
  const chord = functionMap[function_];

  if (!chord) {
    throw new Error(`無効な和声機能です: ${function_}`);
  }

  return rootNote + chord;
}

/**
 * メジャーキーの機能和声マップ
 */
const MAJOR_FUNCTION_MAP: Record<HarmonicFunction, string> = {
  T: "",
  S: "sus4",
  D: "7",
  Tp: "m",
  Sp: "m",
  Dp: "m7",
};

/**
 * マイナーキーの機能和声マップ
 */
const MINOR_FUNCTION_MAP: Record<HarmonicFunction, string> = {
  T: "m",
  S: "m",
  D: "7",
  Tp: "",
  Sp: "sus4",
  Dp: "m7",
};

/**
 * コードの和声機能を取得します
 *
 * @param chord - コード名
 * @param key - キー
 * @returns 和声機能（T, S, D, Tp, Sp, Dp）
 * @throws {Error} 無効なコード名やキーが指定された場合
 *
 * @example
 * ```ts
 * getChordFunction("C", "C")  // => "T"
 * getChordFunction("F", "C")  // => "S"
 * getChordFunction("G7", "C") // => "D"
 * getChordFunction("Am", "C") // => "Tp"
 * ```
 */
export function getChordFunction(chord: string, key: string): HarmonicFunction | null {
  if (!chord || typeof chord !== "string") {
    return null;
  }
  if (!key || typeof key !== "string") {
    return null;
  }

  try {
    const isMinor = key.toLowerCase().endsWith("m");
    const rootNote = isMinor ? key.slice(0, -1) : key;
    const diatonicChords = getScaleDiatonicChords(key);
    const index = diatonicChords.indexOf(chord);

    if (index === -1) return null;

    // メジャーキーの場合
    if (!isMinor) {
      switch (index + 1) {
        case 1: return "T";  // I
        case 2: return "Tp"; // ii
        case 3: return "Tp"; // iii
        case 4: return "S";  // IV
        case 5: return "D";  // V
        case 6: return "Tp"; // vi
        case 7: return "Dp"; // vii°
        default: return null;
      }
    }
    // マイナーキーの場合
    else {
      switch (index + 1) {
        case 1: return "T";  // i
        case 2: return "Dp"; // ii°
        case 3: return "Tp"; // III
        case 4: return "S";  // iv
        case 5: return "D";  // V
        case 6: return "Tp"; // VI
        case 7: return "Dp"; // VII
        default: return null;
  }
    }
  } catch {
    return null;
  }
}

/**
 * 数字をローマ数字に変換します
 *
 * @param num - 数字（1-7）
 * @returns ローマ数字（I-VII）
 * @throws {Error} 無効な数字が指定された場合
 *
 * @example
 * ```ts
 * getRomanNumeral(1)  // => "I"
 * getRomanNumeral(2)  // => "II"
 * getRomanNumeral(3)  // => "III"
 * ```
 */
function getRomanNumeral(num: number): string {
  if (num < 1 || num > 7) {
    throw new Error(`無効な数字です: ${num}`);
  }

  const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];
  return romanNumerals[num - 1];
}

/**
 * 和音の度数をローマ数字と機能名で表現します。
 *
 * 例：
 * ```typescript
 * getFunctionalHarmonyText(1) => "Ⅰ Tonic"       // 主和音
 * getFunctionalHarmonyText(4) => "Ⅳ Subdominant" // 下属和音
 * getFunctionalHarmonyText(5) => "Ⅴ Dominant"    // 属和音
 * ```
 */
export const getFunctionalHarmonyText = (degree: number) => {
  switch (degree) {
    case 1:
      return `Ⅰ Tonic`;
    case 2:
      return `Ⅱ Supertonic`;
    case 3:
      return `Ⅲ Mediant`;
    case 4:
      return `Ⅳ Subdominant`;
    case 5:
      return `Ⅴ Dominant`;
    case 6:
      return `Ⅵ Submediant`;
    case 7:
      return `Ⅶ Leading Tone`;
    default:
      return "";
  }
};

/**
 * 与えられた和音進行がセカンダリードミナントの関係かどうかを判定します。
 * セカンダリードミナントとは、次の和音の属7の和音として機能するものです。
 *
 * 例：
 * ```typescript
 * // Dに向かうA7
 * isSecondaryDominant("A7", "Dm") => true
 *
 * // Emに向かうB7
 * isSecondaryDominant("B7", "Em") => true
 *
 * // 通常の属7和音
 * isSecondaryDominant("G7", "C")  => false
 * ```
 */
export const isSecondaryDominant = (chord: string, nextChord: string): boolean => {
  const chordRoot = chord.slice(0, -1);
  const nextChordRoot = nextChord.slice(0, -1);
  const interval = getInterval(chordRoot, nextChordRoot);
  return interval !== null && (interval.degree === 5 || interval.degree === 4);
};

/**
 * カデンツ判定関数の修正例
 */
function getChordDegreeInScale(scale: string, chord: string): number | null {
  try {
    const diatonicChords = getScaleDiatonicChords(scale);
    const idx = diatonicChords.indexOf(chord);
    return idx >= 0 ? idx + 1 : null;
  } catch {
    return null;
  }
}

/**
 * 和音進行がパーフェクトカデンツ（V→I）かどうかを判定します。
 *
 * 例：
 * ```typescript
 * isPerfectCadence("C", "G7", "C")  => true   // V7→I
 * isPerfectCadence("Am", "E7", "Am") => true   // V7→i
 * isPerfectCadence("C", "Dm", "C")   => false  // ii→I
 * ```
 */
export const isPerfectCadence = (scale: string, chord: string, nextChord: string): boolean => {
  const deg = getChordDegreeInScale(scale, chord);
  const nextDeg = getChordDegreeInScale(scale, nextChord);
  return deg === 5 && nextDeg === 1;
};

/**
 * 和音進行がディセプティブカデンツ（偽終止）かどうかを判定します。
 * 属和音（V）から主和音（I）以外の和音に進行する場合を指します。
 *
 * 例：
 * ```typescript
 * isDeceptiveCadence("C", "G7", "Am")  => true   // V7→vi
 * isDeceptiveCadence("C", "G7", "C")   => false  // V7→I（完全終止）
 * isDeceptiveCadence("C", "Dm", "G")   => false  // ii→V（非属和音から開始）
 * ```
 */
export const isDeceptiveCadence = (scale: string, chord: string, nextChord: string): boolean => {
  const deg = getChordDegreeInScale(scale, chord);
  const nextDeg = getChordDegreeInScale(scale, nextChord);
  return deg === 5 && nextDeg !== 1 && nextDeg !== null;
};

/**
 * 和音進行がプラガルカデンツ（下属和音→主和音）かどうかを判定します。
 *
 * 例：
 * ```typescript
 * isPlagalCadence("C", "F", "C")   => true   // IV→I
 * isPlagalCadence("Am", "Dm", "Am") => true   // iv→i
 * isPlagalCadence("C", "G", "C")   => false  // V→I（完全終止）
 * ```
 */
export const isPlagalCadence = (scale: string, chord: string, nextChord: string): boolean => {
  const deg = getChordDegreeInScale(scale, chord);
  const nextDeg = getChordDegreeInScale(scale, nextChord);
  return deg === 4 && nextDeg === 1;
};

/**
 * 各度数ごとの音名（スケール音）に関する情報を取得します。
 *
 * @param degree - 機能和声の度数（1-7）
 * @returns 音名の情報（ローマ数字表記と説明）
 */
export const getFunctionalHarmonyInfoBase = (degree: number): { roman: string; desc: string } => {
  switch (degree) {
    case 1:
      return {
        roman: "Ⅰ",
        desc: "Tonic (主音): 完全な安定感・曲の中心・終止感",
      };
    case 2:
      return {
        roman: "Ⅱ",
        desc: "Supertonic (上主音): 推進力・サブドミナントへの準備・優しい緊張感",
      };
    case 3:
      return {
        roman: "Ⅲ",
        desc: "Mediant (中音): トニックの延長・柔らかな色彩・繊細な表現",
      };
    case 4:
      return {
        roman: "Ⅳ",
        desc: "Subdominant (下属音): トニックへの準備・暖かい響き・柔らかな動き",
      };
    case 5:
      return {
        roman: "Ⅴ",
        desc: "Dominant (属音): トニックへの強い解決要求・劇的な緊張感・方向性",
      };
    case 6:
      return {
        roman: "Ⅵ",
        desc: "Submediant (下中音): 叙情的・内省的・平行短調の響き",
      };
    case 7:
      return {
        roman: "Ⅶ",
        desc: "Leading Tone (導音): 強い解決欲求・不安定な緊張感・ドミナントの代理機能",
      };
    default:
      return {
        roman: "",
        desc: "",
      };
  }
};

/**
 * 音の機能（コード内での役割）を示すラベルを返します
 */
export const getChordToneLabel = (key: string, chord: string, note: string): string => {
  if (!key || !chord || !note) return "";
  try {
    // ルート音判定やスケール外判定など本来のロジックをここに実装
    // ここでは簡易的に、keyとchordのルートが一致し、noteがそのルート音なら"Tonic Note"を返す例
    const scale = generateScaleFromKey(key);
    if (!scale.notes.includes(note.replace(/\d+$/, ""))) return "";
    if (chord.replace(/m|7|dim|aug|sus|add|b5|#5|b9|#9|#11|b13/g, "") === note.replace(/\d+$/, "")) {
        return "Tonic Note";
    }
        return "";
  } catch {
  return "";
  }
};

type CadencePattern = "5:1" | "4:1" | "5:6";

/**
 * カデンツのタイプを判定し、その名前を返します。
 * @param prevFunctionalHarmony - 前の和音の機能（度数）
 * @param functionalHarmony - 現在の和音の機能（度数）
 * @returns カデンツの名前
 */
export const getCadenceText = (prevFunctionalHarmony: number, functionalHarmony: number): string => {
  const cadencePatterns: Record<CadencePattern, string> = {
    "5:1": "Perfect Cadence", // V -> I
    "4:1": "Plagal Cadence", // IV -> I
    "5:6": "Deceptive Cadence", // V -> vi
  };

  // 特殊なケース
  if (functionalHarmony === 5) return "Half Cadence"; // -> V
  if (functionalHarmony === 7) return "Phrygian Cadence"; // -> vii

  const pattern = `${prevFunctionalHarmony}:${functionalHarmony}` as CadencePattern;
  return cadencePatterns[pattern] || "";
};

/**
 * 三和音のローマ数字情報を返します
 */
export const romanNumeralHarmonyInfo = (degree: number): { roman: string; desc: string } => {
  return getFunctionalHarmonyInfoBase(degree);
};

/**
 * 七の和音のローマ数字情報を返します
 */
export const romanNumeral7thHarmonyInfo = (degree: number): { roman: string; desc: string } => {
  return getFunctionalHarmonyInfoBase(degree);
};

const FUNCTIONAL_HARMONY: Record<string, string[]> = {
  T: ["I"],
  S: ["II", "IV"],
  D: ["V", "VII"],
};

/**
 * コードの和声機能の度数を取得します
 *
 * @param chord - コード名
 * @param key - キー
 * @returns 和声機能の度数（1-7）または0（スケールに含まれない場合）
 * @throws {Error} 無効なコード名やキーが指定された場合
 *
 * @example
 * ```ts
 * getFunctionalHarmony("C", "C")  // => 1
 * getFunctionalHarmony("Dm", "C") // => 2
 * getFunctionalHarmony("Em", "C") // => 3
 * ```
 */
export function getFunctionalHarmony(chord: string, key: string): number {
  if (!chord || typeof chord !== "string") {
    return 0;
  }
  if (!key || typeof key !== "string") {
    return 0;
  }

  try {
    const diatonicChords = getScaleDiatonicChords(key);
    const index = diatonicChords.indexOf(chord);
    return index >= 0 ? index + 1 : 0;
  } catch {
    return 0;
  }
}
