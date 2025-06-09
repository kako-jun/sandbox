import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

/**
 * Interフォントの設定
 * アプリケーション全体で使用される基本フォント
 *
 * @see https://fonts.google.com/specimen/Inter
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * アプリケーションのメタデータ
 * SEO対策やブラウザの表示設定に使用されます
 */
export const metadata: Metadata = {
  title: "Sid Note - ベース練習ノート",
  description: "ベースの練習に役立つコード進行、スケール、フレーズなどを記録・管理できるノートアプリです。",
  keywords: ["ベース", "練習", "コード進行", "スケール", "フレーズ", "音楽理論"],
  authors: [{ name: "Sid Note Team" }],
  creator: "Sid Note Team",
  publisher: "Sid Note",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * ルートレイアウトコンポーネントのプロパティ
 */
interface RootLayoutProps {
  /** 子コンポーネント */
  children: ReactNode;
}

/**
 * ルートレイアウトコンポーネント
 * アプリケーション全体のレイアウトを定義します
 *
 * @param {RootLayoutProps} props - コンポーネントのプロパティ
 * @returns {ReactNode} ルートレイアウトコンポーネント
 */
export default function RootLayout({ children }: Readonly<RootLayoutProps>): ReactNode {
  return (
    <html lang="ja" className={inter.variable}>
      <body
        className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased"
        role="document"
      >
        {children}
      </body>
    </html>
  );
}
