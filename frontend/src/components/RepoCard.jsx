import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GitBranch, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Trash2, 
  Play, 
  Shield, 
  Cpu, 
  FileText, 
  Eye, 
  Loader2,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { updateRepoSettings, deleteRepo, simulateReview } from '../api';

export default function RepoCard({ repo, onRepoUpdated, onRepoDeleted, onReviewSimulated }) {
  const [showSettings, setShowSettings] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Settings form state
  const [focus, setFocus] = useState(repo.settings?.reviewFocus || 'full');
  const [minSeverity, setMinSeverity] = useState(repo.settings?.minSeverity || 'low');
  const [isActive, setIsActive] = useState(repo.isActive !== false);

  const encodedName = encodeURIComponent(repo.name);
  const repoId = repo._id || repo.id;

  const getFocusBadge = (f) => {
    switch (f) {
      case 'security':
        return { label: 'Security', icon: <Shield size={12} className="text-rose-500" /> };
      case 'performance':
        return { label: 'Performance', icon: <Cpu size={12} className="text-amber-500" /> };
      case 'style':
        return { label: 'Style', icon: <FileText size={12} className="text-blue-500" /> };
      default:
        return { label: 'Full Review', icon: <Eye size={12} className="text-indigo-500" /> };
    }
  };

  const focusInfo = getFocusBadge(repo.settings?.reviewFocus || 'full');

  const handleSaveSettings = async (e) => {
    e?.preventDefault?.();
    try {
      setIsUpdating(true);
      const updated = await updateRepoSettings(repoId, {
        reviewFocus: focus,
        minSeverity,
        isActive,
      });
      setShowSettings(false);
      if (onRepoUpdated) onRepoUpdated(updated);
    } catch (err) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleActive = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsUpdating(true);
      const updated = await updateRepoSettings(repoId, {
        isActive: !isActive,
      });
      setIsActive(!isActive);
      if (onRepoUpdated) onRepoUpdated(updated);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to disconnect ${repo.name}?`)) return;

    try {
      setIsDeleting(true);
      await deleteRepo(repoId);
      if (onRepoDeleted) onRepoDeleted(repoId);
    } catch (err) {
      alert(`Failed to disconnect: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsSimulating(true);
      const newRev = await simulateReview(repoId);
      if (onReviewSimulated) onReviewSimulated(newRev);
      if (onRepoUpdated) {
        onRepoUpdated({ ...repo, prsReviewed: (repo.prsReviewed || 0) + 1 });
      }
    } catch (err) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div 
      className="rounded-github border transition-all"
      style={{ 
        backgroundColor: 'var(--color-canvas-default)',
        borderColor: 'var(--color-border-default)'
      }}
    >
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Main repo info link */}
          <Link
            to={`/repo/${encodedName}`}
            className="flex-1 min-w-0 flex items-start gap-3 no-underline group"
          >
            <div 
              className="p-2 rounded-md mt-0.5"
              style={{ backgroundColor: 'var(--color-canvas-subtle)' }}
            >
              <GitBranch 
                size={18} 
                style={{ color: 'var(--color-fg-muted)' }} 
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 
                  className="font-semibold text-base group-hover:underline"
                  style={{ color: 'var(--color-accent-fg)' }}
                >
                  {repo.name}
                </h3>
                {/* Active / Paused badge */}
                <button
                  type="button"
                  onClick={handleToggleActive}
                  disabled={isUpdating}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity"
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--color-success-subtle)',
                          borderColor: 'var(--color-success-fg)',
                          color: 'var(--color-success-fg)',
                        }
                      : {
                          backgroundColor: 'var(--color-canvas-subtle)',
                          borderColor: 'var(--color-border-default)',
                          color: 'var(--color-fg-muted)',
                        }
                  }
                  title="Click to toggle active status"
                >
                  {isActive ? (
                    <>
                      <CheckCircle size={11} />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle size={11} />
                      Paused
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                <span>{repo.prsReviewed ?? 0} {repo.prsReviewed === 1 ? 'review' : 'reviews'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {focusInfo.icon}
                  {focusInfo.label}
                </span>
                <span>•</span>
                <span>Min: <strong className="capitalize">{repo.settings?.minSeverity || 'low'}</strong></span>
              </div>
            </div>
          </Link>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            {/* Simulate Review */}
            <button
              type="button"
              onClick={handleSimulate}
              disabled={isSimulating}
              className="px-2.5 py-1.5 rounded-github text-xs font-medium border flex items-center gap-1 transition-colors"
              style={{
                backgroundColor: 'var(--color-canvas-subtle)',
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-fg-default)'
              }}
              title="Trigger a test automated review on this repo"
            >
              {isSimulating ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Play size={13} style={{ color: 'var(--color-accent-fg)' }} />
              )}
              <span>Test Review</span>
            </button>

            {/* Settings button */}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-github border transition-colors"
              style={{
                backgroundColor: showSettings ? 'var(--color-accent-subtle)' : 'var(--color-canvas-subtle)',
                borderColor: showSettings ? 'var(--color-accent-fg)' : 'var(--color-border-default)',
                color: showSettings ? 'var(--color-accent-fg)' : 'var(--color-fg-muted)'
              }}
              title="Configure Review Focus & Rules"
            >
              <Sliders size={15} />
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-github border transition-colors hover:text-red-500"
              style={{
                backgroundColor: 'var(--color-canvas-subtle)',
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-fg-muted)'
              }}
              title="Disconnect repository"
            >
              {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            </button>

            {/* View PRs Chevron */}
            <Link
              to={`/repo/${encodedName}`}
              className="p-1.5 rounded-github transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>

        {/* Collapsible Settings Drawer */}
        {showSettings && (
          <div 
            className="mt-4 pt-4 border-t"
            style={{ borderColor: 'var(--color-border-muted)' }}
          >
            <form onSubmit={handleSaveSettings} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'var(--color-fg-default)' }}>
                  Repository Configuration
                </span>
                <span className="text-xs" style={{ color: 'var(--color-fg-subtle)' }}>
                  Tailors Gemini's AI prompts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Review Focus */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-fg-muted)' }}>
                    Review Focus Area
                  </label>
                  <select
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-github border outline-none cursor-pointer"
                    style={{
                      backgroundColor: 'var(--color-canvas-subtle)',
                      borderColor: 'var(--color-border-default)',
                      color: 'var(--color-fg-default)'
                    }}
                  >
                    <option value="full">Full Review (Bugs, Security, Performance, Style)</option>
                    <option value="security">Security Only (Vulnerabilities, Injections, Auth)</option>
                    <option value="performance">Performance Only (Complexity, Memory, I/O)</option>
                    <option value="style">Style Only (Readability, Naming, Linting)</option>
                  </select>
                </div>

                {/* Min Severity */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-fg-muted)' }}>
                    Minimum Severity Threshold
                  </label>
                  <select
                    value={minSeverity}
                    onChange={(e) => setMinSeverity(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-github border outline-none cursor-pointer"
                    style={{
                      backgroundColor: 'var(--color-canvas-subtle)',
                      borderColor: 'var(--color-border-default)',
                      color: 'var(--color-fg-default)'
                    }}
                  >
                    <option value="low">Low + Above (Report all issues)</option>
                    <option value="medium">Medium + Above (Warnings & Critical)</option>
                    <option value="high">High Only (Critical Blockers Only)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-1 rounded-github text-xs border font-medium"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: 'var(--color-border-default)',
                    color: 'var(--color-fg-muted)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-3 py-1 rounded-github text-xs font-medium text-white border"
                  style={{
                    backgroundColor: 'rgb(31, 111, 235)',
                    borderColor: 'rgba(31, 35, 40, 0.15)'
                  }}
                >
                  {isUpdating ? 'Saving…' : 'Save Rules'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

