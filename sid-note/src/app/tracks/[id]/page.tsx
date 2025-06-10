import CenteredPage from "@/components/ssr/layout/CenteredPage";
import Footer from "@/components/ssr/layout/Footer";
import TitleHeader from "@/components/ssr/layout/TitleHeader";
import Track from "@/components/ssr/track/Track";
import { loadTrackFromYamlUrl } from "@/utils/loader/trackLoader";
import { processTrackData } from "@/utils/track/trackProcessor";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

/**
 * トラックページのメタデータを生成するためのパラメータ
 */
interface GenerateMetadataParams {
  /** ルートパラメータ */
  params: Promise<{
    /** トラックID */
    id: string;
  }>;
}

/**
 * トラックページのメタデータを生成
 * SEO対策やブラウザの表示設定に使用されます
 *
 * @param {GenerateMetadataParams} props - コンポーネントのプロパティ
 * @returns {Promise<Metadata>} メタデータ
 */
export async function generateMetadata({ params }: GenerateMetadataParams): Promise<Metadata> {
  const { id } = await params;
  const track = await loadTrackFromYamlUrl(`/track/track_${id}.yaml`);
  if (!track) {
    return {
      title: "トラックが見つかりません | Sid Note",
      description: "指定されたトラックが見つかりませんでした。",
    };
  }

  return {
    title: `${track.title} | Sid Note`,
    description: `${track.title}のコード進行、スケール、フレーズなどを確認できます。`,
    openGraph: {
      title: `${track.title} | Sid Note`,
      description: `${track.title}のコード進行、スケール、フレーズなどを確認できます。`,
      type: "article",
    },
  };
}

/**
 * トラックページのメインコンポーネントのプロパティ
 */
interface TrackPageProps {
  /** ルートパラメータ */
  params: Promise<{
    /** トラックID */
    id: string;
  }>;
}

/**
 * トラックページのメインコンポーネント
 * 特定のトラックの詳細情報を表示します
 *
 * @param {TrackPageProps} props - コンポーネントのプロパティ
 * @returns {Promise<ReactNode>} トラックページのコンポーネント
 */
export default async function TrackPage({ params }: TrackPageProps): Promise<ReactNode> {
  const { id } = await params;
  const track = await loadTrackFromYamlUrl(`/track/track_${id}.yaml`);
  if (!track) return notFound();

  const processedTrack = processTrackData(track);

  return (
    <CenteredPage>
      <TitleHeader />
      <main className="w-full max-w-4xl mx-auto px-4 py-8" role="main">
        <Track track={processedTrack} />
      </main>
      <Footer />
    </CenteredPage>
  );
}
