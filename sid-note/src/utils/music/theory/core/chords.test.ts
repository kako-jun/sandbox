import { createChordStructure, extractChordType, extractRootNote, extractSlashBass, normalizeAccidental, normalizeInterval, normalizePitch, parseChord, parseChordFlags } from "./chords";

describe("chords module", () => {
  describe("parseChordFlags", () => {
    it("基本的なコードタイプ（Basic Chord Types）を解析できること", () => {
      expect(parseChordFlags("")).toEqual({
        isMinor: false,
        isDiminished: false,
        isAugmented: false,
        isSus2: false,
        isSus4: false,
        has7: false,
        hasMaj7: false,
        has9: false,
        hasAdd9: false,
        has11: false,
        hasAdd11: false,
        has13: false,
        hasAdd13: false,
        hasFlat9: false,
        hasSharp9: false,
        hasSharp11: false,
        isDim: false,
        isAug: false,
        has6: false,
        hasFlat5: false,
        hasSharp5: false,
      });
    });

    it("マイナーコード（Minor Chord）を解析できること", () => {
      const flags = parseChordFlags("m");
      expect(flags.isMinor).toBe(true);
    });

    it("メジャーセブンスコード（Major Seventh Chord）を解析できること", () => {
      const flags = parseChordFlags("maj7");
      expect(flags.hasMaj7).toBe(true);
      expect(flags.has7).toBe(true);
    });

    it("ドミナントセブンスコード（Dominant Seventh Chord）を解析できること", () => {
      const flags = parseChordFlags("7");
      expect(flags.has7).toBe(true);
      expect(flags.hasMaj7).toBe(false);
    });

    it("サスペンデッドコード（Suspended Chord）を解析できること", () => {
      const sus2 = parseChordFlags("sus2");
      expect(sus2.isSus2).toBe(true);

      const sus4 = parseChordFlags("sus4");
      expect(sus4.isSus4).toBe(true);
    });

    it("拡張コード（Extended Chord）を解析できること", () => {
      const flags = parseChordFlags("maj7#11");
      expect(flags.hasMaj7).toBe(true);
      expect(flags.hasSharp11).toBe(true);
    });

    it("6thコード（Sixth Chord）を解析できること", () => {
      const flags = parseChordFlags("6");
      expect(flags.has6).toBe(true);
    });

    it("フラット5コード（Flat Five Chord）を解析できること", () => {
      const flags = parseChordFlags("7b5");
      expect(flags.hasFlat5).toBe(true);
    });

    it("シャープ5コード（Sharp Five Chord）を解析できること", () => {
      const flags = parseChordFlags("7#5");
      expect(flags.hasSharp5).toBe(true);
    });

    it("複合的なコード（Complex Chord）を解析できること", () => {
      const flags = parseChordFlags("7b9#11");
      expect(flags.has7).toBe(true);
      expect(flags.hasFlat9).toBe(true);
      expect(flags.hasSharp11).toBe(true);
    });

    it("特殊なコード表記（Special Notation）を解析できること", () => {
      const dim = parseChordFlags("°");
      expect(dim.isDiminished).toBe(true);

      const aug = parseChordFlags("+");
      expect(aug.isAugmented).toBe(true);
    });

    it("無効なコード表記（Invalid Notation）を処理できること", () => {
      const flags = parseChordFlags("invalid");
      expect(flags).toEqual({
        isMinor: false,
        isDiminished: false,
        isAugmented: false,
        isSus2: false,
        isSus4: false,
        has7: false,
        hasMaj7: false,
        has9: false,
        hasAdd9: false,
        has11: false,
        hasAdd11: false,
        has13: false,
        hasAdd13: false,
        hasFlat9: false,
        hasSharp9: false,
        hasSharp11: false,
        isDim: false,
        isAug: false,
        has6: false,
        hasFlat5: false,
        hasSharp5: false,
      });
    });
  });

  describe("createChordStructure", () => {
    it("基本的なメジャーコード（Basic Major Chord）の構造を作成できること", () => {
      const flags = parseChordFlags("");
      const structure = createChordStructure(flags);
      expect(structure).toEqual({
        root: "1",
        third: "3",
        fifth: "5",
        seventh: null,
        extensions: new Set(),
      });
    });

    it("マイナーコード（Minor Chord）の構造を作成できること", () => {
      const flags = parseChordFlags("m");
      const structure = createChordStructure(flags);
      expect(structure.third).toBe("♭3");
    });

    it("メジャーセブンスコード（Major Seventh Chord）の構造を作成できること", () => {
      const flags = parseChordFlags("maj7");
      const structure = createChordStructure(flags);
      expect(structure.seventh).toBe("7");
    });

    it("ドミナントセブンスコード（Dominant Seventh Chord）の構造を作成できること", () => {
      const flags = parseChordFlags("7");
      const structure = createChordStructure(flags);
      expect(structure.seventh).toBe("♭7");
    });

    it("サスペンデッドコード（Suspended Chord）の構造を作成できること", () => {
      const flags = parseChordFlags("sus4");
      const structure = createChordStructure(flags);
      expect(structure.third).toBe("4");
    });

    it("拡張コード（Extended Chord）の構造を作成できること", () => {
      const flags = parseChordFlags("maj7#11");
      const structure = createChordStructure(flags);
      expect(structure.seventh).toBe("7");
      expect(structure.extensions).toContain("#11");
    });

    it("6thコード（Sixth Chord）の構造を作成できること", () => {
      const flags = parseChordFlags("6");
      const structure = createChordStructure(flags);
      expect(structure.extensions).toContain("6");
      expect(structure.seventh).toBeNull();
    });

    it("フラット5コード（Flat Five Chord）の構造を作成できること", () => {
      const flags = parseChordFlags("7b5");
      const structure = createChordStructure(flags);
      expect(structure.fifth).toBe("♭5");
    });

    it("シャープ5コード（Sharp Five Chord）の構造を作成できること", () => {
      const flags = parseChordFlags("7#5");
      const structure = createChordStructure(flags);
      expect(structure.fifth).toBe("#5");
    });
  });

  describe("parseChord", () => {
    it("基本的なコード（Basic Chord）を解析できること", () => {
      const result = parseChord("C");
      expect(result).toEqual({
        rootNote: "C",
        chordType: "",
        slashBass: undefined,
      });
    });

    it("コードタイプを含むコード（Chord with Type）を解析できること", () => {
      const result = parseChord("Cm7");
      expect(result).toEqual({
        rootNote: "C",
        chordType: "m7",
        slashBass: undefined,
      });
    });

    it("スラッシュコード（Slash Chord）を解析できること", () => {
      const result = parseChord("C/G");
      expect(result).toEqual({
        rootNote: "C",
        chordType: "",
        slashBass: "G",
      });
    });

    it("複雑なコード（Complex Chord）を解析できること", () => {
      const result = parseChord("Cmaj7#11/G");
      expect(result).toEqual({
        rootNote: "C",
        chordType: "maj7#11",
        slashBass: "G",
      });
    });
  });

  describe("extractRootNote", () => {
    it("基本的な音名（Basic Note）を抽出できること", () => {
      expect(extractRootNote("C")).toBe("C");
      expect(extractRootNote("G")).toBe("G");
    });

    it("変化記号付きの音名（Note with Accidentals）を抽出できること", () => {
      expect(extractRootNote("C#")).toBe("C#");
      expect(extractRootNote("Gb")).toBe("G♭");
    });

    it("理論的音名（Theoretical Note）を処理できること", () => {
      expect(extractRootNote("Cb")).toBe("C♭");
      expect(extractRootNote("E#")).toBe("E#");
    });

    it("無効な入力を処理できること", () => {
      expect(extractRootNote("")).toBe("");
      expect(extractRootNote("X")).toBe("");
    });
  });

  describe("extractChordType", () => {
    it("基本的なコードタイプ（Basic Chord Type）を抽出できること", () => {
      expect(extractChordType("Cm")).toBe("m");
      expect(extractChordType("G7")).toBe("7");
    });

    it("複雑なコードタイプ（Complex Chord Type）を抽出できること", () => {
      expect(extractChordType("Cmaj7#11")).toBe("maj7#11");
      expect(extractChordType("Gm7b5")).toBe("m7b5");
    });

    it("スラッシュコード（Slash Chord）を処理できること", () => {
      expect(extractChordType("C/G")).toBe("");
      expect(extractChordType("Cm7/G")).toBe("m7");
    });
  });

  describe("extractSlashBass", () => {
    it("ベース音（Bass Note）を抽出できること", () => {
      expect(extractSlashBass("C/G")).toBe("G");
      expect(extractSlashBass("Cm7/D")).toBe("D");
    });

    it("無効な入力を処理できること", () => {
      expect(extractSlashBass("")).toBeUndefined();
      expect(extractSlashBass("C")).toBeUndefined();
      expect(extractSlashBass("C/")).toBeUndefined();
      expect(extractSlashBass("C/X")).toBeUndefined();
    });
  });

  describe("normalizeAccidental", () => {
    it("シャープ記号を正規化できること", () => {
      expect(normalizeAccidental("C#")).toBe("C＃");
      expect(normalizeAccidental("C♯")).toBe("C＃");
      expect(normalizeAccidental("C＃")).toBe("C＃");
    });

    it("フラット記号を正規化できること", () => {
      expect(normalizeAccidental("Db")).toBe("D♭");
      expect(normalizeAccidental("D♭")).toBe("D♭");
    });

    it("複数の変化記号を正規化できること", () => {
      expect(normalizeAccidental("C#/D♭")).toBe("C＃/D♭");
      expect(normalizeAccidental("F#/G♭")).toBe("F＃/G♭");
    });

    it("変化記号がない音名はそのまま返すこと", () => {
      expect(normalizeAccidental("C")).toBe("C");
      expect(normalizeAccidental("G")).toBe("G");
    });

    it("空文字列や無効な入力を処理できること", () => {
      expect(normalizeAccidental("")).toBe("");
      expect(normalizeAccidental("X")).toBe("X");
    });
  });

  describe("normalizePitch", () => {
    it("ピッチを正規化できること", () => {
      expect(normalizePitch("C#2")).toBe("C＃/D♭2");
      expect(normalizePitch("D♭2")).toBe("C＃/D♭2");
      expect(normalizePitch("E#2")).toBe("E＃/F2");
      expect(normalizePitch("F♭2")).toBe("E＃/F2");
    });

    it("オクターブがない場合はエラーを投げること", () => {
      expect(() => normalizePitch("C#")).toThrow("ピッチにはオクターブを指定する必要があります");
      expect(() => normalizePitch("D")).toThrow("ピッチにはオクターブを指定する必要があります");
    });

    it("変化記号がないピッチはそのまま返すこと", () => {
      expect(normalizePitch("C2")).toBe("C2");
      expect(normalizePitch("G2")).toBe("G2");
    });

    it("空文字列や無効な入力を処理できること", () => {
      expect(normalizePitch("")).toBe("");
      expect(() => normalizePitch("X")).toThrow("ピッチにはオクターブを指定する必要があります");
    });
  });

  describe("normalizeInterval", () => {
    it("音程を正規化できること", () => {
      expect(normalizeInterval("3m")).toBe("♭3");
      expect(normalizeInterval("♭3")).toBe("♭3");
      expect(normalizeInterval("7")).toBe("7");
    });

    it("複数の音程を正規化できること", () => {
      expect(normalizeInterval("3m7")).toBe("♭37");
      expect(normalizeInterval("♭3♭7")).toBe("♭3♭7");
    });

    it("変化記号がない音程はそのまま返すこと", () => {
      expect(normalizeInterval("3")).toBe("3");
      expect(normalizeInterval("5")).toBe("5");
    });

    it("空文字列や無効な入力を処理できること", () => {
      expect(normalizeInterval("")).toBe("");
      expect(normalizeInterval("X")).toBe("X");
    });
  });
});
