"use client";

import Section from "@/components/csr/score/Section";
import { TrackType } from "@/schemas/trackSchema";
import React from "react";

export type TrackSectionsProps = {
  sections: TrackType["sections"];
  scale: string;
};

const TrackSections: React.FC<TrackSectionsProps> = ({ sections, scale }) => {
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const handleScroll = (left: number) => {
    setScrollLeft(left);
  };
  return (
    <div className="flex flex-col gap-4">
      {sections?.map((section, index) => (
        <div key={index} id={section.name}>
          <Section section={section} scale={scale} scrollLeft={scrollLeft} onScroll={handleScroll} />
        </div>
      ))}
    </div>
  );
};

export default TrackSections;
