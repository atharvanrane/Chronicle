import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  FileText,
  Trash2,
  Star,
  CheckCircle,
  AlertTriangle,
  Radio,
  Search,
  Lock,
  UserX,
  Flag,
  Key,
  KeyRound,
  AlertOctagon,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { Post, UserProfile, ReportItem } from '../types/blog';
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
  const {
    currentUser,
    isAdmin,
    isAdminAuthenticated,
    verifyAdminPassword,
    updateAdminPassword,
    allUsers,
    bannedUserIds,
    adminRemoveUser,
    adminBanUser,
    adminUnbanUser,
    adminUpdateUserRole,
    adminResetUserPassword,
    adminGetAccountCredentialsInfo,
    reports,
    resolveReport,
    clearAllGarbageData,
  } = useAuth();

  const [enteredAdminPassword, setEnteredAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'reports' | 'posts' | 'security' | 'broadcast' | 'recovery'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementInput, setAnnouncementInput] = useState(siteAnnouncement);
  const [banReasonInput, setBanReasonInput] = useState('');
  const [selectedUserForBan, setSelectedUserForBan] = useState<UserProfile | null>(null);

  // Recovery modal state
  const [selectedUserForRecovery, setSelectedUserForRecovery] = useState<UserProfile | null>(null);
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryFeedback, setRecoveryFeedback] = useState<{ type: 'success' | 'error'; message: string; tempPass?: string } | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // New password inputs
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);

  // Admin Security Password Gate
  if (!isAdminAuthenticated) {
    const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordError(null);
      const isSuccess = verifyAdminPassword(enteredAdminPassword);
      if (!isSuccess) {
        setPasswordError('Invalid Administrator Security Password. Access Denied.');
      }
    };

    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-6 shadow-xl animate-in zoom-in-95 duration-150">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto">
          <KeyRound className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="font-editorial text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Admin Master Password
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Administrative controls and user moderation are password-protected to ensure only authorized administrators can access them.
          </p>
        </div>

        {passwordError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4 text-xs">
          <div className="space-y-1 text-left">
            <label className="font-semibold text-neutral-700 dark:text-neutral-300">
              Enter Administrator Security Key:
            </label>
            <input
              type="password"
              required
              autoFocus
              placeholder="••••••••"
              value={enteredAdminPassword}
              onChange={(e) => setEnteredAdminPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono text-center text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors shadow-sm"
          >
            Unlock Admin Console
          </button>
        </form>
      </div>
    );
  }

  // Filtered lists
  const filteredUsers = allUsers.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingReports = reports.filter((r) => r.status === 'pending');

  const handleConfirmBan = () => {
    if (selectedUserForBan) {
      adminBanUser(selectedUserForBan.id, banReasonInput || 'Offensive content violation');
      setSelectedUserForBan(null);
      setBanReasonInput('');
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMasterPassword.length < 6) {
      alert('New password must be at least 6 characters long.');
      return;
    }
    updateAdminPassword(newMasterPassword);
    setNewMasterPassword('');
    setPasswordSuccessMsg('Admin master password successfully updated!');
    setTimeout(() => setPasswordSuccessMsg(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Title & Identity */}
      <div className="p-6 rounded-3xl bg-neutral-900 text-white dark:bg-neutral-850 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight">
                Chronicle Admin Console
              </h1>
              <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Password Verified
              </span>
            </div>
            <p className="text-xs text-neutral-400 pt-0.5 font-mono">
              Administrator session active · Full moderation permissions
            </p>
          </div>
        </div>

        {/* Admin Navigation Segmented Control */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-neutral-800 rounded-xl text-xs font-medium self-start md:self-auto">
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'users' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users & Bans ({allUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('reports')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 relative ${
              activeAdminTab === 'reports' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5 text-rose-400" />
            <span>Reports</span>
            {pendingReports.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                {pendingReports.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('posts')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'posts' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Moderate Posts ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('security')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'security' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Password</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('recovery')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'recovery' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            <span>Account Recovery</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('broadcast')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'broadcast' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Site Broadcast</span>
          </button>
        </div>
      </div>

      {/* TAB 1: USERS & BANNING */}
      {activeAdminTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-editorial text-xl font-bold text-neutral-900 dark:text-neutral-100">
                User Accounts Moderation
              </h2>
              <p className="text-xs text-neutral-500 pt-0.5">
                Remove malicious accounts, ban users for offensive content, or promote authors to administrators.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Wipe any residual mock test data from localStorage?')) {
                    clearAllGarbageData();
                    window.location.reload();
                  }
                }}
                className="px-3 py-2 text-xs font-mono rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-rose-600 transition-colors"
                title="Purge mock data"
              >
                Purge Residual Data
              </button>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-850/60 border-b border-neutral-200 dark:border-neutral-800 font-mono text-neutral-400 uppercase">
                  <tr>
                    <th className="py-3.5 px-6">User / Author</th>
                    <th className="py-3.5 px-4">Role Tier</th>
                    <th className="py-3.5 px-4">Account Privacy</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Followers</th>
                    <th className="py-3.5 px-6 text-right">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const isBanned = bannedUserIds.includes(user.id) || user.isBanned;
                      return (
                        <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-850/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="w-9 h-9 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    {user.displayName}
                                  </h4>
                                  {user.role === 'admin' && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                                      ADMIN
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-[11px] text-neutral-400">
                                  @{user.username} · {user.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <select
                              value={user.role}
                              onChange={(e) => adminUpdateUserRole(user.id, e.target.value as any)}
                              className="px-2.5 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-medium"
                            >
                              <option value="admin">👑 Administrator</option>
                              <option value="creator">✍️ Creator</option>
                              <option value="reader">📖 Reader</option>
                            </select>
                          </td>

                          <td className="py-4 px-4 font-mono text-neutral-500 whitespace-nowrap">
                            {user.isPrivate ? '🔒 Private (Follow Req)' : '🌐 Public'}
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            {isBanned ? (
                              <span className="inline-flex items-center gap-1 text-rose-600 font-semibold font-mono">
                                <AlertOctagon className="w-3.5 h-3.5" />
                                <span>BANNED</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-mono">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right font-mono tabular-nums text-neutral-500">
                            {user.followersCount}
                          </td>

                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUserForRecovery(user);
                                  setRecoveryNewPassword('');
                                  setRecoveryFeedback(null);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-neutral-700 dark:text-neutral-300 hover:text-amber-700 dark:hover:text-amber-300 transition-colors flex items-center gap-1"
                                title="Account Recovery & Reset Password"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                                <span>Reset Pass</span>
                              </button>

                              {isBanned ? (
                                <button
                                  onClick={() => adminUnbanUser(user.id)}
                                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 hover:bg-emerald-100"
                                >
                                  Unban
                                </button>
                              ) : (
                                <button
                                  onClick={() => setSelectedUserForBan(user)}
                                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-50 text-neutral-700 dark:text-neutral-300 hover:text-rose-600 transition-colors"
                                >
                                  Ban User
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  if (window.confirm(`Permanently remove user @${user.username}? This will delete their account.`)) {
                                    adminRemoveUser(user.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Remove User Permanently"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-neutral-400">
                        No registered users found. Users who sign up will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BAN MODAL PROMPT */}
      {selectedUserForBan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Suspend @{selectedUserForBan.username}
              </h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Banning this user will immediately revoke their ability to publish blog stories, comment in threads, or like posts.
            </p>
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                Reason for suspension (Offensive Content / Policy Violation):
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Posted offensive harassment in blog comments and violated community conduct."
                value={banReasonInput}
                onChange={(e) => setBanReasonInput(e.target.value)}
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none text-xs"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedUserForBan(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBan}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REPORTS QUEUE */}
      {activeAdminTab === 'reports' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-editorial text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Offensive Content Reports Queue
            </h2>
            <p className="text-xs text-neutral-500 pt-0.5">
              Review reports filed by readers regarding hate speech, spam, or community policy violations.
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-850/60 border-b border-neutral-200 dark:border-neutral-800 font-mono text-neutral-400 uppercase">
                  <tr>
                    <th className="py-3.5 px-6">Reported Item</th>
                    <th className="py-3.5 px-4">Author Handle</th>
                    <th className="py-3.5 px-4">Violation Reason</th>
                    <th className="py-3.5 px-4">Reporter</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {reports.length > 0 ? (
                    reports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-850/40">
                        <td className="py-4 px-6 font-semibold text-neutral-900 dark:text-neutral-100 max-w-xs">
                          {rep.targetTitleOrName}
                        </td>
                        <td className="py-4 px-4 font-mono text-neutral-500">
                          @{rep.targetAuthorHandle || 'unknown'}
                        </td>
                        <td className="py-4 px-4 text-rose-600 dark:text-rose-400 max-w-sm leading-relaxed">
                          "{rep.reason}"
                        </td>
                        <td className="py-4 px-4 font-mono text-neutral-400">
                          @{rep.reportedBy}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`font-mono text-[11px] px-2 py-0.5 rounded-full ${
                              rep.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold'
                                : 'bg-neutral-100 text-neutral-500'
                            }`}
                          >
                            {rep.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          {rep.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              {rep.targetAuthorHandle && (
                                <button
                                  onClick={() => resolveReport(rep.id, 'ban_user')}
                                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                                >
                                  Ban Offender
                                </button>
                              )}
                              <button
                                onClick={() => resolveReport(rep.id, 'dismiss')}
                                className="px-3 py-1 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                              >
                                Dismiss
                              </button>
                            </div>
                          ) : (
                            <span className="text-neutral-400 font-mono">Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-neutral-400">
                        No pending reports. Community is clean.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MODERATE POSTS */}
      {activeAdminTab === 'posts' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
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
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
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
                            className="px-2 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-medium"
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="archived">Archived</option>
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
                              if (window.confirm(`Permanently delete story "${post.title}"?`)) {
                                onDeletePost(post.id);
                              }
                            }}
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-neutral-400">
                        No articles published yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADMIN PASSWORD SECURITY SETTINGS */}
      {activeAdminTab === 'security' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6 max-w-xl shadow-xs">
          <div>
            <h3 className="font-editorial text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" />
              <span>Admin Master Password Security</span>
            </h3>
            <p className="text-xs text-neutral-500 pt-1 leading-relaxed">
              This master passkey protects the administrator console and prevents unauthorized visitors from registering or executing moderation actions.
            </p>
          </div>

          {passwordSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs">
              {passwordSuccessMsg}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                Change Master Admin Password:
              </label>
              <input
                type="password"
                required
                placeholder="Enter new admin master password"
                value={newMasterPassword}
                onChange={(e) => setNewMasterPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: BROADCAST SYSTEM ANNOUNCEMENT */}
      {activeAdminTab === 'broadcast' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6 max-w-2xl shadow-xs">
          <div>
            <h3 className="font-editorial text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-500" />
              <span>Global Broadcast Announcement</span>
            </h3>
            <p className="text-xs text-neutral-500 pt-1">
              Publish a live announcement ribbon at the top of every page for all readers.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Announcement Message
            </label>
            <input
              type="text"
              value={announcementInput}
              onChange={(e) => setAnnouncementInput(e.target.value)}
              placeholder="e.g. Welcome to Chronicle! Submissions for Autumn Essays are now open."
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                onUpdateAnnouncement(announcementInput);
                if (!isAnnouncementActive) onToggleAnnouncement();
                alert('Broadcast banner updated live on site!');
              }}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Save & Broadcast
            </button>

            <button
              onClick={onToggleAnnouncement}
              className={`px-3.5 py-2 text-xs font-mono rounded-xl border transition-colors ${
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

      {/* TAB 6: ACCOUNT RECOVERY & CREDENTIALS CONSOLE */}
      {activeAdminTab === 'recovery' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-500" />
                <h2 className="font-editorial text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Account Recovery & Password Retrieval
                </h2>
              </div>
              <p className="text-xs text-neutral-500 pt-1 max-w-2xl leading-relaxed">
                If a user forgets their password and cannot receive or reset via automated email, administrators can immediately reset their password, generate a temporary login passkey, or unlock suspended accounts.
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, handle, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* User Recovery Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const credInfo = adminGetAccountCredentialsInfo(user.id);
                return (
                  <div
                    key={user.id}
                    className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                        />
                        <div>
                          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                            {user.displayName}
                          </h4>
                          <span className="font-mono text-[11px] text-neutral-400 block">
                            @{user.username}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                          user.role === 'admin'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] pt-1 border-t border-neutral-100 dark:border-neutral-850">
                      <div className="flex items-center justify-between text-neutral-500">
                        <span>Account Email:</span>
                        <span className="font-mono text-neutral-800 dark:text-neutral-200 truncate max-w-[160px]">
                          {user.email}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-500">
                        <span>Account Status:</span>
                        {credInfo.isBanned ? (
                          <span className="text-rose-600 font-semibold font-mono">Suspended / Banned</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold font-mono">Active & Good Standing</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-neutral-500">
                        <span>Password Protection:</span>
                        <span className="text-neutral-700 dark:text-neutral-300 font-mono">
                          {credInfo.hasStoredPassword ? '✓ Protected' : 'Default / OAuth'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUserForRecovery(user);
                          setRecoveryNewPassword('');
                          setRecoveryFeedback(null);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Recover & Reset Password</span>
                      </button>

                      {credInfo.isBanned && (
                        <button
                          onClick={() => adminUnbanUser(user.id)}
                          className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-xs font-semibold"
                        >
                          Unlock
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 py-12 text-center text-xs text-neutral-400">
                No accounts found matching your search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACCOUNT RECOVERY MODAL DIALOG */}
      {selectedUserForRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-5 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                    Admin Account Recovery
                  </h3>
                  <p className="text-[11px] font-mono text-neutral-400">
                    Direct password reset for @{selectedUserForRecovery.username}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedUserForRecovery(null);
                  setRecoveryFeedback(null);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <Trash2 className="w-4 h-4 hidden" />
                <span className="text-lg font-bold">×</span>
              </button>
            </div>

            {/* Target Account Summary */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
              <img
                src={selectedUserForRecovery.photoURL}
                alt={selectedUserForRecovery.displayName}
                className="w-11 h-11 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
              />
              <div className="flex-1 min-w-0 text-xs">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {selectedUserForRecovery.displayName}
                </h4>
                <p className="text-neutral-500 font-mono text-[11px] truncate">
                  Email: {selectedUserForRecovery.email}
                </p>
                <div className="flex items-center gap-2 pt-0.5 font-mono text-[10px]">
                  <span className="text-neutral-400">ID: {selectedUserForRecovery.id}</span>
                  <span className="text-neutral-400">·</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                    Role: {selectedUserForRecovery.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback Message */}
            {recoveryFeedback && (
              <div
                className={`p-3.5 rounded-2xl text-xs space-y-2 ${
                  recoveryFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {recoveryFeedback.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{recoveryFeedback.message}</span>
                </div>

                {recoveryFeedback.tempPass && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 flex items-center justify-between gap-2 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-sans">New Login Password:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">{recoveryFeedback.tempPass}</strong>
                    </div>
                    <button
                      onClick={() => {
                        const copyText = `Chronicle Credentials\nEmail: ${selectedUserForRecovery.email}\nNew Password: ${recoveryFeedback.tempPass}`;
                        navigator.clipboard?.writeText(copyText);
                        setCopiedCredentials(true);
                        setTimeout(() => setCopiedCredentials(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-sans text-[11px] font-semibold hover:bg-emerald-700 flex items-center gap-1"
                    >
                      {copiedCredentials ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCredentials ? 'Copied!' : 'Copy Credentials'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Password Input & Generator */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Assign New Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const randomPass = `Chronicle${Math.floor(1000 + Math.random() * 9000)}!`;
                    setRecoveryNewPassword(randomPass);
                  }}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Temporary Password</span>
                </button>
              </div>

              <input
                type="text"
                value={recoveryNewPassword}
                onChange={(e) => setRecoveryNewPassword(e.target.value)}
                placeholder="e.g. Chronicle2026!"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono text-xs"
              />
              <p className="text-[11px] text-neutral-400">
                Minimum 6 characters. Saving this will instantly update the user's password so they can log in immediately.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => {
                  setSelectedUserForRecovery(null);
                  setRecoveryFeedback(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Close
              </button>

              <button
                onClick={() => {
                  try {
                    if (!recoveryNewPassword.trim()) {
                      setRecoveryFeedback({ type: 'error', message: 'Please enter or generate a new password first.' });
                      return;
                    }
                    const res = adminResetUserPassword(selectedUserForRecovery.id, recoveryNewPassword);
                    setRecoveryFeedback({
                      type: 'success',
                      message: res.message,
                      tempPass: res.tempPass,
                    });
                  } catch (err: any) {
                    setRecoveryFeedback({
                      type: 'error',
                      message: err.message || 'Failed to reset user password.',
                    });
                  }
                }}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Save & Reset Password</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
