import { getChordPositions, getChordVoicing } from "./chordVoicing";

describe("chordVoicing module", () => {
  describe("getChordVoicing", () => {
    it("Cメジャーコードの構成音を生成できること", () => {
      const result = getChordVoicing("C", "C");
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        pitch: "C3",
        semitones: 0,
        string: 6,
        fret: 0,
        isInScale: true
      });
      expect(result[1]).toEqual({
        pitch: "E3",
        semitones: 4,
        string: 5,
        fret: 4,
        isInScale: true
      });
      expect(result[2]).toEqual({
        pitch: "G3",
        semitones: 7,
        string: 4,
        fret: 7,
        isInScale: true
      });
    });

    it("C7コードの構成音を生成できること", () => {
      const result = getChordVoicing("C7", "C");
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        pitch: "C3",
        semitones: 0,
        string: 6,
        fret: 0,
        isInScale: true
      });
      expect(result[1]).toEqual({
        pitch: "E3",
        semitones: 4,
        string: 5,
        fret: 4,
        isInScale: true
      });
      expect(result[2]).toEqual({
        pitch: "G3",
        semitones: 7,
        string: 4,
        fret: 7,
        isInScale: true
      });
      expect(result[3]).toEqual({
        pitch: "B♭3",
        semitones: 10,
        string: 3,
        fret: 10,
        isInScale: false
      });
    });

    it("Cmコードの構成音を生成できること", () => {
      const result = getChordVoicing("Cm", "C");
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        pitch: "C3",
        semitones: 0,
        string: 6,
        fret: 0,
        isInScale: true
      });
      expect(result[1]).toEqual({
        pitch: "E♭3",
        semitones: 3,
        string: 5,
        fret: 3,
        isInScale: false
      });
      expect(result[2]).toEqual({
        pitch: "G3",
        semitones: 7,
        string: 4,
        fret: 7,
        isInScale: true
      });
    });

    it("C6コードの構成音を生成できること", () => {
      const result = getChordVoicing("C6", "C");
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        pitch: "C3",
        semitones: 0,
        string: 6,
        fret: 0,
        isInScale: true
      });
      expect(result[1]).toEqual({
        pitch: "E3",
        semitones: 4,
        string: 5,
        fret: 4,
        isInScale: true
      });
      expect(result[2]).toEqual({
        pitch: "G3",
        semitones: 7,
        string: 4,
        fret: 7,
        isInScale: true
      });
      expect(result[3]).toEqual({
        pitch: "A3",
        semitones: 9,
        string: 2,
        fret: 9,
        isInScale: true
      });
    });

    it("異名同音を含むコードの構成音を生成できること", () => {
      const result = getChordVoicing("C＃", "C");
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        pitch: "C＃/D♭3",
        semitones: 0,
        string: 6,
        fret: 0,
        isInScale: false
      });
      expect(result[1]).toEqual({
        pitch: "F3",
        semitones: 4,
        string: 5,
        fret: 4,
        isInScale: false
      });
      expect(result[2]).toEqual({
        pitch: "G＃/A♭3",
        semitones: 7,
        string: 4,
        fret: 7,
        isInScale: false
      });
    });

    it("無効なコード名でエラーを投げること", () => {
      expect(() => getChordVoicing("", "C")).toThrow("コード名は文字列である必要があります");
      expect(() => getChordVoicing("X", "C")).toThrow("無効なルート音です: X");
    });

    it("無効なスケールキーでエラーを投げること", () => {
      expect(() => getChordVoicing("C", "")).toThrow("スケールキーは文字列である必要があります");
      expect(() => getChordVoicing("C", "X")).toThrow("無効なスケールキーです: X");
    });
  });

  describe("getChordPositions", () => {
    it("Cメジャーコードの位置を返すこと", () => {
      const result = getChordPositions("C");
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        pitch: "C",
        semitones: 0,
        string: 6,
        fret: 0
      });
      expect(result[1]).toEqual({
        pitch: "E",
        semitones: 4,
        string: 5,
        fret: 4
      });
      expect(result[2]).toEqual({
        pitch: "G",
        semitones: 7,
        string: 4,
        fret: 7
      });
    });

    it("C7コードの位置を返すこと", () => {
      const result = getChordPositions("C7");
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        pitch: "C",
        semitones: 0,
        string: 6,
        fret: 0
      });
      expect(result[1]).toEqual({
        pitch: "E",
        semitones: 4,
        string: 5,
        fret: 4
      });
      expect(result[2]).toEqual({
        pitch: "G",
        semitones: 7,
        string: 4,
        fret: 7
      });
      expect(result[3]).toEqual({
        pitch: "B♭",
        semitones: 10,
        string: 3,
        fret: 10
      });
    });

    it("Cmコードの位置を返すこと", () => {
      const result = getChordPositions("Cm");
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        pitch: "C",
        semitones: 0,
        string: 6,
        fret: 0
      });
      expect(result[1]).toEqual({
        pitch: "E♭",
        semitones: 3,
        string: 5,
        fret: 3
      });
      expect(result[2]).toEqual({
        pitch: "G",
        semitones: 7,
        string: 4,
        fret: 7
      });
    });

    it("C6コードの位置を返すこと", () => {
      const result = getChordPositions("C6");
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        pitch: "C",
        semitones: 0,
        string: 6,
        fret: 0
      });
      expect(result[1]).toEqual({
        pitch: "E",
        semitones: 4,
        string: 5,
        fret: 4
      });
      expect(result[2]).toEqual({
        pitch: "G",
        semitones: 7,
        string: 4,
        fret: 7
      });
      expect(result[3]).toEqual({
        pitch: "A",
        semitones: 9,
        string: 2,
        fret: 9
      });
    });

    it("異名同音を含むコードの位置を返すこと", () => {
      const result = getChordPositions("C＃");
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        pitch: "C＃/D♭",
        semitones: 0,
        string: 6,
        fret: 0
      });
      expect(result[1]).toEqual({
        pitch: "F",
        semitones: 4,
        string: 5,
        fret: 4
      });
      expect(result[2]).toEqual({
        pitch: "G＃/A♭",
        semitones: 7,
        string: 4,
        fret: 7
      });
    });

    it("無効なコード名でエラーを投げること", () => {
      expect(() => getChordPositions("")).toThrow("コード名は文字列である必要があります");
      expect(() => getChordPositions("X")).toThrow("無効なルート音です: X");
    });
  });
});
