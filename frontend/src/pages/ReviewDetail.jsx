import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getReviewDetail } from '../api';
import CommentCard from '../components/CommentCard';
import { 
  ChevronLeft, 
  FileCode, 
  CheckCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Search, 
  Zap, 
  GitCommit, 
  User 
} from 'lucide-react';

export default function ReviewDetail() {
  const { repoName, reviewId } = useParams();
  const decodedRepoName = decodeURIComponent(repoName);

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        const data = await getReviewDetail(reviewId);
        setReview(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [reviewId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div 
          className="h-10 rounded-github w-1/2 animate-pulse" 
          style={{ 
            backgroundColor: 'var(--color-canvas-default)',
            border: '1px solid var(--color-border-default)'
          }}
        />
        <div 
          className="h-48 rounded-github animate-pulse" 
          style={{ 
            backgroundColor: 'var(--color-canvas-default)',
            border: '1px solid var(--color-border-default)'
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="p-4 rounded-github border text-sm"
        style={{ 
          backgroundColor: 'var(--color-danger-subtle)',
          borderColor: 'var(--color-danger-fg)',
          color: 'var(--color-danger-fg)'
        }}
      >
        Failed to load review: {error}
      </div>
    );
  }

  if (!review) return null;

  const pullNumber = review.pullNumber;
  const title = review.title || review.prTitle;
  const date = review.date;
  const comments = review.comments || [];
  const highCount = review.summaryStats?.highCount || comments.filter(c => c.severity === 'high').length;
  const mediumCount = review.summaryStats?.mediumCount || comments.filter(c => c.severity === 'medium').length;
  const lowCount = review.summaryStats?.lowCount || comments.filter(c => c.severity === 'low').length;
  const totalIssues = highCount + mediumCount + lowCount;

  // Group all comments by file
  const allCommentsByFile = comments.reduce((acc, comment) => {
    if (!acc[comment.file]) acc[comment.file] = [];
    acc[comment.file].push(comment);
    return acc;
  }, {});

  const allFiles = Object.keys(allCommentsByFile);

  // Filtered comments based on search, severity, and selected file
  const filteredComments = comments.filter((c) => {
    if (selectedFile !== 'ALL' && c.file !== selectedFile) return false;
    if (severityFilter !== 'all' && c.severity.toLowerCase() !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchComment = (c.comment || '').toLowerCase().includes(q);
      const matchFile = (c.file || '').toLowerCase().includes(q);
      if (!matchComment && !matchFile) return false;
    }
    return true;
  });

  // Group filtered comments by file for display
  const displayCommentsByFile = filteredComments.reduce((acc, comment) => {
    if (!acc[comment.file]) acc[comment.file] = [];
    acc[comment.file].push(comment);
    return acc;
  }, {});

  const displayFiles = Object.keys(displayCommentsByFile);

  const handleCopyFullReport = () => {
    let report = `# AI Code Review Summary: ${decodedRepoName} #${pullNumber}\n\n`;
    report += `**PR Title:** ${title}\n`;
    report += `**Author:** @${review.sender || 'developer'} | **Commit:** \`${review.commitSha || 'latest'}\` | **Date:** ${date}\n`;
    report += `**Issues Summary:** ${highCount} High, ${mediumCount} Medium, ${lowCount} Low\n\n`;
    report += `## Detailed Findings\n\n`;

    if (comments.length === 0) {
      report += `[PASSED] No issues detected. Code is clean and approved.\n`;
    } else {
      comments.forEach((c) => {
        report += `### File: \`${c.file}\` (Line ${c.line}) - **[${c.severity.toUpperCase()}]**\n`;
        report += `${c.comment}\n\n`;
      });
    }

    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to={`/repo/${encodeURIComponent(repoName)}`}
          className="inline-flex items-center gap-1 text-xs mb-3 hover:no-underline font-medium"
          style={{ color: 'var(--color-accent-fg)' }}
        >
          <ChevronLeft size={14} />
          Back to {decodedRepoName}
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className="font-mono text-xl font-bold"
                style={{ color: 'var(--color-fg-muted)' }}
              >
                #{pullNumber}
              </span>
              <h1 
                className="text-2xl font-bold"
                style={{ color: 'var(--color-fg-default)' }}
              >
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-3 mt-2 flex-wrap text-xs" style={{ color: 'var(--color-fg-muted)' }}>
              {review.sender && (
                <span className="flex items-center gap-1">
                  <User size={13} />
                  @{review.sender}
                </span>
              )}
              {review.commitSha && (
                <span className="flex items-center gap-1 font-mono">
                  <GitCommit size={13} />
                  {review.commitSha.slice(0, 7)}
                </span>
              )}
              <span>•</span>
              <span>{date}</span>
              {review.turnaroundTimeMs && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--color-accent-fg)' }}>
                    <Zap size={13} />
                    {Math.round(review.turnaroundTimeMs / 100) / 10}s analysis speed
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-center">
            {review.prUrl && (
              <a
                href={review.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-github text-xs font-semibold border flex items-center gap-1.5 transition-colors"
                style={{
                  backgroundColor: 'var(--color-canvas-default)',
                  borderColor: 'var(--color-border-default)',
                  color: 'var(--color-fg-default)'
                }}
              >
                <ExternalLink size={13} />
                View on GitHub
              </a>
            )}

            <button
              onClick={handleCopyFullReport}
              className="px-3 py-1.5 rounded-github text-xs font-semibold text-white border flex items-center gap-1.5"
              style={{
                backgroundColor: 'rgb(31, 111, 235)',
                borderColor: 'rgba(31, 35, 40, 0.15)'
              }}
            >
              {copiedReport ? <Check size={13} /> : <Copy size={13} />}
              {copiedReport ? 'Copied Report' : 'Copy Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          className="p-3 rounded-github border"
          style={{
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>Total Issues</span>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-fg-default)' }}>{totalIssues}</p>
        </div>
        <div 
          className="p-3 rounded-github border"
          style={{
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-danger-fg)' }}>
            <ShieldAlert size={12} /> High Severity
          </span>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-danger-fg)' }}>{highCount}</p>
        </div>
        <div 
          className="p-3 rounded-github border"
          style={{
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-attention-fg)' }}>
            <AlertTriangle size={12} /> Medium
          </span>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-attention-fg)' }}>{mediumCount}</p>
        </div>
        <div 
          className="p-3 rounded-github border"
          style={{
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-fg-muted)' }}>
            <Info size={12} /> Low / Style
          </span>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-fg-default)' }}>{lowCount}</p>
        </div>
      </div>

      {/* Filter and File Navigation Toolbar */}
      {comments.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-github border w-full max-w-md text-xs"
              style={{
                backgroundColor: 'var(--color-canvas-default)',
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-fg-default)'
              }}
            >
              <Search size={14} style={{ color: 'var(--color-fg-muted)' }} />
              <input
                type="text"
                placeholder="Search comments or file paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </div>

            {/* Severity Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setSeverityFilter('all')}
                className="px-2.5 py-1 rounded-github text-xs border font-medium transition-colors"
                style={{
                  backgroundColor: severityFilter === 'all' ? 'var(--color-accent-subtle)' : 'var(--color-canvas-default)',
                  borderColor: severityFilter === 'all' ? 'var(--color-accent-fg)' : 'var(--color-border-default)',
                  color: severityFilter === 'all' ? 'var(--color-accent-fg)' : 'var(--color-fg-default)'
                }}
              >
                All ({comments.length})
              </button>
              <button
                onClick={() => setSeverityFilter('high')}
                className="px-2.5 py-1 rounded-github text-xs border font-medium transition-colors"
                style={{
                  backgroundColor: severityFilter === 'high' ? 'var(--color-danger-subtle)' : 'var(--color-canvas-default)',
                  borderColor: severityFilter === 'high' ? 'var(--color-danger-fg)' : 'var(--color-border-default)',
                  color: severityFilter === 'high' ? 'var(--color-danger-fg)' : 'var(--color-fg-default)'
                }}
              >
                High ({highCount})
              </button>
              <button
                onClick={() => setSeverityFilter('medium')}
                className="px-2.5 py-1 rounded-github text-xs border font-medium transition-colors"
                style={{
                  backgroundColor: severityFilter === 'medium' ? 'var(--color-attention-subtle)' : 'var(--color-canvas-default)',
                  borderColor: severityFilter === 'medium' ? 'var(--color-attention-fg)' : 'var(--color-border-default)',
                  color: severityFilter === 'medium' ? 'var(--color-attention-fg)' : 'var(--color-fg-default)'
                }}
              >
                Medium ({mediumCount})
              </button>
              <button
                onClick={() => setSeverityFilter('low')}
                className="px-2.5 py-1 rounded-github text-xs border font-medium transition-colors"
                style={{
                  backgroundColor: severityFilter === 'low' ? 'var(--color-canvas-subtle)' : 'var(--color-canvas-default)',
                  borderColor: severityFilter === 'low' ? 'var(--color-fg-muted)' : 'var(--color-border-default)',
                  color: severityFilter === 'low' ? 'var(--color-fg-default)' : 'var(--color-fg-default)'
                }}
              >
                Low ({lowCount})
              </button>
            </div>
          </div>

          {/* File selector pills */}
          {allFiles.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-xs font-medium mr-1" style={{ color: 'var(--color-fg-muted)' }}>Files:</span>
              <button
                onClick={() => setSelectedFile('ALL')}
                className="px-2 py-0.5 rounded-full text-xs font-mono border"
                style={{
                  backgroundColor: selectedFile === 'ALL' ? 'var(--color-accent-subtle)' : 'var(--color-canvas-default)',
                  borderColor: selectedFile === 'ALL' ? 'var(--color-accent-fg)' : 'var(--color-border-default)',
                  color: selectedFile === 'ALL' ? 'var(--color-accent-fg)' : 'var(--color-fg-muted)'
                }}
              >
                All Files ({allFiles.length})
              </button>
              {allFiles.map((file) => (
                <button
                  key={file}
                  onClick={() => setSelectedFile(file)}
                  className="px-2 py-0.5 rounded-full text-xs font-mono border truncate max-w-xs"
                  style={{
                    backgroundColor: selectedFile === file ? 'var(--color-accent-subtle)' : 'var(--color-canvas-default)',
                    borderColor: selectedFile === file ? 'var(--color-accent-fg)' : 'var(--color-border-default)',
                    color: selectedFile === file ? 'var(--color-accent-fg)' : 'var(--color-fg-muted)'
                  }}
                  title={file}
                >
                  {file.split('/').pop()} ({allCommentsByFile[file].length})
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Comments List or Zero State */}
      {comments.length === 0 ? (
        <div 
          className="p-10 rounded-github border text-center"
          style={{ 
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <div 
            className="inline-flex p-3 rounded-full mb-3"
            style={{ backgroundColor: 'var(--color-success-subtle)' }}
          >
            <CheckCircle size={32} style={{ color: 'var(--color-success-fg)' }} />
          </div>
          <h3 
            className="text-base font-semibold mb-1"
            style={{ color: 'var(--color-fg-default)' }}
          >
            No issues found
          </h3>
          <p 
            className="text-sm max-w-md mx-auto"
            style={{ color: 'var(--color-fg-muted)' }}
          >
            Gemini AI reviewed all changes in this pull request and found 0 security or correctness issues. Great work!
          </p>
        </div>
      ) : displayFiles.length === 0 ? (
        <div 
          className="p-8 rounded-github border text-center text-sm"
          style={{ 
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)',
            color: 'var(--color-fg-muted)'
          }}
        >
          No review comments match the selected filters.
        </div>
      ) : (
        <div className="space-y-6">
          {displayFiles.map((filename) => (
            <div key={filename}>
              {/* File header */}
              <div 
                className="flex items-center gap-2 px-3 py-2 rounded-t-github border font-mono text-xs font-semibold"
                style={{ 
                  backgroundColor: 'var(--color-canvas-subtle)',
                  borderColor: 'var(--color-border-default)',
                  color: 'var(--color-fg-default)'
                }}
              >
                <FileCode size={15} style={{ color: 'var(--color-fg-muted)' }} />
                <span className="truncate">{filename}</span>
                <span 
                  className="ml-auto px-2 py-0.5 rounded-full text-xs font-sans font-medium"
                  style={{ 
                    backgroundColor: 'var(--color-canvas-default)',
                    color: 'var(--color-fg-muted)',
                    border: '1px solid var(--color-border-default)'
                  }}
                >
                  {displayCommentsByFile[filename].length} {displayCommentsByFile[filename].length === 1 ? 'issue' : 'issues'}
                </span>
              </div>

              {/* Comments */}
              <div className="space-y-0">
                {displayCommentsByFile[filename].map((comment, index) => (
                  <CommentCard 
                    key={index} 
                    comment={comment} 
                    isLast={index === displayCommentsByFile[filename].length - 1} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

