/**
 * 音楽理論の基本となる音名処理のコアモジュール
 */

/**
 * ピッチ情報の型定義
 */
export type PitchInfo = {
  /** 音名（例：C, C＃, B♭） */
  note: string;
  /** オクターブ（0-8） */
  octave: number;
};

/**
 * 調号の位置情報の型定義
 */
export type KeyPosition = {
  circle: "outer" | "inner" | "none";
  index: number;
};

/**
 * 基本音名の配列（C, D, E, F, G, A, B）
 */
export const basicNotes = ["C", "D", "E", "F", "G", "A", "B"] as const;

/**
 * 半音階のノート配列（シャープ表記）
 */
export const chromaticNotesSharp = ["C", "C＃", "D", "D＃", "E", "F", "F＃", "G", "G＃", "A", "A＃", "B"];

/**
 * 半音階のノート配列（フラット表記）
 */
export const chromaticNotesFlat = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];

/**
 * 音名のインデックスマッピング
 */
export const noteIndexMap: { [key: string]: number } = {
  C: 0,
  "C＃": 1,
  "D♭": 1,
  D: 2,
  "D＃": 3,
  "E♭": 3,
  E: 4,
  "F♭": 4,
  F: 5,
  "E＃": 5,
  "F＃": 6,
  "G♭": 6,
  G: 7,
  "G＃": 8,
  "A♭": 8,
  A: 9,
  "A＃": 10,
  "B♭": 10,
  B: 11,
  "C♭": 11,
  "B＃": 0,
};

/**
 * 音名を正規化します
 */
export function normalizeNotation(noteName: string): string {
  if (!noteName) return "";

  // Normalize the symbols first
  const normalized = noteName.replace(/[#♯]/g, "＃").replace(/[b]/g, "♭");

  // Check if the normalized result is a valid note name pattern
  // A-Gの後に＃か♭が0個か1個続く形式であることを確認
  if (!/^[A-G][＃♭]?$/.test(normalized)) return "";

  return normalized;
}

/**
 * 指定された音名が有効な音名かどうかを判定します（オクターブなし）
 */
export function isValidNote(note: string): boolean {
  if (!note) return false;
  const normalized = normalizeNotation(note);
  return /^[A-G][＃♭]?$/.test(normalized) && !/\d/.test(note);
}

/**
 * 指定されたピッチが有効な音楽的ピッチかどうかを判定します
 */
export function isValidPitch(pitch: string): boolean {
  if (!pitch) return false;
  const parsed = parsePitch(pitch);
  return parsed !== null;
}

/**
 * 音名が有効かどうかを検証します
 */
export function isValidNoteName(noteName: string): boolean {
  if (!noteName || typeof noteName !== "string") {
    return false;
  }

  // 理論的音名のリスト（chromaticNotesには含まれていないが有効な音名）
  const theoreticalNotes = ["C♭", "E♯", "F♭", "B♯", "C＃", "F＃", "D＃"];

  // 特定の理論的音名の場合は直接trueを返す
  if (theoreticalNotes.includes(noteName)) {
    return true;
  }

  const normalizedNote = normalizeNotation(noteName);
  return normalizedNote in noteIndexMap;
}

/**
 * 異名同音の音名を取得します
 */
export function getEnharmonicNotes(noteName: string): string[] {
  const index = getNoteIndex(noteName);
  if (index === -1) return [];

  const normalizedInput = normalizeNotation(noteName);
  const candidates = [chromaticNotesSharp[index], chromaticNotesFlat[index]].filter(
    (n, i, arr) => arr.indexOf(n) === i
  ); // 重複を除去

  // 入力された音名と異なる異名同音を取得
  const enharmonics = candidates.filter((note) => note !== normalizedInput);

  // 異名同音がない場合（例：C, D, E, F, G, A, B）は元の音名を返す
  if (enharmonics.length === 0) {
    return [normalizedInput];
  }

  return enharmonics;
}

/**
 * ピッチ文字列を解析します
 */
export function parsePitch(pitch: string): PitchInfo | null {
  if (!pitch || typeof pitch !== "string") {
    return null;
  }

  // ピッチ文字列から音名部分とオクターブ部分を抽出
  const match = /^([A-G][#♯＃b♭]?)([0-8])$/.exec(pitch.trim());
  if (!match) return null;

  const [, notePart, octavePart] = match;
  const normalizedNote = normalizeNotation(notePart);
  const parsedOctave = parseInt(octavePart, 10);

  if (!isValidNoteName(normalizedNote) || parsedOctave < 0 || parsedOctave > 8) {
    return null;
  }

  return { note: normalizedNote, octave: parsedOctave };
}

/**
 * 音名の半音階インデックスを取得します
 */
export function getNoteIndex(noteName: string): number {
  const normalized = normalizeNotation(noteName);
  return noteIndexMap[normalized] ?? -1;
}

/**
 * インデックスから音名を取得します
 */
export function getNoteFromIndex(index: number, preferFlats = false): string {
  // インデックスを0-11の範囲に正規化
  const normalizedIndex = ((index % 12) + 12) % 12;

  // 負のインデックスの場合はフラット表記を優先
  const shouldUseFlats = preferFlats || index < 0;

  return shouldUseFlats ? chromaticNotesFlat[normalizedIndex] : chromaticNotesSharp[normalizedIndex];
}

/**
 * デフォルトのオクターブを付加します
 */
export function addDefaultOctave(pitch: string, defaultOctave = 4): string {
  if (!pitch) return "";
  const match = /^([A-G][＃♭]?)([0-8])?$/.exec(normalizeNotation(pitch));
  if (!match) return pitch;
  const [, note, octave] = match;
  return `${note}${octave || defaultOctave}`;
}

/**
 * 2つのピッチが同じ音（異名同音を含む）かどうかを判定します
 */
export function comparePitch(pitch1: string, pitch2: string): boolean {
  if (!pitch1 || !pitch2) return false;

  // オクターブ指定がない場合はfalseを返す
  if (!/\d/.test(pitch1) || !/\d/.test(pitch2)) return false;

  // 異名同音ペア（例：C＃4/D♭4）を処理
  if (pitch1.includes("/")) {
    const parts = pitch1.split("/");
    return parts.some((part) => comparePitch(part, pitch2));
  }

  if (pitch2.includes("/")) {
    const parts = pitch2.split("/");
    return parts.some((part) => comparePitch(pitch1, part));
  }

  // 通常の比較
  const parsed1 = parsePitch(pitch1);
  const parsed2 = parsePitch(pitch2);

  if (!parsed1 || !parsed2) return false;

  // オクターブが異なる場合はfalse
  if (parsed1.octave !== parsed2.octave) return false;

  // 音名が同じ場合はtrue
  if (parsed1.note === parsed2.note) return true;

  // 異名同音の場合もtrue
  const enharmonics = getEnharmonicNotes(parsed1.note);
  return enharmonics.includes(parsed2.note);
}

/**
 * 2つの音名（オクターブなし）が同じ音かどうかを判定します
 */
export function compareNotes(note1: string, note2: string): boolean {
  if (!note1 || !note2) return false;

  const norm1 = normalizeNotation(note1);
  const norm2 = normalizeNotation(note2);

  if (norm1 === norm2) return true;

  // 通常の異名同音関係をチェック
  const enharmonics1 = getEnharmonicNotes(norm1);
  if (enharmonics1.includes(norm2)) return true;

  // 特殊な異名同音関係をチェック
  const specialEnharmonics: [string, string][] = [
    ["B＃", "C"], // B＃とCは同じ音
    ["E＃", "F"], // E＃とFは同じ音
    ["C♭", "B"], // C♭とBは同じ音
    ["F♭", "E"], // F♭とEは同じ音
  ];

  return specialEnharmonics.some(([a, b]) => (norm1 === a && norm2 === b) || (norm1 === b && norm2 === a));
}

/**
 * 調号の位置情報を返します
 */
export function getKeyPosition(scale: string): KeyPosition {
  const majorKeys = ["C", "G", "D", "A", "E", "B", "F＃", "D♭", "A♭", "E♭", "B♭", "F"];
  const minorKeys = ["Am", "Em", "Bm", "F＃m", "C＃m", "G＃m", "D＃m", "B♭m", "Fm", "Cm", "Gm", "Dm"];

  const majorIndex = majorKeys.indexOf(scale);
  const minorIndex = minorKeys.indexOf(scale);

  if (majorIndex !== -1) {
    return {
      circle: "outer",
      index: majorIndex,
    };
  } else if (minorIndex !== -1) {
    return {
      circle: "inner",
      index: minorIndex,
    };
  }

  return {
    circle: "none",
    index: -1,
  };
}
