import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, Copy, Check } from 'lucide-react';

function FormattedComment({ text }) {
  // Simple markdown-like formatter for code blocks, inline code, and bold text
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g);

  return (
    <div className="text-sm leading-relaxed" style={{ color: 'var(--color-fg-default)' }}>
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const codeContent = part.slice(3, -3).replace(/^[a-z]+\n/i, '');
          return (
            <pre 
              key={index} 
              className="my-2 p-3 rounded-md font-mono text-xs overflow-x-auto border"
              style={{ 
                backgroundColor: 'var(--color-canvas-subtle)',
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-fg-default)'
              }}
            >
              <code>{codeContent}</code>
            </pre>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={index}>
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}

export default function CommentCard({ comment, isLast }) {
  const [copied, setCopied] = useState(false);

  const getSeverityConfig = (severity = 'low') => {
    switch (severity.toLowerCase()) {
      case 'high':
        return {
          icon: <AlertCircle size={14} />,
          label: 'High Severity',
          color: 'var(--color-danger-fg)',
          bg: 'var(--color-danger-subtle)',
          border: 'var(--color-danger-fg)',
        };
      case 'medium':
        return {
          icon: <AlertTriangle size={14} />,
          label: 'Medium Warning',
          color: 'var(--color-attention-fg)',
          bg: 'var(--color-attention-subtle)',
          border: 'var(--color-attention-fg)',
        };
      default:
        return {
          icon: <Info size={14} />,
          label: 'Low / Note',
          color: 'var(--color-fg-muted)',
          bg: 'var(--color-canvas-subtle)',
          border: 'var(--color-border-default)',
        };
    }
  };

  const config = getSeverityConfig(comment.severity);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Line ${comment.line} [${comment.severity.toUpperCase()}]: ${comment.comment}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className={`px-4 py-3.5 border-x ${isLast ? 'border-b rounded-b-github' : 'border-b'} transition-colors`}
      style={{ 
        backgroundColor: 'var(--color-canvas-default)',
        borderColor: 'var(--color-border-default)'
      }}
    >
      {/* Header with line number, severity and copy action */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span 
            className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded border"
            style={{ 
              backgroundColor: 'var(--color-canvas-subtle)',
              borderColor: 'var(--color-border-default)',
              color: 'var(--color-accent-fg)' 
            }}
          >
            Line {comment.line}
          </span>
          <span 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide"
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

        <button
          onClick={handleCopy}
          className="p-1 rounded text-xs hover:underline flex items-center gap-1 transition-colors"
          style={{ color: 'var(--color-fg-muted)' }}
          title="Copy comment to clipboard"
        >
          {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Formatted comment text */}
      <FormattedComment text={comment.comment} />
    </div>
  );
}

