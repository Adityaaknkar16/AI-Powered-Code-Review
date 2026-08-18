import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getReviewDetail } from '../api';
import CommentCard from '../components/CommentCard';
import { ChevronLeft, FileCode, CheckCircle } from 'lucide-react';

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
    return (
      <div className="space-y-4">
        <div 
          className="h-8 rounded-github w-2/3 animate-pulse" 
          style={{ 
            backgroundColor: 'var(--color-canvas-default)',
            border: '1px solid var(--color-border-default)'
          }}
        />
        <div 
          className="h-48 rounded-github animate-pulse" 
          style={{ 
            backgroundColor: 'var(--color-canvas-default)',
            border: '1px solid var(--color-border-default)'
          }}
        />
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
        Failed to load review: {error}
      </div>
    );
  }

  if (!review) return null;

  const pullNumber = review.pullNumber;
  const title = review.title || review.prTitle;
  const date = review.date;
  const issuesCount = review.issuesCount ??
    ((review.summaryStats?.highCount || 0) + (review.summaryStats?.mediumCount || 0) + (review.summaryStats?.lowCount || 0));

  // Group comments by file
  const commentsByFile = review.comments.reduce((acc, comment) => {
    if (!acc[comment.file]) acc[comment.file] = [];
    acc[comment.file].push(comment);
    return acc;
  }, {});

  const files = Object.keys(commentsByFile);

  return (
    <div>
      {/* Header with back link */}
      <div className="mb-6">
        <Link
          to={`/repo/${encodeURIComponent(repoName)}`}
          className="inline-flex items-center gap-1 text-sm mb-3 hover:no-underline"
          style={{ color: 'var(--color-accent-fg)' }}
        >
          <ChevronLeft size={16} />
          {decodedRepoName}
        </Link>
        <div className="flex items-start gap-3 mb-2">
          <h1 
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-fg-default)' }}
          >
            <span 
              className="font-mono mr-2"
              style={{ color: 'var(--color-fg-muted)' }}
            >
              #{pullNumber}
            </span>
            {title}
          </h1>
        </div>
        <p 
          className="text-sm"
          style={{ color: 'var(--color-fg-muted)' }}
        >
          {date} · {issuesCount} {issuesCount === 1 ? 'issue' : 'issues'} found
        </p>
      </div>

      {/* Content */}
      {files.length === 0 ? (
        <div 
          className="p-8 rounded-github border text-center"
          style={{ 
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <div 
            className="inline-flex p-3 rounded-full mb-3"
            style={{ backgroundColor: 'var(--color-success-subtle)' }}
          >
            <CheckCircle size={32} style={{ color: 'var(--color-success-fg)' }} />
          </div>
          <h3 
            className="text-base font-semibold mb-1"
            style={{ color: 'var(--color-fg-default)' }}
          >
            No issues found
          </h3>
          <p 
            className="text-sm"
            style={{ color: 'var(--color-fg-muted)' }}
          >
            Gemini AI reviewed this pull request and found no problems. Great work!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {files.map((filename) => (
            <div key={filename}>
              {/* File header */}
              <div 
                className="flex items-center gap-2 px-3 py-2 rounded-t-github border font-mono text-sm"
                style={{ 
                  backgroundColor: 'var(--color-canvas-subtle)',
                  borderColor: 'var(--color-border-default)',
                  color: 'var(--color-fg-default)'
                }}
              >
                <FileCode size={16} style={{ color: 'var(--color-fg-muted)' }} />
                <span className="truncate">{filename}</span>
                <span 
                  className="ml-auto px-2 py-0.5 rounded-full text-xs font-sans"
                  style={{ 
                    backgroundColor: 'var(--color-canvas-default)',
                    color: 'var(--color-fg-muted)'
                  }}
                >
                  {commentsByFile[filename].length} {commentsByFile[filename].length === 1 ? 'issue' : 'issues'}
                </span>
              </div>

              {/* Comments */}
              <div className="space-y-0">
                {commentsByFile[filename].map((comment, index) => (
                  <CommentCard key={index} comment={comment} isLast={index === commentsByFile[filename].length - 1} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
