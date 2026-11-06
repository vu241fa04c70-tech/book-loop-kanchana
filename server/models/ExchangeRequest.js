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
      enum: ['pending', 'counter_offered', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending'
    },
    counterOfferedBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    counterOfferMessage: {
      type: String,
      trim: true,
      default: ''
    },
    counterOfferStatus: {
      type: String,
      enum: ['none', 'pending', 'accepted', 'rejected'],
      default: 'none'
    },
    meetingLocation: {
      type: String,
      default: 'Campus Library / Student Center'
    },
    handoverConfirmedByRequester: {
      type: Boolean,
      default: false
    },
    handoverConfirmedByOwner: {
      type: Boolean,
      default: false
    },
    handoverConfirmedAt: {
      type: Date
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
