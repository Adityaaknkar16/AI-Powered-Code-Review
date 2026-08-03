import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReviewRow({ review, repoName }) {
  const navigate = useNavigate();
  const encodedRepo = encodeURIComponent(repoName);

  const getIssuesDisplay = (summary) => {
    if (!summary || summary.toLowerCase().includes('0 issues')) {
      return <span className="text-severity-low font-medium">0 issues</span>;
    }

    // Split "1 high, 2 medium" or similar
    const parts = summary.split(', ');
    return (
      <div className="flex gap-3">
        {parts.map((part, idx) => {
          const isHigh = part.toLowerCase().includes('high');
          const isMedium = part.toLowerCase().includes('medium');
          const colorClass = isHigh 
            ? 'text-severity-high font-semibold' 
            : isMedium 
              ? 'text-severity-medium font-semibold' 
              : 'text-severity-low font-semibold';
          
          return (
            <span key={idx} className={colorClass}>
              {part}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <tr 
      onClick={() => navigate(`/repo/${encodedRepo}/review/${review.id}`)}
      className="border-b border-border hover:bg-bg cursor-pointer transition-all text-sm"
    >
      <td className="py-5 px-4 font-medium text-text-primary">
        <span className="text-text-secondary font-mono mr-2">#{review.pullNumber}</span>
        {review.title}
      </td>
      <td className="py-5 px-4 text-text-secondary whitespace-nowrap">
        {review.date}
      </td>
      <td className="py-5 px-4">
        {getIssuesDisplay(review.issueSummary)}
      </td>
    </tr>
  );
}
