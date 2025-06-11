import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 音楽理論アプリとして最適化
  experimental: {
    optimizeCss: true,
    // Turbopack最適化
    turbo: {
      rules: {
        '*.yaml': {
          loaders: ['js-yaml-loader'],
          as: 'json',
        },
        '*.yml': {
          loaders: ['js-yaml-loader'],
          as: 'json',
        },
      },
    },
  },
  
  // 静的アセットの最適化
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // YAMLファイル処理用（Webpack用、Turbopackは上のrulesを使用）
  webpack: (config) => {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'js-yaml-loader',
    });
    return config;
  },
};

export default nextConfig;
