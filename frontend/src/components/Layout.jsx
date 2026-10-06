import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { LogOut, Sun, Moon, GitPullRequest } from 'lucide-react';
import { logout } from '../store/authSlice';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout({ children }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-canvas-subtle)' }}>
      {/* GitHub-style header */}
      <header 
        className="border-b sticky top-0 z-50"
        style={{ 
          backgroundColor: 'var(--color-canvas-default)',
          borderColor: 'var(--color-border-default)'
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and title */}
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2.5 font-semibold hover:no-underline"
                style={{ color: 'var(--color-fg-default)' }}
              >
                <img src="/favicon.svg" alt="PRPilot Logo" className="w-7 h-7 rounded-md" />
                <span className="text-base font-bold tracking-tight">AI PR Review Bot</span>
              </Link>
            </div>

            {/* Right side: theme toggle, user, logout */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-opacity-10 transition-colors"
                style={{ 
                  color: 'var(--color-fg-muted)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              {/* User avatar */}
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-6 h-6 rounded-full border"
                  style={{ borderColor: 'var(--color-border-default)' }}
                />
              ) : (
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium select-none border"
                  style={{ 
                    backgroundColor: 'var(--color-canvas-subtle)',
                    color: 'var(--color-fg-muted)',
                    borderColor: 'var(--color-border-default)'
                  }}
                >
                  {user?.username ? user.username[0].toUpperCase() : 'U'}
                </div>
              )}

              {/* Username */}
              {user?.username && (
                <span 
                  className="text-sm font-medium hidden sm:block"
                  style={{ color: 'var(--color-fg-default)' }}
                >
                  {user.username}
                </span>
              )}

              {/* Logout button */}
              <button
                onClick={() => dispatch(logout())}
                className="p-2 rounded-md transition-colors"
                style={{ color: 'var(--color-fg-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-canvas-subtle)';
                  e.currentTarget.style.color = 'var(--color-fg-default)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-fg-muted)';
                }}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
