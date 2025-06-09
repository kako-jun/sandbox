/**
 * 機能和声ユーティリティ
 * 
 * このモジュールは、機能和声に関する機能を提供します。
 * 機能和声の分析、機能和声の進行、機能和声の変換など、
 * 機能和声の基本的な操作に対応します。
 * 
 * @module functionalHarmony
 */


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
 * @returns 和声機能（T, S, D）
 * @throws {Error} 無効なコード名やキーが指定された場合
 * 
 * @example
 * ```ts
 * getFunctionalHarmony("C", "C")  // => "T"
 * getFunctionalHarmony("F", "C")  // => "S"
 * getFunctionalHarmony("G", "C")  // => "D"
 * ```
 */
export function getFunctionalHarmony(chord: string, key: string): string {
  if (!chord || typeof chord !== "string") {
    throw new Error("コード名は文字列である必要があります");
  }

  if (!key || typeof key !== "string") {
    throw new Error("キーは文字列である必要があります");
  }

  const diatonicChords = getScaleDiatonicChords(key);
  const index = diatonicChords.indexOf(chord);

  if (index === -1) {
    throw new Error(`無効なコード名です: ${chord}`);
  }

  const romanNumeral = getRomanNumeral(index + 1);
  for (const [function_, numerals] of Object.entries(FUNCTIONAL_HARMONY)) {
    if (numerals.includes(romanNumeral)) {
      return function_;
    }
  }

  throw new Error(`和声機能が見つかりません: ${chord}`);
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
  return interval.degree === 5 || interval.degree === 4;
};

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
  const functionalHarmony = getFunctionalHarmony(scale, chord);
  const nextFunctionalHarmony = getFunctionalHarmony(scale, nextChord);
  return functionalHarmony === 5 && nextFunctionalHarmony === 1;
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
  const functionalHarmony = getFunctionalHarmony(scale, chord);
  const nextFunctionalHarmony = getFunctionalHarmony(scale, nextChord);
  return functionalHarmony === 5 && nextFunctionalHarmony !== 1;
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
  const functionalHarmony = getFunctionalHarmony(scale, chord);
  const nextFunctionalHarmony = getFunctionalHarmony(scale, nextChord);
  return functionalHarmony === 4 && nextFunctionalHarmony === 1;
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
 * 和音の度数に対応する機能和声情報を返します（7thコードオプション付き）
 *
 * @param degree - 機能和声の度数（1-7）
 * @param withSeventh - 7thコードの情報を取得するかどうか（デフォルトはfalse）
 * @returns 和音の情報（ローマ数字表記と説明）
 */
export const getFunctionalHarmonyInfo = (
  degree: number,
  withSeventh: boolean = false
): { roman: string; desc: string } => {
  // 無効な度数の場合は空の情報を返す
  if (degree < 1 || degree > 7) {
    return { roman: "", desc: "" };
  }

  // 三和音の情報
  if (!withSeventh) {
    switch (degree) {
      case 1:
        return {
          roman: "Ⅰ",
          desc: "Tonic (主和音・長三和音): 完全な安定感・曲の中心・終止感",
        };
      case 2:
        return {
          roman: "Ⅱm",
          desc: "Supertonic (上主和音・短三和音): 推進力・サブドミナントへの準備・優しい緊張感",
        };
      case 3:
        return {
          roman: "Ⅲm",
          desc: "Mediant (中和音・短三和音): トニックの延長・柔らかな色彩・繊細な表現",
        };
      case 4:
        return {
          roman: "Ⅳ",
          desc: "Subdominant (下属和音・長三和音): トニックへの準備・暖かい響き・柔らかな動き",
        };
      case 5:
        return {
          roman: "Ⅴ",
          desc: "Dominant (属和音・長三和音): トニックへの強い解決要求・劇的な緊張感・方向性",
        };
      case 6:
        return {
          roman: "Ⅵm",
          desc: "Submediant (下中和音・短三和音): 叙情的・内省的・平行短調の響き",
        };
      case 7:
        return {
          roman: "Ⅶdim",
          desc: "Leading Tone (導和音・減三和音): 強い解決欲求・不安定な緊張感・ドミナントの代理機能",
        };
    }
  }
  // 七の和音の情報
  else {
    switch (degree) {
      case 1:
        return {
          roman: "ⅠM7",
          desc: "Tonic Seventh (主和音・長七の和音): 完全な安定感・ジャズ的な色彩・豊かな終止感",
        };
      case 2:
        return {
          roman: "Ⅱm7",
          desc: "Supertonic Seventh (上主和音・短七の和音): Ⅴ7への準備・柔らかな緊張・複合的な響き",
        };
      case 3:
        return {
          roman: "Ⅲm7",
          desc: "Mediant Seventh (中和音・短七の和音): トニック機能の拡張・複雑な色彩・微妙な表現",
        };
      case 4:
        return {
          roman: "ⅣM7",
          desc: "Subdominant Seventh (下属和音・長七の和音): 豊かな響き・広がりのある音色・ゆったりとした動き",
        };
      case 5:
        return {
          roman: "Ⅴ7",
          desc: "Dominant Seventh (属和音・属七の和音): 強い解決感・明確な方向性・トニックへの最強の牽引力",
        };
      case 6:
        return {
          roman: "Ⅵm7",
          desc: "Submediant Seventh (下中和音・短七の和音): 深い叙情性・複雑な情感・Ⅱm7への接続性",
        };
      case 7:
        return {
          roman: "Ⅶm7♭5",
          desc: "Leading Tone Seventh (導和音・半減七の和音): 極度の不安定さ・Ⅴ7の代替・トニックへの強い進行欲求",
        };
    }
  }

  return { roman: "", desc: "" };
};

/**
 * 音の機能（コード内での役割）を示すラベルを返します
 */
export const getChordToneLabel = (key: string, chord: string, note: string): string => {
  if (!key || !chord || !note) return "";

  const rootNote = chord.replace(/m.*|maj.*|dim.*|aug.*|sus.*|[0-9].*|\(.*|\+.*|-.*/, "");
  const noteBase = note.replace(/[0-9]/, "");

  // コードのルート音に対応するラベル
  if (rootNote === noteBase) {
    const harmonyDegree = getFunctionalHarmony(key, chord);
    switch (harmonyDegree) {
      case 1:
        return "Tonic Note";
      case 2:
        return "Supertonic Note";
      case 3:
        return "Mediant Note";
      case 4:
        return "Subdominant Note";
      case 5:
        return "Dominant Note";
      case 6:
        return "Submediant Note";
      case 7:
        return "Leading Tone Note";
      default:
        return "";
    }
  }

  return "";
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
  return getFunctionalHarmonyInfo(degree, false);
};

/**
 * 七の和音のローマ数字情報を返します
 */
export const romanNumeral7thHarmonyInfo = (degree: number): { roman: string; desc: string } => {
  return getFunctionalHarmonyInfo(degree, true);
};
