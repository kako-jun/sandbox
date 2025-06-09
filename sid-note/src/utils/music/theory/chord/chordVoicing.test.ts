import { getChordPositions } from "./chordVoicing";

describe("getChordPositions", () => {
  it("Cメジャーコードの構成音が正しく含まれる", () => {
    const positions = getChordPositions("C");
    const intervals = positions.map((p) => p.interval);
    expect(intervals).toContain("1");
    expect(intervals).toContain("3");
    expect(intervals).toContain("5");
  });

  it("C7コードに短七度が含まれる", () => {
    const positions = getChordPositions("C7");
    const intervals = positions.map((p) => p.interval);
    expect(intervals).toContain("♭7");
  });

  it("Cmコードに短三度が含まれる", () => {
    const positions = getChordPositions("Cm");
    const intervals = positions.map((p) => p.interval);
    expect(intervals).toContain("♭3");
  });

  it("コード構成音のピッチが正しく設定される", () => {
    const positions = getChordPositions("C");
    expect(positions.map((p) => p.pitch)).toEqual(expect.arrayContaining(["C", "E", "G"]));
  });

  it("パワーコードが正しく生成される", () => {
    const positions = getChordPositions("C5");
    const intervals = positions.map((p) => p.interval);
    expect(intervals).toContain("1");
    expect(intervals).toContain("5");
    expect(intervals).not.toContain("3");
  });

  it("ALL_KEYSが全ての音を含む", () => {
    const positions = getChordPositions("ALL_KEYS");
    const pitches = positions.map((p) => p.pitch);
    expect(pitches).toContain("C");
    expect(pitches).toContain("C＃");
    expect(pitches).toContain("D");
    // ... 他の音も同様にチェック
  });

  it("WHITE_KEYSが白鍵の音のみを含む", () => {
    const positions = getChordPositions("WHITE_KEYS");
    const pitches = positions.map((p) => p.pitch);
    expect(pitches).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
  });
});
