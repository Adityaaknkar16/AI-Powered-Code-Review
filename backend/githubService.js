const { Octokit } = require('@octokit/rest');
const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token (JWT) to authenticate as the GitHub App.
 */
function generateAppJwt() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n');

  const payload = {
    iat: Math.floor(Date.now() / 1000) - 60, // Issued 60 seconds ago
    exp: Math.floor(Date.now() / 1000) + (10 * 60), // Expires in 10 minutes
    iss: appId,
  };

  return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}

/**
 * Gets an Octokit client authenticated as a specific installation of the GitHub App.
 */
async function getInstallationOctokit(installationId) {
  const jwtToken = generateAppJwt();
  
  // App-authenticated octokit
  const appOctokit = new Octokit({
    auth: jwtToken,
  });

  // Request installation access token
  const { data } = await appOctokit.apps.createInstallationAccessToken({
    installation_id: installationId,
  });

  // Return installation-authenticated octokit
  return new Octokit({
    auth: data.token,
  });
}

/**
 * Fetches files changed and their diff patches for a pull request.
 */
async function fetchPullRequestDiff(octokit, owner, repo, pullNumber) {
  try {
    const { data: files } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 100
    });

    return files.map(file => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      patch: file.patch // Unified diff patch
    })).filter(f => f.patch); // Keep only text files with a valid patch
  } catch (error) {
    console.error(`Error fetching PR diff for ${owner}/${repo} #${pullNumber}:`, error);
    throw error;
  }
}

/**
 * Posts review comments back to a GitHub PR.
 */
async function postReviewComments(octokit, owner, repo, pullNumber, commitSha, comments) {
  try {
    const githubComments = comments.map(c => ({
      path: c.file,
      line: c.line,
      side: 'RIGHT', // Post comments on the additions/changes side
      body: `**[AI Review - ${c.severity.toUpperCase()} Severity]**\n\n${c.comment}`
    }));

    if (githubComments.length === 0) return;

    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      commit_id: commitSha,
      event: 'COMMENT',
      comments: githubComments
    });
  } catch (error) {
    console.error(`Error posting review comments to ${owner}/${repo} #${pullNumber}:`, error);
    throw error;
  }
}

module.exports = {
  getInstallationOctokit,
  fetchPullRequestDiff,
  postReviewComments,
};
