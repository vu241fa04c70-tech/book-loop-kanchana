const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');
const fallbackDb = require('../utils/fallbackDb');

// @desc    Add book to wishlist
// @route   POST /api/wishlist/:bookId
// @access  Private
exports.addToWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }

      let item = await Wishlist.findOne({ user: userId, book: bookId });
      if (item) {
        return res.status(200).json({ success: true, message: 'Book already in wishlist', isSaved: true });
      }

      item = await Wishlist.create({ user: userId, book: bookId });
      return res.status(201).json({ success: true, message: 'Book added to wishlist', isSaved: true });
    } else {
      const book = fallbackDb.books.find((b) => b._id.toString() === bookId.toString());
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }

      const existing = fallbackDb.wishlists.find(
        (w) =>
          (w.user._id || w.user).toString() === userId &&
          (w.book._id || w.book).toString() === bookId.toString()
      );

      if (existing) {
        return res.status(200).json({ success: true, message: 'Book already in wishlist', isSaved: true });
      }

      const newWish = {
        _id: '66e5' + Math.random().toString(16).substring(2, 10).padEnd(20, '0'),
        user: userId,
        book,
        createdAt: new Date()
      };

      fallbackDb.wishlists.push(newWish);
      return res.status(201).json({ success: true, message: 'Book added to wishlist', isSaved: true });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const wishlistItems = await Wishlist.find({ user: userId })
        .populate({
          path: 'book',
          populate: {
            path: 'seller',
            select: 'name email college location profileImage'
          }
        })
        .sort({ createdAt: -1 });

      const validBooks = wishlistItems
        .filter((item) => item.book !== null)
        .map((item) => ({
          wishlistId: item._id,
          savedAt: item.createdAt,
          ...item.book.toObject()
        }));

      return res.status(200).json({ success: true, count: validBooks.length, wishlist: validBooks });
    } else {
      const userWishes = fallbackDb.wishlists.filter(
        (w) => (w.user._id || w.user).toString() === userId
      );

      const validBooks = userWishes.map((w) => {
        const bookObj = w.book && typeof w.book === 'object' ? w.book : fallbackDb.books.find((b) => b._id.toString() === w.book.toString());
        return {
          wishlistId: w._id,
          savedAt: w.createdAt,
          ...bookObj
        };
      });

      return res.status(200).json({ success: true, count: validBooks.length, wishlist: validBooks });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Remove book from wishlist
// @route   DELETE /api/wishlist/:bookId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      await Wishlist.findOneAndDelete({ user: userId, book: bookId });
      return res.status(200).json({ success: true, message: 'Book removed from wishlist', isSaved: false });
    } else {
      const idx = fallbackDb.wishlists.findIndex(
        (w) =>
          (w.user._id || w.user).toString() === userId &&
          (w.book._id || w.book).toString() === bookId.toString()
      );

      if (idx !== -1) {
        fallbackDb.wishlists.splice(idx, 1);
      }

      return res.status(200).json({ success: true, message: 'Book removed from wishlist', isSaved: false });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Check if book is in user's wishlist
// @route   GET /api/wishlist/check/:bookId
// @access  Private
exports.checkWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const item = await Wishlist.findOne({ user: userId, book: bookId });
      return res.status(200).json({ success: true, isSaved: !!item });
    } else {
      const item = fallbackDb.wishlists.find(
        (w) =>
          (w.user._id || w.user).toString() === userId &&
          (w.book._id || w.book).toString() === bookId.toString()
      );
      return res.status(200).json({ success: true, isSaved: !!item });
    }
  } catch (err) {
    next(err);
  }
};
