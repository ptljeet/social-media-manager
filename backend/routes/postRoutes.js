// backend/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

const {
  createPost,
  listPosts,           // ✅ new unified list with filters
  getCalendarPosts,
  approvePost,
  getPendingPosts,
  publishToSocialMedia,
  getPostsByStatus,
  declinePost
} = require('../controllers/postController');

router.post('/', protect, upload.single('media'), createPost);

// unified list supports dashboard filters
router.get('/', protect, listPosts);

router.get('/calendar', protect, getCalendarPosts);
router.get('/pending', protect, getPendingPosts);
router.get('/status/:status', protect, getPostsByStatus);
router.post('/:id/approve', protect, approvePost);
router.post('/:id/decline', protect, declinePost);
router.post('/:id/publish', protect, publishToSocialMedia);

module.exports = router;
