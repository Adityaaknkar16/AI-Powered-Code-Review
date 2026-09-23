import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  FileCode, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Loader2, 
  RotateCcw, 
  Copy, 
  Check,
  Zap,
  Shield,
  Cpu,
  FileText,
  AlertOctagon
} from 'lucide-react';
import { testDiffAnalysis } from '../api';

const SAMPLE_DIFFS = [
  {
    id: 'sql_injection',
    title: 'SQL Injection Vulnerability',
    category: 'security',
    icon: <AlertOctagon size={14} className="text-rose-500" />,
    diff: `--- a/src/services/userService.js
+++ b/src/services/userService.js
@@ -14,6 +14,8 @@
 async function findUserByQuery(rawInput) {
+  // Constructing raw query from user input
+  const query = "SELECT * FROM users WHERE username = '" + rawInput + "'";
+  const result = await db.raw(query);
+  return result;
 }`
  },
  {
    id: 'memory_leak',
    title: 'Event Listener Memory Leak',
    category: 'performance',
    icon: <Zap size={14} className="text-amber-500" />,
    diff: `--- a/src/components/DataStream.jsx
+++ b/src/components/DataStream.jsx
@@ -10,6 +10,8 @@
 useEffect(() => {
+  const handler = (event) => setStreamData(event.detail);
+  window.addEventListener('socket-broadcast', handler);
+  // Missing cleanup return function
 }, []);`
  },
  {
    id: 'clean_refactor',
    title: 'Clean TypeScript Refactoring',
    category: 'style',
    icon: <CheckCircle2 size={14} className="text-emerald-500" />,
    diff: `--- a/src/utils/math.ts
+++ b/src/utils/math.ts
@@ -1,5 +1,8 @@
-export function calculateDiscount(price, rate) {
-  return price - price * rate;
+export interface DiscountCalculationOptions {
+  price: number;
+  rate: number;
 }
+export function calculateDiscount({ price, rate }: DiscountCalculationOptions): number {
+  return Math.max(0, price - price * rate);
+}`
  }
 ];

export default function Playground() {
  const [diffText, setDiffText] = useState(SAMPLE_DIFFS[0].diff);
  const [focusArea, setFocusArea] = useState('full');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!diffText.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const data = await testDiffAnalysis(diffText, focusArea);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample) => {
    setDiffText(sample.diff);
    setResult(null);
    setError(null);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const text = result.reviews.map(r => `[${r.severity.toUpperCase()}] Line ${r.line} in ${r.file}: ${r.comment}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div 
        className="p-5 rounded-github border flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--color-canvas-default)',
          borderColor: 'var(--color-border-default)'
        }}
      >
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-fg-default)' }}>
            <Sparkles size={20} style={{ color: 'var(--color-accent-fg)' }} />
            Interactive AI Review Playground
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-fg-muted)' }}>
            Test Gemini's code review intelligence on raw Git patches, PR diffs, or vulnerability presets.
          </p>
        </div>

        {/* Focus selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold" style={{ color: 'var(--color-fg-muted)' }}>
            Focus:
          </label>
          <select
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-github border font-medium outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--color-canvas-subtle)',
              borderColor: 'var(--color-border-default)',
              color: 'var(--color-fg-default)'
            }}
          >
            <option value="full">Full Analysis (All Issues)</option>
            <option value="security">Security Only</option>
            <option value="performance">Performance Only</option>
            <option value="style">Style & Conventions</option>
          </select>
        </div>
      </div>

      {/* Preset Diff Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold" style={{ color: 'var(--color-fg-muted)' }}>
          Sample Scenarios:
        </span>
        {SAMPLE_DIFFS.map((sample) => (
          <button
            key={sample.id}
            onClick={() => loadSample(sample)}
            className="px-2.5 py-1.5 rounded-github text-xs border font-medium transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: diffText === sample.diff ? 'var(--color-accent-subtle)' : 'var(--color-canvas-default)',
              borderColor: diffText === sample.diff ? 'var(--color-accent-fg)' : 'var(--color-border-default)',
              color: diffText === sample.diff ? 'var(--color-accent-fg)' : 'var(--color-fg-default)'
            }}
          >
            {sample.icon}
            {sample.title}
          </button>
        ))}
      </div>

      {/* Main Grid: Input & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Diff Editor */}
        <div 
          className="rounded-github border flex flex-col overflow-hidden"
          style={{
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <div 
            className="px-4 py-2.5 border-b flex items-center justify-between text-xs font-semibold"
            style={{
              backgroundColor: 'var(--color-canvas-subtle)',
              borderColor: 'var(--color-border-default)',
              color: 'var(--color-fg-muted)'
            }}
          >
            <span className="flex items-center gap-1.5">
              <FileCode size={15} />
              Git Diff Patch Input
            </span>
            <button
              onClick={() => { setDiffText(''); setResult(null); }}
              className="hover:underline flex items-center gap-1"
            >
              <RotateCcw size={12} /> Clear
            </button>
          </div>

          <textarea
            value={diffText}
            onChange={(e) => setDiffText(e.target.value)}
            placeholder="Paste unified diff patch here (e.g. + added lines, - removed lines)..."
            rows={14}
            className="w-full p-4 font-mono text-xs outline-none resize-none"
            style={{
              backgroundColor: 'var(--color-canvas-default)',
              color: 'var(--color-fg-default)'
            }}
          />

          <div 
            className="p-3 border-t flex justify-end"
            style={{
              backgroundColor: 'var(--color-canvas-subtle)',
              borderColor: 'var(--color-border-default)'
            }}
          >
            <button
              onClick={handleAnalyze}
              disabled={loading || !diffText.trim()}
              className="px-4 py-2 rounded-github text-xs font-semibold text-white border flex items-center gap-2 disabled:opacity-50"
              style={{
                backgroundColor: 'rgb(31, 111, 235)',
                borderColor: 'rgba(31, 35, 40, 0.15)'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Analyzing with Gemini…
                </>
              ) : (
                <>
                  <Play size={14} />
                  Run AI Review
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: AI Output */}
        <div 
          className="rounded-github border flex flex-col overflow-hidden"
          style={{
            backgroundColor: 'var(--color-canvas-default)',
            borderColor: 'var(--color-border-default)'
          }}
        >
          <div 
            className="px-4 py-2.5 border-b flex items-center justify-between text-xs font-semibold"
            style={{
              backgroundColor: 'var(--color-canvas-subtle)',
              borderColor: 'var(--color-border-default)',
              color: 'var(--color-fg-muted)'
            }}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles size={15} style={{ color: 'var(--color-accent-fg)' }} />
              Gemini Review Results
            </span>
            {result && result.reviews.length > 0 && (
              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1 hover:underline"
              >
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>

          <div className="p-4 flex-1 overflow-y-auto max-h-[460px]">
            {loading && (
              <div className="py-16 text-center space-y-3">
                <Loader2 size={32} className="animate-spin mx-auto text-blue-500" />
                <p className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>
                  Gemini is inspecting code diff…
                </p>
                <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                  Scanning for vulnerabilities, logic errors, and styling violations.
                </p>
              </div>
            )}

            {error && (
              <div 
                className="p-4 rounded-github border text-xs"
                style={{
                  backgroundColor: 'var(--color-danger-subtle)',
                  borderColor: 'var(--color-danger-fg)',
                  color: 'var(--color-danger-fg)'
                }}
              >
                {error}
              </div>
            )}

            {!loading && !result && !error && (
              <div className="py-16 text-center text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                Click <strong>Run AI Review</strong> to send the patch to Gemini and generate comments.
              </div>
            )}

            {!loading && result && result.reviews.length === 0 && (
              <div className="py-12 text-center">
                <div 
                  className="inline-flex p-3 rounded-full mb-3"
                  style={{ backgroundColor: 'var(--color-success-subtle)' }}
                >
                  <CheckCircle2 size={32} style={{ color: 'var(--color-success-fg)' }} />
                </div>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--color-fg-default)' }}>
                  No issues detected!
                </h4>
                <p className="text-xs mt-1 flex items-center justify-center gap-1" style={{ color: 'var(--color-fg-muted)' }}>
                  Gemini verified the diff patch. Clean work. (<Zap size={12} className="text-amber-500" /> {result.turnaroundTimeMs}ms)
                </p>
              </div>
            )}

            {!loading && result && result.reviews.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--color-border-muted)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-fg-default)' }}>
                    Found {result.reviews.length} {result.reviews.length === 1 ? 'issue' : 'issues'}
                  </span>
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-fg-muted)' }}>
                    <Zap size={12} className="text-amber-500" />
                    {result.turnaroundTimeMs}ms
                  </span>
                </div>

                {result.reviews.map((rev, idx) => {
                  const isHigh = rev.severity === 'high';
                  const isMed = rev.severity === 'medium';
                  return (
                    <div 
                      key={idx}
                      className="p-3 rounded-github border text-xs space-y-1.5"
                      style={{
                        backgroundColor: 'var(--color-canvas-subtle)',
                        borderColor: isHigh ? 'var(--color-danger-fg)' : isMed ? 'var(--color-attention-fg)' : 'var(--color-border-default)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold" style={{ color: 'var(--color-fg-default)' }}>
                          {rev.file} : Line {rev.line}
                        </span>
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase border"
                          style={{
                            backgroundColor: isHigh ? 'var(--color-danger-subtle)' : isMed ? 'var(--color-attention-subtle)' : 'var(--color-canvas-default)',
                            borderColor: isHigh ? 'var(--color-danger-fg)' : isMed ? 'var(--color-attention-fg)' : 'var(--color-border-default)',
                            color: isHigh ? 'var(--color-danger-fg)' : isMed ? 'var(--color-attention-fg)' : 'var(--color-fg-muted)'
                          }}
                        >
                          {rev.severity}
                        </span>
                      </div>
                      <p className="leading-relaxed" style={{ color: 'var(--color-fg-default)' }}>
                        {rev.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
