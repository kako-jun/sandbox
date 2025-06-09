import { createChordStructure, parseChordFlags } from "./chordStructure";

describe("parseChordFlags", () => {
  it("メジャーコードのフラグが正しく解析される", () => {
    const flags = parseChordFlags("C");
    expect(flags.isMinor).toBe(false);
    expect(flags.isDim).toBe(false);
    expect(flags.isAug).toBe(false);
    expect(flags.has7).toBe(false);
  });

  it("マイナーコードのフラグが正しく解析される", () => {
    const flags = parseChordFlags("Cm");
    expect(flags.isMinor).toBe(true);
    expect(flags.isDim).toBe(false);
  });

  it("7thコードのフラグが正しく解析される", () => {
    const flags = parseChordFlags("C7");
    expect(flags.has7).toBe(true);
    expect(flags.hasMaj7).toBe(false);
  });

  it("maj7コードのフラグが正しく解析される", () => {
    const flags = parseChordFlags("maj7");
    expect(flags.has7).toBe(true);
    expect(flags.hasMaj7).toBe(true);
  });
});

describe("createChordStructure", () => {
  it("メジャーコードの構造が正しく生成される", () => {
    const structure = createChordStructure("C");
    expect(structure.root).toBe("1");
    expect(structure.third).toBe("3");
    expect(structure.fifth).toBe("5");
    expect(structure.seventh).toBeNull();
  });

  it("マイナーコードの構造が正しく生成される", () => {
    const flags = parseChordFlags("m");
    const structure = createChordStructure(flags);
    expect(structure.third).toBe("♭3");
  });

  it("7thコードの構造が正しく生成される", () => {
    const flags = parseChordFlags("7");
    const structure = createChordStructure(flags);
    expect(structure.seventh).toBe("♭7");
  });

  it("maj7コードの構造が正しく生成される", () => {
    const flags = parseChordFlags("maj7");
    const structure = createChordStructure(flags);
    expect(structure.seventh).toBe("7");
  });
});
