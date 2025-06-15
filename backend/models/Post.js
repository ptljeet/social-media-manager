const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  mediaUrl: { type: String },
  platform: { type: String, enum: ['Facebook', 'Instagram'], required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ['Draft', 'Scheduled', 'Published'], default: 'Draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
