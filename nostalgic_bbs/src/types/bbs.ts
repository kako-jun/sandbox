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

export interface PostRequest {
  url: string;
  content: string;
  author: string;
  country?: string;
}

export interface DeleteRequest {
  url: string;
  postId?: string;
  adminKey: string;
}