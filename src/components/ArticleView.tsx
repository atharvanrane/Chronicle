import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Heart,
  Share2,
  Sparkles,
  Type,
  Check,
  MessageSquare,
  Send,
  Calendar,
  Clock,
  ExternalLink,
  Flag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Post, CommentItem } from '../types/blog';
import { CoverArtwork } from './CoverArtwork';

interface ArticleViewProps {
  post: Post;
  onBack: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (post: Post) => void;
  onUpdateClaps: (postId: string, newClaps: number) => void;
  onAddComment: (postId: string, comment: CommentItem) => void;
  onOpenAiAssistantWithContext: (post: Post) => void;
  onReportPost?: (post: Post) => void;
  allPosts: Post[];
  onSelectPost: (post: Post) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  post,
  onBack,
  isBookmarked,
  onToggleBookmark,
  onUpdateClaps,
  onAddComment,
  onOpenAiAssistantWithContext,
  onReportPost,
  allPosts,
  onSelectPost,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [claps, setClaps] = useState(post.claps);
  const [hasClapped, setHasClapped] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [copiedLink, setCopiedLink] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>(post.comments || []);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Sync scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle claps with micro-animation & confetti
  const handleClap = () => {
    const nextClaps = claps + 1;
    setClaps(nextClaps);
    setHasClapped(true);
    onUpdateClaps(post.id, nextClaps);

    confetti({
      particleCount: 28,
      spread: 60,
      origin: { y: 0.85, x: 0.5 },
      colors: ['#f59e0b', '#e11d48', '#6366f1'],
    });
  };

  // Handle sharing
  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.subtitle,
          url: shareUrl,
        });
      } catch {
        // User cancelled or not supported
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Handle comment submit
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setSubmittingComment(true);
    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      authorName: newCommentName.trim() || 'Reader',
      authorAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
        newCommentName || 'Reader'
      )}`,
      content: newCommentText.trim(),
      createdAt: 'Just now',
      likes: 0,
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    onAddComment(post.id, newComment);
    setNewCommentText('');
    setSubmittingComment(false);
  };

  // Find related stories
  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 2);

  // Render markdown text cleanly without heavy extra dependencies
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="my-6 p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-sm overflow-x-auto border border-neutral-800"
            >
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // H2 Heading
      if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={index}
            className="font-editorial text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-10 mb-4 tracking-tight"
          >
            {line.replace('## ', '')}
          </h2>
        );
        return;
      }

      // H3 Heading
      if (line.startsWith('### ')) {
        elements.push(
          <h3
            key={index}
            className="font-editorial text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mt-8 mb-3"
          >
            {line.replace('### ', '')}
          </h3>
        );
        return;
      }

      // Blockquote
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={index}
            className="my-8 px-6 py-4 border-l-2 border-amber-600 dark:border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 rounded-r-xl italic text-lg sm:text-xl font-editorial text-neutral-800 dark:text-neutral-200"
          >
            {line.replace('> ', '')}
          </blockquote>
        );
        return;
      }

      // Ordered list item
      if (/^\d+\.\s/.test(line)) {
        elements.push(
          <li key={index} className="ml-6 list-decimal pl-1 mb-2 text-neutral-700 dark:text-neutral-300">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
        return;
      }

      // Unordered list item
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={index} className="ml-6 list-disc pl-1 mb-2 text-neutral-700 dark:text-neutral-300">
            {line.replace(/^[-*]\s/, '')}
          </li>
        );
        return;
      }

      // Blank line
      if (!line.trim()) {
        return;
      }

      // Regular Paragraph with inline formatting
      elements.push(
        <p
          key={index}
          className="mb-5 leading-relaxed text-neutral-800 dark:text-neutral-200"
        >
          {line}
        </p>
      );
    });

    return elements;
  };

  return (
    <article className="min-h-screen pb-20">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Utility Bar */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 py-2.5 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Stories</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Font family toggle */}
            <button
              onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
              className="p-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-800 flex items-center gap-1"
              title="Toggle Serif / Sans font"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="font-mono hidden sm:inline">
                {fontFamily === 'serif' ? 'Serif' : 'Sans'}
              </span>
            </button>

            {/* Font size toggle */}
            <button
              onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
              className="px-2 py-1 text-xs font-mono text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-800"
              title="Toggle Text Size"
            >
              {fontSize === 'normal' ? 'A+' : 'A-'}
            </button>

            {/* Bookmark */}
            <button
              onClick={() => onToggleBookmark(post)}
              className={`p-1.5 rounded border transition-colors ${
                isBookmarked
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border-neutral-200 dark:border-neutral-800'
              }`}
              title={isBookmarked ? 'Saved to reading list' : 'Save story'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-800 flex items-center gap-1"
              title="Share article"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedLink && <span className="text-[10px] text-emerald-600 font-mono">Copied</span>}
            </button>

            {/* Report */}
            {onReportPost && (
              <button
                onClick={() => onReportPost(post)}
                className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-rose-600 rounded border border-neutral-200 dark:border-neutral-800 flex items-center gap-1"
                title="Report offensive content to admins"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Ask AI Reader Assistant */}
            <button
              onClick={() => onOpenAiAssistantWithContext(post)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              title="Ask AI about this article"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Article Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        {/* Header Metadata: Zero-Pill Unboxed */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-4">
          <span className="text-amber-700 dark:text-amber-400 uppercase tracking-wider font-semibold">
            {post.category}
          </span>
          <span aria-hidden="true">·</span>
          <span>{post.readTimeMinutes} min read</span>
          <span aria-hidden="true">·</span>
          <span>{post.publishedAt}</span>
        </div>

        {/* Title */}
        <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-[1.18] text-balance mb-6">
          {post.title}
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed mb-8">
          {post.subtitle}
        </p>

        {/* Author lockup */}
        <div className="flex items-center justify-between py-5 border-y border-neutral-200 dark:border-neutral-800 mb-10">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
            />
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {post.author.name}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {post.author.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClap}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono tabular-nums transition-all ${
                hasClapped
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-300 dark:border-rose-800'
                  : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-rose-300'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 text-rose-500 ${hasClapped ? 'fill-current' : ''}`} />
              <span>{claps}</span>
            </button>
          </div>
        </div>

        {/* Editorial Cover Motif */}
        <div className="mb-12 rounded-xl overflow-hidden border border-neutral-200/90 dark:border-neutral-800">
          <CoverArtwork
            theme={post.coverStyle.theme}
            pattern={post.coverStyle.pattern}
            category={post.category}
            title={post.title}
            aspectRatio="video"
          />
        </div>

        {/* Article Body */}
        <div
          className={`prose-neutral dark:prose-invert leading-relaxed ${
            fontFamily === 'serif' ? 'font-editorial' : 'font-sans'
          } ${fontSize === 'large' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}
        >
          {renderMarkdown(post.content)}
        </div>

        {/* AI Insight Box: Interactive reader affordance */}
        <div className="my-12 p-6 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Article Companion</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">Chronicle Copilot</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Have questions about this piece or need a quick synopsis? Ask our embedded AI assistant to unpack the thesis, generate counterarguments, or explain key terms.
          </p>
          <button
            onClick={() => onOpenAiAssistantWithContext(post)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            <span>Ask questions about this post</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tags list: Unboxed editorial text */}
        <div className="pt-6 pb-8 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">Topics:</span>
          {post.tags.map((tag, i) => (
            <React.Fragment key={tag}>
              <span className="hover:text-amber-600 transition-colors">#{tag}</span>
              {i < post.tags.length - 1 && <span aria-hidden="true">·</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Author Bio Section */}
        <div className="py-8 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start gap-4">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
          />
          <div className="space-y-1">
            <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Written by {post.author.name}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {post.author.role}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 pt-1 leading-relaxed">
              {post.author.bio}
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <section className="py-10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-neutral-400" />
              <span>Discussion ({comments.length})</span>
            </h3>
          </div>

          {/* New Comment Input */}
          <form
            onSubmit={handleCommentSubmit}
            className="p-4 rounded-xl bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-3"
          >
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Your name"
                value={newCommentName}
                onChange={(e) => setNewCommentName(e.target.value)}
                className="w-1/3 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <textarea
              rows={3}
              placeholder="What are your thoughts on this essay?"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingComment || !newCommentText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-40 transition-opacity"
              >
                <span>Publish Comment</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>

          {/* Comment list */}
          <div className="space-y-4 pt-2">
            {comments.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={c.authorAvatar}
                      alt={c.authorName}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {c.authorName}
                    </span>
                  </div>
                  <span className="font-mono text-neutral-400">{c.createdAt}</span>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {c.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Stories */}
        {relatedPosts.length > 0 && (
          <section className="pt-10 border-t border-neutral-200 dark:border-neutral-800">
            <h3 className="font-editorial text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              More from {post.category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <div
                  key={related.id}
                  onClick={() => onSelectPost(related)}
                  className="group cursor-pointer p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors space-y-2"
                >
                  <div className="text-[11px] font-mono text-neutral-400">
                    {related.readTimeMinutes} min read
                  </div>
                  <h4 className="font-editorial font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 transition-colors line-clamp-2">
                    {related.title}
                  </h4>
                  <p className="text-xs text-neutral-500 line-clamp-2">{related.subtitle}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
};
