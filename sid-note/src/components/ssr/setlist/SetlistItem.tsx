import { SetlistTrackType } from "@/schemas/setlistSchema";
import Link from "next/link";
import React from "react";

type SetlistItemProps = {
  track: SetlistTrackType;
  prevTrackId?: number;
};

const SetlistItem: React.FC<SetlistItemProps> = ({ track, prevTrackId }) => {
  const showDot =
    prevTrackId !== undefined && Math.floor(Number(track.id) / 10) !== Math.floor(Number(prevTrackId) / 10);
  return (
    <>
      {showDot && <li>・</li>}
      <li>
        <Link
          className="block p-3 rounded-lg hover:bg-gray-100 transition-colors hover:underline"
          href={`/tracks/${track.id}`}
        >
          <span className="font-bold">{track.title}</span>
          {" / "}
          <span>{track.artist}</span>
        </Link>
      </li>
    </>
  );
};

export default SetlistItem;
