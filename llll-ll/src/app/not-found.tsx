"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Language } from "@/types";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/hooks/useTheme";
import ArrowIcon from "@/components/ArrowIcon";
import BackgroundDots from "@/components/BackgroundDots";

export default function NotFound() {
  const [language, setLanguage] = useState<Language>("ja");
  const { theme, toggleTheme } = useTheme();
  const t = useTranslation(language);
  const [mounted, setMounted] = useState(false);

  // ミニゲーム用の状態
  const [gameStarted, setGameStarted] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [gridNumbers, setGridNumbers] = useState<number[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);

  // クライアントサイドでのマウント確認
  useEffect(() => {
    setMounted(true);
  }, []);

  // ゲーム初期化
  const initializeGame = () => {
    const numbers = Array.from({ length: 16 }, (_, i) => i + 1);
    const shuffled = numbers.sort(() => Math.random() - 0.5);
    setGridNumbers(shuffled);
    setCurrentNumber(1);
    setGameStarted(true);
    setGameCompleted(false);
    setStartTime(Date.now());
    setEndTime(0);
  };

  // 数字クリック処理
  const handleNumberClick = (clickedNumber: number) => {
    if (clickedNumber === currentNumber) {
      if (currentNumber === 16) {
        setGameCompleted(true);
        setEndTime(Date.now());
      } else {
        setCurrentNumber(currentNumber + 1);
      }
    }
  };

  // ゲームリセット
  const resetGame = () => {
    setGameStarted(false);
    setCurrentNumber(1);
    setGridNumbers([]);
    setGameCompleted(false);
    setStartTime(0);
    setEndTime(0);
  };
  const notFoundMessages = {
    en: {
      title: "404 - Page Not Found",
      message: "The page you are looking for could not be found.",
      backHome: "Back to Home",
      gameTitle: "Mini Game: Click 1 to 16 in order!",
      gameStart: "Start Game",
      gameReset: "Reset",
      gameCompleted: "Completed!",
      gameTime: "Time:",
      gameNext: "Next:",
    },
    ja: {
      title: "404 - ページが見つかりません",
      message: "お探しのページは見つかりませんでした。",
      backHome: "ホームに戻る",
      gameTitle: "ミニゲーム: 1から16を順番にクリック！",
      gameStart: "ゲーム開始",
      gameReset: "リセット",
      gameCompleted: "クリア！",
      gameTime: "タイム:",
      gameNext: "次:",
    },
    zh: {
      title: "404 - 页面未找到",
      message: "您查找的页面未找到。",
      backHome: "返回首页",
      gameTitle: "小游戏：按顺序点击1到16！",
      gameStart: "开始游戏",
      gameReset: "重置",
      gameCompleted: "完成！",
      gameTime: "时间:",
      gameNext: "下一个:",
    },
  };

  const messages = notFoundMessages[language];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--background-color)",
        color: "var(--text-color)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      {" "}
      {/* 言語選択 */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
          }}
        >          <button
            onClick={() => {
              setLanguage("en");
              document.documentElement.lang = "en";
            }}
            style={{
              background: "none",
              border: "none",
              color: language === "en" ? "var(--primary-color)" : "var(--link-color)",
              textDecoration: "underline",
              fontSize: "0.9rem",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: language === "en" ? "bold" : "normal",
              minWidth: "60px",
              textAlign: "center",
            }}
          >
            English
          </button>
          <span style={{ color: "var(--muted-text)", fontSize: "0.8rem" }}>|</span>
          <button
            onClick={() => {
              setLanguage("ja");
              document.documentElement.lang = "ja";
            }}
            style={{
              background: "none",
              border: "none",
              color: language === "ja" ? "var(--primary-color)" : "var(--link-color)",
              textDecoration: "underline",
              fontSize: "0.9rem",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: language === "ja" ? "bold" : "normal",
              minWidth: "60px",
              textAlign: "center",
            }}
          >
            日本語
          </button>
          <span style={{ color: "var(--muted-text)", fontSize: "0.8rem" }}>|</span>
          <button
            onClick={() => {
              setLanguage("zh");
              document.documentElement.lang = "zh";
            }}
            style={{
              background: "none",
              border: "none",
              color: language === "zh" ? "var(--primary-color)" : "var(--link-color)",
              textDecoration: "underline",
              fontSize: "0.9rem",
              cursor: "pointer",
              fontFamily: language === "zh" ? "'Noto Sans SC', sans-serif" : "inherit",
              fontWeight: language === "zh" ? "bold" : "normal",
              minWidth: "60px",
              textAlign: "center",
            }}
          >
            中文
          </button>{" "}
        </div>{" "}
        {/* テーマ切り替えスイッチ */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1rem",
          }}
        >
          <button
            onClick={() => {
              // ダークテーマの時のみライトテーマに切り替え
              if (theme === "dark") {
                toggleTheme();
              }
            }}
            style={{
              background: "none",
              border: "none",
              fontSize: "0.8rem",
              color: "var(--muted-text)",
              cursor: theme === "dark" ? "pointer" : "default",
              padding: "0.25rem",
              opacity: theme === "dark" ? 1 : 0.5,
            }}
          >
            ☀️
          </button>{" "}
          <button
            onClick={toggleTheme}
            style={{
              position: "relative",
              width: "50px",
              height: "24px",
              backgroundColor: theme === "dark" ? "var(--primary-color)" : "#ccc",
              border: "none",
              borderRadius: "2px", // 4pxから2pxに変更してラウンドを少なく
              cursor: "pointer",
              transition: "background-color 0.3s ease",
              padding: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "2px",
                left: theme === "dark" ? "26px" : "2px",
                width: "20px",
                height: "20px",
                backgroundColor: "#ffffff",
                borderRadius: "1px", // 2pxから1pxに変更してさらにラウンドを少なく
                transition: "left 0.3s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            />
          </button>
          <button
            onClick={() => {
              // ライトテーマの時のみダークテーマに切り替え
              if (theme === "light") {
                toggleTheme();
              }
            }}
            style={{
              background: "none",
              border: "none",
              fontSize: "0.8rem",
              color: "var(--muted-text)",
              cursor: theme === "light" ? "pointer" : "default",
              padding: "0.25rem",
              opacity: theme === "light" ? 1 : 0.5,
            }}
          >
            🌙
          </button>
        </div>
      </div>
      {/* 404メッセージ */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: "var(--primary-color)",
            fontFamily: language === "zh" ? "'Noto Sans SC', sans-serif" : "inherit",
          }}
        >
          404
        </h1>{" "}
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: "var(--text-color)",
            fontFamily: language === "zh" ? "'Noto Sans SC', sans-serif" : "inherit",
          }}
        >
          {messages.title}
        </h2>{" "}
        <p
          style={{
            fontSize: "1rem",
            color: "var(--muted-text)",
            marginBottom: "2rem",
            maxWidth: "400px",
            lineHeight: "1.6",
            fontFamily: language === "zh" ? "'Noto Sans SC', sans-serif" : "inherit",
          }}
        >
          {messages.message}
        </p>
      </div>{" "}
      {/* ミニゲーム */}
      <div style={{ marginBottom: "6rem" }}>
        <h3
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: "var(--text-color)",
            fontFamily: language === "zh" ? "'Noto Sans SC', sans-serif" : "inherit",
          }}
        >
          {messages.gameTitle}
        </h3>

        {!gameStarted ? (
          <button
            onClick={initializeGame}
            style={{
              backgroundColor: "var(--primary-color)",
              color: "#ffffff",
              border: "none",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              cursor: "pointer",
              fontFamily: language === "zh" ? "'Noto Sans SC', sans-serif" : "inherit",
              fontWeight: "bold",
              borderRadius: "0.25rem",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {messages.gameStart}
          </button>
        ) : (
          <div>
            {/* ゲーム情報 */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "2rem",
                marginBottom: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: "0.9rem", color: "var(--text-color)" }}>
                {messages.gameNext} <strong style={{ color: "var(--primary-color)" }}>{currentNumber}</strong>
              </div>
              {gameCompleted && (
                <div style={{ fontSize: "0.9rem", color: "var(--primary-color)", fontWeight: "bold" }}>
                  {messages.gameCompleted} {messages.gameTime} {((endTime - startTime) / 1000).toFixed(2)}s
                </div>
              )}
            </div>

            {/* ゲームグリッド */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 50px)",
                gap: "8px",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              {gridNumbers.map((number, index) => (
                <button
                  key={index}
                  onClick={() => handleNumberClick(number)}
                  disabled={gameCompleted}
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor:
                      number < currentNumber
                        ? "var(--primary-color)"
                        : number === currentNumber
                        ? "var(--accent-color)"
                        : "var(--input-background)",
                    color:
                      number < currentNumber ? "#ffffff" : number === currentNumber ? "#ffffff" : "var(--text-color)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    cursor: gameCompleted ? "default" : "pointer",
                    transition: "all 0.2s ease",
                    opacity: gameCompleted ? 0.7 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!gameCompleted && number >= currentNumber) {
                      e.currentTarget.style.backgroundColor = "var(--hover-background)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!gameCompleted) {
                      e.currentTarget.style.backgroundColor =
                        number < currentNumber
                          ? "var(--primary-color)"
                          : number === currentNumber
                          ? "var(--accent-color)"
                          : "var(--input-background)";
                    }
                  }}
                >
                  {number}
                </button>
              ))}
            </div>

            {/* リセットボタン */}
            <button
              onClick={resetGame}
              style={{
                backgroundColor: "var(--background-color)",
                color: "var(--text-color)",
                border: "1px solid var(--border-color)",
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                cursor: "pointer",
                fontFamily: language === "zh" ? "'Noto Sans SC', sans-serif" : "inherit",
                borderRadius: "0.25rem",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "var(--hover-background)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "var(--background-color)";
              }}
            >
              {messages.gameReset}
            </button>
          </div>
        )}
      </div>
      {/* ホームに戻るボタン */}
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          backgroundColor: "var(--primary-color)",
          color: "#ffffff",
          textDecoration: "none",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.25rem",
          fontSize: "1rem",
          fontWeight: "bold",
          transition: "opacity 0.2s ease",
          fontFamily: language === "zh" ? "'Noto Sans SC', sans-serif" : "inherit",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.opacity = "0.9";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
      >
        {" "}
        <ArrowIcon direction="left" size={16} strokeWidth={2} />
        {messages.backHome}
      </Link>
      {/* 背景アニメーション */}
      <BackgroundDots />
    </div>
  );
}
