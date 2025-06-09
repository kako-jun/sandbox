import { getInterval } from "@/utils/music/theory/chord/intervalCalculator";

describe("getInterval", () => {
  it("基本的な音程が正しく計算される", () => {
    expect(getInterval("C", "C")).toBe("1");
    expect(getInterval("C", "D")).toBe("2");
    expect(getInterval("C", "E")).toBe("3");
    expect(getInterval("C", "F")).toBe("4");
    expect(getInterval("C", "G")).toBe("5");
    expect(getInterval("C", "A")).toBe("6");
    expect(getInterval("C", "B")).toBe("7");
  });

  it("シャープ・フラット付きの音程が正しく計算される", () => {
    expect(getInterval("C", "C＃")).toBe("♭2");
    expect(getInterval("C", "D♭")).toBe("♭2");
    expect(getInterval("C", "D＃")).toBe("♭3");
    expect(getInterval("C", "E♭")).toBe("♭3");
    expect(getInterval("C", "F＃")).toBe("＃4/♭5");
    expect(getInterval("C", "G♭")).toBe("＃4/♭5");
  });

  it("トライトーンの表記が正しく処理される", () => {
    expect(getInterval("C", "F＃")).toBe("＃4/♭5");
    expect(getInterval("C", "G♭")).toBe("＃4/♭5");
    expect(getInterval("C", "F＃", "＃4")).toBe("＃4");
    expect(getInterval("C", "G♭", "♭5")).toBe("♭5");
  });

  it("異名同音の音程が同じ結果を返す", () => {
    expect(getInterval("C", "D♭")).toBe(getInterval("C", "C＃"));
    expect(getInterval("C", "E♭")).toBe(getInterval("C", "D＃"));
    expect(getInterval("C", "G♭")).toBe(getInterval("C", "F＃"));
    expect(getInterval("C", "A♭")).toBe(getInterval("C", "G＃"));
    expect(getInterval("C", "B♭")).toBe(getInterval("C", "A＃"));
  });

  it("無効な入力で空文字列を返す", () => {
    expect(getInterval("", "C")).toBe("");
    expect(getInterval("C", "")).toBe("");
    expect(getInterval("H", "C")).toBe("");
    expect(getInterval("C", "H")).toBe("");
  });
});
