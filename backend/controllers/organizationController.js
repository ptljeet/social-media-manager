const Organization = require('../models/Organization');
const Team = require('../models/Team');

// Create Organization
exports.createOrganization = async (req, res) => {
  try {
    const org = await Organization.create({
      name: req.body.name,
      createdBy: req.user._id
    });
    res.status(201).json(org);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating organization' });
  }
};

// Create Team under Organization
exports.createTeam = async (req, res) => {
  const { orgId } = req.params;
  const { name, members } = req.body;

  try {
    const team = await Team.create({
      name,
      organization: orgId,
      members
    });

    // Add team to organization
    await Organization.findByIdAndUpdate(orgId, { $push: { teams: team._id } });

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating team' });
  }
};

// Get all orgs for current user
exports.getUserOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find({ createdBy: req.user._id }).populate('teams');
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch organizations' });
  }
};
