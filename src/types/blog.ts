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
  isPrivate?: boolean;
  isBanned?: boolean;
  banReason?: string;
  strikeCount?: number;
  passwordUpdatedAt?: string;
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
    isPrivate?: boolean;
  };
  publishedAt: string;
  updatedAt: string;
  status: 'published' | 'draft' | 'scheduled' | 'archived';
  readTimeMinutes: number;
  claps: number;
  likesCount: number;
  likedByUsers: string[];
  views: number;
  isFeatured?: boolean;
  seo?: PostSeo;
  comments: CommentItem[];
  savedCollections?: string[];
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

export interface FollowRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserHandle: string;
  fromUserAvatar: string;
  toUserId: string;
  toUserHandle: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'follow_request' | 'like' | 'comment' | 'follow_accepted' | 'admin_notice';
  title: string;
  message: string;
  fromUser?: {
    name: string;
    username: string;
    avatar: string;
  };
  postId?: string;
  read: boolean;
  createdAt: string;
  actionRequired?: boolean;
  requestId?: string;
}

export interface ReportItem {
  id: string;
  type: 'post' | 'user' | 'comment';
  targetId: string;
  targetTitleOrName: string;
  targetAuthorHandle?: string;
  reason: string;
  reportedBy: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
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
