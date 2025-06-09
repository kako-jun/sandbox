import {
  addDefaultOctave,
  basicNotes,
  chromaticNotesFlat,
  chromaticNotesSharp,
  compareNotes,
  comparePitch,
  getEnharmonicNotes,
  getKeyPosition,
  getNoteFromIndex,
  getNoteIndex,
  isValidNote,
  isValidNoteName,
  isValidPitch,
  normalizeNotation,
  parsePitch,
} from "./notes";

describe("constants", () => {
  it("basicNotesが正しい値を持つ", () => {
    expect(basicNotes).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
  });

  it("chromaticNotesSharpが12音を持つ", () => {
    expect(chromaticNotesSharp).toHaveLength(12);
    expect(chromaticNotesSharp[0]).toBe("C");
    expect(chromaticNotesSharp[1]).toBe("C＃");
    expect(chromaticNotesSharp[11]).toBe("B");
  });

  it("chromaticNotesFlatが12音を持つ", () => {
    expect(chromaticNotesFlat).toHaveLength(12);
    expect(chromaticNotesFlat[0]).toBe("C");
    expect(chromaticNotesFlat[1]).toBe("D♭");
    expect(chromaticNotesFlat[11]).toBe("B");
  });
});

describe("getNoteIndex", () => {
  it("基本の音名から正しいインデックスが取得される", () => {
    expect(getNoteIndex("C")).toBe(0);
    expect(getNoteIndex("D")).toBe(2);
    expect(getNoteIndex("E")).toBe(4);
    expect(getNoteIndex("F")).toBe(5);
    expect(getNoteIndex("G")).toBe(7);
    expect(getNoteIndex("A")).toBe(9);
    expect(getNoteIndex("B")).toBe(11);
  });

  it("シャープ記号付きの音名から正しいインデックスが取得される", () => {
    expect(getNoteIndex("C＃")).toBe(1);
    expect(getNoteIndex("D＃")).toBe(3);
    expect(getNoteIndex("F＃")).toBe(6);
    expect(getNoteIndex("G＃")).toBe(8);
    expect(getNoteIndex("A＃")).toBe(10);
  });

  it("フラット記号付きの音名から正しいインデックスが取得される", () => {
    expect(getNoteIndex("D♭")).toBe(1); // C＃と同じ
    expect(getNoteIndex("E♭")).toBe(3); // D＃と同じ
    expect(getNoteIndex("G♭")).toBe(6); // F＃と同じ
    expect(getNoteIndex("A♭")).toBe(8); // G＃と同じ
    expect(getNoteIndex("B♭")).toBe(10); // A＃と同じ
  });

  it("無効な入力に対して-1を返す", () => {
    expect(getNoteIndex("")).toBe(-1);
    expect(getNoteIndex("H")).toBe(-1);
    expect(getNoteIndex("X")).toBe(-1);
  });
});

describe("normalizeNotation", () => {
  it("標準的な音名は変更されない", () => {
    expect(normalizeNotation("C")).toBe("C");
    expect(normalizeNotation("D")).toBe("D");
    expect(normalizeNotation("E")).toBe("E");
    expect(normalizeNotation("F")).toBe("F");
    expect(normalizeNotation("G")).toBe("G");
    expect(normalizeNotation("A")).toBe("A");
    expect(normalizeNotation("B")).toBe("B");
  });

  it("シャープ記号が正規化される", () => {
    expect(normalizeNotation("C#")).toBe("C＃");
    expect(normalizeNotation("F#")).toBe("F＃");
  });

  it("フラット記号が正規化される", () => {
    expect(normalizeNotation("Db")).toBe("D♭");
    expect(normalizeNotation("Eb")).toBe("E♭");
  });

  it("無効な入力に対して空文字列を返す", () => {
    expect(normalizeNotation("")).toBe("");
    expect(normalizeNotation("H")).toBe("");
    expect(normalizeNotation("X")).toBe("");
  });
});

describe("addDefaultOctave", () => {
  it("オクターブ番号がない音名にデフォルトのオクターブ4を追加する", () => {
    expect(addDefaultOctave("C")).toBe("C4");
    expect(addDefaultOctave("D")).toBe("D4");
    expect(addDefaultOctave("E")).toBe("E4");
  });

  it("既にオクターブ番号がある場合はそのまま返す", () => {
    expect(addDefaultOctave("C3")).toBe("C3");
    expect(addDefaultOctave("D5")).toBe("D5");
    expect(addDefaultOctave("E2")).toBe("E2");
  });

  it("シャープやフラット記号付きの音名でも正しく動作する", () => {
    expect(addDefaultOctave("C＃")).toBe("C＃4");
    expect(addDefaultOctave("D♭")).toBe("D♭4");
    expect(addDefaultOctave("F＃3")).toBe("F＃3");
    expect(addDefaultOctave("B♭5")).toBe("B♭5");
  });
});

describe("isValidNoteName", () => {
  it("基本音名が有効と判定される", () => {
    expect(isValidNoteName("C")).toBe(true);
    expect(isValidNoteName("D")).toBe(true);
    expect(isValidNoteName("E")).toBe(true);
  });

  it("変化記号付きの音名が有効と判定される", () => {
    expect(isValidNoteName("C＃")).toBe(true);
    expect(isValidNoteName("D♭")).toBe(true);
    expect(isValidNoteName("F＃")).toBe(true);
  });

  it("無効な音名が不正と判定される", () => {
    expect(isValidNoteName("H")).toBe(false);
    expect(isValidNoteName("")).toBe(false);
    expect(isValidNoteName("C＃＃")).toBe(false);
  });
});

describe("getEnharmonicNotes", () => {
  it("異名同音が正しく取得される", () => {
    expect(getEnharmonicNotes("C＃")).toEqual(["D♭"]);
    expect(getEnharmonicNotes("D♭")).toEqual(["C＃"]);
    expect(getEnharmonicNotes("F＃")).toEqual(["G♭"]);
  });

  it("異名同音がない音名は元の音名が返される", () => {
    expect(getEnharmonicNotes("C")).toEqual(["C"]);
    expect(getEnharmonicNotes("D")).toEqual(["D"]);
    expect(getEnharmonicNotes("E")).toEqual(["E"]);
  });
});

describe("parsePitch", () => {
  it("基本的な音高が正しく解析される", () => {
    expect(parsePitch("C4")).toEqual({ note: "C", octave: 4 });
    expect(parsePitch("G3")).toEqual({ note: "G", octave: 3 });
    expect(parsePitch("B5")).toEqual({ note: "B", octave: 5 });
  });

  it("シャープ付き音高が正しく解析される", () => {
    expect(parsePitch("C＃4")).toEqual({ note: "C＃", octave: 4 });
    expect(parsePitch("F#3")).toEqual({ note: "F＃", octave: 3 });
    expect(parsePitch("G♯5")).toEqual({ note: "G＃", octave: 5 });
  });

  it("フラット付き音高が正しく解析される", () => {
    expect(parsePitch("B♭4")).toEqual({ note: "B♭", octave: 4 });
    expect(parsePitch("Eb3")).toEqual({ note: "E♭", octave: 3 });
    expect(parsePitch("Ab5")).toEqual({ note: "A♭", octave: 5 });
  });

  it("無効な入力でnullが返される", () => {
    expect(parsePitch("")).toBeNull();
    expect(parsePitch("H4")).toBeNull();
    expect(parsePitch("C9")).toBeNull();
    expect(parsePitch("C＃＃4")).toBeNull();
  });
});

describe("getNoteFromIndex", () => {
  it("シャープ表記で音名が取得される", () => {
    expect(getNoteFromIndex(0)).toBe("C");
    expect(getNoteFromIndex(1)).toBe("C＃");
    expect(getNoteFromIndex(6)).toBe("F＃");
  });

  it("フラット表記で音名が取得される", () => {
    expect(getNoteFromIndex(1, true)).toBe("D♭");
    expect(getNoteFromIndex(3, true)).toBe("E♭");
    expect(getNoteFromIndex(8, true)).toBe("A♭");
  });

  it("負のインデックスが適切に処理される", () => {
    expect(getNoteFromIndex(-1)).toBe("B");
    expect(getNoteFromIndex(-2)).toBe("B♭");
    expect(getNoteFromIndex(-12)).toBe("C");
  });
});

describe("comparePitch", () => {
  it("同じピッチで一致が正しく判定される", () => {
    expect(comparePitch("C4", "C4")).toBe(true);
    expect(comparePitch("A＃3", "A＃3")).toBe(true);
    expect(comparePitch("B♭2", "B♭2")).toBe(true);
  });

  it("異名同音で一致が正しく判定される", () => {
    expect(comparePitch("C＃4", "D♭4")).toBe(true);
    expect(comparePitch("F＃3", "G♭3")).toBe(true);
    expect(comparePitch("A＃2", "B♭2")).toBe(true);
  });

  it("オクターブが異なる場合で不一致が正しく判定される", () => {
    expect(comparePitch("C4", "C3")).toBe(false);
    expect(comparePitch("A3", "A4")).toBe(false);
    expect(comparePitch("G2", "G1")).toBe(false);
  });

  it("異なる音名で不一致が正しく判定される", () => {
    expect(comparePitch("C4", "D4")).toBe(false);
    expect(comparePitch("F3", "G3")).toBe(false);
    expect(comparePitch("A＃3", "B3")).toBe(false);
  });
});

describe("compareNotes", () => {
  it("同じ音名で一致が正しく判定される", () => {
    expect(compareNotes("C", "C")).toBe(true);
    expect(compareNotes("F＃", "F＃")).toBe(true);
    expect(compareNotes("B♭", "B♭")).toBe(true);
  });

  it("異名同音で一致が正しく判定される", () => {
    expect(compareNotes("C＃", "D♭")).toBe(true);
    expect(compareNotes("F＃", "G♭")).toBe(true);
    expect(compareNotes("A＃", "B♭")).toBe(true);
  });

  it("理論的音名で一致が正しく判定される", () => {
    expect(compareNotes("B＃", "C")).toBe(true);
    expect(compareNotes("E＃", "F")).toBe(true);
    expect(compareNotes("F♭", "E")).toBe(true);
    expect(compareNotes("C♭", "B")).toBe(true);
  });

  it("異なる音名で不一致が正しく判定される", () => {
    expect(compareNotes("C", "D")).toBe(false);
    expect(compareNotes("F＃", "G")).toBe(false);
    expect(compareNotes("B♭", "B")).toBe(false);
  });
});

describe("isValidNote", () => {
  it("基本音名が有効と判定される", () => {
    expect(isValidNote("C")).toBe(true);
    expect(isValidNote("D")).toBe(true);
    expect(isValidNote("E")).toBe(true);
  });

  it("変化記号付きの音名が有効と判定される", () => {
    expect(isValidNote("C＃")).toBe(true);
    expect(isValidNote("D♭")).toBe(true);
    expect(isValidNote("F＃")).toBe(true);
  });

  it("オクターブ付きの音名が無効と判定される", () => {
    expect(isValidNote("C4")).toBe(false);
    expect(isValidNote("F＃3")).toBe(false);
  });

  it("無効な音名が無効と判定される", () => {
    expect(isValidNote("H")).toBe(false);
    expect(isValidNote("")).toBe(false);
    expect(isValidNote("invalid")).toBe(false);
  });
});

describe("isValidPitch", () => {
  it("有効なピッチがtrueを返す", () => {
    expect(isValidPitch("C4")).toBe(true);
    expect(isValidPitch("F＃3")).toBe(true);
    expect(isValidPitch("B♭2")).toBe(true);
  });

  it("無効なピッチがfalseを返す", () => {
    expect(isValidPitch("C")).toBe(false);
    expect(isValidPitch("H4")).toBe(false);
    expect(isValidPitch("")).toBe(false);
  });
});

describe("getKeyPosition", () => {
  it("メジャーキーの位置が正しく取得される", () => {
    expect(getKeyPosition("C")).toEqual({ circle: "outer", index: 0 });
    expect(getKeyPosition("G")).toEqual({ circle: "outer", index: 1 });
    expect(getKeyPosition("D")).toEqual({ circle: "outer", index: 2 });
  });

  it("マイナーキーの位置が正しく取得される", () => {
    expect(getKeyPosition("Am")).toEqual({ circle: "inner", index: 0 });
    expect(getKeyPosition("Em")).toEqual({ circle: "inner", index: 1 });
    expect(getKeyPosition("Bm")).toEqual({ circle: "inner", index: 2 });
  });

  it("無効なキーでnoneが返される", () => {
    expect(getKeyPosition("H")).toEqual({ circle: "none", index: -1 });
    expect(getKeyPosition("")).toEqual({ circle: "none", index: -1 });
  });
});
