"use client";

import { useState, useEffect } from "react";
import { Language, Product } from "@/types";
import LanguageSelector from "@/components/LanguageSelector";
import Header from "@/components/Header";
import IntroSection from "@/components/IntroSection";
import ImageDisplay from "@/components/ImageDisplay";
import ProjectList from "@/components/ProjectList";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { FloatingSlime, FloatingCat, TetrisBlock } from "@/components/PixelAnimations";

export default function HomePage() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLanguage) {
      setLoading(true);
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          setProducts(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load products:", err);
          setLoading(false);
        });
    }
  }, [selectedLanguage]);

  return (
    <>
      <LanguageSelector onLanguageSelect={setSelectedLanguage} selectedLanguage={selectedLanguage} />

      {selectedLanguage && (
        <>
          <Header language={selectedLanguage} />

          <main>
            <IntroSection language={selectedLanguage} />
            <ImageDisplay language={selectedLanguage} />

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <div style={{ color: "#6c757d" }}>Loading...</div>
              </div>
            ) : (
              <ProjectList products={products} language={selectedLanguage} />
            )}
          </main>

          <Footer />
          <ScrollToTop />
        </>
      )}

      <TetrisBlock />
    </>
  );
}
