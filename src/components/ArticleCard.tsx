import React, { useState } from 'react';
import {
  Bookmark,
  Heart,
  MessageSquare,
  Share2,
  Flag,
  MoreHorizontal,
  Sparkles,
  Check,
  Copy,
  Send,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Post, CommentItem } from '../types/blog';
import { CoverArtwork } from './CoverArtwork';
import { useAuth } from '../context/AuthContext';

interface ArticleCardProps {
  post: Post;
  onSelect: (post: Post) => void;
  isBookmarked: boolean;
  onToggleBookmark: (post: Post, e: React.MouseEvent) => void;
  isLiked?: boolean;
  onToggleLike?: (post: Post, e: React.MouseEvent) => void;
  onAuthorClick?: (post: Post, e: React.MouseEvent) => void;
  onReportPost?: (post: Post, e: React.MouseEvent) => void;
  onAddComment?: (postId: string, comment: CommentItem) => void;
  onOpenAiSummary?: (post: Post) => void;
  viewMode?: 'feed' | 'grid' | 'list';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  post,
  onSelect,
  isBookmarked,
  onToggleBookmark,
  isLiked = false,
  onToggleLike,
  onAuthorClick,
  onReportPost,
  onAddComment,
  onOpenAiSummary,
  viewMode = 'feed',
}) => {
  const { currentUser } = useAuth();
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [commentText, setCommentText] = useState('');

  const totalLikes = post.likesCount ?? post.claps ?? 0;

  // Double-tap on image to like (Instagram signature gesture)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);

    if (onToggleLike && !isLiked) {
      onToggleLike(post, e);
    }

    try {
      confetti({
        particleCount: 24,
        spread: 60,
        origin: { y: 0.65, x: 0.5 },
        colors: ['#f43f5e', '#e11d48', '#fda4af'],
      });
    } catch {}
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}#${post.slug || post.id}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => {
        setCopiedLink(false);
        setShowMenu(false);
      }, 1500);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.subtitle,
        url: `${window.location.origin}#${post.slug || post.id}`,
      }).catch(() => {});
    } else {
      handleCopyLink(e);
    }
  };

  const handleInlineCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !onAddComment) return;

    const newComment: CommentItem = {
      id: `comment-${Date.now()}`,
      authorName: currentUser?.displayName || 'Chronicle Reader',
      authorAvatar: currentUser?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(currentUser?.email || 'guest')}`,
      content: commentText.trim(),
      createdAt: 'Just now',
      likes: 0,
    };

    onAddComment(post.id, newComment);
    setCommentText('');
  };

  // 1. LIST VIEW (Minimalist Editorial List)
  if (viewMode === 'list') {
    return (
      <article
        onClick={() => onSelect(post)}
        className="group cursor-pointer py-6 px-4 -mx-4 sm:mx-0 sm:px-6 rounded-2xl hover:bg-neutral-100/70 dark:hover:bg-neutral-900/60 border-b border-neutral-200/80 dark:border-neutral-800 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
      >
        <div className="flex-1 space-y-2">
          {/* Unboxed Metadata */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
            <span>{post.category}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readTimeMinutes} min read</span>
            <span aria-hidden="true">·</span>
            <span>{post.publishedAt}</span>
          </div>

          <h3 className="font-editorial text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-snug">
            {post.title}
          </h3>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 max-w-3xl leading-relaxed">
            {post.subtitle}
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span
              onClick={(e) => onAuthorClick && onAuthorClick(post, e)}
              className="font-medium text-neutral-800 dark:text-neutral-200 hover:underline"
            >
              {post.author.name}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-mono text-rose-600 font-semibold">
              {totalLikes} {totalLikes === 1 ? 'like' : 'likes'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-mono">{post.comments?.length || 0} comments</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => onToggleLike && onToggleLike(post, e)}
            className={`p-2 rounded-xl border transition-colors ${
              isLiked
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-300 dark:border-rose-800'
                : 'text-neutral-400 hover:text-rose-600 border-neutral-200 dark:border-neutral-800 hover:bg-white dark:hover:bg-neutral-800'
            }`}
            title="Like story"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-600' : ''}`} />
          </button>

          <button
            onClick={(e) => onToggleBookmark(post, e)}
            className={`p-2 rounded-xl border transition-colors ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-300 dark:border-amber-800'
                : 'text-neutral-400 hover:text-neutral-700 border-neutral-200 dark:border-neutral-800 hover:bg-white dark:hover:bg-neutral-800'
            }`}
            title="Save to reading list"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {onReportPost && (
            <button
              onClick={(e) => onReportPost(post, e)}
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-rose-600 hover:bg-white dark:hover:bg-neutral-800 transition-colors"
              title="Report offensive post"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </article>
    );
  }

  // 2. GRID VIEW (Instagram Explore 3-Column Square Grid)
  if (viewMode === 'grid') {
    return (
      <article
        onClick={() => onSelect(post)}
        className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-neutral-200 dark:border-neutral-800 bg-neutral-900 select-none shadow-xs"
      >
        <CoverArtwork
          theme={post.coverStyle.theme}
          pattern={post.coverStyle.pattern}
          category={post.category}
          title={post.title}
          aspectRatio="card"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Instagram Explore Hover Stats Overlay */}
        <div className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-300 font-semibold">
              {post.category}
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {post.readTimeMinutes}m read
            </span>
          </div>

          <div className="space-y-1 text-center px-2">
            <h4 className="font-editorial text-sm font-bold line-clamp-2 leading-tight">
              {post.title}
            </h4>
            <span className="text-[11px] text-neutral-300 block">
              by @{post.author.username || 'author'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-6 font-mono text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 fill-white text-white" />
              <span>{totalLikes}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 fill-white text-white" />
              <span>{post.comments?.length || 0}</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // 3. FEED VIEW (Default: Instagram Post Card Anatomy for Longform Essays)
  return (
    <article className="rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200">
      {/* Instagram Post Header */}
      <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-850">
        <div
          onClick={(e) => onAuthorClick && onAuthorClick(post, e)}
          className="flex items-center gap-3 cursor-pointer group/author"
        >
          {/* Instagram Rainbow Gradient Story Ring */}
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shrink-0">
            <div className="p-0.5 bg-white dark:bg-neutral-900 rounded-full">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover group-hover/author:opacity-90 transition-opacity"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover/author:underline leading-tight">
                {post.author.name}
              </h4>
              {post.author.role === 'admin' ? (
                <span title="Administrator">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                </span>
              ) : (
                <span title="Verified Author">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
              <span>@{post.author.username || 'author'}</span>
              <span>·</span>
              <span>{post.publishedAt}</span>
            </div>
          </div>
        </div>

        {/* Right Header Menu */}
        <div className="relative flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
            {post.category}
          </span>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* More Options Dropdown */}
          {showMenu && (
            <div className="absolute right-0 top-8 z-30 w-44 rounded-2xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={handleCopyLink}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Essay Link'}</span>
              </button>

              <button
                onClick={handleShare}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share via...</span>
              </button>

              <button
                onClick={(e) => {
                  onToggleBookmark(post, e);
                  setShowMenu(false);
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isBookmarked ? 'Remove Bookmark' : 'Save to Reading List'}</span>
              </button>

              {onReportPost && (
                <button
                  onClick={(e) => {
                    onReportPost(post, e);
                    setShowMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border-t border-neutral-100 dark:border-neutral-800"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cover Artwork Container with Instagram Double-Tap Gesture */}
      <div
        onDoubleClick={handleDoubleClick}
        onClick={() => onSelect(post)}
        className="relative overflow-hidden cursor-pointer select-none group/cover bg-neutral-900"
      >
        <CoverArtwork
          theme={post.coverStyle.theme}
          pattern={post.coverStyle.pattern}
          category={post.category}
          title={post.title}
          aspectRatio="card"
          className="group-hover/cover:scale-[1.015] transition-transform duration-500"
        />

        {/* Big Heart Burst Animation on Double-Tap */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-50 fade-in duration-200">
            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl animate-bounce" />
          </div>
        )}

        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-white/80 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
          {post.readTimeMinutes} min read
        </div>
      </div>

      {/* Action Bar (Instagram Signature Icons) */}
      <div className="px-4 sm:px-5 pt-3.5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={(e) => onToggleLike && onToggleLike(post, e)}
            className="p-1 text-neutral-800 dark:text-neutral-200 hover:scale-115 active:scale-90 transition-transform focus:outline-none"
            title="Like Essay"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isLiked ? 'fill-rose-500 text-rose-500' : 'text-neutral-800 dark:text-neutral-200'
              }`}
            />
          </button>

          {/* Comment Button */}
          <button
            onClick={() => onSelect(post)}
            className="p-1 text-neutral-800 dark:text-neutral-200 hover:scale-115 active:scale-90 transition-transform focus:outline-none"
            title="Comments & Discussion"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-1 text-neutral-800 dark:text-neutral-200 hover:scale-115 active:scale-90 transition-transform focus:outline-none"
            title="Share Essay"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* AI Insights & SEO button */}
          {onOpenAiSummary && (
            <button
              onClick={() => onOpenAiSummary(post)}
              className="p-1 text-amber-600 dark:text-amber-400 hover:scale-115 active:scale-90 transition-transform focus:outline-none"
              title="AI Essay Summary & SEO Insights"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Bookmark Button */}
        <button
          onClick={(e) => onToggleBookmark(post, e)}
          className="p-1 text-neutral-800 dark:text-neutral-200 hover:scale-115 active:scale-90 transition-transform focus:outline-none"
          title="Save to Reading List"
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Social Proof ("Liked by...") */}
      <div className="px-4 sm:px-5 pb-2 text-xs font-mono text-neutral-900 dark:text-neutral-100">
        {totalLikes === 0 ? (
          <span className="text-neutral-400">Be the first to like this essay</span>
        ) : totalLikes === 1 ? (
          <span>
            Liked by <strong className="font-semibold">{isLiked ? 'you' : (post.likedByUsers?.[0] || `@${post.author.username}` || 'a reader')}</strong>
          </span>
        ) : (
          <span>
            Liked by <strong className="font-semibold">{isLiked ? 'you' : (post.likedByUsers?.[0] || `@${post.author.username}` || 'a reader')}</strong> and <strong className="font-semibold tabular-nums">{totalLikes - 1} others</strong>
          </span>
        )}
      </div>

      {/* Title & Caption with Expandable Excerpt */}
      <div className="px-4 sm:px-5 pb-3 space-y-1.5 text-xs">
        <div>
          <span
            onClick={(e) => onAuthorClick && onAuthorClick(post, e)}
            className="font-semibold text-neutral-900 dark:text-neutral-100 mr-2 cursor-pointer hover:underline"
          >
            @{post.author.username || 'author'}
          </span>
          <span
            onClick={() => onSelect(post)}
            className="font-editorial text-base font-bold text-neutral-900 dark:text-neutral-100 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer transition-colors leading-snug"
          >
            {post.title}
          </span>
        </div>

        <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {isExpanded ? post.subtitle : `${post.subtitle.slice(0, 110)}${post.subtitle.length > 110 ? '...' : ''}`}
          {post.subtitle.length > 110 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 ml-1.5 font-medium"
            >
              {isExpanded ? 'less' : 'more'}
            </button>
          )}
        </p>

        {/* View all comments link */}
        <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <button
            onClick={() => onSelect(post)}
            className="hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            View all {post.comments.length} comments
          </button>

          <button
            onClick={() => onSelect(post)}
            className="text-amber-700 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Read Full Blog</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* 1 Recent Comment Preview */}
        {post.comments.length > 0 && (
          <div className="pt-1 text-[11px] text-neutral-700 dark:text-neutral-300 truncate">
            <strong className="font-semibold mr-1.5 text-neutral-900 dark:text-neutral-100">
              {post.comments[0].authorName}:
            </strong>
            <span>{post.comments[0].content}</span>
          </div>
        )}
      </div>

      {/* Inline Quick Comment Input (Instagram Signature Feed Form) */}
      <form
        onSubmit={handleInlineCommentSubmit}
        className="px-4 sm:px-5 py-3 border-t border-neutral-100 dark:border-neutral-850 flex items-center gap-2.5 text-xs bg-neutral-50/40 dark:bg-neutral-850/30"
      >
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={`Add a comment for @${post.author.username || 'author'}...`}
          className="flex-1 bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 text-xs"
        />

        <button
          type="submit"
          disabled={!commentText.trim()}
          className="font-semibold text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 disabled:opacity-30 disabled:hover:text-blue-600 transition-opacity flex items-center gap-1"
        >
          <span>Post</span>
          <Send className="w-3 h-3" />
        </button>
      </form>
    </article>
  );
};
