import React from 'react';
import { X, Heart, UserPlus, MessageSquare, Check, Trash2, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPostById?: (postId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onSelectPostById,
}) => {
  const {
    notifications,
    followRequests,
    acceptFollowRequest,
    declineFollowRequest,
    markNotificationsAsRead,
  } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-850/60">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Activity & Notifications
            </h3>
          </div>

          <button
            onClick={() => {
              markNotificationsAsRead();
              onClose();
            }}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Section 1: Follow Requests (Instagram feature for private blogs) */}
          {followRequests.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Follow Requests ({followRequests.length})
              </h4>
              <div className="space-y-2.5">
                {followRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={req.fromUserAvatar}
                        alt={req.fromUserName}
                        className="w-10 h-10 rounded-full object-cover border border-amber-300 dark:border-amber-700"
                      />
                      <div>
                        <h5 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                          {req.fromUserName}
                        </h5>
                        <p className="text-[11px] font-mono text-neutral-500">
                          @{req.fromUserHandle} · wants to read your private essays
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => acceptFollowRequest(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => declineFollowRequest(req.id)}
                        className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 text-neutral-400 hover:text-rose-500 transition-colors"
                        title="Delete request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: General Activity notifications */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Recent Engagement
            </h4>
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition-colors flex items-start gap-3 ${
                    notif.read
                      ? 'border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                      : 'border-neutral-200 dark:border-neutral-750 bg-neutral-50/70 dark:bg-neutral-850/40'
                  }`}
                >
                  <div className="mt-0.5">
                    {notif.type === 'like' && (
                      <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-500 flex items-center justify-center">
                        <Heart className="w-4 h-4 fill-current" />
                      </div>
                    )}
                    {notif.type === 'follow_request' && (
                      <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center">
                        <UserPlus className="w-4 h-4" />
                      </div>
                    )}
                    {notif.type === 'comment' && (
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-500 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-snug">
                      {notif.message}
                    </p>
                    <span className="text-[10px] font-mono text-neutral-400">{notif.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
