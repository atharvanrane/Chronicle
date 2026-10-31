import React, { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
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
  } = useAuth();

  // 1. Posts state (persisted to localStorage) - purge legacy mock posts (post-1 .. post-6)
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const stored = localStorage.getItem('chronicle_posts_v3');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((p) => !['post-1', 'post-2', 'post-3', 'post-4', 'post-5', 'post-6'].includes(p.id));
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

  // 2. Stories state
  const [stories, setStories] = useState<StoryItem[]>(INITIAL_STORIES);

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
  const [selectedCategory, setSelectedCategory] = useState<string>('All Stories');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'reading-time'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categoriesList = [
    'All Stories',
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
    const matchesCat = selectedCategory === 'All Stories' || p.category === selectedCategory;
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
            />

            {/* Split Screen Hero Featured Article */}
            {featuredPost && (
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

            {/* Articles Grid or List */}
            {sortedCatalogPosts.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                    : 'divide-y divide-neutral-200 dark:divide-neutral-800'
                }
              >
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
                    onReportPost={(p) =>
                      setReportModalData({
                        isOpen: true,
                        targetType: 'post',
                        targetId: p.id,
                        targetTitleOrName: p.title,
                        targetAuthorHandle: p.author.username,
                      })
                    }
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : feedType === 'following' ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-850 text-neutral-400 flex items-center justify-center mx-auto">
                  <UserCheck className="w-5 h-5 text-neutral-500" />
                </div>
                <p className="font-editorial text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                  No stories from followed authors yet
                </p>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                  Follow authors in "For You (Explore)" or publish your own essay to populate this stream.
                </p>
                <button
                  onClick={() => setFeedType('for-you')}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                >
                  Explore For You
                </button>
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <p className="font-editorial text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                  {posts.length === 0 ? 'No stories published yet' : 'No matching essays found'}
                </p>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                  {posts.length === 0
                    ? 'Welcome to Chronicle! Be the first to share a long-form essay with the community.'
                    : 'Try adjusting your search query or explore another category.'}
                </p>
                {posts.length === 0 ? (
                  currentUser ? (
                    <button
                      onClick={() => {
                        setCurrentView('editor');
                        setEditingPost(null);
                      }}
                      className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                    >
                      Write First Story
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                    >
                      Sign In to Write
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      setSelectedCategory('All Stories');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  >
                    Reset Filters
                  </button>
                )}
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
