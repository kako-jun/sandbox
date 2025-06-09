import { calculateFrequency } from "./frequency";

describe("calculateFrequency", () => {
  it("基準オクターブ(4)の周波数が正しく計算される", () => {
    expect(calculateFrequency("A", 4)).toBe(440.0);
    expect(calculateFrequency("C", 4)).toBe(261.63);
    expect(calculateFrequency("E", 4)).toBe(329.63);
  });

  it("異なるオクターブの周波数が正しく計算される", () => {
    // A3 = 220 Hz
    expect(calculateFrequency("A", 3)).toBe(220.0);
    // A5 = 880 Hz
    expect(calculateFrequency("A", 5)).toBe(880.0);
    // C5 = 523.26 Hz
    expect(calculateFrequency("C", 5)).toBe(523.26);
  });

  it("異名同音の周波数が正しく計算される", () => {
    // C＃4 = D♭4 ≈ 277.18 Hz
    expect(calculateFrequency("C＃", 4)).toBe(277.18);
    expect(calculateFrequency("D♭", 4)).toBe(277.18);

    // G＃4 = A♭4 ≈ 415.30 Hz
    expect(calculateFrequency("G＃", 4)).toBe(415.3);
    expect(calculateFrequency("A♭", 4)).toBe(415.3);
  });

  it("無効な音名に対してnullを返す", () => {
    expect(calculateFrequency("H", 4)).toBeNull();
    expect(calculateFrequency("", 4)).toBeNull();
  });
});
