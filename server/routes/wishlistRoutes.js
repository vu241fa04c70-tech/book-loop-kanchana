const express = require('express');
const router = express.Router();
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  checkWishlist
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getWishlist);
router.post('/:bookId', addToWishlist);
router.delete('/:bookId', removeFromWishlist);
router.get('/check/:bookId', checkWishlist);

module.exports = router;
