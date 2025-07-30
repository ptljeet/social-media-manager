const Post = require('../models/Post');

// This is a dummy logic – replace with real metrics aggregation later
exports.getAnalytics = async (req, res) => {
  try {
    const userOrg = req.user.organization;

    // Example: count all approved/published posts in the org
    const posts = await Post.find({
      organization: userOrg,
      status: { $in: ['approved', 'published'] }
    });

    const totalPosts = posts.length;
    const reach = totalPosts * 100;       // Example multiplier
    const engagement = totalPosts * 45;
    const clicks = totalPosts * 30;

    const result = {
      posts: totalPosts,
      reach,
      engagement,
      clicks
    };

    res.status(200).json(result);
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
