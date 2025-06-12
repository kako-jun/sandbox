"use client";

import { useState, useEffect, useCallback } from "react";
import { Language } from "@/types";

interface Block {
  id: number;
  x: number;
  y: number;
  color: string;
  isClicked: boolean;
}

interface HeaderProps {
  language: Language;
}

export default function Header({ language }: HeaderProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);

  // 統一グリッドシステム：左端からブロック幅で区切る
  const BLOCK_SIZE = 16; // ブロックの幅
  const getGridPosition = (x: number, headerWidth: number): number => {
    const gridIndex = Math.floor(x / BLOCK_SIZE);
    const maxGridIndex = Math.floor(headerWidth / BLOCK_SIZE) - 1;
    const clampedIndex = Math.max(0, Math.min(gridIndex, maxGridIndex));
    return clampedIndex * BLOCK_SIZE;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ブロック追加のヘルパー関数
  const addBlockAtPosition = useCallback((x: number) => {
    console.log("🎮 ブロック追加:", x);
    const header = document.getElementById("main-header");
    if (!header) {
      console.warn("❌ ヘッダーが見つかりません");
      return;
    }

    const headerRect = header.getBoundingClientRect();
    
    // 統一グリッドシステムを使用
    const snappedX = getGridPosition(x, headerRect.width);
    
    console.log(`📍 統一グリッド: クリック${x}px → グリッド${snappedX}px`);

    const newBlock: Block = {
      id: Date.now() + Math.random(),
      x: snappedX,
      y: 0, // ヘッダーの上端から開始
      color: "var(--text-accent)",
      isClicked: false,
    };

    console.log("✅ 新ブロック:", newBlock);
    setBlocks((prev) => {
      console.log("📊 ブロック数:", prev.length, "→", prev.length + 1);
      return [...prev, newBlock];
    });
  }, []);

  useEffect(() => {
    console.log("🎮 Header useEffect 開始");
    
    // 初回は5秒後、その後42秒間隔でブロック生成
    const addBlock = () => {
      console.log("🎲 定期ブロック生成");
      const header = document.getElementById("main-header");
      if (!header) {
        console.warn("❌ ヘッダーが見つかりません（定期生成）");
        return;
      }

      const headerRect = header.getBoundingClientRect();
      
      // 統一グリッドシステムでランダム位置を選択
      const maxGridIndex = Math.floor(headerRect.width / BLOCK_SIZE) - 1;
      const randomGridIndex = Math.floor(Math.random() * (maxGridIndex + 1));
      const randomX = randomGridIndex * BLOCK_SIZE;
      
      console.log(`🎲 定期生成位置: インデックス${randomGridIndex}, X座標${randomX}px`);
      addBlockAtPosition(randomX);
    };

    // 初回は5秒後、その後42秒間隔でブロック生成
    const initialTimer = setTimeout(() => {
      addBlock();
      const blockInterval = setInterval(addBlock, 42000); // 10000から42000に変更
      
      // クリーンアップ関数に渡すためにintervalIdを保存
      (initialTimer as any).blockInterval = blockInterval;
    }, 5000);

    // アニメーション用のタイマー
    const animateBlocks = () => {
      setBlocks((prev) => {
        const header = document.getElementById("main-header");
        if (!header) return prev;

        const headerRect = header.getBoundingClientRect();
        const headerHeight = headerRect.height;
        const baseY = headerHeight - 18; // ヘッダーの下端から少し上
        
        // 初回のみヘッダー情報をログ出力
        if (prev.length === 0 || !(window as any).headerInfoLogged) {
          console.log(`📏 ヘッダー情報: 高さ=${headerHeight}px, baseY=${baseY}px`);
          (window as any).headerInfoLogged = true;
        }

        let newBlocks = prev.map((block) => {
          // ゆっくり落下させる
          const newY = block.y + 0.5; // 0.3から0.5に調整（少し速く）
          
          // 底に到達したか確認
          if (newY >= baseY) {
            // グリッドベースの完全一致判定（同じX座標のブロックのみ）
            const sameXBlocks = prev.filter(b => 
              b.id !== block.id && 
              b.x === block.x && // 完全一致（グリッドなので必ず同じ値）
              b.y >= baseY - 2 // より厳密な着地済みブロック判定
            );
            
            // 積み上げる高さを計算（一度だけ設定して、後で変更しない）
            const stackY = baseY - (sameXBlocks.length * 16);
            
            console.log(`🏗️ ブロック着地: x=${block.x}, baseY=${baseY}, stackY=${stackY}, 同じX座標ブロック=${sameXBlocks.length}個`);
            // 着地したブロックは位置を固定（Y座標を確定値に設定）
            return { ...block, y: stackY };
          }
          
          return { ...block, y: newY };
        });

        // 積み重ね数による全消し判定（4つ積み重なったら全消し）
        const maxStackHeight = 3; // 最大3つまで積み重ね可能
        
        // 各グリッド位置での積み重ね数をチェック
        const stackCounts = new Map<number, number>();
        newBlocks.forEach(block => {
          if (block.y >= baseY - 2) { // より厳密な着地済みブロック判定
            stackCounts.set(block.x, (stackCounts.get(block.x) || 0) + 1);
          }
        });
        
        // 現在の積み重ね状況をログ出力（デバッグ用）
        if (stackCounts.size > 0) {
          console.log(`📊 積み重ね状況:`, Array.from(stackCounts.entries()).map(([x, count]) => `x${x}:${count}個`).join(', '));
        }
        
        // 4つ以上積み重なった箇所があるかチェック
        const hasOverstack = Array.from(stackCounts.values()).some(count => count > maxStackHeight);
        if (hasOverstack) {
          console.log("💥 ブロック全消し - 4個積み重ね達成");
          newBlocks = [];
        }

        return newBlocks;
      });
    };

    const animationInterval = setInterval(animateBlocks, 33); // 30fps（16から33に変更）

    return () => {
      console.log("🧹 Header useEffect クリーンアップ");
      clearTimeout(initialTimer);
      if ((initialTimer as any).blockInterval) {
        clearInterval((initialTimer as any).blockInterval);
      }
      clearInterval(animationInterval);
    };
  }, [addBlockAtPosition]); // addBlockAtPositionを依存配列に追加

  const handleBlockClick = (e: React.MouseEvent, blockId: number) => {
    e.stopPropagation(); // ヘッダークリックイベントの伝播を停止
    setBlocks((prev) => prev.filter((block) => block.id !== blockId));
  };

  // ヘッダーをタップした位置にブロックを生成
  const handleHeaderClick = (e: React.MouseEvent<HTMLElement>) => {
    const header = e.currentTarget;
    const rect = header.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // h1タイトルがクリックされた場合はスクロール機能を優先
    if ((e.target as HTMLElement).tagName === "H1") {
      scrollToTop();
      return;
    }

    // ブロックをクリックした場合は何もしない（ブロック削除処理が優先）
    if ((e.target as HTMLElement).style.position === "absolute") {
      return;
    }

    addBlockAtPosition(x); // グリッドスナップは関数内で処理されるので、そのまま渡す
  };

  return (
    <header
      id="main-header"
      onClick={handleHeaderClick}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "var(--bg-primary)",
        borderBottom: "1px solid var(--border-color)",
        padding: "0.5rem 0",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
        overflow: "hidden", // ブロックがヘッダー外に出ないように
        cursor: "crosshair", // タップできることを示すカーソル
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              color: "var(--text-accent)",
              margin: 0,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            llll-ll
          </h1>
        </div>
      </div>

      {/* 落下ブロック */}
      {blocks.map((block) => (
        <div
          key={block.id}
          onClick={(e) => handleBlockClick(e, block.id)}
          style={{
            position: "absolute",
            left: `${block.x}px`,
            top: `${block.y}px`,
            width: "16px",
            height: "16px",
            backgroundColor: block.color,
            cursor: "pointer",
            transition: "opacity 0.2s ease",
            zIndex: 20, // ヘッダーより前面に表示
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.7";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        />
      ))}
    </header>
  );
}
