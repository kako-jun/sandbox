"use client";

import { useEffect, useState } from "react";

interface Dot {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function BackgroundDots() {
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    // ランダムな位置にドットを生成
    const generateDots = () => {
      const newDots: Dot[] = [];
      const dotCount = 8; // ドットの数

      for (let i = 0; i < dotCount; i++) {
        newDots.push({
          id: i,
          x: Math.random() * 90 + 5, // 5%から95%の範囲
          y: Math.random() * 90 + 5, // 5%から95%の範囲
          size: Math.random() * 4 + 6, // 6px〜10px
          duration: Math.random() * 2 + 3, // 3s〜5s
          delay: Math.random() * 3, // 0s〜3s
          opacity: Math.random() * 0.2 + 0.2, // 0.2〜0.4
        });
      }
      setDots(newDots);
    };

    generateDots();

    // ページリサイズ時に再生成
    const handleResize = () => {
      generateDots();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {dots.map((dot) => (
        <div
          key={dot.id}
          style={{
            position: "fixed",
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            backgroundColor: "var(--primary-color)",
            opacity: dot.opacity,
            animation: `float-${dot.id} ${dot.duration}s ease-in-out infinite`,
            animationDelay: `${dot.delay}s`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      ))}

      <style jsx>{`
        ${dots
          .map(
            (dot) => `
          @keyframes float-${dot.id} {
            0%, 100% { 
              transform: translateY(0px) translateX(0px); 
            }
            25% { 
              transform: translateY(-${Math.random() * 15 + 5}px) translateX(${Math.random() * 10 - 5}px); 
            }
            50% { 
              transform: translateY(-${Math.random() * 20 + 10}px) translateX(${Math.random() * 10 - 5}px); 
            }
            75% { 
              transform: translateY(-${Math.random() * 15 + 5}px) translateX(${Math.random() * 10 - 5}px); 
            }
          }
        `
          )
          .join("")}
      `}</style>
    </>
  );
}
