import React, { useState } from 'react';
import {
  X,
  Lock,
  Key,
  ShieldCheck,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
  Copy,
  Check,
  KeyRound,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup' | 'forgot_password';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const {
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    resetUserPassword,
    sendFirebasePasswordReset,
    isLoading,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'admin' | 'creator' | 'reader'>('creator');
  const [adminSecurityKey, setAdminSecurityKey] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDomainNotice, setShowDomainNotice] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleCopyHost = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentHost);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowDomainNotice(false);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        await signupWithEmail(email, password, displayName, username, role, adminSecurityKey, isPrivate);
        onClose();
      } else if (mode === 'forgot_password') {
        if (!email.trim()) {
          setErrorMsg('Please enter your account email address.');
          return;
        }
        if (newPassword.length < 6) {
          setErrorMsg('New password must be at least 6 characters.');
          return;
        }
        if (newPassword !== confirmPassword) {
          setErrorMsg('Passwords do not match. Please retype carefully.');
          return;
        }
        const res = await resetUserPassword(email, newPassword);
        setSuccessMsg(res.message);
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed. Please verify credentials.');
    }
  };

  const handleSendEmailReset = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email address to receive a reset link.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await sendFirebasePasswordReset(email);
    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg(null);
    setShowDomainNotice(false);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('UNAUTHORIZED_DOMAIN') || msg.includes('auth/unauthorized-domain')) {
        setShowDomainNotice(true);
        setErrorMsg('Firebase Google Sign-In blocked: This domain needs to be whitelisted in Firebase Console.');
      } else {
        setErrorMsg(msg || 'Google sign in failed');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-850/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-editorial font-bold text-base shadow-xs">
              C
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'signup' && 'Create Your Account'}
                {mode === 'forgot_password' && 'Reset Account Password'}
              </h3>
              <p className="text-[11px] font-mono text-neutral-400">
                {mode === 'login' && 'Sign in to Chronicle: The Instagram of Blogs'}
                {mode === 'signup' && 'Join the community of longform essayists'}
                {mode === 'forgot_password' && 'Recover access to your account'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Google Sign In (for login/signup modes) */}
          {mode !== 'forgot_password' && (
            <>
              <button
                onClick={handleGoogle}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                <span className="absolute px-3 bg-white dark:bg-neutral-900 text-[10px] font-mono text-neutral-400">
                  OR WITH EMAIL
                </span>
              </div>
            </>
          )}

          {/* Domain Notice Banner (if Google auth blocked) */}
          {showDomainNotice && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs animate-in fade-in">
              <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Google OAuth Domain Whitelist Notice</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Firebase restricts Google sign-in popups until the host domain is whitelisted in <strong>Firebase Console → Authentication → Settings → Authorized domains</strong>.
              </p>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px]">
                <span className="truncate text-neutral-700 dark:text-neutral-300">{currentHost}</span>
                <button
                  type="button"
                  onClick={handleCopyHost}
                  className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline font-semibold shrink-0"
                >
                  {copiedDomain ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDomain ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[10px] text-neutral-500">
                You can sign in directly with your Email and Password below.
              </p>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs leading-relaxed">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs leading-relaxed flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FORM: Login / Signup / Reset */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Signup Fields */}
            {mode === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Instagram Handle / Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Account Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium"
                  >
                    <option value="creator">✍️ Blog Author / Creator</option>
                    <option value="reader">📖 Reader & Commenter</option>
                    <option value="admin">🔒 Administrator (Password Required)</option>
                  </select>
                </div>

                {role === 'admin' && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200 text-xs">
                      <Key className="w-3.5 h-3.5" />
                      <span>Admin Passkey Required</span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                      Enter the administrator security key to authorize this role.
                    </p>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={adminSecurityKey}
                      onChange={(e) => setAdminSecurityKey(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-neutral-900 font-mono text-xs"
                    />
                  </div>
                )}

                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Private Blog Account
                      </span>
                      <p className="text-[11px] text-neutral-500">
                        Requires follow requests before people can read your posts.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-500"
                    />
                  </label>
                </div>
              </>
            )}

            {/* Email Field (Common to all modes) */}
            <div className="space-y-1">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            {/* Password Field (Login / Signup) */}
            {mode !== 'forgot_password' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg(null);
                        setSuccessMsg(null);
                        setMode('forgot_password');
                      }}
                      className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Reset Password Fields */}
            {mode === 'forgot_password' && (
              <div className="space-y-3 pt-1 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-semibold">
                  <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Set New Password</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-500">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-500">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : (
                mode === 'login' ? 'Sign In' :
                mode === 'signup' ? 'Create Account' :
                'Reset & Save New Password'
              )}
            </button>

            {/* Secondary Firebase Email Reset Option */}
            {mode === 'forgot_password' && (
              <button
                type="button"
                onClick={handleSendEmailReset}
                disabled={isLoading}
                className="w-full py-2 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Or Send Firebase Reset Email</span>
              </button>
            )}
          </form>

          {/* Mode Switcher Footer */}
          <div className="pt-2 text-center text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-850">
            {mode === 'login' && (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setMode('signup');
                  }}
                  className="font-semibold text-neutral-900 dark:text-white hover:underline"
                >
                  Sign Up
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setMode('login');
                  }}
                  className="font-semibold text-neutral-900 dark:text-white hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}

            {mode === 'forgot_password' && (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode('login');
                }}
                className="inline-flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-white hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
