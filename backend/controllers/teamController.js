const Team = require('../models/Team');

exports.createTeam = async (req, res) => {
  try {
    const { name, organization } = req.body;
    const team = await Team.create({ name, organization });
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create team', error: err.message });
  }
};

exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('organization').populate('members');
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch teams', error: err.message });
  }
};

exports.addUserToTeam = async (req, res) => {
  try {
    const { teamId, userId } = req.body;
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (!team.members.includes(userId)) {
      team.members.push(userId);
      await team.save();
    }

    res.status(200).json(team);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add user to team', error: err.message });
  }
};
