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
  publishToSocialMedia
} = require('../controllers/postController');

// 🔧 Use .single('media') — accepts a file OR not
router.post('/', protect, upload.single('media'), createPost);

router.get('/', protect, getUserPosts);
router.get('/calendar', protect, getCalendarPosts);
router.get('/pending', protect, getPendingPosts);
router.post('/:id/approve', protect, approvePost);
router.post('/:id/publish', protect, publishToSocialMedia);

module.exports = router;
