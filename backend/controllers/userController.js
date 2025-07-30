const User = require('../models/User');

// Get users in current user's organization/team
exports.getUsersInTeam = async (req, res) => {
  try {
    const orgId = req.user.organization;
    const users = await User.find({ organization: orgId }).select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Admin only: Update role of a user
exports.updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update roles' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.role = req.body.role;
    await user.save();

    res.status(200).json({ message: 'Role updated successfully', role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Error updating role' });
  }
};
