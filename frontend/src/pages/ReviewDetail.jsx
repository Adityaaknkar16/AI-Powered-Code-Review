import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getReviewDetail } from '../api';
import CommentCard from '../components/CommentCard';

export default function ReviewDetail() {
  const { repoName, reviewId } = useParams();
  const decodedRepoName = decodeURIComponent(repoName);

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        const data = await getReviewDetail(reviewId);
        setReview(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [reviewId]);

  if (loading) {
    return <div className="text-sm text-text-secondary">Loading review details...</div>;
  }

  if (error) {
    return <div className="text-sm text-severity-high">Error: {error}</div>;
  }

  if (!review) return null;

  // Group comments by file
  const commentsByFile = review.comments.reduce((acc, comment) => {
    if (!acc[comment.file]) {
      acc[comment.file] = [];
    }
    acc[comment.file].push(comment);
    return acc;
  }, {});

  const files = Object.keys(commentsByFile);

  return (
    <div>
      <div className="mb-8">
        <Link to={`/repo/${encodeURIComponent(repoName)}`} className="text-sm text-accent hover:underline mb-2 inline-block">
          ← {decodedRepoName}
        </Link>
        <h1 className="text-xl font-bold text-text-primary mt-2">
          <span className="text-text-secondary font-mono mr-2">#{review.pullNumber}</span>
          {review.title}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {review.date} · {review.issuesCount} issues flagged
        </p>
      </div>

      {files.length === 0 ? (
        <div className="p-8 border border-border bg-surface rounded-lg text-center text-sm text-text-secondary">
          No issues flagged. Outstanding work!
        </div>
      ) : (
        <div className="space-y-8">
          {files.map((filename) => (
            <div key={filename}>
              {/* File header */}
              <div className="font-bold text-sm text-text-primary mb-4 truncate font-mono">
                {filename}
              </div>
              
              {/* List of comments under file */}
              <div className="space-y-4">
                {commentsByFile[filename].map((comment, index) => (
                  <CommentCard key={index} comment={comment} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
