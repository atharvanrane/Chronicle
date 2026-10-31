import React, { useState } from 'react';
import {
  X,
  Grid,
  Bookmark,
  Heart,
  MessageSquare,
  ShieldCheck,
  UserPlus,
  UserCheck,
  Settings,
} from 'lucide-react';
import { Post, UserProfile } from '../types/blog';
import { CoverArtwork } from './CoverArtwork';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Lock, Check, Shield } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  userPosts: Post[];
  savedPosts: Post[];
  onSelectPost: (post: Post) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  userPosts,
  savedPosts,
  onSelectPost,
}) => {
  const { currentUser, followedUsers, toggleFollow, changeAccountPassword, resetUserPassword } = useAuth();
  const [profileTab, setProfileTab] = useState<'grid' | 'saved' | 'liked' | 'security'>('grid');

  // Password reset state for this account
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordStatusMsg, setPasswordStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  if (!isOpen) return null;

  const isOwnProfile = currentUser?.id === user.id || currentUser?.username === user.username;
  const isFollowing = followedUsers.includes(user.username);

  // Liked posts
  const likedPosts = userPosts.filter((p) => p.likedByUsers?.includes(user.id) || p.claps > 300);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-850/60">
          <span className="font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            @{user.username}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Details (Instagram Layout) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar */}
            <div className="p-1 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 shrink-0">
              <div className="p-0.5 bg-white dark:bg-neutral-900 rounded-full">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                />
              </div>
            </div>

            {/* User Meta & Instagram KPIs */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-editorial text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center justify-center sm:justify-start gap-2">
                    <span>{user.displayName}</span>
                    {user.role === 'admin' && (
                      <span className="text-amber-500" title="Verified Administrator">
                        <ShieldCheck className="w-5 h-5 fill-amber-500/20" />
                      </span>
                    )}
                  </h2>
                  <span className="text-xs font-mono text-neutral-400">@{user.username}</span>
                </div>

                {/* Follow / Edit Button */}
                {!isOwnProfile ? (
                  <button
                    onClick={() => toggleFollow(user)}
                    className={`px-5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 self-center sm:self-auto ${
                      isFollowing
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700'
                        : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-[11px] font-mono px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 self-center sm:self-auto">
                    Your Profile
                  </span>
                )}
              </div>

              {/* Instagram Stats Row */}
              <div className="flex items-center justify-center sm:justify-start gap-6 text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                <div>
                  <strong className="text-neutral-900 dark:text-neutral-100 tabular-nums">
                    {userPosts.length}
                  </strong>{' '}
                  stories
                </div>
                <div>
                  <strong className="text-neutral-900 dark:text-neutral-100 tabular-nums">
                    {user.followersCount + (isFollowing ? 1 : 0)}
                  </strong>{' '}
                  followers
                </div>
                <div>
                  <strong className="text-neutral-900 dark:text-neutral-100 tabular-nums">
                    {user.followingCount}
                  </strong>{' '}
                  following
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans max-w-md">
                {user.bio || 'Exploring design, craft, and publication.'}
              </p>
            </div>
          </div>

          {/* Instagram-style 3-tab Bar */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-center gap-8 text-xs font-mono">
            <button
              onClick={() => setProfileTab('grid')}
              className={`flex items-center gap-1.5 py-2 uppercase tracking-wider transition-colors ${
                profileTab === 'grid'
                  ? 'text-neutral-900 dark:text-white font-bold border-t-2 border-neutral-900 dark:border-white -mt-[17px]'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Posts</span>
            </button>

            <button
              onClick={() => setProfileTab('saved')}
              className={`flex items-center gap-1.5 py-2 uppercase tracking-wider transition-colors ${
                profileTab === 'saved'
                  ? 'text-neutral-900 dark:text-white font-bold border-t-2 border-neutral-900 dark:border-white -mt-[17px]'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved</span>
            </button>

            <button
              onClick={() => setProfileTab('liked')}
              className={`flex items-center gap-1.5 py-2 uppercase tracking-wider transition-colors ${
                profileTab === 'liked'
                  ? 'text-neutral-900 dark:text-white font-bold border-t-2 border-neutral-900 dark:border-white -mt-[17px]'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Liked</span>
            </button>

            {isOwnProfile && (
              <button
                onClick={() => setProfileTab('security')}
                className={`flex items-center gap-1.5 py-2 uppercase tracking-wider transition-colors ${
                  profileTab === 'security'
                    ? 'text-neutral-900 dark:text-white font-bold border-t-2 border-neutral-900 dark:border-white -mt-[17px]'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Security</span>
              </button>
            )}
          </div>

          {/* Tab Content: 3-column Instagram Grid */}
          {profileTab === 'grid' && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      onSelectPost(post);
                      onClose();
                    }}
                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-neutral-200 dark:border-neutral-800"
                  >
                    <CoverArtwork
                      theme={post.coverStyle.theme}
                      pattern={post.coverStyle.pattern}
                      category={post.category}
                      title=""
                      aspectRatio="card"
                      className="w-full h-full object-cover"
                    />

                    {/* Instagram hover overlay with likes & comments */}
                    <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-mono text-xs font-semibold">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 fill-current text-white" />
                        <span>{post.likesCount || post.claps}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 fill-current text-white" />
                        <span>{post.comments.length}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-10 text-center text-xs text-neutral-400">
                  No stories published yet.
                </div>
              )}
            </div>
          )}

          {profileTab === 'saved' && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {savedPosts.length > 0 ? (
                savedPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      onSelectPost(post);
                      onClose();
                    }}
                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-neutral-200 dark:border-neutral-800"
                  >
                    <CoverArtwork
                      theme={post.coverStyle.theme}
                      pattern={post.coverStyle.pattern}
                      category={post.category}
                      title=""
                      aspectRatio="card"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono">
                      <span>View Story</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-10 text-center text-xs text-neutral-400">
                  No saved articles in your collection.
                </div>
              )}
            </div>
          )}

          {profileTab === 'liked' && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      onSelectPost(post);
                      onClose();
                    }}
                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-neutral-200 dark:border-neutral-800"
                  >
                    <CoverArtwork
                      theme={post.coverStyle.theme}
                      pattern={post.coverStyle.pattern}
                      category={post.category}
                      title=""
                      aspectRatio="card"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500 mr-1" />
                      <span>Liked</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-10 text-center text-xs text-neutral-400">
                  No liked posts yet.
                </div>
              )}
            </div>
          )}

          {profileTab === 'security' && (
            <div className="max-w-md mx-auto space-y-6 py-2 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Account Security & Password</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  You can change or reset your password at any time. If you ever forget your password, you can reset it via the Sign In screen or contact an Administrator for immediate account recovery.
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>Email: {user.email}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active & Protected</span>
                </div>
              </div>

              {passwordStatusMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    passwordStatusMsg.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {passwordStatusMsg.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{passwordStatusMsg.text}</span>
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPasswordStatusMsg(null);
                  if (newPasswordInput.length < 6) {
                    setPasswordStatusMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
                    return;
                  }
                  if (newPasswordInput !== confirmPasswordInput) {
                    setPasswordStatusMsg({ type: 'error', text: 'New passwords do not match. Please re-enter.' });
                    return;
                  }
                  setIsSubmittingPass(true);
                  try {
                    const res = await changeAccountPassword(currentPasswordInput, newPasswordInput);
                    setPasswordStatusMsg({ type: 'success', text: res.message });
                    setCurrentPasswordInput('');
                    setNewPasswordInput('');
                    setConfirmPasswordInput('');
                  } catch (err: any) {
                    setPasswordStatusMsg({ type: 'error', text: err.message || 'Failed to update password.' });
                  } finally {
                    setIsSubmittingPass(false);
                  }
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter existing password"
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Retype new password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPass}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmittingPass ? 'Saving...' : 'Update Account Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
