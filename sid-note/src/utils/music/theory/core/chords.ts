/**
 * コード理論のコアモジュール
 */

import { chromaticNotesFlat, chromaticNotesSharp, isValidNoteName } from "./notes";

/**
 * コード構造の基本定義
 */
export interface ChordStructure {
  root: string; // ルート音（1度）
  third: string; // 3度音
  fifth: string; // 5度音
  seventh: string | null; // 7度音
  extensions: Set<string>; // その他の拡張音
}

/**
 * コードフラグの型定義
 */
export interface ChordFlags {
  isMinor: boolean;
  isDiminished: boolean;
  isAugmented: boolean;
  isSus2: boolean;
  isSus4: boolean;
  has7: boolean;
  hasMaj7: boolean;
  has9: boolean;
  hasAdd9: boolean;
  has11: boolean;
  hasAdd11: boolean;
  has13: boolean;
  hasAdd13: boolean;
  hasFlat9: boolean;
  hasSharp9: boolean;
  hasSharp11: boolean;
  // chordStructure.ts で使用されている追加プロパティ
  isDim: boolean;
  isAug: boolean;
  has6: boolean;
  hasFlat5: boolean;
  hasSharp5: boolean;
}

/**
 * コードの構成音を表す型
 */
export interface ChordTone {
  pitch: string; // 音名（例："E1", "G1"）
  interval: string; // 音程（例："1", "♭3", "5"）
  string: number; // 弦番号（1: G弦, 2: D弦, 3: A弦, 4: E弦）
  fret: number; // フレット位置（0=開放弦, 3=3フレット等）
}

/**
 * コード構成要素の型定義
 */
export interface ChordComponents {
  rootNote: string;
  chordType: string;
  slashBass?: string;
}

/**
 * コード表記からルート音を抽出します
 */
export function extractRootNote(chordName: string): string {
  if (!chordName || typeof chordName !== "string") {
    return "";
  }

  // 特殊なケースを直接処理
  if (chordName.startsWith("C♭") || chordName.startsWith("Cb")) return "C♭";
  if (chordName.startsWith("E♯") || chordName.startsWith("E#")) return "E♯";
  if (chordName.startsWith("F♭") || chordName.startsWith("Fb")) return "F♭";
  if (chordName.startsWith("B♯") || chordName.startsWith("B#")) return "B♯";

  // スラッシュベースを含む場合は、スラッシュより前の部分のみを処理
  const mainChord = chordName.split("/")[0];

  // 基本音名と半音階の音名を組み合わせて全音符配列を作成
  // 理論的音名も追加（C♭、E♯、F♭、B♯）と代替表記
  const theoreticalNotes = ["C♭", "Cb", "E♯", "E#", "F♭", "Fb", "B♯", "B#"];
  const allNotes = [...chromaticNotesSharp, ...chromaticNotesFlat, ...theoreticalNotes];

  // 長い音名から順に確認（F#を先にチェックしてFと混同を避ける）
  const sortedNotes = allNotes.sort((a, b) => b.length - a.length);

  for (const note of sortedNotes) {
    if (mainChord.startsWith(note) && isValidNoteName(note)) {
      return note;
    }
  }

  return "";
}

/**
 * コード表記からコードタイプ（装飾部分）を抽出します
 */
export function extractChordType(chordName: string): string {
  if (!chordName || typeof chordName !== "string") {
    return "";
  }

  // スラッシュを含む場合はスラッシュより前のみを処理
  const mainPart = chordName.split("/")[0];

  // まずルート音を取得
  const rootNote = extractRootNote(mainPart);
  if (!rootNote) {
    return "";
  }

  // ルート音以降の部分を抽出
  return mainPart.slice(rootNote.length);
}

/**
 * コード表記からスラッシュベース部分を抽出します
 */
export function extractSlashBass(chordName: string): string | undefined {
  if (!chordName || typeof chordName !== "string" || chordName === "/") {
    return undefined;
  }

  const slashIndex = chordName.indexOf("/");
  if (slashIndex === -1 || slashIndex === chordName.length - 1) {
    return undefined;
  }

  const bass = chordName.slice(slashIndex + 1);
  return isValidNoteName(bass) ? bass : undefined;
}

/**
 * コード表記を構成要素に分解します
 */
export function parseChord(chordName: string): ChordComponents | null {
  if (!chordName || typeof chordName !== "string") {
    return null;
  }

  const rootNote = extractRootNote(chordName);
  if (!rootNote) {
    return null;
  }

  return {
    rootNote,
    chordType: extractChordType(chordName),
    slashBass: extractSlashBass(chordName),
  };
}

/**
 * コードの構造を解析します
 */
export function createChordStructure(flags: ChordFlags): ChordStructure {
  const structure: ChordStructure = {
    root: "1",
    third: "3",
    fifth: "5",
    seventh: null,
    extensions: new Set<string>(),
  };

  // 3度音の設定
  if (flags.isSus2) {
    structure.third = "2";
  } else if (flags.isSus4) {
    structure.third = "4";
  } else if (flags.isMinor || flags.isDiminished) {
    structure.third = "♭3";
  } else {
    structure.third = "3";
  }

  // 5度音の設定
  if (flags.isDiminished) {
    structure.fifth = "♭5";
  } else if (flags.isAugmented) {
    structure.fifth = "＃5";
  } else {
    structure.fifth = "5";
  }

  // 7度音の設定
  if (flags.hasMaj7) {
    structure.seventh = "7";
  } else if (flags.has7) {
    structure.seventh = "♭7";
  } else if (flags.isDiminished) {
    structure.seventh = "♭♭7";
  }

  // 拡張音の設定
  if (flags.has9 || flags.hasAdd9) {
    structure.extensions.add("9");
  }
  if (flags.has11 || flags.hasAdd11) {
    structure.extensions.add("11");
  }
  if (flags.has13 || flags.hasAdd13) {
    structure.extensions.add("13");
  }

  // 変化拡張音の設定
  if (flags.hasFlat9) {
    structure.extensions.add("♭9");
  }
  if (flags.hasSharp9) {
    structure.extensions.add("♯9");
  }
  if (flags.hasSharp11) {
    structure.extensions.add("♯11");
  }

  // 暗黙のルール適用
  if ((flags.has9 || flags.has11 || flags.has13) && !structure.seventh) {
    structure.seventh = "♭7";
  }

  return structure;
}
