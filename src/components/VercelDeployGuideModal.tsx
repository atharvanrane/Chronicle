import React, { useState } from 'react';
import {
  Rocket,
  X,
  Check,
  Copy,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Globe,
  GitBranch,
} from 'lucide-react';

interface VercelDeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelDeployGuideModal: React.FC<VercelDeployGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedVercelJson, setCopiedVercelJson] = useState(false);
  const [copiedGitCommands, setCopiedGitCommands] = useState(false);

  if (!isOpen) return null;

  const vercelJsonContent = `{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}`;

  const gitCommands = `git init
git add .
git commit -m "Feat: Complete Chronicle Blog Platform with AI Studio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chronicle-blog.git
git push -u origin main`;

  const copyToClipboard = (text: string, type: 'json' | 'git') => {
    navigator.clipboard.writeText(text);
    if (type === 'json') {
      setCopiedVercelJson(true);
      setTimeout(() => setCopiedVercelJson(false), 2000);
    } else {
      setCopiedGitCommands(true);
      setTimeout(() => setCopiedGitCommands(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-850/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>Free Hosting on Vercel & the Internet</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  100% Free Forever
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                Deploy your blog with custom domains, automatic SSL, and zero server fees.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-8 text-neutral-800 dark:text-neutral-200">
          {/* Quick Summary Banner */}
          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3 text-xs leading-relaxed">
            <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-amber-900 dark:text-amber-200">
                Yes! You can host this website completely for free.
              </span>{' '}
              <span className="text-neutral-600 dark:text-neutral-300">
                Vercel provides a generous Hobby tier that gives you unlimited traffic, free SSL certificates, automated deployments from GitHub, and global CDN caching at zero cost.
              </span>
            </div>
          </div>

          {/* 4-Step Deployment Walkthrough */}
          <div className="space-y-6">
            <h3 className="font-editorial text-lg font-bold text-neutral-900 dark:text-neutral-100">
              4 Easy Steps to Deploy to Vercel
            </h3>

            {/* Step 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                <span className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Push your project to GitHub</span>
              </div>
              <p className="text-xs text-neutral-500 pl-7">
                Initialize a Git repository and push your blog code to a free GitHub repository:
              </p>
              <div className="ml-7 relative p-3 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs border border-neutral-800 overflow-x-auto">
                <pre>{gitCommands}</pre>
                <button
                  onClick={() => copyToClipboard(gitCommands, 'git')}
                  className="absolute top-2 right-2 p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                  title="Copy git commands"
                >
                  {copiedGitCommands ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                <span className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Import into Vercel</span>
              </div>
              <p className="text-xs text-neutral-500 pl-7">
                Navigate to <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-amber-600 hover:underline inline-flex items-center gap-0.5">vercel.com <ExternalLink className="w-2.5 h-2.5" /></a>, sign in with your GitHub account, and click <strong>"Add New..." → "Project"</strong>. Select your repository.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                <span className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Configure Environment Variables</span>
              </div>
              <p className="text-xs text-neutral-500 pl-7">
                Under the <strong>Environment Variables</strong> section in Vercel settings, add your AI keys so that the SEO and Copilot features function on your live production domain:
              </p>
              <div className="ml-7 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 font-mono text-xs border border-neutral-200 dark:border-neutral-700 space-y-1">
                <div><span className="text-neutral-400">GEMINI_API_KEY</span> = <span className="text-amber-600">your-api-key-here</span></div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                <span className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-[10px]">
                  4
                </span>
                <span>Click "Deploy"</span>
              </div>
              <p className="text-xs text-neutral-500 pl-7">
                Within 60 seconds, Vercel will build and publish your blog to a live URL (e.g. <span className="font-mono text-neutral-700 dark:text-neutral-300">https://your-blog.vercel.app</span>). Every future git commit to your main branch will auto-deploy!
              </p>
            </div>
          </div>

          {/* Vercel.json configuration */}
          <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-base font-bold text-neutral-900 dark:text-neutral-100">
                Optional: vercel.json Configuration
              </h3>
              <button
                onClick={() => copyToClipboard(vercelJsonContent, 'json')}
                className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"
              >
                {copiedVercelJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedVercelJson ? 'Copied' : 'Copy vercel.json'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto border border-neutral-800">
              {vercelJsonContent}
            </pre>
          </div>

          {/* Alternative Free Hosting Platforms */}
          <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <h3 className="font-editorial text-base font-bold text-neutral-900 dark:text-neutral-100">
              Other 100% Free Hosting Alternatives
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 space-y-1">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Cloudflare Pages</span>
                <p className="text-neutral-500">Unlimited bandwidth, world-class edge speed, zero cost forever.</p>
              </div>
              <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 space-y-1">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Netlify</span>
                <p className="text-neutral-500">100GB monthly bandwidth, instant rollbacks, drag-and-drop deploy.</p>
              </div>
              <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 space-y-1">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">GitHub Pages</span>
                <p className="text-neutral-500">Host directly from your GitHub repo under github.io subdomains.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
