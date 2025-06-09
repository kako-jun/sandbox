import CenteredPage from "@/components/ssr/layout/CenteredPage";
import Footer from "@/components/ssr/layout/Footer";
import TitleHeader from "@/components/ssr/layout/TitleHeader";
import Setlist from "@/components/ssr/setlist/Setlist";
import { loadSetlistFromYamlUrl } from "@/utils/loader/setlistLoader";
import Image from "next/image";

export default async function Home() {
  const setlist = await loadSetlistFromYamlUrl("/track/setlist.yaml");

  return (
    <CenteredPage>
      <TitleHeader />

      <p>ベースを練習するためのノートです。</p>

      <div className="my-8">
        <Setlist setlist={setlist} />
      </div>

      <section className="mt-24 mb-6 flex justify-center items-center">
        <Image src="/how_to_use_it.png" alt="How to use it" width={140} height={20} />
      </section>
      <div>
        <p>。</p>
      </div>

      <Footer />
    </CenteredPage>
  );
}
