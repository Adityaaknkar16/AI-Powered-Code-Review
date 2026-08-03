import React from 'react';
import { ExternalLink, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ReviewHistory({ history, onSelectReview }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 size={12} /> Success
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 animate-pulse">
            <RefreshCw size={12} className="animate-spin" /> Pending
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-semibold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">
            <AlertCircle size={12} /> Failed
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-6">Review History</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-sm font-medium">
              <th className="py-4 px-4">Repository</th>
              <th className="py-4 px-4">Pull Request</th>
              <th className="py-4 px-4">Author</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4">Issues Found</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {history.map((review) => (
              <tr key={review._id} className="hover:bg-slate-800/20 transition-all text-slate-300 text-sm">
                <td className="py-4 px-4 font-medium text-slate-200">
                  {review.repoId?.name || 'Unknown Repository'}
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-300">#{review.pullNumber} - {review.prTitle}</span>
                    <span className="text-xs text-slate-500 mt-0.5 font-mono">commit: {review.commitSha.substring(0, 7)}</span>
                  </div>
                </td>
                <td className="py-4 px-4">@{review.sender}</td>
                <td className="py-4 px-4">{getStatusBadge(review.status)}</td>
                <td className="py-4 px-4">
                  {review.status === 'completed' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-md border border-rose-500/20">
                        {review.summaryStats?.highCount || 0} H
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20">
                        {review.summaryStats?.mediumCount || 0} M
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
                        {review.summaryStats?.lowCount || 0} L
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <a
                      href={review.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                      title="Open on GitHub"
                    >
                      <ExternalLink size={16} />
                    </a>
                    {review.status === 'completed' && (
                      <button
                        onClick={() => onSelectReview(review._id)}
                        className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View Report
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
