import { getChordNameAliases } from "./alias";

describe("getChordNameAliases", () => {
  it("メジャーコードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("C");
    expect(aliases).toEqual(["C", "Cmaj", "C△"]);
  });

  it("maj7コードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("Cmaj7");
    expect(aliases).toEqual(["Cmaj7", "CM7", "C△7"]);
  });

  it("m7コードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("Cm7");
    expect(aliases).toEqual(["Cm7", "C-7"]);
  });

  it("7コードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("C7");
    expect(aliases).toEqual(["C7"]);
  });

  it("マイナーコードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("Cm");
    expect(aliases).toEqual(["Cm", "C-"]);
  });

  it("dimコードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("Cdim");
    expect(aliases).toEqual(["Cdim", "Co"]);
  });

  it("augコードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("Caug");
    expect(aliases).toEqual(["Caug", "C+"]);
  });

  it("sus4コードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("Csus4");
    expect(aliases).toEqual(["Csus4", "Csus"]);
  });

  it("add9コードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("Cadd9");
    expect(aliases).toEqual(["Cadd9"]);
  });

  it("6コードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("C6");
    expect(aliases).toEqual(["C6"]);
  });

  it("9コードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("C9");
    expect(aliases).toEqual(["C9"]);
  });

  it("m(maj7)コードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("Cm_maj7");
    expect(aliases).toEqual(["Cm(maj7)", "CmM7", "C-M7"]);
  });

  it("♯記号を含むコードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("C＃");
    expect(aliases).toEqual(["C＃", "C＃maj", "C＃△"]);
  });

  it("♭記号を含むコードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("C♭");
    expect(aliases).toEqual(["C♭", "C♭maj", "C♭△"]);
  });

  it("#記号を含むコードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("C#");
    expect(aliases).toEqual(["C#", "C#maj", "C#△"]);
  });

  it("b記号を含むコードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("Cb");
    expect(aliases).toEqual(["Cb", "Cbmaj", "Cb△"]);
  });

  it("不正なコード名でそのまま返される", () => {
    const aliases = getChordNameAliases("XYZ");
    expect(aliases).toEqual(["XYZ"]);
  });

  it("空文字列でそのまま返される", () => {
    const aliases = getChordNameAliases("");
    expect(aliases).toEqual([""]);
  });

  it("パワーコードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("C5");
    expect(aliases).toEqual(["C5"]);
  });

  it("オクターブコードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("C8");
    expect(aliases).toEqual(["C8"]);
  });

  it("sus2コードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("Csus2");
    expect(aliases).toEqual(["Csus2"]);
  });

  it("m6コードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("Cm6");
    expect(aliases).toEqual(["Cm6", "C-6"]);
  });

  it("m9コードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("Cm9");
    expect(aliases).toEqual(["Cm9", "C-9"]);
  });

  it("M9コードの別表記が正しく取得される", () => {
    const aliases = getChordNameAliases("CM9");
    expect(aliases).toEqual(["CM9", "Cmaj9", "C△9"]);
  });
});
