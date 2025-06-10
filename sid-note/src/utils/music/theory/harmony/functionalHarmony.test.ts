import {
  getChordFunction,
  getFunctionalHarmonyText,
  romanNumeral7thHarmonyInfo,
  romanNumeralHarmonyInfo,
} from "@/utils/music/theory/harmony/functionalHarmony";

describe("getChordFunction", () => {
  it("Cメジャースケールの機能和声度数が正しく取得される", () => {
    expect(getChordFunction("C", "C")).toBe(1);
    expect(getChordFunction("C", "Dm")).toBe(2);
    expect(getChordFunction("C", "Em")).toBe(3);
    expect(getChordFunction("C", "F")).toBe(4);
    expect(getChordFunction("C", "G")).toBe(5);
    expect(getChordFunction("C", "Am")).toBe(6);
    expect(getChordFunction("C", "Bdim")).toBe(7);
  });

  it("Amマイナースケールの機能和声度数が正しく取得される", () => {
    expect(getChordFunction("Am", "Am")).toBe(1);
    expect(getChordFunction("Am", "Bdim")).toBe(2);
    expect(getChordFunction("Am", "C")).toBe(3);
    expect(getChordFunction("Am", "Dm")).toBe(4);
    expect(getChordFunction("Am", "Em")).toBe(5);
    expect(getChordFunction("Am", "F")).toBe(6);
    expect(getChordFunction("Am", "G")).toBe(7);
  });

  it("ダイアトニックでないコードの場合は0を返す", () => {
    expect(getChordFunction("C", "D")).toBe(0);
    expect(getChordFunction("Am", "A")).toBe(0);
  });
});

describe("getFunctionalHarmonyText", () => {
  it("機能和声の度数に対応するテキストを返す", () => {
    expect(getFunctionalHarmonyText(1)).toBe("Ⅰ Tonic");
    expect(getFunctionalHarmonyText(2)).toBe("Ⅱ Supertonic");
    expect(getFunctionalHarmonyText(3)).toBe("Ⅲ Mediant");
    expect(getFunctionalHarmonyText(4)).toBe("Ⅳ Subdominant");
    expect(getFunctionalHarmonyText(5)).toBe("Ⅴ Dominant");
    expect(getFunctionalHarmonyText(6)).toBe("Ⅵ Submediant");
    expect(getFunctionalHarmonyText(7)).toBe("Ⅶ Leading Tone");
  });

  it("範囲外の度数の場合は空文字を返す", () => {
    expect(getFunctionalHarmonyText(0)).toBe("");
    expect(getFunctionalHarmonyText(8)).toBe("");
  });
});

describe("romanNumeralHarmonyInfo", () => {
  it("基本三和音のローマ数字情報を返す", () => {
    expect(romanNumeralHarmonyInfo(1)).toEqual({
      roman: "Ⅰ",
      desc: "Tonic (主音): 完全な安定感・曲の中心・終止感",
    });
    expect(romanNumeralHarmonyInfo(5)).toEqual({
      roman: "Ⅴ",
      desc: "Dominant (属音): トニックへの強い解決要求・劇的な緊張感・方向性",
    });
  });
});

describe("romanNumeral7thHarmonyInfo", () => {
  it("七の和音のローマ数字情報を返す", () => {
    expect(romanNumeral7thHarmonyInfo(1)).toEqual({
      roman: "Ⅰ",
      desc: "Tonic (主音): 完全な安定感・曲の中心・終止感",
    });
    expect(romanNumeral7thHarmonyInfo(5)).toEqual({
      roman: "Ⅴ",
      desc: "Dominant (属音): トニックへの強い解決要求・劇的な緊張感・方向性",
    });
  });
});