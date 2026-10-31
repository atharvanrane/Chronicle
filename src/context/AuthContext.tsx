import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { UserProfile, FollowRequest, NotificationItem, ReportItem } from '../types/blog';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAdmin: boolean;
  isAdminAuthenticated: boolean;
  isCreator: boolean;
  isLoading: boolean;
  allUsers: UserProfile[];
  bannedUserIds: string[];
  followRequests: FollowRequest[];
  notifications: NotificationItem[];
  reports: ReportItem[];
  unreadNotificationsCount: number;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (
    email: string,
    pass: string,
    displayName: string,
    username: string,
    role: 'admin' | 'creator' | 'reader',
    adminKey?: string,
    isPrivate?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  verifyAdminPassword: (password: string) => boolean;
  updateAdminPassword: (newPass: string) => void;
  followedUsers: string[];
  toggleFollow: (author: UserProfile | { username: string; displayName?: string; id?: string; isPrivate?: boolean }) => void;
  acceptFollowRequest: (requestId: string) => void;
  declineFollowRequest: (requestId: string) => void;
  markNotificationsAsRead: () => void;
  submitReport: (report: { type: 'post' | 'user' | 'comment'; targetId: string; targetTitleOrName: string; targetAuthorHandle?: string; reason: string }) => void;
  resolveReport: (reportId: string, action: 'ban_user' | 'dismiss') => void;
  adminRemoveUser: (userId: string) => void;
  adminBanUser: (userId: string, reason?: string) => void;
  adminUnbanUser: (userId: string) => void;
  adminUpdateUserRole: (userId: string, role: 'admin' | 'creator' | 'reader') => void;
  clearAllGarbageData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Master Admin Security Password (stored in localStorage or default 'admin2026!')
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('chronicle_admin_master_pwd') || 'admin2026!';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('chronicle_admin_auth_session') === 'true';
  });

  // 1. Registered Users (Starts empty or only real users)
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('chronicle_real_users_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('chronicle_real_users_v3', JSON.stringify(allUsers));
  }, [allUsers]);

  // 2. Current User (Starts null until user signs up or logs in)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('chronicle_real_current_user_v3');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('chronicle_real_current_user_v3', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('chronicle_real_current_user_v3');
    }
  }, [currentUser]);

  // 3. Followed Users
  const [followedUsers, setFollowedUsers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chronicle_real_followed_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('chronicle_real_followed_v3', JSON.stringify(followedUsers));
  }, [followedUsers]);

  // 4. Follow Requests (Starts empty)
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>(() => {
    try {
      const saved = localStorage.getItem('chronicle_real_follow_requests_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('chronicle_real_follow_requests_v3', JSON.stringify(followRequests));
  }, [followRequests]);

  // 5. Notifications (Starts empty)
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('chronicle_real_notifications_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('chronicle_real_notifications_v3', JSON.stringify(notifications));
  }, [notifications]);

  // 6. Reports moderation queue (Starts empty)
  const [reports, setReports] = useState<ReportItem[]>(() => {
    try {
      const saved = localStorage.getItem('chronicle_real_reports_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('chronicle_real_reports_v3', JSON.stringify(reports));
  }, [reports]);

  // 7. Banned user IDs
  const [bannedUserIds, setBannedUserIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chronicle_banned_user_ids_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('chronicle_banned_user_ids_v3', JSON.stringify(bannedUserIds));
  }, [bannedUserIds]);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Listen to Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  // Admin verification function with password
  const verifyAdminPassword = (enteredPassword: string): boolean => {
    if (enteredPassword.trim() === adminPassword.trim()) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('chronicle_admin_auth_session', 'true');
      return true;
    }
    return false;
  };

  const updateAdminPassword = (newPass: string) => {
    if (!newPass.trim()) return;
    setAdminPassword(newPass.trim());
    localStorage.setItem('chronicle_admin_master_pwd', newPass.trim());
  };

  // Google Login
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const user = res.user;
      const isOwnerEmail = user.email === 'atharvarane606@gmail.com';
      const role = isOwnerEmail ? 'admin' : 'creator';

      let profile = allUsers.find((u) => u.email === user.email || u.id === user.uid);
      if (!profile) {
        profile = {
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Google Member',
          username: (user.displayName || user.email?.split('@')[0] || 'member')
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, ''),
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
          role,
          bio: 'Writer at Chronicle.',
          followersCount: 0,
          followingCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          isPrivate: false,
        };
        setAllUsers((prev) => [profile!, ...prev]);
      }

      if (bannedUserIds.includes(profile.id)) {
        throw new Error('This account has been banned by administration for offensive content.');
      }

      setCurrentUser(profile);
      if (isOwnerEmail) {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('chronicle_admin_auth_session', 'true');
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Email Login
  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch {}

    const existing = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      if (bannedUserIds.includes(existing.id)) {
        setIsLoading(false);
        throw new Error('This account has been banned by administration for offensive content.');
      }
      setCurrentUser(existing);
      if (existing.role === 'admin' && pass === adminPassword) {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('chronicle_admin_auth_session', 'true');
      }
    } else {
      setIsLoading(false);
      throw new Error('No account found with this email. Please click "Sign Up" to create an account.');
    }
    setIsLoading(false);
  };

  // Email Signup with Admin Key Gate
  const signupWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    username: string,
    requestedRole: 'admin' | 'creator' | 'reader',
    adminKey?: string,
    isPrivate = false
  ) => {
    setIsLoading(true);

    // If attempting to signup as Admin, MUST supply the correct admin password
    if (requestedRole === 'admin') {
      if (!adminKey || adminKey.trim() !== adminPassword.trim()) {
        setIsLoading(false);
        throw new Error('Invalid Admin Security Key. Admin accounts are password-protected.');
      }
    }

    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch {}

    const finalRole = requestedRole === 'admin' ? 'admin' : requestedRole;

    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      email: email.trim(),
      displayName: displayName.trim() || email.split('@')[0],
      username: username.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '') || email.split('@')[0],
      photoURL: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username || email)}`,
      role: finalRole,
      bio: 'New member at Chronicle.',
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isPrivate,
    };

    setAllUsers((prev) => [profile, ...prev]);
    setCurrentUser(profile);

    if (finalRole === 'admin') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('chronicle_admin_auth_session', 'true');
    }

    setIsLoading(false);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setCurrentUser(null);
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('chronicle_admin_auth_session');
  };

  // Follow & Follow Request (Instagram feature)
  const toggleFollow = (author: UserProfile | { username: string; displayName?: string; id?: string; isPrivate?: boolean }) => {
    if (!currentUser) return;
    const authorHandle = author.username;
    const isCurrentlyFollowing = followedUsers.includes(authorHandle);

    if (isCurrentlyFollowing) {
      // Unfollow
      setFollowedUsers((prev) => prev.filter((u) => u !== authorHandle));
      setAllUsers((prev) =>
        prev.map((u) =>
          u.username === authorHandle ? { ...u, followersCount: Math.max(0, u.followersCount - 1) } : u
        )
      );
      return;
    }

    // Check if target author is a private account
    if (author.isPrivate) {
      const newReq: FollowRequest = {
        id: `req-${Date.now()}`,
        fromUserId: currentUser.id,
        fromUserName: currentUser.displayName,
        fromUserHandle: currentUser.username,
        fromUserAvatar: currentUser.photoURL,
        toUserId: author.id || authorHandle,
        toUserHandle: authorHandle,
        status: 'pending',
        createdAt: 'Just now',
      };

      setFollowRequests((prev) => [newReq, ...prev]);

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        type: 'follow_request',
        title: 'New Follow Request',
        message: `@${currentUser.username} requested to follow your private blog essays.`,
        fromUser: {
          name: currentUser.displayName,
          username: currentUser.username,
          avatar: currentUser.photoURL,
        },
        read: false,
        actionRequired: true,
        requestId: newReq.id,
        createdAt: 'Just now',
      };
      setNotifications((prev) => [newNotif, ...prev]);
      alert(`Follow request sent to @${authorHandle}. Since this author has a private blog, they will review your request.`);
    } else {
      // Instant follow for public accounts
      setFollowedUsers((prev) => [...prev, authorHandle]);
      setAllUsers((prev) =>
        prev.map((u) =>
          u.username === authorHandle ? { ...u, followersCount: u.followersCount + 1 } : u
        )
      );
    }
  };

  const acceptFollowRequest = (requestId: string) => {
    const req = followRequests.find((r) => r.id === requestId);
    if (!req) return;

    setFollowRequests((prev) => prev.filter((r) => r.id !== requestId));
    setNotifications((prev) =>
      prev.map((n) => (n.requestId === requestId ? { ...n, actionRequired: false, read: true, message: `You accepted @${req.fromUserHandle}'s follow request.` } : n))
    );

    if (currentUser) {
      setCurrentUser({ ...currentUser, followersCount: currentUser.followersCount + 1 });
      setAllUsers((prev) =>
        prev.map((u) => (u.id === currentUser.id ? { ...u, followersCount: u.followersCount + 1 } : u))
      );
    }
  };

  const declineFollowRequest = (requestId: string) => {
    setFollowRequests((prev) => prev.filter((r) => r.id !== requestId));
    setNotifications((prev) =>
      prev.map((n) => (n.requestId === requestId ? { ...n, actionRequired: false, read: true, message: `Follow request declined.` } : n))
    );
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const submitReport = (reportData: { type: 'post' | 'user' | 'comment'; targetId: string; targetTitleOrName: string; targetAuthorHandle?: string; reason: string }) => {
    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      ...reportData,
      reportedBy: currentUser?.username || 'anonymous',
      createdAt: 'Just now',
      status: 'pending',
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const resolveReport = (reportId: string, action: 'ban_user' | 'dismiss') => {
    const report = reports.find((r) => r.id === reportId);
    if (report && action === 'ban_user' && report.targetAuthorHandle) {
      const userToBan = allUsers.find((u) => u.username === report.targetAuthorHandle);
      if (userToBan) {
        adminBanUser(userToBan.id, report.reason);
      }
    }
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: action === 'dismiss' ? 'dismissed' : 'resolved' } : r))
    );
  };

  // Admin Account Controls
  const adminRemoveUser = (userId: string) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    setBannedUserIds((prev) => prev.filter((id) => id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
  };

  const adminBanUser = (userId: string, reason?: string) => {
    if (!bannedUserIds.includes(userId)) {
      setBannedUserIds((prev) => [...prev, userId]);
    }
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              isBanned: true,
              banReason: reason || 'Offensive content violation.',
              strikeCount: (u.strikeCount || 0) + 1,
            }
          : u
      )
    );
    if (currentUser?.id === userId) {
      alert('Your account has been suspended by administration for violating community standards.');
      setCurrentUser(null);
    }
  };

  const adminUnbanUser = (userId: string) => {
    setBannedUserIds((prev) => prev.filter((id) => id !== userId));
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBanned: false, banReason: undefined } : u))
    );
  };

  const adminUpdateUserRole = (userId: string, role: 'admin' | 'creator' | 'reader') => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  // Clear all leftover garbage data
  const clearAllGarbageData = () => {
    localStorage.removeItem('chronicle_posts_v1');
    localStorage.removeItem('chronicle_posts_v2');
    localStorage.removeItem('chronicle_all_users_v2');
    localStorage.removeItem('chronicle_current_user');
    localStorage.removeItem('chronicle_current_user_v2');
    localStorage.removeItem('chronicle_follow_requests');
    localStorage.removeItem('chronicle_notifications');
    localStorage.removeItem('chronicle_reports');
    setAllUsers([]);
    setCurrentUser(null);
    setFollowRequests([]);
    setNotifications([]);
    setReports([]);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'atharvarane606@gmail.com';
  const isCreator = isAdmin || currentUser?.role === 'creator';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAdmin,
        isAdminAuthenticated,
        isCreator,
        isLoading,
        allUsers,
        bannedUserIds,
        followRequests,
        notifications,
        reports,
        unreadNotificationsCount,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        verifyAdminPassword,
        updateAdminPassword,
        followedUsers,
        toggleFollow,
        acceptFollowRequest,
        declineFollowRequest,
        markNotificationsAsRead,
        submitReport,
        resolveReport,
        adminRemoveUser,
        adminBanUser,
        adminUnbanUser,
        adminUpdateUserRole,
        clearAllGarbageData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
