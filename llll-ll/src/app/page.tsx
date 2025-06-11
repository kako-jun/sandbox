'use client';

import { useState, useEffect } from 'react';
import { Language, Product } from '@/types';
import LanguageSelector from '@/components/LanguageSelector';
import Header from '@/components/Header';
import IntroSection from '@/components/IntroSection';
import ProjectList from '@/components/ProjectList';
import Footer from '@/components/Footer';
import { FloatingSlime, FloatingCat, TetrisBlock } from '@/components/PixelAnimations';

export default function HomePage() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLanguage) {
      setLoading(true);
      fetch('/api/products')
        .then(res => res.json())
        .then(data => {
          setProducts(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load products:', err);
          setLoading(false);
        });
    }
  }, [selectedLanguage]);

  if (!selectedLanguage) {
    return (
      <>
        <LanguageSelector onLanguageSelect={setSelectedLanguage} />
        <TetrisBlock />
      </>
    );
  }

  return (
    <>
      <Header language={selectedLanguage} />
      
      <main className="min-h-screen">
        <IntroSection language={selectedLanguage} />
        
        {loading ? (
          <div className="text-center py-12">
            <div className="text-text-secondary">Loading...</div>
          </div>
        ) : (
          <ProjectList products={products} language={selectedLanguage} />
        )}
      </main>
      
      <Footer />
      
      <FloatingSlime />
      <FloatingCat />
      <TetrisBlock />
    </>
  );
}