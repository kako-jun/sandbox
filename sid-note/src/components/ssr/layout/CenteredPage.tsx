import Image from "next/image";
import React from "react";

const CenteredPage: React.FC<React.PropsWithChildren> = ({ children }) => (
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

export default CenteredPage;
