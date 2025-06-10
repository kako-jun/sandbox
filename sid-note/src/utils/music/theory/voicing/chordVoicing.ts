/**
 * コードボイシングユーティリティ
 *
 * このモジュールは、コードのボイシングに関する機能を提供します。
 * コードの構成音の配置、弦の選択、フレットの決定など、
 * コードのボイシングに関する基本的な操作に対応します。
 *
 * @module chordVoicing
 */

import { getChordStructure, parseChord } from "@/utils/music/theory/core/chords";
import { getInterval } from "@/utils/music/theory/core/intervals";
import { getEnharmonicNotes, getNoteFromIndex, getNoteIndex, isValidNote } from "@/utils/music/theory/core/notes";
import { generateScaleFromKey, getScaleNoteNames } from "@/utils/music/theory/core/scales";

/**
 * 弦のチューニング定義
 */
const STRING_TUNINGS: Record<number, string> = {
  1: "E", // 1弦（高音弦）
  2: "B",
  3: "G",
  4: "D",
  5: "A",
  6: "E", // 6弦（低音弦）
};

/**
 * 半音数を音程の文字列に変換します（表示用）
 */
export function semitonesToInterval(semitones: number): string {
  switch (semitones) {
    case 0: return "1";
    case 1: return "♭2";
    case 2: return "2";
    case 3: return "♭3";
    case 4: return "3";
    case 5: return "4";
    case 6: return "♭5";
    case 7: return "5";
    case 8: return "＃5";
    case 9: return "6";
    case 10: return "♭7";
    case 11: return "7";
    case 12: return "8";
    case 13: return "♭9";
    case 14: return "9";
    case 15: return "＃9";
    case 17: return "11";
    case 18: return "＃11";
    case 21: return "13";
    default: return "";
  }
}

/**
 * 半音数を日本語の音程表記に変換します（表示用）
 */
export function semitonesToJapaneseInterval(semitones: number): string {
  switch (semitones) {
    case 0: return "完全1度";
    case 1: return "短2度";
    case 2: return "長2度";
    case 3: return "短3度";
    case 4: return "長3度";
    case 5: return "完全4度";
    case 6: return "減5度";
    case 7: return "完全5度";
    case 8: return "増5度";
    case 9: return "長6度";
    case 10: return "短7度";
    case 11: return "長7度";
    case 12: return "完全8度";
    case 13: return "短9度";
    case 14: return "長9度";
    case 15: return "増9度";
    case 17: return "完全11度";
    case 18: return "増11度";
    case 21: return "長13度";
    default: return "";
  }
}

/**
 * 半音数を英語の音程表記に変換します（表示用）
 */
export function semitonesToEnglishInterval(semitones: number): string {
  switch (semitones) {
    case 0: return "P1";
    case 1: return "m2";
    case 2: return "M2";
    case 3: return "m3";
    case 4: return "M3";
    case 5: return "P4";
    case 6: return "d5";
    case 7: return "P5";
    case 8: return "A5";
    case 9: return "M6";
    case 10: return "m7";
    case 11: return "M7";
    case 12: return "P8";
    case 13: return "m9";
    case 14: return "M9";
    case 15: return "A9";
    case 17: return "P11";
    case 18: return "A11";
    case 21: return "M13";
    default: return "";
  }
}

/**
 * 音程の文字列を半音数に変換します（core用）
 */
function intervalToSemitones(interval: string | null): number {
  if (!interval) return 0;
  // 入力の正規化
  const normalized = interval
    .replace(/b/g, "♭")
    .replace(/[#♯]/g, "＃");
  switch (normalized) {
    case "1": return 0;
    case "2": return 2;
    case "♭3": return 3;
    case "3": return 4;
    case "4": return 5;
    case "♭5": return 6;
    case "5": return 7;
    case "＃5": return 8;
    case "6": return 9;
    case "♭7": return 10;
    case "7": return 11;
    case "8": return 12;
    case "9": return 14;
    case "♭9": return 13;
    case "＃9": return 15;
    case "11": return 17;
    case "＃11": return 18;
    case "13": return 21;
    default: return 0;
  }
}

/**
 * コードの構成音の定義
 */
export interface ChordTone {
  /** 音名 */
  pitch: string;
  /** 音程（半音数） */
  semitones: number;
  /** 弦番号（1-6） */
  string: number;
  /** フレット番号（0-24） */
  fret: number;
}

/**
 * コードの構成音の配列を取得します
 *
 * @param chord - コード名（例：C, C7, Cm）
 * @param scaleKey - スケールキー（例：C, Am）
 * @returns コードの構成音の配列
 * @throws {Error} 無効なコード名またはスケールキーが指定された場合
 *
 * @example
 * ```ts
 * getChordVoicing("C", "C")  // => [{ pitch: "C3", semitones: 0, string: 6, fret: 0 }, ...]
 * getChordVoicing("C7", "C") // => [{ pitch: "C3", semitones: 0, string: 6, fret: 0 }, ...]
 * ```
 */
export function getChordVoicing(chord: string, scaleKey: string): ChordTone[] {
  if (!chord || typeof chord !== "string") {
    throw new Error("コード名は文字列である必要があります");
  }
  if (!scaleKey || typeof scaleKey !== "string") {
    throw new Error("スケールキーは文字列である必要があります");
  }

  // 入力の正規化
  const normalizedChord = chord
    .replace(/b/g, "♭")
    .replace(/[#♯]/g, "＃");
  const normalizedScaleKey = scaleKey
    .replace(/b/g, "♭")
    .replace(/[#♯]/g, "＃");

  const { rootNote, chordType } = parseChord(normalizedChord);
  if (!rootNote || !isValidNote(rootNote)) {
    throw new Error(`無効なルート音です: ${rootNote}`);
  }

  const scale = generateScaleFromKey(normalizedScaleKey);
  const scaleNotes = getScaleNoteNames(scale.root, scale.type);

  const positions = getChordPositions(normalizedChord);
  return positions.map((pos, index) => {
    const interval = getInterval(rootNote, pos.pitch);
    if (!interval) {
      throw new Error(`無効な音程です: ${rootNote} - ${pos.pitch}`);
    }
    const enharmonicNotes = getEnharmonicNotes(pos.pitch);
    const pitch = enharmonicNotes.length > 1 ? `${enharmonicNotes.join("/")}3` : `${pos.pitch}3`;
    return {
      pitch,
      semitones: interval.semitones,
      string: pos.string,
      fret: pos.fret,
      isInScale: scaleNotes.includes(pos.pitch)
    };
  });
}

/**
 * コードの構成音の位置を取得します
 *
 * @param chord - コード名（例：C, C7, Cm）
 * @returns コードの構成音の位置の配列
 * @throws {Error} 無効なコード名が指定された場合
 *
 * @example
 * ```ts
 * getChordPositions("C")  // => [{ pitch: "C", semitones: 0, string: 6, fret: 0 }, ...]
 * getChordPositions("C7") // => [{ pitch: "C", semitones: 0, string: 6, fret: 0 }, ...]
 * ```
 */
export function getChordPositions(chord: string): ChordTone[] {
  if (!chord || typeof chord !== "string") {
    throw new Error("コード名は文字列である必要があります");
  }

  // 入力の正規化
  const normalizedChord = chord
    .replace(/b/g, "♭")
    .replace(/[#♯]/g, "＃");

  const { rootNote, chordType } = parseChord(normalizedChord);
  if (!rootNote || !isValidNote(rootNote)) {
    throw new Error(`無効なルート音です: ${rootNote}`);
  }

  const structure = getChordStructure(chordType);
  if (!structure) {
    throw new Error(`無効なコードタイプです: ${chordType}`);
  }

  const positions: ChordTone[] = [];

  // ルート音
  positions.push({
    pitch: rootNote,
    semitones: 0,
    string: 6,
    fret: 0
  });

  // 3度
  if (structure.third) {
    const thirdSemitones = intervalToSemitones(structure.third);
    const thirdIndex = (getNoteIndex(rootNote) + thirdSemitones) % 12;
    const thirdNote = getNoteFromIndex(thirdIndex);
    positions.push({
      pitch: thirdNote,
      semitones: thirdSemitones,
      string: 5,
      fret: thirdSemitones === 3 ? 3 : 4
    });
  }

  // 5度
  if (structure.fifth) {
    const fifthSemitones = intervalToSemitones(structure.fifth);
    const fifthIndex = (getNoteIndex(rootNote) + fifthSemitones) % 12;
    const fifthNote = getNoteFromIndex(fifthIndex);
    positions.push({
      pitch: fifthNote,
      semitones: fifthSemitones,
      string: 4,
      fret: 7
    });
  }

  // 7度
  if (structure.seventh) {
    const seventhSemitones = intervalToSemitones(structure.seventh);
    const seventhIndex = (getNoteIndex(rootNote) + seventhSemitones) % 12;
    const seventhNote = getNoteFromIndex(seventhIndex);
    positions.push({
      pitch: seventhNote,
      semitones: seventhSemitones,
      string: 3,
      fret: 10
    });
  }

  // 6度
  if (structure.extensions.includes("6")) {
    const sixthSemitones = 9;
    const sixthIndex = (getNoteIndex(rootNote) + sixthSemitones) % 12;
    const sixthNote = getNoteFromIndex(sixthIndex);
    positions.push({
      pitch: sixthNote,
      semitones: sixthSemitones,
      string: 2,
      fret: 9
    });
  }

  return positions;
}
