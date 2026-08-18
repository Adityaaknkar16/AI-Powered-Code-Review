import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export default function CommentCard({ comment, isLast }) {
  const getSeverityConfig = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return {
          icon: <AlertCircle size={16} />,
          label: 'High',
          color: 'var(--color-danger-fg)',
          bg: 'var(--color-danger-subtle)',
          border: 'var(--color-danger-fg)',
        };
      case 'medium':
        return {
          icon: <AlertTriangle size={16} />,
          label: 'Medium',
          color: 'var(--color-attention-fg)',
          bg: 'var(--color-attention-subtle)',
          border: 'var(--color-attention-fg)',
        };
      default:
        return {
          icon: <Info size={16} />,
          label: 'Low',
          color: 'var(--color-fg-muted)',
          bg: 'var(--color-canvas-subtle)',
          border: 'var(--color-border-default)',
        };
    }
  };

  const config = getSeverityConfig(comment.severity);

  return (
    <div 
      className={`px-4 py-3 border-x ${isLast ? 'border-b rounded-b-github' : 'border-b'}`}
      style={{ 
        backgroundColor: 'var(--color-canvas-default)',
        borderColor: 'var(--color-border-default)'
      }}
    >
      {/* Header with line number and severity */}
      <div className="flex items-center justify-between mb-2">
        <span 
          className="text-xs font-mono"
          style={{ color: 'var(--color-fg-muted)' }}
        >
          Line {comment.line}
        </span>
        <span 
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
          style={{ 
            backgroundColor: config.bg,
            borderColor: config.border,
            color: config.color
          }}
        >
          {config.icon}
          {config.label}
        </span>
      </div>

      {/* Comment text */}
      <p 
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-fg-default)' }}
      >
        {comment.comment}
      </p>
    </div>
  );
}
