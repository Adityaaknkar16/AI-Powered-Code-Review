import React from 'react';
import { Link } from 'react-router-dom';

export default function RepoCard({ repo }) {
  // Safe URL encoding for paths with slashes
  const encodedName = encodeURIComponent(repo.name);

  return (
    <Link 
      to={`/repo/${encodedName}`}
      className="block p-6 bg-surface border border-border rounded-lg hover:border-text-secondary transition-all"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-text-primary text-base">{repo.name}</h3>
          <p className="text-sm text-text-secondary mt-1">
            {repo.prsReviewed} PRs reviewed
          </p>
        </div>
        <span className="text-xs text-text-secondary font-medium">
          Connected
        </span>
      </div>
    </Link>
  );
}
