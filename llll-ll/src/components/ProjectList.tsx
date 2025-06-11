'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product, Language } from '@/types';
import { useTranslation } from '@/lib/i18n';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

interface ProjectListProps {
  products: Product[];
  language: Language;
}

export default function ProjectList({ products, language }: ProjectListProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [visibleCount, setVisibleCount] = useState(12);
  
  const t = useTranslation(language);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filter === 'all' || 
                           (filter === 'free' && product.tags.includes('Free')) ||
                           (filter === 'paid' && !product.tags.includes('Free'));
      
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [products, language, searchTerm, filter, sortOrder]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        if (visibleCount < filteredProducts.length) {
          loadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, filteredProducts.length]);

  return (
    <section className="py-8">
      <div className="container">
        <h2 className="text-xl glow-accent mb-6 text-center">{t.projectsTitle}</h2>
        
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="px-3 py-2 bg-bg-secondary text-text-primary pixel-border text-xs"
            >
              <option value="newest">{t.sortNewest}</option>
              <option value="oldest">{t.sortOldest}</option>
            </select>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'free' | 'paid')}
              className="px-3 py-2 bg-bg-secondary text-text-primary pixel-border text-xs"
            >
              <option value="all">{t.filterAll}</option>
              <option value="free">{t.filterFree}</option>
              <option value="paid">{t.filterPaid}</option>
            </select>
          </div>

          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-bg-secondary text-text-primary pixel-border text-xs placeholder-text-secondary"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center text-text-secondary py-12">
            No projects found matching your criteria.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {visibleProducts.map((product) => (
                <ProjectCard
                  key={product.id}
                  product={product}
                  language={language}
                  onSelect={setSelectedProduct}
                />
              ))}
            </div>

            {visibleCount < filteredProducts.length && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  className="px-6 py-3 bg-bg-secondary hover:bg-bg-accent pixel-border text-sm glow transition-colors"
                >
                  Load More ({filteredProducts.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ProjectModal
        product={selectedProduct}
        language={language}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}