const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createPost,
  getUserPosts,
  getCalendarPosts 
} = require('../controllers/postController');

router.post('/', protect, createPost);
router.get('/', protect, getUserPosts);
router.get('/calendar', protect, getCalendarPosts);

module.exports = router;
