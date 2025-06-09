import { TrackSchema, TrackType } from "@/schemas/trackSchema";
import { toCamelCaseKeysDeep } from "@/utils/common/caseConverter";
import yaml from "js-yaml";
// Node.jsのfsとpathを追加
import fs from "fs/promises";
import path from "path";

// export function loadTrackFromYaml(path: string): TrackType {
//   const fs = require("fs");
//   const file = fs.readFileSync(path, "utf8");
//   return yaml.load(file) as TrackType;
// }

export async function loadTrackFromYamlFile(file: File): Promise<TrackType> {
  const text = await file.text();
  const raw = yaml.load(text);
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid YAML format: must be an object");
  }
  const camel = toCamelCaseKeysDeep(raw);
  const parsed = TrackSchema.safeParse(camel);
  if (!parsed.success) {
    console.error("Validation errors:", parsed.error.format());
    throw new Error("Invalid track yaml: " + JSON.stringify(parsed.error.issues, null, 2));
  }
  return parsed.data;
}

export async function loadTrackFromYamlUrl(url: string): Promise<TrackType | null> {
  // サーバー側ならファイルシステムから直接読む
  // urlは"/track/track_11.yaml"や"https://example.com/track.yaml"のような形式を想定

  // URLがhttpまたはhttpsで始まる場合は外部URLと処理
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network error: ${response.statusText}`);
      }
      const text = await response.text();
      const raw = yaml.load(text);
      if (!raw || typeof raw !== "object") {
        throw new Error("Invalid YAML format: must be an object");
      }
      const camel = toCamelCaseKeysDeep(raw);
      const parsed = TrackSchema.safeParse(camel);
      if (!parsed.success) {
        console.error("Validation errors:", parsed.error.format());
        throw new Error("Invalid track yaml: " + JSON.stringify(parsed.error.issues, null, 2));
      }
      return parsed.data;
    } catch (err) {
      throw err;
    }
  }

  // ローカルファイルの処理
  const filePath = path.join(process.cwd(), "public", url.replace(/^\/?/, ""));
  let text: string;
  try {
    text = await fs.readFile(filePath, "utf8");
  } catch (err) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw err;
  }

  const raw = yaml.load(text);
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid YAML format: must be an object");
  }
  const camel = toCamelCaseKeysDeep(raw);
  const parsed = TrackSchema.safeParse(camel);
  if (!parsed.success) {
    console.error("Validation errors:", parsed.error.format());
    throw new Error("Invalid track yaml: " + JSON.stringify(parsed.error.issues, null, 2));
  }
  return parsed.data;
}
