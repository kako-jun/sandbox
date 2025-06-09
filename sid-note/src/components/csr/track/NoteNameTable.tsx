"use client";

import PopupOnClick from "@/components/ssr/common/PopupOnClick";
import { playNoteSound } from "@/utils/music/audio/player";
import { getScaleNoteNames } from "@/utils/music/theory/core/scales";
import { getFunctionalHarmonyInfo } from "@/utils/music/theory/harmony/functionalHarmony";
import Image from "next/image";
import type { ReactNode } from "react";

/**
 * 音名テーブルコンポーネントのプロパティ
 */
interface NoteNameTableProps {
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
 * 音名テーブルコンポーネント
 * スケールの音名と機能和声を表示します
 *
 * @param {NoteNameTableProps} props - コンポーネントのプロパティ
 * @returns {ReactNode} 音名テーブルコンポーネント
 */
export default function NoteNameTable({ scaleKey }: NoteNameTableProps): ReactNode {
  return (
    <table className="w-full border-collapse my-4" role="grid">
      <thead>
        <tr>
          <td className="w-[100px]" aria-hidden="true"></td>
          {[1, 2, 3, 4, 5, 6, 7].map((degree) => {
            const harmonyInfo = getFunctionalHarmonyInfo(scaleKey, degree);
            return (
              <td key={degree} className="p-2 border border-gray-300 text-center">
                <PopupOnClick
                  trigger={<span>{harmonyInfo.roman}</span>}
                  popup={
                    <>
                      <Image
                        src={`/functional_harmony/${degree}.drawio.svg`}
                        alt={`機能和声${degree}`}
                        width={16}
                        height={16}
                        style={{ filter: getFunctionalHarmonyFilter(degree) }}
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
          <td className="bg-gray-100 font-bold p-2 border border-gray-300 text-center">Note Name</td>
          {(() => {
            const noteNames = getScaleNoteNames(scaleKey);
            let octave = 2;
            return noteNames.map((note: string, i: number) => {
              if (note.startsWith("C")) {
                octave = 3;
              }
              const noteWithOctave = `${note}${octave}`;
              return (
                <td key={i} className="p-2 border border-gray-300 text-center">
                  <button
                    className="bg-transparent border-none text-inherit font-inherit cursor-pointer px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                    onClick={() => playNoteSound(noteWithOctave, 1.5)}
                    aria-label={`${note}の音を再生`}
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
}
