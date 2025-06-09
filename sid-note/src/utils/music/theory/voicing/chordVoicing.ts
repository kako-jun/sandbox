/**
 * コードボイシングユーティリティ
 * 
 * このモジュールは、コードのボイシングに関する機能を提供します。
 * コードの構成音の配置、弦の選択、フレットの決定など、
 * コードのボイシングに関する基本的な操作に対応します。
 * 
 * @module chordVoicing
 */

import { getChordStructure } from "@/utils/music/theory/core/chords";
import { getNoteIndex } from "@/utils/music/theory/core/notes";

/**
 * コードの構成音の定義
 */
export interface ChordTone {
  /** 音名 */
  pitch: string;
  /** 音程 */
  interval: string;
  /** 弦番号（1-6） */
  string: number;
  /** フレット番号（0-24） */
  fret: number;
}

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
 * コードのボイシングを取得します
 * 
 * @param rootNote - ルート音
 * @param chordType - コードタイプ
 * @returns コードのボイシング
 * @throws {Error} 無効なルート音またはコードタイプが指定された場合
 * 
 * @example
 * ```ts
 * getChordVoicing("C", "")     // => [{ pitch: "E", interval: "3", string: 1, fret: 0 }, ...]
 * getChordVoicing("G", "m7")   // => [{ pitch: "D", interval: "♭7", string: 1, fret: 3 }, ...]
 * ```
 */
export function getChordVoicing(rootNote: string, chordType: string): ChordTone[] {
  if (!rootNote || typeof rootNote !== "string") {
    throw new Error("ルート音は文字列である必要があります");
  }

  if (!chordType || typeof chordType !== "string") {
    throw new Error("コードタイプは文字列である必要があります");
  }

  const structure = getChordStructure(chordType);
  const rootIndex = getNoteIndex(rootNote);
  const voicing: ChordTone[] = [];

  // 各弦に対して音を配置
  for (let string = 1; string <= 6; string++) {
    const openNote = STRING_TUNINGS[string];
    const openIndex = getNoteIndex(openNote);
    const fret = (rootIndex - openIndex + 12) % 12;

    // ルート音を配置
    if (string === 6) {
      voicing.push({
        pitch: rootNote,
        interval: structure.root,
        string,
        fret,
      });
    }

    // 3度音を配置
    if (string === 5) {
      const thirdIndex = (rootIndex + 4) % 12;
      const thirdFret = (thirdIndex - openIndex + 12) % 12;
      voicing.push({
        pitch: getNoteFromIndex(thirdIndex),
        interval: structure.third,
        string,
        fret: thirdFret,
      });
    }

    // 5度音を配置
    if (string === 4) {
      const fifthIndex = (rootIndex + 7) % 12;
      const fifthFret = (fifthIndex - openIndex + 12) % 12;
      voicing.push({
        pitch: getNoteFromIndex(fifthIndex),
        interval: structure.fifth,
        string,
        fret: fifthFret,
      });
    }

    // 7度音を配置（存在する場合）
    if (structure.seventh && string === 3) {
      const seventhIndex = (rootIndex + 10) % 12;
      const seventhFret = (seventhIndex - openIndex + 12) % 12;
      voicing.push({
        pitch: getNoteFromIndex(seventhIndex),
        interval: structure.seventh,
        string,
        fret: seventhFret,
      });
    }

    // 拡張音を配置
    if (structure.extensions.length > 0 && string === 2) {
      const extensionIndex = (rootIndex + 14) % 12;
      const extensionFret = (extensionIndex - openIndex + 12) % 12;
      voicing.push({
        pitch: getNoteFromIndex(extensionIndex),
        interval: structure.extensions[0],
        string,
        fret: extensionFret,
      });
    }
  }

  return voicing;
}

/**
 * インデックスから音名を取得します
 * 
 * @param index - 音名のインデックス（0-11）
 * @returns 音名
 */
function getNoteFromIndex(index: number): string {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return notes[index];
}
