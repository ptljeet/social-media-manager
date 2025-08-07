const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');

router.get('/organizations', async (req, res) => {
  try {
    const orgs = await Organization.find({}, 'name _id');
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch organizations' });
  }
});

module.exports = router;
