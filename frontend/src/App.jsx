import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RepoList from './pages/RepoList';
import ReviewList from './pages/ReviewList';
import ReviewDetail from './pages/ReviewDetail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<RepoList />} />
          <Route path="/repo/:repoName" element={<ReviewList />} />
          <Route path="/repo/:repoName/review/:reviewId" element={<ReviewDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
