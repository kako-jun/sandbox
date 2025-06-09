import CenteredPage from "@/components/ssr/layout/CenteredPage";
import Footer from "@/components/ssr/layout/Footer";
import TitleHeader from "@/components/ssr/layout/TitleHeader";
import Setlist from "@/components/ssr/setlist/Setlist";
import { loadSetlistFromYamlUrl } from "@/utils/loader/setlistLoader";
import Image from "next/image";
import type { ReactNode } from "react";

/**
 * ホームページのメインコンポーネント
 * アプリケーションのトップページを表示します
 *
 * @returns {Promise<ReactNode>} ホームページのコンポーネント
 */
export default async function Home(): Promise<ReactNode> {
  const setlist = await loadSetlistFromYamlUrl("/track/setlist.yaml");

  return (
    <CenteredPage>
      <TitleHeader />

      <div className="prose prose-lg max-w-none text-center mb-8">
        <p className="text-gray-700 dark:text-gray-300">
          ベースを練習するためのノートです。
          <br />
          コード進行やスケール、フレーズなどを記録・管理できます。
        </p>
      </div>

      <div className="my-8">
        <Setlist setlist={setlist} />
      </div>

      <section className="mt-24 mb-6 flex flex-col items-center gap-4" aria-labelledby="usage-title">
        <h2 id="usage-title" className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          使い方
        </h2>
        <Image
          src="/how_to_use_it.png"
          alt="アプリケーションの使い方を説明する画像"
          width={140}
          height={20}
          className="rounded-lg shadow-md"
          priority
        />
      </section>

      <Footer />
    </CenteredPage>
  );
}
