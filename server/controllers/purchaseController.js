const mongoose = require('mongoose');
const PurchaseRequest = require('../models/PurchaseRequest');
const Book = require('../models/Book');
const fallbackDb = require('../utils/fallbackDb');
const { createNotification } = require('../utils/notificationHelper');

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

      // Create in-app notification for seller
      await createNotification({
        recipientId: book.seller,
        senderId: userId,
        type: 'purchase_request',
        title: 'New Purchase Request',
        message: `${req.user.name || 'A student'} sent a purchase request of $${purchase.offeredPrice} for your book "${book.title}".`,
        link: '/dashboard?tab=purchases',
        recipientEmail: populated?.seller?.email
      });

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

      await createNotification({
        recipientId: sellerId,
        senderId: userId,
        type: 'new_purchase_request',
        title: 'New Purchase Request Received',
        message: `${buyer?.name || 'A student'} offered $${offeredPrice || book.price} for "${book.title}".`,
        link: '/dashboard?tab=purchases',
        recipientEmail: seller?.email
      });

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

      if (status === 'accepted') {
        // Prevent conflicting accepted transactions for the same listing:
        // Set book to in-transaction and decline other pending requests
        await Book.findByIdAndUpdate(purchase.book, { availability: 'in-transaction' });
        await PurchaseRequest.updateMany(
          { book: purchase.book, _id: { $ne: purchase._id }, status: 'pending' },
          { status: 'rejected' }
        );
      }

      if (status === 'completed') {
        purchase.completedAt = Date.now();
        await Book.findByIdAndUpdate(purchase.book, { availability: 'sold' });
      }

      await purchase.save();

      const updated = await PurchaseRequest.findById(purchase._id)
        .populate('buyer', 'name email college phone profileImage')
        .populate('seller', 'name email college phone profileImage')
        .populate('book', 'title author images price condition category availability');

      // Notify the buyer of status change
      await createNotification({
        recipientId: purchase.buyer,
        senderId: userId,
        type: status === 'accepted' ? 'purchase_accepted' : status === 'completed' ? 'transaction_completed' : 'purchase_rejected',
        title: `Purchase Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: status === 'accepted'
          ? `The seller accepted your purchase request for "${updated?.book?.title || 'the book'}"! Meetup: ${purchase.meetingLocation}`
          : status === 'completed'
          ? `Your purchase for "${updated?.book?.title || 'the book'}" is marked completed. You can now leave a seller review!`
          : `Your purchase request for "${updated?.book?.title || 'the book'}" was declined.`,
        link: '/dashboard?tab=purchases',
        recipientEmail: updated?.buyer?.email
      });

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

      const book = fallbackDb.books.find(
        (b) => b._id.toString() === (purchase.book._id || purchase.book).toString()
      );

      if (status === 'accepted') {
        if (book) book.availability = 'in-transaction';
      }

      if (status === 'completed') {
        purchase.completedAt = new Date();
        if (book) book.availability = 'sold';
      }

      const buyerId = (purchase.buyer._id || purchase.buyer).toString();
      await createNotification({
        recipientId: buyerId,
        senderId: userId,
        type: status === 'accepted' ? 'purchase_accepted' : status === 'completed' ? 'transaction_completed' : 'purchase_rejected',
        title: `Purchase Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: status === 'accepted'
          ? `The seller accepted your purchase request for "${book?.title || 'the book'}"! Meetup: ${purchase.meetingLocation || 'Campus'}`
          : status === 'completed'
          ? `Your purchase for "${book?.title || 'the book'}" is marked completed. You can now leave a seller review!`
          : `Your purchase request for "${book?.title || 'the book'}" was declined.`,
        link: '/dashboard?tab=purchases',
        recipientEmail: purchase.buyer?.email
      });

      return res.status(200).json({ success: true, purchase });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Seller sends counteroffer on a purchase request
// @route   PUT /api/purchases/:id/counter-offer
// @access  Private
exports.counterOffer = async (req, res, next) => {
  try {
    const { counterPrice, message } = req.body;
    const userId = (req.user._id || req.user.id).toString();

    if (!counterPrice || Number(counterPrice) < 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid counteroffer price' });
    }

    if (mongoose.connection.readyState === 1) {
      const purchase = await PurchaseRequest.findById(req.params.id)
        .populate('buyer', 'name email')
        .populate('book', 'title');

      if (!purchase) {
        return res.status(404).json({ success: false, message: 'Purchase request not found' });
      }

      if (purchase.seller.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Only seller can counteroffer' });
      }

      purchase.counterOfferPrice = Number(counterPrice);
      purchase.counterOfferMessage = message ? message.trim() : '';
      purchase.counterOfferStatus = 'pending';
      purchase.status = 'counter_offered';
      await purchase.save();

      createNotification({
        recipientId: purchase.buyer._id || purchase.buyer,
        senderId: userId,
        type: 'counter_offer',
        title: 'Counteroffer Received',
        message: `Seller proposed $${counterPrice} for "${purchase.book?.title}".`,
        link: '/dashboard?tab=purchases',
        recipientEmail: purchase.buyer?.email
      }).catch(() => {});

      return res.status(200).json({ success: true, purchase, message: 'Counteroffer sent successfully' });
    } else {
      if (!fallbackDb.purchaseRequests) fallbackDb.purchaseRequests = [];
      const purchase = fallbackDb.purchaseRequests.find((p) => p._id.toString() === req.params.id.toString());
      if (!purchase) {
        return res.status(404).json({ success: false, message: 'Purchase request not found' });
      }
      purchase.counterOfferPrice = Number(counterPrice);
      purchase.counterOfferMessage = message || '';
      purchase.counterOfferStatus = 'pending';
      purchase.status = 'counter_offered';

      return res.status(200).json({ success: true, purchase, message: 'Counteroffer sent successfully' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Buyer responds to counteroffer (accept or reject)
// @route   PUT /api/purchases/:id/respond-counter
// @access  Private
exports.respondCounterOffer = async (req, res, next) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const userId = (req.user._id || req.user.id).toString();

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be accept or reject' });
    }

    if (mongoose.connection.readyState === 1) {
      const purchase = await PurchaseRequest.findById(req.params.id)
        .populate('seller', 'name email')
        .populate('book', 'title');

      if (!purchase) {
        return res.status(404).json({ success: false, message: 'Purchase request not found' });
      }

      if (purchase.buyer.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Only buyer can respond to counteroffer' });
      }

      if (action === 'accept') {
        purchase.offeredPrice = purchase.counterOfferPrice;
        purchase.counterOfferStatus = 'accepted';
        purchase.status = 'accepted';
        await Book.findByIdAndUpdate(purchase.book, { availability: 'in-transaction' });
      } else {
        purchase.counterOfferStatus = 'rejected';
        purchase.status = 'rejected';
      }

      await purchase.save();

      createNotification({
        recipientId: purchase.seller._id || purchase.seller,
        senderId: userId,
        type: action === 'accept' ? 'counter_accepted' : 'counter_rejected',
        title: `Counteroffer ${action === 'accept' ? 'Accepted' : 'Declined'}`,
        message: `Buyer has ${action === 'accept' ? 'accepted' : 'declined'} your counteroffer for "${purchase.book?.title}".`,
        link: '/dashboard?tab=purchases',
        recipientEmail: purchase.seller?.email
      }).catch(() => {});

      return res.status(200).json({ success: true, purchase });
    } else {
      if (!fallbackDb.purchaseRequests) fallbackDb.purchaseRequests = [];
      const purchase = fallbackDb.purchaseRequests.find((p) => p._id.toString() === req.params.id.toString());
      if (!purchase) {
        return res.status(404).json({ success: false, message: 'Purchase request not found' });
      }
      if (action === 'accept') {
        purchase.offeredPrice = purchase.counterOfferPrice;
        purchase.counterOfferStatus = 'accepted';
        purchase.status = 'accepted';
      } else {
        purchase.counterOfferStatus = 'rejected';
        purchase.status = 'rejected';
      }
      return res.status(200).json({ success: true, purchase });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Confirm handover of book between buyer and seller
// @route   PUT /api/purchases/:id/confirm-handover
// @access  Private
exports.confirmHandover = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const purchase = await PurchaseRequest.findById(req.params.id);
      if (!purchase) {
        return res.status(404).json({ success: false, message: 'Purchase request not found' });
      }

      const isBuyer = purchase.buyer.toString() === userId;
      const isSeller = purchase.seller.toString() === userId;

      if (!isBuyer && !isSeller) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      if (isBuyer) purchase.handoverConfirmedByBuyer = true;
      if (isSeller) purchase.handoverConfirmedBySeller = true;

      // When confirmed by both (or either marks completed), complete transaction
      if (purchase.handoverConfirmedByBuyer && purchase.handoverConfirmedBySeller) {
        purchase.status = 'completed';
        purchase.completedAt = Date.now();
        purchase.handoverConfirmedAt = Date.now();
        await Book.findByIdAndUpdate(purchase.book, { availability: 'sold' });
      }

      await purchase.save();
      const updated = await PurchaseRequest.findById(purchase._id)
        .populate('buyer', 'name email college phone')
        .populate('seller', 'name email college phone')
        .populate('book', 'title author images price');

      return res.status(200).json({
        success: true,
        purchase: updated,
        isCompleted: updated.status === 'completed',
        message: updated.status === 'completed'
          ? 'Handover confirmed by both parties! Transaction is now marked completed.'
          : 'Your handover confirmation recorded. Awaiting peer confirmation.'
      });
    } else {
      if (!fallbackDb.purchaseRequests) fallbackDb.purchaseRequests = [];
      const purchase = fallbackDb.purchaseRequests.find((p) => p._id.toString() === req.params.id.toString());
      if (!purchase) {
        return res.status(404).json({ success: false, message: 'Purchase request not found' });
      }
      const isBuyer = (purchase.buyer._id || purchase.buyer).toString() === userId;
      const isSeller = (purchase.seller._id || purchase.seller).toString() === userId;

      if (isBuyer) purchase.handoverConfirmedByBuyer = true;
      if (isSeller) purchase.handoverConfirmedBySeller = true;

      if (purchase.handoverConfirmedByBuyer && purchase.handoverConfirmedBySeller) {
        purchase.status = 'completed';
        purchase.completedAt = new Date();
      }

      return res.status(200).json({
        success: true,
        purchase,
        isCompleted: purchase.status === 'completed',
        message: purchase.status === 'completed'
          ? 'Handover confirmed by both parties! Transaction completed.'
          : 'Handover confirmation recorded.'
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Report dispute on transaction
// @route   POST /api/purchases/:id/dispute
// @access  Private
exports.reportDispute = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a dispute reason' });
    }

    if (mongoose.connection.readyState === 1) {
      const purchase = await PurchaseRequest.findById(req.params.id);
      if (!purchase) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }

      purchase.status = 'disputed';
      purchase.disputeReason = reason.trim();
      purchase.disputeStatus = 'open';
      await purchase.save();

      return res.status(200).json({
        success: true,
        message: 'Dispute submitted. Platform moderators have been alerted.',
        purchase
      });
    } else {
      if (!fallbackDb.purchaseRequests) fallbackDb.purchaseRequests = [];
      const purchase = fallbackDb.purchaseRequests.find((p) => p._id.toString() === req.params.id.toString());
      if (purchase) {
        purchase.status = 'disputed';
        purchase.disputeReason = reason.trim();
        purchase.disputeStatus = 'open';
      }
      return res.status(200).json({ success: true, message: 'Dispute submitted.', purchase });
    }
  } catch (err) {
    next(err);
  }
};
