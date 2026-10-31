import React, { useState } from 'react';
import {
  PenSquare,
  Trash2,
  Copy,
  Eye,
  Star,
  Download,
  Upload,
  Search,
  BookOpen,
  Heart,
  BarChart2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Post } from '../types/blog';

interface StudioDashboardProps {
  posts: Post[];
  onEditPost: (post: Post) => void;
  onNewPost: () => void;
  onDeletePost: (postId: string) => void;
  onDuplicatePost: (post: Post) => void;
  onToggleFeatured: (postId: string) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectPost: (post: Post) => void;
}

export const StudioDashboard: React.FC<StudioDashboardProps> = ({
  posts,
  onEditPost,
  onNewPost,
  onDeletePost,
  onDuplicatePost,
  onToggleFeatured,
  onExportData,
  onImportData,
  onSelectPost,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Metrics
  const totalPosts = posts.length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalClaps = posts.reduce((acc, p) => acc + (p.claps || 0), 0);
  const avgReadTime =
    posts.length > 0
      ? (posts.reduce((acc, p) => acc + (p.readTimeMinutes || 0), 0) / posts.length).toFixed(1)
      : '0';

  // Filtered list
  const filteredPosts = posts.filter((p) => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Publisher Studio
          </h1>
          <p className="text-sm text-neutral-500 pt-1">
            Manage your publication archive, track engagement, and draft new essays.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Export JSON */}
          <button
            onClick={onExportData}
            className="px-3 py-2 text-xs font-mono font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300"
            title="Download full JSON backup of all posts"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          {/* Import JSON */}
          <label className="px-3 py-2 text-xs font-mono font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={onImportData} className="hidden" />
          </label>

          {/* Write New Story */}
          <button
            onClick={onNewPost}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-sm active:scale-95"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span>New Story</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Total Articles
          </span>
          <div className="font-editorial text-3xl font-bold text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
            {totalPosts}
          </div>
          <p className="text-[11px] text-neutral-500">Live & Draft stories</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Total Impressions
          </span>
          <div className="font-editorial text-3xl font-bold text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
            {totalViews.toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-500">Across all published posts</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Total Reader Claps
          </span>
          <div className="font-editorial text-3xl font-bold text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
            {totalClaps.toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-500">Community appreciation</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Average Read Time
          </span>
          <div className="font-editorial text-3xl font-bold text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
            {avgReadTime}m
          </div>
          <p className="text-[11px] text-neutral-500">In-depth editorial pacing</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status segmented controls: Functional buttons */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg text-xs font-medium self-start">
          {(['all', 'published', 'draft', 'scheduled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md transition-colors capitalize ${
                filterStatus === s
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stories or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Articles Management Table / List */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-850/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-mono uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6 font-medium">Story Title</th>
                <th className="py-3.5 px-4 font-medium">Category</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Metrics</th>
                <th className="py-3.5 px-4 font-medium text-right">Updated</th>
                <th className="py-3.5 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-neutral-50/80 dark:hover:bg-neutral-850/40 transition-colors"
                  >
                    {/* Story Title & Excerpt */}
                    <td className="py-4 px-6 max-w-sm">
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => onToggleFeatured(post.id)}
                          className={`mt-1 transition-colors ${
                            post.isFeatured
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-neutral-300 dark:text-neutral-700 hover:text-amber-400'
                          }`}
                          title={post.isFeatured ? 'Featured on hero' : 'Mark as featured hero'}
                        >
                          <Star className={`w-3.5 h-3.5 ${post.isFeatured ? 'fill-current' : ''}`} />
                        </button>
                        <div>
                          <h4
                            onClick={() => onSelectPost(post)}
                            className="font-editorial text-sm font-bold text-neutral-900 dark:text-neutral-100 hover:text-amber-600 transition-colors cursor-pointer line-clamp-1"
                          >
                            {post.title}
                          </h4>
                          <p className="text-[11px] text-neutral-500 line-clamp-1 pt-0.5 font-normal">
                            {post.subtitle}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category: Unboxed metadata */}
                    <td className="py-4 px-4 font-mono text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {post.category}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[11px] ${
                          post.status === 'published'
                            ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                            : post.status === 'draft'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-neutral-500'
                        }`}
                      >
                        {post.status === 'published' ? '● Published' : '○ Draft'}
                      </span>
                    </td>

                    {/* Metrics */}
                    <td className="py-4 px-4 text-right font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                      <span>{post.views} views</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span>{post.claps} likes</span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-right font-mono text-neutral-500 whitespace-nowrap">
                      {post.publishedAt}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectPost(post)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Preview Story"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onEditPost(post)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Edit Story & SEO"
                        >
                          <PenSquare className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDuplicatePost(post)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Duplicate Story"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeletePost(post.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete Story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500 text-xs">
                    No articles found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
