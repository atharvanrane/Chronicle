import React, { useState, useEffect } from 'react';
import { X, Heart, ArrowRight, Sparkles, Plus, Send, Check } from 'lucide-react';
import { StoryItem } from '../types/blog';
import { CoverArtwork } from './CoverArtwork';
import { useAuth } from '../context/AuthContext';

interface StoriesBarProps {
  stories: StoryItem[];
  onSelectStoryArticle?: (postId: string) => void;
  onAddStory?: (story: StoryItem) => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  onSelectStoryArticle,
  onAddStory,
}) => {
  const { currentUser } = useAuth();
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyLikes, setStoryLikes] = useState<Record<string, number>>({});
  const [readStoryIds, setReadStoryIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Story Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSnippet, setNewSnippet] = useState('');
  const [newCategory, setNewCategory] = useState('Essays');
  const [newTheme, setNewTheme] = useState<'amber' | 'rose' | 'emerald' | 'indigo' | 'slate'>('rose');

  // Auto-timer for active story
  useEffect(() => {
    if (activeStoryIndex === null) {
      setStoryProgress(0);
      return;
    }

    const currentStory = stories[activeStoryIndex];
    if (currentStory && !readStoryIds.includes(currentStory.id)) {
      setReadStoryIds((prev) => [...prev, currentStory.id]);
    }

    const interval = 50;
    const totalTime = 5000;
    const step = (interval / totalTime) * 100;

    const timer = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
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

  const handleCreateStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !onAddStory) return;

    const createdStory: StoryItem = {
      id: `story-${Date.now()}`,
      title: newTitle.trim(),
      snippet: newSnippet.trim() || 'A quick thought from the writer.',
      authorName: currentUser?.displayName || 'Chronicle Writer',
      authorAvatar: currentUser?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(currentUser?.email || 'writer')}`,
      category: newCategory,
      theme: newTheme,
      isUnread: true,
    };

    onAddStory(createdStory);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewSnippet('');
  };

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <div className="mb-8">
      {/* Horizontal Stories Carousel (Instagram Signature Top Tray) */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto py-3 px-1 no-scrollbar select-none">
        {/* Item 0: Your Instant (Instagram style + badge) */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex flex-col items-center gap-1.5 group shrink-0 focus:outline-none"
        >
          <div className="relative">
            <div className="p-0.5 rounded-full border-2 border-neutral-200 dark:border-neutral-750 group-hover:border-neutral-400 dark:group-hover:border-neutral-500 transition-colors">
              <img
                src={currentUser?.photoURL || 'https://api.dicebear.com/7.x/identicon/svg?seed=you'}
                alt="Your Instant"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white dark:border-neutral-900 group-hover:scale-110 transition-transform">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 max-w-[70px] truncate text-center">
            Your Instant
          </span>
        </button>

        {/* Stories List with Instagram Rainbow Gradient Ring */}
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
              <div
                className={`p-0.5 rounded-full transition-transform duration-200 group-hover:scale-105 ${
                  isRead
                    ? 'border-2 border-neutral-300 dark:border-neutral-700'
                    : 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-xs'
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
              <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 max-w-[74px] truncate text-center">
                {story.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* CREATE STORY MODAL */}
      {isCreateModalOpen && (
        <div
          onClick={() => setIsCreateModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-editorial text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Share an Instant
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStorySubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Instant Title / Thought
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Late Night Writing Notes"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Short Thought / Quote (2-3 sentences)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share a quick idea, quote from your notebook, or question for readers..."
                  value={newSnippet}
                  onChange={(e) => setNewSnippet(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="Essays">Essays</option>
                    <option value="Design">Design</option>
                    <option value="Engineering">Engineering</option>
                    <option value="AI">AI</option>
                    <option value="Culture">Culture</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Color Theme
                  </label>
                  <select
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="rose">Rose</option>
                    <option value="amber">Amber</option>
                    <option value="emerald">Emerald</option>
                    <option value="indigo">Indigo</option>
                    <option value="slate">Slate</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 transition-opacity shadow-sm flex items-center justify-center gap-1.5 pt-2"
              >
                <span>Share to Instants</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN STORY VIEWER MODAL */}
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
                  <span>Read Full Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-xs text-neutral-400 font-mono">Chronicle Stories</span>
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
