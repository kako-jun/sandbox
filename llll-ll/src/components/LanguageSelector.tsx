"use client";

import { useState, useEffect } from "react";
import { Language } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "@/lib/i18n";

interface LanguageSelectorProps {
  onLanguageSelect: (lang: Language) => void;
  selectedLanguage?: Language | null;
}

export default function LanguageSelector({ onLanguageSelect, selectedLanguage }: LanguageSelectorProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const [currentLang, setCurrentLang] = useState<Language>("en"); // 表示用の言語状態
  const [isChanging, setIsChanging] = useState(false);

  // 言語変更時のフェード効果付き関数
  const changeLanguageWithFade = (lang: Language) => {
    if (lang !== currentLang) {
      setIsChanging(true);
      setTimeout(() => {
        setCurrentLang(lang);
        setIsChanging(false);
      }, 200); // 200msでフェードアウト→フェードイン
    }
  };

  // 言語選択時にHTMLのlang属性も更新
  const handleLanguageSelect = (lang: Language) => {
    onLanguageSelect(lang);
    document.documentElement.lang = lang;
    setCurrentLang(lang);
  };

  // 言語が既に選択されている場合は、コンパクトな表示
  if (selectedLanguage) {
    return (
      <div
        style={{
          backgroundColor: "var(--background-color)",
          borderBottom: "1px solid var(--border-color)",
          padding: "0.5rem 0",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              fontSize: "0.9rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <button
                onClick={() => handleLanguageSelect("en")}
                style={{
                  background: "none",
                  border: "none",
                  color: selectedLanguage === "en" ? "var(--primary-color)" : "var(--link-color)",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontFamily: "'Noto Sans', sans-serif",
                  fontWeight: selectedLanguage === "en" ? "bold" : "normal",
                  width: "60px",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                English
              </button>

              <span
                style={{
                  color: "var(--muted-text)",
                  width: "15px",
                  textAlign: "center",
                  display: "inline-block",
                  fontFamily: "'Noto Sans', sans-serif",
                  flexShrink: 0,
                }}
              >
                |
              </span>

              <button
                onClick={() => handleLanguageSelect("ja")}
                style={{
                  background: "none",
                  border: "none",
                  color: selectedLanguage === "ja" ? "var(--primary-color)" : "var(--link-color)",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontFamily: "'Noto Sans', sans-serif",
                  fontWeight: selectedLanguage === "ja" ? "bold" : "normal",
                  width: "60px",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                日本語
              </button>

              <span
                style={{
                  color: "var(--muted-text)",
                  width: "15px",
                  textAlign: "center",
                  display: "inline-block",
                  fontFamily: "'Noto Sans', sans-serif",
                  flexShrink: 0,
                }}
              >
                |
              </span>

              <button
                onClick={() => handleLanguageSelect("zh")}
                style={{
                  background: "none",
                  border: "none",
                  color: selectedLanguage === "zh" ? "var(--primary-color)" : "var(--link-color)",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontFamily: "'Noto Sans', sans-serif",
                  fontWeight: selectedLanguage === "zh" ? "bold" : "normal",
                  width: "60px",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                中文
              </button>
            </div>

            {/* Theme Toggle Switch */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <button
                onClick={() => {
                  // ライトテーマの時のみダークテーマに切り替え
                  if (theme === "dark") {
                    toggleTheme();
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--muted-text)",
                  cursor: mounted ? (theme === "dark" ? "pointer" : "default") : "default",
                  padding: "0.25rem",
                  opacity: mounted ? (theme === "dark" ? 1 : 0.5) : 0.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5" />
                  <path
                    d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                  />
                  <circle cx="12" cy="12" r="4" fill="currentColor" />
                </svg>
              </button>
              <button
                onClick={toggleTheme}
                style={{
                  position: "relative",
                  width: "50px",
                  height: "24px",
                  backgroundColor: mounted ? (theme === "dark" ? "var(--primary-color)" : "#ccc") : "#ccc",
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
                    left: mounted ? (theme === "dark" ? "26px" : "2px") : "2px",
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
                  color: "var(--muted-text)",
                  cursor: mounted ? (theme === "light" ? "pointer" : "default") : "default",
                  padding: "0.25rem",
                  opacity: mounted ? (theme === "light" ? 1 : 0.5) : 0.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                🌙
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 言語が未選択の場合は、フルスクリーンの選択画面
  const t = useTranslation(currentLang);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--background-color)",
      }}
    >
      <div className="container">
        <div style={{ textAlign: "center" }}>
          <h1
            className="logo-font"
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "2rem",
              color: "var(--primary-color)",
            }}
          >
            llll-ll
          </h1>

          <p
            style={{
              fontSize: "1.2rem",
              marginBottom: "3rem",
              color: "var(--text-color)",
              fontFamily: currentLang === "zh" ? "'Noto Sans SC', sans-serif" : "inherit",
              transition: "opacity 0.2s ease-out",
              minHeight: "1.8rem", // 高さを固定してレイアウトシフトを防ぐ
              opacity: isChanging ? 0 : 1,
            }}
          >
            {t.redDoorMessage}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "3rem",
            }}
          >
            <button
              onClick={() => changeLanguageWithFade("en")}
              onMouseEnter={() => changeLanguageWithFade("en")}
              style={{
                background: "none",
                border: "none",
                color: currentLang === "en" ? "var(--primary-color)" : "var(--link-color)",
                textDecoration: "none",
                fontSize: "1rem",
                cursor: "pointer",
                fontFamily: "'Noto Sans', sans-serif",
                fontWeight: currentLang === "en" ? "bold" : "normal",
                minWidth: "80px",
                textAlign: "center",
              }}
            >
              English
            </button>

            <span style={{ color: "var(--muted-text)", fontSize: "0.9rem", margin: "0 0.5rem" }}>|</span>

            <button
              onClick={() => changeLanguageWithFade("ja")}
              onMouseEnter={() => changeLanguageWithFade("ja")}
              style={{
                background: "none",
                border: "none",
                color: currentLang === "ja" ? "var(--primary-color)" : "var(--link-color)",
                textDecoration: "none",
                fontSize: "1rem",
                cursor: "pointer",
                fontFamily: "'Noto Sans', sans-serif",
                fontWeight: currentLang === "ja" ? "bold" : "normal",
                minWidth: "80px",
                textAlign: "center",
              }}
            >
              日本語
            </button>

            <span style={{ color: "var(--muted-text)", fontSize: "0.9rem", margin: "0 0.5rem" }}>|</span>

            <button
              onClick={() => changeLanguageWithFade("zh")}
              onMouseEnter={() => changeLanguageWithFade("zh")}
              style={{
                background: "none",
                border: "none",
                color: currentLang === "zh" ? "var(--primary-color)" : "var(--link-color)",
                textDecoration: "none",
                fontSize: "1rem",
                cursor: "pointer",
                fontFamily: "'Noto Sans', sans-serif",
                fontWeight: currentLang === "zh" ? "bold" : "normal",
                minWidth: "80px",
                textAlign: "center",
              }}
            >
              中文
            </button>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <button
              onClick={() => handleLanguageSelect(currentLang)}
              style={{
                backgroundColor: "var(--primary-color)",
                color: "#ffffff",
                border: "none",
                padding: "0.75rem 2rem",
                fontSize: "1.1rem",
                cursor: "pointer",
                fontFamily: currentLang === "zh" ? "'Noto Sans SC', sans-serif" : "inherit",
                fontWeight: "bold",
                borderRadius: "0.25rem",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.opacity = "1";
              }}
            >
              <span
                style={{
                  minWidth: "80px",
                  display: "inline-block",
                  transition: "opacity 0.2s ease-out",
                  opacity: isChanging ? 0 : 1,
                }}
              >
                {currentLang === "en" ? "Continue" : currentLang === "ja" ? "続行" : "继续"}
              </span>
            </button>
          </div>

          <div
            style={{
              fontSize: "0.9rem",
              color: "var(--muted-text)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                transition: "opacity 0.2s ease-out",
                minHeight: "1.2rem", // 高さ固定でレイアウトシフト防止
                opacity: isChanging ? 0 : 1,
              }}
            >
              {t.forMobileDevices}
            </div>
            <img
              src="https://llll-ll.com/images/qrcode.webp"
              alt="QR Code for mobile access"
              style={{
                width: "120px",
                height: "120px",
                border: "none", // 枠を完全に削除
                borderRadius: "0", // 角丸も削除
                opacity: "0.7", // 明るさを減らす
                filter: "brightness(0.8)", // さらに明度を下げる
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
