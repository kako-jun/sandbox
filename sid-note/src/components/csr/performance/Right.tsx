"use client";

import { NoteType } from "@/schemas/trackSchema";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

/**
 * 矢印を描画します
 *
 * @param {CanvasRenderingContext2D} context - キャンバスの2Dコンテキスト
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {"down" | "up"} direction - 矢印の方向
 */
const drawArrow = (context: CanvasRenderingContext2D, x: number, y: number, direction: "down" | "up"): void => {
  context.beginPath();
  if (direction === "down") {
    context.moveTo(x - 4, y + 5);
    context.lineTo(x - 4, y - 5);
    context.lineTo(x + 4, y - 5);
    context.lineTo(x + 4, y + 5);
    context.moveTo(x - 4, y - 4);
    context.lineTo(x + 4, y - 4);
  } else {
    context.moveTo(x, y + 7);
    context.lineTo(x - 4, y - 5);
    context.moveTo(x, y + 7);
    context.lineTo(x + 4, y - 5);
  }

  context.strokeStyle = "#333333";
  context.lineWidth = 2;
  context.stroke();
};

/**
 * 弦の背景線を描画します
 *
 * @param {CanvasRenderingContext2D} context - キャンバスの2Dコンテキスト
 */
const drawLines = (context: CanvasRenderingContext2D): void => {
  context.strokeStyle = "#999999";
  context.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = 20 + i * 20;
    context.beginPath();
    context.moveTo(10, y);
    context.lineTo(210, y);
    context.stroke();
  }
};

/**
 * 弦の線を描画します
 *
 * @param {CanvasRenderingContext2D} context - キャンバスの2Dコンテキスト
 * @param {NoteType} note - 描画するノート
 */
const drawLine = (context: CanvasRenderingContext2D, note: NoteType): void => {
  // string
  context.strokeStyle = "#999999";
  context.lineWidth = 3;
  const y = 20 + (note.right!.string - 1) * 20;
  context.beginPath();
  context.moveTo(10, y);
  context.lineTo(210, y);
  context.stroke();
};

/**
 * ノートを描画します
 *
 * @param {CanvasRenderingContext2D} context - キャンバスの2Dコンテキスト
 * @param {NoteType} note - 描画するノート
 * @param {boolean} [next=false] - 次のノートかどうか
 */
const drawNote = (context: CanvasRenderingContext2D, note: NoteType, next: boolean = false): void => {
  if (!note.right) {
    return;
  }

  if (next) {
    const found = note.lefts.find((left) => {
      return left.type === "press";
    });
    if (found) {
      const nextY = 20 + (found.string - 1) * 20;
      const nextX = 80;

      context.beginPath();
      context.shadowBlur = 10;
      context.shadowColor = "rgba(0, 200, 255, 1)";
      context.arc(nextX, nextY, 10, 0, Math.PI * 2);
      context.fillStyle = "rgba(0, 200, 255, 0.2)";
      context.fill();

      // ぼかしをリセット
      context.shadowBlur = 0;
      context.shadowColor = "transparent";
    }
  } else {
    const y = 20 + (note.right.string - 1) * 20;
    const x = 80;

    context.beginPath();
    context.arc(x, y, 10, 0, Math.PI * 2);

    context.fillStyle = "white";
    context.fill();

    context.fillStyle = "black";
    context.font = "bold 12px Verdana";
    drawArrow(context, x, y, note.right.stroke === "down" ? "down" : "up");

    // mute
    note.right.muteStrings.forEach((muteString) => {
      const y = 20 + (muteString - 1) * 20;
      context.beginPath();
      context.arc(140, y, 10, 0, Math.PI * 2);

      context.fillStyle = "black";
      context.fill();

      context.fillStyle = "#555555";
      context.font = "20px Verdana";
      const text = "×";
      const textWidth = context.measureText(text).width;
      context.fillText(text, 148 - textWidth, y + 6);
    });
  }
};

/**
 * 右手ストロークコンポーネントのプロパティ
 */
interface RightProps {
  /** 現在のノート */
  note: NoteType;
  /** 次のノート（オプション） */
  nextNote?: NoteType | null;
}

/**
 * 右手ストロークコンポーネント
 * ギターのストロークを表示し、現在のノートと次のノートをハイライトします
 *
 * @param {RightProps} props - コンポーネントのプロパティ
 * @returns {ReactNode} 右手ストロークコンポーネント
 */
export default function Right({ note, nextNote = null }: RightProps): ReactNode {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const fgCanvasRef = useRef<HTMLCanvasElement>(null);

  // 背景は初回のみ描画
  useEffect(() => {
    if (!bgCanvasRef.current) {
      return;
    }
    const canvas = bgCanvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) {
      console.error("2D context not available");
      return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawLines(context);
  }, []);

  // ノートはnote/nextNote変更時のみ描画
  useEffect(() => {
    if (!fgCanvasRef.current) {
      return;
    }
    const canvas = fgCanvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) {
      console.error("2D context not available");
      return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawLine(context, note);
    if (nextNote) {
      drawNote(context, nextNote, true);
    }
    drawNote(context, note);
  }, [note, nextNote]);

  return (
    <div
      style={{
        width: 220,
        aspectRatio: "220 / 115",
        maxWidth: "100%",
        position: "relative",
      }}
      role="img"
      aria-label="ギターストローク"
    >
      <canvas
        ref={bgCanvasRef}
        width={220}
        height={115}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
        aria-hidden="true"
      />
      <canvas
        ref={fgCanvasRef}
        width={220}
        height={115}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
