const mongoose = require('mongoose');
const Book = require('../models/Book');
const PurchaseRequest = require('../models/PurchaseRequest');
const fallbackDb = require('../utils/fallbackDb');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all books available for donation (free)
// @route   GET /api/donations
// @access  Public
exports.getDonations = async (req, res, next) => {
  try {
    const { category, college, search, availability = 'available' } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { listingType: 'Donate' };
      if (availability !== 'all') query.availability = availability;
      if (category && category !== 'All') query.category = category;
      if (college && college !== 'All') query.college = new RegExp(college.trim(), 'i');

      if (search && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { title: searchRegex },
          { author: searchRegex },
          { subject: searchRegex },
          { description: searchRegex }
        ];
      }

      const books = await Book.find(query)
        .populate('seller', 'name email college location profileImage')
        .sort({ createdAt: -1 });

      const totalDonated = await Book.countDocuments({ listingType: 'Donate', availability: 'donated' });
      const totalAvailable = await Book.countDocuments({ listingType: 'Donate', availability: 'available' });

      const donatedBooksWithPrice = await Book.find({
        listingType: 'Donate',
        availability: { $in: ['donated', 'available'] }
      });
      const estimatedSavings = donatedBooksWithPrice.reduce(
        (sum, b) => sum + (b.originalPrice || 25),
        0
      );

      return res.status(200).json({
        success: true,
        count: books.length,
        books,
        impact: {
          totalDonated,
          totalAvailable,
          estimatedSavings: Math.round(estimatedSavings)
        }
      });
    } else {
      let books = fallbackDb.books.filter((b) => b.listingType === 'Donate');

      if (availability !== 'all') {
        books = books.filter((b) => b.availability === availability);
      }
      if (category && category !== 'All') {
        books = books.filter((b) => b.category === category);
      }
      if (college && college !== 'All') {
        books = books.filter((b) => b.college.toLowerCase().includes(college.toLowerCase()));
      }
      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        books = books.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            (b.subject && b.subject.toLowerCase().includes(q))
        );
      }

      const totalDonated = fallbackDb.books.filter(
        (b) => b.listingType === 'Donate' && b.availability === 'donated'
      ).length;
      const totalAvailable = fallbackDb.books.filter(
        (b) => b.listingType === 'Donate' && b.availability === 'available'
      ).length;

      const estimatedSavings = fallbackDb.books
        .filter((b) => b.listingType === 'Donate')
        .reduce((sum, b) => sum + (b.originalPrice || 25), 0);

      return res.status(200).json({
        success: true,
        count: books.length,
        books,
        impact: {
          totalDonated,
          totalAvailable,
          estimatedSavings: Math.round(estimatedSavings)
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Request a free donated book
// @route   POST /api/donations/request
// @access  Private
exports.requestDonation = async (req, res, next) => {
  try {
    const { bookId, message, purpose } = req.body;
    const userId = (req.user._id || req.user.id).toString();

    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Please provide book ID' });
    }

    if (mongoose.connection.readyState === 1) {
      const book = await Book.findById(bookId);
      if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
      if (book.listingType !== 'Donate') {
        return res.status(400).json({ success: false, message: 'Not listed for free donation' });
      }
      if (book.seller.toString() === userId) {
        return res.status(400).json({ success: false, message: 'Cannot request your own donated book' });
      }

      const donationNote = `[FREE DONATION REQUEST] Purpose: ${purpose || 'Academic Study'}. Message: ${message || ''}`;

      const existing = await PurchaseRequest.findOne({
        buyer: userId,
        book: bookId,
        status: { $in: ['pending', 'accepted'] }
      });

      if (existing) {
        return res.status(400).json({ success: false, message: 'You have already requested this book' });
      }

      const request = await PurchaseRequest.create({
        buyer: userId,
        seller: book.seller,
        book: bookId,
        offeredPrice: 0,
        message: donationNote,
        meetingLocation: 'Campus Library / Student Assistance Desk',
        status: 'pending'
      });

      const populated = await PurchaseRequest.findById(request._id)
        .populate('buyer', 'name email college phone profileImage')
        .populate('seller', 'name email college phone profileImage')
        .populate('book', 'title author images listingType availability');

      // Create notification for donor
      await createNotification({
        recipientId: book.seller,
        senderId: userId,
        type: 'donation_request',
        title: 'New Free Book Request',
        message: `${req.user.name || 'A student'} requested your free donated book "${book.title}".`,
        link: '/dashboard?tab=purchases',
        recipientEmail: populated?.seller?.email
      });

      return res.status(201).json({
        success: true,
        message: 'Donation request submitted successfully to the donor!',
        request: populated
      });
    } else {
      const book = fallbackDb.books.find((b) => b._id.toString() === bookId.toString());
      if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
      if (book.listingType !== 'Donate') {
        return res.status(400).json({ success: false, message: 'Not listed for free donation' });
      }

      const sellerId = (book.seller._id || book.seller).toString();
      if (sellerId === userId) {
        return res.status(400).json({ success: false, message: 'Cannot request your own donated book' });
      }

      const existing = fallbackDb.purchaseRequests.find(
        (p) =>
          (p.buyer._id || p.buyer).toString() === userId &&
          (p.book._id || p.book).toString() === bookId.toString() &&
          ['pending', 'accepted'].includes(p.status)
      );

      if (existing) {
        return res.status(400).json({ success: false, message: 'You have already requested this book' });
      }

      const newId = '66d4' + Math.random().toString(16).substring(2, 10).padEnd(20, '0');
      const buyer = fallbackDb.users.find((u) => u._id.toString() === userId) || req.user;
      const seller = fallbackDb.users.find((u) => u._id.toString() === sellerId) || book.seller;

      const newRequest = {
        _id: newId,
        buyer,
        seller,
        book,
        offeredPrice: 0,
        message: `[FREE DONATION REQUEST] Purpose: ${purpose || 'Academic Study'}. Message: ${message || ''}`,
        meetingLocation: 'Campus Library / Student Assistance Desk',
        status: 'pending',
        createdAt: new Date()
      };

      fallbackDb.purchaseRequests.unshift(newRequest);

      return res.status(201).json({
        success: true,
        message: 'Donation request submitted successfully to the donor!',
        request: newRequest
      });
    }
  } catch (err) {
    next(err);
  }
};
