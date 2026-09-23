import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRepoReviews, simulateReview, getConnectedRepos } from '../api';
import ReviewRow from '../components/ReviewRow';
import { 
  ChevronLeft, 
  Search, 
  Play, 
  Loader2, 
  Filter, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  ExternalLink,
  GitBranch
} from 'lucide-react';

export default function ReviewList() {
  const { repoName } = useParams();
  const decodedRepoName = decodeURIComponent(repoName);

  const [reviews, setReviews] = useState([]);
  const [repoObj, setRepoObj] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all'); // all | high | medium | clean

  useEffect(() => {
    loadData();
  }, [decodedRepoName]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reviewData, repos] = await Promise.all([
        getRepoReviews(decodedRepoName),
        getConnectedRepos().catch(() => [])
      ]);
      setReviews(reviewData || []);
      const found = repos.find(r => r.name.toLowerCase() === decodedRepoName.toLowerCase());
      setRepoObj(found || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    if (!repoObj && reviews.length === 0) return;
    const targetId = repoObj?._id || repoObj?.id || reviews[0]?.repoId?._id || '1';
    try {
      setIsSimulating(true);
      const newRev = await simulateReview(targetId);
      setReviews((prev) => [newRev, ...prev]);
    } catch (err) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  let totalHigh = 0;
  let totalMedium = 0;
  let totalLow = 0;

  reviews.forEach((review) => {
    const stats = review.summaryStats;
    if (stats) {
      totalHigh += stats.highCount || 0;
      totalMedium += stats.mediumCount || 0;
      totalLow += stats.lowCount || 0;
    }
  });

  const totalIssues = totalHigh + totalMedium + totalLow;

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const title = (review.title || review.prTitle || '').toLowerCase();
    const author = (review.sender || '').toLowerCase();
    const num = String(review.pullNumber || '');
    const q = searchQuery.toLowerCase();
    const matchesSearch = title.includes(q) || author.includes(q) || num.includes(q);

    if (!matchesSearch) return false;

    const high = review.summaryStats?.highCount || 0;
    const med = review.summaryStats?.mediumCount || 0;
    const low = review.summaryStats?.lowCount || 0;

    if (severityFilter === 'high') return high > 0;
    if (severityFilter === 'medium') return med > 0;
    if (severityFilter === 'clean') return high === 0 && med === 0 && low === 0;

    return true;
  });

  if (loading) {
    return (
      <div className="space-y-3">
        <div 
          className="h-20 rounded-github border animate-pulse" 
          style={{ 
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)'
          }}
        />
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="h-16 rounded-github border animate-pulse" 
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
        Failed to load reviews: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back link and simulate action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link 
            to="/" 
            className="inline-flex items-center gap-1 text-xs mb-2 hover:no-underline font-medium"
            style={{ color: 'var(--color-accent-fg)' }}
          >
            <ChevronLeft size={14} />
            Back to Repositories
          </Link>
          <div className="flex items-center gap-3">
            <h1 
              className="text-2xl font-semibold"
              style={{ color: 'var(--color-fg-default)' }}
            >
              {decodedRepoName}
            </h1>
            <a
              href={`https://github.com/${decodedRepoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-md text-xs hover:underline flex items-center gap-1 border"
              style={{
                backgroundColor: 'var(--color-canvas-default)',
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-fg-muted)'
              }}
              title="Open repository on GitHub"
            >
              <ExternalLink size={12} />
              GitHub
            </a>
          </div>
          <p 
            className="text-xs mt-1"
            style={{ color: 'var(--color-fg-muted)' }}
          >
            {reviews.length} pull {reviews.length === 1 ? 'request' : 'requests'} reviewed · {totalIssues} {totalIssues === 1 ? 'issue' : 'issues'} found
          </p>
        </div>

        {/* Action Button: Trigger Test PR Review */}
        <div>
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="px-3.5 py-2 rounded-github text-xs font-semibold text-white border flex items-center gap-1.5 disabled:opacity-50"
            style={{
              backgroundColor: 'rgb(31, 111, 235)',
              borderColor: 'rgba(31, 35, 40, 0.15)'
            }}
          >
            {isSimulating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Analyzing New PR…
              </>
            ) : (
              <>
                <Play size={14} />
                Test / Simulate PR Review
              </>
            )}
          </button>
        </div>
      </div>

      {/* Severity breakdown pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          className="p-3 rounded-github border"
          style={{
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>Total Reviews</span>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-fg-default)' }}>{reviews.length}</p>
        </div>
        <div 
          className="p-3 rounded-github border"
          style={{
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-danger-fg)' }}>
            <ShieldAlert size={12} /> High Severity
          </span>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-danger-fg)' }}>{totalHigh}</p>
        </div>
        <div 
          className="p-3 rounded-github border"
          style={{
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-attention-fg)' }}>
            <AlertTriangle size={12} /> Medium Warnings
          </span>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-attention-fg)' }}>{totalMedium}</p>
        </div>
        <div 
          className="p-3 rounded-github border"
          style={{
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-fg-muted)' }}>
            <Info size={12} /> Low / Style Notes
          </span>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-fg-default)' }}>{totalLow}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            placeholder="Search pull requests or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: 'var(--color-fg-muted)' }} />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-github border font-medium outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--color-canvas-default)',
              borderColor: 'var(--color-border-default)',
              color: 'var(--color-fg-default)'
            }}
          >
            <option value="all">All Severities</option>
            <option value="high">High Issues Only</option>
            <option value="medium">Medium Issues Only</option>
            <option value="clean">Clean / 0 Issues</option>
          </select>
        </div>
      </div>

      {/* Reviews Table / Empty state */}
      {filteredReviews.length === 0 ? (
        <div 
          className="p-8 rounded-github border text-center text-sm"
          style={{ 
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)',
            color: 'var(--color-fg-muted)'
          }}
        >
          {searchQuery || severityFilter !== 'all'
            ? 'No pull request reviews match the current filter.'
            : 'No pull request reviews yet. Click "Test / Simulate PR Review" above or open a PR on GitHub.'}
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
                <th className="py-2.5 px-4">Pull Request</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Issues</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <ReviewRow
                  key={review._id || review.id}
                  review={review}
                  repoName={decodedRepoName}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

