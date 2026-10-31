import React, { useState } from 'react';
import { X, Flag, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'post' | 'user' | 'comment';
  targetId: string;
  targetTitleOrName: string;
  targetAuthorHandle?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitleOrName,
  targetAuthorHandle,
}) => {
  const { submitReport } = useAuth();
  const [reason, setReason] = useState('Offensive or Inappropriate Content');
  const [customDetails, setCustomDetails] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport({
      type: targetType,
      targetId,
      targetTitleOrName,
      targetAuthorHandle,
      reason: `${reason}: ${customDetails || 'Reported for community review'}`,
    });
    onClose();
  };

  const reasonOptions = [
    'Offensive or Inappropriate Content',
    'Hate Speech, Harassment, or Abuse',
    'Spam, Bot Phishing, or Scam',
    'Plagiarism or Intellectual Property Violation',
    'Misinformation or Defamation',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-rose-600">
            <Flag className="w-5 h-5" />
            <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Report Content to Admins
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1 text-xs">
          <p className="font-semibold text-neutral-800 dark:text-neutral-200">
            Report target: <span className="font-normal text-neutral-500">"{targetTitleOrName}"</span>
          </p>
          {targetAuthorHandle && (
            <p className="font-mono text-neutral-400">Author: @{targetAuthorHandle}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-2">
            <label className="font-semibold text-neutral-700 dark:text-neutral-300">
              Reason for reporting:
            </label>
            <div className="space-y-1.5">
              {reasonOptions.map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={opt}
                    checked={reason === opt}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-neutral-800 dark:text-neutral-200">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-neutral-700 dark:text-neutral-300">
              Additional context or details (optional):
            </label>
            <textarea
              rows={2}
              placeholder="Explain why this content violates community guidelines..."
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
