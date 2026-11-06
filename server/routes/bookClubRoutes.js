const express = require('express');
const router = express.Router();
const {
  getBookClubs,
  getBookClubById,
  createBookClub,
  toggleJoinClub
} = require('../controllers/bookClubController');
const { protect } = require('../middleware/auth');

router.get('/', getBookClubs);
router.get('/:id', getBookClubById);

router.post('/', protect, createBookClub);
router.post('/:id/join', protect, toggleJoinClub);

module.exports = router;
