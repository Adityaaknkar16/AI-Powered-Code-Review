import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import { loginSuccess, logout, setUser } from './store/authSlice';
import Layout from './components/Layout';
import Login from './components/Login';
import RepoList from './pages/RepoList';
import ReviewList from './pages/ReviewList';
import ReviewDetail from './pages/ReviewDetail';

const backendUrl = 'http://localhost:5000';

function AppRoutes() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<RepoList />} />
          <Route path="/repo/:repoName" element={<ReviewList />} />
          <Route path="/repo/:repoName/review/:reviewId" element={<ReviewDetail />} />
          {/* Catch-all back to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  
  // Check if we're in mock mode
  const USE_MOCK = true; // Should match the value in api.js

  // On mount, if in mock mode, auto-login with a mock user
  useEffect(() => {
    if (USE_MOCK && !isAuthenticated) {
      // Auto-login with mock user
      dispatch(loginSuccess({ 
        token: 'mock_token', 
        user: { 
          username: 'demo-user', 
          avatarUrl: null,
          email: 'demo@example.com' 
        }
      }));
      return;
    }

    if (token && !isAuthenticated) {
      dispatch(loginSuccess({ token, user: null }));
    }

    if (token && !USE_MOCK) {
      axios
        .get(`${backendUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          dispatch(setUser(res.data));
        })
        .catch(() => {
          // Token is invalid/expired — force logout
          dispatch(logout());
        });
    }
  }, []);

  if (!isAuthenticated && !USE_MOCK) {
    return <Login />;
  }

  return <AppRoutes />;
}
