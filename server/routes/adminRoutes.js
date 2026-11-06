const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUserRole,
  toggleSuspendUser,
  deleteUser,
  getAllBooks,
  removeBook,
  toggleFeatureBook,
  getAllTransactions,
  getPlatformStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id', updateUserRole);
router.put('/users/:id/suspend', toggleSuspendUser);
router.delete('/users/:id', deleteUser);
router.get('/books', getAllBooks);
router.delete('/books/:id', removeBook);
router.put('/books/:id/feature', toggleFeatureBook);
router.get('/transactions', getAllTransactions);
router.get('/statistics', getPlatformStats);

module.exports = router;
