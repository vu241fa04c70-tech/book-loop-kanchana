const express = require('express');
const router = express.Router();
const {
  getDonations,
  requestDonation
} = require('../controllers/donationController');
const { protect } = require('../middleware/auth');

router.get('/', getDonations);
router.post('/request', protect, requestDonation);

module.exports = router;
