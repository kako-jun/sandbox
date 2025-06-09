import { parseChordFlags } from "../chord/chordStructure";
import { createChordStructure, extractChordType, extractRootNote, extractSlashBass, parseChord } from "./chords";

describe("parseChordFlags", () => {
  it("基本的なコードフラグが正しく解析される", () => {
    const majorFlags = parseChordFlags("");
    expect(majorFlags.isMinor).toBe(false);
    expect(majorFlags.isDiminished).toBe(false);
    expect(majorFlags.isAugmented).toBe(false);

    const minorFlags = parseChordFlags("m");
    expect(minorFlags.isMinor).toBe(true);
    expect(minorFlags.isDiminished).toBe(false);
  });

  it("7thコードフラグが正しく解析される", () => {
    const dom7Flags = parseChordFlags("7");
    expect(dom7Flags.has7).toBe(true);
    expect(dom7Flags.hasMaj7).toBe(false);

    const maj7Flags = parseChordFlags("maj7");
    expect(maj7Flags.hasMaj7).toBe(true);
    expect(maj7Flags.has7).toBe(true);
  });
});

describe("createChordStructure", () => {
  it("メジャートライアドの構造が正しく作成される", () => {
    const flags = parseChordFlags("");
    const structure = createChordStructure(flags);

    expect(structure.root).toBe("1");
    expect(structure.third).toBe("3");
    expect(structure.fifth).toBe("5");
    expect(structure.seventh).toBeNull();
  });

  it("マイナートライアドの構造が正しく作成される", () => {
    const flags = parseChordFlags("m");
    const structure = createChordStructure(flags);

    expect(structure.root).toBe("1");
    expect(structure.third).toBe("♭3");
    expect(structure.fifth).toBe("5");
  });
});

describe("extractRootNote", () => {
  it("基本的なコードからルート音を抽出する", () => {
    expect(extractRootNote("C")).toBe("C");
    expect(extractRootNote("Am")).toBe("A");
    expect(extractRootNote("F7")).toBe("F");
    expect(extractRootNote("G7")).toBe("G");
  });

  it("シャープ・フラット付きコードからルート音を抽出する", () => {
    expect(extractRootNote("C＃")).toBe("C＃");
    expect(extractRootNote("D♭maj7")).toBe("D♭");
    expect(extractRootNote("F＃m")).toBe("F＃");
    expect(extractRootNote("B♭7")).toBe("B♭");
  });

  it("複雑なコードからルート音を抽出する", () => {
    expect(extractRootNote("Gmaj7")).toBe("G");
    expect(extractRootNote("Aaug")).toBe("A");
    expect(extractRootNote("Bdim")).toBe("B");
    expect(extractRootNote("Csus4")).toBe("C");
  });

  it("スラッシュベース付きコードからルート音を抽出する", () => {
    expect(extractRootNote("Am/G")).toBe("A");
    expect(extractRootNote("C7/E")).toBe("C");
    expect(extractRootNote("F＃m7/A")).toBe("F＃");
  });

  it("無効な入力で空文字列を返す", () => {
    expect(extractRootNote("")).toBe("");
    expect(extractRootNote("123")).toBe("");
    expect(extractRootNote("invalid")).toBe("");
  });
});

describe("extractChordType", () => {
  it("基本的なコードからコードタイプを抽出する", () => {
    expect(extractChordType("C")).toBe("");
    expect(extractChordType("Am")).toBe("m");
    expect(extractChordType("F7")).toBe("7");
    expect(extractChordType("Gmaj7")).toBe("maj7");
  });

  it("複雑なコードからコードタイプを抽出する", () => {
    expect(extractChordType("Aaug")).toBe("aug");
    expect(extractChordType("Bdim")).toBe("dim");
    expect(extractChordType("Csus4")).toBe("sus4");
    expect(extractChordType("Dm7b5")).toBe("m7b5");
  });

  it("スラッシュベース付きコードからコードタイプを抽出する", () => {
    expect(extractChordType("Am/G")).toBe("m");
    expect(extractChordType("C7/E")).toBe("7");
    expect(extractChordType("F＃m7/A")).toBe("m7");
  });

  it("無効な入力で空文字列を返す", () => {
    expect(extractChordType("")).toBe("");
    expect(extractChordType("123")).toBe("");
  });
});

describe("extractSlashBass", () => {
  it("スラッシュベース付きコードからベース音を抽出する", () => {
    expect(extractSlashBass("Am/G")).toBe("G");
    expect(extractSlashBass("C7/E")).toBe("E");
    expect(extractSlashBass("F＃m7/A")).toBe("A");
  });

  it("シャープ・フラット付きベース音を抽出する", () => {
    expect(extractSlashBass("C/B♭")).toBe("B♭");
    expect(extractSlashBass("Am/F＃")).toBe("F＃");
    expect(extractSlashBass("G/E♭")).toBe("E♭");
  });

  it("スラッシュベースのないコードでundefinedを返す", () => {
    expect(extractSlashBass("C")).toBeUndefined();
    expect(extractSlashBass("Am7")).toBeUndefined();
    expect(extractSlashBass("F＃m")).toBeUndefined();
  });

  it("無効な入力でundefinedを返す", () => {
    expect(extractSlashBass("")).toBeUndefined();
    expect(extractSlashBass("/")).toBeUndefined();
    expect(extractSlashBass("C/")).toBeUndefined();
    expect(extractSlashBass("C/invalid")).toBeUndefined();
  });
});

describe("parseChord", () => {
  it("基本的なコードが正しく解析される", () => {
    expect(parseChord("C")).toEqual({
      rootNote: "C",
      chordType: "",
      slashBass: undefined,
    });

    expect(parseChord("Am7")).toEqual({
      rootNote: "A",
      chordType: "m7",
      slashBass: undefined,
    });
  });

  it("スラッシュベース付きコードが正しく解析される", () => {
    expect(parseChord("Am/G")).toEqual({
      rootNote: "A",
      chordType: "m",
      slashBass: "G",
    });

    expect(parseChord("C7/E")).toEqual({
      rootNote: "C",
      chordType: "7",
      slashBass: "E",
    });
  });

  it("無効な入力でnullを返す", () => {
    expect(parseChord("")).toBeNull();
    expect(parseChord("invalid")).toBeNull();
    expect(parseChord("123")).toBeNull();
  });
});
