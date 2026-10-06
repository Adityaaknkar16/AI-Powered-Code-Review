require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');

const { User, ConnectedRepo, Review } = require('./models');
const { getInstallationOctokit, fetchPullRequestDiff, postReviewComments } = require('./githubService');
const { analyzeDiffWithGemini, analyzeRawDiff } = require('./geminiService');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection with timeout protection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_pr_bot';
mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 4000,
})
  .then(() => console.log(`✓ Connected to MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***@')}`))
  .catch(err => {
    console.warn('⚠️  MongoDB connection warning:', err.message);
    console.warn('ℹ️  Tip: If you do not have local MongoDB installed, you can use a free cloud MongoDB Atlas URI in backend/.env:');
    console.warn('    MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/ai_pr_bot?retryWrites=true&w=majority');
  });

// CORS Configuration - Supports multiple frontend ports (5173 for Vite, 3000 for CRA/Next)
const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(u => u.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || configuredOrigins.includes(origin) || configuredOrigins.includes('*') || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

// Webhook endpoint needs raw body for signature verification
app.use('/api/webhooks/github', express.raw({ type: 'application/json' }));
// All other endpoints use json
app.use(express.json());

/**
 * Middleware: Verify GitHub Webhook Signature
 */
function verifyWebhookSignature(req, res, next) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    return res.status(401).json({ error: 'GitHub signature missing' });
  }

  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(req.body).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
}

/**
 * Middleware: Authenticate JWT Dashboard User
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalid or expired' });
    req.user = user;
    next();
  });
}

/**
 * Helper: serialize a Review document to a consistent frontend shape
 */
function serializeReview(review) {
  const repo = review.repoId;
  const stats = review.summaryStats || {};
  const high = stats.highCount || 0;
  const medium = stats.mediumCount || 0;
  const low = stats.lowCount || 0;

  let issueSummary = '0 issues';
  const parts = [];
  if (high > 0) parts.push(`${high} high`);
  if (medium > 0) parts.push(`${medium} medium`);
  if (low > 0) parts.push(`${low} low`);
  if (parts.length > 0) issueSummary = parts.join(', ');

  return {
    id: review._id,
    _id: review._id,
    pullNumber: review.pullNumber,
    title: review.prTitle,
    prTitle: review.prTitle,
    prUrl: review.prUrl,
    date: review.createdAt ? review.createdAt.toISOString().slice(0, 10) : '',
    sender: review.sender,
    commitSha: review.commitSha,
    status: review.status,
    issueSummary,
    summaryStats: review.summaryStats,
    issuesCount: high + medium + low,
    comments: review.comments || [],
    turnaroundTimeMs: review.turnaroundTimeMs,
    repoId: repo ? { _id: repo._id, name: repo.name } : null,
    repoName: repo ? repo.name : null,
    createdAt: review.createdAt,
  };
}

/**
 * 1. GITHUB APP WEBHOOK RECEIVER
 */
app.post('/api/webhooks/github', verifyWebhookSignature, async (req, res) => {
  let payload;
  try {
    payload = JSON.parse(req.body.toString());
  } catch (err) {
    return res.status(400).send('Invalid JSON');
  }

  const eventName = req.headers['x-github-event'];

  // Handle installation event — link repos to the installing user
  if (eventName === 'installation' && payload.action === 'created') {
    // Try to find a user matching the installer's GitHub ID
    const installerId = payload.installation.account.id;
    const installerLogin = payload.installation.account.login;
    const installationId = payload.installation.id;

    let user = await User.findOne({ githubId: String(installerId) });

    // Register all repos included in this installation
    if (payload.repositories) {
      for (const repoInfo of payload.repositories) {
        const existing = await ConnectedRepo.findOne({ githubRepoId: repoInfo.id });
        if (!existing) {
          const newRepo = new ConnectedRepo({
            githubRepoId: repoInfo.id,
            name: repoInfo.full_name,
            owner: installerLogin,
            installationId,
            isActive: true,
            connectedBy: user ? user._id : undefined,
            settings: { reviewFocus: 'full', minSeverity: 'low', autoApprove: false }
          });
          await newRepo.save();
        }
      }
    }
    return; // already responded 202 below
  }

  // Respond immediately to GitHub to avoid timeout (202 Accepted)
  res.status(202).json({ status: 'Accepted' });

  // Process PR events asynchronously
  if (eventName === 'pull_request' && (payload.action === 'opened' || payload.action === 'synchronize')) {
    const startTime = Date.now();
    const pullNumber = payload.pull_request.number;
    const repoName = payload.repository.full_name;
    const repoOwner = payload.repository.owner.login;
    const githubRepoId = payload.repository.id;
    const commitSha = payload.pull_request.head.sha;
    const prTitle = payload.pull_request.title;
    const prUrl = payload.pull_request.html_url;
    const sender = payload.pull_request.user.login;
    const installationId = payload.installation.id;

    let repo = await ConnectedRepo.findOne({ githubRepoId });
    if (!repo) {
      // Auto-register repo. Try to find an owner by matching the repo owner login.
      const ownerUser = await User.findOne({ username: repoOwner });
      repo = new ConnectedRepo({
        githubRepoId,
        name: repoName,
        owner: repoOwner,
        installationId,
        isActive: true,
        connectedBy: ownerUser ? ownerUser._id : undefined,
        settings: { reviewFocus: 'full', minSeverity: 'low', autoApprove: false }
      });
      await repo.save();
    }

    if (!repo.isActive) {
      console.log(`Repository ${repoName} is deactivated. Skipping review.`);
      return;
    }

    // Create a pending review document
    const reviewRecord = new Review({
      repoId: repo._id,
      pullNumber,
      commitSha,
      prTitle,
      prUrl,
      sender,
      status: 'pending',
    });
    await reviewRecord.save();

    try {
      // 1. Get Octokit instance
      const octokit = await getInstallationOctokit(installationId);

      // 2. Fetch Changed Files
      const filePatches = await fetchPullRequestDiff(octokit, repoOwner, repoName, pullNumber);

      if (filePatches.length === 0) {
        reviewRecord.status = 'completed';
        reviewRecord.turnaroundTimeMs = Date.now() - startTime;
        await reviewRecord.save();
        return;
      }

      // 3. Analyze via Gemini API
      const reviewFocus = repo.settings.reviewFocus;
      const reviews = await analyzeDiffWithGemini(filePatches, reviewFocus);

      // Filter by minSeverity settings
      const severityWeights = { low: 1, medium: 2, high: 3 };
      const minSeverityWeight = severityWeights[repo.settings.minSeverity] || 1;
      const filteredReviews = reviews.filter(r => {
        const itemWeight = severityWeights[r.severity] || 1;
        return itemWeight >= minSeverityWeight;
      });

      // 4. Post back review comments
      if (filteredReviews.length > 0) {
        await postReviewComments(octokit, repoOwner, repoName, pullNumber, commitSha, filteredReviews);
      }

      // 5. Update review statistics and comments in database
      const lowCount = filteredReviews.filter(c => c.severity === 'low').length;
      const mediumCount = filteredReviews.filter(c => c.severity === 'medium').length;
      const highCount = filteredReviews.filter(c => c.severity === 'high').length;

      reviewRecord.status = 'completed';
      reviewRecord.comments = filteredReviews;
      reviewRecord.summaryStats = {
        lowCount,
        mediumCount,
        highCount,
        filesReviewed: new Set(filteredReviews.map(r => r.file)).size
      };
      reviewRecord.turnaroundTimeMs = Date.now() - startTime;
      await reviewRecord.save();

    } catch (err) {
      console.error(`Review process failed for PR #${pullNumber} in ${repoName}:`, err);
      reviewRecord.status = 'failed';
      reviewRecord.errorDetails = err.message;
      await reviewRecord.save();
    }
  }
});

/**
 * 2. OAUTH ROUTES
 */
app.post('/api/auth/github', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'OAuth code missing' });

  try {
    // Exchange code for token
    const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, {
      headers: { Accept: 'application/json' }
    });

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      return res.status(400).json({ error: 'Failed to retrieve access token' });
    }

    // Get User Profile
    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` }
    });

    const { id: githubId, login: username, email, avatar_url: avatarUrl } = userRes.data;

    let user = await User.findOne({ githubId: String(githubId) });
    if (!user) {
      user = new User({ githubId: String(githubId), username, email, avatarUrl, accessToken });
    } else {
      user.accessToken = accessToken;
      user.username = username;
      user.avatarUrl = avatarUrl;
    }
    await user.save();

    // If there are repos owned by this user's GitHub login that have no connectedBy, claim them
    await ConnectedRepo.updateMany(
      { owner: username, connectedBy: { $exists: false } },
      { $set: { connectedBy: user._id } }
    );

    // Create JWT
    const token = jwt.sign(
      { id: user._id, githubId: user.githubId, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { username, avatarUrl, email } });
  } catch (error) {
    console.error('OAuth handler error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * Direct Developer Login (creates real MongoDB user & JWT for instant live testing)
 */
app.post('/api/auth/dev-login', async (req, res) => {
  const { username = 'developer' } = req.body;
  try {
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({
        githubId: String(Date.now()),
        username,
        email: `${username}@example.com`,
        avatarUrl: `https://avatars.githubusercontent.com/u/${Math.floor(1000000 + Math.random() * 9000000)}?v=4`,
        accessToken: 'dev_token_live'
      });
      await user.save();
    }

    // Ensure user has at least one connected repository for an instant seamless dashboard experience
    const existingRepoCount = await ConnectedRepo.countDocuments({ connectedBy: user._id });
    if (existingRepoCount === 0) {
      const defaultRepo = new ConnectedRepo({
        githubRepoId: Date.now(),
        name: `${user.username}/AI-Powered-Code-Review`,
        owner: user.username,
        installationId: 0,
        isActive: true,
        connectedBy: user._id,
        settings: { reviewFocus: 'full', minSeverity: 'low', autoApprove: false }
      });
      await defaultRepo.save();
    }

    const token = jwt.sign(
      { id: user._id, githubId: user.githubId, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { username: user.username, avatarUrl: user.avatarUrl, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ username: user.username, avatarUrl: user.avatarUrl, email: user.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 3. REPO SETTINGS & CRUD
 */
app.get('/api/repos', authenticateToken, async (req, res) => {
  try {
    const repos = await ConnectedRepo.find({ connectedBy: req.user.id });
    res.json(repos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually register a repo by name (for users who installed the App but the webhook
// auto-registration didn't have their user linked yet)
app.post('/api/repos', authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.includes('/')) {
    return res.status(400).json({ error: 'Provide a repo name in "owner/repo" format' });
  }

  try {
    const existing = await ConnectedRepo.findOne({ name });
    if (existing) {
      // Claim ownership if unclaimed
      if (!existing.connectedBy) {
        existing.connectedBy = req.user.id;
        await existing.save();
      }
      return res.json(existing);
    }

    // Repo not in DB yet (hasn't received a webhook). Create a placeholder.
    const [owner] = name.split('/');
    const newRepo = new ConnectedRepo({
      githubRepoId: Date.now(), // placeholder until webhook sets the real ID
      name,
      owner,
      installationId: 0, // placeholder
      isActive: true,
      connectedBy: req.user.id,
      settings: { reviewFocus: 'full', minSeverity: 'low', autoApprove: false }
    });
    await newRepo.save();
    res.status(201).json(newRepo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/repos/:id/settings', authenticateToken, async (req, res) => {
  const { reviewFocus, minSeverity, autoApprove, isActive } = req.body;
  try {
    const repo = await ConnectedRepo.findOne({ _id: req.params.id, connectedBy: req.user.id });
    if (!repo) return res.status(404).json({ error: 'Repo not found' });

    if (reviewFocus) repo.settings.reviewFocus = reviewFocus;
    if (minSeverity) repo.settings.minSeverity = minSeverity;
    if (autoApprove !== undefined) repo.settings.autoApprove = autoApprove;
    if (isActive !== undefined) repo.isActive = isActive;

    await repo.save();
    res.json(repo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/repos/:id', authenticateToken, async (req, res) => {
  try {
    const repo = await ConnectedRepo.findOneAndDelete({ _id: req.params.id, connectedBy: req.user.id });
    if (!repo) return res.status(404).json({ error: 'Repo not found or unauthorized' });
    // Optionally clean up associated reviews
    await Review.deleteMany({ repoId: repo._id });
    res.json({ message: 'Repository disconnected successfully', repoId: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 3.5. PLAYGROUND & TEST DIFF ANALYSIS
 */
app.post('/api/reviews/test-diff', authenticateToken, async (req, res) => {
  const { diff, focusArea = 'full' } = req.body;
  if (!diff || typeof diff !== 'string') {
    return res.status(400).json({ error: 'Diff string is required' });
  }

  const startTime = Date.now();
  try {
    const reviews = await analyzeRawDiff(diff, focusArea);
    const lowCount = reviews.filter(c => c.severity === 'low').length;
    const mediumCount = reviews.filter(c => c.severity === 'medium').length;
    const highCount = reviews.filter(c => c.severity === 'high').length;

    res.json({
      reviews,
      summaryStats: {
        highCount,
        mediumCount,
        lowCount,
        filesReviewed: new Set(reviews.map(r => r.file)).size
      },
      turnaroundTimeMs: Date.now() - startTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 3.6. SIMULATE A PR REVIEW FOR TESTING
 */
app.post('/api/repos/:id/reviews/simulate', authenticateToken, async (req, res) => {
  try {
    const repo = await ConnectedRepo.findOne({ _id: req.params.id, connectedBy: req.user.id });
    if (!repo) return res.status(404).json({ error: 'Repo not found' });

    const pullNumber = Math.floor(1000 + Math.random() * 9000);
    const mockTitles = [
      'Refactor authentication middleware with token rotation',
      'Optimize query planner indices for high-throughput reads',
      'Patch cross-site request validation in webhook parser',
      'Add exponential backoff retry handler to API client',
      'Update async concurrency limits in batch processor'
    ];
    const prTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)];
    const commitSha = Math.random().toString(16).substring(2, 9);
    const startTime = Date.now();

    // Representative diff patch for live analysis
    const samplePatches = [
      {
        filename: 'src/auth/jwtService.js',
        patch: `--- a/src/auth/jwtService.js
+++ b/src/auth/jwtService.js
@@ -40,6 +40,8 @@
 function verifySignature(token, secret) {
+  const [header, payload, signature] = token.split('.');
+  if (signature === computeHmac(header + '.' + payload, secret)) return true;
   return false;
 }`
      },
      {
        filename: 'src/database/queryBuilder.js',
        patch: `--- a/src/database/queryBuilder.js
+++ b/src/database/queryBuilder.js
@@ -85,6 +85,8 @@
 function buildWhereClause(filters) {
+  const rawClauses = Object.entries(filters).map(([k, v]) => \`\${k} = '\${v}'\`);
+  return rawClauses.join(' AND ');
 }`
      }
    ];

    let aiReviews = [];
    try {
      aiReviews = await analyzeDiffWithGemini(samplePatches, repo.settings?.reviewFocus || 'full');
    } catch (e) {
      console.warn('Gemini live analysis error:', e.message);
      aiReviews = [];
    }

    if (!Array.isArray(aiReviews)) {
      aiReviews = [];
    }

    const severityWeights = { low: 1, medium: 2, high: 3 };
    const minSeverityWeight = severityWeights[repo.settings?.minSeverity] || 1;
    const filteredReviews = aiReviews.filter(r => (severityWeights[r.severity] || 1) >= minSeverityWeight);

    const lowCount = filteredReviews.filter(c => c.severity === 'low').length;
    const mediumCount = filteredReviews.filter(c => c.severity === 'medium').length;
    const highCount = filteredReviews.filter(c => c.severity === 'high').length;

    const newReview = new Review({
      repoId: repo._id,
      pullNumber,
      commitSha,
      prTitle,
      prUrl: `https://github.com/${repo.name}/pull/${pullNumber}`,
      sender: req.user.username || 'developer',
      status: 'completed',
      summaryStats: {
        lowCount,
        mediumCount,
        highCount,
        filesReviewed: new Set(filteredReviews.map(r => r.file)).size
      },
      comments: filteredReviews,
      turnaroundTimeMs: Date.now() - startTime
    });

    await newReview.save();
    res.status(201).json(serializeReview(await Review.findById(newReview._id).populate('repoId')));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 4. REVIEWS ARCHIVES
 */
app.get('/api/reviews', authenticateToken, async (req, res) => {
  try {
    // Find repos connected by this user
    const userRepos = await ConnectedRepo.find({ connectedBy: req.user.id });
    const repoIds = userRepos.map(r => r._id);

    const reviews = await Review.find({ repoId: { $in: repoIds } })
      .populate('repoId')
      .sort({ createdAt: -1 });

    res.json(reviews.map(serializeReview));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('repoId');
    if (!review) return res.status(404).json({ error: 'Review not found' });

    // Ownership check — ensure the repo belongs to the requesting user
    const repo = await ConnectedRepo.findOne({ _id: review.repoId._id, connectedBy: req.user.id });
    if (!repo) return res.status(403).json({ error: 'Access denied' });

    res.json(serializeReview(review));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 5. ANALYTICAL METRICS
 */
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const userRepos = await ConnectedRepo.find({ connectedBy: req.user.id });
    const repoIds = userRepos.map(r => r._id);

    const reviews = await Review.find({ repoId: { $in: repoIds }, status: 'completed' });

    let lowCount = 0;
    let mediumCount = 0;
    let highCount = 0;
    let totalTurnaround = 0;
    let validTurnaroundCount = 0;

    reviews.forEach(r => {
      lowCount += r.summaryStats.lowCount || 0;
      mediumCount += r.summaryStats.mediumCount || 0;
      highCount += r.summaryStats.highCount || 0;

      if (r.turnaroundTimeMs) {
        totalTurnaround += r.turnaroundTimeMs;
        validTurnaroundCount++;
      }
    });

    const averageTurnaroundTimeSec = validTurnaroundCount > 0
      ? Math.round((totalTurnaround / validTurnaroundCount) / 1000)
      : 0;

    res.json({
      totalReviews: reviews.length,
      averageTurnaroundTimeSec,
      issueTypes: {
        low: lowCount,
        medium: mediumCount,
        high: highCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
