const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const ExchangeRequest = require('../models/ExchangeRequest');
const PurchaseRequest = require('../models/PurchaseRequest');
const Review = require('../models/Review');
const fallbackDb = require('../utils/fallbackDb');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (role && role !== 'All') query.role = role;
      if (search && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [{ name: searchRegex }, { email: searchRegex }, { college: searchRegex }];
      }

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const total = await User.countDocuments(query);
      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        total,
        count: users.length,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        users
      });
    } else {
      let users = [...fallbackDb.users];
      if (role && role !== 'All') {
        users = users.filter((u) => u.role === role);
      }
      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        users = users.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.college.toLowerCase().includes(q)
        );
      }

      const usersSafe = users.map((u) => {
        const { password, ...safe } = u;
        return safe;
      });

      return res.status(200).json({
        success: true,
        total: usersSafe.length,
        count: usersSafe.length,
        totalPages: 1,
        currentPage: 1,
        users: usersSafe
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(200).json({ success: true, user });
    } else {
      const user = fallbackDb.users.find((u) => u._id.toString() === req.params.id.toString());
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      user.role = role;
      const { password, ...safe } = user;
      return res.status(200).json({ success: true, user: safe });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user suspension (Admin only)
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
exports.toggleSuspendUser = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      user.isSuspended = !user.isSuspended;
      await user.save();
      return res.status(200).json({ success: true, isSuspended: user.isSuspended });
    } else {
      const user = fallbackDb.users.find((u) => u._id.toString() === req.params.id.toString());
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      user.isSuspended = !user.isSuspended;
      return res.status(200).json({ success: true, isSuspended: user.isSuspended });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user account (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      await user.deleteOne();
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } else {
      const idx = fallbackDb.users.findIndex((u) => u._id.toString() === req.params.id.toString());
      if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });
      fallbackDb.users.splice(idx, 1);
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get all books for admin inspection
// @route   GET /api/admin/books
// @access  Private/Admin
exports.getAllBooks = async (req, res, next) => {
  try {
    const { search, category, listingType, availability, page = 1, limit = 20 } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (category && category !== 'All') query.category = category;
      if (listingType && listingType !== 'All') query.listingType = listingType;
      if (availability && availability !== 'All') query.availability = availability;

      if (search && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [{ title: searchRegex }, { author: searchRegex }, { college: searchRegex }];
      }

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const total = await Book.countDocuments(query);
      const books = await Book.find(query)
        .populate('seller', 'name email college')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        total,
        count: books.length,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        books
      });
    } else {
      let books = [...fallbackDb.books];
      if (category && category !== 'All') books = books.filter((b) => b.category === category);
      if (listingType && listingType !== 'All') books = books.filter((b) => b.listingType === listingType);
      if (availability && availability !== 'All') books = books.filter((b) => b.availability === availability);

      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        books = books.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.college.toLowerCase().includes(q)
        );
      }

      return res.status(200).json({
        success: true,
        total: books.length,
        count: books.length,
        totalPages: 1,
        currentPage: 1,
        books
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Remove inappropriate book listing (Admin only)
// @route   DELETE /api/admin/books/:id
// @access  Private/Admin
exports.removeBook = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const book = await Book.findById(req.params.id);
      if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
      await book.deleteOne();
      return res.status(200).json({ success: true, message: 'Listing removed successfully by administrator' });
    } else {
      const idx = fallbackDb.books.findIndex((b) => b._id.toString() === req.params.id.toString());
      if (idx === -1) return res.status(404).json({ success: false, message: 'Book not found' });
      fallbackDb.books.splice(idx, 1);
      return res.status(200).json({ success: true, message: 'Listing removed successfully by administrator' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle featured status of a book
// @route   PUT /api/admin/books/:id/feature
// @access  Private/Admin
exports.toggleFeatureBook = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const book = await Book.findById(req.params.id);
      if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
      book.featured = !book.featured;
      await book.save();
      return res.status(200).json({ success: true, featured: book.featured });
    } else {
      const book = fallbackDb.books.find((b) => b._id.toString() === req.params.id.toString());
      if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
      book.featured = !book.featured;
      return res.status(200).json({ success: true, featured: book.featured });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get all transactions for monitoring
// @route   GET /api/admin/transactions
// @access  Private/Admin
exports.getAllTransactions = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const purchases = await PurchaseRequest.find()
        .populate('buyer', 'name email college')
        .populate('seller', 'name email college')
        .populate('book', 'title price images')
        .sort({ createdAt: -1 })
        .limit(30);

      const exchanges = await ExchangeRequest.find()
        .populate('requestedBy', 'name email college')
        .populate('owner', 'name email college')
        .populate('bookOffered', 'title images')
        .populate('bookRequested', 'title images')
        .sort({ createdAt: -1 })
        .limit(30);

      return res.status(200).json({ success: true, purchases, exchanges });
    } else {
      return res.status(200).json({
        success: true,
        purchases: fallbackDb.purchaseRequests,
        exchanges: fallbackDb.exchangeRequests
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/statistics
// @access  Private/Admin
exports.getPlatformStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const totalUsers = await User.countDocuments();
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalBooks = await Book.countDocuments();
      const activeListings = await Book.countDocuments({ availability: 'available' });
      const soldListings = await Book.countDocuments({ availability: 'sold' });
      const exchangedListings = await Book.countDocuments({ availability: 'exchanged' });
      const donatedListings = await Book.countDocuments({ listingType: 'Donate' });

      const totalExchangeRequests = await ExchangeRequest.countDocuments();
      const completedExchanges = await ExchangeRequest.countDocuments({ status: 'completed' });

      const totalPurchaseRequests = await PurchaseRequest.countDocuments();
      const completedPurchases = await PurchaseRequest.countDocuments({ status: 'completed' });

      const totalReviews = await Review.countDocuments();

      const categoryDistribution = await Book.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]);

      const listingTypeDistribution = await Book.aggregate([
        { $group: { _id: '$listingType', count: { $sum: 1 } } }
      ]);

      const books = await Book.find();
      let totalSavings = 0;
      books.forEach((b) => {
        const orig = b.originalPrice || 0;
        const price = b.price || 0;
        if (b.listingType === 'Donate' || b.listingType === 'Exchange') {
          totalSavings += orig > 0 ? orig : 30;
        } else if (orig > price) {
          totalSavings += orig - price;
        }
      });

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          totalStudents,
          totalBooks,
          activeListings,
          soldListings,
          exchangedListings,
          donatedListings,
          totalExchangeRequests,
          completedExchanges,
          totalPurchaseRequests,
          completedPurchases,
          totalReviews,
          estimatedTotalSavings: Math.round(totalSavings),
          categoryDistribution: categoryDistribution.map((c) => ({
            name: c._id || 'Other',
            count: c.count
          })),
          listingTypeDistribution: listingTypeDistribution.map((l) => ({
            name: l._id || 'Sell',
            count: l.count
          }))
        }
      });
    } else {
      const totalUsers = fallbackDb.users.length;
      const totalStudents = fallbackDb.users.filter((u) => u.role === 'student').length;
      const totalBooks = fallbackDb.books.length;
      const activeListings = fallbackDb.books.filter((b) => b.availability === 'available').length;
      const soldListings = fallbackDb.books.filter((b) => b.availability === 'sold').length;
      const exchangedListings = fallbackDb.books.filter((b) => b.availability === 'exchanged').length;
      const donatedListings = fallbackDb.books.filter((b) => b.listingType === 'Donate').length;

      const totalExchangeRequests = fallbackDb.exchangeRequests.length;
      const completedExchanges = fallbackDb.exchangeRequests.filter((e) => e.status === 'completed').length;

      const totalPurchaseRequests = fallbackDb.purchaseRequests.length;
      const completedPurchases = fallbackDb.purchaseRequests.filter((p) => p.status === 'completed').length;

      const totalReviews = fallbackDb.reviews.length;

      const catCounts = {};
      const typeCounts = {};
      let totalSavings = 0;

      fallbackDb.books.forEach((b) => {
        catCounts[b.category] = (catCounts[b.category] || 0) + 1;
        typeCounts[b.listingType] = (typeCounts[b.listingType] || 0) + 1;

        const orig = b.originalPrice || 0;
        const price = b.price || 0;
        if (b.listingType === 'Donate' || b.listingType === 'Exchange') {
          totalSavings += orig > 0 ? orig : 30;
        } else if (orig > price) {
          totalSavings += orig - price;
        }
      });

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          totalStudents,
          totalBooks,
          activeListings,
          soldListings,
          exchangedListings,
          donatedListings,
          totalExchangeRequests,
          completedExchanges,
          totalPurchaseRequests,
          completedPurchases,
          totalReviews,
          estimatedTotalSavings: Math.round(totalSavings),
          categoryDistribution: Object.entries(catCounts).map(([name, count]) => ({ name, count })),
          listingTypeDistribution: Object.entries(typeCounts).map(([name, count]) => ({ name, count }))
        }
      });
    }
  } catch (err) {
    next(err);
  }
};
