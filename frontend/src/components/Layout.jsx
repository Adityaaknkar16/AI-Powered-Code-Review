import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      {/* Top Bar */}
      <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 md:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-text-primary tracking-tight">
            AI PR Review Bot
          </span>
        </div>
        
        {/* User Profile Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-border overflow-hidden flex items-center justify-center text-xs font-semibold text-text-secondary">
            U
          </div>
        </div>
      </header>

      {/* Page Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 md:px-12 py-8">
        {children}
      </main>
    </div>
  );
}
