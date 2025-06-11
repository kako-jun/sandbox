"use client";

import React from "react";
import { LegacyChordSegment } from "../index";
import { ChordSegmentType } from "@/schemas/trackSchema";

/**
 * 元のChordSegment.tsxの完全互換代替
 * 新しい構造のLegacyChordSegmentを使用し、元と同じAPIを提供
 */

type ChordSegmentProps = {
  chordSegment: ChordSegmentType;
  chordSegmentId: number;
  prevSegment: ChordSegmentType | null;
  nextSegment: ChordSegmentType | null;
  chordSegmentCount: number;
  scale: string;
  scrollLeft: number;
  onScroll: (left: number) => void;
};

const ChordSegment: React.FC<ChordSegmentProps> = (props) => {
  return <LegacyChordSegment {...props} />;
};

export default ChordSegment;