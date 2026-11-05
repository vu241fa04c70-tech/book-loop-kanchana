const express = require('express');
const router = express.Router();
const {
  createPurchaseRequest,
  getSentPurchases,
  getReceivedPurchases,
  updatePurchaseStatus
} = require('../controllers/purchaseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createPurchaseRequest);
router.get('/sent', getSentPurchases);
router.get('/received', getReceivedPurchases);
router.put('/:id/status', updatePurchaseStatus);

module.exports = router;
