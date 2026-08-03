import React from 'react';
import { ToggleLeft, ToggleRight, Settings2, Shield, Eye, Cpu, FileText } from 'lucide-react';

export default function RepoList({ repos, onUpdateSettings }) {
  const getFocusIcon = (focus) => {
    switch (focus) {
      case 'security': return <Shield size={16} className="text-rose-400" />;
      case 'performance': return <Cpu size={16} className="text-amber-400" />;
      case 'style': return <FileText size={16} className="text-blue-400" />;
      default: return <Eye size={16} className="text-indigo-400" />;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings2 size={20} className="text-indigo-400" />
          Connected Repositories
        </h2>
        <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full font-medium border border-slate-700/50">
          {repos.length} Total
        </span>
      </div>

      <div className="space-y-4">
        {repos.map((repo) => (
          <div key={repo._id} className="p-4 bg-slate-800/30 border border-slate-800 rounded-xl hover:border-slate-700/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-200 text-base">{repo.name}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  Focus: {getFocusIcon(repo.settings?.reviewFocus)} <span className="capitalize">{repo.settings?.reviewFocus}</span>
                </span>
                <span className="text-xs text-slate-400">
                  Min Severity: <span className="capitalize font-semibold text-slate-300">{repo.settings?.minSeverity}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Review Focus Select */}
              <select
                value={repo.settings?.reviewFocus || 'full'}
                onChange={(e) => onUpdateSettings(repo._id, { reviewFocus: e.target.value })}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 outline-none cursor-pointer"
              >
                <option value="full">Full Review</option>
                <option value="security">Security Only</option>
                <option value="performance">Performance Only</option>
                <option value="style">Style Only</option>
              </select>

              {/* Min Severity Select */}
              <select
                value={repo.settings?.minSeverity || 'low'}
                onChange={(e) => onUpdateSettings(repo._id, { minSeverity: e.target.value })}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 outline-none cursor-pointer"
              >
                <option value="low">Low + Above</option>
                <option value="medium">Medium + Above</option>
                <option value="high">High Only</option>
              </select>

              {/* Status Toggle */}
              <button
                onClick={() => onUpdateSettings(repo._id, { isActive: !repo.isActive })}
                className="focus:outline-none transition-colors"
                title={repo.isActive ? 'Deactivate Auto-Review' : 'Activate Auto-Review'}
              >
                {repo.isActive ? (
                  <ToggleRight size={32} className="text-indigo-500 cursor-pointer" />
                ) : (
                  <ToggleLeft size={32} className="text-slate-600 cursor-pointer" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
