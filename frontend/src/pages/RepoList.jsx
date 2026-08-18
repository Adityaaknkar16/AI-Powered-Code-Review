import React, { useState, useEffect } from 'react';
import { getConnectedRepos, connectRepo } from '../api';
import RepoCard from '../components/RepoCard';
import { Plus, RefreshCw } from 'lucide-react';

export default function RepoList() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Connect repo form state
  const [isAdding, setIsAdding] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConnectedRepos();
      setRepos(data);
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
      await loadRepos();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
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
        <p className="font-medium mb-2">Failed to load repositories</p>
        <p className="mb-3">{error}</p>
        <button 
          onClick={loadRepos}
          className="text-sm underline flex items-center gap-1"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 
          className="text-2xl font-semibold mb-1"
          style={{ color: 'var(--color-fg-default)' }}
        >
          Repositories
        </h1>
        <p 
          className="text-sm"
          style={{ color: 'var(--color-fg-muted)' }}
        >
          {repos.length} {repos.length === 1 ? 'repository' : 'repositories'} connected
        </p>
      </div>

      {/* Empty state */}
      {repos.length === 0 && !isAdding && (
        <div 
          className="p-8 rounded-github border text-center mb-4"
          style={{ 
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <p 
            className="text-sm mb-2"
            style={{ color: 'var(--color-fg-muted)' }}
          >
            No repositories connected yet.
          </p>
          <p 
            className="text-xs"
            style={{ color: 'var(--color-fg-subtle)' }}
          >
            Connect a repository below to start automated code reviews.
          </p>
        </div>
      )}

      {/* Repo grid */}
      {repos.length > 0 && (
        <div className="grid grid-cols-1 gap-3 mb-4">
          {repos.map((repo) => (
            <RepoCard key={repo._id || repo.id} repo={repo} />
          ))}
        </div>
      )}

      {/* Add repo form */}
      {isAdding ? (
        <div 
          className="p-4 rounded-github border"
          style={{ 
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <h3 
            className="text-sm font-semibold mb-3"
            style={{ color: 'var(--color-fg-default)' }}
          >
            Connect a repository
          </h3>
          <form onSubmit={handleConnect} className="space-y-3">
            <input
              type="text"
              placeholder="owner/repository"
              value={newRepoName}
              onChange={(e) => setNewRepoName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-github border outline-none focus:ring-2 ring-offset-0"
              style={{ 
                backgroundColor: 'var(--color-canvas-default)',
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-fg-default)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-fg)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border-default)'}
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
                className="px-3 py-1.5 rounded-github text-sm font-medium transition-colors disabled:opacity-50 border"
                style={{
                  backgroundColor: 'rgb(31, 111, 235)',
                  color: '#ffffff',
                  borderColor: 'rgba(31, 35, 40, 0.15)'
                }}
                onMouseEnter={(e) => {
                  if (!submitting) e.currentTarget.style.backgroundColor = 'rgb(9, 105, 218)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(31, 111, 235)';
                }}
              >
                {submitting ? 'Connecting…' : 'Connect repository'}
              </button>
              <button
                type="button"
                onClick={() => { 
                  setIsAdding(false); 
                  setSubmitError(null); 
                  setNewRepoName(''); 
                }}
                className="px-3 py-1.5 rounded-github text-sm font-medium transition-colors border"
                style={{ 
                  backgroundColor: 'var(--color-canvas-default)',
                  borderColor: 'var(--color-border-default)',
                  color: 'var(--color-fg-default)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-default)'}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 rounded-github text-sm font-medium flex items-center justify-center gap-2 transition-colors border border-dashed"
          style={{ 
            backgroundColor: 'transparent',
            borderColor: 'var(--color-border-default)',
            color: 'var(--color-fg-muted)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)';
            e.currentTarget.style.borderColor = 'var(--color-border-muted)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'var(--color-border-default)';
          }}
        >
          <Plus size={16} />
          Connect a repository
        </button>
      )}
    </div>
  );
}
