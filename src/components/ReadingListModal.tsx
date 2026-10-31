import React from 'react';
import { X, Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { Post } from '../types/blog';

interface ReadingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPosts: Post[];
  onSelectPost: (post: Post) => void;
  onRemoveBookmark: (postId: string) => void;
  onClearAll: () => void;
}

export const ReadingListModal: React.FC<ReadingListModalProps> = ({
  isOpen,
  onClose,
  savedPosts,
  onSelectPost,
  onRemoveBookmark,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-850/50">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-4 h-4 text-amber-600 fill-amber-600" />
            <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Saved Reading List ({savedPosts.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {savedPosts.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs font-mono text-neutral-400 hover:text-rose-500 transition-colors mr-2"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {savedPosts.length > 0 ? (
            savedPosts.map((post) => (
              <div
                key={post.id}
                className="group p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850/40 transition-colors flex items-center justify-between gap-4"
              >
                <div
                  onClick={() => {
                    onSelectPost(post);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer space-y-1"
                >
                  <div className="text-[11px] font-mono text-neutral-400">
                    <span>{post.category}</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span>{post.readTimeMinutes} min read</span>
                  </div>
                  <h4 className="font-editorial text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 transition-colors line-clamp-1">
                    {post.title}
                  </h4>
                  <p className="text-xs text-neutral-500 line-clamp-1">{post.subtitle}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onRemoveBookmark(post.id)}
                    className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectPost(post);
                      onClose();
                    }}
                    className="p-2 text-neutral-900 dark:text-neutral-100 group-hover:translate-x-0.5 transition-transform"
                    title="Read article"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center space-y-3">
              <Bookmark className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto" />
              <p className="text-sm text-neutral-500">Your reading list is empty.</p>
              <p className="text-xs text-neutral-400">
                Click the bookmark icon on any article card to save stories for later reading.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
