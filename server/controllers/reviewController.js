const mongoose = require('mongoose');
const Review = require('../models/Review');
const PurchaseRequest = require('../models/PurchaseRequest');
const ExchangeRequest = require('../models/ExchangeRequest');
const fallbackDb = require('../utils/fallbackDb');

// @desc    Submit a review after completed transaction
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { reviewedUserId, transactionType, transactionId, rating, comment } = req.body;
    const userId = (req.user._id || req.user.id).toString();

    if (!reviewedUserId || !transactionType || !transactionId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all review details: user, transaction type, transaction id, rating, and comment'
      });
    }

    if (userId === reviewedUserId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot review yourself' });
    }

    if (mongoose.connection.readyState === 1) {
      const existing = await Review.findOne({ reviewer: userId, transactionId });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted a review for this transaction'
        });
      }

      if (transactionType === 'purchase') {
        const purchase = await PurchaseRequest.findById(transactionId);
        if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });
        if (purchase.status !== 'completed') {
          return res.status(400).json({ success: false, message: 'Reviews only allowed after completion' });
        }
      } else if (transactionType === 'exchange') {
        const exchange = await ExchangeRequest.findById(transactionId);
        if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });
        if (exchange.status !== 'completed') {
          return res.status(400).json({ success: false, message: 'Reviews only allowed after completion' });
        }
      }

      const review = await Review.create({
        reviewer: userId,
        reviewedUser: reviewedUserId,
        transactionType,
        transactionId,
        rating: Number(rating),
        comment
      });

      const populated = await Review.findById(review._id).populate('reviewer', 'name profileImage college');
      return res.status(201).json({ success: true, review: populated });
    } else {
      const existing = fallbackDb.reviews.find(
        (r) =>
          (r.reviewer._id || r.reviewer).toString() === userId &&
          r.transactionId.toString() === transactionId.toString()
      );

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted a review for this transaction'
        });
      }

      const reviewer = fallbackDb.users.find((u) => u._id.toString() === userId) || req.user;
      const newReview = {
        _id: '66f6' + Math.random().toString(16).substring(2, 10).padEnd(20, '0'),
        reviewer,
        reviewedUser: reviewedUserId,
        transactionType,
        transactionId,
        rating: Number(rating),
        comment,
        createdAt: new Date()
      };

      fallbackDb.reviews.unshift(newReview);
      return res.status(201).json({ success: true, review: newReview });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res, next) => {
  try {
    const userId = req.params.userId.toString();

    if (mongoose.connection.readyState === 1) {
      const reviews = await Review.find({ reviewedUser: userId })
        .populate('reviewer', 'name profileImage college')
        .sort({ createdAt: -1 });

      const totalRatings = reviews.reduce((sum, item) => sum + item.rating, 0);
      const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : '5.0';

      return res.status(200).json({
        success: true,
        count: reviews.length,
        averageRating: Number(averageRating),
        reviews
      });
    } else {
      const reviews = fallbackDb.reviews.filter(
        (r) => (r.reviewedUser._id || r.reviewedUser).toString() === userId
      );

      const totalRatings = reviews.reduce((sum, item) => sum + item.rating, 0);
      const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : '5.0';

      return res.status(200).json({
        success: true,
        count: reviews.length,
        averageRating: Number(averageRating),
        reviews
      });
    }
  } catch (err) {
    next(err);
  }
};
