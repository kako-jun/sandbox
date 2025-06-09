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

describe("getScaleDiatonicChords", () => {
  it("メジャースケールのダイアトニックコードが正しく取得される", () => {
    expect(getScaleDiatonicChords("C")).toEqual(["C", "Dm", "Em", "F", "G", "Am", "Bdim"]);
  });

  it("マイナースケールのダイアトニックコードが正しく取得される", () => {
    expect(getScaleDiatonicChords("Am")).toEqual(["Am", "Bdim", "C", "Dm", "Em", "F", "G"]);
  });

  it("複雑なスケールのダイアトニックコードが正しく取得される", () => {
    expect(getScaleDiatonicChords("C＃")).toEqual(["C＃", "D＃m", "E＃m", "F＃", "G＃", "A＃m", "B＃dim"]);
    expect(getScaleDiatonicChords("F＃")).toEqual(["F＃", "G＃m", "A＃m", "B", "C＃", "D＃m", "E＃dim"]);
  });

  it("スケールキーが空の場合は空配列が返される", () => {
    expect(getScaleDiatonicChords("")).toEqual([]);
  });
});

describe("getScaleDiatonicChordsWith7th", () => {
  it("メジャースケールの7thコードが正しく取得される", () => {
    expect(getScaleDiatonicChordsWith7th("C")).toEqual(["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7♭5"]);
  });

  it("マイナースケールの7thコードが正しく取得される", () => {
    expect(getScaleDiatonicChordsWith7th("Am")).toEqual(["Am(maj7)", "Bm7♭5", "Cmaj7", "Dm7", "Em7", "Fmaj7", "G7"]);
  });

  it("複雑なスケールの7thコードが正しく取得される", () => {
    expect(getScaleDiatonicChordsWith7th("C＃")).toEqual([
      "C＃maj7",
      "D＃m7",
      "E＃m7",
      "F＃maj7",
      "G＃7",
      "A＃m7",
      "B＃m7♭5",
    ]);
  });

  it("定義されていないスケールに対して空配列が返される", () => {
    expect(getScaleDiatonicChordsWith7th("X")).toEqual([]);
  });
});

describe("getScaleText", () => {
  it("メジャースケールの表示名が正しく取得される", () => {
    expect(getScaleText("C")).toBe("C Major Scale");
    expect(getScaleText("G")).toBe("G Major Scale");
    expect(getScaleText("D")).toBe("D Major Scale");
    expect(getScaleText("A")).toBe("A Major Scale");
    expect(getScaleText("E")).toBe("E Major Scale");
    expect(getScaleText("B")).toBe("B Major Scale");
    expect(getScaleText("F")).toBe("F Major Scale");
  });

  it("マイナースケールの表示名が正しく取得される", () => {
    expect(getScaleText("Cm")).toBe("C Minor Scale");
    expect(getScaleText("Am")).toBe("A Minor Scale");
    expect(getScaleText("Em")).toBe("E Minor Scale");
    expect(getScaleText("Bm")).toBe("B Minor Scale");
    expect(getScaleText("Fm")).toBe("F Minor Scale");
    expect(getScaleText("Gm")).toBe("G Minor Scale");
    expect(getScaleText("Dm")).toBe("D Minor Scale");
  });

  it("シャープ系スケールの表示名が正しく取得される", () => {
    expect(getScaleText("C＃")).toBe("C＃ Major Scale");
    expect(getScaleText("F＃")).toBe("F＃ Major Scale");
    expect(getScaleText("C＃m")).toBe("C＃ Minor Scale");
    expect(getScaleText("F＃m")).toBe("F＃ Minor Scale");
    expect(getScaleText("G＃m")).toBe("G＃ Minor Scale");
  });

  it("フラット系スケールの表示名が正しく取得される", () => {
    expect(getScaleText("D♭")).toBe("D♭ Major Scale");
    expect(getScaleText("A♭")).toBe("A♭ Major Scale");
    expect(getScaleText("E♭")).toBe("E♭ Major Scale");
    expect(getScaleText("B♭")).toBe("B♭ Major Scale");
    expect(getScaleText("B♭m")).toBe("B♭ Minor Scale");
    expect(getScaleText("A♭m")).toBe("A♭ Minor Scale");
  });

  it("理論上のスケール（異名同音）の表示名が正しく取得される", () => {
    expect(getScaleText("C♭")).toBe("C♭ Major Scale");
    expect(getScaleText("B＃")).toBe("B＃ Major Scale");
    expect(getScaleText("C♭m")).toBe("C♭ Minor Scale");
    expect(getScaleText("B＃m")).toBe("B＃ Minor Scale");
  });

  it("定義されていないスケールで元の文字列が返される", () => {
    expect(getScaleText("X")).toBe("X");
    expect(getScaleText("Unknown")).toBe("Unknown");
    expect(getScaleText("")).toBe("");
  });

  it("複雑な調号を持つスケールの表示名が正しく取得される", () => {
    expect(getScaleText("D＃")).toBe("D＃ Major Scale");
    expect(getScaleText("D＃m")).toBe("D＃ Minor Scale");
    expect(getScaleText("A＃")).toBe("A＃ Major Scale");
    expect(getScaleText("A＃m")).toBe("A＃ Minor Scale");
  });

  it("異なる記号表記で正しく処理される", () => {
    // 現在の実装では完全一致のみ対応
    expect(getScaleText("F＃")).toBe("F＃ Major Scale");
    expect(getScaleText("G♭")).toBe("G♭ Major Scale");
  });
});
