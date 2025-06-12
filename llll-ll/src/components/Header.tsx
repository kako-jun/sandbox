"use client";

import { useState, useEffect, useCallback } from "react";
import { Language } from "@/types";

interface HeaderProps {
  language: Language;
}

export default function Header({ language }: HeaderProps) {
  const BLOCK_SIZE = 16;
  const GRID_HEIGHT = 4;
  const MAX_STACK = 3; // 縦3つまで、4つ目で全消し
  
  // 2次元配列グリッド [x][y] - true=ブロック有り、false=空
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [gridWidth, setGridWidth] = useState(0);
  const [fallingBlocks, setFallingBlocks] = useState<{id: number, x: number, y: number}[]>([]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ヘッダー幅に基づいてグリッドを初期化
  const initializeGrid = useCallback(() => {
    const header = document.getElementById("main-header");
    if (!header) return;

    const headerRect = header.getBoundingClientRect();
    const newGridWidth = Math.floor(headerRect.width / BLOCK_SIZE);
    
    if (newGridWidth !== gridWidth) {
      console.log(`🎮 グリッド初期化: 幅=${newGridWidth}, 高さ=${GRID_HEIGHT}`);
      
      // 新しいグリッドを作成
      const newGrid: boolean[][] = [];
      for (let x = 0; x < newGridWidth; x++) {
        newGrid[x] = new Array(GRID_HEIGHT).fill(false);
      }
      
      setGrid(newGrid);
      setGridWidth(newGridWidth);
    }
  }, [gridWidth]);

  // ブロックを指定位置に追加
  const addBlockAtColumn = useCallback((column: number) => {
    console.log(`🎮 ブロック追加: 列=${column}`);
    
    // 落下ブロックを作成
    const newFallingBlock = {
      id: Date.now() + Math.random(),
      x: column,
      y: -2 // ヘッダーの上端よりさらに上から開始
    };
    
    setFallingBlocks(prev => [...prev, newFallingBlock]);
    console.log(`✅ 落下ブロック追加:`, newFallingBlock);
  }, []);

  // クリック位置からグリッド列を計算
  const getColumnFromClick = useCallback((clickX: number) => {
    const column = Math.floor(clickX / BLOCK_SIZE);
    return Math.max(0, Math.min(column, gridWidth - 1));
  }, [gridWidth]);

  // グリッドの指定列で一番下の空き位置を取得
  const getBottomEmptyRow = useCallback((column: number) => {
    if (column < 0 || column >= gridWidth) return -1;
    
    // Y=0が1段目（下段）、Y=3が4段目（上段）
    // 下から上へ空きを探す
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (!grid[column]?.[y]) {
        return y;
      }
    }
    return -1; // 列が満杯
  }, [grid, gridWidth]);

  // 指定列のブロック数を取得
  const getStackHeight = useCallback((column: number) => {
    if (column < 0 || column >= gridWidth) return 0;
    
    let count = 0;
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (grid[column]?.[y]) count++;
    }
    return count;
  }, [grid, gridWidth]);

  // 初期化effect
  useEffect(() => {
    initializeGrid();
    
    const handleResize = () => {
      initializeGrid();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeGrid]);

  // ブロック生成タイマー
  useEffect(() => {
    if (gridWidth === 0) return;

    const addRandomBlock = () => {
      const randomColumn = Math.floor(Math.random() * gridWidth);
      console.log(`🎲 定期ブロック生成: 列=${randomColumn}`);
      addBlockAtColumn(randomColumn);
    };

    // 初回4秒後、その後42秒間隔
    const initialTimer = setTimeout(addRandomBlock, 4000);
    const blockInterval = setInterval(addRandomBlock, 42000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(blockInterval);
    };
  }, [gridWidth, addBlockAtColumn]);

  // 落下アニメーション
  useEffect(() => {
    const animate = () => {
      setFallingBlocks(prev => {
        const header = document.getElementById("main-header");
        if (!header) return prev;

        const headerHeight = header.getBoundingClientRect().height;
        const stillFalling: typeof prev = [];

        prev.forEach(block => {
          const currentPixelY = block.y * BLOCK_SIZE;
          const nextPixelY = currentPixelY + 1; // 1px/frame で落下
          
          // ヘッダー内に入ったかチェック
          if (nextPixelY < 0) {
            // まだヘッダーの上にいる
            stillFalling.push({
              ...block,
              y: nextPixelY / BLOCK_SIZE
            });
            return;
          }
          
          // 着地位置を事前計算
          const bottomRow = getBottomEmptyRow(block.x);
          
          if (bottomRow === -1) {
            // 列が満杯 - ブロックを消去
            console.log(`❌ 列満杯でブロック消去: 列=${block.x}`);
            return;
          }
          
          // 着地位置のピクセル座標（表示位置と同じ計算）
          const landingPixelY = headerHeight - BLOCK_SIZE * (bottomRow + 1);
          
          // 着地位置に到達したら即座に着地
          if (nextPixelY >= landingPixelY) {
            // グリッドに固定
            setGrid(prevGrid => {
              const newGrid = prevGrid.map(col => [...col]);
              if (newGrid[block.x]) {
                newGrid[block.x][bottomRow] = true;
              }
              return newGrid;
            });
            console.log(`🏗️ ブロック着地: 列=${block.x}, 行=${bottomRow}`);
            // 落下中リストから除外（着地完了）
          } else {
            // まだ落下中
            stillFalling.push({
              ...block,
              y: nextPixelY / BLOCK_SIZE
            });
          }
        });

        return stillFalling;
      });
    };

    const animationInterval = setInterval(animate, 33); // 30fps
    return () => clearInterval(animationInterval);
  }, [getBottomEmptyRow]);

  // 全消し判定
  useEffect(() => {
    // 4つ積み重なった列があるかチェック
    let shouldClear = false;
    
    for (let x = 0; x < gridWidth; x++) {
      const stackHeight = getStackHeight(x);
      if (stackHeight > MAX_STACK) {
        shouldClear = true;
        break;
      }
    }

    if (shouldClear) {
      console.log("💥 ブロック全消し - 4個積み重ね達成");
      setGrid(prev => {
        const newGrid: boolean[][] = [];
        for (let x = 0; x < gridWidth; x++) {
          newGrid[x] = new Array(GRID_HEIGHT).fill(false);
        }
        return newGrid;
      });
      setFallingBlocks([]); // 落下中のブロックも消去
    }
  }, [grid, gridWidth, getStackHeight]);

  // ブロッククリック（削除）
  const handleBlockClick = useCallback((e: React.MouseEvent, column: number, row: number) => {
    e.stopPropagation();
    
    setGrid(prev => {
      const newGrid = prev.map(col => [...col]);
      
      // クリックしたブロックを削除
      if (newGrid[column]) {
        newGrid[column][row] = false;
        console.log(`❌ ブロック削除: 列=${column}, 行=${row}`);
        
        // 削除したブロックより上にあるブロックを落下ブロックとして追加
        const header = document.getElementById("main-header");
        const headerHeight = header?.getBoundingClientRect().height || 64;
        
        const newFallingBlocks: {id: number, x: number, y: number}[] = [];
        
        for (let y = row + 1; y < GRID_HEIGHT; y++) {
          if (newGrid[column][y]) {
            // 上段のブロックを落下ブロックに変換
            const currentPixelY = headerHeight - BLOCK_SIZE * (y + 1);
            const fallingBlock = {
              id: Date.now() + Math.random() + y,
              x: column,
              y: currentPixelY / BLOCK_SIZE // 現在の位置をピクセル座標で
            };
            newFallingBlocks.push(fallingBlock);
            newGrid[column][y] = false; // グリッドから削除
            console.log(`🔽 落下ブロック化: 列=${column}, 行=${y} → ピクセルY=${currentPixelY}`);
          }
        }
        
        // 落下ブロックを追加
        if (newFallingBlocks.length > 0) {
          setFallingBlocks(prevFalling => [...prevFalling, ...newFallingBlocks]);
          console.log(`✅ ${newFallingBlocks.length}個のブロックが落下開始`);
        }
      }
      
      return newGrid;
    });
  }, []);

  // ヘッダークリック
  const handleHeaderClick = (e: React.MouseEvent<HTMLElement>) => {
    const header = e.currentTarget;
    const rect = header.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // h1タイトルがクリックされた場合はスクロール機能を優先
    if ((e.target as HTMLElement).tagName === "H1") {
      scrollToTop();
      return;
    }

    // ブロックをクリックした場合は何もしない
    if ((e.target as HTMLElement).dataset.block === "true") {
      return;
    }

    const column = getColumnFromClick(x);
    addBlockAtColumn(column);
  };

  // グリッドが初期化されていない場合は何も表示しない
  if (gridWidth === 0) {
    return (
      <header
        id="main-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "var(--bg-primary)",
          borderBottom: "1px solid var(--border-color)",
          padding: "0.5rem 0",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        <div className="container">
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <h1
              onClick={scrollToTop}
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
      </header>
    );
  }

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
        overflow: "hidden",
        cursor: "crosshair",
      }}
    >
      <div className="container">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
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

      {/* 固定ブロック */}
      {grid.map((column, x) =>
        column.map((hasBlock, y) => {
          if (!hasBlock) return null;
          
          const header = document.getElementById("main-header");
          const headerHeight = header?.getBoundingClientRect().height || 64;
          // Y=0が1段目（下段）、Y=3が4段目（上段）
          const pixelY = headerHeight - BLOCK_SIZE * (y + 1);
          
          return (
            <div
              key={`${x}-${y}`}
              data-block="true"
              onClick={(e) => handleBlockClick(e, x, y)}
              style={{
                position: "absolute",
                left: `${x * BLOCK_SIZE}px`,
                top: `${pixelY}px`,
                width: `${BLOCK_SIZE}px`,
                height: `${BLOCK_SIZE}px`,
                backgroundColor: "var(--text-accent)",
                cursor: "pointer",
                transition: "opacity 0.2s ease",
                zIndex: 20,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            />
          );
        })
      )}

      {/* 落下中ブロック */}
      {fallingBlocks.map((block) => {
        const header = document.getElementById("main-header");
        const headerHeight = header?.getBoundingClientRect().height || 64;
        const pixelY = block.y * BLOCK_SIZE; // ヘッダーの上端を基準に
        
        return (
          <div
            key={block.id}
            style={{
              position: "absolute",
              left: `${block.x * BLOCK_SIZE}px`,
              top: `${pixelY}px`,
              width: `${BLOCK_SIZE}px`,
              height: `${BLOCK_SIZE}px`,
              backgroundColor: "var(--text-accent)",
              zIndex: 19,
            }}
          />
        );
      })}
    </header>
  );
}
