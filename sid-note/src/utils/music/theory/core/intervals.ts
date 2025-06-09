/**
 * 音程計算に関するコアモジュール
 */
import { NoteType } from "@/schemas/trackSchema";
import { getNoteIndex, normalizeNotation, parsePitch } from "./notes";

/**
 * 2つの音の間の半音数を計算します
 */
export function getHalfStepDistance(noteFrom: string, noteTo: string): number | null {
  const index1 = getNoteIndex(noteFrom);
  const index2 = getNoteIndex(noteTo);
  if (index1 === -1 || index2 === -1) return null;

  return (index2 - index1 + 12) % 12;
}

/**
 * 音程を表す文字列を取得します
 */
export function getIntervalName(halfSteps: number, preferredNotation?: string): string {
  // トライトーンの特別処理
  if (halfSteps === 6) {
    if (preferredNotation) {
      return preferredNotation;
    }
    return "＃4/♭5"; // デフォルトは両方の表記
  }

  const intervalMap: { [key: number]: string } = {
    0: "1",
    1: "♭2",
    2: "2",
    3: "♭3",
    4: "3",
    5: "4",
    6: "♭5",
    7: "5",
    8: "＃5", // または♭6
    9: "6",
    10: "♭7",
    11: "7",
  };

  return intervalMap[halfSteps] || "";
}

/**
 * 2つの音の音程を計算します
 */
export function getInterval(rootNote: string, note: string, preferredNotation?: string): string {
  if (!rootNote || !note) return "";

  // オクターブ番号を除去して正規化
  const cleanRoot = normalizeNotation(rootNote.replace(/\d+$/, ""));
  const cleanNote = normalizeNotation(note.replace(/\d+$/, ""));

  const halfSteps = getHalfStepDistance(cleanRoot, cleanNote);
  if (halfSteps === null) return "";

  // 基本音名を取得（変化記号なし）
  const rootBaseName = cleanRoot.charAt(0);
  const noteBaseName = cleanNote.charAt(0);

  // 基本音名間の音程度数を計算
  const baseNotes = ["C", "D", "E", "F", "G", "A", "B"];
  const rootIndex = baseNotes.indexOf(rootBaseName);
  const noteIndex = baseNotes.indexOf(noteBaseName);
  const baseDegree = ((noteIndex - rootIndex + 7) % 7) + 1;

  // 基本音名間の理論上の半音数
  const expectedHalfSteps: { [key: number]: number } = {
    1: 0, // 完全1度
    2: 2, // 長2度
    3: 4, // 長3度
    4: 5, // 完全4度
    5: 7, // 完全5度
    6: 9, // 長6度
    7: 11, // 長7度
  };

  const expected = expectedHalfSteps[baseDegree];
  const difference = halfSteps - expected;

  // 音程の種類を決定
  let intervalType = "";
  if ([1, 4, 5].includes(baseDegree)) {
    // 完全音程
    if (difference === 0) intervalType = "";
    else if (difference === 1) intervalType = "＃";
    else if (difference === -1) intervalType = "♭";
  } else {
    // 長音程
    if (difference === 0) intervalType = "";
    else if (difference === 1) intervalType = "＃";
    else if (difference === -1) intervalType = "♭";
  }

  // トライトーンの特別処理
  if (halfSteps === 6) {
    if (preferredNotation) {
      return preferredNotation;
    }
    return "＃4/♭5"; // デフォルトは両方の表記
  }

  return intervalType + baseDegree;
}

/**
 * 2つの音の音程を表示用記号で取得します（コード理論用）
 */
export function getIntervalSymbol(rootNote: string, note: string, preferredNotation?: string): string {
  if (!rootNote || !note) return "";

  const halfSteps = getHalfStepDistance(rootNote, note);
  if (halfSteps === null) return "";

  return getIntervalName(halfSteps, preferredNotation);
}

/**
 * 2つの音が半音階的関係にあるかどうかを判定します
 *
 * @param currentNote - 現在の音
 * @param nextNote - 次の音
 * @returns 半音階的関係にある場合はtrue
 */
export function isChromaticNote(currentNote: NoteType, nextNote: NoteType): boolean {
  if (!currentNote.pitch || !nextNote.pitch) {
    return false;
  }

  const currentParsed = parsePitch(currentNote.pitch);
  const nextParsed = parsePitch(nextNote.pitch);

  if (!currentParsed || !nextParsed) {
    return false;
  }

  // 同じオクターブ内で半音階的な動きかどうかを判定
  const currentIndex = getNoteIndex(currentParsed.note);
  const nextIndex = getNoteIndex(nextParsed.note);

  if (currentIndex === -1 || nextIndex === -1) {
    return false;
  }

  // 半音差（上下どちらでも）の場合は半音階的とみなす
  const semitoneDistance = Math.abs((nextIndex - currentIndex + 12) % 12);
  return semitoneDistance === 1 || semitoneDistance === 11;
}
