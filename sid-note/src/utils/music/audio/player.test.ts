import { getNoteFrequency, playChord, playNoteSound } from "@/utils/music/audio/player";

// Web Audio APIのモック型定義
type MockOscillator = {
  start: jest.Mock;
  stop: jest.Mock;
  frequency: {
    setValueAtTime: jest.Mock;
    linearRampToValueAtTime?: jest.Mock;
  };
  connect: jest.Mock;
  type: OscillatorType;
};

type MockGain = {
  connect: jest.Mock;
  gain: {
    setValueAtTime: jest.Mock;
    linearRampToValueAtTime: jest.Mock;
  };
};

type MockFilter = {
  connect: jest.Mock;
  frequency: {
    setValueAtTime: jest.Mock;
  };
  Q: {
    setValueAtTime: jest.Mock;
  };
  type: BiquadFilterType;
};

type MockDestination = {
  connect: jest.Mock;
};

type MockAudioContext = Partial<AudioContext> & {
  createOscillator: jest.Mock;
  createGain: jest.Mock;
  createBiquadFilter: jest.Mock;
  currentTime: number;
  destination: MockDestination;
};

// Web Audio APIのモック
let mockOscillator: MockOscillator;
let mockGain: MockGain;
let mockFilter: MockFilter;
let mockAudioContext: MockAudioContext;

// 各テスト実行前にモックをリセット
beforeEach(() => {
  // モックオシレータの設定
  mockOscillator = {
    type: "sine" as OscillatorType,
    frequency: { setValueAtTime: jest.fn() },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  };

  // モックゲインの設定
  mockGain = {
    gain: {
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
    },
    connect: jest.fn(),
  };

  // モックフィルターの設定
  mockFilter = {
    type: "lowpass" as BiquadFilterType,
    frequency: { setValueAtTime: jest.fn() },
    Q: { setValueAtTime: jest.fn() }, // 追加
    connect: jest.fn(),
  };

  // モックAudioContextの設定
  mockAudioContext = {
    currentTime: 0,
    destination: { connect: jest.fn() },
    createOscillator: jest.fn(() => mockOscillator),
    createGain: jest.fn(() => mockGain),
    createBiquadFilter: jest.fn(() => mockFilter),
  } as unknown as MockAudioContext;

  // AudioContextのモック
  Object.defineProperty(global, "AudioContext", {
    value: jest.fn(() => mockAudioContext),
    writable: true,
    configurable: true,
  });
});

// 周波数比較用のヘルパー関数（許容誤差：0.1Hz）
function expectFrequencyCloseTo(actual: number | null, expected: number) {
  expect(actual).not.toBeNull();
  if (actual !== null) {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(0.1);
  }
}

describe("getNoteFrequency", () => {
  it("基本的な音名の周波数が正しく取得される", () => {
    expectFrequencyCloseTo(getNoteFrequency("A4"), 440.0);
    expectFrequencyCloseTo(getNoteFrequency("C4"), 261.63);
    expectFrequencyCloseTo(getNoteFrequency("E4"), 329.63);
    expectFrequencyCloseTo(getNoteFrequency("G4"), 392.0);
  });

  it("シャープ記号付き音名の周波数が正しく取得される", () => {
    expectFrequencyCloseTo(getNoteFrequency("C＃4"), 277.18);
    expectFrequencyCloseTo(getNoteFrequency("F＃4"), 369.99);
    expectFrequencyCloseTo(getNoteFrequency("G＃4"), 415.3);
  });

  it("フラット記号付き音名の周波数が正しく取得される", () => {
    expectFrequencyCloseTo(getNoteFrequency("D♭4"), 277.18);
    expectFrequencyCloseTo(getNoteFrequency("E♭4"), 311.13);
    expectFrequencyCloseTo(getNoteFrequency("A♭4"), 415.3);
    expectFrequencyCloseTo(getNoteFrequency("B♭4"), 466.16);
  });

  it("低いオクターブの周波数が正しく取得される", () => {
    expectFrequencyCloseTo(getNoteFrequency("E1"), 41.2);
    expectFrequencyCloseTo(getNoteFrequency("A1"), 55.0);
    expectFrequencyCloseTo(getNoteFrequency("C2"), 65.41);
  });

  it("高いオクターブの周波数が正しく取得される", () => {
    expectFrequencyCloseTo(getNoteFrequency("C5"), 523.25);
    expectFrequencyCloseTo(getNoteFrequency("A5"), 880.0);
    expectFrequencyCloseTo(getNoteFrequency("E5"), 659.25);
  });

  it("エンハーモニック（異名同音）の処理", () => {
    expectFrequencyCloseTo(getNoteFrequency("E＃4"), 349.23);
    expectFrequencyCloseTo(getNoteFrequency("F4"), 349.23);

    expectFrequencyCloseTo(getNoteFrequency("B＃4"), 523.25);
    expectFrequencyCloseTo(getNoteFrequency("C5"), 523.25);

    expectFrequencyCloseTo(getNoteFrequency("F♭4"), 329.63);
    expectFrequencyCloseTo(getNoteFrequency("E4"), 329.63);

    expectFrequencyCloseTo(getNoteFrequency("C♭4"), 246.94);
    expectFrequencyCloseTo(getNoteFrequency("B3"), 246.94);
  });

  it("定義されていない音名の場合nullを返す", () => {
    expect(getNoteFrequency("X4")).toBeNull();
    expect(getNoteFrequency("")).toBeNull();
    expect(getNoteFrequency("C")).toBeNull();
    expect(getNoteFrequency("4")).toBeNull();
    expect(getNoteFrequency("Z1")).toBeNull();
  });

  it("オクターブ0の音名の周波数を返す", () => {
    expectFrequencyCloseTo(getNoteFrequency("C0"), 16.35);
    expectFrequencyCloseTo(getNoteFrequency("A0"), 27.5);
  });

  it("高いオクターブの音名を処理する", () => {
    expectFrequencyCloseTo(getNoteFrequency("C6"), 1046.5);
    expectFrequencyCloseTo(getNoteFrequency("A6"), 1760.0);
    expectFrequencyCloseTo(getNoteFrequency("C7"), 2093.0);
  });
});

describe("playNoteSound", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("有効な音名で音を再生する", () => {
    playNoteSound("C4", 1);

    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
    expect(mockAudioContext.createGain).toHaveBeenCalledTimes(2);
    expect(mockAudioContext.createBiquadFilter).toHaveBeenCalledTimes(1);
    expect(mockOscillator.start).toHaveBeenCalledTimes(2);
    expect(mockOscillator.stop).toHaveBeenCalledTimes(2);
  });

  it("スラッシュ区切りの音名で再生する", () => {
    playNoteSound("C＃4/D♭4", 1);

    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(277.18, 0);
  });

  it("無効な音名でエラーログを出力する", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    playNoteSound("X4", 1);

    expect(consoleSpy).toHaveBeenCalledWith("Invalid note: X4");

    consoleSpy.mockRestore();
  });

  it("デフォルトの再生時間で再生する", () => {
    playNoteSound("A4");

    expect(mockOscillator.stop).toHaveBeenCalledWith(1); // currentTime + 1
  });

  it("カスタム再生時間で再生する", () => {
    playNoteSound("A4", 2.5);

    expect(mockOscillator.stop).toHaveBeenCalledWith(2.5); // currentTime + 2.5
  });

  it("異なる音名タイプを処理する", () => {
    const testCases = [
      { note: "F＃4", expectedFreq: 369.99 },
      { note: "B♭4", expectedFreq: 466.16 },
      { note: "E♭5", expectedFreq: 622.25 },
    ];

    testCases.forEach(({ note, expectedFreq }) => {
      const freq = getNoteFrequency(note);
      expectFrequencyCloseTo(freq, expectedFreq);
    });
  });
});

describe("playChord", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Cメジャーコードを再生する", () => {
    playChord("C");

    // 構成音の数だけ音が再生される（3で終わるピッチのみ）
    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it("マイナーコードを再生する", () => {
    playChord("Am");

    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it("7thコードを再生する", () => {
    playChord("C7");

    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it("パワーコードを再生する", () => {
    playChord("C5");

    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it("dimコードを再生する", () => {
    playChord("Cdim");

    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it("augコードを再生する", () => {
    playChord("Caug");

    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it("複雑なコード（sus4）を再生する", () => {
    playChord("Csus4");

    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it("シャープ記号付きコードを再生する", () => {
    playChord("F＃");

    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it("フラット記号付きコードを再生する", () => {
    playChord("B♭m7");

    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it("無効なコードでも例外を発生させない", () => {
    expect(() => playChord("XYZ")).not.toThrow();
  });
});
