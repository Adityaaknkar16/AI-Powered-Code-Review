import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRepoReviews } from '../api';
import ReviewRow from '../components/ReviewRow';

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

  // Compute stats
  const totalPrs = reviews.length;
  const totalIssues = reviews.reduce((sum, review) => {
    if (!review.issueSummary || review.issueSummary.toLowerCase().includes('0 issues')) {
      return sum;
    }
    // Parse "1 high, 2 medium" or similar
    const matches = review.issueSummary.match(/\d+/g);
    if (matches) {
      const issuesCount = matches.reduce((acc, val) => acc + parseInt(val, 10), 0);
      return sum + issuesCount;
    }
    return sum;
  }, 0);

  if (loading) {
    return <div className="text-sm text-text-secondary">Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-sm text-severity-high">Error: {error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="text-sm text-accent hover:underline mb-2 inline-block">
          ← Connected Repos
        </Link>
        <h1 className="text-xl font-bold text-text-primary mt-2">
          {decodedRepoName}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {totalPrs} PRs reviewed · {totalIssues} issues flagged
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="p-8 border border-border bg-surface rounded-lg text-center text-sm text-text-secondary">
          No pull request reviews have been registered for this repository yet.
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <th className="py-4 px-4 font-semibold">PR Title</th>
                <th className="py-4 px-4 font-semibold">Date</th>
                <th className="py-4 px-4 font-semibold">Issues</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <ReviewRow 
                  key={review.id} 
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
