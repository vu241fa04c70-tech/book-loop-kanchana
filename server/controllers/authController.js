const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const fallbackDb = require('../utils/fallbackDb');

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
    const { name, email, password, phone, college, registrationNumber, location, role } = req.body;

    if (!name || !email || !password || !college || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, password, college, and location'
      });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'student';

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        phone: phone || '',
        college,
        registrationNumber: registrationNumber || '',
        location,
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
        (u) => u.email.toLowerCase() === email.toLowerCase()
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
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || '',
        college,
        registrationNumber: registrationNumber || '',
        location,
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
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
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
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
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
      bio: req.body.bio,
      profileImage: req.body.profileImage
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
