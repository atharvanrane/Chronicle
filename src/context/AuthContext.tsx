import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { UserProfile, FollowRequest, NotificationItem, ReportItem } from '../types/blog';

export const OWNER_ADMIN_EMAIL = 'atharvarane606@gmail.com';

export interface UserCredentialRecord {
  email: string;
  password?: string;
  updatedAt?: string;
}

export const createOwnerAdminProfile = (): UserProfile => ({
  id: 'admin-owner-atharva',
  email: OWNER_ADMIN_EMAIL,
  displayName: 'Atharva Rane (Admin)',
  username: 'atharva_admin',
  photoURL: 'https://api.dicebear.com/7.x/identicon/svg?seed=atharvarane606',
  role: 'admin',
  bio: 'Platform Owner & Administrator at Chronicle.',
  followersCount: 0,
  followingCount: 0,
  createdAt: '2026-01-01',
  isPrivate: false,
});

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
  quickOwnerAdminLogin: () => void;
  signupWithEmail: (
    email: string,
    pass: string,
    displayName: string,
    username: string,
    role: 'admin' | 'creator' | 'reader',
    adminKey?: string,
    isPrivate?: boolean
  ) => Promise<void>;
  resetUserPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  changeAccountPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  sendFirebasePasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  adminResetUserPassword: (userId: string, newPassword: string) => { success: boolean; message: string; tempPass: string };
  adminGetAccountCredentialsInfo: (userId: string) => { email: string; hasStoredPassword: boolean; isBanned: boolean; lastResetAt?: string };
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

  // Local credentials store to guarantee reliable email/password login and password resets
  const [userCredentials, setUserCredentials] = useState<Record<string, UserCredentialRecord>>(() => {
    try {
      const saved = localStorage.getItem('chronicle_user_credentials_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed[OWNER_ADMIN_EMAIL.toLowerCase()]) {
          parsed[OWNER_ADMIN_EMAIL.toLowerCase()] = {
            email: OWNER_ADMIN_EMAIL,
            password: 'admin2026',
            updatedAt: '2026-01-01',
          };
        }
        return parsed;
      }
    } catch {}
    return {
      [OWNER_ADMIN_EMAIL.toLowerCase()]: {
        email: OWNER_ADMIN_EMAIL,
        password: 'admin2026',
        updatedAt: '2026-01-01',
      },
    };
  });

  useEffect(() => {
    localStorage.setItem('chronicle_user_credentials_v2', JSON.stringify(userCredentials));
  }, [userCredentials]);

  // 1. Registered Users (Always guarantees owner admin is present; excludes garbage accounts)
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('chronicle_real_users_v3');
      if (saved) {
        const parsed: UserProfile[] = JSON.parse(saved);
        const filtered = parsed.filter(
          (u) =>
            u.email.toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase() ||
            (!u.email.endsWith('@chronicle.local') &&
             !u.id.includes('elena') &&
             !u.id.includes('marcus') &&
             !u.id.includes('sarah') &&
             !u.username.includes('elena') &&
             !u.username.includes('marcus') &&
             !u.username.includes('sarah'))
        );
        if (!filtered.some((u) => u.email.toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase())) {
          return [createOwnerAdminProfile(), ...filtered];
        }
        return filtered;
      }
    } catch {}
    return [createOwnerAdminProfile()];
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

  // 5. Notifications
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

  // 6. Reports moderation queue
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
      const saved = localStorage.getItem('chronicle_banned_users_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('chronicle_banned_users_v3', JSON.stringify(bannedUserIds));
  }, [bannedUserIds]);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  // Admin verification function with password - accepts admin2026, admin2026!, or custom passkey
  const verifyAdminPassword = (enteredPassword: string): boolean => {
    const clean = enteredPassword.trim();
    if (
      clean === adminPassword.trim() ||
      clean === 'admin2026' ||
      clean === 'admin2026!' ||
      clean === userCredentials[OWNER_ADMIN_EMAIL.toLowerCase()]?.password
    ) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('chronicle_admin_auth_session', 'true');
      return true;
    }
    return false;
  };

  const updateAdminPassword = (newPass: string) => {
    if (!newPass.trim()) return;
    const clean = newPass.trim();
    setAdminPassword(clean);
    localStorage.setItem('chronicle_admin_master_pwd', clean);
    // Also update owner credentials password
    setUserCredentials((prev) => ({
      ...prev,
      [OWNER_ADMIN_EMAIL.toLowerCase()]: {
        email: OWNER_ADMIN_EMAIL,
        password: clean,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  // Quick 1-click fallback login as Owner Admin
  const quickOwnerAdminLogin = () => {
    let owner = allUsers.find((u) => u.email.toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase());
    if (!owner) {
      owner = createOwnerAdminProfile();
      setAllUsers((prev) => [owner!, ...prev]);
    }
    setCurrentUser(owner);
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('chronicle_admin_auth_session', 'true');
  };

  // Google Login with helpful unauthorized-domain handling
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const user = res.user;
      const isOwnerEmail = user.email?.toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase();
      const role = isOwnerEmail ? 'admin' : 'creator';

      let profile = allUsers.find((u) => u.email.toLowerCase() === user.email?.toLowerCase() || u.id === user.uid);
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
      const isUnauthorizedDomain =
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('auth/unauthorized-domain');
      if (isUnauthorizedDomain) {
        throw new Error(
          'UNAUTHORIZED_DOMAIN: Firebase needs this domain in its Authorized Domains whitelist. You can use Email/Password sign in below or click "Quick Admin Access" to sign in immediately.'
        );
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Email Login supporting atharvarane606@gmail.com with admin2026/admin2026! and all user credentials
  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPass = pass.trim();

    // 1. Owner Admin Access Check
    if (normalizedEmail === OWNER_ADMIN_EMAIL.toLowerCase()) {
      const isPassValid =
        normalizedPass === 'admin2026' ||
        normalizedPass === 'admin2026!' ||
        normalizedPass === adminPassword.trim() ||
        normalizedPass === userCredentials[normalizedEmail]?.password;

      if (isPassValid) {
        let owner = allUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
        if (!owner) {
          owner = createOwnerAdminProfile();
          setAllUsers((prev) => [owner!, ...prev]);
        }
        setCurrentUser(owner);
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('chronicle_admin_auth_session', 'true');
        setIsLoading(false);
        return;
      }
    }

    // 2. Regular User Login
    const existing = allUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!existing) {
      setIsLoading(false);
      throw new Error('No account found with this email. Please click "Sign Up" to create an account.');
    }

    if (bannedUserIds.includes(existing.id)) {
      setIsLoading(false);
      throw new Error('This account has been banned by administration for offensive content.');
    }

    // Check against local stored credentials
    const storedCred = userCredentials[normalizedEmail];
    if (storedCred?.password && storedCred.password === normalizedPass) {
      setCurrentUser(existing);
      if (existing.role === 'admin') {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('chronicle_admin_auth_session', 'true');
      }
      setIsLoading(false);
      return;
    }

    // Also attempt Firebase Auth if available
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setCurrentUser(existing);
      if (existing.role === 'admin') {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('chronicle_admin_auth_session', 'true');
      }
      setIsLoading(false);
      return;
    } catch {
      // If neither matched
      setIsLoading(false);
      throw new Error('Incorrect password. Click "Forgot Password?" below to reset your password.');
    }
  };

  // Email Signup
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
    const normalizedEmail = email.toLowerCase().trim();

    // If attempting to signup as Admin, MUST supply the correct admin password
    if (requestedRole === 'admin') {
      const cleanKey = adminKey?.trim() || '';
      const isKeyValid =
        cleanKey === adminPassword.trim() ||
        cleanKey === 'admin2026' ||
        cleanKey === 'admin2026!';
      if (!isKeyValid) {
        setIsLoading(false);
        throw new Error('Invalid Admin Security Key. Administrator accounts are password-protected.');
      }
    }

    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch {}

    const isOwner = normalizedEmail === OWNER_ADMIN_EMAIL.toLowerCase();
    const finalRole = isOwner ? 'admin' : requestedRole;

    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      email: normalizedEmail,
      displayName: displayName.trim() || email.split('@')[0],
      username: username.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '') || email.split('@')[0],
      photoURL: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username || email)}`,
      role: finalRole,
      bio: 'New member at Chronicle.',
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isPrivate,
      passwordUpdatedAt: new Date().toISOString(),
    };

    // Store credentials
    setUserCredentials((prev) => ({
      ...prev,
      [normalizedEmail]: {
        email: normalizedEmail,
        password: pass.trim(),
        updatedAt: new Date().toISOString(),
      },
    }));

    setAllUsers((prev) => [profile, ...prev.filter((u) => u.email.toLowerCase() !== normalizedEmail)]);
    setCurrentUser(profile);

    if (finalRole === 'admin') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('chronicle_admin_auth_session', 'true');
    }

    setIsLoading(false);
  };

  // Self-serve user password reset
  const resetUserPassword = async (email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = allUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      throw new Error(`No account found matching email "${email}". Please verify your email.`);
    }

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // Update credential record
    setUserCredentials((prev) => ({
      ...prev,
      [normalizedEmail]: {
        email: normalizedEmail,
        password: newPassword.trim(),
        updatedAt: new Date().toISOString(),
      },
    }));

    // Update timestamp on profile
    setAllUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, passwordUpdatedAt: new Date().toISOString() } : u))
    );

    if (currentUser?.id === user.id) {
      setCurrentUser((prev) => (prev ? { ...prev, passwordUpdatedAt: new Date().toISOString() } : null));
    }

    return {
      success: true,
      message: `Password for ${user.displayName} (@${user.username}) has been successfully updated. You can now log in with your new password.`,
    };
  };

  // In-app password change for logged in user
  const changeAccountPassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) throw new Error('You must be logged in to change your password.');
    const normalizedEmail = currentUser.email.toLowerCase().trim();

    // Validate current password
    const stored = userCredentials[normalizedEmail];
    const isCurrentValid =
      stored?.password === currentPassword.trim() ||
      (normalizedEmail === OWNER_ADMIN_EMAIL.toLowerCase() &&
        (currentPassword.trim() === 'admin2026' || currentPassword.trim() === 'admin2026!' || currentPassword.trim() === adminPassword));

    if (stored?.password && !isCurrentValid) {
      throw new Error('Current password does not match our records.');
    }

    return resetUserPassword(currentUser.email, newPassword);
  };

  // Send Firebase password reset email with graceful catch
  const sendFirebasePasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return {
        success: true,
        message: `Password reset link sent to ${email}. Please check your inbox and spam folder.`,
      };
    } catch (err: any) {
      const isUnauthorizedDomain =
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('auth/unauthorized-domain');
      if (isUnauthorizedDomain) {
        return {
          success: false,
          message:
            'Firebase Auth domain is not yet whitelisted for automated emails. Please use the "Direct Password Reset" option below to reset your password immediately.',
        };
      }
      return {
        success: false,
        message: err?.message || 'Could not send reset email. Please try direct password reset.',
      };
    }
  };

  // Administrator Account Recovery: Reset any user's password directly
  const adminResetUserPassword = (userId: string, newPassword: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error('User not found.');
    }
    const cleanPass = newPassword.trim();
    if (cleanPass.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const normalizedEmail = user.email.toLowerCase().trim();
    setUserCredentials((prev) => ({
      ...prev,
      [normalizedEmail]: {
        email: normalizedEmail,
        password: cleanPass,
        updatedAt: new Date().toISOString(),
      },
    }));

    // Update profile and automatically remove ban if user was locked
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, passwordUpdatedAt: new Date().toISOString(), isBanned: false, banReason: undefined } : u
      )
    );
    setBannedUserIds((prev) => prev.filter((id) => id !== userId));

    // Create an audit notification
    const auditNotice: NotificationItem = {
      id: `admin-rec-${Date.now()}`,
      type: 'admin_notice',
      title: 'Account Password Reset by Administrator',
      message: `Admin recovered and updated password for @${user.username} (${user.email}).`,
      createdAt: 'Just now',
      read: false,
    };
    setNotifications((prev) => [auditNotice, ...prev]);

    return {
      success: true,
      message: `Account credentials for ${user.displayName} (@${user.username}) have been updated.`,
      tempPass: cleanPass,
    };
  };

  // Helper to inspect credential status for admin modal
  const adminGetAccountCredentialsInfo = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return { email: '', hasStoredPassword: false, isBanned: false };
    const cred = userCredentials[user.email.toLowerCase()];
    return {
      email: user.email,
      hasStoredPassword: !!cred?.password,
      isBanned: bannedUserIds.includes(user.id) || !!user.isBanned,
      lastResetAt: cred?.updatedAt || user.passwordUpdatedAt,
    };
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
      prev.map((n) =>
        n.requestId === requestId
          ? { ...n, actionRequired: false, read: true, message: `You accepted @${req.fromUserHandle}'s follow request.` }
          : n
      )
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
      prev.map((n) =>
        n.requestId === requestId
          ? { ...n, actionRequired: false, read: true, message: `Follow request declined.` }
          : n
      )
    );
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const submitReport = (reportData: {
    type: 'post' | 'user' | 'comment';
    targetId: string;
    targetTitleOrName: string;
    targetAuthorHandle?: string;
    reason: string;
  }) => {
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
    localStorage.removeItem('chronicle_posts_v3');
    localStorage.removeItem('chronicle_all_users_v2');
    localStorage.removeItem('chronicle_real_users_v3');
    localStorage.removeItem('chronicle_current_user');
    localStorage.removeItem('chronicle_current_user_v2');
    localStorage.removeItem('chronicle_real_current_user_v3');
    localStorage.removeItem('chronicle_stories_v3');
    localStorage.removeItem('chronicle_user_likes_v3');
    localStorage.removeItem('chronicle_real_followed_v3');
    localStorage.removeItem('chronicle_follow_requests');
    localStorage.removeItem('chronicle_notifications');
    localStorage.removeItem('chronicle_reports');
    setAllUsers([createOwnerAdminProfile()]);
    setCurrentUser(null);
    setFollowRequests([]);
    setNotifications([]);
    setReports([]);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase();
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
        quickOwnerAdminLogin,
        signupWithEmail,
        resetUserPassword,
        changeAccountPassword,
        sendFirebasePasswordReset,
        adminResetUserPassword,
        adminGetAccountCredentialsInfo,
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
