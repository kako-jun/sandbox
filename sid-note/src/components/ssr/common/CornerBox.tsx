import React from "react";

type CornerBoxProps = React.PropsWithChildren<{
  style?: React.CSSProperties;
  className?: string;
}>;

const CornerBox: React.FC<CornerBoxProps> = ({ children, style, className }) => (
  <div className={`relative border border-gray-500 inline-block bg-transparent ${className || ""}`} style={style}>
    {" "}
    <div
      className="absolute w-6 h-6 pointer-events-none z-10 bg-cover top-0 left-0"
      style={{
        backgroundImage: "url(/corner.webp)",
        transform: "rotate(0deg)",
        filter: "brightness(0.8)",
      }}
    />{" "}
    <div
      className="absolute w-6 h-6 pointer-events-none z-10 bg-cover top-0 right-0"
      style={{
        backgroundImage: "url(/corner.webp)",
        transform: "rotate(90deg)",
        filter: "brightness(0.8)",
      }}
    />{" "}
    <div
      className="absolute w-6 h-6 pointer-events-none z-10 bg-cover bottom-0 left-0"
      style={{
        backgroundImage: "url(/corner.webp)",
        transform: "rotate(270deg)",
        filter: "brightness(0.8)",
      }}
    />{" "}
    <div
      className="absolute w-6 h-6 pointer-events-none z-10 bg-cover bottom-0 right-0"
      style={{
        backgroundImage: "url(/corner.webp)",
        transform: "rotate(180deg)",
        filter: "brightness(0.8)",
      }}
    />
    <div className="relative z-20">{children}</div>
  </div>
);

export default CornerBox;
