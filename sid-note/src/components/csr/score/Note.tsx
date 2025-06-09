"use client";

import Keyboard from "@/components/csr/performance/Keyboard";
import Left from "@/components/csr/performance/Left";
import Right from "@/components/csr/performance/Right";
import Staff from "@/components/csr/performance/Staff";
import { RemarkList } from "@/components/ssr/common/RemarkList";
import { NoteType } from "@/schemas/trackSchema";
import { playNoteSound } from "@/utils/music/audio/player";
import { getChordPositions } from "@/utils/music/theory/chord/chordVoicing";
import { getInterval, isChromaticNote } from "@/utils/music/theory/core/intervals";
import { getValueText } from "@/utils/music/theory/core/notation";
import { comparePitch } from "@/utils/music/theory/core/notes";
import { getChordToneLabel } from "@/utils/music/theory/harmony/harmony";
import Image from "next/image";
import React from "react";

type NoteProps = {
  note: NoteType;
  noteId: number;
  nextNote: NoteType | null;
  noteCount: number;
  chord: string;
  scale: string;
  scrollLeft: number;
  onScroll: (left: number) => void;
};

const Note: React.FC<NoteProps> = ({ note, noteId, nextNote, noteCount, chord, scale, scrollLeft, onScroll }) => {
  const isChordPitch = React.useCallback(
    (pitch: string) => {
      const positions = getChordPositions(chord);
      return positions.some((pos: { pitch: string }) => comparePitch(pos.pitch, pitch));
    },
    [chord]
  );

  const [windowWidth, setWindowWidth] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // スクロールバーの中の幅を計算
  const leftWidth = React.useMemo(() => {
    if (windowWidth === 0) return 1000;
    const a = (2000 - 1200) / (1000 - 500);
    const b = 1200;
    return Math.max(1200, Math.min(2000, b + (windowWidth - 500) * a));
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
          <span>Note </span>
          {noteId}
          <span> of {noteCount}</span>
        </p>
        <div className="-mt-0.5">
          {note.tags?.map((tag, index) => (
            <span
              key={index}
              className="text-gray-500 text-xs uppercase mr-2"
              style={{
                borderBottom:
                  tag === "easy"
                    ? "2px solid rgba(0, 200, 255, 0.2)"
                    : tag === "hard"
                    ? "2px solid rgba(255, 100, 0, 0.2)"
                    : "2px solid rgba(255, 100, 255, 0.2)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2">
            <button
              className="bg-white/10 border border-gray-600 rounded text-white text-lg font-bold py-2 px-4 cursor-pointer transition-all duration-200 hover:bg-white/20 hover:border-gray-500 active:bg-white/30"
              onClick={() => playNoteSound(note.pitch, 1.5)}
            >
              {note.pitch}
            </button>
          </p>
          <p className="flex items-center gap-1 text-gray-300">
            <span className="inline-flex items-center">
              <Image
                src={`/note/${note.value}.drawio.svg`}
                alt={note.value}
                width={16}
                height={16}
                style={{ filter: "invert(1)" }}
              />
            </span>
            <span>{getValueText(note.value)}</span>
          </p>
          <p className="text-gray-400 text-sm">
            {getInterval(chord, note.pitch)}:{" "}
            {isChordPitch(note.pitch)
              ? (() => {
                  const label = getChordToneLabel(scale, chord, note.pitch);
                  return label ? (
                    <span className="text-green-400 font-bold">Chord Tone ({label})</span>
                  ) : (
                    <span className="text-green-400 font-bold">Chord Tone</span>
                  );
                })()
              : (() => {
                  const chromaticNote = nextNote && isChromaticNote(note, nextNote);
                  return chromaticNote ? <span>Nonchord Tone (Chromatic Note)</span> : <span>Nonchord Tone</span>;
                })()}
          </p>
        </div>

        <div className="mt-2 flex gap-4 items-start">
          <div className="flex-1">
            <div
              className="w-full h-80 overflow-x-auto overflow-y-hidden border border-gray-600 rounded bg-black/30"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              onScroll={(e) => onScroll((e.target as HTMLDivElement).scrollLeft)}
              ref={(el) => {
                if (el && el.scrollLeft !== scrollLeft) el.scrollLeft = scrollLeft;
                if (el) {
                  const style = document.createElement("style");
                  style.textContent = `
                    .hidden-scrollbar::-webkit-scrollbar {
                      display: none;
                    }
                  `;
                  if (!document.head.contains(style)) {
                    document.head.appendChild(style);
                  }
                  el.classList.add("hidden-scrollbar");
                }
              }}
            >
              <div style={{ height: "100%", minWidth: leftWidth }}>
                <Left note={note} nextNote={nextNote} scrollLeft={scrollLeft} onScroll={onScroll} />
              </div>
            </div>
          </div>
          <div style={{ width: `calc(${(leftWidth / 2420) * 220}px)` }}>
            <Right note={note} nextNote={nextNote} />
          </div>
        </div>

        <div className="mt-2">
          <div className="mt-2">
            <RemarkList remarks={note.remarks ?? []} showBullet={false} />
          </div>
          <div className="mt-2">
            <div>
              <Staff note={note} nextNote={nextNote} />
            </div>
            <div>
              <Keyboard note={note} nextNote={nextNote} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Note;
