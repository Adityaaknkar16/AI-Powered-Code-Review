const BASE_URL = 'http://localhost:5000/api';

// Toggle mock data vs live API. Set to false when backend is running with real credentials.
const USE_MOCK = true;

// ---------------------------------------------------------------------------
// Auth helper — reads the JWT stored by authSlice
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
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_REPOS = [
  { _id: '1', id: '1', name: 'facebook/react', prsReviewed: 14, connected: true, isActive: true, settings: { reviewFocus: 'full', minSeverity: 'low', autoApprove: false } },
  { _id: '2', id: '2', name: 'vercel/next.js', prsReviewed: 28, connected: true, isActive: true, settings: { reviewFocus: 'security', minSeverity: 'medium', autoApprove: false } },
  { _id: '3', id: '3', name: 'expressjs/express', prsReviewed: 5, connected: true, isActive: true, settings: { reviewFocus: 'full', minSeverity: 'low', autoApprove: false } },
  { _id: '4', id: '4', name: 'mongodb/mongo', prsReviewed: 0, connected: true, isActive: false, settings: { reviewFocus: 'performance', minSeverity: 'high', autoApprove: false } },
];

const MOCK_REVIEWS = {
  'facebook/react': [
    { id: 'rev-101', _id: 'rev-101', pullNumber: 28491, title: 'Fix concurrent mode edge cases in Suspense', prTitle: 'Fix concurrent mode edge cases in Suspense', date: '2026-08-01', issueSummary: '1 high, 2 medium', status: 'completed', sender: 'gaearon', commitSha: 'a1b2c3d', summaryStats: { highCount: 1, mediumCount: 2, lowCount: 0 } },
    { id: 'rev-102', _id: 'rev-102', pullNumber: 28450, title: 'Optimise virtual DOM diffing core runtime loop', prTitle: 'Optimise virtual DOM diffing core runtime loop', date: '2026-07-28', issueSummary: '0 issues', status: 'completed', sender: 'sebmarkbage', commitSha: 'e4f5g6h', summaryStats: { highCount: 0, mediumCount: 0, lowCount: 0 } },
    { id: 'rev-103', _id: 'rev-103', pullNumber: 28312, title: 'Add warnings for legacy context usage in StrictMode', prTitle: 'Add warnings for legacy context usage in StrictMode', date: '2026-07-15', issueSummary: '3 low', status: 'completed', sender: 'acdlite', commitSha: 'i7j8k9l', summaryStats: { highCount: 0, mediumCount: 0, lowCount: 3 } },
  ],
  'vercel/next.js': [
    { id: 'rev-201', _id: 'rev-201', pullNumber: 62410, title: 'Implement middleware route caching controls', prTitle: 'Implement middleware route caching controls', date: '2026-08-03', issueSummary: '1 high, 1 low', status: 'completed', sender: 'timneutkens', commitSha: 'm1n2o3p', summaryStats: { highCount: 1, mediumCount: 0, lowCount: 1 } },
    { id: 'rev-202', _id: 'rev-202', pullNumber: 62390, title: 'Fix static generation hydration errors on nested layouts', prTitle: 'Fix static generation hydration errors on nested layouts', date: '2026-08-02', issueSummary: '0 issues', status: 'completed', sender: 'ijjk', commitSha: 'q4r5s6t', summaryStats: { highCount: 0, mediumCount: 0, lowCount: 0 } },
  ],
  'expressjs/express': [
    { id: 'rev-301', _id: 'rev-301', pullNumber: 4982, title: 'Refactor query parser to support array limit options', prTitle: 'Refactor query parser to support array limit options', date: '2026-07-20', issueSummary: '2 medium', status: 'completed', sender: 'dougwilson', commitSha: 'u7v8w9x', summaryStats: { highCount: 0, mediumCount: 2, lowCount: 0 } },
  ],
  'mongodb/mongo': [],
};

const MOCK_REVIEW_DETAILS = {
  'rev-101': {
    id: 'rev-101', _id: 'rev-101', pullNumber: 28491,
    title: 'Fix concurrent mode edge cases in Suspense',
    prTitle: 'Fix concurrent mode edge cases in Suspense',
    date: '2026-08-01', repoName: 'facebook/react', issuesCount: 3,
    status: 'completed', sender: 'gaearon', commitSha: 'a1b2c3d',
    summaryStats: { highCount: 1, mediumCount: 2, lowCount: 0 },
    repoId: { _id: '1', name: 'facebook/react' },
    comments: [
      { file: 'packages/react-reconciler/src/ReactFiberWorkLoop.js', line: 421, severity: 'high', comment: 'Potential infinite re-render loop detected when context is updated synchronously inside render. Wrap in transition or check update depth.' },
      { file: 'packages/react-reconciler/src/ReactFiberWorkLoop.js', line: 1208, severity: 'medium', comment: 'Redundant assignment of workInProgress pointer. This variable is already reassigned in the outer loops.' },
      { file: 'packages/shared/ReactFeatureFlags.js', line: 14, severity: 'medium', comment: 'Feature flag enabled in development without telemetry collection logic. Ensure configuration is verified across standard releases.' },
    ],
  },
  'rev-102': {
    id: 'rev-102', _id: 'rev-102', pullNumber: 28450,
    title: 'Optimise virtual DOM diffing core runtime loop',
    prTitle: 'Optimise virtual DOM diffing core runtime loop',
    date: '2026-07-28', repoName: 'facebook/react', issuesCount: 0,
    status: 'completed', sender: 'sebmarkbage', commitSha: 'e4f5g6h',
    summaryStats: { highCount: 0, mediumCount: 0, lowCount: 0 },
    repoId: { _id: '1', name: 'facebook/react' },
    comments: [],
  },
  'rev-103': {
    id: 'rev-103', _id: 'rev-103', pullNumber: 28312,
    title: 'Add warnings for legacy context usage in StrictMode',
    prTitle: 'Add warnings for legacy context usage in StrictMode',
    date: '2026-07-15', repoName: 'facebook/react', issuesCount: 3,
    status: 'completed', sender: 'acdlite', commitSha: 'i7j8k9l',
    summaryStats: { highCount: 0, mediumCount: 0, lowCount: 3 },
    repoId: { _id: '1', name: 'facebook/react' },
    comments: [
      { file: 'packages/react/src/ReactContext.js', line: 82, severity: 'low', comment: 'Variable name shadowed by outer function scope. Consider renaming to avoid confusion.' },
      { file: 'packages/react/src/ReactContext.js', line: 110, severity: 'low', comment: 'Missing JSDoc parameter explanation for dynamic fallback parameters.' },
      { file: 'packages/react/src/ReactContext.js', line: 145, severity: 'low', comment: 'Unnecessary template literal usage. Single quotes will suffice here.' },
    ],
  },
  'rev-201': {
    id: 'rev-201', _id: 'rev-201', pullNumber: 62410,
    title: 'Implement middleware route caching controls',
    prTitle: 'Implement middleware route caching controls',
    date: '2026-08-03', repoName: 'vercel/next.js', issuesCount: 2,
    status: 'completed', sender: 'timneutkens', commitSha: 'm1n2o3p',
    summaryStats: { highCount: 1, mediumCount: 0, lowCount: 1 },
    repoId: { _id: '2', name: 'vercel/next.js' },
    comments: [
      { file: 'packages/next/src/server/web/adapter.ts', line: 89, severity: 'high', comment: 'Cache headers are set to public without token validation. This exposes secure payloads to intermediary public CDN caches. Restrict headers.' },
      { file: 'packages/next/src/server/web/adapter.ts', line: 194, severity: 'low', comment: 'Type assertion could fail if headers are undefined. Add optional chaining guard.' },
    ],
  },
  'rev-202': {
    id: 'rev-202', _id: 'rev-202', pullNumber: 62390,
    title: 'Fix static generation hydration errors on nested layouts',
    prTitle: 'Fix static generation hydration errors on nested layouts',
    date: '2026-08-02', repoName: 'vercel/next.js', issuesCount: 0,
    status: 'completed', sender: 'ijjk', commitSha: 'q4r5s6t',
    summaryStats: { highCount: 0, mediumCount: 0, lowCount: 0 },
    repoId: { _id: '2', name: 'vercel/next.js' },
    comments: [],
  },
  'rev-301': {
    id: 'rev-301', _id: 'rev-301', pullNumber: 4982,
    title: 'Refactor query parser to support array limit options',
    prTitle: 'Refactor query parser to support array limit options',
    date: '2026-07-20', repoName: 'expressjs/express', issuesCount: 2,
    status: 'completed', sender: 'dougwilson', commitSha: 'u7v8w9x',
    summaryStats: { highCount: 0, mediumCount: 2, lowCount: 0 },
    repoId: { _id: '3', name: 'expressjs/express' },
    comments: [
      { file: 'lib/middleware/query.js', line: 35, severity: 'medium', comment: 'Depth parameter lacks numeric type casting. Passing custom prototypes can trigger object inheritance prototype contamination.' },
      { file: 'lib/middleware/query.js', line: 52, severity: 'medium', comment: 'Ensure validation limit fallback matches standard settings of 100.' },
    ],
  },
};

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Fetch list of connected repositories
 */
export async function getConnectedRepos() {
  if (USE_MOCK) return Promise.resolve(MOCK_REPOS);
  return apiFetch('/repos');
}

/**
 * Fetch reviews list for a specific repository
 */
export async function getRepoReviews(repoName) {
  if (USE_MOCK) {
    return Promise.resolve(MOCK_REVIEWS[repoName] || []);
  }
  // Fetch all reviews then filter client-side by repo name
  const all = await apiFetch('/reviews');
  return all.filter((r) => r.repoName === repoName || r.repoId?.name === repoName);
}

/**
 * Fetch specific review detail
 */
export async function getReviewDetail(reviewId) {
  if (USE_MOCK) {
    const detail = MOCK_REVIEW_DETAILS[reviewId];
    if (!detail) return Promise.reject(new Error('Review not found'));
    return Promise.resolve(detail);
  }
  return apiFetch(`/reviews/${reviewId}`);
}

/**
 * Connect / register a new repository
 */
export async function connectRepo(repoName) {
  if (USE_MOCK) {
    const exists = MOCK_REPOS.some((r) => r.name.toLowerCase() === repoName.toLowerCase());
    if (exists) return Promise.reject(new Error('Repository already connected'));
    const newRepo = {
      _id: String(MOCK_REPOS.length + 1),
      id: String(MOCK_REPOS.length + 1),
      name: repoName,
      prsReviewed: 0,
      connected: true,
      isActive: true,
      settings: { reviewFocus: 'full', minSeverity: 'low', autoApprove: false },
    };
    MOCK_REPOS.push(newRepo);
    MOCK_REVIEWS[repoName] = [];
    return Promise.resolve(newRepo);
  }
  return apiFetch('/repos', {
    method: 'POST',
    body: JSON.stringify({ name: repoName }),
  });
}

/**
 * Update repo settings
 */
export async function updateRepoSettings(repoId, settings) {
  if (USE_MOCK) {
    const repo = MOCK_REPOS.find((r) => r._id === repoId || r.id === repoId);
    if (!repo) return Promise.reject(new Error('Repo not found'));
    Object.assign(repo.settings, settings);
    if (settings.isActive !== undefined) repo.isActive = settings.isActive;
    return Promise.resolve(repo);
  }
  return apiFetch(`/repos/${repoId}/settings`, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

/**
 * Fetch aggregate stats
 */
export async function getStats() {
  if (USE_MOCK) {
    return Promise.resolve({
      totalReviews: 6,
      averageTurnaroundTimeSec: 14,
      issueTypes: { high: 2, medium: 6, low: 4 },
    });
  }
  return apiFetch('/stats');
}
