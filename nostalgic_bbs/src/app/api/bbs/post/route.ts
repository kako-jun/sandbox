import { NextRequest, NextResponse } from 'next/server';
import { BBSStorage } from '@/lib/storage';
import { PostRequest } from '@/types/bbs';

const ADMIN_KEY = process.env.BBS_ADMIN_KEY || 'admin123';

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

function validateContent(content: string): boolean {
  if (!content || content.trim().length === 0) {
    return false;
  }
  
  if (content.length > 1000) {
    return false;
  }
  
  // 基本的な荒らし対策
  const spamPatterns = [
    /(.)\1{10,}/, // 同じ文字の連続
    /https?:\/\/[^\s]+/gi, // URL（複数）
    /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]{0,2}[a-zA-Z0-9]{20,}/, // 意味不明な文字列
  ];
  
  return !spamPatterns.some(pattern => pattern.test(content));
}

function validateAuthor(author: string): boolean {
  if (!author || author.trim().length === 0) {
    return false;
  }
  
  if (author.length > 50) {
    return false;
  }
  
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body: PostRequest = await request.json();
    
    const { url, content, author, country } = body;
    
    // バリデーション
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    if (!validateContent(content)) {
      return NextResponse.json(
        { error: 'Invalid content' },
        { status: 400 }
      );
    }
    
    if (!validateAuthor(author)) {
      return NextResponse.json(
        { error: 'Invalid author name' },
        { status: 400 }
      );
    }
    
    // レート制限（IPベース）
    const clientIP = getClientIP(request);
    // TODO: 実装（Redis等でレート制限）
    
    // 投稿を保存
    const post = await BBSStorage.addPost(url, {
      content: content.trim(),
      author: author.trim(),
      country,
      ip: clientIP
    });
    
    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        content: post.content,
        author: post.author,
        country: post.country,
        timestamp: post.timestamp
      }
    });
    
  } catch (error) {
    console.error('Error posting to BBS:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}