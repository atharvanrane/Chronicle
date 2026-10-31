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
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile } from '../types/blog';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAdmin: boolean;
  isCreator: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, displayName: string, username: string, role: 'admin' | 'creator' | 'reader') => Promise<void>;
  logout: () => Promise<void>;
  switchDemoAccount: (role: 'admin' | 'creator' | 'reader') => void;
  followedUsers: string[];
  toggleFollow: (authorIdOrUsername: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Preset demo accounts for instant testing
const DEMO_ACCOUNTS: Record<'admin' | 'creator' | 'reader', UserProfile> = {
  admin: {
    id: 'user-admin-atharva',
    email: 'atharvarane606@gmail.com',
    displayName: 'Atharva Rane',
    username: 'atharva_admin',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    bio: 'Lead Architect & Chief Editor at Chronicle Publishing Studio. Admin privileges active.',
    followersCount: 1420,
    followingCount: 88,
    createdAt: '2026-01-15',
  },
  creator: {
    id: 'user-creator-elena',
    email: 'elena.rostova@chronicle.com',
    displayName: 'Elena Rostova',
    username: 'elena_arch',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'creator',
    bio: 'Systems Architect, essayist, and typography enthusiast.',
    followersCount: 890,
    followingCount: 112,
    createdAt: '2026-02-10',
  },
  reader: {
    id: 'user-reader-marcus',
    email: 'marcus.vance@gmail.com',
    displayName: 'Marcus Vance',
    username: 'marcus_v',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'reader',
    bio: 'Avid reader of digital craft essays and architecture books.',
    followersCount: 42,
    followingCount: 65,
    createdAt: '2026-05-20',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('chronicle_current_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    // Default to Atharva (admin) so the user experiences full admin controls immediately
    return DEMO_ACCOUNTS.admin;
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chronicle_followed_users');
      return saved ? JSON.parse(saved) : ['elena_arch', 'julian_type'];
    } catch {
      return ['elena_arch', 'julian_type'];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('chronicle_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('chronicle_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('chronicle_followed_users', JSON.stringify(followedUsers));
  }, [followedUsers]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as UserProfile);
          } else {
            const role = user.email === 'atharvarane606@gmail.com' ? 'admin' : 'creator';
            const newProfile: UserProfile = {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Member',
              username: (user.displayName || user.email?.split('@')[0] || 'member').toLowerCase().replace(/\s+/g, '_'),
              photoURL: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
              role,
              bio: 'Chronicle writer and reader.',
              followersCount: 0,
              followingCount: 0,
              createdAt: new Date().toISOString().split('T')[0],
            };
            await setDoc(doc(db, 'users', user.uid), newProfile);
            setCurrentUser(newProfile);
          }
        } catch (err) {
          console.warn('Firestore fetch user profile warning:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const user = res.user;
      const role = user.email === 'atharvarane606@gmail.com' ? 'admin' : 'creator';
      const profile: UserProfile = {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Google User',
        username: (user.displayName || 'user').toLowerCase().replace(/\s+/g, '_'),
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
        role,
        bio: 'Chronicle creator.',
        followersCount: 0,
        followingCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCurrentUser(profile);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const user = res.user;
      const role = user.email === 'atharvarane606@gmail.com' ? 'admin' : 'creator';
      const profile: UserProfile = {
        id: user.uid,
        email: user.email || email,
        displayName: user.displayName || email.split('@')[0],
        username: email.split('@')[0].toLowerCase().replace(/\s+/g, '_'),
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
        role,
        bio: 'Chronicle member.',
        followersCount: 0,
        followingCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCurrentUser(profile);
    } catch (err: any) {
      console.warn('Firebase email auth fallback:', err);
      // Fallback for demo simulation if offline
      const role = email.includes('admin') || email === 'atharvarane606@gmail.com' ? 'admin' : 'creator';
      const profile: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        username: email.split('@')[0].toLowerCase().replace(/\s+/g, '_'),
        photoURL: `https://api.dicebear.com/7.x/identicon/svg?seed=${email}`,
        role,
        bio: 'Chronicle registered member.',
        followersCount: 0,
        followingCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCurrentUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    username: string,
    role: 'admin' | 'creator' | 'reader'
  ) => {
    setIsLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const user = res.user;
      const profile: UserProfile = {
        id: user.uid,
        email,
        displayName: displayName || email.split('@')[0],
        username: username.replace(/^@/, '') || email.split('@')[0],
        photoURL: `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
        role: email === 'atharvarane606@gmail.com' ? 'admin' : role,
        bio: 'Chronicle registered writer.',
        followersCount: 0,
        followingCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      await setDoc(doc(db, 'users', user.uid), profile);
      setCurrentUser(profile);
    } catch (err: any) {
      console.warn('Firebase signup fallback:', err);
      const profile: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        displayName: displayName || email.split('@')[0],
        username: username.replace(/^@/, '') || email.split('@')[0],
        photoURL: `https://api.dicebear.com/7.x/identicon/svg?seed=${email}`,
        role: email === 'atharvarane606@gmail.com' ? 'admin' : role,
        bio: 'Chronicle registered writer.',
        followersCount: 0,
        followingCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCurrentUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setCurrentUser(null);
  };

  const switchDemoAccount = (role: 'admin' | 'creator' | 'reader') => {
    setCurrentUser(DEMO_ACCOUNTS[role]);
  };

  const toggleFollow = (authorKey: string) => {
    setFollowedUsers((prev) =>
      prev.includes(authorKey)
        ? prev.filter((k) => k !== authorKey)
        : [...prev, authorKey]
    );
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'atharvarane606@gmail.com';
  const isCreator = isAdmin || currentUser?.role === 'creator';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAdmin,
        isCreator,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        switchDemoAccount,
        followedUsers,
        toggleFollow,
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
