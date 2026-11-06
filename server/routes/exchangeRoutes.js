const express = require('express');
const router = express.Router();
const {
  createExchangeRequest,
  getSentExchanges,
  getReceivedExchanges,
  updateExchangeStatus,
  confirmHandover
} = require('../controllers/exchangeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createExchangeRequest);
router.get('/sent', getSentExchanges);
router.get('/received', getReceivedExchanges);
router.put('/:id/status', updateExchangeStatus);
router.put('/:id/confirm-handover', confirmHandover);

module.exports = router;
