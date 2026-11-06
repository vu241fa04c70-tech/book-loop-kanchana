const mongoose = require('mongoose');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const fallbackDb = require('../utils/fallbackDb');
const { createNotification } = require('../utils/notificationHelper');

const getConversationKey = (userId1, userId2, bookId) => {
  const sortedUsers = [userId1.toString(), userId2.toString()].sort();
  return bookId ? `${sortedUsers[0]}_${sortedUsers[1]}_${bookId}` : `${sortedUsers[0]}_${sortedUsers[1]}`;
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, bookId } = req.body;
    const messageText = (req.body.message || req.body.content || '').trim();
    const userId = (req.user._id || req.user.id).toString();

    if (!receiverId || !messageText) {
      return res.status(400).json({
        success: false,
        message: 'Please provide receiver ID and message content'
      });
    }

    if (receiverId.toString() === userId) {
      return res.status(400).json({ success: false, message: 'You cannot send a message to yourself' });
    }

    const conversationId = getConversationKey(userId, receiverId, bookId);

    if (mongoose.connection.readyState === 1) {
      const newMessage = await Message.create({
        conversationId,
        sender: userId,
        receiver: receiverId,
        message: messageText,
        book: bookId || undefined
      });

      let conversation = await Conversation.findOne({
        participants: { $all: [userId, receiverId] },
        ...(bookId ? { book: bookId } : {})
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [userId, receiverId],
          lastMessage: messageText,
          lastSender: userId,
          book: bookId || undefined
        });
      } else {
        conversation.lastMessage = messageText;
        conversation.lastSender = userId;
        if (bookId && !conversation.book) conversation.book = bookId;
        await conversation.save();
      }

      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'name profileImage college')
        .populate('receiver', 'name profileImage college')
        .populate('book', 'title author price images');

      // Send in-app notification to message receiver
      await createNotification({
        recipientId: receiverId,
        senderId: userId,
        type: 'new_message',
        title: `Message from ${req.user.name || 'a student'}`,
        message: messageText.length > 60 ? `${messageText.substring(0, 60)}...` : messageText,
        link: `/messages?user=${userId}${bookId ? `&book=${bookId}` : ''}`,
        recipientEmail: populatedMessage?.receiver?.email
      });

      return res.status(201).json({ success: true, message: populatedMessage });
    } else {
      const sender = fallbackDb.users.find((u) => u._id.toString() === userId) || req.user;
      const receiver = fallbackDb.users.find((u) => u._id.toString() === receiverId.toString());
      const book = bookId ? fallbackDb.books.find((b) => b._id.toString() === bookId.toString()) : undefined;

      const newMsg = {
        _id: '6608' + Math.random().toString(16).substring(2, 10).padEnd(20, '0'),
        conversationId,
        sender,
        receiver: receiver || { _id: receiverId, name: 'Student' },
        message: messageText,
        book,
        read: false,
        createdAt: new Date()
      };

      fallbackDb.messages.push(newMsg);

      let conv = fallbackDb.conversations.find((c) => c.conversationId === conversationId);
      if (!conv) {
        conv = {
          _id: '6607' + Math.random().toString(16).substring(2, 10).padEnd(20, '0'),
          conversationId,
          participants: [sender, receiver || { _id: receiverId, name: 'Student' }],
          lastMessage: messageText,
          lastSender: userId,
          book,
          updatedAt: new Date()
        };
        fallbackDb.conversations.unshift(conv);
      } else {
        conv.lastMessage = messageText;
        conv.lastSender = userId;
        conv.updatedAt = new Date();
      }

      await createNotification({
        recipientId: receiverId,
        senderId: userId,
        type: 'new_message',
        title: `Message from ${req.user.name || 'a student'}`,
        message: messageText.length > 60 ? `${messageText.substring(0, 60)}...` : messageText,
        link: `/messages?user=${userId}${bookId ? `&book=${bookId}` : ''}`,
        recipientEmail: receiver?.email
      });

      return res.status(201).json({ success: true, message: newMsg });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    // Access control: Ensure user is a participant in this conversation
    if (!conversationId.includes(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this conversation'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const messages = await Message.find({ conversationId })
        .populate('sender', 'name profileImage college')
        .populate('receiver', 'name profileImage college')
        .populate('book', 'title author price images')
        .sort({ createdAt: 1 });

      await Message.updateMany(
        { conversationId, receiver: userId, read: false },
        { read: true }
      );

      return res.status(200).json({ success: true, count: messages.length, messages });
    } else {
      const messages = fallbackDb.messages.filter((m) => m.conversationId === conversationId);
      messages.forEach((m) => {
        const recId = (m.receiver._id || m.receiver).toString();
        if (recId === userId) m.read = true;
      });

      return res.status(200).json({ success: true, count: messages.length, messages });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations/all
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const conversations = await Conversation.find({ participants: userId })
        .populate('participants', 'name email college profileImage')
        .populate('book', 'title author price images')
        .sort({ updatedAt: -1 });

      const formatted = await Promise.all(
        conversations.map(async (conv) => {
          const otherUser = conv.participants.find(
            (p) => p._id.toString() !== userId
          );
          const convId = getConversationKey(
            userId,
            otherUser ? otherUser._id : userId,
            conv.book ? conv.book._id : null
          );

          const unreadCount = await Message.countDocuments({
            conversationId: convId,
            receiver: userId,
            read: false
          });

          return {
            _id: conv._id,
            conversationId: convId,
            otherUser,
            book: conv.book,
            lastMessage: conv.lastMessage,
            lastSender: conv.lastSender,
            updatedAt: conv.updatedAt,
            unreadCount
          };
        })
      );

      return res.status(200).json({ success: true, count: formatted.length, conversations: formatted });
    } else {
      const userConvs = fallbackDb.conversations.filter((c) =>
        c.participants.some((p) => (p._id || p).toString() === userId)
      );

      const formatted = userConvs.map((conv) => {
        const otherUser = conv.participants.find(
          (p) => (p._id || p).toString() !== userId
        );
        const unreadCount = fallbackDb.messages.filter(
          (m) =>
            m.conversationId === conv.conversationId &&
            (m.receiver._id || m.receiver).toString() === userId &&
            !m.read
        ).length;

        return {
          _id: conv._id,
          conversationId: conv.conversationId,
          otherUser,
          book: conv.book,
          lastMessage: conv.lastMessage,
          lastSender: conv.lastSender,
          updatedAt: conv.updatedAt,
          unreadCount
        };
      });

      return res.status(200).json({ success: true, count: formatted.length, conversations: formatted });
    }
  } catch (err) {
    next(err);
  }
};
