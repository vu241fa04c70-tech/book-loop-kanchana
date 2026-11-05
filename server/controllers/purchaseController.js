const mongoose = require('mongoose');
const PurchaseRequest = require('../models/PurchaseRequest');
const Book = require('../models/Book');
const fallbackDb = require('../utils/fallbackDb');

// @desc    Create a new purchase request
// @route   POST /api/purchases
// @access  Private
exports.createPurchaseRequest = async (req, res, next) => {
  try {
    const { bookId, offeredPrice, message, meetingLocation } = req.body;
    const userId = (req.user._id || req.user.id).toString();

    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Please provide a valid book ID' });
    }

    if (mongoose.connection.readyState === 1) {
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }

      if (book.seller.toString() === userId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot submit a purchase request for your own book listing'
        });
      }

      const existing = await PurchaseRequest.findOne({
        buyer: userId,
        book: bookId,
        status: { $in: ['pending', 'accepted'] }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You already have an active purchase request for this book'
        });
      }

      const purchase = await PurchaseRequest.create({
        buyer: userId,
        seller: book.seller,
        book: bookId,
        offeredPrice: offeredPrice !== undefined ? Number(offeredPrice) : book.price,
        message: message || '',
        meetingLocation: meetingLocation || 'Campus Library / Student Union',
        status: 'pending'
      });

      const populated = await PurchaseRequest.findById(purchase._id)
        .populate('buyer', 'name email college phone profileImage')
        .populate('seller', 'name email college phone profileImage')
        .populate('book', 'title author images price condition category availability');

      return res.status(201).json({ success: true, purchase: populated });
    } else {
      const book = fallbackDb.books.find((b) => b._id.toString() === bookId.toString());
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }

      const sellerId = (book.seller._id || book.seller).toString();
      if (sellerId === userId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot submit a purchase request for your own book listing'
        });
      }

      const existing = fallbackDb.purchaseRequests.find(
        (p) =>
          (p.buyer._id || p.buyer).toString() === userId &&
          (p.book._id || p.book).toString() === bookId.toString() &&
          ['pending', 'accepted'].includes(p.status)
      );

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You already have an active purchase request for this book'
        });
      }

      const newId = '66d4' + Math.random().toString(16).substring(2, 10).padEnd(20, '0');
      const buyer = fallbackDb.users.find((u) => u._id.toString() === userId) || req.user;
      const seller = fallbackDb.users.find((u) => u._id.toString() === sellerId) || book.seller;

      const newPurchase = {
        _id: newId,
        buyer,
        seller,
        book,
        offeredPrice: offeredPrice !== undefined ? Number(offeredPrice) : book.price,
        message: message || '',
        meetingLocation: meetingLocation || 'Campus Library / Student Union',
        status: 'pending',
        createdAt: new Date()
      };

      fallbackDb.purchaseRequests.unshift(newPurchase);
      return res.status(201).json({ success: true, purchase: newPurchase });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get sent purchase requests
// @route   GET /api/purchases/sent
// @access  Private
exports.getSentPurchases = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const purchases = await PurchaseRequest.find({ buyer: userId })
        .populate('seller', 'name email college phone profileImage')
        .populate('book', 'title author images price condition category availability')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: purchases.length, purchases });
    } else {
      const purchases = fallbackDb.purchaseRequests.filter((p) => {
        const buyerId = (p.buyer._id || p.buyer).toString();
        return buyerId === userId;
      });

      return res.status(200).json({ success: true, count: purchases.length, purchases });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get received purchase requests
// @route   GET /api/purchases/received
// @access  Private
exports.getReceivedPurchases = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const purchases = await PurchaseRequest.find({ seller: userId })
        .populate('buyer', 'name email college phone profileImage')
        .populate('book', 'title author images price condition category availability')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: purchases.length, purchases });
    } else {
      const purchases = fallbackDb.purchaseRequests.filter((p) => {
        const sellerId = (p.seller._id || p.seller).toString();
        return sellerId === userId;
      });

      return res.status(200).json({ success: true, count: purchases.length, purchases });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update purchase request status
// @route   PUT /api/purchases/:id/status
// @access  Private
exports.updatePurchaseStatus = async (req, res, next) => {
  try {
    const { status, meetingLocation } = req.body;
    const userId = (req.user._id || req.user.id).toString();
    const validStatuses = ['pending', 'accepted', 'rejected', 'cancelled', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    if (mongoose.connection.readyState === 1) {
      const purchase = await PurchaseRequest.findById(req.params.id);
      if (!purchase) {
        return res.status(404).json({ success: false, message: 'Purchase request not found' });
      }

      const isSeller = purchase.seller.toString() === userId;
      const isBuyer = purchase.buyer.toString() === userId;
      const isAdmin = req.user.role === 'admin';

      if (!isSeller && !isBuyer && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      if ((status === 'accepted' || status === 'rejected') && !isSeller && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only seller can accept or reject' });
      }

      if (status === 'cancelled' && !isBuyer && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only buyer can cancel' });
      }

      purchase.status = status;
      if (meetingLocation) purchase.meetingLocation = meetingLocation;

      if (status === 'completed') {
        purchase.completedAt = Date.now();
        await Book.findByIdAndUpdate(purchase.book, { availability: 'sold' });
      }

      await purchase.save();

      const updated = await PurchaseRequest.findById(purchase._id)
        .populate('buyer', 'name email college phone profileImage')
        .populate('seller', 'name email college phone profileImage')
        .populate('book', 'title author images price condition category availability');

      return res.status(200).json({ success: true, purchase: updated });
    } else {
      const pIndex = fallbackDb.purchaseRequests.findIndex(
        (p) => p._id.toString() === req.params.id.toString()
      );

      if (pIndex === -1) {
        return res.status(404).json({ success: false, message: 'Purchase request not found' });
      }

      const purchase = fallbackDb.purchaseRequests[pIndex];
      const isSeller = (purchase.seller._id || purchase.seller).toString() === userId;
      const isBuyer = (purchase.buyer._id || purchase.buyer).toString() === userId;
      const isAdmin = req.user.role === 'admin';

      if (!isSeller && !isBuyer && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      purchase.status = status;
      if (meetingLocation) purchase.meetingLocation = meetingLocation;
      if (status === 'completed') {
        purchase.completedAt = new Date();
        const book = fallbackDb.books.find(
          (b) => b._id.toString() === (purchase.book._id || purchase.book).toString()
        );
        if (book) book.availability = 'sold';
      }

      return res.status(200).json({ success: true, purchase });
    }
  } catch (err) {
    next(err);
  }
};
