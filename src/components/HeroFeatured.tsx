import React from 'react';
import { ArrowRight, BookOpen, Clock, Heart } from 'lucide-react';
import { Post } from '../types/blog';
import { CoverArtwork } from './CoverArtwork';

interface HeroFeaturedProps {
  post: Post;
  onRead: (post: Post) => void;
  totalStoriesCount: number;
  totalReadsCount: number;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  post,
  onRead,
  totalStoriesCount,
  totalReadsCount,
}) => {
  return (
    <section className="mb-14">
      {/* 2-column Split Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 lg:p-10 shadow-xs">
        {/* Left Column: Typographic Narrative */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            {/* Unboxed Kicker */}
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-amber-700 dark:text-amber-400 mb-3">
              <span>Editor's Selection</span>
              <span aria-hidden="true">·</span>
              <span>Volume 04</span>
            </div>

            {/* Display Headline with balanced wrapping */}
            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-[1.15] text-balance mb-4">
              {post.title}
            </h1>

            {/* Subtitle / Lead Paragraph */}
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal max-w-2xl">
              {post.subtitle}
            </p>
          </div>

          {/* Author info & Unboxed Metadata */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                />
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {post.author.name}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {post.author.role}
                  </p>
                </div>
              </div>

              {/* Zero-Pill Unboxed Metadata with separators */}
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                <span>{post.category}</span>
                <span aria-hidden="true">·</span>
                <span>{post.readTimeMinutes} min read</span>
                <span aria-hidden="true">·</span>
                <span>{post.publishedAt}</span>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => onRead(post)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-sm group active:scale-95"
              >
                <span>Read Featured Story</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{post.claps} appreciations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Artwork Canvas */}
        <div className="lg:col-span-5 flex flex-col">
          <div
            onClick={() => onRead(post)}
            className="group cursor-pointer relative h-full min-h-[260px] lg:min-h-full rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800"
          >
            <CoverArtwork
              theme={post.coverStyle.theme}
              pattern={post.coverStyle.pattern}
              category={post.category}
              title={post.title}
              aspectRatio="wide"
              className="h-full w-full group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="px-4 py-2 bg-white/90 text-neutral-900 text-xs font-semibold rounded-md shadow-md backdrop-blur-sm">
                Open Reader
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width editorial metrics strip below the split */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-6 rounded-xl bg-neutral-100/70 dark:bg-neutral-900/50 border border-neutral-200/60 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-neutral-400 shrink-0" />
          <div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
              {totalStoriesCount}
            </span>{' '}
            Editorial Essays
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
          <div>
            Avg Read Time:{' '}
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
              5.8 min
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-amber-500 font-bold">⌘</span>
          <div>
            Total Global Views:{' '}
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
              {totalReadsCount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-emerald-500 font-bold">✦</span>
          <div>
            AI Editorial Intelligence:{' '}
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              Active
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
