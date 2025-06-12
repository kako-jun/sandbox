"use client";

import { useState, useEffect } from "react";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // ユーザーのOS設定を確認
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // ローカルストレージから設定を取得、なければOS設定を使用
    const savedTheme = localStorage.getItem("theme") as Theme;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    updateDocumentTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    updateDocumentTheme(newTheme);
  };
  const updateDocumentTheme = (newTheme: Theme) => {
    document.documentElement.setAttribute("data-theme", newTheme);
    // html要素の背景色も即座に更新
    document.documentElement.style.background = newTheme === "dark" ? "#121212" : "#ffffff";
    document.documentElement.style.color = newTheme === "dark" ? "#ffffff" : "#000000";
  };

  return { theme, toggleTheme };
}
