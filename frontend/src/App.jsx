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

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

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

  useEffect(() => {
    if (token) {
      axios
        .get(`${backendUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          dispatch(setUser(res.data));
          if (!isAuthenticated) {
            dispatch(loginSuccess({ token, user: res.data }));
          }
        })
        .catch(() => {
          // Token is invalid/expired — force logout
          dispatch(logout());
        });
    }
  }, [token]);

  if (!isAuthenticated) {
    return <Login />;
  }

  return <AppRoutes />;
}

