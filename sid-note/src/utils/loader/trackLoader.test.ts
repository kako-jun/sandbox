import fs from "fs/promises";
import yaml from "js-yaml";
import { loadTrackFromYamlFile, loadTrackFromYamlUrl } from "./trackLoader";

// Node.js fsのモック
jest.mock("fs/promises");
jest.mock("js-yaml");

const mockFs = fs as jest.Mocked<typeof fs>;
const mockYaml = yaml as jest.Mocked<typeof yaml>;

// File APIのモック
global.File = class MockFile {
  constructor(public content: string[], public name: string) {}

  async text(): Promise<string> {
    return this.content.join("");
  }
} as unknown as typeof File;

describe("loadTrackFromYamlFile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockYaml.load.mockImplementation((text) => {
      if (typeof text === "string") {
        return {
          title: "Test Track",
          artist: "Test Artist",
          album: "Test Album",
          year: 2024,
          key: "C",
          bpm: 120,
          time_signature: "4/4",
          sections: [
            {
              name: "Verse",
              chord_segments: [
                {
                  chord: "C",
                  notes: [
                    {
                      pitch: "C4",
                      value: "quarter",
                      lefts: [
                        {
                          finger: 1,
                          string: 1,
                          fret: 0,
                          type: "press",
                        },
                      ],
                      right: {
                        string: 1,
                        stroke: "down",
                        mute_strings: [],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        };
      }
      return undefined;
    });
  });

  it("有効なトラックYAMLファイルが正しく読み込まれる", async () => {
    const mockYamlContent = `
title: "Test Track"
artist: "Test Artist"
album: "Test Album"
key: "C"
bpm: 120
year: 2024
time_signature: "4/4"
sections:
  - name: "Verse"
    chord_segments:
      - chord: "C"
        notes:
          - pitch: "C4"
            value: "quarter"
            lefts:
              - finger: 1
                string: 1
                fret: 0
                type: "press"
            right:
              string: 1
              stroke: "down"
              mute_strings: []
`;

    const mockFile = new File([mockYamlContent], "test.yaml");
    const result = await loadTrackFromYamlFile(mockFile);

    expect(result).toEqual({
      title: "Test Track",
      artist: "Test Artist",
      album: "Test Album",
      year: 2024,
      key: "C",
      bpm: 120,
      timeSignature: "4/4",
      sections: [
        {
          name: "Verse",
          chordSegments: [
            {
              chord: "C",
              notes: [
                {
                  pitch: "C4",
                  value: "quarter",
                  lefts: [
                    {
                      finger: 1,
                      string: 1,
                      fret: 0,
                      type: "press",
                    },
                  ],
                  right: {
                    string: 1,
                    stroke: "down",
                    muteStrings: [],
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it("必須フィールドが不足している場合エラーが発生する", async () => {
    const invalidYamlContent = `
title: "Test Track"
# artistフィールドが不足
`;
    // 無効なYAMLのモックを設定
    mockYaml.load.mockReturnValueOnce({
      title: "Test Track",
      // artistフィールドが不足している
    });

    const mockFile = new File([invalidYamlContent], "invalid.yaml");
    await expect(loadTrackFromYamlFile(mockFile)).rejects.toThrow();
  });
});

describe("loadTrackFromYamlUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("有効なURLからトラックが正しく読み込まれる", async () => {
    const mockYamlContent = `
title: "URL Track"
artist: "URL Artist"
album: "URL Album"
year: 2024
key: "C"
bpm: 120
time_signature: "4/4"
sections:
  - name: "Intro"
    chord_segments:
      - chord: "Am"
        notes:
          - pitch: "A4"
            value: "whole"
            lefts: []
`;

    const expectedTrack = {
      title: "URL Track",
      artist: "URL Artist",
      album: "URL Album",
      year: 2024,
      key: "C",
      bpm: 120,
      timeSignature: "4/4",
      sections: [
        {
          name: "Intro",
          chordSegments: [
            {
              chord: "Am",
              notes: [{ pitch: "A4", value: "whole", lefts: [] }],
            },
          ],
        },
      ],
    };

    mockFs.readFile.mockResolvedValue(mockYamlContent);
    mockYaml.load.mockReturnValue({
      title: "URL Track",
      artist: "URL Artist",
      album: "URL Album",
      year: 2024,
      key: "C",
      bpm: 120,
      time_signature: "4/4",
      sections: [
        {
          name: "Intro",
          chord_segments: [
            {
              chord: "Am",
              notes: [{ pitch: "A4", value: "whole", lefts: [] }],
            },
          ],
        },
      ],
    });

    const result = await loadTrackFromYamlUrl("/track/track.yaml");
    expect(result).toEqual(expectedTrack);
  });

  it("ネットワークエラーが適切に処理される", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    await expect(loadTrackFromYamlUrl("https://example.com/track.yaml")).rejects.toThrow("Network error");
  });
});
