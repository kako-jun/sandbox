/**
 * オーディオ設定の定数
 */
export const AUDIO_CONFIG = {
  // オシレータ設定
  sawtoothOscillator: {
    type: "sawtooth" as OscillatorType,
    gainMax: 0.3,
    gainSustain: 0.2,
    filterFrequency: 1000,
    filterQ: 1,
  },
  triangleOscillator: {
    type: "triangle" as OscillatorType,
    gainMax: 0.2,
  },
  // エンベロープ設定
  envelope: {
    attack: 0.01, // 秒
    decay: 0.1, // 秒
    sustain: 0.2, // 最大音量に対する比率
    release: 0.1, // 秒
  },
  // デフォルトオクターブ
  defaultOctave: 4,
  chordDefaultOctave: 3,
} as const;
