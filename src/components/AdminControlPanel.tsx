import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  FileText,
  Heart,
  Eye,
  Trash2,
  Star,
  CheckCircle,
  AlertTriangle,
  Radio,
  Search,
  Lock,
  ArrowUpRight,
} from 'lucide-react';
import { Post, UserProfile } from '../types/blog';
import { useAuth } from '../context/AuthContext';

interface AdminControlPanelProps {
  posts: Post[];
  onDeletePost: (postId: string) => void;
  onToggleFeatured: (postId: string) => void;
  onUpdatePostStatus: (postId: string, status: 'published' | 'draft' | 'scheduled') => void;
  onSelectPost: (post: Post) => void;
  siteAnnouncement: string;
  onUpdateAnnouncement: (announcement: string) => void;
  isAnnouncementActive: boolean;
  onToggleAnnouncement: () => void;
}

export const AdminControlPanel: React.FC<AdminControlPanelProps> = ({
  posts,
  onDeletePost,
  onToggleFeatured,
  onUpdatePostStatus,
  onSelectPost,
  siteAnnouncement,
  onUpdateAnnouncement,
  isAnnouncementActive,
  onToggleAnnouncement,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const [activeAdminTab, setActiveAdminTab] = useState<'posts' | 'users' | 'broadcast'>('posts');
  const [searchPost, setSearchPost] = useState('');
  const [announcementInput, setAnnouncementInput] = useState(siteAnnouncement);

  // Simulated active platform users list for administration
  const [platformUsers, setPlatformUsers] = useState<UserProfile[]>([
    {
      id: 'u-1',
      displayName: 'Atharva Rane',
      username: 'atharva_admin',
      email: 'atharvarane606@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      followersCount: 1420,
      followingCount: 88,
      createdAt: '2026-01-15',
    },
    {
      id: 'u-2',
      displayName: 'Elena Rostova',
      username: 'elena_arch',
      email: 'elena.rostova@chronicle.com',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'creator',
      followersCount: 890,
      followingCount: 112,
      createdAt: '2026-02-10',
    },
    {
      id: 'u-3',
      displayName: 'Julian Thorne',
      username: 'julian_type',
      email: 'julian.thorne@design.org',
      photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'creator',
      followersCount: 640,
      followingCount: 45,
      createdAt: '2026-02-22',
    },
    {
      id: 'u-4',
      displayName: 'Marcus Vance',
      username: 'marcus_v',
      email: 'marcus.vance@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'reader',
      followersCount: 42,
      followingCount: 65,
      createdAt: '2026-05-20',
    },
  ]);

  const [bannedUserIds, setBannedUserIds] = useState<string[]>([]);

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-4 shadow-sm">
        <Lock className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="font-editorial text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Admin Access Restricted
        </h2>
        <p className="text-sm text-neutral-500">
          You must be logged in as an Administrator (e.g. Atharva Rane or role: admin) to access the moderation console.
        </p>
      </div>
    );
  }

  // Filtered posts
  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchPost.toLowerCase()) ||
      p.author.name.toLowerCase().includes(searchPost.toLowerCase()) ||
      p.category.toLowerCase().includes(searchPost.toLowerCase())
  );

  const handleRoleChange = (userId: string, newRole: 'admin' | 'creator' | 'reader') => {
    setPlatformUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleToggleBan = (userId: string) => {
    setBannedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Title & Identity */}
      <div className="p-6 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-850 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-editorial text-2xl font-bold tracking-tight">
                Chronicle Admin Console
              </h1>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Superuser Active
              </span>
            </div>
            <p className="text-xs text-neutral-400 pt-0.5">
              Logged in as <strong className="text-white">{currentUser?.displayName}</strong> ({currentUser?.email})
            </p>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-800 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveAdminTab('posts')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeAdminTab === 'posts' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-300 hover:text-white'
            }`}
          >
            Moderate Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeAdminTab === 'users' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-300 hover:text-white'
            }`}
          >
            Users & Roles ({platformUsers.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('broadcast')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeAdminTab === 'broadcast' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-300 hover:text-white'
            }`}
          >
            Site Announcement
          </button>
        </div>
      </div>

      {/* TAB 1: MODERATE POSTS */}
      {activeAdminTab === 'posts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search posts or authors..."
                value={searchPost}
                onChange={(e) => setSearchPost(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-850/60 border-b border-neutral-200 dark:border-neutral-800 font-mono text-neutral-400 uppercase">
                  <tr>
                    <th className="py-3.5 px-6">Article & Author</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Status Control</th>
                    <th className="py-3.5 px-4 text-center">Featured Hero</th>
                    <th className="py-3.5 px-4 text-right">Engagement</th>
                    <th className="py-3.5 px-6 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-850/40">
                      <td className="py-4 px-6 max-w-sm">
                        <h4
                          onClick={() => onSelectPost(post)}
                          className="font-editorial text-sm font-bold text-neutral-900 dark:text-neutral-100 hover:text-amber-600 cursor-pointer line-clamp-1"
                        >
                          {post.title}
                        </h4>
                        <p className="text-[11px] text-neutral-500 pt-0.5">
                          by {post.author.name} · @{post.author.username || 'author'}
                        </p>
                      </td>

                      <td className="py-4 px-4 font-mono text-neutral-500 whitespace-nowrap">
                        {post.category}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <select
                          value={post.status}
                          onChange={(e) => onUpdatePostStatus(post.id, e.target.value as any)}
                          className="px-2 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="scheduled">Scheduled</option>
                        </select>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => onToggleFeatured(post.id)}
                          className={`p-1.5 rounded transition-colors ${
                            post.isFeatured
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                              : 'text-neutral-400 hover:text-amber-500'
                          }`}
                          title={post.isFeatured ? 'Featured on hero' : 'Mark as featured hero'}
                        >
                          <Star className={`w-4 h-4 ${post.isFeatured ? 'fill-current' : ''}`} />
                        </button>
                      </td>

                      <td className="py-4 px-4 text-right font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                        <span>{post.likesCount || post.claps} likes</span>
                        <span className="mx-1.5">·</span>
                        <span>{post.views} views</span>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (window.confirm(`Admin: permanently delete "${post.title}"?`)) {
                              onDeletePost(post.id);
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER ROLES & ACCESS MANAGEMENT */}
      {activeAdminTab === 'users' && (
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-850/60 border-b border-neutral-200 dark:border-neutral-800 font-mono text-neutral-400 uppercase">
                <tr>
                  <th className="py-3.5 px-6">User Profile</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role Permission</th>
                  <th className="py-3.5 px-4 text-right">Followers</th>
                  <th className="py-3.5 px-6 text-right">Moderation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {platformUsers.map((user) => {
                  const isBanned = bannedUserIds.includes(user.id);
                  return (
                    <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-850/40">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                          />
                          <div>
                            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {user.displayName}
                            </h4>
                            <span className="font-mono text-[11px] text-neutral-400">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-neutral-600 dark:text-neutral-400">
                        {user.email}
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                          className="px-2 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-medium"
                        >
                          <option value="admin">👑 Administrator</option>
                          <option value="creator">✍️ Creator</option>
                          <option value="reader">📖 Reader</option>
                        </select>
                      </td>

                      <td className="py-4 px-4 text-right font-mono tabular-nums text-neutral-500">
                        {user.followersCount}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggleBan(user.id)}
                          className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                            isBanned
                              ? 'bg-rose-600 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-rose-600'
                          }`}
                        >
                          {isBanned ? 'Suspended (Unban)' : 'Active (Ban)'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BROADCAST SYSTEM ANNOUNCEMENT */}
      {activeAdminTab === 'broadcast' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6 max-w-2xl">
          <div>
            <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-500" />
              <span>Global Broadcast Banner</span>
            </h3>
            <p className="text-xs text-neutral-500 pt-1">
              Publish a pinned announcement message across the top of the entire website for all readers.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Announcement Message
            </label>
            <input
              type="text"
              value={announcementInput}
              onChange={(e) => setAnnouncementInput(e.target.value)}
              placeholder="e.g. Welcome to Chronicle! Submissions for Autumn Essays are now open."
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                onUpdateAnnouncement(announcementInput);
                if (!isAnnouncementActive) onToggleAnnouncement();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Save & Broadcast
            </button>

            <button
              onClick={onToggleAnnouncement}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors ${
                isAnnouncementActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300'
                  : 'bg-neutral-100 text-neutral-500 border-neutral-200'
              }`}
            >
              Status: {isAnnouncementActive ? '● Live on Site' : '○ Disabled'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
