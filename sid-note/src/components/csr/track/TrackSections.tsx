"use client";

import Section from "@/components/csr/score/Section";
import { TrackType } from "@/schemas/trackSchema";
import type { ReactNode } from "react";
import { useState } from "react";

/**
 * トラックセクションコンポーネントのプロパティ
 */
interface TrackSectionsProps {
  /** セクション情報の配列 */
  sections: TrackType["sections"];
  /** スケール（調） */
  scale: string;
}

/**
 * トラックセクションコンポーネント
 * トラックの各セクションを表示し、スクロール位置を管理します
 *
 * @param {TrackSectionsProps} props - コンポーネントのプロパティ
 * @returns {ReactNode} トラックセクションコンポーネント
 */
export default function TrackSections({ sections, scale }: TrackSectionsProps): ReactNode {
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleScroll = (left: number): void => {
    setScrollLeft(left);
  };

  return (
    <div className="flex flex-col gap-4">
      {sections?.map((section, index) => (
        <div key={index} id={section.name} className="scroll-mt-16">
          <Section
            section={section}
            scale={scale}
            scrollLeft={scrollLeft}
            onScroll={handleScroll}
          />
        </div>
      ))}
    </div>
  );
}
