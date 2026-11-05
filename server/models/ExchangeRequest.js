const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookOffered: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    bookRequested: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending'
    },
    meetingLocation: {
      type: String,
      default: 'Campus Library / Student Center'
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

exchangeRequestSchema.index({ requestedBy: 1, bookRequested: 1, status: 1 });
exchangeRequestSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
