'use client';

import { useState } from 'react';
import { Product, Language } from '@/types';
import { useTranslation } from '@/lib/i18n';

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
      className="pixel-border bg-bg-secondary hover:bg-bg-accent transition-all duration-300 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect?.(product)}
    >
      <div className="aspect-square relative overflow-hidden">
        {product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title[language]}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🎮
          </div>
        )}
        
        {product.featured && (
          <div className="absolute top-2 right-2 bg-text-accent text-bg-primary px-2 py-1 text-xs pixel-border">
            ★
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xs glow mb-2 line-clamp-2">
          {product.title[language]}
        </h3>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-bg-primary text-text-secondary border border-border-color"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="text-xs text-text-secondary line-clamp-3 mb-3">
          {product.description[language]}
        </p>

        <div className="flex gap-2 text-xs">
          {product.demoUrl && (
            <a
              href={product.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-text-primary text-bg-primary hover:bg-text-accent transition-colors"
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
              className="px-3 py-1 border border-text-primary text-text-primary hover:bg-text-primary hover:text-bg-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {t.viewCode}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}