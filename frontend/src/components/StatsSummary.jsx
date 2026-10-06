import React from 'react';
import { GitPullRequest, Zap, ShieldAlert, AlertTriangle, Info, FolderGit2 } from 'lucide-react';

export default function StatsSummary({ stats, totalRepos = 0 }) {
  if (!stats) return null;

  const totalIssues = (stats.issueTypes?.high || 0) + (stats.issueTypes?.medium || 0) + (stats.issueTypes?.low || 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {/* Repositories Card */}
      <div 
        className="p-4 rounded-github border transition-all"
        style={{ 
          backgroundColor: 'var(--color-canvas-default)',
          borderColor: 'var(--color-border-default)'
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--color-fg-muted)' }}>
            Repositories
          </span>
          <div 
            className="p-1.5 rounded-md"
            style={{ backgroundColor: 'var(--color-accent-subtle)' }}
          >
            <FolderGit2 size={16} style={{ color: 'var(--color-accent-fg)' }} />
          </div>
        </div>
        <p className="text-2xl font-bold mt-2" style={{ color: 'var(--color-fg-default)' }}>
          {totalRepos}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-fg-subtle)' }}>
          Active CI integrations
        </p>
      </div>

      {/* Total PRs Reviewed */}
      <div 
        className="p-4 rounded-github border transition-all"
        style={{ 
          backgroundColor: 'var(--color-canvas-default)',
          borderColor: 'var(--color-border-default)'
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--color-fg-muted)' }}>
            PRs Reviewed
          </span>
          <div 
            className="p-1.5 rounded-md"
            style={{ backgroundColor: 'var(--color-success-subtle)' }}
          >
            <GitPullRequest size={16} style={{ color: 'var(--color-success-fg)' }} />
          </div>
        </div>
        <p className="text-2xl font-bold mt-2" style={{ color: 'var(--color-fg-default)' }}>
          {stats.totalReviews || 0}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-fg-subtle)' }}>
          Automated Gemini reviews
        </p>
      </div>

      {/* Avg Speed */}
      <div 
        className="p-4 rounded-github border transition-all"
        style={{ 
          backgroundColor: 'var(--color-canvas-default)',
          borderColor: 'var(--color-border-default)'
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--color-fg-muted)' }}>
            Avg Turnaround
          </span>
          <div 
            className="p-1.5 rounded-md"
            style={{ backgroundColor: 'var(--color-accent-subtle)' }}
          >
            <Zap size={16} style={{ color: 'var(--color-accent-fg)' }} />
          </div>
        </div>
        <p className="text-2xl font-bold mt-2" style={{ color: 'var(--color-fg-default)' }}>
          {stats.averageTurnaroundTimeSec || 0}s
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-fg-subtle)' }}>
          Fast analysis & response
        </p>
      </div>

      {/* Issues Breakdown */}
      <div 
        className="p-4 rounded-github border transition-all"
        style={{ 
          backgroundColor: 'var(--color-canvas-default)',
          borderColor: 'var(--color-border-default)'
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--color-fg-muted)' }}>
            Issues Caught ({totalIssues})
          </span>
          <div 
            className="p-1.5 rounded-md"
            style={{ backgroundColor: 'var(--color-danger-subtle)' }}
          >
            <ShieldAlert size={16} style={{ color: 'var(--color-danger-fg)' }} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border"
            style={{ 
              backgroundColor: 'var(--color-danger-subtle)',
              borderColor: 'var(--color-danger-fg)',
              color: 'var(--color-danger-fg)'
            }}
          >
            {stats.issueTypes?.high || 0} H
          </span>
          <span 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border"
            style={{ 
              backgroundColor: 'var(--color-attention-subtle)',
              borderColor: 'var(--color-attention-fg)',
              color: 'var(--color-attention-fg)'
            }}
          >
            {stats.issueTypes?.medium || 0} M
          </span>
          <span 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border"
            style={{ 
              backgroundColor: 'var(--color-canvas-subtle)',
              borderColor: 'var(--color-border-default)',
              color: 'var(--color-fg-muted)'
            }}
          >
            {stats.issueTypes?.low || 0} L
          </span>
        </div>
      </div>
    </div>
  );
}

