const User = require('../models/User');
const Post = require('../models/Post');

// ✅ Get all users in the admin's organization
exports.getAllUsers = async (req, res) => {
  try {
    const orgId = req.user.organization;
    const users = await User.find({ organization: orgId }).select('-password');
    res.json(users);
  } catch (err) {
    console.error('Get Users Error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// ✅ Update user role (within the same organization)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // 🔒 Restrict updates to same organization
    if (String(user.organization) !== String(req.user.organization)) {
      return res.status(403).json({ message: 'Unauthorized: Different organization' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'Role updated successfully', user });
  } catch (err) {
    console.error('Update Role Error:', err);
    res.status(500).json({ message: 'Failed to update role' });
  }
};

// ✅ Delete user (within same organization, cannot delete super admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // 🔒 Prevent deleting super admin
    if (user.role === 'super_admin') {
      return res.status(403).json({ message: 'Cannot delete super admin' });
    }

    // 🔒 Restrict to same organization
    if (String(user.organization) !== String(req.user.organization)) {
      return res.status(403).json({ message: 'Unauthorized: Different organization' });
    }

    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// ✅ Admin Dashboard Stats (organization scoped)
exports.getStats = async (req, res) => {
  try {
    const orgId = req.user.organization;

    const totalUsers = await User.countDocuments({ organization: orgId });
    const totalPosts = await Post.countDocuments({ organization: orgId });
    const pendingPosts = await Post.countDocuments({ organization: orgId, status: 'pending' });

    res.json({ totalUsers, totalPosts, pendingPosts });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};
