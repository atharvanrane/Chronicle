import React, { useState, useEffect } from 'react';
import {
  Save,
  ArrowLeft,
  Sparkles,
  Search,
  Eye,
  Columns,
  Check,
  RefreshCw,
  Tag,
  Sliders,
  AlertCircle,
  HelpCircle,
  Copy,
  PenTool,
  Wand2,
  FileText,
  Key,
} from 'lucide-react';
import { Post, PostCategory, SeoAnalysisResponse } from '../types/blog';
import { CoverArtwork } from './CoverArtwork';

interface PostEditorProps {
  initialPost?: Post | null;
  onSave: (post: Post) => void;
  onCancel: () => void;
  openAiApiKey?: string;
  onUpdateOpenAiApiKey?: (key: string) => void;
}

export const PostEditor: React.FC<PostEditorProps> = ({
  initialPost,
  onSave,
  onCancel,
  openAiApiKey = '',
  onUpdateOpenAiApiKey,
}) => {
  const [title, setTitle] = useState(initialPost?.title || '');
  const [subtitle, setSubtitle] = useState(initialPost?.subtitle || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [category, setCategory] = useState<PostCategory>(initialPost?.category || 'Engineering');
  const [tags, setTags] = useState<string[]>(initialPost?.tags || ['publishing', 'craft']);
  const [tagInput, setTagInput] = useState('');
  const [coverTheme, setCoverTheme] = useState<'stone' | 'slate' | 'amber' | 'emerald' | 'indigo' | 'rose'>(
    initialPost?.coverStyle?.theme || 'slate'
  );
  const [coverPattern, setCoverPattern] = useState<'geometric' | 'mesh' | 'dots' | 'waves'>(
    initialPost?.coverStyle?.pattern || 'geometric'
  );
  const [status, setStatus] = useState<'published' | 'draft' | 'scheduled'>(
    initialPost?.status === 'archived' ? 'draft' : (initialPost?.status || 'published')
  );
  const [authorName, setAuthorName] = useState(initialPost?.author?.name || 'Alexander Wright');
  const [authorRole, setAuthorRole] = useState(initialPost?.author?.role || 'Senior Essayist & Editor');

  // View state: split vs edit-only vs preview-only
  const [editorMode, setEditorMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');

  // AI & SEO states
  const [isAnalyzingSeo, setIsAnalyzingSeo] = useState(false);
  const [seoResult, setSeoResult] = useState<SeoAnalysisResponse | null>(null);
  const [seoTargetKeywords, setSeoTargetKeywords] = useState('');
  const [aiLoadingAction, setAiLoadingAction] = useState<string | null>(null);
  const [aiNotification, setAiNotification] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string>('Just now');
  const [userCustomOpenAiKey, setUserCustomOpenAiKey] = useState(openAiApiKey);
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  // Compute live metrics
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 220));

  // Local storage auto-save draft
  useEffect(() => {
    const timer = setInterval(() => {
      if (title || content) {
        localStorage.setItem(
          'chronicle_draft_backup',
          JSON.stringify({ title, subtitle, content, category, tags, updatedAt: new Date().toISOString() })
        );
        const now = new Date();
        setLastSaved(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [title, subtitle, content, category, tags]);

  // Tag helper
  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Insert markdown helpers
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('post-content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + (selected || 'text') + suffix;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected || 'text').length);
    }, 10);
  };

  // Run AI SEO Analysis
  const handleAnalyzeSeo = async () => {
    setIsAnalyzingSeo(true);
    try {
      const res = await fetch('/api/ai/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          targetKeywords: seoTargetKeywords,
          customOpenAIKey: userCustomOpenAiKey || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('SEO analysis request failed');
      }

      const data = await res.json();
      setSeoResult(data);
      setActiveTab('seo');
    } catch (err: any) {
      console.error('SEO audit error:', err);
      setAiNotification('Could not complete SEO audit. Please check server or network connection.');
      setTimeout(() => setAiNotification(null), 4000);
    } finally {
      setIsAnalyzingSeo(false);
    }
  };

  // AI Editor Assistant actions
  const handleAiAction = async (action: 'outline' | 'enhance' | 'summarize' | 'generate-tags' | 'generate-post') => {
    setAiLoadingAction(action);
    try {
      const res = await fetch('/api/ai/editor-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          title: title || 'Thoughtful Software and Modern Design',
          content,
        }),
      });

      const data = await res.json();

      if (action === 'generate-tags') {
        if (data.category) setCategory(data.category);
        if (Array.isArray(data.tags)) setTags(data.tags);
        setAiNotification('Suggested category and tags applied!');
      } else if (action === 'outline') {
        setContent(data.result);
        setAiNotification('Article outline generated!');
      } else if (action === 'generate-post') {
        setContent(data.result);
        setAiNotification('Starter draft drafted!');
      } else if (action === 'enhance') {
        setContent(data.result);
        setAiNotification('Content refined and polished!');
      } else if (action === 'summarize') {
        setSubtitle(data.result.split('\n')[0].replace(/^[-*•]\s*/, ''));
        setContent((prev) => `> **Executive Summary:**\n${data.result}\n\n---\n\n${prev}`);
        setAiNotification('Summary appended to top of post!');
      }

      setTimeout(() => setAiNotification(null), 3500);
    } catch (err) {
      console.error('AI assistant error:', err);
      setAiNotification('Action failed. Please try again.');
      setTimeout(() => setAiNotification(null), 3500);
    } finally {
      setAiLoadingAction(null);
    }
  };

  // Save handler
  const handleSavePost = () => {
    if (!title.trim()) {
      alert('Please provide an article title before saving.');
      return;
    }

    const postToSave: Post = {
      id: initialPost?.id || `post-${Date.now()}`,
      slug: (title || 'untitled')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''),
      title: title.trim(),
      subtitle: subtitle.trim() || 'A thoughtful essay on design, craft, and technology.',
      content: content.trim(),
      category,
      tags: tags.length > 0 ? tags : ['writing'],
      coverStyle: {
        theme: coverTheme,
        pattern: coverPattern,
      },
      author: {
        name: authorName,
        role: authorRole,
        avatar:
          initialPost?.author?.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: initialPost?.author?.bio || 'Essayist and writer in the Chronicle community.',
      },
      publishedAt: initialPost?.publishedAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      status,
      readTimeMinutes,
      claps: initialPost?.claps || 0,
      likesCount: initialPost?.likesCount || initialPost?.claps || 0,
      likedByUsers: initialPost?.likedByUsers || [],
      views: initialPost?.views || 1,
      isFeatured: initialPost?.isFeatured || false,
      seo: seoResult
        ? {
            metaTitle: seoResult.metaTitle,
            metaDescription: seoResult.metaDescription,
            primaryKeywords: seoResult.primaryKeywords,
            seoScore: seoResult.seoScore,
            readability: seoResult.readability,
            socialSnippet: seoResult.socialSnippet,
            headlineSuggestions: seoResult.headlineSuggestions,
            strengths: seoResult.strengths,
            improvements: seoResult.improvements,
          }
        : initialPost?.seo,
      comments: initialPost?.comments || [],
    };

    onSave(postToSave);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-24">
      {/* Top action header bar */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Return without saving"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100 hidden sm:inline">
              {initialPost ? 'Edit Post' : 'New Story'}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
              <span>Autosaved at</span>
              <span>{lastSaved}</span>
            </div>
          </div>

          {/* Center: Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'content'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'seo'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-amber-500" />
              <span>SEO Intelligence</span>
              {seoResult && (
                <span className="font-mono text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1 rounded">
                  {seoResult.seoScore}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Publish Settings
            </button>
          </div>

          {/* Right actions: Publish / Save */}
          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="text-xs font-medium rounded-lg px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="published">Status: Published</option>
              <option value="draft">Status: Draft</option>
              <option value="scheduled">Status: Scheduled</option>
            </select>

            <button
              onClick={handleSavePost}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-sm active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Publish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Temporary AI Notification Banner */}
      {aiNotification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <div className="px-4 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{aiNotification}</span>
            </div>
            <button onClick={() => setAiNotification(null)} className="text-amber-600 hover:text-amber-900 font-mono">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* TAB 1: CONTENT EDITOR */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* AI Assistant Quick Toolbar */}
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Writing Copilot:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  disabled={aiLoadingAction !== null}
                  onClick={() => handleAiAction('outline')}
                  className="px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors disabled:opacity-50"
                  title="Generate article outline based on title"
                >
                  {aiLoadingAction === 'outline' ? 'Generating Outline...' : '✦ Generate Outline'}
                </button>

                <button
                  disabled={aiLoadingAction !== null || !title}
                  onClick={() => handleAiAction('generate-post')}
                  className="px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors disabled:opacity-50"
                  title="Generate a starter draft from title"
                >
                  {aiLoadingAction === 'generate-post' ? 'Drafting...' : '✦ Draft Article'}
                </button>

                <button
                  disabled={aiLoadingAction !== null || !content}
                  onClick={() => handleAiAction('enhance')}
                  className="px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors disabled:opacity-50"
                  title="Polish flow and vocabulary"
                >
                  {aiLoadingAction === 'enhance' ? 'Polishing...' : '✦ Polish & Elevate'}
                </button>

                <button
                  disabled={aiLoadingAction !== null || !content}
                  onClick={() => handleAiAction('generate-tags')}
                  className="px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors disabled:opacity-50"
                  title="Auto-classify category and tags"
                >
                  {aiLoadingAction === 'generate-tags' ? 'Classifying...' : '✦ Auto Tags'}
                </button>

                <button
                  disabled={aiLoadingAction !== null || !content}
                  onClick={() => handleAiAction('summarize')}
                  className="px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors disabled:opacity-50"
                  title="Generate TL;DR summary"
                >
                  {aiLoadingAction === 'summarize' ? 'Summarizing...' : '✦ Add TL;DR'}
                </button>

                <button
                  onClick={handleAnalyzeSeo}
                  disabled={isAnalyzingSeo}
                  className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isAnalyzingSeo ? 'Analyzing...' : 'Audit SEO'}</span>
                </button>
              </div>
            </div>

            {/* Title & Subtitle inputs */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
              <input
                type="text"
                placeholder="Story Title (e.g. The Architecture of Calm Interfaces)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full font-editorial text-2xl sm:text-4xl font-bold bg-transparent text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none tracking-tight"
              />

              <input
                type="text"
                placeholder="Story Subtitle / Hook (e.g. Why the quietest tools carry the greatest enduring power)"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full text-base sm:text-lg bg-transparent text-neutral-600 dark:text-neutral-300 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none"
              />

              {/* Word & Read Time Count Bar */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 font-mono">
                <div className="flex items-center gap-3">
                  <span>{wordCount} words</span>
                  <span aria-hidden="true">·</span>
                  <span>{charCount} characters</span>
                  <span aria-hidden="true">·</span>
                  <span>~{readTimeMinutes} min read</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditorMode('edit')}
                    className={`px-2 py-1 rounded text-xs ${
                      editorMode === 'edit' ? 'bg-neutral-200 dark:bg-neutral-700 font-semibold' : ''
                    }`}
                  >
                    Edit Only
                  </button>
                  <button
                    onClick={() => setEditorMode('split')}
                    className={`px-2 py-1 rounded text-xs hidden md:inline ${
                      editorMode === 'split' ? 'bg-neutral-200 dark:bg-neutral-700 font-semibold' : ''
                    }`}
                  >
                    Split View
                  </button>
                  <button
                    onClick={() => setEditorMode('preview')}
                    className={`px-2 py-1 rounded text-xs ${
                      editorMode === 'preview' ? 'bg-neutral-200 dark:bg-neutral-700 font-semibold' : ''
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>

            {/* Markdown Quick Toolbar */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
              <button
                onClick={() => insertMarkdown('**', '**')}
                className="px-2.5 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold"
                title="Bold"
              >
                B
              </button>
              <button
                onClick={() => insertMarkdown('*', '*')}
                className="px-2.5 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 italic"
                title="Italic"
              >
                I
              </button>
              <span className="text-neutral-300 dark:text-neutral-700">|</span>
              <button
                onClick={() => insertMarkdown('## ')}
                className="px-2.5 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold font-mono"
                title="Heading 2"
              >
                H2
              </button>
              <button
                onClick={() => insertMarkdown('### ')}
                className="px-2.5 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold font-mono"
                title="Heading 3"
              >
                H3
              </button>
              <span className="text-neutral-300 dark:text-neutral-700">|</span>
              <button
                onClick={() => insertMarkdown('> ')}
                className="px-2.5 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="Blockquote"
              >
                Quote
              </button>
              <button
                onClick={() => insertMarkdown('`', '`')}
                className="px-2.5 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 font-mono"
                title="Inline Code"
              >
                Code
              </button>
              <button
                onClick={() => insertMarkdown('```typescript\n', '\n```')}
                className="px-2.5 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 font-mono"
                title="Code Block"
              >
                Block
              </button>
              <span className="text-neutral-300 dark:text-neutral-700">|</span>
              <button
                onClick={() => insertMarkdown('- ')}
                className="px-2.5 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="Bulleted list"
              >
                List
              </button>
              <button
                onClick={() => insertMarkdown('1. ')}
                className="px-2.5 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="Numbered list"
              >
                1. 2. 3.
              </button>
              <button
                onClick={() => insertMarkdown('\n\n---\n\n')}
                className="px-2.5 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="Horizontal Divider"
              >
                Divider
              </button>
            </div>

            {/* Split Editor / Preview Area */}
            <div className={`grid gap-6 ${editorMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Left Column: Markdown Input */}
              {(editorMode === 'split' || editorMode === 'edit') && (
                <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 flex flex-col">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800 text-xs font-mono text-neutral-500">
                    <span>Markdown Content Pane</span>
                    <span>Standard GFM</span>
                  </div>
                  <textarea
                    id="post-content-textarea"
                    rows={20}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your story here in markdown... You can use headings (##), quotes (>), lists, and code blocks."
                    className="w-full flex-1 bg-transparent text-neutral-800 dark:text-neutral-200 font-mono text-sm leading-relaxed focus:outline-none resize-y min-h-[420px]"
                  />
                </div>
              )}

              {/* Right Column: Live Rendered Preview */}
              {(editorMode === 'split' || editorMode === 'preview') && (
                <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 overflow-y-auto max-h-[640px]">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100 dark:border-neutral-800 text-xs font-mono text-neutral-500">
                    <span>Live Typography Preview</span>
                    <span>Editorial Layout</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                      <span>{category}</span>
                      <span>·</span>
                      <span>{readTimeMinutes} min read</span>
                    </div>

                    <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                      {title || 'Story Title Preview'}
                    </h1>

                    {subtitle && (
                      <p className="text-neutral-600 dark:text-neutral-400 italic text-base">
                        {subtitle}
                      </p>
                    )}

                    <div className="my-6">
                      <CoverArtwork
                        theme={coverTheme}
                        pattern={coverPattern}
                        category={category}
                        title={title}
                        aspectRatio="video"
                      />
                    </div>

                    <div className="prose-neutral dark:prose-invert font-editorial text-base leading-relaxed space-y-4 text-neutral-800 dark:text-neutral-200">
                      {content ? (
                        content.split('\n\n').map((para, i) => {
                          if (para.startsWith('## ')) {
                            return (
                              <h2 key={i} className="font-bold text-xl text-neutral-900 dark:text-neutral-100 mt-6 mb-2">
                                {para.replace('## ', '')}
                              </h2>
                            );
                          }
                          if (para.startsWith('> ')) {
                            return (
                              <blockquote
                                key={i}
                                className="px-4 py-2 border-l-2 border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 italic"
                              >
                                {para.replace('> ', '')}
                              </blockquote>
                            );
                          }
                          return <p key={i}>{para}</p>;
                        })
                      ) : (
                        <p className="text-neutral-400 italic">Story body preview will render here as you write...</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SEO INTELLIGENCE & AUDIT (GPT-4 / Gemini powered) */}
        {activeTab === 'seo' && (
          <div className="space-y-8">
            {/* Header & Target Keyword Input */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-editorial text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Search className="w-5 h-5 text-amber-500" />
                    <span>AI SEO Intelligence & Click-Through Optimization</span>
                  </h2>
                  <p className="text-sm text-neutral-500 pt-1">
                    Analyzes content depth, readability index, headline magnetism, and meta tag optimization.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowKeyConfig(!showKeyConfig)}
                    className="p-2 text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-800 flex items-center gap-1.5"
                    title="Configure custom OpenAI or Gemini key"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Provider Settings</span>
                  </button>

                  <button
                    onClick={handleAnalyzeSeo}
                    disabled={isAnalyzingSeo}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 transition-all flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingSeo ? 'animate-spin' : ''}`} />
                    <span>{isAnalyzingSeo ? 'Analyzing Post...' : 'Run SEO Audit'}</span>
                  </button>
                </div>
              </div>

              {/* Optional Custom API Key accordion */}
              {showKeyConfig && (
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2 text-xs">
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                    AI Engine Selection
                  </p>
                  <p className="text-neutral-500">
                    By default, the server runs fast server-side Gemini 3.8 Flash with your preconfigured key. If you wish to use OpenAI GPT-4 for SEO suggestions, enter your OpenAI API key below:
                  </p>
                  <input
                    type="password"
                    placeholder="sk-proj-... (Optional OpenAI API Key for GPT-4 SEO)"
                    value={userCustomOpenAiKey}
                    onChange={(e) => {
                      setUserCustomOpenAiKey(e.target.value);
                      if (onUpdateOpenAiApiKey) onUpdateOpenAiApiKey(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 font-mono text-xs"
                  />
                </div>
              )}

              {/* Target keywords input */}
              <div className="flex gap-3 pt-2">
                <input
                  type="text"
                  placeholder="Target search keywords (e.g. software craft, web development, design systems)"
                  value={seoTargetKeywords}
                  onChange={(e) => setSeoTargetKeywords(e.target.value)}
                  className="flex-1 px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* If analysis is loaded */}
            {seoResult ? (
              <div className="space-y-6">
                {/* Score and Readability Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* SEO Score Gauge */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2 flex flex-col justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                      Overall SEO Score
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-editorial text-5xl font-bold text-neutral-900 dark:text-neutral-50 font-mono">
                        {seoResult.seoScore}
                      </span>
                      <span className="text-sm text-neutral-400 font-mono">/100</span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          seoResult.seoScore >= 80
                            ? 'bg-emerald-500'
                            : seoResult.seoScore >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${seoResult.seoScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Readability */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                      Readability & Cadence
                    </span>
                    <p className="font-editorial text-xl font-bold text-neutral-900 dark:text-neutral-100 pt-1">
                      {seoResult.readability}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Calculated from sentence variation, vocabulary diversity, and heading pacing.
                    </p>
                  </div>

                  {/* Social shareability */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                      Social Hook
                    </span>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 italic pt-1 leading-relaxed">
                      "{seoResult.socialSnippet}"
                    </p>
                  </div>
                </div>

                {/* Meta Title & Meta Description with 1-click apply */}
                <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6">
                  <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    Search Engine Snippet (Google Search Preview)
                  </h3>

                  {/* Google Preview Card */}
                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 space-y-1.5 max-w-2xl font-sans">
                    <div className="text-xs text-neutral-500 flex items-center gap-1 font-mono">
                      <span>https://chronicle.studio</span>
                      <span>›</span>
                      <span>stories</span>
                      <span>›</span>
                      <span>{initialPost?.slug || 'preview'}</span>
                    </div>
                    <h4 className="text-blue-700 dark:text-blue-400 text-lg font-medium hover:underline cursor-pointer">
                      {seoResult.metaTitle}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                      {seoResult.metaDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                          Recommended Meta Title ({seoResult.metaTitle?.length || 0}/60 chars)
                        </span>
                        <button
                          onClick={() => setTitle(seoResult.metaTitle)}
                          className="text-amber-600 hover:text-amber-800 font-medium"
                        >
                          Use as Title
                        </button>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={seoResult.metaTitle}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                          Recommended Meta Description ({seoResult.metaDescription?.length || 0}/160 chars)
                        </span>
                        <button
                          onClick={() => setSubtitle(seoResult.metaDescription)}
                          className="text-amber-600 hover:text-amber-800 font-medium"
                        >
                          Use as Subtitle
                        </button>
                      </div>
                      <textarea
                        readOnly
                        rows={2}
                        value={seoResult.metaDescription}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Alternative High-CTR Headlines (A/B testing ideas) */}
                {seoResult.headlineSuggestions && seoResult.headlineSuggestions.length > 0 && (
                  <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
                    <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      High-CTR Alternative Headlines
                    </h3>
                    <div className="space-y-2">
                      {seoResult.headlineSuggestions.map((headline, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-700 text-xs"
                        >
                          <span className="font-editorial text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {headline}
                          </span>
                          <button
                            onClick={() => setTitle(headline)}
                            className="px-3 py-1 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity"
                          >
                            Apply Title
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths & Actionable Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-mono">
                      ✓ Editorial Strengths
                    </h4>
                    <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                      {(seoResult.strengths || []).map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 font-mono">
                      ⚡ Actionable SEO Upgrades
                    </h4>
                    <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                      {(seoResult.improvements || []).map((imp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <Search className="w-8 h-8 text-neutral-400 mx-auto" />
                <h3 className="font-editorial text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Ready to Audit Your Post
                </h3>
                <p className="text-sm text-neutral-500 max-w-md mx-auto">
                  Click the button below to generate instant SEO scores, search snippets, alternative high-CTR titles, and ranking recommendations.
                </p>
                <button
                  onClick={handleAnalyzeSeo}
                  disabled={isAnalyzingSeo}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  {isAnalyzingSeo ? 'Analyzing...' : 'Generate AI SEO Report'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PUBLISH SETTINGS (Category, Tags, Artwork, Author) */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Category selection */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
              <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Category & Topics
              </h3>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Primary Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PostCategory)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Culture & Society">Culture & Society</option>
                  <option value="Essays & Thinking">Essays & Thinking</option>
                  <option value="Founders & Startups">Founders & Startups</option>
                </select>
              </div>

              {/* Tags input */}
              <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Article Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tag (e.g. react, ux, typography) and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    >
                      <span>#{t}</span>
                      <button
                        onClick={() => handleRemoveTag(t)}
                        className="text-neutral-400 hover:text-rose-500 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Cover Artwork Customizer */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
              <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Editorial Cover Motif
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Color Palette Theme
                  </label>
                  <select
                    value={coverTheme}
                    onChange={(e) => setCoverTheme(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="slate">Monochrome Slate & Onyx</option>
                    <option value="amber">Warm Amber & Cognac</option>
                    <option value="emerald">Deep Forest Emerald</option>
                    <option value="indigo">Cosmic Indigo & Midnight</option>
                    <option value="rose">Cinnabar & Vintage Rose</option>
                    <option value="stone">Architectural Limestone</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Background Pattern
                  </label>
                  <select
                    value={coverPattern}
                    onChange={(e) => setCoverPattern(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="geometric">Architectural Blueprint Geometric</option>
                    <option value="mesh">Atmospheric Radial Mesh</option>
                    <option value="dots">Minimalist Halftone Matrix</option>
                    <option value="waves">Flowing Soundwave Contours</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div className="pt-2">
                <CoverArtwork
                  theme={coverTheme}
                  pattern={coverPattern}
                  category={category}
                  title={title || 'Story Title'}
                  aspectRatio="video"
                />
              </div>
            </div>

            {/* Author Profile Lockup */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
              <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Author Attribution
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500 font-mono">Author Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500 font-mono">Role or Affiliation</label>
                  <input
                    type="text"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
