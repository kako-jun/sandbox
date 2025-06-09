"use client";

import Left from "@/components/csr/performance/Left";
import Note from "@/components/csr/score/Note";
import PopupOnClick from "@/components/ssr/common/PopupOnClick";
import { RemarkList } from "@/components/ssr/common/RemarkList";
import { ChordSegmentType, LeftType, NoteType } from "@/schemas/trackSchema";
import { playChord, playNoteSound } from "@/utils/music/audio/player";
import { getChordPositions } from "@/utils/music/theory/chord/chordVoicing";
import { comparePitch } from "@/utils/music/theory/core/notes";
import { getScaleDiatonicChords, getScaleText } from "@/utils/music/theory/core/scales";
import {
  getCadenceText,
  getFunctionalHarmony,
  getFunctionalHarmonyText,
  romanNumeral7thHarmonyInfo,
  romanNumeralHarmonyInfo,
} from "@/utils/music/theory/harmony/functionalHarmony";
import Image from "next/image";
import React from "react";

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

const ChordSegment: React.FC<ChordSegmentProps> = ({
  chordSegment,
  chordSegmentId,
  prevSegment,
  nextSegment,
  chordSegmentCount,
  scale,
  scrollLeft,
  onScroll,
}) => {
  const getChordNote = (chord: string) => {
    const positions = getChordPositions(chord);
    const lefts: LeftType[] = positions.map(
      (position: { pitch: string; interval: string; string: number; fret: number }) => {
        return { ...position, finger: 0, type: "chord" };
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

  const chord = React.useMemo(() => {
    return chordSegment.on && chordSegment.on !== "" ? chordSegment.on : chordSegment.chord;
  }, [chordSegment]);

  const scaleWithModulation = React.useMemo(() => {
    return chordSegment.key ? chordSegment.key : scale;
  }, [scale, chordSegment.key]);

  const isScaleChord = React.useMemo(() => {
    const chords = getScaleDiatonicChords(scaleWithModulation);
    return chords.includes(chord);
  }, [scaleWithModulation, chord]);

  const nextNote = React.useCallback(
    (index: number) => {
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

  const [windowWidth, setWindowWidth] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const leftWidth = React.useMemo(() => {
    if (windowWidth === 0) return 1000;
    const a = (2000 - 1400) / (1000 - 500);
    const b = 1400;
    return Math.max(1400, Math.min(2000, b + (windowWidth - 500) * a));
  }, [windowWidth]);

  // SSRとクライアントの不一致を防ぐため、初期値は固定し、マウント後にランダム値をセット
  const [flipX, setFlipX] = React.useState(1);
  const [flipY, setFlipY] = React.useState(1);
  const [rotate180, setRotate180] = React.useState(0);

  React.useEffect(() => {
    setFlipX(Math.random() < 0.5 ? -1 : 1);
    setFlipY(Math.random() < 0.5 ? -1 : 1);
    setRotate180(Math.random() < 0.5 ? 180 : 0);
  }, []);

  const functionalHarmony = React.useMemo(() => {
    return getFunctionalHarmony(scaleWithModulation, chord);
  }, [scaleWithModulation, chord]);

  const prevFunctionalHarmony = React.useMemo(() => {
    if (!prevSegment) {
      return 0;
    }

    const prevChord = prevSegment.on && prevSegment.on !== "" ? prevSegment.on : prevSegment.chord;
    return getFunctionalHarmony(scaleWithModulation, prevChord);
  }, [scaleWithModulation, prevSegment]);

  return (
    <section
      className="p-2 bg-gray-800 text-left relative overflow-hidden"
      style={{
        clipPath: "polygon(0% 0%, 50% 2%, 100% 0%, 100% 100%, 50% 98%, 0% 100%)",
        boxShadow: "inset 0 0 40px 1px #333333",
      }}
    >
      <Image
        src="/grunge_1.webp"
        alt="grunge texture background"
        fill
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none opacity-5 z-0"
        style={{
          transform: `scale(${flipX}, ${flipY}) rotate(${rotate180}deg)`,
        }}
        priority
      />

      <div className="mb-1 flex flex-row justify-between items-start gap-2">
        <p className="text-gray-500">
          <span className="text-gray-600 text-sm">Chord </span>
          {chordSegmentId}
          <span className="text-gray-600 text-sm"> of {chordSegmentCount}</span>
        </p>

        {chordSegment.key && (
          <p className="ml-4 mt-2 text-gray-300 text-sm">Modulation: {getScaleText(chordSegment.key)}</p>
        )}

        <p className="text-gray-400 text-sm">
          {prevSegment && (
            <span className="text-gray-300">
              {`${getFunctionalHarmonyText(prevFunctionalHarmony) || "Non-Diatonic"} → ${
                getFunctionalHarmonyText(functionalHarmony) || "Non-Diatonic"
              }`}
              {(() => {
                const cadence = getCadenceText(prevFunctionalHarmony, functionalHarmony);
                return cadence ? ` (${cadence})` : "";
              })()}
            </span>
          )}
        </p>
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <PopupOnClick
            trigger={
              <button
                className="bg-white/10 border border-gray-600 rounded text-white text-lg font-bold py-2 px-4 cursor-pointer transition-all duration-200 text-left hover:bg-white/20 hover:border-gray-500 active:bg-white/30"
                onClick={() => playChord(chord)}
              >
                {chordSegment.chord}
                {chordSegment.on && ` on ${chordSegment.on}`}
              </button>
            }
            popup={(() => {
              const chordPitches = Array.from(
                new Set(getChordPositions(chord).map((pos: { pitch: string }) => pos.pitch.replace(/\d+$/, "")))
              );
              return (
                <span>
                  {chordPitches.map((pitch, i) => (
                    <React.Fragment key={pitch}>
                      <button
                        className="bg-yellow-400/10 border border-yellow-400 rounded text-yellow-400 text-sm py-1 px-2 cursor-pointer transition-all duration-200 hover:bg-yellow-400/20 hover:text-white active:bg-yellow-400/30"
                        onClick={() => playNoteSound(pitch + "3", 1.5)}
                      >
                        {pitch}
                      </button>
                      {i < chordPitches.length - 1 && ", "}
                    </React.Fragment>
                  ))}
                </span>
              );
            })()}
          />

          {functionalHarmony > 0 && (
            <PopupOnClick
              trigger={
                <span className="flex items-center gap-1 text-gray-300 text-sm">
                  <span>: {getFunctionalHarmonyText(functionalHarmony)}</span>
                  <Image
                    src={`/functional_harmony/${functionalHarmony}.drawio.svg`}
                    alt={`${functionalHarmony}`}
                    width={16}
                    height={16}
                    style={{ filter: getFunctionalHarmonyFilter(functionalHarmony) }}
                  />
                </span>
              }
              popup={
                <span>
                  {chord.match(/7|M7|m7|dim7|aug7|sus7|add7/)
                    ? romanNumeral7thHarmonyInfo(functionalHarmony).desc
                    : romanNumeralHarmonyInfo(functionalHarmony).desc}
                </span>
              }
            />
          )}

          <p className="text-gray-500 text-sm">
            {isScaleChord ? <span className="text-gray-300">Diatonic Chord</span> : "Non-Diatonic Chord"}
          </p>
        </div>

        <div className="mt-2 flex gap-4 items-start">
          <div
            className="w-full h-80 overflow-x-auto overflow-y-hidden border border-gray-600 rounded bg-black/30"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            onScroll={(e) => onScroll((e.target as HTMLDivElement).scrollLeft)}
            ref={(el) => {
              if (el && el.scrollLeft !== scrollLeft) el.scrollLeft = scrollLeft;

              // Hide scrollbar for WebKit browsers
              if (el && !document.querySelector("#webkit-scrollbar-style-chord-segment")) {
                const style = document.createElement("style");
                style.id = "webkit-scrollbar-style-chord-segment";
                style.textContent = `
                  .chord-segment-container::-webkit-scrollbar {
                    display: none;
                  }
                `;
                document.head.appendChild(style);
              }
              if (el) {
                el.classList.add("chord-segment-container");
              }
            }}
          >
            <div
              style={{
                height: "100%",
                minWidth: 1400,
                width: leftWidth,
              }}
            >
              <Left note={getChordNote(chord)} scrollLeft={scrollLeft} onScroll={onScroll} />
            </div>
          </div>
        </div>

        <div className="mt-2">
          <RemarkList remarks={chordSegment.remarks ?? []} showBullet={false} />
        </div>

        <div className="flex flex-col gap-4">
          {chordSegment.notes.map((note, index) => (
            <Note
              key={index}
              note={note}
              noteId={index + 1}
              nextNote={nextNote(index)}
              noteCount={chordSegment.notes.length}
              chord={chord}
              scale={scaleWithModulation}
              scrollLeft={scrollLeft}
              onScroll={onScroll}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChordSegment;
