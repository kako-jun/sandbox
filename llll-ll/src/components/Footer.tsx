"use client";

import Image from "next/image";

interface FooterProps {}

export default function Footer({}: FooterProps) {
  const socialLinks = [
    { name: "GitHub", url: "https://github.com/kako-jun", icon: "/icons/github.svg", size: 20 },
    { name: "X", url: "https://x.com/kako_jun", icon: "/icons/x-twitter.svg", size: 20 },
    { name: "Instagram", url: "https://instagram.com/kako_jun", icon: "/icons/instagram.svg", size: 20 },
    { name: "Zenn", url: "https://zenn.dev/kako_jun", icon: "/icons/zenn.svg", size: 20 },
    { name: "Note", url: "https://note.com/kako_jun", icon: "/icons/note.svg", size: 24 }, // noteだけ大きく
  ];

  return (
    <footer
      style={{
        backgroundColor: "var(--background-color)",
        borderTop: "1px solid var(--border-color)",
        marginTop: "3rem",
        padding: "2rem 0",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <span style={{ color: "var(--muted-text)", fontSize: "0.9rem" }}>© kako-jun</span>

          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                textDecoration: "none",
                color: "var(--text-color)",
                transition: "all 0.2s ease",
                borderRadius: "4px",
              }}
              title={link.name}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.backgroundColor = "var(--hover-color, rgba(0,0,0,0.1))";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Image
                src={link.icon}
                alt={link.name}
                width={link.size}
                height={link.size}
                style={{
                  filter: "var(--icon-filter, none)",
                }}
              />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
