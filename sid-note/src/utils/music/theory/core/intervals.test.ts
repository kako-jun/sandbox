import { getHalfStepDistance, getInterval } from "./intervals";

describe("getHalfStepDistance", () => {
  it("半音単位の距離が正しく取得される", () => {
    expect(getHalfStepDistance("C", "C＃")).toBe(1);
    expect(getHalfStepDistance("C", "D")).toBe(2);
    expect(getHalfStepDistance("C", "E♭")).toBe(3);
    expect(getHalfStepDistance("C", "E")).toBe(4);
    expect(getHalfStepDistance("C", "F")).toBe(5);
  });

  it("オクターブ内の距離が正しく取得される（12以上の値にはならない）", () => {
    expect(getHalfStepDistance("C", "B")).toBe(11);
    expect(getHalfStepDistance("C", "C")).toBe(0);
  });

  it("無効な音名の組み合わせでnullが返される", () => {
    expect(getHalfStepDistance("H", "C")).toBeNull();
    expect(getHalfStepDistance("C", "")).toBeNull();
  });

  it("異名同音が正しく処理される", () => {
    expect(getHalfStepDistance("C", "D♭")).toBe(1); // C＃と同じ
    expect(getHalfStepDistance("C", "E♭")).toBe(3); // D＃と同じ
    expect(getHalfStepDistance("F＃", "G♭")).toBe(0); // 同じ音
  });
});

describe("getInterval", () => {
  it("基本的な音程名が正しく取得される", () => {
    expect(getInterval("C", "C")).toBe("1");
    expect(getInterval("C", "D")).toBe("2");
    expect(getInterval("C", "E")).toBe("3");
    expect(getInterval("C", "F")).toBe("4");
    expect(getInterval("C", "G")).toBe("5");
    expect(getInterval("C", "A")).toBe("6");
    expect(getInterval("C", "B")).toBe("7");
  });

  it("変化記号を含む音程が正しく取得される", () => {
    expect(getInterval("C", "C＃")).toBe("＃1");
    expect(getInterval("C", "D♭")).toBe("♭2");
    expect(getInterval("C", "E♭")).toBe("♭3");
    expect(getInterval("C", "F＃")).toBe("＃4/♭5"); // トライトーンは両方の表記
    expect(getInterval("C", "G♭")).toBe("＃4/♭5"); // トライトーンは両方の表記
  });

  it("トライトーンは両方の表記で返される", () => {
    expect(getInterval("C", "F＃")).toBe("＃4/♭5");
    expect(getInterval("C", "G♭")).toBe("＃4/♭5");
  });

  it("無効な入力で空文字列が返される", () => {
    expect(getInterval("", "C")).toBe("");
    expect(getInterval("C", "")).toBe("");
    expect(getInterval("H", "C")).toBe("");
  });

  it("異名同音が正しく処理される", () => {
    expect(getInterval("C", "D♭")).toBe("♭2");
    expect(getInterval("C", "C＃")).toBe("＃1");
    expect(getInterval("C", "G♭")).toBe("＃4/♭5");
  });
});
