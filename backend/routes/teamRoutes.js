const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createTeam,
  getTeams,
  addUserToTeam,
} = require('../controllers/teamController');

// Protect all routes
router.use(protect);

// POST /api/teams - Create team
router.post('/', createTeam);

// GET /api/teams - Fetch all teams
router.get('/', getTeams);

// POST /api/teams/assign - Assign user to a team
router.post('/assign', addUserToTeam);

module.exports = router;
