import { getScaleDiatonicChords, getScaleDiatonicChordsWith7th, getScaleNoteNames, getScaleText } from "./scales";

describe("getScaleNoteNames", () => {
  it("Cメジャースケールの音名が正しく取得される", () => {
    expect(getScaleNoteNames("C")).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
  });

  it("Cマイナースケールの音名が正しく取得される", () => {
    expect(getScaleNoteNames("Cm")).toEqual(["C", "D", "E♭", "F", "G", "A♭", "B♭"]);
  });

  it("シャープ系スケールの音名が正しく取得される", () => {
    expect(getScaleNoteNames("G")).toEqual(["G", "A", "B", "C", "D", "E", "F＃"]);
    expect(getScaleNoteNames("D")).toEqual(["D", "E", "F＃", "G", "A", "B", "C＃"]);
    expect(getScaleNoteNames("A")).toEqual(["A", "B", "C＃", "D", "E", "F＃", "G＃"]);
  });

  it("フラット系スケールの音名が正しく取得される", () => {
    expect(getScaleNoteNames("F")).toEqual(["F", "G", "A", "B♭", "C", "D", "E"]);
    expect(getScaleNoteNames("B♭")).toEqual(["B♭", "C", "D", "E♭", "F", "G", "A"]);
    expect(getScaleNoteNames("E♭")).toEqual(["E♭", "F", "G", "A♭", "B♭", "C", "D"]);
  });

  it("マイナースケールの音名が正しく取得される", () => {
    expect(getScaleNoteNames("Am")).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
    expect(getScaleNoteNames("Em")).toEqual(["E", "F＃", "G", "A", "B", "C", "D"]);
    expect(getScaleNoteNames("Bm")).toEqual(["B", "C＃", "D", "E", "F＃", "G", "A"]);
  });

  it("全角記号を含むスケールの音名が正しく取得される", () => {
    expect(getScaleNoteNames("C＃")).toEqual(["C＃", "D＃", "E＃", "F＃", "G＃", "A＃", "B＃"]);
    expect(getScaleNoteNames("F＃")).toEqual(["F＃", "G＃", "A＃", "B", "C＃", "D＃", "E＃"]);
  });

  it("定義されていないスケールに対して空配列が返される", () => {
    expect(getScaleNoteNames("X")).toEqual([]);
    expect(getScaleNoteNames("")).toEqual([]);
    expect(getScaleNoteNames("Unknown")).toEqual([]);
  });

  it("異名同音のスケール（理論上のスケール）の音名が正しく取得される", () => {
    expect(getScaleNoteNames("C♭")).toEqual(["C♭", "D♭", "E♭", "F♭", "G♭", "A♭", "B♭"]);
    expect(getScaleNoteNames("B＃")).toEqual(["B＃", "C＃＃", "D＃＃", "E＃", "F＃＃", "G＃＃", "A＃＃"]);
  });
});

describe("scales module", () => {
  describe("getScaleDiatonicChords", () => {
    it("should return diatonic chords for major scale", () => {
      const chords = getScaleDiatonicChords("C");
      expect(chords).toEqual(["C", "Dm", "Em", "F", "G", "Am", "Bdim"]);
    });

    it("should return diatonic chords for minor scale", () => {
      const chords = getScaleDiatonicChords("Am");
      expect(chords).toEqual(["Am", "Bdim", "C", "Dm", "Em", "F", "G"]);
    });

    it("should return diatonic chords for sharp keys", () => {
      const chords = getScaleDiatonicChords("G");
      expect(chords).toEqual(["G", "Am", "Bm", "C", "D", "Em", "F#dim"]);
    });

    it("should return diatonic chords for flat keys", () => {
      const chords = getScaleDiatonicChords("F");
      expect(chords).toEqual(["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"]);
    });

    it("should return empty array for invalid scale", () => {
      const chords = getScaleDiatonicChords("invalid");
      expect(chords).toEqual([]);
    });
  });

  describe("getScaleDiatonicChordsWith7th", () => {
    it("should return 7th chords for major scale", () => {
      const chords = getScaleDiatonicChordsWith7th("C");
      expect(chords).toEqual(["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7b5"]);
    });

    it("should return 7th chords for minor scale", () => {
      const chords = getScaleDiatonicChordsWith7th("Am");
      expect(chords).toEqual(["Am7", "Bm7b5", "Cmaj7", "Dm7", "Em7", "Fmaj7", "G7"]);
    });

    it("should return 7th chords for sharp keys", () => {
      const chords = getScaleDiatonicChordsWith7th("G");
      expect(chords).toEqual(["Gmaj7", "Am7", "Bm7", "Cmaj7", "D7", "Em7", "F#m7b5"]);
    });

    it("should return 7th chords for flat keys", () => {
      const chords = getScaleDiatonicChordsWith7th("F");
      expect(chords).toEqual(["Fmaj7", "Gm7", "Am7", "Bbmaj7", "C7", "Dm7", "Em7b5"]);
    });

    it("should return empty array for invalid scale", () => {
      const chords = getScaleDiatonicChordsWith7th("invalid");
      expect(chords).toEqual([]);
    });
  });

  describe("getScaleText", () => {
    it("should return scale text for major scale", () => {
      expect(getScaleText("C")).toBe("Cメジャー");
      expect(getScaleText("G")).toBe("Gメジャー");
    });

    it("should return scale text for minor scale", () => {
      expect(getScaleText("Am")).toBe("Aマイナー");
      expect(getScaleText("Em")).toBe("Eマイナー");
    });

    it("should return scale text for sharp keys", () => {
      expect(getScaleText("F#")).toBe("F#メジャー");
      expect(getScaleText("C#m")).toBe("C#マイナー");
    });

    it("should return scale text for flat keys", () => {
      expect(getScaleText("Bb")).toBe("Bbメジャー");
      expect(getScaleText("Gm")).toBe("Gマイナー");
    });

    it("should return empty string for invalid scale", () => {
      expect(getScaleText("invalid")).toBe("");
    });
  });
});
