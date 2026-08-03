const BASE_URL = 'http://localhost:5000/api';

// Set this to true to force mock data, or false to use the live API
const USE_MOCK = true;

// Mock database store
const MOCK_REPOS = [
  { id: 1, name: 'facebook/react', prsReviewed: 14, connected: true },
  { id: 2, name: 'vercel/next.js', prsReviewed: 28, connected: true },
  { id: 3, name: 'expressjs/express', prsReviewed: 5, connected: true },
  { id: 4, name: 'mongodb/mongo', prsReviewed: 0, connected: true }
];

const MOCK_REVIEWS = {
  'facebook/react': [
    { id: 'rev-101', pullNumber: 28491, title: 'Fix concurrent mode edge cases in Suspense', date: '2026-08-01', issueSummary: '1 high, 2 medium' },
    { id: 'rev-102', pullNumber: 28450, title: 'Optimise virtual DOM diffing core runtime loop', date: '2026-07-28', issueSummary: '0 issues' },
    { id: 'rev-103', pullNumber: 28312, title: 'Add warnings for legacy context usage in StrictMode', date: '2026-07-15', issueSummary: '3 low' }
  ],
  'vercel/next.js': [
    { id: 'rev-201', pullNumber: 62410, title: 'Implement middleware route caching controls', date: '2026-08-03', issueSummary: '1 high, 1 low' },
    { id: 'rev-202', pullNumber: 62390, title: 'Fix static generation hydration errors on nested layouts', date: '2026-08-02', issueSummary: '0 issues' }
  ],
  'expressjs/express': [
    { id: 'rev-301', pullNumber: 4982, title: 'Refactor query parser to support array limit options', date: '2026-07-20', issueSummary: '2 medium' }
  ],
  'mongodb/mongo': []
};

const MOCK_REVIEW_DETAILS = {
  'rev-101': {
    id: 'rev-101',
    pullNumber: 28491,
    title: 'Fix concurrent mode edge cases in Suspense',
    date: '2026-08-01',
    repoName: 'facebook/react',
    issuesCount: 3,
    comments: [
      {
        file: 'packages/react-reconciler/src/ReactFiberWorkLoop.js',
        line: 421,
        severity: 'high',
        comment: 'Potential infinite re-render loop detected when context is updated synchronously inside render. Wrap in transition or check update depth.'
      },
      {
        file: 'packages/react-reconciler/src/ReactFiberWorkLoop.js',
        line: 1208,
        severity: 'medium',
        comment: 'Redundant assignment of workInProgress pointer. This variable is already reassigned in the outer loops.'
      },
      {
        file: 'packages/shared/ReactFeatureFlags.js',
        line: 14,
        severity: 'medium',
        comment: 'Feature flag enabled in development without telemetry collection logic. Ensure configuration is verified across standard releases.'
      }
    ]
  },
  'rev-102': {
    id: 'rev-102',
    pullNumber: 28450,
    title: 'Optimise virtual DOM diffing core runtime loop',
    date: '2026-07-28',
    repoName: 'facebook/react',
    issuesCount: 0,
    comments: []
  },
  'rev-103': {
    id: 'rev-103',
    pullNumber: 28312,
    title: 'Add warnings for legacy context usage in StrictMode',
    date: '2026-07-15',
    repoName: 'facebook/react',
    issuesCount: 3,
    comments: [
      {
        file: 'packages/react/src/ReactContext.js',
        line: 82,
        severity: 'low',
        comment: 'Variable name shadowed by outer function scope. Consider renaming to avoid confusion.'
      },
      {
        file: 'packages/react/src/ReactContext.js',
        line: 110,
        severity: 'low',
        comment: 'Missing JSDoc parameter explanation for dynamic fallback parameters.'
      },
      {
        file: 'packages/react/src/ReactContext.js',
        line: 145,
        severity: 'low',
        comment: 'Unnecessary template literal usage. Single quotes will suffice here.'
      }
    ]
  },
  'rev-201': {
    id: 'rev-201',
    pullNumber: 62410,
    title: 'Implement middleware route caching controls',
    date: '2026-08-03',
    repoName: 'vercel/next.js',
    issuesCount: 2,
    comments: [
      {
        file: 'packages/next/src/server/web/adapter.ts',
        line: 89,
        severity: 'high',
        comment: 'Cache headers are set to public without token validation. This exposes secure payloads to intermediary public CDN caches. Restrict headers.'
      },
      {
        file: 'packages/next/src/server/web/adapter.ts',
        line: 194,
        severity: 'low',
        comment: 'Type assertion could fail if headers are undefined. Add optional chaining guard.'
      }
    ]
  },
  'rev-202': {
    id: 'rev-202',
    pullNumber: 62390,
    title: 'Fix static generation hydration errors on nested layouts',
    date: '2026-08-02',
    repoName: 'vercel/next.js',
    issuesCount: 0,
    comments: []
  },
  'rev-301': {
    id: 'rev-301',
    pullNumber: 4982,
    title: 'Refactor query parser to support array limit options',
    date: '2026-07-20',
    repoName: 'expressjs/express',
    issuesCount: 2,
    comments: [
      {
        file: 'lib/middleware/query.js',
        line: 35,
        severity: 'medium',
        comment: 'Depth parameter lacks numeric type casting. Passing custom prototypes can trigger object inheritance prototype contamination.'
      },
      {
        file: 'lib/middleware/query.js',
        line: 52,
        severity: 'medium',
        comment: 'Ensure validation limit fallback matches standard settings of 100.'
      }
    ]
  }
};

/**
 * Fetch list of connected repositories
 */
export async function getConnectedRepos() {
  if (USE_MOCK) {
    return Promise.resolve(MOCK_REPOS);
  }

  const response = await fetch(`${BASE_URL}/repos`);
  if (!response.ok) throw new Error('Failed to fetch repositories');
  return response.json();
}

/**
 * Fetch reviews list for a specific repository
 */
export async function getRepoReviews(repoName) {
  if (USE_MOCK) {
    const list = MOCK_REVIEWS[repoName] || [];
    return Promise.resolve(list);
  }

  const response = await fetch(`${BASE_URL}/reviews?repo=${encodeURIComponent(repoName)}`);
  if (!response.ok) throw new Error('Failed to fetch reviews');
  return response.json();
}

/**
 * Fetch specific review detail reports
 */
export async function getReviewDetail(reviewId) {
  if (USE_MOCK) {
    const detail = MOCK_REVIEW_DETAILS[reviewId];
    if (!detail) return Promise.reject(new Error('Review not found'));
    return Promise.resolve(detail);
  }

  const response = await fetch(`${BASE_URL}/reviews/${reviewId}`);
  if (!response.ok) throw new Error('Failed to fetch review detail');
  return response.json();
}

/**
 * Connect a new repository to the app
 */
export async function connectRepo(repoName) {
  if (USE_MOCK) {
    const exists = MOCK_REPOS.some(r => r.name.toLowerCase() === repoName.toLowerCase());
    if (exists) return Promise.reject(new Error('Repository already connected'));
    
    const newRepo = {
      id: MOCK_REPOS.length + 1,
      name: repoName,
      prsReviewed: 0,
      connected: true
    };
    MOCK_REPOS.push(newRepo);
    MOCK_REVIEWS[repoName] = [];
    return Promise.resolve(newRepo);
  }

  const response = await fetch(`${BASE_URL}/repos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: repoName })
  });
  if (!response.ok) throw new Error('Failed to connect repository');
  return response.json();
}
