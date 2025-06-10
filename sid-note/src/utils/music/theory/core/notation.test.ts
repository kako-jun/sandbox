import { calculateLinePosition, getLine, getValueText } from "./notation";

describe("calculateLinePosition", () => {
  it("基本的な音名の位置が正しく計算される", () => {
    expect(calculateLinePosition("C", 4)).toBe(-2);
    expect(calculateLinePosition("D", 4)).toBe(-1);
    expect(calculateLinePosition("E", 4)).toBe(0);
    expect(calculateLinePosition("F", 4)).toBe(1);
    expect(calculateLinePosition("G", 4)).toBe(2);
    expect(calculateLinePosition("A", 4)).toBe(3);
    expect(calculateLinePosition("B", 4)).toBe(4);
  });

  it("オクターブを考慮した位置が正しく計算される", () => {
    expect(calculateLinePosition("C", 3)).toBe(-9);
    expect(calculateLinePosition("C", 5)).toBe(5);
  });

  it("シャープ/フラット記号による微調整が正しく計算される", () => {
    expect(calculateLinePosition("C＃", 4)).toBe(-1.5);
    expect(calculateLinePosition("E♭", 4)).toBe(-0.5);
  });

  it("無効な音名でnullが返される", () => {
    expect(calculateLinePosition("H", 4)).toBeNull();
    expect(calculateLinePosition("", 4)).toBeNull();
  });
});

describe("getValueText", () => {
  it("全音符の説明が正しく返される", () => {
    expect(getValueText("whole")).toBe("Whole Note");
    expect(getValueText("dotted_whole")).toBe("Dotted Whole Note");
  });

  it("2分音符の説明が正しく返される", () => {
    expect(getValueText("half")).toBe("Half Note");
    expect(getValueText("dotted_half")).toBe("Dotted Half Note");
  });

  it("4分音符の説明が正しく返される", () => {
    expect(getValueText("quarter")).toBe("Quarter Note");
    expect(getValueText("dotted_quarter")).toBe("Dotted Quarter Note");
  });

  it("8分音符の説明が正しく返される", () => {
    expect(getValueText("8th")).toBe("8th Note");
    expect(getValueText("dotted_8th")).toBe("Dotted 8th Note");
  });

  it("16分音符の説明が正しく返される", () => {
    expect(getValueText("16th")).toBe("16th Note");
    expect(getValueText("dotted_16th")).toBe("Dotted 16th Note");
  });

  it("3連符の説明が正しく返される", () => {
    expect(getValueText("triplet_quarter")).toBe("Quarter Triplet");
    expect(getValueText("triplet_8th")).toBe("8th Triplet");
    expect(getValueText("triplet_16th")).toBe("16th Triplet");
  });

  it("未定義の値で空文字列が返される", () => {
    expect(getValueText("invalid")).toBe("");
    expect(getValueText("")).toBe("");
  });
});

describe("getLine", () => {
  it("ピッチ文字列から正しい線の位置が取得できる", () => {
    expect(getLine("C4")).toBe(2);
    expect(getLine("E4")).toBe(3);
    expect(getLine("G3")).toBe(1);
  });

  it("数値から正しい線の位置が取得できる", () => {
    expect(getLine(0)).toBe(2);
    expect(getLine(2)).toBe(3);
    expect(getLine(-2)).toBe(1);
  });

  it("無効なピッチでnullが返される", () => {
    expect(getLine("invalid")).toBeNull();
    expect(getLine("")).toBeNull();
  });

  it("無効な型でnullが返される", () => {
    expect(getLine(null as any)).toBeNull();
    expect(getLine(undefined as any)).toBeNull();
  });
});
