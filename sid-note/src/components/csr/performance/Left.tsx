"use client";

import { NoteType } from "@/schemas/trackSchema";
import { playNoteSound } from "@/utils/music/audio/player";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";

/**
 * 指板の背景線を描画します
 *
 * @param {CanvasRenderingContext2D} context - キャンバスの2Dコンテキスト
 */
const drawLines = (context: CanvasRenderingContext2D): void => {
  // string
  context.strokeStyle = "#999999";
  context.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = 20 + i * 20;
    context.beginPath();
    context.moveTo(10, y);
    context.lineTo(2410, y);
    context.stroke();
  }

  // fret
  const verticalLineCount = 24;
  const spacing = 2400 / verticalLineCount;
  context.fillStyle = "#999999";
  context.font = "12px Arial";
  for (let i = 0; i <= verticalLineCount; i++) {
    const x = 10 + i * spacing;
    context.beginPath();
    context.moveTo(x, 10);
    context.lineTo(x, 90);
    context.stroke();

    const text = `${i}`;
    const textWidth = context.measureText(text).width;
    context.fillText(text, x - textWidth / 2, 105);
  }

  // circle
  context.beginPath();
  context.arc(260, 50, 5, 0, Math.PI * 2);
  context.arc(460, 50, 5, 0, Math.PI * 2);
  context.arc(660, 50, 5, 0, Math.PI * 2);
  context.arc(860, 50, 5, 0, Math.PI * 2);
  context.fillStyle = "#555555";
  context.fill();

  context.beginPath();
  context.arc(1160, 30, 5, 0, Math.PI * 2);
  context.arc(1160, 70, 5, 0, Math.PI * 2);
  context.fillStyle = "#555555";
  context.fill();

  context.beginPath();
  context.arc(1460, 50, 5, 0, Math.PI * 2);
  context.arc(1660, 50, 5, 0, Math.PI * 2);
  context.arc(1860, 50, 5, 0, Math.PI * 2);
  context.arc(2060, 50, 5, 0, Math.PI * 2);
  context.fillStyle = "#555555";
  context.fill();

  context.beginPath();
  context.arc(2360, 30, 5, 0, Math.PI * 2);
  context.arc(2360, 70, 5, 0, Math.PI * 2);
  context.fillStyle = "#555555";
  context.fill();
};


/**
 * ノートを描画します
 *
 * @param {CanvasRenderingContext2D} context - キャンバスの2Dコンテキスト
 * @param {NoteType} note - 描画するノート
 * @param {boolean} [next=false] - 次のノートかどうか
 */
const drawNote = (context: CanvasRenderingContext2D, note: NoteType, next: boolean = false): void => {
  if (next) {
    const found = note.lefts.find((left) => {
      return left.type === "press";
    });
    if (found) {
      const nextY = 20 + (found.string - 1) * 20;
      const nextX = 10 + found.fret * (2400 / 24);

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
    note.lefts.forEach((left) => {
      const y = 20 + (left.string - 1) * 20;
      const x = 10 + left.fret * (2400 / 24);

      // finger
      if (left.type !== "chord" && left.fret > 0) {
        context.beginPath();
        context.arc(x, y, 20, 0, Math.PI);
        context.fillStyle = "rgba(50, 0, 255, 0.2)";
        context.fill();
        context.fillRect(x - 20, 0, 40, 20 + 20 * (left.string - 1));
      }

      context.beginPath();
      context.arc(x, y, 10, 0, Math.PI * 2);

      switch (left.type) {
        case "press":
          if (left.interval === "1") {
            context.fillStyle = "khaki";
          } else {
            context.fillStyle = "#cccccc";
          }
          break;
        case "mute":
          context.fillStyle = "black";
          break;
        case "ghost_note":
          context.fillStyle = "black";
          break;
        case "chord":
          context.ellipse(x, y, 32, 10, 0, 0, Math.PI * 2);
          if (left.interval === "1") {
            context.fillStyle = "khaki";
          } else {
            context.fillStyle = "#cccccc";
          }
          break;
        default:
          context.fillStyle = "white";
      }
      context.fill();

      switch (left.type) {
        case "press":
          context.fillStyle = "black";
          break;
        case "mute":
          context.fillStyle = "white";
          break;
        case "ghost_note":
          context.fillStyle = "white";
          break;
        case "chord":
          context.fillStyle = "black";
          break;
        default:
          context.fillStyle = "black";
      }

      context.font = "12px Verdana";
      let text = left.fret > 0 ? `${left.finger}` : "";
      if (left.type === "chord") {
        text = `${left.pitch}`;
      }

      const textWidth = context.measureText(text).width;
      context.fillText(text, x - textWidth / 2, y + 4);

      if (left.interval) {
        context.fillStyle = "white";
        context.font = "12px Arial";
        const text = left.interval;
        const textWidth = context.measureText(text).width;
        if (left.type === "chord") {
          context.fillText(text, x + 40 - textWidth / 2, y - 4);
        } else {
          context.fillText(text, x + 20 - textWidth / 2, y - 4);
        }
      }

      // instrument
      if (left.type === "chord" && left.instrument) {
        context.fillStyle = "pink";
        context.font = "12px Verdana";
        const text = left.instrument;
        const textWidth = context.measureText(text).width;
        context.fillText(text, x - 46 - textWidth / 2, y - 4);
      }
    });
  }
};

/**
 * ノートのヒットエリアを管理するフック
 *
 * @returns {React.MutableRefObject<Array<{ x: number; y: number; r: number; pitch: string }>>} ヒットエリアの配列
 */
const useNoteHitAreas = () => {
  const ref = useRef<{ x: number; y: number; r: number; pitch: string }[]>([]);
  return ref;
};

/**
 * 左手指板コンポーネントのプロパティ
 */
interface LeftProps {
  /** 現在のノート */
  note: NoteType;
  /** 次のノート（オプション） */
  nextNote?: NoteType | null;
  /** スクロール位置（オプション） */
  scrollLeft?: number;
  /** スクロール時のコールバック（オプション） */
  onScroll?: (left: number) => void;
}

/**
 * 左手指板コンポーネント
 * ギターの指板を表示し、現在のノートと次のノートをハイライトします
 *
 * @param {LeftProps} props - コンポーネントのプロパティ
 * @returns {ReactNode} 左手指板コンポーネント
 */
export default function Left({ note, nextNote = null, scrollLeft, onScroll }: LeftProps): ReactNode {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const fgCanvasRef = useRef<HTMLCanvasElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  // 丸のヒットエリア
  const noteHitAreas = useNoteHitAreas();

  // 丸のヒットエリアをリセット
  const resetNoteHitAreas = useCallback(() => {
    noteHitAreas.current = [];
  }, [noteHitAreas]);

  // 丸のヒットエリアを追加
  const addNoteHitArea = useCallback(
    (x: number, y: number, r: number, pitch: string) => {
      noteHitAreas.current.push({ x, y, r, pitch });
    },
    [noteHitAreas]
  );

  // drawNoteをラップしてヒットエリアも記録
  const drawNoteWithHitArea = useCallback(
    (context: CanvasRenderingContext2D, note: NoteType, next: boolean = false) => {
      if (next) {
        // nextNoteのヒットエリアは不要
      } else {
        note.lefts.forEach((left) => {
          // pressまたはchordのみヒットエリアを追加
          if (left.type === "press") {
            const y = 20 + (left.string - 1) * 20;
            const x = 10 + left.fret * (2400 / 24);
            addNoteHitArea(x, y, 10, left.pitch ?? "");
          } else if (left.type === "chord") {
            const y = 20 + (left.string - 1) * 20;
            const x = 10 + left.fret * (2400 / 24);
            addNoteHitArea(x, y, 32, left.pitch ?? "");
          }
        });
      }
      drawNote(context, note, next);
    },
    [addNoteHitArea]
  );

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
    resetNoteHitAreas();
    if (nextNote) {
      drawNoteWithHitArea(context, nextNote, true);
    }
    drawNoteWithHitArea(context, note);
  }, [note, nextNote, drawNoteWithHitArea, resetNoteHitAreas]);

  // スクロール位置の更新
  useEffect(() => {
    if (scrollLeft !== undefined && parentRef.current) {
      parentRef.current.scrollLeft = scrollLeft;
    }
  }, [scrollLeft]);

  // キャンバスクリック時の処理
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // ヒットエリアのチェック
    for (const area of noteHitAreas.current) {
      const dx = x - area.x;
      const dy = y - area.y;
      if (dx * dx + dy * dy <= area.r * area.r) {
        playNoteSound(area.pitch + "3", 1.5);
        break;
      }
    }
  };

  // マウスイベントの処理
  useEffect(() => {
    if (!parentRef.current) {
      return;
    }

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastX.current = e.clientX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !parentRef.current) {
        return;
      }
      const dx = e.clientX - lastX.current;
      parentRef.current.scrollLeft -= dx;
      lastX.current = e.clientX;
      onScroll?.(parentRef.current.scrollLeft);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const element = parentRef.current;
    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseup", handleMouseUp);
    element.addEventListener("mouseleave", handleMouseUp);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseup", handleMouseUp);
      element.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [onScroll]);

  return (
    <div
      ref={parentRef}
      style={{
        position: "relative",
        width: "100%",
        height: 120,
        overflow: "auto",
      }}
      role="img"
      aria-label="ギター指板"
    >
      <canvas
        ref={bgCanvasRef}
        width={2420}
        height={120}
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
        width={2420}
        height={120}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
        }}
        onClick={handleCanvasClick}
        aria-hidden="true"
      />
    </div>
  );
}
