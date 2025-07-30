const Post = require('../models/Post');

// Create Post
exports.createPost = async (req, res) => {
  try {
    const { title, content, platform, status, scheduledAt } = req.body;

const media = req.file && req.file.filename ? `/uploads/${req.file.filename}` : null;


    const newPost = new Post({
      title,
      content,
      platform,
      status,
      scheduledAt,
      media,
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

// Get posts for logged-in user/team
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ organization: req.user.organization });
    res.status(200).json(posts);
  } catch (error) {
    console.error('GET POSTS ERROR:', error);
    res.status(500).json({ error: 'Error fetching posts' });
  }
};

// Get posts for calendar view
exports.getCalendarPosts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const posts = await Post.find({
      scheduledAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      organization: req.user.organization
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error('CALENDAR FETCH ERROR:', error);
    res.status(500).json({ error: 'Error loading calendar data' });
  }
};

// Approve a post
exports.approvePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.status = 'approved';
    await post.save();

    res.status(200).json({ message: 'Post approved' });
  } catch (error) {
    console.error('APPROVE ERROR:', error);
    res.status(500).json({ error: 'Error approving post' });
  }
};

// Get all pending posts
exports.getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'pending' });
    res.status(200).json(posts);
  } catch (error) {
    console.error('PENDING FETCH ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch pending posts' });
  }
};

// Stub: publish post
exports.publishToSocialMedia = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.status = 'published';
    post.publishedAt = new Date();
    await post.save();

    res.status(200).json({ message: 'Published (stub)' });
  } catch (error) {
    console.error('PUBLISH ERROR:', error);
    res.status(500).json({ error: 'Publish failed' });
  }
};
