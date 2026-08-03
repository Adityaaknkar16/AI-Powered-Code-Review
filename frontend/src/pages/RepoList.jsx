import React, { useState, useEffect } from 'react';
import { getConnectedRepos, connectRepo } from '../api';
import RepoCard from '../components/RepoCard';

export default function RepoList() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Connect repo form state
  const [isAdding, setIsAdding] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    try {
      setLoading(true);
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
    if (!newRepoName.trim()) return;

    try {
      setSubmitError(null);
      await connectRepo(newRepoName.trim());
      setNewRepoName('');
      setIsAdding(false);
      // Reload list
      await loadRepos();
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  if (loading) {
    return <div className="text-sm text-text-secondary">Loading connected repos...</div>;
  }

  if (error) {
    return <div className="text-sm text-severity-high">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-text-primary">Connected Repos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {repos.map((repo) => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </div>

      {isAdding ? (
        <form onSubmit={handleConnect} className="p-6 bg-surface border border-border rounded-lg">
          <h3 className="text-sm font-bold text-text-primary mb-3">Connect a new repository</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. facebook/react"
              value={newRepoName}
              onChange={(e) => setNewRepoName(e.target.value)}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-sm bg-bg outline-none focus:border-accent text-text-primary"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-accent hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all"
              >
                Connect
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setSubmitError(null);
                }}
                className="px-4 py-2 border border-border hover:bg-bg rounded-lg text-sm text-text-secondary transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
          {submitError && (
            <p className="text-xs text-severity-high mt-2">{submitError}</p>
          )}
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-6 border border-dashed border-border hover:border-text-secondary bg-surface rounded-lg text-sm text-text-secondary font-medium transition-all"
        >
          + Connect a new repo
        </button>
      )}
    </div>
  );
}
