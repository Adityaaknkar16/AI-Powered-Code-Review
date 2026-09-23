import React, { useState, useEffect } from 'react';
import { 
  getConnectedRepos, 
  connectRepo, 
  getStats, 
  getAllReviews 
} from '../api';
import RepoCard from '../components/RepoCard';
import StatsSummary from '../components/StatsSummary';
import ReviewRow from '../components/ReviewRow';
import Playground from '../components/Playground';
import { 
  Plus, 
  RefreshCw, 
  Search, 
  FolderGit2, 
  History, 
  Sparkles, 
  SlidersHorizontal,
  CheckCircle2,
  ExternalLink,
  GitPullRequest
} from 'lucide-react';

export default function RepoList() {
  const [repos, setRepos] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active view tab: 'repos' | 'activity' | 'playground'
  const [activeTab, setActiveTab] = useState('repos');

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | paused

  // Connect repo form state
  const [isAdding, setIsAdding] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [repoData, statsData, reviewData] = await Promise.all([
        getConnectedRepos(),
        getStats().catch(() => null),
        getAllReviews().catch(() => [])
      ]);
      setRepos(repoData || []);
      setStats(statsData);
      setAllReviews(reviewData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    const trimmed = newRepoName.trim();
    if (!trimmed) return;
    if (!trimmed.includes('/')) {
      setSubmitError('Use "owner/repo" format, e.g. facebook/react');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      await connectRepo(trimmed);
      setNewRepoName('');
      setIsAdding(false);
      await loadAllData();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRepoUpdated = (updatedRepo) => {
    setRepos((prev) =>
      prev.map((r) => ((r._id === updatedRepo._id || r.id === updatedRepo.id) ? updatedRepo : r))
    );
  };

  const handleRepoDeleted = (deletedId) => {
    setRepos((prev) => prev.filter((r) => r._id !== deletedId && r.id !== deletedId));
  };

  const handleReviewSimulated = (newReview) => {
    setAllReviews((prev) => [newReview, ...prev]);
    // update stats
    getStats().then(setStats).catch(() => {});
  };

  // Filtered repositories
  const filteredRepos = repos.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'active') return matchesSearch && r.isActive !== false;
    if (statusFilter === 'paused') return matchesSearch && r.isActive === false;
    return matchesSearch;
  });

  // Filtered global reviews
  const filteredReviews = allReviews.filter((r) => {
    const title = (r.title || r.prTitle || '').toLowerCase();
    const repo = (r.repoName || r.repoId?.name || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || repo.includes(q);
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="h-24 rounded-github border animate-pulse" 
              style={{ 
                backgroundColor: 'var(--color-canvas-default)',
                borderColor: 'var(--color-border-default)'
              }}
            />
          ))}
        </div>
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="h-20 rounded-github border animate-pulse" 
              style={{ 
                backgroundColor: 'var(--color-canvas-default)',
                borderColor: 'var(--color-border-default)'
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="p-4 rounded-github border text-sm"
        style={{ 
          backgroundColor: 'var(--color-danger-subtle)',
          borderColor: 'var(--color-danger-fg)',
          color: 'var(--color-danger-fg)'
        }}
      >
        <p className="font-medium mb-2">Failed to load dashboard data</p>
        <p className="mb-3">{error}</p>
        <button 
          onClick={loadAllData}
          className="text-sm underline flex items-center gap-1"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Stats Overview */}
      <StatsSummary stats={stats} totalRepos={repos.length} />

      {/* Navigation Tabs */}
      <div 
        className="flex items-center justify-between border-b gap-4 flex-wrap"
        style={{ borderColor: 'var(--color-border-default)' }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('repos')}
            className="pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all"
            style={{
              borderColor: activeTab === 'repos' ? 'var(--color-accent-emphasis)' : 'transparent',
              color: activeTab === 'repos' ? 'var(--color-fg-default)' : 'var(--color-fg-muted)'
            }}
          >
            <FolderGit2 size={16} />
            Repositories ({repos.length})
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className="pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all"
            style={{
              borderColor: activeTab === 'activity' ? 'var(--color-accent-emphasis)' : 'transparent',
              color: activeTab === 'activity' ? 'var(--color-fg-default)' : 'var(--color-fg-muted)'
            }}
          >
            <History size={16} />
            All Review Activity ({allReviews.length})
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className="pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all"
            style={{
              borderColor: activeTab === 'playground' ? 'var(--color-accent-emphasis)' : 'transparent',
              color: activeTab === 'playground' ? 'var(--color-fg-default)' : 'var(--color-fg-muted)'
            }}
          >
            <Sparkles size={16} style={{ color: 'var(--color-accent-fg)' }} />
            AI Playground
          </button>
        </div>

        <button
          onClick={loadAllData}
          className="pb-3 text-xs flex items-center gap-1 hover:underline"
          style={{ color: 'var(--color-fg-muted)' }}
          title="Refresh dashboard"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* TAB 1: REPOSITORIES VIEW */}
      {activeTab === 'repos' && (
        <div className="space-y-4">
          {/* Controls: Search, Filter, Add */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-github border w-full text-xs"
                style={{
                  backgroundColor: 'var(--color-canvas-default)',
                  borderColor: 'var(--color-border-default)',
                  color: 'var(--color-fg-default)'
                }}
              >
                <Search size={14} style={{ color: 'var(--color-fg-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-github border font-medium outline-none cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-canvas-default)',
                  borderColor: 'var(--color-border-default)',
                  color: 'var(--color-fg-default)'
                }}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-3 py-1.5 rounded-github text-xs font-semibold text-white flex items-center gap-1.5 border"
                style={{
                  backgroundColor: 'rgb(31, 111, 235)',
                  borderColor: 'rgba(31, 35, 40, 0.15)'
                }}
              >
                <Plus size={14} />
                Connect Repository
              </button>
            )}
          </div>

          {/* Connect repo form */}
          {isAdding && (
            <div 
              className="p-4 rounded-github border"
              style={{ 
                backgroundColor: 'var(--color-canvas-default)',
                borderColor: 'var(--color-border-default)'
              }}
            >
              <h3 
                className="text-sm font-semibold mb-2"
                style={{ color: 'var(--color-fg-default)' }}
              >
                Connect a GitHub Repository
              </h3>
              <p className="text-xs mb-3" style={{ color: 'var(--color-fg-muted)' }}>
                Enter the full repository path. The bot will monitor incoming Pull Requests and review diffs automatically.
              </p>
              <form onSubmit={handleConnect} className="space-y-3">
                <input
                  type="text"
                  placeholder="owner/repository (e.g. facebook/react)"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-github border outline-none font-mono"
                  style={{ 
                    backgroundColor: 'var(--color-canvas-subtle)',
                    borderColor: 'var(--color-border-default)',
                    color: 'var(--color-fg-default)'
                  }}
                  required
                  autoFocus
                />
                {submitError && (
                  <p className="text-xs" style={{ color: 'var(--color-danger-fg)' }}>
                    {submitError}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-3 py-1.5 rounded-github text-xs font-semibold text-white border"
                    style={{
                      backgroundColor: 'rgb(31, 111, 235)',
                      borderColor: 'rgba(31, 35, 40, 0.15)'
                    }}
                  >
                    {submitting ? 'Connecting…' : 'Connect Repository'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { 
                      setIsAdding(false); 
                      setSubmitError(null); 
                      setNewRepoName(''); 
                    }}
                    className="px-3 py-1.5 rounded-github text-xs font-medium border"
                    style={{ 
                      backgroundColor: 'transparent',
                      borderColor: 'var(--color-border-default)',
                      color: 'var(--color-fg-default)'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Repo list */}
          {filteredRepos.length === 0 ? (
            <div 
              className="p-8 rounded-github border text-center"
              style={{ 
                backgroundColor: 'var(--color-canvas-default)',
                borderColor: 'var(--color-border-default)'
              }}
            >
              <FolderGit2 size={32} className="mx-auto mb-2 opacity-50" style={{ color: 'var(--color-fg-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--color-fg-default)' }}>
                {searchQuery ? 'No repositories match your filter.' : 'No repositories connected yet.'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-fg-muted)' }}>
                Connect a repository to activate automated Gemini AI code reviews on PRs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredRepos.map((repo) => (
                <RepoCard 
                  key={repo._id || repo.id} 
                  repo={repo}
                  onRepoUpdated={handleRepoUpdated}
                  onRepoDeleted={handleRepoDeleted}
                  onReviewSimulated={handleReviewSimulated}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GLOBAL REVIEW ACTIVITY FEED */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-github border w-full max-w-md text-xs"
              style={{
                backgroundColor: 'var(--color-canvas-default)',
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-fg-default)'
              }}
            >
              <Search size={14} style={{ color: 'var(--color-fg-muted)' }} />
              <input
                type="text"
                placeholder="Filter reviews by title or repo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {filteredReviews.length === 0 ? (
            <div 
              className="p-8 rounded-github border text-center text-sm"
              style={{ 
                backgroundColor: 'var(--color-canvas-default)',
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-fg-muted)'
              }}
            >
              No reviews found. Reviews will appear here once PRs are opened on connected repositories.
            </div>
          ) : (
            <div 
              className="rounded-github border overflow-hidden"
              style={{ 
                backgroundColor: 'var(--color-canvas-default)',
                borderColor: 'var(--color-border-default)'
              }}
            >
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr 
                    className="border-b text-xs font-semibold"
                    style={{ 
                      backgroundColor: 'var(--color-canvas-subtle)',
                      borderColor: 'var(--color-border-default)',
                      color: 'var(--color-fg-muted)'
                    }}
                  >
                    <th className="py-2.5 px-4">Repository</th>
                    <th className="py-2.5 px-4">Pull Request</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Issues Found</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review) => {
                    const repoName = review.repoName || review.repoId?.name || 'repo';
                    return (
                      <ReviewRow
                        key={review._id || review.id}
                        review={review}
                        repoName={repoName}
                        showRepoBadge={true}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INTERACTIVE AI PLAYGROUND */}
      {activeTab === 'playground' && (
        <Playground />
      )}
    </div>
  );
}

