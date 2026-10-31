import React from 'react';
import { Bookmark, Heart, MessageSquare } from 'lucide-react';
import { Post } from '../types/blog';
import { CoverArtwork } from './CoverArtwork';

interface ArticleCardProps {
  post: Post;
  onSelect: (post: Post) => void;
  isBookmarked: boolean;
  onToggleBookmark: (post: Post, e: React.MouseEvent) => void;
  viewMode?: 'grid' | 'list';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  post,
  onSelect,
  isBookmarked,
  onToggleBookmark,
  viewMode = 'grid',
}) => {
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
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {post.author.name}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-mono">{post.claps} likes</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-mono">{post.comments.length} comments</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => onToggleBookmark(post, e)}
            className={`p-2 rounded-lg border transition-colors ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 border-neutral-200 dark:border-neutral-800 hover:bg-white dark:hover:bg-neutral-800'
            }`}
            title={isBookmarked ? 'Remove from saved' : 'Save to reading list'}
            aria-label="Bookmark post"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={() => onSelect(post)}
      className="group cursor-pointer rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Cover Artwork Container */}
        <div className="relative overflow-hidden">
          <CoverArtwork
            theme={post.coverStyle.theme}
            pattern={post.coverStyle.pattern}
            category={post.category}
            title={post.title}
            aspectRatio="card"
            className="group-hover:scale-102 transition-transform duration-500"
          />

          <button
            onClick={(e) => onToggleBookmark(post, e)}
            className={`absolute top-4 right-4 z-20 p-2 rounded-lg backdrop-blur-md transition-all ${
              isBookmarked
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-neutral-900/60 text-white/80 hover:text-white hover:bg-neutral-900/90'
            }`}
            title={isBookmarked ? 'Remove from saved' : 'Save to reading list'}
            aria-label="Bookmark post"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 space-y-3">
          {/* Zero-Pill Unboxed Metadata: NO pill capsules */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
            <span>{post.category}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readTimeMinutes} min read</span>
            <span aria-hidden="true">·</span>
            <span>{post.publishedAt}</span>
          </div>

          <h3 className="font-editorial text-xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-tight line-clamp-2">
            {post.title}
          </h3>

          <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
            {post.subtitle}
          </p>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-2.5">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            referrerPolicy="no-referrer"
            className="w-6 h-6 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
          />
          <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[120px]">
            {post.author.name}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono tabular-nums">
          <span className="inline-flex items-center gap-1">
            <Heart className="w-3 h-3 text-neutral-400 group-hover:text-rose-500 transition-colors" />
            <span>{post.claps}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-neutral-400" />
            <span>{post.comments.length}</span>
          </span>
        </div>
      </div>
    </article>
  );
};
