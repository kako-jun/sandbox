"use client";

import { getKeyPosition } from "@/utils/music/theory/core/notes";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

/** キャンバスの幅（2倍解像度） */
const CANVAS_WIDTH = 220;
/** キャンバスの高さ（2倍解像度） */
const CANVAS_HEIGHT = 220;

/** キャンバスの中心X座標 */
const CENTER_X = CANVAS_WIDTH / 2;
/** キャンバスの中心Y座標 */
const CENTER_Y = CANVAS_HEIGHT / 2;

/**
 * 五度圏の線を描画します
 *
 * @param {CanvasRenderingContext2D} context - キャンバスのコンテキスト
 */
const drawLines = (context: CanvasRenderingContext2D): void => {
  // 外円
  context.beginPath();
  context.arc(CENTER_X, CENTER_Y, 100, 0, Math.PI * 2);
  context.strokeStyle = "#555555";
  context.lineWidth = 4;
  context.stroke();

  // 内円
  context.beginPath();
  context.arc(CENTER_X, CENTER_Y, 60, 0, Math.PI * 2);
  context.strokeStyle = "#555555";
  context.lineWidth = 2;
  context.stroke();

  // 放射線
  const radius = 100;
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * (i + 0.5)) / 12;
    const x = CENTER_X + radius * Math.cos(angle);
    const y = CENTER_Y + radius * Math.sin(angle);
    context.beginPath();
    context.moveTo(CENTER_X, CENTER_Y);
    context.lineTo(x, y);
    context.strokeStyle = "#555555";
    context.lineWidth = 2;
    context.stroke();
  }
};

/**
 * スケールの位置を描画します
 *
 * @param {CanvasRenderingContext2D} context - キャンバスのコンテキスト
 * @param {string} scale - スケール（調）
 */
const drawScale = (context: CanvasRenderingContext2D, scale: string): void => {
  if (!scale) return;

  const position = getKeyPosition(scale);
  const radius = position.circle === "inner" ? 40 : 80;
  const angle = (Math.PI * 2 * (position.index - 3)) / 12;
  const x = CENTER_X + radius * Math.cos(angle);
  const y = CENTER_Y + radius * Math.sin(angle);

  context.beginPath();
  context.arc(x, y, 10, 0, Math.PI * 2);
  context.fillStyle = "white";
  context.fill();
};

/**
 * 五度圏コンポーネントのプロパティ
 */
interface CircleOfFifthsProps {
  /** スケール（調） */
  scale: string;
}

/**
 * 五度圏コンポーネント
 * 五度圏を表示し、現在のスケールの位置を示します
 *
 * @param {CircleOfFifthsProps} props - コンポーネントのプロパティ
 * @returns {ReactNode} 五度圏コンポーネント
 */
export default function CircleOfFifths({ scale }: CircleOfFifthsProps): ReactNode {
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 背景は初回のみ描画
  useEffect(() => {
    if (!bgCanvasRef.current) return;
    const context = bgCanvasRef.current.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawLines(context);
  }, []);

  // 前面はscale変更時にクリア＆再描画
  useEffect(() => {
    if (!fgCanvasRef.current) return;
    const context = fgCanvasRef.current.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawScale(context, scale);
  }, [scale]);

  return (
    <div
      className="relative w-28 max-w-full"
      style={{ aspectRatio: "110 / 110" }}
      role="img"
      aria-label={`${scale}の五度圏`}
    >
      <canvas
        ref={bgCanvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="absolute left-0 top-0 w-full h-full z-10"
        aria-hidden="true"
      />
      <canvas
        ref={fgCanvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="absolute left-0 top-0 w-full h-full z-20 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * 五度圏の画像を生成します
 *
 * @param {string} scale - スケール（調）
 * @returns {string} 画像のDataURL
 */
export function getCircleOfFifthsImage(scale: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  drawLines(ctx);
  drawScale(ctx, scale);
  return canvas.toDataURL("image/png");
}
