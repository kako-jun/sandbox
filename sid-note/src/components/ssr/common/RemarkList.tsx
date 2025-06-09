import Link from "next/link";
import type { ReactNode } from "react";

/**
 * 備考リストコンポーネントのプロパティ
 */
interface RemarkListProps {
  /** 備考の配列 */
  remarks: string[];
  /** 箇条書き点を表示するかどうか */
  showBullet?: boolean;
  /** インラインスタイル */
  style?: React.CSSProperties;
  /** 追加のCSSクラス名 */
  className?: string;
}

/**
 * 備考リストコンポーネント
 * 備考をリスト表示し、[テキスト](#リンク)形式をリンク化します
 *
 * @param {RemarkListProps} props - コンポーネントのプロパティ
 * @returns {ReactNode | null} 備考リスト、または備考がない場合はnull
 */
export default function RemarkList({ remarks, showBullet = true, style, className }: RemarkListProps): ReactNode | null {
  if (!remarks || remarks.length === 0) return null;

  return (
    <ul
      className={`pl-6 pt-2 pb-1 text-xs text-gray-500 ${showBullet ? "list-['・']" : "list-none"} ${className || ""}`}
      style={style}
    >
      {remarks.map((remark, index) => {
        if (remark === ".") {
          return <li key={index} className="list-none min-h-4 mb-1" />;
        }

        // [テキスト](#リンク) を文中に含む場合もリンク化
        const parts: (string | ReactNode)[] = [];
        let lastIndex = 0;
        const regex = /\[(.+?)\]\((#.+?)\)/g;
        let match;
        let key = 0;

        while ((match = regex.exec(remark)) !== null) {
          if (match.index > lastIndex) {
            parts.push(remark.slice(lastIndex, match.index));
          }
          parts.push(
            <Link
              key={`link-${key++}`}
              href={match[2]}
              className="text-blue-400 no-underline hover:underline"
              passHref
            >
              {match[1]}
            </Link>
          );
          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < remark.length) {
          parts.push(remark.slice(lastIndex));
        }

        return (
          <li key={index} className="mb-1">
            {parts.length > 0 ? parts : remark}
          </li>
        );
      })}
    </ul>
  );
}
