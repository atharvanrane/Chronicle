export interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
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
    name: string;
    role: string;
    avatar: string;
    bio: string;
  };
  publishedAt: string;
  updatedAt: string;
  status: 'published' | 'draft' | 'scheduled';
  readTimeMinutes: number;
  claps: number;
  views: number;
  isFeatured?: boolean;
  seo?: PostSeo;
  comments: CommentItem[];
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
