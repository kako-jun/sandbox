/**
 * 音楽の周波数計算に関するコアモジュール
 */

/**
 * 基準周波数のマッピング（A4 = 440Hz基準）
 */
export const baseFrequencies: { [key: string]: number } = {
  C: 261.63,
  "C＃": 277.18,
  "D♭": 277.18,
  D: 293.66,
  "D＃": 311.13,
  "E♭": 311.13,
  E: 329.63,
  F: 349.23,
  "F＃": 369.99,
  "G♭": 369.99,
  G: 392.0,
  "G＃": 415.3,
  "A♭": 415.3,
  A: 440.0,
  "A＃": 466.16,
  "B♭": 466.16,
  B: 493.88,
};

/**
 * 音名とオクターブから周波数を計算します。
 * 異名同音も正しく処理します。
 */
export function calculateFrequency(note: string, octave: number): number | null {
  const baseFreq = baseFrequencies[note];
  if (!baseFreq) return null;

  // オクターブの調整（ベースはオクターブ4）
  const octaveDiff = octave - 4;

  // 周波数計算の精度を改善
  return Math.round(baseFreq * Math.pow(2, octaveDiff) * 100) / 100;
}
