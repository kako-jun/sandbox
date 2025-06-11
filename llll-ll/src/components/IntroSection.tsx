'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { useTranslation } from '@/lib/i18n';

interface IntroSectionProps {
  language: Language;
}

export default function IntroSection({ language }: IntroSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslation(language);

  return (
    <section className="py-8 fade-in">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-xl glow-accent mb-4">{t.welcome}</h2>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="pixel-border px-4 py-2 bg-bg-secondary hover:bg-bg-accent transition-colors text-sm"
          >
            {isExpanded ? '▲ Hide' : '▼ About'}
          </button>
        </div>

        {isExpanded && (
          <div className="max-w-2xl mx-auto slide-up">
            <div className="pixel-border p-6 bg-bg-secondary mb-6">
              <h3 className="text-md glow mb-4">{t.aboutTitle}</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                {t.intro}
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-block pixel-border p-4 bg-bg-accent">
                <div className="text-6xl mb-2">🎮</div>
                <div className="text-xs text-text-secondary">Game Developer</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}