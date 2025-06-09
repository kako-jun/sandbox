import React, { useEffect, useRef, useState } from "react";

type PopupOnClickProps = {
  trigger: React.ReactNode;
  popup: React.ReactNode;
  popupStyle?: React.CSSProperties;
  popupClassName?: string;
};

const PopupOnClick: React.FC<PopupOnClickProps> = ({ trigger, popup, popupStyle, popupClassName }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
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
        >
          {popup}
        </div>
      )}
    </span>
  );
};

export default PopupOnClick;
