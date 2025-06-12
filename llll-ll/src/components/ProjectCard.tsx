"use client";

import { useState } from "react";
import { Product, Language } from "@/types";
import { useTranslation } from "@/lib/i18n";

interface ProjectCardProps {
  product: Product;
  language: Language;
  onSelect?: (product: Product) => void;
}

export default function ProjectCard({ product, language, onSelect }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslation(language);

  return (
    <div
      style={{
        backgroundColor: "var(--background-color)",
        border: "1px solid var(--border-color)",
        padding: "1rem",
        cursor: "pointer",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect?.(product)}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "var(--hover-background)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "var(--background-color)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "1rem",
        }}
      >
        {product.images.length > 0 && (
          <div
            style={{
              width: "80px",
              height: "80px",
              flexShrink: 0,
              overflow: "hidden",
              border: "1px solid var(--border-color)",
            }}
          >
            <img
              src={product.images[0]}
              alt={product.title[language]}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              loading="lazy"
            />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
              color: "var(--primary-color)",
            }}
          >
            {product.title[language]}
          </h3>

          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-color)",
              marginBottom: "0.5rem",
              lineHeight: "1.4",
            }}
          >
            {product.description[language]}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "0.75rem",
                  padding: "0.2rem 0.5rem",
                  backgroundColor: "var(--input-background)",
                  color: "var(--text-color)",
                  border: "1px solid var(--border-color)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {product.demoUrl && (
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--link-color)",
                  textDecoration: "underline",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {t.viewDemo}
              </a>
            )}
            {product.repositoryUrl && (
              <a
                href={product.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--link-color)",
                  textDecoration: "underline",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {t.viewCode}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
