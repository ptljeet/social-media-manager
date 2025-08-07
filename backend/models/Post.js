const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  media: { type: String },
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'twitter'],
    default: 'facebook'
  },
  scheduledAt: { type: Date },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'declined', 'published'], // ✅ added declined
    default: 'draft'
  },
  publishedAt: { type: Date },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
