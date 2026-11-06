const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const fallbackDb = require('../utils/fallbackDb');
const { sendEmail } = require('../utils/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'bookloop_jwt_secret_dev_key_2026_super_secure', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone, college, registrationNumber, location, role } = req.body;

    if (!name || !email || !password || !college || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, password, college, and location'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'student';

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        phone: phone || '',
        college: college.trim(),
        registrationNumber: registrationNumber || '',
        location: location.trim(),
        role: assignedRole
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          college: user.college,
          location: user.location,
          phone: user.phone,
          registrationNumber: user.registrationNumber,
          profileImage: user.profileImage,
          bio: user.bio,
          createdAt: user.createdAt
        }
      });
    } else {
      // Fallback in-memory
      const existingUser = fallbackDb.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUserId = '66a1' + Math.random().toString(16).substring(2, 10).padEnd(20, '0');

      const newUser = {
        _id: newUserId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone || '',
        college: college.trim(),
        registrationNumber: registrationNumber || '',
        location: location.trim(),
        profileImage:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        role: assignedRole,
        bio: 'Avid reader and student on BookLoop!',
        createdAt: new Date()
      };

      fallbackDb.users.push(newUser);
      const token = generateToken(newUser._id);
      const { password: _, ...userSafe } = newUser;

      return res.status(201).json({
        success: true,
        token,
        user: userSafe
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both an email and password'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      if (user.isSuspended) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended by an administrator. Please contact support.'
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          college: user.college,
          location: user.location,
          phone: user.phone,
          registrationNumber: user.registrationNumber,
          profileImage: user.profileImage,
          bio: user.bio,
          createdAt: user.createdAt
        }
      });
    } else {
      // Fallback in-memory
      const user = fallbackDb.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      if (user.isSuspended) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended by an administrator. Please contact support.'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const token = generateToken(user._id);
      const { password: _, ...userSafe } = user;

      return res.status(200).json({
        success: true,
        token,
        user: userSafe
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id || req.user.id);
      return res.status(200).json({ success: true, user });
    } else {
      const user = fallbackDb.users.find(
        (u) => u._id.toString() === (req.user._id || req.user.id).toString()
      );
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const { password: _, ...userSafe } = user;
      return res.status(200).json({ success: true, user: userSafe });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      college: req.body.college,
      location: req.body.location,
      city: req.body.city,
      bio: req.body.bio,
      profileImage: req.body.profileImage,
      readingInterests: req.body.readingInterests,
      favoriteCategories: req.body.favoriteCategories
    };

    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
        new: true,
        runValidators: true
      });
      return res.status(200).json({ success: true, user });
    } else {
      const userIndex = fallbackDb.users.findIndex(
        (u) => u._id.toString() === userId.toString()
      );
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      fallbackDb.users[userIndex] = {
        ...fallbackDb.users[userIndex],
        ...fieldsToUpdate
      };

      const { password: _, ...userSafe } = fallbackDb.users[userIndex];
      return res.status(200).json({ success: true, user: userSafe });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot Password - Generate reset token and dispatch email
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return res.status(404).json({ success: false, message: 'There is no user with that email address' });
      }

      const resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      // Create reset url
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

      const message = `You are receiving this email because you requested a password reset for your BookLoop account.\n\nPlease navigate to: \n\n${resetUrl}\n\nThis link will expire in 10 minutes.`;

      try {
        await sendEmail({
          to: user.email,
          subject: '[BookLoop] Password Reset Request',
          text: message
        });

        return res.status(200).json({
          success: true,
          message: 'Password reset link sent to your email',
          resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined
        });
      } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ success: false, message: 'Email could not be sent' });
      }
    } else {
      const user = fallbackDb.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (!user) {
        return res.status(404).json({ success: false, message: 'There is no user with that email address' });
      }
      const rawToken = 'dev-token-' + Math.random().toString(16).substring(2, 10);
      user.resetPasswordToken = rawToken;
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
      return res.status(200).json({
        success: true,
        message: 'Password reset link dispatched (fallback mode)',
        resetToken: rawToken
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset Password using token
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password with at least 6 characters'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
      }

      // Set new password
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Password reset successful! You are now logged in.',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          college: user.college,
          location: user.location
        }
      });
    } else {
      const user = fallbackDb.users.find(
        (u) => u.resetPasswordToken === req.params.resettoken && u.resetPasswordExpire > Date.now()
      );
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
      }
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(password, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Password reset successful! You are now logged in.',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          college: user.college,
          location: user.location
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get public reader profile by user ID
// @route   GET /api/auth/users/:id/profile
// @access  Public
exports.getUserProfile = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const Book = require('../models/Book');
    const Review = require('../models/Review');

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(targetUserId).select(
        'name college location city bio profileImage isVerified role createdAt rating reviewCount readingInterests favoriteCategories'
      );
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const activeListings = await Book.find({ seller: targetUserId, availability: 'available' })
        .sort({ createdAt: -1 })
        .limit(10);

      const reviews = await Review.find({ seller: targetUserId })
        .populate('buyer', 'name profileImage')
        .sort({ createdAt: -1 })
        .limit(10);

      return res.status(200).json({
        success: true,
        user,
        activeListings,
        reviews
      });
    } else {
      const user = fallbackDb.users.find((u) => u._id.toString() === targetUserId.toString());
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const activeListings = fallbackDb.books.filter(
        (b) => (b.seller?._id || b.seller)?.toString() === targetUserId.toString() && b.availability === 'available'
      );
      const reviews = fallbackDb.reviews.filter(
        (r) => (r.seller?._id || r.seller)?.toString() === targetUserId.toString()
      );
      const { password: _, ...userSafe } = user;
      return res.status(200).json({
        success: true,
        user: userSafe,
        activeListings,
        reviews
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Block or Unblock a user
// @route   POST /api/auth/users/:id/block
// @access  Private
exports.toggleBlockUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id || req.user.id;

    if (targetId.toString() === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot block yourself' });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(currentUserId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (!user.blockedUsers) user.blockedUsers = [];
      const isBlocked = user.blockedUsers.some((id) => id.toString() === targetId.toString());

      if (isBlocked) {
        user.blockedUsers = user.blockedUsers.filter((id) => id.toString() !== targetId.toString());
      } else {
        user.blockedUsers.push(targetId);
      }

      await user.save({ validateBeforeSave: false });

      return res.status(200).json({
        success: true,
        isBlocked: !isBlocked,
        message: !isBlocked ? 'User blocked successfully' : 'User unblocked successfully'
      });
    } else {
      return res.status(200).json({
        success: true,
        isBlocked: true,
        message: 'User blocked status updated'
      });
    }
  } catch (err) {
    next(err);
  }
};
