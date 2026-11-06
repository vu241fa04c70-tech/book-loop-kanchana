const express = require('express');
const router = express.Router();
const {
  createPurchaseRequest,
  getSentPurchases,
  getReceivedPurchases,
  updatePurchaseStatus,
  counterOffer,
  respondCounterOffer,
  confirmHandover,
  reportDispute
} = require('../controllers/purchaseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createPurchaseRequest);
router.get('/sent', getSentPurchases);
router.get('/received', getReceivedPurchases);
router.put('/:id/status', updatePurchaseStatus);
router.put('/:id/counter-offer', counterOffer);
router.put('/:id/respond-counter', respondCounterOffer);
router.put('/:id/confirm-handover', confirmHandover);
router.post('/:id/dispute', reportDispute);

module.exports = router;
