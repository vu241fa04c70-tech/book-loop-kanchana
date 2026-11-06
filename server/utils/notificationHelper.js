const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const fallbackDb = require('./fallbackDb');
const { sendEmail } = require('./emailService');

/**
 * Creates an in-app notification and dispatches notification email
 * @param {Object} options
 * @param {string} options.recipientId - ID of recipient user
 * @param {string} options.senderId - ID of sender user (optional)
 * @param {string} options.type - Notification category
 * @param {string} options.title - Short title
 * @param {string} options.message - Informative message
 * @param {string} options.link - In-app navigation URL
 * @param {string} options.recipientEmail - Recipient email address (optional)
 */
const createNotification = async ({
  recipientId,
  senderId,
  type,
  title,
  message,
  link = '/dashboard',
  recipientEmail
}) => {
  try {
    if (!recipientId) return null;

    if (mongoose.connection.readyState === 1) {
      const notification = await Notification.create({
        recipient: recipientId,
        sender: senderId || undefined,
        type,
        title,
        message,
        link,
        read: false
      });

      // Send email if recipient email is provided
      if (recipientEmail) {
        sendEmail({
          to: recipientEmail,
          subject: `[BookLoop] ${title}`,
          text: message
        }).catch((e) => console.warn('Email dispatch notice:', e.message));
      }

      return notification;
    } else {
      if (!fallbackDb.notifications) fallbackDb.notifications = [];
      const newNotif = {
        _id: '66a9' + Math.random().toString(16).substring(2, 10).padEnd(20, '0'),
        recipient: recipientId,
        sender: senderId,
        type,
        title,
        message,
        link,
        read: false,
        createdAt: new Date()
      };
      fallbackDb.notifications.unshift(newNotif);
      return newNotif;
    }
  } catch (err) {
    console.warn('Notification creation notice:', err.message);
    return null;
  }
};

module.exports = {
  createNotification
};
