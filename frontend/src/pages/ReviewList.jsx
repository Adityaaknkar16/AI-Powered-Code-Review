import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRepoReviews } from '../api';
import ReviewRow from '../components/ReviewRow';
import { ChevronLeft } from 'lucide-react';

export default function ReviewList() {
  const { repoName } = useParams();
  const decodedRepoName = decodeURIComponent(repoName);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        const data = await getRepoReviews(decodedRepoName);
        setReviews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, [decodedRepoName]);

  const totalIssues = reviews.reduce((sum, review) => {
    const stats = review.summaryStats;
    if (stats) {
      return sum + (stats.highCount || 0) + (stats.mediumCount || 0) + (stats.lowCount || 0);
    }
    if (!review.issueSummary || review.issueSummary.toLowerCase().includes('0 issues')) return sum;
    const matches = review.issueSummary.match(/\d+/g);
    if (matches) return sum + matches.reduce((acc, v) => acc + parseInt(v, 10), 0);
    return sum;
  }, 0);

  if (loading) {
    return (
      <div className="space-y-3">
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
    <div>
      {/* Header with back link */}
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1 text-sm mb-3 hover:no-underline"
          style={{ color: 'var(--color-accent-fg)' }}
        >
          <ChevronLeft size={16} />
          Repositories
        </Link>
        <h1 
          className="text-2xl font-semibold mb-1"
          style={{ color: 'var(--color-fg-default)' }}
        >
          {decodedRepoName}
        </h1>
        <p 
          className="text-sm"
          style={{ color: 'var(--color-fg-muted)' }}
        >
          {reviews.length} pull {reviews.length === 1 ? 'request' : 'requests'} reviewed · {totalIssues} {totalIssues === 1 ? 'issue' : 'issues'} found
        </p>
      </div>

      {/* Empty state */}
      {reviews.length === 0 ? (
        <div 
          className="p-8 rounded-github border text-center text-sm"
          style={{ 
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)',
            color: 'var(--color-fg-muted)'
          }}
        >
          No pull request reviews yet. Reviews will appear here when pull requests are opened or updated.
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
                className="border-b text-xs"
                style={{ 
                  backgroundColor: 'var(--color-canvas-subtle)',
                  borderColor: 'var(--color-border-default)',
                  color: 'var(--color-fg-muted)'
                }}
              >
                <th className="py-2 px-4 font-semibold">Pull Request</th>
                <th className="py-2 px-4 font-semibold">Date</th>
                <th className="py-2 px-4 font-semibold">Issues</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
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
