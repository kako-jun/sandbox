"use client";

import React from "react";
import { LegacyFretboard } from "../index";
import { NoteType } from "@/schemas/trackSchema";

/**
 * 元のLeft.tsxの完全互換代替
 * 新しい構造のLegacyFretboardを使用し、元と同じAPIを提供
 */

type LeftProps = {
  note: NoteType;
  nextNote?: NoteType | null;
  scrollLeft?: number;
  onScroll?: (left: number) => void;
};

const Left: React.FC<LeftProps> = (props) => {
  const { note, nextNote = null, scrollLeft, onScroll } = props;

  return (
    <LegacyFretboard
      note={note}
      nextNote={nextNote}
      scrollLeft={scrollLeft}
      onScroll={onScroll}
    />
  );
};

export default Left;