import Image from "next/image";
import type { ReactNode } from "react";

/**
 * 中央寄せのページレイアウトコンポーネント
 * 背景にテクスチャ画像を配置し、コンテンツを中央寄せで表示します
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {ReactNode} props.children - 子コンポーネント
 * @returns {ReactNode} 中央寄せのページレイアウト
 */
export default function CenteredPage({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className="text-center pt-4 relative overflow-hidden font-serif">
      <Image
        src="/grunge_2.webp"
        alt="grunge texture"
        width={200}
        height={140}
        className="absolute top-0 right-0 object-cover pointer-events-none opacity-70 -z-10"
        priority
      />
      {children}
    </div>
  );
}
