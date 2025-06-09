/**
 * スケール理論のコアモジュール
 */
import { chromaticNotesFlat, chromaticNotesSharp, normalizeNotation } from "./notes";

/**
 * スケール構成の定義
 */
export type ScaleStructure = {
  /** スケールの半音階パターン（全音=2, 半音=1 の数値配列） */
  pattern: number[];
  /** 表示名 */
  displayName: string;
  /** コードの種類パターン */
  chordQualities: string[];
  /** 7thコードの種類パターン */
  seventhChordQualities: string[];
};

/**
 * スケールの種類定義
 */
export const scaleTypes: Record<string, ScaleStructure> = {
  major: {
    pattern: [2, 2, 1, 2, 2, 2, 1], // WWH WWWH
    displayName: "Major",
    chordQualities: ["", "m", "m", "", "", "m", "dim"],
    seventhChordQualities: ["maj7", "m7", "m7", "maj7", "7", "m7", "m7♭5"],
  },
  minor: {
    pattern: [2, 1, 2, 2, 1, 2, 2], // WH WWHWW
    displayName: "Minor",
    chordQualities: ["m", "dim", "", "m", "m", "", ""],
    seventhChordQualities: ["m(maj7)", "m7♭5", "maj7", "m7", "m7", "maj7", "7"],
  },
};

/**
 * 理論上のスケール音名マッピング
 */
export const theoreticalScales: Record<string, string[]> = {
  // フラットキー
  "C♭": ["C♭", "D♭", "E♭", "F♭", "G♭", "A♭", "B♭"],
  "G♭": ["G♭", "A♭", "B♭", "C♭", "D♭", "E♭", "F"],
  "D♭": ["D♭", "E♭", "F", "G♭", "A♭", "B♭", "C"],
  "F♭": ["F♭", "G♭", "A♭", "B♭♭", "C♭", "D♭", "E♭"],

  // シャープキー
  "B＃": ["B＃", "C＃＃", "D＃＃", "E＃", "F＃＃", "G＃＃", "A＃＃"],
  "F＃": ["F＃", "G＃", "A＃", "B", "C＃", "D＃", "E＃"],
  "C＃": ["C＃", "D＃", "E＃", "F＃", "G＃", "A＃", "B＃"],
  "E＃": ["E＃", "F＃＃", "G＃＃", "A＃", "B＃", "C＃＃", "D＃＃"],
};

/**
 * スケールキーを解析してルート音と種類を取得します
 */
export function parseScaleKey(scaleKey: string): { root: string; type: string } | null {
  if (!scaleKey) return null;

  let root = scaleKey;
  let type = "major";

  // マイナースケールの場合
  if (scaleKey.endsWith("m")) {
    root = scaleKey.slice(0, -1);
    type = "minor";
  }

  // ルート音を正規化
  const normalizedRoot = normalizeNotation(root);
  if (!normalizedRoot) return null;

  // 理論上のスケールを確認
  if (theoreticalScales[normalizedRoot] || theoreticalScales[root]) {
    return { root: theoreticalScales[normalizedRoot] ? normalizedRoot : root, type };
  }

  // 通常のスケールの確認
  const isValidRoot = [chromaticNotesSharp, chromaticNotesFlat].some((notes) =>
    notes.some((note) => (note.includes("/") ? note.split("/").includes(normalizedRoot) : note === normalizedRoot))
  );

  if (!isValidRoot) {
    return null;
  }

  return {
    root: normalizedRoot,
    type,
  };
}

/**
 * スケール上の音名を取得します
 */
export function getScaleNoteNames(scaleKey: string): string[] {
  const parsed = parseScaleKey(scaleKey);
  if (!parsed) return [];

  const { root, type } = parsed;

  // 理論上のスケールを優先的に処理
  const theoreticalNotes = theoreticalScales[root];
  if (theoreticalNotes) {
    return type === "minor"
      ? [
          theoreticalNotes[0],
          theoreticalNotes[2],
          theoreticalNotes[3],
          theoreticalNotes[4],
          theoreticalNotes[5],
          theoreticalNotes[6],
          theoreticalNotes[1],
        ]
      : theoreticalNotes;
  }

  const pattern = scaleTypes[type]?.pattern;
  if (!pattern) return [];

  // フラット/シャープの判定
  const useFlat =
    root.includes("♭") ||
    ["F", "B♭", "E♭", "A♭", "D♭", "G♭", "C♭"].includes(root) ||
    (type === "major" && ["F"].includes(root)) ||
    (type === "minor" && ["C", "F", "B♭", "E♭", "A♭"].includes(root));

  // フラットを使う場合はフラット音名を、それ以外はシャープ音名を使用
  const chromaticNotes = useFlat ? chromaticNotesFlat : chromaticNotesSharp;
  const rootIndex = chromaticNotes.findIndex((note) => {
    // 異名同音を考慮して比較
    if (note.includes("/")) {
      return note.split("/").includes(root);
    }
    return note === root;
  });

  if (rootIndex === -1) return [];

  const notes = [];
  let currentIndex = rootIndex;

  for (const interval of pattern) {
    notes.push(chromaticNotes[currentIndex % 12]);
    currentIndex += interval;
  }

  return notes;
}

/**
 * スケールのダイアトニックコードを取得します
 */
export function getScaleDiatonicChords(scaleKey: string): string[] {
  const scaleNotes = getScaleNoteNames(scaleKey);
  if (scaleNotes.length < 7) return [];

  const parsed = parseScaleKey(scaleKey);
  if (!parsed) return [];

  const { type } = parsed;
  const qualities = scaleTypes[type]?.chordQualities;
  if (!qualities) return [];

  return scaleNotes.map((note, i) => `${note}${qualities[i]}`);
}

/**
 * スケールの7thコードを取得します
 */
export function getScaleDiatonicChordsWith7th(scaleKey: string): string[] {
  const scaleNotes = getScaleNoteNames(scaleKey);
  if (scaleNotes.length < 7) return [];

  const parsed = parseScaleKey(scaleKey);
  if (!parsed) return [];

  const { type } = parsed;
  const qualities = scaleTypes[type]?.seventhChordQualities;
  if (!qualities) return [];

  return scaleNotes.map((note, i) => `${note}${qualities[i]}`);
}

/**
 * スケールの表示名を返します
 */
export function getScaleText(scaleKey: string): string {
  const parsed = parseScaleKey(scaleKey);
  if (!parsed) return scaleKey;

  const { root, type } = parsed;
  const displayName = scaleTypes[type]?.displayName;
  if (!displayName) return scaleKey;

  return `${root} ${displayName} Scale`;
}
