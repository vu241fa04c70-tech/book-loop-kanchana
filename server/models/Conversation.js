const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    lastMessage: {
      type: String,
      default: ''
    },
    lastSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
