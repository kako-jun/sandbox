import CenteredPage from "@/components/ssr/layout/CenteredPage";
import Footer from "@/components/ssr/layout/Footer";
import TitleHeader from "@/components/ssr/layout/TitleHeader";
import Track from "@/components/ssr/track/Track";
import { loadTrackFromYamlUrl } from "@/utils/loader/trackLoader";
import { processTrackData } from "@/utils/track/trackProcessor";
import { notFound } from "next/navigation";

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  // idはstring型で受け取る
  const id = (await params).id;
  // public配下のyamlをサーバーで読み込む
  const track = await loadTrackFromYamlUrl(`/track/track_${id}.yaml`);
  if (!track) return notFound();

  // トラックデータの処理
  const processedTrack = processTrackData(track);

  return (
    <CenteredPage>
      <TitleHeader />
      <Track track={processedTrack} />
      <Footer />
    </CenteredPage>
  );
}
