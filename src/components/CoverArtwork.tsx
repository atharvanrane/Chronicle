import React from 'react';

interface CoverArtworkProps {
  theme?: 'stone' | 'slate' | 'amber' | 'emerald' | 'indigo' | 'rose';
  pattern?: 'mesh' | 'geometric' | 'dots' | 'waves';
  category?: string;
  title?: string;
  className?: string;
  aspectRatio?: 'video' | 'wide' | 'card';
}

export const CoverArtwork: React.FC<CoverArtworkProps> = ({
  theme = 'slate',
  pattern = 'geometric',
  category = 'Journal',
  title = '',
  className = '',
  aspectRatio = 'card',
}) => {
  // Theme color definitions for rich editorial textures
  const themeStyles = {
    slate: {
      bg: 'from-neutral-900 via-stone-900 to-zinc-950',
      accent: '#94a3b8',
      secondary: '#64748b',
      border: 'border-neutral-800/80',
      badge: 'text-neutral-300',
    },
    amber: {
      bg: 'from-amber-950/90 via-stone-900 to-neutral-950',
      accent: '#f59e0b',
      secondary: '#d97706',
      border: 'border-amber-900/40',
      badge: 'text-amber-200',
    },
    emerald: {
      bg: 'from-emerald-950/90 via-stone-900 to-neutral-950',
      accent: '#10b981',
      secondary: '#059669',
      border: 'border-emerald-900/40',
      badge: 'text-emerald-200',
    },
    indigo: {
      bg: 'from-indigo-950/90 via-slate-900 to-neutral-950',
      accent: '#6366f1',
      secondary: '#4f46e5',
      border: 'border-indigo-900/40',
      badge: 'text-indigo-200',
    },
    rose: {
      bg: 'from-rose-950/90 via-stone-900 to-neutral-950',
      accent: '#f43f5e',
      secondary: '#e11d48',
      border: 'border-rose-900/40',
      badge: 'text-rose-200',
    },
    stone: {
      bg: 'from-stone-900 via-stone-950 to-neutral-950',
      accent: '#a8a29e',
      secondary: '#78716c',
      border: 'border-stone-800',
      badge: 'text-stone-300',
    },
  }[theme];

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-[16/9]'
      : aspectRatio === 'wide'
      ? 'aspect-[21/9]'
      : 'aspect-[16/10]';

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${themeStyles.bg} ${themeStyles.border} ${aspectClass} ${className} flex flex-col justify-between p-6 select-none`}
    >
      {/* Background SVG Motif based on pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen" aria-hidden="true">
        {pattern === 'geometric' && (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="100%" y2="100%" stroke={themeStyles.accent} strokeWidth="1" strokeDasharray="4 8" />
            <line x1="100%" y1="0" x2="0" y2="100%" stroke={themeStyles.secondary} strokeWidth="0.8" />
            <circle cx="75%" cy="30%" r="90" stroke={themeStyles.accent} strokeWidth="1" fill="none" />
            <rect x="15%" y="45%" width="120" height="120" stroke={themeStyles.secondary} strokeWidth="1" fill="none" />
          </svg>
        )}

        {pattern === 'mesh' && (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id={`grad-${theme}`} cx="70%" cy="30%" r="60%">
                <stop offset="0%" stopColor={themeStyles.accent} stopOpacity="0.8" />
                <stop offset="100%" stopColor={themeStyles.secondary} stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill={`url(#grad-${theme})`} />
            <path
              d="M0,80 Q200,20 400,90 T800,60"
              fill="none"
              stroke={themeStyles.accent}
              strokeWidth="1.2"
              strokeDasharray="6 6"
            />
          </svg>
        )}

        {pattern === 'dots' && (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`dot-pat-${theme}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="1.5" fill={themeStyles.accent} opacity="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#dot-pat-${theme})`} />
            <circle cx="85%" cy="25%" r="70" stroke={themeStyles.accent} strokeWidth="1.5" fill="none" opacity="0.5" />
          </svg>
        )}

        {pattern === 'waves' && (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path
              d="M0 60 C 150 10, 300 120, 600 60 S 900 10, 1200 60"
              stroke={themeStyles.accent}
              strokeWidth="1.5"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M0 90 C 180 30, 350 140, 700 80 S 1000 30, 1200 90"
              stroke={themeStyles.secondary}
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
          </svg>
        )}
      </div>

      {/* Subtle organic light wash */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ backgroundColor: themeStyles.accent }}
      />

      {/* Top element: Category kicker & minimalist monogram */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest font-mono text-neutral-400">
          {category}
        </span>
        <div className="w-5 h-5 rounded-sm border border-neutral-700/80 flex items-center justify-center text-[10px] font-mono text-neutral-400">
          ⌘
        </div>
      </div>

      {/* Bottom element: Abstract watermark title fragment */}
      <div className="relative z-10 mt-auto">
        {title && (
          <p className="font-editorial text-sm sm:text-base font-light text-neutral-300 line-clamp-1 italic tracking-wide opacity-90">
            "{title}"
          </p>
        )}
      </div>
    </div>
  );
};
