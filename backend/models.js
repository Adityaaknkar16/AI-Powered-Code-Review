const mongoose = require('mongoose');

// Users Schema
const UserSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String },
  avatarUrl: { type: String },
  accessToken: { type: String, required: true }, // GitHub OAuth Token
  createdAt: { type: Date, default: Date.now }
});

// Connected Repositories Schema
const ConnectedRepoSchema = new mongoose.Schema({
  githubRepoId: { type: Number, required: true, unique: true },
  name: { type: String, required: true }, // e.g., "owner/repo"
  owner: { type: String, required: true },
  installationId: { type: Number, required: true }, // GitHub App Installation ID
  isActive: { type: Boolean, default: true },
  settings: {
    reviewFocus: { 
      type: String, 
      enum: ['full', 'security', 'performance', 'style'], 
      default: 'full' 
    },
    minSeverity: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'low' 
    },
    autoApprove: { type: Boolean, default: false }
  },
  connectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Reviews Schema
const ReviewSchema = new mongoose.Schema({
  repoId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConnectedRepo', required: true },
  pullNumber: { type: Number, required: true },
  commitSha: { type: String, required: true },
  prTitle: { type: String, required: true },
  prUrl: { type: String, required: true },
  sender: { type: String, required: true }, // PR Author
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  errorDetails: { type: String },
  summaryStats: {
    lowCount: { type: Number, default: 0 },
    mediumCount: { type: Number, default: 0 },
    highCount: { type: Number, default: 0 },
    filesReviewed: { type: Number, default: 0 }
  },
  comments: [{
    file: { type: String, required: true },
    line: { type: Number, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
    comment: { type: String, required: true },
    githubCommentId: { type: Number }
  }],
  turnaroundTimeMs: { type: Number }, // Time taken from webhook reception to posting review
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  ConnectedRepo: mongoose.model('ConnectedRepo', ConnectedRepoSchema),
  Review: mongoose.model('Review', ReviewSchema)
};
