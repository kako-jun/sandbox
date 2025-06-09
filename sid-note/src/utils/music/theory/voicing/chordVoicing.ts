/**
 * コードボイシングユーティリティ
 *
 * このモジュールは、コードのボイシングに関する機能を提供します。
 * コードの構成音の配置、弦の選択、フレットの決定など、
 * コードのボイシングに関する基本的な操作に対応します。
 *
 * @module chordVoicing
 */

import { getNoteIndex } from "@/utils/music/theory/core/notes";
import { generateScaleFromKey } from "@/utils/music/theory/core/scales";

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
 * @param chord - コード名（例：C, Dm, G7）
 * @param scaleKey - スケールのキー（例：C, Am, G#m）
 * @returns コードのボイシング
 */
export function getChordVoicing(chord: string, scaleKey: string) {
  const scale = generateScaleFromKey(scaleKey);
  const root = chord.replace(/[^A-G#b]/g, "");
  const type = chord.replace(root, "");
  const rootIndex = getNoteIndex(root);
  const positions = [];

  // 基本形
  positions.push({ pitch: root + "3", degree: 1 });
  positions.push({ pitch: getNoteFromIndex((rootIndex + 4) % 12) + "3", degree: 3 });
  positions.push({ pitch: getNoteFromIndex((rootIndex + 7) % 12) + "3", degree: 5 });

  // 7th
  if (type.includes("7")) {
    positions.push({ pitch: getNoteFromIndex((rootIndex + 10) % 12) + "3", degree: 7 });
  }

  // 転回形
  if (type.includes("6")) {
    positions.push({ pitch: getNoteFromIndex((rootIndex + 9) % 12) + "3", degree: 6 });
  }

  return positions;
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
