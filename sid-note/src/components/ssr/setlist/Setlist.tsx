import CornerBox from "@/components/ssr/common/CornerBox";
import SetlistItem from "@/components/ssr/setlist/SetlistItem";
import { SetlistType } from "@/schemas/setlistSchema";
import React from "react";

export type SetlistProps = {
  setlist: SetlistType;
};

const Setlist: React.FC<SetlistProps> = ({ setlist }) => {
  if (setlist.tracks.length === 0) {
    return <>Loading ...</>;
  }
  return (
    <section>
      <h2 className="mb-4">Setlist</h2>
      <CornerBox>
        <ul className="flex flex-col gap-2">
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
};

export default Setlist;
