"use client";

import { useState, useEffect, useMemo } from "react";
import { Product, Language } from "@/types";
import { useTranslation } from "@/lib/i18n";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import ArrowIcon from "./ArrowIcon";

interface ProjectListProps {
  products: Product[];
  language: Language;
}

export default function ProjectList({ products, language }: ProjectListProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(18); // 12から18に増加

  const t = useTranslation(language);

  // 全タグを抽出
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    products.forEach((product) => {
      product.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => product.tags.includes(tag));

      return matchesSearch && matchesTags;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [products, language, searchTerm, selectedTags, sortOrder]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 18); // 12から18に増加
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1500) {
        // 1000から1500に増加してより早く読み込み
        if (visibleCount < filteredProducts.length) {
          loadMore();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleCount, filteredProducts.length]);

  return (
    <section style={{ padding: "2rem 0" }}>
      <div className="container">
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: "bold",
            marginBottom: "2rem",
            textAlign: "center",
            color: "var(--primary-color)",
          }}
        >
          {t.projectsTitle}
        </h2>

        {/* 検索・フィルター・ソートエリア */}
        <div style={{ marginBottom: "2rem" }}>
          {/* 検索ボックス */}
          <div style={{ maxWidth: "400px", margin: "0 auto 1.5rem", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "1rem",
                color: "var(--muted-text)",
                pointerEvents: "none",
              }}
            >
              🔍
            </div>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.5rem",
                backgroundColor: "var(--input-background)",
                color: "var(--text-color)",
                border: "1px solid var(--border-color)",
                borderRadius: "4px", // 角ばった見た目に
                fontSize: "0.9rem",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* タグクラウド */}
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                justifyContent: "center",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              {selectedTags.length > 0 && (
                <button
                  onClick={clearAllTags}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--link-color)",
                    textDecoration: "underline",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    padding: "0.25rem 0.5rem",
                  }}
                >
                  {t.clearFilters}
                </button>
              )}
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    background: selectedTags.includes(tag) ? "var(--primary-color)" : "var(--input-background)",
                    color: selectedTags.includes(tag) ? "#ffffff" : "var(--muted-text)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "4px", // 1remから4pxに変更してより角ばった見た目に
                    padding: "0.25rem 0.75rem",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (!selectedTags.includes(tag)) {
                      e.currentTarget.style.backgroundColor = "var(--hover-background)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!selectedTags.includes(tag)) {
                      e.currentTarget.style.backgroundColor = "var(--input-background)";
                    }
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ソートスイッチ */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <button
              onClick={() => {
                // 新しい順の時のみ古い順に切り替え
                if (sortOrder === "newest") {
                  setSortOrder("oldest");
                }
              }}
              style={{
                background: "none",
                border: "none",
                fontSize: "0.9rem",
                color: sortOrder === "oldest" ? "var(--primary-color)" : "var(--muted-text)",
                cursor: sortOrder === "newest" ? "pointer" : "default",
                fontFamily: "inherit",
                fontWeight: sortOrder === "oldest" ? "bold" : "normal",
                padding: "0.25rem 0.5rem",
                opacity: sortOrder === "newest" ? 1 : 0.7,
                minWidth: "120px", // 90pxから120pxに拡大して英語の長いテキストに対応
                textAlign: "center", // 中央揃え
              }}
            >
              {t.sortOldest}
            </button>
            <div
              style={{
                position: "relative",
                width: "60px",
                height: "30px",
                backgroundColor: sortOrder === "newest" ? "var(--primary-color)" : "var(--border-color)",
                borderRadius: "2px", // 15pxから2pxに変更
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
            >
              <div
                style={{
                  position: "absolute",
                  top: "3px",
                  left: sortOrder === "newest" ? "33px" : "3px",
                  width: "24px",
                  height: "24px",
                  backgroundColor: "#ffffff",
                  borderRadius: "1px", // 2pxから1pxに変更してさらにラウンドを少なく
                  transition: "left 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              />
            </div>
            <button
              onClick={() => {
                // 古い順の時のみ新しい順に切り替え
                if (sortOrder === "oldest") {
                  setSortOrder("newest");
                }
              }}
              style={{
                background: "none",
                border: "none",
                fontSize: "0.9rem",
                color: sortOrder === "newest" ? "var(--primary-color)" : "var(--muted-text)",
                cursor: sortOrder === "oldest" ? "pointer" : "default",
                fontFamily: "inherit",
                fontWeight: sortOrder === "newest" ? "bold" : "normal",
                padding: "0.25rem 0.5rem",
                opacity: sortOrder === "oldest" ? 1 : 0.7,
                minWidth: "120px", // 90pxから120pxに拡大して英語の長いテキストに対応
                textAlign: "center", // 中央揃え
              }}
            >
              {t.sortNewest}
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "var(--muted-text)",
              padding: "3rem 0",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
            <p>{t.noResults}</p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              {visibleProducts.map((product) => (
                <ProjectCard key={product.id} product={product} language={language} onSelect={setSelectedProduct} />
              ))}
            </div>

            {visibleCount < filteredProducts.length && (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={loadMore}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--link-color)",
                    textDecoration: "underline",
                    fontSize: "1rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    margin: "0 auto",
                  }}
                >
                  {t.loadMore} ({filteredProducts.length - visibleCount}件)
                  <ArrowIcon direction="down" size={16} strokeWidth={2} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ProjectModal product={selectedProduct} language={language} onClose={() => setSelectedProduct(null)} />
    </section>
  );
}
