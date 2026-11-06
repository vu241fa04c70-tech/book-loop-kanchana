const mongoose = require('mongoose');
const BookClub = require('../models/BookClub');
const fallbackDb = require('../utils/fallbackDb');

// @desc    Get all book clubs
// @route   GET /api/book-clubs
// @access  Public
exports.getBookClubs = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { isPublic: true };
      if (category && category !== 'All') {
        query.category = category;
      }
      if (search && search.trim()) {
        query.name = { $regex: search.trim(), $options: 'i' };
      }

      const clubs = await BookClub.find(query)
        .populate('creator', 'name profileImage college')
        .populate('currentBook', 'title author images')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: clubs.length, clubs });
    } else {
      if (!fallbackDb.bookClubs) fallbackDb.bookClubs = [];
      let clubs = [...fallbackDb.bookClubs];
      if (category && category !== 'All') {
        clubs = clubs.filter((c) => c.category === category);
      }
      if (search && search.trim()) {
        const s = search.toLowerCase();
        clubs = clubs.filter((c) => c.name.toLowerCase().includes(s));
      }
      return res.status(200).json({ success: true, count: clubs.length, clubs });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get book club by ID
// @route   GET /api/book-clubs/:id
// @access  Public
exports.getBookClubById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const club = await BookClub.findById(id)
        .populate('creator', 'name profileImage college location')
        .populate('members', 'name profileImage college location')
        .populate('currentBook', 'title author images price condition category');

      if (!club) {
        return res.status(404).json({ success: false, message: 'Book club not found' });
      }

      return res.status(200).json({ success: true, club });
    } else {
      if (!fallbackDb.bookClubs) fallbackDb.bookClubs = [];
      const club = fallbackDb.bookClubs.find((c) => c._id.toString() === id.toString());
      if (!club) {
        return res.status(404).json({ success: false, message: 'Book club not found' });
      }
      return res.status(200).json({ success: true, club });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new book club
// @route   POST /api/book-clubs
// @access  Private
exports.createBookClub = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      currentBook,
      currentBookTitle,
      readingGoal,
      meetingSchedule,
      coverImage
    } = req.body;
    const userId = req.user._id || req.user.id;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'Please provide a club name and description' });
    }

    if (mongoose.connection.readyState === 1) {
      const club = await BookClub.create({
        name: name.trim(),
        description: description.trim(),
        category: category || 'General',
        creator: userId,
        members: [userId],
        currentBook: currentBook || undefined,
        currentBookTitle: currentBookTitle ? currentBookTitle.trim() : '',
        readingGoal: readingGoal || '1 book per month',
        meetingSchedule: meetingSchedule || 'Bi-weekly',
        coverImage: coverImage || undefined
      });

      const populated = await BookClub.findById(club._id)
        .populate('creator', 'name profileImage college')
        .populate('currentBook', 'title author images');

      return res.status(201).json({ success: true, club: populated });
    } else {
      if (!fallbackDb.bookClubs) fallbackDb.bookClubs = [];
      const newClub = {
        _id: '66bc' + Math.random().toString(16).substring(2, 10).padEnd(20, '0'),
        name: name.trim(),
        description: description.trim(),
        category: category || 'General',
        creator: req.user,
        members: [req.user],
        currentBook: currentBook ? fallbackDb.books.find((b) => b._id.toString() === currentBook.toString()) : undefined,
        currentBookTitle: currentBookTitle || '',
        readingGoal: readingGoal || '1 book per month',
        meetingSchedule: meetingSchedule || 'Bi-weekly',
        coverImage: coverImage || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date()
      };

      fallbackDb.bookClubs.unshift(newClub);
      return res.status(201).json({ success: true, club: newClub });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle join/leave book club
// @route   POST /api/book-clubs/:id/join
// @access  Private
exports.toggleJoinClub = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const club = await BookClub.findById(id);
      if (!club) {
        return res.status(404).json({ success: false, message: 'Book club not found' });
      }

      const memberIdx = club.members.findIndex((m) => m.toString() === userId);
      let isMember = false;

      if (memberIdx > -1) {
        // Leave
        club.members.splice(memberIdx, 1);
        isMember = false;
      } else {
        // Join
        club.members.push(userId);
        isMember = true;
      }

      await club.save();
      return res.status(200).json({
        success: true,
        isMember,
        membersCount: club.members.length,
        message: isMember ? 'Successfully joined the book club!' : 'Left the book club.'
      });
    } else {
      if (!fallbackDb.bookClubs) fallbackDb.bookClubs = [];
      const club = fallbackDb.bookClubs.find((c) => c._id.toString() === id.toString());
      if (!club) {
        return res.status(404).json({ success: false, message: 'Book club not found' });
      }

      if (!club.members) club.members = [];
      const memberIdx = club.members.findIndex((m) => (m._id || m).toString() === userId);
      let isMember = false;

      if (memberIdx > -1) {
        club.members.splice(memberIdx, 1);
        isMember = false;
      } else {
        club.members.push(req.user);
        isMember = true;
      }

      return res.status(200).json({
        success: true,
        isMember,
        membersCount: club.members.length,
        message: isMember ? 'Successfully joined the book club!' : 'Left the book club.'
      });
    }
  } catch (err) {
    next(err);
  }
};
