import CornerBox from "@/components/ssr/common/CornerBox";
import SetlistItem from "@/components/ssr/setlist/SetlistItem";
import { SetlistType } from "@/schemas/setlistSchema";
import type { ReactNode } from "react";

/**
 * セットリストコンポーネントのプロパティ
 */
interface SetlistProps {
  /** セットリスト情報 */
  setlist: SetlistType;
}

/**
 * セットリストコンポーネント
 * トラックのリストを表示します
 *
 * @param {SetlistProps} props - コンポーネントのプロパティ
 * @returns {ReactNode} セットリストコンポーネント
 */
export default function Setlist({ setlist }: SetlistProps): ReactNode {
  if (setlist.tracks.length === 0) {
    return (
      <section role="status" aria-label="読み込み中">
        Loading ...
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">Setlist</h2>
      <CornerBox>
        <ul className="flex flex-col gap-2" role="list">
          {setlist.tracks.map((track, index) => (
            <SetlistItem
              key={track.id}
              track={track}
              prevTrackId={index > 0 ? setlist.tracks[index - 1].id : undefined}
            />
          ))}
        </ul>
      </CornerBox>
    </section>
  );
}
