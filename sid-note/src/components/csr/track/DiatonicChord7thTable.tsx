"use client";

import PopupOnClick from "@/components/ssr/common/PopupOnClick";
import { playChord, playNoteSound } from "@/utils/music/audio/player";
import { getChordPositions } from "@/utils/music/theory/chord/chordVoicing";
import { getScaleDiatonicChordsWith7th } from "@/utils/music/theory/core/scales";
import { romanNumeral7thHarmonyInfo } from "@/utils/music/theory/harmony/functionalHarmony";
import Image from "next/image";
import React from "react";

export type DiatonicChord7thTableProps = {
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

const DiatonicChord7thTable: React.FC<DiatonicChord7thTableProps> = ({ scaleKey }) => {
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
                  trigger={<span className="font-bold text-gray-700">{romanNumeral7thHarmonyInfo(degree).roman}</span>}
                  popup={
                    <>
                      <Image
                        src={`/functional_harmony/${functionalHarmony}.drawio.svg`}
                        alt={`${functionalHarmony}`}
                        width={16}
                        height={16}
                        style={{ filter: getFunctionalHarmonyFilter(functionalHarmony) }}
                      />
                      <span className="-ml-1">{romanNumeral7thHarmonyInfo(degree).desc}</span>
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
          <td className="bg-gray-100 font-bold p-2 border border-gray-300 text-center">Diatonic 7th Chord</td>
          {getScaleDiatonicChordsWith7th(scaleKey).map((chord, index) => {
            const chordPitches = Array.from(
              new Set(getChordPositions(chord).map((pos) => pos.pitch.replace(/\d+$/, "")))
            );
            return (
              <td key={index} className="p-2 border border-gray-300 text-center font-bold text-gray-700">
                <PopupOnClick
                  trigger={
                    <button
                      className="bg-transparent border-none text-inherit font-inherit cursor-pointer px-2 py-1 rounded transition-colors hover:bg-gray-200"
                      onClick={() => playChord(chord)}
                    >
                      {chord}
                    </button>
                  }
                  popup={
                    <span>
                      {chordPitches.map((pitch, i) => (
                        <React.Fragment key={pitch}>
                          <button
                            className="bg-transparent border-none text-inherit font-inherit cursor-pointer px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                            onClick={() => playNoteSound(pitch + "3", 1.5)}
                          >
                            {pitch}
                          </button>
                          {i < chordPitches.length - 1 && ", "}
                        </React.Fragment>
                      ))}
                    </span>
                  }
                />
              </td>
            );
          })}
        </tr>
      </tbody>
    </table>
  );
};

export default DiatonicChord7thTable;
