export type Language = 'en' | 'zh' | 'ja';

export interface Product {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  tags: string[];
  images: string[];
  animations?: string[];
  videos?: string[];
  demoUrl?: string;
  repositoryUrl?: string;
  blogUrl?: string;
  supportUrl?: string;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
}