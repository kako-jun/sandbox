import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * タイトルヘッダーコンポーネント
 * アプリケーションのタイトルを表示し、ホームページへのリンクを提供します
 *
 * @returns {ReactNode} タイトルヘッダー
 */
export default function TitleHeader(): ReactNode {
  return (
    <h1 className="mb-8 flex justify-center items-center">
      <Link href="/" className="hover:opacity-80 transition-opacity">
        <Image
          src="/title.png"
          alt="Sid Note"
          width={100}
          height={25}
          priority
        />
      </Link>
    </h1>
  );
}
