import type { ReactNode } from "react";

/**
 * コーナーボックスのプロパティ
 */
interface CornerBoxProps {
  /** 子コンポーネント */
  children: ReactNode;
  /** インラインスタイル */
  style?: React.CSSProperties;
  /** 追加のCSSクラス名 */
  className?: string;
}

/**
 * コーナーボックスコンポーネント
 * 四隅に装飾的なコーナーを持つボックスを表示します
 *
 * @param {CornerBoxProps} props - コンポーネントのプロパティ
 * @returns {ReactNode} コーナーボックス
 */
export default function CornerBox({ children, style, className }: CornerBoxProps): ReactNode {
  const cornerStyle = {
    backgroundImage: "url(/corner.webp)",
    filter: "brightness(0.8)",
  };

  return (
    <div className={`relative border border-gray-500 inline-block bg-transparent ${className || ""}`} style={style}>
      <div
        className="absolute w-6 h-6 pointer-events-none z-10 bg-cover top-0 left-0"
        style={{ ...cornerStyle, transform: "rotate(0deg)" }}
        aria-hidden="true"
      />
      <div
        className="absolute w-6 h-6 pointer-events-none z-10 bg-cover top-0 right-0"
        style={{ ...cornerStyle, transform: "rotate(90deg)" }}
        aria-hidden="true"
      />
      <div
        className="absolute w-6 h-6 pointer-events-none z-10 bg-cover bottom-0 left-0"
        style={{ ...cornerStyle, transform: "rotate(270deg)" }}
        aria-hidden="true"
      />
      <div
        className="absolute w-6 h-6 pointer-events-none z-10 bg-cover bottom-0 right-0"
        style={{ ...cornerStyle, transform: "rotate(180deg)" }}
        aria-hidden="true"
      />
      <div className="relative z-20">{children}</div>
    </div>
  );
}
