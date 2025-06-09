"use client";

import ChordSegment from "@/components/csr/score/ChordSegment";
import { SectionType } from "@/schemas/trackSchema";
import { getScaleText } from "@/utils/music/theory/core/scales";
import Image from "next/image";
import React from "react";

type SectionProps = {
  section: SectionType;
  scale: string;
  scrollLeft: number;
  onScroll: (left: number) => void;
};

const Section: React.FC<SectionProps> = ({ section, scale, scrollLeft, onScroll }) => {
  const scaleWithModulation = React.useMemo(() => {
    return section.key ? section.key : scale;
  }, [scale, section.key]);

  // SSRとクライアントの不一致を防ぐため、初期値は固定し、マウント後にランダム値をセット
  const [flipX, setFlipX] = React.useState(1);
  const [flipY, setFlipY] = React.useState(1);
  const [rotate180, setRotate180] = React.useState(0);

  React.useEffect(() => {
    setFlipX(Math.random() < 0.5 ? -1 : 1);
    setFlipY(Math.random() < 0.5 ? -1 : 1);
    setRotate180(Math.random() < 0.5 ? 180 : 0);
  }, []);

  return (
    <section
      className="bg-black text-left pt-2 border-t border-b border-gray-700 relative overflow-hidden"
      style={{
        boxShadow: "inset 0 0 40px 1px #333333",
        borderImage: "linear-gradient(to right, #333 0%, rgba(255, 255, 255, 0.15) 50%, #333 100%) 1",
      }}
    >
      <Image
        src="/grunge_1.webp"
        alt="grunge texture background"
        fill
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none opacity-20 z-0"
        style={{
          transform: `scale(${flipX}, ${flipY}) rotate(${rotate180}deg)`,
        }}
        priority
      />
      <p className="ml-2 text-gray-300 text-base border border-gray-600 inline-block py-1 px-2">{section.name}</p>
      {section.key && (
        <p className="ml-4 mt-2">
          <span>Modulation: {getScaleText(section.key)}</span>
        </p>
      )}
      <div className="mx-2 mt-2 mb-4 flex flex-col justify-center gap-8">
        {section.chordSegments.map((chordSegment, index) => {
          return (
            <ChordSegment
              key={index}
              chordSegment={chordSegment}
              chordSegmentId={index + 1}
              prevSegment={section.chordSegments[index - 1] || null}
              nextSegment={section.chordSegments[index + 1] || null}
              chordSegmentCount={section.chordSegments.length}
              scale={scaleWithModulation}
              scrollLeft={scrollLeft}
              onScroll={onScroll}
            />
          );
        })}
      </div>
    </section>
  );
};

export default Section;
