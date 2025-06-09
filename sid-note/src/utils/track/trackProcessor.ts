import { LeftType, SectionType, TrackType } from "@/schemas/trackSchema";
import { getInterval } from "@/utils/music/theory/core/intervals";

/**
 * 左手のポジション情報にインターバル情報を追加します。
 */
export function addIntervalToLefts(lefts: LeftType[], chord: string, pitch: string): LeftType[] {
  return lefts.map((left) => {
    if (left.type === "press") {
      const interval = getInterval(chord, pitch);
      return { ...left, pitch, interval };
    }
    return left;
  });
}

/**
 * セクション配列にインターバル情報を追加します。
 */
export function addIntervalsToSections(sections: SectionType[] = []): SectionType[] {
  return sections.map((section) => ({
    ...section,
    chordSegments:
      section.chordSegments?.map((chordSegment) => ({
        ...chordSegment,
        notes:
          chordSegment.notes?.map((note) => {
            const chord = chordSegment.on && chordSegment.on !== "" ? chordSegment.on : chordSegment.chord;
            return {
              ...note,
              lefts: addIntervalToLefts(note.lefts, chord, note.pitch),
            };
          }) || [],
      })) || [],
  }));
}

/**
 * トラックデータを処理し、必要な情報を追加します。
 */
export function processTrackData(track: TrackType): TrackType {
  return {
    ...track,
    sections: addIntervalsToSections(track.sections),
  };
}
