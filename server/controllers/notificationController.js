const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const fallbackDb = require('../utils/fallbackDb');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const notifications = await Notification.find({ recipient: userId })
        .populate('sender', 'name profileImage college')
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        read: false
      });

      return res.status(200).json({
        success: true,
        count: notifications.length,
        unreadCount,
        notifications
      });
    } else {
      if (!fallbackDb.notifications) fallbackDb.notifications = [];
      const userNotifs = fallbackDb.notifications.filter(
        (n) => (n.recipient._id || n.recipient).toString() === userId
      );
      const unreadCount = userNotifs.filter((n) => !n.read).length;

      return res.status(200).json({
        success: true,
        count: userNotifs.length,
        unreadCount,
        notifications: userNotifs
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: userId },
        { read: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      return res.status(200).json({ success: true, notification });
    } else {
      const notif = (fallbackDb.notifications || []).find(
        (n) => n._id.toString() === req.params.id.toString()
      );
      if (notif) notif.read = true;
      return res.status(200).json({ success: true, notification: notif });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      await Notification.updateMany({ recipient: userId, read: false }, { read: true });
      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } else {
      (fallbackDb.notifications || []).forEach((n) => {
        if ((n.recipient._id || n.recipient).toString() === userId) {
          n.read = true;
        }
      });
      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        recipient: userId
      });

      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      return res.status(200).json({ success: true, message: 'Notification deleted' });
    } else {
      if (fallbackDb.notifications) {
        const idx = fallbackDb.notifications.findIndex(
          (n) => n._id.toString() === req.params.id.toString()
        );
        if (idx !== -1) fallbackDb.notifications.splice(idx, 1);
      }
      return res.status(200).json({ success: true, message: 'Notification deleted' });
    }
  } catch (err) {
    next(err);
  }
};
