import { isValidNote, normalizeNotation } from './notes';

export interface PitchInfo {
  /** 音名（例：C, C＃, B♭） */
  note: string;
  /** オクターブ（0-8） */
  octave: number;
}

export function isValidPitch(pitch: string): boolean {
  if (!pitch || typeof pitch !== "string") {
    return false;
  }
  const parsed = parsePitch(pitch);
  return parsed !== null;
}

export function parsePitch(pitch: string): PitchInfo | null {
  if (!pitch || typeof pitch !== "string") {
    return null;
  }

  const match = /^([A-G][#♯＃b♭]?)(\d+)$/.exec(pitch);
  if (!match) {
    return null;
  }

  const note = normalizeNotation(match[1]);
  const octave = parseInt(match[2], 10);

  if (!isValidNote(note) || octave < 0 || octave > 8) {
    return null;
  }

  return { note, octave };
}

export function addDefaultOctave(pitch: string, defaultOctave = 4): string {
  if (!pitch || typeof pitch !== "string") {
    return "";
  }

  if (/\d/.test(pitch)) {
    return pitch;
  }

  return pitch + defaultOctave.toString();
}

export function comparePitch(pitch1: string, pitch2: string): boolean {
  if (!pitch1 || !pitch2) {
    return false;
  }

  const info1 = parsePitch(pitch1);
  const info2 = parsePitch(pitch2);

  if (!info1 || !info2) {
    return false;
  }

  return info1.note === info2.note && info1.octave === info2.octave;
}
