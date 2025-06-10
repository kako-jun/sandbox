import { describe, expect, it } from "@jest/globals";
import {
  Note,
  compareNotes,
  getNoteFromIndex,
  getNoteIndex,
  isValidNote,
  isValidNoteName,
  normalizeNotation,
} from "./notes";

describe("Notes", () => {
  describe("Note class", () => {
    it("should create a valid note", () => {
      const note = new Note("C");
      expect(note.toString()).toBe("C");
    });

    it("should create a note with accidentals", () => {
      const sharpNote = new Note("F#");
      expect(sharpNote.toString()).toBe("F＃");
      const flatNote = new Note("Db");
      expect(flatNote.toString()).toBe("D♭");
    });

    it("should throw error for invalid note", () => {
      expect(() => new Note("H")).toThrow();
    });

    it("should check if note is major", () => {
      expect(new Note("C").isMajor()).toBe(true);
      expect(new Note("F#").isMajor()).toBe(false);
    });

    it("should compare notes", () => {
      const note1 = new Note("C");
      const note2 = new Note("C");
      const note3 = new Note("D");
      expect(note1.equals(note2)).toBe(true);
      expect(note1.equals(note3)).toBe(false);
    });
  });

  describe("normalizeNotation", () => {
    it("should normalize sharp notes", () => {
      expect(normalizeNotation("C#")).toBe("C＃");
      expect(normalizeNotation("F#")).toBe("F＃");
    });

    it("should normalize flat notes", () => {
      expect(normalizeNotation("Db")).toBe("D♭");
      expect(normalizeNotation("Gb")).toBe("G♭");
    });

    it("should return empty string for invalid notes", () => {
      expect(normalizeNotation("H")).toBe("");
      expect(normalizeNotation("")).toBe("");
    });
  });

  describe("isValidNoteName", () => {
    it("should validate basic notes", () => {
      expect(isValidNoteName("C")).toBe(true);
      expect(isValidNoteName("F")).toBe(true);
    });

    it("should validate notes with accidentals", () => {
      expect(isValidNoteName("C＃")).toBe(true);
      expect(isValidNoteName("D♭")).toBe(true);
    });

    it("should reject invalid notes", () => {
      expect(isValidNoteName("H")).toBe(false);
      expect(isValidNoteName("")).toBe(false);
    });
  });

  describe("getNoteIndex", () => {
    it("should return correct index for basic notes", () => {
      expect(getNoteIndex("C")).toBe(0);
      expect(getNoteIndex("F")).toBe(5);
    });

    it("should return correct index for notes with accidentals", () => {
      expect(getNoteIndex("C#")).toBe(1);
      expect(getNoteIndex("Db")).toBe(1);
    });

    it("should return -1 for invalid notes", () => {
      expect(getNoteIndex("H")).toBe(-1);
      expect(getNoteIndex("")).toBe(-1);
    });
  });

  describe("getNoteFromIndex", () => {
    it("should return correct note for index", () => {
      expect(getNoteFromIndex(0)).toBe("C");
      expect(getNoteFromIndex(5)).toBe("F");
    });

    it("should handle flat notes", () => {
      expect(getNoteFromIndex(1, true)).toBe("D♭");
      expect(getNoteFromIndex(6, true)).toBe("G♭");
    });

    it("should handle sharp notes", () => {
      expect(getNoteFromIndex(1)).toBe("C＃");
      expect(getNoteFromIndex(6)).toBe("F＃");
    });
  });

  describe("isValidNote", () => {
    it("should validate basic notes", () => {
      expect(isValidNote("C")).toBe(true);
      expect(isValidNote("F")).toBe(true);
    });

    it("should validate notes with accidentals", () => {
      expect(isValidNote("C#")).toBe(true);
      expect(isValidNote("Db")).toBe(true);
    });

    it("should reject notes with octave", () => {
      expect(isValidNote("C4")).toBe(false);
      expect(isValidNote("F#3")).toBe(false);
    });
  });

  describe("compareNotes", () => {
    it("should compare identical notes", () => {
      expect(compareNotes("C", "C")).toBe(true);
      expect(compareNotes("F#", "F#")).toBe(true);
    });

    it("should compare enharmonic notes", () => {
      expect(compareNotes("C#", "Db")).toBe(true);
      expect(compareNotes("F#", "Gb")).toBe(true);
    });

    it("should return false for different notes", () => {
      expect(compareNotes("C", "D")).toBe(false);
      expect(compareNotes("F#", "G")).toBe(false);
    });
  });
});
