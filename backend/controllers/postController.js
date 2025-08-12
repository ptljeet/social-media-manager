// backend/controllers/postController.js
const Post = require('../models/Post');

/**
 * Create Post
 * - validates required fields
 * - converts scheduledAt to Date
 * - uses req.user._id and req.user.organization (stringified ObjectIds)
 */
// backend/controllers/postController.js
exports.createPost = async (req, res) => {
  try {
    const { title, content, platform, status, scheduledAt } = req.body;

    // ✅ Always store a clean web path, not the file system path
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newPost = new Post({
      title,
      content,
      platform,
      status,
      scheduledAt,
      media: mediaUrl, // ✅ use web path for frontend
      createdBy: req.user.id,
      organization: req.user.organization,
      team: req.user.team
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('CREATE POST ERROR:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};


/**
 * Unified list with filters for dashboard/home:
 * GET /api/posts?status=approved&fromNow=true&limit=6&sort=scheduledAt:asc
 * Always scoped to the caller's organization.
 */
exports.listPosts = async (req, res) => {
  try {
    const { status, fromNow, limit = 20, sort = 'scheduledAt:asc' } = req.query;

    const q = { organization: req.user.organization };
    if (status) q.status = status;
    if (fromNow === 'true') q.scheduledAt = { $gte: new Date() };

    const [field, dir] = String(sort).split(':');
    const sortObj = { [field]: dir === 'desc' ? -1 : 1 };

    const items = await Post.find(q)
      .sort(sortObj)
      .limit(Math.max(1, Math.min(parseInt(limit, 10) || 20, 50)));

    return res.json(items);
  } catch (e) {
    console.error('LIST POSTS ERROR:', e);
    return res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// Calendar view (scoped to org)
// Calendar view
exports.getCalendarPosts = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const q = {
      scheduledAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      organization: req.user.organization,
    };

    if (status) {
      q.status = status; // filter only matching status if provided
    }

    const posts = await Post.find(q);
    res.status(200).json(posts);
  } catch (error) {
    console.error('CALENDAR FETCH ERROR:', error);
    res.status(500).json({ error: 'Error loading calendar data' });
  }
};


// Pending approvals (scoped to org)
exports.getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      organization: req.user.organization,
      status: 'pending',
    });
    return res.status(200).json(posts);
  } catch (error) {
    console.error('PENDING FETCH ERROR:', error);
    return res.status(500).json({ error: 'Failed to fetch pending posts' });
  }
};

// By status (scoped to org)
exports.getPostsByStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const posts = await Post.find({
      organization: req.user.organization,
      status,
    });
    return res.status(200).json(posts);
  } catch (error) {
    console.error('STATUS FETCH ERROR:', error);
    return res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// Approve (scoped to org)
exports.approvePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      organization: req.user.organization,
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.status = 'approved';
    await post.save();

    return res.status(200).json({ message: 'Post approved' });
  } catch (error) {
    console.error('APPROVE ERROR:', error);
    return res.status(500).json({ error: 'Error approving post' });
  }
};

// Decline (scoped to org)
exports.declinePost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      { status: 'declined' },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });

    return res.status(200).json({ message: 'Post declined' });
  } catch (error) {
    console.error('DECLINE ERROR:', error);
    return res.status(500).json({ message: 'Failed to decline post' });
  }
};

// Publish (stub)
exports.publishToSocialMedia = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      organization: req.user.organization,
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.status = 'published';
    post.publishedAt = new Date();
    await post.save();

    return res.status(200).json({ message: 'Published (stub)' });
  } catch (error) {
    console.error('PUBLISH ERROR:', error);
    return res.status(500).json({ error: 'Publish failed' });
  }
};
