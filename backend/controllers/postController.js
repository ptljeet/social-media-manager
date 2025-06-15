const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  try {
    const post = await Post.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json(post);
  } catch (err) {
    console.error(err); // ⬅️ This will show the real error in your terminal
    res.status(500).json({ message: 'Failed to create post' });
  }
};


// Get posts by user
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.user._id });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// (Optional) update, delete, filter by status
exports.getCalendarPosts = async (req, res) => {
  const { startDate, endDate, status, platform } = req.query;

  let query = {
    createdBy: req.user._id
  };

  if (startDate && endDate) {
    query.scheduledAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  if (status) query.status = status;
  if (platform) query.platform = platform;

  try {
    const posts = await Post.find(query).sort({ scheduledAt: 1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching calendar posts' });
  }
};
