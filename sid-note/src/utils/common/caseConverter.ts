/**
 * 文字列をスネークケースからキャメルケースに変換します。
 */
function snakeToCamelCase(str: string): string {
  return str
    .replace(/^_+/, "") // 先頭のアンダースコアを削除
    .replace(/_([a-z])/g, (_, char) => char.toUpperCase()) // アンダースコア後の文字を大文字に
    .replace(/([A-Z])([A-Z]+)/g, (_, first, rest) => first + rest.toLowerCase()); // 大文字連続を適切に処理
}

/**
 * オブジェクトのエントリー（キーと値のペア）をキャメルケースに変換します。
 */
function convertObjectEntry([key, value]: [string, unknown]): [string, unknown] {
  return [snakeToCamelCase(key), toCamelCaseKeysDeep(value)];
}

/**
 * オブジェクトのキーをスネークケースからキャメルケースに再帰的に変換します。
 */
export function toCamelCaseKeysDeep(obj: unknown): unknown {
  // 配列の場合は各要素に対して再帰的に処理
  if (Array.isArray(obj)) {
    return obj.map(toCamelCaseKeysDeep);
  }

  // オブジェクトの場合はキーを変換して再帰的に処理
  if (obj && typeof obj === "object") {
    return Object.fromEntries(Object.entries(obj as Record<string, unknown>).map(convertObjectEntry));
  }

  // その他の型はそのまま返す
  return obj;
}
