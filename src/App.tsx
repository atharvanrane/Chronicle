import React, { useState, useEffect } from 'react';
import { UserCheck, Sparkles, TrendingUp, Check, UserPlus, ShieldCheck, PenSquare, ArrowRight } from 'lucide-react';
import { Post, CommentItem, StoryItem, UserProfile } from './types/blog';
import { INITIAL_POSTS } from './data/initialPosts';
import { INITIAL_STORIES } from './data/stories';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { StoriesBar } from './components/StoriesBar';
import { HeroFeatured } from './components/HeroFeatured';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { ArticleCard } from './components/ArticleCard';
import { ArticleView } from './components/ArticleView';
import { PostEditor } from './components/PostEditor';
import { StudioDashboard } from './components/StudioDashboard';
import { AdminControlPanel } from './components/AdminControlPanel';
import { ReadingListModal } from './components/ReadingListModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ReportModal } from './components/ReportModal';
import { Footer } from './components/Footer';

function MainApp() {
  const {
    currentUser,
    isAdmin,
    unreadNotificationsCount,
    followedUsers,
    toggleFollow,
    allUsers,
    logout,
  } = useAuth();

  // 1. Posts state (persisted to localStorage; filters out any legacy dummy posts)
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const stored = localStorage.getItem('chronicle_posts_v3');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const dummyIds = [
            'post-1', 'post-2', 'post-3', 'post-4', 'post-5', 'post-6',
            'essay-architecture-of-solitude', 'essay-geometry-of-silence', 'essay-dialectic-of-llms'
          ];
          const cleaned = parsed.filter(
            (p) => !dummyIds.includes(p.id) && !p.author?.email?.endsWith('@chronicle.local')
          );
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored posts', e);
    }
    return INITIAL_POSTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('chronicle_posts_v3', JSON.stringify(posts));
    } catch (e) {
      console.warn('Could not store posts', e);
    }
  }, [posts]);

  // 2. Instants state (Clean: starts empty, users share real Instants)
  const [stories, setStories] = useState<StoryItem[]>([]);

  // 3. User likes tracking (Instagram style, starts empty)
  const [userLikedPostIds, setUserLikedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chronicle_user_likes_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('chronicle_user_likes_v3', JSON.stringify(userLikedPostIds));
  }, [userLikedPostIds]);

  // 4. Navigation & views
  const [currentView, setCurrentView] = useState<'home' | 'post' | 'editor' | 'studio' | 'admin'>('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // 5. Saved reading list / bookmarks (starts empty)
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chronicle_saved_posts_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('chronicle_saved_posts_v3', JSON.stringify(savedPostIds));
  }, [savedPostIds]);

  // 6. Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('chronicle_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('chronicle_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('chronicle_dark_mode', 'false');
    }
  }, [darkMode]);

  // 7. Modals
  const [isReadingListOpen, setIsReadingListOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatContextPost, setAiChatContextPost] = useState<Post | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState<UserProfile | null>(null);
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    targetType: 'post' | 'user' | 'comment';
    targetId: string;
    targetTitleOrName: string;
    targetAuthorHandle?: string;
  } | null>(null);

  // 8. Site Announcement (Admin feature)
  const [siteAnnouncement, setSiteAnnouncement] = useState('Welcome to Chronicle! Explore long-form essays, join discussions, and write your own stories.');
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(true);

  // 9. Homepage Filter, Search, & Feed Stream
  const [feedType, setFeedType] = useState<'for-you' | 'following'>('for-you');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Blogs');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'reading-time'>('newest');
  const [viewMode, setViewMode] = useState<'feed' | 'grid' | 'list'>('feed');

  const categoriesList = [
    'All Blogs',
    'Engineering',
    'Design',
    'Artificial Intelligence',
    'Culture & Society',
    'Essays & Thinking',
    'Founders & Startups',
  ];

  // Instagram Like Handler
  const handleToggleLike = (post: Post, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isCurrentlyLiked = userLikedPostIds.includes(post.id);
    const updatedLikedIds = isCurrentlyLiked
      ? userLikedPostIds.filter((id) => id !== post.id)
      : [...userLikedPostIds, post.id];

    setUserLikedPostIds(updatedLikedIds);

    const delta = isCurrentlyLiked ? -1 : 1;
    const currentCount = post.likesCount || post.claps || 0;
    const newCount = Math.max(0, currentCount + delta);

    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              likesCount: newCount,
              claps: newCount,
              likedByUsers: isCurrentlyLiked
                ? (p.likedByUsers || []).filter((u) => u !== (currentUser?.id || 'you'))
                : [...(p.likedByUsers || []), currentUser?.id || 'you'],
            }
          : p
      )
    );

    if (selectedPost && selectedPost.id === post.id) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              likesCount: newCount,
              claps: newCount,
            }
          : null
      );
    }
  };

  // Toggle bookmark
  const handleToggleBookmark = (post: Post, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedPostIds((prev) =>
      prev.includes(post.id) ? prev.filter((id) => id !== post.id) : [...prev, post.id]
    );
  };

  // Claps
  const handleUpdateClaps = (postId: string, newClaps: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, claps: newClaps, likesCount: newClaps } : p))
    );
  };

  // Comment
  const handleAddComment = (postId: string, comment: CommentItem) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [comment, ...(p.comments || [])] } : p
      )
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev ? { ...prev, comments: [comment, ...(prev.comments || [])] } : null
      );
    }
  };

  // Save post from editor
  const handleSavePost = (postToSave: Post) => {
    setPosts((prev) => {
      const exists = prev.some((p) => p.id === postToSave.id);
      if (exists) {
        return prev.map((p) => (p.id === postToSave.id ? postToSave : p));
      }
      return [postToSave, ...prev];
    });
    setEditingPost(null);
    setSelectedPost(postToSave);
    setCurrentView('post');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete post
  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setSavedPostIds((prev) => prev.filter((id) => id !== postId));
    if (selectedPost?.id === postId) {
      setSelectedPost(null);
      setCurrentView('home');
    }
  };

  // Duplicate post
  const handleDuplicatePost = (post: Post) => {
    const copy: Post = {
      ...post,
      id: `post-${Date.now()}`,
      title: `${post.title} (Copy)`,
      slug: `${post.slug}-copy`,
      status: 'draft',
      views: 0,
      claps: 0,
      likesCount: 0,
      likedByUsers: [],
      publishedAt: new Date().toISOString().split('T')[0],
      comments: [],
    };
    setPosts([copy, ...posts]);
  };

  // Toggle featured status
  const handleToggleFeatured = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => ({
        ...p,
        isFeatured: p.id === postId ? !p.isFeatured : false,
      }))
    );
  };

  // Admin status update
  const handleUpdatePostStatus = (postId: string, status: 'published' | 'draft' | 'scheduled') => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status } : p))
    );
  };

  // Open article
  const handleOpenPost = (post: Post) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, views: (p.views || 0) + 1 } : p))
    );
    setSelectedPost({ ...post, views: (post.views || 0) + 1 });
    setCurrentView('post');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Author click to view profile
  const handleAuthorClick = (post: Post, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const profile: UserProfile = {
      id: post.author.id || `author-${post.author.name}`,
      displayName: post.author.name,
      username: post.author.username || post.author.name.toLowerCase().replace(/\s+/g, '_'),
      email: `${(post.author.username || 'author')}@chronicle.com`,
      photoURL: post.author.avatar,
      role: 'creator',
      bio: post.author.bio,
      followersCount: 840,
      followingCount: 92,
      createdAt: '2026-01-01',
    };
    setProfileModalUser(profile);
  };

  // Export JSON backup
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(posts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chronicle_posts_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setPosts(imported);
          alert(`Successfully imported ${imported.length} articles!`);
        }
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Computed data
  const publishedPosts = posts.filter((p) => p.status === 'published');
  const featuredPost =
    publishedPosts.find((p) => p.isFeatured) ||
    publishedPosts[0] ||
    posts[0];

  const filteredCatalogPosts = posts.filter((p) => {
    const isPublic = p.status === 'published';
    const matchesCat = selectedCategory === 'All Blogs' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFeed =
      feedType === 'for-you' ||
      (feedType === 'following' &&
        (followedUsers.includes(p.author.username || '') ||
          followedUsers.includes(p.author.id || '') ||
          (currentUser && (p.author.name === currentUser.displayName || p.author.username === currentUser.username))));

    return isPublic && matchesCat && matchesSearch && matchesFeed;
  });

  const sortedCatalogPosts = [...filteredCatalogPosts].sort((a, b) => {
    if (sortBy === 'popular') return (b.likesCount || b.claps || 0) - (a.likesCount || a.claps || 0);
    if (sortBy === 'reading-time') return (a.readTimeMinutes || 0) - (b.readTimeMinutes || 0);
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const savedPostsList = posts.filter((p) => savedPostIds.includes(p.id));
  const totalReads = posts.reduce((acc, p) => acc + (p.views || 0), 0);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200">
      {/* Admin Broadcast Announcement Bar */}
      {isAnnouncementActive && siteAnnouncement && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
          <span>📢 {siteAnnouncement}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'editor') setEditingPost(null);
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenReadingList={() => setIsReadingListOpen(true)}
        onOpenAiChat={() => {
          setAiChatContextPost(null);
          setIsAiChatOpen(true);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => currentUser && setProfileModalUser(currentUser)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        readingListCount={savedPostIds.length}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Views */}
      <main>
        {/* VIEW 1: HOME STORIES CATALOG */}
        {currentView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {/* Instagram-style Stories Carousel Bar */}
            <StoriesBar
              stories={stories}
              onSelectStoryArticle={(pid) => {
                const target = posts.find((p) => p.id === pid);
                if (target) handleOpenPost(target);
              }}
              onAddStory={(newStory) => setStories((prev) => [newStory, ...prev])}
            />

            {/* Split Screen Hero Featured Article (Showcase on Explore Grid & List views) */}
            {viewMode !== 'feed' && featuredPost && (
              <HeroFeatured
                post={featuredPost}
                onRead={handleOpenPost}
                totalStoriesCount={publishedPosts.length}
                totalReadsCount={totalReads}
              />
            )}

            {/* Category Segmented Filters & Search Bar */}
            <CategoryFilterBar
              categories={categoriesList}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              feedType={feedType}
              onFeedTypeChange={setFeedType}
              followingCount={followedUsers.length}
            />

            {/* VIEW MODE 1: INSTAGRAM FEED STREAM (Single Column + Desktop Sidebar) */}
            {viewMode === 'feed' ? (
              <div className="flex items-start justify-center gap-10">
                {/* Central Stream Container */}
                <div className="w-full max-w-xl space-y-6">
                  {sortedCatalogPosts.length > 0 ? (
                    sortedCatalogPosts.map((post) => (
                      <ArticleCard
                        key={post.id}
                        post={post}
                        onSelect={handleOpenPost}
                        isBookmarked={savedPostIds.includes(post.id)}
                        onToggleBookmark={handleToggleBookmark}
                        isLiked={userLikedPostIds.includes(post.id)}
                        onToggleLike={handleToggleLike}
                        onAuthorClick={handleAuthorClick}
                        onAddComment={handleAddComment}
                        onOpenAiSummary={(p) => {
                          setAiChatContextPost(p);
                          setIsAiChatOpen(true);
                        }}
                        onReportPost={(p) =>
                          setReportModalData({
                            isOpen: true,
                            targetType: 'post',
                            targetId: p.id,
                            targetTitleOrName: p.title,
                            targetAuthorHandle: p.author.username,
                          })
                        }
                        viewMode="feed"
                      />
                    ))
                  ) : feedType === 'following' ? (
                    <div className="p-10 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-4 shadow-xs">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-850 text-neutral-400 flex items-center justify-center mx-auto">
                        <UserCheck className="w-5 h-5 text-neutral-500" />
                      </div>
                      <p className="font-editorial text-xl font-bold text-neutral-800 dark:text-neutral-200">
                        No blogs from followed authors yet
                      </p>
                      <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                        Follow inspiring writers in the community or explore the "For You" stream to discover fresh posts.
                      </p>
                      <button
                        onClick={() => setFeedType('for-you')}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                      >
                        Explore For You
                      </button>
                    </div>
                  ) : (
                    <div className="p-10 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-4 shadow-xs">
                      <p className="font-editorial text-xl font-bold text-neutral-800 dark:text-neutral-200">
                        {posts.length === 0 ? 'No blogs published yet' : 'No matching blogs found'}
                      </p>
                      <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                        {posts.length === 0
                          ? 'Welcome to Chronicle! Publish the first longform blog post or share an Instant.'
                          : 'Try adjusting your search query or pick another category.'}
                      </p>
                      {posts.length === 0 ? (
                        <button
                          onClick={() => {
                            if (currentUser) {
                              setCurrentView('editor');
                              setEditingPost(null);
                            } else {
                              setIsAuthModalOpen(true);
                            }
                          }}
                          className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                        >
                          {currentUser ? 'Write First Blog' : 'Sign In to Publish'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedCategory('All Blogs');
                            setSearchQuery('');
                          }}
                          className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Sticky Sidebar (Instagram Desktop Web Style) */}
                <aside className="hidden lg:block w-80 shrink-0 sticky top-24 space-y-6 pl-4 select-none">
                  {/* Current User Quick Profile Row */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
                    <div
                      onClick={() => currentUser ? setProfileModalUser(currentUser) : setIsAuthModalOpen(true)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shrink-0">
                        <div className="p-0.5 bg-white dark:bg-neutral-900 rounded-full">
                          <img
                            src={currentUser?.photoURL || 'https://api.dicebear.com/7.x/identicon/svg?seed=guest'}
                            alt={currentUser?.displayName || 'Guest'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:underline">
                          {currentUser?.displayName || 'Guest Member'}
                        </h4>
                        <span className="text-[11px] font-mono text-neutral-400 block truncate">
                          @{currentUser?.username || 'explore'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => currentUser ? logout() : setIsAuthModalOpen(true)}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                    >
                      {currentUser ? 'Switch' : 'Sign In'}
                    </button>
                  </div>

                  {/* "Suggested for you" Module */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-500 dark:text-neutral-400">
                        Suggested for you
                      </span>
                      <button
                        onClick={() => setFeedType('for-you')}
                        className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 hover:underline"
                      >
                        See All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(() => {
                        const suggestedCreators = allUsers.filter(
                          (u) =>
                            u.id !== currentUser?.id &&
                            u.email.toLowerCase() !== currentUser?.email?.toLowerCase() &&
                            !u.email.endsWith('@chronicle.local') &&
                            !u.id.includes('elena') &&
                            !u.id.includes('marcus') &&
                            !u.id.includes('sarah')
                        );

                        if (suggestedCreators.length === 0) {
                          return (
                            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-dashed border-neutral-200 dark:border-neutral-800 text-center space-y-1">
                              <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                                No other members yet
                              </p>
                              <p className="text-[10px] text-neutral-400 leading-relaxed">
                                Real accounts registered on the platform will appear here for you to follow.
                              </p>
                            </div>
                          );
                        }

                        return suggestedCreators.map((creator) => {
                          const isFollowing = followedUsers.includes(creator.username);
                          return (
                            <div
                              key={creator.id}
                              className="flex items-center justify-between gap-3 text-xs"
                            >
                              <div
                                onClick={() => handleAuthorClick({ author: creator } as any, { stopPropagation: () => {} } as any)}
                                className="flex items-center gap-2.5 cursor-pointer group min-w-0"
                              >
                                <img
                                  src={creator.photoURL}
                                  alt={creator.displayName}
                                  className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    <h5 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:underline text-[11px]">
                                      {creator.displayName}
                                    </h5>
                                    {creator.role === 'admin' ? (
                                      <ShieldCheck className="w-3 h-3 text-amber-500 fill-amber-500/20 shrink-0" />
                                    ) : (
                                      <ShieldCheck className="w-3 h-3 text-blue-500 fill-blue-500/20 shrink-0" />
                                    )}
                                  </div>
                                  <span className="text-[10px] text-neutral-400 block truncate">
                                    {creator.bio || `@${creator.username}`}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => toggleFollow(creator)}
                                className={`text-[11px] font-semibold transition-colors shrink-0 ${
                                  isFollowing
                                    ? 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                                    : 'text-blue-600 dark:text-blue-400 hover:text-blue-700'
                                }`}
                              >
                                {isFollowing ? 'Following' : 'Follow'}
                              </button>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Trending Tags */}
                  <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-850">
                    <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block">
                      Trending Editorial Topics
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                      {['#Architecture', '#Typography', '#DeepWork', '#AIPhilosophy', '#Minimalism'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag.replace('#', ''))}
                          className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Instagram-style institutional footer */}
                  <div className="pt-2 text-[10px] text-neutral-400 dark:text-neutral-500 space-y-1.5 leading-relaxed font-sans">
                    <p className="space-x-1">
                      <span>About</span>
                      <span>·</span>
                      <span>Help</span>
                      <span>·</span>
                      <span>Press</span>
                      <span>·</span>
                      <span>API</span>
                      <span>·</span>
                      <span>Jobs</span>
                      <span>·</span>
                      <span>Privacy</span>
                      <span>·</span>
                      <span>Terms</span>
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-wider">
                      © 2026 CHRONICLE FROM ESSAYISTS
                    </p>
                  </div>
                </aside>
              </div>
            ) : viewMode === 'grid' ? (
              /* VIEW MODE 2: INSTAGRAM EXPLORE 3-COLUMN GRID */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedCatalogPosts.map((post) => (
                  <ArticleCard
                    key={post.id}
                    post={post}
                    onSelect={handleOpenPost}
                    isBookmarked={savedPostIds.includes(post.id)}
                    onToggleBookmark={handleToggleBookmark}
                    isLiked={userLikedPostIds.includes(post.id)}
                    onToggleLike={handleToggleLike}
                    onAuthorClick={handleAuthorClick}
                    onAddComment={handleAddComment}
                    onOpenAiSummary={(p) => {
                      setAiChatContextPost(p);
                      setIsAiChatOpen(true);
                    }}
                    onReportPost={(p) =>
                      setReportModalData({
                        isOpen: true,
                        targetType: 'post',
                        targetId: p.id,
                        targetTitleOrName: p.title,
                        targetAuthorHandle: p.author.username,
                      })
                    }
                    viewMode="grid"
                  />
                ))}
              </div>
            ) : (
              /* VIEW MODE 3: EDITORIAL LIST */
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {sortedCatalogPosts.map((post) => (
                  <ArticleCard
                    key={post.id}
                    post={post}
                    onSelect={handleOpenPost}
                    isBookmarked={savedPostIds.includes(post.id)}
                    onToggleBookmark={handleToggleBookmark}
                    isLiked={userLikedPostIds.includes(post.id)}
                    onToggleLike={handleToggleLike}
                    onAuthorClick={handleAuthorClick}
                    onAddComment={handleAddComment}
                    onOpenAiSummary={(p) => {
                      setAiChatContextPost(p);
                      setIsAiChatOpen(true);
                    }}
                    onReportPost={(p) =>
                      setReportModalData({
                        isOpen: true,
                        targetType: 'post',
                        targetId: p.id,
                        targetTitleOrName: p.title,
                        targetAuthorHandle: p.author.username,
                      })
                    }
                    viewMode="list"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: ARTICLE READING MODE */}
        {currentView === 'post' && selectedPost && (
          <ArticleView
            post={selectedPost}
            onBack={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isBookmarked={savedPostIds.includes(selectedPost.id)}
            onToggleBookmark={(p) => handleToggleBookmark(p)}
            onUpdateClaps={handleUpdateClaps}
            onAddComment={handleAddComment}
            onOpenAiAssistantWithContext={(p) => {
              setAiChatContextPost(p);
              setIsAiChatOpen(true);
            }}
            onReportPost={(p) =>
              setReportModalData({
                isOpen: true,
                targetType: 'post',
                targetId: p.id,
                targetTitleOrName: p.title,
                targetAuthorHandle: p.author.username,
              })
            }
            allPosts={posts}
            onSelectPost={handleOpenPost}
          />
        )}

        {/* VIEW 3: POST EDITOR & AI WRITING STUDIO */}
        {currentView === 'editor' && (
          <PostEditor
            initialPost={editingPost}
            onSave={handleSavePost}
            onCancel={() => {
              setCurrentView(editingPost ? 'studio' : 'home');
              setEditingPost(null);
            }}
          />
        )}

        {/* VIEW 4: STUDIO DASHBOARD */}
        {currentView === 'studio' && (
          <StudioDashboard
            posts={posts}
            onEditPost={(p) => {
              setEditingPost(p);
              setCurrentView('editor');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNewPost={() => {
              setEditingPost(null);
              setCurrentView('editor');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDeletePost={handleDeletePost}
            onDuplicatePost={handleDuplicatePost}
            onToggleFeatured={handleToggleFeatured}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onSelectPost={handleOpenPost}
          />
        )}

        {/* VIEW 5: ADMIN MODERATION CONTROL PANEL */}
        {currentView === 'admin' && (
          <AdminControlPanel
            posts={posts}
            onDeletePost={handleDeletePost}
            onToggleFeatured={handleToggleFeatured}
            onUpdatePostStatus={handleUpdatePostStatus}
            onSelectPost={handleOpenPost}
            siteAnnouncement={siteAnnouncement}
            onUpdateAnnouncement={setSiteAnnouncement}
            isAnnouncementActive={isAnnouncementActive}
            onToggleAnnouncement={() => setIsAnnouncementActive(!isAnnouncementActive)}
          />
        )}
      </main>

      {/* Footer */}
      {currentView !== 'editor' && (
        <Footer
          onOpenAiChat={() => {
            setAiChatContextPost(null);
            setIsAiChatOpen(true);
          }}
          onNavigate={(view) => {
            if (view === 'editor') setEditingPost(null);
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* MODALS */}
      <ReadingListModal
        isOpen={isReadingListOpen}
        onClose={() => setIsReadingListOpen(false)}
        savedPosts={savedPostsList}
        onSelectPost={handleOpenPost}
        onRemoveBookmark={(id) => setSavedPostIds((prev) => prev.filter((pId) => pId !== id))}
        onClearAll={() => setSavedPostIds([])}
      />

      <AiAssistantModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        activePost={aiChatContextPost}
        onClearContext={() => setAiChatContextPost(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {profileModalUser && (
        <UserProfileModal
          isOpen={Boolean(profileModalUser)}
          onClose={() => setProfileModalUser(null)}
          user={profileModalUser}
          userPosts={posts.filter(
            (p) =>
              p.author.name === profileModalUser.displayName ||
              p.author.username === profileModalUser.username
          )}
          savedPosts={savedPostsList}
          onSelectPost={handleOpenPost}
        />
      )}

      {/* Instagram Activity & Follow Requests Tray */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectPostById={(pid) => {
          const target = posts.find((p) => p.id === pid);
          if (target) {
            setIsNotificationsOpen(false);
            handleOpenPost(target);
          }
        }}
      />

      {/* Community Offensive Content Report Modal */}
      {reportModalData && (
        <ReportModal
          isOpen={reportModalData.isOpen}
          onClose={() => setReportModalData(null)}
          targetType={reportModalData.targetType}
          targetId={reportModalData.targetId}
          targetTitleOrName={reportModalData.targetTitleOrName}
          targetAuthorHandle={reportModalData.targetAuthorHandle}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
