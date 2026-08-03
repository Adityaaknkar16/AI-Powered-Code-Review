import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Github, Loader2 } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import axios from 'axios';

export default function Login() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

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
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.post(`${backendUrl}/api/auth/github`, { code });
      dispatch(loginSuccess(response.data));
      // Remove OAuth code query param
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.error || 'OAuth Failed'));
    }
  };

  const handleLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = window.location.origin;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 mb-4 border border-indigo-500/20">
            <Github size={40} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI PR Review Bot</h1>
          <p className="text-slate-400 text-sm mt-2">
            Automated Gemini Code Reviews on Pull Requests
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-6 text-sm text-rose-400 text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Github size={20} />
              Sign in with GitHub
            </>
          )}
        </button>
      </div>
    </div>
  );
}
