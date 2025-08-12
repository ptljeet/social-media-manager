const User = require('../models/User');
const Post = require('../models/Post');
const Organization = require('../models/Organization');

// Get all users in the admin's organization
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

// Update user role (within the same organization)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

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

// Delete user (within same organization, cannot delete admins)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const role = (user.role || '').toLowerCase();
    if (role === 'admin' || role === 'super_admin') {
      return res.status(403).json({ message: 'Cannot delete admin/super admin' });
    }

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

// Admin Dashboard Stats (org-scoped) + reliable org name
exports.getStats = async (req, res) => {
  try {
    const orgId = req.user.organization;

    const [totalUsers, totalPosts, pendingPosts] = await Promise.all([
      User.countDocuments({ organization: orgId }),
      Post.countDocuments({ organization: orgId }),
      Post.countDocuments({ organization: orgId, status: 'pending' }),
    ]);

    // Prefer name from middleware; fallback to DB
    let orgName = req.user.organizationName;
    if (!orgName && orgId) {
      const org = await Organization.findById(orgId).select('name');
      orgName = org?.name || 'Unknown Organization';
    }

    res.json({
      organizationName: orgName,
      totalUsers,
      totalPosts,
      pendingPosts,
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};
