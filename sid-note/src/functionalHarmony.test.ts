import { describe, expect, it } from 'vitest';
import { ChordFunction, getChordFunction, getFunctionalHarmony } from './functionalHarmony';
import { Chord, Note, Scale } from './musicTheory';

describe('Functional Harmony', () => {
  describe('getChordFunction', () => {
    it('should return Tonic for I chord in major key', () => {
      const key = new Note('C');
      const chord = new Chord('C');
      expect(getChordFunction(chord, key)).toBe(ChordFunction.Tonic);
    });

    it('should return Dominant for V chord in major key', () => {
      const key = new Note('C');
      const chord = new Chord('G');
      expect(getChordFunction(chord, key)).toBe(ChordFunction.Dominant);
    });

    it('should return Subdominant for IV chord in major key', () => {
      const key = new Note('C');
      const chord = new Chord('F');
      expect(getChordFunction(chord, key)).toBe(ChordFunction.Subdominant);
    });

    it('should return Tonic for i chord in minor key', () => {
      const key = new Note('A');
      const chord = new Chord('Am');
      expect(getChordFunction(chord, key)).toBe(ChordFunction.Tonic);
    });

    it('should return Dominant for V chord in minor key', () => {
      const key = new Note('A');
      const chord = new Chord('E');
      expect(getChordFunction(chord, key)).toBe(ChordFunction.Dominant);
    });

    it('should return Subdominant for iv chord in minor key', () => {
      const key = new Note('A');
      const chord = new Chord('Dm');
      expect(getChordFunction(chord, key)).toBe(ChordFunction.Subdominant);
    });
  });

  describe('getFunctionalHarmony', () => {
    it('should return correct functional harmony for major key', () => {
      const key = new Note('C');
      const scale = new Scale(key, 'major');
      const result = getFunctionalHarmony(scale);
      expect(result).toEqual({
        tonic: new Chord('C'),
        supertonic: new Chord('Dm'),
        mediant: new Chord('Em'),
        subdominant: new Chord('F'),
        dominant: new Chord('G'),
        submediant: new Chord('Am'),
        leadingTone: new Chord('Bdim')
      });
    });

    it('should return correct functional harmony for minor key', () => {
      const key = new Note('A');
      const scale = new Scale(key, 'minor');
      const result = getFunctionalHarmony(scale);
      expect(result).toEqual({
        tonic: new Chord('Am'),
        supertonic: new Chord('Bdim'),
        mediant: new Chord('C'),
        subdominant: new Chord('Dm'),
        dominant: new Chord('E'),
        submediant: new Chord('F'),
        leadingTone: new Chord('G#dim')
      });
    });
  });
});
