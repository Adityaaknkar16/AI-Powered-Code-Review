import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GitPullRequest, Loader2, Sun, Moon, Terminal, ShieldCheck } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function Login() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const [devUsername, setDevUsername] = useState('');
  const [showDevLogin, setShowDevLogin] = useState(false);

  useEffect(() => {
    // Check if OAuth code is in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleCallback(code);
    }
  }, []);

  const handleCallback = async (code) => {
    dispatch(loginStart());
    try {
      const response = await axios.post(`${backendUrl}/api/auth/github`, { code });
      dispatch(loginSuccess(response.data));
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.error || 'OAuth Authentication Failed'));
    }
  };

  const handleLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!clientId || clientId === 'your_github_oauth_client_id_here') {
      dispatch(loginFailure('GitHub OAuth requires setting VITE_GITHUB_CLIENT_ID in frontend/.env. Use the Live Server Sign In form below to start immediately!'));
      return;
    }
    const redirectUri = window.location.origin;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  const handleDevLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const username = (devUsername.trim() || 'developer');
    dispatch(loginStart());
    try {
      const res = await axios.post(`${backendUrl}/api/auth/dev-login`, { username });
      dispatch(loginSuccess(res.data));
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.error || 'Failed connecting to live backend server'));
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4 relative"
      style={{ backgroundColor: 'var(--color-canvas-subtle)' }}
    >
      {/* Theme toggle in top right */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-md transition-colors"
        style={{ color: 'var(--color-fg-muted)' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-canvas-default)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Login card */}
      <div 
        className="w-full max-w-sm rounded-github border p-8 shadow-github"
        style={{ 
          backgroundColor: 'var(--color-canvas-default)',
          borderColor: 'var(--color-border-default)'
        }}
      >
        {/* Logo and title */}
        <div className="text-center mb-6">
          <div 
            className="inline-flex p-3 rounded-md mb-3"
            style={{ backgroundColor: 'var(--color-accent-subtle)' }}
          >
            <GitPullRequest size={32} style={{ color: 'var(--color-accent-fg)' }} />
          </div>
          <h1 
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--color-fg-default)' }}
          >
            AI PR Review Bot
          </h1>
          <p 
            className="text-sm"
            style={{ color: 'var(--color-fg-muted)' }}
          >
            Real-time automated code reviews with Gemini 2.0 Flash AI
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div 
            className="p-3 rounded-github mb-4 text-xs border"
            style={{ 
              backgroundColor: 'var(--color-danger-subtle)',
              borderColor: 'var(--color-danger-fg)',
              color: 'var(--color-danger-fg)'
            }}
          >
            {error}
          </div>
        )}

        <div className="space-y-4">
          <form onSubmit={handleDevLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-fg-default)' }}>
                GitHub Username
              </label>
              <input
                type="text"
                placeholder="Enter username (e.g. octocat)"
                value={devUsername}
                onChange={(e) => setDevUsername(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-github border outline-none font-mono"
                style={{
                  backgroundColor: 'var(--color-canvas-subtle)',
                  borderColor: 'var(--color-border-default)',
                  color: 'var(--color-fg-default)'
                }}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-github text-xs font-semibold text-white flex items-center justify-center gap-2 border transition-colors disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: 'rgb(31, 111, 235)',
                borderColor: 'rgba(31, 35, 40, 0.15)'
              }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <>
                  <GitPullRequest size={15} />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info text */}
        <p 
          className="text-xs text-center mt-5"
          style={{ color: 'var(--color-fg-subtle)' }}
        >
          Powered by MongoDB Atlas & Gemini 2.0 Flash AI
        </p>
      </div>

      {/* Footer */}
      <p 
        className="text-xs mt-8"
        style={{ color: 'var(--color-fg-subtle)' }}
      >
        Google Gemini 2.0 Flash Code Reviewer
      </p>
    </div>
  );
}

