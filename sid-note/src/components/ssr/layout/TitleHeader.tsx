import Image from "next/image";
import Link from "next/link";
import React from "react";

const TitleHeader: React.FC = () => (
  <h1 className="mb-8 flex justify-center items-center">
    <Link href="/">
      <Image src="/title.png" alt="Sid Note" width={100} height={25} />
    </Link>
  </h1>
);

export default TitleHeader;
