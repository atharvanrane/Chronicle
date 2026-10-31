import React, { useState } from 'react';
import { PenSquare, Sparkles, Bookmark, Rocket, Sun, Moon, Menu, X, Compass, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'editor' | 'studio' | 'post';
  onNavigate: (view: 'home' | 'editor' | 'studio') => void;
  onOpenReadingList: () => void;
  onOpenDeployGuide: () => void;
  onOpenAiChat: () => void;
  readingListCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenReadingList,
  onOpenDeployGuide,
  onOpenAiChat,
  readingListCount,
  darkMode,
  onToggleDarkMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            onNavigate('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-editorial font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            C
          </div>
          <span className="font-editorial text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 whitespace-nowrap">
            CHRONICLE
          </span>
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors whitespace-nowrap py-1 relative hover:text-neutral-900 dark:hover:text-white ${
              currentView === 'home'
                ? 'text-neutral-900 dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neutral-900 dark:after:bg-white'
                : ''
            }`}
          >
            Stories
          </button>

          <button
            onClick={() => onNavigate('studio')}
            className={`transition-colors whitespace-nowrap py-1 relative hover:text-neutral-900 dark:hover:text-white ${
              currentView === 'studio'
                ? 'text-neutral-900 dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neutral-900 dark:after:bg-white'
                : ''
            }`}
          >
            Studio & Posts
          </button>

          <button
            onClick={onOpenReadingList}
            className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap py-1"
          >
            <span>Saved</span>
            {readingListCount > 0 && (
              <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                ({readingListCount})
              </span>
            )}
          </button>

          <button
            onClick={onOpenDeployGuide}
            className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 transition-colors whitespace-nowrap py-1 font-medium"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Host on Vercel</span>
          </button>

          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap py-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Copilot</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action + theme toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
            aria-label="Toggle theme"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              onNavigate('editor');
              setMobileMenuOpen(false);
            }}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide text-white dark:text-neutral-900 bg-neutral-900 dark:bg-white rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span>Write Story</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-left"
            >
              <Compass className="w-4 h-4 text-neutral-500" />
              <span>Explore Stories</span>
            </button>

            <button
              onClick={() => {
                onNavigate('studio');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-left"
            >
              <LayoutDashboard className="w-4 h-4 text-neutral-500" />
              <span>Studio & CMS Management</span>
            </button>

            <button
              onClick={() => {
                onOpenReadingList();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-left"
            >
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4 text-neutral-500" />
                <span>Saved Reading List</span>
              </div>
              {readingListCount > 0 && (
                <span className="font-mono text-xs text-neutral-400">({readingListCount})</span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenDeployGuide();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-left"
            >
              <Rocket className="w-4 h-4" />
              <span>Free Vercel Deployment Guide</span>
            </button>

            <button
              onClick={() => {
                onOpenAiChat();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-left"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Writing & Editorial Copilot</span>
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={() => {
                onNavigate('editor');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white dark:text-neutral-900 bg-neutral-900 dark:bg-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <PenSquare className="w-4 h-4" />
              <span>Write New Story</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
