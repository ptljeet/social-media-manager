const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

const {
  createPost,
  getUserPosts,
  getCalendarPosts,
  approvePost,
  getPendingPosts,
  publishToSocialMedia,
  getPostsByStatus,   // ✅ new
  declinePost         // ✅ new
} = require('../controllers/postController');

router.post('/', protect, upload.single('media'), createPost);

router.get('/', protect, getUserPosts);
router.get('/calendar', protect, getCalendarPosts);
router.get('/pending', protect, getPendingPosts);
router.get('/status/:status', protect, getPostsByStatus); // ✅ fetch by status
router.post('/:id/approve', protect, approvePost);
router.post('/:id/decline', protect, declinePost);       // ✅ decline
router.post('/:id/publish', protect, publishToSocialMedia);

module.exports = router;
