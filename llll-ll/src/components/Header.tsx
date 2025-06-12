"use client";

import { Language } from "@/types";

interface HeaderProps {
  language: Language;
}

export default function Header({ language }: HeaderProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "var(--bg-primary)",
        borderBottom: "1px solid var(--border-color)",
        padding: "0.5rem 0",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              color: "var(--text-accent)",
              margin: 0,
            }}
          >
            llll-ll
          </h1>
        </div>
      </div>
    </header>
  );
}
