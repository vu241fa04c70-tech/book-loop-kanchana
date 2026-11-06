const mongoose = require('mongoose');
const Report = require('../models/Report');
const Book = require('../models/Book');
const User = require('../models/User');
const fallbackDb = require('../utils/fallbackDb');

// @desc    Submit a report for an inappropriate listing or user
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res, next) => {
  try {
    const targetBook = req.body.reportedBook || req.body.reportedBookId;
    const targetUser = req.body.reportedUser || req.body.reportedUserId;
    const reportedType = req.body.reportedType || (targetBook ? 'book' : targetUser ? 'user' : 'book');
    const reason = (req.body.reason || 'inappropriate').trim();
    const description = (req.body.description || req.body.details || '').trim();
    const userId = (req.user._id || req.user.id).toString();

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Please provide a reason' });
    }

    if (mongoose.connection.readyState === 1) {
      const report = await Report.create({
        reporter: userId,
        reportedType,
        reportedBook: targetBook || undefined,
        reportedUser: targetUser || undefined,
        reason,
        description
      });

      return res.status(201).json({
        success: true,
        message: 'Report submitted. Platform moderators will review it shortly.',
        report
      });
    } else {
      const newReport = {
        _id: '66e1' + Math.random().toString(16).substring(2, 10).padEnd(20, '0'),
        reporter: req.user,
        reportedType,
        reportedBook: targetBook ? fallbackDb.books.find((b) => b._id.toString() === targetBook.toString()) : undefined,
        reportedUser: targetUser ? fallbackDb.users.find((u) => u._id.toString() === targetUser.toString()) : undefined,
        reason,
        description,
        status: 'pending',
        createdAt: new Date()
      };

      if (!fallbackDb.reports) fallbackDb.reports = [];
      fallbackDb.reports.unshift(newReport);

      return res.status(201).json({
        success: true,
        message: 'Report submitted. Platform moderators will review it shortly.',
        report: newReport
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reports (Admin only)
// @route   GET /api/reports
// @access  Private/Admin
exports.getReports = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const reports = await Report.find()
        .populate('reporter', 'name email college')
        .populate('reportedBook', 'title author seller')
        .populate('reportedUser', 'name email college')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: reports.length, reports });
    } else {
      const reports = fallbackDb.reports || [];
      return res.status(200).json({ success: true, count: reports.length, reports });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update report status (Admin only)
// @route   PUT /api/reports/:id/status
// @access  Private/Admin
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    if (!['pending', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (mongoose.connection.readyState === 1) {
      const report = await Report.findByIdAndUpdate(
        req.params.id,
        {
          status,
          resolutionNotes: resolutionNotes || '',
          resolvedBy: req.user._id || req.user.id
        },
        { new: true }
      );

      if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
      return res.status(200).json({ success: true, report });
    } else {
      if (!fallbackDb.reports) fallbackDb.reports = [];
      const report = fallbackDb.reports.find((r) => r._id.toString() === req.params.id.toString());
      if (report) {
        report.status = status;
        report.resolutionNotes = resolutionNotes || '';
      }
      return res.status(200).json({ success: true, report, message: 'Report status updated' });
    }
  } catch (err) {
    next(err);
  }
};
