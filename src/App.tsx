import React, { useState, useEffect } from 'react';
import { Post, CommentItem, PostCategory } from './types/blog';
import { INITIAL_POSTS } from './data/initialPosts';
import { Header } from './components/Header';
import { HeroFeatured } from './components/HeroFeatured';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { ArticleCard } from './components/ArticleCard';
import { ArticleView } from './components/ArticleView';
import { PostEditor } from './components/PostEditor';
import { StudioDashboard } from './components/StudioDashboard';
import { ReadingListModal } from './components/ReadingListModal';
import { VercelDeployGuideModal } from './components/VercelDeployGuideModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { Footer } from './components/Footer';

export default function App() {
  // 1. Posts state (persisted to localStorage)
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const stored = localStorage.getItem('chronicle_posts_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse stored posts', e);
    }
    return INITIAL_POSTS;
  });

  // Save to localStorage when posts change
  useEffect(() => {
    try {
      localStorage.setItem('chronicle_posts_v1', JSON.stringify(posts));
    } catch (e) {
      console.warn('Could not store posts to localStorage', e);
    }
  }, [posts]);

  // 2. Navigation & active views
  const [currentView, setCurrentView] = useState<'home' | 'post' | 'editor' | 'studio'>('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // 3. Saved reading list / bookmarks
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chronicle_saved_posts');
      return saved ? JSON.parse(saved) : ['post-1'];
    } catch {
      return ['post-1'];
    }
  });

  useEffect(() => {
    localStorage.setItem('chronicle_saved_posts', JSON.stringify(savedPostIds));
  }, [savedPostIds]);

  // 4. Dark mode state with <html> sync
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

  // 5. Modals state
  const [isReadingListOpen, setIsReadingListOpen] = useState(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatContextPost, setAiChatContextPost] = useState<Post | null>(null);
  const [openAiApiKey, setOpenAiApiKey] = useState<string>(() => {
    return localStorage.getItem('chronicle_custom_openai_key') || '';
  });

  const handleUpdateOpenAiApiKey = (key: string) => {
    setOpenAiApiKey(key);
    localStorage.setItem('chronicle_custom_openai_key', key);
  };

  // 6. Homepage Filter, Search & View Controls
  const [selectedCategory, setSelectedCategory] = useState<string>('All Stories');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'reading-time'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Categories list
  const categoriesList = [
    'All Stories',
    'Engineering',
    'Design',
    'Artificial Intelligence',
    'Culture & Society',
    'Essays & Thinking',
    'Founders & Startups',
  ];

  // Helper to toggle bookmark
  const handleToggleBookmark = (post: Post, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedPostIds((prev) =>
      prev.includes(post.id) ? prev.filter((id) => id !== post.id) : [...prev, post.id]
    );
  };

  // Post clap increment
  const handleUpdateClaps = (postId: string, newClaps: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, claps: newClaps } : p))
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) => (prev ? { ...prev, claps: newClaps } : null));
    }
  };

  // Add comment
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
    if (window.confirm('Are you sure you want to delete this story?')) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSavedPostIds((prev) => prev.filter((id) => id !== postId));
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
        setCurrentView('home');
      }
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

  // Export JSON backup
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(posts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chronicle_posts_backup_${new Date().toISOString().split('T')[0]}.json`);
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
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  // Open article
  const handleOpenPost = (post: Post) => {
    // Increment view count
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, views: (p.views || 0) + 1 } : p))
    );
    setSelectedPost({ ...post, views: (post.views || 0) + 1 });
    setCurrentView('post');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open AI Assistant with post context
  const handleOpenAiAssistantWithContext = (post: Post) => {
    setAiChatContextPost(post);
    setIsAiChatOpen(true);
  };

  // Computed featured post & remaining posts
  const publishedPosts = posts.filter((p) => p.status === 'published');
  const featuredPost =
    publishedPosts.find((p) => p.isFeatured) ||
    publishedPosts[0] ||
    posts[0];

  // Filtered & sorted posts for the catalog
  const filteredCatalogPosts = posts.filter((p) => {
    // Only published on public catalog (unless searching)
    const isPublic = p.status === 'published';
    const matchesCat = selectedCategory === 'All Stories' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return isPublic && matchesCat && matchesSearch;
  });

  const sortedCatalogPosts = [...filteredCatalogPosts].sort((a, b) => {
    if (sortBy === 'popular') return (b.claps || 0) - (a.claps || 0);
    if (sortBy === 'reading-time') return (a.readTimeMinutes || 0) - (b.readTimeMinutes || 0);
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  // Saved posts objects
  const savedPostsList = posts.filter((p) => savedPostIds.includes(p.id));

  // Compute total reads & posts for KPI strip
  const totalReads = posts.reduce((acc, p) => acc + (p.views || 0), 0);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200">
      {/* Universal Top Bar */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'editor') {
            setEditingPost(null);
          }
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenReadingList={() => setIsReadingListOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        onOpenAiChat={() => {
          setAiChatContextPost(null);
          setIsAiChatOpen(true);
        }}
        readingListCount={savedPostIds.length}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Content Area */}
      <main>
        {/* VIEW 1: HOME STORIES CATALOG */}
        {currentView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-3">
                <p className="font-editorial text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                  No matching essays found
                </p>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                  Try adjusting your search keywords or explore another category tab.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All Stories');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                >
                  Reset Filters
                </button>
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
            onOpenAiAssistantWithContext={handleOpenAiAssistantWithContext}
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
            openAiApiKey={openAiApiKey}
            onUpdateOpenAiApiKey={handleUpdateOpenAiApiKey}
          />
        )}

        {/* VIEW 4: STUDIO & CMS MANAGEMENT DASHBOARD */}
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
      </main>

      {/* Footer */}
      {currentView !== 'editor' && (
        <Footer
          onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
          onOpenAiChat={() => {
            setAiChatContextPost(null);
            setIsAiChatOpen(true);
          }}
          onNavigate={(view) => {
            if (view === 'editor') setEditingPost(null);
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
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

      <VercelDeployGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />

      <AiAssistantModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        activePost={aiChatContextPost}
        onClearContext={() => setAiChatContextPost(null)}
      />
    </div>
  );
}
