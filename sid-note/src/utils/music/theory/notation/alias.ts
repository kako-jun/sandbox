/**
 * コード名の別表記ユーティリティ
 * 
 * このモジュールは、コード名の代替表記を提供します。
 * メジャー、マイナー、セブンス、ディミニッシュなど、
 * 一般的なコードタイプの様々な記譜法に対応します。
 * 
 * @module alias
 */

import { extractChordType, extractRootNote } from "@/utils/music/theory/core/chords";

/**
 * コードタイプの別表記マップ
 */
const TYPE_ALIAS_MAP: Record<string, string[]> = {
  "": ["", "maj", "△"],
  maj7: ["maj7", "M7", "△7"],
  m7: ["m7", "-7"],
  "7": ["7"],
  m: ["m", "-"],
  dim: ["dim", "o"],
  aug: ["aug", "+"],
  sus4: ["sus4", "sus"],
  add9: ["add9"],
  "6": ["6"],
  "9": ["9"],
  m_maj7: ["m(maj7)", "mM7", "-M7"],
  m6: ["m6", "-6"],
  m9: ["m9", "-9"],
  M9: ["M9", "maj9", "△9"],
  m_maj9: ["m(maj9)", "mM9", "-M9"],
  sus2: ["sus2"],
  "5": ["5"],
  "8": ["8"],
};

/**
 * 特殊な音名のマッピング
 */
const SPECIAL_NOTES: Record<string, string> = {
  "C#": "C#", "C＃": "C＃", "C♯": "C♯",
  "Cb": "Cb", "C♭": "C♭",
  "E#": "E#", "E♯": "E♯",
  "Fb": "Fb", "F♭": "F♭",
  "B#": "B#", "B♯": "B♯"
};

/**
 * コードタイプに対する別表記を取得します
 * 
 * @param type - コードタイプ
 * @returns 別表記の配列
 * @throws {Error} 無効なコードタイプが指定された場合
 * 
 * @example
 * ```ts
 * getAliasesForType("maj7")  // => ["maj7", "M7", "△7"]
 * getAliasesForType("m")     // => ["m", "-"]
 * ```
 */
function getAliasesForType(type: string): string[] {
  if (!type || typeof type !== "string") {
    throw new Error("コードタイプは文字列である必要があります");
  }

  // type部分がどれに該当するか判定
  for (const [key, aliases] of Object.entries(TYPE_ALIAS_MAP)) {
    if (type === key) {
      return aliases;
    }
  }

  // マッチしない場合は元の文字列のみの配列を返す
  return [type];
}

/**
 * コード名の代替表記を配列として返します
 * 
 * @param chord - コード名
 * @returns 代替表記の配列
 * @throws {Error} 無効なコード名が指定された場合
 * 
 * @example
 * ```ts
 * getChordNameAliases("CM7")   // => ["CM7", "Cmaj7", "C△7"]
 * getChordNameAliases("Cm")    // => ["Cm", "C-"]
 * getChordNameAliases("Cm7")   // => ["Cm7", "C-7"]
 * getChordNameAliases("Cdim")  // => ["Cdim", "Co"]
 * getChordNameAliases("Caug")  // => ["Caug", "C+"]
 * ```
 */
export function getChordNameAliases(chord: string): string[] {
  if (!chord || typeof chord !== "string") {
    throw new Error("コード名は文字列である必要があります");
  }

  // 特殊ケースの処理
  for (const [prefix, normalizedPrefix] of Object.entries(SPECIAL_NOTES)) {
    if (chord.startsWith(prefix)) {
      const type = chord.slice(prefix.length);
      return getAliasesForType(type).map(alias => normalizedPrefix + alias);
    }
  }

  // ルート音部分とタイプ部分に分割
  const normalizedRoot = extractRootNote(chord);
  const type = extractChordType(chord);

  if (!normalizedRoot) {
    throw new Error(`無効なコード名です: ${chord}`);
  }

  // 元の記号（#/b）を保持するために、入力文字列から直接ルート音を取得
  let originalRoot = "";
  if (chord.length >= 1) {
    // ルート音の基本部分（A-G）
    originalRoot = chord.charAt(0);

    // シャープ/フラット記号がある場合は追加
    if (
      chord.length >= 2 &&
      (chord.charAt(1) === "#" ||
        chord.charAt(1) === "b" ||
        chord.charAt(1) === "♯" ||
        chord.charAt(1) === "♭" ||
        chord.charAt(1) === "＃")
    ) {
      originalRoot += chord.charAt(1);
    }
  }

  // 有効なルート音が見つかった場合は、元の記号を使用
  const rootToUse = originalRoot || normalizedRoot;

  // コードタイプのエイリアスを取得して、ルート音と組み合わせて返す
  return getAliasesForType(type).map(alias => rootToUse + alias);
}
