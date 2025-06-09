# コード表記の「デフォルト + 差分」デザイン

## コンセプト

音楽理論におけるコード表記は、関数のデフォルト引数と同様の仕組みで動作します：

- **デフォルト動作**: メジャートライアド（1, 3, 5）
- **差分表記**: デフォルトからの変更点のみを記述

## 基本例

```typescript
// デフォルト：メジャートライアド
"C"     → [1, 3, 5]        // C + E + G

// 差分で3度を上書き
"Cm"    → [1, ♭3, 5]       // C + E♭ + G

// 差分で7度を追加
"C7"    → [1, 3, 5, ♭7]    // C + E + G + B♭

// 複合的な差分
"Cm7"   → [1, ♭3, 5, ♭7]   // C + E♭ + G + B♭
```

## デフォルト動作の定義

```typescript
const chordStructure = {
  root: "1", // 常に含まれる
  third: "3", // デフォルト：メジャー3度
  fifth: "5", // デフォルト：完全5度
  seventh: null, // デフォルト：7度なし
  extensions: new Set<string>(), // デフォルト：テンション音なし
};
```

## 差分による上書きルール

### 3 度の上書き

- `m` → 3 度を ♭3 に変更
- `sus4` → 3 度を 4 度に置換
- `sus2` → 3 度を 2 度に置換

### 5 度の上書き

- `aug` → 5 度を＃5 に変更
- `dim` → 5 度を ♭5 に変更
- `♭5` → 5 度を ♭5 に変更

### 7 度の追加

- `7` → ♭7 を追加
- `maj7` → 7 を追加
- `6` → 6 を追加（7 度より優先）

## 暗黙ルール（自動適用される差分）

### 拡張コードの自動 7 度追加

```typescript
// 9th、11th、13thコードは自動的に♭7を含む
"C9"  → [1, 3, 5, ♭7, 9]     // ♭7が暗黙で追加
"C11" → [1, 3, 5, ♭7, 9, 11] // ♭7が暗黙で追加

// addは暗黙ルールを無効化
"Cadd9" → [1, 3, 5, 9]       // ♭7は含まない
```

### 13th コードの自動 9 度追加

```typescript
"C13" → [1, 3, 5, ♭7, 9, 13] // 9度も暗黙で追加
```

## 実装の利点

### 1. 明確な責任分離

```typescript
// Before: 複雑な条件分岐
if (isMinor || isDim) {
  intervals.add("♭3");
} else if (!isSus2 && !isSus4) {
  intervals.add("3");
}

// After: デフォルト + 差分
chordStructure.third = "3"; // デフォルト
if (flags.isMinor || flags.isDim) {
  chordStructure.third = "♭3"; // 上書き
}
```

### 2. 音楽理論の暗黙ルールの明示化

```typescript
// 拡張コードの暗黙ルール
if ((flags.has9 && !flags.hasAdd9) || (flags.has11 && !flags.hasAdd11) || (flags.has13 && !flags.hasAdd13)) {
  if (!chordStructure.seventh) {
    chordStructure.seventh = "♭7"; // 暗黙の♭7を追加
  }
}
```

### 3. 拡張性の向上

新しいコードタイプを追加する際は、デフォルトからの差分のみを定義すればよい。

## テストケース例

```typescript
describe("デフォルト + 差分 デザイン", () => {
  it("デフォルト動作", () => {
    expect(getChordPositions("C")).toContainIntervals(["1", "3", "5"]);
  });

  it("3度の上書き", () => {
    expect(getChordPositions("Cm")).toContainIntervals(["1", "♭3", "5"]);
    expect(getChordPositions("Cm")).not.toContainInterval("3");
  });

  it("暗黙ルールの適用", () => {
    expect(getChordPositions("C9")).toContainIntervals(["1", "3", "5", "♭7", "9"]);
    expect(getChordPositions("Cadd9")).not.toContainInterval("♭7");
  });
});
```

## まとめ

この「デフォルト + 差分」アプローチにより：

1. **可読性向上**: 音楽理論の自然な考え方に沿った実装
2. **保守性向上**: 複雑な条件分岐を単純な上書きルールに整理
3. **拡張性向上**: 新しいコードタイプの追加が容易
4. **テスト性向上**: 各差分を独立してテスト可能

音楽のコード表記が持つ「デフォルト + 差分」の概念を、プログラミングの「デフォルト引数 + オーバーライド」パターンで実装することで、より直感的で保守しやすいコードになりました。
