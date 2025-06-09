import Link from "next/link";
import React, { ReactNode } from "react";

/**
 * remarksをリスト表示し、[テキスト](#リンク)形式をリンク化する共通コンポーネント。
 * showBullet=falseで箇条書き点を非表示（Track用）
 */
export const RemarkList: React.FC<{
  remarks: string[];
  showBullet?: boolean;
  style?: React.CSSProperties;
  className?: string;
}> = ({ remarks, showBullet = true, style, className }) => {
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
            <Link key={"link-" + key++} href={match[2]} className="text-blue-400 no-underline hover:underline" passHref>
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
};
