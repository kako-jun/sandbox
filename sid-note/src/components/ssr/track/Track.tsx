import CircleOfFifths from "@/components/csr/track/CircleOfFifths";
import DiatonicChord7thTable from "@/components/csr/track/DiatonicChord7thTable";
import DiatonicChordTable from "@/components/csr/track/DiatonicChordTable";
import NoteNameTable from "@/components/csr/track/NoteNameTable";
import TrackSections from "@/components/csr/track/TrackSections";
import CornerBox from "@/components/ssr/common/CornerBox";
import { RemarkList } from "@/components/ssr/common/RemarkList";
import TrackSectionItem from "@/components/ssr/track/TrackSectionItem";
import { TrackType } from "@/schemas/trackSchema";
import { getScaleText } from "@/utils/music/theory/core/scales";
import Image from "next/image";
import React from "react";

// TrackPropsをtrack: TrackTypeに変更
export type TrackProps = {
  track: TrackType;
};

const Track: React.FC<TrackProps> = ({ track }) => {
  if (!track || track.title === "") {
    return <section className="text-center p-4">Loading ...</section>;
  }
  return (
    <section className="space-y-4">
      {/* Title */}
      <p className="text-xl italic">{track.title}</p> {/* Cover Image */}{" "}
      <div className="mt-2 mb-4 flex justify-center items-center">
        {track.cover && (
          <div className="relative inline-block w-80 h-25">
            <Image
              src={`/track/${track.cover}`}
              alt="cover"
              width={320}
              height={100}
              priority
              className="w-80 h-25 object-cover grayscale"
            />
            <Image
              src="/grunge_1.webp"
              alt="grunge texture"
              width={320}
              height={100}
              priority
              className="absolute top-0 left-0 w-80 h-25 pointer-events-none"
              style={{
                mixBlendMode: "multiply",
                opacity: 0.3,
              }}
            />
          </div>
        )}
      </div>
      {/* Metadata: Artist, Album, Year */}
      <div className="mx-[10%] flex justify-between items-start gap-2 text-sm">
        <p className="flex-1 text-left leading-none">{track.artist}</p>
        <p className="flex-1 text-center leading-none">{track.album}</p>
        <p className="flex-1 text-right leading-none">{track.year || ""}</p>
      </div>
      {/* Details: Time Signature, BPM */}
      <div className="mt-4 mx-[10%] flex justify-between items-start gap-2">
        <p className="flex-1 text-left leading-none">
          {track.timeSignature} <span className="text-gray-500">time</span>
        </p>
        <p className="flex-1 text-right leading-none">
          {track.bpm} <span className="text-gray-500">BPM</span>
        </p>
      </div>
      {/* Music Theory Section */}
      {track.key && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <CircleOfFifths scale={track.key} />
          </div>
          <p className="text-center text-sm">{getScaleText(track.key)}</p>
          <div>
            <NoteNameTable scaleKey={track.key} />
            <DiatonicChordTable scaleKey={track.key} />
            <DiatonicChord7thTable scaleKey={track.key} />
          </div>
        </div>
      )}
      {/* Remarks */}
      <div className="text-left">
        <RemarkList remarks={track.remarks ?? []} showBullet={false} />
      </div>{" "}
      {/* Track Sections */}
      <CornerBox className="flex flex-col gap-2">
        <ul>
          {track.sections?.map((section, index) => (
            <TrackSectionItem key={index} section={section} />
          ))}
        </ul>
      </CornerBox>
      {/* Interactive Sections */}
      <TrackSections sections={track.sections} scale={track.key} />
    </section>
  );
};

export default Track;
