"use client";

import PopupOnClick from "@/components/ssr/common/PopupOnClick";
import { playNoteSound } from "@/utils/music/audio/player";
import { getScaleNoteNames } from "@/utils/music/theory/core/scales";
import { getFunctionalHarmonyInfo } from "@/utils/music/theory/harmony/functionalHarmony";
import Image from "next/image";
import React from "react";

export type NoteNameTableProps = {
  scaleKey: string;
};

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

const NoteNameTable: React.FC<NoteNameTableProps> = ({ scaleKey }) => {
  return (
    <table className="w-full border-collapse my-4">
      <thead>
        <tr>
          <td className="w-[100px]"></td>
          {[1, 2, 3, 4, 5, 6, 7].map((degree) => {
            const functionalHarmony = degree;
            return (
              <td key={degree} className="p-2 border border-gray-300 text-center">
                <PopupOnClick
                  trigger={<span>{getFunctionalHarmonyInfo(degree).roman}</span>}
                  popup={
                    <>
                      <Image
                        src={`/functional_harmony/${functionalHarmony}.drawio.svg`}
                        alt={`${functionalHarmony}`}
                        width={16}
                        height={16}
                        style={{ filter: getFunctionalHarmonyFilter(functionalHarmony) }}
                      />
                      <span className="-ml-1">{getFunctionalHarmonyInfo(degree).desc}</span>
                    </>
                  }
                />
              </td>
            );
          })}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="bg-gray-100 font-bold p-2 border border-gray-300 text-center">Note Name</td>
          {(() => {
            const noteNames = getScaleNoteNames(scaleKey);
            let octave = 2;
            return noteNames.map((note, i) => {
              if (note.startsWith("C")) {
                octave = 3;
              }
              const noteWithOctave = `${note}${octave}`;
              return (
                <td key={i} className="p-2 border border-gray-300 text-center">
                  <button
                    className="bg-transparent border-none text-inherit font-inherit cursor-pointer px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                    onClick={() => playNoteSound(noteWithOctave, 1.5)}
                  >
                    {note}
                  </button>
                </td>
              );
            });
          })()}
        </tr>
      </tbody>
    </table>
  );
};

export default NoteNameTable;
