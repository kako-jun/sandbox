'use client';

import { Language } from '@/types';

interface HeaderProps {
  language: Language;
}

export default function Header({ language }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-bg-primary/90 backdrop-blur-sm border-b border-border-color">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg glow">llll-ll</h1>
          <div className="text-xs text-text-secondary">
            kako-jun
          </div>
        </div>
      </div>
    </header>
  );
}