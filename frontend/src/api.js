const BASE_URL = import.meta.env.VITE_BACKEND_URL 
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : 'http://localhost:5000/api';

// ---------------------------------------------------------------------------
// Auth helper — reads the JWT token from localStorage
// ---------------------------------------------------------------------------
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Real Live Dynamic API Endpoints
// ---------------------------------------------------------------------------

/**
 * Fetch connected repositories from database
 */
export async function getConnectedRepos() {
  return apiFetch('/repos');
}

/**
 * Fetch reviews list for a specific repository
 */
export async function getRepoReviews(repoName) {
  const all = await apiFetch('/reviews');
  return all.filter((r) => r.repoName === repoName || r.repoId?.name === repoName);
}

/**
 * Fetch specific review detail by review ID
 */
export async function getReviewDetail(reviewId) {
  return apiFetch(`/reviews/${reviewId}`);
}

/**
 * Fetch all reviews across all repositories
 */
export async function getAllReviews() {
  return apiFetch('/reviews');
}

/**
 * Connect / register a new repository
 */
export async function connectRepo(repoName) {
  return apiFetch('/repos', {
    method: 'POST',
    body: JSON.stringify({ name: repoName }),
  });
}

/**
 * Update repository settings (focus area, min severity, active toggle)
 */
export async function updateRepoSettings(repoId, settings) {
  return apiFetch(`/repos/${repoId}/settings`, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

/**
 * Disconnect / delete repository from database
 */
export async function deleteRepo(repoId) {
  return apiFetch(`/repos/${repoId}`, {
    method: 'DELETE',
  });
}

/**
 * Fetch aggregate metrics & statistics directly from database
 */
export async function getStats() {
  return apiFetch('/stats');
}

/**
 * Trigger review simulation on repository
 */
export async function simulateReview(repoId) {
  return apiFetch(`/repos/${repoId}/reviews/simulate`, {
    method: 'POST',
  });
}

/**
 * Run real-time diff analysis via Gemini AI model
 */
export async function testDiffAnalysis(diffText, focusArea = 'full') {
  return apiFetch('/reviews/test-diff', {
    method: 'POST',
    body: JSON.stringify({ diff: diffText, focusArea }),
  });
}
