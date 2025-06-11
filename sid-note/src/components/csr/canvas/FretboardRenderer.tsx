"use client";

import React from "react";

export interface FretboardConfig {
  /** フレット数 */
  fretCount: number;
  /** 弦数 */
  stringCount: number;
  /** キャンバス幅 */
  width: number;
  /** キャンバス高さ */
  height: number;
  /** 左マージン */
  leftMargin: number;
  /** 弦間隔 */
  stringSpacing: number;
}

export interface PositionMarker {
  /** フレット位置 */
  fret: number;
  /** Y座標 */
  y: number;
  /** マーカー色 */
  color: string;
}

interface FretboardRendererProps {
  config: FretboardConfig;
  markers?: PositionMarker[];
  className?: string;
}

/**
 * フレットボード描画の基盤コンポーネント
 * Canvas要素とその描画ロジックを提供
 */
const FretboardRenderer: React.FC<FretboardRendererProps> = ({
  config,
  markers = [],
  className,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const drawFretboard = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // キャンバスクリア
    context.clearRect(0, 0, config.width, config.height);

    // 弦の描画
    drawStrings(context, config);
    
    // フレットの描画
    drawFrets(context, config);
    
    // ポジションマーカーの描画
    drawPositionMarkers(context, config);
    
    // カスタムマーカーの描画
    markers.forEach(marker => {
      drawMarker(context, config, marker);
    });
  }, [config, markers]);

  React.useEffect(() => {
    drawFretboard();
  }, [drawFretboard]);

  return (
    <canvas
      ref={canvasRef}
      width={config.width}
      height={config.height}
      className={className}
    />
  );
};

/**
 * 弦を描画
 */
const drawStrings = (context: CanvasRenderingContext2D, config: FretboardConfig): void => {
  context.strokeStyle = "#999999";
  context.lineWidth = 1;
  
  for (let i = 0; i < config.stringCount; i++) {
    const y = config.leftMargin + i * config.stringSpacing;
    context.beginPath();
    context.moveTo(config.leftMargin, y);
    context.lineTo(config.width - config.leftMargin, y);
    context.stroke();
  }
};

/**
 * フレットを描画
 */
const drawFrets = (context: CanvasRenderingContext2D, config: FretboardConfig): void => {
  const fretSpacing = (config.width - config.leftMargin * 2) / config.fretCount;
  
  context.strokeStyle = "#999999";
  context.lineWidth = 1;
  context.fillStyle = "#999999";
  context.font = "12px Arial";
  
  for (let i = 0; i <= config.fretCount; i++) {
    const x = config.leftMargin + i * fretSpacing;
    
    // フレットライン
    context.beginPath();
    context.moveTo(x, config.leftMargin - 10);
    context.lineTo(x, config.height - config.leftMargin + 10);
    context.stroke();
    
    // フレット番号
    const text = `${i}`;
    const textWidth = context.measureText(text).width;
    context.fillText(text, x - textWidth / 2, config.height - 5);
  }
};

/**
 * ポジションマーカー（3, 5, 7, 9フレット等）を描画
 */
const drawPositionMarkers = (context: CanvasRenderingContext2D, config: FretboardConfig): void => {
  const fretSpacing = (config.width - config.leftMargin * 2) / config.fretCount;
  const centerY = config.height / 2;
  
  context.fillStyle = "#555555";
  
  // 単一ドットマーカー（3, 5, 7, 9フレット）
  [3, 5, 7, 9].forEach(fret => {
    if (fret <= config.fretCount) {
      const x = config.leftMargin + fret * fretSpacing - fretSpacing / 2;
      context.beginPath();
      context.arc(x, centerY, 5, 0, Math.PI * 2);
      context.fill();
    }
  });
  
  // ダブルドットマーカー（12フレット）
  if (12 <= config.fretCount) {
    const x = config.leftMargin + 12 * fretSpacing - fretSpacing / 2;
    const offset = config.stringSpacing;
    
    context.beginPath();
    context.arc(x, centerY - offset, 5, 0, Math.PI * 2);
    context.arc(x, centerY + offset, 5, 0, Math.PI * 2);
    context.fill();
  }
};

/**
 * カスタムマーカーを描画
 */
const drawMarker = (
  context: CanvasRenderingContext2D, 
  config: FretboardConfig, 
  marker: PositionMarker
): void => {
  const fretSpacing = (config.width - config.leftMargin * 2) / config.fretCount;
  const x = config.leftMargin + marker.fret * fretSpacing - fretSpacing / 2;
  
  context.fillStyle = marker.color;
  context.beginPath();
  context.arc(x, marker.y, 8, 0, Math.PI * 2);
  context.fill();
};

export default FretboardRenderer;