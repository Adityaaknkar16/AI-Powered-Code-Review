import React from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, CheckCircle, XCircle } from 'lucide-react';

export default function RepoCard({ repo }) {
  const encodedName = encodeURIComponent(repo.name);
  const isActive = repo.isActive !== false;

  return (
    <Link
      to={`/repo/${encodedName}`}
      className="block p-4 rounded-github border transition-colors no-underline"
      style={{ 
        backgroundColor: 'var(--color-canvas-default)',
        borderColor: 'var(--color-border-default)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-muted)';
        e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-default)';
        e.currentTarget.style.backgroundColor = 'var(--color-canvas-default)';
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <GitBranch 
              size={16} 
              style={{ color: 'var(--color-fg-muted)', flexShrink: 0 }} 
            />
            <h3 
              className="font-semibold text-sm truncate"
              style={{ color: 'var(--color-accent-fg)' }}
            >
              {repo.name}
            </h3>
          </div>
          <p 
            className="text-xs"
            style={{ color: 'var(--color-fg-muted)' }}
          >
            {repo.prsReviewed ?? 0} pull {repo.prsReviewed === 1 ? 'request' : 'requests'} reviewed
          </p>
        </div>

        {/* Status badge */}
        <div 
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
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
        >
          {isActive ? (
            <>
              <CheckCircle size={12} />
              Active
            </>
          ) : (
            <>
              <XCircle size={12} />
              Paused
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
