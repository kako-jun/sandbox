"use client";

import Note from "@/components/csr/score/Note";
import PopupOnClick from "@/components/ssr/common/PopupOnClick";
import RemarkList from "@/components/ssr/common/RemarkList";
import { ChordSegmentType, LeftType, NoteType } from "@/schemas/trackSchema";
import { playChord, playNoteSound } from "@/utils/music/audio/player";
import { comparePitch } from "@/utils/music/theory/core/notes";
import { getDiatonicChords, getScaleText } from "@/utils/music/theory/core/scales";
import {
  getCadenceText,
  getFunctionalHarmonyText,
  romanNumeralHarmonyInfo
} from "@/utils/music/theory/harmony/functionalHarmony";
import { getChordVoicing } from "@/utils/music/theory/voicing/chordVoicing";
import Image from "next/image";
import type { FC, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * 機能和声の色フィルターを取得します
 *
 * @param {number} harmony - 機能和声の値
 * @returns {string} CSSフィルター値
 */
const getFunctionalHarmonyFilter = (harmony: number): string => {
  const baseFilter = "invert(50%) sepia(100%) saturate(200%)";

  switch (harmony) {
    case 1:
      return `${baseFilter} hue-rotate(140deg)`;
    case 2:
      return `${baseFilter} hue-rotate(350deg)`;
    case 3:
      return `${baseFilter} hue-rotate(230deg) blur(1px)`;
    case 4:
      return `${baseFilter} hue-rotate(180deg)`;
    case 5:
      return `${baseFilter} hue-rotate(290deg)`;
    case 6:
      return `${baseFilter} hue-rotate(180deg)`;
    case 7:
      return `${baseFilter} hue-rotate(330deg)`;
    default:
      return baseFilter;
  }
};

/**
 * コードセグメントコンポーネントのプロパティ
 */
interface ChordSegmentProps {
  /** コードセグメントの情報 */
  chordSegment: ChordSegmentType;
  /** コードセグメントのID */
  chordSegmentId: number;
  /** 前のセグメント（オプション） */
  prevSegment: ChordSegmentType | null;
  /** 次のセグメント（オプション） */
  nextSegment: ChordSegmentType | null;
  /** コードセグメントの総数 */
  chordSegmentCount: number;
  /** 現在のスケール */
  scale: string;
  /** スクロール位置 */
  scrollLeft: number;
  /** スクロール時のコールバック */
  onScroll: (left: number) => void;
}

/**
 * コードセグメントコンポーネント
 * コードの表示と操作を提供します
 *
 * @param {ChordSegmentProps} props - コンポーネントのプロパティ
 * @returns {ReactNode} コードセグメントコンポーネント
 */
const ChordSegment: FC<ChordSegmentProps> = ({
  chordSegment,
  chordSegmentId,
  prevSegment,
  nextSegment,
  chordSegmentCount,
  scale,
  scrollLeft,
  onScroll,
}) => {
  /**
   * コードのノート情報を生成します
   *
   * @param {string} chord - コード名
   * @returns {NoteType} ノート情報
   */
  const getChordNote = (chord: string): NoteType => {
    const positions = getChordVoicing(chord, scale);
    const lefts: LeftType[] = positions.map(
      (position: { pitch: string; degree: number }) => {
        return { pitch: position.pitch, interval: "", string: 0, fret: 0, finger: 0, type: "chord" };
      }
    );

    // chordSegment.instrumentsからpitchに合うinstrumentを探して付与
    const instruments: { pitch: string; instrument: string }[] = chordSegment.instruments || [];
    const leftsWithInstrument = lefts.map((left) => {
      const found = instruments.find((inst) => comparePitch(inst.pitch, left.pitch ?? ""));
      return {
        ...left,
        instrument: found ? found.instrument : "",
      };
    });

    const chordNote: NoteType = {
      pitch: "",
      value: "whole",
      remarks: [],
      tags: [],
      lefts: leftsWithInstrument,
    };

    return chordNote;
  };

  const chord = useMemo(() => {
    return chordSegment.on && chordSegment.on !== "" ? chordSegment.on : chordSegment.chord;
  }, [chordSegment]);

  const scaleWithModulation = useMemo(() => {
    return chordSegment.key ? chordSegment.key : scale;
  }, [scale, chordSegment.key]);

  const isScaleChord = useMemo(() => {
    const chords = getDiatonicChords(scaleWithModulation);
    return chords.includes(chord);
  }, [scaleWithModulation, chord]);

  const prevChord = useMemo(() => {
    if (!prevSegment) return "";
    return prevSegment.on && prevSegment.on !== "" ? prevSegment.on : prevSegment.chord;
  }, [prevSegment]);

  const prevFunctionalHarmony = useMemo(() => {
    if (!prevChord) return 0;
    const chords = getDiatonicChords(scaleWithModulation);
    const index = chords.indexOf(prevChord);
    return index + 1;
  }, [scaleWithModulation, prevChord]);

  const functionalHarmony = useMemo(() => {
    if (!isScaleChord) return 0;
    const chords = getDiatonicChords(scaleWithModulation);
    const index = chords.indexOf(chord);
    return index + 1;
  }, [isScaleChord, scaleWithModulation, chord]);

  const functionalHarmonyInfo = useMemo(() => {
    if (!functionalHarmony) return { roman: "", desc: "" };
    return romanNumeralHarmonyInfo(functionalHarmony);
  }, [functionalHarmony]);

  const cadenceText = useMemo(() => {
    if (!functionalHarmony || !prevFunctionalHarmony) return "";
    return getCadenceText(prevFunctionalHarmony, functionalHarmony);
  }, [functionalHarmony, prevFunctionalHarmony]);

  const scaleText = useMemo(() => {
    return getScaleText(scaleWithModulation);
  }, [scaleWithModulation]);

  const functionalHarmonyText = useMemo(() => {
    if (!functionalHarmony) return "";
    return getFunctionalHarmonyText(functionalHarmony);
  }, [functionalHarmony]);

  const nextNote = useCallback(
    (index: number): NoteType | null => {
      if (index + 1 < chordSegment.notes.length) {
        return chordSegment.notes[index + 1];
      }

      if (nextSegment && nextSegment.notes.length > 0) {
        return nextSegment.notes[0];
      }

      return null;
    },
    [chordSegment, nextSegment]
  );

  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = () => {
    playChord(chord);
  };

  const handleNoteClick = (pitch: string) => {
    playNoteSound(pitch, 1.5);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg bg-white shadow-sm"
      style={{
        minWidth: "200px",
        maxWidth: "100%",
        margin: "0 8px",
      }}
    >
      <div className="flex items-center justify-center mb-2">
        <button
          className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
          onClick={handleClick}
          aria-label={`${chord}のコードを再生`}
        >
          {chord}
        </button>
        {functionalHarmony > 0 && (
          <PopupOnClick
            trigger={
              <span className="ml-2 text-sm text-gray-600">
                {functionalHarmonyInfo.roman}
              </span>
            }
            popup={
              <>
                <Image
                  src={`/functional_harmony/${functionalHarmony}.drawio.svg`}
                  alt={`機能和声${functionalHarmony}`}
                  width={16}
                  height={16}
                  style={{ filter: getFunctionalHarmonyFilter(functionalHarmony) }}
                />
                <span className="-ml-1">{functionalHarmonyInfo.desc}</span>
              </>
            }
          />
        )}
      </div>

      {cadenceText && (
        <div className="text-sm text-gray-600 mb-2">
          {cadenceText}
        </div>
      )}

      {scaleText && (
        <div className="text-sm text-gray-600 mb-2">
          {scaleText}
        </div>
      )}

      {functionalHarmonyText && (
        <div className="text-sm text-gray-600 mb-2">
          {functionalHarmonyText}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {chordSegment.notes.map((note, index) => (
          <Note
            key={index}
            note={note}
            noteId={index + 1}
            noteCount={chordSegment.notes.length}
            chord={chord}
            scale={scaleWithModulation}
            nextNote={nextNote(index)}
            scrollLeft={scrollLeft}
            onScroll={onScroll}
          />
        ))}
      </div>

      {chordSegment.remarks && chordSegment.remarks.length > 0 && (
        <div className="mt-2">
          <RemarkList remarks={chordSegment.remarks} />
        </div>
      )}
    </div>
  );
};

export default ChordSegment;
