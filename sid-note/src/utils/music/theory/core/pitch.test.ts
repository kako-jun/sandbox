import { describe, expect, it } from 'vitest';
import { addDefaultOctave, comparePitch, isValidPitch, parsePitch } from './pitch';

describe('Pitch', () => {
  describe('isValidPitch', () => {
    it('should return true for valid pitches', () => {
      expect(isValidPitch('C4')).toBe(true);
      expect(isValidPitch('F#3')).toBe(true);
      expect(isValidPitch('Bb5')).toBe(true);
    });

    it('should return false for invalid pitches', () => {
      expect(isValidPitch('H4')).toBe(false);
      expect(isValidPitch('C')).toBe(false);
      expect(isValidPitch('')).toBe(false);
    });
  });

  describe('parsePitch', () => {
    it('should parse valid pitches', () => {
      expect(parsePitch('C4')).toEqual({ note: 'C', octave: 4 });
      expect(parsePitch('F#3')).toEqual({ note: 'F＃', octave: 3 });
      expect(parsePitch('Bb5')).toEqual({ note: 'B♭', octave: 5 });
    });

    it('should return null for invalid pitches', () => {
      expect(parsePitch('H4')).toBeNull();
      expect(parsePitch('C')).toBeNull();
      expect(parsePitch('')).toBeNull();
    });
  });

  describe('addDefaultOctave', () => {
    it('should add default octave to notes without octave', () => {
      expect(addDefaultOctave('C')).toBe('C4');
      expect(addDefaultOctave('F#')).toBe('F#4');
      expect(addDefaultOctave('Bb')).toBe('Bb4');
    });

    it('should not modify pitches with existing octave', () => {
      expect(addDefaultOctave('C4')).toBe('C4');
      expect(addDefaultOctave('F#3')).toBe('F#3');
      expect(addDefaultOctave('Bb5')).toBe('Bb5');
    });

    it('should use custom default octave', () => {
      expect(addDefaultOctave('C', 5)).toBe('C5');
      expect(addDefaultOctave('F#', 2)).toBe('F#2');
      expect(addDefaultOctave('Bb', 6)).toBe('Bb6');
    });
  });

  describe('comparePitch', () => {
    it('should return true for identical pitches', () => {
      expect(comparePitch('C4', 'C4')).toBe(true);
      expect(comparePitch('F#3', 'F#3')).toBe(true);
      expect(comparePitch('Bb5', 'Bb5')).toBe(true);
    });

    it('should return false for different pitches', () => {
      expect(comparePitch('C4', 'D4')).toBe(false);
      expect(comparePitch('C4', 'C5')).toBe(false);
      expect(comparePitch('F#3', 'Gb3')).toBe(false);
    });

    it('should return false for invalid pitches', () => {
      expect(comparePitch('C4', 'H4')).toBe(false);
      expect(comparePitch('C', 'C4')).toBe(false);
      expect(comparePitch('', 'C4')).toBe(false);
    });
  });
});
