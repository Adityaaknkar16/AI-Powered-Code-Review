import React from 'react';
import { GitPullRequest, Clock, ShieldAlert, AlertTriangle, Info } from 'lucide-react';

export default function StatsSummary({ stats }) {
  if (!stats) return (
    <div className="animate-pulse flex space-x-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total PRs card */}
      <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/60 shadow-lg flex items-center space-x-4">
        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
          <GitPullRequest size={24} />
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">Total Reviewed PRs</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalReviews || 0}</p>
        </div>
      </div>

      {/* Average Turnaround card */}
      <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/60 shadow-lg flex items-center space-x-4">
        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
          <Clock size={24} />
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">Avg Review Speed</p>
          <p className="text-2xl font-bold text-white mt-1">
            {stats.averageTurnaroundTimeSec || 0}s
          </p>
        </div>
      </div>

      {/* Severity breakdown summaries */}
      <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/60 shadow-lg col-span-1 md:col-span-2 grid grid-cols-3 gap-4">
        <div className="text-center border-r border-slate-700/60">
          <p className="text-rose-400 text-xs font-semibold uppercase flex items-center justify-center gap-1">
            <ShieldAlert size={14} /> High
          </p>
          <p className="text-2xl font-bold text-white mt-2">{stats.issueTypes?.high || 0}</p>
        </div>
        <div className="text-center border-r border-slate-700/60">
          <p className="text-amber-400 text-xs font-semibold uppercase flex items-center justify-center gap-1">
            <AlertTriangle size={14} /> Medium
          </p>
          <p className="text-2xl font-bold text-white mt-2">{stats.issueTypes?.medium || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-blue-400 text-xs font-semibold uppercase flex items-center justify-center gap-1">
            <Info size={14} /> Low
          </p>
          <p className="text-2xl font-bold text-white mt-2">{stats.issueTypes?.low || 0}</p>
        </div>
      </div>
    </div>
  );
}
