import React, { useState } from 'react';
import {
  PenSquare,
  Sparkles,
  Bookmark,
  Sun,
  Moon,
  Menu,
  X,
  Compass,
  LayoutDashboard,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Heart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentView: 'home' | 'editor' | 'studio' | 'admin' | 'post';
  onNavigate: (view: 'home' | 'editor' | 'studio' | 'admin') => void;
  onOpenReadingList: () => void;
  onOpenAiChat: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  readingListCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenReadingList,
  onOpenAiChat,
  onOpenAuth,
  onOpenProfile,
  onOpenNotifications,
  unreadNotificationsCount,
  readingListCount,
  darkMode,
  onToggleDarkMode,
}) => {
  const { currentUser, isAdmin, isCreator, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors whitespace-nowrap py-1 relative hover:text-neutral-900 dark:hover:text-white ${
              currentView === 'home'
                ? 'text-neutral-900 dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neutral-900 dark:after:bg-white'
                : ''
            }`}
          >
            Blogs
          </button>

          {isCreator && (
            <button
              onClick={() => onNavigate('studio')}
              className={`transition-colors whitespace-nowrap py-1 relative hover:text-neutral-900 dark:hover:text-white ${
                currentView === 'studio'
                  ? 'text-neutral-900 dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neutral-900 dark:after:bg-white'
                  : ''
              }`}
            >
              Studio
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-1.5 text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 transition-colors whitespace-nowrap py-1 font-semibold ${
                currentView === 'admin'
                  ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600'
                  : ''
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Controls</span>
            </button>
          )}

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
            onClick={onOpenAiChat}
            className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap py-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Copilot</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action + theme toggle + user account menu */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
            aria-label="Toggle theme"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>

          {/* Instagram Activity / Notification Heart Button */}
          {currentUser && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
              title="Activity & Follow Requests"
            >
              <Heart className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          )}

          {isCreator && (
            <button
              onClick={() => {
                onNavigate('editor');
                setMobileMenuOpen(false);
              }}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide text-white dark:text-neutral-900 bg-neutral-900 dark:bg-white rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Write Blog</span>
            </button>
          )}

          {/* User Account / Login Avatar */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors focus:outline-none"
              >
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 hidden lg:inline max-w-[90px] truncate">
                  {currentUser.displayName}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl py-2 z-50 text-xs"
                >
                  <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {currentUser.displayName}
                    </p>
                    <p className="text-[11px] font-mono text-neutral-400">
                      @{currentUser.username} · {currentUser.role}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onOpenProfile();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin Controls</span>
                    </button>
                  )}

                  <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              Sign In
            </button>
          )}

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
              <span>Explore Blogs</span>
            </button>

            {isCreator && (
              <button
                onClick={() => {
                  onNavigate('studio');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-left"
              >
                <LayoutDashboard className="w-4 h-4 text-neutral-500" />
                <span>Studio & Post Management</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-700 dark:text-amber-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-left"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Moderation Console</span>
              </button>
            )}

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
                onOpenAiChat();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-left"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Writing & Editorial Copilot</span>
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            {currentUser ? (
              <button
                onClick={() => {
                  onOpenProfile();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-xs font-medium"
              >
                <span>Profile: @{currentUser.username}</span>
                <span className="font-mono text-neutral-400">{currentUser.role}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              >
                Sign In / Register
              </button>
            )}

            {isCreator && (
              <button
                onClick={() => {
                  onNavigate('editor');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white dark:text-neutral-900 bg-neutral-900 dark:bg-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <PenSquare className="w-4 h-4" />
                <span>Write New Blog</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
