import { NextRequest, NextResponse } from 'next/server';
import { BBSStorage } from '@/lib/storage';
import { DeleteRequest } from '@/types/bbs';

const ADMIN_KEY = process.env.BBS_ADMIN_KEY || 'admin123';

export async function DELETE(request: NextRequest) {
  try {
    const body: DeleteRequest = await request.json();
    const { url, postId, adminKey } = body;
    
    // 管理者キーの確認
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Invalid admin key' },
        { status: 403 }
      );
    }
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    let success = false;
    
    if (postId) {
      // 特定の投稿を削除
      success = await BBSStorage.deletePost(url, postId);
      
      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Post deleted successfully',
          deletedPostId: postId
        });
      } else {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }
    } else {
      // BBS全体を削除
      success = await BBSStorage.deleteBBS(url);
      
      if (success) {
        return NextResponse.json({
          success: true,
          message: 'BBS deleted successfully',
          deletedURL: url
        });
      } else {
        return NextResponse.json(
          { error: 'BBS not found' },
          { status: 404 }
        );
      }
    }
    
  } catch (error) {
    console.error('Error in admin delete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 管理者用BBS一覧取得（デバッグ用）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');
    
    // 管理者キーの確認
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Invalid admin key' },
        { status: 403 }
      );
    }
    
    // すべてのBBSを取得（開発用）
    // 実際のプロダクションではより詳細な管理機能を実装
    return NextResponse.json({
      message: 'Admin endpoint is working',
      adminKey: ADMIN_KEY,
      usage: {
        deletePost: 'DELETE /api/bbs/admin with { url, postId, adminKey }',
        deleteBBS: 'DELETE /api/bbs/admin with { url, adminKey }'
      }
    });
    
  } catch (error) {
    console.error('Error in admin get:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}