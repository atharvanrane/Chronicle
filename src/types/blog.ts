export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  username: string;
  photoURL: string;
  role: 'admin' | 'creator' | 'reader';
  bio?: string;
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy?: string[];
}

export interface PostSeo {
  metaTitle?: string;
  metaDescription?: string;
  primaryKeywords?: string[];
  seoScore?: number;
  readability?: string;
  socialSnippet?: string;
  headlineSuggestions?: string[];
  strengths?: string[];
  improvements?: string[];
}

export type PostCategory =
  | 'Engineering'
  | 'Design'
  | 'Artificial Intelligence'
  | 'Culture & Society'
  | 'Essays & Thinking'
  | 'Founders & Startups';

export interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  category: PostCategory;
  tags: string[];
  coverStyle: {
    theme: 'stone' | 'slate' | 'amber' | 'emerald' | 'indigo' | 'rose';
    pattern: 'mesh' | 'geometric' | 'dots' | 'waves';
    imageUrl?: string;
  };
  author: {
    id?: string;
    name: string;
    role: string;
    avatar: string;
    bio: string;
    username?: string;
  };
  publishedAt: string;
  updatedAt: string;
  status: 'published' | 'draft' | 'scheduled';
  readTimeMinutes: number;
  claps: number;
  likesCount: number;
  likedByUsers: string[]; // List of user IDs who liked
  views: number;
  isFeatured?: boolean;
  seo?: PostSeo;
  comments: CommentItem[];
}

export interface StoryItem {
  id: string;
  title: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  theme: 'stone' | 'slate' | 'amber' | 'emerald' | 'indigo' | 'rose';
  snippet: string;
  postId?: string;
  isUnread?: boolean;
}

export interface SeoAnalysisResponse {
  seoScore: number;
  metaTitle: string;
  metaDescription: string;
  primaryKeywords: string[];
  readability: string;
  strengths: string[];
  improvements: string[];
  headlineSuggestions: string[];
  socialSnippet: string;
}
