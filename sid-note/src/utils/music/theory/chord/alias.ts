// コード名の別表記ユーティリティ

import { extractChordType, extractRootNote } from "@/utils/music/theory/core/chords";

/**
 * コード名の代替表記を配列として返します。
 * メジャー、マイナー、セブンス、ディミニッシュなど、
 * 一般的なコードタイプの様々な記譜法に対応します。
 *
 * 例：
 * ```typescript
 * getChordNameAliases("CM7")   => ["CM7", "Cmaj7", "C△7"]    // メジャー7
 * getChordNameAliases("Cm")    => ["Cm", "C-"]               // マイナー
 * getChordNameAliases("Cm7")   => ["Cm7", "C-7"]            // マイナー7
 * getChordNameAliases("Cdim")  => ["Cdim", "Co"]            // ディミニッシュ
 * getChordNameAliases("Caug")  => ["Caug", "C+"]            // オーギュメント
 * ```
 *
 * 対応する別表記：
 * - メジャー: "", "maj", "△"
 * - メジャー7: "maj7", "M7", "△7"
 * - マイナー: "m", "-"
 * - マイナー7: "m7", "-7"
 * - ドミナント7: "7"
 * - ディミニッシュ: "dim", "o"
 * - オーギュメント: "aug", "+"
 * - サスペンド4: "sus4", "sus"
 * - アド9: "add9"
 * - 6th: "6"
 */
/**
 * コードタイプに対する別表記を取得するヘルパー関数
 */
function getAliasesForType(type: string): string[] {
  // 代表的なコードタイプの別表記マップ
  const typeAliasMap: { [key: string]: string[] } = {
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

  // type部分がどれに該当するか判定
  for (const [key, aliases] of Object.entries(typeAliasMap)) {
    if (type === key) {
      return aliases;
    }
  }

  // マッチしない場合は元の文字列のみの配列を返す
  return [type];
}

export function getChordNameAliases(chord: string): string[] {
  // 特殊ケース: #と♯、bと♭を区別して処理する
  if (chord.startsWith("C#")) {
    const type = chord.slice(2);
    return getAliasesForType(type).map((a: string) => "C#" + a);
  }
  if (chord.startsWith("C＃")) {
    const type = chord.slice(2);
    return getAliasesForType(type).map((a: string) => "C＃" + a);
  }
  if (chord.startsWith("Cb")) {
    const type = chord.slice(2);
    return getAliasesForType(type).map((a: string) => "Cb" + a);
  }
  if (chord.startsWith("C♭")) {
    const type = chord.slice(2);
    return getAliasesForType(type).map((a: string) => "C♭" + a);
  }

  // その他の理論的音名
  if (chord.startsWith("E#")) {
    const type = chord.slice(2);
    return getAliasesForType(type).map((a: string) => "E#" + a);
  }
  if (chord.startsWith("E♯")) {
    const type = chord.slice(2);
    return getAliasesForType(type).map((a: string) => "E♯" + a);
  }
  if (chord.startsWith("Fb")) {
    const type = chord.slice(2);
    return getAliasesForType(type).map((a: string) => "Fb" + a);
  }
  if (chord.startsWith("F♭")) {
    const type = chord.slice(2);
    return getAliasesForType(type).map((a: string) => "F♭" + a);
  }
  if (chord.startsWith("B#")) {
    const type = chord.slice(2);
    return getAliasesForType(type).map((a: string) => "B#" + a);
  }
  if (chord.startsWith("B♯")) {
    const type = chord.slice(2);
    return getAliasesForType(type).map((a: string) => "B♯" + a);
  } // ルート音部分とタイプ部分に分割
  const normalizedRoot = extractRootNote(chord);
  const type = extractChordType(chord);

  if (!normalizedRoot) return [chord];

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
  return getAliasesForType(type).map((a: string) => rootToUse + a);
}
