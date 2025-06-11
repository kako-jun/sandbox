'use client';

import { useState } from 'react';
import { Language } from '@/types';

interface LanguageSelectorProps {
  onLanguageSelect: (lang: Language) => void;
}

export default function LanguageSelector({ onLanguageSelect }: LanguageSelectorProps) {
  const languages = [
    { code: 'en' as Language, flag: '🇺🇸', label: 'English' },
    { code: 'zh' as Language, flag: '🇨🇳', label: '中文' },
    { code: 'ja' as Language, flag: '🇯🇵', label: '日本語' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="container">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl glow mb-4">llll-ll</h1>
          <p className="text-text-secondary text-sm">Select Language / 选择语言 / 言語を選択</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-md mx-auto">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageSelect(lang.code)}
              className="pixel-border p-6 bg-bg-secondary hover:bg-bg-accent transition-all duration-300 hover:scale-105 group"
            >
              <div className="text-4xl mb-2">{lang.flag}</div>
              <div className="text-sm glow group-hover:glow-accent transition-all duration-300">
                {lang.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}