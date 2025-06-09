/**
 * コード構造の定義と解析を行うモジュール
 */

import { ChordFlags, createChordStructure as coreCreateChordStructure } from "@/utils/music/theory/core/chords";

/**
 * コードタイプからフラグを解析する
 */
export const parseChordFlags = (chordType: string): ChordFlags => {
  const flags: ChordFlags = {
    isMinor: false,
    isDiminished: false,
    isAugmented: false,
    isSus2: false,
    isSus4: false,
    has7: false,
    hasMaj7: false,
    has9: false,
    hasAdd9: false,
    has11: false,
    hasAdd11: false,
    has13: false,
    hasAdd13: false,
    hasFlat9: false,
    hasSharp9: false,
    hasSharp11: false,
    isDim: false,
    isAug: false,
    has6: false,
    hasFlat5: false,
    hasSharp5: false,
  };

  // マイナーコードの検出
  if (chordType.includes("m") && !chordType.includes("maj")) {
    flags.isMinor = true;
  }

  // ディミニッシュコードの検出
  if (chordType.includes("dim") || chordType.includes("°")) {
    flags.isDiminished = true;
    flags.isDim = true;
  }

  // オーギュメントコードの検出
  if (chordType.includes("aug") || chordType.includes("+")) {
    flags.isAugmented = true;
    flags.isAug = true;
  }

  // サスペンデッドコードの検出
  if (chordType.includes("sus2")) {
    flags.isSus2 = true;
  }
  if (chordType.includes("sus4") || chordType.includes("sus")) {
    flags.isSus4 = true;
  }

  // 7thコードの検出
  if (chordType.includes("maj7") || chordType.includes("M7")) {
    flags.hasMaj7 = true;
    flags.has7 = true; // maj7もhas7フラグを立てる
  } else if (chordType.includes("7")) {
    flags.has7 = true;
  }

  // 拡張音の検出
  if (chordType.includes("9")) {
    if (chordType.includes("add9")) {
      flags.hasAdd9 = true;
    } else {
      flags.has9 = true;
    }
  }

  if (chordType.includes("11")) {
    if (chordType.includes("add11")) {
      flags.hasAdd11 = true;
    } else {
      flags.has11 = true;
    }
  }

  if (chordType.includes("13")) {
    if (chordType.includes("add13")) {
      flags.hasAdd13 = true;
    } else {
      flags.has13 = true;
    }
  }

  // 変化音の検出
  if (chordType.includes("♭9") || chordType.includes("b9")) {
    flags.hasFlat9 = true;
  }
  if (chordType.includes("♯9") || chordType.includes("#9")) {
    flags.hasSharp9 = true;
  }
  if (chordType.includes("♯11") || chordType.includes("#11")) {
    flags.hasSharp11 = true;
  }

  // 6thコードの検出
  if (chordType.includes("6")) {
    flags.has6 = true;
  }

  // フラット5、シャープ5の検出
  if (chordType.includes("♭5") || chordType.includes("b5")) {
    flags.hasFlat5 = true;
  }
  if (chordType.includes("♯5") || chordType.includes("#5")) {
    flags.hasSharp5 = true;
  }

  return flags;
};

/**
 * フラグからコード構造を生成する（coreの実装を使用）
 */
export const createChordStructure = coreCreateChordStructure;
