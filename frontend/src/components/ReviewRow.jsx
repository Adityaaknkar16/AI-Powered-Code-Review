import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitPullRequest, AlertCircle, AlertTriangle, Info } from 'lucide-react';

function IssuesDisplay({ review }) {
  const stats = review.summaryStats;
  if (stats) {
    const high = stats.highCount || 0;
    const medium = stats.mediumCount || 0;
    const low = stats.lowCount || 0;
    
    if (high === 0 && medium === 0 && low === 0) {
      return (
        <span 
          className="text-xs font-medium flex items-center gap-1"
          style={{ color: 'var(--color-success-fg)' }}
        >
          <Info size={14} />
          No issues
        </span>
      );
    }
    
    return (
      <div className="flex gap-2 items-center">
        {high > 0 && (
          <span 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
            style={{ 
              backgroundColor: 'var(--color-danger-subtle)',
              borderColor: 'var(--color-danger-fg)',
              color: 'var(--color-danger-fg)'
            }}
          >
            <AlertCircle size={12} />
            {high} high
          </span>
        )}
        {medium > 0 && (
          <span 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
            style={{ 
              backgroundColor: 'var(--color-attention-subtle)',
              borderColor: 'var(--color-attention-fg)',
              color: 'var(--color-attention-fg)'
            }}
          >
            <AlertTriangle size={12} />
            {medium} medium
          </span>
        )}
        {low > 0 && (
          <span 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ color: 'var(--color-fg-muted)' }}
          >
            <Info size={12} />
            {low} low
          </span>
        )}
      </div>
    );
  }

  // Fallback for legacy issueSummary string
  const summary = review.issueSummary;
  if (!summary || summary.toLowerCase().includes('0 issues')) {
    return (
      <span 
        className="text-xs font-medium flex items-center gap-1"
        style={{ color: 'var(--color-success-fg)' }}
      >
        <Info size={14} />
        No issues
      </span>
    );
  }
  
  return <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{summary}</span>;
}

export default function ReviewRow({ review, repoName, showRepoBadge = false }) {
  const navigate = useNavigate();
  const effectiveRepo = repoName || review.repoName || review.repoId?.name || 'repo';
  const encodedRepo = encodeURIComponent(effectiveRepo);
  const reviewId = review._id || review.id;
  const title = review.title || review.prTitle;

  return (
    <tr
      onClick={() => navigate(`/repo/${encodedRepo}/review/${reviewId}`)}
      className="border-b cursor-pointer transition-colors"
      style={{ borderColor: 'var(--color-border-default)' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {showRepoBadge && (
        <td className="py-3 px-4 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--color-fg-muted)' }}>
          <span 
            className="px-2 py-0.5 rounded-full border font-mono"
            style={{
              backgroundColor: 'var(--color-canvas-subtle)',
              borderColor: 'var(--color-border-default)'
            }}
          >
            {effectiveRepo}
          </span>
        </td>
      )}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <GitPullRequest 
            size={16} 
            className="flex-shrink-0"
            style={{ color: 'var(--color-success-fg)' }} 
          />
          <span 
            className="font-mono text-xs mr-1"
            style={{ color: 'var(--color-fg-muted)' }}
          >
            #{review.pullNumber}
          </span>
          <span 
            className="font-medium hover:underline"
            style={{ color: 'var(--color-fg-default)' }}
          >
            {title}
          </span>
          {review.sender && (
            <span className="text-xs text-slate-400 hidden md:inline">
              by @{review.sender}
            </span>
          )}
        </div>
      </td>
      <td 
        className="py-3 px-4 text-xs whitespace-nowrap"
        style={{ color: 'var(--color-fg-muted)' }}
      >
        {review.date}
      </td>
      <td className="py-3 px-4">
        <IssuesDisplay review={review} />
      </td>
    </tr>
  );
}

