import React, { useState } from 'react';
import { ArrowLeft, FileCode, CheckCircle, ShieldAlert, AlertTriangle, Info } from 'lucide-react';

export default function ReviewDetail({ review, onBack }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const commentsByFile = review.comments.reduce((acc, comment) => {
    if (!acc[comment.file]) acc[comment.file] = [];
    acc[comment.file].push(comment);
    return acc;
  }, {});

  const files = Object.keys(commentsByFile);
  const activeFile = selectedFile || files[0];
  const activeComments = commentsByFile[activeFile] || [];

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
          badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
          icon: <ShieldAlert size={14} className="text-rose-400" />
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
          badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
          icon: <AlertTriangle size={14} className="text-amber-400" />
        };
      default:
        return {
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
          badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
          icon: <Info size={14} className="text-blue-400" />
        };
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">Review Details</h2>
          <p className="text-sm text-slate-400 mt-1">
            {review.repoId?.name} — #{review.pullNumber} {review.prTitle}
          </p>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl mb-4 border border-emerald-500/20">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">No issues found!</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Gemini reviewed the pull request changes and found no issues or violations. Clean work!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Explorer list */}
          <div className="lg:col-span-1 border-r border-slate-800 pr-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Changed Files</h3>
            {files.map((file) => (
              <button
                key={file}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                  activeFile === file
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <span className="truncate flex items-center gap-2">
                  <FileCode size={14} />
                  {file.split('/').pop()}
                </span>
                <span className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full font-semibold">
                  {commentsByFile[file].length}
                </span>
              </button>
            ))}
          </div>

          {/* Issue Viewer */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-3 bg-slate-800/20 border border-slate-800 rounded-xl mb-4">
              <p className="text-xs font-mono text-slate-400 truncate">{activeFile}</p>
            </div>

            {activeComments.map((comment, index) => {
              const styles = getSeverityStyles(comment.severity);
              return (
                <div
                  key={index}
                  className={`p-5 rounded-xl border ${styles.bg} transition-all shadow-md`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono text-slate-300">
                      Line {comment.line}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase ${styles.badge}`}>
                      {styles.icon}
                      {comment.severity}
                    </span>
                  </div>
                  <p className="text-slate-100 text-sm leading-relaxed">{comment.comment}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
