import { loadSetlistFromYamlUrl } from "@/utils/loader/setlistLoader";
import fs from "fs/promises";
import yaml from "js-yaml";

// Node.js fsのモック
jest.mock("fs/promises");
jest.mock("js-yaml");

const mockFs = fs as jest.Mocked<typeof fs>;
const mockYaml = yaml as jest.Mocked<typeof yaml>;

describe("loadSetlistFromYamlUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("有効なセットリストYAMLファイルが正しく読み込まれる", async () => {
    const mockYamlContent = `
setlist_name: "Test Setlist"
description: "Test description"
created_at: "2024-01-01"
tracks:
  - id: 1
    title: "Test Track 1"
    artist: "Test Artist 1"
  - id: 2
    title: "Test Track 2"
    artist: "Test Artist 2"
`;

    const expectedData = {
      setlistName: "Test Setlist",
      description: "Test description",
      createdAt: "2024-01-01",
      tracks: [
        {
          id: 1,
          title: "Test Track 1",
          artist: "Test Artist 1",
        },
        {
          id: 2,
          title: "Test Track 2",
          artist: "Test Artist 2",
        },
      ],
    };

    mockFs.readFile.mockResolvedValue(mockYamlContent);
    mockYaml.load.mockReturnValue({
      setlist_name: "Test Setlist",
      description: "Test description",
      created_at: "2024-01-01",
      tracks: [
        {
          id: 1,
          title: "Test Track 1",
          artist: "Test Artist 1",
        },
        {
          id: 2,
          title: "Test Track 2",
          artist: "Test Artist 2",
        },
      ],
    });

    const result = await loadSetlistFromYamlUrl("/track/setlist.yaml");

    expect(mockFs.readFile).toHaveBeenCalledWith(expect.stringContaining("public/track/setlist.yaml"), "utf8");
    expect(mockYaml.load).toHaveBeenCalledWith(mockYamlContent);
    expect(result).toEqual(expectedData);
  });

  it("先頭のスラッシュが正しく処理される", async () => {
    const mockYamlContent = `
setlist_name: "Test"
description: "Test"
created_at: "2024-01-01"
tracks: []
`;

    mockFs.readFile.mockResolvedValue(mockYamlContent);
    mockYaml.load.mockReturnValue({
      setlist_name: "Test",
      description: "Test",
      created_at: "2024-01-01",
      tracks: [],
    });

    await loadSetlistFromYamlUrl("track/setlist.yaml");

    expect(mockFs.readFile).toHaveBeenCalledWith(expect.stringContaining("public/track/setlist.yaml"), "utf8");
  });

  it("スラッシュなしのパスが正しく処理される", async () => {
    const mockYamlContent = `
setlist_name: "Test"
description: "Test"
created_at: "2024-01-01"
tracks: []
`;

    mockFs.readFile.mockResolvedValue(mockYamlContent);
    mockYaml.load.mockReturnValue({
      setlist_name: "Test",
      description: "Test",
      created_at: "2024-01-01",
      tracks: [],
    });

    await loadSetlistFromYamlUrl("setlist.yaml");

    expect(mockFs.readFile).toHaveBeenCalledWith(expect.stringContaining("public/setlist.yaml"), "utf8");
  });

  it("ファイル読み込みエラーがそのまま発生する", async () => {
    const error = new Error("File not found");
    mockFs.readFile.mockRejectedValue(error);

    await expect(loadSetlistFromYamlUrl("/track/nonexistent.yaml")).rejects.toThrow("File not found");
  });

  it("無効なYAML形式でエラーが発生する", async () => {
    const mockYamlContent = `
setlist_name: "Test"
description: "Test"
created_at: "2024-01-01"
tracks: []
`;

    mockFs.readFile.mockResolvedValue(mockYamlContent);
    mockYaml.load.mockReturnValue({
      invalid_format: "missing required fields",
    });

    await expect(loadSetlistFromYamlUrl("/track/invalid.yaml")).rejects.toThrow("Invalid setlist yaml:");
  });

  it("空のトラックリストが正しく処理される", async () => {
    const mockYamlContent = `
setlist_name: "Empty Setlist"
description: "No tracks"
created_at: "2024-01-01"
tracks: []
`;

    const expectedData = {
      setlistName: "Empty Setlist",
      description: "No tracks",
      createdAt: "2024-01-01",
      tracks: [],
    };

    mockFs.readFile.mockResolvedValue(mockYamlContent);
    mockYaml.load.mockReturnValue({
      setlist_name: "Empty Setlist",
      description: "No tracks",
      created_at: "2024-01-01",
      tracks: [],
    });

    const result = await loadSetlistFromYamlUrl("/track/empty.yaml");

    expect(result).toEqual(expectedData);
  });

  it("複数のトラックを含むセットリストが正しく処理される", async () => {
    const mockYamlContent = `
setlist_name: "Multi Track Setlist"
description: "Multiple tracks"
created_at: "2024-01-01"
tracks:
  - id: 1
    title: "Track 1"
    artist: "Artist 1"
  - id: 2
    title: "Track 2"
    artist: "Artist 2"
  - id: 3
    title: "Track 3"
    artist: "Artist 3"
`;

    const expectedData = {
      setlistName: "Multi Track Setlist",
      description: "Multiple tracks",
      createdAt: "2024-01-01",
      tracks: [
        {
          id: 1,
          title: "Track 1",
          artist: "Artist 1",
        },
        {
          id: 2,
          title: "Track 2",
          artist: "Artist 2",
        },
        {
          id: 3,
          title: "Track 3",
          artist: "Artist 3",
        },
      ],
    };

    mockFs.readFile.mockResolvedValue(mockYamlContent);
    mockYaml.load.mockReturnValue({
      setlist_name: "Multi Track Setlist",
      description: "Multiple tracks",
      created_at: "2024-01-01",
      tracks: [
        { id: 1, title: "Track 1", artist: "Artist 1" },
        { id: 2, title: "Track 2", artist: "Artist 2" },
        { id: 3, title: "Track 3", artist: "Artist 3" },
      ],
    });

    const result = await loadSetlistFromYamlUrl("/track/multi.yaml");

    expect(result).toEqual(expectedData);
  });

  it("snake_caseからcamelCaseへの変換が正しく確認される", async () => {
    const mockYamlContent = `
setlist_name: "Conversion Test"
description: "Test conversion"
created_at: "2024-01-01"
tracks:
  - id: 1
    title: "Test Track"
    artist: "Test Artist"
`;

    mockFs.readFile.mockResolvedValue(mockYamlContent);
    mockYaml.load.mockReturnValue({
      setlist_name: "Conversion Test",
      description: "Test conversion",
      created_at: "2024-01-01",
      tracks: [
        {
          id: 1,
          title: "Test Track",
          artist: "Test Artist",
        },
      ],
    });

    const result = await loadSetlistFromYamlUrl("/track/conversion.yaml");

    expect(result).toHaveProperty("setlistName", "Conversion Test");
    expect(result).toHaveProperty("createdAt", "2024-01-01");
    expect(result.tracks[0]).toHaveProperty("title", "Test Track");
  });

  it("YAMLパースエラーが正しく処理される", async () => {
    const mockYamlContent = "invalid: yaml: content: [";

    mockFs.readFile.mockResolvedValue(mockYamlContent);
    mockYaml.load.mockImplementation(() => {
      throw new Error("YAML parse error");
    });

    await expect(loadSetlistFromYamlUrl("/track/broken.yaml")).rejects.toThrow("YAML parse error");
  });
});
