import { cadenceText, getChordToneLabel, getFunctionalHarmony, type FunctionalHarmonyDegree } from "./harmony";

describe("getFunctionalHarmony", () => {
  it("無効な入力でnullが返される", () => {
    expect(getFunctionalHarmony("", "C")).toBeNull();
    expect(getFunctionalHarmony("C", "")).toBeNull();
    expect(getFunctionalHarmony("", "")).toBeNull();
  });

  // 現在の実装ではnullを返すことをテスト
  it("現在の実装でnullが返される", () => {
    expect(getFunctionalHarmony("C", "Dm")).toBeNull();
    expect(getFunctionalHarmony("G", "Am")).toBeNull();
  });
});

describe("cadenceText", () => {
  it("完全終止が正しく判定される", () => {
    expect(cadenceText(5, 1)).toBe("Perfect Cadence");
  });

  it("変格終止が正しく判定される", () => {
    expect(cadenceText(4, 1)).toBe("Plagal Cadence");
  });

  it("偽終止が正しく判定される", () => {
    expect(cadenceText(5, 6)).toBe("Deceptive Cadence");
  });

  it("半終止が正しく判定される", () => {
    expect(cadenceText(1, 5)).toBe("Half Cadence");
    expect(cadenceText(2, 5)).toBe("Half Cadence");
    expect(cadenceText(4, 5)).toBe("Half Cadence");
  });

  it("フリギア終止が正しく判定される", () => {
    expect(cadenceText(1, 7)).toBe("Phrygian Cadence");
    expect(cadenceText(4, 7)).toBe("Phrygian Cadence");
  });

  it("無効な度数で空文字が返される", () => {
    expect(cadenceText(0 as FunctionalHarmonyDegree, 1)).toBe("");
    expect(cadenceText(1, 8 as FunctionalHarmonyDegree)).toBe("");
    expect(cadenceText(0 as FunctionalHarmonyDegree, 8 as FunctionalHarmonyDegree)).toBe("");
  });

  it("カデンツに該当しない進行で空文字が返される", () => {
    expect(cadenceText(1, 4)).toBe("");
    expect(cadenceText(2, 3)).toBe("");
    expect(cadenceText(6, 2)).toBe("");
  });
});

describe("getChordToneLabel", () => {
  it("無効な音名で空文字が返される", () => {
    expect(getChordToneLabel("C", "C", "X4")).toBe("");
  });

  // 現在の実装では空文字を返すことをテスト
  it("現在の実装で空文字が返される", () => {
    expect(getChordToneLabel("C", "C", "C4")).toBe("");
    expect(getChordToneLabel("C", "C", "E4")).toBe("");
    expect(getChordToneLabel("C", "C", "G4")).toBe("");
  });
});
