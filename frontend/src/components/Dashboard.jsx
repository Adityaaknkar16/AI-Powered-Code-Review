import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, Github, Settings, History, BarChart3, AppWindow } from 'lucide-react';
import axios from 'axios';

import { logout } from '../store/authSlice';
import { fetchReposStart, fetchReposSuccess, fetchReposFailure, updateRepoSettingsSuccess } from '../store/repoSlice';
import { fetchReviewsStart, fetchReviewsSuccess, fetchReviewsFailure, fetchReviewDetailSuccess, fetchStatsSuccess } from '../store/reviewSlice';

import StatsSummary from './StatsSummary';
import RepoList from './RepoList';
import ReviewHistory from './ReviewHistory';
import ReviewDetail from './ReviewDetail';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { list: repos } = useSelector((state) => state.repos);
  const { history: reviews, currentReview, stats } = useSelector((state) => state.reviews);

  const [activeTab, setActiveTab] = useState('history'); // history | repos
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  // Configure global axios auth header
  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch Repos
    dispatch(fetchReposStart());
    try {
      const res = await axios.get(`${backendUrl}/api/repos`, authConfig);
      dispatch(fetchReposSuccess(res.data));
    } catch (err) {
      dispatch(fetchReposFailure(err.message));
    }

    // Fetch Reviews
    dispatch(fetchReviewsStart());
    try {
      const res = await axios.get(`${backendUrl}/api/reviews`, authConfig);
      dispatch(fetchReviewsSuccess(res.data));
    } catch (err) {
      dispatch(fetchReviewsFailure(err.message));
    }

    // Fetch Stats
    try {
      const res = await axios.get(`${backendUrl}/api/stats`, authConfig);
      dispatch(fetchStatsSuccess(res.data));
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleUpdateRepoSettings = async (repoId, settingsUpdate) => {
    try {
      const res = await axios.put(`${backendUrl}/api/repos/${repoId}/settings`, settingsUpdate, authConfig);
      dispatch(updateRepoSettingsSuccess(res.data));
    } catch (err) {
      console.error('Failed updating repo settings:', err);
    }
  };

  const handleSelectReview = async (reviewId) => {
    try {
      const res = await axios.get(`${backendUrl}/api/reviews/${reviewId}`, authConfig);
      dispatch(fetchReviewDetailSuccess(res.data));
      setSelectedReviewId(reviewId);
    } catch (err) {
      console.error('Failed loading review detail:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Top Navigation */}
      <nav className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-400">
            <AppWindow size={20} />
          </div>
          <span className="font-bold text-lg text-white">AI PR Reviewer</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {user?.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-8 h-8 rounded-full ring-2 ring-indigo-500/20"
              />
            )}
            <span className="text-sm font-semibold text-slate-300">@{user?.username}</span>
          </div>

          <button
            onClick={() => dispatch(logout())}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        <StatsSummary stats={stats} />

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 mb-6 gap-6">
          <button
            onClick={() => {
              setActiveTab('history');
              setSelectedReviewId(null);
            }}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'history' && !selectedReviewId
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History size={16} />
            History Log
          </button>

          <button
            onClick={() => {
              setActiveTab('repos');
              setSelectedReviewId(null);
            }}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'repos'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Settings size={16} />
            Repositories
          </button>
        </div>

        {/* Content Views */}
        {selectedReviewId && currentReview ? (
          <ReviewDetail
            review={currentReview}
            onBack={() => setSelectedReviewId(null)}
          />
        ) : activeTab === 'history' ? (
          <ReviewHistory
            history={reviews}
            onSelectReview={handleSelectReview}
          />
        ) : (
          <RepoList
            repos={repos}
            onUpdateSettings={handleUpdateRepoSettings}
          />
        )}
      </main>
    </div>
  );
}
