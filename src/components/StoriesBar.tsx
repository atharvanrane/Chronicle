import React, { useState, useEffect } from 'react';
import { X, Heart, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { StoryItem, Post } from '../types/blog';
import { CoverArtwork } from './CoverArtwork';

interface StoriesBarProps {
  stories: StoryItem[];
  onSelectStoryArticle?: (postId: string) => void;
  currentUserAvatar?: string;
  onOpenCreateStory?: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  onSelectStoryArticle,
  currentUserAvatar,
  onOpenCreateStory,
}) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyLikes, setStoryLikes] = useState<Record<string, number>>({});
  const [readStoryIds, setReadStoryIds] = useState<string[]>([]);

  // Active story viewer auto-timer
  useEffect(() => {
    if (activeStoryIndex === null) {
      setStoryProgress(0);
      return;
    }

    const currentStory = stories[activeStoryIndex];
    if (currentStory && !readStoryIds.includes(currentStory.id)) {
      setReadStoryIds((prev) => [...prev, currentStory.id]);
    }

    const interval = 50; // Update every 50ms
    const totalTime = 5000; // 5s per story
    const step = (interval / totalTime) * 100;

    const timer = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          // Advance to next story or close
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex((curr) => (curr !== null ? curr + 1 : null));
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeStoryIndex, stories, readStoryIds]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setStoryProgress(0);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex !== null) {
      if (activeStoryIndex < stories.length - 1) {
        setActiveStoryIndex(activeStoryIndex + 1);
        setStoryProgress(0);
      } else {
        setActiveStoryIndex(null);
      }
    }
  };

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <div className="mb-10">
      {/* Horizontal Stories Carousel */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto py-2 px-1 no-scrollbar select-none">
        {stories.map((story, idx) => {
          const isRead = readStoryIds.includes(story.id);
          return (
            <button
              key={story.id}
              onClick={() => {
                setActiveStoryIndex(idx);
                setStoryProgress(0);
              }}
              className="flex flex-col items-center gap-1.5 group shrink-0 focus:outline-none"
            >
              {/* Instagram style gradient border ring */}
              <div
                className={`p-0.5 rounded-full transition-transform duration-200 group-hover:scale-105 ${
                  isRead
                    ? 'border-2 border-neutral-300 dark:border-neutral-700'
                    : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 shadow-xs'
                }`}
              >
                <div className="p-0.5 bg-white dark:bg-neutral-950 rounded-full">
                  <img
                    src={story.authorAvatar}
                    alt={story.authorName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 max-w-[70px] truncate text-center">
                {story.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fullscreen Story Viewer Modal */}
      {activeStory && (
        <div
          onClick={() => setActiveStoryIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col justify-between bg-neutral-900 text-white select-none"
          >
            {/* Background Texture Artwork */}
            <div className="absolute inset-0 pointer-events-none">
              <CoverArtwork
                theme={activeStory.theme}
                pattern="waves"
                category={activeStory.category}
                title={activeStory.title}
                aspectRatio="wide"
                className="w-full h-full opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/80" />
            </div>

            {/* Top Bar: Progress Bars + Author Info */}
            <div className="relative z-20 p-4 space-y-3">
              {/* Progress timer indicator */}
              <div className="flex gap-1.5 h-1">
                {stories.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex-1 bg-white/30 rounded-full overflow-hidden h-full"
                  >
                    <div
                      className="bg-white h-full transition-all duration-75"
                      style={{
                        width:
                          i < activeStoryIndex!
                            ? '100%'
                            : i === activeStoryIndex
                            ? `${storyProgress}%`
                            : '0%',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Author & Story Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeStory.authorAvatar}
                    alt={activeStory.authorName}
                    className="w-8 h-8 rounded-full border border-white/40 object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-semibold leading-tight">{activeStory.authorName}</h4>
                    <span className="text-[10px] text-neutral-300 font-mono">
                      {activeStory.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStoryIndex(null)}
                  className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Click Navigation Zones (Left for prev, Right for next) */}
            <div className="absolute inset-y-16 inset-x-0 z-10 flex">
              <div onClick={handlePrev} className="w-1/2 h-full cursor-pointer" />
              <div onClick={handleNext} className="w-1/2 h-full cursor-pointer" />
            </div>

            {/* Story Center Snippet */}
            <div className="relative z-20 px-6 my-auto text-center space-y-4">
              <div className="w-10 h-10 mx-auto rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <h3 className="font-editorial text-2xl font-bold tracking-tight text-white leading-snug">
                {activeStory.title}
              </h3>
              <p className="text-sm text-neutral-200 leading-relaxed font-editorial italic max-w-xs mx-auto">
                "{activeStory.snippet}"
              </p>
            </div>

            {/* Bottom Actions Bar */}
            <div className="relative z-20 p-4 pt-2 border-t border-white/10 flex items-center justify-between gap-3 bg-neutral-950/40 backdrop-blur-sm">
              {activeStory.postId && onSelectStoryArticle ? (
                <button
                  onClick={() => {
                    const pid = activeStory.postId!;
                    setActiveStoryIndex(null);
                    onSelectStoryArticle(pid);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-white text-neutral-900 text-xs font-semibold hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-xs text-neutral-400 font-mono">Chronicle Highlight</span>
              )}

              <button
                onClick={() => {
                  const curr = storyLikes[activeStory.id] || 0;
                  setStoryLikes({ ...storyLikes, [activeStory.id]: curr + 1 });
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-xs"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span className="font-mono text-[11px] tabular-nums">
                  {(storyLikes[activeStory.id] || 0) + 12}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
