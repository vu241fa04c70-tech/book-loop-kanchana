const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  getUserProfile,
  toggleBlockUser
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/users/:id/profile', getUserProfile);
router.post('/users/:id/block', protect, toggleBlockUser);

module.exports = router;
