import Link from "next/link";
import React from "react";

export type TrackSectionItemProps = {
  section: { name: string };
};

const TrackSectionItem: React.FC<TrackSectionItemProps> = ({ section }) => (
  <li className="py-1">
    <Link className="hover:underline" href={`#${section.name}`}>
      {section.name}
    </Link>
  </li>
);

export default TrackSectionItem;
