import {
    getCadenceText,
    getChordFunction,
    getChordToneLabel,
    getFunctionalHarmonyInfo,
    getFunctionalHarmonyInfoBase,
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

  it("スケールに含まれないコードで0が返される", () => {
    expect(getChordFunction("C", "F#")).toBe(0);
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
});

describe("getFunctionalHarmonyText", () => {
  it("各度数のローマ数字と名称が正しく取得される", () => {
    expect(getFunctionalHarmonyText(1)).toBe("Ⅰ Tonic");
    expect(getFunctionalHarmonyText(2)).toBe("Ⅱ Supertonic");
    expect(getFunctionalHarmonyText(3)).toBe("Ⅲ Mediant");
    expect(getFunctionalHarmonyText(4)).toBe("Ⅳ Subdominant");
    expect(getFunctionalHarmonyText(5)).toBe("Ⅴ Dominant");
    expect(getFunctionalHarmonyText(6)).toBe("Ⅵ Submediant");
    expect(getFunctionalHarmonyText(7)).toBe("Ⅶ Leading Tone");
  });

  it("無効な度数で空文字が返される", () => {
    expect(getFunctionalHarmonyText(0)).toBe("");
    expect(getFunctionalHarmonyText(8)).toBe("");
    expect(getFunctionalHarmonyText(-1)).toBe("");
  });
});

describe("getFunctionalHarmonyInfoBase", () => {
  it("各度数に対応する情報オブジェクトを返す", () => {
    expect(getFunctionalHarmonyInfoBase(1)).toEqual({
      roman: "Ⅰ",
      desc: "Tonic (主音): 完全な安定感・曲の中心・終止感",
    });
    expect(getFunctionalHarmonyInfoBase(5)).toEqual({
      roman: "Ⅴ",
      desc: "Dominant (属音): トニックへの強い解決要求・劇的な緊張感・方向性",
    });
  });

  it("無効な度数の場合空の情報を返す", () => {
    expect(getFunctionalHarmonyInfoBase(0)).toEqual({
      roman: "",
      desc: "",
    });
  });
});

describe("getFunctionalHarmonyInfo", () => {
  it("三和音の情報を返す（withSeventh=false）", () => {
    expect(getFunctionalHarmonyInfo(1, false)).toEqual({
      roman: "Ⅰ",
      desc: "Tonic (主和音・長三和音): 完全な安定感・曲の中心・終止感",
    });
    expect(getFunctionalHarmonyInfo(2, false)).toEqual({
      roman: "Ⅱm",
      desc: "Supertonic (上主和音・短三和音): 推進力・サブドミナントへの準備・優しい緊張感",
    });
    expect(getFunctionalHarmonyInfo(7, false)).toEqual({
      roman: "Ⅶdim",
      desc: "Leading Tone (導和音・減三和音): 強い解決欲求・不安定な緊張感・ドミナントの代理機能",
    });
  });

  it("七の和音の情報を返す（withSeventh=true）", () => {
    expect(getFunctionalHarmonyInfo(1, true)).toEqual({
      roman: "ⅠM7",
      desc: "Tonic Seventh (主和音・長七の和音): 完全な安定感・ジャズ的な色彩・豊かな終止感",
    });
    expect(getFunctionalHarmonyInfo(5, true)).toEqual({
      roman: "Ⅴ7",
      desc: "Dominant Seventh (属和音・属七の和音): 強い解決感・明確な方向性・トニックへの最強の牽引力",
    });
  });

  it("無効な度数の場合空の情報を返す", () => {
    expect(getFunctionalHarmonyInfo(0)).toEqual({
      roman: "",
      desc: "",
    });
    expect(getFunctionalHarmonyInfo(8)).toEqual({
      roman: "",
      desc: "",
    });
  });
});

describe("romanNumeralHarmonyInfo", () => {
  it("三和音のローマ数字情報を返す", () => {
    expect(romanNumeralHarmonyInfo(1)).toEqual({
      roman: "Ⅰ",
      desc: "Tonic (主和音・長三和音): 完全な安定感・曲の中心・終止感",
    });
    expect(romanNumeralHarmonyInfo(2)).toEqual({
      roman: "Ⅱm",
      desc: "Supertonic (上主和音・短三和音): 推進力・サブドミナントへの準備・優しい緊張感",
    });
    expect(romanNumeralHarmonyInfo(7)).toEqual({
      roman: "Ⅶdim",
      desc: "Leading Tone (導和音・減三和音): 強い解決欲求・不安定な緊張感・ドミナントの代理機能",
    });
  });
});

describe("romanNumeral7thHarmonyInfo", () => {
  it("七の和音のローマ数字情報を返す", () => {
    expect(romanNumeral7thHarmonyInfo(1)).toEqual({
      roman: "ⅠM7",
      desc: "Tonic Seventh (主和音・長七の和音): 完全な安定感・ジャズ的な色彩・豊かな終止感",
    });
    expect(romanNumeral7thHarmonyInfo(5)).toEqual({
      roman: "Ⅴ7",
      desc: "Dominant Seventh (属和音・属七の和音): 強い解決感・明確な方向性・トニックへの最強の牽引力",
    });
    expect(romanNumeral7thHarmonyInfo(7)).toEqual({
      roman: "Ⅶm7♭5",
      desc: "Leading Tone Seventh (導和音・半減七の和音): 極度の不安定さ・Ⅴ7の代替・トニックへの強い進行欲求",
    });
  });
});

describe("getChordToneLabel", () => {
  it("コードのルート音の場合適切なラベルを返す", () => {
    expect(getChordToneLabel("C", "C", "C4")).toBe("Tonic Note");
    expect(getChordToneLabel("C", "Dm", "D4")).toBe("Supertonic Note");
    expect(getChordToneLabel("C", "G", "G4")).toBe("Dominant Note");
  });

  it("ルート音以外の場合空文字を返す", () => {
    expect(getChordToneLabel("C", "C", "E4")).toBe("");
    expect(getChordToneLabel("C", "C", "G4")).toBe("");
  });

  it("スケールに含まれないコードの場合空文字を返す", () => {
    expect(getChordToneLabel("C", "F#", "F#4")).toBe("");
  });
});

describe("getCadenceText", () => {
  it("正格終止（V-I）を判定する", () => {
    expect(getCadenceText(5, 1)).toBe("Perfect Cadence");
  });

  it("変格終止（IV-I）を判定する", () => {
    expect(getCadenceText(4, 1)).toBe("Plagal Cadence");
  });

  it("偽終止（V-VI）を判定する", () => {
    expect(getCadenceText(5, 6)).toBe("Deceptive Cadence");
  });

  it("半終止（任意-V）を判定する", () => {
    expect(getCadenceText(1, 5)).toBe("Half Cadence");
    expect(getCadenceText(4, 5)).toBe("Half Cadence");
  });

  it("フリギア終止（任意-VII）を判定する", () => {
    expect(getCadenceText(1, 7)).toBe("Phrygian Cadence");
    expect(getCadenceText(6, 7)).toBe("Phrygian Cadence");
  });

  it("特定のカデンツでない場合空文字を返す", () => {
    expect(getCadenceText(1, 2)).toBe("");
    expect(getCadenceText(3, 4)).toBe("");
    expect(getCadenceText(2, 3)).toBe("");
  });

  it("V-V（同じ和音）の場合Half Cadenceを返す", () => {
    expect(getCadenceText(4, 5)).toBe("Half Cadence");
  });

  it("無効な度数の場合空文字を返す", () => {
    expect(getCadenceText(0, 1)).toBe("");
    expect(getCadenceText(1, 0)).toBe("");
  });
});
