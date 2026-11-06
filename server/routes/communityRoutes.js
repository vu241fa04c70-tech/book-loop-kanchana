const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  toggleLikePost,
  addComment,
  deletePost
} = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);

router.post('/posts', protect, createPost);
router.post('/posts/:id/like', protect, toggleLikePost);
router.post('/posts/:id/comments', protect, addComment);
router.delete('/posts/:id', protect, deletePost);

module.exports = router;
