import { getNoteIndex, normalizeNotation } from "@/utils/music/theory/core/notes";

/**
 * 音名から音程を計算する（文脈に応じた表記）
 *
 * @param rootNote - ルート音
 * @param note - 比較対象の音名
 * @param preferredNotation - トライトーンの場合の優先表記（＃4または♭5）
 * @returns 音程を表す文字列
 */
export const getInterval = (rootNote: string, note: string, preferredNotation?: string): string => {
  if (!rootNote || !note) return "";

  // オクターブ番号を除去して正規化
  const cleanRoot = normalizeNotation(rootNote.replace(/\d+$/, ""));
  const cleanNote = normalizeNotation(note.replace(/\d+$/, ""));

  if (!cleanRoot || !cleanNote) return "";

  // 無効な音名をチェック
  const validNotes = [
    "C",
    "C＃",
    "D♭",
    "D",
    "D＃",
    "E♭",
    "E",
    "F",
    "F＃",
    "G♭",
    "G",
    "G＃",
    "A♭",
    "A",
    "A＃",
    "B♭",
    "B",
  ];
  const normalizedRoot = cleanRoot.replace(/[＃♯]/g, "＃").replace(/♭/g, "♭");
  const normalizedNote = cleanNote.replace(/[＃♯]/g, "＃").replace(/♭/g, "♭");

  if (!validNotes.includes(normalizedRoot) || !validNotes.includes(normalizedNote)) {
    return "";
  }

  // 半音数を計算
  const semitones = (getNoteIndex(cleanNote) - getNoteIndex(cleanRoot) + 12) % 12;

  // トライトーンの特別処理
  if (semitones === 6) {
    if (preferredNotation) {
      return preferredNotation;
    }
    // デフォルトは両方の表記
    return "＃4/♭5";
  }

  // 基本的な音程名のマッピング
  const intervalMap: { [key: number]: string } = {
    0: "1",
    1: "♭2",
    2: "2",
    3: "♭3",
    4: "3",
    5: "4",
    6: "♭5", // ディミニッシュコード用
    7: "5",
    8: "＃5", // または♭6
    9: "6",
    10: "♭7",
    11: "7",
  };

  return intervalMap[semitones] || "";
};
