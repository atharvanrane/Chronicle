import React from 'react';
import { Sparkles, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  onOpenAiChat: () => void;
  onNavigate: (view: 'home' | 'editor' | 'studio' | 'admin') => void;
  onOpenAuth: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAiChat,
  onNavigate,
  onOpenAuth,
}) => {
  const { currentUser, isAdmin } = useAuth();

  return (
    <footer className="mt-20 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-editorial font-bold text-sm">
                C
              </div>
              <span className="font-editorial text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                CHRONICLE
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              An independent publication and modern editorial studio exploring the craft of digital systems, architecture, and enduring design.
            </p>
          </div>

          {/* Navigation Col */}
          <div className="space-y-2">
            <h4 className="font-mono text-xs uppercase tracking-wider text-neutral-400">
              Explore
            </h4>
            <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  All Stories & Articles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('studio')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Author Studio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('editor')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Write New Story
                </button>
              </li>
            </ul>
          </div>

          {/* Account & Administration */}
          <div className="space-y-2">
            <h4 className="font-mono text-xs uppercase tracking-wider text-neutral-400">
              Community & Account
            </h4>
            <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
              {currentUser ? (
                <>
                  <li className="text-neutral-800 dark:text-neutral-200 font-mono">
                    Logged in: @{currentUser.username}
                  </li>
                  {isAdmin && (
                    <li>
                      <button
                        onClick={() => onNavigate('admin')}
                        className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 hover:underline font-semibold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin Moderation Console</span>
                      </button>
                    </li>
                  )}
                </>
              ) : (
                <li>
                  <button onClick={onOpenAuth} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Sign In / Register
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Intelligence & SEO */}
          <div className="space-y-2">
            <h4 className="font-mono text-xs uppercase tracking-wider text-neutral-400">
              AI Intelligence
            </h4>
            <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <button onClick={onOpenAiChat} className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Chronicle Copilot</span>
                </button>
              </li>
              <li>
                <span className="text-neutral-500">Real-time SEO Suggestions</span>
              </li>
              <li>
                <span className="text-neutral-500">Interactive Reader Q&A</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quiet Copyright Strip */}
        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-850 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2 font-mono">
          <div>
            © {new Date().getFullYear()} Chronicle Publishing Studio. All rights reserved.
          </div>
          <div>
            Designed with quiet discipline and aesthetic craft.
          </div>
        </div>
      </div>
    </footer>
  );
};
