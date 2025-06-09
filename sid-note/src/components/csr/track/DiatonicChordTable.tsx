"use client";

import PopupOnClick from "@/components/ssr/common/PopupOnClick";
import { playChord, playNoteSound } from "@/utils/music/audio/player";
import { generateScale, getDiatonicChords } from "@/utils/music/theory/core/scales";
import { romanNumeralHarmonyInfo } from "@/utils/music/theory/harmony/functionalHarmony";
import { getChordVoicing } from "@/utils/music/theory/voicing/chordVoicing";
import Image from "next/image";
import { Fragment } from "react";

/**
 * ダイアトニックコードテーブルコンポーネントのプロパティ
 */
interface DiatonicChordTableProps {
  /** スケール（調） */
  scaleKey: string;
}

/**
 * 機能和声の色フィルターを取得します
 *
 * @param {number} harmony - 機能和声の度
 * @returns {string} CSSフィルター
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
 * ダイアトニックコードテーブルコンポーネント
 * スケールのダイアトニックコードを表示します
 *
 * @param {DiatonicChordTableProps} props - コンポーネントのプロパティ
 * @returns {ReactNode} ダイアトニックコードテーブルコンポーネント
 */
export default function DiatonicChordTable({ scaleKey }: DiatonicChordTableProps) {
  const isMinor = scaleKey.endsWith("m");
  const root = isMinor ? scaleKey.slice(0, -1) : scaleKey;
  const scale = generateScale(root, isMinor ? "minor" : "major");

  return (
    <table className="w-full border-collapse my-4" role="grid">
      <thead>
        <tr>
          <td className="w-[100px]" aria-hidden="true"></td>
          {[1, 2, 3, 4, 5, 6, 7].map((degree) => {
            const functionalHarmony = degree;
            const harmonyInfo = romanNumeralHarmonyInfo(degree);
            return (
              <td key={degree} className="p-2 border border-gray-300 text-center">
                <PopupOnClick
                  trigger={<span className="font-bold text-gray-700">{harmonyInfo.roman}</span>}
                  popup={
                    <>
                      <Image
                        src={`/functional_harmony/${functionalHarmony}.drawio.svg`}
                        alt={`機能和声${functionalHarmony}`}
                        width={16}
                        height={16}
                        style={{ filter: getFunctionalHarmonyFilter(functionalHarmony) }}
                      />
                      <span className="-ml-1">{harmonyInfo.desc}</span>
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
          <td className="bg-gray-100 font-bold p-2 border border-gray-300 text-center">Diatonic Chord</td>
          {getDiatonicChords(scale).map((chord, index) => {
            const chordPitches = Array.from(
              new Set(getChordVoicing(chord, "").map((pos) => pos.pitch.replace(/\d+$/, "")))
            );
            return (
              <td key={index} className="p-2 border border-gray-300 text-center font-bold text-gray-700">
                <PopupOnClick
                  trigger={
                    <button
                      className="bg-transparent border-none text-inherit font-inherit cursor-pointer px-2 py-1 rounded transition-colors hover:bg-gray-200"
                      onClick={() => playChord(chord)}
                      aria-label={`${chord}のコードを再生`}
                    >
                      {chord}
                    </button>
                  }
                  popup={
                    <span>
                      {chordPitches.map((pitch, i) => (
                        <Fragment key={pitch}>
                          <button
                            className="bg-transparent border-none text-inherit font-inherit cursor-pointer px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                            onClick={() => playNoteSound(pitch + "3", 1.5)}
                            aria-label={`${pitch}の音を再生`}
                          >
                            {pitch}
                          </button>
                          {i < chordPitches.length - 1 && ", "}
                        </Fragment>
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
}
