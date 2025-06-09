import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

/**
 * ポップアップコンポーネントのプロパティ
 */
interface PopupOnClickProps {
  /** ポップアップを表示するトリガー要素 */
  trigger: ReactNode;
  /** ポップアップの内容 */
  popup: ReactNode;
  /** ポップアップのインラインスタイル */
  popupStyle?: React.CSSProperties;
  /** ポップアップの追加のCSSクラス名 */
  popupClassName?: string;
}

/**
 * クリックで表示されるポップアップコンポーネント
 * トリガー要素をクリックするとポップアップが表示され、外側をクリックすると閉じます
 *
 * @param {PopupOnClickProps} props - コンポーネントのプロパティ
 * @returns {ReactNode} ポップアップコンポーネント
 */
export default function PopupOnClick({ trigger, popup, popupStyle, popupClassName }: PopupOnClickProps): ReactNode {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideTrigger = triggerRef.current && !triggerRef.current.contains(target);
      const isOutsidePopup = popupRef.current && !popupRef.current.contains(target);

      if (isOutsideTrigger && isOutsidePopup) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <span className="relative inline-block">
      <span
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {trigger}
      </span>
      {open && (
        <div
          ref={popupRef}
          style={popupStyle}
          className={`absolute top-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1.5 rounded text-sm z-10 whitespace-nowrap shadow-lg flex items-center gap-2 mt-1 ${
            popupClassName || ""
          }`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {popup}
        </div>
      )}
    </span>
  );
}
