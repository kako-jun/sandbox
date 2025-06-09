import Link from "next/link";
import type { ReactNode } from "react";

/**
 * トラックセクションのプロパティ
 */
interface TrackSection {
  /** セクション名 */
  name: string;
}

/**
 * トラックセクションアイテムのプロパティ
 */
interface TrackSectionItemProps {
  /** セクション情報 */
  section: TrackSection;
}

/**
 * トラックセクションアイテムコンポーネント
 * セクションへのリンクを表示します
 *
 * @param {TrackSectionItemProps} props - コンポーネントのプロパティ
 * @returns {ReactNode} トラックセクションアイテム
 */
export default function TrackSectionItem({ section }: TrackSectionItemProps): ReactNode {
  return (
    <li className="py-1">
      <Link
        href={`#${section.name}`}
        className="hover:underline transition-colors duration-200"
        aria-label={`${section.name}セクションへ移動`}
      >
        {section.name}
      </Link>
    </li>
  );
}
