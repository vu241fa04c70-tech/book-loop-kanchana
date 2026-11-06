const mongoose = require('mongoose');
const ExchangeRequest = require('../models/ExchangeRequest');
const Book = require('../models/Book');
const fallbackDb = require('../utils/fallbackDb');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Create a new exchange request
// @route   POST /api/exchanges
// @access  Private
exports.createExchangeRequest = async (req, res, next) => {
  try {
    const { bookRequestedId, bookOfferedId, message, meetingLocation } = req.body;
    const userId = (req.user._id || req.user.id).toString();

    if (!bookRequestedId || !bookOfferedId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both requested book and offered book IDs'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const bookRequested = await Book.findById(bookRequestedId);
      if (!bookRequested) {
        return res.status(404).json({ success: false, message: 'Requested book not found' });
      }

      if (bookRequested.seller.toString() === userId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot request an exchange for your own book'
        });
      }

      const bookOffered = await Book.findById(bookOfferedId);
      if (!bookOffered) {
        return res.status(404).json({ success: false, message: 'Offered book not found' });
      }

      if (bookOffered.seller.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only offer books from your own listings'
        });
      }

      const existingRequest = await ExchangeRequest.findOne({
        requestedBy: userId,
        bookRequested: bookRequestedId,
        bookOffered: bookOfferedId,
        status: { $in: ['pending', 'accepted'] }
      });

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'An active exchange request already exists for this pair of books'
        });
      }

      const exchange = await ExchangeRequest.create({
        requestedBy: userId,
        bookOffered: bookOfferedId,
        bookRequested: bookRequestedId,
        owner: bookRequested.seller,
        message: message || '',
        meetingLocation: meetingLocation || 'Campus Library / Student Union',
        status: 'pending'
      });

      const populatedExchange = await ExchangeRequest.findById(exchange._id)
        .populate('requestedBy', 'name email college phone profileImage')
        .populate('owner', 'name email college phone profileImage')
        .populate('bookOffered', 'title author images price condition category')
        .populate('bookRequested', 'title author images price condition category');

      // Create notification for book owner
      await createNotification({
        recipientId: bookRequested.seller,
        senderId: userId,
        type: 'exchange_request',
        title: 'New Book Exchange Proposal',
        message: `${req.user.name || 'A student'} offered to swap "${bookOffered.title}" for your book "${bookRequested.title}".`,
        link: '/dashboard?tab=exchanges',
        recipientEmail: populatedExchange?.owner?.email
      });

      return res.status(201).json({ success: true, exchange: populatedExchange });
    } else {
      const bookRequested = fallbackDb.books.find(
        (b) => b._id.toString() === bookRequestedId.toString()
      );
      if (!bookRequested) {
        return res.status(404).json({ success: false, message: 'Requested book not found' });
      }

      const reqSellerId = (bookRequested.seller._id || bookRequested.seller).toString();
      if (reqSellerId === userId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot request an exchange for your own book'
        });
      }

      const bookOffered = fallbackDb.books.find(
        (b) => b._id.toString() === bookOfferedId.toString()
      );
      if (!bookOffered) {
        return res.status(404).json({ success: false, message: 'Offered book not found' });
      }

      const offSellerId = (bookOffered.seller._id || bookOffered.seller).toString();
      if (offSellerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only offer books from your own listings'
        });
      }

      const existing = fallbackDb.exchangeRequests.find(
        (ex) =>
          (ex.requestedBy._id || ex.requestedBy).toString() === userId &&
          (ex.bookRequested._id || ex.bookRequested).toString() === bookRequestedId.toString() &&
          (ex.bookOffered._id || ex.bookOffered).toString() === bookOfferedId.toString() &&
          ['pending', 'accepted'].includes(ex.status)
      );

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An active exchange request already exists for this pair of books'
        });
      }

      const newExId = '66c3' + Math.random().toString(16).substring(2, 10).padEnd(20, '0');
      const requester = fallbackDb.users.find((u) => u._id.toString() === userId) || req.user;
      const owner =
        fallbackDb.users.find((u) => u._id.toString() === reqSellerId) || bookRequested.seller;

      const newExchange = {
        _id: newExId,
        requestedBy: requester,
        owner,
        bookOffered,
        bookRequested,
        message: message || '',
        meetingLocation: meetingLocation || 'Campus Library / Student Union',
        status: 'pending',
        createdAt: new Date()
      };

      fallbackDb.exchangeRequests.unshift(newExchange);

      await createNotification({
        recipientId: reqSellerId,
        senderId: userId,
        type: 'exchange_request',
        title: 'New Book Exchange Proposal',
        message: `${req.user.name || 'A student'} offered to swap "${bookOffered.title}" for your book "${bookRequested.title}".`,
        link: '/dashboard?tab=exchanges',
        recipientEmail: owner?.email
      });

      return res.status(201).json({ success: true, exchange: newExchange });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get sent exchange requests
// @route   GET /api/exchanges/sent
// @access  Private
exports.getSentExchanges = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const exchanges = await ExchangeRequest.find({ requestedBy: userId })
        .populate('owner', 'name email college phone profileImage')
        .populate('bookOffered', 'title author images price condition category availability')
        .populate('bookRequested', 'title author images price condition category availability')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: exchanges.length, exchanges });
    } else {
      const exchanges = fallbackDb.exchangeRequests.filter((ex) => {
        const reqId = (ex.requestedBy._id || ex.requestedBy).toString();
        return reqId === userId;
      });

      return res.status(200).json({ success: true, count: exchanges.length, exchanges });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get received exchange requests
// @route   GET /api/exchanges/received
// @access  Private
exports.getReceivedExchanges = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const exchanges = await ExchangeRequest.find({ owner: userId })
        .populate('requestedBy', 'name email college phone profileImage')
        .populate('bookOffered', 'title author images price condition category availability')
        .populate('bookRequested', 'title author images price condition category availability')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: exchanges.length, exchanges });
    } else {
      const exchanges = fallbackDb.exchangeRequests.filter((ex) => {
        const ownerId = (ex.owner._id || ex.owner).toString();
        return ownerId === userId;
      });

      return res.status(200).json({ success: true, count: exchanges.length, exchanges });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update exchange request status
// @route   PUT /api/exchanges/:id/status
// @access  Private
exports.updateExchangeStatus = async (req, res, next) => {
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
      const exchange = await ExchangeRequest.findById(req.params.id);
      if (!exchange) {
        return res.status(404).json({ success: false, message: 'Exchange request not found' });
      }

      const isOwner = exchange.owner.toString() === userId;
      const isRequester = exchange.requestedBy.toString() === userId;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isRequester && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this request' });
      }

      if ((status === 'accepted' || status === 'rejected') && !isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only owner can accept or reject' });
      }

      if (status === 'cancelled' && !isRequester && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only requester can cancel' });
      }

      exchange.status = status;
      if (meetingLocation) exchange.meetingLocation = meetingLocation;

      if (status === 'accepted') {
        // Prevent conflicting accepted exchanges: set both books to in-transaction
        await Book.findByIdAndUpdate(exchange.bookRequested, { availability: 'in-transaction' });
        await Book.findByIdAndUpdate(exchange.bookOffered, { availability: 'in-transaction' });
      }

      if (status === 'completed') {
        exchange.completedAt = Date.now();
        await Book.findByIdAndUpdate(exchange.bookRequested, { availability: 'exchanged' });
        await Book.findByIdAndUpdate(exchange.bookOffered, { availability: 'exchanged' });
      }

      await exchange.save();

      const updated = await ExchangeRequest.findById(exchange._id)
        .populate('requestedBy', 'name email college phone profileImage')
        .populate('owner', 'name email college phone profileImage')
        .populate('bookOffered', 'title author images price condition category')
        .populate('bookRequested', 'title author images price condition category');

      // Notify the requester of status update
      await createNotification({
        recipientId: exchange.requestedBy,
        senderId: userId,
        type: status === 'accepted' ? 'exchange_accepted' : status === 'completed' ? 'transaction_completed' : 'exchange_rejected',
        title: `Exchange Proposal ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: status === 'accepted'
          ? `Your book exchange proposal for "${updated?.bookRequested?.title || 'the book'}" was accepted! Meetup: ${exchange.meetingLocation}`
          : status === 'completed'
          ? `The exchange for "${updated?.bookRequested?.title || 'the book'}" is marked completed. You can now leave a review!`
          : `Your exchange proposal for "${updated?.bookRequested?.title || 'the book'}" was declined.`,
        link: '/dashboard?tab=exchanges',
        recipientEmail: updated?.requestedBy?.email
      });

      return res.status(200).json({ success: true, exchange: updated });
    } else {
      const exIndex = fallbackDb.exchangeRequests.findIndex(
        (ex) => ex._id.toString() === req.params.id.toString()
      );

      if (exIndex === -1) {
        return res.status(404).json({ success: false, message: 'Exchange request not found' });
      }

      const exchange = fallbackDb.exchangeRequests[exIndex];
      const isOwner = (exchange.owner._id || exchange.owner).toString() === userId;
      const isRequester = (exchange.requestedBy._id || exchange.requestedBy).toString() === userId;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isRequester && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      exchange.status = status;
      if (meetingLocation) exchange.meetingLocation = meetingLocation;
      if (status === 'completed') {
        exchange.completedAt = new Date();
        const reqBook = fallbackDb.books.find(
          (b) => b._id.toString() === (exchange.bookRequested._id || exchange.bookRequested).toString()
        );
        if (reqBook) reqBook.availability = 'exchanged';
        const offBook = fallbackDb.books.find(
          (b) => b._id.toString() === (exchange.bookOffered._id || exchange.bookOffered).toString()
        );
        if (offBook) offBook.availability = 'exchanged';
      }

      return res.status(200).json({ success: true, exchange });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Confirm handover of exchanged books
// @route   PUT /api/exchanges/:id/confirm-handover
// @access  Private
exports.confirmHandover = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const exchange = await ExchangeRequest.findById(req.params.id);
      if (!exchange) {
        return res.status(404).json({ success: false, message: 'Exchange proposal not found' });
      }

      const isRequester = exchange.requestedBy.toString() === userId;
      const isOwner = exchange.owner.toString() === userId;

      if (!isRequester && !isOwner) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      if (isRequester) exchange.handoverConfirmedByRequester = true;
      if (isOwner) exchange.handoverConfirmedByOwner = true;

      if (exchange.handoverConfirmedByRequester && exchange.handoverConfirmedByOwner) {
        exchange.status = 'completed';
        exchange.completedAt = Date.now();
        exchange.handoverConfirmedAt = Date.now();
        await Book.findByIdAndUpdate(exchange.bookRequested, { availability: 'exchanged' });
        await Book.findByIdAndUpdate(exchange.bookOffered, { availability: 'exchanged' });
      }

      await exchange.save();
      const updated = await ExchangeRequest.findById(exchange._id)
        .populate('requestedBy', 'name email college phone')
        .populate('owner', 'name email college phone')
        .populate('bookOffered', 'title author images')
        .populate('bookRequested', 'title author images');

      return res.status(200).json({
        success: true,
        exchange: updated,
        isCompleted: updated.status === 'completed',
        message: updated.status === 'completed'
          ? 'Handover confirmed by both students! Swap is completed.'
          : 'Your handover confirmation recorded. Awaiting peer confirmation.'
      });
    } else {
      if (!fallbackDb.exchangeRequests) fallbackDb.exchangeRequests = [];
      const exchange = fallbackDb.exchangeRequests.find((e) => e._id.toString() === req.params.id.toString());
      if (!exchange) {
        return res.status(404).json({ success: false, message: 'Exchange proposal not found' });
      }

      const isRequester = (exchange.requestedBy._id || exchange.requestedBy).toString() === userId;
      const isOwner = (exchange.owner._id || exchange.owner).toString() === userId;

      if (isRequester) exchange.handoverConfirmedByRequester = true;
      if (isOwner) exchange.handoverConfirmedByOwner = true;

      if (exchange.handoverConfirmedByRequester && exchange.handoverConfirmedByOwner) {
        exchange.status = 'completed';
        exchange.completedAt = new Date();
      }

      return res.status(200).json({
        success: true,
        exchange,
        isCompleted: exchange.status === 'completed',
        message: exchange.status === 'completed'
          ? 'Handover confirmed by both students! Swap is completed.'
          : 'Your handover confirmation recorded.'
      });
    }
  } catch (err) {
    next(err);
  }
};
