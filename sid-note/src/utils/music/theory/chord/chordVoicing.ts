import { extractChordType, extractRootNote } from "@/utils/music/theory/core/chords";
import { getIntervalSymbol } from "@/utils/music/theory/core/intervals";
import { chromaticNotesSharp, getNoteIndex } from "@/utils/music/theory/core/notes";
import { ChordTone, createChordStructure, parseChordFlags } from "./chordStructure";

/**
 * 音程からクロマティックインデックスへの変換マップ
 */
const getTargetIndex = (rootIndex: number, interval: string): number => {
  const intervalMap: { [key: string]: number } = {
    "♭2": 1,
    "2": 2,
    "♭3": 3,
    "3": 4,
    "4": 5,
    "♭5": 6,
    "5": 7,
    "＃5": 8,
    "6": 9,
    "♭♭7": 9, // 減7度
    "♭7": 10,
    "7": 11,
    "♭9": 1,
    "9": 2,
    "♯9": 3,
    "11": 5,
    "♯11": 6,
    "13": 9,
  };

  return interval === "1" ? rootIndex : (rootIndex + (intervalMap[interval] || 0)) % 12;
};

/**
 * コードのポジションを取得します
 */
export const getChordPositions = (chordName: string): ChordTone[] => {
  // 特殊なコードの処理
  if (chordName === "ALL_KEYS") {
    return chromaticNotesSharp.map((note: string, index: number) => ({
      pitch: note,
      interval: getIntervalSymbol("C", note, index === 6 ? "＃4/♭5" : undefined), // トライトーンは両方表記
      string: (index % 4) + 1,
      fret: index * 2,
    }));
  }

  if (chordName === "WHITE_KEYS") {
    const notes = ["C", "D", "E", "F", "G", "A", "B"];
    return notes.map((note: string, index: number) => ({
      pitch: note,
      interval: getIntervalSymbol("C", note),
      string: (index % 4) + 1,
      fret: index * 2,
    }));
  }

  // ルート音を取得
  const rootNote = extractRootNote(chordName);
  if (!rootNote) return [];

  // コードタイプを判定
  const chordType = extractChordType(chordName);

  // オクターブコードの処理
  if (chordName.endsWith("8")) {
    return [
      {
        pitch: rootNote,
        interval: "1",
        string: 1,
        fret: 0,
      },
      {
        pitch: `${rootNote}`,
        interval: "8",
        string: 2,
        fret: 12,
      },
    ];
  }

  // パワーコードの処理
  if (chordType === "5") {
    return [
      {
        pitch: rootNote,
        interval: "1",
        string: 1,
        fret: 0,
      },
      {
        pitch: chromaticNotesSharp[(getNoteIndex(rootNote) + 7) % 12],
        interval: "5",
        string: 2,
        fret: 2,
      },
    ];
  }

  // 通常のコード処理
  const flags = parseChordFlags(chordType);
  const structure = createChordStructure(flags);

  // 構成音の集合を作成
  const intervals = new Set<string>();
  intervals.add(structure.root);
  intervals.add(structure.third);
  intervals.add(structure.fifth);
  if (structure.seventh) {
    intervals.add(structure.seventh);
  }
  structure.extensions.forEach((ext) => intervals.add(ext));

  // コードポジションの生成
  const positions: ChordTone[] = [];
  const sortedIntervals = Array.from(intervals).sort();
  const rootIndex = getNoteIndex(rootNote);

  sortedIntervals.forEach((interval: string, index: number) => {
    const targetIndex = getTargetIndex(rootIndex, interval);
    const pitch = interval === "1" ? rootNote : chromaticNotesSharp[targetIndex];

    positions.push({
      pitch,
      interval,
      string: (index % 4) + 1,
      fret: index * 2,
    });
  });

  return positions;
};
