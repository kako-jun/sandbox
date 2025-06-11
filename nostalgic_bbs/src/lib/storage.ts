// シンプルなメモリストレージ（開発用）
// 本番環境ではVercel KVに置き換える

export interface BBSPost {
  id: string;
  content: string;
  author: string;
  country?: string;
  timestamp: string;
  ip?: string;
}

export interface BBSData {
  posts: BBSPost[];
  lastUpdated: string;
}

// メモリ内ストレージ（開発用）
const memoryStore: Map<string, BBSData> = new Map();

export class BBSStorage {
  static async getBBS(url: string): Promise<BBSData> {
    const key = this.getKey(url);
    
    // 開発用：メモリから取得
    const data = memoryStore.get(key);
    if (data) {
      return data;
    }
    
    // 初期データ
    return {
      posts: [],
      lastUpdated: new Date().toISOString()
    };
  }
  
  static async saveBBS(url: string, data: BBSData): Promise<void> {
    const key = this.getKey(url);
    data.lastUpdated = new Date().toISOString();
    
    // 開発用：メモリに保存
    memoryStore.set(key, data);
  }
  
  static async addPost(url: string, post: Omit<BBSPost, 'id' | 'timestamp'>): Promise<BBSPost> {
    const data = await this.getBBS(url);
    
    const newPost: BBSPost = {
      ...post,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };
    
    data.posts.push(newPost);
    await this.saveBBS(url, data);
    
    return newPost;
  }
  
  static async deletePost(url: string, postId: string): Promise<boolean> {
    const data = await this.getBBS(url);
    const initialLength = data.posts.length;
    
    data.posts = data.posts.filter(post => post.id !== postId);
    
    if (data.posts.length < initialLength) {
      await this.saveBBS(url, data);
      return true;
    }
    
    return false;
  }
  
  static async deleteBBS(url: string): Promise<boolean> {
    const key = this.getKey(url);
    
    // 開発用：メモリから削除
    return memoryStore.delete(key);
  }
  
  private static getKey(url: string): string {
    return `bbs:${url}`;
  }
  
  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}