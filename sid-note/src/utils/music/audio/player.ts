import { BASE_FREQUENCIES } from "@/utils/music/theory/core/frequency";
import { parsePitch } from "@/utils/music/theory/core/notes";
import { getChordPositions } from "@/utils/music/theory/voicing/chordVoicing";
import { AUDIO_CONFIG } from "./audioConfig";
import { AudioResourceManager } from "./audioResourceManager";

/**
 * オクターブを追加した音名を取得します
 */
function addDefaultOctave(note: string, defaultOctave: number): string {
  if (!note) return note;
  return note.includes("/")
    ? note
        .split("/")
        .map((n) => (n.match(/\d$/) ? n : `${n}${defaultOctave}`))
        .join("/")
    : note.match(/\d$/)
    ? note
    : `${note}${defaultOctave}`;
}

/**
 * 音名から周波数を計算します。
 * 音名とオクターブから、その音の正確な周波数を返します。
 * 異名同音も正しく処理します。
 */
export function getNoteFrequency(note: string): number | null {
  if (!note) return null;

  // スラッシュで区切られた異名同音を処理
  if (note.includes("/")) {
    const notes = note.split("/");
    for (const n of notes) {
      const freq = getNoteFrequency(n);
      if (freq !== null) return freq;
    }
    return null;
  }

  const pitch = parsePitch(note);
  if (!pitch) return null;

  const baseFreq = BASE_FREQUENCIES[pitch.note];
  if (!baseFreq) return null;

  // オクターブの調整（ベースはオクターブ4）
  const octaveDiff = pitch.octave - 4;

  // 周波数計算の精度を改善
  return Math.round(baseFreq * Math.pow(2, octaveDiff) * 100) / 100;
}

/**
 * 単音を再生します。
 * SFCライクな音色（ノコギリ波と三角波の組み合わせ）で音を生成します。
 */
export function playNoteSound(note: string, duration: number = 1): void {
  if (!note) {
    console.error("Note is required");
    return;
  }

  const pitchWithOctave = addDefaultOctave(note, AUDIO_CONFIG.defaultOctave);
  const frequency = getNoteFrequency(pitchWithOctave);

  if (frequency === null) {
    console.error(`Invalid note: ${note}`);
    return;
  }

  try {
    const audioManager = AudioResourceManager.getInstance();
    const ctx = audioManager.getContext();
    const startTime = ctx.currentTime;
    const stopTime = startTime + duration;

    // ノコギリ波オシレータの作成と設定
    const sawtooth = audioManager.createOscillator(frequency, startTime, stopTime, {
      type: AUDIO_CONFIG.sawtoothOscillator.type,
      gainMax: AUDIO_CONFIG.sawtoothOscillator.gainMax,
      filterFreq: AUDIO_CONFIG.sawtoothOscillator.filterFrequency,
      filterQ: AUDIO_CONFIG.sawtoothOscillator.filterQ,
    });

    // 三角波オシレータの作成と設定
    const triangle = audioManager.createOscillator(frequency, startTime, stopTime, {
      type: AUDIO_CONFIG.triangleOscillator.type,
      gainMax: AUDIO_CONFIG.triangleOscillator.gainMax,
    });

    // ノードの接続
    audioManager.connectNodes(sawtooth);
    audioManager.connectNodes(triangle);

    // オシレータの開始
    audioManager.startOscillator({ oscillator: sawtooth.oscillator, startTime, stopTime });
    audioManager.startOscillator({ oscillator: triangle.oscillator, startTime, stopTime });
  } catch (error) {
    console.error("Error playing note:", error);
  }
}

/**
 * コードの構成音を取得します。
 */
function getChordPitches(chordName: string): string[] {
  if (!chordName) return [];

  try {
    const positions = getChordPositions(chordName);
    if (!positions || !positions.length) return [];

    return positions
      .filter((position) => position.pitch)
      .map((position) => addDefaultOctave(position.pitch, AUDIO_CONFIG.chordDefaultOctave));
  } catch (error) {
    console.error("Error getting chord pitches:", error);
    return [];
  }
}

/**
 * コードを再生します。
 * 指定されたコードの構成音を同時に再生します。
 */
export function playChord(chordName: string, duration: number = 1): void {
  if (!chordName) {
    console.error("Chord name is required");
    return;
  }

  const pitches = getChordPitches(chordName);
  if (!pitches.length) {
    console.error(`Invalid chord or no pitches found: ${chordName}`);
    return;
  }

  // コードの構成音を同時に再生
  pitches.forEach((pitch) => playNoteSound(pitch, duration));
}
