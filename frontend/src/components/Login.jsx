import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GitPullRequest, Loader2, Sun, Moon } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

export default function Login() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

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
      const response = await axios.post('http://localhost:5000/api/auth/github', { code });
      dispatch(loginSuccess(response.data));
      // Remove OAuth code query param
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.error || 'OAuth Failed'));
    }
  };

  const handleLogin = () => {
    // Replace with your GitHub OAuth App Client ID
    const clientId = 'your_github_oauth_client_id_here';
    const redirectUri = window.location.origin;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
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
        className="w-full max-w-sm rounded-github border p-8"
        style={{ 
          backgroundColor: 'var(--color-canvas-default)',
          borderColor: 'var(--color-border-default)',
          boxShadow: '0 0 transparent, 0 0 transparent, 0 1px 3px rgba(31, 35, 40, 0.12)'
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
            Automated code reviews powered by Gemini AI
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div 
            className="p-3 rounded-github mb-4 text-sm border"
            style={{ 
              backgroundColor: 'var(--color-danger-subtle)',
              borderColor: 'var(--color-danger-fg)',
              color: 'var(--color-danger-fg)'
            }}
          >
            {error}
          </div>
        )}

        {/* Sign in button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2 px-4 rounded-github text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border"
          style={{
            backgroundColor: 'rgb(31, 111, 235)',
            color: '#ffffff',
            borderColor: 'rgba(31, 35, 40, 0.15)'
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = 'rgb(9, 105, 218)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgb(31, 111, 235)';
          }}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              <GitPullRequest size={16} />
              Sign in with GitHub
            </>
          )}
        </button>

        {/* Info text */}
        <p 
          className="text-xs text-center mt-4"
          style={{ color: 'var(--color-fg-subtle)' }}
        >
          By signing in, you agree to install the GitHub App on your repositories
        </p>
      </div>

      {/* Footer */}
      <p 
        className="text-xs mt-8"
        style={{ color: 'var(--color-fg-subtle)' }}
      >
        Powered by Google Gemini AI
      </p>
    </div>
  );
}
