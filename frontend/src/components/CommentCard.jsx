import React from 'react';

export default function CommentCard({ comment }) {
  const getSeverityStyle = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-severity-high font-semibold';
      case 'medium':
        return 'text-severity-medium font-semibold';
      default:
        return 'text-severity-low font-semibold';
    }
  };

  return (
    <div className="p-6 bg-surface border border-border rounded-lg mb-4">
      <div className="text-xs text-text-secondary mb-2">
        Line {comment.line} · <span className={getSeverityStyle(comment.severity)}>{comment.severity.toLowerCase()}</span>
      </div>
      <p className="text-sm text-text-primary leading-relaxed">
        {comment.comment}
      </p>
    </div>
  );
}
