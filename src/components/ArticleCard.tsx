import React, { useState } from 'react';
import { Bookmark, Heart, MessageSquare, Share2, Flag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Post } from '../types/blog';
import { CoverArtwork } from './CoverArtwork';

interface ArticleCardProps {
  post: Post;
  onSelect: (post: Post) => void;
  isBookmarked: boolean;
  onToggleBookmark: (post: Post, e: React.MouseEvent) => void;
  isLiked?: boolean;
  onToggleLike?: (post: Post, e: React.MouseEvent) => void;
  onAuthorClick?: (post: Post, e: React.MouseEvent) => void;
  onReportPost?: (post: Post, e: React.MouseEvent) => void;
  viewMode?: 'grid' | 'list';
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
  viewMode = 'grid',
}) => {
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const totalLikes = post.likesCount ?? post.claps ?? 0;

  // Double-tap on image to like (Instagram gesture)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);

    if (onToggleLike && !isLiked) {
      onToggleLike(post, e);
    }

    confetti({
      particleCount: 20,
      spread: 50,
      origin: { y: 0.7, x: 0.5 },
      colors: ['#e11d48', '#f43f5e'],
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: post.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  if (viewMode === 'list') {
    return (
      <article
        onClick={() => onSelect(post)}
        className="group cursor-pointer py-6 px-4 -mx-4 sm:mx-0 sm:px-6 rounded-xl hover:bg-neutral-100/70 dark:hover:bg-neutral-900/60 border-b border-neutral-200/80 dark:border-neutral-800 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
      >
        <div className="flex-1 space-y-2">
          {/* Zero-Pill Unboxed Metadata */}
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
            className={`p-2 rounded-lg border transition-colors ${
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
            className={`p-2 rounded-lg border transition-colors ${
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
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-rose-600 hover:bg-white dark:hover:bg-neutral-800 transition-colors"
              title="Report offensive post"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={() => onSelect(post)}
      className="group cursor-pointer rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Instagram Post Header: Author lockup with story ring */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-850">
          <div
            onClick={(e) => onAuthorClick && onAuthorClick(post, e)}
            className="flex items-center gap-2.5 group/author hover:opacity-85 transition-opacity"
          >
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 shrink-0">
              <div className="p-0.5 bg-white dark:bg-neutral-900 rounded-full">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover"
                />
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
                {post.author.name}
              </h4>
              <span className="text-[10px] font-mono text-neutral-400">
                @{post.author.username || 'author'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-400">
              {post.category}
            </span>
            {onReportPost && (
              <button
                onClick={(e) => onReportPost(post, e)}
                className="p-1 rounded text-neutral-400 hover:text-rose-500 transition-colors"
                title="Report offensive post"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Cover Artwork Container (Double-tap to like) */}
        <div
          onDoubleClick={handleDoubleClick}
          className="relative overflow-hidden select-none"
        >
          <CoverArtwork
            theme={post.coverStyle.theme}
            pattern={post.coverStyle.pattern}
            category={post.category}
            title={post.title}
            aspectRatio="card"
            className="group-hover:scale-102 transition-transform duration-500"
          />

          {/* Big Instagram Animated Heart Burst on double click */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-50 fade-in duration-200">
              <Heart className="w-20 h-20 text-rose-500 fill-rose-500 drop-shadow-xl animate-bounce" />
            </div>
          )}

          <div className="absolute bottom-2 right-2 text-[10px] font-mono text-white/70 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
            {post.readTimeMinutes} min read
          </div>
        </div>

        {/* Instagram Action Icons Row */}
        <div className="px-5 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => onToggleLike && onToggleLike(post, e)}
              className="p-1 text-neutral-700 dark:text-neutral-200 hover:scale-110 active:scale-95 transition-transform"
              title="Like"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isLiked ? 'fill-rose-500 text-rose-500' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(post);
              }}
              className="p-1 text-neutral-700 dark:text-neutral-300 hover:scale-110 transition-transform"
              title="Comments"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            <button
              onClick={handleShare}
              className="p-1 text-neutral-700 dark:text-neutral-300 hover:scale-110 transition-transform"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={(e) => onToggleBookmark(post, e)}
            className="p-1 text-neutral-700 dark:text-neutral-300 hover:scale-110 transition-transform"
            title="Save"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current text-amber-500' : ''}`} />
          </button>
        </div>

        {/* "Liked by..." Instagram Social Proof Strip */}
        <div className="px-5 pb-2 text-xs font-mono text-neutral-800 dark:text-neutral-200">
          {totalLikes === 0 ? (
            <span className="text-neutral-400">Be the first to like this essay</span>
          ) : totalLikes === 1 ? (
            <span>
              Liked by <strong className="font-semibold">{isLiked ? 'you' : (post.likedByUsers?.[0] || post.author.username || 'a reader')}</strong>
            </span>
          ) : (
            <span>
              Liked by <strong className="font-semibold">{isLiked ? 'you' : (post.likedByUsers?.[0] || post.author.username || 'a reader')}</strong> and <strong className="font-semibold tabular-nums">{totalLikes - 1} others</strong>
            </span>
          )}
        </div>

        {/* Post Title & Caption */}
        <div className="px-5 pb-5 space-y-1.5">
          <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
            {post.title}
          </h3>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
            {post.subtitle}
          </p>

          {/* View comments text link */}
          <div className="pt-2 text-[11px] font-mono text-neutral-400">
            View all {post.comments.length} comments · {post.publishedAt}
          </div>
        </div>
      </div>
    </article>
  );
};
