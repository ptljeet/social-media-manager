const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { isSuperAdmin } = require('../middlewares/roleMiddleware');
const { createOrganization, getAllOrganizations, deleteOrganization } = require('../controllers/superAdminController');

router.post('/organizations', protect, isSuperAdmin, createOrganization);
router.get('/organizations', protect, isSuperAdmin, getAllOrganizations);
router.delete('/organizations/:id', protect, isSuperAdmin, deleteOrganization);

module.exports = router;
