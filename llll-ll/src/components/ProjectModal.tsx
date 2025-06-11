'use client';

import { useState, useEffect } from 'react';
import { Product, Language } from '@/types';
import { useTranslation } from '@/lib/i18n';

interface ProjectModalProps {
  product: Product | null;
  language: Language;
  onClose: () => void;
}

export default function ProjectModal({ product, language, onClose }: ProjectModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const t = useTranslation(language);

  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0);
    }
  }, [product]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto pixel-border bg-bg-primary">
        <div className="sticky top-0 bg-bg-primary border-b border-border-color p-4 flex justify-between items-center">
          <h2 className="text-lg glow">{product.title[language]}</h2>
          <button
            onClick={onClose}
            className="text-text-accent hover:text-text-primary text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {product.images.length > 0 && (
            <div className="mb-6">
              <div className="aspect-video relative mb-4 pixel-border overflow-hidden">
                <img
                  src={product.images[currentImageIndex]}
                  alt={`${product.title[language]} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 pixel-border overflow-hidden ${
                        index === currentImageIndex ? 'border-text-accent' : 'border-border-color'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md glow-accent mb-3">Description</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                {product.description[language]}
              </p>

              <div className="mb-4">
                <h4 className="text-sm glow mb-2">{t.madeWith}</h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-bg-secondary text-text-primary border border-border-color"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-xs text-text-secondary">
                <div>Created: {new Date(product.createdAt).toLocaleDateString()}</div>
                <div>Updated: {new Date(product.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>

            <div>
              <h3 className="text-md glow-accent mb-3">Links</h3>
              <div className="space-y-3">
                {product.demoUrl && (
                  <a
                    href={product.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 bg-text-primary text-bg-primary hover:bg-text-accent transition-colors text-center text-sm"
                  >
                    {t.viewDemo}
                  </a>
                )}
                
                {product.repositoryUrl && (
                  <a
                    href={product.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 border border-text-primary text-text-primary hover:bg-text-primary hover:text-bg-primary transition-colors text-center text-sm"
                  >
                    {t.viewCode}
                  </a>
                )}
                
                {product.blogUrl && (
                  <a
                    href={product.blogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 border border-text-accent text-text-accent hover:bg-text-accent hover:text-bg-primary transition-colors text-center text-sm"
                  >
                    {t.viewBlog}
                  </a>
                )}
                
                {product.supportUrl && (
                  <a
                    href={product.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 border border-text-secondary text-text-secondary hover:bg-text-secondary hover:text-bg-primary transition-colors text-center text-sm"
                  >
                    {t.support}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}