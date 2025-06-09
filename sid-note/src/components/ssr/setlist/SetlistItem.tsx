import { SetlistTrackType } from "@/schemas/setlistSchema";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * セットリストアイテムコンポーネントのプロパティ
 */
interface SetlistItemProps {
  /** トラックの情報 */
  track: SetlistTrackType;
  /** 前のトラックのID（オプション） */
  prevTrackId?: number;
}

/**
 * セットリストアイテムコンポーネント
 * セットリスト内の個々のトラックを表示します
 *
 * @param {SetlistItemProps} props - コンポーネントのプロパティ
 * @returns {ReactNode} セットリストアイテムコンポーネント
 */
export default function SetlistItem({ track, prevTrackId }: SetlistItemProps): ReactNode {
  const showDot =
    prevTrackId !== undefined && Math.floor(Number(track.id) / 10) !== Math.floor(Number(prevTrackId) / 10);

  return (
    <>
      {showDot && <li className="text-gray-500" aria-hidden="true">・</li>}
      <li>
        <Link
          className="block p-3 rounded-lg hover:bg-gray-100 transition-colors hover:underline"
          href={`/tracks/${track.id}`}
          aria-label={`${track.title} by ${track.artist}`}
        >
          <span className="font-bold">{track.title}</span>
          {" / "}
          <span>{track.artist}</span>
        </Link>
      </li>
    </>
  );
}
