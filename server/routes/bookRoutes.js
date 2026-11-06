const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getMyListings,
  uploadImage,
  getRecommendations
} = require('../controllers/bookController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(getBooks)
  .post(protect, createBook);

router.get('/recommendations', getRecommendations);
router.get('/my-listings', protect, getMyListings);

router.post('/upload', protect, upload.single('image'), uploadImage);

router.route('/:id')
  .get(getBook)
  .put(protect, updateBook)
  .delete(protect, deleteBook);

module.exports = router;
